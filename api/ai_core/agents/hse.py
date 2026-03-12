"""HSE Agent — AG-004.

Manages Health, Safety and Environment scope: process safety, industrial
hygiene, environmental compliance, HAZOP, LOPA, and permit systems.
Participates in Gates G0 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

HSE_CONFIG = AgentConfig(
    name="HSE Agent",
    agent_type="hse",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="hse_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_hse_agent(client=None) -> Agent:
    """Create an HSE Agent instance."""
    return Agent(HSE_CONFIG, client=client)
