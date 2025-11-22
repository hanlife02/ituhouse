from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    """Base for all ORM models."""


settings = get_settings()
_database_url = make_url(settings.database_url)


def _ensure_database_exists() -> None:
    """Create the configured database if it does not already exist."""
    if _database_url.drivername.split("+")[0] != "postgresql":
        return  # only PostgreSQL requires manual provisioning here

    admin_url = _database_url.set(database="postgres")
    admin_engine = create_engine(
        admin_url,
        isolation_level="AUTOCOMMIT",
        future=True,
    )
    db_name = _database_url.database

    if not db_name:
        raise ValueError("Database name missing from DATABASE_URL")

    with admin_engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": db_name},
        ).scalar()
        if not result:
            connection.execute(text(f'CREATE DATABASE "{db_name}"'))


_ensure_database_exists()

engine = create_engine(
    settings.database_url,
    future=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Provide a transactional scope for scripts."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Iterator[Session]:
    """FastAPI dependency that yields a database session."""
    with session_scope() as session:
        yield session
