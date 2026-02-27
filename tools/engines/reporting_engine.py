"""Periodic Reporting Engine — Phase 6 (REF-17 capstone).

Generates structured report data for:
- Weekly maintenance report
- Monthly KPI report
- Quarterly management review

Aggregates data from existing engines. Does NOT recalculate KPIs.
Deterministic — no LLM required.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta

from tools.models.schemas import (
    MonthlyKPIReport,
    QuarterlyReviewReport,
    ReportMetadata,
    ReportSection,
    ReportType,
    TrafficLight,
    WeeklyReport,
)


class ReportingEngine:
    """Generates structured maintenance reports."""

    @staticmethod
    def generate_weekly_report(
        plant_id: str,
        week_number: int,
        year: int,
        work_orders_completed: list[dict] | None = None,
        work_orders_open: list[dict] | None = None,
        safety_incidents: int = 0,
        schedule_compliance_pct: float | None = None,
        backlog_hours: float = 0.0,
        key_events: list[str] | None = None,
    ) -> WeeklyReport:
        """Generate a weekly maintenance report."""
        completed = work_orders_completed or []
        open_wos = work_orders_open or []
        events = key_events or []

        # Compute period dates from week number
        jan1 = date(year, 1, 1)
        start = jan1 + timedelta(weeks=week_number - 1)
        start -= timedelta(days=start.weekday())  # Monday
        end = start + timedelta(days=6)

        metadata = ReportMetadata(
            report_type=ReportType.WEEKLY_MAINTENANCE,
            plant_id=plant_id,
            period_start=start,
            period_end=end,
        )

        sections: list[ReportSection] = []

        # Work order summary
        sections.append(ReportSection(
            title="Work Order Summary",
            content=f"Completed: {len(completed)}, Open: {len(open_wos)}",
            metrics={
                "completed": len(completed),
                "open": len(open_wos),
                "schedule_compliance_pct": schedule_compliance_pct,
            },
        ))

        # Safety
        sections.append(ReportSection(
            title="Safety",
            content=f"Incidents reported: {safety_incidents}",
            metrics={"safety_incidents": safety_incidents},
        ))

        # Backlog
        sections.append(ReportSection(
            title="Backlog",
            content=f"Total backlog: {backlog_hours:.0f} hours",
            metrics={"backlog_hours": backlog_hours},
        ))

        # Key events
        if events:
            sections.append(ReportSection(
                title="Key Events",
                content="\n".join(f"- {e}" for e in events),
            ))

        return WeeklyReport(
            metadata=metadata,
            week_number=week_number,
            year=year,
            wo_completed_count=len(completed),
            wo_open_count=len(open_wos),
            safety_incidents=safety_incidents,
            schedule_compliance_pct=schedule_compliance_pct,
            backlog_hours=backlog_hours,
            key_events=events,
            sections=sections,
        )

    @staticmethod
    def generate_monthly_kpi_report(
        plant_id: str,
        month: int,
        year: int,
        planning_kpis: dict | None = None,
        de_kpis: dict | None = None,
        reliability_kpis: dict | None = None,
        health_summary: dict | None = None,
        previous_month_kpis: dict | None = None,
    ) -> MonthlyKPIReport:
        """Generate a monthly KPI report with traffic lights and trends."""
        start = date(year, month, 1)
        if month == 12:
            end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end = date(year, month + 1, 1) - timedelta(days=1)

        metadata = ReportMetadata(
            report_type=ReportType.MONTHLY_KPI,
            plant_id=plant_id,
            period_start=start,
            period_end=end,
        )

        # Build traffic lights from KPI statuses
        traffic_lights: dict[str, str] = {}
        trends: dict[str, str] = {}

        def _process_kpis(kpis: dict | None, prefix: str) -> None:
            if not kpis:
                return
            for kpi in kpis.get("kpis", []):
                name = f"{prefix}_{kpi.get('name', '')}"
                status = kpi.get("status", "")
                value = kpi.get("value")
                target = kpi.get("target")
                if status == "ON_TARGET":
                    traffic_lights[name] = TrafficLight.GREEN.value
                elif value is not None and target is not None and value >= target * 0.8:
                    traffic_lights[name] = TrafficLight.AMBER.value
                else:
                    traffic_lights[name] = TrafficLight.RED.value

        _process_kpis(planning_kpis, "planning")
        _process_kpis(de_kpis, "de")

        # Trends from previous month
        if previous_month_kpis:
            prev_planning = previous_month_kpis.get("planning_kpi_summary", {})
            if prev_planning and planning_kpis:
                prev_compliance = prev_planning.get("overall_compliance", 0)
                curr_compliance = planning_kpis.get("overall_compliance", 0)
                if curr_compliance > prev_compliance:
                    trends["planning"] = "IMPROVING"
                elif curr_compliance < prev_compliance:
                    trends["planning"] = "DEGRADING"
                else:
                    trends["planning"] = "STABLE"

        sections: list[ReportSection] = []
        sections.append(ReportSection(
            title="Planning KPIs",
            content="11 GFSN Planning KPIs",
            metrics=_extract_kpi_metrics(planning_kpis),
        ))
        sections.append(ReportSection(
            title="Defect Elimination KPIs",
            content="5 DE KPIs per GFSN REF-15",
            metrics=_extract_kpi_metrics(de_kpis),
        ))
        sections.append(ReportSection(
            title="Reliability KPIs",
            content="Core reliability metrics",
            metrics=reliability_kpis or {},
        ))

        return MonthlyKPIReport(
            metadata=metadata,
            month=month,
            year=year,
            planning_kpi_summary=planning_kpis,
            de_kpi_summary=de_kpis,
            reliability_kpi_summary=reliability_kpis,
            health_summary=health_summary,
            trends=trends,
            traffic_lights=traffic_lights,
            sections=sections,
        )

    @staticmethod
    def generate_quarterly_review(
        plant_id: str,
        quarter: int,
        year: int,
        monthly_reports: list[dict] | None = None,
        management_review: dict | None = None,
        rbi_summary: dict | None = None,
        bad_actors: list[dict] | None = None,
        capas_summary: dict | None = None,
    ) -> QuarterlyReviewReport:
        """Generate a quarterly management review report."""
        start_month = (quarter - 1) * 3 + 1
        start = date(year, start_month, 1)
        end_month = start_month + 2
        if end_month == 12:
            end = date(year, 12, 31)
        else:
            end = date(year, end_month + 1, 1) - timedelta(days=1)

        metadata = ReportMetadata(
            report_type=ReportType.QUARTERLY_REVIEW,
            plant_id=plant_id,
            period_start=start,
            period_end=end,
        )

        # Strategic recommendations
        recommendations: list[str] = []
        if rbi_summary:
            overdue = rbi_summary.get("overdue_count", 0)
            if overdue > 0:
                recommendations.append(f"Address {overdue} overdue RBI inspections")
        if bad_actors:
            recommendations.append(
                f"Focus on {len(bad_actors)} identified bad actors for root cause analysis"
            )
        if capas_summary:
            overdue_capas = capas_summary.get("overdue_count", 0)
            if overdue_capas > 0:
                recommendations.append(f"Resolve {overdue_capas} overdue CAPA actions")

        if not recommendations:
            recommendations.append("Continue current maintenance strategy — on track")

        sections: list[ReportSection] = []
        sections.append(ReportSection(
            title="Executive Summary",
            content=f"Q{quarter} {year} Management Review for {plant_id}",
        ))
        if management_review:
            sections.append(ReportSection(
                title="Management Review",
                content=management_review.get("summary", ""),
                metrics={
                    "avg_health": management_review.get("avg_health_score", ""),
                    "open_capas": management_review.get("open_capas", ""),
                },
            ))
        sections.append(ReportSection(
            title="Strategic Recommendations",
            content="\n".join(f"- {r}" for r in recommendations),
        ))

        return QuarterlyReviewReport(
            metadata=metadata,
            quarter=quarter,
            year=year,
            monthly_summaries=monthly_reports or [],
            management_review=management_review,
            rbi_summary=rbi_summary,
            bad_actors=bad_actors or [],
            capas_summary=capas_summary,
            strategic_recommendations=recommendations,
            sections=sections,
        )

    @staticmethod
    def get_report_sections(report_type: ReportType) -> list[ReportSection]:
        """Return the standard section template for a given report type."""
        templates = {
            ReportType.WEEKLY_MAINTENANCE: [
                ReportSection(title="Work Order Summary"),
                ReportSection(title="Safety"),
                ReportSection(title="Backlog"),
                ReportSection(title="Key Events"),
            ],
            ReportType.MONTHLY_KPI: [
                ReportSection(title="Planning KPIs"),
                ReportSection(title="Defect Elimination KPIs"),
                ReportSection(title="Reliability KPIs"),
                ReportSection(title="Health Summary"),
            ],
            ReportType.QUARTERLY_REVIEW: [
                ReportSection(title="Executive Summary"),
                ReportSection(title="Management Review"),
                ReportSection(title="Risk-Based Inspection"),
                ReportSection(title="Bad Actors"),
                ReportSection(title="Strategic Recommendations"),
            ],
        }
        return templates.get(report_type, [])


def _extract_kpi_metrics(kpis: dict | None) -> dict:
    """Extract a flat metrics dict from a KPI summary."""
    if not kpis:
        return {}
    result: dict = {}
    for kpi in kpis.get("kpis", []):
        name = kpi.get("name", "")
        value = kpi.get("value")
        if name and value is not None:
            result[name] = value
    if "overall_compliance" in kpis:
        result["overall_compliance"] = kpis["overall_compliance"]
    return result
