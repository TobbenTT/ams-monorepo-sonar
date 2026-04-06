"""Vision AI Service — Analyze equipment photos with Claude Vision + historical context."""

import os
import json
import logging
import time

log = logging.getLogger("ocp_maintenance")

_VISION_SYSTEM = """You are an expert in industrial maintenance for OCP plants (Office Cherifien des Phosphates) in Morocco.
Analyze equipment photos and return a complete JSON for the SAP PM maintenance notification.

IMPORTANT: Respond ONLY with valid JSON, no markdown or explanations.

{
  "equipment_identified": "What specific industrial equipment is visible (e.g. Centrifugal Pump, Belt Conveyor, Electric Motor, Crusher, Cyclone, etc.)",
  "failure_type": "MECHANICAL | ELECTRICAL | INSTRUMENTATION | HYDRAULIC | STRUCTURAL",
  "severity": "low | medium | high | critical",
  "whatHappens": "Concise description of the visible problem (2-3 detailed sentences in English)",
  "failureCategory": "MECHANICAL | ELECTRICAL | INSTRUMENTATION | HYDRAULIC | STRUCTURAL",
  "priority": "P1 | P2 | P3 | P4",
  "activityClass": "M001 | M002 | M003",
  "suggestedAction": "Detailed corrective action step by step",
  "failureSymptom": "Symptom from CATALOG (EXACT value)",
  "failureCause": "Cause from CATALOG (EXACT value)",
  "failureObjectPart": "Part object from catalog (EXACT value)",
  "estimatedDuration": "hours (number as string)",
  "equipmentCondition": "operating | stopped",
  "resources": [{"type": "Mechanical|Electrical|Instrumentation|Lubrication|Soldador|Crane Operator", "quantity": N, "hours": N}],
  "materials": [{"sapId": "SAP code", "description": "material", "quantity": N, "unit": "PZ|KG|LT|MT|UD"}],
  "supportEquipment": ["Crane", "Forklift", etc],
  "workConditions": "Required conditions: equipment de-energized, area cleared, etc",
  "equipmentType": "type of equipment visible"
}

SAP MATERIAL CODE RULES:
- Use realistic SAP codes format: 10XXXXXX (8 digits)
  - 10001XXX = Bearings (10001001=SKF 6208-2RS, 10001002=SKF 6310-2Z, 10001003=FAG 22220)
  - 10002XXX = Mechanical seals (10002001=Mech seal 50mm, 10002002=O-ring kit, 10002003=Graphite packing)
  - 10003XXX = Filters (10003001=Oil filter, 10003002=Air filter, 10003003=Filter element)
  - 10004XXX = Lubricants (10004001=Oil ISO VG 46, 10004002=Grease EP2, 10004003=Hydraulic oil)
  - 10005XXX = Hardware (10005001=SS Bolts M16, 10005002=Nuts M16, 10005003=Washers)
  - 10006XXX = Belts/Transmission (10006001=V-Belt, 10006002=Drive chain, 10006003=Coupling)
  - 10007XXX = Electrical (10007001=Contactor, 10007002=Thermal relay, 10007003=Cable 3x4mm2)
  - 10008XXX = Instrumentation (10008001=Pressure transmitter, 10008002=Temp sensor, 10008003=Control valve)
  - 10009XXX = Paint/Protection (10009001=Anti-corrosion paint, 10009002=Epoxy primer)
  - 10010XXX = Structural (10010001=Steel plate, 10010002=Angle profile, 10010003=Welding E7018)

SUPPORT EQUIPMENT RULES:
- Always evaluate need for: Crane, Forklift, Scaffold, Lift Platform, Compressor, Welder, Pressure Washer
- For heavy pumps: "Mobile Crane 5 ton" or "Chain Hoist 2 ton"
- For height work: "Scaffold" or "Lift Platform"
- For cleaning: "Industrial Pressure Washer"

WORK CONDITIONS:
- Always specify: equipment energized/de-energized, area cleared, required permits
- Example: "Equipment de-energized and locked out (LOTO). Area cleared 3m around. Hot work permit if welding needed. PPE: hard hat, gloves, safety glasses, steel-toe boots."

FAILURE CATALOG (MANDATORY - use EXACTLY these values, NO free text):

MECHANICAL:
  parts: BEARINGS, MECHANICAL SEALS, COUPLINGS, SHAFTS, GEARS, BELTS, PUMPS, VALVES, FILTERS, IMPELLER, REDUCER/GEARBOX, PISTON/CYLINDER, LINER/WEAR PLATE, CRUSHER JAW, CONVEYOR IDLER, SCREEN PANEL, CYCLONE, AGITATOR, COMPRESSOR, HEAT EXCHANGER, TANK/VESSEL, PIPING, HYDRAULIC CYLINDER, PNEUMATIC ACTUATOR
  symptoms: HIGH VIBRATION, HIGH TEMPERATURE, ABNORMAL NOISE, SEIZED, NO FLOW, LEAKAGE, VISIBLE WEAR, OIL LEAK, BLOCKAGE, CAVITATION, LOW PRESSURE, EXCESSIVE PLAY, MISALIGNMENT DETECTED, ABNORMAL OIL ANALYSIS, REDUCED OUTPUT
  causes: WEAR, LACK OF LUBRICATION, CORROSION, MISALIGNMENT, BLOCKED, OVERLOAD, FATIGUE, INCORRECT ASSEMBLY, CAVITATION, CONTAMINATION, THERMAL STRESS, ABRASION, EROSION, IMPACT, VIBRATION DAMAGE, SEAL FAILURE, BEARING FAILURE

ELECTRICAL:
  parts: ELECTRIC MOTOR, CABLES / CONDUCTORS, PROTECTIONS, ELECTRICAL PANEL, VARIABLE FREQUENCY DRIVE, CONTACTOR, TRANSFORMER, SWITCHGEAR, CIRCUIT BREAKER, RELAY, BUSBAR, CAPACITOR BANK, UPS, GENERATOR, SOFT STARTER, POWER SUPPLY
  symptoms: WONT START, OVERHEATING, SHORT CIRCUIT, PROTECTION TRIP, LOW INSULATION, INTERMITTENT OPERATION, EXCESSIVE CONSUMPTION, ARC FLASH, VOLTAGE DROP, GROUND FAULT, PHASE IMBALANCE, HARMONIC DISTORTION
  causes: INSULATION LOSS, WEAR, LOOSE CONNECTION, ELECTRICAL OVERLOAD, MOISTURE, EXCESSIVE HEATING, ELECTRICAL SURGE, SHORT CIRCUIT, AGING, CONTAMINATION, INCORRECT WIRING, HARMONIC DAMAGE

INSTRUMENTATION:
  parts: SENSOR / TRANSDUCER, TRANSMITTER, CONTROL VALVE, PLC / DCS, ACTUATOR, POSITIONER, FLOW METER, LEVEL SENSOR, PRESSURE GAUGE, TEMPERATURE PROBE, ANALYZER, SOLENOID VALVE, I/P CONVERTER, SAFETY RELAY, PROXIMITY SWITCH, ENCODER
  symptoms: ERRONEOUS READING, NO SIGNAL, UNSTABLE SIGNAL, NOT RESPONDING, FALSE ALARM, LOST COMMUNICATION, DRIFT, STUCK VALUE, INTERMITTENT SIGNAL, DELAYED RESPONSE
  causes: OUT OF CALIBRATION, CONTAMINATED, PARAMETER LOSS, COMMUNICATION LOSS, OBSTRUCTION, CORROSION, VIBRATION DAMAGE, ELECTRICAL INTERFERENCE, MEMBRANE DAMAGE, BLOCKED IMPULSE LINE

HYDRAULIC:
  parts: HYDRAULIC PUMP, HYDRAULIC CYLINDER, DIRECTIONAL VALVE, PRESSURE RELIEF VALVE, ACCUMULATOR, HYDRAULIC MOTOR, FILTER, RESERVOIR, HOSE / FITTING, MANIFOLD
  symptoms: LOW PRESSURE, OVERHEATING, LEAKAGE, SLOW RESPONSE, CAVITATION NOISE, FOAMING, CONTAMINATED OIL, CYLINDER DRIFT
  causes: CONTAMINATION, SEAL WEAR, CAVITATION, OVERHEATING, AIR IN SYSTEM, INCORRECT FLUID, EXCESSIVE PRESSURE, INTERNAL LEAKAGE

STRUCTURAL:
  parts: STEEL STRUCTURE, FOUNDATION, SUPPORT BEAM, PLATFORM / WALKWAY, HANDRAIL / GUARD, HOPPER / CHUTE, DUCT / ENCLOSURE, ANCHOR BOLT
  symptoms: CRACK DETECTED, DEFORMATION, CORROSION VISIBLE, BOLT LOOSENING, FOUNDATION SETTLEMENT, EXCESSIVE DEFLECTION
  causes: FATIGUE, CORROSION, OVERLOAD, IMPACT, VIBRATION, POOR WELDING, SETTLEMENT, THERMAL EXPANSION

RULE: failureSymptom, failureCause and failureObjectPart MUST be exact copies from the catalog above.
DO NOT use free text for these fields. Choose the closest catalog value.

SEVERITY RULES:
- critical = immediate danger, equipment stopped, production halted -> P1
- high = significant risk, degraded performance, needs attention < 7 days -> P2
- medium = noticeable issue, can wait for scheduled maintenance -> P3
- low = minor issue, cosmetic, next plant shutdown -> P4

Priority rules:
- P1 = emergency/immediate stop, P2 = urgent (<7 days), P3 = normal (>7 days), P4 = plant shutdown
- P1/P2 -> activityClass M002, P3/P4 -> M001
"""


def _parse_image(img_b64):
    media_type = "image/jpeg"
    if img_b64.startswith("data:"):
        header, img_b64 = img_b64.split(",", 1)
        if "png" in header:
            media_type = "image/png"
        elif "webp" in header:
            media_type = "image/webp"
        elif "gif" in header:
            media_type = "image/gif"
    return media_type, img_b64


def analyze_images(images_base64: list, equipment_tag: str = "", additional_context: str = "", db=None) -> dict:
    """Analyze equipment photos with Claude Vision + historical context."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY not configured", "suggestions": {}}

    start = time.time()

    # Build historical context
    context_str = ""
    if equipment_tag and db:
        try:
            from api.services import context_builder_service as ctx_builder
            ctx = ctx_builder.build_equipment_context(db, equipment_tag)
            context_str = ctx_builder.format_context_for_prompt(ctx)
            if context_str:
                log.info(f"Vision AI: injecting {len(context_str)} chars context for {equipment_tag}")
        except Exception as e:
            log.warning(f"Vision AI: context builder failed: {e}")

    system = _VISION_SYSTEM
    if context_str:
        system += "\n\n--- EQUIPMENT HISTORY ---\n" + context_str
        system += "\nUse materials and durations from history as reference."

    # Build content blocks
    content = []
    for img_b64 in images_base64:
        media_type, raw = _parse_image(img_b64)
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": raw},
        })

    n = len(images_base64)
    text = f"Analyze {'these ' + str(n) + ' photos' if n > 1 else 'this photo'} of OCP plant equipment. Return complete JSON including: what equipment this is, what failure/anomaly you see, severity assessment, SAP materials with codes, support equipment, and work conditions."
    if equipment_tag:
        text += f"\nEquipment tag: {equipment_tag}"
    if additional_context:
        text += f"\nTechnician context: {additional_context}"

    content.append({"type": "text", "text": text})

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system,
            messages=[{"role": "user", "content": content}],
        )
        raw = response.content[0].text.strip()
        duration_ms = int((time.time() - start) * 1000)
        log.info(f"Vision AI ({n} imgs, ctx={'yes' if context_str else 'no'}) in {duration_ms}ms")

        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        suggestions = json.loads(raw)

        prio = suggestions.get("priority", "P3")
        if prio in ("P1", "P2"):
            suggestions["activityClass"] = "M002"
        elif "activityClass" not in suggestions:
            suggestions["activityClass"] = "M001"

        # Ensure severity maps to priority consistently
        severity = suggestions.get("severity", "medium")
        severity_priority_map = {"critical": "P1", "high": "P2", "medium": "P3", "low": "P4"}
        if severity in severity_priority_map and "priority" not in suggestions:
            suggestions["priority"] = severity_priority_map[severity]

        return {
            "suggestions": suggestions,
            "confidence": 0.85,
            "source": "vision_ai",
            "has_context": bool(context_str),
            "images_count": n,
            "duration_ms": duration_ms,
        }

    except json.JSONDecodeError as e:
        log.error(f"Vision AI JSON parse error: {e}, raw: {raw[:200]}")
        return {"error": "Failed to parse AI response", "raw": raw[:500], "suggestions": {}}
    except Exception as e:
        log.error(f"Vision AI error: {e}")
        return {"error": str(e), "suggestions": {}}


def analyze_image(image_base64: str, equipment_tag: str = "", additional_context: str = "", db=None) -> dict:
    return analyze_images([image_base64], equipment_tag, additional_context, db=db)
