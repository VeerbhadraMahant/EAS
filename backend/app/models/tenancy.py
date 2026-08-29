import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db import Base
from app.models.common import CreatedAt, UUIDPk


class Institute(Base, UUIDPk, CreatedAt):
    __tablename__ = "institute"

    name: Mapped[str] = mapped_column(String, nullable=False)


class Branch(Base, UUIDPk):
    __tablename__ = "branch"

    institute_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("institute.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)


class Batch(Base, UUIDPk):
    __tablename__ = "batch"

    institute_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("institute.id"), nullable=False
    )
    branch_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("branch.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)


class AdminUser(Base, UUIDPk, CreatedAt):
    __tablename__ = "admin_user"

    institute_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("institute.id"), nullable=False
    )
    branch_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("branch.id"), nullable=True
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)


class Student(Base, UUIDPk, CreatedAt):
    __tablename__ = "student"

    institute_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("institute.id"), nullable=False
    )
    branch_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("branch.id"), nullable=True
    )
    batch_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("batch.id"), nullable=True
    )
    roll_number: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
