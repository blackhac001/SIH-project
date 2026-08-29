from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillResponse
from app.auth.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[SkillResponse], summary="List Skills")
def list_skills(
    category: Optional[str] = Query(None, description="Filter by skill category"),
    search: Optional[str] = Query(None, description="Search skill name or code"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Skill).filter(Skill.is_active == True)
    if category:
        query = query.filter(Skill.category.ilike(f"%{category.strip()}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Skill.name.ilike(s)) | (Skill.code.ilike(s)))
    return query.order_by(Skill.name.asc()).all()


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED, summary="Create Skill")
def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(Skill).filter((Skill.code == skill_in.code) | (Skill.name == skill_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Skill with code '{skill_in.code}' or name '{skill_in.name}' already exists."
        )

    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillResponse, summary="Get Skill by ID")
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Skill {skill_id} not found.")
    return skill
