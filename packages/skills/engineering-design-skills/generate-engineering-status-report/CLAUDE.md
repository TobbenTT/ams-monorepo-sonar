---
name: generate-engineering-status-report
description: "Generate weekly and monthly engineering status reports consolidating progress metrics, deliverable status, change management activity, vendor document reviews, and key issues across all disciplines. Triggers: 'engineering status report', 'engineering progress report', 'informe de avance de ingenieria', 'reporte de estado de ingenieria', 'informe de progreso de diseno'."
---

# Generate Engineering Status Report

## Skill ID: ENGD-15

## Version: 1.0.0

## Category: A - Document Generation

## Priority: P2 - High

---

## Purpose

Produces weekly and monthly engineering status reports that consolidate progress metrics, deliverable status, engineering change activity, vendor document review status, interdisciplinary interface resolution, and key issues across all engineering disciplines into a single comprehensive view of engineering performance. This skill provides engineering leadership, project management, and client stakeholders with the authoritative source of truth on engineering health.

Engineering status reporting in capital projects for mining, oil & gas, chemicals, and energy is notoriously fragmented. Each discipline typically tracks its own progress in its own format, at its own level of detail, using its own definitions of "complete." The resulting reports are inconsistent, difficult to aggregate, and often contradictory. Project managers spend hours each week trying to reconcile discipline reports into a coherent narrative, and the result is still frequently inaccurate -- particularly regarding interdisciplinary dependencies and cascading schedule impacts.

The consequences of poor engineering status reporting compound rapidly. Without a single consolidated view, emerging problems are invisible until they reach crisis level. A two-week delay in process engineering IFC output does not appear critical in isolation, but when its downstream impact on piping isometrics, instrument hook-up drawings, and electrical cable schedules is properly mapped, it may represent a six-week delay to mechanical completion. Only a consolidated report with cross-discipline visibility can surface these cascading impacts early enough for mitigation.

This skill automates the collection, normalization, and consolidation of engineering status data from all disciplines and supporting systems (EDDR, manhour tracking, change register, vendor document register, interface register), producing standardized weekly and monthly reports with consistent metrics, S-curves, exception highlighting, and actionable issue narratives. By eliminating manual data consolidation and enforcing standardized metrics, the report becomes both more reliable and more timely.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Single Source of Truth**: The engineering status report must be THE definitive reference for engineering performance. It must reconcile all data sources and present a consistent picture. Conflicting data from different sources must be investigated and resolved, not simply presented side by side.
2. **Multi-Level Audience**: The report serves multiple audiences -- engineering management (detailed discipline analysis), project management (schedule and cost impact), and client/steering committee (executive summary). The report must be structured so each audience can access their relevant level without wading through inappropriate detail.
3. **Leading Indicators Over Lagging**: The report must emphasize leading indicators (SPI trends, upcoming milestones at risk, resource gaps, interface issues aging) rather than only lagging indicators (deliverables completed, hours spent). The purpose is to enable proactive intervention, not document historical performance.
4. **Interdisciplinary Impact Visibility**: The most critical information in an engineering status report is the impact of one discipline's status on other disciplines. A delay in process engineering affects every downstream discipline. The report must explicitly map these cascading impacts.
5. **Issue Management Integration**: Every reported issue must have an owner, a target resolution date, and a status. Open issues must carry forward between reporting periods until resolved. Issues approaching or exceeding their target date must be highlighted with escalation recommendations.

---

## Trigger / Invocation

```
/generate-engineering-status-report
```

### Natural Language Triggers
- "Generate the weekly engineering status report"
- "Prepare the monthly engineering progress report for the client"
- "Create engineering dashboard for the project review meeting"
- "Generar el informe semanal de avance de ingenieria"
- "Preparar el reporte mensual de progreso de ingenieria para el cliente"
- "Crear dashboard de ingenieria para la reunion de revision del proyecto"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `eddr_current` | Engineering Deliverable Document Register -- current status of all deliverables with progress %, planned/actual dates | .xlsx | Engineering Management / Doc Control |
| `manhour_ev_data` | Earned value analysis output from track-engineering-manhours | .xlsx | ENGD-14 (track-engineering-manhours) |
| `engineering_schedule` | Current engineering schedule with baseline comparison, milestones, critical path | .mpp / .xlsx | Project Controls / Execution Agent |
| `issue_register` | Engineering issues and action items with owners, due dates, and status | .xlsx | Engineering Management |
| `change_register` | Engineering change notices/orders with status, manhour impact, schedule impact | .xlsx | Engineering Change Management |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `vendor_document_register` | Status of vendor document submissions and reviews | Include placeholder section with "awaiting data" |
| `interface_register` | Interdisciplinary interface tracking with resolution status | Derive from EDDR interdependency data |
| `previous_report` | Prior period report for issue carry-forward and trend continuity | Generate fresh baseline if unavailable |
| `client_reporting_template` | Client-specific reporting format or additional KPI requirements | Use VSC standard template |

### Context Enrichment

The agent should automatically:
- Cross-reference EDDR planned dates against the engineering schedule baseline to identify deliverables behind schedule
- Retrieve CPI and SPI trends from track-engineering-manhours for each discipline to flag deteriorating performance
- Identify critical path deliverables from the schedule and highlight their current status prominently
- Pull open issues and action items from the previous report that remain unresolved for carry-forward
- Calculate aging of open issues and interfaces to identify items requiring escalation

---

## Output Specification

### Document: Engineering Status Report (.docx / .pptx)

**Filename**: `VSC_EngStatusRpt_{ProjectCode}_{Period}_{Rev}_{Date}.docx`

### Structure

#### Section 1: Executive Summary (1 page)
- Overall engineering progress: planned % vs. actual % with variance
- Overall SPI and CPI with trend (3-period minimum)
- Top 3 achievements this period
- Top 3 risks/issues requiring management attention
- Key milestones achieved and upcoming milestones at risk

#### Section 2: Overall Progress Dashboard
- Engineering S-curve (planned vs. actual vs. earned cumulative progress)
- Deliverable status summary: total deliverables, issued IFR, issued IFC, overdue
- Progress by discipline bar chart with planned vs. actual overlay
- Engineering change metrics: changes received, processed, manhour impact cumulative

#### Section 3: Discipline-by-Discipline Status
- Per discipline (Process, Mechanical, Piping, Electrical, Instrument, Civil/Structural):
  - Progress %: planned vs. actual with variance
  - SPI and CPI with RAG indicator
  - Key deliverables issued this period
  - Key deliverables due next period (with risk assessment)
  - Critical issues and mitigation actions
  - Interdisciplinary dependency status

#### Section 4: Engineering Change Management Summary
- New changes this period (number, scope description, estimated manhour impact)
- Changes in evaluation (pending decision)
- Approved changes implemented this period
- Cumulative change impact: manhours added, schedule impact, cost impact
- Trend chart showing change volume and cumulative impact over time

#### Section 5: Vendor Document Review Status
- Documents received vs. expected this period
- Documents reviewed and returned to vendor
- Documents overdue from vendor
- Review cycle time statistics (average days from receipt to return)
- Critical vendor documents impacting engineering progress

#### Section 6: Issue and Action Item Register
- New issues raised this period
- Issues resolved/closed this period
- Open issues carried forward (with aging and owner)
- Overdue actions requiring escalation
- Issue resolution trend (opened vs. closed per period)

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Overall Engineering Progress | Actual weighted progress vs. planned | Within 3% of plan | EDDR weighted calculation |
| IFC Issue Rate | IFC documents issued this period vs. plan | >90% of planned IFC per period | EDDR tracking |
| Engineering SPI | Earned progress / Planned progress | >0.95 | Earned value analysis |
| Review Cycle Time | Average days from IFR issue to comments resolution | <15 working days | Document tracking system |
| Open Issues Aging | Average age of unresolved engineering issues | <20 working days | Issue register analysis |

---

## Procedure

### Step 1: Collect Data from All Sources

- Retrieve the current EDDR snapshot from document control, ensuring all discipline leads have updated their deliverable progress percentages within the reporting window (cutoff date defined per reporting cycle)
- Import the earned value analysis output from track-engineering-manhours (ENGD-14) for the same reporting period, including per-discipline CPI, SPI, productivity indices, and resource forecasts
- Extract the current engineering schedule from the project scheduling tool, identifying the baseline comparison dates, float consumption, and critical path activities
- Pull the engineering issue register with all open items, new items raised this period, and items closed this period, including owner, due date, and current status
- Retrieve the engineering change register showing all changes in all states (pending, evaluating, approved, implemented, rejected) with associated manhour and schedule impacts
- Collect vendor document register data showing submissions received, reviews completed, reviews overdue, and comment status
- Retrieve the interdisciplinary interface register showing all interfaces with their resolution status and any blocking items

### Step 2: Normalize and Validate Data Quality

- Validate that all disciplines have submitted progress updates for the current period; flag any disciplines with stale data (last update older than reporting cutoff)
- Reconcile EDDR progress percentages against earned value calculations; investigate any discrepancy greater than 5% between EDDR-reported progress and EV-calculated progress
- Verify that the engineering schedule baseline has not been changed without formal re-baseline approval; flag any unauthorized baseline shifts
- Ensure issue register entries are complete (all required fields populated: description, owner, priority, due date, status, mitigation plan)
- Cross-validate change register manhour impacts against the earned value budget adjustments to ensure consistency
- Calculate data quality score for each data source (completeness, currency, internal consistency) and include in report as a data confidence indicator
- Document any data gaps or quality issues that affect report accuracy, with recommended corrective actions

### Step 3: Calculate Consolidated Metrics and Generate Visualizations

- Calculate overall engineering progress using weighted deliverable completion (weight = budgeted manhours per deliverable type) to prevent distortion from counting easy deliverables equally with complex ones
- Generate the engineering S-curve: cumulative planned progress, actual progress, and earned progress on a common time axis from engineering start to planned IFC completion
- Calculate per-discipline progress comparison: planned vs. actual for each discipline, ranked by variance to highlight worst performers
- Compute IFC issue rate: IFC deliverables issued in the period / IFC deliverables planned for the period, with cumulative trend
- Analyze engineering change volume and impact trends: changes per period, manhours per change, cumulative manhour growth as % of original budget
- Calculate vendor document review metrics: on-time submission rate, average review cycle time, overdue documents count
- Generate issue management metrics: new vs. closed issues per period (trend), average aging of open issues, overdue issue count

### Step 4: Prepare Discipline Narratives and Issue Analysis

- For each discipline with actual progress more than 3% behind plan, prepare a variance narrative explaining the root cause (e.g., late input data, resource shortage, scope change, design iteration, vendor information delay)
- For each discipline with CPI or SPI below 0.90, include specific corrective actions being taken and expected recovery timeline
- Identify cross-discipline cascading impacts: if process engineering is behind, what is the downstream impact on piping, instrument, and electrical disciplines? Quantify in weeks of delay where possible
- Highlight any critical path deliverables that are behind schedule, with the float consumed and remaining float, and the consequence of further delay
- Prepare a forward-looking risk section: milestones at risk in the next 2-4 weeks, resource gaps anticipated, pending decisions that are blocking progress
- Draft management attention items: the 3-5 most important things that require management decision or intervention to keep engineering on track
- Update the carry-forward issue list: bring forward all unresolved issues from the previous report, update their status, and highlight any that have exceeded their target resolution date

### Step 5: Assemble Report and Distribute

- Compile all sections into the standard report structure following the output specification (executive summary, dashboard, discipline status, changes, vendor documents, issues)
- Format the report for the target audience: if weekly, emphasize period activities and near-term risks; if monthly, include trend analysis and forecast
- If a client-specific template is required, map the standard content into the client format while ensuring no content is lost
- Generate a PowerPoint summary version for use in engineering review meetings (executive summary + key charts + issues on maximum 10 slides)
- Route the draft report through Engineering Manager for review and approval before distribution
- Distribute the approved report to the defined distribution list: Engineering Manager, Project Manager, Project Controls, Client Representative, and discipline leads
- Archive the issued report in the project document management system with the reporting period clearly identified for historical reference

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Progress percentages inconsistent with reality | Subjective assessments by discipline leads; optimism bias | Milestone-based progress measurement; cross-validate EDDR % against earned value |
| Report issued with stale data from one or more disciplines | Discipline lead did not update data by cutoff date | Firm cutoff dates with management escalation for non-compliance; data staleness indicator in report |
| Cascading impacts not identified | Report prepared discipline-by-discipline without cross-discipline analysis | Mandatory interdependency analysis step; schedule network analysis for cross-discipline impacts |
| Issues carried forward indefinitely without resolution | No accountability mechanism for issue closure | Issue aging metrics with automatic escalation thresholds; management review of aged items |
| Report becomes a historical record instead of a management tool | Focus on what happened rather than what needs attention | Structured executive summary emphasizing forward-looking risks, decisions needed, and actions required |
| Engineering change impact underreported | Changes evaluated individually without cumulative impact assessment | Cumulative change impact dashboard; change volume trend analysis; budget growth tracking |
| Vendor document delays not linked to engineering impact | Vendor document register managed separately from engineering progress | Cross-reference overdue vendor documents with dependent engineering deliverables; quantify schedule impact |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Overall engineering progress >5% behind plan for 2 consecutive periods | Immediate | Engineering Manager --> Project Manager with recovery plan |
| Any discipline SPI < 0.85 for 3 consecutive periods | 48 hours | Lead Discipline Engineer --> Engineering Manager for resource/scope review |
| Critical path deliverable behind schedule with zero remaining float | Immediate | Engineering Manager --> Project Manager --> Steering Committee for schedule recovery |
| Engineering change cumulative manhour impact >15% of original budget | 1 week | Engineering Manager --> Project Manager --> Change Control Board |
| Vendor document overdue >30 days with engineering impact | 48 hours | Procurement --> Vendor escalation with Engineering Manager visibility |
| Issue aging >45 days without resolution progress | Weekly | Issue owner --> Engineering Manager with formal explanation and revised resolution plan |
| Data quality score <80% for any source for 2 consecutive periods | 1 week | Data owner --> Engineering Manager; include data confidence caveat in report |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All metrics mathematically correct; data reconciles to source systems | Independent spot-check audit of 10% of reported metrics per period |
| Completeness | 25% | All disciplines covered; all sections populated; no blank or placeholder content | Section completeness checklist (13/13 sections populated = 100%) |
| Consistency | 15% | Metrics calculated using same methodology every period; trend data continuous | Period-over-period methodology review; no unexplained discontinuities |
| Format | 10% | Professional presentation; clear charts; executive summary on one page | Stakeholder feedback; template compliance check |
| Actionability | 10% | Executive summary identifies specific issues requiring specific management actions | Management assessment: "report enabled me to make a decision this period" (Y/N survey) |
| Traceability | 10% | Every metric traceable to source data; data cutoff date clearly stated | Source reference documentation; data freshness indicator on every section |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `track-engineering-manhours` (ENGD-14) | Earned value metrics (CPI, SPI, EAC), productivity data, resource forecasts | Critical |
| `manage-engineering-deliverables` (ENGD skill) | EDDR with deliverable status, progress %, planned/actual dates | Critical |
| `agent-execution` (Project Controls) | Engineering schedule baseline and current status, critical path analysis | Critical |
| `manage-engineering-change-orders` (ENGD skill) | Change register with manhour impacts, schedule impacts, cumulative growth | High |
| `manage-design-review-comments` (ENGD-17) | Review comment closure metrics, open comment aging | High |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| `agent-orchestrator` | Consolidated engineering status for project-level reporting | Weekly/monthly project status consolidation |
| `agent-execution` | Engineering schedule status for integrated schedule updates | Project schedule analysis and forecasting |
| All Stakeholders (Client, Management) | Engineering performance visibility for governance and decision-making | Project review meetings, steering committee |
| `manage-engineering-procurement-specs` (ENGD-13) | Specification availability status for procurement planning | Procurement package scheduling |
| `create-engineering-dossier` (ENGD-18) | Deliverable completion status for dossier planning | Handover planning and documentation completeness tracking |

---

## References

### Methodology References
- VSC OR Playbook -- Engineering Management and Reporting sections
- VSC Engineering Management Procedures -- Status Reporting Guide
- VSC Standard Engineering Status Report Template v3.0
- PMI PMBOK Guide (7th Edition) -- Performance Domain: Measurement

### Industry Standards
- AACE International Recommended Practice 10S-90 -- Cost Engineering Terminology
- ISO 21500:2021 -- Project, Programme and Portfolio Management: Context and Concepts
- CII (Construction Industry Institute) -- Engineering Productivity Measurement Best Practice
- IPA (Independent Project Analysis) -- Engineering Performance Benchmarking methodology

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
