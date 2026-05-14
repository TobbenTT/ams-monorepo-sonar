"""Context Builder Service — gathers historical context for AI calls.

Provides equipment history, materials, duration stats, failure patterns,
and AI feedback to enrich Claude prompts for better suggestions.
"""

import json
import logging
from collections import Counter
from sqlalchemy.orm import Session

log = logging.getLogger("ocp_maintenance")


def build_equipment_context(db: Session, equipment_tag: str) -> dict:
    """Build comprehensive historical context for AI prompt enrichment."""
    from api.database.models import (
        HierarchyNodeModel, WorkRequestModel, FailureModeModel,
        FunctionModel, FunctionalFailureModel,
        TroubleshootingDiagnosticModel,
    )

    tag = (equipment_tag or "").upper().strip()
    if not tag:
        return {}

    ctx = {"equipment_tag": tag}

    # 1. Equipment info from hierarchy
    node = db.query(HierarchyNodeModel).filter(
        (HierarchyNodeModel.tag == tag) | (HierarchyNodeModel.code == tag)
    ).first()

    if node:
        ctx["equipment"] = {
            "name": node.name,
            "type": node.node_type,
            "criticality": node.criticality or "C",
            "code": node.code,
        }
        # Get parent for context
        if node.parent_node_id:
            parent = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.node_id == node.parent_node_id
            ).first()
            if parent:
                ctx["equipment"]["parent"] = parent.name

        # Get sibling equipment (same parent, same type)
        if node.parent_node_id:
            siblings = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.parent_node_id == node.parent_node_id,
                HierarchyNodeModel.node_type == "EQUIPMENT",
                HierarchyNodeModel.node_id != node.node_id,
            ).limit(5).all()
            ctx["similar_equipment"] = [s.tag or s.code for s in siblings]

    # 2. Managed Work Orders history (main OT table)
    try:
        from api.database.models import ManagedWorkOrderModel
        mwos = db.query(ManagedWorkOrderModel).filter(
            ManagedWorkOrderModel.equipment_tag == tag
        ).order_by(ManagedWorkOrderModel.created_at.desc()).limit(20).all()

        if mwos:
            wo_list = []
            all_materials = []
            durations_by_type = {}

            for wo in mwos:
                wo_data = {
                    "wo_number": wo.wo_number,
                    "type": wo.wo_type,
                    "priority": wo.priority_code,
                    "status": wo.status,
                    "description": (wo.description or "")[:150],
                    "estimated_hours": wo.estimated_hours,
                    "actual_hours": wo.actual_hours,
                }
                wo_list.append(wo_data)

                # Collect materials
                if wo.materials:
                    mats = wo.materials if isinstance(wo.materials, list) else []
                    for m in mats:
                        if isinstance(m, dict):
                            all_materials.append({
                                "code": m.get("code", ""),
                                "description": m.get("description", ""),
                                "quantity": m.get("quantity", 1),
                            })

                # Collect duration stats
                wtype = wo.wo_type or "UNKNOWN"
                if wtype not in durations_by_type:
                    durations_by_type[wtype] = {"estimated": [], "actual": []}
                if wo.estimated_hours:
                    durations_by_type[wtype]["estimated"].append(wo.estimated_hours)
                if wo.actual_hours:
                    durations_by_type[wtype]["actual"].append(wo.actual_hours)

            ctx["work_orders"] = wo_list[:10]

            # Materials frequency
            if all_materials:
                mat_counter = Counter()
                mat_desc = {}
                for m in all_materials:
                    key = m["code"] or m["description"]
                    mat_counter[key] += m.get("quantity", 1)
                    mat_desc[key] = m["description"]
                ctx["materials_history"] = [
                    {"code": k, "description": mat_desc.get(k, k), "total_used": v}
                    for k, v in mat_counter.most_common(10)
                ]

            # Duration stats
            dur_stats = {}
            for wtype, vals in durations_by_type.items():
                stats = {}
                if vals["estimated"]:
                    stats["avg_estimated"] = round(sum(vals["estimated"]) / len(vals["estimated"]), 1)
                if vals["actual"]:
                    stats["avg_actual"] = round(sum(vals["actual"]) / len(vals["actual"]), 1)
                    stats["min_actual"] = min(vals["actual"])
                    stats["max_actual"] = max(vals["actual"])
                if stats:
                    dur_stats[wtype] = stats
            if dur_stats:
                ctx["duration_stats"] = dur_stats
    except Exception as e:
        log.warning(f"ContextBuilder: managed WOs query failed: {e}")

    # 3. Work Requests history
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.equipment_tag == tag
    ).order_by(WorkRequestModel.created_at.desc()).limit(10).all()

    if wrs:
        wr_list = []
        for wr in wrs:
            pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
            ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
            wr_list.append({
                "status": wr.status,
                "description": pd.get("original_text", "")[:150],
                "failure_type": pd.get("failure_mode_detected", ""),
                "suggested_action": pd.get("suggested_action", ""),
                "priority": ai.get("priority_suggested", ""),
                "duration_est": ai.get("estimated_duration_hours", ""),
            })
        ctx["work_requests"] = wr_list

    # 4. Failure modes from FMEA
    if node:
        functions = db.query(FunctionModel).filter(
            FunctionModel.node_id == node.node_id
        ).limit(5).all()

        if functions:
            fm_list = []
            for fn in functions:
                ffs = db.query(FunctionalFailureModel).filter(
                    FunctionalFailureModel.function_id == fn.function_id
                ).limit(3).all()
                for ff in ffs:
                    modes = db.query(FailureModeModel).filter(
                        FailureModeModel.functional_failure_id == ff.failure_id
                    ).limit(3).all()
                    for fm in modes:
                        fm_list.append({
                            "mechanism": fm.mechanism,
                            "cause": fm.cause,
                            "consequence": fm.failure_consequence,
                            "strategy": fm.strategy_type,
                        })
            if fm_list:
                ctx["failure_modes"] = fm_list[:10]

    # 5. AI Feedback history
    try:
        from api.database.models import AIFeedbackModel
        feedbacks = db.query(AIFeedbackModel).filter(
            AIFeedbackModel.equipment_tag == tag
        ).order_by(AIFeedbackModel.created_at.desc()).limit(20).all()

        if feedbacks:
            corrections = []
            accuracy = {"total": 0, "positive": 0}
            for fb in feedbacks:
                accuracy["total"] += 1
                if fb.rating > 0:
                    accuracy["positive"] += 1
                if fb.rating < 0:
                    corrections.append({
                        "field": fb.field_name,
                        "predicted": fb.predicted_value,
                        "actual": fb.actual_value,
                    })
            ctx["ai_feedback"] = {
                "accuracy_pct": round(accuracy["positive"] / accuracy["total"] * 100) if accuracy["total"] else None,
                "total_feedbacks": accuracy["total"],
                "recent_corrections": corrections[:5],
            }
    except Exception:
        pass  # Table may not exist yet

    # 6. Past diagnostics
    diagnostics = db.query(TroubleshootingDiagnosticModel).filter(
        TroubleshootingDiagnosticModel.equipment_tag == tag
    ).order_by(TroubleshootingDiagnosticModel.created_at.desc()).limit(5).all()

    if diagnostics:
        ctx["diagnostics"] = [
            {"symptom": d.symptom_description, "resolved": d.resolved}
            for d in diagnostics
        ]

    return ctx


def format_context_for_prompt(ctx: dict) -> str:
    """Format context dict into a compact string for Claude prompt injection (~500 tokens)."""
    if not ctx:
        return ""

    lines = []
    tag = ctx.get("equipment_tag", "?")
    eq = ctx.get("equipment", {})

    # Header
    name = eq.get("name", tag)
    crit = eq.get("criticality", "?")
    parent = eq.get("parent", "")
    lines.append(f"## Equipo: {tag} ({name}) | Criticidad: {crit}")
    if parent:
        lines.append(f"Ubicacion: {parent}")

    # Work order history summary
    wos = ctx.get("work_orders", [])
    if wos:
        by_type = {}
        for wo in wos:
            t = wo.get("type", "?")
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(wo)
        parts = []
        for t, wlist in by_type.items():
            parts.append(f"{t}: {len(wlist)} ordenes")
        lines.append(f"## Historial OTs: {', '.join(parts)}")

    # Duration stats
    dur = ctx.get("duration_stats", {})
    if dur:
        for wtype, stats in dur.items():
            est = stats.get("avg_estimated", "?")
            act = stats.get("avg_actual", "?")
            lines.append(f"Duracion {wtype}: estimado avg {est}h, real avg {act}h")

    # Materials history
    mats = ctx.get("materials_history", [])
    if mats:
        mat_strs = [f"{m['description']} (x{m['total_used']})" for m in mats[:5]]
        lines.append(f"## Materiales frecuentes: {', '.join(mat_strs)}")

    # Failure modes
    fms = ctx.get("failure_modes", [])
    if fms:
        fm_strs = [f"{fm['mechanism']}: {fm['cause']}" for fm in fms[:5]]
        lines.append(f"## Modos de falla conocidos: {'; '.join(fm_strs)}")

    # Work requests history
    wrs = ctx.get("work_requests", [])
    if wrs:
        wr_strs = []
        for wr in wrs[:3]:
            desc = wr.get("description", "")[:80]
            action = wr.get("suggested_action", "")[:60]
            wr_strs.append(f"- {desc} -> {action} (P{wr.get('priority', '?')})")
        lines.append("## Avisos recientes:")
        lines.extend(wr_strs)

    # AI feedback / corrections
    fb = ctx.get("ai_feedback", {})
    if fb and fb.get("total_feedbacks", 0) > 0:
        acc = fb.get("accuracy_pct", "?")
        lines.append(f"## Precision IA: {acc}% ({fb['total_feedbacks']} evaluaciones)")
        corrections = fb.get("recent_corrections", [])
        if corrections:
            lines.append("Correcciones recientes:")
            for c in corrections[:3]:
                lines.append(f"- {c['field']}: IA dijo '{c['predicted']}', correcto era '{c['actual']}'")

    # Similar equipment
    siblings = ctx.get("similar_equipment", [])
    if siblings:
        lines.append(f"## Equipos similares: {', '.join(siblings[:5])}")

    return "\n".join(lines)


def get_validated_examples(db: Session, equipment_tag: str, limit: int = 5) -> str:
    """Get few-shot examples from validated WRs for the same or similar equipment."""
    from api.database.models import WorkRequestModel

    tag = (equipment_tag or "").upper().strip()

    # First try same equipment, then any validated WR
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.equipment_tag == tag,
        WorkRequestModel.status.in_(["VALIDATED", "APPROVED", "COMPLETED", "TECH_CLOSE"]),
    ).order_by(WorkRequestModel.created_at.desc()).limit(limit).all()

    if len(wrs) < 2:
        # Get more examples from any equipment
        more = db.query(WorkRequestModel).filter(
            WorkRequestModel.status.in_(["VALIDATED", "APPROVED", "COMPLETED", "TECH_CLOSE"]),
        ).order_by(WorkRequestModel.created_at.desc()).limit(limit).all()
        seen = {wr.request_id for wr in wrs}
        for wr in more:
            if wr.request_id not in seen:
                wrs.append(wr)
            if len(wrs) >= limit:
                break

    if not wrs:
        return ""

    examples = ["## Ejemplos de avisos clasificados correctamente:"]
    for wr in wrs:
        pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
        ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
        desc = pd.get("original_text", "")[:120]
        if not desc:
            continue
        examples.append(f"Descripcion: \"{desc}\"")
        examples.append(f"Clasificacion: categoria={pd.get('failure_mode_detected', '?')}, "
                       f"prioridad={ai.get('priority_suggested', '?')}, "
                       f"duracion={ai.get('estimated_duration_hours', '?')}h, "
                       f"accion=\"{pd.get('suggested_action', '?')[:80]}\"")
        examples.append("")

    return "\n".join(examples)
