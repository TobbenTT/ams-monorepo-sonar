# Detailed Step-by-Step Execution - model-commissioning-sequence

*Supplementary detail for the step-by-step execution in CLAUDE.md.*
*The primary execution steps are inline in CLAUDE.md. This file provides benchmark duration tables, resource loading templates, and detailed sub-step procedures.*

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
