# Examples - create-commissioning-plan

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example System Turnover Matrix

```
SYSTEM TURNOVER MATRIX - PROJECT ALPHA
=======================================

| System_ID      | System Name              | Area | Equip | MC Target  | PreComm    | Comm       | TCCC Ready | Punch A | Punch B | Status      |
|----------------|--------------------------|------|-------|------------|------------|------------|------------|---------|---------|-------------|
| SYS-UTIL-PWR   | Electrical Power Dist.   | UTL  | 45    | 2026-05-01 | 2026-05-15 | 2026-06-01 | 2026-06-15 | 0       | 3       | In Progress |
| SYS-UTIL-AIR   | Compressed Air System    | UTL  | 12    | 2026-05-10 | 2026-05-20 | 2026-06-05 | 2026-06-20 | 0       | 1       | In Progress |
| SYS-UTIL-WAT   | Process Water System     | UTL  | 18    | 2026-05-15 | 2026-05-25 | 2026-06-10 | 2026-06-25 | 2       | 5       | Not Started |
| SYS-100-CRUSH  | Primary Crushing         | 100  | 35    | 2026-06-01 | 2026-06-15 | 2026-07-01 | 2026-07-20 | 5       | 12      | Not Started |
| SYS-100-GRIND  | Grinding Circuit         | 100  | 48    | 2026-06-15 | 2026-07-01 | 2026-07-20 | 2026-08-10 | 8       | 18      | Not Started |
| SYS-200-FLOAT  | Flotation Circuit        | 200  | 52    | 2026-07-01 | 2026-07-15 | 2026-08-01 | 2026-08-20 | 3       | 8       | Not Started |
| SYS-300-THICK  | Thickening & Filtration  | 300  | 28    | 2026-07-15 | 2026-07-25 | 2026-08-10 | 2026-08-25 | 1       | 4       | Not Started |

COMMISSIONING SEQUENCE:
  Power --> Air --> Water --> Crushing --> Grinding --> Flotation --> Thickening
  (Utility systems must be commissioned first to support process systems)

CRITICAL PATH: Power --> Grinding --> Flotation (longest path to TCCC)
```

### Example Pre-Commissioning Checklist Entry

```
PRE-COMMISSIONING CHECKLIST - MECHANICAL
System: SYS-100-GRIND (Grinding Circuit)
Equipment: 100-ML-001 (SAG Mill)

| Item | Check Description                           | Acceptance Criteria              | Status    | Sign-Off | Date |
|------|---------------------------------------------|----------------------------------|-----------|----------|------|
| M-01 | Foundation bolts torqued to specification    | Per vendor torque table           | Complete  | JR       | 6/15 |
| M-02 | Sole plate grouting cured and inspected     | 28-day cure, no cracks           | Complete  | JR       | 6/14 |
| M-03 | Mill shell alignment verified               | Within 0.05mm/m                  | Complete  | JR       | 6/16 |
| M-04 | Bearing clearances checked                  | Per vendor specification          | Pending   |          |      |
| M-05 | Lubrication system flushed and filled       | Oil cleanliness NAS 7            | Pending   |          |      |
| M-06 | Girth gear alignment and backlash           | Backlash 1.5-2.0mm              | Pending   |          |      |
| M-07 | Liner bolts torqued                         | Per vendor torque table           | Pending   |          |      |
| M-08 | Mill rotation check (barring device)        | Smooth rotation, no interference  | Not Start |          |      |
| M-09 | Guards and safety devices installed         | All guards per drawing            | Not Start |          |      |
| M-10 | Vibration sensor installation verified      | Per monitoring spec               | Not Start |          |      |

Overall Pre-Comm Status: 30% Complete (3/10 items)
```
