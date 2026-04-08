import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()
r = db.execute(text("UPDATE notifications SET acknowledged = 1 WHERE plant_id = :p"), {'p': 'GOLDFIELDS-SN'})
print(f"Acknowledged {r.rowcount} notifications")
db.commit()
db.close()
