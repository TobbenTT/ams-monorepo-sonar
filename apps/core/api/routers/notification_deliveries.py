"""Notification deliveries router — historial + reintentos manuales (SF-683)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import NotificationDeliveryModel
from api.dependencies.auth import get_current_user, require_role
from api.services import notification_delivery_service

router = APIRouter(
    prefix="/notification-deliveries",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/")
def list_deliveries(
    entity_id: str | None = None,
    status: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = db.query(NotificationDeliveryModel)
    if entity_id:
        q = q.filter(NotificationDeliveryModel.entity_id == entity_id)
    if status:
        q = q.filter(NotificationDeliveryModel.status == status)
    rows = q.order_by(NotificationDeliveryModel.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "event_type": r.event_type,
            "entity_type": r.entity_type,
            "entity_id": r.entity_id,
            "recipient": r.recipient,
            "template": r.template,
            "status": r.status,
            "retries": r.retries,
            "error_message": r.error_message,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            "failed_at": r.failed_at.isoformat() if r.failed_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("/retry", dependencies=[Depends(require_role("admin", "manager"))])
def retry_failed(max_batch: int = 20, db: Session = Depends(get_db)):
    """Reintenta deliveries en estado RETRY (manual o cron)."""
    return notification_delivery_service.retry_pending(db, max_batch=max_batch)


@router.post("/{delivery_id}/retry", dependencies=[Depends(require_role("admin", "manager"))])
def retry_one(delivery_id: int, db: Session = Depends(get_db)):
    rec = db.query(NotificationDeliveryModel).filter(NotificationDeliveryModel.id == delivery_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if rec.retries >= notification_delivery_service.MAX_RETRIES:
        raise HTTPException(status_code=409, detail="Max retries reached")
    notification_delivery_service._send_one(db, rec, {"request_id": rec.entity_id})
    return {"id": rec.id, "status": rec.status, "retries": rec.retries}
