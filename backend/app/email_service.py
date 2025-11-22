from __future__ import annotations

import json
import logging
import os
from email.message import EmailMessage
from pathlib import Path
import smtplib
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "email_senders.json"


def _load_sender_configs() -> list[dict[str, Any]]:
    """Load SMTP sender configurations from JSON file."""
    config_path = os.getenv("EMAIL_SENDERS_FILE")
    path = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
    if not path.exists():
        logger.warning("Email sender config file not found at %s", path)
        return []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - log unexpected parse errors
        logger.error("Failed to parse email sender config: %s", exc)
        return []

    if not isinstance(data, list):
        logger.error("Email sender config must be a list of accounts")
        return []

    valid_configs: list[dict[str, Any]] = []
    for entry in data:
        if not isinstance(entry, dict):
            continue
        required = {"from_email", "host", "port", "username", "password"}
        if not required.issubset(entry.keys()):
            missing = ", ".join(sorted(required - entry.keys()))
            logger.warning("Skipping email config missing %s", missing)
            continue
        valid_configs.append(entry)
    return valid_configs


def _send_with_config(config: dict[str, Any], message: EmailMessage) -> None:
    host = config["host"]
    port = int(config.get("port", 587))
    use_ssl = bool(config.get("use_ssl", False))
    use_tls = bool(config.get("use_tls", not use_ssl))

    smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
    with smtp_class(host=host, port=port, timeout=15) as server:
        if use_tls and not use_ssl:
            server.starttls()
        server.login(config["username"], config["password"])
        server.send_message(message)


def send_email(
    *,
    to_email: str,
    subject: str,
    body: str,
    from_name: str | None = None,
) -> bool:
    """Send an email using the configured SMTP accounts sequentially."""
    configs = _load_sender_configs()
    if not configs:
        logger.warning("No SMTP configurations available for sending email.")
        return False

    for config in configs:
        from_email = config["from_email"]
        email_message = EmailMessage()
        display_from = f"{from_name} <{from_email}>" if from_name else from_email
        email_message["Subject"] = subject
        email_message["From"] = display_from
        email_message["To"] = to_email
        email_message.set_content(body)

        try:
            _send_with_config(config, email_message)
            logger.info("Sent email to %s using %s", to_email, config.get("name", from_email))
            return True
        except Exception as exc:  # pragma: no cover - rely on runtime logging
            logger.warning(
                "Failed to send email via %s: %s",
                config.get("name", from_email),
                exc,
            )
            continue

    logger.error("Unable to send email to %s using any configured SMTP account.", to_email)
    return False


def send_verification_email(*, to_email: str, code: str, app_name: str) -> bool:
    subject = f"{app_name} 验证码 / Verification Code"
    body = (
        f"您好！\n\n您的验证码是：{code}\n"
        "15 分钟内有效，请勿泄露给他人。\n\n"
        "Hello,\n\n"
        f"Your verification code is: {code}\n"
        "It will expire in 15 minutes.\n"
    )
    return send_email(to_email=to_email, subject=subject, body=body, from_name=app_name)
