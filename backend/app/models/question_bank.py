import enum
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import UUIDPk

# Embedding dimension is a placeholder until the offline tagging pipeline
# (build order step 2) settles on an embedding model.
IMAGE_EMBEDDING_DIM = 512


class AnswerType(str, enum.Enum):
    mcq_single = "mcq_single"
    numeric = "numeric"


class DifficultyBand(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class TagWeight(str, enum.Enum):
    primary = "primary"
    secondary = "secondary"


class Question(Base, UUIDPk):
    __tablename__ = "question"

    source: Mapped[str] = mapped_column(String, nullable=False)
    image_ref: Mapped[str] = mapped_column(String, nullable=False)
    # Demo-only text rendering path (no image-crop pipeline available this
    # session). Production ingestion is image-crop-only per CLAUDE.md;
    # image_ref stays the field the real pipeline populates.
    text: Mapped[str | None] = mapped_column(String, nullable=True)
    answer_type: Mapped[AnswerType] = mapped_column(
        Enum(AnswerType, native_enum=False, validate_strings=True), nullable=False
    )
    option_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    correct_option: Mapped[int | None] = mapped_column(Integer, nullable=True)
    correct_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    numeric_tolerance: Mapped[float | None] = mapped_column(Float, nullable=True)
    difficulty_band: Mapped[DifficultyBand] = mapped_column(
        Enum(DifficultyBand, native_enum=False, validate_strings=True), nullable=False
    )
    image_embedding: Mapped[list[float] | None] = mapped_column(
        Vector(IMAGE_EMBEDDING_DIM), nullable=True
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("admin_user.id"), nullable=True
    )


class QuestionOption(Base, UUIDPk):
    __tablename__ = "question_option"

    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    image_ref: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str | None] = mapped_column(String, nullable=True)


class QuestionTag(Base, UUIDPk):
    __tablename__ = "question_tag"

    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    syllabus_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("syllabus_node.id"), nullable=False
    )
    weight: Mapped[TagWeight] = mapped_column(
        Enum(TagWeight, native_enum=False, validate_strings=True), nullable=False
    )


class QuestionSolution(Base, UUIDPk):
    __tablename__ = "question_solution"

    question_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    image_ref: Mapped[str] = mapped_column(String, nullable=False)
