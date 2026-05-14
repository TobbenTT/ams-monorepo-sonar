# agents/reliability/config.py
"""Factory para el agente Reliability Engineer."""

from agents._shared.base import AgentConfig, Agent


def create_reliability_agent() -> Agent:
    """Factory para el agente de fiabilidad.

    El Reliability Agent ejecuta RCM, FMECA, criticality assessment,
    hierarchy building, y análisis estadístico de fallas.
    Participa en Milestones 1, 2 y 3.
    """
    config = AgentConfig(
        name="Reliability Engineer",
        model="claude-opus-4-6",
        agent_dir="agents/reliability",
        tools=[
            "build_hierarchy",
            "assess_criticality",
            "perform_fmeca",
            "validate_failure_modes",
            "rcm_decide",
            "fit_weibull",
            "analyze_pareto",
            "analyze_jackknife",
            "perform_rca",
            "assess_rbi",
        ],
        max_turns=40,
        temperature=0.0,
    )
    return Agent(config)
