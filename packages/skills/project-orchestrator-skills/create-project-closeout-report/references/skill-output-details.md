# Detailed Output Specification - create-project-closeout-report

*Detailed output formats and field definitions extracted from CLAUDE.md.*
*Read this file when you need the complete output field definitions and format details.*

---

### 1. Executive Summary (2-3 pages)
{Project overview, key achievements, final performance metrics,
major lessons, and headline recommendations}

### 2. Project Overview (2-3 pages)
{Project description, objectives, scope, key stakeholders,
organizational structure, delivery model, timeline}

### 3. Cost Performance (5-8 pages)

#### 3.1 Final EVM Metrics
| Metric | Value | Interpretation |
|--------|-------|----------------|
| Final CPI | {x.xx} | {Under/Over budget by X%} |
| Final SPI | {x.xx} | {Ahead/Behind schedule by X%} |
| BAC | ${XXX.XM} | {Original approved budget} |
| EAC (at FID) | ${XXX.XM} | {Estimate at FID approval} |
| Final Actual Cost | ${XXX.XM} | {Total actual expenditure} |
| VAC | ${+/-X.XM} | {Budget variance} |

#### 3.2 Cost Breakdown by WBS Level 2
{Table with budget, actual, variance, and percentage for each WBS L2 element}

#### 3.3 Cost Growth Decomposition
{Waterfall chart data: Original Budget → Scope Changes → Design Development
→ Rework → Escalation → Force Majeure → Estimation Error → Productivity
→ Final Actual Cost}

#### 3.4 Contingency Utilization
{Original contingency, drawdown by category, remaining, utilization percentage}

#### 3.5 Unit Cost Benchmarks
{Key unit costs for future project estimating benchmarks}

#### 3.6 Estimate Accuracy Assessment
{Original Class 5 estimate vs. actual, Class 3 estimate vs. actual,
accuracy percentages per AACE RP 18R-97 expectations}

### 4. Schedule Performance (5-8 pages)

#### 4.1 Duration Summary
| Phase | Planned (months) | Actual (months) | Variance | Cause |
|-------|-------------------|-----------------|----------|-------|
| FEL1 | {X} | {X} | {+/-X} | {Root cause} |
| FEL2 | {X} | {X} | {+/-X} | {Root cause} |
| FEL3 | {X} | {X} | {+/-X} | {Root cause} |
| Execution | {X} | {X} | {+/-X} | {Root cause} |
| Commissioning | {X} | {X} | {+/-X} | {Root cause} |
| Ramp-Up | {X} | {X} | {+/-X} | {Root cause} |
| **Total** | **{X}** | **{X}** | **{+/-X}** | |

#### 4.2 Milestone Achievement
{Final milestone register with planned vs. actual for all Key milestones}

#### 4.3 Critical Path History
{How did the critical path evolve? Major migrations and their causes}

#### 4.4 Schedule Change Impact
{Total schedule impact of approved changes vs. original baseline}

### 5. Safety Performance (2-3 pages)
{TRIR, LTIR, near-miss frequency, safety milestones achieved,
process safety events, environmental incidents}

### 6. Quality Performance (2-3 pages)
{Rework rates, inspection pass rates, NCR trends,
commissioning first-pass success rate, operational performance vs. design}

---

## PART B: LESSONS LEARNED

### 7. Lessons Learned Summary (2-3 pages)
{Statistical summary: total lessons by phase, discipline, and theme;
top 5 most impactful positive lessons; top 5 most impactful improvement areas}

### 8. Lessons by Project Phase (8-12 pages)

#### 8.1 FEL1 Lessons
{3-5 specific, actionable lessons from concept selection phase}

#### 8.2 FEL2 Lessons
{3-5 specific, actionable lessons from FEED / FID phase}

#### 8.3 FEL3 Lessons
{3-5 specific, actionable lessons from detailed design phase}

#### 8.4 Execution Lessons
{5-8 specific, actionable lessons from construction and procurement}

#### 8.5 Commissioning and Ramp-Up Lessons
{3-5 specific, actionable lessons from commissioning and startup}

### 9. Lessons by Discipline (5-8 pages)
{Key lessons from each discipline: Engineering, Procurement,
Construction, Commissioning, Operations, HSE, Finance, Contracts}

### 10. Recommendations for Future Projects (3-5 pages)

#### 10.1 Process Improvements
{Specific process changes recommended based on lessons learned}

#### 10.2 Technology Improvements
{Technology or tool changes recommended}

#### 10.3 Organizational Improvements
{Organizational structure or capability changes recommended}

#### 10.4 Commercial Improvements
{Contracting strategy or procurement process changes recommended}

#### 10.5 Methodology Updates Proposed
{Updates to VSC OR methodology based on project experience}

---

## PART C: KNOWLEDGE TRANSFER AND ARCHIVAL

### 11. Knowledge Transfer Checklist (3-5 pages)
{Complete checklist of knowledge items to transfer to operations,
organized by category, with status and responsible party}

### 12. Document Archival Plan (2-3 pages)
{Document classification, retention schedule, archive location,
access permissions, format preservation plan}

### 13. Warranty and Guarantee Register (2-3 pages)
{Summary of all active warranties with expiry dates, conditions,
claim procedures, and assigned operations owner}

### 14. Outstanding Items (1-2 pages)
{Any items not yet complete at closeout: open punchlist items,
pending claims, unresolved disputes, deferred scope}

---

## APPENDICES
### A. Final EVM Data (detailed by WBS and period)
### B. Final Milestone Register (complete)
### C. Change Register Summary (all changes with final actual impact)
### D. Lessons Learned Database (detailed individual lesson records)
### E. Knowledge Transfer Checklist (detailed)
### F. Warranty Register (complete)
### G. Document Archive Index
### H. Agent Closeout Summaries (individual inputs from each agent)
```

### Document 2: Lessons Learned Database (.xlsx)

**Filename**: `{ProjectCode}_Lessons_Learned_Database_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **All Lessons** -- Complete database of all lessons with full categorization
   - Columns: Lesson ID, Phase, Discipline, Theme, Context, Action, Result, Recommendation, Impact (quantified), Applicability, Source Agent, Validation Status
2. **By Phase** -- Lessons filtered and grouped by project phase
3. **By Discipline** -- Lessons filtered and grouped by discipline
4. **By Theme** -- Lessons filtered and grouped by improvement theme
5. **Recommendations** -- Actionable recommendations derived from lessons with priority and owner
6. **Methodology Updates** -- Proposed updates to VSC OR methodology

### Document 3: Warranty and Guarantee Register (.xlsx)

**Filename**: `{ProjectCode}_Warranty_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Active Warranties** -- All active warranties with monitoring schedule
   - Columns: ID, Equipment/System, Vendor, Warranty Type, Start Date, Expiry Date, Duration, Conditions, Claim Procedure, Operations Owner, Monitoring Frequency, Next Review Date, Status
2. **Performance Guarantees** -- Equipment performance guarantees with test results
   - Columns: ID, Equipment, Guarantee Parameter, Guaranteed Value, Actual Value, Pass/Fail, Test Date, Retest Required, Liquidated Damages Applicable
3. **Defects Liability** -- Contractor defects liability periods
   - Columns: Contract ID, Contractor, Scope, DLP Start, DLP Expiry, Outstanding Defects, Resolution Status
4. **Expiry Calendar** -- Calendar view of upcoming warranty expirations for proactive management

### Document 4: Knowledge Transfer Checklist (.xlsx)

**Filename**: `{ProjectCode}_Knowledge_Transfer_Checklist_v{Version}_{YYYYMMDD}.xlsx`

**Sheets:**

1. **Engineering Knowledge** -- As-built drawings, calculations, design basis, vendor data
2. **Operations Knowledge** -- SOPs, emergency procedures, operating limits, alarm settings
3. **Maintenance Knowledge** -- Strategies, spare parts, CMMS data, vendor contacts
4. **HSE Knowledge** -- Safety case, HAZOP, risk assessments, permits, emergency plans
5. **Commercial Knowledge** -- Contracts, warranties, guarantees, insurance
6. **Financial Knowledge** -- Final costs, unit costs, operational budget basis
7. **Summary Dashboard** -- Overall transfer status with percentage completion by category

---
