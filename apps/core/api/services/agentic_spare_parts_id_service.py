"""Agentic Spare Parts Identification Service — CU-EXT-2.

Technician photographs a damaged/worn part and the AI identifies the
component type, dimensions, material, and condition. Then queries
the InventoryItemModel to find matching SAP material codes.
"""

import logging
import time

from sqlalchemy.orm import Session

from api.services.ai_provider_service import analyze_image

log = logging.getLogger("ocp_maintenance")

# ---------------------------------------------------------------------------
# System prompt — spare part identification specialist
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an industrial spare parts identification specialist AI.
Analyze the photo of a component or spare part and identify it.

You MUST determine:
1. Part type (e.g., bearing, seal, filter, belt, coupling, gasket, impeller, shaft sleeve)
2. Subtype (e.g., deep groove ball bearing, mechanical seal, cartridge filter)
3. Estimated dimensions in mm (outer diameter, inner diameter, width/length)
4. Material (steel, stainless steel, rubber, PTFE, bronze, cast iron, ceramic, etc.)
5. Current condition (new, worn, corroded, broken, cracked, pitted, deformed)

SAP Material Code Ranges (use to suggest candidate codes):
- 10001XXX: Bearings (ball, roller, thrust, plain)
- 10002XXX: Seals (mechanical, lip, o-ring, gasket)
- 10003XXX: Filters (oil, air, hydraulic, cartridge)
- 10004XXX: Belts (V-belt, timing, flat)
- 10005XXX: Couplings (flexible, rigid, fluid)
- 10006XXX: Lubricants (grease, oil, spray)
- 10007XXX: Electrical (motor parts, contactors, cables)
- 10008XXX: Hydraulic (hoses, fittings, valves)
- 10009XXX: Fasteners (bolts, nuts, washers)
- 10010XXX: Wear parts (liners, impellers, wear plates)

Rules:
- Suggest up to 3 possible SAP material code RANGES based on the identified part type.
- For dimensions, give best estimates; mark as "estimated" if uncertain.
- If the part is too damaged to identify, say so explicitly.
- confidence is 0.0 to 1.0 for the overall identification.

Respond ONLY with valid JSON, no markdown. Schema:

{
  "part_identified": {
    "type": "string",
    "subtype": "string",
    "estimated_dimensions": "string (e.g., 80mm OD x 40mm ID x 18mm W)",
    "material": "string",
    "condition": "string",
    "condition_detail": "string (specific damage observed)",
    "confidence": float
  },
  "sap_code_range": "string (e.g., 10001XXX)",
  "sap_category": "string (e.g., Bearings)",
  "search_keywords": ["keyword1", "keyword2"],
  "recommended_action": "string"
}"""

_USER_PROMPT_TEMPLATE = "Identify this spare part from the photo.{context}"


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def identify_spare_part(
    db: Session,
    image_base64: str,
    *,
    additional_context: str = "",
    equipment_tag: str = "",
    plant_id: str = "OCP-JFC1",
    provider: str = "auto",
) -> dict:
    """Identify a spare part from a photo and match against SAP inventory."""
    start = time.time()

    # Build user prompt with optional context
    context_parts = []
    if additional_context:
        context_parts.append(f" Technician notes: {additional_context}")
    if equipment_tag:
        context_parts.append(f" Equipment tag: {equipment_tag}")
        # Enrich with equipment context
        try:
            from api.services.context_builder_service import build_equipment_context
            eq_ctx = build_equipment_context(db, equipment_tag)
            if eq_ctx:
                context_parts.append(f" Equipment context: {eq_ctx}")
        except Exception:
            pass

    user_prompt = _USER_PROMPT_TEMPLATE.format(context="".join(context_parts))

    # --- AI analysis ---
    result = analyze_image(
        images_base64=[image_base64],
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        provider=provider,
        equipment_tag=equipment_tag,
    )

    suggestions = result.get("suggestions", {})
    duration_ms = result.get("duration_ms", int((time.time() - start) * 1000))
    ai_provider = result.get("provider", "unknown")

    part_info = suggestions.get("part_identified", {})
    sap_range = suggestions.get("sap_code_range", "")
    keywords = suggestions.get("search_keywords", [])

    # --- Inventory lookup ---
    sap_candidates = _search_inventory(db, sap_range, keywords)

    return {
        "part_identified": part_info,
        "sap_code_range": sap_range,
        "sap_category": suggestions.get("sap_category", ""),
        "sap_candidates": sap_candidates,
        "search_keywords": keywords,
        "recommended_action": suggestions.get("recommended_action", ""),
        "provider": ai_provider,
        "duration_ms": duration_ms,
    }


# ---------------------------------------------------------------------------
# Inventory search
# ---------------------------------------------------------------------------

def _search_inventory(db: Session, sap_range: str, keywords: list[str]) -> list[dict]:
    """Search InventoryItemModel for matching parts."""
    from api.database.models import InventoryItemModel

    candidates = []

    # Search by SAP code range prefix (e.g., "10001" from "10001XXX")
    prefix = sap_range.replace("X", "").replace("x", "") if sap_range else ""
    if prefix and len(prefix) >= 4:
        items = (
            db.query(InventoryItemModel)
            .filter(InventoryItemModel.material_code.like(f"{prefix}%"))
            .limit(20)
            .all()
        )
        for item in items:
            score = _match_score(item.description or "", keywords)
            candidates.append({
                "material_code": item.material_code,
                "description": item.description,
                "match_score": round(score, 2),
                "in_stock": (item.quantity_available or 0) > 0,
                "quantity_available": item.quantity_available or 0,
                "warehouse_id": item.warehouse_id,
            })

    # Also search by keyword in description if few results
    if len(candidates) < 3 and keywords:
        for kw in keywords[:3]:
            kw_items = (
                db.query(InventoryItemModel)
                .filter(InventoryItemModel.description.ilike(f"%{kw}%"))
                .limit(10)
                .all()
            )
            existing_codes = {c["material_code"] for c in candidates}
            for item in kw_items:
                if item.material_code not in existing_codes:
                    score = _match_score(item.description or "", keywords)
                    candidates.append({
                        "material_code": item.material_code,
                        "description": item.description,
                        "match_score": round(score, 2),
                        "in_stock": (item.quantity_available or 0) > 0,
                        "quantity_available": item.quantity_available or 0,
                        "warehouse_id": item.warehouse_id,
                    })

    # Sort by match score descending
    candidates.sort(key=lambda c: c["match_score"], reverse=True)
    return candidates[:10]


def _match_score(description: str, keywords: list[str]) -> float:
    """Simple keyword overlap scoring for inventory descriptions."""
    if not keywords or not description:
        return 0.0
    desc_lower = description.lower()
    matches = sum(1 for kw in keywords if kw.lower() in desc_lower)
    return matches / len(keywords) if keywords else 0.0
