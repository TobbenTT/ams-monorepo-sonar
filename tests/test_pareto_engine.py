"""Tests for Pareto Analysis Engine — Phase 5."""

from tools.engines.pareto_engine import ParetoEngine


class TestAnalyze:

    def test_80_20_split(self):
        data = [
            {"equipment_id": f"EQ-{i+1}", "equipment_tag": f"TAG-{i+1}", "value": v}
            for i, v in enumerate([50, 30, 10, 5, 3, 1, 1])
        ]
        result = ParetoEngine.analyze("P1", data, "value", "test")
        assert result.bad_actor_count > 0
        assert result.bad_actor_count < len(data)

    def test_cumulative_100(self):
        data = [
            {"equipment_id": f"EQ-{i}", "equipment_tag": f"TAG-{i}", "value": 10}
            for i in range(5)
        ]
        result = ParetoEngine.analyze("P1", data, "value")
        assert result.items[-1].cumulative_pct == 100.0

    def test_ranked_descending(self):
        data = [
            {"equipment_id": "EQ-1", "equipment_tag": "T1", "value": 10},
            {"equipment_id": "EQ-2", "equipment_tag": "T2", "value": 50},
            {"equipment_id": "EQ-3", "equipment_tag": "T3", "value": 30},
        ]
        result = ParetoEngine.analyze("P1", data, "value")
        values = [i.metric_value for i in result.items]
        assert values == sorted(values, reverse=True)

    def test_empty_data(self):
        result = ParetoEngine.analyze("P1", [], "value")
        assert len(result.items) == 0
        assert result.bad_actor_count == 0


class TestAnalyzeFailures:

    def test_counts_by_equipment(self):
        records = [
            {"equipment_id": "EQ-1", "equipment_tag": "T1"},
            {"equipment_id": "EQ-1", "equipment_tag": "T1"},
            {"equipment_id": "EQ-1", "equipment_tag": "T1"},
            {"equipment_id": "EQ-2", "equipment_tag": "T2"},
        ]
        result = ParetoEngine.analyze_failures("P1", records)
        assert result.metric_type == "failures"
        assert result.items[0].equipment_id == "EQ-1"
        assert result.items[0].metric_value == 3


class TestAnalyzeCosts:

    def test_sums_by_equipment(self):
        records = [
            {"equipment_id": "EQ-1", "equipment_tag": "T1", "cost": 10000},
            {"equipment_id": "EQ-1", "equipment_tag": "T1", "cost": 5000},
            {"equipment_id": "EQ-2", "equipment_tag": "T2", "cost": 3000},
        ]
        result = ParetoEngine.analyze_costs("P1", records)
        assert result.metric_type == "cost"
        assert result.items[0].metric_value == 15000


class TestAnalyzeDowntime:

    def test_sums_downtime(self):
        records = [
            {"equipment_id": "EQ-1", "equipment_tag": "T1", "downtime_hours": 100},
            {"equipment_id": "EQ-2", "equipment_tag": "T2", "downtime_hours": 50},
        ]
        result = ParetoEngine.analyze_downtime("P1", records)
        assert result.metric_type == "downtime"
        assert len(result.items) == 2
