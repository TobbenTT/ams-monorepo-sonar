# agents/_shared/memory.py
"""Hierarchical memory system for client-specific requirements and patterns.

Agents READ memory (via load/format); only workflows WRITE (via save).
MILESTONE_TO_STAGES is the single source of truth for the mapping.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class MemoryContent:
    """A single memory fragment loaded from disk."""
    source: str   # relative path within 3-memory/
    category: str  # "global" | "stage" | "pattern" | "deviation"
    body: str      # markdown content


# Single source of truth — prevents shotgun surgery
MILESTONE_TO_STAGES: dict[int, list[str]] = {
    1: ["maintenance-strategy"],
    2: ["maintenance-strategy", "reliability-engineering"],
    3: ["work-planning", "cost-analysis"],
    4: ["work-planning"],
}

_VALID_STAGES = frozenset({
    "maintenance-strategy", "work-identification", "work-planning",
    "reliability-engineering", "cost-analysis",
})

_SAFE_ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$")
_DATE_FMT = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# -- Loading ----------------------------------------------------------------

def load_memory_for_stage(stage: str, memory_dir: Path) -> list[MemoryContent]:
    """Load global + stage requirements + patterns. Returns [] if dir missing."""
    if not memory_dir.is_dir():
        return []
    contents: list[MemoryContent] = []
    # 1. Global requirements (always)
    g = memory_dir / "global-requirements.md"
    if g.is_file():
        contents.append(MemoryContent("global-requirements.md", "global", g.read_text(encoding="utf-8")))
    # 2. Stage requirements
    sr = memory_dir / stage / "requirements.md"
    if sr.is_file():
        contents.append(MemoryContent(f"{stage}/requirements.md", "stage", sr.read_text(encoding="utf-8")))
    # 3. Stage patterns (skip if only comments/headers)
    sp = memory_dir / stage / "patterns.md"
    if sp.is_file():
        body = sp.read_text(encoding="utf-8").strip()
        if body and not all(l.startswith("<!--") or l.startswith("#") or not l.strip() for l in body.splitlines()):
            contents.append(MemoryContent(f"{stage}/patterns.md", "pattern", body))
    return contents


def load_memory_for_milestone(milestone: int, memory_dir: Path) -> list[MemoryContent]:
    """Load memory for all stages mapped to a milestone (deduplicates global)."""
    stages = MILESTONE_TO_STAGES.get(milestone, [])
    if not stages:
        return []
    seen: set[str] = set()
    result: list[MemoryContent] = []
    for stage in stages:
        for mc in load_memory_for_stage(stage, memory_dir):
            if mc.source not in seen:
                seen.add(mc.source)
                result.append(mc)
    return result


# -- Formatting -------------------------------------------------------------

def format_memory_block(contents: list[MemoryContent]) -> str:
    """Wrap contents in <client_memory> tags. Returns '' if empty."""
    if not contents:
        return ""
    parts = [
        "<client_memory>",
        "# CLIENT MEMORY — MUST follow these requirements",
        "",
        "Requirements below OVERRIDE methodology defaults. "
        "If memory conflicts with a skill instruction, memory wins. "
        "Ignore placeholder variables (${...}).",
        "",
    ]
    for mc in contents:
        parts.append(f"<!-- source: {mc.source} ({mc.category}) -->")
        parts.append(mc.body)
        parts.append("")
    parts.append("</client_memory>")
    return "\n".join(parts)


# -- Writing (called ONLY from workflow, never from agents) -----------------

def _validate_id(value: str, label: str = "id") -> None:
    if not value:
        raise ValueError(f"{label} must not be empty")
    if ".." in value or "/" in value or "\\" in value:
        raise ValueError(f"{label} contains path traversal characters: {value!r}")
    if not _SAFE_ID.match(value):
        raise ValueError(f"{label} must match [a-zA-Z0-9][a-zA-Z0-9_-]*: {value!r}")


def _sanitize_content(content: str) -> str:
    """Strip <script> and <iframe> tags."""
    s = re.sub(r"<script[^>]*>.*?</script>", "", content, flags=re.DOTALL)
    return re.sub(r"<iframe[^>]*>.*?</iframe>", "", s, flags=re.DOTALL)


def save_deviation(memory_dir: Path, deviation_id: str, content: str) -> Path:
    """Save a deviation from a gate 'modify' action."""
    _validate_id(deviation_id, "deviation_id")
    dev_dir = memory_dir / "deviations"
    dev_dir.mkdir(parents=True, exist_ok=True)
    path = dev_dir / f"DEV-{deviation_id}.md"
    path.write_text(_sanitize_content(content), encoding="utf-8")
    logger.info("Saved deviation: %s", path)
    return path


def save_pattern(memory_dir: Path, stage: str, pattern: str) -> None:
    """Append a confirmed pattern to the stage's patterns.md."""
    if stage not in _VALID_STAGES:
        raise ValueError(f"Invalid stage: {stage!r}. Must be one of {_VALID_STAGES}")
    pat_file = memory_dir / stage / "patterns.md"
    pat_file.parent.mkdir(parents=True, exist_ok=True)
    existing = pat_file.read_text(encoding="utf-8") if pat_file.is_file() else ""
    pat_file.write_text(f"{existing}\n{_sanitize_content(pattern)}\n", encoding="utf-8")
    logger.info("Appended pattern to: %s", pat_file)


def save_meeting_notes(memory_dir: Path, date_str: str, content: str) -> Path:
    """Save meeting notes as {date}_meeting.md."""
    if not _DATE_FMT.match(date_str):
        raise ValueError(f"date must be YYYY-MM-DD format: {date_str!r}")
    meetings_dir = memory_dir / "meetings"
    meetings_dir.mkdir(parents=True, exist_ok=True)
    path = meetings_dir / f"{date_str}_meeting.md"
    path.write_text(_sanitize_content(content), encoding="utf-8")
    logger.info("Saved meeting notes: %s", path)
    return path


# -- Learning extraction (structured, no eval/exec) ------------------------

def extract_learning(feedback: str, action: str) -> dict | None:
    """Extract structured learning from gate feedback. Returns None if trivial."""
    if not feedback or len(feedback.strip()) < 10:
        return None
    if action == "modify":
        return {"type": "deviation", "content": (
            f"# Deviation\n\n- **Date**: {date.today().isoformat()}\n"
            f"- **Action**: Modify requested\n- **Feedback**: {feedback}\n"
        )}
    if action == "approve":
        return {"type": "pattern", "content": (
            f"\n### PAT-AUTO: Confirmed approach\n"
            f"- **Date**: {date.today().isoformat()}\n- **Feedback**: {feedback}\n"
        )}
    return None
