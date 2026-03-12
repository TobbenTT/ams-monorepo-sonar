"""Finance & Accounting Agent — AG-010.

Manages project budget, cost forecasting, invoice processing, OPEX/CAPEX
classification, cash flow modeling, and financial reporting.
Participates in Gates G0 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

FINANCE_CONFIG = AgentConfig(
    name="Finance & Accounting Agent",
    agent_type="finance",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="finance_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_finance_agent(client=None) -> Agent:
    """Create a Finance & Accounting Agent instance."""
    return Agent(FINANCE_CONFIG, client=client)
