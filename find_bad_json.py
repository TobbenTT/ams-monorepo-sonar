import sys, json
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Get ALL rows raw and check each JSON field
rows = db.execute(text("SELECT request_id, ai_classification, spare_parts, image_analysis, validation, documents, support_equipment FROM work_requests")).fetchall()
print(f"Total WRs: {len(rows)}")

json_cols = ['ai_classification', 'spare_parts', 'image_analysis', 'validation', 'documents', 'support_equipment']
bad = []
for row in rows:
    for i, col in enumerate(json_cols, 1):
        val = row[i]
        if val is not None:
            try:
                if isinstance(val, str):
                    json.loads(val)
            except:
                bad.append((row[0], col, repr(val)[:80]))

print(f"Bad JSON fields: {len(bad)}")
for b in bad[:10]:
    print(f"  {b[0]} | {b[1]} | {b[2]}")

# Fix them
if bad:
    for req_id, col, _ in bad:
        db.execute(text(f'UPDATE work_requests SET "{col}" = NULL WHERE request_id = :id'), {'id': req_id})
    db.commit()
    print(f"Fixed {len(bad)} bad fields")

# Test again
from api.database.models import WorkRequestModel
try:
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.ai_classification.like("%GOLDFIELDS-SN%")
    ).limit(3).all()
    print(f"SUCCESS: {len(wrs)} WRs loaded")
except Exception as e:
    print(f"STILL FAILING: {e}")

db.close()
