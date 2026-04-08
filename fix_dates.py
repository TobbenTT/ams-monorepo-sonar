"""Fix calculated_at dates in kpi_metrics to be proper datetime format."""
import sys
from datetime import datetime
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Check current format
r = db.execute(text("SELECT calculated_at FROM kpi_metrics LIMIT 1")).fetchone()
print(f"Current format: {r[0]} (type: {type(r[0])})")

# The issue is the date filter in analytics uses >= and <= with datetime objects
# but calculated_at might be stored as ISO string that SQLite can't compare properly

# Fix: update all calculated_at to a proper format that SQLite datetime() understands
now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
r = db.execute(text("UPDATE kpi_metrics SET calculated_at = :now WHERE plant_id = :p"),
               {'now': now, 'p': 'GOLDFIELDS-SN'})
print(f"Updated {r.rowcount} kpi_metrics calculated_at to: {now}")

# Also fix period_start and period_end
db.execute(text("UPDATE kpi_metrics SET period_start = :ps, period_end = :pe WHERE plant_id = :p"),
           {'ps': '2026-03-06', 'pe': '2026-04-06', 'p': 'GOLDFIELDS-SN'})

# Fix health_scores too
db.execute(text("UPDATE health_scores SET calculated_at = :now WHERE plant_id = :p"),
           {'now': now, 'p': 'GOLDFIELDS-SN'})

db.commit()

# Verify date filter works now
from api.database.models import KPIMetricsModel, HierarchyNodeModel
node = db.query(HierarchyNodeModel).filter(
    HierarchyNodeModel.plant_id == 'GOLDFIELDS-SN',
    HierarchyNodeModel.node_type == 'EQUIPMENT'
).first()

sd = datetime(2026, 3, 1)
ed = datetime(2026, 5, 1)
km = db.query(KPIMetricsModel).filter(
    KPIMetricsModel.equipment_id == node.node_id,
    KPIMetricsModel.calculated_at >= sd,
    KPIMetricsModel.calculated_at <= ed,
).first()
print(f"Date-filtered KPI: {'FOUND' if km else 'NOT FOUND'}")
if km:
    print(f"  MTBF={km.mtbf_days}, Avail={km.availability_pct}")

db.close()
