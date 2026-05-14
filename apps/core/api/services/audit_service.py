"""Audit log service — records every mutation for traceability."""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import AuditLogModel


def log_action(db: Session, entity_type: str, entity_id: str, action: str, payload: dict | None = None, user: str = "system"):
    entry = AuditLogModel(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        payload=payload,
        user=user,
        timestamp=datetime.now(),
    )
    db.add(entry)
    db.flush()
