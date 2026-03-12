# Examples - manage-vendor-documentation

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example VDRR Status Dashboard

```
VENDOR DOCUMENT REQUIREMENT REGISTER - STATUS DASHBOARD
PROJECT: COPPER CONCENTRATOR EXPANSION - PHASE 2
Report Date: 2026-03-15
==========================================================

OVERALL STATUS:
  Total Documents Required:        24,567
  Documents Received:              18,425  (75.0%)
  Documents Under Review:           1,234  (5.0%)
  Documents Approved (Final Rev):  14,892  (60.6%)
  Documents Overdue:                2,341  (9.5%)
  Handover Ready:                  14,892  (60.6%)

OVERDUE AGING:
  7-14 days overdue:     876 documents  (37.4% of overdue)
  14-30 days overdue:    723 documents  (30.9% of overdue)
  30-60 days overdue:    498 documents  (21.3% of overdue)
  60-90 days overdue:    156 documents  (6.7% of overdue)
  >90 days overdue:       88 documents  (3.8% of overdue)

TOP 5 VENDORS BY OVERDUE COUNT:
  1. Vendor A (Crushing Equipment):    312 overdue / 1,890 required (16.5%)
  2. Vendor B (Piping & Valves):       287 overdue / 3,456 required (8.3%)
  3. Vendor C (Electrical Panels):     234 overdue / 1,234 required (19.0%)  ** RISK **
  4. Vendor D (Instrumentation):       198 overdue / 2,567 required (7.7%)
  5. Vendor E (HVAC Systems):          156 overdue / 890 required  (17.5%)  ** RISK **

HANDOVER READINESS BY SYSTEM:
  System 100 - Crushing:       45.2%  [RED]    Target: MC Q3 2026
  System 200 - Grinding:       72.8%  [AMBER]  Target: MC Q4 2026
  System 300 - Flotation:      88.5%  [AMBER]  Target: MC Q1 2027
  System 400 - Thickening:     91.2%  [GREEN]  Target: MC Q1 2027
  System 500 - Filtration:     94.7%  [GREEN]  Target: MC Q2 2027
  System 600 - Reagents:       67.3%  [RED]    Target: MC Q3 2026
  System 700 - Water:          85.1%  [AMBER]  Target: MC Q4 2026
  System 800 - Tailings:       78.9%  [AMBER]  Target: MC Q4 2026

REVIEW CYCLE PERFORMANCE:
  Average review cycle time:     11.2 days (Target: <14 days)
  Reviews completed on time:     82.3%     (Target: >90%)
  Reviews currently overdue:     67        (4.2% of active reviews)
  Average review cycles per doc: 1.8       (Industry avg: 2.1)

FOLLOW-UP ACTIONS THIS WEEK:
  7-day reminders sent:          134
  14-day escalations sent:        89
  30-day formal notices sent:     34
  60-day contractual notices:     12
  Vendor meetings scheduled:       4
```

### Example Follow-Up Email (14-Day Escalation)

```
TO: vendor-pm@flowserve.com
CC: john.smith@project.com (Procurement Lead)
    maria.garcia@project.com (Document Control Lead)
SUBJECT: ESCALATION - 23 Overdue Documents - PO-4500-0123 - Flowserve

Dear Mr. Thompson,

This is a formal escalation regarding 23 vendor documents currently overdue
under Purchase Order PO-4500-0123 (Centrifugal Pumps - Slurry Service).

Documents overdue 14+ days:
  Doc No.              Title                          Due Date    Days Overdue
  PRJ-FLW-VD-MAN-001  O&M Manual - 100-PP-001A/B     2026-02-28  15 days
  PRJ-FLW-VD-DWG-002  GA Drawing - 100-PP-001A       2026-02-28  15 days
  PRJ-FLW-VD-DTS-003  Data Sheet - 100-PP-001A/B     2026-03-01  14 days
  ... [20 additional items listed]

These documents are required for engineering review and commissioning planning.
Continued delay impacts the project schedule for System 100 commissioning.

Please provide:
1. Updated submission dates for each document listed above
2. Root cause for the delay
3. Recovery plan to prevent further delays on remaining documents

A vendor documentation review meeting is requested within the next 5 business days.

Regards,
Project Document Control
[Automated via OR System - Agent 2]
```
