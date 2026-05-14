"""Group C #6 — SAP sync pipeline.

This service builds the outbound payload for a WO and writes it to
sap_sync_log (status=PENDING). A worker (future) will pick up PENDING
rows and actually call SAP (BAPI_ALM_ORDER_CREATE or REST wrapper),
then flip status=SENT and store sap_ref.

The pipeline is idempotent by entity_id: re-pushing a WO that is already
PENDING or SENT just returns the existing record — no duplicate rows.

When the real transport lands, only `_transport_send` needs to be
implemented; the rest of the contract (payload shape, error handling,
retry semantics) stays the same.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import ManagedWorkOrderModel, SapSyncLogModel


def build_payload(wo: ManagedWorkOrderModel) -> dict:
    """Build the SAP-PM-like payload for a WO. Keys follow the BAPI_ALM
    contract so the transport layer can forward it as-is."""
    return {
        "ORDER": {
            "WO_ID": wo.wo_id,
            "WO_NUMBER": wo.wo_number,
            "TYPE": wo.wo_type,
            "PRIORITY": wo.priority_code,
            "DESCRIPTION": wo.description or "",
            "PLANT": wo.plant_id,
            "EQUIPMENT": wo.equipment_tag,
            "TECH_LOCATION": wo.technical_location,
            "PLANNING_GROUP": wo.planning_group,
            "WORK_CENTER": wo.work_center,
            "PLAN_START": wo.planned_start.isoformat() if wo.planned_start else None,
            "PLAN_END": wo.planned_end.isoformat() if wo.planned_end else None,
            "ESTIMATED_HOURS": wo.estimated_hours,
            "ACTUAL_HOURS": wo.actual_hours,
            "STATUS": wo.status,
        },
        "OPERATIONS": [
            {
                "NUM": i + 1,
                "DESC": (op or {}).get("description") or (op or {}).get("task") or "",
                "WORK_CENTER": (op or {}).get("work_center") or wo.work_center,
                "PLAN_HOURS": (op or {}).get("hours") or 0,
                "ACTUAL_HOURS": (op or {}).get("actual_hours") or 0,
            }
            for i, op in enumerate(wo.operations or [])
        ],
        "COMPONENTS": [
            {
                "MATERIAL": (m or {}).get("code") or (m or {}).get("sap_id"),
                "DESC": (m or {}).get("description") or "",
                "QTY": (m or {}).get("quantity") or 0,
                "UOM": (m or {}).get("uom") or "EA",
                "RESERVATION": wo.reservation_code,
            }
            for m in (wo.materials or [])
            if (m or {}).get("code") or (m or {}).get("sap_id")
        ],
        "CLOSURE": {
            "SIGNED_BY": wo.closed_by_signature,
            "CLOSED_AT": wo.closed_at.isoformat() if wo.closed_at else None,
            "NOTES": wo.closure_notes,
        } if wo.status == "CERRADO" else None,
    }


def push_wo(db: Session, wo_id: str, user: str = "system") -> dict | None:
    """Idempotently queue a WO for SAP sync. Returns the log row as dict."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None

    existing = db.query(SapSyncLogModel).filter(
        SapSyncLogModel.entity_type == "managed_work_order",
        SapSyncLogModel.entity_id == wo_id,
        SapSyncLogModel.status.in_(["PENDING", "SENT", "ACKED"]),
    ).order_by(SapSyncLogModel.created_at.desc()).first()

    payload = build_payload(wo)

    if existing and existing.status == "PENDING":
        # Refresh payload in case WO changed after last queue
        existing.payload = payload
        existing.updated_at = datetime.now()
        db.commit()
        return _to_dict(existing)

    if existing and existing.status in ("SENT", "ACKED"):
        # Already synced — return existing without re-queuing
        return _to_dict(existing)

    entry = SapSyncLogModel(
        entity_type="managed_work_order",
        entity_id=wo_id,
        status="PENDING",
        attempts=0,
        payload=payload,
        created_at=datetime.now(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_dict(entry)


def get_status(db: Session, wo_id: str) -> dict | None:
    row = db.query(SapSyncLogModel).filter(
        SapSyncLogModel.entity_type == "managed_work_order",
        SapSyncLogModel.entity_id == wo_id,
    ).order_by(SapSyncLogModel.created_at.desc()).first()
    return _to_dict(row) if row else None


def _to_dict(row: SapSyncLogModel) -> dict:
    return {
        "id": row.id,
        "entity_type": row.entity_type,
        "entity_id": row.entity_id,
        "status": row.status,
        "attempts": row.attempts,
        "last_error": row.last_error,
        "sap_ref": row.sap_ref,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


# ── Transport layer (SF-728+ Strategy Pattern) ──────────────────────
# El transport real se selecciona en runtime por env SAP_TRANSPORT.
# Ver api/services/sap_transports/ para implementaciones (dry_run / mock /
# rfc / odata). Worker que procesa la cola: api/workers/sap_worker.py


def _transport_send(payload: dict) -> tuple[bool, str | None, str | None]:
    """Envía un payload SAP usando el transport configurado.

    Devuelve ``(ok, sap_ref, error_message)``:
      - ok=True  → sap_ref tiene el identificador devuelto por SAP
      - ok=False → error_message describe la falla; el worker reintenta
    """
    from api.services.sap_transports import get_transport
    result = get_transport().send(payload)
    return result.ok, result.sap_ref, result.error_message


def process_pending(db: Session, max_batch: int = 10, max_retries: int = 3) -> dict:
    """Worker idempotente que procesa la cola sap_sync_log.

    Lee filas PENDING (limit ``max_batch``), llama transport, marca
    SENT/ERROR según resultado. Reintenta hasta ``max_retries`` veces.
    Retorna stats del batch para logging/monitoreo.
    """
    rows = db.query(SapSyncLogModel).filter(
        SapSyncLogModel.status == "PENDING",
        SapSyncLogModel.attempts < max_retries,
    ).order_by(SapSyncLogModel.created_at.asc()).limit(max_batch).all()

    stats = {"processed": 0, "sent": 0, "errors": 0, "dead_letter": 0}
    for row in rows:
        row.attempts = (row.attempts or 0) + 1
        ok, sap_ref, err = _transport_send(row.payload or {})
        if ok:
            row.status = "SENT"
            row.sap_ref = sap_ref
            row.last_error = None
            stats["sent"] += 1
        else:
            row.last_error = (err or "")[:1000]
            if row.attempts >= max_retries:
                row.status = "DEAD_LETTER"
                stats["dead_letter"] += 1
            else:
                stats["errors"] += 1  # queda PENDING, se reintenta
        row.updated_at = datetime.now()
        stats["processed"] += 1
    db.commit()
    return stats
