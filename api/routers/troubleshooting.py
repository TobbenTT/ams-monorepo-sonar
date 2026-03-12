"""Troubleshooting router — diagnostic sessions, symptoms, tests, feedback."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.services import troubleshooting_service

router = APIRouter(prefix="/troubleshooting", tags=["troubleshooting"])


@router.post("/sessions")
def create_session(data: dict, db: Session = Depends(get_db)):
    return troubleshooting_service.create_session(
        db,
        equipment_type_id=data.get("equipment_type_id", ""),
        equipment_tag=data.get("equipment_tag", ""),
        plant_id=data.get("plant_id", ""),
        technician_id=data.get("technician_id", ""),
    )


@router.get("/sessions/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    result = troubleshooting_service.get_session(db, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Troubleshooting session not found")
    return result


@router.post("/sessions/{session_id}/symptoms")
def add_symptom(session_id: str, data: dict, db: Session = Depends(get_db)):
    result = troubleshooting_service.add_symptom(
        db,
        session_id=session_id,
        description=data.get("description", ""),
        category=data.get("category", ""),
        severity=data.get("severity", "MEDIUM"),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Troubleshooting session not found")
    return result


@router.post("/sessions/{session_id}/tests")
def record_test_result(session_id: str, data: dict, db: Session = Depends(get_db)):
    result = troubleshooting_service.record_test_result(
        db,
        session_id=session_id,
        test_id=data.get("test_id", ""),
        result=data.get("result", ""),
        measured_value=data.get("measured_value", ""),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Troubleshooting session not found")
    return result


@router.put("/sessions/{session_id}/finalize")
def finalize_diagnosis(session_id: str, data: dict, db: Session = Depends(get_db)):
    result = troubleshooting_service.finalize_diagnosis(
        db,
        session_id=session_id,
        selected_fm_code=data.get("selected_fm_code", ""),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Troubleshooting session not found")
    return result


@router.put("/sessions/{session_id}/feedback")
def record_feedback(session_id: str, data: dict, db: Session = Depends(get_db)):
    result = troubleshooting_service.record_feedback(
        db,
        session_id=session_id,
        actual_cause=data.get("actual_cause", ""),
        notes=data.get("notes", ""),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Troubleshooting session not found")
    return result


@router.get("/equipment/{equipment_type_id}/symptoms")
def get_equipment_symptoms(equipment_type_id: str):
    return troubleshooting_service.get_equipment_symptoms(equipment_type_id)


@router.get("/equipment/{equipment_type_id}/tree")
def get_equipment_tree(equipment_type_id: str, category: str = ""):
    tree = troubleshooting_service.get_equipment_tree(equipment_type_id, category)
    if tree is None:
        raise HTTPException(status_code=404, detail="Decision tree not found")
    return tree
