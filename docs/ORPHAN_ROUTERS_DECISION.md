# Decisión sobre routers huérfanos (Fase 7)

Fecha: 2026-04-22

Después de auditar los routers backend que **no tienen página frontend** o no
están incluidos en `main.py`, decidimos el destino de cada uno. Criterio:
borrar sólo si el código no aporta valor ni está a medio de una feature viva;
mantener cuando es low-cost y preserva opcionalidad futura.

## Veredictos

| Router | Estado actual | Decisión |
|---|---|---|
| `api/routers/calendar.py` | **Roto.** Importa `CalendarEventCreate` de `api.schemas` que no existe; no está incluido en `main.py`. | **Borrar.** Reemplazado por `Shutdowns.jsx` + `/reliability/shutdowns`. |
| `api/routers/sync.py` | Offline-first PWA sync. Endpoints funcionales (pull/push/conflict). No hay PWA mobile construida aún. | **Mantener.** Re-usable cuando se construya la PWA de terreno. |
| `api/routers/planner.py` | Cálculo de backlog. Superseded por `scheduling.py` + `backlog.py`. | **Mantener** (1 sesión para decidir si borrar). No rompe nada. |
| `api/routers/tasks.py` | CRUD genérico de tareas. Superseded por `execution.py` + `managed_work_orders.py`. | **Mantener.** Se usa en Strategy.jsx para listar templates PM. |
| `api/routers/transcribe.py` | Audio-to-text. No hay grabador UI. | **Mantener.** Lo usa SmartCaptureModal internamente a futuro. |
| `api/routers/sap_pm.py` | Solo lectura de catálogos SAP. | **Mantener.** Provee inventario para SpareParts.jsx (Fase 5c). |
| `api/routers/reporting.py` | Generación de reportes. Tiene página `Reports.jsx` y `ReportsPage.jsx`. | **Mantener.** |
| `api/routers/notifications.py` | Notificaciones in-app. Ahora con UI en Fase 5d. | **Mantener.** |
| `api/routers/troubleshooting.py` | Diagnósticos con IA. Página `Troubleshooting.jsx` existe. | **Mantener.** |
| `api/routers/expert_knowledge.py` | Knowledge base. Página `ExpertKnowledge.jsx` existe. | **Mantener.** |

## Acción inmediata

Eliminar únicamente `api/routers/calendar.py` (roto, dead-code, reemplazado).
El resto se mantiene sin cambios — no generan costo de mantenimiento ni
bloquean features activas.

## Criterios que cambiarían el veredicto

- Si en 2 sprints `sync.py` sigue sin cliente PWA → borrar.
- Si `planner.py` no lo usa nadie al cerrar backlog v2 → borrar.
- Si la consola de errores muestra 404s recurrentes a esos routers → revisar.
