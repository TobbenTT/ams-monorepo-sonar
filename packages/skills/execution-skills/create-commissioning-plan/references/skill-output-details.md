# Detailed Output Specification - create-commissioning-plan

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---


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
