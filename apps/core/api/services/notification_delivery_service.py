"""Notification delivery service — gateway entre eventos de dominio y email.

SF-683. Implementa:
- Templates por event_type (WORK_REQUEST_CREATED/APPROVED/REJECTED)
- Persistencia trace en notification_deliveries (status, retries, error_message)
- Retry exponencial vía endpoint manual o cron
- Audit log de cada envío
- No bloquea la request principal (silencia excepciones del SMTP)

El email gateway concreto vive en `api/services/email_service.py`. Este
service es la capa "qué evento dispara qué template para quién".
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from api.database.models import NotificationDeliveryModel
from api.services import email_service
from api.services.audit_service import log_action

logger = logging.getLogger("ocp_maintenance.notify")

MAX_RETRIES = 3

# Templates: cada entry es (subject, body_html_fn)
TEMPLATES: dict[str, dict[str, Any]] = {
    "WORK_REQUEST_CREATED_REQUESTER": {
        "subject": "Tu requerimiento {request_id} fue recibido",
        "body": (
            "Hola {recipient_name},<br><br>"
            "Recibimos tu requerimiento <b>{request_id}</b> ({description}).<br>"
            "Estado actual: <b>{status}</b>. Te avisaremos cuando sea aprobado."
        ),
    },
    "WORK_REQUEST_CREATED_APPROVER": {
        "subject": "Nuevo requerimiento {request_id} requiere tu aprobación",
        "body": (
            "Hola,<br><br>"
            "El usuario <b>{requester}</b> creó el requerimiento <b>{request_id}</b>.<br>"
            "Descripción: {description}<br>"
            "Prioridad: {priority}<br><br>"
            "Por favor revisa y aprueba/rechaza en AMS."
        ),
    },
    "WORK_REQUEST_APPROVED": {
        "subject": "Tu requerimiento {request_id} fue APROBADO",
        "body": (
            "Hola {recipient_name},<br><br>"
            "Tu requerimiento <b>{request_id}</b> fue aprobado por <b>{approver}</b>.<br>"
            "Comentario: {comment}"
        ),
    },
    "WORK_REQUEST_REJECTED": {
        "subject": "Tu requerimiento {request_id} fue RECHAZADO",
        "body": (
            "Hola {recipient_name},<br><br>"
            "Tu requerimiento <b>{request_id}</b> fue rechazado.<br>"
            "Razón: {reason}"
        ),
    },
}


def _render(template_key: str, ctx: dict) -> tuple[str, str]:
    tpl = TEMPLATES.get(template_key)
    if not tpl:
        raise ValueError(f"Template desconocido: {template_key}")
    safe = {**ctx}
    safe.setdefault("recipient_name", "")
    safe.setdefault("description", "")
    safe.setdefault("status", "")
    safe.setdefault("requester", "")
    safe.setdefault("priority", "")
    safe.setdefault("approver", "")
    safe.setdefault("comment", "")
    safe.setdefault("reason", "")
    return tpl["subject"].format(**safe), tpl["body"].format(**safe)


def enqueue_notification(
    db: Session,
    *,
    event_type: str,
    entity_type: str,
    entity_id: str,
    recipient: str,
    template: str,
    context: dict,
    tenant_id: str | None = None,
) -> NotificationDeliveryModel:
    """Persiste la intención de notificar y devuelve el registro PENDING.

    El envío real lo hace `_send_one()` (síncrono best-effort + retry).
    """
    rec = NotificationDeliveryModel(
        tenant_id=tenant_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        recipient=recipient,
        template=template,
        status="PENDING",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    _send_one(db, rec, context)
    return rec


def _send_one(db: Session, rec: NotificationDeliveryModel, context: dict) -> None:
    """Intenta enviar un email; actualiza el registro con resultado."""
    try:
        subject, body = _render(rec.template, context)
    except Exception as e:
        rec.status = "FAILED"
        rec.error_message = f"render: {e}"[:500]
        rec.failed_at = datetime.now()
        db.commit()
        return

    rec.retries += 1
    try:
        ok = email_service.send_email(rec.recipient, subject, body)
    except Exception as e:
        ok = False
        rec.error_message = str(e)[:500]

    if ok:
        rec.status = "SENT"
        rec.sent_at = datetime.now()
        rec.error_message = None
    else:
        if not rec.error_message:
            rec.error_message = "SMTP no configurado o envío falló"
        if rec.retries >= MAX_RETRIES:
            rec.status = "FAILED"
            rec.failed_at = datetime.now()
        else:
            rec.status = "RETRY"
    db.commit()
    log_action(db, "notification_delivery", str(rec.id), rec.status)


def retry_pending(db: Session, max_batch: int = 20) -> dict:
    """Reintenta deliveries en estado RETRY (cron/manual). Sin context."""
    pending = (
        db.query(NotificationDeliveryModel)
        .filter(NotificationDeliveryModel.status == "RETRY")
        .filter(NotificationDeliveryModel.retries < MAX_RETRIES)
        .limit(max_batch).all()
    )
    sent, failed = 0, 0
    for rec in pending:
        _send_one(db, rec, {"request_id": rec.entity_id})
        if rec.status == "SENT":
            sent += 1
        elif rec.status == "FAILED":
            failed += 1
    return {"processed": len(pending), "sent": sent, "failed": failed}


# ── Domain event helpers (lo que llaman los routers) ───────────────
def notify_wr_created(db: Session, wr, requester_email: str | None, approver_email: str | None) -> None:
    """Dispara emails de requester (confirmación) y approver (aprobación pendiente)."""
    ctx_base = {
        "request_id": wr.request_id,
        "description": (wr.description or "")[:200],
        "priority": getattr(wr, "priority_code", "") or "",
        "status": getattr(wr, "status", "") or "",
        "requester": getattr(wr, "created_by", "") or "",
    }
    if requester_email:
        try:
            enqueue_notification(
                db,
                event_type="WORK_REQUEST_CREATED",
                entity_type="work_request",
                entity_id=wr.request_id,
                recipient=requester_email,
                template="WORK_REQUEST_CREATED_REQUESTER",
                context={**ctx_base, "recipient_name": requester_email.split("@")[0]},
            )
        except Exception as e:
            logger.warning("notify requester failed: %s", e)
    if approver_email:
        try:
            enqueue_notification(
                db,
                event_type="WORK_REQUEST_CREATED",
                entity_type="work_request",
                entity_id=wr.request_id,
                recipient=approver_email,
                template="WORK_REQUEST_CREATED_APPROVER",
                context=ctx_base,
            )
        except Exception as e:
            logger.warning("notify approver failed: %s", e)


def notify_wr_approved(db: Session, wr, requester_email: str | None, approver_username: str, comment: str = "") -> None:
    if not requester_email:
        return
    try:
        enqueue_notification(
            db,
            event_type="WORK_REQUEST_APPROVED",
            entity_type="work_request",
            entity_id=wr.request_id,
            recipient=requester_email,
            template="WORK_REQUEST_APPROVED",
            context={
                "request_id": wr.request_id,
                "recipient_name": requester_email.split("@")[0],
                "approver": approver_username,
                "comment": comment or "",
            },
        )
    except Exception as e:
        logger.warning("notify approved failed: %s", e)


def notify_wr_rejected(db: Session, wr, requester_email: str | None, reason: str = "") -> None:
    if not requester_email:
        return
    try:
        enqueue_notification(
            db,
            event_type="WORK_REQUEST_REJECTED",
            entity_type="work_request",
            entity_id=wr.request_id,
            recipient=requester_email,
            template="WORK_REQUEST_REJECTED",
            context={
                "request_id": wr.request_id,
                "recipient_name": requester_email.split("@")[0],
                "reason": reason or "",
            },
        )
    except Exception as e:
        logger.warning("notify rejected failed: %s", e)
