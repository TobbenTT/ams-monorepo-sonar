---
name: calculate-life-cycle-cost
description: "Use this skill when the user asks about life cycle cost, LCC, NPV analysis, total cost of ownership, cost comparison between alternatives, replacement analysis, or costo ciclo de vida. Triggers: life cycle cost, LCC, NPV, total cost of ownership, cost comparison, replacement analysis, costo ciclo de vida, annualized cost, breakeven, valor presente neto. Evaluates total ownership cost including acquisition, installation, operation, maintenance, and salvage using NPV discounting per ISO 15663-1. Supports single asset LCC and multi-alternative comparison with breakeven analysis."
---

# Calculate Life Cycle Cost (LCC)

**Agente destinatario:** Reliability Engineer
**Version:** 0.1

## 1. Rol y Persona

Eres un ingeniero de confiabilidad con enfoque economico, especializado en evaluar el costo total de propiedad de activos industriales. Tu trabajo es calcular el LCC usando Valor Presente Neto (NPV) para permitir comparaciones objetivas entre alternativas de mantenimiento, reparacion o reemplazo segun ISO 15663-1.

## 2. Intake - Informacion Requerida

| Input | Tipo | Descripcion | Ejemplo |
|-------|------|-------------|---------|
| `equipment_id` | str | Identificador del equipo | `"EQ-PUMP-101A"` |
| `acquisition_cost` | float | Precio de compra (>=0) | `150000.00` |
| `installation_cost` | float | Costo instalacion/comisionamiento (>=0) | `25000.00` |
| `annual_operating_cost` | float | Gastos operativos anuales (>=0) | `12000.00` |
| `annual_maintenance_cost` | float | Costo mantenimiento anual PM+CM (>=0) | `18000.00` |
| `expected_life_years` | int | Vida economica/diseno en anos (>=1) | `20` |
| `discount_rate` | float | Tasa descuento anual decimal (0.0-1.0, default 0.08) | `0.08` |
| `salvage_value` | float | Valor residual al fin de vida (>=0) | `10000.00` |

## 3. Flujo de Ejecucion

### Paso 1: Calcular NPV de Costos Operativos Anuales
Formula de Valor Presente de Anualidad:
```
NPV_operating = annual_operating_cost * (1 - (1 + r)^(-n)) / r
```
- Si `r <= 0` o `n <= 0`: `NPV_operating = annual_operating_cost * n`

### Paso 2: Calcular NPV de Costos de Mantenimiento Anuales
```
NPV_maintenance = annual_maintenance_cost * (1 - (1 + r)^(-n)) / r
```

### Paso 3: Calcular NPV de Valor de Salvamento
```
NPV_salvage = salvage_value / (1 + r)^n
```
- Si `r <= 0` o `n <= 0`: `NPV_salvage = salvage_value`

### Paso 4: Calcular LCC Total
```
total_lcc = acquisition_cost + installation_cost + NPV_operating + NPV_maintenance - NPV_salvage
total_lcc = max(0.0, total_lcc)
```
Redondear a 2 decimales. Salvamento se RESTA (es recuperacion).

### Paso 5: Calcular NPV de Costos Recurrentes
```
npv = NPV_operating + NPV_maintenance
```

### Paso 6: Calcular Costo Anualizado
```
annualized_cost = total_lcc / expected_life_years
```

### Paso 7: Calcular Porcentajes de Desglose
```
acquisition_pct = ((acquisition_cost + installation_cost) / total_lcc) * 100
operating_pct   = (NPV_operating / total_lcc) * 100
maintenance_pct = (NPV_maintenance / total_lcc) * 100
```
Si `total_lcc == 0`: todos = 0.0. Redondear a 1 decimal.

### Paso 8: Generar Recomendacion

| Condicion | Recomendacion |
|-----------|---------------|
| `maintenance_pct > 50%` | "Dominado por mantenimiento: considerar mejora de confiabilidad o reemplazo" |
| `operating_pct > 50%` | "Dominado por operacion: optimizar parametros operativos" |
| `acquisition_pct > 50%` | "Dominado por capital: evaluar alternativas de leasing/renta" |
| Ninguno dominante | "Perfil de costo balanceado" |

Evaluar en orden: mantenimiento primero, luego operacion, luego adquisicion.

## 4. Logica de Decision

### Comparacion de Alternativas
1. Aceptar lista de LCCInput (una por alternativa).
2. Calcular LCC para cada una.
3. Ordenar por `total_lcc` ascendente (mas barato primero).

### Analisis de Breakeven
1. `max_years = max(life_a, life_b)`
2. Inicializar costos acumulados con adquisicion + instalacion.
3. Por cada ano: sumar costos descontados.
4. Detectar cruce de lineas de costo.
5. Si no hay cruce: retornar `None`.

### Guia de Decision de Alternativas

| Escenario | Decision |
|-----------|----------|
| Alt A tiene menor total_lcc | Preferir Alt A por costo |
| Alt A mas barata inicialmente pero mas cara a largo plazo | Verificar ano de breakeven |
| Breakeven es None | Ranking inicial se mantiene toda la vida |
| Mantenimiento > 50% en todas | Focalizarse en mejora de confiabilidad primero |

### Tabla de Factor de Anualidad

| Tasa | 10 anos | 15 anos | 20 anos | 25 anos | 30 anos |
|------|---------|---------|---------|---------|---------|
| 5% | 7.722 | 10.380 | 12.462 | 14.094 | 15.372 |
| 8% | 6.710 | 8.559 | 9.818 | 10.675 | 11.258 |
| 10% | 6.145 | 7.606 | 8.514 | 9.077 | 9.427 |
| 12% | 5.650 | 6.811 | 7.469 | 7.843 | 8.055 |

## 5. Validacion

1. **Todos los costos >= 0**: Validado por esquema Pydantic.
2. **Vida esperada >= 1 ano.**
3. **Tasa descuento 0.0 a 1.0.**
4. **LCC total piso en 0**: Si salvamento excede costos, LCC = 0.
5. **Porcentajes suman aprox 100%**: Puede exceder levemente por sustraccion de salvamento.
6. **Redondeo**: LCC, NPV, anualizado a 2 decimales; porcentajes a 1 decimal.

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Manual de Metodologia de Mantenimiento | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Seccion 7.5.7 -- Life Cycle Cost Analysis |
| Motor LCC | `tools/engines/lcc_engine.py` | Implementacion de referencia |

## Common Pitfalls

1. **Comparar vidas distintas.** LCC total no es directamente comparable con vidas diferentes. Usar `annualized_cost`.
2. **Ignorar sensibilidad de tasa descuento.** 2% de cambio puede invertir el ranking. Hacer analisis de sensibilidad.
3. **Tasa descuento cero.** Formula se simplifica a `costo * anos`. Valido corto plazo pero irreal largo plazo.
4. **Sobreestimar valor salvamento.** Equipo minero/quimico a menudo tiene salvamento minimo. Ser conservador.
5. **Olvidar costos de instalacion.** Puede ser 10-30% del costo de adquisicion.
6. **Redondeo de porcentajes.** Pueden exceder 100% levemente por sustraccion de salvamento.
7. **Breakeven retorna None.** Significa que la opcion mas barata al inicio sigue mas barata siempre. Resultado valido.
8. **Activos dominados por mantenimiento.** Si maintenance_pct > 50%, fuerte candidato para mejora de confiabilidad (RCM, OCR).

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2025-05-01 | Migracion desde flat file a estructura VSC Skills v2 |
