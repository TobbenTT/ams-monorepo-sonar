"""
Tests for equipment_library.json and component_library.json
Validates structural integrity, enum compliance, and cross-referencing
for the OCP Maintenance AI MVP data libraries.
"""

import json
import os
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).resolve().parent.parent / "docs" / "context" / "libraries"
EQUIPMENT_LIB_PATH = DATA_DIR / "equipment_library.json"
COMPONENT_LIB_PATH = DATA_DIR / "component_library.json"

# ---------------------------------------------------------------------------
# Import schema enums and valid combinations from the source of truth
# ---------------------------------------------------------------------------
from tools.models.schemas import (
    Cause,
    Mechanism,
    TaskType,
    VALID_FM_COMBINATIONS,
)

# Derived sets for quick membership checks
VALID_MECHANISMS: set[str] = {m.value for m in Mechanism}
VALID_CAUSES: set[str] = {c.value for c in Cause}
VALID_TASK_TYPES: set[str] = {t.value for t in TaskType}
VALID_CRITICALITY_CLASSES: set[str] = {"AA", "A+", "A", "B", "C", "D"}
VALID_FM_PAIRS: set[tuple[str, str]] = {
    (m.value, c.value) for m, c in VALID_FM_COMBINATIONS
}


# ===================================================================
# Fixtures
# ===================================================================
@pytest.fixture(scope="module")
def equipment_data() -> dict:
    """Load equipment_library.json once for the module."""
    with open(EQUIPMENT_LIB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def component_data() -> dict:
    """Load component_library.json once for the module."""
    with open(COMPONENT_LIB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def equipment_types(equipment_data) -> list[dict]:
    return equipment_data["equipment_types"]


@pytest.fixture(scope="module")
def component_types(component_data) -> list[dict]:
    return component_data["component_types"]


# ===================================================================
# 1. JSON FILES LOAD WITHOUT ERRORS
# ===================================================================
class TestJsonLoading:
    """Verify that both JSON library files are parseable and well-formed."""

    def test_equipment_library_loads(self):
        """equipment_library.json loads without JSON parse errors."""
        with open(EQUIPMENT_LIB_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "equipment_types" in data

    def test_component_library_loads(self):
        """component_library.json loads without JSON parse errors."""
        with open(COMPONENT_LIB_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "component_types" in data

    def test_equipment_library_has_meta(self, equipment_data):
        """equipment_library.json includes a _meta block."""
        assert "_meta" in equipment_data
        assert "version" in equipment_data["_meta"]

    def test_component_library_has_meta(self, component_data):
        """component_library.json includes a _meta block."""
        assert "_meta" in component_data
        assert "version" in component_data["_meta"]


# ===================================================================
# 2. MINIMUM COUNTS
# ===================================================================
class TestMinimumCounts:
    """Ensure libraries contain a minimum number of entries."""

    def test_at_least_15_equipment_types(self, equipment_types):
        """Equipment library must contain at least 15 equipment types."""
        assert len(equipment_types) >= 15, (
            f"Expected >= 15 equipment types, found {len(equipment_types)}"
        )

    def test_at_least_20_component_types(self, component_types):
        """Component library must contain at least 20 component types."""
        assert len(component_types) >= 20, (
            f"Expected >= 20 component types, found {len(component_types)}"
        )


# ===================================================================
# 3. NO DUPLICATES
# ===================================================================
class TestNoDuplicates:
    """Ensure there are no duplicate IDs or type names."""

    def test_no_duplicate_equipment_type_ids(self, equipment_types):
        """All equipment_type_id values must be unique."""
        ids = [et["equipment_type_id"] for et in equipment_types]
        assert len(ids) == len(set(ids)), (
            f"Duplicate equipment_type_ids found: "
            f"{[x for x in ids if ids.count(x) > 1]}"
        )

    def test_no_duplicate_component_type_ids(self, component_types):
        """All component_type_id values must be unique."""
        ids = [ct["component_type_id"] for ct in component_types]
        assert len(ids) == len(set(ids)), (
            f"Duplicate component_type_ids found: "
            f"{[x for x in ids if ids.count(x) > 1]}"
        )

    def test_no_duplicate_component_type_names(self, component_types):
        """All component_type (name) values must be unique."""
        names = [ct["component_type"] for ct in component_types]
        assert len(names) == len(set(names)), (
            f"Duplicate component_type names found: "
            f"{[x for x in names if names.count(x) > 1]}"
        )


# ===================================================================
# 4. REQUIRED FIELDS ON EQUIPMENT TYPES
# ===================================================================
class TestEquipmentRequiredFields:
    """Every equipment type must have the essential fields."""

    REQUIRED_EQUIPMENT_FIELDS = [
        "equipment_type_id",
        "name",
        "category",
        "tag_convention",
        "manufacturers",
        "sub_assemblies",
    ]

    def test_all_equipment_types_have_required_fields(self, equipment_types):
        """Each equipment type has tag_convention, manufacturers, sub_assemblies."""
        for et in equipment_types:
            for field in self.REQUIRED_EQUIPMENT_FIELDS:
                assert field in et, (
                    f"Equipment type '{et.get('name', 'UNKNOWN')}' "
                    f"missing required field '{field}'"
                )

    def test_equipment_manufacturers_nonempty(self, equipment_types):
        """Each equipment type must list at least one manufacturer."""
        for et in equipment_types:
            assert len(et["manufacturers"]) >= 1, (
                f"Equipment '{et['name']}' has no manufacturers"
            )

    def test_equipment_sub_assemblies_nonempty(self, equipment_types):
        """Each equipment type must have at least one sub-assembly."""
        for et in equipment_types:
            assert len(et["sub_assemblies"]) >= 1, (
                f"Equipment '{et['name']}' has no sub_assemblies"
            )


# ===================================================================
# 5. SUB-ASSEMBLIES HAVE AT LEAST 1 MAINTAINABLE ITEM
# ===================================================================
class TestSubAssemblyStructure:

    def test_sub_assemblies_have_maintainable_items(self, equipment_types):
        """Every sub-assembly must contain at least one maintainable item."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                items = sa.get("maintainable_items", [])
                assert len(items) >= 1, (
                    f"Equipment '{et['name']}' -> sub-assembly '{sa['name']}' "
                    f"has no maintainable_items"
                )

    def test_maintainable_items_have_failure_modes(self, equipment_types):
        """Every maintainable item must define at least one failure mode."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    fms = mi.get("failure_modes", [])
                    assert len(fms) >= 1, (
                        f"Equipment '{et['name']}' -> '{sa['name']}' -> "
                        f"'{mi['name']}' has no failure_modes"
                    )


# ===================================================================
# 6. CRITICALITY CLASS VALIDATION
# ===================================================================
class TestCriticalityClass:

    def test_all_criticality_classes_valid(self, equipment_types):
        """All criticality_class values must be one of AA, A+, A, B, C, D."""
        for et in equipment_types:
            crit = et.get("criticality_class")
            assert crit in VALID_CRITICALITY_CLASSES, (
                f"Equipment '{et['name']}' has invalid criticality_class: "
                f"'{crit}'. Must be one of {VALID_CRITICALITY_CLASSES}"
            )


# ===================================================================
# 7. EQUIPMENT FAILURE MODES -- MECHANISM VALIDATION
# ===================================================================
class TestEquipmentFailureModes:

    def test_equipment_fm_mechanisms_valid(self, equipment_types):
        """All failure mode mechanisms in equipment library must be valid
        Mechanism enum values."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        mech = fm["mechanism"]
                        assert mech in VALID_MECHANISMS, (
                            f"Equipment '{et['name']}' -> '{mi['name']}': "
                            f"invalid mechanism '{mech}'. "
                            f"Valid: {sorted(VALID_MECHANISMS)}"
                        )

    def test_equipment_fm_causes_valid(self, equipment_types):
        """All failure mode causes in equipment library must be valid
        Cause enum values."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        cause = fm["cause"]
                        assert cause in VALID_CAUSES, (
                            f"Equipment '{et['name']}' -> '{mi['name']}': "
                            f"invalid cause '{cause}'. "
                            f"Valid: {sorted(VALID_CAUSES)}"
                        )

    def test_equipment_fm_combinations_valid(self, equipment_types):
        """All (mechanism, cause) pairs in equipment library must be in the
        72-combo VALID_FM_COMBINATIONS table."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        pair = (fm["mechanism"], fm["cause"])
                        assert pair in VALID_FM_PAIRS, (
                            f"Equipment '{et['name']}' -> '{mi['name']}': "
                            f"invalid FM combination "
                            f"({fm['mechanism']}, {fm['cause']}). "
                            f"Not in 72-combo table."
                        )

    def test_equipment_fm_weibull_beta_positive(self, equipment_types):
        """All Weibull beta (shape) parameters must be > 0."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        beta = fm.get("weibull_beta")
                        if beta is not None:
                            assert beta > 0, (
                                f"Equipment '{et['name']}' -> '{mi['name']}': "
                                f"weibull_beta must be > 0, got {beta}"
                            )

    def test_equipment_fm_weibull_eta_positive(self, equipment_types):
        """All Weibull eta (characteristic life) parameters must be > 0."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        eta = fm.get("weibull_eta")
                        if eta is not None:
                            assert eta > 0, (
                                f"Equipment '{et['name']}' -> '{mi['name']}': "
                                f"weibull_eta must be > 0, got {eta}"
                            )


# ===================================================================
# 8. EQUIPMENT TASK TYPE VALIDATION
# ===================================================================
class TestEquipmentTaskTypes:

    def test_equipment_task_types_valid(self, equipment_types):
        """All task_type values in equipment failure modes must be valid
        TaskType enum values."""
        for et in equipment_types:
            for sa in et["sub_assemblies"]:
                for mi in sa.get("maintainable_items", []):
                    for fm in mi.get("failure_modes", []):
                        tt = fm.get("task_type")
                        if tt is not None:
                            assert tt in VALID_TASK_TYPES, (
                                f"Equipment '{et['name']}' -> '{mi['name']}': "
                                f"invalid task_type '{tt}'. "
                                f"Valid: {sorted(VALID_TASK_TYPES)}"
                            )


# ===================================================================
# 9. COMPONENT LIBRARY VALIDATION
# ===================================================================
class TestComponentLibrary:

    REQUIRED_COMPONENT_FIELDS = [
        "component_type_id",
        "component_type",
        "category",
        "description",
        "manufacturers",
        "failure_modes",
        "standard_tasks",
    ]

    def test_component_types_have_required_fields(self, component_types):
        """Each component type must have all required fields."""
        for ct in component_types:
            for field in self.REQUIRED_COMPONENT_FIELDS:
                assert field in ct, (
                    f"Component '{ct.get('component_type', 'UNKNOWN')}' "
                    f"missing required field '{field}'"
                )

    def test_component_manufacturers_nonempty(self, component_types):
        """Each component type must list at least one manufacturer."""
        for ct in component_types:
            assert len(ct["manufacturers"]) >= 1, (
                f"Component '{ct['component_type']}' has no manufacturers"
            )

    def test_component_fm_mechanisms_valid(self, component_types):
        """All failure mode mechanisms in component library must be valid."""
        for ct in component_types:
            for fm in ct["failure_modes"]:
                mech = fm["mechanism"]
                assert mech in VALID_MECHANISMS, (
                    f"Component '{ct['component_type']}': "
                    f"invalid mechanism '{mech}'"
                )

    def test_component_fm_causes_valid(self, component_types):
        """All failure mode causes in component library must be valid."""
        for ct in component_types:
            for fm in ct["failure_modes"]:
                cause = fm["cause"]
                assert cause in VALID_CAUSES, (
                    f"Component '{ct['component_type']}': "
                    f"invalid cause '{cause}'"
                )

    def test_component_fm_combinations_valid(self, component_types):
        """All (mechanism, cause) pairs in component library must be in the
        72-combo VALID_FM_COMBINATIONS table."""
        for ct in component_types:
            for fm in ct["failure_modes"]:
                pair = (fm["mechanism"], fm["cause"])
                assert pair in VALID_FM_PAIRS, (
                    f"Component '{ct['component_type']}': "
                    f"invalid FM combination ({fm['mechanism']}, {fm['cause']})"
                )

    def test_component_fm_weibull_beta_positive(self, component_types):
        """All Weibull beta parameters in component library must be > 0."""
        for ct in component_types:
            for fm in ct["failure_modes"]:
                beta = fm.get("weibull_beta")
                if beta is not None:
                    assert beta > 0, (
                        f"Component '{ct['component_type']}': "
                        f"weibull_beta must be > 0, got {beta}"
                    )

    def test_component_fm_weibull_eta_positive(self, component_types):
        """All Weibull eta_hours parameters in component library must be > 0."""
        for ct in component_types:
            for fm in ct["failure_modes"]:
                eta = fm.get("weibull_eta_hours")
                if eta is not None:
                    assert eta > 0, (
                        f"Component '{ct['component_type']}': "
                        f"weibull_eta_hours must be > 0, got {eta}"
                    )

    def test_component_standard_tasks_have_valid_types(self, component_types):
        """All standard_tasks must have valid task_type values."""
        for ct in component_types:
            for task in ct["standard_tasks"]:
                tt = task["task_type"]
                assert tt in VALID_TASK_TYPES, (
                    f"Component '{ct['component_type']}': "
                    f"invalid task_type '{tt}' in standard_tasks. "
                    f"Valid: {sorted(VALID_TASK_TYPES)}"
                )

    def test_component_standard_tasks_have_frequency(self, component_types):
        """All standard_tasks must have a positive frequency_weeks value."""
        for ct in component_types:
            for task in ct["standard_tasks"]:
                freq = task.get("frequency_weeks")
                assert freq is not None and freq > 0, (
                    f"Component '{ct['component_type']}': "
                    f"standard_task '{task.get('description', '')}' "
                    f"must have frequency_weeks > 0, got {freq}"
                )
