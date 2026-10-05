from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ResumeBase(BaseModel):
    filename: str
    file_size: int
    content_type: str


class ResumeResponse(ResumeBase):
    id: int
    uuid: str
    user_id: int
    candidate_id: Optional[int] = None
    is_active: bool
    char_count: int = 0
    word_count: int = 0
    extraction_status: str = "PENDING"
    extraction_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    download_url: str

    model_config = ConfigDict(from_attributes=True)


class ResumeUploadResponse(BaseModel):
    message: str
    resume: ResumeResponse
    extracted_text_preview: Optional[str] = None


class ResumeStatusResponse(BaseModel):
    has_resume: bool
    resume: Optional[ResumeResponse] = None


class ResumeExtractedTextResponse(BaseModel):
    resume_id: int
    filename: str
    extracted_text: Optional[str] = None
    char_count: int = 0
    word_count: int = 0
    extraction_status: str
    extraction_error: Optional[str] = None
    has_extractable_text: bool

    model_config = ConfigDict(from_attributes=True)
