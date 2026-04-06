"""Extract DB schema to generate ERD diagram."""
import json, sys
sys.path.insert(0, '/app')
from sqlalchemy import inspect
from api.database.connection import engine

insp = inspect(engine)
tables = sorted(insp.get_table_names())

schema = {}
relationships = []

for t in tables:
    cols = insp.get_columns(t)
    fks = insp.get_foreign_keys(t)
    pk = insp.get_pk_constraint(t)

    table_info = {
        'pk': pk['constrained_columns'],
        'columns': [],
        'fks': []
    }
    for c in cols:
        table_info['columns'].append({
            'name': c['name'],
            'type': str(c['type']),
            'nullable': c.get('nullable', True),
        })
    for fk in fks:
        table_info['fks'].append({
            'from': fk['constrained_columns'],
            'to_table': fk['referred_table'],
            'to_cols': fk['referred_columns'],
        })
        relationships.append({
            'from_table': t,
            'from_col': fk['constrained_columns'][0] if fk['constrained_columns'] else '',
            'to_table': fk['referred_table'],
            'to_col': fk['referred_columns'][0] if fk['referred_columns'] else '',
        })
    schema[t] = table_info

# Also map Excel files to tables
excel_mapping = {
    '01_equipment_hierarchy.xlsx': 'hierarchy_nodes',
    '02_criticality_assessment.xlsx': 'criticality_assessments',
    '03_failure_modes.xlsx': 'failure_modes',
    '04_measurement_points.xlsx': 'measuring_points',
    '05_work_packages.xlsx': 'work_packages',
    '06_work_order_history.xlsx': 'work_orders',
    '07_spare_parts_inventory.xlsx': 'inventory_items',
    '08_shutdown_calendar.xlsx': 'shutdown_calendar',
    '09_workforce.xlsx': 'workforce',
    '10_field_capture.xlsx': 'field_captures',
    '11_work_centers.xlsx': 'work_centers',
    '23_active_backlog.xlsx': 'backlog_items',
    '24_notifications.xlsx': 'notifications',
    '28_equipment_bom.xlsx': 'bom_items',
    '29_cost_history.xlsx': 'cost_centers',
    '34_permits_to_work.xlsx': 'permits_to_work',
    '39_execution_checklists.xlsx': 'execution_checklists',
}

# Get Excel headers
import os
try:
    import openpyxl
    excel_headers = {}
    seed_dir = '/app/seed_data'
    for fname in sorted(os.listdir(seed_dir)):
        if fname.endswith('.xlsx') and not fname.startswith('~'):
            try:
                wb = openpyxl.load_workbook(os.path.join(seed_dir, fname), read_only=True)
                ws = wb.active
                headers = [c.value for c in ws[1] if c.value]
                excel_headers[fname] = headers
                wb.close()
            except:
                pass
except:
    excel_headers = {}

result = {
    'tables': schema,
    'relationships': relationships,
    'excel_mapping': excel_mapping,
    'excel_headers': excel_headers,
    'table_count': len(tables),
    'relationship_count': len(relationships),
}

with open('/app/schema_output.json', 'w') as f:
    json.dump(result, f, indent=2, default=str)

print(f"Schema extracted: {len(tables)} tables, {len(relationships)} relationships")
print(f"Excel files: {len(excel_headers)}")
