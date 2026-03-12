---
name: benchmark-maintenance-kpis
description: Benchmark maintenance KPIs against SMRP best practice and industry standards
source: OR SYSTEM skill MAINT-04
trigger_phrases_en: benchmark, KPI benchmark, SMRP, maintenance performance, industry comparison
trigger_phrases_es: benchmark, comparacion, KPIs mantenimiento, mejores practicas
---

# Benchmark Maintenance KPIs (from OR SYSTEM)

## Rol
Actuas como consultor de mantenimiento benchmarking KPIs operacionales contra estandares de la industria usando el framework SMRP Best Practice (5th Edition).

## Intake
- Datos de costos de mantenimiento (OPEX, materiales, mano de obra, contratos)
- Datos de produccion (tonelaje, horas operativas, disponibilidad)
- Ordenes de trabajo (backlog, completadas, pendientes, PM compliance)
- Valoracion de activos (RAV — Replacement Asset Value)
- Headcount de mantenimiento (planificadores, supervisores, tecnicos)
- Sector industrial (mineria, oil & gas, energia, agua, quimica)

## Flujo de Trabajo

### 1. Framework SMRP — 5 Pilares

**Pilar 1: Business & Management**
- Maintenance Cost as % of RAV (target: 2-5% segun industria)
- Maintenance Cost per Unit of Production
- Stores Investment as % of RAV (target: 0.5-1.5%)

**Pilar 2: Manufacturing Process Reliability**
- Overall Equipment Effectiveness (OEE = Availability x Performance x Quality)
- Production Plan Attainment
- Capacity Utilization

**Pilar 3: Equipment Reliability**
- MTBF (Mean Time Between Failures)
- MTTR (Mean Time To Repair)
- Failure Rate by equipment class
- PM/PdM Effectiveness (% of failures prevented)

**Pilar 4: Organization & Leadership**
- Maintenance Staff Ratio (technicians per $M RAV)
- Training Hours per Technician per Year
- Contractor vs Internal Labor Ratio

**Pilar 5: Work Management**
- PM Compliance (% of PM completed on time)
- Schedule Compliance (% of scheduled work completed)
- Planning Accuracy (planned vs actual hours)
- Reactive Maintenance Ratio (target: <20%)
- Backlog in Weeks of Work

### 2. Posicionamiento en Cuartiles

| Cuartil | Significado | Objetivo |
|:-------:|-------------|----------|
| Q1 | Top 25% — Best in class | Mantener, innovar |
| Q2 | Above median — Good | Cerrar gaps especificos a Q1 |
| Q3 | Below median — Average | Plan de mejora a 12 meses |
| Q4 | Bottom 25% — Poor | Intervencion urgente, accion inmediata |

### 3. Ajustes por Industria

| Industria | Maintenance Cost % RAV | Reactive % Target | PM Compliance Target |
|-----------|:---------------------:|:-----------------:|:-------------------:|
| Mineria | 3-5% | <25% | >85% |
| Oil & Gas | 1.5-3% | <15% | >90% |
| Energia | 2-4% | <20% | >88% |
| Agua | 2-3.5% | <20% | >85% |
| Quimica | 2-4% | <18% | >88% |

### 4. Traduccion a Impacto de Negocio

Cada brecha debe traducirse a:
- **Dolares**: Costo evitable o ahorro potencial
- **Horas**: Downtime reducible
- **Disponibilidad**: Puntos porcentuales de mejora
- **Riesgo**: Reduccion de exposicion a fallas criticas

### 5. Entregables

1. **Reporte de Benchmark** (.docx): Comparacion por pilar, brechas, recomendaciones
2. **Dashboard Workbook** (.xlsx): KPIs actuales vs targets, graficos de cuartil, tendencias
3. **Plan de Mejora**: Top 5 acciones priorizadas con ROI estimado

## Decision Logic

- Si Q4 en >3 pilares: Crisis — plan de estabilizacion a 90 dias
- Si Q3 en la mayoria: Mejora incremental — plan a 12 meses con quick wins
- Si Q2 con brechas especificas: Focalizacion — atacar 2-3 KPIs especificos
- Si Q1: Mantener liderazgo, benchmarking continuo, innovacion

## Validation

- Datos de al menos 12 meses para tendencias validas
- RAV actualizado (no mas de 3 anos de antiguedad)
- KPIs calculados con formulas SMRP estandar (no variantes internas)
- Benchmark contra industria correcta (no comparar mineria con farmaceutica)

## Resources

- SMRP Best Practices 5th Edition — Metrics reference
- EFNMS — European Federation benchmarks
- ISO 55000 — Performance evaluation (Clause 9.1)
- VSC Failure Modes Table — Para clasificacion de fallas en datos de confiabilidad
