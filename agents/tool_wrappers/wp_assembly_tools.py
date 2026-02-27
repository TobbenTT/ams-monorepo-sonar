"""MCP tool wrappers for Work Package Assembly Engine (Phase 7 — G5)."""

import json
from agents.tool_wrappers.registry import tool
from tools.engines.work_package_assembly_engine import WorkPackageAssemblyEngine
from tools.models.schemas import AssembledWorkPackage


@tool(
    "assemble_work_package",
    "Assemble a work package with 7 mandatory elements and track readiness. Input: {package_id, name, equipment_tag, elements: [{element_type, status, reference, expires_at, notes}], assembled_by}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def assemble_work_package(input_json: str) -> str:
    data = json.loads(input_json)
    result = WorkPackageAssemblyEngine.assemble_work_package(
        package_id=data["package_id"],
        name=data.get("name", ""),
        equipment_tag=data.get("equipment_tag", ""),
        element_data=data.get("elements", []),
        assembled_by=data.get("assembled_by", ""),
    )
    return json.dumps(result.model_dump(), default=str)


@tool(
    "check_wp_element_readiness",
    "Check element readiness issues for an assembled work package. Returns list of issue strings.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def check_wp_element_readiness(input_json: str) -> str:
    data = json.loads(input_json)
    package = AssembledWorkPackage(**data)
    issues = WorkPackageAssemblyEngine.check_element_readiness(package)
    return json.dumps({"issues": issues, "total_issues": len(issues)})


@tool(
    "generate_wp_compliance_report",
    "Generate compliance report across multiple assembled work packages. Input: {plant_id, packages: [{package_id, ...}]}",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def generate_wp_compliance_report(input_json: str) -> str:
    data = json.loads(input_json)
    packages = [AssembledWorkPackage(**p) for p in data.get("packages", [])]
    report = WorkPackageAssemblyEngine.generate_compliance_report(
        packages, plant_id=data.get("plant_id", ""),
    )
    return json.dumps(report.model_dump(), default=str)
