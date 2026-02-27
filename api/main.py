"""FastAPI application — OCP Maintenance AI MVP."""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from api.config import settings
from api.database.connection import create_all_tables

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ocp_maintenance")
from api.routers import (
    hierarchy, criticality, fmea, tasks, work_packages, sap, analytics, admin,
    capture, work_requests, planner, backlog, scheduling,
    reliability, rca,
    reporting, dashboard,
)


_API_KEY = os.getenv("API_KEY", "")

_PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}


class APIKeyMiddleware(BaseHTTPMiddleware):
    """Enforce X-API-Key header on all mutation requests when API_KEY is set."""

    async def dispatch(self, request, call_next):
        if request.method in ("GET", "OPTIONS", "HEAD"):
            return await call_next(request)
        if request.url.path in _PUBLIC_PATHS:
            return await call_next(request)
        if _API_KEY:
            key = request.headers.get("X-API-Key", "")
            if key != _API_KEY:
                return JSONResponse(status_code=403, content={"detail": "Invalid API key"})
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="OCP Maintenance AI MVP — 4-module maintenance strategy platform",
        lifespan=lifespan,
    )

    allowed_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-API-Key"],
    )

    # API key middleware — only active when API_KEY env var is set
    app.add_middleware(APIKeyMiddleware)

    # Include all routers under /api/v1
    prefix = settings.API_V1_PREFIX
    app.include_router(hierarchy.router, prefix=prefix)
    app.include_router(criticality.router, prefix=prefix)
    app.include_router(fmea.router, prefix=prefix)
    app.include_router(tasks.router, prefix=prefix)
    app.include_router(work_packages.router, prefix=prefix)
    app.include_router(sap.router, prefix=prefix)
    app.include_router(analytics.router, prefix=prefix)
    app.include_router(admin.router, prefix=prefix)
    # Phase 3 — Modules 1-3
    app.include_router(capture.router, prefix=prefix)
    app.include_router(work_requests.router, prefix=prefix)
    app.include_router(planner.router, prefix=prefix)
    app.include_router(backlog.router, prefix=prefix)
    # Phase 4B — Scheduling
    app.include_router(scheduling.router, prefix=prefix)
    # Phase 5 — Advanced Reliability
    app.include_router(reliability.router, prefix=prefix)
    # Phase 6 — Reporting & Dashboards
    app.include_router(reporting.router, prefix=prefix)
    app.include_router(dashboard.router, prefix=prefix)
    # Phase 8 — RCA & Defect Elimination
    app.include_router(rca.router, prefix=prefix)

    @app.get("/")
    def root():
        return {
            "project": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs": "/docs",
            "modules": [
                "hierarchy", "criticality", "fmea", "tasks", "work-packages",
                "sap", "analytics", "admin",
                "capture", "work-requests", "planner", "backlog", "scheduling",
                "reliability", "reporting", "dashboard", "rca",
            ],
        }

    @app.get("/health")
    def health():
        from sqlalchemy import text
        from api.database.connection import SessionLocal
        try:
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
            db_status = "ok"
        except Exception as e:
            logger.error("Health check DB failure: %s", e)
            db_status = "error"
        return {
            "status": "ok" if db_status == "ok" else "degraded",
            "version": "1.0.0",
            "database": db_status,
        }

    return app


app = create_app()
