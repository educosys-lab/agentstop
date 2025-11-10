import os
import sys
import json
import time
from typing import List, Dict, Any
from apify_client import ApifyClient
from mcp.server.fastmcp import FastMCP

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.config.config import env
from app.shared.utils.error_util import is_error

mcp = FastMCP("LinkedInTools")

def validate_profile_urls(profile_urls: List[str]) -> List[str]:
    """Validate LinkedIn profile URLs."""
    if not profile_urls:
        raise ValueError("Profile URLs are required")

    valid_urls = []
    for url in profile_urls:
        url = url.strip()
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        valid_urls.append(url)

    if not valid_urls:
        raise ValueError("No valid LinkedIn profile URLs provided")
    return valid_urls

@mcp.tool()
async def linkedin_profile_scrape(profile_urls: List[str], user_id: str) -> str:
    """
    Scrape LinkedIn profiles using the Apify API.
    """
    start_time = time.time()
    debug_info = {"status": "pending", "actor_id": "2SyF0bVxmgGr8IVCZ"}

    try:
        if not isinstance(profile_urls, list):
            raise ValueError("profile_urls must be a list of strings")
        if not isinstance(user_id, str):
            raise ValueError("user_id must be a string")

        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting LinkedIn profile scrape",
                data={"profile_urls": profile_urls, "user_id": user_id},
                trace=["linkedin_profile_scrape"],
            ),
        )

        apify_api_token = os.getenv("APIFY_API_TOKEN")
        if not apify_api_token:
            debug_info["status"] = "failed"
            debug_info["error"] = "Missing Apify API token"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing Apify API token",
                    data={"user_id": user_id},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Missing Apify API token configuration",
                "debug": debug_info
            })

        if not user_id:
            debug_info["status"] = "failed"
            debug_info["error"] = "Missing user_id"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing user_id",
                    data={"profile_urls": profile_urls},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "User ID is required",
                "debug": debug_info
            })

        valid_urls = validate_profile_urls(profile_urls)
        debug_info["actor_input"] = {"profileUrls": valid_urls}

        try:
            client = ApifyClient(apify_api_token)
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to initialize Apify client: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to initialize Apify client",
                    data={"error": str(e), "user_id": user_id},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to initialize Apify client: {str(e)}",
                "debug": debug_info
            })

        log(
            "system",
            "info",
            LogDataArgs(
                message="Calling Apify Actor for LinkedIn scraping",
                data={"actor_id": "2SyF0bVxmgGr8IVCZ", "profile_urls": valid_urls},
                trace=["linkedin_profile_scrape"],
            ),
        )
        try:
            run = client.actor("2SyF0bVxmgGr8IVCZ").call(run_input={"profileUrls": valid_urls})
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Apify Actor call failed: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor call failed",
                    data={"error": str(e), "profile_urls": valid_urls},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor call failed: {str(e)}",
                "debug": debug_info
            })

        if run.get("status") != "SUCCEEDED":
            debug_info["status"] = "failed"
            debug_info["run_status"] = run.get("status")
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor run failed",
                    data={"run_status": run.get("status"), "profile_urls": valid_urls},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor run failed with status: {run.get('status')}",
                "debug": debug_info
            })

        results = []
        try:
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                results.append(item)
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Raw data from Apify for LinkedIn profile scrape",
                    data={"raw_data": results, "profile_urls": valid_urls},
                    trace=["linkedin_profile_scrape"],
                ),
            )
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to fetch dataset items: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to fetch dataset items",
                    data={"error": str(e), "profile_urls": valid_urls},
                    trace=["linkedin_profile_scrape"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to fetch dataset items: {str(e)}",
                "debug": debug_info
            })

        debug_info["status"] = "success"
        debug_info["result_count"] = len(results)
        debug_info["duration"] = time.time() - start_time

        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed LinkedIn profile scrape",
                data={
                    "status": "success",
                    "result_count": len(results),
                    "profile_urls": valid_urls,
                    "total_duration": debug_info["duration"],
                },
                trace=["linkedin_profile_scrape"],
            ),
        )

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"profiles": results}),
            "debug": debug_info
        })

    except Exception as e:
        debug_info["status"] = "failed"
        debug_info["error"] = f"Unexpected error: {str(e)}"
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in linkedin_profile_scrape",
                data={"error": str(e), "duration": time.time() - start_time},
                trace=["linkedin_profile_scrape"],
            ),
        )
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": f"Unexpected error: {str(e)}",
            "debug": debug_info
        })

@mcp.tool()
async def linkedin_posts_search(keyword: str, sort_type: str = None, page_number: int = None, date_filter: str = None, limit: int = None) -> str:
    """
    Search LinkedIn posts by keyword using the Apify API to gather context and inspiration for creating high-quality LinkedIn content.

    Prompt for LLM:
    - Use this function whenever you need to research, gather inspiration, or create LinkedIn posts about any topic.
    - For `keyword`, extract the main topic from user requests for content creation, research, or analysis:
      - Content creation: "Write a post about AI", "Create LinkedIn content for digital marketing" → keyword="AI" or "digital marketing"
      - Research/Trends: "What's trending about machine learning?", "Current trends in cybersecurity" → keyword="machine learning" or "cybersecurity"
      - Analysis: "Analyze recent posts about remote work", "Find posts about leadership" → keyword="remote work" or "leadership"
      - Always extract the **core topic** (not the full sentence).
    
    - For `sort_type`, interpret user intent:
      - "Most relevant", "best posts", "quality content" → "relevance"
      - "Latest", "recent", "new posts" → "date_posted"
      - Default to "relevance" for content creation to get high-quality inspiration.
    
    - For `date_filter`, interpret time-based requests:
      - "Recent posts", "current trends", "this week", "last week" → "past-week"
      - "Last 24 hours", "today's posts", "very recent" → "past-24h"
      - "Last month", "recent month" → "past-month"
      - "All time", "evergreen content", no time specified → default "past-week"
      - For content creation, default to "past-week" for freshness.
    
    - For `limit`, interpret as a positive integer:
      - Content creation/inspiration: 10–20 posts
      - Quick research: 5–10 posts
      - Deep analysis: 20–50 posts
      - Default: 15 for content creation.
    
    - For `page_number`, use when user specifies pagination (e.g., "second page of results") → set to 2, 3, etc.

    Sorting & Output Requirements:
    - Results must always include: activity_id, post_url, text, author (name, headline, profile_url, image_url), stats (total_reactions, comments, shares, reaction breakdown), posted_at, hashtags, content details (type, title/description/url/image if available).
    - Posts must be sorted in **descending order of engagement**:
        1. Posts with the highest reactions, comments, and shares first
        2. Less engaged posts follow in decreasing order
    - When providing **research/trending insights**, engagement metrics must be shown and preserved in descending order in both raw API results and LLM output.
    - When generating a **new LinkedIn post** (e.g., "Write a post about AI"), the final output must **not** include stats, comments, or references to other posts—only the requested post content.

    Usage Examples:
    - "Write a post about AI in 200 words" → linkedin_posts_search(keyword="AI", limit=15, date_filter="past-week") for inspiration, but output is only the generated post without stats.
    - "Create content about digital marketing trends" → linkedin_posts_search(keyword="digital marketing", sort_type="relevance", date_filter="past-month", limit=20) with descending engagement stats for research context.
    - "Find recent posts about leadership" → linkedin_posts_search(keyword="leadership", sort_type="date_posted", date_filter="past-week", limit=10).
    - "What's trending in cybersecurity this week?" → linkedin_posts_search(keyword="cybersecurity", sort_type="relevance", date_filter="past-week", limit=15) with posts shown by engagement (highest first).
    """

    start_time = time.time()
    debug_info = {"status": "pending", "actor_id": "5QnEH5N71IK2mFLrP"}

    try:
        if not isinstance(keyword, str):
            raise ValueError("keyword must be a string")
        if not keyword.strip():
            raise ValueError("keyword cannot be empty")
        if sort_type is not None and not isinstance(sort_type, str):
            raise ValueError("sort_type must be a string")
        if page_number is not None and not isinstance(page_number, int):
            raise ValueError("page_number must be an integer")
        if date_filter is not None and not isinstance(date_filter, str):
            raise ValueError("date_filter must be a string")
        if limit is not None and not isinstance(limit, int):
            raise ValueError("limit must be an integer")

        # Set default values if not provided
        sort_type = sort_type or "relevance"
        page_number = page_number or 1
        date_filter = date_filter or "past-week"
        limit = limit or 5

        valid_sort_types = ["relevance", "date_posted"]
        if sort_type not in valid_sort_types:
            raise ValueError(f"sort_type must be one of {valid_sort_types}")
        
        valid_date_filters = ["", "past-24h", "past-week", "past-month"]
        if date_filter not in valid_date_filters:
            raise ValueError(f"date_filter must be one of {valid_date_filters}")
        
        if page_number < 1:
            raise ValueError("page_number must be at least 1")
        
        if limit < 1:
            raise ValueError("limit must be at least 1")

        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting LinkedIn posts search",
                data={
                    "keyword": keyword,
                    "sort_type": sort_type,
                    "page_number": page_number,
                    "date_filter": date_filter,
                    "limit": limit
                },
                trace=["linkedin_posts_search"],
            ),
        )

        apify_api_token = os.getenv("APIFY_API_TOKEN")
        if not apify_api_token:
            debug_info["status"] = "failed"
            debug_info["error"] = "Missing Apify API token"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing Apify API token",
                    data={"keyword": keyword},
                    trace=["linkedin_posts_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Missing Apify API token configuration",
                "debug": debug_info
            })

        run_input = {
            "keyword": keyword.strip(),
            "sort_type": sort_type,
            "page_number": page_number,
            "date_filter": date_filter,
            "limit": limit
        }
        debug_info["actor_input"] = run_input

        try:
            client = ApifyClient(apify_api_token)
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to initialize Apify client: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to initialize Apify client",
                    data={"error": str(e), "keyword": keyword},
                    trace=["linkedin_posts_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to initialize Apify client: {str(e)}",
                "debug": debug_info
            })

        log(
            "system",
            "info",
            LogDataArgs(
                message="Calling Apify Actor for LinkedIn posts search",
                data={"actor_id": "5QnEH5N71IK2mFLrP", "keyword": keyword, "run_input": run_input},
                trace=["linkedin_posts_search"],
            ),
        )
        try:
            run = client.actor("5QnEH5N71IK2mFLrP").call(run_input=run_input)
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Apify Actor call failed: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor call failed",
                    data={"error": str(e), "keyword": keyword, "run_input": run_input},
                    trace=["linkedin_posts_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor call failed: {str(e)}",
                "debug": debug_info
            })

        if run.get("status") != "SUCCEEDED":
            debug_info["status"] = "failed"
            debug_info["run_status"] = run.get("status")
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor run failed",
                    data={"run_status": run.get("status"), "keyword": keyword, "run_input": run_input},
                    trace=["linkedin_posts_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor run failed with status: {run.get('status')}",
                "debug": debug_info
            })

        results = []
        try:
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                results.append(item)
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Raw data from Apify for LinkedIn posts search",
                    data={"raw_data": results, "keyword": keyword, "run_input": run_input},
                    trace=["linkedin_posts_search"],
                ),
            )
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to fetch dataset items: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to fetch dataset items",
                    data={"error": str(e), "keyword": keyword, "run_input": run_input},
                    trace=["linkedin_posts_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to fetch dataset items: {str(e)}",
                "debug": debug_info
            })

        debug_info["status"] = "success"
        debug_info["result_count"] = len(results)
        debug_info["duration"] = time.time() - start_time

        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed LinkedIn posts search",
                data={
                    "status": "success",
                    "result_count": len(results),
                    "keyword": keyword,
                    "run_input": run_input,
                    "total_duration": debug_info["duration"],
                },
                trace=["linkedin_posts_search"],
            ),
        )

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"posts": results}),
            "debug": debug_info
        })

    except Exception as e:
        debug_info["status"] = "failed"
        debug_info["error"] = f"Unexpected error: {str(e)}"
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in linkedin_posts_search",
                data={"error": str(e), "keyword": keyword, "duration": time.time() - start_time},
                trace=["linkedin_posts_search"],
            ),
        )
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": f"Unexpected error: {str(e)}",
            "debug": debug_info
        })

@mcp.tool()
async def linkedin_jobs_search(title: str, location: str = None, companyName: List[str] = None, companyId: List[str] = None, publishedAt: str = None, rows: int = None) -> str:
    """
    Search LinkedIn jobs using the Apify API.

    Prompt for LLM:
    - For `publishedAt`, interpret user input as follows:
      - If the user mentions "past week", "last week", "previous week", or similar phrases, set `publishedAt` to "r604800".
      - If the user mentions "last 24 hours", "past 24 hours", "last 24 hrs", or similar phrases, set `publishedAt` to "r86400".
      - If the user mentions "last month", "past month", "previous month", or similar phrases, set `publishedAt` to "r2592000".
      - If no publishedAt is provided or the input doesn't match the above, default to "r604800".
    """
    start_time = time.time()
    debug_info = {"status": "pending", "actor_id": "BHzefUZlZRKWxkTck"}

    try:
        if not isinstance(title, str):
            raise ValueError("title must be a string")
        if not title.strip():
            raise ValueError("title cannot be empty")
        if location is not None and not isinstance(location, str):
            raise ValueError("location must be a string")
        if companyName is not None and not isinstance(companyName, list):
            raise ValueError("companyName must be a list of strings")
        if companyId is not None and not isinstance(companyId, list):
            raise ValueError("companyId must be a list of strings")
        if publishedAt is not None and not isinstance(publishedAt, str):
            raise ValueError("publishedAt must be a string")
        if rows is not None and not isinstance(rows, int):
            raise ValueError("rows must be an integer")

        # Set default values if not provided
        location = location or ""
        companyName = companyName or []
        companyId = companyId or []
        publishedAt = publishedAt or "r604800"  # past week
        rows = rows or 5

        if rows is not None and rows < 1:
            raise ValueError("rows must be at least 1")

        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting LinkedIn jobs search",
                data={
                    "title": title,
                    "location": location,
                    "companyName": companyName,
                    "companyId": companyId,
                    "publishedAt": publishedAt,
                    "rows": rows
                },
                trace=["linkedin_jobs_search"],
            ),
        )

        apify_api_token = os.getenv("APIFY_API_TOKEN")
        if not apify_api_token:
            debug_info["status"] = "failed"
            debug_info["error"] = "Missing Apify API token"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing Apify API token",
                    data={"title": title},
                    trace=["linkedin_jobs_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Missing Apify API token configuration",
                "debug": debug_info
            })

        run_input = {
            "title": title.strip(),
            "location": location,
            "companyName": companyName,
            "companyId": companyId,
            "publishedAt": publishedAt,
            "rows": rows,
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"],
            }
        }
        debug_info["actor_input"] = run_input

        try:
            client = ApifyClient(apify_api_token)
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to initialize Apify client: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to initialize Apify client",
                    data={"error": str(e), "title": title},
                    trace=["linkedin_jobs_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to initialize Apify client: {str(e)}",
                "debug": debug_info
            })

        log(
            "system",
            "info",
            LogDataArgs(
                message="Calling Apify Actor for LinkedIn jobs search",
                data={"actor_id": "BHzefUZlZRKWxkTck", "title": title, "run_input": run_input},
                trace=["linkedin_jobs_search"],
            ),
        )
        try:
            run = client.actor("BHzefUZlZRKWxkTck").call(run_input=run_input)
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Apify Actor call failed: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor call failed",
                    data={"error": str(e), "title": title, "run_input": run_input},
                    trace=["linkedin_jobs_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor call failed: {str(e)}",
                "debug": debug_info
            })

        if run.get("status") != "SUCCEEDED":
            debug_info["status"] = "failed"
            debug_info["run_status"] = run.get("status")
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Apify Actor run failed",
                    data={"run_status": run.get("status"), "title": title, "run_input": run_input},
                    trace=["linkedin_jobs_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Apify Actor run failed with status: {run.get('status')}",
                "debug": debug_info
            })

        results = []
        try:
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                results.append(item)
            log(
                "system",
                "info",
                LogDataArgs(
                    message="Raw data from Apify for LinkedIn jobs search",
                    data={"raw_data": results, "title": title, "run_input": run_input},
                    trace=["linkedin_jobs_search"],
                ),
            )
        except Exception as e:
            debug_info["status"] = "failed"
            debug_info["error"] = f"Failed to fetch dataset items: {str(e)}"
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to fetch dataset items",
                    data={"error": str(e), "title": title, "run_input": run_input},
                    trace=["linkedin_jobs_search"],
                ),
            )
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Failed to fetch dataset items: {str(e)}",
                "debug": debug_info
            })

        debug_info["status"] = "success"
        debug_info["result_count"] = len(results)
        debug_info["duration"] = time.time() - start_time

        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed LinkedIn jobs search",
                data={
                    "status": "success",
                    "result_count": len(results),
                    "title": title,
                    "run_input": run_input,
                    "total_duration": debug_info["duration"],
                },
                trace=["linkedin_jobs_search"],
            ),
        )

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"jobs": results}),
            "debug": debug_info
        })

    except Exception as e:
        debug_info["status"] = "failed"
        debug_info["error"] = f"Unexpected error: {str(e)}"
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in linkedin_jobs_search",
                data={"error": str(e), "title": title, "duration": time.time() - start_time},
                trace=["linkedin_jobs_search"],
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
