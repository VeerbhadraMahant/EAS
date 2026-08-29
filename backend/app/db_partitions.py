"""DDL for monthly `event` table partitions.

Postgres requires the partition key (server_received_ts) to be part of any
constraint declared on the *parent* partitioned table. That's incompatible
with the app's dedupe key (session_id, client_instance_id, client_seq), which
deliberately excludes server_received_ts so retried/re-delivered events with a
fresh receipt timestamp still collide with the original on ON CONFLICT DO
NOTHING. So instead of a parent-level constraint, each partition gets its own
local UNIQUE index on the dedupe key — sufficient in practice because a
sitting's events always land in one partition (sittings run hours, partitions
are months), and it still lets `INSERT ... ON CONFLICT (session_id,
client_instance_id, client_seq) DO NOTHING` work through the parent, since
Postgres routes the insert to the partition and uses that partition's index.
"""

from datetime import date


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def partition_name(year: int, month: int) -> str:
    return f"event_{year:04d}_{month:02d}"


def create_partition_statements(year: int, month: int) -> list[str]:
    name = partition_name(year, month)
    start, end = _month_bounds(year, month)
    return [
        f"""CREATE TABLE IF NOT EXISTS {name}
            PARTITION OF event
            FOR VALUES FROM ('{start.isoformat()}') TO ('{end.isoformat()}');""",
        f"""CREATE UNIQUE INDEX IF NOT EXISTS {name}_dedupe_idx
            ON {name} (session_id, client_instance_id, client_seq);""",
        f"""CREATE INDEX IF NOT EXISTS {name}_replay_idx
            ON {name} (session_id, server_received_ts);""",
    ]


def months_forward(start_year: int, start_month: int, count: int) -> list[tuple[int, int]]:
    result = []
    y, m = start_year, start_month
    for _ in range(count):
        result.append((y, m))
        m += 1
        if m > 12:
            m = 1
            y += 1
    return result
