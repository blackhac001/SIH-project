from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import RoleEnum
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, UserProfile, UserResponse


class UserService:
    @staticmethod
    def get_profile(user: User) -> UserProfile:
        return UserProfile(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            role=user.role.name if user.role else RoleEnum.CANDIDATE,
            role_display=user.role.display_name if user.role else "Candidate",
            district=user.district,
            organization_name=user.organization_name,
            consent_given=user.consent_given,
            is_active=user.is_active,
            is_verified=user.is_verified,
        )

    @staticmethod
    def update_profile(db: Session, user: User, update_in: UserUpdate) -> UserProfile:
        updated_user = UserRepository.update(db, user, update_in)
        return UserService.get_profile(updated_user)

    @staticmethod
    def list_all(db: Session, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        users = UserRepository.list_users(db, skip, limit)
        return [UserResponse.model_validate(u) for u in users]
