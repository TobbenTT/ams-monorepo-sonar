# Create Commissioning Plan
## Skill ID: A-COMM-PLAN-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Generate a comprehensive commissioning and startup plan that covers the full spectrum from pre-commissioning through commissioning to Targeted Completion and Certificate of Compliance (TCCC) stages. This skill produces structured plans and schedules that sequence all activities required to safely and systematically bring a plant from mechanical completion to sustained commercial operation.

Commissioning is the critical bridge between project construction and plant operations. A well-structured commissioning plan ensures that all systems are verified, tested, and proven before production begins. Poor commissioning planning is a leading cause of project delays, startup incidents, and extended ramp-up periods. This skill ensures that commissioning activities are logically sequenced, resource-loaded, safety-validated, and aligned with the overall Operational Readiness timeline.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Three-Stage Framework**: The plan must clearly delineate the three commissioning stages:
   - **Pre-Commissioning**: Verification activities after mechanical completion (cleaning, flushing, leak testing, alignment checks, megger testing, loop checks). No process fluids or energy introduction.
   - **Commissioning**: Introduction of utilities and process fluids, functional testing of individual equipment and systems, integrated system testing, performance testing. Progressively energizing and loading systems.
   - **TCCC (Targeted Completion / Certificate of Compliance)**: Final performance guarantee testing, sustained operation demonstration, handover from project to operations, deficiency punch-list resolution.

2. **System-Based Approach**: Commissioning must be planned system-by-system (not area-by-area), following process logic sequence. Each system has defined completion milestones (MC, Pre-comm Complete, Comm Complete, Ready for Startup).

3. **Safety-First Sequencing**: All commissioning activities must be safety-validated. HAZOP close-out, PSSR (Pre-Startup Safety Review), and risk assessments must be completed before energization. Lock-out/Tag-out protocols, safe work permits, and isolation management are integral to the plan.

4. **Resource Integration**: The plan must address the overlap period where construction, commissioning, and operations teams coexist, with clear jurisdictional boundaries and handover protocols.

5. **Punch-List Management**: The plan must incorporate a systematic approach to identifying, categorizing (A/B/C), and resolving deficiencies throughout the commissioning process.

## VSC Failure Modes Table Reference

When referencing equipment failure modes in punch lists, pre-commissioning deficiency logs, or commissioning risk assessments, use the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) for consistent failure classification. Structure: **[WHAT] → [Mechanism] due to [Cause]** (18 mechanisms, 46 causes, 72 combinations).

## Trigger / Invocation

```
/create-commissioning-plan
```

**Aliases**: `/commissioning-plan`, `/startup-plan`, `/plan-comisionamiento`

**Trigger Conditions**:
- Project approaches mechanical completion milestones
- User provides project scope and equipment lists
- User requests commissioning sequence or schedule
- Pre-commissioning checklists are needed
- TCCC criteria definition is required

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Project Scope Document | .docx, .pdf | Project description, facility overview, design capacity, key process parameters |
| Equipment List / Asset Register | .xlsx | Complete equipment list with tag numbers, descriptions, system assignments. Ideally from `create-asset-register` output |
| Project Timeline / Master Schedule | .xlsx, .mpp, .pdf | Overall project schedule showing MC dates, target startup dates, and milestone constraints |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| System Turnover List | .xlsx | Definition of commissioning systems/subsystems with scope boundaries |
| P&IDs | .pdf | Process and Instrumentation Diagrams for system sequencing logic |
| Process Flow Diagrams | .pdf | PFDs for understanding process sequence dependencies |
| HAZOP Close-Out Status | .xlsx | HAZOP recommendations status and pre-startup requirements |
| Vendor Commissioning Procedures | .pdf, .docx | OEM commissioning requirements and procedures per equipment package |
| Commissioning Organization Chart | .docx, .pdf | Proposed commissioning team structure |
| Utility Availability Schedule | .xlsx | When each utility (power, water, air, steam, gas) becomes available |
| Risk Assessment Outputs | .xlsx | From `create-risk-assessment` -- pre-startup risk mitigations |
| Spare Parts Availability | .xlsx | From `create-spare-parts-strategy` -- commissioning spares readiness |
| Operating Procedures Status | .xlsx | Status of SOP development for commissioning support |
| Training Plan Status | .xlsx | Status of operator training and competency for commissioning support |

### Input Validation Rules

- Equipment list must have system assignments for system-based commissioning planning
- Project timeline must include at minimum: MC date, target first feed date, commercial operation date
- Equipment without system assignments are flagged and grouped by area as fallback
- Missing vendor commissioning procedures trigger a recommendation for vendor engagement

## Output Specification

### Primary Output 1: Commissioning Plan (.docx)

**Filename**: `{ProjectCode}_Commissioning_Plan_v{version}_{date}.docx`

**Document Structure (30-60 pages)**:

1. **Executive Summary** (2-3 pages)
   - Project overview and commissioning scope
   - Key milestones and target dates
   - Commissioning strategy summary
   - Critical path items and risks

2. **Introduction & Objectives** (2-3 pages)
   - Purpose of the commissioning plan
   - Commissioning philosophy and approach
   - Success criteria and KPIs
   - Interface with construction and operations

3. **Scope & Boundaries** (3-4 pages)
   - Systems included in commissioning scope
   - Exclusions and limitations
   - Geographic/facility boundaries
   - Phase boundaries (pre-comm, comm, TCCC)

4. **Commissioning Organization** (3-4 pages)
   - Organizational structure and reporting lines
   - Roles and responsibilities matrix (RACI)
   - Commissioning team composition
   - Vendor/OEM support requirements
   - Operations team integration

5. **Safety Management** (4-5 pages)
   - Commissioning safety philosophy
   - PSSR (Pre-Startup Safety Review) requirements
   - Isolation management and LOTO procedures
   - Permit to Work system for commissioning
   - Emergency response during commissioning
   - Simultaneous operations (SIMOPS) management
   - Commissioning-specific risk register summary

6. **System Turnover & Handover Process** (3-4 pages)
   - Mechanical Completion (MC) definition and criteria
   - MC to Pre-Commissioning handover process
   - System transfer documentation requirements
   - Jurisdictional boundaries (construction vs. commissioning vs. operations)
   - Certificate and sign-off requirements

7. **Pre-Commissioning Activities** (5-8 pages)
   - Pre-commissioning scope per system
   - Generic pre-commissioning activities:
     - Piping: cleaning, flushing, pressure testing, leak testing
     - Mechanical: alignment verification, lubrication, rotation checks
     - Electrical: megger testing, cable testing, relay testing, energization
     - Instrumentation: loop checks, calibration, functional testing
     - Civil/Structural: final inspections
   - System-specific pre-commissioning procedures
   - Pre-commissioning completion criteria

8. **Commissioning Activities** (5-8 pages)
   - Commissioning scope per system
   - Utility commissioning sequence (power, water, air, steam, nitrogen)
   - Individual equipment commissioning (no-load, partial load, full load)
   - System integration testing
   - Control system validation (FAT/SAT closeout)
   - Interlock and trip testing
   - Performance testing protocol
   - Commissioning completion criteria

9. **TCCC / Startup & Performance Testing** (4-5 pages)
   - TCCC definition and entry criteria
   - Startup sequence (first feed, line-out, ramp-up milestones)
   - Performance guarantee test protocols
   - Sustained operation demonstration requirements
   - TCCC completion criteria
   - Handover to operations: final certificates

10. **Punch-List Management** (2-3 pages)
    - Deficiency identification and documentation process
    - Punch-list categorization:
      - Category A: Must be resolved before MC acceptance
      - Category B: Must be resolved before energization/commissioning
      - Category C: Can be resolved during commissioning or post-startup
    - Punch-list tracking and resolution workflow
    - Punch-list close-out requirements

11. **Commissioning Schedule Overview** (2-3 pages)
    - Level 2 commissioning schedule summary
    - Critical path identification
    - Key milestones and dependencies
    - Resource loading overview

12. **Logistics & Support** (2-3 pages)
    - Commissioning consumables and chemicals
    - Temporary facilities and equipment
    - Spare parts for commissioning
    - Vendor technical assistance schedule
    - Documentation and records management

13. **Appendices**
    - System turnover list with scope boundaries
    - Pre-commissioning checklist templates
    - Commissioning checklist templates
    - PSSR checklist template
    - Commissioning certificate templates
    - Equipment-specific commissioning procedures summary

### Primary Output 2: Commissioning Schedule (.xlsx)

**Filename**: `{ProjectCode}_Commissioning_Schedule_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Master Schedule"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Activity_ID | Unique activity identifier | COMM-100-001 |
| B | WBS_Code | Work Breakdown Structure code | 3.1.2.1 |
| C | System_ID | Commissioning system | SYS-100-GRINDING |
| D | Phase | Pre-Comm/Comm/TCCC | Pre-Comm |
| E | Activity_Description | Activity description | Piping pressure test - Slurry circuit |
| F | Activity_Description_ES | Spanish description | Prueba de presion tuberias - Circuito pulpa |
| G | Predecessor | Predecessor activity IDs | COMM-100-000 (MC Complete) |
| H | Successor | Successor activity IDs | COMM-100-002 |
| I | Duration_Days | Planned duration | 5 |
| J | Planned_Start | Planned start date | 2026-06-01 |
| K | Planned_Finish | Planned finish date | 2026-06-05 |
| L | Actual_Start | Actual start (for tracking) | |
| M | Actual_Finish | Actual finish (for tracking) | |
| N | % Complete | Progress percentage | 0% |
| O | Float_Days | Schedule float | 3 |
| P | Critical_Path | On critical path? Yes/No | No |
| Q | Responsible_Team | Responsible team | Commissioning - Mechanical |
| R | Vendor_Support | Vendor support required? | No |
| S | Utility_Required | Utilities needed | None (hydraulic test) |
| T | Safety_Permit | Safety permits required | Cold work permit |
| U | Hold_Points | Witness/hold points | Client witness at pressure hold |
| V | Completion_Criteria | How is completion confirmed | Pressure hold 4hrs, no drop >1% |
| W | Deliverable | Output document/certificate | Pressure test certificate |
| X | Notes | Additional notes | |

#### Sheet 2: "System Turnover Matrix"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | System_ID | System identifier |
| B | System_Name | System name |
| C | Area | Plant area |
| D | Equipment_Count | Number of equipment items |
| E | MC_Target_Date | Mechanical completion target |
| F | MC_Actual_Date | Mechanical completion actual |
| G | PreComm_Start | Pre-commissioning start |
| H | PreComm_Complete | Pre-commissioning complete |
| I | Comm_Start | Commissioning start |
| J | Comm_Complete | Commissioning complete |
| K | TCCC_Ready | Ready for TCCC |
| L | Punch_A_Count | Category A punch items |
| M | Punch_B_Count | Category B punch items |
| N | Punch_C_Count | Category C punch items |
| O | Status | Not Started/In Progress/Complete |
| P | Readiness_% | Overall readiness percentage |

#### Sheet 3: "Pre-Commissioning Checklists"
Template checklists by discipline:
- Piping pre-commissioning checklist
- Mechanical pre-commissioning checklist
- Electrical pre-commissioning checklist
- Instrumentation pre-commissioning checklist
- Civil/Structural pre-commissioning checklist

#### Sheet 4: "PSSR Checklist"
Pre-Startup Safety Review checklist covering:
- P&IDs verified and as-built
- Operating procedures in place
- Training completed
- Safety systems tested
- Emergency response plan in place
- Environmental permits obtained
- Regulatory inspections completed

#### Sheet 5: "Milestone Tracker"
Key milestones with planned vs. actual dates:
- MC per system
- First utility available (power, water, air)
- First equipment energization
- First process fluid introduction
- First product
- Performance guarantee test start
- TCCC certificate
- Commercial operation declaration

#### Sheet 6: "Resource Plan"
Commissioning resource requirements:
- Staffing by discipline and phase
- Vendor technical assistance schedule
- Temporary equipment and tools
- Consumables and chemicals
- Budget summary

### Formatting Standards
- Phase color coding: Pre-Comm=Blue (#0066CC), Comm=Orange (#FF8C00), TCCC=Green (#008000)
- Critical path activities: Bold, red border
- Gantt chart bars in Sheet 1 (using conditional formatting or visual representation)
- Status colors: Not Started=Gray, In Progress=Yellow, Complete=Green, Delayed=Red
- Header row: Bold, navy background (#001F3F), white font
- Freeze panes on header row and activity ID columns

## Methodology & Standards

### Primary Standards
- **IEC 62382:2012** - Electrical and instrumentation loop check procedures.
- **ASME PCC-2** - Repair of Pressure Equipment and Piping. Pre-commissioning testing standards.
- **API 686** - Machinery Installation and Installation Design (for rotating equipment commissioning).

### Commissioning Framework Standards
- **ASHRAE Guideline 0** - The Commissioning Process (general commissioning methodology).
- **CII (Construction Industry Institute)** - Best Practices for commissioning and startup.
- **ABS Group / CCPS** - Guidelines for commissioning process safety management.

### Safety Standards for Commissioning
- **API RP 750** - Management of Process Hazards (PSSR requirements).
- **OSHA 29 CFR 1910.119** - Process Safety Management (PSM) - Pre-Startup Safety Review.
- **IEC 61511** - Safety Instrumented Systems commissioning requirements.

### Chilean Standards
- **NCh Elec. 4/2003** - Instalaciones electricas de consumo (electrical commissioning standards).
- **DS 132** - Mining safety regulation (commissioning safety requirements for mining).
- **DS 108** - Reglamento de seguridad para instalaciones y operaciones de gas.

### VSC-Specific Standards
- VSC Commissioning Management Procedure v3.0
- VSC System Turnover Protocol v2.0
- VSC PSSR Standard Checklist v2.5
- VSC Punch-List Management Guide v1.5

## Step-by-Step Execution

### Phase 1: Scope & Planning Framework (Steps 1-3)

**Step 1: Define Commissioning Systems**
- Review equipment list and P&IDs to define commissioning systems
- Group equipment into logical commissioning systems based on process function
- Define system boundaries (what equipment is in each system)
- Establish system numbering convention
- Create System Turnover List with scope boundaries

**Step 2: Establish Sequencing Logic**
- Determine utility commissioning sequence (typically: power > air > water > steam > process)
- Map process-logic dependencies between systems
- Identify which systems must be commissioned first to support downstream systems
- Consider construction completion sequence and constraints
- Identify long-lead commissioning activities (e.g., refractory dry-out, catalyst loading)

**Step 3: Define Completion Criteria**
For each stage, define explicit completion criteria:
- **MC Criteria**: Construction complete per drawings, punch-list Category A cleared, QC documentation complete, as-built drawings available
- **Pre-Commissioning Criteria**: All discipline checks complete, certificates signed, punch-list Category B cleared
- **Commissioning Criteria**: Equipment functionally tested, control systems validated, interlocks proven, system integrated
- **TCCC Criteria**: Performance test passed, sustained operation demonstrated, operations team fully deployed, all training complete

### Phase 2: Activity Development (Steps 4-6)

**Step 4: Develop Pre-Commissioning Activities**
For each system, generate pre-commissioning activities by discipline:

**Piping**:
- Visual inspection and walkdown
- Support and hanger verification
- Flushing (water flush, chemical clean, air blow)
- Pressure testing (hydrostatic or pneumatic)
- Leak testing
- Insulation and heat tracing verification

**Mechanical**:
- Alignment verification (laser alignment for rotating equipment)
- Lubrication system fill and flush
- Rotation check (bump test)
- Vibration baseline measurement
- Guard and safety device verification
- Foundation bolt torque verification

**Electrical**:
- Cable continuity and insulation resistance testing (megger)
- Switchgear inspection and testing
- Transformer testing (ratio, insulation, oil)
- Motor solo run (uncoupled)
- Protection relay testing and coordination
- Grounding system verification
- UPS and emergency power testing

**Instrumentation & Control**:
- Instrument calibration verification
- Loop check (4-20mA, signal to DCS/PLC)
- Control valve stroke testing
- Safety instrumented system (SIS) testing
- DCS/PLC point verification
- Communication network testing
- Alarm rationalization verification

**Step 5: Develop Commissioning Activities**
For each system, generate commissioning activities:
- Utility introduction (energize, pressurize, fill)
- Equipment no-load running test
- Control system functional testing
- Interlock and trip testing
- Individual equipment performance verification
- System integration testing
- Wet testing (process fluid introduction)
- Performance testing (design parameters)

**Step 6: Develop TCCC Activities**
- Pre-Startup Safety Review (PSSR)
- Initial feed introduction sequence
- Line-out and stabilization
- Performance guarantee testing protocol
- Sustained operation demonstration (typically 72 hours)
- Final punch-list resolution
- Handover documentation package preparation
- Operations acceptance and certificate signing

### Phase 3: Schedule Development (Steps 7-8)

**Step 7: Build Commissioning Schedule**
- Assign durations to each activity (based on equipment counts, complexity, and industry benchmarks)
- Link activities with predecessor/successor relationships
- Identify the critical path
- Calculate float for non-critical activities
- Align with master project schedule milestones
- Identify resource constraints and level resources

**Step 8: Resource Loading**
- Assign responsible teams/disciplines to each activity
- Identify vendor support requirements and schedule
- Determine commissioning consumables and chemicals
- Identify temporary equipment needs (test pumps, generators, scaffolding)
- Estimate commissioning spares requirements
- Prepare budget estimate

### Phase 4: Safety & Documentation (Steps 9-10)

**Step 9: Safety Planning**
- Develop commissioning-specific risk register
- Define SIMOPS management requirements
- Establish permit-to-work requirements for commissioning
- Define LOTO requirements during commissioning
- Prepare PSSR checklist
- Define emergency response provisions during commissioning

**Step 10: Generate Outputs**
- Compile Commissioning Plan document with all sections
- Generate Commissioning Schedule workbook with all sheets
- Create pre-commissioning and commissioning checklist templates
- Prepare PSSR checklist
- Generate milestone tracker with baseline dates

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| System coverage (all equipment in a system) | 100% | 100% |
| Activity coverage per system | >95% of standard activities | >90% |
| Predecessor/successor linkage | 100% of activities linked | >95% |
| Safety requirements per activity | 100% identified | >95% |
| Completion criteria defined per stage | 100% | 100% |
| Vendor support requirements identified | 100% of OEM packages | >90% |
| PSSR checklist completeness | 100% of standard items | 100% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Logical Sequencing**: Pre-commissioning always precedes commissioning, which always precedes TCCC. Utility systems must be commissioned before dependent process systems.
- **Safety Integration**: Every activity involving energy introduction (electrical, mechanical, thermal, chemical) must have associated safety requirements.
- **Completeness**: The plan must cover all systems in the equipment list. No system should be missing from the commissioning scope.
- **Practicality**: Durations must be realistic based on equipment counts and complexity. Critical path must be achievable within the project timeline.
- **Handover Clarity**: The boundary between construction, commissioning, and operations jurisdictions must be unambiguous.

### Validation Process
1. System coverage check (all equipment accounted for)
2. Sequencing logic validation (no circular dependencies, correct process sequence)
3. Critical path feasibility against project timeline
4. Safety requirements completeness check
5. PSSR checklist completeness
6. Resource plan feasibility
7. Final quality score calculation

## MCP Integrations

- **mcp-sharepoint**: Store and retrieve commissioning plan documents, system turnover certificates, and PSSR checklists
- **mcp-jira**: Track commissioning task progress, punch-list items, and milestone completion across systems
- **mcp-cmms**: Retrieve equipment data, tag numbers, and system assignments for commissioning planning

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment list + system assignments | Provides structured equipment data with system groupings |
| `create-risk-assessment` | Pre-startup risks | Provides risk mitigations that must be in place before commissioning |
| `create-spare-parts-strategy` | Commissioning spares | Confirms availability of required spare parts for commissioning |
| `create-maintenance-strategy` | PM requirements | Identifies maintenance tasks needed during commissioning |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-rampup-plan` | Commissioning completion | Ramp-up plan begins where commissioning/TCCC ends |
| `create-shutdown-plan` | System knowledge | System definitions from commissioning used for shutdown planning |
| `create-kpi-dashboard` | Commissioning KPIs | Progress metrics, punch-list statistics, milestone tracking |
| `create-or-framework` | Milestone alignment | Commissioning milestones integrate into OR stage-gate framework |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-playbook` | Phase alignment | Commissioning activities align with OR Playbook phase definitions |
| Training Agent | Training schedule | Operator training must be aligned with commissioning timeline |
| Procedure Development Agent | SOP availability | Operating procedures must be available before commissioning |

## Templates & References

### Templates
- `templates/commissioning_plan_template.docx` - Plan document template with VSC branding
- `templates/commissioning_schedule_template.xlsx` - Schedule template with standard activities
- `templates/precomm_checklist_piping.xlsx` - Piping pre-commissioning checklist
- `templates/precomm_checklist_mechanical.xlsx` - Mechanical pre-commissioning checklist
- `templates/precomm_checklist_electrical.xlsx` - Electrical pre-commissioning checklist
- `templates/precomm_checklist_instrument.xlsx` - Instrumentation pre-commissioning checklist
- `templates/pssr_checklist_template.xlsx` - Pre-Startup Safety Review checklist
- `templates/system_turnover_certificate.docx` - System handover certificate template
- `templates/commissioning_certificate.docx` - Commissioning completion certificate

### Reference Documents
- IEC 62382:2012 - Loop check procedures
- API 686 - Machinery installation and commissioning
- CII Best Practices - Commissioning and startup
- VSC Commissioning Management Procedure v3.0
- VSC System Turnover Protocol v2.0

### Reference Datasets
- Standard pre-commissioning activity library by discipline
- Commissioning duration benchmarks by equipment type
- Typical utility commissioning sequence templates
- Industry-standard PSSR checklist items

## Examples

### Example System Turnover Matrix

```
SYSTEM TURNOVER MATRIX - PROJECT ALPHA
=======================================

| System_ID      | System Name              | Area | Equip | MC Target  | PreComm    | Comm       | TCCC Ready | Punch A | Punch B | Status      |
|----------------|--------------------------|------|-------|------------|------------|------------|------------|---------|---------|-------------|
| SYS-UTIL-PWR   | Electrical Power Dist.   | UTL  | 45    | 2026-05-01 | 2026-05-15 | 2026-06-01 | 2026-06-15 | 0       | 3       | In Progress |
| SYS-UTIL-AIR   | Compressed Air System    | UTL  | 12    | 2026-05-10 | 2026-05-20 | 2026-06-05 | 2026-06-20 | 0       | 1       | In Progress |
| SYS-UTIL-WAT   | Process Water System     | UTL  | 18    | 2026-05-15 | 2026-05-25 | 2026-06-10 | 2026-06-25 | 2       | 5       | Not Started |
| SYS-100-CRUSH  | Primary Crushing         | 100  | 35    | 2026-06-01 | 2026-06-15 | 2026-07-01 | 2026-07-20 | 5       | 12      | Not Started |
| SYS-100-GRIND  | Grinding Circuit         | 100  | 48    | 2026-06-15 | 2026-07-01 | 2026-07-20 | 2026-08-10 | 8       | 18      | Not Started |
| SYS-200-FLOAT  | Flotation Circuit        | 200  | 52    | 2026-07-01 | 2026-07-15 | 2026-08-01 | 2026-08-20 | 3       | 8       | Not Started |
| SYS-300-THICK  | Thickening & Filtration  | 300  | 28    | 2026-07-15 | 2026-07-25 | 2026-08-10 | 2026-08-25 | 1       | 4       | Not Started |

COMMISSIONING SEQUENCE:
  Power --> Air --> Water --> Crushing --> Grinding --> Flotation --> Thickening
  (Utility systems must be commissioned first to support process systems)

CRITICAL PATH: Power --> Grinding --> Flotation (longest path to TCCC)
```

### Example Pre-Commissioning Checklist Entry

```
PRE-COMMISSIONING CHECKLIST - MECHANICAL
System: SYS-100-GRIND (Grinding Circuit)
Equipment: 100-ML-001 (SAG Mill)

| Item | Check Description                           | Acceptance Criteria              | Status    | Sign-Off | Date |
|------|---------------------------------------------|----------------------------------|-----------|----------|------|
| M-01 | Foundation bolts torqued to specification    | Per vendor torque table           | Complete  | JR       | 6/15 |
| M-02 | Sole plate grouting cured and inspected     | 28-day cure, no cracks           | Complete  | JR       | 6/14 |
| M-03 | Mill shell alignment verified               | Within 0.05mm/m                  | Complete  | JR       | 6/16 |
| M-04 | Bearing clearances checked                  | Per vendor specification          | Pending   |          |      |
| M-05 | Lubrication system flushed and filled       | Oil cleanliness NAS 7            | Pending   |          |      |
| M-06 | Girth gear alignment and backlash           | Backlash 1.5-2.0mm              | Pending   |          |      |
| M-07 | Liner bolts torqued                         | Per vendor torque table           | Pending   |          |      |
| M-08 | Mill rotation check (barring device)        | Smooth rotation, no interference  | Not Start |          |      |
| M-09 | Guards and safety devices installed         | All guards per drawing            | Not Start |          |      |
| M-10 | Vibration sensor installation verified      | Per monitoring spec               | Not Start |          |      |

Overall Pre-Comm Status: 30% Complete (3/10 items)
```
