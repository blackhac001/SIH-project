from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, health, candidates, skills, courses,
    training_providers, employers, jobs, intelligence,
    interviews, messages, notifications, resumes
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Consent"])
api_router.include_router(users.router, prefix="/users", tags=["Users & RBAC"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["Candidates & Profiles"])
api_router.include_router(resumes.router, prefix="/resume", tags=["Resumes & CVs"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes & CVs (Alias)"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses & Curricula"])
api_router.include_router(training_providers.router, prefix="/training-providers", tags=["Training Providers"])
api_router.include_router(employers.router, prefix="/employers", tags=["Employers & Industry"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs & Opportunities"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["AI Intelligence Engine"])
api_router.include_router(intelligence.router, prefix="/ai", tags=["AI Copilot & Intelligence Engine"])
api_router.include_router(intelligence.router, prefix="/dashboard", tags=["Dashboard Intelligence"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])

api_router.include_router(messages.router, prefix="/messages", tags=["In-App Messaging"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

