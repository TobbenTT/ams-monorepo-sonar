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
    # Disable FK checks, clear dependent tables, then work_requests
    db.execute(text("PRAGMA foreign_keys = OFF"))
    db.execute(text("DELETE FROM planner_recommendations"))
    db.execute(text("DELETE FROM backlog_items"))
    db.execute(text("DELETE FROM work_requests"))
    db.execute(text("PRAGMA foreign_keys = ON"))
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

    # ── 5. Assign some tasks to admin user (for "Mis Tareas" in Ejecución) ──
    print("Assigning tasks to admin user...")
    admin_row = db.execute(text(
        "SELECT user_id, username FROM users WHERE role = 'admin' LIMIT 1"
    )).fetchone()
    admin_tasks = 0
    if admin_row:
        admin_uid, admin_uname = admin_row[0], admin_row[1]
        for wo_id in wo_ids[15:20]:  # 5 WOs
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
                "assigned_to": admin_uid,
                "est": round(random.uniform(2, 8), 1),
                "status": random.choice(["ASSIGNED", "IN_PROGRESS"]),
                "created": (now - timedelta(days=random.randint(0, 5))).isoformat(),
                "sched": (now + timedelta(days=random.randint(0, 3))).strftime("%Y-%m-%d"),
                "match_score": round(random.uniform(0.7, 0.99), 2),
                "wo_id": wo_id,
                "desc": random.choice([
                    "Inspección y diagnóstico de equipo",
                    "Reemplazo de componente crítico",
                    "Supervisar pruebas post-intervención",
                    "Verificar alineamiento de eje",
                    "Coordinar entrega de equipo a operaciones",
                ]),
                "understood": True,
                "progress": random.randint(10, 60),
                "completed": None,
            })
            admin_tasks += 1
        print(f"  Assigned {admin_tasks} tasks to admin ({admin_uname})")
    else:
        print("  WARNING: No admin user found - skipping admin task assignment")

    # ── 6. Seed Equipment Handovers (for Ejecución > Entregas tab) ──
    print("Seeding equipment handovers...")
    # Check if table exists
    try:
        db.execute(text("SELECT COUNT(*) FROM equipment_handovers"))
        db.execute(text("DELETE FROM equipment_handovers"))
    except Exception:
        db.rollback()
        print("  equipment_handovers table not found, skipping")

    handover_count = 0
    completed_wos = [wo_ids[i] for i in range(25) if random.random() > 0.6][:8]
    for wo_id in completed_wos:
        tag, equip_name = random.choice(EQUIPMENT)
        node_id = tag_to_node.get(tag, tag_to_node.get(equip_name, tag))
        h_type = random.choice(["TO_MAINTENANCE", "TO_OPERATIONS"])
        from_u = random.choice(WORKERS)[0]
        to_u = random.choice(["Operador Turno A", "Operador Turno B", "Supervisor Operaciones"])

        db.execute(text("""
            INSERT INTO equipment_handovers (
                handover_id, wo_id, equipment_id, equipment_tag,
                handover_type, from_user, to_user,
                condition_notes, tests_passed, test_notes,
                handover_at, created_at
            ) VALUES (
                :hid, :wo_id, :eid, :tag,
                :htype, :from_u, :to_u,
                :notes, :tests, :tnotes,
                :hat, :cat
            )
        """), {
            "hid": _uuid(),
            "wo_id": wo_id,
            "eid": node_id,
            "tag": tag,
            "htype": h_type,
            "from_u": from_u,
            "to_u": to_u,
            "notes": random.choice([
                "Equipo operando normalmente. Sin observaciones.",
                "Equipo entregado con vibración dentro de parámetros. Monitorear en 24h.",
                "Reparación completada. Pendiente prueba de carga completa.",
                "Equipo listo para operación. Se realizaron pruebas exitosas.",
                "Entrega con observación: sello pendiente de reemplazo definitivo en próxima parada.",
            ]),
            "tests": random.random() > 0.2,
            "tnotes": random.choice([
                "Prueba de giro sin carga: OK. Prueba con carga: OK.",
                "Medición de vibración: 2.1 mm/s (dentro de límite 4.5 mm/s).",
                "Prueba eléctrica: aislamiento OK, consumo nominal.",
                None,
            ]),
            "hat": (now - timedelta(days=random.randint(0, 15), hours=random.randint(0, 23))).isoformat(),
            "cat": (now - timedelta(days=random.randint(0, 15))).isoformat(),
        })
        handover_count += 1
    print(f"  Inserted {handover_count} equipment handovers")

    # ── 7. Seed Improvement Actions (for Acciones de Mejora page) ──
    print("Seeding improvement actions...")
    try:
        db.execute(text("DELETE FROM improvement_actions WHERE plant_id = :plant"), {"plant": PLANT})
    except Exception:
        db.rollback()

    IMPROVEMENT_ACTIONS = [
        ("Implementar programa de lubricación predictiva", "IMPROVEMENT", "Reliability", "HIGH", "OPEN"),
        ("Actualizar procedimiento de cambio de rodamientos SAG Mill", "CORRECTIVE", "Procedures", "HIGH", "IN_PROGRESS"),
        ("Capacitar técnicos en alineamiento láser", "PREVENTIVE", "Training", "MEDIUM", "OPEN"),
        ("Instalar sensores de vibración en bomba de slurry", "IMPROVEMENT", "Reliability", "CRITICAL", "IN_PROGRESS"),
        ("Revisar stock mínimo de repuestos críticos flotación", "CORRECTIVE", "Spare Parts", "HIGH", "COMPLETED"),
        ("Estandarizar check-list pre-operacional correas transportadoras", "PREVENTIVE", "Procedures", "MEDIUM", "OPEN"),
        ("Mejorar iluminación en área de mantenimiento molino", "IMPROVEMENT", "Safety", "LOW", "COMPLETED"),
        ("Crear plan de contingencia para falla de thickener", "PREVENTIVE", "Planning", "MEDIUM", "IN_PROGRESS"),
        ("Reducir tiempo de cambio de liners en SAG Mill", "IMPROVEMENT", "Planning", "HIGH", "OPEN"),
        ("Actualizar diagramas eléctricos del variador de frecuencia", "CORRECTIVE", "Procedures", "MEDIUM", "COMPLETED"),
        ("Implementar LOTO en todas las intervenciones", "PREVENTIVE", "Safety", "CRITICAL", "IN_PROGRESS"),
        ("Reparar sistema de supresión de polvo en crusher", "CORRECTIVE", "Reliability", "HIGH", "OPEN"),
        ("Evaluar reemplazo de bomba centrífuga por bomba peristáltica", "IMPROVEMENT", "Reliability", "MEDIUM", "OPEN"),
        ("Documentar lecciones aprendidas de falla de flotación Q1", "PREVENTIVE", "Procedures", "LOW", "COMPLETED"),
        ("Instalar protección contra sobretensión en tablero MCC", "CORRECTIVE", "Safety", "HIGH", "IN_PROGRESS"),
    ]

    action_count = 0
    for i, (title, atype, category, priority, status) in enumerate(IMPROVEMENT_ACTIONS):
        tag, equip_name = random.choice(EQUIPMENT)
        node_id = tag_to_node.get(tag, tag_to_node.get(equip_name, tag))
        days_ago = random.randint(5, 60)
        created = now - timedelta(days=days_ago)
        target = created + timedelta(days=random.randint(14, 90))
        completed_at = (target - timedelta(days=random.randint(0, 10))).isoformat() if status in ("COMPLETED", "VERIFIED") else None

        source = random.choice(["MANUAL", "DEVIATION", "WORK_REQUEST", "RCA"])
        source_ref = None
        if source == "WORK_REQUEST" and wr_ids:
            source_ref = f"WR-{random.choice(wr_ids)[:8]}"
        elif source == "RCA":
            source_ref = f"RCA-2026-{random.randint(1, 20):03d}"
        elif source == "DEVIATION":
            source_ref = f"DEV-{random.randint(100, 999)}"

        db.execute(text("""
            INSERT INTO improvement_actions (
                action_id, title, description, plant_id, equipment_id, equipment_tag,
                source_type, source_ref, action_type, priority, category,
                assigned_to, created_by, target_date, completed_at,
                created_at, updated_at, status,
                ai_generated, ai_suggestion, notes, resolution
            ) VALUES (
                :aid, :title, :desc, :plant, :eid, :tag,
                :source, :sref, :atype, :priority, :category,
                :assigned, :created_by, :target, :completed,
                :created_at, :updated_at, :status,
                :ai, :ai_sug, :notes, :resolution
            )
        """), {
            "aid": _uuid(),
            "title": title,
            "desc": f"Acción derivada de análisis de desempeño. Equipo: {equip_name} ({tag})",
            "plant": PLANT,
            "eid": node_id,
            "tag": tag,
            "source": source,
            "sref": source_ref,
            "atype": atype,
            "priority": priority,
            "category": category,
            "assigned": random.choice(["Ahmed Mansouri", "Jorge Cortina", "Hassan Benali", "Karim Chakir"]),
            "created_by": random.choice(["admin", "Jorge Cortina"]),
            "target": target.strftime("%Y-%m-%d"),
            "completed": completed_at,
            "created_at": created.isoformat(),
            "updated_at": now.isoformat(),
            "status": status,
            "ai": random.random() > 0.7,
            "ai_sug": "IA sugiere priorizar esta acción basado en análisis de tendencia de fallas." if random.random() > 0.6 else "",
            "notes": random.choice(["", "Seguimiento semanal requerido", "Coordinar con compras", "Pendiente aprobación presupuesto"]),
            "resolution": "Acción completada satisfactoriamente. Verificado en campo." if status == "COMPLETED" else "",
        })
        action_count += 1
    print(f"  Inserted {action_count} improvement actions")

    # ── 8. Seed Reports (for Reportes page) ──
    print("Seeding reports...")
    try:
        db.execute(text("DELETE FROM reports WHERE plant_id = :plant"), {"plant": PLANT})
    except Exception:
        db.rollback()

    report_count = 0
    # Weekly reports for last 4 weeks
    for w in range(4):
        week_start = now - timedelta(weeks=w + 1)
        week_end = week_start + timedelta(days=6)
        report_id = _uuid()
        compliance = round(random.uniform(75, 98), 1)
        wo_completed = random.randint(8, 18)
        wo_total = wo_completed + random.randint(1, 5)

        content = {
            "metadata": {
                "report_id": report_id,
                "report_type": "WEEKLY_MAINTENANCE",
                "plant_id": PLANT,
                "period_start": week_start.strftime("%Y-%m-%d"),
                "period_end": week_end.strftime("%Y-%m-%d"),
            },
            "sections": [
                {
                    "title": "Resumen Ejecutivo",
                    "content": f"Semana {now.isocalendar()[1] - w - 1}: Se completaron {wo_completed} de {wo_total} órdenes programadas. "
                               f"Cumplimiento del programa: {compliance}%. Sin incidentes de seguridad.",
                    "metrics": {
                        "schedule_compliance": compliance,
                        "wo_completed": wo_completed,
                        "wo_total": wo_total,
                        "safety_incidents": 0,
                        "backlog_hours": round(random.uniform(20, 80), 1),
                    },
                },
                {
                    "title": "Trabajo Correctivo",
                    "content": f"Se atendieron {random.randint(2, 6)} órdenes correctivas durante la semana.",
                    "metrics": {"corrective_count": random.randint(2, 6), "corrective_hours": round(random.uniform(10, 40), 1)},
                },
                {
                    "title": "Backlog",
                    "content": f"Backlog actual: {random.randint(15, 35)} órdenes pendientes ({round(random.uniform(100, 300), 0)} HH).",
                    "metrics": {"backlog_count": random.randint(15, 35)},
                },
            ],
            "traffic_lights": {
                "adherence": "GREEN" if compliance > 85 else "YELLOW",
                "safety": "GREEN",
                "backlog": random.choice(["GREEN", "YELLOW"]),
            },
            "kpis": {
                "schedule_compliance": {"value": compliance, "target": 90, "status": "OK" if compliance >= 90 else "WARNING"},
            },
        }

        db.execute(text("""
            INSERT INTO reports (report_id, report_type, plant_id, period_start, period_end, generated_at, content, metadata_json)
            VALUES (:rid, :rtype, :plant, :ps, :pe, :gen, :content, :meta)
        """), {
            "rid": report_id,
            "rtype": "WEEKLY_MAINTENANCE",
            "plant": PLANT,
            "ps": week_start.isoformat(),
            "pe": week_end.isoformat(),
            "gen": (week_end + timedelta(days=1)).isoformat(),
            "content": json.dumps(content),
            "meta": json.dumps({"generated_by": "system", "version": "1.0"}),
        })
        report_count += 1

    # Monthly report for last month
    month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
    month_end = now.replace(day=1) - timedelta(days=1)
    report_id = _uuid()
    monthly_content = {
        "metadata": {
            "report_id": report_id,
            "report_type": "MONTHLY_KPI",
            "plant_id": PLANT,
            "period_start": month_start.strftime("%Y-%m-%d"),
            "period_end": month_end.strftime("%Y-%m-%d"),
        },
        "sections": [
            {
                "title": "KPIs del Mes",
                "content": f"Resumen mensual de indicadores de mantenimiento para {month_start.strftime('%B %Y')}.",
                "metrics": {
                    "schedule_compliance": 88.5,
                    "schedule_adherence": 82.3,
                    "backlog_hours": 245,
                    "mtbf_avg": 720,
                    "mttr_avg": 4.2,
                    "availability": 96.1,
                    "safety_incidents": 0,
                    "corrective_pct": 32,
                    "preventive_pct": 68,
                },
            },
            {
                "title": "Análisis de Costos",
                "content": "Costos de mantenimiento dentro del presupuesto mensual.",
                "metrics": {
                    "total_cost": 142500,
                    "labor_cost": 85000,
                    "material_cost": 45000,
                    "contractor_cost": 12500,
                },
            },
        ],
        "traffic_lights": {"adherence": "GREEN", "safety": "GREEN", "backlog": "YELLOW", "costs": "GREEN"},
    }
    db.execute(text("""
        INSERT INTO reports (report_id, report_type, plant_id, period_start, period_end, generated_at, content, metadata_json)
        VALUES (:rid, :rtype, :plant, :ps, :pe, :gen, :content, :meta)
    """), {
        "rid": report_id,
        "rtype": "MONTHLY_KPI",
        "plant": PLANT,
        "ps": month_start.isoformat(),
        "pe": month_end.isoformat(),
        "gen": (month_end + timedelta(days=2)).isoformat(),
        "content": json.dumps(monthly_content),
        "meta": json.dumps({"generated_by": "system", "version": "1.0"}),
    })
    report_count += 1
    print(f"  Inserted {report_count} reports")

    # ── 9. Seed Post Maintenance Reviews ──
    print("Seeding post-maintenance reviews...")
    try:
        db.execute(text("DELETE FROM post_maintenance_reviews WHERE plant_id = :plant"), {"plant": PLANT})
    except Exception:
        db.rollback()

    review_count = 0
    for r in range(3):
        p_end = now - timedelta(weeks=r)
        p_start = p_end - timedelta(weeks=1)
        review_id = _uuid()

        wo_total = random.randint(10, 20)
        wo_completed = wo_total - random.randint(1, 4)
        wo_delayed = random.randint(1, 3)

        db.execute(text("""
            INSERT INTO post_maintenance_reviews (
                review_id, plant_id, period_start, period_end,
                wo_summary, performance_kpis, delays, unplanned_work, rework_items,
                meeting_date, attendees, meeting_notes,
                improvement_actions, lessons_learned,
                status, created_by, created_at, updated_at
            ) VALUES (
                :rid, :plant, :ps, :pe,
                :wo_sum, :kpis, :delays, :unplanned, :rework,
                :mdate, :attendees, :mnotes,
                :actions, :lessons,
                :status, :created_by, :cat, :uat
            )
        """), {
            "rid": review_id,
            "plant": PLANT,
            "ps": p_start.strftime("%Y-%m-%d"),
            "pe": p_end.strftime("%Y-%m-%d"),
            "wo_sum": json.dumps({
                "total": wo_total,
                "completed": wo_completed,
                "in_progress": wo_total - wo_completed,
                "delayed": wo_delayed,
                "rework_count": random.randint(0, 2),
            }),
            "kpis": json.dumps({
                "schedule_compliance": round(random.uniform(78, 96), 1),
                "backlog_hours": round(random.uniform(100, 350), 1),
                "avg_completion_hours": round(random.uniform(4, 10), 1),
                "unplanned_pct": round(random.uniform(8, 25), 1),
            }),
            "delays": json.dumps([
                {"wo_id": random.choice(wo_ids), "wo_number": f"OT-2026-{random.randint(1,25):05d}", "description": random.choice(PROBLEMS)[:80], "hours_delayed": round(random.uniform(2, 16), 1)}
                for _ in range(wo_delayed)
            ]),
            "unplanned": json.dumps([
                {"wo_id": random.choice(wo_ids), "wo_number": f"OT-2026-{random.randint(1,25):05d}", "description": "Trabajo no programado: " + random.choice(PROBLEMS)[:60], "hours": round(random.uniform(2, 12), 1)}
                for _ in range(random.randint(1, 3))
            ]),
            "rework": json.dumps([]),
            "mdate": p_end.strftime("%Y-%m-%d") if r > 0 else None,
            "attendees": json.dumps([
                {"name": "Jorge Cortina", "role": "Superintendente"},
                {"name": "Ahmed Mansouri", "role": "Supervisor Mecánico"},
                {"name": "Karim Chakir", "role": "Supervisor Eléctrico"},
                {"name": "Hassan Benali", "role": "Planificador"},
            ]) if r > 0 else json.dumps([]),
            "mnotes": "Revisión semanal completada. Se discutieron causas de atraso y acciones correctivas." if r > 0 else None,
            "actions": json.dumps([
                {"action": "Mejorar coordinación con almacén para entrega de repuestos", "responsible": "Hassan Benali", "deadline": (p_end + timedelta(days=14)).strftime("%Y-%m-%d"), "status": "COMPLETADO" if r == 2 else "PENDIENTE"},
                {"action": "Revisar procedimiento de LOTO para área de flotación", "responsible": "Karim Chakir", "deadline": (p_end + timedelta(days=7)).strftime("%Y-%m-%d"), "status": "EN_PROGRESO" if r >= 1 else "PENDIENTE"},
            ]) if r > 0 else json.dumps([]),
            "lessons": "Importancia de verificar disponibilidad de repuestos antes de programar OTs." if r > 0 else None,
            "status": "COMPLETED" if r == 2 else ("IN_REVIEW" if r == 1 else "DRAFT"),
            "created_by": "admin",
            "cat": p_end.isoformat(),
            "uat": now.isoformat(),
        })
        review_count += 1
    print(f"  Inserted {review_count} post-maintenance reviews")

    db.commit()
    db.close()
    print(f"\n✓ Work management seed complete!")
    print(f"  - 30 Work Requests")
    print(f"  - 25 Managed Work Orders")
    print(f"  - {len(WORKERS)} Workers")
    print(f"  - {assignment_count + admin_tasks} Work Assignments")
    print(f"  - {handover_count} Equipment Handovers")
    print(f"  - {action_count} Improvement Actions")
    print(f"  - {report_count} Reports")
    print(f"  - {review_count} Post-Maintenance Reviews")


if __name__ == "__main__":
    run()
