import os
import sys
import json
from motor.motor_asyncio import AsyncIOMotorClient
import requests
from typing import Dict, Any, List
import re
import time
from mcp.server.fastmcp import FastMCP
import uuid
import asyncio
from ratelimit import limits, sleep_and_retry
from datetime import datetime, timezone
from urllib.parse import unquote

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.mongodb.user.user_service import UserService
from app.mongodb.user.user_type import GetUserFileDetailsArgs
from app.mongodb.campaign.campaign_type import (
    CampaignMessageModel,
    DeleteCampaignByNameArgs,
    FindOrCreateCampaignArgs,
    GetCampaignAnalyticsByNameArgs,
    GetCampaignByCampaignNameArgs,
    UpdateCampaignByNameArgs,
    MessageDetail,
)
from app.mongodb.campaign.campaign_service import CampaignService
from app.shared.aws.aws_s3 import read_s3_file
from app.shared.config.config import env
from app.shared.utils.error_util import is_error
from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs


mcp = FastMCP("WhatsAppTools")

client = AsyncIOMotorClient(env.MONGODB_URI)
db = client[env.MONGODB_NAME]
messages_collection = db["campaignmessages"]

CALLS = 10
PERIOD = 1
BATCH_SIZE = 25


def validate_phone_numbers(phone_numbers_str: str) -> List[str]:
    if not phone_numbers_str:
        raise ValueError("Phone numbers are required")

    phone_numbers = [
        f"+{num.strip()}" if not num.strip().startswith("+") else num.strip()
        for num in phone_numbers_str.replace(" , ", ",").replace("_", ",").split(",")
        if num.strip() and num.strip().replace("+", "").isdigit()
    ]

    if not phone_numbers:
        raise ValueError("No valid phone numbers provided")
    return phone_numbers


def get_template_details(
    waba_id: str,
    whatsapp_access_token: str,
    template_name: str,
    user_id: str | None = None,
    image_name: str | None = None,
    image_url: str | None = None,
) -> Dict[str, Any]:
    start_time = time.time()
    headers = {"Authorization": f"Bearer {whatsapp_access_token}", "Content-Type": "application/json"}
    url = f"https://graph.facebook.com/v20.0/{waba_id}/message_templates"
    debug_info = {"url": url, "status": "failed"}

    try:
        # log(
        #     "system",
        #     "info",
        #     LogDataArgs(
        #         message="Fetching template details",
        #         data={
        #             "waba_id": waba_id,
        #             "template_name": template_name,
        #             "user_id": user_id,
        #             "image_name": image_name,
        #             "image_url": image_url,
        #             "url": url,
        #         },
        #         trace=["get_template_details"],
        #     ),
        # )
        response = requests.get(url, headers=headers, params={"fields": "name,components,language"})
        response.raise_for_status()
        api_response = response.json()

        debug_info["status"] = "success"
        debug_info["raw_response"] = api_response
        templates = api_response.get("data", [])

        for template in templates:
            if template.get("name") == template_name:
                components = template.get("components", [])
                language = template.get("language", "")
                debug_info["all_components"] = components
                debug_info["language"] = language
                body_component: Any = next((c for c in components if c.get("type").upper() == "BODY"), {})
                header_component: Any = next((c for c in components if c.get("type").upper() == "HEADER"), {})
                text = body_component.get("text", "")
                header_format = header_component.get("format", "")

                # Set image URL for IMAGE header
                header_handle: Any = []
                if header_format.upper() == "IMAGE":
                    if image_url:
                        header_handle = [image_url]
                        # log(
                        #     "system",
                        #     "info",
                        #     LogDataArgs(
                        #         message="Using user-provided image URL for template header",
                        #         data={"template_name": template_name, "image_url": image_url},
                        #         trace=["get_template_details"],
                        #     ),
                        # )
                    elif image_name and user_id:
                        s3_image_url = (
                            f"https://agentstop-prod.s3.ap-south-1.amazonaws.com/users/{user_id}/{image_name}"
                        )
                        header_handle = [s3_image_url]
                        # log(
                        #     "system",
                        #     "info",
                        #     LogDataArgs(
                        #         message="Constructed S3 image URL for template header",
                        #         data={
                        #             "template_name": template_name,
                        #             "image_name": image_name,
                        #             "user_id": user_id,
                        #             "s3_image_url": s3_image_url,
                        #         },
                        #         trace=["get_template_details"],
                        #     ),
                        # )
                    else:
                        log(
                            "system",
                            "warn",
                            LogDataArgs(
                                message="No image URL or image name provided for IMAGE header",
                                data={
                                    "template_name": template_name,
                                    "user_id": user_id,
                                    "image_name": image_name,
                                    "image_url": image_url,
                                },
                                trace=["get_template_details"],
                            ),
                        )

                debug_info["body_component"] = body_component
                debug_info["header_component"] = header_component
                debug_info["text"] = text
                debug_info["header_format"] = header_format
                debug_info["header_handle"] = header_handle
                param_count = len(re.findall(r"\{\{(\d+)\}\}", text))

                if param_count > 0:
                    debug_info["param_source"] = "placeholders"
                elif "example" in body_component and "body_text" in body_component["example"]:
                    example_params = body_component["example"]["body_text"][0]
                    param_count = len(example_params) if example_params else 0
                    debug_info["param_source"] = "example"
                else:
                    parameters = body_component.get("parameters", [])
                    param_count = len(parameters)
                    debug_info["param_source"] = "parameters"

                # log(
                #     "system",
                #     "info",
                #     LogDataArgs(
                #         message="Template details retrieved",
                #         data={
                #             "template_name": template_name,
                #             "param_count": param_count,
                #             "language": language,
                #             "header_format": header_format,
                #             "header_handle": header_handle,
                #             "duration": time.time() - start_time,
                #         },
                #         trace=["get_template_details"],
                #     ),
                # )
                return {
                    "count": param_count,
                    "language": language,
                    "header_format": header_format,
                    "header_handle": header_handle,
                    "debug": debug_info,
                }

        log(
            "system",
            "error",
            LogDataArgs(
                message="Template not found",
                data={"template_name": template_name, "duration": time.time() - start_time},
                trace=["get_template_details"],
            ),
        )
        raise ValueError(f"Template {template_name} not found")
    except requests.RequestException as e:
        debug_info["error"] = str(e)
        debug_info["response_text"] = getattr(e.response, "text", "No response")
        log(
            "system",
            "error",
            LogDataArgs(
                message="Failed to fetch template details",
                data={
                    "template_name": template_name,
                    "error": str(e),
                    "response_text": debug_info["response_text"],
                    "duration": time.time() - start_time,
                },
                trace=["get_template_details"],
            ),
        )
        return {"count": 0, "language": None, "header_format": None, "header_handle": [], "debug": debug_info}


def validate_template_parameters(parameters: list, expected_count: int, debug_info: Dict[str, Any]) -> List[str]:
    if parameters is None:
        if expected_count > 0:
            raise ValueError(f"Template parameters are required, debug: {json.dumps(debug_info)}")

        return []
    if not isinstance(parameters, list):
        raise ValueError(f"Template parameters must be a list, debug: {json.dumps(debug_info)}")
    if not all(isinstance(param, str) for param in parameters):
        raise ValueError(f"All template parameters must be strings, debug: {json.dumps(debug_info)}")
    if len(parameters) != expected_count:
        raise ValueError(
            f"Template parameters must match the expected count of {expected_count}, debug: {json.dumps(debug_info)}"
        )

    return parameters


@sleep_and_retry
@limits(calls=CALLS, period=PERIOD)
async def send_message_batch(
    phone_numbers: List[str],
    template_name: str,
    language_code: str,
    header_format: str,
    header_handle: List[str],
    template_params: List[str],
    template_text: str,
    headers: Dict[str, str],
    phone_number_id: str,
    campaign_id: str,
    campaign_name: str,
    user_id: str,
) -> tuple[List[Dict], List[Dict], Dict[str, List[MessageDetail]]]:
    successful_sends = []
    failed_sends = []
    new_messages_by_mobile: Dict[str, List[MessageDetail]] = {}

    for phone_number in phone_numbers:
        message_content = template_text
        if template_params:
            for i, param in enumerate(template_params, 1):
                message_content = message_content.replace(f"{{{{{i}}}}}", param)
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone_number,
            "type": "template",
            "template": {"name": template_name, "language": {"code": language_code}},
        }

        components = []
        if template_params:
            components.append(
                {"type": "body", "parameters": [{"type": "text", "text": param} for param in template_params]}
            )
        if header_format.upper() == "IMAGE" and header_handle:
            components.append(
                {"type": "header", "parameters": [{"type": "image", "image": {"link": header_handle[0]}}]}
            )
        if components:
            payload["template"]["components"] = components

        try:
            # log(
            #     "system",
            #     "info",
            #     LogDataArgs(
            #         message="Sending WhatsApp message",
            #         data={"phone_number": phone_number, "template_name": template_name, "payload": payload},
            #         trace=["whatsapp_send"],
            #     ),
            # )
            response = requests.post(
                f"https://graph.facebook.com/v20.0/{phone_number_id}/messages", json=payload, headers=headers
            )

            response.raise_for_status()
            response_data = response.json()
            message_id = response_data["messages"][0]["id"]

            new_message = MessageDetail(
                messageId=message_id, messageContent=message_content, timestamp=int(time.time()), status="sent"
            )

            successful_sends.append(
                {"mobile": phone_number, "messageId": message_id, "id": campaign_id, "campaignName": campaign_name}
            )

            if phone_number not in new_messages_by_mobile:
                new_messages_by_mobile[phone_number] = []
            new_messages_by_mobile[phone_number].append(new_message)

            # log(
            #     "system",
            #     "info",
            #     LogDataArgs(
            #         message="WhatsApp message sent successfully",
            #         data={"phone_number": phone_number, "message_id": message_id, "campaign_id": campaign_id},
            #         trace=["whatsapp_send"],
            #     ),
            # )

        except requests.RequestException as e:
            error_details = response.json() if "response" in locals() else {"message": str(e)}
            failed_sends.append(
                {
                    "mobile": phone_number,
                    "error": error_details.get("message", str(e)),
                    "id": campaign_id,
                    "campaignName": campaign_name,
                }
            )
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to send WhatsApp message",
                    data={
                        "phone_number": phone_number,
                        "error": error_details.get("message", str(e)),
                        "payload": payload,
                    },
                    trace=["whatsapp_send"],
                ),
            )

    return successful_sends, failed_sends, new_messages_by_mobile


@mcp.tool()
async def whatsapp_send(
    input_data: str,
    phone_numbers: str,
    template_parameters: list,
    user_id: str,
    campaign_name: str,
    image_name: str | None = None,
    image_url: str | None = None,
) -> str:
    start_time = time.time()
    template_name = input_data if input_data else os.getenv("TEMPLATE_NAME")
    campaign_name = campaign_name or os.getenv(
        "CAMPAIGN_NAME", f"campaign_{str(uuid.uuid4())[:8]}" if len(phone_numbers.split(",")) == 1 else ""
    )

    try:
        # log(
        #     "system",
        #     "info",
        #     LogDataArgs(
        #         message="Starting WhatsApp send",
        #         data={
        #             "template_name": template_name,
        #             "phone_numbers": phone_numbers,
        #             "campaign_name": campaign_name,
        #             "user_id": user_id,
        #             "image_name": image_name,
        #             "image_url": image_url,
        #         },
        #         trace=["whatsapp_send"],
        #     ),
        # )
        whatsapp_access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        waba_id = os.getenv("WABA_ID")
        phone_number_id = os.getenv("PHONE_NUMBER_ID")

        if not waba_id or not phone_number_id or not whatsapp_access_token or not template_name or not user_id:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing WhatsApp configuration or parameters",
                    data={
                        "waba_id": waba_id,
                        "phone_number_id": phone_number_id,
                        "template_name": template_name,
                        "user_id": user_id,
                    },
                    trace=["whatsapp_send"],
                ),
            )
            return json.dumps(
                {"status": "failed", "type": "text", "data": "Missing configuration, environment variables, or user_id"}
            )

        phone_numbers_list = validate_phone_numbers(phone_numbers)
        template_details = get_template_details(
            waba_id, whatsapp_access_token, template_name, user_id, image_name, image_url
        )

        expected_param_count = template_details["count"]
        language_code = template_details["language"]
        header_format = template_details["header_format"]
        header_handle = template_details["header_handle"]
        debug_info = template_details["debug"]
        template_text = debug_info.get("text", "")

        template_params = validate_template_parameters(template_parameters, expected_param_count, debug_info)

        campaign_id = await CampaignService().find_or_create_campaign(
            FindOrCreateCampaignArgs(user_id=user_id, campaign_name=campaign_name, template_name=template_name)
        )

        if is_error(campaign_id.error):
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to find or create campaign",
                    data={"user_id": user_id, "campaign_name": campaign_name, "error": campaign_id.error.userMessage},
                    trace=["whatsapp_send"],
                ),
            )
            return json.dumps({"status": "failed", "type": "text", "data": "Failed to find or create campaign"})

        assert campaign_id.data is not None
        campaign_id = campaign_id.data

        headers = {"Authorization": f"Bearer {whatsapp_access_token}", "Content-Type": "application/json"}
        successful_sends = []
        failed_sends = []
        new_messages_by_mobile: Dict[str, List[MessageDetail]] = {}

        # Process phone numbers in batches
        for i in range(0, len(phone_numbers_list), BATCH_SIZE):
            batch = phone_numbers_list[i : i + BATCH_SIZE]
            batch_successful, batch_failed, batch_messages = await send_message_batch(
                batch,
                template_name,
                language_code,
                header_format,
                header_handle,
                template_params,
                template_text,
                headers,
                phone_number_id,
                campaign_id,
                campaign_name,
                user_id,
            )
            successful_sends.extend(batch_successful)
            failed_sends.extend(batch_failed)
            new_messages_by_mobile.update(batch_messages)

            # log(
            #     "system",
            #     "info",
            #     LogDataArgs(
            #         message=f"Processed batch {i // BATCH_SIZE + 1}",
            #         data={
            #             "batch_size": len(batch),
            #             "successful_in_batch": len(batch_successful),
            #             "failed_in_batch": len(batch_failed),
            #             "total_processed": len(successful_sends) + len(failed_sends),
            #         },
            #         trace=["whatsapp_send"],
            #     ),
            # )

            if i + BATCH_SIZE < len(phone_numbers_list):
                await asyncio.sleep(1.0)

        # Find existing campaign document for user_id and campaign_id
        existing_doc = await messages_collection.find_one({"userId": user_id, "campaignId": campaign_id})

        messages_array = existing_doc.get("messages", []) if existing_doc else []

        # Update or create messages array
        for phone_number, messages in new_messages_by_mobile.items():
            existing_receiver = next((m for m in messages_array if m["receiverMobile"] == phone_number), None)
            if existing_receiver:
                existing_receiver["content"].extend([msg.model_dump() for msg in messages])
            else:
                messages_array.append(
                    {"receiverMobile": phone_number, "content": [msg.model_dump() for msg in messages]}
                )

        # Update or insert the campaign document
        message_doc = {"campaignId": campaign_id, "userId": user_id, "messages": messages_array}

        await messages_collection.update_one(
            {"userId": user_id, "campaignId": campaign_id}, {"$set": message_doc}, upsert=True
        )

        status = "success" if successful_sends else "failed" if failed_sends else "partial"
        # log(
        #     "system",
        #     "info",
        #     LogDataArgs(
        #         message="Completed WhatsApp send",
        #         data={
        #             "status": status,
        #             "successful_sends": len(successful_sends),
        #             "failed_sends": len(failed_sends),
        #             "successful_numbers": [s["mobile"] for s in successful_sends],
        #             "failed_numbers": [f["mobile"] for f in failed_sends],
        #             "total_duration": time.time() - start_time,
        #         },
        #         trace=["whatsapp_send"],
        #     ),
        # )
        return json.dumps(
            {
                "status": status,
                "type": "text",
                "data": json.dumps({"successful_sends": successful_sends, "failed_sends": failed_sends}),
                "debug": debug_info,
            }
        )
    except Exception as e:
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in whatsapp_send",
                data={"error": str(e), "duration": time.time() - start_time},
                trace=["whatsapp_send"],
            ),
        )
        return json.dumps({"status": "failed", "type": "text", "data": f"Error: {str(e)}"})


@mcp.tool()
async def whatsapp_read(phone_number: str, message_id: str, campaign_name: str, user_id: str) -> str:
    try:
        if not phone_number or not user_id:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "Phone number and user_id are required to check read status.",
                }
            )

        campaign = (
            await CampaignService().get_campaign_by_name(
                GetCampaignByCampaignNameArgs(campaign_name=campaign_name, user_id=user_id)
            )
            if campaign_name
            else await CampaignService().get_latest_campaign_by_user_id(user_id)
        )

        if is_error(campaign.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No messages found for {'campaign_name ' + campaign_name if campaign_name else 'user_id ' + user_id} in the latest campaign.",
                }
            )

        assert campaign.data is not None
        campaign = campaign.data

        message_docs = await messages_collection.find(
            {"campaignId": campaign.id, "receiverMobile": phone_number}
        ).to_list(length=None)
        if not message_docs:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No message found for phone_number {phone_number} in campaign {campaign.campaignName}.",
                }
            )

        message = next(
            (msg for msg_doc in message_docs for msg in msg_doc["content"] if msg.get("messageId") == message_id), None
        )
        if not message:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No message found for message_id {message_id} in campaign {campaign.campaignName}.",
                }
            )

        read_status = message.get("status", "unknown")
        is_read = read_status == "read"
        source = (
            f"campaign {campaign.campaignName} ({campaign.id})" if campaign_name else f"latest campaign ({campaign.id})"
        )

        return json.dumps(
            {
                "status": "success",
                "type": "text",
                "data": f"Has {phone_number} read message {message_id} in {source}? {is_read}",
            }
        )
    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


@mcp.tool()
async def whatsapp_read_by_campaign(campaign_name: str, user_id: str) -> str:
    try:
        if not campaign_name or not user_id:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "Campaign name and user_id are required to check campaign read status.",
                }
            )

        campaign = await CampaignService().get_campaign_by_name(
            GetCampaignByCampaignNameArgs(campaign_name=campaign_name, user_id=user_id)
        )

        if is_error(campaign.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No campaign found for campaign_name {campaign_name} and user_id {user_id}.",
                }
            )

        assert campaign.data is not None
        campaign = campaign.data

        message_docs = await messages_collection.find({"campaignId": campaign.id}).to_list(length=None)
        read_messages = [msg for msg_doc in message_docs for msg in msg_doc["content"] if msg.get("status") == "read"]
        result = {
            "campaign_id": campaign.id,
            "campaign_name": campaign.campaignName,
            "user_id": campaign.userId,
            "template_name": campaign.templateName,
            "created": campaign.created,
            "messages": [msg for msg_doc in message_docs for msg in msg_doc["content"]],
            "read_messages_count": len(read_messages),
        }

        return json.dumps(
            {
                "status": "success",
                "type": "text",
                "data": f"Campaign {campaign_name} has {len(read_messages)} read messages out of {sum(len(msg_doc['content']) for msg_doc in message_docs)} total messages.",
                "details": result,
            }
        )
    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


@mcp.tool()
async def whatsapp_update_campaign(old_campaign_name: str, new_campaign_name: str, user_id: str) -> str:
    try:
        if not user_id or not old_campaign_name or not new_campaign_name:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "User ID, old campaign name, and new campaign name are required to update campaign.",
                }
            )

        campaign = await CampaignService().get_campaign_by_name(
            GetCampaignByCampaignNameArgs(campaign_name=old_campaign_name, user_id=user_id)
        )

        if is_error(campaign.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No campaign found for campaign_name {old_campaign_name} and user_id {user_id}.",
                }
            )

        assert campaign.data is not None
        campaign = campaign.data

        success = await CampaignService().update_campaign_by_name(
            UpdateCampaignByNameArgs(
                user_id=user_id, old_campaign_name=old_campaign_name, new_campaign_name=new_campaign_name
            )
        )

        if is_error(success.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"Failed to update campaign name from {old_campaign_name} to {new_campaign_name} for user_id {user_id}.",
                }
            )

        assert success.data is not None

        # Update associated messages with new campaign name
        await messages_collection.update_many({"campaignId": campaign.id}, {"$set": {"campaignId": new_campaign_name}})

        return json.dumps(
            {
                "status": "success",
                "type": "text",
                "data": f"Campaign name updated from {old_campaign_name} to {new_campaign_name} for user_id {user_id}.",
            }
        )
    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


@mcp.tool()
async def whatsapp_delete_campaign(campaign_name: str, user_id: str) -> str:
    try:
        if not user_id or not campaign_name:
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "User ID and campaign name are required to delete campaign.",
                }
            )

        campaign = await CampaignService().get_campaign_by_name(
            GetCampaignByCampaignNameArgs(campaign_name=campaign_name, user_id=user_id)
        )

        if is_error(campaign.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"No campaign found or failed to delete campaign {campaign_name} for user_id {user_id}.",
                }
            )

        assert campaign.data is not None
        campaign = campaign.data

        success = await CampaignService().delete_campaign(
            DeleteCampaignByNameArgs(user_id=user_id, campaign_name=campaign_name)
        )
        if is_error(success.error):
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"Failed to delete campaign {campaign_name} for user_id {user_id}.",
                }
            )

        assert success.data is not None
        return json.dumps(
            {
                "status": "success",
                "type": "text",
                "data": f"Campaign {campaign_name} deleted successfully for user_id {user_id}.",
            }
        )
    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


@mcp.tool()
async def whatsapp_send_from_file(
    file_name: str,
    template_name: str,
    campaign_name: str,
    user_id: str,
    image_name: str | None = None,
    image_url: str | None = None,
) -> str:
    start_time = time.time()

    try:
        log(
            "system",
            "info",
            LogDataArgs(
                message="Starting WhatsApp send from file",
                data={
                    "file_name": file_name,
                    "template_name": template_name,
                    "campaign_name": campaign_name,
                    "user_id": user_id,
                    "image_name": image_name,
                    "image_url": image_url,
                },
                trace=["whatsapp_send_from_file"],
            ),
        )
        if not user_id or not file_name:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing required parameters for whatsapp_send_from_file",
                    data={"user_id": user_id, "file_name": file_name},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "User ID and file name are required to send messages from file.",
                }
            )

        file_details_response = await UserService().get_user_specific_file_details(
            GetUserFileDetailsArgs(user_id=user_id, file_name=file_name)
        )

        if is_error(file_details_response.error):
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to fetch file details",
                    data={"user_id": user_id, "file_name": file_name, "error": file_details_response.error.userMessage},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"Failed to fetch file details: {file_details_response.error.userMessage}",
                }
            )

        assert file_details_response.data is not None
        file_details = file_details_response.data

        if not file_details.url or not file_details.metadata:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="File details or metadata missing",
                    data={
                        "user_id": user_id,
                        "file_name": file_name,
                        "url": file_details.url,
                        "metadata": file_details.metadata,
                    },
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps({"status": "failed", "type": "text", "data": "File details, URL, or metadata missing."})

        s3_url = file_details.url
        bucket_name = s3_url.split("/")[2].split(".")[0]
        key = unquote("/".join(s3_url.split("/")[3:]))

        file_content = read_s3_file(key=key, bucket_name=bucket_name)

        if is_error(file_content.error):
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to read file from S3",
                    data={"bucket_name": bucket_name, "key": key, "error": file_content.error.userMessage},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": f"Failed to read file from S3 or unsupported file type: {file_name}. Details: {file_content.error.userMessage}",
                }
            )

        assert file_content.data is not None
        file_content: Any = file_content.data

        template_name = template_name or os.getenv("TEMPLATE_NAME") or ""
        campaign_name = campaign_name or os.getenv("CAMPAIGN_NAME", f"campaign_{str(uuid.uuid4())[:8]}") or ""

        whatsapp_access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        waba_id = os.getenv("WABA_ID")
        if not whatsapp_access_token or not waba_id:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Missing WhatsApp configuration",
                    data={"whatsapp_access_token": bool(whatsapp_access_token), "waba_id": waba_id},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps(
                {
                    "status": "failed",
                    "type": "text",
                    "data": "Missing WhatsApp configuration (WHATSAPP_ACCESS_TOKEN or WABA_ID).",
                }
            )

        # Construct S3 image URL if image_name is provided
        constructed_image_url = image_url
        if image_name and not image_url:
            constructed_image_url = f"https://agentstop-prod.s3.ap-south-1.amazonaws.com/users/{user_id}/{image_name}"
            # log(
            #     "system",
            #     "info",
            #     LogDataArgs(
            #         message="Constructed S3 image URL for template",
            #         data={"image_name": image_name, "user_id": user_id, "constructed_image_url": constructed_image_url},
            #         trace=["whatsapp_send_from_file"],
            #     ),
            # )

        template_details = get_template_details(
            waba_id, whatsapp_access_token, template_name, user_id, image_name, constructed_image_url
        )
        expected_param_count = template_details["count"]
        debug_info = template_details["debug"]

        metadata = file_details.metadata
        phone_col_index = None
        param_col_indices = []
        image_url_col_index = None

        for col_index, col_name in metadata.items():
            col_name_lower = col_name.lower()
            if col_name_lower in ["phone", "number", "mobile"]:
                phone_col_index = int(col_index.replace("Column ", ""))
            elif col_name_lower in ["image_url", "image url", "image"]:
                image_url_col_index = int(col_index.replace("Column ", ""))
            else:
                param_col_indices.append(int(col_index.replace("Column ", "")))

        if phone_col_index is None:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="No phone column found in metadata",
                    data={"file_name": file_name, "metadata": metadata},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps({"status": "failed", "type": "text", "data": "No phone column found in metadata."})

        phone_numbers = []
        param_mappings = []
        image_urls = []

        for row_idx, row in file_content.items():
            phone = row.get(phone_col_index)
            if phone is not None:
                phone_str = str(phone).strip()

                if not phone_str.startswith("+"):
                    phone_str = f"+{phone_str}"

                if phone_str.replace("+", "").isdigit():
                    phone_numbers.append(phone_str)

                    params = []
                    for col_idx in param_col_indices:
                        col_value = row.get(col_idx)
                        params.append(str(col_value) if col_value is not None else "")

                    params = params[:expected_param_count] + [""] * (expected_param_count - len(params))
                    param_mappings.append(params)

                    row_image_url = row.get(image_url_col_index) if image_url_col_index is not None else None
                    image_urls.append(str(row_image_url) if row_image_url else constructed_image_url)
                else:
                    log(
                        "system",
                        "warn",
                        LogDataArgs(
                            message="Invalid phone number skipped",
                            data={"row_idx": row_idx, "phone": phone_str},
                            trace=["whatsapp_send_from_file"],
                        ),
                    )
            else:
                log(
                    "system",
                    "warn",
                    LogDataArgs(
                        message="No phone number in row",
                        data={"row_idx": row_idx},
                        trace=["whatsapp_send_from_file"],
                    ),
                )

        if not phone_numbers:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="No valid phone numbers found in file",
                    data={"file_name": file_name},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps({"status": "failed", "type": "text", "data": "No valid phone numbers found in file."})

        campaign_id = await CampaignService().find_or_create_campaign(
            FindOrCreateCampaignArgs(user_id=user_id, campaign_name=campaign_name, template_name=template_name)
        )

        if is_error(campaign_id.error):
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Failed to create or find campaign",
                    data={"user_id": user_id, "campaign_name": campaign_name, "error": campaign_id.error.userMessage},
                    trace=["whatsapp_send_from_file"],
                ),
            )
            return json.dumps({"status": "failed", "type": "text", "data": "Failed to create or find campaign."})

        assert campaign_id.data is not None
        campaign_id = campaign_id.data

        results = []
        for idx, (phone, params, row_image_url) in enumerate(zip(phone_numbers, param_mappings, image_urls)):
            result = await whatsapp_send(
                input_data=template_name,
                phone_numbers=phone,
                template_parameters=params,
                user_id=user_id,
                campaign_name=campaign_name,
                image_name=None,
                image_url=row_image_url,
            )
            results.append(json.loads(result))

        successful_sends = []
        failed_sends = []

        for idx, result in enumerate(results):
            if result["status"] == "success":
                successful_sends.extend(json.loads(result["data"])["successful_sends"])
                failed_sends.extend(json.loads(result["data"])["failed_sends"])
            else:
                failed_sends.append(
                    {
                        "mobile": phone_numbers[idx],
                        "error": result["data"],
                        "id": campaign_id,
                        "campaignName": campaign_name,
                    }
                )
                log(
                    "system",
                    "error",
                    LogDataArgs(
                        message="Failed message result",
                        data={"error": result["data"], "phone_number": phone_numbers[idx]},
                        trace=["whatsapp_send_from_file"],
                    ),
                )

        status = "success" if successful_sends else "failed" if failed_sends else "partial"
        log(
            "system",
            "info",
            LogDataArgs(
                message="Completed sending messages from file",
                data={
                    "status": status,
                    "successful_sends": len(successful_sends),
                    "failed_sends": len(failed_sends),
                    "total_duration": time.time() - start_time,
                    "successful_numbers": [s["mobile"] for s in successful_sends],
                    "failed_numbers": [f["mobile"] for f in failed_sends],
                },
                trace=["whatsapp_send_from_file"],
            ),
        )
        return json.dumps(
            {
                "status": status,
                "type": "text",
                "data": json.dumps({"successful_sends": successful_sends, "failed_sends": failed_sends}),
                "debug": debug_info,
            }
        )

    except Exception as e:
        log(
            "system",
            "error",
            LogDataArgs(
                message="Unexpected error in whatsapp_send_from_file",
                data={"error": str(e), "duration": time.time() - start_time},
                trace=["whatsapp_send_from_file"],
            ),
        )
        return json.dumps({"status": "failed", "type": "text", "data": f"Unexpected error: {str(e)}"})


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


@mcp.tool()
async def whatsapp_all_campaign_analytics(user_id: str) -> str:

    try:
        if not user_id:
            return json.dumps(
                {"status": "failed", "type": "text", "data": "User ID is required to retrieve campaign analytics."}
            )

        campaigns = await CampaignService().get_user_campaigns(user_id)

        if is_error(campaigns.error):
            return json.dumps(
                {"status": "failed", "type": "text", "data": f"No campaigns found for user_id {user_id}."}
            )

        assert campaigns.data is not None

        all_analytics = []
        total_all_messages = 0
        aggregated_status_counts = {"sent": 0, "delivered": 0, "read": 0, "failed": 0, "unknown": 0}
        aggregated_messages_by_date = {}
        local_tz = datetime.now().astimezone().tzinfo

        for campaign in campaigns.data:
            message_docs = await messages_collection.find({"campaignId": campaign.id}).to_list(length=None)
            messages = [msg for msg_doc in message_docs for msg in msg_doc["content"]]
            total_messages = len(messages)
            status_counts = {"sent": 0, "delivered": 0, "read": 0, "failed": 0, "unknown": 0}
            messages_by_date = {}

            for msg in messages:
                status = msg.get("status", "unknown").lower()
                status_counts[status] = status_counts.get(status, 0) + 1
                aggregated_status_counts[status] = aggregated_status_counts.get(status, 0) + 1
                timestamp = msg.get("timestamp", 0)
                try:
                    date_str = (
                        datetime.fromtimestamp(timestamp, tz=timezone.utc).astimezone(local_tz).strftime("%Y-%m-%d")
                    )
                except (ValueError, TypeError) as te:
                    continue

                if date_str not in messages_by_date:
                    messages_by_date[date_str] = {
                        "sent": 0,
                        "delivered": 0,
                        "read": 0,
                        "failed": 0,
                        "unknown": 0,
                        "messages": [],
                    }
                if date_str not in aggregated_messages_by_date:
                    aggregated_messages_by_date[date_str] = {
                        "sent": 0,
                        "delivered": 0,
                        "read": 0,
                        "failed": 0,
                        "unknown": 0,
                        "messages": [],
                    }

                messages_by_date[date_str][status] += 1
                aggregated_messages_by_date[date_str][status] += 1
                message_details = {
                    "messageId": msg["messageId"],
                    "mobile": next((md["receiverMobile"] for md in message_docs if msg in md["content"]), ""),
                    "status": msg["status"],
                    "timestamp": msg["timestamp"],
                    "date_time": datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    .astimezone(local_tz)
                    .strftime("%Y-%m-%d %H:%M:%S %Z"),
                }
                messages_by_date[date_str]["messages"].append(message_details)
                aggregated_messages_by_date[date_str]["messages"].append(
                    {**message_details, "campaign_name": campaign.campaignName}
                )

            total_all_messages += total_messages
            analytics = {
                "campaign_id": campaign.id,
                "campaign_name": campaign.campaignName,
                "user_id": campaign.userId,
                "template_name": campaign.templateName,
                "created": campaign.created,
                "total_messages": total_messages,
                "status_counts": status_counts,
                "messages_by_date": messages_by_date,
                "messages": messages,
            }
            all_analytics.append(analytics)

        summary = (
            f"Analytics for all campaigns for user_id {user_id}: "
            f"Total campaigns: {len(campaigns.data)}, "
            f"Total messages: {total_all_messages}, "
            f"Sent: {aggregated_status_counts['sent']}, "
            f"Delivered: {aggregated_status_counts['delivered']}, "
            f"Read: {aggregated_status_counts['read']}, "
            f"Failed: {aggregated_status_counts['failed']}, "
            f"Unknown: {aggregated_status_counts['unknown']}, "
            f"Messages by date: {json.dumps(aggregated_messages_by_date)}"
        )

        response = json.dumps(
            {
                "status": "success",
                "type": "text",
                "data": summary,
                "details": {
                    "total_campaigns": len(campaigns.data),
                    "total_messages": total_all_messages,
                    "aggregated_status_counts": aggregated_status_counts,
                    "aggregated_messages_by_date": aggregated_messages_by_date,
                    "campaigns": all_analytics,
                },
            }
        )
        return response

    except Exception as e:
        return json.dumps({"status": "failed", "type": "text", "data": str(e)})


if __name__ == "__main__":
    mcp.run(transport="stdio")
