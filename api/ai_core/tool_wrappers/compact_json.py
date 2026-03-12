"""Compact JSON serialization for LLM tool results.

All tool wrapper results are sent back to the LLM as context tokens.
Using compact separators (',', ':') instead of (', ', ': ') saves ~20-25%
tokens on structured data with zero information loss.

Usage:
    from api.ai_core.tool_wrappers.compact_json import dumps

    # Drop-in replacement for json.dumps
    dumps({"key": "value"})           # '{"key":"value"}'
    dumps(data, default=str)          # same kwargs as json.dumps
"""

import json
from typing import Any


def dumps(data: Any, **kwargs) -> str:
    """Serialize to compact JSON (no extra whitespace).

    Drop-in replacement for json.dumps() that defaults to compact
    separators. All json.dumps kwargs are supported.
    """
    kwargs.setdefault("separators", (",", ":"))
    return json.dumps(data, **kwargs)
