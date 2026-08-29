"""Run periodically (e.g. monthly) so the `event` table always has partitions
for the next several months. Idempotent — safe to re-run.

    uv run python scripts/ensure_event_partitions.py
"""

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.db import get_session
from app.db_partitions import create_partition_statements, months_forward

MONTHS_AHEAD = 6


def main() -> None:
    today = date.today()
    with get_session() as db:
        for year, month in months_forward(today.year, today.month, MONTHS_AHEAD):
            for stmt in create_partition_statements(year, month):
                db.execute(text(stmt))
        db.commit()
    print(f"Ensured event partitions through {months_forward(today.year, today.month, MONTHS_AHEAD)[-1]}")


if __name__ == "__main__":
    main()
