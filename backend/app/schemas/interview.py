from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.employment import InterviewType, InterviewStatus


class InterviewBase(BaseModel):
    application_id: int
    scheduled_at: datetime
    interview_type: InterviewType = InterviewType.TECHNICAL
    meeting_link: Optional[str] = "https://meet.connectx.ai/room-secure"
    interviewer_name: Optional[str] = None
    notes: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    interview_type: Optional[InterviewType] = None
    status: Optional[InterviewStatus] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewResponse(InterviewBase):
    id: int
    candidate_id: int
    employer_id: int
    job_id: int
    status: InterviewStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
