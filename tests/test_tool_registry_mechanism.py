"""Tests for the tool registry decorator and call_tool mechanism.

Tests the @tool decorator registration, call_tool() invocation logic,
and error handling in isolation from any specific tools.
All tests are offline (no API key needed).
"""

import json
import pytest

from agents.tool_wrappers.registry import (
    tool, call_tool, call_tool_strict, list_tools,
    is_tool_error, ToolExecutionError, TOOL_REGISTRY,
)


# Unique prefix to avoid collisions with real tools
_PREFIX = "_test_registry_"


class TestToolDecorator:
    """Tests for the @tool decorator registration mechanism."""

    def teardown_method(self):
        # Clean up any test tools registered during the test
        to_remove = [k for k in TOOL_REGISTRY if k.startswith(_PREFIX)]
        for k in to_remove:
            del TOOL_REGISTRY[k]

    def test_decorator_registers_function(self):
        """@tool should add the function to TOOL_REGISTRY."""
        @tool(f"{_PREFIX}hello", "Says hello", {"type": "object", "properties": {}})
        def hello():
            return "hello"

        assert f"{_PREFIX}hello" in TOOL_REGISTRY
        assert TOOL_REGISTRY[f"{_PREFIX}hello"]["function"] is hello
        assert TOOL_REGISTRY[f"{_PREFIX}hello"]["description"] == "Says hello"

    def test_decorator_default_schema(self):
        """@tool with no schema should default to empty object schema."""
        @tool(f"{_PREFIX}no_schema", "No schema tool")
        def no_schema():
            return "ok"

        entry = TOOL_REGISTRY[f"{_PREFIX}no_schema"]
        assert entry["input_schema"] == {"type": "object", "properties": {}}

    def test_decorator_preserves_function(self):
        """The decorated function should still be directly callable."""
        @tool(f"{_PREFIX}direct", "Direct call test")
        def direct_call(x: int) -> int:
            return x * 2

        # Function is still callable without going through call_tool
        assert direct_call(5) == 10

    def test_duplicate_registration_overwrites(self):
        """Registering the same tool name twice should overwrite the first."""
        @tool(f"{_PREFIX}dup", "Version 1")
        def v1():
            return "v1"

        @tool(f"{_PREFIX}dup", "Version 2")
        def v2():
            return "v2"

        entry = TOOL_REGISTRY[f"{_PREFIX}dup"]
        assert entry["description"] == "Version 2"
        assert entry["function"] is v2


class TestCallTool:
    """Tests for call_tool() invocation and error handling."""

    def teardown_method(self):
        to_remove = [k for k in TOOL_REGISTRY if k.startswith(_PREFIX)]
        for k in to_remove:
            del TOOL_REGISTRY[k]

    def test_call_tool_returns_string_directly(self):
        """When tool returns a string, call_tool returns it as-is."""
        @tool(f"{_PREFIX}str_ret", "Returns string")
        def str_ret():
            return "raw string result"

        result = call_tool(f"{_PREFIX}str_ret", {})
        assert result == "raw string result"

    def test_call_tool_serializes_dict(self):
        """When tool returns a dict, call_tool serializes it to JSON."""
        @tool(f"{_PREFIX}dict_ret", "Returns dict")
        def dict_ret():
            return {"key": "value", "num": 42}

        result = call_tool(f"{_PREFIX}dict_ret", {})
        parsed = json.loads(result)
        assert parsed["key"] == "value"
        assert parsed["num"] == 42

    def test_call_unknown_tool_returns_error(self):
        """Calling a non-existent tool returns a JSON error."""
        result = call_tool(f"{_PREFIX}nonexistent_xyz", {})
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Unknown tool" in parsed["error"]

    def test_call_tool_exception_returns_error(self):
        """When a tool raises an exception, call_tool returns JSON error."""
        @tool(f"{_PREFIX}raises", "Raises error")
        def raises():
            raise ValueError("Something broke")

        result = call_tool(f"{_PREFIX}raises", {})
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Something broke" in parsed["error"]
        assert parsed["tool"] == f"{_PREFIX}raises"

    def test_call_tool_passes_kwargs(self):
        """Arguments dict should be unpacked as keyword arguments."""
        @tool(f"{_PREFIX}adder", "Adds two numbers", {
            "type": "object",
            "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
            "required": ["a", "b"],
        })
        def adder(a: int, b: int):
            return {"sum": a + b}

        result = call_tool(f"{_PREFIX}adder", {"a": 3, "b": 7})
        parsed = json.loads(result)
        assert parsed["sum"] == 10


class TestListTools:
    """Tests for list_tools() metadata listing."""

    def teardown_method(self):
        to_remove = [k for k in TOOL_REGISTRY if k.startswith(_PREFIX)]
        for k in to_remove:
            del TOOL_REGISTRY[k]

    def test_list_tools_includes_registered(self):
        """list_tools() should include tools registered via @tool."""
        @tool(f"{_PREFIX}listed", "A listed tool", {"type": "object", "properties": {"x": {"type": "string"}}})
        def listed(x: str):
            return x

        tools = list_tools()
        names = {t["name"] for t in tools}
        assert f"{_PREFIX}listed" in names

        # Verify metadata structure
        entry = next(t for t in tools if t["name"] == f"{_PREFIX}listed")
        assert entry["description"] == "A listed tool"
        assert "x" in entry["input_schema"]["properties"]


class TestCallToolStrict:
    """Tests for call_tool_strict() — raises on failure instead of returning error JSON."""

    def teardown_method(self):
        to_remove = [k for k in TOOL_REGISTRY if k.startswith(_PREFIX)]
        for k in to_remove:
            del TOOL_REGISTRY[k]

    def test_call_tool_strict_raises_on_unknown(self):
        """Unknown tool name should raise ToolExecutionError."""
        with pytest.raises(ToolExecutionError, match="Unknown tool"):
            call_tool_strict(f"{_PREFIX}nonexistent_xyz", {})

    def test_call_tool_strict_raises_on_exception(self):
        """Tool that raises should propagate as ToolExecutionError."""
        @tool(f"{_PREFIX}strict_fail", "Fails strictly")
        def strict_fail():
            raise RuntimeError("Engine crashed")

        with pytest.raises(ToolExecutionError, match="Engine crashed") as exc_info:
            call_tool_strict(f"{_PREFIX}strict_fail", {})
        assert exc_info.value.tool_name == f"{_PREFIX}strict_fail"

    def test_call_tool_strict_returns_on_success(self):
        """Successful tool call returns the result string."""
        @tool(f"{_PREFIX}strict_ok", "Works fine")
        def strict_ok():
            return "all good"

        result = call_tool_strict(f"{_PREFIX}strict_ok", {})
        assert result == "all good"

    def test_call_tool_strict_serializes_dict(self):
        """Dict result is JSON-serialized."""
        @tool(f"{_PREFIX}strict_dict", "Returns dict")
        def strict_dict():
            return {"status": "ok"}

        result = call_tool_strict(f"{_PREFIX}strict_dict", {})
        assert json.loads(result) == {"status": "ok"}


class TestIsToolError:
    """Tests for is_tool_error() helper."""

    def test_detects_error_json(self):
        assert is_tool_error('{"error": "something broke"}') is True

    def test_false_for_valid_json(self):
        assert is_tool_error('{"data": 1, "status": "ok"}') is False

    def test_false_for_non_json(self):
        assert is_tool_error("plain text result") is False

    def test_false_for_empty_string(self):
        assert is_tool_error("") is False

    def test_false_for_none(self):
        assert is_tool_error(None) is False
