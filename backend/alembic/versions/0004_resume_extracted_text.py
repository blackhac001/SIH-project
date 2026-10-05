"""Add extracted text and extraction metadata to resumes table

Revision ID: 0004_resume_extracted_text
Revises: 0003_resumes_table
Create Date: 2026-08-30 03:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0004_resume_extracted_text"
down_revision: Union[str, None] = "0003_resumes_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table("resumes"):
        columns = [c["name"] for c in inspector.get_columns("resumes")]
        if "extracted_text" not in columns:
            op.add_column("resumes", sa.Column("extracted_text", sa.Text(), nullable=True))
        if "char_count" not in columns:
            op.add_column("resumes", sa.Column("char_count", sa.Integer(), server_default="0", nullable=False))
        if "word_count" not in columns:
            op.add_column("resumes", sa.Column("word_count", sa.Integer(), server_default="0", nullable=False))
        if "extraction_status" not in columns:
            op.add_column("resumes", sa.Column("extraction_status", sa.String(length=50), server_default="PENDING", nullable=False))
        if "extraction_error" not in columns:
            op.add_column("resumes", sa.Column("extraction_error", sa.String(length=500), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table("resumes"):
        columns = [c["name"] for c in inspector.get_columns("resumes")]
        if "extraction_error" in columns:
            op.drop_column("resumes", "extraction_error")
        if "extraction_status" in columns:
            op.drop_column("resumes", "extraction_status")
        if "word_count" in columns:
            op.drop_column("resumes", "word_count")
        if "char_count" in columns:
            op.drop_column("resumes", "char_count")
        if "extracted_text" in columns:
            op.drop_column("resumes", "extracted_text")
