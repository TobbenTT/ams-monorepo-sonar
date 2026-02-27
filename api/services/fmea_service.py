"""FMEA service — failure modes, RCM decisions, FM validation."""

from sqlalchemy.orm import Session

from api.database.models import FunctionModel, FunctionalFailureModel, FailureModeModel
from api.services.audit_service import log_action
from tools.engines.rcm_decision_engine import RCMDecisionEngine, RCMDecisionInput
from tools.models.schemas import VALID_FM_COMBINATIONS, Mechanism, Cause


def create_function(db: Session, node_id: str, function_type: str, description: str, description_fr: str = "") -> FunctionModel:
    obj = FunctionModel(node_id=node_id, function_type=function_type, description=description, description_fr=description_fr)
    db.add(obj)
    log_action(db, "function", obj.function_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def create_functional_failure(db: Session, function_id: str, failure_type: str, description: str, description_fr: str = "") -> FunctionalFailureModel:
    obj = FunctionalFailureModel(function_id=function_id, failure_type=failure_type, description=description, description_fr=description_fr)
    db.add(obj)
    log_action(db, "functional_failure", obj.failure_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def validate_fm_combination(mechanism: str, cause: str) -> dict:
    try:
        m = Mechanism(mechanism)
        c = Cause(cause)
    except ValueError as e:
        return {"valid": False, "error": str(e)}
    combo = (m, c)
    valid = combo in VALID_FM_COMBINATIONS
    return {"valid": valid, "mechanism": mechanism, "cause": cause}


def get_valid_combinations(mechanism: str | None = None) -> dict:
    if mechanism:
        try:
            m = Mechanism(mechanism)
        except ValueError as e:
            return {"error": str(e)}
        causes = sorted({c.value for mech, c in VALID_FM_COMBINATIONS if mech == m})
        return {"mechanism": mechanism, "causes": causes, "count": len(causes)}
    return {
        "mechanisms": sorted({m.value for m, _ in VALID_FM_COMBINATIONS}),
        "total_combinations": len(VALID_FM_COMBINATIONS),
    }


def list_functions(db: Session, node_id: str | None = None) -> list[FunctionModel]:
    q = db.query(FunctionModel)
    if node_id:
        from api.services.hierarchy_service import get_subtree
        subtree = get_subtree(db, node_id)
        if subtree:
            node_ids = [n.node_id for n in subtree]
            q = q.filter(FunctionModel.node_id.in_(node_ids))
        else:
            q = q.filter(FunctionModel.node_id == node_id)
    return q.all()


def list_functional_failures(db: Session, function_id: str | None = None) -> list[FunctionalFailureModel]:
    q = db.query(FunctionalFailureModel)
    if function_id:
        q = q.filter(FunctionalFailureModel.function_id == function_id)
    return q.all()


def create_failure_mode(db: Session, data: dict) -> FailureModeModel:
    # Validate FM combination before persisting
    validation = validate_fm_combination(data["mechanism"], data["cause"])
    if not validation["valid"]:
        raise ValueError(f"Invalid FM combination: {data['mechanism']} + {data['cause']}")

    obj = FailureModeModel(**data)
    db.add(obj)
    log_action(db, "failure_mode", obj.failure_mode_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def get_failure_mode(db: Session, fm_id: str) -> FailureModeModel | None:
    return db.query(FailureModeModel).filter(FailureModeModel.failure_mode_id == fm_id).first()


def list_failure_modes(db: Session, functional_failure_id: str | None = None) -> list[FailureModeModel]:
    q = db.query(FailureModeModel)
    if functional_failure_id:
        q = q.filter(FailureModeModel.functional_failure_id == functional_failure_id)
    return q.all()


def rcm_decide(data: dict) -> dict:
    input_obj = RCMDecisionInput(**data)
    result = RCMDecisionEngine.decide(input_obj)
    return {
        "strategy_type": result.strategy_type.value,
        "path": result.path.value,
        "requires_secondary_task": result.requires_secondary_task,
        "reasoning": result.reasoning,
    }


# ── Phase 7: FMECA Worksheet Service Functions ──────────────────────

from api.database.models import FMECAWorksheetModel
from tools.engines.fmeca_engine import FMECAEngine
from tools.models.schemas import FMECAWorksheet


def create_fmeca_worksheet(db: Session, data: dict) -> dict:
    ws = FMECAEngine.create_worksheet(
        equipment_id=data["equipment_id"],
        equipment_tag=data.get("equipment_tag", ""),
        equipment_name=data.get("equipment_name", ""),
        analyst=data.get("analyst", ""),
    )
    obj = FMECAWorksheetModel(
        worksheet_id=ws.worksheet_id,
        equipment_id=ws.equipment_id,
        equipment_tag=ws.equipment_tag,
        equipment_name=ws.equipment_name,
        status=ws.status.value,
        current_stage=ws.current_stage.value,
        rows=[],
        stage_completion=ws.stage_completion,
        analyst=ws.analyst,
    )
    db.add(obj)
    log_action(db, "fmeca_worksheet", obj.worksheet_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return {
        "worksheet_id": obj.worksheet_id,
        "equipment_id": obj.equipment_id,
        "status": obj.status,
        "current_stage": obj.current_stage,
    }


def get_fmeca_worksheet(db: Session, worksheet_id: str) -> dict | None:
    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return None
    return {
        "worksheet_id": obj.worksheet_id,
        "equipment_id": obj.equipment_id,
        "equipment_tag": obj.equipment_tag,
        "equipment_name": obj.equipment_name,
        "status": obj.status,
        "current_stage": obj.current_stage,
        "rows": obj.rows or [],
        "stage_completion": obj.stage_completion or {},
        "analyst": obj.analyst,
        "created_at": str(obj.created_at),
        "completed_at": str(obj.completed_at) if obj.completed_at else None,
    }


def calculate_rpn_service(severity: int, occurrence: int, detection: int) -> dict:
    result = FMECAEngine.calculate_rpn(severity, occurrence, detection)
    return result.model_dump()


def run_fmeca_decisions(db: Session, worksheet_id: str) -> dict:
    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return {"error": "Worksheet not found"}

    ws = FMECAWorksheet(
        worksheet_id=obj.worksheet_id,
        equipment_id=obj.equipment_id,
        status=obj.status,
        current_stage=obj.current_stage,
        rows=obj.rows or [],
        stage_completion=obj.stage_completion or {},
    )
    ws = FMECAEngine.run_stage_4_decisions(ws)

    obj.rows = [r.model_dump() for r in ws.rows]
    obj.stage_completion = ws.stage_completion
    log_action(db, "fmeca_worksheet", obj.worksheet_id, "UPDATE", {"action": "run_decisions"})
    db.commit()
    return {"worksheet_id": obj.worksheet_id, "rows_processed": len(ws.rows)}


def get_fmeca_summary(db: Session, worksheet_id: str) -> dict:
    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return {"error": "Worksheet not found"}

    ws = FMECAWorksheet(
        worksheet_id=obj.worksheet_id,
        equipment_id=obj.equipment_id,
        status=obj.status,
        current_stage=obj.current_stage,
        rows=obj.rows or [],
        stage_completion=obj.stage_completion or {},
    )
    summary = FMECAEngine.generate_summary(ws)
    return summary.model_dump()
