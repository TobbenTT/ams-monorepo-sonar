"""Sales contact form router — handles demo requests and sales inquiries."""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sales", tags=["sales"])


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


@router.post("/contact")
def submit_contact(data: ContactRequest):
    """Handle contact form submission from landing page."""
    try:
        from api.services.email_service import send_email, is_configured

        # Log the lead
        logger.info("SALES LEAD: %s - %s (%s) - %s", data.company, data.full_name, data.email, data.interest)

        # Build email body
        html = f"""
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">New Sales Lead</h2>
                <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">AMS Platform — {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 18px;">{data.full_name}</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Company:</td><td style="color: #1e293b; font-weight: 600;">{data.company}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td><a href="mailto:{data.email}" style="color: #0f766e;">{data.email}</a></td></tr>
                    {f'<tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td style="color: #1e293b;">{data.phone}</td></tr>' if data.phone else ''}
                    {f'<tr><td style="padding: 6px 0; color: #64748b;">Country:</td><td style="color: #1e293b;">{data.country}</td></tr>' if data.country else ''}
                    {f'<tr><td style="padding: 6px 0; color: #64748b;">Industry:</td><td style="color: #1e293b;">{data.industry}</td></tr>' if data.industry else ''}
                    {f'<tr><td style="padding: 6px 0; color: #64748b;">Employees:</td><td style="color: #1e293b;">{data.num_employees}</td></tr>' if data.num_employees else ''}
                    {f'<tr><td style="padding: 6px 0; color: #64748b;">Plants:</td><td style="color: #1e293b;">{data.num_plants}</td></tr>' if data.num_plants else ''}
                    <tr><td style="padding: 6px 0; color: #64748b;">Interest:</td><td style="color: #1e293b;"><strong>{data.interest.upper()}</strong></td></tr>
                </table>
                {f'<div style="margin-top: 16px; padding: 12px; background: white; border-left: 3px solid #0f766e; border-radius: 6px;"><p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 600;">MESSAGE:</p><p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">{data.message}</p></div>' if data.message else ''}
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
                AMS Platform — Value Strategy Consulting<br>
                Reply within 24 hours for best conversion
            </p>
        </div>
        """

        sent = False
        if is_configured():
            # Send to sales team
            sales_email = "sales@aiprowork.com"
            sent = send_email(sales_email, f"New Lead: {data.company} - {data.full_name}", html)

            # Auto-reply to the lead
            confirm_html = f"""
            <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 20px;">Thank You for Your Interest</h2>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 12px; color: #1e293b; font-size: 15px;">Dear {data.full_name},</p>
                    <p style="margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.6;">
                        Thank you for your interest in <strong>AMS Platform</strong>. We have received your request and our sales team will contact you within 24 business hours to schedule a personalized demo.
                    </p>
                    <p style="margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.6;">
                        In the meantime, feel free to explore our <a href="https://ams.aiprowork.com/user-guide.html" style="color: #0f766e; font-weight: 600;">User Guide</a> or visit our <a href="https://ams.aiprowork.com/status" style="color: #0f766e; font-weight: 600;">Platform Status</a> page.
                    </p>
                    <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">
                        Best regards,<br><strong>Value Strategy Consulting</strong><br>AMS Platform Team
                    </p>
                </div>
            </div>
            """
            try:
                send_email(data.email, "We received your AMS Platform demo request", confirm_html)
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
