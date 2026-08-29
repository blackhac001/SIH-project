from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExtractedSkillItem(BaseModel):
    name: str
    category: str
    proficiency: int = 85


class JobMatchComparisonItem(BaseModel):
    jobTitle: str
    company: str
    matchScore: int = 88
    matchedSkills: List[str] = []
    missingSkills: List[str] = []


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    target_role: Optional[str] = "Senior AI & Cloud Platform Engineer"


class ResumeAnalysisResponse(BaseModel):
    candidateName: str
    targetRole: str
    seniority: str
    atsScore: int
    extractedSkills: List[ExtractedSkillItem]
    missingKeywords: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    jobMatchComparisons: List[Dict[str, Any]] = []


class SkillGapRequest(BaseModel):
    target_role: Optional[str] = "Principal AI & Cloud Architect"
    custom_skills: Optional[List[str]] = None


class MissingSkillItem(BaseModel):
    skill: str
    reason: str
    priority: int


class LearningPathItem(BaseModel):
    week: str
    focus: str
    skills: List[str]
    certification: str


class SkillGapResponse(BaseModel):
    targetRole: str
    matchScore: int
    candidateSkillsCoverage: int
    targetRequiredCoverage: int
    criticalMissing: List[MissingSkillItem]
    importantMissing: List[MissingSkillItem]
    niceToHave: List[MissingSkillItem]
    curatedLearningPath: List[LearningPathItem]


class SalaryPredictionRequest(BaseModel):
    target_role: Optional[str] = None
    country: Optional[str] = "Global"


class SalaryProjectionTimelineItem(BaseModel):
    year: int
    baseSalary: int
    bonusEquity: int
    total: int


class SalaryProjectionResponse(BaseModel):
    currentEstimatedSalary: int
    potentialSalary: int
    growthPercentage: float
    confidenceScore: int
    timeline: List[SalaryProjectionTimelineItem]
    positiveDrivers: List[Dict[str, str]]
    growthBlockers: List[Dict[str, str]]
    skillBoostSimulations: List[Dict[str, Any]]
    disclaimer: str = "Estimated market range based on verified skills and market index — not a guaranteed salary."


class FutureSkillItem(BaseModel):
    id: str
    name: str
    category: str
    demandGrowth: str
    growthPercentage: int
    importance: str
    difficulty: str
    timeToLearn: str
    recommendedCourse: str
    provider: str
    globalSalaryPremium: str


class CopilotChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class CopilotChatResponse(BaseModel):
    reply: str
    suggestedActions: List[str] = []
    recommendedJobIds: List[int] = []


class DashboardKPIsResponse(BaseModel):
    role: str
    kpis: Dict[str, Any]
    recentActivity: List[Dict[str, Any]] = []
