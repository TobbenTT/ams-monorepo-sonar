"""One-time script: agregar supervisores + engineer al demo.
Idempotente. Ejecutar dentro del container backend:
    docker cp scripts/add_supervisor_users.py ocp-backend:/tmp/
    docker exec ocp-backend python /tmp/add_supervisor_users.py
"""
from api.database.connection import SessionLocal
from api.database.models import UserModel
from api.services.auth_service import hash_password

NEW_USERS = [
    ("planner2", "planner2@ocp.ma", "Khalid El Idrissi", "planner"),
    ("sup_mec", "sup_mec@ocp.ma", "Hassan Rahmouni", "supervisor"),
    ("sup_elec", "sup_elec@ocp.ma", "Youssef Benkirane", "supervisor"),
    ("sup_inst", "sup_inst@ocp.ma", "Karim Bouazizi", "supervisor"),
    ("engineer", "engineer@ocp.ma", "Sara Alaoui", "engineer"),
]

PASSWORD = "Mageam2026!"

# Tambien arreglar bug existente: supervisor1 tiene role=manager (incorrecto).
FIX_ROLES = [
    ("supervisor1", "supervisor"),
]

db = SessionLocal()
created = 0
skipped = 0
fixed = 0
for username, email, full_name, role in NEW_USERS:
    if db.query(UserModel).filter(UserModel.username == username).first():
        skipped += 1
        continue
    db.add(UserModel(
        email=email, username=username,
        hashed_password=hash_password(PASSWORD),
        full_name=full_name, role=role,
        plant_id="OCP-JFC1", is_active=True,
    ))
    created += 1
    print(f"created {username} role={role}")

for username, correct_role in FIX_ROLES:
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user and user.role != correct_role:
        old = user.role
        user.role = correct_role
        fixed += 1
        print(f"fixed {username}: {old} -> {correct_role}")

db.commit()
db.close()
print(f"\nDone. created={created} skipped={skipped} fixed={fixed} password={PASSWORD}")
