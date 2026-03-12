"""HR & Talent Agent — AG-011.

Manages workforce planning, recruitment, onboarding, competency assessment,
labor law compliance, and organizational effectiveness.
Participates in Gates G0 through G3.
"""

from api.ai_core.agents.base import Agent, AgentConfig

HR_TALENT_CONFIG = AgentConfig(
    name="HR & Talent Agent",
    agent_type="hr_talent",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="hr_talent_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_hr_talent_agent(client=None) -> Agent:
    """Create an HR & Talent Agent instance."""
    return Agent(HR_TALENT_CONFIG, client=client)
