"""Pydantic request schemas — input validation for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field
from typing import Any


# ── Admin ────────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    page: str = "unknown"
    rating: int = Field(default=3, ge=1, le=5)
    comment: str = ""


# ── Analytics ────────────────────────────────────────────────────────

class HealthScoreRequest(BaseModel):
    node_id: str
    plant_id: str
    equipment_tag: str
    risk_class: str
    pending_backlog_hours: float = 0.0
    capacity_hours_per_week: float = 40.0
    total_failure_modes: int = 0
    fm_with_strategy: int = 0
    active_alerts: int = 0
    critical_alerts: int = 0
    planned_wo: int = 0
    executed_on_time: int = 0


class KPIRequest(BaseModel):
    plant_id: str
    failure_dates: list[str] | None = None
    total_period_hours: float | None = None
    total_downtime_hours: float | None = None


class WeibullFitRequest(BaseModel):
    failure_intervals: list[float]


class WeibullPredictRequest(BaseModel):
    equipment_id: str
    equipment_tag: str
    failure_intervals: list[float]
    current_age_days: float
    confidence_level: float = 0.9


class VarianceDetectRequest(BaseModel):
    snapshots: list[dict[str, Any]]


# ── Backlog ──────────────────────────────────────────────────────────

class BacklogOptimizeRequest(BaseModel):
    plant_id: str = "BRY"
    period_days: int = 30


# ── Capture ──────────────────────────────────────────────────────────

class CaptureCreate(BaseModel):
    technician_id: str = "UNKNOWN"
    technician_name: str = "Unknown"
    capture_type: str = "TEXT"
    language: str = "en"
    raw_voice_text: str | None = None
    raw_text_input: str | None = None
    equipment_tag_manual: str | None = None
    location_hint: str | None = None


# ── Criticality ──────────────────────────────────────────────────────

class CriticalityAssessRequest(BaseModel):
    node_id: str
    criteria_scores: list[dict[str, Any]] | dict[str, Any]
    probability: float
    method: str = "FULL_MATRIX"
    assessed_by: str = "system"


class RiskClassRequest(BaseModel):
    overall_score: float


# ── FMEA ─────────────────────────────────────────────────────────────

class FailureModeCreate(BaseModel):
    """Passed to fmea_service.create_failure_mode — allows extra fields."""
    mechanism: str
    cause: str

    model_config = ConfigDict(extra="allow")


class FMValidateRequest(BaseModel):
    mechanism: str
    cause: str


class RCMDecideRequest(BaseModel):
    """Passed to RCMDecisionInput — allows extra fields for flexibility."""
    model_config = ConfigDict(extra="allow")


class FunctionCreate(BaseModel):
    node_id: str
    function_type: str = "PRIMARY"
    description: str = ""
    description_fr: str = ""


class FunctionalFailureCreate(BaseModel):
    function_id: str
    failure_type: str = "TOTAL"
    description: str = ""
    description_fr: str = ""


class FMECAWorksheetCreate(BaseModel):
    """Passed to fmea_service.create_fmeca_worksheet — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class RPNRequest(BaseModel):
    severity: int = Field(ge=1, le=10)
    occurrence: int = Field(ge=1, le=10)
    detection: int = Field(ge=1, le=10)


# ── Hierarchy ────────────────────────────────────────────────────────

class PlantCreate(BaseModel):
    plant_id: str = ""
    name: str = ""
    name_fr: str = ""
    location: str = ""


class NodeCreate(BaseModel):
    """Passed to hierarchy_service.create_node — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class VendorBuildRequest(BaseModel):
    plant_id: str
    area_code: str
    equipment_type: str


# ── Planner ──────────────────────────────────────────────────────────

class RecommendationAction(BaseModel):
    action: str
    modifications: dict[str, Any] | None = None


# ── RCA ──────────────────────────────────────────────────────────────

class RCACreate(BaseModel):
    event_description: str = ""
    plant_id: str = "BRY"
    equipment_id: str | None = None
    max_consequence: int = 3
    frequency: int = 3
    team_members: list[str] | None = None


class FiveW2HRequest(BaseModel):
    what: str = ""
    when: str = ""
    where: str = ""
    who: str = ""
    why: str = ""
    how: str = ""
    how_much: str = ""


class RCAAdvance(BaseModel):
    status: str = ""


class PlanningKPIRequest(BaseModel):
    """Passed directly to PlanningKPIInput — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class DEKPIRequest(BaseModel):
    """Passed directly to DEKPIInput — allows extra fields."""
    model_config = ConfigDict(extra="allow")


# ── Reliability ──────────────────────────────────────────────────────

class SparePartsRequest(BaseModel):
    plant_id: str = "BRY"
    parts: list[dict[str, Any]] = []


class ShutdownCreate(BaseModel):
    plant_id: str = "BRY"
    name: str = ""
    planned_start: str = ""
    planned_end: str = ""
    work_orders: list[str] = []


class MOCCreate(BaseModel):
    plant_id: str = "BRY"
    title: str = ""
    description: str = ""
    category: str = "EQUIPMENT_MODIFICATION"
    requester_id: str = ""
    affected_equipment: list[str] | None = None
    risk_level: str = "LOW"


class MOCAdvance(BaseModel):
    action: str = ""

    model_config = ConfigDict(extra="allow")


class OCRRequest(BaseModel):
    """Passed directly to OCRAnalysisInput — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class JackknifRequest(BaseModel):
    plant_id: str = "BRY"
    equipment_data: list[dict[str, Any]] = []


class ParetoRequest(BaseModel):
    plant_id: str = "BRY"
    metric_type: str = "failures"
    records: list[dict[str, Any]] = []


class LCCRequest(BaseModel):
    """Passed directly to LCCInput — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class RBIRequest(BaseModel):
    plant_id: str = "BRY"
    equipment_list: list[dict[str, Any]] = []


# ── Reporting ────────────────────────────────────────────────────────

class WeeklyReportRequest(BaseModel):
    plant_id: str = "BRY"
    week: int | None = None
    week_number: int = 1
    year: int = 2025
    work_orders_completed: int | None = None
    work_orders_open: int | None = None
    safety_incidents: int = 0
    schedule_compliance_pct: float | None = None
    backlog_hours: float = 0.0
    key_events: list[str] | None = None

    model_config = ConfigDict(extra="allow")


class MonthlyReportRequest(BaseModel):
    plant_id: str = "BRY"
    month: int = 1
    year: int = 2025
    planning_kpis: dict[str, Any] | None = None
    de_kpis: dict[str, Any] | None = None
    reliability_kpis: dict[str, Any] | None = None
    health_summary: dict[str, Any] | None = None
    previous_month_kpis: dict[str, Any] | None = None

    model_config = ConfigDict(extra="allow")


class QuarterlyReportRequest(BaseModel):
    plant_id: str = "BRY"
    quarter: int = 1
    year: int = 2025
    monthly_reports: list[dict[str, Any]] | None = None
    management_review: dict[str, Any] | None = None
    rbi_summary: dict[str, Any] | None = None
    bad_actors: list[dict[str, Any]] | None = None
    capas_summary: dict[str, Any] | None = None

    model_config = ConfigDict(extra="allow")


class ReportingDEKPIRequest(BaseModel):
    """Passed directly to DEKPIInput — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class NotificationRequest(BaseModel):
    plant_id: str = "BRY"
    rbi_assessments: list[dict[str, Any]] | None = None
    planning_kpis: dict[str, Any] | None = None
    de_kpis: dict[str, Any] | None = None
    reliability_kpis: dict[str, Any] | None = None
    health_scores: list[dict[str, Any]] | None = None
    backlog_items: list[dict[str, Any]] | None = None
    capas: list[dict[str, Any]] | None = None
    mocs: list[dict[str, Any]] | None = None

    model_config = ConfigDict(extra="allow")


class ImportValidateRequest(BaseModel):
    source: str = "EQUIPMENT_HIERARCHY"
    rows: list[dict[str, Any]] = []


class ExportRequest(BaseModel):
    export_type: str = "report"
    # Fields vary by export_type
    hierarchy_data: list[dict[str, Any]] | None = None
    include_criticality: bool = True
    include_health: bool = True
    planning_kpis: dict[str, Any] | None = None
    de_kpis: dict[str, Any] | None = None
    reliability_kpis: dict[str, Any] | None = None
    program: dict[str, Any] | None = None
    gantt_rows: list[dict[str, Any]] | None = None
    report: dict[str, Any] | None = None
    format: str = "EXCEL"

    model_config = ConfigDict(extra="allow")


class CrossModuleRequest(BaseModel):
    plant_id: str = "BRY"
    equipment_criticality: list[dict[str, Any]] | None = None
    failure_records: list[dict[str, Any]] | None = None
    cost_records: list[dict[str, Any]] | None = None
    reliability_kpis: dict[str, Any] | None = None
    health_scores: list[dict[str, Any]] | None = None
    backlog_items: list[dict[str, Any]] | None = None
    jackknife_result: dict[str, Any] | None = None
    pareto_result: dict[str, Any] | None = None
    rbi_result: dict[str, Any] | None = None

    model_config = ConfigDict(extra="allow")


# ── SAP ──────────────────────────────────────────────────────────────

class SAPUploadRequest(BaseModel):
    plant_code: str
    maintenance_plan: dict[str, Any] = {}
    maintenance_items: list[dict[str, Any]] = []
    task_lists: list[dict[str, Any]] = []


class SAPTransitionRequest(BaseModel):
    entity_type: str
    current_state: str
    target_state: str


# ── Scheduling ───────────────────────────────────────────────────────

class ProgramCreate(BaseModel):
    plant_id: str = "BRY"
    week_number: int = 1
    year: int = 2025


# ── Tasks ────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    """Passed to task_service.create_task — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class TaskNameValidate(BaseModel):
    name: str
    task_type: str = ""


class WPNameValidate(BaseModel):
    name: str


# ── Work Packages ────────────────────────────────────────────────────

class WPCreate(BaseModel):
    """Passed to work_package_service.create_work_package — allows extra fields."""
    model_config = ConfigDict(extra="allow")


class WPGroupRequest(BaseModel):
    items: list[dict[str, Any]]


class WorkInstructionRequest(BaseModel):
    equipment_name: str = ""
    equipment_tag: str = ""
    tasks: list[dict[str, Any]] = []


# ── Work Requests ────────────────────────────────────────────────────

class WRValidateRequest(BaseModel):
    action: str
    modifications: dict[str, Any] | None = None
