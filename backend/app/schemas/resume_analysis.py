from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field_of_study: Optional[str] = None
    graduation_year: Optional[Union[str, int]] = None
    grade_or_gpa: Optional[str] = None


class ExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    highlights: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = None


class ResumeAnalyzeRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Optional target role for tailored ATS benchmarking and skill comparison"
    )


class ResumeAnalysisDetailResponse(BaseModel):
    id: int
    uuid: str
    user_id: int
    resume_id: Optional[int] = None
    candidate_id: Optional[int] = None
    target_role: Optional[str] = "General / As Described in CV"
    seniority: str = "Mid-Level Professional"

    # Core scores (0-100)
    resume_score: int
    ats_score: int
    job_readiness: int

    # Structured sections
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[Union[str, Dict[str, Any]]] = Field(default_factory=list)

    # Analytical Feedback
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    extracted_skills: List[Dict[str, Any]] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    job_match_comparisons: List[Dict[str, Any]] = Field(default_factory=list)

    # Status & Metadata
    analysis_status: str = "SUCCESS"
    error_message: Optional[str] = None
    model_used: Optional[str] = "gemini-2.5-flash"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeAnalysisStatusResponse(BaseModel):
    has_analysis: bool
    analysis: Optional[ResumeAnalysisDetailResponse] = None
