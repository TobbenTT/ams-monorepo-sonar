"""MFA (TOTP) router — enrollment, verification, and status."""

import pyotp
import qrcode
import io
import base64
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.database.models import UserModel

router = APIRouter(prefix="/mfa", tags=["mfa"])


class TOTPVerifyRequest(BaseModel):
    code: str


@router.get("/status")
def mfa_status(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if MFA is enabled for current user."""
    u = db.query(UserModel).filter(UserModel.user_id == user.get("user_id", "")).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {"enabled": bool(getattr(u, "mfa_secret", None)), "user_id": u.user_id}


@router.post("/enroll")
def mfa_enroll(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate TOTP secret and QR code for enrollment."""
    u = db.query(UserModel).filter(UserModel.user_id == user.get("user_id", "")).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=u.username, issuer_name="MagEAM")

    # Generate QR code as base64 PNG
    qr = qrcode.make(provisioning_uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    # Store secret temporarily (not yet confirmed)
    u.mfa_pending_secret = secret
    db.commit()

    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}", "provisioning_uri": provisioning_uri}


@router.post("/confirm")
def mfa_confirm(data: TOTPVerifyRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Confirm MFA enrollment by verifying first TOTP code."""
    u = db.query(UserModel).filter(UserModel.user_id == user.get("user_id", "")).first()
    if not u or not getattr(u, "mfa_pending_secret", None):
        raise HTTPException(status_code=400, detail="No pending MFA enrollment")

    totp = pyotp.TOTP(u.mfa_pending_secret)
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Try again.")

    u.mfa_secret = u.mfa_pending_secret
    u.mfa_pending_secret = None
    db.commit()
    return {"ok": True, "message": "MFA enabled successfully"}


@router.post("/verify")
def mfa_verify(data: TOTPVerifyRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Verify a TOTP code (used during login)."""
    u = db.query(UserModel).filter(UserModel.user_id == user.get("user_id", "")).first()
    if not u or not getattr(u, "mfa_secret", None):
        raise HTTPException(status_code=400, detail="MFA not enabled")

    totp = pyotp.TOTP(u.mfa_secret)
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    return {"ok": True, "verified": True}


@router.delete("/disable")
def mfa_disable(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Disable MFA for current user."""
    u = db.query(UserModel).filter(UserModel.user_id == user.get("user_id", "")).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.mfa_secret = None
    u.mfa_pending_secret = None
    db.commit()
    return {"ok": True, "message": "MFA disabled"}
