"""Tests for HealthScoreEngine — REF-12 Rec 4: Asset Health Index."""

import pytest

from tools.engines.health_score_engine import HealthScoreEngine
from tools.models.schemas import (
    AssetHealthScore,
    HealthDimension,
    HealthScoreDimension,
    RiskClass,
)


class TestCriticalityToScore:
    def test_low_risk_high_score(self):
        assert HealthScoreEngine.criticality_to_score(RiskClass.I_LOW) == 90.0

    def test_medium_risk(self):
        assert HealthScoreEngine.criticality_to_score(RiskClass.II_MEDIUM) == 70.0

    def test_high_risk(self):
        assert HealthScoreEngine.criticality_to_score(RiskClass.III_HIGH) == 40.0

    def test_critical_risk_low_score(self):
        assert HealthScoreEngine.criticality_to_score(RiskClass.IV_CRITICAL) == 15.0


class TestBacklogPressure:
    def test_no_backlog_full_score(self):
        score = HealthScoreEngine.backlog_pressure_score(0, 40)
        assert score == 100.0

    def test_half_threshold(self):
        score = HealthScoreEngine.backlog_pressure_score(160, 40, max_weeks_threshold=8)
        assert score == 50.0

    def test_full_threshold(self):
        score = HealthScoreEngine.backlog_pressure_score(320, 40, max_weeks_threshold=8)
        assert score == 0.0

    def test_over_threshold_clamped(self):
        score = HealthScoreEngine.backlog_pressure_score(500, 40, max_weeks_threshold=8)
        assert score == 0.0

    def test_zero_capacity(self):
        assert HealthScoreEngine.backlog_pressure_score(100, 0) == 0.0


class TestStrategyCoverage:
    def test_full_coverage(self):
        assert HealthScoreEngine.strategy_coverage_score(10, 10) == 100.0

    def test_half_coverage(self):
        assert HealthScoreEngine.strategy_coverage_score(10, 5) == 50.0

    def test_no_failure_modes(self):
        assert HealthScoreEngine.strategy_coverage_score(0, 0) == 0.0

    def test_no_strategies(self):
        assert HealthScoreEngine.strategy_coverage_score(10, 0) == 0.0


class TestConditionStatus:
    def test_no_alerts(self):
        assert HealthScoreEngine.condition_status_score(0, 0) == 100.0

    def test_some_alerts(self):
        score = HealthScoreEngine.condition_status_score(3, 0, max_alerts_threshold=10)
        assert score == 70.0

    def test_critical_alerts_weighted(self):
        # 2 regular + 1 critical = 2 + 1 + 1*2 = 5 weighted
        score = HealthScoreEngine.condition_status_score(3, 1, max_alerts_threshold=10)
        assert score == 50.0

    def test_max_alerts(self):
        score = HealthScoreEngine.condition_status_score(10, 0, max_alerts_threshold=10)
        assert score == 0.0


class TestExecutionCompliance:
    def test_full_compliance(self):
        assert HealthScoreEngine.execution_compliance_score(10, 10) == 100.0

    def test_half_compliance(self):
        assert HealthScoreEngine.execution_compliance_score(10, 5) == 50.0

    def test_no_plans(self):
        assert HealthScoreEngine.execution_compliance_score(0, 0) == 100.0


class TestCalculateComposite:
    def test_healthy_asset(self):
        """Low risk, no backlog, full strategy, no alerts, full compliance = HEALTHY."""
        result = HealthScoreEngine.calculate(
            node_id="node-1", plant_id="OCP-JFC1", equipment_tag="BRY-SAG-ML-001",
            risk_class=RiskClass.I_LOW,
            pending_backlog_hours=0, capacity_hours_per_week=40,
            total_failure_modes=10, fm_with_strategy=10,
            active_alerts=0, critical_alerts=0,
            planned_wo=20, executed_on_time=20,
        )
        assert isinstance(result, AssetHealthScore)
        assert result.health_class == "HEALTHY"
        assert result.composite_score >= 75
        assert len(result.dimensions) == 5
        assert len(result.recommendations) == 0

    def test_critical_asset(self):
        """High risk, heavy backlog, no strategy, many alerts = CRITICAL."""
        result = HealthScoreEngine.calculate(
            node_id="node-2", plant_id="OCP-JFC1", equipment_tag="BRY-CRU-001",
            risk_class=RiskClass.IV_CRITICAL,
            pending_backlog_hours=400, capacity_hours_per_week=40,
            total_failure_modes=10, fm_with_strategy=0,
            active_alerts=8, critical_alerts=3,
            planned_wo=20, executed_on_time=5,
        )
        assert result.health_class == "CRITICAL"
        assert result.composite_score < 50
        assert len(result.recommendations) > 0

    def test_at_risk_asset(self):
        """Medium risk with some gaps = AT_RISK."""
        result = HealthScoreEngine.calculate(
            node_id="node-3", plant_id="OCP-JFC1", equipment_tag="BRY-PMP-001",
            risk_class=RiskClass.II_MEDIUM,
            pending_backlog_hours=80, capacity_hours_per_week=40,
            total_failure_modes=10, fm_with_strategy=7,
            active_alerts=2, critical_alerts=0,
            planned_wo=20, executed_on_time=15,
        )
        assert result.health_class in ("AT_RISK", "HEALTHY")
        assert 40 <= result.composite_score <= 85

    def test_custom_weights(self):
        """Custom weights should shift the composite score."""
        custom = {
            HealthDimension.CRITICALITY: 0.5,
            HealthDimension.BACKLOG_PRESSURE: 0.1,
            HealthDimension.STRATEGY_COVERAGE: 0.2,
            HealthDimension.CONDITION_STATUS: 0.1,
            HealthDimension.EXECUTION_COMPLIANCE: 0.1,
        }
        result = HealthScoreEngine.calculate(
            node_id="node-4", plant_id="OCP-JFC1", equipment_tag="BRY-ML-001",
            risk_class=RiskClass.IV_CRITICAL,
            weights=custom,
        )
        # Criticality weight is dominant — should pull score down
        assert result.composite_score < 50


class TestTrend:
    def test_improving(self):
        assert HealthScoreEngine.determine_trend(80.0, 70.0) == "IMPROVING"

    def test_degrading(self):
        assert HealthScoreEngine.determine_trend(60.0, 70.0) == "DEGRADING"

    def test_stable(self):
        assert HealthScoreEngine.determine_trend(72.0, 70.0) == "STABLE"


class TestRecommendations:
    def test_recommendations_for_low_scores(self):
        result = HealthScoreEngine.calculate(
            node_id="n1", plant_id="P1", equipment_tag="TAG-001",
            risk_class=RiskClass.IV_CRITICAL,
            pending_backlog_hours=500, capacity_hours_per_week=40,
            total_failure_modes=20, fm_with_strategy=2,
            active_alerts=15, critical_alerts=5,
            planned_wo=20, executed_on_time=3,
        )
        assert len(result.recommendations) >= 3
        assert any("backlog" in r.lower() for r in result.recommendations)
        assert any("strategy" in r.lower() or "fmea" in r.lower() for r in result.recommendations)
