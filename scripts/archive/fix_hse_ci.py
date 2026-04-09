"""Insert HSE and Continuous Improvement data for GOLDFIELDS-SN."""
import sys, uuid
from datetime import datetime, timedelta
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text, inspect

db = SessionLocal()
PLANT = 'GOLDFIELDS-SN'
now = datetime.utcnow()

insp = inspect(db.bind)
all_tables = insp.get_table_names()

# Check what tables feed HSE and CI tabs
for t in ['improvement_actions', 'rca_analyses', 'permits_to_work', 'variance_alerts']:
    if t in all_tables:
        cols = [c['name'] for c in insp.get_columns(t)]
        has_plant = 'plant_id' in cols
        try:
            count = db.execute(text(f"SELECT count(*) FROM {t}" + (f" WHERE plant_id = :p" if has_plant else "")),
                              {'p': PLANT} if has_plant else {}).scalar()
        except:
            count = '?'
        print(f"{t}: {count} rows (has plant_id: {has_plant})")
        print(f"  cols: {cols[:10]}")

# Insert improvement actions
print("\n=== Improvement Actions ===")
ia_cols = [c['name'] for c in insp.get_columns('improvement_actions')]
print(f"Columns: {ia_cols}")

actions = [
    {'title': 'Implement vibration monitoring on SAG mill bearings', 'category': 'PREDICTIVE', 'priority': 'HIGH', 'status': 'IN_PROGRESS'},
    {'title': 'Replace corroded piping in acid plant section 3', 'category': 'CORRECTIVE', 'priority': 'CRITICAL', 'status': 'IN_PROGRESS'},
    {'title': 'Install thermal cameras on electrical panels', 'category': 'PREDICTIVE', 'priority': 'MEDIUM', 'status': 'PLANNED'},
    {'title': 'Update LOTO procedures for crusher maintenance', 'category': 'SAFETY', 'priority': 'HIGH', 'status': 'COMPLETED'},
    {'title': 'Standardize PM checklists for conveyor systems', 'category': 'PREVENTIVE', 'priority': 'MEDIUM', 'status': 'IN_PROGRESS'},
    {'title': 'Oil analysis program for hydraulic systems', 'category': 'PREDICTIVE', 'priority': 'LOW', 'status': 'PLANNED'},
    {'title': 'Root cause training for maintenance technicians', 'category': 'TRAINING', 'priority': 'MEDIUM', 'status': 'COMPLETED'},
    {'title': 'Reduce unplanned downtime on grinding circuit', 'category': 'RELIABILITY', 'priority': 'CRITICAL', 'status': 'IN_PROGRESS'},
]

ia_count = 0
for a in actions:
    data = {
        'action_id': str(uuid.uuid4()),
        'plant_id': PLANT,
        'title': a['title'],
        'description': a['title'],
        'category': a['category'],
        'priority': a['priority'],
        'status': a['status'],
        'created_at': (now - timedelta(days=ia_count*5)).isoformat(),
    }
    # Add optional fields if they exist
    if 'due_date' in ia_cols:
        data['due_date'] = (now + timedelta(days=30)).isoformat()
    if 'assigned_to' in ia_cols:
        data['assigned_to'] = 'Carlos Mendez'
    if 'source' in ia_cols:
        data['source'] = 'RCA'

    valid_data = {k: v for k, v in data.items() if k in ia_cols}
    if not valid_data:
        print(f"  No matching columns for improvement_actions")
        break

    cols_str = ', '.join(f'"{k}"' for k in valid_data.keys())
    vals_str = ', '.join(f':{k}' for k in valid_data.keys())
    try:
        db.execute(text(f'INSERT INTO improvement_actions ({cols_str}) VALUES ({vals_str})'), valid_data)
        ia_count += 1
    except Exception as e:
        db.rollback()
        if ia_count == 0:
            print(f"  Error: {str(e)[:150]}")
            # Try to find required NOT NULL columns
            nn = [c['name'] for c in insp.get_columns('improvement_actions') if not c.get('nullable', True)]
            print(f"  NOT NULL: {nn}")
        break

db.commit()
print(f"  Inserted {ia_count} improvement actions")

# For HSE - check if there's an incidents or safety table
for t in ['incidents', 'safety_incidents', 'hse_events', 'field_captures']:
    if t in all_tables:
        cols = [c['name'] for c in insp.get_columns(t)]
        print(f"\n{t} cols: {cols[:10]}")

db.close()
print("\nDone!")