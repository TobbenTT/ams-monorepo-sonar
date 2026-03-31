"""Seed KPI metrics from the 280 WOs already in the database."""
import os, sys
from datetime import datetime, timedelta
sys.path.insert(0, "/app")
os.chdir("/app")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

DB_URL = os.getenv("DATABASE_URL", "sqlite:///data/ocp_maintenance.db")
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)
db = Session()

# Get WO stats
wos = db.execute(text("SELECT status, wo_type, priority_code, estimated_hours, actual_hours, labor_cost, material_cost, external_cost, created_at, closed_at FROM managed_work_orders")).fetchall()

total = len(wos)
closed = [w for w in wos if w[0] in ("CERRADO", "CLOSED", "COMPLETED")]
in_exec = [w for w in wos if w[0] in ("EN_EJECUCION", "IN_PROGRESS")]
pending = [w for w in wos if w[0] not in ("CERRADO", "CLOSED", "COMPLETED", "CANCELADO", "CANCELLED")]

total_est_hours = sum(w[3] or 0 for w in wos)
total_act_hours = sum(w[4] or 0 for w in closed)
total_labor = sum(w[5] or 0 for w in wos)
total_material = sum(w[6] or 0 for w in wos)
total_external = sum(w[7] or 0 for w in wos)

# Calculate real KPIs
schedule_compliance = round(len(closed) / total * 100, 1) if total > 0 else 0
pm_compliance = round(len([w for w in closed if w[1] in ("PM02", "PREVENTIVO")]) / max(1, len([w for w in wos if w[1] in ("PM02", "PREVENTIVO")])) * 100, 1)
availability = 96.5  # Typical plant availability
oee = 88.2  # Typical OEE
mtbf_days = round(365 / max(1, len([w for w in wos if w[1] in ("PM01", "CORRECTIVO")])) * total / 71, 1)  # 71 equipment
mttr_hours = round(total_act_hours / max(1, len(closed)), 1)
backlog_hours = round(sum(w[3] or 0 for w in pending), 1)

print(f"=== Calculated KPIs ===")
print(f"  Total WOs: {total}")
print(f"  Closed: {len(closed)}")
print(f"  In Execution: {len(in_exec)}")
print(f"  Pending: {len(pending)}")
print(f"  Schedule Compliance: {schedule_compliance}%")
print(f"  PM Compliance: {pm_compliance}%")
print(f"  Availability: {availability}%")
print(f"  OEE: {oee}%")
print(f"  MTBF: {mtbf_days} days")
print(f"  MTTR: {mttr_hours} hours")
print(f"  Backlog: {backlog_hours} hours")
print(f"  Total Labor Cost: {total_labor:,.0f}")
print(f"  Total Material Cost: {total_material:,.0f}")
print(f"  Total External Cost: {total_external:,.0f}")

# Check kpi_metrics table
cols = [c[1] for c in db.execute(text("PRAGMA table_info(kpi_metrics)")).fetchall()]
print(f"\n  kpi_metrics columns: {cols}")

# Update or insert KPI record
existing = db.execute(text("SELECT metrics_id FROM kpi_metrics WHERE plant_id = 'OCP-JFC1' ORDER BY calculated_at DESC LIMIT 1")).fetchone()

if existing:
    mid = existing[0]
    db.execute(text("""
        UPDATE kpi_metrics SET
            schedule_compliance_pct = :sc,
            pm_compliance_pct = :pm,
            availability_pct = :avail,
            oee_pct = :oee,
            mtbf_days = :mtbf,
            mttr_hours = :mttr,
            backlog_hours = :bl,
            calculated_at = :now
        WHERE metrics_id = :mid
    """), {
        "sc": schedule_compliance, "pm": pm_compliance,
        "avail": availability, "oee": oee,
        "mtbf": mtbf_days, "mttr": mttr_hours,
        "bl": backlog_hours, "now": datetime.now(), "mid": mid,
    })
    print(f"\n  Updated existing KPI record: {mid}")
else:
    mid = str(uuid4())
    db.execute(text("""
        INSERT INTO kpi_metrics (metrics_id, plant_id, schedule_compliance_pct, pm_compliance_pct,
            availability_pct, oee_pct, mtbf_days, mttr_hours, backlog_hours, calculated_at)
        VALUES (:mid, 'OCP-JFC1', :sc, :pm, :avail, :oee, :mtbf, :mttr, :bl, :now)
    """), {
        "mid": mid, "sc": schedule_compliance, "pm": pm_compliance,
        "avail": availability, "oee": oee,
        "mtbf": mtbf_days, "mttr": mttr_hours,
        "bl": backlog_hours, "now": datetime.now(),
    })
    print(f"\n  Inserted new KPI record: {mid}")

db.commit()

# Also seed some historical KPI data points for trend chart
print("\n=== Seeding KPI History (6 months) ===")
for months_ago in range(6, 0, -1):
    d = datetime.now() - timedelta(days=months_ago * 30)
    noise = months_ago * 0.5  # older data slightly worse
    hist_id = str(uuid4())
    try:
        db.execute(text("""
            INSERT INTO kpi_metrics (metrics_id, plant_id, period_start, period_end, schedule_compliance_pct, pm_compliance_pct,
                availability_pct, oee_pct, mtbf_days, mttr_hours, backlog_hours, calculated_at,
                total_work_orders, corrective_wo_count, preventive_wo_count, reactive_ratio_pct)
            VALUES (:mid, 'OCP-JFC1', :ps, :pe, :sc, :pm, :avail, :oee, :mtbf, :mttr, :bl, :dt,
                :two, :cwo, :pwo, :rr)
        """), {
            "mid": hist_id,
            "sc": max(60, schedule_compliance - noise * 3),
            "pm": max(50, pm_compliance - noise * 4),
            "avail": max(85, availability - noise * 1.5),
            "oee": max(75, oee - noise * 2),
            "mtbf": max(10, mtbf_days - noise * 2),
            "mttr": min(20, mttr_hours + noise * 0.5),
            "bl": backlog_hours + noise * 50,
            "ps": d, "pe": d + timedelta(days=30),
            "dt": d,
            "two": total, "cwo": len([w for w in wos if w[1] in ("PM01", "CORRECTIVO")]),
            "pwo": len([w for w in wos if w[1] in ("PM02", "PREVENTIVO")]),
            "rr": round(len([w for w in wos if w[1] in ("PM01", "CORRECTIVO")]) / max(1, total) * 100, 1),
        })
        print(f"  {d.strftime('%Y-%m')}: SC={max(60,schedule_compliance-noise*3):.0f}% Avail={max(85,availability-noise*1.5):.0f}%")
    except Exception as e:
        print(f"  Skip {d.strftime('%Y-%m')}: {e}")
        db.rollback()

db.commit()

# Verify
count = db.execute(text("SELECT COUNT(*) FROM kpi_metrics WHERE plant_id = 'OCP-JFC1'")).scalar()
print(f"\n  Total KPI records: {count}")

db.close()
print("\n=== KPI SEED COMPLETE ===")
