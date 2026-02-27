"""MCP tool wrappers for EquipmentResolver."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.equipment_resolver import EquipmentResolver


@tool(
    "resolve_equipment",
    "Resolve equipment from free-text input using fuzzy matching against a registry. Returns matched equipment or alternatives.",
    {"type": "object", "properties": {"input_text": {"type": "string"}, "registry": {"type": "string"}}, "required": ["input_text", "registry"]},
)
def resolve_equipment(input_text: str, registry: str) -> str:
    registry_list = json.loads(registry)
    resolver = EquipmentResolver(registry_list)
    result = resolver.resolve(input_text)
    if result is None:
        return json.dumps({"matched": False, "result": None})
    from dataclasses import asdict
    return json.dumps({"matched": True, "result": asdict(result)}, default=str)
