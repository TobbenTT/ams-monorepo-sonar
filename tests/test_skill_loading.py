"""Tests for YAML-based skill loading and agent discovery.

Tests the skill loading system in agents/_shared/loader.py against
the real filesystem — verifies YAML configs, milestone filtering,
and agent enumeration.
All tests are offline (no API key needed).
"""

import pytest

from agents._shared.loader import (
    load_skills_for_agent,
    list_all_agents,
    get_agent_skills_summary,
)


class TestLoadSkillsForAgent:
    """Tests for load_skills_for_agent() YAML-based skill loading."""

    def test_load_reliability_skills_all(self):
        """Loading all skills for reliability should return a non-empty list."""
        skills = load_skills_for_agent("reliability")
        assert len(skills) > 0
        names = [s.name for s in skills]
        assert "assess-criticality" in names or "build-equipment-hierarchy" in names

    def test_load_reliability_milestone_1_only(self):
        """Filtering by milestone=1 should return only M1 and 'all' skills."""
        skills = load_skills_for_agent("reliability", milestone=1)
        assert len(skills) > 0
        for skill in skills:
            assert skill.milestone in (1, "all"), (
                f"Skill {skill.name} has milestone={skill.milestone}, expected 1 or 'all'"
            )

    def test_load_reliability_milestone_2_includes_fmeca(self):
        """Milestone 2 should include perform-fmeca for the reliability agent."""
        skills = load_skills_for_agent("reliability", milestone=2)
        names = [s.name for s in skills]
        assert "perform-fmeca" in names, (
            f"perform-fmeca not found in milestone 2 skills: {names}"
        )

    def test_load_nonexistent_agent_returns_empty(self):
        """Loading skills for a non-existent agent should return empty list."""
        skills = load_skills_for_agent("nonexistent_agent_xyz")
        assert skills == []


class TestListAllAgents:
    """Tests for list_all_agents() agent discovery."""

    def test_discovers_registered_agents(self):
        """Should discover the 4 main agents by CLAUDE.md presence."""
        agents = list_all_agents()
        assert len(agents) >= 4
        assert "orchestrator" in agents
        assert "reliability" in agents
        assert "planning" in agents
        assert "spare-parts" in agents

    def test_excludes_shared_directory(self):
        """The _shared directory should NOT appear in the agent list."""
        agents = list_all_agents()
        assert "_shared" not in agents
        assert "__pycache__" not in agents


class TestGetAgentSkillsSummary:
    """Tests for get_agent_skills_summary() introspection."""

    def test_reliability_has_mandatory_skills(self):
        """Reliability agent should have at least 5 mandatory skills."""
        summary = get_agent_skills_summary("reliability")
        assert summary["mandatory_skills"] >= 5

    def test_nonexistent_agent_returns_zero_skills(self):
        """Non-existent agent should return total_skills=0."""
        summary = get_agent_skills_summary("nonexistent_agent_xyz")
        assert summary["total_skills"] == 0
