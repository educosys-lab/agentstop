"""
Example usage of the RAG system

This script demonstrates how to use the RAG system for document ingestion and querying.
Run this after starting the FastAPI server.
"""

import requests
import json
import time
from typing import Dict, Any

from app.shared.config.config import env


class RAGClient:
    """Simple client for interacting with the RAG API"""

    def __init__(self, base_url: str = f"{env.BASE_URL}/rag"):
        self.base_url = base_url
        self.rag_url = f"{base_url}/rag"

    def ingest_document(
        self, data: str, source_name: str, source_type: str = "text", metadata: Dict[str, Any] = {}
    ) -> Dict[str, Any]:
        """Ingest a document into the RAG system"""
        payload = {"data": data, "source_type": source_type, "source_name": source_name, "metadata": metadata or {}}

        response = requests.post(f"{self.rag_url}/ingest", json=payload)
        return response.json()

    def query(
        self, question: str, mode: str = "docs_only", max_results: int = 5, include_sources: bool = True
    ) -> Dict[str, Any]:
        """Query the RAG system"""
        payload = {"question": question, "mode": mode, "max_results": max_results, "include_sources": include_sources}

        response = requests.post(f"{self.rag_url}/query", json=payload)
        return response.json()

    def search_documents(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """Search for similar documents"""
        params = {"query": query, "max_results": max_results}
        response = requests.get(f"{self.rag_url}/search", params=params)
        return response.json()

    def get_stats(self, source_name: str = "") -> Dict[str, Any]:
        """Get document statistics"""
        params = {"source_name": source_name} if source_name else {}
        response = requests.get(f"{self.rag_url}/stats", params=params)
        return response.json()

    def health_check(self) -> Dict[str, Any]:
        """Check system health"""
        response = requests.get(f"{self.rag_url}/health")
        return response.json()


def main():
    """Example usage of the RAG system"""

    # Initialize client
    client = RAGClient()

    print("🔍 Checking RAG system health...")
    health = client.health_check()
    print(f"Health status: {health}")

    if health.get("status") != "healthy":
        print("❌ RAG system is not healthy. Please check your configuration.")
        return

    print("\n📚 Ingesting sample documents...")

    # Sample documents
    documents = [
        {
            "name": "ai-basics",
            "content": """
            Artificial Intelligence (AI) is a branch of computer science that aims to create
            machines that can perform tasks that typically require human intelligence. These
            tasks include learning, reasoning, problem-solving, perception, and language understanding.

            Machine Learning is a subset of AI that focuses on algorithms that can learn and
            make decisions from data without being explicitly programmed for every task.

            Deep Learning is a subset of machine learning that uses neural networks with
            multiple layers to model and understand complex patterns in data.
            """,
            "metadata": {"category": "technology", "difficulty": "beginner"},
        },
        {
            "name": "python-programming",
            "content": """
            Python is a high-level, interpreted programming language known for its simplicity
            and readability. It was created by Guido van Rossum and first released in 1991.

            Python supports multiple programming paradigms including procedural, object-oriented,
            and functional programming. It has a large standard library and an active community.

            Python is widely used in web development, data science, artificial intelligence,
            automation, and scientific computing.
            """,
            "metadata": {"category": "programming", "language": "python"},
        },
        {
            "name": "fastapi-guide",
            "content": """
            FastAPI is a modern, fast web framework for building APIs with Python 3.7+ based
            on standard Python type hints. It's designed to be easy to use and fast to code.

            Key features of FastAPI include automatic interactive API documentation,
            type validation, and high performance. It's built on top of Starlette and Pydantic.

            FastAPI is particularly popular for building REST APIs, microservices, and
            real-time applications.
            """,
            "metadata": {"category": "web-development", "framework": "fastapi"},
        },
    ]

    # Ingest documents
    for doc in documents:
        print(f"  📄 Ingesting: {doc['name']}")
        result = client.ingest_document(data=doc["content"], source_name=doc["name"], metadata=doc["metadata"])

        if result.get("success"):
            print(f"    ✅ Success: {result['chunks_created']} chunks created")
        else:
            print(f"    ❌ Failed: {result.get('message', 'Unknown error')}")

    # Wait a moment for indexing
    print("\n⏳ Waiting for documents to be indexed...")
    time.sleep(2)

    # Get statistics
    print("\n📊 Document statistics:")
    stats = client.get_stats()
    print(json.dumps(stats, indent=2))

    # Example queries
    print("\n🤖 Running example queries...")

    queries = [
        {
            "question": "What is artificial intelligence?",
            "mode": "docs_only",
            "description": "Basic AI question (docs only)",
        },
        {
            "question": "How does Python compare to other programming languages?",
            "mode": "open_internet",
            "description": "Comparison question (with internet access)",
        },
        {
            "question": "What are the key features of FastAPI?",
            "mode": "docs_only",
            "description": "Framework-specific question",
        },
    ]

    for i, query in enumerate(queries, 1):
        print(f"\n  🔍 Query {i}: {query['description']}")
        print(f"     Question: {query['question']}")
        print(f"     Mode: {query['mode']}")

        result = client.query(question=query["question"], mode=query["mode"], include_sources=True)

        if result.get("answer"):
            print(f"     Answer: {result['answer'][:200]}...")
            print(f"     Confidence: {result.get('confidence_score', 'N/A')}")
            print(f"     Sources: {len(result.get('sources', []))}")
        else:
            print(f"     ❌ No answer received")

    # Document search example
    print("\n🔍 Document search example:")
    search_result = client.search_documents("machine learning neural networks", max_results=3)

    if search_result.get("results"):
        print(f"Found {len(search_result['results'])} similar documents:")
        for i, result in enumerate(search_result["results"], 1):
            print(f"  {i}. Source: {result['source']} (Score: {result['score']:.3f})")
            print(f"     Preview: {result['content'][:100]}...")

    print("\n✅ RAG system example completed!")


if __name__ == "__main__":
    main()
