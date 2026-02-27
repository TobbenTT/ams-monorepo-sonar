"""MCP tool wrappers for RCMDecisionEngine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.rcm_decision_engine import RCMDecisionEngine, RCMDecisionInput


@tool(
    "rcm_decide",
    "Run the RCM decision tree to determine maintenance strategy (CBM/FT/FFI/RTF/REDESIGN). Input: JSON with hidden, safety, environmental, operational, cause fields.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def rcm_decide(input_json: str) -> str:
    data = json.loads(input_json)
    input_data = RCMDecisionInput(**data)
    result = RCMDecisionEngine.decide(input_data)
    from dataclasses import asdict
    return json.dumps(asdict(result), default=str)


@tool(
    "validate_frequency_unit",
    "Validate that a frequency unit is appropriate for a given cause type. Returns list of warnings.",
    {"type": "object", "properties": {"cause": {"type": "string"}, "frequency_unit": {"type": "string"}}, "required": ["cause", "frequency_unit"]},
)
def validate_frequency_unit(cause: str, frequency_unit: str) -> str:
    from tools.models.schemas import Cause, FrequencyUnit
    cause_enum = Cause(cause)
    freq_enum = FrequencyUnit(frequency_unit)
    warnings = RCMDecisionEngine.validate_frequency_unit(cause_enum, freq_enum)
    return json.dumps({"warnings": warnings, "valid": len(warnings) == 0})
