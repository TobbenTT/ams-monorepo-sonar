---
name: manage-engineering-deliverables
description: "Manage the Engineering Document Deliverable Register (EDDR) tracking all engineering deliverables from planned through IFC across all disciplines. Triggers: 'engineering deliverables', 'EDDR status', 'deliverable tracking', 'IFC tracking', 'registro de entregables de ingenieria', 'seguimiento de entregables'."
---

# Manage Engineering Deliverables
## Skill ID: manage-engineering-deliverables
## Version: 1.0.0
## Category: D - Monitoring
## Priority: Critical

## Purpose

The Engineering Document Deliverable Register (EDDR) is the master tracking system for every drawing, calculation, specification, data sheet, and report produced by all engineering disciplines on a capital project. Without a rigorous EDDR, engineering progress is unmeasurable, construction cannot plan material procurement or work fronts around Issued-for-Construction (IFC) documents, and project management operates blind to the largest single cost driver in the engineering phase.

In large industrial projects -- mining concentrators, oil and gas processing facilities, chemical plants, power stations -- the EDDR typically contains 3,000 to 15,000 individual deliverables spanning 8-12 engineering disciplines. Each deliverable follows a lifecycle from initial planning through drafting, internal checking, interdisciplinary review, client review, approval, and final IFC issue. The weighted progress of these deliverables against the baseline schedule is the primary metric for engineering completion and the foundation for earned value measurement of engineering work.

The consequences of poor deliverable management are severe and well-documented: late IFC packages delay construction mobilization (each week of construction delay on a major project costs USD 500K-2M in idle resources), missing or incomplete deliverables cause field rework (industry data shows 5-10% of construction cost attributable to design-related rework), and uncontrolled revision cycles erode engineering productivity. This skill provides the systematic framework to register, weight, track, forecast, and report on every engineering deliverable, ensuring that engineering completion is measurable, predictable, and aligned with the construction schedule.

The EDDR also serves as the contractual record of engineering scope delivery, defining what was agreed to be produced, when it was due, and when it was actually delivered. This is critical for EPC contract administration, variation claims, and schedule delay analysis. In multi-contractor projects, the EDDR provides the single integrated view across all engineering providers, enabling the project owner to monitor consolidated engineering completion regardless of the contractual structure.

## Intent & Specification
The AI agent MUST understand that:

1. **The EDDR is the single source of truth** for engineering scope. Every document to be produced must be registered with:
   - Unique document number following the project numbering convention
   - Document title
   - Discipline code
   - Document type
   - Planned issue dates for each milestone (IFR, IFA, IFC)
   - If a deliverable is not in the EDDR, it does not exist for project controls purposes. The register must be reconciled weekly with the document control master list to ensure no deliverables are orphaned or unregistered.

2. **Progress measurement must be weight-based**, not count-based. A P&ID revision carries significantly more engineering effort than a typical instrument datasheet. Each document type has a standard weight factor (typically expressed in equivalent manhours). Progress is calculated as:
   - Sum of weighted completions / total weighted scope
   - Counting documents as equal grossly misrepresents actual engineering progress
   - The weight table must be validated by discipline leads at project setup
   - Weight factors must be calibrated against actual productivity data quarterly

3. **Deliverable status codes must follow a defined lifecycle**: Planned, In-Progress, Internal-Check, Issued-for-Review (IFR), Under-Client-Review, Issued-for-Approval (IFA), Approved, Issued-for-Construction (IFC), As-Built. Each status transition has defined entry criteria and must be recorded with:
   - Date of status change
   - Responsible person
   - Transmittal reference number
   - Status regression (e.g., IFA back to In-Progress) must be flagged and investigated.

4. **The EDDR must link to the construction schedule** to identify critical-path deliverables. A deliverable is critical when its late IFC directly delays a construction activity. The agent must:
   - Calculate float between planned IFC dates and construction need-by dates
   - Prioritize engineering effort on the deliverables that matter most
   - Recalculate float monthly as the construction schedule is updated
   - Flag any deliverable where float is zero or negative

5. **Forecasting must be proactive, not reactive**. The agent must detect slippage trends at the discipline level, calculate forecast completion dates using earned value methods (planned progress vs. actual progress S-curves), and alert the project team when the engineering completion forecast exceeds the baseline target date. Forecasting must account for historical productivity rates and known resource constraints.

## Trigger / Invocation
```
/manage-engineering-deliverables
```

### Natural Language Triggers
- "What is the current engineering deliverable status for the project?"
- "Show me overdue IFC deliverables for the mechanical discipline"
- "Calculate weighted engineering progress by discipline"
- "Cual es el estado actual del registro de entregables de ingenieria?"
- "Mostrar entregables IFC atrasados por disciplina"
- "Calcular progreso ponderado de ingenieria por area"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `project_code` | Unique project identifier for file naming and context | String | Project context |
| `deliverable_register` | Master list of all engineering deliverables with document numbers, titles, disciplines, and document types | .xlsx / .csv | Document Control system or Engineering Manager |
| `baseline_schedule_dates` | Planned IFR, IFA, and IFC dates for each deliverable aligned with the approved project schedule | .xlsx / .mpp extract | Project Controls / Execution Agent |
| `weight_table` | Document type weighting factors defining the relative effort for each deliverable type by discipline | .xlsx | Engineering Manager or project standard |
| `actual_status_data` | Current status and actual dates for each deliverable (latest revision issued, current lifecycle stage) | .xlsx / .csv | Document Control system |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `construction_need_dates` | Construction-required-by dates for each deliverable or package, driven by the construction schedule | Assume IFC date = construction need date |
| `vendor_document_schedule` | Vendor data submission schedule linked to procurement packages for integrated tracking | Not included in scope tracking |
| `previous_period_report` | Prior period EDDR status report for delta analysis and trend comparison | First report assumes no prior baseline |
| `resource_allocation` | Discipline staffing levels and availability for forecasting productivity | Not factored into forecast |

### Context Enrichment
The agent should automatically:
- Cross-reference the deliverable register against the document control master list to identify any deliverables not yet registered or recently added through scope changes
- Pull the latest actual status dates from the document control system to ensure the EDDR reflects the current state, not stale data from the last manual update
- Compare planned IFC dates against the construction schedule to identify deliverables with negative float (IFC date later than construction need date) that require immediate prioritization
- Retrieve discipline staffing data from the Execution agent to correlate engineering resource availability with deliverable production rates and validate forecast assumptions
- Check for engineering change notices (ECNs) that may have added or removed deliverables from the scope since the last baseline update, reconciling the EDDR scope with the current approved scope

## Output Specification

### Document: Engineering Deliverable Status Report (.xlsx)
**Filename**: `VSC_EDDRStatus_{ProjectCode}_v{Version}_{Date}.xlsx`

**Structure**:

1. **Executive Dashboard**
   - Overall engineering progress: planned vs. actual S-curves (weighted and unweighted)
   - IFC completion percentage: planned vs. actual
   - Total overdue count with trend arrow (improving/worsening)
   - Overdue count by discipline in horizontal bar chart
   - Forecast completion date vs. baseline target date
   - Traffic-light status by discipline: Green (on plan or ahead), Amber (1-3% behind), Red (>3% behind)
   - Summary of top 5 schedule risks ranked by construction impact

2. **Master EDDR Register**
   - Document number
   - Document title
   - Discipline code
   - Document type
   - Assigned weight (manhour equivalent)
   - Planned dates: IFR, IFA, IFC
   - Actual dates: IFR, IFA, IFC
   - Current status code (per lifecycle definitions)
   - Current revision number
   - Float to construction need date (calendar days)
   - Responsible engineer
   - Transmittal reference for last issued revision
   - Remarks

3. **Discipline Progress Summary**
   - One row per discipline showing:
   - Total deliverable count
   - Total weighted scope (manhour equivalent)
   - Weighted progress planned (%)
   - Weighted progress actual (%)
   - Variance: actual minus planned (percentage points)
   - IFC count planned and IFC count actual
   - IFC variance
   - Discipline forecast completion date with confidence level

4. **Overdue Deliverable Analysis**
   - All deliverables past their planned date at any lifecycle stage
   - Document number, title, discipline
   - Planned date and days overdue
   - Aging category: 1-2 weeks (amber) / 2-4 weeks (orange) / >4 weeks (red)
   - Documented root cause
   - Forecast recovery date
   - Impact assessment: what construction activity is affected
   - Assigned action owner

5. **Critical Path Deliverables**
   - Deliverables where planned or forecast IFC date has zero or negative float
   - Sorted by float ascending (most critical first)
   - Document number, discipline, planned IFC, forecast IFC
   - Construction need date and float (days)
   - Construction activity affected
   - Recommended action

6. **Weekly Delta Report**
   - Newly registered deliverables (scope additions)
   - Deliverables with status changes (from-status to to-status)
   - Newly issued IFCs during the period
   - Deliverables newly added to overdue list
   - Deliverables recovered from overdue (back on track)
   - Scope changes: deliverables added or removed via ECN

### Deliverable Status Code Definitions
| Code | Status | Description | Entry Criteria | Progress Credit |
|------|--------|-------------|----------------|-----------------|
| PL | Planned | Deliverable registered, work not started | Document registered in EDDR | 0% |
| IP | In-Progress | Active engineering work underway | Resource assigned, work commenced | 10% |
| IC | Internal Check | Draft complete, under discipline internal checking | Checker assigned, draft issued for check | 25% |
| IFR | Issued for Review | Issued for interdisciplinary or client review | Transmittal issued; transmittal number recorded | 40% |
| UCR | Under Client Review | Submitted to client, awaiting comments | Client acknowledgment of receipt | 50% |
| IFA | Issued for Approval | Client comments incorporated, resubmitted for approval | Transmittal issued with comment responses | 70% |
| APP | Approved | Client has formally approved the deliverable | Client approval letter or stamp received | 85% |
| IFC | Issued for Construction | Final version issued for field use | IFC transmittal issued to construction | 100% |
| AB | As-Built | Updated with as-built field information post-construction | As-built markup incorporated and verified | 100% |

### Standard Document Type Weight Table (Example)
| Document Type | Typical Weight Factor | Discipline Example |
|--------------|----------------------|-------------------|
| P&ID | 40-60 | Process |
| Process Flow Diagram (PFD) | 25-35 | Process |
| Equipment Data Sheet | 8-15 | Process / Mechanical |
| Piping Isometric Drawing | 3-6 | Piping |
| Piping General Arrangement | 15-25 | Piping |
| Structural Steel Drawing | 10-20 | Structural |
| Electrical Single Line Diagram | 20-30 | Electrical |
| Instrument Loop Drawing | 5-10 | Instrumentation |
| Civil Foundation Drawing | 15-25 | Civil |
| Design Calculation Report | 10-20 | All disciplines |
| Technical Specification | 15-25 | All disciplines |

### Key Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| Overall Weighted Progress | Sum of weighted completions / total weighted scope | Per baseline S-curve (+/- 2%) |
| IFC Completion Rate | Number of IFC-issued deliverables / total deliverables requiring IFC | Per baseline schedule |
| Overdue Deliverable Count | Deliverables past planned date by lifecycle stage | Zero overdue at IFC milestone |
| Forecast Completion Variance | Forecast completion date minus baseline completion date | Zero or negative (ahead of schedule) |
| Critical Path Float | Minimum float between IFC date and construction need date | > 2 weeks positive float |

## Procedure

### Step 1: Establish the EDDR Baseline
- Import the complete deliverable register from the document control system, validating each entry has:
  - Unique document number conforming to the project numbering convention
  - Discipline code
  - Document type
  - Title
- Assign weight factors to each deliverable using the approved weight table:
  - For document types not in the weight table, propose a weight based on the closest analogous type
  - Flag proposed weights for Engineering Manager approval within 5 working days
- Import baseline schedule dates (IFR, IFA, IFC) for each deliverable from the project schedule:
  - Validate that dates are logically sequenced (IFR before IFA before IFC)
  - Flag any deliverable where IFC date precedes the IFR date
- Build the planned progress S-curve:
  - Sum weighted milestones by reporting period (typically weekly or biweekly)
  - Create the baseline engineering completion curve as the reference for all progress reporting
- Cross-reference with the construction schedule to populate construction need-by dates:
  - Calculate float for each IFC deliverable
  - Flag any deliverables where the planned IFC date is already later than the construction need date
- Identify and flag deliverables with negative float for immediate attention:
  - Notify the Engineering Manager with a recommended reprioritization action
  - Include in the first EDDR report as Critical Path Deliverables
- Validate the total deliverable count and weighted scope with each discipline lead:
  - Confirm the scope baseline is complete and agreed
  - Obtain discipline lead sign-off before publishing the first EDDR report

### Step 2: Capture Current Status and Calculate Progress
- Import the latest actual status data from the document control system:
  - Record actual dates for each lifecycle milestone achieved
  - Record the current status code for every deliverable using the defined status code table
- Validate that each status claim is supported by documentary evidence:
  - IFR requires a transmittal number
  - IFA requires a re-submission transmittal
  - IFC requires an IFC transmittal to construction
  - No status credit without proof
- Calculate weighted actual progress:
  - Sum the weighted value of completed milestones for each deliverable
  - Apply the progress credit percentages: PL=0%, IP=10%, IC=25%, IFR=40%, UCR=50%, IFA=70%, APP=85%, IFC=100%
- Build the actual progress S-curve and overlay on the planned curve:
  - Visualize the engineering progress position
  - Calculate the area between curves as a measure of cumulative slippage
- Calculate progress variance by discipline and overall:
  - Positive variance = ahead of plan; negative = behind
  - Present variance in both percentage points and equivalent working days
- Identify deliverables that have changed status since the last reporting period:
  - Capture both status advances and status regressions for the delta report
- Flag any deliverables with status regression (e.g., IFA back to In-Progress):
  - Require the discipline lead to document the reason
  - Require estimated recovery time

### Step 3: Analyze Overdue Deliverables and Develop Forecast
- Generate the overdue deliverable list:
  - Compare actual status against planned dates for each lifecycle stage
  - A deliverable is overdue when its planned milestone date has passed but the milestone has not been achieved
- Categorize overdue items by aging:
  - 1-2 weeks: amber
  - 2-4 weeks: orange
  - > 4 weeks: red
- For each overdue deliverable, require the responsible discipline lead to document root cause using standard categories:
  - Resource constraint
  - Design complexity
  - Input dependency on another discipline
  - Client review delay
  - Vendor data delay
  - Scope change in process
  - Design coordination issue
- Require a forecast recovery date for every overdue deliverable:
  - The date by which the overdue milestone will be achieved
  - Validated by the discipline lead as realistic given current workload
- Calculate the engineering completion forecast using earned value trending:
  - SPI (Schedule Performance Index) = weighted progress earned / weighted progress planned
  - Forecast completion = baseline end date / SPI
  - Apply at both discipline and project level
- Compare the forecast completion date against the baseline target and construction need date:
  - Quantify the schedule risk in working days
  - Flag any discipline where forecast exceeds the construction need window
- Prepare a prioritized action list for the Engineering Manager:
  - Rank overdue deliverables by construction impact (float consumed)
  - Recommend specific recovery actions

### Step 4: Identify Critical Path Deliverables and Construction Linkages
- Map each IFC deliverable to its downstream construction activity or work package:
  - Use the construction schedule WBS linkage provided by the Execution agent
- Calculate the float between planned (or forecast) IFC date and construction need-by date:
  - Express float in both calendar days and working days
- Sort deliverables by float to produce the critical path deliverables list:
  - Zero or negative float at the top
  - Limit to top 20 most critical items for management focus
- For deliverables on the critical path, verify:
  - Responsible discipline has adequate resources assigned
  - All input dependencies (interfaces from other disciplines) are being tracked and are on schedule
- Cross-reference with the engineering change register:
  - Identify scope changes that have added new critical-path deliverables
  - Identify changes that have shifted existing deliverables onto the critical path
- Coordinate with the Execution agent:
  - Validate that construction need-by dates are current
  - Confirm dates reflect the latest approved construction sequence
- Identify procurement-linked deliverables:
  - Equipment datasheets and specifications needed for vendor bid packages
  - Coordinate with Contracts & Compliance to align engineering and procurement schedules

### Step 5: Report, Communicate, and Escalate
- Compile the EDDR Status Report with all sections:
  - Executive dashboard
  - Master register
  - Discipline progress summary
  - Overdue analysis
  - Critical path deliverables
  - Weekly delta report
- Generate the planned vs. actual S-curve charts:
  - Overall progress and per discipline
  - Include forecast projection lines extending to estimated completion date based on current SPI
- Prepare the management summary (maximum 1 page) highlighting:
  - Overall progress position vs. baseline
  - Top 5 schedule risks ranked by construction impact
  - Disciplines requiring resource reinforcement
  - Specific recommended actions with timelines and accountability
- Distribute the report to:
  - Project leadership team (Project Manager, Engineering Manager, Construction Manager)
  - All discipline leads
  - Execution agent for construction planning input
- Escalate any discipline with forecast completion later than construction need date:
  - Notify Engineering Manager and Project Manager for resource reallocation decisions
  - Propose specific mitigation actions (overtime, additional staff, scope reprioritization)
- Update the Orchestrator agent:
  - Latest engineering progress metrics for the project management dashboard
  - Gate review package inputs
- Archive the report in the project document control system:
  - Unique version number
  - Maintain complete reporting history for audit trail and project close-out

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Deliverables missing from EDDR | Scope additions via ECN not registered in document control | Weekly reconciliation between EDDR and document control master; mandatory registration before work begins on any deliverable |
| Inaccurate weight factors | Generic weights applied without discipline-specific calibration | Validate weight table with discipline leads during project setup; calibrate against actual manhour data quarterly; adjust weights if cumulative variance exceeds 10% |
| Progress overstated | Milestone credit given before deliverable actually achieves that status (e.g., marking IFR before transmittal issued) | Require transmittal number as evidence for each status milestone; no date credit without documentary proof; monthly audit sample of 10% of status claims |
| Construction need dates not updated | Static snapshot of construction schedule used without regular refresh | Monthly refresh of construction need-by dates from the latest approved construction schedule; automated alert if construction schedule revision is newer than EDDR import |
| Overdue root causes not investigated | Overdue list treated as a static report rather than an action tracker | Mandatory root cause and recovery date for every overdue item; weekly follow-up in coordination meeting; unresolved items escalated automatically after 2 weeks |
| Vendor documents not integrated | Vendor data submissions tracked separately from engineering deliverables | Include vendor documents in the EDDR with clear ownership (procurement vs. engineering) and linked schedule dates; vendor submission milestones visible in the progress S-curve |
| Scope changes not reflected in baseline | Approved ECNs add deliverables but baseline S-curve not re-baselined | Formal re-baseline process triggered by approved scope changes exceeding a defined threshold (e.g., >2% scope growth); re-baseline requires Project Manager approval |

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Any discipline weighted progress > 5% behind plan | At detection | Discipline Lead notification; resource recovery plan required within 5 working days |
| Overall weighted progress > 3% behind plan | At detection | Engineering Manager and Project Manager joint review; recovery plan within 48 hours |
| Critical path deliverable IFC forecast after construction need date | At detection | Engineering Manager, Construction Manager, and Project Manager escalation; emergency resource reallocation within 48 hours |
| Any deliverable overdue > 4 weeks without approved recovery plan | Weekly review | Engineering Manager formal escalation; discipline lead accountability review and corrective action |
| Scope growth > 5% from baseline without re-baseline approval | At detection | Project Manager and Project Controls review; scope freeze or re-baseline decision within 10 working days |
| Client review cycle exceeding contractual review period | At detection | Project Manager notification to client project manager; formal letter if > 5 days past contractual period |
| Document control system data inconsistent with EDDR by > 2% of records | At detection | Document Control Manager investigation; data reconciliation within 3 working days; root cause report |

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | >98% accuracy | EDDR data reconciles with document control system; weight calculations verified independently by project controls |
| Completeness | 25% | 100% coverage | Every engineering deliverable in scope is registered; no orphan documents in document control; no unregistered deliverables in work |
| Consistency | 15% | Zero conflicts | Status codes, dates, and progress figures consistent between EDDR, project schedule, and project reports; no contradictory data across systems |
| Format | 10% | Professional | VSC template with S-curve visualizations, traffic-light indicators, clear tabular layouts, and printable dashboard format |
| Actionability | 10% | Immediately usable | Overdue analysis includes root cause and recovery plan; critical path list enables same-day prioritization decisions |
| Traceability | 10% | Full audit trail | Every status change traceable to transmittal reference; every weight factor traceable to approved weight table; every baseline change traceable to ECN |

## Inter-Agent Dependencies

### Inputs From Other Agents
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Approved project schedule baseline with engineering milestones and construction need dates | Planned dates for EDDR baseline; float calculation for critical path analysis |
| Execution | Engineering change register (ECR/ECN log) with approved scope changes | Scope changes affecting deliverable count, baseline, and weighted scope |
| Contracts & Compliance | Vendor document submission schedule linked to procurement packages | Integration of vendor data deliverables into the EDDR for comprehensive tracking |
| Orchestrator | Reporting period, governance calendar, and gate review schedule | Timing of EDDR status reports, management reviews, and gate review inputs |
| All Engineering Disciplines | Deliverable lists with document numbers, types, and discipline-specific weights | Raw input for EDDR population, scope definition, and weight table calibration |

### Outputs Consumed By
| Agent | Entity/Deliverable | Purpose |
|-------|-------------------|---------|
| Execution | Engineering weighted progress, SPI, and forecast completion date | Earned value reporting, schedule risk assessment, and construction planning |
| Orchestrator | Engineering completion metrics, discipline dashboards, and risk flags | Project management reporting, governance reviews, and client reporting |
| Contracts & Compliance | IFC dates and procurement-linked deliverable status | Construction contract milestone verification, procurement sequencing, and vendor coordination |
| Asset Management | As-built document register tracking for operational handover | Asset documentation completeness assessment for operational readiness gate reviews |
| HSE | Safety-critical deliverable status (HAZOP close-out drawings, SIL verification reports) | Regulatory compliance verification and safety review close-out tracking |

## References
- `methodology/or-playbook-and-procedures/` -- OR procedures including engineering management guidelines and deliverable tracking frameworks
- `methodology/capital-projects/` -- Capital project engineering phase management, earned value standards, and project controls procedures
- AACE International RP 68R-11 -- Escalation Estimating Using Indices (engineering productivity trending methodology)
- ISO 19650 -- Organization and digitization of information about buildings and civil engineering works (BIM document management principles applicable to engineering deliverable tracking)
- PMBOK 7th Edition -- Scope Management and Schedule Management knowledge areas (earned value and forecasting methods)

## Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
