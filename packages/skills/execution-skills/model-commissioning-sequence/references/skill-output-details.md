# Detailed Output Specification - model-commissioning-sequence

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---


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
