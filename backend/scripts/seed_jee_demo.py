"""Seeds a demo JEE Main Paper 1 test from the hand-verified question subset
in data/jee_demo_questions.json (see that file's source_note), assigns it to
a hardcoded demo student, and creates the session so the frontend has
something to load immediately.

    uv run python scripts/seed_jee_demo.py

Demo part duration is 10 minutes, not the real 3 hours — long enough to
click through, short enough to actually watch auto-submit-on-expiry happen.
"""

import hashlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.db import get_session
from app.models.question_bank import AnswerType, DifficultyBand, Question, QuestionOption
from app.models.sessions import ExamSession, SessionPart, SessionPartState, SessionState
from app.models.tenancy import Batch, Institute, Student
from app.models.tests import ExamPattern, Test, TestAssignment, TestPart, TestQuestion, TestState

QUESTIONS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "jee_demo_questions.json"
DEMO_PART_DURATION_SECONDS = 10 * 60

JEE_MAIN_MARKING = {"negative_marking": True, "marks_correct": 4, "marks_wrong": -1}
JEE_MAIN_ANSWER_TYPES = {"allowed": ["mcq_single"]}


def get_or_create_institute(db, name: str) -> Institute:
    existing = db.execute(select(Institute).where(Institute.name == name)).scalar_one_or_none()
    if existing:
        return existing
    institute = Institute(name=name)
    db.add(institute)
    db.flush()
    return institute


def get_or_create_batch(db, institute: Institute, name: str) -> Batch:
    existing = db.execute(
        select(Batch).where(Batch.institute_id == institute.id, Batch.name == name)
    ).scalar_one_or_none()
    if existing:
        return existing
    batch = Batch(institute_id=institute.id, name=name)
    db.add(batch)
    db.flush()
    return batch


def get_or_create_student(db, institute: Institute, batch: Batch) -> Student:
    existing = db.execute(select(Student).where(Student.username == "demo_student")).scalar_one_or_none()
    if existing:
        return existing
    student = Student(
        institute_id=institute.id,
        batch_id=batch.id,
        roll_number="DEMO001",
        name="Demo Student",
        username="demo_student",
        password_hash=hashlib.sha256(b"demo_password").hexdigest(),
    )
    db.add(student)
    db.flush()
    return student


def get_or_create_pattern(db) -> ExamPattern:
    existing = db.execute(
        select(ExamPattern).where(ExamPattern.name == "JEE Main Paper 1 (Demo)")
    ).scalar_one_or_none()
    if existing:
        return existing
    pattern = ExamPattern(
        name="JEE Main Paper 1 (Demo)",
        part_definitions={"parts": [{"ordinal": 1, "title": "Paper 1", "duration_seconds": DEMO_PART_DURATION_SECONDS}]},
        marking_rules=JEE_MAIN_MARKING,
        answer_types_permitted=JEE_MAIN_ANSWER_TYPES,
    )
    db.add(pattern)
    db.flush()
    return pattern


def main() -> None:
    data = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))

    with get_session() as db:
        institute = get_or_create_institute(db, "Demo Institute")
        batch = get_or_create_batch(db, institute, "Demo Batch")
        student = get_or_create_student(db, institute, batch)
        pattern = get_or_create_pattern(db)

        now = datetime.now(timezone.utc)
        test = Test(
            institute_id=institute.id,
            title="JEE Main Paper 1 — Demo (Jan 22 Shift 1 subset)",
            exam_pattern_id=pattern.id,
            window_open=now,
            window_close=now + timedelta(days=7),
            state=TestState.published,
        )
        db.add(test)
        db.flush()

        test_part = TestPart(
            test_id=test.id,
            ordinal=1,
            title="Paper 1",
            duration_seconds=DEMO_PART_DURATION_SECONDS,
        )
        db.add(test_part)
        db.flush()

        for i, q in enumerate(data["questions"], start=1):
            question = Question(
                source="data/jee_demo_questions.json",
                image_ref="text-only-demo",
                text=q["text"],
                answer_type=AnswerType.mcq_single,
                option_count=len(q["options"]),
                correct_option=q["correct_option"],
                difficulty_band=DifficultyBand(q["difficulty_band"]),
            )
            db.add(question)
            db.flush()

            for ordinal, option_text in enumerate(q["options"]):
                db.add(
                    QuestionOption(
                        question_id=question.id,
                        ordinal=ordinal,
                        image_ref="text-only-demo",
                        text=option_text,
                    )
                )

            db.add(
                TestQuestion(
                    test_part_id=test_part.id,
                    ordinal=i,
                    subject=q["subject"],
                    question_id=question.id,
                    marks_correct=4,
                    marks_wrong=-1,
                )
            )

        db.add(TestAssignment(test_id=test.id, batch_id=batch.id))

        existing_session = db.execute(
            select(ExamSession).where(ExamSession.student_id == student.id, ExamSession.test_id == test.id)
        ).scalar_one_or_none()
        if existing_session is None:
            session = ExamSession(test_id=test.id, student_id=student.id, state=SessionState.assigned)
            db.add(session)
            db.flush()
            db.add(
                SessionPart(
                    session_id=session.id,
                    test_part_id=test_part.id,
                    state=SessionPartState.pending,
                    base_duration_seconds=DEMO_PART_DURATION_SECONDS,
                )
            )
        else:
            session = existing_session

        db.commit()

        print(f"institute:      {institute.id}  {institute.name}")
        print(f"batch:          {batch.id}  {batch.name}")
        print(f"student:        {student.id}  username={student.username} password=demo_password")
        print(f"test:           {test.id}  {test.title} ({len(data['questions'])} questions)")
        print(f"session:        {session.id}")
        print()
        print("Frontend calls GET /api/me to discover this session — no login step yet.")


if __name__ == "__main__":
    main()
