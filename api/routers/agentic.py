"""Agentic Solutions router — unified gateway for all 26 AI-driven solutions.

Each solution belongs to a tier (T1 = quick-wins, T2 = mid-term, T3 = advanced).
This router exposes a status endpoint and will progressively receive
solution-specific endpoints as they are implemented.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.routers.auth import get_current_user

log = logging.getLogger(__name__)

router = APIRouter(tags=["agentic"])


# ── Pydantic request schemas ───────────────────────────────────────────────

class VoiceCaptureRequest(BaseModel):
    """Input for VoiceCapture Pro — voice/photo/text field capture."""
    audio_base64: str | None = None       # base64 audio (WAV/WebM) for transcription
    image_base64: str | None = None       # base64 data-URL image from camera
    text_input: str | None = None         # direct text description of the problem
    equipment_tag_hint: str | None = None  # optional tag if technician knows it
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    technician_id: str = Field(default="UNKNOWN", max_length=50)
    language: str = Field(default="es", max_length=5)


class SmartBacklogRequest(BaseModel):
    """Input for SmartBacklog — intelligent backlog prioritization."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    weights: dict[str, float] | None = Field(
        default=None,
        description=(
            "Optional per-criterion weight overrides. Keys: criticality, "
            "health_score, sla_proximity, failure_frequency, cost_of_deferral, "
            "safety_impact. Missing keys fall back to defaults; all weights "
            "are normalized so they sum to 1."
        ),
    )


class EquipmentDoctorRequest(BaseModel):
    """Input for EquipmentDoctor — AI diagnostic from symptoms."""
    equipment_tag: str = Field(..., max_length=50, description="SAP equipment tag")
    symptom_description: str = Field(..., max_length=2000, description="Symptom reported by technician")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    include_wr_suggestion: bool = Field(default=True, description="Pre-fill WR draft if confidence > 85%")


class AutoScheduleRequest(BaseModel):
    """Input for AutoScheduler — one-click weekly program generation."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    week_number: int = Field(..., ge=1, le=53)
    year: int = Field(..., ge=2024, le=2030)
    include_preventive: bool = True
    respect_shutdowns: bool = True


class SafetyChecklistRequest(BaseModel):
    """Input for SafetyChecklist — AI-enhanced pre-execution checklist."""
    wo_id: str | None = Field(default=None, max_length=50, description="Work order ID (optional)")
    equipment_tag: str = Field(..., max_length=50, description="SAP equipment tag")
    task_type: str = Field(..., max_length=100, description="Task type (e.g. electrico, mecanico)")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class ExecutiveReportRequest(BaseModel):
    """Input for Executive Report generation."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    period: str = Field(default="monthly", description="Report period: weekly, monthly, quarterly")


class ShiftHandoverRequest(BaseModel):
    """Input for Shift Handover — end-of-shift report generation."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    shift_date: str | None = Field(default=None, description="ISO date (YYYY-MM-DD), defaults to today")
    shift_type: str = Field(default="MORNING", description="MORNING or NIGHT")


class RCMAdvisorRequest(BaseModel):
    """Input for RCM Advisor — maintenance strategy recommendation."""
    equipment_tag: str = Field(..., max_length=50, description="SAP equipment tag")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class KPIWatchdogRequest(BaseModel):
    """Input for KPI Watchdog — monitor KPIs and detect anomalies."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    thresholds: dict[str, float] | None = Field(
        default=None,
        description=(
            "Optional overrides per KPI. Accepted keys: mtbf_drop_pct, "
            "mttr_rise_pct, oee_floor_pct, availability_floor_pct, "
            "schedule_compliance_pct, pm_compliance_pct, reactive_ratio_pct. "
            "When omitted, defaults from the service apply."
        ),
    )


class ChronicFailureRequest(BaseModel):
    """Input for Chronic Failure Detector."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    lookback_months: int = Field(default=12, ge=1, le=60)


class MaterialReadinessRequest(BaseModel):
    """Input for Material Readiness check — single item or batch."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    backlog_id: str | None = Field(default=None, max_length=50, description="Single backlog item (omit for batch)")


class WORouterRequest(BaseModel):
    """Input for WO Router — route a Work Request into a draft Work Order."""
    work_request_id: str = Field(..., max_length=50, description="Work Request ID to route")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class BudgetSentinelRequest(BaseModel):
    """Input for Budget Sentinel — monitor spending vs. budget."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    year: int | None = Field(default=None, description="Year (defaults to current)")
    month: int | None = Field(default=None, ge=1, le=12, description="Month (defaults to current)")


class SAPSyncRequest(BaseModel):
    """Input for SAP Sync Guardian — check SAP integration health."""
    plant_id: str | None = Field(default=None, max_length=50, description="Plant ID (omit for all plants)")


class DefectTrackerRequest(BaseModel):
    """Input for Defect Elimination Tracker — RCA/CAPA lifecycle tracking."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class PostLearningRequest(BaseModel):
    """Input for Post-Maintenance Learning — analyze closed WO accuracy."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    lookback_days: int = Field(default=90, ge=7, le=365)


class PredictiveHealthRequest(BaseModel):
    """Input for Predictive Health Prophet — Weibull-based failure prediction."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class ShutdownOptimizerRequest(BaseModel):
    """Input for Shutdown Optimizer — optimize maintenance shutdown windows."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    shutdown_id: str | None = Field(default=None, max_length=50, description="Specific shutdown (omit for next upcoming)")


# ── Extended Gemma 4 Vision Use Cases ─────────────────────────────────────

class PPEDetectionRequest(BaseModel):
    """CU-EXT-1: PPE compliance detection from photo."""
    image_base64: str = Field(..., description="Base64 photo of technician")
    checklist_id: str | None = Field(None, max_length=50, description="Execution checklist ID for gate enforcement")
    equipment_tag: str | None = Field(None, max_length=50)
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    technician_id: str = Field(default="", max_length=50)
    provider: str = Field(default="auto", description="AI provider: claude | ollama | auto")


class SparePartIdRequest(BaseModel):
    """CU-EXT-2: Spare part identification from photo."""
    image_base64: str = Field(..., description="Base64 photo of damaged/worn part")
    additional_context: str = Field(default="", max_length=2000, description="Technician notes about the part")
    equipment_tag: str | None = Field(None, max_length=50)
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    provider: str = Field(default="auto")


class NameplateOCRRequest(BaseModel):
    """CU-EXT-3: Equipment nameplate OCR."""
    image_base64: str = Field(..., description="Base64 photo of equipment nameplate")
    equipment_tag: str | None = Field(None, max_length=50)
    node_id: str | None = Field(None, max_length=50)
    auto_update_hierarchy: bool = Field(default=False, description="Auto-update HierarchyNode metadata with plate data")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    provider: str = Field(default="auto")


class PIDDigitizeRequest(BaseModel):
    """CU-EXT-3b: P&ID diagram digitization."""
    image_base64: str = Field(..., description="Base64 photo/scan of P&ID diagram")
    provider: str = Field(default="auto")


class AudioFaultRequest(BaseModel):
    """CU-EXT-4: Audio-based equipment fault detection."""
    equipment_tag: str = Field(..., max_length=50, description="SAP equipment tag")
    audio_base64: str = Field(..., description="Base64 WAV/WebM audio recording")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    recording_duration_seconds: float = Field(default=0, ge=0, le=300)
    equipment_rpm: float | None = Field(default=None, description="Rotation speed for bearing analysis")
    provider: str = Field(default="auto", max_length=10)


class TrainingScenarioRequest(BaseModel):
    """CU-EXT-8: Training scenario generation from 3D models."""
    equipment_type: str = Field(..., max_length=100, description="Equipment type (e.g. centrifugal_pump)")
    scenario_type: str = Field(default="DISASSEMBLY", description="DISASSEMBLY|ASSEMBLY|INSPECTION|REPLACEMENT")
    instruction_id: str | None = Field(default=None, max_length=50, description="Existing WorkInstruction ID")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    provider: str = Field(default="auto", max_length=10)


class EdgeSyncRegisterRequest(BaseModel):
    """CU-EXT-9: Register a new edge AI device."""
    device_name: str = Field(..., max_length=200)
    plant_id: str = Field(..., max_length=50)
    hardware_type: str = Field(default="JETSON_ORIN", max_length=50)
    ollama_model: str = Field(default="gemma4", max_length=50)


class EdgeSyncPushRequest(BaseModel):
    """CU-EXT-9: Push sync data from edge device."""
    device_id: str = Field(..., max_length=50)
    items: list[dict] = Field(default_factory=list, description="Sync items [{entity_type, entity_id, data}]")


class DroneInspectionRequest(BaseModel):
    """CU-EXT-6: Drone aerial inspection with batch image processing."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    mission_name: str = Field(..., max_length=200)
    flight_date: str = Field(..., description="ISO date (YYYY-MM-DD)")
    images_base64: list[str] = Field(..., description="List of base64 drone images", max_length=200)
    gps_metadata: list[dict] | None = Field(default=None, description="Per-image GPS data [{lat, lon, altitude_m}]")
    auto_generate_wr: bool = Field(default=True, description="Auto-create Work Requests for severe findings")
    severity_threshold: str = Field(default="HIGH", description="Min severity for WR generation")
    provider: str = Field(default="auto", max_length=10)


class LOTOVerificationRequest(BaseModel):
    """CU-EXT-5: LOTO visual verification (safety-critical, fail-closed)."""
    image_base64: str = Field(..., description="Base64 photo showing LOTO state")
    checklist_id: str = Field(..., max_length=50, description="Execution checklist ID (gate enforcement)")
    equipment_tag: str | None = Field(None, max_length=50)
    expected_lock_count: int | None = Field(None, ge=1, le=20, description="Expected number of locks")
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    technician_id: str = Field(default="", max_length=50)
    provider: str = Field(default="auto")


# ── All 26+5 solution identifiers by tier ─────────────────────────────────

T1_SOLUTIONS = [
    "voice-capture",
    "auto-schedule",
    "equipment-doctor",
    "smart-backlog",
    "safety-checklist",
    "kpi-watchdog",
    "executive-report",
]

T2_SOLUTIONS = [
    "chronic-failures",
    "material-readiness",
    "rcm-advisor",
    "shift-handover",
    "sap-sync",
    "budget-sentinel",
    "post-learning",
    "wo-router",
    "defect-tracker",
]

T3_SOLUTIONS = [
    "predictive-health",
    "shutdown-optimizer",
    "compliance-watchdog",
    "digital-twin",
    "knowledge-curator",
    "spare-parts-forecast",
    "contractor-performance",
    "energy-monitor",
    "multi-site-benchmark",
    "auto-rca",
]

# Extended Gemma 4 vision use cases
VISION_EXT_SOLUTIONS = [
    "ppe-detection",
    "spare-part-id",
    "nameplate-ocr",
    "pid-digitize",
    "loto-verification",
    "audio-fault-detection",
    "drone-inspection",
    "training-scenario",
    "edge-sync",
]

ALL_SOLUTIONS = T1_SOLUTIONS + T2_SOLUTIONS + T3_SOLUTIONS + VISION_EXT_SOLUTIONS


# ── Health-check ─────────────────────────────────────────────────────────

@router.get("/agentic/status")
def agentic_status():
    """Return module status and the full catalogue of solutions."""
    return {
        "module": "agentic-solutions",
        "status": "operational",
        "version": "1.0.0",
        "solutions": ALL_SOLUTIONS,
    }


# =========================================================================
# T1 — Quick-Win Solutions
# =========================================================================

# ── VoiceCapture Pro ─────────────────────────────────────────────────────

@router.post("/agentic/voice-capture")
def voice_capture(
    data: VoiceCaptureRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """VoiceCapture Pro — process voice/photo/text into a fully classified Work Request."""
    from api.services.agentic_voice_capture_service import process_voice_capture
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return process_voice_capture(
            db=db,
            text_input=data.text_input,
            audio_base64=data.audio_base64,
            image_base64=data.image_base64,
            equipment_tag_hint=data.equipment_tag_hint,
            plant_id=data.plant_id,
            technician_id=data.technician_id,
            language=data.language,
        )

    return execute_solution(
        db=db,
        solution_type="VOICE_CAPTURE",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── AutoScheduler ────────────────────────────────────────────────────────

@router.post("/agentic/auto-schedule")
def auto_schedule(
    data: AutoScheduleRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """AutoScheduler — generate weekly program with Gantt, materials, HH balance, and AI conflict resolution."""
    from api.services.agentic_scheduler_service import run_auto_schedule
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return run_auto_schedule(
            db=db,
            plant_id=data.plant_id,
            week_number=data.week_number,
            year=data.year,
            include_preventive=data.include_preventive,
            respect_shutdowns=data.respect_shutdowns,
        )

    return execute_solution(
        db=db,
        solution_type="AUTO_SCHEDULER",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── EquipmentDoctor ──────────────────────────────────────────────────────

@router.post("/agentic/equipment-doctor")
def equipment_doctor(
    data: EquipmentDoctorRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """EquipmentDoctor — AI diagnosis from equipment symptoms."""
    from api.services.agentic_doctor_service import diagnose_equipment
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return diagnose_equipment(
            db=db,
            equipment_tag=data.equipment_tag,
            symptom_description=data.symptom_description,
            plant_id=data.plant_id,
            include_wr_suggestion=data.include_wr_suggestion,
        )

    return execute_solution(
        db=db,
        solution_type="EQUIPMENT_DOCTOR",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── SmartBacklog ─────────────────────────────────────────────────────────

@router.post("/agentic/smart-backlog")
def smart_backlog(
    data: SmartBacklogRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SmartBacklog — multi-criteria intelligent backlog prioritization."""
    from api.services.agentic_smart_backlog_service import prioritize_backlog
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return prioritize_backlog(db=db, plant_id=data.plant_id, weights=data.weights)

    return execute_solution(
        db=db,
        solution_type="SMART_BACKLOG",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

@router.get("/agentic/smart-backlog/alerts")
def smart_backlog_alerts(
    plant_id: str = "OCP-JFC1",
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SmartBacklog alerts — items at SLA breach risk or on chronic equipment.

    Runs the scorer and returns only the alert-triggering subset, sorted by
    score descending. Lightweight view for SLA risk dashboards.
    """
    from api.services.agentic_smart_backlog_service import prioritize_backlog

    result = prioritize_backlog(db=db, plant_id=plant_id)
    alerted = [r for r in result.get("ranked_items", []) if r.get("alerts")]
    return {
        "plant_id": plant_id,
        "total_alerts": len(alerted),
        "items": alerted,
    }


@router.post("/agentic/safety-checklist")
def safety_checklist(
    data: SafetyChecklistRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SafetyChecklist — AI-enhanced pre-execution safety checklist."""
    from api.services.agentic_safety_checklist_service import generate_safety_checklist
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return generate_safety_checklist(
            db=db,
            equipment_tag=data.equipment_tag,
            task_type=data.task_type,
            plant_id=data.plant_id,
            wo_id=data.wo_id,
        )

    return execute_solution(
        db=db,
        solution_type="SAFETY_CHECKLIST",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── KPI Watchdog ─────────────────────────────────────────────────────────

@router.post("/agentic/kpi-watchdog")
def kpi_watchdog(
    data: KPIWatchdogRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """KPI Watchdog — detect KPI anomalies and generate alerts with AI causal analysis."""
    from api.services.agentic_kpi_watchdog_service import run_watchdog
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        kwargs = {"db": db, "plant_id": data.plant_id}
        if data.thresholds:
            kwargs["thresholds"] = data.thresholds
        try:
            return run_watchdog(**kwargs)
        except TypeError:
            # Service may not yet accept thresholds kwarg — fall back.
            return run_watchdog(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="KPI_WATCHDOG",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

@router.get("/agentic/kpi-watchdog/alerts")
def kpi_watchdog_alerts(
    plant_id: str | None = None,
    unacknowledged_only: bool = True,
    limit: int = 50,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Active KPI Watchdog alerts — sourced from NotificationModel.

    The watchdog persists each deviation as an in-app notification of type
    ``KPI_WATCHDOG``. This endpoint returns the live feed so dashboards can
    render a timeline without re-running the evaluation.
    """
    from api.database.models import NotificationModel

    q = db.query(NotificationModel).filter(
        NotificationModel.notification_type == "KPI_WATCHDOG"
    )
    if plant_id:
        q = q.filter(NotificationModel.plant_id == plant_id)
    if unacknowledged_only:
        q = q.filter(NotificationModel.acknowledged.is_(False))
    rows = q.order_by(NotificationModel.created_at.desc()).limit(max(1, min(200, limit))).all()

    return {
        "plant_id": plant_id,
        "total": len(rows),
        "alerts": [
            {
                "id": getattr(r, "notification_id", None) or getattr(r, "id", None),
                "title": r.title,
                "message": r.message,
                "level": r.level,
                "equipment_id": r.equipment_id,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "acknowledged": bool(r.acknowledged),
            }
            for r in rows
        ],
    }


# ── Executive Report ─────────────────────────────────────────────────────

@router.post("/agentic/executive-report")
def executive_report(
    data: ExecutiveReportRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Executive Report — generate comprehensive maintenance report with KPIs, backlog, budget."""
    from api.services.agentic_executive_report_service import generate_executive_report
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return generate_executive_report(
            db=db,
            plant_id=data.plant_id,
            period=data.period,
        )

    return execute_solution(
        db=db,
        solution_type="EXECUTIVE_REPORT",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


@router.post("/agentic/executive-report/pptx")
def executive_report_pptx(
    data: ExecutiveReportRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Executive Report — generate and download as PPTX file."""
    from api.services.agentic_executive_report_service import generate_executive_report
    from api.services.pptx_generator_service import generate_pptx_response

    report_data = generate_executive_report(
        db=db,
        plant_id=data.plant_id,
        period=data.period,
    )
    return generate_pptx_response(report_data)


# =========================================================================
# T2 — Mid-Term Solutions
# =========================================================================

# ── Chronic Failures ─────────────────────────────────────────────────────

@router.post("/agentic/chronic-failures")
def chronic_failures(
    data: ChronicFailureRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Chronic Failure Detector — identify recurring failure patterns."""
    from api.services.agentic_chronic_failure_service import detect_chronic_failures
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return detect_chronic_failures(
            db=db,
            plant_id=data.plant_id,
            lookback_months=data.lookback_months,
        )

    return execute_solution(
        db=db,
        solution_type="CHRONIC_FAILURE",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

@router.get("/agentic/chronic-failures/active")
def chronic_failures_active(
    plant_id: str = "OCP-JFC1",
    lookback_months: int = 12,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Active chronic failures — thin wrapper that runs the detector and
    returns the current active list. Keeps dashboards from having to POST."""
    from api.services.agentic_chronic_failure_service import detect_chronic_failures
    result = detect_chronic_failures(db=db, plant_id=plant_id, lookback_months=lookback_months)
    active = result.get("chronic_failures") or result.get("findings") or []
    return {
        "plant_id": plant_id,
        "total": len(active),
        "lookback_months": lookback_months,
        "items": active,
    }


# ── Material Readiness ───────────────────────────────────────────────────

@router.post("/agentic/material-readiness")
def material_readiness(
    data: MaterialReadinessRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Material Readiness — check material availability for backlog items."""
    from api.services.agentic_material_service import check_item_materials, check_batch_materials
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        if data.backlog_id:
            return check_item_materials(db=db, backlog_id=data.backlog_id, plant_id=data.plant_id)
        return check_batch_materials(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="MATERIAL_READINESS",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

@router.get("/agentic/material-readiness/report/{program_id}")
def material_readiness_report(
    program_id: str,
    plant_id: str = "OCP-JFC1",
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Material readiness report for a weekly program.

    Iterates the program's backlog items, checks materials per item and
    returns a consolidated readiness summary for the scheduling UI.
    """
    from api.services.agentic_material_service import check_batch_materials
    from api.services import scheduling_service
    try:
        prog = scheduling_service.get_program(db, program_id)
    except Exception:
        prog = None
    batch = check_batch_materials(db=db, plant_id=plant_id) or {}
    return {
        "program_id": program_id,
        "plant_id": plant_id,
        "program_found": bool(prog),
        **batch,
    }


# ── RCM Advisor ──────────────────────────────────────────────────────────

@router.post("/agentic/rcm-advisor")
def rcm_advisor(
    data: RCMAdvisorRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """RCM Advisor — analyze failure modes and recommend maintenance strategies."""
    from api.services.agentic_rcm_advisor_service import advise_rcm_strategy
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return advise_rcm_strategy(
            db=db,
            equipment_tag=data.equipment_tag,
            plant_id=data.plant_id,
        )

    return execute_solution(
        db=db,
        solution_type="RCM_ADVISOR",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── Shift Handover ───────────────────────────────────────────────────────

@router.post("/agentic/shift-handover")
def shift_handover(
    data: ShiftHandoverRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Shift Handover — generate end-of-shift handover report."""
    from api.services.agentic_handover_service import generate_handover
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return generate_handover(
            db=db,
            plant_id=data.plant_id,
            shift_date=data.shift_date,
            shift_type=data.shift_type,
        )

    return execute_solution(
        db=db,
        solution_type="SHIFT_HANDOVER",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── SAP Sync ─────────────────────────────────────────────────────────────

@router.post("/agentic/sap-sync")
def sap_sync(
    data: SAPSyncRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SAP Sync Guardian — check SAP integration health and queue status."""
    from api.services.agentic_sap_sync_service import check_sync_health
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return check_sync_health(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="SAP_SYNC",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id or "ALL",
        input_params=data.model_dump(),
        fn=_run,
    )

# ── Budget Sentinel ──────────────────────────────────────────────────────

@router.post("/agentic/budget-sentinel")
def budget_sentinel(
    data: BudgetSentinelRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Budget Sentinel — monitor maintenance spending vs. budget with projections."""
    from api.services.agentic_budget_sentinel_service import monitor_budget
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return monitor_budget(db=db, plant_id=data.plant_id, year=data.year, month=data.month)

    return execute_solution(
        db=db,
        solution_type="BUDGET_SENTINEL",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── Post-Learning ────────────────────────────────────────────────────────

@router.post("/agentic/post-learning")
def post_learning(
    data: PostLearningRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Post-Maintenance Learning — analyze closed WO accuracy and generate insights."""
    from api.services.agentic_learning_service import analyze_post_maintenance
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return analyze_post_maintenance(db=db, plant_id=data.plant_id, lookback_days=data.lookback_days)

    return execute_solution(
        db=db,
        solution_type="POST_LEARNING",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── WO Router ────────────────────────────────────────────────────────────

@router.post("/agentic/route-wr")
def route_wr(
    data: WORouterRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """WO Router — route a Work Request into a fully pre-filled draft Work Order."""
    from api.services.agentic_wo_router_service import route_work_request
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return route_work_request(
            db=db,
            work_request_id=data.work_request_id,
            plant_id=data.plant_id,
        )

    return execute_solution(
        db=db,
        solution_type="WO_ROUTER",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── Defect Tracker ───────────────────────────────────────────────────────

@router.post("/agentic/defect-tracker")
def defect_tracker(
    data: DefectTrackerRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Defect Elimination Tracker — track RCA/CAPA lifecycle and DE KPIs."""
    from api.services.agentic_defect_elimination_service import track_defect_elimination
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return track_defect_elimination(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="DEFECT_TRACKER",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# =========================================================================
# T3 — Advanced Solutions
# =========================================================================

# ── Predictive Health ────────────────────────────────────────────────────

@router.post("/agentic/predictive-health")
def predictive_health(
    data: PredictiveHealthRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Predictive Health Prophet — Weibull-based failure prediction for critical equipment."""
    from api.services.agentic_predictive_health_service import run_predictive_health
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return run_predictive_health(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="PREDICTIVE_HEALTH",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

# ── Shutdown Optimizer ───────────────────────────────────────────────────

@router.post("/agentic/shutdown-optimizer")
def shutdown_optimizer(
    data: ShutdownOptimizerRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Shutdown Optimizer — optimize maintenance shutdown windows with resource leveling."""
    from api.services.agentic_shutdown_optimizer_service import optimize_shutdown
    from api.services.agentic_base_service import execute_solution

    def _run(db, execution_id, input_params):
        return optimize_shutdown(
            db=db,
            plant_id=data.plant_id,
            shutdown_id=data.shutdown_id,
        )

    return execute_solution(
        db=db,
        solution_type="SHUTDOWN_OPTIMIZER",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

class PlantIdOnlyRequest(BaseModel):
    """Shared schema for agents that only need a plant_id."""
    plant_id: str = Field(default="OCP-JFC1", max_length=50)


class DuplicateCheckRequest(BaseModel):
    """SF-213 — duplicate WR detection before creating a new one."""
    description: str = Field(..., max_length=4000)
    equipment_tag: str | None = Field(default=None, max_length=50)
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    priority: str | None = Field(default=None, max_length=4)  # P1/P2/P3/P4 — severity filter
    lookback_days: int = Field(default=14, ge=1, le=60)
    threshold: float = Field(default=0.55, ge=0.1, le=0.99)


@router.post("/agentic/duplicate-check")
def duplicate_check(
    data: DuplicateCheckRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SF-213 — look for likely duplicate WRs before creation. Excluye estados terminales,
    aplica time-decay exponencial (7d) y filtro de severidad ±2 niveles."""
    from api.services.agentic_duplicate_check_service import check_duplicates
    return check_duplicates(
        db=db,
        description=data.description,
        equipment_tag=data.equipment_tag,
        plant_id=data.plant_id,
        priority=data.priority,
        lookback_days=data.lookback_days,
        threshold=data.threshold,
    )


# ── WR Router auto-fill passthrough (SF-212) ─────────────────────────────

@router.post("/agentic/planner-autofill")
def planner_autofill(
    data: WORouterRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """SF-212 — planner clicks 'IA' to auto-fill operations + materials from
    similar historical OTs. Thin wrapper over route_work_request() that
    returns suggested resources/materials/duration for the WR."""
    from api.services.agentic_wo_router_service import route_work_request
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return route_work_request(
            db=_db,
            work_request_id=data.work_request_id,
            plant_id=data.plant_id,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="PLANNER_AUTOFILL", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Compliance Watchdog (SF-363) ─────────────────────────────────────────

@router.post("/agentic/compliance-watchdog")
def compliance_watchdog(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Compliance Watchdog — RBI inspections, KPI gates, regulatory gaps."""
    from api.services.agentic_compliance_service import check_compliance
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return check_compliance(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="COMPLIANCE_WATCHDOG", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Digital Twin (SF-364) ─────────────────────────────────────────────────

@router.post("/agentic/digital-twin")
def digital_twin(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Digital Twin — plant-wide health snapshot for the twin dashboard."""
    from api.services.agentic_digital_twin_service import get_plant_digital_twin
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return get_plant_digital_twin(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="DIGITAL_TWIN", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Knowledge Curator (SF-365) ───────────────────────────────────────────

@router.post("/agentic/knowledge-curator")
def knowledge_curator(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Knowledge Curator — extracts tribal knowledge from closed OTs/RCAs."""
    from api.services.agentic_knowledge_service import curate_knowledge
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return curate_knowledge(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="KNOWLEDGE_CURATOR", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Spare Parts Forecast (SF-366) ────────────────────────────────────────

@router.post("/agentic/spare-parts-forecast")
def spare_parts_forecast(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Spare Parts Forecast — demand forecasting from consumption history."""
    from api.services.agentic_spare_parts_forecast_service import forecast_spare_parts
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return forecast_spare_parts(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="SPARE_PARTS_FORECAST", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Contractor Performance (SF-367) ──────────────────────────────────────

@router.post("/agentic/contractor-performance")
def contractor_performance(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Contractor Performance — adherence, quality, utilization by contractor."""
    from api.services.agentic_contractor_benchmark_service import analyze_contractor_performance
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return analyze_contractor_performance(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="CONTRACTOR_PERFORMANCE", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Energy Monitor (SF-368) ──────────────────────────────────────────────

@router.post("/agentic/energy-monitor")
def energy_monitor(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Energy Monitor — flags energy-related degradation via digital twin data.
    Uses the twin's energy-tag health subset as the efficiency indicator."""
    from api.services.agentic_digital_twin_service import get_plant_digital_twin
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        twin = get_plant_digital_twin(db=_db, plant_id=data.plant_id)
        energy_view = {
            "plant_id": data.plant_id,
            "energy_assets": twin.get("energy_assets") or twin.get("by_category", {}).get("energy"),
            "alerts": [a for a in (twin.get("alerts") or []) if "energy" in str(a).lower()],
            "summary": twin.get("summary"),
        }
        return energy_view

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="ENERGY_MONITOR", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Multi-Site Benchmark (SF-369) ────────────────────────────────────────

@router.post("/agentic/multi-site-benchmark")
def multi_site_benchmark(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Multi-Site Benchmark — compares plant KPIs across all plants."""
    from api.services.agentic_contractor_benchmark_service import benchmark_plants
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return benchmark_plants(db=_db)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="MULTI_SITE_BENCHMARK", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ── Auto-RCA (SF-370) ────────────────────────────────────────────────────

@router.post("/agentic/auto-rca")
def auto_rca(
    data: PlantIdOnlyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Auto-RCA — scans closed WOs matching RCA criteria and initiates records."""
    from api.services.agentic_rca_initiator_service import scan_closed_wo_for_rca
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _p):
        return scan_closed_wo_for_rca(db=_db, plant_id=data.plant_id)

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db, solution_type="AUTO_RCA", triggered_by=uid,
        plant_id=data.plant_id, input_params=data.model_dump(), fn=_run,
    )


# ═══════════════════════════════════════════════════════════════════════════
# GEMMA 4 / OLLAMA — Local AI Endpoints
# ═══════════════════════════════════════════════════════════════════════════


class VisualTroubleshootingRequest(BaseModel):
    """Input for Visual Troubleshooting — image-based equipment diagnosis."""
    image_base64: str = Field(..., description="Base64 equipment photo")
    equipment_tag: str | None = Field(None, max_length=50)
    plant_id: str = Field(default="OCP-JFC1", max_length=50)
    provider: str = Field(default="auto", description="AI provider: claude | ollama | auto")


class WOVisualVerifyRequest(BaseModel):
    """Input for WO Visual Verification — before/after photo comparison."""
    before_image_b64: str = Field(..., description="Base64 photo BEFORE maintenance")
    after_image_b64: str = Field(..., description="Base64 photo AFTER maintenance")
    work_order_id: str | None = Field(None, max_length=50)
    work_description: str = Field(default="", max_length=2000)
    checklist_items: list[str] = Field(default_factory=list)
    provider: str = Field(default="auto")


class ThreeDComparisonRequest(BaseModel):
    """Input for 3D Comparison — reference render vs field photo."""
    equipment_type: str = Field(..., max_length=100, description="Equipment type (e.g. centrifugal_pump)")
    field_photo_b64: str = Field(..., description="Base64 field photograph")
    angle: str = Field(default="front", description="Reference angle: front | side | top | isometric")
    provider: str = Field(default="auto")


# ── Visual Troubleshooting ────────────────────────────────────────────────

@router.post("/visual-troubleshooting")
def visual_troubleshooting(
    data: VisualTroubleshootingRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """AI-powered visual troubleshooting from equipment photo.

    Analyzes the image to identify component, failure mode, severity,
    and suggests corrective actions. Works with Claude (cloud) or
    Gemma 4 via Ollama (local/offline).
    """
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        from api.services.vision_service import analyze_image
        return analyze_image(
            image_base64=data.image_base64,
            equipment_tag=data.equipment_tag or "",
            db=_db,
            provider=data.provider,
        )

    return execute_solution(
        db=db,
        solution_type="VISUAL_TROUBLESHOOTING",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params={"equipment_tag": data.equipment_tag, "provider": data.provider},
        fn=_run,
    )


# ── WO Visual Verification ───────────────────────────────────────────────

@router.post("/wo-visual-verify")
def wo_visual_verify(
    data: WOVisualVerifyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Verify work order completion by comparing before/after photos.

    Uses AI vision to check if maintenance was performed correctly,
    component installed properly, area cleaned, etc.
    """
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        from api.services.visual_comparison_service import verify_work_order_completion
        return verify_work_order_completion(
            before_image_b64=data.before_image_b64,
            after_image_b64=data.after_image_b64,
            work_order_description=data.work_description,
            checklist_items=data.checklist_items or None,
            provider=data.provider,
        )

    return execute_solution(
        db=db,
        solution_type="WO_VISUAL_VERIFY",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id="",
        input_params={"work_order_id": data.work_order_id, "provider": data.provider},
        fn=_run,
    )


# ── 3D Reference Comparison ──────────────────────────────────────────────

@router.post("/3d-comparison")
def three_d_comparison(
    data: ThreeDComparisonRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Compare a 3D reference render with a field photo.

    Loads the reference render for the equipment type and angle,
    then compares against the field photo to identify deviations.
    """
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        from api.services.blender_render_service import get_blender_render_service
        from api.services.visual_comparison_service import compare_reference_vs_field

        render_svc = get_blender_render_service()
        cached = render_svc.get_cached_renders(data.equipment_type)

        if data.angle not in cached:
            return {
                "error": f"No reference render found for {data.equipment_type}/{data.angle}. "
                         "Generate renders first via Blender MCP tools.",
                "available_angles": list(cached.keys()),
            }

        return compare_reference_vs_field(
            reference_image_b64=cached[data.angle],
            field_photo_b64=data.field_photo_b64,
            equipment_type=data.equipment_type,
            provider=data.provider,
        )

    return execute_solution(
        db=db,
        solution_type="3D_COMPARISON",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id="",
        input_params={"equipment_type": data.equipment_type, "angle": data.angle, "provider": data.provider},
        fn=_run,
    )


# =========================================================================
# Extended Gemma 4 Use Cases (CU-EXT-1, 2, 3, 4, 5, 6)
# =========================================================================

# ── PPE Detection (CU-EXT-1) ─────────────────────────────────────────────

@router.post("/ppe-detection")
def ppe_detection(
    data: PPEDetectionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-1: Detect PPE compliance from a photo.

    Checks for helmet, vest, gloves, glasses, boots, and ear protection.
    Optionally enforces as a safety gate on an execution checklist.
    """
    from api.services.agentic_ppe_detection_service import detect_ppe
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return detect_ppe(
            db=_db,
            image_base64=data.image_base64,
            checklist_id=data.checklist_id,
            equipment_tag=data.equipment_tag or "",
            plant_id=data.plant_id,
            technician_id=data.technician_id,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="PPE_DETECTION",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# ── Spare Part Identification (CU-EXT-2) ─────────────────────────────────

@router.post("/spare-part-id")
def spare_part_identification(
    data: SparePartIdRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-2: Identify a spare part from a photo and find SAP matches."""
    from api.services.agentic_spare_parts_id_service import identify_spare_part
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return identify_spare_part(
            db=_db,
            image_base64=data.image_base64,
            additional_context=data.additional_context,
            equipment_tag=data.equipment_tag or "",
            plant_id=data.plant_id,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="SPARE_PART_ID",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# ── Nameplate OCR (CU-EXT-3) ─────────────────────────────────────────────

@router.post("/nameplate-ocr")
def nameplate_ocr(
    data: NameplateOCRRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-3: Read equipment nameplate from photo. Optionally auto-update hierarchy."""
    from api.services.agentic_nameplate_ocr_service import ocr_nameplate
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return ocr_nameplate(
            db=_db,
            image_base64=data.image_base64,
            equipment_tag=data.equipment_tag,
            node_id=data.node_id,
            auto_update_hierarchy=data.auto_update_hierarchy,
            plant_id=data.plant_id,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="NAMEPLATE_OCR",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# ── P&ID Digitization (CU-EXT-3b) ───────────────────────────────────────

@router.post("/pid-digitize")
def pid_digitize(
    data: PIDDigitizeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-3b: Digitize a P&ID diagram from photo or scan."""
    from api.services.agentic_nameplate_ocr_service import ocr_pid_diagram
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return ocr_pid_diagram(
            image_base64=data.image_base64,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="PID_DIGITIZE",
        triggered_by=uid,
        plant_id="",
        input_params=data.model_dump(),
        fn=_run,
    )


# ── LOTO Verification (CU-EXT-5) ────────────────────────────────────────

@router.post("/loto-verification")
def loto_verification(
    data: LOTOVerificationRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-5: Verify LOTO compliance from a photo. FAIL-CLOSED design.

    If the AI provider is unavailable, the gate does NOT pass.
    """
    from api.services.agentic_loto_vision_service import verify_loto_by_vision
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return verify_loto_by_vision(
            db=_db,
            image_base64=data.image_base64,
            checklist_id=data.checklist_id,
            equipment_tag=data.equipment_tag or "",
            expected_lock_count=data.expected_lock_count,
            plant_id=data.plant_id,
            technician_id=data.technician_id,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="LOTO_VERIFICATION",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# ── Audio Fault Detection (CU-EXT-4) ─────────────────────────────────

@router.post("/audio-fault-detection")
def audio_fault_detection(
    data: AudioFaultRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-4: Analyze equipment audio for fault patterns.

    Uses spectral analysis + Gemma 4 to detect bearing defects,
    cavitation, rubbing, and abnormal vibration.
    """
    from api.services.agentic_audio_fault_service import analyze_audio_fault
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return analyze_audio_fault(
            db=_db,
            equipment_tag=data.equipment_tag,
            audio_base64=data.audio_base64,
            plant_id=data.plant_id,
            recording_duration_seconds=data.recording_duration_seconds,
            equipment_rpm=data.equipment_rpm,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="AUDIO_FAULT_DETECTION",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params={"equipment_tag": data.equipment_tag, "provider": data.provider},
        fn=_run,
    )


# ── Drone Inspection (CU-EXT-6) ─────────────────────────────────────

@router.post("/drone-inspection")
def drone_inspection(
    data: DroneInspectionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-6: Process batch drone images for structural defect detection.

    Georeferencing, corrosion/crack detection, and auto-WR generation.
    """
    from api.services.agentic_drone_inspection_service import create_drone_inspection
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return create_drone_inspection(
            db=_db,
            plant_id=data.plant_id,
            mission_name=data.mission_name,
            flight_date=data.flight_date,
            images_base64=data.images_base64,
            gps_metadata=data.gps_metadata,
            auto_generate_wr=data.auto_generate_wr,
            severity_threshold=data.severity_threshold,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="DRONE_INSPECTION",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params={"mission_name": data.mission_name, "total_images": len(data.images_base64)},
        fn=_run,
    )


# ── Training Scenario (CU-EXT-8) ─────────────────────────────────────

@router.post("/training-scenario")
def training_scenario(
    data: TrainingScenarioRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-8: Generate a 3D training scenario for technicians."""
    from api.services.agentic_training_scenario_service import generate_training_scenario
    from api.services.agentic_base_service import execute_solution

    def _run(_db, _eid, _params):
        return generate_training_scenario(
            db=_db,
            equipment_type=data.equipment_type,
            scenario_type=data.scenario_type,
            instruction_id=data.instruction_id,
            plant_id=data.plant_id,
            provider=data.provider,
        )

    uid = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")
    return execute_solution(
        db=db,
        solution_type="TRAINING_SCENARIO",
        triggered_by=uid,
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )


# ── Edge AI Sync (CU-EXT-9) ─────────────────────────────────────────

@router.post("/edge-sync/register")
def edge_sync_register(
    data: EdgeSyncRegisterRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-9: Register a new edge AI device."""
    from api.services.agentic_edge_sync_service import register_edge_device
    return register_edge_device(
        db=db,
        device_name=data.device_name,
        plant_id=data.plant_id,
        hardware_type=data.hardware_type,
        ollama_model=data.ollama_model,
    )


@router.post("/edge-sync/push")
def edge_sync_push(
    data: EdgeSyncPushRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-9: Receive sync data pushed from an edge device."""
    from api.services.agentic_edge_sync_service import process_edge_sync_push
    return process_edge_sync_push(db=db, device_id=data.device_id, items=data.items)


@router.get("/edge-sync/status/{device_id}")
def edge_sync_status(
    device_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-9: Get edge device sync status."""
    from api.services.agentic_edge_sync_service import get_edge_device_status
    return get_edge_device_status(db=db, device_id=device_id)


@router.get("/edge-devices")
def list_edge_devices_endpoint(
    plant_id: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """CU-EXT-9: List all registered edge devices."""
    from api.services.agentic_edge_sync_service import list_edge_devices
    return list_edge_devices(db=db, plant_id=plant_id)


# ── Ollama Health & Models ────────────────────────────────────────────────

@router.get("/ollama/health")
def ollama_health(user=Depends(get_current_user)):
    """Check if local Ollama instance is running and responsive."""
    from api.services.ollama_service import get_ollama_client
    from api.config import settings

    client = get_ollama_client()
    available = client.health_check()
    models = client.list_models() if available else []

    return {
        "ollama_available": available,
        "base_url": settings.OLLAMA_BASE_URL,
        "configured_model": settings.OLLAMA_MODEL,
        "models_count": len(models),
        "models": [
            {
                "name": m.get("name", ""),
                "size": m.get("size", 0),
                "modified_at": m.get("modified_at", ""),
            }
            for m in models
        ],
    }


@router.get("/ollama/models")
def ollama_models(user=Depends(get_current_user)):
    """List all models installed in the local Ollama instance."""
    from api.services.ollama_service import get_ollama_client

    client = get_ollama_client()
    if not client.health_check():
        raise HTTPException(status_code=503, detail="Ollama is not running on localhost:11434")

    models = client.list_models()
    return {
        "models": models,
        "count": len(models),
    }
