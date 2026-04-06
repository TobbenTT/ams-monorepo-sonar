"""Agentic material-readiness service — checks material availability for backlog items."""

import logging

from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel,
    InventoryItemModel,
    ManagedWorkOrderModel,
    WorkRequestModel,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_material_code(mat: dict) -> str | None:
    """Return material code from a material dict, checking both key variants."""
    return mat.get("material_code") or mat.get("code")


def _gather_materials(db: Session, item: BacklogItemModel) -> list[dict]:
    """Collect materials from work request spare_parts or work order materials."""
    if not item.work_request_id:
        return []

    # Try work request spare_parts first
    wr = (
        db.query(WorkRequestModel)
        .filter(WorkRequestModel.request_id == item.work_request_id)
        .first()
    )
    if wr and wr.spare_parts:
        return list(wr.spare_parts)

    # Fall back to managed work order materials
    wo = (
        db.query(ManagedWorkOrderModel)
        .filter(ManagedWorkOrderModel.work_request_id == item.work_request_id)
        .first()
    )
    if wo and wo.materials:
        return list(wo.materials)

    return []


def _check_material(db: Session, mat: dict) -> dict:
    """Check a single material against inventory and return status dict."""
    code = _extract_material_code(mat)
    qty_required = mat.get("qty_required", 1)
    reserved = mat.get("reserved", False)

    inv = None
    if code:
        inv = (
            db.query(InventoryItemModel)
            .filter(InventoryItemModel.material_code == code)
            .first()
        )

    qty_available = inv.quantity_available if inv else 0
    qty_on_hand = inv.quantity_on_hand if inv else 0

    # Determine status
    if reserved or qty_available >= qty_required:
        status = "ok"
    elif qty_available > 0:
        status = "partial"
    else:
        status = "missing"

    return {
        "material_code": code or "",
        "description": mat.get("description", ""),
        "qty_required": qty_required,
        "qty_available": qty_available,
        "qty_on_hand": qty_on_hand,
        "reserved": reserved,
        "status": status,
        "lead_time_days": None,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_item_materials(db: Session, backlog_id: str, plant_id: str) -> dict:
    """Check material availability for a single backlog item.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    backlog_id : str
        Primary key of the backlog item.
    plant_id : str
        Plant identifier (used for context / future filtering).

    Returns
    -------
    dict
        Material readiness summary with per-material details.
    """
    item = (
        db.query(BacklogItemModel)
        .filter(BacklogItemModel.backlog_id == backlog_id)
        .first()
    )
    if not item:
        return {"error": "Backlog item not found", "backlog_id": backlog_id}

    # Gather materials from linked work request / work order
    materials = _gather_materials(db, item)
    if not materials:
        return {
            "backlog_id": backlog_id,
            "equipment_tag": item.equipment_tag,
            "materials_status": "no_materials_defined",
            "total_materials": 0,
            "confirmed": 0,
            "pending": 0,
            "unavailable": 0,
            "details": [],
            "materials_ready": True,
        }

    # Check each material against inventory
    details = [_check_material(db, mat) for mat in materials]

    confirmed = sum(1 for m in details if m["status"] == "ok")
    pending = sum(1 for m in details if m["status"] == "partial")
    unavailable = sum(1 for m in details if m["status"] == "missing")
    all_ready = unavailable == 0 and pending == 0

    # Update backlog item
    item.materials_ready = all_ready
    if not all_ready and not item.blocking_reason:
        item.blocking_reason = "AWAITING_MATERIALS"
    elif all_ready and item.blocking_reason == "AWAITING_MATERIALS":
        item.blocking_reason = None
    db.commit()

    if all_ready:
        overall_status = "ready"
    elif pending > 0:
        overall_status = "partial"
    else:
        overall_status = "missing"

    return {
        "backlog_id": backlog_id,
        "equipment_tag": item.equipment_tag,
        "materials_status": overall_status,
        "total_materials": len(details),
        "confirmed": confirmed,
        "pending": pending,
        "unavailable": unavailable,
        "details": details,
        "materials_ready": all_ready,
    }


def check_batch_materials(db: Session, plant_id: str) -> dict:
    """Check material readiness for all eligible backlog items in a plant.

    Queries backlog items with status READY, AWAITING_MATERIALS, or
    AWAITING_APPROVAL and checks materials for each.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    plant_id : str
        Plant identifier for scoping the batch.

    Returns
    -------
    dict
        Aggregate material readiness across all matching backlog items.
    """
    eligible_statuses = ("READY", "AWAITING_MATERIALS", "AWAITING_APPROVAL")

    items = (
        db.query(BacklogItemModel)
        .filter(BacklogItemModel.status.in_(eligible_statuses))
        .all()
    )

    results = []
    for item in items:
        result = check_item_materials(db, item.backlog_id, plant_id)
        results.append(result)

    ready = sum(1 for r in results if r.get("materials_status") == "ready" or r.get("materials_status") == "no_materials_defined")
    partial = sum(1 for r in results if r.get("materials_status") == "partial")
    missing = sum(1 for r in results if r.get("materials_status") == "missing")

    return {
        "total_items": len(results),
        "ready": ready,
        "partial": partial,
        "missing": missing,
        "items": results,
    }
