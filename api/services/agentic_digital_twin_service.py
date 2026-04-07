"""Agentic Digital Twin + Energy Monitor service.

Provides plant-wide health visualization data and energy consumption
tracking.  All logic is deterministic — no LLM calls.

Digital Twin (``get_plant_digital_twin``):
  - Builds a hierarchy-based equipment map with live health scores.
  - Aggregates area-level health from child equipment.
  - Surfaces unacknowledged alerts and active work-order / backlog counts.

Energy Dashboard (``get_energy_dashboard``):
  - Since no PI historian / SCADA integration exists yet, derives
    energy-proxy metrics from work orders on electrical equipment
    (motors, transformers, generators).
  - Flags degraded electrical equipment as potential energy wasters.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.models import (
    HierarchyNodeModel,
    HealthScoreModel,
    ManagedWorkOrderModel,
    BacklogItemModel,
    NotificationModel,
)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_ELECTRICAL_KEYWORDS = ("ELECTRICO", "ELECTRICA", "ELECTRICAL")
_MOTOR_KEYWORDS = ("MOTOR", "BOMBA", "COMPRESOR", "VENTILADOR", "SOPLADOR")
_TRANSFORMER_KEYWORDS = ("TRANSFORMADOR", "TRANSFORMER", "GENERADOR", "GENERATOR")
_ENERGY_TAG_KEYWORDS = _MOTOR_KEYWORDS + _TRANSFORMER_KEYWORDS

_HEALTH_CLASSES = ("HEALTHY", "AT_RISK", "CRITICAL", "UNKNOWN")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _classify_area_health(avg_score: float | None) -> str:
    """Return a health class string from an average composite score."""
    if avg_score is None:
        return "UNKNOWN"
    if avg_score >= 70:
        return "HEALTHY"
    if avg_score >= 40:
        return "AT_RISK"
    return "CRITICAL"


def _notification_to_dict(n: NotificationModel) -> dict:
    return {
        "notification_id": n.notification_id,
        "notification_type": n.notification_type,
        "level": n.level,
        "equipment_id": n.equipment_id,
        "title": n.title,
        "message": n.message,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def _latest_health_by_node(db: Session, node_ids: list[str]) -> dict[str, HealthScoreModel]:
    """Return a mapping node_id -> latest HealthScoreModel for given node ids."""
    if not node_ids:
        return {}

    # Sub-query: max calculated_at per node_id
    sub = (
        db.query(
            HealthScoreModel.node_id,
            func.max(HealthScoreModel.calculated_at).label("max_calc"),
        )
        .filter(HealthScoreModel.node_id.in_(node_ids))
        .group_by(HealthScoreModel.node_id)
        .subquery()
    )

    rows = (
        db.query(HealthScoreModel)
        .join(
            sub,
            (HealthScoreModel.node_id == sub.c.node_id)
            & (HealthScoreModel.calculated_at == sub.c.max_calc),
        )
        .all()
    )

    return {r.node_id: r for r in rows}


def _is_energy_related_tag(tag: str | None, name: str | None) -> bool:
    """Check if an equipment tag or name suggests electrical / motor equipment."""
    combined = ((tag or "") + " " + (name or "")).upper()
    return any(kw in combined for kw in _ENERGY_TAG_KEYWORDS)


# ---------------------------------------------------------------------------
# Digital Twin
# ---------------------------------------------------------------------------

def get_plant_digital_twin(
    db: Session,
    plant_id: str = "OCP-JFC1",
) -> dict:
    """Build a plant-wide digital-twin snapshot with health overlays.

    Returns hierarchy, area aggregates, equipment map, active alerts,
    and health distribution — all from current DB state.
    """
    log.info("Building digital twin for plant %s", plant_id)

    # Step 1 — hierarchy nodes
    all_nodes: list[HierarchyNodeModel] = (
        db.query(HierarchyNodeModel)
        .filter(HierarchyNodeModel.plant_id == plant_id)
        .all()
    )

    nodes_by_id: dict[str, HierarchyNodeModel] = {n.node_id: n for n in all_nodes}
    equipment_nodes = [n for n in all_nodes if n.node_type == "EQUIPMENT"]
    area_nodes = [n for n in all_nodes if n.node_type == "AREA"]

    equip_ids = [n.node_id for n in equipment_nodes]

    # Step 2 — latest health scores per equipment
    health_map = _latest_health_by_node(db, equip_ids)

    # Pre-compute active WO counts and backlog counts per equipment_tag
    equip_tags = [n.tag for n in equipment_nodes if n.tag]

    active_wo_statuses = ("CREADO", "PLANIFICADO", "PROGRAMADO", "EN_EJECUCION")
    wo_counts: dict[str, int] = {}
    if equip_tags:
        wo_rows = (
            db.query(
                ManagedWorkOrderModel.equipment_tag,
                func.count(ManagedWorkOrderModel.wo_id),
            )
            .filter(
                ManagedWorkOrderModel.plant_id == plant_id,
                ManagedWorkOrderModel.status.in_(active_wo_statuses),
                ManagedWorkOrderModel.equipment_tag.in_(equip_tags),
            )
            .group_by(ManagedWorkOrderModel.equipment_tag)
            .all()
        )
        wo_counts = {tag: cnt for tag, cnt in wo_rows}

    backlog_counts: dict[str, int] = {}
    if equip_tags:
        bl_rows = (
            db.query(
                BacklogItemModel.equipment_tag,
                func.count(BacklogItemModel.backlog_id),
            )
            .filter(
                BacklogItemModel.equipment_tag.in_(equip_tags),
                BacklogItemModel.status != "COMPLETED",
            )
            .group_by(BacklogItemModel.equipment_tag)
            .all()
        )
        backlog_counts = {tag: cnt for tag, cnt in bl_rows}

    # Step 3 — area-level aggregates
    # Build parent_node_id -> area mapping for equipment
    def _find_area(node: HierarchyNodeModel) -> HierarchyNodeModel | None:
        """Walk up the tree to find the closest AREA ancestor."""
        visited: set[str] = set()
        current = node
        while current:
            if current.node_id in visited:
                break
            visited.add(current.node_id)
            if current.node_type == "AREA":
                return current
            if current.parent_node_id and current.parent_node_id in nodes_by_id:
                current = nodes_by_id[current.parent_node_id]
            else:
                break
        return None

    area_equipment: dict[str, list[HierarchyNodeModel]] = {a.node_id: [] for a in area_nodes}
    for eq in equipment_nodes:
        area = _find_area(eq)
        if area and area.node_id in area_equipment:
            area_equipment[area.node_id].append(eq)

    # Step 4 — active alerts
    active_alerts_rows: list[NotificationModel] = (
        db.query(NotificationModel)
        .filter(
            NotificationModel.plant_id == plant_id,
            NotificationModel.acknowledged == False,  # noqa: E712
        )
        .order_by(NotificationModel.created_at.desc())
        .limit(100)
        .all()
    )
    active_alerts = [_notification_to_dict(a) for a in active_alerts_rows]

    # Alert counts per equipment_id for area aggregation
    alert_equip_ids: dict[str, int] = {}
    for a in active_alerts_rows:
        if a.equipment_id:
            alert_equip_ids[a.equipment_id] = alert_equip_ids.get(a.equipment_id, 0) + 1

    # Build area summaries
    areas: list[dict] = []
    for area_node in area_nodes:
        eqs = area_equipment.get(area_node.node_id, [])
        scores = [
            health_map[eq.node_id].composite_score
            for eq in eqs
            if eq.node_id in health_map
        ]
        avg = round(sum(scores) / len(scores), 1) if scores else None

        # worst equipment in area
        worst: dict | None = None
        if scores:
            worst_eq = min(
                (eq for eq in eqs if eq.node_id in health_map),
                key=lambda e: health_map[e.node_id].composite_score,
                default=None,
            )
            if worst_eq:
                hs = health_map[worst_eq.node_id]
                worst = {
                    "node_id": worst_eq.node_id,
                    "tag": worst_eq.tag,
                    "name": worst_eq.name,
                    "health_score": hs.composite_score,
                    "health_class": hs.health_class,
                }

        area_alert_count = sum(
            alert_equip_ids.get(eq.tag or eq.node_id, 0) for eq in eqs
        )

        areas.append({
            "area_id": area_node.node_id,
            "area_name": area_node.name,
            "equipment_count": len(eqs),
            "avg_health_score": avg,
            "health_class": _classify_area_health(avg),
            "worst_equipment": worst,
            "active_alerts": area_alert_count,
        })

    # Step 5 — equipment map with GPS
    equipment_map: list[dict] = []
    health_dist = {"HEALTHY": 0, "AT_RISK": 0, "CRITICAL": 0, "UNKNOWN": 0}

    for eq in equipment_nodes:
        hs = health_map.get(eq.node_id)
        h_class = hs.health_class if hs else "UNKNOWN"
        health_dist[h_class] = health_dist.get(h_class, 0) + 1

        area = _find_area(eq)
        equipment_map.append({
            "node_id": eq.node_id,
            "tag": eq.tag,
            "name": eq.name,
            "area": area.name if area else None,
            "criticality": eq.criticality,
            "health_score": hs.composite_score if hs else None,
            "health_class": h_class,
            "trend": hs.trend if hs else None,
            "gps_lat": eq.gps_lat,
            "gps_lon": eq.gps_lon,
            "active_wo_count": wo_counts.get(eq.tag or "", 0),
            "backlog_count": backlog_counts.get(eq.tag or "", 0),
        })

    # Plant overview
    scored_values = [
        health_map[eid].composite_score
        for eid in equip_ids
        if eid in health_map
    ]
    avg_health = round(sum(scored_values) / len(scored_values), 1) if scored_values else 0.0

    result = {
        "plant_id": plant_id,
        "generated_at": datetime.now().isoformat(),
        "plant_overview": {
            "total_equipment": len(equipment_nodes),
            "healthy": health_dist.get("HEALTHY", 0),
            "at_risk": health_dist.get("AT_RISK", 0),
            "critical": health_dist.get("CRITICAL", 0),
            "unknown": health_dist.get("UNKNOWN", 0),
            "avg_health_score": avg_health,
        },
        "areas": areas,
        "equipment_map": equipment_map,
        "active_alerts": active_alerts,
        "health_distribution": health_dist,
    }

    log.info(
        "Digital twin built: %d equipment, %d areas, %d alerts",
        len(equipment_nodes), len(areas), len(active_alerts),
    )
    return result


# ---------------------------------------------------------------------------
# Energy Dashboard
# ---------------------------------------------------------------------------

def get_energy_dashboard(
    db: Session,
    plant_id: str = "OCP-JFC1",
    days: int = 30,
) -> dict:
    """Return energy-proxy metrics derived from work orders and health scores.

    Since there is no PI historian integration yet, we approximate energy
    impact by looking at electrical-equipment work orders and health.
    """
    log.info("Building energy dashboard for plant %s (last %d days)", plant_id, days)

    cutoff = datetime.now() - timedelta(days=days)

    # Step 1 — electrical WOs in the period
    period_wos: list[ManagedWorkOrderModel] = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.plant_id == plant_id,
            ManagedWorkOrderModel.created_at >= cutoff,
        )
        .all()
    )

    electrical_wos: list[ManagedWorkOrderModel] = []
    motor_failures: list[ManagedWorkOrderModel] = []

    for wo in period_wos:
        wo_type_upper = (wo.wo_type or "").upper()
        tag_upper = (wo.equipment_tag or "").upper()
        desc_upper = (wo.description or "").upper()
        combined = f"{wo_type_upper} {tag_upper} {desc_upper}"

        is_electrical = any(kw in combined for kw in _ELECTRICAL_KEYWORDS)
        is_energy_equip = any(kw in combined for kw in _ENERGY_TAG_KEYWORDS)

        if is_electrical or is_energy_equip:
            electrical_wos.append(wo)
            if any(kw in combined for kw in _MOTOR_KEYWORDS):
                motor_failures.append(wo)

    # Step 2 — compute proxy metrics
    total_hours = sum(wo.actual_hours or wo.estimated_hours or 0.0 for wo in electrical_wos)
    total_cost = sum(wo.actual_total_cost or wo.budget_amount or 0.0 for wo in electrical_wos)

    # Trend: compare first half vs second half of electrical WOs by created_at
    midpoint = cutoff + timedelta(days=days / 2)
    first_half = sum(1 for wo in electrical_wos if wo.created_at and wo.created_at < midpoint)
    second_half = len(electrical_wos) - first_half

    if second_half > first_half * 1.2:
        trend = "INCREASING"
    elif first_half > second_half * 1.2:
        trend = "DECREASING"
    else:
        trend = "STABLE"

    # Step 3 — electrical equipment from hierarchy + health
    all_equip: list[HierarchyNodeModel] = (
        db.query(HierarchyNodeModel)
        .filter(
            HierarchyNodeModel.plant_id == plant_id,
            HierarchyNodeModel.node_type == "EQUIPMENT",
        )
        .all()
    )

    elec_equip = [e for e in all_equip if _is_energy_related_tag(e.tag, e.name)]
    elec_ids = [e.node_id for e in elec_equip]
    elec_health = _latest_health_by_node(db, elec_ids)

    elec_healthy = 0
    elec_at_risk = 0
    elec_critical = 0
    at_risk_list: list[dict] = []

    for eq in elec_equip:
        hs = elec_health.get(eq.node_id)
        if not hs:
            continue
        if hs.health_class == "HEALTHY":
            elec_healthy += 1
        elif hs.health_class == "AT_RISK":
            elec_at_risk += 1
            at_risk_list.append({
                "node_id": eq.node_id,
                "tag": eq.tag,
                "name": eq.name,
                "health_score": hs.composite_score,
                "health_class": hs.health_class,
                "trend": hs.trend,
            })
        elif hs.health_class == "CRITICAL":
            elec_critical += 1
            at_risk_list.append({
                "node_id": eq.node_id,
                "tag": eq.tag,
                "name": eq.name,
                "health_score": hs.composite_score,
                "health_class": hs.health_class,
                "trend": hs.trend,
            })

    # Sort at-risk list by score ascending (worst first)
    at_risk_list.sort(key=lambda x: x["health_score"])

    # Step 4 — recommendations
    recommendations: list[str] = []

    low_score_motors = [e for e in at_risk_list if e["health_score"] < 50]
    if low_score_motors:
        recommendations.append(
            f"{len(low_score_motors)} motores/equipos electricos con health score < 50 "
            f"— posible consumo energetico excesivo"
        )

    if trend == "INCREASING":
        recommendations.append(
            f"Tendencia creciente de OTs electricas ({first_half} -> {second_half} "
            f"en periodo de {days} dias) — revisar programa preventivo electrico"
        )

    if elec_critical > 0:
        recommendations.append(
            f"{elec_critical} equipos electricos en estado CRITICAL "
            f"— priorizar intervencion para evitar fallas catastroficas"
        )

    if not recommendations:
        recommendations.append(
            "Sin alertas energeticas significativas en el periodo analizado."
        )

    # Summary
    summary = (
        f"Planta {plant_id}: {len(elec_equip)} equipos electricos, "
        f"{len(electrical_wos)} OTs electricas en {days} dias, "
        f"tendencia {trend}. "
        f"Salud: {elec_healthy} sanos, {elec_at_risk} en riesgo, "
        f"{elec_critical} criticos."
    )

    result = {
        "plant_id": plant_id,
        "period_days": days,
        "generated_at": datetime.now().isoformat(),
        "electrical_equipment": {
            "total": len(elec_equip),
            "healthy": elec_healthy,
            "at_risk": elec_at_risk,
            "critical": elec_critical,
        },
        "energy_proxy_metrics": {
            "electrical_wo_count": len(electrical_wos),
            "motor_failures": len(motor_failures),
            "electrical_maint_hours": round(total_hours, 1),
            "electrical_maint_cost": round(total_cost, 2),
            "trend": trend,
        },
        "at_risk_equipment": at_risk_list,
        "recommendations": recommendations,
        "summary": summary,
    }

    log.info(
        "Energy dashboard built: %d electrical equip, %d WOs, trend=%s",
        len(elec_equip), len(electrical_wos), trend,
    )
    return result
