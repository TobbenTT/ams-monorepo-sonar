"""Agentic Shutdown Optimizer Service — optimizes maintenance shutdown windows.

Groups shutdown-eligible backlog work, sequences by critical path priority,
and levels resources against available workforce capacity.
"""

import logging
from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel,
    ShutdownCalendarModel,
    WorkforceModel,
)
from tools.engines.backlog_grouper import BacklogEntry, BacklogGrouper

log = logging.getLogger(__name__)

PRIORITY_ORDER = {"P1": 0, "P2": 1, "P3": 2, "P4": 3}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def optimize_shutdown(
    db: Session,
    plant_id: str,
    shutdown_id: str | None = None,
) -> dict:
    """Optimize a maintenance shutdown window for *plant_id*.

    If *shutdown_id* is provided the specific shutdown is loaded; otherwise the
    next upcoming shutdown for the plant is selected automatically.

    Returns a dict with work-packages, resource plan, material readiness,
    stratification breakdown, and a human-readable summary.
    """

    # ------------------------------------------------------------------
    # Step 1 — Identify shutdown window
    # ------------------------------------------------------------------
    if shutdown_id:
        shutdown = (
            db.query(ShutdownCalendarModel)
            .filter(ShutdownCalendarModel.shutdown_id == shutdown_id)
            .first()
        )
    else:
        shutdown = (
            db.query(ShutdownCalendarModel)
            .filter(
                ShutdownCalendarModel.plant_id == plant_id,
                ShutdownCalendarModel.start_date >= date.today(),
            )
            .order_by(ShutdownCalendarModel.start_date.asc())
            .first()
        )

    if not shutdown:
        return {
            "shutdown": None,
            "work_packages": [],
            "resource_plan": {},
            "conflicts": [],
            "summary": "No upcoming shutdown found for this plant.",
        }

    shutdown_hours = (shutdown.end_date - shutdown.start_date).days * 24
    if shutdown_hours <= 0:
        shutdown_hours = 8  # minimum 8h for same-day shutdown

    # ------------------------------------------------------------------
    # Step 2 — Gather shutdown-eligible backlog items
    # ------------------------------------------------------------------
    backlog_items = (
        db.query(BacklogItemModel)
        .filter(
            BacklogItemModel.shutdown_required == True,  # noqa: E712
            BacklogItemModel.status.in_(
                ["READY", "AWAITING_APPROVAL", "AWAITING_MATERIALS"]
            ),
        )
        .all()
    )

    if not backlog_items:
        return {
            "shutdown": _shutdown_to_dict(shutdown),
            "work_packages": [],
            "resource_plan": {},
            "conflicts": [],
            "summary": "No shutdown-eligible backlog items found.",
        }

    # ------------------------------------------------------------------
    # Step 3 — Convert to BacklogEntry and group
    # ------------------------------------------------------------------
    entries = []
    for item in backlog_items:
        tag = item.equipment_tag or ""
        segments = tag.split("-")
        area_code = "-".join(segments[:2]) if len(segments) >= 2 else tag
        entries.append(
            BacklogEntry(
                backlog_id=item.backlog_id,
                equipment_id=item.equipment_id or "",
                equipment_tag=tag,
                area_code=area_code,
                priority=item.priority or "P3",
                specialties_required=item.specialties or ["MECANICO"],
                shutdown_required=True,
                materials_ready=item.materials_ready,
                estimated_hours=item.estimated_hours or 4.0,
            )
        )

    # Group by shutdown (filters for shutdown_required + materials_ready)
    groups = BacklogGrouper.group_by_shutdown(entries)

    # Stratification — defensive in case return type is unexpected
    try:
        stratification = BacklogGrouper.stratify(entries)
        if not isinstance(stratification, dict):
            stratification = {}
    except Exception:
        stratification = {}

    # ------------------------------------------------------------------
    # Step 4 — Sequence by priority (critical path approximation)
    # ------------------------------------------------------------------
    all_items_sorted = sorted(
        entries,
        key=lambda e: (PRIORITY_ORDER.get(e.priority, 9), -e.estimated_hours),
    )

    # Build work packages from groups + individual items
    work_packages: list[dict] = []
    grouped_ids: set[str] = set()

    for g in groups:
        for wp_item in g.items:
            grouped_ids.add(wp_item.backlog_id)
        work_packages.append(
            {
                "package_id": g.group_id,
                "name": g.name,
                "reason": g.reason,
                "items": [i.backlog_id for i in g.items],
                "equipment_tags": list({i.equipment_tag for i in g.items}),
                "total_hours": g.total_hours,
                "specialties": list(g.specialties),
                "materials_ready": all(i.materials_ready for i in g.items),
                "priority": min(
                    (i.priority for i in g.items),
                    key=lambda p: PRIORITY_ORDER.get(p, 9),
                ),
            }
        )

    # Add ungrouped items as individual packages
    for item in all_items_sorted:
        if item.backlog_id not in grouped_ids:
            work_packages.append(
                {
                    "package_id": f"WP-{item.backlog_id}",
                    "name": f"{item.equipment_tag} — individual",
                    "reason": "ungrouped",
                    "items": [item.backlog_id],
                    "equipment_tags": [item.equipment_tag],
                    "total_hours": item.estimated_hours,
                    "specialties": item.specialties_required,
                    "materials_ready": item.materials_ready,
                    "priority": item.priority,
                }
            )

    # ------------------------------------------------------------------
    # Step 5 — Resource leveling
    # ------------------------------------------------------------------
    workforce = (
        db.query(WorkforceModel)
        .filter(
            WorkforceModel.plant_id == plant_id,
            WorkforceModel.available == True,  # noqa: E712
        )
        .all()
    )

    capacity_by_specialty: dict[str, int] = defaultdict(int)
    for w in workforce:
        capacity_by_specialty[w.specialty] += 1

    shutdown_days = max((shutdown.end_date - shutdown.start_date).days, 1)

    trade_capacities = []
    for spec, count in capacity_by_specialty.items():
        trade_capacities.append(
            {
                "specialty": spec,
                "headcount": count,
                "hours_per_person": 12.0,  # extended shift during shutdown
                "total_hours": count * 12.0 * shutdown_days,
            }
        )

    total_demand = sum(wp["total_hours"] for wp in work_packages)
    total_capacity = sum(tc["total_hours"] for tc in trade_capacities)
    utilization_pct = (total_demand / total_capacity * 100) if total_capacity > 0 else 0

    # Detect overloads by specialty
    demand_by_specialty: dict[str, float] = defaultdict(float)
    for wp in work_packages:
        for spec in wp["specialties"]:
            demand_by_specialty[spec] += wp["total_hours"] / max(
                len(wp["specialties"]), 1
            )

    overloads = []
    for spec, demand in demand_by_specialty.items():
        cap = next(
            (tc["total_hours"] for tc in trade_capacities if tc["specialty"] == spec),
            0,
        )
        if cap > 0 and demand / cap > 1.0:
            overloads.append(
                {
                    "specialty": spec,
                    "demand_hours": round(demand, 1),
                    "capacity_hours": round(cap, 1),
                    "utilization_pct": round(demand / cap * 100, 1),
                }
            )

    # ------------------------------------------------------------------
    # Step 6 — Material validation
    # ------------------------------------------------------------------
    materials_ready_count = sum(1 for wp in work_packages if wp["materials_ready"])
    materials_not_ready = [wp for wp in work_packages if not wp["materials_ready"]]

    # ------------------------------------------------------------------
    # Return
    # ------------------------------------------------------------------
    return {
        "shutdown": _shutdown_to_dict(shutdown),
        "shutdown_duration_days": shutdown_days,
        "shutdown_hours": shutdown_hours,
        "work_packages": work_packages,
        "work_packages_count": len(work_packages),
        "total_hours": round(total_demand, 1),
        "resource_plan": {
            "trade_capacities": trade_capacities,
            "total_capacity_hours": round(total_capacity, 1),
            "utilization_pct": round(utilization_pct, 1),
            "overloads": overloads,
            "workforce_count": len(workforce),
        },
        "materials": {
            "ready": materials_ready_count,
            "not_ready": len(materials_not_ready),
            "not_ready_packages": [
                {"package_id": wp["package_id"], "name": wp["name"]}
                for wp in materials_not_ready
            ],
        },
        "stratification": stratification,
        "summary": (
            f"Shutdown {shutdown.shutdown_type} ({shutdown_days}d): "
            f"{len(work_packages)} work packages, "
            f"{round(total_demand, 1)}h demand vs "
            f"{round(total_capacity, 1)}h capacity "
            f"({round(utilization_pct, 1)}% util). "
            f"{len(overloads)} specialty overloads. "
            f"{len(materials_not_ready)} packages awaiting materials."
        ),
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _shutdown_to_dict(s: ShutdownCalendarModel) -> dict:
    """Serialize a ShutdownCalendarModel to a plain dict."""
    return {
        "shutdown_id": s.shutdown_id,
        "plant_id": s.plant_id,
        "start_date": s.start_date.isoformat() if s.start_date else None,
        "end_date": s.end_date.isoformat() if s.end_date else None,
        "shutdown_type": s.shutdown_type,
        "areas": s.areas,
        "description": s.description,
    }
