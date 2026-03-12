# Examples - prepare-pssr-package

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example PSSR Status Summary

```
PRE-STARTUP SAFETY REVIEW - STATUS SUMMARY
============================================
PSSR Reference:  PSSR-MDP-2026-015
System:          System 100 - SAG Mill Grinding Circuit
Trigger:         New Installation
Target Startup:  2026-05-15
PSSR Date:       2026-04-28 to 2026-04-29

CHECKLIST SUMMARY:
  +-------------------------------------------+--------+------+------+-----+------+
  | Category                                  | Items  | PASS | COND | FAIL| N/A  |
  +-------------------------------------------+--------+------+------+-----+------+
  | 1. Construction & Equipment Verification  |   32   |  30  |   2  |  0  |  0   |
  | 2. Safety Systems & Safeguards            |   28   |  25  |   2  |  1  |  0   |
  | 3. Operating Procedures                   |   18   |  14  |   3  |  1  |  0   |
  | 4. Emergency Procedures                   |   12   |  12  |   0  |  0  |  0   |
  | 5. Training & Competency                  |   15   |  12  |   2  |  1  |  0   |
  | 6. Process Safety Information             |   10   |  10  |   0  |  0  |  0   |
  | 7. Maintenance Readiness                  |   14   |  12  |   2  |  0  |  0   |
  | 8. Environmental Compliance               |    8   |   8  |   0  |  0  |  0   |
  | 9. Regulatory Requirements                |    6   |   6  |   0  |  0  |  0   |
  | 10. Management of Change                  |    4   |   4  |   0  |  0  |  0   |
  | 11. Punch List Resolution                 |   22   |  20  |   2  |  0  |  0   |
  | 12. Spare Parts & Materials               |    8   |   7  |   1  |  0  |  0   |
  | 13. Emergency Response                    |   10   |  10  |   0  |  0  |  0   |
  | 14. Insurance Requirements                |    4   |   4  |   0  |  0  |  0   |
  | 15. Final Walkdown Verification           |   25   |  22  |   1  |  2  |  0   |
  +-------------------------------------------+--------+------+------+-----+------+
  | TOTAL                                     |  216   | 196  |  15  |  5  |  0   |
  +-------------------------------------------+--------+------+------+-----+------+

RESULTS:     PASS: 90.7%  |  CONDITIONAL: 6.9%  |  FAIL: 2.3%

HOLD ITEMS (Must resolve before startup):
  FAIL-001: Safety guard missing on pump 100-PP-001A coupling (Walkdown finding)
            Owner: Mechanical Supervisor  |  Due: 2026-05-01
  FAIL-002: Emergency stop button obstructed at Panel 100-PNL-03 (Walkdown finding)
            Owner: E&I Supervisor  |  Due: 2026-05-03
  FAIL-003: 3 operators not completed practical training assessment
            Owner: Training Coordinator  |  Due: 2026-05-10
  FAIL-004: SOP-100-003 (Ball Mill Startup) not yet approved
            Owner: Operations Engineer  |  Due: 2026-05-05
  FAIL-005: Emergency shower at mill area not tested/certified
            Owner: HSE Coordinator  |  Due: 2026-05-05

PSSR DECISION: NOT APPROVED - 5 HOLD items require resolution

NEXT STEPS:
  1. Resolve HOLD items FAIL-001 through FAIL-005 by assigned dates
  2. Re-review HOLD items on 2026-05-06 (targeted)
  3. If all HOLD items resolved, issue APPROVED WITH CONDITIONS
  4. Conditional items tracked daily until closure
  5. Revised target startup: 2026-05-08 (pending HOLD resolution)
```
