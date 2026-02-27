"""SQLAlchemy ORM models — mirrors Pydantic schemas from tools/models/schemas.py.

Nested objects (FailureEffect, LabourResource, CriteriaScore, etc.) are stored
as JSON columns to avoid excessive join tables for the MVP.
"""

import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Integer, Float, Boolean, Text, DateTime, Date,
    ForeignKey, JSON, Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.connection import Base


def _uuid() -> str:
    return str(uuid.uuid4())


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


# ── Audit Log ─────────────────────────────────────────────────────────

class AuditLogModel(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)
    entity_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action: Mapped[str] = mapped_column(String(20))  # CREATE, UPDATE, DELETE, APPROVE
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    user: Mapped[str] = mapped_column(String(100), default="system")
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

    __table_args__ = (
        Index("ix_work_requests_status", "status"),
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
