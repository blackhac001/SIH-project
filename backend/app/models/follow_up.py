import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class FollowUpType(str, enum.Enum):
    DAY_30 = "30_DAY"
    DAY_90 = "90_DAY"
    DAY_180 = "180_DAY"
    DAY_365 = "365_DAY"
    DAY_730 = "730_DAY"


class RetentionStatus(str, enum.Enum):
    RETAINED = "RETAINED"
    JOB_SWITCH = "JOB_SWITCH"
    PROMOTED = "PROMOTED"
    UNEMPLOYED = "UNEMPLOYED"
    HIGHER_STUDIES = "HIGHER_STUDIES"
    DROPPED_OUT = "DROPPED_OUT"
    UNREACHABLE = "UNREACHABLE"


class FollowUp(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    employment_record_id = Column(Integer, ForeignKey("employment_records.id", ondelete="SET NULL"), nullable=True)

    # Schedule & Execution
    scheduled_date = Column(Date, nullable=False, index=True)
    completed_date = Column(Date, nullable=True)
    follow_up_type = Column(Enum(FollowUpType, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)

    # Outcome Findings
    employment_status = Column(String(50), nullable=True)  # Current active status
    salary_band = Column(String(50), nullable=True)  # e.g., "15k-20k", "20k-25k", "25k+"
    current_job = Column(String(255), nullable=True)
    retention_status = Column(Enum(RetentionStatus), default=RetentionStatus.RETAINED, nullable=False)
    reason_for_non_placement = Column(String(255), nullable=True)
    reason_for_leaving = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    conducted_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="follow_ups")
    employment_record = relationship("EmploymentRecord", back_populates="follow_ups")
    conducted_by = relationship("User")


class EmployerFeedback(Base, TimestampMixin):
    __tablename__ = "employer_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)

    technical_skill_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    soft_skill_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    workplace_readiness_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    feedback_text = Column(Text, nullable=True)
    skill_deficiencies = Column(String(500), nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="employer_feedbacks")
    employer = relationship("Employer", back_populates="employer_feedbacks")


class CandidateFeedback(Base, TimestampMixin):
    __tablename__ = "candidate_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    training_id = Column(Integer, ForeignKey("trainings.id", ondelete="CASCADE"), nullable=False, index=True)

    curriculum_relevance_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    infrastructure_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    placement_support_rating = Column(Integer, default=4, nullable=False)  # 1 to 5
    current_relevance_feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="candidate_feedbacks")
    training = relationship("Training", back_populates="candidate_feedbacks")
