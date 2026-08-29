from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.follow_up import FollowUpType, RetentionStatus


class FollowUpBase(BaseModel):
    candidate_id: int
    employment_record_id: Optional[int] = None
    scheduled_date: date
    completed_date: Optional[date] = None
    follow_up_type: FollowUpType
    employment_status: Optional[str] = None
    salary_band: Optional[str] = None
    current_job: Optional[str] = None
    retention_status: RetentionStatus = RetentionStatus.RETAINED
    reason_for_non_placement: Optional[str] = None
    reason_for_leaving: Optional[str] = None
    notes: Optional[str] = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpResponse(FollowUpBase):
    id: int
    uuid: str
    conducted_by_user_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
