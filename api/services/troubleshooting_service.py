"""Troubleshooting service — bridges API router to TroubleshootingEngine + DB persistence."""

import json
from datetime import datetime

from sqlalchemy.orm import Session

from api.database.models import TroubleshootingSessionModel
from api.services.audit_service import log_action
from tools.engines.troubleshooting_engine import TroubleshootingEngine
from tools.models.schemas import DiagnosisSession, DiagnosisStatus


def _session_to_dict(obj: TroubleshootingSessionModel) -> dict:
    """Convert DB model to API response dict."""
    return {
        "session_id": obj.session_id,
        "equipment_type_id": obj.equipment_type_id,
        "equipment_tag": obj.equipment_tag,
        "plant_id": obj.plant_id,
        "status": obj.status,
        "symptoms": json.loads(obj.symptoms) if obj.symptoms else [],
        "tests_performed": json.loads(obj.tests_performed) if obj.tests_performed else [],
        "candidate_diagnoses": json.loads(obj.candidate_diagnoses) if obj.candidate_diagnoses else [],
        "final_fm_code": obj.final_fm_code,
        "final_mechanism": obj.final_mechanism,
        "final_cause": obj.final_cause,
        "final_confidence": obj.final_confidence,
        "actual_cause_feedback": obj.actual_cause_feedback,
        "technician_id": obj.technician_id,
        "notes": obj.notes,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "completed_at": obj.completed_at.isoformat() if obj.completed_at else None,
    }


def _pydantic_to_db(session: DiagnosisSession) -> TroubleshootingSessionModel:
    """Convert Pydantic model to DB model."""
    final = session.final_diagnosis
    return TroubleshootingSessionModel(
        session_id=session.session_id,
        equipment_type_id=session.equipment_type_id,
        equipment_tag=session.equipment_tag,
        plant_id=session.plant_id,
        status=session.status.value,
        symptoms=json.dumps([s.model_dump(mode="json") for s in session.symptoms], default=str),
        tests_performed=json.dumps(session.tests_performed, default=str),
        candidate_diagnoses=json.dumps(
            [c.model_dump(mode="json") for c in session.candidate_diagnoses], default=str
        ),
        final_fm_code=final.fm_code if final else None,
        final_mechanism=final.mechanism if final else None,
        final_cause=final.cause if final else None,
        final_confidence=final.confidence if final else None,
        actual_cause_feedback=session.actual_cause_feedback,
        technician_id=session.technician_id,
        notes=session.notes,
        created_at=session.created_at,
        completed_at=session.completed_at,
    )


def _update_db(db: Session, session: DiagnosisSession) -> None:
    """Upsert session state to DB."""
    obj = db.query(TroubleshootingSessionModel).filter_by(
        session_id=session.session_id
    ).first()
    final = session.final_diagnosis
    if obj:
        obj.status = session.status.value
        obj.symptoms = json.dumps([s.model_dump(mode="json") for s in session.symptoms], default=str)
        obj.tests_performed = json.dumps(session.tests_performed, default=str)
        obj.candidate_diagnoses = json.dumps(
            [c.model_dump(mode="json") for c in session.candidate_diagnoses], default=str
        )
        obj.final_fm_code = final.fm_code if final else None
        obj.final_mechanism = final.mechanism if final else None
        obj.final_cause = final.cause if final else None
        obj.final_confidence = final.confidence if final else None
        obj.actual_cause_feedback = session.actual_cause_feedback
        obj.notes = session.notes
        obj.completed_at = session.completed_at
    else:
        db.add(_pydantic_to_db(session))
    db.commit()


# ── Public API ──────────────────────────────────────────────────────────

def create_session(
    db: Session,
    equipment_type_id: str,
    equipment_tag: str = "",
    plant_id: str = "",
    technician_id: str = "",
) -> dict:
    session = TroubleshootingEngine.create_session(
        equipment_type_id=equipment_type_id,
        equipment_tag=equipment_tag,
        plant_id=plant_id,
        technician_id=technician_id,
    )
    db.add(_pydantic_to_db(session))
    log_action(db, "troubleshooting", session.session_id, "CREATE")
    db.commit()
    return session.model_dump(mode="json")


def get_session(db: Session, session_id: str) -> dict | None:
    obj = db.query(TroubleshootingSessionModel).filter_by(session_id=session_id).first()
    if not obj:
        return None
    return _session_to_dict(obj)


def add_symptom(
    db: Session,
    session_id: str,
    description: str,
    category: str = "",
    severity: str = "MEDIUM",
) -> dict | None:
    obj = db.query(TroubleshootingSessionModel).filter_by(session_id=session_id).first()
    if not obj:
        return None
    # Reconstruct Pydantic session from DB
    session = DiagnosisSession(
        session_id=obj.session_id,
        equipment_type_id=obj.equipment_type_id,
        equipment_tag=obj.equipment_tag,
        plant_id=obj.plant_id,
        status=DiagnosisStatus(obj.status),
        technician_id=obj.technician_id or "",
        notes=obj.notes or "",
    )
    # Re-add existing symptoms
    existing_symptoms = json.loads(obj.symptoms) if obj.symptoms else []
    from tools.models.schemas import SymptomEntry
    session.symptoms = [SymptomEntry.model_validate(s) for s in existing_symptoms]
    session.tests_performed = json.loads(obj.tests_performed) if obj.tests_performed else []

    updated = TroubleshootingEngine.add_symptom(session, description, category, severity)
    _update_db(db, updated)
    log_action(db, "troubleshooting", session_id, "ADD_SYMPTOM")
    db.commit()
    return updated.model_dump(mode="json")


def record_test_result(
    db: Session,
    session_id: str,
    test_id: str,
    result: str,
    measured_value: str = "",
) -> dict | None:
    obj = db.query(TroubleshootingSessionModel).filter_by(session_id=session_id).first()
    if not obj:
        return None
    session = _reconstruct_session(obj)
    updated = TroubleshootingEngine.record_test_result(session, test_id, result, measured_value)
    _update_db(db, updated)
    log_action(db, "troubleshooting", session_id, "RECORD_TEST")
    db.commit()
    return updated.model_dump(mode="json")


def finalize_diagnosis(
    db: Session,
    session_id: str,
    selected_fm_code: str,
) -> dict | None:
    obj = db.query(TroubleshootingSessionModel).filter_by(session_id=session_id).first()
    if not obj:
        return None
    session = _reconstruct_session(obj)
    updated = TroubleshootingEngine.finalize_diagnosis(session, selected_fm_code)
    _update_db(db, updated)
    log_action(db, "troubleshooting", session_id, "FINALIZE")
    db.commit()
    return updated.model_dump(mode="json")


def record_feedback(
    db: Session,
    session_id: str,
    actual_cause: str,
    notes: str = "",
) -> dict | None:
    obj = db.query(TroubleshootingSessionModel).filter_by(session_id=session_id).first()
    if not obj:
        return None
    session = _reconstruct_session(obj)
    updated = TroubleshootingEngine.record_feedback(session, actual_cause, notes)
    _update_db(db, updated)
    log_action(db, "troubleshooting", session_id, "FEEDBACK")
    db.commit()
    return updated.model_dump(mode="json")


def get_equipment_symptoms(equipment_type_id: str) -> list[dict]:
    return TroubleshootingEngine.get_equipment_symptoms(equipment_type_id)


def get_equipment_tree(equipment_type_id: str, category: str = "") -> dict | None:
    return TroubleshootingEngine.get_decision_tree(equipment_type_id, category)


def _reconstruct_session(obj: TroubleshootingSessionModel) -> DiagnosisSession:
    """Reconstruct a full Pydantic DiagnosisSession from DB model."""
    from tools.models.schemas import SymptomEntry, DiagnosticPath

    symptoms = [SymptomEntry.model_validate(s) for s in (json.loads(obj.symptoms) if obj.symptoms else [])]
    candidates = [DiagnosticPath.model_validate(c) for c in (json.loads(obj.candidate_diagnoses) if obj.candidate_diagnoses else [])]

    # Reconstruct final diagnosis if present
    final_diagnosis = None
    if obj.final_fm_code:
        final_diagnosis = DiagnosticPath(
            fm_code=obj.final_fm_code,
            mechanism=obj.final_mechanism or "",
            cause=obj.final_cause or "",
            confidence=obj.final_confidence or 0.0,
        )

    session = DiagnosisSession(
        session_id=obj.session_id,
        equipment_type_id=obj.equipment_type_id,
        equipment_tag=obj.equipment_tag or "",
        plant_id=obj.plant_id or "",
        status=DiagnosisStatus(obj.status),
        symptoms=symptoms,
        tests_performed=json.loads(obj.tests_performed) if obj.tests_performed else [],
        candidate_diagnoses=candidates,
        final_diagnosis=final_diagnosis,
        actual_cause_feedback=obj.actual_cause_feedback,
        technician_id=obj.technician_id or "",
        notes=obj.notes or "",
        created_at=obj.created_at or datetime.now(),
        completed_at=obj.completed_at,
    )
    return session
