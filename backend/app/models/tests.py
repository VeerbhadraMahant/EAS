import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import UUIDPk


class TestState(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class ExamPattern(Base, UUIDPk):
    __tablename__ = "exam_pattern"

    name: Mapped[str] = mapped_column(String, nullable=False)
    part_definitions: Mapped[dict] = mapped_column(JSONB, nullable=False)
    marking_rules: Mapped[dict] = mapped_column(JSONB, nullable=False)
    answer_types_permitted: Mapped[dict] = mapped_column(JSONB, nullable=False)


class Test(Base, UUIDPk):
    __tablename__ = "test"

    institute_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("institute.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    exam_pattern_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("exam_pattern.id"), nullable=False
    )
    window_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_close: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    state: Mapped[TestState] = mapped_column(
        Enum(TestState, native_enum=False, validate_strings=True),
        default=TestState.draft,
        nullable=False,
    )


class TestPart(Base, UUIDPk):
    __tablename__ = "test_part"

    test_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("test.id"), nullable=False
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    lock_on_exit: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    bundle_ref: Mapped[str | None] = mapped_column(String, nullable=True)
    bundle_hash: Mapped[str | None] = mapped_column(String, nullable=True)


class TestQuestion(Base, UUIDPk):
    __tablename__ = "test_question"

    test_part_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("test_part.id"), nullable=False
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    marks_correct: Mapped[float] = mapped_column(nullable=False)
    marks_wrong: Mapped[float] = mapped_column(nullable=False)


class TestAssignment(Base, UUIDPk):
    __tablename__ = "test_assignment"

    test_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("test.id"), nullable=False
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("batch.id"), nullable=False
    )
