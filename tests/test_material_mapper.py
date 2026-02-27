"""
Test Suite: Material BOM ↔ Failure Mode Mapper (OPP-5)
Validates material suggestions from failure modes.
"""

import pytest

from tools.engines.material_mapper import MaterialMapper, DEFAULT_MATERIAL_MAPPINGS


@pytest.fixture
def mapper_with_bom():
    bom = {
        "EQ-SAG-001": [
            {"material_code": "MAT-BRG-22340", "description": "SKF 22340 Bearing", "component_type": "Bearing"},
            {"material_code": "MAT-SEAL-001", "description": "Mechanical Seal Kit", "component_type": "Seal"},
        ],
    }
    return MaterialMapper(bom_registry=bom)


@pytest.fixture
def mapper_no_bom():
    return MaterialMapper()


class TestBOMBasedSuggestions:
    def test_bom_match_high_confidence(self, mapper_with_bom):
        suggestions = mapper_with_bom.suggest_materials("Bearing", "WORN", equipment_id="EQ-SAG-001")
        bom_suggestions = [s for s in suggestions if s.confidence >= 0.9]
        assert len(bom_suggestions) >= 1
        assert bom_suggestions[0].material_code == "MAT-BRG-22340"

    def test_bom_seal_match(self, mapper_with_bom):
        suggestions = mapper_with_bom.suggest_materials("Seal", "LEAKING", equipment_id="EQ-SAG-001")
        bom_suggestions = [s for s in suggestions if s.confidence >= 0.9]
        assert len(bom_suggestions) >= 1


class TestDefaultMappings:
    def test_bearing_worn_materials(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Bearing", "WORN")
        assert len(suggestions) >= 1
        descs = [s.description for s in suggestions]
        assert any("bearing" in d.lower() for d in descs)

    def test_impeller_worn_materials(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Impeller", "WORN")
        assert len(suggestions) >= 1
        descs = [s.description for s in suggestions]
        assert any("impeller" in d.lower() for d in descs)

    def test_filter_blocked(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Filter", "BLOCKED")
        assert len(suggestions) >= 1

    def test_gearbox_leaking(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Gearbox", "LEAKING")
        assert len(suggestions) >= 1
        descs = [s.description for s in suggestions]
        assert any("seal" in d.lower() for d in descs)


class TestGenericFallback:
    def test_unknown_component_gets_generic(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Sprocket", "WORN")
        assert len(suggestions) >= 1
        assert suggestions[0].confidence <= 0.5

    def test_mechanism_without_replacement(self, mapper_no_bom):
        suggestions = mapper_no_bom.suggest_materials("Unknown", "LOOSE")
        # LOOSE doesn't get a generic replacement
        assert len(suggestions) == 0


class TestTaskMaterialValidation:
    def test_t16_replace_needs_materials(self):
        warnings = MaterialMapper.validate_task_materials("REPLACE", [])
        assert any("T-16" in w for w in warnings)

    def test_t16_replace_with_materials_ok(self):
        warnings = MaterialMapper.validate_task_materials("REPLACE", [{"desc": "Bearing"}])
        assert not any("T-16" in w for w in warnings)

    def test_inspect_with_materials_info(self):
        warnings = MaterialMapper.validate_task_materials("INSPECT", [{"desc": "Something"}])
        assert any("INFO" in w for w in warnings)

    def test_inspect_without_materials_ok(self):
        warnings = MaterialMapper.validate_task_materials("INSPECT", [])
        assert len(warnings) == 0


class TestMappingCoverage:
    def test_common_components_covered(self):
        expected = {"Bearing", "Seal", "Impeller", "Liner", "Motor", "Coupling", "Filter", "Belt", "Gearbox"}
        actual = set(DEFAULT_MATERIAL_MAPPINGS.keys())
        assert expected.issubset(actual)
