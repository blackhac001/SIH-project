import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.employment import Employer, CompanyType
from app.schemas.employment import EmployerCreate, EmployerResponse
from app.auth.dependencies import (
    get_current_active_user, get_current_employer,
    check_employer_access, require_roles
)
from app.models.user import User
from app.models.role import RoleEnum

router = APIRouter()


@router.get("/me", response_model=EmployerResponse, summary="Get Current Company Profile (Self)")
def get_my_company_profile(
    employer: Employer = Depends(get_current_employer),
):
    """Retrieve the company profile and credentials for the currently authenticated employer."""
    return employer


@router.put("/me", response_model=EmployerResponse, summary="Update Current Company Profile (Self)")
def update_my_company_profile(
    employer_in: EmployerCreate,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    """Update profile attributes for the currently authenticated company."""
    update_data = employer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != "employer_code":  # preserve employer identifier
            setattr(employer, field, value)
    db.commit()
    db.refresh(employer)
    return employer


@router.get("", response_model=List[EmployerResponse], summary="List Employers")
def list_employers(
    district_id: Optional[int] = Query(None, description="Filter by District ID"),
    sector: Optional[str] = Query(None, description="Filter by Industry Sector"),
    company_type: Optional[CompanyType] = Query(None, description="Filter by Company Type"),
    search: Optional[str] = Query(None, description="Search employer name or code"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Employer).filter(Employer.is_active == True)
    if district_id:
        query = query.filter(Employer.district_id == district_id)
    if sector:
        query = query.filter(Employer.industry_sector.ilike(f"%{sector.strip()}%"))
    if company_type:
        query = query.filter(Employer.company_type == company_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Employer.company_name.ilike(s)) | (Employer.employer_code.ilike(s)))
    return query.order_by(Employer.company_name.asc()).all()


@router.post("", response_model=EmployerResponse, status_code=status.HTTP_201_CREATED, summary="Create Employer")
def create_employer(
    employer_in: EmployerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(Employer).filter(Employer.employer_code == employer_in.employer_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employer with code '{employer_in.employer_code}' already exists."
        )

    employer = Employer(
        user_id=current_user.id if (current_user.role and current_user.role.name == RoleEnum.EMPLOYER) else None,
        uuid=str(uuid.uuid4()),
        **employer_in.model_dump()
    )
    db.add(employer)
    db.commit()
    db.refresh(employer)
    return employer


@router.get("/{employer_id}", response_model=EmployerResponse, summary="Get Employer by ID")
def get_employer(
    employer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Employer {employer_id} not found.")
    return employer


@router.put("/{employer_id}", response_model=EmployerResponse, summary="Update Employer by ID with OLAC")
def update_employer(
    employer_id: int,
    employer_in: EmployerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Employer {employer_id} not found.")
    
    # Enforce Object-Level Access Control (Company A cannot modify Company B)
    check_employer_access(employer, current_user)

    update_data = employer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employer, field, value)
    db.commit()
    db.refresh(employer)
    return employer
