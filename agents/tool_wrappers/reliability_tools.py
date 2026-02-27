"""MCP tool wrappers for Phase 5 — Advanced Reliability Engineering."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.spare_parts_engine import SparePartsEngine
from tools.engines.shutdown_engine import ShutdownEngine
from tools.engines.moc_engine import MoCEngine
from tools.engines.ocr_engine import OCREngine
from tools.engines.jackknife_engine import JackKnifeEngine
from tools.engines.pareto_engine import ParetoEngine
from tools.engines.lcc_engine import LCCEngine
from tools.engines.rbi_engine import RBIEngine
from tools.models.schemas import (
    OCRAnalysisInput, LCCInput,
    ShutdownEvent, ShutdownStatus,
    MoCRequest, MoCStatus, MoCCategory, RiskLevel,
    DamageMechanism,
)


# ── Spare Parts ──────────────────────────────────────────────────────

@tool(
    "analyze_spare_parts",
    "Run VED/FSN/ABC analysis on spare parts. Input: {plant_id, parts: [{part_id, equipment_id, equipment_criticality, failure_impact, movements_per_year, annual_cost, unit_cost, daily_consumption, lead_time_days}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def analyze_spare_parts(input_json: str) -> str:
    data = json.loads(input_json)
    result = SparePartsEngine.optimize_inventory(data["plant_id"], data.get("parts", []))
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "calculate_stock_levels",
    "Calculate min/max/reorder stock levels. Input: {daily_consumption, lead_time_days, service_level}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_stock_levels(input_json: str) -> str:
    data = json.loads(input_json)
    result = SparePartsEngine.calculate_stock_levels(
        data["daily_consumption"], data["lead_time_days"],
        data.get("service_level", 0.95),
    )
    return json.dumps(result)


# ── Shutdowns ────────────────────────────────────────────────────────

@tool(
    "create_shutdown",
    "Create a planned shutdown event. Input: {plant_id, name, planned_start, planned_end, work_orders}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_shutdown(input_json: str) -> str:
    data = json.loads(input_json)
    from datetime import datetime
    event = ShutdownEngine.create_shutdown(
        data["plant_id"], data["name"],
        datetime.fromisoformat(data["planned_start"]),
        datetime.fromisoformat(data["planned_end"]),
        data.get("work_orders", []),
    )
    return json.dumps(event.model_dump(mode="json"), default=str)


@tool(
    "update_shutdown_progress",
    "Update shutdown progress with completed WOs and delays. Input: {shutdown (event dict), completed_wos, delay_hours, delay_reasons}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def update_shutdown_progress(input_json: str) -> str:
    data = json.loads(input_json)
    event = ShutdownEvent(**data["shutdown"])
    event = ShutdownEngine.update_progress(
        event, data.get("completed_wos", []),
        data.get("delay_hours", 0), data.get("delay_reasons"),
    )
    return json.dumps(event.model_dump(mode="json"), default=str)


@tool(
    "complete_shutdown",
    "Complete a shutdown event (IN_PROGRESS → COMPLETED). Input: shutdown event dict.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def complete_shutdown(input_json: str) -> str:
    data = json.loads(input_json)
    event = ShutdownEvent(**data)
    event, msg = ShutdownEngine.complete_shutdown(event)
    return json.dumps({"status": event.status.value, "message": msg}, default=str)


@tool(
    "calculate_shutdown_metrics",
    "Calculate shutdown performance metrics. Input: shutdown event dict.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_shutdown_metrics(input_json: str) -> str:
    data = json.loads(input_json)
    event = ShutdownEvent(**data)
    metrics = ShutdownEngine.calculate_metrics(event)
    return json.dumps(metrics.model_dump(mode="json"), default=str)


# ── MoC ──────────────────────────────────────────────────────────────

@tool(
    "create_moc",
    "Create a Management of Change request. Input: {plant_id, title, description, category, requester_id, affected_equipment, risk_level}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def create_moc(input_json: str) -> str:
    data = json.loads(input_json)
    moc = MoCEngine.create_moc(
        data["plant_id"], data["title"], data.get("description", ""),
        MoCCategory(data.get("category", "EQUIPMENT_MODIFICATION")),
        data.get("requester_id", ""),
        data.get("affected_equipment"),
        risk_level=RiskLevel(data.get("risk_level", "LOW")),
    )
    return json.dumps(moc.model_dump(mode="json"), default=str)


@tool(
    "advance_moc",
    "Advance MoC through lifecycle. Input: {moc (request dict), action: submit|review|approve|reject|implement|close}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def advance_moc(input_json: str) -> str:
    data = json.loads(input_json)
    moc = MoCRequest(**data["moc"])
    action = data.get("action", "")
    actions = {
        "submit": lambda: MoCEngine.submit_moc(moc),
        "review": lambda: MoCEngine.start_review(moc, data.get("reviewer_id", "")),
        "approve": lambda: MoCEngine.approve_moc(moc, data.get("approver_id", "")),
        "reject": lambda: MoCEngine.reject_moc(moc, data.get("reason", "")),
        "implement": lambda: MoCEngine.start_implementation(moc),
        "close": lambda: MoCEngine.close_moc(moc),
    }
    handler = actions.get(action.lower())
    if not handler:
        return json.dumps({"error": f"Unknown action: {action}"})
    moc, msg = handler()
    return json.dumps({"status": moc.status.value, "message": msg}, default=str)


@tool(
    "assess_moc_risk",
    "Assess risk for a MoC request. Input: {moc (request dict), impact_analysis}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def assess_moc_risk(input_json: str) -> str:
    data = json.loads(input_json)
    moc = MoCRequest(**data["moc"])
    result = MoCEngine.assess_risk(moc, data.get("impact_analysis", ""))
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── OCR ──────────────────────────────────────────────────────────────

@tool(
    "calculate_ocr",
    "Calculate optimal maintenance interval (OCR). Input: {equipment_id, failure_rate, cost_per_failure, cost_per_pm, current_pm_interval_days}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_ocr(input_json: str) -> str:
    data = json.loads(input_json)
    inp = OCRAnalysisInput(**data)
    result = OCREngine.calculate_optimal_interval(inp)
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── Jack-Knife ───────────────────────────────────────────────────────

@tool(
    "analyze_jackknife",
    "Run Jack-Knife diagram analysis. Input: {plant_id, equipment_data: [{equipment_id, equipment_tag, failure_count, total_downtime_hours, operating_hours}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def analyze_jackknife(input_json: str) -> str:
    data = json.loads(input_json)
    result = JackKnifeEngine.analyze(data["plant_id"], data.get("equipment_data", []))
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── Pareto ───────────────────────────────────────────────────────────

@tool(
    "analyze_pareto",
    "Run Pareto (80/20) analysis. Input: {plant_id, metric_type: failures|cost|downtime, records: [{equipment_id, equipment_tag, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def analyze_pareto(input_json: str) -> str:
    data = json.loads(input_json)
    metric_type = data.get("metric_type", "failures")
    if metric_type == "failures":
        result = ParetoEngine.analyze_failures(data["plant_id"], data.get("records", []))
    elif metric_type == "cost":
        result = ParetoEngine.analyze_costs(data["plant_id"], data.get("records", []))
    elif metric_type == "downtime":
        result = ParetoEngine.analyze_downtime(data["plant_id"], data.get("records", []))
    else:
        result = ParetoEngine.analyze(data["plant_id"], data.get("records", []), metric_field=metric_type, metric_type=metric_type)
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── LCC ──────────────────────────────────────────────────────────────

@tool(
    "calculate_lcc",
    "Calculate Life Cycle Cost. Input: {equipment_id, acquisition_cost, installation_cost, annual_operating_cost, annual_maintenance_cost, expected_life_years, discount_rate, salvage_value}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_lcc(input_json: str) -> str:
    data = json.loads(input_json)
    inp = LCCInput(**data)
    result = LCCEngine.calculate(inp)
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "compare_lcc_alternatives",
    "Compare LCC of multiple equipment alternatives. Input: {alternatives: [{equipment_id, acquisition_cost, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def compare_lcc_alternatives(input_json: str) -> str:
    data = json.loads(input_json)
    inputs = [LCCInput(**a) for a in data.get("alternatives", [])]
    results = LCCEngine.compare_alternatives(inputs)
    return json.dumps([r.model_dump(mode="json") for r in results], default=str)


# ── RBI ──────────────────────────────────────────────────────────────

@tool(
    "assess_rbi",
    "Run Risk-Based Inspection assessment. Input: {plant_id, equipment_list: [{equipment_id, equipment_type, damage_mechanisms, age_years, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def assess_rbi(input_json: str) -> str:
    data = json.loads(input_json)
    result = RBIEngine.batch_assess(data["plant_id"], data.get("equipment_list", []))
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "prioritize_inspections",
    "Prioritize inspections by risk score. Input: RBIResult dict.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def prioritize_inspections(input_json: str) -> str:
    from tools.models.schemas import RBIResult, RBIAssessment
    data = json.loads(input_json)
    result = RBIResult(**data)
    prioritized = RBIEngine.prioritize_inspections(result)
    return json.dumps([a.model_dump(mode="json") for a in prioritized], default=str)
