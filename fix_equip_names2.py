"""Add equipment_name to ai_classification for imported WRs."""
import sys, json
sys.path.insert(0, '/app')
from api.database.connection import SessionLocal
from sqlalchemy import text
db = SessionLocal()

# Build lookup
nodes = db.execute(text("SELECT tag, name FROM hierarchy_nodes WHERE tag IS NOT NULL")).fetchall()
lookup = {str(r[0]): r[1] for r in nodes if r[0] and r[1]}
nodes2 = db.execute(text("SELECT node_id, name FROM hierarchy_nodes")).fetchall()
for r in nodes2:
    if str(r[0]) not in lookup and r[1]:
        lookup[str(r[0])] = r[1]

# Update ai_classification with equipment_name
wrs = db.execute(text("SELECT request_id, equipment_tag, ai_classification FROM work_requests")).fetchall()
updated = 0
for wr in wrs:
    tag = str(wr[1] or '')
    ai = wr[2]
    if not ai:
        continue
    try:
        d = json.loads(ai) if isinstance(ai, str) else ai
        if isinstance(d, dict) and not d.get('equipment_name') and tag in lookup:
            d['equipment_name'] = lookup[tag]
            db.execute(text("UPDATE work_requests SET ai_classification = :ai WHERE request_id = :id"),
                      {'ai': json.dumps(d), 'id': wr[0]})
            updated += 1
    except:
        pass

db.commit()
print(f"Updated {updated} ai_classification with equipment_name")

# Also update problem_description to include the description text (not just tag)
wrs2 = db.execute(text("SELECT request_id, equipment_tag, problem_description FROM work_requests WHERE problem_description IS NOT NULL")).fetchall()
fixed_desc = 0
for wr in wrs2:
    pd = wr[2]
    tag = str(wr[1] or '')
    if not pd:
        continue
    try:
        d = json.loads(pd) if isinstance(pd, str) else pd
        if isinstance(d, dict):
            # If original_text is just "Notification" or empty, use equipment name
            ot = d.get('original_text', '')
            if ot in ('Notification', '', 'None') and tag in lookup:
                d['original_text'] = f"{lookup[tag]} - {tag}"
                d['enhanced_text'] = d.get('enhanced_text') or d['original_text']
                db.execute(text("UPDATE work_requests SET problem_description = :pd WHERE request_id = :id"),
                          {'pd': json.dumps(d), 'id': wr[0]})
                fixed_desc += 1
    except:
        pass

db.commit()
print(f"Fixed {fixed_desc} problem descriptions")
db.close()
