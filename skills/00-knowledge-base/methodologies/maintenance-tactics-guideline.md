# Asset Tactics Process Guideline

---

> **Used By Skills:** run-rcm-decision-tree, perform-fmeca, assess-criticality

---

| Metadata | Value |
|---|---|
| **Source File** | `asset-management-methodology/maintenance-strategy-tactics-developmenet-Guideline v0.4.pdf` |
| **Pages** | 29 |
| **Conversion Date** | 2026-02-23 |
| **Document Type** | T&S -- AS&R Strategy & Reliability Technical Guideline |
| **Version** | 1.0 |
| **Prepared By** | Andre Fonseca |

---

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1. Objective](#11-objective)
- [2. What Are Asset Tactics?](#2-what-are-asset-tactics)
  - [2.1. Preference for Task Choices](#21-preference-for-task-choices)
- [3. The AS&R Asset Tactics Development Tools](#3-the-asr-asset-tactics-development-tools)
- [4. The Asset Tactics Development Steps](#4-the-asset-tactics-development-steps)
  - [4.1. Review Asset Criticality](#41-review-asset-criticality)
    - [4.1.1. Criticality Assessment Preparation](#411-criticality-assessment-preparation)
    - [4.1.2. System Criticality](#412-system-criticality)
    - [4.1.3. Asset Criticality](#413-asset-criticality)
    - [4.1.4. Criticality Assessment Matrix Tool](#414-criticality-assessment-matrix-tool)
    - [4.1.5. Important Considerations](#415-important-considerations)
  - [4.2. Develop Tactics](#42-develop-tactics)
    - [4.2.1. Tactics Development Preparation](#421-tactics-development-preparation)
    - [4.2.2. Develop Tactics](#422-develop-tactics)
    - [4.2.3. RCM Analysis](#423-rcm-analysis)
    - [4.2.4. Review and Consolidate Recommendations](#424-review-and-consolidate-recommendations)
    - [4.2.5. Determine Re-Evaluation Criteria](#425-determine-re-evaluation-criteria)
  - [4.3. Assess Asset Tactics](#43-assess-asset-tactics)
    - [4.3.1. Identify Asset Tactics for Review](#431-identify-asset-tactics-for-review)
    - [4.3.2. Assess and Optimise Tactics](#432-assess-and-optimise-tactics)
    - [4.3.3. Document Outcome](#433-document-outcome)
  - [4.4. Implement Asset Tactics](#44-implement-asset-tactics)
    - [4.4.1. Develop Work Procedures](#441-develop-work-procedures)
    - [4.4.2. Schedule One Time Changes and Actions](#442-schedule-one-time-changes-and-actions)
    - [4.4.3. Implement Tactics into CMMS](#443-implement-tactics-into-cmms)
  - [4.5. Improve Asset Tactics](#45-improve-asset-tactics)
    - [4.5.1. Triggers for Review](#451-triggers-for-review)
    - [4.5.2. Measuring the Performance of the Asset Tactics Development Process](#452-measuring-the-performance-of-the-asset-tactics-development-process)
- [5. Terms and Definitions](#5-terms-and-definitions)

---

## 1. Introduction

Anglo American relies on the ability of its assets to perform the required functions in order for the company to maximise the value of its operations.

As quoted in SAE JA1012 (A guide to the Reliability-Centered Maintenance (RCM) Standard):

> "Any organised system exposed to the real world will deteriorate, to total disorganisation (also known as 'chaos' or 'entropy'), unless steps are taken to deal with whatever process is causing the system to deteriorate."

All assets will deteriorate over time either from exposure to the elements or from wear associated with the use of the asset. This deterioration will affect the ability of the asset to perform as it was designed to do.

In order to retain the designed functionality of the assets it is necessary to define adequate tactics and perform a number of different types of activities, which should include maintenance, operations and support personnel. Assets will not perform efficiently if only maintenance is considered in the asset tactics development process.

The Asset Strategy and Tactics team within AS&R has defined a process for the development of asset tactics, to support and based on the AA Operating Model.

*[Diagram: Picture 1 -- Asset Tactics Process link to AOM]*

The summary of the Asset Tactics process flow (condensed version):

```
[Assess Asset Criticality] --> [Develop Tactics] --> [Assess Asset Tactics] --> [Implement Asset Tactics] --> [Improve Asset Tactics]
                                                                                                                      |
                                                                                                                      +---> (cycle back)
```

*[Diagram: Picture 2 -- Asset Tactics Process Flow -- condensed version]*

### 1.1. Objective

The vision for this process is to develop asset tactics that can be sensibly packaged and implemented by the work management process to deliver optimal asset performance. This process also enables asset management knowledge retention and speeds the deployment of asset tactics across the operations. It drives the requirement for asset tactics to be an integral component of the business strategy.

The Asset Tactics Development process allows for a well-documented decision logic which will greatly enhance the ability to have a process which caters for continuous improvement and allows for review against new requirements.

The required asset tactics are dependent on the design characteristics of the asset and the load factor on the equipment. This factor is a site variable factor which typically doesn't extend the original design life but reduces by a factor which can vary between 100% to a fraction of the equipment design life.

**Asset Tactics are the compilation of all the actions and decisions necessary to maintain the required performance and functionality of physical assets.** The tactics are developed to mitigate the consequences of the different types of business risks, by designing appropriate actions that preserve or restore all relevant functions (primary and secondary) of the equipment.

The Anglo American Asset Tactics Development Process focuses on the following key areas:

1. Assess Asset Criticality
2. Develop Tactics
3. Assess Asset Tactics
4. Implement Tactics
5. Improve Asset Tactics (cyclic process)

This is a cyclic process, which implies that sites will be active at different stages for different equipment and systems at the same time.

As with all business processes that are evolutionary in nature, the site maturity plays an important role in determining the quality of the output from the process. AS&R has developed a roadmap for the Asset Management process including an AM framework assessment to establish current site maturity level and assist in mapping out the improvement journey from Innocence towards Excellence.

---

## 2. What Are Asset Tactics?

**Asset tactics are the sum of all the actions and decisions necessary to maintain the required levels of equipment performance.** These are defined by using reliability analysis based on relevant failure modes and their consequences to the business. A careful balance is required to be achieved and avoid both excessive cost reduction (under maintaining) and over inspection of equipment.

### 2.1. Preference for Task Choices

Numerous studies have shown that over fifty percent of all equipment fails prematurely after maintenance work has been performed. In the most embarrassing cases, the maintenance work performed was intended to prevent the very failures that occurred. The main causes of this are human error and intrusive maintenance.

Tactics to counter these premature failures and that form part of the decision making process of selecting actions should consider that:

- **On-condition tasks take preference** over other tasks, when practical
- **Intrusive maintenance** (opening a machine for inspection) **is to be avoided**
- **Only maintenance that is necessary** should be performed
- **Maintenance task lists** are to be written effectively to manage and minimise human error

### Asset Tactic Types

The selected asset tactics fall in main groups with sub details as follows:

**1. Scheduled tasks -- On-condition tasks**
- Simple inspection at fixed intervals
- Condition checking at fixed intervals
- Condition trend monitoring at fixed intervals
- Condition based equipment replacement

**2. Scheduled restoration tasks**
- Fixed interval servicing
- Fixed interval calibration and adjustment
- Fixed interval maintenance
- Fixed interval overhaul

**3. Scheduled discard tasks**
- Fixed interval component replacement

**4. Hidden failure finding tasks**
- Functional check at fixed intervals

**5. One-time changes**
- Additions or modifications of assets to eliminate a failure mode or to improve equipment performance

**6. Run-to-failure (RTF) -- or do nothing**
- Replace the component when it has failed. This is applied when the consequences and effect of a failure are lower than the cost of the task, and an informed decision is made to allow the asset to fail.

---

## 3. The AS&R Asset Tactics Development Tools

In order to assist the operations in the development of suitable asset tactics, a number of tools have been developed consisting of spreadsheets, decision logic flow sheets and process maps.

The entire process has been documented on a flow chart with all the major activities and sub steps. This flow chart maps all the required steps for the process. A RACI is available to develop the relevant role descriptions. The use of these documents are critical for an effective implementation of the Asset Tactics Development process.

A single spreadsheet has been developed for the Develop Tactics step of the process, which is used for every equipment component for which tactics are developed. ASR has also implemented an AA global solution for capturing and sharing best practices that can replace this spreadsheet.

This tool meets or exceeds all the requirements of **SAE JA 1012** for conducting and capturing the decision process and tasks selected for the asset. It also caters for:

- Unmitigated and mitigated risk potential on each tactic
- Individual tabs for:
  - **Tactic Action Logic** decision tree
  - **Cost Analysis Logic** decision tree
  - **Risk Matrix**
  - Customizable look up tables
- Visual representation of the changes made to the asset tactics (graph tab)

*[Diagram: Picture 3 -- Section of Develop Asset Tactics spreadsheet to record process details]*

*[Diagram: Picture 4 -- Simplified Decision Logic Diagram for selecting suitable asset tactics]*

---

## 4. The Asset Tactics Development Steps

### 4.1. Review Asset Criticality

The sub-processes within the Review Asset Criticality module are:

- **Criticality Assessment Preparation**
- **System Criticality Review**
- **Equipment and Component Criticality Review**

*[Diagram: Picture 5 -- Assess Asset Tactics process diagram section]*

The Criticality Review Process provides a methodology to score and rank the plant systems, equipment and components in terms of their risk to the business. It enables an organisation to benefit from an optimised Asset Management decision making that maximises value and delivers its Organisational Strategic Plan.

It is often used to determine a starting point for reliability improvement programs although it is not the only tool that can be used for this purpose.

> **The risk of component failure events can only be quantified through the potential impact of that failure on the organisations goals. Assets have no inherent criticality and there is no risk without consequence.**

The results of the criticality process can be used to:

- Prioritise asset tactics reviews
- Determine equipment maintenance programs such as condition monitoring and clean fluids
- Assist in the determination and optimisation of spares requirements
- Support the selection of Defect Elimination projects
- Prioritise equipment improvement programs
- Prioritise operations inspection activities
- Prioritise capital expenditure

Once the criticality scores are determined, they need to be recorded for each Asset at the productive unit level in the existing site CMMS. The site team needs to determine the appropriate CMMS fields to store the data.

#### 4.1.1. Criticality Assessment Preparation

The key steps in this stage are:

1. **Define the assessment team** -- A cross-functional team approach is recommended to develop a shared understanding of the business priorities with respect to equipment criticality.

2. **Gather Asset data** -- Define the level of detail that the assessment will focus on. Use the existing equipment hierarchy structure data to establish the elements to be assessed.

3. **Define criticality matrix parameters** -- The criticality assessment matrix can be found in the ASR matrix and has the likelihood and consequence categories and parameters pre-defined at a generic level. These parameters need to be converted to site specific numbers, which will remain the same for all assets and components.

4. **Define the equipment to be considered**, with clear system boundaries, sub-systems and assemblies.

#### 4.1.2. System Criticality

The assessment is done at system level to determine where the efforts should be focussed. The systems are defined for the mine and plant areas, based on operational process configuration and steps. There are no predefined rules for this step.

#### 4.1.3. Asset Criticality

Each asset in scope is assessed using the Criticality Assessment matrix. For each asset, the likelihood and consequence of an event are determined. Note that although the matrix contains all eleven of the standard consequence categories, the assessment team can chose which consequence categories will be assessed.

Once the criticality assessment has been completed the result must be:
1. Syndicated and approved by the appropriate stakeholders
2. Results recorded in the CMMS
3. Summary of results communicated to all relevant teams

#### 4.1.4. Criticality Assessment Matrix Tool

The ASR team has produced an Asset Criticality Assessment matrix to be used for this step. This process is also incorporated in the AA global solution software.

During the workshop it is recommended that a hard copy of the Risk Assessment Matrix be given to each participant. Data can be entered directly into the Reliability Solution or criticality schedules as the workshop progresses.

**Consequence Categories (11 total):**

| Category | Sub-categories |
|---|---|
| **Financial** | Capital cost, Project schedule, Operating cost, Production volume, Revenue |
| **Non-financial** | Safety, Health, Environment, Communication Relations, Conformance and Compliance, Business Reputation |

**Likelihood Options:**

| Level | Description |
|---|---|
| 5 | Almost certain |
| 4 | Likely |
| 3 | Possible |
| 2 | Unlikely |
| 1 | Rare |

#### 4.1.5. Important Considerations

Whenever a new asset is acquired, its criticality must be assessed on an individual basis, before commissioning. It is also strongly recommended that when the operating context of the business changes that a holistic asset criticality analysis is conducted again.

There is an incorrect assumption that the risk categories should be used to determine the asset tactics types. These are defined based on failure modes, consequences and detectability.

**The four risk classes should generally be used as follows:**

| Class | Level | Description |
|---|---|---|
| **Class I** | Low | Below the risk acceptance threshold; do not require active management |
| **Class II** | Medium | On the risk acceptance threshold; require active monitoring |
| **Class III** | High | Exceed the risk acceptance threshold; require proactive management |
| **Class IV** | Critical | Significantly exceed the risk acceptance threshold; need urgent and immediate attention |

The management team is then presented with a recommendation of what the priority will be for carrying out the asset tactics development along with a clear schedule detailing timing and resources.

---

### 4.2. Develop Tactics

The sub-processes within the Develop Tactics module are:

- **Tactics Development Preparation**
- **Develop Tactics**
- **Determine Re-Evaluation Criteria**

Each of these steps will be unpacked and clarified in a specific guideline.

*[Diagram: Picture 6 -- Develop Asset Tactics process diagram section]*

#### 4.2.1. Tactics Development Preparation

A key to the success of the development of the asset tactics is the preparation of data, methodology and stakeholders.

Before setting out on Tactics Development, it is important that there is a need as well as support for the initiative with a clear understanding of what the expected deliverables are.

**Steps for successful preparation:**

1. **Select assets:** Determine which assets require tactics development and select the appropriate hierarchy level.

2. **Form a team:** Depending on the assets to be reviewed a suitable team is formed. The team members will have the appropriate skill sets for the assets selected, usually with a cross discipline focus. The make-up of the team is dependent upon the skills required to conduct the tactics development work.

3. **Collate data:** Collate all relevant data for use in the development of maintenance tactics. Selection and validation of all the relevant data required for the analysis is also undertaken. This activity is typically undertaken by the Reliability Engineer with additional support from specialists as required.

4. **Confirm Risk Matrix Parameters/Site Criticality Parameters:** The Risk Matrix (RM) used for risk assessment for maintainable items is slightly different to that used in asset criticality assessment.

5. **Identify the technical hierarchy structure:** It is critical that the equipment and component hierarchy structure matches that in the existing CMMS. Using 5 levels in the hierarchy is recommended as adequate for most cases:
   - Area
   - System
   - Equipment type
   - Component
   - Sub-component

#### 4.2.2. Develop Tactics

After determining a reliability analysis is required, **Reliability Centered Maintenance (RCM) principles are rigorously applied** to determine the appropriate asset tactics.

The quality of the Asset Tactics developed will to a large extent depend on the input from all the required stakeholders and the correct use of precise data.

Prior to commencing any RCM work it is essential that the selected team is trained in the process in order to make sure the process flows easily.

##### 4.2.2.1. Existing Asset Tactics

Ideally asset tactics are developed prior to the asset being commissioned and handed over to operations. However tactics can also be developed for assets already in operation.

Where site has access to relevant prior work for the equipment under review, this content should be reviewed for suitability and transposed to the RCM spreadsheet.

Where there are no existing tactics that are relevant, a considerable amount of time can be saved by locating this elsewhere. This also has the advantage that where the site does not have a comprehensive understanding of the equipment, this can be overcome by using tactics developed elsewhere.

**The Asset Tactics Development process still must be applied to the existing Asset Tactics to ensure that they represent the best fit for the operation and its specific conditions.**

##### 4.2.2.2. Asset Tactics Library

An Asset Tactics Library database has been established, based on the **Rylson8 solution**, to allow for continuous improvement and best practice sharing. The library content, as a starting point, was sourced from Ausenco and AA sites with recognised equipment performance. Site reviews will be used for identifying areas for improvement.

**Key aspects of the library:**

- The content of this library is **generic** and must be customised by each site before implementation
- The tactics were developed at **component level** to allow for modularized use of the content
- The language currently available in the library is **English** but Spanish and Portuguese are being proposed for future development

**Library access protocol:**

1. ASR is the primary custodian of the content, which will be validated by the SMEs
2. Before access is obtained, the site must provide for each equipment type:
   - Asset Criticality for the asset, as per ASR model
   - Copy of existing tactics
   - Action plan for the development, implementation and review of tactics, as per ASR model
3. ASR will provide access to the library content for the selected equipment type
4. Site must review the asset tactics before implementation to ensure they are adequate for their specific operational conditions
   - **A generic set of tactics is usually expected to be 60 to 70% already aligned with site specific conditions and environment**
5. Site is accountable for deleting, modifying or adding any tactics required to ensure asset reliability and performance
6. Site must review and validate the task resourcing, using the library as a reference only
7. Task packaging is not provided in the library and must be conducted by the site planners
8. Site must identify who approves and who implements the reviewed tactics
9. Once the review is completed, the site will send to ASR:
   - Copy of the revised tactics
   - Updated copy of the implementation plan at each 3 months, until completion, including value reconciliation
   - Asset tactics review statistics, as defined in the "Develop Asset Tactics" guideline
   - Any recommendations for improving the library content
10. Sites will have permanent access to the library for the equipment types that have the steps above completed
11. Updates to library content will be regularly communicated to the sites
12. Sites are required to attend the Reliability CoP to support the asset tactics development process

#### 4.2.3. RCM Analysis

The RCM analysis is the step where the tactics development takes place, with the quality of the work depending on the degree of preparation and input from the selected tactics development team.

This step is described in the Develop Tactics Guideline and follows a series of defined steps:

1. **Preparation:** Enter as much information as possible into the RCM tool, including criticality parameters, equipment hierarchy, existing tasks, anticipated functions and functional failures.

2. **Review of existing tactics:** Validate with the key stakeholders information provided for the assessment such as failure modes, failure consequences and effects, existing tactics, acceptable limits and secondary actions.

3. **Define new tasks:** Based on failure modes and their impact to the business, define if and how tactics need to be changed, including all relevant aspects of the task execution. The AS&R tool provides the option to produce a summary of the modifications being proposed, including cost and consequential downtime.

4. **Define task review triggers:** Identify the next time the new tasks need to be reviewed, based on risks and level of confidence. This step will be incorporated into the implementation action plan management process.

5. **Further actions:** Identify all further actions required to implement the new tactics, including equipment modifications, new tools and training needs. It is critical that clear accountabilities and proper management of the actions are defined.

#### 4.2.4. Review and Consolidate Recommendations

Once all the tactics recommendations have been built they now need to be reviewed and confirmed for use and analysis. All similar recommendations should be consolidated into a single consistent plan.

In order to prepare for implementation, tasks are grouped into:
- Labour skill sets
- Service route
- Task frequency
- Tooling
- Spares
- Safe work procedures

Where applicable, include quantitative measures on the asset's performance.

During this step the actions are consolidated to remove similar or duplicate tasks. The final list of tactics actions will then be sent for Re-evaluation Criteria determination.

#### 4.2.5. Determine Re-Evaluation Criteria

Determine if and when maintenance tactics should be reviewed, such as time or failure based. This is the trigger which defines the current validity of the work completed. This is typically defined through a consultative engagement with the Engineering manager.

**Typical triggers could be:**

- Time based review -- every two years
- Asset performance changes
- Change of production plan
- Changes in equipment configuration
- Defect Elimination investigations
- Changes in standards or regulations
- HSE incident investigations
- Changes in site operating conditions or context

---

### 4.3. Assess Asset Tactics

The sub-processes within the Assess Tactics module are:

- **Identify tactics for review**
- **Assess and optimise tactics**
- **Document outcome**

*[Diagram: Picture 7 -- Assess Asset Tactics process diagram section]*

This next step consists of assessing the effectiveness of the asset tactics that have been developed. It covers the selection of the asset maintenance tactics, their assessment against a risk based model and documenting the outcome. The output is an understanding of the business impact of the tactics with respect to residual risk and cost to execute.

The asset tactics are reviewed and audited as to how practical and effective they are to maintain the asset functions. This process usually requires several iterations and tuning until all stakeholders are satisfied with the quality.

#### 4.3.1. Identify Asset Tactics for Review

A number of different asset tactics are being developed and will normally be at different stages of the process. Identify the tactic packages that have been completed and now require a final assessment before implementation into the site CMMS.

A group of tactics are selected for review based on their common elements and required expertise for discussion by the relevant team.

As a guide, the assessment team would comprise the Superintendent Asset Management as well as personnel from the owner and operational teams. It may also be necessary to use other specialist advice.

Collate and prepare the risk assessments conducted during the previous step, with conjunction with the business and asset strategies, to be used as a reference.

#### 4.3.2. Assess and Optimise Tactics

This step covers the assessment of the selected asset tactics against core defined business risk elements. The elements used in the assessment are a simplified version of the Asset Criticality Assessment, due to the significant number of tactics usually produced.

**Assessment elements:**

- Safety
- Environment
- Production losses
- Cost of execution

**The analysis of risk, cost and benefit should include:**

- Compare the mitigated and unmitigated business risk -- is the mitigated risk acceptable?
- Is the cost of implementing the tactics worth the benefit?
- Do the tactics meet your needs?

The output is an understanding of the risk and cost of the selected asset maintenance tactics based on business strategy and operational context. The most appropriate residual risk and cost to maintain the asset functions will be determined by the stakeholders in the business.

#### 4.3.3. Document Outcome

The tactics that were selected in the previous step now need to be syndicated and approved.

1. Ensure that the proposed tactics are syndicated with relevant stakeholders, with the proposed changes in budgets and the mitigated risks
2. This review must occur as a joint operations or business unit effort to ensure buy-in and support
3. The actions identified in 'Develop Tactics' need to be consolidated and entered into the site project management system
4. The Reliability Team needs to ensure that the approved actions are executed in a timely manner
5. These actions usually include equipment modifications, new tools required, with relevant training and communication plans
6. After all stakeholders agree, obtain and document formal approval from the relevant managers (which might include the site GM)
7. The most appropriate asset maintenance tactics can now be transferred into the site CMMS system

---

### 4.4. Implement Asset Tactics

The sub-processes within the Implement Tactics module are:

- **Develop work procedures**
- **Schedule one time changes and actions**
- **Implement tactics into CMMS**

*[Diagram: Picture 8 -- Implement Asset Tactics process diagram section]*

The objective of this step is to ensure all of the required actions identified in the Assess Tactics step are reflected in executable maintenance tasks within CMMS. Conversely, **there should be no task lists or primary work orders that are not justified through the maintenance tactics development process**. All of the actions identified are to be reflected in maintenance work orders generated by CMMS transactions.

#### 4.4.1. Develop Work Procedures

1. **Package and group the tasks** to minimise the number of work orders created. Logically group the maintenance actions based on: online/offline, location (routes), skill set, and frequency
2. **Work orders** must be raised at the appropriate level in the Functional Location Structure in a logical sequence
3. **Cost estimation** -- The cost of the tasks is created and becomes the estimated costs that can be compared to validate the maintenance actions. If costs are not acceptable, more work should be done to optimise the task list
4. **Produce first cut job sheet** (sequenced job procedure) and conduct field review and validation
5. **Optimise for content, logic and duration** to make sure that the work can be completed in a safe and efficient manner
6. **Review maintenance plans** for completeness and accuracy before loading into CMMS
7. **Modify tactics** following field validation, feedback and agreement on best approach for final approval

#### 4.4.2. Schedule One Time Changes and Actions

- Consolidate all the one-time actions identified during the 'Develop Tactics' step
- Implement a management process for the action plan
- Include **training for the team** on the selected tactics to be implemented
- Ensures all stakeholders have the knowledge and capability to execute the new asset tactics
- Execute the tasks as planned

#### 4.4.3. Implement Tactics into CMMS

Once the tactics are developed and packaged, the next step is to build and upload all required data into CMMS. This includes migrating details for:

- Operations
- Task lists
- Plans

Secondary and Breakdown Task lists also need to be created for use when creating a work order in the Work Management process.

After the Master data of Task lists, Maintenance Items and Plans are loaded into CMMS, they can be scheduled and the Tactics started. The scheduling involves:

- Determining when maintenance plans should start
- Managing workload on resources who will be tasked with performing the work
- Determining the optimum time that will fit with the production teams

---

### 4.5. Improve Asset Tactics

The sub-processes within the Improve Tactics module are:

- **Review equipment performance**
- **Review maintenance performance**
- **Review defect elimination findings**
- **Conduct scheduled tactics reviews (triggers)**

*[Diagram: Picture 9 -- Improve Asset Tactics process diagram section]*

*[Diagram: Picture 10 -- Examples of equipment performance indicators]*

Once maintenance tactics have been in place for a period of time, a review needs be routinely carried out (weekly and monthly) to evaluate if the tactics are achieving the goals that were set, delivering the required equipment performance and preserving its functions. This will lead to a decision to create new tactics or re-assess existing ones.

The use of **Pareto analysis** is recommended as a visual tool to prioritise and communicate proposed additional reviews. The value of this tool is to identify the 20 per cent of work that can generate 80 per cent of the potential benefit. Given the typical equipment wear cycles, the Pareto analysis data should cover a period of **at least 12 months** to ensure meaningful results.

#### 4.5.1. Triggers for Review

**Review equipment performance:**
- Equipment reliability
- Equipment cost
- Equipment event delay history data -- Anglo Time Usage Model should be used
- Industry benchmark performance data

**Review maintenance performance:**
- Equipment maintenance history
- Work Management data (work orders)
- Equipment failure history
- Maintenance Cost
- Maintenance labour efficiency

**Review defect elimination findings:**
- Defect Elimination investigations may determine that the asset tactics require a review
- HSE incident investigations may also identify the need for reviewing individual asset tactics

**Other triggers for scheduled tactics reviews:**
- Asset Tactics time based review, as defined in the Develop Tactics step
- Changes of production plan
- Changes in operational context
- Changes in standards or regulations

#### 4.5.2. Measuring the Performance of the Asset Tactics Development Process

It is important to use leading KPIs (process related) to ensure that the Asset Tactics Development process is capable of delivering value to the business.

Develop and maintain an overall Tactics Development and Improvement plan with a monthly review of the process performance.

**Recommended KPIs:**

| KPI Category | Metrics |
|---|---|
| **Task Changes** | Number of tasks added or deleted |
| **Labour Changes** | Maintenance man hours added or deleted |
| **Training** | Training requirements identified and their cost; Training plan |
| **Parts** | Changes to parts holding |
| **Procedures** | Number of safe work procedures identified |
| **Expected Benefits** | Maintenance costs, availability, MTTR, MTBF, production performance |

**Progress Asset Tactics Development Milestones:**

- Percentage of components with asset tactics development completed as per calendar
- Number of tactics developed in a given period of time
- Percentage of tasks entered into CMMS
- Percentage of identified training completed
- Percentage of completed tactics that were entered into CMMS
- Percentage of tactics entered into CMMS that are being actively executed
- Change management requirements completed
- Contingency established for new tactics
- Number of one-time actions completed
- Number of equipment types with Reliability Block Modelling completed
- Number of components with Life Cycle Costing completed
- Percentage of total maintenance budget developed as per ZBB principles

---

## 5. Terms and Definitions

| Term | Definition |
|---|---|
| **Asset** | A piece of equipment required for meeting the business targets. Includes mobile equipment fleets and fixed plant machinery (e.g., haul trucks, loaders, crushers, pumps, conveyors, mills, floatation cells). All assets should have their life cycle planned and costed, with the level of detail matching the criticality of the asset. |
| **Asset Criticality Assessment** | A process to score and rank all risks associated to a piece of equipment, based on consequence and likelihood of undesirable events to occur. |
| **Asset Tactics** | A set of tasks and decisions to be carried out to enable the realisation of the required level of performance of the Asset. The tasks define: what is the maintainable item; where is it located; what are we doing; how are we maintaining it; when are we maintaining it? |
| **CMMS** | Computerised Maintenance Management System. A computer based system in which the asset hierarchy is defined to allow effective management of selected tactics. Includes task descriptions, cost and resource allocation. Anglo American uses versions of Ellipse and SAP. |
| **Corrective action** | The action required to correct or prevent the failure mode when the acceptance criteria is no longer met. |
| **Failure consequence** | The impact to the business related to the events (failure effects) following the failure mode until functionality has been restored. May include safety, environmental and financial consequences. |
| **Failure effect** | The sequence of events after the failure mode occurs until the failed function has been restored and all consequences are resolved. Shall include all the information needed to support the evaluation of the consequences of the failure to the business. |
| **Failure finding task** | A scheduled task used to determine whether a specific hidden failure has occurred. |
| **Failure mode** | A single event which causes a functional failure. The description should consist of a noun and a verb. Words such as "fails", "breaks" or "malfunctions" should not be used as they are unspecific. Includes: failure modes that have happened before (failure history), failure modes currently being prevented by existing maintenance programs, and failure modes that have not yet happened but are likely to occur in the current operating context. |
| **Function** | The required attributes and performance levels that a physical asset is expected to deliver. Includes primary and secondary functions. |
| **Functional failure** | A state in which a physical asset or system is unable to perform a specific function to a required level of performance. Can be partial or total. |
| **Hidden failure** | A failure mode where the consequences do not become evident under normal circumstances if the failure mode occurs on its own. Usually the case for alarms and sensors. |
| **Maintainable item** | A level in the functional location structure that represents an item of plant where tactics are executed, individual history recorded and costs allocated. Normally the lowest level in the functional location hierarchy. |
| **On-condition task** | A scheduled task used to detect a potential failure. Usually considered as preferred in the task selection process as they can be performed while the equipment is in operation, allow better job planning, avoid costly unscheduled failures and optimize component life. |
| **One-time change** | Any required task to enable the asset tactics to be performed. May include changes to: physical configuration, method used by an operator/maintainer, operating context of the system, or capability of an operator/maintainer (training plan). |
| **P-F interval** | The interval between the point at which a potential failure becomes detectable and the point at which it degrades into a functional failure. |
| **Primary action** | The task that is routinely generated from the maintenance system based on defined tactics. |
| **Proactive maintenance** | Actions undertaken to avoid a defect to be introduced in order to prevent the item from getting into a premature failed state. |
| **Primary function** | The function which constitutes the main reason why a physical asset is acquired. Example: "To pump water from tank X to tank Y at a rate between 800 to 900 l/min". |
| **RCM (Reliability Centered Maintenance)** | A methodology for developing asset tactics that preserves all the functions of systems, based on failure modes and consequences, in the most economical possible way. |
| **Risk acceptance threshold** | A measure of the level of risk exposure above which action should be taken to address the consequences, and below which risks may be deemed acceptable. |
| **Run-To-Failure (RTF)** | A failure management option that allows for a specific failure mode to occur without any attempt to anticipate or prevent it. |
| **Secondary functions** | Functions which a physical asset or system has to fulfill in addition to its primary function. Includes those needed to fulfill regulatory requirements and those to prevent environmental, safety, reputation and community relation consequences. The loss of a secondary function can have more serious consequences than those of the loss of a primary function. |
