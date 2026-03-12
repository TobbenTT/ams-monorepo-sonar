# ── Stage 1: Build dependencies ──────────────────────────────────────
FROM python:3.11.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM python:3.11.11-slim

WORKDIR /app

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
CMD ["gunicorn", "api.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
