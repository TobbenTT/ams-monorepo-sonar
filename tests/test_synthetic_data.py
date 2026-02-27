"""
Test Suite: Synthetic Data Generator (GAP-6 + OPP-3)
Validates phosphate-realistic data generation at scale.
"""

import pytest

from tools.generators.synthetic_data import SyntheticDataGenerator


@pytest.fixture
def generator():
    return SyntheticDataGenerator(seed=42)


class TestPlantHierarchyGeneration:
    def test_generates_all_levels(self, generator):
        nodes = generator.generate_plant_hierarchy()
        types = {n["node_type"] for n in nodes}
        assert "PLANT" in types
        assert "AREA" in types
        assert "SYSTEM" in types
        assert "EQUIPMENT" in types
        assert "SUB_ASSEMBLY" in types
        assert "MAINTAINABLE_ITEM" in types

    def test_single_plant_root(self, generator):
        nodes = generator.generate_plant_hierarchy()
        plants = [n for n in nodes if n["node_type"] == "PLANT"]
        assert len(plants) == 1

    def test_default_8_areas(self, generator):
        nodes = generator.generate_plant_hierarchy()
        areas = [n for n in nodes if n["node_type"] == "AREA"]
        assert len(areas) == 8

    def test_custom_area_count(self, generator):
        nodes = generator.generate_plant_hierarchy(num_areas=3)
        areas = [n for n in nodes if n["node_type"] == "AREA"]
        assert len(areas) == 3

    def test_parent_child_consistency(self, generator):
        nodes = generator.generate_plant_hierarchy()
        node_ids = {n["node_id"] for n in nodes}
        for node in nodes:
            if node["parent_node_id"] is not None:
                assert node["parent_node_id"] in node_ids, \
                    f"Node {node['name']} references parent {node['parent_node_id']} that doesn't exist"

    def test_unique_codes(self, generator):
        nodes = generator.generate_plant_hierarchy()
        codes = [n["code"] for n in nodes]
        assert len(codes) == len(set(codes)), "Duplicate codes found"

    def test_equipment_has_metadata(self, generator):
        nodes = generator.generate_plant_hierarchy()
        equipment = [n for n in nodes if n["node_type"] == "EQUIPMENT"]
        for eq in equipment:
            assert "criticality" in eq
            assert "manufacturer" in eq
            assert "tag" in eq

    def test_generates_hundreds_of_nodes(self, generator):
        nodes = generator.generate_plant_hierarchy()
        assert len(nodes) > 100  # Full phosphate plant should have many nodes

    def test_phosphate_specific_equipment(self, generator):
        nodes = generator.generate_plant_hierarchy()
        equipment = [n for n in nodes if n["node_type"] == "EQUIPMENT"]
        names = [eq["name"] for eq in equipment]
        # Should contain phosphate-specific equipment
        assert any("SAG Mill" in n for n in names)
        assert any("Slurry Pump" in n for n in names)
        assert any("Conveyor" in n or "Belt" in n for n in names)


class TestFailureModeGeneration:
    def test_generates_failure_modes(self, generator):
        nodes = generator.generate_plant_hierarchy()
        fms = generator.generate_failure_modes(nodes)
        assert len(fms) > 0

    def test_failure_modes_have_required_fields(self, generator):
        nodes = generator.generate_plant_hierarchy()
        fms = generator.generate_failure_modes(nodes)
        for fm in fms:
            assert "what" in fm
            assert "mechanism" in fm
            assert "cause" in fm
            assert "strategy_type" in fm

    def test_failure_modes_link_to_nodes(self, generator):
        nodes = generator.generate_plant_hierarchy()
        node_ids = {n["node_id"] for n in nodes}
        fms = generator.generate_failure_modes(nodes)
        for fm in fms:
            assert fm["node_id"] in node_ids


class TestWorkOrderHistoryGeneration:
    def test_generates_work_orders(self, generator):
        nodes = generator.generate_plant_hierarchy()
        wos = generator.generate_work_order_history(nodes, months=12)
        assert len(wos) > 0

    def test_work_order_fields(self, generator):
        nodes = generator.generate_plant_hierarchy()
        wos = generator.generate_work_order_history(nodes, months=6)
        for wo in wos:
            assert "work_order_id" in wo
            assert "equipment_tag" in wo
            assert "priority" in wo
            assert wo["priority"] in ("1", "2", "3", "4")


class TestStatistics:
    def test_statistics_correct(self, generator):
        nodes = generator.generate_plant_hierarchy()
        stats = generator.get_statistics(nodes)
        assert stats["total_nodes"] == len(nodes)
        assert sum(stats["by_type"].values()) == len(nodes)


class TestReproducibility:
    def test_same_seed_same_output(self):
        gen1 = SyntheticDataGenerator(seed=123)
        gen2 = SyntheticDataGenerator(seed=123)
        nodes1 = gen1.generate_plant_hierarchy()
        nodes2 = gen2.generate_plant_hierarchy()
        assert len(nodes1) == len(nodes2)
        for n1, n2 in zip(nodes1, nodes2):
            assert n1["name"] == n2["name"]
            assert n1["code"] == n2["code"]
