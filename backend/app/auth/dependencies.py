from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.auth.jwt import decode_access_token
from app.models.user import User
from app.models.role import RoleEnum


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/oauth",
    auto_error=False
)
http_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(
    oauth2_token: Optional[str] = Depends(reusable_oauth2),
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)
) -> str:
    if bearer_auth and bearer_auth.credentials:
        return bearer_auth.credentials
    if oauth2_token:
        return oauth2_token
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials were not provided.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_request)
) -> User:
    token_data = decode_access_token(token)
    if not token_data or not token_data.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials / Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = None
    if token_data.sub.isdigit():
        user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if not user:
        user = db.query(User).filter(User.email == token_data.sub).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token not found.",
        )
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please contact administrator.",
        )
    return current_user


class RoleChecker:
    def __init__(self, allowed_roles: List[RoleEnum]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        if not user.role or user.role.name not in self.allowed_roles:
            role_names = [r.value for r in self.allowed_roles]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {role_names}",
            )
        return user


def require_roles(allowed_roles: List[RoleEnum]):
    return RoleChecker(allowed_roles)


# -----------------------------------------------------------------------------
# Domain Identity Resolvers (Resolves domain entity directly from authenticated User)
# -----------------------------------------------------------------------------

def get_current_candidate(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.candidate import Candidate
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        # If candidate record not linked yet, check by email
        candidate = db.query(Candidate).filter(Candidate.email == current_user.email).first()
        if candidate and not candidate.user_id:
            candidate.user_id = current_user.id
            db.commit()
            db.refresh(candidate)
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found for the authenticated user.",
        )
    return candidate


def get_current_employer(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.employment import Employer
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer:
        employer = db.query(Employer).filter(Employer.hr_email == current_user.email).first()
        if employer and not employer.user_id:
            employer.user_id = current_user.id
            db.commit()
            db.refresh(employer)

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company / Employer profile not found for the authenticated user.",
        )
    return employer


def get_current_provider(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from app.models.training import TrainingProvider
    provider = db.query(TrainingProvider).filter(TrainingProvider.user_id == current_user.id).first()
    if not provider:
        provider = db.query(TrainingProvider).filter(TrainingProvider.email == current_user.email).first()
        if provider and not provider.user_id:
            provider.user_id = current_user.id
            db.commit()
            db.refresh(provider)

    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training provider profile not found for the authenticated user.",
        )
    return provider


# -----------------------------------------------------------------------------
# Object-Level Access Control (OLAC) Helpers
# -----------------------------------------------------------------------------

def check_candidate_access(candidate, current_user: User):
    """Enforce that Candidate A cannot access Candidate B's private data."""
    if current_user.role and current_user.role.name == RoleEnum.CANDIDATE:
        if candidate.user_id != current_user.id and candidate.email != current_user.email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access another candidate's private data.",
            )


def check_employer_access(employer, current_user: User):
    """Enforce that Company A cannot access Company B's private dashboard or management data."""
    if current_user.role and current_user.role.name == RoleEnum.EMPLOYER:
        if employer.user_id != current_user.id and employer.hr_email != current_user.email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage another company's private records.",
            )
