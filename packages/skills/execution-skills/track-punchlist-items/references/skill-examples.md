# Examples - track-punchlist-items

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Mining Concentrator Punch List Dashboard

```
PUNCH LIST STATUS - Cerro Alto Copper Concentrator (CA-2026)
================================================================
Report Date: 2026-06-15  |  Project Target MC: 2026-07-01
Total Items Identified: 8,425  |  Total Closed: 6,180 (73.3%)

SUMMARY BY CLASSIFICATION:
  +--------+------------+--------+---------+-----------+----------+
  | Class  | Identified | Closed | Open    | In Prog   | Overdue  |
  +--------+------------+--------+---------+-----------+----------+
  | Cat A  |    312     |  285   |   18    |     9     |    3     |
  | Cat B  |  2,840     | 2,015  |  520    |   305     |   45     |
  | Cat C  |  5,273     | 3,880  |  875    |   518     |   62     |
  +--------+------------+--------+---------+-----------+----------+
  | TOTAL  |  8,425     | 6,180  | 1,413   |   832     |  110     |
  +--------+------------+--------+---------+-----------+----------+

CATEGORY A FOCUS (3 overdue items - CRITICAL):
  PL-CA2026-00145  SYS-200-GRIND  Safety guard missing on ball mill
                   coupling - ABC Mechanical - 5 days overdue [LEVEL 2]
  PL-CA2026-00289  SYS-UTIL-PWR   Ground fault on MCC-200-01 Bus B -
                   Siemens - 3 days overdue [LEVEL 1]
  PL-CA2026-00301  SYS-300-FLOAT  Emergency stop wiring error on
                   flotation cell 300-FC-005 - XYZ Electrical -
                   4 days overdue [LEVEL 1]

SYSTEM READINESS FOR MC (MC target: 2026-07-01):
  +------------------+--------+-------+-------+-------+---------+
  | System           | Cat A  | Cat B | Cat C | Total | Ready?  |
  +------------------+--------+-------+-------+-------+---------+
  | SYS-UTIL-PWR     |   1*   |   12  |   28  |   41  | AT RISK |
  | SYS-UTIL-AIR     |   0    |    5  |   15  |   20  | READY   |
  | SYS-UTIL-WAT     |   0    |    8  |   22  |   30  | READY   |
  | SYS-100-CRUSH    |   0    |   22  |   45  |   67  | READY   |
  | SYS-200-GRIND    |   1*   |   85  |  120  |  206  | AT RISK |
  | SYS-300-FLOAT    |   1*   |   65  |   95  |  161  | AT RISK |
  | SYS-400-THICK    |   0    |   42  |   72  |  114  | ON TRACK|
  +------------------+--------+-------+-------+-------+---------+
  * = Open Category A items preventing MC acceptance

BURN-DOWN FORECAST:
  Current close-out rate: 185 items/week
  Items remaining: 2,245
  Forecast completion: 2026-08-26 (12.1 weeks at current rate)
  Required rate for 2026-07-01 target: 937 items/week
  GAP: Need 4x acceleration for Cat A/B items on critical systems

RESPONSIBLE PARTY PERFORMANCE:
  +------------------------+-------+--------+---------+-----------+
  | Responsible Party      | Open  | Closed | Overdue | Avg Days  |
  +------------------------+-------+--------+---------+-----------+
  | ABC Mechanical         |  380  | 1,420  |   22    |   12.5    |
  | XYZ Electrical         |  290  | 1,080  |   18    |   14.2    |
  | DEF Piping             |  245  |   980  |   15    |   10.8    |
  | Siemens (vendor)       |   45  |   120  |    8    |   18.5    |
  | FLSmidth (vendor)      |   32  |    85  |    5    |   21.3    |
  | VSC Commissioning      |  125  |   495  |   12    |    8.2    |
  | Owner Operations       |   85  |   310  |    4    |    6.5    |
  +------------------------+-------+--------+---------+-----------+
```

### Example 2: Gas Processing Plant PSSR Punch List Certificate

```
PUNCH LIST CLOSE-OUT CERTIFICATE
================================================================
Project:     Atacama Gas Processing Facility (AGP-2026)
System:      SYS-P03 - Gas Treating (Amine System)
Certificate: PLCO-AGP2026-P03-001
Date:        2026-09-10
Type:        Pre-Startup Close-Out (Category A + B)

PUNCH LIST SUMMARY:
  +--------+------------+--------+----------+--------+
  | Class  | Identified | Closed | Deferred | Open   |
  +--------+------------+--------+----------+--------+
  | Cat A  |     28     |   28   |    0     |   0    |
  | Cat B  |    145     |  145   |    0     |   0    |
  | Cat C  |     89     |   62   |   27     |   0    |
  +--------+------------+--------+----------+--------+
  | TOTAL  |    262     |  235   |   27     |   0    |
  +--------+------------+--------+----------+--------+

CLOSE-OUT STATUS: PASS
  Category A: 28/28 closed (100%) -- PASS
  Category B: 145/145 closed (100%) -- PASS
  Category C: 62 closed, 27 deferred to operations -- ACCEPTABLE

DEFERRED ITEMS (Category C only):
  PL-AGP2026-01845  Touch-up paint on amine regenerator column
                    skirt -- Target: 2026-12-01
  PL-AGP2026-01920  Cable tray labeling incomplete in pipe rack
                    area 3 -- Target: 2026-11-15
  PL-AGP2026-02015  Insulation weather jacketing minor dent on
                    lean amine cooler -- Target: 2027-01-15
  ... (24 additional items, all cosmetic/minor)

STATISTICS:
  Average resolution time (Cat A): 4.2 days
  Average resolution time (Cat B): 9.8 days
  Total photos: 524 (262 identification + 262 close-out)
  Escalations required: 8 items (all resolved within escalation period)

CERTIFICATION:
  This certificate confirms that all Category A and Category B
  punch list items for System SYS-P03 (Gas Treating / Amine System)
  have been resolved, verified, and closed. 27 Category C items
  have been formally deferred to the operations phase with
  acceptance by the Operations Manager.

  This system meets punch list close-out requirements for
  Pre-Startup Safety Review (PSSR) per OSHA 29 CFR 1910.119(i).

SIGNATURES:
  Construction Manager:  _____________ Date: ___________
  Commissioning Manager: _____________ Date: ___________
  Operations Manager:    _____________ Date: ___________
  HSE Manager:           _____________ Date: ___________
  Project Manager:       _____________ Date: ___________
```
