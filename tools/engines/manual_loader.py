# tools/engines/manual_loader.py
"""Equipment manual loader — reads PDFs/TXT/MD and equipment library data.

Claude Native approach: loads content into 200K context window with prompt caching.
No vector DB, no embeddings. Equipment library data provides baseline even without manuals.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

logger = logging.getLogger(__name__)

# Try to import pymupdf for PDF support (optional)
try:
    import pymupdf  # noqa: F401
    _HAS_PYMUPDF = True
except ImportError:
    _HAS_PYMUPDF = False
    logger.info("pymupdf not installed — PDF manual support disabled. Install with: pip install pymupdf")

_SAFE_ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$")
_SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}

# Resolved at import time — works from any working directory
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_DEFAULT_MANUALS_DIR = _PROJECT_ROOT / "data" / "manuals"
_DEFAULT_LIBRARIES_DIR = _PROJECT_ROOT / "data" / "libraries"


@dataclass(frozen=True)
class ManualSection:
    """A single section of equipment documentation."""
    source: str        # filename or "equipment-library"
    title: str         # section heading
    content: str       # text content
    token_estimate: int  # rough token count


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English technical text."""
    return max(1, len(text) // 4)


def _validate_equipment_type_id(type_id: str) -> None:
    """Prevent path traversal in equipment type IDs."""
    if not type_id:
        raise ValueError("equipment_type_id must not be empty")
    if ".." in type_id or "/" in type_id or "\\" in type_id:
        raise ValueError(f"equipment_type_id contains path traversal characters: {type_id!r}")
    if not _SAFE_ID.match(type_id):
        raise ValueError(f"equipment_type_id must match [a-zA-Z0-9][a-zA-Z0-9_-]*: {type_id!r}")


def _read_pdf(path: Path) -> str:
    """Extract text from PDF using pymupdf. Returns empty string on error."""
    if not _HAS_PYMUPDF:
        logger.warning("Cannot read PDF %s — pymupdf not installed", path.name)
        return ""
    try:
        doc = pymupdf.open(str(path))
        pages = [page.get_text() for page in doc]
        doc.close()
        return "\n\n".join(pages)
    except Exception as e:
        logger.warning("Failed to read PDF %s: %s", path.name, e)
        return ""


def _read_text_file(path: Path) -> str:
    """Read a text or markdown file. Returns empty string on error."""
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        logger.warning("Failed to read %s: %s", path.name, e)
        return ""


def _title_from_filename(path: Path) -> str:
    """Convert filename to a readable title: 'maintenance-manual.pdf' -> 'Maintenance Manual'."""
    return path.stem.replace("-", " ").replace("_", " ").title()


# -- Equipment Library Extraction ------------------------------------------

def _load_equipment_library() -> list[dict]:
    """Load the equipment library JSON."""
    lib_path = _DEFAULT_LIBRARIES_DIR / "equipment_library.json"
    if not lib_path.is_file():
        logger.warning("Equipment library not found: %s", lib_path)
        return []
    data = json.loads(lib_path.read_text(encoding="utf-8"))
    return data.get("equipment_types", [])


def _load_component_library() -> dict[str, dict]:
    """Load component library as dict keyed by component_type_id."""
    lib_path = _DEFAULT_LIBRARIES_DIR / "component_library.json"
    if not lib_path.is_file():
        return {}
    data = json.loads(lib_path.read_text(encoding="utf-8"))
    return {c["component_type_id"]: c for c in data.get("component_types", [])}


def _format_failure_mode(fm: dict) -> str:
    """Format a single failure mode as readable text."""
    parts = [f"- **{fm.get('what', 'Unknown')}**"]
    parts.append(f"  Mechanism: {fm.get('mechanism', '?')} | Cause: {fm.get('cause', '?')}")
    parts.append(f"  Strategy: {fm.get('strategy_type', '?')} | Task: {fm.get('typical_task', '?')}")
    freq = fm.get("frequency_value")
    unit = fm.get("frequency_unit")
    if freq and unit:
        parts.append(f"  Frequency: every {freq} {unit}")
    beta = fm.get("weibull_beta")
    eta = fm.get("weibull_eta")
    if beta and eta:
        parts.append(f"  Weibull: beta={beta}, eta={eta} days")
    return "\n".join(parts)


def load_equipment_library_context(equipment_type_id: str) -> list[ManualSection]:
    """Extract structured text from equipment + component libraries for a given type."""
    _validate_equipment_type_id(equipment_type_id)
    equipment_types = _load_equipment_library()
    comp_lib = _load_component_library()

    # Find the equipment type
    eq_type = None
    for et in equipment_types:
        if et.get("equipment_type_id") == equipment_type_id:
            eq_type = et
            break

    if eq_type is None:
        return []

    sections: list[ManualSection] = []

    # 1. General specifications
    specs_lines = [
        f"# {eq_type['name']} — Technical Specifications",
        f"",
        f"- **Type ID**: {eq_type['equipment_type_id']}",
        f"- **Category**: {eq_type.get('category', 'N/A')}",
        f"- **Criticality Class**: {eq_type.get('criticality_class', 'N/A')}",
        f"- **Typical Power**: {eq_type.get('typical_power_kw', 'N/A')} kW",
        f"- **Power Range**: {eq_type.get('power_range_kw', 'N/A')} kW",
        f"- **Typical Weight**: {eq_type.get('typical_weight_kg', 'N/A')} kg",
        f"- **Operational Hours/Year**: {eq_type.get('operational_hours_annual', 'N/A')}",
        f"- **Expected Life**: {eq_type.get('expected_life_years', 'N/A')} years",
        f"- **TAG Convention**: `{eq_type.get('tag_convention', 'N/A')}`",
        f"- **Manufacturers**: {', '.join(eq_type.get('manufacturers', []))}",
        f"- **French Name**: {eq_type.get('name_fr', 'N/A')}",
        f"- **Arabic Name**: {eq_type.get('name_ar', 'N/A')}",
    ]
    specs_text = "\n".join(specs_lines)
    sections.append(ManualSection("equipment-library", "Technical Specifications", specs_text, estimate_tokens(specs_text)))

    # 2. Sub-assemblies, maintainable items, and failure modes
    sub_assemblies = eq_type.get("sub_assemblies", [])
    if sub_assemblies:
        sa_lines = [f"# {eq_type['name']} — Sub-Assemblies & Components\n"]
        for sa in sorted(sub_assemblies, key=lambda x: x.get("order", 0)):
            sa_lines.append(f"## {sa['name']} ({sa.get('name_fr', '')})\n")
            for item in sa.get("maintainable_items", []):
                sa_lines.append(f"### {item['name']} ({item.get('name_fr', '')})")
                comp_ref = item.get("component_lib_ref", "")
                if comp_ref:
                    sa_lines.append(f"Component reference: `{comp_ref}`")
                    comp = comp_lib.get(comp_ref)
                    if comp:
                        sa_lines.append(f"Component type: {comp.get('component_type', '')} | Category: {comp.get('category', '')}")
                        sa_lines.append(f"Description: {comp.get('description', '')}")
                        mfrs = comp.get("manufacturers", [])
                        if mfrs:
                            sa_lines.append(f"Manufacturers: {', '.join(mfrs)}")
                        life = comp.get("typical_life_hours")
                        if life:
                            sa_lines.append(f"Typical life: {life:,} hours")

                fms = item.get("failure_modes", [])
                if fms:
                    sa_lines.append(f"\n**Failure Modes ({len(fms)}):**\n")
                    for fm in fms:
                        sa_lines.append(_format_failure_mode(fm))
                sa_lines.append("")

        sa_text = "\n".join(sa_lines)
        sections.append(ManualSection("equipment-library", "Sub-Assemblies & Components", sa_text, estimate_tokens(sa_text)))

    return sections


# -- Manual File Loading ---------------------------------------------------

def load_manual_files(
    equipment_type_id: str,
    manuals_dir: Path | None = None,
) -> list[ManualSection]:
    """Load all manual files for an equipment type + shared docs."""
    _validate_equipment_type_id(equipment_type_id)
    manuals_dir = manuals_dir or _DEFAULT_MANUALS_DIR

    if not manuals_dir.is_dir():
        return []

    sections: list[ManualSection] = []

    # Load equipment-specific manuals
    eq_dir = manuals_dir / equipment_type_id
    if eq_dir.is_dir():
        for path in sorted(eq_dir.iterdir()):
            if path.is_file() and path.suffix.lower() in _SUPPORTED_EXTENSIONS:
                content = _read_pdf(path) if path.suffix.lower() == ".pdf" else _read_text_file(path)
                if content.strip():
                    sections.append(ManualSection(
                        source=f"{equipment_type_id}/{path.name}",
                        title=_title_from_filename(path),
                        content=content,
                        token_estimate=estimate_tokens(content),
                    ))

    # Load shared manuals
    shared_dir = manuals_dir / "_shared"
    if shared_dir.is_dir():
        for path in sorted(shared_dir.iterdir()):
            if path.is_file() and path.suffix.lower() in _SUPPORTED_EXTENSIONS:
                content = _read_pdf(path) if path.suffix.lower() == ".pdf" else _read_text_file(path)
                if content.strip():
                    sections.append(ManualSection(
                        source=f"_shared/{path.name}",
                        title=f"[Shared] {_title_from_filename(path)}",
                        content=content,
                        token_estimate=estimate_tokens(content),
                    ))

    return sections


# -- Combined Loading ------------------------------------------------------

def load_equipment_context(
    equipment_type_id: str,
    manuals_dir: Path | None = None,
    max_tokens: int = 150_000,
) -> list[ManualSection]:
    """Load library data + manual files, truncating if over token limit."""
    # Library data first (always available, smaller)
    sections = load_equipment_library_context(equipment_type_id)
    # Manual files second (may be large)
    sections.extend(load_manual_files(equipment_type_id, manuals_dir))

    # Truncate if exceeding token budget
    total = sum(s.token_estimate for s in sections)
    if total <= max_tokens:
        return sections

    # Keep sections until we hit the limit
    kept: list[ManualSection] = []
    running = 0
    for s in sections:
        if running + s.token_estimate > max_tokens:
            # Truncate this section to fit remaining budget
            remaining = max_tokens - running
            if remaining > 500:  # Only include if meaningful amount left
                chars = remaining * 4
                truncated = s.content[:chars] + "\n\n[... truncated due to context limit ...]"
                kept.append(ManualSection(s.source, s.title, truncated, remaining))
            break
        kept.append(s)
        running += s.token_estimate

    logger.info("Truncated equipment context from ~%dK to ~%dK tokens", total // 1000, max_tokens // 1000)
    return kept


def format_equipment_context(sections: list[ManualSection]) -> str:
    """Format sections into tagged text for system prompt injection."""
    if not sections:
        return ""
    parts = ["<equipment_manual>"]
    for s in sections:
        parts.append(f"<!-- source: {s.source} -->")
        parts.append(f"## {s.title}\n")
        parts.append(s.content)
        parts.append("")
    parts.append("</equipment_manual>")
    return "\n".join(parts)


def list_available_equipment_types(manuals_dir: Path | None = None) -> list[str]:
    """Return equipment type IDs that have manual files (excludes _shared)."""
    manuals_dir = manuals_dir or _DEFAULT_MANUALS_DIR
    if not manuals_dir.is_dir():
        return []
    return sorted(
        d.name for d in manuals_dir.iterdir()
        if d.is_dir() and not d.name.startswith("_") and not d.name.startswith(".")
    )


def get_equipment_type_names() -> dict[str, str]:
    """Return mapping of equipment_type_id -> display name from library."""
    types = _load_equipment_library()
    return {et["equipment_type_id"]: et["name"] for et in types}


# -- System Prompt Assembly ------------------------------------------------

_BASE_INSTRUCTIONS = """\
You are an equipment manual assistant for industrial maintenance at OCP (Office Chérifien des Phosphates).

Your role:
- Answer questions about equipment based on the technical documentation and library data provided below.
- Help technicians, supervisors, and engineers with maintenance procedures, troubleshooting, specifications, and component details.
- Be precise and reference specific values (torques, temperatures, pressures, frequencies) when available.
- If the documentation doesn't cover a question, say so clearly rather than guessing.

Language rule: Respond in the SAME LANGUAGE as the user's question. If the user writes in French, respond entirely in French. If in Arabic, respond in Arabic. If in Spanish, respond in Spanish. If in English, respond in English.

Safety: Always highlight safety-critical information (LOTO, confined space, high voltage, etc.) when relevant to the question.
"""


def build_chat_system_prompt(
    equipment_type_id: str,
    equipment_tag: str = "",
    manuals_dir: Path | None = None,
) -> list[dict]:
    """Build Anthropic-format system prompt blocks with cache_control.

    Returns a list of content blocks for the `system` parameter of messages.create().
    The equipment context block has cache_control for prompt caching (5-min TTL).
    """
    sections = load_equipment_context(equipment_type_id, manuals_dir)
    context_text = format_equipment_context(sections)

    total_tokens = sum(s.token_estimate for s in sections)
    has_manuals = any(s.source != "equipment-library" for s in sections)

    blocks: list[dict] = []

    # Block 1: Base instructions (small, changes rarely)
    blocks.append({
        "type": "text",
        "text": _BASE_INSTRUCTIONS,
    })

    # Block 2: Equipment context (large, cached for 5 min)
    if context_text:
        blocks.append({
            "type": "text",
            "text": context_text,
            "cache_control": {"type": "ephemeral"},
        })

    # Block 3: Session context (small, changes per session — not cached)
    session_parts = [f"Date: {date.today().isoformat()}"]
    if equipment_tag:
        session_parts.append(f"Equipment TAG: {equipment_tag}")
    names = get_equipment_type_names()
    eq_name = names.get(equipment_type_id, equipment_type_id)
    session_parts.append(f"Equipment type: {eq_name} ({equipment_type_id})")
    session_parts.append(f"Context: ~{total_tokens // 1000}K tokens loaded")
    if not has_manuals:
        session_parts.append("Note: No manual files found. Answering from equipment library data only.")

    blocks.append({
        "type": "text",
        "text": "\n".join(session_parts),
    })

    return blocks
