# SPIKE-1: Evaluación de despliegue Azure vs Google Cloud (SF-629)

**Fecha:** 2026-05-05
**Stack actual:** Hetzner VPS (Ubuntu 24.04) · 96GB SSD · 8GB RAM · Docker Compose · SQLite + LanceDB
**Costo actual aprox:** ~25 EUR/mes

## Contexto

AMS-Production corre hoy en una VPS de Hetzner con 12 proyectos coexistiendo. Para escalar a múltiples plantas (Gold Fields, OCP-Maroc, FluorAlpha) sin riesgo cruzado y con SLA de cliente minero, se evalúa migrar a una nube hyperscaler.

## Comparativo

### Compute (backend FastAPI + frontend Vite/Nginx)

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Equivalente | App Service / Container Apps | Cloud Run |
| Modelo facturación | vCPU-seg + memoria | vCPU-seg + memoria + requests |
| Cold start (containerized) | 2-5s | 0.5-2s |
| Auto-scale a 0 | Sí (Container Apps) | Sí (Cloud Run) |
| Costo 1 vCPU + 2GB always-on (24×30) | ~$60/mes | ~$50/mes |
| Concurrent requests por instancia | 10-100 (configurable) | 80-1000 (configurable) |

### Persistencia (BD)

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Postgres managed | Azure Database for PostgreSQL | Cloud SQL Postgres |
| Tier mínimo razonable | Burstable B1ms (1 vCPU 2GB) ~$12/mes | db-f1-micro (0.6GB) ~$10/mes pero suben rápido |
| Backups automáticos | Sí, 7 días incluido | Sí, 7 días incluido |
| Networking | VNet integration | VPC peering / Private IP |

### Storage (fotos, DMS PDFs, audio capturas)

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Object storage | Blob Storage (Hot tier) | Cloud Storage (Standard) |
| Costo /GB/mes | ~$0.018 | ~$0.020 |
| Egress 1TB | ~$87 | ~$85 |
| URLs firmadas | SAS tokens | Signed URLs |

### IA / LLM

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Hosted Claude | ❌ (Anthropic API directo) | ❌ (Anthropic API directo) |
| Vertex AI / Azure OpenAI | Sí (GPT-4o, Claude via marketplace) | Sí (Gemini 1.5 Pro/Flash) |
| Vector DB managed | Cosmos DB con vector search | Vertex AI Vector Search / AlloyDB |
| LanceDB hosted? | No nativo, autohostear en VM | No nativo, autohostear en VM |
| Latencia desde Chile/Marruecos | Mejor con regiones Brazil South / France Central | Mejor con regiones South America East / Europe West |

### Networking & Multi-región

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Regiones LATAM | Brazil South (São Paulo) | South America East (São Paulo), Santiago (~2026) |
| Regiones EU | Multiple, France Central activo | Europe West (Bélgica/Holanda) |
| CDN | Front Door / Azure CDN | Cloud CDN |
| Certificate management | Auto-renew con App Service | Auto-renew con managed certs |

### DevOps / CI

| Atributo | **Azure** | **Google Cloud** |
|---|---|---|
| Container Registry | ACR | Artifact Registry |
| CI/CD nativo | Azure DevOps / GitHub Actions integration | Cloud Build + GitHub trigger |
| Secrets | Key Vault | Secret Manager |
| Observability | Application Insights (incluido en App Service) | Cloud Logging + Cloud Monitoring + Cloud Trace |

## Costos estimados — escenario AMS multi-planta (3 plantas)

Asumiendo:
- 1 backend (1 vCPU 2GB) + 1 frontend (0.5 vCPU 0.5GB) por planta = 3 backends + 3 frontends
- Postgres compartido (4 vCPU 16GB)
- Object storage 200GB con 50GB egress/mes
- 50K req/día agregado

| Capa | **Azure** | **GCP** |
|---|---|---|
| Compute (3 backends + 3 frontends) | ~$220/mes | ~$170/mes |
| Postgres (4 vCPU 16GB) | ~$280/mes | ~$310/mes |
| Object storage 200GB + egress | ~$8/mes | ~$8/mes |
| Networking | ~$30/mes | ~$30/mes |
| Observability | incluido | ~$20/mes |
| **Total estimado** | **~$540/mes** | **~$540/mes** |

## Recomendación

**Empate técnico, con ligera ventaja para GCP por:**

1. **Cloud Run** tiene el mejor scale-to-zero del mercado para nuestro patrón "API por planta con uso variable" — paga solo lo usado.
2. **Cold start menor** (~1s vs 3-5s en Azure) — relevante para móvil del técnico capturando fallas.
3. **Vertex AI** + Gemini Flash es mejor relación precio/latencia que Azure OpenAI para tasks ligeras (clasificación, dedup) — Claude API se mantiene para razonamiento complejo.
4. **Artifact Registry + Cloud Build** mejor integrado con GitHub que Azure DevOps si seguimos con GitHub.

**Ventaja de Azure:** si Gold Fields ya usa Office 365 / Microsoft 365 corporativo, Azure AD SSO sale "gratis". GCP requiere Workspace Identity Federation (más config).

## Plan de migración propuesto (si se aprueba)

**Fase 1 (1 semana):** Postgres managed + migración de SQLite con script (`api/database/connection.py` ya soporta `DATABASE_URL` postgres).

**Fase 2 (2 semanas):** containerizar para Cloud Run / Container Apps. La imagen actual (`asset-management-software-ocp-backend:latest`) ya es OCI estándar. Setup CI: GitHub Actions push → Artifact Registry → Cloud Run rollout.

**Fase 3 (1 semana):** Object storage para `data/` (fotos + DMS) — refactor `documents` JSON para guardar URLs firmadas en vez de base64.

**Fase 4 (1 semana):** WS sticky sessions (Cloud Run requiere session affinity habilitada o sustitución por SSE).

**Fase 5:** observability + alertas + cutover producción.

**Total: ~5 semanas para migración full** + 1 semana de pre-producción paralela.

## Riesgos

- **Costo runaway si tráfico real > estimado**: ambas nubes facturan por uso. Configurar budget alerts mandatorio.
- **WS conn churn en Cloud Run scale-down**: requiere session affinity o reconnect aggressive (ya implementado en `wsSingleton.js`).
- **LanceDB**: ninguna nube tiene managed equivalent. Opciones: a) Vertex AI Vector Search (GCP); b) Cosmos DB con vector search (Azure); c) self-host LanceDB en VM dedicada.
- **Datos sensibles del cliente** (Gold Fields confidencialidad): verificar región y compliance ISO 27001. Ambas nubes lo cumplen pero requiere paperwork.

## Siguiente paso recomendado

Si la decisión apunta a migrar:
1. Cotización formal Azure y GCP con TAM (Technical Account Manager) para descuentos por volumen anual.
2. POC de 2 semanas: levantar 1 entorno staging en GCP (Cloud Run + Cloud SQL) y comparar costo + latencia real con la VPS Hetzner actual.
3. Decisión final post-POC con datos reales.

**Si la prioridad es estabilidad inmediata sin scope nuevo de migración**, mantener Hetzner VPS con upgrade a 16GB RAM + segundo VPS para staging es la opción más eficiente (~$50/mes total, sin cambio operacional).
