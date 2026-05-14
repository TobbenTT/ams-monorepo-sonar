# AMS — Monorepo guide

Estructura post-restructure (rama `chore/repo-restructure`):

```
ams/
├── apps/                       Servicios deployables
│   ├── core/                   ams-core — FastAPI backend
│   │   ├── api/                código Python (importable como `api.*`)
│   │   └── pyproject.toml      deps explícitas del servicio
│   ├── admin/                  ams-admin — React admin (Vite + nginx)
│   ├── field/                  ams-field — React mobile (pendiente Dockerfile)
│   └── sap_mock/               ams-sap-mock — OData S/4HANA mock
│       ├── server/             FastAPI mínimo
│       └── pyproject.toml
├── packages/                   Libs internas reusables
│   ├── tools/                  engines + schemas (sin web)
│   ├── agents/                 AI agents (orchestrator + 3 specialists)
│   └── skills/                 skill definitions (.md + helpers)
├── infrastructure/             ops
│   ├── nginx/                  nginx.conf + gzip.conf
│   └── certs/                  TLS
├── assets/                     branding (logos)
├── data/                       runtime data
│   ├── clients/                client folders (gitignored mostly)
│   ├── seeds/                  Excel seeds
│   └── outputs/                AMS deliverable outputs
├── docs/                       documentation
│   ├── meetings_raw/           dailies + transcripts
│   ├── notes_raw/              brainstorming
│   └── screenshots/
├── scripts/                    dev/ETL scripts
├── tests/                      cross-package tests
├── conftest.py                 root pytest config (sys.path injection)
├── pyproject.toml              workspace root (uv-compatible)
├── requirements.txt            DEPRECATED — see pyproject
└── Dockerfile                  ams-core image
```

## Imports

Los imports se preservan **sin tocar el código** vía `PYTHONPATH`:

```
PYTHONPATH=/app/apps/core:/app/packages:/app/apps
```

Esto permite que `from api.x import y`, `from tools.x import y`, `from sap_mock.x import y`, etc. sigan funcionando.

Para local: `conftest.py` raíz inyecta los mismos paths en `sys.path`.

## Comandos típicos

### Local dev

```bash
# Tests
pytest tests/

# Backend
uvicorn api.main:app --reload --port 8000

# Frontend admin
cd apps/admin && npm run dev
```

### Docker (stack monolítico)

```bash
docker compose up -d
```

### Docker (split — un servicio a la vez)

```bash
docker compose -f docker-compose.split.yml --profile core up -d
docker compose -f docker-compose.split.yml --profile admin up -d
docker compose -f docker-compose.split.yml --profile sap up -d
docker compose -f docker-compose.split.yml --profile all up -d
```

## Cómo añadir una dep nueva

1. Identifica a quién pertenece (servicio o lib).
2. Edita el `pyproject.toml` de ese paquete.
3. Para CI/Docker prod: añadirla también al `pip install` del `Dockerfile` (`apps/core` instala explícito por ahora — el lockfile pyproject está pendiente).
4. Local: `pip install -e apps/core` recoge el cambio.

## Cómo añadir un servicio nuevo

1. `mkdir -p apps/<nombre>/`
2. Copiar `apps/sap_mock/pyproject.toml` como template y ajustar.
3. Añadir entry en `docker-compose.split.yml` con su profile.
4. Añadir Dockerfile.
