"""RFI (Request for Information) data models for AMS.

Pydantic models for the 8-sheet RFI questionnaire used to collect
client information before a maintenance strategy engagement.

Kept separate from schemas.py to prevent God File anti-pattern.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Minimum percentage of required fields that must be filled
REQUIRED_COMPLETENESS_THRESHOLD = 0.70

# Field length limits
MAX_TEXT_FIELD_LENGTH = 500
MAX_NOTES_FIELD_LENGTH = 1000
MAX_NAME_FIELD_LENGTH = 200

# KPI valid ranges
KPI_PERCENTAGE_MIN = 0.0
KPI_PERCENTAGE_MAX = 100.0
KPI_MTBF_MAX_HOURS = 100_000
KPI_MTTR_MAX_HOURS = 1_000

# Organization ranges
TEAM_SIZE_MAX = 10_000
SHIFTS_MAX = 4

# Data quality score range (Sheet 8)
DATA_QUALITY_MIN = 1
DATA_QUALITY_MAX = 5


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Industry(str, Enum):
    MINING = "mining"
    OIL_GAS = "oil-gas"
    CHEMICALS = "chemicals"
    ENERGY = "energy"
    FERTILIZERS = "fertilizers"
    CEMENT = "cement"
    PULP_PAPER = "pulp-paper"
    FOOD_BEVERAGE = "food-beverage"
    MANUFACTURING = "manufacturing"
    OTHER = "other"


class StrategyMaturity(str, Enum):
    REACTIVE = "reactive"
    EMERGING = "emerging"
    DEVELOPING = "developing"
    MATURE = "mature"
    OPTIMIZED = "optimized"


class CMMSType(str, Enum):
    SAP_PM = "sap-pm"
    MAXIMO = "maximo"
    INFOR_EAM = "infor-eam"
    MP_SOFTWARE = "mp-software"
    EXCEL = "excel"
    NONE = "none"
    OTHER = "other"


class SAPVersion(str, Enum):
    ECC6 = "ECC-6.0"
    S4HANA = "S/4HANA"
    S4HANA_CLOUD = "S/4HANA-Cloud"
    OTHER = "other"


class ScopeType(str, Enum):
    FULL_PLANT = "full-plant"
    AREA = "area"
    SYSTEM = "system"
    EQUIPMENT_CLASS = "equipment-class"


class WorkshopFormat(str, Enum):
    IN_PERSON = "in-person"
    VIRTUAL = "virtual"
    HYBRID = "hybrid"


class DataFormat(str, Enum):
    EXCEL = "excel"
    SAP_EXPORT = "sap-export"
    PDF = "pdf"
    PAPER = "paper"
    DATABASE = "database"
    CSV = "csv"
    OTHER = "other"


class CriticalityMethodRFI(str, Enum):
    R8_4LEVEL = "r8-4level"
    GFSN_3LEVEL = "gfsn-3level"
    RISK_MATRIX = "risk-matrix"
    ABC = "abc"
    CLIENT_CUSTOM = "client-custom"
    NONE = "none"


class OrgStructure(str, Enum):
    CENTRALIZED = "centralized"
    AREA_BASED = "area-based"
    HYBRID = "hybrid"
    OUTSOURCED = "outsourced"


class Language(str, Enum):
    EN = "en"
    FR = "fr"
    ES = "es"
    AR = "ar"
    PT = "pt"


# ---------------------------------------------------------------------------
# 14 AMS Templates (for Sheet 8 mapping)
# ---------------------------------------------------------------------------

AMS_TEMPLATES: list[tuple[str, str]] = [
    ("01_equipment_hierarchy", "Equipment Hierarchy"),
    ("02_criticality_assessment", "Criticality Assessment"),
    ("03_failure_modes", "Failure Modes (FMECA)"),
    ("04_maintenance_tasks", "Maintenance Tasks"),
    ("05_work_packages", "Work Packages"),
    ("06_work_order_history", "Work Order History"),
    ("07_spare_parts_inventory", "Spare Parts Inventory"),
    ("08_shutdown_calendar", "Shutdown Calendar"),
    ("09_workforce", "Workforce"),
    ("10_field_capture", "Field Capture"),
    ("11_rca_events", "RCA Events"),
    ("12_planning_kpi_input", "Planning KPI Input"),
    ("13_de_kpi_input", "DE KPI Input"),
    ("14_maintenance_strategy", "Maintenance Strategy"),
]


# ---------------------------------------------------------------------------
# Required fields per sheet (for validation)
# ---------------------------------------------------------------------------

REQUIRED_FIELDS: dict[str, list[str]] = {
    "company_site": [
        "company_name", "industry", "plant_name", "country", "primary_language",
    ],
    "equipment_hierarchy": [
        "equipment_list_available", "estimated_equipment_count",
    ],
    "maintenance_state": [
        "strategy_maturity", "cmms_type",
    ],
    "organization": [
        "team_size", "shifts",
    ],
    "standards": [
        "procedure_language",
    ],
    "kpi_baseline": [
        "target_availability",
    ],
    "scope_timeline": [
        "scope_type", "start_date", "target_completion",
    ],
    "data_availability": [],  # informational — no required fields
}


# ---------------------------------------------------------------------------
# Sheet 1: Company & Site Profile
# ---------------------------------------------------------------------------

class CompanySiteProfile(BaseModel):
    """Sheet 1: Company & Site Profile (12 fields)."""

    company_name: str = Field(default="", max_length=MAX_NAME_FIELD_LENGTH)
    industry: Industry | None = None
    plant_name: str = Field(default="", max_length=MAX_NAME_FIELD_LENGTH)
    plant_code: str = Field(default="", max_length=50)
    location: str = Field(default="", max_length=MAX_TEXT_FIELD_LENGTH)
    country: str = Field(default="", max_length=2)
    production_capacity: str = Field(default="", max_length=MAX_TEXT_FIELD_LENGTH)
    primary_language: Language | None = None
    secondary_language: Language | None = None
    contact_name: str = Field(default="", max_length=MAX_NAME_FIELD_LENGTH)
    contact_email: str = Field(default="", max_length=MAX_NAME_FIELD_LENGTH)
    contact_phone: str = Field(default="", max_length=50)


# ---------------------------------------------------------------------------
# Sheet 2: Equipment & Hierarchy Data
# ---------------------------------------------------------------------------

class EquipmentHierarchyData(BaseModel):
    """Sheet 2: Equipment & Hierarchy Data (11 fields)."""

    equipment_list_available: bool | None = None
    equipment_list_format: DataFormat | None = None
    estimated_equipment_count: int | None = Field(default=None, ge=0)
    hierarchy_levels: int | None = Field(default=None, ge=1, le=10)
    naming_convention: str = Field(default="", max_length=MAX_TEXT_FIELD_LENGTH)
    naming_convention_document: bool | None = None
    bom_available: bool | None = None
    bom_format: DataFormat | None = None
    tag_format_example: str = Field(default="", max_length=MAX_TEXT_FIELD_LENGTH)
    functional_location_structure: str = Field(default="", max_length=MAX_TEXT_FIELD_LENGTH)
    equipment_master_in_sap: bool | None = None


# ---------------------------------------------------------------------------
# Sheet 3: Maintenance Current State
# ---------------------------------------------------------------------------

class MaintenanceCurrentState(BaseModel):
    """Sheet 3: Maintenance Current State (14 fields)."""

    strategy_maturity: StrategyMaturity | None = None
    cmms_type: CMMSType | None = None
    sap_version: SAPVersion | None = None
    wo_history_available: bool | None = None
    wo_history_years: int | None = Field(default=None, ge=0, le=50)
    failure_data_available: bool | None = None
    failure_data_format: DataFormat | None = None
    downtime_tracking: bool | None = None
    planned_maintenance_exists: bool | None = None
    pm_plan_format: DataFormat | None = None
    prior_criticality_assessment: bool | None = None
    criticality_method: CriticalityMethodRFI | None = None
    prior_fmeca: bool | None = None
    prior_rcm_study: bool | None = None


# ---------------------------------------------------------------------------
# Sheet 4: Organization & Resources
# ---------------------------------------------------------------------------

class OrganizationResources(BaseModel):
    """Sheet 4: Organization & Resources (8 fields)."""

    team_size: int | None = Field(default=None, ge=0, le=TEAM_SIZE_MAX)
    org_structure: OrgStructure | None = None
    shifts: int | None = Field(default=None, ge=1, le=SHIFTS_MAX)
    contractor_maintenance: bool | None = None
    trades: list[str] = Field(default_factory=list)
    dedicated_planner: bool | None = None
    dedicated_reliability_engineer: bool | None = None
    maintenance_budget_usd: float | None = Field(default=None, ge=0)


# ---------------------------------------------------------------------------
# Sheet 5: Standards & Compliance
# ---------------------------------------------------------------------------

class StandardsCompliance(BaseModel):
    """Sheet 5: Standards & Compliance (8 fields)."""

    iso_certifications: list[str] = Field(default_factory=list)
    industry_regulations: list[str] = Field(default_factory=list)
    lototo_program: bool | None = None
    procedure_documentation: bool | None = None
    procedure_language: Language | None = None
    safety_permits_required: list[str] = Field(default_factory=list)
    ppe_matrix: bool | None = None
    environmental_permits: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Sheet 6: KPI Baseline & Targets
# ---------------------------------------------------------------------------

class KPIBaselineTargets(BaseModel):
    """Sheet 6: KPI Baseline & Targets (10 fields)."""

    current_availability: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    target_availability: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    current_mtbf_hours: float | None = Field(
        default=None, ge=0, le=KPI_MTBF_MAX_HOURS,
    )
    current_mttr_hours: float | None = Field(
        default=None, ge=0, le=KPI_MTTR_MAX_HOURS,
    )
    current_oee: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    annual_maintenance_cost_usd: float | None = Field(default=None, ge=0)
    current_planned_vs_unplanned: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    target_planned_vs_unplanned: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    current_pm_compliance: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )
    target_pm_compliance: float | None = Field(
        default=None, ge=KPI_PERCENTAGE_MIN, le=KPI_PERCENTAGE_MAX,
    )


# ---------------------------------------------------------------------------
# Sheet 7: Scope & Timeline
# ---------------------------------------------------------------------------

class ScopeTimeline(BaseModel):
    """Sheet 7: Scope & Timeline (7 fields)."""

    scope_type: ScopeType | None = None
    areas_in_scope: list[str] = Field(default_factory=list)
    priority_equipment: list[str] = Field(default_factory=list)
    start_date: date | None = None
    target_completion: date | None = None
    deliverables: list[str] = Field(default_factory=list)
    workshop_format: WorkshopFormat | None = None

    @model_validator(mode="after")
    def _check_dates(self) -> ScopeTimeline:
        if (
            self.start_date is not None
            and self.target_completion is not None
            and self.target_completion < self.start_date
        ):
            raise ValueError("target_completion must not be before start_date")
        return self


# ---------------------------------------------------------------------------
# Sheet 8: Data Availability Checklist
# ---------------------------------------------------------------------------

class DataAvailabilityItem(BaseModel):
    """Single row in Sheet 8."""

    template_id: str
    template_name: str
    available: bool | None = None
    data_format: DataFormat | None = None
    quality_score: int | None = Field(
        default=None, ge=DATA_QUALITY_MIN, le=DATA_QUALITY_MAX,
    )
    notes: str = Field(default="", max_length=MAX_NOTES_FIELD_LENGTH)


class DataAvailabilityChecklist(BaseModel):
    """Sheet 8: Data Availability Checklist (14 items)."""

    items: list[DataAvailabilityItem] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Composite models
# ---------------------------------------------------------------------------

class RFISubmission(BaseModel):
    """Complete RFI submission — all 8 sheets combined."""

    company_site: CompanySiteProfile = Field(default_factory=CompanySiteProfile)
    equipment_hierarchy: EquipmentHierarchyData = Field(
        default_factory=EquipmentHierarchyData,
    )
    maintenance_state: MaintenanceCurrentState = Field(
        default_factory=MaintenanceCurrentState,
    )
    organization: OrganizationResources = Field(
        default_factory=OrganizationResources,
    )
    standards: StandardsCompliance = Field(default_factory=StandardsCompliance)
    kpi_baseline: KPIBaselineTargets = Field(default_factory=KPIBaselineTargets)
    scope_timeline: ScopeTimeline = Field(default_factory=ScopeTimeline)
    data_availability: DataAvailabilityChecklist = Field(
        default_factory=DataAvailabilityChecklist,
    )


class RFIValidationSummary(BaseModel):
    """Summary of RFI validation results."""

    total_fields: int = 0
    required_fields: int = 0
    filled_required: int = 0
    completeness_score: float = Field(default=0.0, ge=0.0, le=100.0)
    errors: int = 0
    warnings: int = 0
    is_sufficient: bool = False
