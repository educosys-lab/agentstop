import uuid
import tiktoken
import json
import re
import os
import tempfile
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter, TokenTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from pydantic import SecretStr
from firecrawl import FirecrawlApp

# Import the new lightweight document processor
from app.rag.document_processor import DocumentProcessor

from app.shared.config.config import env
from app.shared.logger.logger import console_log
from app.rag.rag_types import (
    IngestRequestArgs,
    FileIngestRequestArgs,
    IngestResponseType,
    DocumentChunkType,
    DataSourceType,
    RAGConfigType,
)
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType
from app.shared.utils.error_util import carry_error, is_error


class DimensionReducedEmbeddings(OpenAIEmbeddings):
    """Custom embeddings class that reduces dimensions from 1536 to 1024"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._source_dimension = 1536  # text-embedding-3-small dimension
        self._target_dimension = 1024  # Pinecone index dimension

    def _reduce_dimensions(self, embeddings: List[List[float]]) -> List[List[float]]:
        """Reduce embedding dimensions from 1536 to 1024 by taking the first 1024 dimensions"""
        reduced_embeddings = []
        for embedding in embeddings:
            if len(embedding) == self._source_dimension:
                # Take the first 1024 dimensions
                reduced_embedding = embedding[: self._target_dimension]
                reduced_embeddings.append(reduced_embedding)
            else:
                # If already 1024 dimensions, use as is
                reduced_embeddings.append(embedding)

        if embeddings and len(embeddings[0]) == self._source_dimension:
            console_log(
                f"Reduced {len(embeddings)} embeddings from {self._source_dimension} to {self._target_dimension} dimensions"
            )

        return reduced_embeddings

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed documents and reduce dimensions"""
        embeddings = super().embed_documents(texts)
        return self._reduce_dimensions(embeddings)

    def embed_query(self, text: str) -> List[float]:
        """Embed query and reduce dimensions"""
        embedding = super().embed_query(text)
        if len(embedding) == self._source_dimension:
            return embedding[: self._target_dimension]
        return embedding


class RAGIngestionService:
    """Service for ingesting and storing documents in Pinecone vector database"""

    # Initialize the service
    def __init__(self, config: Optional[RAGConfigType] = None):
        self.config = config or RAGConfigType()
        console_log(f"Initializing RAGIngestionService with embedding model: {self.config.embedding_model}")
        # Use custom dimension-reduced embeddings to convert 1536 -> 1024 dimensions
        self.embeddings = DimensionReducedEmbeddings(
            model=self.config.embedding_model, api_key=SecretStr(env.OPENAI_KEY)
        )

        # Initialize Firecrawl
        self.firecrawl = FirecrawlApp(api_key=env.FIRECRAWL_API_KEY)

        # Initialize lightweight document processor
        self.doc_processor = DocumentProcessor()
        console_log("Initialized lightweight document processor")

        is_pinecone_initialized = self._initialize_pinecone()
        if is_error(is_pinecone_initialized.error):
            return DefaultReturnType(
                error=carry_error(
                    is_pinecone_initialized.error,
                    "ingestion_service - __init__ - if isError(is_pinecone_initialized.error)",
                )
            )

        # Use token-based text splitter with tiktoken for accurate token counting
        # TokenTextSplitter may not recognize gpt-4o-mini, so we'll use gpt-4 as fallback
        try:
            self.text_splitter = TokenTextSplitter(
                chunk_size=self.config.chunk_size,
                chunk_overlap=self.config.chunk_overlap,
                model_name="gpt-4",  # Using gpt-4 tokenizer which is compatible with gpt-4o-mini
                allowed_special="all",
            )
        except Exception as e:
            console_log(f"Warning: TokenTextSplitter initialization issue: {e}")
            # Fallback to character-based splitter if token splitter fails
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config.chunk_size * 4,  # Approximate 4 chars per token
                chunk_overlap=self.config.chunk_overlap * 4,
                length_function=len,
                separators=["\n\n", "\n", " ", ""],
            )

    def _initialize_pinecone(self) -> DefaultReturnType[None]:
        """Initialize Pinecone client and index"""
        try:
            self.pc = Pinecone(api_key=env.PINECONE_KEY)

            # Check if index exists, create if not
            if env.PINECONE_INDEX_NAME not in self.pc.list_indexes().names():
                console_log(f"Creating Pinecone index: {env.PINECONE_INDEX_NAME}")
                self.pc.create_index(
                    name=env.PINECONE_INDEX_NAME,
                    dimension=1024,  # Reduced from 1536 (text-embedding-3-small) to 1024
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region=env.PINECONE_REGION),
                )
            else:
                console_log(f"Using existing Pinecone index: {env.PINECONE_INDEX_NAME}")
                # Check the existing index dimensions
                index_stats = self.pc.describe_index(env.PINECONE_INDEX_NAME)
                console_log(f"Existing index dimension: {index_stats.dimension}")

            self.index = self.pc.Index(env.PINECONE_INDEX_NAME)
            self.vector_store = PineconeVectorStore(index=self.index, embedding=self.embeddings)
            console_log("Pinecone initialized successfully")

            return DefaultReturnType(data=None)

        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Failed to initialize Pinecone!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["ingestion_service - _initialize_pinecone - except Exception"],
                )
            )

    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken"""
        # gpt-4o-mini uses the same tokenizer as gpt-4
        try:
            encoding = tiktoken.encoding_for_model("gpt-4o-mini")
        except KeyError:
            # Fallback to gpt-4 tokenizer if gpt-4o-mini is not recognized
            encoding = tiktoken.encoding_for_model("gpt-4")
        return len(encoding.encode(text))

    def _clean_text_content(self, content: str) -> str:
        """Comprehensively clean text content by removing unwanted elements"""
        if not content:
            return content

        # Remove HTML tags (including self-closing tags like <br>, <hr>, etc.)
        content = re.sub(r"<[^>]+>", "", content)

        # Remove underscore symbols used for italic text
        content = content.replace("_", "")

        # Remove markdown links [text](url) -> text (do this first to avoid conflicts)
        content = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", content)

        # Remove markdown reference links [text][ref] -> text
        content = re.sub(r"\[([^\]]+)\]\[[^\]]*\]", r"\1", content)

        # Remove standalone URLs (http/https) - do this after markdown link removal
        content = re.sub(r"https?://[^\s]+", "", content)

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

        # Clean up excessive whitespace but preserve paragraph breaks
        # First, normalize multiple spaces to single spaces
        content = re.sub(r"[ \t]+", " ", content)
        # Then, normalize multiple newlines to double newlines (paragraph breaks)
        content = re.sub(r"\n\s*\n\s*\n+", "\n\n", content)
        content = content.strip()

        return content

    def _remove_links_from_markdown(self, content: str) -> str:
        """Remove links from markdown content while preserving the link text"""
        # Remove markdown links [text](url) -> text
        content = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", content)

        # Remove standalone URLs (http/https)
        content = re.sub(r"https?://[^\s]+", "", content)

        # Remove markdown reference links [text][ref] -> text
        content = re.sub(r"\[([^\]]+)\]\[[^\]]*\]", r"\1", content)

        # Clean up extra whitespace
        content = re.sub(r"\n\s*\n", "\n\n", content)
        content = content.strip()

        return content

    # Create chunks
    def _create_chunks(self, text: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Split text into chunks and create DocumentChunk objects"""
        chunks = self.text_splitter.split_text(text)
        document_chunks = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{source_name}_{uuid.uuid4().hex[:8]}_{i}"
            document_chunks.append(
                DocumentChunkType(
                    id=chunk_id,
                    content=chunk,
                    metadata={
                        **metadata,
                        "source_name": source_name,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "token_count": self._count_tokens(chunk),
                    },
                    source=source_name,
                    chunk_index=i,
                    total_chunks=len(chunks),
                )
            )

        return document_chunks

    # Process data based on source type
    def _process_text_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process plain text data"""
        return self._create_chunks(data, source_name, metadata)

    def _extract_text_from_file(self, file_data: bytes, file_type: str, source_name: str) -> str:
        """Extract text from file using lightweight document processor"""
        try:
            return self.doc_processor.extract_text_from_file(file_data, file_type, source_name)
        except Exception as e:
            console_log(f"Error extracting text from {file_type} file: {str(e)}")
            return f"Error extracting text from {file_type} file: {str(e)}"

    def _process_pdf_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process PDF data using lightweight document processor for text extraction"""
        try:
            # Decode base64 data if it's encoded
            import base64

            try:
                # Try to decode as base64 first
                file_data = base64.b64decode(data)
                console_log(f"Successfully decoded base64 PDF data for: {source_name} - {len(file_data)} bytes")

                # Validate the decoded data
                if len(file_data) < 100:
                    console_log(f"Decoded PDF data too small: {len(file_data)} bytes, treating as raw text")
                    return self._create_chunks(data, source_name, {**metadata, "file_type": "pdf"})

                # Check if it looks like a PDF
                if not file_data.startswith(b"%PDF-"):
                    console_log(f"Decoded data doesn't start with PDF header: {file_data[:20]}, treating as raw text")
                    return self._create_chunks(data, source_name, {**metadata, "file_type": "pdf"})

                console_log(f"PDF data validation passed: starts with {file_data[:10]}")

            except Exception as decode_error:
                console_log(f"Failed to decode as base64: {decode_error}, treating as raw text")
                # If not base64, treat as raw text
                return self._create_chunks(data, source_name, {**metadata, "file_type": "pdf"})

            # Extract text using lightweight processor
            extracted_text = self._extract_text_from_file(file_data, "pdf", source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from PDF, treating as raw text")
                return self._create_chunks(data, source_name, {**metadata, "file_type": "pdf"})

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            return self._create_chunks(cleaned_text, source_name, {**metadata, "file_type": "pdf"})

        except Exception as e:
            console_log(f"Error processing PDF data: {str(e)}")
            # Fallback to treating as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "pdf"})

    def _process_docx_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process DOCX data using lightweight document processor for text extraction"""
        try:
            # Decode base64 data if it's encoded
            import base64

            try:
                # Try to decode as base64 first
                file_data = base64.b64decode(data)
                console_log(f"Successfully decoded base64 DOCX data for: {source_name}")
            except Exception as decode_error:
                console_log(f"Failed to decode as base64: {decode_error}, treating as raw text")
                # If not base64, treat as raw text
                return self._create_chunks(data, source_name, {**metadata, "file_type": "docx"})

            # Extract text using lightweight processor
            extracted_text = self._extract_text_from_file(file_data, "docx", source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from DOCX, treating as raw text")
                return self._create_chunks(data, source_name, {**metadata, "file_type": "docx"})

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            return self._create_chunks(cleaned_text, source_name, {**metadata, "file_type": "docx"})

        except Exception as e:
            console_log(f"Error processing DOCX data: {str(e)}")
            # Fallback to treating as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "docx"})

    def _process_ppt_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process PPT data using lightweight document processor for text extraction"""
        try:
            # Decode base64 data if it's encoded
            import base64

            try:
                # Try to decode as base64 first
                file_data = base64.b64decode(data)
                console_log(f"Successfully decoded base64 PPT data for: {source_name}")
            except Exception as decode_error:
                console_log(f"Failed to decode as base64: {decode_error}, treating as raw text")
                # If not base64, treat as raw text
                return self._create_chunks(data, source_name, {**metadata, "file_type": "ppt"})

            # Extract text using lightweight processor
            extracted_text = self._extract_text_from_file(file_data, "ppt", source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from PPT, treating as raw text")
                return self._create_chunks(data, source_name, {**metadata, "file_type": "ppt"})

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            return self._create_chunks(cleaned_text, source_name, {**metadata, "file_type": "ppt"})

        except Exception as e:
            console_log(f"Error processing PPT data: {str(e)}")
            # Fallback to treating as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "ppt"})

    def _process_doc_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process DOC data using lightweight document processor for text extraction"""
        try:
            # Decode base64 data if it's encoded
            import base64

            try:
                # Try to decode as base64 first
                file_data = base64.b64decode(data)
                console_log(f"Successfully decoded base64 DOC data for: {source_name}")
            except Exception as decode_error:
                console_log(f"Failed to decode as base64: {decode_error}, treating as raw text")
                # If not base64, treat as raw text
                return self._create_chunks(data, source_name, {**metadata, "file_type": "doc"})

            # Extract text using lightweight processor
            extracted_text = self._extract_text_from_file(file_data, "doc", source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from DOC, treating as raw text")
                return self._create_chunks(data, source_name, {**metadata, "file_type": "doc"})

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            return self._create_chunks(cleaned_text, source_name, {**metadata, "file_type": "doc"})

        except Exception as e:
            console_log(f"Error processing DOC data: {str(e)}")
            # Fallback to treating as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "doc"})

    def _process_pptx_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process PPTX data using lightweight document processor for text extraction"""
        try:
            # Decode base64 data if it's encoded
            import base64

            try:
                # Try to decode as base64 first
                file_data = base64.b64decode(data)
                console_log(f"Successfully decoded base64 PPTX data for: {source_name}")
            except Exception as decode_error:
                console_log(f"Failed to decode as base64: {decode_error}, treating as raw text")
                # If not base64, treat as raw text
                return self._create_chunks(data, source_name, {**metadata, "file_type": "pptx"})

            # Extract text using lightweight processor
            extracted_text = self._extract_text_from_file(file_data, "pptx", source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from PPTX, treating as raw text")
                return self._create_chunks(data, source_name, {**metadata, "file_type": "pptx"})

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            return self._create_chunks(cleaned_text, source_name, {**metadata, "file_type": "pptx"})

        except Exception as e:
            console_log(f"Error processing PPTX data: {str(e)}")
            # Fallback to treating as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "pptx"})

    def _process_url_data(
        self,
        data: str,
        source_name: str,
        metadata: Dict[str, Any],
        include_links: bool = False,
        crawl_full_website: bool = True,
    ) -> List[DocumentChunkType]:
        """Process URL data by crawling the URL using Firecrawl"""
        try:
            console_log(f"Crawling URL: {data}")

            if crawl_full_website:
                console_log(f"Starting full website crawl for: {data}")
                return self._crawl_full_website(data, source_name, metadata, include_links)
            else:
                console_log(f"Starting single page scrape for: {data}")
                return self._scrape_single_page(data, source_name, metadata, include_links)

        except Exception as e:
            console_log(f"Error crawling URL {data}: {str(e)}")
            # Return error content as chunks so it's still stored
            error_content = f"Error crawling URL {data}: {str(e)}"
            return self._create_chunks(
                error_content,
                source_name,
                {**metadata, "source_type": "url", "crawl_error": True, "error_message": str(e)},
            )

    def _scrape_single_page(
        self, url: str, source_name: str, metadata: Dict[str, Any], include_links: bool = False
    ) -> List[DocumentChunkType]:
        """Scrape a single page using Firecrawl"""
        try:
            scrape_result = self.firecrawl.scrape(url=url, formats=["markdown"], only_main_content=True)

            if not scrape_result:
                console_log(f"Failed to scrape URL: {url}")
                return self._create_chunks(
                    f"Failed to scrape URL: {url}",
                    source_name,
                    {**metadata, "source_type": "url", "crawl_error": True},
                )

            # Extract content from the scrape result - prioritize markdown content
            content = ""
            if hasattr(scrape_result, "markdown") and scrape_result.markdown:
                content = scrape_result.markdown
            elif hasattr(scrape_result, "html") and scrape_result.html:
                content = scrape_result.html
            else:
                content = str(scrape_result)

            # Apply comprehensive text cleaning
            original_length = len(content)
            content = self._clean_text_content(content)
            console_log(f"Cleaned text content. Original length: {original_length}, New length: {len(content)}")

            # Remove links if include_links is False (additional cleanup)
            if not include_links:
                content = self._remove_links_from_markdown(content)
                console_log(f"Removed additional links from content. Final length: {len(content)}")

            # Add URL metadata
            crawl_metadata = getattr(scrape_result, "metadata", {})
            # Convert DocumentMetadata object to dictionary if needed
            if hasattr(crawl_metadata, "__dict__"):
                crawl_metadata = crawl_metadata.__dict__
            elif not isinstance(crawl_metadata, dict):
                crawl_metadata = {}

            # Convert crawl_metadata to a JSON string for Pinecone compatibility
            crawl_metadata_str = json.dumps(crawl_metadata) if crawl_metadata else "{}"

            url_metadata = {
                **metadata,
                "source_type": "url",
                "url": url,
                "crawl_success": True,
                "crawl_timestamp": getattr(scrape_result, "timestamp", ""),
                "crawl_metadata": crawl_metadata_str,
                "include_links": include_links,
                "full_website_crawl": False,
            }

            console_log(f"Successfully crawled URL: {url}, content length: {len(content)}")
            return self._create_chunks(content, source_name, url_metadata)

        except Exception as e:
            console_log(f"Error scraping single page {url}: {str(e)}")
            return self._create_chunks(
                f"Error scraping URL {url}: {str(e)}",
                source_name,
                {**metadata, "source_type": "url", "crawl_error": True, "error_message": str(e)},
            )

    def _crawl_full_website(
        self, start_url: str, source_name: str, metadata: Dict[str, Any], include_links: bool = False
    ) -> List[DocumentChunkType]:
        """Crawl full website using Firecrawl's crawl API"""
        try:
            console_log(f"Starting full website crawl using Firecrawl for: {start_url}")

            # Configure crawl parameters
            crawl_params = {
                "limit": 50,  # Maximum number of pages to crawl
                "crawl_entire_domain": True,  # Crawl the entire domain
                "allow_subdomains": True,
                "scrape_options": {
                    "formats": ["markdown"],
                },
            }

            # Perform the crawl using Firecrawl
            crawl_results = self.firecrawl.crawl(url=start_url, **crawl_params)

            if not crawl_results:
                console_log(f"No results from Firecrawl crawl for: {start_url}")
                return self._create_chunks(
                    f"No content found during full website crawl of: {start_url}",
                    source_name,
                    {**metadata, "source_type": "url", "crawl_error": True, "full_website_crawl": True},
                )

            # Debug: Log the structure of crawl_results
            console_log(f"Firecrawl crawl results type: {type(crawl_results)}")
            if crawl_results and hasattr(crawl_results, "__iter__"):
                try:
                    results_list = list(crawl_results)
                    console_log(f"Number of results: {len(results_list)}")
                    if results_list:
                        first_result = results_list[0]
                        console_log(f"First result type: {type(first_result)}")
                        console_log(f"First result: {first_result}")
                except Exception as e:
                    console_log(f"Error processing crawl results: {e}")
                    console_log(f"Crawl results: {crawl_results}")

            all_chunks = []
            pages_crawled = 0

            # Process each page from the crawl results
            # Convert crawl_results to list if it's not already
            if hasattr(crawl_results, "__iter__") and not isinstance(crawl_results, str):
                pages_list = list(crawl_results)
            else:
                pages_list = [crawl_results] if crawl_results else []

            for page in pages_list:
                pages_crawled += 1

                # Handle different response structures
                if isinstance(page, dict):
                    page_url = page.get("url", "")
                    page_title = page.get("title", "")
                    page_content = page.get("content", "")
                elif isinstance(page, tuple):
                    # Handle tuple structure - typically (url, content) or (url, title, content)
                    if len(page) >= 2:
                        page_url = str(page[0]) if page[0] else ""
                        page_content = str(page[1]) if page[1] else ""
                        page_title = str(page[2]) if len(page) > 2 and page[2] else ""
                    else:
                        console_log(f"Unexpected tuple structure with {len(page)} elements: {page}")
                        continue
                elif hasattr(page, "url") and hasattr(page, "content"):
                    page_url = getattr(page, "url", "")
                    page_title = getattr(page, "title", "")
                    page_content = getattr(page, "content", "")
                else:
                    console_log(f"Unexpected page structure: {type(page)} - {page}")
                    continue

                console_log(f"Processing page {pages_crawled}: {page_url}")

                if not page_content:
                    console_log(f"No content found for page: {page_url}")
                    continue

                # Apply text cleaning
                cleaned_content = self._clean_text_content(page_content)

                # Remove links if include_links is False
                if not include_links:
                    cleaned_content = self._remove_links_from_markdown(cleaned_content)

                # Create page-specific metadata
                page_metadata = {
                    **metadata,
                    "source_type": "url",
                    "url": page_url,
                    "title": page_title,
                    "crawl_success": True,
                    "include_links": include_links,
                    "full_website_crawl": True,
                    "page_number": pages_crawled,
                    "total_pages_crawled": len(pages_list),
                }

                # Create chunks for this page
                page_chunks = self._create_chunks(cleaned_content, f"{source_name}_page_{pages_crawled}", page_metadata)
                all_chunks.extend(page_chunks)

                console_log(
                    f"Successfully processed page {pages_crawled}: {page_url}, content length: {len(cleaned_content)}"
                )

            console_log(f"Full website crawl completed. Processed {pages_crawled} pages from Firecrawl")

            if not all_chunks:
                return self._create_chunks(
                    f"No content found during full website crawl of: {start_url}",
                    source_name,
                    {**metadata, "source_type": "url", "crawl_error": True, "full_website_crawl": True},
                )

            return all_chunks

        except Exception as e:
            console_log(f"Error during full website crawl {start_url}: {str(e)}")
            return self._create_chunks(
                f"Error during full website crawl {start_url}: {str(e)}",
                source_name,
                {
                    **metadata,
                    "source_type": "url",
                    "crawl_error": True,
                    "error_message": str(e),
                    "full_website_crawl": True,
                },
            )

    def _process_json_data(self, data: str, source_name: str, metadata: Dict[str, Any]) -> List[DocumentChunkType]:
        """Process JSON data"""
        import json
        import base64

        try:
            # First try to decode as base64 if it looks like base64
            try:
                if len(data) > 100 and data.replace("+", "").replace("/", "").replace("=", "").isalnum():
                    # Looks like base64, try to decode
                    decoded_data = base64.b64decode(data).decode("utf-8")
                    console_log(f"Successfully decoded base64 JSON data for: {source_name}")
                    json_data = json.loads(decoded_data)
                else:
                    # Not base64, try to parse as JSON directly
                    json_data = json.loads(data)
            except (Exception, UnicodeDecodeError, json.JSONDecodeError):
                # If base64 decode fails, try to parse as JSON directly
                json_data = json.loads(data)

            # Convert JSON to readable text format
            formatted_text = json.dumps(json_data, indent=2)
            return self._create_chunks(formatted_text, source_name, {**metadata, "file_type": "json"})
        except json.JSONDecodeError:
            # If not valid JSON, treat as text
            return self._create_chunks(data, source_name, {**metadata, "file_type": "text"})

    def crawl_url(
        self,
        url: str,
        source_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        include_links: bool = False,
        crawl_full_website: bool = True,
    ) -> DefaultReturnType[IngestResponseType]:
        """Crawl a URL and ingest its content into the vector database"""
        try:
            if not source_name:
                source_name = f"url_{url.split('/')[-1] or 'crawled'}"

            if not metadata:
                metadata = {}

            console_log(f"Starting URL crawl for: {url}")

            # Process the URL data
            chunks = self._process_url_data(url, source_name, metadata, include_links, crawl_full_website)

            if not chunks:
                return DefaultReturnType(
                    error=ErrorResponseType(
                        userMessage="No content found to crawl from URL",
                        error="No content found to crawl from URL",
                        errorType="BadRequestException",
                        errorData={"url": url},
                        trace=["ingestion_service - crawl_url - no chunks"],
                    )
                )

            # Store chunks in Pinecone
            texts = [chunk.content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]
            ids = [chunk.id for chunk in chunks]

            self.vector_store.add_texts(texts, metadatas, ids)

            console_log(f"Successfully crawled and ingested {len(chunks)} chunks from URL: {url}")

            return DefaultReturnType(
                data=IngestResponseType(
                    success=True,
                    message=f"Successfully crawled and ingested {len(chunks)} chunks from URL",
                    chunks_created=len(chunks),
                    source_id=source_name,
                )
            )

        except Exception as e:
            console_log(f"Error crawling URL {url}: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error crawling URL!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={"url": url},
                    trace=["ingestion_service - crawl_url - except Exception"],
                )
            )

    # Ingest a file and store it in Pinecone
    def ingest_file(
        self, file_data: bytes, file_type: str, request: FileIngestRequestArgs
    ) -> DefaultReturnType[IngestResponseType]:
        """Ingest a file directly from bytes data"""
        try:
            console_log(f"Starting file ingestion for source: {request.source_name}, type: {file_type}")

            # Extract text from file using lightweight processor
            extracted_text = self.doc_processor.extract_text_from_file(file_data, file_type, request.source_name)

            if not extracted_text or extracted_text.startswith("Error extracting text"):
                console_log(f"Failed to extract text from {file_type}, treating as raw text")
                # Fallback to treating as raw text
                extracted_text = file_data.decode("utf-8", errors="ignore")

            # Clean the extracted text
            cleaned_text = self._clean_text_content(extracted_text)

            # Create chunks
            chunks = self._create_chunks(
                cleaned_text, request.source_name, {**(request.metadata or {}), "file_type": file_type}
            )

            # Store chunks in Pinecone
            texts = [chunk.content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]
            ids = [chunk.id for chunk in chunks]

            self.vector_store.add_texts(texts, metadatas, ids)

            console_log(f"Successfully ingested {len(chunks)} chunks for file: {request.source_name}")

            return DefaultReturnType(
                data=IngestResponseType(
                    success=True,
                    message=f"Successfully ingested {len(chunks)} chunks from file",
                    chunks_created=len(chunks),
                    source_id=request.source_name,
                )
            )

        except Exception as e:
            console_log(f"Error ingesting file: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error ingesting file!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["ingestion_service - ingest_file - except Exception"],
                )
            )

    # Ingest a document and store it in Pinecone
    def ingest_document(self, request: IngestRequestArgs) -> DefaultReturnType[IngestResponseType]:
        try:
            console_log(f"Starting ingestion for source: {request.source_name}")

            # Determine include_links and crawl_full_website values for URL processing
            include_links = (
                request.include_links if request.include_links is not None else self.config.include_links_in_url_content
            )
            crawl_full_website = (
                request.crawl_full_website if request.crawl_full_website is not None else self.config.crawl_full_website
            )

            # Process data based on source type
            match request.source_type:
                case "text":
                    chunks = self._process_text_data(request.data, request.source_name, request.metadata or {})
                case "pdf":
                    chunks = self._process_pdf_data(request.data, request.source_name, request.metadata or {})
                case "docx":
                    chunks = self._process_docx_data(request.data, request.source_name, request.metadata or {})
                case "doc":
                    chunks = self._process_doc_data(request.data, request.source_name, request.metadata or {})
                case "ppt":
                    chunks = self._process_ppt_data(request.data, request.source_name, request.metadata or {})
                case "pptx":
                    chunks = self._process_pptx_data(request.data, request.source_name, request.metadata or {})
                case "url":
                    chunks = self._process_url_data(
                        request.data, request.source_name, request.metadata or {}, include_links, crawl_full_website
                    )
                case "json":
                    chunks = self._process_json_data(request.data, request.source_name, request.metadata or {})
                case _:
                    return DefaultReturnType(
                        error=ErrorResponseType(
                            userMessage=f"Unsupported source type: {request.source_type}",
                            error=f"Unsupported source type: {request.source_type}",
                            errorType="BadRequestException",
                            errorData={},
                            trace=["ingestion_service - ingest_document - match _"],
                        )
                    )

            # Store chunks in Pinecone
            texts = [chunk.content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]
            ids = [chunk.id for chunk in chunks]

            self.vector_store.add_texts(texts, metadatas, ids)

            console_log(f"Successfully ingested {len(chunks)} chunks for source: {request.source_name}")

            return DefaultReturnType(
                data=IngestResponseType(
                    success=True,
                    message=f"Successfully ingested {len(chunks)} chunks",
                    chunks_created=len(chunks),
                    source_id=request.source_name,
                )
            )

        except Exception as e:
            console_log(f"Error ingesting document: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error ingesting document!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["ingestion_service - ingest_document - except Exception"],
                )
            )

    def delete_document(self, source_name: str) -> DefaultReturnType[bool]:
        """Delete all chunks for a specific source"""
        try:
            # Query for all chunks with the source name
            results: Any = self.index.query(
                vector=[0.0] * 1024,  # Dummy vector
                filter={"source_name": source_name},
                top_k=10000,  # Large number to get all chunks
                include_metadata=True,
            )

            if results.matches:
                ids_to_delete = [match.id for match in results.matches]
                self.index.delete(ids=ids_to_delete)
                console_log(f"Deleted {len(ids_to_delete)} chunks for source: {source_name}")
                return DefaultReturnType(data=True)
            else:
                console_log(f"No chunks found for source: {source_name}")
                return DefaultReturnType(data=True)

        except Exception as e:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error deleting document!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["ingestion_service - delete_document - except Exception"],
                )
            )

    def get_document_stats(self, source_name: Optional[str] = None) -> DefaultReturnType[Dict[str, Any]]:
        """Get statistics about stored documents"""
        try:
            if source_name:
                # Get stats for specific source
                results: Any = self.index.query(
                    vector=[0.0] * 1024, filter={"source_name": source_name}, top_k=10000, include_metadata=True
                )
                return DefaultReturnType(
                    data={
                        "source_name": source_name,
                        "total_chunks": len(results.matches),
                        "total_tokens": sum(match.metadata.get("token_count", 0) for match in results.matches),
                    }
                )
            else:
                # Get overall stats
                stats = self.index.describe_index_stats()
                return DefaultReturnType(
                    data={
                        "total_vectors": stats.total_vector_count,
                        "dimension": stats.dimension,
                        "index_fullness": stats.index_fullness,
                    }
                )

        except Exception as e:
            console_log(f"Error getting document stats: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting document stats!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["ingestion_service - get_document_stats - except Exception"],
                )
            )

    def re_ingest_document_with_cleaning(self, source_name: str) -> DefaultReturnType[IngestResponseType]:
        """Re-ingest a document with text cleaning applied to existing content"""
        try:
            console_log(f"Re-ingesting document with cleaning: {source_name}")

            # Get all existing chunks for the source
            results: Any = self.index.query(
                vector=[0.0] * 1024,  # Dummy vector
                filter={"source_name": source_name},
                top_k=10000,  # Large number to get all chunks
                include_metadata=True,
            )

            if not results.matches:
                return DefaultReturnType(
                    error=ErrorResponseType(
                        userMessage=f"No documents found for source: {source_name}",
                        error=f"No documents found for source: {source_name}",
                        errorType="BadRequestException",
                        errorData={"source_name": source_name},
                        trace=["ingestion_service - re_ingest_document_with_cleaning - no matches"],
                    )
                )

            # Collect all content and metadata
            all_content = []
            metadata = {}
            for match in results.matches:
                all_content.append(match.metadata.get("content", ""))
                # Use the first match's metadata as the base
                if not metadata:
                    metadata = match.metadata

            # Combine all content
            combined_content = "\n".join(all_content)

            # Apply text cleaning
            cleaned_content = self._clean_text_content(combined_content)

            console_log(
                f"Cleaned content. Original length: {len(combined_content)}, New length: {len(cleaned_content)}"
            )

            # Delete existing chunks
            ids_to_delete = [match.id for match in results.matches]
            self.index.delete(ids=ids_to_delete)
            console_log(f"Deleted {len(ids_to_delete)} old chunks for source: {source_name}")

            # Re-ingest with cleaned content
            chunks = self._create_chunks(cleaned_content, source_name, metadata)

            # Store new chunks in Pinecone
            texts = [chunk.content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]
            ids = [chunk.id for chunk in chunks]

            self.vector_store.add_texts(texts, metadatas, ids)

            console_log(f"Successfully re-ingested {len(chunks)} cleaned chunks for source: {source_name}")

            return DefaultReturnType(
                data=IngestResponseType(
                    success=True,
                    message=f"Successfully re-ingested {len(chunks)} cleaned chunks",
                    chunks_created=len(chunks),
                    source_id=source_name,
                )
            )

        except Exception as e:
            console_log(f"Error re-ingesting document {source_name}: {str(e)}")
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error re-ingesting document!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={"source_name": source_name},
                    trace=["ingestion_service - re_ingest_document_with_cleaning - except Exception"],
                )
            )
