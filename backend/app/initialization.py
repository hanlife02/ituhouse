from __future__ import annotations

from .timezone import now

from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import get_password_hash
from .config import get_settings
from .database import Base, engine
from .models import AboutSection, User, UserRole


def run_initialization() -> None:
    """Create tables and seed initial entities."""
    Base.metadata.create_all(bind=engine)

    settings = get_settings()
    with Session(engine) as session:
        session.expire_on_commit = False
        _ensure_super_admin(session, settings)
        _ensure_about_sections(session, settings)
        session.commit()


def _ensure_super_admin(session: Session, settings) -> None:
    existing = session.execute(
        select(User).where(User.role == UserRole.SUPERADMIN)
    ).scalar_one_or_none()

    if existing:
        return

    user = User(
        username=settings.superadmin_username,
        email=settings.superadmin_email,
        hashed_password=get_password_hash(settings.superadmin_password),
        role=UserRole.SUPERADMIN,
        preferred_locale=settings.default_locale,
        preferred_theme=settings.default_theme,
        email_verified=True,
        created_at=now(),
        updated_at=now(),
    )
    session.add(user)


def _ensure_about_sections(session: Session, settings) -> None:
    existing_slugs = {
        slug for (slug,) in session.execute(select(AboutSection.slug)).all()
    }
    for slug, default_body in settings.about_default_sections.items():
        if slug in existing_slugs:
            continue
        title_map = {
            "about_rabbits": "关于兔兔们",
            "about_care_team": "关于兔兔护理队",
            "about_feeding": "关于喂兔",
        }
        section = AboutSection(
            slug=slug,
            title=title_map.get(slug, slug.replace("_", " ").title()),
            body_markdown=default_body,
            updated_at=now(),
        )
        session.add(section)
