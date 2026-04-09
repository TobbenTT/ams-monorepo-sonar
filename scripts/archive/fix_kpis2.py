import sys, uuid, random
from datetime import datetime, date, timedelta
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
PLANT = 'GOLDFIELDS-SN'
now = datetime.utcnow()
today = date.today()
random.seed(42)

equips = db.execute(text(
    "SELECT node_id, name, tag FROM hierarchy_nodes WHERE plant_id = :p AND node_type = 'EQUIPMENT' LIMIT 100"
), {'p': PLANT}).fetchall()
print(f"Equipment: {len(equips)}")

count = 0
for eq in equips:
    try:
        db.execute(text("""
            INSERT INTO kpi_metrics (metrics_id, equipment_id, plant_id, period_start, period_end,
                calculated_at, mtbf_days, mttr_hours, availability_pct, oee_pct,
                schedule_compliance_pct, backlog_hours, pm_compliance_pct,
                total_work_orders, corrective_wo_count, preventive_wo_count, reactive_ratio_pct)
            VALUES (:id, :eid, :plant, :ps, :pe, :at, :mtbf, :mttr, :avail, :oee,
                :sc, :bh, :pm, :two, :cw, :pw, :rr)
        """), {
            'id': str(uuid.uuid4()), 'eid': eq[0], 'plant': PLANT,
            'ps': (today - timedelta(days=30)).isoformat(), 'pe': today.isoformat(),
            'at': now.isoformat(),
            'mtbf': round(random.uniform(5, 60), 1),
            'mttr': round(random.uniform(1, 12), 1),
            'avail': round(random.uniform(80, 99), 1),
            'oee': round(random.uniform(60, 95), 1),
            'sc': round(random.uniform(70, 95), 1),
            'bh': round(random.uniform(10, 200), 0),
            'pm': round(random.uniform(60, 95), 1),
            'two': random.randint(1, 20),
            'cw': random.randint(0, 10),
            'pw': random.randint(0, 10),
            'rr': round(random.uniform(10, 60), 1),
        })
        count += 1
    except Exception as e:
        db.rollback()
        if count == 0: print(f"KPI Error: {str(e)[:120]}")
        continue

db.commit()
print(f"KPI metrics: {count}")

# Health scores
hs = 0
for eq in equips[:50]:
    tag = eq[2] or eq[0]
    try:
        db.execute(text("""
            INSERT INTO health_scores (score_id, node_id, plant_id, equipment_tag, calculated_at,
                composite_score, health_class, trend)
            VALUES (:id, :nid, :plant, :tag, :at, :score, :cls, :trend)
        """), {
            'id': str(uuid.uuid4()), 'nid': eq[0], 'plant': PLANT, 'tag': str(tag),
            'at': now.isoformat(),
            'score': round(random.uniform(50, 100), 1),
            'cls': random.choice(['GOOD', 'FAIR', 'POOR']),
            'trend': random.choice(['IMPROVING', 'STABLE', 'DEGRADING']),
        })
        hs += 1
    except Exception as e:
        db.rollback()
        if hs == 0: print(f"HS Error: {str(e)[:120]}")
        continue

db.commit()
print(f"Health scores: {hs}")
db.close()
print("Done!")
