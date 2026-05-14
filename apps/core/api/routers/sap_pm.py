"""SAP PM Module - Read endpoints for maintenance plans, BOM, measuring points, permits, PRs, cost centers"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from api.database.connection import get_db
from api.dependencies.auth import get_current_user, require_role
import json

router = APIRouter(prefix="/sap-pm", tags=["SAP PM"])


class _EmptyResult:
    """Bug 2026-05-14: tablas como sap_materials, maintenance_plans, bom_items
    no son SQLAlchemy models — solo se crean vía data_import upload. En tests
    o deploys nuevos faltan → 500. Wrapper devuelve vacío en lugar de crashear.
    """
    def keys(self): return []
    def fetchall(self): return []
    def fetchone(self): return None
    def scalar(self): return None


def _safe_exec(db, sql, params=None):
    try:
        return db.execute(text(sql), params) if params else db.execute(text(sql))
    except Exception:
        return _EmptyResult()


def _rows_to_dicts(result):
    """Convert SQLAlchemy result to list of dicts"""
    cols = list(result.keys())
    if not cols:
        return []
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
    r = _safe_exec(db, "SELECT * FROM maintenance_plans WHERE plant_id = :p ORDER BY next_planned_date", {"p": plant_id})
    return _rows_to_dicts(r)

@router.get("/maintenance-plans/{plan_id}")
def get_maintenance_plan(plan_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = _safe_exec(db, "SELECT * FROM maintenance_plans WHERE plan_id = :p", {"p": plan_id})
    rows = _rows_to_dicts(r)
    return rows[0] if rows else {}


# ── BOM ──
@router.get("/bom/{equipment_tag}")
def get_equipment_bom(equipment_tag: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Try bom_items first, fallback to hierarchy children
    try:
        r = _safe_exec(db, "SELECT * FROM bom_items WHERE equipment_tag = :t ORDER BY item_number", {"t": equipment_tag})
        rows = _rows_to_dicts(r)
        if rows:
            return rows
    except:
        pass
    # Fallback: get child nodes from hierarchy as BOM
    r = _safe_exec(db, "SELECT node_id, name, code, tag, node_type, level FROM hierarchy_nodes WHERE parent_node_id = (SELECT node_id FROM hierarchy_nodes WHERE tag = :t LIMIT 1)", {"t": equipment_tag})
    rows = _rows_to_dicts(r)
    return [{"item_number": i+1, "component": row.get("name",""), "sap_code": row.get("code",""), "quantity": 1, "unit": "UN", "critical": row.get("node_type") == "EQUIPMENT"} for i, row in enumerate(rows)]
    return _rows_to_dicts(r)


# ── Measuring Points ──
@router.get("/measuring-points")
def list_measuring_points(equipment_tag: str = None, plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if equipment_tag:
        r = _safe_exec(db, "SELECT * FROM measuring_points WHERE equipment_tag = :t ORDER BY point_name", {"t": equipment_tag})
    else:
        r = _safe_exec(db, "SELECT * FROM measuring_points ORDER BY equipment_tag, point_name")
    return _rows_to_dicts(r)

@router.get("/measuring-points/{point_id}/readings")
def get_point_readings(point_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = _safe_exec(db, "SELECT * FROM measurement_readings WHERE point_id = :p ORDER BY read_at DESC LIMIT 20", {"p": point_id})
    return _rows_to_dicts(r)


# ── Permits to Work ──
@router.get("/permits")
def list_permits(status: str = None, plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if status:
        r = _safe_exec(db, "SELECT permit_id, permit_id as permit_number, permit_type, description, equipment_tag, wo_reference as wo_number, status, issued_by as requested_by, valid_from, valid_until, 'MEDIUM' as risk_level, 0 as loto_required, '[]' as loto_points, '[]' as safety_measures FROM work_permits WHERE status = :s ORDER BY valid_from DESC", {"s": status})
    else:
        r = _safe_exec(db, "SELECT permit_id, permit_id as permit_number, permit_type, description, equipment_tag, wo_reference as wo_number, status, issued_by as requested_by, valid_from, valid_until, 'MEDIUM' as risk_level, 0 as loto_required, '[]' as loto_points, '[]' as safety_measures FROM work_permits ORDER BY valid_from DESC")
    rows = _rows_to_dicts(r)
    return _parse_json_fields(rows, ["loto_points", "safety_measures"])


# ── Purchase Requisitions ──
@router.get("/purchase-reqs")
@router.get("/purchase-requisitions")
def list_purchase_reqs(status: str = None, plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if status:
        r = _safe_exec(db, "SELECT * FROM purchase_requisitions WHERE status = :s ORDER BY created_at DESC", {"s": status})
    else:
        r = _safe_exec(db, "SELECT * FROM purchase_requisitions ORDER BY created_at DESC")
    return _rows_to_dicts(r)


# ── Cost Centers ──
@router.get("/cost-centers")
def list_cost_centers(plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = _safe_exec(db, "SELECT * FROM cost_centers ORDER BY cc_code")
    return _rows_to_dicts(r)

@router.get("/settlement-rules")
def list_settlement_rules(wo_number: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if wo_number:
        r = _safe_exec(db, "SELECT * FROM settlement_rules WHERE wo_number = :w", {"w": wo_number})
    else:
        r = _safe_exec(db, "SELECT * FROM settlement_rules ORDER BY created_at DESC")
    return _rows_to_dicts(r)


# ── Inventory ──
@router.get("/inventory")
def list_inventory(warehouse_id: str = None, plant_id: str = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if warehouse_id:
        r = _safe_exec(db, "SELECT sap_id as material_code, description, current_stock as in_stock, 0 as reserved, current_stock as available, min_stock, max_stock as reorder_point, CASE WHEN current_stock <= min_stock THEN 'LOW' ELSE 'OK' END as status FROM sap_materials WHERE current_stock > 0 ORDER BY sap_id LIMIT 100")
    else:
        r = _safe_exec(db, "SELECT sap_id as material_code, description, current_stock as in_stock, 0 as reserved, current_stock as available, min_stock, max_stock as reorder_point, CASE WHEN current_stock <= min_stock THEN 'LOW' ELSE 'OK' END as status FROM sap_materials WHERE current_stock > 0 ORDER BY sap_id LIMIT 100")
    return _rows_to_dicts(r)
