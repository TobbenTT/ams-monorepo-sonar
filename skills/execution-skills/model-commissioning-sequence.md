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

#### Sheet 2: "System Turnover Package Schedule"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | STP_Reference | System Turnover Package identifier |
| B | System_Code | System identifier |
| C | System_Name | System name |
| D | Area | Plant area |
| E | Equipment_Count | Number of equipment items in STP scope |
| F | MC_Target | Mechanical Completion target date |
| G | MC_Actual | Mechanical Completion actual date |
| H | MC_Status | MC status (Not Started / In Progress / Complete) |
| I | PreComm_Start | Pre-commissioning start date |
| J | PreComm_Target | Pre-commissioning completion target |
| K | PreComm_Actual | Pre-commissioning actual completion |
| L | Comm_Start | Commissioning start date |
| M | Comm_Target | Commissioning completion target |
| N | Comm_Actual | Commissioning actual completion |
| O | TCCC_Start | TCCC/performance test start |
| P | TCCC_Target | TCCC completion target |
| Q | TCCC_Actual | TCCC actual completion |
| R | Punch_A_Open | Open Category A punch items (safety/MC critical) |
| S | Punch_B_Open | Open Category B punch items (pre-startup required) |
| T | Punch_C_Open | Open Category C punch items (deferrable to ops) |
| U | ITPS_Total | Total ITPS for this STP |
| V | ITPS_Complete | ITPS completed |
| W | ITPS_Pct | ITPS completion percentage |
| X | Overall_Status | Not Started / In Progress / Complete / Delayed |
| Y | Readiness_Pct | Weighted overall readiness score |
| Z | Critical_Path | STP on critical path (Yes/No) |

#### Sheet 3: "Prerequisite Dependency Matrix"

Cross-reference matrix showing all inter-system prerequisites:

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Dependent_System | System that depends on the prerequisite |
| B | Prerequisite_System | System that must be completed first |
| C | Prerequisite_Type | Utility / Process / Control / Safety / Regulatory |
| D | Prerequisite_Description | Description of the dependency |
| E | Prerequisite_Milestone | MC / Pre-Comm Complete / Comm Complete / TCCC |
| F | Required_Date | Date by which prerequisite must be met |
| G | Current_Status | On Track / At Risk / Delayed / Complete |
| H | Impact_If_Delayed | Schedule impact in days if prerequisite is late |
| I | Mitigation_Action | Planned mitigation if prerequisite is at risk |

#### Sheet 4: "ITPS Alignment Register"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | ITPS_Number | Inspection Test Plan Sheet number |
| B | ITPS_Description | Description of inspection/test |
| C | Discipline | Mechanical / Piping / Electrical / Instrument / Civil |
| D | System_Code | Associated commissioning system |
| E | Commissioning_Activity_ID | Linked commissioning activity from Sheet 1 |
| F | Hold_Point_Type | Hold (H) / Witness (W) / Review (R) |
| G | Notification_Lead_Time | Days notice required for witness/hold point |
| H | Witness_Party | Client / Regulatory / Insurance / Third Party |
| I | ITPS_Status | Not Started / In Progress / Complete / Waived |
| J | Completion_Date | Actual completion date |
| K | Certificate_Reference | Completion certificate document reference |

#### Sheet 5: "Resource Loading"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Resource_Code | Resource identifier |
| B | Resource_Type | Commissioning team / Vendor / Operations / Third Party |
| C | Discipline | Mechanical / Electrical / Instrument / Process / Safety |
| D | Week_Number | Calendar week |
| E | Planned_Hours | Planned resource hours for the week |
| F | Actual_Hours | Actual hours expended |
| G | Utilization_Pct | Resource utilization percentage |
| H | Overload_Flag | Overloaded (>100% utilization) Yes/No |

#### Sheet 6: "Critical Path Analysis"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Path_Rank | Critical path rank (1 = longest/critical) |
| B | Path_Description | Description of the path |
| C | Path_Duration_Days | Total path duration |
| D | Path_Activities | List of activity IDs on this path |
| E | Float_Days | Total float (0 for critical path) |
| F | Key_Risks | Primary risks to this path |
| G | Acceleration_Options | Options to compress this path |

### Deliverable 2: System Turnover Package Schedule (.xlsx)

**Filename**: `{ProjectCode}_STP_Schedule_v{Version}_{YYYYMMDD}.xlsx`

Detailed schedule for each System Turnover Package containing:
- STP cover sheet with system scope definition and battery limits
- Equipment list within the STP scope
- MC checklist (discipline-specific mechanical completion requirements)
- Pre-commissioning activity checklist
- Commissioning activity checklist
- ITPS register for the STP
- Punch list template (Category A/B/C)
- Acceptance criteria for each stage gate (MC, Pre-Comm, Comm, TCCC)
- Sign-off sheet for handover from construction to commissioning to operations

### Deliverable 3: Commissioning Procedure Register (.docx)

**Filename**: `{ProjectCode}_Commissioning_Procedure_Register_v{Version}_{YYYYMMDD}.docx`

**Document Structure (20-40 pages)**:

1. **Introduction** (2-3 pages)
   - Commissioning sequencing methodology
   - System boundary philosophy
   - Relationship to master project schedule

2. **System Commissioning Sequence Narrative** (8-15 pages)
   - Utility commissioning sequence rationale
   - Process system commissioning sequence rationale
   - Inter-system dependency logic explanation
   - Critical path narrative description

3. **Procedure Index** (5-10 pages)
   - Complete index of all commissioning procedures by system
   - Procedure status (Draft / Review / Approved / Not Yet Developed)
   - Responsible party for each procedure
   - Target approval date

4. **Risk Assessment Summary** (3-5 pages)
   - Commissioning sequence-specific risks
   - Mitigation measures embedded in the sequence model
   - Residual risk register

5. **Appendices**
   - System boundary diagrams
   - Commissioning logic network (graphical representation)
   - Vendor support matrix
   - Utility availability timeline

### Deliverable 4: Pre-Commissioning Checklist (.xlsx)

**Filename**: `{ProjectCode}_PreComm_Checklist_{SystemCode}_v{Version}_{YYYYMMDD}.xlsx`

System-specific pre-commissioning checklists by discipline:
- Piping: cleaning, flushing, pressure testing, leak testing, insulation
- Mechanical: alignment, lubrication, rotation check, vibration baseline
- Electrical: megger testing, relay testing, energization sequence
- Instrumentation: calibration, loop checks, control valve stroke
- Civil/Structural: final inspections, fireproofing, drainage

### Formatting Standards
- Phase color coding: Pre-Commissioning = Blue (#0066CC), Commissioning = Orange (#FF8C00), TCCC = Green (#008000)
- Critical path activities: Bold text, red left border (#CC0000)
- Near-critical activities (float < 5 days): Amber left border (#FF8C00)
- Status colors: Not Started = Gray (#C0C0C0), In Progress = Yellow (#FFD700), Complete = Green (#008000), Delayed = Red (#CC0000)
- Header row: Bold, navy background (#001F3F), white font
- Freeze panes on header row and key identifier columns
- Conditional formatting for float values (red if 0, amber if <5, green if >10)
- Data validation dropdowns for status fields

---

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
- Review process flow diagrams and P&IDs to identify functional commissioning systems
- Apply NORSOK Z-007 system boundary principles: each system must be a complete, isolatable, testable functional unit
- Define battery limits for each system: isolation valves, electrical breakers, instrument boundaries
- Verify system boundaries enable independent testing (a system should be pre-commissionable and commissionable without depending on all adjacent systems being complete)
- Assign equipment from the equipment list to commissioning systems
- Create system hierarchy: System > Subsystem > Equipment Tag
- Generate system boundary drawings (single-line representation of each system scope)
- Validate boundaries with operations team (systems must make operational sense, not just construction sense)

**Step 2: Create System Turnover Packages (STPs)**
- For each defined system, generate the STP containing:
  - System scope definition (equipment list, P&ID references, battery limits)
  - Mechanical completion checklist by discipline (piping, mechanical, electrical, instrument, civil)
  - Pre-commissioning activity checklist by discipline
  - Commissioning activity checklist (functional testing, integrated testing)
  - ITPS requirements (hold points, witness points, review points)
  - Punch list management protocol (A/B/C classification criteria)
  - Stage gate acceptance criteria (MC complete, Pre-Comm complete, Comm complete, TCCC ready)
  - Sign-off sheets for each handover gate
- Number STPs sequentially aligned with system codes
- Store STPs in mcp-sharepoint (commissioning document library)

**Step 3: Map Prerequisite Dependencies**
- For each commissioning system, identify all prerequisites:
  - **Utility prerequisites**: Which utilities must be available? (power at what voltage, compressed air at what pressure, water at what flow rate)
  - **Process prerequisites**: Which upstream systems must be commissioned first? (e.g., grinding cannot commission without crushing providing feed)
  - **Control system prerequisites**: Which DCS/PLC modules must be commissioned? What network connectivity is required?
  - **Safety prerequisites**: Which safety systems must be verified? (fire protection, gas detection, emergency shutdown)
  - **Regulatory prerequisites**: Which permits, inspections, or approvals are required before proceeding?
  - **Documentation prerequisites**: Which procedures, training completions, and certifications must be in place?
- Build a prerequisite dependency matrix (System x System) showing all inter-system dependencies
- Classify each dependency by type and criticality (Hard = cannot proceed without; Soft = preferred but workaround exists)
- Identify circular dependencies and resolve (no system can depend on itself directly or transitively)

**Step 4: Develop ITPS Alignment**
- Map every ITPS in the ITPS register to its corresponding commissioning system and activity
- Verify that ITPS hold points are embedded in the commissioning logic network as activity constraints
- Calculate notification lead times for witness points (typically 5-10 business days for client, 15-20 days for regulatory)
- Identify ITPS bottlenecks: hold points requiring third-party or regulatory witness that could delay commissioning if not scheduled
- Create ITPS scheduling protocol: when to notify, who to notify, what to do if witness is unavailable
- Align ITPS completion requirements with STP stage gates (all applicable ITPS must be complete before stage gate sign-off)

### Phase 2: Logic Network Development and Resource Loading (Steps 5-8)

**Step 5: Build Logic Network**
- Create the commissioning logic network using CPM (Critical Path Method) methodology:
  - Define all commissioning activities from STP checklists (typically 500-5,000 activities depending on project scale)
  - Assign durations to each activity based on industry benchmarks and project-specific factors:
    - Piping pressure test: 1-5 days per system depending on complexity
    - Electrical energization: 2-7 days per MCC/switchgear
    - Loop checking: 30 min/analog loop, 15 min/digital loop, 60 min/SIL loop
    - Equipment functional test: 1-3 days per major equipment item
    - System integration test: 3-10 days per system
    - Performance test: 3-14 days depending on process complexity
  - Link activities with predecessor/successor relationships:
    - Finish-to-Start (FS): Most common; activity B cannot start until A finishes
    - Start-to-Start (SS): Activities can start simultaneously (e.g., parallel discipline pre-commissioning)
    - Finish-to-Finish (FF): Activities must finish together (e.g., all pre-comm disciplines must finish before commissioning starts)
    - Lag/Lead times as appropriate (e.g., concrete cure time, coating dry time)
  - Embed utility availability dates as external constraints
  - Embed regulatory approval gates as milestone constraints
  - Embed vendor support windows as resource constraints

**Step 6: Perform Resource Loading**
- Assign commissioning resources to each activity:
  - Commissioning team personnel by discipline (mechanical, electrical, instrument, process)
  - Vendor technical support (OEM representatives)
  - Operations support (operators required for commissioning support)
  - Third-party inspection resources
  - Test equipment and temporary facilities
- Calculate resource requirements by week/month for each discipline
- Identify resource conflicts (where demand exceeds supply)
- Perform resource leveling: adjust non-critical activity timing to smooth resource peaks while maintaining the critical path
- Identify resource-driven critical path (where resource constraints extend the schedule beyond logic-driven duration)
- Prepare resource mobilization/demobilization schedule

**Step 7: Perform Critical Path Analysis**
- Calculate forward pass (earliest start/finish dates) and backward pass (latest start/finish dates) for all activities
- Identify critical path (longest path through the network, zero total float)
- Identify near-critical paths (total float < 5 days)
- Analyze critical path composition:
  - What percentage is utility commissioning? (typically 15-25%)
  - What percentage is major equipment commissioning? (typically 30-40%)
  - What percentage is system integration and performance testing? (typically 25-35%)
  - What percentage is administrative/regulatory gates? (typically 5-15%)
- Identify schedule acceleration opportunities:
  - Activities that can be paralleled (currently sequential but could be simultaneous with additional resources)
  - Activities with conservative duration estimates that can be compressed
  - Administrative gates that can be started earlier
  - Vendor support that can be extended or overlapped

**Step 8: Schedule Vendor Support Windows**
- For each vendor-supported commissioning activity:
  - Identify the earliest possible start date (all prerequisites met)
  - Identify the latest acceptable start date (maintaining total float)
  - Define the optimal vendor arrival window (2-3 days before activity start for mobilization)
  - Define minimum vendor presence duration (activity duration + contingency)
  - Identify handover requirements (what the vendor must leave behind: reports, certificates, training)
- Coordinate vendor windows with:
  - Vendor availability (some vendors support multiple projects globally)
  - Travel and visa requirements (for international vendors)
  - Construction completion forecasts (vendor arrives after prerequisites are confirmed complete)
- Create vendor support matrix showing all vendor windows on a timeline

### Phase 3: Optimization and Risk Assessment (Steps 9-12)

**Step 9: Map Utility Availability**
- For each utility system, define:
  - Design capacity and commissioning capacity (often different -- partial load during commissioning)
  - Staged availability dates (e.g., temporary power before permanent power)
  - Commissioning load profile (what utilities each commissioning activity requires)
  - Backup provisions (generator backup, temporary air compressor, water trucking)
- Verify utility availability aligns with commissioning sequence:
  - No commissioning activity is scheduled before its utility prerequisite is available
  - Utility capacity is sufficient for concurrent commissioning activities
  - Utility system commissioning is sequenced first in the overall commissioning logic
- Flag utility gaps: periods where demand exceeds available capacity, requiring either schedule adjustment or temporary provisions

**Step 10: Perform Risk Assessment**
- Conduct commissioning sequence risk assessment:
  - **Schedule risks**: MC date slippage, vendor availability changes, regulatory approval delays
  - **Technical risks**: Equipment performance failures during testing, integration issues between systems
  - **Resource risks**: Key personnel unavailability, skill shortages, crew fatigue
  - **External risks**: Weather impacts, supply chain disruptions, utility provider issues
  - **Safety risks**: Concurrent construction and commissioning (SIMOPS), first-time energization, process fluid introduction
- For each risk, assess probability (1-5), consequence (1-5), and calculate risk score
- Assign mitigation measures for all risks scored > 12 (High) and > 16 (Critical)
- Embed risk mitigations in the commissioning sequence model (float buffers, contingency activities, hold points)
- Create commissioning risk register as appendix to the Commissioning Procedure Register

**Step 11: Optimize Schedule**
- Apply schedule optimization techniques:
  - **Critical chain method**: Add project buffer at the end, remove individual activity contingency
  - **Fast-tracking**: Overlap sequential activities where possible (with managed risk)
  - **Crashing**: Add resources to critical path activities to reduce duration (with cost-benefit analysis)
  - **Resource smoothing**: Adjust non-critical activities to reduce resource peaks and valleys
  - **What-if analysis**: Model scenarios for MC date slippage, vendor delays, and weather impacts
- Validate optimized schedule against project milestones:
  - First utility available date
  - First equipment energization date
  - First process fluid introduction date
  - First product date
  - Performance guarantee test start date
  - Commercial operation date
- Iterate until the commissioning sequence model achieves all milestones within acceptable float

**Step 12: Establish Monitoring Framework**
- Define commissioning progress monitoring system:
  - **Earned value metrics**: BCWP, BCWS, ACWP for commissioning activities
  - **Physical progress**: % complete by system, by phase, by discipline
  - **Milestone tracking**: Planned vs. actual milestone dates with trend analysis
  - **Look-ahead scheduling**: 2-week and 4-week rolling look-ahead with daily updates
  - **Early warning triggers**: Float erosion alerts, resource overload alerts, prerequisite delay alerts
- Configure monitoring dashboard in mcp-project-online / project-database:
  - S-curve: planned vs. actual commissioning progress
  - Gantt chart: top-level system commissioning timeline with RAG coding
  - Prerequisite status: traffic light view of all prerequisites by system
  - Critical path status: current critical path with identified risks
  - Vendor support tracker: upcoming vendor windows with readiness status
- Define reporting cadence:
  - Daily: commissioning flash report (activities completed, issues, look-ahead)
  - Weekly: detailed commissioning progress report with earned value analysis
  - Monthly: commissioning management report with trend analysis and risk update
- Store all reports and tracking data in mcp-sharepoint (commissioning library)

---

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

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-project-online` | Microsoft Project Online integration for schedule management | Read master schedule milestones; Write commissioning logic network; Update progress tracking; Generate Gantt charts and S-curves; Resource leveling analysis |
| `mcp-sharepoint` | Document storage for STPs, procedures, and commissioning records | Retrieve engineering inputs (P&IDs, PFDs, equipment lists); Store STPs and commissioning packages; Manage document revision control; Archive commissioning certificates; Publish dashboards |
| `project-database` | Real-time commissioning progress tracking database | Create system-level tracking records; Update activity completion status; Track ITPS completion; Manage prerequisite status; Support dashboard views with RAG coding |
| `mcp-outlook` | Notifications and coordination communications | Send vendor mobilization notifications; Distribute ITPS witness notifications; Send weekly commissioning progress reports; Schedule commissioning coordination meetings; Escalate critical path issues |
| `mcp-excel` | Complex schedule calculations and analysis | Perform CPM forward/backward pass calculations; Resource leveling algorithms; What-if scenario modeling; Earned value calculations; Statistical duration analysis |

---

## Templates & References

### Templates
- `templates/commissioning_sequence_model.xlsx` - Master sequence model workbook template
- `templates/system_turnover_package.xlsx` - STP template with all required sections
- `templates/prerequisite_dependency_matrix.xlsx` - Inter-system dependency mapping template
- `templates/itps_alignment_register.xlsx` - ITPS-to-commissioning activity mapping template
- `templates/commissioning_procedure_register.docx` - Procedure register document template with VSC branding
- `templates/precomm_checklist_master.xlsx` - Pre-commissioning checklist template by discipline
- `templates/vendor_support_matrix.xlsx` - Vendor commissioning support scheduling template
- `templates/commissioning_risk_register.xlsx` - Commissioning-specific risk register template
- `templates/commissioning_progress_report.docx` - Weekly/monthly progress report template

### Reference Documents
- NORSOK Z-007 - Mechanical Completion and Commissioning
- IEC 62337:2012 - Commissioning of Electrical, Instrumentation and Control Systems
- ASME PCC-1 - Guidelines for Pressure Boundary Bolted Flange Joint Assembly
- ISA-S88.01 - Batch Control Standard
- CII RT-212 - Commissioning and Startup Best Practices
- IPA Commissioning Benchmarking Reports (2019-2024)
- VSC Commissioning Sequence Methodology v2.0

### Reference Datasets
- Standard commissioning activity library by system type (utility, process, batch, continuous)
- Commissioning duration benchmarks by equipment type and complexity
- Typical utility commissioning sequences for mining, oil & gas, petrochemical
- ITPS duration benchmarks by inspection type
- Resource loading benchmarks (person-hours per equipment type)

---

## Examples

### Example 1: Mining Concentrator Commissioning Sequence

```
COMMISSIONING SEQUENCE MODEL - Cerro Alto Copper Concentrator
================================================================
Project Code: CA-2026    |    Total Systems: 12
Total Activities: 2,840  |    Duration: 26 weeks (MC to Commercial Ops)
Critical Path: 182 days  |    Float on CP: 0 days

COMMISSIONING SEQUENCE (System Level):
  Week 1-4:   UTILITY SYSTEMS
    SYS-UTIL-PWR  Electrical Power Distribution     [CRITICAL PATH]
    SYS-UTIL-AIR  Compressed Air System
    SYS-UTIL-WAT  Process & Potable Water
    SYS-UTIL-N2   Nitrogen Supply System

  Week 3-8:   PRIMARY PROCESS
    SYS-100-CRUSH Primary Crushing                   [CRITICAL PATH]
    SYS-100-CONV  Conveying Systems
    SYS-100-STOCK Stockpile & Reclaim

  Week 6-14:  SECONDARY PROCESS
    SYS-200-GRIND SAG & Ball Mill Grinding           [CRITICAL PATH]
    SYS-200-CLASS Classification & Cyclones

  Week 10-18: TERTIARY PROCESS
    SYS-300-FLOAT Rougher/Cleaner Flotation          [CRITICAL PATH]
    SYS-300-REAG  Reagent Systems

  Week 14-22: PRODUCT HANDLING
    SYS-400-THICK Thickening & Filtration             [CRITICAL PATH]
    SYS-400-TAIL  Tailings Management

  Week 18-26: PERFORMANCE TESTING & TCCC
    Integrated system testing
    72-hour performance guarantee test
    TCCC certificate and handover                     [CRITICAL PATH]

CRITICAL PATH ANALYSIS:
  Path: PWR -> CRUSH -> GRIND -> FLOAT -> THICK -> TCCC
  Duration: 182 days (26 weeks)
  Key Risks:
    1. SAG Mill liner installation delay (Impact: 14 days)
    2. Flotation cell vendor support window conflict (Impact: 7 days)
    3. Power utility connection delayed by utility provider (Impact: 21 days)

RESOURCE SUMMARY:
  Peak commissioning crew: 85 persons (Week 10-14)
  Vendor support windows: 8 vendors, 42 vendor-weeks total
  Operations support: 24 operators from Week 8 onward
```

### Example 2: Gas Processing Plant Commissioning Sequence

```
COMMISSIONING SEQUENCE MODEL - Atacama Gas Processing Facility
================================================================
Project Code: AGP-2026   |    Total Systems: 18
Total Activities: 4,120  |    Duration: 34 weeks (MC to Commercial Ops)
Critical Path: 238 days  |    Float on CP: 0 days

COMMISSIONING SEQUENCE (System Level):
  Week 1-6:   UTILITY & SAFETY SYSTEMS
    SYS-U01  Electrical Power (69kV/4.16kV/480V)     [CRITICAL PATH]
    SYS-U02  Instrument Air / Plant Air
    SYS-U03  Cooling Water (Open & Closed Loop)
    SYS-U04  Fire Protection (Firewater, Foam, Gas)    [SAFETY - PARALLEL]
    SYS-U05  Emergency Shutdown System (ESD/F&G)       [SAFETY - PARALLEL]

  Week 5-12:  FRONT-END PROCESS
    SYS-P01  Inlet Gas Receiving & Slug Catcher       [CRITICAL PATH]
    SYS-P02  Inlet Compression
    SYS-P03  Gas Treating (Amine System)               [CRITICAL PATH]

  Week 10-18: CORE PROCESS
    SYS-P04  Molecular Sieve Dehydration               [CRITICAL PATH]
    SYS-P05  Turboexpander / Demethanizer
    SYS-P06  NGL Fractionation Train                   [CRITICAL PATH]
    SYS-P07  Sales Gas Compression & Metering

  Week 16-24: PRODUCT & UTILITIES
    SYS-P08  LPG Storage & Loading
    SYS-P09  Condensate Stabilization & Storage
    SYS-P10  Flare & Blowdown System
    SYS-P11  Hot Oil System
    SYS-P12  Chemical Injection Systems
    SYS-P13  Produced Water Treatment

  Week 22-34: INTEGRATED TESTING & TCCC
    Nitrogen purge and inerting
    Hydrocarbon introduction (controlled feed-in)      [CRITICAL PATH]
    72-hour sustained operation demonstration
    Performance guarantee testing (14 days)
    TCCC and handover to operations                    [CRITICAL PATH]

PREREQUISITE DEPENDENCY HIGHLIGHTS:
  +--------------------+-------------------+---------------------+
  | Dependent System   | Prerequisite      | Type                |
  +--------------------+-------------------+---------------------+
  | P01 Inlet Gas      | U01 Power         | Utility             |
  | P01 Inlet Gas      | U04 Fire Prot.    | Safety (MANDATORY)  |
  | P01 Inlet Gas      | U05 ESD/F&G       | Safety (MANDATORY)  |
  | P03 Gas Treating   | P01 Inlet Gas     | Process             |
  | P03 Gas Treating   | U03 Cooling Water | Utility             |
  | P04 Mol Sieve      | P03 Gas Treating  | Process             |
  | P06 NGL Frac       | P04 Mol Sieve     | Process             |
  | P06 NGL Frac       | P11 Hot Oil       | Utility             |
  | HC Introduction    | ALL safety systems| Safety (MANDATORY)  |
  | HC Introduction    | PSSR Approved     | Regulatory          |
  +--------------------+-------------------+---------------------+

VENDOR SUPPORT MATRIX:
  +-------------------+----------+---------+-------+----------+
  | Vendor            | System   | Arrive  | Weeks | Status   |
  +-------------------+----------+---------+-------+----------+
  | Siemens           | U01,P02  | Week 3  | 6     | Confirmed|
  | BASF Amine        | P03      | Week 8  | 4     | Confirmed|
  | UOP Mol Sieve     | P04      | Week 12 | 3     | Pending  |
  | Atlas Copco       | P02,P07  | Week 7  | 5     | Confirmed|
  | Honeywell DCS     | ALL      | Week 1  | 20    | Confirmed|
  | Cameron Valves    | P01,P10  | Week 6  | 3     | At Risk  |
  +-------------------+----------+---------+-------+----------+
  ACTION: Cameron Valves at risk due to factory delay.
  Mitigation: Pre-position backup valve technician from local service center.
```
