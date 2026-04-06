"""Migrate imported data from raw tables to app tables that the UI reads from."""
import sys, uuid
from datetime import datetime
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
PLANT = 'GOLDFIELDS-SN'
now = datetime.utcnow().isoformat()

# ═══ 1. notifications → work_requests ═══
print("=== Migrating notifications → work_requests ===")
notifs = db.execute(text("""
    SELECT notification_number, type, description, equipment_tag, priority, created_at, plant_id, status
    FROM notifications WHERE plant_id = :p LIMIT 200
"""), {'p': PLANT}).fetchall()

wr_count = 0
for n in notifs:
    wr_id = f"WR-GF-{str(uuid.uuid4())[:8]}"
    try:
        # Map notification priority to standard
        prio = n[4] or 'P3'
        if prio not in ('P1','P2','P3','P4'):
            prio = 'P3'

        status_map = {'OUTSTANDING': 'PENDIENTE', 'IN_PROCESS': 'PENDIENTE', 'COMPLETED': 'APROBADO'}
        status = status_map.get(n[7], 'PENDIENTE')

        db.execute(text("""
            INSERT INTO work_requests (request_id, status, equipment_tag, problem_description, priority_code,
                created_by, created_at, notification_type, plant_id)
            VALUES (:id, :status, :tag, :desc, :prio, :by, :at, :ntype, :plant)
        """), {
            'id': wr_id, 'status': status, 'tag': n[3] or '',
            'desc': n[2] or 'Imported notification', 'prio': prio,
            'by': 'system-import', 'at': n[5] or now, 'ntype': n[1] or 'M1',
            'plant': PLANT,
        })
        wr_count += 1
    except Exception as e:
        db.rollback()
        if wr_count == 0:
            print(f"  Error: {str(e)[:100]}")
        continue

db.commit()
print(f"  Created {wr_count} work_requests from notifications")

# ═══ 2. work_orders → managed_work_orders ═══
print("\n=== Migrating work_orders → managed_work_orders ===")
wos = db.execute(text("""
    SELECT wo_number, wo_type, description, equipment_tag, priority, status, created_date, actual_hours, plant_id
    FROM work_orders WHERE plant_id = :p LIMIT 300
"""), {'p': PLANT}).fetchall()

mwo_count = 0
for wo in wos:
    wo_id = str(uuid.uuid4())
    wo_num = wo[0] or f"OT-GF-{str(uuid.uuid4())[:6]}"
    try:
        # Map status
        raw_status = (wo[5] or '').upper()
        if 'CECO' in raw_status or 'CLSD' in raw_status or 'TECO' in raw_status:
            status = 'CERRADO'
        elif 'REL' in raw_status or 'RELEASED' in raw_status:
            status = 'PROGRAMADO'
        elif 'CRTD' in raw_status or 'CREATED' in raw_status:
            status = 'CREADO'
        else:
            status = 'CERRADO'

        prio = wo[4] or 'P3'
        if prio not in ('P1','P2','P3','P4'):
            prio = 'P3'

        db.execute(text("""
            INSERT INTO managed_work_orders (wo_id, wo_number, wo_type, description, equipment_tag,
                priority_code, status, plant_id, created_at, actual_hours, planned_by)
            VALUES (:id, :num, :type, :desc, :tag, :prio, :status, :plant, :at, :hours, :by)
        """), {
            'id': wo_id, 'num': wo_num, 'type': wo[1] or 'PM01',
            'desc': wo[2] or '', 'tag': wo[3] or '', 'prio': prio,
            'status': status, 'plant': PLANT, 'at': wo[6] or now,
            'hours': wo[7] or 0, 'by': 'system-import',
        })
        mwo_count += 1
    except Exception as e:
        db.rollback()
        if mwo_count == 0:
            print(f"  Error: {str(e)[:100]}")
        continue

db.commit()
print(f"  Created {mwo_count} managed_work_orders from work_orders")

# ═══ Final stats ═══
print("\n=== Final counts for GOLDFIELDS-SN ===")
for t in ['work_requests', 'managed_work_orders']:
    try:
        c = db.execute(text(f"SELECT count(*) FROM {t} WHERE plant_id = :p"), {'p': PLANT}).scalar()
        print(f"  {t}: {c}")
    except:
        pass

# Status breakdown
print("\n  managed_work_orders by status:")
rows = db.execute(text("SELECT status, count(*) FROM managed_work_orders WHERE plant_id = :p GROUP BY status"), {'p': PLANT}).fetchall()
for r in rows:
    print(f"    {r[0]}: {r[1]}")

print("\n  work_requests by status:")
rows = db.execute(text("SELECT status, count(*) FROM work_requests WHERE plant_id = :p GROUP BY status"), {'p': PLANT}).fetchall()
for r in rows:
    print(f"    {r[0]}: {r[1]}")

db.close()
print("\nDone!")
