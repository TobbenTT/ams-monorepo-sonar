---
name: analyze-work-order
description: >
  Use this skill when a planner or supervisor needs the AI to read a complete work order
  (header, operations, materials, support equipment, audit log, comments) and produce
  structured analysis covering 7 functions: (1) executive summary with metrics,
  (2) HH real vs plan prediction, (3) operational risk detection, (4) optimal skill-mix
  recommendation, (5) missing material suggestion, (6) safety alerts (LOTO/ATEX/work-at-height),
  (7) post-close root-cause hint that feeds RCA. The agent never auto-applies — it returns
  suggestions that a human confirms via the OT modal "Aplicar sugerencia" buttons.
  Triggers EN: analyze work order, AI work order analysis, predict hours, suggest skill mix,
  missing materials, safety alerts work order, root cause hint.
  Triggers ES: analizar OT, IA OT, predecir horas, sugerir cuadrilla, materiales faltantes,
  alertas seguridad OT, causa raíz sugerida.
---

# Analyze Work Order

**Agente destinatario:** Planning Specialist (AG-003)
**Version:** 0.1 (SF-661 partial scaffold — function #1 implemented, #2–#7 stubbed)
**Estado:** SP8 backlog. Requiere data real de planta para tunear pesos/umbrales.

## 1. Rol y Persona

You are a Planning Specialist analyzing a managed work order end-to-end. You read the full
context (header, operations, materials, support equipment, comments, audit log) and produce
structured suggestions a human planner can accept or reject. You NEVER mutate the OT directly.

## 2. Intake — Información Requerida

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `wo` | object | Yes | Full managed_work_order dict (header + operations + materials + support_equipment) |
| `audit_log` | list | Yes | Recent audit entries for this `wo_id` (chronological) |
| `comments` | list | No | User comments (text/audio transcript/photo captions) |
| `history` | list | No | Up to 5 closed OTs for same equipment (RAG retrieval, optional) |
| `mode` | enum | Yes | `pre_execution` (before EN_EJECUCION) or `post_close` (after CERRADO) |

## 3. Las 7 Funciones

### Función 1 — Resumen Ejecutivo (IMPLEMENTADO v0.1)
Output: bloque de 4 frases máximo + métricas duras.
- Frase 1: identidad (tipo de OT + equipo + criticidad).
- Frase 2: scope (qué se hará, cuántas operaciones, HH estimadas).
- Frase 3: recursos comprometidos (cuántos técnicos, qué especialidades, ventana programada).
- Frase 4: estado actual + bloqueadores conocidos (orphan? sin materiales? sin support_eq?).
- Métricas: `n_operations`, `total_hh_est`, `n_workers_assigned`, `n_materials_reserved`,
  `n_support_eq`, `days_in_current_status`, `priority_code`, `priority_band`.

### Función 2 — Predicción HH Real vs Plan (STUB)
Requiere: histórico de OTs cerradas del mismo equipo o mismo task_type (RAG).
Output esperado: `{predicted_hh, plan_hh, delta_pct, confidence, similar_wos: [...]}`.
Algoritmo propuesto: regresión simple sobre `(hh_actual / hh_planned)` agrupado por `wo_type`
y `equipment_class`. Pendiente data real (0B2).

### Función 3 — Detección de Riesgos Operacionales (STUB)
Output: lista de riesgos `[{severity, category, message, mitigation_hint}]`.
Reglas mínimas (deterministas, sin LLM):
- Solapamiento de turno: técnico DAY asignado a slot NIGHT → `severity=HIGH`.
- Sobrecapacidad: técnico con >40h/semana → `severity=MEDIUM`.
- OT crítica (AA) sin LOTO en checklist → `severity=CRITICAL`.
- Material reservado pero `reservation_code` huérfano (no existe en SAP mock) → `severity=MEDIUM`.

### Función 4 — Skill Mix Óptimo (STUB)
Input adicional: matriz de skills por operación.
Output: `{recommended_workers: [{worker_id, role, why}], gaps: [...]}`.
Pendiente catálogo de skills por técnico (existe parcial en `workers.specialty`).

### Función 5 — Materiales Faltantes (STUB)
Heurística: si la OT tiene operación REPLACE pero `materials` está vacío → flag.
Si la operación menciona "rodamiento", "sello", "filtro" en el texto y no hay material → sugerir
desde catálogo via match por descripción.

### Función 6 — Alertas Seguridad (STUB)
- Trabajo en altura → requiere arnés + permiso (verificar checklist).
- ATEX zone (definida en equipment) → requiere ATEX-certified tools.
- LOTO requerido si `equipment.power_source != none` y operación NO es VISUAL_INSPECTION.

### Función 7 — Causa Raíz Post-Cierre (STUB)
Solo se activa con `mode=post_close`.
Lee comentarios del técnico + RCA si existe + histórico.
Sugiere top-3 causas raíz candidatas con confidence.
Alimenta el módulo RCA via `POST /rca/draft-from-wo`.

## 4. Flujo de Ejecución (v0.1)

**Step 1:** Cargar `wo` completo via `GET /managed-work-orders/{wo_id}` con `include=operations,materials,support_equipment,audit`.

**Step 2:** Computar métricas duras (función 1):
```python
n_operations = len(wo.get("operations", []))
total_hh_est = sum(op.get("hours", 0) * op.get("quantity", 1) for op in wo.get("operations", []))
n_workers_assigned = len(wo.get("assigned_workers", []))
# ...
```

**Step 3:** Construir resumen narrativo en español (4 frases).

**Step 4:** Para v0.1, devolver:
```json
{
  "version": "0.1",
  "summary": { "text": "...", "metrics": {...} },
  "predictions": null,
  "risks": [],
  "skill_mix": null,
  "missing_materials": [],
  "safety_alerts": [],
  "root_cause_hints": null
}
```

**Step 5:** Registrar audit con `action=AI_ANALYZE`, `user=agent:planning-analyze-wo`,
`payload={functions_run: [1], mode: "pre_execution"}`.

## 5. Validaciones de Salida

- `summary.text` debe ser ≤ 800 caracteres.
- `summary.metrics` debe contener exactamente las claves listadas en función 1.
- Stub fields (predictions, skill_mix, root_cause_hints) deben ser explícitamente `null`,
  nunca un dict vacío (para que el UI sepa que no hay output disponible vs no implementado).

## 6. Integration Points

- **Backend endpoint**: `POST /api/v1/managed-work-orders/{wo_id}/ai-analyze` (a crear).
- **UI button**: en `Planning.jsx` OT modal, badge 🤖 "Analizar con IA" — abre panel lateral
  con el output.
- **Audit log**: ver `docs/AUDIT_LOG_POLICY.md` sección 7 (acciones de agente).

## 7. Quality Checks

1. La función 1 SIEMPRE ejecuta y devuelve resumen + métricas no-vacías.
2. Funciones 2–7 deben devolver `null` o lista vacía explícita si no aplican.
3. El endpoint nunca muta `managed_work_orders`. Solo lectura + audit log.
4. Tiempo de ejecución < 3s para función 1 (sin LLM call — solo cómputo determinista).
5. Funciones que requieren RAG/LLM marcadas con `confidence` ∈ [0,1].

## 8. Pendientes para v0.2+

- [ ] Implementar función 2 (predicción HH) con histórico real Goldfields.
- [ ] Implementar función 3 (riesgos) con reglas deterministas.
- [ ] Implementar función 6 (safety) con catálogo ATEX/zone por equipo.
- [ ] Wire-up RCA draft (función 7) tras cierre.
- [ ] UI panel lateral en OT modal con resultados expandibles.
- [ ] Tests pytest con OT fixtures (1 AA crítica + 1 B preventiva + 1 cerrada).
