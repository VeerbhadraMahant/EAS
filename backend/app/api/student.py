"""Student-facing API for the demo exam flow.

Auth is deliberately not built yet (user's call for this session): there is
exactly one seeded demo student and one seeded session, looked up by a fixed
username. Every real auth concern (login, tokens, tenant checks on the
request) is still open — see SETUP.md.

Session leasing (the two-instance problem, 02-system-design.md §5) is not
enforced here either — a second tab open on the same session will just race
the first. Flagged, not silently handled.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.events import Event
from app.models.jobs import Job, JobState
from app.models.question_bank import Question, QuestionOption
from app.models.sessions import ExamSession, SessionPart, SessionPartState, SessionState
from app.models.tenancy import Student
from app.models.tests import Test, TestPart, TestQuestion
from app.models.analytics import Report

router = APIRouter()

DEMO_USERNAME = "demo_student"


def _part_or_404(db: Session, session: ExamSession, ordinal: int) -> tuple[SessionPart, TestPart]:
    row = db.execute(
        select(SessionPart, TestPart)
        .join(TestPart, SessionPart.test_part_id == TestPart.id)
        .where(SessionPart.session_id == session.id, TestPart.ordinal == ordinal)
    ).first()
    if row is None:
        raise HTTPException(404, f"no part {ordinal} for session {session.id}")
    return row


def _remaining_seconds(session_part: SessionPart) -> int | None:
    if session_part.server_started_at is None:
        return None
    deadline = session_part.server_started_at.timestamp() + session_part.base_duration_seconds + session_part.granted_extra_seconds
    return max(0, int(deadline - datetime.now(timezone.utc).timestamp()))


@router.get("/me")
def me(db: Session = Depends(get_db)) -> dict:
    student = db.execute(select(Student).where(Student.username == DEMO_USERNAME)).scalar_one_or_none()
    if student is None:
        raise HTTPException(404, "demo student not seeded — run scripts/seed_jee_demo.py")
    session = db.execute(
        select(ExamSession)
        .where(ExamSession.student_id == student.id)
        .order_by(ExamSession.created_at.desc())
        .limit(1)
    ).scalars().first()
    if session is None:
        raise HTTPException(404, "demo student has no session — run scripts/seed_jee_demo.py")
    test = db.get(Test, session.test_id)
    rows = db.execute(
        select(TestPart, SessionPart)
        .join(SessionPart, SessionPart.test_part_id == TestPart.id)
        .where(TestPart.test_id == test.id, SessionPart.session_id == session.id)
        .order_by(TestPart.ordinal)
    ).all()
    return {
        "student": {"id": str(student.id), "name": student.name},
        "session_id": str(session.id),
        "session_state": session.state.value,
        "current_part_ordinal": session.current_part_ordinal,
        "test_title": test.title,
        "parts": [
            {
                "ordinal": tp.ordinal,
                "title": tp.title,
                "duration_seconds": tp.duration_seconds,
                "state": sp.state.value,
            }
            for tp, sp in rows
        ],
    }


def _bundle_payload(db: Session, session: ExamSession, ordinal: int) -> dict:
    session_part, test_part = _part_or_404(db, session, ordinal)
    test_questions = db.execute(
        select(TestQuestion).where(TestQuestion.test_part_id == test_part.id).order_by(TestQuestion.ordinal)
    ).scalars().all()

    questions = []
    for tq in test_questions:
        question = db.get(Question, tq.question_id)
        options = db.execute(
            select(QuestionOption).where(QuestionOption.question_id == question.id).order_by(QuestionOption.ordinal)
        ).scalars().all()
        questions.append(
            {
                "question_id": str(question.id),
                "ordinal": tq.ordinal,
                "subject": tq.subject,
                "text": question.text,
                "answer_type": question.answer_type.value,
                "options": [{"ordinal": o.ordinal, "text": o.text} for o in options],
            }
        )

    return {
        "part_ordinal": ordinal,
        "part_id": str(session_part.id),
        "title": test_part.title,
        "duration_seconds": session_part.base_duration_seconds,
        "state": session_part.state.value,
        "remaining_seconds": _remaining_seconds(session_part),
        "questions": questions,
    }


@router.get("/sessions/{session_id}/parts/{ordinal}/bundle")
def get_bundle(session_id: uuid.UUID, ordinal: int, db: Session = Depends(get_db)) -> dict:
    session = db.get(ExamSession, session_id)
    if session is None:
        raise HTTPException(404, "no such session")
    return _bundle_payload(db, session, ordinal)


@router.post("/sessions/{session_id}/parts/{ordinal}/start")
def start_part(session_id: uuid.UUID, ordinal: int, db: Session = Depends(get_db)) -> dict:
    session = db.get(ExamSession, session_id)
    if session is None:
        raise HTTPException(404, "no such session")
    session_part, _ = _part_or_404(db, session, ordinal)

    if session_part.state == SessionPartState.pending:
        session_part.server_started_at = datetime.now(timezone.utc)
        session_part.state = SessionPartState.active
        session.state = SessionState.in_progress
        session.current_part_ordinal = ordinal
        db.commit()

    return _bundle_payload(db, session, ordinal)


@router.post("/sessions/{session_id}/heartbeat")
def heartbeat(session_id: uuid.UUID, ordinal: int, db: Session = Depends(get_db)) -> dict:
    session = db.get(ExamSession, session_id)
    if session is None:
        raise HTTPException(404, "no such session")
    session_part, _ = _part_or_404(db, session, ordinal)
    return {
        "state": session_part.state.value,
        "remaining_seconds": _remaining_seconds(session_part),
        "server_time": datetime.now(timezone.utc).isoformat(),
    }


class ClientEvent(BaseModel):
    client_instance_id: str
    client_seq: int
    part_id: str | None = None
    type: str
    client_ts: datetime
    payload: dict


class EventBatch(BaseModel):
    events: list[ClientEvent]


@router.post("/sessions/{session_id}/events")
def post_events(session_id: uuid.UUID, batch: EventBatch, db: Session = Depends(get_db)) -> dict:
    session = db.get(ExamSession, session_id)
    if session is None:
        raise HTTPException(404, "no such session")

    accepted = 0
    for ev in batch.events:
        stmt = (
            pg_insert(Event)
            .values(
                session_id=session_id,
                client_instance_id=ev.client_instance_id,
                client_seq=ev.client_seq,
                part_id=ev.part_id,
                type=ev.type,
                client_ts=ev.client_ts,
                server_received_ts=datetime.now(timezone.utc),
                payload=ev.payload,
            )
            .on_conflict_do_nothing(index_elements=["session_id", "client_instance_id", "client_seq"])
        )
        result = db.execute(stmt)
        accepted += result.rowcount
    db.commit()
    return {"accepted": accepted, "received": len(batch.events)}


@router.post("/sessions/{session_id}/parts/{ordinal}/submit")
def submit_part(session_id: uuid.UUID, ordinal: int, db: Session = Depends(get_db)) -> dict:
    session = db.get(ExamSession, session_id)
    if session is None:
        raise HTTPException(404, "no such session")
    session_part, test_part = _part_or_404(db, session, ordinal)

    if session_part.state != SessionPartState.submitted:
        session_part.state = SessionPartState.submitted
        session_part.submitted_at = datetime.now(timezone.utc)

    all_parts = db.execute(
        select(SessionPart).where(SessionPart.session_id == session.id)
    ).scalars().all()
    if all(p.state == SessionPartState.submitted for p in all_parts):
        session.state = SessionState.submitted
        session.submitted_at = datetime.now(timezone.utc)
        db.add(
            Job(
                type="grade_session",
                payload={"session_id": str(session.id)},
                run_after=datetime.now(timezone.utc),
            )
        )

    db.commit()
    return {"part_state": session_part.state.value, "session_state": session.state.value}


@router.get("/sessions/{session_id}/report")
def get_report(session_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    report = db.execute(
        select(Report).where(Report.session_id == session_id).order_by(Report.version.desc())
    ).scalars().first()
    if report is None:
        return {"status": "pending"}
    return {"status": "ready", "version": report.version, **report.payload}
