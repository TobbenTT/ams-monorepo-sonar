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
**Version:** 0.2 (funciones 1, 3, 5, 6 implementadas deterministas; 2/4/7 stub)
**Estado:** Producción. v0.2 incluye reglas deterministas que no requieren data real. Funciones 2 (predicción HH), 4 (skill mix), 7 (RCA hint) siguen como STUB hasta tener histórico real Goldfields (0B2) o catálogo skills detallado.

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

### Función 3 — Detección de Riesgos Operacionales (✅ IMPLEMENTADO v0.2)
Output: lista de riesgos `[{severity, category, message, mitigation}]`.
Reglas deterministas activas:
- 3.1 OT estancada >7d en estado pre-ejecución → severity=high, category=schedule.
- 3.2 OT crítica con HH≥8 sin equipos de apoyo → severity=medium, category=resources.
- 3.3 Operación con >24 HH (posible error estimación) → severity=medium, category=estimation.
- 3.4 Material con quantity pero sin reservation_code → severity=medium, category=materials.
- 3.5 Ratio HH/técnico >60h (sobrecarga probable) → severity=high, category=capacity.

### Función 5 — Sugerencia de Materiales Faltantes (✅ IMPLEMENTADO v0.2)
Si OT tiene operación REPLACE/OVERHAUL/REBUILD pero materials está vacío, busca keywords en
operations[].description y sugiere desde catálogo:
- `rodamiento|bearing` → Rodamiento SKF/Timken
- `sello|retén|seal` → Sello mecánico
- `filtro|filter` → Filtro (especificar tipo)
- `correa|belt` → Correa transmisión
- `cadena|chain` → Cadena (paso + eslabones)
- `válvula|valve` → Válvula
- `motor` → Motor repuesto
- `acopl|coupling` → Acoplamiento
- `manguera|hose` → Manguera hidráulica
- `junta|gasket` → Junta/empaquetadura
Confidence default 0.7 (heurística keyword-only).

### Función 4 — Skill Mix Óptimo (STUB)
Input adicional: matriz de skills por operación.
Output: `{recommended_workers: [{worker_id, role, why}], gaps: [...]}`.
Pendiente catálogo de skills por técnico (existe parcial en `workers.specialty`).

### Función 5 — Materiales Faltantes (STUB)
Heurística: si la OT tiene operación REPLACE pero `materials` está vacío → flag.
Si la operación menciona "rodamiento", "sello", "filtro" en el texto y no hay material → sugerir
desde catálogo via match por descripción.

### Función 6 — Alertas Seguridad (✅ IMPLEMENTADO v0.2)
Output: lista de alertas `[{severity, type, message, checklist[]}]`.
Detección por keywords en operations[].description + equipment_tag/description:
- 6.1 WORK_AT_HEIGHT: `altura|techo|escalera|andamio|scaffold` → severity=critical
  - Checklist: permiso firmado, arnés tipo Y, punto anclaje
- 6.2 LOTO: `motor|bomba|compresor|transformador|alta tensión|kv|electric` → severity=critical
  - Checklist: aislar fuente, candado/tarjeta, verificar energía cero
- 6.3 ATEX: `atex|explosiva|gas|hidrocarburo|cianuro|reactivo` → severity=critical
  - Checklist: permiso atm. explosivas, herramientas Ex, medición gases
- 6.4 CONFINED_SPACE: `confinado|estanque|tanque interior|silo|chimenea|ducto interior` → severity=critical
  - Checklist: permiso, monitor multigas, vigía + plan rescate
- 6.5 HOT_WORK: `soldadura|oxicorte|welding|cutting` → severity=high
  - Checklist: permiso, extintor PQS, pantalla anti-chispas
- 6.6 REVIEW_REQUIRED: OT crítica >4h sin alertas detectadas → severity=low
  - Indica que descripciones de operaciones son demasiado breves para detectar riesgos.

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
