"""Email notification service — sends alerts via SMTP."""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

# Read from env or platform settings
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SMTP_FROM = os.environ.get("SMTP_FROM", "noreply@aiprowork.com")


def is_configured():
    """Check if SMTP is configured."""
    return bool(SMTP_HOST and SMTP_USER)


def send_email(to: str, subject: str, body_html: str) -> bool:
    """Send an HTML email. Returns True on success."""
    if not is_configured():
        logger.warning("Email not configured — SMTP_HOST/SMTP_USER not set")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as srv:
            srv.ehlo()
            if SMTP_PORT == 587:
                srv.starttls()
                srv.ehlo()
            if SMTP_USER:
                srv.login(SMTP_USER, SMTP_PASS)
            srv.sendmail(SMTP_FROM, [to], msg.as_string())
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as e:
        logger.error("Email send failed: %s", e)
        return False


def send_notification(to: str, title: str, message: str, link: str = ""):
    """Send a styled notification email."""
    html = f"""
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">AMS Platform</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Notification</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">{title}</h3>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">{message}</p>
            {f'<a href="{link}" style="display: inline-block; margin-top: 16px; background: #0f766e; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">View in AMS</a>' if link else ''}
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
            AMS Platform v2.0 — Value Strategy Consulting
        </p>
    </div>
    """
    return send_email(to, f"AMS: {title}", html)
