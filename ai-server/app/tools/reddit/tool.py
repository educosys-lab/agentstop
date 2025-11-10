import os
import sys
import json
import time
import requests
from typing import List, Dict, Any
from urllib.parse import quote
from mcp.server.fastmcp import FastMCP

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.config.config import env
from app.shared.utils.error_util import is_error

mcp = FastMCP("RedditTools")

def make_request_with_retry(url: str, headers: Dict[str, str], retries: int = 3, backoff: int = 2) -> requests.Response:
    """Make an HTTP GET request with retries and exponential backoff."""
    attempt = 1
    while attempt <= retries:
        try:
            log(
                "system",
                "info",
                LogDataArgs(
                    message=f"Attempting request (attempt {attempt}/{retries})",
                    data={"url": url},
                    trace=["make_request_with_retry"],
                ),
            )
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            log(
                "system",
                "warning",
                LogDataArgs(
                    message=f"Request failed (attempt {attempt}/{retries})",
                    data={"url": url, "error": str(e), "status_code": getattr(e.response, "status_code", None)},
                    trace=["make_request_with_retry"],
                ),
            )
            if attempt == retries or (e.response and e.response.status_code not in [429, 503]):
                raise
            time.sleep(backoff ** attempt)
            attempt += 1
    raise requests.RequestException("Max retries exceeded")

@mcp.tool()
async def reddit_trends_search(query: str = None, maxItems: int = None) -> str:
    """
    Fetch trending Reddit posts using Reddit's direct API. If a query is provided, fetches trending posts for the specific topic; otherwise, fetches general trending posts from r/popular.

    Prompt for LLM:
    - Use this function for all Reddit-related queries involving post content, trending topics, or research context.
    - For `query`, interpret user input as follows:
      - If the user asks to "write a post about [topic]", "create content for [topic]", "research [topic]", or similar content creation/research requests (e.g., "Write a post for AI in 200 words", "Give me context about AI trends"), use the topic as the query to fetch relevant trending posts for context.
      - If the user provides a specific topic or keyword (e.g., "AI", "GenAI", "machine learning"), use it as the search query for trending posts.
      - If no query is provided or the user asks for general trending content, default to fetching popular posts from r/popular.
    - For `maxItems`, interpret as a positive integer. Default to 10 if not provided. For content creation/research, consider using 15–20 to get comprehensive context.

    Sorting & Output Requirements:
    - Results must always include: title, url, subreddit, score, created_utc, post_id, selftext, num_comments
    - Posts must be sorted strictly by engagement in **descending order**:
        1. Posts with the highest score (upvotes) and most comments appear first
        2. Less engaged posts follow in decreasing order
    - The final LLM-generated response should also preserve this descending order when presenting posts, ensuring the most engaged content is always shown first.

    Usage Examples:
    - "Write a post for AI in 200 words" → reddit_trends_search(query="AI", maxItems=15) to get AI trends context sorted by highest engagement
    - "Give me trending topics about machine learning" → reddit_trends_search(query="machine learning", maxItems=10) for top posts ordered by score and comments
    - "What's popular on Reddit today?" → reddit_trends_search(maxItems=10) for general trends with most engaged posts first
    - "Research current AI developments" → reddit_trends_search(query="AI developments", maxItems=20) for comprehensive context sorted by engagement
    """
    
    start_time = time.time()
    debug_info = {"status": "pending"}

    try:
        if query is not None and not isinstance(query, str):
            raise ValueError("query must be a string")
        if maxItems is not None and not isinstance(maxItems, int):
            raise ValueError("maxItems must be an integer")

        # Set default values if not provided
        maxItems = maxItems or 10

        if maxItems < 1:
            raise ValueError("maxItems must be at least 1")

        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting Reddit trends search",
                data={"query": query, "maxItems": maxItems},
                trace=["reddit_trends_search"],
            ),
        )

        # Construct Reddit API URL
        if query:
            url = f"https://www.reddit.com/search.json?q={quote(query.strip())}&sort=hot&t=week&limit={maxItems}"
        else:
            url = f"https://www.reddit.com/r/popular.json?limit={maxItems}"

        headers = {"User-Agent": "my-reddit-client/0.1"}
        debug_info["request_url"] = url
        debug_info["headers"] = headers

        log(
            "system",
            "info",
            LogDataArgs(
                message="Calling Reddit API for trends search",
                data={"url": url, "query": query},
                trace=["reddit_trends_search"],
            ),
        )

        try:
            response = make_request_with_retry(url, headers)

        except requests.RequestException as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Reddit API call failed: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Reddit API call failed",
                    data={"error": str(e), "url": url, "query": query},
                    trace=["reddit_trends_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Reddit API call failed: {str(e)}",
                "debug": debug_info
            })

        try:
            data = response.json()
            if "data" not in data or "children" not in data["data"]:
                raise ValueError("Invalid response format from Reddit API")
            results = [
                {
                    "title": item["data"].get("title"),
                    "url": item["data"].get("permalink"),
                    "subreddit": item["data"].get("subreddit"),
                    "score": item["data"].get("score"),
                    "created_utc": item["data"].get("created_utc"),
                    "post_id": item["data"].get("id"),
                    "selftext": item["data"].get("selftext"),
                    "num_comments": item["data"].get("num_comments"),
                } for item in data["data"]["children"]
            ]
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Raw data from Reddit API for trends search",
                    data={"raw_data": results, "url": url, "query": query},
                    trace=["reddit_trends_search"],
                ),
            )
        except (ValueError, KeyError) as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to parse Reddit API response: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to parse Reddit API response",
                    data={"error": str(e), "url": url, "query": query, "response_text": response.text[:1000]},
                    trace=["reddit_trends_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to parse Reddit API response: {str(e)}",
                "debug": debug_info
            })

        debug_info["status"] = "success"
        debug_info["result_count"] = len(results)
        debug_info["duration"] = time.time() - start_time

        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed Reddit trends search",
                data={
                    "status": "success",
                    "result_count": len(results),
                    "url": url,
                    "query": query,
                    "total_duration": debug_info["duration"],
                },
                trace=["reddit_trends_search"],
            ),
        )

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"trends": results}),
            "debug": debug_info
        })

    except Exception as e:
        debug_info["status"] = "failed"
        debug_info["error"] = f"Unexpected error: {str(e)}"
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in reddit_trends_search",
                data={"error": str(e), "query": query, "duration": time.time() - start_time},
                trace=["reddit_trends_search"],
            ),
        )
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": f"Unexpected error: {str(e)}",
            "debug": debug_info
        })

@mcp.tool()
async def reddit_post_details(post_url: str) -> str:
    """
    Fetch detailed data for a specific Reddit post using its URL by appending .json.

    Output Requirements:
    - Returns complete post data including 'score' (upvotes) and 'num_comments'
    - Contains all key fields: title, url, subreddit, score, created_utc, post_id, selftext, num_comments
    - Provides full engagement statistics for the specific post
    
    Usage:
    - For analyzing individual post performance and engagement
    - When user requests details about a specific Reddit post
    - To get complete context for a single post including full text and comment count
    """
    start_time = time.time()
    debug_info = {"status": "pending"}

    try:
        if not isinstance(post_url, str):
            raise ValueError("post_url must be a string")
        if not post_url.strip():
            raise ValueError("post_url cannot be empty")

        # Ensure post_url ends with .json
        if not post_url.endswith(".json"):
            post_url = post_url.rstrip("/") + ".json"

        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting Reddit post details fetch",
                data={"post_url": post_url},
                trace=["reddit_post_details"],
            ),
        )

        headers = {"User-Agent": "my-reddit-client/0.1"}
        debug_info["request_url"] = post_url
        debug_info["headers"] = headers

        log(
            "system",
            "info",
            LogDataArgs(
                message="Calling Reddit API for post details",
                data={"post_url": post_url, "headers": headers},
                trace=["reddit_post_details"],
            ),
        )

        try:
            response = make_request_with_retry(post_url, headers)
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Reddit API response received",
                    data={
                        "post_url": post_url,
                        "status_code": response.status_code,
                        "response_headers": dict(response.headers),
                        "response_content_length": len(response.text),
                    },
                    trace=["reddit_post_details"],
                ),
            )
        except requests.RequestException as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Reddit API call failed: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Reddit API call failed",
                    data={"error": str(e), "post_url": post_url, "status_code": getattr(e.response, "status_code", None)},
                    trace=["reddit_post_details"],
                ),
            )
            headers = {"User-Agent": "Mozilla/5.0"}
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Retrying with fallback User-Agent",
                    data={"post_url": post_url, "headers": headers},
                    trace=["reddit_post_details"],
                ),
            )
            try:
                response = make_request_with_retry(post_url, headers)
                log(
                    "system",
                    "info",
                    LogDataArgs(
                        message="Reddit API response received with fallback User-Agent",
                        data={
                            "post_url": post_url,
                            "status_code": response.status_code,
                            "response_headers": dict(response.headers),
                            "response_content_length": len(response.text),
                        },
                        trace=["reddit_post_details"],
                    ),
                )
            except requests.RequestException as e:
                debug_info["status"] = "failed"
                debug_info["error"] = f"Reddit API call failed with fallback User-Agent: {str(e)}"
                log(
                    "system",
                    "error",
                    LogDataArgs(
                        message="Reddit API call failed with fallback User-Agent",
                        data={"error": str(e), "post_url": post_url, "status_code": getattr(e.response, "status_code", None)},
                        trace=["reddit_post_details"],
                    ),
                )
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": f"Reddit API call failed: {str(e)}",
                    "debug": debug_info
                })

        try:
            data = response.json()
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Raw data from Reddit API for post details",
                    data={"post_url": post_url, "raw_data": json.dumps(data, indent=2)},  # Truncate to 2000 chars
                    trace=["reddit_post_details"],
                ),
            )
            if isinstance(data, list) and len(data) > 0 and "data" in data[0] and "children" in data[0]["data"]:
                post_details = data[0]["data"]["children"][0]["data"]
                result = {
                    "title": post_details.get("title"),
                    "url": post_details.get("permalink"),
                    "subreddit": post_details.get("subreddit"),
                    "score": post_details.get("score"),
                    "created_utc": post_details.get("created_utc"),
                    "post_id": post_details.get("id"),
                    "selftext": post_details.get("selftext"),
                    "num_comments": post_details.get("num_comments"),
                }
                log(
                    "system",
                    "info",
                    LogDataArgs(
                        message="Post details fetched",
                        data={"post_url": post_url, "post_id": result["post_id"]},
                        trace=["reddit_post_details"],
                    ),
                )
            else:
                raise ValueError("Invalid response format from Reddit API")
        except (ValueError, KeyError) as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to parse Reddit API response: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to parse Reddit API response",
                    data={"error": str(e), "post_url": post_url, "response_text": response.text[:1000]},
                    trace=["reddit_post_details"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to parse Reddit API response: {str(e)}",
                "debug": debug_info
            })

        debug_info["status"] = "success"
        debug_info["duration"] = time.time() - start_time

        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed Reddit post details fetch",
                data={
                    "status": "success",
                    "post_url": post_url,
                    "post_id": result["post_id"],
                    "total_duration": debug_info["duration"],
                },
                trace=["reddit_post_details"],
            ),
        )

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"post": result}),
            "debug": debug_info
        })

    except Exception as e:
        debug_info["status"] = "failed"
        debug_info["error"] = f"Unexpected error: {str(e)}"
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in reddit_post_details",
                data={"error": str(e), "post_url": post_url, "duration": time.time() - start_time},
                trace=["reddit_post_details"],
            ),
        )
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": f"Unexpected error: {str(e)}",
            "debug": debug_info
        })

if __name__ == "__main__":
    mcp.run(transport="stdio")
