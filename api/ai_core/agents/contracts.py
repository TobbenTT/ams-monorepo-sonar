"""Contracts & Compliance Agent — AG-005.

Manages procurement strategy, contract drafting, vendor evaluation,
supply chain readiness, and regulatory compliance.
Participates in Gates G1 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

CONTRACTS_CONFIG = AgentConfig(
    name="Contracts & Compliance Agent",
    agent_type="contracts",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="contracts_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_contracts_agent(client=None) -> Agent:
    """Create a Contracts & Compliance Agent instance."""
    return Agent(CONTRACTS_CONFIG, client=client)
