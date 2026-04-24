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
from tools.models.schemas import FMECAWorksheet, FMECARow


def list_fmeca_worksheets(db: Session, equipment_id: str | None = None, plant_id: str | None = None, status: str | None = None) -> list[dict]:
    q = db.query(FMECAWorksheetModel)
    if equipment_id:
        q = q.filter(FMECAWorksheetModel.equipment_id == equipment_id)
    elif plant_id:
        from api.database.models import HierarchyNodeModel
        equip_ids = [
            n.node_id for n in db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.plant_id == plant_id,
                HierarchyNodeModel.node_type == "EQUIPMENT",
            ).all()
        ]
        if equip_ids:
            q = q.filter(FMECAWorksheetModel.equipment_id.in_(equip_ids))
        else:
            return []
    if status:
        q = q.filter(FMECAWorksheetModel.status == status)
    db_rows = q.order_by(FMECAWorksheetModel.created_at.desc()).all()

    # Flatten worksheet rows into individual failure mode records for the frontend
    result = []
    for obj in db_rows:
        ws_rows = obj.rows or []
        for r in ws_rows:
            if isinstance(r, dict):
                result.append({
                    "id": r.get("row_id", ""),
                    "worksheet_id": obj.worksheet_id,
                    "equipment_id": obj.equipment_id,
                    "equipment_tag": obj.equipment_tag,
                    "equipment_name": obj.equipment_name,
                    "function": r.get("function_description", ""),
                    "failure_mode": r.get("failure_mode", ""),
                    "failure_effect_local": r.get("failure_effect", ""),
                    "failure_effect_system": r.get("failure_consequence", ""),
                    "severity": r.get("severity", 1),
                    "occurrence": r.get("occurrence", 1),
                    "detectability": r.get("detection", 1),
                    "rpn": r.get("rpn", 0),
                    "task_type": r.get("strategy_type", ""),
                    "current_controls": r.get("current_controls", ""),
                    "recommended_action": r.get("recommended_action", ""),
                })
        # If no rows yet, include the worksheet as a placeholder
        if not ws_rows:
            result.append({
                "id": obj.worksheet_id,
                "worksheet_id": obj.worksheet_id,
                "equipment_id": obj.equipment_id,
                "equipment_tag": obj.equipment_tag,
                "equipment_name": obj.equipment_name,
                "status": obj.status,
                "current_stage": obj.current_stage,
                "_is_empty_worksheet": True,
            })
    return result


def list_fmeca_suggestions(db: Session, plant_id: str | None = None, limit: int = 20) -> list[dict]:
    """Fase 3a — equipos con OTs P1/P2 cerradas y SIN worksheet FMECA asociado.
    Sugiere crear análisis FMECA para los que más fallas críticas han tenido.
    """
    from api.database.models import HierarchyNodeModel, ManagedWorkOrderModel
    from sqlalchemy import func as sql_func

    # Equipos de la planta (si se filtra por plant)
    equip_ids = None
    if plant_id:
        equip_ids = [
            n.node_id for n in db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.plant_id == plant_id,
                HierarchyNodeModel.node_type == "EQUIPMENT",
            ).all()
        ]
        if not equip_ids:
            return []

    # OTs cerradas P1/P2
    q = db.query(
        ManagedWorkOrderModel.equipment_id,
        ManagedWorkOrderModel.equipment_tag,
        sql_func.count(ManagedWorkOrderModel.wo_id).label("critical_count"),
        sql_func.max(ManagedWorkOrderModel.closed_at).label("last_closure"),
    ).filter(
        ManagedWorkOrderModel.priority_code.in_(["P1", "P2"]),
        ManagedWorkOrderModel.status == "CERRADO",
    )
    if equip_ids is not None:
        q = q.filter(ManagedWorkOrderModel.equipment_id.in_(equip_ids))
    rows = q.group_by(
        ManagedWorkOrderModel.equipment_id, ManagedWorkOrderModel.equipment_tag,
    ).order_by(sql_func.count(ManagedWorkOrderModel.wo_id).desc()).limit(limit * 3).all()

    # Worksheets ya existentes para descartarlos
    existing = {
        w.equipment_id for w in db.query(FMECAWorksheetModel.equipment_id).all()
    }
    # Criticality letter por equipo
    node_map = {}
    if rows:
        ids = [r.equipment_id for r in rows]
        for n in db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id.in_(ids)).all():
            node_map[n.node_id] = n

    suggestions = []
    for r in rows:
        if r.equipment_id in existing:
            continue
        node = node_map.get(r.equipment_id)
        suggestions.append({
            "equipment_id": r.equipment_id,
            "equipment_tag": r.equipment_tag or (node.tag if node else ""),
            "equipment_name": node.name if node else "",
            "equipment_criticality": node.criticality if node else None,
            "critical_closure_count": int(r.critical_count or 0),
            "last_closure": r.last_closure.isoformat() if r.last_closure else None,
        })
        if len(suggestions) >= limit:
            break
    return suggestions


def list_fmeca_worksheets_summary(db: Session, plant_id: str | None = None, status: str | None = None) -> list[dict]:
    """Return one entry per worksheet (NOT flattened per row) — for master/detail navigation."""
    from api.database.models import HierarchyNodeModel
    q = db.query(FMECAWorksheetModel)
    if plant_id:
        equip_ids = [
            n.node_id for n in db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.plant_id == plant_id,
                HierarchyNodeModel.node_type == "EQUIPMENT",
            ).all()
        ]
        if equip_ids:
            q = q.filter(FMECAWorksheetModel.equipment_id.in_(equip_ids))
        # If no equipment for plant, still return global worksheets (no plant filter applied)
    if status:
        q = q.filter(FMECAWorksheetModel.status == status)
    rows = q.order_by(FMECAWorksheetModel.created_at.desc()).all()
    # Bulk-load criticality for all referenced equipment nodes
    equip_ids_all = list({obj.equipment_id for obj in rows if obj.equipment_id})
    crit_map = {}
    if equip_ids_all:
        for n in db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id.in_(equip_ids_all)).all():
            crit_map[n.node_id] = n.criticality
    result = []
    for obj in rows:
        ws_rows = obj.rows or []
        rpn_vals = [r.get("rpn", 0) for r in ws_rows if isinstance(r, dict)]
        result.append({
            "worksheet_id": obj.worksheet_id,
            "equipment_id": obj.equipment_id,
            "equipment_tag": obj.equipment_tag,
            "equipment_name": obj.equipment_name,
            "equipment_criticality": crit_map.get(obj.equipment_id),
            "status": obj.status,
            "current_stage": obj.current_stage,
            "stage_completion": obj.stage_completion or {},
            "analyst": obj.analyst,
            "row_count": len(ws_rows),
            "max_rpn": max(rpn_vals) if rpn_vals else 0,
            "created_at": str(obj.created_at),
        })
    return result


def create_fmeca_from_rca(db: Session, analysis_id: str, analyst: str = "") -> dict:
    """Jorge 2026-04-23: FMECA ↔ RCA. Crea un worksheet FMECA pre-poblado con
    las causas identificadas en un RCA. Usa cause_effect (Ishikawa 5M) +
    solutions como filas sugeridas."""
    from api.database.models import RCAAnalysisModel
    rca = db.query(RCAAnalysisModel).filter(RCAAnalysisModel.analysis_id == analysis_id).first()
    if not rca:
        return {"error": "RCA not found"}

    # Crear worksheet
    ws_data = {
        "equipment_id": rca.equipment_id or "",
        "equipment_tag": rca.equipment_id or "",
        "equipment_name": (rca.event_description or "")[:80],
        "analyst": analyst,
        "plant_id": rca.plant_id,
    }
    result = create_fmeca_worksheet(db, ws_data)
    ws_id = result.get("worksheet_id")
    if not ws_id:
        return {"error": "No se pudo crear el worksheet"}

    # Convertir causas → filas FMECA
    ce = rca.cause_effect or {}
    categories = ['manpower', 'machine', 'method', 'material', 'measurement', 'environment']
    rows_added = 0
    for cat in categories:
        causes = ce.get(cat) or []
        if isinstance(causes, str): causes = [causes]
        for cause in causes:
            if not cause or (isinstance(cause, dict) and not cause.get('description')): continue
            desc = cause if isinstance(cause, str) else cause.get('description', '')
            row = {
                'function_description': f'Causa {cat}: {desc[:60]}',
                'functional_failure': (rca.event_description or '')[:200],
                'failure_mode': desc[:200],
                'failure_effect': f'Identificado en RCA {analysis_id[:8]}',
                'failure_consequence': 'EVIDENT_OPERATIONAL',
                'severity': 6, 'occurrence': 5, 'detection': 5,
                'recommended_action': f'Ver RCA {analysis_id[:8]} — análisis 5M categoría {cat}',
            }
            try:
                from api.database.models import FMECAWorksheetModel
                # Usa el service existente addFmecaRow vía engine
                from api.services.fmea_service import FMECAEngine as _Engine
                _Engine.add_row(ws_id, row)
                rows_added += 1
            except Exception: pass

    # Soluciones del RCA como rows con acción recomendada
    for sol in (rca.solutions or []):
        if isinstance(sol, dict) and sol.get('description'):
            row = {
                'function_description': f'Solución RCA',
                'functional_failure': sol.get('description', '')[:200],
                'failure_mode': sol.get('type', 'CAPA'),
                'failure_effect': 'Acción correctiva/preventiva del RCA',
                'failure_consequence': 'EVIDENT_OPERATIONAL',
                'severity': 5, 'occurrence': 4, 'detection': 4,
                'recommended_action': sol.get('description', '')[:300],
            }
            try:
                from api.services.fmea_service import FMECAEngine as _Engine
                _Engine.add_row(ws_id, row)
                rows_added += 1
            except Exception: pass

    # Link en el worksheet (campo ad-hoc)
    try:
        ws_obj = db.query(FMECAWorksheetModel).filter(FMECAWorksheetModel.worksheet_id == ws_id).first()
        if ws_obj and hasattr(ws_obj, 'analyst'):
            ws_obj.analyst = f"{ws_obj.analyst or ''} · desde RCA {analysis_id[:8]}".strip()
        db.commit()
    except Exception: pass

    return {"worksheet_id": ws_id, "rows_added": rows_added, "source_rca": analysis_id}


def fmeca_history_hints(db: Session, equipment_id: str, months: int = 12) -> list[dict]:
    """Jorge 2026-04-23: integración FMECA ↔ Fallas & Eventos.
    Dado un equipment_id, extrae las fallas correctivas cerradas de los últimos
    `months` meses (PM03 o priority P1/P2) y agrupa por failure_type/síntoma
    para sugerir filas FMECA al analista.

    Devuelve una lista de hints: {function_description, functional_failure,
    failure_mode, failure_effect, severity/occurrence/detection sugeridos,
    count (cuántas veces ocurrió), last_date}.
    """
    from api.database.models import ManagedWorkOrderModel
    from datetime import datetime, timedelta
    cutoff = datetime.now() - timedelta(days=months * 30)
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.equipment_id == equipment_id,
        ManagedWorkOrderModel.status == "CERRADO",
        ((ManagedWorkOrderModel.wo_type == "PM03") |
         (ManagedWorkOrderModel.priority_code.in_(["P1", "P2"]))),
        ManagedWorkOrderModel.closed_at >= cutoff,
    ).all()

    # Agrupar por failure_type (extraído de ai_classification o wo_title)
    import json as _json
    groups = {}
    for wo in wos:
        ai = wo.ai_classification if hasattr(wo, 'ai_classification') else None
        if isinstance(ai, str):
            try: ai = _json.loads(ai)
            except: ai = {}
        ai = ai or {}
        ftype = (ai.get("failure_type") or "").strip() or "Sin clasificar"
        mechanism = (ai.get("failure_mechanism") or ai.get("symptom") or "").strip()
        key = f"{ftype}|{mechanism}" if mechanism else ftype
        if key not in groups:
            groups[key] = {
                "failure_type": ftype,
                "mechanism": mechanism,
                "count": 0,
                "last_date": None,
                "total_hours": 0.0,
                "descriptions": set(),
            }
        g = groups[key]
        g["count"] += 1
        g["total_hours"] += float(wo.actual_hours or 0)
        if wo.closed_at and (g["last_date"] is None or wo.closed_at > g["last_date"]):
            g["last_date"] = wo.closed_at
        if wo.description:
            g["descriptions"].add(wo.description[:80])

    # Convertir a hints ordenados por frecuencia
    hints = []
    for key, g in sorted(groups.items(), key=lambda x: -x[1]["count"]):
        # Severidad sugerida según frecuencia + tipo de falla
        occ_suggested = min(9, 3 + g["count"])  # 3 base + más según count
        sev_suggested = 7 if "Seguridad" in key or "SAFETY" in key.upper() else 6
        det_suggested = 5
        hints.append({
            "function_description": f"Equipo {g['failure_type']} funcional",
            "functional_failure": g["mechanism"] or "Falla funcional detectada",
            "failure_mode": g["mechanism"] or g["failure_type"],
            "failure_effect": f"{g['count']} ocurrencia(s) en últimos {months}m · {g['total_hours']:.1f}h reparación total",
            "failure_consequence": "EVIDENT_OPERATIONAL",
            "severity": sev_suggested,
            "occurrence": occ_suggested,
            "detection": det_suggested,
            "recommended_action": f"Revisar plan de mantenimiento: {g['count']} fallas repetidas de {g['failure_type']}.",
            "_history_count": g["count"],
            "_last_date": g["last_date"].isoformat() if g["last_date"] else None,
        })
    return hints[:15]  # top 15


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


def add_fmeca_row(db: Session, worksheet_id: str, row_data: dict) -> dict:
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
        rows=[FMECARow(**r) for r in (obj.rows or []) if isinstance(r, dict)],
        stage_completion=obj.stage_completion or {},
    )
    ws = FMECAEngine.add_row(ws, row_data)

    obj.rows = [_row_to_dict(r) for r in ws.rows]
    obj.status = ws.status.value
    log_action(db, "fmeca_worksheet", obj.worksheet_id, "ADD_ROW")
    db.commit()

    added = obj.rows[-1] if obj.rows else {}
    return {"worksheet_id": obj.worksheet_id, "row": added, "total_rows": len(obj.rows)}


def _row_to_dict(r) -> dict:
    """Convert an FMECARow pydantic model to a plain dict."""
    if hasattr(r, "model_dump"):
        return r.model_dump(mode="json")
    return dict(r) if not isinstance(r, dict) else r


def get_fmeca_worksheet(db: Session, worksheet_id: str) -> dict | None:
    from api.database.models import HierarchyNodeModel
    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return None
    crit = None
    if obj.equipment_id:
        node = db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == obj.equipment_id).first()
        if node:
            crit = node.criticality
    return {
        "worksheet_id": obj.worksheet_id,
        "equipment_id": obj.equipment_id,
        "equipment_tag": obj.equipment_tag,
        "equipment_name": obj.equipment_name,
        "equipment_criticality": crit,
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


def generate_tasks_from_fmeca(db: Session, worksheet_id: str) -> dict:
    """Generate maintenance tasks from FMECA worksheet rows that have strategies."""
    from api.database.models import MaintenanceTaskModel
    from uuid import uuid4

    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return {"error": "Worksheet not found"}

    STRATEGY_TASK_MAP = {
        "CONDITION_BASED": {"constraint": "ONLINE", "freq": 30, "unit": "DAYS", "prefix": "CBM"},
        "FIXED_TIME": {"constraint": "OFFLINE", "freq": 90, "unit": "DAYS", "prefix": "TBM"},
        "FAULT_FINDING": {"constraint": "ONLINE", "freq": 180, "unit": "DAYS", "prefix": "FF"},
        "REDESIGN": {"constraint": "OFFLINE", "freq": 365, "unit": "DAYS", "prefix": "RDS"},
    }

    # Check for existing tasks from this worksheet to avoid duplicates
    existing_tasks = db.query(MaintenanceTaskModel).filter(
        MaintenanceTaskModel.origin.contains(worksheet_id),
    ).all()
    existing_origins = {(t.origin, t.task_type) for t in existing_tasks}

    created = []
    skipped = 0
    for r in (obj.rows or []):
        if not isinstance(r, dict):
            continue
        strategy = r.get("strategy_type", "")
        if not strategy or strategy == "RUN_TO_FAILURE":
            continue

        origin_val = f"{obj.equipment_tag}|{obj.equipment_id}|{worksheet_id}"
        if (origin_val, strategy) in existing_origins:
            skipped += 1
            continue

        cfg = STRATEGY_TASK_MAP.get(strategy, {"constraint": "ONLINE", "freq": 90, "unit": "DAYS", "prefix": strategy[:3]})
        fm_desc = r.get("failure_mode", "Unknown")
        task_id = f"TSK-{uuid4().hex[:8].upper()}"

        task = MaintenanceTaskModel(
            task_id=task_id,
            name=f"{cfg['prefix']}: {obj.equipment_tag} — {fm_desc[:50]}",
            name_fr="",
            task_type=strategy,
            constraint=cfg["constraint"],
            frequency_value=cfg["freq"],
            frequency_unit=cfg["unit"],
            origin=f"{obj.equipment_tag}|{obj.equipment_id}|{worksheet_id}",
            status="ACTIVE",
            ai_generated=True,
            ai_confidence=0.85,
        )
        db.add(task)
        created.append({"task_id": task_id, "name": task.name, "task_type": strategy})

    if created:
        log_action(db, "fmeca_worksheet", worksheet_id, "GENERATE_TASKS", {"count": len(created)})
        db.commit()

    result = {"worksheet_id": worksheet_id, "tasks_created": len(created), "tasks": created}
    if skipped:
        result["skipped_duplicates"] = skipped
    return result


def push_fmeca_to_backlog(db: Session, worksheet_id: str) -> dict:
    """Fase 3c — convierte las rows del FMECA con strategy_type en BacklogItem rows
    para que aparezcan en el backlog de Planning. Idempotente por (equipment_id, failure_mode)."""
    from api.database.models import BacklogItemModel
    obj = db.query(FMECAWorksheetModel).filter(
        FMECAWorksheetModel.worksheet_id == worksheet_id,
    ).first()
    if not obj:
        return {"error": "Worksheet not found"}
    rows = obj.rows or []
    existing = db.query(BacklogItemModel).filter(
        BacklogItemModel.equipment_id == obj.equipment_id,
        BacklogItemModel.blocking_reason.like("%FMECA%"),
    ).all()
    existing_keys = {(b.equipment_tag, (b.blocking_reason or "")) for b in existing}

    STRATEGY_TO_PM = {"CONDITION_BASED": "PM03", "FIXED_TIME": "PM02", "FAULT_FINDING": "PM02", "REDESIGN": "PM01"}
    # Jorge 2026-04-23: default priority para PM02 auto-generado depende de ventana
    # de intervención: parada-planta (shutdown) → P4; ventanas cortas/operando → P3.
    # Para otras estrategias se mantiene el mapping RPN estándar.
    STRATEGY_TO_PRIORITY = {"CRITICAL": "P1", "HIGH": "P2", "MEDIUM": "P3", "LOW": "P4"}

    created = []
    skipped = 0
    for r in rows:
        if not isinstance(r, dict):
            continue
        strategy = r.get("strategy_type")
        if not strategy or strategy == "RUN_TO_FAILURE":
            continue
        fm = r.get("failure_mode", "")
        reason = f"FMECA {worksheet_id} · {fm[:80]}"
        key = (obj.equipment_tag or "", reason)
        if key in existing_keys:
            skipped += 1
            continue
        cat = r.get("rpn_category", "LOW")
        severity = int(r.get("severity", 1) or 1)
        dur = float(r.get("duration", 2) or 2)
        qty = int(r.get("quantity", 1) or 1)
        # Jorge 2026-04-23: si es PM02 auto-generado, prioridad depende de ventana
        pm_type = STRATEGY_TO_PM.get(strategy, "PM02")
        default_priority = STRATEGY_TO_PRIORITY.get(cat, "P3")
        if pm_type == "PM02":
            # FIXED_TIME típicamente requiere parada de planta → P4; FAULT_FINDING
            # se hace operando con el equipo → P3.
            default_priority = "P4" if strategy == "FIXED_TIME" else "P3"
        item = BacklogItemModel(
            equipment_id=obj.equipment_id or "",
            equipment_tag=obj.equipment_tag or "",
            priority=default_priority,
            wo_type=pm_type,
            status="AWAITING_APPROVAL",
            blocking_reason=reason,
            estimated_hours=dur * qty,
            specialties=[r.get("specialty")] if r.get("specialty") else [],
            materials_ready=False,
            shutdown_required=(strategy == "FIXED_TIME"),
        )
        db.add(item)
        created.append({"equipment_tag": obj.equipment_tag, "failure_mode": fm, "strategy": strategy})
    if created:
        log_action(db, "fmeca_worksheet", worksheet_id, "PUSH_TO_BACKLOG", {"count": len(created)})
        db.commit()
    return {"worksheet_id": worksheet_id, "created": len(created), "skipped": skipped, "items": created}


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
