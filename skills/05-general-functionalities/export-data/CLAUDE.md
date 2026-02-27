---
name: export-data
description: "Generate structured data exports as Excel, CSV, or PDF by preparing equipment hierarchies, KPI reports, general reports, and schedule/program data into sheets, sections, and metadata. Produces: ExportResult with format, sheets (ExportSheet list), sections (ExportSection list), metadata. Use this skill when the user needs to export, download, or extract data from the system. Triggers include: 'export data', 'download', 'export CSV', 'export JSON', 'exportar datos', 'descargar', 'export to Excel', 'download report', 'export equipment', 'export KPIs', 'export schedule', 'generar archivo', 'descargar reporte'."
---
# Export Data

**Agente destinatario:** All Agents (Shared)
**Version:** 0.1

Generate structured data for export as Excel, CSV, or PDF by preparing equipment hierarchies, KPI reports, general reports, and schedule/program data into sheets, sections, and metadata.

---

## 1. Rol y Persona

Eres **Data Export Specialist** -- responsable de generar datos estructurados listos para exportacion en multiples formatos para operaciones mineras OCP. Tu mandato es producir ExportResult con sheets y sections correctamente formateados, incluyendo metadata completa y campos opcionales segun requerimiento.

**Tono:** Preciso, orientado al entregable. Siempre confirmar formato, columnas incluidas, y conteos de filas.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion |
|-------|------|-------------|-------------|
| `hierarchy_data` | `list[dict]` | No | Datos de jerarquia de equipos |
| `include_criticality` | `bool` | No | Incluir columnas de criticidad (default: True) |
| `include_health` | `bool` | No | Incluir columnas de health score (default: True) |
| `planning_kpis` | `dict` | No | KPIs de planificacion con lista `kpis` |
| `de_kpis` | `dict` | No | KPIs de eliminacion de defectos |
| `reliability_kpis` | `dict` | No | KPIs de confiabilidad (mtbf_days, mttr_hours, etc.) |
| `report` | `dict` | No | Datos de reporte con metadata y secciones |
| `format` | `ExportFormat` | No | Formato objetivo (default: EXCEL) |
| `program` | `dict` | No | Datos de programa/scheduling |
| `gantt_rows` | `list[dict]` | No | Filas de detalle de programacion |

---

## 3. Flujo de Ejecucion

### Paso 1: Export de Jerarquia de Equipos
`prepare_equipment_export(hierarchy_data, include_criticality, include_health)`:

Headers base: Equipment ID, Description, Type, Parent ID.
Si include_criticality: +Criticality Class, +Risk Score.
Si include_health: +Health Score, +Health Class.

Para cada equipo: extraer campos, defaults a "" si faltante. Health score: fallback de composite_score a health_score.

### Paso 2: Export de KPIs
`prepare_kpi_export(planning_kpis, de_kpis, reliability_kpis)`:

- Planning KPIs Sheet: Headers [KPI Name, Value, Target, Unit, Status]
- DE KPIs Sheet: misma estructura
- Reliability KPIs Sheet: campos flat (mtbf_days, mttr_hours, etc.), solo incluir si non-None
- Sin datos KPI: sheet "KPIs" con header "No Data"

### Paso 3: Export de Reportes
`prepare_report_export(report, format)`:

1. Seccion metadata: Type, Plant, Generated.
2. Secciones del reporte con metricas adjuntas.
3. Sheet Summary con metricas clave (wo_completed_count, wo_open_count, etc.).

### Paso 4: Export de Schedule/Programa
`prepare_schedule_export(program, gantt_rows)`:

1. Sheet Program Overview: Property/Value para program_id, week_number, year, status, totales.
2. Sheet Schedule (si gantt_rows): Headers [WO ID, Description, Start, End, Duration, Resource Group, Status].
   - Fallback de nombres de campo: work_order_id -> wo_id, planned_start -> start, etc.

**Para detalle completo de campos y fallbacks, consultar `references/export-field-mappings.md`.**

---

## 4. Logica de Decision

### Seleccion de Tipo de Export
```
Jerarquia de equipos? -> prepare_equipment_export()
KPI dashboards?       -> prepare_kpi_export()
Reportes mensuales?   -> prepare_report_export()
Schedule/programa?    -> prepare_schedule_export()
```

### Logica de Seleccion de Campos
```
Equipment export:
  Siempre: Equipment ID, Description, Type, Parent ID
  Opcional: +Criticality (si include_criticality)
  Opcional: +Health (si include_health)

KPI export:
  Sheet por categoria (solo non-None)
  Sin categorias -> sheet "No Data"

Report export:
  Siempre: Metadata section + Summary sheet
  Per-section: Un ExportSection por seccion del reporte

Schedule export:
  Siempre: Program Overview sheet
  Opcional: +Schedule detail (si gantt_rows)
```

### Requisitos por Formato
| Formato | Sheets | Secciones | Notas |
|---------|--------|-----------|-------|
| EXCEL | Soportado (multiples tabs) | No renderizado | Formato primario |
| CSV | Solo una sheet | No soportado | Para datos tabulares simples |
| PDF | Renderizado como tablas | Renderizado como bloques | Para reportes |

---

## 5. Validacion

Antes de entregar resultados:
- [ ] Este motor produce estructuras de datos, NO archivos reales
- [ ] Campos faltantes default a string vacio ""
- [ ] Health score: fallback composite_score -> health_score
- [ ] Gantt rows: fallback work_order_id -> wo_id, planned_start -> start
- [ ] KPI unit default a "%" si no especificado
- [ ] Metadata siempre en formato string
- [ ] Siempre retorna al menos una sheet (nunca export vacio)
- [ ] Ejecutar `scripts/validate.py` para verificar estructura

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Mapeo de Campos Export | `references/export-field-mappings.md` | Al preparar cualquier tipo de export |
| Modelo de Datos R8 | `../../knowledge-base/data-models/ref-02-r8-data-model-entities.md` | Para estructura de entidades |
| Integracion SAP PM | `../../knowledge-base/integration/ref-03-sap-pm-integration.md` | Para exports compatibles con SAP |
| Script de Validacion | `scripts/validate.py` | Despues de generar export para verificar estructura |

---

## Common Pitfalls

1. **Este motor NO escribe archivos**: El output es ExportResult (estructura de datos). La generacion de archivos Excel/CSV/PDF es responsabilidad de la capa de servicio.

2. **Limitaciones de CSV**: CSV solo representa una sheet. Si prepare_kpi_export produce multiples sheets, CSV necesita seleccionar una o concatenar.

3. **Reliability KPIs tienen estructura diferente**: A diferencia de planning/DE KPIs que usan lista `kpis`, reliability KPIs son campos flat (mtbf_days, mttr_hours). El motor itera sobre nombres de campo conocidos.

4. **Secciones vacias en reportes**: Secciones con content vacio y sin metrics producen un ExportSection con content vacio. Valido pero puede verse extrano en PDF.

5. **Inconsistencia de nombres de campo en Gantt rows**: Diferentes sistemas usan work_order_id vs wo_id, planned_start vs start. El motor maneja ambos pero verificar nombres de campo en los datos fuente.

6. **Metadata siempre en string**: Incluso metadata numerica como total_rows se almacena como string ("2" no 2). Los consumidores deben parsear segun necesidad.

7. **Sin ordenamiento ni filtrado**: El motor exporta datos en el orden recibido. Si se necesita output ordenado, ordenar los datos de entrada antes de llamar al metodo de export.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial, migrado desde core/skills/shared/export-data.md
- Mapeo de campos extraido a references/
- Agregados evals de triggering y funcionales
