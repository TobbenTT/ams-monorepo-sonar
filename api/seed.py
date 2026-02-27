"""Database seeding — populates SQLite with synthetic phosphate data.

Uses SyntheticDataGenerator (existing) to create realistic OCP data,
then inserts into the database via SQLAlchemy models.
Also generates SAP mock JSON files.
"""

import uuid
from datetime import date, datetime

from sqlalchemy.orm import Session

from api.database.connection import create_all_tables, SessionLocal
from api.database.models import (
    PlantModel, HierarchyNodeModel, WorkOrderModel,
    FailureModeModel, FunctionModel, FunctionalFailureModel,
    AuditLogModel,
    WorkforceModel, InventoryItemModel, ShutdownCalendarModel,
    WorkRequestModel, FieldCaptureModel, BacklogItemModel,
)
from tools.generators.synthetic_data import SyntheticDataGenerator
from sap_mock.generate_mock_data import generate_all as generate_sap_mock


def seed_all(db: Session) -> dict:
    """Seed the database with synthetic data. Returns statistics."""
    gen = SyntheticDataGenerator(seed=42)

    # 1. Generate hierarchy
    nodes = gen.generate_plant_hierarchy("OCP-JFC1", "Jorf Fertilizer Complex 1")

    # 2. Create plant
    plant = db.query(PlantModel).filter(PlantModel.plant_id == "OCP-JFC1").first()
    if not plant:
        plant = PlantModel(plant_id="OCP-JFC1", name="Jorf Fertilizer Complex 1", name_fr="Complexe d'engrais de Jorf 1", location="El Jadida, Morocco")
        db.add(plant)
        db.flush()

    # 3. Insert hierarchy nodes
    node_count = 0
    for n in nodes:
        existing = db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == n["node_id"]).first()
        if existing:
            continue
        obj = HierarchyNodeModel(
            node_id=n["node_id"],
            node_type=n["node_type"],
            name=n["name"],
            name_fr=n.get("name_fr", ""),
            code=n.get("code", ""),
            parent_node_id=n.get("parent_node_id"),
            level=n["level"],
            plant_id="OCP-JFC1",
            tag=n.get("tag"),
            criticality=n.get("criticality"),
            status="ACTIVE",
            metadata_json={
                "manufacturer": n.get("manufacturer"),
                "power_kw": n.get("power_kw"),
                "weight_kg": n.get("weight_kg"),
            } if n.get("manufacturer") else None,
        )
        db.add(obj)
        node_count += 1

    db.flush()

    # 4. Generate failure modes and insert (idempotent)
    failure_modes = gen.generate_failure_modes(nodes)
    fm_count = 0

    # Step A: create functions (depends on hierarchy_nodes)
    func_map = {}  # fm_id -> func_id
    for fm in failure_modes:
        existing_fm = db.query(FailureModeModel).filter(FailureModeModel.failure_mode_id == fm["failure_mode_id"]).first()
        if existing_fm:
            continue
        func_id = str(uuid.uuid4())
        func = FunctionModel(
            function_id=func_id,
            node_id=fm["node_id"],
            function_type="PRIMARY",
            description=f"Primary function of {fm['mi_name']}",
            description_fr=f"Fonction principale de {fm['mi_name']}",
            status="DRAFT",
        )
        db.add(func)
        func_map[fm["failure_mode_id"]] = func_id

    db.flush()

    # Step B: create functional failures (depends on functions)
    fm_ff_map = {}  # fm_id -> ff_id
    for fm_id, func_id in func_map.items():
        fm = next(f for f in failure_modes if f["failure_mode_id"] == fm_id)
        ff_id = str(uuid.uuid4())
        ff = FunctionalFailureModel(
            failure_id=ff_id,
            function_id=func_id,
            failure_type="TOTAL",
            description=f"Failure of {fm['mi_name']}",
            description_fr=f"Défaillance de {fm['mi_name']}",
        )
        db.add(ff)
        fm_ff_map[fm_id] = ff_id

    db.flush()

    # Step C: create failure modes (depends on functional failures)
    for fm_id, ff_id in fm_ff_map.items():
        fm = next(f for f in failure_modes if f["failure_mode_id"] == fm_id)
        fm_obj = FailureModeModel(
            failure_mode_id=fm["failure_mode_id"],
            functional_failure_id=ff_id,
            what=fm["what"],
            mechanism=fm["mechanism"],
            cause=fm["cause"],
            failure_pattern=fm.get("failure_pattern"),
            failure_consequence=fm.get("failure_consequence", "EVIDENT_OPERATIONAL"),
            is_hidden=fm.get("is_hidden", False),
            strategy_type=fm.get("strategy_type", "CONDITION_BASED"),
            failure_effect={"evidence": f"{fm['what']} shows signs of {fm['mechanism'].lower()}"},
        )
        db.add(fm_obj)
        fm_count += 1

    db.flush()

    # 5. Generate work order history
    work_orders = gen.generate_work_order_history(nodes, months=24)
    wo_count = 0
    for wo in work_orders:
        existing = db.query(WorkOrderModel).filter(WorkOrderModel.work_order_id == wo["work_order_id"]).first()
        if existing:
            continue
        obj = WorkOrderModel(
            work_order_id=wo["work_order_id"],
            order_type=wo["order_type"],
            equipment_id=wo["equipment_id"],
            equipment_tag=wo.get("equipment_tag", ""),
            priority=wo["priority"],
            status=wo["status"],
            created_date=date.fromisoformat(wo["created_date"]),
            actual_duration_hours=wo.get("actual_duration_hours"),
            description=wo.get("description", ""),
        )
        db.add(obj)
        wo_count += 1

    # 6. Audit log entry
    db.add(AuditLogModel(
        entity_type="system", entity_id="seed",
        action="SEED", payload={"nodes": node_count, "failure_modes": fm_count, "work_orders": wo_count},
        user="system", timestamp=datetime.now(),
    ))

    db.flush()

    # 7. Seed M1-3 data: workforce, inventory, shutdowns, work requests, backlog
    m13_stats = _seed_m13_data(db, nodes)

    db.commit()

    # 8. Generate SAP mock JSON files
    sap_stats = generate_sap_mock()

    stats = gen.get_statistics(nodes)
    return {
        "status": "seeded",
        "hierarchy_nodes": node_count,
        "failure_modes": fm_count,
        "work_orders": wo_count,
        "total_hierarchy_nodes": stats["total_nodes"],
        "node_types": stats["by_type"],
        "sap_mock_files": sap_stats,
        **m13_stats,
    }


def _seed_m13_data(db: Session, nodes: list[dict]) -> dict:
    """Seed M1-3 data: workforce, inventory, shutdowns, work requests, backlog.
    Idempotent — skips records that already exist."""
    from datetime import timedelta
    import random
    random.seed(42)

    # ── Workforce (25 workers) ──
    specialties = ["MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "WELDING", "GENERAL"]
    shifts = ["MORNING", "AFTERNOON", "NIGHT"]
    wf_count = 0
    for i in range(25):
        wid = f"WKR-{i+1:03d}"
        if db.query(WorkforceModel).filter(WorkforceModel.worker_id == wid).first():
            continue
        spec = specialties[i % len(specialties)]
        shift = shifts[i % len(shifts)]
        db.add(WorkforceModel(
            worker_id=wid,
            name=f"Technician {spec.title()} {i+1}",
            specialty=spec,
            shift=shift,
            plant_id="OCP-JFC1",
            available=i % 5 != 0,
            certifications=[spec, "SAFETY_BASIC"],
        ))
        wf_count += 1

    # ── Inventory (50 items) ──
    inv_count = 0
    component_types = ["Bearing", "Seal", "Impeller", "Filter", "Belt", "Motor", "Coupling", "Liner", "Gearbox", "Valve"]
    for i in range(50):
        mat_code = f"MAT-{component_types[i % len(component_types)][:3].upper()}-{i+1:03d}"
        if db.query(InventoryItemModel).filter(InventoryItemModel.material_code == mat_code).first():
            continue
        comp = component_types[i % len(component_types)]
        qty = random.randint(0, 20)
        reserved = min(random.randint(0, 3), qty)
        db.add(InventoryItemModel(
            material_code=mat_code,
            warehouse_id="WH-JFC1",
            description=f"{comp} replacement part #{i+1}",
            quantity_on_hand=qty,
            quantity_reserved=reserved,
            quantity_available=qty - reserved,
            min_stock=2,
            reorder_point=5,
            last_movement_date=date.today() - timedelta(days=random.randint(1, 60)),
        ))
        inv_count += 1

    # ── Shutdown Calendar (6 windows) ──
    sd_count = 0
    for i in range(6):
        sd_id = f"SD-JFC1-{i+1:02d}"
        if db.query(ShutdownCalendarModel).filter(ShutdownCalendarModel.shutdown_id == sd_id).first():
            continue
        start = date.today() + timedelta(days=30 * (i + 1))
        is_major = i % 3 == 0
        duration_days = 3 if is_major else 1
        db.add(ShutdownCalendarModel(
            shutdown_id=sd_id,
            plant_id="OCP-JFC1",
            start_date=start,
            end_date=start + timedelta(days=duration_days),
            shutdown_type="MAJOR_20H_PLUS" if is_major else "MINOR_8H",
            areas=["BRY-SAG", "BRY-CYC"] if is_major else ["BRY-SAG"],
            description=f"{'Major' if is_major else 'Minor'} shutdown #{i+1}",
        ))
        sd_count += 1

    db.flush()

    # ── Work Requests (20) ──
    equipment_nodes = [n for n in nodes if n["node_type"] == "EQUIPMENT"]
    statuses = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "DRAFT", "PENDING_VALIDATION"]
    wr_count = 0
    wr_ids = []
    for i in range(min(20, max(len(equipment_nodes) * 2, 5))):
        eq = equipment_nodes[i % len(equipment_nodes)] if equipment_nodes else {"node_id": "EQ-DEFAULT", "tag": "DEFAULT-TAG"}
        st = statuses[i % len(statuses)]
        wr_id = f"WR-SEED-{i+1:03d}"
        wr_ids.append((wr_id, st, eq))

        if db.query(WorkRequestModel).filter(WorkRequestModel.request_id == wr_id).first():
            continue

        cap_id = f"CAP-SEED-{i+1:03d}"
        if not db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == cap_id).first():
            db.add(FieldCaptureModel(
                capture_id=cap_id,
                technician_id=f"TECH-{(i % 10) + 1:03d}",
                capture_type="TEXT",
                language="en",
                raw_text=f"Equipment {eq.get('tag', 'UNKNOWN')} showing signs of wear on bearing",
                created_at=datetime.now() - timedelta(days=random.randint(1, 30)),
            ))

        db.add(WorkRequestModel(
            request_id=wr_id,
            source_capture_id=cap_id,
            status=st,
            equipment_id=eq.get("node_id", "UNKNOWN"),
            equipment_tag=eq.get("tag", eq.get("code", "UNKNOWN")),
            equipment_confidence=0.85,
            resolution_method="EXACT_MATCH",
            problem_description={
                "original_text": f"Bearing wear detected on {eq.get('tag', 'UNKNOWN')}",
                "structured_description": f"Affected component: Bearing. Failure mechanism: WEARS.",
                "structured_description_fr": f"Composant affecté: Roulement. Mécanisme: USURE.",
            },
            ai_classification={
                "work_order_type": "PM03_CORRECTIVE" if i % 3 == 0 else "PM02_PREVENTIVE",
                "priority_suggested": ["3_NORMAL", "2_URGENT", "4_PLANNED"][i % 3],
                "priority_justification": "AI classification based on equipment criticality",
                "estimated_duration_hours": [4.0, 8.0, 2.0][i % 3],
                "required_specialties": ["MECHANICAL"],
                "safety_flags": ["SAFETY"] if i % 7 == 0 else [],
            },
            spare_parts=[],
            created_at=datetime.now() - timedelta(days=random.randint(1, 30)),
        ))
        wr_count += 1

    db.flush()

    # ── Backlog Items (from validated work requests) ──
    bl_count = 0
    for wr_id, st, eq in wr_ids:
        if st == "VALIDATED":
            bl_id = f"BL-{wr_id}"
            if db.query(BacklogItemModel).filter(BacklogItemModel.backlog_id == bl_id).first():
                continue
            db.add(BacklogItemModel(
                backlog_id=bl_id,
                work_request_id=wr_id,
                equipment_id=eq.get("node_id", "UNKNOWN"),
                equipment_tag=eq.get("tag", eq.get("code", "UNKNOWN")),
                priority="3_NORMAL",
                wo_type="PM02",
                status="AWAITING_APPROVAL",
                estimated_hours=4.0,
                specialties=["MECHANICAL"],
                materials_ready=random.choice([True, True, False]),
                shutdown_required=random.choice([True, False, False]),
                age_days=random.randint(1, 45),
                created_at=datetime.now() - timedelta(days=random.randint(1, 30)),
            ))
            bl_count += 1

    return {
        "workforce": wf_count,
        "inventory_items": inv_count,
        "shutdown_windows": sd_count,
        "work_requests": wr_count,
        "backlog_items": bl_count,
    }


def main():
    """CLI entry point: python -m api.seed"""
    create_all_tables()
    db = SessionLocal()
    try:
        result = seed_all(db)
        print(f"Database seeded successfully:")
        for k, v in result.items():
            print(f"  {k}: {v}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
