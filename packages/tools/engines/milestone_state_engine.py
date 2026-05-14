# tools/engines/milestone_state_engine.py
"""Milestone state engine for AMS projects.

Manages the milestone progression (M1→M4) and persists state to the
client folder (2-state/gates.json, 2-state/session-state.json).

Usage:
    from tools.engines.milestone_state_engine import (
        init_milestone_state, get_current_milestone,
        advance_milestone, load_session_state, save_session_state,
    )

    state = init_milestone_state("goldfields-salares-norte", "gfsn-maintenance-strategy")
    current = get_current_milestone("goldfields-salares-norte", "gfsn-maintenance-strategy")
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from agents._shared.paths import (
    get_agent_state_file,
    get_gates_file,
    get_session_file,
    get_state_dir,
)

logger = logging.getLogger(__name__)

MILESTONES = ("M1", "M2", "M3", "M4")
MILESTONE_STATUSES = ("locked", "pending", "in_progress", "approved", "rejected")

AGENT_STATE_NAMES = ("orchestrator", "reliability", "planning", "spare-parts")

_AGENT_STATE_TEMPLATE = """\
# {agent_name} State

**Status:** Not yet started
**Last Active:** —
**Tasks Completed:** 0

## Completed Tasks

| # | Deliverable | Milestone | Date |
|---|-------------|-----------|------|

## Learnings

*No learnings recorded yet.*
"""


# ---------------------------------------------------------------------------
# Gates (milestone progression)
# ---------------------------------------------------------------------------


def init_milestone_state(client_slug: str, project_slug: str) -> dict:
    """Initialize milestone state files for a new project.

    Creates:
    - 2-state/gates.json with M1=pending, M2-M4=locked
    - 2-state/session-state.json with fresh session
    - 2-state/{agent}-state.md for each agent

    Returns the gates dict.
    """
    gates = _build_initial_gates()

    # Write gates.json
    gates_path = get_gates_file(client_slug, project_slug)
    gates_path.parent.mkdir(parents=True, exist_ok=True)
    _write_json(gates_path, gates)
    logger.info("Gates initialized at %s", gates_path)

    # Write session-state.json
    session = {
        "session_id": str(uuid.uuid4())[:8],
        "client_slug": client_slug,
        "project_slug": project_slug,
        "current_milestone": "M1",
        "deliverables_produced": [],
        "last_updated": _now_iso(),
    }
    session_path = get_session_file(client_slug, project_slug)
    _write_json(session_path, session)

    # Write agent state files
    agent_display = {
        "orchestrator": "Orchestrator (AG-001)",
        "reliability": "Reliability Engineer (AG-002)",
        "planning": "Planning Specialist (AG-003)",
        "spare-parts": "Spare Parts Specialist (AG-004)",
    }
    for name in AGENT_STATE_NAMES:
        state_path = get_agent_state_file(client_slug, project_slug, name)
        content = _AGENT_STATE_TEMPLATE.format(agent_name=agent_display.get(name, name))
        state_path.write_text(content, encoding="utf-8")

    return gates


def load_gates(client_slug: str, project_slug: str) -> dict | None:
    """Load the current gates state from gates.json."""
    path = get_gates_file(client_slug, project_slug)
    return _read_json(path)


def get_current_milestone(client_slug: str, project_slug: str) -> str | None:
    """Return the current milestone ID (e.g. 'M1').

    The current milestone is the first non-approved milestone.
    Returns None if all milestones are approved.
    """
    gates = load_gates(client_slug, project_slug)
    if gates is None:
        return None
    for m in MILESTONES:
        status = gates.get("milestones", {}).get(m, {}).get("status", "locked")
        if status != "approved":
            return m
    return None  # All approved


def advance_milestone(
    client_slug: str,
    project_slug: str,
    approved_by: str,
) -> dict:
    """Approve the current milestone and unlock the next one.

    Args:
        approved_by: Name of the person approving.

    Returns:
        Updated gates dict.

    Raises:
        ValueError: If no milestone is eligible for advancement.
    """
    gates = load_gates(client_slug, project_slug)
    if gates is None:
        raise ValueError("Gates not initialized. Call init_milestone_state() first.")

    current = None
    for m in MILESTONES:
        status = gates["milestones"][m]["status"]
        if status in ("pending", "in_progress"):
            current = m
            break

    if current is None:
        raise ValueError("No milestone eligible for advancement (all approved or locked)")

    now = _now_iso()

    # Approve current
    gates["milestones"][current]["status"] = "approved"
    gates["milestones"][current]["approved_by"] = approved_by
    gates["milestones"][current]["approved_at"] = now

    # Unlock next
    idx = MILESTONES.index(current)
    if idx + 1 < len(MILESTONES):
        next_m = MILESTONES[idx + 1]
        gates["milestones"][next_m]["status"] = "pending"
        gates["current_milestone"] = next_m
    else:
        gates["current_milestone"] = None  # All done

    # Persist
    gates_path = get_gates_file(client_slug, project_slug)
    _write_json(gates_path, gates)

    # Update session state
    _update_session_milestone(client_slug, project_slug, gates.get("current_milestone"))

    logger.info("Milestone %s approved by %s", current, approved_by)
    return gates


def reject_milestone(
    client_slug: str,
    project_slug: str,
    reason: str,
) -> dict:
    """Reject the current milestone and set it back to pending.

    Returns updated gates dict.
    """
    gates = load_gates(client_slug, project_slug)
    if gates is None:
        raise ValueError("Gates not initialized.")

    current = None
    for m in MILESTONES:
        status = gates["milestones"][m]["status"]
        if status in ("pending", "in_progress"):
            current = m
            break

    if current is None:
        raise ValueError("No active milestone to reject")

    gates["milestones"][current]["status"] = "rejected"
    gates["milestones"][current]["rejected_at"] = _now_iso()
    gates["milestones"][current]["rejection_reason"] = reason

    gates_path = get_gates_file(client_slug, project_slug)
    _write_json(gates_path, gates)

    logger.info("Milestone %s rejected: %s", current, reason)
    return gates


def set_milestone_in_progress(client_slug: str, project_slug: str) -> dict:
    """Set the current pending milestone to in_progress."""
    gates = load_gates(client_slug, project_slug)
    if gates is None:
        raise ValueError("Gates not initialized.")

    for m in MILESTONES:
        if gates["milestones"][m]["status"] == "pending":
            gates["milestones"][m]["status"] = "in_progress"
            gates_path = get_gates_file(client_slug, project_slug)
            _write_json(gates_path, gates)
            return gates

    raise ValueError("No pending milestone found")


# ---------------------------------------------------------------------------
# Session state
# ---------------------------------------------------------------------------


def load_session_state(client_slug: str, project_slug: str) -> dict | None:
    """Load session state from session-state.json."""
    return _read_json(get_session_file(client_slug, project_slug))


def save_session_state(client_slug: str, project_slug: str, state: dict) -> None:
    """Save session state to session-state.json."""
    state["last_updated"] = _now_iso()
    _write_json(get_session_file(client_slug, project_slug), state)


def record_deliverable_produced(
    client_slug: str,
    project_slug: str,
    deliverable_id: str,
    path: str,
    milestone: str,
) -> None:
    """Append a deliverable to the session state's produced list."""
    session = load_session_state(client_slug, project_slug) or {}
    produced = session.get("deliverables_produced", [])
    produced.append({
        "deliverable_id": deliverable_id,
        "path": str(path),
        "milestone": milestone,
        "produced_at": _now_iso(),
    })
    session["deliverables_produced"] = produced
    save_session_state(client_slug, project_slug, session)


# ---------------------------------------------------------------------------
# Agent state
# ---------------------------------------------------------------------------


def update_agent_state(
    client_slug: str,
    project_slug: str,
    agent_name: str,
    deliverable_name: str,
    milestone: str,
) -> None:
    """Update an agent's state file after producing a deliverable."""
    state_path = get_agent_state_file(client_slug, project_slug, agent_name)
    if not state_path.is_file():
        logger.warning("Agent state file not found: %s", state_path)
        return

    content = state_path.read_text(encoding="utf-8")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Update status
    content = content.replace("**Status:** Not yet started", "**Status:** Active")
    content = content.replace("**Last Active:** —", f"**Last Active:** {today}")

    # Count existing tasks and increment
    import re
    task_count = len(re.findall(r"^\| \d+", content, re.MULTILINE))
    new_count = task_count + 1
    content = re.sub(
        r"\*\*Tasks Completed:\*\* \d+",
        f"**Tasks Completed:** {new_count}",
        content,
    )

    # Append to completed tasks table
    new_row = f"| {new_count} | {deliverable_name} | {milestone} | {today} |"
    # Find the end of the table
    table_marker = "## Learnings"
    idx = content.find(table_marker)
    if idx > 0:
        content = content[:idx] + new_row + "\n\n" + content[idx:]

    state_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_initial_gates() -> dict:
    """Build the initial gates structure with M1=pending, rest=locked."""
    milestones = {}
    for i, m in enumerate(MILESTONES):
        milestones[m] = {
            "status": "pending" if i == 0 else "locked",
            "approved_by": None,
            "approved_at": None,
        }
    return {
        "milestones": milestones,
        "current_milestone": "M1",
        "created_at": _now_iso(),
    }


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _read_json(path: Path) -> dict | None:
    if not path.is_file():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Failed to read JSON from %s: %s", path, exc)
        return None


def _update_session_milestone(
    client_slug: str, project_slug: str, milestone: str | None
) -> None:
    session = load_session_state(client_slug, project_slug)
    if session:
        session["current_milestone"] = milestone
        save_session_state(client_slug, project_slug, session)
