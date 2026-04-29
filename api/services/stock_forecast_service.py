"""SF-589 — Predicción de quiebre de stock por IA.

Cruza:
  - InventoryItemModel.quantity_on_hand / quantity_reserved (stock actual)
  - Materials de OTs históricas cerradas (consumo histórico → daily_avg)
  - Materials de OTs futuras PROGRAMADO/PLANIFICADO (demanda planificada)

Devuelve por SKU:
  - current_stock, reserved, available
  - daily_avg_consumption (últimos 90 días)
  - planned_demand (próximos 30/60/90 días desde OTs)
  - coverage_days = available / daily_avg
  - risk_level: CRITICAL (<7d), HIGH (<14d), MEDIUM (<30d), LOW (≥30d)
  - suggested_order_qty: cantidad sugerida para llegar a 60d cobertura
"""
from __future__ import annotations
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.database.models import (
    InventoryItemModel, ManagedWorkOrderModel,
)


def forecast_stock(db: Session, plant_id: str | None = None, lookback_days: int = 90, horizon_days: int = 60) -> dict:
    """Análisis de quiebre stock.

    plant_id filtra OTs por planta (no afecta inventory que es global por bodega).
    """
    now = datetime.now()
    lookback_cutoff = now - timedelta(days=lookback_days)
    horizon_cutoff = now + timedelta(days=horizon_days)

    # 1. Consumo histórico: materials de OTs CERRADAS últimos N días
    q_closed = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status == "CERRADO",
        ManagedWorkOrderModel.created_at >= lookback_cutoff,
    )
    if plant_id:
        q_closed = q_closed.filter(ManagedWorkOrderModel.plant_id == plant_id)
    closed = q_closed.all()

    historical_consumption: dict[str, int] = {}
    desc_map: dict[str, str] = {}
    for w in closed:
        for m in (w.materials or []):
            if not isinstance(m, dict):
                continue
            code = m.get("code") or m.get("sap_id") or m.get("sapId")
            if not code:
                continue
            qty = int(m.get("quantity", 0) or 0)
            historical_consumption[code] = historical_consumption.get(code, 0) + qty
            if code not in desc_map:
                desc_map[code] = m.get("description", "") or ""

    # 2. Demanda planificada: materials de OTs PROGRAMADO/PLANIFICADO con planned_start en horizonte
    q_planned = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.status.in_(("PROGRAMADO", "PLANIFICADO", "EN_PROGRAMACION")),
    )
    if plant_id:
        q_planned = q_planned.filter(ManagedWorkOrderModel.plant_id == plant_id)
    planned = q_planned.all()

    planned_demand_30: dict[str, int] = {}
    planned_demand_60: dict[str, int] = {}
    planned_demand_90: dict[str, int] = {}
    for w in planned:
        ps = w.planned_start
        days_out = (ps - now).days if ps else 999
        for m in (w.materials or []):
            if not isinstance(m, dict):
                continue
            code = m.get("code") or m.get("sap_id") or m.get("sapId")
            if not code:
                continue
            qty = int(m.get("quantity", 0) or 0)
            if days_out <= 30:
                planned_demand_30[code] = planned_demand_30.get(code, 0) + qty
            if days_out <= 60:
                planned_demand_60[code] = planned_demand_60.get(code, 0) + qty
            if days_out <= 90:
                planned_demand_90[code] = planned_demand_90.get(code, 0) + qty
            if code not in desc_map:
                desc_map[code] = m.get("description", "") or ""

    # 3. Stock actual
    inventory = {i.material_code: i for i in db.query(InventoryItemModel).all()}

    # 4. Combinar
    all_codes = set(historical_consumption.keys()) | set(planned_demand_90.keys()) | set(inventory.keys())
    forecast = []
    for code in all_codes:
        inv = inventory.get(code)
        on_hand = inv.quantity_on_hand if inv else 0
        reserved = inv.quantity_reserved if inv else 0
        available = max(0, on_hand - reserved)
        hist = historical_consumption.get(code, 0)
        daily_avg = round(hist / lookback_days, 2) if hist > 0 else 0
        coverage_days = round(available / daily_avg, 1) if daily_avg > 0 else None

        d30 = planned_demand_30.get(code, 0)
        d60 = planned_demand_60.get(code, 0)
        d90 = planned_demand_90.get(code, 0)

        # Risk level
        if coverage_days is None:
            risk = "UNKNOWN" if hist == 0 else "LOW"
        elif coverage_days < 7:
            risk = "CRITICAL"
        elif coverage_days < 14:
            risk = "HIGH"
        elif coverage_days < 30:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        # Si la demanda planificada (30d) supera el stock disponible → riesgo alto
        will_break_30d = d30 > available
        will_break_60d = d60 > available + (daily_avg * 30)  # asumiendo reposición a 30d
        if will_break_30d and risk in ("LOW", "MEDIUM"):
            risk = "HIGH"

        # Sugerencia orden compra: para cubrir 60 días + buffer
        target_stock = (daily_avg * 60) + d60
        suggested_order_qty = max(0, int(round(target_stock - available)))

        forecast.append({
            "material_code": code,
            "description": desc_map.get(code, ""),
            "stock_on_hand": on_hand,
            "stock_reserved": reserved,
            "stock_available": available,
            "daily_avg_consumption": daily_avg,
            "historical_consumption": hist,
            "planned_demand_30d": d30,
            "planned_demand_60d": d60,
            "planned_demand_90d": d90,
            "coverage_days": coverage_days,
            "will_break_30d": will_break_30d,
            "will_break_60d": will_break_60d,
            "risk_level": risk,
            "suggested_order_qty": suggested_order_qty,
            "min_stock": (inv.min_stock if inv else 0),
            "reorder_point": (inv.reorder_point if inv else 0),
        })

    # Ordenar por risk + cobertura ascendente
    risk_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "UNKNOWN": 4}
    forecast.sort(key=lambda x: (risk_order.get(x["risk_level"], 99), x["coverage_days"] or 9999))

    summary = {
        "critical_count": sum(1 for f in forecast if f["risk_level"] == "CRITICAL"),
        "high_count": sum(1 for f in forecast if f["risk_level"] == "HIGH"),
        "medium_count": sum(1 for f in forecast if f["risk_level"] == "MEDIUM"),
        "will_break_30d_count": sum(1 for f in forecast if f["will_break_30d"]),
        "total_skus": len(forecast),
    }
    return {
        "plant_id": plant_id,
        "lookback_days": lookback_days,
        "horizon_days": horizon_days,
        "as_of": now.isoformat(),
        "summary": summary,
        "items": forecast,
    }


def consume_stock_on_close(db: Session, wo) -> None:
    """Helper: descontar stock cuando una OT cierra. Idempotente vía
    `stock_consumed` flag en wo.execution_notes (para no doble descontar)."""
    notes = list(wo.execution_notes or [])
    if any("[STOCK_CONSUMED]" in (n.get("note") or "") for n in notes):
        return
    for m in (wo.materials or []):
        if not isinstance(m, dict):
            continue
        code = m.get("code") or m.get("sap_id") or m.get("sapId")
        qty = int(m.get("quantity", 0) or 0)
        if not code or qty <= 0:
            continue
        inv = db.query(InventoryItemModel).filter(InventoryItemModel.material_code == code).first()
        if not inv:
            continue
        inv.quantity_on_hand = max(0, (inv.quantity_on_hand or 0) - qty)
        inv.quantity_reserved = max(0, (inv.quantity_reserved or 0) - qty)
        inv.quantity_available = max(0, inv.quantity_on_hand - inv.quantity_reserved)
        inv.last_movement_date = datetime.now().date()
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": "system",
        "note": "[STOCK_CONSUMED] Stock descontado de bodega.",
    })
    wo.execution_notes = notes
