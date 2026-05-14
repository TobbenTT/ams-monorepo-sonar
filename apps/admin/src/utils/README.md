# Frontend utils

Pequeñas utilidades compartidas (no hooks de React, no componentes UI).

## woLifecycle.js

Política transversal **"antes del punto de ejecución"** decidida en la
jornada presencial QA 2026-05-08 (hallazgos #26, #27, #28).

Algunas acciones (priorización por IA, botón Reset, edición de scope) solo
deben estar habilitadas **mientras la OT no haya entrado a ejecución**:

| Función                | Pre-ejecución (✅ activa) | Post-ejecución (❌ bloqueada)         |
|------------------------|---------------------------|---------------------------------------|
| Priorización IA en WR  | hasta APROBADO            | OT_CREADA, CERRADO, RECHAZADO, CANCEL |
| Edición de prioridad   | hasta SCHEDULED           | EN_EJECUCION → CERRADO                |
| Botón Reset (planned)  | hasta SCHEDULED           | EN_EJECUCION → CERRADO                |
| Cambio de scope (ops)  | hasta SCHEDULED           | EN_EJECUCION → CERRADO                |

### API

```js
import { isPreExecution, isPostExecution, isWRPreExecution, PRE_EXECUTION_LOCK_MSG } from '../utils/woLifecycle';

if (!isPreExecution(wo.status)) {
  toast.info(PRE_EXECUTION_LOCK_MSG);
  return;
}

// Para WRs (Work Requests, no OTs):
if (!isWRPreExecution(wr.status)) {
  // panel de sugerencia IA oculto
}
```

### Estados considerados (con equivalentes legacy)

**Pre-ejecución WO** (`isPreExecution(status)` → `true`):
- `CREADO`, `LIBERADO`, `PLANIFICADO`, `EN_PROGRAMACION`, `PROGRAMADO`, `REPROGRAMADO`
- Legacy: `PENDIENTE`, `APROBADO`, `CREATED`, `RELEASED`, `PLANNED`, `SCHEDULED`

**Post-ejecución WO** (`isPostExecution(status)` → `true`):
- `EN_EJECUCION`, `EN_PROGRESO`, `COMPLETADO`, `CERRADO`, `CANCELADO`
- Legacy: `IN_EXECUTION`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`, `CANCELLED`

**Pre-decisión WR** (`isWRPreExecution(status)` → `true`):
- Cualquier estado que NO sea `OT_CREADA`, `CERRADO`, `RECHAZADO`, `CANCELADO`.

### Comportamiento al recibir `null`/`undefined`

- `isPreExecution(null)` → `true` (modo creación, asumimos editable).
- `isPostExecution(null)` → `false`.
- `isWRPreExecution(null)` → `true`.

### Quiénes usan esta política

- `frontend/src/pages/WorkRequests.jsx` — panel "Sugerencia de la IA" en el
  modal de detalle.
- *(extensible a Planning.jsx para gate de edición de ops/materiales cuando la
  OT está en ejecución).*

Si agregás un nuevo botón/acción que cambia prioridad o alcance, gateá con
`isPreExecution(status)` antes de permitirla.
