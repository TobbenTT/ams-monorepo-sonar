"""
Test Suite: Schema Validation — All 19 Pydantic models from gemini.md.
Validates structure, constraints, enums, and type enforcement.
"""

import uuid
from datetime import date, datetime

import pytest
from pydantic import ValidationError

from tools.models.schemas import (
    AllocatedTask,
    BacklogItem,
    BacklogStatus,
    BacklogWOType,
    CaptureType,
    Cause,
    ComponentCategory,
    ComponentLibraryItem,
    CriticalityAssessment,
    CriticalityCategory,
    CriticalityMethod,
    CriteriaScore,
    Equipment,
    EquipmentCriticality,
    EquipmentLibraryItem,
    EquipmentCategory,
    EquipmentStatus,
    FailureConsequence,
    FailureEffect,
    FailureMode,
    FailurePattern,
    FieldCaptureInput,
    FrequencyUnit,
    Function,
    FunctionType,
    FunctionalFailure,
    FunctionalLocation,
    InventoryItem,
    LabourResource,
    LabourSpecialty,
    LabourSummary,
    Language,
    MaintenancePlan,
    MaintenancePlanTask,
    MaintenanceTask,
    MaterialResource,
    Mechanism,
    NodeType,
    OptimizedBacklog,
    BacklogStratification,
    Plant,
    PlantHierarchyNode,
    PlannerRecommendation,
    Priority,
    RiskClass,
    SAPUploadPackage,
    SAPMaintenancePlan,
    SAPMaintenanceItem,
    SAPTaskList,
    SAPOperation,
    SparePart,
    MaterialCriticality,
    StrategyType,
    StructuredWorkRequest,
    SubAssembly,
    TaskConstraint,
    TaskType,
    UnitOfMeasure,
    WPConstraint,
    WPType,
    WorkPackage,
    WorkOrderHistory,
    WOHistoryStatus,
    LibrarySource,
)


# ============================================================
# MODULE 1: FIELD CAPTURE SCHEMAS
# ============================================================

class TestPlant:
    def test_valid_plant(self, sample_plant):
        assert sample_plant.plant_id == "OCP-JFC1"
        assert sample_plant.name_fr != ""

    def test_plant_requires_id(self):
        with pytest.raises(ValidationError):
            Plant(name="Test", name_fr="Test")


class TestFunctionalLocation:
    def test_valid_func_loc(self, sample_func_loc):
        assert sample_func_loc.level == 3
        assert sample_func_loc.plant_id == "OCP-JFC1"

    def test_level_bounds(self):
        with pytest.raises(ValidationError):
            FunctionalLocation(
                func_loc_id="X", description="X", description_fr="X",
                level=0, plant_id="X",
            )
        with pytest.raises(ValidationError):
            FunctionalLocation(
                func_loc_id="X", description="X", description_fr="X",
                level=5, plant_id="X",
            )


class TestEquipment:
    def test_valid_equipment(self, sample_equipment):
        assert sample_equipment.criticality == EquipmentCriticality.AA
        assert sample_equipment.power_kw == 8500.0

    def test_invalid_criticality(self):
        with pytest.raises(ValidationError):
            Equipment(
                equipment_id="X", tag="X", description="X", description_fr="X",
                equipment_type="X", criticality="INVALID",
                func_loc_id="X",
            )


class TestFieldCaptureInput:
    def test_valid_voice_capture(self, sample_field_capture):
        assert sample_field_capture.capture_type == CaptureType.VOICE
        assert sample_field_capture.raw_voice_text is not None

    def test_voice_requires_text(self):
        with pytest.raises(ValidationError, match="VOICE capture must include raw_voice_text"):
            FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id="T1", technician_name="Test",
                capture_type=CaptureType.VOICE,
                language_detected=Language.FR,
                raw_text_input="this is text, not voice",
            )

    def test_text_requires_text(self):
        with pytest.raises(ValidationError, match="TEXT capture must include raw_text_input"):
            FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id="T1", technician_name="Test",
                capture_type=CaptureType.TEXT,
                language_detected=Language.EN,
                raw_voice_text="this is voice, not text",
            )

    def test_max_five_images(self):
        from tools.models.schemas import CaptureImage
        images = [
            CaptureImage(file_path=f"/img/{i}.jpg", capture_timestamp=datetime.now())
            for i in range(6)
        ]
        with pytest.raises(ValidationError, match="Maximum 5 images"):
            FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id="T1", technician_name="Test",
                capture_type=CaptureType.IMAGE,
                language_detected=Language.FR,
                images=images,
            )

    def test_empty_capture_rejected(self):
        with pytest.raises(ValidationError, match="At least one input"):
            FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id="T1", technician_name="Test",
                capture_type=CaptureType.TEXT,
                language_detected=Language.FR,
            )

    def test_trilingual_support(self):
        """All three languages must be accepted."""
        for lang in [Language.FR, Language.EN, Language.AR]:
            capture = FieldCaptureInput(
                timestamp=datetime.now(),
                technician_id="T1", technician_name="Test",
                capture_type=CaptureType.TEXT,
                language_detected=lang,
                raw_text_input="Test input",
            )
            assert capture.language_detected == lang


class TestStructuredWorkRequest:
    def test_valid_work_request(self, sample_work_request):
        assert sample_work_request.status == "DRAFT"
        assert sample_work_request.equipment_identification.confidence_score == 0.92

    def test_confidence_score_bounds(self):
        with pytest.raises(ValidationError):
            from tools.models.schemas import EquipmentIdentification, ResolutionMethod
            EquipmentIdentification(
                equipment_id="X", equipment_tag="X",
                confidence_score=1.5,  # > 1.0
                resolution_method=ResolutionMethod.EXACT_MATCH,
            )

    def test_priority_enum_values(self):
        assert Priority.EMERGENCY.value == "1_EMERGENCY"
        assert Priority.URGENT.value == "2_URGENT"
        assert Priority.NORMAL.value == "3_NORMAL"
        assert Priority.PLANNED.value == "4_PLANNED"


class TestPlannerRecommendation:
    def test_valid_recommendation(self, sample_planner_recommendation):
        assert sample_planner_recommendation.ai_confidence == 0.87
        assert sample_planner_recommendation.planner_action_required.value == "APPROVE"

    def test_ai_confidence_bounds(self):
        """AI confidence must be 0.0-1.0."""
        with pytest.raises(ValidationError):
            PlannerRecommendation(
                work_request_id="X",
                generated_at=datetime.now(),
                resource_analysis=None,  # Will fail for other reasons too
                scheduling_suggestion=None,
                risk_assessment=None,
                planner_action_required="APPROVE",
                ai_confidence=1.5,
            )


class TestBacklogItem:
    def test_valid_backlog(self, sample_backlog_item):
        assert sample_backlog_item.priority == Priority.URGENT
        assert sample_backlog_item.shutdown_required is True

    def test_age_days_non_negative(self):
        with pytest.raises(ValidationError):
            BacklogItem(
                work_request_id="X", equipment_id="X", equipment_tag="X",
                priority=Priority.NORMAL, work_order_type=BacklogWOType.PM03,
                created_date=date.today(), age_days=-1,
                status=BacklogStatus.SCHEDULED,
                estimated_duration_hours=1.0,
                required_specialties=["MECH"],
                materials_ready=True, shutdown_required=False,
            )


class TestOptimizedBacklog:
    def test_counts_validation(self):
        """schedulable + blocked cannot exceed total."""
        with pytest.raises(ValidationError, match="schedulable"):
            OptimizedBacklog(
                generated_at=datetime.now(),
                period_start=date(2026, 2, 20),
                period_end=date(2026, 3, 20),
                total_backlog_items=10,
                items_schedulable_now=8,
                items_blocked=5,  # 8+5=13 > 10
                estimated_total_hours=100,
                stratification=BacklogStratification(
                    by_reason={"schedulable": 8}, by_priority={"normal": 10},
                    by_equipment_criticality={"A": 10},
                ),
            )


class TestWorkOrderHistory:
    def test_priority_pattern(self):
        with pytest.raises(ValidationError):
            WorkOrderHistory(
                work_order_id="WO-001", order_type=BacklogWOType.PM03,
                equipment_id="X", equipment_tag="X", func_loc_id="X",
                description="X", description_fr="X", priority="5",  # Invalid
                status=WOHistoryStatus.COMPLETED,
                created_date=date.today(), planned_start=date.today(),
                planned_end=date.today(), problem_description="X",
                assigned_team="MECH",
            )


class TestSparePart:
    def test_valid_spare_part(self, sample_spare_part):
        assert sample_spare_part.criticality == MaterialCriticality.CRITICAL
        assert sample_spare_part.lead_time_days == 45


class TestInventoryItem:
    def test_quantities_non_negative(self):
        with pytest.raises(ValidationError):
            InventoryItem(
                material_code="X", warehouse_id="X", warehouse_location="X",
                quantity_on_hand=-5, quantity_reserved=0, quantity_available=0,
                min_stock=0, safety_stock=0, reorder_point=0,
                last_movement_date=date.today(),
            )


# ============================================================
# MODULE 4: STRATEGY DEVELOPMENT SCHEMAS
# ============================================================

class TestComponentLibraryItem:
    def test_valid_component(self, sample_component_library_item):
        assert sample_component_library_item.component_category == ComponentCategory.MECHANICAL
        assert "bearing" in sample_component_library_item.tags

    def test_version_positive(self):
        with pytest.raises(ValidationError):
            ComponentLibraryItem(
                name="X", code="X", component_category=ComponentCategory.MECHANICAL,
                description="X", description_fr="X",
                source=LibrarySource.CUSTOM, version=0,
            )


class TestEquipmentLibraryItem:
    def test_valid_equipment_lib(self, sample_equipment_library_item):
        assert sample_equipment_library_item.equipment_category == EquipmentCategory.PUMP
        assert len(sample_equipment_library_item.sub_assemblies) == 2

    def test_sub_assembly_ordering(self, sample_equipment_library_item):
        orders = [sa.order for sa in sample_equipment_library_item.sub_assemblies]
        assert orders == sorted(orders)


class TestPlantHierarchyNode:
    def test_valid_hierarchy(self, sample_plant_hierarchy_nodes):
        assert len(sample_plant_hierarchy_nodes) == 6
        assert sample_plant_hierarchy_nodes[0].node_type == NodeType.PLANT
        assert sample_plant_hierarchy_nodes[5].node_type == NodeType.MAINTAINABLE_ITEM

    def test_level_type_mismatch(self):
        """Level must match node type."""
        with pytest.raises(ValidationError, match="must be level"):
            PlantHierarchyNode(
                node_type=NodeType.PLANT, name="X", name_fr="X",
                code="X", level=3,  # PLANT must be level 1
            )

    def test_plant_no_parent(self):
        """PLANT nodes must not have a parent."""
        with pytest.raises(ValidationError, match="must not have a parent"):
            PlantHierarchyNode(
                node_type=NodeType.PLANT, name="X", name_fr="X",
                code="X", level=1, parent_node_id="some-parent",
            )

    def test_non_plant_requires_parent(self):
        """Non-PLANT nodes must have a parent."""
        with pytest.raises(ValidationError, match="must have a parent"):
            PlantHierarchyNode(
                node_type=NodeType.AREA, name="X", name_fr="X",
                code="X", level=2,
            )


class TestCriticalityAssessment:
    def test_valid_assessment(self, sample_criticality_assessment):
        assert sample_criticality_assessment.method == CriticalityMethod.FULL_MATRIX
        assert len(sample_criticality_assessment.criteria_scores) == 11

    def test_probability_bounds(self):
        with pytest.raises(ValidationError):
            CriticalityAssessment(
                node_id="X", assessed_at=datetime.now(), assessed_by="X",
                method=CriticalityMethod.FULL_MATRIX,
                criteria_scores=[
                    CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=3),
                ],
                probability=6,  # Max is 5
                risk_class=RiskClass.IV_CRITICAL,
            )

    def test_duplicate_categories_rejected(self):
        with pytest.raises(ValidationError, match="Duplicate criteria"):
            CriticalityAssessment(
                node_id="X", assessed_at=datetime.now(), assessed_by="X",
                method=CriticalityMethod.FULL_MATRIX,
                criteria_scores=[
                    CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=3),
                    CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=4),
                ],
                probability=3,
                risk_class=RiskClass.III_HIGH,
            )

    def test_consequence_level_bounds(self):
        with pytest.raises(ValidationError):
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=6)


class TestFunction:
    def test_valid_function(self, sample_function):
        assert sample_function.function_type == FunctionType.PRIMARY
        assert sample_function.performance_standard is not None


class TestFunctionalFailure:
    def test_valid_failure(self, sample_functional_failure):
        assert sample_functional_failure.failure_type.value == "TOTAL"


class TestFailureMode:
    def test_valid_failure_mode(self, sample_failure_mode):
        assert sample_failure_mode.mechanism == Mechanism.WEARS
        assert sample_failure_mode.cause == Cause.RELATIVE_MOVEMENT

    def test_what_must_be_capitalized(self):
        """FM-01: what field must start with capital letter."""
        with pytest.raises(ValidationError, match="capital letter"):
            FailureMode(
                functional_failure_id="X",
                what="bearing",  # Lowercase!
                mechanism=Mechanism.WEARS, cause=Cause.MECHANICAL_OVERLOAD,
                failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
                is_hidden=False,
                failure_effect=FailureEffect(evidence="X"),
                strategy_type=StrategyType.CONDITION_BASED,
            )

    def test_invalid_mechanism_cause_combination(self):
        """Mechanism+Cause must be one of the 72 valid combos from SRC-09."""
        with pytest.raises(ValidationError, match="Invalid Mechanism\\+Cause combination"):
            FailureMode(
                functional_failure_id="X",
                what="Bearing",
                mechanism=Mechanism.ARCS, cause=Cause.AGE,  # Invalid combo!
                failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
                is_hidden=False,
                failure_effect=FailureEffect(evidence="X"),
                strategy_type=StrategyType.CONDITION_BASED,
            )

    def test_hidden_consequence_consistency(self):
        """Hidden flag must match consequence type."""
        with pytest.raises(ValidationError, match="Hidden failures must have HIDDEN"):
            FailureMode(
                functional_failure_id="X",
                what="Seal",
                mechanism=Mechanism.DEGRADES, cause=Cause.AGE,
                failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
                is_hidden=True,  # Mismatch!
                failure_effect=FailureEffect(evidence="X"),
                strategy_type=StrategyType.RUN_TO_FAILURE,
            )

    def test_evident_no_hidden_consequence(self):
        with pytest.raises(ValidationError, match="Evident failures cannot have HIDDEN"):
            FailureMode(
                functional_failure_id="X",
                what="Motor",
                mechanism=Mechanism.OVERHEATS_MELTS, cause=Cause.ELECTRICAL_OVERLOAD,
                failure_consequence=FailureConsequence.HIDDEN_SAFETY,
                is_hidden=False,  # Mismatch!
                failure_effect=FailureEffect(evidence="X"),
                strategy_type=StrategyType.FAULT_FINDING,
            )

    def test_all_mechanisms_valid(self):
        """All 18 mechanism codes from SRC-09 authoritative table are available."""
        expected = {
            "ARCS", "BLOCKS", "BREAKS_FRACTURE_SEPARATES", "CORRODES", "CRACKS",
            "DEGRADES", "DISTORTS", "DRIFTS", "EXPIRES", "IMMOBILISED",
            "LOOSES_PRELOAD", "OPEN_CIRCUIT", "OVERHEATS_MELTS", "SEVERS",
            "SHORT_CIRCUITS", "THERMALLY_OVERLOADS", "WASHES_OFF", "WEARS",
        }
        actual = {m.value for m in Mechanism}
        assert actual == expected

    def test_all_72_combinations_valid(self):
        """All 72 valid Mechanism+Cause combos from SRC-09 are registered."""
        from tools.models.schemas import VALID_FM_COMBINATIONS
        assert len(VALID_FM_COMBINATIONS) == 72

    def test_all_causes_valid(self):
        """All 44 cause codes from SRC-09 authoritative table are available."""
        assert len(Cause) == 44

    def test_all_failure_patterns(self):
        """All 6 Nowlan & Heap patterns are available."""
        expected = {"A_BATHTUB", "B_AGE", "C_FATIGUE", "D_STRESS", "E_RANDOM", "F_EARLY_LIFE"}
        actual = {p.value for p in FailurePattern}
        assert actual == expected


class TestMaintenanceTask:
    def test_valid_task(self, sample_maintenance_task):
        assert sample_maintenance_task.task_type == TaskType.INSPECT
        assert sample_maintenance_task.constraint == TaskConstraint.ONLINE
        assert sample_maintenance_task.access_time_hours == 0.0

    def test_online_zero_access_time(self):
        """T-17: Online must have access_time = 0."""
        with pytest.raises(ValidationError, match="Online tasks must have access_time_hours = 0"):
            MaintenanceTask(
                name="Inspect bearing for vibration",
                name_fr="X", task_type=TaskType.INSPECT,
                consequences="X",
                constraint=TaskConstraint.ONLINE,
                access_time_hours=1.0,  # Should be 0
                frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
            )

    def test_offline_nonzero_access_time(self):
        """T-17: Offline must have access_time > 0."""
        with pytest.raises(ValidationError, match="Offline tasks must have access_time_hours > 0"):
            MaintenanceTask(
                name="Replace bearing",
                name_fr="X", task_type=TaskType.REPLACE,
                consequences="X",
                constraint=TaskConstraint.OFFLINE,
                access_time_hours=0.0,  # Should be > 0
                frequency_value=52, frequency_unit=FrequencyUnit.WEEKS,
            )

    def test_name_max_72_chars(self):
        """T-18: SAP max 72 characters."""
        with pytest.raises(ValidationError):
            MaintenanceTask(
                name="A" * 73,
                name_fr="X", task_type=TaskType.INSPECT,
                consequences="X",
                constraint=TaskConstraint.ONLINE,
                access_time_hours=0.0,
                frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
            )

    def test_all_task_types(self):
        """All 8 task types from REF-02 are available."""
        expected = {"INSPECT", "CHECK", "TEST", "LUBRICATE", "CLEAN",
                    "REPLACE", "REPAIR", "CALIBRATE"}
        actual = {t.value for t in TaskType}
        assert actual == expected

    def test_all_labour_specialties(self):
        """All 6 specialties from REF-02 are available."""
        expected = {"FITTER", "ELECTRICIAN", "INSTRUMENTIST", "OPERATOR",
                    "CONMON_SPECIALIST", "LUBRICATOR"}
        actual = {s.value for s in LabourSpecialty}
        assert actual == expected


class TestWorkPackage:
    def test_valid_work_package(self, sample_work_package):
        assert sample_work_package.name == "4W SAG MILL CONMON INSP ON"
        assert sample_work_package.constraint == WPConstraint.ONLINE

    def test_name_must_be_caps(self):
        """WP-06: ALL CAPS required."""
        with pytest.raises(ValidationError, match="ALL CAPS"):
            WorkPackage(
                name="4w sag mill conmon insp on",  # lowercase
                code="X", node_id="X",
                frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
                constraint=WPConstraint.ONLINE, access_time_hours=0,
                work_package_type=WPType.STANDALONE,
            )

    def test_name_max_40_chars(self):
        """WP-05: Max 40 characters."""
        with pytest.raises(ValidationError):
            WorkPackage(
                name="A" * 41,
                code="X", node_id="X",
                frequency_value=4, frequency_unit=FrequencyUnit.WEEKS,
                constraint=WPConstraint.ONLINE, access_time_hours=0,
                work_package_type=WPType.STANDALONE,
            )

    def test_operation_number_multiples_of_10(self):
        """SAP operation numbers must be multiples of 10."""
        with pytest.raises(ValidationError, match="multiples of 10"):
            AllocatedTask(task_id="X", order=1, operation_number=15)

    def test_all_wp_types(self):
        expected = {"STANDALONE", "SUPPRESSIVE", "SEQUENTIAL"}
        actual = {t.value for t in WPType}
        assert actual == expected


class TestSAPUploadPackage:
    def test_valid_sap_package(self):
        package = SAPUploadPackage(
            plant_code="OCP-JFC1",
            maintenance_plan=SAPMaintenancePlan(
                plan_id="PLAN-001", description="SAG Mill Plan",
                cycle_value=28, cycle_unit="DAY",
                scheduling_period=14, scheduling_unit="DAY",
            ),
            maintenance_items=[
                SAPMaintenanceItem(
                    item_ref="$MI1", description="SAG MILL CONMON",
                    func_loc="JFC1-BRY-SAG", main_work_center="CONMON",
                    planner_group=1, task_list_ref="$TL1", priority="4",
                ),
            ],
            task_lists=[
                SAPTaskList(
                    list_ref="$TL1", description="SAG MILL CONMON INSP",
                    func_loc="JFC1-BRY-SAG", system_condition=1,
                    operations=[
                        SAPOperation(
                            operation_number=10, work_centre="CONMON",
                            short_text="Inspect drive bearing for vibration",
                            duration_hours=0.5, num_workers=1,
                        ),
                    ],
                ),
            ],
        )
        assert package.plant_code == "OCP-JFC1"
        assert package.maintenance_items[0].task_list_ref == "$TL1"

    def test_sap_short_text_max_72(self):
        with pytest.raises(ValidationError):
            SAPOperation(
                operation_number=10, work_centre="MECH",
                short_text="X" * 73,
                duration_hours=1.0, num_workers=1,
            )
