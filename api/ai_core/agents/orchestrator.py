"""Orchestrator Agent definition.

Coordinates the full OR workflow across 13 specialist agents,
enforces quality gates, and manages human approval at each gate.
Uses sonnet for balanced orchestration speed.
"""

from __future__ import annotations

from anthropic import Anthropic

from api.ai_core.agents.base import Agent, AgentConfig
from api.ai_core.agents.reliability import create_reliability_agent
from api.ai_core.agents.planning import create_planning_agent
from api.ai_core.agents.spare_parts import create_spare_parts_agent
from api.ai_core.agents.operations import create_operations_agent
from api.ai_core.agents.hse import create_hse_agent
from api.ai_core.agents.contracts import create_contracts_agent
from api.ai_core.agents.execution import create_execution_agent
from api.ai_core.agents.project_orchestrator import create_project_orchestrator_agent
from api.ai_core.agents.engineering import create_engineering_agent
from api.ai_core.agents.construction import create_construction_agent
from api.ai_core.agents.finance import create_finance_agent
from api.ai_core.agents.hr_talent import create_hr_talent_agent
from api.ai_core.agents.it_ot import create_it_ot_agent
from api.ai_core.agents.web_intelligence import create_web_intelligence_agent

ORCHESTRATOR_CONFIG = AgentConfig(
    name="Orchestrator",
    agent_type="orchestrator",
    model="claude-haiku-4-5-20251001",
    system_prompt_file="orchestrator_prompt.md",
    max_turns=10,
    temperature=0.0,
    use_skills=True,
)


class OrchestratorAgent(Agent):
    """Extended agent that can delegate work to 13 specialist sub-agents."""

    def __init__(self, client: Anthropic | None = None):
        super().__init__(ORCHESTRATOR_CONFIG, client=client)
        shared_client = self.client

        # Team B: Operations & Asset Management
        self.reliability = create_reliability_agent(client=shared_client)
        self.planning = create_planning_agent(client=shared_client)
        self.spare_parts = create_spare_parts_agent(client=shared_client)
        self.operations = create_operations_agent(client=shared_client)
        self.hse = create_hse_agent(client=shared_client)
        self.execution = create_execution_agent(client=shared_client)

        # Team A: Project Delivery
        self.project_orchestrator = create_project_orchestrator_agent(client=shared_client)
        self.engineering = create_engineering_agent(client=shared_client)
        self.construction = create_construction_agent(client=shared_client)
        self.contracts = create_contracts_agent(client=shared_client)

        # Team C: Corporate Support
        self.finance = create_finance_agent(client=shared_client)
        self.hr_talent = create_hr_talent_agent(client=shared_client)
        self.it_ot = create_it_ot_agent(client=shared_client)

        # Team D: Intelligence
        self.web_intelligence = create_web_intelligence_agent(client=shared_client)

    def delegate(self, agent_type: str, instruction: str, context: list[dict] | None = None) -> str:
        agents = {
            "reliability": self.reliability,
            "planning": self.planning,
            "spare_parts": self.spare_parts,
            "operations": self.operations,
            "hse": self.hse,
            "execution": self.execution,
            "project_orchestrator": self.project_orchestrator,
            "engineering": self.engineering,
            "construction": self.construction,
            "contracts": self.contracts,
            "finance": self.finance,
            "hr_talent": self.hr_talent,
            "it_ot": self.it_ot,
            "web_intelligence": self.web_intelligence,
        }
        agent = agents.get(agent_type)
        if not agent:
            return f"[Error: Unknown agent type '{agent_type}'. Valid: {list(agents.keys())}]"
        return agent.run(instruction, context=context)

    def reset_all(self) -> None:
        self.reset()
        for agent in [
            self.reliability, self.planning, self.spare_parts,
            self.operations, self.hse, self.execution,
            self.project_orchestrator, self.engineering, self.construction, self.contracts,
            self.finance, self.hr_talent, self.it_ot, self.web_intelligence,
        ]:
            agent.reset()


def create_orchestrator(client=None) -> OrchestratorAgent:
    """Create the Orchestrator with all 14 sub-agents."""
    return OrchestratorAgent(client=client)
