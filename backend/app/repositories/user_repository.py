from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role, RoleEnum
from app.schemas.user import UserCreate, UserUpdate
from app.auth.password import get_password_hash


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email.ilike(email.strip())).first()

    @staticmethod
    def get_role_by_name(db: Session, role_name: RoleEnum) -> Optional[Role]:
        return db.query(Role).filter(Role.name == role_name).first()

    @staticmethod
    def get_all_roles(db: Session) -> List[Role]:
        return db.query(Role).all()

    @staticmethod
    def create_role(
        db: Session,
        name: RoleEnum,
        display_name: str,
        description: Optional[str] = None
    ) -> Role:
        role = Role(name=name, display_name=display_name, description=description)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def create(db: Session, user_in: UserCreate, role_id: int) -> User:
        db_user = User(
            email=user_in.email.lower().strip(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip(),
            phone_number=user_in.phone_number,
            role_id=role_id,
            district=user_in.district,
            organization_name=user_in.organization_name,
            consent_given=user_in.consent_given,
            consent_date=datetime.now(timezone.utc) if user_in.consent_given else None,
            is_active=True,
            is_verified=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, db_user: User, user_in: UserUpdate) -> User:
        update_data = user_in.model_dump(exclude_unset=True)
        if "consent_given" in update_data and update_data["consent_given"] and not db_user.consent_given:
            db_user.consent_date = datetime.now(timezone.utc)
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()
