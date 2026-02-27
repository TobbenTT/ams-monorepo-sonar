"""
OCP Maintenance AI MVP — Pydantic Data Models
Formalizes all data schemas from gemini.md (Project Constitution)

Module 1-3: Field Capture, Planner Assistant, Backlog Optimization
Module 4: Maintenance Strategy Development
GECAMIN Extensions: Health Score, KPIs, Weibull Prediction, CAPA, Variance Detection
Neuro-Architecture: Expert Cards, Stakeholder Registry, Ipsative Feedback
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# ============================================================
# ENUMERATIONS
# ============================================================

# --- Equipment & Hierarchy ---
class EquipmentCriticality(str, Enum):
    AA = "AA"
    A_PLUS = "A+"
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class EquipmentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DECOMMISSIONED = "DECOMMISSIONED"


class NodeType(str, Enum):
    PLANT = "PLANT"
    AREA = "AREA"
    SYSTEM = "SYSTEM"
    EQUIPMENT = "EQUIPMENT"
    SUB_ASSEMBLY = "SUB_ASSEMBLY"
    MAINTAINABLE_ITEM = "MAINTAINABLE_ITEM"


# --- Field Capture ---
class CaptureType(str, Enum):
    VOICE = "VOICE"
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    VOICE_IMAGE = "VOICE+IMAGE"


class Language(str, Enum):
    FR = "fr"
    EN = "en"
    AR = "ar"
    ES = "es"


# --- Work Request ---
class WorkRequestStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_VALIDATION = "PENDING_VALIDATION"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    SUBMITTED_TO_SAP = "SUBMITTED_TO_SAP"


class WorkOrderType(str, Enum):
    PM01_INSPECTION = "PM01_INSPECTION"
    PM02_PREVENTIVE = "PM02_PREVENTIVE"
    PM03_CORRECTIVE = "PM03_CORRECTIVE"


class Priority(str, Enum):
    EMERGENCY = "1_EMERGENCY"
    URGENT = "2_URGENT"
    NORMAL = "3_NORMAL"
    PLANNED = "4_PLANNED"


class ResolutionMethod(str, Enum):
    EXACT_MATCH = "EXACT_MATCH"
    FUZZY_MATCH = "FUZZY_MATCH"
    IMAGE_OCR = "IMAGE_OCR"
    MANUAL = "MANUAL"


class AvailabilityStatus(str, Enum):
    IN_STOCK = "IN_STOCK"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    UNKNOWN = "UNKNOWN"


class VisualSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# --- Planner ---
class ShiftType(str, Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    NIGHT = "NIGHT"


class ShutdownType(str, Enum):
    MINOR_8H = "MINOR_8H"
    MAJOR_20H_PLUS = "MAJOR_20H_PLUS"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PlannerAction(str, Enum):
    APPROVE = "APPROVE"
    MODIFY = "MODIFY"
    ESCALATE = "ESCALATE"
    DEFER = "DEFER"


# --- Backlog ---
class BacklogStatus(str, Enum):
    AWAITING_MATERIALS = "AWAITING_MATERIALS"
    AWAITING_SHUTDOWN = "AWAITING_SHUTDOWN"
    AWAITING_RESOURCES = "AWAITING_RESOURCES"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"


class BacklogWOType(str, Enum):
    PM01 = "PM01"
    PM02 = "PM02"
    PM03 = "PM03"


class MaterialsReadyStatus(str, Enum):
    READY = "READY"
    PARTIAL = "PARTIAL"
    NOT_READY = "NOT_READY"


class AlertType(str, Enum):
    OVERDUE = "OVERDUE"
    MATERIAL_DELAY = "MATERIAL_DELAY"
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT"
    PRIORITY_ESCALATION = "PRIORITY_ESCALATION"


# --- Work Order History ---
class WOHistoryStatus(str, Enum):
    CREATED = "CREATED"
    RELEASED = "RELEASED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


# --- Spare Parts ---
class MaterialCriticality(str, Enum):
    CRITICAL = "CRITICAL"
    IMPORTANT = "IMPORTANT"
    STANDARD = "STANDARD"


# --- Maintenance Plan ---
class PlanStrategy(str, Enum):
    TIME_BASED = "TIME_BASED"
    CONDITION_BASED = "CONDITION_BASED"
    PREDICTIVE = "PREDICTIVE"


class FrequencyUnit(str, Enum):
    HOURS = "HOURS"
    DAYS = "DAYS"
    WEEKS = "WEEKS"
    MONTHS = "MONTHS"
    YEARS = "YEARS"
    HOURS_RUN = "HOURS_RUN"
    OPERATING_HOURS = "OPERATING_HOURS"
    TONNES = "TONNES"
    CYCLES = "CYCLES"


class PlanStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


# --- Module 4: Strategy Development ---
class ComponentCategory(str, Enum):
    MECHANICAL = "MECHANICAL"
    ELECTRICAL = "ELECTRICAL"
    INSTRUMENTATION = "INSTRUMENTATION"
    STRUCTURAL = "STRUCTURAL"
    HYDRAULIC = "HYDRAULIC"
    PNEUMATIC = "PNEUMATIC"


class EquipmentCategory(str, Enum):
    PUMP = "PUMP"
    CONVEYOR = "CONVEYOR"
    CRUSHER = "CRUSHER"
    MILL = "MILL"
    FLOTATION_CELL = "FLOTATION_CELL"
    THICKENER = "THICKENER"
    DRYER = "DRYER"
    KILN = "KILN"
    MOTOR = "MOTOR"
    TRANSFORMER = "TRANSFORMER"
    COMPRESSOR = "COMPRESSOR"
    VALVE = "VALVE"
    TANK = "TANK"
    FILTER = "FILTER"
    AGITATOR = "AGITATOR"
    OTHER = "OTHER"


class LibrarySource(str, Enum):
    R8_LIBRARY = "R8_LIBRARY"
    OEM = "OEM"
    CUSTOM = "CUSTOM"
    AI_GENERATED = "AI_GENERATED"


class CriticalityMethod(str, Enum):
    FULL_MATRIX = "FULL_MATRIX"
    SIMPLIFIED = "SIMPLIFIED"


class CriticalityCategory(str, Enum):
    SAFETY = "SAFETY"
    HEALTH = "HEALTH"
    ENVIRONMENT = "ENVIRONMENT"
    PRODUCTION = "PRODUCTION"
    OPERATING_COST = "OPERATING_COST"
    CAPITAL_COST = "CAPITAL_COST"
    SCHEDULE = "SCHEDULE"
    REVENUE = "REVENUE"
    COMMUNICATIONS = "COMMUNICATIONS"
    COMPLIANCE = "COMPLIANCE"
    REPUTATION = "REPUTATION"


class RiskClass(str, Enum):
    I_LOW = "I_LOW"
    II_MEDIUM = "II_MEDIUM"
    III_HIGH = "III_HIGH"
    IV_CRITICAL = "IV_CRITICAL"


class ApprovalStatus(str, Enum):
    DRAFT = "DRAFT"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"


class FunctionType(str, Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    PROTECTIVE = "PROTECTIVE"


class FailureType(str, Enum):
    TOTAL = "TOTAL"
    PARTIAL = "PARTIAL"


class FMStatus(str, Enum):
    RECOMMENDED = "RECOMMENDED"
    REDUNDANT = "REDUNDANT"


class Mechanism(str, Enum):
    """18 valid mechanisms from authoritative lookup table SRC-09:
    'Failure Modes (Mechanism + Cause).xlsx'
    """
    ARCS = "ARCS"
    BLOCKS = "BLOCKS"
    BREAKS_FRACTURE_SEPARATES = "BREAKS_FRACTURE_SEPARATES"
    CORRODES = "CORRODES"
    CRACKS = "CRACKS"
    DEGRADES = "DEGRADES"
    DISTORTS = "DISTORTS"
    DRIFTS = "DRIFTS"
    EXPIRES = "EXPIRES"
    IMMOBILISED = "IMMOBILISED"
    LOOSES_PRELOAD = "LOOSES_PRELOAD"
    OPEN_CIRCUIT = "OPEN_CIRCUIT"
    OVERHEATS_MELTS = "OVERHEATS_MELTS"
    SEVERS = "SEVERS"
    SHORT_CIRCUITS = "SHORT_CIRCUITS"
    THERMALLY_OVERLOADS = "THERMALLY_OVERLOADS"
    WASHES_OFF = "WASHES_OFF"
    WEARS = "WEARS"


class Cause(str, Enum):
    """Valid causes from authoritative lookup table SRC-09.
    Each cause is only valid with specific mechanisms — see VALID_FM_COMBINATIONS.
    """
    ABRASION = "ABRASION"
    AGE = "AGE"
    BREAKDOWN_IN_INSULATION = "BREAKDOWN_IN_INSULATION"
    BREAKDOWN_OF_LUBRICATION = "BREAKDOWN_OF_LUBRICATION"
    BIO_ORGANISMS = "BIO_ORGANISMS"
    CHEMICAL_ATTACK = "CHEMICAL_ATTACK"
    CHEMICAL_REACTION = "CHEMICAL_REACTION"
    CONTAMINATION = "CONTAMINATION"
    CORROSIVE_ENVIRONMENT = "CORROSIVE_ENVIRONMENT"
    CREEP = "CREEP"
    CREVICE = "CREVICE"
    CYCLIC_LOADING = "CYCLIC_LOADING"
    DISSIMILAR_METALS_CONTACT = "DISSIMILAR_METALS_CONTACT"
    ELECTRICAL_ARCING = "ELECTRICAL_ARCING"
    ELECTRICAL_OVERLOAD = "ELECTRICAL_OVERLOAD"
    ENTRAINED_AIR = "ENTRAINED_AIR"
    EXCESSIVE_FLUID_VELOCITY = "EXCESSIVE_FLUID_VELOCITY"
    EXCESSIVE_PARTICLE_SIZE = "EXCESSIVE_PARTICLE_SIZE"
    EXCESSIVE_TEMPERATURE = "EXCESSIVE_TEMPERATURE"
    EXPOSURE_TO_ATMOSPHERE = "EXPOSURE_TO_ATMOSPHERE"
    EXPOSURE_TO_HIGH_TEMP_CORROSIVE = "EXPOSURE_TO_HIGH_TEMP_CORROSIVE"
    EXPOSURE_TO_HIGH_TEMP = "EXPOSURE_TO_HIGH_TEMP"
    EXPOSURE_TO_LIQUID_METAL = "EXPOSURE_TO_LIQUID_METAL"
    HIGH_TEMP_CORROSIVE = "HIGH_TEMP_CORROSIVE"
    IMPACT_SHOCK_LOADING = "IMPACT_SHOCK_LOADING"
    INSUFFICIENT_FLUID_VELOCITY = "INSUFFICIENT_FLUID_VELOCITY"
    LACK_OF_LUBRICATION = "LACK_OF_LUBRICATION"
    LOW_PRESSURE = "LOW_PRESSURE"
    LUBRICANT_CONTAMINATION = "LUBRICANT_CONTAMINATION"
    MECHANICAL_OVERLOAD = "MECHANICAL_OVERLOAD"
    METAL_TO_METAL_CONTACT = "METAL_TO_METAL_CONTACT"
    OFF_CENTER_LOADING = "OFF_CENTER_LOADING"
    OVERCURRENT = "OVERCURRENT"
    POOR_ELECTRICAL_CONNECTIONS = "POOR_ELECTRICAL_CONNECTIONS"
    POOR_ELECTRICAL_INSULATION = "POOR_ELECTRICAL_INSULATION"
    RADIATION = "RADIATION"
    RELATIVE_MOVEMENT = "RELATIVE_MOVEMENT"
    RUBBING = "RUBBING"
    STRAY_CURRENT = "STRAY_CURRENT"
    THERMAL_OVERLOAD = "THERMAL_OVERLOAD"
    THERMAL_STRESSES = "THERMAL_STRESSES"
    UNEVEN_LOADING = "UNEVEN_LOADING"
    USE = "USE"
    VIBRATION = "VIBRATION"


# Authoritative 72 valid Mechanism+Cause combinations from SRC-09:
# 'Failure Modes (Mechanism + Cause).xlsx'
# ANY failure mode MUST use one of these combinations.
VALID_FM_COMBINATIONS: set[tuple[str, str]] = {
    (Mechanism.ARCS, Cause.BREAKDOWN_IN_INSULATION),
    (Mechanism.BLOCKS, Cause.CONTAMINATION),
    (Mechanism.BLOCKS, Cause.EXCESSIVE_PARTICLE_SIZE),
    (Mechanism.BLOCKS, Cause.INSUFFICIENT_FLUID_VELOCITY),
    (Mechanism.BREAKS_FRACTURE_SEPARATES, Cause.CYCLIC_LOADING),
    (Mechanism.BREAKS_FRACTURE_SEPARATES, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.BREAKS_FRACTURE_SEPARATES, Cause.THERMAL_OVERLOAD),
    (Mechanism.CORRODES, Cause.BIO_ORGANISMS),
    (Mechanism.CORRODES, Cause.CHEMICAL_ATTACK),
    (Mechanism.CORRODES, Cause.CORROSIVE_ENVIRONMENT),
    (Mechanism.CORRODES, Cause.CREVICE),
    (Mechanism.CORRODES, Cause.DISSIMILAR_METALS_CONTACT),
    (Mechanism.CORRODES, Cause.EXPOSURE_TO_ATMOSPHERE),
    (Mechanism.CORRODES, Cause.EXPOSURE_TO_HIGH_TEMP_CORROSIVE),
    (Mechanism.CORRODES, Cause.EXPOSURE_TO_HIGH_TEMP),
    (Mechanism.CORRODES, Cause.EXPOSURE_TO_LIQUID_METAL),
    (Mechanism.CORRODES, Cause.POOR_ELECTRICAL_CONNECTIONS),
    (Mechanism.CORRODES, Cause.POOR_ELECTRICAL_INSULATION),
    (Mechanism.CRACKS, Cause.AGE),
    (Mechanism.CRACKS, Cause.CYCLIC_LOADING),
    (Mechanism.CRACKS, Cause.EXCESSIVE_TEMPERATURE),
    (Mechanism.CRACKS, Cause.HIGH_TEMP_CORROSIVE),
    (Mechanism.CRACKS, Cause.IMPACT_SHOCK_LOADING),
    (Mechanism.CRACKS, Cause.THERMAL_STRESSES),
    (Mechanism.DEGRADES, Cause.AGE),
    (Mechanism.DEGRADES, Cause.CHEMICAL_ATTACK),
    (Mechanism.DEGRADES, Cause.CHEMICAL_REACTION),
    (Mechanism.DEGRADES, Cause.CONTAMINATION),
    (Mechanism.DEGRADES, Cause.ELECTRICAL_ARCING),
    (Mechanism.DEGRADES, Cause.ENTRAINED_AIR),
    (Mechanism.DEGRADES, Cause.EXCESSIVE_TEMPERATURE),
    (Mechanism.DEGRADES, Cause.RADIATION),
    (Mechanism.DISTORTS, Cause.IMPACT_SHOCK_LOADING),
    (Mechanism.DISTORTS, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.DISTORTS, Cause.OFF_CENTER_LOADING),
    (Mechanism.DISTORTS, Cause.USE),
    (Mechanism.DRIFTS, Cause.EXCESSIVE_TEMPERATURE),
    (Mechanism.DRIFTS, Cause.IMPACT_SHOCK_LOADING),
    (Mechanism.DRIFTS, Cause.STRAY_CURRENT),
    (Mechanism.DRIFTS, Cause.UNEVEN_LOADING),
    (Mechanism.DRIFTS, Cause.USE),
    (Mechanism.EXPIRES, Cause.AGE),
    (Mechanism.IMMOBILISED, Cause.CONTAMINATION),
    (Mechanism.IMMOBILISED, Cause.LACK_OF_LUBRICATION),
    (Mechanism.LOOSES_PRELOAD, Cause.CREEP),
    (Mechanism.LOOSES_PRELOAD, Cause.EXCESSIVE_TEMPERATURE),
    (Mechanism.LOOSES_PRELOAD, Cause.VIBRATION),
    (Mechanism.OPEN_CIRCUIT, Cause.ELECTRICAL_OVERLOAD),
    (Mechanism.OVERHEATS_MELTS, Cause.CONTAMINATION),
    (Mechanism.OVERHEATS_MELTS, Cause.ELECTRICAL_OVERLOAD),
    (Mechanism.OVERHEATS_MELTS, Cause.LACK_OF_LUBRICATION),
    (Mechanism.OVERHEATS_MELTS, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.OVERHEATS_MELTS, Cause.RELATIVE_MOVEMENT),
    (Mechanism.OVERHEATS_MELTS, Cause.RUBBING),
    (Mechanism.SEVERS, Cause.ABRASION),
    (Mechanism.SEVERS, Cause.IMPACT_SHOCK_LOADING),
    (Mechanism.SEVERS, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.SHORT_CIRCUITS, Cause.BREAKDOWN_IN_INSULATION),
    (Mechanism.SHORT_CIRCUITS, Cause.CONTAMINATION),
    (Mechanism.THERMALLY_OVERLOADS, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.THERMALLY_OVERLOADS, Cause.OVERCURRENT),
    (Mechanism.WASHES_OFF, Cause.EXCESSIVE_FLUID_VELOCITY),
    (Mechanism.WASHES_OFF, Cause.USE),
    (Mechanism.WEARS, Cause.BREAKDOWN_OF_LUBRICATION),
    (Mechanism.WEARS, Cause.ENTRAINED_AIR),
    (Mechanism.WEARS, Cause.EXCESSIVE_FLUID_VELOCITY),
    (Mechanism.WEARS, Cause.IMPACT_SHOCK_LOADING),
    (Mechanism.WEARS, Cause.LOW_PRESSURE),
    (Mechanism.WEARS, Cause.LUBRICANT_CONTAMINATION),
    (Mechanism.WEARS, Cause.MECHANICAL_OVERLOAD),
    (Mechanism.WEARS, Cause.METAL_TO_METAL_CONTACT),
    (Mechanism.WEARS, Cause.RELATIVE_MOVEMENT),
}


class FailurePattern(str, Enum):
    A_BATHTUB = "A_BATHTUB"
    B_AGE = "B_AGE"
    C_FATIGUE = "C_FATIGUE"
    D_STRESS = "D_STRESS"
    E_RANDOM = "E_RANDOM"
    F_EARLY_LIFE = "F_EARLY_LIFE"


class FailureConsequence(str, Enum):
    HIDDEN_SAFETY = "HIDDEN_SAFETY"
    HIDDEN_NONSAFETY = "HIDDEN_NONSAFETY"
    EVIDENT_SAFETY = "EVIDENT_SAFETY"
    EVIDENT_ENVIRONMENTAL = "EVIDENT_ENVIRONMENTAL"
    EVIDENT_OPERATIONAL = "EVIDENT_OPERATIONAL"
    EVIDENT_NONOPERATIONAL = "EVIDENT_NONOPERATIONAL"


class StrategyType(str, Enum):
    CONDITION_BASED = "CONDITION_BASED"
    FIXED_TIME = "FIXED_TIME"
    RUN_TO_FAILURE = "RUN_TO_FAILURE"
    FAULT_FINDING = "FAULT_FINDING"
    REDESIGN = "REDESIGN"
    OEM = "OEM"


class TaskType(str, Enum):
    INSPECT = "INSPECT"
    CHECK = "CHECK"
    TEST = "TEST"
    LUBRICATE = "LUBRICATE"
    CLEAN = "CLEAN"
    REPLACE = "REPLACE"
    REPAIR = "REPAIR"
    CALIBRATE = "CALIBRATE"


class TaskConstraint(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    TEST_MODE = "TEST_MODE"


class LabourSpecialty(str, Enum):
    FITTER = "FITTER"
    ELECTRICIAN = "ELECTRICIAN"
    INSTRUMENTIST = "INSTRUMENTIST"
    OPERATOR = "OPERATOR"
    CONMON_SPECIALIST = "CONMON_SPECIALIST"
    LUBRICATOR = "LUBRICATOR"


class UnitOfMeasure(str, Enum):
    EA = "EA"
    L = "L"
    KG = "KG"
    M = "M"


class BudgetType(str, Enum):
    REPAIR = "REPAIR"
    REPLACE = "REPLACE"


class WPType(str, Enum):
    STANDALONE = "STANDALONE"
    SUPPRESSIVE = "SUPPRESSIVE"
    SEQUENTIAL = "SEQUENTIAL"


class WPConstraint(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"


class WPApprovalStatus(str, Enum):
    DRAFT = "DRAFT"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"
    UPLOADED_TO_SAP = "UPLOADED_TO_SAP"


class SAPUploadStatus(str, Enum):
    GENERATED = "GENERATED"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"
    UPLOADED = "UPLOADED"


class JustificationCategory(str, Enum):
    MODIFIED = "MODIFIED"
    ELIMINATED = "ELIMINATED"
    FREQUENCY_CHANGE = "FREQUENCY_CHANGE"
    TACTIC_CHANGE = "TACTIC_CHANGE"
    MAINTAINED = "MAINTAINED"
    NEW_TASK = "NEW_TASK"


# ============================================================
# MODULE 1-3 MODELS
# ============================================================

# --- 3.1 Equipment Hierarchy ---
class Plant(BaseModel):
    plant_id: str = Field(..., description="SAP Plant code, e.g., 'OCP-JFC1'")
    name: str
    name_fr: str
    name_ar: str = ""
    location: str = ""


class FunctionalLocation(BaseModel):
    func_loc_id: str = Field(..., description="SAP TPLNR, e.g., 'JFC1-MIN-BRY-01'")
    description: str
    description_fr: str
    level: int = Field(..., ge=1, le=4)
    parent_func_loc_id: Optional[str] = None
    plant_id: str


class Equipment(BaseModel):
    equipment_id: str = Field(..., description="SAP EQUNR")
    tag: str = Field(..., description="Technical TAG, e.g., 'BRY-SAG-ML-001'")
    description: str
    description_fr: str
    equipment_type: str
    manufacturer: str = ""
    model: str = ""
    serial_number: str = ""
    installation_date: Optional[date] = None
    criticality: EquipmentCriticality
    func_loc_id: str
    status: EquipmentStatus = EquipmentStatus.ACTIVE
    weight_kg: Optional[float] = None
    power_kw: Optional[float] = None


class Component(BaseModel):
    component_id: str
    description: str
    description_fr: str
    parent_equipment_id: str
    component_type: str
    manufacturer: str = ""
    part_number: str = ""


# --- 3.2 Field Capture Input ---
class CaptureImage(BaseModel):
    image_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_path: str
    capture_timestamp: datetime
    gps_coordinates: Optional[str] = None


class FieldCaptureInput(BaseModel):
    capture_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime
    technician_id: str
    technician_name: str
    capture_type: CaptureType
    language_detected: Language
    raw_voice_text: Optional[str] = None
    raw_text_input: Optional[str] = None
    images: list[CaptureImage] = Field(default_factory=list)
    equipment_tag_manual: Optional[str] = None
    location_hint: Optional[str] = None

    @model_validator(mode="after")
    def validate_capture_content(self):
        has_voice = self.raw_voice_text is not None
        has_text = self.raw_text_input is not None
        has_images = len(self.images) > 0
        if not (has_voice or has_text or has_images):
            raise ValueError("At least one input (voice, text, or images) must be provided")
        if self.capture_type == CaptureType.VOICE and not has_voice:
            raise ValueError("VOICE capture must include raw_voice_text")
        if self.capture_type == CaptureType.TEXT and not has_text:
            raise ValueError("TEXT capture must include raw_text_input")
        if self.capture_type == CaptureType.IMAGE and not has_images:
            raise ValueError("IMAGE capture must include at least one image")
        if self.capture_type == CaptureType.VOICE_IMAGE and not (has_voice and has_images):
            raise ValueError("VOICE+IMAGE capture must include both voice text and images")
        return self

    @field_validator("images")
    @classmethod
    def max_five_images(cls, v):
        if len(v) > 5:
            raise ValueError("Maximum 5 images allowed per capture")
        return v


# --- 3.3 Structured Work Request ---
class EquipmentIdentification(BaseModel):
    equipment_id: str
    equipment_tag: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    resolution_method: ResolutionMethod


class ProblemDescription(BaseModel):
    original_text: str
    structured_description: str
    structured_description_fr: str
    failure_mode_detected: Optional[str] = None
    failure_mode_code: Optional[str] = None
    affected_component: Optional[str] = None


class AIClassification(BaseModel):
    work_order_type: WorkOrderType
    priority_suggested: Priority
    priority_justification: str
    estimated_duration_hours: float = Field(..., gt=0)
    required_specialties: list[str]
    safety_flags: list[str] = Field(default_factory=list)


class SuggestedSparePart(BaseModel):
    sap_material_code: str
    description: str
    quantity_needed: int = Field(..., ge=1)
    availability_status: AvailabilityStatus
    warehouse_location: Optional[str] = None
    lead_time_days: Optional[int] = None


class ImageAnalysis(BaseModel):
    anomalies_detected: list[str] = Field(default_factory=list)
    component_identified: Optional[str] = None
    severity_visual: Optional[VisualSeverity] = None


class Validation(BaseModel):
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    modifications_made: list[str] = Field(default_factory=list)
    final_priority: Optional[Priority] = None


class StructuredWorkRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_capture_id: str
    created_at: datetime
    status: WorkRequestStatus = WorkRequestStatus.DRAFT
    equipment_identification: EquipmentIdentification
    problem_description: ProblemDescription
    ai_classification: AIClassification
    spare_parts_suggested: list[SuggestedSparePart] = Field(default_factory=list)
    image_analysis: Optional[ImageAnalysis] = None
    validation: Validation = Field(default_factory=Validation)


# --- 3.4 Planner Recommendation ---
class WorkforceAvailability(BaseModel):
    specialty: str
    technicians_available: int = Field(..., ge=0)
    next_available_slot: datetime


class MissingMaterial(BaseModel):
    material_code: str
    description: str
    estimated_arrival: Optional[date] = None
    alternative_available: bool = False
    alternative_code: Optional[str] = None


class MaterialsStatus(BaseModel):
    all_available: bool
    missing_items: list[MissingMaterial] = Field(default_factory=list)


class ShutdownWindow(BaseModel):
    next_available: Optional[datetime] = None
    type: Optional[ShutdownType] = None
    duration_hours: Optional[float] = None


class ProductionImpact(BaseModel):
    estimated_downtime_hours: float = Field(..., ge=0)
    production_loss_tons: Optional[float] = None
    cost_estimate_usd: Optional[float] = None


class ResourceAnalysis(BaseModel):
    workforce_available: list[WorkforceAvailability]
    materials_status: MaterialsStatus
    shutdown_window: ShutdownWindow
    production_impact: ProductionImpact


class SchedulingSuggestion(BaseModel):
    recommended_date: date
    recommended_shift: ShiftType
    reasoning: str
    conflicts: list[str] = Field(default_factory=list)
    groupable_with: list[str] = Field(default_factory=list)


class RiskAssessment(BaseModel):
    risk_level: RiskLevel
    risk_factors: list[str]
    recommendation: str


class PlannerRecommendation(BaseModel):
    recommendation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    work_request_id: str
    generated_at: datetime
    resource_analysis: ResourceAnalysis
    scheduling_suggestion: SchedulingSuggestion
    risk_assessment: RiskAssessment
    planner_action_required: PlannerAction
    ai_confidence: float = Field(..., ge=0.0, le=1.0)


# --- 3.5 Backlog Item ---
class BacklogItem(BaseModel):
    backlog_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    work_request_id: str
    equipment_id: str
    equipment_tag: str
    priority: Priority
    work_order_type: BacklogWOType
    created_date: date
    age_days: int = Field(..., ge=0)
    status: BacklogStatus
    blocking_reason: Optional[str] = None
    estimated_duration_hours: float = Field(..., gt=0)
    required_specialties: list[str]
    materials_ready: bool
    shutdown_required: bool
    groupable: bool = False
    group_id: Optional[str] = None


# --- 3.6 Optimized Backlog ---
class BacklogStratification(BaseModel):
    by_reason: dict[str, int]
    by_priority: dict[str, int]
    by_equipment_criticality: dict[str, int]


class BacklogWorkPackage(BaseModel):
    package_id: str
    name: str
    grouped_items: list[str]
    reason_for_grouping: str
    scheduled_date: date
    scheduled_shift: ShiftType
    total_duration_hours: float = Field(..., gt=0)
    assigned_team: list[str]
    materials_status: MaterialsReadyStatus


class ScheduleEntry(BaseModel):
    date: date
    shift: ShiftType
    work_packages: list[str]
    total_hours: float = Field(..., ge=0)
    utilization_percent: float = Field(..., ge=0, le=100)


class BacklogAlert(BaseModel):
    type: AlertType
    message: str
    affected_items: list[str]


class OptimizedBacklog(BaseModel):
    optimization_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    generated_at: datetime
    period_start: date
    period_end: date
    total_backlog_items: int = Field(..., ge=0)
    items_schedulable_now: int = Field(..., ge=0)
    items_blocked: int = Field(..., ge=0)
    estimated_total_hours: float = Field(..., ge=0)
    stratification: BacklogStratification
    work_packages: list[BacklogWorkPackage] = Field(default_factory=list)
    schedule_proposal: list[ScheduleEntry] = Field(default_factory=list)
    alerts: list[BacklogAlert] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_counts(self):
        if self.items_schedulable_now + self.items_blocked > self.total_backlog_items:
            raise ValueError("schedulable + blocked cannot exceed total items")
        return self


# --- 3.7 Work Order History ---
class MaterialConsumed(BaseModel):
    material_code: str
    description: str
    quantity: float = Field(..., gt=0)
    unit: str


class WorkOrderHistory(BaseModel):
    work_order_id: str
    order_type: BacklogWOType
    equipment_id: str
    equipment_tag: str
    func_loc_id: str
    description: str
    description_fr: str
    priority: str = Field(..., pattern=r"^[1-4]$")
    status: WOHistoryStatus
    created_date: date
    planned_start: date
    planned_end: date
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    actual_duration_hours: Optional[float] = None
    man_hours: Optional[float] = None
    problem_description: str
    cause_description: Optional[str] = None
    solution_description: Optional[str] = None
    materials_consumed: list[MaterialConsumed] = Field(default_factory=list)
    assigned_team: str
    postponement_reason: Optional[str] = None
    cost_total: Optional[float] = None


# --- 3.8 Spare Part / BOM ---
class SparePart(BaseModel):
    material_code: str
    description: str
    description_fr: str
    material_group: str
    applicable_equipment: list[str]
    manufacturer: str
    manufacturer_part_number: str
    unit_of_measure: str
    criticality: MaterialCriticality
    lead_time_days: int = Field(..., ge=0)
    supplier: str
    unit_cost_usd: float = Field(..., ge=0)


class InventoryItem(BaseModel):
    material_code: str
    warehouse_id: str
    warehouse_location: str
    quantity_on_hand: float = Field(..., ge=0)
    quantity_reserved: float = Field(..., ge=0)
    quantity_available: float = Field(..., ge=0)
    min_stock: float = Field(..., ge=0)
    safety_stock: float = Field(..., ge=0)
    reorder_point: float = Field(..., ge=0)
    last_movement_date: date


# --- 3.9 Maintenance Plan ---
class MaintenancePlanTask(BaseModel):
    task_id: str
    description: str
    description_fr: str
    duration_hours: float = Field(..., gt=0)
    specialty_required: str
    spare_parts: list[str] = Field(default_factory=list)


class MaintenancePlan(BaseModel):
    plan_id: str
    description: str
    description_fr: str
    equipment_id: str
    equipment_tag: str
    strategy: PlanStrategy
    frequency_days: int = Field(..., gt=0)
    frequency_unit: str
    task_list: list[MaintenancePlanTask]
    last_execution_date: date
    next_execution_date: date
    status: PlanStatus = PlanStatus.ACTIVE


# ============================================================
# MODULE 4 MODELS: STRATEGY DEVELOPMENT
# ============================================================

# --- 9.1 Component Library Item ---
class ComponentLibraryItem(BaseModel):
    component_lib_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    component_category: ComponentCategory
    description: str
    description_fr: str
    typical_manufacturers: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    source: LibrarySource
    version: int = Field(default=1, ge=1)
    locked: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# --- 9.2 Equipment Library Item ---
class ComponentInstance(BaseModel):
    instance_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    component_lib_ref: str
    instance_name: str
    quantity: int = Field(default=1, ge=1)
    is_maintainable_item: bool = True


class SubAssembly(BaseModel):
    sub_assembly_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    order: int = Field(..., ge=1)
    components: list[ComponentInstance] = Field(default_factory=list)


class EquipmentLibraryItem(BaseModel):
    equipment_lib_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    equipment_category: EquipmentCategory
    make: str
    model: str
    operational_context: str
    description: str
    description_fr: str
    sub_assemblies: list[SubAssembly] = Field(default_factory=list)
    source: LibrarySource
    version: int = Field(default=1, ge=1)
    locked: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# --- 9.3 Plant Hierarchy Node ---
class NodeMetadata(BaseModel):
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[date] = None
    power_kw: Optional[float] = None
    weight_kg: Optional[float] = None
    operational_hours: Optional[float] = None


class PlantHierarchyNode(BaseModel):
    node_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    node_type: NodeType
    name: str
    name_fr: str
    code: str
    parent_node_id: Optional[str] = None
    level: int = Field(..., ge=1, le=6)
    equipment_lib_ref: Optional[str] = None
    component_lib_ref: Optional[str] = None
    sap_func_loc: Optional[str] = None
    sap_equipment_nr: Optional[str] = None
    tag: Optional[str] = None
    status: EquipmentStatus = EquipmentStatus.ACTIVE
    order: int = Field(default=1, ge=1)
    metadata: NodeMetadata = Field(default_factory=NodeMetadata)

    @model_validator(mode="after")
    def validate_level_type(self):
        expected = {
            NodeType.PLANT: 1, NodeType.AREA: 2, NodeType.SYSTEM: 3,
            NodeType.EQUIPMENT: 4, NodeType.SUB_ASSEMBLY: 5,
            NodeType.MAINTAINABLE_ITEM: 6,
        }
        if expected.get(self.node_type) != self.level:
            raise ValueError(
                f"Node type {self.node_type} must be level {expected[self.node_type]}, got {self.level}"
            )
        return self

    @model_validator(mode="after")
    def validate_parent(self):
        if self.node_type == NodeType.PLANT and self.parent_node_id is not None:
            raise ValueError("PLANT nodes must not have a parent")
        if self.node_type != NodeType.PLANT and self.parent_node_id is None:
            raise ValueError(f"{self.node_type} nodes must have a parent")
        return self


# --- 9.4 Criticality Assessment ---
class CriteriaScore(BaseModel):
    category: CriticalityCategory
    consequence_level: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class CriticalityAssessment(BaseModel):
    assessment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    node_id: str
    assessed_at: datetime
    assessed_by: str
    method: CriticalityMethod
    criteria_scores: list[CriteriaScore]
    probability: int = Field(..., ge=1, le=5)
    overall_score: float = Field(default=0.0)
    risk_class: RiskClass
    ai_suggested_class: Optional[RiskClass] = None
    ai_justification: Optional[str] = None
    status: ApprovalStatus = ApprovalStatus.DRAFT

    @field_validator("criteria_scores")
    @classmethod
    def validate_criteria_count(cls, v, info):
        if len(v) == 0:
            raise ValueError("At least one criteria score is required")
        categories = [s.category for s in v]
        if len(categories) != len(set(categories)):
            raise ValueError("Duplicate criteria categories found")
        return v


# --- 9.5 Function ---
class Function(BaseModel):
    function_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    node_id: str
    function_type: FunctionType
    description: str
    description_fr: str
    performance_standard: Optional[str] = None
    ai_generated: bool = False
    status: ApprovalStatus = ApprovalStatus.DRAFT


# --- 9.6 Functional Failure ---
class FunctionalFailure(BaseModel):
    failure_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    function_id: str
    failure_type: FailureType
    description: str
    description_fr: str


# --- 9.7 Failure Mode ---
class FailureEffect(BaseModel):
    evidence: str
    safety_threat: Optional[str] = None
    environmental_threat: Optional[str] = None
    production_impact: Optional[str] = None
    physical_damage: Optional[str] = None
    repair_description: Optional[str] = None
    estimated_downtime_hours: Optional[float] = None


class FailureMode(BaseModel):
    failure_mode_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    functional_failure_id: str
    status: FMStatus = FMStatus.RECOMMENDED
    what: str = Field(..., min_length=1)
    mechanism: Mechanism
    cause: Cause
    failure_pattern: Optional[FailurePattern] = None
    failure_consequence: FailureConsequence
    is_hidden: bool
    failure_effect: FailureEffect
    strategy_type: StrategyType
    ai_generated: bool = False
    ai_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    existing_task_source: Optional[str] = None
    justification_category: Optional[JustificationCategory] = None

    @field_validator("what")
    @classmethod
    def validate_what_capitalized(cls, v):
        if v and not v[0].isupper():
            raise ValueError("'what' field must start with a capital letter (Rule FM-01)")
        return v

    @model_validator(mode="after")
    def validate_mechanism_cause_combination(self):
        """Validate that Mechanism+Cause is one of the 72 authoritative combinations
        from SRC-09: 'Failure Modes (Mechanism + Cause).xlsx'.
        See gemini.md §4.4 — this is a MANDATORY constraint.
        """
        combo = (self.mechanism, self.cause)
        if combo not in VALID_FM_COMBINATIONS:
            raise ValueError(
                f"Invalid Mechanism+Cause combination: {self.mechanism.value} + {self.cause.value}. "
                f"Must be one of the 72 valid combinations from 'Failure Modes (Mechanism + Cause).xlsx' (SRC-09). "
                f"See gemini.md §4.4 for the authoritative list."
            )
        return self

    @model_validator(mode="after")
    def validate_hidden_consequence(self):
        if self.is_hidden and self.failure_consequence not in (
            FailureConsequence.HIDDEN_SAFETY,
            FailureConsequence.HIDDEN_NONSAFETY,
        ):
            raise ValueError("Hidden failures must have HIDDEN_* consequence")
        if not self.is_hidden and self.failure_consequence in (
            FailureConsequence.HIDDEN_SAFETY,
            FailureConsequence.HIDDEN_NONSAFETY,
        ):
            raise ValueError("Evident failures cannot have HIDDEN_* consequence")
        return self


# --- 9.8 Maintenance Task ---
class LabourResource(BaseModel):
    specialty: LabourSpecialty
    quantity: int = Field(..., ge=1)
    hours_per_person: float = Field(..., gt=0)
    hourly_rate: Optional[float] = None


class MaterialResource(BaseModel):
    material_code: Optional[str] = None
    description: str
    part_number: Optional[str] = None
    stock_code: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit_of_measure: UnitOfMeasure
    unit_price: Optional[float] = None


class MaintenanceTask(BaseModel):
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., max_length=72)
    name_fr: str
    task_type: TaskType
    is_secondary: bool = False
    acceptable_limits: Optional[str] = None
    conditional_comments: Optional[str] = None
    consequences: str
    justification: Optional[str] = None
    constraint: TaskConstraint
    access_time_hours: float = Field(..., ge=0)
    frequency_value: float = Field(..., gt=0)
    frequency_unit: FrequencyUnit
    origin: Optional[str] = None
    budget_type: Optional[BudgetType] = None
    budgeted_life: Optional[float] = None
    labour_resources: list[LabourResource] = Field(default_factory=list)
    material_resources: list[MaterialResource] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    special_equipment: list[str] = Field(default_factory=list)
    ai_generated: bool = False
    ai_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    status: ApprovalStatus = ApprovalStatus.DRAFT

    @model_validator(mode="after")
    def validate_constraint_access_time(self):
        if self.constraint == TaskConstraint.ONLINE and self.access_time_hours != 0:
            raise ValueError("Online tasks must have access_time_hours = 0 (Rule T-17)")
        if self.constraint == TaskConstraint.OFFLINE and self.access_time_hours == 0:
            raise ValueError("Offline tasks must have access_time_hours > 0 (Rule T-17)")
        return self


# --- 9.9 Work Package ---
class AllocatedTask(BaseModel):
    task_id: str
    order: int = Field(..., ge=1)
    operation_number: int = Field(..., ge=10)

    @field_validator("operation_number")
    @classmethod
    def validate_op_number(cls, v):
        if v % 10 != 0:
            raise ValueError("SAP operation numbers must be multiples of 10")
        return v


class LabourSummaryEntry(BaseModel):
    specialty: str
    hours: float = Field(..., ge=0)
    people: int = Field(..., ge=1)


class LabourSummary(BaseModel):
    total_hours: float = Field(..., ge=0)
    by_specialty: list[LabourSummaryEntry] = Field(default_factory=list)


class MaterialSummaryEntry(BaseModel):
    material_code: str
    description: str
    quantity: float = Field(..., gt=0)


class SAPUploadRef(BaseModel):
    maintenance_item_ref: Optional[str] = None
    task_list_ref: Optional[str] = None
    work_plan_ref: Optional[str] = None


class WorkPackage(BaseModel):
    work_package_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., max_length=40)
    code: str
    node_id: str
    frequency_value: float = Field(..., gt=0)
    frequency_unit: FrequencyUnit
    constraint: WPConstraint
    access_time_hours: float = Field(..., ge=0)
    work_package_type: WPType
    job_preparation: Optional[str] = None
    post_shutdown: Optional[str] = None
    allocated_tasks: list[AllocatedTask] = Field(default_factory=list)
    labour_summary: LabourSummary = Field(default_factory=lambda: LabourSummary(total_hours=0))
    material_summary: list[MaterialSummaryEntry] = Field(default_factory=list)
    sap_upload: SAPUploadRef = Field(default_factory=SAPUploadRef)
    status: WPApprovalStatus = WPApprovalStatus.DRAFT

    @field_validator("name")
    @classmethod
    def validate_wp_name_caps(cls, v):
        if v != v.upper():
            raise ValueError("Work package name must be ALL CAPS (Rule WP-06)")
        return v


# --- 9.10 SAP Upload Package ---
class SAPMaintenancePlan(BaseModel):
    plan_id: str
    description: str
    category: str = "PM"
    cycle_value: int = Field(..., gt=0)
    cycle_unit: str
    call_horizon_pct: int = Field(default=50, ge=1, le=100)
    scheduling_period: int = Field(..., gt=0)
    scheduling_unit: str


class SAPMaintenanceItem(BaseModel):
    item_ref: str
    description: str
    order_type: str = "PM03"
    func_loc: str
    main_work_center: str
    planner_group: int
    task_list_ref: str
    priority: str


class SAPOperation(BaseModel):
    operation_number: int = Field(..., ge=10)
    work_centre: str
    control_key: str = "PMIN"
    short_text: str = Field(..., max_length=72)
    duration_hours: float = Field(..., gt=0)
    unit: str = "H"
    num_workers: int = Field(..., ge=1)


class SAPTaskList(BaseModel):
    list_ref: str
    description: str
    func_loc: str
    system_condition: int = Field(..., ge=1, le=3)
    operations: list[SAPOperation]


class SAPUploadPackage(BaseModel):
    package_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    generated_at: datetime = Field(default_factory=datetime.now)
    plant_code: str
    maintenance_plan: SAPMaintenancePlan
    maintenance_items: list[SAPMaintenanceItem]
    task_lists: list[SAPTaskList]
    status: SAPUploadStatus = SAPUploadStatus.GENERATED


# ============================================================
# GECAMIN EXTENSIONS — Strategic Recommendations Implementation
# ============================================================

# --- Enums for GECAMIN features ---
class CAPAStatus(str, Enum):
    """CAPA lifecycle states (ISO 55002 §10.2)."""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    CLOSED = "CLOSED"
    VERIFIED = "VERIFIED"


class CAPAType(str, Enum):
    """Corrective vs Preventive action (ISO 55002 §10.2)."""
    CORRECTIVE = "CORRECTIVE"
    PREVENTIVE = "PREVENTIVE"


class PDCAPhase(str, Enum):
    """Deming PDCA cycle phases."""
    PLAN = "PLAN"
    DO = "DO"
    CHECK = "CHECK"
    ACT = "ACT"


class HealthDimension(str, Enum):
    """5 dimensions of the Asset Health Index (REF-12 Rec 4, SQM validated)."""
    CRITICALITY = "CRITICALITY"
    BACKLOG_PRESSURE = "BACKLOG_PRESSURE"
    STRATEGY_COVERAGE = "STRATEGY_COVERAGE"
    CONDITION_STATUS = "CONDITION_STATUS"
    EXECUTION_COMPLIANCE = "EXECUTION_COMPLIANCE"


class VarianceLevel(str, Enum):
    """Multi-plant variance alert levels (REF-12 Rec 7)."""
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class ExpertDomain(str, Enum):
    """Expert specialization domains (Neuro-Arq Pillar 2: TMS)."""
    RELIABILITY = "RELIABILITY"
    MECHANICAL = "MECHANICAL"
    ELECTRICAL = "ELECTRICAL"
    INSTRUMENTATION = "INSTRUMENTATION"
    PROCESS = "PROCESS"
    SAFETY = "SAFETY"
    PLANNING = "PLANNING"
    SPARE_PARTS = "SPARE_PARTS"


class StakeholderRole(str, Enum):
    """Stakeholder roles (ISO 55002 §4.2)."""
    MAINTENANCE_MANAGER = "MAINTENANCE_MANAGER"
    RELIABILITY_ENGINEER = "RELIABILITY_ENGINEER"
    PLANNER = "PLANNER"
    TECHNICIAN = "TECHNICIAN"
    OPERATOR = "OPERATOR"
    PLANT_MANAGER = "PLANT_MANAGER"
    SAFETY_OFFICER = "SAFETY_OFFICER"
    PROCUREMENT = "PROCUREMENT"


# --- Rec 4: Asset Health Index (SQM validated at GECAMIN S6) ---
class HealthScoreDimension(BaseModel):
    """One dimension of the Asset Health Score."""
    dimension: HealthDimension
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized 0-100 score")
    weight: float = Field(default=0.2, ge=0.0, le=1.0, description="Weight in composite")
    raw_value: Optional[float] = None
    details: str = ""


class AssetHealthScore(BaseModel):
    """Composite Asset Health Index for a single equipment/plant node.
    REF-12 Rec 4: Combines criticality + backlog + strategy + condition + execution.
    Validated by SQM's Cristian Ramirez at GECAMIN S6.
    """
    score_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    node_id: str = Field(..., description="PlantHierarchyNode reference")
    plant_id: str
    equipment_tag: str
    calculated_at: datetime = Field(default_factory=datetime.now)
    dimensions: list[HealthScoreDimension]
    composite_score: float = Field(default=0.0, ge=0.0, le=100.0)
    health_class: str = ""  # "HEALTHY", "AT_RISK", "CRITICAL", "UNKNOWN"
    trend: str = ""  # "IMPROVING", "STABLE", "DEGRADING"
    recommendations: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def compute_composite(self):
        if self.dimensions:
            total_weight = sum(d.weight for d in self.dimensions)
            if total_weight > 0:
                self.composite_score = round(
                    sum(d.score * d.weight for d in self.dimensions) / total_weight, 1
                )
        if self.composite_score >= 75:
            self.health_class = "HEALTHY"
        elif self.composite_score >= 50:
            self.health_class = "AT_RISK"
        elif self.composite_score > 0:
            self.health_class = "CRITICAL"
        else:
            self.health_class = "UNKNOWN"
        return self


# --- Rec 6: Statistical Failure Prediction (GECAMIN S3/S7 validated) ---
class WeibullParameters(BaseModel):
    """Weibull distribution parameters for failure prediction.
    REF-12 Rec 6: Statistical methods (Weibull, NHPP) validated by
    Jean Campos (83% accuracy) and Adolfo Casilla (NHPP models).
    """
    beta: float = Field(..., gt=0, description="Shape parameter (>1 = wear-out, <1 = early life, =1 = random)")
    eta: float = Field(..., gt=0, description="Scale parameter (characteristic life in days)")
    gamma: float = Field(default=0.0, ge=0, description="Location parameter (failure-free period)")
    r_squared: float = Field(default=0.0, ge=0.0, le=1.0, description="Goodness of fit")
    sample_size: int = Field(default=0, ge=0)


class FailurePrediction(BaseModel):
    """Predicted failure window for an equipment item.
    Output of WeibullEngine — enters as DRAFT recommendation (safety-first).
    """
    prediction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    equipment_id: str
    equipment_tag: str
    predicted_at: datetime = Field(default_factory=datetime.now)
    weibull_params: WeibullParameters
    current_age_days: float = Field(..., ge=0)
    reliability_current: float = Field(..., ge=0.0, le=1.0, description="R(t) at current age")
    predicted_failure_window_days: float = Field(..., ge=0, description="Days until predicted failure")
    confidence_level: float = Field(default=0.9, ge=0.5, le=0.99)
    risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    failure_pattern: Optional[FailurePattern] = None
    recommendation: str = ""
    status: ApprovalStatus = ApprovalStatus.DRAFT


# --- Rec 7: Multi-Plant Variance Detection ---
class PlantMetricSnapshot(BaseModel):
    """KPI snapshot for one plant at a point in time."""
    plant_id: str
    plant_name: str
    metric_name: str
    metric_value: float
    period_start: date
    period_end: date


class PlantVarianceAlert(BaseModel):
    """Alert when a plant's metrics diverge >2σ from portfolio mean.
    REF-12 Rec 7: OCP has 15 plants with heterogeneous workflows.
    """
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    plant_name: str
    metric_name: str
    plant_value: float
    portfolio_mean: float
    portfolio_std: float
    z_score: float
    variance_level: VarianceLevel
    detected_at: datetime = Field(default_factory=datetime.now)
    message: str = ""

    @model_validator(mode="after")
    def classify_variance(self):
        abs_z = abs(self.z_score)
        if abs_z >= 3.0:
            self.variance_level = VarianceLevel.CRITICAL
        elif abs_z >= 2.0:
            self.variance_level = VarianceLevel.WARNING
        else:
            self.variance_level = VarianceLevel.NORMAL
        return self


# --- Rec 8: ISO 55002 Governance Extensions ---

# KPI Dashboard Engine (ISO §9.1.2.2)
class KPIMetrics(BaseModel):
    """Maintenance KPI calculations from work order history.
    REF-12 Rec 8: Bridges ISO 55002 §9.1 gap.
    """
    metrics_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    equipment_id: Optional[str] = None
    period_start: date
    period_end: date
    calculated_at: datetime = Field(default_factory=datetime.now)
    mtbf_days: Optional[float] = Field(default=None, ge=0, description="Mean Time Between Failures")
    mttr_hours: Optional[float] = Field(default=None, ge=0, description="Mean Time To Repair")
    availability_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    oee_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Overall Equipment Effectiveness")
    schedule_compliance_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    backlog_hours: float = Field(default=0.0, ge=0.0)
    pm_compliance_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Preventive Maintenance compliance")
    total_work_orders: int = Field(default=0, ge=0)
    corrective_wo_count: int = Field(default=0, ge=0)
    preventive_wo_count: int = Field(default=0, ge=0)
    reactive_ratio_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)


# CAPA Tracker (ISO §10.2)
class CAPAItem(BaseModel):
    """Corrective/Preventive Action item with PDCA cycle tracking.
    REF-12 Rec 8: Addresses ISO 55002 §10.2 gap.
    """
    capa_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    capa_type: CAPAType
    title: str
    description: str
    plant_id: str
    equipment_id: Optional[str] = None
    source: str = Field(..., description="Origin: audit, incident, variance, review")
    root_cause: Optional[str] = None
    current_phase: PDCAPhase = PDCAPhase.PLAN
    status: CAPAStatus = CAPAStatus.OPEN
    assigned_to: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    target_date: Optional[date] = None
    closed_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    actions_planned: list[str] = Field(default_factory=list)
    actions_completed: list[str] = Field(default_factory=list)
    effectiveness_verified: bool = False
    lessons_learned: Optional[str] = None

    @model_validator(mode="after")
    def validate_lifecycle(self):
        if self.status == CAPAStatus.VERIFIED and not self.effectiveness_verified:
            raise ValueError("VERIFIED status requires effectiveness_verified=True")
        if self.status == CAPAStatus.CLOSED and self.closed_at is None:
            raise ValueError("CLOSED status requires closed_at timestamp")
        return self


# Management Review Summary (ISO §9.3)
class ManagementReviewSummary(BaseModel):
    """Executive summary for management review.
    REF-12 Rec 8: Addresses ISO 55002 §9.3 gap.
    Combines Asset Health Index + KPIs + trends.
    """
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    period_start: date
    period_end: date
    generated_at: datetime = Field(default_factory=datetime.now)
    # KPI Summary
    kpi_summary: Optional[KPIMetrics] = None
    # Health scores (per-equipment)
    health_scores: list[AssetHealthScore] = Field(default_factory=list)
    avg_health_score: float = Field(default=0.0, ge=0.0, le=100.0)
    # Variance alerts
    variance_alerts: list[PlantVarianceAlert] = Field(default_factory=list)
    # CAPA status
    open_capas: int = Field(default=0, ge=0)
    overdue_capas: int = Field(default=0, ge=0)
    # Trends
    health_trend: str = ""  # IMPROVING, STABLE, DEGRADING
    kpi_trends: dict[str, str] = Field(default_factory=dict)
    # Executive summary
    key_findings: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)


# ============================================================
# NEURO-ARCHITECTURE EXTENSIONS — Behavioral Science Models
# ============================================================

# --- Pillar 2: Transactive Memory Systems (TMS) ---
class ExpertCard(BaseModel):
    """Expert knowledge card for Transactive Memory System.
    Neuro-Arq Pillar 2: Maps 'who knows what' to reduce cognitive load.
    ISO 55002 §4.2: Stakeholder registry integration.
    """
    expert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    role: StakeholderRole
    plant_id: str
    domains: list[ExpertDomain]
    equipment_expertise: list[str] = Field(default_factory=list, description="Equipment TAGs this expert knows")
    certifications: list[str] = Field(default_factory=list)
    years_experience: int = Field(default=0, ge=0)
    resolution_count: int = Field(default=0, ge=0, description="Number of issues resolved")
    last_active: Optional[datetime] = None
    contact_method: str = ""
    languages: list[Language] = Field(default_factory=list)


# --- Pillar 5: Psychological Safety ---
class IpsativeFeedback(BaseModel):
    """Ipsative (self-referencing) performance feedback.
    Neuro-Arq Pillar 5: Compare user to their OWN past, never to peers.
    """
    feedback_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    metric_name: str
    current_value: float
    previous_value: float
    improvement_pct: float = 0.0
    period: str = ""  # "this_week", "this_month"
    message: str = ""
    generated_at: datetime = Field(default_factory=datetime.now)

    @model_validator(mode="after")
    def compute_improvement(self):
        if self.previous_value > 0:
            self.improvement_pct = round(
                ((self.current_value - self.previous_value) / self.previous_value) * 100, 1
            )
        return self


# --- Pillar 6: Behavioral Nudges ---
class CompletionProgress(BaseModel):
    """Completion progress tracker (Zeigarnik effect nudge).
    Neuro-Arq Pillar 6: 'Asset Data Profile: 80% complete' motivates closing the gap.
    """
    entity_type: str = Field(..., description="E.g., 'Strategy', 'FMEA', 'WorkPackage'")
    entity_id: str
    entity_name: str
    total_steps: int = Field(..., ge=1)
    completed_steps: int = Field(default=0, ge=0)
    completion_pct: float = 0.0
    remaining_items: list[str] = Field(default_factory=list)
    next_action: str = ""

    @model_validator(mode="after")
    def compute_pct(self):
        if self.total_steps > 0:
            self.completion_pct = round(
                (self.completed_steps / self.total_steps) * 100, 1
            )
        if self.completed_steps > self.total_steps:
            raise ValueError("completed_steps cannot exceed total_steps")
        return self


# ============================================================
# PHASE 4A: GFSN METHODOLOGY ALIGNMENT
# ============================================================

# --- 4A.1-4A.2: GFSN Criticality ---


class CriticalityMode(str, Enum):
    R8 = "R8"
    GFSN = "GFSN"


class GFSNCriticalityBand(str, Enum):
    ALTO = "ALTO"
    MODERADO = "MODERADO"
    BAJO = "BAJO"


class GFSNConsequenceCategory(str, Enum):
    BUSINESS_IMPACT = "BUSINESS_IMPACT"
    OPERATIONAL_COST = "OPERATIONAL_COST"
    INTERRUPTION = "INTERRUPTION"
    SAFETY = "SAFETY"
    ENVIRONMENT = "ENVIRONMENT"
    RSC = "RSC"


# --- 4A.3: GFSN Priority ---


class PriorityMode(str, Enum):
    ADDITIVE = "ADDITIVE"
    GFSN_MATRIX = "GFSN_MATRIX"


class GFSNPriority(str, Enum):
    ALTO = "ALTO"
    MODERADO = "MODERADO"
    BAJO = "BAJO"


# --- 4A.4-4A.5: SAP Status Models ---


class SAPWorkOrderStatus(str, Enum):
    PLN = "PLN"
    FMA = "FMA"
    LPE = "LPE"
    LIB = "LIB"
    IMPR = "IMPR"
    NOTP = "NOTP"
    NOTI = "NOTI"
    CTEC = "CTEC"


class SAPNotificationStatus(str, Enum):
    MEAB = "MEAB"
    METR = "METR"
    ORAS = "ORAS"
    MECE = "MECE"


# --- 4A.6-4A.8: RCA Engine ---


class RCALevel(str, Enum):
    LEVEL_1 = "1"
    LEVEL_2 = "2"
    LEVEL_3 = "3"


class RCAStatus(str, Enum):
    OPEN = "OPEN"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    COMPLETED = "COMPLETED"
    REVIEWED = "REVIEWED"


class EvidenceType(str, Enum):
    INFERRED = "INFERRED"
    SENSORY = "SENSORY"
    HYPOTHESIS = "HYPOTHESIS"


class RootCauseLevel(str, Enum):
    PHYSICAL = "PHYSICAL"
    HUMAN = "HUMAN"
    LATENT = "LATENT"


class Evidence5PCategory(str, Enum):
    PARTS = "PARTS"
    POSITION = "POSITION"
    PEOPLE = "PEOPLE"
    PAPERS = "PAPERS"
    PARADIGMS = "PARADIGMS"


class SolutionQuadrant(str, Enum):
    HIGH_BENEFIT_LOW_DIFFICULTY = "HIGH_BENEFIT_LOW_DIFFICULTY"
    HIGH_BENEFIT_HIGH_DIFFICULTY = "HIGH_BENEFIT_HIGH_DIFFICULTY"
    LOW_BENEFIT_LOW_DIFFICULTY = "LOW_BENEFIT_LOW_DIFFICULTY"
    LOW_BENEFIT_HIGH_DIFFICULTY = "LOW_BENEFIT_HIGH_DIFFICULTY"


# --- 4A.9-4A.10: KPI Status ---


class KPIStatus(str, Enum):
    ON_TARGET = "ON_TARGET"
    BELOW_TARGET = "BELOW_TARGET"
    ABOVE_TARGET = "ABOVE_TARGET"


# ============================================================
# PHASE 4A: PYDANTIC MODELS
# ============================================================

# --- GFSN Criticality Models ---


class GFSNCriteriaScore(BaseModel):
    category: GFSNConsequenceCategory
    consequence_level: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class GFSNCriticalityAssessment(BaseModel):
    assessment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    node_id: str
    assessed_at: datetime
    assessed_by: str
    mode: CriticalityMode = CriticalityMode.GFSN
    criteria_scores: list[GFSNCriteriaScore]
    probability: int = Field(..., ge=1, le=5)
    overall_score: float = Field(default=0.0)
    band: GFSNCriticalityBand = GFSNCriticalityBand.BAJO
    max_consequence: int = Field(default=1, ge=1, le=5)

    @field_validator("criteria_scores")
    @classmethod
    def validate_gfsn_criteria(cls, v):
        if len(v) == 0:
            raise ValueError("At least one criteria score is required")
        categories = [s.category for s in v]
        if len(categories) != len(set(categories)):
            raise ValueError("Duplicate GFSN criteria categories found")
        return v


# --- GFSN Priority Models ---


class GFSNPriorityOutput(BaseModel):
    priority: GFSNPriority
    criticality_band: GFSNCriticalityBand
    max_consequence: int = Field(..., ge=1, le=5)
    response_time: str
    justification: str


# --- RCA Models ---


class Analysis5W2H(BaseModel):
    what: str = Field(..., min_length=1)
    when: str = Field(..., min_length=1)
    where: str = Field(..., min_length=1)
    who: str = Field(..., min_length=1)
    why: str = Field(..., min_length=1)
    how: str = Field(..., min_length=1)
    how_much: str = Field(..., min_length=1)
    report: str = ""


class RCACause(BaseModel):
    cause_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(..., min_length=1)
    evidence_type: EvidenceType
    root_cause_level: Optional[RootCauseLevel] = None
    parent_cause_id: Optional[str] = None
    children: list[str] = Field(default_factory=list)


class Evidence5P(BaseModel):
    evidence_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: Evidence5PCategory
    description: str = Field(..., min_length=1)
    source: str = ""
    fragility_score: float = Field(default=0.0, ge=0.0, le=10.0)


class CauseEffectDiagram(BaseModel):
    primary_effect: str
    causes: list[RCACause] = Field(default_factory=list)
    findings: list[str] = Field(default_factory=list)


class Solution(BaseModel):
    solution_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = Field(..., min_length=1)
    five_questions_pass: bool = False
    cost_benefit: float = Field(default=0.0, ge=0.0)
    difficulty: float = Field(default=0.0, ge=0.0, le=10.0)
    quadrant: Optional[SolutionQuadrant] = None


class PrioritizedSolution(BaseModel):
    solution: Solution
    rank: int = Field(..., ge=1)
    recommendation: str = ""


class RCAAnalysis(BaseModel):
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_description: str
    equipment_id: Optional[str] = None
    plant_id: str = ""
    level: RCALevel = RCALevel.LEVEL_1
    status: RCAStatus = RCAStatus.OPEN
    created_at: datetime = Field(default_factory=datetime.now)
    team_members: list[str] = Field(default_factory=list)
    analysis_5w2h: Optional[Analysis5W2H] = None
    cause_effect: CauseEffectDiagram = Field(
        default_factory=lambda: CauseEffectDiagram(primary_effect="")
    )
    evidence_5p: list[Evidence5P] = Field(default_factory=list)
    solutions: list[Solution] = Field(default_factory=list)
    prioritized_solutions: list[PrioritizedSolution] = Field(default_factory=list)
    root_cause_summary: str = ""


# --- Planning KPI Models ---


class PlanningKPIValue(BaseModel):
    name: str
    value: Optional[float] = None
    target: float
    unit: str = "%"
    status: KPIStatus = KPIStatus.ON_TARGET


class PlanningKPIInput(BaseModel):
    plant_id: str
    period_start: date
    period_end: date
    wo_planned: int = Field(default=0, ge=0)
    wo_completed: int = Field(default=0, ge=0)
    manhours_planned: float = Field(default=0.0, ge=0.0)
    manhours_actual: float = Field(default=0.0, ge=0.0)
    backlog_hours: float = Field(default=0.0, ge=0.0)
    weekly_capacity_hours: float = Field(default=0.0, ge=0.0)
    release_horizon_days: int = Field(default=0, ge=0)
    pending_notices: int = Field(default=0, ge=0)
    total_notices: int = Field(default=0, ge=0)
    scheduled_capacity_hours: float = Field(default=0.0, ge=0.0)
    total_capacity_hours: float = Field(default=0.0, ge=0.0)
    proactive_wo: int = Field(default=0, ge=0)
    total_wo: int = Field(default=0, ge=0)
    planned_wo: int = Field(default=0, ge=0)
    schedule_compliance_executed: int = Field(default=0, ge=0)
    schedule_compliance_planned: int = Field(default=0, ge=0)
    pm_executed: int = Field(default=0, ge=0)
    pm_planned: int = Field(default=0, ge=0)
    corrective_count: int = Field(default=0, ge=0)


class PlanningKPIs(BaseModel):
    plant_id: str
    period_start: date
    period_end: date
    calculated_at: datetime = Field(default_factory=datetime.now)
    kpis: list[PlanningKPIValue] = Field(default_factory=list)
    overall_health: str = ""
    on_target_count: int = Field(default=0, ge=0)
    below_target_count: int = Field(default=0, ge=0)


# --- DE KPI Models ---


class DEKPIValue(BaseModel):
    name: str
    value: Optional[float] = None
    target: float
    unit: str = "%"
    status: KPIStatus = KPIStatus.ON_TARGET


class DEKPIs(BaseModel):
    plant_id: str
    period_start: date
    period_end: date
    calculated_at: datetime = Field(default_factory=datetime.now)
    kpis: list[DEKPIValue] = Field(default_factory=list)
    overall_compliance: float = Field(default=0.0, ge=0.0, le=100.0)


# ============================================================
# Phase 4B — Scheduling Engine
# ============================================================

# --- Scheduling Enums ---


class WeeklyProgramStatus(str, Enum):
    DRAFT = "DRAFT"
    FINAL = "FINAL"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


class SupportTaskType(str, Enum):
    LOTO = "LOTO"
    SCAFFOLDING = "SCAFFOLDING"
    CRANE = "CRANE"
    MANLIFT = "MANLIFT"
    GUARD_REMOVAL = "GUARD_REMOVAL"
    CLEANING = "CLEANING"
    COMMISSIONING = "COMMISSIONING"


class WorkPackageElementType(str, Enum):
    WORK_PERMIT = "WORK_PERMIT"
    LOTO_CERT = "LOTO_CERT"
    MATERIAL_WITHDRAWAL = "MATERIAL_WITHDRAWAL"
    CHECKLIST = "CHECKLIST"
    ATS_ART = "ATS_ART"
    EXECUTION_PROCEDURE = "EXECUTION_PROCEDURE"
    WORK_ORDER = "WORK_ORDER"


class SchedulingDayRole(str, Enum):
    MEETING = "MEETING"
    ADJUSTMENT = "ADJUSTMENT"
    FINAL_PROGRAM = "FINAL_PROGRAM"
    EXECUTION = "EXECUTION"


class ShutdownScope(str, Enum):
    MINOR_8H = "MINOR_8H"
    MAJOR_20H_PLUS = "MAJOR_20H_PLUS"


# --- Scheduling Models ---


class SupportTask(BaseModel):
    task_type: SupportTaskType
    description: str = ""
    estimated_hours: float = Field(default=0.5, ge=0.0)
    required_before: bool = True


class WorkPackageElement(BaseModel):
    element_type: WorkPackageElementType
    present: bool = False
    reference: Optional[str] = None


class WorkPackageComplianceResult(BaseModel):
    package_id: str
    elements: list[WorkPackageElement] = Field(default_factory=list)
    compliant: bool = False
    missing: list[str] = Field(default_factory=list)


class ResourceSlot(BaseModel):
    slot_date: date
    shift: str
    specialty: str
    assigned_hours: float = Field(default=0.0, ge=0.0)
    capacity_hours: float = Field(default=8.0, ge=0.0)
    utilization_pct: float = Field(default=0.0, ge=0.0)


class ResourceConflict(BaseModel):
    conflict_date: date
    shift: str
    area: str = ""
    equipment: str = ""
    conflicting_packages: list[str] = Field(default_factory=list)
    description: str = ""


class WeeklyProgram(BaseModel):
    program_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    week_number: int = Field(ge=1, le=53)
    year: int = Field(ge=2020)
    status: WeeklyProgramStatus = WeeklyProgramStatus.DRAFT
    work_packages: list[dict] = Field(default_factory=list)
    total_hours: float = Field(default=0.0, ge=0.0)
    resource_slots: list[ResourceSlot] = Field(default_factory=list)
    conflicts: list[ResourceConflict] = Field(default_factory=list)
    support_tasks: list[SupportTask] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    finalized_at: Optional[datetime] = None


class GanttRow(BaseModel):
    package_id: str
    name: str = ""
    start_date: date
    end_date: date
    shift: str = "MORNING"
    area: str = ""
    specialty: str = ""
    duration_hours: float = Field(default=0.0, ge=0.0)
    dependencies: list[str] = Field(default_factory=list)


# ============================================================
# Phase 5 — Advanced Reliability Engineering
# ============================================================

# --- Phase 5 Enums ---


class SparePartCriticality(str, Enum):
    """VED analysis — Vital / Essential / Desirable."""
    VITAL = "VITAL"
    ESSENTIAL = "ESSENTIAL"
    DESIRABLE = "DESIRABLE"


class ConsumptionClass(str, Enum):
    """FSN analysis — Fast / Slow / Non-moving."""
    FAST_MOVING = "FAST_MOVING"
    SLOW_MOVING = "SLOW_MOVING"
    NON_MOVING = "NON_MOVING"


class CostClass(str, Enum):
    """ABC analysis — cost-based classification."""
    A_HIGH = "A_HIGH"
    B_MEDIUM = "B_MEDIUM"
    C_LOW = "C_LOW"


class ShutdownStatus(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MoCStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    REVIEWING = "REVIEWING"
    APPROVED = "APPROVED"
    IMPLEMENTING = "IMPLEMENTING"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"


class MoCCategory(str, Enum):
    EQUIPMENT_MODIFICATION = "EQUIPMENT_MODIFICATION"
    PROCESS_CHANGE = "PROCESS_CHANGE"
    STRATEGY_CHANGE = "STRATEGY_CHANGE"
    MATERIAL_SUBSTITUTION = "MATERIAL_SUBSTITUTION"
    PROCEDURE_UPDATE = "PROCEDURE_UPDATE"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class JackKnifeZone(str, Enum):
    """Jack-Knife zones per REF-13 §7.5.4."""
    ACUTE = "ACUTE"
    CHRONIC = "CHRONIC"
    COMPLEX = "COMPLEX"
    CONTROLLED = "CONTROLLED"


class DamageMechanism(str, Enum):
    """RBI damage mechanisms."""
    CORROSION = "CORROSION"
    FATIGUE = "FATIGUE"
    CREEP = "CREEP"
    EROSION = "EROSION"
    STRESS_CORROSION = "STRESS_CORROSION"
    HYDROGEN_DAMAGE = "HYDROGEN_DAMAGE"
    OTHER = "OTHER"


class InspectionTechnique(str, Enum):
    """RBI inspection techniques."""
    VISUAL = "VISUAL"
    ULTRASONIC_THICKNESS = "ULTRASONIC_THICKNESS"
    MAGNETIC_PARTICLE = "MAGNETIC_PARTICLE"
    DYE_PENETRANT = "DYE_PENETRANT"
    RADIOGRAPHY = "RADIOGRAPHY"
    EDDY_CURRENT = "EDDY_CURRENT"
    ACOUSTIC_EMISSION = "ACOUSTIC_EMISSION"


# --- Phase 5 Models ---


class SparePartAnalysis(BaseModel):
    part_id: str
    equipment_id: str = ""
    description: str = ""
    ved_class: SparePartCriticality = SparePartCriticality.DESIRABLE
    fsn_class: ConsumptionClass = ConsumptionClass.NON_MOVING
    abc_class: CostClass = CostClass.C_LOW
    criticality_score: float = Field(default=0.0, ge=0.0, le=100.0)
    lead_time_days: int = Field(default=30, ge=0)
    unit_cost: float = Field(default=0.0, ge=0.0)
    recommended_min_stock: int = Field(default=0, ge=0)
    recommended_max_stock: int = Field(default=0, ge=0)
    reorder_point: int = Field(default=0, ge=0)
    analysis_notes: str = ""


class SparePartOptimizationResult(BaseModel):
    plant_id: str
    analyzed_at: datetime = Field(default_factory=datetime.now)
    total_parts: int = 0
    results: list[SparePartAnalysis] = Field(default_factory=list)
    total_inventory_value: float = Field(default=0.0, ge=0.0)
    recommended_reduction_pct: float = Field(default=0.0, ge=0.0, le=100.0)


class ShutdownEvent(BaseModel):
    shutdown_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    name: str
    status: ShutdownStatus = ShutdownStatus.PLANNED
    planned_start: datetime
    planned_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    planned_hours: float = Field(default=0.0, ge=0.0)
    actual_hours: float = Field(default=0.0, ge=0.0)
    work_orders: list[str] = Field(default_factory=list)
    completed_work_orders: list[str] = Field(default_factory=list)
    completion_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    delay_hours: float = Field(default=0.0, ge=0.0)
    delay_reasons: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)


class ShutdownMetrics(BaseModel):
    shutdown_id: str
    schedule_compliance_pct: float = Field(default=0.0, ge=0.0)
    scope_completion_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    planned_vs_actual_ratio: float = Field(default=1.0, ge=0.0)
    total_delays_hours: float = Field(default=0.0, ge=0.0)


class MoCRequest(BaseModel):
    moc_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    title: str
    description: str = ""
    category: MoCCategory = MoCCategory.EQUIPMENT_MODIFICATION
    status: MoCStatus = MoCStatus.DRAFT
    risk_level: RiskLevel = RiskLevel.LOW
    requester_id: str = ""
    reviewer_id: str = ""
    approver_id: str = ""
    affected_equipment: list[str] = Field(default_factory=list)
    affected_procedures: list[str] = Field(default_factory=list)
    risk_assessment: str = ""
    impact_analysis: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class MoCReviewResult(BaseModel):
    moc_id: str
    reviewer_id: str = ""
    recommendation: str = ""
    risk_acceptable: bool = False
    conditions: list[str] = Field(default_factory=list)


class OCRAnalysisInput(BaseModel):
    equipment_id: str
    failure_rate: float = Field(ge=0.0)
    mttr_hours: float = Field(default=4.0, ge=0.0)
    cost_per_failure: float = Field(ge=0.0)
    cost_per_pm: float = Field(ge=0.0)
    current_pm_interval_days: int = Field(default=90, ge=1)


class OCRAnalysisResult(BaseModel):
    equipment_id: str
    optimal_interval_days: int = Field(default=90, ge=1)
    current_interval_days: int = Field(default=90, ge=1)
    cost_at_optimal: float = Field(default=0.0, ge=0.0)
    cost_at_current: float = Field(default=0.0, ge=0.0)
    savings_pct: float = Field(default=0.0)
    risk_at_optimal: float = Field(default=0.0, ge=0.0)
    risk_at_current: float = Field(default=0.0, ge=0.0)
    recommendation: str = ""


class JackKnifePoint(BaseModel):
    equipment_id: str
    equipment_tag: str = ""
    mtbf_days: float = Field(default=0.0, ge=0.0)
    mttr_hours: float = Field(default=0.0, ge=0.0)
    failure_count: int = Field(default=0, ge=0)
    total_downtime_hours: float = Field(default=0.0, ge=0.0)
    zone: JackKnifeZone = JackKnifeZone.CONTROLLED


class JackKnifeResult(BaseModel):
    plant_id: str
    analyzed_at: datetime = Field(default_factory=datetime.now)
    equipment_count: int = 0
    points: list[JackKnifePoint] = Field(default_factory=list)
    acute_count: int = 0
    chronic_count: int = 0
    complex_count: int = 0
    controlled_count: int = 0


class ParetoItem(BaseModel):
    equipment_id: str
    equipment_tag: str = ""
    metric_value: float = Field(default=0.0, ge=0.0)
    cumulative_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    rank: int = Field(default=0, ge=0)
    is_bad_actor: bool = False


class ParetoResult(BaseModel):
    plant_id: str
    metric_type: str = "failures"
    analyzed_at: datetime = Field(default_factory=datetime.now)
    items: list[ParetoItem] = Field(default_factory=list)
    bad_actor_count: int = 0
    bad_actor_pct_of_total: float = Field(default=0.0, ge=0.0, le=100.0)


class LCCInput(BaseModel):
    equipment_id: str
    acquisition_cost: float = Field(default=0.0, ge=0.0)
    installation_cost: float = Field(default=0.0, ge=0.0)
    annual_operating_cost: float = Field(default=0.0, ge=0.0)
    annual_maintenance_cost: float = Field(default=0.0, ge=0.0)
    expected_life_years: int = Field(default=20, ge=1)
    discount_rate: float = Field(default=0.08, ge=0.0, le=1.0)
    salvage_value: float = Field(default=0.0, ge=0.0)


class LCCResult(BaseModel):
    equipment_id: str
    total_lcc: float = Field(default=0.0, ge=0.0)
    npv: float = Field(default=0.0, ge=0.0)
    annualized_cost: float = Field(default=0.0, ge=0.0)
    acquisition_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    operating_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    maintenance_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    breakeven_year: Optional[int] = None
    recommendation: str = ""


class RBIAssessment(BaseModel):
    equipment_id: str
    equipment_type: str = ""
    damage_mechanisms: list[DamageMechanism] = Field(default_factory=list)
    probability_score: int = Field(default=1, ge=1, le=5)
    consequence_score: int = Field(default=1, ge=1, le=5)
    risk_score: float = Field(default=1.0, ge=1.0)
    risk_level: RiskLevel = RiskLevel.LOW
    recommended_technique: InspectionTechnique = InspectionTechnique.VISUAL
    recommended_interval_months: int = Field(default=12, ge=1)
    current_interval_months: int = Field(default=12, ge=1)
    next_inspection_date: Optional[date] = None


class RBIResult(BaseModel):
    plant_id: str
    analyzed_at: datetime = Field(default_factory=datetime.now)
    total_equipment: int = 0
    assessments: list[RBIAssessment] = Field(default_factory=list)
    high_risk_count: int = 0
    overdue_count: int = 0


# ============================================================
# Phase 6 — Reporting, Dashboards & Integration
# ============================================================

# --- Phase 6 Enums ---


class ReportType(str, Enum):
    WEEKLY_MAINTENANCE = "WEEKLY_MAINTENANCE"
    MONTHLY_KPI = "MONTHLY_KPI"
    QUARTERLY_REVIEW = "QUARTERLY_REVIEW"


class NotificationType(str, Enum):
    RBI_OVERDUE = "RBI_OVERDUE"
    KPI_BREACH = "KPI_BREACH"
    EQUIPMENT_RISK = "EQUIPMENT_RISK"
    BACKLOG_AGING = "BACKLOG_AGING"
    CAPA_OVERDUE = "CAPA_OVERDUE"
    MOC_OVERDUE = "MOC_OVERDUE"


class NotificationLevel(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class ExportFormat(str, Enum):
    EXCEL = "EXCEL"
    CSV = "CSV"
    PDF = "PDF"


class ImportSource(str, Enum):
    EQUIPMENT_HIERARCHY = "EQUIPMENT_HIERARCHY"
    FAILURE_HISTORY = "FAILURE_HISTORY"
    MAINTENANCE_PLAN = "MAINTENANCE_PLAN"


class CorrelationType(str, Enum):
    CRITICALITY_FAILURES = "CRITICALITY_FAILURES"
    COST_RELIABILITY = "COST_RELIABILITY"
    HEALTH_BACKLOG = "HEALTH_BACKLOG"


class TrafficLight(str, Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"


# --- Phase 6 Models: Reporting ---


class ReportSection(BaseModel):
    title: str
    content: str = ""
    metrics: dict = Field(default_factory=dict)
    tables: list = Field(default_factory=list)


class ReportMetadata(BaseModel):
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType
    plant_id: str
    generated_at: datetime = Field(default_factory=datetime.now)
    period_start: date
    period_end: date


class WeeklyReport(BaseModel):
    metadata: ReportMetadata
    week_number: int
    year: int
    wo_completed_count: int = 0
    wo_open_count: int = 0
    safety_incidents: int = 0
    schedule_compliance_pct: Optional[float] = None
    backlog_hours: float = 0.0
    key_events: list[str] = Field(default_factory=list)
    sections: list[ReportSection] = Field(default_factory=list)


class MonthlyKPIReport(BaseModel):
    metadata: ReportMetadata
    month: int
    year: int
    planning_kpi_summary: Optional[dict] = None
    de_kpi_summary: Optional[dict] = None
    reliability_kpi_summary: Optional[dict] = None
    health_summary: Optional[dict] = None
    trends: dict = Field(default_factory=dict)
    traffic_lights: dict = Field(default_factory=dict)
    sections: list[ReportSection] = Field(default_factory=list)


class QuarterlyReviewReport(BaseModel):
    metadata: ReportMetadata
    quarter: int
    year: int
    monthly_summaries: list[dict] = Field(default_factory=list)
    management_review: Optional[dict] = None
    rbi_summary: Optional[dict] = None
    bad_actors: list[dict] = Field(default_factory=list)
    capas_summary: Optional[dict] = None
    strategic_recommendations: list[str] = Field(default_factory=list)
    sections: list[ReportSection] = Field(default_factory=list)


# --- Phase 6 Models: DE KPI Extended ---


class DEKPIInput(BaseModel):
    plant_id: str
    period_start: date
    period_end: date
    events_reported: int = Field(default=0, ge=0)
    events_required: int = Field(default=0, ge=0)
    meetings_held: int = Field(default=0, ge=0)
    meetings_required: int = Field(default=0, ge=0)
    actions_implemented: int = Field(default=0, ge=0)
    actions_planned: int = Field(default=0, ge=0)
    savings_achieved: float = Field(default=0.0, ge=0.0)
    savings_target: float = Field(default=0.0, ge=0.0)
    failures_current: int = Field(default=0, ge=0)
    failures_previous: int = Field(default=0, ge=0)


class DEKPITrend(BaseModel):
    plant_id: str
    period_count: int = 0
    kpi_trends: dict = Field(default_factory=dict)
    overall_trend: str = "STABLE"


class DEProgramHealth(BaseModel):
    plant_id: str
    program_score: float = Field(default=0.0, ge=0.0, le=100.0)
    maturity_level: str = ""
    strengths: list[str] = Field(default_factory=list)
    improvement_areas: list[str] = Field(default_factory=list)


# --- Phase 6 Models: Notifications ---


class AlertNotification(BaseModel):
    notification_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    notification_type: NotificationType
    level: NotificationLevel = NotificationLevel.INFO
    title: str
    message: str = ""
    equipment_id: Optional[str] = None
    plant_id: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    acknowledged: bool = False


class NotificationConfig(BaseModel):
    backlog_aging_days: int = Field(default=30, ge=1)
    kpi_breach_threshold_pct: float = Field(default=10.0, ge=0.0)
    health_critical_threshold: float = Field(default=50.0, ge=0.0, le=100.0)


class NotificationResult(BaseModel):
    plant_id: str
    generated_at: datetime = Field(default_factory=datetime.now)
    total_notifications: int = 0
    critical_count: int = 0
    warning_count: int = 0
    info_count: int = 0
    notifications: list[AlertNotification] = Field(default_factory=list)


# --- Phase 6 Models: Import ---


class ImportValidationError(BaseModel):
    row: int
    column: str
    message: str
    severity: str = "ERROR"


class ImportMapping(BaseModel):
    source_columns: list[str] = Field(default_factory=list)
    target_columns: list[str] = Field(default_factory=list)
    mapping: dict = Field(default_factory=dict)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class ImportResult(BaseModel):
    source: ImportSource
    total_rows: int = 0
    valid_rows: int = 0
    error_rows: int = 0
    errors: list[ImportValidationError] = Field(default_factory=list)
    validated_data: list[dict] = Field(default_factory=list)


class ImportSummary(BaseModel):
    source: ImportSource
    total_rows: int = 0
    valid_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    error_summary: dict = Field(default_factory=dict)


# --- Phase 6 Models: Export ---


class ExportSheet(BaseModel):
    name: str
    headers: list[str] = Field(default_factory=list)
    rows: list[list] = Field(default_factory=list)


class ExportSection(BaseModel):
    title: str
    content: str = ""
    table: Optional[ExportSheet] = None


class ExportConfig(BaseModel):
    format: ExportFormat = ExportFormat.EXCEL
    include_charts: bool = False
    include_metadata: bool = True


class ExportResult(BaseModel):
    format: ExportFormat = ExportFormat.EXCEL
    sheets: list[ExportSheet] = Field(default_factory=list)
    sections: list[ExportSection] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


# --- Phase 6 Models: Cross-Module Analytics ---


class CorrelationPoint(BaseModel):
    equipment_id: str
    x_value: float = 0.0
    y_value: float = 0.0
    label: str = ""


class CorrelationResult(BaseModel):
    correlation_type: CorrelationType
    coefficient: float = Field(default=0.0, ge=-1.0, le=1.0)
    strength: str = ""
    data_points: list[CorrelationPoint] = Field(default_factory=list)
    insight: str = ""


class BadActorOverlap(BaseModel):
    total_unique_bad_actors: int = 0
    jackknife_acute: list[str] = Field(default_factory=list)
    pareto_bad_actors: list[str] = Field(default_factory=list)
    rbi_high_risk: list[str] = Field(default_factory=list)
    overlap_all_three: list[str] = Field(default_factory=list)
    overlap_any_two: list[str] = Field(default_factory=list)
    priority_action_list: list[str] = Field(default_factory=list)


class CrossModuleSummary(BaseModel):
    plant_id: str
    analyzed_at: datetime = Field(default_factory=datetime.now)
    correlations: list[CorrelationResult] = Field(default_factory=list)
    bad_actor_overlap: Optional[BadActorOverlap] = None
    key_insights: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)


# ============================================================
# Phase 7 — REF-17 Gap Closure (G5, G6, G15, G18)
# ============================================================


class WorkPackageReadiness(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    PARTIAL = "PARTIAL"
    READY = "READY"
    BLOCKED = "BLOCKED"


class ElementReadinessStatus(str, Enum):
    MISSING = "MISSING"
    DRAFT = "DRAFT"
    READY = "READY"
    EXPIRED = "EXPIRED"


class SupportTaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class FMECAStage(str, Enum):
    STAGE_1_FUNCTIONS = "STAGE_1_FUNCTIONS"
    STAGE_2_FAILURES = "STAGE_2_FAILURES"
    STAGE_3_EFFECTS = "STAGE_3_EFFECTS"
    STAGE_4_DECISIONS = "STAGE_4_DECISIONS"


class FMECAWorksheetStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    APPROVED = "APPROVED"


class RPNCategory(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ConflictResolutionType(str, Enum):
    RESCHEDULE = "RESCHEDULE"
    SPLIT_PACKAGE = "SPLIT_PACKAGE"
    ADD_SHIFT = "ADD_SHIFT"
    REASSIGN_SPECIALTY = "REASSIGN_SPECIALTY"
    EXTEND_WINDOW = "EXTEND_WINDOW"


# --- Phase 7 Models: G5 — Work Package Assembly ---


class ElementReadiness(BaseModel):
    element_type: WorkPackageElementType
    status: ElementReadinessStatus = ElementReadinessStatus.MISSING
    reference: str = ""
    expires_at: Optional[str] = None
    notes: str = ""


class AssembledWorkPackage(BaseModel):
    package_id: str
    name: str = ""
    equipment_tag: str = ""
    elements: list[ElementReadiness] = Field(default_factory=list)
    ready_count: int = 0
    total_required: int = 7
    readiness_pct: float = 0.0
    overall_readiness: WorkPackageReadiness = WorkPackageReadiness.NOT_STARTED
    assembled_by: str = ""
    assembled_at: datetime = Field(default_factory=datetime.now)


class WorkPackageComplianceReport(BaseModel):
    plant_id: str = ""
    total_packages: int = 0
    compliant_count: int = 0
    non_compliant_count: int = 0
    compliance_pct: float = 0.0
    missing_elements_summary: dict[str, int] = Field(default_factory=dict)
    recommendations: list[str] = Field(default_factory=list)


# --- Phase 7 Models: G6 — Execution Tasks ---


class TaskDependency(BaseModel):
    from_task_id: str
    to_task_id: str
    dependency_type: str = "FINISH_TO_START"


class ExecutionTask(BaseModel):
    task_id: str
    task_type: SupportTaskType
    description: str = ""
    estimated_hours: float = 0.0
    status: SupportTaskStatus = SupportTaskStatus.PENDING
    sequence_order: int = 0
    predecessors: list[str] = Field(default_factory=list)
    safety_checklist: list[str] = Field(default_factory=list)
    is_pre_execution: bool = True


class ExecutionSequence(BaseModel):
    package_id: str
    tasks: list[ExecutionTask] = Field(default_factory=list)
    dependencies: list[TaskDependency] = Field(default_factory=list)
    total_pre_hours: float = 0.0
    total_post_hours: float = 0.0
    critical_path_hours: float = 0.0
    warnings: list[str] = Field(default_factory=list)


# --- Phase 7 Models: G15 — Enhanced Resource Leveling ---


class TradeCapacity(BaseModel):
    specialty: str
    shift: str = "MORNING"
    headcount: int = 1
    hours_per_person: float = 8.0
    total_hours: float = 8.0


class ConflictResolution(BaseModel):
    conflict_description: str = ""
    resolution_type: ConflictResolutionType = ConflictResolutionType.RESCHEDULE
    suggestion: str = ""
    estimated_impact: str = ""


class MultiDayPackage(BaseModel):
    package_id: str
    total_hours: float = 0.0
    bottleneck_specialty: str = ""
    day_allocations: list[dict] = Field(default_factory=list)
    total_days: int = 0


class EnhancedLevelingResult(BaseModel):
    resource_slots: list[ResourceSlot] = Field(default_factory=list)
    multi_day_packages: list[MultiDayPackage] = Field(default_factory=list)
    conflicts: list[ConflictResolution] = Field(default_factory=list)
    bottleneck_specialty: str = ""
    max_utilization_pct: float = 0.0


# --- Phase 7 Models: G18 — FMECA Workflow ---


class RPNScore(BaseModel):
    severity: int = Field(ge=1, le=10)
    occurrence: int = Field(ge=1, le=10)
    detection: int = Field(ge=1, le=10)
    rpn: int = 0
    category: RPNCategory = RPNCategory.LOW


class FMECARow(BaseModel):
    row_id: str = ""
    function_description: str = ""
    functional_failure: str = ""
    failure_mode: str = ""
    failure_effect: str = ""
    failure_consequence: Optional[str] = None
    severity: int = Field(default=1, ge=1, le=10)
    occurrence: int = Field(default=1, ge=1, le=10)
    detection: int = Field(default=1, ge=1, le=10)
    rpn: int = 0
    rpn_category: RPNCategory = RPNCategory.LOW
    strategy_type: Optional[str] = None
    rcm_path: Optional[str] = None
    recommended_action: str = ""


class FMECAWorksheet(BaseModel):
    worksheet_id: str = ""
    equipment_id: str
    equipment_tag: str = ""
    equipment_name: str = ""
    status: FMECAWorksheetStatus = FMECAWorksheetStatus.DRAFT
    current_stage: FMECAStage = FMECAStage.STAGE_1_FUNCTIONS
    rows: list[FMECARow] = Field(default_factory=list)
    stage_completion: dict[str, bool] = Field(default_factory=dict)
    analyst: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


class FMECASummary(BaseModel):
    worksheet_id: str = ""
    equipment_id: str = ""
    total_rows: int = 0
    rpn_distribution: dict[str, int] = Field(default_factory=dict)
    strategy_distribution: dict[str, int] = Field(default_factory=dict)
    top_risks: list[dict] = Field(default_factory=list)
    avg_rpn: float = 0.0
    high_critical_count: int = 0
    recommendations: list[str] = Field(default_factory=list)
