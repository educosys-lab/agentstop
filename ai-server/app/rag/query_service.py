import re
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.prompts import PromptTemplate
from pinecone import Pinecone
from pydantic import SecretStr

# from sklearn.metrics.pairwise import cosine_similarity

from app.shared.config.config import env
from app.shared.logger.logger import console_log
from app.rag.rag_types import QueryRequestArgs, QueryResponseType, SearchResultType, QueryModeType, RAGConfigType
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType
from app.shared.utils.error_util import is_error, carry_error
from app.rag.ingestion_service import DimensionReducedEmbeddings


class RAGQueryService:
    """Service for querying the RAG system and generating responses"""

    def __init__(self, config: Optional[RAGConfigType] = None):
        self.config = config or RAGConfigType()
        console_log(f"Initializing RAGQueryService with embedding model: {self.config.embedding_model}")
        # Use custom dimension-reduced embeddings to convert 1536 -> 1024 dimensions
        self.embeddings = DimensionReducedEmbeddings(
            model=self.config.embedding_model, api_key=SecretStr(env.OPENAI_KEY)
        )
        self.llm = ChatOpenAI(
            model=self.config.llm_model, temperature=self.config.temperature, api_key=SecretStr(env.OPENAI_KEY)
        )

        is_pinecone_initialized = self._initialize_pinecone()
        if is_error(is_pinecone_initialized.error):
            return DefaultReturnType(
                error=carry_error(
                    is_pinecone_initialized.error,
                    "query_service - __init__ - if isError(is_pinecone_initialized.error)",
                )
            )

        self._setup_prompts()

    def _clean_text_content(self, content: str) -> str:
        """Comprehensively clean text content by removing unwanted elements"""
        if not content:
            return content

        # Remove HTML comments and tags
        content = re.sub(r"<!--.*?-->|<[^>]+>", "", content, flags=re.DOTALL)

        # Remove markdown inline links: [text](url-with-(parens))
        content = re.sub(r"\[([^\]]+)\]\((?:[^)(]+|\([^)(]*\))*\)", r"\1", content)

        # Remove markdown reference links: [text][ref] or [text][]
        content = re.sub(r"\[([^\]]+)\]\s*\[[^\]]*\]", r"\1", content)

        # Remove various reference indicators patterns:
        # Pattern 1: [[a]], [[b]], [[16]], [[254]], etc.
        content = re.sub(r"\[\[[a-zA-Z0-9]+\]\]", "", content)

        # Pattern 2: [\[a\]], [\[b\]], [\[16\]], etc. (escaped brackets)
        content = re.sub(r"\[\\?\[[a-zA-Z0-9]+\\?\]\]", "", content)

        # Pattern 3: [a], [b], [16], [254], etc. (single brackets)
        content = re.sub(r"\[[a-zA-Z0-9]+\]", "", content)

        # Pattern 4: Handle any remaining escaped bracket combinations
        content = re.sub(r"\\\[([a-zA-Z0-9]+)\\\]", "", content)
        content = re.sub(r"\\\[[a-zA-Z0-9]+\]", "", content)
        content = re.sub(r"\[[a-zA-Z0-9]+\\\]", "", content)

        # Remove empty brackets []
        content = re.sub(r"\[\]", "", content)

        # Remove standalone URLs (after link removal)
        content = re.sub(r"https?://\S+", "", content)

        # Remove underscore symbols used for italics (note: this removes ALL underscores)
        content = content.replace("_", "")

        # Whitespace cleanup
        content = re.sub(r"[ \t]+", " ", content)  # collapse spaces/tabs
        content = re.sub(r"\n[ \t]*\n[ \t]*(?:\n[ \t]*)+", "\n\n", content)  # 3+ newlines -> 2
        content = content.strip()

        return content

    def _initialize_pinecone(self):
        """Initialize Pinecone client and vector store"""
        try:
            self.pc = Pinecone(api_key=env.PINECONE_KEY)
            self.default_index = self.pc.Index(env.PINECONE_INDEX_NAME)
            self.default_vector_store = PineconeVectorStore(index=self.default_index, embedding=self.embeddings)

            console_log("Pinecone query service initialized successfully")
            return DefaultReturnType(data=None)
        except Exception as e:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Failed to initialize Pinecone query service!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["query_service - _initialize_pinecone - except Exception"],
                )
            )

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

    async def _search_documents(
        self,
        query: str,
        max_results: int,
        vector_db_name: Optional[str] = None,
        source_name: Optional[List[str]] = None,
    ) -> DefaultReturnType[List[SearchResultType]]:
        """Search for relevant documents in the vector database"""
        try:
            # Select vector store based on specified database name
            if vector_db_name and vector_db_name != env.PINECONE_INDEX_NAME:
                # Use specified index
                index = self.pc.Index(vector_db_name)
                vector_store = PineconeVectorStore(index=index, embedding=self.embeddings)
                console_log(f"Searching in external vector database: {vector_db_name}")
            else:
                # Use default vector store
                vector_store = self.default_vector_store
                console_log(f"Searching in default vector database: {env.PINECONE_INDEX_NAME}")

            # Get more results initially if MMR is enabled to have a better selection pool
            search_k = max_results * 2 if self.config.use_mmr else max_results

            # Perform similarity search with optional source filtering
            if source_name and len(source_name) > 0:
                # Use Pinecone's filter functionality to search only within the specified sources
                if len(source_name) == 1:
                    # Single source filter
                    docs = vector_store.similarity_search_with_score(
                        query=query, k=search_k, filter={"source_name": source_name[0]}
                    )
                    console_log(f"Searching with single source filter: {source_name[0]}")
                else:
                    # Multiple sources filter using $in operator
                    docs = vector_store.similarity_search_with_score(
                        query=query, k=search_k, filter={"source_name": {"$in": source_name}}
                    )
                    console_log(f"Searching with multiple source filters: {source_name}")
            else:
                # Search all sources
                docs = vector_store.similarity_search_with_score(query=query, k=search_k)
                console_log("Searching all sources")

            # Apply MMR if enabled
            if self.config.use_mmr and len(docs) > max_results:
                console_log(f"Applying MMR with lambda={self.config.mmr_lambda}")
                # Get query embedding
                query_embedding = self.embeddings.embed_query(query)
                # Apply MMR to rerank and select diverse results
                docs = self._apply_mmr(query_embedding, docs, max_results, self.config.mmr_lambda)

            results = []
            for doc, score in docs[:max_results]:  # Ensure we only return max_results
                # Clean the content before adding to results
                cleaned_content = self._clean_text_content(doc.page_content)
                results.append(
                    SearchResultType(
                        content=cleaned_content,
                        score=float(score),
                        metadata=doc.metadata,
                        source=doc.metadata.get("source_name", "unknown"),
                    )
                )

            return DefaultReturnType(data=results)

        except Exception as e:
            console_log(f"Error searching documents: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error searching documents!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["query_service - _search_documents - except Exception"],
                )
            )

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
            if self.config.include_metadata_in_context:
                # Include source and score information
                context_parts.append(
                    f"Document {i} (Source: {result.source}, Score: {result.score:.3f}):\n" f"{result.content}\n"
                )
            else:
                # Only include the content without metadata or source information
                context_parts.append(f"{result.content}\n")

        return DefaultReturnType(data="\n".join(context_parts))

    def _format_sources(self, search_results: List[SearchResultType]) -> DefaultReturnType[List[Dict[str, Any]]]:
        """Format search results for source attribution"""
        sources = []
        for result in search_results:
            source_data = {
                "source": result.source,
                "score": result.score,
            }

            if self.config.include_metadata_in_sources:
                source_data.update(
                    {
                        "metadata": result.metadata,
                        "content_preview": (
                            result.content[:200] + "..." if len(result.content) > 200 else result.content
                        ),
                    }
                )

            sources.append(source_data)
        return DefaultReturnType(data=sources)

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot_product / (norm1 * norm2)

    def _apply_mmr(
        self, query_embedding: List[float], docs_with_scores: List[Tuple[Any, float]], k: int, lambda_mult: float = 0.5
    ) -> List[Tuple[Any, float]]:
        """
        Apply Maximum Marginal Relevance (MMR) to rerank documents for diversity.

        Args:
            query_embedding: The embedding of the query
            docs_with_scores: List of (document, score) tuples from initial search
            k: Number of documents to return
            lambda_mult: Balance between relevance and diversity (0=max diversity, 1=max relevance)

        Returns:
            Reranked list of (document, score) tuples
        """
        if len(docs_with_scores) <= k:
            return docs_with_scores

        # Extract embeddings from documents
        doc_embeddings = []
        for doc, _ in docs_with_scores:
            # Get embedding from document metadata if available
            if hasattr(doc, "metadata") and "embedding" in doc.metadata:
                doc_embeddings.append(doc.metadata["embedding"])
            else:
                # If embedding not in metadata, we'll need to generate it
                # For now, we'll use the content to generate embedding
                embedding = self.embeddings.embed_query(doc.page_content)
                doc_embeddings.append(embedding)

        # Convert to numpy arrays
        query_embedding_np = np.array(query_embedding)
        doc_embeddings_np = np.array(doc_embeddings)

        # Calculate similarity between query and all documents
        query_sim = np.array([self._cosine_similarity(query_embedding_np, doc_emb) for doc_emb in doc_embeddings_np])

        # MMR algorithm
        selected_indices = []
        selected_docs = []

        # Select first document (highest relevance to query)
        first_idx = np.argmax(query_sim)
        selected_indices.append(first_idx)
        selected_docs.append(docs_with_scores[first_idx])

        # Select remaining documents
        while len(selected_indices) < k and len(selected_indices) < len(docs_with_scores):
            remaining_indices = [i for i in range(len(docs_with_scores)) if i not in selected_indices]

            if not remaining_indices:
                break

            # Calculate MMR score for each remaining document
            mmr_scores = []
            for idx in remaining_indices:
                # Relevance to query
                relevance = query_sim[idx]

                # Maximum similarity to already selected documents
                if selected_indices:
                    selected_embeddings = doc_embeddings_np[selected_indices]
                    doc_embedding = doc_embeddings_np[idx]
                    similarities = np.array(
                        [self._cosine_similarity(doc_embedding, sel_emb) for sel_emb in selected_embeddings]
                    )
                    max_similarity = np.max(similarities)
                else:
                    max_similarity = 0

                # MMR score
                mmr_score = lambda_mult * relevance - (1 - lambda_mult) * max_similarity
                mmr_scores.append(mmr_score)

            # Select document with highest MMR score
            next_idx = remaining_indices[np.argmax(mmr_scores)]
            selected_indices.append(next_idx)
            selected_docs.append(docs_with_scores[next_idx])

        return selected_docs

    async def query(self, request: QueryRequestArgs) -> DefaultReturnType[QueryResponseType]:
        """Process a RAG query and return response"""
        try:
            console_log(f"Processing query: {request.question[:100]}...")
            console_log(f"Processing mode: {request.mode}")

            # Search for relevant documents
            search_results = await self._search_documents(
                request.question, request.max_results, request.vector_db_name, request.source_name
            )
            print(f"Search results: {search_results}")

            if is_error(search_results.error):
                return DefaultReturnType(
                    error=carry_error(
                        search_results.error,
                        "query_service - query - if isError(search_results.error)",
                    )
                )

            if not search_results.data:
                return DefaultReturnType(
                    data=QueryResponseType(
                        answer="I couldn't find any relevant documents to answer your question.",
                        sources=[],
                        mode_used=request.mode,
                        confidence_score=0.0,
                    )
                )

            assert search_results.data is not None

            # Format context from search results
            context = self._format_context(search_results.data)
            if is_error(context.error):
                return DefaultReturnType(
                    error=carry_error(
                        context.error,
                        "query_service - query - if isError(context.error)",
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
                            "query_service - query - if isError(search_internet_response.error)",
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
            print(f"Formatted prompt: {formatted_prompt}")

            response = await self.llm.ainvoke(formatted_prompt)
            answer = response.content if hasattr(response, "content") else str(response)

            # Calculate confidence score
            confidence = self._calculate_confidence_score(search_results.data)
            if is_error(confidence.error):
                return DefaultReturnType(
                    error=carry_error(
                        confidence.error,
                        "query_service - query - if isError(confidence.error)",
                    )
                )

            assert confidence.data is not None

            # Format sources for response
            sources = (
                self._format_sources(search_results.data)
                if request.include_sources
                else DefaultReturnType(
                    data=[],
                    error=None,
                )
            )

            if is_error(sources.error):
                return DefaultReturnType(
                    error=carry_error(
                        sources.error,
                        "query_service - query - if isError(sources.error)",
                    )
                )

            assert sources.data is not None
            console_log(f"Query processed successfully with confidence: {confidence.data:.3f}")

            return DefaultReturnType(
                data=QueryResponseType(
                    answer=answer, sources=sources.data, mode_used=request.mode, confidence_score=confidence.data
                )
            )

        except Exception as e:
            console_log(f"Error processing query: {str(e)}")
            return DefaultReturnType(
                data=QueryResponseType(
                    answer=f"I encountered an error while processing your question: {str(e)}",
                    sources=[],
                    mode_used=request.mode,
                    confidence_score=0.0,
                )
            )

    async def get_similar_documents(
        self,
        query: str,
        max_results: int = 5,
        vector_db_name: Optional[str] = None,
        source_name: Optional[List[str]] = None,
    ) -> DefaultReturnType[List[SearchResultType]]:
        """Get similar documents without generating a response"""
        search_results = await self._search_documents(query, max_results, vector_db_name, source_name)
        if is_error(search_results.error):
            return DefaultReturnType(
                error=carry_error(
                    search_results.error,
                    "query_service - get_similar_documents - if isError(search_results.error)",
                )
            )

        assert search_results.data is not None
        return DefaultReturnType(data=search_results.data)

    async def health_check(self) -> DefaultReturnType[Dict[str, Any]]:
        """Check the health of the query service"""
        try:
            # Test vector store connection
            test_results = await self._search_documents("test", 1)
            if is_error(test_results.error):
                return DefaultReturnType(
                    error=carry_error(
                        test_results.error, "query_service - health_check - if isError(test_results.error)"
                    )
                )

            assert test_results.data is not None

            # Test LLM connection
            test_response = await self.llm.ainvoke("Hello, this is a test.")
            return DefaultReturnType(data={"status": "healthy", "error": test_response.content})

        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Failed to check health of query service!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["query_service - health_check - except Exception"],
                )
            )
