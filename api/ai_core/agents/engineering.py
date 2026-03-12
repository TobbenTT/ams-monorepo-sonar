"""Engineering & Design Agent — AG-008.

Reviews and resolves engineering deliverables: P&IDs, data sheets,
vendor documentation, 3D model reviews, design change management.
Participates in Gates G1 through G3.
"""

from api.ai_core.agents.base import Agent, AgentConfig

ENGINEERING_CONFIG = AgentConfig(
    name="Engineering & Design Agent",
    agent_type="engineering",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="engineering_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_engineering_agent(client=None) -> Agent:
    """Create an Engineering & Design Agent instance."""
    return Agent(ENGINEERING_CONFIG, client=client)
