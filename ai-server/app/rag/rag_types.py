from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import UploadFile


# Common Types
class SearchResultType(BaseModel):
    """Individual search result from vector database"""

    content: str
    score: float
    metadata: Dict[str, Any]
    source: str


class RAGConfigType(BaseModel):
    """Configuration for RAG system"""

    embedding_model: str = "text-embedding-3-small"
    llm_model: str = "gpt-4o-mini"
    chunk_size: int = 400  # Now in tokens, not characters
    chunk_overlap: int = 60  # Now in tokens, not characters
    max_results: int = 5
    temperature: float = 0.7
    include_metadata_in_context: bool = False
    include_metadata_in_sources: bool = False
    include_links_in_url_content: bool = False
    crawl_full_website: bool = True  # Whether to crawl entire website by default
    use_mmr: bool = True  # Enable Maximum Marginal Relevance for diversity
    mmr_lambda: float = 0.5  # Balance between relevance and diversity (0=max diversity, 1=max relevance)


# Ingestion Types
DataSourceType = Literal["text", "pdf", "docx", "doc", "pptx", "ppt", "url", "json"]


class IngestRequestArgs(BaseModel):
    """Request model for data ingestion (legacy - for text/url data)"""

    data: str
    source_type: DataSourceType
    source_name: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    chunk_size: int = Field(default=400, ge=50, le=2000, description="Chunk size in tokens")
    chunk_overlap: int = Field(default=60, ge=0, le=500, description="Chunk overlap in tokens")
    include_links: Optional[bool] = Field(
        default=None, description="Whether to include links in URL content (only applies to URL source type)"
    )
    crawl_full_website: Optional[bool] = Field(
        default=True, description="Whether to crawl the entire website (only applies to URL source type)"
    )
    user_email: Optional[str] = Field(default=None, description="User email to get the user id from the DB")


class FileIngestRequestArgs(BaseModel):
    """Request model for file ingestion (for file uploads)"""

    source_name: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    chunk_size: int = Field(default=400, ge=50, le=2000, description="Chunk size in tokens")
    chunk_overlap: int = Field(default=60, ge=0, le=500, description="Chunk overlap in tokens")
    user_email: Optional[str] = Field(default=None, description="User email to get the user id from the DB")


class IngestResponseType(BaseModel):
    """Response model for data ingestion"""

    success: bool
    message: str
    chunks_created: int
    source_id: str


class DocumentChunkType(BaseModel):
    """Represents a chunk of document for vector storage"""

    id: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    source: str
    chunk_index: int
    total_chunks: int


# Query Types
QueryModeType = Literal["docs_only", "open_internet"]


class QueryRequestArgs(BaseModel):
    """Request model for RAG queries"""

    question: str
    mode: QueryModeType = "docs_only"
    max_results: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    include_sources: bool = Field(default=True)
    vector_db_name: Optional[str] = Field(
        default=None, description="Name of the vector database to query. If not specified, uses the default RAG index."
    )
    source_name: Optional[List[str]] = Field(
        default=None,
        description="Filter results to only include documents from these source names. If not specified, searches all sources.",
    )


class QueryResponseType(BaseModel):
    """Response model for RAG queries"""

    answer: str | list[str | dict[Any, Any]]
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    mode_used: QueryModeType
    confidence_score: Optional[float] = None


# External Vector Database Types
class ExternalVectorDBConfigType(BaseModel):
    """Configuration for external vector database connection"""

    api_key: str
    region: str
    index_name: str
    dimension: int = 1024  # Default for OpenAI embeddings
    metric: str = "cosine"


class ExternalQueryRequestArgs(BaseModel):
    """Request model for external vector database queries"""

    question: str
    vector_db_config: ExternalVectorDBConfigType
    mode: QueryModeType = "docs_only"
    max_results: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    include_sources: bool = Field(default=True)


class ExternalQueryResponseType(BaseModel):
    """Response model for external vector database queries"""

    answer: str | list[str | dict[Any, Any]]
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    mode_used: QueryModeType
    confidence_score: Optional[float] = None
    vector_db_used: str
