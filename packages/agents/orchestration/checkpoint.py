"""Session checkpoint management for crash recovery.

Saves and loads SessionState snapshots after each milestone approval,
enabling workflow resumption from the last approved milestone.
"""

from __future__ import annotations

from pathlib import Path

from agents.orchestration.session_state import SessionState

DEFAULT_CHECKPOINT_DIR = Path("sessions/checkpoints")


def save_checkpoint(
    session: SessionState,
    milestone_number: int,
    checkpoint_dir: Path = DEFAULT_CHECKPOINT_DIR,
) -> Path:
    """Save session state after milestone approval.

    Returns the path to the written checkpoint file.
    """
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    path = checkpoint_dir / f"{session.session_id}_m{milestone_number}.json"
    path.write_text(session.to_json(), encoding="utf-8")
    return path


def load_checkpoint(
    session_id: str,
    milestone_number: int,
    checkpoint_dir: Path = DEFAULT_CHECKPOINT_DIR,
) -> SessionState | None:
    """Load a checkpoint. Returns None if not found."""
    path = checkpoint_dir / f"{session_id}_m{milestone_number}.json"
    if not path.exists():
        return None
    return SessionState.from_json(path.read_text(encoding="utf-8"))


def find_latest_checkpoint(
    session_id: str,
    checkpoint_dir: Path = DEFAULT_CHECKPOINT_DIR,
) -> tuple[int, SessionState] | None:
    """Find the most recent checkpoint (highest milestone).

    Returns (milestone_num, session) or None if no checkpoints exist.
    """
    for m in range(4, 0, -1):
        session = load_checkpoint(session_id, m, checkpoint_dir)
        if session is not None:
            return (m, session)
    return None
