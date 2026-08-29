from datetime import date, datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.candidate import GenderEnum, CandidateEmploymentStatus
from app.schemas.skill import CandidateSkillResponse


class ExternalReference(BaseModel):
    """Generic, extensible schema for external system references (e.g. State Portals, Verification Registries)"""
    external_system: str
    external_reference: str
    reference_type: str
    verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileSchema(BaseModel):
    bio: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    expected_salary_min: Optional[int] = None
    disability_status: bool = False
    disability_type: Optional[str] = None
    resume_url: Optional[str] = None
    external_references: Optional[Union[List[ExternalReference], Dict[str, Any], List[Dict[str, Any]]]] = None

    model_config = ConfigDict(from_attributes=True)


class CandidateBase(BaseModel):
    full_name: str
    gender: GenderEnum
    dob: Optional[date] = None
    social_category: Optional[str] = None
    education_level: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    district_id: int
    address: Optional[str] = None
    pincode: Optional[str] = None
    employment_status: CandidateEmploymentStatus = CandidateEmploymentStatus.UNEMPLOYED


class CandidateCreate(CandidateBase):
    candidate_id: Optional[str] = None  # If not provided, will be auto-generated MSI-YYYY-XXXXXX
    profile: Optional[CandidateProfileSchema] = None
    skill_ids: Optional[List[int]] = None


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    dob: Optional[date] = None
    social_category: Optional[str] = None
    education_level: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    district_id: Optional[int] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    employment_status: Optional[CandidateEmploymentStatus] = None


class DistrictSimple(BaseModel):
    id: int
    name: str
    code: str
    division: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CandidateResponse(CandidateBase):
    id: int
    uuid: str
    candidate_id: str
    is_active: bool
    district: Optional[DistrictSimple] = None
    profile: Optional[CandidateProfileSchema] = None
    candidate_skills: Optional[List[CandidateSkillResponse]] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateListResponse(BaseModel):
    items: List[CandidateResponse]
    total: int
    page: int
    page_size: int
