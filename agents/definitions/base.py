"""Base agent class for OCP Maintenance AI multi-agent system.

Each agent wraps the Anthropic Messages API in an agentic tool-use loop:
1. Send message with system prompt + tools
2. If response has tool_use blocks, execute them via the tool registry
3. Feed tool results back and loop until the model produces a final text response
"""

from __future__ import annotations

import json
import pathlib
import time
from dataclasses import dataclass, field
from typing import Any

import httpx
import anthropic
from anthropic import Anthropic
from anthropic.types import Message, ToolUseBlock, TextBlock

from agents.tool_wrappers.registry import call_tool
from agents.tool_wrappers.server import get_tools_for_agent
try:
    from core.skills.loader import (
        load_skills_for_agent,
        load_shared_skills,
        format_skills_block,
    )
except ModuleNotFoundError:
    # core/ was removed — fall back to agents._shared equivalents
    from agents._shared.loader import load_skills_for_agent  # type: ignore[assignment]

    def load_shared_skills():  # type: ignore[misc]
        return []

    def format_skills_block(skills):  # type: ignore[misc]
        if not skills:
            return ""
        lines = ["<loaded_skills>"]
        for skill in skills:
            lines.append(f"\n## Skill: {skill.name}")
            lines.append(f"Path: {skill.path}")
            lines.append(f"Mandatory: {skill.mandatory}")
        lines.append("\n</loaded_skills>")
        return "\n".join(lines)

PROMPTS_DIR = pathlib.Path(__file__).parent / "prompts"


@dataclass
class AgentConfig:
    """Static configuration for a specialist agent."""

    name: str
    agent_type: str
    model: str
    system_prompt_file: str
    max_turns: int = 30
    temperature: float = 0.0
    use_skills: bool = False
    include_shared_skills: bool = True
    api_timeout_seconds: float = 300.0
    api_max_retries: int = 2

    def load_system_prompt(self) -> str:
        path = PROMPTS_DIR / self.system_prompt_file
        base_prompt = path.read_text(encoding="utf-8")

        if not self.use_skills:
            return base_prompt

        agent_skills = load_skills_for_agent(self.agent_type)
        if self.include_shared_skills:
            agent_skills.extend(load_shared_skills())

        skills_block = format_skills_block(agent_skills)
        if not skills_block:
            return base_prompt

        return (
            f"{base_prompt}\n\n"
            f"# SKILLS (Standard Operating Procedures)\n\n"
            f"The following skills contain detailed methodology you MUST follow "
            f"when performing each type of analysis. Follow the step-by-step "
            f"instructions exactly.\n\n"
            f"{skills_block}"
        )

    def get_tools_schema(self) -> list[dict]:
        """Return Anthropic-compatible tool definitions for this agent."""
        raw = get_tools_for_agent(self.agent_type)
        return [
            {
                "name": t["name"],
                "description": t["description"],
                "input_schema": t["input_schema"],
            }
            for t in raw
        ]


@dataclass
class AgentTurn:
    """Record of a single turn in the agent loop."""

    role: str
    content: Any
    tool_calls: list[dict] = field(default_factory=list)
    tool_results: list[dict] = field(default_factory=list)


class Agent:
    """Agentic loop around the Anthropic Messages API.

    Usage:
        agent = Agent(config, client=Anthropic())
        result = agent.run("Assess criticality for SAG Mill 001")
    """

    def __init__(self, config: AgentConfig, client: Anthropic | None = None):
        self.config = config
        self.client = client or Anthropic(
            timeout=httpx.Timeout(config.api_timeout_seconds),
        )
        self.system_prompt = config.load_system_prompt()
        self.tools = config.get_tools_schema()
        self.history: list[AgentTurn] = []

    def run(self, user_message: str, context: list[dict] | None = None) -> str:
        """Execute the agent loop until a final text response is produced.

        Args:
            user_message: The task/instruction for this agent.
            context: Optional prior conversation messages to prepend.

        Returns:
            Final text response from the agent.
        """
        messages = list(context) if context else []
        messages.append({"role": "user", "content": user_message})

        for _turn in range(self.config.max_turns):
            response = self._call_api(messages)

            # Extract text blocks and tool-use blocks
            text_parts = []
            tool_uses = []
            for block in response.content:
                if isinstance(block, TextBlock):
                    text_parts.append(block.text)
                elif isinstance(block, ToolUseBlock):
                    tool_uses.append(block)

            # Record the turn
            turn = AgentTurn(
                role="assistant",
                content=response.content,
                tool_calls=[{"id": t.id, "name": t.name, "input": t.input} for t in tool_uses],
            )

            # If no tool calls, return the final text
            if not tool_uses:
                self.history.append(turn)
                return "\n".join(text_parts)

            # Execute tool calls and collect results
            messages.append({"role": "assistant", "content": response.content})

            tool_results_content = []
            for tool_use in tool_uses:
                result_str = call_tool(tool_use.name, tool_use.input)
                tool_results_content.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": result_str,
                })
                turn.tool_results.append({
                    "tool_use_id": tool_use.id,
                    "tool_name": tool_use.name,
                    "result": result_str,
                })

            self.history.append(turn)
            messages.append({"role": "user", "content": tool_results_content})

        return "\n".join(text_parts) if text_parts else "[Agent reached max turns without final response]"

    def _call_api(self, messages: list[dict]) -> Message:
        """API call to Anthropic Messages with timeout retry."""
        kwargs: dict[str, Any] = {
            "model": self.config.model,
            "max_tokens": 8192,
            "system": self.system_prompt,
            "messages": messages,
            "temperature": self.config.temperature,
        }
        if self.tools:
            kwargs["tools"] = self.tools

        for attempt in range(self.config.api_max_retries + 1):
            try:
                return self.client.messages.create(**kwargs)
            except anthropic.APITimeoutError:
                if attempt < self.config.api_max_retries:
                    time.sleep(2 ** attempt)
                    continue
                raise

    def reset(self) -> None:
        """Clear conversation history for a fresh run."""
        self.history.clear()
