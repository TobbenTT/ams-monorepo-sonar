# syntax=docker/dockerfile:1.7
FROM python:3.13-slim

WORKDIR /app

# Solo lo que necesita el mock — imagen ligera
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-warn-script-location \
        fastapi==0.133.1 \
        "uvicorn[standard]==0.41.0" \
        sqlalchemy==2.0.47 \
        pydantic==2.12.5

COPY . /app/sap_mock/server/

# Datos persistentes en /data (montar como volume)
RUN mkdir -p /data \
    && useradd -m -u 1001 sapmock \
    && chown -R sapmock:sapmock /data /app
USER sapmock

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz').read()" || exit 1

CMD ["uvicorn", "sap_mock.server.main:app", "--host", "0.0.0.0", "--port", "8000"]
