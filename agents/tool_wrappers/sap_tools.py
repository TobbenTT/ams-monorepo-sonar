"""MCP tool wrappers for SAPExportEngine."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.sap_export_engine import SAPExportEngine
from tools.models.schemas import WorkPackage, MaintenanceTask


@tool(
    "generate_sap_upload",
    "Generate a complete SAP upload package (Maintenance Item + Task List + Work Plan) from work packages. Input: JSON with work_packages list, plant_code, optional plan_description and tasks.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_sap_upload(input_json: str) -> str:
    data = json.loads(input_json)
    wps = [WorkPackage(**wp) for wp in data["work_packages"]]
    tasks = None
    if "tasks" in data and data["tasks"]:
        tasks = {k: MaintenanceTask(**v) for k, v in data["tasks"].items()}
    result = SAPExportEngine.generate_upload_package(
        wps, data["plant_code"], data.get("plan_description", ""), tasks
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "validate_sap_cross_references",
    "Validate cross-references within a SAP upload package. Returns list of errors.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def validate_sap_cross_references(input_json: str) -> str:
    from tools.models.schemas import SAPUploadPackage
    package = SAPUploadPackage(**json.loads(input_json))
    errors = SAPExportEngine.validate_cross_references(package)
    return json.dumps({"errors": errors, "valid": len(errors) == 0})


@tool(
    "validate_sap_field_lengths",
    "Validate SAP field length constraints for upload package. Returns list of errors.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def validate_sap_field_lengths(input_json: str) -> str:
    from tools.models.schemas import SAPUploadPackage
    package = SAPUploadPackage(**json.loads(input_json))
    errors = SAPExportEngine.validate_sap_field_lengths(package)
    return json.dumps({"errors": errors, "valid": len(errors) == 0})
