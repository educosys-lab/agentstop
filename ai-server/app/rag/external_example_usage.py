"""
Example usage of the External Vector Database Query functionality

This script demonstrates how to query external vector databases
without ingesting data. The external database should already contain
vectorized documents.
"""

import requests
from typing import Any, Dict

from app.shared.config.config import env


class ExternalRAGClient:
    """Client for interacting with external vector databases via RAG API"""

    def __init__(self, base_url: str = f"{env.BASE_URL}/rag"):
        self.base_url = base_url
        self.rag_url = f"{base_url}/rag"

    def test_connection(
        self, api_key: str, region: str, index_name: str, dimension: int = 1024, metric: str = "cosine"
    ) -> Dict[str, Any]:
        """Test connection to external vector database"""
        payload = {
            "api_key": api_key,
            "region": region,
            "index_name": index_name,
            "dimension": dimension,
            "metric": metric,
        }

        response = requests.post(f"{self.rag_url}/external/test-connection", json=payload)
        return response.json()

    def query_external_db(
        self,
        question: str,
        api_key: str,
        region: str,
        index_name: str,
        mode: str = "docs_only",
        max_results: int = 5,
        include_sources: bool = True,
    ) -> Dict[str, Any]:
        """Query external vector database"""
        payload = {
            "question": question,
            "vector_db_config": {
                "api_key": api_key,
                "region": region,
                "index_name": index_name,
            },
            "mode": mode,
            "max_results": max_results,
            "include_sources": include_sources,
        }

        response = requests.post(f"{self.rag_url}/external/query", json=payload)
        return response.json()

    def search_external_documents(
        self, query: str, api_key: str, region: str, index_name: str, max_results: int = 5
    ) -> Dict[str, Any]:
        """Search external vector database without generating response"""
        params = {
            "query": query,
            "api_key": api_key,
            "region": region,
            "index_name": index_name,
            "max_results": max_results,
        }

        response = requests.get(f"{self.rag_url}/external/search", params=params)
        return response.json()


def main():
    """Example usage of external vector database queries"""

    # Initialize client
    client = ExternalRAGClient()

    # Example external database configuration
    # NOTE: Replace these with actual credentials for your external vector database
    external_config = {
        "api_key": "your-external-pinecone-api-key",
        "region": "your-external-pinecone-region",
        "index_name": "your-external-index-name",
    }

    print("🔍 Testing connection to external vector database...")

    # Test connection first
    connection_result = client.test_connection(
        api_key=external_config["api_key"],
        region=external_config["region"],
        index_name=external_config["index_name"],
    )

    print(f"Connection test result: {connection_result}")

    if connection_result.get("status") != "connected":
        print("❌ Failed to connect to external vector database.")
        print("Please check your credentials and try again.")
        return

    print("✅ Successfully connected to external vector database!")

    # Example queries
    print("\n🤖 Running example external queries...")

    queries = [
        {
            "question": "What are the main topics discussed in the documents?",
            "mode": "docs_only",
            "description": "General topic exploration",
        },
        {
            "question": "Can you provide a summary of the key findings?",
            "mode": "docs_only",
            "description": "Summary request",
        },
        {
            "question": "What are the latest developments in this field?",
            "mode": "open_internet",
            "description": "Latest developments (with internet access)",
        },
    ]

    for i, query in enumerate(queries, 1):
        print(f"\n  🔍 External Query {i}: {query['description']}")
        print(f"     Question: {query['question']}")
        print(f"     Mode: {query['mode']}")

        result = client.query_external_db(
            question=query["question"],
            api_key=external_config["api_key"],
            region=external_config["region"],
            index_name=external_config["index_name"],
            mode=query["mode"],
            include_sources=True,
        )

        if result.get("answer"):
            print(f"     Answer: {result['answer'][:200]}...")
            print(f"     Confidence: {result.get('confidence_score', 'N/A')}")
            print(f"     Sources: {len(result.get('sources', []))}")
            print(f"     Database: {result.get('vector_db_used', 'Unknown')}")
        else:
            print(f"     ❌ No answer received")

    # Document search example
    print("\n🔍 External document search example:")
    search_result = client.search_external_documents(
        query="machine learning algorithms",
        api_key=external_config["api_key"],
        region=external_config["region"],
        index_name=external_config["index_name"],
        max_results=3,
    )

    if search_result.get("results"):
        print(f"Found {len(search_result['results'])} similar documents:")
        for i, result in enumerate(search_result["results"], 1):
            print(f"  {i}. Source: {result['source']} (Score: {result['score']:.3f})")
            print(f"     Preview: {result['content'][:100]}...")
    else:
        print("No results found")

    print("\n✅ External vector database example completed!")


if __name__ == "__main__":
    main()
