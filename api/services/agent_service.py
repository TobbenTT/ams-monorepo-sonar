"""Agent service — optional wrapper for AI agent workflows (requires API key)."""

from api.config import settings


def is_api_available() -> bool:
    return bool(settings.ANTHROPIC_API_KEY)


def get_status() -> dict:
    return {
        "api_key_configured": is_api_available(),
        "agents_available": ["orchestrator", "reliability", "planning", "spare_parts"] if is_api_available() else [],
        "message": "Agent workflows require ANTHROPIC_API_KEY in .env" if not is_api_available() else "Ready",
    }
