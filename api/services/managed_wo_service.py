"""Managed Work Orders service — full OT lifecycle (Jorge Phase 2)."""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database.models import ManagedWorkOrderModel, WorkRequestModel
from api.services.audit_service import log_action
from api.services.ws_manager import queue_notify


# Valid status transitions
TRANSITIONS = {
    "CREADO": ["LIBERADO", "PLANIFICADO", "PROGRAMADO", "CANCELADO"],
    "LIBERADO": ["PLANIFICADO", "EN_PROGRAMACION", "PROGRAMADO", "CANCELADO"],
    "PLANIFICADO": ["EN_PROGRAMACION", "PROGRAMADO", "CANCELADO"],
    "EN_PROGRAMACION": ["PROGRAMADO", "CANCELADO"],
    "PROGRAMADO": ["PROGRAMADO", "EN_EJECUCION", "REPROGRAMADO", "CANCELADO"],
    "REPROGRAMADO": ["PROGRAMADO", "CANCELADO"],
    "EN_EJECUCION": ["EN_EJECUCION", "COMPLETADO", "CERRADO", "REPROGRAMADO"],
    "COMPLETADO": ["CERRADO"],
    "CERRADO": [],
    "CANCELADO": [],
    # Legacy compat
    "PENDIENTE": ["LIBERADO", "PLANIFICADO", "CANCELADO"],
    "APROBADO": ["LIBERADO", "PLANIFICADO", "EN_PROGRAMACION", "PROGRAMADO", "EN_EJECUCION", "CANCELADO"],
    "EN_PROGRESO": ["COMPLETADO", "CERRADO", "REPROGRAMADO"],
}

WO_TYPES = ("PM01", "PM02", "PM03", "PM05")


_WO_NUM_LOCK = __import__("threading").Lock()


def _generate_wo_number(db: Session) -> str:
    """Auto-generate sequential WO number: OT-YYYY-NNNNN.

    Process-local lock evita race entre requests concurrentes.
    Single-worker actualmente (Dockerfile CMD); para multi-worker mover
    a UPDATE atomic en BD o uuid.
    """
    with _WO_NUM_LOCK:
        year = datetime.now().year
        prefix = f"OT-{year}-"
        last = (
            db.query(ManagedWorkOrderModel)
            .filter(ManagedWorkOrderModel.wo_number.like(f"{prefix}%"))
            .order_by(ManagedWorkOrderModel.wo_number.desc())
            .first()
        )
        if last:
            try:
                seq = int(last.wo_number.split("-")[-1]) + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:05d}"


def _wr_aviso_label(db: Session | None, work_request_id: str | None) -> str | None:
    """SF-649 — devuelve la etiqueta legible AV-NNNNN del aviso vinculado a la
    OT, o None si no hay vínculo o no se puede resolver. Lookup defensivo
    (no rompe si el FK es huérfano o si db no está disponible)."""
    if not work_request_id or db is None:
        return None
    try:
        from api.database.models import WorkRequestModel
        wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == work_request_id).first()
        if wr and getattr(wr, "aviso_number", None):
            return f"AV-{str(wr.aviso_number).zfill(5)}"
    except Exception:
        pass
    return None


def _to_dict(wo: ManagedWorkOrderModel, db: Session | None = None) -> dict:
    return {
        "wo_id": wo.wo_id,
        "wo_number": wo.wo_number,
        "work_request_id": wo.work_request_id,
        # SF-649 — etiqueta legible del aviso de origen (AV-NNNNN). Permite que
        # el tooltip y los links a "aviso de origen" muestren el código actual.
        "wr_aviso_label": _wr_aviso_label(db, wo.work_request_id),
        "plant_id": wo.plant_id,
        "equipment_id": wo.equipment_id,
        "equipment_tag": wo.equipment_tag,
        "wo_title": getattr(wo, "wo_title", None),
        "description": wo.description,
        "description_history": getattr(wo, "description_history", None) or [],
        "wo_type": wo.wo_type,
        "priority_code": wo.priority_code,
        "work_class": wo.work_class,
        # David 2026-04-28: backfill defensivo — OTs históricas con operations=[]
        # se sintetizan a 1 op para que el card desglose HH/disciplina correctamente.
        "operations": (wo.operations if wo.operations else ([{
            "op_number": 1,
            "description": (wo.description or "Intervención")[:200],
            "op_type": "INT",
            "specialty": (wo.work_center or "Mecánico"),
            "quantity": 1,
            "duration": float(wo.estimated_hours or 4.0),
            "estimated_hours": float(wo.estimated_hours or 4.0),
            "hours": float(wo.estimated_hours or 4.0),
            "planned_hours": float(wo.estimated_hours or 4.0),
            "_synthetic": True,
        }] if (wo.estimated_hours or 0) > 0 else [])),
        "materials": wo.materials or [],
        "tools": wo.tools or [],
        "support_equipment": getattr(wo, "support_equipment", None) or [],
        # SF-675 (2026-05-12): exponer total HH equipo de apoyo derivado para
        # que el frontend pueda mostrarlo en el header de la OT y rollup
        # opcional en capacity (sin tocar estimated_hours que cascadea a la
        # planificación). Cada item tiene `hours` o `quantity` (legacy).
        "support_hours_total": sum(
            float(s.get("hours") if isinstance(s, dict) and s.get("hours") is not None else (s.get("quantity") if isinstance(s, dict) else 0) or 0)
            for s in (getattr(wo, "support_equipment", None) or [])
            if isinstance(s, dict)
        ),
        "documents": wo.documents or [],
        "labour_summary": wo.labour_summary or {},
        "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
        "planned_end": wo.planned_end.isoformat() if wo.planned_end else None,
        "actual_start": wo.actual_start.isoformat() if wo.actual_start else None,
        "actual_end": wo.actual_end.isoformat() if wo.actual_end else None,
        "estimated_hours": wo.estimated_hours,
        "actual_hours": wo.actual_hours,
        "status": wo.status,
        "planned_by": wo.planned_by,
        "released_by": wo.released_by,
        "released_at": wo.released_at.isoformat() if wo.released_at else None,
        "closed_by": wo.closed_by,
        "closed_at": wo.closed_at.isoformat() if wo.closed_at else None,
        "closed_by_signature": getattr(wo, "closed_by_signature", None),
        "closure_notes": getattr(wo, "closure_notes", None),
        "post_closure_review": getattr(wo, "post_closure_review", None),
        "contractor_crew_id": getattr(wo, "contractor_crew_id", None),
        "version": getattr(wo, "version", 1),
        "assigned_workers": wo.assigned_workers or [],
        "completion_pct": wo.completion_pct,
        "execution_notes": wo.execution_notes or [],
        "risk_analysis": wo.risk_analysis,
        "budget_approved": wo.budget_approved,
        "budget_amount": wo.budget_amount,
        "labor_cost": wo.labor_cost,
        "material_cost": wo.material_cost,
        "external_cost": wo.external_cost,
        "actual_total_cost": wo.actual_total_cost,
        "is_fast_track": wo.is_fast_track,
        "shift": getattr(wo, "shift", "day") or "day",
        "planning_group": getattr(wo, "planning_group", None),
        "work_center": getattr(wo, "work_center", None),
        "technical_location": getattr(wo, "technical_location", None),
        "reservation_code": getattr(wo, "reservation_code", None),
        "cancellation_reason": getattr(wo, "cancellation_reason", None),
        "cancellation_type": getattr(wo, "cancellation_type", None),
        "absorbed_by_wo_id": getattr(wo, "absorbed_by_wo_id", None),
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
        "updated_at": wo.updated_at.isoformat() if wo.updated_at else None,
    }


def _lookup_equipment_master(db: Session, equipment_id: str) -> dict:
    """Jorge 2026-04-22 — los datos maestros (planning_group, work_center) deben
    leerse del hierarchy_node del equipo si están cargados en metadata_json.
    Si no hay metadata útil, devolvemos el NOMBRE del equipo + nombre del área
    padre para que el fallback por keywords tenga más información.
    """
    if not db or not equipment_id:
        return {}
    try:
        from api.database.models import HierarchyNodeModel
        node = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_id == equipment_id
        ).first()
        if not node:
            node = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.tag == equipment_id
            ).first()
        if not node:
            return {}
        meta = node.metadata_json if isinstance(node.metadata_json, dict) else {}
        # Walk up hasta encontrar el AREA padre — da contexto funcional.
        area_name = ""
        cursor = node
        for _ in range(10):
            if not cursor.parent_node_id:
                break
            parent = db.query(HierarchyNodeModel).filter(
                HierarchyNodeModel.node_id == cursor.parent_node_id
            ).first()
            if not parent:
                break
            if parent.node_type == "AREA":
                area_name = parent.name or ""
                break
            cursor = parent
        return {
            "planning_group": (meta.get("planning_group") or "").strip() or None,
            "work_center": (meta.get("work_center") or "").strip() or None,
            "equipment_name": node.name or "",
            "area_name": area_name,
        }
    except Exception:
        return {}


def _auto_planning_group(wo_type: str, priority: str, description: str, *, db=None, equipment_id: str = "") -> str:
    """Auto-assign planning group. Prioridad:
    1. node.metadata_json.planning_group (maestros del equipo)
    2. Keywords en description + nombre del equipo + nombre del área padre
    3. PM type fallback
    """
    master = _lookup_equipment_master(db, equipment_id) if (db and equipment_id) else {}
    if master.get("planning_group"):
        return master["planning_group"]

    # Enriquecer el texto con nombre del equipo y área para match más certero.
    parts = [description or "", master.get("equipment_name", ""), master.get("area_name", "")]
    dl = " ".join(parts).lower()
    if any(k in dl for k in ['electr', 'motor', 'panel', 'cable', 'voltage', 'circuit',
                              'variador', 'tablero', 'cct']):
        return 'ELEC-01'
    if any(k in dl for k in ['instrum', 'sensor', 'transm', 'plc', 'dcs', 'calibra',
                              'valvula control', 'indicador', 'medidor']):
        return 'INST-01'
    if any(k in dl for k in ['estructur', 'soldadura', 'weld', 'crack', 'corrosion',
                              'foundation', 'civil', 'pintura']):
        return 'STRU-01'
    if wo_type == 'PM02':
        return 'PREV-01'
    return 'MECH-01'


def _auto_work_center(planning_group: str, plant_id: str, *, db=None, equipment_id: str = "") -> str:
    """Auto-assign work center. Prioridad:
    1. node.metadata_json.work_center (maestros del equipo)
    2. Mapping desde planning_group
    """
    master = _lookup_equipment_master(db, equipment_id) if (db and equipment_id) else {}
    if master.get("work_center"):
        return master["work_center"]

    prefix = (plant_id or 'PLT')[:3].upper()
    center_map = {
        'MECH-01': f'{prefix}-MEC01',
        'ELEC-01': f'{prefix}-ELE01',
        'INST-01': f'{prefix}-INS01',
        'STRU-01': f'{prefix}-STR01',
        'PREV-01': f'{prefix}-PRV01',
    }
    return center_map.get(planning_group, f'{prefix}-GEN01')


def create_work_order(
    db: Session,
    equipment_tag: str,
    description: str,
    wo_type: str = "PM01",
    priority_code: str = "P3",
    plant_id: str = "OCP-JFC1",
    work_request_id: str | None = None,
    planned_by: str | None = None,
    estimated_hours: float = 4.0,
    operations: list | None = None,
    materials: list | None = None,
    tools: list | None = None,
    planning_group: str | None = None,
    work_center: str | None = None,
    wo_title: str | None = None,
    technical_location: str | None = None,
    risk_analysis: dict | None = None,
) -> dict:
    """Create a new managed work order (optionally from an approved WR).
    P1/P2 priorities trigger fast track: OT created directly in RELEASED status."""
    # SF-533 (Jorge 2026-04-25): bloquear creación PM02 hasta cargar maestros
    # de estrategia. Override via env var DISABLE_PM02_CREATION=false.
    import os as _os_pm02
    if wo_type == "PM02" and _os_pm02.environ.get("DISABLE_PM02_CREATION", "true").lower() == "true":
        from fastapi import HTTPException
        raise HTTPException(
            status_code=409,
            detail="Creación de OT PM02 deshabilitada hasta cargar maestros de estrategia (SF-533). "
                   "Para habilitar: setear DISABLE_PM02_CREATION=false.",
        )

    wo_number = _generate_wo_number(db)
    work_class = "NO_PROGRAMADO" if priority_code in ("P1", "P2") else "PROGRAMADO"
    is_fast_track = priority_code in ("P1", "P2")

    # Auto-estimate budget from hours (labor rate from platform settings, default $50/hr)
    from api.routers.admin import _platform_settings
    LABOR_RATE = float(_platform_settings.get("laborRate", 50.0))
    auto_budget = round(estimated_hours * LABOR_RATE, 2)

    # Auto-assign planning group and work center if not provided.
    # Jorge 2026-04-22: leer primero de hierarchy_nodes.metadata_json del equipo.
    pg = planning_group or _auto_planning_group(
        wo_type, priority_code, description, db=db, equipment_id=equipment_tag
    )
    wc = work_center or _auto_work_center(
        pg, plant_id, db=db, equipment_id=equipment_tag
    )

    wo = ManagedWorkOrderModel(
        wo_number=wo_number,
        work_request_id=work_request_id,
        plant_id=plant_id,
        equipment_id=equipment_tag,
        equipment_tag=equipment_tag,
        wo_title=(wo_title or None),
        description=description,
        wo_type=wo_type,
        priority_code=priority_code,
        work_class=work_class,
        planning_group=pg,
        work_center=wc,
        technical_location=(technical_location or None),
        planned_by=planned_by,
        estimated_hours=estimated_hours,
        budget_amount=auto_budget,
        # David 2026-04-28 (Jorge bug "Sin operaciones definidas" en OT 49.5h):
        # garantizar que TODA OT tenga al menos 1 operación con la HH del estimate.
        # Antes podía quedar [] si el caller no pasaba operations → la card del
        # tablero mostraba "Sin operaciones" sin desglose.
        operations=(operations if operations else [{
            "op_number": 1,
            "description": (description or "Intervención")[:200],
            "op_type": "INT",
            "specialty": (wc or "Mecánico"),
            "quantity": 1,
            "duration": float(estimated_hours or 4.0),
            "estimated_hours": float(estimated_hours or 4.0),
            "planned_hours": float(estimated_hours or 4.0),
        }]),
        materials=materials or [],
        tools=tools or [],
        is_fast_track=is_fast_track,
        risk_analysis=risk_analysis or None,
    )

    # Fast track: P1/P2 skip planning → go directly to APROBADO
    if is_fast_track:
        wo.status = "PROGRAMADO"
        wo.released_by = planned_by
        wo.released_at = datetime.now()
        wo.execution_notes = [{
            "timestamp": datetime.now().isoformat(),
            "user": planned_by or "system",
            "note": f"[FAST TRACK] OT creada directamente en PROGRAMADO por prioridad {priority_code}",
        }]

    db.add(wo)
    log_action(db, "managed_work_order", wo.wo_id, "CREATE", user=planned_by or "system")
    if is_fast_track:
        log_action(db, "managed_work_order", wo.wo_id, "FAST_TRACK_PROGRAMADO", user=planned_by or "system")
    db.commit()
    db.refresh(wo)
    # Jorge 2026-04-27: broadcast wo_created para refrescar Planning/Scheduling
    # automáticamente cuando alguien crea una OT desde otra pestaña/sesión.
    try:
        queue_notify(
            "wo_created",
            {"wo_id": wo.wo_id, "wo_number": wo.wo_number, "status": wo.status, "priority": wo.priority_code},
            wo.plant_id,
        )
    except Exception:
        pass
    return _to_dict(wo, db)


def create_from_work_request(db: Session, request_id: str, planned_by: str = "", plant_id: str | None = None) -> dict | None:
    """Create a WO from an approved WR — copies equipment, priority, description, operations, materials."""
    wr = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == request_id).first()
    if not wr:
        return None
    if wr.status not in ("VALIDATED", "APPROVED", "ASSIGNED", "APROBADO"):
        return None

    ai = wr.ai_classification if isinstance(wr.ai_classification, dict) else {}
    pd = wr.problem_description if isinstance(wr.problem_description, dict) else {}
    desc_text = pd.get("original_text", "") if isinstance(pd, dict) else str(wr.problem_description or "")

    # Build materials from WR spare_parts or materials field
    materials = []
    wr_mats = getattr(wr, "materials", None)
    if isinstance(wr_mats, list) and wr_mats:
        for m in wr_mats:
            if isinstance(m, dict):
                materials.append({
                    "code": m.get("sapId", m.get("code", m.get("material_code", ""))),
                    "description": m.get("description", m.get("name", "")),
                    "quantity": int(m.get("quantity", 1) or 1),
                    "unit": m.get("unit", "PZ"),
                })
    if not materials and isinstance(wr.spare_parts, list):
        for sp in wr.spare_parts:
            if isinstance(sp, dict):
                materials.append({
                    "code": sp.get("code", sp.get("sapId", sp.get("material_code", ""))),
                    "description": sp.get("description", sp.get("name", "")),
                    "quantity": int(sp.get("quantity", sp.get("qty", 1)) or 1),
                    "unit": sp.get("unit", "PZ"),
                })
    if not materials and isinstance(pd, dict):
        for m in (pd.get("materials", []) or []):
            if isinstance(m, dict):
                materials.append({
                    "code": m.get("sapId", m.get("code", "")),
                    "description": m.get("description", ""),
                    "quantity": int(m.get("quantity", 1) or 1),
                    "unit": m.get("unit", "PZ"),
                })

    # Build operations from WR resources or classification data
    operations = []
    op_num = 1
    suggested = pd.get("suggested_action", "") if isinstance(pd, dict) else ""
    if not suggested:
        suggested = ai.get("recommended_action", "")
    failure_type = ai.get("failure_type", "")
    failure_class = ai.get("failure_class", "")
    est_hours = ai.get("estimated_duration_hours", 4.0) or 4.0

    # Jorge SF-509: cada paso numerado del suggested_action debe ser una operación
    # independiente. Mapear recursos[i] a la operación i (fallback a recursos[0]).
    import re as _re
    # Bug 2026-04-30: WorkRequestModel no tiene columna `resources` directa.
    # El form Failure Capture las guarda en problem_description.resources.
    # Antes: getattr(wr, "resources") → None siempre → fallback genérico se
    # ejecutaba aunque el WR tuviera 3 labours definidos. Resultado: OT con
    # ops genéricas INSTRUMENTACION en vez de Lubrication/Boilermaker/Mechanical.
    wr_resources = getattr(wr, "resources", None)
    if not wr_resources and isinstance(pd, dict):
        wr_resources = pd.get("resources") or []
    if not isinstance(wr_resources, list):
        wr_resources = []
    steps = []
    if suggested:
        # SF-647 (2026-05-05) — algunos avisos guardan los pasos en una sola
        # línea (`1. Detener... 2. Posicionar... 3. Inspección...`). El split
        # por \n no detectaba estos casos y la OT quedaba con 1 op de 48h
        # bundleando todo. Normalizamos primero forzando salto antes de cada
        # número-punto, luego procesamos como antes.
        # SF-720 (2026-05-12) — el parser sólo aceptaba `1.` / `1)`. Si Claude
        # respondía con `- ...` / `* ...` / `• ...` / `Paso N:` / `Step N:`,
        # `steps` quedaba vacío y caía al fallback que generaba 1 op por
        # recurso (no por actividad IA). Ampliamos la detección y caemos a
        # split por línea cuando ningún prefijo numérico/viñeta matchea.
        normalized = _re.sub(r"\s+(\d+[\.\)])\s+", r"\n\1 ", str(suggested))
        STEP_PREFIX = _re.compile(
            r"^(?:\d+[\.\)]|[-*•·]|paso\s*\d+\s*[:\-\.]?|step\s*\d+\s*[:\-\.]?)\s*(.+)$",
            _re.IGNORECASE,
        )
        for line in normalized.split("\n"):
            line = line.strip()
            if not line:
                continue
            m = STEP_PREFIX.match(line)
            if m:
                steps.append(m.group(1).strip())
        # Fallback: ningún prefijo conocido pero la sugerencia tiene múltiples
        # líneas → tratamos cada línea no vacía como un paso.
        if not steps:
            raw_lines = [ln.strip(" -*•·\t") for ln in str(suggested).split("\n") if ln.strip()]
            if len(raw_lines) > 1:
                steps = raw_lines
    if steps:
        # Bug 2026-04-30: si hay más steps que resources, los extras
        # replicaban resources[0] inflando HH (ej. 7 mech ops × 16 HH = 112).
        # Fix: para steps i>=len(resources) usar default mínimo (1p, 1h)
        # para que los totales reflejen lo que el usuario ingresó en LABOUR.
        for i, step_desc in enumerate(steps):
            if i < len(wr_resources) and isinstance(wr_resources[i], dict):
                res = wr_resources[i]
                qty = int(res.get("quantity", 1) or 1)
                dur = float(res.get("hours", 1) or 1)
                spec = res.get("type", failure_type or "Mecánico")
                op_type = res.get("op_type", "INT")
            else:
                # Step sin recurso explícito → default mínimo, NO replicar res[0]
                qty = 1
                dur = 1.0
                spec = failure_type or "Mecánico"
                op_type = "INT"
            operations.append({
                "op_number": op_num,
                "description": step_desc,
                "op_type": op_type,
                "specialty": spec,
                "quantity": qty,
                "duration": dur,
                "hours": dur,  # legacy field que el frontend Planning lee
                "estimated_hours": qty * dur,
                "planned_hours": qty * dur,
            })
            op_num += 1
    elif wr_resources:
        # Sin suggested_action estructurado: 1 op por recurso
        for res in wr_resources:
            if isinstance(res, dict):
                qty = int(res.get("quantity", 1) or 1)
                dur = float(res.get("hours", 1) or 1)
                operations.append({
                    "op_number": op_num,
                    "description": suggested or res.get("type", "Intervención"),
                    "op_type": res.get("op_type", "INT"),
                    "specialty": res.get("type", failure_type or "Mecánico"),
                    "quantity": qty,
                    "duration": dur,
                    "hours": dur,  # legacy field
                    "estimated_hours": qty * dur,
                    "planned_hours": qty * dur,
                })
                op_num += 1
    else:
        # Fallback: build from AI classification
        if suggested:
            operations.append({
                "op_number": op_num,
                "description": suggested,
                "op_type": "INT",
                "specialty": failure_type or "Mecánico",
                "quantity": 1,
                "duration": est_hours,
                "estimated_hours": est_hours,
                "planned_hours": est_hours,
            })
            op_num += 1

        if failure_class and failure_class != suggested:
            operations.append({
                "op_number": op_num,
                "description": f"Inspección: {failure_class}",
                "op_type": "INT",
                "specialty": failure_type or "Mecánico",
                "quantity": 1,
                "duration": 1.0,
                "estimated_hours": 1.0,
                "planned_hours": 1.0,
            })
            op_num += 1

    # Fallback: at least one generic operation
    if not operations:
        operations.append({
            "op_number": 1,
            "description": suggested or desc_text[:200] or "Intervención correctiva",
            "op_type": "INT",
            "specialty": failure_type or "Mecánico",
            "quantity": 1,
            "duration": est_hours,
            "estimated_hours": est_hours,
            "planned_hours": est_hours,
        })
        op_num = 2

    # Jorge SF-510: trabajos con equipo detenido terminan siempre con Limpieza y Housekeeping.
    is_shutdown = bool(getattr(wr, "shutdown_required", False)) or \
        (isinstance(ai, dict) and (ai.get("equipment_stopped") or ai.get("activity_class") == "PARADA"))
    if is_shutdown:
        operations.append({
            "op_number": op_num,
            "description": "Limpieza y Housekeeping del área de trabajo",
            "op_type": "INT",
            "specialty": "Helper",
            "quantity": 2,
            "duration": 1.0,
            "estimated_hours": 2.0,
            "planned_hours": 2.0,
        })

    # Jorge 2026-04-21 — clasificación correcta SAP PM:
    #   P1/P2 → PM03 (correctivo de falla, bypass planning, al supervisor)
    #   P3/P4 → PM01 (correctivo programado, al planificador)
    #   Estrategia auto-generada (sin WR) → PM02 (preventivo)
    # Ver transcripción 2026-04-21 13:23 línea ~46-54, 683-708.
    wo_type_map = {"P1": "PM03", "P2": "PM03", "P3": "PM01", "P4": "PM01"}
    text_to_pm = {"CORRECTIVO": "PM01", "PREVENTIVO": "PM02", "PREDICTIVO": "PM03", "MEJORA": "PM03"}
    # David 2026-04-28: la prioridad del aviso DOMINA sobre la sugerencia IA.
    # Antes, si la IA clasificaba como "PREVENTIVO" / "PM02" un aviso P1/P2 fast-track,
    # el wo_type quedaba PM02 y reventaba contra el bloqueo SF-533 → 409 → "Failed
    # to create WO — create it manually". Para WRs siempre derivamos del priority_code.
    wo_type = wo_type_map.get(wr.priority_code, "PM01")
    # Solo si la IA explícitamente devolvió un PMxx que coincide con la prioridad
    # respetamos el tipo IA (caso defensivo).
    raw_type = ai.get("work_order_type", "") if isinstance(ai, dict) else ""
    if raw_type and raw_type.startswith("PM") and raw_type != "PM02":
        wo_type = raw_type
    elif raw_type in text_to_pm and text_to_pm[raw_type] != "PM02":
        wo_type = text_to_pm[raw_type]

    # Use explicit plant_id from request, then AI classification, then fallback
    plant = plant_id or ai.get("plant_id") or "GOLDFIELDS-SN"

    # Jorge 2026-04-27: propagar technical_location del aviso a la OT.
    # La TL puede estar en ai_classification.technical_location o problem_description.technical_location.
    tl_from_wr = (
        (ai.get("technical_location") if isinstance(ai, dict) else None)
        or (pd.get("technical_location") if isinstance(pd, dict) else None)
        or (pd.get("technical_location_code") if isinstance(pd, dict) else None)
        or None
    )

    # Propagate risk level from WR ai_classification to OT risk_analysis
    wr_risk_level = ai.get("risk_level") if isinstance(ai, dict) else None
    wr_risk = None
    if wr_risk_level:
        wr_risk = {"risk_level": wr_risk_level, "source": "work_request", "wr_id": request_id}

    result = create_work_order(
        db=db,
        equipment_tag=wr.equipment_tag,
        description=desc_text,
        wo_type=wo_type,
        priority_code=wr.priority_code or "P3",
        plant_id=plant,
        work_request_id=request_id,
        planned_by=planned_by,
        estimated_hours=ai.get("estimated_duration_hours", 4.0) or 4.0,
        operations=operations,
        materials=materials,
        wo_title=(ai.get("wo_title") if isinstance(ai, dict) else None) or None,
        technical_location=tl_from_wr,
        risk_analysis=wr_risk,
    )

    # SF-594 BUG-3 (2026-05-04) — propagar fotos del WR a la OT.
    # Las fotos vivían en field_captures.images o wr.documents[type=photo] y
    # no se copiaban a la OT al promover. Resultado: la OT generada desde un
    # aviso no mostraba las fotos del reporte original. Las anexamos a
    # wo.documents con type=photo para render uniforme en cualquier vista.
    if result:
        try:
            from api.database.models import FieldCaptureModel
            wr_photos = []
            if wr.source_capture_id:
                cap = db.query(FieldCaptureModel).filter(
                    FieldCaptureModel.capture_id == wr.source_capture_id
                ).first()
                if cap and cap.images:
                    wr_photos = list(cap.images)
            if not wr_photos and wr.documents:
                docs_list = wr.documents if isinstance(wr.documents, list) else []
                wr_photos = [
                    d.get("data") for d in docs_list
                    if isinstance(d, dict) and d.get("type") == "photo" and d.get("data")
                ]
            if wr_photos:
                wo_obj = db.query(ManagedWorkOrderModel).filter(
                    ManagedWorkOrderModel.wo_id == result["wo_id"]
                ).first()
                if wo_obj is not None:
                    existing = wo_obj.documents or []
                    for i, data in enumerate(wr_photos):
                        existing.append({
                            "name": f"aviso_foto_{i+1}.jpg",
                            "data": data,
                            "type": "photo",
                            "source": "work_request",
                            "wr_id": request_id,
                        })
                    wo_obj.documents = existing
                    db.commit()
        except Exception:
            pass

    # Jorge 2026-04-28 17:56 — propagar equipos de apoyo del aviso a la OT.
    # Antes se quedaban sólo en el WR y se perdían en planificación/ejecución/reportes.
    wr_support = getattr(wr, "support_equipment", None)
    wr_circ = getattr(wr, "circumstances", None)
    if result and (wr_support or wr_circ):
        wo_obj = db.query(ManagedWorkOrderModel).filter(
            ManagedWorkOrderModel.wo_id == result["wo_id"]
        ).first()
        if wo_obj:
            if wr_support:
                wo_obj.support_equipment = wr_support
                result["support_equipment"] = wr_support
            # 0B4 BUG-04 (reunión VSC 2026-05-11): NO concatenar más
            # "— Circunstancias del aviso —" a la description de la OT. El
            # campo circunstancias fue eliminado del flujo (0B4), así que el
            # texto ya no debería aparecer en listados/detalle. La data legacy
            # de WR.circumstances queda en BD pero no se propaga visualmente.
            db.commit()

    # Update WR status so it can't create duplicate WOs
    if result:
        wr.status = "OT_CREADA"
        db.commit()

    return result


def get_work_order(db: Session, wo_id: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    return _to_dict(wo, db) if wo else None


def _to_light_dict(wo: ManagedWorkOrderModel, db: Session | None = None) -> dict:
    """Slim projection for list views — ~300 bytes/WO instead of ~1.7KB.

    Contains only the fields that the scheduling panel, planning list, and execution
    inbox actually read. Any view needing operations/materials/history should fetch
    the full WO via GET /{wo_id}.

    David 2026-04-28 (Jorge captura "OPERATIONS · 0"): el card del scheduling
    espera operations + reservation_code para renderizar HH-by-discipline y
    el badge RES-xxx. Antes light dict los omitía; el card mostraba "Sin
    operaciones definidas" aunque la OT tuviera estimated_hours. Ahora
    incluimos operations slim (solo campos que el card lee) + reservation_code.
    """
    # Operations slim: solo campos usados por ExpandedWOCard (description,
    # specialty, hours, quantity, parallel, parallel_group, work_center).
    raw_ops = wo.operations if isinstance(wo.operations, list) else []
    if raw_ops:
        ops_slim = [
            {
                "description": (op.get("description") or op.get("task") or "")[:120] if isinstance(op, dict) else "",
                "specialty": op.get("specialty") if isinstance(op, dict) else None,
                "work_center": op.get("work_center") if isinstance(op, dict) else None,
                "hours": op.get("hours") if isinstance(op, dict) else None,
                "quantity": op.get("quantity", 1) if isinstance(op, dict) else 1,
                "parallel": op.get("parallel", False) if isinstance(op, dict) else False,
                "parallel_group": op.get("parallel_group") if isinstance(op, dict) else None,
            }
            for op in raw_ops[:20]  # cap a 20 ops para mantener slim
        ]
    elif (wo.estimated_hours or 0) > 0:
        # Sintético: 1 op con la HH del WO + work_center como specialty.
        # Para que el card siempre tenga algo que mostrar.
        ops_slim = [{
            "description": (wo.description or "Intervención")[:120],
            "specialty": wo.work_center or "Mecánico",
            "work_center": wo.work_center,
            "hours": float(wo.estimated_hours or 0),
            "quantity": 1,
            "parallel": False,
            "parallel_group": None,
            "_synthetic": True,
        }]
    else:
        ops_slim = []
    # Materials slim: el card sólo necesita el reservation_code y count para
    # mostrar 'Materials ready RES-xxx'. La lista completa se carga al expandir.
    raw_mats = wo.materials if isinstance(wo.materials, list) else []
    return {
        "wo_id": wo.wo_id,
        "wo_number": wo.wo_number,
        "plant_id": wo.plant_id,
        "equipment_tag": wo.equipment_tag,
        "wo_title": getattr(wo, "wo_title", None),
        "description": wo.description,
        "description_history": getattr(wo, "description_history", None) or [],
        "wo_type": wo.wo_type,
        "priority_code": wo.priority_code,
        "status": wo.status,
        "estimated_hours": wo.estimated_hours,
        "actual_hours": wo.actual_hours,
        "planned_start": wo.planned_start.isoformat() if wo.planned_start else None,
        "planned_end": wo.planned_end.isoformat() if wo.planned_end else None,
        "assigned_workers": wo.assigned_workers or [],
        "completion_pct": wo.completion_pct,
        "is_fast_track": wo.is_fast_track,
        "shift": getattr(wo, "shift", "day") or "day",
        "planning_group": getattr(wo, "planning_group", None),
        "work_center": getattr(wo, "work_center", None),
        "operations": ops_slim,
        "materials_count": len(raw_mats),
        "reservation_code": getattr(wo, "reservation_code", None),
        "support_equipment": getattr(wo, "support_equipment", None) or [],
        # SF-675: HH total equipo de apoyo (ver _to_dict completo arriba).
        "support_hours_total": sum(
            float(s.get("hours") if isinstance(s, dict) and s.get("hours") is not None else (s.get("quantity") if isinstance(s, dict) else 0) or 0)
            for s in (getattr(wo, "support_equipment", None) or [])
            if isinstance(s, dict)
        ),
        "cancellation_type": getattr(wo, "cancellation_type", None),
        "absorbed_by_wo_id": getattr(wo, "absorbed_by_wo_id", None),
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
        # SF-649 — etiqueta legible del aviso de origen, también en lista light
        "work_request_id": wo.work_request_id,
        "wr_aviso_label": _wr_aviso_label(db, wo.work_request_id),
    }


def list_work_orders(
    db: Session,
    status: str | None = None,
    plant_id: str | None = None,
    wo_type: str | None = None,
    priority: str | None = None,
    limit: int = 200,
    offset: int = 0,
    fast_track: bool | None = None,
    light: bool = False,
    paginated: bool = False,
) -> list[dict] | dict:
    """List WOs. When paginated=True returns {items, total, limit, offset, has_more}.
    Legacy callers (paginated=False) still receive a bare list for back-compat."""
    q = db.query(ManagedWorkOrderModel)
    if status:
        q = q.filter(ManagedWorkOrderModel.status == status)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    if wo_type:
        q = q.filter(ManagedWorkOrderModel.wo_type == wo_type)
    if priority:
        q = q.filter(ManagedWorkOrderModel.priority_code == priority)
    if fast_track is not None:
        q = q.filter(ManagedWorkOrderModel.is_fast_track == fast_track)
    total = q.count() if paginated else None
    items = q.order_by(ManagedWorkOrderModel.created_at.desc()).offset(offset).limit(limit).all()
    rows = [_to_light_dict(wo, db) for wo in items] if light else [_to_dict(wo, db) for wo in items]
    if paginated:
        return {
            "items": rows,
            "total": total or 0,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + len(rows)) < (total or 0),
        }
    return rows


class OptimisticLockError(Exception):
    """Raised when If-Match version does not match current WO.version."""
    def __init__(self, current_version: int, sent_version: int):
        self.current_version = current_version
        self.sent_version = sent_version
        super().__init__(f"version mismatch: current={current_version} sent={sent_version}")


def update_work_order(db: Session, wo_id: str, data: dict, if_match_version: int | None = None) -> dict | None:
    """Update planning fields on a WO (before execution starts)."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status in ("CERRADO", "CANCELADO"):
        return None
    # SF-570 — prohibir convertir una OT programada (PM01/PM02) en falla.
    # Si el caller intenta cambiar priority_code → P1/P2 o wo_type → PM03 sobre
    # una OT PM01/PM02, se bloquea para no contaminar estadísticas de programa.
    # La falla debe crearse como una NUEVA OT PM03 (ver SF-569).
    if wo.wo_type in ("PM01", "PM02"):
        new_pri = (data.get("priority_code") or "").upper()
        new_type = (data.get("wo_type") or "").upper()
        if new_pri in ("P1", "P2") or new_type == "PM03":
            from fastapi import HTTPException
            try:
                log_action(db, "managed_work_order", wo.wo_id, "BLOCKED_FAILURE_LOAD",
                           payload={"attempted_priority": new_pri, "attempted_type": new_type, "wo_type": wo.wo_type})
            except Exception:
                pass
            raise HTTPException(
                status_code=409,
                detail=(
                    f"No puede cargar una falla sobre una OT programada ({wo.wo_type}). "
                    f"Cree una OT de falla nueva (PM03) — ver botón 'Convertir Aviso → PM03'."
                ),
            )
    # SF-577 — Prohibir setear status=EN_EJECUCION vía update genérico. El paso
    # a "En Ejecución" debe ser MANUAL desde el botón Start (POST .../start),
    # nunca implícito por save de campos. Esto evita que el sistema marque OTs
    # como ejecutándose por error y desvirtúe los KPIs de tiempo real.
    new_status = (data.get("status") or "").upper()
    if new_status == "EN_EJECUCION" and wo.status != "EN_EJECUCION":
        from fastapi import HTTPException
        raise HTTPException(
            status_code=409,
            detail=(
                "El estatus EN_EJECUCION solo puede asignarse manualmente con el botón "
                "'Iniciar Ejecución' (POST /managed-work-orders/{id}/start). "
                "No se permite setearlo vía update."
            ),
        )
    # SF-600 BUG-9 — bloquear reversiones de estado vía update genérico. Sólo
    # se permite avanzar (forward) o quedarse igual. Reversiones explícitas
    # deben ir por endpoints dedicados (/draft, /reschedule, /cancel) que
    # quedan en audit_log con razón.
    # 2026-05-05: EN_PROGRAMACION y PROGRAMADO comparten nivel 3 — Auto-Schedule
    # legítimamente "desreserva" (PROGRAMADO → EN_PROGRAMACION) cuando el
    # planificador re-distribuye antes de aplicar Reservar Semana.
    _STATUS_ORDER = {
        "CREADO": 0, "DRAFT": 0, "PENDIENTE": 0,
        "LIBERADO": 1, "RELEASED": 1,
        "PLANIFICADO": 2, "PLANNED": 2, "APROBADO": 2,
        "EN_PROGRAMACION": 3,
        "PROGRAMADO": 3, "SCHEDULED": 3,  # mismo nivel que EN_PROGRAMACION
        "REPROGRAMADO": 3,
        "EN_EJECUCION": 5, "IN_EXECUTION": 5,
        "COMPLETADO": 6,
        "CERRADO": 7, "CLOSED": 7,
        "CANCELADO": 8,     # terminal
    }
    if new_status and new_status != (wo.status or "").upper():
        cur_lvl = _STATUS_ORDER.get((wo.status or "").upper(), -1)
        new_lvl = _STATUS_ORDER.get(new_status, -1)
        if cur_lvl >= 0 and new_lvl >= 0 and new_lvl < cur_lvl and new_status not in ("CANCELADO", "REPROGRAMADO"):
            from fastapi import HTTPException
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Reversión de estado bloqueada: {wo.status} → {new_status}. "
                    f"Use el endpoint dedicado (/draft, /reschedule, /cancel) si necesita revertir explícitamente."
                ),
            )
    # Fase 9 Jorge 2026-04-21 — optimistic concurrency. Si el cliente mandó
    # If-Match y la versión actual es distinta, otro usuario ya modificó la
    # OT en el ínterin → rechaza con 409.
    current_version = getattr(wo, "version", None) or 1
    if if_match_version is not None and int(if_match_version) != current_version:
        raise OptimisticLockError(current_version, int(if_match_version))

    updatable = [
        "description", "wo_type", "priority_code", "estimated_hours",
        "operations", "materials", "tools", "support_equipment", "documents", "labour_summary",
        "planned_start", "planned_end", "actual_start", "actual_end",
        "risk_analysis", "budget_amount", "budget_approved",
        "labor_cost", "material_cost", "external_cost", "actual_total_cost", "actual_hours", "shift",
        "assigned_workers", "status", "planning_group", "work_center",
        "reservation_code", "cancellation_reason", "reschedule_reason", "completion_pct", "execution_notes",
        "start_location", "started_via",
        "contractor_crew_id",  # Group C #8
    ]
    # Group B #2 — capture per-field diff for audit trail. Only track scalar
    # fields (JSON blobs are noisy; we log a single "changed" marker).
    _AUDITED_FIELDS = (
        "description", "wo_type", "priority_code", "estimated_hours",
        "planned_start", "planned_end", "actual_start", "actual_end",
        "actual_hours", "shift", "status", "planning_group", "work_center",
        "budget_amount", "budget_approved", "labor_cost", "material_cost",
        "external_cost", "actual_total_cost", "completion_pct",
        "reservation_code", "cancellation_reason",
    )
    _changes = {}
    for key in _AUDITED_FIELDS:
        if key in data:
            old = getattr(wo, key, None)
            if hasattr(old, "isoformat"):
                old = old.isoformat()
            new = data[key]
            if hasattr(new, "isoformat"):
                new = new.isoformat()
            if old != new:
                _changes[key] = {"from": old, "to": new}

    # SF-653 (jornada VSC 2026-05-08) — historial inmutable de ediciones de
    # description. Antes de aplicar el cambio, si description cambió, push'eamos
    # la versión actual al `description_history` con timestamp + autor.
    if "description" in data and data["description"] != wo.description:
        history = list(wo.description_history or [])
        # Primera edición: capturar la descripción ORIGINAL (lo que está en BD ahora)
        if not history and wo.description:
            history.append({
                "text": wo.description,
                "edited_at": (wo.created_at.isoformat() if wo.created_at else None),
                "edited_by": "(original)",
                "is_original": True,
            })
        # Push nuevo estado: el valor entrante con autor + timestamp ahora.
        history.append({
            "text": data["description"],
            "edited_at": datetime.now().isoformat(),
            "edited_by": data.get("updated_by", "system"),
            "is_original": False,
        })
        wo.description_history = history
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(wo, "description_history")

    for key in updatable:
        if key in data:
            val = data[key]
            if key in ("planned_start", "planned_end", "actual_start", "actual_end"):
                if val is None or val == '' or val == 'null':
                    val = None
                elif isinstance(val, str):
                    try:
                        val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                    except ValueError:
                        val = None
            setattr(wo, key, val)

    if "priority_code" in data:
        wo.work_class = "NO_PROGRAMADO" if data["priority_code"] in ("P1", "P2") else "PROGRAMADO"

    wo.updated_at = datetime.now()
    wo.version = current_version + 1
    _user = data.get("updated_by", "system")
    if _changes:
        log_action(db, "managed_work_order", wo_id, "UPDATE", payload={"changes": _changes}, user=_user)
    else:
        log_action(db, "managed_work_order", wo_id, "UPDATE", user=_user)
    db.commit()
    db.refresh(wo)
    # Jorge 2026-04-21 — patch granular: enviamos el objeto WO completo en el
    # evento. El cliente mergea en su estado local en vez de refetchear toda
    # la lista. Cambia el feel de la app a "real-time" sin flashes.
    _wo_dict = _to_dict(wo, db)
    queue_notify("wo_updated", {"wo_id": wo_id, "wo_number": wo.wo_number, "status": wo.status, "wo": _wo_dict}, wo.plant_id)
    return _to_dict(wo, db)


def _transition(db: Session, wo_id: str, target_status: str, user_id: str = "", **kwargs) -> dict | None:
    """Generic status transition with validation + timestamp logging."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    allowed = TRANSITIONS.get(wo.status, [])
    if target_status not in allowed:
        return None

    old_status = wo.status
    wo.status = target_status
    wo.updated_at = datetime.now()

    # ── Timestamp logging: record every status change ──
    _LABEL = {
        "CREADO": "Created", "LIBERADO": "Released", "PLANIFICADO": "Planned",
        "EN_PROGRAMACION": "In Scheduling", "PROGRAMADO": "Scheduled", "REPROGRAMADO": "Rescheduled",
        "EN_EJECUCION": "In Execution", "COMPLETADO": "Completed", "CERRADO": "Closed",
        "CANCELADO": "Cancelled", "PENDIENTE": "Pending", "APROBADO": "Approved",
    }
    notes = list(wo.execution_notes or [])
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": f"Status: {_LABEL.get(old_status, old_status)} → {_LABEL.get(target_status, target_status)}",
    })
    wo.execution_notes = notes

    # ── Status-specific side effects ──
    if target_status == "PLANIFICADO":
        wo.planned_by = user_id or wo.planned_by
    elif target_status == "PROGRAMADO":
        wo.released_by = user_id
        wo.released_at = datetime.now()
    elif target_status == "REPROGRAMADO":
        # Return to planner — supervisor could not execute
        pass
    elif target_status == "EN_EJECUCION":
        wo.actual_start = wo.actual_start or datetime.now()
    elif target_status == "CERRADO":
        wo.actual_end = wo.actual_end or datetime.now()
        wo.completion_pct = 100.0
        wo.closed_by = user_id
        wo.closed_at = datetime.now()
        if "actual_hours" in kwargs:
            wo.actual_hours = kwargs["actual_hours"]
        # SF-589: descontar stock de bodega al cerrar (idempotente)
        try:
            from api.services.stock_forecast_service import consume_stock_on_close
            consume_stock_on_close(db, wo)
        except Exception:
            pass
        # Jorge 2026-04-23 (reunión 17:38): al cerrar la OT, auto-cerrar el aviso vinculado.
        # Evita que el supervisor tenga que cerrar ambos por separado (como en SAP).
        if wo.work_request_id:
            from api.database.models import WorkRequestModel
            wr_linked = db.query(WorkRequestModel).filter(WorkRequestModel.request_id == wo.work_request_id).first()
            if wr_linked and wr_linked.status not in ("CERRADO", "CLOSED", "COMPLETED"):
                wr_linked.status = "CERRADO"
                wr_linked.updated_at = datetime.now()
    # Legacy compat
    elif target_status == "APROBADO":
        wo.released_by = user_id
        wo.released_at = datetime.now()
    elif target_status == "EN_PROGRESO":
        wo.actual_start = wo.actual_start or datetime.now()

    # Extra kwargs
    if "assigned_workers" in kwargs:
        wo.assigned_workers = kwargs["assigned_workers"]
    if "closed_by_signature" in kwargs:
        wo.closed_by_signature = kwargs["closed_by_signature"]
    if "closed_by_pin_hash" in kwargs:
        wo.closed_by_pin_hash = kwargs["closed_by_pin_hash"]
    if "closure_notes" in kwargs:
        wo.closure_notes = kwargs["closure_notes"]
    # SF-500 — audio del cierre.
    if "closure_audio_url" in kwargs:
        wo.closure_audio_url = kwargs["closure_audio_url"]
    if "operations" in kwargs:
        wo.operations = kwargs["operations"]

    _create_notification(db, wo, old_status, target_status, user_id)
    log_action(db, "managed_work_order", wo_id, target_status, user=user_id or "system")
    db.commit()
    db.refresh(wo)
    queue_notify("wo_status", {"wo_id": wo_id, "wo_number": wo.wo_number, "old": old_status, "new": target_status, "wo": _to_dict(wo, db)}, wo.plant_id)
    return _to_dict(wo, db)


def plan_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Planner completes planning -> PLANIFICADO."""
    return _transition(db, wo_id, "PLANIFICADO", user_id)


def _parse_date(val):
    """Convert string date to datetime object if needed."""
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        try:
            # Handle: "2026-04-01T12:00:00Z", "2026-04-01 12:00:00.123", "2026-04-01"
            val = val.replace("Z", "+00:00").replace(" ", "T")
            return datetime.fromisoformat(val)
        except (ValueError, TypeError):
            try:
                return datetime.strptime(val[:10], "%Y-%m-%d")
            except (ValueError, TypeError):
                return datetime.now()
    return val


def schedule_wo(db: Session, wo_id: str, user_id: str = "", assigned_workers: list | None = None, planned_start=None, planned_end=None, shift: str = None) -> dict | None:
    """Programmer schedules -> PROGRAMADO.

    Only touches fields explicitly provided. None means "keep existing value"
    (preserves assignments when reserving an already-drafted schedule).
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if wo and planned_start:
        wo.planned_start = _parse_date(planned_start)
    if wo and planned_end:
        wo.planned_end = _parse_date(planned_end)
    if wo and shift:
        wo.shift = shift
    # Only set assigned_workers if explicitly provided (not None). Passing None should
    # preserve the existing assignments (e.g., when just confirming status).
    kwargs = {}
    if assigned_workers is not None:
        kwargs["assigned_workers"] = assigned_workers
    return _transition(db, wo_id, "PROGRAMADO", user_id, **kwargs)


def reschedule_wo(db: Session, wo_id: str, user_id: str = "", reason: str | None = None) -> dict | None:
    """Supervisor returns to planner -> REPROGRAMADO.

    SF-578 — `reason` es obligatorio cuando se llama vía endpoint público.
    Si llega vacío, el endpoint debe rechazar antes. Acá lo aceptamos opcional
    para compat con callers internos, pero lo persistimos en reschedule_reason
    + audit log para que quede trazabilidad.

    Además, una OT REPROGRAMADO debe volver a PLANIFICADO (retorno automático
    a Planificación) — eso lo decide el siguiente flujo del planner. Por ahora
    simplemente la marcamos REPROGRAMADO y guardamos el motivo.
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if wo and reason:
        wo.reschedule_reason = reason
    return _transition(db, wo_id, "REPROGRAMADO", user_id, reschedule_reason=reason or None)


def release_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Alias for plan_wo (legacy compat)."""
    return plan_wo(db, wo_id, user_id)


# Legacy alias
approve_wo = plan_wo


def reject_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Legacy: reject now cancels."""
    return _transition(db, wo_id, "CANCELADO", user_id)


def cancel_wo(
    db: Session,
    wo_id: str,
    user_id: str = "",
    reason: str | None = None,
    cancellation_type: str | None = None,
    absorbed_by_wo_id: str | None = None,
) -> dict | None:
    """SF-579: cancela una OT con motivo + tipología.

    cancellation_type:
      - ABSORBED: absorbida por OT PM03 (requiere absorbed_by_wo_id)
      - NOT_NEEDED: ya no es necesaria
      - OTHER: otros motivos

    Si type=ABSORBED, valida que la OT absorbente exista y sea PM03.
    """
    from api.database.models import ManagedWorkOrderModel
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if cancellation_type == "ABSORBED":
        if not absorbed_by_wo_id:
            return None
        absorber = db.query(ManagedWorkOrderModel).filter(
            ManagedWorkOrderModel.wo_id == absorbed_by_wo_id
        ).first()
        if not absorber or absorber.wo_type != "PM03":
            return None
    if reason:
        wo.cancellation_reason = reason
    if cancellation_type:
        wo.cancellation_type = cancellation_type
    if absorbed_by_wo_id and cancellation_type == "ABSORBED":
        wo.absorbed_by_wo_id = absorbed_by_wo_id
    db.commit()
    return _transition(db, wo_id, "CANCELADO", user_id)


# schedule_wo defined above with plan_wo/reschedule_wo


def start_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Supervisor starts execution -> EN_EJECUCION."""
    return _transition(db, wo_id, "EN_EJECUCION", user_id)


def complete_wo(db: Session, wo_id: str, user_id: str = "", actual_hours: float = 0) -> dict | None:
    """Complete is now mapped to close (CERRADO) since COMPLETED status no longer exists."""
    return _transition(db, wo_id, "CERRADO", user_id, actual_hours=actual_hours)


def compute_close_gates(wo, candidate_actual_hours: float | None = None, candidate_ops: list | None = None) -> dict:
    """Pre-cierre gates obligatorios (Jorge: validación supervisor real, no solo firma).

    5 gates:
      G1 ALL_OPS_DONE    — todas las operaciones completion_pct >= 100 (auto, blocking)
      G2 HH_VARIANCE_OK  — variance plan vs real <= 25% (auto, blocking sin justificación)
      G3 MATERIALS_OK    — materiales reservados fueron consumidos o flagged unused (auto, soft)
      G4 SUPERVISOR_QA   — supervisor confirmó calidad del trabajo (manual, blocking)
      G5 NO_OPEN_NOTIFS  — sin alertas/observaciones abiertas pendientes en la OT (auto, soft)
    """
    ops = candidate_ops if candidate_ops is not None else (wo.operations or [])
    actual_hours = candidate_actual_hours if candidate_actual_hours is not None else (wo.actual_hours or 0.0)

    # G1: todas las ops al 100%
    op_pcts = [float(o.get("completion_pct") or 0) for o in ops]
    all_ops_done = bool(op_pcts) and all(p >= 100.0 for p in op_pcts)
    incomplete_ops = [o.get("op_number") or i+1 for i, o in enumerate(ops) if float(o.get("completion_pct") or 0) < 100.0]

    # G2: variance plan vs real <= 25%
    plan_hours = float(wo.estimated_hours or 0)
    if plan_hours > 0:
        variance = abs(actual_hours - plan_hours) / plan_hours
        hh_variance_ok = variance <= 0.25
        variance_pct = round(variance * 100, 1)
    else:
        hh_variance_ok = True
        variance_pct = 0.0

    # G3: materiales (heurística: si hay materials reservados, deben estar usados o explícitos)
    materials = wo.materials or []
    reserved = [m for m in materials if isinstance(m, dict) and (m.get("reservation_code") or m.get("reserved"))]
    used_or_flagged = [m for m in reserved if m.get("used") or m.get("unused_reason")]
    materials_ok = (not reserved) or (len(used_or_flagged) == len(reserved))

    # G5: notificaciones/observaciones abiertas (heurística: execution_notes con [WARN] o [BLOCKED])
    notes = wo.execution_notes or []
    open_warnings = [n for n in notes if isinstance(n, dict) and any(tag in (n.get("note") or "").upper() for tag in ["[WARN]", "[BLOCKED]", "[PENDING]"]) and not n.get("resolved")]
    no_open_notifs = len(open_warnings) == 0

    # SF-571 — G6: cada operación debe tener HH reales notificadas (>0).
    # No basta con completion_pct=100 si falta el dato granular para KPIs
    # (Adherencia/Cumplimiento dependen de actual_hours por op).
    ops_missing_hh = [
        o.get("op_number") or i+1
        for i, o in enumerate(ops)
        if float(o.get("actual_hours") or 0) <= 0
    ]
    ops_hh_notified = bool(ops) and len(ops_missing_hh) == 0

    return {
        "gates": [
            {"id": "ALL_OPS_DONE", "label": "Todas las operaciones al 100%",
             "passed": all_ops_done, "blocking": True, "auto": True,
             "detail": f"{len(op_pcts) - len(incomplete_ops)}/{len(op_pcts)} ops completas" + (f" — pendientes: #{', #'.join(map(str, incomplete_ops))}" if incomplete_ops else "")},
            {"id": "OPS_HH_NOTIFIED", "label": "HH reales notificadas por cada operación",
             "passed": ops_hh_notified, "blocking": True, "auto": True,
             "detail": (f"{len(ops) - len(ops_missing_hh)}/{len(ops)} ops con HH real" +
                        (f" — faltan: #{', #'.join(map(str, ops_missing_hh))}" if ops_missing_hh else ""))},
            {"id": "HH_VARIANCE_OK", "label": "Variance HH plan vs real ≤ 25%",
             "passed": hh_variance_ok, "blocking": True, "auto": True,
             "detail": f"plan {plan_hours}h vs real {actual_hours}h → {variance_pct}% variance",
             "override_allowed": True},
            {"id": "MATERIALS_OK", "label": "Materiales reservados consumidos o flagged",
             "passed": materials_ok, "blocking": False, "auto": True,
             "detail": f"{len(used_or_flagged)}/{len(reserved)} materiales reservados confirmados"},
            {"id": "SUPERVISOR_QA", "label": "Supervisor revisó calidad del trabajo",
             "passed": False, "blocking": True, "auto": False,
             "detail": "Marcar manualmente — supervisor confirma que el equipo quedó operativo y cumple specs"},
            {"id": "NO_OPEN_NOTIFS", "label": "Sin alertas/observaciones abiertas",
             "passed": no_open_notifs, "blocking": False, "auto": True,
             "detail": f"{len(open_warnings)} alerta(s) abierta(s)" if open_warnings else "Sin alertas"},
        ],
    }


def close_wo(
    db: Session,
    wo_id: str,
    user_id: str = "",
    signature: str | None = None,
    pin: str | None = None,
    notes: str | None = None,
    actual_hours: float | None = None,
    operations: list | None = None,
    closure_audio_url: str | None = None,
    gate_acks: dict | None = None,        # {gate_id: True} — supervisor checkboxes manuales
    gate_overrides: dict | None = None,    # {gate_id: "razón"} — override con justificación
) -> dict | None:
    """Close a WO with supervisor signature. Signature is mandatory.

    Operations (optional) is the plan-vs-actual capture: a list of ops with
    `actual_hours` per step. When provided, overwrites `actual_hours` with
    the sum of op actuals for KPI consistency.

    Pre-close gates (compute_close_gates) — todas las que son `blocking` deben
    estar `passed=True` o tener override con justificación. Si no, levanta
    HTTPException 412 con el detalle de gates.
    """
    from fastapi import HTTPException
    if not signature or not signature.strip():
        return None

    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None

    # Calcular actual_hours efectivo para los gates ANTES del transition.
    eff_hours = actual_hours
    if operations is not None and eff_hours is None:
        eff_hours = sum(float(op.get("actual_hours") or 0) for op in operations)

    gates_state = compute_close_gates(wo, eff_hours, operations)
    gate_acks = gate_acks or {}
    gate_overrides = gate_overrides or {}

    # Aplicar acks manuales (supervisor marcó la checkbox)
    for g in gates_state["gates"]:
        if g.get("auto") is False and gate_acks.get(g["id"]) is True:
            g["passed"] = True
            g["acknowledged_by"] = user_id

    # Aplicar overrides — exigir razón ≥ 10 chars
    for g in gates_state["gates"]:
        if not g["passed"] and g.get("blocking") and g.get("override_allowed"):
            reason = (gate_overrides.get(g["id"]) or "").strip()
            if len(reason) >= 10:
                g["passed"] = True
                g["overridden_by"] = user_id
                g["override_reason"] = reason

    # Verificar gates blocking
    failed_blocking = [g for g in gates_state["gates"] if g.get("blocking") and not g["passed"]]
    if failed_blocking:
        raise HTTPException(
            status_code=412,
            detail={
                "error": "PRE_CLOSE_GATES_FAILED",
                "message": "Pre-close gates no superadas. Resuelve antes de cerrar.",
                "failed_gates": [{"id": g["id"], "label": g["label"], "detail": g.get("detail")} for g in failed_blocking],
                "all_gates": gates_state["gates"],
            },
        )

    import hashlib
    pin_hash = hashlib.sha256((pin or "").encode()).hexdigest()[:16] if pin else None

    # Persistir trazabilidad de los gates en execution_notes (audit)
    audit_notes = list(wo.execution_notes or [])
    audit_notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": "[PRE_CLOSE_GATES_PASSED] " + " | ".join([
            f"{g['id']}={'OVERRIDE' if g.get('overridden_by') else ('ACK' if g.get('acknowledged_by') else 'OK')}"
            for g in gates_state["gates"] if g["passed"]
        ]),
        "gates": gates_state["gates"],
    })

    kwargs = {
        "closed_by_signature": signature.strip()[:120],
        "closed_by_pin_hash": pin_hash,
        "closure_notes": (notes or "").strip()[:500] or None,
        "closure_audio_url": (closure_audio_url or "").strip()[:500] or None,
        "execution_notes": audit_notes,
    }
    if operations is not None:
        kwargs["operations"] = operations
        if actual_hours is None:
            actual_hours = sum(float(op.get("actual_hours") or 0) for op in operations)
    if actual_hours is not None:
        kwargs["actual_hours"] = actual_hours
    return _transition(db, wo_id, "CERRADO", user_id, **kwargs)


def add_note(db: Session, wo_id: str, user_id: str, note: str) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    notes = list(wo.execution_notes or [])
    notes.append({"timestamp": datetime.now().isoformat(), "user": user_id, "note": note})
    wo.execution_notes = notes
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo, db)


def notify_operation_partial(
    db: Session,
    wo_id: str,
    op_seq: int,
    hours: float,
    technician_id: str = "",
    shift: str = "",
    note: str = "",
    user_id: str = "",
) -> dict | None:
    """SF-572 — Notificación parcial multi-turno por operación.

    - Acumula `hours` en `op.notifications` (lista de partials con técnico+turno+timestamp).
    - op.actual_hours = suma de hours de las parciales.
    - op.completion_pct = min(100, actual / planned * 100). Si llega a 100, op.status='COMPLETED'.
    - WO.completion_pct = promedio de op.completion_pct.
    - Si TODAS las ops están al 100%, registra notificación FINAL automática en wo.execution_notes
      y devuelve `final_auto_triggered=true`. (No transiciona a CERRADO; eso requiere firma supervisor.)
    """
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status not in ("EN_EJECUCION", "EN_PROGRESO", "PROGRAMADO"):
        return None
    # Deep-copy: SQLAlchemy JSON column no detecta mutaciones in-place sobre los
    # dicts internos. Hacer deep copy + reasignar `wo.operations` garantiza que
    # el cambio se persista al hacer commit.
    import copy as _copy
    ops = _copy.deepcopy(wo.operations or [])
    if not ops:
        return None
    target = None
    for op in ops:
        if int(op.get("op_number", op.get("seq", 0))) == int(op_seq):
            target = op
            break
    if target is None:
        return None
    planned = float(target.get("planned_hours", target.get("estimated_hours", target.get("duration", 0))) or 0)
    notifs = list(target.get("notifications") or [])
    notifs.append({
        "type": "PARTIAL",
        "hours": float(hours),
        "technician_id": technician_id or None,
        "shift": shift or None,
        "note": (note or "")[:300] or None,
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
    })
    target["notifications"] = notifs
    actual = round(sum(float(n.get("hours") or 0) for n in notifs), 2)
    target["actual_hours"] = actual
    pct = min(100.0, (actual / planned * 100.0) if planned > 0 else 0.0)
    target["completion_pct"] = round(pct, 1)
    if pct >= 100.0:
        target["status"] = "COMPLETED"
    wo.operations = ops
    valid_pcts = [float(o.get("completion_pct") or 0) for o in ops]
    wo.completion_pct = round(sum(valid_pcts) / len(valid_pcts), 1) if valid_pcts else 0.0
    wo.actual_hours = round(sum(float(o.get("actual_hours") or 0) for o in ops), 2)

    final_auto = all(float(o.get("completion_pct") or 0) >= 100.0 for o in ops)
    notes = list(wo.execution_notes or [])
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": f"[NOTIF PARCIAL] Op#{op_seq} +{hours}h por {technician_id or 'sin id'} ({shift or 'sin turno'}). Op@{target['completion_pct']}%, OT@{wo.completion_pct}%",
    })
    if final_auto:
        notes.append({
            "timestamp": datetime.now().isoformat(),
            "user": "system",
            "note": "[NOTIF FINAL AUTO] Todas las operaciones al 100%. Listo para validación supervisor + cierre.",
        })
        log_action(db, "managed_work_order", wo.wo_id, "FINAL_NOTIFICATION_AUTO",
                   payload={"total_actual_hours": wo.actual_hours, "completion_pct": wo.completion_pct})
        # WebSocket toast → supervisor ve el evento sin refrescar
        try:
            queue_notify("wo_final_auto", {
                "wo_id": wo.wo_id,
                "wo_number": wo.wo_number,
                "equipment_tag": wo.equipment_tag,
                "actual_hours": wo.actual_hours,
                "completion_pct": wo.completion_pct,
            }, wo.plant_id)
        except Exception:
            pass
    wo.execution_notes = notes
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    out = _to_dict(wo, db)
    out["final_auto_triggered"] = final_auto
    return out


def update_progress(db: Session, wo_id: str, pct: float) -> dict | None:
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo or wo.status not in ("EN_EJECUCION", "EN_PROGRESO"):
        return None
    wo.completion_pct = min(max(pct, 0), 100)
    wo.updated_at = datetime.now()
    db.commit()
    db.refresh(wo)
    return _to_dict(wo, db)


def get_stats(db: Session, plant_id: str | None = None) -> dict:
    """Summary stats for dashboard KPIs."""
    q = db.query(ManagedWorkOrderModel)
    if plant_id:
        q = q.filter(ManagedWorkOrderModel.plant_id == plant_id)
    all_wos = q.all()
    by_status = {}
    by_type = {}
    total_estimated = 0.0
    total_actual = 0.0
    for wo in all_wos:
        by_status[wo.status] = by_status.get(wo.status, 0) + 1
        by_type[wo.wo_type] = by_type.get(wo.wo_type, 0) + 1
        total_estimated += wo.estimated_hours or 0
        total_actual += wo.actual_hours or 0
    return {
        "total": len(all_wos),
        "by_status": by_status,
        "by_type": by_type,
        "total_estimated_hours": round(total_estimated, 1),
        "total_actual_hours": round(total_actual, 1),
    }


def draft_wo(db: Session, wo_id: str, user_id: str = "") -> dict | None:
    """Revert WO to CREADO (draft) status — only from PLANIFICADO or PROGRAMADO."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return None
    if wo.status not in ("PLANIFICADO", "PROGRAMADO", "PENDIENTE", "APROBADO", "CREADO"):
        return None
    old_status = wo.status
    wo.status = "CREADO"
    wo.updated_at = datetime.now()
    notes = list(wo.execution_notes or [])
    notes.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_id or "system",
        "note": f"Status: {old_status} -> CREADO (reverted to draft)",
    })
    wo.execution_notes = notes
    log_action(db, "managed_work_order", wo_id, "DRAFT", user=user_id or "system")
    db.commit()
    db.refresh(wo)
    return _to_dict(wo, db)


def _create_notification(db: Session, wo, old_status: str, new_status: str, user_id: str = ""):
    """Create in-app notification when WO status changes."""
    try:
        from api.database.models import NotificationModel
        title_map = {
            "PLANIFICADO": "WO Planned",
            "PROGRAMADO": "WO Scheduled",
            "EN_EJECUCION": "WO Started",
            "CERRADO": "WO Closed",
            "CANCELADO": "WO Cancelled",
            "REPROGRAMADO": "WO Rescheduled",
        }
        title = title_map.get(new_status, f"WO Status: {new_status}")
        message = f"{wo.wo_number} ({wo.equipment_tag}) moved from {old_status} to {new_status}"
        if wo.priority_code in ("P1", "P2"):
            message += f" [PRIORITY: {wo.priority_code}]"

        # Notify assigned workers
        targets = []
        if wo.assigned_workers:
            for w in wo.assigned_workers:
                if isinstance(w, dict):
                    targets.append(w.get("worker_id", ""))
        if wo.planned_by:
            targets.append(wo.planned_by)
        if not targets:
            targets = [""]  # broadcast

        for target in targets[:5]:
            from api.database.models import _uuid
            notif = NotificationModel(
                notification_id=_uuid(),
                notification_type="WO_STATUS_CHANGE",
                title=title,
                message=message,
                level=wo.priority_code or "P3",
                plant_id=wo.plant_id or "OCP-JFC1",
                equipment_id=wo.equipment_tag or "",
                recipient_id=target,
                channel="IN_APP",
                acknowledged=False,
            )
            db.add(notif)
    except Exception:
        pass  # Don't fail the transition if notification fails
