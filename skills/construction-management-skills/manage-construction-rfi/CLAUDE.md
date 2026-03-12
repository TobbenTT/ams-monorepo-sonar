---
name: manage-construction-rfi
description: "Track Requests for Information from construction to engineering with response time monitoring, impact analysis, and resolution tracking. Triggers: 'RFI tracking', 'request for information', 'field query', 'consulta de campo', 'solicitud de informacion'."
---

# Manage Construction RFIs

## Skill ID: CM-09

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P2 - High

---

## Purpose

Track and manage Requests for Information (RFIs) raised by construction teams seeking clarification, discrepancy resolution, or design change approval from engineering, ensuring that field engineering queries are answered promptly to avoid construction delays and work-front stoppages. This skill monitors RFI cycle time, classifies RFIs by cause and impact, and analyzes trends to identify systemic issues in drawing quality or specification clarity.

RFIs are a barometer of design quality and construction-engineering coordination effectiveness. A well-managed RFI process prevents the #2 cause of construction delays (after weather): information gaps that stop work fronts. CII (Construction Industry Institute) research shows that projects averaging more than 1 RFI per USD 100K of construction value typically have design completeness below 80% at construction start -- a predictor of cost and schedule overruns. Conversely, rapid RFI turnaround (within 5 business days) reduces field-driven rework by 25-35%.

In the Operational Readiness context, RFI management is critical because unanswered RFIs accumulate design ambiguities that persist into the operating facility. An RFI that should have triggered a design change but was answered with a quick verbal clarification often results in as-built documentation gaps, incomplete operating procedures, or maintenance strategies based on incorrect assumptions. This skill ensures that every RFI is formally documented, that design changes are routed through the Field Change Notice (FCN) process, and that engineering responses are captured for as-built documentation.

Key value drivers:
- **Schedule protection**: 5-day target response time prevents work-front stoppages on the critical path
- **Design quality feedback**: RFI cause analysis reveals systemic drawing/specification problems for upstream correction
- **Change management integration**: RFIs triggering scope changes are linked to FCNs with cost and schedule impact
- **As-built accuracy**: Formal RFI responses become part of the as-built record, preventing knowledge loss
- **Contractor relations**: Transparent RFI tracking with aging visibility builds accountability on both sides

---

## Intent & Specification

The AI agent MUST understand that:

1. **Every RFI has a defined lifecycle** -- Submit (by construction), Acknowledge (by document control within 24 hours), Review (by responsible discipline engineer), Respond (formal written response), Verify (construction confirms response is adequate), Close. An RFI is not closed until the originator confirms the response addresses their question. Partial or inadequate responses must be sent back for clarification.

2. **Response time is schedule-critical** -- the standard target is 5 business days from submission to formal response. RFIs on the critical path may have accelerated targets (48-72 hours). Every day an RFI remains open beyond the target potentially represents a day of construction delay at that work front. Aging analysis must be performed daily, not weekly.

3. **RFI cause classification is essential for root cause analysis** -- every RFI must be classified by cause: design error (incorrect information in drawings/specs), design omission (missing information), constructability issue (design is correct but not buildable as drawn), scope change request (construction proposes an alternative), or field condition conflict (actual site conditions differ from design assumptions). This classification enables trend analysis to identify systemic upstream problems.

4. **RFIs that result in design changes must be linked to FCNs** -- if an RFI response changes the design intent, dimensions, materials, or specifications, it must trigger a Field Change Notice (FCN) through the track-field-change-notices skill. The FCN captures the cost and schedule impact of the change. RFIs must never be used as a back-channel for unapproved scope changes.

5. **RFI trend analysis reveals upstream quality issues** -- when multiple RFIs originate from the same drawing set, specification section, or discipline, it indicates a systemic design quality problem that should be escalated to engineering management for corrective action (e.g., additional design review, specification clarification bulletin, or designer re-training).

### RFI Cause Classification Taxonomy

| Cause Code | Category | Definition | Example |
|-----------|----------|-----------|---------|
| DE | Design Error | Incorrect information in issued drawing or specification | Pipe routing conflicts with structural steel; wrong material specified |
| DO | Design Omission | Missing information that should have been included in the design | No support detail shown for heavy valve; missing tie-in location |
| CI | Constructability Issue | Design is technically correct but cannot be built as drawn | Insufficient space for welding access; equipment cannot be rigged into position |
| SC | Scope Change Request | Construction proposes an alternative approach or material | Substitute locally-available fitting for imported specification item |
| FC | Field Condition | Actual site conditions differ from design assumptions | Rock encountered where soil was assumed; existing utility not shown on survey |
| DC | Document Conflict | Two or more documents provide contradictory information | P&ID shows 6-inch pipe but isometric shows 8-inch; spec vs. vendor datasheet conflict |

### RFI Priority Classification

| Priority | Response Target | Criteria | Escalation Threshold |
|----------|----------------|----------|---------------------|
| Critical | 48-72 hours | Activity on critical path; work front stopped | +24 hours overdue |
| High | 3 business days | Activity on near-critical path (float <10 days); multiple crews affected | +3 days overdue |
| Standard | 5 business days | Normal construction query; no immediate schedule impact | +5 days overdue |
| Low | 10 business days | Future work area; informational query; no current work front impact | +10 days overdue |

---

## Trigger / Invocation

```
/manage-construction-rfi
```

### Natural Language Triggers (EN)
- "How many RFIs are overdue and what is their schedule impact?"
- "Show me open RFIs for the piping discipline with aging analysis"
- "What is the average RFI response time by engineering discipline?"

### Natural Language Triggers (ES)
- "Cuantas consultas tecnicas estan vencidas y cual es su impacto en el cronograma?"
- "Mostrar las solicitudes de informacion abiertas para la disciplina de tuberias con analisis de antiguedad"
- "Cual es el tiempo promedio de respuesta de las consultas por disciplina de ingenieria?"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| RFI Register | Document Control | .xlsx/.csv | All RFIs with unique ID, status, dates (submitted, acknowledged, responded, closed), category, discipline |
| Engineering Response Log | Engineering Team | .xlsx/.pdf | Formal responses to each RFI with discipline engineer sign-off |
| Construction Schedule | Project Controls / Planning | .xer/.xml/.csv | Activity-level schedule for identifying critical-path RFI impacts |
| Drawing Register | Document Control | .xlsx | Current revision status of all design drawings for cross-referencing affected documents |

### Optional Inputs

| Input | Source | Default if Absent |
|-------|--------|-------------------|
| Target Response Time | Contract / Project Procedure | 5 business days |
| FCN Register | track-field-change-notices | Link to FCN skill for RFIs generating design changes |
| Priority Classification Rules | Project Management | Derive critical-path priority from schedule float analysis |

### Context Enrichment (Automatic)

- Cross-reference RFI affected drawings with the drawing register to identify revision status
- Pull schedule float data for activities affected by open RFIs to quantify delay risk
- Retrieve engineering team contact information for RFI routing based on discipline
- Access historical RFI data from similar VSC projects for volume and response time benchmarking
- Query track-field-change-notices for existing FCNs related to the same drawing/specification area

---

## Output Specification

### Filename Format
`{ProjectCode}_RFI_Status_Report_{YYYYMMDD}.md`

### Report Structure

1. **RFI Summary Dashboard** -- Open/closed/overdue counts by discipline and category, aging distribution histogram, cumulative submission and closure S-curve
2. **Overdue RFI Register** -- All RFIs past target response time with aging (days overdue), responsible discipline, schedule impact classification, and escalation status
3. **Response Time Analysis** -- Average and median response times by discipline, trend over reporting periods, comparison against 5-day target
4. **Critical Path RFI Impact** -- RFIs affecting activities on the critical or near-critical path, with quantified schedule delay exposure in calendar days
5. **RFI Cause Analysis (Pareto)** -- Distribution of RFIs by cause (design error, omission, constructability, scope change, field condition), Pareto analysis showing which causes generate 80% of RFIs
6. **RFI-to-FCN Conversion Tracking** -- RFIs that have resulted in Field Change Notices with linked cost and schedule impacts

### Key Metrics Table

| Metric | Description | Target | Frequency |
|--------|-------------|--------|-----------|
| RFI Response Rate | % of RFIs responded within target time (5 business days) | >90% | Weekly |
| Overdue RFI Count | Number of RFIs past target response time | <5% of open RFIs | Daily |
| Average Response Time | Mean calendar days from submission to formal response | <7 calendar days | Weekly |
| RFI-to-FCN Conversion Rate | % of RFIs that result in a Field Change Notice | Track (no target) | Monthly |
| Critical Path RFI Count | Number of open RFIs affecting critical-path activities | 0 (target for overdue) | Daily |

---

## Procedure

### Step 1: Establish RFI Management Framework

- Define the RFI numbering convention: RFI-{Discipline}-{YYYY}-{NNN} (e.g., RFI-PIP-2026-047)
- Establish the RFI lifecycle stages: Draft -> Submitted -> Acknowledged -> Under Review -> Responded -> Verified -> Closed
- Define response time targets by priority: Critical Path (48-72 hours), High Priority (3 business days), Standard (5 business days), Low Priority (10 business days)
- Create the escalation chain for overdue RFIs: 5 days overdue -> Discipline Lead, 10 days -> Engineering Manager, 15 days -> Project Manager, 20 days -> Project Director
- Define RFI cause categories and train construction supervisors on proper classification at submission
- Create the standard RFI submission template requiring: clear question statement, affected drawing/specification references with revision numbers, supporting photographs or sketches, proposed solution (if any), and schedule impact assessment
- Establish RFI routing rules: each RFI is routed to the responsible discipline engineer based on the affected drawing discipline code
- Define the RFI-to-FCN handoff protocol: when an RFI response changes design intent, the RFI manager initiates the FCN process within 48 hours of response receipt
- Set up automated aging alerts at target date, target +3 days, target +7 days, and target +14 days

### Step 2: Process Incoming RFIs

- Receive RFI submissions from construction teams, validating completeness: clear question, affected drawing/specification references, photographs or sketches if applicable, proposed solution (if any), and schedule impact assessment
- Reject incomplete RFIs back to originator with specific feedback on what information is missing (do not hold incomplete RFIs in the queue -- they distort metrics)
- Acknowledge receipt within 24 hours, assigning the RFI a unique number and logging it in the register with submission timestamp
- Classify the RFI by cause type (design error, omission, constructability, scope change, field condition, document conflict) and by discipline
- Assess schedule impact: is the affected activity on the critical path or near-critical path? What is the work-front impact if the response is delayed? Quantify delay exposure in calendar days
- Assign priority level (Critical, High, Standard, Low) based on schedule impact and work-front status
- Route to the responsible discipline engineer with the complete RFI package, target response date, and priority classification
- Flag RFIs with critical-path impact for expedited handling and notify the engineering manager immediately

### Step 3: Track Response and Resolution

- Monitor RFI status daily, tracking each RFI against its target response date
- For RFIs approaching their target date without a response, send reminder notifications to the assigned engineer at target -2 days, target -1 day, and target date
- When a response is received, validate completeness: does the response directly address the question? Is it supported by sketches, calculations, or revised drawings as needed?
- Route the response back to the construction originator for verification -- the originator must confirm the response is adequate before the RFI can be closed
- If the originator rejects the response as inadequate, return to the engineering team with specific feedback and reset the response clock
- For responses that change the design (dimensions, materials, specifications, routing), flag the RFI for FCN generation and link to track-field-change-notices
- For responses that reference revised drawings, verify the revised drawing has been issued through document control before closing the RFI
- Track the number of response iterations per RFI; multiple iterations may indicate unclear original questions or inadequate engineering review
- Close the RFI when the originator confirms satisfaction, recording the actual response time and resolution summary
- Update the RFI register with the complete resolution chain: original question, response, any clarifications, and final accepted solution

### Step 4: Analyze Trends and Identify Systemic Issues

- Calculate RFI metrics weekly: submission rate, response rate, average response time, overdue count, closure rate
- Generate aging analysis: distribution of open RFIs by age bracket (0-5 days, 6-10, 11-15, 16-20, 21-30, 30+ days)
- Perform Pareto analysis on RFI causes: which cause categories generate the most RFIs? Which drawings or specification sections are most frequently questioned?
- Identify systemic patterns: if >5 RFIs originate from the same drawing set or specification section, flag as a potential design quality issue requiring engineering review of the entire document
- Analyze response time trends: is engineering getting faster or slower? Are certain disciplines consistently late? Are certain engineers overloaded?
- Track the RFI-to-FCN conversion rate: a high conversion rate may indicate that the design was released prematurely or that scope is being managed through RFIs rather than formal change control
- Benchmark RFI volume against project value: calculate RFIs per USD 1M of construction value and compare against CII benchmarks to assess design quality
- Analyze the correlation between RFI submission timing and construction phase: early-phase RFIs often indicate incomplete IFC drawings, while late-phase RFIs may signal constructability issues
- Present findings to engineering management with specific recommendations for upstream corrective actions

### Step 5: Report and Escalate

- Generate the weekly RFI Status Report with all dashboard elements, metrics, and trend analysis
- Highlight critical-path RFIs with quantified schedule delay exposure for construction management attention
- Escalate overdue RFIs through the defined escalation chain, providing impact assessments at each level
- Feed RFI metrics into generate-construction-reports for inclusion in weekly and monthly construction reports
- At project milestones (25%, 50%, 75%, MC), generate cumulative RFI analysis reports for lessons learned
- Provide RFI trend data to the Orchestrator Agent for management-level reporting and gate review documentation
- Generate discipline-specific RFI performance summaries for engineering discipline leads, showing their team's response time and overdue counts
- Produce a monthly RFI executive summary for the project steering committee highlighting systemic findings and design quality implications
- Archive closed RFIs with responses as part of the project knowledge base for future project reference

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| RFIs used as informal change orders | Scope changes processed through RFI instead of formal change control | Mandatory cause classification at submission; RFIs classified as "scope change" automatically routed through FCN process |
| Verbal responses given without formal documentation | Engineer answers field question by phone or site visit but never documents the response | All RFI responses must be written, logged, and acknowledged by the originator before closure |
| Overdue RFIs accumulate without escalation | No automated aging alerts or escalation protocol in place | Automated daily aging report with escalation triggers at 5, 10, 15, and 20 days overdue |
| Construction delays attributed to engineering but RFI submitted late | Construction knew about the issue but delayed submitting the RFI | Track time between issue identification (per daily log) and RFI submission; educate crews on early submission |
| Response does not address the actual question | Engineer answers what they think the question is, not what was asked | Require clear question statement in RFI template; originator verification before closure |
| Drawing revisions issued but construction uses old revision | RFI response triggers drawing revision but revised drawing is not distributed to field | Link RFI closure to drawing revision distribution confirmation through document control |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| RFI overdue by 5 business days | At target +5 days | Document Control -> Discipline Lead Engineer |
| RFI overdue by 10 business days | At target +10 days | Discipline Lead -> Engineering Manager |
| Critical-path RFI overdue by 3 business days | At target +3 days | Engineering Manager -> Construction Manager -> Project Manager (joint resolution meeting) |
| RFI volume exceeds 10 per week from single discipline | Within weekly reporting | Construction Manager -> Engineering Manager (potential design quality issue) |
| RFI overdue by 15+ business days | At target +15 days | Project Manager -> Project Director (schedule delay risk) |
| RFI response changes design intent (scope change) | Within 48 hours of response | RFI Manager -> Change Control (FCN generation) -> Cost/Schedule impact assessment |
| Same drawing generates >5 RFIs | Upon 5th RFI from same drawing | Engineering Manager -> Design Lead (drawing review and re-issue) |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | RFI classifications correct; schedule impact assessments validated against CPM schedule | Audit of RFI cause codes and impact ratings |
| Completeness | 25% | Every RFI has unique ID, clear question, affected documents, cause classification, and schedule impact | Completeness check on RFI register fields |
| Consistency | 15% | RFI numbering, lifecycle stages, and response time calculations uniform across all disciplines | Process compliance audit |
| Format | 10% | Professional report with aging charts, Pareto analysis, and trend visualization | Visual review against VSC template |
| Actionability | 10% | Every overdue RFI has escalation status documented; every systemic finding has corrective action | Review of escalation log and action items |
| Traceability | 10% | Every closed RFI links to formal response document; every RFI-to-FCN conversion is linked | Audit trail on random sample |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | What is Provided | Criticality |
|---------------|-----------------|-------------|
| Construction Teams | RFI submissions with questions, sketches, photos, and proposed solutions | Critical |
| Engineering Design Agent | Formal responses to RFIs with supporting documentation (sketches, calculations, revised specs) | Critical |
| Execution Agent (Project Controls) | Schedule data identifying critical-path activities for RFI impact classification | High |
| Operations Agent | RFIs related to operability and maintainability concerns raised during construction | Medium |

### Outputs Consumed By

| Agent / Skill | What is Consumed | Trigger |
|---------------|-----------------|---------|
| track-field-change-notices | RFIs resulting in design changes generate FCNs with cost and schedule impact | On design-change response |
| manage-as-built-documentation | RFI responses that modify design are flagged for drawing revision and as-built update | On RFI closure |
| Execution Agent (Project Controls) | Schedule impact data from critical-path RFIs for reforecasting | On impact identification |
| Orchestrator Agent | RFI metrics (overdue count, response time, volume trends) for management reporting | Weekly reporting |
| generate-construction-reports | RFI statistics for inclusion in weekly and monthly construction progress reports | Per report cycle |

---

## References

### Methodology References
- VSC OR Playbook -- Construction-Engineering Interface Management (Level 4: Construction Execution)
- VSC Document Control Procedures -- RFI Processing and Filing Requirements
- VSC Change Management Framework -- RFI-to-FCN Conversion Protocol
- VSC Lessons Learned Database -- Common RFI patterns by project type and industry sector

### Industry Standards
- CII (Construction Industry Institute) RT-012 -- Pre-Project Planning: RFI Prevention through Design Quality
- AACE RP 25R-03 -- Estimating Lost Productivity in Construction Claims (RFI delay quantification)
- AIA Document G716 -- Request for Information (industry standard RFI form)
- AGC (Associated General Contractors) -- Best Practices for RFI Management in Construction
- FIDIC Conditions of Contract -- Clause 1.8: Care and Supply of Documents (information exchange obligations)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
