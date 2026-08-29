from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.training import Course
from app.models.skill import CourseSkill, Skill
from app.schemas.training import CourseCreate, CourseResponse
from app.auth.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[CourseResponse], summary="List Courses")
def list_courses(
    sector: Optional[str] = Query(None, description="Filter by industry sector"),
    nsqf_level: Optional[int] = Query(None, description="Filter by NSQF Level"),
    search: Optional[str] = Query(None, description="Search by title or code"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Course).filter(Course.is_active == True)
    if sector:
        query = query.filter(Course.sector.ilike(f"%{sector.strip()}%"))
    if nsqf_level:
        query = query.filter(Course.nsqf_level == nsqf_level)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Course.title.ilike(s)) | (Course.code.ilike(s)))
    return query.order_by(Course.title.asc()).all()


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED, summary="Create Course")
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(Course).filter(Course.code == course_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course with code '{course_in.code}' already exists."
        )

    course_data = course_in.model_dump(exclude={"skill_ids"})
    course = Course(**course_data)
    db.add(course)
    db.flush()

    if course_in.skill_ids:
        for s_id in course_in.skill_ids:
            skill = db.query(Skill).filter(Skill.id == s_id).first()
            if skill:
                db.add(CourseSkill(course_id=course.id, skill_id=skill.id))

    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseResponse, summary="Get Course by ID")
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course {course_id} not found.")
    return course
