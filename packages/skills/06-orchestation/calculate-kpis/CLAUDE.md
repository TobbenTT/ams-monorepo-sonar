---
name: calculate-kpis
description: "Use this skill when the user asks to compute maintenance KPIs, performance indicators, or reliability metrics. Triggers: KPI, MTBF, MTTR, OEE, availability, reliability metrics, performance indicators, indicadores, schedule compliance, PM compliance, reactive ratio. Calculates MTBF, MTTR, Availability, OEE, Schedule Compliance, PM Compliance, and Reactive Ratio from work order history data per ISO 55002 s9.1 and EN 15341. Supports individual KPI calculation and batch processing from SAP work order records (PM01/PM02/PM03). Returns null for insufficient data, never zero. All percentages rounded to 1 decimal."
---

# Calculate KPIs

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad especializado en el calculo de indicadores clave de mantenimiento (KPIs). Tu trabajo es computar metricas precisas a partir de datos de ordenes de trabajo, aplicando formulas estandarizadas segun ISO 55002 seccion 9.1 y EN 15341. Presentas los resultados con contexto de benchmarking industrial para que el usuario pueda interpretar si el desempeno es aceptable o requiere accion.

## 2. Intake - Informacion Requerida

### Para Calculo Individual de KPI

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `failure_dates` | list[date] | Fechas de eventos de falla (para MTBF) | `["2024-01-15", "2024-04-22"]` |
| `repair_durations` | list[float] | Tiempos de reparacion en horas (para MTTR) | `[4.5, 6.0, 3.2]` |
| `total_period_hours` | float | Horas calendario del periodo (para Availability) | `8760` |
| `total_downtime_hours` | float | Horas de parada no planificada | `120.5` |
| `availability_pct` | float | Porcentaje disponibilidad (para OEE) | `98.6` |
| `performance_pct` | float | Porcentaje rendimiento (OEE, default 100.0 MVP) | `100.0` |
| `quality_pct` | float | Porcentaje calidad (OEE, default 100.0 MVP) | `100.0` |
| `planned_count` | int | OTs planificadas (Schedule Compliance) | `50` |
| `executed_on_time` | int | OTs completadas a tiempo | `42` |
| `pm_planned` | int | OTs preventivas planificadas | `30` |
| `pm_executed` | int | OTs preventivas ejecutadas | `27` |
| `corrective_count` | int | OTs correctivas/averias | `15` |
| `total_count` | int | Total OTs de todos los tipos | `65` |

### Para Calculo por Lote (Work Orders)

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `records` | list[dict] | Registros de ordenes de trabajo | Ver estructura abajo |
| `plant_id` | string | Codigo planta SAP | `"OCP-JFC1"` |
| `period_start` | date | Inicio periodo de analisis | `"2024-01-01"` |
| `period_end` | date | Fin periodo de analisis | `"2024-12-31"` |
| `equipment_id` | string (opc) | Filtrar a equipo especifico | `"10045678"` |

### Estructura de Registro de OT

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `wo_id` | string | Numero de orden de trabajo |
| `equipment_id` | string | Identificador del equipo |
| `order_type` | string | `PM01` (inspeccion), `PM02` (preventivo), `PM03` (correctivo) |
| `created_date` | date | Fecha de creacion |
| `planned_start` | date | Fecha inicio planificado |
| `planned_end` | date | Fecha fin planificado |
| `actual_start` | date/null | Fecha inicio real |
| `actual_end` | date/null | Fecha fin real |
| `actual_duration_hours` | float/null | Duracion real en horas |
| `is_failure` | boolean | True para eventos correctivos/averia |

## 3. Flujo de Ejecucion

### Paso 1: Calcular MTBF (Mean Time Between Failures)
1. Recopilar todas las fechas de evento de falla
2. Ordenar fechas en orden ascendente
3. Calcular intervalos entre fallas consecutivas: `interval[i] = failure_date[i+1] - failure_date[i]` (en dias)
4. `MTBF = SUM(intervalos) / COUNT(intervalos)`
5. Redondear a 1 decimal
- **Minimo 2 eventos de falla requeridos.** Si menos de 2, retornar `null`.
- Usar `actual_start` del registro; si null, usar `created_date`.
- Solo registros con `is_failure = true`.

### Paso 2: Calcular MTTR (Mean Time To Repair)
1. Recopilar duraciones de reparacion (`actual_duration_hours`) de registros de falla
2. Filtrar: mantener solo valores positivos (duracion > 0)
3. `MTTR = SUM(duraciones_validas) / COUNT(duraciones_validas)`
4. Redondear a 1 decimal
- Duraciones cero y negativas se excluyen.
- Si no existen duraciones validas, retornar `null`.

### Paso 3: Calcular Disponibilidad (Availability)
```
Availability = ((total_period_hours - total_downtime_hours) / total_period_hours) x 100
Availability = CLAMP(Availability, 0, 100)
Availability = ROUND(Availability, 1)
```
- Si `total_period_hours <= 0`, retornar `null`.
- Si no se provee, calcular como: `(period_end - period_start).days x 24`
- `total_downtime_hours` = SUM(`actual_duration_hours`) de registros de falla.

### Paso 4: Calcular OEE (Overall Equipment Effectiveness)
```
OEE = (Availability/100) x (Performance/100) x (Quality/100) x 100
OEE = CLAMP(OEE, 0, 100), ROUND(OEE, 1)
```
- **MVP defaults:** Performance = 100%, Quality = 100%.
- Si availability es null, OEE es null.

### Paso 5: Calcular Schedule Compliance
```
Schedule Compliance = (executed_on_time / planned_count) x 100
```
- Si `planned_count = 0`, retornar `null`.
- "A tiempo" = `actual_start is not null` AND `actual_start <= planned_end`.

### Paso 6: Calcular PM Compliance
```
PM Compliance = (pm_executed / pm_planned) x 100
```
- Si `pm_planned = 0`, retornar `null`.
- PM planned = registros con `order_type = "PM02"`.
- PM executed = PM02 con `actual_end is not null`.

### Paso 7: Calcular Reactive Ratio
```
Reactive Ratio = (corrective_count / total_count) x 100
```
- Si `total_count = 0`, retornar `null`.
- Correctivo = registros con `order_type = "PM03"`.

### Paso 8: Compilar y Reportar
Presentar todos los KPIs en tabla resumen con valor, unidad y rango objetivo.

## 4. Logica de Decision

### Procesamiento por Lote
```
1. SI equipment_id proporcionado: filtrar registros a ese equipo
2. Extraer failure_dates de registros donde is_failure = true
3. Extraer repair_durations de registros de falla con actual_duration_hours
4. Calcular total_period_hours (explicito o dias x 24)
5. Calcular total_downtime = SUM(actual_duration_hours) de fallas
6. Contar por tipo: PM01, PM02, PM03
7. Schedule compliance: planned vs on_time
8. PM compliance: PM02 planned vs executed
9. Calcular cada KPI con las formulas anteriores
```

### Tabla de Manejo de Nulos

| Condicion | Resultado |
|-----------|-----------|
| < 2 fechas de falla | MTBF = null |
| Sin duraciones positivas | MTTR = null |
| total_period_hours <= 0 | Availability = null |
| Availability es null | OEE = null |
| planned_count = 0 | Schedule Compliance = null |
| pm_planned = 0 | PM Compliance = null |
| total_count = 0 | Reactive Ratio = null |

### Benchmarks Industriales - Reactive Ratio

| Reactive Ratio | Evaluacion |
|----------------|------------|
| < 10% | Clase mundial |
| 10-25% | Bueno |
| 25-40% | Promedio |
| > 40% | Pobre -- exceso de mantenimiento reactivo |

### Tabla Resumen de KPIs

| KPI | Unidad | Rango Objetivo |
|-----|--------|---------------|
| MTBF | dias | Mayor es mejor |
| MTTR | horas | Menor es mejor |
| Availability | % | > 90% |
| OEE | % | > 85% (clase mundial) |
| Schedule Compliance | % | > 90% |
| PM Compliance | % | > 95% |
| Reactive Ratio | % | < 25% |

## 5. Validacion

1. **MTBF requiere >= 2 eventos de falla.** Una sola falla no produce intervalo.
2. **MTTR excluye duraciones cero y negativas.** Solo tiempos positivos son validos.
3. **Availability se limita a [0, 100].** Downtime negativo o mayor al periodo se maneja.
4. **OEE es multiplicativo, NO aditivo.** No sumar los tres factores.
5. **Tipos de orden deben ser PM01, PM02 o PM03.** Otros se cuentan en total pero no se categorizan.
6. **Definicion "a tiempo":** `actual_start <= planned_end` (no planned_start).
7. **Todos los porcentajes redondeados a 1 decimal.**
8. **Null vs Cero.** Null = no se puede calcular. Cero = calculado y el valor es 0. No intercambiar.

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Para contexto de formulas KPI y benchmarks |
| Procedimiento de Planificacion y Programacion | `../../knowledge-base/gfsn/ref-14-planning-scheduling-procedure.md` | Para definiciones de schedule/PM compliance |
| Motor de KPIs | `tools/engines/kpi_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **MTBF con < 2 fallas retorna null, no cero.** Una sola falla no da datos de intervalo.
2. **OEE es multiplicativo, no aditivo.** OEE de 90% availability, 85% performance, 99% quality es 75.7%, no 91.3%.
3. **Simplificacion MVP.** En MVP, performance y quality son 100%, asi que OEE = availability. Dejarlo claro en reportes.
4. **Definicion "a tiempo".** El chequeo es `actual_start <= planned_end`, no `actual_start <= planned_start`.
5. **Interpretacion reactive ratio.** 42.9% significa que casi la mitad del trabajo es no planificado.
6. **Null vs cero.** Null = "no se puede calcular". Cero = "calculado y el valor es 0".
7. **Calculo auto de horas periodo.** Si no se provee, horas = dias calendario x 24. Asume operacion 24/7.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
