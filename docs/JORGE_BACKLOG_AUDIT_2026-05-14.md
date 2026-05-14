# Auditoría backlog Jorge — estado real código vs requisito

Última actualización: 2026-05-14 post-deploy `d6971947`

| # | Item Jorge | Backend | UI | Estado |
|---|---|---|---|---|
| 1 | Semáforo HH estricto (rojo bloquea drop) | ✅ `Scheduling.jsx:2178` bloquea drop con toast; `1572` bloquea Congelar | ✅ `loadPct > 100` muestra ⚠️ OVERLOADED en rojo | **HECHO** (Jorge 2026-04-27 B3-7) |
| 2 | Expand/collapse OT → ver operaciones con HH | ✅ `expandedWOs` Set en `Scheduling.jsx:686` | ✅ Click row toggle ops `1988-2200` | **HECHO** |
| 3 | Vista LISTADO/tabla OTs con cambio estatus inline | ⚠️ Existe `Cronológico` tab pero status inline solo en modal | UI parcial | **PARCIAL** — falta status inline |
| 4 | Calendar lun-dom / mié-mar configurable | ✅ `weekStartDay` en `SettingsPage:65` | ✅ Selector en Settings | **HECHO** |
| 5 | Botón "Reservar" cambia EN_PROGRAMACION → PROGRAMADO | ✅ `scheduleManagedWO(wo_id, {status:'PROGRAMADO'})` | ✅ "Congelar Programa" modal → btn Reservar | **HECHO** (etiquetado como "Congelar") |
| 6 | Config Capacidad HH (efectivas + % programable + productividad + dotación 3 sem) | ✅ localStorage `ocp_settings_{plant}` | ✅ `SettingsPage:553-612` UI completo | **HECHO** |
| 7 | Vista turnos día/noche dotación diferenciada | ✅ `dayShiftCount`/`nightShiftCount` en settings | ⚠️ Conteos visibles pero no split visual completo en tablero | **PARCIAL** |
| 8 | Equipos apoyo: sumar arrendados + bloquear FS | ✅ `SupportEquipmentModel` con `is_rented` + `out_of_service_*` | ⚠️ Tab existe pero UX incompleta | **PARCIAL** |
| 9 | Bandeja "En Ejecución" cierre rápido | ✅ Endpoints exec + WS | ✅ Página `/execution` con queue | **HECHO** |
| 10 | QR mobile Start Execution | ❌ No implementado | ❌ | **PENDIENTE** |
| 11 | Distribución HH entre operaciones (duración × cantidad) | ✅ `op.estimated_hours * op.quantity` calculation existe | ⚠️ Cálculo manual, no auto-distribute total OT entre ops | **PARCIAL** |
| 12 | Ranking IA prioridad (Paretos/Jack Knife/Monitoreo) | ⚠️ `Planning.jsx:1790` tooltip menciona ranking 4 criterios | ✅ Sort `Por prioridad` existe | **PARCIAL** — IA score visible pero engine 4-criterios no claro |
| 13 | Cancel → Close en Planificación | ✅ Renombrado a "Close Notification" (commit `d6971947`) | ✅ Deployado en prod | **HECHO** |
| 14 | Bug Pending → salta Planificación | ❓ Requiere UX deep dive: WR aprobado crea draft work_package — Jorge ve esto como "salto" | ❌ | **PENDIENTE** — discusión con Jorge necesaria |
| 15 | Refresh tiempo real estatus | ✅ `useWebSocketCoalesced` en Planning + Scheduling, optimistic updates | ✅ | **HECHO** |
| 16 | Búsqueda OTs prefijo OT- | ✅ SF-669 `Scheduling.jsx:944-962` normaliza y matchea | ✅ Verificado en prod | **HECHO** |
| 17 | Hardcodes ES → i18n | ⚠️ `t()` en muchas partes, pero algunos toast y labels aún en ES | Sweep pendiente | **PARCIAL** |
| 18 | Agente IA contexto libre + plan borrador | ❌ Auto-asignar existe sin textarea contexto | ❌ | **PENDIENTE** |

## Score honesto

- ✅ HECHO: **9/18** (50%)
- ⚠️ PARCIAL: **6/18** (33%) — backend ok, UI necesita polish
- ❌ PENDIENTE: **3/18** (17%) — QR mobile, bug Pending→Planning UX, agente IA contexto

## Siguiente plan

### Tanda inmediata (1 sesión)
1. **#3 Vista listado tabla** — agregar cambio estatus inline al `Cronológico` tab
2. **#7 Split visual día/noche** — refactor banner capacidad
3. **#8 Equipos apoyo UX** — verificar y completar formulario CRUD

### Tanda 2 (1 sesión)
4. **#11 Distribución HH ops** — botón "Distribuir HH total entre N ops"
5. **#17 i18n sweep** — toast/labels remanentes
6. **#12 Ranking IA visible** — exponer el score 4-criterios en panel izq

### Tanda 3 (más complejo)
7. **#10 QR mobile** — requiere field app + scanner lib
8. **#18 Agente IA contexto libre** — textarea + prompt engineering
9. **#14 Bug Pending→Planning** — alinear con Jorge qué espera

## Conclusión

El backend de Scheduling ya cubre lo que pide Jorge para replicar Prometheus. **Lo que falta es 30% de UX/visibilidad, no funcionalidad core**. El proyecto está más cerca de Prometheus de lo que parece — solo necesita pulir lo expuesto en pantalla.
