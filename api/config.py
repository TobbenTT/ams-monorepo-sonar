"""Application configuration — loads settings from .env file."""

import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env")

# Generate a strong random JWT secret if none is configured
_default_jwt_secret = os.getenv("JWT_SECRET_KEY", "")
if not _default_jwt_secret or _default_jwt_secret.startswith("ocp-maintenance"):
    _default_jwt_secret = secrets.token_urlsafe(64)


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ocp_maintenance.db")
    SAP_MOCK_DIR: str = os.getenv("SAP_MOCK_DIR", "sap_mock/data")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_AI_API_KEY: str = os.getenv("GOOGLE_AI_API_KEY", "")
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "OCP Maintenance AI MVP"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8501,http://localhost")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # JWT Authentication
    JWT_SECRET_KEY: str = _default_jwt_secret
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Auth enforcement (set to true to require JWT on all endpoints)
    REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "true").lower() == "true"


settings = Settings()
