import sys, uuid, json
from datetime import datetime, timedelta
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()
PLANT = 'GOLDFIELDS-SN'
now = datetime.utcnow()

# Improvement Actions - all NOT NULL fields filled
actions = [
    {'title': 'Implement vibration monitoring on SAG mill bearings', 'cat': 'PREDICTIVE', 'prio': 'HIGH', 'status': 'IN_PROGRESS', 'tag': 'GF-SN-3000-3200-3210-3210ML0001'},
    {'title': 'Replace corroded piping in acid plant section 3', 'cat': 'CORRECTIVE', 'prio': 'CRITICAL', 'status': 'IN_PROGRESS', 'tag': 'GF-SN-3000-3300-3310-3310PP0001'},
    {'title': 'Install thermal cameras on electrical panels', 'cat': 'PREDICTIVE', 'prio': 'MEDIUM', 'status': 'PLANNED', 'tag': 'GF-SN-4000-4100-4110-4110PE0001'},
    {'title': 'Update LOTO procedures for crusher maintenance', 'cat': 'SAFETY', 'prio': 'HIGH', 'status': 'COMPLETED', 'tag': 'GF-SN-1000-1100-1110-1110CR0001'},
    {'title': 'Standardize PM checklists for conveyor systems', 'cat': 'PREVENTIVE', 'prio': 'MEDIUM', 'status': 'IN_PROGRESS', 'tag': 'GF-SN-2000-2100-2110-2110CV0001'},
    {'title': 'Oil analysis program for hydraulic systems', 'cat': 'PREDICTIVE', 'prio': 'LOW', 'status': 'PLANNED', 'tag': 'GF-SN-3000-3200-3210-3210HP0001'},
    {'title': 'Root cause training for maintenance technicians', 'cat': 'TRAINING', 'prio': 'MEDIUM', 'status': 'COMPLETED', 'tag': 'GF-SN-1000-1200-1210-1210AR0001'},
    {'title': 'Reduce unplanned downtime on grinding circuit', 'cat': 'RELIABILITY', 'prio': 'CRITICAL', 'status': 'IN_PROGRESS', 'tag': 'GF-SN-3000-3200-3210-3210ML0002'},
    {'title': 'Implement alignment procedures for pump installations', 'cat': 'PREVENTIVE', 'prio': 'HIGH', 'status': 'PLANNED', 'tag': 'GF-SN-3000-3300-3310-3310PP0002'},
    {'title': 'Deploy ultrasonic leak detection on compressed air', 'cat': 'PREDICTIVE', 'prio': 'LOW', 'status': 'COMPLETED', 'tag': 'GF-SN-4000-4200-4210-4210CA0001'},
]

count = 0
for i, a in enumerate(actions):
    try:
        db.execute(text("""
            INSERT INTO improvement_actions (action_id, title, description, plant_id, equipment_id,
                equipment_tag, source_type, action_type, priority, category, assigned_to,
                created_by, created_at, updated_at, status, ai_generated, ai_suggestion, notes, resolution, target_date)
            VALUES (:aid, :title, :desc, :plant, :eid, :tag, :src, :atype, :prio, :cat, :assign,
                :cby, :cat2, :uat, :status, :aig, :ais, :notes, :res, :td)
        """), {
            'aid': str(uuid.uuid4()), 'title': a['title'], 'desc': a['title'],
            'plant': PLANT, 'eid': a['tag'], 'tag': a['tag'],
            'src': 'RCA', 'atype': a['cat'], 'prio': a['prio'], 'cat': a['cat'],
            'assign': 'Carlos Mendez', 'cby': 'system',
            'cat2': (now - timedelta(days=i*5)).strftime('%Y-%m-%d %H:%M:%S'),
            'uat': now.strftime('%Y-%m-%d %H:%M:%S'),
            'status': a['status'], 'aig': 0, 'ais': '', 'notes': '', 'res': '',
            'td': (now + timedelta(days=30-i*3)).strftime('%Y-%m-%d'),
        })
        count += 1
    except Exception as e:
        db.rollback()
        print(f"IA Error: {str(e)[:150]}")
        break

db.commit()
print(f"Improvement Actions: {count}")

# Verify
c = db.execute(text("SELECT count(*) FROM improvement_actions WHERE plant_id = :p"), {'p': PLANT}).scalar()
print(f"Total IA for GF: {c}")

db.close()
print("Done!")
