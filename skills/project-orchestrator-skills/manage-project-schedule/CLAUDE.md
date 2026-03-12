---
name: manage-project-schedule
description: "Manage integrated project schedule with WBS decomposition, critical path analysis, resource loading, progress tracking, and baseline management. Support schedule risk analysis and look-ahead reporting. Triggers: 'project schedule', 'critical path', 'WBS', 'schedule baseline', 'look-ahead', 'milestone tracking'."
category: Project Orchestration (Agent 7 - Project Orchestrator)
priority: P1 - Critical
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Manage Project Schedule

## Skill ID: PO-004
## Version: 1.0.0
## Category: Project Orchestration (Agent 7 - Project Orchestrator)
## Priority: P1 - Critical

---

## Purpose

Manage the integrated project schedule for capital projects governed by the FEL (Front-End Loading) framework, encompassing WBS (Work Breakdown Structure) decomposition, critical path analysis, resource loading, progress tracking, baseline management, and schedule risk analysis. This skill provides the schedule backbone that enables all specialist agents to coordinate their work within a unified timeline and ensures that the project steering committee has accurate, timely visibility into schedule performance.

Schedule management is one of the three pillars of project controls (alongside cost and risk) and is fundamental to capital project governance. AACE International's Total Cost Management Framework identifies schedule development and control as a core competency area, while PMI's PMBOK 7th Edition emphasizes schedule management as essential to project delivery across all knowledge areas.

The challenge in capital project schedule management during FEL phases is progressive elaboration: the schedule evolves from a Level 1 summary during FEL1 to a Level 4 resource-loaded schedule by FEL3, with increasing detail, accuracy, and integration at each stage. This progressive development must maintain traceability to the WBS, alignment with the cost estimate (every cost element must map to schedule activities), and integration across all disciplines.

IPA research demonstrates that projects with high-quality schedules -- characterized by realistic durations, well-defined logic networks, adequate resource loading, and rigorous critical path analysis -- achieve schedule predictability within 5% of the approved baseline. Conversely, projects with poor schedule quality experience average schedule growth of 20-30%, with cascading impacts on cost, resource utilization, and operational readiness.

This skill implements schedule management aligned with the following standards:
- **AACE RP 37R-06**: Schedule Levels of Detail -- defines schedule levels (1 through 5) and their appropriate use
- **AACE RP 49R-06**: Identifying the Critical Path -- methodology for critical path identification and management
- **AACE RP 57R-09**: Integrated Cost and Schedule Risk Analysis -- schedule risk analysis methodology
- **PMI Practice Standard for Scheduling**: Scheduling best practices and techniques
- **GAO Schedule Assessment Guide**: Government Accountability Office best practices for schedule quality

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **WBS Structure (Levels 1-4)**:
   - **Level 1 (Project)**: Single node representing the entire project
   - **Level 2 (Phase/Area)**: Major phases (FEL1, FEL2, FEL3, Execution, Commissioning, Ramp-Up) or major facility areas
   - **Level 3 (Discipline/System)**: Discipline-based decomposition (Engineering, Procurement, Construction, Commissioning by system)
   - **Level 4 (Work Package)**: Lowest level of WBS containing individual work packages with assigned resources and durations
   - Every cost element in the estimate must map to at least one WBS element
   - Every WBS element must have a unique code, description, owner (responsible agent), and parent reference
   - WBS dictionary must be maintained with scope descriptions for each element

2. **Critical Path Identification and Management**:
   - Calculate the critical path using the Critical Path Method (CPM) per AACE RP 49R-06
   - Identify and monitor near-critical paths (total float < 10 working days)
   - Track critical path changes over time (critical path migration indicates schedule instability)
   - Maintain a critical path register with activities, durations, logic links, and float values
   - Report critical path length index (CPLI = critical path duration / project duration target)
   - Implement critical path drag analysis to identify which activities most constrain the schedule

3. **Float Analysis**:
   - Calculate total float and free float for all activities
   - Classify activities by float category: Critical (0 days), Near-Critical (1-10 days), Normal (11-30 days), High Float (>30 days)
   - Monitor float consumption trends (float erosion indicates emerging schedule risk)
   - Report negative float with root cause analysis and mitigation plan
   - Track float ownership (contractor float vs. owner float vs. project float per contractual definitions)

4. **Resource Loading and Leveling**:
   - Load resources (labor by craft, equipment by type, materials by category) onto schedule activities
   - Generate resource histograms by discipline, craft, and area
   - Identify resource conflicts (peaks exceeding availability)
   - Perform resource leveling within float constraints (do not extend critical path)
   - Validate resource loading against staffing plans from HR (AG-011)
   - Integrate resource costs with cost estimate from Finance (AG-010)

5. **Baseline Management**:
   - **Original Baseline (BL0)**: First approved schedule baseline, never modified
   - **Current Baseline (BLn)**: Latest approved baseline incorporating approved changes
   - **Forecast Schedule**: Working schedule with current progress and remaining duration estimates
   - Every baseline change must be linked to an approved change request (from manage-project-change-control)
   - Maintain baseline comparison capability (BL0 vs. BLn vs. Forecast)
   - Calculate schedule variance: SV = BCWP - BCWS (in days and cost terms)

6. **Schedule Variance Tracking**:
   - Calculate Schedule Performance Index (SPI) = BCWP / BCWS
   - Calculate Schedule Variance (SV) = BCWP - BCWS
   - Calculate Earned Schedule (ES) for time-based performance measurement
   - Calculate To-Complete Schedule Performance Index (TSPI) for feasibility assessment
   - Report variance at WBS Level 2 and Level 3 with root cause analysis
   - Flag activities with variance >10% for investigation

7. **Look-Ahead Reporting**:
   - **2-Week Look-Ahead**: Detailed activity-level report for near-term execution coordination
   - **4-Week Look-Ahead**: Summary of upcoming milestones and critical activities
   - **90-Day Look-Ahead**: Strategic view of upcoming phase transitions, gate reviews, and resource ramp
   - Each look-ahead includes: activities starting, activities finishing, milestones due, resource requirements, constraints and prerequisites, risk events
   - Look-ahead compliance tracking (planned vs. actual completion of look-ahead activities)

8. **Milestone Tracking**:
   - Maintain milestone register with planned, baseline, forecast, and actual dates
   - Classify milestones: Key (steering committee visibility), Intermediate (project team), Contractual (legally binding)
   - Calculate milestone trend (ahead, on-track, at-risk, delayed) with trend direction
   - Generate milestone variance report with explanation for any milestone >5 days from baseline
   - Track milestone achievement rate as a schedule quality metric

9. **Schedule Risk Analysis**:
   - Identify schedule risk events and their potential duration impact
   - Assign probability distributions to activity durations (triangular or beta distributions)
   - Perform Monte Carlo simulation to generate probabilistic completion dates (P10, P50, P80, P90)
   - Calculate schedule contingency (difference between P50 and deterministic finish)
   - Identify activities with highest correlation to project completion date (sensitivity analysis)
   - Report confidence level for achieving contractual or target milestones

**Constraints:**
- Must maintain WBS-cost-schedule integration (every cost element maps to a schedule activity)
- Must integrate with EVM system for SPI and SV calculations
- Must support multiple baseline comparisons
- Must handle schedule changes only through formal change control process
- Must accommodate contractor schedules (import, validate, integrate)
- Must support progressive elaboration from Level 1 (FEL1) to Level 4 (FEL3/Execution)
- Must produce outputs in Spanish (Latin American) with English technical terms preserved
- Must flag any schedule with BEI (Baseline Execution Index) < 0.85 for corrective action

---

## Trigger / Invocation

```
/manage-project-schedule
```

### Command Triggers
- `manage-project-schedule create --level [1|2|3|4] --project [name] --wbs [file]`
- `manage-project-schedule update --progress --period [YYYY-MM-DD]`
- `manage-project-schedule critical-path --analyze`
- `manage-project-schedule float --report`
- `manage-project-schedule baseline --set --version [BLn]`
- `manage-project-schedule baseline --compare --versions [BL0,BLn,Forecast]`
- `manage-project-schedule look-ahead --period [2week|4week|90day]`
- `manage-project-schedule milestones --status`
- `manage-project-schedule risk-analysis --simulate --iterations [10000]`
- `manage-project-schedule resource --histogram --discipline [all|specific]`
- `manage-project-schedule report --type [status|variance|milestone|resource|risk]`

### Natural Language Triggers
- "What is the current critical path?"
- "Show me the 2-week look-ahead"
- "Which milestones are at risk?"
- "Perform a schedule risk analysis"
- "Compare the current forecast to the original baseline"
- "What is the SPI for the engineering phase?"
- "Generate the resource histogram for construction trades"
- "Update progress for the current reporting period"

### Aliases
- `/project-schedule`
- `/schedule-management`
- `/critical-path`
- `/look-ahead`

### Automatic Triggers
- Weekly progress update cycle (update progress, generate look-ahead)
- Monthly reporting cycle (generate schedule status report, milestone report, variance analysis)
- SPI drops below 0.90 on any WBS Level 2 element (trigger variance investigation)
- Critical path change detected (trigger critical path migration report)
- Negative float detected on any activity (trigger immediate escalation)
- Approved change request requires schedule baseline update
- Gate review within 30 days (trigger milestone and critical path assessment)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| WBS Dictionary | Project Controls / Project Orchestrator | Yes | .xlsx | Work Breakdown Structure with element codes, descriptions, and ownership |
| Activity List | All Specialist Agents | Yes | .xlsx | Activities with durations, logic links, and resource assignments per WBS element |
| Resource Availability | HR (AG-011) / Project Management | Yes | .xlsx | Available resources by craft, discipline, and time period |
| Cost Estimate | Finance (AG-010) | Yes | .xlsx | Cost estimate mapped to WBS elements for cost-schedule integration |
| Calendar Definition | Project Management | Yes | .xlsx | Working calendar (work days, holidays, shift patterns) |
| Milestone Register | Project Management / Orchestrator (AG-001) | Yes | .xlsx | Required milestones with target dates and classification |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Contractor Schedules | Contracts (AG-005) | No | .xlsx / .xer | Contractor activities not integrated (owner schedule only) |
| Progress Data | All Specialist Agents | No | .xlsx | Zero progress assumed for initial schedule |
| Risk Register | HSE (AG-004) | No | .xlsx | No risk-adjusted schedule analysis |
| Historical Duration Data | VSC Knowledge Base | No | .xlsx | Industry standard durations applied |
| Weather Data | Project Management | No | .xlsx | No weather-adjusted calendar |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve WBS from project controls data and validate against cost estimate
- Access activity progress data from specialist agents via delegation register
- Pull resource availability from HR agent (AG-011) staffing plans
- Retrieve approved changes from manage-project-change-control for baseline updates
- Access risk register from HSE agent (AG-004) for schedule risk analysis inputs
- Query VSC knowledge base for benchmark durations by activity type, industry, and project size

---

## Output Specification

### Document 1: Schedule Status Report (.docx)

**Filename**: `{ProjectCode}_Schedule_Status_Report_{Period}_{YYYYMMDD}.docx`

**Target Length**: 15-25 pages

**Structure:**

1. **Executive Summary** (1-2 pages)
   - Overall schedule health (SPI, completion date forecast, critical path status)
   - Key achievements during period
   - Critical issues and management attention items
2. **Schedule Performance Summary** (2-3 pages)
   - SPI by WBS Level 2, trend chart over last 6 periods
   - Earned Schedule metrics (ES, SV(t), SPI(t))
   - TSPI feasibility assessment
   - Baseline comparison (BL0 vs. Current BL vs. Forecast)
3. **Critical Path Analysis** (2-3 pages)
   - Current critical path activities with float analysis
   - Critical path changes since last period (migration analysis)
   - Near-critical paths and float erosion trends
   - Critical path drag analysis (which activities constrain the most)
4. **Milestone Status** (2-3 pages)
   - Milestone register with planned, baseline, forecast, and actual dates
   - Milestone variance analysis for any milestone >5 days from baseline
   - Milestone achievement rate and trend
5. **Look-Ahead (4-Week)** (2-3 pages)
   - Activities starting and completing in the next 4 weeks
   - Milestones due in the next 4 weeks
   - Resource requirements and constraints
   - Prerequisites and risk events
6. **Resource Status** (2-3 pages)
   - Resource histogram (planned vs. actual) by major craft/discipline
   - Resource conflicts and leveling actions
   - Forecast resource requirements for next quarter
7. **Schedule Risk Summary** (1-2 pages)
   - P50 and P80 completion dates from most recent risk analysis
   - Top 5 schedule risk drivers (highest correlation to completion date)
   - Schedule contingency status
8. **Variance Analysis** (2-3 pages)
   - Activities with SV >10% -- root cause and corrective action
   - Float consumption analysis -- activities consuming float faster than expected
   - Late starts and late finishes with explanation
9. **Recommendations** (1 page)
   - Schedule improvement actions
   - Resource adjustments needed
   - Risk mitigation actions recommended

### Document 2: Schedule Database (.xlsx)

**Filename**: `{ProjectCode}_Schedule_Database_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **WBS Dictionary** -- Complete WBS with codes, descriptions, owners, and scope statements
2. **Activity Register** -- All activities with ID, WBS, description, duration, logic, resources, float, status
3. **Milestone Register** -- All milestones with planned, baseline, forecast, actual dates, variance, trend
4. **Critical Path** -- Current critical path activities with float and drag values
5. **Resource Loading** -- Resource assignments by activity, with planned and actual hours
6. **Resource Histogram** -- Aggregated resource requirements by period, craft, and discipline
7. **Baseline Comparison** -- BL0, BLn, Forecast dates for all activities with variance
8. **Progress Data** -- Period-by-period progress percentages for all activities
9. **Risk Analysis Results** -- Monte Carlo simulation outputs (P10, P50, P80, P90 dates, sensitivity)
10. **Look-Ahead 2-Week** -- Detailed near-term activity list with daily granularity

### Document 3: Look-Ahead Report (.docx)

**Filename**: `{ProjectCode}_Look_Ahead_{Period}_{YYYYMMDD}.docx`

**Structure (2-Week version):**

1. **Summary** -- Total activities planned, completed, compliance rate
2. **Activities Starting This Week** -- Detailed list with prerequisites, resources, responsible party
3. **Activities Starting Next Week** -- Same detail
4. **Activities Completing This Period** -- Expected completions with verification criteria
5. **Milestones Due** -- Milestones within the look-ahead window
6. **Constraints and Prerequisites** -- Items that must be resolved for activities to proceed
7. **Resource Requirements** -- Craft and equipment needs for the period
8. **Previous Look-Ahead Compliance** -- Comparison of last period's plan vs. actual execution

---

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| WBS-Schedule-Cost Integration | 25% | Every cost element maps to at least one schedule activity | 100% |
| Critical Path Validity | 20% | Critical path calculated correctly with no open ends, no negative lag > 5 days, no constraints overriding logic | 100% compliant |
| Baseline Integrity | 20% | Every baseline change linked to an approved change request | 0 unauthorized changes |
| Progress Accuracy | 15% | Progress data updated within 2 business days of data date | >95% |
| Look-Ahead Compliance | 10% | Activities planned in look-ahead actually started/completed as planned | >85% |
| Schedule Quality Score | 10% | GAO Schedule Assessment Guide 10-point quality check score | >8/10 |

### GAO Schedule Quality Checks (Automated)

- [ ] Complete: All activities have predecessors and successors (no open ends except project start/finish)
- [ ] Well-constructed: No negative lags, minimal use of constraints, no date constraints overriding logic
- [ ] Credible: Durations are realistic (no 0-day activities except milestones, no activities >60 working days without decomposition)
- [ ] Controlled: Baseline established, progress updated, variance tracked
- [ ] Horizontal traceability: Activities link to WBS and cost elements
- [ ] Vertical traceability: Summary activities correctly roll up from detailed activities
- [ ] Resource loaded: All activities Level 3 and below have resource assignments
- [ ] Logic density: Logic links per activity ratio between 1.5 and 2.5 (indicates healthy logic network)
- [ ] Critical path valid: Single continuous critical path from project start to project finish
- [ ] Risk-informed: Schedule risk analysis performed with probabilistic completion dates

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| Engineering Design (AG-008) | Engineering Milestones | Engineering design milestones, EDDR completion dates, IFC issue schedule | Critical |
| Construction Management (AG-009) | Construction Milestones | Construction activity durations, sequence logic, MC milestone dates | Critical |
| Execution (AG-006) | Overall Schedule | Master project schedule baseline, EVM progress data, phase milestones | Critical |
| Contracts & Compliance (AG-005) | Procurement Milestones | Long-lead equipment delivery dates, contract award milestones, vendor schedule | Critical |
| Finance & Accounting (AG-010) | Cost-Schedule Integration | Cost estimate mapped to WBS for time-phased budget and EVM integration | High |
| HR & Talent (AG-011) | Resource Availability | Staffing ramp plan, recruitment timeline, resource availability calendar | High |
| Operations (AG-002) | OR Milestones | Operational readiness milestones, training completion, SOP delivery dates | High |
| HSE (AG-004) | Safety Milestones | HAZOP schedule, permit timelines, PSSR milestones, safety review dates | Medium |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| All Specialist Agents | Schedule Dates | Milestone dates, activity windows, and deadlines for delegation planning | On baseline approval or update |
| Execution (AG-006) | EVM Integration | Schedule data for SPI calculation, earned schedule metrics, completion forecasts | Weekly progress update |
| Finance & Accounting (AG-010) | Cash Flow | Time-phased cost distribution for cash flow forecasting | Monthly / On baseline change |
| Orchestrator (AG-001) | Governance | Schedule status, milestone performance, and critical path reports for OR governance | Weekly / Monthly |
| coordinate-project-delegation (PO-001) | Deadline Setting | Schedule dates used to set delegation deadlines | On delegation creation |
| generate-fel-gate-review (PO-003) | Gate Input | Schedule status section of gate review package | On gate review assembly |

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **AACE RP 37R-06** | Schedule Levels of Detail -- defines Level 1 through 5 schedule characteristics |
| **AACE RP 49R-06** | Identifying the Critical Path -- critical path methodology and management |
| **AACE RP 57R-09** | Integrated Cost and Schedule Risk Analysis -- Monte Carlo methodology |
| **PMI Practice Standard for Scheduling** | Scheduling techniques, calendar management, resource loading |
| **GAO Schedule Assessment Guide** | Schedule quality assessment criteria (10-point checklist) |
| **PMI PMBOK 7th Edition** | Schedule management process, EVM integration, baseline management |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **AACE RP 52R-06** | Time Impact Analysis -- methodology for assessing schedule impacts of changes |
| **AACE RP 29R-03** | Forensic Schedule Analysis -- delay analysis techniques |
| **DCMA 14-Point Schedule Assessment** | U.S. Defense Contract Management Agency schedule health checks |
| **ISO 21500:2021** | Project management schedule governance and reporting |

---

## Templates & References

### Document Templates
- `VSC_Schedule_Status_Report_Template_v1.0.docx` -- Monthly schedule status report
- `VSC_Schedule_Database_Template_v1.0.xlsx` -- Schedule database workbook with all sheets
- `VSC_Look_Ahead_Report_Template_v1.0.docx` -- 2-week and 4-week look-ahead
- `VSC_WBS_Dictionary_Template_v1.0.xlsx` -- WBS with codes, descriptions, and ownership
- `VSC_Milestone_Register_Template_v1.0.xlsx` -- Milestone tracking register

### Reference Data Sources
- AACE Recommended Practices library (37R-06, 49R-06, 52R-06, 57R-09)
- GAO Schedule Assessment Guide (10-point quality checklist)
- VSC historical schedule data by project type (mining, oil and gas, chemicals, power)
- Industry benchmark durations for common capital project activities
- Resource productivity rates by region, craft, and project type

---

## Examples

**Example 1: FEL2 Schedule Development**
```
Command: manage-project-schedule create --level 3 --project "Atacama Lithium" --wbs "LIT-WBS-v2.xlsx"

Schedule Created: LIT-SCH-BL0-v1
  Level: 3 (Discipline/System)
  Total Activities: 1,247
  Total Milestones: 86 (23 Key, 41 Intermediate, 22 Contractual)
  Duration: 42 months (FEL2 start to first production)
  Critical Path: Grinding circuit procurement → foundation → installation → commissioning
  Critical Path Length: 38 months (4 months float to completion target)
  Resource Peak: 1,850 FTE in Month 24 (construction peak)
  P50 Completion: November 2028
  P80 Completion: February 2029

  Schedule Quality (GAO 10-Point):
    Complete: PASS (0 open ends)
    Well-constructed: PASS (2 soft constraints, justified)
    Credible: PASS (max duration 45 working days)
    Logic density: 1.8 links/activity (healthy)
    Resource loaded: PASS (100% Level 3 activities)
    Overall Score: 9/10
```

**Example 2: Critical Path Migration Alert**
```
Command: manage-project-schedule critical-path --analyze

Critical Path Analysis (Period: March 2026):
  Current Critical Path:
    → SAG Mill procurement (12 weeks remaining)
    → SAG Mill foundation concrete (8 weeks)
    → SAG Mill installation (6 weeks)
    → Grinding circuit commissioning (4 weeks)
    → Integrated commissioning (6 weeks)
    Total: 36 weeks to completion

  ALERT: Critical path migrated from "Flotation circuit" to "Grinding circuit"
  Cause: SAG Mill vendor delivery delayed 3 weeks (supply chain issue)
  Impact: Project completion date shifted from Nov 15 to Dec 06 (+21 calendar days)
  Near-critical paths:
    - Flotation circuit: 8 days total float (was critical, now near-critical)
    - Electrical systems: 12 days total float (unchanged)

  Recommendation: Expedite SAG Mill delivery through vendor acceleration
    program. Estimated cost: $180K for air freight of critical components.
    Schedule recovery: 14 of 21 days recoverable.
```
