---
name: manage-field-quality
description: "Manage the full field quality lifecycle from ITP execution through NCR tracking to punch-list closure, ensuring construction meets specifications and codes. Triggers: 'field quality', 'ITP management', 'NCR tracking', 'calidad de obra', 'gestion de calidad', 'quality management construction'."
---

# Manage Field Quality

## Skill ID: CM-002

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Manage the full field quality lifecycle from Inspection and Test Plan (ITP) execution through Non-Conformance Report (NCR) tracking to punch-list closure, ensuring all construction work meets design specifications, applicable codes, and regulatory requirements before system turnover to commissioning.

Quality failures discovered during commissioning or operations cost 5-10x more to remediate than those caught during construction, and safety-critical defects that escape the quality net can have catastrophic consequences. In the mining and heavy industrial sectors common to VSC projects, welding defects in pressure piping, concrete deficiencies in foundations, and electrical installation errors represent the highest-consequence quality risks. A structured field quality management system transforms quality from a reactive inspection activity into a proactive prevention program.

This skill addresses the entire quality chain: defining what to inspect (ITPs), executing inspections at prescribed hold/witness/review points, documenting non-conformances when work fails to meet requirements, tracking dispositions and corrective actions to closure, analyzing trends to prevent recurrence, and managing the punch list that gates system turnover. The integration between ITP execution, NCR lifecycle, and punch-list management provides complete quality traceability from specification to installed condition.

Key value drivers:
- **Defect prevention**: ITP hold points catch defects before they are buried under subsequent work
- **Code compliance**: Systematic inspection ensures regulatory and code compliance (ASME, AWS, IEC, NCh)
- **Contractor accountability**: NCR trend analysis provides objective quality performance data per contractor
- **Turnover readiness**: Punch-list management ensures quality records are complete before MC certification
- **Regulatory compliance**: Chilean SERNAGEOMIN, SMA, and SEC requirements for quality documentation in mining and energy projects

---

## Intent & Specification

The AI agent MUST understand that:

1. **ITP Execution Tracking**: Every construction activity requiring quality verification must have an approved ITP defining inspection points (Hold, Witness, Review), acceptance criteria, applicable codes/standards, and responsible inspector. The agent must track ITP execution status across all active work fronts, ensuring no hold point is bypassed and all inspection results are recorded.
2. **NCR Lifecycle Management**: Non-conformances must follow a rigorous lifecycle: Identification -> Classification (Major/Minor) -> Root Cause Analysis -> Disposition (Rework/Repair/Use-As-Is/Scrap) -> Corrective Action -> Verification -> Close-out. Major NCRs require engineering disposition. Every NCR must be traceable to the specific location, equipment tag, and ITP inspection point where it was identified.
3. **Punch List Integration**: Quality deficiencies that cannot be resolved immediately feed into the punch list with proper categorization (A=safety-critical blocking MC, B=important blocking RFSU, C=minor blocking PC). The punch-list status directly gates mechanical completion and system turnover milestones.
4. **Quality Trend Analysis**: NCR data must be analyzed by discipline, contractor, defect type, area, and severity to identify systemic patterns. Recurring defect patterns (3+ similar NCRs from same source) trigger mandatory corrective action programs targeting the root cause rather than individual symptoms.
5. **Hold Point Compliance**: Hold points are absolute gates -- work MUST NOT proceed past a hold point until the inspection is performed and accepted. Witness points require notification; work may proceed if the witness does not attend after proper notification. Review points are documentation reviews that do not stop work.

### Constraints

- No hold point may be bypassed without formal written authorization from the Quality Manager and Engineering
- Major NCRs require engineering review and disposition within 5 business days
- NCR close-out requires physical verification by an independent inspector (not the originating inspector)
- All quality records must be retained for the life of the asset (minimum 25 years for pressure equipment)
- Inspection personnel must hold valid qualifications (CSWIP, AWS CWI, ASNT, NACE, etc.) appropriate to the inspection type
- Quality records must comply with Chilean regulatory requirements (SERNAGEOMIN DS 132 for mining, SEC TE-4 for electrical)

---

## Trigger / Invocation

```
/manage-field-quality
```

### Natural Language Triggers
- "What is the status of ITP inspections for the piping package?"
- "Show me all open NCRs by contractor"
- "Generate the weekly quality report"
- "Cual es el estado de las inspecciones de calidad?"
- "Mostrar NCRs abiertos por contratista y disciplina"
- "Generar reporte de tendencias de calidad de obra"

### Command Triggers
- `manage-field-quality itp --status [package|discipline|area] --id [identifier]`
- `manage-field-quality ncr --action [create|update|disposition|close] --id [ncr-id]`
- `manage-field-quality punchlist --view [open|overdue|by-system|by-contractor]`
- `manage-field-quality trend --period [weekly|monthly] --groupby [contractor|discipline|defect-type]`
- `manage-field-quality report --type [weekly|monthly|ncr-status|itp-compliance]`

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| Hold point approaching (T-24 hours) | Notify assigned inspector and contractor | High |
| Hold point bypassed without authorization | Critical alert to Quality Manager | Critical |
| NCR open >5 days without disposition | Escalation to Engineering Lead | High |
| NCR rejection rate exceeds 5% per discipline/contractor | Generate quality alert and trend analysis | High |
| System approaching MC with open punch-list A items | Alert Construction Manager and Quality Manager | Critical |
| Weekly reporting cycle | Generate weekly quality management report | High |

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Inspection and Test Plans (ITPs) | QA/QC + Engineering | .xlsx / .pdf | Approved ITPs per construction package defining all inspection points |
| Design Specifications | Engineering | .pdf / .dwg | Technical specifications, codes, and acceptance criteria |
| Contractor Quality Plans (CQPs) | Contractors | .pdf | Contractor-specific quality management procedures |
| Welder/Inspector Qualification Records | QA/QC | .xlsx | Qualification certificates for inspection and welding personnel |
| Material Test Certificates (MTCs) | Procurement / QA/QC | .pdf | Mill certificates and material traceability records |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Previous Project Quality Data | VSC Knowledge Base | .xlsx | Industry benchmark NCR rates applied |
| Regulatory Compliance Matrix | Contracts & Compliance | .xlsx | Standard Chilean code requirements applied |
| Vendor Quality Requirements | Procurement | .xlsx | Default to project specification requirements |
| Construction Schedule | Project Controls | .xer / .xlsx | ITP milestones tracked independently of schedule |

### Context Enrichment

The agent will automatically:
- Map ITP inspection points to construction schedule activities for sequencing
- Retrieve applicable code requirements (ASME, AWS, IEC, NCh) based on discipline and activity type
- Generate NCR classification criteria from project quality specification
- Pull industry benchmark NCR rates for comparison (typical: 2-4% rejection rate for welding, <1% for civil)
- Cross-reference inspector qualifications against ITP requirements to validate assignment
- Link deficiency types to VSC Failure Modes Table for equipment-related quality issues

---

## Output Specification

### Filename Format
`{ProjectCode}_Field_Quality_Report_{Period}_{YYYYMMDD}.xlsx`

### Structure

1. **Quality Dashboard** -- Executive summary showing ITP compliance rate, NCR statistics (open/closed/aging), punch-list status by category, contractor quality ranking, and key quality KPIs with traffic-light status indicators.

2. **ITP Execution Status** -- Detailed tracking of all ITPs by package/discipline showing total inspection points, points completed, hold points passed/pending/bypassed, witness point attendance rate, and upcoming inspections for the next 2 weeks.

3. **NCR Register** -- Complete register of all NCRs with: unique ID, date, location (area/system/tag), discipline, contractor, defect description, classification (Major/Minor), root cause category, disposition, corrective action status, verification date, close-out status, and days open.

4. **Punch List Register** -- All quality-originated punch-list items categorized A/B/C with responsible party, due date, resolution status, photo evidence links, and MC/RFSU/PC milestone association.

5. **Quality Trend Analysis** -- NCR trends by discipline, contractor, defect type, and area over rolling 12-week period. Includes Pareto analysis of top defect types, contractor quality performance comparison, and identification of systemic issues.

6. **Weld Map and NDE Summary** -- For piping and structural disciplines: weld joint status (welded/NDE completed/accepted/rejected), NDE rejection rates by welder and process, and weld repair tracking.

### Key Metrics Table

| Metric | Unit | Calculation | Target |
|--------|------|-------------|--------|
| ITP Hold Point Compliance | % | Hold points inspected / total hold points due | 100% |
| NCR Closure Rate | % | NCRs closed / NCRs opened (rolling 4 weeks) | >= 90% |
| NCR Average Age (open) | Days | Mean days open for active NCRs | < 14 days |
| Weld Rejection Rate | % | Welds rejected / welds inspected | < 4% |
| Punch List A Items at MC | Count | Category A items open per system at MC target | 0 |

---

## Procedure

### Step 1: Establish Quality Framework

1. Review and approve contractor Quality Plans (CQPs) for compliance with project specifications and applicable codes
2. Review and approve Inspection and Test Plans (ITPs) for each construction package, ensuring all hold/witness/review points are appropriate
3. Verify inspector qualifications match ITP requirements (welding inspectors hold AWS CWI or CSWIP, NDE technicians hold ASNT Level II, etc.)
4. Establish NCR classification criteria: define Major vs. Minor thresholds per discipline aligned with code requirements
5. Define punch-list categorization criteria consistent with verify-construction-quality skill and MC/RFSU/PC milestone requirements
6. Set up NCR numbering convention, workflow routing, and disposition authority matrix
7. Agree weld map numbering and NDE sampling rates per applicable code (ASME B31.3, AWS D1.1, etc.)

### Step 2: Execute ITP Inspections

1. Review upcoming inspection points from the 2-week look-ahead schedule and assign qualified inspectors
2. Issue hold-point notifications to contractors minimum 24 hours before planned inspection
3. Perform inspections at hold points: verify work against acceptance criteria, record results (accept/reject/conditional)
4. For rejections: initiate NCR with detailed defect description, location, photo evidence, and code reference
5. Attend witness points as scheduled; document attendance or non-attendance with rationale
6. Process review points: verify submitted documentation (MTCs, test certificates, calibration records) against requirements
7. Update ITP tracking register with inspection results, dates, and inspector identification

### Step 3: Manage NCR Lifecycle

1. Register new NCR with: unique ID, defect description, location (area/system/equipment tag), discipline, contractor, applicable code, photo evidence, and classification (Major/Minor)
2. For Major NCRs: route to Engineering for technical disposition within 5 business days (Rework/Repair/Use-As-Is/Scrap)
3. For Minor NCRs: Quality Manager may disposition directly per pre-agreed authority matrix
4. Issue disposition to contractor with specific corrective action requirements, acceptance criteria for verification, and completion deadline
5. Monitor corrective action implementation; provide technical guidance as needed
6. Perform verification inspection upon contractor notification of corrective action completion
7. Close NCR with verification evidence (photos, measurements, test results) and independent inspector sign-off

### Step 4: Analyze Quality Trends

1. Aggregate NCR data weekly by discipline, contractor, defect type, area, and severity
2. Produce Pareto analysis of top 5 defect types driving NCR volumes
3. Calculate NCR rate per 1000 man-hours (or per unit of work) by contractor for normalized comparison
4. Identify systemic patterns: 3+ similar NCRs from same contractor/discipline/defect type = systemic issue
5. For systemic issues: require contractor to submit Corrective Action / Preventive Action (CAPA) plan targeting root cause
6. Track CAPA implementation and measure effectiveness (reduction in recurrence rate)
7. Generate weekly quality trend report with charts, analysis, and recommended management actions

### Step 5: Manage Punch List and Support Turnover

1. Transfer unresolved quality deficiencies to the punch list with proper categorization (A/B/C) per verify-construction-quality criteria
2. Track punch-list resolution by responsible contractor with due dates aligned to MC/RFSU/PC milestones
3. Compile quality record packages per system for MC certification: all ITPs completed, NCRs closed (or accepted), test certificates, material certificates, welder qualification records
4. Verify 100% ITP completion for each system before MC walkdown
5. Provide quality metrics and open-item summary to MC readiness assessment per system
6. Archive all quality records in the document management system with proper indexing for life-of-asset retrieval

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Hold points bypassed without inspection | Contractor proceeds without notification; inspector unavailable | Automated hold-point notification system; backup inspector roster; disciplinary consequences for bypass |
| NCRs accumulate without disposition | Engineering overwhelmed; disposition authority unclear | Disposition authority matrix with escalation timelines; pre-agreed minor NCR self-disposition by QM |
| Punch list overwhelms team near MC | Quality deficiencies deferred rather than resolved during construction | Enforce "fix-as-you-go" policy; weekly punch-list status reviews from 80% completion |
| Weld rejection rate spikes undetected | NDE results not aggregated in real time | Daily NDE result compilation; automatic alert when rejection rate exceeds 4% per welder or process |
| Quality records incomplete at turnover | Documentation not collected concurrent with work | ITP sign-off requires attachment of supporting documents; no close-out without records |
| Inspector qualifications expired | Qualification tracking not maintained | Monthly qualification register audit; 90-day expiry warning alerts |
| Systemic defect not identified | NCRs treated as isolated incidents | Mandatory trend analysis; pattern-matching algorithm on NCR descriptions and codes |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Hold point bypassed | Immediately | Quality Manager -> Construction Manager -> Stop Work consideration |
| Major NCR without disposition for >5 business days | Day 5 | Engineering Manager -> Project Manager |
| NCR rejection rate exceeds 5% for any contractor/discipline | Within 48 hours | Construction Manager -> Contractor management meeting |
| Category A punch-list items unresolved within 14 days of MC target | Day 14 pre-MC | Construction Manager -> Project Director |
| Quality record package incomplete with MC <7 days away | Immediately | Quality Manager -> Construction Manager -> MC deferral consideration |
| Welder produces >10% rejection rate over 20+ welds | Within 48 hours | Welding Engineer -> Welder re-qualification or removal |
| Suspected material non-compliance (MTC discrepancy) | Immediately | Quality Manager -> Engineering -> Potential stop work on affected scope |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | All NCR dispositions technically sound per applicable code | Engineering review of disposition sample |
| Completeness | 25% | All ITPs tracked, all NCRs registered, all punch items captured | Audit of field activities vs. registered quality records |
| Consistency | 15% | NCR classification consistent across inspectors and disciplines | Classification calibration review |
| Format | 10% | Professional reporting, VSC branding, clear charts and tables | Visual QA review |
| Actionability | 10% | Every trend triggers specific corrective action recommendation | Trend-to-action traceability audit |
| Timeliness | 10% | NCRs registered within 24 hours; dispositions within 5 days | Timestamp audit on NCR lifecycle |

---

## Inter-Agent Dependencies

### Inputs From

| Agent | Data Required | Frequency | Criticality |
|-------|-------------|-----------|-------------|
| Execution (Schedule) | Construction schedule for ITP sequencing | Weekly update | High |
| HSE | Safety-related NCRs, safety hold requirements | As they occur | Critical |
| Contracts & Compliance | Contractor quality obligations, code compliance requirements | At contract award + changes | High |
| Engineering (via Doc Control) | Design specifications, approved-for-construction drawings, MTCs | At IFC + revisions | Critical |
| Asset Management | VSC Failure Modes Table for equipment-related defect classification | Reference | Medium |

### Outputs Consumed By

| Consumer Agent | Data Provided | Frequency | Usage |
|----------------|-------------|-----------|-------|
| Execution (MC Tracking) | ITP completion status, NCR closure status, punch-list status per system | Weekly | MC readiness verification |
| Orchestrator | Quality KPIs, NCR statistics, contractor quality ranking | Weekly | Management reporting, OR gate reviews |
| coordinate-subcontractors | Contractor quality performance scores | Weekly | Contractor performance evaluation |
| monitor-construction-safety | Safety-related NCRs and quality deficiencies | As they occur | Safety trend analysis |
| verify-construction-quality | Quality record packages per system | At MC approach | Construction quality verification |

---

## References

- **ASME B31.3**: Process Piping -- inspection and testing requirements for piping systems
- **AWS D1.1**: Structural Welding Code -- welding quality and NDE requirements
- **ISO 19011:2018**: Guidelines for auditing management systems -- applied to quality inspection methodology
- **NCh-ISO 9001**: Chilean adoption of ISO 9001 Quality Management Systems
- **SERNAGEOMIN DS 132**: Chilean mining safety regulations -- construction quality documentation requirements
- **VSC Failure Modes Table**: `methodology/standards/VSC_Failure_Modes_Table.xlsx` -- for equipment-related defect classification

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR Team | Initial creation -- Wave 3 |
