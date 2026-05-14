# Skill Registry — OCP Maintenance AI

**Last Updated:** 2026-02-23
**Total Skills:** 36 (16 reliability + 12 planning + 2 spare parts + 2 orchestration + 3 shared + 1 cross-cutting)

---

## Reliability Engineer Skills (16)

| # | Skill Name | Description | Agent |
|---|-----------|-------------|-------|
| 1 | analyze-jackknife | Jack-knife diagram: classify equipment by MTBF vs MTTR into 4 zones (acute, chronic, complex, controlled) | Reliability |
| 2 | analyze-pareto | Pareto analysis: identify bad actors (80/20 rule) by failures, costs, downtime | Reliability |
| 3 | assess-criticality | Criticality assessment using R8 Full Matrix (11 categories, 4 classes) or GFSN method (6 factors, 3 bands) | Reliability |
| 4 | assess-risk-based-inspection | Risk-Based Inspection (RBI) for static equipment: damage mechanisms, PoF × CoF scoring | Reliability |
| 5 | build-equipment-hierarchy | Build/validate SAP technical hierarchy (6 levels: plant → component) with naming convention XX-YYY-ZZ-NNN | Reliability |
| 6 | calculate-health-score | Asset health index: weighted condition scoring across measurement categories | Reliability |
| 7 | calculate-kpis | Calculate reliability KPIs: OEE, availability, MTBF, MTTR, maintenance intensity (IG), ICA | Reliability |
| 8 | calculate-life-cycle-cost | Life-Cycle Cost (LCC) analysis: acquisition + operation + maintenance + disposal NPV comparison | Reliability |
| 9 | calculate-priority | Work order priority scoring using equipment criticality × consequence matrix | Reliability |
| 10 | detect-variance | Statistical variance detection in time-series data: trend, shift, outlier identification | Reliability |
| 11 | fit-weibull-distribution | Weibull analysis: estimate β (shape) and η (scale), determine failure pattern, calculate optimal replacement interval | Reliability |
| 12 | optimize-cost-risk | Optimum Cost-Risk (OCR): balance prevention cost vs failure risk to find optimal maintenance frequency | Reliability |
| 13 | perform-fmeca | FMECA: 4-stage analysis (functions → failures → effects/RPN → RCM strategies) per SAE JA-1011/JA-1012 | Reliability |
| 14 | perform-rca | Root Cause Analysis: 5W+2H (simple) or 3-level RCA (physical → human → latent) with 5P evidence framework | Reliability |
| 15 | run-rcm-decision-tree | RCM decision tree: consequence classification → task selection (CBM, TBM, FF, redesign, RTF) | Reliability |
| 16 | validate-failure-modes | Validate failure mode naming: ISO 14224 compliance, 72 FM combinations, R8 taxonomy alignment | Reliability |

## Planning Specialist Skills (12)

| # | Skill Name | Description | Agent |
|---|-----------|-------------|-------|
| 17 | assemble-work-packages | Assemble work packages: WO + permits + LOTO + checklists + procedures + ATS/ART | Planning |
| 18 | calculate-planning-kpis | Calculate 11 planning KPIs: WO completion, backlog weeks, reactive %, schedule adherence | Planning |
| 19 | export-data | Export structured data to CSV/JSON/Excel for external consumption | Planning |
| 20 | export-to-sap | Export to SAP PM: generate IW21/IW38 upload files, map R8 fields to SAP PM structures | Planning |
| 21 | generate-reports | Generate formatted reports: maintenance summaries, KPI dashboards, management reviews | Planning |
| 22 | generate-work-instructions | Generate work instructions from RCM outputs using REF-07 templates | Planning |
| 23 | group-backlog | Group and prioritize maintenance backlog: capacity leveling, resource optimization | Planning |
| 24 | import-data | Import data from CSV/JSON/Excel: validate schema, map columns, detect duplicates | Planning |
| 25 | manage-notifications | Manage SAP maintenance notifications: lifecycle MEAB → METR → ORAS → MECE | Planning |
| 26 | orchestrate-shutdown | Plan and orchestrate major shutdowns: critical path, resource leveling, contractor coordination | Planning |
| 27 | resolve-equipment | Resolve equipment references: fuzzy match tags, validate against hierarchy, suggest alternatives | Planning |
| 28 | schedule-weekly-program | Weekly scheduling cycle: pre-program → scheduling meeting → final program → execution → closure | Planning |

## Spare Parts Specialist Skills (2)

| # | Skill Name | Description | Agent |
|---|-----------|-------------|-------|
| 29 | optimize-spare-parts-inventory | Optimize spare parts: criticality-based stocking, EOQ calculation, ABC/XYZ classification | Spare Parts |
| 30 | suggest-materials | Suggest materials/spare parts: BOM lookup, cross-reference, T-16 rule enforcement | Spare Parts |

## Orchestration Skills (2)

| # | Skill Name | Description | Agent |
|---|-----------|-------------|-------|
| 31 | conduct-management-review | Management review: ISO 55002 compliance, strategic recommendations, gap analysis | Orchestrator |
| 32 | orchestrate-workflow | Orchestrate 4-milestone workflow: coordinate agents, enforce quality gates, manage approvals | Orchestrator |

## Shared Skills (3) — Available to All Agents

| # | Skill Name | Description | Agent |
|---|-----------|-------------|-------|
| 33 | manage-capa | Corrective/Preventive Actions: track, implement, verify effectiveness | Shared |
| 34 | manage-change | Management of Change (MoC): formal modification process, impact assessment, approval | Shared |
| 35 | validate-quality | Quality validation: REF-04 rules, MSO checklist, QA flowchart compliance | Shared |

---

## Folder Structure per Skill

```
skills/{skill-name}/
  SKILL.md          ← Main skill document (YAML front matter + body)
  references/       ← Skill-specific reference documents
  scripts/          ← Validation scripts (validate.py)
  evals/            ← Trigger and functional evaluation files
    trigger-eval.json   (10 should + 10 should-not trigger cases)
    evals.json          (3-5 functional test cases)
```

## Shared Knowledge Base

```
skills/knowledge-base/
  standards/        ← ISO 55002, PAS 55
  methodologies/    ← RCM, R8 tactics, WI templates
  data-models/      ← R8 entities, FM combinations, component/equipment libraries
  integration/      ← SAP PM, R8 integration
  quality/          ← Validation rules, MSO checklist
  client/           ← OCP context
  architecture/     ← Software vision, user guide
  gfsn/             ← GFSN procedures (maintenance, planning, DE, criticality)
  competitive/      ← GECAMIN cross-reference + 58 session summaries
  strategic/        ← ISO compliance, gap analysis, recommendations
```

---

## Agent → Skills Quick Reference

| Agent | Model | # Skills | Skill Names |
|-------|-------|----------|-------------|
| Reliability | claude-opus-4-6 | 16 + 3 shared | analyze-jackknife, analyze-pareto, assess-criticality, assess-risk-based-inspection, build-equipment-hierarchy, calculate-health-score, calculate-kpis, calculate-life-cycle-cost, calculate-priority, detect-variance, fit-weibull-distribution, optimize-cost-risk, perform-fmeca, perform-rca, run-rcm-decision-tree, validate-failure-modes |
| Planning | claude-sonnet-4-5 | 12 + 3 shared | assemble-work-packages, calculate-planning-kpis, export-data, export-to-sap, generate-reports, generate-work-instructions, group-backlog, import-data, manage-notifications, orchestrate-shutdown, resolve-equipment, schedule-weekly-program |
| Spare Parts | claude-haiku-4-5 | 2 + 3 shared | optimize-spare-parts-inventory, suggest-materials |
| Orchestrator | claude-sonnet-4-5 | 2 + 3 shared | conduct-management-review, orchestrate-workflow |
