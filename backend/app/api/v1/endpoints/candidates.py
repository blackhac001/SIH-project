import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.candidate import Candidate, CandidateProfile, CandidateEmploymentStatus
from app.models.skill import CandidateSkill, Skill
from app.schemas.candidate import (
    CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse
)
from app.auth.dependencies import (
    get_current_active_user, get_current_candidate,
    check_candidate_access, require_roles
)
from app.models.user import User
from app.models.role import RoleEnum

router = APIRouter()


def generate_candidate_id(db: Session) -> str:
    current_year = datetime.now(timezone.utc).year
    last_candidate = db.query(Candidate).order_by(Candidate.id.desc()).first()
    next_num = (last_candidate.id + 1) if last_candidate else 1
    return f"CTX-{current_year}-{next_num:06d}"


@router.get("/me", response_model=CandidateResponse, summary="Get Current Candidate Profile (Self)")
def get_my_candidate_profile(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Retrieve the private candidate profile and skills for the currently logged-in candidate."""
    # Ensure relationships are loaded
    return db.query(Candidate).options(
        joinedload(Candidate.district),
        joinedload(Candidate.profile),
        joinedload(Candidate.candidate_skills).joinedload(CandidateSkill.skill)
    ).filter(Candidate.id == candidate.id).first()


@router.put("/me", response_model=CandidateResponse, summary="Update Current Candidate Profile (Self)")
def update_my_candidate_profile(
    candidate_in: CandidateUpdate,
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Update profile attributes for the currently logged-in candidate."""
    update_data = candidate_in.model_dump(exclude_unset=True)
    
    # Update profile fields if present
    profile_data = update_data.pop("profile", None)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    if profile_data:
        if not candidate.profile:
            candidate.profile = CandidateProfile(candidate_id=candidate.id)
            db.add(candidate.profile)
        for p_field, p_val in profile_data.items():
            setattr(candidate.profile, p_field, p_val)

    db.commit()
    db.refresh(candidate)
    return candidate


@router.get("", response_model=CandidateListResponse, summary="List Candidates with Filters & Pagination")
def list_candidates(
    district_id: Optional[int] = Query(None, description="Filter by District ID"),
    employment_status: Optional[CandidateEmploymentStatus] = Query(None, description="Filter by Employment Status"),
    search: Optional[str] = Query(None, description="Search by name, email, or candidate reference ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Candidate).options(
        joinedload(Candidate.district),
        joinedload(Candidate.profile),
        joinedload(Candidate.candidate_skills).joinedload(CandidateSkill.skill)
    )

    # Candidate role can only list themselves in direct queries
    if current_user.role and current_user.role.name == RoleEnum.CANDIDATE:
        query = query.filter((Candidate.user_id == current_user.id) | (Candidate.email == current_user.email))

    if district_id:
        query = query.filter(Candidate.district_id == district_id)
    if employment_status:
        query = query.filter(Candidate.employment_status == employment_status)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Candidate.full_name.ilike(s)) |
            (Candidate.candidate_id.ilike(s)) |
            (Candidate.email.ilike(s))
        )

    total = query.count()
    items = query.order_by(Candidate.id.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return CandidateListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED, summary="Create Candidate")
def create_candidate(
    candidate_in: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    candidate_id = candidate_in.candidate_id or generate_candidate_id(db)

    if db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Candidate ID '{candidate_id}' already exists."
        )

    db_candidate = Candidate(
        candidate_id=candidate_id,
        user_id=current_user.id if (current_user.role and current_user.role.name == RoleEnum.CANDIDATE) else None,
        uuid=str(uuid.uuid4()),
        full_name=candidate_in.full_name.strip(),
        gender=candidate_in.gender,
        dob=candidate_in.dob,
        social_category=candidate_in.social_category,
        education_level=candidate_in.education_level,
        phone=candidate_in.phone,
        email=candidate_in.email.lower() if candidate_in.email else None,
        district_id=candidate_in.district_id,
        address=candidate_in.address,
        pincode=candidate_in.pincode,
        employment_status=candidate_in.employment_status,
        is_active=True,
    )
    db.add(db_candidate)
    db.flush()

    if candidate_in.profile:
        prof_data = candidate_in.profile.model_dump()
        db_profile = CandidateProfile(
            candidate_id=db_candidate.id,
            **prof_data
        )
        db.add(db_profile)
    else:
        db.add(CandidateProfile(candidate_id=db_candidate.id))

    if candidate_in.skill_ids:
        for skill_id in candidate_in.skill_ids:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if skill:
                db.add(CandidateSkill(candidate_id=db_candidate.id, skill_id=skill.id))

    db.commit()
    db.refresh(db_candidate)
    return db_candidate


@router.get("/{id_or_ref}", response_model=CandidateResponse, summary="Get Candidate by ID or Reference with OLAC")
def get_candidate(
    id_or_ref: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Candidate).options(
        joinedload(Candidate.district),
        joinedload(Candidate.profile),
        joinedload(Candidate.candidate_skills).joinedload(CandidateSkill.skill)
    )

    if id_or_ref.isdigit():
        candidate = query.filter(Candidate.id == int(id_or_ref)).first()
    elif id_or_ref.startswith("CTX-") or id_or_ref.startswith("MSI-"):
        candidate = query.filter(Candidate.candidate_id == id_or_ref).first()
    else:
        candidate = query.filter(Candidate.uuid == id_or_ref).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate '{id_or_ref}' not found."
        )

    # Enforce Object-Level Access Control (Candidate A cannot access Candidate B)
    check_candidate_access(candidate, current_user)

    return candidate


@router.put("/{candidate_id}", response_model=CandidateResponse, summary="Update Candidate")
def update_candidate(
    candidate_id: int,
    candidate_in: CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found."
        )

    # Enforce Object-Level Access Control
    check_candidate_access(candidate, current_user)

    update_data = candidate_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)
    return candidate
