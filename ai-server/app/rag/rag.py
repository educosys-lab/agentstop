"""
RAG (Retrieval-Augmented Generation) System

This is the main entry point for the RAG system. The system provides:
- Document ingestion and storage in Pinecone vector database
- Query processing with configurable modes
- RESTful API endpoints for all operations

To use the RAG system:
1. Set up environment variables (OPENAI_KEY, PINECONE_KEY, etc.)
2. Start the FastAPI server
3. Use the API endpoints or run the example_usage.py script

For detailed documentation, see README.md in this directory.
"""

from .rag_controller import router
from .rag_types import *
from .ingestion_service import RAGIngestionService
from .query_service import RAGQueryService
from .external_query_service import ExternalVectorDBQueryService

__all__ = [
    "router",
    "RAGIngestionService",
    "RAGQueryService",
    "ExternalVectorDBQueryService",
    "DataSourceType",
    "QueryModeType",
    "IngestRequestArgs",
    "IngestResponseType",
    "QueryRequestArgs",
    "QueryResponseType",
    "ExternalQueryRequestArgs",
    "ExternalQueryResponseType",
    "ExternalVectorDBConfigType",
]
