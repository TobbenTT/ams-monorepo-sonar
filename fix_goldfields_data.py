"""
Fix Goldfields-SN data:
 1. Redistribute MWO statuses (50 CREADO, 30 PLANIFICADO, 40 PROGRAMADO, 20 EN_EJECUCION, 160 CERRADO)
 2. Set planned_start/planned_end for PROGRAMADO ones (this week)
 3. Set estimated_hours (2-12h) for all
 4. Set actual_start, actual_end, actual_hours for CERRADO (so MTBM works)
 5. Set labor_cost, material_cost on some CERRADO WOs
 6. Insert KPI metrics record for Goldfields
"""

import random
import uuid
from datetime import datetime, timedelta

from api.database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
random.seed(42)

PLANT_ID = "GOLDFIELDS-SN"

# ── 1. Get all Goldfields MWOs ────────────────────────────────────────
rows = db.execute(text(
    "SELECT wo_id, wo_number, status FROM managed_work_orders WHERE plant_id = :pid ORDER BY wo_number"
), {"pid": PLANT_ID}).fetchall()

all_ids = [r[0] for r in rows]
total = len(all_ids)
print(f"Total Goldfields MWOs: {total}")

# Shuffle for random assignment (keep seed for reproducibility)
random.shuffle(all_ids)

# Assign new statuses
creado_ids     = all_ids[0:50]
planificado_ids = all_ids[50:80]
programado_ids  = all_ids[80:120]
en_ejecucion_ids = all_ids[120:140]
cerrado_ids    = all_ids[140:]  # 160 remain

print(f"CREADO: {len(creado_ids)}, PLANIFICADO: {len(planificado_ids)}, PROGRAMADO: {len(programado_ids)}, EN_EJECUCION: {len(en_ejecucion_ids)}, CERRADO: {len(cerrado_ids)}")

# ── 2. Reference dates ────────────────────────────────────────────────
now = datetime.now()
# "This week" Mon-Sun
monday = now - timedelta(days=now.weekday())
monday = monday.replace(hour=8, minute=0, second=0, microsecond=0)

# ── 3. Update CREADO ──────────────────────────────────────────────────
for wo_id in creado_ids:
    eh = round(random.uniform(2, 12), 1)
    db.execute(text(
        "UPDATE managed_work_orders SET status='CREADO', estimated_hours=:eh, "
        "planned_start=NULL, planned_end=NULL, actual_start=NULL, actual_end=NULL "
        "WHERE wo_id=:wid"
    ), {"eh": eh, "wid": wo_id})

# ── 4. Update PLANIFICADO ─────────────────────────────────────────────
for wo_id in planificado_ids:
    eh = round(random.uniform(2, 12), 1)
    db.execute(text(
        "UPDATE managed_work_orders SET status='PLANIFICADO', estimated_hours=:eh, "
        "planned_start=NULL, planned_end=NULL, actual_start=NULL, actual_end=NULL "
        "WHERE wo_id=:wid"
    ), {"eh": eh, "wid": wo_id})

# ── 5. Update PROGRAMADO (with planned dates this week) ───────────────
for i, wo_id in enumerate(programado_ids):
    eh = round(random.uniform(2, 12), 1)
    # Spread across Mon-Fri
    day_offset = i % 5
    ps = monday + timedelta(days=day_offset, hours=random.randint(0, 6))
    pe = ps + timedelta(hours=eh + 0.5)
    db.execute(text(
        "UPDATE managed_work_orders SET status='PROGRAMADO', estimated_hours=:eh, "
        "planned_start=:ps, planned_end=:pe, actual_start=NULL, actual_end=NULL "
        "WHERE wo_id=:wid"
    ), {"eh": eh, "ps": ps.isoformat(), "pe": pe.isoformat(), "wid": wo_id})

# ── 6. Update EN_EJECUCION ────────────────────────────────────────────
for i, wo_id in enumerate(en_ejecucion_ids):
    eh = round(random.uniform(2, 12), 1)
    # Started today or yesterday
    started = now - timedelta(hours=random.randint(1, 10))
    db.execute(text(
        "UPDATE managed_work_orders SET status='EN_EJECUCION', estimated_hours=:eh, "
        "planned_start=:ps, planned_end=NULL, actual_start=:astart, actual_end=NULL "
        "WHERE wo_id=:wid"
    ), {"eh": eh, "ps": started.isoformat(), "astart": started.isoformat(), "wid": wo_id})

# ── 7. Update CERRADO (add actual_end + costs) ────────────────────────
# Spread closed WOs over last 90 days
base_date = now - timedelta(days=90)
interval_hours = (90 * 24) / max(len(cerrado_ids), 1)

for i, wo_id in enumerate(cerrado_ids):
    eh = round(random.uniform(2, 12), 1)
    ah = round(eh * random.uniform(0.8, 1.3), 1)  # actual ± 30%
    # Stagger over 90 days
    start_offset = timedelta(hours=interval_hours * i + random.uniform(0, interval_hours * 0.5))
    actual_start = base_date + start_offset
    actual_end = actual_start + timedelta(hours=ah)
    # Planned: slightly before actual
    planned_start = actual_start - timedelta(hours=random.uniform(0, 4))
    planned_end = planned_start + timedelta(hours=eh)
    # Costs (for half of CERRADO WOs)
    labor_cost = round(ah * random.uniform(40, 80), 2) if i % 2 == 0 else None
    material_cost = round(random.uniform(500, 5000), 2) if i % 3 == 0 else None
    budget_amount = round((eh * 60) + random.uniform(200, 2000), 2)

    db.execute(text(
        "UPDATE managed_work_orders SET status='CERRADO', estimated_hours=:eh, actual_hours=:ah, "
        "planned_start=:ps, planned_end=:pe, actual_start=:astart, actual_end=:aend, "
        "labor_cost=:lc, material_cost=:mc, budget_amount=:ba "
        "WHERE wo_id=:wid"
    ), {
        "eh": eh, "ah": ah,
        "ps": planned_start.isoformat(), "pe": planned_end.isoformat(),
        "astart": actual_start.isoformat(), "aend": actual_end.isoformat(),
        "lc": labor_cost, "mc": material_cost, "ba": budget_amount,
        "wid": wo_id
    })

db.commit()
print("MWO statuses, dates, hours, and costs updated.")

# ── 8. Insert KPI metrics record ──────────────────────────────────────
# Remove any existing Goldfields KPI records first
db.execute(text("DELETE FROM kpi_metrics WHERE plant_id=:pid"), {"pid": PLANT_ID})
db.commit()

metrics_id = str(uuid.uuid4())
period_start = (now - timedelta(days=30)).date()
period_end = now.date()

db.execute(text("""
    INSERT INTO kpi_metrics (
        metrics_id, plant_id, equipment_id,
        period_start, period_end, calculated_at,
        mtbf_days, mttr_hours, availability_pct, oee_pct,
        schedule_compliance_pct, backlog_hours, pm_compliance_pct,
        total_work_orders, corrective_wo_count, preventive_wo_count, reactive_ratio_pct
    ) VALUES (
        :mid, :pid, NULL,
        :pstart, :pend, :calc_at,
        :mtbf, :mttr, :avail, :oee,
        :sched, :backlog, :pm_comp,
        :total, :corr, :prev, :react
    )
"""), {
    "mid": metrics_id,
    "pid": PLANT_ID,
    "pstart": period_start.isoformat(),
    "pend": period_end.isoformat(),
    "calc_at": now.isoformat(),
    "mtbf": 12.3,      # days between failures
    "mttr": 4.7,       # hours to repair
    "avail": 87.4,     # % availability
    "oee": 74.2,       # OEE %
    "sched": 82.0,     # schedule compliance %
    "backlog": 1240.0, # backlog hours
    "pm_comp": 78.5,   # PM compliance %
    "total": 300,
    "corr": 89,        # corrective
    "prev": 145,       # preventive
    "react": 29.7,     # reactive ratio %
})
db.commit()
print("KPI metrics inserted for GOLDFIELDS-SN.")

# ── 9. Verify ─────────────────────────────────────────────────────────
status_counts = db.execute(text(
    "SELECT status, COUNT(*) FROM managed_work_orders WHERE plant_id=:pid GROUP BY status"
), {"pid": PLANT_ID}).fetchall()
print("\nFinal status distribution:")
for s, c in status_counts:
    print(f"  {s}: {c}")

mtbm_check = db.execute(text(
    "SELECT COUNT(*) FROM managed_work_orders WHERE plant_id=:pid AND actual_end IS NOT NULL AND status='CERRADO'"
), {"pid": PLANT_ID}).fetchone()
print(f"\nCERRADO with actual_end: {mtbm_check[0]}")

cost_check = db.execute(text(
    "SELECT COUNT(*) FROM managed_work_orders WHERE plant_id=:pid AND labor_cost IS NOT NULL"
), {"pid": PLANT_ID}).fetchone()
print(f"MWOs with labor_cost: {cost_check[0]}")

kpi_check = db.execute(text("SELECT mtbf_days, mttr_hours, availability_pct FROM kpi_metrics WHERE plant_id=:pid"), {"pid": PLANT_ID}).fetchone()
print(f"\nKPI metrics: MTBF={kpi_check[0]}d, MTTR={kpi_check[1]}h, Avail={kpi_check[2]}%")

db.close()
print("\nDone!")
