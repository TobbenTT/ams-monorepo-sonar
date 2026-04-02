"""Data Import router — browse tables, upload Excel/CSV, map columns, execute imports."""

from __future__ import annotations

import csv
import io
import logging
import os
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import text
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.dependencies.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/data-import",
    tags=["data-import"],
    dependencies=[Depends(get_current_user)],
)

SEED_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "seed_data"
ALLOWED_EXT = {".xlsx", ".csv"}

# ── Helpers ───────────────────────────────────────────────────────

def _ensure_history_table(db: Session):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS data_import_log (
            import_id TEXT PRIMARY KEY,
            table_name TEXT NOT NULL,
            filename TEXT NOT NULL,
            rows_imported INTEGER DEFAULT 0,
            mode TEXT DEFAULT 'append',
            status TEXT DEFAULT 'pending',
            error_message TEXT,
            created_at TEXT NOT NULL,
            user_id TEXT
        )
    """))
    db.commit()


def _read_xlsx(filepath: str, sheet_name: str | None = None):
    """Read xlsx with openpyxl, return list of dicts per sheet."""
    from openpyxl import load_workbook
    wb = load_workbook(filepath, read_only=True, data_only=True)
    sheets = []
    target_sheets = [sheet_name] if sheet_name else wb.sheetnames
    for sn in target_sheets:
        if sn not in wb.sheetnames:
            continue
        ws = wb[sn]
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            sheets.append({"name": sn, "columns": [], "row_count": 0, "preview_rows": []})
            continue
        headers = [str(c) if c is not None else "col_%d" % i for i, c in enumerate(rows[0])]
        data_rows = rows[1:]
        preview = []
        for row in data_rows[:5]:
            preview.append({h: (_cell_val(v)) for h, v in zip(headers, row)})
        sheets.append({
            "name": sn,
            "columns": headers,
            "row_count": len(data_rows),
            "preview_rows": preview,
        })
    wb.close()
    return sheets


def _read_csv(filepath: str):
    """Read CSV, return single-sheet structure."""
    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)
    preview = rows[:5]
    return [{
        "name": "CSV",
        "columns": headers,
        "row_count": len(rows),
        "preview_rows": preview,
    }]


def _cell_val(v):
    """Convert cell value to JSON-safe type."""
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.isoformat()
    return str(v)


# ── Endpoints ─────────────────────────────────────────────────────

@router.get("/tables")
def list_tables(db: Session = Depends(get_db)):
    """List all tables with row counts."""
    tables_raw = db.execute(text(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )).fetchall()
    result = []
    for (tname,) in tables_raw:
        count = db.execute(text("SELECT COUNT(*) FROM \"%s\"" % tname)).scalar()
        cols_raw = db.execute(text("PRAGMA table_info(\"%s\")" % tname)).fetchall()
        columns = [{"name": r[1], "type": r[2], "notnull": bool(r[3]), "pk": bool(r[5])} for r in cols_raw]
        result.append({"name": tname, "row_count": count, "columns": columns})
    return result


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload Excel/CSV, return preview with sheets, columns, sample rows."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported file type: %s. Use .xlsx or .csv" % ext)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext, dir="/tmp")
    content = await file.read()
    tmp.write(content)
    tmp.close()

    try:
        if ext == ".xlsx":
            sheets = _read_xlsx(tmp.name)
        else:
            sheets = _read_csv(tmp.name)
    except Exception as e:
        os.unlink(tmp.name)
        raise HTTPException(400, "Error reading file: %s" % e)

    return {
        "filename": file.filename,
        "temp_path": tmp.name,
        "sheets": sheets,
    }


@router.post("/execute")
async def execute_import(
    file: UploadFile = File(...),
    table_name: str = Form(...),
    mode: str = Form("append"),
    sheet_name: str = Form(None),
    column_mapping: str = Form("{}"),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Execute the import: read file, map columns, insert into target table."""
    import json

    _ensure_history_table(db)

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported: %s" % ext)

    try:
        mapping = json.loads(column_mapping)
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid column_mapping JSON")

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext, dir="/tmp")
    content = await file.read()
    tmp.write(content)
    tmp.close()

    import_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    user_id = user.get("user_id", "unknown") if isinstance(user, dict) else getattr(user, "user_id", "unknown")

    try:
        if ext == ".xlsx":
            sheets = _read_xlsx(tmp.name, sheet_name)
        else:
            sheets = _read_csv(tmp.name)

        if not sheets:
            raise HTTPException(400, "No data found in file")

        sheet = sheets[0]

        # Re-read all rows (not just preview)
        if ext == ".xlsx":
            from openpyxl import load_workbook
            wb = load_workbook(tmp.name, read_only=True, data_only=True)
            ws = wb[sheet["name"]]
            all_rows_raw = list(ws.iter_rows(values_only=True))
            wb.close()
            headers = [str(c) if c is not None else "col_%d" % i for i, c in enumerate(all_rows_raw[0])]
            data_rows = all_rows_raw[1:]
        else:
            with open(tmp.name, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames or []
                csv_rows = list(reader)
            data_rows = [tuple(row.get(h) for h in headers) for row in csv_rows]

        # Build effective mapping
        if not mapping:
            mapping = {c: c for c in headers}

        db_cols = list(mapping.values())
        src_indices = []
        for src_col in mapping.keys():
            if src_col in headers:
                src_indices.append(headers.index(src_col))
            else:
                raise HTTPException(400, "Source column '%s' not found in file" % src_col)

        # Validate target table
        tbl_check = db.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=:t"
        ), {"t": table_name}).fetchone()
        if not tbl_check:
            raise HTTPException(400, "Table '%s' does not exist" % table_name)

        if mode == "replace":
            db.execute(text('DELETE FROM "%s"' % table_name))

        placeholders = ", ".join([":%s" % c for c in db_cols])
        col_names = ", ".join(['"%s"' % c for c in db_cols])
        insert_sql = 'INSERT INTO "%s" (%s) VALUES (%s)' % (table_name, col_names, placeholders)

        inserted = 0
        errors = []
        for i, row in enumerate(data_rows):
            try:
                vals = {}
                for j, db_col in enumerate(db_cols):
                    v = row[src_indices[j]] if src_indices[j] < len(row) else None
                    vals[db_col] = _cell_val(v)
                db.execute(text(insert_sql), vals)
                inserted += 1
            except Exception as e:
                errors.append("Row %d: %s" % (i + 2, e))
                if len(errors) >= 50:
                    break

        db.commit()

        status = "success" if not errors else "partial"
        error_msg = "; ".join(errors[:10]) if errors else None
        db.execute(text("""
            INSERT INTO data_import_log (import_id, table_name, filename, rows_imported, mode, status, error_message, created_at, user_id)
            VALUES (:id, :tbl, :fn, :rows, :mode, :status, :err, :ts, :uid)
        """), {
            "id": import_id, "tbl": table_name, "fn": file.filename,
            "rows": inserted, "mode": mode, "status": status,
            "err": error_msg, "ts": now, "uid": user_id,
        })
        db.commit()

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Import failed")
        try:
            db.execute(text("""
                INSERT INTO data_import_log (import_id, table_name, filename, rows_imported, mode, status, error_message, created_at, user_id)
                VALUES (:id, :tbl, :fn, 0, :mode, 'failed', :err, :ts, :uid)
            """), {
                "id": import_id, "tbl": table_name, "fn": file.filename,
                "mode": mode, "err": str(e), "ts": now, "uid": user_id,
            })
            db.commit()
        except Exception:
            pass
        raise HTTPException(500, "Import failed: %s" % e)
    finally:
        os.unlink(tmp.name)

    return {
        "import_id": import_id,
        "table_name": table_name,
        "rows_imported": inserted,
        "status": status,
        "errors": errors[:10] if errors else [],
    }


@router.get("/history")
def get_data_import_log(db: Session = Depends(get_db)):
    """List import history."""
    _ensure_history_table(db)
    rows = db.execute(text(
        "SELECT import_id, table_name, filename, rows_imported, mode, status, error_message, created_at, user_id "
        "FROM data_import_log ORDER BY created_at DESC LIMIT 50"
    )).fetchall()
    return [
        {
            "import_id": r[0], "table_name": r[1], "filename": r[2],
            "rows_imported": r[3], "mode": r[4], "status": r[5],
            "error_message": r[6], "created_at": r[7], "user_id": r[8],
        }
        for r in rows
    ]


@router.get("/templates")
def list_templates():
    """List available seed_data template files."""
    if not SEED_DATA_DIR.is_dir():
        return []

# -- AI Auto-Configure --

from pydantic import BaseModel
from typing import Any

class AIAnalyzeRequest(BaseModel):
    columns: list[str]
    sample_rows: list[dict[str, Any]]
    tables: list[dict[str, Any]]
    filename: str = ""

@router.post("/ai-analyze")
def ai_analyze(req: AIAnalyzeRequest, user=Depends(get_current_user)):
    """AI suggests target table, column mapping, and data quality warnings."""
    import anthropic
    import json as _json
    from api.config import settings

    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not configured")

    # Pre-filter: score tables by filename keyword match + column overlap
    fname_lower = req.filename.lower().replace(".xlsx","").replace(".csv","").replace("_"," ")
    scored = []
    for t in req.tables:
        col_names = []
        col_name_set = set()
        for c in (t.get("columns") or [])[:30]:
            if isinstance(c, dict):
                cn = c.get("name", "")
                ct = c.get("type", "")
                col_names.append(cn + "(" + ct + ")")
                col_name_set.add(cn.lower())
            else:
                col_names.append(str(c))
                col_name_set.add(str(c).lower())
        score = 0
        tname = t["name"].lower().replace("_", " ")
        for word in fname_lower.split():
            if len(word) > 2 and word in tname:
                score += 10
        for ec in req.columns:
            if ec.lower() in col_name_set:
                score += 2
        scored.append((score, t["name"], ", ".join(col_names)))
    scored.sort(key=lambda x: -x[0])
    tbl_summary = [s[1] + ": " + s[2] for s in scored[:15]]

    sample_json = _json.dumps(req.sample_rows[:3], default=str, ensure_ascii=False)[:1500]
    nl = chr(10)

    prompt = f"""You are a data import assistant. Your job is to match Excel files to EXISTING database tables.

FILE: {req.filename} Analyze this Excel file and suggest the best database table to import into.

EXCEL FILE:
Columns: {req.columns}
Sample rows (first 3):
{sample_json}

DATABASE TABLES:
{nl.join(tbl_summary[:40])}

Respond ONLY with valid JSON (no markdown, no code blocks):
{{"suggested_table": "table_name", "confidence": 85, "alternatives": [{{"table": "other", "confidence": 30}}], "column_mapping": {{"excel_col": "db_col"}}, "warnings": ["warn1"], "create_table_sql": null}}

CRITICAL RULES:
- You MUST pick an existing table. Set create_table_sql to null ALWAYS.
- Use the filename as a strong hint: "workforce" file -> workforce table, "hierarchy" -> hierarchy_nodes, etc.
- Map columns by MEANING: employee_id->worker_id, shift_pattern->shift, certification->certifications, name->name
- If a column has no match, skip it (dont include in column_mapping)
- confidence should be 70+ if the file topic matches the table topic, even if column names differ
- column_mapping keys = Excel column names, values = database column names that EXIST in the suggested table"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if "```" in text:
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else parts[0]
            if text.startswith("json"):
                text = text[4:]
        result = _json.loads(text.strip())
        return result
    except _json.JSONDecodeError:
        return {"suggested_table": "", "confidence": 0, "alternatives": [], "column_mapping": {}, "warnings": ["AI response was not valid JSON"], "create_table_sql": None}
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {e}")
