# Plan de capacidad, hosting y RAG — MAGEAM

> Estado: planificación 2026-04-30 · Autor: David Cabezas
> Disparador: 93 usuarios totales potenciales (incidente Hostinger reveló cuello de botella) + funciones agénticas Phase 2 que requieren RAG.
> Decisión tentativa: migrar a **Vultr Santiago** + agregar Redis + preparar infra RAG.

---

## 1. Diagnóstico de capacidad actual

### Setup hoy
- **VPS**: Hostinger KVM 2 — 2 vCPU, 4 GB RAM, 100 GB disco. CPU en uso 7%, RAM 32%, disco 52 GB usados.
- **DB**: SQLite (1 archivo, 1 escritor concurrente).
- **Backend**: FastAPI + uvicorn 1 worker (limitación intencional por WebSocket state in-process — ver Dockerfile línea ~50).
- **Frontend**: Vite served via nginx.
- **Cache**: ninguno (queries pegan DB cada vez).
- **WebSocket**: state en memoria del único worker (`api/services/ws_manager.py`).
- **LLM**: Anthropic API (Claude Sonnet 4.6), sin retry, sin queue.
- **Costo actual**: ~$15/mes Hostinger + ~$15/mes Anthropic (con uso real de Goldfields).

### Aguante real (estimado, no medido)

| Carga concurrente | Setup actual | Riesgo |
|---|---|---|
| 5–10 users | ✅ funciona bien | Bajo |
| 15–20 users | ⚠️ degrada en endpoints pesados (PA, Pareto, page-data) | Medio |
| 30+ users | ❌ SQLite locks, WS lag, OOM probable | Alto |

### Cuellos de botella en orden
1. **Queries pesadas sin cache** (Performance Analysis, Pareto, page-data, gantt): cada user que abre PA dispara 6-10 queries SQLite + 4 llamadas Claude. Con 10 users concurrentes → 60+ queries simultáneas + 40 llamadas Claude paralelas.
2. **SQLite write lock**: notificaciones parciales, updates de OT, drag-drop en scheduling. Con 5+ writers simultáneos hay lock contention real.
3. **Anthropic rate limit**: ~50 req/min en tier estándar. 100 users abriendo `/agentic-capabilities` o `/performance-analysis` simultáneamente lo satura.
4. **WS in-process**: 1 worker = todos los WS por el mismo proceso. Subir a 4 workers ahora rompe WS broadcast.

---

## 2. Target: 100 usuarios totales (~15-20 concurrentes pico)

Regla industrial: ~15-20% concurrent active de la base total. Con 100 totales esperamos pico 15-20.

### Plan de cambios por ROI (orden de impacto/costo)

| # | Cambio | Tiempo | Costo | Beneficio |
|---|---|---|---|---|
| 1 | **Redis cache** para queries pesadas (TTL 60-120s) | 4-6 hrs | $0 (Redis local) | -70% load DB en endpoints más pegados |
| 2 | **VPS upgrade** a 4 vCPU / 8 GB | 5 min + reboot | +$15-20/mes | x2 RAM, headroom para Redis + RAG |
| 3 | **Migración Hostinger → Vultr Santiago** | 4-6 hrs | similar | uptime y latencia mucho mejor |
| 4 | **Migrar ws_manager → Redis pub/sub** | 1-2 días | $0 | Habilita gunicorn -w 4 sin perder WS |
| 5 | **gunicorn -w 4** (después de #4) | 30 min | $0 | x4 throughput real |
| 6 | **PostgreSQL + pgvector** (sólo si SQLite truena con monitoring) | 2-3 días | $0 (mismo VPS) | Escrituras paralelas + base para RAG nativa |

**Recomendación para arrancar (orden de ataque)**:
- **Fase 1 (esta semana)**: #1 + #2 + #3 → soporta 25-30 concurrentes cómodo, mejor uptime.
- **Fase 2 (cuando llegue a 25 reales)**: #4 + #5.
- **Fase 3 (cuando SQLite muestre locks en logs)**: #6.

---

## 3. Decisión de hosting: Vultr Santiago

### Por qué se descarta Hostinger
- **Incidente 2026-04-30**: VPS unreachable durante demo, panel decía "Funcionando" mintiendo.
- Soporte lento, sin SLA.
- Sin servidores en Chile/LATAM (datacenter en EU/US → +200ms latencia).

### Comparativa (KVM 2 → 4 vCPU, 8 GB RAM)

| Provider | Datacenter más cercano a Chile | Precio (4 vCPU/8 GB) | Pros | Contras |
|---|---|---|---|---|
| **Vultr** ✅ elegido | **Santiago de Chile** | $24/mes | Latencia mínima Chile, network confiable, snapshots, soporte 24/7 | — |
| Hetzner | Helsinki / Falkenstein | $15/mes | Más barato, infraestructura sólida | +200ms latencia LATAM |
| DigitalOcean | São Paulo (más cerca que EU) | $48/mes | Documentación excelente | Más caro |
| Linode (Akamai) | Miami | $24/mes | Buena red | Lejos de Chile |
| AWS Lightsail | Virginia / São Paulo | $40/mes | Confiable | Más caro, complejo |

### Plan de migración Hostinger → Vultr
1. Crear instancia Vultr Cloud Compute en Santiago (4 vCPU, 8 GB, 80 GB SSD NVMe).
2. Apuntar `mageam.com` → IP Vultr en Cloudflare (low TTL días antes).
3. `git clone` repo en Vultr, `docker compose up -d`.
4. Migrar `ocp_db_data` volume (snapshot Hostinger → tar → scp → restore en Vultr).
5. Cutover DNS → confirmar funciona → bajar Hostinger.
6. Mantener Hostinger 30 días como backup pasivo, después dar de baja.

**Ventana de downtime esperada**: 30-60 min en cutover (en horario nocturno fin de semana).

---

## 4. Infra RAG (Phase 2 — funciones agénticas pendientes)

Las 4 cards de Capa 6 que requieren RAG (`docs/AGENTIC_SOLUTIONS_ROADMAP.md` + `Ayudas/GUIA_RAG.md`):

| # | Capacidad | Tipo de RAG | Stack mínimo |
|---|---|---|---|
| #34 | Shift Handover Assistant | Vectorial sobre OTs cerradas + execution_notes del turno | LanceDB + MiniLM |
| #35 | Post-Maintenance Learning | Vectorial sobre cierres + RCAs (causas → soluciones efectivas) | LanceDB + MiniLM |
| #40 | Knowledge Base Curator | Vectorial sobre manuales OEM + cierres + RCAs + FMECA worksheets | pgvector si migra Postgres |
| #33 | RCM Strategy Advisor | Híbrido: estadística Weibull + retrieval de OTs similares + Claude analiza | LanceDB + Weibull existente |

### Decisión vector DB

**Opción A — LanceDB (recomendada para arrancar)**
- 1 archivo en disco, sin servicio extra.
- Embeddings con `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (local, CPU, 384-dim).
- Costo $0, RAM extra ~500 MB para el modelo.
- Apto hasta ~1M chunks.

**Opción B — pgvector** (si ya migramos a Postgres)
- Tabla `embeddings` con extensión vectorial.
- Mismo Postgres que app data → 1 menos servicio.
- Permite joins SQL: "OTs cerradas similares a esta + costos".
- Recomendado a partir del segundo cliente o si reaching 1M chunks.

**Opción C — Qdrant cloud** (si crecemos a multi-tenant)
- Servicio dedicado, gestión cero.
- ~$25/mes hosted.
- Sólo justifica si ya >5 clientes.

**Decisión actual**: empezar con **LanceDB local + MiniLM** (Opción A). Migrar a pgvector cuando tengamos Postgres.

### Costos LLM con RAG

- Embedding cada chunk una vez (MiniLM local = $0).
- Por query RAG: 1 embedding (gratis) + 1 llamada Claude con contexto retrieved.
- Contexto típico: 5 chunks × 500 tokens = ~2500 tokens input + ~300 output = ~$0.012/query.
- Estimado con 100 users y uso moderado de RAG (10 queries/user/día): 1000 queries/día × $0.012 = ~$12/día = **~$360/mes** Anthropic adicional para Phase 2.

### Capacidad RAM con RAG

| Componente | RAM aprox |
|---|---|
| Backend FastAPI | 200 MB |
| Frontend (nginx) | 50 MB |
| Redis | 100-200 MB |
| LanceDB index (~50K chunks) | 300 MB |
| MiniLM model loaded | 500 MB |
| Embeddings cache | 200 MB |
| **Total backend RAG-ready** | **~1.5 GB** |

Con 8 GB del Vultr → margen amplio para 100 users.

---

## 5. Métricas a monitorear cuando llegue a producción

Agregar antes del go-live con 93 users:
1. **Sentry** (frontend + backend) → ya está configurado pero verificar que llegue al dashboard.
2. **VPS metrics** (Vultr panel + node_exporter): CPU, RAM, disk I/O, network.
3. **DB locks SQLite**: log warning si `OperationalError: database is locked` aparece >0.
4. **Anthropic spend**: dashboard Anthropic + alerta si pasa $X/día.
5. **Latencia endpoints**: middleware que loguea p95/p99 de cada endpoint, alerta si p99 > 5s.
6. **WS connection count**: gauge en `/health` con número de conexiones activas.

Umbrales de alerta:
- CPU sostenido > 70% durante 10 min → ampliar vCPU.
- RAM > 80% sostenido → ampliar RAM o investigar leak.
- DB locks > 5/min → migrar a Postgres ya.
- Latencia p99 > 8s en `/analytics/page-data` → cache TTL más largo o queries optimizadas.
- Anthropic spend > $30/día → cache RAG más agresivo o modelo más barato (Haiku para clasificaciones simples).

---

## 6. Costo total mensual estimado al estado final (Vultr + RAG en producción con 100 users)

| Concepto | Costo mensual |
|---|---|
| VPS Vultr Santiago (4 vCPU, 8 GB, 80 GB) | $24 |
| Anthropic API (uso actual + RAG Phase 2) | ~$30 (PA actual) + ~$30 (RAG Phase 2 baja intensidad) = **$60** |
| Backups (Vultr snapshot semanal) | $5 |
| Dominio + Cloudflare Free | $0 |
| **TOTAL** | **~$89/mes** |

Margen para crecimiento: si llegamos a 200 users o más, upgrade a 6 vCPU / 16 GB ($48/mes Vultr) — sigue siendo <$120/mes total, manejable comercialmente.

---

## 7. Próximos pasos concretos

- [ ] **Esta semana**: Redis cache (Fase 1 #1), upgrade VPS Hostinger (Fase 1 #2) o ya migrar a Vultr (Fase 1 #3).
- [ ] **Próxima semana**: instrumentar métricas (Sentry, latency middleware, db lock counter).
- [ ] **Antes de invitar 93 users**: load test sintético (locust o k6) simulando 30 concurrent → validar que no cae.
- [ ] **Phase 2 RAG (después de soak Phase 1)**: implementar LanceDB + MiniLM + endpoints #34/#35/#40.
- [ ] **Cuando aparezca primer DB lock real**: migrar a Postgres + pgvector.

---

## 8. Decisiones tomadas hoy

- ✅ Hosting: **Vultr Santiago** ($24/mes).
- ✅ DB inicial: SQLite + Redis cache (no migrar Postgres todavía).
- ✅ Vector DB inicial: **LanceDB local** + MiniLM multilingüe.
- ✅ WebSocket: mantener -w 1 hasta migrar a Redis pub/sub.
- ✅ Workers: 1 hasta tener pub/sub, después 4.
- ⚠ Pendiente: timing de migración Hostinger → Vultr (depende de cuándo confirmamos los 93 users).

---

*Documento vivo · actualizar tras cada decisión de infra.*
