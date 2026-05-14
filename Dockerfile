# syntax=docker/dockerfile:1.7
# ── Stage 1: Build dependencies ──────────────────────────────────────
# Security parcheo: confiamos en base image python:3.13-slim (Debian 13 trixie)
# que ya trae fixes upstream. apt-get upgrade removido para no invalidar caché
# en cada build; se vuelve a aplicar via rebuild periódico cuando sale base nueva.
FROM python:3.13-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip setuptools

# Fase C: pyproject.toml por servicio. Copiamos los manifests primero para
# aprovechar cache de Docker — si solo cambia código (no deps), pip install
# usa la capa cacheada.
COPY apps/core/pyproject.toml /tmp/pyproject/apps/core/
COPY apps/sap_mock/pyproject.toml /tmp/pyproject/apps/sap_mock/
COPY packages/tools/pyproject.toml /tmp/pyproject/packages/tools/
COPY packages/agents/pyproject.toml /tmp/pyproject/packages/agents/
COPY packages/skills/pyproject.toml /tmp/pyproject/packages/skills/

# Internal workspace packages como editable (no necesitan código todavía,
# setuptools resuelve los pyproject; el código se monta vía COPY más adelante).
# Para no tener que clonar el código en el builder, instalamos solo las deps
# transitivas declaradas en cada pyproject — el código vivo se importa vía
# PYTHONPATH en runtime.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install \
        # Deps explícitas de ams-core (apps/core/pyproject.toml)
        "fastapi==0.133.1" "uvicorn[standard]==0.41.0" "gunicorn==25.1.0" \
        "python-multipart==0.0.26" "sqlalchemy==2.0.47" "pydantic==2.12.5" \
        "python-dotenv==1.2.2" "python-dateutil==2.9.0.post0" "httpx==0.28.1" \
        "PyJWT[crypto]==2.12.0" "bcrypt==4.2.1" "pyotp==2.9.0" "qrcode==7.4.2" \
        "anthropic==0.83.0" "python-docx==1.1.2" "python-pptx==1.0.2" \
        "openpyxl==3.1.5" "xlrd==2.0.1" "sentry-sdk[fastapi]==2.19.0" \
        "PyYAML>=6.0" \
        # Test extras
        "pytest==9.0.3" "pytest-asyncio>=0.23.0" && \
    pip install --prefix=/install --upgrade \
        'python-jose[cryptography]>=3.4.0' \
        'cryptography>=42.0.4' \
        'anyio>=4.4.0' \
        'idna>=3.7' \
        'certifi>=2024.7.4'

# Slim 2026-05-13 (David): /install pesaba 6 GB. Cleanup pre-COPY para bajar
# la imagen runtime sin tocar funcionalidad. Ahorro esperado ~1-1.5 GB.
# 1) bytecode + tests embebidos en site-packages
# 2) docs/man/locale/headers (no usados en runtime)
# 3) .dist-info excepto METADATA + LICENSE (pip los necesita, lo demás no)
# 4) strip de .so (debug symbols de torch/numpy/pyarrow son ~150-300 MB)
RUN apt-get update && apt-get install -y --no-install-recommends binutils \
    && rm -rf /var/lib/apt/lists/* \
    && find /install -depth -type d -name '__pycache__' -exec rm -rf {} + \
    && find /install -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete \
    && find /install/lib -type d \( -name 'tests' -o -name 'test' \) -prune -exec rm -rf {} + 2>/dev/null || true \
    && rm -rf /install/share/doc /install/share/man /install/share/locale /install/include \
    && find /install -type d -name '*.dist-info' | while read dir; do \
         find "$dir" -mindepth 1 -maxdepth 1 ! -name 'METADATA' ! -name 'LICENSE*' ! -name 'RECORD' ! -name 'WHEEL' ! -name 'top_level.txt' -exec rm -rf {} +; \
       done \
    && find /install -type f -name '*.so' -exec strip --strip-unneeded {} + 2>/dev/null || true \
    && du -sh /install

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

# Monorepo layout: imports `from api.x` y `from tools.x` se resuelven via
# PYTHONPATH apuntando a apps/core/ (donde vive api/) y packages/ (tools,
# agents, skills). Evita tener que refactorizar 100+ archivos de imports.
ENV PYTHONPATH=/app/apps/core:/app/packages:/app/apps

# Single-worker es requerido: WebSocket state (ws_manager) es in-process.
# Multi-worker requeriría Redis pub/sub.
RUN date +%s > /app/.build_timestamp \
    && mkdir -p /app/data \
    && useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["gunicorn", "api.main:app", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
