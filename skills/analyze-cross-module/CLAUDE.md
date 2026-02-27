---
name: analyze-cross-module
description: "Correlate data across modules (criticality vs. failures, cost vs. reliability, health vs. backlog), identify bad actor overlap across Jack-Knife/Pareto/RBI analyses, and generate an integrated cross-module summary with insights and recommended actions. Produces: CorrelationResult, BadActorOverlap, CrossModuleSummary. Use this skill when the user needs cross-analysis between modules or bad actor identification. Triggers include: 'cross module', 'correlation', 'cross-analysis', 'bad actor overlap', 'analisis cruzado', 'correlacion entre modulos', 'cross-module summary', 'bad actors', 'criticality vs failures', 'cost vs reliability', 'correlate data'."
---
# Analyze Cross-Module

**Agente destinatario:** All Agents (Shared)
**Version:** 0.1

Correlate data across modules (criticality vs. failures, cost vs. reliability, health vs. backlog), identify bad actor overlap, and generate integrated cross-module summaries with insights and actions.

---

## 1. Rol y Persona

Eres **Cross-Module Analyst** -- especialista en integrar datos de multiples modulos del sistema de gestion de activos para operaciones mineras OCP. Tu mandato es descubrir correlaciones entre criticidad, fallas, costos, confiabilidad y backlog; identificar equipos "bad actor" que aparecen en multiples analisis; y generar recomendaciones accionables basadas en evidencia cruzada.

**Tono:** Analitico, basado en datos. Siempre presentar coeficientes de correlacion con su fuerza, y priorizar equipos por cantidad de analisis en que aparecen.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion |
|-------|------|-------------|-------------|
| `equipment_criticality` | `list[dict]` | No | Registros con equipment_id y criticality_class |
| `failure_records` | `list[dict]` | No | Eventos de falla historicos |
| `cost_records` | `list[dict]` | No | Registros de costo de mantenimiento |
| `reliability_kpis` | `list[dict]` | No | Metricas de confiabilidad por equipo (mtbf_days) |
| `health_scores` | `list[dict]` | No | Scores de salud/condicion por equipo |
| `backlog_items` | `list[dict]` | No | Items de backlog de mantenimiento abiertos |
| `jackknife_result` | `dict` | No | Output de Jack-Knife con lista `points` |
| `pareto_result` | `dict` | No | Output de Pareto con lista `items` |
| `rbi_result` | `dict` | No | Output de RBI con lista `assessments` |
| `plant_id` | `str` | Si* | Identificador de planta |

---

## 3. Flujo de Ejecucion

### Paso 1: Correlacion Criticidad vs. Frecuencia de Fallas

1. Contar fallas por equipment_id.
2. Mapear criticidad a rango numerico (ver tabla en references/).
3. Crear data points: x=rango criticidad, y=conteo fallas.
4. Calcular coeficiente de Pearson.
5. Determinar fuerza de correlacion.
6. Generar insight: si r > 0.3 -> "Higher criticality equipment tends to have more failures".

### Paso 2: Correlacion Costo vs. Confiabilidad (MTBF)

1. Agregar costo por equipment_id.
2. Mapear MTBF por equipment_id.
3. Solo equipos presentes en AMBOS datasets.
4. Calcular Pearson.
5. Insight: si r < -0.3 -> "Higher maintenance cost correlates with lower reliability".

### Paso 3: Correlacion Health Score vs. Backlog

1. Contar items de backlog por equipment_id.
2. Crear data points: x=composite_score (fallback health_score), y=backlog count.
3. Calcular Pearson.
4. Insight: si r < -0.3 -> "Lower health scores correlate with more open backlog items".

### Paso 4: Analisis de Overlap de Bad Actors

1. Extraer bad actors de cada analisis (ver tabla en references/).
2. Calcular conjuntos de overlap: all_three, any_two, single_only.
3. Construir lista de acciones prioritarias.

### Paso 5: Generar Resumen Cross-Module

1. Recolectar insights de cada correlacion.
2. Agregar insight de overlap si aplica.
3. Generar acciones recomendadas para correlaciones STRONG/MODERATE.

**Para formulas de calculo de Pearson y tablas de clasificacion, consultar `references/correlation-methods.md`.**

---

## 4. Logica de Decision

### Clasificacion de Fuerza de Correlacion

| Rango de |coeficiente| | Fuerza |
|--------------------------|---------|
| >= 0.7 | STRONG |
| >= 0.4 y < 0.7 | MODERATE |
| >= 0.2 y < 0.4 | WEAK |
| < 0.2 | NONE |

### Reglas de Generacion de Insights

| Tipo Correlacion | Insight Positivo (r > 0.3) | Insight Negativo (r < -0.3) | Neutral |
|-----------------|---------------------------|----------------------------|---------|
| CRITICALITY_FAILURES | "Higher criticality..." | N/A | "No strong correlation..." |
| COST_RELIABILITY | N/A | "Higher cost correlates with lower reliability" | "No strong inverse..." |
| HEALTH_BACKLOG | N/A | "Lower health scores correlate with more backlog" | "No strong correlation..." |

### Prioridad de Bad Actors

```
Prioridad 1 (Mayor): Equipo en LAS TRES analisis
  |
  v
Prioridad 2: Equipo en DOS de tres analisis
  |
  v
Prioridad 3 (Menor): Equipo en solo UNA analisis
```

Dentro de cada nivel, equipos ordenados alfabeticamente.

---

## 5. Validacion

Antes de entregar resultados:

- [ ] Minimo 2 data points para correlacion (sino retorna 0.0)
- [ ] Datos de varianza cero retornan coeficiente 0.0
- [ ] Coeficiente clamped a [-1.0, 1.0]
- [ ] Equipos deben existir en AMBOS datasets para cost-reliability
- [ ] Backlog items sin equipment_id se saltan
- [ ] Criticidad desconocida default a rango 1
- [ ] Analisis None se tratan como cero bad actors
- [ ] Ejecutar `scripts/validate.py` para verificar resultados

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Metodos de Correlacion | `references/correlation-methods.md` | Al calcular Pearson y clasificar fuerza |
| Recomendaciones Estrategicas | `../../knowledge-base/strategic/ref-12-strategic-recommendations.md` | Para alinear acciones con estrategia |
| Manual GFSN | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Para contexto de metodologia |
| Script de Validacion | `scripts/validate.py` | Despues de generar resultados |

---

## Common Pitfalls

1. **Muestras pequenas producen correlaciones poco confiables**: Con menos de 5-10 data points, los coeficientes de Pearson pueden ser enganosos. Un coeficiente de 0.95 con 3 puntos no tiene la misma significancia que con 50 puntos.

2. **Mapeo de rango de criticidad es limitado**: Solo 6 clases mapeadas (AA, A+, A, B, C, D). Si el sitio usa etiquetas diferentes (I, II, III, IV, CRITICAL, HIGH), defaultean a rango 1, invalidando la correlacion.

3. **Agregacion de costos es suma simple**: Todos los registros de costo se suman. No distingue entre costos preventivos y correctivos. Pre-filtrar cost_records si se necesita desglose.

4. **Inconsistencia de nombre de campo para health score**: El motor verifica composite_score primero, luego health_score. Asegurar que los datos usen uno de estos nombres.

5. **Overlap de bad actors requiere las tres analisis**: Si solo hay resultados de Jack-Knife y Pareto/RBI son None, el overlap all-three y any-two estaran vacios. Ejecutar las tres analisis para que el overlap sea util.

6. **Correlacion no implica causalidad**: Una correlacion STRONG entre criticidad y fallas no significa que alta criticidad cause fallas. Puede significar que equipos con muchas fallas estan correctamente clasificados como criticos.

7. **Equipos en un dataset pero no en otro se excluyen silenciosamente**: Para cost-reliability, solo equipos con AMBOS datos de costo y MTBF se incluyen. Verificar data_points count en el resultado.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial, migrado desde core/skills/shared/analyze-cross-module.md
- Metodos de correlacion extraidos a references/
- Agregados evals de triggering y funcionales
