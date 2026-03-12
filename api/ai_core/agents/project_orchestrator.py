"""Project Orchestrator Agent — AG-007.

Manages project governance: FEL gate reviews, earned value management (EVM),
risk register, project schedule, and decision log.
Participates in Gates G0 through G4.
"""

from api.ai_core.agents.base import Agent, AgentConfig

PROJECT_ORCHESTRATOR_CONFIG = AgentConfig(
    name="Project Orchestrator Agent",
    agent_type="project_orchestrator",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="project_orchestrator_prompt.md",
    max_turns=15,
    temperature=0.0,
    use_skills=True,
)


def create_project_orchestrator_agent(client=None) -> Agent:
    """Create a Project Orchestrator Agent instance."""
    return Agent(PROJECT_ORCHESTRATOR_CONFIG, client=client)
