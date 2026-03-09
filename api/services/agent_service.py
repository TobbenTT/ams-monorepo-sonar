"""Agent service — optional wrapper for AI agent workflows (requires API key)."""

from api.config import settings


def is_api_available() -> bool:
    return bool(settings.ANTHROPIC_API_KEY or settings.GOOGLE_AI_API_KEY)


def get_ai_provider() -> str:
    if settings.GOOGLE_AI_API_KEY:
        return "google"
    if settings.ANTHROPIC_API_KEY:
        return "anthropic"
    return "none"


def get_status() -> dict:
    provider = get_ai_provider()
    return {
        "api_key_configured": is_api_available(),
        "ai_provider": provider,
        "agents_available": ["orchestrator", "reliability", "planning", "spare_parts"] if is_api_available() else [],
        "message": "Ready" if is_api_available() else "Set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY in .env",
    }
