"""MCP tool wrappers for PriorityEngine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.priority_engine import PriorityEngine, PriorityInput


@tool(
    "calculate_priority",
    "Calculate maintenance task priority based on risk class, failure pattern, and consequence. Returns priority level and score.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def calculate_priority(input_json: str) -> str:
    data = json.loads(input_json)
    input_data = PriorityInput(**data)
    result = PriorityEngine.calculate_priority(input_data)
    from dataclasses import asdict
    return json.dumps(asdict(result), default=str)


@tool(
    "validate_priority_override",
    "Validate a human priority override against AI-calculated priority. Returns comparison and warnings.",
    {"type": "object", "properties": {"ai_priority": {"type": "string"}, "human_priority": {"type": "string"}}, "required": ["ai_priority", "human_priority"]},
)
def validate_priority_override(ai_priority: str, human_priority: str) -> str:
    result = PriorityEngine.validate_priority_override(ai_priority, human_priority)
    return json.dumps(result)
