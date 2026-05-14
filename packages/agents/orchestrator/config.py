# agents/orchestrator/config.py
"""Factory para el agente Orchestrator."""

from agents._shared.base import AgentConfig, Agent


def create_orchestrator_agent() -> Agent:
    """Factory para el agente orquestador.

    El Orchestrator coordina el workflow de 4 milestones, delega a
    especialistas, y gestiona gates de calidad con aprobación humana.
    """
    config = AgentConfig(
        name="Orchestrator",
        model="claude-sonnet-4-5-20250929",
        agent_dir="agents/orchestrator",
        tools=[
            "validate_quality",
            "present_gate_summary",
            "delegate_to_agent",
            "get_session_state",
            "update_session_state",
            "run_full_validation",
        ],
        max_turns=20,
        temperature=0.0,
    )
    return Agent(config)
