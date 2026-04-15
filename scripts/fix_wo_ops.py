"""Fix OT-2026-00030: split single operation into 10 individual steps."""
from api.database.connection import SessionLocal
from api.database.models import ManagedWorkOrderModel
from sqlalchemy.orm.attributes import flag_modified
import re

db = SessionLocal()
wo = db.query(ManagedWorkOrderModel).filter(ManagedWorkOrderModel.wo_number == "OT-2026-00030").first()
if not wo:
    print("WO not found")
    exit()

old_ops = wo.operations or []
text = old_ops[0].get("description", "") if old_ops else ""

# Split numbered steps
steps = re.split(r"\d+\.\s+", text)
steps = [s.strip().rstrip(".") for s in steps if s.strip()]

# Assign specialties and hours per step
step_meta = [
    {"specialty": "Mechanical", "qty": 2, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 1, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 1, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 2, "hours": 1.0},
    {"specialty": "Mechanical", "qty": 2, "hours": 1.5},
    {"specialty": "Mechanical", "qty": 2, "hours": 1.5},
    {"specialty": "Mechanical", "qty": 2, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 1, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 1, "hours": 0.5},
    {"specialty": "Mechanical", "qty": 1, "hours": 0.5},
]

new_ops = []
for i, step in enumerate(steps[:10]):
    meta = step_meta[i] if i < len(step_meta) else {"specialty": "Mechanical", "qty": 1, "hours": 1}
    new_ops.append({
        "type": "INT",
        "description": step,
        "specialty": meta["specialty"],
        "quantity": meta["qty"],
        "hours": meta["hours"],
    })

# Keep inspection op if exists
if len(old_ops) > 1:
    new_ops.append(old_ops[1])

wo.operations = new_ops
total_hh = sum(op.get("quantity", 1) * op.get("hours", 0) for op in new_ops)
wo.estimated_hours = total_hh
flag_modified(wo, "operations")
db.commit()

print("Split into %d operations, total HH: %.1f" % (len(new_ops), total_hh))
for i, op in enumerate(new_ops):
    hh = op.get("quantity", 1) * op.get("hours", 0)
    spec = op.get("specialty", "")
    qty = op.get("quantity", 1)
    hrs = op.get("hours", 0)
    desc = op.get("description", "")[:50]
    print("  #%d: %s x%d %.1fh = %.1fHH | %s" % (i+1, spec, qty, hrs, hh, desc))

db.close()
