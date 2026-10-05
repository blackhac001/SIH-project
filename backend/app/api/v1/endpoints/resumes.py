from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_active_user
from app.schemas.resume import (
    ResumeResponse, ResumeUploadResponse, ResumeStatusResponse, ResumeExtractedTextResponse
)
from app.schemas.resume_analysis import (
    ResumeAnalyzeRequest, ResumeAnalysisDetailResponse, ResumeAnalysisStatusResponse
)
from app.services.resume_service import ResumeService

router = APIRouter()


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload or Replace CV / Resume with Automated Text Extraction"
)
async def upload_resume(
    file: UploadFile = File(..., description="PDF or DOCX document (max 10MB)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Upload a user-specific CV and automatically extract & clean structured text.
    Authenticated ownership is enforced from the JWT.
    Validates file type (PDF/DOCX), magic bytes, non-empty, and max size.
    Stores the document in secure isolated storage and updates active CV state with extracted text.
    """
    resume_resp, preview = ResumeService.upload_resume(db=db, user=current_user, file=file)
    return ResumeUploadResponse(
        message="CV uploaded and structured text extracted successfully.",
        resume=resume_resp,
        extracted_text_preview=preview
    )


@router.get(
    "",
    response_model=ResumeStatusResponse,
    summary="Get Current User's Active CV Status"
)
def get_my_resume_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve the active CV metadata for the currently authenticated user.
    If no CV has been uploaded, returns has_resume: false.
    """
    return ResumeService.get_active_resume(db=db, user=current_user)


@router.get(
    "/text",
    response_model=ResumeExtractedTextResponse,
    summary="Get Clean Extracted Structured Text from Active CV"
)
def get_my_resume_extracted_text(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve clean, structured extracted text from the logged-in user's active CV.
    Ready for AI analysis, ATS scoring, and skill matching.
    """
    return ResumeService.get_extracted_text(db=db, user=current_user)


@router.get(
    "/{resume_id}/text",
    response_model=ResumeExtractedTextResponse,
    summary="Get Clean Extracted Text by Resume ID (Ownership Protected)"
)
def get_resume_extracted_text_by_id(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve clean, structured extracted text from a specific CV ID with strict ownership validation.
    """
    return ResumeService.get_extracted_text(db=db, user=current_user, resume_id=resume_id)


@router.post(
    "/analyze",
    response_model=ResumeAnalysisDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger AI-Powered CV Analysis with Google Gemini"
)
def analyze_my_resume(
    req: Optional[ResumeAnalyzeRequest] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Trigger AI-powered analysis using Google Gemini on the authenticated user's active CV.
    Strictly derives ownership from JWT (user_id).
    Validates non-empty text, calls Gemini with anti-hallucination prompting,
    and returns structured analysis (scores, summary, skills, education, experience, strengths, weaknesses, recommendations, missing sections).
    """
    target_role = req.target_role if req else None
    return ResumeService.analyze_resume(
        db=db,
        user=current_user,
        target_role=target_role
    )


@router.get(
    "/analysis",
    response_model=ResumeAnalysisStatusResponse,
    summary="Get Latest Saved Gemini Analysis for Active CV"
)
def get_my_resume_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve the latest saved Gemini analysis for the authenticated user.
    """
    return ResumeService.get_latest_analysis(db=db, user=current_user)


@router.get(
    "/{resume_id}/analysis",
    response_model=ResumeAnalysisStatusResponse,
    summary="Get Saved Gemini Analysis by Resume ID (Ownership Protected)"
)
def get_resume_analysis_by_id(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve saved Gemini analysis for a specific resume ID with strict ownership validation.
    """
    return ResumeService.get_latest_analysis(db=db, user=current_user, resume_id=resume_id)


@router.get(
    "/download",
    summary="Download Authenticated User's Active CV"
)
def download_my_resume(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Securely download the active CV of the logged-in user.
    Strictly verifies ownership: users can only download their own file.
    """
    file_path, filename, content_type = ResumeService.get_resume_for_download(
        db=db, user=current_user
    )
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=content_type,
        content_disposition_type="attachment"
    )


@router.get(
    "/{resume_id}/download",
    summary="Download Specific CV by ID (Ownership Protected)"
)
def download_resume_by_id(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Download a specific CV by ID with strict ownership validation (must belong to authenticated user).
    """
    file_path, filename, content_type = ResumeService.get_resume_for_download(
        db=db, user=current_user, resume_id=resume_id
    )
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=content_type,
        content_disposition_type="attachment"
    )


@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Delete Active CV"
)
def delete_my_resume(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Delete the active CV and associated extracted text for the authenticated user.
    """
    ResumeService.delete_resume(db=db, user=current_user)
    return {"message": "Active CV and extracted text deleted successfully."}


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete CV by ID (Ownership Protected)"
)
def delete_resume_by_id(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Delete a specific CV by ID with strict ownership validation.
    """
    ResumeService.delete_resume(db=db, user=current_user, resume_id=resume_id)
    return {"message": f"Resume ID {resume_id} deleted successfully."}
