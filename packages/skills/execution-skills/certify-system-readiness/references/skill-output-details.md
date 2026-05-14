# Detailed Output Specification - certify-system-readiness

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---


5. **Operations Readiness Confirmation**
   - Operating procedures: list of approved SOPs for the system
   - Operator training: number of qualified operators per shift, competency confirmation
   - Maintenance readiness: CMMS populated, maintenance plans active, first PM scheduled
   - Spare parts: critical and insurance spares confirmed in warehouse with location

6. **Outstanding Items**
   - Category B items: list with description, responsible party, due date, acceptance rationale
   - Category C items: count and summary (individual listing not required)
   - Conditions of acceptance for any outstanding items
   - Risk assessment for accepted outstanding items

7. **CCC Transfer Statement**
   - Formal statement: "Care, Custody, and Control of System [ID] is hereby transferred from [Construction/Commissioning Team] to [Operations Team]"
   - Effective date and time of transfer
   - Acknowledgment that Operations accepts responsibility for the system from this date

8. **Signature Block**
   - Construction Manager: Name, Signature, Date
   - Commissioning Manager: Name, Signature, Date
   - Operations Manager: Name, Signature, Date
   - HSE Manager: Name, Signature, Date
   - Witness (optional): Project Director or Client Representative

9. **Effective Date and Warranty Start Date**
   - TCCC effective date = date of last signature
   - Warranty start date = TCCC effective date (unless otherwise specified in contracts)
   - Insurance coverage activation date
   - Post-RFSU monitoring period: start date and end date (typically +90 days)

10. **Appendices**
    - Equipment list within system boundary
    - P&ID list
    - Commissioning procedure list with execution dates
    - Performance test results summary
    - PSSR close-out report
    - Training completion records
    - Spare parts receipt confirmation
    - Punchlist extract (Cat B/C outstanding items)

### Document 2: System Readiness Matrix (.xlsx)

**Sheets:**

1. **Readiness Dashboard**
   - All systems with multi-dimensional readiness status (traffic light: Red/Amber/Green)
   - Columns: System ID, System Name, Construction %, Commissioning %, Ops Readiness, Safety (PSSR), Documentation, Punchlist, Overall Status
   - Conditional formatting with traffic lights
   - Summary counts: systems Green / Amber / Red
   - Target date for each system to reach Green

2. **TCCC Status**
   - Per-system certificate status tracking
   - Columns: System ID, TCCC Ref, Status (Not Started / Draft / Submitted / Under Review / Approved), Submission Date, Current Signatory, Days in Review, Target Approval Date
   - Pipeline view: how many TCCCs at each stage

3. **PSSR Status**
   - Per-system safety review tracking
   - Columns: System ID, PSSR Ref, Status (Not Started / In Progress / Findings Open / Cleared), PSSR Date, Open Findings Count, Critical Findings, Target Clearance Date
   - Highlight systems with critical PSSR findings blocking TCCC

4. **Dimension Detail**
   - Detailed status per readiness dimension per system
   - Construction dimension: MC status, punchlist Cat A count, punchlist Cat B count
   - Commissioning dimension: procedures executed %, performance test status, vendor sign-offs
   - Operations dimension: SOPs approved %, operators qualified %, maintenance plans active
   - Safety dimension: PSSR status, safety systems verified, emergency procedures tested
   - Documentation dimension: as-built docs received %, vendor docs received %, O&M manuals available

5. **Critical Path**
   - Systems on critical path to commercial operation
   - Gantt-style view showing TCCC target dates vs. project milestones
   - Dependencies between systems (which systems must be TCCC'd before others can start)
   - Critical path analysis: which TCCCs are driving the project end date

6. **Post-RFSU Monitoring**
   - 30/60/90-day performance tracking per system
   - Columns: System ID, TCCC Date, Monitoring Start, 30-Day Review (date/status), 60-Day Review (date/status), 90-Day Review (date/status), Final Acceptance Status
   - KPI tracking: availability, throughput, quality, safety incidents
   - Issues log: operational issues discovered during monitoring period

---
