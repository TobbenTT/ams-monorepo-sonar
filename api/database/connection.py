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
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def drop_all_tables():
    """Drop all tables — use with caution."""
    Base.metadata.drop_all(bind=engine)
