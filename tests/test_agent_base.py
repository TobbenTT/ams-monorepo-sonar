"""Tests for the Agent agentic loop with fully mocked Anthropic API.

Tests the core Agent.run() loop in agents/definitions/base.py,
verifying tool execution, history tracking, and error handling.
All tests are offline (no API key needed).
"""

import json
from unittest.mock import MagicMock, patch

import anthropic
import pytest

from agents.definitions.base import Agent, AgentConfig, AgentTurn
from tests.conftest_agents import (
    make_text_message,
    make_tool_use_message,
    make_mixed_message,
    make_multi_tool_message,
)


@pytest.fixture
def mock_agent():
    """Create an Agent with mocked prompt loading, tools, and API client."""
    with patch.object(AgentConfig, "load_system_prompt", return_value="You are a test agent."):
        with patch.object(AgentConfig, "get_tools_schema", return_value=[
            {"name": "test_tool", "description": "A test tool", "input_schema": {"type": "object", "properties": {}}},
        ]):
            mock_client = MagicMock()
            config = AgentConfig(
                name="Test Agent",
                agent_type="reliability",
                model="claude-sonnet-4-5-20250929",
                system_prompt_file="test_prompt.md",
                max_turns=10,
                temperature=0.0,
                use_skills=False,
            )
            agent = Agent(config, client=mock_client)
            yield agent, mock_client


class TestAgentConfig:
    """Tests for AgentConfig defaults and field values."""

    def test_config_defaults(self):
        """AgentConfig should have correct default values."""
        config = AgentConfig(
            name="Test",
            agent_type="test",
            model="claude-sonnet-4-5-20250929",
            system_prompt_file="test.md",
        )
        assert config.max_turns == 30
        assert config.temperature == 0.0
        assert config.use_skills is False
        assert config.include_shared_skills is True


class TestAgentLoop:
    """Tests for the Agent.run() agentic loop."""

    def test_single_turn_text_response(self, mock_agent):
        """When API returns a TextBlock, run() should return that text."""
        agent, mock_client = mock_agent
        mock_client.messages.create.return_value = make_text_message("Hello, I am the agent.")

        result = agent.run("What is your name?")
        assert result == "Hello, I am the agent."

    def test_tool_use_then_text_response(self, mock_agent):
        """Tool use followed by text: tool is executed and final text returned."""
        agent, mock_client = mock_agent

        # Turn 1: API returns tool use
        # Turn 2: API returns text
        mock_client.messages.create.side_effect = [
            make_tool_use_message("test_tool", {"input": "data"}),
            make_text_message("Analysis complete."),
        ]

        with patch("agents.definitions.base.call_tool", return_value='{"result": "ok"}') as mock_call:
            result = agent.run("Analyze this")

        assert result == "Analysis complete."
        mock_call.assert_called_once_with("test_tool", {"input": "data"})

    def test_multiple_tool_uses_in_single_response(self, mock_agent):
        """Multiple tool uses in one response should all be executed."""
        agent, mock_client = mock_agent

        multi_msg = make_multi_tool_message([
            ("test_tool", {"a": 1}, "toolu_001"),
            ("test_tool", {"b": 2}, "toolu_002"),
        ])
        mock_client.messages.create.side_effect = [
            multi_msg,
            make_text_message("Both tools executed."),
        ]

        with patch("agents.definitions.base.call_tool", return_value='{"ok": true}') as mock_call:
            result = agent.run("Run both tools")

        assert result == "Both tools executed."
        assert mock_call.call_count == 2

    def test_max_turns_reached(self, mock_agent):
        """When max_turns is exhausted with only tool calls, fallback message returned."""
        agent, mock_client = mock_agent
        agent.config.max_turns = 3

        # Always return tool use — never text
        mock_client.messages.create.return_value = make_tool_use_message(
            "test_tool", {}, "toolu_loop"
        )

        with patch("agents.definitions.base.call_tool", return_value='{"ok": true}'):
            result = agent.run("Loop forever")

        assert "[Agent reached max turns without final response]" in result

    def test_max_turns_with_partial_text(self, mock_agent):
        """Mixed messages at max_turns: last text parts should be joined."""
        agent, mock_client = mock_agent
        agent.config.max_turns = 2

        # Both turns return mixed (text + tool)
        mock_client.messages.create.return_value = make_mixed_message(
            "Thinking...", "test_tool", {}, "toolu_partial"
        )

        with patch("agents.definitions.base.call_tool", return_value='{"ok": true}'):
            result = agent.run("Think hard")

        # Last turn's text parts are returned
        assert "Thinking..." in result

    def test_history_recorded_after_run(self, mock_agent):
        """Agent history should contain turns after run() completes."""
        agent, mock_client = mock_agent

        mock_client.messages.create.side_effect = [
            make_tool_use_message("test_tool", {"x": 1}, "toolu_h1"),
            make_text_message("Done"),
        ]

        with patch("agents.definitions.base.call_tool", return_value='{"r": 1}'):
            agent.run("Do something")

        assert len(agent.history) == 2
        # First turn has tool calls
        assert len(agent.history[0].tool_calls) == 1
        assert agent.history[0].tool_calls[0]["name"] == "test_tool"
        # First turn has tool results
        assert len(agent.history[0].tool_results) == 1
        # Second turn is the final text (no tools)
        assert len(agent.history[1].tool_calls) == 0

    def test_reset_clears_history(self, mock_agent):
        """agent.reset() should clear the conversation history."""
        agent, mock_client = mock_agent
        mock_client.messages.create.return_value = make_text_message("Hi")

        agent.run("Hello")
        assert len(agent.history) > 0

        agent.reset()
        assert len(agent.history) == 0

    def test_context_prepended_to_messages(self, mock_agent):
        """Context messages should be prepended before the user message."""
        agent, mock_client = mock_agent
        mock_client.messages.create.return_value = make_text_message("Got context")

        context = [{"role": "user", "content": "Prior message"}]
        agent.run("New message", context=context)

        # Inspect the messages arg passed to the API
        call_args = mock_client.messages.create.call_args
        messages = call_args.kwargs.get("messages", call_args[1].get("messages", []))
        assert len(messages) >= 2
        assert messages[0]["content"] == "Prior message"
        assert messages[1]["content"] == "New message"

    def test_api_called_with_correct_kwargs(self, mock_agent):
        """Verify model, max_tokens, system, temperature, and tools are passed."""
        agent, mock_client = mock_agent
        mock_client.messages.create.return_value = make_text_message("ok")

        agent.run("Test kwargs")

        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert call_kwargs["model"] == "claude-sonnet-4-5-20250929"
        assert call_kwargs["max_tokens"] == 8192
        assert call_kwargs["system"] == "You are a test agent."
        assert call_kwargs["temperature"] == 0.0
        assert "tools" in call_kwargs
        assert len(call_kwargs["tools"]) == 1

    def test_empty_tools_omits_tools_kwarg(self):
        """Agent with no tools should not include 'tools' in API kwargs."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                config = AgentConfig(
                    name="NoTools",
                    agent_type="test",
                    model="claude-sonnet-4-5-20250929",
                    system_prompt_file="test.md",
                    use_skills=False,
                )
                agent = Agent(config, client=mock_client)

        mock_client.messages.create.return_value = make_text_message("No tools here")
        agent.run("Hello")

        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert "tools" not in call_kwargs

    def test_tool_error_still_passed_to_api(self, mock_agent):
        """Tool error JSON should be fed back as tool_result for the next API call."""
        agent, mock_client = mock_agent

        mock_client.messages.create.side_effect = [
            make_tool_use_message("test_tool", {}, "toolu_err"),
            make_text_message("Handled error"),
        ]

        error_json = json.dumps({"error": "Something went wrong", "tool": "test_tool"})
        with patch("agents.definitions.base.call_tool", return_value=error_json):
            result = agent.run("Try broken tool")

        assert result == "Handled error"
        # Verify the error was passed back as a tool_result
        second_call_messages = mock_client.messages.create.call_args_list[1].kwargs.get(
            "messages", mock_client.messages.create.call_args_list[1][1].get("messages", [])
        )
        # The last message before the second API call should be tool_result
        tool_result_msg = second_call_messages[-1]
        assert tool_result_msg["role"] == "user"
        assert any("error" in str(item) for item in tool_result_msg["content"])


class TestAgentConfigTimeout:
    """Tests for REC-002: API timeout and retry configuration."""

    def test_api_timeout_config_default(self):
        """api_timeout_seconds defaults to 300.0."""
        config = AgentConfig(
            name="Test", agent_type="test",
            model="claude-sonnet-4-5-20250929", system_prompt_file="t.md",
        )
        assert config.api_timeout_seconds == 300.0

    def test_api_max_retries_config_default(self):
        """api_max_retries defaults to 2."""
        config = AgentConfig(
            name="Test", agent_type="test",
            model="claude-sonnet-4-5-20250929", system_prompt_file="t.md",
        )
        assert config.api_max_retries == 2

    def test_api_timeout_retries_then_raises(self):
        """Timeout on all attempts should exhaust retries then raise."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                config = AgentConfig(
                    name="TimeoutAgent", agent_type="test",
                    model="claude-sonnet-4-5-20250929", system_prompt_file="t.md",
                    api_max_retries=2,
                )
                agent = Agent(config, client=mock_client)

        mock_client.messages.create.side_effect = anthropic.APITimeoutError(request=MagicMock())

        with patch("agents.definitions.base.time.sleep"):  # skip actual sleep
            with pytest.raises(anthropic.APITimeoutError):
                agent.run("Hello")

        # Should have attempted 3 times (initial + 2 retries)
        assert mock_client.messages.create.call_count == 3

    def test_api_timeout_succeeds_on_retry(self):
        """Timeout on first call, success on second → returns response."""
        with patch.object(AgentConfig, "load_system_prompt", return_value="Test"):
            with patch.object(AgentConfig, "get_tools_schema", return_value=[]):
                mock_client = MagicMock()
                config = AgentConfig(
                    name="RetryAgent", agent_type="test",
                    model="claude-sonnet-4-5-20250929", system_prompt_file="t.md",
                    api_max_retries=2,
                )
                agent = Agent(config, client=mock_client)

        mock_client.messages.create.side_effect = [
            anthropic.APITimeoutError(request=MagicMock()),
            make_text_message("Recovered after timeout"),
        ]

        with patch("agents.definitions.base.time.sleep"):
            result = agent.run("Hello")

        assert result == "Recovered after timeout"
        assert mock_client.messages.create.call_count == 2
