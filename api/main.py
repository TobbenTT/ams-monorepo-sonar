"""FastAPI application — OCP Maintenance AI MVP."""

import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from api.config import settings
# Note: JWT auth enforcement is handled at router-level via
# dependencies=[Depends(get_current_user)], NOT middleware.
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
    auth, ai_agents,
)


# ── Security: response headers ────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# ── Security: basic rate limiting ─────────────────────────────────────────
_rate_limit_store: dict[str, list[float]] = {}
_RATE_LIMIT_WINDOW = 60  # seconds
_RATE_LIMIT_MAX = 120     # requests per window


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting per IP (skipped in test/debug mode)."""

    async def dispatch(self, request, call_next):
        if settings.DEBUG or os.getenv("TESTING"):
            return await call_next(request)
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        # Clean old entries
        if client_ip in _rate_limit_store:
            _rate_limit_store[client_ip] = [
                t for t in _rate_limit_store[client_ip]
                if now - t < _RATE_LIMIT_WINDOW
            ]
        else:
            _rate_limit_store[client_ip] = []
        if len(_rate_limit_store[client_ip]) >= _RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Try again later."},
            )
        _rate_limit_store[client_ip].append(now)
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY environment variable is not set. "
            "The server cannot start without a secure JWT secret. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    create_all_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="OCP Maintenance AI MVP — 4-module maintenance strategy platform",
        lifespan=lifespan,
    )

    # ── Global exception handler — hide stack traces ──
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        if settings.DEBUG:
            logger.exception("Unhandled exception: %s", exc)
            return JSONResponse(status_code=500, content={"detail": str(exc)})
        logger.error("Internal error on %s %s: %s", request.method, request.url.path, exc)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    allowed_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-API-Key"],
    )

    # Security middleware stack
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)

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
    # Auth
    app.include_router(auth.router, prefix=prefix)
    # AI Agents (CORTEX)
    app.include_router(ai_agents.router, prefix=prefix)

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
                "reliability", "reporting", "dashboard", "rca", "auth",
            ],
        }

    # Build hash — stable across all Gunicorn workers, changes on every deploy
    import hashlib as _hashlib
    _stamp_path = os.path.join(os.path.dirname(__file__), '..', '.build_timestamp')
    try:
        with open(_stamp_path) as _f:
            _stamp = _f.read().strip()
    except Exception:
        _stamp = str(os.path.getmtime(__file__))
    _build_hash = _hashlib.md5(_stamp.encode()).hexdigest()[:12]

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
            "build": _build_hash,
        }

    return app


app = create_app()
