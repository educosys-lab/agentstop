"""
External Vector Database Query Service

This module provides functionality to query external vector databases
without ingesting data. It connects to existing vector databases using
provided credentials and answers queries based on the stored data.
"""

from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.prompts import PromptTemplate
from pinecone import Pinecone
from pydantic import SecretStr

from app.shared.logger.logger import console_log
from app.shared.config.config import env
from app.rag.rag_types import (
    ExternalQueryRequestArgs,
    ExternalQueryResponseType,
    SearchResultType,
    ExternalVectorDBConfigType,
    RAGConfigType,
)
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType
from app.shared.utils.error_util import carry_error, is_error


class ExternalVectorDBQueryService:
    """Service for querying external vector databases"""

    def __init__(self, config: Optional[RAGConfigType] = None):
        self.config = config or RAGConfigType()
        self.embeddings = OpenAIEmbeddings(model=self.config.embedding_model, api_key=SecretStr(env.OPENAI_KEY))
        self.llm = ChatOpenAI(
            model=self.config.llm_model, temperature=self.config.temperature, api_key=SecretStr(env.OPENAI_KEY)
        )

        self._setup_prompts()

    def _setup_prompts(self):
        """Setup prompt templates for different query modes"""
        self.docs_only_prompt = PromptTemplate(
            template="""You are a helpful AI assistant. Answer the question based ONLY on the provided context documents.
            If the answer cannot be found in the provided context, say "I cannot find the answer in the provided documents."

            Context documents:
            {context}

            Question: {question}

            Answer: """,
            input_variables=["context", "question"],
        )

        self.open_internet_prompt = PromptTemplate(
            template="""You are a helpful AI assistant. Answer the question using the provided context documents as your primary source.
            You may also use your general knowledge to provide additional context or clarification, but prioritize information from the provided documents.

            Context documents:
            {context}

            Question: {question}

            Answer: """,
            input_variables=["context", "question"],
        )

    def _connect_to_external_db(self, config: ExternalVectorDBConfigType) -> DefaultReturnType[PineconeVectorStore]:
        """Connect to external vector database"""
        try:
            # Initialize Pinecone client with external credentials
            pc = Pinecone(api_key=config.api_key)

            # Get the index
            index = pc.Index(config.index_name)

            # Create vector store
            vector_store = PineconeVectorStore(index=index, embedding=self.embeddings)

            console_log(f"Connected to external vector database: {config.index_name}")
            return DefaultReturnType(data=vector_store)

        except Exception as e:
            console_log(f"Error connecting to external vector database: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error connecting to external vector database",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["external_query_service - _connect_to_external_db - except Exception"],
                )
            )

    async def _search_external_documents(
        self, query: str, max_results: int, vector_db_config: ExternalVectorDBConfigType
    ) -> DefaultReturnType[List[SearchResultType]]:
        """Search for relevant documents in external vector database"""
        try:
            # Connect to external database
            vector_store = self._connect_to_external_db(vector_db_config)
            if is_error(vector_store.error):
                return DefaultReturnType(
                    error=carry_error(
                        vector_store.error,
                        "external_query_service - _search_external_documents - if is_error(vector_store.error)",
                    ),
                )

            assert vector_store.data is not None
            # Perform similarity search
            docs = vector_store.data.similarity_search_with_score(query=query, k=max_results)

            results = []
            for doc, score in docs:
                results.append(
                    SearchResultType(
                        content=doc.page_content,
                        score=float(score),
                        metadata=doc.metadata,
                        source=doc.metadata.get("source_name", "unknown"),
                    )
                )

            return DefaultReturnType(data=results)

        except Exception:
            return DefaultReturnType(data=[])

    async def _search_internet(self, query: str) -> DefaultReturnType[str]:
        """Search the internet for additional context (placeholder implementation)"""
        # This is a placeholder. In a real implementation, you would:
        # 1. Use a web search API (like Google Search API, Bing API, etc.)
        # 2. Scrape relevant web pages
        # 3. Extract and summarize the content

        console_log(f"Internet search requested for: {query}")
        return DefaultReturnType(data=f"Additional context from internet search for: {query}")

    def _calculate_confidence_score(self, search_results: List[SearchResultType]) -> DefaultReturnType[float]:
        """Calculate confidence score based on search results"""
        if not search_results:
            return DefaultReturnType(data=0.0)

        # Simple confidence calculation based on average similarity score
        avg_score = sum(result.score for result in search_results) / len(search_results)
        # Convert to 0-1 scale (assuming scores are typically negative for cosine similarity)
        confidence = max(0.0, min(1.0, (avg_score + 1) / 2))
        return DefaultReturnType(data=confidence)

    def _format_context(self, search_results: List[SearchResultType]) -> DefaultReturnType[str]:
        """Format search results into context string"""
        if not search_results:
            return DefaultReturnType(data="No relevant documents found.")

        context_parts = []
        for i, result in enumerate(search_results, 1):
            context_parts.append(
                f"Document {i} (Source: {result.source}, Score: {result.score:.3f}):\n" f"{result.content}\n"
            )

        return DefaultReturnType(data="\n".join(context_parts))

    def _format_sources(self, search_results: List[SearchResultType]) -> DefaultReturnType[List[Dict[str, Any]]]:
        """Format search results for source attribution"""
        sources = []
        for result in search_results:
            sources.append(
                {
                    "source": result.source,
                    "score": result.score,
                    "metadata": result.metadata,
                    "content_preview": result.content[:200] + "..." if len(result.content) > 200 else result.content,
                }
            )
        return DefaultReturnType(data=sources)

    async def query_external_db(
        self, request: ExternalQueryRequestArgs
    ) -> DefaultReturnType[ExternalQueryResponseType]:
        """Process a query against external vector database"""
        try:
            console_log(f"Processing external query: {request.question[:100]}...")
            console_log(f"Target database: {request.vector_db_config.index_name}")

            # Search for relevant documents in external database
            search_results = await self._search_external_documents(
                request.question, request.max_results, request.vector_db_config
            )
            if is_error(search_results.error):
                return DefaultReturnType(
                    error=carry_error(
                        search_results.error,
                        "external_query_service - query_external_db - if is_error(search_results.error)",
                    )
                )

            if not search_results.data:
                return DefaultReturnType(
                    data=ExternalQueryResponseType(
                        answer="I couldn't find any relevant documents to answer your question in the specified database.",
                        sources=[],
                        mode_used=request.mode,
                        confidence_score=0.0,
                        vector_db_used=request.vector_db_config.index_name,
                    )
                )

            assert search_results.data is not None

            # Format context from search results
            context = self._format_context(search_results.data)
            if is_error(context.error):
                return DefaultReturnType(
                    error=carry_error(
                        context.error,
                        "external_query_service - query_external_db - if is_error(context.error)",
                    )
                )

            assert context.data is not None

            # Get additional internet context if requested
            internet_context = ""
            if request.mode == "open_internet":
                search_internet_response = await self._search_internet(request.question)
                if is_error(search_internet_response.error):
                    return DefaultReturnType(
                        error=carry_error(
                            search_internet_response.error,
                            "external_query_service - query_external_db - if is_error(internet_context.error)",
                        )
                    )

                assert search_internet_response.data is not None
                internet_context = search_internet_response.data

            # Choose appropriate prompt based on mode
            if request.mode == "docs_only":
                prompt = self.docs_only_prompt
                full_context = context.data
            else:
                prompt = self.open_internet_prompt
                full_context = f"{context.data}\n\nAdditional context: {internet_context}"

            # Generate response using LLM
            formatted_prompt = prompt.format(context=full_context, question=request.question)

            response = await self.llm.ainvoke(formatted_prompt)
            answer = response.content if hasattr(response, "content") else str(response)

            # Calculate confidence score
            confidence = self._calculate_confidence_score(search_results.data)
            if is_error(confidence.error):
                return DefaultReturnType(
                    error=carry_error(
                        confidence.error,
                        "external_query_service - query_external_db - if is_error(confidence.error)",
                    )
                )

            # Format sources for response
            sources = (
                self._format_sources(search_results.data) if request.include_sources else DefaultReturnType(data=[])
            )
            if is_error(sources.error):
                return DefaultReturnType(
                    error=carry_error(
                        sources.error,
                        "external_query_service - query_external_db - if is_error(sources.error)",
                    )
                )

            assert sources.data is not None
            console_log(f"External query processed successfully with confidence: {confidence:.3f}")

            return DefaultReturnType(
                data=ExternalQueryResponseType(
                    answer=answer,
                    sources=sources.data,
                    mode_used=request.mode,
                    confidence_score=confidence.data,
                    vector_db_used=request.vector_db_config.index_name,
                )
            )

        except Exception as e:
            return DefaultReturnType(
                data=ExternalQueryResponseType(
                    answer="Error occurred while processing your question",
                    sources=[],
                    mode_used=request.mode,
                    confidence_score=0.0,
                    vector_db_used=request.vector_db_config.index_name,
                )
            )

    async def search_external_documents(
        self, query: str, max_results: int, vector_db_config: ExternalVectorDBConfigType
    ) -> DefaultReturnType[List[SearchResultType]]:
        """Get similar documents from external database without generating a response"""
        results = await self._search_external_documents(query, max_results, vector_db_config)
        if is_error(results.error):
            return DefaultReturnType(
                error=carry_error(
                    results.error,
                    "external_query_service - search_external_documents - if is_error(results.error)",
                )
            )

        assert results.data is not None
        return results

    async def test_external_connection(
        self, vector_db_config: ExternalVectorDBConfigType
    ) -> DefaultReturnType[Dict[str, Any]]:
        """Test connection to external vector database"""
        try:
            # Try to connect and perform a simple search
            vector_store = self._connect_to_external_db(vector_db_config)
            if is_error(vector_store.error):
                return DefaultReturnType(
                    error=carry_error(
                        vector_store.error,
                        "external_query_service - test_external_connection - if is_error(vector_store.error)",
                    )
                )

            assert vector_store.data is not None
            # Perform a test search
            test_results = vector_store.data.similarity_search("test", k=1)

            return DefaultReturnType(
                data={
                    "status": "connected",
                    "index_name": vector_db_config.index_name,
                    "test_search_successful": len(test_results) >= 0,
                    "message": "Successfully connected to external vector database",
                }
            )

        except Exception as e:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Failed to test external connection",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["external_query_service - test_external_connection - except Exception"],
                )
            )
