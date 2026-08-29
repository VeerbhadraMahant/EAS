"""initial schema: all step-1 tables, partitioned event table

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-08-21
"""

from datetime import date

from alembic import op

import app.models  # noqa: F401  (populates Base.metadata)
from app.db import Base
from app.db_partitions import create_partition_statements, months_forward

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    bind = op.get_bind()
    non_event_tables = [t for t in Base.metadata.sorted_tables if t.name != "event"]
    # metadata.create_all (not a per-table loop) so SQLAlchemy can defer the
    # session <-> session_lease FK cycle to an ALTER TABLE, instead of trying
    # to inline a FK to a table that doesn't exist yet.
    Base.metadata.create_all(bind=bind, tables=non_event_tables, checkfirst=False)

    op.execute(
        """CREATE TABLE event (
            session_id uuid NOT NULL,
            client_instance_id varchar NOT NULL,
            client_seq integer NOT NULL,
            part_id uuid,
            type varchar NOT NULL,
            client_ts timestamptz NOT NULL,
            server_received_ts timestamptz NOT NULL,
            payload jsonb NOT NULL
        ) PARTITION BY RANGE (server_received_ts);"""
    )

    # Current month plus a five-month forward buffer. Run
    # scripts/ensure_event_partitions.py periodically to keep this window open.
    today = date.today()
    for year, month in months_forward(today.year, today.month, 6):
        for stmt in create_partition_statements(year, month):
            op.execute(stmt)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS event CASCADE;")
    bind = op.get_bind()
    non_event_tables = [t for t in Base.metadata.sorted_tables if t.name != "event"]
    Base.metadata.drop_all(bind=bind, tables=non_event_tables, checkfirst=True)
    op.execute("DROP EXTENSION IF EXISTS vector;")
