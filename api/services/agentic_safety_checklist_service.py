"""Agentic Safety Checklist service — Enhanced safety checklist generation.

Generates context-aware safety checklists for work execution based on:
  1. Auto-LOTO detection from equipment hierarchy and FMEA data
  2. Altitude-specific PPE for high-altitude plants (4500m)
  3. Incident history from past work requests (P1/P2)
  4. Task-type specific safety sections

This is deterministic rule-based logic — no Claude API call required.
"""

import logging
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import (
    HierarchyNodeModel,
    WorkRequestModel,
    FunctionModel,
    FunctionalFailureModel,
    FailureModeModel,
)

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LOTO detection constants
# ---------------------------------------------------------------------------

LOTO_EQUIPMENT_TYPES = {
    "MOTOR", "BOMBA", "COMPRESOR", "TURBINA",
    "VENTILADOR", "GENERADOR", "TRANSFORMADOR", "VALVE",
}

LOTO_KEYWORDS = {
    "electr", "rotat", "presion", "hidraul",
    "neumat", "vapor", "alta tension",
}

# ---------------------------------------------------------------------------
# High-altitude PPE items (4500m, extreme cold)
# ---------------------------------------------------------------------------

ALTITUDE_PPE_ITEMS = [
    {"description": "Proteccion UV (SPF 50+, lentes de sol certificados)", "mandatory": True, "completed": False},
    {"description": "Ropa termica multicapa (interior termico + polar + cortaviento)", "mandatory": True, "completed": False},
    {"description": "Kit de oxigeno portatil disponible y verificado", "mandatory": True, "completed": False},
    {"description": "Hidratacion obligatoria (min 3L agua/dia)", "mandatory": True, "completed": False},
    {"description": "Bloqueador solar reaplicar cada 2 horas", "mandatory": True, "completed": False},
    {"description": "Pausas frecuentes por esfuerzo en altitud (cada 45 min)", "mandatory": True, "completed": False},
]

ALTITUDE_RISKS = [
    "Planta a 4500 msnm — riesgo de mal de altura (soroche)",
    "Radiacion UV extrema — indice UV >11 frecuente",
    "Temperaturas bajo cero — riesgo de hipotermia",
    "Menor presion de oxigeno — fatiga acelerada",
    "Vientos fuertes — riesgo de caida de objetos",
]

# ---------------------------------------------------------------------------
# General safety items (always included)
# ---------------------------------------------------------------------------

GENERAL_SAFETY_ITEMS = [
    {"description": "Verificar permiso de trabajo vigente", "mandatory": True, "completed": False},
    {"description": "Confirmar bloqueo de energia (si aplica)", "mandatory": True, "completed": False},
    {"description": "Verificar condiciones climaticas antes de iniciar", "mandatory": True, "completed": False},
    {"description": "Comunicar inicio de trabajo al supervisor", "mandatory": True, "completed": False},
    {"description": "Verificar herramientas en buen estado", "mandatory": True, "completed": False},
    {"description": "Identificar rutas de evacuacion", "mandatory": True, "completed": False},
]

# ---------------------------------------------------------------------------
# LOTO section items
# ---------------------------------------------------------------------------

LOTO_ITEMS = [
    {"description": "Identificar todas las fuentes de energia del equipo", "mandatory": True, "completed": False},
    {"description": "Notificar a operaciones antes de bloqueo", "mandatory": True, "completed": False},
    {"description": "Aplicar candado y tarjeta personal en cada punto de aislamiento", "mandatory": True, "completed": False},
    {"description": "Verificar energia cero (prueba de arranque fallido)", "mandatory": True, "completed": False},
    {"description": "Verificar ausencia de energia residual (capacitores, presion, resortes)", "mandatory": True, "completed": False},
    {"description": "Documentar todos los puntos de bloqueo en permiso de trabajo", "mandatory": True, "completed": False},
    {"description": "Al finalizar: retirar candados en orden inverso", "mandatory": True, "completed": False},
]

# ---------------------------------------------------------------------------
# Task-type specific safety sections
# ---------------------------------------------------------------------------

ELECTRICAL_SAFETY_ITEMS = [
    {"description": "Verificar ausencia de tension con multimetro certificado", "mandatory": True, "completed": False},
    {"description": "Usar guantes dielectricos clase apropiada", "mandatory": True, "completed": False},
    {"description": "Mantener distancia de seguridad segun nivel de tension", "mandatory": True, "completed": False},
    {"description": "Usar herramientas aisladas certificadas", "mandatory": True, "completed": False},
    {"description": "Verificar puesta a tierra temporal instalada", "mandatory": True, "completed": False},
]

FALL_PROTECTION_ITEMS = [
    {"description": "Inspeccion visual de arnes y linea de vida antes de uso", "mandatory": True, "completed": False},
    {"description": "Verificar puntos de anclaje certificados", "mandatory": True, "completed": False},
    {"description": "Delimitar zona de caida con cinta de peligro", "mandatory": True, "completed": False},
    {"description": "Verificar que andamios/plataformas estan asegurados", "mandatory": True, "completed": False},
    {"description": "Personal capacitado en rescate en alturas disponible", "mandatory": True, "completed": False},
]

CONFINED_SPACE_ITEMS = [
    {"description": "Medicion de atmosfera (O2, LEL, H2S, CO) antes de ingreso", "mandatory": True, "completed": False},
    {"description": "Ventilacion forzada instalada y funcionando", "mandatory": True, "completed": False},
    {"description": "Vigia permanente en la entrada del espacio confinado", "mandatory": True, "completed": False},
    {"description": "Equipo de rescate disponible en sitio", "mandatory": True, "completed": False},
    {"description": "Comunicacion continua con vigia (radio o visual)", "mandatory": True, "completed": False},
    {"description": "Permiso de espacio confinado firmado por todas las partes", "mandatory": True, "completed": False},
]

HOT_WORK_ITEMS = [
    {"description": "Permiso de trabajo en caliente vigente y firmado", "mandatory": True, "completed": False},
    {"description": "Extintor operativo a menos de 5 metros", "mandatory": True, "completed": False},
    {"description": "Area libre de materiales combustibles (radio 11m)", "mandatory": True, "completed": False},
    {"description": "Vigia de fuego durante y 30 min despues del trabajo", "mandatory": True, "completed": False},
    {"description": "Pantallas de proteccion contra chispas instaladas", "mandatory": True, "completed": False},
]


# ---------------------------------------------------------------------------
# Helper: determine LOTO requirement
# ---------------------------------------------------------------------------

def _check_loto_required(
    db: Session,
    equipment_tag: str,
    node: HierarchyNodeModel | None,
) -> bool:
    """Determine if LOTO is required based on equipment type, tag keywords, and FMEA data."""

    # Check 1: equipment node_type or tag against known LOTO types
    if node:
        node_type_upper = (node.node_type or "").upper()
        tag_upper = (node.tag or "").upper()
        name_upper = (node.name or "").upper()

        for eq_type in LOTO_EQUIPMENT_TYPES:
            if eq_type in node_type_upper or eq_type in tag_upper or eq_type in name_upper:
                log.info("LOTO required: equipment type/tag match '%s'", eq_type)
                return True

        # Check tag and name for LOTO keywords
        combined = f"{tag_upper} {name_upper} {node_type_upper}".lower()
        for keyword in LOTO_KEYWORDS:
            if keyword in combined:
                log.info("LOTO required: keyword match '%s'", keyword)
                return True

    # Check 2: equipment tag string itself
    tag_lower = equipment_tag.lower()
    for keyword in LOTO_KEYWORDS:
        if keyword in tag_lower:
            log.info("LOTO required: equipment_tag keyword match '%s'", keyword)
            return True

    for eq_type in LOTO_EQUIPMENT_TYPES:
        if eq_type.lower() in tag_lower:
            log.info("LOTO required: equipment_tag type match '%s'", eq_type)
            return True

    # Check 3: FMEA failure modes referencing energy sources
    if node:
        functions = (
            db.query(FunctionModel)
            .filter(FunctionModel.node_id == node.node_id)
            .all()
        )
        if functions:
            function_ids = [f.function_id for f in functions]
            failures = (
                db.query(FunctionalFailureModel)
                .filter(FunctionalFailureModel.function_id.in_(function_ids))
                .all()
            )
            if failures:
                failure_ids = [ff.failure_id for ff in failures]
                modes = (
                    db.query(FailureModeModel)
                    .filter(FailureModeModel.functional_failure_id.in_(failure_ids))
                    .all()
                )
                energy_keywords = {"electr", "presion", "hidraul", "neumat", "rotat", "vapor", "energia"}
                for mode in modes:
                    mode_text = f"{mode.what} {mode.mechanism} {mode.cause}".lower()
                    for ek in energy_keywords:
                        if ek in mode_text:
                            log.info("LOTO required: FMEA energy source match '%s' in FM %s", ek, mode.failure_mode_id)
                            return True

    return False


# ---------------------------------------------------------------------------
# Helper: get incident history
# ---------------------------------------------------------------------------

def _get_incident_history(db: Session, equipment_tag: str, limit: int = 5) -> list[str]:
    """Query past P1/P2 work requests for safety alerts."""
    incidents = (
        db.query(WorkRequestModel)
        .filter(
            WorkRequestModel.equipment_tag == equipment_tag,
            WorkRequestModel.priority_code.in_(["P1", "P2"]),
        )
        .order_by(WorkRequestModel.created_at.desc())
        .limit(limit)
        .all()
    )

    alerts = []
    for wr in incidents:
        desc = ""
        if wr.problem_description:
            if isinstance(wr.problem_description, dict):
                desc = wr.problem_description.get("original_text", "") or wr.problem_description.get("structured_description", "")
            elif isinstance(wr.problem_description, str):
                desc = wr.problem_description
        if not desc:
            desc = f"Incidente {wr.priority_code} registrado"

        date_str = wr.created_at.strftime("%Y-%m-%d") if wr.created_at else "fecha desconocida"
        alerts.append(
            f"[{wr.priority_code}] {date_str} — {desc[:200]}"
        )

    return alerts


# ---------------------------------------------------------------------------
# Helper: build task-type specific sections
# ---------------------------------------------------------------------------

def _get_task_type_sections(task_type: str) -> list[dict]:
    """Return additional safety sections based on task type keywords."""
    sections = []
    task_lower = task_type.lower()

    if "electr" in task_lower:
        sections.append({
            "name": "Seguridad Electrica",
            "items": [item.copy() for item in ELECTRICAL_SAFETY_ITEMS],
        })

    if "altura" in task_lower or "height" in task_lower:
        sections.append({
            "name": "Proteccion contra Caidas",
            "items": [item.copy() for item in FALL_PROTECTION_ITEMS],
        })

    if "confin" in task_lower or "confined" in task_lower:
        sections.append({
            "name": "Espacio Confinado",
            "items": [item.copy() for item in CONFINED_SPACE_ITEMS],
        })

    if "caliente" in task_lower or "hot" in task_lower:
        sections.append({
            "name": "Trabajo en Caliente",
            "items": [item.copy() for item in HOT_WORK_ITEMS],
        })

    return sections


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def generate_safety_checklist(
    db: Session,
    equipment_tag: str,
    task_type: str,
    plant_id: str = "OCP-JFC1",
    wo_id: str | None = None,
) -> dict:
    """Generate an enhanced safety checklist for work execution.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    equipment_tag : str
        Equipment tag (e.g. ``BOM-001``).
    task_type : str
        Type of maintenance task (e.g. ``electrico``, ``mecanico``, ``trabajo en altura``).
    plant_id : str
        SAP plant code (default ``OCP-JFC1``).
    wo_id : str, optional
        Work order ID for traceability.

    Returns
    -------
    dict
        Complete safety checklist with sections, alerts, and LOTO/altitude flags.
    """
    checklist_id = f"SCL-{uuid.uuid4().hex[:8].upper()}"
    log.info(
        "Generating safety checklist %s for equipment=%s task=%s plant=%s",
        checklist_id, equipment_tag, task_type, plant_id,
    )

    # ── Step 1: Resolve equipment hierarchy node ─────────────────────────
    node = (
        db.query(HierarchyNodeModel)
        .filter(HierarchyNodeModel.tag == equipment_tag)
        .first()
    )
    if not node:
        # Fallback: try matching by code
        node = (
            db.query(HierarchyNodeModel)
            .filter(HierarchyNodeModel.code == equipment_tag)
            .first()
        )
    if node:
        log.info("Resolved equipment node: %s (%s) type=%s", node.node_id, node.name, node.node_type)
    else:
        log.warning("Equipment tag '%s' not found in hierarchy — proceeding with tag-only checks", equipment_tag)

    # ── Step 2: LOTO detection ───────────────────────────────────────────
    loto_required = _check_loto_required(db, equipment_tag, node)

    # ── Step 3: Incident history ─────────────────────────────────────────
    safety_alerts = _get_incident_history(db, equipment_tag)
    if safety_alerts:
        log.info("Found %d historical safety alerts for %s", len(safety_alerts), equipment_tag)

    # ── Step 4: Build sections ───────────────────────────────────────────
    sections: list[dict] = []

    # 4a. General safety (always first)
    sections.append({
        "name": "Seguridad General",
        "items": [item.copy() for item in GENERAL_SAFETY_ITEMS],
    })

    # 4b. LOTO section (if required)
    if loto_required:
        sections.append({
            "name": "LOTO",
            "items": [item.copy() for item in LOTO_ITEMS],
        })

    # 4c. Altitude PPE (always included for this plant)
    sections.append({
        "name": "EPP Alta Altitud",
        "items": [item.copy() for item in ALTITUDE_PPE_ITEMS],
    })

    # 4d. Task-type specific sections
    task_sections = _get_task_type_sections(task_type)
    sections.extend(task_sections)

    # 4e. Pre-execution section
    pre_execution_items = [
        {"description": "Reunion de seguridad pre-tarea (charla de 5 minutos)", "mandatory": True, "completed": False},
        {"description": "Analisis de riesgo de ultimo minuto completado", "mandatory": True, "completed": False},
        {"description": "Todo el personal con EPP completo verificado", "mandatory": True, "completed": False},
    ]
    if wo_id:
        pre_execution_items.append(
            {"description": f"Orden de trabajo {wo_id} revisada y entendida por el equipo", "mandatory": True, "completed": False}
        )
    if safety_alerts:
        pre_execution_items.append(
            {"description": f"Revisar {len(safety_alerts)} alerta(s) historica(s) de este equipo", "mandatory": True, "completed": False}
        )
    sections.append({
        "name": "Pre-Ejecucion",
        "items": pre_execution_items,
    })

    log.info(
        "Safety checklist %s generated: %d sections, loto=%s, alerts=%d",
        checklist_id, len(sections), loto_required, len(safety_alerts),
    )

    return {
        "checklist_id": checklist_id,
        "equipment_tag": equipment_tag,
        "task_type": task_type,
        "plant_id": plant_id,
        "wo_id": wo_id,
        "generated_at": datetime.now().isoformat(),
        "sections": sections,
        "safety_alerts": safety_alerts,
        "loto_required": loto_required,
        "altitude_risks": list(ALTITUDE_RISKS),
    }
