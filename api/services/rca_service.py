"""RCA & Defect Elimination service — structured root cause analysis with GFSN methodology."""

from datetime import datetime, date

from sqlalchemy.orm import Session

from api.database.models import (
    RCAAnalysisModel, PlanningKPISnapshotModel, DEKPISnapshotModel,
)
from api.services.audit_service import log_action
from tools.engines.rca_engine import RCAEngine
from tools.engines.planning_kpi_engine import PlanningKPIEngine
from tools.engines.de_kpi_engine import DEKPIEngine
from tools.models.schemas import (
    RCALevel, RCAStatus, EvidenceType, Evidence5PCategory,
    Solution, PlanningKPIInput, DEKPIInput,
)


# ── RCA Analyses ──────────────────────────────────────────────────────

def create_rca(
    db: Session,
    event_description: str,
    plant_id: str,
    equipment_id: str | None = None,
    max_consequence: int = 3,
    frequency: int = 3,
    team_members: list[str] | None = None,
) -> dict:
    """Create a new RCA analysis with automatic event classification."""
    level, team_req = RCAEngine.classify_event(max_consequence, frequency)
    analysis = RCAEngine.create_analysis(
        event_description=event_description,
        plant_id=plant_id,
        equipment_id=equipment_id,
        level=level,
        team_members=team_members,
    )
    obj = RCAAnalysisModel(
        analysis_id=analysis.analysis_id,
        event_description=event_description,
        plant_id=plant_id,
        equipment_id=equipment_id,
        level=level.value,
        status=analysis.status.value,
        team_members=team_members or [],
        cause_effect=analysis.cause_effect.model_dump(mode="json"),
        evidence_5p=[],
        solutions=[],
    )
    db.add(obj)
    log_action(db, "rca", obj.analysis_id, "CREATE")
    db.commit()
    return {
        "analysis_id": analysis.analysis_id,
        "level": level.value,
        "team_requirements": team_req,
        "status": analysis.status.value,
    }


def get_rca(db: Session, analysis_id: str) -> dict | None:
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None
    return _rca_to_dict(obj)


def list_rcas(
    db: Session, plant_id: str | None = None, status: str | None = None,
) -> list[dict]:
    q = db.query(RCAAnalysisModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    if status:
        q = q.filter_by(status=status)
    return [_rca_to_dict(r) for r in q.order_by(RCAAnalysisModel.created_at.desc()).all()]


def update_rca(db: Session, analysis_id: str, data: dict) -> dict | None:
    """Update RCA analysis fields — event info, 5W2H, root causes, CAPA actions."""
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None

    if data.get("event_description") is not None:
        obj.event_description = data["event_description"]
    if data.get("equipment_id") is not None:
        obj.equipment_id = data["equipment_id"]
    if data.get("analysis_5w2h") is not None:
        obj.analysis_5w2h = data["analysis_5w2h"]
    if data.get("root_cause_levels") is not None:
        ce = obj.cause_effect or {}
        ce.update(data["root_cause_levels"])
        obj.cause_effect = ce
    if data.get("cause_effect") is not None:
        # Full overwrite: usado para Ishikawa branches 6M.
        obj.cause_effect = data["cause_effect"]
    if data.get("evidence_5p") is not None:
        obj.evidence_5p = data["evidence_5p"]
    if data.get("capa_actions") is not None:
        obj.solutions = data["capa_actions"]
    if data.get("team_members") is not None:
        obj.team_members = data["team_members"]

    log_action(db, "rca", analysis_id, "UPDATE")
    db.commit()
    return _rca_to_dict(obj)


def run_5w2h(db: Session, analysis_id: str, data: dict) -> dict | None:
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None
    # Auto-fill empty fields from the event description so pydantic min_length=1 passes
    desc = obj.event_description or "N/A"
    equip = obj.equipment_id or "N/A"
    result = RCAEngine.run_5w2h(
        what=data.get("what") or desc,
        when=data.get("when") or "To be determined",
        where=data.get("where") or equip,
        who=data.get("who") or "Maintenance team",
        why=data.get("why") or "Under investigation",
        how=data.get("how") or "To be determined",
        how_much=data.get("how_much") or "To be estimated",
    )
    five_w = result.model_dump(mode="json")
    obj.analysis_5w2h = five_w
    obj.status = RCAStatus.UNDER_INVESTIGATION.value
    log_action(db, "rca", analysis_id, "5W2H")
    db.commit()
    return {"analysis_id": analysis_id, "five_w_two_h": five_w, "5w2h": five_w}


def advance_rca_status(db: Session, analysis_id: str, target_status: str) -> dict | None:
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None

    # Map frontend stage names to valid RCAStatus values
    STATUS_MAP = {
        "IDENTIFIED": "OPEN",
        "PRIORITIZED": "UNDER_INVESTIGATION",
        "ANALYZING": "UNDER_INVESTIGATION",
        "IMPLEMENTING": "COMPLETED",
        "CONTROLLED": "REVIEWED",
    }
    mapped = STATUS_MAP.get(target_status, target_status)

    # If mapped status is the same as current, just advance to next in chain
    ADVANCE_CHAIN = {
        "OPEN": "UNDER_INVESTIGATION",
        "UNDER_INVESTIGATION": "COMPLETED",
        "COMPLETED": "REVIEWED",
    }
    if mapped == obj.status:
        mapped = ADVANCE_CHAIN.get(obj.status, mapped)

    try:
        target = RCAStatus(mapped)
    except ValueError:
        # If still invalid, just advance to next in chain
        target = RCAStatus(ADVANCE_CHAIN.get(obj.status, obj.status))

    analysis = _db_to_rca_analysis(obj)
    analysis, msg = RCAEngine.advance_status(analysis, target)
    obj.status = analysis.status.value
    if analysis.status == RCAStatus.COMPLETED:
        obj.completed_at = datetime.now()
    log_action(db, "rca", analysis_id, f"STATUS_{obj.status}")
    db.commit()
    return {"analysis_id": analysis_id, "status": obj.status, "message": msg}


def get_rca_summary(db: Session, plant_id: str | None = None) -> dict:
    q = db.query(RCAAnalysisModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    all_analyses = q.all()
    total = len(all_analyses)
    completed = [a for a in all_analyses if a.status in ("COMPLETED", "REVIEWED", "CONTROLLED", "CLOSED")]

    # Compute CAPA completion across all analyses
    total_capas = 0
    completed_capas = 0
    for a in all_analyses:
        for s in (a.solutions or []):
            if isinstance(s, dict):
                total_capas += 1
                if s.get("status") == "COMPLETED":
                    completed_capas += 1
    capa_pct = round(completed_capas / total_capas * 100) if total_capas else 0

    return {
        "total": total,
        "total_events": total,
        "open": len([a for a in all_analyses if a.status == "OPEN"]),
        "under_investigation": len([a for a in all_analyses if a.status == "UNDER_INVESTIGATION"]),
        "completed": len(completed),
        "reviewed": len([a for a in all_analyses if a.status == "REVIEWED"]),
        "avg_resolution_days": 0,
        "recurrence_rate": 0,
        "capa_completion": capa_pct,
        "by_level": {
            level.value: len([a for a in all_analyses if a.level == level.value])
            for level in RCALevel
        },
    }


def push_defect_to_fmeca(db: Session, analysis_id: str) -> dict | None:
    """Cierra el ciclo Defect Elimination → FMECA: cuando un RCA llega a COMPLETED
    o más, registra/actualiza el modo de falla en el FMECA worksheet del equipo
    como evidencia de mitigación (source=DEFECT_ELIMINATION).

    Idempotente: si ya existe una row con el mismo failure_mode + source_ref,
    no la duplica — sólo actualiza el RPN-after.
    """
    from api.database.models import FMECAWorksheetModel
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None
    if obj.status not in ("COMPLETED", "REVIEWED", "CONTROLLED", "CLOSED"):
        return {"analysis_id": analysis_id, "skipped": True, "reason": "RCA aún no completado"}
    if not obj.equipment_id:
        return {"analysis_id": analysis_id, "skipped": True, "reason": "RCA sin equipment_id"}

    # Failure mode = primer cause con score más alto, o event_description fallback
    cause_effect = obj.cause_effect or {}
    causes = cause_effect.get("causes") or []
    if isinstance(causes, list) and causes:
        primary = max(causes, key=lambda c: float(c.get("score", 0)) if isinstance(c, dict) else 0)
        fm_label = (primary.get("description") if isinstance(primary, dict) else None) or str(primary)
    else:
        fm_label = obj.event_description or "Modo de falla detectado"
    fm_label = str(fm_label)[:200]

    # Buscar/crear worksheet para el equipo
    ws = db.query(FMECAWorksheetModel).filter_by(equipment_id=obj.equipment_id).first()
    if not ws:
        ws = FMECAWorksheetModel(
            equipment_id=obj.equipment_id,
            equipment_tag=obj.equipment_id,
            equipment_name=obj.equipment_id,
            status="ACTIVE",
            current_stage="STAGE_5_RPN",
            rows=[],
            analyst="DEFECT_ELIMINATION",
        )
        db.add(ws)
        db.flush()

    rows = list(ws.rows or [])
    source_ref = f"RCA:{analysis_id}"
    # Idempotencia
    found_idx = next((i for i, r in enumerate(rows) if isinstance(r, dict) and r.get("source_ref") == source_ref), -1)
    n_solutions = len(obj.solutions or [])
    # RPN-before estimado: si no hay scoring previo, usar baseline 200 (medio-alto)
    # RPN-after estimado: si hay solutions, reducir 60% (mitigation factor)
    rpn_before = 200
    rpn_after = max(20, int(rpn_before * 0.4)) if n_solutions > 0 else rpn_before

    new_row = {
        "failure_mode": fm_label,
        "description": (obj.event_description or "")[:300],
        "source": "DEFECT_ELIMINATION",
        "source_ref": source_ref,
        "rpn_before": rpn_before,
        "rpn_after": rpn_after,
        "mitigation_count": n_solutions,
        "rca_status": obj.status,
        "updated_at": datetime.now().isoformat(),
    }
    if found_idx >= 0:
        rows[found_idx] = {**rows[found_idx], **new_row}
        action = "UPDATED"
    else:
        rows.append(new_row)
        action = "CREATED"
    ws.rows = rows
    log_action(db, "fmeca_worksheet", ws.worksheet_id, f"DE_LINK_{action}",
               {"rca_id": analysis_id, "failure_mode": fm_label, "rpn_before": rpn_before, "rpn_after": rpn_after})
    db.commit()
    return {
        "analysis_id": analysis_id,
        "worksheet_id": ws.worksheet_id,
        "action": action,
        "failure_mode": fm_label,
        "rpn_before": rpn_before,
        "rpn_after": rpn_after,
    }


def push_solutions_to_capa(db: Session, analysis_id: str) -> dict | None:
    """Crea ImprovementAction rows a partir de obj.solutions. Idempotente."""
    from api.database.models import ImprovementActionModel
    obj = db.query(RCAAnalysisModel).filter_by(analysis_id=analysis_id).first()
    if not obj:
        return None
    solutions = obj.solutions or []
    if not solutions:
        return {"analysis_id": analysis_id, "created": 0, "skipped": 0, "message": "El RCA no tiene solutions cargadas"}
    # Avoid dupes: check existing CAPAs tied to this RCA.
    existing = db.query(ImprovementActionModel).filter(
        ImprovementActionModel.source_type == "RCA",
        ImprovementActionModel.source_ref == analysis_id,
    ).all()
    existing_titles = {(a.title or "").strip().lower() for a in existing}
    created = []
    skipped = 0
    for s in solutions:
        if not isinstance(s, dict):
            continue
        title = (s.get("description") or s.get("title") or "").strip()
        if not title:
            continue
        if title.lower() in existing_titles:
            skipped += 1
            continue
        sol_type = (s.get("type") or s.get("solution_type") or "CORRECTIVE").upper()
        if sol_type not in ("CORRECTIVE", "PREVENTIVE", "IMPROVEMENT"):
            sol_type = "CORRECTIVE"
        action = ImprovementActionModel(
            title=title[:300],
            description=s.get("notes") or s.get("description") or "",
            plant_id=obj.plant_id or "",
            equipment_id=obj.equipment_id,
            equipment_tag=s.get("equipment_tag") or "",
            source_type="RCA",
            source_ref=analysis_id,
            action_type=sol_type,
            priority=(s.get("priority") or "MEDIUM").upper(),
            category=s.get("category") or "RCA",
            assigned_to=s.get("responsible") or "",
            status="OPEN",
            ai_generated=bool(s.get("ai_generated")),
        )
        db.add(action)
        created.append(title)
    if created:
        log_action(db, "rca", analysis_id, "PUSH_TO_CAPA", {"count": len(created)})
        db.commit()
    return {"analysis_id": analysis_id, "created": len(created), "skipped": skipped, "titles": created}


def _rca_to_dict(obj: RCAAnalysisModel) -> dict:
    cause_effect = obj.cause_effect or {}
    return {
        "analysis_id": obj.analysis_id,
        "event_description": obj.event_description,
        "plant_id": obj.plant_id,
        "equipment_id": obj.equipment_id,
        "level": obj.level,
        "status": obj.status,
        "team_members": obj.team_members or [],
        "analysis_5w2h": obj.analysis_5w2h,
        "five_w_two_h": obj.analysis_5w2h,  # alias for frontend
        "cause_effect": cause_effect,
        "root_cause_levels": {
            "physical_cause": cause_effect.get("physical_cause", ""),
            "human_cause": cause_effect.get("human_cause", ""),
            "latent_cause": cause_effect.get("latent_cause", ""),
        },
        "evidence_5p": obj.evidence_5p or [],
        "solutions": obj.solutions or [],
        "capa_actions": [
            {
                "description": s.get("description", ""),
                "type": s.get("type", s.get("solution_type", "")),
                "responsible": s.get("responsible", ""),
                "due_date": s.get("due_date", ""),
                "status": s.get("status", "PENDING"),
            }
            for s in (obj.solutions or []) if isinstance(s, dict)
        ],
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "completed_at": obj.completed_at.isoformat() if obj.completed_at else None,
    }


def _db_to_rca_analysis(obj: RCAAnalysisModel):
    from tools.models.schemas import RCAAnalysis, CauseEffectDiagram
    return RCAAnalysis(
        analysis_id=obj.analysis_id,
        event_description=obj.event_description,
        plant_id=obj.plant_id,
        equipment_id=obj.equipment_id,
        level=RCALevel(obj.level),
        status=RCAStatus(obj.status),
        team_members=obj.team_members or [],
    )


# ── Planning KPIs ─────────────────────────────────────────────────────

def calculate_planning_kpis(db: Session, data: dict) -> dict:
    """Calculate 11 planning KPIs and persist snapshot."""
    inp = PlanningKPIInput(**data)
    result = PlanningKPIEngine.calculate(inp)

    obj = PlanningKPISnapshotModel(
        plant_id=result.plant_id,
        period_start=result.period_start,
        period_end=result.period_end,
        kpis=[k.model_dump(mode="json") for k in result.kpis],
        overall_health=result.overall_health,
        on_target_count=result.on_target_count,
        below_target_count=result.below_target_count,
    )
    db.add(obj)
    log_action(db, "planning_kpi", obj.snapshot_id, "CALCULATE")
    db.commit()
    return result.model_dump(mode="json")


def list_planning_kpi_snapshots(
    db: Session, plant_id: str | None = None,
) -> list[dict]:
    q = db.query(PlanningKPISnapshotModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    return [
        {
            "snapshot_id": s.snapshot_id,
            "plant_id": s.plant_id,
            "period_start": s.period_start.isoformat(),
            "period_end": s.period_end.isoformat(),
            "overall_health": s.overall_health,
            "on_target_count": s.on_target_count,
            "below_target_count": s.below_target_count,
            "calculated_at": s.calculated_at.isoformat() if s.calculated_at else None,
        }
        for s in q.order_by(PlanningKPISnapshotModel.calculated_at.desc()).all()
    ]


# ── DE KPIs ───────────────────────────────────────────────────────────

def calculate_de_kpis(db: Session, data: dict) -> dict:
    """Calculate 5 DE KPIs with program health assessment."""
    inp = DEKPIInput(**data)
    result = DEKPIEngine.calculate(inp)
    health = DEKPIEngine.assess_program_health(inp.plant_id, result)

    obj = DEKPISnapshotModel(
        plant_id=inp.plant_id,
        period_start=inp.period_start,
        period_end=inp.period_end,
        kpis=[k.model_dump(mode="json") for k in result.kpis],
        overall_compliance=result.overall_compliance,
        program_score=health.program_score,
        maturity_level=health.maturity_level,
    )
    db.add(obj)
    log_action(db, "de_kpi", obj.snapshot_id, "CALCULATE")
    db.commit()
    return {
        "kpis": result.model_dump(mode="json"),
        "health": health.model_dump(mode="json"),
    }


def list_de_kpi_snapshots(
    db: Session, plant_id: str | None = None,
) -> list[dict]:
    q = db.query(DEKPISnapshotModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    return [
        {
            "snapshot_id": s.snapshot_id,
            "plant_id": s.plant_id,
            "period_start": s.period_start.isoformat(),
            "period_end": s.period_end.isoformat(),
            "overall_compliance": s.overall_compliance,
            "maturity_level": s.maturity_level,
            "program_score": s.program_score,
            "calculated_at": s.calculated_at.isoformat() if s.calculated_at else None,
        }
        for s in q.order_by(DEKPISnapshotModel.calculated_at.desc()).all()
    ]
