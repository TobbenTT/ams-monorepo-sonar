"""Agentic RCA Initiator service — Item 12.4.

Auto-triggers Root Cause Analysis when P1/P2 work orders close.
Pre-fills the 5W2H template with work order data and similar failure history.
"""

import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    ManagedWorkOrderModel,
    RCAAnalysisModel,
    TroubleshootingDiagnosticModel,
)
from api.services.audit_service import log_action

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_RCA_ELIGIBLE_PRIORITIES = {"P1", "P2"}
_FULL_RCA_COST_THRESHOLD = 50_000


def _determine_rca_level(wo: ManagedWorkOrderModel) -> str:
    """Determine the RCA depth based on priority and cost.

    - P1 always gets a FULL RCA (cross-functional team).
    - P2 gets FULL only when actual cost exceeds the threshold; otherwise
      SIMPLIFIED (5-Why).
    """
    if wo.priority_code == "P1":
        return "FULL"
    if wo.priority_code == "P2":
        cost = wo.actual_total_cost or 0
        if cost > _FULL_RCA_COST_THRESHOLD:
            return "FULL"
        return "SIMPLIFIED"
    return "SIMPLIFIED"


def _build_5w2h(wo: ManagedWorkOrderModel, plant_id: str) -> dict:
    """Build the 5W2H pre-fill dict from a closed work order."""
    return {
        "what": (
            f"Falla {wo.wo_type} en equipo {wo.equipment_tag}: "
            f"{wo.description or 'Sin descripcion'}"
        ),
        "when": (
            wo.actual_start.isoformat()
            if wo.actual_start
            else "Fecha no registrada"
        ),
        "where": f"Planta {plant_id}, equipo {wo.equipment_tag}",
        "who": f"Reportado por: {wo.assigned_workers or 'No asignado'}",
        "why": "Por determinar — completar durante analisis RCA",
        "how": (
            f"Prioridad {wo.priority_code}. "
            f"Duracion: {wo.actual_hours or 'N/A'} horas"
        ),
        "how_much": (
            f"Costo real: ${wo.actual_total_cost or 0}. "
            f"Impacto operacional: por evaluar"
        ),
    }


def _wo_brief(wo: ManagedWorkOrderModel) -> dict:
    """Return a lightweight dict summary for a similar WO."""
    return {
        "wo_id": wo.wo_id,
        "wo_number": wo.wo_number,
        "description": wo.description,
        "wo_type": wo.wo_type,
        "priority_code": wo.priority_code,
        "actual_start": (
            wo.actual_start.isoformat() if wo.actual_start else None
        ),
        "actual_hours": wo.actual_hours,
        "actual_total_cost": wo.actual_total_cost,
    }


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------


def initiate_rca(
    db: Session,
    wo_id: str,
    plant_id: str = "OCP-JFC1",
) -> dict:
    """Auto-initiate an RCA for a closed P1/P2 work order.

    Steps:
      1. Load and validate the work order (must be CERRADO + P1/P2).
      2. Skip if an RCA already exists for this event.
      3. Gather similar historical failures and diagnostics.
      4. Build 5W2H pre-fill from WO data.
      5. Determine RCA level (FULL vs SIMPLIFIED).
      6. Persist the new RCAAnalysisModel.
      7. Return structured result with pre-filled data.
    """

    # -- Step 1: Load the closed work order --------------------------------
    wo = (
        db.query(ManagedWorkOrderModel)
        .filter(ManagedWorkOrderModel.wo_id == wo_id)
        .first()
    )
    if not wo:
        log.warning("initiate_rca: WO %s not found", wo_id)
        return {"rca_initiated": False, "reason": f"WO {wo_id} not found"}

    if wo.status != "CERRADO":
        log.info("initiate_rca: WO %s status is %s, not CERRADO — skipping", wo_id, wo.status)
        return {
            "rca_initiated": False,
            "reason": f"WO {wo_id} status is {wo.status}, not CERRADO",
        }

    if wo.priority_code not in _RCA_ELIGIBLE_PRIORITIES:
        log.info("initiate_rca: WO %s priority %s not eligible", wo_id, wo.priority_code)
        return {
            "rca_initiated": False,
            "reason": f"Priority {wo.priority_code} not eligible (need P1/P2)",
        }

    # -- Step 2: Check if RCA already exists -------------------------------
    cutoff_24h = datetime.now() - timedelta(hours=24)
    existing = (
        db.query(RCAAnalysisModel)
        .filter(
            RCAAnalysisModel.equipment_id == wo.equipment_tag,
            (
                RCAAnalysisModel.event_description.contains(wo_id)
                | (RCAAnalysisModel.created_at >= cutoff_24h)
            ),
        )
        .first()
    )
    if existing:
        log.info(
            "initiate_rca: RCA already exists for WO %s (analysis_id=%s)",
            wo_id,
            existing.analysis_id,
        )
        return {
            "rca_initiated": False,
            "reason": f"RCA already exists: {existing.analysis_id}",
            "existing_analysis_id": existing.analysis_id,
        }

    # -- Step 3: Find similar historical failures --------------------------
    twelve_months_ago = datetime.now() - timedelta(days=365)
    similar_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.equipment_tag == wo.equipment_tag,
            ManagedWorkOrderModel.wo_type == "CORRECTIVO",
            ManagedWorkOrderModel.wo_id != wo_id,
            ManagedWorkOrderModel.created_at >= twelve_months_ago,
        )
        .order_by(ManagedWorkOrderModel.created_at.desc())
        .limit(10)
        .all()
    )

    diagnostics = (
        db.query(TroubleshootingDiagnosticModel)
        .filter(
            TroubleshootingDiagnosticModel.equipment_tag == wo.equipment_tag,
        )
        .order_by(TroubleshootingDiagnosticModel.created_at.desc())
        .limit(5)
        .all()
    )

    log.info(
        "initiate_rca: Found %d similar WOs and %d diagnostics for %s",
        len(similar_wos),
        len(diagnostics),
        wo.equipment_tag,
    )

    # -- Step 4: Build 5W2H pre-fill ---------------------------------------
    analysis_5w2h = _build_5w2h(wo, plant_id)

    # -- Step 5: Determine RCA level ----------------------------------------
    level = _determine_rca_level(wo)

    # -- Step 6: Create RCAAnalysisModel ------------------------------------
    rca = RCAAnalysisModel(
        event_description=(
            f"[AUTO-RCA] OT {wo_id} — {wo.equipment_tag}: "
            f"{wo.description or 'Falla critica'}"
        ),
        plant_id=plant_id,
        equipment_id=wo.equipment_tag,
        level=level,
        status="INITIATED",
        team_members=[],
        analysis_5w2h=analysis_5w2h,
        cause_effect={},
        evidence_5p=[],
        solutions=[],
    )
    db.add(rca)
    db.commit()
    db.refresh(rca)

    log_action(
        db,
        entity_type="rca_analysis",
        entity_id=rca.analysis_id,
        action="AUTO_INITIATED",
        payload={
            "wo_id": wo_id,
            "equipment_tag": wo.equipment_tag,
            "priority_code": wo.priority_code,
            "level": level,
        },
        user="agentic_rca_initiator",
    )
    db.commit()

    log.info(
        "initiate_rca: Created RCA %s (level=%s) for WO %s",
        rca.analysis_id,
        level,
        wo_id,
    )

    # -- Step 7: Return result ----------------------------------------------
    return {
        "rca_initiated": True,
        "analysis_id": rca.analysis_id,
        "wo_id": wo_id,
        "equipment_tag": wo.equipment_tag,
        "level": level,
        "priority_code": wo.priority_code,
        "prefilled_5w2h": analysis_5w2h,
        "similar_failures_count": len(similar_wos),
        "similar_failures": [_wo_brief(w) for w in similar_wos],
        "diagnostics_count": len(diagnostics),
        "status": "INITIATED",
    }


def scan_closed_wo_for_rca(
    db: Session,
    plant_id: str = "OCP-JFC1",
    hours_lookback: int = 24,
) -> dict:
    """Scan recently-closed P1/P2 work orders and auto-initiate RCAs.

    Intended to be called on a schedule (e.g. every hour) to catch any
    high-priority WOs that closed without an RCA being triggered.

    Returns a summary of all initiated (and skipped) RCAs.
    """
    cutoff = datetime.now() - timedelta(hours=hours_lookback)

    closed_wos = (
        db.query(ManagedWorkOrderModel)
        .filter(
            ManagedWorkOrderModel.status == "CERRADO",
            ManagedWorkOrderModel.priority_code.in_(_RCA_ELIGIBLE_PRIORITIES),
            ManagedWorkOrderModel.closed_at >= cutoff,
        )
        .order_by(ManagedWorkOrderModel.closed_at.desc())
        .all()
    )

    log.info(
        "scan_closed_wo_for_rca: Found %d closed P1/P2 WOs in last %dh for plant %s",
        len(closed_wos),
        hours_lookback,
        plant_id,
    )

    results: list[dict] = []
    initiated_count = 0
    skipped_count = 0

    for wo in closed_wos:
        result = initiate_rca(db, wo.wo_id, plant_id)
        results.append(result)
        if result.get("rca_initiated"):
            initiated_count += 1
        else:
            skipped_count += 1

    summary = {
        "scan_timestamp": datetime.now().isoformat(),
        "plant_id": plant_id,
        "hours_lookback": hours_lookback,
        "total_closed_wo_found": len(closed_wos),
        "rca_initiated_count": initiated_count,
        "rca_skipped_count": skipped_count,
        "details": results,
    }

    log.info(
        "scan_closed_wo_for_rca: Initiated %d, skipped %d",
        initiated_count,
        skipped_count,
    )

    return summary
