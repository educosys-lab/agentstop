from mcp.server.fastmcp import FastMCP
import json
import requests
import os

mcp = FastMCP("DiscordTools")


@mcp.tool()
async def discord_send(input_data: str) -> str:
    """Send a message to a Discord channel using a bot token and channel ID."""
    try:
        # Use input_data as the message content directly
        content = input_data if input_data else "This message was sent automatically."

        bot_token = os.getenv("BOT_TOKEN")
        channel_id = os.getenv("CHANNEL_ID")

        # Validate inputs
        if not channel_id:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Channel ID is missing in configuration or environment"
            })

        if not bot_token:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Bot token is missing in configuration or environment"
            })

        # Prepare headers
        headers = {
            "Authorization": f"Bot {bot_token}",
            "Content-Type": "application/json"
        }

        # Prepare payload
        payload = {"content": content}

        # Send request to Discord API
        response = requests.post(
            f"https://discord.com/api/v10/channels/{channel_id}/messages",
            json=payload,
            headers=headers
        )

        # Check response
        response.raise_for_status()
        response_data = response.json()

        # Prepare success result
        result = {
            "messageId": response_data["id"],
            "channelId": response_data["channel_id"]
        }

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps(result)
        })

    except requests.RequestException as e:
        # Handle HTTP request errors
        error_details = e.response.json() if e.response else {"message": str(e)}
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": error_details.get("message", str(e))
        })
    except Exception as e:
        # Handle unexpected errors
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": str(e)
        })


@mcp.tool()
async def discord_read(input_data: str) -> str:
    """Read messages from a Discord channel using a bot token and channel ID."""
    try:
        # Default limit to 50 messages
        limit = 50

        if input_data:
            try:
                parsed_input = json.loads(input_data)
                if isinstance(parsed_input, dict) and "limit" in parsed_input:
                    # Discord API max limit is 100
                    limit = min(int(parsed_input["limit"]), 100)

            except json.JSONDecodeError:
                # If input_data is not valid JSON, ignore it and use default limit
                pass

        # Retrieve BOT_TOKEN and CHANNEL_ID from environment variables set by MultiServerMCPClient
        bot_token = os.getenv("BOT_TOKEN")
        channel_id = os.getenv("CHANNEL_ID")

        # Validate inputs
        if not channel_id:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Channel ID is missing in configuration or environment"
            })

        if not bot_token:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Bot token is missing in configuration or environment"
            })

        # Prepare headers
        headers = {
            "Authorization": f"Bot {bot_token}",
            "Content-Type": "application/json"
        }

        # Send request to Discord API
        response = requests.get(
            f"https://discord.com/api/v10/channels/{channel_id}/messages",
            params={"limit": limit},
            headers=headers
        )

        # Check response
        response.raise_for_status()
        response_data = response.json()

        # Process messages
        messages = [
            {
                "id": msg["id"],
                "content": msg["content"],
                "author": msg["author"]["username"],
                "timestamp": msg["timestamp"]
            }
            for msg in response_data
        ]

        return json.dumps({
            "status": "success",
            "type": "text",
            "data": json.dumps({"messages": messages})
        })

    except requests.RequestException as e:
        # Handle HTTP request errors
        error_details = e.response.json() if e.response else {
            "message": str(e)}
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": error_details.get("message", str(e))
        })

    except Exception as e:
        # Handle unexpected errors
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": str(e)
        })

if __name__ == "__main__":
    mcp.run(transport="stdio")
