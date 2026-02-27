# Asset Tactics Development Process Map

---

> **Used By Skills:** orchestrate-workflow

---

| Metadata | Value |
|---|---|
| **Source File** | `asset-management-methodology/maintenance-strategy-tactics-developmenet-Process-Map.pdf` |
| **Pages** | 2 |
| **Conversion Date** | 2026-02-23 |
| **Format** | Process flowcharts with detailed decision logic |

---

## Table of Contents

- [Page 1: High-Level Process Overview](#page-1-high-level-process-overview)
- [Page 2: Detailed Process Map with Decision Points](#page-2-detailed-process-map-with-decision-points)
  - [Phase 1: Assess Asset Criticality](#phase-1-assess-asset-criticality)
  - [Phase 2: Develop Tactics](#phase-2-develop-tactics)
  - [Phase 3: Assess Asset Tactics](#phase-3-assess-asset-tactics)
  - [Phase 4: Implement Tactics](#phase-4-implement-tactics)
  - [Phase 5: Improve Tactics](#phase-5-improve-tactics)
  - [Acronyms](#acronyms)
  - [Page Legend](#page-legend)

---

## Page 1: High-Level Process Overview

The Asset Tactics Development Process consists of five major phases, each with defined sub-processes:

```
[Review Asset Criticality] --> [Develop Tactics] --> [Review Asset Tactics] --> [Implement Tactics] --> [Improve Tactics]
```

### Phase Breakdown

| Phase | Sub-processes |
|---|---|
| **Review Asset Criticality** | Criticality Assessment Preparation, Asset Criticality |
| **Develop Tactics** | Tactics Development Preparation, Develop Maintenance Tactics, Determine Re-Evaluation Criteria |
| **Review Asset Tactics** | Identify Tactics for Review, Assess and Optimise Tactics, Document Outcome |
| **Implement Tactics** | Develop Work Procedure, Schedule one time changes, Implement Tactics into CMMS |
| **Improve Tactics** | Scheduled Tactics Reviews, Defect Elimination Findings, Maintenance Performance, Equipment Performance |

---

## Page 2: Detailed Process Map with Decision Points

### Phase 1: Assess Asset Criticality

#### Criticality Assessment Preparation

```
[System & asset data adequate & correct?]
    |            |
    NO           YES
    |            |
    v            v
[Fix data]   [Assemble team and asset data]
                 |
                 v
             [Define criticality matrix parameters]
```

> **Note:** Parameters such as annual capital expenditure, revenue, cost of downtime and other items required to use the HSEQ Qualitative Risk Assessment matrix.

#### System Criticality

```
[Site criticality parameters defined?]
    |            |
    NO           YES
    |            |
    v            v
[Re-scope    [System functional assessment required?]
 or reject]      |            |
                 NO           YES
                 |            |
                 v            v
             [Determine    [Determine system functional boundaries]
              system            |
              criticality]      v
                 |         [APM criticality determination]
                 v              |
             [Determine system criticality]
                 |
                 v
             [Approve assessment]
                 |
                 v
             [Functional criticality assessment approved?]
                 |            |
                 NO           YES
                 |            |
                 v            v
             [Go back]   [Syndicate outputs of functional criticality assessment]
```

#### Asset Criticality

```
[Define assets to be assessed]
    |
    v
[Determine criticality of physical assets]
    |
    v
[APM criticality determination]
    |
    v
[Rank outputs and prepare reports for syndication]
    |
    v
[Transfer criticality to CMMS]
    |
    v
[Asset Criticality Assessment approved?]
    |            |
    NO           YES
    |            |
    v            v
[Go back]   [Syndicate outputs of Asset Criticality Assessment]
                 |
                 v
             [Rank outputs and prepare reports for syndication]
                 |
                 v
             [APM criticality determination]
```

---

### Phase 2: Develop Tactics

#### Tactics Development Preparation

```
[Defined Tactics Development / Improvement Plan]
    |
    v
[Form Tactics Development Team(s)]
    |
    v
[Collect and analyse asset data]
```

#### Develop Maintenance Tactics

```
[Maintenance tactics exist for this asset?]
    |            |
    NO           YES
    |            |
    v            v
[Do Tactics  [Can they be modified for reuse?]
 exist for       |            |
 this asset      NO           YES
 in Anglo        |            |
 American?]      v            v
    |        [APM RCM]    [RCM analysis from existing tactics
    NO           |         (Asset tactics or template)]
    |            v              |
    v        [Train team       v
[APM RCM /    on RCM]     [APM RCM / FMEA]
 FMEA]           |              |
    |            v              v
    v        [RCM analysis] [Review and consolidate
[List of         |          recommended Actions]
 actions]        v              |
             [APM RCM /        v
              FMEA]        [List of actions]
```

> **Note:** Could be from templates or similar Assets.

#### Determine Re-Evaluation Criteria

```
[Determine criteria to trigger re-evaluation]
    |
    v
[APM Configure alarms, notifications and reminders]
```

> **Triggers could be:** Time based, Under performance, Change in operating context, Defect elimination.

#### Document Outcome

```
[Develop implementation plan]
    |
    v
[List tactics requiring one time changes to:]
    - Maintenance procedures
    - Operational procedures
    - Training
    - Spares
    - Physical assets
```

#### Implement One Time Changes

```
[Initiate changes to Maintenance Procedures]
[Initiate changes to Operational Procedures]
[Initiate changes to Training]
[Initiate the purchase / changes to recommended spare parts]
[Initiate changes to physical assets]
    |
    v
[Track and report action status]
    |
    v
[Finish]
```

---

### Phase 3: Assess Asset Tactics

#### Identify Tactics to Assess

```
[Select Management Assessment Team]
    |
    v
[AABS - Identify asset for review]
    |
    v
[APM ASM - Assess maintenance tactics]
```

#### Assess and Optimise Tactics

```
[Confirm risk matrix parameters]
    |
    v
[APM ASM - Manipulate tactics and actions]
    |
    v
[APM ASM - Collate risk assessment for tactics]
    |
    v
[Is risk and value acceptable?]
    |            |
    NO           YES
    |            |
    v            v
[Go back]   [Syndicate outputs of Tactics Assessment]
                 |
                 v
             [Tactics accepted for approval?]
                 |            |
                 NO           YES
                 |            |
                 v            v
             [Go back]   [APM ASM - Approve tactics]
```

> **Notes:**
> - Ensure that the site's/BU's Management of Change standard is satisfied. Additional site requirements may be applicable.
> - Review the unmitigated and mitigated failure risk addressed by each action. Assess the impact on both cost and risk of not implementing each action.
> - The collective assessment of individual tactics allows the management team to assess the overall cost vs risk balance.
> - Consolidate the recommendations to remove similar or duplicate ones. "Promote to Action" those recommendations that will be assessed for risk and value. These recommendations will then be available in ASM.
> - Parameters such as revenue, cost of downtime and other items used to assess failure risks.

---

### Phase 4: Implement Tactics

#### Develop Work / Job Procedure

```
[Group maintenance actions]
    |
    v
[Produce first cut service sheet]
    |
    v
[Field validation]
    |
    v
[Modifications required?]
    |            |
    NO           YES
    |            |
    v            v
[Approve    [Update service sheet (MS Word / PDF)]
 service         |
 sheet]          +---> Go back to [Field validation]
```

#### Implement Tactics into CMMS

```
[Define process for entering asset tactics into CMMS]
    |
    v
[Create operations (tasks) in Job Plan]
    |
    v
[Are all operations (tasks) in a Job Plan?]
    |            |
    NO           YES
    |            |
    v            v
[Go back]   [Create Maintenance Task Lists]
                 |
                 v
             [Create measurement points]
                 |
                 v
             [Identify / create Maintenance Items]
                 |
                 v
             [Identify / create Maintenance Plans]
                 |
                 v
             [Are all task lists linked?]
                 |            |
                 NO           YES
                 |            |
                 v            v
             [Link task   [Catalogue profiles to be created / modified?]
              list to          |            |
              Maintenance      NO           YES
              Item]            |            |
                 |             v            v
                 v         [External    [Create / modify Catalogue Profiles]
             [Link item    documents        |
              to Maint.    required?]       v
              Plan]            |        [Use linked documents to Job Plan]
                 |             |
                 v             v
             [Confirm data migration to AABS]
                 |
                 v
             [Balance / optimise master schedule]
                 |
                 v
             [Create walkaround]
                 |
                 v
             [Create / launch PM]
                 |
                 v
             [Start maintenance plans]
                 |
                 v
             [Finish]
```

> **Additional triggers for new entry:** New assets or changes to existing assets, Change in operating context.

---

### Phase 5: Improve Tactics

#### Weekly Cycle

```
[Perform strategy analysis]
    |
    v
[Perform loss analysis]
    |
    v
[Generate KPIs and reports (Weekly)]
    |
    v
[Weekly Review Meeting]
    |---> Safety Share, HSE Review
    |---> KPI Review
    |
    v
[Implement actions]
    |
    v
[Weekly Tactics Improvement Plan]
```

#### Monthly Cycle

```
[Analyse asset performance]
    |
    v
[Analyse maintenance performance]
    |
    v
[Work Management Analyse and Improve]
    |
    v
[Defect Elimination]
    |
    v
[Identify bad actors tactics]
    |
    v
[Has anything changed that will impact criticality?]
    |            |
    NO           YES
    |            |
    v            v
[Scheduled   [APM criticality determination]
 tactics          |
 review]         v
    |         [Develop Asset Maintenance Tactics] (go to Phase 2)
    v
[Update Tactics Development / Improvement Plan]
```

---

### Acronyms

| Acronym | Full Name |
|---|---|
| **ASI** | Asset Strategy Implementation |
| **APM** | Asset Performance Management |
| **ASM** | Asset Strategy Management |
| **CMMS** | Computerized Maintenance Management System |
| **FMEA** | Failure Mode and Effects Analysis |
| **RCM** | Reliability Centered Maintenance |
| **AABS** | Anglo American Business Solution |
| **AARS** | Anglo American Reliability Solution |

### Page Legend

| Symbol | Meaning |
|---|---|
| Rectangle | Measurement point |
| Rounded rectangle | Process point |
| Diamond | Decision step |
| Hexagon | AABS transaction |
| Circle | Meeting or discussion |
| Triangle | More information required |
| Oval | Start / Finish |
| Arrow with flag | Link to External process |
