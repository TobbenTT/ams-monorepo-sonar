"""FastAPI application — OCP Maintenance AI MVP."""

import logging
import os
import time
from datetime import datetime
from contextlib import asynccontextmanager

_app_start = datetime.now()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from api.config import settings

# ── Sentry (opcional) ─────────────────────────────────────────────────
# Se activa si la var SENTRY_DSN_BACKEND está seteada. Captura errores
# no manejados del ASGI + tracing básico. Free tier aguanta 5k events/mes.
try:
    _sentry_dsn = os.environ.get("SENTRY_DSN_BACKEND")
    if _sentry_dsn:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        sentry_sdk.init(
            dsn=_sentry_dsn,
            environment=os.environ.get("SENTRY_ENV", "production"),
            integrations=[FastApiIntegration(), SqlalchemyIntegration()],
            traces_sample_rate=0.1,
            send_default_pii=False,
            release=os.environ.get("GIT_COMMIT", "unknown"),
        )
except Exception as _se:
    import sys
    print(f"[sentry] init failed (non-fatal): {_se}", file=sys.stderr)
# Note: JWT auth enforcement is handled at router-level via
# dependencies=[Depends(get_current_user)], NOT middleware.
from api.database.connection import create_all_tables

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ocp_maintenance")
from pathlib import Path
from fastapi.staticfiles import StaticFiles

from api.routers import (
    capture_geo,
    notifications,
    hierarchy, criticality, fmea, tasks, work_packages, sap, analytics, admin,
    capture, work_requests, planner, backlog, scheduling,
    reliability, rca,
    reporting, dashboard,
    auth, ai_agents,
    sync, troubleshooting, execution_checklists, deliverables,
    assignments, expert_knowledge, financial, workflow, media, imports,
    or_projects, improvement_actions,
    managed_work_orders, feedback,
    execution, post_maintenance,
    catalogs,
    sap_pm,
    data_import,
    agentic,
    contractors,
    analytics_dashboards,
    sprint6_scaffolds,
    reports_export,
    rag,
    programmer_agent,
    supervisor_agent,
    planificador_agent,
    dms,
)

# Optional modules — loaded only if their deps are installed. Missing deps won't crash startup.
import importlib
_OPT = {}
for _name in ('sales', 'security', 'mfa'):
    try:
        _OPT[_name] = importlib.import_module(f'api.routers.{_name}')
    except Exception as _e:
        import logging as _log
        _log.getLogger('ocp_maintenance').warning(f'Optional router {_name} not loaded: {_e}')
        _OPT[_name] = None


# ── Security: response headers ────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Auditoría 2026-04-22 — Permissions-Policy endurecido (además bloquea payment y usb)
        response.headers["Permissions-Policy"] = (
            "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), "
            "magnetometer=(), accelerometer=(), gyroscope=()"
        )
        # CSP robusto: form-action y base-uri limitados; websocket permitido; object-src 'none'
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' ws: wss:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "base-uri 'self'; "
            "object-src 'none'; "
            "upgrade-insecure-requests"
        )
        # Cross-origin isolation (anti-Spectre, anti-framejacking)
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        if not settings.DEBUG:
            # HSTS con preload listo + 2 años
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


# ── Security: basic rate limiting ─────────────────────────────────────────
_rate_limit_store: dict[str, list[float]] = {}
_RATE_LIMIT_WINDOW = 60  # seconds
_RATE_LIMIT_MAX = 600    # Jorge 2026-04-23: dashboards hacen 10-20 req paralelas
                          # + navegación rápida → 120 era demasiado ajustado.
                          # 600/min = 10 req/s sostenido, razonable para B2B.


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting per IP (skipped in test/debug mode)."""

    async def dispatch(self, request, call_next):
        if settings.DEBUG or os.getenv("TESTING"):
            return await call_next(request)
        # Health, docs y WS no se rate-limitan — causan 429 espurios al dashboard.
        path = request.url.path or ""
        if path in ("/health", "/docs", "/redoc", "/openapi.json") or path.startswith("/ws/"):
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
    import os as _os
    if not settings.JWT_SECRET_KEY or len(settings.JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "JWT_SECRET_KEY must be at least 32 characters. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    # Security checks auditoría 2026-04-22
    deploy_secret = _os.environ.get("DEPLOY_SECRET", "")
    if not settings.DEBUG and not deploy_secret:
        logger.warning(
            "DEPLOY_SECRET no está configurado. /admin/kick-all-users "
            "sigue protegido por Bearer admin, pero deploy.sh no podrá "
            "hacer logout masivo automático."
        )
    # Log effective CORS origins (post-localhost-strip) for audit trail.
    logger.info("CORS effective origins: %s", settings.CORS_ORIGINS)
    # Auditoría — con allow_credentials=True, un wildcard '*' es peligroso.
    if not settings.DEBUG and "*" in settings.CORS_ORIGINS:
        logger.error(
            "CORS_ORIGINS contiene '*' con allow_credentials=True en producción. "
            "Esto permite que cualquier sitio robe credenciales. Revisar .env."
        )
    create_all_tables()
    # Auto-seed users if DB is empty (prevents losing creds on rebuild)
    # Skip in tests — fixtures crean la data que necesiten y auto-seed
    # agrega 141 WRs + 100 WOs + 10k nodes que hacen pytest lento y causan
    # 'database is locked' con in-memory sqlite concurrente.
    if not _os.environ.get("TESTING"):
        try:
            from api.database.connection import SessionLocal
            from api.database.models import UserModel
            db = SessionLocal()
            if db.query(UserModel).count() == 0:
                logger.info("No users found — auto-seeding default users + demo data")
                from api.seed import seed_all
                seed_all(db)
            db.close()
        except Exception as e:
            logger.warning("Auto-seed failed: %s", e)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="OCP Maintenance AI MVP — 4-module maintenance strategy platform",
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )

    # ── Global exception handler — hide stack traces ──
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        if settings.DEBUG:
            logger.exception("Unhandled exception: %s", exc)
            return JSONResponse(status_code=500, content={"detail": str(exc)})
        logger.error("Internal error on %s %s: %s", request.method, request.url.path, exc)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    # ── WebSocket notification flush middleware ──
    from api.services.ws_manager import flush_notifications

    @app.middleware("http")
    async def ws_flush_middleware(request: Request, call_next):
        # Capture the originating tab's client id so any WS broadcasts
        # queued during this request can be tagged and filtered out by
        # the originating tab (see frontend wsSingleton.js echo suppression).
        from api.services.ws_client_context import set_client_id, reset_client_id
        token = set_client_id(request.headers.get("x-client-id"))
        try:
            response = await call_next(request)
        finally:
            reset_client_id(token)
        try:
            await flush_notifications()
        except Exception:
            pass
        return response

    allowed_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    if not settings.DEBUG:
        unsafe = [o for o in allowed_origins if "localhost" in o or "127.0.0.1" in o]
        for origin in unsafe:
            logger.warning("CORS origin '%s' contains localhost — removed in production", origin)
        allowed_origins = [o for o in allowed_origins if "localhost" not in o and "127.0.0.1" not in o]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-API-Key", "X-Client-Id"],
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
    # Endpoint público para kick-all-users (usa X-Internal-Key desde deploy.sh)
    app.include_router(admin.public_kick_router, prefix=prefix)
    app.include_router(contractors.router, prefix=prefix)
    app.include_router(analytics_dashboards.router, prefix=prefix)
    app.include_router(sprint6_scaffolds.router, prefix=prefix)
    app.include_router(reports_export.router, prefix=prefix)
    app.include_router(rag.router, prefix=prefix)
    app.include_router(programmer_agent.router, prefix=prefix)
    app.include_router(supervisor_agent.router, prefix=prefix)
    app.include_router(planificador_agent.router, prefix=prefix)
    # Phase 3 — Modules 1-3
    app.include_router(capture.photos_router, prefix=prefix)  # public (no auth) — serves photos for <img> tags
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
    if _OPT.get("sales"): app.include_router(_OPT["sales"].router, prefix=prefix)
    if _OPT.get("mfa"): app.include_router(_OPT["mfa"].router, prefix=prefix)
    # Security & Compliance (cybersecurity checklist endpoints)
    if _OPT.get("security"): app.include_router(_OPT["security"].router, prefix=prefix)
    # AI Agents (CORTEX)
    app.include_router(ai_agents.router, prefix=prefix)
    # GAP-W03 — Offline Sync
    app.include_router(sync.router, prefix=prefix)
    # GAP-W02 — Troubleshooting / Diagnostic Assistant
    app.include_router(troubleshooting.router, prefix=prefix)
    # GAP-W06 — Execution Checklists
    app.include_router(execution_checklists.router, prefix=prefix)
    # GAP-W10 — Deliverable Tracking
    app.include_router(deliverables.router, prefix=prefix)
    # GAP-W09 — Competency-Based Work Assignment
    app.include_router(assignments.router, prefix=prefix)
    # GAP-W13 — Expert Knowledge Capture
    app.include_router(expert_knowledge.router, prefix=prefix)
    # GAP-W04 — Financial / ROI Tracking
    app.include_router(financial.router, prefix=prefix)
    # G-17 — Agent Workflow via API
    app.include_router(workflow.router, prefix=prefix)
    # G-08 — Voice + Image Media Processing
    app.include_router(media.router, prefix=prefix)
    # G-18 / Phase B — Data Import Pipeline
    app.include_router(imports.router, prefix=prefix)
    app.include_router(or_projects.router, prefix=prefix)
    # Improvement Actions
    app.include_router(improvement_actions.router, prefix=prefix)
    # Jorge Phase 2 — Managed Work Orders (full OT lifecycle)
    app.include_router(sap_pm.router, prefix=prefix, tags=["SAP PM"])
    app.include_router(managed_work_orders.router, prefix=prefix)
    # Detailed Feedback system
    app.include_router(feedback.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)
    app.include_router(capture_geo.router, prefix=prefix)
    # Jorge Phase 4 — Execution tracking
    app.include_router(execution.router, prefix=prefix)
    # Jorge Phase 5 — Post-Maintenance reviews
    app.include_router(post_maintenance.router, prefix=prefix)
    # SAP PM Reference Data (Planillas de Carga)
    app.include_router(catalogs.router, prefix=prefix)

    # Data Import page
    app.include_router(data_import.router, prefix=prefix)
    # Agentic Solutions
    app.include_router(agentic.router, prefix=prefix)
    app.include_router(dms.router, prefix=prefix)

    # GAP-W03 — Serve Field PWA at /field/
    field_dist = Path("field_app/dist")
    if field_dist.is_dir():
        app.mount("/field", StaticFiles(directory=str(field_dist), html=True), name="field-app")

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
                "ai-agents",
                "sync", "troubleshooting", "execution-checklists", "deliverables",
                "assignments", "expert-knowledge", "financial", "workflow", "media", "imports",
            ],
        }

    # Build hash — stable across all Gunicorn workers, changes on every deploy
    import hashlib as _hashlib
    _stamp_path = os.path.join(os.path.dirname(__file__), '..', '.build_timestamp')
    try:
        with open(_stamp_path) as _f:
            _stamp = _f.read().strip()
    except (FileNotFoundError, OSError):
        _stamp = str(os.path.getmtime(__file__))
    _build_hash = _hashlib.md5(_stamp.encode()).hexdigest()[:12]

    # David 2026-04-28: agregar HEAD para que UptimeRobot Free (que solo manda
    # HEAD, no GET) marque el monitor como Up. Sin esto: 405 Method Not Allowed
    # → falsa alerta de downtime aunque la app esté sana.
    @app.api_route("/health", methods=["GET", "HEAD"])
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
        # Count key entities
        counts = {}
        if db_status == "ok":
            try:
                with SessionLocal() as db:
                    for tbl in ["work_requests", "managed_work_orders", "hierarchy_nodes", "users"]:
                        r = db.execute(text(f'SELECT COUNT(*) FROM "{tbl}"'))
                        counts[tbl] = r.scalar() or 0
            except:
                pass

        import os as _os
        ai_configured = bool(_os.environ.get("ANTHROPIC_API_KEY"))

        return {
            "status": "ok" if db_status == "ok" else "degraded",
            "version": "2.0.0",
            "database": db_status,
            "build": _build_hash,
            "ai_available": ai_configured,
            "uptime_seconds": int((datetime.now() - _app_start).total_seconds()) if '_app_start' in dir() else None,
            "counts": counts,
        }

    # ── WebSocket endpoint for real-time updates ──
    from fastapi import WebSocket, WebSocketDisconnect
    from api.services.ws_manager import manager

    @app.websocket("/ws/{plant_id}")
    async def websocket_endpoint(websocket: WebSocket, plant_id: str = "global"):
        # client_id is a per-tab identifier sent by the frontend so the server
        # can tag broadcasts and the originating tab can ignore its own echo.
        # user_id is used for presence (detect shared-account sessions).
        qp = websocket.query_params
        client_id = qp.get("client_id")
        user_id = qp.get("user_id")
        # Auth: pentest 2026-05-06 detectó que un anónimo podía conectar y
        # recibir todos los broadcasts (info leak). Exige JWT en ?token=.
        token = qp.get("token")
        if not token:
            await websocket.close(code=4401, reason="Token requerido")
            return
        try:
            from api.services.auth_service import decode_token, get_user_by_id
            from api.database.connection import SessionLocal
            payload = decode_token(token)
            if not payload or payload.get("type") != "access":
                await websocket.close(code=4401, reason="Token invalido")
                return
            _db = SessionLocal()
            try:
                _user = get_user_by_id(_db, payload["sub"])
                if not _user or not _user.is_active:
                    await websocket.close(code=4401, reason="Usuario invalido")
                    return
                if payload.get("ver", 0) != getattr(_user, "token_version", 0):
                    await websocket.close(code=4401, reason="Token revocado")
                    return
                # Lock user_id al token (evita spoofing de presencia).
                user_id = _user.user_id
            finally:
                _db.close()
        except Exception as _e:
            await websocket.close(code=4401, reason="Auth error")
            return
        await manager.connect(websocket, plant_id, client_id=client_id, user_id=user_id)
        # Announce presence if this user already has another live session.
        try:
            if user_id:
                count = manager.presence_for_user(user_id)
                if count > 1:
                    import json as _json
                    await websocket.send_text(_json.dumps({
                        "event": "presence.shared_account",
                        "data": {"user_id": user_id, "sessions": count},
                        "plant_id": plant_id,
                        "origin_client_id": None,
                    }))
        except Exception:
            pass
        # Jorge 2026-04-27: keepalive activo del servidor (no esperar al
        # cliente). Algunos proxies/CDN cortan conexiones idle a 60-90s y
        # el cliente no detecta el corte hasta intentar enviar.
        # Esquema: tarea concurrente que envía heartbeat cada 30s; el loop
        # principal sigue escuchando ping del cliente.
        import asyncio as _asyncio
        async def _server_heartbeat():
            try:
                while True:
                    await _asyncio.sleep(30)
                    try:
                        await websocket.send_text("pong")
                    except Exception:
                        return
            except _asyncio.CancelledError:
                return
        hb_task = _asyncio.create_task(_server_heartbeat())
        try:
            while True:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            pass
        except Exception as _e:
            # Cualquier otro error en el loop debe limpiar el slot del manager.
            import logging as _logging
            _logging.getLogger(__name__).warning(
                "WS receive loop aborted (plant=%s): %s", plant_id, _e
            )
            try:
                from api.services.ws_manager import _audit
                _audit("loop_error", plant_id=plant_id, error=str(_e)[:200])
            except Exception:
                pass
        finally:
            hb_task.cancel()
            manager.disconnect(websocket, plant_id)

    return app


app = create_app()
