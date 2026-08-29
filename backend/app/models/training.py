import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ProviderType(str, enum.Enum):
    GOVT_ITI = "GOVT_ITI"
    PVT_ITI = "PVT_ITI"
    PMKK = "PMKK"
    POLYTECHNIC = "POLYTECHNIC"
    PRIVATE_PARTNER = "PRIVATE_PARTNER"


class BatchStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class TrainingCompletionStatus(str, enum.Enum):
    ENROLLED = "ENROLLED"
    COMPLETED = "COMPLETED"
    DROPPED_OUT = "DROPPED_OUT"


class AssessmentResult(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WITHHELD = "WITHHELD"


class Programme(Base, TimestampMixin):
    __tablename__ = "programmes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sponsoring_department = Column(String(255), default="DVET Maharashtra", nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    courses = relationship("Course", back_populates="programme")


class TrainingProvider(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "training_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., VTP-MH-001
    name = Column(String(255), nullable=False, index=True)
    provider_type = Column(Enum(ProviderType), default=ProviderType.PRIVATE_PARTNER, nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    address = Column(Text, nullable=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    accreditation_status = Column(String(50), default="ACCREDITED", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="training_provider")
    district = relationship("District", back_populates="training_providers")
    centres = relationship("TrainingCentre", back_populates="provider", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="provider")


class TrainingCentre(Base, TimestampMixin):
    __tablename__ = "training_centres"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("training_providers.id", ondelete="CASCADE"), nullable=False, index=True)
    centre_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    address = Column(Text, nullable=True)
    capacity = Column(Integer, default=100, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    provider = relationship("TrainingProvider", back_populates="centres")
    district = relationship("District", back_populates="training_centres")
    batches = relationship("Batch", back_populates="centre", cascade="all, delete-orphan")


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # QP/Course Code
    title = Column(String(255), nullable=False, index=True)
    sector = Column(String(100), nullable=False, index=True)
    nsqf_level = Column(Integer, default=4, nullable=False)
    duration_hours = Column(Integer, default=200, nullable=False)
    theory_hours = Column(Integer, default=80, nullable=False)
    practical_hours = Column(Integer, default=120, nullable=False)
    description = Column(Text, nullable=True)
    programme_id = Column(Integer, ForeignKey("programmes.id", ondelete="SET NULL"), nullable=True)
    provider_id = Column(Integer, ForeignKey("training_providers.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    programme = relationship("Programme", back_populates="courses")
    provider = relationship("TrainingProvider", back_populates="courses")
    course_skills = relationship("CourseSkill", back_populates="course", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="course", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="course")


class Batch(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True)
    centre_id = Column(Integer, ForeignKey("training_centres.id", ondelete="RESTRICT"), nullable=False, index=True)
    batch_code = Column(String(50), unique=True, nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    target_capacity = Column(Integer, default=30, nullable=False)
    status = Column(Enum(BatchStatus), default=BatchStatus.PLANNED, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="batches")
    centre = relationship("TrainingCentre", back_populates="batches")
    trainings = relationship("Training", back_populates="batch", cascade="all, delete-orphan")


class Training(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="RESTRICT"), nullable=False, index=True)
    enrollment_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    completion_status = Column(
        Enum(TrainingCompletionStatus),
        default=TrainingCompletionStatus.ENROLLED,
        nullable=False,
        index=True
    )
    dropout_reason = Column(String(255), nullable=True)
    attendance_percentage = Column(Float, default=0.0, nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="trainings")
    batch = relationship("Batch", back_populates="trainings")
    assessments = relationship("Assessment", back_populates="training", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="training")
    candidate_feedbacks = relationship("CandidateFeedback", back_populates="training")


class Assessment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey("trainings.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False)
    agency_name = Column(String(255), nullable=False)
    score_marks = Column(Float, default=0.0, nullable=False)
    total_marks = Column(Float, default=100.0, nullable=False)
    result = Column(Enum(AssessmentResult), default=AssessmentResult.PASS, nullable=False)
    assessor_id = Column(String(50), nullable=True)

    # Relationships
    training = relationship("Training", back_populates="assessments")
    candidate = relationship("Candidate", back_populates="assessments")
    certifications = relationship("Certification", back_populates="assessment", cascade="all, delete-orphan")


class Certification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True)
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)
    issue_date = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=True)
    certificate_url = Column(String(500), nullable=True)
    verification_hash = Column(String(255), nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="certifications")
    assessment = relationship("Assessment", back_populates="certifications")
    course = relationship("Course", back_populates="certifications")
