"""Equipment Chat Service — gathers full equipment context from DB and calls Claude.

Collects: hierarchy info, criticality, FMEA, work requests, captures, backlog,
troubleshooting history, and maintenance tasks for a given equipment tag.
Sends it all as context to Claude for an informed conversational response.
"""

import json
import logging
import os
import time

from sqlalchemy.orm import Session

log = logging.getLogger(__name__)


def _gather_equipment_context(db: Session, equipment_tag: str) -> dict:
    """Query all relevant tables for equipment context."""
    from api.database.models import (
        HierarchyNodeModel, CriticalityAssessmentModel,
        FunctionModel, FunctionalFailureModel, FailureModeModel,
        MaintenanceTaskModel, WorkRequestModel, FieldCaptureModel,
        BacklogItemModel, TroubleshootingDiagnosticModel,
        WorkPackageModel,
    )

    tag_upper = equipment_tag.upper().strip()
    context = {"equipment_tag": tag_upper}

    # 1. Hierarchy node
    node = db.query(HierarchyNodeModel).filter(
        (HierarchyNodeModel.tag == tag_upper) |
        (HierarchyNodeModel.code == tag_upper)
    ).first()

    if node:
        context["hierarchy"] = {
            "node_id": node.node_id,
            "name": node.name,
            "name_fr": node.name_fr,
            "node_type": node.node_type,
            "level": node.level,
            "code": node.code,
            "tag": node.tag,
            "criticality": node.criticality,
            "plant_id": node.plant_id,
        }

        # 2. Criticality
        crit = db.query(CriticalityAssessmentModel).filter(
            CriticalityAssessmentModel.node_id == node.node_id
        ).order_by(CriticalityAssessmentModel.created_at.desc()).first()
        if crit:
            context["criticality"] = {
                "risk_class": crit.risk_class,
                "overall_score": crit.overall_score,
                "criteria_scores": crit.criteria_scores,
                "status": crit.status,
            }

        # 3. FMEA — functions, failures, failure modes
        functions = db.query(FunctionModel).filter(
            FunctionModel.node_id == node.node_id
        ).all()
        if functions:
            fmea_data = []
            for fn in functions[:10]:  # limit
                failures = db.query(FunctionalFailureModel).filter(
                    FunctionalFailureModel.function_id == fn.function_id
                ).all()
                fn_data = {
                    "function": fn.description,
                    "type": fn.function_type,
                    "failures": [],
                }
                for ff in failures[:5]:
                    modes = db.query(FailureModeModel).filter(
                        FailureModeModel.functional_failure_id == ff.failure_id
                    ).all()
                    fn_data["failures"].append({
                        "failure": ff.description,
                        "modes": [
                            {"mechanism": fm.mechanism, "cause": fm.cause,
                             "strategy": fm.strategy_type, "confidence": fm.ai_confidence}
                            for fm in modes[:5]
                        ]
                    })
                fmea_data.append(fn_data)
            context["fmea"] = fmea_data

        # 4. Maintenance tasks (linked via FMEA: function → failure → mode → task)
        if functions:
            fm_ids = []
            for fn in functions[:10]:
                ffs = db.query(FunctionalFailureModel).filter(
                    FunctionalFailureModel.function_id == fn.function_id).all()
                for ff in ffs[:5]:
                    fms = db.query(FailureModeModel).filter(
                        FailureModeModel.functional_failure_id == ff.failure_id).all()
                    fm_ids.extend(fm.failure_mode_id for fm in fms[:5])
            if fm_ids:
                tasks = db.query(MaintenanceTaskModel).filter(
                    MaintenanceTaskModel.failure_mode_id.in_(fm_ids[:50])
                ).all()
                if tasks:
                    context["maintenance_tasks"] = [
                        {"name": t.name, "type": t.task_type,
                         "frequency": f"{t.frequency_value} {t.frequency_unit}",
                         "constraint": t.constraint}
                        for t in tasks[:15]
                    ]

        # 5. Work packages
        wps = db.query(WorkPackageModel).filter(
            WorkPackageModel.node_id == node.node_id
        ).all()
        if wps:
            context["work_packages"] = [
                {"code": wp.code, "frequency": f"{wp.frequency_value}",
                 "task_count": len(wp.allocated_tasks) if wp.allocated_tasks else 0}
                for wp in wps[:10]
            ]

    # 6. Work requests (by equipment tag)
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.equipment_tag == tag_upper
    ).order_by(WorkRequestModel.created_at.desc()).limit(10).all()
    if wrs:
        context["work_requests"] = [
            {"id": wr.request_id, "status": wr.status,
             "description": (wr.problem_description or {}).get("structured_description", "")[:200],
             "failure_mode": (wr.problem_description or {}).get("failure_mode_detected"),
             "priority": (wr.ai_classification or {}).get("priority_suggested"),
             "wo_type": (wr.ai_classification or {}).get("work_order_type"),
             "created_at": wr.created_at.isoformat() if wr.created_at else None}
            for wr in wrs
        ]

    # 7. Field captures
    captures = db.query(FieldCaptureModel).filter(
        FieldCaptureModel.equipment_tag_manual == tag_upper
    ).order_by(FieldCaptureModel.created_at.desc()).limit(5).all()
    if captures:
        context["captures"] = [
            {"id": c.capture_id, "type": c.capture_type,
             "text": (c.raw_text or "")[:200], "location": c.location_hint,
             "created_at": c.created_at.isoformat() if c.created_at else None}
            for c in captures
        ]

    # 8. Backlog items
    if wrs:
        wr_ids = [wr.request_id for wr in wrs]
        backlog = db.query(BacklogItemModel).filter(
            BacklogItemModel.work_request_id.in_(wr_ids)
        ).all()
        if backlog:
            context["backlog"] = [
                {"id": b.backlog_id, "priority": b.priority, "wo_type": b.wo_type,
                 "estimated_hours": b.estimated_hours, "shutdown_required": b.shutdown_required}
                for b in backlog
            ]

    # 9. Troubleshooting diagnostics
    diagnostics = db.query(TroubleshootingDiagnosticModel).filter(
        TroubleshootingDiagnosticModel.equipment_tag == tag_upper
    ).order_by(TroubleshootingDiagnosticModel.created_at.desc()).limit(5).all()
    if diagnostics:
        context["diagnostics"] = [
            {"symptom": d.symptom_description,
             "causes": d.probable_causes[:3] if d.probable_causes else [],
             "confidence": d.confidence_score,
             "resolved": d.resolved}
            for d in diagnostics
        ]

    return context


_SYSTEM_PROMPT = """\
You are an industrial maintenance AI assistant for OCP (Office Chérifien des Phosphates), \
a phosphate mining operation in Morocco.

You have access to the FULL maintenance database for the equipment the user is asking about. \
Use this data to give specific, actionable answers. Reference actual work requests, failure modes, \
criticality data, and maintenance history when available.

Guidelines:
- Be concise and practical — you're talking to maintenance professionals
- If the data shows patterns (recurring failures, overdue maintenance), highlight them
- Suggest actions based on RCM/FMEA best practices
- Answer in the same language the user writes in (Spanish, English, French, or Arabic)
- If you don't have enough data, say so — don't make things up
- Reference specific WR IDs, failure modes, and dates when available
"""


def chat_with_equipment(
    db: Session,
    equipment_tag: str,
    question: str,
    conversation_history: list[dict],
) -> dict:
    """Run equipment chat: gather context, call Claude, return response."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY not configured", "response": None}

    start = time.time()

    # Gather all equipment context from DB
    context = _gather_equipment_context(db, equipment_tag)
    context_json = json.dumps(context, default=str, ensure_ascii=False)

    # Build messages
    messages = []

    # Add conversation history (last 20 turns max)
    for msg in conversation_history[-20:]:
        role = msg.get("role", "user")
        if role in ("user", "assistant"):
            messages.append({"role": role, "content": msg.get("content", "")})

    # Add current question
    user_content = f"[Equipment context from database]\n{context_json}\n\n[User question]\n{question}"
    messages.append({"role": "user", "content": user_content})

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=_SYSTEM_PROMPT,
            messages=messages,
        )
        ai_response = response.content[0].text.strip()
        duration_ms = int((time.time() - start) * 1000)

        return {
            "response": ai_response,
            "equipment_tag": equipment_tag,
            "context_summary": {
                "has_hierarchy": "hierarchy" in context,
                "has_criticality": "criticality" in context,
                "has_fmea": "fmea" in context,
                "work_requests_count": len(context.get("work_requests", [])),
                "captures_count": len(context.get("captures", [])),
                "tasks_count": len(context.get("maintenance_tasks", [])),
                "diagnostics_count": len(context.get("diagnostics", [])),
            },
            "duration_ms": duration_ms,
        }
    except Exception as exc:
        log.error("Equipment chat failed: %s", exc)
        return {"error": str(exc)[:500], "response": None}
