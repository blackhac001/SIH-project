from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.skill import ProficiencyLevel


class SkillBase(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class CandidateSkillBase(BaseModel):
    skill_id: int
    proficiency_level: ProficiencyLevel = ProficiencyLevel.INTERMEDIATE
    is_verified: bool = False
    verified_by: Optional[str] = None


class CandidateSkillCreate(CandidateSkillBase):
    pass


class CandidateSkillResponse(CandidateSkillBase):
    id: int
    candidate_id: int
    skill: SkillResponse

    model_config = ConfigDict(from_attributes=True)
