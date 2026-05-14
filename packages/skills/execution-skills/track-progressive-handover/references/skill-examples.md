# Examples - track-progressive-handover

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: System Approaching RFSU

**Input:** Cooling water system (SYS-CW-001), MC achieved 21 days ago, commissioning 95% complete. Operations team has been training on the system. Project manager requests RFSU readiness assessment.

**Process:**
1. Review RFSU checklist (14 items across Commissioning, Operations, Safety, Documentation):
   - Commissioning: 12/14 commissioning activities complete, 2 remaining (control loop tuning for TCV-001, performance verification for pump PP-CW-001A)
   - Operations: SOPs written and approved, 6/8 operators trained (2 pending night shift training)
   - Safety: Interlocks tested, emergency shutdown verified, fire protection confirmed
   - Spare parts: Critical spares on site (mechanical seal, coupling, impeller)
   - Maintenance: Maintenance plans loaded in SAP PM, first PMs scheduled
   - Documentation: 42/45 documents accepted (3 pending: updated P&IDs after commissioning changes)
2. Calculate operations readiness score:
   - Personnel: 75% (6/8 operators, night shift gap)
   - Procedures: 100% (all SOPs approved)
   - Spare Parts: 95% (1 non-critical spare on order)
   - Maintenance: 90% (plans loaded, first PMs need scheduling verification)
   - Safety: 100% (all safety items verified)
   - Permits: 100% (operating permit obtained)
   - Overall: 91.5% (weighted average)
3. Identify 2 outstanding commissioning punch items (Category B, accepted for post-RFSU)
4. Prepare RFSU readiness report with conditional recommendation

**Output:**
- RFSU readiness report showing 12/14 checklist items complete
- Operations readiness score: 91.5% (above 90% threshold)
- 2 Category B commissioning items accepted for post-RFSU resolution
- 2 conditions for RFSU: (1) complete night shift operator training within 7 days, (2) receive updated P&IDs within 5 days
- Recommendation: Conditional Go for RFSU sign-off with stated conditions
- Updated Progressive Handover Tracker with current status

### Example 2: Blocking Category A Punchlist

**Input:** Concentrate thickener system (SYS-TK-003) has 3 Category A punchlist items preventing MC. MC was planned for 10 days ago. Project is 10 days behind on this system.

**Process:**
1. Analyze the 3 Category A items:
   - PL-A-0147: Missing pressure transmitter PT-TK-3301 (instrument not installed, vendor delivery delayed)
   - PL-A-0148: Structural steel defect on thickener bridge walkway (weld defect identified during NDE inspection)
   - PL-A-0149: Missing motor test certificate for agitator drive (vendor has not provided documentation)
2. Assess impact:
   - PL-A-0147: Blocks MC (safety interlock depends on this instrument). Vendor delivery forecast: 5 days
   - PL-A-0148: Blocks MC (access safety issue). Repair estimate: 3 days once welding crew mobilized
   - PL-A-0149: Review if truly Category A or can be downgraded to B with engineering justification
3. Escalate to construction manager and EPC contractor:
   - Request expedited instrument delivery with air freight option
   - Mobilize welding crew for structural repair within 48 hours
   - Engineering review of motor test certificate necessity for MC vs. PC
4. Track resolution daily with status updates
5. Update milestone forecast: MC delayed minimum 5 days from today (instrument delivery is critical path)

**Output:**
- Escalation report with resolution plan for each Category A item
- Updated milestone forecast: MC for SYS-TK-003 delayed to [date + 5 days]
- Impact assessment: 5-day delay on this system, evaluate cascading impact on thickener commissioning and overall critical path
- Risk register entry: Risk-HO-023, "Thickener MC delay due to missing instrument and structural defect"
- Daily tracking protocol established until Category A items resolved
- Engineering review request for PL-A-0149 (potential downgrade to Category B)

### Example 3: Multi-System Handover Dashboard

**Input:** Large copper concentrator project with 24 systems. Month 28 of 36-month project. Project manager requests comprehensive handover status for steering committee.

**Process:**
1. Compile milestone status for all 24 systems:
   - MC achieved: 14 systems (58%)
   - RFSU achieved: 8 systems (33%)
   - PC achieved: 2 systems (8%) (utility systems: compressed air, potable water)
   - Not yet MC: 10 systems (42%)
2. Analyze critical path: grinding circuit (SYS-GR-001) on critical path, MC planned in 15 days, currently at risk (2 Category A items)
3. Punchlist health: 847 total items, 12 Category A (all assigned to 10 not-yet-MC systems), 234 Category B, 601 Category C
4. Operations readiness: average score across all systems = 72%, ranging from 95% (utility systems) to 45% (grinding and flotation -- procedures not yet complete)
5. Handover S-curve: currently tracking 8% behind plan (14 MC vs. planned 16 MC)

**Output:**
- Handover Status Report (12 pages) for steering committee
- Executive dashboard showing 58% MC, 33% RFSU, 8% PC
- Critical path analysis: grinding circuit is the pacing system
- Punchlist summary: 12 Category A items blocking MC for remaining systems
- Operations readiness gap analysis: procedure development is the #1 bottleneck
- 30-day forecast: expect 4 additional MC, 3 additional RFSU
- Recommended actions: (1) accelerate SOP development for grinding/flotation, (2) resolve grinding circuit Category A items within 10 days, (3) increase commissioning crew for parallel RFSU activities
