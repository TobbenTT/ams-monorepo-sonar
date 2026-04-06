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

# ── All 26 solution identifiers by tier ──────────────────────────────────

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

ALL_SOLUTIONS = T1_SOLUTIONS + T2_SOLUTIONS + T3_SOLUTIONS


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
        return prioritize_backlog(db=db, plant_id=data.plant_id)

    return execute_solution(
        db=db,
        solution_type="SMART_BACKLOG",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

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
        return run_watchdog(
            db=db,
            plant_id=data.plant_id,
        )

    return execute_solution(
        db=db,
        solution_type="KPI_WATCHDOG",
        triggered_by=user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown"),
        plant_id=data.plant_id,
        input_params=data.model_dump(),
        fn=_run,
    )

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

# ── Compliance Watchdog ──────────────────────────────────────────────────

# ── Digital Twin ─────────────────────────────────────────────────────────

# ── Knowledge Curator ────────────────────────────────────────────────────

# ── Spare Parts Forecast ─────────────────────────────────────────────────

# ── Contractor Performance ───────────────────────────────────────────────

# ── Energy Monitor ───────────────────────────────────────────────────────

# ── Multi-Site Benchmark ─────────────────────────────────────────────────

# ── Auto-RCA ─────────────────────────────────────────────────────────────


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
    def _run():
        from api.services.vision_service import analyze_image
        return analyze_image(
            image_base64=data.image_base64,
            equipment_tag=data.equipment_tag or "",
            db=db,
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
    def _run():
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
    def _run():
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
