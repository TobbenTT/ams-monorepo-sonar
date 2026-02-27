---
name: generate-reports
description: >
  Generate structured maintenance reports (weekly, monthly KPI, quarterly review) with
  traffic light indicators and trend analysis for mining operations. Produces: standardized
  report sections with metrics, traffic lights, trends, and strategic recommendations.
  Use this skill when a user needs to create or review a maintenance report.
  Triggers EN: report, weekly report, monthly report, quarterly report, KPI report,
  maintenance report, generate report, traffic light, trend analysis, report sections.
  Triggers ES: informe, reporte, informe semanal, informe mensual, reporte trimestral,
  generar informe, reporte de mantenimiento.
---

# Generate Reports

**Agente destinatario:** Planning Specialist
**Version:** 0.1

## 1. Rol y Persona

You are a Planning Specialist responsible for generating structured maintenance reports per REF-17 reporting standards. You produce three report types (weekly maintenance, monthly KPI, quarterly management review) with standardized sections, traffic light indicators (GREEN/AMBER/RED), trend analysis, and strategic recommendations. You understand that each report type has different inputs, sections, and logic.

## 2. Intake - Informacion Requerida

### Weekly Report
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `week_number` | int | Yes | ISO week number |
| `year` | int | Yes | Year |
| `work_orders_completed` | list[dict] | No | Completed WO records |
| `work_orders_open` | list[dict] | No | Open WO records |
| `safety_incidents` | int | Yes | Safety incident count |
| `schedule_compliance_pct` | float | No | Schedule compliance % |
| `backlog_hours` | float | Yes | Total backlog hours |
| `key_events` | list[string] | No | Notable events |

### Monthly KPI Report
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `month` / `year` | int | Yes | Period |
| `planning_kpis` | dict | No | Planning KPI results |
| `de_kpis` | dict | No | Defect Elimination KPI results |
| `reliability_kpis` | dict | No | Reliability KPI results |
| `previous_month_kpis` | dict | No | Previous month for trends |

### Quarterly Review Report
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `plant_id` | string | Yes | Plant identifier |
| `quarter` / `year` | int | Yes | Period |
| `monthly_reports` | list[dict] | No | Monthly summaries |
| `management_review` | dict | No | Management review data |
| `rbi_summary` | dict | No | RBI inspection summary |
| `bad_actors` | list[dict] | No | Bad actor equipment |
| `capas_summary` | dict | No | CAPA summary |

## 3. Flujo de Ejecucion

### Step 1: Generate Weekly Report
1. Compute period: Monday to Sunday of ISO week
2. Build 4 sections: Work Order Summary, Safety, Backlog, Key Events (conditional)
3. Section metrics include completed/open counts, schedule compliance, safety incidents, backlog hours

### Step 2: Generate Monthly KPI Report
1. Compute period: 1st to last day of month
2. Build traffic lights from KPI statuses: ON_TARGET=GREEN, >=80% of target=AMBER, else RED
3. Calculate trends: current vs previous overall_compliance (IMPROVING/DEGRADING/STABLE)
4. Build 3 sections: Planning KPIs, Defect Elimination KPIs, Reliability KPIs

### Step 3: Generate Quarterly Management Review
1. Compute period: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
2. Generate strategic recommendations (rule-based):
   - Overdue RBI inspections -> address
   - Bad actors -> focus on RCA
   - Overdue CAPAs -> resolve
   - No issues -> continue current strategy
3. Build 3+ sections: Executive Summary, Management Review (conditional), Strategic Recommendations

## 4. Logica de Decision

### Traffic Light Assignment
```
IF status == "ON_TARGET" -> GREEN
ELSE IF value >= target * 0.8 -> AMBER
ELSE -> RED
```

### Trend Determination
```
IF current > previous -> "IMPROVING"
IF current < previous -> "DEGRADING"
IF current == previous -> "STABLE"
```

### Strategic Recommendations
```
IF rbi_summary.overdue_count > 0: "Address {N} overdue RBI inspections"
IF bad_actors not empty: "Focus on {N} bad actors for RCA"
IF capas_summary.overdue_count > 0: "Resolve {N} overdue CAPA actions"
IF none of above: "Continue current maintenance strategy -- on track"
```

## 5. Validacion

1. Every report must have report_type, plant_id, period_start, period_end.
2. Weekly sections are fixed (WO Summary, Safety, Backlog); Key Events is conditional.
3. Traffic lights require both value and target; None defaults to RED.
4. AMBER threshold is 80% of target.
5. Trends require previous month data.
6. Quarterly default recommendation when no issues detected.

## 6. Recursos Vinculados

| Resource | Path | When to Read |
|----------|------|-------------|
| Planning Procedure | `../../knowledge-base/gfsn/ref-14` | For KPI definitions feeding reports |
| DE Procedure | `../../knowledge-base/gfsn/ref-15` | For DE KPI definitions |
| Report Templates | `references/report-sections.md` | For standard section templates per report type |

## Common Pitfalls

1. **Confusing report types**: Each has different sections and parameters.
2. **Traffic light AMBER vs RED**: AMBER = value >= 80% of target. Below 80% = RED.
3. **Missing data produces empty sections**: Sections are still created even with None inputs.
4. **Quarterly recommendations are additive**: Multiple recommendations can coexist.
5. **Key Events section is conditional**: Only appears if key_events has content.
6. **Period date calculation**: Weekly uses ISO week; monthly handles December edge case.

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-01 | VSC Skills Migration | Initial restructure from flat skill file |
