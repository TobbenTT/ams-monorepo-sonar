# ── Stage 1: Build dependencies ──────────────────────────────────────
# Security parcheo 2026-04-24: python:3.11-slim (auto-latest patch) en lugar
# de pin a 3.11.11 — toma updates de OS packages (libssl, libsqlite3, glibc,
# gpgv, libxml2, perl, libtiff, libcap, etc) sin bumpear minor de Python.
FROM python:3.11-slim AS builder

WORKDIR /app

# apt-get upgrade trae los security patches de Debian (libsqlite3, libssl3,
# openssl, gpgv, libc-bin, libxml2, perl-base, libtiff, libcap2, etc).
# Cubre ~40 CVEs OS-level del scan 2026-04-24.
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    gcc \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Bump pip + setuptools antes de instalar deps (CVE en setuptools 65.5.1 → 78.1.1).
RUN pip install --no-cache-dir --upgrade pip setuptools

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
# Override transitive deps con CVEs (python-jose viene de anthropic SDK):
RUN pip install --no-cache-dir --prefix=/install --upgrade \
    'python-jose[cryptography]>=3.4.0' \
    'cryptography>=42.0.4' \
    'anyio>=4.4.0' \
    'idna>=3.7' \
    'certifi>=2024.7.4'

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Mismo apt upgrade en runtime para parchear OS del final image.
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Bump pip/setuptools también en runtime.
RUN pip install --no-cache-dir --upgrade pip setuptools

# Copy only installed packages from builder (no gcc in final image)
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Stamp build time so /health build hash changes on every deploy
RUN date +%s > /app/.build_timestamp

# Create data directory and non-root user
RUN mkdir -p /app/data \
    && useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Start server (tables created via lifespan, seed via POST /api/v1/admin/seed)
# Single worker is required because WebSocket state (ws_manager) is in-process.
# Going multi-worker would need Redis pub/sub so broadcasts reach all clients,
# regardless of which worker they landed on. For ~10 concurrent users uvicorn
# async single-worker is fine — swap to Redis pub/sub if concurrency grows.
CMD ["gunicorn", "api.main:app", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
