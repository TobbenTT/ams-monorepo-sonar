"""Construction Management Agent — AG-009.

Tracks field progress, manages inspection and test plans (ITPs),
non-conformances (NCRs), mechanical completion certificates, and
construction sequence ordering.
Participates in Gates G2 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

CONSTRUCTION_CONFIG = AgentConfig(
    name="Construction Management Agent",
    agent_type="construction",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="construction_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_construction_agent(client=None) -> Agent:
    """Create a Construction Management Agent instance."""
    return Agent(CONSTRUCTION_CONFIG, client=client)
