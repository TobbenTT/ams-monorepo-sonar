"""Tests for ManagementReviewEngine — REF-12 Rec 8: ISO 55002 §9.3."""

import pytest
from datetime import date, datetime

from tools.engines.management_review_engine import ManagementReviewEngine
from tools.models.schemas import (
    AssetHealthScore,
    CAPAItem,
    CAPAStatus,
    CAPAType,
    HealthDimension,
    HealthScoreDimension,
    KPIMetrics,
    ManagementReviewSummary,
    PDCAPhase,
    PlantVarianceAlert,
    VarianceLevel,
)


@pytest.fixture
def sample_kpis():
    return KPIMetrics(
        plant_id="OCP-JFC1",
        period_start=date(2025, 1, 1),
        period_end=date(2025, 6, 30),
        mtbf_days=45.0,
        mttr_hours=6.0,
        availability_pct=92.5,
        oee_pct=85.0,
        schedule_compliance_pct=88.0,
        pm_compliance_pct=75.0,
        total_work_orders=120,
        corrective_wo_count=40,
        preventive_wo_count=80,
        reactive_ratio_pct=33.3,
    )


@pytest.fixture
def sample_health_scores():
    def make_score(tag, composite, health_class):
        return AssetHealthScore(
            node_id=f"node-{tag}",
            plant_id="OCP-JFC1",
            equipment_tag=tag,
            dimensions=[
                HealthScoreDimension(
                    dimension=HealthDimension.CRITICALITY,
                    score=composite,
                    weight=1.0,
                )
            ],
            composite_score=composite,
            health_class=health_class,
        )

    return [
        make_score("BRY-SAG-ML-001", 85.0, "HEALTHY"),
        make_score("BRY-CRU-001", 45.0, "CRITICAL"),
        make_score("BRY-PMP-001", 65.0, "AT_RISK"),
        make_score("BRY-BC-001", 78.0, "HEALTHY"),
    ]


@pytest.fixture
def sample_alerts():
    return [
        PlantVarianceAlert(
            plant_id="OCP-JFC1",
            plant_name="Jorf Fertilizer Complex 1",
            metric_name="availability",
            plant_value=78.0,
            portfolio_mean=91.0,
            portfolio_std=4.0,
            z_score=-3.25,
            variance_level=VarianceLevel.CRITICAL,
            message="Availability 3.25σ below mean",
        ),
    ]


@pytest.fixture
def sample_capas():
    capas = []
    # Open CAPA
    c1 = CAPAItem(
        capa_type=CAPAType.CORRECTIVE,
        title="Fix belt misalignment",
        description="Recurring issue",
        plant_id="OCP-JFC1",
        source="audit",
        status=CAPAStatus.OPEN,
        target_date=date(2025, 3, 1),  # Overdue
    )
    capas.append(c1)
    # In-progress CAPA
    c2 = CAPAItem(
        capa_type=CAPAType.PREVENTIVE,
        title="Add vibration sensors",
        description="CBM improvement",
        plant_id="OCP-JFC1",
        source="management_review",
        status=CAPAStatus.IN_PROGRESS,
        target_date=date(2025, 12, 31),
    )
    capas.append(c2)
    return capas


class TestGenerateReview:
    def test_basic_review(self, sample_kpis, sample_health_scores, sample_alerts, sample_capas):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            kpi_summary=sample_kpis,
            health_scores=sample_health_scores,
            variance_alerts=sample_alerts,
            capas=sample_capas,
        )
        assert isinstance(review, ManagementReviewSummary)
        assert review.plant_id == "OCP-JFC1"
        assert review.avg_health_score > 0
        assert review.open_capas == 2
        assert review.overdue_capas == 1
        assert len(review.key_findings) > 0
        assert len(review.recommended_actions) > 0

    def test_improving_trend(self, sample_kpis, sample_health_scores):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            health_scores=sample_health_scores,
            previous_avg_health=50.0,  # Previous was much lower
        )
        assert review.health_trend == "IMPROVING"

    def test_degrading_trend(self, sample_kpis, sample_health_scores):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            health_scores=sample_health_scores,
            previous_avg_health=95.0,  # Previous was much higher
        )
        assert review.health_trend == "DEGRADING"

    def test_stable_trend(self, sample_kpis, sample_health_scores):
        avg = sum(s.composite_score for s in sample_health_scores) / len(sample_health_scores)
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            health_scores=sample_health_scores,
            previous_avg_health=avg,
        )
        assert review.health_trend == "STABLE"

    def test_empty_review(self):
        """Should handle empty data gracefully."""
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
        )
        assert review.avg_health_score == 0.0
        assert review.open_capas == 0


class TestKPITrends:
    def test_kpi_trends_computed(self, sample_kpis):
        previous = KPIMetrics(
            plant_id="OCP-JFC1",
            period_start=date(2024, 7, 1),
            period_end=date(2024, 12, 31),
            mtbf_days=30.0,  # Was worse
            mttr_hours=8.0,  # Was worse
            availability_pct=88.0,  # Was worse
            schedule_compliance_pct=80.0,  # Was worse
            reactive_ratio_pct=45.0,  # Was worse
        )
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            kpi_summary=sample_kpis,
            previous_kpis=previous,
        )
        assert review.kpi_trends["mtbf"] == "IMPROVING"
        assert review.kpi_trends["mttr"] == "IMPROVING"
        assert review.kpi_trends["availability"] == "IMPROVING"
        assert review.kpi_trends["reactive_ratio"] == "IMPROVING"


class TestKeyFindings:
    def test_critical_assets_in_findings(self, sample_health_scores):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            health_scores=sample_health_scores,
        )
        # Should mention critical and at-risk counts
        health_finding = [f for f in review.key_findings if "critical" in f.lower()]
        assert len(health_finding) > 0

    def test_high_reactive_ratio_flagged(self, sample_kpis):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            kpi_summary=sample_kpis,
        )
        reactive_finding = [f for f in review.key_findings if "reactive" in f.lower()]
        assert len(reactive_finding) > 0


class TestRecommendedActions:
    def test_overdue_capas_action(self, sample_capas):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            capas=sample_capas,
        )
        overdue_actions = [a for a in review.recommended_actions if "overdue" in a.lower()]
        assert len(overdue_actions) > 0

    def test_critical_assets_action(self, sample_health_scores):
        review = ManagementReviewEngine.generate_review(
            plant_id="OCP-JFC1",
            period_start=date(2025, 1, 1),
            period_end=date(2025, 6, 30),
            health_scores=sample_health_scores,
        )
        critical_actions = [a for a in review.recommended_actions if "critical" in a.lower()]
        assert len(critical_actions) > 0
