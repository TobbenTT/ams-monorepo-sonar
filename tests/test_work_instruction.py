"""
Test Suite: Work Instruction Generator (OPP-6)
Validates WI generation from work packages.
Based on REF-07: WI structure, 4 WP type templates.
"""

import pytest

from tools.engines.work_instruction_generator import (
    WorkInstructionGenerator,
    WorkInstruction,
    DEFAULT_PPE,
)


@pytest.fixture
def sample_tasks():
    return [
        {
            "name": "Inspect drive motor bearing for excessive vibration",
            "task_type": "INSPECT",
            "constraint": "ONLINE",
            "acceptable_limits": "< 4.5 mm/s RMS",
            "conditional_comments": "If > 4.5 mm/s, schedule replacement",
            "labour_resources": [
                {"specialty": "CONMON_SPECIALIST", "quantity": 1, "hours_per_person": 0.5},
            ],
            "material_resources": [],
            "tools": ["Vibration analyzer"],
            "special_equipment": [],
        },
        {
            "name": "Check gearbox oil level",
            "task_type": "CHECK",
            "constraint": "ONLINE",
            "acceptable_limits": "Between MIN and MAX marks",
            "conditional_comments": "If below MIN, top up with ISO VG 320",
            "labour_resources": [
                {"specialty": "LUBRICATOR", "quantity": 1, "hours_per_person": 0.25},
            ],
            "material_resources": [],
            "tools": ["Torch"],
            "special_equipment": [],
        },
    ]


@pytest.fixture
def offline_tasks():
    return [
        {
            "name": "Replace drive end bearing",
            "task_type": "REPLACE",
            "constraint": "OFFLINE",
            "acceptable_limits": "",
            "conditional_comments": "",
            "labour_resources": [
                {"specialty": "FITTER", "quantity": 2, "hours_per_person": 8.0},
            ],
            "material_resources": [
                {"description": "Bearing SKF 22340", "stock_code": "MAT-BRG-22340", "quantity": 1},
            ],
            "tools": ["Bearing puller", "Torque wrench"],
            "special_equipment": ["Crane"],
        },
    ]


class TestOnlineWIGeneration:
    def test_generates_complete_wi(self, sample_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="4W SAG MILL CONMON INSP ON",
            wp_code="WP-001",
            equipment_name="SAG Mill #1",
            equipment_tag="BRY-SAG-ML-001",
            frequency="4W",
            constraint="ONLINE",
            tasks=sample_tasks,
        )
        assert wi.wp_name == "4W SAG MILL CONMON INSP ON"
        assert len(wi.operations) == 2
        assert wi.operations[0].operation_number == 10
        assert wi.operations[1].operation_number == 20

    def test_online_no_isolation(self, sample_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="4W SAG INSP ON", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="4W", constraint="ONLINE",
            tasks=sample_tasks,
        )
        assert wi.safety.isolation_required is False
        assert "LOTOTO" not in wi.safety.permits_required

    def test_ppe_populated(self, sample_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="4W SAG INSP ON", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="4W", constraint="ONLINE",
            tasks=sample_tasks,
        )
        assert len(wi.safety.ppe_required) > 0
        assert "Hard hat" in wi.safety.ppe_required

    def test_tools_collected(self, sample_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="4W SAG INSP ON", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="4W", constraint="ONLINE",
            tasks=sample_tasks,
        )
        assert "Vibration analyzer" in wi.resources.special_tools
        assert "Torch" in wi.resources.special_tools


class TestOfflineWIGeneration:
    def test_offline_requires_isolation(self, offline_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="52W SAG MECH SERV OFF", wp_code="WP-002",
            equipment_name="SAG Mill #1", equipment_tag="BRY-SAG-ML-001",
            frequency="52W", constraint="OFFLINE",
            tasks=offline_tasks,
        )
        assert wi.safety.isolation_required is True
        assert "LOTOTO" in wi.safety.permits_required

    def test_materials_collected(self, offline_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="52W SAG MECH SERV OFF", wp_code="WP-002",
            equipment_name="X", equipment_tag="X",
            frequency="52W", constraint="OFFLINE",
            tasks=offline_tasks,
        )
        assert len(wi.resources.materials_required) >= 1
        assert wi.resources.materials_required[0]["stock_code"] == "MAT-BRG-22340"

    def test_special_equipment_collected(self, offline_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="52W SAG MECH SERV OFF", wp_code="WP-002",
            equipment_name="X", equipment_tag="X",
            frequency="52W", constraint="OFFLINE",
            tasks=offline_tasks,
        )
        assert "Crane" in wi.resources.special_equipment

    def test_total_hours_calculated(self, offline_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="52W SAG MECH SERV OFF", wp_code="WP-002",
            equipment_name="X", equipment_tag="X",
            frequency="52W", constraint="OFFLINE",
            tasks=offline_tasks,
        )
        assert wi.resources.total_duration_hours == 16.0  # 2 fitters × 8 hours


class TestWIValidation:
    def test_valid_wi_passes(self, sample_tasks):
        wi = WorkInstructionGenerator.generate(
            wp_name="4W SAG INSP ON", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="4W", constraint="ONLINE",
            tasks=sample_tasks,
        )
        issues = WorkInstructionGenerator.validate_work_instruction(wi)
        errors = [i for i in issues if i.startswith("ERROR")]
        assert len(errors) == 0

    def test_empty_wi_fails(self):
        wi = WorkInstruction(
            wp_name="EMPTY", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="4W", constraint="ONLINE",
        )
        issues = WorkInstructionGenerator.validate_work_instruction(wi)
        errors = [i for i in issues if i.startswith("ERROR")]
        assert len(errors) >= 1

    def test_offline_without_isolation_fails(self):
        from tools.engines.work_instruction_generator import WISafetySection
        wi = WorkInstruction(
            wp_name="OFFLINE NO ISO", wp_code="X",
            equipment_name="X", equipment_tag="X",
            frequency="12W", constraint="OFFLINE",
        )
        wi.safety = WISafetySection(
            isolation_required=False,  # Wrong for OFFLINE!
            permits_required=[], ppe_required=[], environmental_controls=[],
        )
        issues = WorkInstructionGenerator.validate_work_instruction(wi)
        assert any("isolation" in i.lower() for i in issues)
