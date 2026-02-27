#!/bin/bash
# OCP Maintenance AI — Quick Start Script

set -e

# Load port config from .env if it exists
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-8501}
NGINX_PORT=${NGINX_PORT:-8080}

echo "============================================"
echo "  OCP Maintenance AI MVP"
echo "  Starting with Docker Compose..."
echo "============================================"

# Build and start all services
docker compose up --build -d

echo ""
echo "Services starting..."
echo "  Backend:  http://localhost:${BACKEND_PORT}"
echo "  Frontend: http://localhost:${FRONTEND_PORT}"
echo "  App:      http://localhost:${NGINX_PORT} (via nginx)"
echo "  API Docs: http://localhost:${NGINX_PORT}/docs"
echo ""
echo "To seed the database:"
echo "  curl -X POST http://localhost:${BACKEND_PORT}/api/v1/admin/seed-database"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop:"
echo "  docker compose down"
