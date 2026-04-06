"""Agentic EquipmentDoctor service — AI diagnostic tool for equipment.

Orchestrates: symptom description + equipment context -> diagnosis + WR suggestion.

Pipeline:
  1. Gather full equipment context from DB (_gather_equipment_context)
  2. Build diagnostic prompt in Spanish for Claude
  3. Call Claude API for AI diagnosis (with keyword-based fallback)
  4. If confidence > 85% and requested, build WR draft suggestion (NOT persisted)
"""

import json
import logging
import os
from datetime import datetime

from sqlalchemy.orm import Session

from api.services.equipment_chat_service import _gather_equipment_context
from api.services.work_request_service import compute_sla_deadline, derive_work_class

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# AI diagnosis via Claude
# ---------------------------------------------------------------------------

def _build_diagnostic_prompt(context_json: str, symptom_description: str) -> str:
    """Build the Spanish diagnostic prompt for Claude."""
    return (
        f"Eres un ingeniero de mantenimiento experto. "
        f"Dado el siguiente contexto del equipo {context_json} "
        f"y los sintomas reportados: {symptom_description}, "
        f"proporciona: "
        f"1) Diagnostico probable con nivel de confianza (0.0-1.0), "
        f"2) Pasos de verificacion, "
        f"3) Si confianza > 85%, modo de falla probable y accion correctiva recomendada.\n\n"
        f"Responde SOLO con un JSON con estas claves exactas:\n"
        f'{{\n'
        f'  "diagnosis": "descripcion del diagnostico probable",\n'
        f'  "confidence": 0.85,\n'
        f'  "verification_steps": ["paso 1", "paso 2", "paso 3"],\n'
        f'  "failure_mode": "modo de falla probable o null si confianza < 0.85",\n'
        f'  "failure_category": "MECANICO | ELECTRICO | INSTRUMENTACION",\n'
        f'  "corrective_action": "accion correctiva recomendada o null si confianza < 0.85",\n'
        f'  "priority": "P1 | P2 | P3 | P4",\n'
        f'  "related_failure_modes": ["modo1", "modo2"]\n'
        f'}}'
    )


def _diagnose_with_claude(context_json: str, symptom_description: str) -> dict:
    """Call Claude to diagnose the equipment. Returns parsed dict."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback diagnosis")
        return _fallback_diagnose(symptom_description)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_diagnostic_prompt(context_json, symptom_description)

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()

        # Parse JSON robustly — find { and } markers
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            parsed = json.loads(text[start:end])
            # Ensure confidence is a float
            parsed["confidence"] = float(parsed.get("confidence", 0.5))
            return parsed

        log.warning("Claude response did not contain JSON — using fallback")
        return _fallback_diagnose(symptom_description)
    except Exception as exc:
        log.warning("Claude diagnosis failed: %s — using fallback", exc)
        return _fallback_diagnose(symptom_description)


def _fallback_diagnose(symptom_description: str) -> dict:
    """Keyword-based fallback diagnosis when Claude is unavailable."""
    text_lower = symptom_description.lower()

    # Detect category
    category = "MECANICO"
    if any(k in text_lower for k in ("motor", "cable", "tablero", "variador", "cortocircuito", "aislacion", "electrico")):
        category = "ELECTRICO"
    elif any(k in text_lower for k in ("sensor", "transmisor", "plc", "senal", "señal", "calibr", "instrumento")):
        category = "INSTRUMENTACION"

    # Detect priority
    priority = "P3"
    if any(k in text_lower for k in ("emergencia", "peligro", "incendio", "explosion")):
        priority = "P1"
    elif any(k in text_lower for k in ("urgente", "critico", "crítico", "parado", "parada")):
        priority = "P2"

    # Detect diagnosis and confidence based on keywords
    diagnosis = "Desgaste general del componente — requiere inspeccion visual"
    confidence = 0.5
    failure_mode = None
    corrective_action = None
    related = []

    if any(k in text_lower for k in ("vibra", "vibración", "vibracion")):
        diagnosis = "Probable desbalance o desalineamiento — alta vibracion detectada"
        confidence = 0.6
        failure_mode = "ALTA VIBRACION"
        corrective_action = "Realizar analisis de vibracion y verificar alineamiento"
        related = ["DESALINEAMIENTO", "DESBALANCE", "RODAMIENTO DEFECTUOSO"]
    elif any(k in text_lower for k in ("temperatura", "caliente", "sobrecalentamiento")):
        diagnosis = "Probable sobrecalentamiento — verificar lubricacion y carga"
        confidence = 0.6
        failure_mode = "ALTA TEMPERATURA"
        corrective_action = "Verificar nivel de lubricante y condiciones de carga"
        related = ["FALTA LUBRICACION", "SOBRECARGA", "RODAMIENTO DEFECTUOSO"]
    elif any(k in text_lower for k in ("ruido", "sonido", "golpe")):
        diagnosis = "Probable falla mecanica — ruido anormal detectado"
        confidence = 0.55
        failure_mode = "RUIDO ANORMAL"
        corrective_action = "Inspeccionar componentes internos y rodamientos"
        related = ["RODAMIENTO DEFECTUOSO", "ENGRANAJE DESGASTADO", "ACOPLE DAÑADO"]
    elif any(k in text_lower for k in ("fuga", "goteo", "filtracion")):
        diagnosis = "Probable falla de sellos o empaquetaduras — filtracion detectada"
        confidence = 0.65
        failure_mode = "FILTRACION"
        corrective_action = "Reemplazar sellos mecanicos o empaquetaduras"
        related = ["SELLO MECANICO DAÑADO", "EMPAQUETADURA DESGASTADA", "CORROSION"]
    elif any(k in text_lower for k in ("no arranca", "no enciende", "no funciona")):
        diagnosis = "Equipo no operativo — verificar alimentacion electrica y protecciones"
        confidence = 0.55
        failure_mode = "NO ARRANCA"
        corrective_action = "Verificar breaker, protecciones termicas y alimentacion"
        related = ["DISPARO PROTECCION", "PERDIDA AISLACION", "CONTACTOR DAÑADO"]
        category = "ELECTRICO"
    elif any(k in text_lower for k in ("trabado", "atascado", "bloqueado")):
        diagnosis = "Probable obstruccion o bloqueo mecanico"
        confidence = 0.6
        failure_mode = "TRABADO"
        corrective_action = "Desmontar e inspeccionar para eliminar obstruccion"
        related = ["OBSTRUCCION", "CORROSION", "DESGASTE"]

    return {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "verification_steps": [
            "Inspeccionar visualmente el equipo",
            "Verificar parametros operacionales (temperatura, vibracion, presion)",
            "Revisar historial de mantenimiento reciente",
        ],
        "failure_mode": failure_mode,
        "failure_category": category,
        "corrective_action": corrective_action,
        "priority": priority,
        "related_failure_modes": related,
    }


# ---------------------------------------------------------------------------
# WR suggestion builder
# ---------------------------------------------------------------------------

def _build_wr_suggestion(
    equipment_tag: str,
    diagnosis_result: dict,
    context: dict,
) -> dict:
    """Build a Work Request draft dict (NOT persisted to DB).

    Returns a suggestion dict that the technician can review and confirm.
    """
    priority = diagnosis_result.get("priority", "P3")
    work_class = derive_work_class(priority)
    sla_deadline = compute_sla_deadline(priority)

    # Try to match failure_category from FMEA context
    failure_category = diagnosis_result.get("failure_category", "MECANICO")
    fmea_data = context.get("fmea", [])
    fmea_match = None
    if fmea_data:
        # Look for a matching failure mode in FMEA
        diag_mode = (diagnosis_result.get("failure_mode") or "").lower()
        for fn in fmea_data:
            for fail in fn.get("failures", []):
                for mode in fail.get("modes", []):
                    mechanism = (mode.get("mechanism") or "").lower()
                    if diag_mode and diag_mode in mechanism:
                        fmea_match = mode
                        break

    return {
        "equipment_tag": equipment_tag,
        "status": "SUGGESTION",
        "priority_code": priority,
        "work_class": work_class,
        "sla_deadline": sla_deadline.isoformat() if sla_deadline else None,
        "failure_category": failure_category,
        "failure_mode": diagnosis_result.get("failure_mode"),
        "corrective_action": diagnosis_result.get("corrective_action"),
        "problem_description": diagnosis_result.get("diagnosis", ""),
        "fmea_match": fmea_match,
        "note": "Este es un borrador sugerido por EquipmentDoctor. Requiere confirmacion del tecnico.",
    }


# ---------------------------------------------------------------------------
# Context summary builder
# ---------------------------------------------------------------------------

def _build_context_summary(context: dict) -> dict:
    """Build boolean-flag summary of what data was available (same pattern as equipment_chat_service)."""
    return {
        "has_hierarchy": "hierarchy" in context,
        "has_criticality": "criticality" in context,
        "has_fmea": "fmea" in context,
        "has_maintenance_tasks": "maintenance_tasks" in context,
        "has_work_packages": "work_packages" in context,
        "work_requests_count": len(context.get("work_requests", [])),
        "captures_count": len(context.get("captures", [])),
        "backlog_count": len(context.get("backlog", [])),
        "diagnostics_count": len(context.get("diagnostics", [])),
    }


# ---------------------------------------------------------------------------
# Main diagnostic function
# ---------------------------------------------------------------------------

def diagnose_equipment(
    db: Session,
    equipment_tag: str,
    symptom_description: str,
    plant_id: str = "OCP-JFC1",
    include_wr_suggestion: bool = True,
) -> dict:
    """Run EquipmentDoctor: gather context, diagnose via AI, optionally suggest WR.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session (read-only — nothing is persisted).
    equipment_tag : str
        Equipment tag or functional location code.
    symptom_description : str
        Free-text symptom description from the technician.
    plant_id : str
        SAP plant code (default ``OCP-JFC1``).
    include_wr_suggestion : bool
        If True and confidence > 0.85, include a WR draft suggestion.

    Returns
    -------
    dict
        {diagnosis, confidence, verification_steps, suggested_wr,
         related_failure_modes, context_summary}
    """
    log.info(
        "EquipmentDoctor: diagnosing %s — symptoms: %s",
        equipment_tag, symptom_description[:100],
    )

    # ── Step 1: Gather equipment context ─────────────────────────────────
    context = _gather_equipment_context(db, equipment_tag)
    context_json = json.dumps(context, default=str, ensure_ascii=False)

    # ── Step 2 & 3: Build prompt and call Claude ─────────────────────────
    diagnosis_result = _diagnose_with_claude(context_json, symptom_description)

    confidence = diagnosis_result.get("confidence", 0.0)
    diagnosis = diagnosis_result.get("diagnosis", "No se pudo determinar un diagnostico")
    verification_steps = diagnosis_result.get("verification_steps", [])
    related_failure_modes = diagnosis_result.get("related_failure_modes", [])

    # ── Step 4: WR suggestion if confidence > 0.85 ───────────────────────
    suggested_wr = None
    if confidence > 0.85 and include_wr_suggestion:
        suggested_wr = _build_wr_suggestion(equipment_tag, diagnosis_result, context)
        log.info(
            "EquipmentDoctor: high confidence (%.2f) — WR suggestion generated for %s",
            confidence, equipment_tag,
        )

    # ── Build context summary ────────────────────────────────────────────
    context_summary = _build_context_summary(context)

    return {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "verification_steps": verification_steps,
        "suggested_wr": suggested_wr,
        "related_failure_modes": related_failure_modes,
        "context_summary": context_summary,
    }
