# Pruebas Unitarias - Skills System

**Fecha de creacion:** 2026-02-23
**Archivo de tests:** `tests/test_skills_system.py`
**Resultado baseline:** 242/242 PASSED (antes de la migracion VSC v2)

## Proposito

Este documento registra las pruebas unitarias creadas para validar el sistema de skills antes, durante y despues de la reestructuracion siguiendo la Metodologia VSC Skills v2.

## Grupos de Tests

### Grupo 1: Loader Module (17 tests)

| Test | Descripcion | Estado |
|------|-------------|--------|
| TestLoaderImport::test_import_loader | Verifica que las 4 funciones publicas se importan correctamente | PASSED |
| TestLoaderImport::test_agent_skill_dirs_mapping | Verifica el mapeo de 4 agentes a directorios | PASSED |
| TestLoaderImport::test_skills_dir_exists | Verifica que el directorio de skills existe | PASSED |
| TestLoadSkill::test_load_valid_skill | Carga un skill valido (assess-criticality) | PASSED |
| TestLoadSkill::test_load_unknown_agent_raises_valueerror | Agente desconocido lanza ValueError | PASSED |
| TestLoadSkill::test_load_nonexistent_skill_raises_filenotfound | Skill inexistente lanza FileNotFoundError | PASSED |
| TestLoadSkill::test_load_skill_returns_string | Retorna tipo string | PASSED |
| TestLoadSkill::test_load_skill_utf8_encoding | Soporta caracteres UTF-8 | PASSED |
| TestLoadSkillsForAgent::test_reliability_skills_count | Reliability tiene 16+ skills | PASSED |
| TestLoadSkillsForAgent::test_planning_skills_count | Planning tiene 12 skills | PASSED |
| TestLoadSkillsForAgent::test_spare_parts_skills_count | Spare Parts tiene 3 skills | PASSED |
| TestLoadSkillsForAgent::test_orchestrator_skills_count | Orchestrator tiene 2 skills | PASSED |
| TestLoadSkillsForAgent::test_unknown_agent_returns_empty | Agente desconocido retorna lista vacia | PASSED |
| TestLoadSkillsForAgent::test_all_skills_are_strings | Todos los skills son strings no vacios | PASSED |
| TestLoadSkillsForAgent::test_skills_sorted_alphabetically | Skills cargados en orden | PASSED |
| TestLoadSharedSkills::test_shared_skills_count | 3 skills compartidos | PASSED |
| TestLoadSharedSkills::test_shared_skills_are_strings | Shared skills son strings | PASSED |

### Grupo 2: Format Skills Block (5 tests)

| Test | Descripcion | Estado |
|------|-------------|--------|
| test_empty_list_returns_empty_string | Lista vacia retorna "" | PASSED |
| test_single_skill_format | Un skill tiene formato === SKILL 1 === | PASSED |
| test_multiple_skills_format | Multiples skills numerados correctamente | PASSED |
| test_skills_separated_by_double_newline | Separacion con doble newline | PASSED |
| test_numbering_starts_at_1 | Numeracion empieza en 1, no en 0 | PASSED |

### Grupo 3: AgentConfig & base.py (8 tests)

| Test | Descripcion | Estado |
|------|-------------|--------|
| test_import_agent_config | AgentConfig importable con campos correctos | PASSED |
| test_use_skills_default_false | use_skills default es False | PASSED |
| test_include_shared_skills_default_true | include_shared_skills default es True | PASSED |
| test_load_prompt_without_skills | Sin skills, prompt es solo base | PASSED |
| test_load_prompt_with_skills | Con skills, prompt tiene bloques === SKILL === | PASSED |
| test_load_prompt_with_skills_includes_shared | Con shared, tiene 19+ skills | PASSED |
| test_load_prompt_without_shared_skills | Sin shared, solo 16-18 skills | PASSED |
| test_prompt_base_content_preserved_with_skills | Base prompt preservado como prefijo | PASSED |

### Grupo 4: Agent Definitions (4 tests)

| Test | Descripcion | Estado |
|------|-------------|--------|
| test_reliability_config | Config correcta: use_skills=True, model=opus | PASSED |
| test_planning_config | Config correcta: use_skills=True | PASSED |
| test_spare_parts_config | Config correcta: use_skills=True | PASSED |
| test_orchestrator_config | Config correcta: use_skills=True | PASSED |

### Grupo 5: Skill File Existence (36 tests parametrizados)

Verifica que cada uno de los 36 archivos .md existe en su directorio correcto:
- 16 reliability skills: TODOS PASSED
- 12 planning skills: TODOS PASSED
- 3 spare parts skills: TODOS PASSED
- 2 orchestration skills: TODOS PASSED
- 3 shared skills: TODOS PASSED

### Grupo 6: Skill File Content (100+ tests parametrizados)

Verifica que cada skill tiene las secciones minimas:
- `## Purpose` presente en todos los 36 skills: PASSED
- `## Step-by-Step Procedure` o `Step 1` en 16 reliability skills: PASSED
- `## Source Reference` o `Engine:` en 16 reliability skills: PASSED
- `## Validation` en 16 reliability skills: PASSED

### Grupo 7: Skill File Size (48 tests parametrizados)

- Todos los reliability skills tienen >50 lineas: PASSED
- Todos los reliability skills tienen <1000 lineas: PASSED
- Todos los planning skills tienen >50 lineas: PASSED
- Todos los spare parts skills tienen >50 lineas: PASSED

### Grupo 8: Critical Business Rules (24 tests)

| Test | Regla Critica | Estado |
|------|--------------|--------|
| test_criticality_has_r8_and_gfsn_modes | Dual mode R8 + GFSN | PASSED |
| test_criticality_has_11_categories | 11 categorias de consecuencia | PASSED |
| test_criticality_has_risk_classes | Clases I, II, III, IV | PASSED |
| test_rcm_has_16_paths | 16 caminos de decision | PASSED |
| test_rcm_has_5_strategy_types | CBM, FT, FFI, RTF, REDESIGN | PASSED |
| test_rcm_safety_never_rtf | Safety nunca permite RTF | PASSED |
| test_fmeca_has_4_stages | 4 etapas FMECA | PASSED |
| test_fmeca_has_rpn_formula | RPN = S x O x D | PASSED |
| test_fmeca_has_rpn_thresholds | LOW/MEDIUM/HIGH/CRITICAL | PASSED |
| test_validate_fm_has_72_combos | 72 combinaciones FM | PASSED |
| test_validate_fm_has_18_mechanisms | 18 mecanismos de falla | PASSED |
| test_sap_export_has_3_templates | MI + Task List + Work Plan | PASSED |
| test_sap_export_always_draft | Siempre DRAFT | PASSED |
| test_work_packages_40_char_limit | 40 chars, ALL CAPS | PASSED |
| test_materials_t16_rule | Regla T-16 REPLACE | PASSED |
| test_materials_3_confidence_tiers | 0.95/0.70/0.40 | PASSED |
| test_workflow_4_milestones | 4 milestones | PASSED |
| test_quality_validation_rules | Reglas de validacion | PASSED |
| test_kpis_has_mtbf_mttr | MTBF y MTTR | PASSED |
| test_weibull_has_beta_patterns | Beta y Weibull | PASSED |
| test_rca_has_5w2h | 5W+2H method | PASSED |
| test_health_score_has_dimensions | Dimensiones con pesos | PASSED |
| test_planning_kpis_count | KPIs mencionados | PASSED |
| test_backlog_grouping_strategies | Estrategias de agrupacion | PASSED |
| test_import_data_types | Tipos de datos | PASSED |

### Grupo 9: Directory Structure (10 tests)

Verifica existencia de directorios y archivos clave:
- core/skills/ y subdirectorios: PASSED
- loader.py: PASSED
- __init__.py files: PASSED
- agents/definitions/prompts/: PASSED
- 4 archivos de prompt: PASSED

### Grupo 10: Full Prompt Assembly (6 tests)

| Test | Descripcion | Estado |
|------|-------------|--------|
| test_reliability_full_prompt_size | >10,000 chars con skills | PASSED |
| test_planning_full_prompt_size | >10,000 chars con skills | PASSED |
| test_spare_parts_full_prompt_size | >5,000 chars con skills | PASSED |
| test_orchestrator_full_prompt_size | >5,000 chars con skills | PASSED |
| test_prompt_contains_sop_header | Header SOP presente | PASSED |
| test_prompt_skill_blocks_well_formed | Bloques === SKILL N === bien formados | PASSED |

## Resumen

| Grupo | Tests | Passed | Failed |
|-------|-------|--------|--------|
| 1. Loader Module | 17 | 17 | 0 |
| 2. Format Skills Block | 5 | 5 | 0 |
| 3. AgentConfig & base.py | 8 | 8 | 0 |
| 4. Agent Definitions | 4 | 4 | 0 |
| 5. Skill File Existence | 36 | 36 | 0 |
| 6. Skill File Content | 100+ | 100+ | 0 |
| 7. Skill File Size | 48 | 48 | 0 |
| 8. Critical Business Rules | 24 | 24 | 0 |
| 9. Directory Structure | 10 | 10 | 0 |
| 10. Full Prompt Assembly | 6 | 6 | 0 |
| **TOTAL** | **242** | **242** | **0** |

## Ejecucion

```bash
# Ejecutar todos los tests del skills system
python -m pytest tests/test_skills_system.py -v

# Ejecutar solo tests de reglas de negocio criticas
python -m pytest tests/test_skills_system.py::TestCriticalBusinessRules -v

# Ejecutar solo tests de integracion
python -m pytest tests/test_skills_system.py::TestFullPromptAssembly -v
```

## Notas

- El archivo `core/skills/reliability/ejemplo.md` esta vacio (0 bytes). Los tests lo excluyen correctamente.
- Tiempo de ejecucion: ~1.5 segundos (no requiere API ni red)
- Estos tests deben ejecutarse despues de cada fase de la migracion VSC v2 para verificar no-regresion

---

# Pruebas Unitarias V2 - Skills System (Post-Migracion)

**Fecha:** 2026-02-23
**Archivo de tests:** `tests/test_skills_v2.py`
**Resultado:** 817/817 PASSED

## Proposito

Suite de tests que valida la nueva estructura VSC Skills Methodology v2:
- Cada skill como carpeta: `skills/{skill-name}/SKILL.md` + `references/` + `scripts/` + `evals/`
- YAML front matter con `name:` y `description:` (triggers EN/ES)
- Knowledge-base compartido en `skills/knowledge-base/`
- Loader actualizado con soporte v2 + backward compatibility

## Grupos de Tests V2

### Grupo 1: V2 Loader (15 tests)
- Import de funciones v2 (get_skill_metadata, list_all_skills)
- Registro AGENT_SKILLS con conteos correctos (16/12/2/2)
- SHARED_SKILLS con 3 skills
- load_skill con YAML front matter
- load_skills_for_agent conteos por agente

### Grupo 2: Folder Structure (175 tests parametrizados - 35 skills x 5)
Para cada uno de los 35 skills:
- Carpeta existe
- SKILL.md existe
- references/ existe
- scripts/ existe
- evals/ existe

### Grupo 3: YAML Front Matter (175 tests - 35 x 5)
Para cada skill:
- Empieza con `---`
- Tiene cierre `---`
- YAML contiene `name:`
- YAML contiene `description:`
- Nombre YAML coincide con nombre de carpeta

### Grupo 4: SKILL.md Content (140 tests - 35 x 4)
Para cada skill:
- Secciones requeridas presentes (Rol y Persona, Intake, Flujo)
- Agente destinatario declarado
- Menos de 500 lineas
- Mas de 50 lineas

### Grupo 5: Evals (245 tests - 35 x 7)
Para cada skill:
- trigger-eval.json existe
- trigger-eval.json es JSON valido
- 10+ should_trigger entries
- 10+ should_not_trigger entries
- evals.json existe
- evals.json es JSON valido
- 3+ test cases

### Grupo 6: Scripts (70 tests - 35 x 2)
Para cada skill:
- validate.py existe
- validate.py tiene bloque __main__

### Grupo 7: Knowledge Base (16 tests)
- Directorio existe
- README.md existe
- 10 subdirectorios (standards, methodologies, data-models, etc.)
- Contenido minimo en standards, methodologies, gfsn
- Carpeta gecamin existe

### Grupo 8: Registry Files (2 tests)
- SKILL_REGISTRY.md existe
- Todos los 35 skills mencionados en registry

### Grupo 9: Business Rules V2 (9 tests)
- Criticidad: R8 + GFSN, 11 categorias
- RCM: CBM + RTF
- FMECA: RPN
- KPIs: MTBF + MTTR
- Weibull: beta
- RCA: 5W2H
- SAP: templates
- Workflow: milestones

### Grupo 10: Prompt Assembly V2 (5 tests)
- Reliability prompt con v2 skills
- 16 skills sin shared
- 19 skills con shared (16+3)
- YAML present in prompt
- Todos los agentes ensamblan prompts correctamente

## Resumen Combinado

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Legacy (test_skills_system.py) | 242 | 242 | 0 |
| V2 (test_skills_v2.py) | 817 | 817 | 0 |
| **TOTAL** | **1059** | **1059** | **0** |

## Ejecucion

```bash
# Ejecutar ambas suites
python -m pytest tests/test_skills_system.py tests/test_skills_v2.py -v

# Solo tests V2
python -m pytest tests/test_skills_v2.py -v

# Solo estructura de carpetas
python -m pytest tests/test_skills_v2.py::TestV2FolderStructure -v

# Solo evals
python -m pytest tests/test_skills_v2.py::TestV2Evals -v

# Solo prompt assembly
python -m pytest tests/test_skills_v2.py::TestV2PromptAssembly -v
```
