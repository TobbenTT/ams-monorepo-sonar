"""Agentic base service — reusable execution tracking for all agentic solutions."""

import logging
from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import AgenticExecutionModel

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _to_dict(execution: AgenticExecutionModel) -> dict:
    """Convert an AgenticExecutionModel instance to a plain dict."""
    return {
        "execution_id": execution.execution_id,
        "solution_type": execution.solution_type,
        "triggered_by": execution.triggered_by,
        "plant_id": execution.plant_id,
        "status": execution.status,
        "input_params": execution.input_params,
        "output_result": execution.output_result,
        "duration_ms": execution.duration_ms,
        "error_message": execution.error_message,
        "created_at": execution.created_at.isoformat() if execution.created_at else None,
        "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
    }


# ---------------------------------------------------------------------------
# Core CRUD
# ---------------------------------------------------------------------------

def start_execution(
    db: Session,
    solution_type: str,
    triggered_by: str,
    plant_id: str,
    input_params: dict | None = None,
) -> str:
    """Create a new RUNNING execution record and return its execution_id."""
    record = AgenticExecutionModel(
        solution_type=solution_type,
        triggered_by=triggered_by,
        plant_id=plant_id,
        status="RUNNING",
        input_params=input_params,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    log.info("Execution %s started (%s)", record.execution_id, solution_type)
    return record.execution_id


def complete_execution(
    db: Session,
    execution_id: str,
    result: dict,
) -> dict | None:
    """Mark an execution as COMPLETED with the given result."""
    record = db.query(AgenticExecutionModel).filter_by(execution_id=execution_id).first()
    if not record:
        log.warning("complete_execution: execution %s not found", execution_id)
        return None

    now = datetime.now()
    record.status = "COMPLETED"
    record.output_result = result
    record.completed_at = now
    record.duration_ms = int((now - record.created_at).total_seconds() * 1000)
    db.commit()
    db.refresh(record)
    log.info("Execution %s completed (%d ms)", execution_id, record.duration_ms)
    return _to_dict(record)


def fail_execution(
    db: Session,
    execution_id: str,
    error: str,
) -> dict | None:
    """Mark an execution as FAILED with the given error message."""
    record = db.query(AgenticExecutionModel).filter_by(execution_id=execution_id).first()
    if not record:
        log.warning("fail_execution: execution %s not found", execution_id)
        return None

    now = datetime.now()
    record.status = "FAILED"
    record.error_message = error
    record.completed_at = now
    record.duration_ms = int((now - record.created_at).total_seconds() * 1000)
    db.commit()
    db.refresh(record)
    log.warning("Execution %s failed (%s)", execution_id, error)
    return _to_dict(record)


def get_execution(db: Session, execution_id: str) -> dict | None:
    """Return a single execution record as dict, or None if not found."""
    record = db.query(AgenticExecutionModel).filter_by(execution_id=execution_id).first()
    if not record:
        return None
    return _to_dict(record)


def list_executions(
    db: Session,
    solution_type: str | None = None,
    plant_id: str | None = None,
    limit: int = 50,
) -> list[dict]:
    """Return execution records with optional filters, ordered by created_at desc."""
    query = db.query(AgenticExecutionModel)
    if solution_type:
        query = query.filter(AgenticExecutionModel.solution_type == solution_type)
    if plant_id:
        query = query.filter(AgenticExecutionModel.plant_id == plant_id)
    query = query.order_by(AgenticExecutionModel.created_at.desc()).limit(limit)
    return [_to_dict(r) for r in query.all()]


# ---------------------------------------------------------------------------
# High-level wrapper
# ---------------------------------------------------------------------------

def execute_solution(
    db: Session,
    solution_type: str,
    triggered_by: str,
    plant_id: str,
    input_params: dict | None,
    fn,
):
    """Execute an agentic solution with automatic tracking.

    fn: callable(db, execution_id, input_params) -> dict (result)

    On success the execution is marked COMPLETED and the merged result is
    returned.  On exception the execution is marked FAILED and the exception
    is re-raised so callers can handle it.
    """
    execution_id = start_execution(db, solution_type, triggered_by, plant_id, input_params)
    try:
        result = fn(db, execution_id, input_params)
        complete_execution(db, execution_id, result)
        return {"execution_id": execution_id, **result}
    except Exception as e:
        fail_execution(db, execution_id, str(e))
        raise
