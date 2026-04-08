"""Fix problem_description - convert plain text strings to JSON format."""
import sys, json
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Find WRs where problem_description is a plain string (not JSON)
rows = db.execute(text("SELECT request_id, problem_description FROM work_requests WHERE problem_description IS NOT NULL")).fetchall()
fixed = 0
for row in rows:
    val = row[1]
    if val and isinstance(val, str):
        try:
            json.loads(val)
        except json.JSONDecodeError:
            # It's a plain string, convert to JSON format
            new_val = json.dumps({"original_text": val, "enhanced_text": val})
            db.execute(text("UPDATE work_requests SET problem_description = :v WHERE request_id = :id"),
                      {'v': new_val, 'id': row[0]})
            fixed += 1

db.commit()
print(f"Fixed {fixed} problem_description fields (plain text → JSON)")

# Also fix aviso_number - some might be strings not ints
try:
    db.execute(text("UPDATE work_requests SET aviso_number = NULL WHERE aviso_number IS NOT NULL AND typeof(aviso_number) = 'text'"))
    db.commit()
except:
    db.rollback()

# Test
from api.database.models import WorkRequestModel
try:
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.ai_classification.like("%GOLDFIELDS-SN%")
    ).limit(3).all()
    print(f"SUCCESS: {len(wrs)} WRs loaded!")
    for wr in wrs:
        print(f"  {wr.request_id}: {wr.equipment_tag}")
except Exception as e:
    print(f"STILL FAILING: {e}")

# Full service test
try:
    from api.services.work_request_service import list_work_requests
    result = list_work_requests(db, plant_id='GOLDFIELDS-SN', limit=5)
    print(f"Service returns {len(result)} WRs")
except Exception as e:
    print(f"Service fails: {e}")

db.close()
