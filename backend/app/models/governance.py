import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ConsentPurpose(str, enum.Enum):
    LONGITUDINAL_TRACKING = "LONGITUDINAL_TRACKING"
    EMPLOYER_VERIFICATION = "EMPLOYER_VERIFICATION"
    SCHEME_AUDIT = "SCHEME_AUDIT"
    JOB_MATCHING = "JOB_MATCHING"
    CREDENTIAL_SHARING = "CREDENTIAL_SHARING"


class ConsentDataCategory(str, enum.Enum):
    EMPLOYMENT_HISTORY = "EMPLOYMENT_HISTORY"
    SALARY_DATA = "SALARY_DATA"
    CONTACT_DETAILS = "CONTACT_DETAILS"
    SKILL_CREDENTIALS = "SKILL_CREDENTIALS"
    ASSESSMENT_SCORES = "ASSESSMENT_SCORES"


class GrowthTrend(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    DECLINING = "DECLINING"


class Consent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    purpose = Column(Enum(ConsentPurpose), default=ConsentPurpose.LONGITUDINAL_TRACKING, nullable=False, index=True)
    data_category = Column(Enum(ConsentDataCategory), default=ConsentDataCategory.EMPLOYMENT_HISTORY, nullable=False)
    granted = Column(Boolean, default=True, nullable=False)
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    withdrawn_at = Column(DateTime, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    consent_version = Column(String(20), default="1.0", nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="consents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., USER_LOGIN, CONSENT_GRANTED, PLACEMENT_VERIFIED
    entity = Column(String(100), nullable=False, index=True)  # e.g., Candidate, Placement, EmploymentRecord
    entity_id = Column(String(100), nullable=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    # Metadata JSON (Strictly sanitizes and omits sensitive credentials)
    metadata_json = Column(JSON, nullable=True, default=dict)

    # Relationships
    user = relationship("User")

    def __repr__(self):
        return f"<AuditLog(action='{self.action}', entity='{self.entity}', user_id={self.user_id})>"


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    user = relationship("User")


class JobDemand(Base, TimestampMixin):
    __tablename__ = "job_demands"

    id = Column(Integer, primary_key=True, index=True)
    occupation_id = Column(Integer, ForeignKey("occupations.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False, index=True)
    reported_quarter = Column(String(10), nullable=False)  # Q1, Q2, Q3, Q4
    year = Column(Integer, nullable=False, index=True)
    estimated_openings = Column(Integer, default=0, nullable=False)
    top_skills = Column(JSON, nullable=True)
    growth_trend = Column(Enum(GrowthTrend), default=GrowthTrend.HIGH, nullable=False)

    # Relationships
    occupation = relationship("Occupation", back_populates="job_demands")
    district = relationship("District", back_populates="job_demands")
