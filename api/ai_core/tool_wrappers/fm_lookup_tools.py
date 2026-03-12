"""MCP tool wrappers for Failure Mode lookup table (SRC-09, 72 valid combinations)."""

import json
from api.ai_core.tool_wrappers.compact_json import dumps as json_compact
from api.ai_core.tool_wrappers.registry import tool
from tools.models.schemas import Mechanism, Cause, VALID_FM_COMBINATIONS


@tool(
    "validate_fm_combination",
    "Validate a Mechanism+Cause combination against the authoritative 72-combo table (SRC-09). MANDATORY before creating any FailureMode.",
    {"type": "object", "properties": {"mechanism": {"type": "string"}, "cause": {"type": "string"}}, "required": ["mechanism", "cause"]},
)
def validate_fm_combination(mechanism: str, cause: str) -> str:
    try:
        mech = Mechanism(mechanism)
    except ValueError:
        return json_compact({"valid": False, "error": f"Invalid mechanism: {mechanism}", "valid_mechanisms": [m.value for m in Mechanism]})
    try:
        cause_enum = Cause(cause)
    except ValueError:
        return json_compact({"valid": False, "error": f"Invalid cause: {cause}", "valid_causes": [c.value for c in Cause]})

    is_valid = (mech, cause_enum) in VALID_FM_COMBINATIONS
    result = {"valid": is_valid, "mechanism": mechanism, "cause": cause}
    if not is_valid:
        valid_causes = get_valid_causes_for_mechanism(mechanism)
        result["valid_causes_for_mechanism"] = json.loads(valid_causes)["causes"]
    return json_compact(result)


@tool(
    "get_valid_fm_combinations",
    "Get all valid Cause values for a given Mechanism from the 72-combo table. Use this BEFORE creating failure modes.",
    {"type": "object", "properties": {"mechanism": {"type": "string"}}, "required": ["mechanism"]},
)
def get_valid_causes_for_mechanism(mechanism: str) -> str:
    try:
        mech = Mechanism(mechanism)
    except ValueError:
        return json_compact({"error": f"Invalid mechanism: {mechanism}", "valid_mechanisms": [m.value for m in Mechanism]})

    causes = [cause.value for mech_val, cause in VALID_FM_COMBINATIONS if mech_val == mech]
    return json_compact({"mechanism": mechanism, "causes": causes, "count": len(causes)})


@tool(
    "list_all_mechanisms",
    "List all 18 valid Mechanism values.",
    {"type": "object", "properties": {}},
)
def list_all_mechanisms() -> str:
    return json_compact({"mechanisms": [m.value for m in Mechanism], "count": len(Mechanism)})


@tool(
    "list_all_causes",
    "List all 44 valid Cause values.",
    {"type": "object", "properties": {}},
)
def list_all_causes() -> str:
    return json_compact({"causes": [c.value for c in Cause], "count": len(Cause)})
