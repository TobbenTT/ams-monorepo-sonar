---
name: model-commissioning-sequence
description: "Model and optimize commissioning system sequences. Triggers: 'commissioning sequence', 'system turnover sequence', 'secuencia de comisionamiento'."
---

# Model Commissioning Sequence

## Skill ID: R-01
## Version: 1.0.0
## Category: R. Commissioning Intelligence
## Priority: P1 - High

---

## Purpose

Model the optimal commissioning sequence from construction completion through pre-commissioning, commissioning, and operational acceptance for capital projects, ensuring that System Turnover Packages (STPs), Inspection Test Plan Sheets (ITPS), and commissioning dependencies are correctly sequenced to minimize schedule risk and prevent startup failures. This skill produces a logic-driven commissioning sequence model that maps every system from mechanical completion (MC) through to sustained commercial operation, identifying the critical path, resource constraints, and inter-system dependencies that determine whether a project starts up on time or suffers costly delays.

Commissioning is the most compressed phase in megaprojects, typically representing only 10-15% of total project duration but where 60-80% of all startup problems manifest (IPA Benchmarking data, 2022; CII Research Report 212-11). The consequences of poor commissioning sequencing are severe and well-documented: the average megaproject experiences 6-12 months of schedule overrun during the commissioning-to-operations transition phase, with each month of delay costing $5-50 million depending on project scale (IPA "Commissioning and Startup Best Practices," 2019). The Construction Industry Institute reports that projects in the top quartile of commissioning planning performance achieve first production 4-6 months earlier than those in the bottom quartile, representing hundreds of millions of dollars in accelerated revenue.

This skill directly addresses **Pain Point MP-03** (Megaproject Commissioning Delay): 60% of commissioning delays stem from incorrect sequencing of turnover packages, utility availability gaps, and uncoordinated vendor support windows. The root causes are systemic: commissioning sequences are typically developed late in the project lifecycle, often by construction schedulers who lack operational commissioning experience. System Turnover Packages are defined without adequate input from operations teams, leading to system boundaries that make construction sense but commissioning nonsense. Inspection Test Plan Sheets are tracked independently from commissioning activities, creating disconnected workflows where ITPS completion gates are not aligned with the commissioning logic network. Vendor commissioning support windows are booked based on construction progress forecasts rather than actual commissioning sequence requirements, resulting in vendors arriving before prerequisites are met or departing before their systems are fully commissioned.

The financial and operational impact extends beyond schedule delay. Incorrect sequencing leads to multiple start-stop-restart cycles for commissioning crews (estimated 20-30% efficiency loss per remobilization), utility systems being stressed by partial-load operations they were not designed for, and safety incidents caused by attempting to commission systems whose prerequisites have not been verified. OSHA PSM enforcement data shows that 25-30% of pre-startup safety review (PSSR) failures are attributable to commissioning sequence errors -- systems presented for PSSR that have upstream dependencies still incomplete. This skill eliminates these failure modes by producing a mathematically validated, logic-networked, resource-loaded commissioning sequence model that serves as the single source of truth for the entire commissioning and startup campaign.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | R-01                                                                                        |
| **Agent**              | Agent 8 -- Commissioning Intelligence                                                        |
| **Domain**             | Commissioning Intelligence                                                                   |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Setup: 10-15 days; Execution: 4-8 weeks (depends on project scale)                           |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | MP-03: 60% of commissioning delays stem from incorrect sequencing (IPA, CII)              |
| **Secondary Pain**     | CE-04: 30-40% of startup incidents trace to incomplete pre-startup verification (CCPS)       |
| **Value Created**      | Reduce commissioning duration by 15-25%; eliminate sequencing-related startup failures        |

### Functional Intent

This skill SHALL:

1. **Define System Boundaries for Commissioning**: Establish commissioning system boundaries that follow process logic (not construction area logic), ensuring each System Turnover Package represents a complete, testable functional unit with defined battery limits, isolation points, and handover criteria.

2. **Create System Turnover Packages (STPs)**: Generate structured STPs for each commissioning system containing mechanical completion checklists, pre-commissioning requirements, commissioning test procedures, punch list management protocols, and acceptance criteria for each stage (MC, Pre-Comm, Comm, TCCC).

3. **Map Prerequisite Dependencies**: Build a complete prerequisite dependency network that captures all inter-system dependencies including utility availability requirements, process feed dependencies, control system integration requirements, safety system prerequisites, and regulatory approval gates.

4. **Develop Logic Network**: Create a CPM (Critical Path Method) logic network linking all commissioning activities with finish-to-start, start-to-start, and finish-to-finish relationships, producing a mathematically valid schedule that identifies the critical path and near-critical paths.

5. **Align ITPS with Commissioning Activities**: Map every Inspection Test Plan Sheet to its corresponding commissioning activity, ensuring that ITPS hold points are scheduled, witness notifications are timed correctly, and ITPS completion gates align with the commissioning logic network.

6. **Schedule Vendor Support Windows**: Coordinate vendor commissioning support requirements with the commissioning sequence, ensuring vendors arrive after prerequisites are met, have adequate duration for their scope, and that handover from vendor to owner commissioning team is structured.

7. **Perform Critical Path Analysis and Optimization**: Identify the critical path, calculate total float for all activities, identify resource-driven critical paths (where resource constraints extend duration beyond logic-driven duration), and optimize the sequence to minimize total commissioning duration.

8. **Establish Monitoring Framework**: Create the progress monitoring framework with earned value metrics, milestone tracking, look-ahead scheduling, and early warning triggers for commissioning sequence deviations.

---

## Trigger / Invocation

### Direct Invocation

```
/model-commissioning-sequence --project [name] --action [model|update|analyze|report]
```

### Command Variants
- `/model-commissioning-sequence model --project [name]` -- Generate full commissioning sequence model
- `/model-commissioning-sequence update --project [name] --system [system_code]` -- Update sequence for specific system
- `/model-commissioning-sequence analyze --project [name]` -- Critical path and resource analysis
- `/model-commissioning-sequence report --project [name] --format [xlsx|pdf|dashboard]` -- Generate status report

### Aliases
- `/commissioning-sequence`, `/comm-sequence`, `/startup-sequence`, `/secuencia-comisionamiento`, `/modelo-comisionamiento`

### Natural Language Triggers (EN)
- "Model the commissioning sequence for project X"
- "Build the commissioning logic network"
- "What is the critical path for commissioning?"
- "Sequence the system turnover packages"
- "Optimize the startup sequence"
- "Create a commissioning schedule model"

### Natural Language Triggers (ES)
- "Modelar la secuencia de comisionamiento del proyecto X"
- "Construir la red logica de comisionamiento"
- "Cual es la ruta critica de comisionamiento?"
- "Secuenciar los paquetes de entrega de sistemas"
- "Optimizar la secuencia de puesta en marcha"

### Contextual Triggers
- Project reaches 70% construction completion (automatic sequence model generation recommended)
- System Turnover List is published or updated
- Master project schedule is updated with new MC dates
- Commissioning manager requests sequence optimization
- Utility availability dates change (triggers re-sequencing)
- Agent 8 detects misalignment between construction progress and commissioning prerequisites

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `equipment_list` | .xlsx | Engineering / mcp-sharepoint | Complete equipment list with tag numbers, descriptions, system assignments, and area codes. Ideally from `create-asset-register` output |
| `system_turnover_list` | .xlsx | Commissioning / mcp-sharepoint | Definition of commissioning systems with scope boundaries, equipment assignments, and battery limits |
| `master_schedule` | .xlsx / .mpp | Project controls / mcp-project-online | Overall project schedule showing MC target dates per system, milestone constraints, and project completion targets |
| `process_flow_diagrams` | .pdf | Process engineering / mcp-sharepoint | PFDs showing process sequence from raw material intake through product output, defining the process-logic commissioning sequence |
| `project_code` | text | User | Project identifier for file naming and database organization |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `p_and_ids` | .pdf | Engineering / mcp-sharepoint | Process and Instrumentation Diagrams for detailed system boundary definition and utility tie-in identification |
| `utility_availability_schedule` | .xlsx | Construction / Engineering | When each utility (power, water, compressed air, steam, nitrogen, instrument air) becomes available for commissioning use |
| `vendor_support_schedule` | .xlsx | Procurement / Commissioning | Vendor commissioning support windows including arrival dates, durations, and personnel counts |
| `itps_register` | .xlsx | Quality / Construction | Complete ITPS register with hold point requirements, witness notifications, and completion status |
| `hazop_action_register` | .xlsx | Safety / Engineering | HAZOP recommendations and their completion status affecting commissioning prerequisites |
| `construction_progress` | .xlsx | Construction | Current construction completion status per system, area, and discipline for sequencing alignment |
| `resource_availability` | .xlsx | Commissioning management | Available commissioning personnel by discipline, skill level, and availability period |
| `commissioning_procedures` | .docx / .pdf | Commissioning / Vendors | System-specific commissioning procedures from OEMs and owner's commissioning team |
| `risk_assessment` | .xlsx | HSE / Engineering | Pre-startup risk assessment outputs from `create-risk-assessment` affecting commissioning prerequisites |
| `spare_parts_status` | .xlsx | Procurement | Commissioning spare parts availability status from `create-spare-parts-strategy` |

### Context Enrichment

The skill automatically enriches inputs by:
- Querying mcp-project-online for current schedule status and milestone dates
- Retrieving document status from mcp-sharepoint for prerequisite verification
- Cross-referencing with `create-commissioning-plan` output for consistency alignment
- Checking `prepare-pssr-package` (DOC-04) prerequisites for PSSR gate alignment
- Validating against `manage-loop-checking` (R-03) for instrumentation readiness integration

### Input Validation Rules

```yaml
validation:
  equipment_list:
    required_columns: ["tag_number", "description", "system_code", "area_code", "equipment_type"]
    min_records: 50
    tag_format_regex: "^[A-Z0-9]{2,6}-[A-Z]{1,4}-\\d{3,5}[A-Z]?$"
  system_turnover_list:
    required_columns: ["system_code", "system_name", "area", "equipment_tags", "battery_limits"]
    min_records: 5
  master_schedule:
    required_milestones: ["MC_date", "first_feed_date", "commercial_operation_date"]
    date_format: "YYYY-MM-DD"
    mc_dates_must_precede: "first_feed_date"
  utility_availability:
    must_include: ["electrical_power", "compressed_air", "process_water"]
    dates_must_precede: "dependent_system_commissioning_start"
```

---

## Output Specification

### Deliverable 1: Commissioning Sequence Model (.xlsx)

**Filename**: `{ProjectCode}_Commissioning_Sequence_Model_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Sequence Logic Network"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Activity_ID | Unique commissioning activity identifier | COMM-SYS100-PC-001 |
| B | WBS_Code | Work Breakdown Structure code | 3.1.2.1 |
| C | System_Code | Commissioning system reference | SYS-100-CRUSH |
| D | Phase | Pre-Commissioning / Commissioning / TCCC | Pre-Commissioning |
| E | Activity_Description | Activity description (EN) | Pressure test - primary crusher feed chute piping |
| F | Activity_Description_ES | Activity description (ES) | Prueba de presion - tuberia chute alimentacion chancador primario |
| G | Predecessor_IDs | Predecessor activity IDs with relationship type | COMM-SYS100-PC-000 (FS), COMM-UTIL-PWR-005 (FS+5d) |
| H | Successor_IDs | Successor activity IDs | COMM-SYS100-PC-002 |
| I | Duration_Days | Planned duration in calendar days | 3 |
| J | Planned_Start | Planned start date | 2026-06-15 |
| K | Planned_Finish | Planned finish date | 2026-06-17 |
| L | Actual_Start | Actual start date (tracking) | |
| M | Actual_Finish | Actual finish date (tracking) | |
| N | Pct_Complete | Percentage complete | 0% |
| O | Total_Float | Total float in days | 5 |
| P | Free_Float | Free float in days | 2 |
| Q | Critical_Path | On critical path (Yes/No) | No |
| R | Near_Critical | Float < 5 days (Yes/No) | Yes |
| S | Resource_Code | Assigned resource/team | COMM-MECH-01 |
| T | Vendor_Support | Vendor support required (Yes/No, vendor name) | Yes - FLSmidth |
| U | Utility_Prerequisite | Utilities required for this activity | None (hydraulic test water) |
| V | ITPS_Reference | Linked ITPS reference number | ITPS-100-MECH-015 |
| W | ITPS_Hold_Point | Hold point type (H=Hold, W=Witness, R=Review) | W - Client witness |
| X | Safety_Permit | Required safety permits | Cold work permit, confined space |
| Y | Completion_Criteria | Measurable acceptance criteria | Pressure hold 4hrs at 1.5x design, no drop >1% |
| Z | STP_Reference | System Turnover Package reference | STP-SYS100-CRUSH |
| AA | Notes | Additional notes / constraints | Requires 2x test pumps from equipment pool |

See [`references/skill-output-details.md`](references/skill-output-details.md) for complete output field definitions and format details.

## Methodology & Standards

### Primary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| ASME PCC-1 | Guidelines for Pressure Boundary Bolted Flange Joint Assembly | Commissioning tightness verification, leak test acceptance criteria |
| IEC 62337:2012 | Commissioning of Electrical, Instrumentation and Control Systems | Systematic commissioning methodology for E&I systems |
| ISA-S88.01 | Batch Control Commissioning | Sequencing methodology for batch process commissioning and recipe verification |
| NORSOK Z-007 | Mechanical Completion and Commissioning | System turnover package structure, MC/commissioning handover protocols |

### Secondary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| API 686 | Machinery Installation and Installation Design | Rotating equipment commissioning sequence and acceptance criteria |
| IEC 62382 | Electrical and Instrumentation Loop Check | Loop checking procedures integrated with commissioning sequence |
| ASME PCC-2 | Repair of Pressure Equipment and Piping | Pre-commissioning testing standards and acceptance criteria |
| ASHRAE Guideline 0 | The Commissioning Process | General commissioning process methodology framework |
| CII RT-212 | Commissioning and Startup Best Practices | Industry benchmarking data and best practice sequencing methodology |

### Key Frameworks
- **NORSOK Z-007 System Turnover Model**: The primary framework for STP structure, defining the hierarchy of System (process function), Subsystem (equipment group), and Tag (individual equipment). System boundaries follow process logic, not construction area boundaries.
- **IPA Commissioning Sequence Methodology**: Industry Performance Assessment benchmarking methodology for commissioning sequence optimization, validated across 3,000+ megaprojects.
- **CII Critical Path Commissioning**: Construction Industry Institute methodology for identifying and managing the commissioning critical path independently from the construction critical path.
- **ISA-S88 Batch Control Hierarchy**: Applied to sequencing commissioning of batch and semi-batch processes where recipe and phase logic drives the commissioning order.

### Chilean Standards
- **DS 132** - Reglamento de Seguridad Minera (commissioning safety requirements for mining)
- **NCh Elec. 4/2003** - Electrical commissioning standards for Chilean installations
- **SERNAGEOMIN** - Mining-specific commissioning and startup authorization requirements

### VSC-Specific Standards
- VSC Commissioning Sequence Methodology v2.0
- VSC System Turnover Protocol v2.0
- VSC ITPS Management Guide v1.5
- VSC Commissioning Resource Loading Standard v1.0

### Industry Statistics

| Statistic | Source | Year |
|-----------|--------|------|
| 60% of commissioning delays stem from incorrect sequencing | IPA Benchmarking | 2022 |
| Commissioning represents 10-15% of project duration but 60-80% of startup problems | CII RT-212 | 2020 |
| Top-quartile commissioning planning achieves first production 4-6 months earlier | IPA | 2019 |
| 20-30% efficiency loss per commissioning crew remobilization cycle | CII Benchmarking | 2021 |
| 25-30% of PSSR failures attributable to commissioning sequence errors | OSHA PSM data | 2023 |
| Average megaproject has 6-12 months of commissioning schedule overrun | IPA | 2022 |
| Each month of commissioning delay costs $5-50M depending on project scale | IPA/CII | 2020 |

---

## Step-by-Step Execution

### Phase 1: System Boundary Definition and STP Creation (Steps 1-4)

**Step 1: Define Commissioning System Boundaries**
1. Review PFDs and P&IDs to identify functional commissioning systems
2. Apply NORSOK Z-007 principles: each system must be a complete, isolatable, testable functional unit
3. Define battery limits (isolation valves, electrical breakers, instrument boundaries); assign equipment; create System > Subsystem > Tag hierarchy
4. Validate with operations team — systems must make operational sense, not just construction sense

**Step 2: Create System Turnover Packages (STPs)**
1. Per system generate STP: scope definition, MC checklist by discipline, pre-comm checklist, comm checklist, ITPS requirements, punch list protocol (A/B/C classification), stage gate acceptance criteria, sign-off sheets
2. Number STPs aligned with system codes; store in mcp-sharepoint

**Step 3: Map Prerequisite Dependencies**
1. Per system identify: utility (power, air, water at specified capacity), process (upstream systems), control (DCS/PLC modules), safety (fire, gas, ESD), regulatory (permits, inspections), documentation (procedures, training)
2. Build System × System dependency matrix; classify Hard (mandatory) vs Soft (workaround exists)
3. Identify and resolve circular dependencies — no system can depend on itself directly or transitively

**Step 4: Develop ITPS Alignment**
1. Map every ITPS → commissioning system + activity; embed hold points in logic network as constraints
2. Notification lead times: 5-10 business days (client), 15-20 days (regulatory)
3. Align ITPS completion requirements with STP stage gates

### Phase 2: Logic Network Development and Resource Loading (Steps 5-8)

**Step 5: Build Logic Network**
1. Create CPM network from STP checklists (typically 500-5,000 activities depending on project scale)
2. Assign durations from benchmarks: pressure test 1-5d, energization 2-7d, loop check 15-60min/loop, functional test 1-3d, integration 3-10d, performance 3-14d
3. Link with FS/SS/FF relationships and lags; embed utility dates, regulatory gates, vendor windows as constraints

**Step 6: Perform Resource Loading**
1. Assign resources: commissioning team by discipline, vendor support, operations, third-party inspection, test equipment
2. Calculate weekly/monthly requirements; identify conflicts where demand exceeds supply
3. Resource-level non-critical activities to smooth peaks; identify resource-driven critical path

**Step 7: Perform Critical Path Analysis**
1. Forward pass + backward pass → critical path (0 float) and near-critical paths (<5d float)
2. Analyze composition: utility commissioning 15-25%, major equipment 30-40%, integration/performance 25-35%, admin gates 5-15%
3. Identify acceleration opportunities: parallelize sequential activities, compress durations, advance admin gates, extend vendor windows

**Step 8: Schedule Vendor Support Windows**
1. Per vendor: earliest start (prerequisites met), optimal arrival (2-3d before activity), minimum duration + contingency
2. Coordinate with vendor global availability, travel/visa requirements, confirmed construction completion
3. Create vendor support matrix timeline

### Phase 3: Optimization and Risk Assessment (Steps 9-12)

**Step 9: Map Utility Availability**
1. Define design vs commissioning capacity, staged availability dates, load profile, backup provisions
2. Verify no activity scheduled before its utility prerequisite; verify capacity for concurrent activities
3. Flag gaps requiring schedule adjustment or temporary provisions

**Step 10: Perform Risk Assessment**
1. Assess: schedule (MC slippage, vendor delays), technical (equipment failures, integration), resource (unavailability, skill gaps), external (weather, supply chain), safety (SIMOPS, first energization)
2. Score P×C; if `intent-profile.yaml` exists, apply client risk appetite (conservative → mitigate at >9, aggressive → mitigate at >12); assign mitigations for High and Critical; embed in model as float buffers, contingency activities, hold points

**Step 11: Optimize Schedule**
1. Apply: critical chain (project buffer), fast-tracking (overlap with managed risk), crashing (resources on CP), resource smoothing, what-if scenarios
2. Validate against milestones: first utility → first energization → first process fluid → first product → performance test → commercial operation
3. Iterate until all milestones achievable within acceptable float

**Step 12: Establish Monitoring Framework**
1. EV metrics (BCWP/BCWS/ACWP), physical progress by system/phase/discipline, milestone tracking with trend analysis
2. Dashboards: S-curve, Gantt with RAG coding, prerequisite traffic lights, CP status, vendor tracker
3. Reporting cadence: daily flash report, weekly EV report, monthly management report with trends

For benchmark duration tables, resource loading templates, and detailed sub-step procedures, see [`references/skill-detailed-steps.md`](references/skill-detailed-steps.md).

## Quality Criteria

### Scoring Table

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| System coverage | All equipment assigned to commissioning systems | 15% | 100% | 100% |
| Activity completeness | Standard activities per system type | 15% | >95% | >90% |
| Logic network integrity | All activities linked, no open ends, no circular dependencies | 15% | 100% | 100% |
| ITPS alignment | Every ITPS mapped to a commissioning activity | 10% | 100% | >95% |
| Prerequisite mapping | All inter-system dependencies identified | 10% | 100% | >95% |
| Resource loading | All activities resource-assigned | 10% | 100% | >90% |
| Critical path validity | Critical path achievable within project timeline | 10% | Achievable with >5 days float | Achievable with 0 days float |
| Vendor alignment | All vendor windows scheduled after prerequisites met | 5% | 100% | 100% |
| Duration realism | Durations benchmarked against industry data | 5% | All within +/-20% of benchmark | All within +/-30% of benchmark |
| SME approval rating | Approval by commissioning management | 5% | >95% | >91% |

### Automated Quality Checks

1. **Open-end check**: No activity without at least one predecessor AND one successor (except project start and finish milestones)
2. **Circular dependency check**: No activity can be its own predecessor (directly or transitively)
3. **Negative float check**: No activity with negative total float (indicates impossible constraint combination)
4. **Resource overload check**: No resource loaded above 100% capacity without flagging
5. **Prerequisite feasibility check**: No commissioning activity scheduled before its utility/process prerequisite availability date
6. **ITPS gap check**: No ITPS without a linked commissioning activity
7. **Duration outlier check**: Flag activities with duration >2 standard deviations from benchmark for the activity type
8. **Milestone alignment check**: All project milestones achievable per the current logic network
9. **Vendor window check**: All vendor arrivals scheduled after confirmed prerequisite completion
10. **STP completeness check**: All STPs contain all required sections (MC checklist, pre-comm checklist, comm checklist, acceptance criteria)

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-asset-register` | Equipment list with system assignments | Critical | mcp-sharepoint |
| `create-commissioning-plan` | Overall commissioning plan and strategy | Critical | mcp-sharepoint |
| `create-risk-assessment` | Pre-startup risk assessment outputs | High | mcp-sharepoint |
| `create-spare-parts-strategy` (PROC-01) | Commissioning spares availability status | High | mcp-sharepoint |
| `manage-vendor-documentation` (DOC-01) | Vendor commissioning procedures and data sheets | High | mcp-sharepoint |
| `create-training-plan` | Operator training completion status for commissioning support | Medium | mcp-sharepoint |
| Engineering deliverables (via mcp-sharepoint) | P&IDs, PFDs, instrument index, equipment data sheets | Critical | mcp-sharepoint |
| Project controls (via mcp-project-online) | Master project schedule, MC milestone dates | Critical | mcp-project-online |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Criticality | MCP Channel |
|-------------|----------------|-------------|-------------|
| `manage-loop-checking` (R-03) | Commissioning sequence for loop check scheduling | Critical | project-database |
| `track-punchlist-items` (R-02) | STP structure and system definitions for punch list organization | Critical | project-database |
| `prepare-pssr-package` (DOC-04) | Commissioning completion evidence, STP sign-off status | Critical | mcp-sharepoint |
| `create-rampup-plan` | Commissioning completion dates and TCCC handover schedule | High | mcp-sharepoint |
| `track-or-deliverables` (H-02) | Commissioning progress metrics for OR tracking dashboard | High | project-database |
| `create-kpi-dashboard` | Commissioning KPIs: progress, punch list, milestone adherence | Medium | mcp-sharepoint |
| `create-shutdown-plan` | System definitions and commissioning knowledge for future shutdowns | Medium | mcp-sharepoint |

---

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.

## MCP Integrations

See [`references/skill-mcp-integrations.md`](references/skill-mcp-integrations.md) for detailed mcp integrations.

## Templates & References

See [`references/skill-templates-references.md`](references/skill-templates-references.md) for detailed templates & references.
