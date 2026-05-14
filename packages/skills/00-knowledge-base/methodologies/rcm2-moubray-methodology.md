# RCM2 - Reliability-Centred Maintenance (John Moubray)

> **Source:** John Moubray, *Reliability-centred Maintenance*, 2nd Edition, 1997 (Butterworth-Heinemann)
> **ISBN:** 0 7506 3358 1
> **Purpose:** Comprehensive reference document for the RCM2 methodology as the foundational framework for AI-driven maintenance strategy development
> **Scope:** Covers the complete 7-question RCM process: Functions, Functional Failures, Failure Modes & Effects, Consequences, Proactive Tasks, Default Actions, and the Decision Diagram

## Used By Modules

- **Maintenance Strategy Development** - Core RCM decision logic, task selection sequence
- **Function Definition** - How to define and structure functions with performance standards
- **Failure Mode Analysis (FMECA)** - Failure modes, effects, consequence classification
- **Criticality Assessment** - Consequence categories, hidden vs. evident failures
- **Work Planning** - Task descriptions, work packages, scheduling
- **Reliability Engineering** - P-F intervals, age-failure patterns, Weibull distributions
- **Defect Elimination** - Root cause analysis, human error taxonomy

---

## Table of Contents

1. [Foundations of RCM](#1-foundations-of-rcm)
2. [The Seven Basic Questions of RCM](#2-the-seven-basic-questions-of-rcm)
3. [Question 1: Functions and Performance Standards](#3-question-1-functions-and-performance-standards)
4. [Question 2: Functional Failures](#4-question-2-functional-failures)
5. [Questions 3-4: Failure Modes and Effects Analysis (FMEA)](#5-questions-3-4-failure-modes-and-effects-analysis-fmea)
6. [Question 5: Failure Consequences](#6-question-5-failure-consequences)
7. [Question 6: Proactive Tasks — Preventive Maintenance](#7-question-6-proactive-tasks--preventive-maintenance)
8. [Question 6: Proactive Tasks — Predictive Maintenance (On-Condition)](#8-question-6-proactive-tasks--predictive-maintenance-on-condition)
9. [Question 7: Default Actions](#9-question-7-default-actions)
10. [The RCM Decision Diagram](#10-the-rcm-decision-diagram)
11. [Implementation of RCM Recommendations](#11-implementation-of-rcm-recommendations)
12. [Age-Failure Patterns and Actuarial Analysis](#12-age-failure-patterns-and-actuarial-analysis)
13. [Applying the RCM Process](#13-applying-the-rcm-process)
14. [Human Error in the RCM Framework](#14-human-error-in-the-rcm-framework)
15. [Condition Monitoring Techniques](#15-condition-monitoring-techniques)
16. [What RCM Achieves](#16-what-rcm-achieves)

---

## 1. Foundations of RCM

### 1.1 Definition

**Reliability-Centred Maintenance (RCM)** is defined as:

> *A process used to determine the maintenance requirements of any physical asset in its operating context.*

More fully: *a process used to determine what must be done to ensure that any physical asset continues to do whatever its users want it to do in its present operating context.*

### 1.2 Core Principle: Maintenance Preserves Function, Not Assets

The fundamental insight of RCM is that **maintenance is not about preserving assets — it is about preserving the functions that users require those assets to perform.** An asset is only put into service because someone wants it to *do something*. Therefore, the state we wish to preserve through maintenance is one in which the asset continues to do whatever its users want it to do.

This is fundamentally different from the idea of "asset care" which focuses on the physical condition of assets *per se*. RCM focuses on what the asset *does* (its functions) rather than what the asset *is*.

### 1.3 The Three Generations of Maintenance

| Generation | Period | Characteristics |
|---|---|---|
| **First** | Pre-1950 | Simple equipment, low mechanisation; fix it when it breaks |
| **Second** | 1950–1975 | Increased mechanisation; scheduled overhauls at fixed intervals; maintenance planning & control systems |
| **Third** | 1975–present | Condition monitoring; design for reliability & maintainability; hazard studies; FMEA; small group work; RCM |

### 1.4 The Challenge of Modern Maintenance

Modern maintenance managers must:

1. Select the most appropriate techniques to deal with each type of failure process
2. Fulfil the expectations of asset owners, users, and society
3. Do so in the most cost-effective and enduring fashion
4. With the active support and cooperation of all the people involved

### 1.5 Maintenance vs. Modification

- **Maintain** = cause to continue / keep in an existing state (preserve function)
- **Modify** = change in some way (alter capability)

RCM considers the maintenance requirements of each asset *before* asking whether it is necessary to reconsider the design. The maintenance engineer on duty today must maintain the equipment as it exists today.

---

## 2. The Seven Basic Questions of RCM

The RCM process requires that **seven questions** be answered about each asset or system under review, in the following order:

| # | Question | Chapter |
|---|---|---|
| 1 | What are the **functions** and associated **performance standards** of the asset in its present operating context? | Functions |
| 2 | In what ways does it **fail to fulfil its functions**? | Functional Failures |
| 3 | What **causes** each functional failure? | Failure Modes |
| 4 | What **happens** when each failure occurs? | Failure Effects |
| 5 | In what way does each failure **matter**? | Failure Consequences |
| 6 | What can be done to **predict or prevent** each failure? | Proactive Tasks |
| 7 | What should be done if a suitable proactive task **cannot be found**? | Default Actions |

### The RCM Worksheets

Two key documents capture the analysis:

1. **RCM Information Worksheet** — Records the answers to Questions 1–4 (functions, functional failures, failure modes, failure effects)
2. **RCM Decision Worksheet** — Records the answers to Questions 5–7 (consequences, selected tasks, frequencies, responsibilities)

---

## 3. Question 1: Functions and Performance Standards

### 3.1 The Structure of a Function Statement

A complete function statement consists of three elements:

```
VERB + OBJECT + PERFORMANCE STANDARD
```

**Example:**
> "To pump water from Tank X to Tank Y at not less than 800 litres per minute."

- **Verb:** pump
- **Object:** water from Tank X to Tank Y
- **Performance standard:** not less than 800 litres per minute

It is helpful to start function statements with the word **"to"** (e.g., "to pump water", "to transport people").

### 3.2 Performance Standards: Desired Performance vs. Built-in Capability

Performance can be defined in two ways:

- **Desired performance:** What the user *wants* the asset to do
- **Built-in capability (initial capability):** What the asset *can* do when new

**Key principle:** For any asset to do what its users want AND to allow for deterioration, its initial capability must exceed the desired standard of performance. The role of maintenance is to ensure that the asset's capability does not drop below the minimum standard desired by the user.

```
If initial capability > desired performance → Asset is MAINTAINABLE
If initial capability ≤ desired performance → Asset is NOT MAINTAINABLE (redesign required)
```

### 3.3 Types of Performance Standards

| Type | Description | Example |
|---|---|---|
| **Quantitative** | Numeric, precise, measurable | "at not less than 800 litres per minute" |
| **Qualitative** | Descriptive when quantification is impossible | "to look acceptable" |
| **Absolute** | Function statement with no standard implies zero tolerance | "to contain liquid X" (= no leakage at all) |
| **Variable** | Performance varies between two extremes | Truck carrying 0–5 tons with average 2.5 tons |
| **Upper and lower limits** | For systems with inherent variability | "diameter of 75 ± 0.1 mm" |
| **Multiple** | Several standards in one function | "heat 500 kg from ambient to 125°C in one hour" |

**Rule:** Performance standards should be quantified wherever possible. Qualitative statements like "to produce as many widgets as required by production" are meaningless because they make it impossible to define exactly when the item is failed.

### 3.4 The Operating Context

The operating context profoundly affects everything in the RCM process — functions, performance standards, failure consequences, and maintenance strategies. Key aspects include:

| Aspect | Impact on Maintenance Strategy |
|---|---|
| **Batch vs. flow processes** | Flow processes: single failure can stop entire plant. Batch: only one machine affected |
| **Redundancy** | Stand-by equipment changes consequences dramatically (stand-alone vs. duty/stand-by) |
| **Environmental standards** | Increasingly stringent regulations become part of the operating context |
| **Quality standards** | Product quality expectations directly affect function definitions |
| **Safety standards** | Directly affect consequence classification |
| **Operating schedule** | Single shift vs. 24/7 changes operational consequences |
| **Work-in-process** | Buffer stock reduces failure impact |
| **Repair times** | Speed of response + speed of repair |
| **Spares availability** | Part of the initial operating context |
| **Market demand** | Cyclic demand changes operational consequences |
| **Raw material supply** | Seasonal variations affect failure consequences |

**The operating context should be documented as a formal statement** at the beginning of any RCM analysis. This context statement evolves into a hierarchical set of statements, with high-level business context flowing down to specific asset-level context.

### 3.5 Categories of Functions (ESCAPES)

Every physical asset has more than one function. The categories form the mnemonic **ESCAPES**:

| Letter | Category | Description |
|---|---|---|
| **E** | **Environmental integrity** | Compliance with environmental standards and regulations |
| **S** | **Safety / structural integrity** | Protection of people; structural load-bearing |
| **C** | **Control / containment / comfort** | Regulation of performance; containment of fluids/materials; freedom from anxiety/pain |
| **A** | **Appearance** | Visual acceptability of the asset |
| **P** | **Protection** | Protective devices (alarms, shutdowns, safety valves, guards, stand-bys) |
| **E** | **Economy / efficiency** | Consumption of resources (fuel, lubricants, solvents) |
| **S** | **Superfluous functions** | Items that serve no useful purpose (can still fail and consume resources) |

### 3.6 Primary vs. Secondary Functions

- **Primary functions:** Why the asset was acquired in the first place (speed, output, capacity, quality)
- **Secondary functions:** All other expectations (safety, control, containment, appearance, protection, economy)

Secondary functions often need as much or more maintenance than primary functions. The loss of a secondary function can sometimes have more serious consequences than the loss of a primary function.

### 3.7 Protective Devices

Protective devices work by exception and fall into five categories:

1. **Alert operators** to abnormal conditions (warning lights, alarms)
2. **Shut down** equipment upon failure (pressure switches, overload trips)
3. **Eliminate or relieve** abnormal conditions (safety valves, rupture discs, fire-fighting equipment)
4. **Take over** from a failed function (stand-by plant, redundant components)
5. **Prevent dangerous situations** from arising (guards, barriers)

**Critical rule:** Protective function statements must include the words **"if"** or **"in the event of"** followed by a brief description of what would activate the protection.

**Example:**
> "To be capable of stopping the machine within 2 seconds **if** the operator falls against it."

### 3.8 How Functions Should Be Listed

Functions are listed on the **RCM Information Worksheet**, in the left-hand column:
- **Primary functions** are listed first
- Functions are numbered numerically (1, 2, 3, ...)
- Each function includes a verb, object, and desired standard of performance

---

## 4. Question 2: Functional Failures

### 4.1 Definition

> **Failure** is defined as the inability of any asset to do what its users want it to do.

More precisely:

> A **functional failure** is defined as the inability of any asset to fulfil a function to a standard of performance which is acceptable to the user.

### 4.2 Total and Partial Failure

Functional failures cover:

- **Total failure:** Complete loss of function (e.g., pump produces zero flow)
- **Partial failure:** Asset still functions but outside acceptable limits (e.g., pump delivers only 600 l/min when 800 is required)

Partial failure is nearly always caused by **different failure modes** from total failure, and the consequences are different. This is why **all** the functional failures which could affect each function should be recorded.

### 4.3 Upper and Lower Limits

When a function includes upper and lower limits (e.g., diameter 75 ± 0.1 mm), there are multiple possible failed states:

- Diameter exceeds 75.1 mm
- Diameter is below 74.9 mm

Each limit breach constitutes a separate functional failure and may be caused by different failure modes.

### 4.4 Functional Failures and the Operating Context

The operating context determines what constitutes a failed state. The same asset may be considered failed in one context but not in another.

**Example:** A minor pipe leak might be acceptable for water but constitute a functional failure for a cyanide pipeline (where any leak = functional failure).

### 4.5 Listing Functional Failures

Functional failures are recorded on the RCM Information Worksheet in the column next to the function they relate to. They are labelled alphabetically (A, B, C, ...) for each function.

---

## 5. Questions 3-4: Failure Modes and Effects Analysis (FMEA)

### 5.1 What is a Failure Mode?

> A **failure mode** is any event that causes a functional failure.

"Reasonably likely" failure modes include:

1. Failures that **have occurred** on the same or similar equipment in the same context
2. Failures that are currently being **prevented by existing maintenance**
3. Failures that **have not happened yet** but are considered to be **real possibilities**

### 5.2 Categories of Failure Modes

Traditional FMEA lists focus on deterioration and wear. RCM requires three additional categories:

| Category | Examples |
|---|---|
| **Capability deterioration** | Wear, corrosion, fatigue, oxidation, evaporation, degradation of lubricants, dust accumulation |
| **Human errors** | Operator errors (slips, lapses, mistakes); maintainer errors (incorrect reassembly, wrong settings) |
| **Design flaws** | Under-capacity, wrong materials, inadequate protection, manufacturing defects |

**Critical principle:** It is important to identify the *cause* of each failure in enough detail to ensure that time and effort are not wasted trying to treat symptoms instead of causes.

### 5.3 Level of Detail for Failure Modes

The level of detail should be such that it is possible to identify an appropriate failure management policy. A failure mode description should:

- Include a **verb** (not just specify a component)
- Use a verb other than "fails" or "malfunctions" unless treating a sub-assembly as a single failure mode
- For switches and valves, indicate whether the item fails in the **open or closed** position
- Not combine two substantially different failure modes in one description

**Wrong:** "Motor trips out" (this is an effect, not a mode)
**Right:** "Pump impeller jammed by rock" (this is the actual cause)

**Wrong:** "Screens damaged or worn"
**Right:** "1. Screens damaged" / "2. Screens worn" (two separate modes)

### 5.4 Failure Effects

Failure effects describe **what happens when each failure mode occurs.** They should make it possible to decide:

1. **Whether (and how) the failure will be evident** to the operating crew under normal circumstances
2. **Whether (and how) it poses a threat** to safety or the environment
3. **Whether (and how) it affects production** or operations
4. **What physical damage** is caused by the failure
5. **What must be done** to repair the failure

A well-written failure effect description should include:

| Element | Purpose |
|---|---|
| Evidence that the failure has occurred | Determines if the failure is hidden or evident |
| Safety/environmental impact | Determines consequence category |
| Operational impact | Determines consequence category |
| Physical damage description | Helps estimate repair costs and time |
| Corrective action required | Helps estimate repair costs and time |

### 5.5 Sources of Information

| Source | Value |
|---|---|
| Equipment manufacturer | Design intent, known failure modes |
| Operators | Day-to-day experience with symptoms and consequences |
| Maintainers | Hands-on knowledge of how things fail and repair details |
| Historical records | Frequency data, downtime records |
| Similar equipment elsewhere | Failure modes that haven't occurred locally yet |
| Design documentation | P&IDs, operating manuals, specifications |

### 5.6 The Information Worksheet

The completed RCM Information Worksheet captures:

| Column | Content |
|---|---|
| **Function** | Numbered function statements with performance standards |
| **Functional Failure** | Lettered failed states for each function (A, B, C...) |
| **Failure Mode** | Numbered causes of each functional failure (1, 2, 3...) |
| **Failure Effect** | What happens when each failure mode occurs |

The coding system creates a unique reference for each failure mode. For example, failure mode **2.B.3** means: Function 2, Functional Failure B, Failure Mode 3.

---

## 6. Question 5: Failure Consequences

### 6.1 The Central Principle

> **The consequences of failures are far more important than their technical characteristics.**

The only reason for doing any kind of proactive maintenance is not to avoid failures *per se*, but to **avoid or reduce the consequences of failure.**

### 6.2 Consequence Categories (in order of evaluation)

RCM classifies all failure consequences into four categories, evaluated in the following strict order:

```
┌─────────────────────────┐
│ Is the failure HIDDEN?  │──Yes──► HIDDEN FAILURE CONSEQUENCES
│                         │
└──────────No──────────────┘
           │
┌─────────────────────────┐
│ Safety or Environmental │──Yes──► SAFETY/ENVIRONMENTAL CONSEQUENCES
│ consequences?           │
└──────────No──────────────┘
           │
┌─────────────────────────┐
│ Operational             │──Yes──► OPERATIONAL CONSEQUENCES
│ consequences?           │
└──────────No──────────────┘
           │
           ▼
    NON-OPERATIONAL CONSEQUENCES
```

### 6.3 Hidden vs. Evident Functions

This is the **most important distinction** in the entire RCM process.

> A **hidden failure** is one whose occurrence on its own will not be apparent to the operating crew under normal circumstances.

> An **evident failure** is one whose occurrence on its own will be apparent to the operating crew under normal circumstances.

**Hidden failures almost exclusively affect protective devices.** Up to 40% of failure modes in a typical modern industrial system fall into the hidden category. A hidden failure on its own has **no direct consequences** — it only matters when combined with a second failure (the **multiple failure**).

**"On its own"** means: the effects of the failure mode on its own with no other abnormal events occurring simultaneously.

**"Normal circumstances"** means: the normal duties of the operating crew as laid down in existing operating procedures (not maintenance personnel).

### 6.4 Safety and Environmental Consequences

A failure has **safety consequences** if it could hurt or kill someone.

A failure has **environmental consequences** if it could breach any known environmental standard or regulation.

For these failures, the RCM process demands that something must be done — it does not tolerate inaction. The proactive task must reduce the risk to a **very low level** or eliminate it altogether. If no task can achieve this, **redesign is compulsory.**

### 6.5 Operational Consequences

An evident failure has **operational consequences** if it directly affects operational capability (output, product quality, customer service, costs of operation).

For these failures, a proactive task is only worth doing if over a period of time, **the total cost of doing the task is less than the cost of the operational consequences plus the cost of repair.**

### 6.6 Non-Operational Consequences

If an evident failure does not affect safety, environment, or operations, its consequences are classified as **non-operational** — the only cost is the direct cost of repair.

For these failures, a proactive task is only worth doing if over a period of time, **the cost of doing the task is less than the cost of repairing the failure.**

### 6.7 Hidden Failure Consequences

For hidden failures, the concern is the probability of a **multiple failure** — the combination of the hidden failure and the second failure it is meant to protect against.

A proactive task is worth doing if it **reduces the risk of the multiple failure to an acceptably low level.**

If no suitable proactive task can be found, a **failure-finding task** must be specified. If no suitable failure-finding task can be found, **redesign is compulsory** (if the multiple failure affects safety or the environment).

### 6.8 Risk Assessment

Tolerable risk depends on two factors:

1. **Severity of consequence** — How many people could be hurt or killed; magnitude of environmental damage; financial cost
2. **Degree of control** — How much control and choice individuals have over exposure to the hazard

Risk tolerance varies across a spectrum:

| Situation | Risk Tolerance |
|---|---|
| Complete control and choice (driving my car) | Higher |
| Some control, some choice (passenger in a plane) | Moderate |
| No control, some choice (near an industrial site) | Lower |
| No control, no choice (off-site resident) | Lowest |

---

## 7. Question 6: Proactive Tasks — Preventive Maintenance

### 7.1 Two Categories of Failure Management

| Category | Description |
|---|---|
| **Proactive tasks** | Tasks undertaken *before* a failure occurs to prevent the item from getting into a failed state |
| **Default actions** | Deal with the failed state; chosen when no effective proactive task can be found |

### 7.2 Technical Feasibility

Whether a proactive task is technically feasible depends on the **technical characteristics of the failure mode and of the task itself.** This has nothing to do with economics — economics are part of the consequence evaluation process.

### 7.3 Age and Deterioration

Any physical asset subjected to stress will deteriorate. Exposure to stress is measured as **age** (running time, calendar time, cycles, output, distance, etc.). The fundamental question is: **Is there a relationship between age and the probability of failure?**

### 7.4 The Six Failure Patterns

Research has revealed **six** failure patterns in practice:

| Pattern | Shape | Description | % in Aircraft |
|---|---|---|---|
| **A** | Bathtub curve | Infant mortality → constant → wear-out zone | 4% |
| **B** | Wear-out only | Constant/slowly increasing → wear-out zone | 2% |
| **C** | Gradual increase | Slowly increasing probability, no distinct wear-out | 5% |
| **D** | Initial increase | Low at new → rapid increase to constant | 7% |
| **E** | Random / constant | Constant probability at all ages | 14% |
| **F** | Infant mortality → constant | High early → drops to constant/slowly increasing | **68%** |

**Key finding:** 82% of failure modes (patterns D+E+F) show **no relationship between age and failure.** Age limits do little or nothing to improve the reliability of complex items. Scheduled overhauls can actually **increase** overall failure rates by introducing infant mortality into otherwise stable systems.

### 7.5 When Age-Related Patterns Occur

Wear-out characteristics (patterns A, B, C) are most commonly found where:

- Equipment comes into **direct contact with the product** (impellers, valve seats, seals, crusher liners, tooling)
- Items are subject to **fatigue** (cyclic loads on metallic parts)
- Items are subject to **corrosion or oxidation**
- Items are subject to **evaporation** (solvents, lighter petrochemical fractions)

### 7.6 Scheduled Restoration Tasks

**Definition:** Rebuilding a component or overhauling an item at or before a specified age, regardless of its condition at the time.

**Technical feasibility criteria:**

1. There is an identifiable age at which the item shows a **rapid increase in the conditional probability of failure**
2. **Most of the items survive** to that age (ALL items if the failure has safety or environmental consequences)
3. The task **restores the original resistance to failure** of the item

**Frequency:** Governed by the age at which the rapid increase in conditional probability begins (the "useful life"), not the average life.

**Limitation:** Reliable historical data is seldom available for new assets, so scheduled restoration tasks are rarely included in initial maintenance programs.

### 7.7 Scheduled Discard Tasks

**Definition:** Discarding an item or component at or before a specified age limit, regardless of its condition at the time.

**Technical feasibility criteria:**

1. There is an identifiable age at which the item shows a **rapid increase in the conditional probability of failure**
2. **Most of the items survive** to that age (ALL items if the failure has safety or environmental consequences)

No need to ask if the task restores original condition — the item is replaced with a new one.

**Two types of life limits:**

| Type | Application | Basis |
|---|---|---|
| **Safe-life limit** | Failures with safety/environmental consequences | Conservative fraction (1/3 to 1/4) of average life determined in simulated testing; requires 100% survival |
| **Economic-life limit** | Failures with economic consequences only | Actual age-reliability relationship; based on historical data |

---

## 8. Question 6: Proactive Tasks — Predictive Maintenance (On-Condition)

### 8.1 The P-F Curve

Most failures give some warning before they occur. The **P-F curve** describes how a failure:

1. **Starts** (at a point that may or may not be related to age)
2. **Becomes detectable** (point **P** — the potential failure)
3. **Deteriorates** to functional failure (point **F**)

```
                    Point P (Potential failure detected)
                    ↓
Resistance ─────────●
to stress            \
                      \
                       \
                        \
                         ●  ← Point F (Functional failure)

         ←── P-F Interval ──→
              (Warning period)
```

### 8.2 Potential Failure

> A **potential failure** is an identifiable physical condition which indicates that a functional failure is either about to occur or is in the process of occurring.

**Examples:** Hot spots (refractories), vibrations (bearings), cracks (fatigue), particles in oil (gears), excessive tread wear (tyres).

### 8.3 On-Condition Tasks

> **On-condition tasks** entail checking for potential failures, so that action can be taken to prevent the functional failure or to avoid the consequences of the functional failure.

Items are left in service **on the condition** that they continue to meet specified performance standards.

Also known as: **predictive maintenance**, **condition-based maintenance**, **condition monitoring**.

### 8.4 The P-F Interval

The **P-F interval** is the amount of time (or stress cycles) between the point at which a potential failure becomes detectable and the point of functional failure.

**Key rule:**

> **On-condition tasks must be carried out at intervals less than the P-F interval.**

In practice, selecting a task frequency equal to **half the P-F interval** is usually sufficient. This ensures:
- Detection before functional failure
- A reasonable "nett P-F interval" for corrective action

**Nett P-F interval** = P-F interval minus the task interval. This governs the available time to take corrective action.

### 8.5 Technical Feasibility of On-Condition Tasks

Scheduled on-condition tasks are **technically feasible** if:

1. It is possible to define a **clear potential failure condition**
2. The P-F interval is **reasonably consistent**
3. It is **practical** to monitor the item at intervals less than the P-F interval
4. The nett P-F interval is **long enough** to be of some use (long enough to take action to reduce or eliminate the consequences)

### 8.6 Categories of On-Condition Techniques

| Category | Examples |
|---|---|
| **Condition monitoring** | Vibration analysis, thermography, oil analysis, ultrasonic testing, acoustic emission |
| **Primary effects monitoring** | Gauges, process control readings, chart recorders |
| **Product quality variation** | SPC charts, dimensional measurements, filling level checks |
| **Human senses** | Look, listen, feel, smell (short P-F intervals, subjective, but versatile and cost-effective) |

**Important finding:** When RCM is correctly applied, condition monitoring as defined above is technically feasible for **no more than 20% of failure modes**, and worth doing in less than half of those cases. All four categories of on-condition maintenance together are usually suitable for **about 25–35% of failure modes.**

### 8.7 Linear vs. Non-Linear P-F Curves

| Type | Characteristic | Implication |
|---|---|---|
| **Non-linear (accelerating)** | Deterioration accelerates in final stages (most common) | Cannot predict when failure will occur; can only say it will occur "soon"; task frequency based on half P-F interval |
| **Linear** | Deterioration is roughly constant | Can predict failure time more precisely; two time-frames needed: when to start checking + checking frequency |

### 8.8 How to Determine the P-F Interval

**Best approaches (in order of reliability):**

1. **Research/testing:** Simulate the failure in a controlled environment (best but expensive)
2. **Expert judgement:** Ask people with intimate knowledge of the asset and its failures — operators, maintainers, first-line supervisors. Use "coat-hook" technique: "Is the P-F interval days, weeks, or months? If weeks — 1, 2, 4, or 8 weeks?"

If the group **cannot achieve consensus** on the P-F interval, the on-condition task must be abandoned for that failure mode.

### 8.9 Task Selection Order of Preference

The basic order of preference for proactive tasks:

```
1. ON-CONDITION TASKS (preferred)
   - Can be done in-situ, often while running
   - Identifies specific potential failure → precise corrective action
   - Realizes almost all useful life of the component

2. SCHEDULED RESTORATION TASKS (if on-condition not feasible)
   - Requires shutdown, sent to workshop
   - Age limit applies to all items → some unnecessary work

3. SCHEDULED DISCARD TASKS (last resort for proactive)
   - Replaces item with new one
   - Most wasteful of useful life
```

### 8.10 Combination of Tasks

For a very small number of failure modes with safety or environmental consequences, no single task reduces risk to an acceptable level. In these rare cases, a **combination of tasks** from two different categories may be used (e.g., on-condition + scheduled discard).

---

## 9. Question 7: Default Actions

### 9.1 Failure-Finding Tasks

> **Failure-finding** entails checking a hidden function at regular intervals to find out whether it has failed.

**Key facts:**
- Up to 40% of failure modes are hidden
- Up to 80% of these require failure-finding
- Therefore, **up to one-third** of all tasks in a comprehensive maintenance program are failure-finding tasks
- At the time of publication, most existing programs provide for **fewer than one-third** of protective devices to receive any attention

**Failure-finding is NOT:**
- Checking if something is *failing* (that's on-condition)
- Overhauling or replacing (that's preventive)
- Repairing (that's corrective)
- It is simply checking **if it still works**

### 9.2 Failure-Finding Task Intervals

The FFI depends on two variables:
- **Desired availability** of the protective device
- **Mean Time Between Failures (MTBF)** of the protective device

**Basic formula:**

```
FFI = 2 × Unavailability × MTBF(protective device)
```

Where: `Unavailability = 1 - Availability`

**Example:** If desired availability = 99% (unavailability = 1%), and MTBF = 8 years:
```
FFI = 2 × 0.01 × 8 years = 0.16 years ≈ 2 months
```

**Rigorous formula (incorporating demand rate):**

```
FFI = 2 × MTBF(protective device) × MTBF(demand) / MTBF(multiple failure)
```

Where:
- `MTBF(demand)` = mean time between demands on the protected function
- `MTBF(multiple failure)` = desired mean time between multiple failures

### 9.3 Availability Reference Table

| Desired Availability | FFI as % of MTBF |
|---|---|
| 90% | 20% |
| 95% | 10% |
| 97% | 6% |
| 99% | 2% |
| 99.5% | 1% |
| 99.9% | 0.2% |

### 9.4 Technical Feasibility of Failure-Finding

A failure-finding task is technically feasible if:

1. It is **physically possible** to check the function
2. It can be done **without increasing** the risk of the multiple failure
3. It is **practical** to do the task at the required intervals

**Important:** Always look for ways to check protective devices **without disconnecting or disturbing them.** Dismantling creates the possibility of leaving the device in a failed state.

### 9.5 No Scheduled Maintenance (Run-to-Failure)

"No scheduled maintenance" is valid only if:

- A suitable scheduled task cannot be found for a **hidden function** AND the associated multiple failure does not have safety/environmental consequences
- A suitable preventive task cannot be found for an **evident failure** AND the failure does not have safety/environmental consequences
- The cost of the preventive task exceeds the cost of allowing the failure to occur (for operational/non-operational consequences)

### 9.6 Redesign

"Redesign" in RCM means any once-off change:

- Change to the **physical configuration** of an asset
- Change to a **process or operating procedure**
- Change to the **capability of a person** (training)

**When redesign is compulsory:**
- If a failure could affect **safety or the environment** and no proactive task or combination of tasks reduces the risk to an acceptable level
- If a hidden function failure could lead to a **multiple failure** with safety/environmental consequences and no suitable failure-finding task exists

**When redesign is desirable:**
- For failures with operational/non-operational consequences where the total cost of the modification would be lower than the ongoing cost of the failure

### 9.7 Default Action Summary

| Consequence Category | If no proactive task... | If no failure-finding task... |
|---|---|---|
| **Hidden** (multiple failure affects safety/environment) | Failure-finding | Redesign is **compulsory** |
| **Hidden** (multiple failure does not affect safety/environment) | Failure-finding | No scheduled maintenance (redesign may be desirable) |
| **Safety/Environmental** | Redesign is **compulsory** | N/A |
| **Operational** | No scheduled maintenance (redesign may be desirable) | N/A |
| **Non-operational** | No scheduled maintenance (redesign may be desirable) | N/A |

---

## 10. The RCM Decision Diagram

### 10.1 The Integrated Decision Framework

The RCM Decision Diagram integrates all consequence evaluations and task selections into a single strategic framework. It is applied to **each failure mode** listed on the Information Worksheet.

### 10.2 Decision Worksheet Columns

The Decision Worksheet has 16 columns:

| Columns | Purpose |
|---|---|
| **F, FF, FM** | Cross-reference to the Information Worksheet (Function, Functional Failure, Failure Mode) |
| **H** | Is the failure hidden? (Y/N) |
| **S** | Does it affect safety? (Y/N) |
| **E** | Does it affect the environment? (Y/N) |
| **O** | Does it have operational consequences? (Y/N) |
| **H1/S1/O1/N1** | Is an on-condition task feasible and worth doing? (Y/N) |
| **H2/S2/O2/N2** | Is a scheduled restoration task feasible and worth doing? (Y/N) |
| **H3/S3/O3/N3** | Is a scheduled discard task feasible and worth doing? (Y/N) |
| **H4** | Is a failure-finding task feasible and worth doing? (Y/N) |
| **H5** | Could the multiple failure affect safety/environment? (Y/N) |
| **S4** | Is a combination of tasks feasible and worth doing? (Y/N) |
| **Proposed Task** | Description of the selected task or default action |
| **Initial Interval** | Task frequency |
| **Can Be Done By** | Who should perform the task (operator, mechanic, technician, etc.) |

### 10.3 The Decision Flow

For each failure mode:

**Step 1: Classify the consequence**
```
H=Y? → Hidden failure path
  H=N → S=Y? → Safety consequence path
    S=N → E=Y? → Environmental consequence path
      E=N → O=Y? → Operational consequence path
        O=N → Non-operational consequence path
```

**Step 2: Seek proactive task (in order)**
```
1. On-condition task feasible and worth doing? → Y → Record task
2. Scheduled restoration task feasible and worth doing? → Y → Record task
3. Scheduled discard task feasible and worth doing? → Y → Record task
```

**Step 3: If no proactive task (default actions)**
```
Hidden: → Failure-finding feasible? → Y → Record task
                                    → N → Multiple failure affects safety/env?
                                              → Y → Redesign compulsory
                                              → N → No scheduled maintenance

Safety/Environmental: → Combination of tasks feasible? → Y → Record tasks
                                                        → N → Redesign compulsory

Operational: → No scheduled maintenance (redesign may be desirable)

Non-operational: → No scheduled maintenance (redesign may be desirable)
```

### 10.4 "Worth Doing" Criteria Summary

| Consequence Category | A proactive task is worth doing if... |
|---|---|
| **Hidden** | It reduces the risk of the multiple failure to an acceptably low level |
| **Safety/Environmental** | It reduces the risk of the failure on its own to a very low level (or eliminates it) |
| **Operational** | The cost of the task over time < cost of operational consequences + cost of repair |
| **Non-operational** | The cost of the task over time < cost of repairing the failure |

### 10.5 Task Descriptions

Task descriptions on the Decision Worksheet should:

- Specify **which component** to check for **what condition**
- Not simply list the type of task ("scheduled on-condition task")
- Include what action to take if a defect is found

**Wrong:** "Check bearing"
**Right:** "Check bearing X for audible noise"

### 10.6 Who Does the Task

RCM considers this one failure mode at a time, without preconceived ideas about who should do maintenance. Tasks may be allocated to:

- Maintainers
- Operators
- Insurance inspectors
- Quality function
- Specialists (vibration analysts, etc.)

**Operators** are suitable for high-frequency tasks if they are:
1. Properly trained to recognise appropriate conditions
2. Given simple and reliable procedures for reporting defects
3. Assured that action will be taken on their reports

---

## 11. Implementation of RCM Recommendations

### 11.1 The Key Steps After Analysis

1. **Audit** — Formal review by senior management to verify decisions are sensible and defensible
2. **Task descriptions** — Detailed specifications of each task
3. **Once-off changes** — Design modifications, procedure changes, training
4. **Work packages** — Consolidation of tasks into operator procedures and maintenance schedules
5. **Implementation** — Integration into planning and control systems

### 11.2 The RCM Audit

The audit reviews both **method** (was the RCM process correctly applied?) and **content** (is the information correct?). Key audit checkpoints:

| Area | What to Check |
|---|---|
| **Level of analysis** | Not too low (symptom: large numbers of items with only 1-2 functions) |
| **Functions** | All functions identified; performance standards quantified; operating context correct |
| **Functional failures** | All failed states listed (total + partial for each performance standard) |
| **Failure modes** | Not omitted; specific descriptions with verbs; modes and effects not transposed |
| **Failure effects** | Evidence of occurrence; safety/environmental impact; operational impact; repair actions |
| **Consequence evaluation** | Hidden function question (H) answered correctly; safety/environmental correctly classified |
| **Task selection** | Tasks technically feasible AND worth doing; correct criteria applied per consequence category |

### 11.3 Work Packages

**Operator tasks** are incorporated into **Standard Operating Procedures (SOPs)**, including:
- Startup procedures
- During-operation checks
- Shutdown procedures

**Maintenance tasks** are consolidated into **schedules and checklists** by:
- Frequency (daily, weekly, monthly, quarterly, annual, etc.)
- Skill type (mechanic, electrician, technician, etc.)
- Equipment grouping (section or area of plant)

### 11.4 Consolidating Frequencies

When task intervals vary widely, they should be consolidated into a smaller number of work packages:

```
Original intervals  →  Consolidated schedule
Daily               →  Daily
2-weekly            →  Weekly
Weekly              →  Weekly
Monthly             →  Monthly
6-weekly            →  Monthly
Quarterly           →  Quarterly (= 3 × Monthly)
6-monthly           →  6-monthly (= 2 × Quarterly)
Annual              →  Annual (= 2 × 6-monthly)
```

**Critical rule:** Task intervals should ALWAYS be incorporated into a **higher frequency** schedule, never a lower one. Never arbitrarily increase intervals — this could move an on-condition task frequency outside the P-F interval.

### 11.5 Reporting Defects

When a defect is found during a proactive or failure-finding task, it must be dealt with speedily. The reporting system should ensure:

- Defects are reported to the right person
- Action is taken within the nett P-F interval
- Feedback is given to the person who found the defect

---

## 12. Age-Failure Patterns and Actuarial Analysis

### 12.1 The Six Patterns in Detail

The six failure patterns (A through F) represent different relationships between the conditional probability of failure and operating age:

```
Pattern A (4%):   ╲    ──────    ╱╱╱  (bathtub)
Pattern B (2%):   ──────────    ╱╱╱  (wear-out only)
Pattern C (5%):   ─────────────╱     (gradual increase)
Pattern D (7%):   ╲╱───────────      (initial break-in → constant)
Pattern E (14%):  ────────────────    (random/constant)
Pattern F (68%):  ╲╲──────────────   (infant mortality → constant)
```

**Key conclusions:**

1. As assets become more complex, patterns E and F dominate
2. For patterns D, E, and F there is **no age at which scheduled overhaul or replacement can be justified** on reliability grounds
3. Pattern F warns that **new or just-overhauled items** have a higher initial failure rate — scheduled overhauls can introduce infant mortality into otherwise stable systems
4. Only patterns A, B, and C are candidates for scheduled restoration or discard

### 12.2 Implications for Maintenance Strategy

| Pattern | Applicable Proactive Tasks |
|---|---|
| **A, B** | Scheduled restoration, scheduled discard, on-condition |
| **C** | On-condition; scheduled restoration only if optimal interval can be determined |
| **D** | On-condition only (age limits do nothing useful) |
| **E** | On-condition only (no age-failure relationship) |
| **F** | On-condition only; scheduled overhaul actually harmful (introduces infant mortality) |

### 12.3 Technical History Data

Accurate failure data is essential for:
- Verifying assumptions about failure patterns
- Calculating MTBF for failure-finding intervals
- Determining P-F intervals
- Justifying economic-life limits

Data should include:
- What failed (specific failure mode, not just "pump failed")
- When it failed (precise date/time or operating hours)
- How it was detected (by whom, under what circumstances)
- What was done to fix it (repair details, time, cost)
- What caused it (root cause if known)

---

## 13. Applying the RCM Process

### 13.1 Who Knows?

RCM analyses must be done by **small teams** (review groups) including at least:
- One person from the **maintenance function**
- One person from the **operations function**

The seniority of group members is less important than their **thorough knowledge** of the asset under review. Each member should also be trained in RCM.

### 13.2 RCM Review Groups

A typical RCM review group:

```
        ┌─────────────┐
        │ Facilitator │
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐ ┌───┴───┐ ┌───┴───┐
│ Ops   │ │ Eng   │ │ Ext   │
│ Super │ │ Super │ │Spec.  │
└───┬───┘ └───┬───┘ └───────┘
    │         │
┌───┴───┐ ┌───┴───┐
│Operat.│ │Crafts.│
└───────┘ └───────┘
```

### 13.3 The Facilitator

The facilitator is **the most important person** in the RCM review process. They must:

1. Ensure that RCM is **correctly applied** (at the right level, starting in the right place)
2. Ensure that each review group member understands and is **comfortable with the process**
3. Ensure that the analysis progresses **reasonably quickly** and finishes on time
4. Ensure that the analysis is **properly documented**

The facilitator should have:
- Thorough training in RCM
- Good communication skills
- Understanding of the technical issues (though need not be an expert on the specific equipment)
- Ability to manage group dynamics

### 13.4 Implementation Strategies

**Option 1: Full-scale campaign**
- Review all assets on a site in one push
- 10-20+ groups active at once
- Complete in 1-2 years
- Resource-intensive but delivers fast results

**Option 2: Staged approach**
- 4-5 groups activated at a time
- 2-10 years to cover a large site
- Less disruptive but benefits take longer to materialise

**Recommended approach:**
1. Start with **pilot projects** (2-3 analyses on different types of equipment)
2. Evaluate results and build skills
3. Then decide on the pace and approach for the remaining assets
4. Prioritise based on **consequence severity** (safety-critical first)

### 13.5 RCM in Perpetuity

The analysis is never "finished":

- The operating context changes (shift patterns, regulations, technology)
- Better data becomes available about failure patterns and P-F intervals
- People change (new operators, new maintainers)
- New failure modes emerge

RCM analyses should be **living documents**, reviewed and updated regularly.

### 13.6 How RCM Should NOT Be Applied

| Anti-Pattern | Problem |
|---|---|
| **Too low a level of analysis** | Creates excessive paperwork, quality deteriorates, people lose interest |
| **Too superficial** | Result of insufficient training or emotional commitment to preconceptions |
| **Over-emphasis on failure data** | Failure data is nearly always incomplete; RCM uses expert judgement supplemented by data |
| **Applied by one person alone** | Misses operations perspective; no team buy-in; unsustainable |
| **Using computers to drive the process** | Computer screens slow the process; RCM becomes a data-entry exercise instead of group analysis; RCM is "thoughtware, not software" |

### 13.7 The Three Tangible Outcomes

An RCM analysis results in:

1. **Maintenance schedules** to be done by the maintenance department
2. **Revised operating procedures** for the operators of the asset
3. **A list of once-off changes** (design modifications, procedure changes, training needs)

Two less tangible outcomes:
4. Participants **learn a great deal** about how the asset works
5. The team **functions better together**

---

## 14. Human Error in the RCM Framework

### 14.1 Categories of Human Error

| Category | Type | Description | Remedy |
|---|---|---|---|
| **Anthropometric** | External | Physical mismatch between person and workspace (size, reach, accessibility) | Redesign for better access |
| **Human sensory** | External | Poor visibility or legibility of instruments and components | Redesign for better ergonomics |
| **Physiological** | External | Environmental stress (heat, noise, fatigue, toxic exposure) | Reduce stressors; change procedures |
| **Psychological** | Internal | Errors rooted in human psyche (see below) | Training, RCM involvement, management |

### 14.2 Psychological Errors (Reason's Classification)

```
Human Error
├── Unintended Errors (does the job wrong)
│   ├── SLIPS (skill-based: does something incorrectly)
│   └── LAPSES (skill-based: misses out a key step)
│
└── Intended Errors (does the wrong job)
    ├── MISTAKES
    │   ├── Rule-based: applies wrong rule to situation
    │   └── Knowledge-based: wrong decision in novel situation
    │
    └── VIOLATIONS
        ├── Routine: habitual non-compliance
        ├── Exceptional: knowingly deviating "just this once"
        └── Sabotage: malicious intent
```

### 14.3 How RCM Reduces Human Error

- **Slips and lapses:** Involvement in FMEA gives operators and maintainers deeper understanding of consequences, increasing motivation to "do the job right first time"
- **Rule-based mistakes:** The RCM process defines the most appropriate "rules" for maintaining any asset, replacing bad rules
- **Knowledge-based mistakes:** Structured analysis anticipates novel situations; RCM documentation preserves institutional knowledge
- **Routine violations:** Involvement in RCM gives people clearer understanding of the need for safety procedures
- **Spurious alarms:** FMEA identifies failure modes giving rise to spurious alarms; corrective action reduces "cry wolf" effect

---

## 15. Condition Monitoring Techniques

### 15.1 Categories

Condition monitoring techniques are classified by the symptoms (potential failure effects) they detect:

| Category | Detects | Key Techniques |
|---|---|---|
| **Dynamic effects** | Vibration, noise | Broad-band vibration, FFT analysis, spectrum analysis, time waveform, shock pulse, acoustic emission |
| **Particle effects** | Wear particles in fluids | Ferrography, spectrometric oil analysis, mesh obscuration, particle counting |
| **Chemical effects** | Chemical changes in fluids or surfaces | Oil chemistry (TAN, TBN, viscosity), coolant analysis, dissolved gas analysis |
| **Physical effects** | Cracks, fracture, wear, dimensional changes | Visual inspection, dye penetrant, magnetic particle, radiography, eddy current, ultrasonic thickness |
| **Temperature effects** | Abnormal heat | Thermography, temperature indicators, pyrometry |
| **Electrical effects** | Changes in resistance, conductivity, potential | Insulation resistance, hi-pot testing, motor current analysis |

### 15.2 P-F Intervals for Common Techniques

| Technique | Typical P-F Interval |
|---|---|
| Vibration analysis | Several weeks to months |
| Oil analysis (ferrography) | Several months |
| Thermography | Days to weeks |
| Ultrasonic analysis | Highly variable |
| Human senses (noise, heat, visual) | Days to hours (very short) |
| SPC/product quality | Days to weeks |

### 15.3 Key Principle

> Condition monitoring is technically feasible for no more than **20% of failure modes** and worth doing in less than half of those. All four categories of on-condition maintenance together are suitable for **25-35% of failure modes.** The remaining 65-75% must be managed through other strategies (failure-finding, redesign, or run-to-failure).

---

## 16. What RCM Achieves

### 16.1 Measuring Maintenance Performance

Maintenance performance has two dimensions:

| Dimension | Description | Key Metrics |
|---|---|---|
| **Effectiveness** | How well assets are continuing to fulfil their functions | Availability, reliability, failure rate, durability, product quality, safety incident rate |
| **Efficiency** | How well maintenance resources are used | Maintenance cost per unit, time recovery, schedule completion, stock turns |

**Critical insight:** Every asset has **multiple functions**, and each function has a unique set of performance expectations. Effectiveness must be measured **function by function**, not just for the primary function.

### 16.2 Overall Equipment Effectiveness (OEE) — Limitations

OEE = Availability × Efficiency × Yield

While popular, OEE has significant drawbacks:
- Implies equal weighting of three variables (may not reflect reality)
- Only relates to the **primary function** (ignores all secondary functions)
- Not truly "overall" — should be called "Primary Functional Effectiveness"

### 16.3 Documented Benefits of RCM

| Area | Achievement |
|---|---|
| **Safety** | Contributed to making commercial aviation one of the safest forms of transport; systematic review of all safety implications before operational issues |
| **Environmental** | Environmental standards incorporated into function statements; systematic approach to compliance |
| **Availability** | 16% increase in milk-processing plant output; 86% → 92% availability for walking dragline; 98% availability (vs. 95% target) for steel mill holding furnace |
| **Routine workload** | 40-70% reduction in perceived routine maintenance wherever correctly applied |
| **Cost** | 50% reduction in routine requirements for confectionery plant; 85% reduction for hydraulic system; 62% reduction for automotive machining line |
| **Product quality** | Electronics assembly scrap rate reduced from 4000 ppm to 50 ppm |
| **Overhauls** | Eliminated all fixed-interval overhauls from steelworks steel-making division; extended gas turbine overhaul intervals from 25,000 to 40,000 hours |
| **Teamwork** | Improved relationship between maintenance and operations; common technical language |
| **Knowledge** | Reduced vulnerability to staff turnover; improved manuals and drawings |

### 16.4 The AI Opportunity

The RCM methodology was designed when analysing every asset in depth was prohibitively resource-intensive — it required trained facilitators, multi-day workshops, and deep engagement from operations and maintenance personnel for every system.

With AI, the opportunity is to:

1. **Automate the FMEA** — Use AI to generate initial lists of functions, functional failures, failure modes, and effects based on equipment type, component libraries, and historical data
2. **Pre-populate operating context** — Integrate plant data (shifts, throughput, redundancy, quality standards) automatically
3. **Suggest consequence categories** — Based on equipment criticality, safety classifications, and environmental permits
4. **Recommend task types and intervals** — Using failure pattern databases, P-F interval libraries, and manufacturer recommendations
5. **Enable continuous improvement** — Automatically update analyses as new failure data, operating conditions, or regulatory requirements emerge
6. **Scale across entire facilities** — Apply RCM-level rigour to assets that were previously considered "too minor" or "too many" for traditional RCM workshops
7. **Preserve institutional knowledge** — Capture the tacit knowledge of experienced operators and maintainers in structured, searchable, auditable form

The methodology documented here provides the **complete logical framework** that an AI system must follow to produce defensible, standards-compliant maintenance strategies. Every decision must be traceable through the 7-question process, and every task must meet the criteria for technical feasibility and "worth doing" established in this methodology.

---

## Appendix A: Key Formulas

### A.1 Failure-Finding Interval (Basic)

```
FFI = 2 × U_ave × M_MTBF

Where:
  FFI     = Failure-finding interval
  U_ave   = Allowed unavailability of protective device (1 - Availability)
  M_MTBF  = Mean Time Between Failures of protective device
```

### A.2 Failure-Finding Interval (Rigorous)

```
FFI = 2 × M_MTBF × M_MED / M_MM

Where:
  M_MTBF = MTBF of protective device
  M_MED  = MTBF of demand on protected function
  M_MM   = Desired MTBF of the multiple failure
```

### A.3 On-Condition Task Interval

```
Task interval ≤ P-F interval / 2

Nett P-F interval = P-F interval - Task interval
```

### A.4 Scheduled Restoration/Discard Interval

```
Task interval < Age at which rapid increase in conditional probability of failure begins
(The "useful life", NOT the "average life")
```

---

## Appendix B: RCM Decision Logic — Quick Reference

### B.1 Proactive Task Selection Criteria

| Task Type | Technically Feasible If... | Worth Doing If... |
|---|---|---|
| **On-condition** | Clear potential failure; consistent P-F interval; practical to monitor at < P-F; nett P-F long enough for action | Reduces risk (hidden/safety/env) OR cost-effective (operational/non-operational) |
| **Scheduled restoration** | Age-related failure pattern; identifiable wear-out age; most items survive; restores original resistance | Reduces risk (hidden/safety/env) OR cost-effective (operational/non-operational) |
| **Scheduled discard** | Age-related failure pattern; identifiable wear-out age; most items survive | Reduces risk (hidden/safety/env) OR cost-effective (operational/non-operational) |
| **Failure-finding** | Physically possible; doesn't increase risk; practical at required intervals | Reduces probability of multiple failure to tolerable level |

### B.2 Default Action Logic

| If no suitable proactive task exists... | Hidden (safety/env multiple) | Hidden (non-safety multiple) | Safety/Environmental | Operational | Non-operational |
|---|---|---|---|---|---|
| **Failure-finding** | Required | Required | N/A | N/A | N/A |
| **No scheduled maintenance** | N/A | If FFI not feasible | N/A | Default | Default |
| **Redesign compulsory** | If FFI not feasible | N/A | Always | N/A | N/A |
| **Redesign desirable** | N/A | If FFI not feasible | N/A | Optional | Optional |

---

## Appendix C: Glossary of Key RCM Terms

| Term | Definition |
|---|---|
| **Function** | What the user wants the asset to do, expressed as a verb + object + performance standard |
| **Functional failure** | Inability of an asset to fulfil a function to the standard desired by the user |
| **Failure mode** | Any event that causes a functional failure |
| **Failure effect** | What happens when a failure mode occurs |
| **Hidden failure** | A failure whose occurrence is not apparent to the operating crew under normal circumstances |
| **Evident failure** | A failure whose occurrence is apparent to the operating crew under normal circumstances |
| **Multiple failure** | The combination of a hidden failure and the second failure it is meant to protect against |
| **Potential failure** | An identifiable physical condition indicating that a functional failure is about to occur or is in the process of occurring |
| **P-F interval** | The time between the emergence of a detectable potential failure and the functional failure |
| **Nett P-F interval** | P-F interval minus the task interval; the time available to take corrective action |
| **On-condition task** | Checking for potential failures to take action before functional failure |
| **Scheduled restoration** | Rebuilding an item at or before a specified age, regardless of condition |
| **Scheduled discard** | Replacing an item at or before a specified age, regardless of condition |
| **Failure-finding** | Checking a hidden function to find out whether it has failed |
| **Safe-life limit** | Conservative age limit for failures with safety/environmental consequences |
| **Economic-life limit** | Age limit based on actual age-reliability data for economic optimization |
| **Operating context** | The totality of conditions under which an asset operates, including process type, redundancy, environmental/safety regulations, demand patterns, repair times, and spares availability |
| **Initial capability** | The maximum performance an asset can deliver when new (also called inherent reliability) |
| **Conditional probability of failure** | The probability that a failure will occur in the next period, given that the item has survived to the beginning of that period |
| **MTBF** | Mean Time Between Failures |
| **Useful life** | The age at which there is a rapid increase in the conditional probability of failure |
| **ESCAPES** | Mnemonic for secondary function categories: Environmental integrity, Safety, Control/Containment/Comfort, Appearance, Protection, Economy/Efficiency, Superfluous functions |
