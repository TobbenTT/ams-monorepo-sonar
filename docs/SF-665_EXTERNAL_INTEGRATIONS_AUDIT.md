# SF-665 — Auditoría integraciones externas + plan reactivación

**Sprint 7 VSC · Due 2026-05-15 · David Cabezas · Hallazgo #18 jornada QA 2026-05-08**

## Inventario actual

### ✅ Activas en producción

| Integración | Estado | Endpoint | Smoke test |
|---|---|---|---|
| **Anthropic Claude API** | ✅ Activa | `ANTHROPIC_API_KEY` en .env | `/api/v1/work-requests/ai-assist` |
| **SAP Mock S/4 (interno)** | ✅ Activa (port 8032 VPS) | `SAP_MOCK_URL=http://ocp-sap-mock:8000` | `/api/v1/sap/live/equipment` → 5 equipos |
| **WebSocket realtime** | ✅ Activa | `ws://mageam.com/ws/{plant_id}` | `Scheduling.jsx` Live indicator |
| **Sentry observability** | ⚠️ Configurada sin DSN | `SENTRY_DSN_BACKEND=""` | No-op silencioso |

### ⚠️ Cableadas pero sin conexión real

| Integración | Estado | Bloqueo |
|---|---|---|
| **SAP S/4HANA real (OData)** | Strategy pattern listo, OAuth2 client_credentials implementado | Credenciales Goldfields pendientes (workshop Andrea+Jorge) |
| **SAP PyRFC (on-prem)** | `sap_rfc_connector.py` con `SAP_AVAILABLE=False` | Pyrfc no instalado en container — Track B Prometheus |
| **Email Gateway (notificaciones WR)** | `notification_delivery_service.py` operativo | SMTP secrets en .env vacíos en prod |
| **Google Maps API** | UI Dashboard menciona "ubicación técnica" | API key no configurada, fallback a free OpenStreetMap |
| **Mapbox** | No referenciado en código | No instalada |
| **Webhooks salientes** | No implementado | N/A |
| **SMS/Slack** | No implementado | N/A |

### ❌ Desactivadas (Hallazgo Jornada QA)

| Función | Razón desactivación | Cómo reactivar |
|---|---|---|
| **Auto-Level (Auto-asignar al tablero)** | Jorge lo deshabilitó por bugs en Tanda 1 (2026-05-14) | Ya rehabilitado en commit `1357c8c` con nuevo nombre "Auto-asignar al tablero" |
| **Clear All Assignments** | Quitado por peligroso (Jorge 2026-05-14) | NO reactivar — decisión Jorge transcript |
| **Mass Change → Lista OTs (bulk status)** | Quitado en `f945251` (Jorge: status cambia dentro de OT) | NO reactivar — feedback Jorge 19:44 |
| **Reprogramar Vencidas (bulk)** | A quitar — SF-735 Jorge 19:44 | Cerrar como design decision |
| **Vista 5 días Scheduling** | A quitar — SF-730 Jorge 19:44 (operación 24/7 siempre 7 días) | Refactor pendiente |
| **Sentry DSN backend** | `SENTRY_DSN_BACKEND=""` en .env prod | Configurar DSN en Sentry.io + pegar en `.env` VPS |
| **Sentry DSN frontend (Vite build arg)** | `VITE_SENTRY_DSN=""` | Idem en build args docker-compose |

## Plan reactivación priorizado

### Esta semana (no requiere cliente)
1. **Sentry backend + frontend** — 30 min. Crear proyectos sentry.io, pegar DSN, redeploy.
2. **Email gateway SMTP** — 30 min. Pegar SMTP creds VSC. Smoke test envío.

### Bloqueado por cliente
3. **SAP OData real Goldfields** — depende de workshop Andrea+Jorge (SF-746/747)
4. **PyRFC** — Track B Prometheus (~30 GB descarga local)

### Diferido / no aplica
5. Google Maps, Mapbox, Webhooks, SMS, Slack — no priorizado para piloto Goldfields

## Criterio aceptación SF-665
- ✅ Lista exhaustiva integraciones (este doc)
- ✅ Estado actual cada una
- ✅ Plan reactivación con bloqueadores
- ⏳ Smoke tests por integración (Sentry + SMTP pendiente, SAP mock ya validado)

---
**Cierre**: este doc + commit en repo cuenta como entregable. Smoke tests Sentry/SMTP a hacer cuando el cliente apruebe credenciales VSC.
