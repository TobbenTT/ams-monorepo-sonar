"""Migration: Multi-Plant architecture.
Creates new plants and re-assigns data from Excel (Goldfields) vs demo (OCP).
"""
import sqlite3

DB = '/root/ASSET-MANAGEMENT-SOFTWARE/ocp_maintenance.db'
conn = sqlite3.connect(DB)
c = conn.cursor()

# ═══ Step 1: Create new plants ═══
print("=== Creating plants ===")
c.execute("""INSERT OR IGNORE INTO plants (plant_id, name, name_fr, name_ar, location)
VALUES ('GOLDFIELDS-SN', 'Goldfields - Salares Norte', 'Goldfields - Salares Norte', '', 'Atacama, Chile')""")
c.execute("""INSERT OR IGNORE INTO plants (plant_id, name, name_fr, name_ar, location)
VALUES ('FLUOR-ALFA', 'Fluor Alfa', 'Fluor Alfa', '', 'TBD')""")
print(f"  Plants: {[r[0] for r in c.execute('SELECT plant_id FROM plants').fetchall()]}")

# ═══ Step 2: Add plant_id column to tables that don't have it ═══
print("\n=== Adding plant_id to tables without it ===")
tables_need_plant_id = [
    'maintenance_schedule_3w', 'typical_operations', 'shutdown_details',
    'work_permits', 'weekly_programs_seed', 'resource_availability',
    'material_reservations', 'kpi_snapshots_data', 'execution_checklists_data',
    'daily_logs', 'annual_budget_executive', 'annual_budget_opex',
    'annual_budget_maintenance', 'annual_budget_capex', 'annual_budget_kpi_targets',
    'annual_budget_equipment', 'annual_budget_production',
    'measuring_points', 'spare_parts_full', 'field_inspections',
    'catalog_profiles', 'maintenance_plans', 'notifications_raw',
    'measurement_documents', 'time_logs', 'material_movements',
    'cost_history', 'reliability_data', 'maintenance_tasks',
    'criticality_assessments', 'work_packages', 'bom_items', 'settlement_rules',
]

for t in tables_need_plant_id:
    try:
        # Check if column exists
        c.execute(f'PRAGMA table_info("{t}")')
        cols = [r[1] for r in c.fetchall()]
        if 'plant_id' not in cols:
            c.execute(f'ALTER TABLE "{t}" ADD COLUMN plant_id TEXT DEFAULT "OCP-JFC1"')
            print(f"  Added plant_id to {t}")
        else:
            print(f"  {t} already has plant_id")
    except Exception as e:
        print(f"  ERROR {t}: {e}")

# ═══ Step 3: Re-assign data from Excel files to GOLDFIELDS-SN ═══
print("\n=== Re-assigning Excel data to GOLDFIELDS-SN ===")

# Tables loaded from Excel (Goldfields/Codelco real data)
excel_tables = [
    'hierarchy_nodes', 'failure_modes', 'criticality_assessments',
    'functions', 'functional_failures',
    'work_packages', 'maintenance_tasks', 'maintenance_plans',
    'bom_items', 'spare_parts_full', 'measuring_points',
    'settlement_rules', 'catalog_profiles',
    # Tables from Excel 31-41
    'maintenance_schedule_3w', 'typical_operations', 'shutdown_details',
    'work_permits', 'weekly_programs_seed', 'resource_availability',
    'material_reservations', 'kpi_snapshots_data', 'execution_checklists_data',
    'daily_logs', 'annual_budget_executive', 'annual_budget_opex',
    'annual_budget_maintenance', 'annual_budget_capex', 'annual_budget_kpi_targets',
    'annual_budget_equipment', 'annual_budget_production',
    # Other Excel-sourced tables
    'notifications_raw', 'measurement_documents', 'time_logs',
    'material_movements', 'cost_history', 'reliability_data',
    'field_inspections',
]

for t in excel_tables:
    try:
        c.execute(f'UPDATE "{t}" SET plant_id = "GOLDFIELDS-SN" WHERE plant_id IS NULL OR plant_id = "OCP-JFC1"')
        updated = c.rowcount
        if updated > 0:
            print(f"  {t}: {updated} rows → GOLDFIELDS-SN")
    except Exception as e:
        print(f"  ERROR {t}: {e}")

# ═══ Step 4: Demo data stays as OCP-JFC1 ═══
print("\n=== Demo data stays as OCP-JFC1 ===")
demo_tables = [
    'work_requests', 'work_orders', 'workforce', 'users',
    'field_captures', 'health_scores', 'failure_predictions',
    'kpi_metrics', 'inventory_items', 'backlog_items',
    'shutdown_events', 'shutdown_calendar',
    'planning_kpi_snapshots', 'de_kpi_snapshots',
    'planner_recommendations', 'rca_analyses', 'reports',
]
for t in demo_tables:
    try:
        c.execute(f'SELECT COUNT(*) FROM "{t}" WHERE plant_id = "OCP-JFC1" OR plant_id IS NULL')
        cnt = c.fetchone()[0]
        if cnt > 0:
            c.execute(f'UPDATE "{t}" SET plant_id = "OCP-JFC1" WHERE plant_id IS NULL')
            print(f"  {t}: {cnt} rows stay OCP-JFC1")
    except Exception as e:
        print(f"  SKIP {t}: {e}")

# ═══ Step 5: Verify ═══
print("\n=== Verification ===")
c.execute("SELECT plant_id, COUNT(*) FROM hierarchy_nodes GROUP BY plant_id")
for r in c.fetchall():
    print(f"  hierarchy_nodes: {r[0]} = {r[1]}")

c.execute("SELECT plant_id, COUNT(*) FROM work_requests GROUP BY plant_id")
for r in c.fetchall():
    print(f"  work_requests: {r[0]} = {r[1]}")

c.execute("SELECT plant_id, COUNT(*) FROM failure_modes GROUP BY plant_id")
for r in c.fetchall():
    print(f"  failure_modes: {r[0]} = {r[1]}")

conn.commit()
conn.close()
print("\nDone!")
