# Skill Alignment Matrix: AMS ↔ OR SYSTEM AG-003

Version: 1.1.0
Date: 2026-03-10
Phase: 5 — Agent & Skills Alignment

## Legend

| Overlap Type | Meaning |
|-------------|---------|
| **OVERLAP** | Both systems have equivalent skill — align terminology and cross-reference |
| **AMS→OR** | Skill exists only in AMS — transfer to OR AG-003 |
| **OR→AMS** | Skill exists only in OR — transfer to AMS |
| **EXCLUSIVE** | Skill is system-specific — no transfer needed |

## Full Matrix

### Milestone 1 / Gate G1: Foundation

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 1 | `build-equipment-hierarchy` | Reliability | `create-asset-register` | OVERLAP | Align: AMS focuses on 6-level ISO 14224 decomposition; OR creates full asset register with FL hierarchy. Cross-reference terminology. |
| 2 | `assess-criticality` | Reliability | `analyze-equipment-criticality` | OVERLAP | Align: Both use AA/A/B/C + R8/GFSN. AMS has deterministic engine; OR has richer output spec (.xlsx). Unify scale conversion (I-IV ↔ AA/A/B/C). |
| 3 | — | — | `assess-am-maturity` | OR→AMS | Transfer to AMS `skills/02-maintenance-strategy-development/`. Assigns to Orchestrator (strategic assessment). |
| 4 | `resolve-equipment` | Spare Parts, Reliability | — | EXCLUSIVE | AMS-only. Free-text to tag resolution for BOM lookup. Not applicable to OR workflow. |
| 4b | `identify-work-request` | Orchestrator, Planning (ref) | — | EXCLUSIVE | AMS-only. Field-to-planner data structuring (voice/photo/text → StructuredWorkRequest). No OR equivalent. |

### Milestone 2 / Gate G2: Failure Analysis & Strategy

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 5 | `perform-fmeca` | Reliability | `analyze-failure-patterns` | OVERLAP | Align: AMS has 4-stage FMECA engine; OR has broader failure pattern analysis. Both validate against 72-combo FM Table. Align RPN calculation. |
| 6 | `validate-failure-modes` | Reliability | — | AMS→OR | Transfer to OR `skills/asset-management-skills/`. Critical for FM Table compliance. |
| 7 | ~~`run-rcm-decision-tree`~~ | ~~Reliability~~ | — | ~~AMS→OR~~ | DEPRECATED (2026-03-11): Merged into `perform-fmeca` Stage 4 (AMS) and `create-maintenance-strategy` Step 9 (OR). |
| 8 | `assess-risk-based-inspection` | Reliability | — | EXCLUSIVE | AMS-only. Static equipment RBI. Not in OR AG-003 scope. |
| 9 | — | — | `create-maintenance-strategy` | EXCLUSIVE | OR-only. Broader strategy creation combining RCM/FMECA/CBM. AMS distributes this across multiple skills. |
| 10 | — | — | `develop-maintenance-strategy` | EXCLUSIVE | OR-only. SAMP-focused alternative strategy. |
| 11 | — | — | `analyze-reliability` | OR→AMS | Transfer to AMS as `model-ram-simulation` (Weibull, MTBF/MTTR, RAM). Assigns to Reliability. |
| 12 | — | — | `model-ram-simulation` | OR→AMS | Transfer to AMS `skills/03-reliability-engineering/`. Reliability Availability Modeling. |
| 13 | — | — | `create-maintenance-manual` | EXCLUSIVE | OR-only. Maintenance task documentation. AMS has `prepare-work-packages` Phase 2 (equivalent scope). |
| 14 | — | — | `create-work-management-manual` | EXCLUSIVE | OR-only. 6-step work management cycle. No AMS equivalent. |
| 15 | — | — | `optimize-pm-program` | EXCLUSIVE | OR-only. PM interval optimization. AMS has engine (`scheduling_engine.py`) but no skill wrapper. |
| 16 | — | — | `benchmark-maintenance-kpis` | OR→AMS | Transfer to AMS `skills/06-orchestation/`. SMRP benchmarking framework. |

### Milestone 3 / Gates G2-G3: Planning & Implementation

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 17 | `prepare-work-packages` | Planning | — | EXCLUSIVE | AMS-only. 7-element WP assembly + integrated WI generation (formerly assemble-work-packages + generate-work-instructions). |
| ~~18~~ | ~~`generate-work-instructions`~~ | ~~Planning~~ | — | ~~EXCLUSIVE~~ | DEPRECATED (2026-03-11): Merged into `prepare-work-packages` Phase 2. |
| 19 | `group-backlog` | Planning | — | EXCLUSIVE | AMS-only. Backlog stratification. |
| 20 | `calculate-priority` | Planning | — | EXCLUSIVE | AMS-only. P1-P5 priority scoring. |
| 21 | `schedule-weekly-program` | Planning | — | EXCLUSIVE | AMS-only. Weekly program creation. |
| 22 | `orchestrate-shutdown` | Planning | `create-shutdown-plan` | OVERLAP | Both handle turnaround planning. AMS is tactical (M3); OR is strategic (G4). Cross-reference. |
| 23 | `export-to-sap` | Planning | `design-sap-pm-blueprint` + `load-sap-master-data` | OVERLAP | Complementary: AMS generates upload files; OR designs blueprint + loads master data. Share SAP field validations. |
| 24 | `suggest-materials` | Spare Parts | `create-spare-parts-strategy` | OVERLAP | Complementary: AMS is tactical (task-level material assignment, confidence scoring); OR is strategic (VED-ABC classification, initial provisioning). Share confidence scoring (0.95/0.70/0.40). |
| 25 | `optimize-spare-parts-inventory` | Spare Parts | `optimize-mro-inventory` | OVERLAP | Both do inventory optimization. AMS uses VED/FSN/ABC engine; OR adds MRO and long-lead tracking. |
| 26 | — | — | `generate-initial-spares-list` | EXCLUSIVE | OR-only. Initial stocking for new facilities. |
| 27 | — | — | `develop-samp` | OR→AMS | Transfer to AMS `skills/02-maintenance-strategy-development/`. ISO 55001 Strategic AM Plan. |

### Reliability Analysis (Milestone 3 / Gate G2)

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 28 | `fit-weibull-distribution` | Reliability | `analyze-reliability` (includes Weibull) | OVERLAP | AMS has dedicated Weibull engine; OR bundles into broader reliability analysis. Cross-reference. |
| 29 | `analyze-pareto` | Reliability | — | AMS→OR | Transfer to OR `skills/asset-management-skills/`. Bad actor identification. |
| 30 | `analyze-jackknife` | Reliability | — | AMS→OR | Transfer to OR `skills/asset-management-skills/`. MTBF vs MTTR zone classification. |
| 31 | `perform-rca` | Reliability | — | EXCLUSIVE | AMS-only. 5W+2H / Ishikawa RCA. Not in OR AG-003 scope (would be HSE). |

### Cost Analysis

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 32 | `calculate-life-cycle-cost` | Planning | — | EXCLUSIVE | AMS-only. LCC comparison. OR uses Finance Agent. |
| 33 | `optimize-cost-risk` | Planning | — | EXCLUSIVE | AMS-only. Cost-risk PM optimization. |

### Orchestration & Reporting

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 34 | `calculate-kpis` | Orchestrator, Reliability | `benchmark-maintenance-kpis` | OVERLAP | AMS calculates KPIs from data; OR benchmarks against industry. Complementary. |
| 35 | `calculate-health-score` | Orchestrator | — | AMS→OR | Transfer to OR `skills/asset-management-skills/`. Composite asset health index. |
| 36 | `detect-variance` | Orchestrator | — | EXCLUSIVE | AMS-only. Cross-plant variance detection. |
| 37 | `generate-reports` | Orchestrator | — | EXCLUSIVE | AMS-only. Report generation. OR uses Orchestrator. |
| 38 | `conduct-management-review` | Orchestrator | — | EXCLUSIVE | AMS-only. ISO 55002 §9.3. |
| 39 | `analyze-cross-module` | Orchestrator | — | EXCLUSIVE | AMS-only. Cross-module correlation. |
| 40 | `orchestrate-workflow` | Orchestrator | — | EXCLUSIVE | AMS-only. 4-milestone workflow. |
| 41 | `manage-capa` | Planning, Reliability | — | EXCLUSIVE | AMS-only. PDCA tracking. |
| 42 | `manage-change` | Orchestrator | — | EXCLUSIVE | AMS-only. MOC management. |

### OR-Only Skills (Gate G4)

| # | AMS Skill | AMS Agent | OR AG-003 Skill | Type | Action |
|---|-----------|-----------|----------------|------|--------|
| 43 | — | — | `plan-turnaround` | EXCLUSIVE | OR-only. First major shutdown. |
| 44 | — | — | `track-incident-learnings` | EXCLUSIVE | OR-only. Post-incident analysis. |
| 45 | — | — | `manage-equipment-preservation` | EXCLUSIVE | OR-only. Construction-phase preservation. |

## Summary of Actions

### Transfers AMS → OR (5 skills, 1 subsequently deprecated)
1. `validate-failure-modes` → OR `skills/asset-management-skills/validate-failure-modes/CLAUDE.md`
2. ~~`run-rcm-decision-tree`~~ → Transferred then DEPRECATED (2026-03-11): merged into `create-maintenance-strategy` Step 9 (OR) and `perform-fmeca` Stage 4 (AMS)
3. `analyze-jackknife` → OR `skills/asset-management-skills/analyze-jackknife/CLAUDE.md`
4. `analyze-pareto` → OR `skills/asset-management-skills/analyze-pareto/CLAUDE.md`
5. `calculate-health-score` → OR `skills/asset-management-skills/calculate-health-score/CLAUDE.md`

### Transfers OR → AMS (4 skills)
1. `assess-am-maturity` → AMS `skills/02-maintenance-strategy-development/assess-am-maturity/CLAUDE.md`
2. `model-ram-simulation` → AMS `skills/03-reliability-engineering-and-defect-elimination/model-ram-simulation/CLAUDE.md`
3. `benchmark-maintenance-kpis` → AMS `skills/06-orchestation/benchmark-maintenance-kpis/CLAUDE.md`
4. `develop-samp` → AMS `skills/02-maintenance-strategy-development/develop-samp/CLAUDE.md`

### Alignments (5 overlapping pairs)
1. `assess-criticality` ↔ `analyze-equipment-criticality` — Scale conversion documented
2. `build-equipment-hierarchy` ↔ `create-asset-register` — Terminology unified
3. `perform-fmeca` ↔ `analyze-failure-patterns` — RPN calculation aligned
4. `export-to-sap` ↔ `design-sap-pm-blueprint` + `load-sap-master-data` — Complementarity documented
5. `suggest-materials` ↔ `create-spare-parts-strategy` — Confidence scoring shared (0.95/0.70/0.40)

## Criticality Scale Conversion

| AMS (R8) | OR (AA/A/B/C) | Score Range | Strategy Depth |
|----------|---------------|-------------|----------------|
| Class IV (Critical) | AA | 17-25 | Full RCM |
| Class III (High) | A | 10-16 | Full RCM |
| Class II (Medium) | B | 5-9 | Simplified FMECA |
| Class I (Low) | C | 1-4 | Run-to-failure |

Both systems use the same 5×5 risk matrix (max_consequence × probability). The mapping is direct:
- R8 `overall_score` = OR `weighted_score` (same formula)
- R8 `RiskClass` enum = OR tier assignment by percentile (AA ≥80th, A ≥60th, B ≥30th, C <30th)

Note: OR adds override rules (C_Safety=5 → auto AA, no redundancy + C_Production≥4 → min A) that AMS does not yet implement. These overrides are recommended for AMS adoption.
