# Examples - generate-operating-procedures

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example SOP Startup Procedure Step Sequence

```
STANDARD OPERATING PROCEDURE
SOP-100-001: Slurry Pump System - 100-PP-001A/B
Section 5.1: Normal Startup Procedure

PREREQUISITES:
  [ ] PSSR completed and approved for System 100
  [ ] Electrical isolation removed; motor ready for service (MCC confirmed)
  [ ] Cooling water available to seal flush system (CW header > 3.0 barg)
  [ ] Instrument air available (IA header > 6.0 barg)
  [ ] DCS communications confirmed (all I/O healthy, no bad PV signals)
  [ ] Suction tank 100-TK-001 level > 30% (LI-100-001 reading)
  [ ] PPE: Hard hat, safety glasses, hearing protection, steel-toe boots
  [ ] Permit: None required for normal startup

STARTUP SEQUENCE:

Step 5.1.1: VERIFY pump suction valve XV-100-001 is in CLOSED position.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Valve position indicator shows CLOSED
            Verification: DCS indication ZSC-100-001 shows CLOSED (green)

Step 5.1.2: VERIFY pump discharge valve XV-100-002 is in CLOSED position.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Valve position indicator shows CLOSED
            Verification: DCS indication ZSC-100-002 shows CLOSED (green)

Step 5.1.3: OPEN seal flush water supply valve HV-100-010 to pump mechanical seal.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Seal flush flow confirmed on FI-100-010 (>2 L/min)
            CAUTION: Do not start pump without seal flush flow confirmed.
                     Running dry will damage mechanical seal within 30 seconds.
            Verification: FI-100-010 reads > 2 L/min on DCS

Step 5.1.4: OPEN pump suction valve XV-100-001 to FULL OPEN position.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Overview Screen
            Expected Response: Valve travels to OPEN in < 30 seconds
            Verification: ZSO-100-001 shows OPEN; suction pressure PI-100-001
                         reads 0.5-1.5 barg
            NOTE: Allow 60 seconds for pump casing to fill before proceeding.
                  Verify no unusual noise from pump casing (cavitation indication).

Step 5.1.5: START pump 100-PP-001A motor from DCS.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: Motor starts; current II-100-001 peaks then settles
                              to 60-80% FLA within 10 seconds
            CAUTION: IF motor current does not settle below 90% FLA within 15
                     seconds, STOP pump immediately and investigate.
            WARNING: Ensure no personnel are near rotating equipment before starting.
                     Verify guard is in place on coupling.
            Verification: Motor running indication HS-100-001 shows RUN (green)
                         Motor current II-100-001 reads 60-80% FLA

Step 5.1.6: OPEN discharge valve XV-100-002 SLOWLY over 60 seconds.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: Discharge pressure PI-100-002 develops 8.5-10.0 barg
                              Flow FI-100-002 increases to 200-300 m3/h
            CAUTION: Do not open discharge valve fully in one step.
                     Rapid valve opening causes water hammer and pressure surge.
            IF discharge pressure > 11.0 barg THEN STOP pump and investigate.
            IF flow < 150 m3/h with valve fully open THEN check suction conditions.
            Verification: PI-100-002 reads 8.5-10.0 barg
                         FI-100-002 reads 200-300 m3/h

Step 5.1.7: VERIFY all operating parameters are within normal range.
            Performed by: Board Operator
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: All parameters GREEN on DCS overview
            Parameters to verify:
              Suction pressure PI-100-001:     0.5 - 1.5 barg
              Discharge pressure PI-100-002:   8.5 - 10.0 barg
              Flow FI-100-002:                 200 - 300 m3/h
              Motor current II-100-001:        60 - 80% FLA
              Bearing temp DE TI-100-003:      < 80 deg C
              Bearing temp NDE TI-100-004:     < 80 deg C
              Seal flush flow FI-100-010:      > 2 L/min
              Vibration VI-100-001:            < 7.1 mm/s RMS
            NOTIFY Shift Supervisor that pump 100-PP-001A is in service.

Step 5.1.8: TRANSFER flow control loop FIC-100-002 from MANUAL to AUTO.
            Performed by: Board Operator
            Location: DCS Console - Area 100 Control Loop Screen
            Expected Response: Control valve FV-100-002 modulates to maintain
                              setpoint; flow stabilizes at 250 m3/h +/- 5%
            NOTE: Monitor loop for 10 minutes after transfer. If loop oscillates,
                  return to MANUAL and notify Process Engineer for tuning.
            Verification: FIC-100-002 in AUTO mode; PV tracks SP within +/- 5%

STARTUP COMPLETE - Record time and parameters in shift log.
```

### Example Abnormal Situation Table

```
SECTION 7: ABNORMAL SITUATIONS - SLURRY PUMP 100-PP-001A/B

| # | Symptom | Probable Cause | Immediate Action | Corrective Action |
|---|---------|---------------|-----------------|-------------------|
| 1 | High discharge pressure (PI-100-002 > 11.0 barg), alarm PAH-100-002 | Blocked discharge line | REDUCE pump speed or THROTTLE discharge | Investigate blockage; flush line if safe |
|   | | Closed downstream valve | CHECK downstream valve positions | OPEN downstream valve |
|   | | Product viscosity increase | CHECK process conditions | ADJUST process parameters |
| 2 | Low suction pressure (PI-100-001 < 0.3 barg), alarm PAL-100-001 | Low suction tank level | CHECK LI-100-001 level | INCREASE feed to suction tank |
|   | | Blocked suction strainer | STOP pump; CHECK DP across strainer | CLEAN strainer per MOP-100-003 |
|   | | Suction line air entrainment | REDUCE pump speed | VENT pump casing; check suction line integrity |
| 3 | High vibration (VI-100-001 > 7.1 mm/s), alarm VAH-100-001 | Cavitation | REDUCE flow rate; CHECK NPSH | Investigate suction conditions |
|   | | Bearing wear/damage | PREPARE standby pump | SWITCH to standby; schedule bearing replacement |
|   | | Misalignment | MONITOR trend | Schedule alignment check at next shutdown |
|   | | Impeller damage/imbalance | STOP pump if > 11.0 mm/s | Inspect impeller; replace if damaged |
| 4 | High bearing temperature (TI-100-003 > 80C), alarm TAH-100-003 | Lubrication failure | CHECK oil level/grease condition | REPLENISH lubrication per vendor manual |
|   | | Bearing wear | STOP pump if > 95C (TRIP at 100C) | Replace bearing per MOP-100-005 |
|   | | Cooling system failure | CHECK cooling water flow | RESTORE cooling water supply |

IF any TRIP condition is reached, pump will auto-stop via safety interlock.
REFER TO EOP-100-001 for pump trip recovery procedure.
```
