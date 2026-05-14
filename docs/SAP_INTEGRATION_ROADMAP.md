# SAP Integration Roadmap — VSC / MAGEAM

Última actualización: 2026-05-14

## Dónde estamos hoy

**Fase Pre-0** (scaffold). En producción (mageam.com):

- Strategy Pattern transports: `dry_run` (activo) · `mock` · `odata`
- Mock SAP S/4HANA container (`ocp-sap-mock`) definido en `docker-compose.yml` — **no arrancado en VPS** (perfil `with-sap-mock` no activado)
- `apps/core/api/services/sap_rfc_connector.py` con `SAP_AVAILABLE=False` (pyrfc no instalado)
- UI SAP PM (2961 maint plans de seed data, no de SAP real)
- FMECA → IW22 export (genera XLS, no toca SAP)
- SAP Upload Package lifecycle (genera bundle, no lo sube)

Endpoint verificación: `GET /api/v1/sap/transport/info` → `{name:"dry_run", healthy:true}`

## Roadmap

### Track A — Goldfields-facing (VPS, sin downloads pesados)

| # | Hito | Esfuerzo | Estado |
|---|---|---|---|
| A1 | Activar perfil `with-sap-mock` en `docker-compose` VPS | 1 h | Pendiente |
| A2 | Backend lee `SAP_TRANSPORT=mock` en `.env` VPS → UI SAP PM live | 2 h | Pendiente |
| A3 | OAuth2 client credentials en `OData transport` (paralelo a APIKey) | 4 h | Pendiente |
| A4 | `.env.example.goldfields-sap` con campos a pedir a IT cliente | 1 h | ✅ Hecho |
| A5 | Sub-tab "SAP Connection" en `/settings` (paste BTP destination + test) | 1 día | Pendiente |
| A6 | Workshop Andrea + Jorge Alquinta → confirmar plan piloto | — | Programado |
| A7 | Recibir credenciales BTP de Goldfields | — | Bloqueado por cliente |
| A8 | Piloto contra QAS Goldfields (read-only) | 2-3 días | Bloqueado por A7 |

### Track B — Prometheus-grade (PC local David, lo pesado)

| # | Hito | Esfuerzo | Costo | Estado |
|---|---|---|---|---|
| B0 | Docker pull `sapse/abap-platform-trial` (~30 GB) en PC David | descarga | $0 | Parqueado |
| B1 | Instalar SAP NW RFC SDK + `pip install pyrfc>=2.8` | 2 h | $0 | Parqueado |
| B2 | Configurar `SAP_TRANSPORT=rfc` contra Dev Edition local | 4 h | $0 | Parqueado |
| B3 | Probar BAPIs: `BAPI_ALM_ORDER_MAINTAIN`, `BAPI_EQUI_GETLIST`, `BAPI_ALM_NOTIF_*` | 2-3 días | $0 | Parqueado |
| B4 | Demo: crear aviso Z1 desde MAGEAM → ver en SAP GUI Dev Edition | 1 día | $0 | Parqueado |
| B5 | BTP Trial account + Cloud Connector (expone ABAP local) | 1 sem | $0 | Parqueado |
| B6 | ICC Certification (SAP Certified Integration) | 6-12 meses | $3.5k + $1k/año | Parqueado |
| B7 | PartnerEdge Open Ecosystem | papeleo | $2k/año | Parqueado |
| B8 | (Opcional moat) Add-on ABAP propio + namespace SAP | 6-12 meses | $50k+ | Parqueado |

## Stack comprometido con Goldfields (Track A)

```
MAGEAM backend (FastAPI, VPS)
  → OData REST + OAuth2 client credentials
  → SAP BTP Destination (Goldfields tenant)
  → Cloud Connector (Goldfields data center)
  → SAP QAS/PRD (Goldfields Salares Norte)
```

**Goldfields acepta**: Cloud Connector + BTP destinations + named technical user + IP whitelist (patrón recomendado por SAP).
**Goldfields rechaza**: REST directo, Selenium/Playwright sobre SAP GUI for HTML.

## Comparativa honesta con Prometheus

| Capa | Prometheus | MAGEAM hoy | Gap |
|---|---|---|---|
| UX maintenance suite | 20 años madurez | Cubre flujos principales + IA | 70% paridad |
| Capture (móvil/voz/QR) | App industrial | PWA field app + IA | 60% paridad |
| Mock SAP / seed | N/A | UI SAP PM con seed | 100% (ficción) |
| OData S/4 connector | Maxavera certificado | APIKey only, sin OAuth2/BTP | 10% |
| PyRFC / BAPI on-prem | Producto core | Stub `SAP_AVAILABLE=False` | 5% |
| Add-on ABAP en SAP cliente | Su moat real (1998+) | NO | 0% |
| Certificación SAP (ICC) | Sí | NO | 0% |
| Clientes con SAP integrado | Cientos | 0 | 0% |
| **Total integración SAP** | 100% | **~5%** | — |

Para llegar a **paridad funcional sin moat ABAP**: ~12 meses + ~$10k/año post-certificación.
Para tener **moat tipo Prometheus** (add-on ABAP propio): +$50k + 6-12 meses dev ABAP.

## Próximo paso concreto

Track A1-A2: arrancar mock SAP en VPS y conectar UI SAP PM al transport mock. Eso da una demo SAP "viva" para Goldfields sin esperar credenciales BTP.
