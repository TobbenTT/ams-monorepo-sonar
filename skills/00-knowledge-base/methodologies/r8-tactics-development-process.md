# R8 Asset Maintenance Tactics Development (ATD) Process

> **Source:** `asset-management-methodology/R8-asset-maintenance-tactics-development-process.docx`
> **Conversion Date:** 2026-02-23
> **Document Type:** ATD Process Guide using Rylson8 Software

## Used By Skills

- `run-rcm-decision-tree` - RCM decision tree application within ATD, tactic selection logic
- `perform-fmeca` - Failure mode identification, component analysis, criticality assessment within ATD

---

## Table of Contents

- [1. ATD Stages Overview](#1-atd-stages-overview)
- [2. Equipment Criticality Analysis](#2-equipment-criticality-analysis)
- [3. Selection of the ATD Process Starting Point Approach](#3-selection-of-the-atd-process-starting-point-approach)
- [4. ATD Preparation Work](#4-atd-preparation-work)
- [5. Different ATD Approach Processes Using Rylson8](#5-different-atd-approach-processes-using-rylson8)

---

## 1. ATD Stages Overview

The ATD process consists of four main stages:

1. Equipment criticality analysis
2. Selection of the ATD process starting point approach
3. ATD preparation work
4. ATD process using the selected approach

---

## 2. Equipment Criticality Analysis

If the critical asset has not been selected yet, perform a criticality analysis at the level of the equipment to come out with the critical assets to go through the ATD process.

If the site has already selected the critical asset to go through the ATD process, then:

- Identify the equipment Primary and Secondary Functions and its Functional Failures
- Identify main equipment systems and components (create the Hierarchy in R8)
- Perform a criticality analysis at the level of the component

---

## 3. Selection of the ATD Process Starting Point Approach

The 3 starting point approaches are:

1. **Library Models**
2. **Existing Tasks**
3. **RCM Principles from Scratch**

### 3.1 Information Required

- Existing Work Instructions for the asset, for each labour type
- Existing Maintenance plan (Master Data) with: Title of the Work Instruction, frequency, resources and man hours
- Historical failure analysis/data
- Existing SAP Functional Locations for the Business Unit (Plant, Mine)
- Other important (but not required to start) data for measuring KPIs:
  - Historical Work Orders
  - Historical Operational Budget
  - Existing BOMs
  - Existing SAP data
  - Others to be specifically defined
- Awareness of the existing Library Models for the asset

### 3.2 Using Library Models

**Benefits:**
- You start with a good approach to what the Tactics for the equipment/component may be
- Can be used as starting point to then customize in a workshop with technical experts
- Easy to standardise tasks which are common within different operations
- Good for identifying failure modes that could be missed in a workshop

**Disadvantages:**
- Availability of a Library Model sufficiently customized to the specific equipment/component model
- If the tactics are not customised and they end up being work-packaged straight away into a Work Instruction, rarely a trader will follow the WI onsite while executing the work

### 3.3 Using Existing Tasks

**Benefits:**
- If the existing tasks are good, this is the best option to start with, having always afterwards a comparison with Library Models and eventually validating the new equipment/component model in a workshop
- Already customised to the specific equipment/component; might just need to take the existing task through the ATD methodology and process to validate it
- Traders might be familiar with the task description already

**Disadvantages:**
- The Existing task could be not useful. Reasons:
  - The Existing Task is a generic task from a generic Work Instruction developed long time ago
  - The Existing Task addresses a component that does not exist in the equipment
  - The Existing Task is executed to address a failure mode that the equipment/component does not suffer from

### 3.4 RCM Principles from Scratch

**Benefits:**
- No mindset predefined, analysing the primary and secondary function of the equipment/component, functional failure and going through the RCM decision tree to find the most reliable tactic for every Failure Mode identified
- Forced not to find shortcuts in the ATD process, having to start getting to know the reason why the equipment/component sits in the plant: which is its real function

**Disadvantages:**
- RCM could turn into a "Resource Consuming Monster" exercise. It needs to be applied in a practical way, not getting trapped and spending too much time and resources over-analysing. Concentrate on the dominant Failure Modes identified, assessing the Criticality of these as well.

---

## 4. ATD Preparation Work

- **Who:** Anglo Reliability Engineer, with Ausenco Consultant(s) guidance and support
- **Where:** At the office, having good internet and Rylson8 connection
- **When:**
  - Once Anglo reliability engineer is 100% available
  - The critical equipment has been selected
  - The required information has been gathered

### Previous Information Required

- Existing Work Instructions for the asset for each labour type
- Existing Library Models for the asset
- Existing Maintenance plan (Master Data) with resources and man hours
- Existing SAP Functional Locations for the Business Unit (Plant, Mine)
- Other important (but not required to start) data for measuring KPIs:
  - Historical Work Orders
  - Historical Operational Budget
  - Existing BOMs
  - Existing SAP data
  - Others to be specifically defined

---

## 5. Different ATD Approach Processes Using Rylson8

### 5.1 Library Models Approach

Having a good library model for the critical asset selected, we will choose the Library Model approach.

**Resources:** Initially, 4/3 resources involved:
- 1 Ausenco Senior consultant (to mentor while doing, over the first equipment)
- 1 Ausenco Consultant
- 1 Anglo reliability engineer
- 1 Anglo senior experienced trader (mechanical, electrical, instrumentation, ConMon; depending on the type of labour being analysed)

**How:**
- Ausenco Senior consultant: using a computer with connection to R8, using a projector so that the team gets trained on the process
- Ausenco Consultant: using a computer with connection to R8
- Anglo reliability engineer: hopefully with good expertise in the asset selected
- Anglo senior trader: sharing his knowledge and bringing site information: WIs and spare part lists

**Session Format:** Workshop

**Where:** At the office, having good internet and Rylson8 connection.

> **VERY IMPORTANT:** The workshop location has to be away from the trader's workplace so that he can concentrate on the work to be done.

#### Library Model Approach ATD Process Steps

The process will be, going through the Library Model analysing each Failure Mode, Tactic and tasks as follows:

1. **Hierarchy:** Are there any Systems missing? Any MI missing? Does it look AS IT IS physically at the plant?

2. **Components:** Are their function and functional primary and secondary failures identified?

3. **Tactic and its tasks:** Go through the RCM decision tree:
   - Is the tactic technically feasible and worth doing?
   - Are the tasks selected the most reliable tasks to address the identified failure mode?
   - Does actually the component suffer from that failure mode?
   - Does the existing tactic address a dominant failure mode?
   - Which are the consequences?
   - What happens if we do not perform the task?

4. **Primary Task Frequency:**
   - How often is the primary task performed today?
   - What is the failure mode pattern?
   - Can the frequency be adjusted to the failure mode pattern?
   - Can we extend it?

5. **Task Description:** Does the task description make sense? Is it under the structured standard? Using the Anglo Maintenance Language wording?

6. **Acceptable Limits:** Are they clear, customised to the specific equipment/component? Are they specific? Can they be improved?

7. **Conditional Comments:** If as a result of the inspection the component is not within the acceptable limits, which is the corrective action to be performed? Can it be done immediately, what is the constraint? WO needs to be generated? In next shutdown?

8. **Constraint:** Is the task performed Online / Offline?

9. **Resources:** Who, how many people and how much time to perform the specific task? Is there any spare part involved? Which spare part number?

10. **Work-packages:**
    - Create work-packages by equipment, type of labour, constraint and frequency
    - Give the right order to the tasks optimizing the execution
    - Is there a task missing? (if yes, go through the whole process)
    - Assign the resources to the work-package
    - Fill the work-package details: Frequency, Constraint, etc.
    - **Review:** Make a last review of all the work-packages and get the trader opinion

> **VERY IMPORTANT:** Explain the whole picture to the trader so that he understands the importance of the work he is doing. Get the trader's opinion on the work done, his impression. This way you will get his buy in.

### 5.2 Existing Tasks Approach

Having good Existing tasks (Work Instructions) we will choose the Existing Task Approach.

**Resources:** Initially, 3/2 resources involved:
- 1 Ausenco Senior consultant (to mentor while doing, over the first equipment)
- 1 Ausenco Consultant
- 1 Anglo reliability engineer

**How:**
Each resource gets the existing Work Instructions of a specific labour type:
- 1st resource: Mechanical and Lube
- 2nd resource: Electrical
- 3rd resource: Instrumentation
- (ConMon will be analysed in a separate workshop with Condition Monitoring team)

**Session Format:** Individual work, analysing the WIs and introducing the data in R8 following the ATD process.

**Where:** At the office, having good internet and Rylson8 connection.

#### Existing Tasks Approach ATD Process Steps

The process will be, getting the Work Instruction and start to analyse each Existing task as follows:

1. **Component:** Identify the component which the task refers to.
   - What is a component or a sub-component (which would be registered as a Failure Mode of the component)?
   - The Ausenco senior consultant will be guiding the team
   - Example: The electrical connections of a motor are a sub-component of the motor and will be identified as a Failure Mode of the motor

2. **Failure Mode:** Identify the Failure Mode (Failure Modes will be reviewed in specific Workshops with the traders afterwards). Refer to the official list of Failure modes to choose the most suitable failure mode.

3. **Tactic:** Identify which Tactic the task belongs to and select this type of tactic in R8:
   - **Condition Based** (Inspections, checks, tests, etc.)
   - **Fixed Time** (replace, repair, lube, clean, tighten, etc.)
   - **Run to Failure** (there are no tasks in a Work Instruction under a run to failure tactic)
   - **Fault Finding** (Functional tests)
   - **Redesign** (there are no tasks in a Work Instruction under a redesign tactic)

4. **Primary Tasks of Condition Based and Fault Finding Tactics** - Standardise the task description as follows:

   **Structure:** `Verb + subcomponent (the What fails) + evidence of the failure`

   - **1st: Verb** (Inspect, Lube, Grease, Clean, Replace, etc.) choosing from the "Maintenance Language.xlsx" file, sheet "Maintenance activities"
   - **2nd: The sub-component** over which the task is being executed
   - **3rd: The evidence of the failure** - what the maintainer or operator can see to identify the failure (from "Maintenance Language.xlsx", sheet "Failure evidence")

   **Examples:**
   - `Inspect electrical connections of the motor for looseness`
   - `Inspect filter for leakage`

5. **Primary Tasks of Fixed Time Tactics** - Structure: `Verb + component + subcomponent`

   **Examples:**
   - `Change mill liners`
   - `Repair chute liners`
   - `Lube motor bearings`

6. **Acceptable Limits:** Set acceptable limits found in the existing task description at the acceptable limit field in R8.

7. **Constraint:** Set the constraint specified at the WI. If you think it should be changed, type in Notes field:
   - `??To Online`
   - `??To Offline`

8. **Secondary Task:** Set a secondary Task that might be the corrective action when the primary task result gets out of the acceptable limits.

   **Examples:**
   - Primary: `Inspect electrical connections of the motor for looseness` / Acceptable Limits: `Connections tighten` / Secondary: `Tighten the electrical connections of the motor`
   - Primary: `Inspect filter for leakage` / Acceptable limits: `No leakage; no oil drops coming out from the filter` / Secondary: `Replace filter`

9. **Labour:** At this stage we are not going to assess the labour quantity and time (this will be done in a proper workshop with the traders). Assign to every task the labour of the Existing Work Instruction, with 1 resource and 0.1 time.
   - If the labour type should be different, type in Notes field:
     - `??To Oper` (Operator)
     - `??To ConM` (ConMon)
     - `??To Lube`
     - `??To Elec` (Electrician)
     - `??To Inst` (Instrumentation)

#### Existing Tasks - Part 2

Apply the same process as per the Library Model approach on a workshop environment with the trader.

### 5.3 RCM Principles from Scratch Approach

Having neither both Existing tasks (Work Instructions) and Library Models, we will choose the RCM principles from Scratch approach.

This approach follows the full RCM methodology from the ground up:
- Analyse the primary and secondary functions of the equipment/component
- Identify functional failures
- Go through the RCM decision tree for every Failure Mode identified
- Find the most reliable tactic for each failure mode
- Focus on dominant failure modes and assess their criticality
