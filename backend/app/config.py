from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
import os
from pathlib import Path
from typing import Optional
from urllib.parse import quote_plus

from dotenv import load_dotenv

DOTENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if DOTENV_PATH.exists():
    load_dotenv(dotenv_path=DOTENV_PATH)


def _env(key: str, default: Optional[str] = None, *, required: bool = False) -> str:
    value = os.getenv(key, default)
    if value is None and required:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value or ""


def _int_env(key: str, default: int) -> int:
    raw = os.getenv(key)
    return int(raw) if raw is not None else default


def _list_env(key: str, default: list[str]) -> list[str]:
    raw = os.getenv(key)
    if raw is None:
        return default
    raw = raw.strip()
    if not raw:
        return default
    if raw == "*":
        return ["*"]
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(slots=True)
class Settings:
    app_name: str
    environment: str
    database_url_override: Optional[str]
    database_host: str
    database_port: int
    database_name: str
    database_user: str
    database_password: str

    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    superadmin_email: str
    superadmin_username: str
    superadmin_password: str

    default_locale: str
    default_theme: str
    app_timezone: str
    cors_allow_origins: list[str]

    about_default_sections: dict[str, str] = field(
        default_factory=lambda: {
            "about_rabbits": "## 关于兔兔们\n\n欢迎来到小兔书。",
            "about_care_team": "## 关于兔兔护理队\n\n我们守护兔兔。",
            "about_feeding": "## 关于喂兔\n\n喂兔指南即将更新。",
        }
    )

    @property
    def database_url(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        password = quote_plus(self.database_password)
        return (
            f"postgresql+psycopg://{self.database_user}:{password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings populated from environment variables."""
    return Settings(
        app_name=_env("APP_NAME", "小兔书 ituhouse"),
        environment=_env("ENVIRONMENT", "development"),
        database_url_override=os.getenv("DATABASE_URL"),
        database_host=_env("DB_HOST", "localhost"),
        database_port=_int_env("DB_PORT", 5432),
        database_name=_env("DB_NAME", "ituhouse"),
        database_user=_env("DB_USER", "postgres"),
        database_password=_env("DB_PASSWORD", "postgres"),
        jwt_secret_key=_env("JWT_SECRET_KEY", required=True),
        jwt_algorithm=_env("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=_int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24),
        superadmin_email=_env("SUPERADMIN_EMAIL", required=True),
        superadmin_username=_env("SUPERADMIN_USERNAME", "ituhouse-root"),
        superadmin_password=_env("SUPERADMIN_PASSWORD", required=True),
        default_locale=_env("DEFAULT_LOCALE", "zh-CN"),
        default_theme=_env("DEFAULT_THEME", "system"),
        app_timezone=_env("APP_TIMEZONE", "Asia/Shanghai"),
        cors_allow_origins=_list_env("CORS_ALLOW_ORIGINS", ["http://localhost:3000"]),
    )
