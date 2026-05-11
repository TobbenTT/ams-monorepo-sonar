# MAGEAM — Asset Management Software

**Plataforma de gestión de activos y mantenimiento para minería y procesos industriales.**

Cliente piloto: **Gold Fields Salares Norte**.
Producto: **VSC Asset Management Software (AMS)**.
URL producción: **[mageam.com](https://mageam.com)**

---

## 1. Qué hace la plataforma

MAGEAM cubre el ciclo completo de mantenimiento de activos industriales desde la
detección del problema hasta el cierre con firma, siguiendo el flujo estándar
SAP PM pero con UX moderna y asistencia agéntica por IA en cada paso.

### Flujo principal (Work Management)

```
1. FAILURE CAPTURE       ─ operario reporta problema en sitio (web/mobile/voz/foto)
        │                  ↓ IA Vision identifica equipo + sugiere prioridad
        ↓
2. IDENTIFICATION         ─ supervisor valida aviso, decide prioridad final
        │                  ↓ P1/P2 auto-crea OT fast-track (PM03)
        ↓                  ↓ P3/P4 entra a backlog de planificación
3. PLANNING               ─ planificador agrega ops, materiales, equipos apoyo
        │                  ↓ optimistic concurrency con version + If-Match
        ↓
4. SCHEDULING             ─ programador asigna técnicos × día × turno
        │                  ↓ drag-drop weekly + cronológico + Gantt
        ↓                  ↓ auto-level por capacidad HH × work center
5. EXECUTION              ─ técnico ejecuta, supervisor notifica HH por op
        │                  ↓ avance %, cierre con firma + PIN
        ↓                  ↓ 6 pre-close gates (variance, materiales, QA…)
6. CLOSED                  ─ auditoría legal trace, costo real consolidado
```

### Módulos transversales

- **Failures & Events** — análisis de fallas detectadas
- **Improvement Actions / CAPA** — acciones correctivas y preventivas
- **Criticality** — análisis de criticidad de equipos (RCM)
- **FMECA** — modos de falla, efectos, criticidad, RPN
- **RCA** — análisis de causa raíz (5-Why, Ishikawa, Fault Tree)
- **Reliability** — Weibull, MTBF, MTTR, disponibilidad
- **Analytics** — KPIs de cumplimiento, adherencia, atrasados
- **Reports** — exportes Excel/PDF, reportes de gestión
- **SAP PM** — sincronización bidireccional con SAP (BAPIs cableadas)
- **Audit Log** — trazabilidad completa de cambios
- **Agentic Capabilities** — funciones IA expuestas por separado

---

## 2. Stack técnico

### Backend

- **FastAPI** (Python 3.13)
- **SQLAlchemy 2.0** + **SQLite** (prod single-tenant)
- **Pydantic v2** para validación
- **WebSocket** (`/ws/{plant_id}?token=…`) para realtime push
- **JWT** auth con `token_version` para revocación
- **bcrypt** para passwords
- **Anthropic SDK** (Claude Vision, Sonnet, Haiku) para IA agéntica
- **PyRFC** para BAPIs SAP (cableado, en stub-mode hasta credenciales reales)

### Frontend

- **React 19** + **Vite**
- **Tailwind CSS** (paleta verde corporativa VSC)
- **Lucide icons**
- **react-router-dom**
- **Sentry** para error tracking en prod
- **i18n** (ES / EN / AR con RTL)

### Infraestructura

- **Docker Compose** sobre Hetzner VPS (Frankfurt)
- **Containers**: `ocp-backend`, `ocp-frontend`, `ocp-nginx`, `ocp-redis`
- **nginx** reverse proxy + SSL via Let's Encrypt
- **Host port 8020** (mapeado a 443 público)
- **Deploy**: `git push vps feature/multi-plant && deploy.sh frontend|api|all`

### Datos

- 90 tablas SQLite
- ~10 000 equipment nodes (jerarquía Goldfields completa)
- ~180 work requests, ~140 managed WOs, ~30 técnicos
- Multi-plant scaffolding (4 plantas configurables vía `_PLANT_DEFAULTS`)

---

## 3. Arquitectura

### High-level

```
       ┌──────────────────────────────────────────────────┐
       │                  NGINX (443)                      │
       │  /api/v1/* → backend    /* → frontend SPA         │
       │  /ws/* → backend WS     /dms/* → static PDFs      │
       └─────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴───────────────┐
        │                                │
        ▼                                ▼
   ┌──────────┐                  ┌──────────────┐
   │ Frontend │                  │   Backend    │
   │  React   │                  │   FastAPI    │
   │  + Vite  │                  │   Python 3.13│
   └──────────┘                  └──────┬───────┘
                                         │
                              ┌──────────┼──────────┐
                              │          │          │
                              ▼          ▼          ▼
                       ┌──────────┐ ┌────────┐ ┌─────────┐
                       │ SQLite   │ │ Redis  │ │Anthropic│
                       │ ocp.db   │ │ cache  │ │  API    │
                       └──────────┘ └────────┘ └─────────┘
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │  SAP PM     │
                                            │  (BAPIs,    │
                                            │   stub-mode)│
                                            └─────────────┘
```

### Patrones de diseño

1. **Optimistic concurrency** (SF-562): cada mutación pasa version + `If-Match`. Si el version cambió, backend devuelve 409 y frontend resuelve conflict.
2. **Echo suppression** WebSocket: cada cliente etiqueta su `client_id`. El backend lo refleja en el broadcast. El frontend ignora eventos cuyo `origin_client_id` coincide con el suyo (evita doble-render).
3. **State machines explícitas** para WR y OT con `TRANSITIONS` dict — `_transition()` valida `current → target` antes de aplicar.
4. **3-document system** por deliverable IA: `_spec.yaml` (recipe), `_trace.md` (execution), `_feedback.md` (learning loop). Mandatory para output de agentes.
5. **Multi-tenant scaffolding**: `plant_id` en queries, `selected_plant` en `localStorage`, filtros server-side por rol.

---

## 4. Roles y permisos

| Rol | Acceso |
|---|---|
| `admin` | Todo (incluyendo reset DB, seed, audit log, user management) |
| `manager` | Lectura global + KPIs + algunos edits |
| `planner` | Planning, Scheduling, Backlog, Work Packages |
| `supervisor` | Identificación, Validación, Pre-close gates, Bandeja Cierre |
| `tecnico` | Failure Capture, Notif HH propio, Mobile capture |

JWT contiene `sub` (user_id), `role`, `ver` (token_version). Backend en cada request hace `payload["ver"] == user.token_version` → si no, devuelve 401 (logout fuerza re-login en todos los dispositivos).

---

## 5. Agentic IA — funciones operativas

### Ya implementadas

1. **Failure Capture AI Assist** — Claude Vision analiza foto del equipo → identifica falla, sugiere prioridad, llena título, suggested_action, materiales con SAP IDs, support equipment, work conditions LOTO, estimated_duration. **Rechaza fotos no-equipo** (placeholders, paisajes, screenshots).
2. **Priorización IA en WRs** — Claude lee la descripción + foto + historial del equipo, sugiere subir/bajar prioridad con razón en lenguaje natural. **Humano decide** (Aceptar / Rechazar). Una vez decidido, `priority_locked=true` impide auto-override IA.
3. **Vision identificación equipo** — compara TAG declarado vs equipo en foto → banner bloqueante si no coincide.
4. **Audio transcription** — captura de voz en sitio → transcribed automáticamente para descripción.
5. **Dedup detection** — busca WRs similares abiertas para el mismo equipo en últimos 30 días.
6. **Smart Assignment** (SF-568) — sugiere técnico óptimo por skills + disponibilidad.
7. **Análisis de fallas crónicas** (SF-582) — detecta equipos con >N fallas en M días.

### Cost tracking

Por cada invocación IA se registra el modelo, tokens, costo. Endpoint `/agentic/cost-summary` resume gasto diario/semanal. Modelos usados:

- **Claude Haiku 4.5** — clasificación rápida, dedup, sugerencias livianas
- **Claude Sonnet 4.6** — Vision, análisis de OT completa, RCA
- **Claude Opus 4.7** — solo para análisis profundos (FMECA, Weibull calibration)

---

## 6. Estado de calidad — bug-hunt 2026-05-07 + jornada presencial 2026-05-08

### Cobertura E2E hoy

Probado contra producción real (`mageam.com`) con DOM, no API stubs:

- ✅ Failure Capture wizard 3 pasos completo
- ✅ Identification + validación + decisión IA priority
- ✅ Vision AI con 3 fotos reales mineras (confidence 0.85-0.91)
- ✅ Auto-creación OT P1/P2 fast-track desde validación
- ✅ Planning con tooltip explicativo de Duración / Total HH
- ✅ Scheduling Weekly + Mass Change + Reprogramar vencidas
- ✅ Execution con búsqueda + race condition fix + bulk HH plan
- ✅ Pre-close gates con popovers `?` explicativos por gate
- ✅ Firma supervisor + PIN opcional para legal trace
- ✅ KPIs Dashboard ↔ Execution unificados
- ✅ Multi-idioma EN/ES/AR (RTL en árabe)
- ✅ Multi-tenant (4 plantas configurables)
- ✅ RCA push to FMECA (crea worksheet pre-poblado)
- ✅ RCA push to CAPA (crea ImprovementAction rows)

### Bugs fixeados (3 olas en 2 días)

19 fixes deployados en commits `7cbbf60`, `51c8472`, `5fa6072`, más ~12 commits previos de bug-hunt del viernes.

### Pendientes con ticket abierto

- **SF-604** — botones edición (audit completo, falta repro Jorge)
- **SF-652** — segunda reserva fallando (falta repro)
- **SF-653..665** — 13 tickets de la jornada presencial pendientes (features medianos/grandes + investigaciones que requieren reunión).

---

## 7. Deploy y operaciones

### Flujo estándar

```bash
# Local
git checkout feature/multi-plant
git pull
# … cambios …
git commit
git push vps feature/multi-plant

# VPS
ssh vps "cd /root/ASSET-MANAGEMENT-SOFTWARE && \
         git reset --hard <commit> && \
         /root/deploy.sh frontend --skip-tests"
```

`deploy.sh` admite: `all`, `api`, `frontend`. Sin tests por defecto (CI los corre antes).

### Backup

- `data/ocp.db` se backupea automáticamente antes de cualquier remediation script.
- Backups por fecha en `scripts/ams_backup.sh` (cron diario).

### Monitoreo

- Sentry frontend + backend (DSN configurable).
- Audit log inmutable en tabla `audit_log`.
- Health check endpoint `/api/v1/health`.
- WebSocket `/ws/{plant_id}` con ping cada 15s.

---

## 8. Roadmap actual (SP7-VSC, post jornada presencial)

### En implementación inmediata
- ✅ 7 quick wins de la jornada (ola 1)
- ✅ Política transversal pre-ejecución (ola 2)
- ✅ Confirms al borrar + flecha priority defensiva (ola 3)
- ✅ Auditoría BD + remediación + documentación (este reporte)

### Reunión lunes 2026-05-11 (input requerido)
- SF-656 Schedule Technicians fórmula HH
- SF-657 Trazabilidad / OTs huérfanas
- SF-658 Plantilla para bugs no replicables
- SF-659 OT ↔ Calendario sincronización
- SF-660 Política audit log

### Features grandes (próximos sprints)
- SF-655 Comentarios multimedia + agente IA
- SF-661 IA lee OT completa (7 funciones)
- SF-662 Logística estilo Rappi (módulo nuevo)
- SF-653/654 Edición OT con histórico + Sistema en Comentarios

### Decisiones de negocio pendientes
- SF-664 BD depurar vs BD nueva
- SF-665 Reactivar funciones externas

---

## 9. Referencias

- **Repo**: `feature/multi-plant` branch en GitHub `ValueStrategyConsulting/AMS-Production`
- **Main branch**: `demo-seed-data`
- **VPS**: Hetzner, `187.77.223.137`
- **Jira**: VSC site, project `SF`, épica `SF-3` AMS
- **Confluence**: `valuestrategyconsulting.atlassian.net`
- **Cliente piloto**: Gold Fields Salares Norte (mageam.com)

### Documentación complementaria

- `CLAUDE.md` — instrucciones para asistente IA (cómo construir deliverables, 3-document system)
- `docs/estrategia-y-sap-integracion.md` — análisis estrategia + integración SAP
- `docs/inconsistencias-datos-investigacion.md` — investigación inicial inconsistencias
- `docs/Notas_QA_Technical_Location.md` — notas de la jornada presencial 2026-05-08 (29 hallazgos + 10 features agénticos)
- `frontend/src/utils/README.md` — política transversal "antes del punto de ejecución"
- `audit_output/bd_audit_2026_05_11_final.md` — auditoría BD post-remediación
