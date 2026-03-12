# Skill Classification — AMS

**Last Updated:** 2026-03-10
**Source of Truth:** `agents/*/skills.yaml`

Classifies each skill as **capability-uplift** (teaches Claude something it doesn't know)
or **encoded-preference** (encodes a specific workflow Claude could do differently).

This classification determines the eval strategy:
- **Capability uplift** -> A/B benchmarking (with vs without skill) + regression detection
- **Encoded preference** -> Workflow fidelity testing (does it follow the steps in order?)

## Classification Table

| Skill | Type | Primary Agent | Milestone | Mandatory | Justification |
|-------|------|---------------|:---------:|:---------:|---------------|
| build-equipment-hierarchy | capability-uplift | Reliability | 1 | Yes | ISO 14224 taxonomy, OCP-specific 6-level hierarchy, tag naming conventions |
| assess-criticality | capability-uplift | Reliability | 1 | Yes | R8 Full Matrix (11 categories), GFSN method, OCP-specific risk bands |
| perform-fmeca | capability-uplift | Reliability | 2 | Yes | SAE JA-1011/JA-1012 FMECA methodology, 5-stage pipeline, RPN scoring |
| validate-failure-modes | capability-uplift | Reliability | 2 | Yes | 72-combo VSC Failure Modes Table validation, naming conventions |
| ~~run-rcm-decision-tree~~ | ~~capability-uplift~~ | ~~Reliability~~ | ~~2~~ | ~~Yes~~ | ~~DEPRECATED (2026-03-11): merged into perform-fmeca Stage 4~~ |
| assess-risk-based-inspection | capability-uplift | Reliability | 2 | No | API 580/581 RBI methodology, corrosion/damage mechanisms |
| fit-weibull-distribution | capability-uplift | Reliability | 3 | No | Weibull parameter estimation (beta, eta, gamma), survival curves |
| analyze-pareto | capability-uplift | Reliability | 3 | No | Bad actor identification, cumulative contribution analysis |
| analyze-jackknife | capability-uplift | Reliability | 3 | No | MTBF vs MTTR 4-zone Jack-Knife classification |
| perform-rca | capability-uplift | Reliability | 3 | No | Apollo/5-Why/Ishikawa root cause analysis methodology |
| model-ram-simulation | capability-uplift | Reliability | 3 | No | RAM Monte Carlo simulation, system availability modeling |
| prepare-work-packages | capability-uplift | Planning | 3 | Yes | Work package assembly + integrated WI generation (formerly assemble-work-packages + generate-work-instructions) |
| ~~generate-work-instructions~~ | ~~capability-uplift~~ | ~~Planning~~ | ~~3~~ | ~~Yes~~ | ~~DEPRECATED (2026-03-11): merged into prepare-work-packages Phase 2~~ |
| calculate-priority | capability-uplift | Planning | 3 | Yes | Priority scoring formula, urgency/impact matrix |
| group-backlog | capability-uplift | Planning | 3 | Yes | Backlog clustering by equipment, strategy type, schedule windows |
| export-to-sap | capability-uplift | Planning | 4 | Yes | SAP PM field mapping, TPLNR/EQUNR constraints, FLOC lifecycle |
| schedule-weekly-program | capability-uplift | Planning | 3 | No | Weekly schedule optimization, resource leveling constraints |
| orchestrate-shutdown | capability-uplift | Planning | 3 | No | Turnaround planning, critical path, resource coordination |
| calculate-planning-kpis | capability-uplift | Planning | 3 | No | Planning KPIs (schedule compliance, backlog age, etc.) |
| calculate-life-cycle-cost | capability-uplift | Planning | 3 | No | NPV, CAPEX/OPEX, total cost of ownership modeling |
| optimize-cost-risk | capability-uplift | Planning | 3 | No | Cost-risk optimization, PM interval analysis |
| suggest-materials | capability-uplift | Spare Parts | 3 | Yes | Material suggestion from failure mode + BOM lookup |
| optimize-spare-parts-inventory | capability-uplift | Spare Parts | 3 | No | VED/FSN/ABC classification, stocking optimization |
| assess-am-maturity | capability-uplift | Orchestrator | 1 | No | AM maturity model scoring (ISO 55001 dimensions) |
| develop-samp | capability-uplift | Orchestrator | all | No | Strategic Asset Management Plan development methodology |
| identify-work-request | capability-uplift | Orchestrator | 1 | No | Field-to-planner data structuring (voice/photo/text → StructuredWorkRequest) |
| calculate-health-score | capability-uplift | Orchestrator | all | No | 5-dimension weighted health index formula, OCP thresholds |
| orchestrate-workflow | encoded-preference | Orchestrator | all | Yes | 4-milestone workflow with specific gate sequence and delegation rules |
| validate-quality | encoded-preference | Orchestrator | all | Yes | Quality gate checklist with specific pass/fail criteria per milestone |
| calculate-kpis | encoded-preference | Orchestrator | all | No | Specific KPI formulas and reporting format preferences |
| detect-variance | encoded-preference | Orchestrator | all | No | Variance detection workflow with specific thresholds and escalation |
| generate-reports | encoded-preference | Orchestrator | all | No | Report generation with specific template and section ordering |
| conduct-management-review | encoded-preference | Orchestrator | all | No | Management review workflow with specific agenda and decision gates |
| benchmark-maintenance-kpis | encoded-preference | Orchestrator | all | No | Benchmarking workflow with specific comparison methodology |
| import-data | encoded-preference | Orchestrator | all | No | Data import workflow with specific validation and mapping steps |
| export-data | encoded-preference | Orchestrator | all | No | Data export format preferences and file naming conventions |
| manage-notifications | encoded-preference | Orchestrator | all | No | Notification routing and escalation workflow |
| manage-change | encoded-preference | Orchestrator | all | No | MOC workflow with specific approval gates |
| manage-capa | encoded-preference | Planning | 3 | No | CAPA lifecycle workflow (identify/investigate/implement/verify) |
| resolve-equipment | encoded-preference | Spare Parts | 3 | Yes | Equipment tag resolution workflow with specific matching rules |
| analyze-cross-module | encoded-preference | Orchestrator | all | No | Cross-module correlation analysis workflow |

## Summary

| Type | Count | % |
|------|:-----:|:-:|
| Capability Uplift | 25 | 64% |
| Encoded Preference | 14 | 36% |

### Eval Strategy by Type

**Capability Uplift (25 skills):**
- Primary eval: A/B benchmark (with-skill vs without-skill)
- Regression detection: Compare against baseline when model upgrades
- Key metric: pass_rate delta between conditions

**Encoded Preference (14 skills):**
- Primary eval: Workflow fidelity (are steps executed in correct order?)
- Trigger reliability: Does the skill fire when expected?
- Key metric: step completion rate, ordering accuracy

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-05 | Initial classification of 40 skills |
| 2026-03-11 | Skills consolidation: deprecated run-rcm-decision-tree (→ perform-fmeca), deprecated generate-work-instructions (→ prepare-work-packages), renamed assemble-work-packages → prepare-work-packages. 41→39 active skills (25 capability-uplift + 14 encoded-preference). |
| 2026-03-10 | Added Milestone + Mandatory columns. Fixed agent assignments: assess-am-maturity, develop-samp → Orchestrator (was Reliability). Fixed calculate-life-cycle-cost, optimize-cost-risk → Planning (was Cost). Replaced "Multi-agent" with specific primary agent per skills.yaml. Added identify-work-request (41 skills). |
