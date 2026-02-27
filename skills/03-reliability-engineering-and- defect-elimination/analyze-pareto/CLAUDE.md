---
name: analyze-pareto
description: "Use this skill when the user asks about Pareto analysis, 80/20 rule, bad actors, top failures, worst performers, failure ranking, or analisis Pareto. Triggers: Pareto, 80/20, bad actor, top failures, worst performers, failure ranking, analisis Pareto, vital few, malos actores. Identifies the vital few equipment items (typically 20%) responsible for majority (typically 80%) of failures, costs, or downtime. Supports three modes: failure count, cost, and downtime aggregation. Marks bad actors using cumulative percentage threshold with rank-1 special rule."
---

# Analyze Pareto (Bad Actor Identification)

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad especializado en identificar los "malos actores" -- los pocos equipos vitales que causan la mayoria de los problemas de mantenimiento. Aplicas el principio de Pareto (regla 80/20 de Juran) para focalizar recursos de mejora en los equipos con mayor impacto en fallas, costos o tiempo de parada.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `plant_id` | str | Planta analizada | `"PLANT-JFC-01"` |
| `data` | list[dict] | Registros de equipo con valores de metrica | Ver modos |
| `metric_field` | str | Clave del dict con metrica numerica | `"failure_count"` |
| `metric_type` | str | Etiqueta tipo de analisis | `"failures"`, `"cost"`, `"downtime"` |
| `id_field` | str | Clave para ID equipo (default: `"equipment_id"`) | `"equipment_id"` |
| `tag_field` | str | Clave para tag equipo (default: `"equipment_tag"`) | `"equipment_tag"` |

### Tres Modos de Analisis
- **Modo 1 - Conteo de Fallas (`analyze_failures`):** Un registro por evento de falla. Motor agrega por equipment_id contando ocurrencias.
- **Modo 2 - Costo (`analyze_costs`):** Registros con campo `cost`. Motor agrega sumando costos por equipo.
- **Modo 3 - Downtime (`analyze_downtime`):** Registros con campo `downtime_hours`. Motor agrega sumando horas.

## 3. Flujo de Ejecucion

### Paso 1: Validar Datos de Entrada
- Si `data` esta vacio, retornar ParetoResult vacio sin items.

### Paso 2: Ordenar Datos Descendente por Metrica
- Ordenar por `metric_field` descendente. Valores faltantes = 0: `d.get(metric_field, 0)`.

### Paso 3: Calcular Total
```
total = sum(d.get(metric_field, 0) for d in sorted_data)
```
- Si `total <= 0`, retornar ParetoResult vacio.

### Paso 4: Calcular Porcentajes Acumulados
- Inicializar `cumulative = 0.0`
- Por cada equipo (orden descendente):
  1. `cumulative += value`
  2. `cum_pct = round((cumulative / total) * 100, 1)`

### Paso 5: Marcar Bad Actors (Regla 80/20)
- Es bad actor si:
  - `cumulative_pct <= 80` (cae dentro del top 80%), O
  - `rank == 1` AND `cum_pct > 80` (caso especial: un solo item excede 80%)

### Paso 6: Contar Bad Actors
```
bad_actor_pct = (bad_actor_count / total_items) * 100
```

### Paso 7: Construir ParetoItems
- rank (1-base), metric_value (2 decimales), cumulative_pct (1 decimal), is_bad_actor.

### Paso 8: Construir ParetoResult

## 4. Logica de Decision

### Arbol de Clasificacion Bad Actor

```
Por cada equipo (ordenado descendente):
  |
  +-- rank == 1?
  |     SI --> Marcar como bad actor (siempre)
  |     NO  |
  |         +-- cumulative_pct <= 80?
  |               SI --> Bad actor
  |               NO --> NO es bad actor
```

### Guia de Seleccion de Modo

| Situacion | Modo Recomendado | Razon |
|-----------|-----------------|-------|
| Reducir frecuencia de fallas | `failures` | Identifica equipos que mas fallan |
| Reducir gasto de mantenimiento | `cost` | Identifica equipos de mayor costo |
| Mejorar disponibilidad | `downtime` | Identifica equipos con mayor downtime |
| Estudio completo de bad actors | Los 3 modos | Cruzar resultados |

### Logica de Agregacion por Modo

**Conteo de Fallas:**
```
Por cada registro: incrementar contador de equipment_id
Resultado: {equipment_id, equipment_tag, failure_count}
```

**Costo:**
```
Por cada registro: sumar campo "cost" al total de equipment_id
Resultado: {equipment_id, equipment_tag, total_cost}
```

**Downtime:**
```
Por cada registro: sumar campo "downtime_hours" al total de equipment_id
Resultado: {equipment_id, equipment_tag, total_downtime}
```

## 5. Validacion

1. **Datos vacios**: Retorna ParetoResult sin items (no es error).
2. **Total cero**: Si todos suman cero o menos, retorna resultado vacio.
3. **Redondeo**: Valores a 2 decimales, porcentajes acumulados a 1 decimal.
4. **Bad actor porcentaje**: Redondeado a 1 decimal; 0.0 si no hay items.
5. **Rank comienza en 1**: Primer item en orden descendente es rank 1.
6. **Deduplicacion**: Cada `equipment_id` aparece una sola vez en output.

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Seccion 7.5.3 -- Pareto para Bad Actors |
| Procedimiento de Eliminacion de Defectos | `../../knowledge-base/gfsn/ref-15-defect-elimination-procedure.md` | Para acciones post-identificacion de bad actors |
| Motor Pareto | `tools/engines/pareto_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Olvidar agregar primero.** En modo fallas, los datos crudos tienen una fila por EVENTO. El motor agrega antes del Pareto.
2. **Confundir modos de metrica.** Usar `analyze_costs` con registros que tienen `downtime_hours` en vez de `cost` produce ceros.
3. **Interpretar bad_actor_pct_of_total.** Es el % de EQUIPOS que son bad actors, NO el % de la metrica que representan.
4. **Dominancia de un solo item.** Si un equipo causa >80% del total, la regla especial `rank == 1` lo marca.
5. **Equipos con valor cero.** Aparecen al final con 100% acumulado y nunca son bad actors.
6. **Generico vs especifico.** `analyze` es generico (especificar metric_field). `analyze_failures/costs/downtime` manejan agregacion internamente.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
