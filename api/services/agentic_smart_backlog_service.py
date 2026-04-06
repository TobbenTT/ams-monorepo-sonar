"""Smart Backlog service — intelligent multi-criteria backlog prioritization."""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import (
    BacklogItemModel,
    CriticalityAssessmentModel,
    HealthScoreModel,
    HierarchyNodeModel,
    ManagedWorkOrderModel,
    WorkRequestModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SLA_HOURS_MAP = {
    "P1": 24, "P2": 168, "P3": 720, "P4": 2160,
    "1_EMERGENCY": 24, "1_CRITICAL": 24,
    "2_URGENT": 168, "2_HIGH": 168,
    "3_NORMAL": 720, "4_LOW": 2160,
}

CRITICALITY_SCORES = {
    "AA": 1.0, "A": 0.9, "CRITICAL": 1.0,
    "AB": 0.7, "B": 0.6, "HIGH": 0.7,
    "BA": 0.5, "C": 0.4, "MEDIUM": 0.5,
    "BB": 0.3, "D": 0.2, "LOW": 0.3,
    "MINIMAL": 0.1,
}

WEIGHTS = {
    "criticality": 0.25,
    "health_score": 0.20,
    "sla_proximity": 0.20,
    "failure_frequency": 0.15,
    "cost_of_deferral": 0.10,
    "safety_impact": 0.10,
}

_ACTIVE_STATUSES = ("READY", "AWAITING_APPROVAL")
_CORRECTIVE_TYPES = ("PM03", "CORRECTIVO")
_FAILURE_LOOKBACK_DAYS = 365
_SLA_BREACH_THRESHOLD = 0.20
_AGING_THRESHOLD_DAYS = 30
_CHRONIC_FAILURE_THRESHOLD = 3


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def prioritize_backlog(db: Session, plant_id: str | None = None) -> dict:
    """Score and rank the active backlog using multi-criteria weights.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    plant_id : str, optional
        Reserved for future plant-level filtering.

    Returns
    -------
    dict
        ranked_items, sla_alerts, grouping_suggestions, and stats.
    """

    # -- 1. Load active backlog items ------------------------------------
    items = (
        db.query(BacklogItemModel)
        .filter(BacklogItemModel.status.in_(_ACTIVE_STATUSES))
        .all()
    )

    if not items:
        log.info("Smart backlog: no active items found.")
        return _empty_result()

    log.info("Smart backlog: scoring %d active items.", len(items))

    # -- 2. Bulk-load enrichment data ------------------------------------
    equipment_tags = list({i.equipment_tag for i in items if i.equipment_tag})
    wr_ids = list({i.work_request_id for i in items if i.work_request_id})

    tag_to_node = _build_tag_to_node(db, equipment_tags)
    node_ids = [n.node_id for n in tag_to_node.values()]
    node_to_criticality = _build_node_to_criticality(db, node_ids)
    tag_to_health = _build_tag_to_health(db, equipment_tags)
    wr_id_to_wr = _build_wr_lookup(db, wr_ids)
    tag_to_failure_count = _build_failure_counts(db, equipment_tags)

    # -- 3. Score each item ----------------------------------------------
    now = datetime.now()
    ranked_items: list[dict] = []

    for item in items:
        age_days = max(0, (now - item.created_at).days) if item.created_at else 0
        tag = item.equipment_tag or ""

        # Criticality
        node = tag_to_node.get(tag)
        crit_assessment = node_to_criticality.get(node.node_id) if node else None
        crit_label = _resolve_criticality_label(node, crit_assessment)
        s_crit = CRITICALITY_SCORES.get(crit_label.upper(), 0.4) if crit_label else 0.4

        # Health
        health = tag_to_health.get(tag)
        composite = health.composite_score if health else None
        s_health = (100 - composite) / 100.0 if composite is not None else 0.5

        # SLA proximity
        sla_remaining = _calc_sla_remaining(item, wr_id_to_wr, now)
        sla_total = SLA_HOURS_MAP.get(item.priority, 720)
        if sla_remaining is not None:
            s_sla = max(0.0, min(1.0, 1.0 - (sla_remaining / sla_total)))
        else:
            s_sla = 0.5

        # Failure frequency
        failure_count = tag_to_failure_count.get(tag, 0)
        s_freq = min(1.0, failure_count / 10.0)

        # Cost of deferral
        est_hours = item.estimated_hours or 0.0
        s_cost = min(1.0, est_hours / 40.0)

        # Safety (no FMEA consequence data at backlog level)
        s_safety = 0.3

        total_score = round(
            (
                WEIGHTS["criticality"] * s_crit
                + WEIGHTS["health_score"] * s_health
                + WEIGHTS["sla_proximity"] * s_sla
                + WEIGHTS["failure_frequency"] * s_freq
                + WEIGHTS["cost_of_deferral"] * s_cost
                + WEIGHTS["safety_impact"] * s_safety
            )
            * 100,
            2,
        )

        # Alerts
        alerts: list[str] = []
        if sla_remaining is not None and sla_remaining < sla_total * _SLA_BREACH_THRESHOLD:
            alerts.append("SLA_BREACH_RISK")
        if age_days > _AGING_THRESHOLD_DAYS:
            alerts.append("AGING")
        if failure_count >= _CHRONIC_FAILURE_THRESHOLD:
            alerts.append("CHRONIC_EQUIPMENT")

        ranked_items.append(
            {
                "backlog_id": item.backlog_id,
                "equipment_tag": tag,
                "priority": item.priority,
                "wo_type": item.wo_type,
                "estimated_hours": est_hours,
                "age_days": age_days,
                "materials_ready": item.materials_ready,
                "total_score": total_score,
                "criticality_class": crit_label or "UNKNOWN",
                "health_score": composite if composite is not None else -1.0,
                "failure_count_12m": failure_count,
                "sla_remaining_hours": round(sla_remaining, 1) if sla_remaining is not None else None,
                "alerts": alerts,
            }
        )

    # Sort by score descending
    ranked_items.sort(key=lambda r: r["total_score"], reverse=True)

    # -- 4. SLA alerts subset --------------------------------------------
    sla_alerts = [r for r in ranked_items if "SLA_BREACH_RISK" in r["alerts"]]

    # -- 5. Grouping suggestions -----------------------------------------
    grouping_suggestions = _try_grouping(items)

    # -- 6. Statistics ---------------------------------------------------
    stats = _build_stats(ranked_items)

    return {
        "ranked_items": ranked_items,
        "sla_alerts": sla_alerts,
        "grouping_suggestions": grouping_suggestions,
        "stats": stats,
    }


# ---------------------------------------------------------------------------
# Bulk query helpers
# ---------------------------------------------------------------------------

def _build_tag_to_node(
    db: Session, tags: list[str]
) -> dict[str, HierarchyNodeModel]:
    if not tags:
        return {}
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.tag.in_(tags)
    ).all()
    return {n.tag: n for n in nodes}


def _build_node_to_criticality(
    db: Session, node_ids: list[str]
) -> dict[str, CriticalityAssessmentModel]:
    if not node_ids:
        return {}
    rows = db.query(CriticalityAssessmentModel).filter(
        CriticalityAssessmentModel.node_id.in_(node_ids)
    ).all()
    return {r.node_id: r for r in rows}


def _build_tag_to_health(
    db: Session, tags: list[str]
) -> dict[str, HealthScoreModel]:
    if not tags:
        return {}
    rows = db.query(HealthScoreModel).filter(
        HealthScoreModel.equipment_tag.in_(tags)
    ).all()
    # Keep latest per tag (in case of multiple records)
    result: dict[str, HealthScoreModel] = {}
    for r in rows:
        existing = result.get(r.equipment_tag)
        if existing is None or (
            hasattr(r, "calculated_at")
            and hasattr(existing, "calculated_at")
            and r.calculated_at
            and existing.calculated_at
            and r.calculated_at > existing.calculated_at
        ):
            result[r.equipment_tag] = r
    return result


def _build_wr_lookup(
    db: Session, wr_ids: list[str]
) -> dict[str, WorkRequestModel]:
    if not wr_ids:
        return {}
    rows = db.query(WorkRequestModel).filter(
        WorkRequestModel.request_id.in_(wr_ids)
    ).all()
    return {r.request_id: r for r in rows}


def _build_failure_counts(
    db: Session, tags: list[str]
) -> dict[str, int]:
    """Count corrective WOs closed in the last 12 months per equipment tag."""
    if not tags:
        return {}
    cutoff = datetime.now() - timedelta(days=_FAILURE_LOOKBACK_DAYS)
    rows = (
        db.query(
            ManagedWorkOrderModel.equipment_tag,
            func.count(ManagedWorkOrderModel.equipment_tag),
        )
        .filter(
            ManagedWorkOrderModel.equipment_tag.in_(tags),
            ManagedWorkOrderModel.status == "CERRADO",
            ManagedWorkOrderModel.wo_type.in_(_CORRECTIVE_TYPES),
            ManagedWorkOrderModel.created_at >= cutoff,
        )
        .group_by(ManagedWorkOrderModel.equipment_tag)
        .all()
    )
    return {tag: count for tag, count in rows}


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _resolve_criticality_label(
    node: HierarchyNodeModel | None,
    assessment: CriticalityAssessmentModel | None,
) -> str | None:
    """Return the best available criticality label."""
    if assessment:
        return assessment.risk_class
    if node and getattr(node, "criticality", None):
        return node.criticality
    return None


def _calc_sla_remaining(
    item: BacklogItemModel,
    wr_lookup: dict[str, WorkRequestModel],
    now: datetime,
) -> float | None:
    """Calculate remaining SLA hours, or None if no deadline is available."""
    wr = wr_lookup.get(item.work_request_id) if item.work_request_id else None
    if wr and getattr(wr, "sla_deadline", None):
        delta = wr.sla_deadline - now
        return max(0.0, delta.total_seconds() / 3600.0)

    # Fallback: estimate from priority + creation date
    if item.priority and item.created_at:
        total = SLA_HOURS_MAP.get(item.priority)
        if total:
            elapsed = (now - item.created_at).total_seconds() / 3600.0
            return max(0.0, total - elapsed)

    return None


# ---------------------------------------------------------------------------
# Grouping
# ---------------------------------------------------------------------------

def _try_grouping(items: list[BacklogItemModel]) -> list[dict]:
    """Attempt to produce grouping suggestions via BacklogGrouper.

    Returns an empty list if the grouper module is unavailable.
    """
    try:
        from tools.engines.backlog_grouper import BacklogGrouper, BacklogEntry
    except ImportError:
        log.debug("BacklogGrouper not available; skipping grouping.")
        return []

    entries = []
    for item in items:
        tag = item.equipment_tag or ""
        segments = tag.split("-")
        area_code = "-".join(segments[:2]) if len(segments) >= 2 else tag

        entries.append(
            BacklogEntry(
                backlog_id=item.backlog_id,
                equipment_id=item.equipment_id or "",
                equipment_tag=tag,
                area_code=area_code,
                priority=item.priority or "3_NORMAL",
                specialties_required=item.specialties or ["MECHANICAL"],
                shutdown_required=item.shutdown_required or False,
                materials_ready=item.materials_ready if item.materials_ready is not None else True,
                estimated_hours=item.estimated_hours or 0.0,
            )
        )

    if not entries:
        return []

    try:
        groups = BacklogGrouper.find_all_groups(entries)
    except Exception:
        log.exception("BacklogGrouper.find_all_groups failed.")
        return []

    return [
        {
            "group_id": g.group_id,
            "name": g.name,
            "reason": g.reason,
            "item_count": len(g.items),
            "total_hours": g.total_hours,
            "specialties": list(g.specialties) if g.specialties else [],
            "requires_shutdown": g.requires_shutdown,
            "backlog_ids": [e.backlog_id for e in g.items],
        }
        for g in groups
    ]


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------

def _build_stats(ranked_items: list[dict]) -> dict:
    """Compute summary statistics from the scored items."""
    total = len(ranked_items)
    if total == 0:
        return {
            "total": 0,
            "by_priority": {"critical": 0, "high": 0, "normal": 0, "low": 0},
            "avg_age_days": 0.0,
            "total_estimated_hours": 0.0,
        }

    by_priority = {"critical": 0, "high": 0, "normal": 0, "low": 0}
    for r in ranked_items:
        p = (r.get("priority") or "").upper()
        if "EMERGENCY" in p or "CRITICAL" in p or p.startswith("1"):
            by_priority["critical"] += 1
        elif "URGENT" in p or "HIGH" in p or p.startswith("2"):
            by_priority["high"] += 1
        elif "LOW" in p or p.startswith("4"):
            by_priority["low"] += 1
        else:
            by_priority["normal"] += 1

    avg_age = round(sum(r["age_days"] for r in ranked_items) / total, 1)
    total_hours = round(sum(r["estimated_hours"] for r in ranked_items), 1)

    return {
        "total": total,
        "by_priority": by_priority,
        "avg_age_days": avg_age,
        "total_estimated_hours": total_hours,
    }


# ---------------------------------------------------------------------------
# Empty result helper
# ---------------------------------------------------------------------------

def _empty_result() -> dict:
    return {
        "ranked_items": [],
        "sla_alerts": [],
        "grouping_suggestions": [],
        "stats": {
            "total": 0,
            "by_priority": {"critical": 0, "high": 0, "normal": 0, "low": 0},
            "avg_age_days": 0.0,
            "total_estimated_hours": 0.0,
        },
    }
