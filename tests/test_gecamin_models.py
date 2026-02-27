"""Tests for GECAMIN extension models and Neuro-Architecture models."""

import pytest
from datetime import date, datetime

from tools.models.schemas import (
    AssetHealthScore,
    CAPAItem,
    CAPAStatus,
    CAPAType,
    CompletionProgress,
    ExpertCard,
    ExpertDomain,
    FailurePrediction,
    HealthDimension,
    HealthScoreDimension,
    IpsativeFeedback,
    KPIMetrics,
    Language,
    ManagementReviewSummary,
    PDCAPhase,
    PlantMetricSnapshot,
    PlantVarianceAlert,
    StakeholderRole,
    VarianceLevel,
    WeibullParameters,
)


class TestAssetHealthScore:
    def test_composite_auto_calculated(self):
        score = AssetHealthScore(
            node_id="n1", plant_id="P1", equipment_tag="TAG-001",
            dimensions=[
                HealthScoreDimension(dimension=HealthDimension.CRITICALITY, score=80, weight=0.5),
                HealthScoreDimension(dimension=HealthDimension.BACKLOG_PRESSURE, score=60, weight=0.5),
            ],
        )
        assert score.composite_score == 70.0

    def test_health_class_healthy(self):
        score = AssetHealthScore(
            node_id="n1", plant_id="P1", equipment_tag="TAG-001",
            dimensions=[
                HealthScoreDimension(dimension=HealthDimension.CRITICALITY, score=90, weight=1.0),
            ],
        )
        assert score.health_class == "HEALTHY"

    def test_health_class_critical(self):
        score = AssetHealthScore(
            node_id="n1", plant_id="P1", equipment_tag="TAG-001",
            dimensions=[
                HealthScoreDimension(dimension=HealthDimension.CRITICALITY, score=20, weight=1.0),
            ],
        )
        assert score.health_class == "CRITICAL"

    def test_health_class_unknown_no_dimensions(self):
        score = AssetHealthScore(
            node_id="n1", plant_id="P1", equipment_tag="TAG-001",
            dimensions=[],
        )
        assert score.health_class == "UNKNOWN"


class TestWeibullParameters:
    def test_valid_params(self):
        p = WeibullParameters(beta=2.0, eta=100.0, r_squared=0.95, sample_size=20)
        assert p.beta == 2.0
        assert p.eta == 100.0

    def test_beta_must_be_positive(self):
        with pytest.raises(Exception):
            WeibullParameters(beta=0, eta=100.0)

    def test_eta_must_be_positive(self):
        with pytest.raises(Exception):
            WeibullParameters(beta=2.0, eta=0)


class TestFailurePrediction:
    def test_default_draft(self):
        pred = FailurePrediction(
            equipment_id="EQ-001", equipment_tag="TAG-001",
            weibull_params=WeibullParameters(beta=2.0, eta=100.0),
            current_age_days=50.0,
            reliability_current=0.8,
            predicted_failure_window_days=60.0,
        )
        assert pred.status.value == "DRAFT"


class TestPlantVarianceAlert:
    def test_auto_classify_critical(self):
        alert = PlantVarianceAlert(
            plant_id="P1", plant_name="Plant 1",
            metric_name="avail", plant_value=60, portfolio_mean=90,
            portfolio_std=8, z_score=-3.75,
            variance_level=VarianceLevel.NORMAL,  # Will be overridden
        )
        assert alert.variance_level == VarianceLevel.CRITICAL

    def test_auto_classify_warning(self):
        alert = PlantVarianceAlert(
            plant_id="P1", plant_name="Plant 1",
            metric_name="avail", plant_value=75, portfolio_mean=90,
            portfolio_std=6, z_score=-2.5,
            variance_level=VarianceLevel.NORMAL,
        )
        assert alert.variance_level == VarianceLevel.WARNING

    def test_auto_classify_normal(self):
        alert = PlantVarianceAlert(
            plant_id="P1", plant_name="Plant 1",
            metric_name="avail", plant_value=89, portfolio_mean=90,
            portfolio_std=5, z_score=-0.2,
            variance_level=VarianceLevel.CRITICAL,  # Will be overridden to NORMAL
        )
        assert alert.variance_level == VarianceLevel.NORMAL


class TestKPIMetrics:
    def test_valid_metrics(self):
        kpi = KPIMetrics(
            plant_id="P1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            mtbf_days=45.0, mttr_hours=6.0,
            availability_pct=92.5, oee_pct=85.0,
        )
        assert kpi.availability_pct == 92.5

    def test_availability_bounded(self):
        with pytest.raises(Exception):
            KPIMetrics(
                plant_id="P1",
                period_start=date(2025, 1, 1),
                period_end=date(2025, 6, 30),
                availability_pct=150.0,
            )


class TestCAPAItem:
    def test_verified_requires_effectiveness(self):
        with pytest.raises(Exception):
            CAPAItem(
                capa_type=CAPAType.CORRECTIVE, title="T", description="D",
                plant_id="P1", source="test",
                status=CAPAStatus.VERIFIED,
                effectiveness_verified=False,
            )

    def test_closed_requires_timestamp(self):
        with pytest.raises(Exception):
            CAPAItem(
                capa_type=CAPAType.CORRECTIVE, title="T", description="D",
                plant_id="P1", source="test",
                status=CAPAStatus.CLOSED,
                closed_at=None,
            )

    def test_valid_capa(self):
        capa = CAPAItem(
            capa_type=CAPAType.PREVENTIVE, title="Add sensors",
            description="Install vibration sensors",
            plant_id="P1", source="review",
        )
        assert capa.status == CAPAStatus.OPEN
        assert capa.current_phase == PDCAPhase.PLAN


class TestExpertCard:
    def test_valid_expert(self):
        expert = ExpertCard(
            user_id="u-001", name="Ahmed Ben Salem",
            role=StakeholderRole.RELIABILITY_ENGINEER,
            plant_id="OCP-JFC1",
            domains=[ExpertDomain.RELIABILITY, ExpertDomain.MECHANICAL],
            equipment_expertise=["BRY-SAG-ML-001", "BRY-CRU-001"],
            certifications=["CMRP", "ISO 55001 Auditor"],
            years_experience=15,
            languages=[Language.FR, Language.EN, Language.AR],
        )
        assert expert.role == StakeholderRole.RELIABILITY_ENGINEER
        assert len(expert.domains) == 2
        assert len(expert.languages) == 3


class TestIpsativeFeedback:
    def test_improvement_calculated(self):
        fb = IpsativeFeedback(
            user_id="u-001", metric_name="planning_time_min",
            current_value=15.0, previous_value=20.0,
            period="this_week",
        )
        assert fb.improvement_pct == -25.0  # 25% reduction (negative = improved for time)

    def test_zero_previous(self):
        fb = IpsativeFeedback(
            user_id="u-001", metric_name="tasks_completed",
            current_value=5.0, previous_value=0.0,
        )
        assert fb.improvement_pct == 0.0  # Can't divide by zero


class TestCompletionProgress:
    def test_auto_percentage(self):
        cp = CompletionProgress(
            entity_type="Strategy", entity_id="s-001",
            entity_name="SAG Mill Strategy",
            total_steps=10, completed_steps=7,
        )
        assert cp.completion_pct == 70.0

    def test_complete(self):
        cp = CompletionProgress(
            entity_type="FMEA", entity_id="f-001",
            entity_name="Belt Conveyor FMEA",
            total_steps=5, completed_steps=5,
        )
        assert cp.completion_pct == 100.0

    def test_overcomplete_rejected(self):
        with pytest.raises(Exception):
            CompletionProgress(
                entity_type="WP", entity_id="w-001",
                entity_name="WP Test",
                total_steps=5, completed_steps=6,
            )
