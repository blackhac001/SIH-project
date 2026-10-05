from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Resume(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="SET NULL"), nullable=True, index=True)

    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    content_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=True)  # SHA-256
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Extracted structured text & extraction metadata
    extracted_text = Column(Text, nullable=True)
    char_count = Column(Integer, default=0, nullable=False)
    word_count = Column(Integer, default=0, nullable=False)
    extraction_status = Column(String(50), default="PENDING", nullable=False)  # SUCCESS, NO_TEXT_DETECTED, EXTRACTION_FAILED
    extraction_error = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User")
    candidate = relationship("Candidate")

    def __repr__(self):
        return f"<Resume(id={self.id}, user_id={self.user_id}, filename='{self.filename}', status='{self.extraction_status}')>"
