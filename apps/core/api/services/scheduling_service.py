"""Scheduling service — manages weekly programs, Gantt, HH balance, materials."""

import os
import tempfile
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    BacklogItemModel, WeeklyProgramModel,
    WorkforceModel, ShutdownCalendarModel,
    ManagedWorkOrderModel,
)
from api.services.audit_service import log_action
from tools.engines.scheduling_engine import SchedulingEngine
from tools.processors.gantt_generator import GanttGenerator
from tools.processors.backlog_optimizer import BacklogOptimizer, _to_backlog_entries
from tools.engines.backlog_grouper import BacklogGrouper
from tools.models.schemas import (
    BacklogItem, Priority, BacklogWOType, BacklogStatus,
    BacklogWorkPackage, ShiftType, MaterialsReadyStatus,
    WeeklyProgram, WeeklyProgramStatus,
)


def create_program(
    db: Session,
    plant_id: str,
    week_number: int,
    year: int,
) -> dict:
    """Create a DRAFT weekly program from current backlog."""
    # Filter backlog by plant — join with managed_work_orders or work_requests
    from api.database.models import WorkRequestModel
    db_items_all = db.query(BacklogItemModel).all()
    # Filter: only items whose WR belongs to this plant
    plant_wr_ids = set()
    if plant_id:
        wrs = db.query(WorkRequestModel.request_id, WorkRequestModel.ai_classification).all()
        for wr in wrs:
            ai = wr.ai_classification
            if isinstance(ai, str):
                if plant_id in ai:
                    plant_wr_ids.add(wr.request_id)
            elif isinstance(ai, dict) and ai.get("plant_id") == plant_id:
                plant_wr_ids.add(wr.request_id)
        db_items = [i for i in db_items_all if i.work_request_id in plant_wr_ids] if plant_wr_ids else db_items_all
    else:
        db_items = db_items_all
    items = [_to_schema_item(i) for i in db_items]

    schedulable = [i for i in items if i.materials_ready and not i.shutdown_required]

    entries = _to_backlog_entries(schedulable)
    groups = BacklogGrouper.find_all_groups(entries)

    from datetime import date, timedelta
    # Calculate Monday of the requested week number
    jan1 = date(year, 1, 1)
    # ISO week: find the Monday of week 1, then add (week_number - 1) weeks
    jan1_weekday = jan1.weekday()  # 0=Mon
    monday_week1 = jan1 - timedelta(days=jan1_weekday) if jan1_weekday <= 3 else jan1 + timedelta(days=7 - jan1_weekday)
    week_start = monday_week1 + timedelta(weeks=week_number - 1)
    work_days = [week_start + timedelta(days=d) for d in range(5)]  # Mon-Fri

    # Collect all items to schedule (grouped + ungrouped)
    all_packages = []
    for group in groups:
        all_packages.append({
            "id": group.group_id, "name": group.name,
            "items": [e.backlog_id for e in group.items], "reason": group.reason,
            "hours": group.total_hours, "team": list(group.specialties),
        })
    grouped_ids = {e.backlog_id for g in groups for e in g.items}
    ungrouped = [i for i in schedulable if i.backlog_id not in grouped_ids]
    for item in ungrouped:
        all_packages.append({
            "id": f"WP-IND-{item.backlog_id[:8]}", "name": f"Individual: {item.equipment_tag}",
            "items": [item.backlog_id], "reason": "Individual item",
            "hours": item.estimated_duration_hours, "team": item.required_specialties,
        })

    # Sort by priority (P1 first) and hours (longer first)
    priority_order = {"1_EMERGENCY": 0, "2_URGENT": 1, "3_NORMAL": 2, "4_ROUTINE": 3}
    item_lookup_tmp = {i.backlog_id: i for i in schedulable}
    def pkg_priority(pkg):
        for bid in pkg["items"]:
            it = item_lookup_tmp.get(bid)
            if it:
                return priority_order.get(it.priority.value if hasattr(it.priority, 'value') else str(it.priority), 3)
        return 3
    all_packages.sort(key=lambda p: (pkg_priority(p), -p["hours"]))

    # Distribute evenly across 5 days by hours capacity
    day_hours = {d: 0.0 for d in range(5)}
    max_hours_per_day = 80.0  # ~10 technicians × 8h
    work_packages = []
    for pkg in all_packages:
        # Find the day with least hours assigned
        best_day = min(range(5), key=lambda d: day_hours[d])
        if day_hours[best_day] >= max_hours_per_day:
            best_day = min(range(5), key=lambda d: day_hours[d])  # overflow to least loaded
        day_hours[best_day] += pkg["hours"]
        shift = ShiftType.MORNING if day_hours[best_day] <= max_hours_per_day / 2 else ShiftType.AFTERNOON
        work_packages.append(BacklogWorkPackage(
            package_id=pkg["id"], name=pkg["name"],
            grouped_items=pkg["items"], reason_for_grouping=pkg["reason"],
            scheduled_date=work_days[best_day], scheduled_shift=shift,
            total_duration_hours=pkg["hours"], assigned_team=pkg["team"],
            materials_status=MaterialsReadyStatus.READY,
        ))

    program = SchedulingEngine.create_weekly_program(plant_id, week_number, year, work_packages)

    # Load workforce and level resources
    workforce = [
        {"worker_id": w.worker_id, "specialty": w.specialty, "shift": w.shift, "available": w.available}
        for w in db.query(WorkforceModel).filter(WorkforceModel.plant_id == plant_id).all()
    ]
    program = SchedulingEngine.level_resources(program, workforce)

    # Assign support tasks
    pkg_attrs = [
        {
            "package_id": p.get("package_id", ""),
            "shutdown_required": False,
            "specialties": p.get("assigned_team", []),
            "total_hours": p.get("total_duration_hours", 0.0),
        }
        for p in program.work_packages
    ]
    program = SchedulingEngine.assign_support_tasks(program, pkg_attrs)

    # Detect conflicts
    SchedulingEngine.detect_conflicts(program)

    # Build a lookup from backlog_id → item for enrichment
    item_lookup = {i.backlog_id: i for i in schedulable}

    # Enrich work_packages with equipment_tag and wo_type from backlog items
    enriched_wps = []
    for p in program.work_packages:
        wp_dict = dict(p) if isinstance(p, dict) else p
        # Try to find the source backlog item for this WP
        grouped = wp_dict.get("grouped_items", [])
        if grouped and grouped[0] in item_lookup:
            src = item_lookup[grouped[0]]
            wp_dict["equipment_tag"] = src.equipment_tag
            wp_dict["wo_type"] = src.work_order_type.value if hasattr(src.work_order_type, 'value') else str(src.work_order_type)
            wp_dict["priority"] = src.priority.value if hasattr(src.priority, 'value') else str(src.priority)
            wp_dict["description"] = f"{src.equipment_tag} - {src.work_order_type.value if hasattr(src.work_order_type, 'value') else src.work_order_type}"
        enriched_wps.append(wp_dict)

    # Persist
    model = WeeklyProgramModel(
        program_id=program.program_id,
        plant_id=plant_id,
        week_number=week_number,
        year=year,
        status=program.status.value,
        work_packages=enriched_wps,
        total_hours=program.total_hours,
        resource_slots=[s.model_dump(mode="json") for s in program.resource_slots],
        conflicts=[c.model_dump(mode="json") for c in program.conflicts],
        support_tasks=[t.model_dump(mode="json") for t in program.support_tasks],
        created_at=datetime.now(),
    )
    db.add(model)
    log_action(db, "weekly_program", model.program_id, "CREATE")

    # Update actual managed_work_orders with scheduled dates from work packages
    backlog_to_wr = {i.backlog_id: i.work_request_id for i in schedulable}
    wr_to_wo = {}
    wr_ids = list(backlog_to_wr.values())
    if wr_ids:
        wos = db.query(ManagedWorkOrderModel).filter(
            ManagedWorkOrderModel.work_request_id.in_(wr_ids)
        ).all()
        wr_to_wo = {wo.work_request_id: wo for wo in wos}

    # Also match by equipment_tag for WOs without WR link
    all_plant_wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
        ManagedWorkOrderModel.status.in_(["CREADO", "PLANIFICADO", "PROGRAMADO"])
    ).all()
    tag_to_wos = {}
    for wo in all_plant_wos:
        tag = wo.equipment_tag or wo.equipment_id
        if tag not in tag_to_wos:
            tag_to_wos[tag] = []
        tag_to_wos[tag].append(wo)

    updated_wo_ids = set()
    for wp in enriched_wps:
        sched_date = wp.get("scheduled_date")
        if not sched_date:
            continue
        grouped = wp.get("grouped_items", [])
        for bl_id in grouped:
            # Try via WR link
            wr_id = backlog_to_wr.get(bl_id)
            wo = wr_to_wo.get(wr_id) if wr_id else None
            # Fallback: match by equipment_tag
            if not wo:
                eq_tag = wp.get("equipment_tag", "")
                candidates = tag_to_wos.get(eq_tag, [])
                for c in candidates:
                    if c.wo_id not in updated_wo_ids:
                        wo = c
                        break
            if wo and wo.wo_id not in updated_wo_ids:
                wo.planned_start = datetime.strptime(str(sched_date), "%Y-%m-%d") if isinstance(sched_date, str) else sched_date
                wo.planned_end = wo.planned_start
                if wo.status in ("CREADO", "PLANIFICADO"):
                    wo.status = "PROGRAMADO"
                updated_wo_ids.add(wo.wo_id)

    db.commit()
    db.refresh(model)

    return _program_to_dict(model)


def get_program(db: Session, program_id: str) -> WeeklyProgramModel | None:
    return db.query(WeeklyProgramModel).filter(
        WeeklyProgramModel.program_id == program_id
    ).first()


def list_programs(
    db: Session,
    plant_id: str | None = None,
    status: str | None = None,
) -> list[dict]:
    q = db.query(WeeklyProgramModel)
    if plant_id:
        q = q.filter(WeeklyProgramModel.plant_id == plant_id)
    if status:
        q = q.filter(WeeklyProgramModel.status == status)
    return [_program_to_dict(p) for p in q.order_by(WeeklyProgramModel.created_at.desc()).all()]


def finalize_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.finalize_program(program)

    if program.status == WeeklyProgramStatus.FINAL:
        model.status = program.status.value
        model.finalized_at = program.finalized_at
        log_action(db, "weekly_program", program_id, "FINALIZE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def activate_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.activate_program(program)

    if program.status == WeeklyProgramStatus.ACTIVE:
        model.status = program.status.value
        log_action(db, "weekly_program", program_id, "ACTIVATE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def complete_program(db: Session, program_id: str) -> dict | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    program, msg = SchedulingEngine.complete_program(program)

    if program.status == WeeklyProgramStatus.COMPLETED:
        model.status = program.status.value
        log_action(db, "weekly_program", program_id, "COMPLETE")
        db.commit()
        db.refresh(model)

    return {"program_id": program_id, "status": model.status, "message": msg}


def get_gantt(db: Session, program_id: str) -> list[dict] | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    rows = GanttGenerator.generate_gantt_data(program)
    return [r.model_dump(mode="json") for r in rows]


def export_gantt_excel(db: Session, program_id: str) -> str | None:
    model = get_program(db, program_id)
    if not model:
        return None

    program = _model_to_schema(model)
    rows = GanttGenerator.generate_gantt_data(program)

    tmp = tempfile.NamedTemporaryFile(suffix=".xlsx", prefix="gantt_", delete=False)
    tmp_path = tmp.name
    tmp.close()
    GanttGenerator.export_gantt_excel(rows, tmp_path)

    # Schedule cleanup after 60 seconds
    import threading
    def _cleanup():
        try:
            os.remove(tmp_path)
        except OSError:
            pass
    threading.Timer(60, _cleanup).start()

    return tmp_path


def _model_to_schema(model: WeeklyProgramModel) -> WeeklyProgram:
    return WeeklyProgram(
        program_id=model.program_id,
        plant_id=model.plant_id,
        week_number=model.week_number,
        year=model.year,
        status=WeeklyProgramStatus(model.status),
        work_packages=model.work_packages or [],
        total_hours=model.total_hours,
        resource_slots=[],
        conflicts=[],
        support_tasks=[],
        created_at=model.created_at,
        finalized_at=model.finalized_at,
    )


def _to_schema_item(item: BacklogItemModel) -> BacklogItem:
    from datetime import date
    return BacklogItem(
        backlog_id=item.backlog_id,
        work_request_id=item.work_request_id or "",
        equipment_id=item.equipment_id,
        equipment_tag=item.equipment_tag,
        priority=Priority(item.priority) if item.priority in [e.value for e in Priority] else Priority.NORMAL,
        work_order_type=BacklogWOType(item.wo_type) if item.wo_type in [e.value for e in BacklogWOType] else BacklogWOType.PM01,
        created_date=item.created_at.date() if item.created_at else date.today(),
        age_days=item.age_days,
        status=BacklogStatus(item.status) if item.status in [e.value for e in BacklogStatus] else BacklogStatus.AWAITING_APPROVAL,
        blocking_reason=item.blocking_reason,
        estimated_duration_hours=max(item.estimated_hours or 1, 0.1),
        required_specialties=([s if isinstance(s, str) else (s.get('specialty') or s.get('work_center') or 'MECANICO') for s in item.specialties] if isinstance(item.specialties, list) else [item.specialties if isinstance(item.specialties, str) else "MECANICO"]),
        materials_ready=item.materials_ready,
        shutdown_required=item.shutdown_required,
    )


def _program_to_dict(model: WeeklyProgramModel) -> dict:
    raw_wps = model.work_packages if isinstance(model.work_packages, list) else []
    work_packages = []
    for wp in raw_wps:
        if isinstance(wp, dict):
            work_packages.append({
                "work_package_id": wp.get("package_id") or wp.get("work_package_id", ""),
                "name": wp.get("name", ""),
                "equipment_tag": wp.get("equipment_tag", ""),
                "wo_type": wp.get("wo_type", ""),
                "description": wp.get("description", ""),
                "priority": wp.get("priority", "P3"),
                "estimated_hours": wp.get("total_duration_hours", 0),
                "specialties": wp.get("assigned_team") or wp.get("specialties", []),
                "scheduled_date": wp.get("scheduled_date", ""),
                "scheduled_shift": wp.get("scheduled_shift", ""),
            })

    return {
        "program_id": model.program_id,
        "plant_id": model.plant_id,
        "week_number": model.week_number,
        "year": model.year,
        "status": model.status,
        "total_hours": model.total_hours,
        "work_packages": work_packages,
        "work_packages_count": len(work_packages),
        "conflicts_count": len(model.conflicts) if model.conflicts else 0,
        "support_tasks_count": len(model.support_tasks) if model.support_tasks else 0,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "finalized_at": model.finalized_at.isoformat() if model.finalized_at else None,
        "published_at": model.published_at.isoformat() if model.published_at else None,
        "published_by": model.published_by,
        "material_status": model.material_status,
        "hh_balance": model.hh_balance,
    }


def hh_balance_from_wos(db: Session, plant_id: str, week_start: str | None = None) -> dict:
    """Compute HH balance directly from managed_work_orders (not from program backlog).
    week_start: ISO date "YYYY-MM-DD" — if provided, returns per-day HH breakdown for that week."""
    workers = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == plant_id,
        WorkforceModel.available == True,
    ).all()

    HH_PER_WEEK = 40.0
    SPEC_MAP = {
        "mecanico": "Mecánico", "mechanical": "Mecánico", "mecanica": "Mecánico",
        "electrico": "Eléctrico", "electrical": "Eléctrico",
        "instrumentista": "Instrumentación", "instrumentation": "Instrumentación", "instrument tech": "Instrumentación",
        "lubricador": "Lubricación", "lubrication": "Lubricación",
        "soldador": "Soldadura", "welder": "Soldadura",
        "predictivo": "Predictivo", "dcs": "DCS", "general": "General",
    }
    def _norm(s):
        if not isinstance(s, str): return "General"
        return SPEC_MAP.get(s.lower().strip(), s.strip() or "General")

    capacity_by_spec = {}
    for w in workers:
        ns = _norm(w.specialty or "General")
        capacity_by_spec[ns] = capacity_by_spec.get(ns, 0) + HH_PER_WEEK
    total_capacity = sum(capacity_by_spec.values())

    # Get actual scheduled WOs
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
        ManagedWorkOrderModel.status.in_(["PROGRAMADO", "EN_EJECUCION"]),
    ).all()

    assigned_by_spec = {}
    total_assigned = 0.0
    for wo in wos:
        hours = wo.estimated_hours or 4
        total_assigned += hours
        # Get specialty from operations or workers
        spec = "Mecánico"  # default
        if wo.operations and isinstance(wo.operations, list):
            for op in wo.operations:
                if isinstance(op, dict) and op.get("specialty"):
                    spec = _norm(op["specialty"])
                    break
        elif wo.assigned_workers and isinstance(wo.assigned_workers, list):
            for w in wo.assigned_workers:
                if isinstance(w, dict) and w.get("specialty"):
                    spec = _norm(w["specialty"])
                    break
        assigned_by_spec[spec] = assigned_by_spec.get(spec, 0) + hours

    all_specs = sorted(set(list(capacity_by_spec.keys()) + list(assigned_by_spec.keys())))
    by_specialty = []
    for spec in all_specs:
        cap = capacity_by_spec.get(spec, 0)
        asgn = round(assigned_by_spec.get(spec, 0), 1)
        by_specialty.append({
            "specialty": spec, "capacity": cap, "assigned": asgn,
            "available": round(cap - asgn, 1),
            "utilization_pct": round((asgn / cap * 100), 1) if cap > 0 else 0,
        })

    # B3-6 Jorge 2026-04-27: per-day HH para el gráfico de curva vs meta 80%.
    by_day = []
    if week_start:
        from datetime import datetime, timedelta
        try:
            ws = datetime.fromisoformat(week_start).date()
            daily_capacity = total_capacity / 7.0  # rough — capacity is weekly
            for i in range(7):
                d = ws + timedelta(days=i)
                day_assigned = sum(
                    (wo.estimated_hours or 4) for wo in wos
                    if wo.planned_start and (
                        wo.planned_start.date() == d if hasattr(wo.planned_start, 'date') else str(wo.planned_start)[:10] == d.isoformat()
                    )
                )
                by_day.append({
                    "date": d.isoformat(),
                    "weekday": d.strftime("%a"),
                    "assigned": round(day_assigned, 1),
                    "capacity": round(daily_capacity, 1),
                    "utilization_pct": round((day_assigned / daily_capacity * 100), 1) if daily_capacity > 0 else 0,
                })
        except Exception:
            by_day = []

    return {
        "capacity": total_capacity,
        "assigned": round(total_assigned, 1),
        "available": round(total_capacity - total_assigned, 1),
        "utilization_pct": round((total_assigned / total_capacity * 100), 1) if total_capacity > 0 else 0,
        "worker_count": len(workers),
        "wo_count": len(wos),
        "by_specialty": by_specialty,
        "by_day": by_day,
    }


COLLECTION_STATUSES = ["PENDIENTE", "PARCIAL", "COMPLETADO", "EN_AREA_ESPERA", "ENTREGADO"]


def materials_from_wos(db: Session, plant_id: str) -> dict:
    """Get materials status from actual scheduled WOs with collection tracking."""
    wos = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == plant_id,
        ManagedWorkOrderModel.status.in_(["PROGRAMADO", "EN_EJECUCION", "PLANIFICADO"]),
    ).all()

    packages = []
    total_materials = 0
    count_by_status = {s: 0 for s in COLLECTION_STATUSES}
    ready_count = 0
    pending_count = 0
    delivered_count = 0

    for wo in wos:
        mats = wo.materials or []
        if not isinstance(mats, list):
            mats = []
        mat_items = []
        wo_all_delivered = True
        for i, m in enumerate(mats):
            if isinstance(m, dict):
                coll_status = m.get("collection_status", "PENDIENTE")
                if coll_status not in COLLECTION_STATUSES:
                    coll_status = "PENDIENTE"
                count_by_status[coll_status] = count_by_status.get(coll_status, 0) + 1
                if coll_status not in ("ENTREGADO", "EN_AREA_ESPERA", "COMPLETADO"):
                    wo_all_delivered = False
                mat_items.append({
                    "index": i,
                    "code": m.get("code") or m.get("sapId") or "",
                    "description": m.get("description") or m.get("name") or "",
                    "quantity": m.get("quantity", 0),
                    "unit": m.get("unit", "PZ"),
                    "collection_status": coll_status,
                    "collected_by": m.get("collected_by", ""),
                    "collected_at": m.get("collected_at", ""),
                    "notes": m.get("collection_notes", ""),
                })
        total_materials += len(mat_items)

        # Determine WO-level material readiness
        if not mat_items:
            wo_status = "NO_MATERIALS"
        elif wo_all_delivered:
            wo_status = "ENTREGADO"
            delivered_count += 1
        elif any(m["collection_status"] != "PENDIENTE" for m in mat_items):
            wo_status = "EN_PROCESO"
            pending_count += 1
        else:
            wo_status = "PENDIENTE"
            pending_count += 1

        packages.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "description": (wo.description or "")[:60],
            "priority_code": wo.priority_code,
            "planned_start": str(wo.planned_start)[:10] if wo.planned_start else "",
            "wo_type": wo.wo_type or "",
            "reservation_code": getattr(wo, 'reservation_code', None) or "",
            "materials": mat_items,
            "status": wo_status,
            "total_items": len(mat_items),
            "collected_items": sum(1 for m in mat_items if m["collection_status"] in ("COMPLETADO", "EN_AREA_ESPERA", "ENTREGADO")),
        })

    # Sort: PENDIENTE first, then EN_PROCESO, then delivered
    status_order = {"PENDIENTE": 0, "EN_PROCESO": 1, "ENTREGADO": 2, "NO_MATERIALS": 3}
    packages.sort(key=lambda p: (status_order.get(p["status"], 9), p.get("planned_start", "")))

    return {
        "total_packages": len(packages),
        "confirmed": delivered_count,
        "pending": pending_count,
        "unavailable": 0,
        "total_materials": total_materials,
        "all_ready": pending_count == 0 and total_materials > 0,
        "by_status": count_by_status,
        "packages": packages[:80],
    }


def update_material_collection(db: Session, wo_id: str, data: dict, user_id: str) -> dict:
    """Update collection status for a single material in a WO."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"ok": False, "error": "WO not found"}

    idx = data.get("material_index", -1)
    new_status = data.get("status", "")
    notes = data.get("notes", "")

    if new_status not in COLLECTION_STATUSES:
        return {"ok": False, "error": f"Invalid status. Must be one of: {COLLECTION_STATUSES}"}

    mats = wo.materials or []
    if not isinstance(mats, list) or idx < 0 or idx >= len(mats):
        return {"ok": False, "error": "Invalid material index"}

    mats[idx]["collection_status"] = new_status
    mats[idx]["collected_by"] = user_id
    mats[idx]["collected_at"] = datetime.now().isoformat()
    if notes:
        mats[idx]["collection_notes"] = notes

    wo.materials = mats
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(wo, "materials")
    db.commit()

    return {"ok": True, "wo_id": wo_id, "material_index": idx, "new_status": new_status}


def bulk_update_material_collection(db: Session, wo_id: str, status: str, user_id: str) -> dict:
    """Bulk update all materials in a WO to a given collection status."""
    wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_id == wo_id).first()
    if not wo:
        return {"ok": False, "error": "WO not found"}

    if status not in COLLECTION_STATUSES:
        return {"ok": False, "error": f"Invalid status. Must be one of: {COLLECTION_STATUSES}"}

    mats = wo.materials or []
    if not isinstance(mats, list):
        return {"ok": False, "error": "No materials"}

    now = datetime.now().isoformat()
    for m in mats:
        if isinstance(m, dict):
            m["collection_status"] = status
            m["collected_by"] = user_id
            m["collected_at"] = now

    wo.materials = mats
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(wo, "materials")
    db.commit()

    return {"ok": True, "wo_id": wo_id, "updated": len(mats), "new_status": status}


# ══════════════════════════════════════════════════════════════════════
# Phase 3 — Scheduling Improvements
# ══════════════════════════════════════════════════════════════════════

def publish_program(db: Session, program_id: str, user_id: str) -> dict | None:
    """Publish a program — marks it as published and locks further edits."""
    model = get_program(db, program_id)
    if not model or model.status not in ("FINAL", "ACTIVE"):
        return None

    model.published_at = datetime.now()
    model.published_by = user_id

    # Compute material & HH balance at publish time
    mat = _compute_material_status(db, model)
    hh = _compute_hh_balance(db, model)
    model.material_status = mat
    model.hh_balance = hh

    log_action(db, "weekly_program", program_id, "PUBLISH")
    db.commit()
    db.refresh(model)
    return _program_to_dict(model)


def check_materials(db: Session, program_id: str) -> dict | None:
    """Check material availability for a program's work packages."""
    model = get_program(db, program_id)
    if not model:
        return None
    return _compute_material_status(db, model)


def hh_balance(db: Session, program_id: str) -> dict | None:
    """Compute HH balance (capacity vs assigned) for a program."""
    model = get_program(db, program_id)
    if not model:
        return None
    return _compute_hh_balance(db, model)


def get_gantt_managed(db: Session, plant_id: str, weeks: int = 2) -> list[dict]:
    """Get Gantt data from managed_work_orders for next N weeks."""
    now = datetime.now()
    end = now + timedelta(weeks=weeks)

    # Get WOs that are scheduled, in_progress, or have planned dates in range
    wos = (
        db.query(ManagedWorkOrderModel)
        .filter(ManagedWorkOrderModel.plant_id == plant_id)
        .filter(ManagedWorkOrderModel.status.in_(["SCHEDULED", "IN_PROGRESS", "RELEASED", "PLANNED", "PROGRAMADO", "EN_EJECUCION", "PLANIFICADO", "REPROGRAMADO"]))
        .all()
    )

    rows = []
    for wo in wos:
        start = wo.planned_start or wo.created_at
        end_dt = wo.planned_end or (start + timedelta(hours=wo.estimated_hours)) if start else None

        # Calculate week offset
        if start:
            delta_days = (start - now).days
            week_offset = max(0, delta_days // 7)
        else:
            week_offset = 0

        # Specialties from operations or labour_summary
        specialties = []
        if wo.operations:
            specialties = list({op.get("specialty", "GENERAL") for op in wo.operations if isinstance(op, dict)})
        elif wo.labour_summary and isinstance(wo.labour_summary, dict):
            specialties = [s.get("name", "") for s in wo.labour_summary.get("specialties", []) if isinstance(s, dict)]

        rows.append({
            "wo_id": wo.wo_id,
            "wo_number": wo.wo_number,
            "equipment_tag": wo.equipment_tag,
            "description": wo.description[:80] if wo.description else "",
            "wo_type": wo.wo_type,
            "priority_code": wo.priority_code,
            "status": wo.status,
            "estimated_hours": wo.estimated_hours,
            "actual_hours": wo.actual_hours,
            "completion_pct": wo.completion_pct,
            "planned_start": start.isoformat() if start else None,
            "planned_end": end_dt.isoformat() if end_dt else None,
            "actual_start": wo.actual_start.isoformat() if wo.actual_start else None,
            "specialties": specialties,
            "assigned_workers": wo.assigned_workers or [],
            "week_offset": week_offset,
            "materials_ready": _wo_materials_ready(wo),
        })

    return sorted(rows, key=lambda r: (r["planned_start"] or "", r["priority_code"]))


# ── Internal helpers ─────────────────────────────────────────────────

def _compute_material_status(db: Session, model: WeeklyProgramModel) -> dict:
    """Analyze materials across work packages. Returns summary + per-item detail."""
    wps = model.work_packages or []
    confirmed = 0
    pending = 0
    unavailable = 0
    details = []

    for wp in wps:
        if not isinstance(wp, dict):
            continue
        # Check if there's a linked managed WO
        wp_id = wp.get("package_id") or wp.get("work_package_id", "")
        # Materials from work packages
        materials = wp.get("materials", [])
        if not materials:
            # Try to find from managed WOs
            grouped = wp.get("grouped_items", [])
            if grouped:
                mwo = db.query(ManagedWorkOrderModel).filter(
                    ManagedWorkOrderModel.wo_id.in_(grouped)
                ).first()
                if mwo and mwo.materials:
                    materials = mwo.materials

        if not materials:
            confirmed += 1
            details.append({
                "wp_id": wp_id,
                "name": wp.get("name", wp.get("description", "")),
                "status": "no_materials",
                "items": [],
            })
            continue

        wp_confirmed = True
        mat_items = []
        for mat in materials:
            if not isinstance(mat, dict):
                continue
            qty_req = mat.get("qty_required", 0)
            qty_avail = mat.get("qty_available", 0)
            reserved = mat.get("reserved", False)
            if qty_avail >= qty_req or reserved:
                mat_items.append({**mat, "check": "ok"})
            elif qty_avail > 0:
                mat_items.append({**mat, "check": "partial"})
                wp_confirmed = False
                pending += 1
            else:
                mat_items.append({**mat, "check": "missing"})
                wp_confirmed = False
                unavailable += 1

        if wp_confirmed:
            confirmed += 1
        details.append({
            "wp_id": wp_id,
            "name": wp.get("name", wp.get("description", "")),
            "status": "ok" if wp_confirmed else "incomplete",
            "items": mat_items,
        })

    return {
        "confirmed": confirmed,
        "pending": pending,
        "unavailable": unavailable,
        "total_packages": len(wps),
        "details": details,
    }


def _compute_hh_balance(db: Session, model: WeeklyProgramModel) -> dict:
    """Compute HH capacity vs assigned by specialty."""
    # Get workforce for this plant
    workers = db.query(WorkforceModel).filter(
        WorkforceModel.plant_id == model.plant_id,
        WorkforceModel.available == True,
    ).all()

    # Capacity: 8h per day * 5 days per week per worker
    HH_PER_WEEK = 40.0
    capacity_by_specialty = {}
    for w in workers:
        spec = w.specialty or "GENERAL"
        capacity_by_specialty[spec] = capacity_by_specialty.get(spec, 0) + HH_PER_WEEK

    total_capacity = sum(capacity_by_specialty.values())

    # Normalize specialty names
    SPEC_MAP = {
        "mecanico": "Mecánico", "mechanical": "Mecánico", "mecanica": "Mecánico", "mec": "Mecánico",
        "electrico": "Eléctrico", "electrical": "Eléctrico", "elec": "Eléctrico",
        "instrumentista": "Instrumentación", "instrumentation": "Instrumentación", "instrument tech": "Instrumentación",
        "lubricador": "Lubricación", "lubrication": "Lubricación",
        "soldador": "Soldadura", "welder": "Soldadura", "welding": "Soldadura",
        "predictivo": "Predictivo", "dcs": "DCS", "general": "General",
    }
    def _norm_spec(s):
        if not isinstance(s, str): return "General"
        return SPEC_MAP.get(s.lower().strip(), s.strip() or "General")

    # Normalize capacity keys
    norm_capacity = {}
    for spec, cap in capacity_by_specialty.items():
        ns = _norm_spec(spec)
        norm_capacity[ns] = norm_capacity.get(ns, 0) + cap
    capacity_by_specialty = norm_capacity

    # Assigned hours from work packages
    assigned_by_specialty = {}
    total_assigned = 0.0
    wps = model.work_packages or []
    for wp in wps:
        if not isinstance(wp, dict):
            continue
        hours = wp.get("total_duration_hours", 0) or wp.get("estimated_hours", 0) or 0
        total_assigned += hours
        specs = wp.get("assigned_team") or wp.get("specialties", ["General"])
        if isinstance(specs, list) and specs:
            per_spec = hours / len(specs)
            for s in specs:
                ns = _norm_spec(s)
                assigned_by_specialty[ns] = assigned_by_specialty.get(ns, 0) + per_spec

    # Build per-specialty breakdown
    all_specs = sorted(set(list(capacity_by_specialty.keys()) + list(assigned_by_specialty.keys())))
    by_specialty = []
    for spec in all_specs:
        cap = capacity_by_specialty.get(spec, 0)
        asgn = round(assigned_by_specialty.get(spec, 0), 1)
        by_specialty.append({
            "specialty": spec,
            "capacity": cap,
            "assigned": asgn,
            "available": round(cap - asgn, 1),
            "utilization_pct": round((asgn / cap * 100), 1) if cap > 0 else 0,
        })

    return {
        "capacity": total_capacity,
        "assigned": round(total_assigned, 1),
        "available": round(total_capacity - total_assigned, 1),
        "utilization_pct": round((total_assigned / total_capacity * 100), 1) if total_capacity > 0 else 0,
        "worker_count": len(workers),
        "by_specialty": by_specialty,
    }


def _wo_materials_ready(wo: ManagedWorkOrderModel) -> bool:
    """Check if all materials for a managed WO are available."""
    if not wo.materials:
        return True
    for mat in wo.materials:
        if not isinstance(mat, dict):
            continue
        if mat.get("qty_available", 0) < mat.get("qty_required", 1) and not mat.get("reserved"):
            return False
    return True
