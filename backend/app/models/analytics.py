import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import UUIDPk


class StudentProfile(Base, UUIDPk):
    """Rebuilt by the report pipeline. Never hand-edited."""

    __tablename__ = "student_profile"

    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("student.id"), nullable=False
    )
    concept_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("concept.id"), nullable=False
    )
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mean_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trend: Mapped[float | None] = mapped_column(nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sample_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Report(Base, UUIDPk):
    """Versioned so a pipeline change regenerates rather than overwrites."""

    __tablename__ = "report"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("session.id"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    pdf_ref: Mapped[str | None] = mapped_column(nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
