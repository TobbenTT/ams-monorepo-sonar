"""SQLAlchemy ORM models — mirrors Pydantic schemas from tools/models/schemas.py.

Nested objects (FailureEffect, LabourResource, CriteriaScore, etc.) are stored
as JSON columns to avoid excessive join tables for the MVP.
"""

import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Integer, Float, Boolean, Text, DateTime, Date,
    ForeignKey, JSON, Index, event,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.connection import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ── User ──────────────────────────────────────────────────────────────

class UserModel(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(200), default="")
    role: Mapped[str] = mapped_column(String(20), default="tecnico")
    plant_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    mfa_secret: Mapped[str | None] = mapped_column(String(64), nullable=True)
    mfa_pending_secret: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # C7 Tanda C (David 2026-04-28, Magda transcript 210): RBAC scoped por
    # especialidad para supervisores. supervisor mecánico solo opera técnicos
    # con specialty=='Mecánico'; análogo para eléctrico/instrumentista. Null
    # = sin restricción (admin/manager/planner). Los técnicos no usan este campo.
    scoped_specialty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # token_version se incrementa en logout para invalidar JWTs vivos. El token
    # incluye `ver` y get_current_user lo compara — si difieren, 401.
    token_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        Index("ix_users_role", "role"),
        Index("ix_users_active_role", "is_active", "role"),
    )


# ── Plant ──────────────────────────────────────────────────────────────

class PlantModel(Base):
    __tablename__ = "plants"

    plant_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    name_fr: Mapped[str] = mapped_column(String(200), default="")
    name_ar: Mapped[str] = mapped_column(String(200), default="")
    location: Mapped[str] = mapped_column(String(200), default="")

    nodes: Mapped[list["HierarchyNodeModel"]] = relationship(back_populates="plant")


# ── Hierarchy Node ─────────────────────────────────────────────────────

class HierarchyNodeModel(Base):
    __tablename__ = "hierarchy_nodes"

    node_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    node_type: Mapped[str] = mapped_column(String(30))  # PLANT, AREA, SYSTEM, EQUIPMENT, SUB_ASSEMBLY, MAINTAINABLE_ITEM
    name: Mapped[str] = mapped_column(String(200))
    name_fr: Mapped[str] = mapped_column(String(200), default="")
    code: Mapped[str] = mapped_column(String(100), index=True)
    parent_node_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("hierarchy_nodes.node_id"), nullable=True)
    level: Mapped[int] = mapped_column(Integer)
    plant_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("plants.plant_id"), nullable=True)
    tag: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    criticality: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    equipment_lib_ref: Mapped[str | None] = mapped_column(String(50), nullable=True)
    component_lib_ref: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sap_func_loc: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sap_equipment_nr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=1)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # NodeMetadata
    # G-08: GPS coordinates for proximity matching
    gps_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    gps_lon: Mapped[float | None] = mapped_column(Float, nullable=True)

    plant: Mapped["PlantModel | None"] = relationship(back_populates="nodes")
    children: Mapped[list["HierarchyNodeModel"]] = relationship(back_populates="parent", foreign_keys=[parent_node_id])
    parent: Mapped["HierarchyNodeModel | None"] = relationship(back_populates="children", remote_side=[node_id])

    __table_args__ = (
        Index("ix_hierarchy_nodes_parent", "parent_node_id"),
        Index("ix_hierarchy_nodes_level_type", "level", "node_type"),
    )


# ── Criticality Assessment ─────────────────────────────────────────────

class CriticalityAssessmentModel(Base):
    __tablename__ = "criticality_assessments"

    assessment_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    node_id: Mapped[str] = mapped_column(String(50), ForeignKey("hierarchy_nodes.node_id"))
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    assessed_by: Mapped[str] = mapped_column(String(100), default="system")
    method: Mapped[str] = mapped_column(String(30))  # FULL_MATRIX, SIMPLIFIED
    criteria_scores: Mapped[list] = mapped_column(JSON)  # list[CriteriaScore]
    probability: Mapped[int] = mapped_column(Integer)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_class: Mapped[str] = mapped_column(String(20))
    ai_suggested_class: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_justification: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")


# ── Function ───────────────────────────────────────────────────────────

class FunctionModel(Base):
    __tablename__ = "functions"

    function_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    node_id: Mapped[str] = mapped_column(String(50), ForeignKey("hierarchy_nodes.node_id"))
    function_type: Mapped[str] = mapped_column(String(20))  # PRIMARY, SECONDARY, PROTECTIVE
    description: Mapped[str] = mapped_column(Text)
    description_fr: Mapped[str] = mapped_column(Text, default="")
    performance_standard: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")


# ── Functional Failure ─────────────────────────────────────────────────

class FunctionalFailureModel(Base):
    __tablename__ = "functional_failures"

    failure_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    function_id: Mapped[str] = mapped_column(String(50), ForeignKey("functions.function_id"))
    failure_type: Mapped[str] = mapped_column(String(20))  # TOTAL, PARTIAL
    description: Mapped[str] = mapped_column(Text)
    description_fr: Mapped[str] = mapped_column(Text, default="")


# ── Failure Mode ───────────────────────────────────────────────────────

class FailureModeModel(Base):
    __tablename__ = "failure_modes"

    failure_mode_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    functional_failure_id: Mapped[str] = mapped_column(String(50), ForeignKey("functional_failures.failure_id"))
    fm_status: Mapped[str] = mapped_column(String(20), default="RECOMMENDED")  # RECOMMENDED, REDUNDANT
    what: Mapped[str] = mapped_column(String(200))
    mechanism: Mapped[str] = mapped_column(String(50))
    cause: Mapped[str] = mapped_column(String(50))
    failure_pattern: Mapped[str | None] = mapped_column(String(30), nullable=True)
    failure_consequence: Mapped[str] = mapped_column(String(30))
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    failure_effect: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # FailureEffect
    strategy_type: Mapped[str] = mapped_column(String(30))
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    existing_task_source: Mapped[str | None] = mapped_column(String(200), nullable=True)
    justification_category: Mapped[str | None] = mapped_column(String(30), nullable=True)

    __table_args__ = (
        Index("ix_fm_mechanism_cause", "mechanism", "cause"),
    )


# ── Maintenance Task ──────────────────────────────────────────────────

class MaintenanceTaskModel(Base):
    __tablename__ = "maintenance_tasks"

    task_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    failure_mode_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("failure_modes.failure_mode_id"), nullable=True)
    name: Mapped[str] = mapped_column(String(72))
    name_fr: Mapped[str] = mapped_column(String(200), default="")
    task_type: Mapped[str] = mapped_column(String(20))
    is_secondary: Mapped[bool] = mapped_column(Boolean, default=False)
    acceptable_limits: Mapped[str | None] = mapped_column(Text, nullable=True)
    conditional_comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    consequences: Mapped[str] = mapped_column(Text, default="")
    justification: Mapped[str | None] = mapped_column(Text, nullable=True)
    constraint: Mapped[str] = mapped_column(String(20))  # ONLINE, OFFLINE, TEST_MODE
    access_time_hours: Mapped[float] = mapped_column(Float, default=0.0)
    frequency_value: Mapped[float] = mapped_column(Float)
    frequency_unit: Mapped[str] = mapped_column(String(30))
    origin: Mapped[str | None] = mapped_column(String(200), nullable=True)
    budget_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    budgeted_life: Mapped[float | None] = mapped_column(Float, nullable=True)
    labour_resources: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[LabourResource]
    material_resources: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[MaterialResource]
    tools_list: Mapped[list | None] = mapped_column(JSON, nullable=True)
    special_equipment: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")

    __table_args__ = (
        Index("ix_tasks_status", "status"),
        Index("ix_tasks_failure_mode", "failure_mode_id"),
    )


# ── Work Package ──────────────────────────────────────────────────────

class WorkPackageModel(Base):
    __tablename__ = "work_packages"

    work_package_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(40))
    code: Mapped[str] = mapped_column(String(50), index=True)
    node_id: Mapped[str] = mapped_column(String(50), ForeignKey("hierarchy_nodes.node_id"))
    frequency_value: Mapped[float] = mapped_column(Float)
    frequency_unit: Mapped[str] = mapped_column(String(30))
    constraint: Mapped[str] = mapped_column(String(20))  # ONLINE, OFFLINE
    access_time_hours: Mapped[float] = mapped_column(Float, default=0.0)
    work_package_type: Mapped[str] = mapped_column(String(20))  # STANDALONE, SUPPRESSIVE, SEQUENTIAL
    job_preparation: Mapped[str | None] = mapped_column(Text, nullable=True)
    post_shutdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    allocated_tasks: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[AllocatedTask]
    labour_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # LabourSummary
    material_summary: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[MaterialSummaryEntry]
    sap_upload_ref: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # SAPUploadRef
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")

    __table_args__ = (
        Index("ix_work_packages_status", "status"),
        Index("ix_work_packages_node", "node_id"),
    )


# ── SAP Upload Package ────────────────────────────────────────────────

class SAPUploadPackageModel(Base):
    __tablename__ = "sap_upload_packages"

    package_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    plant_code: Mapped[str] = mapped_column(String(50))
    maintenance_plan: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    maintenance_items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    task_lists: Mapped[list | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="GENERATED")


# ── Work Order History ────────────────────────────────────────────────

class WorkOrderModel(Base):
    __tablename__ = "work_orders"

    work_order_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    order_type: Mapped[str] = mapped_column(String(10))
    equipment_id: Mapped[str] = mapped_column(String(100), index=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    priority: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20))
    created_date: Mapped[date] = mapped_column(Date)
    actual_duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    materials_consumed: Mapped[list | None] = mapped_column(JSON, nullable=True)


# ── Asset Health Score ────────────────────────────────────────────────

class HealthScoreModel(Base):
    __tablename__ = "health_scores"

    score_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    node_id: Mapped[str] = mapped_column(String(50), ForeignKey("hierarchy_nodes.node_id"))
    plant_id: Mapped[str] = mapped_column(String(50))
    equipment_tag: Mapped[str] = mapped_column(String(100))
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    dimensions: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[HealthScoreDimension]
    composite_score: Mapped[float] = mapped_column(Float, default=0.0)
    health_class: Mapped[str] = mapped_column(String(20), default="UNKNOWN")
    trend: Mapped[str] = mapped_column(String(20), default="")
    recommendations: Mapped[list | None] = mapped_column(JSON, nullable=True)


# ── KPI Metrics ───────────────────────────────────────────────────────

class KPIMetricsModel(Base):
    __tablename__ = "kpi_metrics"

    metrics_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    equipment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    mtbf_days: Mapped[float | None] = mapped_column(Float, nullable=True)
    mttr_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    oee_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    schedule_compliance_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    backlog_hours: Mapped[float] = mapped_column(Float, default=0.0)
    pm_compliance_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_work_orders: Mapped[int] = mapped_column(Integer, default=0)
    corrective_wo_count: Mapped[int] = mapped_column(Integer, default=0)
    preventive_wo_count: Mapped[int] = mapped_column(Integer, default=0)
    reactive_ratio_pct: Mapped[float | None] = mapped_column(Float, nullable=True)


# ── Failure Prediction ────────────────────────────────────────────────

class FailurePredictionModel(Base):
    __tablename__ = "failure_predictions"

    prediction_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    equipment_id: Mapped[str] = mapped_column(String(100), index=True)
    equipment_tag: Mapped[str] = mapped_column(String(100))
    predicted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    weibull_params: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # WeibullParameters
    current_age_days: Mapped[float] = mapped_column(Float)
    reliability_current: Mapped[float] = mapped_column(Float)
    predicted_failure_window_days: Mapped[float] = mapped_column(Float)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.9)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    failure_pattern: Mapped[str | None] = mapped_column(String(30), nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")


# ── CAPA Item ─────────────────────────────────────────────────────────

class CAPAItemModel(Base):
    __tablename__ = "capa_items"

    capa_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    capa_type: Mapped[str] = mapped_column(String(20))  # CORRECTIVE, PREVENTIVE
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    plant_id: Mapped[str] = mapped_column(String(50))
    equipment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source: Mapped[str] = mapped_column(String(100))
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_phase: Mapped[str] = mapped_column(String(10), default="PLAN")
    status: Mapped[str] = mapped_column(String(20), default="OPEN")
    assigned_to: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actions_planned: Mapped[list | None] = mapped_column(JSON, nullable=True)
    actions_completed: Mapped[list | None] = mapped_column(JSON, nullable=True)
    effectiveness_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    lessons_learned: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_capa_plant_status", "plant_id", "status"),
    )


# ── Variance Alert ────────────────────────────────────────────────────

class VarianceAlertModel(Base):
    __tablename__ = "variance_alerts"

    alert_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    plant_name: Mapped[str] = mapped_column(String(200))
    metric_name: Mapped[str] = mapped_column(String(100))
    plant_value: Mapped[float] = mapped_column(Float)
    portfolio_mean: Mapped[float] = mapped_column(Float)
    portfolio_std: Mapped[float] = mapped_column(Float)
    z_score: Mapped[float] = mapped_column(Float)
    variance_level: Mapped[str] = mapped_column(String(20))
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    message: Mapped[str] = mapped_column(Text, default="")


# ── Expert Card ───────────────────────────────────────────────────────

class ExpertCardModel(Base):
    __tablename__ = "expert_cards"

    expert_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(50))
    plant_id: Mapped[str] = mapped_column(String(50))
    domains: Mapped[list | None] = mapped_column(JSON, nullable=True)
    equipment_expertise: Mapped[list | None] = mapped_column(JSON, nullable=True)
    certifications: Mapped[list | None] = mapped_column(JSON, nullable=True)
    years_experience: Mapped[int] = mapped_column(Integer, default=0)
    resolution_count: Mapped[int] = mapped_column(Integer, default=0)
    last_active: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    contact_method: Mapped[str] = mapped_column(String(200), default="")
    languages: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # GAP-W13: Expert knowledge capture fields
    is_retired: Mapped[bool] = mapped_column(Boolean, default=False)
    retired_at: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    hourly_rate_usd: Mapped[float] = mapped_column(Float, default=50.0)
    availability_hours: Mapped[str] = mapped_column(String(200), default="")
    preferred_contact: Mapped[str] = mapped_column(String(20), default="IN_APP")


# ── Audit Log ─────────────────────────────────────────────────────────

class AuditLogModel(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)
    entity_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action: Mapped[str] = mapped_column(String(20))  # CREATE, UPDATE, DELETE, APPROVE
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    user: Mapped[str] = mapped_column(String(100), default="system")
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, index=True)


# ══════════════════════════════════════════════════════════════════════
# Phase 3 — Modules 1-3 (Field Capture, Planner, Backlog)
# ══════════════════════════════════════════════════════════════════════

# ── Field Capture ────────────────────────────────────────────────────

class FieldCaptureModel(Base):
    __tablename__ = "field_captures"

    capture_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    technician_id: Mapped[str] = mapped_column(String(100))
    capture_type: Mapped[str] = mapped_column(String(20))  # VOICE, TEXT, IMAGE, VOICE+IMAGE
    language: Mapped[str] = mapped_column(String(5), default="en")
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_voice_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list | None] = mapped_column(JSON, nullable=True)
    equipment_tag_manual: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location_hint: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    # GAP-W03: Sync version tracking
    version: Mapped[int] = mapped_column(Integer, default=1)
    synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    modified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.now)
    # G-08: Audio + GPS + Vision fields
    audio_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    audio_transcription: Mapped[str | None] = mapped_column(Text, nullable=True)
    gps_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    gps_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_analysis_result: Mapped[str | None] = mapped_column(Text, nullable=True)


# ── Work Request ─────────────────────────────────────────────────────

class WorkRequestModel(Base):
    __tablename__ = "work_requests"

    request_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    source_capture_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("field_captures.capture_id"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")
    equipment_id: Mapped[str] = mapped_column(String(100))
    equipment_tag: Mapped[str] = mapped_column(String(100))
    equipment_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    resolution_method: Mapped[str] = mapped_column(String(30), default="MANUAL")
    problem_description: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_classification: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    spare_parts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    image_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    validation: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    # GAP-W03: Sync version tracking
    version: Mapped[int] = mapped_column(Integer, default=1)
    synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    modified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.now)
    # Jorge Work Management: priority, SLA, approval flow
    priority_code: Mapped[str] = mapped_column(String(5), default="P3")  # P1,P2,P3,P4
    work_class: Mapped[str] = mapped_column(String(20), default="PROGRAMADO")  # PROGRAMADO, NO_PROGRAMADO
    sla_deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    approver_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    approval_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    # SAP Aviso alignment (Creación de Aviso IH01)
    notification_type: Mapped[str] = mapped_column(String(30), default="A1")  # A1=Aviso Mantenimiento
    reported_by: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Autor del Aviso (quién reporta, distinto de created_by)
    reported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    documents: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{name, url, type}] adjuntos
    support_equipment: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{tag, description}] equipos de apoyo
    circumstances: Mapped[str | None] = mapped_column(Text, nullable=True)  # Detalle/Circunstancias (SAP campo 8)
    # BBP SAP PM Master Data (AMSA_BBP_PM_04)
    aviso_coding: Mapped[str | None] = mapped_column(String(10), nullable=True)  # M001, M002, M003, P001, P002
    planning_group: Mapped[str | None] = mapped_column(String(10), nullable=True)  # M01-M05, P01-P03
    area_empresa: Mapped[str | None] = mapped_column(String(10), nullable=True)  # SEC, HUM, RIP, PER, CAR, TRA, APO, AUX, TAL
    work_center: Mapped[str | None] = mapped_column(String(20), nullable=True)  # PASMEC01, MPCMEC01, etc.
    failure_object_part: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Parte Objeto (Cat B)
    technical_location: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Ubicacion tecnica SAP
    aviso_number: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Numero correlativo secuencial
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # Soft delete
    deleted_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Jorge 2026-04-23 — SAP-style: cancel con motivo obligatorio, nunca delete.
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_work_requests_status", "status"),
        Index("ix_work_requests_priority", "priority_code"),
        Index("ix_work_requests_equipment", "equipment_tag"),
    )


# Auto-asignar aviso_number antes de insert si no está seteado.
# Garantiza AV-NNNNN legible en TODOS los paths de creación (UI, voice, drone, sync, captures).
@event.listens_for(WorkRequestModel, "before_insert")
def _auto_assign_aviso_number(mapper, connection, target):
    if getattr(target, "aviso_number", None) is None:
        try:
            from sqlalchemy import text as _text
            row = connection.execute(_text("SELECT COALESCE(MAX(aviso_number), 0) + 1 FROM work_requests")).scalar()
            target.aviso_number = int(row or 1)
        except Exception:
            pass


# ── Managed Work Orders (Jorge Phase 2 — full OT lifecycle) ─────────

class ManagedWorkOrderModel(Base):
    __tablename__ = "managed_work_orders"

    wo_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    wo_number: Mapped[str] = mapped_column(String(30), unique=True)  # OT-2026-00001
    work_request_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    plant_id: Mapped[str] = mapped_column(String(50), default="OCP-JFC1")
    equipment_id: Mapped[str] = mapped_column(String(100))
    equipment_tag: Mapped[str] = mapped_column(String(100))

    # Planning
    wo_title: Mapped[str | None] = mapped_column(String(200), nullable=True)  # SF-507 Jorge: título arrastrado desde el WR
    description: Mapped[str] = mapped_column(Text, default="")
    wo_type: Mapped[str] = mapped_column(String(30), default="CORRECTIVO")  # CORRECTIVO, PREVENTIVO, PREDICTIVO, MEJORA, INCIDENTE_OPERACIONAL, MONITOREO_CONDICION
    priority_code: Mapped[str] = mapped_column(String(5), default="P3")
    work_class: Mapped[str] = mapped_column(String(20), default="PROGRAMADO")

    # Resources (JSON for flexibility)
    operations: Mapped[list | None] = mapped_column(JSON, nullable=True)   # [{seq, description, specialty, hours, status}]
    materials: Mapped[list | None] = mapped_column(JSON, nullable=True)    # [{code, description, qty_required, qty_available, reserved}]
    tools: Mapped[list | None] = mapped_column(JSON, nullable=True)        # [{tool_name, qty}]
    # Equipos de apoyo arrastrados desde el aviso (grúa, mandil, scaffolding, etc).
    # Jorge 2026-04-28 17:56: tienen que propagarse Aviso → OT → Execution → Reports.
    # Lista de {tag, name, equipment_type?, hours?, notes?}
    support_equipment: Mapped[list | None] = mapped_column(JSON, nullable=True)
    documents: Mapped[list | None] = mapped_column(JSON, nullable=True)    # [{name, url, type}]
    labour_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {total_hours, specialties: [{name, hours}]}

    # Scheduling
    planned_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    planned_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=4.0)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0)

    # Workflow: CREADO -> PLANIFICADO -> PROGRAMADO -> EN_EJECUCION -> CERRADO (also REPROGRAMADO, CANCELADO)
    status: Mapped[str] = mapped_column(String(30), default="CREADO")
    planned_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    released_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    released_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # Group C #8 — optional contractor crew assignment (NULL = in-house techs)
    contractor_crew_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Closure signature: legal trace that a supervisor signed off on the work.
    # Not full e-sig — stores name typed + last-4 of PIN hash. Enough for audit.
    closed_by_signature: Mapped[str | None] = mapped_column(String(120), nullable=True)
    closed_by_pin_hash: Mapped[str | None] = mapped_column(String(16), nullable=True)
    closure_notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # SF-500 — audio comments al cerrar y firmar OT (data URL o ruta).
    closure_audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Jorge 2026-04-21 — RCM feedback post-cierre (lecciones aprendidas).
    post_closure_review: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    assigned_workers: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{worker_id, name, specialty}]

    # Fast track (P1/P2 imprevistos skip planning)
    is_fast_track: Mapped[bool] = mapped_column(Boolean, default=False)
    # SAP PM fields (inherited from WR)
    technical_location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    planning_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    work_center: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Execution
    completion_pct: Mapped[float] = mapped_column(Float, default=0.0)
    execution_notes: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{timestamp, user, note}]

    # Risk & budget (Gasto = presupuesto, Costo = real)
    risk_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    budget_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    budget_amount: Mapped[float | None] = mapped_column(Float, nullable=True)  # Gasto (presupuestado)
    labor_cost: Mapped[float | None] = mapped_column(Float, nullable=True)               # Costo mano de obra
    material_cost: Mapped[float | None] = mapped_column(Float, nullable=True)            # Costo materiales real
    external_cost: Mapped[float | None] = mapped_column(Float, nullable=True)            # Costo servicios externos real
    planned_material_cost: Mapped[float | None] = mapped_column(Float, nullable=True)    # Costo materiales plan
    planned_external_cost: Mapped[float | None] = mapped_column(Float, nullable=True)    # Costo servicios externos plan
    actual_total_cost: Mapped[float | None] = mapped_column(Float, nullable=True)  # Costo total real
    shift: Mapped[str | None] = mapped_column(String(10), nullable=True, default="day")  # day, night
    reservation_code: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Última reserva creada (activa)
    reservation_codes: Mapped[list | None] = mapped_column(JSON, nullable=True)  # Historial: [{code, created_at, locked}] — Jorge 2026-04-20
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)  # Why the WO was cancelled
    # SF-579 — cancelación con tipología (ABSORBED / NOT_NEEDED / OTHER) + link a OT absorbente
    cancellation_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    absorbed_by_wo_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.now)
    # Fase 9 Jorge 2026-04-21 — optimistic concurrency lock.
    # Incrementa en cada PATCH; rechaza si el cliente manda If-Match con una
    # versión distinta (otro usuario modificó la OT entre medio).
    version: Mapped[int] = mapped_column(Integer, default=1, server_default="1")

    __table_args__ = (
        Index("ix_mwo_status", "status"),
        Index("ix_mwo_equipment", "equipment_tag"),
        Index("ix_mwo_plant", "plant_id"),
        Index("ix_mwo_priority", "priority_code"),
    )


# ── Planner Recommendation ──────────────────────────────────────────

class PlannerRecommendationModel(Base):
    __tablename__ = "planner_recommendations"

    recommendation_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    work_request_id: Mapped[str] = mapped_column(String(50), ForeignKey("work_requests.request_id"))
    resource_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    scheduling_suggestion: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    risk_assessment: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    planner_action: Mapped[str] = mapped_column(String(20))  # APPROVE, MODIFY, ESCALATE, DEFER
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Backlog Item ─────────────────────────────────────────────────────

class BacklogItemModel(Base):
    __tablename__ = "backlog_items"

    backlog_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    work_request_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("work_requests.request_id"), nullable=True)
    equipment_id: Mapped[str] = mapped_column(String(100))
    equipment_tag: Mapped[str] = mapped_column(String(100))
    priority: Mapped[str] = mapped_column(String(20))
    wo_type: Mapped[str] = mapped_column(String(10))  # PM01, PM02, PM03
    status: Mapped[str] = mapped_column(String(30), default="AWAITING_APPROVAL")
    blocking_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=4.0)
    specialties: Mapped[list | None] = mapped_column(JSON, nullable=True)
    materials_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    shutdown_required: Mapped[bool] = mapped_column(Boolean, default=False)
    age_days: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_backlog_items_priority", "priority"),
        Index("ix_backlog_items_status", "status"),
        Index("ix_backlog_items_equipment_tag", "equipment_tag"),
    )


# ── Optimized Backlog ───────────────────────────────────────────────

class OptimizedBacklogModel(Base):
    __tablename__ = "optimized_backlogs"

    optimization_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    total_items: Mapped[int] = mapped_column(Integer, default=0)
    stratification: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    work_packages: Mapped[list | None] = mapped_column(JSON, nullable=True)
    schedule: Mapped[list | None] = mapped_column(JSON, nullable=True)
    alerts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Workforce ────────────────────────────────────────────────────────

class WorkforceModel(Base):
    __tablename__ = "workforce"

    worker_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    specialty: Mapped[str] = mapped_column(String(50))
    shift: Mapped[str] = mapped_column(String(20))  # MORNING, AFTERNOON, NIGHT
    plant_id: Mapped[str] = mapped_column(String(50))
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    certifications: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # GAP-W09: Competency-based assignment fields
    competency_level: Mapped[str] = mapped_column(String(1), default="B")
    years_experience: Mapped[int] = mapped_column(Integer, default=0)
    equipment_expertise: Mapped[list | None] = mapped_column(JSON, nullable=True)
    safety_training_current: Mapped[bool] = mapped_column(Boolean, default=True)
    competencies: Mapped[list | None] = mapped_column(JSON, nullable=True)
    absence_reason: Mapped[str | None] = mapped_column(String(100), nullable=True)  # vacation, course, sick, etc.
    absence_until: Mapped[str | None] = mapped_column(String(20), nullable=True)  # date string
    # Jorge 2026-04-21 — shift pattern drives the weekly board visibility.
    # Values: "5x2", "4x3", "7x7", "14x14", "continuous", "abc_8h".
    shift_pattern: Mapped[str | None] = mapped_column(String(16), nullable=True)
    # ISO date from which the on/off cycle starts. Needed for 7x7 / 14x14
    # where the tech is only on-shift half the calendar.
    shift_cycle_start: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Free-form skills/certifications used by auto-level to pick the right person
    # (e.g. ["soldadura", "alta tensión", "neumática", "hidráulica"]).
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True)


# ── Support Equipment (Cranes, Heavy Equipment) ─────────────────────

class SupportEquipmentModel(Base):
    __tablename__ = "support_equipment"

    equipment_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(200))
    equipment_type: Mapped[str] = mapped_column(String(50))  # BRIDGE_CRANE, MOBILE_CRANE, FORKLIFT, SCAFFOLDING
    capacity_tons: Mapped[float | None] = mapped_column(Float, nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_rented: Mapped[bool] = mapped_column(Boolean, default=False)
    out_of_service_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    out_of_service_until: Mapped[str | None] = mapped_column(String(20), nullable=True)


# ── Shutdown Calendar ────────────────────────────────────────────────

class ShutdownCalendarModel(Base):
    __tablename__ = "shutdown_calendar"

    shutdown_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    shutdown_type: Mapped[str] = mapped_column(String(30))  # MINOR_8H, MAJOR_20H_PLUS
    areas: Mapped[list | None] = mapped_column(JSON, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")


# ── Inventory Item ───────────────────────────────────────────────────

class InventoryItemModel(Base):
    __tablename__ = "inventory_items"

    item_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    material_code: Mapped[str] = mapped_column(String(50), index=True)
    warehouse_id: Mapped[str] = mapped_column(String(50), default="WH-01")
    description: Mapped[str] = mapped_column(String(300))
    quantity_on_hand: Mapped[int] = mapped_column(Integer, default=0)
    quantity_reserved: Mapped[int] = mapped_column(Integer, default=0)
    quantity_available: Mapped[int] = mapped_column(Integer, default=0)
    min_stock: Mapped[int] = mapped_column(Integer, default=0)
    reorder_point: Mapped[int] = mapped_column(Integer, default=0)
    last_movement_date: Mapped[date | None] = mapped_column(Date, nullable=True)


# ══════════════════════════════════════════════════════════════════════
# Phase 4B — Scheduling Engine
# ══════════════════════════════════════════════════════════════════════

# ── Weekly Program ──────────────────────────────────────────────────

class WeeklyProgramModel(Base):
    __tablename__ = "weekly_programs"

    program_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    week_number: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    work_packages: Mapped[list | None] = mapped_column(JSON, nullable=True)
    total_hours: Mapped[float] = mapped_column(Float, default=0.0)
    resource_slots: Mapped[list | None] = mapped_column(JSON, nullable=True)
    conflicts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    support_tasks: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    finalized_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # Phase 3 — Scheduling improvements
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    published_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    material_status: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {confirmed, pending, unavailable}
    hh_balance: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {capacity, assigned, available, by_specialty}

    __table_args__ = (
        Index("ix_weekly_programs_plant_year_week", "plant_id", "year", "week_number"),
    )


# ══════════════════════════════════════════════════════════════════════
# Phase 5 — Advanced Reliability Engineering
# ══════════════════════════════════════════════════════════════════════

# ── Shutdown Events ───────────────────────────────────────────────────

class ShutdownEventModel(Base):
    __tablename__ = "shutdown_events"

    shutdown_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="PLANNED")
    planned_start: Mapped[datetime] = mapped_column(DateTime)
    planned_end: Mapped[datetime] = mapped_column(DateTime)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    planned_hours: Mapped[float] = mapped_column(Float, default=0.0)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0)
    work_orders: Mapped[list | None] = mapped_column(JSON, nullable=True)
    completed_work_orders: Mapped[list | None] = mapped_column(JSON, nullable=True)
    completion_pct: Mapped[float] = mapped_column(Float, default=0.0)
    delay_hours: Mapped[float] = mapped_column(Float, default=0.0)
    delay_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── MoC Requests ─────────────────────────────────────────────────────

class MoCRequestModel(Base):
    __tablename__ = "moc_requests"

    moc_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(50), default="EQUIPMENT_MODIFICATION")
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    risk_level: Mapped[str] = mapped_column(String(20), default="LOW")
    requester_id: Mapped[str] = mapped_column(String(50), default="")
    reviewer_id: Mapped[str] = mapped_column(String(50), default="")
    approver_id: Mapped[str] = mapped_column(String(50), default="")
    affected_equipment: Mapped[list | None] = mapped_column(JSON, nullable=True)
    affected_procedures: Mapped[list | None] = mapped_column(JSON, nullable=True)
    risk_assessment: Mapped[str] = mapped_column(Text, default="")
    impact_analysis: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ── Spare Part Analyses ──────────────────────────────────────────────

class SparePartAnalysisModel(Base):
    __tablename__ = "spare_part_analyses"

    analysis_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    total_parts: Mapped[int] = mapped_column(Integer, default=0)
    results: Mapped[list | None] = mapped_column(JSON, nullable=True)
    total_inventory_value: Mapped[float] = mapped_column(Float, default=0.0)
    recommended_reduction_pct: Mapped[float] = mapped_column(Float, default=0.0)


# ── RBI Assessments ──────────────────────────────────────────────────

class RBIAssessmentModel(Base):
    __tablename__ = "rbi_assessments"

    assessment_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    total_equipment: Mapped[int] = mapped_column(Integer, default=0)
    assessments: Mapped[list | None] = mapped_column(JSON, nullable=True)
    high_risk_count: Mapped[int] = mapped_column(Integer, default=0)
    overdue_count: Mapped[int] = mapped_column(Integer, default=0)


# ══════════════════════════════════════════════════════════════════════
# Phase 6 — Reporting, Dashboards & Integration
# ══════════════════════════════════════════════════════════════════════

class ReportModel(Base):
    __tablename__ = "reports"

    report_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    report_type: Mapped[str] = mapped_column(String(30))
    plant_id: Mapped[str] = mapped_column(String(50))
    period_start: Mapped[datetime] = mapped_column(DateTime)
    period_end: Mapped[datetime] = mapped_column(DateTime)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    content: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_reports_plant_type", "plant_id", "report_type"),
    )


class NotificationModel(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    notification_type: Mapped[str] = mapped_column(String(30))
    level: Mapped[str] = mapped_column(String(20), default="INFO")
    plant_id: Mapped[str] = mapped_column(String(50))
    equipment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    title: Mapped[str] = mapped_column(String(300))
    message: Mapped[str] = mapped_column(Text, default="")
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # GAP-W13: Expert consultation notification fields
    recipient_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    consultation_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    channel: Mapped[str] = mapped_column(String(20), default="IN_APP")
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ══════════════════════════════════════════════════════════════════════
# Phase 7 — FMECA Worksheets
# ══════════════════════════════════════════════════════════════════════

# ── RCA Analysis ─────────────────────────────────────────────────────

class RCAAnalysisModel(Base):
    __tablename__ = "rca_analyses"

    analysis_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    event_description: Mapped[str] = mapped_column(Text)
    plant_id: Mapped[str] = mapped_column(String(50))
    equipment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    level: Mapped[str] = mapped_column(String(10), default="LEVEL_1")
    status: Mapped[str] = mapped_column(String(30), default="OPEN")
    team_members: Mapped[list | None] = mapped_column(JSON, nullable=True)
    analysis_5w2h: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    cause_effect: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    evidence_5p: Mapped[list | None] = mapped_column(JSON, nullable=True)
    solutions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_rca_analyses_plant_status", "plant_id", "status"),
    )


# ── Planning KPI Snapshots ──────────────────────────────────────────

class PlanningKPISnapshotModel(Base):
    __tablename__ = "planning_kpi_snapshots"

    snapshot_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    kpis: Mapped[list | None] = mapped_column(JSON, nullable=True)
    overall_health: Mapped[str] = mapped_column(String(20), default="UNKNOWN")
    on_target_count: Mapped[int] = mapped_column(Integer, default=0)
    below_target_count: Mapped[int] = mapped_column(Integer, default=0)
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_planning_kpi_plant_period", "plant_id", "period_start"),
    )


# ── DE KPI Snapshots ────────────────────────────────────────────────

class DEKPISnapshotModel(Base):
    __tablename__ = "de_kpi_snapshots"

    snapshot_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50))
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    kpis: Mapped[list | None] = mapped_column(JSON, nullable=True)
    overall_compliance: Mapped[float] = mapped_column(Float, default=0.0)
    program_score: Mapped[float] = mapped_column(Float, default=0.0)
    maturity_level: Mapped[str] = mapped_column(String(20), default="INITIAL")
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_de_kpi_plant_period", "plant_id", "period_start"),
    )


# ── User Feedback (Phase 9) ─────────────────────────────────────────

class UserFeedbackModel(Base):
    __tablename__ = "user_feedback"

    feedback_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    page: Mapped[str] = mapped_column(String(100))
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Detailed Feedback (with attachments, screenshots, etc.) ──────────

class DetailedFeedbackModel(Base):
    __tablename__ = "detailed_feedback"

    feedback_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    # Who
    user_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_name: Mapped[str] = mapped_column(String(100), default="anonymous")
    user_role: Mapped[str] = mapped_column(String(50), default="")
    # What
    feedback_type: Mapped[str] = mapped_column(String(30), default="suggestion")  # bug, suggestion, question, improvement, other
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high, critical
    title: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    rating: Mapped[int] = mapped_column(Integer, default=3)  # 1-5
    # Where
    page_url: Mapped[str] = mapped_column(String(500), default="")
    page_name: Mapped[str] = mapped_column(String(100), default="")
    section: Mapped[str] = mapped_column(String(100), default="")  # specific section of the page
    component: Mapped[str] = mapped_column(String(100), default="")  # specific component
    # Context
    browser_info: Mapped[str] = mapped_column(String(500), default="")
    screen_size: Mapped[str] = mapped_column(String(50), default="")
    device_type: Mapped[str] = mapped_column(String(30), default="")  # desktop, mobile, tablet
    os_info: Mapped[str] = mapped_column(String(100), default="")
    # Attachments — JSON arrays
    screenshots: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{url, filename, caption}]
    attachments: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{url, filename, type, size}]
    # Steps to reproduce (for bugs)
    steps_to_reproduce: Mapped[str] = mapped_column(Text, default="")
    expected_behavior: Mapped[str] = mapped_column(Text, default="")
    actual_behavior: Mapped[str] = mapped_column(Text, default="")
    # Extended fields
    frequency: Mapped[str] = mapped_column(String(30), default="")  # always, sometimes, rarely, first_time
    impact: Mapped[str] = mapped_column(String(30), default="")  # only_me, my_team, everyone, unknown
    contact_email: Mapped[str] = mapped_column(String(255), default="")
    desired_behavior: Mapped[str] = mapped_column(Text, default="")  # for improvements
    expected_benefit: Mapped[str] = mapped_column(Text, default="")  # for suggestions
    # Status
    status: Mapped[str] = mapped_column(String(20), default="new")  # new, reviewed, in_progress, resolved, closed
    admin_notes: Mapped[str] = mapped_column(Text, default="")
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class DedupNegativePairModel(Base):
    """SF-213 mejora: cuando un usuario marca "no es duplicado" entre dos WRs,
    persiste el par para que la IA no vuelva a sugerirlo. Aprendizaje ligero."""
    __tablename__ = "dedup_negative_pairs"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    wr_a_id: Mapped[str] = mapped_column(String(50), index=True)
    wr_b_id: Mapped[str] = mapped_column(String(50), index=True)
    plant_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dismissed_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class FMECAWorksheetModel(Base):
    __tablename__ = "fmeca_worksheets"

    worksheet_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    equipment_id: Mapped[str] = mapped_column(String(100), index=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    equipment_name: Mapped[str] = mapped_column(String(300), default="")
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    current_stage: Mapped[str] = mapped_column(String(30), default="STAGE_1_FUNCTIONS")
    rows: Mapped[list | None] = mapped_column(JSON, nullable=True)
    stage_completion: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    analyst: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ── AI Agent Sessions (CORTEX integration) ────────────────────────────

class AISessionModel(Base):
    """Tracks a multi-agent strategy development session."""
    __tablename__ = "ai_sessions"

    session_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(50), index=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    current_milestone: Mapped[int] = mapped_column(Integer, default=0)
    session_state: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    milestone_gates: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_ai_sessions_user", "user_id"),
        Index("ix_ai_sessions_status", "status"),
    )


class AIInteractionModel(Base):
    """Audit log for individual agent interactions within a session."""
    __tablename__ = "ai_interactions"

    interaction_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String(50), ForeignKey("ai_sessions.session_id"), index=True)
    agent_type: Mapped[str] = mapped_column(String(30))
    milestone: Mapped[int] = mapped_column(Integer, default=0)
    instruction: Mapped[str] = mapped_column(Text, default="")
    response_summary: Mapped[str] = mapped_column(Text, default="")
    tool_calls: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class TroubleshootingDiagnosticModel(Base):
    """GAP-W02: AI-assisted troubleshooting diagnostic results."""
    __tablename__ = "troubleshooting_diagnostics"

    diagnostic_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    equipment_tag: Mapped[str] = mapped_column(String(100), index=True)
    plant_id: Mapped[str] = mapped_column(String(50), index=True)
    symptom_description: Mapped[str] = mapped_column(Text, default="")
    ai_diagnosis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    probable_causes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    recommended_actions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_notes: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_diag_equipment", "equipment_tag", "plant_id"),
    )


# ══════════════════════════════════════════════════════════════════════
# GAP Modules — Execution Checklists, Sync, Troubleshooting, etc.
# ══════════════════════════════════════════════════════════════════════

# ── Execution Checklists (GAP-W06) ──────────────────────────────────

class ExecutionChecklistModel(Base):
    """GAP-W06: AI-generated execution checklists for work orders."""
    __tablename__ = "execution_checklists"

    checklist_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    work_package_id: Mapped[str] = mapped_column(String(50), index=True)
    work_package_name: Mapped[str] = mapped_column(String(200), default="")
    work_package_code: Mapped[str] = mapped_column(String(100), default="")
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    equipment_name: Mapped[str] = mapped_column(String(300), default="")
    task_type: Mapped[str] = mapped_column(String(30), default="")
    steps: Mapped[list | None] = mapped_column(JSON, nullable=True)
    checklist_items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    safety_items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    safety_section: Mapped[list | None] = mapped_column(JSON, nullable=True)
    loto_steps: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ppe_requirements: Mapped[list | None] = mapped_column(JSON, nullable=True)
    pre_task_notes: Mapped[str] = mapped_column(Text, default="")
    post_task_notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    assigned_to: Mapped[str] = mapped_column(String(100), default="")
    supervisor: Mapped[str] = mapped_column(String(100), default="")
    supervisor_signature: Mapped[str | None] = mapped_column(Text, nullable=True)
    closure_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    completed_items: Mapped[int] = mapped_column(Integer, default=0)
    total_items: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_exec_checklists_wp", "work_package_id"),
        Index("ix_exec_checklists_status", "status"),
        Index("ix_exec_checklists_assigned", "assigned_to"),
    )


# ── Work Assignments (GAP-W09) ──────────────────────────────────────

class WorkAssignmentModel(Base):
    """GAP-W09: AI-optimized work assignments by competency."""
    __tablename__ = "work_assignments"

    assignment_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    work_package_id: Mapped[str] = mapped_column(String(50), index=True)
    plant_id: Mapped[str] = mapped_column(String(50), index=True)
    assigned_to: Mapped[str] = mapped_column(String(50), default="")
    required_competencies: Mapped[list | None] = mapped_column(JSON, nullable=True)
    matched_competencies: Mapped[list | None] = mapped_column(JSON, nullable=True)
    competency_match_score: Mapped[float] = mapped_column(Float, default=0.0)
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    # Jorge Phase 4 — Execution tracking
    wo_id: Mapped[str | None] = mapped_column(String(50), nullable=True)  # link to managed WO
    task_description: Mapped[str] = mapped_column(Text, default="")
    task_understood: Mapped[bool] = mapped_column(Boolean, default=False)
    progress_pct: Mapped[float] = mapped_column(Float, default=0.0)
    partial_notes: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{timestamp, note}]
    shift_handover_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Sync Conflicts (GAP-W03) ───────────────────────────────────────

class SyncConflictModel(Base):
    __tablename__ = "sync_conflicts"

    conflict_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    entity_type: Mapped[str] = mapped_column(String(30))
    entity_id: Mapped[str] = mapped_column(String(50))
    field: Mapped[str] = mapped_column(String(100))
    local_value: Mapped[str] = mapped_column(Text, default="")
    server_value: Mapped[str] = mapped_column(Text, default="")
    local_modified_at: Mapped[datetime] = mapped_column(DateTime)
    server_modified_at: Mapped[datetime] = mapped_column(DateTime)
    resolution: Mapped[str | None] = mapped_column(String(20), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    device_id: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Troubleshooting Sessions (GAP-W02) ─────────────────────────────

class TroubleshootingSessionModel(Base):
    __tablename__ = "troubleshooting_sessions"

    session_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    equipment_type_id: Mapped[str] = mapped_column(String(100), index=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="IN_PROGRESS")
    symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    tests_performed: Mapped[str | None] = mapped_column(Text, nullable=True)
    candidate_diagnoses: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_fm_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    final_mechanism: Mapped[str | None] = mapped_column(String(100), nullable=True)
    final_cause: Mapped[str | None] = mapped_column(String(100), nullable=True)
    final_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_cause_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    technician_id: Mapped[str] = mapped_column(String(100), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expert_consultation_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        Index("ix_troubleshooting_equipment", "equipment_type_id"),
        Index("ix_troubleshooting_status", "status"),
    )


# ── Deliverables (GAP-W10) ─────────────────────────────────────────

class DeliverableModel(Base):
    __tablename__ = "deliverables"

    deliverable_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    name_fr: Mapped[str] = mapped_column(String(200), default="")
    category: Mapped[str] = mapped_column(String(30))
    milestone: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    execution_plan_stage_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    quality_score_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=0.0)
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0)
    artifact_paths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    client_slug: Mapped[str] = mapped_column(String(50), default="", index=True)
    project_slug: Mapped[str] = mapped_column(String(50), default="", index=True)
    assigned_agent: Mapped[str] = mapped_column(String(30), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    client_feedback: Mapped[str] = mapped_column(Text, default="")
    consultant_notes: Mapped[str] = mapped_column(Text, default="")

    __table_args__ = (
        Index("ix_deliverables_project", "client_slug", "project_slug"),
        Index("ix_deliverables_milestone", "milestone"),
        Index("ix_deliverables_status", "status"),
    )


# ── Time Logs (GAP-W10) ────────────────────────────────────────────

class TimeLogModel(Base):
    __tablename__ = "time_logs"

    log_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    deliverable_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("deliverables.deliverable_id")
    )
    hours: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text, default="")
    logged_by: Mapped[str] = mapped_column(String(100), default="consultant")
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    activity_type: Mapped[str] = mapped_column(String(30), default="analysis")

    __table_args__ = (
        Index("ix_time_logs_deliverable", "deliverable_id"),
    )


# ── Expert Consultations (GAP-W13) ─────────────────────────────────

class ExpertConsultationModel(Base):
    __tablename__ = "expert_consultations"

    consultation_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String(50), index=True)
    expert_id: Mapped[str] = mapped_column(String(50), index=True)
    technician_id: Mapped[str] = mapped_column(String(100), default="")
    equipment_type_id: Mapped[str] = mapped_column(String(100), default="")
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    symptoms_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    candidates_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_suggestion: Mapped[str] = mapped_column(Text, default="")
    expert_guidance: Mapped[str] = mapped_column(Text, default="")
    expert_fm_codes: Mapped[str | None] = mapped_column(Text, nullable=True)
    expert_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="REQUESTED")
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    viewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    response_time_minutes: Mapped[float] = mapped_column(Float, default=0.0)
    compensation_status: Mapped[str] = mapped_column(String(20), default="PENDING")
    language: Mapped[str] = mapped_column(String(5), default="fr")
    notes: Mapped[str] = mapped_column(Text, default="")

    __table_args__ = (
        Index("ix_consultation_status", "status"),
    )


# ── Expert Contributions (GAP-W13) ─────────────────────────────────

class ExpertContributionModel(Base):
    __tablename__ = "expert_contributions"

    contribution_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    consultation_id: Mapped[str] = mapped_column(String(50), index=True)
    expert_id: Mapped[str] = mapped_column(String(50), index=True)
    equipment_type_id: Mapped[str] = mapped_column(String(100), default="")
    fm_codes: Mapped[str | None] = mapped_column(Text, nullable=True)
    symptom_descriptions: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnostic_steps: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrective_actions: Mapped[str | None] = mapped_column(Text, nullable=True)
    tips: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="RAW")
    validated_by: Mapped[str] = mapped_column(String(100), default="")
    validated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    promoted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    promoted_targets: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_contribution_status", "status"),
    )


# ── Import History (G-18) ──────────────────────────────────────────

class ImportHistoryModel(Base):
    __tablename__ = "import_history"

    import_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    source: Mapped[str] = mapped_column(String(50))
    filename: Mapped[str] = mapped_column(String(255))
    file_size_kb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_rows: Mapped[int] = mapped_column(Integer, default=0)
    valid_rows: Mapped[int] = mapped_column(Integer, default=0)
    error_rows: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20))
    errors_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    imported_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_import_history_plant", "plant_id"),
        Index("ix_import_history_source", "source"),
    )


# ── OR System Models ───────────────────────────────────────────────

class ORProjectModel(Base):
    """Proyecto de Operational Readiness — coordina los 13 agentes CORTEX."""
    __tablename__ = "or_projects"

    project_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(100), nullable=False)
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    plant_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    project_type: Mapped[str] = mapped_column(String(50), default="greenfield")
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    current_gate: Mapped[str] = mapped_column(String(10), default="G0")
    gate_status: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    active_agents: Mapped[list | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (
        Index("ix_or_projects_user", "user_id"),
        Index("ix_or_projects_status", "status"),
    )


class ORDeliverableModel(Base):
    """Entregable generado por agentes CORTEX (docx, xlsx, pptx)."""
    __tablename__ = "or_deliverables"

    deliverable_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    project_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("or_projects.project_id"), nullable=True)
    agent_type: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(200))
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_type: Mapped[str] = mapped_column(String(10), default="docx")
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    quality_dimensions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    gate: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_or_deliverables_project", "project_id"),
        Index("ix_or_deliverables_agent", "agent_type"),
    )


# ── Improvement Actions ──────────────────────────────────────────────

class ImprovementActionModel(Base):
    """Tracked improvement actions from RCA, deviations, or manual creation."""
    __tablename__ = "improvement_actions"

    action_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    equipment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")

    # Source tracking
    source_type: Mapped[str] = mapped_column(String(30), default="MANUAL")  # MANUAL, RCA, DEVIATION, WORK_REQUEST, CAPA
    source_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g. RCA-xxx, WR-xxx

    # Classification
    action_type: Mapped[str] = mapped_column(String(30), default="CORRECTIVE")  # CORRECTIVE, PREVENTIVE, IMPROVEMENT
    priority: Mapped[str] = mapped_column(String(10), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    category: Mapped[str] = mapped_column(String(50), default="")  # Planning, Spare Parts, Procedures, Training, etc.

    # Assignment
    assigned_to: Mapped[str] = mapped_column(String(100), default="")
    created_by: Mapped[str] = mapped_column(String(100), default="")

    # Dates
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Status lifecycle: OPEN → IN_PROGRESS → COMPLETED → VERIFIED / CANCELLED
    status: Mapped[str] = mapped_column(String(20), default="OPEN")

    # AI flags
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_suggestion: Mapped[str] = mapped_column(Text, default="")

    # Notes / evidence
    notes: Mapped[str] = mapped_column(Text, default="")
    resolution: Mapped[str] = mapped_column(Text, default="")

    __table_args__ = (
        Index("ix_improvement_actions_plant_status", "plant_id", "status"),
        Index("ix_improvement_actions_assigned", "assigned_to"),
    )


# ── Equipment Handovers (Jorge Phase 4 — Execution) ──────────────────

class EquipmentHandoverModel(Base):
    """Equipment handover records between maintenance and operations."""
    __tablename__ = "equipment_handovers"

    handover_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    wo_id: Mapped[str] = mapped_column(String(50), index=True)  # FK managed_work_orders
    equipment_id: Mapped[str] = mapped_column(String(100))
    equipment_tag: Mapped[str] = mapped_column(String(100))
    handover_type: Mapped[str] = mapped_column(String(20))  # TO_MAINTENANCE, TO_OPERATIONS
    from_user: Mapped[str] = mapped_column(String(50))
    to_user: Mapped[str] = mapped_column(String(50))
    condition_notes: Mapped[str] = mapped_column(Text, default="")
    tests_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    test_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    handover_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# ── Post-Maintenance Reviews (Jorge Phase 5) ─────────────────────────

class PostMaintenanceReviewModel(Base):
    """Post-maintenance period reviews — analysis, meeting, improvements."""
    __tablename__ = "post_maintenance_reviews"

    review_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50), default="OCP-JFC1")
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)

    # Analysis
    wo_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {total, completed, delayed, rework_count}
    performance_kpis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    delays: Mapped[list | None] = mapped_column(JSON, nullable=True)
    unplanned_work: Mapped[list | None] = mapped_column(JSON, nullable=True)
    rework_items: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Meeting
    meeting_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    attendees: Mapped[list | None] = mapped_column(JSON, nullable=True)
    meeting_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Improvement
    improvement_actions: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{action, responsible, deadline, status}]
    lessons_learned: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="DRAFT")  # DRAFT, IN_REVIEW, COMPLETED
    created_by: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class AIFeedbackModel(Base):
    """Tracks AI prediction accuracy for learning loop."""
    __tablename__ = "ai_feedback"

    feedback_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    work_request_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    work_order_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    equipment_tag: Mapped[str] = mapped_column(String(100), default="")
    field_name: Mapped[str] = mapped_column(String(50), default="")  # priority, duration, failure_category, materials
    predicted_value: Mapped[str] = mapped_column(Text, default="")
    actual_value: Mapped[str] = mapped_column(Text, default="")
    rating: Mapped[int] = mapped_column(Integer, default=0)  # -1 bad, 0 neutral, 1 good
    feedback_source: Mapped[str] = mapped_column(String(30), default="manual")  # manual, planner_correction, wo_completion
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    __table_args__ = (
        Index("ix_ai_feedback_equipment", "equipment_tag"),
        Index("ix_ai_feedback_field", "field_name"),
    )


class AgenticExecutionModel(Base):
    """Tracks every agentic solution execution for audit, performance, and analytics."""
    __tablename__ = "agentic_executions"

    execution_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    solution_type: Mapped[str] = mapped_column(String(30), default="")  # VOICE_CAPTURE, AUTO_SCHEDULER, EQUIPMENT_DOCTOR, etc.
    triggered_by: Mapped[str] = mapped_column(String(50), default="")  # user_id who triggered it
    plant_id: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="RUNNING")  # RUNNING, COMPLETED, FAILED
    input_params: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_agentic_exec_solution_type", "solution_type"),
        Index("ix_agentic_exec_status", "status"),
        Index("ix_agentic_exec_plant_id", "plant_id"),
        Index("ix_agentic_exec_triggered_by", "triggered_by"),
        Index("ix_agentic_exec_created_at", "created_at"),
    )


# ── Equipment 3D Models (Blender/Digital Twin) ─────────────────────────

class Equipment3DModelModel(Base):
    """Links equipment types to 3D Blender models for visual inspection and digital twin."""
    __tablename__ = "equipment_3d_models"

    model_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    equipment_type: Mapped[str] = mapped_column(String(100), index=True)  # e.g. "centrifugal_pump", "sag_mill"
    name: Mapped[str] = mapped_column(String(200), default="")
    blender_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sketchfab_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reference_renders: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {"front": "path", "side": "path", ...}
    render_angles: Mapped[list | None] = mapped_column(JSON, nullable=True)  # ["front", "side", "top", "isometric"]
    model_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # vertices, materials, dimensions
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_3d_model_equipment_type", "equipment_type"),
    )


# ── Group C #6 — SAP sync log ────────────────────────────────────────
# Tracks outbound pushes of WOs to SAP. The real SAP connection (IDoc/RFC/REST)
# is not wired yet; this table captures the payload the worker WOULD send so
# the pipeline is idempotent once the transport is plugged in.
class SapSyncLogModel(Base):
    __tablename__ = "sap_sync_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(30), default="managed_work_order")
    entity_id: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING, SENT, FAILED, ACKED
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_error: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sap_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)  # SAP-side ID when acked
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, index=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ── Group C #8 — Contractors & crews ─────────────────────────────────
class ContractorModel(Base):
    __tablename__ = "contractors"

    contractor_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    plant_id: Mapped[str] = mapped_column(String(50), index=True)
    name: Mapped[str] = mapped_column(String(200))
    tax_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    hourly_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    # QA Jorge 2026-04-22 — campos típicos de contratista minero
    contact_email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    specialties: Mapped[list | None] = mapped_column(JSON, nullable=True)  # ['MECANICO','ELECTRICO',...]
    insurance_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    hse_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # 0-100
    sap_vendor_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    payment_terms_days: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 30/45/60/90
    contract_ref: Mapped[str | None] = mapped_column(String(60), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")  # ACTIVE / BLOCKED / PENDING
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class ContractorCrewModel(Base):
    __tablename__ = "contractor_crews"

    crew_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    contractor_id: Mapped[str] = mapped_column(String(50), index=True)
    name: Mapped[str] = mapped_column(String(120))
    specialty: Mapped[str | None] = mapped_column(String(30), nullable=True)  # MECH, ELEC, INST, CIVIL, etc.
    size: Mapped[int] = mapped_column(Integer, default=1)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class DMSDocumentModel(Base):
    __tablename__ = "dms_documents"

    doc_id: Mapped[str] = mapped_column(String(50), primary_key=True, default=_uuid)
    document_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)  # DOC-000001
    document_type: Mapped[str] = mapped_column(String(10), index=True)                 # DWG, MAF, MAN, PRO
    document_desc: Mapped[str] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, default=1)
    sap_func_loc: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    sap_func_loc_short: Mapped[str | None] = mapped_column(String(30), nullable=True)
    equipment_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    eqart: Mapped[str | None] = mapped_column(String(20), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(300), nullable=True)
    created_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Activo")
