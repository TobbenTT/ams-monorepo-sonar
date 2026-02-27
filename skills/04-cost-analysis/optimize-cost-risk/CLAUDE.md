---
name: optimize-cost-risk
description: "Use this skill when the user asks about cost-risk optimization, OCR analysis, optimal PM interval, PM frequency optimization, total cost curve, maintenance interval optimization, or optimizacion costo riesgo. Triggers: cost risk optimization, OCR, optimal interval, PM frequency, total cost curve, maintenance interval, optimizacion costo riesgo, preventive maintenance interval, U-shaped cost, optimal PM. Finds the PM interval that minimizes total annual cost by balancing PM cost against failure risk-cost using Weibull reliability. Sweeps 7-730 days to find the minimum of the U-shaped total cost curve."
---

# Optimize Cost-Risk (OCR) -- Optimal PM Interval

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad especializado en optimizacion economica del mantenimiento preventivo. Tu trabajo es encontrar el intervalo de PM que minimiza el costo total anual, balanceando el costo de ejecutar PM contra el costo-riesgo de fallas inesperadas, usando modelado de confiabilidad Weibull.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `equipment_id` | str | Identificador del equipo | `"EQ-PUMP-101A"` |
| `failure_rate` | float | Tasa de falla anual (fallas/ano, >=0) | `2.5` |
| `mttr_hours` | float | Mean Time To Repair en horas (default: 4.0) | `8.0` |
| `cost_per_failure` | float | Costo total por falla (reparacion + perdida produccion) | `50000.00` |
| `cost_per_pm` | float | Costo por ejecucion PM (mano obra + materiales) | `2000.00` |
| `current_pm_interval_days` | int | Intervalo PM actual en dias (>=1, default: 90) | `90` |
| `beta` | float | Parametro forma Weibull (default: 2.0) | `2.0` |
| `eta` | float/None | Parametro escala Weibull en dias (default: auto) | `146.0` |

### Parametros Weibull

| Parametro | Simbolo | Significado | Valores Tipicos |
|-----------|---------|-------------|-----------------|
| Forma (beta) | Beta | Forma del patron de falla | <1 vida temprana; 1 aleatorio; >1 desgaste |
| Escala (eta) | Eta | Vida caracteristica (63.2% probabilidad falla) | Depende del equipo |

**Auto-calculo de eta:** `eta = 365.0 / failure_rate` (si > 0), sino `365.0`.

## 3. Flujo de Ejecucion

### Paso 1: Determinar Eta
- Si provisto, usar tal cual.
- Si no: `eta = 365.0 / failure_rate` (o `365.0` si failure_rate == 0).

### Paso 2: Inicializar Busqueda
- `best_interval = current_pm_interval_days`
- `best_cost = infinito`

### Paso 3: Barrer Intervalos Candidatos (7 a 730 dias)
Por cada `interval` de 7 a 730:

**Costo PM (anualizado):**
```
pm_cost = cost_per_pm * (365.0 / interval)
```

**Confiabilidad Weibull al intervalo:**
```
R(t) = exp(-(interval / eta)^beta)
```

**Costo de Falla (anualizado):**
```
failure_cost = failure_rate * cost_per_failure * (1 - R(interval))
```

**Costo Total:**
```
total_cost = pm_cost + failure_cost
```

Si `total_cost < best_cost`: actualizar best_cost y best_interval.

### Paso 4: Calcular Costo al Intervalo Actual
- Buscar en diccionario de costos o calcular directamente si fuera de rango 7-730.

### Paso 5: Calcular Porcentaje de Ahorro
```
savings_pct = ((current_cost - best_cost) / current_cost) * 100
savings_pct = max(0.0, savings_pct)
```

### Paso 6: Calcular Valores de Riesgo
```
risk_at_optimal = 1 - exp(-(best_interval / eta)^beta)
risk_at_current = 1 - exp(-(current_interval / eta)^beta)
```
Redondear a 4 decimales.

### Paso 7: Generar Recomendacion

| Condicion | Texto |
|-----------|-------|
| optimal < current | "Reducir intervalo PM de {current}d a {optimal}d (ahorra {savings}%)" |
| optimal > current | "Extender intervalo PM de {current}d a {optimal}d (ahorra {savings}%)" |
| optimal == current | "Intervalo actual de {current}d esta cerca del optimo" |

## 4. Logica de Decision

### Arbol de Decision de Recomendacion

```
Calcular optimal_interval via barrido:
  |
  +-- optimal < current?
  |     SI --> "Reducir intervalo" (fallas dominan, necesita PM mas frecuente)
  |     NO  |
  |         +-- optimal > current?
  |               SI --> "Extender intervalo" (costos PM dominan, reducir frecuencia)
  |               NO --> "Actual cerca del optimo"
```

### Forma de la Curva de Costo Total
```
Total Annual Cost(t) = C_pm * (365/t) + lambda * C_f * (1 - exp(-(t/eta)^beta))
```
- Intervalos MUY CORTOS: Costo PM domina, total ALTO.
- Intervalos MUY LARGOS: Costo falla domina, total ALTO.
- Intervalo OPTIMO: Minimo de la curva U.

### Cuando Usar Analisis OCR

| Situacion | Recomendacion |
|-----------|---------------|
| Equipo zona ACUTE en Jack-Knife | Ejecutar OCR para encontrar PM optimo |
| Bad actor por costo en Pareto | OCR para ver si optimizar PM reduce costo |
| Mantenimiento > 50% del LCC | OCR antes de decidir reemplazo |
| Comisionamiento equipo nuevo | OCR para establecer intervalo PM inicial |
| Cambio en tasa de falla | Re-ejecutar OCR para recalibrar |

### Analisis de Sensibilidad
- Variar un parametro +/-50% en 5 pasos.
- Parametros elegibles: failure_rate, cost_per_failure, cost_per_pm.
- Si valor base es 0, retorna solo resultado base.

## 5. Validacion

1. **Rango de barrido**: 7 a 730 dias (hardcoded).
2. **failure_rate >= 0.**
3. **cost_per_failure >= 0 y cost_per_pm >= 0.**
4. **current_pm_interval_days >= 1.**
5. **savings_pct >= 0** (piso en cero).
6. **Redondeo**: costos a 2 decimales, ahorros a 1 decimal, riesgos a 4 decimales.
7. **Beta default**: 2.0 (patron desgaste, comun en equipo mecanico).

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Seccion 7.5.1 -- Optimum Cost-Risk Analysis |
| Motor OCR | `tools/engines/ocr_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Beta = 1.0 = fallas aleatorias.** PM no afecta probabilidad (distribucion exponencial). OCR recomendara intervalo maximo. Correcto.
2. **Beta < 1.0 (fallas vida temprana).** PM empeora las cosas. OCR recomendara intervalo maximo. Considerar burn-in.
3. **Beta > 1.0 (desgaste).** PM es efectivo. Mayor beta = curva mas empinada = intervalos optimos mas cortos.
4. **Auto-calculo de eta simplificado.** `365/failure_rate` es aproximacion. Para resultados precisos, proveer eta de analisis Weibull real.
5. **Granularidad del barrido.** Revisa cada dia entero de 7 a 730. El optimo real (ej. 28.3 dias) se aproxima al dia mas cercano.
6. **cost_per_failure debe incluir todos los costos.** Reparacion directa, repuestos, perdida produccion, penalidades. Subestimar sesga hacia intervalos mas largos.
7. **Ahorro no puede ser negativo.** Piso en 0%. Si actual ya es optimo, savings = 0.
8. **Sensibilidad con valor base cero.** Si parametro = 0, sensibilidad retorna solo resultado base.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
