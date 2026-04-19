# MAGEAM / AMS Production — Estado del proyecto

> Snapshot completo al 17-19 Apr 2026 para retomar sin perder contexto.
> Dueño: David Cabezas. Cliente actual: Gold Fields — Salares Norte. Stakeholders: Jose Cortinat, Jorge Alquinta.

## 🔑 Accesos

- **URL producción**: https://mageam.com
- **VPS**: `ssh vps` (configurado en `~/.ssh/config` → root@187.77.223.137)
- **Repo VPS**: `/root/ASSET-MANAGEMENT-SOFTWARE`
- **Branch**: `feature/multi-plant`
- **Repo local (Windows)**: `c:/Users/Tobbe/Downloads/Practica/AMS-Production`
- **Admin user**: `admin` / `password123`
- **API interna**: `http://localhost:8020/api/v1` (en VPS)
- **BD**: SQLite `/app/data/ocp_maintenance.db` (199MB, ~600 WOs, ~10k nodes)
- **Contenedores**: `ocp-backend`, `ocp-frontend`, `ocp-nginx` (docker compose)

## 🚀 Deploy

```bash
ssh vps
/root/deploy.sh [api|frontend|all]        # Un comando, rebuild + up
```

**Cron backup**: `0 3 * * * /root/backup.sh` → tarball código + BD diario, borra >14 días
**Último backup manual**: `/root/backups/ams-20260419-1231-final.tar.gz` + `ocp-db-20260419-1231.db`

## ✅ IMPLEMENTADO (todo en producción)

### Flujo de trabajo (Work Management)
- **Identification**: WR con AI classification, prefijo "OT-" en búsqueda, duplicados
- **Planning**: dropdowns Planning Group/Work Center con filtrado jerárquico (40 work centers en español), validación End ≥ Start, modal OT expandible 92vw×94vh respetando sidebar
- **Scheduling — flujo 2 pasos (Jose)**:
  - Drag-drop → `EN_PROGRAMACION` (borrador, borde punteado)
  - Auto-Level → también borrador
  - Reservar Semana → `PROGRAMADO` (borde sólido verde, no movible)
  - Modal styled con stats + confirmación
- **Execution**:
  - Start con timestamp + geolocation via QR (`actual_start`, `start_location`, `started_via`)
  - Progreso %, Complete, Close
  - **Bandeja de Cierre** (reemplazo IW41): checkbox + HH editable inline + batch close

### Auto-Level con IA (ajencéntrico — requisito Jose)
- Modal pre-analysis: carga por prioridad, barras por especialidad, slider capacidad, chips rápidos ("Priorizar P1/P2", "Viernes liviano", "Incluir fin de semana")
- **2-step modal**: Generate Plan → draft preview (Discard/Adjust/Accept) → Apply
- Algoritmo respeta: capacidad diaria/semanal por técnico, especialidad matching tier 1 (spec) → tier 2 (any) → defer, OTs largas se distribuyen (48h WO → 7 días × 6.86h), seed con scheduledWOs existentes (evita sumar encima)
- Dotaciones **día/noche configurables** (Settings `dayShiftCount`/`nightShiftCount`) — si se setean, se usan en vez de `technicians.length`
- Blocked equipment warning banner en modal

### Ranking IA (Pareto/Jack Knife)
Botón "Priorizar con IA" en Planning → llama `/agentic/smart-backlog`:
- Pesos: criticidad 25% / health 20% / SLA 20% / failure freq 15% / cost 10% / safety 10%
- Toast con top 5 + count SLA en riesgo
- **Score column en tabla de Planning** con badges 🔴🟡⚪ + iconos ⚠️ (SLA) y 🔁 (crónico)
- Sort por score + filtro "Solo SLA en riesgo"

### Semáforo 3-colores (Jorge)
- 🟡 <95% queda HH · 🟢 95-100% cerca del límite · 🔴 >100% sobrecapacidad
- Leyenda arriba del calendario
- En fila "Daily Total" con tooltip "Xh de Yh (Z%)"
- Distribuye OTs largas automáticamente (no dumpea 48h en un día)

### Equipos de Apoyo (Jorge)
Tab nuevo en Scheduling:
- CRUD con tipos (Puente grúa, Grúa móvil, Horquilla, Brazo, Herramienta), capacidad_tons, Arrendado/Propio
- **Bloquear** con razón, **Habilitar**
- 4 KPIs: Total / Disponibles / Fuera de servicio / Arrendados
- Banner en Auto-Level modal listando equipos bloqueados

### Dashboard (ExecutiveView + TacticalOperationsView)
- **Moneda dinámica** por planta (USD, MAD, CLP) desde Settings
- **4 pilares con métricas reales** (antes todos 100%): Strategy=criticality coverage, Planning=WR→WO conversion, Field=schedule adherence, Analytics=history coverage
- **HSE tab honesto**: banner "Módulo HSE pendiente", KPIs en "—" (no confundir con 6352 notificaciones de mantenimiento)
- **Staffing ampliado**: MECA/ELEC/INST + Civil/Lubricación/Predictivo/Otros en segunda fila
- **Targets configurables por planta** (Settings → Reliability Targets): availability/mtbf/mttr/mtbm/scheduleCompliance/equipmentHealth/backlogWeeks/isoCompliance
- **KPI Trend sintético** desde cierres reales si no hay `kpi_history` persistido
- **Pareto chart** en TacticalOperationsView: barras + línea % acumulado
- **Render progresivo**: 2 APIs críticas desbloquean UI, 7 rellenan después
- **Auto-load AI Failure Prediction + AI Weekly Summary** (antes requería click manual)

### QR Scanner
- Desktop (Execution): escaneo BarcodeDetector API, fallback input manual con prefijo "OT-" normalizado, captura `start_location` + `actual_start`
- Mobile (MobileWorkOrders): botón flotante verde inferior-derecha, navega al task match

### Settings (SettingsPage)
- Capacidad: Horas nominales/efectivas, % programable, factor productividad → calcula HH programables/persona/día
- **Dotaciones día/noche** (`dayShiftCount`, `nightShiftCount`) — usadas por AL
- **Patrón de turnos**: Día/Noche 12h · ABC 8h · 7x7 · 4x4 · 5x2 · 14x14
- **Week Start**: Lunes / Domingo / Miércoles (minería) / Sábado
- **Reliability Targets** por planta (8 KPIs configurables)
- **Moneda** configurable
- **Labor Rate** ZMANT001

### Performance
- Índices SQLite compuestos: `ix_mwo_plant_status`, `ix_mwo_plant_planned_start`, `ix_mwo_status_planned_start`, `ix_workforce_plant`
- Cache backend 120s plant-aware (dashboard)
- Endpoint `/managed-work-orders/?light=true` → projection slim (20 vs 45 fields) = -78% payload
- `content-visibility: auto` + `contain-intrinsic-size` en listas largas (virtualización nativa)
- `xlsx` dynamic import (solo se descarga al exportar)
- `Dashboard.jsx` con `lazy(() => import())` para ExecutiveView/TacticalOperationsView

### i18n final
- Settings en español
- ImprovementActions: status/priority/KPIs todos en español
- RCA: stages, 5W+2H, headers, modal, empty states
- WorkRequests: modal delete, toast aprobación
- Planning: OT modal tabs
- Scheduling: OTs a Programar, chips, filtros, reservar

### Infraestructura
- **Backend** acepta CREADO→PROGRAMADO + APROBADO→PLANIFICADO (transiciones robustas)
- **ws_manager.py** + WebSocket endpoint en main.py → ya en git source VPS, persisten en rebuilds
- **Imports opcionales** (sales/security/mfa con deps pyotp/qrcode/...): se cargan si existen, no tumban backend
- **Deploy.sh** unificado
- **Backup cron diario** 3 AM, retención 14 días
- **Git VPS limpia** (commit `8ee7711`)

## 🟡 PENDIENTE

### Alta prioridad
- **Tests automatizados** (0 actualmente). 3 críticos: transiciones de status, Auto-Level cap respect, Cierre batch paralelo
- **Botón "Reservar" individual** por OT en tabla Planning (Jorge lo pidió además del Reservar Semana)
- **Config HH hot-reload** — requiere F5 tras cambiar Settings (porque `getCapacitySettings()` corre una vez en module scope)
- **Mobile PWA end-to-end** — validar en teléfono real: captura foto, checklist offline, sync
- **AIAgents.jsx i18n** — ~40 strings EN (baja visibilidad, pantalla avanzada)

### Media prioridad (audit pendiente)
Módulos abiertos pero no validados a profundidad:
- FMEA (runtime OK, lo que puede ver el usuario sin probar)
- Criticality (render OK)
- Strategy (render OK)
- TeamPage (merge users+technicians OK, editar shift individual NO VALIDADO)
- DataImport (Upload Excel no probado con archivo real)
- Gantt View (audit code OK, drag-reschedule no probado)
- Mass Change (audit code OK, bulk save no probado en vivo)
- Materials Tab (bug de collected_items ya arreglado)

### Baja prioridad
- Reports.jsx: algunos table headers EN
- FailuresEvents.jsx: constants técnicos en EN
- Scheduling.jsx refactor (3000+ líneas, dividir en sub-files)
- Key Improvement Insights card empty en Dashboard
- Production tab del Dashboard sin explorar

### Escalabilidad futura
- PostgreSQL migration (SQLite aguanta hasta ~100k-500k rows)
- Redis cache (si se escala a varias instancias backend)
- CDN assets estáticos
- CI/CD GitHub Actions (hoy deploy manual pero hay deploy.sh)
- Monitoreo (Uptime Kuma o similar)

## 🐛 Bugs conocidos / gotchas

1. **Daily Total puede mostrar >100% históricamente** si antes del fix se programaron OTs largas. Solución: Clear Assignments + re-Auto-Level con el algoritmo corregido.

2. **Dashboard tarda ~300ms primera vez**: normal, render progresivo desbloquea ya.

3. **WebSocket temporalmente 403** si el backend no incluía `ws_manager.py` — ya fix permanente en rebuild.

4. **pyotp/qrcode deps faltantes**: imports opcionales en main.py, no tumban backend. Si se quiere MFA/security real: `pip install pyotp qrcode` + quitar guards.

5. **exclude_none=True en Pydantic update_work_order**: para limpiar campos mandar `''` o `[]`, NO `null`. El frontend ya lo maneja.

6. **`getCapacitySettings()` corre al cargar el módulo JS** — no reactivo. Cambios en Settings requieren F5.

7. **Score IA con equipos duplicados**: si el mismo equipment_tag aparece múltiples veces en el backlog, el top 5 se llena con duplicados. Indica que ese equipo es crónico (insight válido, no bug).

## 📁 Archivos clave

### Frontend
- `frontend/src/pages/Scheduling.jsx` — 3000+ líneas, tablero semanal + Auto-Level + tabs (refactorizar pendiente)
- `frontend/src/pages/Planning.jsx` — listado WOs + modal OT + ranking IA
- `frontend/src/pages/Execution.jsx` — Today + Bandeja de Cierre + QR
- `frontend/src/pages/WorkRequests.jsx` — Identification
- `frontend/src/components/views/ExecutiveView.jsx` — Dashboard executive
- `frontend/src/components/views/TacticalOperationsView.jsx` — Dashboard tactical
- `frontend/src/pages/SettingsPage.jsx` — config por planta
- `frontend/src/components/QRScanner.jsx` — BarcodeDetector API
- `frontend/src/utils/exportFile.js` — xlsx dynamic import

### Backend
- `api/main.py` — app setup, imports opcionales, WebSocket endpoint
- `api/routers/managed_work_orders.py` — CRUD WOs + `?light=true`
- `api/routers/scheduling.py` — programs, gantt, hh-balance, materials, clear-week, support-equipment
- `api/routers/dashboard.py` — executive KPIs, alertas, completions (4 pilares)
- `api/routers/analytics.py` — KPI history (sintetiza si no hay)
- `api/services/managed_wo_service.py` — `_to_dict`/`_to_light_dict`, transiciones, schedule_wo preserva workers
- `api/services/agentic_smart_backlog_service.py` — scoring multi-criterio Pareto
- `api/services/ws_manager.py` — WS connection manager
- `api/database/models.py` — SQLAlchemy models

### Configuración planta
localStorage: `ocp_settings_<plant_id>` (JSON) incluye:
- `effectiveHoursPerShift`, `schedulingPercent`, `productivityFactor`
- `dayShiftCount`, `nightShiftCount`, `shiftType`, `weekStartDay`
- `availabilityTarget`, `mtbfTarget`, `mttrTarget`, `plannedWorkTarget`
- `kpiTargets`: { mtbm, scheduleCompliance, equipmentHealth, backlogWeeks, isoCompliance }
- `currency`: 'usd' | 'mad' | 'clp' | ...
- `laborRate`

## 🎯 Requisitos Jose/Jorge — mapping final

| Requisito | Estado |
|---|---|
| Replicar tablero Prometheus | ✅ |
| Agente IA "ajencéntrico" con contexto libre | ✅ |
| Plan borrador con aprobación | ✅ |
| Semáforo rojo/ámbar/verde capacidad HH | ✅ |
| Config HH efectivas / % programable / productividad | ✅ |
| Vista día/noche con dotaciones distintas | ✅ |
| Ranking IA por criticidad (Pareto/Jack Knife) | ✅ |
| Priorización OT por impacto/riesgo (orden izq) | ✅ |
| Filtro P3/P4 (exclusión P1/P2 supervisor) | ✅ (chips toggleables) |
| Expandir OT a operaciones con HH por op | ✅ |
| Listado tabla con cambio de estatus | ✅ (Planning) |
| Estatus "En Programación" manual | ✅ (flujo 2 pasos) |
| Botón "Reservar" que bloquea HH → PROGRAMADO | ✅ (Reservar Semana) |
| Bandeja de Ejecución (reemplazo IW41 slow) | ✅ |
| Equipos de apoyo (puentes grúa, grúas móviles) | ✅ |
| Bloquear/desactivar equipos fuera de servicio | ✅ |
| Sumar equipos arrendados | ✅ |
| Lector QR móvil → Start Execution + ubicación | ✅ |
| Calendario Lun-Dom vs Mié-Mar configurable | ✅ |
| Botón "Cancel" rojo en Planificación → "Close" | ✅ |
| No saltar Pending→Planificación al aprobar | ✅ |
| Búsqueda con prefijo "OT-" | ✅ |
| Refresh inmediato de cambios de estatus | ✅ (optimistic UI + WS) |
| Multiplicación personal × duración = HH op | ✅ |

## 📝 Decisiones importantes

1. **SQLite vs Postgres**: seguir con SQLite mientras BD <500MB. Migración planeable cuando se escale.
2. **Copiar Prometheus UX**: SÍ en cáscara (layout, drag-drop), NO en cerebro (IA, ranking). Ambos Jose y Jorge alineados en esto (Jose explícito: "ponle comida agéntica encima").
3. **Auto-Level NO bloquea algorítmicamente por equipos fuera de servicio** — solo muestra banner. Razón: las OTs no tienen link directo a equipo requerido en BD, bloqueo automático sería agresivo.
4. **Light payload `?light=true`**: adoptado para todas las list operations en Scheduling. Full payload solo cuando se abre modal de OT.
5. **Flujo 2 pasos (Jose)**: drag-drop = borrador, Reservar = final. NO directo a PROGRAMADO. Da reversibilidad al planificador.
6. **Dotaciones día/noche**: si Settings no las especifica, cae a `technicians.length` total (comportamiento anterior). Si Jorge llena los campos, AL los respeta.

## 🗓️ Agenda pendiente (orden sugerido)

**Sesión corta (1-2h):**
1. Tests pytest mínimos (transiciones + Auto-Level cap + batch close)
2. Botón Reservar individual por OT
3. Fix hot-reload de HH config

**Sesión audit (30 min):**
4. TÚ pruebas: FMEA, Criticality, Strategy, Team (editar shift), DataImport, Gantt drag-reschedule, Mass Change bulk save

**Sesión pulido (1h):**
5. AIAgents i18n (40+ strings)
6. Reports table headers
7. Key Improvement Insights del Dashboard
8. Production tab Dashboard

**Para demo a Jose/Jorge:**
- Todo listo. Fijate que: Auto-Level → Generar → Aceptar → Reservar Semana → flujo fluido
- Priorizar con IA → muestra top 5 con SLA risks
- Bandeja de Cierre con batch close rápido
- Expandir OT en calendario → operaciones visibles
- Dashboard con moneda USD + 4 pilares reales
- Semáforo 3 colores activo durante drag-drop

**Para producción real:**
9. CI/CD (GitHub Actions workflow para deploy en push)
10. Uptime Kuma / monitoreo
11. PostgreSQL (cuando haga falta)

---

_Última actualización: 19 Apr 2026. Commit VPS: `8ee7711`._
