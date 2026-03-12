"""MCP tool wrappers for GAP-W13 — Expert Knowledge Capture."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.expert_knowledge_engine import ExpertKnowledgeEngine


# ── Expert Matching ──────────────────────────────────────────────────

@tool(
    "match_expert_for_diagnosis",
    "Find top 3 ranked retired experts for a diagnosis context. Input: {equipment_type_id, symptom_categories: [str], plant_id, experts: [{expert_id, domains, equipment_expertise, years_experience, resolution_count, languages, is_retired}], language_preference?}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def match_expert_for_diagnosis(input_json: str) -> str:
    data = json.loads(input_json)
    results = ExpertKnowledgeEngine.match_expert(
        equipment_type_id=data["equipment_type_id"],
        symptom_categories=data.get("symptom_categories", []),
        plant_id=data.get("plant_id", ""),
        experts=data.get("experts", []),
        language_preference=data.get("language_preference", "fr"),
    )
    return json.dumps(results, default=str)


# ── Consultation Lifecycle ────────────────────────────────────────────

@tool(
    "create_expert_consultation",
    "Create a consultation request from a troubleshooting session snapshot, generating a unique token for portal access. Input: {session: {session_id, technician_id, equipment_type_id, equipment_tag, plant_id, symptoms, candidate_diagnoses}, expert_id, ai_suggestion?, language?, ttl_hours?}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_expert_consultation(input_json: str) -> str:
    data = json.loads(input_json)
    result = ExpertKnowledgeEngine.create_consultation(
        session=data.get("session", {}),
        expert_id=data["expert_id"],
        ai_suggestion=data.get("ai_suggestion", ""),
        language=data.get("language", "fr"),
        ttl_hours=data.get("ttl_hours", 24),
    )
    return json.dumps(result, default=str)


# ── Expert Guidance Application ──────────────────────────────────────

@tool(
    "apply_expert_guidance",
    "Re-rank diagnosis candidates using expert input. Input: {consultation: {...}, expert_guidance: str, fm_codes: [str], confidence: float}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def apply_expert_guidance(input_json: str) -> str:
    data = json.loads(input_json)
    consultation = data.get("consultation", {})
    result = ExpertKnowledgeEngine.record_expert_response(
        consultation=consultation,
        expert_guidance=data.get("expert_guidance", ""),
        fm_codes=data.get("fm_codes"),
        confidence=data.get("confidence", 0.0),
    )
    return json.dumps(result, default=str)


# ── Knowledge Extraction ──────────────────────────────────────────────

@tool(
    "extract_expert_contribution",
    "Parse structured knowledge from a responded expert consultation. Extracts FM codes, diagnostic steps, corrective actions, and symptom descriptions from free text. Input: {consultation: {consultation_id, expert_id, equipment_type_id, expert_guidance, expert_fm_codes, ...}}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def extract_expert_contribution(input_json: str) -> str:
    data = json.loads(input_json)
    result = ExpertKnowledgeEngine.extract_contribution(data.get("consultation", {}))
    return json.dumps(result, default=str)


# ── Knowledge Promotion ───────────────────────────────────────────────

@tool(
    "promote_expert_knowledge",
    "Promote a validated expert contribution to knowledge base targets. Input: {contribution: {...}, targets: [str] — one or more of: symptom-catalog, decision-tree, manual, memory}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def promote_expert_knowledge(input_json: str) -> str:
    from pathlib import Path
    import os

    data = json.loads(input_json)
    contribution = data.get("contribution", {})
    targets = data.get("targets", ["manual"])

    base = Path(__file__).resolve().parents[2]
    catalog_path = base / "skills" / "00-knowledge-base" / "data-models" / "troubleshooting" / "symptom-catalog.json"
    trees_dir = base / "skills" / "00-knowledge-base" / "data-models" / "troubleshooting" / "trees"
    manuals_dir = base / "data" / "manuals"
    memory_dir = base / "templates" / "client-project" / "3-memory"

    results: dict[str, object] = {}

    if "symptom-catalog" in targets:
        r = ExpertKnowledgeEngine.promote_to_symptom_catalog(contribution, catalog_path)
        results["symptom-catalog"] = r

    if "decision-tree" in targets:
        ok = ExpertKnowledgeEngine.promote_to_decision_tree(contribution, trees_dir)
        results["decision-tree"] = {"updated": ok}

    if "manual" in targets:
        path = ExpertKnowledgeEngine.promote_to_manual(contribution, manuals_dir)
        results["manual"] = {"path": str(path)}

    if "memory" in targets:
        ExpertKnowledgeEngine.promote_to_memory(contribution, memory_dir)
        results["memory"] = {"saved": True}

    return json.dumps(results, default=str)
