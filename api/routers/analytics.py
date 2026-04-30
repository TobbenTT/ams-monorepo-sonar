"""Analytics router — KPIs, health scores, Weibull, variance."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time
import tempfile
import os

# Simple in-memory cache for expensive endpoints
_cache = {}
_CACHE_TTL = 120  # 2 minutes

def _cached(key, ttl=_CACHE_TTL):
    """Check cache, return (hit, data)."""
    entry = _cache.get(key)
    if entry and time.time() - entry[0] < ttl:
        return True, entry[1]
    return False, None

def _set_cache(key, data):
    _cache[key] = (time.time(), data)

from api.database.connection import get_db
from api.dependencies.auth import get_current_user
from api.schemas import (
    HealthScoreRequest, KPIRequest, WeibullFitRequest,
    WeibullPredictRequest, VarianceDetectRequest,
)
from api.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"], dependencies=[Depends(get_current_user)])


@router.post("/health-score")
def calculate_health_score(data: HealthScoreRequest, db: Session = Depends(get_db)):
    return analytics_service.calculate_health_score(
        db,
        node_id=data.node_id,
        plant_id=data.plant_id,
        equipment_tag=data.equipment_tag,
        risk_class=data.risk_class,
        pending_backlog_hours=data.pending_backlog_hours,
        capacity_hours_per_week=data.capacity_hours_per_week,
        total_failure_modes=data.total_failure_modes,
        fm_with_strategy=data.fm_with_strategy,
        active_alerts=data.active_alerts,
        critical_alerts=data.critical_alerts,
        planned_wo=data.planned_wo,
        executed_on_time=data.executed_on_time,
    )


@router.post("/kpis")
def calculate_kpis(data: KPIRequest, db: Session = Depends(get_db)):
    return analytics_service.calculate_kpis(
        db,
        plant_id=data.plant_id,
        failure_dates=data.failure_dates,
        total_period_hours=data.total_period_hours,
        total_downtime_hours=data.total_downtime_hours,
    )


@router.post("/weibull-fit")
def fit_weibull(data: WeibullFitRequest):
    return analytics_service.fit_weibull(data.failure_intervals)


@router.post("/weibull-predict")
def predict_failure(data: WeibullPredictRequest, db: Session = Depends(get_db)):
    return analytics_service.predict_failure(
        db,
        equipment_id=data.equipment_id,
        equipment_tag=data.equipment_tag,
        failure_intervals=data.failure_intervals,
        current_age_days=data.current_age_days,
        confidence_level=data.confidence_level,
    )


@router.post("/variance-detect")
def detect_variance(data: VarianceDetectRequest):
    return analytics_service.detect_variance(data.snapshots)


@router.post("/import-jigsaw-excel")
async def import_jigsaw_excel(file: UploadFile = File(...)):
    """Sube Excel Jigsaw (Pareto histórico o Jack-Knife) y devuelve datasets
    listos para alimentar las secciones Pareto + Jack-Knife de PerformanceAnalysis.

    Detecta automáticamente el formato:
    - Sheet1 con headers en row 15+ (cols flota/equipo/tiempo/estado/sistema/horas) → Pareto sept 2010
    - Hojas CAM*/PALAS/etc con cols Tiempo/Tiempo Final/.../Equipo/Estado → Jack-Knife abril 2010

    Agrupa por **sistema** (no por equipo) — Jorge demo siempre razona sobre sistemas.
    """
    try:
        import xlrd
    except ImportError:
        raise HTTPException(500, "xlrd no instalado en backend")
    name = (file.filename or "").lower()
    ext = ".xls" if name.endswith(".xls") else (".xlsx" if name.endswith(".xlsx") else ".xls")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext, dir="/tmp")
    try:
        tmp.write(await file.read())
        tmp.close()
        wb = xlrd.open_workbook(tmp.name)
        # Acumular por sistema: {sistema: {hours, count}}
        agg = {}
        events = 0
        sheets_used = []

        # ── Formato A: Sheet1 long-form (Pareto sept 2010) ──
        if "Sheet1" in wb.sheet_names():
            s = wb.sheet_by_name("Sheet1")
            for r in range(15, s.nrows):
                row = [s.cell_value(r, c) for c in range(s.ncols)]
                if not row[0] or not row[1]:
                    continue
                state = str(row[6] or "")
                sistema = str(row[7] or "").strip()
                if not sistema:
                    continue
                # Sólo no planificadas para Pareto/JackKnife (Jorge: "fallas")
                if "no planif" not in state.lower():
                    continue
                try:
                    hours = float(row[13]) if row[13] else 0
                except (ValueError, TypeError):
                    hours = 0
                if hours <= 0:
                    continue
                if sistema not in agg:
                    agg[sistema] = {"hours": 0.0, "count": 0}
                agg[sistema]["hours"] += hours
                agg[sistema]["count"] += 1
                events += 1
            if events > 0:
                sheets_used.append("Sheet1")

        # ── Formato B: hojas CAM*/PALAS/DMM* (Jack-Knife abril 2010) ──
        if events == 0:
            for sn in wb.sheet_names():
                if sn.startswith("Jack Knife") or sn in ("Flota Servicio", "L1350.", "Sheet1"):
                    continue
                s = wb.sheet_by_name(sn)
                if s.nrows < 2:
                    continue
                for r in range(1, s.nrows):
                    row = [s.cell_value(r, c) for c in range(s.ncols)]
                    try:
                        hours = float(row[5]) if row[5] else 0
                        estado = str(row[7] or "").strip().lower()
                        sistema = (str(row[9]).strip() if len(row) > 9 else "")
                    except (ValueError, IndexError):
                        continue
                    if not sistema or hours <= 0:
                        continue
                    if estado != "mantencion":  # sólo no planificadas
                        continue
                    if sistema not in agg:
                        agg[sistema] = {"hours": 0.0, "count": 0}
                    agg[sistema]["hours"] += hours
                    agg[sistema]["count"] += 1
                    events += 1
                sheets_used.append(sn)

        if events == 0:
            raise HTTPException(400, "No se detectaron eventos de Mantención No Planificada en el Excel.")

        # ── Construir Pareto (byCount + byHours) ──
        def build_pareto(key):
            sorted_items = sorted(agg.items(), key=lambda kv: kv[1][key], reverse=True)
            total = sum(v[key] for _, v in sorted_items) or 1
            cum = 0.0
            out = []
            for sistema, v in sorted_items[:15]:
                val = round(v[key] * 10) / 10
                pct = round(v[key] / total * 1000) / 10
                cum = min(100.0, cum + pct)
                out.append({
                    "mode": sistema,
                    "value": val,
                    "pct": pct,
                    "cumPct": round(cum * 10) / 10,
                    "inTop80": cum <= 80,
                    "count" if key == "count" else "hours": val,
                })
            return out

        pareto = {
            "byCount": build_pareto("count"),
            "byHours": build_pareto("hours"),
        }

        # ── Construir Jack-Knife (por sistema) ──
        points = []
        for sistema, v in agg.items():
            mttr = round(v["hours"] / v["count"] * 100) / 100 if v["count"] > 0 else 0
            points.append({
                "equipment": sistema,  # JackKnifeSection usa "equipment" como label
                "criticality": "—",
                "frequency": v["count"],
                "total_hours": round(v["hours"] * 10) / 10,
                "mttr": mttr,
            })
        total_paradas = sum(p["frequency"] for p in points)
        total_tiempo = sum(p["total_hours"] for p in points)
        n_razones = max(1, len(points))
        threshold_mttr = round(total_tiempo / total_paradas * 100) / 100 if total_paradas > 0 else 0
        threshold_freq = round(total_paradas / n_razones * 10) / 10
        for p in points:
            high_freq = p["frequency"] > threshold_freq
            high_mttr = p["mttr"] > threshold_mttr
            if high_freq and high_mttr:
                p["quadrant"] = "GRAVE_CRONICO"
            elif high_mttr:
                p["quadrant"] = "GRAVE"
            elif high_freq:
                p["quadrant"] = "CRONICO"
            else:
                p["quadrant"] = "LEVE"
        order = {"GRAVE_CRONICO": 4, "GRAVE": 3, "CRONICO": 2, "LEVE": 1}
        points.sort(key=lambda p: (order[p["quadrant"]], p["frequency"]), reverse=True)

        return {
            "filename": file.filename,
            "events": events,
            "sheets_used": sheets_used,
            "n_sistemas": len(agg),
            "pareto": pareto,
            "jackKnife": {
                "items": points[:25],
                "thresholdMttr": threshold_mttr,
                "thresholdFreq": threshold_freq,
                "totalParadas": total_paradas,
                "totalTiempo": round(total_tiempo * 10) / 10,
                "nRazones": n_razones,
            },
        }
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


class NonComplianceClassifyRequest(BaseModel):
    notes: list[str]  # textos crudos de execution_notes / closure_notes
    plant_id: str | None = None


@router.post("/classify-noncompliance")
def classify_noncompliance(data: NonComplianceClassifyRequest):
    """Clasifica notas de no-cumplimiento con Claude (NLP real, no regex).

    Cada nota cae en una de 7 categorías estándar Jorge + emergentes que Claude
    detecte. Devuelve counts + sample quotes por categoría.
    """
    import json
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    notes = [n for n in (data.notes or []) if isinstance(n, str) and n.strip() and len(n.strip()) > 5]
    if not notes:
        return {"categories": [], "ai_used": False}
    if not api_key:
        return {"categories": _fallback_classify_noncompliance(notes), "ai_used": False}
    try:
        import anthropic
    except ImportError:
        return {"categories": _fallback_classify_noncompliance(notes), "ai_used": False}

    # Limit to 80 notes per call (token budget)
    sample = notes[:80]
    numbered = "\n".join([f"{i+1}. {n[:200]}" for i, n in enumerate(sample)])

    prompt = f"""Eres un analista de mantenimiento. Clasifica cada nota de OT en UNA de estas 7 categorías estándar (Jorge 2026-04-28):

CATEGORÍAS:
1. REPUESTO_FALTANTE — repuesto no llegó / sin stock / no corresponde
2. OPERACIONES_NO_LIBERO — operaciones no entregó el equipo / producción no podía parar
3. SERVICIO_EXTERNO_NO_LLEGO — proveedor / contratista no llegó o canceló
4. HERRAMIENTA_FALTANTE — herramienta especial faltante o descalibrada
5. EQUIPO_APOYO_NO_DISPONIBLE — grúa / scaffolding / equipo apoyo bloqueado
6. VENTANA_INSUFICIENTE — tiempo insuficiente / no alcanzó la ventana
7. SEGURIDAD_LOTO — bloqueado por seguridad / permiso / LOTO

Si una nota no encaja en ninguna, ponela en una nueva categoría descriptiva (max 30 chars en SCREAMING_SNAKE_CASE) — ej: "PERSONAL_INSUFICIENTE" si dice falta de gente.

NOTAS A CLASIFICAR ({len(sample)}):
{numbered}

Devuelve SOLO un JSON con esta forma:
{{
  "classifications": [
    {{ "note_idx": 1, "category": "REPUESTO_FALTANTE" }},
    ...
  ],
  "emerging_categories": ["lista de categorías que inventaste fuera de las 7 estándar"]
}}"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start < 0:
            return {"categories": _fallback_classify_noncompliance(notes), "ai_used": False}
        parsed = json.loads(text[start:end])
        # Build counts + sample quotes
        cat_data = {}
        for c in (parsed.get("classifications") or []):
            idx = c.get("note_idx")
            cat = c.get("category") or "OTRO"
            if not isinstance(idx, int) or idx < 1 or idx > len(sample):
                continue
            if cat not in cat_data:
                cat_data[cat] = {"count": 0, "samples": []}
            cat_data[cat]["count"] += 1
            if len(cat_data[cat]["samples"]) < 3:
                cat_data[cat]["samples"].append(sample[idx-1][:140])
        categories = sorted(
            [{"category": k, "count": v["count"], "samples": v["samples"]} for k, v in cat_data.items()],
            key=lambda x: x["count"], reverse=True,
        )
        return {
            "categories": categories,
            "emerging": parsed.get("emerging_categories") or [],
            "total_notes": len(sample),
            "ai_used": True,
        }
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("classify-noncompliance Claude failed: %s", e)
        return {"categories": _fallback_classify_noncompliance(notes), "ai_used": False}


def _fallback_classify_noncompliance(notes: list[str]) -> list[dict]:
    """Fallback regex (lo que el frontend hacía antes) si Claude no responde."""
    import re
    patterns = [
        ("REPUESTO_FALTANTE", re.compile(r"repuesto.*no\s+(corresp|disponible|llegó)", re.I)),
        ("OPERACIONES_NO_LIBERO", re.compile(r"operaci(ón|on).*no\s+(entreg|liber)", re.I)),
        ("SERVICIO_EXTERNO_NO_LLEGO", re.compile(r"servicio\s+externo.*no\s+lleg", re.I)),
        ("HERRAMIENTA_FALTANTE", re.compile(r"herramienta.*(descalibr|no\s+estaba|falt)", re.I)),
        ("EQUIPO_APOYO_NO_DISPONIBLE", re.compile(r"gr[uú]a|equipo\s+de\s+apoyo", re.I)),
        ("VENTANA_INSUFICIENTE", re.compile(r"tiempo\s+insuficiente|no\s+alcanc", re.I)),
        ("SEGURIDAD_LOTO", re.compile(r"seguridad|loto|epp", re.I)),
    ]
    counts = {}
    samples_map = {}
    for n in notes:
        for cat, rx in patterns:
            if rx.search(n):
                counts[cat] = counts.get(cat, 0) + 1
                samples_map.setdefault(cat, []).append(n[:140])
                break
    return sorted(
        [{"category": k, "count": v, "samples": samples_map.get(k, [])[:3]} for k, v in counts.items()],
        key=lambda x: x["count"], reverse=True,
    )


@router.get("/variance-alerts")
def get_variance_alerts(db: Session = Depends(get_db)):
    alerts = analytics_service.get_variance_alerts(db)
    return [
        {"alert_id": a.alert_id, "plant_id": a.plant_id, "metric_name": a.metric_name,
         "z_score": a.z_score, "variance_level": a.variance_level}
        for a in alerts
    ]


@router.get("/asset-health")
def get_asset_health_scores(plant_id: str | None = None, db: Session = Depends(get_db)):
    """Get asset health scores for all equipment from real DB data."""
    from api.database.models import HierarchyNodeModel, HealthScoreModel, KPIMetricsModel

    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT"
    )
    if plant_id:
        nodes = nodes.filter(HierarchyNodeModel.plant_id == plant_id)
    nodes = nodes.all()

    # Index latest health scores and KPI metrics by node_id
    health_map: dict[str, HealthScoreModel] = {}
    kpi_map: dict[str, KPIMetricsModel] = {}
    for node in nodes:
        hs = db.query(HealthScoreModel).filter(
            HealthScoreModel.node_id == node.node_id
        ).order_by(HealthScoreModel.calculated_at.desc()).first()
        if hs:
            health_map[node.node_id] = hs
        km = db.query(KPIMetricsModel).filter(
            KPIMetricsModel.equipment_id == node.node_id
        ).order_by(KPIMetricsModel.calculated_at.desc()).first()
        if km:
            kpi_map[node.node_id] = km

    results = []
    for node in nodes:
        hs = health_map.get(node.node_id)
        km = kpi_map.get(node.node_id)
        meta = node.metadata_json or {}

        availability = (km.availability_pct if km and km.availability_pct is not None
                        else meta.get("availability"))
        oee = (km.oee_pct if km and km.oee_pct is not None
               else meta.get("oee"))
        mtbf = (km.mtbf_days if km and km.mtbf_days is not None
                else meta.get("mtbf"))
        mttr = (km.mttr_hours if km and km.mttr_hours is not None
                else meta.get("mttr"))
        trend = (hs.trend if hs and hs.trend else meta.get("trend"))
        health = (hs.composite_score if hs and hs.composite_score
                  else None)

        # Only include equipment with at least some real data
        if availability is None and oee is None and mtbf is None and health is None:
            continue

        if health is None and availability is not None:
            health = round(
                (availability or 0) * 0.3 + (oee or 0) * 0.3
                + min((mtbf or 0) / 20, 100) * 0.4, 1)

        results.append({
            "equipment_tag": node.node_id,
            "equipment_name": node.name,
            "health_score": health,
            "availability": round(availability, 1) if availability is not None else None,
            "oee": round(oee, 1) if oee is not None else None,
            "mtbf": round(mtbf, 1) if mtbf is not None else None,
            "mttr": round(mttr, 1) if mttr is not None else None,
            "trend": trend or "STABLE",
        })
    return {"count": len(results), "assets": sorted(results, key=lambda x: x["health_score"] or 0)}


@router.get("/page-data/{plant_id}")
def get_analytics_page_data(
    plant_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """All-in-one endpoint for Analytics page: KPIs, charts, reliability table."""
    cache_key = f"analytics_{plant_id}_{start_date}_{end_date}"
    hit, cached = _cached(cache_key)
    if hit:
        return cached

    from api.database.models import (
        HierarchyNodeModel, FMECAWorksheetModel, WorkPackageModel,
        WorkRequestModel, KPIMetricsModel, HealthScoreModel,
    )

    # ── Equipment metrics from real DB data ──
    nodes = db.query(HierarchyNodeModel).filter(
        HierarchyNodeModel.node_type == "EQUIPMENT",
        HierarchyNodeModel.plant_id == plant_id,
    ).all()

    from dateutil.parser import parse as _dp
    sd = _dp(start_date) if start_date else None
    ed = _dp(end_date) if end_date else None

    equipment_kpis = []
    total_mtbf = total_mttr = total_avail = total_oee = 0.0
    counted = 0
    for node in nodes:
        meta = node.metadata_json or {}
        km_q = db.query(KPIMetricsModel).filter(KPIMetricsModel.equipment_id == node.node_id)
        if sd:
            km_q = km_q.filter(KPIMetricsModel.calculated_at >= sd)
        if ed:
            km_q = km_q.filter(KPIMetricsModel.calculated_at <= ed)
        km = km_q.order_by(KPIMetricsModel.calculated_at.desc()).first()
        hs = db.query(HealthScoreModel).filter(
            HealthScoreModel.node_id == node.node_id
        ).order_by(HealthScoreModel.calculated_at.desc()).first()

        avail = (km.availability_pct if km and km.availability_pct is not None
                 else meta.get("availability"))
        oee = (km.oee_pct if km and km.oee_pct is not None
               else meta.get("oee"))
        mtbf = (km.mtbf_days if km and km.mtbf_days is not None
                else meta.get("mtbf"))
        mttr = (km.mttr_hours if km and km.mttr_hours is not None
                else meta.get("mttr"))
        trend = (hs.trend if hs and hs.trend else meta.get("trend", "STABLE"))

        if avail is None and oee is None and mtbf is None:
            continue

        counted += 1
        total_avail += avail or 0; total_oee += oee or 0
        total_mtbf += mtbf or 0; total_mttr += mttr or 0
        equipment_kpis.append({
            "equipment_tag": node.node_id, "equipment_name": node.name,
            "mtbf": round(mtbf, 1) if mtbf is not None else None,
            "mttr": round(mttr, 1) if mttr is not None else None,
            "availability": round(avail, 1) if avail is not None else None,
            "oee": round(oee, 1) if oee is not None else None,
            "trend": trend,
        })

    n_eq = max(counted, 1)
    avg_mtbf = round(total_mtbf / n_eq, 1)
    avg_mttr = round(total_mttr / n_eq, 1)
    avg_avail = round(total_avail / n_eq, 1)
    avg_oee = round(total_oee / n_eq, 1)

    # ── Failure modes pareto ──
    # Fuente 1: FMECA worksheets (modos teóricos definidos por ingeniería).
    # Fuente 2 (fallback): Work Requests con AI classification — extrae el failure_type
    # de los avisos reales de campo. Útil cuando FMECA aún no se cargó (planta nueva).
    node_ids = [n.node_id for n in nodes]
    worksheets = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.equipment_id.in_(node_ids)
    ).all() if node_ids else []
    fm_counts: dict[str, int] = {}
    for ws in worksheets:
        for row in (ws.rows or []):
            mode = row.get("failure_mode") or row.get("description", "Unknown")
            fm_counts[mode] = fm_counts.get(mode, 0) + 1
    # Fallback: si FMECA está vacío, usar failure_type de WRs reales
    if not fm_counts:
        from api.database.models import WorkRequestModel
        wr_q = db.query(WorkRequestModel)
        if plant_id:
            wr_q = wr_q.filter(WorkRequestModel.ai_classification.like(f"%{plant_id}%"))
        for wr in wr_q.limit(500).all():
            ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
            mode = (ai.get("failure_type") or ai.get("failure_class") or "").strip()
            if not mode:
                continue
            fm_counts[mode[:25]] = fm_counts.get(mode[:25], 0) + 1
    pareto = sorted(fm_counts.items(), key=lambda x: x[1], reverse=True)
    total_fm = sum(c for _, c in pareto) or 1
    cum = 0
    failure_modes_pareto = []
    for mode, count in pareto:
        cum += count
        failure_modes_pareto.append({
            "mode": mode[:25], "count": count,
            "cumulative_pct": round(cum / total_fm * 100, 1),
        })

    # ── Work orders by type (from work packages + work requests) ──
    wps = db.query(WorkPackageModel).filter(
        WorkPackageModel.node_id.in_(node_ids)
    ).all() if node_ids else []
    wrs = db.query(WorkRequestModel).all()
    type_map = {"PREVENTIVE": 0, "CORRECTIVE": 0, "PREDICTIVE": 0}
    for wp in wps:
        wtype = (wp.work_package_type or "PREVENTIVE").upper()
        if "CORREC" in wtype:
            type_map["CORRECTIVE"] += 1
        elif "PREDIC" in wtype:
            type_map["PREDICTIVE"] += 1
        else:
            type_map["PREVENTIVE"] += 1
    type_map["CORRECTIVE"] += len(wrs)
    wo_by_type = [
        {"type": t, "count": c, "hours": c * 4}
        for t, c in type_map.items() if c > 0
    ]

    # ── KPI history (from real KPI records, grouped by month) ──
    kpi_hist_q = db.query(KPIMetricsModel).filter(
        KPIMetricsModel.plant_id == plant_id,
        KPIMetricsModel.equipment_id.is_(None),
    )
    if sd:
        kpi_hist_q = kpi_hist_q.filter(KPIMetricsModel.period_end >= sd)
    if ed:
        kpi_hist_q = kpi_hist_q.filter(KPIMetricsModel.period_end <= ed)
    kpi_records = kpi_hist_q.order_by(KPIMetricsModel.period_end.desc()).limit(6).all()
    kpi_history = []
    if kpi_records:
        for rec in reversed(kpi_records):
            kpi_history.append({
                "month": rec.period_end.strftime("%b") if rec.period_end else "—",
                "period": rec.period_end.strftime("%b %Y") if rec.period_end else "—",
                "schedule_adherence": round(rec.schedule_compliance_pct or 0, 1),
                "oee_avg": round(rec.oee_pct or 0, 1),
                "oee": round(rec.oee_pct or 0, 1),
                "availability": round(rec.availability_pct or 0, 1) if hasattr(rec, 'availability_pct') else 0,
                "planning_time_avg": round(rec.backlog_hours or 0, 0),
            })

    # If no persisted KPI history, synthesize one from closed WOs (last 6 months)
    if not kpi_history:
        from api.database.models import ManagedWorkOrderModel
        from datetime import timedelta
        now = datetime.now()
        for i in range(5, -1, -1):
            month_end = now.replace(day=1) - timedelta(days=i * 30)
            month_start = month_end - timedelta(days=30)
            closed_q = db.query(ManagedWorkOrderModel).filter(
                ManagedWorkOrderModel.status == "CERRADO",
                ManagedWorkOrderModel.closed_at >= month_start,
                ManagedWorkOrderModel.closed_at <= month_end,
            )
            scheduled_q = db.query(ManagedWorkOrderModel).filter(
                ManagedWorkOrderModel.created_at >= month_start,
                ManagedWorkOrderModel.created_at <= month_end,
            )
            if plant_id:
                closed_q = closed_q.filter(ManagedWorkOrderModel.plant_id == plant_id)
                scheduled_q = scheduled_q.filter(ManagedWorkOrderModel.plant_id == plant_id)
            closed_ct = closed_q.count()
            scheduled_ct = scheduled_q.count() or 1
            adherence = round(min(100, (closed_ct / scheduled_ct) * 100), 1)
            avail = round(min(98, 85 + adherence * 0.1), 1) if closed_ct else 0
            oee = round(avail * 0.9 / 100 * 100, 1) if avail else 0
            kpi_history.append({
                "month": month_end.strftime("%b"),
                "period": month_end.strftime("%b %Y"),
                "schedule_adherence": adherence,
                "oee_avg": oee,
                "oee": oee,
                "availability": avail,
                "planning_time_avg": 0,
            })

    # ── Cost by area (from work packages grouped by parent hierarchy node) ──
    from api.routers.admin import _platform_settings
    LABOR_RATE = float(_platform_settings.get("laborRate", 250))
    MATERIAL_FACTOR = 0.6  # material cost ≈ 60% of labor
    area_costs: dict[str, dict] = {}
    for wp in wps:
        # Determine area: use parent node or equipment tag prefix
        parent = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_id == wp.node_id
        ).first()
        area_name = "General"
        if parent:
            # Try to get the parent (system/area) name
            parent_node = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.node_id == parent.parent_node_id
            ).first() if parent.parent_node_id else None
            area_name = (parent_node.name if parent_node else parent.name) or "General"

        hours = 0.0
        ls = wp.labour_summary
        if isinstance(ls, dict):
            hours = sum(v for v in ls.values() if isinstance(v, (int, float)))
        elif isinstance(ls, (int, float)):
            hours = float(ls)
        if hours <= 0:
            hours = float(wp.estimated_hours or 4)

        if area_name not in area_costs:
            area_costs[area_name] = {"labor": 0.0, "material": 0.0}
        area_costs[area_name]["labor"] += hours * LABOR_RATE
        area_costs[area_name]["material"] += hours * LABOR_RATE * MATERIAL_FACTOR

    cost_by_area = [
        {"area": area[:20], "labor": round(v["labor"]), "material": round(v["material"])}
        for area, v in sorted(area_costs.items(), key=lambda x: x[1]["labor"], reverse=True)
    ]

    # Fallback: if no equipment-level KPIs, use plant-level aggregate
    if not counted:
        from sqlalchemy import func as _fn
        plant_kpi = db.query(
            _fn.avg(KPIMetricsModel.availability_pct),
            _fn.avg(KPIMetricsModel.mtbf_days),
            _fn.avg(KPIMetricsModel.mttr_hours),
            _fn.avg(KPIMetricsModel.oee_pct),
        ).filter(KPIMetricsModel.plant_id == plant_id).first()
        if plant_kpi and plant_kpi[0] is not None:
            avg_avail, avg_mtbf, avg_mttr, avg_oee = [round(v or 0, 1) for v in plant_kpi]
            counted = 1

    result = {
        "kpis": {
            "mtbf": f"{avg_mtbf}h" if counted else "—",
            "mttr": f"{avg_mttr}h" if counted else "—",
            "availability": f"{avg_avail}%" if counted else "—",
            "oee": f"{avg_oee}%" if counted else "—",
        },
        "kpi_history": kpi_history,
        "failure_modes_pareto": failure_modes_pareto,
        "work_orders_by_type": wo_by_type,
        "cost_by_area": cost_by_area,
        "reliability_kpis": equipment_kpis,
    }
    _set_cache(cache_key, result)
    return result


@router.post("/recalculate")
def recalculate_kpis(plant_id: str = "OCP-JFC1", days: int = 30,
                     user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Fuerza recalculo de KPIs desde historial real de OTs (admin/planner)."""
    from api.services.analytics_service import recalculate_kpis_from_history
    return recalculate_kpis_from_history(db, plant_id, days)
