import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Find problematic WRs
r = db.execute(text("SELECT count(*) FROM work_requests WHERE ai_classification IS NULL OR ai_classification = ''")).scalar()
print(f"WRs with empty ai_classification: {r}")

# The LIKE filter works but the service crashes during serialization
# Let's test the actual service call with error handling
from api.database.models import WorkRequestModel
wrs = db.query(WorkRequestModel).filter(
    WorkRequestModel.ai_classification.like("%GOLDFIELDS-SN%")
).limit(5).all()
print(f"Query returns {len(wrs)} WRs")

# Check what crashes - it's probably _to_dict
from api.services.work_request_service import _to_dict
for wr in wrs[:3]:
    try:
        d = _to_dict(wr)
        print(f"  OK: {d['request_id']}")
    except Exception as e:
        print(f"  FAIL: {wr.request_id} - {e}")

# Now test the list function directly
try:
    from api.services.work_request_service import list_work_requests
    result = list_work_requests(db, plant_id='GOLDFIELDS-SN', limit=5)
    print(f"list_work_requests returned {len(result)} items")
except Exception as e:
    print(f"list_work_requests failed: {e}")

# Check if it's the JSON parse in the route handler
try:
    import json
    for wr in wrs[:3]:
        ai = wr.ai_classification
        if ai:
            parsed = json.loads(ai) if isinstance(ai, str) else ai
            print(f"  Parsed OK: {wr.request_id}")
except Exception as e:
    print(f"JSON parse error: {e}")

db.close()
