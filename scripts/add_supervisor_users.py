"""Idempotent: agregar supervisores + engineer al demo + alinear plant_id.
Ejecutar dentro del container backend:
    docker cp scripts/add_supervisor_users.py ocp-backend:/tmp/
    docker exec ocp-backend python /tmp/add_supervisor_users.py

Bug 2026-05-12 (Magdalena): los demo users (planner1/tecnico1/supervisor1/
manager1) tenían plant_id="OCP-JFC1" pero la data del cliente vive en
"GOLDFIELDS-SN" → con IDOR-scoping veían la app vacía. Este script ahora
también alinea el plant_id de los demo users a la planta con data real.
"""
import os
from api.database.connection import SessionLocal
from api.database.models import UserModel, PlantModel, ManagedWorkOrderModel
from api.services.auth_service import hash_password
from sqlalchemy import func

# El plant_id puede setearse vía env o se detecta auto: la planta con MÁS OTs
# se asume que es la planta operacional principal.
DEFAULT_PLANT = os.environ.get("SEED_PLANT_ID")

NEW_USERS = [
    ("planner2", "planner2@ams.local", "Khalid El Idrissi", "planner"),
    ("sup_mec", "sup_mec@ams.local", "Hassan Rahmouni", "supervisor"),
    ("sup_elec", "sup_elec@ams.local", "Youssef Benkirane", "supervisor"),
    ("sup_inst", "sup_inst@ams.local", "Karim Bouazizi", "supervisor"),
    ("engineer", "engineer@ams.local", "Sara Alaoui", "engineer"),
]

PASSWORD = "Mageam2026!"

FIX_ROLES = [
    ("supervisor1", "supervisor"),
]

# Demo users que deben tener plant_id alineado con la data real
DEMO_USERS_TO_REALIGN = ["planner1", "tecnico1", "supervisor1", "manager1",
                         "planner2", "sup_mec", "sup_elec", "sup_inst", "engineer"]


def detect_primary_plant(db) -> str:
    """Detecta automáticamente la planta operacional principal (la que tiene
    más OTs). Evita hardcodear OCP-JFC1 que era el default histórico."""
    if DEFAULT_PLANT:
        return DEFAULT_PLANT
    # Plant con mayor cantidad de managed_work_orders
    row = db.query(
        ManagedWorkOrderModel.plant_id, func.count(ManagedWorkOrderModel.wo_id)
    ).group_by(ManagedWorkOrderModel.plant_id).order_by(
        func.count(ManagedWorkOrderModel.wo_id).desc()
    ).first()
    if row and row[0]:
        return row[0]
    # Fallback: primera planta del catálogo
    plant = db.query(PlantModel).first()
    return plant.plant_id if plant else "OCP-JFC1"


db = SessionLocal()
primary_plant = detect_primary_plant(db)
print(f"Detected primary plant for demo users: {primary_plant}")

created = 0
skipped = 0
fixed = 0
realigned = 0

for username, email, full_name, role in NEW_USERS:
    if db.query(UserModel).filter(UserModel.username == username).first():
        skipped += 1
        continue
    db.add(UserModel(
        email=email, username=username,
        hashed_password=hash_password(PASSWORD),
        full_name=full_name, role=role,
        plant_id=primary_plant, is_active=True,
    ))
    created += 1
    print(f"created {username} role={role} plant={primary_plant}")

for username, correct_role in FIX_ROLES:
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user and user.role != correct_role:
        old = user.role
        user.role = correct_role
        fixed += 1
        print(f"fixed role {username}: {old} -> {correct_role}")

# Realinear plant_id de los demo users (bug 2026-05-12)
for username in DEMO_USERS_TO_REALIGN:
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user and user.plant_id != primary_plant:
        old = user.plant_id
        user.plant_id = primary_plant
        # Bump token_version para invalidar JWTs viejos con plant_id stale
        user.token_version = (user.token_version or 0) + 1
        realigned += 1
        print(f"realigned {username}: plant {old} -> {primary_plant} (token_version bumped)")

db.commit()
db.close()
print(f"\nDone. created={created} skipped={skipped} role_fixed={fixed} "
      f"plant_realigned={realigned} password={PASSWORD}")
print(f"Si realigned > 0, esos users necesitan re-loguearse.")
