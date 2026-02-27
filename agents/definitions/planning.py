"""Planning Specialist Agent definition.

Expert in work packaging, SAP PM integration, work instructions, and
CAPA management. Uses the sonnet model for balanced speed/quality.
Participates in Milestones 3 and 4.
"""

from agents.definitions.base import Agent, AgentConfig

PLANNING_CONFIG = AgentConfig(
    name="Planning Specialist",
    agent_type="planning",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="planning_prompt.md",
    max_turns=30,
    temperature=0.0,
    use_skills=True,
)


def create_planning_agent(client=None) -> Agent:
    """Create a Planning Specialist agent instance."""
    return Agent(PLANNING_CONFIG, client=client)
