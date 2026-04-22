"""Patch WR fields para demo — pobla los campos que el UI lee:
- problem_description.original_text / structured_description / failure_mode_detected / technical_location_code / wo_title
- ai_classification.wo_title / production_impact / estimated_duration_hours / required_specialties / priority_suggested
- spare_parts[i].name (además de code)
"""
from api.database.connection import SessionLocal
from api.database.models import WorkRequestModel

db = SessionLocal()
wrs = db.query(WorkRequestModel).all()
updated = 0
for wr in wrs:
    pd = wr.problem_description or {}
    ai = wr.ai_classification or {}

    # problem_description — populate UI-expected keys
    whatHappens = pd.get("whatHappens") or "Falla reportada"
    whenHappens = pd.get("whenHappens") or "Durante operación"
    circunstancias = wr.circumstances or ""
    full_text = f"{whatHappens}. {whenHappens}. {circunstancias}".strip()

    pd["original_text"] = full_text
    pd["structured_description"] = whatHappens
    pd["technical_location"] = wr.equipment_tag
    pd["technical_location_code"] = wr.equipment_tag
    pd["failure_mode_detected"] = whatHappens[:50]
    pd["failure_mode_code"] = whatHappens.split(" ")[0][:10].upper()
    pd["wo_title"] = f"{wr.equipment_tag} — {whatHappens[:40]}"

    # ai_classification — UI reads
    ai["wo_title"] = pd["wo_title"]
    ai["production_impact"] = "HIGH" if wr.priority_code in ("P1",) else "MEDIUM" if wr.priority_code == "P2" else "LOW"
    ai["estimated_duration_hours"] = ai.get("estimated_hours", 8)
    ai["required_specialties"] = [ai.get("suggested_specialty", "Mecánico")]
    ai["priority_suggested"] = wr.priority_code
    ai["equipment_name"] = wr.equipment_tag

    # spare_parts — add `name` field to each
    sp = wr.spare_parts or []
    new_sp = []
    for p in sp:
        if isinstance(p, str):
            new_sp.append({"code": p, "name": p, "qty": 1})
        elif isinstance(p, dict):
            p["name"] = p.get("description") or p.get("name") or p.get("code", "")
            p["qty"] = p.get("qty") or p.get("quantity") or 1
            new_sp.append(p)
    wr.problem_description = pd
    wr.ai_classification = ai
    wr.spare_parts = new_sp
    # Mark modified for SQLAlchemy JSON
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(wr, "problem_description")
    flag_modified(wr, "ai_classification")
    flag_modified(wr, "spare_parts")
    updated += 1

db.commit()
db.close()
print(f"✅ Patched {updated} WRs con campos completos")
