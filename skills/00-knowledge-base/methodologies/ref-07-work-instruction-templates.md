# REF-07: Work Instruction & Work Package Templates Reference

## Source: Maintenance Work Instruction Template Examples, Anglo American Coal Work Package Templates

---

## 1. Work Instruction Structure

A Work Instruction (WI) is the detailed step-by-step document that accompanies a Work Package when it goes to the field. It is generated from R8 and attached to SAP as a PRT (Production Resource Tool) document.

### 1.1 Standard WI Sections

| Section | Content | Purpose |
|---------|---------|---------|
| **Header** | WP name, equipment, frequency, constraint (Online/Offline) | Identification |
| **Safety** | Isolation requirements, PPE, LOTOTO, confined space, hot work | Worker safety |
| **Pre-Task** | Job preparation, permits, tools, materials to gather | Setup |
| **Task List** | Ordered operations with descriptions, acceptable limits, conditional comments | Execution |
| **Resources** | Labour (type, quantity, hours), materials (code, qty), tools | Resource allocation |
| **Post-Task** | Cleanup, de-isolation, documentation, sign-off | Completion |

### 1.2 Task List Operation Detail

Each operation within a WI contains:

| Field | Description | Example |
|-------|-------------|---------|
| Operation # | Sequential number (10, 20, 30...) | 10 |
| Work Centre | Trade/specialty code | S32A2ME (Electrician) |
| Description | Task description (sentence case, max 72 chars) | "Inspect motor terminal box for signs of overheating" |
| Acceptable Limits | Pass/fail criteria (for CB/FFI) | "No discoloration, burns, or melted insulation" |
| Conditional Comments | Action if limits exceeded | "Isolate motor, report to Supervisor, raise corrective WO" |
| Duration | Hours for this operation | 0.5 |
| # Workers | People required | 1 |
| Materials | Parts needed for this operation | "Terminal lug kit (stock: 12345), qty: 1" |

---

## 2. Work Package Types — Template Patterns

### 2.1 Inspection Route (Online)

```
Name: 1W [ASSET] [TRADE] INSP ON
Constraint: Online
Frequency: Weekly or bi-weekly
Typical duration: 1-4 hours
Typical team: 1 person

Operations:
  10: Visual inspection of [component 1] for [evidence]
  20: Check [component 2] for [measurable value]
  30: Visual inspection of [component 3] for [evidence]
  ...

Materials: Usually none (inspection only)
Tools: Torch, notebook, camera, PPE
```

### 2.2 Service Package (Offline)

```
Name: 12W [ASSET] MECH SERV OFF
Constraint: Offline (equipment stopped)
Frequency: 12-weekly or longer
Typical duration: 4-24 hours
Typical team: 2-4 people

Operations:
  10: Isolate equipment per LOTOTO procedure
  20: Replace [wear component 1]
  30: Lubricate [component 2]
  40: Inspect [component 3] for [evidence]
  50: Check [alignment/tolerance] for [specification]
  60: Replace [consumable]
  70: De-isolate and test run
  80: Verify normal operation

Materials: Wear parts, lubricants, gaskets, filters, fasteners
Tools: Standard trade tools + any special equipment (crane, torque wrench)
```

### 2.3 Condition Monitoring Route (Online)

```
Name: 4W [ASSET] CONMON INSP ON
Constraint: Online (equipment running)
Frequency: 4-weekly typical
Typical duration: 1-2 hours
Typical team: 1 ConMon specialist

Operations:
  10: Perform vibration analysis of [bearing point 1]
  20: Perform vibration analysis of [bearing point 2]
  30: Perform thermography scan of [component]
  40: Record oil sample from [sampling point]

Acceptable Limits: Per site vibration/temperature standards
Materials: Oil sampling bottles, labels
Tools: Vibration analyzer, thermal camera, oil sampling kit
```

### 2.4 Fault Finding Test (Test Mode)

```
Name: 26W [ASSET] INST FFI TEST
Constraint: Test Mode
Frequency: 26-weekly (6 months) typical for safety devices
Typical duration: 0.5-2 hours
Typical team: 1 Instrumentist + 1 Operator

Operations:
  10: Notify control room of test
  20: Simulate [condition] on [safety device]
  30: Verify [device] activates within [acceptable time/parameters]
  40: Record test results
  50: Return system to normal operation
  60: Notify control room test complete

Acceptable Limits: Device must activate within [spec] seconds
Conditional Comments: If device fails to activate, isolate and raise Priority 2 corrective WO
```

---

## 3. Anglo American Coal Work Package Template Fields

### 3.1 Cover Page

| Field | Description |
|-------|-------------|
| Site Name | Mine/plant name |
| Equipment Name | Full equipment description |
| Equipment Number | SAP equipment number or TAG |
| Work Package Name | Per naming convention |
| Work Package Code | Unique identifier |
| Revision | Version number |
| Date | Issue date |
| Prepared By | Author name and role |
| Reviewed By | Reviewer name and role |
| Approved By | Approver name and role |

### 3.2 Safety Section

| Field | Description |
|-------|-------------|
| Risk Assessment Reference | Link to risk assessment |
| Isolation Requirements | LOTOTO procedure reference |
| Permits Required | Hot work, confined space, working at height, etc. |
| PPE Requirements | Hard hat, safety glasses, gloves, respirator, etc. |
| Environmental Controls | Spill containment, waste disposal, dust suppression |
| Emergency Procedures | Nearest phone, assembly point, first aid |

### 3.3 Resource Summary

| Field | Description |
|-------|-------------|
| Total Duration | Hours (access time + execution time) |
| Trades Required | List of specialties and number of people |
| Materials Required | Summary list with stock codes |
| Special Tools | Non-standard tools needed |
| Special Equipment | Crane, scaffold, EWP, etc. |
| Contractor Support | External support if needed |

### 3.4 Task List (Operations)

| Col | Field | Description |
|-----|-------|-------------|
| 1 | Op # | Sequential number (10, 20, 30...) |
| 2 | Trade | Work centre / specialty |
| 3 | Task Description | What to do (sentence case) |
| 4 | Acceptable Limits | Pass/fail criteria |
| 5 | Conditional Comments | Action if outside limits |
| 6 | Duration (hrs) | Time for this operation |
| 7 | # People | Workers needed |
| 8 | Materials | Parts and quantities |
| 9 | Notes | Additional instructions |
| 10 | Sign-off | Technician initials + date |

### 3.5 Completion Section

| Field | Description |
|-------|-------------|
| Work Completed By | Technician name, signature, date |
| Supervisor Sign-off | Supervisor name, signature, date |
| Defects Found | Free text for any issues discovered |
| Follow-up Actions | Additional work orders to raise |
| De-isolation Confirmed | Checkbox + sign-off |
| Equipment Returned to Service | Checkbox + sign-off |

---

## 4. Naming Conventions Summary

### 4.1 Work Package Names

**Format:** `[FREQ] [ASSET] [TRADE] [TYPE] [CONSTRAINT]`

| Element | Abbreviations |
|---------|--------------|
| Frequency | 1W, 2W, 4W, 8W, 12W, 26W, 52W, 6M, 12M, 2Y |
| Asset | CONV (conveyor), SAG, BALL ML, PUMP, CRUSH, FLOT, THICK |
| Trade | MECH, ELEC, INST, OPER, CONMON, LUBE |
| Type | SERV (service), INSP (inspection) |
| Constraint | ON (online), OFF (offline), TEST |

**Rules:** Max 40 chars, ALL CAPS, no special characters.

### 4.2 Task Descriptions

| Task Type | Format | Example |
|-----------|--------|---------|
| Inspect | "Inspect [MI] for [act of failure]" | "Inspect drive motor for excessive vibration" |
| Check | "Check [MI] [measurable parameter]" | "Check gearbox oil level" |
| Test | "Perform [type] test of [MI]" | "Perform insulation resistance test of motor" |
| Lubricate | "Lubricate [MI]" | "Lubricate head end bearing" |
| Replace | "Replace [MI]" | "Replace wear liner set" |
| Repair | "Repair [MI]" | "Repair seal assembly" |
| Clean | "Clean [MI]" | "Clean strainer basket" |

**Rules:** Sentence case, max 72 chars for SAP compatibility, use "for [act of]" (leakage, blockage, breakage).

---

## 5. Material / Spare Parts in Work Instructions

### 5.1 Material Fields per Task

| Field | Description | Required |
|-------|-------------|----------|
| Material Description | Human-readable name | M |
| Stock Code | CMMS/SAP material code | M |
| Part Number | Manufacturer part number | O |
| Quantity | Number of units needed | M |
| Unit of Measure | EA (each), L (litre), KG, M (metre) | M |
| Criticality | Critical / Important / Standard | O |

### 5.2 Material Kit Concept

A **Material Kit** (or **Service Kit**) is a pre-assembled set of materials for a specific work package:

| Field | Description |
|-------|-------------|
| Kit Name | e.g., "12W SAG Mill Mech Service Kit" |
| Kit Code | Unique identifier |
| Components | List of materials with quantities |
| Applicable WP | Work package(s) that use this kit |

**Purpose:** Pre-staging materials in warehouse before WP execution reduces downtime.

---

## 6. Mapping to Software Module

These templates inform the following software requirements:

| Template Element | Software Module Feature |
|-----------------|----------------------|
| WP naming convention | Auto-generate WP names from frequency + asset + trade + constraint |
| Task list operations | Ordered task list editor with all fields |
| Acceptable limits | AI can suggest limits from library + OEM manuals |
| Conditional comments | AI can suggest corrective actions |
| Resource summary | Auto-calculate from task-level resources |
| Material lists | Auto-populate from failure mode → spare parts mapping |
| Safety section | Template-driven based on constraint + equipment type |
| Completion section | Digital sign-off workflow |
| WI export | Generate PDF/Word work instruction documents |
| SAP upload sheets | Generate Maintenance Item + Task List + Work Plan templates |
