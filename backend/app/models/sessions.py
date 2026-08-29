import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import CreatedAt, UUIDPk


class SessionState(str, enum.Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    submitted = "submitted"
    graded = "graded"
    reported = "reported"


class SessionPartState(str, enum.Enum):
    pending = "pending"
    preloading = "preloading"
    ready = "ready"
    active = "active"
    submitted = "submitted"
    locked = "locked"


class ExamSession(Base, UUIDPk, CreatedAt):
    __tablename__ = "session"

    test_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("test.id"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("student.id"), nullable=False
    )
    state: Mapped[SessionState] = mapped_column(
        Enum(SessionState, native_enum=False, validate_strings=True),
        default=SessionState.assigned,
        nullable=False,
    )
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_part_ordinal: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    active_lease_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("session_lease.id"), nullable=True
    )


class SessionPart(Base, UUIDPk):
    __tablename__ = "session_part"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("session.id"), nullable=False
    )
    test_part_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("test_part.id"), nullable=False
    )
    state: Mapped[SessionPartState] = mapped_column(
        Enum(SessionPartState, native_enum=False, validate_strings=True),
        default=SessionPartState.pending,
        nullable=False,
    )
    server_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    base_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    granted_extra_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    auto_submitted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class SessionLease(Base, UUIDPk):
    __tablename__ = "session_lease"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("session.id"), nullable=False
    )
    client_instance_id: Mapped[str] = mapped_column(String, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Response(Base, UUIDPk):
    """Derived from the event stream by the grading job. Never client-written."""

    __tablename__ = "response"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("session.id"), nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    selected_option: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entered_value: Mapped[float | None] = mapped_column(nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    marks_awarded: Mapped[float | None] = mapped_column(nullable=True)
    first_viewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    total_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    change_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
