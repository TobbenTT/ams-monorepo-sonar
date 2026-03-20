"""Pydantic request schemas — input validation for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Any
import re

# ── Max length constants ──────────────────────────────────────────────
_MAX_SHORT = 100    # IDs, tags, codes
_MAX_MEDIUM = 500   # Names, descriptions
_MAX_LONG = 5000    # Free text, comments
_MAX_LIST = 1000    # Max items in lists


# ── Admin ────────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    page: str = Field(default="unknown", max_length=_MAX_SHORT)
    rating: int = Field(default=3, ge=1, le=5)
    comment: str = Field(default="", max_length=_MAX_LONG)


# ── Analytics ────────────────────────────────────────────────────────

class HealthScoreRequest(BaseModel):
    node_id: str = Field(max_length=_MAX_SHORT)
    plant_id: str = Field(max_length=_MAX_SHORT)
    equipment_tag: str = Field(max_length=_MAX_SHORT)
    risk_class: str = Field(max_length=20)
    pending_backlog_hours: float = Field(default=0.0, ge=0, le=100000)
    capacity_hours_per_week: float = Field(default=40.0, ge=0, le=10000)
    total_failure_modes: int = Field(default=0, ge=0, le=10000)
    fm_with_strategy: int = Field(default=0, ge=0, le=10000)
    active_alerts: int = Field(default=0, ge=0, le=10000)
    critical_alerts: int = Field(default=0, ge=0, le=10000)
    planned_wo: int = Field(default=0, ge=0, le=100000)
    executed_on_time: int = Field(default=0, ge=0, le=100000)


class KPIRequest(BaseModel):
    plant_id: str = Field(max_length=_MAX_SHORT)
    failure_dates: list[str] | None = Field(default=None, max_length=_MAX_LIST)
    total_period_hours: float | None = Field(default=None, ge=0, le=1e8)
    total_downtime_hours: float | None = Field(default=None, ge=0, le=1e8)


class WeibullFitRequest(BaseModel):
    failure_intervals: list[float] = Field(max_length=_MAX_LIST)


class WeibullPredictRequest(BaseModel):
    equipment_id: str = Field(max_length=_MAX_SHORT)
    equipment_tag: str = Field(max_length=_MAX_SHORT)
    failure_intervals: list[float] = Field(max_length=_MAX_LIST)
    current_age_days: float = Field(ge=0, le=1e6)
    confidence_level: float = Field(default=0.9, ge=0.01, le=0.99)


class VarianceDetectRequest(BaseModel):
    snapshots: list[dict[str, Any]] = Field(max_length=_MAX_LIST)


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
    image_data: str | None = None  # base64 data-URL from camera capture
    plant_id: str | None = None
    # Structured fields from mobile form
    suggested_action: str | None = None
    resources: list | None = None
    estimated_duration: str | None = None
    materials: list | None = None
    special_equipment: str | None = None
    plant_condition: str | None = None
    priority: str | None = None
    technical_location: str | None = None
    technical_location_code: str | None = None
    failure_category: str | None = None
    failure_symptom: str | None = None
    failure_object_part: str | None = None
    failure_cause: str | None = None
    activity_class: str | None = None  # SAP PM: CR, MC, MJ, IO, IP, PV, PD, CC, PP


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


class RCAUpdate(BaseModel):
    event_description: str | None = None
    equipment_id: str | None = None
    analysis_5w2h: dict | None = None
    root_cause_levels: dict | None = None
    capa_actions: list[dict] | None = None
    team_members: list[str] | None = None


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


# ── Auth ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str = Field(max_length=254)
    username: str = Field(min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_.-]+$')
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=200)
    role: str = Field(default="tecnico", max_length=20)
    plant_id: str | None = Field(default=None, max_length=_MAX_SHORT)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v.lower().strip()

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    username: str = Field(max_length=254)
    password: str = Field(max_length=128)


class PasswordChange(BaseModel):
    current_password: str = Field(max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserRoleUpdate(BaseModel):
    role: str = Field(max_length=20)


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=200)
    email: str | None = Field(default=None, max_length=254)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(max_length=2048)


# ── AI Agents (CORTEX integration) ──────────────────────────────────

class AISessionCreate(BaseModel):
    equipment_tag: str = Field(max_length=_MAX_SHORT)
    plant_id: str = Field(default="OCP", max_length=_MAX_SHORT)


class AIMilestoneAction(BaseModel):
    action: str = Field(max_length=20)  # approve, modify, reject
    feedback: str = Field(default="", max_length=_MAX_LONG)

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {"approve", "modify", "reject"}:
            raise ValueError("action must be one of: approve, modify, reject")
        return v


class TroubleshootingRequest(BaseModel):
    equipment_tag: str = Field(max_length=_MAX_SHORT)
    plant_id: str = Field(default="OCP", max_length=_MAX_SHORT)
    symptom_description: str = Field(max_length=_MAX_LONG)


class ChecklistGenerateRequest(BaseModel):
    work_package_id: str = Field(max_length=_MAX_SHORT)
    equipment_tag: str = Field(default="", max_length=_MAX_SHORT)
    task_type: str = Field(default="", max_length=30)


class ChecklistItemUpdate(BaseModel):
    item_index: int = Field(ge=0)
    completed: bool = True
    notes: str = Field(default="", max_length=_MAX_MEDIUM)


class AIToolCallRequest(BaseModel):
    """Direct tool invocation for advanced users."""
    tool_name: str = Field(max_length=_MAX_SHORT)
    arguments: dict[str, Any] = Field(default_factory=dict)


class EquipmentChatRequest(BaseModel):
    """Equipment AI assistant — contextual chat about a specific asset."""
    equipment_tag: str = Field(max_length=_MAX_SHORT)
    question: str = Field(max_length=_MAX_LONG)
    conversation_history: list[dict[str, str]] = Field(default_factory=list, max_length=50)
