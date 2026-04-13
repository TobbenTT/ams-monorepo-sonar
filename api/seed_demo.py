"""Demo plant seeder — creates a fully-populated plant for sales demos.

Idempotent: re-running only fills in missing rows.
"""

import secrets
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    PlantModel, HierarchyNodeModel, WorkOrderModel,
    WorkforceModel, InventoryItemModel, ShutdownCalendarModel,
    WorkRequestModel, FieldCaptureModel, BacklogItemModel,
    UserModel, AuditLogModel,
)
from api.services.auth_service import hash_password
from tools.generators.synthetic_data import SyntheticDataGenerator


def seed_demo_plant(
    db: Session,
    plant_code: str = "DEMO-CORP",
    plant_name: str = "Demo Mining Corporation",
    location: str = "International",
) -> dict:
    """Create a demo plant with hierarchy, workforce, inventory, WRs/WOs, and a demo user."""
    import random
    rng = random.Random(hash(plant_code) & 0xFFFFFFFF)
    gen = SyntheticDataGenerator(seed=hash(plant_code) & 0xFFFF)

    # 1. Plant
    plant = db.query(PlantModel).filter(PlantModel.plant_id == plant_code).first()
    if not plant:
        plant = PlantModel(
            plant_id=plant_code,
            name=plant_name,
            name_fr=plant_name,
            location=location,
        )
        db.add(plant)
        db.flush()

    # 2. Hierarchy
    nodes = gen.generate_plant_hierarchy(plant_code, plant_name)
    node_count = 0
    for n in nodes:
        if db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == n["node_id"]).first():
            continue
        db.add(HierarchyNodeModel(
            node_id=n["node_id"],
            node_type=n["node_type"],
            name=n["name"],
            name_fr=n.get("name_fr", ""),
            code=n.get("code", ""),
            parent_node_id=n.get("parent_node_id"),
            level=n["level"],
            plant_id=plant_code,
            tag=n.get("tag"),
            criticality=n.get("criticality"),
            status="ACTIVE",
            metadata_json={
                "manufacturer": n.get("manufacturer"),
                "power_kw": n.get("power_kw"),
                "weight_kg": n.get("weight_kg"),
            } if n.get("manufacturer") else None,
        ))
        node_count += 1
    db.flush()

    equipment_nodes = [n for n in nodes if n["node_type"] == "EQUIPMENT"]

    # 3. Workforce (15)
    wf_count = 0
    specialties = ["MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "WELDING", "GENERAL"]
    shifts = ["MORNING", "AFTERNOON", "NIGHT"]
    for i in range(15):
        wid = f"WKR-{plant_code}-{i+1:03d}"
        if db.query(WorkforceModel).filter(WorkforceModel.worker_id == wid).first():
            continue
        spec = specialties[i % len(specialties)]
        db.add(WorkforceModel(
            worker_id=wid,
            name=f"Demo Tech {spec.title()} {i+1}",
            specialty=spec,
            shift=shifts[i % len(shifts)],
            plant_id=plant_code,
            available=i % 4 != 0,
            certifications=[spec, "SAFETY_BASIC"],
        ))
        wf_count += 1

    # 4. Inventory (30)
    inv_count = 0
    components = ["Bearing", "Seal", "Impeller", "Filter", "Belt", "Motor", "Coupling", "Valve"]
    for i in range(30):
        mat = f"MAT-{plant_code}-{i+1:03d}"
        if db.query(InventoryItemModel).filter(InventoryItemModel.material_code == mat).first():
            continue
        qty = rng.randint(0, 20)
        reserved = min(rng.randint(0, 3), qty)
        db.add(InventoryItemModel(
            material_code=mat,
            warehouse_id=f"WH-{plant_code}",
            description=f"{components[i % len(components)]} part #{i+1}",
            quantity_on_hand=qty,
            quantity_reserved=reserved,
            quantity_available=qty - reserved,
            min_stock=2,
            reorder_point=5,
            last_movement_date=date.today() - timedelta(days=rng.randint(1, 60)),
        ))
        inv_count += 1

    # 5. Shutdowns (4)
    sd_count = 0
    for i in range(4):
        sd_id = f"SD-{plant_code}-{i+1:02d}"
        if db.query(ShutdownCalendarModel).filter(ShutdownCalendarModel.shutdown_id == sd_id).first():
            continue
        start = date.today() + timedelta(days=30 * (i + 1))
        is_major = i % 2 == 0
        db.add(ShutdownCalendarModel(
            shutdown_id=sd_id,
            plant_id=plant_code,
            start_date=start,
            end_date=start + timedelta(days=3 if is_major else 1),
            shutdown_type="MAJOR_20H_PLUS" if is_major else "MINOR_8H",
            areas=[],
            description=f"{'Major' if is_major else 'Minor'} shutdown #{i+1}",
        ))
        sd_count += 1

    db.flush()

    # 6. Work Requests (25 across statuses)
    wr_count = 0
    statuses = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "OT_CREADA", "PENDING_VALIDATION", "VALIDATED"]
    for i in range(25):
        wr_id = f"WR-{plant_code}-{i+1:03d}"
        if db.query(WorkRequestModel).filter(WorkRequestModel.request_id == wr_id).first():
            continue
        eq = equipment_nodes[i % len(equipment_nodes)] if equipment_nodes else None
        if not eq:
            break
        cap_id = f"CAP-{plant_code}-{i+1:03d}"
        if not db.query(FieldCaptureModel).filter(FieldCaptureModel.capture_id == cap_id).first():
            db.add(FieldCaptureModel(
                capture_id=cap_id,
                technician_id=f"TECH-{(i % 10) + 1:03d}",
                capture_type="TEXT",
                language="en",
                raw_text=f"Equipment {eq.get('tag', 'UNKNOWN')} reported abnormal vibration",
                created_at=datetime.now() - timedelta(days=rng.randint(1, 45)),
            ))
        db.add(WorkRequestModel(
            request_id=wr_id,
            source_capture_id=cap_id,
            status=statuses[i % len(statuses)],
            equipment_id=eq.get("node_id", "UNKNOWN"),
            equipment_tag=eq.get("tag", eq.get("code", "UNKNOWN")),
            equipment_confidence=0.90,
            resolution_method="EXACT_MATCH",
            problem_description={
                "original_text": f"Vibration alert on {eq.get('tag', 'UNKNOWN')}",
                "structured_description": "Affected component: Bearing. Mechanism: WEAR.",
            },
            ai_classification={
                "work_order_type": "PM03_CORRECTIVE" if i % 3 == 0 else "PM02_PREVENTIVE",
                "priority_suggested": ["3_NORMAL", "2_URGENT", "4_PLANNED"][i % 3],
                "priority_justification": "AI classification based on equipment criticality",
                "estimated_duration_hours": [4.0, 8.0, 2.0][i % 3],
                "required_specialties": ["MECHANICAL"],
                "safety_flags": [],
            },
            spare_parts=[],
            created_at=datetime.now() - timedelta(days=rng.randint(1, 45)),
        ))
        wr_count += 1

    db.flush()

    # 7. Work Orders (40 historical)
    wo_count = 0
    wo_statuses = ["CREATED", "PLANNED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "COMPLETED", "COMPLETED"]
    for i in range(40):
        wo_id = f"WO-{plant_code}-{i+1:04d}"
        if db.query(WorkOrderModel).filter(WorkOrderModel.work_order_id == wo_id).first():
            continue
        eq = equipment_nodes[i % len(equipment_nodes)] if equipment_nodes else None
        if not eq:
            break
        db.add(WorkOrderModel(
            work_order_id=wo_id,
            order_type="PM02" if i % 3 else "PM03",
            equipment_id=eq.get("node_id", "UNKNOWN"),
            equipment_tag=eq.get("tag", "UNKNOWN"),
            priority=["HIGH", "MEDIUM", "LOW"][i % 3],
            status=wo_statuses[i % len(wo_statuses)],
            created_date=date.today() - timedelta(days=rng.randint(1, 365)),
            actual_duration_hours=float(rng.randint(1, 12)),
            description=f"Demo WO #{i+1} for {eq.get('tag', 'UNKNOWN')}",
        ))
        wo_count += 1

    # 8. Demo user (manager role, scoped to this plant)
    demo_username = f"demo-{plant_code.lower()}"
    user_created = False
    demo_password = None
    if not db.query(UserModel).filter(UserModel.username == demo_username).first():
        demo_password = "Demo2026!"  # Known password for sales demos
        db.add(UserModel(
            email=f"{demo_username}@aiprowork.com",
            username=demo_username,
            hashed_password=hash_password(demo_password),
            full_name=f"Demo Manager — {plant_name}",
            role="manager",
            plant_id=plant_code,
            is_active=True,
        ))
        user_created = True

    db.add(AuditLogModel(
        entity_type="system",
        entity_id=f"seed-demo-{plant_code}",
        action="SEED_DEMO",
        payload={
            "plant": plant_code,
            "nodes": node_count,
            "work_requests": wr_count,
            "work_orders": wo_count,
        },
        user="system",
        timestamp=datetime.now(),
    ))

    db.commit()

    return {
        "status": "ok",
        "plant_id": plant_code,
        "plant_name": plant_name,
        "hierarchy_nodes": node_count,
        "workforce": wf_count,
        "inventory_items": inv_count,
        "shutdown_windows": sd_count,
        "work_requests": wr_count,
        "work_orders": wo_count,
        "demo_user": demo_username if user_created else None,
        "demo_password": demo_password,
    }
