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
    auth,
)


# ── Security: JWT auth middleware ─────────────────────────────────────────
_PUBLIC_PATHS = {
    "/", "/health", "/docs", "/openapi.json", "/redoc",
    "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh",
}
_PUBLIC_PREFIXES = ("/docs", "/redoc", "/openapi")


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Enforce Bearer JWT on all non-public endpoints when REQUIRE_AUTH is set."""

    async def dispatch(self, request, call_next):
        # Always allow OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        # Allow public paths
        path = request.url.path
        if path in _PUBLIC_PATHS or any(path.startswith(p) for p in _PUBLIC_PREFIXES):
            return await call_next(request)
        # Only enforce if REQUIRE_AUTH is enabled
        if not settings.REQUIRE_AUTH:
            return await call_next(request)
        # Check Authorization header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Authentication required"})
        token = auth_header[7:]
        from api.services.auth_service import decode_token
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})
        return await call_next(request)


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
    """Simple in-memory rate limiting per IP."""

    async def dispatch(self, request, call_next):
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
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-API-Key"],
    )

    # Security middleware stack (order: outermost runs first)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(JWTAuthMiddleware)

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

    # Build hash — stable across all Gunicorn workers, changes only on deploy
    import hashlib as _hashlib
    _hash_source = __file__
    try:
        _mtime = str(os.path.getmtime(__file__))
    except Exception:
        _mtime = "0"
    _build_hash = _hashlib.md5((_hash_source + _mtime).encode()).hexdigest()[:12]

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
