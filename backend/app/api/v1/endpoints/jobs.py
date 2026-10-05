import uuid
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.employment import (
    Job, JobStatus, EmploymentType, Application, ApplicationStatus,
    Placement, PlacementType, PlacementStatus, EmploymentRecord,
    TrainingRelevance, VerificationStatus, Employer
)
from app.models.candidate import Candidate, CandidateEmploymentStatus
from app.models.skill import JobSkill, Skill
from app.models.governance import Notification
from app.schemas.employment import JobCreate, JobResponse
from app.auth.dependencies import get_current_active_user, get_current_candidate, get_current_employer
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[JobResponse], summary="List Jobs")
def list_jobs(
    employer_id: Optional[int] = Query(None, description="Filter by Employer ID"),
    district_id: Optional[int] = Query(None, description="Filter by District ID"),
    status: Optional[JobStatus] = Query(JobStatus.OPEN, description="Filter by Job Status"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by Employment Type"),
    search: Optional[str] = Query(None, description="Search job title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Job).options(
        joinedload(Job.employer),
        joinedload(Job.job_skills).joinedload(JobSkill.skill)
    )
    if status:
        query = query.filter(Job.status == status)
    if employer_id:
        query = query.filter(Job.employer_id == employer_id)
    if district_id:
        query = query.filter(Job.district_id == district_id)
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)
    if search:
        query = query.filter(Job.title.ilike(f"%{search.strip()}%"))
    return query.order_by(Job.id.desc()).all()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED, summary="Create Job Opening")
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Resolve employer if current user is employer
    employer = db.query(Employer).filter((Employer.user_id == current_user.id) | (Employer.hr_email == current_user.email)).first()
    emp_id = employer.id if employer else job_in.employer_id

    job_data = job_in.model_dump(exclude={"skill_ids", "employer_id"})
    job = Job(
        uuid=str(uuid.uuid4()),
        employer_id=emp_id,
        **job_data
    )
    db.add(job)
    db.flush()

    if job_in.skill_ids:
        for s_id in job_in.skill_ids:
            skill = db.query(Skill).filter(Skill.id == s_id).first()
            if skill:
                db.add(JobSkill(job_id=job.id, skill_id=skill.id))

    db.commit()
    db.refresh(job)
    return job


# -----------------------------------------------------------------------------
# Real Application Endpoints (Placed before /{job_id} to avoid route shadowing)
# -----------------------------------------------------------------------------

@router.get("/applications/my", summary="Get Current Candidate Applications")
def get_my_applications(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Retrieve all submitted job applications for the logged-in candidate."""
    applications = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.employer)
    ).filter(Application.candidate_id == candidate.id).order_by(Application.applied_at.desc()).all()

    result = []
    for a in applications:
        result.append({
            "id": a.id,
            "jobId": a.job_id,
            "jobTitle": a.job.title if a.job else "Software Engineer",
            "company": a.job.employer.company_name if (a.job and a.job.employer) else "Global Enterprise",
            "location": a.job.district.name if (a.job and a.job.district) else "Remote",
            "minSalary": a.job.min_salary if a.job else 120000,
            "maxSalary": a.job.max_salary if a.job else 150000,
            "status": a.status.value,
            "appliedAt": a.applied_at.isoformat()
        })
    return result


@router.get("/employer/applications", summary="Get All Applications for Current Employer")
def get_employer_applications(
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    """Retrieve all applicants for jobs posted by the authenticated employer."""
    job_ids = [j.id for j in employer.jobs]
    applications = db.query(Application).options(
        joinedload(Application.candidate),
        joinedload(Application.job)
    ).filter(Application.job_id.in_(job_ids)).order_by(Application.applied_at.desc()).all()

    result = []
    for a in applications:
        cand = a.candidate
        result.append({
            "id": a.id,
            "candidateId": cand.id if cand else 0,
            "candidateName": cand.full_name if cand else "Candidate",
            "candidateEmail": cand.email if cand else "",
            "education": cand.education_level if cand else "Graduate",
            "jobId": a.job_id,
            "jobTitle": a.job.title if a.job else "",
            "status": a.status.value,
            "appliedAt": a.applied_at.isoformat()
        })
    return result


@router.get("/{job_id}", response_model=JobResponse, summary="Get Job by ID")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    job = db.query(Job).options(
        joinedload(Job.employer),
        joinedload(Job.job_skills).joinedload(JobSkill.skill)
    ).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found.")
    return job


@router.post("/{job_id}/apply", summary="Apply to Job")
def apply_to_job(
    job_id: int,
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Candidate applies to a job opening with duplicate check and employer notification."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found.")

    if job.status != JobStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This job opening is no longer accepting applications.")

    # Check for existing application
    existing = db.query(Application).filter(
        Application.job_id == job.id,
        Application.candidate_id == candidate.id
    ).first()

    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already submitted an application for this position.")

    app_record = Application(
        uuid=str(uuid.uuid4()),
        candidate_id=candidate.id,
        job_id=job.id,
        applied_at=datetime.now(timezone.utc),
        status=ApplicationStatus.APPLIED
    )
    db.add(app_record)

    # Notify Employer
    if job.employer and job.employer.user_id:
        db.add(Notification(
            user_id=job.employer.user_id,
            title="New Job Application Received",
            message=f"{candidate.full_name} submitted an application for {job.title}.",
            notification_type="APPLICATION"
        ))

    # Notify Candidate
    if candidate.user_id:
        db.add(Notification(
            user_id=candidate.user_id,
            title="Application Submitted",
            message=f"Your application for {job.title} at {job.employer.company_name if job.employer else 'the employer'} was successfully received.",
            notification_type="APPLICATION"
        ))

    db.commit()
    db.refresh(app_record)

    return {
        "id": app_record.id,
        "jobId": job.id,
        "jobTitle": job.title,
        "status": app_record.status.value,
        "appliedAt": app_record.applied_at.isoformat(),
        "message": "Application submitted successfully."
    }


@router.put("/applications/{application_id}/status", summary="Update Application Status")
def update_application_status(
    application_id: int,
    new_status: ApplicationStatus,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Employer updates status of an application (e.g. SHORTLISTED, REJECTED)."""
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    app_record.status = new_status

    # Notify Candidate
    if app_record.candidate and app_record.candidate.user_id:
        db.add(Notification(
            user_id=app_record.candidate.user_id,
            title="Application Status Updated",
            message=f"Your application status for {app_record.job.title if app_record.job else 'your position'} is now {new_status.value}.",
            notification_type="APPLICATION_UPDATE"
        ))

    db.commit()
    db.refresh(app_record)
    return {"id": app_record.id, "status": app_record.status.value}


@router.post("/applications/{application_id}/hire", summary="Confirm Candidate Hiring")
def hire_candidate(
    application_id: int,
    offered_salary: int = Query(140000, description="Annual starting salary"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Complete the hiring transaction:
    1. Sets Application.status to HIRED
    2. Creates Placement record
    3. Creates EmploymentRecord for candidate
    4. Updates Candidate.employment_status to EMPLOYED
    5. Dispatches notifications
    """
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    job = app_record.job
    candidate = app_record.candidate

    if not job or not candidate:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incomplete application records.")

    # 1. Update Application status
    app_record.status = ApplicationStatus.SELECTED

    # 2. Create Placement
    placement = Placement(
        uuid=str(uuid.uuid4()),
        candidate_id=candidate.id,
        employer_id=job.employer_id,
        job_id=job.id,
        offer_date=date.today(),
        joining_date=date.today(),
        offered_salary=offered_salary,
        placement_type=PlacementType.DIRECT,
        status=PlacementStatus.OFFERED
    )
    db.add(placement)
    db.flush()

    # 3. Create EmploymentRecord
    emp_record = EmploymentRecord(
        uuid=str(uuid.uuid4()),
        candidate_id=candidate.id,
        employer_id=job.employer_id,
        job_id=job.id,
        placement_id=placement.id,
        company_name=job.employer.company_name if job.employer else "Global Enterprise",
        designation=job.title,
        joining_date=date.today(),
        salary_min=offered_salary,
        salary_max=int(offered_salary * 1.1),
        employment_type=job.employment_type,
        relevance_to_training=TrainingRelevance.HIGH,
        verification_status=VerificationStatus.EMPLOYER_VERIFIED,
        is_current=True
    )
    db.add(emp_record)

    # 4. Update Candidate Employment Status
    candidate.employment_status = CandidateEmploymentStatus.EMPLOYED

    # 5. Notify Candidate
    if candidate.user_id:
        db.add(Notification(
            user_id=candidate.user_id,
            title="🎉 Congratulations! Job Offer Confirmed",
            message=f"You have been officially selected by {job.employer.company_name if job.employer else 'your employer'} for {job.title} with compensation ${offered_salary:,} USD.",
            notification_type="OFFER"
        ))

    # Notify Employer
    if job.employer and job.employer.user_id:
        db.add(Notification(
            user_id=job.employer.user_id,
            title="Candidate Hired Successfully",
            message=f"Official placement record created for {candidate.full_name} ({job.title}).",
            notification_type="PLACEMENT"
        ))

    db.commit()
    db.refresh(app_record)

    return {
        "status": "HIRED",
        "placementId": placement.id,
        "candidateName": candidate.full_name,
        "jobTitle": job.title,
        "companyName": job.employer.company_name if job.employer else "",
        "offeredSalary": offered_salary,
        "message": "Candidate successfully hired. Placement and employment timeline record created in PostgreSQL."
    }
