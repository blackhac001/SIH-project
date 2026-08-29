from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.role import RoleEnum
from app.schemas.role import RoleResponse


class UserBase(BaseModel):
    email: str
    full_name: str
    phone_number: Optional[str] = None
    district: Optional[str] = None
    organization_name: Optional[str] = None
    consent_given: bool = False


class UserCreate(UserBase):
    password: str
    role_name: RoleEnum = RoleEnum.CANDIDATE


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    district: Optional[str] = None
    organization_name: Optional[str] = None
    consent_given: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: RoleResponse
    is_active: bool
    is_verified: bool
    consent_date: Optional[datetime] = None
    consent_version: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: RoleEnum
    role_display: str
    district: Optional[str] = None
    organization_name: Optional[str] = None
    consent_given: bool
    is_active: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)
