"""Fix: populate equipment names in work_requests from hierarchy_nodes."""
import sys
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Build lookup: equipment_tag -> name from hierarchy_nodes
nodes = db.execute(text("SELECT tag, name FROM hierarchy_nodes WHERE tag IS NOT NULL")).fetchall()
lookup = {str(r[0]): r[1] for r in nodes if r[0] and r[1]}
print(f"Lookup: {len(lookup)} equipment names")

# Also add node_id -> name for those matched by node_id
nodes2 = db.execute(text("SELECT node_id, name FROM hierarchy_nodes WHERE name IS NOT NULL")).fetchall()
for r in nodes2:
    if r[0] not in lookup:
        lookup[str(r[0])] = r[1]
print(f"Lookup total: {len(lookup)} entries")

# The WR model doesn't have equipment_name column - it's derived from ai_classification or computed
# Check if problem_description JSON has "original_text" we can use as display name
import json
wrs = db.execute(text("SELECT request_id, equipment_tag, problem_description FROM work_requests")).fetchall()

updated = 0
for wr in wrs:
    tag = str(wr[1] or '')
    pd = wr[2]

    # If problem_description is JSON and has original_text, check if it already has equipment_name
    if pd and isinstance(pd, str):
        try:
            d = json.loads(pd)
            if isinstance(d, dict) and not d.get('equipment_name') and tag in lookup:
                d['equipment_name'] = lookup[tag]
                db.execute(text("UPDATE work_requests SET problem_description = :pd WHERE request_id = :id"),
                          {'pd': json.dumps(d), 'id': wr[0]})
                updated += 1
        except:
            pass

db.commit()
print(f"Updated {updated} WRs with equipment names in problem_description")

# Also check: where does the frontend get equipment_name from?
# It uses wr.equipment_name which comes from the _to_dict serializer
# Let's check if there's a separate field or if it's from ai_classification
sample = db.execute(text("SELECT ai_classification FROM work_requests WHERE ai_classification LIKE '%GOLDFIELDS%' LIMIT 1")).fetchone()
if sample:
    d = json.loads(sample[0]) if isinstance(sample[0], str) else sample[0]
    print(f"Sample ai_classification keys: {list(d.keys()) if isinstance(d, dict) else 'not dict'}")

db.close()
print("Done")
