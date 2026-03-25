"""SQLAlchemy database engine and session management."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase

from api.config import settings


# SQLite needs special handling for foreign keys
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

_engine_kwargs = {
    "connect_args": {"check_same_thread": False} if _is_sqlite else {},
    "echo": settings.DEBUG,
}
if not _is_sqlite:
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 10

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)

# Enable foreign key enforcement for SQLite
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Create all tables in the database (safe for concurrent workers)."""
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
    except Exception:
        # Another worker may have created tables concurrently — safe to ignore
        pass
    # Run lightweight ALTER TABLE migrations for new columns on existing tables
    _run_column_migrations()


def _run_column_migrations():
    """Add missing columns to existing tables (SQLite ALTER TABLE)."""
    from sqlalchemy import text, inspect
    inspector = inspect(engine)

    migrations = [
        # (table, column, sql_type, default)
        ("work_requests", "priority_code", "VARCHAR(5)", "'P3'"),
        ("work_requests", "work_class", "VARCHAR(20)", "'PROGRAMADO'"),
        ("work_requests", "sla_deadline", "DATETIME", None),
        ("work_requests", "created_by", "VARCHAR(50)", None),
        ("work_requests", "approver_id", "VARCHAR(50)", None),
        ("work_requests", "approved_at", "DATETIME", None),
        ("work_requests", "approval_comment", "TEXT", None),
        ("work_requests", "rejection_reason", "TEXT", None),
        ("managed_work_orders", "is_fast_track", "BOOLEAN", "0"),
        # SAP Aviso alignment
        ("work_requests", "notification_type", "VARCHAR(30)", "'A1'"),
        ("work_requests", "reported_by", "VARCHAR(100)", None),
        ("work_requests", "reported_at", "DATETIME", None),
        ("work_requests", "documents", "TEXT", None),  # JSON
        ("work_requests", "support_equipment", "TEXT", None),  # JSON
        ("work_requests", "circumstances", "TEXT", None),
        # Phase 3 — Scheduling improvements
        ("weekly_programs", "published_at", "DATETIME", None),
        ("weekly_programs", "published_by", "VARCHAR(50)", None),
        ("weekly_programs", "material_status", "TEXT", None),  # JSON
        ("weekly_programs", "hh_balance", "TEXT", None),  # JSON
    ]

    with engine.begin() as conn:
        for table, column, col_type, default in migrations:
            try:
                existing = [c["name"] for c in inspector.get_columns(table)]
                if column not in existing:
                    default_clause = f" DEFAULT {default}" if default else ""
                    conn.execute(text(
                        f"ALTER TABLE {table} ADD COLUMN {column} {col_type}{default_clause}"
                    ))
            except Exception:
                pass  # Column already exists or table doesn't exist yet


def drop_all_tables():
    """Drop all tables — use with caution."""
    Base.metadata.drop_all(bind=engine)
