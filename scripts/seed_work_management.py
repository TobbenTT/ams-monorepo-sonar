"""Seed script: populate work_requests, managed_work_orders, workforce, work_assignments.

Makes the WorkOrders page, Execution page, and dashboards functional with realistic demo data.
Run inside Docker:  python -m scripts.seed_work_management
"""

import uuid
import json
import random
from datetime import datetime, timedelta

from sqlalchemy import text
from api.database.connection import SessionLocal


def _uuid():
    return str(uuid.uuid4())


PLANT = "OCP-JFC1"

# Realistic OCP equipment tags
EQUIPMENT = [
    ("BRY-SAG-ML", "SAG Mill #1"),
    ("BRY-BM-ML", "Ball Mill #2"),
    ("BRY-CL-CL", "Classifier #1"),
    ("FLT-FC-FL", "Flotation Cell #1"),
    ("FLT-CD-MX", "Conditioner #1"),
    ("THK-TH-TH", "Thickener #1"),
    ("FLT-BF-FL", "Belt Filter #1"),
    ("DRY-RD-DR", "Rotary Dryer #1"),
    ("CNV-BC-CV", "Belt Conveyor #1"),
    ("PMP-SP-PM", "Slurry Pump #1"),
    ("PMP-WP-PM", "Water Pump #2"),
    ("CNV-SC-CV", "Screw Conveyor #1"),
    ("STK-ST-ST", "Stacker #1"),
    ("FLT-DF-FL", "Disc Filter #1"),
]

PROBLEMS = [
    "Alta vibración detectada en rodamientos",
    "Temperatura excesiva en motor principal",
    "Fuga de aceite en sello mecánico",
    "Ruido anormal durante operación",
    "Desgaste visible en correas de transmisión",
    "Baja presión de lubricación",
    "Fisura en estructura de soporte",
    "Obstrucción parcial en ducto de alimentación",
    "Desalineamiento de eje principal",
    "Cortocircuito intermitente en tablero",
    "Pérdida de aislación en motor eléctrico",
    "Válvula de control no responde",
    "Sensor de nivel da lectura errónea",
    "Desgaste en revestimiento interno",
    "Filtración en línea de agua de proceso",
    "Bomba no alcanza presión nominal",
    "Variador de frecuencia con alarma térmica",
    "Correa transportadora desalineada",
    "Rodamiento con juego excesivo",
    "Falla intermitente en PLC comunicación",
]

WORKERS = [
    ("Ahmed Mansouri", "MECANICO", "MORNING"),
    ("Youssef El Idrissi", "MECANICO", "MORNING"),
    ("Hassan Benali", "MECANICO", "AFTERNOON"),
    ("Karim Chakir", "ELECTRICO", "MORNING"),
    ("Omar Ait Taleb", "ELECTRICO", "AFTERNOON"),
    ("Rachid Amrani", "INSTRUMENTACION", "MORNING"),
    ("Mehdi Fassi", "INSTRUMENTACION", "AFTERNOON"),
    ("Said Ouazzani", "MECANICO", "NIGHT"),
    ("Abdelkader Tazi", "ELECTRICO", "NIGHT"),
    ("Mustafa Kabbaj", "MECANICO", "MORNING"),
    ("Driss Lahlou", "SOLDADOR", "MORNING"),
    ("Noureddine Berrada", "SOLDADOR", "AFTERNOON"),
]

WR_STATUSES = ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "APPROVED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CLOSED", "REJECTED"]

WO_TYPES = ["CORRECTIVO", "PREVENTIVO", "PREDICTIVO", "MEJORA"]
WO_STATUSES = ["DRAFT", "PLANNED", "RELEASED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CLOSED"]
PRIORITIES = ["P1", "P2", "P3", "P4"]

FAILURE_CATEGORIES = ["MECANICO", "ELECTRICO", "INSTRUMENTACION"]
FAILURE_SYMPTOMS = {
    "MECANICO": ["ALTA VIBRACION", "ALTA TEMPERATURA", "RUIDO ANORMAL", "FUGA ACEITE", "DESGASTE VISIBLE"],
    "ELECTRICO": ["NO ARRANCA", "SOBRECALENTAMIENTO", "CORTOCIRCUITO", "DISPARO PROTECCION"],
    "INSTRUMENTACION": ["LECTURA ERRONEA", "SIN SEÑAL", "SEÑAL INESTABLE", "NO RESPONDE"],
}


def run():
    db = SessionLocal()
    now = datetime.now()

    # ── 0. Get existing equipment node_ids ──
    equip_rows = db.execute(text(
        "SELECT node_id, tag, name FROM hierarchy_nodes WHERE node_type = 'EQUIPMENT'"
    )).fetchall()
    tag_to_node = {}
    for row in equip_rows:
        if row[1]:
            tag_to_node[row[1]] = row[0]
        if row[2]:
            tag_to_node[row[2]] = row[0]

    # ── 1. Seed Workforce ──
    print("Seeding workforce...")
    db.execute(text("DELETE FROM workforce WHERE plant_id = :plant"), {"plant": PLANT})

    worker_ids = []
    for name, spec, shift in WORKERS:
        wid = _uuid()
        worker_ids.append(wid)
        db.execute(text("""
            INSERT INTO workforce (worker_id, name, specialty, shift, plant_id, available,
                certifications, competency_level, years_experience, equipment_expertise,
                safety_training_current, competencies)
            VALUES (:wid, :name, :spec, :shift, :plant, :avail,
                :certs, :level, :years, :expertise, :safety, :comps)
        """), {
            "wid": wid, "name": name, "spec": spec, "shift": shift, "plant": PLANT,
            "avail": random.random() > 0.15,
            "certs": json.dumps(random.sample(["ISO-45001", "Trabajos en Altura", "Espacios Confinados", "Izaje", "Eléctrico AT", "Soldadura"], k=random.randint(2, 4))),
            "level": random.choice(["A", "B", "B", "C"]),
            "years": random.randint(2, 20),
            "expertise": json.dumps(random.sample([e[0] for e in EQUIPMENT], k=random.randint(2, 5))),
            "safety": random.random() > 0.1,
            "comps": json.dumps([]),
        })
    print(f"  Inserted {len(WORKERS)} workers")

    # ── 2. Seed Work Requests ──
    print("Seeding work requests...")
    # Clean existing and re-seed with correct plant_id
    db.execute(text("DELETE FROM work_requests"))
    existing_wr_count = 0

    wr_ids = []
    for i in range(30):
        wr_id = _uuid()
        wr_ids.append(wr_id)
        tag, equip_name = random.choice(EQUIPMENT)
        node_id = tag_to_node.get(tag, tag_to_node.get(equip_name, tag))
        priority = random.choices(PRIORITIES, weights=[10, 20, 45, 25])[0]
        work_class = "NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO"

        # Distribute statuses realistically
        status = random.choices(
            WR_STATUSES,
            weights=[5, 10, 10, 15, 15, 10, 20, 10, 5]
        )[0]

        days_ago = random.randint(0, 45)
        created = now - timedelta(days=days_ago, hours=random.randint(0, 23))

        sla_map = {"P1": 1, "P2": 7, "P3": 30, "P4": 90}
        sla = created + timedelta(days=sla_map[priority])

        fail_cat = random.choice(FAILURE_CATEGORIES)
        symptom = random.choice(FAILURE_SYMPTOMS[fail_cat])
        problem = random.choice(PROBLEMS)

        approved_at = None
        approval_comment = None
        approver = None
        if status in ("APPROVED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CLOSED"):
            approved_at = created + timedelta(hours=random.randint(2, 48))
            approval_comment = random.choice([
                "Aprobado. Proceder con planificación.",
                "OK. Coordinar con operaciones para ventana de intervención.",
                "Aprobado. Priorizar materiales.",
                "Validado. Asignar a próximo programa semanal.",
            ])
            approver = random.choice(["Ahmed Mansouri", "Jorge Cortina"])

        db.execute(text("""
            INSERT INTO work_requests (
                request_id, status, equipment_id, equipment_tag, equipment_confidence,
                resolution_method, problem_description, ai_classification, spare_parts,
                created_at, priority_code, work_class, sla_deadline,
                created_by, approver_id, approved_at, approval_comment, version
            ) VALUES (
                :rid, :status, :eid, :tag, :conf,
                :method, :prob, :ai, :parts,
                :created, :priority, :wclass, :sla,
                :created_by, :approver, :approved, :comment, 1
            )
        """), {
            "rid": wr_id,
            "status": status,
            "eid": node_id,
            "tag": tag,
            "conf": round(random.uniform(0.75, 0.99), 2),
            "method": "MANUAL",
            "prob": json.dumps({
                "original_text": problem,
                "enhanced_text": f"{problem} - Equipo: {equip_name} ({tag})",
                "detected_language": "es",
            }),
            "ai": json.dumps({
                "work_order_type": random.choice(["PM01", "PM02", "PM03"]),
                "failure_category": fail_cat,
                "failure_symptom": symptom,
                "severity": random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
                "confidence": round(random.uniform(0.7, 0.95), 2),
                "plant_id": PLANT,
            }),
            "parts": json.dumps([]),
            "created": created.isoformat(),
            "priority": priority,
            "wclass": work_class,
            "sla": sla.isoformat(),
            "created_by": random.choice(["Operador Turno A", "Operador Turno B", "Supervisor Área"]),
            "approver": approver,
            "approved": approved_at.isoformat() if approved_at else None,
            "comment": approval_comment,
        })

    print(f"  Inserted 30 work requests (total now: {existing_wr_count + 30})")

    # ── 3. Seed Managed Work Orders ──
    print("Seeding managed work orders...")
    db.execute(text("DELETE FROM managed_work_orders"))
    existing_wo_count = 0

    wo_counter = existing_wo_count + 1
    wo_ids = []

    for i in range(25):
        wo_id = _uuid()
        wo_ids.append(wo_id)
        wo_number = f"OT-2026-{wo_counter:05d}"
        wo_counter += 1

        tag, equip_name = random.choice(EQUIPMENT)
        node_id = tag_to_node.get(tag, tag_to_node.get(equip_name, tag))
        wo_type = random.choices(WO_TYPES, weights=[35, 35, 20, 10])[0]
        priority = random.choices(PRIORITIES, weights=[10, 20, 45, 25])[0]
        work_class = "NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO"

        # Distribute statuses
        status = random.choices(
            WO_STATUSES,
            weights=[8, 10, 10, 15, 20, 25, 12]
        )[0]

        days_ago = random.randint(0, 40)
        created = now - timedelta(days=days_ago)
        est_hours = random.choice([2, 4, 6, 8, 12, 16, 24])
        actual_hours = round(est_hours * random.uniform(0.7, 1.5), 1) if status in ("COMPLETED", "CLOSED") else 0

        planned_start = created + timedelta(days=random.randint(1, 7))
        planned_end = planned_start + timedelta(hours=est_hours)
        actual_start = planned_start + timedelta(hours=random.randint(-12, 24)) if status in ("IN_PROGRESS", "COMPLETED", "CLOSED") else None
        actual_end = actual_start + timedelta(hours=actual_hours) if status in ("COMPLETED", "CLOSED") and actual_start else None

        completion = {
            "DRAFT": 0, "PLANNED": 0, "RELEASED": 0, "SCHEDULED": 0,
            "IN_PROGRESS": random.randint(10, 85), "COMPLETED": 100, "CLOSED": 100,
        }[status]

        # Operations
        n_ops = random.randint(2, 5)
        operations = []
        for seq in range(1, n_ops + 1):
            operations.append({
                "seq": seq * 10,
                "description": random.choice([
                    "Inspección visual del equipo",
                    "Desmontaje de componente",
                    "Reemplazo de rodamiento",
                    "Alineamiento de eje",
                    "Pruebas de funcionamiento",
                    "Lubricación general",
                    "Medición de vibraciones",
                    "Revisión eléctrica",
                    "Cambio de sellos",
                    "Limpieza de filtros",
                    "Calibración de instrumento",
                    "Soldadura de reparación",
                ]),
                "specialty": random.choice(["MECANICO", "ELECTRICO", "INSTRUMENTACION"]),
                "hours": round(random.uniform(1, 4), 1),
                "status": "COMPLETED" if status in ("COMPLETED", "CLOSED") else ("IN_PROGRESS" if seq == 1 and status == "IN_PROGRESS" else "PENDING"),
            })

        # Materials
        materials = [
            {"code": f"MAT-{random.randint(10000, 99999)}", "description": m, "qty_required": random.randint(1, 5), "qty_available": random.randint(0, 5), "reserved": random.choice([True, False])}
            for m in random.sample([
                "Rodamiento SKF 6312", "Sello mecánico 80mm", "Aceite ISO VG 68",
                "Correa Gates 5VX1120", "Filtro hidráulico", "Empaquetadura grafito",
                "Perno M16x80 Gr.8.8", "Arandela plana 16mm", "Grasa EP2",
                "Cable 3x6 AWG", "Fusible NH 250A", "Sensor PT100",
            ], k=random.randint(1, 4))
        ]

        # Budget
        budget = round(random.uniform(500, 25000), 2) if wo_type in ("CORRECTIVO", "MEJORA") else round(random.uniform(200, 5000), 2)

        # Link to a WR if available
        wr_link = random.choice(wr_ids[:15]) if i < 15 and wr_ids else None

        db.execute(text("""
            INSERT INTO managed_work_orders (
                wo_id, wo_number, work_request_id, plant_id, equipment_id, equipment_tag,
                description, wo_type, priority_code, work_class,
                operations, materials, tools, documents, labour_summary,
                planned_start, planned_end, actual_start, actual_end,
                estimated_hours, actual_hours,
                status, planned_by, released_by, released_at, closed_by, closed_at,
                assigned_workers, completion_pct, execution_notes,
                risk_analysis, budget_approved, budget_amount,
                created_at, updated_at
            ) VALUES (
                :wo_id, :wo_num, :wr_id, :plant, :eid, :tag,
                :desc, :wo_type, :priority, :wclass,
                :ops, :mats, :tools, :docs, :labour,
                :ps, :pe, :as_, :ae,
                :est, :actual,
                :status, :planned_by, :released_by, :released_at, :closed_by, :closed_at,
                :workers, :completion, :notes,
                :risk, :budget_ok, :budget,
                :created, :updated
            )
        """), {
            "wo_id": wo_id,
            "wo_num": wo_number,
            "wr_id": wr_link,
            "plant": PLANT,
            "eid": node_id,
            "tag": tag,
            "desc": random.choice(PROBLEMS),
            "wo_type": wo_type,
            "priority": priority,
            "wclass": work_class,
            "ops": json.dumps(operations),
            "mats": json.dumps(materials),
            "tools": json.dumps([{"tool_name": t, "qty": 1} for t in random.sample(["Llave torquímetro", "Extractor rodamientos", "Multímetro", "Alineador láser", "Grúa 5 ton", "Andamio"], k=random.randint(1, 3))]),
            "docs": json.dumps([]),
            "labour": json.dumps({"total_hours": est_hours, "specialties": [{"name": random.choice(["MECANICO", "ELECTRICO"]), "hours": est_hours}]}),
            "ps": planned_start.isoformat(),
            "pe": planned_end.isoformat(),
            "as_": actual_start.isoformat() if actual_start else None,
            "ae": actual_end.isoformat() if actual_end else None,
            "est": est_hours,
            "actual": actual_hours,
            "status": status,
            "planned_by": "Jorge Cortina",
            "released_by": "Ahmed Mansouri" if status not in ("DRAFT", "PLANNED") else None,
            "released_at": (created + timedelta(days=1)).isoformat() if status not in ("DRAFT", "PLANNED") else None,
            "closed_by": "Ahmed Mansouri" if status == "CLOSED" else None,
            "closed_at": actual_end.isoformat() if status == "CLOSED" and actual_end else None,
            "workers": json.dumps([{"worker_id": random.choice(worker_ids), "name": random.choice(WORKERS)[0], "specialty": random.choice(["MECANICO", "ELECTRICO"])}]),
            "completion": completion,
            "notes": json.dumps([{"timestamp": (now - timedelta(hours=random.randint(1, 48))).isoformat(), "user": "Sistema", "note": "OT creada"}]),
            "risk": json.dumps({"level": random.choice(["LOW", "MEDIUM", "HIGH"]), "description": "Evaluación estándar", "mitigations": []}) if random.random() > 0.5 else None,
            "budget_ok": status not in ("DRAFT",),
            "budget": budget,
            "created": created.isoformat(),
            "updated": now.isoformat(),
        })

    print(f"  Inserted 25 managed work orders (total now: {existing_wo_count + 25})")

    # ── 4. Migrate work_assignments if needed + Seed ──
    print("Seeding work assignments...")

    # Add missing columns if they don't exist (SQLite migration)
    existing_cols = {r[1] for r in db.execute(text("PRAGMA table_info(work_assignments)")).fetchall()}
    migrations = {
        "wo_id": "ALTER TABLE work_assignments ADD COLUMN wo_id VARCHAR(50)",
        "task_description": "ALTER TABLE work_assignments ADD COLUMN task_description TEXT DEFAULT ''",
        "task_understood": "ALTER TABLE work_assignments ADD COLUMN task_understood BOOLEAN DEFAULT 0",
        "progress_pct": "ALTER TABLE work_assignments ADD COLUMN progress_pct FLOAT DEFAULT 0",
        "partial_notes": "ALTER TABLE work_assignments ADD COLUMN partial_notes JSON",
        "shift_handover_notes": "ALTER TABLE work_assignments ADD COLUMN shift_handover_notes TEXT",
        "completed_at": "ALTER TABLE work_assignments ADD COLUMN completed_at DATETIME",
    }
    for col, sql in migrations.items():
        if col not in existing_cols:
            db.execute(text(sql))
            print(f"  Added column: {col}")

    db.execute(text("DELETE FROM work_assignments WHERE plant_id = :plant"), {"plant": PLANT})

    assignment_count = 0
    for wo_id in wo_ids[:15]:  # Assignments for first 15 WOs
        n_tasks = random.randint(1, 3)
        for _ in range(n_tasks):
            worker = random.choice(WORKERS)
            worker_id = worker_ids[WORKERS.index(worker)]
            status = random.choices(["ASSIGNED", "IN_PROGRESS", "COMPLETED"], weights=[30, 30, 40])[0]

            db.execute(text("""
                INSERT INTO work_assignments (
                    assignment_id, work_package_id, plant_id, assigned_to,
                    estimated_hours, status, created_at, scheduled_date,
                    competency_match_score,
                    wo_id, task_description, task_understood, progress_pct, completed_at
                ) VALUES (
                    :aid, :wpid, :plant, :assigned_to,
                    :est, :status, :created, :sched,
                    :match_score,
                    :wo_id, :desc, :understood, :progress, :completed
                )
            """), {
                "aid": _uuid(),
                "wpid": wo_id,
                "plant": PLANT,
                "assigned_to": worker_id,
                "est": round(random.uniform(2, 8), 1),
                "status": status,
                "created": (now - timedelta(days=random.randint(1, 10))).isoformat(),
                "sched": (now - timedelta(days=random.randint(0, 7))).strftime("%Y-%m-%d"),
                "match_score": round(random.uniform(0.6, 0.99), 2),
                "wo_id": wo_id,
                "desc": random.choice([
                    "Inspección y diagnóstico",
                    "Reemplazo de componente",
                    "Pruebas post-intervención",
                    "Soldadura de reparación",
                    "Alineamiento y calibración",
                    "Limpieza y lubricación",
                ]),
                "understood": status != "ASSIGNED",
                "progress": 100 if status == "COMPLETED" else (random.randint(20, 80) if status == "IN_PROGRESS" else 0),
                "completed": (now - timedelta(days=random.randint(0, 3))).isoformat() if status == "COMPLETED" else None,
            })
            assignment_count += 1

    print(f"  Inserted {assignment_count} work assignments")

    db.commit()
    db.close()
    print(f"\n✓ Work management seed complete!")
    print(f"  - 30 Work Requests")
    print(f"  - 25 Managed Work Orders")
    print(f"  - {len(WORKERS)} Workers")
    print(f"  - {assignment_count} Work Assignments")


if __name__ == "__main__":
    run()
