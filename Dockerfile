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

COPY requirements.txt .

# RAG eliminado 2026-05-13 (David): torch CPU se instalaba acá como dep de
# sentence-transformers. Como RAG ya no se incluye, no necesitamos torch.
# Ahorro: ~750 MB.

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt && \
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
