"""Detailed Feedback router — full feedback with attachments, screenshots, JSON export."""

import base64
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import DetailedFeedbackModel
from api.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])

FEEDBACK_UPLOAD_DIR = Path(os.environ.get("FEEDBACK_UPLOAD_DIR", "data/feedback_uploads"))
FEEDBACK_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES | {
    "application/pdf", "text/plain", "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# ── Schemas ──────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    feedback_type: str = Field(default="suggestion", pattern="^(bug|suggestion|question|improvement|other)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    title: str = Field(default="", max_length=300)
    description: str = Field(default="", max_length=10000)
    rating: int = Field(default=3, ge=1, le=5)
    page_url: str = Field(default="", max_length=500)
    page_name: str = Field(default="", max_length=100)
    section: str = Field(default="", max_length=100)
    component: str = Field(default="", max_length=100)
    browser_info: str = Field(default="", max_length=500)
    screen_size: str = Field(default="", max_length=50)
    device_type: str = Field(default="desktop", max_length=30)
    os_info: str = Field(default="", max_length=100)
    steps_to_reproduce: str = Field(default="", max_length=5000)
    expected_behavior: str = Field(default="", max_length=5000)
    actual_behavior: str = Field(default="", max_length=5000)
    # Screenshots as base64 data URLs
    screenshots: list[dict] | None = None  # [{data_url, caption}]


class FeedbackUpdate(BaseModel):
    status: str | None = None
    admin_notes: str | None = None


# ── Helpers ──────────────────────────────────────────────────────────

def _save_base64_file(data_url: str, prefix: str) -> dict | None:
    """Save a base64 data-URL to disk. Returns {url, filename, type, size}."""
    try:
        if ";base64," not in data_url:
            return None
        header, b64data = data_url.split(";base64,", 1)
        mime_type = header.replace("data:", "")
        ext_map = {
            "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
            "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm",
        }
        ext = ext_map.get(mime_type, "bin")
        filename = f"{prefix}-{uuid.uuid4().hex[:8]}.{ext}"
        file_bytes = base64.b64decode(b64data)
        filepath = FEEDBACK_UPLOAD_DIR / filename
        filepath.write_bytes(file_bytes)
        return {
            "url": f"/api/v1/feedback/files/{filename}",
            "filename": filename,
            "type": mime_type,
            "size": len(file_bytes),
        }
    except Exception as e:
        logger.warning("Failed to save base64 file: %s", e)
        return None


# ── Serve uploaded files (public) ────────────────────────────────────

@router.get("/files/{filename}")
def serve_feedback_file(filename: str):
    """Serve an uploaded feedback file (no auth for img/video tags)."""
    safe_name = Path(filename).name
    filepath = FEEDBACK_UPLOAD_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    ext = safe_name.rsplit(".", 1)[-1].lower()
    media_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "webp": "image/webp", "gif": "image/gif",
        "mp4": "video/mp4", "webm": "video/webm", "mov": "video/quicktime",
        "pdf": "application/pdf",
    }
    return FileResponse(filepath, media_type=media_types.get(ext, "application/octet-stream"))


# ── Submit feedback ──────────────────────────────────────────────────

@router.post("/")
def create_feedback(
    body: FeedbackCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Submit detailed feedback with optional base64 screenshots."""
    # Save screenshots from base64
    saved_screenshots = []
    if body.screenshots:
        for i, sc in enumerate(body.screenshots[:10]):  # max 10 screenshots
            data_url = sc.get("data_url", "")
            if data_url:
                saved = _save_base64_file(data_url, f"fb-sc-{i}")
                if saved:
                    saved["caption"] = sc.get("caption", "")
                    saved_screenshots.append(saved)

    fb = DetailedFeedbackModel(
        user_id=user.get("user_id", ""),
        user_name=user.get("username", "anonymous"),
        user_role=user.get("role", ""),
        feedback_type=body.feedback_type,
        priority=body.priority,
        title=body.title,
        description=body.description,
        rating=body.rating,
        page_url=body.page_url,
        page_name=body.page_name,
        section=body.section,
        component=body.component,
        browser_info=body.browser_info,
        screen_size=body.screen_size,
        device_type=body.device_type,
        os_info=body.os_info,
        steps_to_reproduce=body.steps_to_reproduce,
        expected_behavior=body.expected_behavior,
        actual_behavior=body.actual_behavior,
        screenshots=saved_screenshots or None,
        attachments=None,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"feedback_id": fb.feedback_id, "status": "created"}


# ── Upload attachment to existing feedback ───────────────────────────

@router.post("/{feedback_id}/attachments")
async def upload_attachment(
    feedback_id: str,
    file: UploadFile = File(...),
    caption: str = Form(default=""),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Upload a file attachment (image, video, PDF, etc.) to existing feedback."""
    fb = db.get(DetailedFeedbackModel, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    filename = f"fb-att-{uuid.uuid4().hex[:8]}.{ext}"
    filepath = FEEDBACK_UPLOAD_DIR / filename
    filepath.write_bytes(content)

    attachment = {
        "url": f"/api/v1/feedback/files/{filename}",
        "filename": file.filename or filename,
        "type": file.content_type,
        "size": len(content),
        "caption": caption,
    }

    current = fb.attachments or []
    current.append(attachment)
    fb.attachments = current
    fb.updated_at = datetime.now()
    db.commit()
    return attachment


# ── List feedback ────────────────────────────────────────────────────

@router.get("/")
def list_feedback(
    status: str | None = None,
    feedback_type: str | None = None,
    page_name: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """List all feedback (admin/manager) or own feedback."""
    q = db.query(DetailedFeedbackModel).order_by(DetailedFeedbackModel.created_at.desc())
    if status:
        q = q.filter(DetailedFeedbackModel.status == status)
    if feedback_type:
        q = q.filter(DetailedFeedbackModel.feedback_type == feedback_type)
    if page_name:
        q = q.filter(DetailedFeedbackModel.page_name == page_name)
    rows = q.limit(limit).all()
    return [_fb_to_dict(r) for r in rows]


# ── Get single feedback ─────────────────────────────────────────────

@router.get("/{feedback_id}")
def get_feedback(
    feedback_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    fb = db.get(DetailedFeedbackModel, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return _fb_to_dict(fb)


# ── Update feedback status ───────────────────────────────────────────

@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: str,
    body: FeedbackUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    fb = db.get(DetailedFeedbackModel, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if body.status is not None:
        fb.status = body.status
    if body.admin_notes is not None:
        fb.admin_notes = body.admin_notes
    fb.updated_at = datetime.now()
    db.commit()
    return _fb_to_dict(fb)


# ── Download ALL feedback as JSON ────────────────────────────────────

@router.get("/export/json")
def export_feedback_json(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Download all feedback as a JSON file — includes everything for AI analysis."""
    rows = db.query(DetailedFeedbackModel).order_by(DetailedFeedbackModel.created_at.desc()).all()
    data = {
        "exported_at": datetime.now().isoformat(),
        "total_count": len(rows),
        "feedback": [_fb_to_dict(r) for r in rows],
        "summary": {
            "by_type": _count_by(rows, "feedback_type"),
            "by_priority": _count_by(rows, "priority"),
            "by_status": _count_by(rows, "status"),
            "by_page": _count_by(rows, "page_name"),
            "avg_rating": round(sum(r.rating for r in rows) / len(rows), 1) if rows else 0,
        },
    }
    return JSONResponse(content=data, headers={
        "Content-Disposition": f"attachment; filename=feedback-export-{datetime.now().strftime('%Y%m%d')}.json"
    })


# ── Helpers ──────────────────────────────────────────────────────────

def _fb_to_dict(fb: DetailedFeedbackModel) -> dict:
    return {
        "feedback_id": fb.feedback_id,
        "user_id": fb.user_id,
        "user_name": fb.user_name,
        "user_role": fb.user_role,
        "feedback_type": fb.feedback_type,
        "priority": fb.priority,
        "title": fb.title,
        "description": fb.description,
        "rating": fb.rating,
        "page_url": fb.page_url,
        "page_name": fb.page_name,
        "section": fb.section,
        "component": fb.component,
        "browser_info": fb.browser_info,
        "screen_size": fb.screen_size,
        "device_type": fb.device_type,
        "os_info": fb.os_info,
        "screenshots": fb.screenshots or [],
        "attachments": fb.attachments or [],
        "steps_to_reproduce": fb.steps_to_reproduce,
        "expected_behavior": fb.expected_behavior,
        "actual_behavior": fb.actual_behavior,
        "status": fb.status,
        "admin_notes": fb.admin_notes,
        "created_at": fb.created_at.isoformat() if fb.created_at else None,
        "updated_at": fb.updated_at.isoformat() if fb.updated_at else None,
    }


def _count_by(rows, attr):
    counts = {}
    for r in rows:
        val = getattr(r, attr, "unknown")
        counts[val] = counts.get(val, 0) + 1
    return counts
