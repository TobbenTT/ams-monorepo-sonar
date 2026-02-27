---
name: fit-weibull-distribution
description: "Use this skill when the user asks about Weibull analysis, failure distributions, beta parameters, failure patterns, reliability analysis, life data analysis, or distribucion de falla. Triggers: Weibull, failure distribution, beta parameter, failure pattern, reliability analysis, life data, distribucion de falla, shape parameter, scale parameter, characteristic life. Performs 2-parameter Weibull analysis using Rank Regression on Y (RRY) with Bernard median rank approximation. Classifies failures into Nowlan & Heap patterns (A-F), predicts failure windows, computes risk scores. All outputs DRAFT status requiring human validation."
---

# Fit Weibull Distribution

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad especializado en analisis estadistico de fallas. Tu trabajo es realizar analisis Weibull de 2 parametros sobre datos de intervalo de falla, estimar parametros de forma (beta) y escala (eta), clasificar el patron de falla segun Nowlan & Heap, predecir la ventana de falla y evaluar urgencia de riesgo. Todos los resultados se emiten como BORRADOR que requiere validacion humana.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `equipment_id` | string | Numero de equipo SAP (EQUNR) | `"10045678"` |
| `equipment_tag` | string | Tag tecnico | `"BRY-SAG-ML-001"` |
| `failure_intervals` | list[float] | Valores tiempo-hasta-falla en dias | `[120.0, 180.0, 95.0]` |
| `current_age_days` | float | Dias desde ultimo overhaul o instalacion | `145.0` |
| `confidence_level` | float | Confianza deseada (0.5 a 0.99, default: 0.9) | `0.9` |

## 3. Flujo de Ejecucion

### Paso 1: Validar Datos de Entrada
1. Contar intervalos de falla (`n`).
2. **Si n < 3:** No se puede hacer regresion significativa.
   - `beta = 1.0` (asumir aleatorio), `eta = max(failure_intervals)` o `365.0`, `r_squared = 0.0`
   - **Saltar a Paso 5**
3. **Si n >= 3:** Proceder con analisis Weibull completo.

### Paso 2: Ajustar Parametros Weibull (Metodo RRY)
**2.1: Ordenar y Rankear** - Ordenar intervalos ascendente. Asignar rango `i` (1, 2, ..., n).

**2.2: Calcular Rangos Medianos (Bernard)**
```
F(i) = (i - 0.3) / (n + 0.4)
```

**2.3: Linealizar para Regresion**
```
x[i] = ln(t[i])
y[i] = ln(ln(1 / (1 - F(i))))
```
Omitir puntos donde `t <= 0` o `F(i)` en frontera (0 o 1). Si < 2 pares validos, usar defaults.

**2.4: Regresion Lineal**
```
beta = (n_pts * sum_xy - sum_x * sum_y) / (n_pts * sum_x2 - sum_x^2)
intercept = (sum_y - beta * sum_x) / n_pts
eta = exp(-intercept / beta)
```

**2.5: Calcular R-Cuadrado**
```
r_squared = 1 - (ss_res / ss_tot)
```

**2.6: Aplicar Rangos Validos**
```
beta = MAX(0.1, beta), eta = MAX(1.0, eta), r_squared = CLAMP(0.0, 1.0)
```
Redondear: beta a 3 decimales, eta a 1 decimal, r_squared a 4 decimales.

### Paso 3: Clasificar Patron de Falla

| Rango Beta | Patron | Codigo | Implicacion de Estrategia |
|-----------|---------|--------|--------------------------|
| beta < 0.8 | Vida Temprana | `F_EARLY_LIFE` | Revisar calidad instalacion/comisionamiento |
| 0.8 <= beta < 1.2 | Aleatorio | `E_RANDOM` | Monitoreo por condicion es optimo |
| 1.2 <= beta < 1.5 | Estres | `D_STRESS` | Revisar condiciones operativas |
| 1.5 <= beta < 2.0 | Fatiga | `C_FATIGUE` | Monitoreo por condicion recomendado |
| 2.0 <= beta < 3.5 | Edad | `B_AGE` | Programar reemplazo antes de ventana predicha |
| beta >= 3.5 | Desgaste Bathtub | `A_BATHTUB` | Reemplazo a tiempo fijo recomendado |

### Paso 4: Calcular Confiabilidad y Predicciones
**4.1: Confiabilidad Actual:** `R(t) = exp(-(t / eta)^beta)` donde t = current_age_days.

**4.2: Vida Media (MTTF):** `mean_life = eta x Gamma(1 + 1/beta)`

**4.3: Ventana de Falla Predicha:**
```
target_reliability = 1 - confidence_level
t_pred = eta x (-ln(target_reliability))^(1/beta)
predicted_days = MAX(0, t_pred - current_age_days)
```

**4.4: Puntaje de Riesgo:**
```
risk_score = MIN(100, (current_age_days / mean_life) x 100)
```

### Paso 5: Generar Recomendacion
**Urgencia:** >= 80 URGENT, >= 60 HIGH, >= 40 MEDIUM, < 40 LOW.

**Formato:** `"[{URGENCIA}] Ventana de falla predicha: {predicted_days:.0f} dias. {consejo_patron}"`

### Paso 6: Estado = DRAFT
Todos los outputs son DRAFT. Nunca auto-aprobar predicciones Weibull.

## 4. Logica de Decision

### Arbol de Decision para Ajuste de Parametros
```
INPUT: failure_intervals
IF count < 3: beta=1.0, eta=MAX(values) o 365.0, r_squared=0.0 -> SKIP regresion
ELSE:
  Ordenar, calcular rangos medianos, linealizar, filtrar
  IF pares validos < 2: usar defaults -> SKIP regresion
  ELSE: Regresion lineal -> beta, eta, R^2
  Aplicar: beta >= 0.1, eta >= 1.0, 0 <= R^2 <= 1
```

### Mapeo Patron a Estrategia

| Patron | Estrategias Compatibles RCM |
|---------|--------------------------|
| `F_EARLY_LIFE` | Rediseno, mejora calidad (NO tiempo fijo) |
| `E_RANDOM` | Monitoreo condicion, busqueda fallas (NO tiempo fijo) |
| `D_STRESS` | Monitoreo condicion, revision operativa |
| `C_FATIGUE` | Monitoreo condicion preferido, tiempo fijo posible |
| `B_AGE` | Reemplazo tiempo fijo, monitoreo condicion |
| `A_BATHTUB` | Reemplazo tiempo fijo fuertemente recomendado |

### Interpretacion Calidad de Ajuste

| R-Cuadrado | Interpretacion |
|-----------|---------------|
| >= 0.95 | Excelente -- alta confianza |
| 0.85 - 0.95 | Bueno -- confianza razonable |
| 0.70 - 0.85 | Moderado -- usar con precaucion |
| < 0.70 | Pobre -- considerar distribuciones alternativas |
| 0.0 | Sin ajuste (datos default/insuficientes) |

## 5. Validacion

1. **Minimo 3 puntos de datos** para regresion Weibull significativa.
2. **Todos los intervalos deben ser positivos** (> 0). Cero o negativos se omiten.
3. **Beta piso en 0.1.** Beta negativo no tiene significado fisico.
4. **Eta piso en 1.0.** Vida caracteristica no puede ser < 1 dia.
5. **R-cuadrado limitado a [0, 1].**
6. **Nivel de confianza debe estar en [0.5, 0.99].**
7. **Todos los outputs son DRAFT.** Nunca auto-aprobar predicciones.
8. **Puntaje de riesgo tope en 100.**

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Para contexto de analisis estadistico de fallas |
| Motor Weibull | `tools/engines/weibull_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Menos de 3 puntos.** El motor retorna defaults (beta=1.0). No presentar como estadisticamente valido.
2. **Confundir interpretacion de beta.** Beta < 1 = tasa DECRECIENTE (vida temprana), no "bajo riesgo". Beta > 1 = tasa CRECIENTE.
3. **R-squared = 0 no significa "sin fallas."** Significa que la regresion no pudo producir ajuste significativo.
4. **Estado DRAFT es mandatorio.** Nunca presentar predicciones como acciones aprobadas.
5. **Ventana predicha puede ser 0.** Si el equipo ya excedio el punto predicho, la ventana es 0 dias -- urgencia critica.
6. **Puntaje de riesgo tope en 100.** Equipo significativamente mas viejo que vida media sigue en 100, no 150.
7. **Fronteras de patron son exclusivas/inclusivas.** Beta exactamente 0.8 es E_RANDOM. Beta exactamente 3.5 es A_BATHTUB.

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
