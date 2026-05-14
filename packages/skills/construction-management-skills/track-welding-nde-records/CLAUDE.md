---
name: track-welding-nde-records
description: "Manage welding quality records, WPS/PQR compliance, welder qualifications, NDE reports, and weld maps with full traceability. Triggers: 'welding records', 'NDE reports', 'weld map', 'WPS PQR', 'registros de soldadura', 'ensayos no destructivos'."
---

# Track Welding & NDE Records

## Skill ID: CM-08

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P2 - High

---

## Purpose

Manage the complete welding and non-destructive examination (NDE) documentation chain -- from welder qualification and WPS/PQR validation through weld execution tracking, NDE scheduling and results recording, to final weld map compilation for as-built documentation. This skill ensures full traceability of every welded joint from procedure qualification to final inspection, meeting the stringent requirements of pressure equipment codes and client specifications.

Welding is the most quality-sensitive construction activity in industrial projects. A single defective weld in a high-pressure piping system, pressure vessel, or structural connection can lead to catastrophic failure -- process fluid release, structural collapse, or explosion. Consequently, welding quality is regulated by prescriptive codes (ASME IX, ASME B31.3, AWS D1.1, EN ISO 15614) that mandate complete documentation traceability: every weld must be traceable to the welder who performed it, the procedure used, the materials joined, the NDE performed, and the final acceptance.

In the Operational Readiness context, welding completion and NDE acceptance are hard prerequisites for Mechanical Completion (MC). No piping system, pressure vessel, or structural steel connection can be declared mechanically complete without full welding documentation and NDE clearance. The weld repair rate (rejected welds as a percentage of total welds examined) is a primary quality KPI that directly predicts commissioning readiness and first-year reliability performance.

Key value drivers:
- **Regulatory compliance**: Complete weld traceability is a legal requirement for pressure equipment and structural connections
- **MC prerequisite**: Welding and NDE completion gates mechanical completion of piping, vessels, and structural systems
- **Reliability prediction**: Weld repair rate trending predicts early-life equipment reliability performance
- **Cost control**: Early detection of welding quality problems prevents cascading rework costs (a single piping weld repair costs USD 2,000-5,000)
- **Contractor performance management**: Repair rate data provides objective evidence for contractor quality performance evaluation

---

## Intent & Specification

The AI agent MUST understand that:

1. **Every weld joint requires complete traceability** -- the documentation chain for each weld must include: joint ID (from weld map), welder ID, WPS number, filler material heat/lot number, base material heat number, preheat temperature (if applicable), interpass temperature (if applicable), PWHT record (if applicable), NDE method and result, and final acceptance. Any break in this chain makes the weld non-compliant.

2. **WPS must be backed by PQR before any production welding** -- a Welding Procedure Specification (WPS) defines how to weld (process, position, base metals, filler metals, preheat, electrical parameters). Each WPS must be qualified by a Procedure Qualification Record (PQR) that demonstrates the procedure produces acceptable results through destructive testing per the applicable code (ASME Section IX, AWS D1.1, or EN ISO 15614). No production welding may proceed using an unqualified WPS.

3. **Welder qualifications have defined scope and validity** -- each welder is qualified for specific welding processes, material groups, thickness ranges, positions, and joint configurations. Welders working outside their qualification scope produce non-compliant welds. Qualifications typically expire if the welder has not used the process within a 6-month period and must be re-validated.

4. **NDE requirements are code-driven and non-negotiable** -- the applicable design code (ASME B31.3 for process piping, ASME Section VIII for vessels, AWS D1.1 for structural) defines which NDE methods are required and at what percentage. Common methods include: Visual Testing (VT) at 100%, Radiographic Testing (RT) or Ultrasonic Testing (UT) at 5-100% depending on weld class, Magnetic Particle Testing (MT) and Liquid Penetrant Testing (PT) for surface-breaking defects.

5. **Repair rate is the key quality metric** -- the weld reject rate (number of welds failing NDE / total welds examined x 100%) must be tracked per welder, per WPS, per contractor, and per discipline. Industry benchmarks: <3% is excellent, 3-5% is acceptable, >5% triggers corrective action, >10% requires welding program review and potential welder de-qualification.

### NDE Method Reference

| NDE Method | Code | Application | Detects | Typical Coverage |
|-----------|------|------------|---------|-----------------|
| **Visual Testing** | VT | All welds -- first inspection performed | Surface defects: cracks, porosity, undercut, incomplete fusion, misalignment | 100% of all welds |
| **Radiographic Testing** | RT | Butt welds in piping and vessels | Internal defects: porosity, inclusions, lack of fusion, cracks | 5-100% per weld class |
| **Ultrasonic Testing** | UT | Thick-wall butt welds, structural connections | Internal defects: lack of fusion, cracks, laminations | 5-100% per weld class |
| **Magnetic Particle Testing** | MT | Ferromagnetic materials -- surface and near-surface | Surface and near-surface cracks, seams, laps | Per code requirement |
| **Liquid Penetrant Testing** | PT | Non-ferromagnetic materials, austenitic stainless steel | Surface-breaking defects: cracks, porosity, laps | Per code requirement |

### Repair Rate Benchmark Scale

| Repair Rate | Rating | Action Required |
|------------|--------|----------------|
| <3% | Excellent | Continue monitoring; recognize good performance |
| 3-5% | Acceptable | Monitor trends; no immediate action |
| 5-8% | Marginal | Increase NDE percentage for affected welder; investigate root cause |
| 8-10% | Poor | Mandatory corrective action; retraining or reassignment of welder |
| >10% | Critical | Welding program review; potential welder de-qualification and removal from project |

---

## Trigger / Invocation

```
/track-welding-nde-records
```

### Natural Language Triggers (EN)
- "What is the weld repair rate for Contractor A on piping?"
- "Show me NDE results and outstanding examinations for system 3200"
- "Are all welders qualified for the WPS being used on high-pressure piping?"

### Natural Language Triggers (ES)
- "Cual es la tasa de reparacion de soldadura del Contratista A en tuberias?"
- "Mostrar los resultados de END y examenes pendientes para el sistema 3200"
- "Todos los soldadores estan calificados para el WPS utilizado en tuberias de alta presion?"

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Weld Log | QC Department / Contractors | .xlsx/.csv | Joint ID, welder ID, WPS number, date welded, location, base materials, filler materials |
| NDE Reports | NDE Subcontractor / QC | .pdf/.xlsx | Examination results per joint including method, acceptance criteria, result, examiner ID |
| WPS/PQR Register | QC / Welding Engineer | .pdf/.xlsx | All qualified welding procedures with supporting PQR documentation |
| Welder Qualification Register | QC Department | .xlsx | Certified welders with scope (process, material, position, thickness range), certification dates, expiry |

### Optional Inputs

| Input | Source | Default if Absent |
|-------|--------|-------------------|
| Isometric Drawings | Engineering | Weld maps reference iso number only without overlay |
| NDE Percentage Matrix | Project Specification | Extract from applicable code minimum requirements |
| Material Certificates (MTRs) | Procurement / Warehouse | Heat number traceability available but not linked automatically |
| PWHT Records | QC Department | Link manually when required by WPS |

### Context Enrichment (Automatic)

- Retrieve applicable code NDE requirements (ASME B31.3, ASME VIII, AWS D1.1) for the project scope
- Cross-reference welder qualifications against WPS essential variables to detect scope violations
- Pull industry benchmark repair rates for comparison (by discipline and project type)
- Access VSC Failure Modes Table for weld defect classification using the standard structure
- Query track-inspection-test-plans for welding-related ITP hold points requiring coordination

---

## Output Specification

### Filename Format
`{ProjectCode}_Welding_NDE_Status_{System}_{YYYYMMDD}.md`

### Report Structure

1. **Welding Progress Summary** -- Weld joints completed vs. total per system, per discipline, with completion percentage and trend
2. **NDE Execution Status** -- Welds examined vs. required per NDE method (RT, UT, MT, PT, VT), NDE backlog with schedule impact assessment
3. **Repair Rate Analysis** -- Weld reject rate by welder, by WPS, by contractor, by discipline, with trend charts over 4+ reporting periods
4. **Welder Qualification Matrix** -- Active welders vs. WPS coverage, qualifications approaching expiry, welders working outside scope (flagged)
5. **Outstanding NDE Backlog** -- Welds awaiting NDE with aging analysis and schedule impact on MC milestones
6. **Weld Map Compilation Status** -- Per-system weld map completion for as-built documentation handover readiness

### Key Metrics Table

| Metric | Description | Target | Frequency |
|--------|-------------|--------|-----------|
| Weld Completion Rate | % of weld joints completed per system | Track to 100% | Weekly |
| NDE Completion Rate | % of required NDE examinations completed | Track to 100% at MC | Weekly |
| Weld Repair Rate (Overall) | Rejected welds / total welds examined x 100% | <5% | Weekly |
| Welder Qualification Compliance | % of welds performed by qualified welders for that WPS | 100% | Weekly |
| NDE Backlog Age | Average days from weld completion to NDE examination | <5 days | Weekly |

---

## Procedure

### Step 1: Validate Welding Program Foundation

- Collect all WPS documents from each contractor and verify each WPS is backed by a qualified PQR per the applicable code (ASME IX, AWS D1.1, or EN ISO 15614)
- Review the essential variables of each PQR (base metal group, filler metal classification, welding process, position, thickness range, preheat, PWHT) to confirm the WPS is properly supported
- Compile the project welder qualification register, verifying each welder's certification scope (process, material, position, thickness, joint type) and expiry dates
- Cross-reference welder qualifications against the WPS assignments to ensure every welder is qualified for their assigned work
- Verify welder continuity records: confirm no welder has a gap exceeding 6 months for any qualified process (automatic disqualification per ASME IX)
- Define NDE requirements per weld class based on the applicable code and project specification (NDE percentage matrix)
- Establish weld joint numbering convention aligned with isometric drawings for weld map compilation: format WJ-{System}-{IsoNumber}-{Seq}
- Create the project weld log template with all required traceability fields including material heat numbers and filler metal lot numbers
- Conduct welding program kickoff meeting with each contractor's welding engineer and QC manager to align on procedures and expectations

### Step 2: Track Daily Welding Production

- Record each weld joint as it is completed: joint ID, welder ID, WPS used, date, filler material heat/lot, base material heat numbers
- Validate that the welder performing each weld is qualified for the WPS and position being used -- flag any scope violations immediately
- Track preheat and interpass temperature compliance for welds requiring temperature control (as specified in the WPS)
- Verify filler material traceability: confirm that the filler metal classification and heat/lot number match the WPS requirements and material requisition
- Monitor welder productivity by discipline and compare against project schedule requirements
- Update weld completion percentage per system and per iso drawing
- For welds requiring post-weld heat treatment (PWHT), track PWHT scheduling, execution, and thermocouple chart records
- Monitor welder qualification expiry dates: alert 30 days before any active welder's qualification expires to allow time for requalification testing
- Flag any welding performed without a qualified WPS or by an unqualified welder as an immediate NCR

### Step 3: Manage NDE Scheduling and Results

- Schedule NDE examinations against completed welds based on the NDE percentage matrix (random selection for percentage-based NDE, 100% for critical welds)
- Coordinate NDE subcontractor mobilization to minimize the gap between weld completion and NDE examination (target <5 days)
- Verify NDE examiner qualifications: confirm each examiner holds valid ASNT SNT-TC-1A Level II or Level III certification for the NDE method being applied
- Record NDE results: method, examiner, acceptance criteria, result (Accept/Reject), defect description if rejected, report number
- For rejected welds, initiate the repair process: mark up the weld map, notify the welder/contractor, track the repair weld, and schedule re-examination
- For RT examinations, maintain film quality records including image quality indicator (IQI) verification and film density readings within acceptable range
- For UT examinations, record probe calibration data, scanning patterns, and defect sizing measurements per the applicable procedure
- Apply penalty NDE: when a welder's repair rate exceeds the threshold (e.g., >5%), increase the NDE percentage for that welder from random to 100% until performance improves
- Track NDE backlog (welds completed but not yet examined) and escalate when backlog exceeds 5 days average age or threatens MC milestone

### Step 4: Analyze Repair Rates and Quality Trends

- Calculate weld repair rate weekly by multiple dimensions: per welder, per WPS, per contractor, per discipline, per NDE method
- Compare repair rates against industry benchmarks and project targets (excellent <3%, acceptable 3-5%, action required >5%, review >10%)
- Identify patterns: is one welder responsible for disproportionate rejects? Is one WPS producing consistent failures? Is one contractor systemically underperforming?
- Classify weld defects by type (porosity, lack of fusion, incomplete penetration, slag inclusion, undercut, crack) to identify whether failures are procedural or skill-related
- For welders exceeding the repair rate threshold, recommend corrective actions: additional training, skill assessment retest, reassignment to lower-criticality welds, or removal from project
- For WPS-related failures, investigate root cause: is the procedure adequate, or are welders not following parameters? Recommend WPS revision or enhanced supervision
- Track the cumulative cost of weld repairs (labor, NDE re-examination, schedule impact) to quantify quality failure costs for management reporting
- Generate weekly trend charts showing repair rate evolution, with annotations for corrective actions taken and their effectiveness
- Feed repair rate data to manage-field-quality for NCR generation and to manage-mechanical-completion for MC readiness assessment

### Step 5: Compile Weld Maps and Prepare for Handover

- Generate weld maps per isometric drawing showing: joint location, joint ID, welder, WPS, NDE method, NDE result, final status (Accept/Repair/Accept after Repair)
- Cross-reference weld maps against weld logs to ensure 100% of joints are documented with complete traceability
- Identify any gaps: joints on the isometric drawing without weld log entries, weld log entries without NDE results, joints without final acceptance
- Verify material traceability: confirm heat numbers for base materials and lot numbers for filler materials are recorded for every weld joint
- For welds that were repaired, ensure the repair cycle is fully documented: original defect description, repair WPS, repair welder ID, re-examination method, and final acceptance
- Compile the welding documentation package per system for handover: weld log, NDE reports, WPS/PQR documents, welder qualification certificates, PWHT records, material certificates
- Validate that all PWHT charts (thermocouple records) show the correct soak temperature, hold time, and heating/cooling rates per the WPS requirements
- Provide system-level welding completion status to manage-mechanical-completion as MC prerequisite evidence
- Generate final weld quality summary report per system: total joints, NDE results, repair history, final acceptance status
- Archive completed weld packages for as-built documentation handover to operations, organized by system and isometric number

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Weld performed by unqualified welder | Welder assigned to work outside qualification scope or with expired certification | Automated cross-reference of welder qualification register against daily weld assignments |
| NDE backlog delays MC milestone | NDE subcontractor cannot keep pace with welding production | Monitor NDE backlog weekly; mobilize additional NDE crews when backlog exceeds 5-day average |
| WPS used without valid PQR | New material combination introduced without qualifying the procedure | WPS/PQR validation at project start and before any new WPS is used in production |
| Repair rate trending upward undetected | Repair data collected but not analyzed for trends | Automated weekly trend analysis with threshold alerts at 5% and 10% |
| Weld map incomplete at system completion | Weld joints not numbered consistently or weld log entries missing | Mandatory joint numbering at isometric issue; daily weld log reconciliation |
| Filler material traceability lost | Heat/lot numbers not recorded at time of welding | QC inspector verifies filler material heat/lot number at each hold point before welding proceeds |
| PWHT not performed on required joints | PWHT requirement from WPS overlooked during production | Flag PWHT-required joints in weld log at planning stage; track PWHT scheduling separately |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Welding performed without qualified WPS | Immediate stop-work | QC Manager -> Construction Manager -> Welding Engineer (assess disposition) |
| Welder found working outside qualification scope | Immediate stop-work for that welder | QC Inspector -> QC Manager -> Contractor Welding Supervisor |
| Welder repair rate exceeds 10% over 20+ welds | Within weekly reporting cycle | QC Manager -> Construction Manager -> Contractor (welder reassignment/removal) |
| NDE backlog exceeds 10 days average age | Within weekly reporting cycle | QC Manager -> NDE Subcontractor Manager -> Construction Manager |
| Systematic WPS failure (>3 rejects on same WPS) | Within 48 hours of third reject | Welding Engineer -> QC Manager -> Engineering (WPS review and possible requalification) |
| Weld completion rate threatens MC milestone date | 30 days before MC | Construction Manager -> Project Director (resource mobilization) |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | WPS/PQR validation correct per applicable code; NDE acceptance criteria match code requirements | Independent audit of WPS/PQR and NDE criteria |
| Completeness | 25% | 100% of weld joints have complete traceability chain (welder, WPS, NDE, acceptance) | Weld log reconciliation against weld maps |
| Consistency | 15% | Weld numbering, NDE reporting format, and repair rate calculations uniform across contractors | Template and methodology compliance audit |
| Format | 10% | Professional report with clear tables, repair rate trend charts, and system completion dashboards | Visual review against VSC template |
| Actionability | 10% | Every quality exceedance (repair rate, backlog) has corrective action with owner and deadline | Review of corrective action register |
| Traceability | 10% | Every NDE report links to specific weld joint, welder, and WPS; repair history fully documented | Audit trail verification on random sample |

---

## Inter-Agent Dependencies

### Inputs From

| Agent / Skill | What is Provided | Criticality |
|---------------|-----------------|-------------|
| Engineering Design Agent | Weld procedure specifications, material specifications, P&ID and isometric drawings for weld map reference | Critical |
| track-inspection-test-plans | Welding ITP hold points (pre-weld fit-up, in-process, final visual) coordinating NDE scheduling | High |
| Contracts & Compliance Agent | Code references (ASME IX, B31.3, AWS D1.1) and project specification NDE requirements | Critical |
| Quality Department | NDE percentage matrix, welder qualification standards, WPS/PQR approval process | High |

### Outputs Consumed By

| Agent / Skill | What is Consumed | Trigger |
|---------------|-----------------|---------|
| manage-field-quality | Weld rejections generate NCRs; repair rate data feeds quality trending | On weld rejection |
| manage-mechanical-completion | Weld completion percentage and NDE acceptance are MC prerequisites | At MC gate review |
| manage-as-built-documentation | Final weld maps, NDE report packages, and welder qualification records for as-built handover | At system completion |
| Orchestrator Agent | Weld repair rate and NDE completion metrics for construction quality dashboard | Weekly reporting |
| generate-construction-reports | Welding progress and quality data for weekly/monthly construction reports | Per report cycle |

---

## References

### Methodology References
- VSC OR Playbook -- Construction Quality Management (Level 4: Construction Execution)
- VSC Quality Management Framework -- Welding Quality Control Procedures
- VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) -- for classifying weld defects (e.g., "Pipe weld joint -> Leaks due to Incomplete fusion")
- Progressive Handover Protocol -- Welding completion as MC gate criterion

### Industry Standards
- ASME Section IX -- Welding, Brazing, and Fusing Qualifications (WPS/PQR/welder qualification)
- ASME B31.3 -- Process Piping (NDE requirements for piping welds)
- ASME Section VIII Division 1 -- Pressure Vessels (vessel welding and NDE requirements)
- AWS D1.1 -- Structural Welding Code - Steel (structural welding requirements)
- EN ISO 9606 -- Qualification Testing of Welders (European welder qualification standard)
- ASNT SNT-TC-1A -- Recommended Practice for Personnel Qualification and Certification in NDE

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial creation -- Wave 3 |
