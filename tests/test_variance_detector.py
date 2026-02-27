"""Tests for VarianceDetector — REF-12 Rec 7: Multi-Plant Outlier Detection."""

import pytest
from datetime import date

from tools.engines.variance_detector import VarianceDetector
from tools.models.schemas import PlantMetricSnapshot, VarianceLevel


def make_snapshot(plant_id, plant_name, metric, value):
    return PlantMetricSnapshot(
        plant_id=plant_id,
        plant_name=plant_name,
        metric_name=metric,
        metric_value=value,
        period_start=date(2025, 1, 1),
        period_end=date(2025, 6, 30),
    )


class TestComputeStats:
    def test_basic_stats(self):
        mean, std = VarianceDetector.compute_stats([10, 20, 30])
        assert mean == 20.0
        assert std > 0

    def test_identical_values(self):
        mean, std = VarianceDetector.compute_stats([50, 50, 50])
        assert mean == 50.0
        assert std == 0.0

    def test_single_value(self):
        mean, std = VarianceDetector.compute_stats([42])
        assert mean == 42.0
        assert std == 0.0

    def test_empty(self):
        mean, std = VarianceDetector.compute_stats([])
        assert mean == 0.0
        assert std == 0.0


class TestZScore:
    def test_at_mean(self):
        assert VarianceDetector.z_score(50, 50, 10) == 0.0

    def test_one_sigma_above(self):
        assert VarianceDetector.z_score(60, 50, 10) == 1.0

    def test_two_sigma_below(self):
        assert VarianceDetector.z_score(30, 50, 10) == -2.0

    def test_zero_std(self):
        assert VarianceDetector.z_score(55, 50, 0) == 0.0


class TestDetectVariance:
    @pytest.fixture
    def normal_plants(self):
        """5 plants with similar availability."""
        return [
            make_snapshot("P1", "Plant 1", "availability", 92.0),
            make_snapshot("P2", "Plant 2", "availability", 91.0),
            make_snapshot("P3", "Plant 3", "availability", 93.0),
            make_snapshot("P4", "Plant 4", "availability", 90.0),
            make_snapshot("P5", "Plant 5", "availability", 91.5),
        ]

    @pytest.fixture
    def outlier_plants(self):
        """8 normal plants + 1 outlier (more plants = stable σ, clear detection)."""
        return [
            make_snapshot("P1", "Plant 1", "availability", 92.0),
            make_snapshot("P2", "Plant 2", "availability", 91.0),
            make_snapshot("P3", "Plant 3", "availability", 93.0),
            make_snapshot("P4", "Plant 4", "availability", 90.0),
            make_snapshot("P5", "Plant 5", "availability", 91.5),
            make_snapshot("P6", "Plant 6", "availability", 92.5),
            make_snapshot("P7", "Plant 7", "availability", 90.5),
            make_snapshot("P8", "Plant 8", "availability", 91.0),
            make_snapshot("P9", "Plant 9 (Outlier)", "availability", 60.0),  # Outlier!
        ]

    def test_no_alerts_for_normal(self, normal_plants):
        alerts = VarianceDetector.detect_variance(normal_plants)
        assert len(alerts) == 0

    def test_detects_outlier(self, outlier_plants):
        alerts = VarianceDetector.detect_variance(outlier_plants)
        assert len(alerts) >= 1
        outlier_alert = [a for a in alerts if a.plant_id == "P9"]
        assert len(outlier_alert) == 1
        assert outlier_alert[0].variance_level in (VarianceLevel.WARNING, VarianceLevel.CRITICAL)
        assert "below" in outlier_alert[0].message

    def test_too_few_plants(self):
        """Need at least 3 plants for statistics."""
        snaps = [
            make_snapshot("P1", "Plant 1", "mtbf", 100),
            make_snapshot("P2", "Plant 2", "mtbf", 50),
        ]
        alerts = VarianceDetector.detect_variance(snaps)
        assert len(alerts) == 0

    def test_critical_threshold(self):
        """Plant with >3σ deviation should be CRITICAL (15 plants like OCP)."""
        snaps = [
            make_snapshot(f"P{i}", f"Plant {i}", "mtbf", 100)
            for i in range(1, 15)
        ] + [
            make_snapshot("P15", "Plant 15", "mtbf", 10),  # Extreme outlier
        ]
        alerts = VarianceDetector.detect_variance(snaps)
        critical = [a for a in alerts if a.variance_level == VarianceLevel.CRITICAL]
        assert len(critical) >= 1

    def test_all_identical(self):
        """Identical values → no variance → no alerts."""
        snaps = [
            make_snapshot(f"P{i}", f"Plant {i}", "oee", 85.0)
            for i in range(5)
        ]
        alerts = VarianceDetector.detect_variance(snaps)
        assert len(alerts) == 0


class TestDetectMultiMetric:
    def test_multiple_metrics(self):
        """Test analyzing multiple metrics at once."""
        metrics = {
            "availability": [
                make_snapshot("P1", "Plant 1", "availability", 92),
                make_snapshot("P2", "Plant 2", "availability", 91),
                make_snapshot("P3", "Plant 3", "availability", 93),
                make_snapshot("P4", "Plant 4", "availability", 90),
                make_snapshot("P5", "Plant 5", "availability", 92),
                make_snapshot("P6", "Plant 6", "availability", 91),
                make_snapshot("P7", "Plant 7 (Outlier)", "availability", 50),  # Outlier
            ],
            "mtbf": [
                make_snapshot("P1", "Plant 1", "mtbf", 100),
                make_snapshot("P2", "Plant 2", "mtbf", 103),
                make_snapshot("P3", "Plant 3", "mtbf", 98),
                make_snapshot("P4", "Plant 4", "mtbf", 101),
                make_snapshot("P5", "Plant 5", "mtbf", 99),
                make_snapshot("P6", "Plant 6", "mtbf", 100),
                make_snapshot("P7", "Plant 7", "mtbf", 102),
            ],
        }
        alerts = VarianceDetector.detect_multi_metric(metrics)
        # Should have alerts for availability outlier but not for mtbf
        avail_alerts = [a for a in alerts if a.metric_name == "availability"]
        mtbf_alerts = [a for a in alerts if a.metric_name == "mtbf"]
        assert len(avail_alerts) >= 1
        assert len(mtbf_alerts) == 0


class TestRankPlants:
    def test_ranking(self):
        snaps = [
            make_snapshot("P1", "Plant 1", "oee", 80),
            make_snapshot("P2", "Plant 2", "oee", 95),
            make_snapshot("P3", "Plant 3", "oee", 70),
        ]
        ranking = VarianceDetector.rank_plants(snaps)
        assert ranking[0]["rank"] == 1
        assert ranking[0]["plant_id"] == "P2"
        assert ranking[2]["rank"] == 3
        assert ranking[2]["plant_id"] == "P3"
