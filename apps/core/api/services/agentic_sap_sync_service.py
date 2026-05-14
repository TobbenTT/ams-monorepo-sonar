"""Agentic SAP sync health-check service.

Provides a single entry-point — `check_sync_health` — that inspects the
upload queue, equipment coverage, and recent activity to produce a
consolidated health report with actionable alerts.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.models import (
    HierarchyNodeModel,
    ManagedWorkOrderModel,
    SAPUploadPackageModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_STALE_THRESHOLD_HOURS = 48
_COVERAGE_WARNING_PCT = 80.0
_RECENT_SYNC_DAYS = 30
_STATUSES = ("GENERATED", "APPROVED", "UPLOADED", "FAILED")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_sync_health(db: Session, plant_id: str | None = None) -> dict:
    """Return a consolidated SAP-sync health report.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session.
    plant_id : str | None
        Optional plant code.  When provided the report is scoped to that
        plant; otherwise it covers the whole database.

    Returns
    -------
    dict
        Structured health report with queue status, pending package
        details, equipment coverage, recent activity, alerts, and an
        overall health verdict.
    """
    now = datetime.now()
    alerts: list[str] = []

    # -- 1. Upload queue status ------------------------------------------------
    queue_status = _count_queue_by_status(db, plant_id)

    # -- 2. Pending packages validation ----------------------------------------
    pending_packages = _inspect_pending_packages(db, plant_id, now)
    stale_count = sum(1 for p in pending_packages if p["is_stale"])
    incomplete_count = sum(1 for p in pending_packages if p["is_incomplete"])

    # -- 3. Equipment coverage -------------------------------------------------
    equipment_coverage = _equipment_coverage(db, plant_id)

    # -- 4. Recent sync activity -----------------------------------------------
    recent_activity = _recent_activity(db, plant_id, now)

    # -- 5. Build alerts -------------------------------------------------------
    if stale_count > 0:
        alerts.append(
            f"STALE_QUEUE: {stale_count} paquetes SAP pendientes por más de 48h"
        )
    if incomplete_count > 0:
        alerts.append(
            f"INCOMPLETE_DATA: {incomplete_count} paquetes con datos incompletos"
        )
    if equipment_coverage["coverage_pct"] < _COVERAGE_WARNING_PCT:
        alerts.append(
            f"LOW_COVERAGE: Solo {equipment_coverage['coverage_pct']:.1f}% "
            "de equipos sincronizados con SAP"
        )
    if recent_activity["uploads_last_30d"] == 0:
        alerts.append(
            "NO_RECENT_SYNC: Sin uploads a SAP en los últimos 30 días"
        )

    # -- 6. Overall health -----------------------------------------------------
    overall_health = _determine_health(alerts)

    return {
        "plant_id": plant_id or "ALL",
        "queue_status": queue_status,
        "pending_packages": pending_packages,
        "equipment_coverage": equipment_coverage,
        "recent_activity": recent_activity,
        "overall_health": overall_health,
        "alerts": alerts,
        "checked_at": now.isoformat(),
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _count_queue_by_status(db: Session, plant_id: str | None) -> dict:
    """Count SAPUploadPackageModel rows grouped by status."""
    query = db.query(
        SAPUploadPackageModel.status,
        func.count(SAPUploadPackageModel.package_id),
    )
    if plant_id:
        query = query.filter(SAPUploadPackageModel.plant_code == plant_id)
    query = query.group_by(SAPUploadPackageModel.status)

    counts = {s.lower(): 0 for s in _STATUSES}
    for status, cnt in query.all():
        key = status.lower()
        if key in counts:
            counts[key] = cnt
    return counts


def _inspect_pending_packages(
    db: Session, plant_id: str | None, now: datetime
) -> list[dict]:
    """Return details for every package still in GENERATED status."""
    query = db.query(SAPUploadPackageModel).filter(
        SAPUploadPackageModel.status == "GENERATED"
    )
    if plant_id:
        query = query.filter(SAPUploadPackageModel.plant_code == plant_id)

    result: list[dict] = []
    for pkg in query.all():
        age_hours = (now - pkg.generated_at).total_seconds() / 3600
        has_plan = bool(pkg.maintenance_plan)
        has_items = bool(pkg.maintenance_items) and len(pkg.maintenance_items) > 0
        has_tasks = bool(pkg.task_lists) and len(pkg.task_lists) > 0
        is_incomplete = not (has_plan and has_items and has_tasks)
        is_stale = age_hours > _STALE_THRESHOLD_HOURS

        result.append({
            "package_id": pkg.package_id,
            "plant_code": pkg.plant_code,
            "generated_at": pkg.generated_at.isoformat(),
            "age_hours": round(age_hours, 1),
            "has_plan": has_plan,
            "has_items": has_items,
            "has_tasks": has_tasks,
            "is_stale": is_stale,
            "is_incomplete": is_incomplete,
        })
    return result


def _equipment_coverage(db: Session, plant_id: str | None) -> dict:
    """Calculate how many EQUIPMENT nodes have a SAP functional location."""
    base = db.query(func.count(HierarchyNodeModel.node_id)).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT"
    )
    if plant_id:
        base = base.filter(HierarchyNodeModel.plant_id == plant_id)

    total = base.scalar() or 0

    synced_q = base.filter(
        HierarchyNodeModel.sap_func_loc.isnot(None),
        HierarchyNodeModel.sap_func_loc != "",
    )
    synced = synced_q.scalar() or 0

    coverage_pct = (synced / total * 100) if total > 0 else 0.0
    return {
        "total_equipment": total,
        "synced_to_sap": synced,
        "coverage_pct": round(coverage_pct, 1),
    }


def _recent_activity(
    db: Session, plant_id: str | None, now: datetime
) -> dict:
    """Count recent WOs and uploads."""
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # WOs created in last 7 / 30 days
    wo_base = db.query(func.count(ManagedWorkOrderModel.wo_id))
    if plant_id:
        wo_base = wo_base.filter(ManagedWorkOrderModel.plant_id == plant_id)

    wos_7d = (
        wo_base.filter(ManagedWorkOrderModel.created_at >= seven_days_ago).scalar() or 0
    )
    wos_30d = (
        wo_base.filter(ManagedWorkOrderModel.created_at >= thirty_days_ago).scalar() or 0
    )

    # SAP uploads in last 30 days
    upload_q = db.query(func.count(SAPUploadPackageModel.package_id)).filter(
        SAPUploadPackageModel.status == "UPLOADED",
        SAPUploadPackageModel.generated_at >= thirty_days_ago,
    )
    if plant_id:
        upload_q = upload_q.filter(SAPUploadPackageModel.plant_code == plant_id)
    uploads_30d = upload_q.scalar() or 0

    return {
        "wos_last_7d": wos_7d,
        "wos_last_30d": wos_30d,
        "uploads_last_30d": uploads_30d,
    }


def _determine_health(alerts: list[str]) -> str:
    """Derive overall health from the alert list.

    - CRITICAL: STALE_QUEUE or NO_RECENT_SYNC present (red).
    - WARNING : INCOMPLETE_DATA or LOW_COVERAGE present (yellow).
    - HEALTHY : No alerts.
    """
    red_prefixes = ("STALE_QUEUE", "NO_RECENT_SYNC")
    yellow_prefixes = ("INCOMPLETE_DATA", "LOW_COVERAGE")

    for alert in alerts:
        if any(alert.startswith(p) for p in red_prefixes):
            return "CRITICAL"
    for alert in alerts:
        if any(alert.startswith(p) for p in yellow_prefixes):
            return "WARNING"
    return "HEALTHY"
