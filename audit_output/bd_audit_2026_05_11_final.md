# Auditoría de Base de Datos — MAGEAM Production

**Fecha**: 2026-05-11
**Origen**: Hallazgos #1, #4 y #5 de la jornada presencial QA del 2026-05-08
**Entorno**: producción (`/app/data/ocp.db`)
**Backup**: creado automáticamente antes de aplicar cambios

---

## Resumen ejecutivo

| Hallazgo | Antes | Después | Acción |
|---|---|---|---|
| #1 Avisos duplicados | 52 (AV-00101 ×40 + AV-00102 ×12) | 0 | Renumerados a AV-00178…AV-00227 |
| #1 Huecos en secuencia | 50 (AV-00103…AV-00152) | 50 | **Sin acción** — data legacy migrada, sin impacto operativo |
| #4 EQUIPMENT sin TAG | 12 | 0 | Llenados con su `code` |
| #4 TAGs duplicados por planta | 0 | 0 | ✓ ya limpio |
| #4 TAGs con espacios / minúsculas / caracteres raros | 0 | 0 | ✓ ya limpio |
| #4 EQUIPMENT sin `sap_func_loc` | 28 | 28 | **Pendiente decisión** — completar manualmente con jerarquía SAP |
| #5 Idioma mezclado ES+EN en WRs | 0 | 0 | ✓ ya limpio |
| #5 Encoding roto (`Ã©`, `�`) | 0 | 0 | ✓ ya limpio |
| #5 WRs con descripción vacía | 0 | 0 | ✓ ya limpio |
| #5 Nodos con nombre mezclado | 0 | 0 | ✓ ya limpio |
| Otros: OTs huérfanas (sin WR) | 15 | 15 | **Sin acción** — son PMs preventivos PM01 cerrados (legítimos) |

**Total registros remediados**: 62 (50 avisos renumerados + 12 TAGs llenados).

---

## 1. Códigos de aviso (#1)

### Estado original

- **Total WRs**: 177
- **Con `aviso_number`**: 177/177 ✓
- **Duplicados encontrados**:
  - **AV-00101**: 40 registros (todos del seed inicial de Goldfields, 2026-03-30…04-09)
  - **AV-00102**: 12 registros (seed, 2026-04-09…04-11)
- **Huecos**: 1 bloque de AV-00103…AV-00152 (50 avisos faltantes)

### Acción aplicada

Se mantuvo el registro **más antiguo** (por `created_at`) con su `aviso_number` original, y se renumeraron los duplicados con números secuenciales nuevos a partir de `MAX(aviso_number) + 1` (AV-00178…AV-00227).

```sql
-- Patrón aplicado por bd_remediate_2026_05_11.py
UPDATE work_requests SET aviso_number = :new_num WHERE request_id = :rid;
```

### Sobre los huecos AV-00103…AV-00152

Decisión: **dejar como están**. Son la marca de la migración inicial desde el seeder de Goldfields, donde algunos números intermedios nunca se asignaron. Re-empacar la secuencia rompería referencias externas y no aporta valor (los huecos no causan errores funcionales).

---

## 2. TAGs en `hierarchy_nodes` (#4)

### Estado original

- **Total nodos**: 10 136
- **Tipo EQUIPMENT**: 9 042
- **Activos**: 10 136 (100%)
- **Issues**:
  - 12 EQUIPMENT sin TAG (pero con `code`)
  - 28 EQUIPMENT sin `sap_func_loc`

### Acción aplicada

Los 12 equipos sin TAG tenían `code` válido. Se copió el code al TAG:

| Nombre | TAG aplicado |
|---|---|
| Classifier #3 | BRY-CLS-003 |
| Flotation Cell #1 | FLT-FLC-001 |
| Conditioner #2 | FLT-CND-002 |
| Thickener #1 | SED-THK-001 |
| Belt Filter #1 | FIL-BFT-001 |
| Disc Filter #2 | FIL-DFT-002 |
| Rotary Dryer #1 | SEQ-DRY-001 |
| Belt Conveyor #1 | CVY-CVR-001 |
| Screw Conveyor #2 | CVY-SCR-002 |
| Stacker #1 | STK-STK-001 |
| Slurry Pump #1 | PMP-SLP-001 |
| Water Pump #2 | PMP-WTP-002 |

### Pendiente decisión: 28 EQUIPMENT sin `sap_func_loc`

No tienen jerarquía SAP asignada. Posibles vías:
- Completar manualmente cruzando con tablas maestras SAP del cliente.
- Marcar como `status=DRAFT` y excluirlos del flujo productivo hasta normalizar.

Recomendación: pedir a Goldfields su BD maestra de FuncLoc para completar de forma autoritativa.

---

## 3. Idioma y calidad de datos (#5)

### Heurísticas aplicadas

- **Idioma mezclado**: detección por presencia simultánea de stop-words ES (`el`, `la`, `equipo`, `falla`, …) y EN (`the`, `and`, `failure`, `engine`, …) en textos de >30 caracteres.
- **Encoding roto**: presencia de marcadores `Ã©`, `Ã¡`, `�`, `Â°` (artefactos de doble UTF-8).
- **Campos auditados**: `work_requests.problem_description`, `hierarchy_nodes.name`.

### Resultado: BD limpia

- 0 WRs con idioma mezclado
- 0 WRs con encoding roto
- 0 WRs con descripción vacía
- 0 nodos con nombre mezclado

La calidad de datos textuales es alta. No se requirió acción.

---

## 4. Verificaciones complementarias

### `managed_work_orders`

- **Total OTs**: 142
- **Números OT duplicados**: 0 ✓
- **OTs sin `work_request_id`**: 15 — **todos son del tipo `PM01` estrategia preventiva** (prefijo `OT-PM-STRAT-*`, status `CERRADO`). Esto es comportamiento esperado: los PMs preventivos generados desde el plan de mantenimiento estratégico no requieren un aviso de campo origen.

### Top 10 equipos con más Work Requests

| TAG | WRs | Comentario |
|---|---|---|
| `PMP-AGUA-01` | 12 | Bomba agua proceso — equipo de alto uso |
| `CVY-CV-001` | 11 | Conveyor principal |
| `THK-CNC-01` | 9 | Thickener concentrado |
| `PMP-SL-HP-002` | 8 | Bomba slurry HP |
| `COM-AIRE-02` | 8 | Compresor aire #2 |
| `CRU-CON-HP-01` | 7 | Chancador cono HP |
| `THK-REL-02` | 6 | Thickener relaves |
| `SUB-MT-P01` | 6 | Subestación MT |
| `PMP-REL-01` | 6 | Bomba relaves |
| `BRY-SAG-ML-002` | 6 | Molino SAG |

Concentración esperada en bombas, conveyors y molinos (equipos críticos de la cadena).

---

## 5. Scripts y trazabilidad

### Archivos generados

- **`scripts/bd_audit_2026_05_11.py`** — auditoría idempotente, sin escritura.
- **`scripts/bd_remediate_2026_05_11.py`** — remediación con flag `--apply` (default es dry-run). Hace backup automático del DB antes de cualquier commit.
- **`audit_output/bd_audit_2026_05_11.md`** — reporte original (pre-remediation).
- **`audit_output/bd_audit_2026_05_11_final.md`** — este documento.
- **`/app/data/ocp.YYYYMMDD_HHMMSS.bak`** — backup automático en el VPS.

### Reproducir

```bash
# Auditar (no escribe nada)
docker exec ocp-backend python /tmp/audit.py

# Remediar (dry-run primero)
docker exec ocp-backend python /tmp/remediate.py

# Aplicar de verdad (crea backup automático)
docker exec ocp-backend python /tmp/remediate.py --apply
```

---

## 6. Recomendaciones de proceso

Para evitar regresiones en futuras importaciones:

1. **Constraint UNIQUE en `aviso_number`** (actualmente solo es secuencial sin restricción de DB). El seeder debe verificar antes de insertar.
2. **Trigger** o **CHECK constraint** en `hierarchy_nodes` para que `tag NOT NULL` cuando `node_type='EQUIPMENT'`.
3. **Validación pre-merge** en CI: ejecutar `bd_audit_2026_05_11.py` contra una BD de prueba al hacer PR, fallar si detecta nuevos duplicados.
4. **Integración con ETL**: cuando se importan datos de SAP, validar `sap_func_loc` y rechazar/cuarentenar registros sin él.

---

*Cierre del ticket [SF-663](https://valuestrategyconsulting.atlassian.net/browse/SF-663): hallazgos #1 y #4 remediados, #5 sin issues, todo documentado.*
