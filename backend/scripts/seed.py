"""Build-order step 1 verification: create an institute, a batch, and a
two-part test (MHT-CET PCM, which is the two-part pattern).

    uv run python scripts/seed.py
"""

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.db import get_session
from app.models.tenancy import Batch, Institute
from app.models.tests import ExamPattern, Test, TestAssignment, TestPart, TestState

MHT_CET_PCM_MARKING = {
    "negative_marking": False,
    "marks_by_subject": {"Physics": 1, "Chemistry": 1, "Mathematics": 2},
}
MHT_CET_PCM_PARTS = [
    {"ordinal": 1, "title": "Part 1: Physics & Chemistry", "duration_seconds": 90 * 60},
    {"ordinal": 2, "title": "Part 2: Mathematics", "duration_seconds": 90 * 60},
]
MHT_CET_PCM_ANSWER_TYPES = {"allowed": ["mcq_single"]}


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


def get_or_create_cet_pattern(db) -> ExamPattern:
    existing = db.execute(
        select(ExamPattern).where(ExamPattern.name == "MHT-CET PCM")
    ).scalar_one_or_none()
    if existing:
        return existing
    pattern = ExamPattern(
        name="MHT-CET PCM",
        part_definitions={"parts": MHT_CET_PCM_PARTS},
        marking_rules=MHT_CET_PCM_MARKING,
        answer_types_permitted=MHT_CET_PCM_ANSWER_TYPES,
    )
    db.add(pattern)
    db.flush()
    return pattern


def main() -> None:
    with get_session() as db:
        institute = get_or_create_institute(db, "Demo Institute")
        batch = get_or_create_batch(db, institute, "Demo Batch")
        pattern = get_or_create_cet_pattern(db)

        now = datetime.now(timezone.utc)
        test = Test(
            institute_id=institute.id,
            title="MHT-CET PCM — Seed Test",
            exam_pattern_id=pattern.id,
            window_open=now,
            window_close=now + timedelta(days=7),
            state=TestState.draft,
        )
        db.add(test)
        db.flush()

        for part in MHT_CET_PCM_PARTS:
            db.add(
                TestPart(
                    test_id=test.id,
                    ordinal=part["ordinal"],
                    title=part["title"],
                    duration_seconds=part["duration_seconds"],
                )
            )

        db.add(TestAssignment(test_id=test.id, batch_id=batch.id))
        db.commit()

        print(f"institute:   {institute.id}  {institute.name}")
        print(f"batch:       {batch.id}  {batch.name}")
        print(f"test:        {test.id}  {test.title} ({len(MHT_CET_PCM_PARTS)} parts)")


if __name__ == "__main__":
    main()
