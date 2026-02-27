---
name: detect-variance
description: "Use this skill when the user asks about multi-plant comparison, variance detection, benchmarking across plants, Z-score analysis, outlier identification, plant comparison, or varianza. Triggers: variance, multi-plant comparison, benchmark, Z-score, outlier, plant comparison, varianza, sigma, portfolio analysis, desviacion. Detects when a plant KPI diverges >2 sigma from portfolio mean, flagging outlier plants needing management attention. Uses population standard deviation (not sample). Supports single-metric and multi-metric modes. Returns NORMAL, WARNING (2-3 sigma), or CRITICAL (>3 sigma) alerts with plant ranking."
---

# Detect Multi-Plant Variance

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un analista de confiabilidad a nivel corporativo, especializado en comparar el desempeno de multiples plantas de una cartera industrial. Tu trabajo es detectar cuando los KPIs de una planta se desvian significativamente (>2 sigma) de la media del portafolio, generando alertas que requieren atencion gerencial. Trabajas con datos de OCP que tiene 15 plantas con flujos de trabajo heterogeneos.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `snapshots` | list[PlantMetricSnapshot] | Valores de metrica por planta | Ver abajo |
| `warning_threshold` | float | Umbral sigma para WARNING (default: 2.0) | `2.0` |
| `critical_threshold` | float | Umbral sigma para CRITICAL (default: 3.0) | `3.0` |
| `all_snapshots` (multi-metrica) | dict[str, list] | Dict de nombre_metrica a lista de snapshots | `{"MTBF": [...]}` |

### Campos PlantMetricSnapshot

| Campo | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `plant_id` | str | ID unico de planta | `"PLANT-JFC-01"` |
| `plant_name` | str | Nombre legible | `"Jorf Fertilizer Complex"` |
| `metric_name` | str | KPI medido | `"MTBF"` |
| `metric_value` | float | Valor numerico | `245.7` |
| `period_start` | date | Inicio periodo | `2025-01-01` |
| `period_end` | date | Fin periodo | `2025-03-31` |

## 3. Flujo de Ejecucion

### Paso 1: Validar Cantidad Minima de Plantas
- Verificar que snapshots >= 3. Si menos de 3, retornar lista vacia.

### Paso 2: Extraer Valores de Metrica
- De cada snapshot, extraer `metric_value`. Construir lista de floats.

### Paso 3: Calcular Estadisticas del Portafolio
- **Media poblacional:** `mean = sum(values) / n`
- **Desviacion estandar poblacional (NO muestral):**
  ```
  variance = sum((v - mean)^2 for v in values) / n
  std = sqrt(variance)
  ```
- Redondear: mean a 2 decimales, std a 4 decimales.

### Paso 4: Verificar Desviacion Estandar Cero
- Si `std == 0`, todas las plantas son identicas -- retornar lista vacia.

### Paso 5: Calcular Z-Score por Planta
```
z = (plant_value - mean) / std
```
Redondear a 2 decimales.

### Paso 6: Clasificar Nivel de Varianza
- `abs_z < warning_threshold` (2.0): **SKIP** -- sin alerta.
- `abs_z >= critical_threshold` (3.0): **CRITICAL**
- Entre warning y critical: **WARNING**

### Paso 7: Determinar Direccion
- z > 0: `"above"` (por encima de la media)
- z < 0: `"below"` (por debajo de la media)

### Paso 8: Generar Mensaje de Alerta
```
"{plant_name}: {metric_name} is {abs_z:.1f} sigma {direction} portfolio mean ({plant_value:.1f} vs {mean:.1f})"
```

### Paso 9: Construir Alertas y Retornar

## 4. Logica de Decision

### Arbol de Clasificacion de Varianza

```
Input: abs_z (Z-score absoluto)
  |
  +-- abs_z < 2.0? --> Sin alerta. Planta en rango normal.
  |
  +-- abs_z >= 3.0? --> CRITICAL
  |
  +-- else --> WARNING
```

### Tabla de Interpretacion Z-Score

| Rango Z-Score | Nivel | Significado | Accion |
|---------------|-------|-------------|--------|
| -2.0 a +2.0 | NORMAL | Dentro de 2 sigma (95.4%) | Sin accion |
| +/-2.0 a +/-3.0 | WARNING | Fuera de 2 sigma | Investigar |
| > +3.0 o < -3.0 | CRITICAL | Fuera de 3 sigma (99.7%) | Atencion inmediata |

### Interpretacion de Direccion

| Direccion | Tipo de Metrica | Significado |
|-----------|----------------|-------------|
| `above` | Costos | Peor que pares (costo mayor) |
| `above` | MTBF | Mejor que pares (mayor confiabilidad) |
| `below` | Availability | Peor que pares (menor disponibilidad) |
| `below` | Costos | Mejor que pares (menor costo) |

### Ranking de Plantas
1. Ordenar snapshots por `metric_value` descendente.
2. Asignar rango 1, 2, 3, etc.

## 5. Validacion

1. **Minimo 3 plantas**: Menos retorna lista vacia.
2. **Std no-cero**: Valores identicos = sin alertas.
3. **Std poblacional (no muestral)**: Denominador es `n`, NO `n-1`.
4. **Umbrales deben satisfacer**: `warning_threshold < critical_threshold`.
5. **Redondeo**: Mean a 2 decimales, std a 4 decimales, z-score a 2 decimales.

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Recomendaciones Estrategicas | `../../knowledge-base/strategic/ref-12-strategic-recommendations.md` | Para contexto de Recomendacion 7 -- Deteccion de Varianza Multi-Planta |
| Motor de Varianza | `tools/engines/variance_detector.py` | Implementacion de referencia |

## Common Pitfalls

1. **Usar std muestral en vez de poblacional.** El motor usa `/ n`, NO `/ (n-1)`. Correcto para portafolio completo.
2. **Ignorar el minimo de 3 plantas.** Con 2 plantas, una siempre parece outlier. El motor retorna lista vacia.
3. **Confundir direccion con bueno/malo.** z = +3.0 en metrica de costo es PEOR, pero z = +3.0 en MTBF es MEJOR.
4. **Orden de umbrales.** `warning_threshold > critical_threshold` haria WARNING inalcanzable.
5. **Metrica unica vs multi-metrica.** Usar `detect_variance` para un KPI, `detect_multi_metric` para varios simultaneos.
6. **Valores identicos.** Si todas las plantas reportan el mismo valor, std = 0, sin alertas. Comportamiento correcto.
7. **Artefactos de redondeo.** Z-score de 1.999 redondea a 2.00 y activa WARNING.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
