"""grade_session job: replays the raw event stream for a session into
Response rows, then aggregates a Report. Combined into one job for this
demo — the real system likely splits grading and report generation so a
report-shape change can recompute without regrading, per
02-system-design.md §7.

Three event payload shapes are read: answer_selected {question_id,
selected_option}, answer_cleared {question_id}, and question_viewed
{question_id} (emitted by the player whenever a question becomes current).
Dwell time is approximated from question_viewed alone, without a matching
blur/leave event: events are walked in order and each view's duration is
"time until the next view of any question" — so time spent on the last
question viewed before submit isn't captured (nothing marks the moment of
submit in the stream). An approximation, not exact wall-clock time.
"""

from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy import delete, select

from app.models.events import Event
from app.models.jobs import Job
from app.models.question_bank import Question
from app.models.analytics import Report
from app.models.sessions import ExamSession, Response, SessionState
from app.models.tests import TestPart, TestQuestion


def grade_session(db, job: Job) -> None:
    session_id = job.payload["session_id"]
    session = db.get(ExamSession, session_id)
    if session is None:
        raise ValueError(f"no session {session_id}")

    test_questions = db.execute(
        select(TestQuestion, TestPart)
        .join(TestPart, TestQuestion.test_part_id == TestPart.id)
        .where(TestPart.test_id == session.test_id)
        .order_by(TestPart.ordinal, TestQuestion.ordinal)
    ).all()

    events = db.execute(
        select(Event)
        .where(Event.session_id == session_id, Event.type.in_(["answer_selected", "answer_cleared"]))
        .order_by(Event.client_seq)
    ).scalars().all()

    final_answer: dict[str, int | None] = {}
    change_count: dict[str, int] = defaultdict(int)
    for ev in events:
        qid = ev.payload["question_id"]
        change_count[qid] += 1
        final_answer[qid] = ev.payload.get("selected_option") if ev.type == "answer_selected" else None

    views = db.execute(
        select(Event)
        .where(Event.session_id == session_id, Event.type == "question_viewed")
        .order_by(Event.client_seq)
    ).scalars().all()

    first_viewed_at: dict[str, datetime] = {}
    total_time_ms: dict[str, int] = defaultdict(int)
    for i, ev in enumerate(views):
        qid = ev.payload["question_id"]
        first_viewed_at.setdefault(qid, ev.client_ts)
        if i + 1 < len(views):
            delta = (views[i + 1].client_ts - ev.client_ts).total_seconds()
            if delta > 0:
                total_time_ms[qid] += int(delta * 1000)

    db.execute(delete(Response).where(Response.session_id == session_id))

    subject_totals: dict[str, dict] = defaultdict(
        lambda: {"correct": 0, "incorrect": 0, "unattempted": 0, "marks": 0.0, "max_marks": 0.0}
    )
    questions_out = []
    total_marks = 0.0
    total_max_marks = 0.0

    for tq, part in test_questions:
        question = db.get(Question, tq.question_id)
        selected = final_answer.get(str(tq.question_id))
        correct = selected is not None and selected == question.correct_option

        if selected is None:
            marks = 0.0
            outcome = "unattempted"
        elif correct:
            marks = tq.marks_correct
            outcome = "correct"
        else:
            marks = tq.marks_wrong
            outcome = "incorrect"

        qid_str = str(tq.question_id)
        db.add(
            Response(
                session_id=session_id,
                question_id=tq.question_id,
                selected_option=selected,
                is_correct=correct if selected is not None else None,
                marks_awarded=marks,
                change_count=change_count.get(qid_str, 0),
                first_viewed_at=first_viewed_at.get(qid_str),
                total_time_ms=total_time_ms.get(qid_str, 0),
            )
        )

        st = subject_totals[tq.subject]
        st[outcome if outcome != "correct" else "correct"] += 1
        st["marks"] += marks
        st["max_marks"] += tq.marks_correct
        total_marks += marks
        total_max_marks += tq.marks_correct

        questions_out.append(
            {
                "question_id": str(tq.question_id),
                "subject": tq.subject,
                "ordinal": tq.ordinal,
                "text": question.text,
                "options": None,
                "selected_option": selected,
                "correct_option": question.correct_option,
                "outcome": outcome,
                "marks_awarded": marks,
            }
        )

    existing_version = db.execute(
        select(Report.version).where(Report.session_id == session_id).order_by(Report.version.desc())
    ).scalars().first()
    version = (existing_version or 0) + 1

    payload = {
        "total_marks": total_marks,
        "total_max_marks": total_max_marks,
        "by_subject": dict(subject_totals),
        "questions": questions_out,
    }

    db.add(Report(session_id=session_id, version=version, payload=payload, generated_at=datetime.now(timezone.utc)))
    session.state = SessionState.reported
    db.flush()
