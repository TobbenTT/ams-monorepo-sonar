"""Import ALL seed_data Excel files into PostgreSQL for GOLDFIELDS-SN plant."""
import os, sys, uuid
import pandas as pd
from datetime import datetime

# Must run inside Docker: docker exec ocp-backend python3 /app/import_goldfields.py
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal, engine
from sqlalchemy import text, inspect

SEED_DIR = '/app/seed_data'
PLANT_ID = 'GOLDFIELDS-SN'

db = SessionLocal()

def safe_val(v):
    """Convert pandas values to Python-safe types."""
    if pd.isna(v):
        return None
    if isinstance(v, pd.Timestamp):
        return v.isoformat()
    return v

def import_excel(filename, table_name, column_map=None, extra_cols=None):
    """Import Excel file into a DB table. column_map renames Excel cols to DB cols."""
    filepath = os.path.join(SEED_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  SKIP {filename} — file not found")
        return 0

    try:
        df = pd.read_excel(filepath)
    except Exception as e:
        print(f"  ERROR reading {filename}: {e}")
        return 0

    if len(df) == 0:
        print(f"  SKIP {filename} — empty")
        return 0

    # Get DB table columns
    insp = inspect(engine)
    try:
        db_cols = {c['name'] for c in insp.get_columns(table_name)}
    except:
        print(f"  SKIP {filename} — table '{table_name}' not found")
        return 0

    # Rename columns if mapping provided
    if column_map:
        df = df.rename(columns=column_map)

    # Add extra columns
    if extra_cols:
        for k, v in extra_cols.items():
            df[k] = v

    # Add plant_id if table has it
    if 'plant_id' in db_cols:
        df['plant_id'] = PLANT_ID

    # Filter to only columns that exist in the DB table
    valid_cols = [c for c in df.columns if c in db_cols]
    if not valid_cols:
        print(f"  SKIP {filename} — no matching columns for {table_name}")
        print(f"    Excel cols: {list(df.columns[:10])}")
        print(f"    DB cols: {list(db_cols)[:10]}")
        return 0

    df = df[valid_cols]

    # Insert rows
    count = 0
    for _, row in df.iterrows():
        data = {c: safe_val(row[c]) for c in valid_cols if safe_val(row[c]) is not None}
        if not data:
            continue

        # Add primary key if needed
        pk_cols = {'node_id', 'assessment_id', 'mode_id', 'point_id', 'package_id',
                   'wo_id', 'worker_id', 'item_id', 'capture_id', 'center_id',
                   'plan_id', 'task_id', 'bom_id', 'event_id', 'permit_id',
                   'request_id', 'log_id', 'record_id', 'reading_id', 'profile_id',
                   'route_id', 'doc_id', 'class_id', 'assign_id', 'config_id',
                   'org_id', 'backlog_id', 'notif_id', 'movement_id', 'cost_id',
                   'reliability_id', 'schedule_id', 'operation_id', 'detail_id',
                   'program_id', 'resource_id', 'reservation_id', 'snapshot_id',
                   'checklist_id', 'entry_id', 'budget_id'}
        for pk in pk_cols:
            if pk in db_cols and pk not in data:
                data[pk] = str(uuid.uuid4())

        cols = ', '.join(data.keys())
        placeholders = ', '.join(f':{k}' for k in data.keys())
        try:
            db.execute(text(f'INSERT INTO {table_name} ({cols}) VALUES ({placeholders})'), data)
            count += 1
        except Exception as e:
            db.rollback()
            if count == 0:
                print(f"    First row error in {table_name}: {str(e)[:120]}")
            continue

    if count > 0:
        db.commit()
    print(f"  {filename} → {table_name}: {count}/{len(df)} rows")
    return count


print("=" * 60)
print(f"IMPORTING SEED DATA FOR {PLANT_ID}")
print("=" * 60)

# ═══ 02: Criticality Assessments ═══
import_excel('02_criticality_assessment.xlsx', 'criticality_assessments', {
    'sap_func_loc': 'node_id',
    'abckz': 'overall_class',
    'abckz_desc': 'notes',
})

# ═══ 03: Failure Modes ═══
import_excel('03_failure_modes.xlsx', 'failure_modes', {
    'catalog_code': 'code',
    'catalog_text': 'description',
    'catalog_type': 'category',
})

# ═══ 04: Measurement Points ═══
import_excel('04_measurement_points.xlsx', 'measuring_points', {
    'sap_func_loc_short': 'equipment_tag',
    'point_desc': 'description',
    'meas_type': 'measurement_type',
    'unit': 'unit',
    'lower_limit': 'lower_limit',
    'upper_limit': 'upper_limit',
})

# ═══ 05: Work Packages ═══
import_excel('05_work_packages.xlsx', 'work_packages', {
    'sap_func_loc_short': 'equipment_tag',
    'package_name': 'name',
    'package_desc': 'description',
    'frequency_days': 'frequency_days',
    'estimated_hours': 'estimated_hours',
})

# ═══ 06: Work Order History ═══
import_excel('06_work_order_history.xlsx', 'work_orders', {
    'aufnr': 'wo_number',
    'auart': 'wo_type',
    'ktext': 'description',
    'sap_func_loc_short': 'equipment_tag',
    'priokx': 'priority',
    'stat': 'status',
    'erdat': 'created_date',
    'actual_hours': 'actual_hours',
})

# ═══ 07: Spare Parts Inventory ═══
import_excel('07_spare_parts_inventory.xlsx', 'inventory_items', {
    'matnr': 'material_number',
    'maktx': 'description',
    'menge': 'quantity',
    'meins': 'unit',
    'lgort': 'storage_location',
    'sap_func_loc_short': 'equipment_tag',
})

# ═══ 08: Shutdown Calendar ═══
import_excel('08_shutdown_calendar.xlsx', 'shutdown_calendar', {
    'shutdown_name': 'name',
    'start_date': 'start_date',
    'end_date': 'end_date',
    'shutdown_type': 'type',
    'affected_area': 'area',
})

# ═══ 09: Workforce ═══
import_excel('09_workforce.xlsx', 'workforce', {
    'worker_name': 'name',
    'specialty': 'specialty',
    'shift': 'shift',
    'certification': 'certifications',
})

# ═══ 10: Field Captures ═══
import_excel('10_field_capture.xlsx', 'field_captures', {
    'sap_func_loc_short': 'equipment_tag',
    'capture_date': 'captured_at',
    'inspector': 'captured_by',
    'finding': 'description',
    'severity': 'severity',
})

# ═══ 11: Work Centers ═══
import_excel('11_work_centers.xlsx', 'work_centers', {
    'arbpl': 'code',
    'ktext': 'name',
    'werks': 'plant_code',
    'capacity_hours': 'capacity_hours',
})

# ═══ 23: Active Backlog ═══
import_excel('23_active_backlog.xlsx', 'backlog_items', {
    'aufnr': 'wo_number',
    'ktext': 'description',
    'sap_func_loc_short': 'equipment_tag',
    'priokx': 'priority',
    'erdat': 'created_date',
    'age_days': 'age_days',
})

# ═══ 24: Notifications ═══
import_excel('24_notifications.xlsx', 'notifications', {
    'qmnum': 'notification_number',
    'qmart': 'type',
    'qmtxt': 'description',
    'sap_func_loc_short': 'equipment_tag',
    'priokx': 'priority',
    'erdat': 'created_at',
})

# ═══ 28: Equipment BOM ═══
import_excel('28_equipment_bom.xlsx', 'bom_items', {
    'sap_func_loc_short': 'equipment_tag',
    'matnr': 'material_number',
    'maktx': 'description',
    'menge': 'quantity',
    'meins': 'unit',
})

# ═══ 29: Cost History ═══
import_excel('29_cost_history.xlsx', 'cost_centers', {
    'sap_func_loc_short': 'equipment_tag',
    'kostl': 'cost_center',
    'total_cost': 'amount',
    'period': 'period',
})

# ═══ 30: Reliability Data ═══
# Skip — needs custom model

# ═══ 34: Permits to Work ═══
import_excel('34_permits_to_work.xlsx', 'permits_to_work', {
    'permit_number': 'permit_number',
    'permit_type': 'type',
    'description': 'description',
    'status': 'status',
    'valid_from': 'valid_from',
    'valid_to': 'valid_to',
})

# ═══ 39: Execution Checklists ═══
import_excel('39_execution_checklists.xlsx', 'execution_checklists', {
    'checklist_name': 'name',
    'wo_type': 'wo_type',
    'items': 'items',
})

print("\n" + "=" * 60)
print("IMPORT COMPLETE")

# Final stats
result = db.execute(text("""
    SELECT 'hierarchy_nodes' as t, count(*) FROM hierarchy_nodes WHERE plant_id = :p
    UNION ALL SELECT 'workforce', count(*) FROM workforce WHERE plant_id = :p
    UNION ALL SELECT 'managed_work_orders', count(*) FROM managed_work_orders WHERE plant_id = :p
"""), {'p': PLANT_ID}).fetchall()
for r in result:
    print(f"  {r[0]}: {r[1]}")

db.close()
print("Done!")
