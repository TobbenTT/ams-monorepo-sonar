import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
from datetime import datetime, timedelta
db = SessionLocal()

# Simulate what the analytics endpoint does
from api.database.models import HierarchyNodeModel, KPIMetricsModel, HealthScoreModel

plant_id = "GOLDFIELDS-SN"
nodes = db.query(HierarchyNodeModel).filter(
    HierarchyNodeModel.node_type == "EQUIPMENT",
    HierarchyNodeModel.plant_id == plant_id,
).all()
print(f"Total equipment nodes: {len(nodes)}")

total_mtbf = total_mttr = total_avail = total_oee = 0.0
counted = 0
for node in nodes[:200]:
    meta = node.metadata_json or {}
    km = db.query(KPIMetricsModel).filter(KPIMetricsModel.equipment_id == node.node_id).order_by(KPIMetricsModel.calculated_at.desc()).first()

    avail = km.availability_pct if km and km.availability_pct is not None else meta.get("availability")
    oee = km.oee_pct if km and km.oee_pct is not None else meta.get("oee")
    mtbf = km.mtbf_days if km and km.mtbf_days is not None else meta.get("mtbf")
    mttr = km.mttr_hours if km and km.mttr_hours is not None else meta.get("mttr")

    if avail is None and oee is None and mtbf is None:
        continue

    counted += 1
    total_avail += avail or 0
    total_oee += oee or 0
    total_mtbf += mtbf or 0
    total_mttr += mttr or 0

if counted > 0:
    print(f"Counted: {counted} equipment with KPIs")
    print(f"Avg MTBF: {round(total_mtbf/counted, 1)} days")
    print(f"Avg MTTR: {round(total_mttr/counted, 1)} hours")
    print(f"Avg Availability: {round(total_avail/counted, 1)}%")
    print(f"Avg OEE: {round(total_oee/counted, 1)}%")
else:
    print("NO equipment with KPIs found!")

# Check if date filtering is the issue
sd = datetime.now() - timedelta(days=30)
ed = datetime.now()
km_filtered = db.query(KPIMetricsModel).filter(
    KPIMetricsModel.equipment_id == nodes[0].node_id,
    KPIMetricsModel.calculated_at >= sd,
    KPIMetricsModel.calculated_at <= ed,
).first()
print(f"\nDate-filtered KPI for first node: {'FOUND' if km_filtered else 'NOT FOUND'}")
if km_filtered:
    print(f"  calculated_at: {km_filtered.calculated_at}")

db.close()
