from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    sender_id: int
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ConversationParticipantResponse(BaseModel):
    user_id: int
    full_name: str
    role: str
    unread_count: int

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: int
    title: Optional[str] = None
    last_message_at: datetime
    participants: List[ConversationParticipantResponse] = []
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ConversationStartRequest(BaseModel):
    recipient_user_id: int
    initial_message: Optional[str] = None
