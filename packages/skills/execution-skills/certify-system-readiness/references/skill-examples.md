# Examples - certify-system-readiness

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: System TCCC Approval

**Context:** Primary crusher system (SYS-CR-001) at a copper mine — all prerequisites confirmed

**Input:**
- System: SYS-CR-001 — Primary Crusher (gyratory crusher, feed hopper, apron feeder, discharge conveyor, dust collection, lubrication system)
- 47 equipment items within system boundary
- MC achieved 6 weeks ago, commissioning complete 2 weeks ago
- PSSR cleared with 0 outstanding items
- 4 trained operators per shift (3 shifts), all SOPs approved
- Critical spares in warehouse ($1.2M value), CMMS fully populated
- Punchlist: 0 Cat A, 3 Cat B (accepted by Operations Manager), 12 Cat C

**Process:**
1. TCCC certificate created from template, all sections populated
2. Evidence package assembled: MC cert, 12 commissioning procedure records, performance test report (crusher throughput 102% of design at target CSS), PSSR clearance, 12 operator training certificates, spare parts receipt confirmations, CMMS screenshot showing active maintenance plans
3. TCCC submitted to Construction Manager — signed Day 1
4. Forwarded to Commissioning Manager — signed Day 2
5. Forwarded to Operations Manager — signed Day 2 (same day, was pre-briefed)
6. Forwarded to HSE Manager — signed Day 3
7. All 4 signatures obtained in 3 calendar days

**Output:**
- Approved TCCC certificate (TCCC-CR-001-Rev2) with all 4 signatures
- CCC formally transferred to operations effective Day 3
- Warranty activated: 24 months from TCCC date for all 47 equipment items
- Insurance coverage activated: operational policy effective Day 3
- System added to operations daily production reporting
- Maintenance plans activated: first PM (crusher liner inspection) scheduled in 30 days
- Post-RFSU monitoring started: 90-day period, first review at Day 30
- Progressive handover tracker updated: SYS-CR-001 = "Transferred to Operations"

### Example 2: TCCC Blocked by PSSR

**Context:** Sulfuric acid storage system at a hydrometallurgical plant — PSSR findings blocking TCCC

**Input:**
- System: SYS-AS-010 — Sulfuric Acid Storage (2 x 5,000m3 tanks, transfer pumps, piping, containment)
- Commissioning complete, performance test passed
- PSSR conducted by 5-person team, identified 7 findings:
  - Finding 1 (Critical): Emergency shower #AS-ES-03 not flow-tested — safety-critical
  - Finding 2 (Critical): SIS logic for tank high-level shutdown not validation-tested — safety-critical
  - Finding 3 (Major): Acid-resistant PPE not yet delivered for operations team
  - Finding 4 (Major): Bund drain valve left in open position (should be closed)
  - Finding 5 (Minor): Warning signage in English only, requires Spanish translation
  - Finding 6 (Minor): Lighting in pump area below minimum lux requirement
  - Finding 7 (Minor): Spill response kit not positioned at designated location

**Process:**
1. TCCC preparation initiated but halted at Step 2 (Verify Prerequisites) — PSSR not cleared
2. 2 Critical findings MUST be resolved before PSSR clearance
3. Corrective actions assigned:
   - Finding 1: Schedule emergency shower flow test with plumbing contractor (2 days)
   - Finding 2: Schedule SIS validation test with instrument contractor and SIS vendor (5 days)
   - Finding 3: Expedite PPE delivery, confirm ETA (3 days)
   - Finding 4: Close bund drain valve immediately (same day) — verify with photo
   - Findings 5-7: Assign to operations team with 7-day deadline
4. PSSR items tracked in Jira with daily status updates
5. Day 2: Findings 4 closed (drain valve closed and locked, photo evidence)
6. Day 3: Findings 1 and 3 closed (shower tested-passed, PPE delivered and distributed)
7. Day 5: Finding 2 closed (SIS validation test executed, all logic validated per SIL assessment)
8. Day 7: Findings 5, 6, 7 closed
9. PSSR re-reviewed: all 7 findings resolved — PSSR clearance certificate issued
10. TCCC preparation resumes from Step 2

**Output:**
- PSSR corrective action tracker with all 7 items and resolution evidence
- Updated TCCC timeline: +7 business days from original target
- PSSR clearance certificate issued Day 7
- Notification to operations: CCC transfer delayed by 7 days, new target date communicated
- Risk entry created for downstream systems dependent on acid storage
- Lessons learned: PSSR should be scheduled minimum 14 days before target TCCC to allow resolution time
- TCCC submitted on Day 8, approved on Day 11

### Example 3: Post-RFSU Performance Monitoring

**Context:** Flotation circuit at a copper concentrator — 30-day post-RFSU review

**Input:**
- System: SYS-FL-001 — Rougher Flotation Circuit (6 x 300m3 cells, air blowers, reagent dosing, froth cameras)
- TCCC approved 32 days ago
- Design parameters: 85% copper recovery, 22% concentrate grade, 92% availability
- 30 days of operational data collected

**Process:**
1. Compile 30-day performance data:
   - Copper recovery: Average 78% (target 85%) — BELOW TARGET
   - Concentrate grade: Average 24% (target 22%) — ABOVE TARGET (acceptable)
   - Availability: 88% (target 92%) — BELOW TARGET
2. Analyze deviations:
   - Recovery shortfall: Reagent dosing system calibration issue identified on Day 12, corrected on Day 15. Pre-correction average 72%, post-correction average 83%. Trending toward target.
   - Availability shortfall: 3 unplanned shutdowns — bearing failure on Cell #4 agitator (Day 8), froth camera failure (Day 18), air blower trip on high vibration (Day 25)
3. Root cause analysis for unplanned shutdowns:
   - Cell #4 agitator bearing: Manufacturing defect, warranty claim submitted
   - Froth camera: Software configuration error, corrected
   - Air blower: Foundation bolt loosening, re-torqued and monitoring added
4. 30-day assessment: System NOT YET at sustained design performance

**Output:**
- 30-day post-RFSU review report with detailed performance analysis
- Recommendation: Continue monitoring for additional 30 days (60-day total)
- Specific KPIs for next 30-day period:
  - Copper recovery: sustain >83% for 30 consecutive days
  - Availability: achieve >90% with zero unplanned shutdowns from equipment readiness causes
- Corrective actions tracked:
  - Warranty claim for Cell #4 bearing (asset management agent)
  - Air blower foundation bolt monitoring added to weekly PM (asset management agent)
  - Reagent dosing calibration verification added to daily operator checklist (operations agent)
- Next review: Day 60 post-RFSU
- Notification to project management: Final Acceptance for SYS-FL-001 projected at Day 60 (30-day extension)

---
