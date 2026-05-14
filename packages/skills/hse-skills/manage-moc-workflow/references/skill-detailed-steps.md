# Detailed Step-by-Step Execution - manage-moc-workflow

*Full detailed execution steps extracted from SKILL.md.*
*Read this file when executing the skill for complete step-by-step instructions.*

---

## Step-by-Step Execution

### Phase 1: MOC Initiation & Classification (Steps 1-3)

**Step 1: Receive and Validate Change Request**
1. Receive change request from originator (via mcp-teams, mcp-outlook, or direct input)
2. Validate that the request describes an actual change (not a replacement-in-kind):
   - Replacement-in-kind (RIK): same specification, same materials, same design -- document but does not require MOC
   - Change: any deviation from current process safety information -- requires MOC
   - When in doubt: treat as a change (conservative approach)
3. Validate completeness of required information:
   - Change description is specific and unambiguous
   - Affected systems and equipment are identified by tag number
   - Justification is documented
   - Proposed timeline is stated
4. Assign MOC number: MOC-{SiteCode}-{Year}-{Sequence}
5. Register MOC in the MOC tracking database (mcp-sharepoint)
6. Send acknowledgment to originator with MOC number and expected timeline

**Step 2: Classify the Change**
1. Determine change type:
   - **Process**: Changes to process parameters (temperature, pressure, flow, composition, setpoints)
   - **Equipment**: Changes to equipment (new equipment, modified equipment, different materials/capacity)
   - **Technology**: Changes to process control systems, software, automation, instrumentation
   - **Procedural**: Changes to operating procedures, maintenance procedures, emergency procedures
   - **Organizational**: Changes to staffing structure, roles, responsibilities, shift patterns
   - **Temporary**: Any change with a defined end date (max 90 days)
   - **Emergency**: Changes implemented immediately for safety; retroactive documentation required
2. Determine classification level (Minor/Moderate/Major/Critical) using the classification matrix:
   - Assess whether process safety information is affected
   - Assess whether safety instrumented systems are affected
   - Assess the number of systems/areas affected
   - Assess whether operating envelope changes
3. Determine required risk assessment methodology based on classification
4. Determine required approval authority chain based on classification
5. Estimate MOC timeline based on classification and complexity
6. Notify originator of classification, required approvals, and expected timeline

**Step 3: Initiate Impact Assessment**
1. Identify all domains potentially affected by the change:
   - Process Safety Information (P&IDs, PFDs, process data sheets, equipment data sheets)
   - Operating Procedures (SOPs, EOPs, startup/shutdown procedures)
   - Maintenance Procedures (PM tasks, inspection procedures, spare parts lists)
   - Training Requirements (operator training, maintenance training, emergency drills)
   - Safety Instrumented Systems (SIS logic, alarm setpoints, trip settings)
   - Emergency Response Plans (fire response, evacuation, spill response)
   - Environmental Compliance (permits, emissions, discharges, waste management)
   - Regulatory Requirements (operating licenses, regulatory notifications)
   - CMMS/Asset Data (equipment parameters, BOMs, functional locations)
   - Spare Parts Inventory (new parts required, obsolete parts removed)
   - Alarm Management (new alarms, modified alarms, rationalization)
   - Insurance (property values, risk profile, notifications)
2. Generate impact assessment forms for each affected domain
3. Route impact assessment forms to responsible subject matter experts via mcp-outlook
4. Set due dates for impact assessment returns (typically 5-10 business days)
5. Track impact assessment status and send reminders at 50% and 75% of due date

### Phase 2: Risk Assessment & Approval (Steps 4-7)

**Step 4: Consolidate Impact Assessments**
1. Collect all returned impact assessments
2. Follow up on overdue assessments (escalate via mcp-teams if >2 days late)
3. Consolidate findings into the Impact Assessment Matrix
4. Identify total scope of implementation actions required
5. Estimate total implementation cost and duration
6. Flag any showstopper findings that may require the change to be reconsidered
7. Prepare consolidated impact summary for risk assessment team

**Step 5: Coordinate Risk Assessment**
1. Select risk assessment methodology based on MOC classification:
   - Minor: Documented What-If analysis (by area supervisor and process engineer)
   - Moderate: What-If analysis or Checklist HAZOP (3-5 participants, 2-4 hours)
   - Major: Full HAZOP node review for affected nodes (5-8 participants, 1-2 days)
   - Critical: Full HAZOP + LOPA + Independent Review (8-12 participants, 2-5 days)
2. Schedule risk assessment session via mcp-teams
3. Prepare risk assessment materials:
   - Current P&IDs and process description
   - Proposed change description with markups
   - Impact assessment summary
   - Previous incident/near-miss data for similar changes
   - Relevant industry incident data (CSB investigations, CCPS process safety beacons)
4. Conduct risk assessment:
   - Identify hazards introduced or modified by the change
   - Assess risk before mitigation (using site risk matrix)
   - Identify safeguards and mitigations (existing and proposed)
   - Assess residual risk after mitigation
   - Document findings, recommendations, and action items
5. If risk is unacceptable: return to originator with recommendations to modify the change
6. If risk is acceptable: proceed to approval routing

**Step 6: Route for Approval**
1. Generate approval package including:
   - MOC cover sheet with classification and risk level
   - Change description and justification
   - Impact assessment matrix (consolidated)
   - Risk assessment findings and recommendations
   - Implementation action plan with timeline and cost
   - PSSR requirements (if applicable)
2. Route to required approvers based on classification:
   - Minor: Area Supervisor
   - Moderate: Operations Manager + HSE Manager
   - Major: Plant Manager + HSE Manager + Engineering Manager
   - Critical: VP Operations + Corporate HSE Director + Plant Manager
3. Send approval package via mcp-outlook with clear decision request
4. Track approval status daily:
   - Send reminder at 3 days if no response
   - Send escalation at 5 days if no response
   - Notify originator and management at 7 days if still pending
5. Record approvals with dates, signatures, and any conditions
6. Handle rejection: document rejection reason, notify originator, archive MOC as rejected

**Step 7: Handle Approval Conditions**
1. If approved with conditions (common):
   - Document all conditions clearly
   - Assign condition owners and due dates
   - Track condition fulfillment
   - Conditions must be met before implementation can proceed
2. If partially approved:
   - Identify which parts are approved and which require further work
   - Communicate scope limitations to implementation team
3. If approved:
   - Notify all stakeholders of approval via mcp-teams
   - Release implementation actions for execution
   - Update MOC status to "IN IMPLEMENTATION"

### Phase 3: Implementation & Verification (Steps 8-12)

**Step 8: Execute Implementation Actions**
1. Release implementation action tracker to all responsible parties
2. Track action completion daily/weekly based on criticality:
   - Critical path actions: daily tracking
   - Non-critical actions: weekly tracking
3. Coordinate sequencing of implementation actions:
   - P&ID updates before procedure revisions (procedures reference drawings)
   - Procedure revisions before training (training uses current procedures)
   - Training before operational startup (operators must be trained)
   - CMMS updates before PM task activation
   - Spare parts procurement before equipment modification
4. Track evidence of completion for each action:
   - Updated document numbers and revision letters
   - Training attendance records
   - CMMS change confirmation screenshots
   - Procurement order confirmations
5. Send weekly implementation status summary to MOC originator and approvers

**Step 9: Coordinate Training Requirements**
1. Identify all personnel affected by the change:
   - Operators who use affected procedures
   - Maintenance technicians who maintain affected equipment
   - Emergency responders if emergency response is affected
   - Supervisors who authorize affected activities
2. Determine training method and content:
   - Classroom briefing for simple procedural changes (30-60 minutes)
   - Hands-on training for equipment modifications (2-4 hours)
   - Full competency assessment for complex process changes (1-2 days)
   - Tabletop exercise for emergency response changes (2-4 hours)
3. Schedule training sessions via mcp-teams
4. Track training completion:
   - Maintain attendance records with signatures
   - Verify comprehension (test or practical demonstration for significant changes)
   - Document training materials used
5. Training must be complete before the change becomes operational (per OSHA 29 CFR 1910.119(l)(3))

**Step 10: Coordinate PSSR (if required)**
1. Determine if PSSR is required:
   - Required: Equipment modifications, process changes affecting PSI, SIS modifications
   - Not required: Procedural changes only, organizational changes
   - Judgment: Technology changes assessed case-by-case
2. If required, invoke prepare-pssr-package (I-04) skill:
   - Pass MOC documentation as input
   - Specify MOC-specific PSSR scope (focused on areas of change)
   - Ensure PSSR team includes MOC originator
3. Track PSSR completion:
   - PSSR must be completed before the change becomes operational
   - PSSR findings may generate additional implementation actions
   - HOLD items from PSSR must be resolved before startup
4. If PSSR is "NOT APPROVED":
   - Escalate to MOC approvers immediately
   - Change cannot become operational until PSSR is approved

**Step 11: Verify Implementation Completeness**
1. Before authorizing the change to become operational, verify:
   - All implementation actions marked "COMPLETE" with evidence
   - All training completed and documented
   - All approval conditions met
   - PSSR approved (if required)
   - All affected documentation updated and controlled
   - CMMS/asset data updated
   - Environmental/regulatory notifications sent (if required)
2. Generate implementation verification checklist
3. Conduct physical verification (if equipment change):
   - Field walkdown to verify installation matches approved design
   - Valve lineup verification
   - Instrument calibration verification
   - Safety device testing (if affected)
4. Obtain implementation verification signature from responsible engineer

**Step 12: Close MOC**
1. When all implementation actions are verified complete:
   - Generate MOC closure package
   - Obtain closure signatures from: originator, area supervisor, HSE representative
   - Update MOC status to "CLOSED"
   - Record closure date and final status
2. For temporary changes:
   - If expired: verify reversal to original condition
   - If converting to permanent: generate new permanent MOC
   - Document actual removal/restoration date
   - Verify reversal verification signature
3. Archive complete MOC package in mcp-sharepoint:
   - All forms, assessments, approvals, implementation evidence, PSSR records
   - Maintain for minimum 5 years (or per regulatory requirement, whichever is longer)
4. Update MOC register with final data

### Phase 4: Analytics & Continuous Improvement (Steps 13-14)

**Step 13: Generate MOC Analytics Report**
1. Monthly/quarterly MOC analytics:
   - Total MOCs initiated, approved, rejected, closed
   - Average cycle time by classification level
   - Implementation action closure rate (target: >95% on time)
   - Temporary change expiration compliance (target: 100%)
   - Overdue action items (target: zero)
   - MOC volume by department and type
   - Repeat changes (same equipment/system changed multiple times)
2. Identify trends and patterns:
   - Departments with highest MOC volume (may indicate design issues)
   - Recurring change types (may indicate systemic problems)
   - Approval bottlenecks (slow approvers)
   - Implementation quality issues (actions closed without adequate evidence)
3. Correlate with safety performance:
   - Near-miss events related to changes
   - Incidents involving recently-changed systems
   - OSHA/regulatory audit findings related to MOC

**Step 14: Audit and Improve MOC Process**
1. Conduct annual MOC process audit:
   - Sample 10-20% of closed MOCs for quality review
   - Verify all elements complete and adequately documented
   - Verify training records match affected personnel
   - Verify P&IDs and procedures updated to reflect changes
   - Check for "normalization of deviance" -- accumulated minor changes
2. Benchmark MOC process against CCPS best practices
3. Identify improvement opportunities:
   - Process simplification (without reducing rigor)
   - Tool improvements (automation, digital workflows)
   - Training improvements (MOC awareness, RIK vs. change determination)
4. Update MOC procedure based on audit findings
5. Report audit results to management

---
