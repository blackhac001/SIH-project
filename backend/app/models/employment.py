import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class CompanyType(str, enum.Enum):
    MNC = "MNC"
    CORPORATE = "CORPORATE"
    MSME = "MSME"
    STARTUP = "STARTUP"
    GOVT = "GOVT"
    UNORGANIZED = "UNORGANIZED"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    APPRENTICE = "APPRENTICE"
    INTERNSHIP = "INTERNSHIP"
    FREELANCE = "FREELANCE"


class JobStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEWED = "INTERVIEWED"
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"


class PlacementType(str, enum.Enum):
    CAMPUS = "CAMPUS"
    DIRECT = "DIRECT"
    SELF = "SELF"


class PlacementStatus(str, enum.Enum):
    OFFERED = "OFFERED"
    JOINED = "JOINED"
    DECLINED = "DECLINED"


class TrainingRelevance(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NONE = "NONE"


class VerificationStatus(str, enum.Enum):
    SELF_REPORTED = "SELF_REPORTED"
    EMPLOYER_VERIFIED = "EMPLOYER_VERIFIED"
    SYSTEM_VERIFIED = "SYSTEM_VERIFIED"


class Employer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    employer_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., EMP-MH-001
    company_name = Column(String(255), nullable=False, index=True)
    industry_sector = Column(String(100), nullable=False, index=True)
    company_type = Column(Enum(CompanyType), default=CompanyType.CORPORATE, nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    address = Column(Text, nullable=True)
    hr_name = Column(String(255), nullable=True)
    hr_email = Column(String(255), nullable=True)
    hr_phone = Column(String(20), nullable=True)
    cin_or_gst = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="employer")
    district = relationship("District", back_populates="employers")
    jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="employer")
    employment_records = relationship("EmploymentRecord", back_populates="employer")
    apprenticeships = relationship("Apprenticeship", back_populates="employer")
    employer_feedbacks = relationship("EmployerFeedback", back_populates="employer")

    def __repr__(self):
        return f"<Employer(name='{self.company_name}', code='{self.employer_code}')>"


class Job(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    occupation_id = Column(Integer, ForeignKey("occupations.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False, index=True)
    min_salary = Column(Integer, nullable=True)
    max_salary = Column(Integer, nullable=True)
    vacancies = Column(Integer, default=1, nullable=False)
    employment_type = Column(Enum(EmploymentType), default=EmploymentType.FULL_TIME, nullable=False)
    min_education = Column(String(100), nullable=True)
    min_experience_months = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.OPEN, nullable=False, index=True)

    # Relationships
    employer = relationship("Employer", back_populates="jobs")
    occupation = relationship("Occupation", back_populates="jobs")
    district = relationship("District", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="job")
    employment_records = relationship("EmploymentRecord", back_populates="job")

    def __repr__(self):
        return f"<Job(title='{self.title}', employer='{self.employer.company_name if self.employer else None}')>"


class Application(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    RESCHEDULED = "RESCHEDULED"


class InterviewType(str, enum.Enum):
    TECHNICAL = "TECHNICAL"
    SYSTEM_DESIGN = "SYSTEM_DESIGN"
    BEHAVIORAL = "BEHAVIORAL"
    SCREENING = "SCREENING"
    FINAL_ROUND = "FINAL_ROUND"


class Interview(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    interview_type = Column(Enum(InterviewType), default=InterviewType.TECHNICAL, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False)
    meeting_link = Column(String(500), default="https://meet.connectx.ai/room-secure", nullable=True)
    interviewer_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="interviews")
    candidate = relationship("Candidate")
    employer = relationship("Employer")
    job = relationship("Job")


class Placement(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    training_id = Column(Integer, ForeignKey("trainings.id", ondelete="SET NULL"), nullable=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="RESTRICT"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True, index=True)
    offer_date = Column(Date, nullable=False)
    joining_date = Column(Date, nullable=True)
    offered_salary = Column(Integer, nullable=False)
    placement_type = Column(Enum(PlacementType), default=PlacementType.CAMPUS, nullable=False)
    status = Column(Enum(PlacementStatus), default=PlacementStatus.OFFERED, nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="placements")
    training = relationship("Training", back_populates="placements")
    employer = relationship("Employer", back_populates="placements")
    job = relationship("Job", back_populates="placements")
    employment_record = relationship("EmploymentRecord", back_populates="placement", uselist=False)


class EmploymentRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "employment_records"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="SET NULL"), nullable=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    placement_id = Column(Integer, ForeignKey("placements.id", ondelete="SET NULL"), unique=True, nullable=True)

    # Core Employment Attributes
    company_name = Column(String(255), nullable=False, index=True)
    designation = Column(String(255), nullable=False)
    joining_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)  # Null if currently employed
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    employment_type = Column(Enum(EmploymentType), default=EmploymentType.FULL_TIME, nullable=False)
    location = Column(String(255), nullable=True)

    # Outcome & Relevance Metrics
    relevance_to_training = Column(Enum(TrainingRelevance), default=TrainingRelevance.HIGH, nullable=False)
    verification_status = Column(
        Enum(VerificationStatus),
        default=VerificationStatus.SELF_REPORTED,
        nullable=False,
        index=True
    )
    is_current = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="employment_records")
    employer = relationship("Employer", back_populates="employment_records")
    job = relationship("Job", back_populates="employment_records")
    placement = relationship("Placement", back_populates="employment_record")
    follow_ups = relationship("FollowUp", back_populates="employment_record")
