path = "/root/ASSET-MANAGEMENT-SOFTWARE/api/database/models.py"
with open(path, "r") as f:
    c = f.read()

# Remove the duplicated lines
old = """    __table_args__ = (
        Index("ix_ai_feedback_equipment", "equipment_tag"),
        Index("ix_ai_feedback_field", "field_name"),
    )

        Index("ix_ai_feedback_equipment", "equipment_tag"),
        Index("ix_ai_feedback_field", "field_name"),
    )"""

new = """    __table_args__ = (
        Index("ix_ai_feedback_equipment", "equipment_tag"),
        Index("ix_ai_feedback_field", "field_name"),
    )"""

c = c.replace(old, new)

with open(path, "w") as f:
    f.write(c)
print("Fixed")
