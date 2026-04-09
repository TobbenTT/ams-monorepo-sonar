"""Fix empty string JSON fields in work_requests that crash SQLAlchemy."""
import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# JSON columns in work_requests
json_cols = ['ai_classification', 'spare_parts', 'image_analysis', 'validation', 'documents', 'support_equipment']

for col in json_cols:
    try:
        # Fix empty strings to null
        r = db.execute(text(f"UPDATE work_requests SET \"{col}\" = NULL WHERE \"{col}\" = ''"))
        if r.rowcount:
            print(f"  Fixed {col}: {r.rowcount} empty strings → NULL")
        # Fix non-JSON strings
        r2 = db.execute(text(f"UPDATE work_requests SET \"{col}\" = NULL WHERE \"{col}\" NOT LIKE '{{%' AND \"{col}\" NOT LIKE '[%' AND \"{col}\" IS NOT NULL AND \"{col}\" != 'null'"))
        if r2.rowcount:
            print(f"  Fixed {col}: {r2.rowcount} invalid JSON → NULL")
    except Exception as e:
        print(f"  Error fixing {col}: {e}")

db.commit()

# Verify
from api.database.models import WorkRequestModel
try:
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.ai_classification.like("%GOLDFIELDS-SN%")
    ).limit(3).all()
    print(f"\nQuery works! Got {len(wrs)} WRs")
    for wr in wrs:
        print(f"  {wr.request_id}: {wr.equipment_tag}")
except Exception as e:
    print(f"\nStill failing: {e}")

# Test full service
try:
    from api.services.work_request_service import list_work_requests
    result = list_work_requests(db, plant_id='GOLDFIELDS-SN', limit=5)
    print(f"Service returns {len(result)} WRs")
except Exception as e:
    print(f"Service still fails: {e}")

db.close()
print("Done")
