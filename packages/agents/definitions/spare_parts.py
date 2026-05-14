"""Spare Parts Specialist Agent definition.

Expert in material management, BOM lookup, and T-16 rule enforcement.
Uses the haiku model for fast, focused material assignment.
Participates in Milestone 3.
"""

from agents.definitions.base import Agent, AgentConfig

SPARE_PARTS_CONFIG = AgentConfig(
    name="Spare Parts Specialist",
    agent_type="spare_parts",
    model="claude-haiku-4-5-20251001",
    system_prompt_file="spare_parts_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_spare_parts_agent(client=None) -> Agent:
    """Create a Spare Parts Specialist agent instance."""
    return Agent(SPARE_PARTS_CONFIG, client=client)
