"""
Shared mock factories for agent tests.

Provides helper functions to build synthetic Anthropic Message objects
with TextBlock and ToolUseBlock content, enabling all agent tests to
run WITHOUT an API key.
"""

from anthropic.types import Message, TextBlock, ToolUseBlock, Usage


def make_text_message(
    text: str,
    model: str = "claude-sonnet-4-5-20250929",
) -> Message:
    """Create a synthetic Anthropic Message with a single TextBlock."""
    return Message(
        id="msg_test_text",
        type="message",
        role="assistant",
        content=[TextBlock(type="text", text=text)],
        model=model,
        stop_reason="end_turn",
        stop_sequence=None,
        usage=Usage(input_tokens=100, output_tokens=50),
    )


def make_tool_use_message(
    tool_name: str,
    tool_input: dict,
    tool_use_id: str = "toolu_test_001",
    model: str = "claude-sonnet-4-5-20250929",
) -> Message:
    """Create a synthetic Anthropic Message with a single ToolUseBlock."""
    return Message(
        id="msg_test_tool",
        type="message",
        role="assistant",
        content=[ToolUseBlock(type="tool_use", id=tool_use_id, name=tool_name, input=tool_input)],
        model=model,
        stop_reason="tool_use",
        stop_sequence=None,
        usage=Usage(input_tokens=100, output_tokens=50),
    )


def make_mixed_message(
    text: str,
    tool_name: str,
    tool_input: dict,
    tool_use_id: str = "toolu_test_mix",
    model: str = "claude-sonnet-4-5-20250929",
) -> Message:
    """Create a Message with both TextBlock and ToolUseBlock."""
    return Message(
        id="msg_test_mixed",
        type="message",
        role="assistant",
        content=[
            TextBlock(type="text", text=text),
            ToolUseBlock(type="tool_use", id=tool_use_id, name=tool_name, input=tool_input),
        ],
        model=model,
        stop_reason="tool_use",
        stop_sequence=None,
        usage=Usage(input_tokens=100, output_tokens=80),
    )


def make_multi_tool_message(
    tools: list[tuple[str, dict, str]],
    model: str = "claude-sonnet-4-5-20250929",
) -> Message:
    """Create a Message with multiple ToolUseBlocks.

    Args:
        tools: List of (tool_name, tool_input, tool_use_id) tuples.
    """
    content = [
        ToolUseBlock(type="tool_use", id=tid, name=name, input=inp)
        for name, inp, tid in tools
    ]
    return Message(
        id="msg_test_multi",
        type="message",
        role="assistant",
        content=content,
        model=model,
        stop_reason="tool_use",
        stop_sequence=None,
        usage=Usage(input_tokens=100, output_tokens=120),
    )
