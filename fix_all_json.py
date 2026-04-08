import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

json_cols = ['ai_classification','spare_parts','image_analysis','validation','documents','support_equipment']

for col in json_cols:
    # Set to NULL if empty string
    r1 = db.execute(text(f'UPDATE work_requests SET "{col}" = NULL WHERE "{col}" = :e'), {'e': ''})
    # Set to NULL if just whitespace
    r2 = db.execute(text(f'UPDATE work_requests SET "{col}" = NULL WHERE "{col}" IS NOT NULL AND length("{col}") < 2'))
    total = r1.rowcount + r2.rowcount
    if total:
        print(f"  {col}: fixed {total}")

db.commit()

# Now test
from api.database.models import WorkRequestModel
try:
    wrs = db.query(WorkRequestModel).filter(
        WorkRequestModel.ai_classification.like("%GOLDFIELDS-SN%")
    ).limit(3).all()
    print(f"Query works: {len(wrs)} WRs")
except Exception as e:
    print(f"Still failing: {e}")
    # Find the exact bad row
    rows = db.execute(text("SELECT request_id, length(ai_classification), length(spare_parts), length(image_analysis), length(validation) FROM work_requests")).fetchall()
    for r in rows:
        for i, col in enumerate(['ai_classification','spare_parts','image_analysis','validation'], 1):
            if r[i] is not None and r[i] == 0:
                print(f"  BAD: {r[0]} has {col} with length 0")

db.close()
