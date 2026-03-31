"""SAP PM Module - Read endpoints for maintenance plans, BOM, measuring points, permits, PRs, cost centers"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
import json

router = APIRouter(prefix="/sap-pm", tags=["SAP PM"])

def _rows_to_dicts(result):
    """Convert SQLAlchemy result to list of dicts"""
    cols = result.keys()
    return [dict(zip(cols, row)) for row in result.fetchall()]

def _parse_json_fields(rows, fields):
    for row in rows:
        for f in fields:
            if f in row and isinstance(row[f], str):
                try:
                    row[f] = json.loads(row[f])
                except:
                    pass
    return rows


# ── Maintenance Plans ──
@router.get("/maintenance-plans")
def list_maintenance_plans(plant_id: str = "OCP-JFC1", db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM maintenance_plans WHERE plant_id = :p ORDER BY next_planned_date"), {"p": plant_id})
    return _rows_to_dicts(r)

@router.get("/maintenance-plans/{plan_id}")
def get_maintenance_plan(plan_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM maintenance_plans WHERE plan_id = :p"), {"p": plan_id})
    rows = _rows_to_dicts(r)
    return rows[0] if rows else {}


# ── BOM ──
@router.get("/bom/{equipment_tag}")
def get_equipment_bom(equipment_tag: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM bom_items WHERE equipment_tag = :t ORDER BY item_number"), {"t": equipment_tag})
    return _rows_to_dicts(r)


# ── Measuring Points ──
@router.get("/measuring-points")
def list_measuring_points(equipment_tag: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if equipment_tag:
        r = db.execute(text("SELECT * FROM measuring_points WHERE equipment_tag = :t ORDER BY point_name"), {"t": equipment_tag})
    else:
        r = db.execute(text("SELECT * FROM measuring_points ORDER BY equipment_tag, point_name"))
    return _rows_to_dicts(r)

@router.get("/measuring-points/{point_id}/readings")
def get_point_readings(point_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM measurement_readings WHERE point_id = :p ORDER BY read_at DESC LIMIT 20"), {"p": point_id})
    return _rows_to_dicts(r)


# ── Permits to Work ──
@router.get("/permits")
def list_permits(status: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if status:
        r = db.execute(text("SELECT * FROM permits_to_work WHERE status = :s ORDER BY created_at DESC"), {"s": status})
    else:
        r = db.execute(text("SELECT * FROM permits_to_work ORDER BY created_at DESC"))
    rows = _rows_to_dicts(r)
    return _parse_json_fields(rows, ["loto_points", "safety_measures"])


# ── Purchase Requisitions ──
@router.get("/purchase-requisitions")
def list_purchase_reqs(status: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if status:
        r = db.execute(text("SELECT * FROM purchase_requisitions WHERE status = :s ORDER BY created_at DESC"), {"s": status})
    else:
        r = db.execute(text("SELECT * FROM purchase_requisitions ORDER BY created_at DESC"))
    return _rows_to_dicts(r)


# ── Cost Centers ──
@router.get("/cost-centers")
def list_cost_centers(db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM cost_centers ORDER BY cc_code"))
    return _rows_to_dicts(r)

@router.get("/settlement-rules")
def list_settlement_rules(wo_number: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if wo_number:
        r = db.execute(text("SELECT * FROM settlement_rules WHERE wo_number = :w"), {"w": wo_number})
    else:
        r = db.execute(text("SELECT * FROM settlement_rules ORDER BY created_at DESC"))
    return _rows_to_dicts(r)


# ── Inventory ──
@router.get("/inventory")
def list_inventory(warehouse_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if warehouse_id:
        r = db.execute(text("SELECT * FROM inventory_items WHERE warehouse_id = :w ORDER BY material_code"), {"w": warehouse_id})
    else:
        r = db.execute(text("SELECT * FROM inventory_items ORDER BY material_code"))
    return _rows_to_dicts(r)
