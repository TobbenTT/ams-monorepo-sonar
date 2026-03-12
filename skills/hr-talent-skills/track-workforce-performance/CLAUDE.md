---
name: track-workforce-performance
description: "Track workforce performance review cycles, goal setting, 360 feedback, calibration, and PIP management. Triggers: 'performance review', 'evaluacion de desempeno', 'feedback 360', 'calibracion de desempeno', 'plan de mejora'."
---

# Track Workforce Performance

## Skill ID: HR-C-01
## Version: 1.0.0
## Category: C - Tracking (HR & Talent Agent)
## Priority: P2 - Medium

---

## Purpose

Track and manage the full performance management lifecycle for industrial operations workforces, including goal setting, periodic performance reviews, 360-degree feedback collection, calibration sessions, and Performance Improvement Plan (PIP) management. This skill maintains a living performance management system that ensures every employee has clear objectives, receives regular feedback, and is evaluated fairly against consistent standards.

Effective performance management is the engine that converts staffing plans and competency frameworks into actual operational results. Without structured performance tracking, organizations experience:

- **Misaligned objectives**: Operations teams working toward conflicting goals, particularly during ramp-up phases when priorities shift rapidly. Research by Gallup (2023) shows that only 30% of industrial workers can clearly state their performance objectives, leading to effort misdirection and wasted resources.
- **Talent attrition in critical roles**: High performers who do not receive recognition or development feedback leave at 2-3x the rate of those who receive structured performance conversations (McKinsey Industrial Workforce Survey, 2022). In remote mining and oil & gas operations, replacing a skilled operator costs 150-250% of annual salary when factoring recruitment, relocation, and ramp-up time.
- **Underperformance left unaddressed**: Without formal PIP processes, underperformance festers. In safety-critical environments, this directly increases incident risk. Chilean Direccion del Trabajo data shows that proper progressive discipline documentation (amonestaciones, PIP, desvinculacion) reduces wrongful termination claims (demandas laborales) by 60%.
- **Calibration drift**: Without cross-team calibration, supervisor rating inflation creates inequity. Top quartile industrial organizations conduct formal calibration sessions where managers collectively review and adjust ratings to ensure consistency across departments and shifts.
- **Regulatory exposure**: Chilean labor law (Codigo del Trabajo, Art. 160-161) requires documented performance evidence for justified termination (despido por necesidades de la empresa). Employers without structured performance records face indemnizacion penalties of 30 days per year of service plus the month of advance notice (mes de aviso).

This skill transforms performance management from an annual compliance exercise into a continuous, data-driven system that aligns individual goals with operational targets, identifies high potentials and underperformers early, and provides the documentation required for Chilean labor law compliance.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Performance Framework Design**: The agent must configure the performance management framework appropriate to the operation:
   - **Goal-Setting Methodology**: OKRs (Objectives and Key Results) for management and professional roles; SMART goals for operational and technical roles; KPI-based targets for frontline workers tied to production, safety, and quality metrics.
   - **Review Cadence**: Annual formal reviews with quarterly check-ins for salaried staff; semi-annual reviews for hourly/shift workers; monthly performance conversations during ramp-up phase (first 12 months of operations).
   - **Rating Scale**: 5-point scale (1 = Does Not Meet Expectations, 2 = Partially Meets, 3 = Meets Expectations, 4 = Exceeds Expectations, 5 = Significantly Exceeds) with behavioral anchors specific to each role family.
   - **Forced Distribution Guidance**: Optional bell curve target (10% top / 20% above / 40% meets / 20% below / 10% needs improvement) as calibration guide, not hard quota.

2. **360-Degree Feedback Integration**: The agent must support multi-source feedback:
   - **Feedback Sources**: Self-assessment, direct supervisor, peers (minimum 3), direct reports (for supervisors/managers), internal customers, and optionally external contractors or clients.
   - **Feedback Instrument**: Standardized questionnaire covering behavioral competencies (leadership, teamwork, communication, safety commitment, technical expertise, problem-solving) rated on frequency scale (Never / Rarely / Sometimes / Often / Always).
   - **Anonymity Rules**: All peer and direct-report feedback is anonymized and aggregated (minimum 3 responses per category to maintain anonymity). Supervisor feedback is attributed.
   - **Language**: Feedback instruments available in Spanish (Latin American) with technical terms preserved in English where standard.

3. **Calibration Process Management**: The agent must structure and track calibration sessions:
   - **Calibration Panels**: Department heads and HR partner review all ratings within their area, comparing performance evidence across individuals at the same level.
   - **Calibration Outputs**: Adjusted ratings, talent classification (9-box grid placement), succession nominations, PIP candidates, promotion candidates, retention risk flags.
   - **Documentation**: All calibration adjustments must be documented with rationale to support audit and legal compliance.

4. **Performance Improvement Plan (PIP) Management**: For employees rated below expectations:
   - **PIP Structure**: Clear identification of performance gaps, specific measurable improvement targets, support resources (training, mentoring, workload adjustment), timeline (typically 60-90 days in Chile), review checkpoints (biweekly), and clear consequences if targets are not met.
   - **Legal Compliance**: PIP documentation must satisfy Chilean Codigo del Trabajo requirements for justified termination (despido justificado), including: written notification to employee (carta de amonestacion), specific and measurable improvement criteria, reasonable timeline and support, and evidence of failure to improve.
   - **Escalation Path**: If PIP targets are not met, document evidence and escalate to HR-Legal for termination process (desvinculacion) per Chilean law.

5. **Goal Cascade and Alignment**: The agent must ensure vertical alignment:
   - **Level 1**: Company/site production targets, safety goals, financial targets (from executive team).
   - **Level 2**: Department/area KPIs derived from Level 1 (from department managers).
   - **Level 3**: Team/shift targets derived from Level 2 (from supervisors).
   - **Level 4**: Individual goals derived from Level 3 (from employee + supervisor).
   - **Alignment Check**: Every individual goal must trace to at least one Level 1-2 organizational objective.

6. **Performance Analytics**: The agent must generate performance intelligence:
   - Rating distributions by department, role family, tenure, shift, and demographics.
   - Goal achievement rates by quarter and by organizational unit.
   - Correlation between performance ratings and operational KPIs (production, safety incidents, quality).
   - PIP success/failure rates and time-to-resolution.
   - 360-feedback trend analysis (improvement or deterioration over cycles).
   - Retention risk scoring based on performance trajectory and engagement indicators.

7. **Language**: Spanish (Latin American / Chilean labor context) for all deliverables and employee-facing materials; English technical terms preserved where they are industry standard.

---

## Trigger / Invocation

```
/track-workforce-performance
```

### Natural Language Triggers
- "Set up performance reviews for the operations team"
- "Track goal achievement for Q2"
- "Run 360-degree feedback for the maintenance department"
- "Calibrate performance ratings across all departments"
- "Create a PIP for an underperforming employee"
- "Configurar ciclo de evaluacion de desempeno para la planta"
- "Crear plan de mejora de desempeno para trabajador"
- "Hacer calibracion de notas de desempeno entre jefaturas"
- "Generar reporte de cumplimiento de metas del equipo"
- "Preparar feedback 360 para supervisores de turno"

### Aliases
- `/performance-reviews`
- `/performance-tracking`
- `/evaluacion-desempeno`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `organizational_structure` | Current org chart with roles, departments, reporting relationships, and headcount | .xlsx / .docx | `create-org-design` / HR system |
| `employee_roster` | Active employee list with name, role, department, hire date, supervisor, contract type | .xlsx | HR system / mcp-sharepoint |
| `performance_cycle_config` | Performance cycle parameters: start/end dates, review cadence, rating scale, calibration schedule | Text / .docx | HR leadership / User |
| `organizational_goals` | Company and department-level objectives and KPIs for the performance period | .xlsx / .docx | Executive team / mcp-sharepoint |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `previous_cycle_data` | Performance ratings, goals, and calibration results from prior cycle | Clean-sheet cycle initiated |
| `competency_matrix` | Current competency assessments from `track-competency-matrix` | Behavioral competencies only (no technical competency overlay) |
| `360_feedback_instrument` | Custom 360-degree feedback questionnaire | VSC standard 360 instrument applied |
| `pip_templates` | PIP document templates compliant with Chilean labor law | VSC standard PIP template applied |
| `training_records` | Training completion data for development goal tracking | Training goals tracked manually |
| `production_kpis` | Actual production/safety/quality metrics for goal achievement calculation | Goal achievement based on supervisor assessment only |
| `attendance_records` | Attendance and punctuality data as performance input | Attendance not included in performance scoring |
| `incident_records` | Safety incident participation records | Safety performance based on team-level data only |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve Chilean Codigo del Trabajo requirements for performance documentation (Art. 160, 161, 162)
- Access Direccion del Trabajo (DT) guidelines on progressive discipline and termination documentation
- Pull industry performance benchmarks for operational roles (production rates, safety metrics, maintenance KPIs)
- Retrieve VSC standard performance review templates and 360 instruments
- Access goal-setting frameworks (OKR, SMART) with industrial sector examples
- Retrieve calibration session facilitation guides and 9-box grid methodology

---

## Output Specification

### Deliverable 1: Performance Management Report (.docx)

**Filename**: `{ProjectCode}_Performance_Management_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 25-40 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, performance cycle dates
2. **Executive Summary** (2-3 pages)
   - Overall performance distribution and key metrics
   - Goal achievement rates by department
   - Critical performance issues requiring management attention
   - PIP status summary and outcomes
   - Key recommendations for next cycle
3. **Performance Framework** (3-5 pages)
   - Goal-setting methodology and cascade structure
   - Rating scale with behavioral anchors
   - Review cadence and calendar
   - 360-feedback methodology
   - Calibration process overview
4. **Goal Achievement Analysis** (5-8 pages)
   - Goal completion rates by department, role family, and individual
   - Alignment analysis: individual goals to organizational objectives
   - Stretch goal vs. baseline achievement
   - Blocked or abandoned goals with root cause
5. **Performance Rating Distribution** (5-8 pages)
   - Overall rating distribution vs. target curve
   - Distribution by department, tenure band, shift, and contract type
   - Rating trend analysis (cycle-over-cycle)
   - Calibration adjustment summary (pre- vs. post-calibration distributions)
6. **360-Degree Feedback Summary** (3-5 pages)
   - Aggregate behavioral competency scores by role family
   - Highest and lowest rated competencies organization-wide
   - Self-assessment vs. others gap analysis
   - Development themes emerging from feedback
7. **PIP Management Summary** (3-5 pages)
   - Active PIPs: status, progress, and prognosis
   - Completed PIPs: success rate, average duration, outcomes
   - Legal compliance checklist for active PIPs
   - Escalation cases and resolutions
8. **Performance Intelligence** (3-5 pages)
   - High-potential identification (top 10% performers with growth trajectory)
   - Retention risk analysis (high performers with declining engagement)
   - Performance-to-competency correlation
   - Predictive indicators for next-cycle performance
9. **Appendices**
   - A: Individual performance summaries (confidential)
   - B: Goal achievement detail by employee
   - C: Calibration session minutes
   - D: PIP documentation templates

### Deliverable 2: Performance Tracking Workbook (.xlsx)

**Filename**: `{ProjectCode}_Performance_Tracker_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Employee Goals (individual goals with targets, actuals, % achievement), Rating Register (all ratings pre- and post-calibration), 360 Feedback Data (anonymized aggregated scores), PIP Tracker (active PIPs with milestones and status), Calibration Log (adjustments with rationale), Dashboard (summary KPIs and charts), Trend Analysis (multi-cycle comparison)

### Deliverable 3: Performance Dashboard (.pptx)

**Filename**: `{ProjectCode}_Performance_Dashboard_v{Version}_{YYYYMMDD}.pptx`

**Structure (10-12 slides)**: Overall performance health score, goal achievement rates, rating distribution charts, 360-feedback highlights, PIP status, high-potential summary, retention risk flags, next-cycle recommendations.

---

## Procedure

### Step 1: Configure Performance Framework and Goal Cascade
- Define the performance cycle parameters (dates, cadence, rating scale).
- Establish goal-setting methodology per role family (OKR for management, SMART for operational, KPI-based for frontline).
- Build goal cascade from organizational objectives (Level 1) down to individual goals (Level 4).
- Validate that every individual goal traces to at least one organizational objective.
- Configure 360-feedback instruments and identify rater pools.
- Output: Performance framework document, goal cascade map, configured 360 instruments.

### Step 2: Execute Performance Reviews and Collect Feedback
- Distribute self-assessment forms and 360-feedback instruments per configured cadence.
- Track completion rates and send reminders for outstanding submissions.
- Collect goal achievement evidence (production data, safety metrics, quality results, project milestones).
- Calculate goal achievement percentages against targets.
- Aggregate 360-feedback results ensuring anonymity thresholds are met.
- Output: Completed self-assessments, 360 aggregated reports, goal achievement data.

### Step 3: Facilitate Calibration and Finalize Ratings
- Prepare pre-calibration rating distribution analysis by department.
- Generate calibration session materials (rating comparisons, performance evidence summaries, proposed 9-box placements).
- Document calibration adjustments with rationale for each change.
- Finalize ratings and communicate to employees through structured feedback conversations.
- Identify PIP candidates (employees rated 1 or 2) and high-potential candidates (rated 4 or 5 with leadership potential).
- Output: Calibrated ratings, 9-box talent grid, PIP candidate list, high-potential list.

### Step 4: Manage PIPs and Development Actions
- For PIP candidates, draft PIP documents compliant with Chilean Codigo del Trabajo.
- Define specific, measurable improvement targets with 60-90 day timelines.
- Assign support resources (training, mentoring, workload adjustment).
- Schedule biweekly PIP review checkpoints and document progress.
- For employees who fail PIP, prepare termination documentation package (carta de desvinculacion, finiquito calculation inputs).
- For high potentials, create accelerated development plans linked to succession planning.
- Output: Active PIP documents, PIP progress reports, development action plans.

### Step 5: Generate Analytics and Prepare Deliverables
- Compile performance data into the Performance Management Report.
- Build the Performance Tracking Workbook with all analytical sheets.
- Generate the Performance Dashboard for executive presentation.
- Calculate performance-to-operational-KPI correlations.
- Produce retention risk scores and next-cycle recommendations.
- Archive all performance documentation for legal compliance (minimum 5-year retention per Chilean law).
- Output: All three deliverables validated and stored in project output folder.

---

## Quality Criteria

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Goal Alignment | 20% | Every individual goal traces to an organizational objective; no orphan goals | Goal cascade audit: sample 20% of individual goals and trace upward |
| Rating Consistency | 25% | Post-calibration ratings show consistent standards across departments and supervisors | Statistical analysis: compare rating distributions across managers; chi-square test for independence |
| Legal Compliance | 20% | PIP documentation meets Chilean Codigo del Trabajo requirements (Art. 160-162) | Legal review checklist: written notification, measurable criteria, reasonable timeline, evidence of support |
| Data Completeness | 15% | 100% of active employees have goals set and ratings recorded; >80% 360-feedback completion | Completion audit: count records vs. active employee roster |
| Analytical Accuracy | 10% | All calculations (goal achievement %, rating distributions, trend analysis) are arithmetically correct | Spot-check: recalculate 10% of metrics independently |
| Actionability | 10% | Reports include specific, implementable recommendations with owners and timelines | Stakeholder review: HR and line managers confirm recommendations are actionable |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-org-design` (Operations) | Organizational structure, role definitions, reporting relationships | Critical | Internal |
| `track-competency-matrix` (Operations) | Competency assessment data for performance-competency correlation | High | Internal |
| `calculate-operational-kpis` (Operations) | Production, safety, quality KPIs for goal achievement measurement | High | Internal |
| Agent HSE / `agent-hse` | Safety incident records, safety performance metrics per individual/team | Medium | mcp-sharepoint |
| `manage-employee-lifecycle` (HR & Talent) | Employee roster, contract types, tenure data, termination triggers | Critical | Internal |
| `plan-succession` (HR & Talent) | High-potential nominations, succession readiness data | Medium | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-succession` (HR & Talent) | 9-box talent grid, high-potential identification, performance trajectory data | Automatic after calibration |
| `plan-training-program` (Operations) | Development needs from performance reviews and PIPs | Automatic |
| `manage-employee-lifecycle` (HR & Talent) | PIP outcomes triggering termination or promotion processes | On PIP completion |
| `orchestrate-or-program` (Orchestrator) | Workforce performance readiness status for OR gate reviews | On request |
| `generate-or-report` (Orchestrator) | Performance management KPIs for consolidated OR reporting | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve employee data, store performance reports, access organizational goals | `GET /lists/{list}`, `POST /documents/{library}` |
| **mcp-excel** | Generate performance tracking workbook with formulas and charts | `POST /workbooks`, `PUT /sheets/{sheet}` |
| **mcp-hris** | Retrieve employee master data, submit performance ratings, access attendance records | `GET /employees`, `PUT /performance-ratings/{employee}` |

---

## References

- Chilean Codigo del Trabajo, Articles 160-162 (causales de terminacion, despido justificado, indemnizaciones)
- Direccion del Trabajo (DT) Dictamenes on performance evaluation and progressive discipline
- Gallup State of the Global Workplace Report (2023) -- performance management statistics
- McKinsey Industrial Workforce Survey (2022) -- retention and performance correlation
- SHRM Performance Management Toolkit -- goal-setting, 360-feedback, calibration best practices
- OKR methodology (Measure What Matters, John Doerr) adapted for industrial operations
- VSC OR Knowledge Base: `methodology/or-concepts/` workforce readiness sections

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-25 | VSC OR System | Initial skill creation for HR & Talent agent |
