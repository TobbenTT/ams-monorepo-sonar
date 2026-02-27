"""Unified MCP server for OCP Maintenance AI.

Registers all tool wrappers from the individual tool modules.
Import this module to load all tools into the TOOL_REGISTRY.

Usage:
    from agents.tool_wrappers.server import get_all_tools, call_tool
    tools = get_all_tools()
    result = call_tool("rcm_decide", {"input_json": "..."})
"""

# Import registry
from agents.tool_wrappers.registry import TOOL_REGISTRY, call_tool, list_tools

# Import all tool modules to trigger @tool decorator registration
import agents.tool_wrappers.criticality_tools  # noqa: F401
import agents.tool_wrappers.rcm_tools  # noqa: F401
import agents.tool_wrappers.sap_tools  # noqa: F401
import agents.tool_wrappers.priority_tools  # noqa: F401
import agents.tool_wrappers.backlog_tools  # noqa: F401
import agents.tool_wrappers.equipment_tools  # noqa: F401
import agents.tool_wrappers.material_tools  # noqa: F401
import agents.tool_wrappers.work_instruction_tools  # noqa: F401
import agents.tool_wrappers.state_machine_tools  # noqa: F401
import agents.tool_wrappers.validation_tools  # noqa: F401
import agents.tool_wrappers.fm_lookup_tools  # noqa: F401
import agents.tool_wrappers.health_tools  # noqa: F401
import agents.tool_wrappers.kpi_tools  # noqa: F401
import agents.tool_wrappers.weibull_tools  # noqa: F401
import agents.tool_wrappers.variance_tools  # noqa: F401
import agents.tool_wrappers.capa_tools  # noqa: F401
import agents.tool_wrappers.management_review_tools  # noqa: F401
import agents.tool_wrappers.rca_tools  # noqa: F401
import agents.tool_wrappers.planning_kpi_tools  # noqa: F401
import agents.tool_wrappers.scheduling_tools  # noqa: F401
import agents.tool_wrappers.reliability_tools  # noqa: F401
import agents.tool_wrappers.reporting_tools  # noqa: F401
import agents.tool_wrappers.notification_tools  # noqa: F401
import agents.tool_wrappers.wp_assembly_tools  # noqa: F401
import agents.tool_wrappers.execution_task_tools  # noqa: F401
import agents.tool_wrappers.fmeca_tools  # noqa: F401
import agents.tool_wrappers.hierarchy_builder_tools  # noqa: F401


def get_all_tools() -> list[dict]:
    """Return metadata for all registered tools."""
    return list_tools()


def get_tool_count() -> int:
    """Return total number of registered tools."""
    return len(TOOL_REGISTRY)


def get_tools_by_prefix(prefix: str) -> list[dict]:
    """Return tools whose names start with a given prefix."""
    return [
        {"name": name, "description": info["description"]}
        for name, info in TOOL_REGISTRY.items()
        if name.startswith(prefix)
    ]


# Agent-to-tool mapping: which tools each agent type has access to
AGENT_TOOL_MAP = {
    "orchestrator": [
        "run_full_validation", "evaluate_confidence", "batch_evaluate_confidence",
        "validate_state_transition", "get_valid_transitions",
        "generate_management_review",
        "generate_weekly_report", "generate_monthly_kpi_report", "generate_quarterly_review",
        "generate_all_notifications", "run_cross_module_analysis",
        "suggest_conflict_resolutions", "get_loto_removal_checklist",
    ],
    "reliability": [
        "assess_criticality", "calculate_criticality_score", "determine_risk_class",
        "validate_criticality_matrix",
        "rcm_decide", "validate_frequency_unit",
        "validate_fm_combination", "get_valid_fm_combinations",
        "list_all_mechanisms", "list_all_causes",
        "validate_failure_modes", "validate_tasks", "validate_cross_entity",
        "validate_fm_what",
        "calculate_priority", "validate_priority_override",
        "calculate_health_score", "determine_health_trend",
        "fit_weibull", "predict_failure", "weibull_reliability",
        "detect_variance", "detect_multi_metric_variance", "rank_plants",
        "calculate_mtbf", "calculate_mttr", "calculate_availability",
        "calculate_oee", "calculate_kpis_from_records",
        "classify_rca_event", "create_rca_analysis", "run_rca_5w2h",
        "add_rca_cause", "classify_root_cause", "validate_rca_chain",
        "collect_rca_evidence", "evaluate_rca_solution", "prioritize_rca_solutions",
        "advance_rca_status", "compute_de_kpis",
        "calculate_de_kpis_standalone", "assess_de_program_health",
        "check_rbi_overdue", "check_kpi_breaches",
        "find_bad_actor_overlap",
        "create_fmeca_worksheet", "calculate_rpn", "generate_fmeca_summary",
    ],
    "planning": [
        "group_by_equipment", "group_by_area", "group_by_shutdown",
        "find_all_groups", "stratify_backlog",
        "generate_sap_upload", "validate_sap_cross_references", "validate_sap_field_lengths",
        "generate_work_instruction", "validate_work_instruction",
        "validate_wp_name", "validate_task_name",
        "validate_work_packages",
        "create_capa", "advance_capa_phase", "update_capa_status",
        "add_capa_action", "set_capa_root_cause", "check_capa_overdue",
        "get_capa_summary",
        "calculate_planning_kpis", "get_planning_kpi_targets",
        "create_weekly_program", "level_program_resources",
        "detect_scheduling_conflicts", "validate_wp_elements",
        "finalize_weekly_program", "generate_gantt",
        "analyze_spare_parts", "calculate_stock_levels",
        "create_shutdown", "update_shutdown_progress", "complete_shutdown", "calculate_shutdown_metrics",
        "create_moc", "advance_moc", "assess_moc_risk",
        "calculate_ocr", "analyze_jackknife", "analyze_pareto",
        "calculate_lcc", "compare_lcc_alternatives",
        "assess_rbi", "prioritize_inspections",
        "validate_import_data",
        "export_equipment_data", "export_kpi_data", "export_report_data", "export_schedule_data",
        "check_backlog_aging",
        "assemble_work_package", "check_wp_element_readiness", "generate_wp_compliance_report",
        "build_execution_sequence", "level_resources_enhanced",
        "build_hierarchy_from_vendor", "get_equipment_types", "auto_assign_criticality",
    ],
    "spare_parts": [
        "suggest_materials", "validate_task_materials",
        "resolve_equipment",
    ],
}


def get_tools_for_agent(agent_type: str) -> list[dict]:
    """Return tool metadata for a specific agent type."""
    tool_names = AGENT_TOOL_MAP.get(agent_type, [])
    return [
        {"name": name, "description": TOOL_REGISTRY[name]["description"], "input_schema": TOOL_REGISTRY[name]["input_schema"]}
        for name in tool_names
        if name in TOOL_REGISTRY
    ]
