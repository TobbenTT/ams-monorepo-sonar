---
name: create-project-closeout-report
description: "Produce comprehensive project closeout report capturing final performance metrics, lessons learned, knowledge transfer recommendations, and archival instructions for capital project completion. Triggers: 'project closeout', 'closeout report', 'lessons learned', 'project completion', 'knowledge transfer', 'project archive'."
category: Project Orchestration (Agent 7 - Project Orchestrator)
priority: P2 - High
version: 1.0.0
agent: project-orchestrator (AG-007)
---

# Create Project Closeout Report

## Skill ID: PO-005
## Version: 1.0.0
## Category: Project Orchestration (Agent 7 - Project Orchestrator)
## Priority: P2 - High

---

## Purpose

Produce a comprehensive project closeout report that captures final performance metrics, categorized lessons learned, knowledge transfer recommendations, and document archival instructions for capital projects completing the FEL-governed delivery lifecycle. This deliverable serves as the definitive record of project performance and the primary vehicle for organizational learning that improves future project outcomes.

Project closeout is consistently identified by PMI, IPA, and AACE as one of the most neglected phases of project delivery. Research from the Construction Industry Institute (CII) demonstrates that organizations with structured closeout processes and active lessons learned programs achieve 10-15% improvement in cost and schedule performance on subsequent projects. Despite this evidence, industry surveys consistently show that fewer than 30% of capital projects produce formal closeout reports, and fewer than 10% have effective mechanisms for transferring lessons into future project practices.

The challenge in project closeout is threefold. First, project teams are typically demobilizing during closeout, with key personnel reassigned to new projects before closeout activities are complete. Second, lessons learned are often captured at too high a level ("improve communication") without the specificity needed for actionable improvement ("implement weekly interface coordination meetings between engineering and procurement during FEL2 to prevent specification gaps"). Third, closeout data is frequently not integrated across disciplines, resulting in fragmented and inconsistent performance records.

This skill addresses these challenges by implementing a structured closeout process that:
- Collects final performance data from all specialist agents through formal delegation
- Computes and validates final EVM metrics (SPI, CPI, VAC, TCPI) per AACE RP 10S-90 definitions
- Captures lessons learned categorized by project phase, discipline, and improvement theme
- Produces actionable recommendations linked to specific process changes
- Creates a knowledge transfer checklist ensuring operational teams receive all necessary information
- Defines a document archival plan with retention schedules per regulatory and corporate requirements
- Documents warranty and guarantee obligations with handover to operations for ongoing tracking

The closeout report serves multiple audiences: the project steering committee (final performance accountability), the project management office (organizational learning), future project teams (lessons and benchmarks), and the operations team (warranty tracking and knowledge transfer).

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Final EVM Performance Assessment**:
   - **Schedule Performance Index (SPI)**: Final SPI = BCWP / BCWS at project completion. Report trend from project start to completion with phase-by-phase breakdown.
   - **Cost Performance Index (CPI)**: Final CPI = BCWP / ACWP at project completion. Report trend from project start to completion with phase-by-phase breakdown.
   - **Variance at Completion (VAC)**: VAC = BAC - EAC (positive = under budget, negative = over budget). Decompose by WBS Level 2.
   - **To-Complete Performance Index (TCPI)**: Final TCPI assessment -- was the remaining work achievable at the performance rate required?
   - **Estimate at Completion accuracy**: Compare final actual cost to the original EAC approved at FID. Calculate estimation accuracy as a percentage.
   - All EVM metrics must be calculated per AACE RP 10S-90 definitions and reported in both absolute values and index form.

2. **Schedule Performance Assessment**:
   - **Planned vs. Actual Duration**: Total project duration comparison with variance explanation
   - **Milestone Achievement**: Final milestone register showing planned vs. actual dates for all Key and Contractual milestones
   - **Critical Path Performance**: Was the critical path managed effectively? Document critical path migrations and their causes.
   - **Phase-by-Phase Analysis**: Duration variance by project phase (FEL1, FEL2, FEL3, Execution, Commissioning, Ramp-Up) with root cause
   - **Schedule Change Impact**: Total schedule impact of approved changes vs. original baseline
   - **Look-Ahead Compliance History**: Average look-ahead compliance rate over project life (planned vs. actual weekly execution)

3. **Cost Performance Assessment**:
   - **Budget vs. Actual**: Final cost comparison at WBS Level 2 with variance analysis
   - **Estimate Class Accuracy**: Compare final actual cost to Class 3 estimate (at FID) and Class 5 estimate (at FEL1). Calculate accuracy percentages.
   - **Contingency Utilization**: Original contingency allocation, total drawdown, remaining contingency, drawdown by category (scope, escalation, risk)
   - **Change Order Impact**: Total cost of approved changes, percentage of original budget
   - **Unit Cost Analysis**: Key unit costs ($/tonne installed capacity, $/m2 building, $/MW installed) for benchmarking
   - **Cost Growth Decomposition**: Classify total cost growth into categories: scope changes, design development, rework, escalation, force majeure, estimation error, productivity variance

4. **Lessons Learned (Categorized)**:
   - **By Phase**: What worked and what did not in each FEL phase and execution phase
   - **By Discipline**: Engineering, Procurement, Construction, Commissioning, Operations, HSE, Finance lessons
   - **By Theme**: Scope management, schedule management, cost management, risk management, stakeholder management, technology, organizational, contractual
   - **Lesson Structure** (for each lesson):
     - Context: What was the situation?
     - Action: What was done (or not done)?
     - Result: What was the outcome?
     - Recommendation: What should future projects do differently?
     - Impact: Quantified impact if possible (cost saved/lost, time saved/lost)
     - Applicability: Which project types and phases does this lesson apply to?
   - **Minimum 20 substantive lessons** per project (not generic platitudes)
   - Every lesson must be specific enough that a future project team can implement the recommendation without additional context

5. **Recommendations for Future Projects**:
   - Categorized by improvement area (process, technology, organization, commercial)
   - Linked to specific lessons learned (traceability from lesson to recommendation)
   - Prioritized by potential impact (high, medium, low)
   - Assigned to organizational function responsible for implementation
   - Include proposed updates to VSC methodology based on project experience

6. **Knowledge Transfer Checklist**:
   - Engineering knowledge: As-built drawings, vendor manuals, calculation sheets, design basis documents
   - Operational knowledge: SOPs, emergency procedures, operating envelopes, alarm set points
   - Maintenance knowledge: Maintenance strategies, spare parts lists, CMMS data, vendor contacts
   - HSE knowledge: Safety case, HAZOP records, risk assessments, permit conditions, emergency plans
   - Commercial knowledge: Contract obligations, warranty terms, performance guarantees, insurance
   - Financial knowledge: Final project cost, unit costs, operational budget basis
   - Status: Each item marked as Transferred / In Progress / Not Started / Not Applicable

7. **Document Archival Plan**:
   - Classification of all project documents by retention category
   - Retention schedule per regulatory requirements and corporate policy
   - Archive location and access permissions
   - Index of archived documents with metadata (title, type, date, owner, retention period)
   - Digital archive integrity verification (checksums, format migration plan for long-term preservation)

8. **Warranty and Guarantee Tracking Handover**:
   - Complete register of all warranties and guarantees with: equipment/system, vendor, start date, expiry date, conditions, claim procedure
   - Defects liability period tracking with contractor obligations
   - Performance guarantee testing schedule and acceptance criteria
   - Handover to operations maintenance team with clear ownership assignment
   - Notification system for approaching warranty expiry dates

**Constraints:**
- Must collect closeout data from all 11 specialist agents (AG-002 through AG-012)
- Must present objective, evidence-based performance assessments (no revisionist narratives)
- Must include both positive lessons (what went well) and improvement lessons (what went poorly)
- Lessons learned must be specific and actionable, not generic
- Must quantify performance wherever possible (cost, time, percentage)
- Must preserve confidentiality of commercially sensitive information per contractual obligations
- Must produce outputs in Spanish (Latin American) with English technical terms preserved
- Must be completed within 60 calendar days of project substantial completion

---

## Trigger / Invocation

```
/create-project-closeout-report
```

### Command Triggers
- `create-project-closeout-report generate --project [name]`
- `create-project-closeout-report collect-inputs --agent [AG-XXX|all]`
- `create-project-closeout-report lessons --phase [FEL1|FEL2|FEL3|Execution|Commissioning|Ramp-Up]`
- `create-project-closeout-report evm-final --calculate`
- `create-project-closeout-report warranty --register`
- `create-project-closeout-report archive --plan`
- `create-project-closeout-report knowledge-transfer --checklist`

### Natural Language Triggers
- "Generate the project closeout report"
- "Compile final lessons learned for the project"
- "Calculate final EVM metrics for closeout"
- "Create the warranty tracking handover register"
- "Prepare the document archival plan"
- "What is the final cost and schedule performance?"
- "Compile knowledge transfer checklist for operations"

### Aliases
- `/project-closeout`
- `/closeout-report`
- `/lessons-learned-report`
- `/final-project-report`

### Automatic Triggers
- Project reaches "Substantial Completion" milestone
- All systems achieve mechanical completion and are handed to operations
- Final EVM data cut is available (last ACWP entry recorded)
- 30 days after substantial completion (if closeout not yet initiated, trigger reminder)
- 60 days after substantial completion (if closeout not yet completed, escalate to steering committee)

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Format | Description |
|-------|--------|----------|--------|-------------|
| Final EVM Data | Execution (AG-006) | Yes | .xlsx | Complete EVM dataset: BCWS, BCWP, ACWP, BAC, EAC by WBS element and by period |
| Final Project Schedule | Execution (AG-006) / Project Orchestrator (AG-007) | Yes | .xlsx / .mpp | Final schedule with actual dates for all activities and milestones |
| Final Cost Report | Finance & Accounting (AG-010) | Yes | .xlsx | Final actual cost by WBS element, cost category, and period |
| Change Register (Final) | Project Orchestrator (AG-007) | Yes | .xlsx | Complete change register with all CRs closed and actual impacts recorded |
| Engineering Dossier Status | Engineering Design (AG-008) | Yes | .xlsx | Final EDDR status, as-built drawing status, vendor documentation status |
| MC Certificate Register | Construction Management (AG-009) | Yes | .xlsx | Mechanical completion certificates for all systems with punchlist status |
| OR Readiness Final Assessment | Operations (AG-002) / Orchestrator (AG-001) | Yes | .docx | Final operational readiness status across all management areas |
| Risk Register (Final) | HSE (AG-004) | Yes | .xlsx | Final risk register showing which risks materialized and which were retired |
| Contract Close Status | Contracts & Compliance (AG-005) | Yes | .xlsx | Contract completion status, outstanding claims, final account status |
| Warranty Register | Contracts (AG-005) / All Agents | Yes | .xlsx | Complete warranty and guarantee register |

### Optional Inputs (Strongly Recommended)

| Input | Source | Required | Format | Default if Absent |
|-------|--------|----------|--------|-------------------|
| Original FID Estimate | Finance (AG-010) | No | .xlsx | Estimation accuracy analysis not possible |
| Gate Review Packages | Project Orchestrator (AG-007) | No | .docx | No gate-by-gate retrospective analysis |
| Stakeholder Feedback | Project Management | No | .docx / survey | No stakeholder satisfaction data |
| Safety Performance Data | HSE (AG-004) | No | .xlsx | Safety metrics not included |
| IPA Benchmark Data | VSC Knowledge Base | No | .xlsx | No industry benchmark comparison |
| Agent Lessons Learned | All Specialist Agents | No | .md | Agent-specific lessons not captured |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve final EVM data and compute all performance metrics
- Access final schedule and calculate duration variances by phase and WBS
- Pull final cost data and compute budget variances by category
- Retrieve change register and calculate total change impact
- Access all agent state files for discipline-specific closeout data
- Query VSC knowledge base for benchmark data by project type and industry
- Retrieve all gate review packages for retrospective gate quality assessment
- Access warranty and guarantee information from contracts agent

---

## Output Specification

### Document 1: Project Closeout Report (.docx)

**Filename**: `{ProjectCode}_Project_Closeout_Report_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 40-80 pages (main report + appendices)

**Structure:**

```markdown
# Project Closeout Report
## {Project Name}
## Document Number: {ProjectCode}-PO-CLO-001
## Revision: {N}
## Date: {YYYY-MM-DD}
## Project Duration: {Start Date} to {Completion Date}
## Final Cost: {$XXX.XM} (Budget: {$XXX.XM}, Variance: {+/-$X.XM, +/-X.X%})

---

## PART A: PROJECT PERFORMANCE SUMMARY


See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Quality Criteria

### Content Quality (Target: >91% Compliance)

| Criterion | Weight | Metric | Target |
|-----------|--------|--------|--------|
| Performance Data Completeness | 25% | All EVM metrics computed, all cost/schedule variances explained | 100% |
| Lessons Learned Quality | 25% | Minimum 20 substantive lessons, all specific and actionable, all following the structured format | 100% |
| Agent Input Coverage | 20% | Closeout data received from all 11 specialist agents | 100% |
| Knowledge Transfer | 15% | Knowledge transfer checklist complete with status for all items | 100% |
| Timeliness | 15% | Report completed within 60 calendar days of substantial completion | Yes |

### Automated Quality Checks

- [ ] Final CPI and SPI are calculated correctly from BCWP, BCWS, and ACWP data
- [ ] VAC equals BAC minus final actual cost
- [ ] Cost growth decomposition sums to total cost variance (no unexplained gap)
- [ ] All Key and Contractual milestones have actual dates recorded
- [ ] Schedule variance by phase sums to total project duration variance
- [ ] Contingency utilization reconciles with change register
- [ ] Minimum 20 lessons learned documented, each with all 6 structured fields
- [ ] No lessons contain generic recommendations (e.g., "improve communication" without specificity)
- [ ] All recommendations link to at least one specific lesson learned
- [ ] Knowledge transfer checklist covers all 6 categories
- [ ] Warranty register has no items with missing expiry dates or undefined owners
- [ ] Document archival plan includes retention schedule for all document categories
- [ ] All 11 specialist agents have contributed closeout data (or explicit justification for absence)
- [ ] No "TBD" entries in final performance metrics
- [ ] Cost and schedule data are internally consistent (no contradictions between sections)

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent | Dependency Type | Description | Criticality |
|-------|----------------|-------------|-------------|
| Execution (AG-006) | Final EVM | Complete EVM dataset with final BCWP, BCWS, ACWP, BAC, and EAC for closeout metrics | Critical |
| Finance & Accounting (AG-010) | Final Costs | Final actual costs by WBS, cost category, and period; contingency utilization record | Critical |
| Engineering Design (AG-008) | Engineering Dossier | Final EDDR status, as-built drawing completion, vendor document handover status | Critical |
| Construction Management (AG-009) | MC Status | Mechanical completion certificate register, final punchlist status, construction quality records | Critical |
| Operations (AG-002) | OR Status | Final operational readiness assessment, SOP completion, training completion, staffing status | Critical |
| HSE (AG-004) | Safety Data | Final safety performance metrics (TRIR, LTIR), HAZOP action closure, risk register final status | High |
| Contracts & Compliance (AG-005) | Commercial Close | Contract completion status, outstanding claims, warranty register, final account settlement | High |
| HR & Talent (AG-011) | Staffing Close | Final staffing status, demobilization plan, knowledge retention strategy | Medium |
| IT/OT & Communications (AG-012) | Systems Close | IT/OT system handover status, data migration completion, communication system transfer | Medium |
| Asset Management (AG-003) | Maintenance Close | CMMS configuration status, maintenance strategy implementation, spare parts stocking level | Medium |
| Orchestrator (AG-001) | Governance | Gate review history, project governance records, OR program performance data | Medium |

### Downstream Dependencies (Outputs To)

| Agent | Dependency Type | Description | Trigger |
|-------|----------------|-------------|---------|
| Orchestrator (AG-001) | Final Governance Record | Closeout report as the definitive project performance record for organizational archives | On report completion |
| All Future Projects | Lessons Learned | Lessons learned database available as reference for all future VSC project teams | On report approval |
| Operations (AG-002) | Knowledge Transfer | Knowledge transfer checklist and warranty register handed to operations for ongoing management | On report completion |
| VSC Knowledge Base | Methodology Update | Proposed methodology updates based on project lessons for consideration by VSC PMO | On report approval |

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **PMI PMBOK 7th Edition** | Project closeout process, lessons learned framework, knowledge management |
| **AACE RP 10S-90** | Cost Engineering Terminology -- definitions for all EVM metrics used in closeout |
| **AACE RP 18R-97** | Cost Estimate Classification -- estimate accuracy assessment for closeout comparison |
| **ISO 21500:2021** | Project governance -- closeout reporting requirements and stakeholder communication |
| **CII RT-CII-166** | Lessons Learned -- structured approach to capturing and disseminating project lessons |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **IPA Project Evaluation System** | Post-project benchmarking methodology for performance comparison |
| **AACE RP 44R-08** | Risk Analysis and Contingency -- contingency utilization assessment methodology |
| **ISO 55001:2014** | Asset Management -- knowledge transfer requirements for operations handover |
| **ISO 15489** | Records Management -- document archival and retention requirements |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
