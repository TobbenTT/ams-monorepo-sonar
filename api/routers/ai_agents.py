"""AI Agent endpoints — CORTEX multi-agent system integration.

Exposes the 4-agent strategy workflow, troubleshooting diagnostics,
execution checklists, and direct tool invocation.
All outputs are DRAFT — human approval required at every gate.
"""

from __future__ import annotations

import json
import logging
import time
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import (
    AISessionModel, AIInteractionModel,
    TroubleshootingDiagnosticModel, ExecutionChecklistModel,
)
from api.dependencies.auth import get_current_user
from api.schemas import (
    AISessionCreate, AIMilestoneAction,
    TroubleshootingRequest, ChecklistGenerateRequest,
    ChecklistItemUpdate, AIToolCallRequest,
    EquipmentChatRequest,
)

log = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai",
    tags=["ai-agents"],
    dependencies=[Depends(get_current_user)],
)


# ── Helpers ──────────────────────────────────────────────────────────

def _check_anthropic_key() -> str:
    """Return the Anthropic API key or raise 503."""
    key = os.getenv("ANTHROPIC_API_KEY", "")
    if not key:
        raise HTTPException(
            status_code=503,
            detail="AI agents not available: ANTHROPIC_API_KEY not configured",
        )
    return key


def _session_to_dict(s: AISessionModel) -> dict:
    return {
        "session_id": s.session_id,
        "user_id": s.user_id,
        "equipment_tag": s.equipment_tag,
        "plant_id": s.plant_id,
        "status": s.status,
        "current_milestone": s.current_milestone,
        "milestone_gates": s.milestone_gates,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


def _diagnostic_to_dict(d: TroubleshootingDiagnosticModel) -> dict:
    return {
        "diagnostic_id": d.diagnostic_id,
        "equipment_tag": d.equipment_tag,
        "plant_id": d.plant_id,
        "symptom_description": d.symptom_description,
        "ai_diagnosis": d.ai_diagnosis,
        "probable_causes": d.probable_causes,
        "recommended_actions": d.recommended_actions,
        "confidence_score": d.confidence_score,
        "resolved": d.resolved,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


def _checklist_to_dict(c: ExecutionChecklistModel) -> dict:
    return {
        "checklist_id": c.checklist_id,
        "work_package_id": c.work_package_id,
        "equipment_tag": c.equipment_tag,
        "task_type": c.task_type,
        "checklist_items": c.checklist_items,
        "safety_items": c.safety_items,
        "loto_steps": c.loto_steps,
        "ppe_requirements": c.ppe_requirements,
        "status": c.status,
        "completed_items": c.completed_items,
        "total_items": c.total_items,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


# ── Agent Status ─────────────────────────────────────────────────────

@router.get("/status")
def get_ai_status():
    """Check AI agent system status and available tools."""
    has_key = bool(os.getenv("ANTHROPIC_API_KEY", ""))

    tool_count = 0
    agent_tools = {}
    all_agents = [
        "orchestrator", "reliability", "planning", "spare_parts",
        "operations", "hse", "contracts", "execution",
        "project_orchestrator", "engineering", "construction",
        "finance", "hr_talent", "it_ot", "web_intelligence",
    ]
    try:
        import api.ai_core.tool_wrappers.server as server
        tool_count = server.get_tool_count()
        for agent_type in all_agents:
            agent_tools[agent_type] = len(server.get_tools_for_agent(agent_type))
    except Exception as e:
        log.warning("Failed to load AI tools: %s", e)

    return {
        "status": "ready" if has_key else "no_api_key",
        "anthropic_key_configured": has_key,
        "total_tools": tool_count,
        "agent_tools": agent_tools,
        "agents": all_agents,
        "agent_teams": {
            "team_b_operations_assets": ["reliability", "planning", "spare_parts", "operations", "hse", "execution"],
            "team_a_project_delivery": ["orchestrator", "project_orchestrator", "engineering", "construction", "contracts"],
            "team_c_corporate": ["finance", "hr_talent", "it_ot"],
            "team_d_intelligence": ["web_intelligence"],
        },
        "milestones": [
            {"number": 0, "name": "G0 — Scope & Context"},
            {"number": 1, "name": "G1 — Hierarchy & Criticality"},
            {"number": 2, "name": "G2 — Strategy & Planning"},
            {"number": 3, "name": "G3 — Execution Readiness"},
            {"number": 4, "name": "G4 — Operational Readiness"},
        ],
    }


# ── Sessions ─────────────────────────────────────────────────────────

@router.post("/sessions")
def create_session(
    data: AISessionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Start a new AI strategy development session."""
    _check_anthropic_key()

    session = AISessionModel(
        user_id=user.user_id,
        equipment_tag=data.equipment_tag,
        plant_id=data.plant_id,
        status="ACTIVE",
        current_milestone=0,
        session_state={},
        milestone_gates=[
            {"number": i, "status": "PENDING", "name": name}
            for i, name in enumerate(
                ["Hierarchy Decomposition", "FMEA Completion",
                 "Strategy + Tasks + Resources", "SAP Upload Package"],
                start=1,
            )
        ],
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _session_to_dict(session)


@router.get("/sessions")
def list_sessions(
    status: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """List AI sessions for the current user."""
    query = db.query(AISessionModel).filter(AISessionModel.user_id == user.user_id)
    if status:
        query = query.filter(AISessionModel.status == status)
    sessions = query.order_by(AISessionModel.created_at.desc()).all()
    return [_session_to_dict(s) for s in sessions]


@router.get("/sessions/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get details of a specific AI session."""
    session = db.query(AISessionModel).filter(AISessionModel.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    result = _session_to_dict(session)
    result["session_state"] = session.session_state
    return result


@router.post("/sessions/{session_id}/advance")
def advance_milestone(
    session_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Run the next milestone for a session using the AI agents."""
    _check_anthropic_key()

    session = db.query(AISessionModel).filter(AISessionModel.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Session is {session.status}, not ACTIVE")

    next_milestone = session.current_milestone + 1
    if next_milestone > 4:
        raise HTTPException(status_code=400, detail="All milestones completed")

    # Run the agent for this milestone
    start_time = time.time()
    try:
        from api.ai_core.orchestration.session_state import SessionState
        from api.ai_core.agents.orchestrator import create_orchestrator
        import api.ai_core.tool_wrappers.server  # noqa: ensure tools registered

        # Restore session state
        state = SessionState(
            session_id=session.session_id,
            equipment_tag=session.equipment_tag,
            plant_code=session.plant_id,
        )
        if session.session_state:
            for key, val in session.session_state.items():
                if hasattr(state, key) and key not in ("session_id", "equipment_tag", "plant_code"):
                    setattr(state, key, val)

        # Build milestone instruction
        from api.ai_core.orchestration.workflow import StrategyWorkflow
        workflow = StrategyWorkflow.__new__(StrategyWorkflow)
        workflow.session = state
        from api.ai_core.orchestration.milestones import create_milestone_gates
        gates = create_milestone_gates()
        gate = gates[next_milestone - 1]

        instruction = workflow._build_milestone_instruction(gate)

        # Run orchestrator
        orchestrator = create_orchestrator()
        response = orchestrator.run(instruction)

        duration_ms = int((time.time() - start_time) * 1000)

        # Record interaction
        interaction = AIInteractionModel(
            session_id=session.session_id,
            agent_type="orchestrator",
            milestone=next_milestone,
            instruction=instruction[:500],
            response_summary=response[:1000],
            duration_ms=duration_ms,
        )
        db.add(interaction)

        # Update session
        session.current_milestone = next_milestone
        session.session_state = json.loads(state.to_json())
        gates_data = session.milestone_gates or []
        for g in gates_data:
            if g["number"] == next_milestone:
                g["status"] = "PRESENTED"
        session.milestone_gates = gates_data
        session.updated_at = datetime.now()
        db.commit()

        return {
            "session_id": session.session_id,
            "milestone": next_milestone,
            "status": "PRESENTED",
            "response_summary": response[:2000],
            "entity_counts": state.get_entity_counts(),
            "duration_ms": duration_ms,
        }

    except Exception as e:
        log.error("AI milestone %d failed for session %s: %s", next_milestone, session_id, e)
        session.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail="AI processing error")


@router.post("/sessions/{session_id}/milestone/{milestone_num}/action")
def milestone_action(
    session_id: str,
    milestone_num: int,
    data: AIMilestoneAction,
    db: Session = Depends(get_db),
):
    """Approve, modify, or reject a milestone."""
    session = db.query(AISessionModel).filter(AISessionModel.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    gates_data = session.milestone_gates or []
    gate = next((g for g in gates_data if g["number"] == milestone_num), None)
    if not gate:
        raise HTTPException(status_code=404, detail=f"Milestone {milestone_num} not found")
    if gate["status"] != "PRESENTED":
        raise HTTPException(status_code=400, detail=f"Milestone is {gate['status']}, expected PRESENTED")

    action = data.action
    if action == "approve":
        gate["status"] = "APPROVED"
        gate["feedback"] = data.feedback
        if milestone_num == 4:
            session.status = "COMPLETED"
            session.completed_at = datetime.now()
    elif action == "modify":
        gate["status"] = "IN_PROGRESS"
        gate["feedback"] = data.feedback
        session.current_milestone = milestone_num - 1  # re-run this milestone
    elif action == "reject":
        gate["status"] = "REJECTED"
        gate["feedback"] = data.feedback
        session.status = "COMPLETED"
        session.completed_at = datetime.now()

    session.milestone_gates = gates_data
    session.updated_at = datetime.now()
    db.commit()

    return {"session_id": session_id, "milestone": milestone_num, "action": action, "status": gate["status"]}


# ── Troubleshooting Diagnostics (GAP-W02) ───────────────────────────

@router.post("/troubleshoot")
def create_troubleshooting(
    data: TroubleshootingRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Run AI troubleshooting for equipment symptoms."""
    _check_anthropic_key()

    start_time = time.time()
    try:
        import api.ai_core.tool_wrappers.server  # noqa
        from api.ai_core.agents.reliability import create_reliability_agent

        agent = create_reliability_agent()
        instruction = (
            f"Equipment: {data.equipment_tag} (Plant: {data.plant_id})\n"
            f"Symptom: {data.symptom_description}\n\n"
            "Provide a structured troubleshooting diagnosis:\n"
            "1. Identify the most probable failure modes for this symptom\n"
            "2. List probable causes ranked by likelihood\n"
            "3. Recommend diagnostic actions to confirm the root cause\n"
            "4. Suggest corrective actions\n"
            "Return your analysis as a structured JSON with keys: "
            "diagnosis, probable_causes, recommended_actions, confidence"
        )
        response = agent.run(instruction)
        duration_ms = int((time.time() - start_time) * 1000)

        # Try to extract structured data from response
        diagnosis_data = {"raw_response": response}
        probable_causes = []
        recommended_actions = []
        confidence = 0.6

        try:
            # Try to parse JSON from the response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                parsed = json.loads(json_match.group())
                diagnosis_data = parsed.get("diagnosis", parsed)
                probable_causes = parsed.get("probable_causes", [])
                recommended_actions = parsed.get("recommended_actions", [])
                confidence = parsed.get("confidence", 0.6)
        except (json.JSONDecodeError, AttributeError):
            pass

        diagnostic = TroubleshootingDiagnosticModel(
            equipment_tag=data.equipment_tag,
            plant_id=data.plant_id,
            symptom_description=data.symptom_description,
            ai_diagnosis=diagnosis_data,
            probable_causes=probable_causes,
            recommended_actions=recommended_actions,
            confidence_score=confidence,
            created_by=user.user_id,
        )
        db.add(diagnostic)
        db.commit()
        db.refresh(diagnostic)

        result = _diagnostic_to_dict(diagnostic)
        result["duration_ms"] = duration_ms
        return result

    except HTTPException:
        raise
    except Exception as e:
        log.error("Troubleshooting failed: %s", e)
        raise HTTPException(status_code=500, detail="AI processing error")


@router.get("/troubleshoot")
def list_diagnostics(
    equipment_tag: str | None = None,
    db: Session = Depends(get_db),
):
    """List troubleshooting diagnostics."""
    query = db.query(TroubleshootingDiagnosticModel)
    if equipment_tag:
        query = query.filter(TroubleshootingDiagnosticModel.equipment_tag == equipment_tag)
    diagnostics = query.order_by(TroubleshootingDiagnosticModel.created_at.desc()).limit(50).all()
    return [_diagnostic_to_dict(d) for d in diagnostics]


# ── Execution Checklists (GAP-W06) ──────────────────────────────────

@router.post("/checklists")
def generate_checklist(
    data: ChecklistGenerateRequest,
    db: Session = Depends(get_db),
):
    """Generate an AI execution checklist for a work package."""
    _check_anthropic_key()

    try:
        import api.ai_core.tool_wrappers.server  # noqa
        from api.ai_core.tool_wrappers.registry import call_tool

        result_json = call_tool("generate_work_instruction", {
            "input_json": json.dumps({
                "work_package_id": data.work_package_id,
                "equipment_tag": data.equipment_tag,
                "task_type": data.task_type,
            })
        })

        # Parse work instruction into checklist format
        checklist_items = []
        safety_items = []
        loto_steps = []
        ppe_requirements = []

        try:
            wi = json.loads(result_json)
            if isinstance(wi, dict):
                for step in wi.get("execution_steps", wi.get("steps", [])):
                    checklist_items.append({
                        "description": step if isinstance(step, str) else step.get("description", str(step)),
                        "completed": False,
                    })
                safety_items = [{"description": s, "completed": False} for s in wi.get("safety_precautions", [])]
                loto_steps = [{"description": s, "completed": False} for s in wi.get("loto_steps", [])]
                ppe_requirements = wi.get("ppe", wi.get("ppe_requirements", []))
        except (json.JSONDecodeError, TypeError):
            checklist_items = [{"description": "Review work instruction", "completed": False}]

        total = len(checklist_items) + len(safety_items) + len(loto_steps)

        checklist = ExecutionChecklistModel(
            work_package_id=data.work_package_id,
            equipment_tag=data.equipment_tag,
            task_type=data.task_type,
            checklist_items=checklist_items,
            safety_items=safety_items,
            loto_steps=loto_steps,
            ppe_requirements=ppe_requirements,
            total_items=total,
        )
        db.add(checklist)
        db.commit()
        db.refresh(checklist)
        return _checklist_to_dict(checklist)

    except HTTPException:
        raise
    except Exception as e:
        log.error("Checklist generation failed: %s", e)
        raise HTTPException(status_code=500, detail="AI processing error")


@router.get("/checklists/{checklist_id}")
def get_checklist(checklist_id: str, db: Session = Depends(get_db)):
    """Get a specific execution checklist."""
    cl = db.query(ExecutionChecklistModel).filter(ExecutionChecklistModel.checklist_id == checklist_id).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return _checklist_to_dict(cl)


@router.put("/checklists/{checklist_id}/items")
def update_checklist_item(
    checklist_id: str,
    data: ChecklistItemUpdate,
    db: Session = Depends(get_db),
):
    """Mark a checklist item as completed."""
    cl = db.query(ExecutionChecklistModel).filter(ExecutionChecklistModel.checklist_id == checklist_id).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Checklist not found")

    items = cl.checklist_items or []
    if data.item_index >= len(items):
        raise HTTPException(status_code=400, detail="Item index out of range")

    items[data.item_index]["completed"] = data.completed
    if data.notes:
        items[data.item_index]["notes"] = data.notes
    cl.checklist_items = items

    # Recount completed
    all_items = (cl.checklist_items or []) + (cl.safety_items or []) + (cl.loto_steps or [])
    cl.completed_items = sum(1 for item in all_items if item.get("completed"))

    if cl.completed_items >= cl.total_items and cl.total_items > 0:
        cl.status = "COMPLETED"
        cl.completed_at = datetime.now()

    db.commit()
    return _checklist_to_dict(cl)


# ── Direct Tool Invocation ───────────────────────────────────────────

@router.post("/tools/call")
def call_ai_tool(data: AIToolCallRequest):
    """Invoke a registered AI tool directly (advanced)."""
    try:
        import api.ai_core.tool_wrappers.server  # noqa
        from api.ai_core.tool_wrappers.registry import call_tool, is_tool_error, TOOL_REGISTRY

        if data.tool_name not in TOOL_REGISTRY:
            raise HTTPException(status_code=404, detail=f"Unknown tool: {data.tool_name}")

        result = call_tool(data.tool_name, data.arguments)

        if is_tool_error(result):
            return {"status": "error", "tool": data.tool_name, "result": json.loads(result)}

        try:
            parsed = json.loads(result)
            return {"status": "ok", "tool": data.tool_name, "result": parsed}
        except json.JSONDecodeError:
            return {"status": "ok", "tool": data.tool_name, "result": result}

    except HTTPException:
        raise
    except Exception as e:
        log.error("Tool call failed for '%s': %s", data.tool_name, e)
        raise HTTPException(status_code=500, detail="AI processing error")


@router.get("/tools")
def list_ai_tools():
    """List all available AI tools."""
    try:
        import api.ai_core.tool_wrappers.server  # noqa
        from api.ai_core.tool_wrappers.registry import list_tools
        tools = list_tools()
        return {
            "count": len(tools),
            "tools": [{"name": t["name"], "description": t["description"]} for t in tools],
        }
    except Exception as e:
        return {"count": 0, "tools": [], "error": str(e)[:200]}


# ── Equipment Chat — Contextual AI Assistant ─────────────────────────

@router.post("/equipment-chat")
def equipment_chat(
    data: EquipmentChatRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """AI chat about a specific equipment — uses full DB context."""
    _check_anthropic_key()

    from api.services.equipment_chat_service import chat_with_equipment

    result = chat_with_equipment(
        db=db,
        equipment_tag=data.equipment_tag,
        question=data.question,
        conversation_history=data.conversation_history,
    )

    if result.get("error") and not result.get("response"):
        raise HTTPException(status_code=500, detail=result["error"])

    return result
