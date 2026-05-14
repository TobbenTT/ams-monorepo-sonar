# Examples - manage-loop-checking

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Loop Check Progress Dashboard

```
LOOP CHECK STATUS - Cerro Alto Copper Concentrator
================================================================
Report Date: 2026-04-15  |  Target Completion: 2026-05-30

OVERALL PROGRESS:
  Total Loops: 2,450
  Completed:   1,680 (68.6%)  [+185 this week]
  Passed:      1,612 (96.0% pass rate)
  Failed:         68 (awaiting resolution: 23, re-tested: 45)
  Deferred:       42 (prerequisites not met)
  Remaining:     728

  Completion Rate: 37 loops/day -> Forecast: 2026-05-13 (17 days ahead)

BY SYSTEM:
  +------------------+-------+----------+------+--------+-----+
  | System           | Total | Complete | Pass | Failed | RAG |
  +------------------+-------+----------+------+--------+-----+
  | 100 - Crushing   |   320 |   310    | 305  |    5   | GRN |
  | 200 - Grinding   |   480 |   420    | 402  |   18   | GRN |
  | 300 - Flotation  |   520 |   350    | 338  |   12   | AMB |
  | 400 - Thickening |   280 |   200    | 192  |    8   | GRN |
  | 500 - Filtration  |   240 |   150    | 145  |    5   | AMB |
  | 600 - Tailings   |   180 |   120    | 115  |    5   | GRN |
  | 700 - Reagents   |   130 |    80    |  75  |    5   | AMB |
  | 800 - Utilities  |   300 |    50    |  40  |   10   | RED |
  +------------------+-------+----------+------+--------+-----+

FAILURE ANALYSIS:
  Wiring errors:          28 (41.2%)
  Calibration OOT:        15 (22.1%)
  DCS configuration:      12 (17.6%)
  Instrument defect:       8 (11.8%)
  Cable damage:            5 (7.4%)

  Action: Wiring contractor root cause meeting scheduled 2026-04-16.
          Bulk re-inspection of System 800 wiring ordered.
```

### Example 2: Alarm Rationalization Results

```
ALARM RATIONALIZATION SUMMARY - Cerro Alto Copper Concentrator
================================================================
Rationalization Period: 2026-03-01 to 2026-04-10

BEFORE RATIONALIZATION:
  Total Configured Alarms:   5,120
  Alarms per Operator:       640 (4 operator positions)
  EEMUA 191 Assessment:      OVERLOADED

RATIONALIZATION RESULTS:
  Alarms Reviewed:           5,120 (100%)
  Alarms Removed:            1,790 (35.0%)
    - No operator action:      850 (diagnostic only -> journal)
    - Duplicate/redundant:     420 (covered by other alarms)
    - Not valid alarm:         320 (instrument health, not process)
    - Never activates:         200 (setpoint unreachable in practice)
  Alarms Reclassified:         920 (18.0%)
  Setpoints Adjusted:          430 (8.4%)
  Deadbands Added/Adjusted:    680 (13.3%)
  New Alarms Added:             40 (gaps identified during review)

AFTER RATIONALIZATION:
  Total Active Alarms:       3,370
  Alarms per Operator:       843 -> reduced to meaningful alarms only
  Priority Distribution:
    Critical:   145 (4.3%)  -- target <5%    [PASS]
    High:       505 (15.0%) -- target <15%   [PASS]
    Medium:   1,685 (50.0%) -- target ~50%   [PASS]
    Low:      1,035 (30.7%) -- target ~30%   [PASS]

  EEMUA 191 Forecast:        STABLE (target achieved)

STARTUP ALARM PLAN:
  Phase 1 (Cold Commissioning): 1,200 alarms active (35.6%)
  Phase 2 (Hot Startup):        2,100 alarms active (62.3%)
  Phase 3 (Feed Introduction):  2,800 alarms active (83.1%)
  Phase 4 (Ramp-Up):            3,100 alarms active (92.0%)
  Phase 5 (Steady State):       3,370 alarms active (100%)

  Safety alarms ACTIVE in ALL phases: 145 (100% of Critical)
```

### Example 3: Integrated Readiness Assessment

```
INSTRUMENTATION COMMISSIONING READINESS - System 200 (Grinding)
================================================================
Assessment Date: 2026-04-20  |  PSSR Target: 2026-05-05

COMPONENT                    | STATUS    | SCORE  | WEIGHT | WEIGHTED
-----------------------------------------------------------------
Loop Checks Complete         | 420/480   | 87.5%  | 2x     | 175.0
Failed Loops Resolved        | 15/18     | 83.3%  | 2x     | 166.7
Alarm Rationalization        | 480/480   | 100%   | 2x     | 200.0
Alarm Config Implemented     | 460/480   | 95.8%  | 2x     | 191.7
SIS Loop Verification        | 24/24     | 100%   | 3x     | 300.0
Startup Alarm Plan           | Complete  | 100%   | 1x     | 100.0
-----------------------------------------------------------------
WEIGHTED READINESS SCORE:                                    94.4%

READINESS ASSESSMENT: CONDITIONAL READY
  - 60 loops remaining for loop check (estimated 2 days)
  - 3 failed loops pending resolution (pump flow transmitters)
  - 20 alarm config changes pending DCS vendor implementation

RECOMMENDATION: System 200 will be ready for PSSR by 2026-04-25,
5 days ahead of target. Remaining items tracked as punch list.
```
