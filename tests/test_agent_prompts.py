"""Tests for agent system prompts — verifies mandatory constraints are mentioned.

All tests are offline. They read the agent CLAUDE.md prompt files and check for
required keywords and concepts.

Prompt files are now located at agents/{agent-name}/CLAUDE.md (post-restructure).
"""

import pathlib
import pytest

AGENTS_DIR = pathlib.Path(__file__).parent.parent / "agents"


def _load_prompt(agent_name: str) -> str:
    return (AGENTS_DIR / agent_name / "CLAUDE.md").read_text(encoding="utf-8")


# ── Orchestrator Prompt Tests ───────────────────────────────────────────

class TestOrchestratorPrompt:

    @pytest.fixture(autouse=True)
    def load(self):
        self.prompt = _load_prompt("orchestrator")

    def test_mentions_four_milestones(self):
        assert "Milestone 1" in self.prompt
        assert "Milestone 2" in self.prompt
        assert "Milestone 3" in self.prompt
        assert "Milestone 4" in self.prompt

    def test_mentions_human_approval(self):
        assert "APPROVE" in self.prompt
        assert "MODIFY" in self.prompt or "modify" in self.prompt
        assert "REJECT" in self.prompt

    def test_mentions_safety_first(self):
        assert "NEVER" in self.prompt
        prompt_lower = self.prompt.lower()
        assert "auto-submit" in prompt_lower or "auto-advancing" in prompt_lower

    def test_mentions_validation(self):
        assert "validate_quality" in self.prompt or "run_full_validation" in self.prompt

    def test_mentions_72_combo(self):
        assert "72-combo" in self.prompt or "72 combo" in self.prompt

    def test_mentions_all_agents(self):
        assert "Reliability" in self.prompt
        assert "Planning" in self.prompt
        assert "Spare Parts" in self.prompt

    def test_mentions_draft_output(self):
        assert "DRAFT" in self.prompt


# ── Reliability Prompt Tests ────────────────────────────────────────────

class TestReliabilityPrompt:

    @pytest.fixture(autouse=True)
    def load(self):
        self.prompt = _load_prompt("reliability")

    def test_mentions_72_combo_mandatory(self):
        assert "72" in self.prompt
        assert "MANDATORY" in self.prompt or "mandatory" in self.prompt.lower()

    def test_mentions_validate_fm(self):
        assert "validate_failure_modes" in self.prompt or "72-combo" in self.prompt

    def test_mentions_rcm_decide(self):
        assert "rcm_decide" in self.prompt or "RCM" in self.prompt

    def test_mentions_fmeca(self):
        assert "FMEA" in self.prompt or "FMECA" in self.prompt

    def test_mentions_criticality(self):
        assert "criticality" in self.prompt.lower()

    def test_mentions_task_naming(self):
        assert "72 characters" in self.prompt or "72 char" in self.prompt

    def test_mentions_frequency_selection(self):
        prompt_lower = self.prompt.lower()
        assert "calendar" in prompt_lower
        assert "operational" in prompt_lower

    def test_mentions_all_strategies(self):
        prompt_lower = self.prompt.lower()
        assert "condition-based" in prompt_lower or "on-condition" in prompt_lower
        assert "scheduled restoration" in prompt_lower or "replace" in prompt_lower.split('\n')[0] or "REPLACE" in self.prompt
        assert "predictive" in prompt_lower or "MONITOR" in self.prompt
        assert "rcm" in prompt_lower or "RCM" in self.prompt


# ── Planning Prompt Tests ───────────────────────────────────────────────

class TestPlanningPrompt:

    @pytest.fixture(autouse=True)
    def load(self):
        self.prompt = _load_prompt("planning")

    def test_mentions_work_package_naming(self):
        assert "40 characters" in self.prompt or "40 char" in self.prompt
        assert "ALL CAPS" in self.prompt

    def test_mentions_task_naming(self):
        assert "72 characters" in self.prompt or "72 char" in self.prompt

    def test_mentions_sap_export(self):
        assert "SAP" in self.prompt

    def test_mentions_never_auto_submit(self):
        assert "NEVER" in self.prompt
        assert "auto-submit" in self.prompt.lower() or "DRAFT" in self.prompt

    def test_mentions_sap_validation(self):
        prompt_lower = self.prompt.lower()
        assert "cross-reference" in prompt_lower or "field-length" in prompt_lower

    def test_mentions_work_instructions(self):
        assert "work instruction" in self.prompt.lower()

    def test_mentions_capa(self):
        assert "CAPA" in self.prompt
        assert "PDCA" in self.prompt

    def test_mentions_t16_rule(self):
        assert "T-16" in self.prompt

    def test_mentions_backlog_grouping(self):
        prompt_lower = self.prompt.lower()
        assert "backlog" in prompt_lower or "group" in prompt_lower

    def test_mentions_milestone_3_and_4(self):
        assert "Milestone 3" in self.prompt
        assert "Milestone 4" in self.prompt


# ── Spare Parts Prompt Tests ────────────────────────────────────────────

class TestSparePartsPrompt:

    @pytest.fixture(autouse=True)
    def load(self):
        self.prompt = _load_prompt("spare-parts")

    def test_mentions_t16_rule(self):
        assert "T-16" in self.prompt

    def test_mentions_replace_must_have_materials(self):
        prompt_lower = self.prompt.lower()
        assert "replace" in prompt_lower
        assert "material" in prompt_lower

    def test_mentions_confidence_tiers(self):
        assert "0.95" in self.prompt
        assert "0.70" in self.prompt or "0.7" in self.prompt
        assert "0.40" in self.prompt or "0.4" in self.prompt

    def test_mentions_suggest_materials(self):
        assert "suggest_materials" in self.prompt

    def test_mentions_resolve_equipment(self):
        assert "resolve_equipment" in self.prompt

    def test_mentions_bom(self):
        assert "BOM" in self.prompt or "Bill of Materials" in self.prompt

    def test_mentions_component_types(self):
        assert "Bearing" in self.prompt or "component" in self.prompt.lower()

    def test_mentions_human_review_for_low_confidence(self):
        prompt_lower = self.prompt.lower()
        assert "human review" in prompt_lower or "human verification" in prompt_lower or "flag" in prompt_lower


# ── Cross-Prompt Consistency Tests ──────────────────────────────────────

class TestPromptConsistency:

    @pytest.fixture(autouse=True)
    def load_all(self):
        self.orchestrator = _load_prompt("orchestrator")
        self.reliability = _load_prompt("reliability")
        self.planning = _load_prompt("planning")
        self.spare_parts = _load_prompt("spare-parts")

    def test_all_prompts_exist(self):
        assert len(self.orchestrator) > 100
        assert len(self.reliability) > 100
        assert len(self.planning) > 100
        assert len(self.spare_parts) > 100

    def test_safety_first_in_critical_prompts(self):
        assert "DRAFT" in self.orchestrator
        assert "DRAFT" in self.planning
        assert "NEVER" in self.orchestrator
        assert "NEVER" in self.planning

    def test_72_combo_in_relevant_prompts(self):
        assert "72" in self.reliability
        assert "72" in self.orchestrator
