from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.auth.dependencies import get_current_active_user, get_current_candidate
from app.services.intelligence_service import IntelligenceService
from app.schemas.intelligence import (
    ResumeAnalysisRequest, ResumeAnalysisResponse,
    SkillGapRequest, SkillGapResponse,
    SalaryPredictionRequest, SalaryProjectionResponse,
    FutureSkillItem, CopilotChatRequest, CopilotChatResponse,
    DashboardKPIsResponse
)

router = APIRouter()


@router.post("/analyze-resume", response_model=ResumeAnalysisResponse, summary="Analyze Resume with AI")
def analyze_resume(
    req: ResumeAnalysisRequest,
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Parse resume text, calculate ATS score, extract verified skills, and persist to candidate capability ledger."""
    return IntelligenceService.analyze_resume(
        db,
        candidate=candidate,
        resume_text=req.resume_text,
        target_role=req.target_role or "Senior AI & Cloud Platform Engineer"
    )


@router.post("/skill-gap", response_model=SkillGapResponse, summary="Calculate AI Skill Gaps")
def calculate_skill_gap(
    req: SkillGapRequest,
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Compute precise skill gaps against real job curriculum and generate curated learning roadmap."""
    return IntelligenceService.compute_skill_gap(
        db,
        candidate=candidate,
        target_role=req.target_role or "Principal AI & Cloud Architect",
        custom_skills=req.custom_skills
    )


@router.post("/salary-prediction", response_model=SalaryProjectionResponse, summary="Calculate 5-Year Salary Forecast")
@router.get("/salary-prediction", response_model=SalaryProjectionResponse, summary="Calculate 5-Year Salary Forecast (GET Alias)")
def predict_salary(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Calculate deterministic market compensation range and 5-year timeline from verified skills."""
    return IntelligenceService.calculate_salary_projection(db, candidate)


@router.get("/future-skills", response_model=List[FutureSkillItem], summary="Get Real-Time Future Skills Demand")
def get_future_skills(db: Session = Depends(get_db)):
    """Retrieve high-growth emerging skills and salary premiums derived from platform job demands."""
    return IntelligenceService.get_future_skills(db)


@router.post("/copilot", response_model=CopilotChatResponse, summary="Chat with Career Copilot")
@router.post("/chat", response_model=CopilotChatResponse, summary="Chat with Ask AI (Alias)")
def chat_copilot(
    req: CopilotChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Context-aware AI career assistant personalized to the authenticated candidate's capability profile."""
    return IntelligenceService.chat_copilot(
        db,
        user=current_user,
        message=req.message,
        conversation_history=req.conversation_history
    )


@router.post("/copilot/stream", summary="Stream Chat with Ask AI via SSE")
@router.post("/chat/stream", summary="Stream Chat with Ask AI (Alias)")
def stream_copilot(
    req: CopilotChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Real-time SSE streaming for Ask AI intelligence engine with authorized user context."""
    stream_gen = IntelligenceService.chat_copilot_stream(
        db,
        user=current_user,
        message=req.message,
        conversation_history=req.conversation_history
    )
    return StreamingResponse(
        stream_gen,
        media_type="text/event-stream",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )



@router.get("/dashboard-kpis", response_model=DashboardKPIsResponse, summary="Get Real Database-Derived KPIs")
@router.get("/stats", response_model=DashboardKPIsResponse, summary="Get Dashboard Statistics (Alias)")
def get_dashboard_kpis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve real-time dashboard KPIs and activity feeds computed from database records."""
    return IntelligenceService.get_dashboard_kpis(db, current_user)

