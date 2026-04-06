"""Agentic Voice Capture service — VoiceCapture Pro pipeline.

Orchestrates: voice/photo/text -> fully classified Work Request.

Pipeline:
  1. Resolve raw text (client must transcribe audio beforehand)
  2. Extract equipment tag from hint or text
  3. AI classification via Claude (with keyword-based fallback)
  4. Image analysis via Claude Vision (if image provided)
  5. Persist FieldCaptureModel + WorkRequestModel
  6. Create supervisor notification
  7. Return structured result
"""

import json
import logging
import os
import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from api.database.models import (
    FieldCaptureModel,
    NotificationModel,
    WorkRequestModel,
)
from api.services.audit_service import log_action
from api.services.capture_service import _extract_equipment_tag, _run_image_analysis
from api.services.work_request_service import compute_sla_deadline, derive_work_class

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# AI classification via Claude
# ---------------------------------------------------------------------------

def _classify_with_claude(raw_text: str, equipment_tag: str | None) -> dict:
    """Call Claude to classify the failure description. Returns parsed dict."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.info("ANTHROPIC_API_KEY not set — using fallback classification")
        return _fallback_classify(raw_text)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        equip_ctx = f"Equipo: {equipment_tag}" if equipment_tag else ""
        prompt = f"""Eres un experto en mantenimiento industrial SAP PM.
Un técnico describió esta falla: "{raw_text}"
{equip_ctx}

Clasifica la falla eligiendo EXACTAMENTE uno de los valores listados abajo.

CATALOGO (debes elegir exactamente uno de los valores de cada lista):

MECANICO:
  partes: RODAMIENTOS, SELLOS MECANICOS, ACOPLES, EJES, ENGRANAJES, CORREAS, BOMBAS, VALVULAS, FILTROS
  sintomas: ALTA VIBRACION, ALTA TEMPERATURA, RUIDO ANORMAL, TRABADO, SIN FLUJO, FILTRACION, DESGASTE VISIBLE, FUGA ACEITE, ATASCAMIENTO
  causas: DESGASTE, FALTA LUBRICACION, CORROSION, DESALINEADO, OBSTRUIDO, SOBRECARGA, FATIGA, MONTAJE INCORRECTO

ELECTRICO:
  partes: MOTOR ELECTRICO, CABLES / CONDUCTORES, PROTECCIONES, TABLERO ELECTRICO, VARIADOR FRECUENCIA, CONTACTOR
  sintomas: NO ARRANCA, SOBRECALENTAMIENTO, CORTOCIRCUITO, DISPARO PROTECCION, BAJA AISLACION, OPERACION INTERMITENTE, CONSUMO EXCESIVO
  causas: PERDIDA AISLACION, DESGASTE, SUELTO, SOBRECARGA ELECTRICA, HUMEDAD, CALENTAMIENTO EXCESIVO

INSTRUMENTACION:
  partes: SENSOR / TRANSDUCTOR, TRANSMISOR, VALVULA DE CONTROL, PLC / DCS, ACTUADOR, POSICIONADOR
  sintomas: LECTURA ERRONEA, SIN SENAL, SENAL INESTABLE, NO RESPONDE, ALARMA FALSA, COMUNICACION PERDIDA
  causas: DESCALIBRADO, CONTAMINADO, PERDIDA PARAMETROS, PERDIDA COMUNICACION, OBSTRUCCION

Responde SOLO con un JSON con estas claves exactas:
{{
  "failure_category": "uno de: MECANICO, ELECTRICO, INSTRUMENTACION",
  "failure_object_part": "copia exacta de uno de los valores de partes del catalogo",
  "failure_symptom": "copia exacta de uno de los valores de sintomas del catalogo",
  "failure_cause": "copia exacta de uno de los valores de causas del catalogo",
  "suggested_action": "acción de mantenimiento recomendada (max 80 chars, texto libre)",
  "priority": "P1, P2, P3 o P4",
  "activity_class": "uno de: EM, UC, PR, PM",
  "work_conditions": "condiciones de seguridad necesarias para ejecutar el trabajo (max 100 chars, ej: Equipo bloqueado LOTO, area despejada, permiso trabajo en caliente)"
}}"""

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0:
            return json.loads(text[start:end])
        log.warning("Claude response did not contain JSON — using fallback")
        return _fallback_classify(raw_text)
    except Exception as exc:
        log.warning("Claude classification failed: %s — using fallback", exc)
        return _fallback_classify(raw_text)


def _fallback_classify(raw_text: str) -> dict:
    """Keyword-based fallback classification when Claude is unavailable."""
    text_lower = raw_text.lower()

    # Detect category
    category = "MECANICO"
    if any(k in text_lower for k in ("motor", "cable", "tablero", "variador", "cortocircuito", "aislacion")):
        category = "ELECTRICO"
    elif any(k in text_lower for k in ("sensor", "transmisor", "plc", "señal", "senal", "calibr")):
        category = "INSTRUMENTACION"

    # Detect priority
    priority = "P3"
    if any(k in text_lower for k in ("emergencia", "peligro", "incendio", "explosion", "emergency", "danger", "fire")):
        priority = "P1"
    elif any(k in text_lower for k in ("urgente", "critico", "crítico", "parado", "parada", "urgent", "critical")):
        priority = "P2"

    # Detect symptom
    symptom = "DESGASTE VISIBLE"
    if any(k in text_lower for k in ("vibra", "vibración")):
        symptom = "ALTA VIBRACION"
    elif any(k in text_lower for k in ("temperatura", "caliente", "hot", "overheat")):
        symptom = "ALTA TEMPERATURA"
    elif any(k in text_lower for k in ("ruido", "noise")):
        symptom = "RUIDO ANORMAL"
    elif any(k in text_lower for k in ("fuga", "leak")):
        symptom = "FILTRACION"
    elif any(k in text_lower for k in ("bloqueado", "trabado", "atascado", "clogged")):
        symptom = "TRABADO"

    activity_class = "EM" if priority in ("P1", "P2") else "PR"

    return {
        "failure_category": category,
        "failure_object_part": "BOMBAS" if "bomb" in text_lower else "RODAMIENTOS",
        "failure_symptom": symptom,
        "failure_cause": "DESGASTE",
        "suggested_action": "Inspeccionar y evaluar condicion del componente",
        "priority": priority,
        "activity_class": activity_class,
        "work_conditions": "Equipo bloqueado LOTO, area despejada",
        "estimated_duration": 4.0,
    }


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def process_voice_capture(
    db: Session,
    text_input: str | None = None,
    audio_base64: str | None = None,
    image_base64: str | None = None,
    equipment_tag_hint: str | None = None,
    plant_id: str = "OCP-JFC1",
    technician_id: str = "UNKNOWN",
    language: str = "es",
) -> dict:
    """Process a VoiceCapture Pro submission into a fully classified Work Request.

    Parameters
    ----------
    db : Session
        SQLAlchemy database session.
    text_input : str, optional
        Free-text description (already transcribed if from voice).
    audio_base64 : str, optional
        Base64-encoded audio — NOT transcribed here; client must call
        ``/api/v1/transcribe/audio`` first and pass the result as *text_input*.
    image_base64 : str, optional
        Base64 data-URL image from the technician's camera.
    equipment_tag_hint : str, optional
        Equipment tag provided by the technician (e.g. from a scanned QR).
    plant_id : str
        SAP plant code (default ``OCP-JFC1``).
    technician_id : str
        Technician SAP ID.
    language : str
        Language code (default ``es``).

    Returns
    -------
    dict
        Structured result with capture_id, work_request_id, classification, etc.
    """

    # ── Step 1: Resolve raw text ──────────────────────────────────────────
    if text_input:
        raw_text = text_input.strip()
    elif audio_base64:
        raise HTTPException(
            status_code=400,
            detail="text_input is required — transcribe audio on the client first",
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="text_input is required",
        )

    # ── Step 2: Extract equipment tag ─────────────────────────────────────
    if equipment_tag_hint:
        equipment_tag = equipment_tag_hint.strip().upper()
        confidence = 0.9
    else:
        extracted = _extract_equipment_tag(raw_text)
        if extracted:
            equipment_tag = extracted
            confidence = 0.7
        else:
            equipment_tag = "UNKNOWN"
            confidence = 0.0

    # ── Step 3: AI classification ─────────────────────────────────────────
    ai_result = _classify_with_claude(raw_text, equipment_tag if equipment_tag != "UNKNOWN" else None)
    priority_code = ai_result.get("priority", "P3")
    work_class = derive_work_class(priority_code)

    ai_classification = {
        **ai_result,
        "plant_id": plant_id,
        "estimated_duration_hours": ai_result.get("estimated_duration", 4.0),
        "priority_suggested": ai_result.get("priority", "P3"),
        "work_order_type": ai_result.get("activity_class", "PM03"),
    }

    # ── Step 4: Image analysis (if provided) ──────────────────────────────
    image_analysis = None
    if image_base64:
        image_analysis_raw = _run_image_analysis(
            image_base64,
            context_hint=equipment_tag if equipment_tag != "UNKNOWN" else None,
        )
        if image_analysis_raw is not None:
            # Convert to dict if it's a Pydantic model
            if hasattr(image_analysis_raw, "model_dump"):
                image_analysis = image_analysis_raw.model_dump(mode="json")
            elif isinstance(image_analysis_raw, dict):
                image_analysis = image_analysis_raw
            else:
                image_analysis = {"raw": str(image_analysis_raw)}

    # ── Step 5: Persist FieldCaptureModel ─────────────────────────────────
    capture_id = f"CAP-{uuid.uuid4().hex[:8].upper()}"
    capture_model = FieldCaptureModel(
        capture_id=capture_id,
        technician_id=technician_id,
        capture_type="VOICE" if audio_base64 else "TEXT",
        language=language,
        raw_text=raw_text,
        raw_voice_text=raw_text if audio_base64 else None,
        images=None,
        equipment_tag_manual=equipment_tag_hint,
        location_hint=None,
        created_at=datetime.now(),
    )
    db.add(capture_model)
    log_action(db, "field_capture", capture_id, "CREATE")

    # ── Step 6: Create WorkRequestModel ───────────────────────────────────
    request_id = f"WR-{uuid.uuid4().hex[:8].upper()}"
    sla_deadline = compute_sla_deadline(priority_code)

    wr = WorkRequestModel(
        request_id=request_id,
        source_capture_id=capture_id,
        status="DRAFT",
        equipment_id=equipment_tag,
        equipment_tag=equipment_tag,
        equipment_confidence=confidence,
        problem_description={
            "original_text": raw_text,
            "structured_description": raw_text[:300],
        },
        ai_classification=ai_classification,
        spare_parts=[],
        image_analysis=image_analysis,
        validation={"source": "VOICE_CAPTURE_PRO", "auto_classified": True},
        priority_code=priority_code,
        work_class=work_class,
        sla_deadline=sla_deadline,
        created_at=datetime.now(),
    )
    db.add(wr)
    log_action(db, "work_request", request_id, "CREATE")

    # ── Step 7: Supervisor notification ───────────────────────────────────
    try:
        notification = NotificationModel(
            notification_type="VOICE_CAPTURE_WR",
            level="INFO" if priority_code in ("P3", "P4") else "WARNING",
            plant_id=plant_id,
            equipment_id=equipment_tag if equipment_tag != "UNKNOWN" else None,
            title=f"Nueva OT desde VoiceCapture: {request_id}",
            message=(
                f"Técnico {technician_id} reportó: {raw_text[:200]}. "
                f"Prioridad: {priority_code}, Equipo: {equipment_tag}"
            ),
            acknowledged=False,
            created_at=datetime.now(),
            channel="IN_APP",
        )
        db.add(notification)
        log.info("Created supervisor notification for WR %s", request_id)
    except Exception as exc:
        log.warning("Could not create notification: %s", exc)

    # ── Step 8: Commit and return ─────────────────────────────────────────
    db.commit()

    return {
        "capture_id": capture_id,
        "work_request_id": wr.request_id,
        "status": "DRAFT",
        "equipment_tag": equipment_tag,
        "equipment_confidence": confidence,
        "priority_code": priority_code,
        "sla_deadline": wr.sla_deadline.isoformat() if wr.sla_deadline else None,
        "work_class": work_class,
        "classification": ai_classification,
        "image_analysis_available": image_analysis is not None,
    }
