---
name: manage-mechanical-completion
description: "Track and manage the Mechanical Completion (MC) certification process from system definition through walkdowns, punch-list management, to certificate issuance. Triggers: 'mechanical completion', 'MC certificate', 'system turnover', 'completamiento mecanico', 'certificado MC', 'turnover package'."
---

# Manage Mechanical Completion

## Skill ID: CM-005

## Version: 1.0.0

## Category: D-Monitoring (Construction Management)

## Priority: P1 - Critical

---

## Purpose

Track and manage the Mechanical Completion (MC) certification process from system definition through walkdowns, punch-list management, to certificate issuance. Ensure every system achieves MC status with complete quality records before transfer to commissioning, maintaining the integrity of the progressive handover process.

Mechanical Completion is the single most important milestone in the construction-to-operations transition. It formally certifies that a system has been constructed in accordance with design documents, all equipment is installed, tested, and physically ready for commissioning activities. MC is the gate through which every system must pass before commissioning fluids can be introduced, energization can occur, or any operational testing can begin. A premature or incomplete MC certificate transfers unresolved construction defects into the commissioning phase where they are far more costly, disruptive, and dangerous to remediate.

Industry experience from IPA and CII shows that projects with rigorous MC processes achieve 20-30% shorter commissioning durations compared to those with weak MC discipline. The key differentiator is completeness: MC certificates backed by verified quality records, zero Category A punch-list items, and confirmed preservation status create a solid foundation for commissioning success. Conversely, MC certificates issued under schedule pressure with unresolved defects and incomplete documentation create a "technical debt" that compounds through commissioning and into early operations.

This skill manages the entire MC lifecycle: defining system and subsystem boundaries aligned with commissioning priorities, tracking construction completion by system (not just by area or discipline), managing the MC walkdown process, driving punch-list resolution, compiling System Turnover Packages (STPs), and issuing MC certificates with full quality record traceability.

Key value drivers:
- **Commissioning efficiency**: Complete MC packages reduce commissioning rework and delays by 20-30%
- **Safety assurance**: MC walkdowns verify that safety-critical items are installed and functional before system energization
- **Quality traceability**: STPs provide life-of-asset quality documentation from installation through testing
- **Schedule certainty**: System-level MC tracking provides granular visibility into commissioning readiness
- **Contractual milestone**: MC achievement triggers contractual payment milestones and begins warranty clocks

---

## Intent & Specification

The AI agent MUST understand that:

1. **System/Subsystem Definition**: MC is managed at the system level, not the discipline or area level. System boundaries must align with commissioning and turnover priorities. Each system is defined by its functional purpose and includes all disciplines (civil, structural, mechanical, piping, electrical, instrumentation) needed to make that system mechanically complete. Subsystems may be defined for phased MC within a larger system.
2. **MC Walkdown Process**: Before MC certification, a formal walkdown must be conducted by a multi-discipline team (construction, commissioning, operations, HSE, quality) who physically verify that all equipment is installed, piping is connected and hydrotest complete, electrical connections are made, instruments are installed and loop-checked, and the system is safe for commissioning. Walkdown findings are added to the punch list.
3. **Punch-List Classification and Closure**: Punch-list items are classified as: A (safety-critical or functionality-blocking -- must be closed before MC), B (important but system can commission with conditions -- must be closed before RFSU), C (minor/cosmetic -- must be closed before Provisional Completion). Category A items represent an absolute gate: MC CANNOT be certified while any Category A item remains open.
4. **System Turnover Package (STP)**: Each MC certificate must be accompanied by a comprehensive STP containing: as-built drawings, test certificates (hydro, pressure, electrical, NDE), material certificates, equipment vendor data, ITP sign-off records, weld maps with NDE results, alignment/rotation check records, calibration certificates, and all NCR close-out records. The STP is the quality evidence package that proves the system was built correctly.
5. **Preservation Status Verification**: Before MC, the preservation status of all equipment must be verified. Equipment that has been preserved during construction must have current preservation records. Equipment requiring de-preservation before commissioning must have de-preservation procedures identified and scheduled. Preservation failures discovered at MC require immediate remediation.

### Constraints

- MC certificate cannot be issued with ANY Category A punch-list items open (absolute requirement)
- MC walkdown must include representatives from construction, commissioning, operations, and HSE
- STP must contain 100% of required quality records before MC certificate can be signed
- MC certificate requires dual signature: Construction Manager and Commissioning Manager (minimum)
- System boundaries must be agreed with the commissioning team before MC tracking begins
- All ITP inspection points within the system must be completed and signed before MC
- NDE acceptance must be confirmed for all welds within the system per applicable code
- Preservation records must be current (last inspection within 90 days) for all preserved equipment in the system
- MC achievement date triggers the start of commissioning activities and may trigger contractual milestones

---

## Trigger / Invocation

```
/manage-mechanical-completion
```

### Natural Language Triggers
- "What is the MC status for System 310?"
- "Show me all systems ready for MC walkdown"
- "Generate the MC readiness report"
- "Cual es el estado de completamiento mecanico del Sistema 310?"
- "Mostrar sistemas listos para walkdown de MC"
- "Generar reporte de preparacion para completamiento mecanico"

### Command Triggers
- `manage-mechanical-completion status --system [system-id|all] --view [summary|detail|readiness]`
- `manage-mechanical-completion walkdown --system [system-id] --action [schedule|execute|report]`
- `manage-mechanical-completion punchlist --system [system-id] --category [A|B|C|all] --view [open|overdue|trend]`
- `manage-mechanical-completion stp --system [system-id] --action [compile|status|review]`
- `manage-mechanical-completion certificate --system [system-id] --action [draft|submit|approve]`

### Automatic Triggers

| Trigger Condition | Action | Priority |
|-------------------|--------|----------|
| System construction progress reaches 90% | Initiate MC readiness assessment | High |
| MC target date T-30 days | Generate detailed MC readiness gap report | Critical |
| All Category A punch-list items closed for a system | Notify that MC gate is cleared for walkdown scheduling | High |
| MC walkdown completed | Generate walkdown report and update punch list | High |
| STP compilation reaches 100% document completeness | Notify MC coordinator that documentation gate is cleared | High |
| MC certificate signed | Update progressive handover tracker; notify commissioning team | Critical |

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| System Breakdown Structure | Engineering / Commissioning | .xlsx | System/subsystem hierarchy with boundaries, equipment lists, and commissioning priorities |
| Construction Progress by System | track-construction-progress | .xlsx | Physical progress percentage per system across all disciplines |
| Quality Records | manage-field-quality | .xlsx / .pdf | ITP completion status, NCR closure status, test certificates, NDE results per system |
| Punch-List Register | manage-field-quality / verify-construction-quality | .xlsx | All punch-list items classified A/B/C with status per system |
| Preservation Records | manage-equipment-preservation | .xlsx | Equipment preservation status and last inspection dates per system |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| Commissioning Priority Sequence | Operations / Commissioning | .xlsx | MC sequence follows construction completion order |
| Contractual MC Definitions | Contracts & Compliance | .pdf | Standard NORSOK Z-007/AACE RP 96R-18 MC criteria applied |
| Equipment Vendor Data Packages | Procurement / Doc Control | .pdf | Flagged as incomplete in STP; MC may be conditional |
| Previous Project MC Data | VSC Knowledge Base | .xlsx | Industry benchmark MC duration and punch-list rates applied |

### Context Enrichment

The agent will automatically:
- Map system boundaries to construction progress data for system-level completion tracking
- Generate MC readiness checklists per system type (rotating equipment, static equipment, electrical, instrumentation, civil/structural)
- Retrieve standard MC certification criteria from NORSOK Z-007 and AACE RP 96R-18
- Calculate STP document completeness percentage from quality record database
- Cross-reference punch-list items with system boundaries for per-system categorization
- Pull preservation status from equipment preservation tracking for preservation verification
- Identify MC-critical items on the construction schedule critical path

---

## Output Specification

### Filename Format
`{ProjectCode}_MC_Status_{SystemID}_{YYYYMMDD}.xlsx`

### Structure

1. **MC Dashboard** -- Overview of all systems showing: total systems, systems with MC achieved, systems in walkdown, systems in preparation, systems not started. S-curve of planned vs. actual MC achievements over time. Traffic-light readiness status per system.

2. **System Readiness Matrix** -- Per-system multi-dimensional readiness assessment across: construction completion (%), ITP completion (%), NCR closure (%), punch-list A items (count), punch-list B items (count), STP completeness (%), preservation status (current/overdue), and overall MC readiness score.

3. **Walkdown Schedule and Results** -- Walkdown plan for upcoming 4 weeks with team assignments, area/system scope, and preparation status. Completed walkdown results with findings summary, photos, and punch-list items generated.

4. **Punch-List Management** -- System-level punch-list summary: Category A (open/closed/total), Category B (open/closed/total), Category C (open/closed/total). Trend chart showing punch-list creation rate vs. closure rate. Aging analysis for open items. Contractor responsibility breakdown.

5. **STP Compilation Status** -- Per-system document checklist showing: required documents, received documents, accepted documents, outstanding documents, and percentage completeness. Gap list with responsible party and expected receipt date.

6. **MC Certificate Register** -- Register of all MC certificates: system ID, certificate number, submission date, approval status, signatories, effective date, conditions (if any), and associated STP reference.

### Key Metrics Table

| Metric | Unit | Calculation | Target |
|--------|------|-------------|--------|
| MC Achievement Rate | % | Systems with MC achieved / Total systems | Per baseline schedule |
| Category A Closure Rate | % | Cat A items closed / Cat A items opened (per system) | 100% before MC |
| STP Document Completeness | % | Accepted documents / Required documents per system | 100% at MC |
| MC Walkdown Coverage | % | Systems walked down / Systems eligible for walkdown | 100% before MC certificate |
| MC Cycle Time | Days | Time from MC readiness assessment to MC certificate issuance | < 14 days |

---

## Procedure

### Step 1: Define System Boundaries and MC Criteria

1. Obtain the approved system breakdown structure from engineering/commissioning defining all systems and subsystems with their functional scope and physical boundaries
2. For each system, generate the equipment list (all tags within the system boundary across all disciplines: mechanical, piping, electrical, instrumentation, civil, structural)
3. Create system-specific MC checklists based on system type: rotating equipment systems, static equipment systems, electrical distribution systems, instrumentation/control systems, civil/structural systems
4. Define the STP document requirements per system: which quality records, test certificates, vendor data packages, and as-built drawings are required
5. Agree system boundaries and MC criteria with the commissioning team to ensure alignment with commissioning and turnover priorities
6. Map system boundaries onto the construction schedule to enable system-level progress tracking (in coordination with track-construction-progress)
7. Establish the MC sequence priority aligned with the commissioning sequence: utility systems first, then process systems, then ancillary systems

### Step 2: Track System-Level Construction Completion

1. Convert discipline-level and area-level construction progress into system-level progress using the system-to-WBS mapping
2. Track completion of each discipline within each system: civil foundation complete, structural steel erected, equipment set, piping installed and tested, electrical installed and tested, instrumentation installed and loop-checked
3. Identify the lagging discipline per system (the discipline holding back MC readiness) and escalate for resource focus
4. Monitor ITP completion status per system: percentage of inspection points completed, any hold points outstanding, any failed inspections requiring re-work
5. Track NCR closure status per system: all NCRs within the system boundary must be closed or formally accepted before MC
6. Verify NDE acceptance for all welds within the system per applicable code (ASME B31.3, AWS D1.1)
7. Generate weekly MC readiness assessment per system at system progress >85%

### Step 3: Conduct MC Walkdowns

1. Schedule MC walkdowns when system construction progress exceeds 95% and all ITP hold points are completed
2. Assemble walkdown team: construction superintendent, commissioning engineer, operations representative, HSE advisor, quality inspector (minimum composition)
3. Brief the walkdown team on system design intent, equipment within the boundary, safety considerations, and specific items to verify
4. Execute systematic walkdown following predefined route covering all equipment, piping, electrical, instrumentation, structural, and civil elements within the system
5. Document all findings with: unique punch-list ID, description, location (tag/area/elevation), category (A/B/C), photo evidence, and recommended corrective action
6. Conduct post-walkdown debrief: confirm findings classification, assign responsible contractors, set due dates aligned with MC target
7. Issue formal walkdown report within 48 hours of walkdown completion

### Step 4: Drive Punch-List Resolution and Compile STP

1. Track Category A punch-list items daily: these are the absolute gate to MC and must be the highest priority for the construction team
2. Escalate any Category A item that has been open for more than 7 days without an approved resolution plan to the Construction Manager
3. Track Category B items on a weekly cycle: these must be resolved before RFSU but should be progressed concurrently to reduce post-MC burden
4. Compile the System Turnover Package (STP) concurrently with construction: collect test certificates, material certificates, NDE results, ITP sign-offs, and vendor data as work completes (not at the end)
5. Conduct STP completeness reviews at system progress milestones: 80%, 90%, 95%, and pre-MC
6. Verify preservation status for all preserved equipment in the system: preservation records current, no preservation failures, de-preservation plan ready for commissioning
7. Validate that all as-built drawings for the system are received or at minimum submitted for review (preliminary as-builts acceptable at MC; final as-builts required at PC)

### Step 5: Issue MC Certificate and Transfer to Commissioning

1. Conduct final pre-MC verification: Category A items = zero, STP completeness = 100%, preservation status = current, all ITPs complete, all NCRs closed
2. Prepare MC certificate package: certificate document, STP table of contents with document references, punch-list extract (Category B/C outstanding), and conditions of MC (if any)
3. Route MC certificate for approval: Construction Manager signature first, then Commissioning Manager review and counter-signature
4. If any signatory raises objections: document specific deficiencies, return to Step 4 for remediation, and re-submit when addressed
5. Upon MC certificate approval: update progressive handover tracker, notify commissioning team that system is available for commissioning activities, trigger warranty clock for relevant equipment (if contractually tied to MC)
6. Transfer system care, custody, and control per agreed CCC protocol (CCC may transfer at MC or at RFSU depending on project conventions)
7. Archive complete MC package (certificate + STP + walkdown reports + punch-list records) in the document management system with permanent retention

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|---------------------|
| Premature MC certification with unresolved defects | Schedule pressure to show milestone achievement | Enforce absolute Category A gate; independent QA verification before certificate routing |
| STP incomplete at MC | Quality records not collected concurrent with construction | Real-time STP compilation; document completeness reviews at 80%, 90%, 95% progress |
| System boundaries misaligned with commissioning | Systems defined by construction convenience, not commissioning function | Joint construction-commissioning-operations boundary definition workshop at project start |
| Walkdown team inadequate or unavailable | Operations/commissioning personnel not mobilized during construction | Walkdown scheduling coordinated 30 days in advance; minimum team composition enforced |
| Punch-list overwhelms closure capacity near MC | Deficiencies deferred during construction rather than fixed immediately | Weekly punch-list tracking from 80% completion; "fix-as-you-go" policy enforced |
| Preservation failures discovered at MC | Preservation program not monitored throughout construction | Monthly preservation inspection cycle; preservation status as MC readiness criterion |
| MC certificates issued but commissioning not ready | MC tracking disconnected from commissioning readiness | Commissioning Manager co-signs MC certificate; RFSU readiness check at MC |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|-----------------|
| Category A item open >7 days without approved resolution plan | Day 7 | Construction Manager -> Contractor management -> Resource assignment required |
| MC target date T-14 days with Category A items still open | Immediately | Construction Manager + Commissioning Manager -> Recovery plan or MC deferral decision |
| STP completeness <80% with MC target in <14 days | Immediately | Quality Manager -> Construction Manager -> Document recovery plan |
| MC walkdown team member unavailable at scheduled date | 5 days before walkdown | MC Coordinator -> Department managers -> Substitute assignment |
| MC certificate rejected by signatory | Within 24 hours of rejection | MC Coordinator -> Rejection remediation plan -> Re-submission within 5 days |
| Preservation failure affecting >3 equipment items in a system | Within 48 hours | Asset Management + Construction Manager -> Preservation remediation program |
| MC achievement rate falling behind baseline by >2 systems | End of reporting week | Construction Manager -> Project Director -> MC acceleration workshop |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | MC certificates accurately reflect system completion status; STP records are valid | Independent QA audit of MC packages |
| Completeness | 25% | 100% of systems tracked; 100% of STP documents collected; all punch items captured | System coverage and document completeness audit |
| Consistency | 15% | MC criteria applied uniformly across all systems; punch-list classification consistent | Cross-system MC criteria calibration review |
| Format | 10% | Professional certificates, organized STPs, clear readiness matrices | Visual QA review |
| Actionability | 10% | MC readiness reports identify specific gaps with responsible parties and deadlines | Gap-to-action traceability audit |
| Timeliness | 10% | MC certificates issued within 14 days of readiness; walkdown reports within 48 hours | Timestamp audit on MC lifecycle |

---

## Inter-Agent Dependencies

### Inputs From

| Agent | Data Required | Frequency | Criticality |
|-------|-------------|-----------|-------------|
| track-construction-progress | System-level construction progress percentages | Weekly | Critical |
| manage-field-quality | ITP completion, NCR closure, test certificates, NDE results per system | Weekly | Critical |
| Operations (Commissioning) | Commissioning priorities, system sequence, RFSU readiness requirements | At project start + updates | Critical |
| manage-equipment-preservation (Asset Mgmt) | Preservation status and records per equipment tag | Monthly | High |
| Engineering (via Doc Control) | As-built drawings, vendor data packages | As issued | High |

### Outputs Consumed By

| Consumer Agent | Data Provided | Frequency | Usage |
|----------------|-------------|-----------|-------|
| Operations (Commissioning) | MC certificates, STPs, system availability for commissioning | At each MC achievement | Commissioning start authorization |
| Orchestrator | MC status dashboard, achievement rate, readiness forecasts | Weekly | Management reporting, OR gate reviews |
| Execution (Schedule) | MC achievement dates for schedule updates; forecasted MC dates | Weekly | Schedule update and milestone tracking |
| track-progressive-handover | MC milestone status per system | At each MC achievement | Progressive handover tracker update |
| certify-system-readiness | MC certificate as prerequisite for TCCC | At each MC achievement | TCCC preparation |

---

## References

- **NORSOK Z-007**: Mechanical Completion and Commissioning -- Norwegian standard defining MC criteria and certification process
- **AACE RP 96R-18**: Commissioning and Startup Planning -- MC as foundation for commissioning readiness
- **ISO 55001:2014**: Asset Management -- system handover and documentation requirements at MC
- **CII RT-171**: Planning for Startup -- MC best practices from Construction Industry Institute
- **COAA Best Practice**: Construction Owners Association of Alberta -- MC walkdown and STP compilation standards
- **NCh-ISO 19650**: Chilean adoption of information management standards -- documentation requirements at MC

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR Team | Initial creation -- Wave 3 |
