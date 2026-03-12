"""Web Intelligence Agent — AG-013.

Performs digital due diligence: company profiling, technology benchmarking,
market signals, competitive intelligence, and regulatory monitoring.
Uses Haiku for fast, high-volume search tasks.
"""

from api.ai_core.agents.base import Agent, AgentConfig

WEB_INTELLIGENCE_CONFIG = AgentConfig(
    name="Web Intelligence Agent",
    agent_type="web_intelligence",
    model="claude-haiku-4-5-20251001",
    system_prompt_file="web_intelligence_prompt.md",
    max_turns=10,
    temperature=0.0,
    use_skills=False,
)


def create_web_intelligence_agent(client=None) -> Agent:
    """Create a Web Intelligence Agent instance."""
    return Agent(WEB_INTELLIGENCE_CONFIG, client=client)
