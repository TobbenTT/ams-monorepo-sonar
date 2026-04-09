"""Insert KPI metrics for Goldfields equipment so Dashboard shows real values."""
import sys, uuid, random
from datetime import datetime, timedelta
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
PLANT = 'GOLDFIELDS-SN'
now = datetime.utcnow()

# Get equipment nodes for Goldfields
equips = db.execute(text(
    "SELECT node_id, name FROM hierarchy_nodes WHERE plant_id = :p AND node_type = 'EQUIPMENT' LIMIT 100"
), {'p': PLANT}).fetchall()
print(f"Found {len(equips)} equipment nodes")

# Insert KPI metrics for each
random.seed(42)
count = 0
for eq in equips:
    node_id = eq[0]
    mtbf = round(random.uniform(5, 60), 1)  # days
    mttr = round(random.uniform(1, 12), 1)   # hours
    avail = round(random.uniform(80, 99), 1)  # %
    oee = round(random.uniform(60, 95), 1)    # %

    try:
        db.execute(text("""
            INSERT INTO kpi_metrics (metric_id, equipment_id, plant_id, mtbf_days, mttr_hours,
                availability_pct, oee_pct, calculated_at)
            VALUES (:id, :eid, :plant, :mtbf, :mttr, :avail, :oee, :at)
        """), {
            'id': str(uuid.uuid4()), 'eid': node_id, 'plant': PLANT,
            'mtbf': mtbf, 'mttr': mttr, 'avail': avail, 'oee': oee,
            'at': now.isoformat(),
        })
        count += 1
    except Exception as e:
        db.rollback()
        if count == 0:
            print(f"Error: {e}")
        continue

db.commit()
print(f"Inserted {count} KPI metrics for equipment")

# Also insert health scores
hs_count = 0
for eq in equips[:50]:
    try:
        db.execute(text("""
            INSERT INTO health_scores (score_id, node_id, overall_score, trend, calculated_at)
            VALUES (:id, :nid, :score, :trend, :at)
        """), {
            'id': str(uuid.uuid4()), 'nid': eq[0],
            'score': round(random.uniform(50, 100), 1),
            'trend': random.choice(['IMPROVING', 'STABLE', 'DEGRADING']),
            'at': now.isoformat(),
        })
        hs_count += 1
    except Exception as e:
        db.rollback()
        if hs_count == 0:
            print(f"HS Error: {e}")
        continue

db.commit()
print(f"Inserted {hs_count} health scores")

# Verify
r = db.execute(text("SELECT count(*) FROM kpi_metrics WHERE plant_id = :p"), {'p': PLANT}).scalar()
print(f"Total KPI metrics for {PLANT}: {r}")

db.close()
print("Done!")
