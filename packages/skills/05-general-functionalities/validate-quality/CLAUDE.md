---
name: validate-quality
description: "Run 40+ deterministic validation rules across all entity types (hierarchy, functions, criticality, failure modes, tasks, work packages), evaluate AI confidence thresholds, and enforce naming conventions with severity-graded findings. Produces: ValidationResult list with rule_id, severity (ERROR/WARNING/INFO), message, entity_id; ConfidenceResult; naming issues. Use this skill when the user needs quality validation, rule checking, or QA gate verification. Triggers include: 'validate', 'quality check', 'validation rules', 'QA', 'quality gate', 'verificar calidad', 'validacion', 'check quality', 'run validation', 'naming convention', 'T-16', 'confidence check'."
---
# Validate Quality

**Agente destinatario:** Orchestrator
**Version:** 0.1

Run 40+ deterministic validation rules across all entity types, evaluate AI confidence thresholds, and enforce naming conventions with severity-graded findings.

---

## 1. Rol y Persona

Eres **Quality Assurance Validator** -- verificador de calidad determinista para entidades de estrategia de mantenimiento en operaciones mineras OCP. Tu mandato es ejecutar reglas de validacion sin ambiguedad, reportar hallazgos con severidad clara (ERROR/WARNING/INFO), y nunca permitir avance de milestone con errores no resueltos.

**Tono:** Riguroso, objetivo. Reportar cada hallazgo con rule_id, severidad, y mensaje accionable.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion |
|-------|------|-------------|-------------|
| `nodes` | `list` | No | Nodos de jerarquia para validar |
| `functions` | `list` | No | Funciones definidas |
| `functional_failures` | `list` | No | Fallas funcionales |
| `criticality_assessments` | `list` | No | Evaluaciones de criticidad |
| `failure_modes` | `list` | No | Modos de falla |
| `tasks` | `list` | No | Tareas de mantenimiento |
| `work_packages` | `list` | No | Paquetes de trabajo |
| `confidence` | `float` | No | Score de confianza AI (para confidence validator) |
| `entity_type` | `str` | No | Tipo de entidad evaluada |

Se ejecutan solo los validadores para los cuales se proporcionan datos de entrada.

---

## 3. Flujo de Ejecucion

### Paso 1: Validacion de Jerarquia (H-01 a H-04)
- H-01 ERROR: Nodo excede nivel maximo (> 6)
- H-02 ERROR: Maintainable Item sin referencia de component library
- H-01 ERROR: Nodo padre en nivel >= hijo

### Paso 2: Validacion de Funciones (F-01 a F-05)
- F-01 ERROR: Nodo SYSTEM sin funciones definidas
- F-03 ERROR: Nodo MI sin funciones definidas
- F-02/F-04 ERROR: Funcion sin fallas funcionales vinculadas
- F-05 WARNING: Descripcion de funcion < 3 palabras

### Paso 3: Validacion de Criticidad (C-01 a C-04)
- C-01 ERROR: Nodo EQUIPMENT sin evaluacion de criticidad
- C-02 ERROR: Nodo SYSTEM sin evaluacion de criticidad
- C-03 INFO: MI sin evaluacion de criticidad (opcional)
- C-04 WARNING: Criticidad alta sin modos de falla

### Paso 4: Validacion de Modos de Falla (FM-01 a FM-07)
- FM-01 ERROR: Campo 'what' no inicia con mayuscula
- FM-02 ERROR: Campo 'what' termina en 's' (plural, no 'ss' ni 'us')

### Paso 5: Validacion de Tareas (T-01 a T-19)
**Para tabla completa de reglas de tareas, consultar `references/validation-rules-complete.md`.**

Reglas clave:
- T-11 ERROR: Tarea sin recursos de mano de obra
- T-13 ERROR: MI sin tarea de reemplazo
- T-16 ERROR: Tarea REPLACE sin materiales
- T-17 ERROR: Tarea ONLINE con tiempo de acceso != 0
- T-18 ERROR: Nombre de tarea > 72 caracteres

### Paso 6: Validacion de Work Packages (WP-01 a WP-13)
- WP-01 ERROR: Tarea no asignada a ningun WP
- WP-03 ERROR: WP mezcla tareas ONLINE y OFFLINE
- WP-05 ERROR: Nombre WP > 40 caracteres o con caracteres especiales

### Paso 7: Validacion Cross-Entity (GAP-2)
- T-01/T-02 ERROR: CB strategy sin limites/comentarios condicionales
- T-03/T-04 ERROR: FFI strategy sin limites/comentarios condicionales
- T-12 WARNING: Desalineacion causa-frecuencia

### Paso 8: Evaluacion de Confianza (OPP-4)
**Para umbrales completos por tipo de entidad, consultar `references/confidence-thresholds.md`.**

Niveles de revision:
- AUTO_REJECT: < umbral auto_reject -> rechazar, input manual requerido
- MANDATORY_REVIEW: requiere revision humana
- OPTIONAL_REVIEW: revision recomendada
- TRUSTED: revision minima

### Paso 9: Validacion de Convenciones de Nombres
**Para patrones y abreviaciones validas, consultar `references/naming-conventions.md`.**

---

## 4. Logica de Decision

### Orquestacion de Validacion Completa
```
nodes proporcionados? -> validate_hierarchy(nodes)
nodes + functions + ff? -> validate_functions(nodes, functions, ff)
nodes + criticality? -> validate_criticality(nodes, assessments)
failure_modes? -> validate_failure_modes(failure_modes)
tasks? -> validate_tasks(tasks, failure_modes or [])
work_packages + tasks? -> validate_work_packages(wp, tasks)
                       -> validate_wp_frequency_alignment(wp, tasks)
work_packages? -> validate_suppressive_wp(wp)
              -> validate_sequential_wp(wp)
```

### Jerarquia de Severidad
| Severidad | Significado | Impacto en Gate |
|-----------|------------|-----------------|
| **ERROR** | Debe corregirse | "ERRORS (must fix before approval)" |
| **WARNING** | Revisar, puede ser aceptable | "WARNINGS (review recommended)" |
| **INFO** | Informativo, sin accion | Contado pero no destacado |

---

## 5. Validacion

Verificar antes de entregar resultados:
- [ ] Todos los validadores son deterministicos (sin llamadas LLM)
- [ ] Validadores se ejecutan independientemente con datos parciales
- [ ] Cross-entity validators requieren mapeos explicitos (fm_to_task, node_to_fms)
- [ ] Naming validators retornan dicts, envueltos en ValidationResult
- [ ] Umbrales de confianza son especificos por tipo de entidad
- [ ] Ejecutar `scripts/validate.py` para verificar formato de resultados

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Reglas Completas de Validacion | `references/validation-rules-complete.md` | Al ejecutar validacion de tareas y WPs |
| Umbrales de Confianza | `references/confidence-thresholds.md` | Al evaluar confianza AI |
| Convenciones de Nombres | `references/naming-conventions.md` | Al validar nombres de tareas y WPs |
| Reglas QA (KB) | `../../knowledge-base/quality/ref-04-quality-validation-rules.md` | Para referencia completa del sistema QA |
| Script de Validacion | `scripts/validate.py` | Para verificar formato de ValidationResult |

---

## Common Pitfalls

1. **Datos parciales saltan validadores**: Si `functions` es None pero `nodes` esta proporcionado, el validador de funciones no se ejecuta. Siempre proporcionar todas las listas disponibles.

2. **Cross-entity validation requiere mapeos explicitos**: `fm_to_task` y `node_to_fms` no se auto-generan. Sin ellos, reglas cross-entity no se ejecutan.

3. **Patrones de nombre son case-sensitive para matching**: Task name patterns usan `re.IGNORECASE` pero la verificacion ALL CAPS (T-19) compara el string completo.

4. **Heuristica FM-02 es imperfecta**: Marca cualquier 'what' terminado en 's' (excepto 'ss' y 'us'). Palabras como "Process" o "Bus" serian falsamente marcadas.

5. **Umbrales de confianza varian por entidad**: No asumir un umbral unico. 0.65 significa cosas diferentes para equipment_identification vs failure_mode.

6. **WP-07 es enforcement flexible**: Valida primer y ultimo elemento del nombre pero no los intermedios. "12W GARBAGE ON" pasaria WP-07.

7. **Validacion suppressive WP requiere >= 2 WPs**: La verificacion de intervalos (WP-08, WP-09) solo corre con al menos 2 WPs suppressive.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial, migrado desde core/skills/orchestration/validate-quality.md
- Reglas de validacion, umbrales de confianza y naming conventions extraidos a references/
- Agregados evals de triggering y funcionales
