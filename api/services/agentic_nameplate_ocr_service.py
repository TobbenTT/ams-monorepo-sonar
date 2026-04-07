"""Agentic Nameplate OCR Service — CU-EXT-3.

Uses Gemma 4 vision to read equipment identification plates (nameplates)
and P&ID diagrams. Can auto-update HierarchyNodeModel metadata with
extracted data.
"""

import logging
import time

from sqlalchemy.orm import Session

from api.services.ai_provider_service import analyze_image

log = logging.getLogger("ocp_maintenance")

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

_NAMEPLATE_SYSTEM_PROMPT = """You are an industrial equipment nameplate reader AI.
Analyze the photo of an equipment identification plate (nameplate) and extract
all visible data fields.

Fields to extract (report each with value and confidence 0.0-1.0):
1. manufacturer — Brand/company name
2. model — Model number or designation
3. serial_number — Serial or identification number
4. rated_power_kw — Rated power in kW
5. rated_voltage_v — Rated voltage in Volts
6. rated_current_a — Rated current in Amps
7. rpm — Rotational speed
8. frequency_hz — Electrical frequency (50/60 Hz)
9. ip_rating — Ingress protection rating (e.g., IP55)
10. weight_kg — Weight in kilograms
11. year_manufactured — Year of manufacture
12. country_of_origin — Country of manufacture
13. phase — Number of phases (1 or 3)
14. insulation_class — Insulation class (B, F, H)
15. frame_size — Frame designation

Rules:
- Nameplates may be in French, English, Arabic, or Spanish.
- If a field is illegible or not present, include it in "illegible_fields".
- Include "raw_text_detected" with ALL text visible on the plate.
- Report overall "ocr_confidence" as the average confidence across readable fields.

Respond ONLY with valid JSON. Schema:

{
  "ocr_confidence": float,
  "fields": {
    "manufacturer": {"value": "string", "confidence": float},
    "model": {"value": "string", "confidence": float},
    "serial_number": {"value": "string", "confidence": float},
    "rated_power_kw": {"value": number|null, "confidence": float},
    "rated_voltage_v": {"value": number|null, "confidence": float},
    "rated_current_a": {"value": number|null, "confidence": float},
    "rpm": {"value": number|null, "confidence": float},
    "frequency_hz": {"value": number|null, "confidence": float},
    "ip_rating": {"value": "string"|null, "confidence": float},
    "weight_kg": {"value": number|null, "confidence": float},
    "year_manufactured": {"value": number|null, "confidence": float},
    "country_of_origin": {"value": "string"|null, "confidence": float}
  },
  "illegible_fields": ["field_name", ...],
  "raw_text_detected": "string",
  "equipment_type_guess": "string (e.g., electric_motor, pump, compressor)"
}"""

_PID_SYSTEM_PROMPT = """You are an industrial P&ID diagram digitization AI.
Analyze the photo or scan of a Piping and Instrumentation Diagram (P&ID)
and extract all identifiable elements.

Extract:
1. Instrument tags (e.g., FT-101, PI-205, TIC-302, LCV-401)
2. Equipment tags (e.g., P-101, V-201, E-301, C-401)
3. Line numbers (e.g., 4"-PW-101-A1A)
4. Valve types (gate, globe, ball, butterfly, check, relief)
5. Control loops (controller-sensor-actuator connections)

Respond ONLY with valid JSON. Schema:

{
  "confidence": float,
  "instrument_tags": [{"tag": "string", "type": "string", "description": "string"}],
  "equipment_tags": [{"tag": "string", "type": "string", "name": "string"}],
  "line_numbers": [{"number": "string", "specification": "string"}],
  "valves": [{"tag": "string", "type": "string", "size": "string"}],
  "control_loops": [{"controller": "string", "sensor": "string", "actuator": "string"}],
  "notes": "string"
}"""


# ---------------------------------------------------------------------------
# Nameplate OCR
# ---------------------------------------------------------------------------

def ocr_nameplate(
    db: Session,
    image_base64: str,
    *,
    equipment_tag: str | None = None,
    node_id: str | None = None,
    auto_update_hierarchy: bool = False,
    plant_id: str = "OCP-JFC1",
    provider: str = "auto",
) -> dict:
    """Read equipment nameplate from photo and optionally update hierarchy."""
    start = time.time()

    result = analyze_image(
        images_base64=[image_base64],
        system_prompt=_NAMEPLATE_SYSTEM_PROMPT,
        user_prompt="Read all fields from this equipment nameplate. Extract every visible text.",
        provider=provider,
        equipment_tag=equipment_tag or "",
    )

    suggestions = result.get("suggestions", {})
    duration_ms = result.get("duration_ms", int((time.time() - start) * 1000))
    ai_provider = result.get("provider", "unknown")

    fields = suggestions.get("fields", {})
    ocr_confidence = suggestions.get("ocr_confidence", 0.0)

    # --- Auto-update hierarchy ---
    auto_update_applied = False
    matched_node = None
    if auto_update_hierarchy and (equipment_tag or node_id):
        auto_update_applied, matched_node = _update_hierarchy_metadata(
            db, equipment_tag, node_id, fields, ocr_confidence
        )

    return {
        "ocr_confidence": ocr_confidence,
        "fields": fields,
        "illegible_fields": suggestions.get("illegible_fields", []),
        "raw_text_detected": suggestions.get("raw_text_detected", ""),
        "equipment_type_guess": suggestions.get("equipment_type_guess", ""),
        "auto_update_applied": auto_update_applied,
        "matched_node": matched_node,
        "provider": ai_provider,
        "duration_ms": duration_ms,
    }


# ---------------------------------------------------------------------------
# P&ID Digitization
# ---------------------------------------------------------------------------

def ocr_pid_diagram(
    image_base64: str,
    *,
    provider: str = "auto",
) -> dict:
    """Digitize a P&ID diagram from photo or scan."""
    start = time.time()

    result = analyze_image(
        images_base64=[image_base64],
        system_prompt=_PID_SYSTEM_PROMPT,
        user_prompt="Digitize this P&ID diagram. Extract all instrument tags, equipment tags, line numbers, and valves.",
        provider=provider,
    )

    suggestions = result.get("suggestions", {})
    duration_ms = result.get("duration_ms", int((time.time() - start) * 1000))

    return {
        "confidence": suggestions.get("confidence", 0.0),
        "instrument_tags": suggestions.get("instrument_tags", []),
        "equipment_tags": suggestions.get("equipment_tags", []),
        "line_numbers": suggestions.get("line_numbers", []),
        "valves": suggestions.get("valves", []),
        "control_loops": suggestions.get("control_loops", []),
        "notes": suggestions.get("notes", ""),
        "provider": result.get("provider", "unknown"),
        "duration_ms": duration_ms,
    }


# ---------------------------------------------------------------------------
# Hierarchy update helper
# ---------------------------------------------------------------------------

def _update_hierarchy_metadata(
    db: Session,
    equipment_tag: str | None,
    node_id: str | None,
    fields: dict,
    ocr_confidence: float,
) -> tuple[bool, dict | None]:
    """Update HierarchyNodeModel.metadata_json with nameplate data."""
    from api.database.models import HierarchyNodeModel

    node = None
    if node_id:
        node = db.query(HierarchyNodeModel).filter_by(node_id=node_id).first()
    elif equipment_tag:
        node = db.query(HierarchyNodeModel).filter_by(tag=equipment_tag).first()

    if not node:
        log.warning("Nameplate OCR: node not found for tag=%s, node_id=%s", equipment_tag, node_id)
        return False, None

    # Build nameplate data from extracted fields
    nameplate_data = {"ocr_confidence": ocr_confidence, "ocr_date": time.strftime("%Y-%m-%d")}
    for field_name, field_info in fields.items():
        if isinstance(field_info, dict) and field_info.get("value") is not None:
            nameplate_data[field_name] = field_info["value"]

    # Merge into existing metadata_json
    metadata = node.metadata_json or {}
    metadata["nameplate"] = nameplate_data
    node.metadata_json = metadata

    try:
        db.commit()
        log.info("Nameplate OCR: updated node %s (%s) with plate data", node.node_id, node.tag)
        return True, {"node_id": node.node_id, "tag": node.tag, "name": node.name}
    except Exception as e:
        log.error("Nameplate OCR: failed to update node: %s", e)
        db.rollback()
        return False, None
