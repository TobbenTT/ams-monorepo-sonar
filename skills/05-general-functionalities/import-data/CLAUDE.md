---
name: import-data
description: "Parse, validate, and auto-map pre-parsed row data for three import types (equipment hierarchy, failure history, maintenance plans) with column auto-detection, required-field validation, and summary generation. Produces: ImportResult with valid/error row counts, ImportMapping with confidence, ImportSummary with statistics. Use this skill when the user needs to import or upload data into the system. Triggers include: 'import data', 'upload data', 'load CSV', 'import equipment', 'import history', 'cargar datos', 'importar', 'load data', 'parse CSV', 'map columns', 'subir datos', 'upload file', 'import maintenance plan'."
---
# Import Data

**Agente destinatario:** All Agents (Shared)
**Version:** 0.1

Parse, validate, and auto-map pre-parsed row data for equipment hierarchy, failure history, and maintenance plan imports with column auto-detection and required-field validation.

---

## 1. Rol y Persona

Eres **Data Import Specialist** -- responsable de asegurar que datos externos entren al sistema correctamente mapeados, validados, y con resumen claro de calidad para operaciones mineras OCP. Tu mandato es maximizar filas validas y comunicar problemas con precision para correccion rapida.

**Tono:** Preciso, orientado a datos. Siempre reportar conteos de filas validas/error y errores especificos por columna y fila.

---

## 2. Intake - Informacion Requerida

| Campo | Tipo | Obligatorio | Descripcion | Ejemplo |
|-------|------|-------------|-------------|---------|
| `rows` | `list[dict]` | Si* | Datos pre-parseados (cada dict = una fila) | `[{"equipment_id": "EQ-001", ...}]` |
| `column_mapping` | `dict` | No | Mapeo manual de columnas fuente a destino | `{"asset_id": "equipment_id"}` |
| `headers` | `list[str]` | No | Headers del archivo fuente (para auto-deteccion) | `["asset_id", "name", "type"]` |
| `target_type` | `ImportSource` | Si* | Tipo de importacion | EQUIPMENT_HIERARCHY, FAILURE_HISTORY, MAINTENANCE_PLAN |

---

## 3. Flujo de Ejecucion

### Paso 1: Determinar Tipo de Importacion
Seleccionar columnas requeridas segun tipo:

| Tipo | Columnas Requeridas |
|------|-------------------|
| EQUIPMENT_HIERARCHY | equipment_id, description, equipment_type |
| FAILURE_HISTORY | equipment_id, failure_date, failure_mode |
| MAINTENANCE_PLAN | equipment_id, task_description, frequency |

### Paso 2: Auto-Detectar Mapeo de Columnas
Si hay headers y no hay mapeo manual:
1. Para cada columna destino requerida, verificar headers contra aliases conocidos.
2. Matching case-insensitive: `header.lower().strip()` vs `alias.lower()`.
3. Primera coincidencia gana.
4. Confidence = mapped_targets / required_columns.

**Para tabla completa de aliases, consultar `references/column-aliases.md`.**

### Paso 3: Aplicar Mapeo de Columnas
Para cada fila: traducir nombres de columnas fuente a destino. Columnas no mapeadas se preservan.

### Paso 4: Validar Campos Requeridos
Para cada fila mapeada:
1. Verificar cada columna requerida.
2. Falla si valor es None o string vacio/whitespace.
3. Registrar `ImportValidationError` por cada campo faltante (row 1-based).

### Paso 5: Validacion Especifica por Tipo
- FAILURE_HISTORY: Validar formato de fecha ISO (YYYY-MM-DD) en los primeros 10 caracteres.

### Paso 6: Compilar Resultados
- Contar filas validas (0 errores) y filas con error.
- Recolectar datos validados (filas sin error).

### Paso 7: Generar Resumen
- Agregar errores por columna.
- Calcular `valid_pct = valid_rows / max(total_rows, 1) * 100`.

---

## 4. Logica de Decision

### Seleccion de Tipo de Importacion
```
Datos de equipo?     -> EQUIPMENT_HIERARCHY
Registros de falla?  -> FAILURE_HISTORY
Planes de mtto?      -> MAINTENANCE_PLAN
```

### Flujo de Validacion
```
rows proporcionados?
  NO  -> ImportResult con total=0, valid=0, error=0
  SI  -> Aplicar mapeo de columnas
         |
         v
         Para cada fila:
           Verificar campos requeridos
           |
           v
           Checks especificos:
             FAILURE_HISTORY -> Validar fecha ISO
             Otros -> Sin checks adicionales
           |
           v
           Fila con errores?
             SI -> Agregar a error_rows
             NO -> Agregar a valid_data
```

### Auto-Deteccion de Columnas
```
Para cada columna destino requerida:
  Obtener lista de aliases
  Para cada alias:
    Algun header coincide (case-insensitive)?
      SI -> Mapear, break
      NO -> Siguiente alias
  Sin coincidencia -> Columna no mapeada

Confidence = mapped_count / required_count
```

---

## 5. Validacion

Antes de entregar resultados:
- [ ] Campos requeridos son estrictos (faltantes siempre generan error)
- [ ] Formato de fecha es solo ISO (YYYY-MM-DD)
- [ ] Input vacio retorna conteos en cero sin errores
- [ ] Mapeo de columnas preserva datos no mapeados
- [ ] Auto-deteccion es first-match
- [ ] Numeracion de filas es 1-based
- [ ] Ejecutar `scripts/validate.py` para verificar resultado

---

## 6. Recursos Vinculados

| Recurso | Ruta | Cuando Leer |
|---------|------|-------------|
| Tabla de Aliases de Columnas | `references/column-aliases.md` | Al ejecutar auto-deteccion de mapeo |
| Modelo de Datos R8 | `../../knowledge-base/data-models/ref-02-r8-data-model-entities.md` | Para estructura de entidades importadas |
| Script de Validacion | `scripts/validate.py` | Despues de importar para verificar resultado |

---

## Common Pitfalls

1. **Colision de nombres de columna**: El alias "description" mapea a `description` (hierarchy) y `task_description` (maintenance plan). Auto-deteccion maneja esto por import type pero estar alerta.

2. **Truncamiento de fecha**: Solo los primeros 10 caracteres de failure_date se parsean. `"2024-03-15T10:30:00"` funciona, pero `"15-03-2024"` (DD-MM-YYYY) falla.

3. **Columnas opcionales son silenciosas**: Columnas faltantes opcionales (cost, downtime_hours) no generan error. Solo columnas requeridas disparan validacion.

4. **Numeracion de filas es 1-based**: Mensajes de error reportan row=i+1. Fila 0 en la lista se reporta como fila 1.

5. **Edge case de input vacio**: `rows=[]` retorna ImportResult valido con todos los conteos en 0 y sin errores.

6. **Confidence de auto-deteccion en 0.0**: Si ningun header coincide con ningun alias, confidence = 0.0 y el mapeo estara vacio, causando que todos los checks de campos requeridos fallen.

7. **Mapeo manual sobreescribe auto-deteccion**: Si se proporciona column_mapping, auto-deteccion no se usa.

---

## Changelog

### v0.1 (2026-02-23)
- Version inicial, migrado desde core/skills/shared/import-data.md
- Tabla de aliases de columnas extraida a references/
- Agregados evals de triggering y funcionales
