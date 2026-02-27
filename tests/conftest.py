"""
Shared test fixtures — phosphate-realistic synthetic data.
Provides reusable sample data for all test modules.
"""

import uuid
from datetime import date, datetime

import pytest

from tools.models.schemas import (
    AIClassification,
    AllocatedTask,
    ApprovalStatus,
    AvailabilityStatus,
    BacklogItem,
    BacklogStatus,
    BacklogWOType,
    CaptureImage,
    CaptureType,
    Cause,
    ComponentCategory,
    ComponentInstance,
    ComponentLibraryItem,
    CriticalityAssessment,
    CriticalityCategory,
    CriticalityMethod,
    CriteriaScore,
    Equipment,
    EquipmentCategory,
    EquipmentCriticality,
    EquipmentIdentification,
    EquipmentLibraryItem,
    EquipmentStatus,
    FailureConsequence,
    FailureEffect,
    FailureMode,
    FailurePattern,
    FailureType,
    FieldCaptureInput,
    FMStatus,
    FrequencyUnit,
    Function,
    FunctionType,
    FunctionalFailure,
    FunctionalLocation,
    ImageAnalysis,
    InventoryItem,
    JustificationCategory,
    LabourResource,
    LabourSpecialty,
    Language,
    MaintenancePlan,
    MaintenancePlanTask,
    MaintenanceTask,
    MaterialResource,
    MaterialsReadyStatus,
    MaterialsStatus,
    Mechanism,
    NodeMetadata,
    NodeType,
    PlannerAction,
    PlannerRecommendation,
    PlanStrategy,
    Plant,
    PlantHierarchyNode,
    Priority,
    ProblemDescription,
    ProductionImpact,
    ResolutionMethod,
    ResourceAnalysis,
    RiskAssessment,
    RiskClass,
    RiskLevel,
    SchedulingSuggestion,
    ShiftType,
    ShutdownWindow,
    SparePart,
    MaterialCriticality,
    StrategyType,
    StructuredWorkRequest,
    SubAssembly,
    SuggestedSparePart,
    TaskConstraint,
    TaskType,
    UnitOfMeasure,
    Validation,
    WPConstraint,
    WPType,
    WorkforceAvailability,
    WorkOrderHistory,
    WorkPackage,
    WOHistoryStatus,
    LabourSummary,
    LabourSummaryEntry,
    BudgetType,
    WPApprovalStatus,
    LibrarySource,
)


# ============================================================
# MODULE 1-3 FIXTURES
# ============================================================

@pytest.fixture
def sample_plant():
    return Plant(
        plant_id="OCP-JFC1",
        name="Jorf Fertilizer Complex 1",
        name_fr="Complexe d'engrais de Jorf 1",
        name_ar="مجمع الأسمدة جرف 1",
        location="32.2806° N, 8.5167° W",
    )


@pytest.fixture
def sample_func_loc():
    return FunctionalLocation(
        func_loc_id="JFC1-MIN-BRY-01",
        description="Grinding Area - SAG Mill Section",
        description_fr="Zone de broyage - Section broyeur SAG",
        level=3,
        parent_func_loc_id="JFC1-MIN-BRY",
        plant_id="OCP-JFC1",
    )


@pytest.fixture
def sample_equipment():
    return Equipment(
        equipment_id="EQ-SAG-001",
        tag="BRY-SAG-ML-001",
        description="SAG Mill Primary - 12m x 6m",
        description_fr="Broyeur SAG Primaire - 12m x 6m",
        equipment_type="SAG Mill",
        manufacturer="FLSmidth",
        model="SAG 12x6",
        serial_number="FLS-2019-SAG-0042",
        installation_date=date(2020, 3, 15),
        criticality=EquipmentCriticality.AA,
        func_loc_id="JFC1-MIN-BRY-01",
        status=EquipmentStatus.ACTIVE,
        weight_kg=450000.0,
        power_kw=8500.0,
    )


@pytest.fixture
def sample_field_capture():
    return FieldCaptureInput(
        timestamp=datetime(2026, 2, 20, 8, 30),
        technician_id="TECH-042",
        technician_name="Ahmed Benali",
        capture_type=CaptureType.VOICE,
        language_detected=Language.FR,
        raw_voice_text="Le broyeur SAG fait un bruit anormal de vibration côté entraînement",
        equipment_tag_manual="BRY-SAG-ML-001",
    )


@pytest.fixture
def sample_work_request():
    return StructuredWorkRequest(
        source_capture_id=str(uuid.uuid4()),
        created_at=datetime(2026, 2, 20, 8, 35),
        status="DRAFT",
        equipment_identification=EquipmentIdentification(
            equipment_id="EQ-SAG-001",
            equipment_tag="BRY-SAG-ML-001",
            confidence_score=0.92,
            resolution_method=ResolutionMethod.EXACT_MATCH,
        ),
        problem_description=ProblemDescription(
            original_text="Le broyeur SAG fait un bruit anormal de vibration côté entraînement",
            structured_description="Abnormal vibration noise detected on SAG mill drive side",
            structured_description_fr="Bruit de vibration anormal détecté côté entraînement du broyeur SAG",
            failure_mode_detected="Excessive vibration",
            affected_component="Drive system",
        ),
        ai_classification=AIClassification(
            work_order_type="PM03_CORRECTIVE",
            priority_suggested=Priority.URGENT,
            priority_justification="SAG mill is AA criticality, vibration may indicate bearing failure",
            estimated_duration_hours=4.0,
            required_specialties=["MECHANICAL", "CONMON"],
            safety_flags=["LOCKOUT_TAGOUT"],
        ),
    )


@pytest.fixture
def sample_planner_recommendation():
    return PlannerRecommendation(
        work_request_id=str(uuid.uuid4()),
        generated_at=datetime(2026, 2, 20, 9, 0),
        resource_analysis=ResourceAnalysis(
            workforce_available=[
                WorkforceAvailability(
                    specialty="MECHANICAL",
                    technicians_available=3,
                    next_available_slot=datetime(2026, 2, 20, 14, 0),
                ),
            ],
            materials_status=MaterialsStatus(all_available=True),
            shutdown_window=ShutdownWindow(
                next_available=datetime(2026, 2, 22, 6, 0),
                type="MINOR_8H",
                duration_hours=8.0,
            ),
            production_impact=ProductionImpact(
                estimated_downtime_hours=4.0,
                production_loss_tons=2400.0,
                cost_estimate_usd=48000.0,
            ),
        ),
        scheduling_suggestion=SchedulingSuggestion(
            recommended_date=date(2026, 2, 22),
            recommended_shift=ShiftType.MORNING,
            reasoning="Next minor shutdown window available; all resources ready",
        ),
        risk_assessment=RiskAssessment(
            risk_level=RiskLevel.HIGH,
            risk_factors=["AA criticality equipment", "Potential bearing failure"],
            recommendation="Schedule during next shutdown window",
        ),
        planner_action_required=PlannerAction.APPROVE,
        ai_confidence=0.87,
    )


@pytest.fixture
def sample_backlog_item():
    return BacklogItem(
        work_request_id=str(uuid.uuid4()),
        equipment_id="EQ-SAG-001",
        equipment_tag="BRY-SAG-ML-001",
        priority=Priority.URGENT,
        work_order_type=BacklogWOType.PM03,
        created_date=date(2026, 2, 20),
        age_days=0,
        status=BacklogStatus.AWAITING_SHUTDOWN,
        blocking_reason="Requires equipment stop",
        estimated_duration_hours=4.0,
        required_specialties=["MECHANICAL"],
        materials_ready=True,
        shutdown_required=True,
    )


@pytest.fixture
def sample_spare_part():
    return SparePart(
        material_code="MAT-BRG-22340",
        description="Spherical roller bearing 22340 CCK/W33",
        description_fr="Roulement à rotule sur rouleaux 22340 CCK/W33",
        material_group="BEARINGS",
        applicable_equipment=["EQ-SAG-001"],
        manufacturer="SKF",
        manufacturer_part_number="22340 CCK/W33",
        unit_of_measure="EA",
        criticality=MaterialCriticality.CRITICAL,
        lead_time_days=45,
        supplier="SKF Morocco",
        unit_cost_usd=12500.0,
    )


# ============================================================
# MODULE 4 FIXTURES
# ============================================================

@pytest.fixture
def sample_plant_hierarchy_nodes():
    """Complete hierarchy: Plant → Area → System → Equipment → SubAssembly → MI."""
    plant_id = str(uuid.uuid4())
    area_id = str(uuid.uuid4())
    system_id = str(uuid.uuid4())
    equip_id = str(uuid.uuid4())
    subassy_id = str(uuid.uuid4())
    mi_id = str(uuid.uuid4())

    return [
        PlantHierarchyNode(
            node_id=plant_id, node_type=NodeType.PLANT,
            name="Jorf Fertilizer Complex", name_fr="Complexe Jorf",
            code="OCP-JFC1", level=1,
        ),
        PlantHierarchyNode(
            node_id=area_id, node_type=NodeType.AREA,
            name="Grinding Area", name_fr="Zone de broyage",
            code="JFC1-BRY", parent_node_id=plant_id, level=2,
        ),
        PlantHierarchyNode(
            node_id=system_id, node_type=NodeType.SYSTEM,
            name="SAG Mill System", name_fr="Système Broyeur SAG",
            code="JFC1-BRY-SAG", parent_node_id=area_id, level=3,
        ),
        PlantHierarchyNode(
            node_id=equip_id, node_type=NodeType.EQUIPMENT,
            name="SAG Mill #1", name_fr="Broyeur SAG #1",
            code="BRY-SAG-ML-001", parent_node_id=system_id, level=4,
            tag="BRY-SAG-ML-001",
            metadata=NodeMetadata(manufacturer="FLSmidth", model="SAG 12x6"),
        ),
        PlantHierarchyNode(
            node_id=subassy_id, node_type=NodeType.SUB_ASSEMBLY,
            name="Drive System", name_fr="Système d'entraînement",
            code="BRY-SAG-ML-001-DRV", parent_node_id=equip_id, level=5,
        ),
        PlantHierarchyNode(
            node_id=mi_id, node_type=NodeType.MAINTAINABLE_ITEM,
            name="Drive Motor", name_fr="Moteur d'entraînement",
            code="BRY-SAG-ML-001-DRV-MOT", parent_node_id=subassy_id, level=6,
            component_lib_ref=str(uuid.uuid4()),
        ),
    ]


@pytest.fixture
def sample_criticality_assessment(sample_plant_hierarchy_nodes):
    equip_node = sample_plant_hierarchy_nodes[3]  # Equipment
    return CriticalityAssessment(
        node_id=equip_node.node_id,
        assessed_at=datetime(2026, 2, 20, 10, 0),
        assessed_by="ENG-RELIA-001",
        method=CriticalityMethod.FULL_MATRIX,
        criteria_scores=[
            CriteriaScore(category=CriticalityCategory.SAFETY, consequence_level=4),
            CriteriaScore(category=CriticalityCategory.HEALTH, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.ENVIRONMENT, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.PRODUCTION, consequence_level=5),
            CriteriaScore(category=CriticalityCategory.OPERATING_COST, consequence_level=4),
            CriteriaScore(category=CriticalityCategory.CAPITAL_COST, consequence_level=4),
            CriteriaScore(category=CriticalityCategory.SCHEDULE, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.REVENUE, consequence_level=5),
            CriteriaScore(category=CriticalityCategory.COMMUNICATIONS, consequence_level=2),
            CriteriaScore(category=CriticalityCategory.COMPLIANCE, consequence_level=3),
            CriteriaScore(category=CriticalityCategory.REPUTATION, consequence_level=3),
        ],
        probability=4,
        risk_class=RiskClass.IV_CRITICAL,
    )


@pytest.fixture
def sample_function(sample_plant_hierarchy_nodes):
    mi_node = sample_plant_hierarchy_nodes[5]
    return Function(
        node_id=mi_node.node_id,
        function_type=FunctionType.PRIMARY,
        description="To drive SAG mill at minimum 8500 kW continuously",
        description_fr="Entraîner le broyeur SAG à minimum 8500 kW en continu",
        performance_standard="8500 kW, continuous operation, <80°C winding temperature",
    )


@pytest.fixture
def sample_functional_failure(sample_function):
    return FunctionalFailure(
        function_id=sample_function.function_id,
        failure_type=FailureType.TOTAL,
        description="Motor fails to run (0 kW output)",
        description_fr="Le moteur ne tourne pas (puissance 0 kW)",
    )


@pytest.fixture
def sample_failure_mode(sample_functional_failure):
    return FailureMode(
        functional_failure_id=sample_functional_failure.failure_id,
        what="Bearing",
        mechanism=Mechanism.WEARS,
        cause=Cause.RELATIVE_MOVEMENT,
        failure_pattern=FailurePattern.B_AGE,
        failure_consequence=FailureConsequence.EVIDENT_OPERATIONAL,
        is_hidden=False,
        failure_effect=FailureEffect(
            evidence="High vibration detected on drive end bearing housing",
            production_impact="Complete SAG mill shutdown — 600 t/hr lost",
            physical_damage="Bearing seizure may damage shaft journal",
            estimated_downtime_hours=48.0,
        ),
        strategy_type=StrategyType.CONDITION_BASED,
    )


@pytest.fixture
def sample_maintenance_task():
    return MaintenanceTask(
        name="Inspect drive motor bearing for excessive vibration",
        name_fr="Inspecter le roulement du moteur pour vibration excessive",
        task_type=TaskType.INSPECT,
        acceptable_limits="< 4.5 mm/s RMS velocity at bearing housing",
        conditional_comments="If vibration exceeds 4.5 mm/s, schedule bearing replacement within 2 weeks",
        consequences="Bearing seizure causing 48hr unplanned shutdown, shaft damage",
        constraint=TaskConstraint.ONLINE,
        access_time_hours=0.0,
        frequency_value=4,
        frequency_unit=FrequencyUnit.WEEKS,
        labour_resources=[
            LabourResource(specialty=LabourSpecialty.CONMON_SPECIALIST, quantity=1, hours_per_person=0.5),
        ],
        tools=["Vibration analyzer", "Safety glasses"],
    )


@pytest.fixture
def sample_secondary_task():
    return MaintenanceTask(
        name="Replace drive end bearing",
        name_fr="Remplacer le roulement côté entraînement",
        task_type=TaskType.REPLACE,
        is_secondary=True,
        consequences="Continued operation risks shaft damage",
        constraint=TaskConstraint.OFFLINE,
        access_time_hours=2.0,
        frequency_value=52,
        frequency_unit=FrequencyUnit.WEEKS,
        budget_type=BudgetType.REPLACE,
        budgeted_life=18000.0,
        labour_resources=[
            LabourResource(specialty=LabourSpecialty.FITTER, quantity=2, hours_per_person=8.0),
        ],
        material_resources=[
            MaterialResource(
                description="Spherical roller bearing 22340",
                stock_code="MAT-BRG-22340",
                quantity=1,
                unit_of_measure=UnitOfMeasure.EA,
                unit_price=12500.0,
            ),
        ],
    )


@pytest.fixture
def sample_work_package(sample_maintenance_task):
    return WorkPackage(
        name="4W SAG MILL CONMON INSP ON",
        code="WP-SAG-001",
        node_id=str(uuid.uuid4()),
        frequency_value=4,
        frequency_unit=FrequencyUnit.WEEKS,
        constraint=WPConstraint.ONLINE,
        access_time_hours=0.0,
        work_package_type=WPType.STANDALONE,
        allocated_tasks=[
            AllocatedTask(task_id=sample_maintenance_task.task_id, order=1, operation_number=10),
        ],
        labour_summary=LabourSummary(
            total_hours=0.5,
            by_specialty=[LabourSummaryEntry(specialty="CONMON_SPECIALIST", hours=0.5, people=1)],
        ),
    )


@pytest.fixture
def sample_component_library_item():
    return ComponentLibraryItem(
        name="Spherical Roller Bearing, Heavy Duty",
        code="CL-BRG-SRB-HD",
        component_category=ComponentCategory.MECHANICAL,
        description="Spherical roller bearing for heavy-duty rotating equipment",
        description_fr="Roulement à rotule sur rouleaux pour équipement rotatif lourd",
        typical_manufacturers=["SKF", "FAG", "NSK", "Timken"],
        tags=["bearing", "roller", "spherical", "rotating"],
        source=LibrarySource.R8_LIBRARY,
    )


@pytest.fixture
def sample_equipment_library_item():
    return EquipmentLibraryItem(
        name="Warman 750 VK - SHD Pump - Slurry Service",
        code="EL-PUMP-WAR750VK",
        equipment_category=EquipmentCategory.PUMP,
        make="Weir Minerals",
        model="Warman 750 VK",
        operational_context="Phosphoric acid slurry service",
        description="750 VK super heavy duty slurry pump for phosphate processing",
        description_fr="Pompe à boue 750 VK extra-lourde pour le traitement du phosphate",
        sub_assemblies=[
            SubAssembly(
                name="Wet End",
                order=1,
                components=[
                    ComponentInstance(
                        component_lib_ref=str(uuid.uuid4()),
                        instance_name="Impeller",
                        is_maintainable_item=True,
                    ),
                    ComponentInstance(
                        component_lib_ref=str(uuid.uuid4()),
                        instance_name="Volute Liner",
                        is_maintainable_item=True,
                    ),
                ],
            ),
            SubAssembly(
                name="Bearing Assembly",
                order=2,
                components=[
                    ComponentInstance(
                        component_lib_ref=str(uuid.uuid4()),
                        instance_name="Drive End Bearing",
                        is_maintainable_item=True,
                    ),
                ],
            ),
        ],
        source=LibrarySource.OEM,
    )
