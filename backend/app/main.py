import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
from alembic.config import Config
from alembic import command
from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.role import Role, RoleEnum
from app.models.geography import District
from app.api.v1.api import api_router

logger = logging.getLogger("connectx.main")


def run_migrations():
    """
    Automatically execute Alembic migrations on startup up to head.
    Guarantees that database schema and tables exist in all environments.
    """
    try:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
        if os.path.exists(alembic_ini_path):
            alembic_cfg = Config(alembic_ini_path)
            alembic_cfg.set_main_option("sqlalchemy.url", settings.get_database_url())
            alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
            command.upgrade(alembic_cfg, "head")
            logger.info("[Startup] Database schema up to date (Alembic head).")
    except Exception as e:
        logger.warning(f"[Startup Warning] Alembic migration check: {e}")


def init_db_defaults():
    """
    Ensure base system roles and essential default districts exist on startup.
    """
    try:
        inspector = inspect(engine)
        if not inspector.has_table("roles"):
            logger.info("[Startup] 'roles' table not found.")
            return

        db = SessionLocal()
        try:
            # Seed default roles if not existing
            roles_data = [
                (RoleEnum.SUPER_ADMIN, "Super Admin", "Full system access and global platform control"),
                (RoleEnum.STATE_ADMIN, "State Administrator", "State-level oversight across Maharashtra districts"),
                (RoleEnum.DISTRICT_OFFICER, "District Skill Officer", "District-level monitoring, VTP audits and verification"),
                (RoleEnum.TRAINING_PROVIDER, "Training Provider (VTP)", "Batch creation, candidate enrollment & certifications"),
                (RoleEnum.EMPLOYER, "Employer / Industry Partner", "Placement validation, retention tracking & skill gap reporting"),
                (RoleEnum.CANDIDATE, "Skilled Candidate", "Longitudinal career tracking, consent management & credentials"),
            ]
            for role_name, display_name, description in roles_data:
                existing = db.query(Role).filter(Role.name == role_name).first()
                if not existing:
                    role = Role(name=role_name, display_name=display_name, description=description)
                    db.add(role)

            # Ensure at least default Maharashtra districts exist if districts table exists
            if inspector.has_table("districts"):
                default_districts = [
                    ("Pune", "MH-PU", "Pune"),
                    ("Mumbai City", "MH-MC", "Konkan"),
                    ("Mumbai Suburban", "MH-MS", "Konkan"),
                    ("Nagpur", "MH-NG", "Vidarbha"),
                    ("Nashik", "MH-NS", "Khandesh / North Maharashtra"),
                    ("Thane", "MH-TH", "Konkan"),
                ]
                for d_name, d_code, d_div in default_districts:
                    existing_dist = db.query(District).filter(District.code == d_code).first()
                    if not existing_dist:
                        dist = District(name=d_name, code=d_code, division=d_div, state="Maharashtra", is_active=True)
                        db.add(dist)

            db.commit()
            logger.info("[Startup] System base roles and districts verified.")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"[Startup Warning] Could not verify/initialize base roles: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Safe post-migration initialization
    run_migrations()
    init_db_defaults()
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Consent-based longitudinal employment outcome & skill intelligence platform for Government of Maharashtra (SIH 2026 Problem ID: 26135)",
    version="1.1.0-clean",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "organization": "Government of Maharashtra",
        "theme": "Smart Education",
        "problem_id": "26135",
        "description": "Longitudinal tracking from Training to Wage Progression & Career Growth",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
