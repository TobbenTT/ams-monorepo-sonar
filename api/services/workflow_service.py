"""Workflow service — manages background execution of StrategyWorkflow via threading.

Architecture:
    POST /workflow/run starts a background thread running StrategyWorkflow.run().
    The human approval gate is implemented via threading.Event: the thread pauses
    at each milestone gate, waiting for an HTTP POST to /workflow/{session_id}/gate.
"""

from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


@dataclass
class WorkflowRunRequest:
    equipment_description: str
    plant_code: str = "OCP"
    client_slug: str = ""
    project_slug: str = ""
    strict_validation: bool = True
    max_modify_retries: int = 5


@dataclass
class WorkflowRuntime:
    session_id: str
    equipment_description: str
    plant_code: str
    status: str = "starting"  # starting | running | awaiting_approval | completed | failed
    current_milestone: int | None = None
    gate_summary: str | None = None
    gate_action: tuple[str, str] | None = None  # (action, feedback)
    gate_event: threading.Event = field(default_factory=threading.Event)
    thread: threading.Thread | None = field(default=None, repr=False)
    error: str | None = None
    entity_counts: dict | None = None
    milestones_approved: int = 0
    started_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: str | None = None


class WorkflowService:
    """In-memory store for active and completed workflow sessions.

    Prototype implementation uses a class-level dict. For production, replace
    with Redis or database-backed persistence.
    """

    _sessions: dict[str, WorkflowRuntime] = {}

    @classmethod
    def start(cls, request: WorkflowRunRequest) -> str:
        """Launch a new workflow session in a background thread.

        Returns the session_id immediately. The workflow runs asynchronously.
        """
        runtime = WorkflowRuntime(
            session_id=str(uuid.uuid4()),
            equipment_description=request.equipment_description,
            plant_code=request.plant_code,
        )
        cls._sessions[runtime.session_id] = runtime

        def api_gate_fn(milestone_number: int, summary: str) -> tuple[str, str]:
            """Approval callback injected into StrategyWorkflow.

            Blocks the background thread until submit_approval() is called via HTTP.
            """
            runtime.current_milestone = milestone_number
            runtime.gate_summary = summary
            runtime.gate_action = None
            runtime.gate_event.clear()
            runtime.status = "awaiting_approval"
            # Block up to 1 hour for human response
            runtime.gate_event.wait(timeout=3600)
            return runtime.gate_action or ("reject", "Timeout — no response within 1 hour")

        def run_workflow() -> None:
            try:
                runtime.status = "running"
                # Import here to avoid circular imports at module load time
                from agents.orchestration.workflow import StrategyWorkflow

                wf = StrategyWorkflow(
                    human_approval_fn=api_gate_fn,
                    strict_validation=request.strict_validation,
                    max_modify_retries=request.max_modify_retries,
                    client_slug=request.client_slug,
                    project_slug=request.project_slug,
                )
                session = wf.run(
                    request.equipment_description,
                    plant_code=request.plant_code,
                )
                runtime.milestones_approved = sum(
                    1 for m in wf.milestones if m.is_complete
                )
                runtime.entity_counts = session.get_entity_counts()
                runtime.status = "completed"
                runtime.completed_at = datetime.utcnow().isoformat()
            except Exception as exc:  # noqa: BLE001
                runtime.error = str(exc)
                runtime.status = "failed"
                # Unblock any waiting gate_event so the thread exits cleanly
                runtime.gate_event.set()

        runtime.thread = threading.Thread(target=run_workflow, daemon=True, name=f"workflow-{runtime.session_id[:8]}")
        runtime.thread.start()
        return runtime.session_id

    @classmethod
    def get(cls, session_id: str) -> WorkflowRuntime | None:
        return cls._sessions.get(session_id)

    @classmethod
    def submit_approval(cls, session_id: str, action: str, feedback: str) -> bool:
        """Submit a gate decision. Returns False if session not found or not awaiting approval."""
        runtime = cls._sessions.get(session_id)
        if not runtime or runtime.status != "awaiting_approval":
            return False
        runtime.gate_action = (action, feedback)
        runtime.status = "running"
        runtime.gate_event.set()
        return True

    @classmethod
    def list_sessions(cls) -> list[dict]:
        return [
            {
                "session_id": sid,
                "status": r.status,
                "equipment_description": r.equipment_description,
                "plant_code": r.plant_code,
                "current_milestone": r.current_milestone,
                "milestones_approved": r.milestones_approved,
                "started_at": r.started_at,
                "completed_at": r.completed_at,
            }
            for sid, r in cls._sessions.items()
        ]
