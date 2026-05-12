"""Tanda 0E (jornada VSC 2026-05-08) — Centros de costo + Clases de gasto.

Endpoints CRUD + reportes de opex/capex real vs plan agrupados por CeCo y
por clase de gasto. Mapea al modelo SAP CO-CCA.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import (
    CostCenterModel, ExpenseClassModel, ManagedWorkOrderModel,
)
from api.dependencies.auth import get_current_user, require_role
from api.services import audit_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/cost-centers",
    tags=["cost-centers"],
    dependencies=[Depends(get_current_user)],
)


# ── Schemas ───────────────────────────────────────────────────────────
class CostCenterCreate(BaseModel):
    cost_center_id: str
    name: str
    plant_id: str | None = None
    technical_location: str | None = None
    parent_cost_center_id: str | None = None
    responsible_user_id: str | None = None
    budget_annual: float = 0.0
    currency: str = "USD"


class CostCenterUpdate(BaseModel):
    model_config = {"extra": "ignore"}
    name: str | None = None
    technical_location: str | None = None
    parent_cost_center_id: str | None = None
    responsible_user_id: str | None = None
    budget_annual: float | None = None
    status: str | None = None


class ExpenseClassCreate(BaseModel):
    expense_class_id: str
    code: str
    name: str
    category: str = "OPEX"   # OPEX / CAPEX / OVERHEAD
    subtype: str | None = None
    sap_account: str | None = None
    tax_deductible: bool = True


# ── Helpers ───────────────────────────────────────────────────────────
def _cc_dict(cc: CostCenterModel) -> dict:
    return {
        "cost_center_id": cc.cost_center_id,
        "name": cc.name,
        "plant_id": cc.plant_id,
        "technical_location": cc.technical_location,
        "parent_cost_center_id": cc.parent_cost_center_id,
        "responsible_user_id": cc.responsible_user_id,
        "budget_annual": cc.budget_annual,
        "budget_ytd": cc.budget_ytd,
        "actual_ytd": cc.actual_ytd,
        "variance": (cc.actual_ytd or 0) - (cc.budget_ytd or 0),
        "variance_pct": round(((cc.actual_ytd or 0) - (cc.budget_ytd or 0)) / (cc.budget_ytd or 1) * 100, 1) if cc.budget_ytd else 0,
        "currency": cc.currency,
        "status": cc.status,
    }


def _ec_dict(ec: ExpenseClassModel) -> dict:
    return {
        "expense_class_id": ec.expense_class_id,
        "code": ec.code,
        "name": ec.name,
        "category": ec.category,
        "subtype": ec.subtype,
        "sap_account": ec.sap_account,
        "tax_deductible": ec.tax_deductible,
        "active": ec.active,
    }


# ── Cost centers CRUD ─────────────────────────────────────────────────
@router.get("/")
def list_cost_centers(plant_id: str | None = None, status: str | None = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """List cost centers, scoped por plant si user no es admin/manager."""
    q = db.query(CostCenterModel)
    # IDOR scope
    if getattr(user, "plant_id", None) and user.role not in ("admin", "manager"):
        plant_id = user.plant_id
    if plant_id:
        q = q.filter(CostCenterModel.plant_id == plant_id)
    if status:
        q = q.filter(CostCenterModel.status == status)
    items = q.order_by(CostCenterModel.cost_center_id).all()
    return {"items": [_cc_dict(c) for c in items], "count": len(items)}


@router.post("/", dependencies=[Depends(require_role("admin", "manager"))])
def create_cost_center(data: CostCenterCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(CostCenterModel).filter(CostCenterModel.cost_center_id == data.cost_center_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"CostCenter {data.cost_center_id} ya existe")
    cc = CostCenterModel(**data.model_dump())
    db.add(cc)
    db.commit()
    db.refresh(cc)
    audit_service.log_action(
        db, entity_type="cost_center", entity_id=cc.cost_center_id,
        action="CREATE", user=getattr(user, "user_id", "system"),
        payload={"name": cc.name, "budget_annual": cc.budget_annual},
    )
    return _cc_dict(cc)


@router.put("/{cost_center_id}", dependencies=[Depends(require_role("admin", "manager"))])
def update_cost_center(cost_center_id: str, data: CostCenterUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cc = db.query(CostCenterModel).filter(CostCenterModel.cost_center_id == cost_center_id).first()
    if not cc:
        raise HTTPException(status_code=404, detail="CostCenter no encontrado")
    changes = data.model_dump(exclude_unset=True)
    for k, v in changes.items():
        setattr(cc, k, v)
    db.commit()
    audit_service.log_action(
        db, entity_type="cost_center", entity_id=cost_center_id,
        action="UPDATE", user=getattr(user, "user_id", "system"),
        payload=changes,
    )
    return _cc_dict(cc)


# ── Expense classes ───────────────────────────────────────────────────
@router.get("/expense-classes")
def list_expense_classes(category: str | None = None, active: bool = True, db: Session = Depends(get_db)):
    q = db.query(ExpenseClassModel).filter(ExpenseClassModel.active == active)
    if category:
        q = q.filter(ExpenseClassModel.category == category)
    items = q.order_by(ExpenseClassModel.code).all()
    return {"items": [_ec_dict(e) for e in items], "count": len(items)}


@router.post("/expense-classes", dependencies=[Depends(require_role("admin", "manager"))])
def create_expense_class(data: ExpenseClassCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(ExpenseClassModel).filter(ExpenseClassModel.expense_class_id == data.expense_class_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"ExpenseClass {data.expense_class_id} ya existe")
    ec = ExpenseClassModel(**data.model_dump())
    db.add(ec)
    db.commit()
    db.refresh(ec)
    audit_service.log_action(
        db, entity_type="expense_class", entity_id=ec.expense_class_id,
        action="CREATE", user=getattr(user, "user_id", "system"),
        payload={"name": ec.name, "code": ec.code},
    )
    return _ec_dict(ec)


# ── Reporting endpoints ───────────────────────────────────────────────
@router.get("/report/by-cost-center")
def report_by_cost_center(plant_id: str | None = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Agrega actual_total_cost de OTs CERRADAS por cost_center_id."""
    # IDOR scope
    if getattr(user, "plant_id", None) and user.role not in ("admin", "manager"):
        plant_id = user.plant_id

    q = db.query(
        ManagedWorkOrderModel.cost_center_id,
        func.count(ManagedWorkOrderModel.wo_id).label("wo_count"),
        func.sum(ManagedWorkOrderModel.actual_total_cost).label("actual_total"),
        func.sum(ManagedWorkOrderModel.budget_amount).label("budget_total"),
    ).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.cost_center_id.isnot(None),
    )
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    rows = q.group_by(ManagedWorkOrderModel.cost_center_id).all()

    # Cruce con catálogo de CeCos para name
    cc_lookup = {c.cost_center_id: c for c in db.query(CostCenterModel).all()}

    result = []
    for r in rows:
        cc = cc_lookup.get(r.cost_center_id)
        actual = float(r.actual_total or 0)
        budget = float(r.budget_total or 0)
        result.append({
            "cost_center_id": r.cost_center_id,
            "name": cc.name if cc else r.cost_center_id,
            "wo_count": r.wo_count,
            "actual_total": round(actual, 2),
            "budget_total": round(budget, 2),
            "variance": round(actual - budget, 2),
            "variance_pct": round((actual - budget) / budget * 100, 1) if budget else None,
        })
    result.sort(key=lambda x: -abs(x["variance"] or 0))
    return {"items": result, "count": len(result), "plant_id": plant_id}


@router.get("/report/by-expense-class")
def report_by_expense_class(plant_id: str | None = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Agrega actual_total_cost por expense_class_id."""
    if getattr(user, "plant_id", None) and user.role not in ("admin", "manager"):
        plant_id = user.plant_id

    q = db.query(
        ManagedWorkOrderModel.expense_class_id,
        func.count(ManagedWorkOrderModel.wo_id).label("wo_count"),
        func.sum(ManagedWorkOrderModel.actual_total_cost).label("actual_total"),
    ).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.expense_class_id.isnot(None),
    )
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    rows = q.group_by(ManagedWorkOrderModel.expense_class_id).all()

    ec_lookup = {e.expense_class_id: e for e in db.query(ExpenseClassModel).all()}

    result = []
    for r in rows:
        ec = ec_lookup.get(r.expense_class_id)
        result.append({
            "expense_class_id": r.expense_class_id,
            "code": ec.code if ec else r.expense_class_id,
            "name": ec.name if ec else r.expense_class_id,
            "category": ec.category if ec else "UNKNOWN",
            "wo_count": r.wo_count,
            "actual_total": round(float(r.actual_total or 0), 2),
        })
    result.sort(key=lambda x: -x["actual_total"])
    return {"items": result, "count": len(result), "plant_id": plant_id}


# ── Seed catálogo mínimo (idempotente) ────────────────────────────────
@router.post("/seed-defaults", dependencies=[Depends(require_role("admin"))])
def seed_defaults(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Crea catálogo mínimo SAP-style si está vacío."""
    DEFAULT_EXPENSE_CLASSES = [
        ("EC-600100", "600100", "Repuestos mecánicos", "OPEX", "MATERIAL"),
        ("EC-600200", "600200", "Repuestos eléctricos", "OPEX", "MATERIAL"),
        ("EC-600300", "600300", "Repuestos instrumentación", "OPEX", "MATERIAL"),
        ("EC-601000", "601000", "Servicios externos mecánicos", "OPEX", "SERVICE"),
        ("EC-601100", "601100", "Servicios externos eléctricos", "OPEX", "SERVICE"),
        ("EC-602000", "602000", "Servicios externos generales", "OPEX", "SERVICE"),
        ("EC-610000", "610000", "Lubricantes y consumibles", "OPEX", "MATERIAL"),
        ("EC-620000", "620000", "Energía eléctrica", "OPEX", "ENERGY"),
        ("EC-630000", "630000", "Mano de obra interna", "OPEX", "LABOR"),
        ("EC-700100", "700100", "Inversión activo fijo", "CAPEX", "MATERIAL"),
        ("EC-700200", "700200", "Mejora ingeniería", "CAPEX", "SERVICE"),
        ("EC-900000", "900000", "Overhead administrativo", "OVERHEAD", "OTHER"),
    ]
    created = 0
    for ec_id, code, name, category, subtype in DEFAULT_EXPENSE_CLASSES:
        if not db.query(ExpenseClassModel).filter(ExpenseClassModel.expense_class_id == ec_id).first():
            db.add(ExpenseClassModel(
                expense_class_id=ec_id, code=code, name=name,
                category=category, subtype=subtype,
                sap_account=code, tax_deductible=True, active=True,
            ))
            created += 1
    db.commit()
    audit_service.log_action(
        db, entity_type="expense_class", entity_id="seed",
        action="SEED_DEFAULTS", user=getattr(user, "user_id", "system"),
        payload={"created": created},
    )
    return {"created": created, "total_classes": db.query(ExpenseClassModel).count()}
