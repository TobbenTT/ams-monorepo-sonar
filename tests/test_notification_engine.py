"""Tests for Notification Engine — Phase 6."""

from datetime import date, timedelta

from tools.engines.notification_engine import NotificationEngine
from tools.models.schemas import NotificationLevel, NotificationType


class TestCheckRBIOverdue:

    def test_overdue_generates_alert(self):
        assessments = [
            {"equipment_id": "EQ-1", "next_inspection_date": "2024-01-01", "risk_level": "HIGH"},
        ]
        alerts = NotificationEngine.check_rbi_overdue(assessments, as_of_date=date(2025, 1, 1))
        assert len(alerts) == 1
        assert alerts[0].notification_type == NotificationType.RBI_OVERDUE
        assert alerts[0].level == NotificationLevel.CRITICAL  # >90 days

    def test_not_overdue(self):
        assessments = [
            {"equipment_id": "EQ-1", "next_inspection_date": "2026-06-01"},
        ]
        alerts = NotificationEngine.check_rbi_overdue(assessments, as_of_date=date(2025, 1, 1))
        assert len(alerts) == 0

    def test_warning_level(self):
        yesterday = (date.today() - timedelta(days=10)).isoformat()
        assessments = [{"equipment_id": "EQ-1", "next_inspection_date": yesterday}]
        alerts = NotificationEngine.check_rbi_overdue(assessments)
        assert len(alerts) == 1
        assert alerts[0].level == NotificationLevel.WARNING

    def test_no_inspection_date(self):
        alerts = NotificationEngine.check_rbi_overdue([{"equipment_id": "EQ-1"}])
        assert len(alerts) == 0


class TestCheckKPIThresholds:

    def test_planning_kpi_breach(self):
        planning = {
            "kpis": [{"name": "wo_completion", "value": 50.0, "target": 90.0, "status": "BELOW_TARGET"}],
        }
        alerts = NotificationEngine.check_kpi_thresholds(planning_kpis=planning)
        assert len(alerts) == 1
        assert alerts[0].notification_type == NotificationType.KPI_BREACH

    def test_critical_kpi_breach(self):
        planning = {
            "kpis": [{"name": "wo_completion", "value": 40.0, "target": 90.0}],
        }
        alerts = NotificationEngine.check_kpi_thresholds(planning_kpis=planning)
        assert len(alerts) == 1
        assert alerts[0].level == NotificationLevel.CRITICAL  # < 70% of target

    def test_kpi_on_target_no_alert(self):
        planning = {
            "kpis": [{"name": "wo_completion", "value": 95.0, "target": 90.0, "status": "ON_TARGET"}],
        }
        alerts = NotificationEngine.check_kpi_thresholds(planning_kpis=planning)
        assert len(alerts) == 0

    def test_reliability_high_reactive(self):
        reliability = {"reactive_ratio_pct": 35.0}
        alerts = NotificationEngine.check_kpi_thresholds(reliability_kpis=reliability)
        assert len(alerts) == 1
        assert "reactive_ratio_pct" in alerts[0].title

    def test_reliability_low_availability(self):
        reliability = {"availability_pct": 70.0}
        alerts = NotificationEngine.check_kpi_thresholds(reliability_kpis=reliability)
        assert len(alerts) == 1

    def test_no_kpis(self):
        alerts = NotificationEngine.check_kpi_thresholds()
        assert len(alerts) == 0


class TestCheckEquipmentRisk:

    def test_critical_health(self):
        scores = [{"equipment_id": "EQ-1", "composite_score": 20, "health_class": "CRITICAL"}]
        alerts = NotificationEngine.check_equipment_risk(scores)
        assert len(alerts) == 1
        assert alerts[0].level == NotificationLevel.CRITICAL

    def test_healthy_no_alert(self):
        scores = [{"equipment_id": "EQ-1", "composite_score": 85}]
        alerts = NotificationEngine.check_equipment_risk(scores)
        assert len(alerts) == 0

    def test_custom_threshold(self):
        scores = [{"equipment_id": "EQ-1", "composite_score": 45}]
        alerts_critical = NotificationEngine.check_equipment_risk(scores, threshold="CRITICAL")
        alerts_at_risk = NotificationEngine.check_equipment_risk(scores, threshold="AT_RISK")
        assert len(alerts_critical) == 0
        assert len(alerts_at_risk) == 1


class TestCheckBacklogAging:

    def test_aging_item(self):
        old_date = (date.today() - timedelta(days=60)).isoformat()
        items = [{"work_order_id": "WO-1", "created_at": old_date}]
        alerts = NotificationEngine.check_backlog_aging(items, aging_threshold_days=30)
        assert len(alerts) == 1
        assert alerts[0].notification_type == NotificationType.BACKLOG_AGING

    def test_recent_item_no_alert(self):
        recent = (date.today() - timedelta(days=5)).isoformat()
        items = [{"work_order_id": "WO-1", "created_at": recent}]
        alerts = NotificationEngine.check_backlog_aging(items, aging_threshold_days=30)
        assert len(alerts) == 0

    def test_critical_aging(self):
        very_old = (date.today() - timedelta(days=100)).isoformat()
        items = [{"wo_id": "WO-1", "created_at": very_old}]
        alerts = NotificationEngine.check_backlog_aging(items, aging_threshold_days=30)
        assert alerts[0].level == NotificationLevel.CRITICAL


class TestCheckOverdueActions:

    def test_overdue_capa(self):
        capas = [{"capa_id": "CAPA-1", "target_date": "2024-06-01", "status": "OPEN"}]
        alerts = NotificationEngine.check_overdue_actions(
            capas=capas, as_of_date=date(2025, 1, 1),
        )
        assert len(alerts) == 1
        assert alerts[0].notification_type == NotificationType.CAPA_OVERDUE
        assert alerts[0].level == NotificationLevel.CRITICAL

    def test_completed_capa_no_alert(self):
        capas = [{"capa_id": "CAPA-1", "target_date": "2024-06-01", "status": "COMPLETED"}]
        alerts = NotificationEngine.check_overdue_actions(
            capas=capas, as_of_date=date(2025, 1, 1),
        )
        assert len(alerts) == 0

    def test_stalled_moc(self):
        old_date = (date.today() - timedelta(days=60)).isoformat()
        mocs = [{"moc_id": "MOC-1", "status": "REVIEWING", "created_at": old_date}]
        alerts = NotificationEngine.check_overdue_actions(mocs=mocs)
        assert len(alerts) == 1
        assert alerts[0].notification_type == NotificationType.MOC_OVERDUE


class TestGenerateAllNotifications:

    def test_aggregation(self):
        rbi = [{"equipment_id": "EQ-1", "next_inspection_date": "2020-01-01"}]
        health = [{"equipment_id": "EQ-2", "composite_score": 15}]
        result = NotificationEngine.generate_all_notifications(
            "PLANT-1", rbi_assessments=rbi, health_scores=health,
        )
        assert result.plant_id == "PLANT-1"
        assert result.total_notifications >= 2
        assert result.critical_count >= 2

    def test_empty_inputs(self):
        result = NotificationEngine.generate_all_notifications("PLANT-1")
        assert result.total_notifications == 0

    def test_plant_id_set_on_alerts(self):
        rbi = [{"equipment_id": "EQ-1", "next_inspection_date": "2020-01-01"}]
        result = NotificationEngine.generate_all_notifications("MY-PLANT", rbi_assessments=rbi)
        for n in result.notifications:
            assert n.plant_id == "MY-PLANT" or n.plant_id != ""
