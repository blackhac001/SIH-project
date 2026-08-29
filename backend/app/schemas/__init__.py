from app.schemas.role import RoleBase, RoleCreate, RoleResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse, UserProfile
from app.schemas.token import Token, TokenPayload
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.skill import SkillBase, SkillCreate, SkillResponse, CandidateSkillBase, CandidateSkillCreate, CandidateSkillResponse
from app.schemas.candidate import CandidateBase, CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse, CandidateProfileSchema
from app.schemas.training import (
    TrainingProviderBase, TrainingProviderCreate, TrainingProviderResponse,
    CourseBase, CourseCreate, CourseResponse,
    BatchBase, BatchCreate, BatchResponse
)
from app.schemas.employment import (
    EmployerBase, EmployerCreate, EmployerResponse,
    JobBase, JobCreate, JobResponse,
    PlacementBase, PlacementCreate, PlacementResponse,
    EmploymentRecordBase, EmploymentRecordCreate, EmploymentRecordResponse
)
from app.schemas.follow_up import FollowUpBase, FollowUpCreate, FollowUpResponse
from app.schemas.governance import ConsentBase, ConsentCreate, ConsentResponse, AuditLogBase, AuditLogCreate, AuditLogResponse

__all__ = [
    "RoleBase", "RoleCreate", "RoleResponse",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserProfile",
    "Token", "TokenPayload",
    "LoginRequest", "RegisterRequest",
    "SkillBase", "SkillCreate", "SkillResponse", "CandidateSkillBase", "CandidateSkillCreate", "CandidateSkillResponse",
    "CandidateBase", "CandidateCreate", "CandidateUpdate", "CandidateResponse", "CandidateListResponse", "CandidateProfileSchema",
    "TrainingProviderBase", "TrainingProviderCreate", "TrainingProviderResponse",
    "CourseBase", "CourseCreate", "CourseResponse",
    "BatchBase", "BatchCreate", "BatchResponse",
    "EmployerBase", "EmployerCreate", "EmployerResponse",
    "JobBase", "JobCreate", "JobResponse",
    "PlacementBase", "PlacementCreate", "PlacementResponse",
    "EmploymentRecordBase", "EmploymentRecordCreate", "EmploymentRecordResponse",
    "FollowUpBase", "FollowUpCreate", "FollowUpResponse",
    "ConsentBase", "ConsentCreate", "ConsentResponse",
    "AuditLogBase", "AuditLogCreate", "AuditLogResponse"
]
