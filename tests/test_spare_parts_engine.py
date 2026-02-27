"""Tests for Spare Parts Criticality Engine — Phase 5."""

from tools.engines.spare_parts_engine import SparePartsEngine
from tools.models.schemas import SparePartCriticality, ConsumptionClass, CostClass


class TestClassifyVED:

    def test_vital_critical_equipment(self):
        assert SparePartsEngine.classify_ved("HIGH", "PRODUCTION_STOP") == SparePartCriticality.VITAL

    def test_vital_safety_impact(self):
        assert SparePartsEngine.classify_ved("LOW", "SAFETY") == SparePartCriticality.VITAL

    def test_essential_medium(self):
        assert SparePartsEngine.classify_ved("MEDIUM", "PRODUCTION_REDUCED") == SparePartCriticality.ESSENTIAL

    def test_desirable_low(self):
        assert SparePartsEngine.classify_ved("LOW", "NONE") == SparePartCriticality.DESIRABLE


class TestClassifyFSN:

    def test_fast_moving(self):
        assert SparePartsEngine.classify_fsn(15) == ConsumptionClass.FAST_MOVING

    def test_slow_moving(self):
        assert SparePartsEngine.classify_fsn(6) == ConsumptionClass.SLOW_MOVING

    def test_non_moving(self):
        assert SparePartsEngine.classify_fsn(0) == ConsumptionClass.NON_MOVING

    def test_boundary_12(self):
        assert SparePartsEngine.classify_fsn(12) == ConsumptionClass.SLOW_MOVING


class TestClassifyABC:

    def test_abc_distribution(self):
        parts = [
            {"part_id": "P1", "annual_cost": 80000},
            {"part_id": "P2", "annual_cost": 10000},
            {"part_id": "P3", "annual_cost": 5000},
            {"part_id": "P4", "annual_cost": 3000},
            {"part_id": "P5", "annual_cost": 2000},
        ]
        results = SparePartsEngine.classify_abc(parts)
        abc_map = dict(results)
        assert abc_map["P1"] == CostClass.A_HIGH
        assert abc_map["P5"] == CostClass.C_LOW

    def test_empty_parts(self):
        assert SparePartsEngine.classify_abc([]) == []


class TestCriticalityScore:

    def test_vital_fast_a_scores_high(self):
        score = SparePartsEngine.calculate_criticality_score(
            SparePartCriticality.VITAL, ConsumptionClass.FAST_MOVING, CostClass.A_HIGH,
        )
        assert score == 100.0

    def test_desirable_non_c_scores_low(self):
        score = SparePartsEngine.calculate_criticality_score(
            SparePartCriticality.DESIRABLE, ConsumptionClass.NON_MOVING, CostClass.C_LOW,
        )
        assert score < 30


class TestStockLevels:

    def test_positive_consumption(self):
        result = SparePartsEngine.calculate_stock_levels(0.5, 30)
        assert result["reorder_point"] > 0
        assert result["max_stock"] >= result["reorder_point"]
        assert result["min_stock"] > 0

    def test_zero_consumption(self):
        result = SparePartsEngine.calculate_stock_levels(0, 30)
        assert result["reorder_point"] == 0


class TestOptimizeInventory:

    def test_full_optimization(self):
        parts = [
            {"part_id": "P1", "equipment_id": "EQ-1", "description": "Bearing",
             "equipment_criticality": "HIGH", "failure_impact": "PRODUCTION_STOP",
             "movements_per_year": 15, "annual_cost": 50000, "unit_cost": 500,
             "daily_consumption": 0.5, "lead_time_days": 30, "current_stock": 10},
            {"part_id": "P2", "equipment_id": "EQ-2", "description": "Seal",
             "equipment_criticality": "LOW", "failure_impact": "NONE",
             "movements_per_year": 0, "annual_cost": 1000, "unit_cost": 10,
             "daily_consumption": 0, "lead_time_days": 60, "current_stock": 5},
        ]
        result = SparePartsEngine.optimize_inventory("P1", parts)
        assert result.total_parts == 2
        assert len(result.results) == 2
        assert result.results[0].ved_class == SparePartCriticality.VITAL
        assert result.results[1].ved_class == SparePartCriticality.DESIRABLE
        assert result.total_inventory_value > 0
