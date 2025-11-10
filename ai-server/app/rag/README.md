# RAG (Retrieval-Augmented Generation) System

This module provides a complete RAG system for building chatbots and answering queries based on provided data. The system consists of two main components:

1. **Data Ingestion Module**: Ingests and stores documents in Pinecone vector database
2. **Query Module**: Processes queries and generates responses using retrieved context

## Features

-   **Multiple Data Sources**: Support for text, PDF, DOCX, URL, and JSON data
-   **Configurable Query Modes**:
    -   `docs_only`: Answer only from provided documents
    -   `open_internet`: Can use internet for additional context
-   **Vector Search**: Uses Pinecone for efficient similarity search
-   **Chunking**: Automatic text chunking with configurable size and overlap
-   **Source Attribution**: Track and display sources for generated answers
-   **Confidence Scoring**: Calculate confidence scores for responses
-   **Vector Database Selection**: Specify which vector database to query
-   **External Vector Database Support**: Query external vector databases without data ingestion

## API Endpoints

### Document Ingestion

#### POST `/rag/ingest`

Ingest a document into the RAG system.

**Request Body:**

```json
{
	"data": "Your document content here...",
	"source_type": "text",
	"source_name": "my-document-1",
	"metadata": {
		"author": "John Doe",
		"category": "technical"
	},
	"chunk_size": 1000,
	"chunk_overlap": 200
}
```

**Response:**

```json
{
	"success": true,
	"message": "Successfully ingested 5 chunks",
	"chunks_created": 5,
	"source_id": "my-document-1"
}
```

### Query Processing

#### POST `/rag/query`

Query the RAG system for answers.

**Request Body:**

```json
{
	"question": "What is the main topic of the document?",
	"mode": "docs_only",
	"max_results": 5,
	"temperature": 0.7,
	"include_sources": true,
	"vector_db_name": "my-custom-index"
}
```

**Response:**

```json
{
  "answer": "The main topic of the document is...",
  "sources": [
    {
      "source": "my-document-1",
      "score": 0.85,
      "metadata": {...},
      "content_preview": "The document discusses..."
    }
  ],
  "mode_used": "docs_only",
  "confidence_score": 0.85
}
```

### Document Search

#### GET `/rag/search?query=your+search+term&max_results=5&vector_db_name=optional`

Search for similar documents without generating a response.

### Document Management

#### DELETE `/rag/documents/{source_name}`

Delete all chunks for a specific document source.

#### GET `/rag/stats?source_name=optional`

Get statistics about stored documents.

### System Health

#### GET `/rag/health`

Check the health of the RAG system.

#### GET `/rag/config`

Get current RAG configuration.

#### POST `/rag/config`

Update RAG configuration.

### External Vector Database Queries

#### POST `/rag/external/query`

Query an external vector database for answers.

**Request Body:**

```json
{
	"question": "What is the main topic of the document?",
	"vector_db_config": {
		"api_key": "your-pinecone-api-key",
		"region": "your-pinecone-region",
		"index_name": "external-index-name",
		"dimension": 1024,
		"metric": "cosine"
	},
	"mode": "docs_only",
	"max_results": 5,
	"temperature": 0.7,
	"include_sources": true
}
```

**Response:**

```json
{
	"answer": "The main topic of the document is...",
	"sources": [
		{
			"source": "external-doc-1",
			"score": 0.85,
			"metadata": {...},
			"content_preview": "The document discusses..."
		}
	],
	"mode_used": "docs_only",
	"confidence_score": 0.85,
	"vector_db_used": "external-index-name"
}
```

#### GET `/rag/external/search?query=your+search+term&api_key=key&region=env&index_name=index&max_results=5`

Search for similar documents in an external vector database without generating a response.

#### POST `/rag/external/test-connection`

Test connection to an external vector database.

**Request Body:**

```json
{
	"api_key": "your-pinecone-api-key",
	"region": "your-pinecone-region",
	"index_name": "external-index-name",
	"dimension": 1024,
	"metric": "cosine"
}
```

## Configuration

The system requires the following environment variables:

```env
OPENAI_KEY=your_openai_api_key
PINECONE_KEY=your_pinecone_api_key
PINECONE_REGION=your_pinecone_host_region
PINECONE_INDEX_NAME=rag-index
```

## Usage Examples

### Python Client Example

```python
import requests

# Ingest a document
ingest_response = requests.post("http://localhost:8000/rag/ingest", json={
    "data": "This is a sample document about machine learning...",
    "source_type": "text",
    "source_name": "ml-guide",
    "metadata": {"category": "education"}
})

# Query the system
query_response = requests.post("http://localhost:8000/rag/query", json={
    "question": "What is machine learning?",
    "mode": "docs_only",
    "include_sources": True,
    "vector_db_name": "my-custom-index"
})

print(query_response.json()["answer"])

# Query external vector database
external_query_response = requests.post("http://localhost:8000/rag/external/query", json={
    "question": "What is the latest research in AI?",
    "vector_db_config": {
        "api_key": "external-pinecone-key",
        "region": "external-env",
        "index_name": "research-papers"
    },
    "mode": "docs_only",
    "include_sources": True
})

print(external_query_response.json()["answer"])
```

### cURL Examples

```bash
# Ingest document
curl -X POST "http://localhost:8000/rag/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "Your document content...",
    "source_type": "text",
    "source_name": "test-doc"
  }'

# Query system
curl -X POST "http://localhost:8000/rag/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "mode": "docs_only",
    "vector_db_name": "my-index"
  }'

# Query external vector database
curl -X POST "http://localhost:8000/rag/external/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the latest research?",
    "vector_db_config": {
      "api_key": "external-key",
      "region": "external-env",
      "index_name": "research-index"
    },
    "mode": "docs_only"
  }'
```

## Data Types

### Source Types

-   `text`: Plain text content
-   `pdf`: PDF document (text should be extracted first)
-   `docx`: Word document (text should be extracted first)
-   `url`: Web page content (should be scraped first)
-   `json`: JSON data

### Query Modes

-   `docs_only`: Answer only from stored documents
-   `open_internet`: Can use internet for additional context

## Error Handling

The system includes comprehensive error handling:

-   Input validation for all requests
-   Graceful handling of API failures
-   Detailed error messages
-   Health checks for system components

## Performance Considerations

-   **Chunk Size**: Larger chunks provide more context but may reduce precision
-   **Chunk Overlap**: Higher overlap improves context continuity but increases storage
-   **Max Results**: More results provide better context but increase processing time
-   **Temperature**: Lower values make responses more focused, higher values more creative

## Security Notes

-   API keys should be stored securely in environment variables
-   Consider rate limiting for production use
-   Validate and sanitize all input data
-   Monitor usage and costs for OpenAI and Pinecone APIs
