---
name: generate-project-dashboard
description: "Generate consolidated project status dashboard synthesizing inputs from all contributing agents with multi-level reporting for project team, steering committee, and executive board. Triggers: 'project dashboard', 'project status', 'tablero de proyecto'."
category: "Project Governance — Status Reporting"
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Generate Project Dashboard

## Skill ID: PO-003
## Version: 1.0.0
## Category: Project Governance — Status Reporting
## Priority: P1 - Critical

---

## Purpose

Generate a consolidated capital project status dashboard that synthesizes performance data from all contributing agents into a unified, multi-level reporting view. The dashboard provides real-time project health visibility at three reporting levels: project team (detailed operational data), steering committee (discipline-level summaries with variance explanations), and executive board (portfolio-level traffic lights with key decisions required).

Effective project status reporting is the primary mechanism through which capital project governance functions. The Project Management Institute's 2023 Pulse of the Profession report found that organizations with mature project reporting practices are 2.5 times more likely to deliver projects within budget and 1.7 times more likely to deliver on schedule. Conversely, PMI's analysis of $122 billion in project investment found that $14.4 billion (11.8%) was wasted due to poor governance and communications, with inadequate status reporting identified as a leading contributor.

The challenge in megaproject environments is not a shortage of data but an excess of disconnected, discipline-specific reporting that fails to provide an integrated project view. A typical $500 million capital project generates status reports from 8-15 discipline leads, each with different formats, different definitions of "percent complete," and different risk assessment methodologies. Construction may report 75% complete based on physical progress while engineering reports 90% complete based on document count, and the two figures are not comparable. PMI PMBOK 7th Edition emphasizes that "project performance information must be synthesized and presented in a format that supports informed decision-making at the appropriate organizational level" (Section 4.5).

This skill directly addresses **Pain Point CP-05** (Capital Project Governance Visibility): In 78% of projects that experienced significant cost or schedule overruns, post-mortem analysis revealed that early warning indicators were present in discipline-level data but were not surfaced to decision-makers in time to take corrective action (IPA, "The Role of Governance in Project Outcomes," 2020). The root cause is fragmented reporting: each discipline tracks its own metrics in its own format, and the project manager spends 60-70% of their reporting effort on data aggregation rather than analysis and decision-making.

This skill eliminates the aggregation burden by automatically synthesizing inputs from all Team A agents (Engineering Design AG-008, Construction Management AG-009, Execution AG-006, HSE AG-004, Finance AG-010, Contracts AG-005, Operations AG-002, Asset Management AG-003) into a single-source-of-truth dashboard that adapts its detail level, visualization type, and emphasis to the target audience.

---

## Intent & Specification

| Attribute              | Value                                                                 |
|------------------------|-----------------------------------------------------------------------|
| **Skill ID**           | PO-003                                                                |
| **Agent**              | Project Orchestrator (AG-007)                                         |
| **Domain**             | Capital Project Governance — Reporting                                |
| **Version**            | 1.0.0                                                                 |
| **Complexity**         | High                                                                  |
| **Estimated Duration** | Initial setup: 2-3 days; Periodic update: 4-8 hours                   |
| **Maturity**           | Production                                                            |
| **Pain Point Addressed** | CP-05: Early warning data not surfaced to decision-makers (IPA 2020)|
| **Secondary Pain**     | CP-06: 60-70% of PM reporting effort spent on data aggregation        |
| **Value Created**      | Reduce reporting cycle time by 60%; improve governance decision quality|

### Functional Intent

This skill SHALL:

1. **Aggregate Multi-Agent Data**: Collect status inputs from all contributing agents (AG-002 through AG-012) and consolidate them into a unified data model. Resolve conflicting data by flagging discrepancies for reconciliation rather than silently averaging.

2. **Produce KPI Summary**: Calculate and display the core project KPIs — schedule performance (SPI, milestone adherence), cost performance (CPI, EAC vs. BAC), quality performance (defect rates, rework percentage), safety performance (TRIR, LTIR, near-miss frequency), and scope performance (change order count and value, scope growth percentage).

3. **Generate Traffic Light Status**: Assign Red/Amber/Green status to each discipline and each KPI based on defined thresholds. Traffic light assignments must be objective and algorithmic — no manual overrides without documented justification.

4. **Track Milestones**: Display all project milestones (Level 1 and Level 2) with planned dates, forecast dates, actual dates, and variance. Highlight critical path milestones and milestones at risk.

5. **Present Risk Heat Map**: Summarize the current risk register as a probability-impact heat map showing the distribution of active risks by category (technical, commercial, schedule, safety, environmental, regulatory). Include top 5 risks by risk score.

6. **Surface Key Decisions Pending**: List all pending decisions that require steering committee or executive board action, with decision deadline, impact of delay, and recommended action.

7. **Report Resource Utilization**: Summarize resource utilization across disciplines — planned vs. actual resource hours, key staffing gaps, and critical resource constraints.

8. **Adapt to Reporting Level**: Produce three distinct views from the same underlying data:
   - **Project Team**: Full detail with WBS-level data, action item lists, and look-ahead schedules
   - **Steering Committee**: Discipline-level summaries with variance explanations and decision requests
   - **Executive Board**: Portfolio-level traffic lights with headline metrics and key escalations only

### Success Criteria

- Dashboard reflects data from all contributing agents (no discipline gaps)
- All traffic light statuses are algorithmically derived with documented thresholds
- Milestone tracker covers 100% of Level 1 and Level 2 milestones
- Risk heat map is current (within one reporting cycle of latest risk register update)
- Pending decisions are listed with impact assessment and recommended action
- Dashboard generated within 8 hours of data collection completion
- Three reporting levels produced from single data aggregation pass

### Constraints

- Must not present conflicting data — discrepancies between agent inputs must be flagged, not hidden
- Must not change the underlying data — dashboard is a read-only synthesis
- Must support bilingual presentation (English/Spanish) for Latin American project contexts
- Must follow VSC branding and document formatting standards
- Must be auditable — every metric must be traceable to its source agent and data point
- Must handle missing data gracefully — indicate "Data Not Available" rather than omitting metrics

---

## Trigger / Invocation

### Direct Invocation

```
/generate-project-dashboard --project [name] --level [team|steering|executive] --period [YYYY-MM]
```

### Command Variants

- `/generate-project-dashboard full --project [name]` — Generate all three reporting levels
- `/generate-project-dashboard team --project [name]` — Project team detail view only
- `/generate-project-dashboard steering --project [name]` — Steering committee summary
- `/generate-project-dashboard executive --project [name]` — Executive board overview
- `/generate-project-dashboard compare --project [name] --periods [YYYY-MM,YYYY-MM]` — Period comparison

### Aliases

- `/project-dashboard`, `/project-status`, `/tablero-proyecto`, `/estado-proyecto`

### Natural Language Triggers (EN)

- "Generate the project dashboard for this month"
- "What is the overall project status?"
- "Prepare the steering committee status report"
- "Give me the executive summary for the board"
- "Show me the project health indicators"

### Natural Language Triggers (ES)

- "Generar el tablero de proyecto para este mes"
- "Cual es el estado general del proyecto?"
- "Preparar el informe de estado para el comite directivo"
- "Dame el resumen ejecutivo para el directorio"
- "Mostrar los indicadores de salud del proyecto"

### Contextual Triggers

- Monthly reporting cycle date reached (automatic dashboard generation)
- Steering committee meeting scheduled within 5 business days (auto-generate steering view)
- Any agent reports a status change to Red (triggers dashboard refresh)
- Gate review approaching (triggers comprehensive dashboard as input to gate assessment)
- New risk rated Critical or Extreme added to risk register (triggers dashboard update)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_code` | text | User / Session State | Project identifier |
| `reporting_period` | date | User / System | Reporting period (month/year) |
| `evm_data` | .xlsx | AG-007 — track-project-evm (PO-002) | Current EVM metrics: SPI, CPI, EAC, S-curve data |
| `schedule_status` | .xlsx | AG-006 (Execution) | Milestone status, critical path update, look-ahead schedule |
| `risk_register` | .xlsx | AG-007 — manage-project-risk-register (PO-004) | Current risk register with P x I scores and response status |

### Optional Inputs (Discipline-Specific)

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `engineering_status` | .xlsx | AG-008 (Engineering Design) | Engineering deliverable completion, design review status, vendor data status |
| `construction_status` | .xlsx | AG-009 (Construction Management) | Construction progress by area/system, quality metrics, subcontractor performance |
| `hse_status` | .xlsx | AG-004 (HSE) | Safety statistics (TRIR, LTIR), environmental compliance, permit status |
| `procurement_status` | .xlsx | AG-005 (Contracts & Compliance) | Procurement progress, long-lead items, contract awards, claim status |
| `financial_status` | .xlsx | AG-010 (Finance & Accounting) | Cash flow status, commitment tracking, invoice processing metrics |
| `operations_status` | .xlsx | AG-002 (Operations) | Staffing progress, training completion, SOP development status |
| `commissioning_status` | .xlsx | AG-006 (Execution) | System turnover progress, punchlist status, pre-commissioning completion |
| `decision_log` | .xlsx | AG-007 — manage-project-decision-log (PO-005) | Pending decisions requiring steering committee action |
| `change_log` | .xlsx | AG-007 | Scope change requests and approved changes |

### Input Validation Rules

```yaml
validation:
  evm_data:
    required_fields: ["spi", "cpi", "eac", "bac", "pv_cumulative", "ev_cumulative", "ac_cumulative"]
    spi_cpi_range: "0.50 - 2.00"
  schedule_status:
    required_fields: ["milestone_id", "description", "planned_date", "forecast_date", "status"]
    min_milestones: 5
  risk_register:
    required_fields: ["risk_id", "description", "probability", "impact", "risk_score", "status"]
    min_risks: 1
```

---

## Output Specification

### Deliverable 1: Consolidated Project Dashboard (.xlsx)

**Filename**: `{ProjectCode}_Project_Dashboard_{Period}_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Executive Overview"

Single-page executive view containing:
- Project name, phase, reporting period, report date
- Overall status traffic light (Red/Amber/Green) with one-line rationale
- Six KPI boxes: Schedule (SPI), Cost (CPI), Quality, Safety (TRIR), Scope, Risk
- Top 3 achievements this period
- Top 3 concerns/escalations
- Key decisions required (with deadline and recommended action)

#### Sheet 2: "Discipline Status Matrix"

| Discipline | Status | Progress | Planned | Variance | Key Issue | Trend |
|-----------|--------|----------|---------|----------|-----------|-------|
| Engineering Design | {R/A/G} | {%} | {%} | {delta} | {issue} | {arrow} |
| Construction | {R/A/G} | {%} | {%} | {delta} | {issue} | {arrow} |
| Procurement | {R/A/G} | {%} | {%} | {delta} | {issue} | {arrow} |
| HSE | {R/A/G} | {metrics} | {target} | {delta} | {issue} | {arrow} |
| Commissioning | {R/A/G} | {%} | {%} | {delta} | {issue} | {arrow} |
| Operations Readiness | {R/A/G} | {%} | {%} | {delta} | {issue} | {arrow} |
| Finance | {R/A/G} | {EAC} | {BAC} | {VAC} | {issue} | {arrow} |

#### Sheet 3: "Milestone Tracker"

| Milestone | Level | Planned | Forecast | Actual | Variance (days) | Status | Critical Path | Owner |
|-----------|-------|---------|----------|--------|-----------------|--------|---------------|-------|

#### Sheet 4: "EVM Summary"

Condensed EVM view with S-curve data, current period metrics, and trend over last 6 periods.

#### Sheet 5: "Risk Heat Map Data"

Risk distribution by probability-impact quadrant with top 10 risks listed by risk score.

#### Sheet 6: "Pending Decisions"

| Decision_ID | Description | Category | Requested_By | Deadline | Impact_of_Delay | Recommended_Action | Decision_Level |
|-------------|-------------|----------|-------------|----------|-----------------|-------------------|----------------|

#### Sheet 7: "Resource Summary"

Resource utilization by discipline with planned vs. actual hours and key staffing gaps.

#### Sheet 8: "Period Comparison"

Side-by-side comparison of current period vs. prior period for all key metrics, highlighting improving and deteriorating areas.

### Deliverable 2: Steering Committee Report (.md)

**Filename**: `{ProjectCode}_Steering_Committee_Report_{Period}_v{Version}_{YYYYMMDD}.md`

Structured report (8-12 pages equivalent) containing:
1. Executive Summary (1 page)
2. Schedule Performance with milestone status (2 pages)
3. Cost Performance with EVM summary (2 pages)
4. Safety and Environmental Performance (1 page)
5. Key Risks and Mitigation Status (1-2 pages)
6. Decisions Required from Steering Committee (1 page)
7. Look-Ahead: Next Period Key Activities (1 page)

### Formatting Standards

- Traffic light colors: Green (#008000), Amber (#FF8C00), Red (#CC0000), Gray (#C0C0C0 for N/A)
- Trend indicators: Up arrow (improving), Right arrow (stable), Down arrow (deteriorating)
- Header row: Bold, navy background (#001F3F), white font
- KPI boxes: Large font for value, small font for label, traffic-light border color
- Milestone status: On Track = Green, At Risk = Amber, Delayed = Red, Complete = Blue (#0066CC)

---

## Quality Criteria

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Data completeness | All contributing agents represented | 20% | 100% disciplines covered | >80% disciplines covered |
| Traffic light objectivity | All statuses algorithmically derived | 15% | 100% | 100% |
| Metric accuracy | All KPIs match source data | 15% | 100% | 100% |
| Milestone coverage | All L1/L2 milestones tracked | 10% | 100% | >95% |
| Timeliness | Dashboard produced within 8 hours of data availability | 10% | < 8 hours | < 24 hours |
| Reporting level adaptation | Three distinct views from single data pass | 10% | 3 views generated | 2 views generated |
| Decision surfacing | All pending decisions listed with deadlines | 10% | 100% | >90% |
| Trend analysis | Comparison with prior period included | 5% | Full comparison | Key metrics compared |
| Bilingual support | EN/ES headers and labels | 5% | Full bilingual | EN only acceptable |

### Automated Quality Checks

1. **Data freshness**: All input data from current or immediately prior reporting period
2. **Traffic light consistency**: No discipline is Green if its SPI or CPI is below 0.90
3. **Milestone alignment**: Dashboard milestone dates match source schedule within 1 business day
4. **EVM reconciliation**: Dashboard EVM metrics match track-project-evm output exactly
5. **Risk register currency**: Risk data is from most recent risk register update
6. **Decision completeness**: Every pending decision has a deadline and recommended action
7. **No orphan data**: Every metric has a labeled source agent

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent | Input Provided | Criticality | Description |
|-------|---------------|-------------|-------------|
| AG-007 — track-project-evm (PO-002) | EVM metrics, S-curve data | Critical | Core cost and schedule performance indicators |
| AG-007 — manage-project-risk-register (PO-004) | Risk register, heat map data | Critical | Current risk landscape for risk summary section |
| AG-007 — manage-project-decision-log (PO-005) | Pending decisions | High | Decisions requiring steering committee action |
| AG-006 (Execution) | Schedule status, milestone tracker, commissioning progress | Critical | Schedule and milestone data for project timeline view |
| AG-008 (Engineering Design) | Engineering completion status, design review progress | High | Engineering discipline status for discipline matrix |
| AG-009 (Construction Management) | Construction progress, quality metrics, safety stats | High | Construction discipline status and safety performance |
| AG-004 (HSE) | Safety KPIs (TRIR, LTIR), environmental compliance | High | Safety and environmental performance section |
| AG-005 (Contracts & Compliance) | Procurement progress, contract awards, claims | High | Procurement and contracts discipline status |
| AG-010 (Finance & Accounting) | Financial status, cash flow, invoice metrics | High | Financial performance and budget utilization |
| AG-002 (Operations) | Operations readiness progress, staffing, training | Medium | Operations readiness discipline status |
| AG-003 (Asset Management) | Maintenance readiness, asset register, spare parts | Medium | Asset management readiness status |

### Downstream Dependencies (Outputs TO other agents)

| Agent | Output Provided | Criticality | Description |
|-------|----------------|-------------|-------------|
| AG-001 (OR Orchestrator) | Consolidated project status for portfolio view | High | OR Orchestrator aggregates project dashboards across the portfolio |
| AG-007 — assess-fel-gate-readiness (PO-001) | Current project health as input to gate assessment | High | Gate assessment references latest dashboard for current status context |
| All agents | Shared project status as context for their work | Medium | Agents reference the dashboard for cross-discipline awareness |

---

## Templates & References

### Traffic Light Threshold Definitions

```yaml
thresholds:
  schedule:
    green: "SPI >= 0.95 AND all L1 milestones on track"
    amber: "SPI 0.90-0.94 OR any L1 milestone at risk"
    red: "SPI < 0.90 OR any L1 milestone delayed"
  cost:
    green: "CPI >= 0.95 AND EAC within 5% of BAC"
    amber: "CPI 0.90-0.94 OR EAC 5-10% above BAC"
    red: "CPI < 0.90 OR EAC >10% above BAC"
  safety:
    green: "TRIR below industry average AND zero fatalities AND zero LTIs in period"
    amber: "TRIR at or above industry average OR any LTI in period"
    red: "Fatality OR TRIR >2x industry average OR regulatory stop-work"
  quality:
    green: "Rework rate < 3% AND defect rate within tolerance"
    amber: "Rework rate 3-5% OR defect rate above tolerance"
    red: "Rework rate > 5% OR critical quality non-conformance"
  scope:
    green: "Scope growth < 3% AND no unapproved changes"
    amber: "Scope growth 3-8% OR pending change requests > 5"
    red: "Scope growth > 8% OR unapproved scope additions detected"
  risk:
    green: "No Critical/Extreme risks AND risk trend stable or improving"
    amber: "1-2 Critical risks with active mitigation OR risk trend deteriorating"
    red: ">2 Critical risks OR any Extreme risk OR mitigation plans overdue"
```

### Reporting Cadence Reference

| Report Level | Cadence | Distribution | Typical Length |
|-------------|---------|-------------|----------------|
| Project Team | Weekly | Project team, discipline leads | 15-20 pages detail |
| Steering Committee | Monthly | Sponsor, steering committee members | 8-12 pages summary |
| Executive Board | Quarterly | Executive leadership, board members | 2-3 pages overview |
