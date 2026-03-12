# Skill Master Registry — OCP Maintenance AI

**Last Updated:** 2026-03-11
**Total Unique Skills:** 42 (+ 2 deprecated)
**Source of Truth:** `agents/*/skills.yaml` files

---

## Skill Inventory

| # | Skill | Category | Primary Agent | Cross-Agent | Milestone | Mandatory | Type | Load Level |
|---|-------|----------|---------------|-------------|:---------:|:---------:|------|:----------:|
| 1 | `build-equipment-hierarchy` | 02-maintenance-strategy | Reliability | | 1 | Yes | capability-uplift | 2 |
| 2 | `assess-criticality` | 02-maintenance-strategy | Reliability | | 1 | Yes | capability-uplift | 2 |
| 3 | `perform-fmeca` | 02-maintenance-strategy | Reliability | | 2 | Yes | capability-uplift | 2 |
| 4 | `validate-failure-modes` | 02-maintenance-strategy | Reliability | | 2 | Yes | capability-uplift | 2 |
| ~~5~~ | ~~`run-rcm-decision-tree`~~ | ~~02-maintenance-strategy~~ | ~~Reliability~~ | | ~~2~~ | ~~Yes~~ | ~~capability-uplift~~ | ~~2~~ |
| 6 | `assess-risk-based-inspection` | 02-maintenance-strategy | Reliability | | 2 | No | capability-uplift | 3 |
| 7 | `assess-am-maturity` | 02-maintenance-strategy | Orchestrator | | 1 | No | capability-uplift | 3 |
| 8 | `develop-samp` | 02-maintenance-strategy | Orchestrator | | all | No | capability-uplift | 3 |
| 9 | `prepare-work-packages` | 02-maintenance-strategy | Planning | | 3 | Yes | capability-uplift | 2 |
| ~~10~~ | ~~`generate-work-instructions`~~ | ~~02-maintenance-strategy~~ | ~~Planning~~ | | ~~3~~ | ~~Yes~~ | ~~capability-uplift~~ | ~~2~~ |
| 11 | `identify-work-request` | 01-work-identification | Orchestrator | Planning (ref) | 1 | No | capability-uplift | 2 |
| 12 | `calculate-planning-kpis` | 02-work-planning | Planning | | 3 | No | capability-uplift | 3 |
| 13 | `calculate-priority` | 02-work-planning | Planning | | 3 | Yes | capability-uplift | 2 |
| 14 | `export-to-sap` | 02-work-planning | Planning | | 4 | Yes | capability-uplift | 2 |
| 15 | `group-backlog` | 02-work-planning | Planning | | 3 | Yes | capability-uplift | 2 |
| 16 | `optimize-spare-parts-inventory` | 02-work-planning | Spare Parts | | 3 | No | capability-uplift | 3 |
| 17 | `orchestrate-shutdown` | 02-work-planning | Planning | | 3 | No | capability-uplift | 3 |
| 18 | `schedule-weekly-program` | 02-work-planning | Planning | | 3 | No | capability-uplift | 3 |
| 19 | `suggest-materials` | 02-work-planning | Spare Parts | | 3 | Yes | capability-uplift | 3 |
| 20 | `analyze-jackknife` | 03-reliability | Reliability | | 3 | No | capability-uplift | 3 |
| 21 | `analyze-pareto` | 03-reliability | Reliability | | 3 | No | capability-uplift | 3 |
| 22 | `fit-weibull-distribution` | 03-reliability | Reliability | | 3 | No | capability-uplift | 3 |
| 23 | `perform-rca` | 03-reliability | Reliability | | 3 | No | capability-uplift | 3 |
| 24 | `model-ram-simulation` | 03-reliability | Reliability | | 3 | No | capability-uplift | 3 |
| 25 | `calculate-life-cycle-cost` | 04-cost-analysis | Planning | | 3 | No | capability-uplift | 3 |
| 26 | `optimize-cost-risk` | 04-cost-analysis | Planning | | 3 | No | capability-uplift | 3 |
| 43 | `calculate-roi` | 04-cost-analysis | Orchestrator | Planning (ref) | all | No | capability-uplift | 3 |
| 44 | `track-budget` | 04-cost-analysis | Planning | | 3 | No | capability-uplift | 3 |
| 27 | `export-data` | 05-general | Orchestrator | | all | No | encoded-preference | 3 |
| 28 | `import-data` | 05-general | Orchestrator | Reliability, Planning | all | No | encoded-preference | 3 |
| 29 | `manage-change` | 05-general | Orchestrator | | all | No | encoded-preference | 3 |
| 30 | `manage-notifications` | 05-general | Orchestrator | | all | No | encoded-preference | 3 |
| 31 | `validate-quality` | 05-general | Orchestrator | Reliability, Planning | all | Yes | encoded-preference | 2 |
| 32 | `calculate-health-score` | 06-orchestration | Orchestrator | | all | No | capability-uplift | 3 |
| 33 | `calculate-kpis` | 06-orchestration | Orchestrator | Reliability | all | No | encoded-preference | 3 |
| 34 | `conduct-management-review` | 06-orchestration | Orchestrator | | all | No | encoded-preference | 3 |
| 35 | `detect-variance` | 06-orchestration | Orchestrator | | all | No | encoded-preference | 3 |
| 36 | `generate-reports` | 06-orchestration | Orchestrator | | all | No | encoded-preference | 3 |
| 37 | `benchmark-maintenance-kpis` | 06-orchestration | Orchestrator | | all | No | encoded-preference | 3 |
| 38 | `analyze-cross-module` | standalone | Orchestrator | | all | No | encoded-preference | 3 |
| 39 | `manage-capa` | standalone | Planning | Reliability | 3 | No | encoded-preference | 3 |
| 40 | `orchestrate-workflow` | standalone | Orchestrator | | all | Yes | encoded-preference | 2 |
| 41 | `resolve-equipment` | standalone | Spare Parts | Reliability | 3 | Yes | encoded-preference | 3 |
| 42 | `guide-troubleshooting` | 02-maintenance-strategy | Reliability | | all | No | capability-uplift | 2 |

---

## Summary by Agent

| Agent | ID | Model | Skills (primary) | Skills (cross-agent) | Total | Mandatory | Milestones |
|-------|----|-------|:----------------:|:--------------------:|:-----:|:---------:|:----------:|
| Orchestrator | AG-001 | Sonnet 4.5 | 17 | — | 17 | 2 | all |
| Reliability | AG-002 | Opus 4.6 | 11 | +5 cross | 16 | 4 | 1, 2, 3 |
| Planning | AG-003 | Sonnet 4.5 | 11 | +3 cross | 14 | 4 | 3, 4 |
| Spare Parts | AG-004 | Haiku 4.5 | 3 | — | 3 | 2 | 3 |
| **Total** | | | **42 unique** | **8 shared** | **50** | **12** | |

## Summary by Type

| Type | Count | % | Eval Strategy |
|------|:-----:|:-:|---------------|
| Capability Uplift | 28 | 67% | A/B benchmarking + regression detection |
| Encoded Preference | 14 | 33% | Workflow fidelity testing |

## Cross-Agent Skills (7 shared assignments)

| Skill | Primary Owner | Secondary Agent(s) | Rationale |
|-------|---------------|-------------------|-----------|
| `validate-quality` | Orchestrator (mandatory) | Reliability, Planning (optional) | Self-validation before returning to Orchestrator |
| `import-data` | Orchestrator | Reliability, Planning (optional) | Direct import of failure history / backlog |
| `resolve-equipment` | Spare Parts (mandatory) | Reliability (optional, M1) | Resolve text descriptions during hierarchy building |
| `calculate-kpis` | Orchestrator | Reliability (optional, M3) | MTBF/MTTR as input for Weibull and Pareto |
| `manage-capa` | Planning | Reliability (optional, M3) | Create CAPAs from RCA output |
| `identify-work-request` | Orchestrator | Planning (reference, load_level 1) | Planner understands incoming structured data |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-23 | Initial SKILL_REGISTRY.md with 36 skills |
| 2026-02-24 | Cross-agent assignments implemented (5 shared skills) |
| 2026-03-05 | Phase 5: Added assess-am-maturity, benchmark-maintenance-kpis, develop-samp, model-ram-simulation (40 skills) |
| 2026-03-11 | GAP-W04: Added `calculate-roi` (Orchestrator, 04-cost-analysis) and `track-budget` (Planning, 04-cost-analysis). 40→42 active skills. |
| 2026-03-11 | Skills consolidation: merged run-rcm-decision-tree into perform-fmeca (Stage 4), merged generate-work-instructions into prepare-work-packages (Phase 2), renamed assemble-work-packages → prepare-work-packages. 41→39 active skills. Updated agent counts (Reliability 16→15, Planning 13→12). |
| 2026-03-10 | Consolidated SKILL_MASTER_REGISTRY from SKILLS_COVERAGE_REPORT + AGENT_REGISTRY + SKILL_CLASSIFICATION. Added identify-work-request (41 skills). Fixed agent assignments (assess-am-maturity, develop-samp → Orchestrator). |
