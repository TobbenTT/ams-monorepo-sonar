"""MCP tool wrappers for StateMachine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.state_machine import StateMachine


@tool(
    "validate_state_transition",
    "Check if a state transition is valid for an entity type. Returns boolean.",
    {"type": "object", "properties": {"entity_type": {"type": "string"}, "current_state": {"type": "string"}, "target_state": {"type": "string"}}, "required": ["entity_type", "current_state", "target_state"]},
)
def validate_state_transition(entity_type: str, current_state: str, target_state: str) -> str:
    valid = StateMachine.validate_transition(entity_type, current_state, target_state)
    return json.dumps({"valid": valid, "entity_type": entity_type, "from": current_state, "to": target_state})


@tool(
    "get_valid_transitions",
    "Get all valid next states for an entity in a given state.",
    {"type": "object", "properties": {"entity_type": {"type": "string"}, "current_state": {"type": "string"}}, "required": ["entity_type", "current_state"]},
)
def get_valid_transitions(entity_type: str, current_state: str) -> str:
    transitions = StateMachine.get_valid_transitions(entity_type, current_state)
    return json.dumps({"entity_type": entity_type, "current_state": current_state, "valid_next_states": sorted(transitions)})


@tool(
    "get_all_entity_states",
    "Get all possible states for an entity type.",
    {"type": "object", "properties": {"entity_type": {"type": "string"}}, "required": ["entity_type"]},
)
def get_all_entity_states(entity_type: str) -> str:
    states = StateMachine.get_all_states(entity_type)
    return json.dumps({"entity_type": entity_type, "states": states})
