---
name: manage-loop-checking
description: "Manage instrument loop checking and verification during commissioning. Triggers: 'loop checking', 'instrument verification', 'verificacion de lazos'."
---

# Manage Loop Checking and Alarm Rationalization

## Skill ID: R-03
## Version: 1.0.0
## Category: R. Commissioning Intelligence
## Priority: P1 - High

---

## Purpose

Manage the systematic execution of loop checking activities and alarm rationalization during the commissioning phase of capital projects, ensuring that every instrument loop is verified end-to-end and that the alarm system is rationalized per ISA-18.2/IEC 62682 before process introduction. This skill coordinates the generation, tracking, and completion of loop check packages while simultaneously rationalizing the alarm database to prevent alarm floods during initial startup and steady-state operations.

The need for this skill is acute and well-documented. Industry data reveals that 50% of process plant alarms during startup are nuisance alarms -- alarms that annunciate but require no operator action, or that are configured at incorrect setpoints for startup conditions (Pain Point CE-05, EEMUA Publication 191 / ISA-18.2). During the critical first hours and days of plant startup, operators face alarm rates of 10-50 alarms per 10 minutes, far exceeding the manageable rate of 1-2 alarms per 10 minutes recommended by EEMUA 191. This alarm flood overwhelms operators, masks genuine safety alarms behind a wall of nuisance alerts, degrades situational awareness, and directly contributes to startup incidents.

The root causes of alarm floods during startup are systemic:
- **Alarms configured for steady-state operation** are activated during transient startup conditions, generating hundreds of expected-but-nuisance alarms as process variables traverse from ambient to operating conditions.
- **No startup-specific alarm shelving strategy** exists, so operators either acknowledge alarms reflexively (defeating the purpose of alarming) or disable alarms indiscriminately (creating safety blind spots).
- **Loop checking is disconnected from alarm rationalization.** Loop checks verify that instruments read and transmit correctly, but do not verify that the associated alarms are configured correctly, have appropriate setpoints, and are classified per a rationalized priority scheme.
- **Incomplete loop checking** leaves instruments untested or partially tested, resulting in false readings, stuck signals, or communication failures that generate spurious alarms during startup.
- **No integrated tracking** of loop check status and alarm rationalization status, making it impossible to determine commissioning readiness from an instrumentation perspective.

The consequences are severe. The Buncefield incident (2005, UK) was contributed to by failed level instrumentation and alarm management failures. The CSB investigation of the BP Texas City explosion (2005) identified inadequate alarm management during startup as a contributing factor. ASM Consortium research estimates that effective alarm management reduces operator error during abnormal situations by 30-50%.

This skill integrates loop checking execution management with alarm rationalization to produce a commissioning-ready instrumentation and alarm system, verified end-to-end, classified per ISA-18.2, and configured with a startup-specific alarm management strategy.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | R-03                                                                                        |
| **Agent**              | Agent 8 -- Commissioning Intelligence                                                        |
| **Domain**             | Commissioning Intelligence                                                                   |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Setup: 5-10 days; Execution: 4-16 weeks (depends on loop count)                              |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | CE-05: 50% of alarms during startup are nuisance alarms (EEMUA 191, ISA-18.2)            |
| **Secondary Pain**     | CE-04: 30-40% of startup incidents trace to incomplete pre-startup verification (CCPS)       |
| **Value Created**      | Reduce alarm flood incidents by 70-80%; reduce startup duration by 15-25%; zero missed safety alarms |

### Functional Intent

This skill SHALL:

1. **Generate Loop Check Packages**: Automatically generate loop check sheets from instrument index/IO lists, including expected signal ranges, termination details, calibration requirements, and acceptance criteria for each loop type (analog input, analog output, digital input, digital output, serial/fieldbus).

2. **Track Loop Check Execution**: Maintain a real-time loop check tracker showing completion status per system, per area, per loop type, with RAG dashboard and trend analysis toward commissioning milestones.

3. **Rationalize Alarm Database**: Apply ISA-18.2 / IEC 62682 alarm rationalization methodology to the alarm database, classifying each alarm by priority (Critical, High, Medium, Low, Diagnostic), verifying setpoints against process design, and documenting the rationalization basis.

4. **Develop Startup Alarm Strategy**: Create a startup-specific alarm shelving plan that defines which alarms to suppress during each startup phase, which alarms must remain active at all times (safety-critical), and the conditions under which suppressed alarms are automatically re-enabled.

5. **Integrate Loop Check and Alarm Status**: Provide a unified view of instrumentation commissioning readiness that combines loop check completion, alarm rationalization status, and safety instrumented system (SIS) verification into a single readiness metric.

6. **Generate Commissioning Certificates**: Produce loop check completion certificates per system/subsystem that serve as formal evidence for PSSR package (DOC-04) and regulatory compliance.

---

## Trigger / Invocation

### Direct Invocation

```
/manage-loop-checking --project [name] --action [generate|track|rationalize|startup-strategy|report]
```

### Command Variants
- `/manage-loop-checking generate --project [name] --system [system_code]` -- Generate loop check packages
- `/manage-loop-checking track --project [name]` -- Show current loop check status dashboard
- `/manage-loop-checking rationalize --project [name] --system [system_code]` -- Execute alarm rationalization
- `/manage-loop-checking startup-strategy --project [name]` -- Generate startup alarm shelving plan
- `/manage-loop-checking report --project [name] --format [xlsx|pdf|dashboard]` -- Generate status report
- `/manage-loop-checking certificate --project [name] --system [system_code]` -- Generate completion certificate

### Aliases
- `/loop-check`, `/loop-checking`, `/alarm-rationalization`, `/alarm-management`

### Contextual Triggers
- Instrument index / IO list is published or updated
- Commissioning phase begins for a system
- System approaching PSSR readiness (T-30 days triggers alarm rationalization push)
- Alarm database export received from DCS/PLC vendor
- Commissioning manager requests instrumentation readiness assessment
- Agent 8 detects instrumentation gaps during commissioning sequence modeling (R-01)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `instrument_index` | .xlsx / .csv | Engineering / mcp-sharepoint | Complete instrument index listing all instrument tags, types, service descriptions, ranges, P&ID references, and IO assignments |
| `io_list` | .xlsx | DCS/PLC vendor / mcp-sharepoint | Input/Output list mapping instrument tags to controller modules, channels, signal types, and communication protocols |
| `alarm_database` | .xlsx / .csv | DCS/PLC vendor | Current alarm configuration database with tag names, alarm types (HH/H/L/LL/DEV/ROC), setpoints, priorities, and enable/disable status |
| `process_design_basis` | .docx / .xlsx | Process engineering | Process design conditions including normal operating ranges, startup conditions, shutdown conditions, and safety limits for all process variables |
| `project_code` | text | User | Project identifier for file naming and database organization |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `cause_and_effect_matrix` | .xlsx | Engineering | C&E matrix defining safety interlock logic and alarm-to-action relationships |
| `sif_verification_records` | .xlsx | SIS vendor | Safety Instrumented Function test records for SIL-rated loops |
| `cable_schedule` | .xlsx | Electrical engineering | Cable routing and termination details for physical loop verification |
| `vendor_calibration_data` | .pdf / .xlsx | Instrument vendors | Factory calibration certificates for instruments |
| `previous_loop_checks` | .xlsx | Prior project phase | Partial loop check results from earlier commissioning phases |
| `operator_alarm_feedback` | .docx / survey | Operations | Operator input on alarm usefulness from similar facilities |
| `p_and_id_set` | .pdf | Engineering | Current P&IDs for cross-reference during loop verification |

### Input Validation Rules

```yaml
validation:
  instrument_index:
    required_columns: ["tag_number", "instrument_type", "service", "range_min", "range_max", "engineering_unit", "pid_reference", "io_type"]
    min_records: 50
    tag_format_regex: "^[A-Z]{2,4}-\\d{2,5}[A-Z]?$"
  io_list:
    required_columns: ["tag_number", "controller", "module", "channel", "signal_type", "range"]
    must_match: "instrument_index.tag_number"
  alarm_database:
    required_columns: ["tag_name", "alarm_type", "setpoint", "priority", "enabled"]
    priority_values: ["Critical", "High", "Medium", "Low", "Diagnostic", "Journal"]
  process_design_basis:
    must_include: ["normal_operating_range", "startup_range", "safety_limits"]
```

---

## Output Specification

### Deliverable 1: Loop Check Packages (.xlsx per system)

**Filename**: `{ProjectCode}_LoopCheck_{SystemCode}_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet: "Loop Check Summary"
| Loop Tag | Type | Description | P&ID | IO Type | Status | Checked By | Date | Certificate |
|----------|------|-------------|------|---------|--------|-----------|------|-------------|
| FT-10001 | Flow Transmitter | SAG Mill Feed Flow | 100-001 | AI | PASS | J. Lopez | 2026-03-15 | LC-100-001 |
| LT-10005 | Level Transmitter | Sump Level | 100-003 | AI | FAIL | M. Silva | 2026-03-16 | -- |

#### Sheet: "Loop Check Sheets" (one per loop)
Individual loop check sheet containing:
- Loop identification (tag, description, P&ID, location)
- Instrument specifications (type, range, signal, manufacturer, model)
- Termination details (field junction box, marshalling cabinet, controller I/O)
- Test procedure (step-by-step verification for loop type)
- Acceptance criteria (accuracy, response time, signal quality)
- Test results (measured values, pass/fail, deviations)
- Signatures (checker, witness, approver)

### Deliverable 2: Alarm Rationalization Register (.xlsx)

**Filename**: `{ProjectCode}_Alarm_Rationalization_{Version}_{YYYYMMDD}.xlsx`

#### Sheet: "Alarm Master Register"
| Tag | Alarm Type | Description | Setpoint | EU | Priority | Consequence of Deviation | Operator Response | Response Time | Classification | Rationalized | Notes |
|-----|-----------|-------------|----------|----|----------|-------------------------|-------------------|---------------|---------------|-------------|-------|
| FT-10001 | HH | SAG Feed Flow Very High | 850 | m3/h | High | Mill overload, potential liner damage | Reduce feed rate, verify scalping screen | 5 min | Safety | Yes | Per HAZOP Rec #12 |
| FT-10001 | H | SAG Feed Flow High | 780 | m3/h | Medium | Approaching capacity limit | Monitor trend, prepare to reduce feed | 15 min | Operational | Yes | |
| FT-10001 | L | SAG Feed Flow Low | 400 | m3/h | Medium | Underloading, inefficient grinding | Check feed conveyor, investigate blockage | 15 min | Operational | Yes | |
| FT-10001 | LL | SAG Feed Flow Very Low | 200 | m3/h | High | Mill running empty risk, liner damage | Stop mill feed, initiate controlled shutdown | 3 min | Safety | Yes | Linked to SIF-100-003 |

#### Sheet: "Alarm Statistics Summary"
| Metric | Before Rationalization | After Rationalization | Target (EEMUA 191) |
|--------|----------------------|----------------------|-------------------|
| Total Configured Alarms | 4,250 | 2,180 | -- |
| Alarms Removed (no value) | -- | 1,420 (33.4%) | >30% typical |
| Alarms Reclassified | -- | 650 (15.3%) | -- |
| Critical Priority | 180 (4.2%) | 95 (4.4%) | <5% |
| High Priority | 680 (16.0%) | 420 (19.3%) | <15% |
| Medium Priority | 1,850 (43.5%) | 1,100 (50.5%) | ~50% |
| Low Priority | 1,540 (36.2%) | 565 (25.9%) | ~30% |

### Deliverable 3: Startup Alarm Shelving Plan (.xlsx + .docx)

**Filename**: `{ProjectCode}_Startup_Alarm_Plan_v{Version}_{YYYYMMDD}.xlsx`

Defines alarm state transitions through startup phases:

| Tag | Alarm | Startup Phase 1 (Cold Commissioning) | Phase 2 (Hot Startup) | Phase 3 (Feed Introduction) | Phase 4 (Ramp-Up) | Phase 5 (Steady State) |
|-----|-------|--------------------------------------|----------------------|---------------------------|-------------------|----------------------|
| FT-10001 HH | Feed Flow VH | SHELVED | SHELVED | ACTIVE | ACTIVE | ACTIVE |
| FT-10001 LL | Feed Flow VL | SHELVED | ACTIVE | ACTIVE | ACTIVE | ACTIVE |
| TT-10012 HH | Bearing Temp VH | ACTIVE | ACTIVE | ACTIVE | ACTIVE | ACTIVE |
| PT-10008 H | Discharge Press H | SHELVED | SHELVED | SHELVED | ACTIVE | ACTIVE |

### Deliverable 4: Loop Check Completion Dashboard (Power BI / Airtable)

**Dashboard Components:**
- Overall loop check completion gauge (% complete with target overlay)
- Completion by system (horizontal bar chart with RAG coding)
- Completion by loop type (AI, AO, DI, DO, Serial)
- Daily/weekly completion trend (line chart with forecast to completion)
- Failed loop punch list (table with priority and resolution status)
- Alarm rationalization progress (% rationalized by system)
- Commissioning readiness scorecard (loop checks + alarms + SIS = overall readiness)

### Deliverable 5: Loop Check Completion Certificates (.pdf)

**Filename**: `{ProjectCode}_LoopCheck_Certificate_{SystemCode}_{YYYYMMDD}.pdf`

Formal certificate stating:
- System identification and boundaries
- Total loops checked and results (pass/fail/deferred)
- Failed loops: punch list reference and resolution plan
- Alarm rationalization status for the system
- Statement of commissioning readiness (instrumentation perspective)
- Signatures: Commissioning Lead, I&C Supervisor, Operations Representative

---

## Methodology & Standards

### Loop Checking Methodology

#### Loop Types and Test Procedures

| Loop Type | Test Method | Acceptance Criteria |
|-----------|------------|-------------------|
| Analog Input (4-20mA) | Inject calibrated signal at sensor; verify reading at DCS within +/-0.5% of span | Signal accurate, trend displays correctly, alarm setpoints trigger at correct values |
| Analog Output (4-20mA) | Command output from DCS; verify at field device (valve position, VSD speed) within +/-1% | Control element responds correctly, feedback signal matches command |
| Digital Input (24VDC) | Simulate field device state change; verify state at DCS within 1 second | Correct state displayed, SOE timestamp accurate |
| Digital Output (24VDC) | Command output from DCS; verify at field device (solenoid, motor start) | Device operates correctly, feedback confirms actuation |
| HART | Verify HART communication, read device configuration, verify diagnostics | All HART parameters readable, device health OK |
| Fieldbus (FF/Profibus) | Verify bus communication, check device status, validate block configuration | Device online, all function blocks executing, diagnostics clear |
| Safety (SIL-rated) | Full SIF test per IEC 61511; verify logic solver, sensor, and final element | SIF operates within specified SIL requirements; documented per SIL verification plan |

#### Loop Check Execution Sequence

1. **Pre-check verification**: Confirm power available, wiring terminated, cable continuity tested
2. **Signal injection**: Apply known input at the field instrument
3. **Signal path verification**: Verify signal at each junction point (JB, marshalling, IO card)
4. **DCS display verification**: Confirm correct reading on operator display
5. **Alarm verification**: Confirm alarms trigger at correct setpoints with correct priority
6. **Control loop verification** (if applicable): Verify PID response in manual mode
7. **Documentation**: Record all test results, sign off, update tracker

### Alarm Rationalization Methodology (ISA-18.2 / IEC 62682)

#### ISA-18.2 Alarm Lifecycle

The skill follows the complete ISA-18.2 alarm lifecycle:

1. **Philosophy**: Establish alarm management philosophy document (principles, goals, metrics)
2. **Identification**: Identify all potential alarm points from P&IDs, HAZOP, C&E matrices
3. **Rationalization**: Systematic review of each alarm against criteria:
   - What is the abnormal condition?
   - What is the consequence if no action is taken?
   - What is the operator action required?
   - What is the available response time?
   - Is this alarm unique or duplicated?
   - Is the setpoint appropriate for the process condition?
4. **Design**: Configure alarms per rationalized requirements (setpoints, priorities, deadbands)
5. **Implementation**: Deploy alarm configuration to DCS/PLC
6. **Operation**: Monitor alarm system performance per EEMUA 191 KPIs
7. **Maintenance**: Ongoing rationalization, bad actor alarm elimination

#### Alarm Priority Classification (per ISA-18.2)

| Priority | Consequence of Missing Alarm | Operator Response Time | Maximum Alarm Rate Contribution |
|----------|----------------------------|----------------------|-------------------------------|
| Critical | Potential fatality, major environmental release, or catastrophic equipment damage | < 5 minutes | < 5% of total alarms |
| High | Potential injury, significant environmental release, or major equipment damage | 5-15 minutes | < 15% of total alarms |
| Medium | Minor injury potential, production impact, or moderate equipment damage | 15-60 minutes | ~ 50% of total alarms |
| Low | No immediate safety impact, minor production or quality impact | > 60 minutes | ~ 30% of total alarms |
| Diagnostic | Equipment health monitoring, no operator action required | Information only | Separate from alarm system (journal) |

#### EEMUA 191 Performance Benchmarks

| Metric | Overloaded | Reactive | Stable | Robust | Target |
|--------|-----------|----------|--------|--------|--------|
| Alarms per operator per 10 min (average) | >10 | 5-10 | 1-5 | <1 | <1 |
| Alarms per operator per 10 min (peak) | >100 | 50-100 | 10-50 | <10 | <10 |
| % time with alarm rate >10/10min | >30% | 10-30% | 1-10% | <1% | <1% |
| Standing alarms | >100 | 50-100 | 10-50 | <10 | <10 |
| Stale alarms (>24h standing) | >50 | 20-50 | 5-20 | <5 | 0 |
| Chattering alarms | >20 | 10-20 | 2-10 | 0 | 0 |
| Alarm floods (>10 alarms/10min) | Daily | Weekly | Monthly | Rare | Rare |

### Applicable Standards

- **ISA-18.2-2016** -- Management of Alarm Systems for the Process Industries
- **IEC 62682:2014** -- Management of alarm systems for the process industries (ISO adoption of ISA-18.2)
- **EEMUA Publication 191** -- Alarm Systems: A Guide to Design, Management and Procurement (3rd Ed.)
- **IEC 61511** -- Functional safety: Safety instrumented systems for the process industry (SIS loop testing)
- **ISA-5.1** -- Instrumentation Symbols and Identification
- **IEC 61131-3** -- Programmable controllers Part 3: Programming languages
- **ISO 14224** -- Petroleum, petrochemical and natural gas industries: Collection and exchange of reliability and maintenance data
- **API RP 554** -- Process Control Systems Functions and Functional Specification Development
- **NAMUR NE 107** -- Self-monitoring and diagnosis of field devices

### Industry Statistics

| Statistic | Source | Year |
|-----------|--------|------|
| 50% of alarms during startup are nuisance alarms | EEMUA / ISA-18.2 | 2020 |
| Operators respond to only 1 in 5 alarms during alarm floods | ASM Consortium | 2019 |
| 30-50% reduction in operator error from effective alarm management | ASM Consortium | 2020 |
| Average alarm count reduced 50-70% through rationalization | Honeywell/Emerson benchmark data | 2022 |
| 76% of plants have not completed formal alarm rationalization | PAS Global Alarm Metrics Report | 2021 |
| Alarm flood contribution to 23% of major process incidents | HSE UK, Investigation data | 2018 |
| Average cost of alarm rationalization: $200-500 per alarm point | Industry benchmarks | 2023 |
| ROI of alarm management program: 5-10x within 2 years | ISA-18.2 committee data | 2020 |

---

## Step-by-Step Execution

### Phase 1: Setup and Data Preparation (Steps 1-4)
**Step 1: Ingest and Validate Instrument Index and IO List**
### Phase 2: Loop Check Execution Management (Steps 5-8)
**Step 5: Coordinate Loop Check Execution Scheduling**
### Phase 3: Alarm Rationalization (Steps 9-12)
**Step 9: Conduct Alarm Rationalization Workshops**
### Phase 4: Integration and Certification (Steps 13-16)
**Step 13: Generate Integrated Instrumentation Readiness Assessment**

See [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md) for complete detailed execution steps.

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Loop Check Coverage | Loops tested / Total loops in scope | 100% | >98% (deferred items documented) |
| Loop Check Pass Rate | Passed loops / Tested loops | >95% | >90% |
| Failed Loop Resolution Time | Average days from fail to re-test pass | <5 days | <10 days |
| SIS Loop Verification | SIL loops fully verified / Total SIL loops | 100% | 100% (non-negotiable) |
| Alarm Rationalization Coverage | Alarms rationalized / Total alarms | 100% | >95% |
| Alarm Reduction | Alarms removed or reclassified / Original alarm count | >30% | >20% |
| Nuisance Alarm Elimination | Nuisance alarms identified and addressed | >90% | >80% |
| Startup Alarm Plan Coverage | Process alarms with startup phase assignment | 100% | >95% |
| Alarm Rate Post-Startup | Average alarms per operator per 10 min (first 30 days) | <5 | <10 |
| Standing Alarms Post-Startup | Standing alarms after 30 days operation | <10 | <25 |
| Data Accuracy | Instrument index to IO list match | 100% | >99% |
| Certificate Completeness | Systems with formal completion certificates | 100% of commissioned systems | >95% |
| Documentation Quality | Alarm rationalization basis documented per alarm | 100% | >95% |
| Tracker Currency | Dashboard data age | <24 hours | <48 hours |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `model-commissioning-sequence` (R-01) | Commissioning schedule and system sequence for loop check planning | Critical |
| `track-punchlist-items` (R-02) | Punch list tracking system for failed loop items | High |
| `manage-vendor-documentation` (DOC-01) | Vendor instrument data sheets and calibration certificates | High |
| `create-commissioning-plan` | Overall commissioning plan including I&C commissioning scope | High |
| Engineering deliverables (via mcp-sharepoint) | Instrument index, IO list, alarm database, P&IDs, C&E matrix | Critical |
| DCS/PLC vendor | Alarm database export, controller configuration, SIS test records | Critical |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `prepare-pssr-package` (DOC-04) | Loop check certificates, alarm rationalization register, SIS verification summary | When system reaches PSSR readiness |
| `track-or-deliverables` (H-02) | Loop check and alarm rationalization completion metrics for OR tracking | Weekly status update |
| `generate-operating-procedures` (DOC-02) | Alarm response procedures generated from rationalization (operator response column) | After rationalization complete |
| `create-training-plan` | Alarm management training requirements for operators | After startup alarm plan developed |
| `agent-operations` | Startup alarm shelving plan for operator awareness and training | Before initial startup |
| `agent-hse` | Safety alarm classification and SIS verification results | For safety dossier |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `orchestrate-or-program` (H-01) | Status reporting | Loop check and alarm status feeds into overall OR readiness |
| `benchmark-maintenance-kpis` (MAINT-04) | Alarm KPIs | Post-startup alarm performance feeds into KPI benchmarking |
| `map-regulatory-requirements` (COMP-01) | Regulatory mapping | Ensures alarm management meets regulatory requirements |

---

## Alarm Rationalization Workshop
## System: {SystemCode} - {SystemDescription}
## Date: {Date}  |  Duration: {Hours} hours

### Attendees
| Name | Role | Signature |
|------|------|-----------|
| {Name} | Operations Representative | |
| {Name} | Process Engineer | |
| {Name} | Instrument Engineer | |
| {Name} | HSE Representative | |

### Material
- Alarm database extract for {SystemCode} ({AlarmCount} alarms)
- P&IDs: {PIDList}
- Process Design Basis (relevant sections)
- HAZOP Study: {HAZOPRef} (relevant nodes)
- ISA-18.2 priority classification criteria

### Process
For each alarm, determine:
1. Valid alarm? (Y/N) -- Does it require operator action?
2. Consequence (Safety/Environmental/Production/Equipment)
3. Priority (Critical/High/Medium/Low/Diagnostic)
4. Operator response (specific action in < 20 words)
5. Response time (minutes)
6. Setpoint verification (correct per design basis?)
7. Deadband (sufficient to prevent chattering?)

### Target
- {AlarmCount} alarms to rationalize
- Expected removal rate: 30-50%
- Estimated pace: 100-150 alarms per 8-hour session
```

### Reference Documents
- ISA-18.2-2016 -- Management of Alarm Systems for the Process Industries
- IEC 62682:2014 -- Management of alarm systems for the process industries
- EEMUA Publication 191 (3rd Edition) -- Alarm Systems: A Guide to Design, Management and Procurement
- IEC 61511-1 -- Functional Safety: Safety Instrumented Systems
- API RP 554 -- Process Control Systems Functions and Functional Specification Development
- CCPS "Guidelines for Safe Automation of Chemical Processes" (2nd Edition)
- ASM Consortium "Effective Alarm Management Practices" (2009)
- PAS Global "State of Alarm Management" annual report
- NAMUR NE 107 -- Self-monitoring and diagnosis of field devices

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
