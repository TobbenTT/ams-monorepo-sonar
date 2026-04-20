# Handoff: Sincronizar vista mobile con nuevas features de desktop

> Para: otro chat que va a retomar el trabajo de mobile.
> Fecha: 2026-04-20. Branch: `feature/multi-plant`. Último commit relevante: `abe5fa6`.
> Cliente: Gold Fields — Salares Norte. Producción live: https://mageam.com
> Usuario objetivo de mobile: **técnico en terreno** (no planner/supervisor).

## Contexto — qué se hizo en desktop

En la sesión anterior se agregaron features que viven en desktop y **no están reflejadas en mobile**:

1. **Impact-score multi-criterio** (6 factores: criticidad 25% + health 20% + SLA 20% + frecuencia fallas 15% + costo 10% + seguridad 10%). Reemplaza el lookup hardcodeado `priority_code → score` que antes devolvía siempre 95/75/45/20.
2. **Endpoints backend ya disponibles y deployados**:
   - `GET /api/v1/managed-work-orders/{wo_id}/impact-score`
   - `GET /api/v1/work-requests/{request_id}/impact-score`
   - Ambos devuelven `{ total_score, impact_label, weights, raw_factors, contributions, context, alerts }`
3. **API helpers ya disponibles** en [frontend/src/api.js](frontend/src/api.js):
   - `api.getManagedWOImpactScore(wo_id)`
   - `api.getWorkRequestImpactScore(request_id)`
4. **KPI cards filtrables, Reservar individual, ranking IA, breakdown expandible** — todo esto es UX de planner/supervisor. **NO portar a mobile**.

Ver implementación de referencia en desktop:
- [frontend/src/pages/WorkOrdersPage.jsx:1960-2060](frontend/src/pages/WorkOrdersPage.jsx) — banner Production Impact con breakdown
- [frontend/src/pages/WorkRequests.jsx:502-540](frontend/src/pages/WorkRequests.jsx) — badge clickeable con score + breakdown panel abajo

## Tarea — qué hay que hacer en mobile

**Principio rector**: el técnico en terreno NO necesita ver los 6 factores. Solo necesita saber "¿cuál OT priorizo?". Para eso basta con **score numérico + label + alertas**. Nada de popovers densos con barritas.

### Archivos mobile y su rol

| Archivo | Líneas | Rol | Tocar? |
|---|---|---|---|
| [frontend/src/pages/mobile/MobileWorkOrders.jsx](frontend/src/pages/mobile/MobileWorkOrders.jsx) | 483 | Lista de OTs asignadas. **Contiene el QR scanner (linea 457-463)**. | SÍ — agregar score badge por card |
| [frontend/src/pages/mobile/MobileWRDetail.jsx](frontend/src/pages/mobile/MobileWRDetail.jsx) | 916 | Detalle de WR. Línea 239 lee `production_impact` crudo. | SÍ — reemplazar por score real |
| [frontend/src/pages/mobile/MobileHome.jsx](frontend/src/pages/mobile/MobileHome.jsx) | 805 | Hub. Muestra priority/SLA en listas. | SÍ — agregar score badge si tiene lista de OTs |
| [frontend/src/pages/mobile/MobileWorkRequests.jsx](frontend/src/pages/mobile/MobileWorkRequests.jsx) | 466 | Lista de WRs. | Opcional — badge score en cards |
| [frontend/src/pages/mobile/MobileCreateWR.jsx](frontend/src/pages/mobile/MobileCreateWR.jsx) | 1394 | Captura WR en terreno (flujo IA). | **NO** — el score se calcula después de crear |
| [frontend/src/pages/mobile/MobileTaskExecution.jsx](frontend/src/pages/mobile/MobileTaskExecution.jsx) | 404 | Ejecución paso a paso. | **NO** — flujo lineal, no necesita priorización |
| [frontend/src/pages/mobile/MobileDashboard.jsx](frontend/src/pages/mobile/MobileDashboard.jsx) | 539 | KPIs resumidos. | Opcional — depende si muestra listas |

### Cambios concretos

#### 1. MobileWorkOrders.jsx — score badge en cards
- En la lista de OTs asignadas al técnico, agregar un badge chico `🔴 87` / `🟡 42` / `⚪ 18` junto al número de OT.
- **NO tocar el QR scanner** (función crítica, ya validada).
- **NO tocar `actual_start` / `start_location` capture**.
- Opción pragmática: fetch `impact-score` en paralelo para cada OT visible (cuidado con cantidad — si hay 50 OTs asignadas, hacer batch o lazy).
- **Mejor**: agregar endpoint batch si no existe, o hacer el fetch solo cuando el técnico abre el detalle.
- Bandas (mismas que desktop): ≥70 rojo / 50-69 naranja / 30-49 amarillo / <30 verde.

#### 2. MobileWRDetail.jsx — reemplazar "MEDIUM" hardcoded por score real
Línea 239 actualmente:
```js
production_impact: wr.production_impact || 'MEDIUM',
```
Dejar ese fallback para casos sin data, pero agregar `useEffect` que llame `api.getWorkRequestImpactScore(wr.id || wr.request_id)` y muestre `{impact_label} · {total_score}` cuando esté disponible.

**NO agregar breakdown panel**. En mobile sobra. Si hay alertas en `impactScore.alerts`, mostrar chips pequeños:
- `SLA_BREACH_RISK` → ⚠️ SLA
- `CHRONIC_EQUIPMENT` → 🔁 Crónico
- `SAFETY_FLAG` → 🛡️ Seguridad

#### 3. MobileHome.jsx — score en listas de OTs pendientes (si aplica)
Revisar si tiene una sección "Mis OTs para hoy" o similar. Si sí, mismo badge. Si no, saltear.

### Gotchas conocidos

1. **`normalizeWR()` mapea `request_id` → `id`** — ver [frontend/src/pages/WorkRequests.jsx:1066](frontend/src/pages/WorkRequests.jsx). Si mobile usa el mismo normalizer, asegurate de usar `item.id` para el fetch, no `item.request_id`.
2. **Service worker (`sw.js`) cachea agresivo** — para testear cambios: DevTools → Application → Service Workers → Unregister → Clear site data → reload. O ventana incógnito.
3. **Backend ya soporta los endpoints** — no necesita cambios en `api/services/agentic_smart_backlog_service.py` (ya tiene `score_managed_wo` y `score_work_request`).
4. **El impact-score tarda ~100-300ms por WO** (consulta criticidad + health + fallas histórico). Si se va a llamar en listas, considerar cache client-side por wo_id.

### Qué NO hacer

- **No duplicar el breakdown panel en mobile** (6 barritas con pesos/contribución/context). En 375px es ilegible.
- **No agregar botón "Reservar"** — es rol de planner.
- **No agregar ranking IA card** — es rol de planner.
- **No agregar KPI cards filtrables** — el técnico tiene lista lineal.
- **No tocar offline sync / `offlineStore.js`** — está validado, riesgoso.
- **No tocar captura de foto en MobileCreateWR** — funciona.

## Verificación

1. Deploy local: `cd frontend && npm run dev`, abrir en viewport mobile (DevTools responsive mode, 375px iPhone SE).
2. Deploy VPS: commit + push + `ssh vps && /root/deploy.sh frontend`.
3. **Hard refresh post-deploy** (service worker): incógnito o Unregister SW.
4. Smoke tests en teléfono real:
   - QR scanner sigue escaneando y creando `actual_start` + `start_location`.
   - Lista de OTs muestra score badge correcto.
   - Detalle WR muestra impact_label + score (no "MEDIUM" fijo).
   - Alertas visibles cuando `SLA_BREACH_RISK` o `CHRONIC_EQUIPMENT`.

## Deploy — flow

```bash
# Local
git add frontend/src/pages/mobile/<archivos-tocados>
git commit -m "feat: mobile — impact-score badges + alerts in lists"
git push vps feature/multi-plant

# VPS
ssh vps
cd /root/ASSET-MANAGEMENT-SOFTWARE
git reset --hard HEAD   # el push no auto-actualiza working tree
/root/deploy.sh frontend
```

## Estimación

1-1.5h de trabajo efectivo si solo se hacen los 3 cambios principales (lista OTs, MobileWRDetail, MobileHome). No más.

Si el próximo chat quiere validar todo mobile end-to-end (foto, checklist offline, sync), eso es un pase aparte listado en [PROJECT_STATUS.md](PROJECT_STATUS.md) como pendiente alto.

## Referencias

- [PROJECT_STATUS.md](PROJECT_STATUS.md) — snapshot completo del proyecto
- [api/services/agentic_smart_backlog_service.py](api/services/agentic_smart_backlog_service.py) — `score_managed_wo` (línea ~419), `score_work_request` (línea ~522)
- [frontend/src/pages/WorkOrdersPage.jsx:1960](frontend/src/pages/WorkOrdersPage.jsx#L1960) — implementación desktop de banner impact score
- [frontend/src/pages/WorkRequests.jsx:286-297](frontend/src/pages/WorkRequests.jsx#L286) — fetch pattern desktop (useState + useEffect)
