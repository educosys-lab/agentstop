from pydantic import BaseModel
from typing import List
from enum import Enum

class CampaignType(str, Enum):
    WHATSAPP = "whatsapp"

# Message model for the messages collection
class MessageDetail(BaseModel):
    messageId: str
    messageContent: str
    timestamp: int
    status: str

class CampaignMessageModel(BaseModel):
    campaignId: str
    userId: str
    receiverMobile: str
    content: List[MessageDetail] = []

# Campaign model for the campaigns collection
class WhatsAppCampaignModel(BaseModel):
    id: str
    userId: str
    campaignName: str
    created: int
    templateName: str
    type: CampaignType = CampaignType.WHATSAPP


class GetCampaignByIdArgs(BaseModel):
    id: str


class GetCampaignByMessageIdArgs(BaseModel):
    message_id: str


class GetCampaignByCampaignNameArgs(BaseModel):
    campaign_name: str
    user_id: str


class AddCampaignArgs(BaseModel):
    user_id: str
    campaign_name: str | None = None


class UpdateCampaignArgs(BaseModel):
    id: str
    data: WhatsAppCampaignModel

class FindOrCreateCampaignArgs(BaseModel):
    user_id: str
    campaign_name: str | None = None
    template_name: str = ""


class UpdateCampaignByNameArgs(BaseModel):
    user_id: str
    old_campaign_name: str
    new_campaign_name: str


class DeleteCampaignByIdArgs(BaseModel):
    id: str


class DeleteCampaignByNameArgs(BaseModel):
    user_id: str
    campaign_name: str


class GetCampaignAnalyticsByNameArgs(BaseModel):
    campaign_name: str
    user_id: str
