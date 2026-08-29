import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.training import TrainingProvider, ProviderType
from app.schemas.training import TrainingProviderCreate, TrainingProviderResponse
from app.auth.dependencies import (
    get_current_active_user, get_current_provider, require_roles
)
from app.models.user import User
from app.models.role import RoleEnum

router = APIRouter()


@router.get("/me", response_model=TrainingProviderResponse, summary="Get Current Provider Profile (Self)")
def get_my_provider_profile(
    provider: TrainingProvider = Depends(get_current_provider),
):
    """Retrieve academy / training provider profile for the currently authenticated provider user."""
    return provider


@router.put("/me", response_model=TrainingProviderResponse, summary="Update Current Provider Profile (Self)")
def update_my_provider_profile(
    provider_in: TrainingProviderCreate,
    provider: TrainingProvider = Depends(get_current_provider),
    db: Session = Depends(get_db),
):
    """Update profile details for the currently authenticated training provider."""
    update_data = provider_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != "code":
            setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("", response_model=List[TrainingProviderResponse], summary="List Training Providers")
def list_training_providers(
    district_id: Optional[int] = Query(None, description="Filter by District ID"),
    provider_type: Optional[ProviderType] = Query(None, description="Filter by Provider Type"),
    search: Optional[str] = Query(None, description="Search by provider name or code"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(TrainingProvider).filter(TrainingProvider.is_active == True)
    if district_id:
        query = query.filter(TrainingProvider.district_id == district_id)
    if provider_type:
        query = query.filter(TrainingProvider.provider_type == provider_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((TrainingProvider.name.ilike(s)) | (TrainingProvider.code.ilike(s)))
    return query.order_by(TrainingProvider.name.asc()).all()


@router.post("", response_model=TrainingProviderResponse, status_code=status.HTTP_201_CREATED, summary="Create Training Provider")
def create_training_provider(
    provider_in: TrainingProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(TrainingProvider).filter(TrainingProvider.code == provider_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Training Provider with code '{provider_in.code}' already exists."
        )

    provider = TrainingProvider(
        user_id=current_user.id if (current_user.role and current_user.role.name == RoleEnum.TRAINING_PROVIDER) else None,
        uuid=str(uuid.uuid4()),
        **provider_in.model_dump()
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/{provider_id}", response_model=TrainingProviderResponse, summary="Get Training Provider by ID")
def get_training_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    provider = db.query(TrainingProvider).filter(TrainingProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Training Provider {provider_id} not found.")
    return provider
