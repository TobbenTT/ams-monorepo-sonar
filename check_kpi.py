import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Check KPI data
kpi_count = db.execute(text("SELECT count(*) FROM kpi_metrics WHERE plant_id = :p"), {'p': 'GOLDFIELDS-SN'}).scalar()
print(f"KPI metrics for GF: {kpi_count}")

# Check if equipment_id in kpi matches node_id in hierarchy
sample_kpi = db.execute(text("SELECT equipment_id FROM kpi_metrics WHERE plant_id = :p LIMIT 1"), {'p': 'GOLDFIELDS-SN'}).fetchone()
sample_node = db.execute(text("SELECT node_id FROM hierarchy_nodes WHERE plant_id = :p AND node_type = 'EQUIPMENT' LIMIT 1"), {'p': 'GOLDFIELDS-SN'}).fetchone()
print(f"KPI equipment_id: {sample_kpi[0] if sample_kpi else 'NONE'}")
print(f"Node node_id: {sample_node[0] if sample_node else 'NONE'}")

# Test the actual analytics endpoint logic
from api.database.models import HierarchyNodeModel, KPIMetricsModel
nodes = db.query(HierarchyNodeModel).filter(
    HierarchyNodeModel.node_type == "EQUIPMENT",
    HierarchyNodeModel.plant_id == "GOLDFIELDS-SN",
).limit(5).all()
print(f"\nSQLAlchemy query: {len(nodes)} equipment nodes")

found = 0
for node in nodes:
    km = db.query(KPIMetricsModel).filter(KPIMetricsModel.equipment_id == node.node_id).first()
    if km:
        found += 1
        print(f"  Match: {node.node_id} -> MTBF={km.mtbf_days}, Avail={km.availability_pct}")
    else:
        print(f"  No KPI for: {node.node_id}")

print(f"\nMatched: {found}/{len(nodes)}")
db.close()
