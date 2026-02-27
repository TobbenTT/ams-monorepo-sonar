"""Unit tests for the V3 Skills System — category-based folder structure.

These tests verify the current VSC Methodology v3 skill structure:
  skills/{category}/{skill-name}/CLAUDE.md
  agents/{agent-name}/skills.yaml (skill registry per agent)
  agents/_shared/loader.py (skill loader)

All tests are offline — no API calls, no external dependencies.
"""

import pathlib
import pytest

import yaml

# ── Paths ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = pathlib.Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / "skills"
AGENTS_DIR = PROJECT_ROOT / "agents"

# ── Skill registry (extracted from agents/{name}/skills.yaml) ────────────
AGENT_SKILL_NAMES = {
    "orchestrator": [
        "orchestrate-workflow", "validate-quality", "analyze-cross-module",
        "import-data", "export-data", "manage-notifications", "manage-change",
        "generate-reports", "conduct-management-review", "calculate-kpis",
        "calculate-health-score", "detect-variance",
    ],
    "reliability": [
        "build-equipment-hierarchy", "assess-criticality", "perform-fmeca",
        "validate-failure-modes", "run-rcm-decision-tree",
        "assess-risk-based-inspection", "fit-weibull-distribution",
        "analyze-pareto", "analyze-jackknife", "perform-rca",
        "validate-quality", "resolve-equipment", "calculate-kpis",
        "manage-capa", "import-data",
    ],
    "planning": [
        "assemble-work-packages", "generate-work-instructions", "group-backlog",
        "calculate-priority", "schedule-weekly-program", "orchestrate-shutdown",
        "manage-capa", "calculate-planning-kpis", "export-to-sap",
        "calculate-life-cycle-cost", "optimize-cost-risk",
        "validate-quality", "import-data",
    ],
    "spare-parts": [
        "suggest-materials", "resolve-equipment",
        "optimize-spare-parts-inventory",
    ],
}


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 1: Loader Module
# ══════════════════════════════════════════════════════════════════════════

class TestV3LoaderImport:
    """Verify updated loader has v3 capabilities."""

    def test_import_functions(self):
        from agents._shared.loader import (
            load_agent, load_skills_for_agent, list_all_agents,
            get_agent_skills_summary,
        )
        assert callable(load_agent)
        assert callable(get_agent_skills_summary)
        assert callable(list_all_agents)

    def test_list_all_agents(self):
        from agents._shared.loader import list_all_agents
        result = list_all_agents()
        assert "reliability" in result
        assert "planning" in result
        assert "spare-parts" in result
        assert "orchestrator" in result
        assert len(result) == 4

    def test_skills_yaml_exists_per_agent(self):
        for agent in ["orchestrator", "reliability", "planning", "spare-parts"]:
            path = AGENTS_DIR / agent / "skills.yaml"
            assert path.exists(), f"Missing skills.yaml for {agent}"


class TestV3LoadSkillsForAgent:
    """Test load_skills_for_agent with v3 structure."""

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


class TestV3SkillsSummary:
    """Test get_agent_skills_summary."""

    def test_reliability_summary(self):
        from agents._shared.loader import get_agent_skills_summary
        summary = get_agent_skills_summary("reliability")
        assert summary["total_skills"] == 15
        assert summary["mandatory_skills"] == 5

    def test_planning_summary(self):
        from agents._shared.loader import get_agent_skills_summary
        summary = get_agent_skills_summary("planning")
        assert summary["total_skills"] == 13
        assert summary["mandatory_skills"] == 5

    def test_nonexistent_agent(self):
        from agents._shared.loader import get_agent_skills_summary
        summary = get_agent_skills_summary("nonexistent-xyz")
        assert summary["total_skills"] == 0


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 2: Skills.yaml Integrity
# ══════════════════════════════════════════════════════════════════════════

class TestSkillsYAMLIntegrity:
    """Verify skills.yaml files are well-formed and reference existing CLAUDE.md files."""

    @pytest.mark.parametrize("agent", ["orchestrator", "reliability", "planning", "spare-parts"])
    def test_skills_yaml_valid(self, agent):
        path = AGENTS_DIR / agent / "skills.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        assert "skills" in data
        assert isinstance(data["skills"], list)
        assert len(data["skills"]) > 0

    @pytest.mark.parametrize("agent", ["orchestrator", "reliability", "planning", "spare-parts"])
    def test_skills_yaml_has_required_fields(self, agent):
        path = AGENTS_DIR / agent / "skills.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        for skill in data["skills"]:
            assert "name" in skill, f"{agent}: skill missing 'name'"
            assert "path" in skill, f"{agent}: skill {skill.get('name', '?')} missing 'path'"

    @pytest.mark.parametrize("agent", ["orchestrator", "reliability", "planning", "spare-parts"])
    def test_skills_yaml_paths_exist(self, agent):
        """Every path referenced in skills.yaml should point to an existing CLAUDE.md."""
        path = AGENTS_DIR / agent / "skills.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        for skill in data["skills"]:
            skill_path = PROJECT_ROOT / skill["path"]
            assert skill_path.exists(), \
                f"{agent}: path does not exist: {skill['path']}"

    @pytest.mark.parametrize("agent", ["orchestrator", "reliability", "planning", "spare-parts"])
    def test_skill_names_match_registry(self, agent):
        """Skill names in skills.yaml should match our expected registry."""
        path = AGENTS_DIR / agent / "skills.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        actual_names = sorted(s["name"] for s in data["skills"])
        expected_names = sorted(AGENT_SKILL_NAMES[agent])
        assert actual_names == expected_names, \
            f"{agent}: skill names mismatch. Got {actual_names}, expected {expected_names}"


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 3: CLAUDE.md Skill Files
# ══════════════════════════════════════════════════════════════════════════

class TestCLAUDEMDContent:
    """Verify CLAUDE.md skill files have required sections."""

    def _get_all_skill_paths(self) -> list[pathlib.Path]:
        """Collect all CLAUDE.md paths from skills.yaml files."""
        paths = set()
        for agent in ["orchestrator", "reliability", "planning", "spare-parts"]:
            yaml_path = AGENTS_DIR / agent / "skills.yaml"
            data = yaml.safe_load(yaml_path.read_text(encoding="utf-8"))
            for skill in data["skills"]:
                paths.add(PROJECT_ROOT / skill["path"])
        return sorted(paths)

    def test_all_claude_md_have_content(self):
        """Every referenced CLAUDE.md should have non-trivial content."""
        for path in self._get_all_skill_paths():
            content = path.read_text(encoding="utf-8")
            assert len(content) > 100, f"{path.relative_to(PROJECT_ROOT)} too short"

    def test_unique_skills_count(self):
        """Total unique skills across all agents."""
        all_paths = self._get_all_skill_paths()
        assert len(all_paths) == 36


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 4: Category Folders
# ══════════════════════════════════════════════════════════════════════════

EXPECTED_CATEGORIES = [
    "00-knowledge-base",
    "02-maintenance-strategy-development",
    "02-work-planning",
    "03-reliability-engineering-and- defect-elimination",
    "04-cost-analysis",
    "05-general-functionalities",
    "06-orchestation",
]


class TestCategoryFolders:
    """Verify skill category directories exist."""

    @pytest.mark.parametrize("category", EXPECTED_CATEGORIES)
    def test_category_exists(self, category):
        path = SKILLS_DIR / category
        assert path.exists(), f"Missing category: {category}"
        assert path.is_dir()


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 5: Knowledge Base
# ══════════════════════════════════════════════════════════════════════════

class TestKnowledgeBase:
    """Verify knowledge base structure."""

    def test_kb_dir_exists(self):
        kb_dir = SKILLS_DIR / "00-knowledge-base"
        assert kb_dir.exists()
        assert kb_dir.is_dir()

    def test_kb_readme_exists(self):
        assert (SKILLS_DIR / "00-knowledge-base" / "README.md").exists()

    def test_kb_has_gecamin_folder(self):
        gecamin = SKILLS_DIR / "00-knowledge-base" / "competitive" / "gecamin"
        assert gecamin.exists()


# ══════════════════════════════════════════════════════════════════════════
# TEST GROUP 6: Registry File
# ══════════════════════════════════════════════════════════════════════════

class TestRegistryFile:
    """Verify SKILL_REGISTRY.md exists and references skills."""

    def test_skill_registry_exists(self):
        path = SKILLS_DIR / "SKILL_REGISTRY.md"
        assert path.exists()

    def test_skill_registry_has_agents(self):
        path = SKILLS_DIR / "SKILL_REGISTRY.md"
        content = path.read_text(encoding="utf-8")
        assert "Reliability" in content
        assert "Planning" in content
        assert "Spare Parts" in content
        assert "Orchestrator" in content
