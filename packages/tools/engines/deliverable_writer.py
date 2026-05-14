# tools/engines/deliverable_writer.py
"""Unified deliverable writer for AMS.

Single entry point for writing a deliverable to the client folder with
all 3 companion files (spec, trace, feedback) and state updates.

Usage:
    from tools.engines.deliverable_writer import write_deliverable

    result = write_deliverable(
        client_slug="goldfields-salares-norte",
        project_slug="gfsn-maintenance-strategy",
        deliverable_id="AMS-001",
        content=dataframe_or_dict,
        format="xlsx",
        agent_id="AG-002",
        milestone="M1",
        trace_ctx=trace_context,
    )
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def write_deliverable(
    client_slug: str,
    project_slug: str,
    deliverable_id: str,
    content: Any,
    format: str,
    agent_id: str,
    milestone: str,
    trace_ctx: Any | None = None,
    quality_scores: dict | None = None,
) -> dict:
    """Write a deliverable with all companion files to the client folder.

    Performs:
    1. Validate output path via guardrail
    2. Write the main deliverable file to 1-output/{milestone}/
    3. Generate and write _spec.yaml companion
    4. Finalize and write _trace.md companion
    5. Initialize _feedback.md companion
    6. Update session-state.json with produced deliverable
    7. Update agent state file

    Args:
        client_slug: Client identifier.
        project_slug: Project identifier.
        deliverable_id: AMS-NNN deliverable ID.
        content: The deliverable content. Can be:
            - dict or list: written as JSON (if format is json) or passed to Excel writer
            - str: written as-is (for md format)
            - bytes: written as-is (for binary formats)
            - openpyxl.Workbook: saved directly (for xlsx)
        format: Output format (xlsx, docx, md, json, etc.)
        agent_id: Agent ID (AG-001 through AG-004).
        milestone: Milestone (M1 through M4).
        trace_ctx: Optional TraceContext from trace_engine.
        quality_scores: Optional quality scores dict.

    Returns:
        {
            "path": str,           # absolute path to main deliverable
            "spec_path": str,      # absolute path to _spec.yaml
            "trace_path": str,     # absolute path to _trace.md
            "feedback_path": str,  # absolute path to _feedback.md
            "deliverable_id": str,
            "milestone": str,
        }
    """
    from tools.engines.ams_deliverable_registry import get_registry
    from tools.engines.output_path_guardrail import ensure_output_dir, resolve_absolute_path
    from tools.engines.spec_engine import generate_spec
    from tools.engines.feedback_engine import init_feedback
    from tools.engines.milestone_state_engine import (
        record_deliverable_produced,
        update_agent_state,
    )

    registry = get_registry()
    entry = registry.get_deliverable(deliverable_id)
    if entry is None:
        raise ValueError(f"Unknown deliverable ID: {deliverable_id}")

    # 1. Ensure output directory exists
    ensure_output_dir(client_slug, project_slug, milestone)
    main_path = resolve_absolute_path(
        client_slug, project_slug, milestone, entry.slug, format
    )

    # 2. Write main deliverable file
    _write_content(main_path, content, format)
    logger.info("Deliverable written: %s", main_path)

    # 3. Generate and write _spec.yaml
    spec_yaml = generate_spec(deliverable_id)
    spec_path = main_path.parent / f"{main_path.stem}_spec.yaml"
    spec_path.write_text(spec_yaml, encoding="utf-8")

    # 4. Finalize and write _trace.md
    trace_path = main_path.parent / f"{main_path.stem}_trace.md"
    if trace_ctx is not None:
        from tools.engines.trace_engine import finalize_trace
        trace_md = finalize_trace(
            trace_ctx,
            quality_scores=quality_scores,
            enforce_batch_guard=False,  # Writer handles this gracefully
            allow_scaffold=True,
        )
        trace_path.write_text(trace_md, encoding="utf-8")
    else:
        # Generate a minimal trace placeholder
        trace_path.write_text(
            _minimal_trace(deliverable_id, agent_id, milestone),
            encoding="utf-8",
        )

    # 5. Initialize _feedback.md
    feedback_path = init_feedback(main_path)

    # 6. Update session state
    try:
        record_deliverable_produced(
            client_slug, project_slug, deliverable_id, str(main_path), milestone
        )
    except Exception as exc:
        logger.warning("Failed to update session state: %s", exc)

    # 7. Update agent state
    try:
        agent_name_map = {
            "AG-001": "orchestrator",
            "AG-002": "reliability",
            "AG-003": "planning",
            "AG-004": "spare-parts",
        }
        agent_name = agent_name_map.get(agent_id)
        if agent_name:
            update_agent_state(
                client_slug, project_slug, agent_name, entry.name, milestone
            )
    except Exception as exc:
        logger.warning("Failed to update agent state: %s", exc)

    return {
        "path": str(main_path),
        "spec_path": str(spec_path),
        "trace_path": str(trace_path),
        "feedback_path": str(feedback_path),
        "deliverable_id": deliverable_id,
        "milestone": milestone,
    }


def _write_content(path: Path, content: Any, fmt: str) -> None:
    """Write content to disk based on format type."""
    path.parent.mkdir(parents=True, exist_ok=True)

    if fmt == "md":
        path.write_text(str(content), encoding="utf-8")

    elif fmt == "json":
        with open(path, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2, ensure_ascii=False, default=str)

    elif fmt == "xlsx":
        # Try openpyxl Workbook first, then dict/list conversion
        try:
            # If content is an openpyxl Workbook
            if hasattr(content, "save"):
                content.save(path)
                return
        except Exception:
            pass

        # If content is dict/list, create a simple Excel
        try:
            import openpyxl

            wb = openpyxl.Workbook()
            ws = wb.active
            if isinstance(content, list) and len(content) > 0:
                if isinstance(content[0], dict):
                    # List of dicts -> headers + rows
                    headers = list(content[0].keys())
                    ws.append(headers)
                    for row in content:
                        ws.append([row.get(h) for h in headers])
                else:
                    for row in content:
                        ws.append(row if isinstance(row, (list, tuple)) else [row])
            elif isinstance(content, dict):
                for key, value in content.items():
                    ws.append([key, value])
            wb.save(path)
        except ImportError:
            # Fallback: write as JSON with xlsx extension
            logger.warning("openpyxl not available, writing JSON to %s", path)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(content, f, indent=2, ensure_ascii=False, default=str)

    elif fmt == "docx":
        try:
            if hasattr(content, "save"):
                content.save(path)
                return
        except Exception:
            pass
        # Fallback: write as text
        path.write_text(str(content), encoding="utf-8")

    else:
        # Generic: write as string or bytes
        if isinstance(content, bytes):
            path.write_bytes(content)
        else:
            path.write_text(str(content), encoding="utf-8")


def _minimal_trace(deliverable_id: str, agent_id: str, milestone: str) -> str:
    """Generate a minimal trace placeholder when no TraceContext is provided."""
    return f"""\
# Trace: {deliverable_id}

## 1. Identity

| Field | Value |
|-------|-------|
| Deliverable ID | {deliverable_id} |
| Milestone | {milestone} |
| Agent | {agent_id} |

*Note: This is a placeholder trace. For genuine traces, use the trace_engine.*

## 2. Inputs Consumed
*No inputs recorded.*

## 3. Processing Pipeline
*No steps recorded.*

## 4. Decisions Made
*No decisions recorded.*

## 5. Quality Assessment
*No quality scores recorded.*

## 6. Assumptions
*No assumptions recorded.*

## 7. RFIs Generated
*No RFIs generated.*

## 8. Downstream Dependencies
*No downstream dependencies.*

## 9. Human Checkpoints
*No human checkpoints recorded.*

## 10. Audit Trail
*No audit entries.*

---
*Generated by VSC AMS Trace Engine (placeholder)*
"""
