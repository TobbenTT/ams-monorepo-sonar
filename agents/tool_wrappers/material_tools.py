"""MCP tool wrappers for MaterialMapper."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.material_mapper import MaterialMapper


@tool(
    "suggest_materials",
    "Suggest materials for a maintenance task based on component type, failure mechanism, and optional equipment BOM. Returns list of MaterialSuggestion.",
    {"type": "object", "properties": {"component_type": {"type": "string"}, "mechanism": {"type": "string"}, "equipment_id": {"type": "string"}, "bom_registry": {"type": "string"}}, "required": ["component_type", "mechanism"]},
)
def suggest_materials(component_type: str, mechanism: str, equipment_id: str = "", bom_registry: str = "{}") -> str:
    bom = json.loads(bom_registry) if bom_registry != "{}" else None
    mapper = MaterialMapper(bom)
    results = mapper.suggest_materials(component_type, mechanism, equipment_id or None)
    from dataclasses import asdict
    return json.dumps([asdict(r) for r in results], default=str)


@tool(
    "validate_task_materials",
    "Validate that materials assigned to a task are appropriate for its type (T-16 rule: REPLACE tasks MUST have materials).",
    {"type": "object", "properties": {"task_type": {"type": "string"}, "materials": {"type": "string"}}, "required": ["task_type", "materials"]},
)
def validate_task_materials(task_type: str, materials: str) -> str:
    material_list = json.loads(materials)
    errors = MaterialMapper.validate_task_materials(task_type, material_list)
    return json.dumps({"errors": errors, "valid": len(errors) == 0})
