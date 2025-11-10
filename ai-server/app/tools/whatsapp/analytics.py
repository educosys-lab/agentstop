import os
import sys
import json
from mcp.server.fastmcp import FastMCP

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.mongodb.campaign.campaign_type import (
    GetCampaignAnalyticsByNameArgs,
)
from app.mongodb.campaign.campaign_service import CampaignService
from app.shared.utils.error_util import is_error


mcp = FastMCP("WhatsAppTools")


@mcp.tool()
async def whatsapp_campaign_analytics(user_id: str, campaign_name: str) -> str:
    try:
        if not user_id or not campaign_name:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "User ID and campaign name are required to retrieve campaign analytics.",
                }
            )

        analytics = await CampaignService().get_campaign_analytics_by_name(
            GetCampaignAnalyticsByNameArgs(campaign_name=campaign_name, user_id=user_id)
        )

        if is_error(analytics.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No campaign found for campaign_name {campaign_name} and user_id {user_id}.",
                }
            )

        assert analytics.data is not None
        analytics = analytics.data

        total_messages = analytics.get("total_messages", 0)
        status_counts = analytics.get("status_counts", {})
        messages_by_date = analytics.get("messages_by_date", {})

        summary = (
            f"Analytics for campaign {campaign_name}: "
            f"Total messages: {total_messages}, "
            f"Sent: {status_counts['sent']}, "
            f"Delivered: {status_counts['delivered']}, "
            f"Read: {status_counts['read']}, "
            f"Failed: {status_counts['failed']}, "
            f"Unknown: {status_counts['unknown']}, "
            f"Messages by date: {json.dumps(messages_by_date)}"
        )

        return json.dumps({"status": "success", "type": "text", "data": summary, "details": analytics})

    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


if __name__ == "__main__":
    mcp.run(transport="stdio")
