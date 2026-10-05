import os
import re
import uuid
import hashlib
import logging
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.candidate import Candidate, CandidateProfile
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.schemas.resume import (
    ResumeResponse, ResumeStatusResponse, ResumeExtractedTextResponse
)
from app.schemas.resume_analysis import (
    ResumeAnalysisDetailResponse, ResumeAnalysisStatusResponse
)
from app.utils.text_extractor import extract_resume_text
from app.services.gemini_service import GeminiService

logger = logging.getLogger("connectx.resume")

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",  # Fallback often sent by some browsers
}

# Magic bytes headers for content verification
PDF_MAGIC_BYTES = b"%PDF"
DOCX_MAGIC_BYTES = b"PK\x03\x04"


def sanitize_filename(filename: str) -> str:
    """Sanitize the original filename to prevent path traversal and unsafe characters."""
    clean_name = os.path.basename(filename)
    clean_name = clean_name.replace("\x00", "").strip()
    clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', clean_name)
    if not clean_name:
        clean_name = "uploaded_cv"
    return clean_name


def get_storage_base_dir() -> str:
    """Resolve absolute base storage directory for uploaded resumes."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    storage_dir = os.path.join(backend_dir, "storage", "resumes")
    os.makedirs(storage_dir, exist_ok=True)
    return storage_dir


class ResumeService:
    @staticmethod
    def _validate_file(file: UploadFile, content: bytes) -> str:
        """
        Validate file extension, mime type, magic bytes, and file size.
        Returns the normalized extension (e.g. '.pdf' or '.docx').
        """
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty (0 bytes). Please upload a valid document."
            )

        if len(content) > MAX_FILE_SIZE_BYTES:
            size_mb = len(content) / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size ({size_mb:.2f} MB) exceeds maximum allowed limit of 10 MB."
            )

        # Check extension
        original_name = file.filename or ""
        _, ext = os.path.splitext(original_name.lower())
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension '{ext}'. Only PDF (.pdf) and Word (.docx) documents are supported."
            )

        # Check MIME type
        content_type = (file.content_type or "").lower()
        if content_type and content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid MIME type '{content_type}'. Expected application/pdf or docx."
            )

        # Check Magic Bytes
        if ext == ".pdf" and not content.startswith(PDF_MAGIC_BYTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match standard PDF structure (invalid magic bytes header)."
            )
        elif ext == ".docx" and not content.startswith(DOCX_MAGIC_BYTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match standard DOCX structure (invalid ZIP container header)."
            )

        return ext

    @classmethod
    def upload_resume(cls, db: Session, user: User, file: UploadFile) -> Tuple[ResumeResponse, Optional[str]]:
        """
        Securely store an uploaded CV for the authenticated user, perform text extraction,
        and record both file metadata and cleaned structured text in PostgreSQL.
        Authenticated ownership is guaranteed: owner = user.id from JWT.
        """
        # Read file content safely
        try:
            content = file.file.read()
        except Exception as e:
            logger.error(f"Failed to read uploaded file: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to read the uploaded file stream."
            )

        # Validate file
        ext = cls._validate_file(file, content)
        clean_original_filename = sanitize_filename(file.filename or f"resume{ext}")
        file_size = len(content)
        file_hash = hashlib.sha256(content).hexdigest()
        content_type = file.content_type or ("application/pdf" if ext == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

        # Resolve storage directory isolated per user: storage/resumes/user_{id}/
        base_storage = get_storage_base_dir()
        user_storage_dir = os.path.join(base_storage, f"user_{user.id}")
        os.makedirs(user_storage_dir, exist_ok=True)

        file_uuid = str(uuid.uuid4())
        stored_filename = f"{file_uuid}_{clean_original_filename}"
        disk_path = os.path.join(user_storage_dir, stored_filename)

        # Save to disk
        try:
            with open(disk_path, "wb") as f:
                f.write(content)
        except Exception as e:
            logger.error(f"Failed to save resume file to disk at '{disk_path}': {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save file to secure storage. Please try again."
            )

        # -------------------------------------------------------------------------
        # STEP 2: CV TEXT EXTRACTION & STRUCTURED CLEANING
        # -------------------------------------------------------------------------
        extracted_text, char_count, word_count, extraction_status, extraction_error = extract_resume_text(
            file_bytes=content,
            filename=clean_original_filename
        )

        logger.info(
            f"[Text Extraction] User {user.id} file '{clean_original_filename}': "
            f"status={extraction_status}, chars={char_count}, words={word_count}"
        )

        # Find any existing active resumes for this user and mark as inactive (replace workflow)
        db.query(Resume).filter(
            Resume.user_id == user.id,
            Resume.is_active == True
        ).update({"is_active": False})

        # Check candidate link if user is linked to Candidate entity
        candidate = db.query(Candidate).filter(
            (Candidate.user_id == user.id) | (Candidate.email == user.email)
        ).first()

        candidate_id = candidate.id if candidate else None

        # Create new active Resume record with extracted text
        resume_record = Resume(
            uuid=file_uuid,
            user_id=user.id,
            candidate_id=candidate_id,
            filename=clean_original_filename,
            stored_filename=stored_filename,
            file_path=disk_path,
            file_size=file_size,
            content_type=content_type,
            file_hash=file_hash,
            is_active=True,
            extracted_text=extracted_text,
            char_count=char_count,
            word_count=word_count,
            extraction_status=extraction_status,
            extraction_error=extraction_error,
        )
        db.add(resume_record)

        # If candidate has a CandidateProfile, update resume_url and metadata
        if candidate:
            if not candidate.profile:
                candidate.profile = CandidateProfile(candidate_id=candidate.id)
                db.add(candidate.profile)
            
            candidate.profile.resume_url = f"/api/v1/resume/download"
            refs = dict(candidate.profile.external_references or {})
            refs["active_resume"] = {
                "filename": clean_original_filename,
                "file_size": file_size,
                "content_type": content_type,
                "char_count": char_count,
                "word_count": word_count,
                "extraction_status": extraction_status,
                "uploaded_at": resume_record.created_at.isoformat() if resume_record.created_at else None,
                "resume_uuid": file_uuid
            }
            candidate.profile.external_references = refs

        db.commit()
        db.refresh(resume_record)

        logger.info(f"[Resume Upload] User {user.id} ({user.email}) uploaded '{clean_original_filename}' ({file_size} bytes).")
        return cls._format_response(resume_record), extracted_text[:200] if extracted_text else None

    @classmethod
    def get_active_resume(cls, db: Session, user: User) -> ResumeStatusResponse:
        """Retrieve the currently active resume for the authenticated user."""
        resume = db.query(Resume).filter(
            Resume.user_id == user.id,
            Resume.is_active == True
        ).order_by(Resume.id.desc()).first()

        if not resume:
            return ResumeStatusResponse(has_resume=False, resume=None)

        return ResumeStatusResponse(
            has_resume=True,
            resume=cls._format_response(resume)
        )

    @classmethod
    def get_extracted_text(cls, db: Session, user: User, resume_id: Optional[int] = None) -> ResumeExtractedTextResponse:
        """
        Retrieve structured extracted text with strict authenticated ownership verification.
        """
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Requested resume not found."
                )
            if resume.user_id != user.id:
                logger.warning(f"[Security Alert] User {user.id} attempted to read extracted text of Resume {resume_id} owned by User {resume.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this resume's extracted text."
                )
        else:
            resume = db.query(Resume).filter(
                Resume.user_id == user.id,
                Resume.is_active == True
            ).order_by(Resume.id.desc()).first()

            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active resume found for your account. Please upload a CV first."
                )

        has_text = bool(resume.extracted_text and len(resume.extracted_text.strip()) > 0)

        return ResumeExtractedTextResponse(
            resume_id=resume.id,
            filename=resume.filename,
            extracted_text=resume.extracted_text,
            char_count=resume.char_count,
            word_count=resume.word_count,
            extraction_status=resume.extraction_status,
            extraction_error=resume.extraction_error,
            has_extractable_text=has_text
        )

    @classmethod
    def get_resume_for_download(cls, db: Session, user: User, resume_id: Optional[int] = None) -> Tuple[str, str, str]:
        """
        Verify authenticated ownership and return (disk_path, original_filename, content_type).
        Strictly enforces that user can ONLY download their own resume.
        """
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Requested resume not found."
                )
            if resume.user_id != user.id:
                logger.warning(f"[Security Alert] User {user.id} attempted unauthorized access to Resume {resume_id} owned by User {resume.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to download this resume."
                )
        else:
            resume = db.query(Resume).filter(
                Resume.user_id == user.id,
                Resume.is_active == True
            ).order_by(Resume.id.desc()).first()

            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active resume found for your account."
                )

        if not os.path.exists(resume.file_path):
            logger.error(f"Resume file missing on disk at '{resume.file_path}' for resume ID {resume.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume file is not available on storage server."
            )

        return resume.file_path, resume.filename, resume.content_type

    @classmethod
    def delete_resume(cls, db: Session, user: User, resume_id: Optional[int] = None) -> None:
        """
        Delete/deactivate resume record with strict ownership verification.
        """
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Requested resume not found."
                )
            if resume.user_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to delete this resume."
                )
            if resume.file_path and os.path.exists(resume.file_path):
                try:
                    os.remove(resume.file_path)
                except Exception as e:
                    logger.warning(f"Could not remove file '{resume.file_path}': {e}")
            db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).delete()
            db.delete(resume)
        else:
            resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
            for r in resumes:
                if r.file_path and os.path.exists(r.file_path):
                    try:
                        os.remove(r.file_path)
                    except Exception as e:
                        logger.warning(f"Could not remove file '{r.file_path}': {e}")
                db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).delete()
                db.delete(r)

        # Update candidate profile if attached
        candidate = db.query(Candidate).filter(
            (Candidate.user_id == user.id) | (Candidate.email == user.email)
        ).first()

        if candidate and candidate.profile:
            candidate.profile.resume_url = None
            if candidate.profile.external_references and "active_resume" in candidate.profile.external_references:
                refs = dict(candidate.profile.external_references)
                refs.pop("active_resume", None)
                candidate.profile.external_references = refs

        db.commit()
        logger.info(f"[Resume Delete] User {user.id} reset resume records.")

    @classmethod
    def analyze_resume(
        cls,
        db: Session,
        user: User,
        target_role: Optional[str] = None,
        resume_id: Optional[int] = None
    ) -> ResumeAnalysisDetailResponse:
        """
        Execute AI-Powered CV Analysis using Google Gemini on the authenticated user's CV.
        Strictly enforces user isolation: derives user.id from JWT.
        Retrieves clean extracted text, passes to Gemini with anti-hallucination prompting,
        persists structured analysis in PostgreSQL, and returns verified results.
        """
        # 1. Fetch the user's active resume (or specific resume_id with ownership check)
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Requested resume not found."
                )
            if resume.user_id != user.id:
                logger.warning(f"[Security Alert] User {user.id} attempted to analyze Resume {resume_id} owned by User {resume.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to analyze this resume."
                )
        else:
            resume = db.query(Resume).filter(
                Resume.user_id == user.id,
                Resume.is_active == True
            ).order_by(Resume.id.desc()).first()

            if not resume:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active CV found for your account. Please upload a CV first before running AI analysis."
                )

        # 2. Check for extractable text
        if not resume.extracted_text or len(resume.extracted_text.strip()) == 0 or resume.extraction_status == "NO_TEXT_DETECTED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot perform AI analysis because no extractable text was found in the uploaded CV. Please upload a standard text-based PDF or DOCX document."
            )

        # 3. Call GeminiService
        role_label = target_role or "General / As Described in CV"
        analysis_dict, model_used, error = GeminiService.analyze_cv(
            extracted_text=resume.extracted_text,
            target_role=role_label
        )

        if not analysis_dict:
            # Record failed analysis attempt for diagnostics and retry
            fail_record = ResumeAnalysis(
                user_id=user.id,
                resume_id=resume.id,
                candidate_id=resume.candidate_id,
                target_role=role_label,
                analysis_status="FAILED",
                error_message=error or "AI analysis failed to generate structured output.",
                model_used=model_used,
                raw_text=resume.extracted_text[:1000]
            )
            db.add(fail_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI analysis service encountered an error: {error}. Please try again."
            )

        # 4. Save successful analysis in DB
        analysis_record = ResumeAnalysis(
            user_id=user.id,
            resume_id=resume.id,
            candidate_id=resume.candidate_id,
            target_role=role_label,
            seniority="Senior Lead Level" if len(analysis_dict.get("skills", [])) >= 6 else "Mid-Level Professional",
            resume_score=analysis_dict.get("resume_score", 75),
            ats_score=analysis_dict.get("ats_score", 75),
            job_readiness=analysis_dict.get("job_readiness", 75),
            summary=analysis_dict.get("summary"),
            skills=analysis_dict.get("skills", []),
            technical_skills=analysis_dict.get("technical_skills") or analysis_dict.get("skills", []),
            soft_skills=analysis_dict.get("soft_skills", []),
            education=analysis_dict.get("education", []),
            experience=analysis_dict.get("experience", []),
            projects=analysis_dict.get("projects", []),
            certifications=analysis_dict.get("certifications", []),
            strengths=analysis_dict.get("strengths", []),
            weaknesses=analysis_dict.get("weaknesses", []),
            recommendations=analysis_dict.get("recommendations", []),
            missing_sections=analysis_dict.get("missing_sections", []),
            extracted_skills=analysis_dict.get("extracted_skills", []),
            missing_keywords=analysis_dict.get("missing_keywords", []),
            job_match_comparisons=analysis_dict.get("job_match_comparisons", []),
            analysis_status="SUCCESS",
            error_message=None,
            model_used=model_used,
            raw_text=resume.extracted_text[:2000]
        )
        db.add(analysis_record)

        # 5. Update Candidate skills if attached
        candidate = db.query(Candidate).filter(
            (Candidate.user_id == user.id) | (Candidate.email == user.email)
        ).first()

        if candidate:
            from app.models.skill import Skill, CandidateSkill, ProficiencyLevel
            unique_skill_names = []
            seen_lower = set()
            for s in (analysis_dict.get("technical_skills", []) + analysis_dict.get("skills", [])):
                if s and isinstance(s, str):
                    s_clean = s.strip()
                    if s_clean.lower() not in seen_lower:
                        seen_lower.add(s_clean.lower())
                        unique_skill_names.append(s_clean)

            seen_skill_ids = set()
            for skill_name in unique_skill_names[:10]:
                db_skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
                if not db_skill:
                    import hashlib
                    code_hash = hashlib.md5(skill_name.strip().lower().encode('utf-8')).hexdigest()[:6].upper()
                    base_code = f"SKL-{code_hash}"
                    unique_code = base_code
                    counter = 1
                    while db.query(Skill).filter(Skill.code == unique_code).first():
                        unique_code = f"SKL-{code_hash}-{counter}"
                        counter += 1

                    db_skill = Skill(
                        code=unique_code,
                        name=skill_name,
                        category="Technical Capability",
                        description=f"{skill_name} capability",
                        is_active=True
                    )
                    db.add(db_skill)
                    db.flush()

                if db_skill.id in seen_skill_ids:
                    continue
                seen_skill_ids.add(db_skill.id)

                existing_cs = db.query(CandidateSkill).filter(
                    CandidateSkill.candidate_id == candidate.id,
                    CandidateSkill.skill_id == db_skill.id
                ).first()
                if not existing_cs:
                    db.add(CandidateSkill(
                        candidate_id=candidate.id,
                        skill_id=db_skill.id,
                        proficiency_level=ProficiencyLevel.ADVANCED,
                        is_verified=True,
                        verified_by="CONNECTX AI"
                    ))

        db.commit()
        db.refresh(analysis_record)
        logger.info(f"[Gemini Analysis] User {user.id} ({user.email}) analyzed resume ID {resume.id}: score={analysis_record.resume_score}")
        return cls._format_analysis_response(analysis_record)

    @classmethod
    def get_latest_analysis(
        cls,
        db: Session,
        user: User,
        resume_id: Optional[int] = None
    ) -> ResumeAnalysisStatusResponse:
        """
        Retrieve the latest analysis for the authenticated user's current CV with strict ownership protection.
        Never reuses an old CV's analysis for a newly uploaded unanalyzed CV.
        """
        target_resume_id = resume_id
        if not target_resume_id:
            active_resume = db.query(Resume).filter(
                Resume.user_id == user.id,
                Resume.is_active == True
            ).order_by(Resume.id.desc()).first()

            if not active_resume:
                return ResumeAnalysisStatusResponse(has_analysis=False, analysis=None)
            target_resume_id = active_resume.id

        analysis = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.user_id == user.id,
            ResumeAnalysis.resume_id == target_resume_id,
            ResumeAnalysis.analysis_status == "SUCCESS"
        ).order_by(ResumeAnalysis.id.desc()).first()

        if not analysis:
            return ResumeAnalysisStatusResponse(has_analysis=False, analysis=None)

        return ResumeAnalysisStatusResponse(
            has_analysis=True,
            analysis=cls._format_analysis_response(analysis)
        )

    @staticmethod
    def _format_response(resume: Resume) -> ResumeResponse:
        return ResumeResponse(
            id=resume.id,
            uuid=resume.uuid,
            user_id=resume.user_id,
            candidate_id=resume.candidate_id,
            filename=resume.filename,
            file_size=resume.file_size,
            content_type=resume.content_type,
            is_active=resume.is_active,
            char_count=resume.char_count,
            word_count=resume.word_count,
            extraction_status=resume.extraction_status,
            extraction_error=resume.extraction_error,
            created_at=resume.created_at,
            updated_at=resume.updated_at,
            download_url=f"/api/v1/resume/download"
        )

    @staticmethod
    def _format_analysis_response(analysis: ResumeAnalysis) -> ResumeAnalysisDetailResponse:
        return ResumeAnalysisDetailResponse(
            id=analysis.id,
            uuid=analysis.uuid,
            user_id=analysis.user_id,
            resume_id=analysis.resume_id,
            candidate_id=analysis.candidate_id,
            target_role=analysis.target_role,
            seniority=analysis.seniority or "Mid-Level Professional",
            resume_score=analysis.resume_score,
            ats_score=analysis.ats_score,
            job_readiness=analysis.job_readiness,
            summary=analysis.summary,
            skills=analysis.skills or [],
            technical_skills=analysis.technical_skills or [],
            soft_skills=analysis.soft_skills or [],
            education=analysis.education or [],
            experience=analysis.experience or [],
            projects=analysis.projects or [],
            certifications=analysis.certifications or [],
            strengths=analysis.strengths or [],
            weaknesses=analysis.weaknesses or [],
            recommendations=analysis.recommendations or [],
            missing_sections=analysis.missing_sections or [],
            extracted_skills=analysis.extracted_skills or [],
            missing_keywords=analysis.missing_keywords or [],
            job_match_comparisons=analysis.job_match_comparisons or [],
            analysis_status=analysis.analysis_status,
            error_message=analysis.error_message,
            model_used=analysis.model_used,
            created_at=analysis.created_at,
            updated_at=analysis.updated_at
        )
