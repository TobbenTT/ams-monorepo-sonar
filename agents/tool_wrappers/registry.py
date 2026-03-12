"""Tool registry for MCP tool wrappers.

Provides a decorator-based registration system that collects all tool
wrappers into a single registry. The MCP server reads this registry
to expose tools to agents.
"""

import json
from typing import Callable

from agents.tool_wrappers.compact_json import dumps as json_compact

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
        return json_compact({"error": f"Unknown tool: {name}"})
    try:
        result = TOOL_REGISTRY[name]["function"](**arguments)
        return result if isinstance(result, str) else json_compact(result, default=str)
    except Exception as e:
        return json_compact({"error": str(e), "tool": name})


def list_tools() -> list[dict]:
    """Return all registered tools with metadata."""
    return [
        {"name": name, "description": info["description"], "input_schema": info["input_schema"]}
        for name, info in TOOL_REGISTRY.items()
    ]


def json_tool(name: str, description: str, input_model: type | None = None):
    """Higher-level decorator: JSON parse → validate → call → serialize."""
    schema = {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]}

    def decorator(func: Callable) -> Callable:
        @tool(name, description, schema)
        def wrapper(input_json: str) -> str:
            try:
                data = json.loads(input_json)
            except json.JSONDecodeError as e:
                return json_compact({"error": f"Invalid JSON: {e}", "tool": name})
            try:
                if input_model is not None:
                    validated = input_model(**data)
                    result = func(validated)
                else:
                    result = func(data)
                if hasattr(result, "model_dump"):
                    return json_compact(result.model_dump(), default=str)
                if isinstance(result, str):
                    return result
                return json_compact(result, default=str)
            except Exception as e:
                return json_compact({"error": str(e), "tool": name, "type": type(e).__name__})
        return wrapper
    return decorator


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
        return result if isinstance(result, str) else json_compact(result, default=str)
    except Exception as e:
        raise ToolExecutionError(name, str(e)) from e


def is_tool_error(result: str) -> bool:
    """Check if a call_tool result is an error response."""
    try:
        parsed = json.loads(result)
        return isinstance(parsed, dict) and "error" in parsed
    except (json.JSONDecodeError, TypeError):
        return False
