import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class GenderEnum(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class CandidateEmploymentStatus(str, enum.Enum):
    UNEMPLOYED = "UNEMPLOYED"
    IN_TRAINING = "IN_TRAINING"
    ASSESSMENT_PENDING = "ASSESSMENT_PENDING"
    CERTIFIED = "CERTIFIED"
    EMPLOYED = "EMPLOYED"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    APPRENTICE = "APPRENTICE"
    HIGHER_EDUCATION = "HIGHER_EDUCATION"


class Candidate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    # Human-readable reference ID (e.g. MSI-2026-000001)
    candidate_id = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)

    # Core Personal & Demographic Attributes (Strictly NO Aadhaar stored)
    full_name = Column(String(255), nullable=False, index=True)
    gender = Column(Enum(GenderEnum), nullable=False)
    dob = Column(Date, nullable=True)
    social_category = Column(String(50), nullable=True)  # General, OBC, SC, ST, EWS, SEBC
    education_level = Column(String(100), nullable=True)  # 10th, 12th, ITI, Diploma, Graduate

    # Regional & Contact
    phone = Column(String(20), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False, index=True)
    address = Column(Text, nullable=True)
    pincode = Column(String(10), nullable=True)

    # Current Status in Skilling & Career Lifecycle
    employment_status = Column(
        Enum(CandidateEmploymentStatus),
        default=CandidateEmploymentStatus.UNEMPLOYED,
        nullable=False,
        index=True
    )
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="candidate")
    district = relationship("District", back_populates="candidates")
    profile = relationship("CandidateProfile", uselist=False, back_populates="candidate", cascade="all, delete-orphan")
    candidate_skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    trainings = relationship("Training", back_populates="candidate", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="candidate", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="candidate", cascade="all, delete-orphan")
    employment_records = relationship("EmploymentRecord", back_populates="candidate", cascade="all, delete-orphan")
    apprenticeships = relationship("Apprenticeship", back_populates="candidate", cascade="all, delete-orphan")
    self_employments = relationship("SelfEmployment", back_populates="candidate", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="candidate", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="candidate", cascade="all, delete-orphan")
    candidate_feedbacks = relationship("CandidateFeedback", back_populates="candidate", cascade="all, delete-orphan")
    employer_feedbacks = relationship("EmployerFeedback", back_populates="candidate", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Candidate(id={self.candidate_id}, name='{self.full_name}')>"


class CandidateProfile(Base, TimestampMixin):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    preferred_locations = Column(JSON, nullable=True)  # List of district names
    expected_salary_min = Column(Integer, nullable=True)
    disability_status = Column(Boolean, default=False, nullable=False)
    disability_type = Column(String(100), nullable=True)
    resume_url = Column(String(500), nullable=True)

    # Generic External Reference Mapping (supports APAAR/ABC ID, MahaSwayam ID, NAPS ID without hardcoding)
    external_references = Column(JSON, nullable=True, default=dict)

    # Relationships
    candidate = relationship("Candidate", back_populates="profile")
