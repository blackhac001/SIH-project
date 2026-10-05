"""Create resume_analyses table for Gemini AI CV Analysis

Revision ID: 0005_resume_analyses_table
Revises: 0004_resume_extracted_text
Create Date: 2026-08-30 04:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0005_resume_analyses_table"
down_revision: Union[str, None] = "0004_resume_extracted_text"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if not inspector.has_table("resume_analyses"):
        op.create_table(
            "resume_analyses",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
            sa.Column("uuid", sa.String(length=36), nullable=False, unique=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("resume_id", sa.Integer(), sa.ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True),
            sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id", ondelete="SET NULL"), nullable=True),
            sa.Column("target_role", sa.String(length=255), server_default="General / As Described in CV", nullable=True),
            sa.Column("seniority", sa.String(length=100), server_default="Mid-Level Professional", nullable=True),
            sa.Column("resume_score", sa.Integer(), server_default="0", nullable=False),
            sa.Column("ats_score", sa.Integer(), server_default="0", nullable=False),
            sa.Column("job_readiness", sa.Integer(), server_default="0", nullable=False),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("skills", sa.JSON(), nullable=True),
            sa.Column("technical_skills", sa.JSON(), nullable=True),
            sa.Column("soft_skills", sa.JSON(), nullable=True),
            sa.Column("education", sa.JSON(), nullable=True),
            sa.Column("experience", sa.JSON(), nullable=True),
            sa.Column("projects", sa.JSON(), nullable=True),
            sa.Column("certifications", sa.JSON(), nullable=True),
            sa.Column("strengths", sa.JSON(), nullable=True),
            sa.Column("weaknesses", sa.JSON(), nullable=True),
            sa.Column("recommendations", sa.JSON(), nullable=True),
            sa.Column("missing_sections", sa.JSON(), nullable=True),
            sa.Column("extracted_skills", sa.JSON(), nullable=True),
            sa.Column("missing_keywords", sa.JSON(), nullable=True),
            sa.Column("job_match_comparisons", sa.JSON(), nullable=True),
            sa.Column("analysis_status", sa.String(length=50), server_default="SUCCESS", nullable=False),
            sa.Column("error_message", sa.String(length=500), nullable=True),
            sa.Column("model_used", sa.String(length=100), server_default="gemini-2.5-flash", nullable=True),
            sa.Column("raw_text", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        )
        op.create_index("ix_resume_analyses_id", "resume_analyses", ["id"])
        op.create_index("ix_resume_analyses_uuid", "resume_analyses", ["uuid"], unique=True)
        op.create_index("ix_resume_analyses_user_id", "resume_analyses", ["user_id"])
        op.create_index("ix_resume_analyses_resume_id", "resume_analyses", ["resume_id"])
        op.create_index("ix_resume_analyses_candidate_id", "resume_analyses", ["candidate_id"])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table("resume_analyses"):
        op.drop_index("ix_resume_analyses_candidate_id", table_name="resume_analyses")
        op.drop_index("ix_resume_analyses_resume_id", table_name="resume_analyses")
        op.drop_index("ix_resume_analyses_user_id", table_name="resume_analyses")
        op.drop_index("ix_resume_analyses_uuid", table_name="resume_analyses")
        op.drop_index("ix_resume_analyses_id", table_name="resume_analyses")
        op.drop_table("resume_analyses")
