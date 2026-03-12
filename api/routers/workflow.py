"""FastAPI router — Agent Workflow (G-17).

Exposes the 4-milestone multi-agent workflow via REST API so the Streamlit
UI (and any other client) can launch and manage sessions without using the CLI.

Endpoints:
  POST /workflow/run            — Start a new session (background task)
  GET  /workflow/{session_id}   — Poll session status + entity counts
  POST /workflow/{session_id}/approve — Submit gate decision (approve/modify/reject)
  GET  /workflow/sessions       — List all active/completed sessions
"""

from __future__ import annotations

import asyncio
import logging
import threading
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workflow", tags=["Workflow"])


# ---------------------------------------------------------------------------
# In-memory session registry (prototype — use DB in production)
# ---------------------------------------------------------------------------

class _SessionRecord:
    """Holds state for one running workflow session."""

    def __init__(self, session_id: str, equipment: str, plant_code: str):
        self.session_id = session_id
        self.equipment = equipment
        self.plant_code = plant_code
        self.status: str = "STARTING"   # STARTING | RUNNING | AWAITING_APPROVAL | COMPLETED | FAILED | REJECTED
        self.current_milestone: int = 0
        self.gate_summary: str = ""
        self.entity_counts: dict[str, Any] = {}
        self.error: str = ""
        self.sap_xlsx_path: str = ""
        self.started_at: str = datetime.utcnow().isoformat()
        self.completed_at: str = ""

        # Gate approval synchronization
        self._gate_event = threading.Event()
        self._gate_action: str = ""
        self._gate_feedback: str = ""


# session_id → _SessionRecord
_SESSIONS: dict[str, _SessionRecord] = {}


# ---------------------------------------------------------------------------
# Pydantic I/O models
# ---------------------------------------------------------------------------

class WorkflowRunRequest(BaseModel):
    equipment: str = Field(..., description="Equipment description, e.g. 'SAG Mill 001'")
    plant_code: str = Field(default="OCP", description="SAP plant code")


class WorkflowRunResponse(BaseModel):
    session_id: str
    status: str
    message: str


class WorkflowStatusResponse(BaseModel):
    session_id: str
    equipment: str
    plant_code: str
    status: str
    current_milestone: int
    gate_summary: str
    entity_counts: dict[str, Any]
    error: str
    sap_xlsx_path: str
    started_at: str
    completed_at: str


class GateApprovalRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|modify|reject)$")
    feedback: str = Field(default="")


class GateApprovalResponse(BaseModel):
    session_id: str
    action: str
    milestone: int
    message: str


# ---------------------------------------------------------------------------
# Workflow background runner
# ---------------------------------------------------------------------------

def _run_workflow_thread(record: _SessionRecord) -> None:
    """Run the full workflow in a background thread.

    The human approval gates are replaced by threading.Event synchronization:
    the API endpoint /approve sets the event, and this thread waits for it.
    """
    try:
        from agents.orchestration.workflow import StrategyWorkflow

        def api_approval_fn(milestone_number: int, summary: str) -> tuple[str, str]:
            """Called by workflow at each gate — blocks until /approve is POSTed."""
            record.current_milestone = milestone_number
            record.gate_summary = summary
            record.status = "AWAITING_APPROVAL"
            logger.info("Workflow session %s waiting for M%d approval", record.session_id, milestone_number)

            # Block until the API consumer calls /approve
            record._gate_event.clear()
            record._gate_event.wait()

            action = record._gate_action
            feedback = record._gate_feedback
            record.status = "RUNNING"
            logger.info("Session %s M%d: %s", record.session_id, milestone_number, action)
            return (action, feedback)

        record.status = "RUNNING"
        workflow = StrategyWorkflow(human_approval_fn=api_approval_fn)
        session = workflow.run(record.equipment, plant_code=record.plant_code)

        record.entity_counts = session.get_entity_counts()
        if session.sap_upload_package:
            record.sap_xlsx_path = session.sap_upload_package.get("xlsx_path", "")

        record.status = "COMPLETED"
        record.completed_at = datetime.utcnow().isoformat()
        logger.info("Workflow session %s completed", record.session_id)

    except Exception as exc:
        logger.exception("Workflow session %s failed: %s", record.session_id, exc)
        record.status = "FAILED"
        record.error = str(exc)
        record.completed_at = datetime.utcnow().isoformat()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/run", response_model=WorkflowRunResponse, status_code=202)
def run_workflow(request: WorkflowRunRequest, background_tasks: BackgroundTasks):
    """Start a new 4-milestone agent workflow session.

    Returns immediately with a session_id. Poll GET /workflow/{session_id}
    to track progress. When status=AWAITING_APPROVAL, POST to
    /workflow/{session_id}/approve to advance or stop the session.
    """
    session_id = str(uuid.uuid4())
    record = _SessionRecord(session_id, request.equipment, request.plant_code)
    _SESSIONS[session_id] = record

    # Run in a background thread (not FastAPI BackgroundTasks, which runs in
    # the same event loop — workflow is synchronous and long-running)
    thread = threading.Thread(
        target=_run_workflow_thread,
        args=(record,),
        daemon=True,
        name=f"workflow-{session_id[:8]}",
    )
    thread.start()

    return WorkflowRunResponse(
        session_id=session_id,
        status="STARTING",
        message=f"Workflow started for '{request.equipment}' at plant '{request.plant_code}'. "
                f"Poll GET /workflow/{session_id} for status.",
    )


@router.get("/sessions", response_model=list[WorkflowStatusResponse])
def list_sessions():
    """List all workflow sessions (active and completed)."""
    return [
        WorkflowStatusResponse(
            session_id=r.session_id,
            equipment=r.equipment,
            plant_code=r.plant_code,
            status=r.status,
            current_milestone=r.current_milestone,
            gate_summary=r.gate_summary,
            entity_counts=r.entity_counts,
            error=r.error,
            sap_xlsx_path=r.sap_xlsx_path,
            started_at=r.started_at,
            completed_at=r.completed_at,
        )
        for r in _SESSIONS.values()
    ]


@router.get("/{session_id}", response_model=WorkflowStatusResponse)
def get_session(session_id: str):
    """Poll the status of a running or completed workflow session."""
    record = _SESSIONS.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return WorkflowStatusResponse(
        session_id=record.session_id,
        equipment=record.equipment,
        plant_code=record.plant_code,
        status=record.status,
        current_milestone=record.current_milestone,
        gate_summary=record.gate_summary,
        entity_counts=record.entity_counts,
        error=record.error,
        sap_xlsx_path=record.sap_xlsx_path,
        started_at=record.started_at,
        completed_at=record.completed_at,
    )


@router.post("/{session_id}/approve", response_model=GateApprovalResponse)
def approve_gate(session_id: str, request: GateApprovalRequest):
    """Submit a gate approval decision for an awaiting milestone.

    The workflow thread is blocked waiting for this call.
    Call this endpoint when GET /workflow/{session_id} returns
    status=AWAITING_APPROVAL.

    - action="approve"  → advance to next milestone
    - action="modify"   → re-run current milestone with feedback
    - action="reject"   → terminate the session
    """
    record = _SESSIONS.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    if record.status != "AWAITING_APPROVAL":
        raise HTTPException(
            status_code=409,
            detail=f"Session is not awaiting approval (current status: {record.status})",
        )

    milestone = record.current_milestone
    record._gate_action = request.action
    record._gate_feedback = request.feedback
    record._gate_event.set()  # Unblock the workflow thread

    return GateApprovalResponse(
        session_id=session_id,
        action=request.action,
        milestone=milestone,
        message=f"Gate M{milestone} decision '{request.action}' submitted.",
    )
