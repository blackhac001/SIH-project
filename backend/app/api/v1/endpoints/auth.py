from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    LoginRequest, RegisterRequest,
    CandidateRegisterRequest, CompanyRegisterRequest,
    RecruiterRegisterRequest, ProviderRegisterRequest,
    PasswordResetRequest, PasswordResetConfirmRequest
)
from app.schemas.token import Token
from app.schemas.user import UserProfile, UserResponse
from app.schemas.role import RoleResponse
from app.services.auth_service import AuthService, log_security_event
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.auth.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/login", response_model=Token, summary="Login with Email & Password")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token along with user profile."""
    return AuthService.authenticate(db, credentials)


@router.post("/login/oauth", response_model=Token, summary="OAuth2 Compatible Login Form")
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password form compatible authentication for Swagger UI."""
    return AuthService.authenticate(
        db,
        LoginRequest(email=form_data.username, password=form_data.password)
    )


@router.post("/register/candidate", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Candidate Account")
def register_candidate(reg_data: CandidateRegisterRequest, db: Session = Depends(get_db)):
    """Create a new Candidate account with linked Candidate and CandidateProfile models."""
    return AuthService.register_candidate(db, reg_data)


@router.post("/register/company", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Company Account")
def register_company(reg_data: CompanyRegisterRequest, db: Session = Depends(get_db)):
    """Create a new Employer / Company account with linked Employer model."""
    return AuthService.register_company(db, reg_data)


@router.post("/register/recruiter", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Recruiter Account")
def register_recruiter(reg_data: RecruiterRegisterRequest, db: Session = Depends(get_db)):
    """Create a new Recruiter account."""
    return AuthService.register_recruiter(db, reg_data)


@router.post("/register/provider", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Training Provider Account")
def register_provider(reg_data: ProviderRegisterRequest, db: Session = Depends(get_db)):
    """Create a new Training Provider / Academy account with linked TrainingProvider model."""
    return AuthService.register_provider(db, reg_data)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register New User")
def register(reg_data: RegisterRequest, db: Session = Depends(get_db)):
    """Generic registration endpoint defaulting to candidate onboarding."""
    return AuthService.register(db, reg_data)


@router.post("/logout", summary="Logout Current User")
def logout(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Log security audit for user logout."""
    log_security_event(db, "LOGOUT", "User", str(current_user.id), meta={"email": current_user.email})
    return {"message": "Logged out successfully."}


@router.post("/forgot-password", summary="Request Password Reset")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    """Generate password reset token simulation without exposing account existence."""
    user = UserRepository.get_by_email(db, req.email)
    if user:
        log_security_event(db, "PASSWORD_RESET_REQUESTED", "User", str(user.id), meta={"email": req.email})
    return {"message": "If an account with this email exists, a password reset link has been dispatched."}


@router.get("/me", response_model=UserProfile, summary="Get Current Authenticated User")
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Retrieve profile and permissions for the currently authenticated user."""
    return UserService.get_profile(current_user)


@router.post("/consent", response_model=UserProfile, summary="Update Candidate Tracking Consent")
def update_consent(
    consent_given: bool,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update longitudinal tracking consent status for the logged-in candidate."""
    from app.schemas.user import UserUpdate
    return UserService.update_profile(db, current_user, UserUpdate(consent_given=consent_given))


@router.get("/roles", response_model=List[RoleResponse], summary="List All System Roles")
def list_roles(db: Session = Depends(get_db)):
    """List all available system roles with descriptions."""
    return UserRepository.get_all_roles(db)
