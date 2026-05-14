# Reporte de Cobertura de Skills por Agente

Fecha: 2026-02-24

## Resultado: Todos los 36 skills están asignados

No hay skills huérfanos. Los 36 skills del proyecto están asignados a al menos un agente.

## Distribución Actual

| Agente | Skills Asignados | Mandatory | Opcional |
|--------|:---:|:---:|:---:|
| Orchestrator (AG-001) | 12 | 2 | 10 |
| Reliability (AG-002) | 15 | 5 | 10 |
| Planning (AG-003) | 13 | 5 | 8 |
| Spare Parts (AG-004) | 3 | 2 | 1 |
| **Total** | **43** | **14** | **29** |

## Mapeo Completo: Skill → Agente

| # | Skill | Categoría | Agente Asignado | Milestone | Obligatorio |
|---|-------|-----------|-----------------|:---------:|:-----------:|
| 1 | `build-equipment-hierarchy` | 02-maintenance-strategy | Reliability | 1 | Sí |
| 2 | `assess-criticality` | 02-maintenance-strategy | Reliability | 1 | Sí |
| 3 | `perform-fmeca` | 02-maintenance-strategy | Reliability | 2 | Sí |
| 4 | `validate-failure-modes` | 02-maintenance-strategy | Reliability | 2 | Sí |
| 5 | `run-rcm-decision-tree` | 02-maintenance-strategy | Reliability | 2 | Sí |
| 6 | `assess-risk-based-inspection` | 02-maintenance-strategy | Reliability | 2 | No |
| 7 | `assemble-work-packages` | 02-maintenance-strategy | Planning | 3 | Sí |
| 8 | `generate-work-instructions` | 02-maintenance-strategy | Planning | 3 | Sí |
| 9 | `calculate-planning-kpis` | 02-work-planning | Planning | 3 | No |
| 10 | `calculate-priority` | 02-work-planning | Planning | 3 | Sí |
| 11 | `export-to-sap` | 02-work-planning | Planning | 4 | Sí |
| 12 | `group-backlog` | 02-work-planning | Planning | 3 | Sí |
| 13 | `optimize-spare-parts-inventory` | 02-work-planning | Spare Parts | 3 | No |
| 14 | `orchestrate-shutdown` | 02-work-planning | Planning | 3 | No |
| 15 | `schedule-weekly-program` | 02-work-planning | Planning | 3 | No |
| 16 | `suggest-materials` | 02-work-planning | Spare Parts | 3 | Sí |
| 17 | `analyze-jackknife` | 03-reliability | Reliability | 3 | No |
| 18 | `analyze-pareto` | 03-reliability | Reliability | 3 | No |
| 19 | `fit-weibull-distribution` | 03-reliability | Reliability | 3 | No |
| 20 | `perform-rca` | 03-reliability | Reliability | 3 | No |
| 21 | `calculate-life-cycle-cost` | 04-cost-analysis | Planning | 3 | No |
| 22 | `optimize-cost-risk` | 04-cost-analysis | Planning | 3 | No |
| 23 | `export-data` | 05-general | Orchestrator | all | No |
| 24 | `import-data` | 05-general | Orchestrator, Reliability, Planning | all | No |
| 25 | `manage-change` | 05-general | Orchestrator | all | No |
| 26 | `manage-notifications` | 05-general | Orchestrator | all | No |
| 27 | `validate-quality` | 05-general | Orchestrator, Reliability, Planning | all | Sí |
| 28 | `calculate-health-score` | 06-orchestation | Orchestrator | all | No |
| 29 | `calculate-kpis` | 06-orchestation | Orchestrator, Reliability | all | No |
| 30 | `conduct-management-review` | 06-orchestation | Orchestrator | all | No |
| 31 | `detect-variance` | 06-orchestation | Orchestrator | all | No |
| 32 | `generate-reports` | 06-orchestation | Orchestrator | all | No |
| 33 | `analyze-cross-module` | standalone | Orchestrator | all | No |
| 34 | `manage-capa` | standalone | Planning, Reliability | 3 | No |
| 35 | `orchestrate-workflow` | standalone | Orchestrator | all | Sí |
| 36 | `resolve-equipment` | standalone | Spare Parts, Reliability | 3 | Sí |

## Asignaciones Cruzadas Implementadas (Cross-Agent)

Las 5 recomendaciones de asignación cruzada fueron evaluadas e implementadas el 2026-02-24, utilizando la **Opción 2: asignación cruzada selectiva** (`mandatory: false`, manteniendo al agente original como Writer primario).

### 1. `validate-quality` → Asignado a Reliability y Planning (IMPLEMENTADO)

```yaml
# Asignado a: Orchestrator + Reliability + Planning
# YAML del skill:
- name: validate-quality
  path: skills/05-general-functionalities/validate-quality/CLAUDE.md
  category: Quality Assurance
  trigger_phrases_en: validate, quality check, validation rules, QA, quality gate
```

**Recomendación:** El Orchestrator ejecuta `validate-quality` en los gates, pero los agentes especialistas podrían beneficiarse de auto-validar su propio output ANTES de devolverlo al Orchestrator. Esto implementaría el patrón de "Evaluación en Capas" (sección 7.4 de la metodología): validación interna del agente + validación del Orchestrator.

**Agentes candidatos:** Reliability (para auto-validar FMECA y criticidad), Planning (para auto-validar work packages y SAP exports).

### 2. `resolve-equipment` → Asignado a Reliability (IMPLEMENTADO)

```yaml
# Asignado a: Spare Parts + Reliability
# YAML del skill:
- name: resolve-equipment
  path: skills/resolve-equipment/CLAUDE.md
  category: Equipment Identification
  trigger_phrases_en: resolve equipment, equipment lookup, find equipment, tag resolution
```

**Recomendación:** El Reliability Agent frecuentemente recibe descripciones de texto libre de equipos al construir jerarquías. Podría beneficiarse de `resolve-equipment` para mapear descripciones ambiguas a tags registrados antes de iniciar el análisis.

**Agentes candidatos:** Reliability (para resolver equipos en Milestone 1 al construir jerarquía).

### 3. `calculate-kpis` → Asignado a Reliability (IMPLEMENTADO)

```yaml
# Asignado a: Orchestrator + Reliability
# YAML del skill:
- name: calculate-kpis
  path: skills/06-orchestation/calculate-kpis/CLAUDE.md
  category: KPI Calculation
  trigger_phrases_en: KPI, MTBF, MTTR, OEE, availability, reliability metrics
```

**Recomendación:** El cálculo de MTBF, MTTR, OEE y Availability es conocimiento de dominio de fiabilidad. Aunque el Orchestrator lo usa para reportes, el Reliability Agent podría necesitar calcular estos KPIs como input para sus análisis de Weibull y Pareto en Milestone 3.

**Agentes candidatos:** Reliability (para análisis de fiabilidad en Milestone 3).

### 4. `import-data` → Asignado a Reliability y Planning (IMPLEMENTADO)

```yaml
# Asignado a: Orchestrator + Reliability + Planning
# YAML del skill:
- name: import-data
  path: skills/05-general-functionalities/import-data/CLAUDE.md
  category: Data Management
  trigger_phrases_en: import data, upload data, load CSV, import equipment, import history
```

**Recomendación:** Los agentes especialistas podrían necesitar importar datos directamente (historial de fallas para Reliability, backlog para Planning) sin que el Orchestrator actúe como intermediario.

**Agentes candidatos:** Reliability (para importar historial de fallas), Planning (para importar backlog y calendarios).

### 5. `manage-capa` → Asignado a Reliability (IMPLEMENTADO)

```yaml
# Asignado a: Planning + Reliability
# YAML del skill:
- name: manage-capa
  path: skills/manage-capa/CLAUDE.md
  category: Corrective & Preventive Actions
  trigger_phrases_en: CAPA, corrective action, preventive action, PDCA
```

**Recomendación:** Las acciones correctivas/preventivas frecuentemente se originan desde el análisis de causa raíz (RCA) que ejecuta el Reliability Agent. Podría beneficiarse de crear CAPAs directamente como output de `perform-rca`.

**Agentes candidatos:** Reliability (para crear CAPAs desde RCA en Milestone 3).

---

## Decisión Tomada

Se eligió la **Opción 2: Asignación cruzada selectiva** (2026-02-24).

- Todos los skills compartidos se agregaron como `mandatory: false` en los agentes secundarios.
- El agente original mantiene su rol de Writer primario.
- Los agentes secundarios usan el skill para auto-validación interna o como input para sus propios análisis.

### Archivos modificados

| Archivo | Cambio |
| ------- | ------ |
| `agents/reliability/skills.yaml` | +5 cross-agent skills (validate-quality, resolve-equipment, calculate-kpis, manage-capa, import-data) |
| `agents/planning/skills.yaml` | +2 cross-agent skills (validate-quality, import-data) |
| `agents/reliability/CLAUDE.md` | Agregada tabla "Cross-Agent Skills (Shared)" |
| `agents/planning/CLAUDE.md` | Agregada tabla "Cross-Agent Skills (Shared)" |
| `agents/AGENT_REGISTRY.md` | Actualizados conteos y matriz de asignación |
