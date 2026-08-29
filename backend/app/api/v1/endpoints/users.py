from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.role import RoleEnum
from app.schemas.user import UserResponse, UserUpdate, UserProfile
from app.services.user_service import UserService
from app.auth.dependencies import get_current_active_user, require_roles

router = APIRouter()


@router.get(
    "/",
    response_model=List[UserResponse],
    dependencies=[Depends(require_roles([RoleEnum.STATE_ADMIN, RoleEnum.SUPER_ADMIN]))],
    summary="List Users (Admin Only)"
)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List system users. Restricted to State Admin and Super Admin roles."""
    return UserService.list_all(db, skip=skip, limit=limit)


@router.put("/profile", response_model=UserProfile, summary="Update Current User Profile")
def update_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update profile information for the authenticated user."""
    return UserService.update_profile(db, current_user, update_in)
