"""MCP tool wrappers for G-18 / Phase B — Data Import Pipeline (API + history).

Note: File parsing and row validation tools already exist in reporting_tools.py:
  - parse_import_file         — parse .xlsx/.csv from local path
  - validate_import_data      — validate pre-parsed rows
  - detect_import_columns     — auto-detect column mapping
  - parse_and_validate_import — parse + validate in one step

This module adds the missing persistence and history tools:
  - list_import_sources   — enumerate all valid sources
  - import_data_file      — parse + validate + persist via API (returns import_id)
  - get_import_history    — query past import records
"""

import base64
import json

import httpx

from agents.tool_wrappers.registry import tool
from tools.models.schemas import ImportSource

_BASE = "http://localhost:8000/api/v1"


@tool(
    "list_import_sources",
    "Return all valid data import source types. No input required. Use before importing to confirm the correct source name.",
    {"type": "object", "properties": {}, "required": []},
)
def list_import_sources() -> str:
    """Return all ImportSource enum values."""
    return json.dumps([s.value for s in ImportSource])


@tool(
    "import_data_file",
    "Parse, validate, and PERSIST an Excel (.xlsx) or CSV file into the AMS database. "
    "Input: {source, filename, file_b64 (base64-encoded file bytes), plant_id, sheet_name (optional)}. "
    "Returns ImportHistoryEntry with import_id, status (success/partial/failed), total_rows, valid_rows, error_rows, errors list.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def import_data_file(input_json: str) -> str:
    """Decode base64 file, upload to /import/file, return ImportHistoryEntry."""
    data = json.loads(input_json)
    file_bytes = base64.b64decode(data["file_b64"])
    filename = data["filename"]

    files = {"file": (filename, file_bytes, "application/octet-stream")}
    form = {
        "source": data["source"],
        "plant_id": data["plant_id"],
    }
    if data.get("sheet_name"):
        form["sheet_name"] = data["sheet_name"]

    r = httpx.post(f"{_BASE}/import/file", files=files, data=form, timeout=60.0)
    r.raise_for_status()
    return json.dumps(r.json(), default=str)


@tool(
    "get_import_history",
    "Retrieve past file import records for audit or troubleshooting. "
    "Input: {plant_id (optional), source (optional, e.g. EQUIPMENT_HIERARCHY), limit (default 20)}. "
    "Returns list of ImportHistoryEntry dicts with import_id, filename, status, counts, imported_at.",
    {"type": "object", "properties": {"input_json": {"type": "string"}}, "required": ["input_json"]},
)
def get_import_history(input_json: str) -> str:
    """Query import history from the API."""
    data = json.loads(input_json)
    params: dict = {"limit": data.get("limit", 20)}
    if data.get("plant_id"):
        params["plant_id"] = data["plant_id"]
    if data.get("source"):
        params["source"] = data["source"]

    r = httpx.get(f"{_BASE}/import/history", params=params, timeout=30.0)
    r.raise_for_status()
    return json.dumps(r.json(), default=str)
