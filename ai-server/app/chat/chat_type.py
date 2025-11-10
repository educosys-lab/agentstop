from typing import Optional
from pydantic import BaseModel


class ChatbotArgs(BaseModel):
    user_id: Optional[str]
    question: str
