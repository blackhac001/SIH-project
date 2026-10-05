"""Create Resumes Table for User-Specific CV Upload & Storage

Revision ID: 0003_resumes_table
Revises: 0002_core_data_models
Create Date: 2026-08-30 03:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003_resumes_table"
down_revision: Union[str, None] = "0002_core_data_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists before creating
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if not inspector.has_table("resumes"):
        op.create_table(
            "resumes",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("uuid", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("candidate_id", sa.Integer(), nullable=True),
            sa.Column("filename", sa.String(length=255), nullable=False),
            sa.Column("stored_filename", sa.String(length=255), nullable=False),
            sa.Column("file_path", sa.String(length=500), nullable=False),
            sa.Column("file_size", sa.Integer(), nullable=False),
            sa.Column("content_type", sa.String(length=100), nullable=False),
            sa.Column("file_hash", sa.String(length=64), nullable=True),
            sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_resumes_id", "resumes", ["id"], unique=False)
        op.create_index("ix_resumes_uuid", "resumes", ["uuid"], unique=True)
        op.create_index("ix_resumes_user_id", "resumes", ["user_id"], unique=False)
        op.create_index("ix_resumes_candidate_id", "resumes", ["candidate_id"], unique=False)
        op.create_index("ix_resumes_is_active", "resumes", ["is_active"], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table("resumes"):
        op.drop_index("ix_resumes_is_active", table_name="resumes")
        op.drop_index("ix_resumes_candidate_id", table_name="resumes")
        op.drop_index("ix_resumes_user_id", table_name="resumes")
        op.drop_index("ix_resumes_uuid", table_name="resumes")
        op.drop_index("ix_resumes_id", table_name="resumes")
        op.drop_table("resumes")
