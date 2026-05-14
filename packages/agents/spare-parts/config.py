# agents/spare-parts/config.py
"""Factory para el agente Spare Parts Specialist."""

from agents._shared.base import AgentConfig, Agent


def create_spare_parts_agent() -> Agent:
    """Factory para el agente de repuestos.

    El Spare Parts Agent gestiona material assignment, BOM lookup,
    equipment resolution, y T-16 rule enforcement.
    Participa en Milestone 3.
    """
    config = AgentConfig(
        name="Spare Parts Specialist",
        model="claude-haiku-4-5-20251001",
        agent_dir="agents/spare-parts",
        tools=[
            "suggest_materials",
            "resolve_equipment",
            "lookup_bom",
            "optimize_inventory",
        ],
        max_turns=15,
        temperature=0.0,
    )
    return Agent(config)
