"""Execution Agent — AG-006.

Manages commissioning, pre-startup safety reviews, mechanical completion,
punchlist management, handover, and change control.
Participates in Gates G2 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

EXECUTION_CONFIG = AgentConfig(
    name="Execution Agent",
    agent_type="execution",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="execution_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_execution_agent(client=None) -> Agent:
    """Create an Execution Agent instance."""
    return Agent(EXECUTION_CONFIG, client=client)
