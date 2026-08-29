import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import UUIDPk


class Curriculum(str, enum.Enum):
    ncert = "ncert"
    msbshse = "msbshse"


class NodeLevel(str, enum.Enum):
    chapter = "chapter"
    topic = "topic"
    concept = "concept"


class ClassLevel(int, enum.Enum):
    eleven = 11
    twelve = 12


class MappingKind(str, enum.Enum):
    merge = "merge"
    split = "split"


class SyllabusTree(Base, UUIDPk):
    __tablename__ = "syllabus_tree"

    curriculum: Mapped[Curriculum] = mapped_column(
        Enum(Curriculum, native_enum=False, validate_strings=True), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Concept(Base, UUIDPk):
    __tablename__ = "concept"

    name: Mapped[str] = mapped_column(String, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)


class SyllabusNode(Base, UUIDPk):
    __tablename__ = "syllabus_node"

    tree_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("syllabus_tree.id"), nullable=False
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("syllabus_node.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    level: Mapped[NodeLevel] = mapped_column(
        Enum(NodeLevel, native_enum=False, validate_strings=True), nullable=False
    )
    subject: Mapped[str] = mapped_column(String, nullable=False)
    class_level: Mapped[ClassLevel] = mapped_column(
        Enum(ClassLevel, native_enum=False, validate_strings=True), nullable=False
    )
    concept_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("concept.id"), nullable=True
    )


class NodeMapping(Base, UUIDPk):
    __tablename__ = "node_mapping"

    from_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("syllabus_node.id"), nullable=False
    )
    to_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("syllabus_node.id"), nullable=False
    )
    kind: Mapped[MappingKind] = mapped_column(
        Enum(MappingKind, native_enum=False, validate_strings=True), nullable=False
    )
    tree_version: Mapped[int] = mapped_column(Integer, nullable=False)
