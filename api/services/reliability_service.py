"""Reliability service — spare parts, shutdowns, MoC, OCR, Jack-Knife, Pareto, LCC, RBI."""

from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import (
    ShutdownEventModel, MoCRequestModel,
    SparePartAnalysisModel, RBIAssessmentModel,
)
from api.services.audit_service import log_action
from tools.engines.spare_parts_engine import SparePartsEngine
from tools.engines.shutdown_engine import ShutdownEngine
from tools.engines.moc_engine import MoCEngine
from tools.engines.ocr_engine import OCREngine
from tools.engines.jackknife_engine import JackKnifeEngine
from tools.engines.pareto_engine import ParetoEngine
from tools.engines.lcc_engine import LCCEngine
from tools.engines.rbi_engine import RBIEngine
from tools.models.schemas import (
    ShutdownEvent, ShutdownStatus,
    MoCRequest, MoCStatus, MoCCategory, RiskLevel,
    OCRAnalysisInput, LCCInput, DamageMechanism,
)


# ── Spare Parts ──────────────────────────────────────────────────────

def analyze_spare_parts(db: Session, plant_id: str, parts: list[dict]) -> dict:
    result = SparePartsEngine.optimize_inventory(plant_id, parts)
    obj = SparePartAnalysisModel(
        plant_id=plant_id,
        total_parts=result.total_parts,
        results=[r.model_dump(mode="json") for r in result.results],
        total_inventory_value=result.total_inventory_value,
        recommended_reduction_pct=result.recommended_reduction_pct,
    )
    db.add(obj)
    log_action(db, "spare_parts", obj.analysis_id, "ANALYZE")
    db.commit()
    return result.model_dump(mode="json")


# ── Shutdowns ────────────────────────────────────────────────────────

def create_shutdown(
    db: Session, plant_id: str, name: str,
    planned_start: str, planned_end: str, work_orders: list[str],
) -> dict:
    ps = datetime.fromisoformat(planned_start)
    pe = datetime.fromisoformat(planned_end)
    event = ShutdownEngine.create_shutdown(plant_id, name, ps, pe, work_orders)

    obj = ShutdownEventModel(
        shutdown_id=event.shutdown_id,
        plant_id=plant_id, name=name, status=event.status.value,
        planned_start=ps, planned_end=pe,
        planned_hours=event.planned_hours,
        work_orders=work_orders,
    )
    db.add(obj)
    log_action(db, "shutdown", obj.shutdown_id, "CREATE")
    db.commit()
    return event.model_dump(mode="json")


def get_shutdown(db: Session, shutdown_id: str) -> dict | None:
    obj = db.query(ShutdownEventModel).filter_by(shutdown_id=shutdown_id).first()
    if not obj:
        return None
    return {
        "shutdown_id": obj.shutdown_id, "plant_id": obj.plant_id,
        "name": obj.name, "status": obj.status,
        "planned_start": obj.planned_start.isoformat() if obj.planned_start else None,
        "planned_end": obj.planned_end.isoformat() if obj.planned_end else None,
        "actual_start": obj.actual_start.isoformat() if obj.actual_start else None,
        "actual_end": obj.actual_end.isoformat() if obj.actual_end else None,
        "planned_hours": obj.planned_hours, "actual_hours": obj.actual_hours,
        "work_orders": obj.work_orders or [],
        "completed_work_orders": obj.completed_work_orders or [],
        "completion_pct": obj.completion_pct,
        "delay_hours": obj.delay_hours,
        "delay_reasons": obj.delay_reasons or [],
    }


def start_shutdown(db: Session, shutdown_id: str) -> dict | None:
    obj = db.query(ShutdownEventModel).filter_by(shutdown_id=shutdown_id).first()
    if not obj:
        return None
    event = _db_to_shutdown_event(obj)
    event, msg = ShutdownEngine.start_shutdown(event)
    obj.status = event.status.value
    obj.actual_start = event.actual_start
    log_action(db, "shutdown", shutdown_id, "START")
    db.commit()
    return {"shutdown_id": shutdown_id, "status": obj.status, "message": msg}


def complete_shutdown(db: Session, shutdown_id: str) -> dict | None:
    obj = db.query(ShutdownEventModel).filter_by(shutdown_id=shutdown_id).first()
    if not obj:
        return None
    event = _db_to_shutdown_event(obj)
    event, msg = ShutdownEngine.complete_shutdown(event)
    obj.status = event.status.value
    obj.actual_end = event.actual_end
    obj.actual_hours = event.actual_hours
    obj.completion_pct = event.completion_pct
    log_action(db, "shutdown", shutdown_id, "COMPLETE")
    db.commit()
    return {"shutdown_id": shutdown_id, "status": obj.status, "message": msg}


def _db_to_shutdown_event(obj: ShutdownEventModel) -> ShutdownEvent:
    return ShutdownEvent(
        shutdown_id=obj.shutdown_id, plant_id=obj.plant_id, name=obj.name,
        status=ShutdownStatus(obj.status),
        planned_start=obj.planned_start, planned_end=obj.planned_end,
        actual_start=obj.actual_start, actual_end=obj.actual_end,
        planned_hours=obj.planned_hours, actual_hours=obj.actual_hours,
        work_orders=obj.work_orders or [],
        completed_work_orders=obj.completed_work_orders or [],
        completion_pct=obj.completion_pct,
        delay_hours=obj.delay_hours, delay_reasons=obj.delay_reasons or [],
    )


# ── MoC ──────────────────────────────────────────────────────────────

def create_moc(
    db: Session, plant_id: str, title: str, description: str,
    category: str, requester_id: str,
    affected_equipment: list[str] | None = None,
    risk_level: str = "LOW",
) -> dict:
    moc = MoCEngine.create_moc(
        plant_id, title, description,
        MoCCategory(category), requester_id,
        affected_equipment, risk_level=RiskLevel(risk_level),
    )
    obj = MoCRequestModel(
        moc_id=moc.moc_id, plant_id=plant_id, title=title,
        description=description, category=category, status=moc.status.value,
        risk_level=risk_level, requester_id=requester_id,
        affected_equipment=affected_equipment or [],
    )
    db.add(obj)
    log_action(db, "moc", obj.moc_id, "CREATE")
    db.commit()
    return moc.model_dump(mode="json")


def get_moc(db: Session, moc_id: str) -> dict | None:
    obj = db.query(MoCRequestModel).filter_by(moc_id=moc_id).first()
    if not obj:
        return None
    return {
        "moc_id": obj.moc_id, "plant_id": obj.plant_id,
        "title": obj.title, "description": obj.description,
        "category": obj.category, "status": obj.status,
        "risk_level": obj.risk_level,
        "requester_id": obj.requester_id,
        "reviewer_id": obj.reviewer_id,
        "approver_id": obj.approver_id,
        "affected_equipment": obj.affected_equipment or [],
        "affected_procedures": obj.affected_procedures or [],
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
    }


def list_mocs(db: Session, plant_id: str | None = None, status: str | None = None) -> list[dict]:
    q = db.query(MoCRequestModel)
    if plant_id:
        q = q.filter_by(plant_id=plant_id)
    if status:
        q = q.filter_by(status=status)
    return [
        {"moc_id": m.moc_id, "title": m.title, "status": m.status, "category": m.category}
        for m in q.all()
    ]


def advance_moc(db: Session, moc_id: str, action: str, **kwargs) -> dict | None:
    obj = db.query(MoCRequestModel).filter_by(moc_id=moc_id).first()
    if not obj:
        return None

    moc = MoCRequest(
        moc_id=obj.moc_id, plant_id=obj.plant_id, title=obj.title,
        description=obj.description, category=MoCCategory(obj.category),
        status=MoCStatus(obj.status), risk_level=RiskLevel(obj.risk_level),
        requester_id=obj.requester_id, reviewer_id=obj.reviewer_id,
        approver_id=obj.approver_id,
        affected_equipment=obj.affected_equipment or [],
    )

    actions = {
        "submit": lambda: MoCEngine.submit_moc(moc),
        "review": lambda: MoCEngine.start_review(moc, kwargs.get("reviewer_id", "")),
        "approve": lambda: MoCEngine.approve_moc(moc, kwargs.get("approver_id", "")),
        "reject": lambda: MoCEngine.reject_moc(moc, kwargs.get("reason", "")),
        "implement": lambda: MoCEngine.start_implementation(moc),
        "close": lambda: MoCEngine.close_moc(moc),
        "resubmit": lambda: MoCEngine.resubmit_moc(moc),
    }

    handler = actions.get(action.lower())
    if not handler:
        return {"moc_id": moc_id, "error": f"Unknown action: {action}"}

    moc, msg = handler()
    obj.status = moc.status.value
    obj.reviewer_id = moc.reviewer_id
    obj.approver_id = moc.approver_id
    obj.submitted_at = moc.submitted_at
    obj.approved_at = moc.approved_at
    obj.closed_at = moc.closed_at
    log_action(db, "moc", moc_id, action.upper())
    db.commit()
    return {"moc_id": moc_id, "status": obj.status, "message": msg}


# ── OCR ──────────────────────────────────────────────────────────────

def calculate_ocr(db: Session, data: dict) -> dict:
    inp = OCRAnalysisInput(**data)
    result = OCREngine.calculate_optimal_interval(inp)
    return result.model_dump(mode="json")


# ── Jack-Knife ───────────────────────────────────────────────────────

def analyze_jackknife(db: Session, plant_id: str, equipment_data: list[dict]) -> dict:
    result = JackKnifeEngine.analyze(plant_id, equipment_data)
    return result.model_dump(mode="json")


# ── Pareto ───────────────────────────────────────────────────────────

def analyze_pareto(db: Session, plant_id: str, metric_type: str, records: list[dict]) -> dict:
    if metric_type == "failures":
        result = ParetoEngine.analyze_failures(plant_id, records)
    elif metric_type == "cost":
        result = ParetoEngine.analyze_costs(plant_id, records)
    elif metric_type == "downtime":
        result = ParetoEngine.analyze_downtime(plant_id, records)
    else:
        result = ParetoEngine.analyze(plant_id, records, metric_field=metric_type, metric_type=metric_type)
    return result.model_dump(mode="json")


# ── LCC ──────────────────────────────────────────────────────────────

def calculate_lcc(db: Session, data: dict) -> dict:
    inp = LCCInput(**data)
    result = LCCEngine.calculate(inp)
    return result.model_dump(mode="json")


# ── RBI ──────────────────────────────────────────────────────────────

def assess_rbi(db: Session, plant_id: str, equipment_list: list[dict]) -> dict:
    result = RBIEngine.batch_assess(plant_id, equipment_list)
    obj = RBIAssessmentModel(
        plant_id=plant_id,
        total_equipment=result.total_equipment,
        assessments=[a.model_dump(mode="json") for a in result.assessments],
        high_risk_count=result.high_risk_count,
        overdue_count=result.overdue_count,
    )
    db.add(obj)
    log_action(db, "rbi", obj.assessment_id, "ASSESS")
    db.commit()
    return result.model_dump(mode="json")
