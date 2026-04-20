# Session Handoff — 2026-04-20

> Snapshot para que la próxima sesión arranque sin perder contexto.
> Last commit live en `mageam.com`: **`f37b9bb`** en `feature/multi-plant`.

## Estado actual

| Ref | Commit |
|---|---|
| Local | `f37b9bb` |
| GitHub (`origin`) | `f37b9bb` |
| VPS | `f37b9bb` |

Working tree limpio. 0 vulnerabilidades (npm + pip). Producción estable en `mageam.com`.

## Commits de esta sesión (en orden cronológico)

| Commit | Qué |
|---|---|
| `d83f831` | Impact-score multi-criterio en OT modal + HH hot-reload + Reservar individual |
| `647be41` | Impact-score también en WR modal |
| `abe5fa6` | Fix WR fetch (normalizeWR mapea `request_id` → `id`) |
| `c1f7a50` | Mobile: score badges + alert chips sincronizados con desktop |
| `fdeae76` | **Offline queue (VSC-259)** — enqueue + drainer + UI + toasts |
| `44dcc2a` | gitignore SQLite transients + `Ideas/` |
| `1cee2d4` | Cleanup: -95 archivos, -10,734 líneas (Esta/, FeedBack/, migrate scripts viejos, xlsx sueltos) |
| `38a96f8` | **Security**: npm audit fix + swap xlsx → SheetJS 0.20.3 + PyJWT 2.12.0 + pytest 9.0.3 |
| `f37b9bb` | **WebSocket fix** — singleton per-plant (1 WS por usuario en vez de 5) + gunicorn workers=1 |

## Lo que sigue pendiente

### 1. Ventanas minimizables de OTs (Jorge)
**Requirement**: abrir OT modal → minimizar como taskbar → seguir trabajando → retomar. Estado preservado por OT (edits sin guardar, scroll, tab activa).

**Esfuerzo**: 4-6h. **Riesgo**: alto (toca el modal OT que es el componente más crítico).

**Antes de atacar**: pedirle a Jorge qué problema real resuelve. Alternativas más baratas que probablemente cubren el 80% del caso:
- "Abrir en nueva pestaña" (15 min)
- Autosave de drafts (ya existe parcialmente con `exclude_none`)
- Historial de últimas 5 OTs vistas (1h)

### 2. Tests pytest — bloqueados por env setup
Archivo [tests/test_api/test_managed_wo.py](tests/test_api/test_managed_wo.py) creado con 3 casos críticos (transiciones, reservar-preserva-workers, batch close). No corren por:
- `JWT_SECRET_KEY` faltante en env
- `pyotp`/`qrcode` no instalados en entorno de test

**Fix**: agregar en `pytest.ini`:
```ini
[pytest]
env =
    JWT_SECRET_KEY = test-secret-key-32-chars-min-length-pls
```
Y asegurar `pyotp`+`qrcode` en requirements.

### 3. Validar offline queue en teléfono real
La feature está en producción, probada en DevTools (Network → Offline toggle). **No se probó en Android/iOS físico** con señal intermitente real. Pendiente del próximo viaje a Salares Norte o dispositivo de Jose/Jorge.

**Endpoints encolados** (opt-in):
- `POST /work-requests/`, `PUT /validate`
- `PUT /managed-work-orders/{id}` + `/start`, `/complete`, `/close`, `/progress`, `/notes`
- `POST /capture/*`

Todo lo demás (auth, GETs, admin) falla rápido en offline — es intencional.

### 4. Auditoría Jira (tickets pendientes)
Quedaron sin confirmar contra código:
- **SF-207** Bandeja única OT+Backlog
- **SF-57** Reportes Operacionales
- **SF-88** Planner ve avisos aprobados
- **SF-210** Ventana compra materiales tipo L
- **SF-341** BD fluoralpha
- **SF-371** Corregir clasificación falla
- **SF-372** Supervisor no como recurso
- **SF-374** Cambiar status word orders
- **SF-376** Texto cabecera operación

**MCP de Jira instalado** (scope user) con:
```bash
claude mcp add --transport http --scope user atlassian https://mcp.atlassian.com/v1/mcp
```
En la próxima sesión, primer prompt sugerido:

> "Conectá Jira. Mostrame descripción de SF-207, SF-57, SF-88, SF-210, SF-371, SF-372, SF-374, SF-376 y VSC-259. Audita cuáles ya están hechas contra el código y movelas a Done."

Tickets **que ya podés mover a Done** sin leer descripción (confirmado en código esta sesión):
- **SF-211** (impact-score) — hecho hoy
- **SF-41** (captura falla form/voz/imagen) — MobileCreateWR
- **SF-236** (data sintética) — seed_demo.py + 600 OTs
- **SF-87** (supervisor edita WR) — botón Edit en modal
- **SF-209** (Costo Plan vs Real con Delta) — WorkOrdersPage:2084-2089
- **SF-218** (Ejecución/Notificación/Cierre) — Execution + Bandeja + QR
- **SF-219** (KPIs/Dashboard) — Dashboard + ExecutiveView + TacticalOperationsView
- **SF-217** (Refinar Scheduling) — Auto-Level 2-pasos + Reservar + Support Eq
- **SF-375** (Modal pantalla completa) — 92vw×94vh
- **SF-373** (Botones Reject/Cancel WN) — WorkRequests.jsx:970,981
- **SF-377** ("Liberada" vs "Planificada") — Planning.jsx:486
- **VSC-259** (Operación offline) — hecho hoy

## Gotchas descubiertos esta sesión

1. **Service worker agresivo** — cambios de frontend no se ven con Ctrl+Shift+R. Usuarios deben: DevTools → Application → Service Workers → Unregister → Clear site data. O ventana incógnito.
2. **`normalizeWR()` mapea `request_id` → `id`** — si agregás fetch por request_id en el modal, usá `item.id`. Me costó una iteración.
3. **`git push vps` no actualiza working tree** — hay que hacer `ssh vps 'cd /root/ASSET-MANAGEMENT-SOFTWARE && git reset --hard HEAD'` después de cada push, antes de `/root/deploy.sh`.
4. **WorkManagement.jsx monta las 5 tabs con `display:none`** — lo que hace que cualquier hook en páginas-tab corra 5 veces en paralelo. Esto causó el problema de WebSocket. Si agregás un hook nuevo que abra recursos (WS, polling, subscriptions), ponelo en singleton.
5. **Gunicorn multi-worker rompe WebSockets** — `ws_manager` es in-process. Si alguien vuelve a `-w N` en Dockerfile, perdemos broadcasts. Next step: Redis pub/sub.
6. **PROJECT_STATUS "0 tests" era inexacto** — hay muchos tests de engines viejos en `tests/`, pero **ninguno cubría managed_work_orders**. Ahí sí hay gap.

## Archivos nuevos / clave de esta sesión

**Nuevos:**
- `api/services/agentic_smart_backlog_service.py` → fn `score_managed_wo`, `score_work_request`
- `frontend/src/offlineSync.js` — drainer
- `frontend/src/wsSingleton.js` — WS singleton
- `frontend/src/hooks/useOfflineStatus.js`
- `frontend/src/components/OfflineIndicator.jsx`
- `frontend/src/components/OfflineSyncToasts.jsx`
- `tests/test_api/test_managed_wo.py`
- `MOBILE_HANDOFF.md`, `PROJECT_STATUS.md`, `SESSION_HANDOFF.md` (este)

**Modificados mayores:**
- `frontend/src/api.js` — offline queue wrapper + `offlineEvents` bus
- `frontend/src/offlineStore.js` — v2 con `pending_mutations` + `failed_mutations`
- `frontend/src/hooks/useWebSocket.js` — ahora wrapper delgado sobre singleton
- `frontend/src/pages/WorkOrdersPage.jsx` — score breakdown + KPI filter + Reservar
- `frontend/src/pages/WorkRequests.jsx` — impact badge clickeable + breakdown
- `frontend/src/pages/Scheduling.jsx` — `useCapacitySettings` hook (HH hot-reload)
- `frontend/src/pages/Planning.jsx` — botón Reservar individual por row
- `frontend/src/pages/mobile/*` — score badges + alert chips
- `api/routers/managed_work_orders.py` — endpoint `/impact-score`
- `api/routers/work_requests.py` — endpoint `/impact-score`
- `Dockerfile` — gunicorn workers=1
- `requirements.txt` — PyJWT 2.12.0 + pytest 9.0.3

## Para la próxima sesión — orden sugerido

1. **Arrancar auditoría Jira** (MCP listo)
2. **Cerrar tests pytest** — fix env + correr los 3 críticos (~20 min)
3. **Clarificar con Jorge** el requirement de ventanas minimizables antes de codear
4. Si tiempo: validar offline en teléfono real

---

_Última actualización: 2026-04-20 tarde. Autor: David Cabezas + Claude Opus 4.7._
