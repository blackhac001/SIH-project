from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.training import ProviderType, BatchStatus, TrainingCompletionStatus, AssessmentResult


class TrainingProviderBase(BaseModel):
    code: str
    name: str
    provider_type: ProviderType = ProviderType.PRIVATE_PARTNER
    district_id: int
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    accreditation_status: str = "ACCREDITED"


class TrainingProviderCreate(TrainingProviderBase):
    pass


class TrainingProviderResponse(TrainingProviderBase):
    id: int
    uuid: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseBase(BaseModel):
    code: str
    title: str
    sector: str
    nsqf_level: int = 4
    duration_hours: int = 200
    theory_hours: int = 80
    practical_hours: int = 120
    description: Optional[str] = None
    programme_id: Optional[int] = None
    provider_id: Optional[int] = None


class CourseCreate(CourseBase):
    skill_ids: Optional[List[int]] = None


class CourseResponse(CourseBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchBase(BaseModel):
    course_id: int
    centre_id: int
    batch_code: str
    start_date: date
    end_date: date
    target_capacity: int = 30
    status: BatchStatus = BatchStatus.PLANNED


class BatchCreate(BatchBase):
    pass


class BatchResponse(BatchBase):
    id: int
    uuid: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
