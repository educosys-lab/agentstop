"""
Utility functions for the RAG system
"""

import re
import hashlib
from typing import List, Dict, Any, Optional
from app.shared.logger.logger import console_log


def clean_text(text: str) -> str:
    """Clean and normalize text for better processing"""
    if not text:
        return ""

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove special characters that might interfere with processing
    text = re.sub(r"[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\']+", "", text)

    # Trim whitespace
    text = text.strip()

    return text


def generate_document_hash(content: str, source_name: str) -> str:
    """Generate a unique hash for a document"""
    combined = f"{source_name}:{content}"
    return hashlib.md5(combined.encode()).hexdigest()


def validate_chunk_size(chunk_size: int) -> bool:
    """Validate chunk size is within acceptable limits"""
    return 100 <= chunk_size <= 4000


def validate_chunk_overlap(chunk_overlap: int, chunk_size: int) -> bool:
    """Validate chunk overlap is reasonable"""
    return 0 <= chunk_overlap <= min(1000, chunk_size // 2)


def extract_metadata_from_filename(filename: str) -> Dict[str, Any]:
    """Extract metadata from filename"""
    import os
    from datetime import datetime

    name, ext = os.path.splitext(filename)

    return {
        "filename": filename,
        "file_extension": ext.lower(),
        "file_name": name,
        "ingestion_timestamp": datetime.utcnow().isoformat(),
    }


def calculate_text_statistics(text: str) -> Dict[str, Any]:
    """Calculate various statistics for text"""
    if not text:
        return {"character_count": 0, "word_count": 0, "sentence_count": 0, "paragraph_count": 0}

    char_count = len(text)
    word_count = len(text.split())
    sentence_count = len(re.split(r"[.!?]+", text))
    paragraph_count = len([p for p in text.split("\n\n") if p.strip()])

    return {
        "character_count": char_count,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
    }


def format_search_results_for_display(
    results: List[Dict[str, Any]], max_preview_length: int = 200
) -> List[Dict[str, Any]]:
    """Format search results for better display"""
    formatted_results = []

    for i, result in enumerate(results, 1):
        content = result.get("content", "")
        preview = content[:max_preview_length] + "..." if len(content) > max_preview_length else content

        formatted_result = {
            "rank": i,
            "source": result.get("source", "unknown"),
            "score": result.get("score", 0.0),
            "preview": preview,
            "full_content": content,
            "metadata": result.get("metadata", {}),
        }

        formatted_results.append(formatted_result)

    return formatted_results


def validate_query_request(request_data: Dict[str, Any]) -> List[str]:
    """Validate query request data and return list of errors"""
    errors = []

    question = request_data.get("question", "")
    if not question or not question.strip():
        errors.append("Question cannot be empty")

    if len(question) > 10000:
        errors.append("Question is too long (max 10000 characters)")

    mode = request_data.get("mode", "docs_only")
    if mode not in ["docs_only", "open_internet"]:
        errors.append("Mode must be either 'docs_only' or 'open_internet'")

    max_results = request_data.get("max_results", 5)
    if not isinstance(max_results, int) or max_results < 1 or max_results > 20:
        errors.append("max_results must be an integer between 1 and 20")

    temperature = request_data.get("temperature", 0.7)
    if not isinstance(temperature, (int, float)) or temperature < 0.0 or temperature > 2.0:
        errors.append("temperature must be a number between 0.0 and 2.0")

    return errors


def validate_ingest_request(request_data: Dict[str, Any]) -> List[str]:
    """Validate ingestion request data and return list of errors"""
    errors = []

    data = request_data.get("data", "")
    if not data or not data.strip():
        errors.append("Data cannot be empty")

    if len(data) > 1000000:  # 1MB limit
        errors.append("Data is too large (max 1MB)")

    source_name = request_data.get("source_name", "")
    if not source_name or not source_name.strip():
        errors.append("Source name cannot be empty")

    if len(source_name) > 255:
        errors.append("Source name is too long (max 255 characters)")

    source_type = request_data.get("source_type", "")
    if source_type not in ["text", "pdf", "docx", "url", "json"]:
        errors.append("Source type must be one of: text, pdf, docx, url, json")

    chunk_size = request_data.get("chunk_size", 1000)
    if not validate_chunk_size(chunk_size):
        errors.append("chunk_size must be between 100 and 4000")

    chunk_overlap = request_data.get("chunk_overlap", 200)
    if not validate_chunk_overlap(chunk_overlap, chunk_size):
        errors.append("chunk_overlap must be between 0 and min(1000, chunk_size/2)")

    return errors


def log_rag_operation(operation: str, details: Dict[str, Any], success: bool = True):
    """Log RAG operations with consistent format"""
    status = "SUCCESS" if success else "FAILED"
    console_log(f"RAG {operation} - {status}: {details}")


def create_error_response(message: str, error_code: str = "RAG_ERROR") -> Dict[str, Any]:
    """Create standardized error response"""
    return {"success": False, "error": {"code": error_code, "message": message}}


def create_success_response(data: Any, message: str = "Operation completed successfully") -> Dict[str, Any]:
    """Create standardized success response"""
    return {"success": True, "message": message, "data": data}
