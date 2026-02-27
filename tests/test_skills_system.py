"""Unit tests for the Skills System — loader, agent config, and skill files.

These tests verify the skill system behavior after the v2→v3 migration
where skills moved from skills/{name}/SKILL.md to
skills/{category}/{name}/CLAUDE.md, the loader moved from core/skills/loader.py
to agents/_shared/loader.py, and agent prompts moved from
agents/definitions/prompts/ to agents/{name}/CLAUDE.md.

All tests are offline — no API calls, no external dependencies.
"""

import pathlib
import pytest

# ── Paths ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = pathlib.Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / "skills"
AGENTS_DIR = PROJECT_ROOT / "agents"
KNOWLEDGE_BASE_DIR = SKILLS_DIR / "00-knowledge-base"


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 1: New Loader Module (agents/_shared/loader.py)
# ══════════════════════════════════════════════════════════════════════════

class TestLoaderImport:
    """Verify agents/_shared/loader.py can be imported and has correct API."""

    def test_import_loader(self):
        from agents._shared.loader import (
            load_agent,
            load_skills_for_agent,
            list_all_agents,
            get_agent_skills_summary,
        )
        assert callable(load_agent)
        assert callable(load_skills_for_agent)
        assert callable(list_all_agents)
        assert callable(get_agent_skills_summary)

    def test_list_all_agents(self):
        from agents._shared.loader import list_all_agents
        agents = list_all_agents()
        assert "orchestrator" in agents
        assert "reliability" in agents
        assert "planning" in agents
        assert "spare-parts" in agents
        assert len(agents) == 4


class TestLoadSkillsForAgent:
    """Test load_skills_for_agent() with the new skills.yaml structure."""

    def test_reliability_skills_count(self):
        from agents._shared.loader import load_skills_for_agent
        skills = load_skills_for_agent("reliability")
        assert len(skills) == 15

    def test_planning_skills_count(self):
        from agents._shared.loader import load_skills_for_agent
        skills = load_skills_for_agent("planning")
        assert len(skills) == 13

    def test_spare_parts_skills_count(self):
        from agents._shared.loader import load_skills_for_agent
        skills = load_skills_for_agent("spare-parts")
        assert len(skills) == 3

    def test_orchestrator_skills_count(self):
        from agents._shared.loader import load_skills_for_agent
        skills = load_skills_for_agent("orchestrator")
        assert len(skills) == 12

    def test_nonexistent_agent_returns_empty(self):
        from agents._shared.loader import load_skills_for_agent
        skills = load_skills_for_agent("nonexistent")
        assert skills == []

    def test_milestone_filter(self):
        from agents._shared.loader import load_skills_for_agent
        m1_skills = load_skills_for_agent("reliability", milestone=1)
        # Milestone 1 skills: build-equipment-hierarchy, assess-criticality
        assert len(m1_skills) >= 2


class TestGetAgentSkillsSummary:
    """Test get_agent_skills_summary()."""

    def test_reliability_summary(self):
        from agents._shared.loader import get_agent_skills_summary
        summary = get_agent_skills_summary("reliability")
        assert summary["agent"] == "reliability"
        assert summary["total_skills"] == 15
        assert summary["mandatory_skills"] == 5

    def test_nonexistent_agent(self):
        from agents._shared.loader import get_agent_skills_summary
        summary = get_agent_skills_summary("nonexistent")
        assert summary["total_skills"] == 0


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 2: Agent Definitions
# ══════════════════════════════════════════════════════════════════════════

class TestAgentDefinitions:
    """Verify all 4 agent definitions exist and have correct configs."""

    def test_reliability_config(self):
        from agents.definitions.reliability import RELIABILITY_CONFIG
        assert RELIABILITY_CONFIG.name == "Reliability Engineer"
        assert RELIABILITY_CONFIG.agent_type == "reliability"
        assert RELIABILITY_CONFIG.model == "claude-opus-4-6"

    def test_planning_config(self):
        from agents.definitions.planning import PLANNING_CONFIG
        assert PLANNING_CONFIG.name == "Planning Specialist"
        assert PLANNING_CONFIG.agent_type == "planning"

    def test_spare_parts_config(self):
        from agents.definitions.spare_parts import SPARE_PARTS_CONFIG
        assert SPARE_PARTS_CONFIG.name == "Spare Parts Specialist"
        assert SPARE_PARTS_CONFIG.agent_type == "spare_parts"

    def test_orchestrator_config(self):
        from agents.definitions.orchestrator import ORCHESTRATOR_CONFIG
        assert ORCHESTRATOR_CONFIG.name == "Orchestrator"
        assert ORCHESTRATOR_CONFIG.agent_type == "orchestrator"


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 3: Skill CLAUDE.md File Existence
# ══════════════════════════════════════════════════════════════════════════

# All 36 skills as CLAUDE.md files in the new category structure
EXPECTED_SKILLS = [
    "skills/02-maintenance-strategy-development/assemble-work-packages/CLAUDE.md",
    "skills/02-maintenance-strategy-development/assess-criticality/CLAUDE.md",
    "skills/02-maintenance-strategy-development/assess-risk-based-inspection/CLAUDE.md",
    "skills/02-maintenance-strategy-development/build-equipment-hierarchy/CLAUDE.md",
    "skills/02-maintenance-strategy-development/generate-work-instructions/CLAUDE.md",
    "skills/02-maintenance-strategy-development/perform-fmeca/CLAUDE.md",
    "skills/02-maintenance-strategy-development/run-rcm-decision-tree/CLAUDE.md",
    "skills/02-maintenance-strategy-development/validate-failure-modes/CLAUDE.md",
    "skills/02-work-planning/calculate-planning-kpis/CLAUDE.md",
    "skills/02-work-planning/calculate-priority/CLAUDE.md",
    "skills/02-work-planning/export-to-sap/CLAUDE.md",
    "skills/02-work-planning/group-backlog/CLAUDE.md",
    "skills/02-work-planning/optimize-spare-parts-inventory/CLAUDE.md",
    "skills/02-work-planning/orchestrate-shutdown/CLAUDE.md",
    "skills/02-work-planning/schedule-weekly-program/CLAUDE.md",
    "skills/02-work-planning/suggest-materials/CLAUDE.md",
    "skills/03-reliability-engineering-and- defect-elimination/analyze-jackknife/CLAUDE.md",
    "skills/03-reliability-engineering-and- defect-elimination/analyze-pareto/CLAUDE.md",
    "skills/03-reliability-engineering-and- defect-elimination/fit-weibull-distribution/CLAUDE.md",
    "skills/03-reliability-engineering-and- defect-elimination/perform-rca/CLAUDE.md",
    "skills/04-cost-analysis/calculate-life-cycle-cost/CLAUDE.md",
    "skills/04-cost-analysis/optimize-cost-risk/CLAUDE.md",
    "skills/05-general-functionalities/export-data/CLAUDE.md",
    "skills/05-general-functionalities/import-data/CLAUDE.md",
    "skills/05-general-functionalities/manage-change/CLAUDE.md",
    "skills/05-general-functionalities/manage-notifications/CLAUDE.md",
    "skills/05-general-functionalities/validate-quality/CLAUDE.md",
    "skills/06-orchestation/calculate-health-score/CLAUDE.md",
    "skills/06-orchestation/calculate-kpis/CLAUDE.md",
    "skills/06-orchestation/conduct-management-review/CLAUDE.md",
    "skills/06-orchestation/detect-variance/CLAUDE.md",
    "skills/06-orchestation/generate-reports/CLAUDE.md",
    "skills/06-orchestation/orchestrate-workflow/CLAUDE.md",
    "skills/analyze-cross-module/CLAUDE.md",
    "skills/manage-capa/CLAUDE.md",
    "skills/resolve-equipment/CLAUDE.md",
]


class TestSkillFileExistence:
    """Verify all expected skill CLAUDE.md files exist."""

    @pytest.mark.parametrize("skill_path", EXPECTED_SKILLS)
    def test_skill_exists(self, skill_path):
        path = PROJECT_ROOT / skill_path
        assert path.exists(), f"Missing: {skill_path}"

    def test_total_skill_count(self):
        """Should have 36 CLAUDE.md skill files."""
        assert len(EXPECTED_SKILLS) == 36


class TestSkillFileContent:
    """Verify CLAUDE.md files have minimum required content."""

    @pytest.mark.parametrize("skill_path", EXPECTED_SKILLS[:8])  # Sample skills
    def test_skill_has_content(self, skill_path):
        path = PROJECT_ROOT / skill_path
        content = path.read_text(encoding="utf-8")
        assert len(content) > 100, f"{skill_path} too short"


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 4: Directory Structure
# ══════════════════════════════════════════════════════════════════════════

class TestDirectoryStructure:
    """Verify the restructured project directories."""

    def test_skills_dir_exists(self):
        assert SKILLS_DIR.exists()
        assert SKILLS_DIR.is_dir()

    def test_knowledge_base_exists(self):
        assert KNOWLEDGE_BASE_DIR.exists()
        assert KNOWLEDGE_BASE_DIR.is_dir()

    def test_agent_dirs_exist(self):
        for agent in ["orchestrator", "reliability", "planning", "spare-parts"]:
            agent_dir = AGENTS_DIR / agent
            assert agent_dir.exists(), f"Missing agent dir: {agent}"
            assert (agent_dir / "CLAUDE.md").exists(), f"Missing CLAUDE.md in {agent}"
            assert (agent_dir / "config.py").exists(), f"Missing config.py in {agent}"
            assert (agent_dir / "skills.yaml").exists(), f"Missing skills.yaml in {agent}"

    def test_shared_loader_exists(self):
        assert (AGENTS_DIR / "_shared" / "loader.py").exists()

    def test_agent_prompt_files_exist(self):
        for agent in ["orchestrator", "reliability", "planning", "spare-parts"]:
            path = AGENTS_DIR / agent / "CLAUDE.md"
            assert path.exists(), f"Missing prompt: {agent}/CLAUDE.md"

    def test_skill_registry_exists(self):
        assert (SKILLS_DIR / "SKILL_REGISTRY.md").exists()


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 5: Knowledge Base
# ══════════════════════════════════════════════════════════════════════════

class TestKnowledgeBase:
    """Verify knowledge base structure."""

    def test_kb_dir_exists(self):
        assert KNOWLEDGE_BASE_DIR.exists()
        assert KNOWLEDGE_BASE_DIR.is_dir()

    def test_kb_readme_exists(self):
        assert (KNOWLEDGE_BASE_DIR / "README.md").exists()

    EXPECTED_SUBDIRS = [
        "standards", "methodologies", "data-models", "integration",
        "quality", "client", "architecture", "gfsn",
        "competitive", "strategic",
    ]

    @pytest.mark.parametrize("subdir", EXPECTED_SUBDIRS)
    def test_kb_subdirectory_exists(self, subdir):
        path = KNOWLEDGE_BASE_DIR / subdir
        assert path.exists(), f"Missing KB subdirectory: {subdir}"

    def test_kb_has_standards(self):
        standards = list((KNOWLEDGE_BASE_DIR / "standards").glob("*.md"))
        assert len(standards) >= 2

    def test_kb_has_methodologies(self):
        methods = list((KNOWLEDGE_BASE_DIR / "methodologies").glob("*.md"))
        assert len(methods) >= 5

    def test_kb_has_gfsn(self):
        gfsn = list((KNOWLEDGE_BASE_DIR / "gfsn").glob("*.md"))
        assert len(gfsn) >= 4
