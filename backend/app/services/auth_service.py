import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    LoginRequest, RegisterRequest,
    CandidateRegisterRequest, CompanyRegisterRequest,
    RecruiterRegisterRequest, ProviderRegisterRequest
)
from app.schemas.user import UserCreate, UserProfile
from app.schemas.token import Token
from app.models.role import Role, RoleEnum
from app.models.user import User
from app.models.candidate import Candidate, CandidateProfile, GenderEnum, CandidateEmploymentStatus
from app.models.employment import Employer, CompanyType
from app.models.training import TrainingProvider, ProviderType
from app.models.geography import District
from app.models.skill import Skill, CandidateSkill
from app.models.governance import AuditLog
from app.auth.password import verify_password, get_password_hash
from app.auth.jwt import create_access_token
from app.core.config import settings


def log_security_event(db: Session, action: str, entity: str, entity_id: str, ip: str = "127.0.0.1", meta: dict = None):
    try:
        audit = AuditLog(
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            timestamp=datetime.now(timezone.utc),
            ip_address=ip,
            metadata_json=meta or {},
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()


def get_or_create_district(db: Session, district_name: Optional[str] = None) -> District:
    if district_name and district_name.strip():
        name_clean = district_name.strip()
        dist = db.query(District).filter(District.name.ilike(name_clean)).first()
        if dist:
            return dist
        code = f"MH-{name_clean[:3].upper()}"
        existing_code = db.query(District).filter(District.code == code).first()
        if existing_code:
            code = f"{code}-{uuid.uuid4().hex[:4].upper()}"
        dist = District(
            name=name_clean,
            code=code,
            division="State",
            state="Maharashtra",
            is_active=True,
        )
        db.add(dist)
        db.flush()
        return dist

    dist = db.query(District).first()
    if not dist:
        dist = District(
            name="Pune",
            code="MH-PU",
            division="Pune",
            state="Maharashtra",
            is_active=True,
        )
        db.add(dist)
        db.flush()
    return dist


def generate_candidate_id(db: Session) -> str:
    current_year = datetime.now(timezone.utc).year
    last_candidate = db.query(Candidate).order_by(Candidate.id.desc()).first()
    next_num = (last_candidate.id + 1) if last_candidate else 1
    return f"CTX-{current_year}-{next_num:06d}"


def generate_employer_code(db: Session) -> str:
    last_emp = db.query(Employer).order_by(Employer.id.desc()).first()
    next_num = (last_emp.id + 1) if last_emp else 1
    return f"EMP-GLB-{next_num:04d}"


def generate_provider_code(db: Session) -> str:
    last_prov = db.query(TrainingProvider).order_by(TrainingProvider.id.desc()).first()
    next_num = (last_prov.id + 1) if last_prov else 1
    return f"ACAD-GLB-{next_num:04d}"


class AuthService:
    @staticmethod
    def authenticate(db: Session, credentials: LoginRequest) -> Token:
        user = UserRepository.get_by_email(db, credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            log_security_event(db, "LOGIN_FAILED", "User", credentials.email, meta={"reason": "bad_credentials"})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.is_active:
            log_security_event(db, "LOGIN_FAILED", "User", str(user.id), meta={"reason": "account_inactive"})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is deactivated. Please contact support.",
            )

        # Log security audit
        log_security_event(db, "LOGIN_SUCCESS", "User", str(user.id), meta={"email": user.email, "role": user.role.name.value if user.role else "UNKNOWN"})

        role_name = user.role.name.value if user.role else RoleEnum.CANDIDATE.value
        role_display = user.role.display_name if user.role else role_name

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=str(user.id),
            role=role_name,
            expires_delta=access_token_expires,
        )

        user_profile = UserProfile(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            role=user.role.name if user.role else RoleEnum.CANDIDATE,
            role_display=role_display,
            district=user.district,
            organization_name=user.organization_name,
            consent_given=user.consent_given,
            is_active=user.is_active,
            is_verified=user.is_verified,
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_profile,
        )

    @staticmethod
    def register_candidate(db: Session, data: CandidateRegisterRequest) -> Token:
        existing = UserRepository.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = UserRepository.get_role_by_name(db, RoleEnum.CANDIDATE)
        if not role:
            role = UserRepository.create_role(db, RoleEnum.CANDIDATE, "Skilled Candidate", "Global talent")

        dist = get_or_create_district(db, data.district)

        try:
            user = User(
                email=data.email.lower().strip(),
                hashed_password=get_password_hash(data.password),
                full_name=data.full_name.strip(),
                phone_number=data.phone_number,
                role_id=role.id,
                district=data.district or dist.name,
                organization_name=None,
                consent_given=data.consent_given,
                consent_date=datetime.now(timezone.utc) if data.consent_given else None,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            # Create linked Candidate record
            candidate = Candidate(
                user_id=user.id,
                candidate_id=generate_candidate_id(db),
                uuid=str(uuid.uuid4()),
                full_name=user.full_name,
                gender=GenderEnum.OTHER,
                education_level=data.education_level,
                phone=user.phone_number,
                email=user.email,
                district_id=dist.id,
                employment_status=CandidateEmploymentStatus.EMPLOYED,
                is_active=True,
            )
            db.add(candidate)
            db.flush()

            # Create Profile
            profile = CandidateProfile(
                candidate_id=candidate.id,
                bio=f"Candidate profile for {user.full_name}",
                expected_salary_min=75000,
                preferred_locations=["Remote", dist.name],
            )
            db.add(profile)

            # Attach skills if specified
            if data.skills:
                for sk_name in data.skills:
                    if not sk_name or not sk_name.strip():
                        continue
                    skill = db.query(Skill).filter(Skill.name.ilike(sk_name.strip())).first()
                    if not skill:
                        skill = Skill(
                            code=f"SKL-{uuid.uuid4().hex[:6].upper()}",
                            name=sk_name.strip(),
                            category="General",
                            description=f"{sk_name.strip()} skill",
                            is_active=True,
                        )
                        db.add(skill)
                        db.flush()
                    db.add(CandidateSkill(candidate_id=candidate.id, skill_id=skill.id))

            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to a server error. Please try again later.",
            )

        log_security_event(db, "USER_CREATED", "Candidate", str(user.id), meta={"email": user.email})
        return AuthService.authenticate(db, LoginRequest(email=data.email, password=data.password))

    @staticmethod
    def register_company(db: Session, data: CompanyRegisterRequest) -> Token:
        existing = UserRepository.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = UserRepository.get_role_by_name(db, RoleEnum.EMPLOYER)
        if not role:
            role = UserRepository.create_role(db, RoleEnum.EMPLOYER, "Employer", "Enterprise partner")

        dist = get_or_create_district(db, data.district)

        try:
            user = User(
                email=data.email.lower().strip(),
                hashed_password=get_password_hash(data.password),
                full_name=data.company_name.strip(),
                phone_number=data.phone_number,
                role_id=role.id,
                district=data.district or dist.name,
                organization_name=data.company_name.strip(),
                consent_given=True,
                consent_date=datetime.now(timezone.utc),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            employer = Employer(
                user_id=user.id,
                employer_code=generate_employer_code(db),
                uuid=str(uuid.uuid4()),
                company_name=data.company_name.strip(),
                industry_sector=data.industry_sector,
                company_type=data.company_type,
                district_id=dist.id,
                address=data.address or data.country or dist.name,
                hr_name=data.company_name,
                hr_email=user.email,
                hr_phone=data.phone_number,
                is_active=True,
            )
            db.add(employer)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to a server error. Please try again later.",
            )

        log_security_event(db, "USER_CREATED", "Employer", str(user.id), meta={"company": data.company_name})
        return AuthService.authenticate(db, LoginRequest(email=data.email, password=data.password))

    @staticmethod
    def register_recruiter(db: Session, data: RecruiterRegisterRequest) -> Token:
        existing = UserRepository.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = UserRepository.get_role_by_name(db, RoleEnum.EMPLOYER)
        if not role:
            role = UserRepository.create_role(db, RoleEnum.EMPLOYER, "Employer", "Enterprise partner")

        dist = get_or_create_district(db, "Pune")

        try:
            user = User(
                email=data.email.lower().strip(),
                hashed_password=get_password_hash(data.password),
                full_name=data.full_name.strip(),
                phone_number=data.phone_number,
                role_id=role.id,
                district="Global",
                organization_name=data.company_name.strip(),
                consent_given=True,
                consent_date=datetime.now(timezone.utc),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            employer = Employer(
                user_id=user.id,
                employer_code=generate_employer_code(db),
                uuid=str(uuid.uuid4()),
                company_name=data.company_name.strip(),
                industry_sector="Recruiting & Staffing",
                company_type=CompanyType.CORPORATE,
                district_id=dist.id,
                hr_name=data.full_name,
                hr_email=user.email,
                hr_phone=data.phone_number,
                is_active=True,
            )
            db.add(employer)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to a server error. Please try again later.",
            )

        log_security_event(db, "USER_CREATED", "Recruiter", str(user.id), meta={"recruiter": data.full_name})
        return AuthService.authenticate(db, LoginRequest(email=data.email, password=data.password))

    @staticmethod
    def register_provider(db: Session, data: ProviderRegisterRequest) -> Token:
        existing = UserRepository.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = UserRepository.get_role_by_name(db, RoleEnum.TRAINING_PROVIDER)
        if not role:
            role = UserRepository.create_role(db, RoleEnum.TRAINING_PROVIDER, "Training Provider", "Academy & education partner")

        dist = get_or_create_district(db, data.district)

        try:
            user = User(
                email=data.email.lower().strip(),
                hashed_password=get_password_hash(data.password),
                full_name=data.name.strip(),
                phone_number=data.phone_number,
                role_id=role.id,
                district=data.district or dist.name,
                organization_name=data.name.strip(),
                consent_given=True,
                consent_date=datetime.now(timezone.utc),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            provider = TrainingProvider(
                user_id=user.id,
                code=generate_provider_code(db),
                uuid=str(uuid.uuid4()),
                name=data.name.strip(),
                provider_type=data.provider_type,
                district_id=dist.id,
                address=data.address or dist.name,
                contact_person=data.name,
                phone=data.phone_number,
                email=data.email,
                accreditation_status=data.accreditation_status,
                is_active=True,
            )
            db.add(provider)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to a server error. Please try again later.",
            )

        log_security_event(db, "USER_CREATED", "TrainingProvider", str(user.id), meta={"academy": data.name})
        return AuthService.authenticate(db, LoginRequest(email=data.email, password=data.password))

    @staticmethod
    def register(db: Session, reg_data: RegisterRequest) -> Token:
        existing = UserRepository.get_by_email(db, reg_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

        role = UserRepository.get_role_by_name(db, reg_data.role_name)
        if not role:
            role = UserRepository.create_role(
                db,
                name=reg_data.role_name,
                display_name=reg_data.role_name.value.replace("_", " ").title(),
            )

        try:
            user = User(
                email=reg_data.email.lower().strip(),
                hashed_password=get_password_hash(reg_data.password),
                full_name=reg_data.full_name.strip(),
                phone_number=reg_data.phone_number,
                role_id=role.id,
                district=reg_data.district,
                organization_name=reg_data.organization_name,
                consent_given=reg_data.consent_given,
                consent_date=datetime.now(timezone.utc) if reg_data.consent_given else None,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed due to a server error. Please try again later.",
            )

        log_security_event(db, "USER_CREATED", "User", str(user.id), meta={"email": user.email, "role": reg_data.role_name.value})
        return AuthService.authenticate(db, LoginRequest(email=reg_data.email, password=reg_data.password))

