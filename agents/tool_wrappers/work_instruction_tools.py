"""MCP tool wrappers for WorkInstructionGenerator."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.work_instruction_generator import WorkInstructionGenerator


@tool(
    "generate_work_instruction",
    "Generate a work instruction document from work package details. Input: JSON with wp_name, wp_code, equipment_name, equipment_tag, frequency, constraint, tasks list.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_work_instruction(input_json: str) -> str:
    data = json.loads(input_json)
    result = WorkInstructionGenerator.generate(
        wp_name=data["wp_name"],
        wp_code=data["wp_code"],
        equipment_name=data["equipment_name"],
        equipment_tag=data["equipment_tag"],
        frequency=data["frequency"],
        constraint=data["constraint"],
        tasks=data["tasks"],
        job_preparation=data.get("job_preparation", ""),
        post_shutdown=data.get("post_shutdown", ""),
    )
    from dataclasses import asdict
    return json.dumps(asdict(result), default=str)


@tool(
    "validate_work_instruction",
    "Validate a work instruction for completeness and correctness.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def validate_work_instruction(input_json: str) -> str:
    from tools.engines.work_instruction_generator import WorkInstruction
    wi = WorkInstruction(**json.loads(input_json))
    errors = WorkInstructionGenerator.validate_work_instruction(wi)
    return json.dumps({"errors": errors, "valid": len(errors) == 0})
