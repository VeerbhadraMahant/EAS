"""Worker entrypoint: polls the `job` table with SELECT ... FOR UPDATE SKIP
LOCKED. Handlers for individual job types (grade_session, generate_report,
build_bundle, ...) land with the build-order step that needs them; this is
just the polling skeleton.
"""

import time
from datetime import datetime, timezone

from sqlalchemy import select

from app.db import get_session
from app.grading import grade_session
from app.models.jobs import Job, JobState

POLL_INTERVAL_SECONDS = 2

HANDLERS: dict = {"grade_session": grade_session}


def claim_job() -> Job | None:
    with get_session() as db:
        stmt = (
            select(Job)
            .where(Job.state == JobState.pending, Job.run_after <= datetime.now(timezone.utc))
            .order_by(Job.run_after)
            .limit(1)
            .with_for_update(skip_locked=True)
        )
        job = db.execute(stmt).scalar_one_or_none()
        if job is None:
            return None
        job.state = JobState.running
        job.attempts += 1
        db.commit()
        db.refresh(job)
        return job


def run_forever() -> None:
    while True:
        job = claim_job()
        if job is None:
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        handler = HANDLERS.get(job.type)
        with get_session() as db:
            db_job = db.get(Job, job.id)
            if handler is None:
                db_job.state = JobState.failed
                db_job.last_error = f"no handler registered for job type {job.type!r}"
            else:
                handler(db, db_job)
                db_job.state = JobState.done
            db.commit()


if __name__ == "__main__":
    run_forever()
