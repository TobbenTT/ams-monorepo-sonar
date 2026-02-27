"""
Test Suite: Equipment Resolution Engine (GAP-5, M1)
Validates fuzzy matching, alias lookup, and TAG extraction.
"""

import pytest

from tools.engines.equipment_resolver import EquipmentResolver


@pytest.fixture
def equipment_registry():
    return [
        {
            "equipment_id": "EQ-SAG-001",
            "tag": "BRY-SAG-ML-001",
            "description": "SAG Mill Primary - 12m x 6m",
            "description_fr": "Broyeur SAG Primaire - 12m x 6m",
            "aliases": ["SAG MILL", "BROYEUR SAG", "SAG 1"],
        },
        {
            "equipment_id": "EQ-PMP-001",
            "tag": "PMP-SLP-001",
            "description": "Slurry Pump - Warman 750 VK",
            "description_fr": "Pompe à boue - Warman 750 VK",
            "aliases": ["POMPE A BOUE", "SLURRY PUMP 1", "WARMAN PUMP"],
        },
        {
            "equipment_id": "EQ-CVR-001",
            "tag": "CVY-CVR-001",
            "description": "Belt Conveyor - Main Ore Transport",
            "description_fr": "Convoyeur à bande - Transport minerai principal",
            "aliases": ["CONVOYEUR PRINCIPAL", "MAIN CONVEYOR"],
        },
    ]


@pytest.fixture
def resolver(equipment_registry):
    return EquipmentResolver(equipment_registry)


class TestExactMatch:
    def test_exact_tag(self, resolver):
        result = resolver.resolve("BRY-SAG-ML-001")
        assert result is not None
        assert result.confidence == 1.0
        assert result.method == "EXACT_MATCH"
        assert result.equipment_id == "EQ-SAG-001"

    def test_exact_tag_case_insensitive(self, resolver):
        result = resolver.resolve("bry-sag-ml-001")
        assert result is not None
        assert result.confidence == 1.0

    def test_tag_extraction_from_text(self, resolver):
        result = resolver.resolve("Le broyeur BRY-SAG-ML-001 a un problème")
        assert result is not None
        assert result.equipment_tag == "BRY-SAG-ML-001"
        assert result.confidence == 0.95


class TestAliasMatch:
    def test_alias_french(self, resolver):
        result = resolver.resolve("BROYEUR SAG")
        assert result is not None
        assert result.method == "ALIAS_MATCH"
        assert result.confidence == 0.90
        assert result.equipment_id == "EQ-SAG-001"

    def test_alias_english(self, resolver):
        result = resolver.resolve("SLURRY PUMP 1")
        assert result is not None
        assert result.equipment_id == "EQ-PMP-001"

    def test_alias_commercial_name(self, resolver):
        result = resolver.resolve("WARMAN PUMP")
        assert result is not None
        assert result.equipment_id == "EQ-PMP-001"


class TestFuzzyMatch:
    def test_close_tag(self, resolver):
        result = resolver.resolve("BRY-SAG-ML-002")
        assert result is not None
        assert result.method == "FUZZY_MATCH"
        assert result.confidence >= 0.7

    def test_description_match(self, resolver):
        result = resolver.resolve("la pompe à boue Warman")
        assert result is not None
        # Should match the slurry pump via description


class TestNoMatch:
    def test_completely_unrelated(self, resolver):
        result = resolver.resolve("XYZ-123-UNKNOWN")
        # May return None or low confidence match
        if result is not None:
            assert result.confidence < 0.9

    def test_empty_input(self, resolver):
        result = resolver.resolve("")
        # Should not crash


class TestAlternatives:
    def test_alternatives_provided(self, resolver):
        result = resolver.resolve("BRY-SAG-ML-002")
        if result and result.alternatives:
            for alt in result.alternatives:
                assert "equipment_id" in alt
                assert "tag" in alt
                assert "confidence" in alt
