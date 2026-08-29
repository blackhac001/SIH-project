import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.employment import Employer, Job, Application, Interview, InterviewStatus, ApplicationStatus
from app.models.governance import Notification
from app.auth.dependencies import get_current_active_user
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter()


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED, summary="Schedule Interview")
def schedule_interview(
    interview_in: InterviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Employer schedules an interview with a candidate for an active application."""
    application = db.query(Application).filter(Application.id == interview_in.application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    employer = db.query(Employer).filter((Employer.user_id == current_user.id) | (Employer.hr_email == current_user.email)).first()
    if not employer:
        employer = application.job.employer if application.job else None

    if not employer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Employer record required to schedule.")

    interview = Interview(
        uuid=str(uuid.uuid4()),
        application_id=application.id,
        candidate_id=application.candidate_id,
        employer_id=employer.id,
        job_id=application.job_id,
        scheduled_at=interview_in.scheduled_at,
        interview_type=interview_in.interview_type,
        status=InterviewStatus.SCHEDULED,
        meeting_link=interview_in.meeting_link or "https://meet.connectx.ai/room-secure",
        interviewer_name=interview_in.interviewer_name or employer.company_name,
        notes=interview_in.notes,
    )
    db.add(interview)

    # Update application status to INTERVIEWED
    application.status = ApplicationStatus.INTERVIEWED

    # Send Notification to Candidate
    if application.candidate and application.candidate.user_id:
        db.add(Notification(
            user_id=application.candidate.user_id,
            title="Interview Scheduled",
            message=f"{employer.company_name} scheduled a {interview_in.interview_type.value} interview for {application.job.title if application.job else 'the position'}.",
            notification_type="INTERVIEW"
        ))

    db.commit()
    db.refresh(interview)
    return interview


@router.get("/my", response_model=List[InterviewResponse], summary="List Current User's Interviews")
def get_my_interviews(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve all scheduled interviews for the authenticated candidate or employer."""
    candidate = db.query(Candidate).filter((Candidate.user_id == current_user.id) | (Candidate.email == current_user.email)).first()
    if candidate:
        return db.query(Interview).filter(Interview.candidate_id == candidate.id).order_by(Interview.scheduled_at.asc()).all()

    employer = db.query(Employer).filter((Employer.user_id == current_user.id) | (Employer.hr_email == current_user.email)).first()
    if employer:
        return db.query(Interview).filter(Interview.employer_id == employer.id).order_by(Interview.scheduled_at.asc()).all()

    return []


@router.put("/{interview_id}/status", response_model=InterviewResponse, summary="Update Interview Status")
def update_interview_status(
    interview_id: int,
    status_update: InterviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update status of a scheduled interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found.")

    if status_update.status:
        interview.status = status_update.status
    if status_update.notes:
        interview.notes = status_update.notes
    if status_update.meeting_link:
        interview.meeting_link = status_update.meeting_link

    db.commit()
    db.refresh(interview)
    return interview
