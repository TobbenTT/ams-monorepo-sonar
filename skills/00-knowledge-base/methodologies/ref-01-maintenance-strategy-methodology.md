# REF-01: Maintenance Strategy Development Methodology (RCM/MSO)

## Source: R8 Documentation, Anglo American Asset Tactics Development Process

---

## 1. The 5-Phase Cyclic Process

```
Phase 1: ASSESS CRITICALITY
    ↓
Phase 2: DEVELOP TACTICS (RCM Core)
    ↓
Phase 3: ASSESS TACTICS (Management Review)
    ↓
Phase 4: IMPLEMENT TACTICS (Work Packaging + CMMS Upload)
    ↓
Phase 5: IMPROVE TACTICS (Continuous Improvement)
    ↓
    ↻ (cycle back to Phase 1)
```

---

## 2. Phase 1: Criticality Assessment

### 2.1 Preparation

- Define cross-functional assessment team
- Gather asset data and define hierarchy level of detail
- Define criticality matrix parameters (convert generic to site-specific)
- Define equipment boundaries, sub-systems, assemblies

### 2.2 Criticality Assessment Matrix

**11 Consequence Categories:**

| # | Category | Type |
|---|----------|------|
| 1 | Capital cost | Financial |
| 2 | Project schedule | Financial |
| 3 | Operating cost | Financial |
| 4 | Production volume | Financial |
| 5 | Revenue | Financial |
| 6 | Safety | Non-financial |
| 7 | Health | Non-financial |
| 8 | Environment | Non-financial |
| 9 | Communication Relations | Non-financial |
| 10 | Conformance and Compliance | Non-financial |
| 11 | Business Reputation | Non-financial |

**5 Likelihood Levels:**

| Level | Name | Description |
|-------|------|-------------|
| 5 | Almost certain | Expected to occur in most circumstances |
| 4 | Likely | Will probably occur |
| 3 | Possible | Could occur at some time |
| 2 | Unlikely | Not expected but possible |
| 1 | Rare | May only occur in exceptional circumstances |

**4 Risk Classes:**

| Class | Level | Action |
|-------|-------|--------|
| I | Low | Below risk acceptance threshold, no active management needed |
| II | Medium | On threshold, requires active monitoring |
| III | High | Exceeds threshold, requires proactive management |
| IV | Critical | Significantly exceeds threshold, urgent attention |

### 2.3 Alternative Simplified Criticality Method

- Consequence: Safety (weight 10), Environment (weight 10), Process Criticality (weight 5)
- Probability factors: Process Severity, Condition, Existing Maintenance, Complexity
- Score bands: 200-250 = Criticality 1, 150-199 = 2, 100-149 = 3, 50-99 = 4, <50 = 5

---

## 3. Phase 2: Develop Tactics (The RCM Core)

### 3.1 Equipment Decomposition (Plant Hierarchy)

**5-Level Recommended Hierarchy:**

```
Level 1: Area (Business Unit / Folder)
  Level 2: System (Equipment Group / Folder)
    Level 3: Equipment Type (Equipment)
      Level 4: Sub-Assembly / System (Folder / Maintainable)
        Level 5: Component (Maintainable Item)
```

**R8 Operational Hierarchy (3 levels):**

```
Level 1: Equipment (e.g., SAG Mill 001)
  Level 2: System (e.g., Mechanical System, Electrical System, Drive System)
    Level 3: Maintainable Item (e.g., Head Pulley, Motor, Bearing)
```

**Rules for Maintainable Items:**

- Must have high safety implication, OR
- Components likely to fail, OR
- Require specific maintenance activities for periodic inspections, OR
- Considered for change out during overhaul
- A sub-component changed/repaired WITH the maintainable item = becomes a failure mode "What", NOT a separate maintainable item
- Every maintainable item MUST have a replacement task

### 3.2 Functional Analysis

For each maintainable item/system:

**Primary Function:** Format = Verb + Noun + Performance Standard

- Example: "To pump slurry to the Primary Cyclone Feed at a minimum rate of 9,772 m3/Hr at a pressure of 365kPa"

**Secondary Functions:** Safety, control, containment, environmental protection, appearance

**Protective Devices:** Guards over rotating assemblies, relief valves, etc.

**Functional Failures:** Both Total and Partial

- TOTAL = "Pumps 0" (complete loss of function)
- PARTIAL = "Delivers slurry at less than 9,772 m3/Hr" (function at unacceptable level)

### 3.3 Failure Mode Analysis (FMEA)

**Failure Mode = What + Mechanism + Cause**

**What:** The sub-component that fails

- Must start with capital letter
- Must be singular (Seal, not Seals)
- Must specify exact location

**Mechanism (18 authoritative mechanisms -- SRC-09):**

> **MANDATORY**: All valid Mechanism + Cause combinations are defined in `Failure Modes (Mechanism + Cause).xlsx` (SRC-09). Only the 72 combinations listed in that lookup table are permitted. See gemini.md section 4.4 for enforcement rules.

| # | Mechanism | Description |
|---|-----------|-------------|
| 1 | Arcs | Electrical arcing |
| 2 | Blocks | Flow/passage obstruction |
| 3 | Breaks / Fracture / Separates | Structural separation |
| 4 | Corrodes | Chemical/electrochemical degradation |
| 5 | Cracks | Surface/structural cracking |
| 6 | Degrades | General material degradation |
| 7 | Distorts | Shape/dimensional change |
| 8 | Drifts | Parameter drift from specification |
| 9 | Expires | Time-limited component expiration |
| 10 | Immobilised | Seized/stuck/frozen |
| 11 | Looses Preload | Fastener/connection loosening |
| 12 | Open Circuit | Electrical discontinuity |
| 13 | Overheats / Melts | Thermal failure |
| 14 | Severs | Complete separation by cutting |
| 15 | Short Circuits | Electrical short |
| 16 | Thermally Overloads | Thermal capacity exceeded |
| 17 | Washes Off | Surface treatment/coating removal |
| 18 | Wears | Gradual material loss through friction |

**Cause (44 authoritative causes -- SRC-09):**

| # | Cause | Category |
|---|-------|----------|
| 1 | Abrasion | Operational |
| 2 | Age | Calendar |
| 3 | Bio Organisms | Calendar |
| 4 | Breakdown in Insulation | -- |
| 5 | Chemical Attack | Calendar |
| 6 | Contamination | Calendar |
| 7 | Corrosive Environment | Calendar |
| 8 | Creep | -- |
| 9 | Cyclic Loading | Operational |
| 10 | Electrical Overload | -- |
| 11 | Erosion | -- |
| 12 | Excessive Fluid Velocity | Operational |
| 13 | Excessive Particle Size | -- |
| 14 | Exposure to Atmosphere | Calendar |
| 15 | Fatigue | -- |
| 16 | Flashover | -- |
| 17 | Fouling | -- |
| 18 | Heat | -- |
| 19 | High Resistance Connection | -- |
| 20 | Impact / Shock Loading | Operational |
| 21 | Inadequate Lubrication | -- |
| 22 | Incorrect Material | -- |
| 23 | Internal Leakage | -- |
| 24 | Mechanical Overload | Operational |
| 25 | Metal to Metal Contact | Operational |
| 26 | Misalignment | -- |
| 27 | Over Pressure | -- |
| 28 | Over Torque | -- |
| 29 | Overload | -- |
| 30 | Relative Movement | Operational |
| 31 | Rubbing | Operational |
| 32 | Saturation | -- |
| 33 | Seal Failure | -- |
| 34 | Settlement | -- |
| 35 | Short Circuit | -- |
| 36 | Temperature Fluctuation | -- |
| 37 | Tension | -- |
| 38 | Thermal Expansion | -- |
| 39 | Use | Operational |
| 40 | Valve Leak Past | -- |
| 41 | Vibration | -- |
| 42 | Voltage Surge | -- |
| 43 | Water Hammer | -- |
| 44 | Wrong Chemical Concentration | -- |

> **NOTE**: "Calendar" causes should use calendar-based frequency units (days/weeks/months/years). "Operational" causes should use operational frequency units (hours/operating_hours/tonnes/cycles). See REF-04 section 3 for frequency unit validation rules.

**Failure Effects** must describe:

1. Evidence of failure (what does the operator see/hear/feel?)
2. Safety/environment threat
3. Production impact
4. Physical damage to other equipment
5. Repair requirements and estimated downtime

**Failure Consequences Classification:**

```
Is the failure HIDDEN or EVIDENT?
  └─ If HIDDEN: Does it have safety consequences?
  └─ If EVIDENT:
       ├─ Safety consequence
       ├─ Environmental consequence
       ├─ Operational consequence (affects production)
       └─ Non-operational consequence (repair cost only)
```

**6 Failure Patterns (Nowlan & Heap):**

| Pattern | Name | Description | Prevalence |
|---------|------|-------------|------------|
| A | Bathtub | Infant mortality + wear-out | Low |
| B | Age-related | Increasing probability with age | Low |
| C | Fatigue | Slowly increasing probability | Moderate |
| D | Stress-related | Constant probability | Moderate |
| E | Random | Constant probability (lower than D) | High |
| F | Early life | Highest when new, decreases with age | Most common |

### 3.4 Maintenance Strategy Selection Decision Tree

```
STEP 1: Is the failure HIDDEN or EVIDENT?
│
├── HIDDEN FAILURE
│   ├── Can a proactive task reduce risk of multiple failure?
│   │   ├── YES → Select proactive task (CBM or FFI)
│   │   └── NO → Select FAULT FINDING task
│   │            └── If not feasible → REDESIGN
│   │
│   └── FAULT FINDING: Test at regular intervals to discover hidden failure
│       Example: Test safety relief valve, test fire suppression system
│       Frequency based on: acceptable probability of multiple failure
│
└── EVIDENT FAILURE
    ├── What are the CONSEQUENCES?
    │   ├── Safety/Environmental
    │   ├── Operational (production impact)
    │   └── Non-operational (repair cost only)
    │
    ├── QUESTION 1: Is CONDITION-BASED monitoring feasible?
    │   ├── Is there a detectable potential failure (P) before functional failure (F)?
    │   ├── Is the P-F interval consistent?
    │   ├── Can we monitor at intervals < P-F interval?
    │   ├── Is there enough warning time for corrective action?
    │   └── ALL YES → CONDITION-BASED MAINTENANCE
    │       Techniques: Vibration analysis, Oil analysis, Thermography,
    │                   Visual inspection, NDT, Ultrasound, Motor current analysis
    │
    ├── QUESTION 2: Is TIME-BASED maintenance feasible?
    │   (Only for age-related failure patterns A, B, C)
    │   ├── Scheduled restoration (overhaul at fixed time)
    │   └── Scheduled discard (replacement at fixed time)
    │
    └── NO PROACTIVE TASK FOUND:
        ├── Safety/Environmental consequence → REDESIGN (mandatory)
        ├── Operational consequence → RUN-TO-FAILURE
        │   (only if cost of failure < cost of prevention)
        └── Non-operational consequence → RUN-TO-FAILURE
```

### 3.5 Strategy Types

| Code | Strategy | Description | Primary Task? | Secondary Task? | Requires Limits? |
|------|----------|-------------|---------------|-----------------|------------------|
| CB | Condition Based | Inspections, checks, tests based on equipment condition | YES (with interval) | YES (triggered by limits) | YES |
| FT | Fixed Time | Replace, repair, lube, clean, tighten at fixed intervals | YES (with interval) | NO | NO |
| RTF | Run to Failure | No scheduled maintenance -- allow to fail | NO | YES (triggered by failure) | NO |
| FFI | Fault Finding Interval | Functional tests for hidden failures | YES (with interval) | YES (triggered by limits) | YES |
| RD | Redesign | Modification to eliminate failure mode | NO | NO | NO |
| OEM | OEM Prescribed | Original Equipment Manufacturer prescribed plans | Varies | Varies | Varies |

**Strategy-Task Rules:**

- **CB and FFI**: Have a **primary task** (proactive inspection/test with a fixed frequency) AND a **secondary task** (corrective action triggered when acceptable limits are exceeded). The primary task defines the inspection and its acceptable limits; the secondary task defines the corrective response.
- **FT**: Has only a **primary task** (proactive maintenance with a fixed frequency). No acceptable limits exist because the condition is not being evaluated -- the task is executed regardless of component condition.
- **RTF**: Has only a **secondary task** (corrective action triggered by the failure mode). When the component fails due to that failure mode, the secondary task is triggered. There is no scheduled proactive maintenance.
- **RD (Redesign)**: No tasks -- the failure mode is addressed through design modification.
- **REDUNDANT**: A strategy status (not a type) indicating the failure mode is already covered by another strategy or has been eliminated. Requires a justification.

> **IMPORTANT -- Task vs Strategy Separation:**
>
> A **maintenance task** is a standalone, reusable action definition that specifies WHAT to do (inspect, replace, lubricate, etc.), the required resources (labour, materials, tools), and execution constraints (online/offline). Tasks do NOT have a frequency -- they are independent of any specific failure mode or strategy.
>
> A **maintenance strategy** links a specific failure mode (equipment + component + what/mechanism/cause) to one or more tasks and assigns the execution context: strategy type, frequency/interval, acceptable limits, and conditional comments. The same task can be reused across multiple strategies.
>
> In the data loading model, these are two separate files:
> - **Template 04** (`04_maintenance_tasks.xlsx`): Task catalog -- defines tasks without frequency
> - **Template 14** (`14_maintenance_strategy.xlsx`): Strategy register -- links failure modes to tasks with interval, limits, and strategy type

**Preference Order:**

1. Condition-based takes preference over other tasks, when practical
2. Intrusive maintenance (opening a machine) is to be avoided
3. Only maintenance that is necessary should be performed
4. Task lists must be written to manage and minimize human error

### 3.6 Frequency Selection Guidance

| Failure Cause | Frequency Basis | Examples |
|---------------|-----------------|----------|
| Age, Contamination | Calendar-based (weeks, months) | "Every 12 months" |
| Use, Abrasion, Erosion | Operational units (hours, tonnes, cycles) | "Every 2000 operating hours" |
| CBM-detected | Based on P-F interval | "Check every P-F/3 interval" |

**Key rule:** CBM frequency is based on P-F interval, NOT on failure frequency or criticality.

---

## 4. Phase 2 (continued): Task & Strategy Definition

> **IMPORTANT -- Task vs Strategy Separation:**
>
> A **maintenance task** is a standalone, reusable action definition. It specifies WHAT to do
> (inspect, replace, lubricate, etc.), the required resources (labour, materials, tools), and
> execution constraints (online/offline). Tasks do **NOT** have a frequency -- frequency belongs
> to the strategy. The same task can be referenced by multiple strategies.
>
> A **maintenance strategy** links a specific failure mode to one or more tasks and assigns
> the execution context: strategy type (CB/FT/RTF/FFI/RD), frequency/interval, acceptable
> limits, and conditional comments.
>
> **Data loading model:**
> - Template 04 (`04_maintenance_tasks.xlsx`) -- Task catalog (no frequency)
> - Template 14 (`14_maintenance_strategy.xlsx`) -- Strategy register (links FMs to tasks with interval/limits)

### 4.1 Task Fields (Standalone Definition)

Tasks are standalone, reusable action definitions. They do NOT have frequency, acceptable limits, or conditional comments -- those fields belong to the strategy level (section 4.1b).

| Field | Description | Mandatory |
|-------|-------------|-----------|
| Task ID | Unique identifier, reusable across multiple strategies | M |
| Name | Verb in infinitive + What + Evidence/Action (see section 4.2) | M |
| Name (French) | French translation of task name | O |
| Task Type | Inspect, Check, Test, Lubricate, Clean, Replace, Repair, Service | M |
| Constraint | Online / Offline / Test Mode | M |
| Access Time | Downtime duration for offline tasks (hours) | M |
| Budgeted As | NOT_BUDGETED, REPAIR (sub-component), or REPLACE (entire MI) | O |
| Budgeted Life | Estimated useful life of the component | O |
| Budgeted Life Time Units | Calendar units: YEARS, MONTHS, WEEKS | O |
| Budgeted Life Op. Units | Operational units: hours, tonnes, cycles | O |
| Consequences | What happens if task not performed | M |
| Justification | Why the task is performed | O |
| Origin | Source: OEM manual, statutory, library, workshop | O |
| Notes | Additional notes | O |

### 4.1b Strategy Fields (Links Tasks to Failure Modes)

A strategy row links a specific failure mode to its selected maintenance approach. Each row in the strategy register represents one failure mode and its associated primary and/or secondary tasks.

| Field | Description | Mandatory |
|-------|-------------|-----------|
| Strategy ID | Unique strategy identifier | M |
| Equipment Tag | Equipment being addressed | M |
| Maintainable Item | Component within the equipment | M |
| Function & Failure | Functional failure being addressed | M |
| What | Sub-component that fails (starts uppercase, singular) | M |
| Mechanism | Failure mechanism (18 values, see section 3.3) | M |
| Cause | Failure cause (44 values, see section 3.3) | M |
| Status | RECOMMENDED or REDUNDANT | M |
| Tactics Type | CB, FT, RTF, FFI, RD, OEM | M |
| Primary Task ID | Reference to the proactive task | M (CB/FT/FFI) |
| Primary Task Interval | Frequency value for the primary task | M (CB/FT/FFI) |
| Operational Units | hours, tonnes, cycles (for operational causes) | Conditional |
| Time Units | weeks, months, years (for calendar causes) | Conditional |
| Acceptable Limits | Threshold that triggers the secondary task | M (CB/FFI) |
| Conditional Comments | Action when limits are exceeded | M (CB/FFI) |
| Primary Task Constraint | Online / Offline / Test Mode for primary task | M (CB/FT/FFI) |
| Primary Task Type | Inspect, Check, Test, Lubricate, etc. | M (CB/FT/FFI) |
| Primary Task Access Time | Hours of downtime for primary task | M (CB/FT/FFI) |
| Secondary Task ID | Reference to the corrective task | M (CB/FFI/RTF) |
| Secondary Task Constraint | Online / Offline for secondary task | M (CB/FFI/RTF) |
| Secondary Task Type | Replace, Repair, Service | M (CB/FFI/RTF) |
| Secondary Task Access Time | Hours of downtime for secondary task | M (CB/FFI/RTF) |
| Secondary Task Comments | Additional corrective notes | O |
| Budgeted As | NOT_BUDGETED, REPAIR, or REPLACE | O |
| Budgeted Life | Estimated life of component | O |
| Budgeted Life Time Units | YEARS, MONTHS, WEEKS | O |
| Budgeted Life Op. Units | hours, tonnes, cycles | O |
| Existing Task | Current CMMS task reference (if updating) | O |
| Justification Category | MODIFIED, ELIMINATED, FREQUENCY_CHANGE, TACTIC_CHANGE, MAINTAINED, NEW_TASK | O |
| Justification | Rationale for strategy selection | O (M if REDUNDANT) |

### 4.2 Task Naming Conventions

**Task naming by strategy context:**

| Context | Naming Pattern | Example |
|---------|----------------|---------|
| CB/FFI Primary Task | "Inspect [What] for [evidence]" | "Inspect liners for wear" |
| CB/FFI Secondary Task | "Replace/Repair [What]" | "Replace liners" |
| FT Primary Task | "Verb [What]" | "Lubricate head end bearing" |
| RTF Secondary Task | "Replace/Repair [What]" | "Replace impeller" |

**General naming conventions:**

| Task Type | Format | Example |
|-----------|--------|---------|
| Inspect | "Inspect [MI] for [failure evidence]" | "Inspect bearing housing for leakage" |
| Check | "Check [MI] for [measurable value]" | "Check oil level for correct level" |
| Test | "Perform [type] test of [MI]" | "Perform vibration test of motor" |
| Lubricate | "Lubricate [MI]" | "Lubricate head end bearing" |
| Replace | "Replace [MI]" | "Replace wear liner" |
| Repair | "Repair [MI]" | "Repair impeller" |

**Language rules:**

- Use "for [act of]": leakage (NOT leaks), blockage (NOT blocks), breakage (NOT breaks)
- Sentence case (not all caps)
- Do NOT write "Visually inspect" -- just "Inspect"
- Maximum 72 characters for SAP long text compatibility

### 4.3 Task Resources (apply to both primary and secondary tasks)

**Labour:**

| Field | Description |
|-------|-------------|
| Description | Type: Fitter, Electrician, Instrumentist, Operator, ConMon Specialist, Lubricator |
| Price | Hourly rate (from system) |
| Allocated Quantity | Number of workers |
| Allocated Hours | Hours per worker |

**Materials:**

| Field | Description |
|-------|-------------|
| Description | Name of part/material |
| Unit Price | Cost per unit |
| Part No. | Manufacturer part number |
| Stock Code | CMMS stock code |
| Quantity | Units needed |

**Tools & Equipment:**

| Field | Description |
|-------|-------------|
| Tools Description | Special tools required |
| Task Equipment | Crane, scaffolding, etc. |

---

## 5. Phase 4: Work Packaging

### 5.1 Grouping Rules

Work packages group tasks by:

1. **Labour/work group type** (Mechanical, Electrical, Instrumentation)
2. **Constraint** (Online tasks NEVER with Offline tasks; Offline + Test Mode CAN be together)
3. **Frequency** (all tasks in a WP must match the WP frequency)

### 5.2 Work Package Types

| Type | Description | Rule |
|------|-------------|------|
| Standalone | Single WP executed independently | No dependencies |
| Suppressive | Series of WPs where higher-frequency WPs suppress lower-frequency ones | Intervals must be factors of lowest WP; starts with highest interval |
| Sequential | Sequence of WPs each building on previous | Interval = time from previous WP; all needed tasks allocated to each |

### 5.3 Work Package Naming Convention

**Format:** `[FREQUENCY] [ASSET TYPE] [LABOUR TYPE] [SERV or INSP] [ONLINE or OFFLINE]`

| Element | Examples |
|---------|----------|
| Frequency | 1W, 2W, 4W, 12W, 26W, 52W, 6M, 12M |
| Asset Type | BALL MILL, LAROX FILT, SAG MILL, CONV |
| Labour Type | MECH, ELEC, INST, OPER, CONMON |
| Service/Inspection | SERV, INSP |
| Constraint | ON, OFF |

**Examples:** `12W BALL MILL MECH SERV OFFLINE`, `1W LAROX FILT MECH INSP ONLINE`

**Rules:** Maximum 40 characters, ALL CAPS, use abbreviations.

### 5.4 Work Package Fields

| Field | Description |
|-------|-------------|
| Name | Per naming convention (40 char max) |
| Code | Unique identifier |
| Frequency | Numeric value |
| Frequency Units | Time or operational |
| Constraint | Online / Offline |
| Access Time | Hours of downtime |
| Type | Standalone / Suppressive / Sequential |
| Job Preparation | Pre-task instructions |
| Post Shutdown | Post-task instructions |
| Allocated Tasks | Ordered list of tasks |
| Resources | Labour, tools, equipment, materials |

---

## 6. Phase 3: Tactics Assessment (Management Review)

- Select management assessment team (Superintendent + operational personnel)
- Assess against: Safety, Environment, Production losses, Cost of execution
- Compare mitigated vs. unmitigated business risk
- Syndicate with stakeholders
- Document formal approval

---

## 7. Phase 5: Continuous Improvement

### 7.1 Re-evaluation Triggers

- Time-based review (every 2 years)
- Asset performance changes
- Change of production plan
- Equipment configuration changes
- Defect Elimination investigations
- Standards/regulations changes
- HSE incident investigations

### 7.2 KPIs

- Tasks added/deleted, Man-hours added/deleted
- Training requirements identified
- Changes to parts holding
- Expected benefits (cost, availability, MTTR, MTBF, production)
- % components with tactics completed
- % entered into CMMS
- % actively executed

---

## 8. Three Starting Approaches

### Approach 1: Library Models (Most Common)

Start with generic library model -> Workshop validation -> Customize per site

- Workshop team: Senior consultant, Consultant, Reliability Engineer, Senior Trader

### Approach 2: Existing Tasks (MSO)

Start with existing Work Instructions from CMMS -> Analyze per labour type -> Map to failure modes -> Standardize

### Approach 3: RCM from Scratch

No predefined mindset -> Analyze functions from first principles -> Most thorough but most resource-intensive

---

## 9. Quality Validation Rules

### 9.1 Hierarchy QA

- [ ] Build to maximum 3 levels
- [ ] CMMS component type code on every maintainable item
- [ ] Verify SAP hierarchy matches physical plant
- [ ] Compare with P&ID for missing equipment

### 9.2 Function/Failure QA

- [ ] All systems have functions and functional failures defined
- [ ] All maintainable items have functions and functional failures defined
- [ ] Every equipment has criticality at equipment level

### 9.3 Strategy/Failure Mode QA

- [ ] "What" starts with capital letter, singular, specific location
- [ ] All CB strategies have acceptable limit AND conditional comment
- [ ] All FFI strategies have acceptable limit AND conditional comment
- [ ] Primary tasks follow naming convention: "Inspect [what] for [that]"
- [ ] All strategies have constraint, task type, labour, intervals defined
- [ ] Strategies have consistent time/operational units matching cause category
- [ ] All replacement tasks have materials in costing
- [ ] RTF strategies have only secondary task (no primary task, no interval)
- [ ] FT strategies have only primary task (no acceptable limits)

### 9.4 Work Package QA

- [ ] Grouped by: work group type + constraint + frequency
- [ ] Every task allocated to a work package
- [ ] Naming convention: CAPS, max 40 chars
- [ ] Suppressive: starts with highest interval; intervals are factors
- [ ] Sequential: whole sequence created; starts from beginning
- [ ] All tasks have labour assigned (quantity + hours)
- [ ] All materials have quantity defined
