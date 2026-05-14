# Examples - create-risk-assessment

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example Bow-Tie Diagram

```
BOW-TIE: BT-003 - Loss of Containment: Sulfuric Acid Storage Tank (400-TK-001)
================================================================================

HAZARD: Concentrated Sulfuric Acid (98% H2SO4) - 500m3 storage

                    PREVENTIVE                                MITIGATIVE
  THREATS           BARRIERS              TOP EVENT           BARRIERS              CONSEQUENCES
  --------          ---------             ----------          ---------             -------------

  [THR-01]          [PB-01] Design        |            |      [MB-01] Bund wall     [CON-01]
  Corrosion  -----> to ASME VIII    ----->|            |----> 110% containment ---> Personnel
  (internal)        [PB-02] Material      |            |      [MB-02] Gas           chemical burns
                    selection SS316  ---->|  LOSS OF   |      detection + alarm     (Safety: 5)
  [THR-02]          [PB-03] Inspection    | CONTAINMENT|----> [MB-03] Emergency
  Overfill   -----> program (API 653) -->|  of H2SO4  |      shower/eyewash  ----> [CON-02]
                    [PB-04] Level         |  from      |      [MB-04] ERP +         Soil/water
  [THR-03]          alarm (LAHH)    ----->|  TK-001    |      evacuation  -------> contamination
  Impact     -----> [PB-05] Bollard       |            |----> [MB-05] Spill         (Env: 4)
  (vehicle)         protection      ----->|            |      response kit
                    [PB-06] Traffic       |            |      [MB-06] Neutralization [CON-03]
  [THR-04]          management plan  --->|            |----> system  ------------> Production
  Seismic    -----> [PB-07] Seismic       |            |                            loss 5 days
  event             design (NCh2369) --->|            |                            (Prod: 3)

INHERENT RISK:  L=4, C=5, Score=20 (EXTREME)
RESIDUAL RISK:  L=2, C=4, Score=8  (HIGH)
ALARP STATUS:   ALARP - All reasonably practicable measures implemented
ACTION:         RSK-003-A01: Increase tank inspection frequency to quarterly (Priority: High)
```

### Example Risk Matrix Heat Map

```
RISK MATRIX - PROJECT ALPHA OPERATIONAL RISK ASSESSMENT
========================================================

CONSEQUENCE
  5-Catastrophic |  5(M) | 10(H) | 15(H) | 20(E) | 25(E) |
  4-Major        |  4(M) |  8(H) | 12(H) | 16(E) | 20(E) |
  3-Moderate     |  3(L) |  6(M) |  9(M) | 12(H) | 15(H) |
  2-Minor        |  2(L) |  4(M) |  6(M) |  8(H) | 10(H) |
  1-Insignif.    |  1(L) |  2(L) |  3(L) |  4(M) |  5(M) |
                 |-------|-------|-------|-------|-------|
  LIKELIHOOD      1-Rare  2-Unl  3-Poss  4-Like  5-A.Cert

  INHERENT RISK DISTRIBUTION:        RESIDUAL RISK DISTRIBUTION:
  Extreme: 8 risks (19%)             Extreme: 0 risks (0%)
  High:   15 risks (36%)             High:    5 risks (12%)
  Medium: 12 risks (29%)             Medium: 18 risks (43%)
  Low:     7 risks (17%)             Low:    19 risks (45%)
  TOTAL:  42 risks                   TOTAL:  42 risks
```
