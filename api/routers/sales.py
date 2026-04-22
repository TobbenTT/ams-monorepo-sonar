"""Sales contact form router — handles demo requests and sales inquiries."""

import re
import time
import logging
import html as _html
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sales", tags=["sales"])

# Auditoría 2026-04-22 — rate limit por IP para mitigar spam del form público.
_CONTACT_IP_ATTEMPTS: dict[str, list[float]] = {}
_CONTACT_WINDOW = 600.0  # 10 minutos
_CONTACT_MAX = 3         # max 3 submissions por IP cada 10 min

def _check_contact_throttle(ip: str) -> None:
    now = time.time()
    attempts = _CONTACT_IP_ATTEMPTS.setdefault(ip, [])
    attempts[:] = [t for t in attempts if now - t < _CONTACT_WINDOW]
    if len(attempts) >= _CONTACT_MAX:
        logger.warning("Sales contact spam throttle: IP=%s attempts=%d", ip, len(attempts))
        raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")
    attempts.append(now)


class ContactRequest(BaseModel):
    full_name: str = Field(..., max_length=200)
    company: str = Field(..., max_length=200)
    email: str = Field(..., max_length=254)
    phone: str = Field(default="", max_length=50)
    country: str = Field(default="", max_length=100)
    industry: str = Field(default="", max_length=100)
    num_employees: str = Field(default="", max_length=50)
    num_plants: str = Field(default="", max_length=50)
    interest: str = Field(default="demo", max_length=50)  # demo | pricing | partnership | other
    message: str = Field(default="", max_length=2000)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        v = v.strip()
        if "\n" in v or "\r" in v:
            raise ValueError("Invalid email: contains newline characters")
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("full_name", "company", "phone", "country", "industry", "message")
    @classmethod
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return v.replace("\r", "").replace("\n", " ").replace("\x00", "").strip()
        return v


@router.post("/contact")
def submit_contact(data: ContactRequest, request: Request):
    """Handle contact form submission from landing page."""
    try:
        _check_contact_throttle(request.client.host if request.client else "unknown")
        from api.services.email_service import send_email, is_configured

        # Log the lead
        logger.info("SALES LEAD: %s - %s (%s) - %s", data.company, data.full_name, data.email, data.interest)

        # Auditoría 2026-04-22 — HTML escape obligatorio para prevenir
        # XSS en clientes de email y rewrite hijacking del href mailto.
        e = _html.escape
        safe = {
            "name": e(data.full_name),
            "company": e(data.company),
            "email": e(data.email),
            "phone": e(data.phone or "N/A"),
            "country": e(data.country or "N/A"),
            "industry": e(data.industry or "N/A"),
            "employees": e(data.num_employees or "N/A"),
            "plants": e(data.num_plants or "N/A"),
            "interest": e(data.interest.upper()),
            "message": e(data.message or "N/A"),
        }

        # Build email body
        html = f"""
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">New Sales Lead</h2>
                <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">MAGEAM — {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 18px;">{safe['name']}</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Company:</td><td style="color: #1e293b; font-weight: 600;">{safe['company']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td><a href="mailto:{safe['email']}" style="color: #0f766e;">{safe['email']}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td style="color: #1e293b;">{safe['phone']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Country:</td><td style="color: #1e293b;">{safe['country']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Industry:</td><td style="color: #1e293b;">{safe['industry']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Employees:</td><td style="color: #1e293b;">{safe['employees']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Plants:</td><td style="color: #1e293b;">{safe['plants']}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Interest:</td><td style="color: #1e293b;"><strong>{safe['interest']}</strong></td></tr>
                </table>
                <div style="margin-top: 16px; padding: 12px; background: white; border-left: 3px solid #0f766e; border-radius: 6px;"><p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 600;">MESSAGE:</p><p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">{safe['message']}</p></div>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
                MAGEAM — Value Strategy Consulting<br>
                Reply within 24 hours for best conversion
            </p>
        </div>
        """

        sent = False
        if is_configured():
            # Send to sales team
            sales_email = "jose.cortinat@valuestrategyconsulting.com"
            # Subject también necesita sanitizar (newlines = email header injection).
            subject = f"New Lead: {safe['company']} - {safe['name']}".replace('\n', ' ').replace('\r', ' ')[:200]
            sent = send_email(sales_email, subject, html)

            # Auto-reply to the lead
            confirm_html = f"""
            <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 20px;">Thank You for Your Interest</h2>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 12px; color: #1e293b; font-size: 15px;">Dear {safe['name']},</p>
                    <p style="margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Thank you for your interest in <strong>MAGEAM</strong>. We have received your request and our sales team will contact you within 24 business hours to schedule a personalized demo.
                    </p>
                    <p style="margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.6;">
                        In the meantime, feel free to explore our <a href="https://mageam.com/user-guide.html" style="color: #0f766e; font-weight: 600;">User Guide</a> or visit our <a href="https://mageam.com/status" style="color: #0f766e; font-weight: 600;">Platform Status</a> page.
                    </p>
                    <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">
                        Best regards,<br><strong>Value Strategy Consulting</strong><br>MAGEAM Team
                    </p>
                </div>
            </div>
            """
            try:
                send_email(data.email, "We received your MAGEAM demo request", confirm_html)
            except Exception:
                pass

        return {
            "ok": True,
            "message": "Your request has been submitted successfully. Our team will contact you within 24 hours.",
            "email_sent": sent,
        }
    except Exception as e:
        logger.error("Sales contact submission failed: %s", e)
        raise HTTPException(status_code=500, detail="Submission failed. Please try again.")
