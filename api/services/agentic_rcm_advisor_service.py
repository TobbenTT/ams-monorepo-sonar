"""Agentic RCM Advisor service — item 9.2.

Analyses equipment failure modes and recommends maintenance strategies
using inline RCM decision logic.  Pure deterministic — no Claude API needed.
"""

import logging
from collections import Counter

from sqlalchemy.orm import Session

from api.database.models import (
    FailureModeModel,
    FunctionModel,
    FunctionalFailureModel,
    HierarchyNodeModel,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers — RCM decision logic
# ---------------------------------------------------------------------------

def _rcm_decide_inline(fm: FailureModeModel) -> dict:
    """Simplified RCM decision logic based on failure mode data."""
    consequence = (fm.failure_consequence or "").upper()
    is_hidden = fm.is_hidden or False
    pattern = (fm.failure_pattern or "").upper()

    # Default strategy based on consequence
    if is_hidden:
        strategy = "FAILURE_FINDING"
        path = "hidden_failure"
    elif "SAFETY" in consequence or "ENVIRONMENT" in consequence:
        strategy = "CBM" if "RANDOM" not in pattern else "SCHEDULED_RESTORATION"
        path = "safety_environmental"
    elif "OPERATIONAL" in consequence:
        strategy = "CBM" if "RANDOM" not in pattern else "SCHEDULED_RESTORATION"
        path = "operational"
    else:
        strategy = "RUN_TO_FAILURE"
        path = "non_operational"

    return {
        "strategy_type": strategy,
        "path": path,
        "requires_secondary_task": is_hidden,
        "reasoning": f"Based on {consequence} consequence and {pattern or 'unknown'} pattern",
    }


def _derive_task_name(fm: FailureModeModel, decision: dict) -> str:
    """Derive a human-readable task name from the failure mode and decision."""
    strategy = decision["strategy_type"]
    mechanism = fm.mechanism or "componente"

    names = {
        "CBM": f"Monitoreo de condicion — {mechanism}",
        "SCHEDULED_RESTORATION": f"Restauracion programada — {mechanism}",
        "SCHEDULED_DISCARD": f"Reemplazo programado — {mechanism}",
        "FAILURE_FINDING": f"Tarea de deteccion de falla — {mechanism}",
        "RUN_TO_FAILURE": f"Operar hasta falla — {mechanism}",
    }
    return names.get(strategy, f"Revisar estrategia — {mechanism}")


def _derive_interval(strategy_type: str) -> str:
    """Return the recommended maintenance interval for the strategy type."""
    intervals = {
        "CBM": "Continuo / Ruta de inspeccion",
        "SCHEDULED_RESTORATION": "6 meses",
        "SCHEDULED_DISCARD": "12 meses",
        "FAILURE_FINDING": "3 meses",
        "RUN_TO_FAILURE": "N/A — mantener repuesto disponible",
    }
    return intervals.get(strategy_type, "A definir")


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def advise_rcm_strategy(
    db: Session,
    equipment_tag: str,
    plant_id: str = "OCP-JFC1",
) -> dict:
    """Analyse failure modes for an equipment tag and recommend strategies.

    Traverses the hierarchy chain:
        HierarchyNodeModel (tag) -> FunctionModel (node_id)
          -> FunctionalFailureModel (function_id)
            -> FailureModeModel (functional_failure_id)

    Returns a structured dict with per-FM strategies, a task list,
    overall confidence score and general recommendations.
    """

    # ── Step 1: Load failure modes for the equipment ─────────────────────
    node = (
        db.query(HierarchyNodeModel)
        .filter(HierarchyNodeModel.tag == equipment_tag)
        .first()
    )

    if not node:
        log.warning("advise_rcm_strategy: equipment tag %s not found", equipment_tag)
        return {
            "equipment_tag": equipment_tag,
            "equipment_name": None,
            "failure_modes_analyzed": 0,
            "strategies": [],
            "strategy_summary": {},
            "draft_task_list": [],
            "overall_confidence": 0.0,
            "fmea_completeness_pct": 0.0,
            "recommendations": [
                f"Equipo '{equipment_tag}' no encontrado en la jerarquia. "
                "Verificar el tag y la planta.",
            ],
        }

    functions = (
        db.query(FunctionModel)
        .filter(FunctionModel.node_id == node.node_id)
        .all()
    )

    total_functions = len(functions)
    function_ids = [f.function_id for f in functions]

    functional_failures = (
        db.query(FunctionalFailureModel)
        .filter(FunctionalFailureModel.function_id.in_(function_ids))
        .all()
        if function_ids
        else []
    )

    ff_ids = [ff.failure_id for ff in functional_failures]

    failure_modes: list[FailureModeModel] = (
        db.query(FailureModeModel)
        .filter(FailureModeModel.functional_failure_id.in_(ff_ids))
        .all()
        if ff_ids
        else []
    )

    if not failure_modes:
        log.info("advise_rcm_strategy: no failure modes for %s", equipment_tag)
        return {
            "equipment_tag": equipment_tag,
            "equipment_name": node.name,
            "failure_modes_analyzed": 0,
            "strategies": [],
            "strategy_summary": {},
            "draft_task_list": [],
            "overall_confidence": 0.0,
            "fmea_completeness_pct": 0.0,
            "recommendations": [
                "No se encontraron modos de falla para este equipo. "
                "Ejecutar FMECA (Milestone M2) antes de solicitar recomendaciones RCM.",
            ],
        }

    # ── Step 2: Run RCM decision logic per failure mode ──────────────────
    strategies: list[dict] = []
    draft_tasks: list[dict] = []
    strategy_counter: Counter = Counter()

    for fm in failure_modes:
        decision = _rcm_decide_inline(fm)

        strategy_entry = {
            "fm_code": fm.failure_mode_id,
            "mechanism": fm.mechanism,
            "cause": fm.cause,
            "rcm_decision": decision["strategy_type"],
            "rcm_path": decision["path"],
            "requires_secondary_task": decision["requires_secondary_task"],
            "reasoning": decision["reasoning"],
        }
        strategies.append(strategy_entry)

        task_entry = {
            "fm_code": fm.failure_mode_id,
            "mechanism": fm.mechanism,
            "cause": fm.cause,
            "rcm_decision": decision["strategy_type"],
            "strategy_type": decision["strategy_type"],
            "recommended_task": _derive_task_name(fm, decision),
            "interval": _derive_interval(decision["strategy_type"]),
            "confidence": fm.ai_confidence or 0.7,
        }
        draft_tasks.append(task_entry)

        strategy_counter[decision["strategy_type"]] += 1

    # ── Step 3: Build strategy summary ───────────────────────────────────
    summary_keys = [
        "CBM",
        "SCHEDULED_RESTORATION",
        "SCHEDULED_DISCARD",
        "FAILURE_FINDING",
        "RUN_TO_FAILURE",
    ]
    strategy_summary = {k: strategy_counter.get(k, 0) for k in summary_keys}

    # ── Step 4: Calculate confidence ─────────────────────────────────────
    confidences = [fm.ai_confidence or 0.7 for fm in failure_modes]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    # FMEA completeness: % of functions that have at least one failure mode
    functions_with_fm = set()
    for ff in functional_failures:
        if any(fm.functional_failure_id == ff.failure_id for fm in failure_modes):
            functions_with_fm.add(ff.function_id)
    fmea_completeness = (
        (len(functions_with_fm) / total_functions * 100.0)
        if total_functions > 0
        else 0.0
    )

    # Boost confidence by 10% if FMEA completeness > 80%
    overall_confidence = avg_confidence
    if fmea_completeness > 80.0:
        overall_confidence = min(1.0, overall_confidence + 0.10)

    # ── Step 5: General recommendations ──────────────────────────────────
    recommendations: list[str] = []

    if fmea_completeness < 80.0:
        recommendations.append(
            f"FMEA completeness is {fmea_completeness:.0f}% — "
            "complete remaining functions before finalising strategy."
        )

    rtf_count = strategy_summary.get("RUN_TO_FAILURE", 0)
    total_fm = len(failure_modes)
    if total_fm > 0 and (rtf_count / total_fm) > 0.5:
        recommendations.append(
            f"{rtf_count}/{total_fm} failure modes assigned Run-to-Failure — "
            "review whether spare parts inventory is adequate."
        )

    cbm_count = strategy_summary.get("CBM", 0)
    if cbm_count > 0:
        recommendations.append(
            f"{cbm_count} CBM tasks recommended — verify that condition "
            "monitoring routes and sensors are available."
        )

    ff_count = strategy_summary.get("FAILURE_FINDING", 0)
    if ff_count > 0:
        recommendations.append(
            f"{ff_count} hidden-failure detection tasks — ensure "
            "protective devices are included in the inspection program."
        )

    if not recommendations:
        recommendations.append(
            "RCM analysis complete. Review draft task list and adjust "
            "intervals based on plant operating context."
        )

    log.info(
        "advise_rcm_strategy: %s — %d FMs analysed, confidence %.2f",
        equipment_tag,
        total_fm,
        overall_confidence,
    )

    return {
        "equipment_tag": equipment_tag,
        "equipment_name": node.name,
        "failure_modes_analyzed": total_fm,
        "strategies": strategies,
        "strategy_summary": strategy_summary,
        "draft_task_list": draft_tasks,
        "overall_confidence": round(overall_confidence, 3),
        "fmea_completeness_pct": round(fmea_completeness, 1),
        "recommendations": recommendations,
    }
