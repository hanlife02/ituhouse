from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from .config import get_settings

_settings = get_settings()
TZ = ZoneInfo(_settings.app_timezone)


def now() -> datetime:
    return datetime.now(TZ)
