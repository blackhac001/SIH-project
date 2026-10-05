"""Create interviews, conversations, conversation_participants, messages tables

Revision ID: 0006_interviews_tables
Revises: 0005_resume_analyses_table
Create Date: 2026-08-30 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0006_interviews_tables"
down_revision: Union[str, None] = "0005_resume_analyses_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # --------------------------------------------------------
    # Ensure enum types exist (idempotent)
    # --------------------------------------------------------
    conn.execute(sa.text("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interviewstatus') THEN
                CREATE TYPE interviewstatus AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interviewtype') THEN
                CREATE TYPE interviewtype AS ENUM ('TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'SCREENING', 'FINAL_ROUND');
            END IF;
        END$$;
    """))

    # --------------------------------------------------------
    # Create interviews table (idempotent)
    # --------------------------------------------------------
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS interviews (
            id              SERIAL PRIMARY KEY,
            uuid            VARCHAR(36),
            application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
            candidate_id    INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
            employer_id     INTEGER NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
            job_id          INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
            scheduled_at    TIMESTAMP NOT NULL,
            interview_type  interviewtype NOT NULL DEFAULT 'TECHNICAL',
            status          interviewstatus NOT NULL DEFAULT 'SCHEDULED',
            meeting_link    VARCHAR(500) DEFAULT 'https://meet.connectx.ai/room-secure',
            interviewer_name VARCHAR(255),
            notes           TEXT,
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_interviews_id ON interviews (id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_interviews_candidate_id ON interviews (candidate_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_interviews_employer_id ON interviews (employer_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_interviews_scheduled_at ON interviews (scheduled_at)"))

    # --------------------------------------------------------
    # Create conversations table (idempotent)
    # --------------------------------------------------------
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS conversations (
            id         SERIAL PRIMARY KEY,
            uuid       VARCHAR(36),
            title      VARCHAR(255),
            is_active  BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_conversations_id ON conversations (id)"))

    # --------------------------------------------------------
    # Create conversation_participants table (idempotent)
    # --------------------------------------------------------
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS conversation_participants (
            id              SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            joined_at       TIMESTAMP DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_conversation_participants_id ON conversation_participants (id)"))

    # --------------------------------------------------------
    # Create messages table (idempotent)
    # --------------------------------------------------------
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS messages (
            id              SERIAL PRIMARY KEY,
            uuid            VARCHAR(36),
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content         TEXT NOT NULL,
            is_read         BOOLEAN NOT NULL DEFAULT FALSE,
            created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_messages_id ON messages (id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_messages_conversation_id ON messages (conversation_id)"))

    # Mark this migration as complete in alembic_version if it somehow got stuck
    # (Alembic handles this automatically, this is just for reference)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    for table in ['messages', 'conversation_participants', 'conversations', 'interviews']:
        if table in existing_tables:
            op.drop_table(table)
