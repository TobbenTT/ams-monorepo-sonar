"""SAP service — upload package generation, state transitions, mock data."""

import json
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

from api.config import settings
from api.database.models import SAPUploadPackageModel
from api.services.audit_service import log_action
from tools.engines.state_machine import StateMachine, TransitionError


def generate_upload(db: Session, plant_code: str, maintenance_plan: dict, maintenance_items: list[dict], task_lists: list[dict]) -> SAPUploadPackageModel:
    obj = SAPUploadPackageModel(
        plant_code=plant_code,
        maintenance_plan=maintenance_plan,
        maintenance_items=maintenance_items,
        task_lists=task_lists,
        generated_at=datetime.now(),
        status="GENERATED",
    )
    db.add(obj)
    log_action(db, "sap_upload", obj.package_id, "CREATE")
    db.commit()
    db.refresh(obj)
    return obj


def get_upload(db: Session, package_id: str) -> SAPUploadPackageModel | None:
    return db.query(SAPUploadPackageModel).filter(SAPUploadPackageModel.package_id == package_id).first()


def list_uploads(db: Session, plant_code: str | None = None) -> list[SAPUploadPackageModel]:
    q = db.query(SAPUploadPackageModel)
    if plant_code:
        q = q.filter(SAPUploadPackageModel.plant_code == plant_code)
    return q.order_by(SAPUploadPackageModel.generated_at.desc()).all()


def approve_upload(db: Session, package_id: str) -> dict:
    obj = get_upload(db, package_id)
    if not obj:
        return {"error": "Package not found"}
    try:
        StateMachine.validate_transition("sap_upload", obj.status, "APPROVED")
    except TransitionError as e:
        return {"error": str(e)}
    obj.status = "APPROVED"
    log_action(db, "sap_upload", package_id, "APPROVE")
    db.commit()
    return {"package_id": package_id, "status": "APPROVED"}


def validate_state_transition(entity_type: str, current_state: str, target_state: str) -> dict:
    try:
        valid = StateMachine.validate_transition(entity_type, current_state, target_state)
        return {"valid": valid, "entity_type": entity_type, "from": current_state, "to": target_state}
    except TransitionError as e:
        return {"valid": False, "error": str(e)}


def get_mock_data(transaction: str) -> dict | list:
    """Read SAP mock JSON files (IE03, IW38, IP10, MM60, IL03)."""
    file_map = {
        "IE03": "equipment_master.json",
        "IW38": "work_orders.json",
        "IW39": "work_orders.json",
        "IP10": "maintenance_plans.json",
        "MM60": "materials_bom.json",
        "IL03": "functional_locations.json",
    }
    filename = file_map.get(transaction.upper())
    if not filename:
        return {"error": f"Unknown transaction: {transaction}. Valid: {list(file_map.keys())}"}

    filepath = Path(settings.SAP_MOCK_DIR) / filename
    if not filepath.exists():
        return {"error": f"Mock data not found: {filepath}. Run seed first."}

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
