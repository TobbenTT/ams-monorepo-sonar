# Examples - manage-epc-interfaces

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: New EPC Contract Interface Setup

**Input:** EPC contract for copper concentrator plant, 3 contractors (EPCM lead, civil/structural subcontractor, mechanical/piping subcontractor). Contract value USD 850M. 24 major systems. Contract duration 36 months.

**Process:**
1. Parse scope split documents for all 3 contractors
2. Identify 127 interface points across Document (52), Physical (38), Schedule (24), Commercial (13) types
3. Map interfaces to system breakdown structure (24 systems, 156 subsystems)
4. Assign interface owners for each point (EPC + Owner side)
5. Establish RFI protocol with 7-day SLA for technical, 5-day for safety
6. Configure TOP tracking for all 24 systems with equipment-type-specific checklists
7. Conduct interface alignment workshop with all 3 contractors

**Output:**
- Interface register with 127 items, classified and risk-rated
- RFI protocol document approved by all parties
- TOP tracking configured for 24 systems (total 1,847 TOP line items)
- Interface management plan document (20 pages)
- First weekly report issued

### Example 2: RFI Escalation

**Input:** RFI-MEC-2025-0234 (structural steel foundation design query for crusher building) aging at 21 days. SLA = 14 days. Crusher installation on critical path. EPC structural engineer has been unresponsive.

**Process:**
1. Identify impact: crusher foundation pour delayed, cascading to crusher installation (10-day delay risk on critical path)
2. Quantify commercial impact: 10-day delay = USD 2.1M production loss during ramp-up
3. Escalate to Level 2 (Project Manager) with impact assessment
4. Contact EPC Project Director directly (Level 3 pre-notification)
5. Propose resolution path: emergency design review meeting within 48 hours
6. Update risk register with interface delay risk entry

**Output:**
- Escalation notice sent to Project Manager and EPC Project Director
- Impact assessment document: 10-day critical path delay, USD 2.1M exposure
- Emergency design review meeting scheduled
- Risk register updated: Risk-INT-047, "Crusher foundation design delay"
- Updated interface register showing escalation status and timeline

### Example 3: TOP Processing for Cooling Water System

**Input:** Cooling water system (SYS-CW-001) approaching MC milestone. TOP checklist has 84 line items. EPC contractor claims 100% document readiness.

**Process:**
1. Review TOP checklist: 84 items across categories (as-built drawings, vendor manuals, test certificates, spare parts, calibration records)
2. Verify document receipt: 79/84 items received (94%)
3. Quality review of received documents: 6 items have quality issues (incomplete vendor manuals, missing test data)
4. Missing items: 5 items not yet submitted (loop diagrams for 3 instruments, 2 motor test certificates)
5. Classify using VSC FM Table where applicable: motor test certificates needed to verify "Motor winding -- Degrades due to Overheating" baseline condition
6. Issue deficiency list to EPC contractor with 7-day deadline
7. Schedule TOP review meeting for T-3 days

**Output:**
- TOP status report: 79/84 received (94%), 73/84 accepted quality (87%)
- Deficiency list: 11 items (5 missing + 6 quality issues) with deadlines
- TOP readiness recommendation: "Not Ready" -- re-assess in 7 days
- Updated interface register and action items for EPC contractor
