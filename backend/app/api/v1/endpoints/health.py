from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, Base
from app.core.config import settings

router = APIRouter()


@router.get("", summary="Health Check")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    table_count = 0
    tables = list(Base.metadata.tables.keys())
    try:
        db.execute(text("SELECT 1"))
        table_count = len(tables)
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "registered_models_count": table_count,
        "models": tables,
        "version": "1.1.0-data-model",
        "theme": "Smart Education",
        "problem_id": "26135 - Difficulties in tracking employment outcomes, skill gaps, and the impact of skilling initiatives",
    }
