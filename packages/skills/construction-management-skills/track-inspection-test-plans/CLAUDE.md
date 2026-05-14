---
name: track-inspection-test-plans
description: "Manage ITPs across all construction disciplines, tracking hold, witness, and review points to completion. Triggers: 'ITP tracking', 'inspection test plan', 'hold points', 'witness points', 'plan de inspeccion', 'puntos de parada'."
---

# Track Inspection & Test Plans

## Skill ID: CM-06

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Manage the execution of Inspection and Test Plans (ITPs) across all construction disciplines -- civil, structural, mechanical, piping, electrical, and instrumentation -- tracking every hold point (H), witness point (W), and review point (R) from initial ITP approval through final sign-off. This skill ensures that no quality-critical inspection is missed and all verifications are performed by the correct party before construction proceeds to the next activity.

ITPs are the backbone of construction quality assurance. They translate engineering specifications and code requirements into a structured sequence of verifications that must be performed during construction. A single missed hold point can invalidate weeks of completed work, trigger costly rework, and introduce latent defects that only manifest during commissioning or early operations. Industry data shows that projects with rigorous ITP management achieve 30-50% fewer non-conformances during commissioning compared to those with ad-hoc inspection approaches.

In the Operational Readiness context, ITP completion is a hard prerequisite for Mechanical Completion (MC). No system can be declared mechanically complete unless 100% of its ITP hold points have been executed and signed off, and witness point notifications have been documented. The ITP completion percentage is therefore a leading indicator of MC readiness and a primary metric for construction quality performance.

Key value drivers:
- **Defect prevention**: Catching non-conformances at ITP checkpoints costs 5-10x less than discovery during commissioning
- **MC prerequisite**: ITP completion status directly gates MC milestone achievement
- **Regulatory compliance**: Many jurisdictions mandate third-party or authority inspections at defined hold points
- **Contractor accountability**: ITP compliance rate provides objective quality performance data per contractor
- **Schedule protection**: Proactive hold point scheduling prevents inspector availability delays

---

## Intent & Specification

The AI agent MUST understand that:

1. **Hold points (H) are absolute gates** -- construction work CANNOT proceed past a hold point until the designated inspection party (client QC, third-party inspector, or regulatory authority) has physically inspected and signed off. A missed or bypassed hold point invalidates all subsequent work and automatically triggers a Non-Conformance Report (NCR). There are no exceptions to this rule.

2. **Witness points (W) require documented notification** -- the designated party must be formally notified (minimum 24 hours for internal, 48 hours for third-party/regulatory) of the upcoming witness point. If the party does not attend after proper notification, work may proceed provided the notification record is documented. The absence must be noted on the ITP sign-off sheet.

3. **Review points (R) are document verification checkpoints** -- the designated party reviews documentation (test certificates, material certificates, procedures) before the activity proceeds. Review points do not require physical presence but require documented evidence of review and acceptance.

4. **ITP-to-activity mapping is mandatory** -- each ITP line item must map to a specific construction activity in the project schedule, a code or standard reference, quantitative acceptance criteria, the inspection method, and the responsible inspection party. Without this mapping, the ITP is not executable.

5. **Multi-contractor coordination is essential** -- on projects with multiple contractors, each contractor has their own ITPs, but the client's quality team must coordinate hold points across contractors to avoid conflicts, ensure inspector availability, and maintain a unified inspection schedule.

### ITP Point Type Definitions

| Point Type | Code | Definition | Party Attendance | Consequence if Missed |
|-----------|------|-----------|-----------------|----------------------|
| **Hold Point** | H | Mandatory inspection stop. Work physically cannot proceed until sign-off. | Mandatory physical presence | All subsequent work invalidated; NCR generated automatically |
| **Witness Point** | W | Notification-based inspection. Party must be notified; may proceed if party declines after notice. | Notification required; attendance optional | Work proceeds if notification documented; absence noted |
| **Review Point** | R | Document-based verification. Party reviews records, certificates, or test results. | No physical presence required | Work proceeds once documents submitted; review may be retroactive |
| **Surveillance** | S | Random or periodic spot-check by QC. No formal notification required. | At QC discretion | No direct consequence; used for trend monitoring |

---

## VSC Failure Modes Table Reference

When ITP inspections identify equipment defects or installation non-conformances that could lead to premature equipment failure, reference the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Construction defects discovered during ITP execution MUST be classified using:

**[WHAT fails] -> [Mechanism] due to [Cause]**

Examples of ITP-related failure mode classification:
- "Pump foundation -> Vibration-induced fatigue due to Misalignment from incorrect bolt torque"
- "Pipe flange joint -> External leakage due to Incorrect gasket installation"
- "Electrical cable termination -> Overheats due to Loose connection during installation"
- "Instrument impulse tubing -> Blocked due to Foreign material ingress during construction"
- "Structural steel connection -> Fatigue cracking due to Weld defect at hold point"

This classification enables traceability from construction defect to potential operational failure and integration with RCM/FMECA analyses in the Asset Management agent.

---

## Trigger / Invocation

```
/track-inspection-test-plans
```

### Natural Language Triggers (EN)
- "Show me the ITP status for piping in Area 100"
- "List upcoming hold points for this week across all disciplines"
- "What is the ITP compliance rate by contractor and discipline?"

### Natural Language Triggers (ES)
- "Mostrar el estado del plan de inspeccion para tuberias en el Area 100"
- "Listar los puntos de parada pendientes de esta semana"
- "Cual es la tasa de cumplimiento de ITPs por contratista y disciplina?"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| ITP Register | QA/QC Department | .xlsx/.csv | Master list of all ITPs by discipline, system, and contractor with line-item detail |
| Inspection Records | QC Inspectors / Third-Party | .xlsx/.pdf | Completed inspection results, sign-off sheets, and test certificates |
| Construction Schedule | Project Controls / Planning | .xer/.xml/.csv | Activity-level schedule for ITP alignment with planned and actual dates |
| Code & Standard References | Engineering | .pdf | Applicable codes per inspection activity (ASME, AWS, IEC, etc.) |

### Optional Inputs

| Input | Source | Default if Absent |
|-------|--------|-------------------|
| Third-Party Inspector Schedule | Inspection Agency | Assume available with 48-hour notice |
| Regulatory Inspection Calendar | Regulatory Authority | Extract from permit conditions |
| Contractor QC Staffing Plan | Contractors | Request deployment plan from each contractor |
| NDE Percentage Matrix | Project Specification | Extract from project quality plan |

### Context Enrichment (Automatic)

- Retrieve ITP templates per discipline from VSC methodology library
- Cross-reference ITP hold points with commissioning prerequisites from manage-mechanical-completion
- Pull applicable code requirements (ASME IX, ASME B31.3, AWS D1.1, IEC 61511) for acceptance criteria validation
- Access contractor quality management plans for contractor-specific ITP procedures
- Query historical ITP compliance data from similar VSC projects for benchmarking

---

## Output Specification

### Filename Format
`{ProjectCode}_ITP_Status_Report_{Discipline}_{YYYYMMDD}.md`

### Report Structure

1. **Executive Summary** -- Overall ITP compliance rate (H/W/R), systems approaching MC with ITP gaps, critical third-party inspection schedule conflicts
2. **ITP Compliance Dashboard** -- Compliance rate by discipline, by contractor, by area, with trend over reporting periods
3. **Upcoming Inspections (2-Week Lookahead)** -- Hold points, witness points, and review points scheduled for the next 14 days with inspector assignments and notification status
4. **Missed Hold Point Register** -- Any hold points that were bypassed or missed, with linked NCR reference and remediation status
5. **Third-Party & Regulatory Inspection Schedule** -- External inspector visits, booking status, areas/systems requiring regulatory authority inspection
6. **ITP Completion by System** -- Per-system ITP completion percentage as MC readiness indicator, with traffic light status

### Key Metrics Table

| Metric | Description | Target | Frequency |
|--------|-------------|--------|-----------|
| Hold Point Compliance Rate | % of H points executed on time with sign-off | 100% | Weekly |
| Witness Point Notification Rate | % of W points with documented notification | 100% | Weekly |
| ITP Completion by System | % of ITP line items completed per system | Track to 100% at MC | Weekly |
| Missed Hold Points | Count of bypassed hold points triggering NCRs | 0 | Weekly |
| Third-Party Inspector Utilization | % of scheduled third-party inspections completed | >95% | Monthly |

---

## Procedure

### Step 1: Establish ITP Framework

- Collect and register all ITPs from each contractor, organized by discipline and system
- Validate each ITP against the applicable code and project specification to ensure all required hold, witness, and review points are captured
- Verify that acceptance criteria are quantitative and measurable (e.g., "torque to 150 Nm +/-10%", not "tighten properly")
- Map every ITP line item to a specific construction schedule activity using activity IDs from the P6 schedule
- Identify all hold points requiring third-party or regulatory authority presence and log their lead-time requirements (48-hour, 72-hour, or pre-scheduled)
- Create unified ITP tracking register consolidating all contractor ITPs into a single project-level view with filtering by discipline, system, contractor, and point type
- Establish ITP numbering convention: ITP-{Discipline}-{System}-{Contractor}-{Seq}
- Distribute approved ITP register to all stakeholders with roles and notification requirements
- Conduct ITP alignment workshop with each contractor QC manager to confirm understanding of roles and responsibilities

### Step 2: Schedule and Coordinate Inspections

- Generate 2-week rolling lookahead of upcoming hold and witness points aligned to the construction schedule
- Book third-party inspectors against the lookahead, confirming availability at least 5 business days in advance
- Identify schedule conflicts where multiple hold points require the same inspector in the same time window and establish priority rules (critical path first, then safety-critical, then general)
- Issue formal witness point notifications to designated parties per the required notification period (24h internal, 48h external)
- Coordinate with contractors to ensure test/inspection readiness: equipment calibrated, test area safe and accessible, pre-inspection documentation prepared and available
- For regulatory authority inspections, coordinate scheduling at least 15 business days in advance and confirm all prerequisite documentation is assembled
- Maintain an inspection resource loading chart showing inspector demand by week, discipline, and area to identify bottlenecks before they impact schedule
- Flag any hold points on the critical path where inspector unavailability could delay MC
- Maintain a 4-week rolling forecast for third-party inspector demand to allow early booking of external resources

### Step 3: Execute and Record Inspections

- Record the result of each inspection: Pass, Fail (NCR generated), or Conditional Pass (minor deficiency noted, remediation tracked)
- Capture sign-off details: inspector name, organization, qualification level, date, time, and signature reference
- For witness points where the designated party did not attend despite notification, document the notification record (date, time, method of notification, receipt confirmation) and proceed with contractor QC sign-off only
- For failed inspections, automatically generate an NCR reference and link to the manage-field-quality skill for tracking; record the specific failure criteria and defect description
- Classify failed inspections using the VSC Failure Modes Table structure: [WHAT fails] -> [Mechanism] due to [Cause] for traceability to operational risk
- Update the ITP register in real-time as inspections are completed, maintaining a running completion percentage per system
- Attach supporting documentation (test certificates, calibration records, material certificates) to each completed ITP line item
- For hold points requiring physical testing (hydrostatic test, pneumatic test, load test), record test parameters (pressure, duration, medium, ambient temperature) alongside the pass/fail result
- Photograph key inspection results (alignment measurements, torque verification, surface preparation) as visual evidence for the as-built record

### Step 4: Monitor Compliance and Identify Gaps

- Calculate ITP compliance rate weekly: (hold points completed on time / total hold points due) x 100
- Analyze compliance by multiple dimensions: by discipline (piping, electrical, civil, etc.), by contractor, by area, by system
- Identify patterns of non-compliance (e.g., same contractor consistently missing hold points, same discipline with documentation gaps)
- Track ITP completion percentage per system against MC target dates to project whether ITP completion will gate MC
- Calculate the ITP execution velocity (hold points closed per week per discipline) and compare against the rate needed to meet MC target dates
- Generate weekly compliance trend charts showing improvement or deterioration over the last 4-8 reporting periods
- Track conditional pass items separately to ensure remediation is completed before system-level MC sign-off
- Escalate systemic non-compliance to construction management with root cause analysis and recommended corrective actions

### Step 5: Compile MC Readiness Assessment

- For each system approaching MC, calculate the ITP completion percentage and list all outstanding ITP items
- Classify outstanding items as: hold points not yet reached (scheduled future), hold points overdue (should have been done), hold points failed (NCR pending resolution)
- Generate system-level ITP readiness status: GREEN (100% H points complete), AMBER (>90% complete with plan for remainder), RED (<90% or failed H points unresolved)
- Calculate the ITP completion velocity (hold points closed per week) and project whether 100% completion is achievable before the MC target date
- Provide the ITP readiness summary to manage-mechanical-completion as a prerequisite input for MC certificate issuance
- Archive completed ITP packages (signed forms, test certificates, NDE reports) for handover to operations as part of the as-built documentation package
- Conduct a final ITP reconciliation: verify that the total number of completed ITP line items matches the total required per the approved ITP register, with zero gaps

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Hold point bypassed without inspection | Construction crew proceeds without checking ITP requirements | Embed ITP hold point reminders in daily work permits and pre-task briefings |
| Third-party inspector not available | Insufficient lead time for booking external inspectors | Maintain 4-week rolling lookahead and book inspectors at least 2 weeks in advance |
| ITP not aligned to schedule | ITP created from spec but not linked to construction activities | Mandate ITP-to-schedule mapping during ITP approval process |
| Witness point notification not documented | Verbal notification given but not recorded | Use standardized notification forms with acknowledgment receipts |
| Acceptance criteria ambiguous | ITP references code section but does not state quantitative criteria | Require specific pass/fail criteria (dimensions, tolerances, test values) in each ITP line item |
| Multi-contractor ITP conflicts | Multiple contractors need same inspector simultaneously | Unified inspection schedule managed by client QC team with priority rules |
| ITP completion falsely reported | Contractor marks ITP complete without all supporting documents | Independent audit of ITP sign-off packages at MC gate review |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Hold point bypassed without sign-off | Immediate | QC Manager -> Construction Manager -> Project Director |
| Third-party inspector unavailable for critical-path hold point | 5 days before scheduled date | QC Manager -> mobilize alternate inspector or reschedule |
| ITP compliance rate drops below 90% for any contractor | Within weekly reporting cycle | Construction Manager -> Contractor Project Manager |
| Hold point failed (NCR generated) on critical path | Within 24 hours of failure | QC Manager -> Construction Manager -> Engineering (for disposition) |
| Regulatory authority inspection cannot be scheduled in time | 10 days before required date | Project Manager -> Regulatory Authority liaison |
| System ITP completion <80% with MC date within 30 days | Within weekly reporting cycle | Construction Manager -> Project Director (MC delay risk) |
| Repeated witness point no-shows by client representative | After 3rd occurrence | QC Manager -> Client Project Manager |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | ITP line items match applicable code requirements exactly | Audit of ITP vs. code clause references |
| Completeness | 25% | 100% of construction activities with quality significance have corresponding ITP entries | Cross-reference ITP register vs. activity list |
| Consistency | 15% | ITP numbering, terminology, and format uniform across all contractors | Template compliance audit |
| Format | 10% | Professional report with clear tables, trend charts, and traffic-light indicators | Visual review against VSC template |
| Actionability | 10% | Every gap or non-compliance has assigned owner, due date, and escalation path | Review of action items in report |
| Traceability | 10% | Every completed ITP line item links to signed inspection record and supporting documents | Audit trail verification |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | What is Provided | Criticality |
|---------------|-----------------|-------------|
| Engineering Design Agent | Specifications, code references, acceptance criteria for ITP line items | Critical |
| HSE Agent | Safety-critical hold points requiring regulatory authority presence | High |
| Execution Agent (Project Controls) | Construction schedule with activity dates for ITP alignment | Critical |
| Quality Department | ITP templates, NDE percentage matrices, QC staffing plans | High |

### Outputs Consumed By

| Agent / Skill | What is Consumed | Trigger |
|---------------|-----------------|---------|
| manage-field-quality | Failed hold/witness points generate NCRs; ITP results feed quality metrics | On inspection failure |
| manage-mechanical-completion | ITP completion percentage is a hard prerequisite for MC certificate | At MC gate review |
| track-welding-nde-records | Welding ITP hold points coordinate with NDE scheduling | Continuous |
| Orchestrator Agent | ITP compliance rate feeds construction quality KPI dashboard | Weekly reporting |
| manage-as-built-documentation | Completed ITP packages form part of as-built handover documentation | At system completion |

---

## References

### Methodology References
- VSC OR Playbook -- Construction Quality Verification (Level 5: Commissioning & Startup Readiness)
- VSC Quality Management Framework -- ITP Development and Execution Guidelines
- VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) -- for classifying equipment defects found during ITP inspections
- Progressive Handover Protocol -- ITP completion as MC gate criterion

### Industry Standards
- ASME Section IX -- Welding and Brazing Qualifications (welding ITP hold points)
- ASME B31.3 -- Process Piping (piping ITP requirements)
- AWS D1.1 -- Structural Welding Code (structural welding ITP hold points)
- IEC 61511 -- Safety Instrumented Systems (SIS verification hold points)
- ISO 17020 -- Requirements for Bodies Performing Inspection (third-party inspector qualifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
