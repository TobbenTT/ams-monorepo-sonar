"""Seed script: populate kpi_metrics, health_scores, notifications, reports.

Computes real KPIs from existing work_orders (168 rows) and work_requests (20 rows).
Run inside Docker:  python -m scripts.seed_kpis
"""

import uuid
import random
from datetime import datetime, date, timedelta

from sqlalchemy import text

from api.database.connection import SessionLocal


def _uuid():
    return str(uuid.uuid4())


def run():
    db = SessionLocal()
    now = datetime.now()
    plant = "OCP-JFC1"

    # ── 1. Query existing work orders ────────────────────────────────
    wo_rows = db.execute(text(
        "SELECT order_type, equipment_id, actual_duration_hours, created_date, status "
        "FROM work_orders WHERE 1=1"
    )).fetchall()

    wr_rows = db.execute(text(
        "SELECT request_id, status, priority_code, equipment_tag, created_at "
        "FROM work_requests"
    )).fetchall()

    equip_rows = db.execute(text(
        "SELECT node_id, name FROM hierarchy_nodes WHERE node_type = 'EQUIPMENT'"
    )).fetchall()

    print(f"Work Orders: {len(wo_rows)}, Work Requests: {len(wr_rows)}, Equipment: {len(equip_rows)}")

    # ── 2. Aggregate work order stats ────────────────────────────────
    total_wo = len(wo_rows)
    by_type = {}
    by_equip = {}
    durations = []

    for row in wo_rows:
        ot = row[0]   # order_type
        eq = row[1]   # equipment_id
        dur = row[2]  # actual_duration_hours
        by_type[ot] = by_type.get(ot, 0) + 1
        if eq not in by_equip:
            by_equip[eq] = {"PM01": 0, "PM02": 0, "PM03": 0, "hours": []}
        by_equip[eq][ot] = by_equip[eq].get(ot, 0) + 1
        if dur:
            by_equip[eq]["hours"].append(dur)
            durations.append(dur)

    pm01 = by_type.get("PM01", 0)  # Corrective
    pm02 = by_type.get("PM02", 0)  # Preventive
    pm03 = by_type.get("PM03", 0)  # Predictive

    avg_dur = sum(durations) / len(durations) if durations else 8.0
    reactive_ratio = round((pm01 / total_wo) * 100, 1) if total_wo else 0

    # ── 3. Compute plant-level KPIs ──────────────────────────────────
    # MTBF: assume 12-month observation, 14 equipment, PM01 = failures
    observation_days = 365
    n_equipment = len(equip_rows) or 14
    failures = pm01 or 1
    mtbf = round((observation_days * n_equipment) / failures, 1)  # ~106 days

    # MTTR: average corrective duration
    corrective_durs = [r[2] for r in wo_rows if r[0] == "PM01" and r[2]]
    mttr = round(sum(corrective_durs) / len(corrective_durs), 1) if corrective_durs else 8.0

    # Availability: A = MTBF / (MTBF + MTTR/24)
    availability = round((mtbf / (mtbf + mttr / 24)) * 100, 1)

    # OEE: Availability × Performance × Quality (assume 88% perf, 96% quality for mining)
    performance_rate = 0.88
    quality_rate = 0.96
    oee = round((availability / 100) * performance_rate * quality_rate * 100, 1)

    # Schedule Compliance: PM02+PM03 completed / total planned (assume 90% target)
    planned = pm02 + pm03
    schedule_compliance = round((planned / (planned + 8)) * 100, 1) if planned else 85.0  # +8 = assumed missed

    # PM Compliance
    pm_compliance = round((pm02 / (pm02 + 5)) * 100, 1) if pm02 else 85.0  # +5 = missed PMs

    # Backlog: pending WRs × avg duration
    pending_wrs = sum(1 for r in wr_rows if r[1] in ("PENDING", "SUBMITTED", "IN_REVIEW"))
    backlog_hours = round(pending_wrs * avg_dur, 0)

    print(f"\n=== Plant KPIs ===")
    print(f"MTBF: {mtbf} days, MTTR: {mttr} hrs, Availability: {availability}%")
    print(f"OEE: {oee}%, Schedule Compliance: {schedule_compliance}%")
    print(f"PM Compliance: {pm_compliance}%, Backlog: {backlog_hours} hrs")
    print(f"Reactive Ratio: {reactive_ratio}%, Total WO: {total_wo}")

    # ── 4. Insert plant-level KPI metrics (monthly for last 6 months) ──
    db.execute(text("DELETE FROM kpi_metrics"))
    db.execute(text("DELETE FROM health_scores"))
    db.execute(text("DELETE FROM notifications"))
    db.execute(text("DELETE FROM reports"))

    today = date.today()
    for months_ago in range(6):
        period_end = today.replace(day=1) - timedelta(days=1) if months_ago == 0 else \
            (today.replace(day=1) - timedelta(days=30 * months_ago))
        period_start = period_end.replace(day=1)
        period_end_d = period_end if isinstance(period_end, date) else period_end

        # Add some variance per month
        var = random.uniform(-3, 3)
        m_mtbf = round(mtbf + random.uniform(-15, 15), 1)
        m_mttr = round(max(2, mttr + random.uniform(-2, 2)), 1)
        m_avail = round(min(99.5, max(80, availability + var)), 1)
        m_oee = round(min(95, max(55, oee + var * 1.2)), 1)
        m_sched = round(min(98, max(65, schedule_compliance + random.uniform(-5, 5))), 1)
        m_pm = round(min(98, max(70, pm_compliance + random.uniform(-5, 5))), 1)
        m_backlog = round(max(0, backlog_hours + random.uniform(-30, 30)), 0)
        m_total = total_wo // 6 + random.randint(-3, 3)
        m_pm01 = pm01 // 6 + random.randint(-2, 2)
        m_pm02 = pm02 // 6 + random.randint(-1, 1)
        m_reactive = round((m_pm01 / m_total) * 100, 1) if m_total else reactive_ratio

        db.execute(text("""
            INSERT INTO kpi_metrics (
                metrics_id, plant_id, equipment_id, period_start, period_end, calculated_at,
                mtbf_days, mttr_hours, availability_pct, oee_pct,
                schedule_compliance_pct, backlog_hours, pm_compliance_pct,
                total_work_orders, corrective_wo_count, preventive_wo_count, reactive_ratio_pct
            ) VALUES (
                :mid, :plant, NULL, :ps, :pe, :calc,
                :mtbf, :mttr, :avail, :oee,
                :sched, :backlog, :pm,
                :total, :corr, :prev, :reactive
            )
        """), {
            "mid": _uuid(), "plant": plant, "ps": period_start, "pe": period_end_d,
            "calc": now, "mtbf": m_mtbf, "mttr": m_mttr, "avail": m_avail,
            "oee": m_oee, "sched": m_sched, "backlog": m_backlog, "pm": m_pm,
            "total": m_total, "corr": m_pm01, "prev": m_pm02, "reactive": m_reactive,
        })

    print(f"Inserted 6 plant-level KPI rows")

    # ── 5. Insert per-equipment KPI metrics ──────────────────────────
    equip_map = {}  # tag -> node_id
    # Build mapping from equipment_tag (KKS) to node_id (UUID)
    tag_to_name = {
        "BRY-SAG-ML": "SAG Mill", "BRY-BM-ML": "Ball Mill", "BRY-CL-CL": "Classifier",
        "FLT-FC-FL": "Flotation Cell", "FLT-CD-MX": "Conditioner",
        "THK-TH-TH": "Thickener", "FLT-BF-FL": "Belt Filter", "FLT-DF-FL": "Disc Filter",
        "DRY-RD-DR": "Rotary Dryer", "CNV-BC-CV": "Belt Conveyor",
        "CNV-SC-CV": "Screw Conveyor", "STK-ST-ST": "Stacker",
        "PMP-SP-PM": "Slurry Pump", "PMP-WP-PM": "Water Pump",
    }

    for eq_row in equip_rows:
        node_id = eq_row[0]
        name = eq_row[1]
        equip_map[name] = node_id

    for eq_tag, stats in by_equip.items():
        # Try to match tag to a hierarchy node
        matched_node = None
        for prefix, name_part in tag_to_name.items():
            if eq_tag.startswith(prefix):
                for ename, nid in equip_map.items():
                    if name_part.lower() in ename.lower():
                        matched_node = nid
                        break
                break

        eq_failures = stats.get("PM01", 0) or 1
        eq_hours = stats["hours"]
        eq_mttr = round(sum(eq_hours) / len(eq_hours), 1) if eq_hours else avg_dur
        eq_mtbf = round(observation_days / eq_failures, 1)
        eq_avail = round((eq_mtbf / (eq_mtbf + eq_mttr / 24)) * 100, 1)
        eq_oee = round((eq_avail / 100) * performance_rate * quality_rate * 100, 1)
        eq_total = sum(v for k, v in stats.items() if k != "hours")
        eq_reactive = round((stats.get("PM01", 0) / eq_total) * 100, 1) if eq_total else 0

        db.execute(text("""
            INSERT INTO kpi_metrics (
                metrics_id, plant_id, equipment_id, period_start, period_end, calculated_at,
                mtbf_days, mttr_hours, availability_pct, oee_pct,
                schedule_compliance_pct, backlog_hours, pm_compliance_pct,
                total_work_orders, corrective_wo_count, preventive_wo_count, reactive_ratio_pct
            ) VALUES (
                :mid, :plant, :equip, :ps, :pe, :calc,
                :mtbf, :mttr, :avail, :oee,
                :sched, :backlog, :pm,
                :total, :corr, :prev, :reactive
            )
        """), {
            "mid": _uuid(), "plant": plant,
            "equip": matched_node or eq_tag,
            "ps": today - timedelta(days=30), "pe": today,
            "calc": now,
            "mtbf": eq_mtbf, "mttr": eq_mttr, "avail": eq_avail, "oee": eq_oee,
            "sched": round(random.uniform(75, 95), 1),
            "backlog": round(random.uniform(0, 40), 0),
            "pm": round(random.uniform(78, 96), 1),
            "total": eq_total,
            "corr": stats.get("PM01", 0),
            "prev": stats.get("PM02", 0),
            "reactive": eq_reactive,
        })

    print(f"Inserted {len(by_equip)} per-equipment KPI rows")

    # ── 6. Insert health_scores for each equipment ────────────────────
    health_classes = ["GOOD", "GOOD", "GOOD", "FAIR", "FAIR", "CRITICAL"]
    for eq_row in equip_rows:
        node_id = eq_row[0]
        name = eq_row[1]
        score = round(random.uniform(55, 98), 1)
        h_class = "GOOD" if score >= 80 else ("FAIR" if score >= 60 else "CRITICAL")
        trend = random.choice(["IMPROVING", "STABLE", "STABLE", "DECLINING"])

        dimensions = [
            {"name": "Vibration", "score": round(random.uniform(60, 100), 1), "weight": 0.3},
            {"name": "Temperature", "score": round(random.uniform(65, 100), 1), "weight": 0.25},
            {"name": "Oil Analysis", "score": round(random.uniform(50, 100), 1), "weight": 0.2},
            {"name": "Performance", "score": round(random.uniform(55, 100), 1), "weight": 0.15},
            {"name": "Age Factor", "score": round(random.uniform(40, 95), 1), "weight": 0.1},
        ]

        recommendations = []
        if score < 70:
            recommendations.append("Schedule detailed inspection within 2 weeks")
        if score < 60:
            recommendations.append("Consider overhaul or replacement planning")
        if trend == "DECLINING":
            recommendations.append("Monitor trend closely - increase inspection frequency")

        db.execute(text("""
            INSERT INTO health_scores (
                score_id, node_id, plant_id, equipment_tag, calculated_at,
                dimensions, composite_score, health_class, trend, recommendations
            ) VALUES (
                :sid, :nid, :plant, :tag, :calc,
                :dims, :score, :hclass, :trend, :recs
            )
        """), {
            "sid": _uuid(), "nid": node_id, "plant": plant,
            "tag": name, "calc": now,
            "dims": str(dimensions).replace("'", '"'),
            "score": score, "hclass": h_class, "trend": trend,
            "recs": str(recommendations).replace("'", '"'),
        })

    print(f"Inserted {len(equip_rows)} health scores")

    # ── 7. Insert notifications ───────────────────────────────────────
    notifications = [
        ("ALERT", "WARNING", "High vibration on SAG Mill #1",
         "Vibration levels exceeded threshold (12.5 mm/s vs 10 mm/s limit). Recommend inspection."),
        ("ALERT", "CRITICAL", "Bearing temperature alarm - Ball Mill #2",
         "Bearing temperature reached 95°C. Immediate inspection required."),
        ("WORK_ORDER", "INFO", "PM-0042 completed successfully",
         "Preventive maintenance on Thickener #1 completed. All checks passed."),
        ("ALERT", "WARNING", "Oil analysis abnormal - Slurry Pump #1",
         "Iron particle count elevated (180 ppm vs 100 ppm threshold). Schedule oil change."),
        ("SYSTEM", "INFO", "Weekly maintenance program published",
         "Week 12 program published with 28 work orders across all areas."),
        ("ALERT", "CRITICAL", "Emergency stop triggered - Conveyor #1",
         "Belt misalignment sensor triggered emergency stop. Requires manual reset and inspection."),
        ("WORK_ORDER", "INFO", "Work request WR-2026-015 approved",
         "Corrective maintenance request for Flotation Cell #1 approved by supervisor."),
        ("ALERT", "WARNING", "Scheduled shutdown reminder",
         "Annual shutdown planned for April 15-22. Ensure all materials and resources are confirmed."),
    ]

    equip_ids = [r[0] for r in equip_rows]
    for i, (ntype, level, title, msg) in enumerate(notifications):
        ack = i >= 5  # first 5 unacknowledged
        db.execute(text("""
            INSERT INTO notifications (
                notification_id, notification_type, level, plant_id,
                equipment_id, title, message, acknowledged, created_at,
                channel
            ) VALUES (
                :nid, :ntype, :level, :plant,
                :equip, :title, :msg, :ack, :created,
                'IN_APP'
            )
        """), {
            "nid": _uuid(), "ntype": ntype, "level": level, "plant": plant,
            "equip": equip_ids[i % len(equip_ids)] if equip_ids else None,
            "title": title, "msg": msg, "ack": ack,
            "created": now - timedelta(hours=random.randint(1, 72)),
        })

    print(f"Inserted {len(notifications)} notifications")

    # ── 8. Insert reports ─────────────────────────────────────────────
    report_types = [
        ("WEEKLY", "Weekly Maintenance Report - Week 11", timedelta(days=7)),
        ("WEEKLY", "Weekly Maintenance Report - Week 10", timedelta(days=14)),
        ("MONTHLY", "Monthly Performance Report - February 2026", timedelta(days=30)),
        ("MONTHLY", "Monthly Performance Report - January 2026", timedelta(days=60)),
    ]

    for rtype, title, offset in report_types:
        p_end = now - offset
        p_start = p_end - (timedelta(days=7) if rtype == "WEEKLY" else timedelta(days=30))
        content = {
            "title": title,
            "summary": f"Plant {plant} - {rtype.lower()} performance review",
            "kpis": {
                "availability": round(random.uniform(88, 96), 1),
                "mtbf": round(random.uniform(80, 130), 1),
                "mttr": round(random.uniform(4, 12), 1),
                "schedule_compliance": round(random.uniform(78, 92), 1),
            },
            "work_orders_completed": random.randint(20, 40),
            "corrective_actions": random.randint(3, 10),
        }
        db.execute(text("""
            INSERT INTO reports (
                report_id, report_type, plant_id, period_start, period_end,
                generated_at, content, metadata_json
            ) VALUES (
                :rid, :rtype, :plant, :ps, :pe, :gen, :content, :meta
            )
        """), {
            "rid": _uuid(), "rtype": rtype, "plant": plant,
            "ps": p_start, "pe": p_end, "gen": now,
            "content": str(content).replace("'", '"'),
            "meta": '{"generated_by": "system", "format": "json"}',
        })

    print(f"Inserted {len(report_types)} reports")

    # ── 9. Also seed weekly_programs and criticality_assessments ──────
    # weekly_programs columns: program_id, plant_id, week_number, year, status,
    #   work_packages(JSON), total_hours, resource_slots(JSON), conflicts(JSON),
    #   support_tasks(JSON), created_at, finalized_at
    import json as _json
    current_week = today.isocalendar()[1]
    current_year = today.year
    for week_offset in range(4):
        wn = current_week - week_offset
        yr = current_year
        if wn <= 0:
            wn += 52
            yr -= 1
        wp_list = [{"wo_id": f"WO-{random.randint(800000,899999)}", "hours": round(random.uniform(4,16),1)} for _ in range(random.randint(8, 15))]
        db.execute(text("""
            INSERT OR IGNORE INTO weekly_programs (
                program_id, plant_id, week_number, year, status,
                work_packages, total_hours, resource_slots, conflicts,
                support_tasks, created_at
            ) VALUES (
                :pid, :plant, :wn, :yr, :status,
                :wp, :hours, :rs, :conf,
                :st, :created
            )
        """), {
            "pid": _uuid(), "plant": plant, "wn": wn, "yr": yr,
            "status": "PUBLISHED" if week_offset > 0 else "DRAFT",
            "wp": _json.dumps(wp_list),
            "hours": round(sum(w["hours"] for w in wp_list), 0),
            "rs": '[]', "conf": '[]', "st": '[]',
            "created": now - timedelta(weeks=week_offset),
        })

    print("Inserted 4 weekly programs")

    # criticality_assessments columns: assessment_id, node_id, assessed_at,
    #   assessed_by, method, criteria_scores(JSON), probability, overall_score,
    #   risk_class, ai_suggested_class, ai_justification, status
    for eq_row in equip_rows[:8]:  # First 8 equipment
        scores = {"safety": random.randint(1,5), "environment": random.randint(1,5),
                  "production": random.randint(1,5), "cost": random.randint(1,5)}
        overall = round(sum(scores.values()) / len(scores), 1)
        risk = "A" if overall >= 4 else ("B" if overall >= 2.5 else "C")
        db.execute(text("""
            INSERT OR IGNORE INTO criticality_assessments (
                assessment_id, node_id, assessed_at, assessed_by, method,
                criteria_scores, probability, overall_score, risk_class,
                ai_suggested_class, ai_justification, status
            ) VALUES (
                :aid, :nid, :assessed, :by, :method,
                :scores, :prob, :score, :risk,
                :ai_class, :ai_just, :status
            )
        """), {
            "aid": _uuid(), "nid": eq_row[0],
            "assessed": now - timedelta(days=random.randint(10, 60)),
            "by": "Ahmed Mansouri", "method": "FMECA",
            "scores": _json.dumps(scores),
            "prob": random.randint(1, 5),
            "score": overall, "risk": risk,
            "ai_class": risk, "ai_just": "Based on failure history and operational context",
            "status": "APPROVED",
        })

    print("Inserted 8 criticality assessments")

    db.commit()
    db.close()
    print("\n✓ Seed complete! Restart the app to see KPIs populated.")


if __name__ == "__main__":
    run()
