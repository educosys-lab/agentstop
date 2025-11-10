from typing import Any, Union
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import time
import pytz
from datetime import datetime, timezone

from app.mongodb.campaign.campaign_type import (
    AddCampaignArgs,
    DeleteCampaignByIdArgs,
    DeleteCampaignByNameArgs,
    FindOrCreateCampaignArgs,
    GetCampaignAnalyticsByNameArgs,
    GetCampaignByCampaignNameArgs,
    GetCampaignByIdArgs,
    UpdateCampaignArgs,
    UpdateCampaignByNameArgs,
    WhatsAppCampaignModel,
    CampaignType,
)
from app.shared.config.config import env
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType


client = AsyncIOMotorClient(env.MONGODB_URI)
db = client[env.MONGODB_NAME]
campaigns_collection = db["campaigns"]
messages_collection = db["campaignmessages"]


class CampaignService(BaseModel):
    # Get campaign by id
    async def get_campaign(self, args: GetCampaignByIdArgs) -> DefaultReturnType[WhatsAppCampaignModel]:
        try:
            doc = await campaigns_collection.find_one({"id": args.id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return DefaultReturnType(data=WhatsAppCampaignModel(**doc))
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Campaign not found!",
                    error="Campaign not found!",
                    errorType="NotFoundException",
                    errorData={},
                    trace=["CampaignService - get_campaign - if doc"],
                )
            )
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting campaign doc!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - get_campaign - except Exception"],
                )
            )

    # Get campaign by campaign name and user id
    async def get_campaign_by_name(
        self, args: GetCampaignByCampaignNameArgs
    ) -> DefaultReturnType[WhatsAppCampaignModel]:
        try:
            doc = await campaigns_collection.find_one({"campaignName": args.campaign_name, "userId": args.user_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return DefaultReturnType(data=WhatsAppCampaignModel(**doc))
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Campaign not found!",
                    error="Campaign not found!",
                    errorType="NotFoundException",
                    errorData={},
                    trace=["CampaignService - get_campaign_by_name - if doc"],
                )
            )
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting campaign doc!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - get_campaign_by_name - except Exception"],
                )
            )

    # Get campaigns by user id
    async def get_user_campaigns(self, user_id: str) -> DefaultReturnType[list[WhatsAppCampaignModel]]:
        try:
            docs = await campaigns_collection.find({"userId": user_id}).to_list(length=None)
            if docs:
                for doc in docs:
                    doc["_id"] = str(doc["_id"])
                return DefaultReturnType(data=[WhatsAppCampaignModel(**doc) for doc in docs])
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Campaign not found!",
                    error="Campaign not found!",
                    errorType="NotFoundException",
                    errorData={},
                    trace=["CampaignService - get_user_campaigns - if docs"],
                )
            )
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting campaign doc!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - get_user_campaigns - except Exception"],
                )
            )

    # Get latest campaign by user id
    async def get_latest_campaign_by_user_id(self, user_id: str) -> DefaultReturnType[WhatsAppCampaignModel]:
        try:
            docs = await campaigns_collection.find({"userId": user_id}).sort("created", -1).limit(1).to_list(length=1)
            if docs:
                doc = docs[0]
                doc["_id"] = str(doc["_id"])
                return DefaultReturnType(data=WhatsAppCampaignModel(**doc))
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Campaign not found!",
                    error="Campaign not found!",
                    errorType="NotFoundException",
                    errorData={},
                    trace=["CampaignService - get_latest_campaign_by_user_id - if docs"],
                )
            )
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting latest campaign by user id!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - get_latest_campaign_by_user_id - except Exception"],
                )
            )

    # Add campaign
    async def add_campaign_doc(self, args: AddCampaignArgs) -> DefaultReturnType[bool]:
        try:
            doc = {
                "id": str(uuid.uuid4()),
                "userId": args.user_id,
                "campaignName": args.campaign_name if args.campaign_name else f"campaign_{str(uuid.uuid4())[:8]}",
                "created": int(time.time()),
                "templateName": "",
                "type": CampaignType.WHATSAPP.value,  # Added type field with default "whatsapp"
            }
            await campaigns_collection.insert_one(doc)
            return DefaultReturnType(data=True)
        except Exception as e:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error adding campaign doc!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - add_campaign_doc - except Exception"],
                )
            )

    # Update campaign
    async def update_campaign_doc(self, args: UpdateCampaignArgs) -> DefaultReturnType[bool]:
        try:
            doc = args.data.model_dump()
            await campaigns_collection.update_one({"id": args.id}, {"$set": doc})
            return DefaultReturnType(data=True)
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error updating campaign doc!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - update_campaign_doc - except Exception"],
                )
            )

    # Find or create campaign
    async def find_or_create_campaign(self, args: FindOrCreateCampaignArgs) -> DefaultReturnType[str]:
        try:
            campaign_id = str(uuid.uuid4())
            campaign_name = args.campaign_name if args.campaign_name else f"campaign_{campaign_id[:8]}"
            doc = {
                "id": campaign_id,
                "userId": args.user_id,
                "campaignName": campaign_name,
                "created": int(time.time()),
                "templateName": args.template_name,
                "type": CampaignType.WHATSAPP.value,  # Added type field with default "whatsapp"
            }
            result = await campaigns_collection.find_one_and_update(
                {"userId": args.user_id, "campaignName": campaign_name},
                {"$setOnInsert": doc},
                upsert=True,
                return_document=True,
            )
            return DefaultReturnType(data=result["id"])
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error finding or creating campaign!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - find_or_create_campaign - except Exception"],
                )
            )

    # Update campaign by name
    async def update_campaign_by_name(self, args: UpdateCampaignByNameArgs) -> DefaultReturnType[bool]:
        try:
            result = await campaigns_collection.update_one(
                {"userId": args.user_id, "campaignName": args.old_campaign_name},
                {"$set": {"campaignName": args.new_campaign_name}},
            )
            if result.matched_count == 0:
                return DefaultReturnType(
                    error=ErrorResponseType(
                        userMessage="Campaign not found!",
                        error="Campaign not found!",
                        errorType="NotFoundException",
                        errorData={},
                        trace=["CampaignService - update_campaign_by_name - if result.matched_count == 0"],
                    )
                )
            return DefaultReturnType(data=True)
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error updating campaign name!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - update_campaign_by_name - except Exception"],
                )
            )

    # Delete campaign
    async def delete_campaign(
        self, args: Union[DeleteCampaignByIdArgs, DeleteCampaignByNameArgs]
    ) -> DefaultReturnType[bool]:
        try:
            if isinstance(args, DeleteCampaignByIdArgs):
                response = await campaigns_collection.delete_one({"id": args.id})
            else:
                response = await campaigns_collection.delete_one(
                    {"userId": args.user_id, "campaignName": args.campaign_name}
                )
            if response.deleted_count == 0:
                return DefaultReturnType(
                    error=ErrorResponseType(
                        userMessage="Campaign not found!",
                        error="Campaign not found!",
                        errorType="NotFoundException",
                        errorData={},
                        trace=["CampaignService - delete_campaign - if response.deleted_count == 0"],
                    )
                )
            # Also delete associated messages
            await messages_collection.delete_many(
                {"campaignId": args.id if isinstance(args, DeleteCampaignByIdArgs) else args.campaign_name}
            )
            return DefaultReturnType(data=True)
        except Exception as error:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error deleting campaign doc!",
                    error=str(error),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - delete_campaign_doc - except Exception"],
                )
            )

    # Get campaign analytics by name
    async def get_campaign_analytics_by_name(
        self, args: GetCampaignAnalyticsByNameArgs
    ) -> DefaultReturnType[dict[str, Any]]:
        try:
            campaign_doc = await campaigns_collection.find_one(
                {"campaignName": args.campaign_name, "userId": args.user_id}
            )
            if not campaign_doc:
                return DefaultReturnType(
                    error=ErrorResponseType(
                        userMessage="Campaign not found!",
                        error="Campaign not found!",
                        errorType="NotFoundException",
                        errorData={},
                        trace=["CampaignService - get_campaign_analytics_by_name - if campaign_doc"],
                    )
                )

            campaign_doc["_id"] = str(campaign_doc["_id"])
            message_docs = await messages_collection.find({"campaignId": campaign_doc["id"]}).to_list(length=None)

            total_messages = len(message_docs)
            status_counts = {"sent": 0, "delivered": 0, "read": 0, "failed": 0, "received": 0, "unknown": 0}
            messages_by_date = {}

            for msg_doc in message_docs:
                for msg in msg_doc["content"]:
                    status = msg.get("status", "unknown").lower()
                    status_counts[status] = status_counts.get(status, 0) + 1
                    timestamp = msg.get("timestamp", 0)
                    ist = pytz.timezone("Asia/Kolkata")
                    date_str = datetime.fromtimestamp(timestamp, tz=timezone.utc).astimezone(ist).strftime("%Y-%m-%d")
                    if date_str not in messages_by_date:
                        messages_by_date[date_str] = {
                            "sent": 0,
                            "delivered": 0,
                            "read": 0,
                            "failed": 0,
                            "received": 0,
                            "unknown": 0,
                            "messages": [],
                        }
                    messages_by_date[date_str][status] += 1
                    messages_by_date[date_str]["messages"].append(
                        {
                            "messageId": msg["messageId"],
                            "mobile": msg_doc["receiverMobile"],
                            "status": msg["status"],
                            "timestamp": msg["timestamp"],
                            "messageContent": msg.get("messageContent", ""),
                            "date_time": datetime.fromtimestamp(timestamp, tz=timezone.utc)
                            .astimezone(ist)
                            .strftime("%Y-%m-%d %H:%M:%S %Z"),
                        }
                    )

            analytics = {
                "campaign_id": campaign_doc["id"],
                "campaign_name": campaign_doc["campaignName"],
                "user_id": campaign_doc["userId"],
                "template_name": campaign_doc["templateName"],
                "created": campaign_doc["created"],
                "type": campaign_doc.get("type", CampaignType.WHATSAPP.value),
                "total_messages": total_messages,
                "status_counts": status_counts,
                "messages_by_date": messages_by_date,
                "messages": [msg for msg_doc in message_docs for msg in msg_doc["content"]],
            }

            return DefaultReturnType(data=analytics)
        except Exception as e:
            return DefaultReturnType(
                error=ErrorResponseType(
                    userMessage="Error getting campaign analytics by campaign_name!",
                    error=str(e),
                    errorType="InternalServerErrorException",
                    errorData={},
                    trace=["CampaignService - get_campaign_analytics_by_name - except Exception"],
                )
            )
