"""Application configuration — loads settings from .env file."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env")


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ocp_maintenance.db")
    SAP_MOCK_DIR: str = os.getenv("SAP_MOCK_DIR", "sap_mock/data")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "OCP Maintenance AI MVP"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:8501,http://localhost")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
