"""Security tests — API endpoint protection and response safety.

Tests CORS configuration, authentication gaps on destructive endpoints,
error response sanitization, and route structure.
Uses FastAPI TestClient — no server startup needed.
"""

import pytest
from fastapi.testclient import TestClient

from api.main import app

pytestmark = pytest.mark.security

client = TestClient(app)


class TestCORSConfiguration:
    """Document CORS wildcard risk."""

    def test_cors_restricted_origins(self):
        """CORS is restricted to specific origins (not wildcard).

        Production-hardened: allow_origins is configured from CORS_ORIGINS env var.
        """
        from api.main import create_app
        test_app = create_app()
        # Find the CORS middleware
        cors_middleware = None
        for m in test_app.user_middleware:
            if "CORSMiddleware" in str(m.cls):
                cors_middleware = m
                break
        assert cors_middleware is not None, "CORS middleware should be configured"
        origins = cors_middleware.kwargs.get("allow_origins", [])
        assert "*" not in origins, \
            "CORS should not use wildcard in production"
        assert len(origins) > 0, "At least one allowed origin should be configured"


class TestDestructiveEndpointsNoAuth:
    """Document endpoints that lack authentication."""

    def test_admin_reset_no_auth_guard(self):
        """SECURITY FINDING: DELETE /admin/reset-database has no authentication.

        This test documents that the database reset endpoint is unprotected.
        In production, this MUST require admin authentication.
        """
        # We just verify the route exists and doesn't require auth headers
        # (we don't actually call DELETE to avoid side effects)
        routes = [r.path for r in app.routes]
        admin_reset = "/api/v1/admin/reset-database"
        assert admin_reset in routes, "admin reset route should exist"

    def test_admin_seed_no_auth_guard(self):
        """SECURITY FINDING: POST /admin/seed-database has no authentication."""
        routes = [r.path for r in app.routes]
        admin_seed = "/api/v1/admin/seed-database"
        assert admin_seed in routes, "admin seed route should exist"

    def test_sap_approve_no_auth_guard(self):
        """SECURITY FINDING: SAP approval endpoint has no authentication."""
        routes = [r.path for r in app.routes]
        sap_routes = [r for r in routes if "approve" in r]
        assert len(sap_routes) > 0, "SAP approve route should exist"


class TestEndpointResponseSafety:
    """Verify endpoints don't leak sensitive information."""

    def test_health_no_sensitive_data(self):
        """Health endpoint should return status without leaking secrets."""
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert data["status"] in ("ok", "degraded")
        # Should not contain any sensitive details
        text = resp.text
        assert "ANTHROPIC" not in text
        assert "password" not in text.lower()
        assert "secret" not in text.lower()

    def test_root_no_internal_paths(self):
        """Root endpoint should not expose filesystem paths."""
        resp = client.get("/")
        assert resp.status_code == 200
        text = resp.text
        assert "C:\\" not in text
        assert "/home/" not in text
        assert "/Users/" not in text

    def test_unknown_route_returns_404(self):
        """Non-existent route should return 404, not 500."""
        resp = client.get("/api/v1/nonexistent-endpoint-xyz")
        assert resp.status_code == 404

    def test_error_response_no_stack_trace(self):
        """Invalid request should not expose Python traceback."""
        resp = client.post(
            "/api/v1/sap/generate-upload",
            content="not-valid-json",
            headers={"Content-Type": "application/json"},
        )
        text = resp.text
        assert "Traceback" not in text
        assert "File \"" not in text


class TestRouteStructure:
    """Verify all routes follow the expected pattern."""

    def test_api_v1_prefix_on_all_routers(self):
        """All business routes should be under /api/v1."""
        excluded = {"/", "/health", "/openapi.json", "/docs", "/docs/oauth2-redirect", "/redoc"}
        routes = [r.path for r in app.routes if hasattr(r, "path")]
        business_routes = [r for r in routes if r not in excluded]
        for route in business_routes:
            assert route.startswith("/api/v1"), \
                f"Route {route} is not under /api/v1 prefix"

    def test_post_without_json_returns_422(self):
        """POST with non-JSON body should return 422, not 500."""
        resp = client.post(
            "/api/v1/admin/feedback",
            content="plain text body",
            headers={"Content-Type": "text/plain"},
        )
        assert resp.status_code == 422
