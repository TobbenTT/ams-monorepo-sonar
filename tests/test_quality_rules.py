"""
Test Suite: Quality Validation Rules (40+ rules from REF-04)
Validates the QualityValidator against all defined rules.
"""

import uuid
from datetime import datetime

import pytest

from tools.models.schemas import (
    ApprovalStatus,
    Cause,
    CriticalityAssessment,
    CriticalityCategory,
    CriticalityMethod,
    CriteriaScore,
    FailureConsequence,
    FailureEffect,
    FailureMode,
    FailureType,
    FrequencyUnit,
    Function,
    FunctionType,
    FunctionalFailure,
    LabourResource,
    LabourSpecialty,
    MaintenanceTask,
    MaterialResource,
    Mechanism,
    NodeType,
    PlantHierarchyNode,
    RiskClass,
    StrategyType,
    TaskConstraint,
    TaskType,
    UnitOfMeasure,
    WPConstraint,
    WPType,
    WorkPackage,
    AllocatedTask,
    LabourSummary,
)
from tools.validators.quality_validator import QualityValidator, ValidationResult


# ============================================================
# HIERARCHY VALIDATION (H-01 to H-04)
# ============================================================

class TestHierarchyValidation:
    def test_h02_mi_without_component_ref(self):
        """H-02: MI must have component library reference."""
        mi = PlantHierarchyNode(
            node_type=NodeType.MAINTAINABLE_ITEM,
            name="Bearing", name_fr="Roulement",
            code="X-MI-001", parent_node_id="parent", level=6,
            component_lib_ref=None,  # Missing!
        )
        results = QualityValidator.validate_hierarchy([mi])
        h02 = [r for r in results if r.rule_id == "H-02"]
        assert len(h02) == 1
        assert h02[0].severity == "ERROR"

    def test_h01_parent_child_level_consistency(self):
        """H-01: Parent must be at a higher level than child."""
        parent = PlantHierarchyNode(
            node_type=NodeType.EQUIPMENT, name="Pump", name_fr="Pompe",
            code="PUMP-001", parent_node_id="system", level=4,
        )
        child = PlantHierarchyNode(
            node_type=NodeType.EQUIPMENT, name="Motor", name_fr="Moteur",
            code="MOT-001", parent_node_id=parent.node_id, level=4,
        )
        results = QualityValidator.validate_hierarchy([parent, child])
        h01 = [r for r in results if r.rule_id == "H-01"]
        assert len(h01) >= 1


# ============================================================
# FUNCTION VALIDATION (F-01 to F-05)
# ============================================================

class TestFunctionValidation:
    def test_f01_system_without_functions(self):
        """F-01: All systems must have functions."""
        system = PlantHierarchyNode(
            node_type=NodeType.SYSTEM, name="Drive System", name_fr="Système",
            code="SYS-001", parent_node_id="area", level=3,
        )
        results = QualityValidator.validate_functions([system], [], [])
        f01 = [r for r in results if r.rule_id == "F-01"]
        assert len(f01) == 1
        assert f01[0].severity == "ERROR"

    def test_f03_mi_without_functions(self):
        """F-03: All MIs must have functions."""
        mi = PlantHierarchyNode(
            node_type=NodeType.MAINTAINABLE_ITEM, name="Bearing", name_fr="Roulement",
            code="MI-001", parent_node_id="subassy", level=6,
            component_lib_ref="some-ref",
        )
        results = QualityValidator.validate_functions([mi], [], [])
        f03 = [r for r in results if r.rule_id == "F-03"]
        assert len(f03) == 1

    def test_f02_function_without_failures(self):
        """F-02: Functions must have functional failures."""
        node = PlantHierarchyNode(
            node_type=NodeType.SYSTEM, name="System", name_fr="Système",
            code="SYS-001", parent_node_id="area", level=3,
        )
        func = Function(
            node_id=node.node_id,
            function_type=FunctionType.PRIMARY,
            description="To pump slurry at 9772 m3/hr",
            description_fr="Pomper la boue à 9772 m3/h",
        )
        results = QualityValidator.validate_functions([node], [func], [])
        f02 = [r for r in results if r.rule_id == "F-02"]
        assert len(f02) == 1

    def test_f05_function_format_warning(self):
        """F-05: Function should follow Verb + Noun + Standard."""
        node = PlantHierarchyNode(
            node_type=NodeType.SYSTEM, name="System", name_fr="Sys",
            code="SYS-001", parent_node_id="area", level=3,
        )
        func = Function(
            node_id=node.node_id,
            function_type=FunctionType.PRIMARY,
            description="Pumping",  # Too short — no verb+noun+standard
            description_fr="Pompage",
        )
        ff = FunctionalFailure(
            function_id=func.function_id,
            failure_type=FailureType.TOTAL,
            description="X", description_fr="X",
        )
        results = QualityValidator.validate_functions([node], [func], [ff])
        f05 = [r for r in results if r.rule_id == "F-05"]
        assert len(f05) == 1
        assert f05[0].severity == "WARNING"

    def test_passes_with_complete_data(self, sample_plant_hierarchy_nodes, sample_function, sample_functional_failure):
        """Complete data should pass function validation."""
        mi_node = sample_plant_hierarchy_nodes[5]
        results = QualityValidator.validate_functions(
            [mi_node], [sample_function], [sample_functional_failure],
        )
        errors = [r for r in results if r.severity == "ERROR"]
        assert len(errors) == 0


# ============================================================
# CRITICALITY VALIDATION (C-01 to C-04)
# ============================================================

class TestCriticalityValidation:
    def test_c01_equipment_without_criticality(self):
        """C-01: Equipment must have criticality."""
        equip = PlantHierarchyNode(
            node_type=NodeType.EQUIPMENT, name="Pump", name_fr="Pompe",
            code="P-001", parent_node_id="sys", level=4,
        )
        results = QualityValidator.validate_criticality([equip], [])
        c01 = [r for r in results if r.rule_id == "C-01"]
        assert len(c01) == 1
        assert c01[0].severity == "ERROR"

    def test_c02_system_without_criticality(self):
        """C-02: Systems must have criticality."""
        sys_node = PlantHierarchyNode(
            node_type=NodeType.SYSTEM, name="System", name_fr="Sys",
            code="SYS-001", parent_node_id="area", level=3,
        )
        results = QualityValidator.validate_criticality([sys_node], [])
        c02 = [r for r in results if r.rule_id == "C-02"]
        assert len(c02) == 1

    def test_c03_mi_without_criticality_info_only(self):
        """C-03: MI criticality is optional (INFO, not ERROR)."""
        mi = PlantHierarchyNode(
            node_type=NodeType.MAINTAINABLE_ITEM, name="MI", name_fr="MI",
            code="MI-001", parent_node_id="sub", level=6,
            component_lib_ref="ref",
        )
        results = QualityValidator.validate_criticality([mi], [])
        c03 = [r for r in results if r.rule_id == "C-03"]
        assert len(c03) == 1
        assert c03[0].severity == "INFO"

    def test_passes_with_assessment(self, sample_plant_hierarchy_nodes, sample_criticality_assessment):
        """Equipment with assessment should pass C-01."""
        equip = sample_plant_hierarchy_nodes[3]
        results = QualityValidator.validate_criticality([equip], [sample_criticality_assessment])
        c01 = [r for r in results if r.rule_id == "C-01"]
        assert len(c01) == 0


# ============================================================
# FAILURE MODE VALIDATION (FM-01 to FM-07)
# ============================================================

class TestFailureModeValidation:
    def test_fm_valid_passes(self, sample_failure_mode):
        results = QualityValidator.validate_failure_modes([sample_failure_mode])
        errors = [r for r in results if r.severity == "ERROR"]
        assert len(errors) == 0


# ============================================================
# TASK VALIDATION (T-01 to T-19)
# ============================================================

class TestTaskValidation:
    def test_t11_task_without_labour(self):
        """T-11: All tasks must have labour."""
        task = MaintenanceTask(
            name="Inspect motor for vibration",
            name_fr="X", task_type=TaskType.INSPECT,
            consequences="X",
            constraint=TaskConstraint.ONLINE, access_time_hours=0,
            frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
            labour_resources=[],  # Empty!
        )
        results = QualityValidator.validate_tasks([task], [])
        t11 = [r for r in results if r.rule_id == "T-11"]
        assert len(t11) == 1
        assert t11[0].severity == "ERROR"

    def test_t16_replacement_without_materials(self):
        """T-16: Replacement tasks must have materials."""
        task = MaintenanceTask(
            name="Replace bearing",
            name_fr="X", task_type=TaskType.REPLACE,
            consequences="X",
            constraint=TaskConstraint.OFFLINE, access_time_hours=2.0,
            frequency_value=52, frequency_unit=FrequencyUnit.WEEKS,
            labour_resources=[
                LabourResource(specialty=LabourSpecialty.FITTER, quantity=1, hours_per_person=4),
            ],
            material_resources=[],  # Empty for REPLACE!
        )
        results = QualityValidator.validate_tasks([task], [])
        t16 = [r for r in results if r.rule_id == "T-16"]
        assert len(t16) == 1
        assert t16[0].severity == "ERROR"

    def test_task_with_all_resources_passes(self, sample_maintenance_task):
        """Complete task should pass T-11 and T-16."""
        results = QualityValidator.validate_tasks([sample_maintenance_task], [])
        t11 = [r for r in results if r.rule_id == "T-11"]
        assert len(t11) == 0


# ============================================================
# WORK PACKAGE VALIDATION (WP-01 to WP-13)
# ============================================================

class TestWorkPackageValidation:
    def test_wp01_unallocated_task(self, sample_maintenance_task):
        """WP-01: Every task must be in a work package."""
        results = QualityValidator.validate_work_packages(
            [], [sample_maintenance_task],
        )
        wp01 = [r for r in results if r.rule_id == "WP-01"]
        assert len(wp01) == 1

    def test_wp03_mixed_constraints(self):
        """WP-03: Online + Offline tasks must not be in same WP."""
        online_task = MaintenanceTask(
            task_id="T1", name="Inspect motor for vibration",
            name_fr="X", task_type=TaskType.INSPECT,
            consequences="X",
            constraint=TaskConstraint.ONLINE, access_time_hours=0,
            frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
            labour_resources=[
                LabourResource(specialty=LabourSpecialty.CONMON_SPECIALIST, quantity=1, hours_per_person=0.5),
            ],
        )
        offline_task = MaintenanceTask(
            task_id="T2", name="Replace bearing",
            name_fr="X", task_type=TaskType.REPLACE,
            consequences="X",
            constraint=TaskConstraint.OFFLINE, access_time_hours=2.0,
            frequency_value=52, frequency_unit=FrequencyUnit.WEEKS,
            labour_resources=[
                LabourResource(specialty=LabourSpecialty.FITTER, quantity=1, hours_per_person=4),
            ],
            material_resources=[
                MaterialResource(description="Bearing", quantity=1, unit_of_measure=UnitOfMeasure.EA),
            ],
        )
        wp = WorkPackage(
            name="4W SAG MIXED WP ON",
            code="WP-MIX", node_id="X",
            frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
            constraint=WPConstraint.ONLINE, access_time_hours=0,
            work_package_type=WPType.STANDALONE,
            allocated_tasks=[
                AllocatedTask(task_id="T1", order=1, operation_number=10),
                AllocatedTask(task_id="T2", order=2, operation_number=20),
            ],
            labour_summary=LabourSummary(total_hours=4.5),
        )
        results = QualityValidator.validate_work_packages(
            [wp], [online_task, offline_task],
        )
        wp03 = [r for r in results if r.rule_id == "WP-03"]
        assert len(wp03) == 1
        assert wp03[0].severity == "ERROR"

    def test_valid_wp_passes(self, sample_work_package, sample_maintenance_task):
        results = QualityValidator.validate_work_packages(
            [sample_work_package], [sample_maintenance_task],
        )
        errors = [r for r in results if r.severity == "ERROR"]
        assert len(errors) == 0


# ============================================================
# FULL VALIDATION INTEGRATION
# ============================================================

class TestFullValidation:
    def test_empty_data_no_crash(self):
        """Running validation on empty data should not crash."""
        results = QualityValidator.run_full_validation()
        assert results == []

    def test_full_pipeline(
        self,
        sample_plant_hierarchy_nodes,
        sample_criticality_assessment,
        sample_function,
        sample_functional_failure,
        sample_failure_mode,
        sample_maintenance_task,
        sample_work_package,
    ):
        """Full pipeline should produce results without crashing."""
        results = QualityValidator.run_full_validation(
            nodes=sample_plant_hierarchy_nodes,
            functions=[sample_function],
            functional_failures=[sample_functional_failure],
            criticality_assessments=[sample_criticality_assessment],
            failure_modes=[sample_failure_mode],
            tasks=[sample_maintenance_task],
            work_packages=[sample_work_package],
        )
        # Should have some results (INFO/WARNING level at minimum)
        assert isinstance(results, list)
        # No crashes = pass
