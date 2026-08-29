import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base


class Event(Base):
    """Append-only. Table DDL (partitioning, indexes) lives in the Alembic
    migration, not in metadata.create_all — see the migration for why
    (session_id, client_instance_id, client_seq) is enforced as a per-partition
    unique index rather than a table-wide primary key.
    """

    __tablename__ = "event"

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    client_instance_id: Mapped[str] = mapped_column(String, primary_key=True)
    client_seq: Mapped[int] = mapped_column(primary_key=True)
    part_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=False)
    client_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    server_received_ts: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, primary_key=True
    )
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
