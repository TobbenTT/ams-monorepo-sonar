# REF-04: Quality Validation Rules & Checklists

## Source: R8 QA Guideline, MSO Checklist, QA Management Flowchart, Lessons Learned

---

## 1. Six-Stage QA Process

```
Stage 1: QA Self-Check #1 (Pre-workshop)
    ↓
Stage 2: QA Self-Check #2 (Post-strategy development)
    ↓
Stage 3: QA Self-Check #3 (Work packaging)
    ↓
Stage 4: Formal QA Check #1 (Independent review, pre-approval)
    ↓
Stage 5: Formal QA Check #2 (Second independent check, post-workshop)
    ↓
Stage 6: Final QA Check (Pre-SAP upload)
```

---

## 2. QA Self-Check #1: Pre-Workshop

| # | Check | Status |
|---|-------|--------|
| 1 | Verify SAP hierarchy matches physical plant | [ ] |
| 2 | Review additional site information | [ ] |
| 3 | Compare SAP & OEM info with P&ID for missing equipment | [ ] |
| 4 | Review primary maintenance activities from CMMS | [ ] |
| 5 | Review work order history | [ ] |
| 6 | Obtain budgeted life information | [ ] |
| 7 | Review operating constraints for online/offline tasks | [ ] |

---

## 3. QA Self-Check #2: Post-Strategy Development

| # | Check | Rule | Status |
|---|-------|------|--------|
| 1 | Failure Mode description | Clearly outlines: component + how it fails + cause | [ ] |
| 2 | Strategy decision | Follows RCM decision tree (risk-based approach) | [ ] |
| 3 | Task frequency — calendar | Calendar-based ONLY for age-related causes (Age, Contamination) | [ ] |
| 4 | Task frequency — operational | Operational units ONLY for usage-related causes (Use, Abrasion, Erosion) | [ ] |
| 5 | Task constraints | Match site convention; Online=0 access time; Offline≠0 access time | [ ] |
| 6 | Acceptable limits | Align with site requirements (VA, Oil, Thermography standards) | [ ] |
| 7 | Secondary tasks | Clearly define requirement once acceptable limit is exceeded | [ ] |

---

## 4. QA Self-Check #3: Work Packaging

| # | Check | Rule | Status |
|---|-------|------|--------|
| 1 | WP level | Correct level verified with site | [ ] |
| 2 | WP naming | Convention verified (40 char limit, no illegal chars, ALL CAPS) | [ ] |
| 3 | WP labour | All tasks have labour assigned (quantity AND hours) | [ ] |
| 4 | WP materials | All materials have quantity defined | [ ] |
| 5 | WP constraints | Match site convention | [ ] |
| 6 | WP details | All "Work Package Details" tab fields allocated | [ ] |
| 7 | WP frequency | Aligns with allocated task frequencies | [ ] |
| 8 | WP type | Sequential/suppressive/standalone verified with site | [ ] |

---

## 5. Formal QA Check #1: Independent Review (Pre-Approval)

| # | Check | Rule | Status |
|---|-------|------|--------|
| 1 | All Self-Check items | QA Self-Check #1, #2, #3 verified by independent reviewer | [ ] |
| 2 | Library references | All equipment referenced back to Component Library then Equipment Library | [ ] |
| 3 | Sandbox cleanup | All Sandbox equipment copied to library as components | [ ] |
| 4 | Task naming — SAP | Sentence case, max 72 characters for SAP long text | [ ] |
| 5 | Labour table | Aligned with site naming convention and SAP Work Centre codes | [ ] |

---

## 6. Formal QA Check #2: Post-Workshop (Second Independent Check)

| # | Check | Rule | Status |
|---|-------|------|--------|
| 1 | All Formal QA #1 items | Re-verified AFTER workshops | [ ] |
| 2 | RCM compliance | Second reviewer confirms RCM decision tree was followed | [ ] |
| 3 | Exceptions documented | Any deviations from RCM approved by client | [ ] |

> Note: "It is easy to move away from RCM requirements and a second check is required to ensure we understand this and exceptions are approved by the client"

---

## 7. Final QA Check: Pre-SAP Upload

| # | Check | Rule | Status |
|---|-------|------|--------|
| 1 | Work Plan data | Aligns with SAP standard; all fields completed | [ ] |
| 2 | Maintenance Item data | Aligns with SAP standard; all fields completed | [ ] |
| 3 | Task List + Operations | Aligns with SAP standard; all fields completed | [ ] |
| 4 | Work Instructions | Each WI export reviewed in soft copy; task route sensible | [ ] |

---

## 8. Field-Level Validation Rules

### 8.1 Hierarchy Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| H-01 | Hierarchy depth | Maximum 3 levels (Equipment > System > MI) | ERROR |
| H-02 | MI code | CMMS component type code on every maintainable item | ERROR |
| H-03 | Hierarchy match | SAP hierarchy must match physical plant | ERROR |
| H-04 | P&ID coverage | Compare with P&ID for missing equipment | WARNING |

### 8.2 Function Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| F-01 | System functions | All systems MUST have functions defined | ERROR |
| F-02 | System failures | All systems MUST have functional failures defined | ERROR |
| F-03 | MI functions | All MIs MUST have functions defined | ERROR |
| F-04 | MI failures | All MIs MUST have functional failures defined | ERROR |
| F-05 | Function format | Must follow: Verb + Noun + Performance Standard | WARNING |

### 8.3 Criticality Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| C-01 | Equipment criticality | Every equipment MUST have criticality at equipment level | ERROR |
| C-02 | System criticality | All systems MUST have criticality defined | ERROR |
| C-03 | MI criticality | Maintainable items MAY have criticality (optional) | INFO |
| C-04 | High criticality FM | There SHOULD be a failure mode showing the high criticality | WARNING |

### 8.4 Failure Mode Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| FM-01 | What | Must start with capital letter | ERROR |
| FM-02 | What | Must be singular (Seal, not Seals) | ERROR |
| FM-03 | What | Must specify exact location | WARNING |
| FM-04 | Mechanism | Must be from predefined list | ERROR |
| FM-05 | Cause | Must be from predefined list | ERROR |
| FM-06 | Status | Must be Recommended or Redundant | ERROR |
| FM-07 | Lubricant degradation | "Degrades due to use" is the correct cause for lubricants | INFO |

### 8.5 Task Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| T-01 | CB acceptable limits | ALL CB tactics MUST have acceptable limit | ERROR |
| T-02 | CB conditional comments | ALL CB tactics MUST have conditional comment | ERROR |
| T-03 | FFI acceptable limits | ALL FFI tactics MUST have acceptable limit | ERROR |
| T-04 | FFI conditional comments | ALL FFI tactics MUST have conditional comment | ERROR |
| T-05 | Inspect naming | Format: "Inspect [what] for [that]" | WARNING |
| T-06 | Inspect language | Use "for [act of]": leakage (NOT leaks), blockage (NOT blocks) | WARNING |
| T-07 | Check usage | "Check" only for measurable values (level, temperature) | WARNING |
| T-08 | Test naming | Format: "Perform [type] test of [MI]" | WARNING |
| T-09 | Test limits | Expected function, not just "operational" | WARNING |
| T-10 | Visual inspect | Do NOT write "Visually inspect" — just "Inspect" | WARNING |
| T-11 | Required fields | All tasks MUST have constraint + task type + labour + intervals | ERROR |
| T-12 | Time unit consistency | Tasks must use consistent time/operational units | ERROR |
| T-13 | Replacement task | Every MI MUST have a replacement task | ERROR |
| T-14 | Secondary task naming | Format: "Replace/Repair [what]" | WARNING |
| T-15 | Secondary task scope | Must identify equipment AND MI | ERROR |
| T-16 | Replacement materials | ALL replacement tasks MUST have materials in costing | ERROR |
| T-17 | Constraint alignment | Online = 0 access time; Offline ≠ 0 access time | ERROR |
| T-18 | SAP name length | Max 72 characters for SAP long text | ERROR |
| T-19 | Task case | Sentence case (not ALL CAPS) | WARNING |

### 8.6 Work Package Rules

| Rule ID | Field | Validation | Severity |
|---------|-------|-----------|----------|
| WP-01 | Task allocation | Every task MUST be allocated to a work package | ERROR |
| WP-02 | Grouping — labour | Tasks grouped by work group type | ERROR |
| WP-03 | Grouping — constraint | Online tasks NEVER with offline tasks | ERROR |
| WP-04 | Grouping — frequency | All tasks in WP must match WP frequency | ERROR |
| WP-05 | Naming length | Maximum 40 characters | ERROR |
| WP-06 | Naming case | ALL CAPS | WARNING |
| WP-07 | Naming format | [FREQ] [ASSET] [LABOUR] [SERV/INSP] [ON/OFF] | WARNING |
| WP-08 | Suppressive intervals | Must be factors of the lowest WP interval | ERROR |
| WP-09 | Suppressive order | Starts with highest interval | ERROR |
| WP-10 | Sequential completeness | Whole sequence must be created | ERROR |
| WP-11 | Labour assigned | All tasks have labour (quantity + hours) | ERROR |
| WP-12 | Material quantity | All materials have quantity | ERROR |
| WP-13 | Optimal task order | Tasks ordered optimally within WP | WARNING |

---

## 9. Lessons Learned (Common Quality Issues)

| # | Issue | Impact | Prevention |
|---|-------|--------|-----------|
| 1 | Building equipment in library as whole asset | Unnecessary rework | Build as components first |
| 2 | Library items too few / not quality reviewed | Poor coverage | Review library before use |
| 3 | DCS-based CBM without proper research | Invalid strategies | Research monitoring capabilities first |
| 4 | Incorrect assumptions on operator inspections | Infeasible tasks | Verify with operations team |
| 5 | Poor work packaging quality | Unexecutable WOs | Follow grouping rules strictly |
| 6 | Incorrect hours in work packages | Budget errors | Verify with trades people |
| 7 | Wrong task-to-labour-type allocation | Wrong team assigned | Review with supervisors |
| 8 | Time prioritized over quality | Rework required | Allow sufficient QA time |
| 9 | Library not used well | Reinventing the wheel | Train on library usage |
| 10 | Disregard of existing maintenance plans | Lost knowledge | Always review current plans first |
| 11 | Implementation before approval | Unauthorized changes | Enforce approval gates |
| 12 | Maintenance tasks not valid or physically impossible | Wasted effort | Field verify all tasks |
| 13 | Lube/VA/Thermo runs poorly researched | Ineffective routes | Consult specialists |
| 14 | Primary task materials omitted | Incomplete WOs | Always define materials |

---

## 10. MSO Pre-Execution Checklist

### 10.1 General Activities

| # | Item | Status |
|---|------|--------|
| 1 | Configuration Workbook completed? | [ ] |
| 2 | PM/Inspection/Symptomatic route format defined with client? | [ ] |
| 3 | Secondary tasks budgeting approach defined? | [ ] |
| 4 | Man Work Centers requested for labour resource identification? | [ ] |

### 10.2 Preliminary Activities (19 items)

| # | Item | Status |
|---|------|--------|
| 1 | Functional hierarchy requested from client? | [ ] |
| 2 | Maintenance plans requested? | [ ] |
| 3 | Failure database requested? | [ ] |
| 4 | Spare parts lists requested? | [ ] |
| 5 | OEM manuals requested? | [ ] |
| 6 | Labour costs by specialty (internal/external) requested? | [ ] |
| 7 | Repair costs for reusable components obtained? | [ ] |
| 8 | Hierarchy loaded in R8? | [ ] |
| 9 | Current plans loaded and segregated by failure mode, resources, time? | [ ] |
| 10 | Failure database segregated (failed part, modes, actions, downtime, costs)? | [ ] |
| 11 | OEM plan (including major overhauls) segregated? | [ ] |
| 12 | Hierarchy levels adjusted per ISO 14224? | [ ] |
| 13 | MI naming convention defined? | [ ] |
| 14 | Field visit to verify hierarchy vs. physical equipment? | [ ] |
| 15 | Photographs captured (panoramic + detail)? | [ ] |
| 16 | Technical characteristics (nameplate data) captured? | [ ] |
| 17 | Workshop group defined? | [ ] |
| 18 | Workshop availability confirmed? | [ ] |
| 19 | All preliminary data reviewed and gaps identified? | [ ] |

### 10.3 During Execution

| # | Item | Status |
|---|------|--------|
| 1 | Analysis premises understood and agreed by working group? | [ ] |
| 2 | All existing strategies, failure data, and OEM analyzed? | [ ] |
| 3 | Failure modes and causes defined per equipment with occurrence probability? | [ ] |
| 4 | Operational contexts defined? | [ ] |
| 5 | Strategy defined for all operational contexts? | [ ] |
| 6 | Frequency validated for all tasks and overhauls? | [ ] |
| 7 | Resources defined (specialty, duration, #people, spare parts, tools, constraint, limits, comments)? | [ ] |

### 10.4 Post-Execution

| # | Item | Status |
|---|------|--------|
| 1 | FM clearly describes component + how it fails + cause? | [ ] |
| 2 | Strategy follows RCM decision tree? | [ ] |
| 3 | Calendar frequency for time-related failures (Age, Contamination)? | [ ] |
| 4 | Operational hour frequency for usage-related (Use, Abrasion)? | [ ] |
| 5 | Each task has a sensible failure mode? | [ ] |
| 6 | Work packages created by specialty + frequency? | [ ] |
| 7 | WP naming convention reviewed with client? | [ ] |
| 8 | All WP Details fields complete? | [ ] |
| 9 | Optimal task order within work packages? | [ ] |
| 10 | Parts lists elaborated including condition/predictive spares? | [ ] |
| 11 | Upload sheets for EAM system prepared? | [ ] |
