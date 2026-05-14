"""Seed script — populate OCP-JFC1 with realistic demo data for dashboards."""

import uuid
import random
from datetime import date, datetime, timedelta

from api.database.connection import SessionLocal
from api.database.models import (
    HierarchyNodeModel,
    KPIMetricsModel,
    HealthScoreModel,
    FMECAWorksheetModel,
    WorkPackageModel,
    BacklogItemModel,
    CriticalityAssessmentModel,
)

PLANT_ID = "OCP-JFC1"
ROOT_ID = "OCP-JFC1-ROOT"

# ── Equipment fleet for a fertilizer complex ──────────────────────────────
AREAS = [
    ("AREA-PHOSPHORIC", "Phosphoric Acid Unit", 1),
    ("AREA-GRANULATION", "Granulation Unit", 1),
    ("AREA-UTILITIES", "Utilities & Steam", 1),
]

SYSTEMS = [
    ("SYS-REACT", "Reactor System", "AREA-PHOSPHORIC"),
    ("SYS-FILTER", "Filtration System", "AREA-PHOSPHORIC"),
    ("SYS-GRANUL", "Granulator & Dryer", "AREA-GRANULATION"),
    ("SYS-CONVEY", "Conveyor System", "AREA-GRANULATION"),
    ("SYS-BOILER", "Steam Boilers", "AREA-UTILITIES"),
    ("SYS-COOLING", "Cooling Water Circuit", "AREA-UTILITIES"),
]

EQUIPMENT = [
    # (node_id, name, parent_system, criticality, metadata with KPIs)
    ("AG-3101",  "Agitator AG-3101",        "SYS-REACT",  "A", {"mtbf": 720, "mttr": 8.5, "availability": 98.8, "oee": 91.2}),
    ("R-3102",   "Reactor R-3102",           "SYS-REACT",  "A", {"mtbf": 1200, "mttr": 24.0, "availability": 98.0, "oee": 89.5}),
    ("FP-3201",  "Belt Filter FP-3201",      "SYS-FILTER", "A", {"mtbf": 480, "mttr": 6.0, "availability": 98.7, "oee": 90.1}),
    ("PP-3202",  "Vacuum Pump PP-3202",      "SYS-FILTER", "B", {"mtbf": 960, "mttr": 4.5, "availability": 99.5, "oee": 93.0}),
    ("GR-4101",  "Granulator GR-4101",       "SYS-GRANUL", "A", {"mtbf": 600, "mttr": 12.0, "availability": 98.0, "oee": 88.7}),
    ("DR-4102",  "Rotary Dryer DR-4102",     "SYS-GRANUL", "A", {"mtbf": 840, "mttr": 16.0, "availability": 98.1, "oee": 87.3}),
    ("CV-4201",  "Belt Conveyor CV-4201",    "SYS-CONVEY", "B", {"mtbf": 2400, "mttr": 3.0, "availability": 99.9, "oee": 95.2}),
    ("CV-4202",  "Bucket Elevator CV-4202",  "SYS-CONVEY", "B", {"mtbf": 1800, "mttr": 5.0, "availability": 99.7, "oee": 94.0}),
    ("BL-5001",  "Boiler BL-5001",           "SYS-BOILER", "A", {"mtbf": 4320, "mttr": 48.0, "availability": 98.9, "oee": 90.0}),
    ("CW-5101",  "Cooling Tower CW-5101",    "SYS-COOLING","B", {"mtbf": 8760, "mttr": 8.0, "availability": 99.9, "oee": 96.5}),
    ("CP-5102",  "Circ. Pump CP-5102",       "SYS-COOLING","C", {"mtbf": 6000, "mttr": 3.0, "availability": 99.9, "oee": 97.0}),
]

FAILURE_MODES = [
    "Bearing failure", "Seal leak", "Impeller wear", "Belt misalignment",
    "Corrosion", "Overheating", "Vibration excessive", "Electrical fault",
    "Lubrication failure", "Fatigue crack", "Fouling", "Valve stuck",
]


def uid():
    return str(uuid.uuid4())


def run():
    db = SessionLocal()
    random.seed(42)
    try:
        # Skip if already seeded (check for >5 equipment nodes)
        eq_count = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_type == "EQUIPMENT",
            HierarchyNodeModel.plant_id == PLANT_ID,
        ).count()
        if eq_count > 5:
            print(f"Already seeded ({eq_count} equipment nodes). Skipping.")
            return

        print("Seeding demo data for OCP-JFC1...")

        # ── 1. Areas ────────────────────────────────────────────────
        for area_id, name, level in AREAS:
            if not db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == area_id).first():
                db.add(HierarchyNodeModel(
                    node_id=area_id, node_type="AREA", name=name, code=area_id,
                    parent_node_id=ROOT_ID, level=level, plant_id=PLANT_ID, status="ACTIVE",
                ))
        db.flush()

        # ── 2. Systems ─────────────────────────────────────────────
        for sys_id, name, parent in SYSTEMS:
            if not db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == sys_id).first():
                db.add(HierarchyNodeModel(
                    node_id=sys_id, node_type="SYSTEM", name=name, code=sys_id,
                    parent_node_id=parent, level=2, plant_id=PLANT_ID, status="ACTIVE",
                ))
        db.flush()

        # ── 3. Equipment ───────────────────────────────────────────
        for eq_id, name, parent, crit, meta in EQUIPMENT:
            if not db.query(HierarchyNodeModel).filter(HierarchyNodeModel.node_id == eq_id).first():
                db.add(HierarchyNodeModel(
                    node_id=eq_id, node_type="EQUIPMENT", name=name, code=eq_id,
                    parent_node_id=parent, level=3, plant_id=PLANT_ID,
                    criticality=crit, status="ACTIVE", metadata_json=meta,
                    tag=eq_id,
                ))
        db.flush()

        # ── 4. KPI Metrics — 6 monthly records for plant ──────────
        today = date.today()
        months_labels = []
        for i in range(6):
            m = today.month - 5 + i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            period_start = date(y, m, 1)
            period_end = date(y, m, 28)
            months_labels.append((period_start, period_end))

        # Progressive improvement trend
        base_adherence = [76.0, 79.5, 82.0, 84.5, 87.2, 89.0]
        base_oee = [81.0, 82.5, 84.0, 85.5, 87.0, 88.5]
        base_planning = [142, 128, 115, 105, 98, 88]

        for i, (ps, pe) in enumerate(months_labels):
            db.add(KPIMetricsModel(
                metrics_id=uid(),
                plant_id=PLANT_ID,
                equipment_id=None,  # plant-level KPI
                period_start=ps,
                period_end=pe,
                calculated_at=datetime.combine(pe, datetime.min.time()),
                mtbf_days=30.0 + i * 2.5,
                mttr_hours=8.5 - i * 0.5,
                availability_pct=97.5 + i * 0.3,
                oee_pct=base_oee[i],
                schedule_compliance_pct=base_adherence[i],
                backlog_hours=base_planning[i],
                pm_compliance_pct=72.0 + i * 2.5,
                total_work_orders=45 + i * 3,
                corrective_wo_count=18 - i,
                preventive_wo_count=27 + i * 4,
                reactive_ratio_pct=40.0 - i * 3,
            ))

        # Per-equipment KPI records (latest month only)
        for eq_id, name, parent, crit, meta in EQUIPMENT:
            db.add(KPIMetricsModel(
                metrics_id=uid(),
                plant_id=PLANT_ID,
                equipment_id=eq_id,
                period_start=months_labels[-1][0],
                period_end=months_labels[-1][1],
                calculated_at=datetime.now(),
                mtbf_days=meta["mtbf"] / 24.0,
                mttr_hours=meta["mttr"],
                availability_pct=meta["availability"],
                oee_pct=meta["oee"],
                schedule_compliance_pct=89.0,
                backlog_hours=0,
                pm_compliance_pct=85.0,
                total_work_orders=8,
                corrective_wo_count=2,
                preventive_wo_count=6,
                reactive_ratio_pct=25.0,
            ))
        db.flush()

        # ── 5. Health Scores ───────────────────────────────────────
        trends = ["IMPROVING", "STABLE", "IMPROVING", "STABLE", "IMPROVING",
                  "WORSENING", "STABLE", "STABLE", "IMPROVING", "STABLE", "STABLE"]
        for idx, (eq_id, name, parent, crit, meta) in enumerate(EQUIPMENT):
            db.add(HealthScoreModel(
                score_id=uid(),
                node_id=eq_id,
                plant_id=PLANT_ID,
                equipment_tag=eq_id,
                calculated_at=datetime.now(),
                composite_score=meta["oee"],
                health_class="GOOD" if meta["oee"] >= 90 else "ACCEPTABLE",
                trend=trends[idx % len(trends)],
                dimensions=[
                    {"name": "Reliability", "score": meta["availability"]},
                    {"name": "Performance", "score": meta["oee"]},
                ],
            ))
        db.flush()

        # ── 6. FMECA worksheets for key equipment ─────────────────
        for eq_id, name, parent, crit, meta in EQUIPMENT[:6]:
            rows = []
            n_modes = random.randint(3, 6)
            for j in range(n_modes):
                fm = FAILURE_MODES[j % len(FAILURE_MODES)]
                rows.append({
                    "failure_mode": fm,
                    "description": f"{fm} on {name}",
                    "effect": "Reduced capacity",
                    "rpn": random.randint(40, 280),
                    "severity": random.randint(3, 9),
                    "occurrence": random.randint(2, 7),
                    "detection": random.randint(3, 8),
                })
            existing = db.query(FMECAWorksheetModel).filter(
                FMECAWorksheetModel.equipment_id == eq_id
            ).first()
            if not existing:
                db.add(FMECAWorksheetModel(
                    worksheet_id=uid(),
                    equipment_id=eq_id,
                    equipment_tag=eq_id,
                    equipment_name=name,
                    status="COMPLETED",
                    current_stage="COMPLETED",
                    analyst="system",
                    rows=rows,
                ))
        db.flush()

        # ── 7. Additional Work Packages ────────────────────────────
        wp_types = ["STANDALONE", "STANDALONE", "STANDALONE"]
        freqs = [90, 180, 365]
        for idx, (eq_id, name, parent, crit, meta) in enumerate(EQUIPMENT[:8]):
            db.add(WorkPackageModel(
                work_package_id=uid(),
                name=f"MP-{eq_id}",
                code=f"WPK-{eq_id}-{idx:02d}",
                work_package_type="STANDALONE",
                node_id=eq_id,
                frequency_value=freqs[idx % 3],
                frequency_unit="DAYS",
                constraint="ONLINE" if crit != "A" else "OFFLINE",
                access_time_hours=1.0,
                status="APPROVED",
                labour_summary={"mechanical": 4, "electrical": 2},
            ))
        db.flush()

        # ── 8. Additional Backlog Items ────────────────────────────
        wo_types = ["PM01", "PM02", "PM03"]
        for idx, (eq_id, name, parent, crit, meta) in enumerate(EQUIPMENT[:5]):
            days_old = 5 + idx * 7
            db.add(BacklogItemModel(
                backlog_id=uid(),
                work_request_id=None,
                equipment_id=eq_id,
                equipment_tag=eq_id,
                priority="P1" if crit == "A" else "P2",
                wo_type=wo_types[idx % 3],
                status="READY",
                estimated_hours=4.0 + idx,
                age_days=days_old,
                materials_ready=idx % 2 == 0,
                shutdown_required=crit == "A",
                created_at=datetime.now() - timedelta(days=days_old),
            ))
        db.flush()

        # ── 9. Criticality Assessments ─────────────────────────────
        for eq_id, name, parent, crit, meta in EQUIPMENT:
            db.add(CriticalityAssessmentModel(
                assessment_id=uid(),
                node_id=eq_id,
                assessed_by="system",
                method="FULL_MATRIX",
                criteria_scores=[
                    {"criterion": "Safety", "score": 4},
                    {"criterion": "Production", "score": 5 if crit == "A" else 3},
                    {"criterion": "Maintenance Cost", "score": 3},
                ],
                probability=4 if crit == "A" else 2,
                overall_score=8.5 if crit == "A" else 5.0,
                risk_class=crit,
            ))
        db.flush()

        # Also update existing pump P-1201A metadata
        pump = db.query(HierarchyNodeModel).filter(
            HierarchyNodeModel.node_id == "P-1201A"
        ).first()
        if pump and not pump.metadata_json:
            pump.metadata_json = {"mtbf": 960, "mttr": 6.0, "availability": 99.4, "oee": 92.5}
            pump.parent_node_id = "SYS-FILTER"
            pump.level = 3
            pump.criticality = "B"
            pump.tag = "P-1201A"
            # Also add KPI + health for it
            db.add(KPIMetricsModel(
                metrics_id=uid(), plant_id=PLANT_ID, equipment_id="P-1201A",
                period_start=months_labels[-1][0], period_end=months_labels[-1][1],
                calculated_at=datetime.now(),
                mtbf_days=40.0, mttr_hours=6.0, availability_pct=99.4,
                oee_pct=92.5, schedule_compliance_pct=89.0, backlog_hours=0,
                pm_compliance_pct=85.0, total_work_orders=6,
                corrective_wo_count=1, preventive_wo_count=5, reactive_ratio_pct=17.0,
            ))
            db.add(HealthScoreModel(
                score_id=uid(), node_id="P-1201A", plant_id=PLANT_ID,
                equipment_tag="P-1201A", calculated_at=datetime.now(),
                composite_score=92.5, health_class="GOOD", trend="STABLE",
                dimensions=[{"name": "Reliability", "score": 99.4}, {"name": "Performance", "score": 92.5}],
            ))

        db.commit()
        print("Done! Seeded:")
        print(f"  - {len(AREAS)} areas, {len(SYSTEMS)} systems, {len(EQUIPMENT)} equipment")
        print(f"  - 6 monthly KPI records + {len(EQUIPMENT)} per-equipment records")
        print(f"  - {len(EQUIPMENT)} health scores")
        print(f"  - FMECA worksheets, work packages, backlog items, criticality assessments")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
