import enum
from sqlalchemy import Column, Integer, String, Boolean, Text, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class ProficiencyLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., Technical, Soft Skills, Domain
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    candidate_skills = relationship("CandidateSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    course_skills = relationship("CourseSkill", back_populates="skill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Skill(name='{self.name}', code='{self.code}')>"


class CandidateSkill(Base, TimestampMixin):
    __tablename__ = "candidate_skills"
    __table_args__ = (
        UniqueConstraint("candidate_id", "skill_id", name="uq_candidate_skill"),
    )

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(String(255), nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="candidate_skills")
    skill = relationship("Skill", back_populates="candidate_skills")


class JobSkill(Base, TimestampMixin):
    __tablename__ = "job_skills"
    __table_args__ = (
        UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),
    )

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_level = Column(Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False)
    is_mandatory = Column(Boolean, default=True, nullable=False)

    # Relationships
    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")


class CourseSkill(Base, TimestampMixin):
    __tablename__ = "course_skills"
    __table_args__ = (
        UniqueConstraint("course_id", "skill_id", name="uq_course_skill"),
    )

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    target_proficiency = Column(Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="course_skills")
    skill = relationship("Skill", back_populates="course_skills")
