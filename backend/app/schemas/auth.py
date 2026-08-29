from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.role import RoleEnum
from app.models.employment import CompanyType
from app.models.training import ProviderType


class LoginRequest(BaseModel):
    email: str
    password: str


class CandidateRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    phone_number: Optional[str] = None
    district: Optional[str] = "Pune"
    country: Optional[str] = "Global"
    education_level: Optional[str] = "Graduate"
    skills: Optional[List[str]] = []
    consent_given: bool = True


class CompanyRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    industry_sector: str = "Technology & Software"
    company_type: CompanyType = CompanyType.CORPORATE
    district: Optional[str] = "Pune"
    country: Optional[str] = "Global"
    website: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None


class RecruiterRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    company_name: str = "Enterprise Partner"
    phone_number: Optional[str] = None
    job_title: Optional[str] = "Technical Recruiter"


class ProviderRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    provider_type: ProviderType = ProviderType.POLYTECHNIC
    district: Optional[str] = "Pune"
    country: Optional[str] = "Global"
    address: Optional[str] = None
    phone_number: Optional[str] = None
    accreditation_status: str = "ACCREDITED"


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role_name: RoleEnum = RoleEnum.CANDIDATE
    district: Optional[str] = None
    organization_name: Optional[str] = None
    consent_given: bool = False


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirmRequest(BaseModel):
    email: str
    token: str
    new_password: str = Field(..., min_length=6)


class EmailVerifyRequest(BaseModel):
    token: str
