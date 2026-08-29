from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ResumeAnalysis(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    seniority = Column(String(100), default="Mid-Senior Level", nullable=False)
    ats_score = Column(Integer, default=85, nullable=False)
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, nullable=True, default=list)  # [{name, category, proficiency}]
    missing_keywords = Column(JSON, nullable=True, default=list)
    strengths = Column(JSON, nullable=True, default=list)
    weaknesses = Column(JSON, nullable=True, default=list)
    recommendations = Column(JSON, nullable=True, default=list)
    job_match_comparisons = Column(JSON, nullable=True, default=list)

    # Relationships
    candidate = relationship("Candidate")
