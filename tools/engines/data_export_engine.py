"""Data Export Engine — Phase 6.

Generates structured data for export as Excel/CSV/PDF.
This engine produces the DATA structures; actual file generation
happens in the API/service layer.

Deterministic — no LLM required.
"""

from __future__ import annotations

from tools.models.schemas import (
    ExportFormat,
    ExportResult,
    ExportSection,
    ExportSheet,
)


class DataExportEngine:
    """Generates structured data for export."""

    @staticmethod
    def prepare_equipment_export(
        hierarchy_data: list[dict],
        include_criticality: bool = True,
        include_health: bool = True,
    ) -> ExportResult:
        """Prepare equipment hierarchy data for export."""
        headers = ["Equipment ID", "Description", "Type", "Parent ID"]
        if include_criticality:
            headers.extend(["Criticality Class", "Risk Score"])
        if include_health:
            headers.extend(["Health Score", "Health Class"])

        rows: list[list] = []
        for eq in hierarchy_data:
            row = [
                eq.get("equipment_id", ""),
                eq.get("description", ""),
                eq.get("equipment_type", ""),
                eq.get("parent_id", ""),
            ]
            if include_criticality:
                row.extend([
                    eq.get("criticality_class", ""),
                    eq.get("risk_score", ""),
                ])
            if include_health:
                row.extend([
                    eq.get("health_score", eq.get("composite_score", "")),
                    eq.get("health_class", ""),
                ])
            rows.append(row)

        sheet = ExportSheet(name="Equipment", headers=headers, rows=rows)
        return ExportResult(
            format=ExportFormat.EXCEL,
            sheets=[sheet],
            metadata={"export_type": "equipment", "total_rows": str(len(rows))},
        )

    @staticmethod
    def prepare_kpi_export(
        planning_kpis: dict | None = None,
        de_kpis: dict | None = None,
        reliability_kpis: dict | None = None,
    ) -> ExportResult:
        """Prepare KPI data for export across all KPI categories."""
        sheets: list[ExportSheet] = []

        # Planning KPIs
        if planning_kpis:
            kpis = planning_kpis.get("kpis", [])
            rows = [
                [k.get("name", ""), k.get("value", ""), k.get("target", ""),
                 k.get("unit", "%"), k.get("status", "")]
                for k in kpis
            ]
            sheets.append(ExportSheet(
                name="Planning KPIs",
                headers=["KPI Name", "Value", "Target", "Unit", "Status"],
                rows=rows,
            ))

        # DE KPIs
        if de_kpis:
            kpis = de_kpis.get("kpis", [])
            rows = [
                [k.get("name", ""), k.get("value", ""), k.get("target", ""),
                 k.get("unit", "%"), k.get("status", "")]
                for k in kpis
            ]
            sheets.append(ExportSheet(
                name="DE KPIs",
                headers=["KPI Name", "Value", "Target", "Unit", "Status"],
                rows=rows,
            ))

        # Reliability KPIs
        if reliability_kpis:
            rows = []
            for field in ["mtbf_days", "mttr_hours", "availability_pct",
                          "oee_pct", "schedule_compliance_pct", "reactive_ratio_pct"]:
                val = reliability_kpis.get(field)
                if val is not None:
                    rows.append([field, val, "", "", ""])
            sheets.append(ExportSheet(
                name="Reliability KPIs",
                headers=["KPI Name", "Value", "Target", "Unit", "Status"],
                rows=rows,
            ))

        if not sheets:
            sheets.append(ExportSheet(name="KPIs", headers=["No Data"], rows=[]))

        return ExportResult(
            format=ExportFormat.EXCEL,
            sheets=sheets,
            metadata={"export_type": "kpis", "sheet_count": str(len(sheets))},
        )

    @staticmethod
    def prepare_report_export(
        report: dict,
        format: ExportFormat = ExportFormat.EXCEL,
    ) -> ExportResult:
        """Prepare a report for export."""
        sections: list[ExportSection] = []

        # Metadata section
        metadata = report.get("metadata", {})
        sections.append(ExportSection(
            title="Report Metadata",
            content=f"Type: {metadata.get('report_type', '')}, "
                    f"Plant: {metadata.get('plant_id', '')}, "
                    f"Generated: {metadata.get('generated_at', '')}",
        ))

        # Report sections
        for section_data in report.get("sections", []):
            title = section_data.get("title", "Section")
            content = section_data.get("content", "")
            metrics = section_data.get("metrics", {})
            if metrics:
                content += "\n" + "\n".join(f"  {k}: {v}" for k, v in metrics.items())
            sections.append(ExportSection(title=title, content=content))

        # Summary sheet with key metrics
        summary_rows: list[list] = []
        for key in ["wo_completed_count", "wo_open_count", "safety_incidents",
                     "schedule_compliance_pct", "backlog_hours"]:
            if key in report:
                summary_rows.append([key, report[key]])

        sheet = ExportSheet(
            name="Summary",
            headers=["Metric", "Value"],
            rows=summary_rows,
        ) if summary_rows else ExportSheet(name="Summary", headers=["Metric", "Value"], rows=[])

        return ExportResult(
            format=format,
            sheets=[sheet],
            sections=sections,
            metadata={"export_type": "report", "report_type": metadata.get("report_type", "")},
        )

    @staticmethod
    def prepare_schedule_export(
        program: dict,
        gantt_rows: list[dict] | None = None,
    ) -> ExportResult:
        """Prepare scheduling/program data for export."""
        sheets: list[ExportSheet] = []

        # Program overview
        overview_rows: list[list] = []
        for key in ["program_id", "week_number", "year", "status",
                     "total_work_orders", "total_hours"]:
            if key in program:
                overview_rows.append([key, program[key]])
        sheets.append(ExportSheet(
            name="Program Overview",
            headers=["Property", "Value"],
            rows=overview_rows,
        ))

        # Gantt/schedule rows
        if gantt_rows:
            gantt_headers = ["WO ID", "Description", "Start", "End",
                             "Duration (hrs)", "Resource Group", "Status"]
            rows = [
                [
                    g.get("work_order_id", g.get("wo_id", "")),
                    g.get("description", ""),
                    g.get("planned_start", g.get("start", "")),
                    g.get("planned_end", g.get("end", "")),
                    g.get("duration_hours", g.get("duration", "")),
                    g.get("resource_group", g.get("work_center", "")),
                    g.get("status", ""),
                ]
                for g in gantt_rows
            ]
            sheets.append(ExportSheet(
                name="Schedule",
                headers=gantt_headers,
                rows=rows,
            ))

        return ExportResult(
            format=ExportFormat.EXCEL,
            sheets=sheets,
            metadata={"export_type": "schedule", "program_id": program.get("program_id", "")},
        )
