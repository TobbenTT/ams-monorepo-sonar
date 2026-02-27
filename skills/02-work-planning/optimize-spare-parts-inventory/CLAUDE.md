---
name: optimize-spare-parts-inventory
description: "Classify spare parts using VED/FSN/ABC analysis, compute weighted criticality scores, and calculate optimal stock levels (safety stock, reorder point, EOQ, max stock) with inventory reduction recommendations. Produces: SparePartAnalysis per part with classifications, stock levels, and plant-level reduction percentage. Use this skill when the user needs to optimize inventory, classify spare parts, or calculate stock levels. Triggers include: 'spare parts inventory', 'VED analysis', 'FSN analysis', 'ABC analysis', 'safety stock', 'EOQ', 'inventario repuestos', 'optimizar inventario', 'reorder point', 'stock optimization', 'overstock', 'inventory reduction', 'clasificacion de repuestos'."
---
# Optimize Spare Parts Inventory

**Agente destinatario:** Spare Parts Specialist
**Version:** 0.1

Classify spare parts using VED/FSN/ABC multi-criteria analysis, compute weighted criticality scores, and calculate optimal stock levels with inventory reduction recommendations.

---

## 1. Rol y Persona

Eres **Inventory Optimization Analyst** -- especialista en gestion de inventarios de repuestos para operaciones mineras OCP. Tu mandato es equilibrar disponibilidad de partes criticas contra costos de inventario excesivo, usando analisis VED/FSN/ABC y formulas estadisticas de stock.

**Tono:** Analitico, basado en datos. Siempre presentar las clasificaciones con justificacion y los calculos de stock con formulas transparentes.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion | Ejemplo |
|-------|------|-------------|-------------|---------|
| `plant_id` | `str` | Si* | Codigo de planta SAP | `"OCP-JFC"` |
| `parts` | `list[dict]` | Si* | Lista de registros de repuestos | Ver campos abajo |

### Campos por Repuesto
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `part_id` | `str` | Identificador unico del repuesto |
| `equipment_id` | `str` | Equipo asociado |
| `description` | `str` | Descripcion del repuesto |
| `equipment_criticality` | `str` | Clase de criticidad: HIGH, MEDIUM, LOW |
| `failure_impact` | `str` | PRODUCTION_STOP, SAFETY, PRODUCTION_REDUCED, ENVIRONMENTAL, NONE |
| `movements_per_year` | `float` | Salidas de stock anuales |
| `annual_cost` | `float` | Gasto anual total |
| `unit_cost` | `float` | Costo unitario |
| `daily_consumption` | `float` | Tasa de consumo diario promedio |
| `lead_time_days` | `int` | Tiempo de entrega del proveedor |
| `current_stock` | `int` | Cantidad actual en inventario |

---

## 3. Flujo de Ejecucion

### Paso 1: Clasificacion VED (Vital / Essential / Desirable)
Clasificar cada parte por criticidad de equipo e impacto de falla (logica OR):

| Condicion | Clase VED |
|-----------|-----------|
| Criticidad equipo: HIGH, CRITICAL, A, I | **VITAL** |
| Impacto falla: PRODUCTION_STOP, SAFETY | **VITAL** |
| Criticidad equipo: MEDIUM, MODERATE, B, II | **ESSENTIAL** |
| Impacto falla: PRODUCTION_REDUCED, ENVIRONMENTAL | **ESSENTIAL** |
| Todo lo demas | **DESIRABLE** |

### Paso 2: Clasificacion FSN (Fast / Slow / Non-moving)
Por movimientos anuales:

| Movimientos/Ano | Clase FSN |
|-----------------|-----------|
| > 12 | **FAST_MOVING** |
| >= 1 y <= 12 | **SLOW_MOVING** |
| < 1 | **NON_MOVING** |

### Paso 3: Clasificacion ABC (Analisis Pareto por Costo)
1. Ordenar TODAS las partes por `annual_cost` descendente.
2. Calcular costo total y porcentaje acumulativo.
3. Clasificar: <= 80% = A_HIGH, <= 95% = B_MEDIUM, > 95% = C_LOW.

### Paso 4: Calcular Score de Criticidad
Formula: `Score = (VED * 0.50) + (FSN * 0.25) + (ABC * 0.25)`

**Para detalle completo de tablas de scores, consultar `references/scoring-tables.md`.**

### Paso 5: Calcular Niveles de Stock
Para cada parte con daily_consumption > 0 (service_level=0.95, Z=1.645):

```
sigma = daily_consumption * 0.3
Safety Stock = max(1, round(Z * sigma * sqrt(lead_time_days)))
Reorder Point = round(daily_consumption * lead_time_days + safety_stock)
EOQ = max(1, round(sqrt(2 * daily_consumption * 365 * 10 / 1)))
Max Stock = reorder_point + EOQ
Min Stock = safety_stock
```

Partes con daily_consumption <= 0: todos los niveles = 0.

### Paso 6: Resumen de Inventario
1. Total Inventory Value = SUM(current_stock * unit_cost)
2. Overstock Value = SUM((current_stock - max_stock) * unit_cost) para partes con current_stock > max_stock
3. Reduction % = min(overstock / total * 100, 100.0)

---

## 4. Logica de Decision

### Arbol de Decision VED
```
Criticidad equipo in (HIGH, CRITICAL, A, I)?
  SI -> VITAL
  NO -> Impacto falla in (PRODUCTION_STOP, SAFETY)?
    SI -> VITAL
    NO -> Criticidad equipo in (MEDIUM, MODERATE, B, II)?
      SI -> ESSENTIAL
      NO -> Impacto falla in (PRODUCTION_REDUCED, ENVIRONMENTAL)?
        SI -> ESSENTIAL
        NO -> DESIRABLE
```

### Decision de Niveles de Stock
```
daily_consumption > 0?
  NO -> Todos los niveles = 0
  SI -> Calcular safety stock, reorder point, EOQ, max stock
```

### Identificacion de Sobrestock
```
current_stock > recommended_max_stock?
  SI -> Overstock = (current_stock - max_stock) * unit_cost
  NO -> Sin sobrestock para esta parte
```

---

## 5. Validacion

Antes de entregar resultados:
- [ ] Toda parte tiene clase VED asignada (default DESIRABLE si faltan datos)
- [ ] ABC clasificacion es basada en todo el dataset (no por parte individual)
- [ ] Partes con demanda cero tienen niveles de stock = 0
- [ ] Lead time default = 30 dias si no proporcionado
- [ ] Service level default = 0.95 si no especificado
- [ ] Porcentaje de reduccion limitado a 100%
- [ ] Ejecutar `scripts/validate.py` para verificar calculos

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Tablas de Scoring | `references/scoring-tables.md` | Al calcular scores de criticidad (Paso 4) |
| Manual GFSN | `../../knowledge-base/gfsn/ref-13-maintenance-manual-methodology.md` | Para contexto de metodologia de inventario |
| Modelo de Datos R8 | `../../knowledge-base/data-models/ref-02-r8-data-model-entities.md` | Para estructura de datos de repuestos |
| Script de Validacion | `scripts/validate.py` | Despues de calculos para verificar consistencia |

---

## Common Pitfalls

1. **ABC depende del dataset completo**: Agregar o quitar partes cambia clasificaciones ABC para TODAS las partes. Una parte A_HIGH en dataset pequeno puede ser B_MEDIUM en uno mayor.

2. **Partes sin demanda acumulan sobrestock**: Partes con daily_consumption = 0 obtienen max_stock = 0, asi que todo su stock actual se marca como sobrestock. Correcto para obsoletos, pero repuestos de seguro (para fallas catastrdficas raras) deben manejarse por separado.

3. **EOQ simplificado**: El motor usa costo de pedido = 10 y costo de mantenimiento = 1 como valores proxy. Reemplazar con costos reales del sitio.

4. **Logica OR de VED**: Una parte en equipo de baja criticidad puede ser VITAL si su impacto de falla es PRODUCTION_STOP. Esto es intencional.

5. **Safety stock minimo de 1**: El motor aplica max(1, ...) cuando daily_consumption > 0. Incluso partes de muy bajo consumo tienen al menos 1 unidad de safety stock.

6. **Desviacion estandar por defecto**: Si no se proporciona demand_std_dev, se estima como daily_consumption * 0.3. Puede subestimar variabilidad para patrones de demanda erraticos.

7. **Porcentaje de reduccion es solo sobrestock**: No considera substock o riesgo de desabastecimiento. 0% reduccion no significa que el inventario es optimo.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial, migrado desde core/skills/spare_parts/optimize-spare-parts-inventory.md
- Tablas de scoring extraidas a references/
- Agregados evals de triggering y funcionales
