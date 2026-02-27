# agents/_shared/__init__.py
"""Infraestructura compartida para todos los agentes."""

from agents._shared.base import AgentConfig, Agent
from agents._shared.loader import load_agent, load_skills_for_agent

__all__ = ["AgentConfig", "Agent", "load_agent", "load_skills_for_agent"]
