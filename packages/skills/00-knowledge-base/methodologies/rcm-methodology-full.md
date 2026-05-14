# RCM - Reliability Centred Maintenance: Full Methodology

> **Source:** `asset-management-methodology/rcm-reliability-centred-maintenance.docx`
> **Conversion Date:** 2026-02-23
> **Original Author:** Ausenco Rylson (Revision 1.0, 6/02/2012)
> **Document Type:** 2-Day RCM Training Course Material

## Used By Skills

- `run-rcm-decision-tree` - Core RCM decision logic, failure patterns, P-F interval, task selection
- `perform-fmeca` - Failure modes, effects, consequences classification, criticality assessment
- `assess-criticality` - Criticality analysis methods (intuitive and consequence/probability)

---

## Table of Contents

- [1. Welcome and Introduction](#1-welcome-and-introduction)
- [2. The Changing Face of Maintenance](#2-the-changing-face-of-maintenance)
- [3. Reliability, Availability and Maintainability](#3-reliability-availability-and-maintainability)
- [4. Introduction to Reliability Centred Maintenance](#4-introduction-to-reliability-centred-maintenance)
- [5. Selecting Assets for RCM Analysis](#5-selecting-assets-for-rcm-analysis)
- [6. RCM Documentation](#6-rcm-documentation)
- [7. The RCM Methodology](#7-the-rcm-methodology)
- [8. Applying the RCM Process](#8-applying-the-rcm-process)
- [Appendix 1 - RCM Documentation Worksheets](#appendix-1--rcm-documentation-worksheets)

---

## 1. Welcome and Introduction

### 1.1 Introductions

- Name, Company, Title
- Experience
- Course Expectations

### 1.2 Course Objectives

The objectives of this two day Reliability Centred Maintenance (RCM) course are:

- To explain the history of RCM and its origins
- To introduce participants to a methodology used for selecting assets for RCM analysis
- To introduce the participant to the methodologies and documentation used in applying RCM
- To communicate to participants the benefits of applying RCM

---

## 2. The Changing Face of Maintenance

### 2.1 Definition

> "What do you mean? We're going to have to work on the equipment before it breaks down?"

What a novel idea! This was the comment made by a very experienced fitter, in a multi-national organisation, when he heard about the company's new approach for preventative, proactive, planned maintenance. His statement really points to the crux of one of the biggest challenges maintenance organisations face when moving from the "fireman mentality" or reactive work culture to one that emphasises equipment and system reliability. We are in fact challenging a maintenance paradigm or mindset. So what is the function of the maintenance department? Perhaps the best way to answer this question is to look at the definition of maintenance.

**Definition of Maintenance:**

> "The performance of activities to retain an asset to an acceptable condition whereby it fulfils its required function"

or very simply:

> "Doing things to make sure that the equipment continues to do what it is supposed to do"

This definition implies that it is not acceptable for assets to fail and that the failure of an asset should be viewed as a failure of the maintenance department to maintain that asset.

### 2.2 The Evolution of Maintenance

It is widely accepted that there are four generations of maintenance spanning the period pre 1940s through to today. As shown below the expectations placed upon the maintenance function have increased considerably and the maintenance person is no longer a "repair man" but a maintenance professional.

The assets we maintain today are different to those in previous generations. The advent of new materials and technological advances has seen the increase in asset complexity. We are also capable of producing equipment much closer to design specifications. This combination of increased complexity and reduced overdesign has resulted in assets which cannot be abused by maintenance or production. Abuse of today's assets will result in reduced availability, reliability and asset life.

---

## 3. Reliability, Availability and Maintainability

### 3.1 Preamble

The majority of physical assets whether fixed or mobile consist of equipment that requires some form of maintenance, ranging from periodic checks and adjustments to corrective action following failure. Following the failure of a component or part, the equipment requires repairs or replacement to return it to a state where it can perform the required function.

Either way, unless there is some degree of redundancy, a failure generally means the system will not be available for use during the repair period.

Maintenance practitioners use a variety of terms to quantify equipment health, and express this as reliability, availability and maintainability.

### 3.2 Reliability

Reliability is defined by AS 1057 (Quality Assurance and Quality Control - Glossary of Terms) as:

> "The ability of an item to perform to a required function, under stated conditions for a stated period of time."

Others may describe it as the equipment doing the job they require for reasonable periods of time. It may be measured by Mean Time To Failure (MTTF) and Mean Time Between Failures (MTBF). High reliability implies long periods of satisfactory performance in service, as well as the ability to take small overloads without significant loss of useful life or performance.

Reliability is influenced by whether equipment is installed with suppliers recommendations, operated for its intended purpose and in accordance with guidelines and maintained in accordance with suppliers instructions.

**Mean Time Between Failures (MTBF):** A measure of equipment reliability. Equal to the total equipment uptime in a given time period, divided by the number of failures in that period.

### 3.3 Availability

Availability is the proportion of total time that an item of equipment is capable of performing its specified functions, normally expressed as a percentage. It can be calculated by dividing the equipment available hours by the total number of hours in any given period.

One of the major sources of disagreement over the definition of availability is whether downtime should be divided by total hours, or by Scheduled Operating Time. One of the prime goals of any organisation should be to maximise its return on assets. This can only be achieved by reducing the total downtime, regardless of whether this downtime was scheduled or not. For this reason, it is preferred to use a definition of downtime that considers all downtime, as a proportion of total time, not scheduled operating time.

### 3.4 Maintainability

Maintainability is the ease and speed with which any maintenance activity can be carried out on an item of equipment. May be measured by Mean Time to Repair (MTTR). It is a function of equipment design, and maintenance task design (including use of appropriate tools, jigs, work platforms etc.).

### 3.5 Calculating RAM

**Key Formula:**

```
Availability = Reliability / (Reliability + Maintainability)
```

**Example Comparison - Two Hypothetical Plants over 1000 Calendar Hours:**

| Plant | Calendar Hrs | Downtime Hrs | Operating Hrs | No. Repairs | MTTR (Hrs) | Availability | MTBF |
|-------|-------------|--------------|---------------|-------------|------------|-------------|------|
| A | 1000 | 50 | 950 | 100 | 0.5 | 95% | 9.5 hrs |
| B | 1000 | 50 | 950 | 1 | 50 | 95% | 950 hrs |

Both plants have the same availability of 95%, but they are clearly NOT the same:

- **Plant A** suffers 100 separate failures with an average MTTR of 0.5 hour, resulting in a MTBF = 9.5 hrs.
- **Plant B** is scheduled for one single planned outage of a 50 hour duration, resulting in a MTBF = 950 hrs.

The key difference between the two hypothetical plants is the absence of disruptions to the production process in Plant B. Plant B is available to the user when required, thus being able to fulfil the user's needs. Plant A cannot operate on average for any longer than 9.5 hours without suffering a stoppage, causing production re-start losses to the business.

---

## 4. Introduction to Reliability Centred Maintenance

### 4.1 A Brief History of RCM

The traditional approach to maintenance was based on the premise that as equipment grew older it would need to be overhauled to ensure safety and operating reliability. Over the years however it was realised that some failures could not be prevented no matter how often maintenance was performed. The airline industry responded to this by developing design features such as the replication of systems to mitigate the consequence of failure. Multiple engines and braking systems are some of the more obvious examples of this redundancy.

**Timeline:**
- **Late 1950s:** Commercial airline fleet sizes had grown to the point where there was sufficient failure data available for analysis
- **Early 1960s:** Task force formed between the US Federal Aviation Administration and civilian airlines, challenging traditional thinking
- **1967:** Paper presented at the Commercial Aircraft Design and Operations Meeting describing a logical approach to preventive maintenance programs, later refined into **MSG-1**
- **MSG-1:** Used to oversee development of the Boeing 747 maintenance program
- **MSG-2:** Published 2 years later, successfully used on the Lockheed 1011 and the Douglas DC10, and in Europe on the Airbus A-300 and Concorde
- **1978:** Stanley Nowlan and Howard Heap of United Airlines published **MSG-3**, which provided the basis for RCM as we know it today

**Key Results of MSG-2:**
- Application of traditional maintenance policies to the Douglas DC-8 required **339 scheduled overhauls** to components
- Application of MSG-2 on the larger, more complex DC-10 required only **7 such overhauls**
- Turbines were no longer scheduled for time-based overhaul resulting in a **50% reduction in stock holdings**

**Boeing 747 Program:**
- United Airlines projected **66,000 man-hours** on major structural inspections before 20,000 flying hours
- Traditional maintenance policies forecast a staggering **4 million man-hours** for the smaller Douglas DC-8

### 4.2 What is RCM?

The RCM methodology focuses on understanding the dominant and likely failure characteristics of the component, and identifying suitable inspection tasks that may detect the onset of failure prior to it causing an actual disruption to the process.

Most maintenance practitioners recognise that the management of physical assets requires them to be maintained periodically and modified from time to time to meet business requirements.

Fundamentally, the question we need to address in maintaining something is:

> "What is it that we intend to cause to continue?"

followed closely by the identification of the state or condition that we wish to preserve.

In summary, physical assets are put into service because someone wants it to do something, and they expect it to fulfil a specific function. When we maintain the asset we do so to ensure it continues to do whatever the user wants it to do. The operating context describes "where and how" the asset is installed to do what the user wants.

**RCM is formally defined as:**

> **A process used to determine the maintenance requirements of any physical asset in its operating context.**

### 4.3 The Benefits of RCM

RCM is, or has been, used in almost all industry types internationally. It has also formed the basis of other maintenance strategy development methodologies. The benefits of RCM are numerous.

Listed below are some benefits of RCM (the list is not exhaustive):

- Greater safety and environmental integrity
- Improved operating performance
- Increased RAM (Reliability, Availability, Maintainability)
- Increased maintenance cost effectiveness
- Longer useful life of expensive items
- Greater individual motivation

---

## 5. Selecting Assets for RCM Analysis

### 5.1 Introduction

Effective maintenance strategy planning relies upon a clear understanding of a failure or lack of full functionality of a component on a sub-assembly or equipment item, and the knock on effects of this to the efficient operation of the business.

Maintenance attention must be focussed on those aspects that are more critical on the full operation of affected processes and the effect of reduced operation on business performance.

### 5.2 Assessment Criteria

The process identifies the criticality of each item to the level above it and ultimately to the business. It assigns a criticality code according to a structured set of rules based on consequences of failure and the probability of occurrence.

A criticality code can be assigned at all levels of a plant hierarchy depending upon the type of industry:

1. Process
2. Sub-process
3. Equipment
4. Assembly
5. Sub-assembly
6. Maintainable item

### 5.3 Intuitive Method

There are a number of methods available for determining the criticality code. Firstly a simple intuitive method.

### 5.4 Consequence and Probability Method

The second method to arrive at an appropriate criticality code is by considering two main factors: **Consequences** and **Probability**. That is, the impact a failure will have on the operational performance of the level above, and the chance of the failure occurring.

#### Consequence Factors

**Safety/Environmental (Consequences):**
Reflects the consequences of any failure of a process or unit on the safety of personnel, the environment or the plant. Worst-case scenario is normally considered.

**Financial (Consequences):**
Reflects the consequence of any failure of a process or unit on the loss of revenue through the termination of production, or lost opportunity, loss of product or cost of re-production.

#### Probability Factors

**Process Severity (affects Probability):**
Reflects the potential rate that process conditions or constituents can deteriorate the plant. Processes which are abrasive or feature products at high temperatures and pressures or with corrosive impurities or additives, are rated highly.

**Condition (affects Probability):**
Reflects the actual or assumed condition of the plant as determined by opinion or actual historical data showing the performance of the plant. Plant with poor past performance or in poor current condition rate highly.

**Existing Maintenance (affects Probability):**
Reflects existing preventative and predictive maintenance programmes carried out on the process or unit. Plant that does not have a successful maintenance strategy, as evidenced by high number of failures, rate highly.

**Complexity (affects Probability):**
Reflects the complexity of the plant according to the number of maintenance causing items assuming proportionality to failure rates. Plant with numerous minor components or control features rates highly.

#### Consequence of Failure Classification

| Code | Consequence | Description of Impact |
|------|------------|----------------------|
| 1 | Serious | Failure will cause an immediate safety hazard or will have a significant impact on the business |
| 2 | Immediate | The business can continue but will be severely reduced in output or quality |
| 3 | Manageable | The business will be impaired but the process can continue due to some degree of duplication and planned maintenance is sufficient to rectify the failure. Low safety risk |
| 4 | Insignificant | System is fully duplicated or has no significant impact on the business process in the short term. Negligible safety risk |

### 5.5 Example Completed Summary Sheet

**Criticality Analysis Worksheet:**

| Criteria | Weight | Score /10 | Wt Score | Comments |
|----------|--------|-----------|----------|----------|
| Safety | 10 | | | |
| Environment | 10 | | | |
| Process Criticality | 5 | | | |
| **Total** | | | | |

The score is out of ten therefore a score of 10 for Safety results in a weighted score of 100. The score should now relate to an overall criticality rating (eg 1 to 5).

**Criticality Rating Scale:**

| Score | Criticality Code |
|-------|-----------------|
| 200 to 250 | 1 |
| 150 to 199 | 2 |
| 100 to 149 | 3 |
| 50 to 99 | 4 |
| Less than 50 | 5 |

**Example - Kwinana Utilities Gas Compressor Seal Oil System (BPK-123):**

| Criteria | Weight | Score | Wt Score | Comments |
|----------|--------|-------|----------|----------|
| Safety | 10 | 10 | 100 | Highly flammable gas at high temperature |
| Environment | 10 | 9 | 90 | An explosion will result in community concern |
| Process Criticality | 5 | 9 | 45 | System is gas dependant and failure will result in total gas loss |
| **Total** | | | **235** | |

Overall Criticality Rating = **1** (Most Critical)

---

## 6. RCM Documentation

The RCM process employs three key documents:

1. **The RCM Decision Diagram**
2. **The RCM Decision Worksheet**
3. **The RCM Information Worksheet**

Examples of this documentation can be found at Appendix A.

---

## 7. The RCM Methodology

### 7.1 Introduction

The RCM process involves answering **seven questions** about the asset or equipment component under review. Information gathered is collated on the Information Sheet and the Decision Sheet.

**INFORMATION SHEET (Questions 1-4):**

1. What are the functions and associated performance standards of the asset in its present operating context?
2. In what ways does it fail to fulfil its functions?
3. What causes each failure mode?
4. What happens when each failure occurs?

**DECISION SHEET (Questions 5-7):**

5. In what way does each failure matter?
6. What can be done to predict / prevent each failure?
7. What should be done if suitable proactive task cannot be found?

### 7.2 Functions and Performance Standards

> **Question 1:** What are the functions and associated performance standards of the asset in its present operating context?

Given that every item of equipment in a plant register would have been acquired for a specific purpose, it would be expected to perform a specific function. A partial or total loss of any of these functions will impact on the business in some way.

RCM starts by defining the functions of each asset in the operating context along with the desired performance standards. When detailing the functions RCM places a great deal of emphasis on quantifying performance standards. Wherever possible a functional statement should include a **verb**, a **noun** and a **desired standard of performance** (reliability standard).

**Functions can be grouped as:**

- **Primary Functions:** Describe why an asset was acquired in the first place. May include factors such as output, product quality, capacity or customer service.
- **Secondary Functions:** Recognise that most assets are expected to do more than just fulfil their primary functions. The user would also have expectations with respect to safety, control, containment, protection, compliance with environmental standards, and even appearance.
- **Protective Devices:** Those devices installed to protect the asset, personnel or both.
- **Superfluous Functions:** Those components or assemblies which are still installed in a system or process which no longer serve their original Primary Function but which, if they were to fail would affect the system or process.

**EXAMPLE - Primary Cyclone Feed Pump (Warman 750 VK SHD):**

- **Primary Function:** To pump slurry to the Primary Cyclone Feed at a minimum rate of 9,772 m3/Hr at a pressure of 365kPa from the SAG mill discharge screen undersize for 156 hrs continuous per 168hr operating cycle.
- **Secondary Function:** To contain slurry at a maximum pressure rating of 800kPa
- **Protective Devices:** Guarding over rotating assemblies.

### 7.3 Functional Failures

> **Question 2:** In what ways does it fail to fulfil its functions?

The next step is to identify how the items fail to fulfil their functions. Failures can be grouped in two types:

- **Total Failures:** The total loss of function (this does not necessarily mean that the asset is not running!)
- **Partial Failures:** Those failures where the asset still functions, but at an unacceptable level of performance

**EXAMPLE - Primary Cyclone Feed Pump (Warman 750 VK SHD):**

- **TOTAL:** Pumps 0
- **PARTIAL:**
  - Delivery of slurry to the Primary Cyclones at less than 9,772 m3/Hr
  - Delivers slurry to the Primary Cyclones at less than 365kPa
  - Fails to deliver slurry for 156hrs continuous

### 7.4 Failure Modes

> **Question 3:** What causes each failure mode?

The purpose of this stage is to ascertain failure modes and mechanisms most likely to cause each functional failure.

A failure mode can be described as **any event that is likely to cause an asset, system or process to fail**.

RCM dictates that we distinguish between a "Functional Failure" (a failed state), and a "Failure mode" (an event which could cause a failed state).

**Important Guidelines for Describing Failure Modes:**

- Verbs such as "breaks" or "malfunctions" should be **avoided** as they do not indicate what may be an appropriate way of managing the failure
- e.g., "Coupling failure" would be better described as "coupling bolts come loose", or "coupling hub fails due to fatigue", as it is easier to identify the proactive task
- Failure modes need to be described in enough detail to be able to select an appropriate failure management strategy

**List only the failure modes and causes that are reasonably likely to occur:**

1. Failures which have occurred before (sources: employees, site CMMS, vendors, other users)
2. Failure modes which are already the subject of proactive maintenance routines, and would most likely occur if no routine maintenance was being performed
3. Any other failure modes which have not yet occurred, but which are foreseeable

### 7.5 Failure Effects

> **Question 4:** What happens when each failure occurs?

This step helps decide how much the failure matters, and hence what level of preventive maintenance is needed.

When describing failure effects, the following should be recorded:

- What evidence exists that the failure has occurred
- In what way it poses a threat to safety / environment
- In what way it affects production or operations
- What physical damage is caused by the failure
- What must be done to repair the failure (how much downtime)

### 7.6 Failure Consequences

> **Question 5:** In what way does each failure matter?

One of the new paradigms of modern maintenance practice is that **the objective of proactive maintenance is not to avoid failure, but rather to eliminate, avoid or minimise the consequences of failures**. It is these consequences that strongly influence the extent to which we will go to try to prevent each failure.

If there are serious consequences we are likely to go to great lengths to try to avoid it. On the other hand if the failure has little effect, then we may allow the equipment to run to failure, and do nothing more than routine cleaning and lubrication.

**Step 1: Separate Evident Failures from Hidden Failures:**

- **Evident Failure:** One that will be evident to the operating crew under normal circumstances
- **Hidden Failure:** One that is not evident to the operating crew under normal operating circumstances if it occurs on its own (Hidden failures have no direct impact on the process, but they present an exposure to multiple failures, often with serious catastrophic consequences)

**Consequences are classified in 4 groups:**

1. **Safety consequences:** A failure could lead to death or lead to personal injury
2. **Environmental consequences:** A failure could lead to a breach of environmental regulations (state, corporate, site, etc)
3. **Operational consequences:** Production output, product quality, customer service levels are adversely affected
4. **Non-operational consequences:** Failures evident to the operator that do not affect safety or production. They generally only involve the direct repair costs

When a failure has significant consequences it is important to try to prevent it. On the other hand, with insignificant consequences the value of maintenance needs to be tempered recognising the cost consequences of the failure.

### 7.7 Maintenance Tasks

> **Question 6:** What can be done to predict / prevent each failure?

Many maintenance practitioners traditionally believed that the best way to optimise plant availability was to perform overhauls and component replacements at fixed intervals. However modern maintenance practices now recognise that **the linkage between reliability and operating age applies to only those items with a dominant age related failure mode**.

The challenge confronting maintenance practitioners today is to select a maintenance strategy that is based on the item's **dominant failure mode**.

The RCM methodology divides proactive maintenance activities into two categories:

**Preventive tasks** (where failure modes are clearly age related):
- The Basics: Clean, Lube, Minor Adjust and Inspection
- Scheduled restoration, or overhauling at a specified time (hours, tonnes, cycles) regardless of its condition
- Scheduled discard at a specified time regardless of its condition

**Predictive tasks** (where some form of warning is evident prior to failure):
- The first step in selecting an appropriate proactive task is to understand what the dominant failure characteristic is

### 7.8 Dealing with Failure Patterns

Six failure patterns are derived from Stanley Nowlan and Howard Heap's research carried out on civilian aircraft over a twenty year period. They are widely acknowledged as applicable to other industries with some variations.

**The Six Failure Patterns:**

| Pattern | Name | Description | Recommended Do's | Recommended Don'ts |
|---------|------|-------------|-----------------|-------------------|
| **A** | Bath Tub Curve | Combination of two or more failure patterns; infant mortality followed by increasing probability of failure with age | Scheduled Restoration, Discard | |
| **B** | Age Related | Few premature failures throughout life followed by increased probability of failure with age. Has a recognised "Useful Life" | Scheduled Restoration, Discard | |
| **C** | Fatigue Related | Most likely cause is fatigue (cyclic stress related), but no one point of wear-out | Scheduled Discard | |
| **D** | Stress Related | Rapidly increasing probability of failure following installation then random failure | OCM (serious consequence), NSM (trivial consequence) | Scheduled Restoration, Discard |
| **E** | Random | Probability of failure in any one period is the same as any other | OCM (serious consequence), NSM (trivial consequence) | Scheduled Restoration, Discard |
| **F** | Early Life (Infant Mortality) | Probability of failure actually decreases with age. **Most common pattern** | OCM (serious consequence), NSM (trivial consequence) | Scheduled Restoration, Discard |

**Key notes on Pattern F (most common):**
- The highest probability of failure occurs when the equipment item is new, or immediately following overhaul
- Infant Mortality failures are typically the result of:
  - Poor design
  - Poor quality of manufacture
  - Installation defects
  - Commissioning errors
  - Incorrect operation
  - Poor maintenance practices, including incorrect maintenance strategies

As assets become more complex, we tend to see **more random patterns (E and F)**. Industries where equipment components come in direct contact with the product tend to see a stronger presence of **wear-out failure characteristics (A and B)**.

### 7.9 The P-F Interval

Despite the fact that so many failure rates are not age related, most of them give some sort of warning that they are in the process of occurring or about to occur.

The RCM approach recognises this and makes use of the **P-F Curve** to explain the deterioration of equipment performance.

**Common Misconceptions (INCORRECT):**
- "That equipment doesn't fail frequently, so there is no need to check it too often"
- "We need to check the more critical equipment more often than the less critical plant"

> **"The frequency of predictive maintenance tasks has nothing to do with the frequency of failure or with the criticality of the item"** (Moubray, 1997)

The frequency of any form of CBM should be based on the fact that most failures do not happen instantaneously, and that it is possible to detect imminent failure due to some deteriorating equipment condition.

**The P-F Curve:**
- At some stage after the point of first damage, there is a point **"P"** where the Potential Failure could be detected (starting maybe with increased vibration only detectable with specialised measuring instruments, increased particle count in lubricant, or a temperature rise detectable by thermography, noise emission, or finally visual signs like smoke)
- The ability to detect the failure will vary subject to the type of equipment, and depend on which techniques are employed
- RCM recognises that most experienced maintenance and operations personnel will have some idea of the time between point "P" and the Failed condition point "F"

**On-Condition Monitoring (OCM):**

RCM uses the term "On-Condition Monitoring" task for tasks designed to detect potential failures. Items inspected are left in service **on the condition** that they continued to meet the required performance level. Also called predictive maintenance or condition based maintenance.

**Criteria for technically feasible scheduled OCM:**

1. A clear potential failure condition can be identified
2. The P-F interval is reasonably consistent
3. It is practical to monitor the item at intervals of less than the P-F interval
4. The time between detection and loss of function is long enough to take corrective action to avoid the consequences

**For Condition Based Maintenance to be worth doing:**

- The task intended to prevent a hidden failure should reduce the risk of the multiple failure to an acceptably low level
- The task should be able to detect the onset of failure and provide sufficient warning to avoid the serious safety or environmental consequences
- The task must be cost effective: the cost of the inspection must be less than the cost of not doing it (and suffering the inevitable failure)

### 7.10 Default Tasks

> **Question 7:** What should be done if suitable proactive task cannot be found?

If a proactive task cannot be identified that is both technically feasible and worthwhile doing for a given failure mode, then the default action is governed by the consequences of the failure as follows:

1. **Hidden function failures:** If a proactive task cannot be found that reduces the risk of a multiple failure to a tolerably low level, then select a **periodic failure-finding task**. If this is not feasible, then **redesign** may be the only safe alternative.

2. **Safety/Environmental failures:** If a proactive task cannot be found that reduces the risk to a tolerably low level, then the item or process may require **redesign**.

3. **Operational consequence failures:** If a proactive task cannot be found that costs less than the failure, then the initial default action is **No Scheduled Maintenance (NSM)**. If consequences are viewed as unacceptable, then redesign may be the best choice.

4. **Non-operational consequence failures:** If a proactive task cannot be found that costs less than the failure, then the initial default action is **No Scheduled Maintenance (NSM)**. If repair costs are viewed as unacceptable, then redesign may be the best choice.

**Scheduled Failure-Finding Tasks:**

Entail checking a hidden function at regular intervals to find out whether it has failed.

Failure-finding tasks should only be considered if:
- A functional failure will not become evident to the operating crew under normal circumstances
- The failure is one for which a suitable preventive task cannot be found
- It is possible to do the task without increasing the risk of a multiple failure
- It is practical to do the task at the required frequency
- A failure-finding task is only worth doing if it secures the desired availability of the hidden function

**Calculating Probability of Multiple Failure:**

```
Pr(MF) = Pr(F, Duty) x Non-Availability of Stand By

Example: Duty MTBF 10 years & Stand by Availability = 95%
= 1/10 x 1/20
= 1/200 (once every 200 years)

For Two Stand-bys:
Pr(MF) = Pr(F, Duty) x NA1 x NA2
= 1/10 x 1/20 x 1/20 = 1/4000 (once every 4000 years)
```

**Total cost to the company = Cost of Multiple Failure (Risk Accepted) + Cost of Inspection**

---

## 8. Applying the RCM Process

### 8.1 Planning and Preparation

For the application of the RCM process to deliver results in a timely manner, the planning and preparation phases must give adequate consideration to the following key elements:

- Definition of scope of the project
- Definition of the objectives of the project
- Estimation of the time required to review the project's equipment
- Identification of the personnel involved:
  - Project manager
  - Facilitator
  - Participants
- Training required for personnel involved:
  - Facilitator (if using internal staff)
  - Participants
- Logistics and planning for the meetings, including:
  - Dates and times
  - Location, facilities and equipment required
- Planning for regular audits of the RCM recommendations by independent personnel
- Planning to implement the recommendations arising from the process, including:
  - The new maintenance tasks
  - Any modifications to the design or process
  - Any modification to operating procedures

### 8.2 RCM Review Group

The best way to ensure the results of the RCM analysis are accepted by the workforce is to maximise their involvement throughout the process. Their involvement provides opportunity for continual technical validation and develops the sense of ownership required for best practice. Ultimately, they are the ones who best understand how the equipment works, what can go wrong, what the impact of each failure is on the business and what must be done to fix it.

Given the scope of the seven questions required to cover the RCM process, it would be beyond the scope of most maintenance personnel alone to fully answer all these questions. This especially applies to the questions regarding desired performance, failure effects and failure consequences. For this reason it is recommended the RCM review team comprise both **operational and maintenance personnel** who are experienced and knowledgeable.

There is little doubt that if we are to reap the benefits of RCM it must be performed as a team.

---

## Appendix 1 -- RCM Documentation Worksheets

### RCM Information Worksheet

| Function | Functional Failure (Loss of function) | Failure Mode (Root Cause of Failure and Failure Pattern) | Failure Effect (Consequences and Risk) |
|----------|--------------------------------------|--------------------------------------------------------|---------------------------------------|
| | | | |

### RCM Decision Worksheet

| Information Reference | Consequence Evaluation | H1/S1/O1/N1 | H2/S2/O2/N2 | H3/S3/O3/N3 | Default Action | Proposed Task | Initial Interval | Can be done by |
|---|---|---|---|---|---|---|---|---|
| F / FF / FM | H / S / E / O | | | | H4 / H5 / S4 | | | |

**Decision Worksheet Column Key:**
- **F:** Function number
- **FF:** Functional Failure number
- **FM:** Failure Mode number
- **H:** Hidden failure (Y/N)
- **S:** Safety consequences (Y/N)
- **E:** Environmental consequences (Y/N)
- **O:** Operational consequences (Y/N)
- **H1-H3, S1-S3, O1-O3, N1-N3:** Task selection columns
- **H4, H5, S4:** Default action columns
