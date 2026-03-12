# Templates & References - manage-loop-checking

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed templates & references for this skill.*

---

## Templates & References

### Loop Check Sheet Template (Analog Input)

```
=============================================================
LOOP CHECK SHEET - ANALOG INPUT
=============================================================
Project: {ProjectCode}              System: {SystemCode}
Loop Tag: {TagNumber}               P&ID: {PIDRef}
Description: {ServiceDescription}
Location: {Area/Building/Level}

INSTRUMENT SPECIFICATIONS:
  Type: {InstrumentType}           Manufacturer: {Mfr}
  Model: {Model}                   Serial No: {SN}
  Range: {RangeMin} to {RangeMax} {EU}
  Signal: {SignalType} (e.g., 4-20 mA)
  Accuracy: +/- {Accuracy}% of span

TERMINATION PATH:
  Field Device -> JB {JBNumber} TB {TerminalBlock}
  JB -> Marshalling Cabinet {MCNumber} TB {TerminalBlock}
  MC -> Controller {ControllerName} Module {Module} Ch {Channel}

TEST PROCEDURE:
  1. Verify power supply: {ExpectedVoltage}VDC [ ] OK [ ] FAIL
  2. Apply 0% input ({RangeMin} {EU}): DCS reads _____ (expected: {RangeMin})
  3. Apply 25% input: DCS reads _____ (expected: {25%Value})
  4. Apply 50% input: DCS reads _____ (expected: {50%Value})
  5. Apply 75% input: DCS reads _____ (expected: {75%Value})
  6. Apply 100% input ({RangeMax} {EU}): DCS reads _____ (expected: {RangeMax})
  7. Verify alarms:
     - HH alarm at {HHSetpoint}: [ ] Triggered [ ] Not triggered
     - H alarm at {HSetpoint}: [ ] Triggered [ ] Not triggered
     - L alarm at {LSetpoint}: [ ] Triggered [ ] Not triggered
     - LL alarm at {LLSetpoint}: [ ] Triggered [ ] Not triggered
  8. Verify trend display on operator screen: [ ] OK [ ] FAIL
  9. Verify engineering units display: [ ] OK [ ] FAIL

RESULT: [ ] PASS  [ ] FAIL  [ ] DEFERRED

If FAIL - Failure Description: _________________________________
Punch List Reference: _________________________________________

Checked By: _____________ Date: ___________
Witnessed By: ____________ Date: ___________
=============================================================
```

### Alarm Rationalization Workshop Agenda Template

```markdown