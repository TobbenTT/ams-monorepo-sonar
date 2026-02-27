"""Orchestrator Agent definition.

Coordinates the 4-milestone workflow, delegates to specialist agents,
enforces quality gates, and manages human approval. Uses sonnet for
balanced orchestration speed.
"""

from __future__ import annotations

from anthropic import Anthropic

from agents.definitions.base import Agent, AgentConfig
from agents.definitions.reliability import create_reliability_agent
from agents.definitions.planning import create_planning_agent
from agents.definitions.spare_parts import create_spare_parts_agent

ORCHESTRATOR_CONFIG = AgentConfig(
    name="Orchestrator",
    agent_type="orchestrator",
    model="claude-sonnet-4-5-20250929",
    system_prompt_file="orchestrator_prompt.md",
    max_turns=20,
    temperature=0.0,
    use_skills=True,
)


class OrchestratorAgent(Agent):
    """Extended agent that can delegate work to specialist sub-agents.

    The Orchestrator coordinates the multi-agent workflow by:
    1. Receiving high-level requests from the human
    2. Delegating to specialist agents for each milestone phase
    3. Running validation at gates
    4. Presenting results for human approval
    """

    def __init__(self, client: Anthropic | None = None):
        super().__init__(ORCHESTRATOR_CONFIG, client=client)
        shared_client = self.client
        self.reliability = create_reliability_agent(client=shared_client)
        self.planning = create_planning_agent(client=shared_client)
        self.spare_parts = create_spare_parts_agent(client=shared_client)

    def delegate(self, agent_type: str, instruction: str, context: list[dict] | None = None) -> str:
        """Delegate a task to a specialist agent.

        Args:
            agent_type: One of "reliability", "planning", "spare_parts".
            instruction: The task instruction for the specialist.
            context: Optional conversation context to pass along.

        Returns:
            The specialist agent's text response.
        """
        agents = {
            "reliability": self.reliability,
            "planning": self.planning,
            "spare_parts": self.spare_parts,
        }
        agent = agents.get(agent_type)
        if not agent:
            return f"[Error: Unknown agent type '{agent_type}'. Valid: {list(agents.keys())}]"
        return agent.run(instruction, context=context)

    def reset_all(self) -> None:
        """Reset all agents for a fresh session."""
        self.reset()
        self.reliability.reset()
        self.planning.reset()
        self.spare_parts.reset()


def create_orchestrator(client=None) -> OrchestratorAgent:
    """Create the Orchestrator with all sub-agents."""
    return OrchestratorAgent(client=client)
