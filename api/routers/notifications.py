"""Notifications router — in-app notifications for WO status changes."""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.database.connection import get_db
from api.dependencies.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"], dependencies=[Depends(get_current_user)])


@router.get("/")
def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List notifications for the current user."""
    uid = getattr(user, "user_id", "") or getattr(user, "username", "")
    query = """
        SELECT notification_id, notification_type, title, message, level,
               equipment_id, acknowledged, read_at, created_at, recipient_id, channel
        FROM notifications
        WHERE (recipient_id = :uid OR recipient_id IS NULL OR recipient_id = '')
        ORDER BY created_at DESC
        LIMIT :lim
    """
    if unread_only:
        query = query.replace("ORDER BY", "AND acknowledged = false ORDER BY")

    rows = db.execute(text(query), {"uid": uid, "lim": limit}).fetchall()
    return [
        {
            "notification_id": r[0], "type": r[1], "title": r[2], "message": r[3],
            "priority": r[4], "entity_id": r[5],
            "is_read": bool(r[6]), "read_at": r[7].isoformat() if r[7] else None,
            "created_at": r[8].isoformat() if r[8] else None,
            "recipient_id": r[9], "channel": r[10],
        }
        for r in rows
    ]


@router.get("/unread-count")
def unread_count(user=Depends(get_current_user), db: Session = Depends(get_db)):
    uid = getattr(user, "user_id", "") or getattr(user, "username", "")
    result = db.execute(
        text("SELECT COUNT(*) FROM notifications WHERE (recipient_id = :uid OR recipient_id IS NULL OR recipient_id = '') AND acknowledged = false"),
        {"uid": uid},
    ).scalar()
    return {"count": result or 0}


@router.put("/{notification_id}/read")
def mark_read(notification_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(
        text("UPDATE notifications SET acknowledged = true, read_at = :now WHERE notification_id = :nid"),
        {"nid": notification_id, "now": datetime.now()},
    )
    db.commit()
    return {"ok": True}


@router.put("/read-all")
def mark_all_read(user=Depends(get_current_user), db: Session = Depends(get_db)):
    uid = getattr(user, "user_id", "") or getattr(user, "username", "")
    db.execute(
        text("UPDATE notifications SET acknowledged = true, read_at = :now WHERE (recipient_id = :uid OR recipient_id IS NULL OR recipient_id = '') AND acknowledged = false"),
        {"uid": uid, "now": datetime.now()},
    )
    db.commit()
    return {"ok": True}
