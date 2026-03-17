"""Capture service — processes field captures into structured work requests.

Pipeline:
  1. Persist raw capture
  2. If image attached → Claude Vision (ImageAnalysisService)
  3. Deterministic processor (FieldCaptureProcessor)
  4. If low confidence → Claude LLM enhancement (LLMCaptureEnhancer)
  5. Persist WorkRequest
"""

import base64
import logging
import re
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from api.database.models import FieldCaptureModel, WorkRequestModel
from api.services.audit_service import log_action

logger = logging.getLogger(__name__)

# Try importing the full processor pipeline; fall back gracefully if unavailable
try:
    from tools.processors.pii_redactor import redact
    from tools.processors.field_capture_processor import FieldCaptureProcessor
    from tools.models.schemas import FieldCaptureInput, CaptureType, Language
    _PROCESSOR_AVAILABLE = True
except Exception as exc:
    logger.warning("Field capture processor not available: %s — using fallback", exc)
    _PROCESSOR_AVAILABLE = False

# Try importing LLM enhancer (Claude for low-confidence captures)
try:
    from tools.processors.llm_capture_enhancer import LLMCaptureEnhancer, get_llm_enhancer
    _LLM_ENHANCER_AVAILABLE = True
except Exception as exc:
    logger.warning("LLM capture enhancer not available: %s", exc)
    _LLM_ENHANCER_AVAILABLE = False

# Try importing image analyzer (Claude Vision)
try:
    from tools.processors.image_analyzer import ImageAnalysisService, get_image_analysis_service
    _IMAGE_ANALYZER_AVAILABLE = True
except Exception as exc:
    logger.warning("Image analyzer not available: %s", exc)
    _IMAGE_ANALYZER_AVAILABLE = False


def _extract_equipment_tag(text: str) -> str | None:
    """Extract equipment tag from free text using common industrial patterns."""
    match = re.search(r'\b([A-Z]{1,5}(?:-[A-Z0-9]{1,6}){1,5})\b', text)
    return match.group(1) if match else None


def _parse_data_url(data_url: str) -> tuple[bytes, str] | None:
    """Parse a base64 data-URL into (bytes, mime_type). Returns None on failure."""
    try:
        # Format: data:image/jpeg;base64,/9j/4AAQ...
        match = re.match(r'^data:(image/\w+);base64,(.+)$', data_url, re.DOTALL)
        if not match:
            return None
        mime_type = match.group(1)
        image_bytes = base64.b64decode(match.group(2))
        return image_bytes, mime_type
    except Exception:
        return None


def _run_image_analysis(image_data: str, context_hint: str | None = None) -> dict | None:
    """Run Claude Vision on a base64 image. Returns ImageAnalysis dict or None."""
    if not _IMAGE_ANALYZER_AVAILABLE:
        logger.info("Image analyzer not available, skipping image analysis")
        return None

    parsed = _parse_data_url(image_data)
    if not parsed:
        logger.warning("Could not parse image data URL")
        return None

    image_bytes, mime_type = parsed
    try:
        service = get_image_analysis_service()
        result = service.analyze(image_bytes, mime_type, context_hint=context_hint)
        logger.info(
            "Image analysis complete: component=%s, anomalies=%d, severity=%s",
            result.component_identified, len(result.anomalies_detected),
            result.severity_visual.value if result.severity_visual else "unknown",
        )
        return result
    except Exception as exc:
        logger.warning("Image analysis failed: %s", exc)
        return None


def _fallback_process(data: dict, capture_id: str) -> dict:
    """Lightweight fallback when the full processor chain is unavailable."""
    raw_text = data.get("raw_text_input") or data.get("raw_voice_text") or ""
    equip_tag = data.get("equipment_tag_manual") or _extract_equipment_tag(raw_text) or "UNKNOWN"
    text_lower = raw_text.lower()

    # Bilingual keyword-based failure mode detection (EN + ES)
    mechanism = None
    if any(k in text_lower for k in ("vibration", "vibrating", "vibración", "vibracion", "bearing", "rodamiento")):
        mechanism = "WEARS"
    elif any(k in text_lower for k in ("corrosion", "rust", "corroded", "corrosión", "oxidado", "óxido")):
        mechanism = "CORRODES"
    elif any(k in text_lower for k in ("crack", "fracture", "fatigue", "grieta", "fisura", "fatiga")):
        mechanism = "CRACKS"
    elif any(k in text_lower for k in ("overheat", "hot", "burn", "melted", "sobrecalentamiento", "caliente", "quemado", "temperatura")):
        mechanism = "OVERHEATS"
    elif any(k in text_lower for k in ("leak", "leaking", "seal", "fuga", "derrame", "sello")):
        mechanism = "WEARS"
    elif any(k in text_lower for k in ("block", "clogged", "plugged", "bloqueado", "obstruido", "tapado")):
        mechanism = "BLOCKS"

    # Bilingual priority detection (EN + ES)
    priority = "3_NORMAL"
    if any(k in text_lower for k in ("emergency", "danger", "safety", "fire", "emergencia", "peligro", "incendio", "explosión")):
        priority = "1_EMERGENCY"
    elif any(k in text_lower for k in ("urgent", "critical", "stopped", "urgente", "crítico", "critico", "alta", "parado", "parada")):
        priority = "2_URGENT"

    wo_type = "PM03_CORRECTIVE" if mechanism in ("CRACKS", "OVERHEATS") else "PM02_PREVENTIVE" if mechanism else "PM01_INSPECTION"

    return {
        "request_id": f"WR-{uuid.uuid4().hex[:8].upper()}",
        "status": "DRAFT",
        "equipment_tag": equip_tag,
        "equipment_confidence": 0.75 if equip_tag != "UNKNOWN" else 0.0,
        "failure_mode_detected": mechanism,
        "priority_suggested": priority,
        "work_order_type": wo_type,
        "estimated_duration": 4.0 if mechanism else 2.0,
        "production_impact": "HIGH" if priority == "1_EMERGENCY" else "MEDIUM",
        "structured_description": raw_text[:300],
        "spare_parts": [],
    }


def process_capture(db: Session, data: dict) -> dict:
    """Process a field capture: persist raw capture, run processor, persist work request."""
    capture_id = f"CAP-{uuid.uuid4().hex[:8].upper()}"
    raw_text = data.get("raw_text_input") or data.get("raw_voice_text") or ""
    equip_manual = data.get("equipment_tag_manual") or _extract_equipment_tag(raw_text)
    capture_type = data.get("capture_type", "TEXT")
    image_data = data.get("image_data")  # base64 data-URL from camera

    # ── Step 1: Analyze image with Claude Vision if present ──
    image_analysis_result = None
    if image_data and capture_type == "IMAGE":
        image_analysis_result = _run_image_analysis(image_data, context_hint=equip_manual)

    # Persist raw capture
    capture_model = FieldCaptureModel(
        capture_id=capture_id,
        technician_id=data.get("technician_id", "UNKNOWN"),
        capture_type=capture_type,
        language=data.get("language", "en"),
        raw_text=raw_text,
        raw_voice_text=data.get("raw_voice_text"),
        images=None,
        equipment_tag_manual=equip_manual,
        location_hint=data.get("location_hint"),
        created_at=datetime.now(),
    )
    db.add(capture_model)
    log_action(db, "field_capture", capture_id, "CREATE")

    # ── Step 2: Deterministic processor ──
    if _PROCESSOR_AVAILABLE:
        try:
            # Use TEXT type for the deterministic processor even if image was
            # attached — images are analyzed separately by Claude Vision.
            # The FieldCaptureInput validator rejects IMAGE type with empty images list.
            processor_type = CaptureType.TEXT if raw_text else CaptureType(capture_type)
            capture_input = FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id=data.get("technician_id", "UNKNOWN"),
                technician_name=data.get("technician_name", "Unknown"),
                capture_type=processor_type,
                language_detected=Language(data.get("language", "en")),
                raw_voice_text=data.get("raw_voice_text"),
                raw_text_input=raw_text or "Image observation",
                images=[],
                equipment_tag_manual=equip_manual,
                location_hint=data.get("location_hint"),
            )

            from api.database.models import HierarchyNodeModel
            nodes = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.node_type == "EQUIPMENT"
            ).all()
            equipment_registry = [
                {
                    "equipment_id": n.node_id,
                    "tag": n.tag or n.code,
                    "description": n.name,
                    "description_fr": n.name_fr or "",
                    "aliases": [n.name] if n.name else [],
                    "criticality": getattr(n, "criticality", None) or "B",
                }
                for n in nodes
            ]

            # Also load SAP mock equipment data if available
            try:
                import json
                import os
                sap_dir = os.environ.get("SAP_MOCK_DIR", "sap_mock/data")
                sap_file = os.path.join(sap_dir, "equipment_master.json")
                if os.path.exists(sap_file):
                    with open(sap_file, "r", encoding="utf-8") as f:
                        sap_equipment = json.load(f)
                    existing_tags = {e["tag"].upper() for e in equipment_registry}
                    for seq in sap_equipment:
                        tag = seq.get("EQUNR", "")
                        if tag.upper() not in existing_tags:
                            equipment_registry.append({
                                "equipment_id": tag,
                                "tag": tag,
                                "description": seq.get("EQKTX", ""),
                                "description_fr": "",
                                "aliases": [seq.get("EQKTX", "")] if seq.get("EQKTX") else [],
                                "criticality": seq.get("ABCKZ", "B"),
                            })
            except Exception as exc:
                logger.debug("SAP equipment load skipped: %s", exc)

            processor = FieldCaptureProcessor(equipment_registry)
            wr = processor.process(capture_input)

            # ── Step 3: Attach image analysis from Claude Vision ──
            if image_analysis_result:
                wr = wr.model_copy(update={"image_analysis": image_analysis_result})

            # ── Step 4: LLM Enhancement if low confidence ──
            if _LLM_ENHANCER_AVAILABLE:
                try:
                    enhancer = get_llm_enhancer()
                    if enhancer.needs_enhancement(wr):
                        logger.info("Low confidence detected — triggering Claude LLM enhancement")
                        wr = enhancer.enhance(capture_input, wr, image_analysis_result)
                except Exception as exc:
                    logger.warning("LLM enhancer skipped: %s", exc)

            wr_model = WorkRequestModel(
                request_id=wr.request_id,
                source_capture_id=capture_id,
                status=wr.status.value,
                equipment_id=wr.equipment_identification.equipment_id,
                equipment_tag=wr.equipment_identification.equipment_tag,
                equipment_confidence=wr.equipment_identification.confidence_score,
                resolution_method=wr.equipment_identification.resolution_method.value,
                problem_description=wr.problem_description.model_dump(mode="json"),
                ai_classification=wr.ai_classification.model_dump(mode="json"),
                spare_parts=[sp.model_dump(mode="json") for sp in wr.spare_parts_suggested],
                image_analysis=wr.image_analysis.model_dump(mode="json") if wr.image_analysis else None,
                validation=wr.validation.model_dump(mode="json"),
                created_at=datetime.now(),
            )
            db.add(wr_model)
            log_action(db, "work_request", wr_model.request_id, "CREATE")
            db.commit()

            return {
                "capture_id": capture_id,
                "work_request_id": wr.request_id,
                "status": wr.status.value,
                "equipment_tag": wr.equipment_identification.equipment_tag,
                "equipment_confidence": wr.equipment_identification.confidence_score,
                "failure_mode_detected": wr.problem_description.failure_mode_detected,
                "failure_mode_code": wr.problem_description.failure_mode_code,
                "affected_component": wr.problem_description.affected_component,
                "priority_suggested": wr.ai_classification.priority_suggested.value,
                "estimated_duration": wr.ai_classification.estimated_duration_hours,
                "work_order_type": wr.ai_classification.work_order_type.value,
                "safety_flags": wr.ai_classification.safety_flags,
                "production_impact": "HIGH" if wr.ai_classification.safety_flags else "MEDIUM",
                "spare_parts_count": len(wr.spare_parts_suggested),
                "spare_parts": [
                    {
                        "code": sp.sap_material_code,
                        "desc": sp.description,
                        "qty": sp.quantity_needed,
                        "status": sp.availability_status.value if hasattr(sp.availability_status, 'value') else "UNKNOWN",
                    }
                    for sp in wr.spare_parts_suggested
                ],
                "image_analysis": {
                    "component_identified": wr.image_analysis.component_identified,
                    "anomalies_detected": wr.image_analysis.anomalies_detected,
                    "severity_visual": wr.image_analysis.severity_visual.value if wr.image_analysis.severity_visual else None,
                } if wr.image_analysis else None,
                "llm_enhanced": wr.equipment_identification.resolution_method.value == "LLM_ENHANCED",
            }
        except Exception as exc:
            logger.warning("Full processor failed: %s — using fallback", exc)
            db.rollback()
            # Re-add the capture model after rollback
            db.add(capture_model)

    # Fallback path
    fb = _fallback_process(data, capture_id)

    wr_model = WorkRequestModel(
        request_id=fb["request_id"],
        source_capture_id=capture_id,
        status=fb["status"],
        equipment_id=fb["equipment_tag"],
        equipment_tag=fb["equipment_tag"],
        equipment_confidence=fb["equipment_confidence"],
        resolution_method="MANUAL",
        problem_description={"original_text": raw_text, "structured_description": fb["structured_description"], "failure_mode_detected": fb["failure_mode_detected"]},
        ai_classification={"work_order_type": fb["work_order_type"], "priority_suggested": fb["priority_suggested"], "estimated_duration_hours": fb["estimated_duration"], "required_specialties": ["MECHANICAL"], "safety_flags": []},
        spare_parts=[],
        image_analysis=None,
        validation={"planner_approved": False, "modifications": []},
        created_at=datetime.now(),
    )
    db.add(wr_model)
    log_action(db, "work_request", fb["request_id"], "CREATE")
    db.commit()

    return {
        "capture_id": capture_id,
        "work_request_id": fb["request_id"],
        "status": fb["status"],
        "equipment_tag": fb["equipment_tag"],
        "equipment_confidence": fb["equipment_confidence"],
        "failure_mode_detected": fb["failure_mode_detected"],
        "priority_suggested": fb["priority_suggested"],
        "estimated_duration": fb["estimated_duration"],
        "production_impact": fb["production_impact"],
        "spare_parts_count": 0,
    }


def get_capture(db: Session, capture_id: str) -> FieldCaptureModel | None:
    return db.query(FieldCaptureModel).filter(
        FieldCaptureModel.capture_id == capture_id
    ).first()


def list_captures(db: Session) -> list[FieldCaptureModel]:
    return db.query(FieldCaptureModel).order_by(FieldCaptureModel.created_at.desc()).all()
