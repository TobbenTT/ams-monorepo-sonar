# Knowledge Base — OCP Maintenance AI Skills System

**Last Updated:** 2026-02-23
**Purpose:** Shared reference documents used by 3+ skills. Each skill references specific sections via relative paths (`../../knowledge-base/...`).

## Table of Contents

| # | Subdirectory | Documents | Primary Users |
|---|-------------|-----------|---------------|
| 1 | standards/ | ISO 55002, PAS 55 | Orchestrator, Reliability |
| 2 | methodologies/ | REF-01 RCM, R8 tactics, WI templates, RCM methodology | Reliability, Planning |
| 3 | data-models/ | REF-02 R8 entities, 72 FM combos, component/equipment libraries | All agents |
| 4 | integration/ | REF-03 SAP PM, R8 integration, SAP upload templates | Planning, Spare Parts |
| 5 | quality/ | REF-04 validation rules, MSO checklist, QA flowchart | Orchestrator |
| 6 | client/ | REF-05 OCP context | Orchestrator |
| 7 | architecture/ | REF-06 vision, REF-08 user guide, REF-11 neuro-arquitectura | Orchestrator |
| 8 | gfsn/ | REF-13 manual, REF-14 planning, REF-15 DE, REF-16 criticality + full procedures | Reliability, Planning |
| 9 | competitive/ | REF-10 GECAMIN cross-ref + GECAMIN session summaries | Orchestrator |
| 10 | strategic/ | REF-09 ISO compliance, REF-12 recommendations, REF-17 gap analysis | Orchestrator |

---

## Document Index

### standards/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| iso-55002-2018-standard.md | ~500 | ISO_55002_2018(es).pdf | orchestrate-workflow, validate-quality, conduct-management-review |
| pas-55-2008-standard.md | ~300 | asset-managmenet-pass55-2008.pdf | orchestrate-workflow, conduct-management-review |

### methodologies/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-01-maintenance-strategy-methodology.md | ~600 | architecture/ref-01 | assess-criticality, run-rcm-decision-tree, perform-fmeca, validate-failure-modes, calculate-priority |
| ref-07-work-instruction-templates.md | ~250 | architecture/ref-07 | generate-work-instructions, assemble-work-packages |
| rcm-methodology-full.md | ~400 | rcm-reliability-centred-maintenance.docx | run-rcm-decision-tree, perform-fmeca |
| r8-tactics-development-process.md | ~300 | R8-asset-maintenance-tactics.docx | run-rcm-decision-tree, perform-fmeca |
| r8-deployment-implementation.md | ~200 | R8 Deployment.pdf | orchestrate-workflow |
| r8-deployment-flowcharts.md | ~150 | R8-software-deployment-flow-charts.pdf | orchestrate-workflow |
| r8-maintenance-optimization.md | ~400 | R8-Maintenance-plans-Optimization.pdf | all reliability skills |
| maintenance-tactics-guideline.md | ~300 | maintenance-strategy-tactics-Guideline.pdf | run-rcm-decision-tree, assess-criticality |
| maintenance-tactics-process-map.md | ~100 | Process-Map.pdf | orchestrate-workflow |
| maintenance-readiness-assessment.md | ~200 | Maintenance Readiness BP.pdf | orchestrate-workflow, conduct-management-review |
| mso-workshop-information.md | ~100 | MSO informacion.docx | orchestrate-workflow |
| work-instruction-examples-consolidated.md | ~500 | 19 WI template examples | generate-work-instructions |
| maintenance-strategy-examples.md | ~200 | 4 strategy example XLSX | run-rcm-decision-tree, perform-fmeca |

### data-models/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-02-r8-data-model-entities.md | ~350 | architecture/ref-02 | build-equipment-hierarchy, suggest-materials, resolve-equipment, import-data, export-data |
| failure-modes/MASTER.md | ~1,225 | 72 individual FM files (SRC-09) | validate-failure-modes, perform-fmeca, run-rcm-decision-tree |
| component-library.md | ~300 | Libraries/component_library.json | suggest-materials, build-equipment-hierarchy |
| equipment-library.md | ~400 | Libraries/equipment_library.json | resolve-equipment, build-equipment-hierarchy |
| spare-parts-criticality-template.md | ~150 | GFSN spare parts XLSX | optimize-spare-parts-inventory |

### integration/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-03-sap-pm-integration.md | ~300 | architecture/ref-03 | export-to-sap, manage-notifications |
| r8-integration-master-plan.md | ~200 | Rylson8 Integration.docx | orchestrate-workflow, export-to-sap |
| sap-r8-setup-guide.md | ~150 | Setting-up-Mtce-Plans.pdf | export-to-sap |
| sap-upload-templates-reference.md | ~200 | 3 SAP upload XLSX | export-to-sap |

### quality/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-04-quality-validation-rules.md | ~350 | architecture/ref-04 | validate-quality |
| r8-quality-analysis-guideline.md | ~150 | R8 QA guideline.pdf | validate-quality, perform-fmeca |
| mso-checklist.md | ~200 | Check_list_MSO.xlsx | validate-quality, orchestrate-workflow |
| quality-management-flowchart.md | ~100 | QA flowchart.xlsx | validate-quality |

### client/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-05-client-context-ocp.md | ~180 | architecture/ref-05 | orchestrate-workflow |

### architecture/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-06-software-architecture-vision.md | ~220 | architecture/ref-06 | orchestrate-workflow |
| ref-08-user-guide-step-by-step.md | ~400 | architecture/ref-08 | orchestrate-workflow |
| ref-11-neuro-arquitectura-review.md | ~400 | architecture/ref-11 | orchestrate-workflow |

### gfsn/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-13-maintenance-manual-methodology.md | ~180 | architecture/ref-13 | assess-criticality, perform-fmeca, calculate-kpis, +5 more |
| ref-14-planning-scheduling-procedure.md | ~220 | architecture/ref-14 | schedule-weekly-program, group-backlog, calculate-planning-kpis |
| ref-15-defect-elimination-procedure.md | ~330 | architecture/ref-15 | perform-rca, manage-capa, manage-change |
| ref-16-criticality-analysis-procedure.md | ~250 | architecture/ref-16 | assess-criticality |
| gfsn-maintenance-manual-full.md | ~1000+ | GFSN manual PDF (104p) | ALL skills |
| gfsn-criticality-analysis-full-procedure.md | ~400 | GFSN criticality PDF | assess-criticality, calculate-priority |
| gfsn-defect-elimination-full-procedure.md | ~500 | GFSN DE PDF | perform-rca, manage-capa |
| gfsn-planning-scheduling-full-procedure.md | ~600 | GFSN planning PDF (34p) | schedule-weekly-program, group-backlog |

### competitive/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-10-gecamin-cross-reference.md | ~450 | architecture/ref-10 | orchestrate-workflow |
| gecamin/ | 57 files | GECAMIN MAPLA 2024 PDFs | orchestrate-workflow (competitive intelligence) |

### strategic/

| Document | Lines | Source | Used By Skills |
|----------|-------|--------|----------------|
| ref-09-iso-55002-compliance-mapping.md | ~450 | architecture/ref-09 | orchestrate-workflow, validate-quality |
| ref-12-strategic-recommendations.md | ~430 | architecture/ref-12 | orchestrate-workflow, conduct-management-review |
| ref-17-methodology-gap-analysis-roadmap.md | ~550 | architecture/ref-17 | orchestrate-workflow |

---

## How to Use This Knowledge Base

1. **From a SKILL.md:** Reference documents using relative paths:
   ```markdown
   ## 6. Recursos Vinculados
   | Recurso | Ruta | Cuando Leer |
   |---------|------|-------------|
   | RCM Methodology | `../../knowledge-base/methodologies/ref-01-maintenance-strategy-methodology.md` | Before running RCM decision tree |
   ```

2. **Large documents (>300 lines):** Use the Table of Contents to navigate to the relevant section. Do NOT load the entire document.

3. **Skill-specific references:** If a document is used by only 1-2 skills, it lives in the skill's own `references/` folder, not here.

4. **Document updates:** When updating a KB document, check the "Used By Skills" header to know which skills may be affected.
