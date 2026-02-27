"""MCP tool wrappers for Phase 6 — Reporting, Import/Export, DE KPIs."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.reporting_engine import ReportingEngine
from tools.engines.de_kpi_engine import DEKPIEngine
from tools.engines.data_import_engine import DataImportEngine
from tools.engines.data_export_engine import DataExportEngine
from tools.models.schemas import DEKPIInput, ImportSource, ReportType


# ── Reports ─────────────────────────────────────────────────────────

@tool(
    "generate_weekly_report",
    "Generate a weekly maintenance report. Input: {plant_id, week_number, year, work_orders_completed: [], work_orders_open: [], safety_incidents, backlog_hours}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_weekly_report(input_json: str) -> str:
    data = json.loads(input_json)
    result = ReportingEngine.generate_weekly_report(
        data["plant_id"], data["week_number"], data["year"],
        work_orders_completed=data.get("work_orders_completed"),
        work_orders_open=data.get("work_orders_open"),
        safety_incidents=data.get("safety_incidents", 0),
        schedule_compliance_pct=data.get("schedule_compliance_pct"),
        backlog_hours=data.get("backlog_hours", 0.0),
        key_events=data.get("key_events"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "generate_monthly_kpi_report",
    "Generate a monthly KPI report with traffic lights. Input: {plant_id, month, year, planning_kpis, de_kpis, reliability_kpis}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_monthly_kpi_report(input_json: str) -> str:
    data = json.loads(input_json)
    result = ReportingEngine.generate_monthly_kpi_report(
        data["plant_id"], data["month"], data["year"],
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
        health_summary=data.get("health_summary"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "generate_quarterly_review",
    "Generate a quarterly management review report. Input: {plant_id, quarter, year, management_review, rbi_summary, bad_actors}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_quarterly_review(input_json: str) -> str:
    data = json.loads(input_json)
    result = ReportingEngine.generate_quarterly_review(
        data["plant_id"], data["quarter"], data["year"],
        monthly_reports=data.get("monthly_reports"),
        management_review=data.get("management_review"),
        rbi_summary=data.get("rbi_summary"),
        bad_actors=data.get("bad_actors"),
        capas_summary=data.get("capas_summary"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── DE KPIs ─────────────────────────────────────────────────────────

@tool(
    "calculate_de_kpis_standalone",
    "Calculate 5 Defect Elimination KPIs with targets. Input: {plant_id, period_start, period_end, events_reported, events_required, meetings_held, meetings_required, actions_implemented, actions_planned, savings_achieved, savings_target, failures_current, failures_previous}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_de_kpis_standalone(input_json: str) -> str:
    data = json.loads(input_json)
    inp = DEKPIInput(**data)
    result = DEKPIEngine.calculate(inp)
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "assess_de_program_health",
    "Assess DE program maturity (INITIAL/DEVELOPING/ESTABLISHED/OPTIMIZING). Input: {plant_id, period_start, period_end, events_reported, events_required, meetings_held, meetings_required, actions_implemented, actions_planned, savings_achieved, savings_target, failures_current, failures_previous}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def assess_de_program_health(input_json: str) -> str:
    data = json.loads(input_json)
    inp = DEKPIInput(**data)
    de_kpis = DEKPIEngine.calculate(inp)
    health = DEKPIEngine.assess_program_health(inp.plant_id, de_kpis)
    return json.dumps(health.model_dump(mode="json"), default=str)


# ── Import ──────────────────────────────────────────────────────────

@tool(
    "validate_import_data",
    "Validate imported data (equipment hierarchy, failure history, or maintenance plan). Input: {source: 'EQUIPMENT_HIERARCHY'|'FAILURE_HISTORY'|'MAINTENANCE_PLAN', rows: [{...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def validate_import_data(input_json: str) -> str:
    data = json.loads(input_json)
    source = ImportSource(data["source"])
    rows = data.get("rows", [])
    if source == ImportSource.EQUIPMENT_HIERARCHY:
        result = DataImportEngine.validate_hierarchy_data(rows)
    elif source == ImportSource.FAILURE_HISTORY:
        result = DataImportEngine.validate_failure_history(rows)
    else:
        result = DataImportEngine.validate_maintenance_plan(rows)
    return json.dumps(result.model_dump(mode="json"), default=str)


# ── Export ──────────────────────────────────────────────────────────

@tool(
    "export_equipment_data",
    "Prepare equipment data for export. Input: {hierarchy_data: [{equipment_id, description, ...}], include_criticality, include_health}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def export_equipment_data(input_json: str) -> str:
    data = json.loads(input_json)
    result = DataExportEngine.prepare_equipment_export(
        data.get("hierarchy_data", []),
        include_criticality=data.get("include_criticality", True),
        include_health=data.get("include_health", True),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "export_kpi_data",
    "Prepare KPI data for export. Input: {planning_kpis, de_kpis, reliability_kpis}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def export_kpi_data(input_json: str) -> str:
    data = json.loads(input_json)
    result = DataExportEngine.prepare_kpi_export(
        planning_kpis=data.get("planning_kpis"),
        de_kpis=data.get("de_kpis"),
        reliability_kpis=data.get("reliability_kpis"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "export_report_data",
    "Prepare a report for export. Input: {report: {...}, format: 'EXCEL'|'CSV'|'PDF'}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def export_report_data(input_json: str) -> str:
    data = json.loads(input_json)
    result = DataExportEngine.prepare_report_export(
        data.get("report", {}),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)


@tool(
    "export_schedule_data",
    "Prepare schedule/program data for export. Input: {program: {...}, gantt_rows: [{...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def export_schedule_data(input_json: str) -> str:
    data = json.loads(input_json)
    result = DataExportEngine.prepare_schedule_export(
        data.get("program", {}),
        gantt_rows=data.get("gantt_rows"),
    )
    return json.dumps(result.model_dump(mode="json"), default=str)
