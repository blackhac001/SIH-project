from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.employment import (
    CompanyType, EmploymentType, JobStatus, PlacementType, PlacementStatus,
    TrainingRelevance, VerificationStatus
)


class EmployerBase(BaseModel):
    employer_code: str
    company_name: str
    industry_sector: str
    company_type: CompanyType = CompanyType.CORPORATE
    district_id: int
    address: Optional[str] = None
    hr_name: Optional[str] = None
    hr_email: Optional[str] = None
    hr_phone: Optional[str] = None
    cin_or_gst: Optional[str] = None


class EmployerCreate(EmployerBase):
    pass


class EmployerResponse(EmployerBase):
    id: int
    uuid: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobBase(BaseModel):
    employer_id: int
    title: str
    occupation_id: int
    district_id: int
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    vacancies: int = 1
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    min_education: Optional[str] = None
    min_experience_months: int = 0
    description: Optional[str] = None
    status: JobStatus = JobStatus.OPEN


class JobCreate(JobBase):
    skill_ids: Optional[List[int]] = None


class JobResponse(JobBase):
    id: int
    uuid: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlacementBase(BaseModel):
    candidate_id: int
    training_id: Optional[int] = None
    employer_id: int
    job_id: Optional[int] = None
    offer_date: date
    joining_date: Optional[date] = None
    offered_salary: int
    placement_type: PlacementType = PlacementType.CAMPUS
    status: PlacementStatus = PlacementStatus.OFFERED


class PlacementCreate(PlacementBase):
    pass


class PlacementResponse(PlacementBase):
    id: int
    uuid: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmploymentRecordBase(BaseModel):
    candidate_id: int
    employer_id: Optional[int] = None
    job_id: Optional[int] = None
    placement_id: Optional[int] = None
    company_name: str
    designation: str
    joining_date: date
    end_date: Optional[date] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    location: Optional[str] = None
    relevance_to_training: TrainingRelevance = TrainingRelevance.HIGH
    verification_status: VerificationStatus = VerificationStatus.SELF_REPORTED
    is_current: bool = True


class EmploymentRecordCreate(EmploymentRecordBase):
    pass


class EmploymentRecordResponse(EmploymentRecordBase):
    id: int
    uuid: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
