"""Tests for Jack-Knife Diagram Engine — Phase 5."""

from tools.engines.jackknife_engine import JackKnifeEngine
from tools.models.schemas import JackKnifeZone


def _make_equipment_data():
    """Create test data with equipment in all 4 zones."""
    return [
        # ACUTE: low MTBF, high MTTR
        {"equipment_id": "EQ-1", "equipment_tag": "SAG-001",
         "failure_count": 20, "total_downtime_hours": 200, "operating_hours": 4000},
        # CHRONIC: low MTBF, low MTTR
        {"equipment_id": "EQ-2", "equipment_tag": "PMP-001",
         "failure_count": 20, "total_downtime_hours": 20, "operating_hours": 4000},
        # COMPLEX: high MTBF, high MTTR
        {"equipment_id": "EQ-3", "equipment_tag": "BLR-001",
         "failure_count": 2, "total_downtime_hours": 100, "operating_hours": 8760},
        # CONTROLLED: high MTBF, low MTTR
        {"equipment_id": "EQ-4", "equipment_tag": "FAN-001",
         "failure_count": 2, "total_downtime_hours": 4, "operating_hours": 8760},
    ]


class TestAnalyze:

    def test_classifies_all_zones(self):
        result = JackKnifeEngine.analyze("P1", _make_equipment_data())
        assert result.equipment_count == 4
        assert result.acute_count >= 1
        assert result.chronic_count >= 1
        assert result.complex_count >= 1
        assert result.controlled_count >= 1

    def test_zone_sum_equals_total(self):
        result = JackKnifeEngine.analyze("P1", _make_equipment_data())
        zone_sum = result.acute_count + result.chronic_count + result.complex_count + result.controlled_count
        assert zone_sum == result.equipment_count

    def test_empty_data(self):
        result = JackKnifeEngine.analyze("P1", [])
        assert result.equipment_count == 0
        assert len(result.points) == 0

    def test_single_equipment(self):
        data = [{"equipment_id": "EQ-1", "equipment_tag": "SAG",
                 "failure_count": 5, "total_downtime_hours": 50, "operating_hours": 8760}]
        result = JackKnifeEngine.analyze("P1", data)
        assert result.equipment_count == 1

    def test_zero_failures(self):
        data = [{"equipment_id": "EQ-1", "equipment_tag": "SAG",
                 "failure_count": 0, "total_downtime_hours": 0, "operating_hours": 8760}]
        result = JackKnifeEngine.analyze("P1", data)
        assert result.points[0].mtbf_days > 0
        assert result.points[0].mttr_hours == 0

    def test_mtbf_mttr_values(self):
        data = [{"equipment_id": "EQ-1", "equipment_tag": "SAG",
                 "failure_count": 10, "total_downtime_hours": 100, "operating_hours": 8760}]
        result = JackKnifeEngine.analyze("P1", data)
        point = result.points[0]
        assert point.mtbf_days == round(876 / 24, 1)
        assert point.mttr_hours == 10.0


class TestGetBadActors:

    def test_returns_acute_only(self):
        result = JackKnifeEngine.analyze("P1", _make_equipment_data())
        bad_actors = JackKnifeEngine.get_bad_actors(result)
        assert all(p.zone == JackKnifeZone.ACUTE for p in bad_actors)
        assert len(bad_actors) == result.acute_count
