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

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install \
        --extra-index-url https://download.pytorch.org/whl/cpu \
        torch==2.5.1+cpu

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt && \
    pip install --prefix=/install --upgrade \
        'python-jose[cryptography]>=3.4.0' \
        'cryptography>=42.0.4' \
        'anyio>=4.4.0' \
        'idna>=3.7' \
        'certifi>=2024.7.4'

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

# Single-worker es requerido: WebSocket state (ws_manager) es in-process.
# Multi-worker requeriría Redis pub/sub.
RUN date +%s > /app/.build_timestamp \
    && mkdir -p /app/data \
    && useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["gunicorn", "api.main:app", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
