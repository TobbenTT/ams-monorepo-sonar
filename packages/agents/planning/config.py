# agents/planning/config.py
"""Factory para el agente Planning Specialist."""

from agents._shared.base import AgentConfig, Agent


def create_planning_agent() -> Agent:
    """Factory para el agente de planificación.

    El Planning Agent gestiona work packaging, SAP integration,
    work instructions, scheduling, y CAPA tracking.
    Participa en Milestones 3 y 4.
    """
    config = AgentConfig(
        name="Planning Specialist",
        model="claude-sonnet-4-5-20250929",
        agent_dir="agents/planning",
        tools=[
            "assemble_work_package",
            "generate_work_instruction",
            "group_backlog",
            "calculate_priority",
            "export_to_sap",
            "validate_sap_export",
            "schedule_weekly",
            "calculate_planning_kpis",
            "calculate_lcc",
            "optimize_cost_risk",
        ],
        max_turns=30,
        temperature=0.0,
    )
    return Agent(config)
