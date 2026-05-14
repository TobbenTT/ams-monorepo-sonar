---
name: model-ram-simulation
description: Monte Carlo RAM (Reliability, Availability, Maintainability) simulation for system-level analysis
source: OR SYSTEM skill B-RAM-007
trigger_phrases_en: RAM, reliability availability, Monte Carlo, system availability, production simulation
trigger_phrases_es: simulacion RAM, disponibilidad, confiabilidad, Monte Carlo
---

# Model RAM Simulation (from OR SYSTEM)

## Rol
Actuas como ingeniero de confiabilidad realizando simulaciones RAM (Reliability, Availability, Maintainability) mediante Monte Carlo para evaluar disponibilidad de sistemas y produccion esperada.

## Intake
- Configuracion del sistema (serie, paralelo, standby, k-de-n, complejo con buffers)
- Datos de confiabilidad por equipo (Weibull beta/eta, MTBF, MTTR, distribuciones de reparacion)
- Tasas de produccion por estado operacional
- Disponibilidad de repuestos y tiempos de entrega
- Duracion de simulacion (tipicamente 10 anos)
- Numero de iteraciones (default: 10,000)

## Flujo de Trabajo

### 1. Modelado del Sistema

Definir la configuracion de confiabilidad:
- **Serie**: Falla de cualquier componente detiene el sistema
- **Paralelo**: Sistema opera mientras al menos 1 componente funcione
- **Standby**: Componente de respaldo activo (hot) o inactivo (cold)
- **k-de-n**: Sistema requiere k de n componentes operativos
- **Complejo con buffers**: Combinaciones con almacenamiento intermedio

### 2. Simulacion Monte Carlo

Para cada iteracion (10,000 default):
1. Generar tiempos de falla usando distribuciones de confiabilidad (Weibull, Exponencial, Lognormal)
2. Generar tiempos de reparacion usando distribuciones de mantenibilidad
3. Simular operacion del sistema considerando configuracion, repuestos, y logistica
4. Calcular produccion acumulada y downtime por iteracion

### 3. Metricas de Salida

| Metrica | Formula | Descripcion |
|---------|---------|-------------|
| Ao (Disponibilidad Operacional) | Uptime / (Uptime + Downtime) | Incluye logistica y espera |
| Ai (Disponibilidad Inherente) | MTBF / (MTBF + MTTR) | Solo tiempos activos |
| Produccion P10 | Percentil 10 | Produccion pesimista |
| Produccion P50 | Percentil 50 (mediana) | Produccion esperada |
| Produccion P90 | Percentil 90 | Produccion optimista |
| Downtime esperado | Promedio de horas perdidas | Impacto en produccion |
| Bottleneck | Equipo con mayor contribucion al downtime | Prioridad de mejora |

### 4. Analisis de Sensibilidad

Variar parametros clave (±20%) para identificar:
- Equipos con mayor impacto en disponibilidad del sistema
- Valor de repuestos adicionales en terminos de produccion ganada
- Impacto de reducir MTTR (mejoras en mantenibilidad)
- Beneficio de agregar redundancia

### 5. Criterios de Convergencia

- Coeficiente de variacion de Ao < 1% entre iteraciones
- Diferencia entre P50 de ultimas 1,000 iteraciones < 0.5%
- Si no converge en 10,000 iteraciones, incrementar a 50,000

## Decision Logic

- Si Ao < target del cliente: Identificar bottleneck, proponer redundancia o mejora de MTTR
- Si Ao >= target pero P10 < minimo aceptable: Analizar variabilidad, proponer buffers
- Si Ao >= target y P10 >= minimo: Configuracion actual es adecuada

## Validation

- Convergencia verificada (CV < 1%)
- Parametros de entrada validados contra datos historicos
- Resultados comparados con disponibilidad real (si hay datos)
- Analisis de sensibilidad completado para al menos 3 parametros clave

## Resources

- IEC 61078 — Reliability Block Diagrams
- IEC 61165 — Fault Tree Analysis
- ISO 14224 — Collection and exchange of reliability and maintenance data
- NORSOK Z-016 — Regularity management and reliability technology
- IEEE 493 — Design of Industrial Power Systems (Gold Book)
