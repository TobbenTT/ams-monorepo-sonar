"""Tests for Cross-Module Analytics Engine — Phase 6."""

from tools.engines.cross_module_engine import CrossModuleEngine, _pearson, _strength
from tools.models.schemas import CorrelationPoint, CorrelationType


class TestCorrelateCriticalityFailures:

    def test_basic_correlation(self):
        equipment = [
            {"equipment_id": "EQ-1", "criticality": "AA"},
            {"equipment_id": "EQ-2", "criticality": "B"},
            {"equipment_id": "EQ-3", "criticality": "D"},
        ]
        failures = [
            {"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"},
            {"equipment_id": "EQ-2"},
        ]
        result = CrossModuleEngine.correlate_criticality_failures(equipment, failures)
        assert result.correlation_type == CorrelationType.CRITICALITY_FAILURES
        assert len(result.data_points) == 3
        assert result.strength in ("NONE", "WEAK", "MODERATE", "STRONG")

    def test_no_failures(self):
        equipment = [{"equipment_id": "EQ-1", "criticality": "A"}]
        result = CrossModuleEngine.correlate_criticality_failures(equipment, [])
        assert len(result.data_points) == 1
        assert result.data_points[0].y_value == 0

    def test_empty_inputs(self):
        result = CrossModuleEngine.correlate_criticality_failures([], [])
        assert len(result.data_points) == 0


class TestCorrelateCostReliability:

    def test_basic_correlation(self):
        costs = [
            {"equipment_id": "EQ-1", "cost": 50000},
            {"equipment_id": "EQ-2", "cost": 10000},
        ]
        reliability = [
            {"equipment_id": "EQ-1", "mtbf_days": 30},
            {"equipment_id": "EQ-2", "mtbf_days": 180},
        ]
        result = CrossModuleEngine.correlate_cost_reliability(costs, reliability)
        assert result.correlation_type == CorrelationType.COST_RELIABILITY
        assert len(result.data_points) == 2

    def test_no_overlap(self):
        costs = [{"equipment_id": "EQ-1", "cost": 50000}]
        reliability = [{"equipment_id": "EQ-2", "mtbf_days": 100}]
        result = CrossModuleEngine.correlate_cost_reliability(costs, reliability)
        assert len(result.data_points) == 0


class TestCorrelateHealthBacklog:

    def test_basic_correlation(self):
        health = [
            {"equipment_id": "EQ-1", "composite_score": 30},
            {"equipment_id": "EQ-2", "composite_score": 90},
        ]
        backlog = [
            {"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"},
            {"equipment_id": "EQ-2"},
        ]
        result = CrossModuleEngine.correlate_health_backlog(health, backlog)
        assert result.correlation_type == CorrelationType.HEALTH_BACKLOG
        assert len(result.data_points) == 2


class TestFindBadActorOverlap:

    def test_overlap_all_three(self):
        jk = {"points": [{"equipment_id": "EQ-1", "zone": "ACUTE"}]}
        pareto = {"items": [{"equipment_id": "EQ-1", "is_bad_actor": True}]}
        rbi = {"assessments": [{"equipment_id": "EQ-1", "risk_level": "HIGH"}]}
        result = CrossModuleEngine.find_bad_actor_overlap(jk, pareto, rbi)
        assert "EQ-1" in result.overlap_all_three
        assert result.total_unique_bad_actors == 1

    def test_overlap_two(self):
        jk = {"points": [{"equipment_id": "EQ-1", "zone": "ACUTE"}]}
        pareto = {"items": [{"equipment_id": "EQ-1", "is_bad_actor": True}]}
        rbi = {"assessments": [{"equipment_id": "EQ-2", "risk_level": "HIGH"}]}
        result = CrossModuleEngine.find_bad_actor_overlap(jk, pareto, rbi)
        assert "EQ-1" in result.overlap_any_two
        assert "EQ-1" not in result.overlap_all_three

    def test_no_overlap(self):
        jk = {"points": [{"equipment_id": "EQ-1", "zone": "ACUTE"}]}
        pareto = {"items": [{"equipment_id": "EQ-2", "is_bad_actor": True}]}
        rbi = {"assessments": [{"equipment_id": "EQ-3", "risk_level": "HIGH"}]}
        result = CrossModuleEngine.find_bad_actor_overlap(jk, pareto, rbi)
        assert len(result.overlap_all_three) == 0
        assert len(result.overlap_any_two) == 0
        assert result.total_unique_bad_actors == 3

    def test_empty_inputs(self):
        result = CrossModuleEngine.find_bad_actor_overlap()
        assert result.total_unique_bad_actors == 0

    def test_priority_order(self):
        jk = {"points": [
            {"equipment_id": "EQ-1", "zone": "ACUTE"},
            {"equipment_id": "EQ-2", "zone": "ACUTE"},
        ]}
        pareto = {"items": [
            {"equipment_id": "EQ-1", "is_bad_actor": True},
            {"equipment_id": "EQ-3", "is_bad_actor": True},
        ]}
        rbi = {"assessments": [
            {"equipment_id": "EQ-1", "risk_level": "HIGH"},
        ]}
        result = CrossModuleEngine.find_bad_actor_overlap(jk, pareto, rbi)
        # EQ-1 is in all three → first in priority
        assert result.priority_action_list[0] == "EQ-1"


class TestGenerateCrossModuleSummary:

    def test_basic_summary(self):
        result = CrossModuleEngine.generate_cross_module_summary("PLANT-1")
        assert result.plant_id == "PLANT-1"
        assert isinstance(result.key_insights, list)

    def test_summary_with_correlations(self):
        corr = CrossModuleEngine.correlate_criticality_failures(
            [{"equipment_id": "EQ-1", "criticality": "AA"},
             {"equipment_id": "EQ-2", "criticality": "D"}],
            [{"equipment_id": "EQ-1"}, {"equipment_id": "EQ-1"}],
        )
        result = CrossModuleEngine.generate_cross_module_summary("PLANT-1", correlations=[corr])
        assert len(result.key_insights) > 0

    def test_summary_with_bad_actors(self):
        overlap = CrossModuleEngine.find_bad_actor_overlap(
            jackknife_result={"points": [{"equipment_id": "EQ-1", "zone": "ACUTE"}]},
        )
        result = CrossModuleEngine.generate_cross_module_summary(
            "PLANT-1", bad_actor_overlap=overlap,
        )
        assert any("bad actor" in i.lower() for i in result.key_insights)


class TestPearsonHelper:

    def test_two_points(self):
        points = [
            CorrelationPoint(equipment_id="A", x_value=1, y_value=2),
            CorrelationPoint(equipment_id="B", x_value=2, y_value=4),
        ]
        assert _pearson(points) == 1.0

    def test_single_point(self):
        points = [CorrelationPoint(equipment_id="A", x_value=1, y_value=2)]
        assert _pearson(points) == 0.0

    def test_constant_values(self):
        points = [
            CorrelationPoint(equipment_id="A", x_value=5, y_value=5),
            CorrelationPoint(equipment_id="B", x_value=5, y_value=5),
        ]
        assert _pearson(points) == 0.0


class TestStrengthHelper:

    def test_strong(self):
        assert _strength(0.8) == "STRONG"
        assert _strength(-0.75) == "STRONG"

    def test_moderate(self):
        assert _strength(0.5) == "MODERATE"

    def test_weak(self):
        assert _strength(0.25) == "WEAK"

    def test_none(self):
        assert _strength(0.1) == "NONE"
