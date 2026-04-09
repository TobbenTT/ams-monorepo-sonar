"""
Enrich Goldfields-SN MWO data:
 - Spread CERRADO actual_end dates over 12 months for realistic MTBM (~3-4 days)
 - Set work_class=PROGRAMADO on ~60% of CERRADO WOs (so schedule_compliance has data)
 - Set wo_type variety (CORRECTIVO, PREVENTIVO, PREDICTIVO) for hours/cost breakdown
 - Recalculate actual_total_cost for closed WOs
"""

import random
from datetime import datetime, timedelta
from api.database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
random.seed(99)

PLANT_ID = "GOLDFIELDS-SN"

# Get all CERRADO WOs
cerrado = db.execute(text(
    "SELECT wo_id FROM managed_work_orders WHERE plant_id=:pid AND status='CERRADO'"
), {"pid": PLANT_ID}).fetchall()
cerrado_ids = [r[0] for r in cerrado]
print(f"CERRADO count: {len(cerrado_ids)}")

# Spread over 12 months
now = datetime.now()
base_date = now - timedelta(days=365)
interval_hours = (365 * 24) / max(len(cerrado_ids), 1)

wo_types = ["PM01", "PM01", "PM02", "PM02", "PM03"]  # ~40% corrective, 40% preventive, 20% predictive

for i, wo_id in enumerate(cerrado_ids):
    eh = round(random.uniform(2, 12), 1)
    ah = round(eh * random.uniform(0.75, 1.25), 1)

    # Stagger over 365 days
    start_offset = timedelta(hours=interval_hours * i + random.uniform(0, interval_hours * 0.4))
    actual_start = base_date + start_offset
    actual_end = actual_start + timedelta(hours=ah)
    planned_start = actual_start - timedelta(hours=random.uniform(1, 6))
    planned_end = planned_start + timedelta(hours=eh)

    # work_class: 60% PROGRAMADO, 40% NO_PROGRAMADO
    work_class = "PROGRAMADO" if i % 5 < 3 else "NO_PROGRAMADO"
    wo_type = random.choice(wo_types)

    # Costs
    labor_cost = round(ah * random.uniform(45, 85), 2) if i % 2 == 0 else None
    material_cost = round(random.uniform(500, 8000), 2) if i % 3 == 0 else None
    external_cost = round(random.uniform(200, 3000), 2) if i % 7 == 0 else None
    budget_amount = round((eh * 65) + random.uniform(300, 3000), 2)
    actual_total = round(
        (labor_cost or 0) + (material_cost or 0) + (external_cost or 0), 2
    )

    db.execute(text("""
        UPDATE managed_work_orders SET
            estimated_hours=:eh, actual_hours=:ah,
            planned_start=:ps, planned_end=:pe,
            actual_start=:astart, actual_end=:aend,
            work_class=:wc, wo_type=:wtype,
            labor_cost=:lc, material_cost=:mc, external_cost=:ec,
            budget_amount=:ba, actual_total_cost=:atc
        WHERE wo_id=:wid
    """), {
        "eh": eh, "ah": ah,
        "ps": planned_start.isoformat(), "pe": planned_end.isoformat(),
        "astart": actual_start.isoformat(), "aend": actual_end.isoformat(),
        "wc": work_class, "wtype": wo_type,
        "lc": labor_cost, "mc": material_cost, "ec": external_cost,
        "ba": budget_amount, "atc": actual_total,
        "wid": wo_id
    })

db.commit()
print("CERRADO WOs enriched.")

# Also update open WOs with wo_type variety
for status, ids_query in [("CREADO", None), ("PLANIFICADO", None), ("PROGRAMADO", None), ("EN_EJECUCION", None)]:
    open_wos = db.execute(text(
        "SELECT wo_id FROM managed_work_orders WHERE plant_id=:pid AND status=:st"
    ), {"pid": PLANT_ID, "st": status}).fetchall()
    for row in open_wos:
        wt = random.choice(wo_types)
        wc = "PROGRAMADO" if status in ("PROGRAMADO", "PLANIFICADO") else random.choice(["PROGRAMADO", "NO_PROGRAMADO"])
        db.execute(text(
            "UPDATE managed_work_orders SET wo_type=:wt, work_class=:wc WHERE wo_id=:wid"
        ), {"wt": wt, "wc": wc, "wid": row[0]})

db.commit()
print("Open WOs wo_type/work_class updated.")

# Verify MTBM
rows = db.execute(text(
    "SELECT actual_end FROM managed_work_orders WHERE plant_id=:pid AND status='CERRADO' AND actual_end IS NOT NULL ORDER BY actual_end"
), {"pid": PLANT_ID}).fetchall()
from datetime import datetime
dates = [datetime.fromisoformat(str(r[0])) for r in rows]
if len(dates) >= 2:
    span = (dates[-1] - dates[0]).total_seconds() / 86400
    mtbm = span / (len(dates) - 1)
    print(f"MTBM = {mtbm:.1f} days ({len(dates)} completed WOs over {span:.0f} days)")

# Cost totals
totals = db.execute(text(
    "SELECT SUM(labor_cost), SUM(material_cost), SUM(actual_total_cost) FROM managed_work_orders WHERE plant_id=:pid"
), {"pid": PLANT_ID}).fetchone()
print(f"Total labor: {round(totals[0] or 0, 2)}, material: {round(totals[1] or 0, 2)}, actual_total: {round(totals[2] or 0, 2)}")

# Schedule compliance (PROGRAMADO CERRADO vs all PROGRAMADO)
prog_total = db.execute(text(
    "SELECT COUNT(*) FROM managed_work_orders WHERE plant_id=:pid AND work_class='PROGRAMADO'"
), {"pid": PLANT_ID}).fetchone()[0]
prog_closed = db.execute(text(
    "SELECT COUNT(*) FROM managed_work_orders WHERE plant_id=:pid AND work_class='PROGRAMADO' AND status='CERRADO'"
), {"pid": PLANT_ID}).fetchone()[0]
print(f"PROGRAMADO: {prog_total} total, {prog_closed} closed → schedule_compliance ~{round(prog_closed/prog_total*100,1) if prog_total else 0}%")

db.close()
print("Done!")
