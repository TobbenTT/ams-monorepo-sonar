"""Reliability Engineer Agent definition.

Expert in RCM, FMEA, criticality assessment, failure prediction, and the
R8 methodology. Uses the opus model for highest analytical accuracy.
Participates in Milestones 1, 2, and 3.
"""

from agents.definitions.base import Agent, AgentConfig

RELIABILITY_CONFIG = AgentConfig(
    name="Reliability Engineer",
    agent_type="reliability",
    model="claude-opus-4-6",
    system_prompt_file="reliability_prompt.md",
    max_turns=40,
    temperature=0.0,
    use_skills=True,
)


def create_reliability_agent(client=None) -> Agent:
    """Create a Reliability Engineer agent instance."""
    return Agent(RELIABILITY_CONFIG, client=client)
