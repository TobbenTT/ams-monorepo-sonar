# Registro Maestro de Agentes VSC

Última actualización: 2026-02-24

## Índice de Agentes

| ID | Agente | Carpeta | Modelo | Max Turns | Milestones | # Skills | Estado |
|----|--------|---------|--------|-----------|------------|----------|--------|
| AG-001 | Orchestrator | `agents/orchestrator/` | Sonnet 4.5 | 20 | Todos | 12 (2 mandatory) | Producción |
| AG-002 | Reliability Engineer | `agents/reliability/` | Opus 4.6 | 40 | 1, 2, 3 | 15 (5 mandatory) | Producción |
| AG-003 | Planning Specialist | `agents/planning/` | Sonnet 4.5 | 30 | 3, 4 | 13 (5 mandatory) | Producción |
| AG-004 | Spare Parts Specialist | `agents/spare-parts/` | Haiku 4.5 | 15 | 3 | 3 (2 mandatory) | Producción |

## Matriz Agente × Skill

| # | Skill | Categoría | AG-001 | AG-002 | AG-003 | AG-004 | Milestone | Mandatory |
|---|-------|-----------|:------:|:------:|:------:|:------:|:---------:|:---------:|
| 1 | build-equipment-hierarchy | 02-maint-strategy | | ✅ | | | 1 | Sí |
| 2 | assess-criticality | 02-maint-strategy | | ✅ | | | 1 | Sí |
| 3 | assess-risk-based-inspection | 02-maint-strategy | | ✅ | | | 2 | No |
| 4 | perform-fmeca | 02-maint-strategy | | ✅ | | | 2 | Sí |
| 5 | validate-failure-modes | 02-maint-strategy | | ✅ | | | 2 | Sí |
| 6 | run-rcm-decision-tree | 02-maint-strategy | | ✅ | | | 2 | Sí |
| 7 | assemble-work-packages | 02-maint-strategy | | | ✅ | | 3 | Sí |
| 8 | generate-work-instructions | 02-maint-strategy | | | ✅ | | 3 | Sí |
| 9 | calculate-planning-kpis | 02-work-planning | | | ✅ | | 3 | No |
| 10 | calculate-priority | 02-work-planning | | | ✅ | | 3 | Sí |
| 11 | export-to-sap | 02-work-planning | | | ✅ | | 4 | Sí |
| 12 | group-backlog | 02-work-planning | | | ✅ | | 3 | Sí |
| 13 | optimize-spare-parts-inventory | 02-work-planning | | | | ✅ | 3 | No |
| 14 | orchestrate-shutdown | 02-work-planning | | | ✅ | | 3 | No |
| 15 | schedule-weekly-program | 02-work-planning | | | ✅ | | 3 | No |
| 16 | suggest-materials | 02-work-planning | | | | ✅ | 3 | Sí |
| 17 | analyze-jackknife | 03-reliability | | ✅ | | | 3 | No |
| 18 | analyze-pareto | 03-reliability | | ✅ | | | 3 | No |
| 19 | fit-weibull-distribution | 03-reliability | | ✅ | | | 3 | No |
| 20 | perform-rca | 03-reliability | | ✅ | | | 3 | No |
| 21 | calculate-life-cycle-cost | 04-cost-analysis | | | ✅ | | 3 | No |
| 22 | optimize-cost-risk | 04-cost-analysis | | | ✅ | | 3 | No |
| 23 | export-data | 05-general | ✅ | | | | all | No |
| 24 | import-data | 05-general | ✅ | ✅ | ✅ | | all | No |
| 25 | manage-change | 05-general | ✅ | | | | all | No |
| 26 | manage-notifications | 05-general | ✅ | | | | all | No |
| 27 | validate-quality | 05-general | ✅ | ✅ | ✅ | | all | Sí / No / No |
| 28 | calculate-health-score | 06-orchestation | ✅ | | | | all | No |
| 29 | calculate-kpis | 06-orchestation | ✅ | ✅ | | | all | No |
| 30 | conduct-management-review | 06-orchestation | ✅ | | | | all | No |
| 31 | detect-variance | 06-orchestation | ✅ | | | | all | No |
| 32 | generate-reports | 06-orchestation | ✅ | | | | all | No |
| 33 | analyze-cross-module | standalone | ✅ | | | | all | No |
| 34 | manage-capa | standalone | | ✅ | ✅ | | 3 | No |
| 35 | orchestrate-workflow | standalone | ✅ | | | | all | Sí |
| 36 | resolve-equipment | standalone | | ✅ | | ✅ | 3 / 1 | Sí / No |

## Resumen por Agente

| Agente | Skills Mandatory | Skills Opcionales | Total Skills | # Tools | Milestones |
|--------|:---:|:---:|:---:|:---:|:---:|
| AG-001 Orchestrator | 2 | 10 | 12 | 6 | Todos |
| AG-002 Reliability | 5 | 10 | 15 | 10 | 1, 2, 3 |
| AG-003 Planning | 5 | 8 | 13 | 10 | 3, 4 |
| AG-004 Spare Parts | 2 | 1 | 3 | 4 | 3 |
| **TOTAL (unique skills: 36)** | **14** | **29** | **43** | **30** | |

> **Nota:** 7 skills son compartidos entre agentes (cross-agent). El total de skills únicos sigue siendo 36.
> Los 7 shared: validate-quality (×3), import-data (×3), resolve-equipment (×2), calculate-kpis (×2), manage-capa (×2).

## Mapa de Dependencias entre Agentes

| Agente | Depende de | Tipo de Dependencia |
|--------|-----------|---------------------|
| AG-002 (Reliability) | AG-001 (Orchestrator) | Recibe delegaciones del orquestador |
| AG-003 (Planning) | AG-001 (Orchestrator) | Recibe delegaciones del orquestador |
| AG-003 (Planning) | AG-002 (Reliability) | Consume output de reliability (failure modes, RCM decisions, tasks) |
| AG-004 (Spare Parts) | AG-001 (Orchestrator) | Recibe delegaciones del orquestador |
| AG-004 (Spare Parts) | AG-003 (Planning) | Consume tasks con REPLACE del planning agent |
| AG-001 (Orchestrator) | AG-002, AG-003, AG-004 | Coordina a todos los especialistas |

## Single Writer Ownership

| Entidad | Agente Writer | Agentes Readers |
|---------|:------------:|-----------------|
| Nodos de jerarquía | AG-002 | Todos |
| Assessments de criticidad | AG-002 | Todos |
| Modos de falla (FMECA) | AG-002 | Todos |
| Decisiones RCM | AG-002 | Todos |
| Tareas de mantenimiento | AG-003 | Todos |
| Work packages | AG-003 | Todos |
| Work instructions | AG-003 | Todos |
| Paquete SAP export | AG-003 | AG-001 |
| Asignaciones de materiales | AG-004 | Todos |

## Estructura de Carpetas

```
agents/
├── orchestrator/
│   ├── CLAUDE.md          # System prompt
│   ├── skills.yaml        # 12 skills (2 mandatory)
│   └── config.py          # Factory function
├── reliability/
│   ├── CLAUDE.md          # System prompt
│   ├── skills.yaml        # 15 skills (5 mandatory, 5 cross-agent)
│   └── config.py          # Factory function
├── planning/
│   ├── CLAUDE.md          # System prompt
│   ├── skills.yaml        # 13 skills (5 mandatory, 2 cross-agent)
│   └── config.py          # Factory function
├── spare-parts/
│   ├── CLAUDE.md          # System prompt
│   ├── skills.yaml        # 3 skills (2 mandatory)
│   └── config.py          # Factory function
├── _shared/
│   ├── __init__.py        # Exports
│   ├── base.py            # AgentConfig + Agent class
│   └── loader.py          # Dynamic agent loading
├── AGENT_REGISTRY.md      # Este documento
└── VSC_Agents_Methodology_v1.md  # Metodología
```
