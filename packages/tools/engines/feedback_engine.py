# tools/engines/feedback_engine.py
"""Feedback engine for AMS deliverables.

Generates and manages _feedback.md companion files that capture consultant
and client feedback, quality trends, and improvement backlog.

Usage:
    from tools.engines.feedback_engine import init_feedback, record_feedback

    fb_path = init_feedback("/path/to/hierarchy-tree.xlsx")
    record_feedback(fb_path, "J. Cortinat", "Missing sub-assemblies", "Added 12 nodes")
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

_FEEDBACK_TEMPLATE = """\
# Feedback: {deliverable_name}

**Deliverable:** {deliverable_name}
**File:** {file_name}
**Created:** {created_at}
**Last Updated:** {created_at}

---

## 1. Version History

| Version | Date | Author | Quality Score | Change Summary |
|---------|------|--------|:------------:|----------------|
| — | — | — | — | — |

## 2. Consultant Feedback

| Date | Reviewer | Feedback | Action Taken | Impact | Status |
|------|----------|----------|-------------|--------|--------|
| — | — | — | — | — | — |

## 3. Quality Trend

| Version | Date | Overall Score | Delta | Notes |
|---------|------|:------------:|:-----:|-------|
| — | — | — | — | — |

## 4. Lessons Learned

| Date | Learning | Promoted | Target |
|------|----------|:--------:|--------|
| — | — | — | — |

## 5. Methodology Updates Triggered

| Date | Update | File Modified | Rationale |
|------|--------|---------------|-----------|
| — | — | — | — |

## 6. Improvement Backlog

| Date | Item | Priority | Status | Assigned To |
|------|------|----------|--------|-------------|
| — | — | — | — | — |

---
*Managed by VSC AMS Feedback Engine*
"""


def init_feedback(deliverable_path: str | Path) -> Path:
    """Create a _feedback.md scaffold for a deliverable.

    Args:
        deliverable_path: Path to the deliverable file.

    Returns:
        Path to the created _feedback.md file.
    """
    path = Path(deliverable_path)
    stem = path.stem
    feedback_path = path.parent / f"{stem}_feedback.md"

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    content = _FEEDBACK_TEMPLATE.format(
        deliverable_name=stem.replace("-", " ").replace("_", " ").title(),
        file_name=path.name,
        created_at=now,
    )

    feedback_path.write_text(content, encoding="utf-8")
    logger.info("Feedback file created: %s", feedback_path)
    return feedback_path


def record_feedback(
    feedback_path: str | Path,
    reviewer: str,
    feedback_text: str,
    action_taken: str,
    impact: str = "",
    status: str = "Open",
) -> None:
    """Append a feedback entry to the _feedback.md file.

    Args:
        feedback_path: Path to the _feedback.md file.
        reviewer: Name of the person providing feedback.
        feedback_text: The feedback content.
        action_taken: Description of action taken in response.
        impact: Optional impact description.
        status: Feedback status (Open, In Progress, Resolved).
    """
    path = Path(feedback_path)
    if not path.is_file():
        logger.warning("Feedback file not found: %s", path)
        return

    content = path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    new_row = f"| {today} | {reviewer} | {feedback_text} | {action_taken} | {impact} | {status} |"
    content = _append_to_table(content, "## 2. Consultant Feedback", new_row)
    content = _update_last_updated(content, today)

    path.write_text(content, encoding="utf-8")
    logger.info("Feedback recorded in %s by %s", path.name, reviewer)


def record_quality_trend(
    feedback_path: str | Path,
    version: str,
    overall_score: float,
    delta: float = 0.0,
    notes: str = "",
) -> None:
    """Append a quality trend entry to the _feedback.md file."""
    path = Path(feedback_path)
    if not path.is_file():
        return

    content = path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    delta_str = f"+{delta:.1f}" if delta >= 0 else f"{delta:.1f}"

    new_row = f"| {version} | {today} | {overall_score:.1f} | {delta_str} | {notes} |"
    content = _append_to_table(content, "## 3. Quality Trend", new_row)
    content = _update_last_updated(content, today)

    path.write_text(content, encoding="utf-8")


def record_version(
    feedback_path: str | Path,
    version: str,
    author: str,
    quality_score: float,
    change_summary: str,
) -> None:
    """Append a version history entry."""
    path = Path(feedback_path)
    if not path.is_file():
        return

    content = path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    new_row = f"| {version} | {today} | {author} | {quality_score:.0f} | {change_summary} |"
    content = _append_to_table(content, "## 1. Version History", new_row)
    content = _update_last_updated(content, today)

    path.write_text(content, encoding="utf-8")


def add_to_backlog(
    feedback_path: str | Path,
    item: str,
    priority: str = "Medium",
    assigned_to: str = "",
) -> None:
    """Add an item to the improvement backlog."""
    path = Path(feedback_path)
    if not path.is_file():
        return

    content = path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    new_row = f"| {today} | {item} | {priority} | Open | {assigned_to} |"
    content = _append_to_table(content, "## 6. Improvement Backlog", new_row)
    content = _update_last_updated(content, today)

    path.write_text(content, encoding="utf-8")


def promote_learning(
    feedback_path: str | Path,
    learning_text: str,
    target_dir: str | Path = "",
) -> None:
    """Record a learning and optionally promote it to a lessons-learned file."""
    path = Path(feedback_path)
    if not path.is_file():
        return

    content = path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    promoted = "Yes" if target_dir else "No"

    new_row = f"| {today} | {learning_text} | {promoted} | {target_dir} |"
    content = _append_to_table(content, "## 4. Lessons Learned", new_row)
    content = _update_last_updated(content, today)

    path.write_text(content, encoding="utf-8")

    if target_dir:
        target = Path(target_dir)
        target.mkdir(parents=True, exist_ok=True)
        ll_file = target / "lessons-learned.md"
        entry = f"\n- **{today}**: {learning_text}\n"
        with open(ll_file, "a", encoding="utf-8") as f:
            f.write(entry)


def get_improvement_backlog(feedback_path: str | Path) -> list[dict]:
    """Extract the improvement backlog from a _feedback.md file."""
    path = Path(feedback_path)
    if not path.is_file():
        return []

    content = path.read_text(encoding="utf-8")
    rows = _extract_table_rows(content, "## 6. Improvement Backlog")
    result = []
    for row in rows:
        cols = [c.strip() for c in row.split("|") if c.strip()]
        if len(cols) >= 5 and cols[0] != "—":
            result.append({
                "date": cols[0],
                "item": cols[1],
                "priority": cols[2],
                "status": cols[3],
                "assigned_to": cols[4],
            })
    return result


def compute_quality_trend(feedback_path: str | Path) -> list[dict]:
    """Extract quality trend data from a _feedback.md file."""
    path = Path(feedback_path)
    if not path.is_file():
        return []

    content = path.read_text(encoding="utf-8")
    rows = _extract_table_rows(content, "## 3. Quality Trend")
    result = []
    for row in rows:
        cols = [c.strip() for c in row.split("|") if c.strip()]
        if len(cols) >= 5 and cols[0] != "—":
            result.append({
                "version": cols[0],
                "date": cols[1],
                "overall_score": cols[2],
                "delta": cols[3],
                "notes": cols[4],
            })
    return result


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _append_to_table(content: str, section_header: str, new_row: str) -> str:
    """Append a row to a markdown table under a section header.

    Replaces placeholder rows (| — | — | ...) on first insertion.
    """
    # Find the section
    idx = content.find(section_header)
    if idx == -1:
        logger.warning("Section '%s' not found in feedback file", section_header)
        return content

    # Find the table after the header (skip header line + empty line + column headers + separator)
    after_header = content[idx:]
    lines = after_header.split("\n")

    # Find the placeholder row or last data row
    table_start = -1
    placeholder_idx = -1
    for i, line in enumerate(lines):
        if line.startswith("|") and "---" in line:
            table_start = i
        if table_start > 0 and i > table_start and line.startswith("|"):
            if "— |" in line or "—|" in line:
                placeholder_idx = i
                break

    if placeholder_idx > 0:
        # Replace placeholder with actual data
        lines[placeholder_idx] = new_row
    elif table_start > 0:
        # Append after last table row
        insert_at = table_start + 1
        for i in range(table_start + 1, len(lines)):
            if lines[i].startswith("|"):
                insert_at = i + 1
            else:
                break
        lines.insert(insert_at, new_row)

    return content[:idx] + "\n".join(lines)


def _extract_table_rows(content: str, section_header: str) -> list[str]:
    """Extract data rows from a markdown table under a section."""
    idx = content.find(section_header)
    if idx == -1:
        return []

    after = content[idx:]
    lines = after.split("\n")
    rows = []
    in_table = False
    past_separator = False
    for line in lines[1:]:  # skip header line
        if line.startswith("|") and "---" in line:
            in_table = True
            past_separator = True
            continue
        if past_separator and line.startswith("|"):
            rows.append(line)
        elif past_separator and not line.startswith("|") and line.strip():
            break  # End of table
    return rows


def _update_last_updated(content: str, date: str) -> str:
    """Update the 'Last Updated' metadata field."""
    return re.sub(
        r"\*\*Last Updated:\*\* .+",
        f"**Last Updated:** {date}",
        content,
        count=1,
    )
