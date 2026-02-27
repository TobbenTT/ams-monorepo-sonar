"""Tool registry for MCP tool wrappers.

Provides a decorator-based registration system that collects all tool
wrappers into a single registry. The MCP server reads this registry
to expose tools to agents.
"""

import json
from typing import Callable

# Global tool registry: name -> {function, description, input_schema}
TOOL_REGISTRY: dict[str, dict] = {}


def tool(name: str, description: str, input_schema: dict | None = None):
    """Register a function as an MCP tool.

    Args:
        name: Unique tool name (snake_case).
        description: What the tool does (shown to agents).
        input_schema: JSON Schema for tool parameters.
    """
    def decorator(func: Callable) -> Callable:
        TOOL_REGISTRY[name] = {
            "function": func,
            "description": description,
            "input_schema": input_schema or {"type": "object", "properties": {}},
        }
        return func
    return decorator


def call_tool(name: str, arguments: dict) -> str:
    """Invoke a registered tool by name.

    Returns JSON string result or error message.
    """
    if name not in TOOL_REGISTRY:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        result = TOOL_REGISTRY[name]["function"](**arguments)
        return result if isinstance(result, str) else json.dumps(result, default=str)
    except Exception as e:
        return json.dumps({"error": str(e), "tool": name})


def list_tools() -> list[dict]:
    """Return all registered tools with metadata."""
    return [
        {"name": name, "description": info["description"], "input_schema": info["input_schema"]}
        for name, info in TOOL_REGISTRY.items()
    ]


class ToolExecutionError(Exception):
    """Raised by call_tool_strict when a tool fails."""

    def __init__(self, tool_name: str, message: str):
        self.tool_name = tool_name
        super().__init__(f"Tool '{tool_name}' failed: {message}")


def call_tool_strict(name: str, arguments: dict) -> str:
    """Like call_tool() but raises ToolExecutionError on failure."""
    if name not in TOOL_REGISTRY:
        raise ToolExecutionError(name, f"Unknown tool: {name}")
    try:
        result = TOOL_REGISTRY[name]["function"](**arguments)
        return result if isinstance(result, str) else json.dumps(result, default=str)
    except Exception as e:
        raise ToolExecutionError(name, str(e)) from e


def is_tool_error(result: str) -> bool:
    """Check if a call_tool result is an error response."""
    try:
        parsed = json.loads(result)
        return isinstance(parsed, dict) and "error" in parsed
    except (json.JSONDecodeError, TypeError):
        return False
