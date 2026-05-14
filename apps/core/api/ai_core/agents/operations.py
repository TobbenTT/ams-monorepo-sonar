"""Operations Agent — AG-002.

Designs the operating model, organizational structure, staffing plan, and
workforce readiness. Creates SOPs, training programs, and ramp-up plans.
Participates in Gates G0 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

OPERATIONS_CONFIG = AgentConfig(
    name="Operations Agent",
    agent_type="operations",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="operations_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_operations_agent(client=None) -> Agent:
    """Create an Operations Agent instance."""
    return Agent(OPERATIONS_CONFIG, client=client)
