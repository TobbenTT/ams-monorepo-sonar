# Examples - manage-moc-workflow

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Process Parameter Change MOC

```
Command: manage-moc-workflow initiate --type process

Input:
  Originator: Carlos Mendez, Operations Superintendent
  Change: Increase cyclone feed pump discharge pressure setpoint from
          28 bar to 32 bar to improve cyclone classification efficiency.
  Affected Equipment: PP-3201A/B, PI-3201, PIC-3201
  Justification: Process optimization study shows 32 bar discharge pressure
                 improves classification efficiency by 8%, increasing overall
                 copper recovery by 0.3%.

Process:
  Step 1: Validated change request; assigned MOC-MDP-2026-047
  Step 2: Classification:
    - Type: Process (operating parameter change)
    - PSI Affected: Yes (operating limits in process data sheet)
    - SIS Impact: Assessed - High-pressure trip at 35 bar unchanged; adequate margin
    - Classification: MODERATE
    - Risk assessment: What-If analysis required
    - Approval: Operations Manager + HSE Manager

  Step 3: Impact assessment routed to 12 domains
    Results (consolidated):
    - Process Safety Info: YES - Update PDS-100-003 operating pressure range
    - Operating Procedures: YES - Revise SOP-100-005 startup/normal operation setpoints
    - Maintenance: YES - Review pump seal and gasket specifications for higher pressure
    - Training: YES - Brief 12 operators on new operating parameters
    - SIS: NO - High-pressure trip at 35 bar provides adequate margin
    - Emergency Response: NO - No change to emergency scenarios
    - Environmental: NO - No change to emissions or discharges
    - CMMS: YES - Update equipment operating parameters in SAP
    - Spare Parts: MAYBE - Higher pressure may increase seal failure rate (review)
    - Alarm Management: YES - High-pressure alarm needs review (currently at 31 bar)

  Step 5: Risk Assessment (What-If):
    - What if pressure exceeds 35 bar? -> Trip activates, safe shutdown (existing safeguard)
    - What if seal fails at higher pressure? -> Same consequence as current, slightly higher
      probability. Mitigation: verify seal rating >= 40 bar (confirmed by vendor)
    - What if alarm at 31 bar causes nuisance trips at 32 bar operating? -> CRITICAL:
      Must raise high-pressure alarm to 33.5 bar BEFORE change
    - Risk level: MEDIUM (acceptable with alarm modification)

  Step 6: Approval obtained: Operations Manager (Day 3), HSE Manager (Day 5)
    Condition: Alarm setpoint modification must be completed simultaneously

  Implementation Actions (7 items):
    IMP-001: Update PDS-100-003 (Process Engineer, 5 days)
    IMP-002: Revise SOP-100-005 (Ops Engineer, 7 days)
    IMP-003: Submit Alarm MOC for setpoint change 31->33.5 bar (Alarm Lead, 3 days)
    IMP-004: Brief 12 operators (Training Coordinator, 3 sessions x 1 hour)
    IMP-005: Update SAP equipment parameters (CMMS Admin, 1 day)
    IMP-006: Verify pump seal rating (Maintenance Engineer, 2 days)
    IMP-007: PSSR not required (parameter change within equipment design limits)

  All actions completed in 15 business days. MOC closed Day 18.

Output:
  "MOC-MDP-2026-047 CLOSED.
   Change implemented: Cyclone feed pump pressure increased 28->32 bar.
   All 7 implementation actions verified complete.
   12 operators trained. Alarm setpoint updated. Procedures revised.
   No PSSR required (within equipment design limits).
   Expected benefit: 0.3% improvement in Cu recovery."
```

### Example 2: Emergency MOC for Safety-Critical Situation

```
Command: manage-moc-workflow initiate --type emergency

Input:
  Originator: Pedro Silva, HSE Manager
  Emergency: Pressure relief valve PSV-5101 on ammonia storage tank found to be
            set 15% above design pressure during routine inspection. Tank currently
            in service with 80% inventory. Temporary shim installed to reduce set
            pressure to correct value. Requires retroactive MOC documentation.
  Implemented: 2026-04-10 at 14:30 (emergency response)

Process:
  Step 1: Emergency MOC registered: MOC-MDP-2026-E003
    - Emergency classification: CRITICAL (safety-critical equipment, ammonia)
    - Retroactive documentation deadline: 72 hours (2026-04-13)

  Step 2: Emergency actions verified:
    - Temporary shim installed by certified PSV technician
    - Set pressure verified by pop test: 12.5 bar (design: 12.5 bar)
    - Temporary change documented with expiration: 30 days
    - Permanent repair (PSV rebuild or replacement) to be scheduled

  Impact Assessment (expedited):
    - PSI: YES - Update PSV data sheet with inspection findings
    - Maintenance: YES - Schedule PSV removal and bench test/rebuild
    - Spare Parts: YES - Order replacement PSV spring assembly
    - Regulatory: YES - Notify SERNAGEOMIN of safety device non-conformance
    - Investigation: YES - Determine root cause (incorrect spring, calibration drift?)

  Risk Assessment (retroactive HAZOP review):
    - Scenario: PSV did not protect at design pressure during overpressure event
    - Consequence: Potential ammonia release (PSM-covered process)
    - Probability: Low (overpressure event would need to occur during the window)
    - Compensating measures: Correct shim installed, verified by pop test,
      process operating within normal parameters, operators briefed
    - Determination: Emergency response was appropriate and timely

  Approval (retroactive):
    - Plant Manager: Approved (Day 1, emergency authority invoked)
    - HSE Manager: Approved (Day 1, as originator)
    - Corporate HSE: Notified and approved (Day 2)
    - SERNAGEOMIN: Notified per regulatory requirement (Day 2)

Output:
  "MOC-MDP-2026-E003 (EMERGENCY) documented and approved retroactively.
   Emergency response verified appropriate.
   Temporary change (shim) authorized for 30 days.
   Permanent MOC MOC-MDP-2026-048 initiated for PSV rebuild/replacement.
   Root cause investigation initiated (target: 14 days).
   Regulatory notification submitted to SERNAGEOMIN."
```

### Example 3: Temporary Change Approaching Expiration

```
Trigger: Automated daily scan of temporary changes approaching expiration

Process:
  Scan results (3 items requiring attention):

  1. MOC-MDP-2026-T012: Temporary bypass on level transmitter LT-2105
     - Installed: 2026-02-15 | Expires: 2026-05-16 (in 14 days)
     - Reason: Transmitter failed; replacement on order (8-week lead time)
     - Status: Replacement received, installation scheduled for 2026-05-10
     - Action: ON TRACK - Removal scheduled before expiry

  2. MOC-MDP-2026-T008: Temporary operating procedure for manual valve operation
     - Installed: 2026-01-20 | Expires: 2026-04-20 (EXPIRED 26 days ago)
     - Reason: Actuator failure on valve HV-3302
     - Status: Actuator replacement parts still on order; ETA 2026-06-01
     - Action: OVERDUE - Requires extension authorization or conversion

  3. MOC-MDP-2026-T015: Temporary increase in shift manning (5th operator)
     - Installed: 2026-03-01 | Expires: 2026-05-30 (in 28 days)
     - Reason: Compensating measure for alarm system upgrade in progress
     - Status: Alarm system upgrade 60% complete; expected completion 2026-07-15
     - Action: EXTENSION NEEDED - Alarm upgrade will not complete before expiry

  Actions taken:
  - T012: Confirmation sent to maintenance scheduler; on track for removal
  - T008: ESCALATION sent to Plant Manager (expired temporary change)
         Extension request generated requiring Plant Manager + HSE Manager approval
         Maximum extension: 90 additional days with documented justification
  - T015: Extension request generated with justification
         Routed to Operations Manager + HSE Manager for approval

Output:
  "Temporary Change Scan - 3 items requiring attention:
   T012: ON TRACK for removal (14 days remaining)
   T008: OVERDUE by 26 days - ESCALATION to Plant Manager
   T015: Extension request generated (28 days remaining)

   CRITICAL: MOC-MDP-2026-T008 has exceeded authorized duration.
   Immediate management attention required per OSHA PSM 1910.119(l).
   Extension or conversion to permanent MOC must be authorized within 48 hours."
```
