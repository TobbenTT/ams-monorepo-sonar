# Detailed Step-by-Step Execution - manage-loop-checking

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: Setup and Data Preparation (Steps 1-4)

**Step 1: Ingest and Validate Instrument Index and IO List**
- Receive instrument index from mcp-sharepoint (engineering document library)
- Validate completeness: every instrument tag must have type, range, P&ID reference, and IO assignment
- Cross-reference with IO list: every tag in instrument index must appear in IO list with valid controller/module/channel assignment
- Flag discrepancies: tags in IO list not in instrument index (orphan IOs), tags in instrument index without IO assignment (unconnected instruments)
- Generate validation report with discrepancy count, resolution actions, and data quality score
- Store validated instrument master in project-database as the single source of truth

**Step 2: Generate Loop Check Packages by System**
- Group instruments by system/subsystem based on P&ID reference or area code
- For each system, generate loop check package containing:
  - Loop check summary sheet (all loops in the system with status tracking columns)
  - Individual loop check sheets per loop (populated from instrument index and IO list data)
  - Test procedure for each loop type (standardized per methodology above)
  - Acceptance criteria pre-populated from engineering data (ranges, accuracy, response time)
- Calculate statistics: total loops per system, loops by type, estimated testing duration (based on industry norms: 30 min/analog loop, 15 min/digital loop, 60 min/SIL loop)
- Store loop check packages in mcp-sharepoint (commissioning library) and create tracking records in project-database

**Step 3: Ingest and Validate Alarm Database**
- Receive alarm database export from DCS/PLC vendor (via mcp-sharepoint or direct upload)
- Validate structure: every alarm must have tag, alarm type, setpoint, priority, and enabled/disabled status
- Cross-reference with instrument index: every alarm tag must correspond to a valid instrument
- Flag issues: alarms on non-existent tags, alarms with default (likely incorrect) setpoints, alarms with no priority assigned
- Calculate baseline alarm statistics:
  - Total configured alarms
  - Alarms per operator position (target: < 300 per EEMUA 191)
  - Priority distribution (% Critical/High/Medium/Low)
  - Alarms per P&ID (indicator of over-alarming in specific areas)
- Generate alarm database health report

**Step 4: Obtain Process Design Basis for Alarm Setpoint Verification**
- Retrieve process design basis from mcp-sharepoint (engineering documents)
- For each process variable with alarms:
  - Document normal operating range (startup, steady-state, shutdown)
  - Document safety limits (relief valve settings, design limits)
  - Document control targets (setpoints, operating windows)
- Map alarm setpoints against process conditions:
  - Verify HH alarm < safety limit (must provide warning before safety system activates)
  - Verify H alarm within operational range (not so tight it alarms during normal variation)
  - Verify L alarm provides meaningful early warning of low condition
  - Verify LL alarm provides sufficient time for operator response before safety consequence
- Flag alarms with setpoints outside reasonable range (potential configuration errors)

### Phase 2: Loop Check Execution Management (Steps 5-8)

**Step 5: Coordinate Loop Check Execution Scheduling**
- Interface with commissioning schedule (from model-commissioning-sequence R-01) to align loop check execution with system commissioning sequence
- Generate daily/weekly loop check work plans:
  - Prioritize: safety systems first, then process-critical loops, then monitoring loops
  - Group by physical area to minimize field travel
  - Coordinate with electrical energization schedule (cannot test until power available)
  - Coordinate with DCS commissioning team (cannot test DCS points until controller commissioned)
- Distribute work plans to I&C commissioning teams via mcp-outlook
- Track resource allocation: I&C technicians, test equipment, DCS support

**Step 6: Track Loop Check Progress in Real Time**
- Update project-database loop check tracker as results are reported:
  - PASS: Loop verified, mark complete with date and checker initials
  - FAIL: Loop failed, create punch list item with failure description, assign for resolution
  - DEFERRED: Loop cannot be tested (prerequisite not met), document reason and expected test date
  - NOT APPLICABLE: Loop removed from scope (with engineering approval documentation)
- Calculate completion metrics:
  - Overall completion % (total and by system)
  - Pass rate (passes / completed tests)
  - Failure rate by category (wiring errors, calibration issues, DCS configuration, instrument defects)
  - Completion velocity (loops completed per day, trending to forecast completion date)
- Update dashboard in project-database / mcp-powerbi (via track-or-deliverables H-02)
- Generate daily flash report for commissioning management

**Step 7: Manage Failed Loop Resolution**
- For each failed loop check:
  - Classify failure type: wiring error, calibration out-of-tolerance, DCS configuration error, instrument hardware defect, cable damage, junction box issue
  - Assign to responsible party: I&C contractor (wiring), instrument vendor (hardware), DCS vendor (configuration), commissioning team (re-test)
  - Set priority based on loop criticality: safety loops = 24h resolution target, process-critical = 48h, monitoring = 1 week
  - Track resolution progress in project-database
  - Generate re-test work orders when resolution reported
  - Verify re-test results and update loop check status
- Analyze failure patterns:
  - If >10% failure rate in a system: flag for systemic investigation (bulk wiring issue, wrong cable type, vendor defect batch)
  - Pareto of failure types: drive corrective actions for top failure categories
  - Report failure trends to commissioning management

**Step 8: Verify Safety Instrumented Systems (SIS) Loops**
- For all SIL-rated loops (from cause and effect matrix / SIS specification):
  - Verify loop check completed with enhanced test procedure per IEC 61511
  - Verify SIF function test documented (input-to-output verification through logic solver)
  - Verify proof test results within SIL requirements (response time, accuracy, diagnostic coverage)
  - Verify bypass/override management documented (temporary bypasses for commissioning tracked)
  - Cross-reference with SIF verification records from SIS vendor
- Produce SIS loop verification summary as a separate deliverable for PSSR package
- Flag any SIS loops not fully verified as HOLD items for PSSR

### Phase 3: Alarm Rationalization (Steps 9-12)

**Step 9: Conduct Alarm Rationalization Workshops**
- Organize alarm rationalization sessions by system (typically 50-200 alarms per system):
  - Participants: operations representative, process engineer, instrument engineer, HSE representative
  - Duration: typically 100-150 alarms per 8-hour session (EEMUA 191 guidance)
  - Material: alarm database extract, P&IDs, process design basis, HAZOP study
- For each alarm, systematically determine:
  1. Is this a valid alarm? (Does it require operator action? If not, reclassify as diagnostic or remove)
  2. What is the consequence if the operator does not respond? (Determines priority)
  3. What is the correct operator response? (Must be specific, not "investigate")
  4. What is the available response time? (Determines priority and display requirements)
  5. Is the setpoint correct for process conditions? (Verify against design basis)
  6. Is this alarm duplicated by another alarm? (Eliminate redundancy)
  7. Is the deadband sufficient to prevent chattering? (Minimum 1-2% of span)
- Document rationalization basis for every alarm in the alarm rationalization register
- Track workshop progress and alarm rationalization completion per system

**Step 10: Implement Alarm Configuration Changes**
- Compile all alarm configuration changes from rationalization:
  - Alarms to remove (no operator action required)
  - Alarms to reclassify (change priority based on consequence analysis)
  - Alarms to re-setpoint (adjust based on process design basis verification)
  - Alarms to add (identified during rationalization as missing protection)
  - Deadband adjustments (prevent chattering)
- Produce alarm configuration change request document for DCS vendor
- Verify implementation: compare post-change alarm database against rationalized register
- Run acceptance test: simulate alarm conditions for sample of modified alarms to verify correct behavior
- Update alarm master register with "as-implemented" status

**Step 11: Develop Startup Alarm Shelving Plan**
- Define startup phases for the facility:
  - Phase 1: Cold commissioning (utilities energized, no process media)
  - Phase 2: Hot commissioning (heat-up, catalyst loading, or equivalent pre-startup activities)
  - Phase 3: Process introduction (first feed / hydrocarbons / chemicals introduced)
  - Phase 4: Ramp-up (increasing throughput toward design rate)
  - Phase 5: Steady-state operation (design conditions achieved)
- For each alarm in the rationalized database:
  - Determine the earliest startup phase at which the alarm is meaningful
  - Classify as ACTIVE (alarm operational) or SHELVED (alarm suppressed) for each phase
  - Safety-critical alarms (linked to SIS or HAZOP critical recommendations): NEVER shelved; ACTIVE in all phases
  - Process alarms: shelved during phases where the process variable is expected to be outside normal range
  - Equipment protection alarms (bearing temperature, vibration): ACTIVE from equipment energization onward
- Define automatic transition rules:
  - Phase transition triggers (e.g., "Phase 3 begins when feed flow exceeds 10% of design rate")
  - Automatic un-shelving of alarms as phase transitions occur
  - Maximum shelving duration (no alarm shelved >72 hours without re-authorization)
- Produce startup alarm shelving plan document for operator training and DCS implementation
- Produce DCS configuration specification for alarm shelving automation

**Step 12: Produce Alarm System Performance Baseline**
- Configure alarm system performance monitoring per EEMUA 191 KPIs:
  - Alarm rate per operator per 10-minute period (average, peak, distribution)
  - Standing alarm count (alarms active for >24 hours)
  - Chattering alarm count (alarms that activate >3 times per minute)
  - Stale alarm count (alarms active >7 days)
  - Most frequent alarms (top 10 "bad actor" alarms by count)
  - Alarm priority distribution (should match rationalized plan)
- Set baseline targets for first 30 days of operation
- Configure alarm KPI dashboard in mcp-powerbi for ongoing monitoring
- Schedule 30-day post-startup alarm system review

### Phase 4: Integration and Certification (Steps 13-16)

**Step 13: Generate Integrated Instrumentation Readiness Assessment**
- Compile unified readiness view per system:
  - Loop check completion: X of Y loops passed (Z%)
  - Failed loops: X items on punch list, Y resolved, Z remaining
  - Alarm rationalization: X of Y alarms rationalized (Z%)
  - Alarm configuration: X of Y changes implemented and verified (Z%)
  - SIS verification: X of Y SIFs tested and documented (Z%)
  - Startup alarm plan: Complete/In Progress/Not Started
- Calculate weighted readiness score:
  - SIS verification weight: 3x (safety-critical)
  - Loop checks weight: 2x (functional verification)
  - Alarm rationalization weight: 2x (operational effectiveness)
  - Startup alarm plan weight: 1x (operational efficiency)
- Generate readiness report for commissioning management and PSSR team

**Step 14: Produce Loop Check Completion Certificates**
- For each system where loop checks are 100% complete (or approved deferred items documented):
  - Generate formal loop check completion certificate
  - List all loops tested with results
  - Document any deferred items with approved deferral rationale
  - Obtain signatures: Commissioning I&C Lead, Commissioning Manager, Operations Representative
  - Store certificate in mcp-sharepoint (commissioning records library)
  - Link certificate to PSSR checklist item (for prepare-pssr-package DOC-04)

**Step 15: Support PSSR Package with Instrumentation Evidence**
- Provide to prepare-pssr-package (DOC-04) skill:
  - Loop check completion certificates per system
  - Alarm rationalization register (showing all alarms reviewed and classified)
  - SIS verification summary
  - Startup alarm shelving plan
  - Any open instrumentation punch list items with resolution plans
  - Statement of instrumentation commissioning readiness per system
- Flag any instrumentation-related HOLD items for PSSR (unverified safety loops, un-rationalized safety alarms)

**Step 16: Transition to Operational Alarm Management**
- Hand over alarm rationalization register to operations team as the "Master Alarming Document" (MAD)
- Hand over alarm KPI monitoring configuration to operations
- Configure ongoing alarm performance reporting (monthly alarm system health report)
- Schedule first post-startup alarm rationalization review (typically 90 days after steady-state achieved)
- Document lessons learned from commissioning alarm management for future projects
- Archive all commissioning records in mcp-sharepoint per document retention policy

---
