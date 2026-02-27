"""MCP tool wrappers for Phase 6 — Notifications & Cross-Module Analytics."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.notification_engine import NotificationEngine
from tools.engines.cross_module_engine import CrossModuleEngine


# ── Notifications ───────────────────────────────────────────────────

@tool(
    "generate_all_notifications",
    "Run all alert checks and return consolidated notifications. Input: {plant_id, rbi_assessments, planning_kpis, de_kpis, reliability_kpis, health_scores, backlog_items, capas, mocs}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_all_notifications(input_json: str) -> str:
    data = json.loads(input_json)
    result = NotificationEngine.generate_all_notifications(
        data["plant_id"],
        rbi_assessments=data.get("rbi_assessments"),
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
        health_scores=data.get("health_scores"),
        backlog_items=data.get("backlog_items"),
        capas=data.get("capas"),
        mocs=data.get("mocs"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "check_rbi_overdue",
    "Check for overdue RBI inspections. Input: {assessments: [{equipment_id, next_inspection_date, risk_level}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def check_rbi_overdue(input_json: str) -> str:
    data = json.loads(input_json)
    alerts = NotificationEngine.check_rbi_overdue(data.get("assessments", []))
    return json.dumps([a.model_dump(mode="json") for a in alerts], default=str)


@tool(
    "check_kpi_breaches",
    "Check KPIs against targets for threshold breaches. Input: {planning_kpis, de_kpis, reliability_kpis}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def check_kpi_breaches(input_json: str) -> str:
    data = json.loads(input_json)
    alerts = NotificationEngine.check_kpi_thresholds(
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
    )
    return json.dumps([a.model_dump(mode="json") for a in alerts], default=str)


@tool(
    "check_backlog_aging",
    "Check for aging backlog items. Input: {backlog_items: [{work_order_id, created_at, equipment_id}], aging_threshold_days}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def check_backlog_aging(input_json: str) -> str:
    data = json.loads(input_json)
    alerts = NotificationEngine.check_backlog_aging(
        data.get("backlog_items", []),
        aging_threshold_days=data.get("aging_threshold_days", 30),
    )
    return json.dumps([a.model_dump(mode="json") for a in alerts], default=str)


# ── Cross-Module ────────────────────────────────────────────────────

@tool(
    "run_cross_module_analysis",
    "Run cross-module analytics (correlations + bad actors). Input: {plant_id, equipment_criticality, failure_records, cost_records, reliability_kpis, health_scores, backlog_items, jackknife_result, pareto_result, rbi_result}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def run_cross_module_analysis(input_json: str) -> str:
    data = json.loads(input_json)
    correlations = []
    if data.get("equipment_criticality") and data.get("failure_records"):
        correlations.append(CrossModuleEngine.correlate_criticality_failures(
            data["equipment_criticality"], data["failure_records"],
        ))
    if data.get("cost_records") and data.get("reliability_kpis"):
        correlations.append(CrossModuleEngine.correlate_cost_reliability(
            data["cost_records"], data["reliability_kpis"],
        ))
    if data.get("health_scores") and data.get("backlog_items"):
        correlations.append(CrossModuleEngine.correlate_health_backlog(
            data["health_scores"], data["backlog_items"],
        ))

    overlap = None
    if any(data.get(k) for k in ["jackknife_result", "pareto_result", "rbi_result"]):
        overlap = CrossModuleEngine.find_bad_actor_overlap(
            jackknife_result=data.get("jackknife_result"),
            pareto_result=data.get("pareto_result"),
            rbi_result=data.get("rbi_result"),
        )

    summary = CrossModuleEngine.generate_cross_module_summary(
        data["plant_id"], correlations, overlap,
    )
    return json.dumps(summary.model_dump(mode="json"), default=str)


@tool(
    "find_bad_actor_overlap",
    "Find equipment flagged as bad actors across Jack-Knife, Pareto, and RBI. Input: {jackknife_result, pareto_result, rbi_result}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def find_bad_actor_overlap(input_json: str) -> str:
    data = json.loads(input_json)
    result = CrossModuleEngine.find_bad_actor_overlap(
        jackknife_result=data.get("jackknife_result"),
        pareto_result=data.get("pareto_result"),
        rbi_result=data.get("rbi_result"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)
