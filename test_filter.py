import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

r = db.execute(text("SELECT count(*) FROM work_requests WHERE ai_classification LIKE :p"), {'p': '%GOLDFIELDS-SN%'}).scalar()
print(f'WRs with GOLDFIELDS-SN in ai_classification: {r}')

# Test the service filter
try:
    from api.services import work_request_service
    wrs = work_request_service.list_work_requests(db, plant_id='GOLDFIELDS-SN')
    print(f'Service returns: {len(wrs)} WRs')
except Exception as e:
    print(f'Service error: {e}')

# Check ai_classification format
r2 = db.execute(text("SELECT ai_classification FROM work_requests WHERE ai_classification LIKE :p LIMIT 1"), {'p': '%GOLDFIELDS%'}).fetchone()
if r2:
    print(f'Sample ai_classification: {str(r2[0])[:200]}')

db.close()
