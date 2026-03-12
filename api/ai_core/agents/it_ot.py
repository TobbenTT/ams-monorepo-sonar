"""IT/OT & Communications Agent — AG-012.

Manages OT/IT architecture, SCADA/DCS integration, data governance,
cybersecurity, communications infrastructure, and digital twin strategy.
Participates in Gates G1 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

IT_OT_CONFIG = AgentConfig(
    name="IT/OT & Communications Agent",
    agent_type="it_ot",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="it_ot_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_it_ot_agent(client=None) -> Agent:
    """Create an IT/OT & Communications Agent instance."""
    return Agent(IT_OT_CONFIG, client=client)
