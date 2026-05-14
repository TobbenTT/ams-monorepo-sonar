# tools/engines/trace_engine.py
"""Trace engine for AMS deliverables.

Generates _trace.md companion files that document how each deliverable
was produced: inputs consumed, processing steps, decisions, quality scores.

Includes a batch guard that rejects scaffold-only generation.

Usage:
    from tools.engines.trace_engine import (
        start_trace, record_input, record_step, record_decision,
        finalize_trace,
    )

    ctx = start_trace("AMS-001", "AG-002", "M1")
    record_input(ctx, "equipment-list", "0-input/01-equipment-list/", True, True)
    record_step(ctx, "Build hierarchy", "hierarchy_builder_engine", 12.5, "6-level tree built")
    md = finalize_trace(ctx, quality_scores={...})
"""

from __future__ import annotations

import logging
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)


class BatchGenerationError(Exception):
    """Raised when a trace indicates batch/scaffold generation without real LLM execution."""


@dataclass
class TraceContext:
    """Mutable context that collects trace data during deliverable generation."""

    deliverable_id: str
    agent_id: str
    milestone: str
    spec_path: str | None = None
    session_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    start_time: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    inputs: list[dict] = field(default_factory=list)
    steps: list[dict] = field(default_factory=list)
    decisions: list[dict] = field(default_factory=list)
    assumptions: list[dict] = field(default_factory=list)
    rfis: list[dict] = field(default_factory=list)
    downstream_deps: list[dict] = field(default_factory=list)
    human_checkpoints: list[dict] = field(default_factory=list)
    audit_trail: list[dict] = field(default_factory=list)

    quality_scores: dict | None = None
    model: str = field(
        default_factory=lambda: os.environ.get("AMS_LLM_MODEL", "claude-opus-4-6")
    )
    tokens_used: int = 0
    spec_version: str = "1.0"


# ---------------------------------------------------------------------------
# Recording functions
# ---------------------------------------------------------------------------


def start_trace(
    deliverable_id: str,
    agent_id: str,
    milestone: str,
    spec_path: str | None = None,
) -> TraceContext:
    """Initialize a new trace context for a deliverable being generated."""
    ctx = TraceContext(
        deliverable_id=deliverable_id,
        agent_id=agent_id,
        milestone=milestone,
        spec_path=spec_path,
    )
    ctx.audit_trail.append({
        "timestamp": ctx.start_time.isoformat(),
        "event": "trace_started",
        "details": f"Trace initiated for {deliverable_id} by {agent_id} at {milestone}",
    })
    return ctx


def record_input(
    ctx: TraceContext,
    input_id: str,
    source: str,
    mandatory: bool,
    read: bool,
    fields_used: str = "",
    quality_score: int | None = None,
) -> None:
    """Record an input document consumed during deliverable generation."""
    ctx.inputs.append({
        "input_id": input_id,
        "source": source,
        "mandatory": mandatory,
        "read": read,
        "fields_used": fields_used,
        "quality_score": quality_score,
    })


def record_step(
    ctx: TraceContext,
    action: str,
    tool_or_skill: str,
    duration_secs: float,
    output_summary: str,
) -> None:
    """Record a processing step in the generation pipeline."""
    ctx.steps.append({
        "action": action,
        "tool_or_skill": tool_or_skill,
        "duration_secs": round(duration_secs, 2),
        "output_summary": output_summary,
    })
    ctx.tokens_used += 1  # Placeholder — real implementation would track actual tokens


def record_decision(
    ctx: TraceContext,
    decision_id: str,
    options: list[str],
    chosen: str,
    rationale: str,
    confidence: str = "High",
    reversible: bool = True,
) -> None:
    """Record a decision made during deliverable generation."""
    ctx.decisions.append({
        "decision_id": decision_id,
        "options": options,
        "chosen": chosen,
        "rationale": rationale,
        "confidence": confidence,
        "reversible": reversible,
    })


def record_assumption(
    ctx: TraceContext,
    assumption_id: str,
    description: str,
    impact: str = "Medium",
    validation_method: str = "",
) -> None:
    """Record an assumption made during generation."""
    ctx.assumptions.append({
        "assumption_id": assumption_id,
        "description": description,
        "impact": impact,
        "validation_method": validation_method,
    })


def record_rfi(
    ctx: TraceContext,
    rfi_id: str,
    question: str,
    target: str = "Client",
    priority: str = "Medium",
    blocking: bool = False,
) -> None:
    """Record an RFI generated during deliverable creation."""
    ctx.rfis.append({
        "rfi_id": rfi_id,
        "question": question,
        "target": target,
        "priority": priority,
        "blocking": blocking,
    })


def record_downstream_dep(
    ctx: TraceContext,
    dep_id: str,
    target_deliverable: str,
    dependency_type: str = "input",
    notes: str = "",
) -> None:
    """Record a downstream dependency on another deliverable."""
    ctx.downstream_deps.append({
        "dep_id": dep_id,
        "target_deliverable": target_deliverable,
        "dependency_type": dependency_type,
        "notes": notes,
    })


def record_human_checkpoint(
    ctx: TraceContext,
    checkpoint_id: str,
    required_by: str,
    status: str = "Pending",
    reviewer: str = "",
    notes: str = "",
) -> None:
    """Record a human checkpoint requiring review."""
    ctx.human_checkpoints.append({
        "checkpoint_id": checkpoint_id,
        "required_by": required_by,
        "status": status,
        "reviewer": reviewer,
        "notes": notes,
    })


# ---------------------------------------------------------------------------
# Batch guard
# ---------------------------------------------------------------------------


def validate_trace_is_genuine(
    ctx: TraceContext,
    *,
    allow_scaffold: bool = False,
) -> list[str]:
    """Validate that a trace represents genuine LLM-powered generation.

    Returns a list of violation messages (empty list = valid).
    Raises BatchGenerationError if allow_scaffold is False and violations found.
    """
    violations: list[str] = []

    if ctx.tokens_used <= 0:
        violations.append("tokens_used = 0: LLM was not invoked")

    read_inputs = [i for i in ctx.inputs if i.get("read")]
    if len(read_inputs) < 2:
        violations.append(
            f"Only {len(read_inputs)} inputs read (minimum 2 required)"
        )

    if violations and not allow_scaffold:
        raise BatchGenerationError(
            f"Trace for {ctx.deliverable_id} failed batch guard: "
            + "; ".join(violations)
        )

    return violations


# ---------------------------------------------------------------------------
# Finalization — generate markdown
# ---------------------------------------------------------------------------


def finalize_trace(
    ctx: TraceContext,
    quality_scores: dict | None = None,
    enforce_batch_guard: bool = True,
    allow_scaffold: bool = False,
) -> str:
    """Finalize the trace and return the complete markdown document.

    Args:
        ctx: The trace context with all recorded data.
        quality_scores: Optional quality scores (dimension -> score).
        enforce_batch_guard: Whether to validate genuine execution.
        allow_scaffold: If True, skip batch guard (for testing/scaffolding).

    Returns:
        Complete markdown string for _trace.md.

    Raises:
        BatchGenerationError: If batch guard is enforced and trace is invalid.
    """
    end_time = datetime.now(timezone.utc)
    duration = (end_time - ctx.start_time).total_seconds()

    if quality_scores:
        ctx.quality_scores = quality_scores

    if enforce_batch_guard:
        validate_trace_is_genuine(ctx, allow_scaffold=allow_scaffold)

    ctx.audit_trail.append({
        "timestamp": end_time.isoformat(),
        "event": "trace_finalized",
        "details": f"Duration: {duration:.1f}s, Tokens: {ctx.tokens_used}",
    })

    # Resolve deliverable name from registry
    deliverable_name = ctx.deliverable_id
    try:
        from tools.engines.ams_deliverable_registry import get_registry
        entry = get_registry().get_deliverable(ctx.deliverable_id)
        if entry:
            deliverable_name = entry.name
    except Exception:
        pass

    # Resolve agent name
    agent_name = ctx.agent_id
    try:
        from tools.engines.ams_deliverable_registry import get_registry
        reg = get_registry()
        agent_meta = reg.agents.get(ctx.agent_id, {})
        agent_name = agent_meta.get("name", ctx.agent_id)
    except Exception:
        pass

    lines: list[str] = []

    # --- Section 1: Identity ---
    lines.append(f"# Trace: {deliverable_name}")
    lines.append("")
    lines.append("## 1. Identity")
    lines.append("")
    lines.append("| Field | Value |")
    lines.append("|-------|-------|")
    lines.append(f"| Deliverable ID | {ctx.deliverable_id} |")
    lines.append(f"| Name | {deliverable_name} |")
    lines.append(f"| Milestone | {ctx.milestone} |")
    lines.append(f"| Agent | {ctx.agent_id} ({agent_name}) |")
    lines.append(f"| Session ID | {ctx.session_id} |")
    lines.append(f"| Generated | {end_time.strftime('%Y-%m-%d %H:%M:%S UTC')} |")
    lines.append(f"| Duration | {duration:.1f}s |")
    lines.append(f"| Model | {ctx.model} |")
    lines.append(f"| Tokens Used | {ctx.tokens_used} |")
    lines.append(f"| Spec Version | {ctx.spec_version} |")
    if ctx.spec_path:
        lines.append(f"| Spec Path | {ctx.spec_path} |")
    lines.append("")

    # --- Section 2: Inputs Consumed ---
    lines.append("## 2. Inputs Consumed")
    lines.append("")
    if ctx.inputs:
        lines.append("| Input ID | Source | Mandatory | Read | Fields Used | Quality |")
        lines.append("|----------|--------|-----------|------|-------------|---------|")
        for inp in ctx.inputs:
            q = inp.get("quality_score", "—")
            lines.append(
                f"| {inp['input_id']} | {inp['source']} | "
                f"{'Yes' if inp['mandatory'] else 'No'} | "
                f"{'Yes' if inp['read'] else 'No'} | "
                f"{inp.get('fields_used', '')} | {q} |"
            )
    else:
        lines.append("*No inputs recorded.*")
    lines.append("")

    # --- Section 3: Processing Pipeline ---
    lines.append("## 3. Processing Pipeline")
    lines.append("")
    if ctx.steps:
        lines.append("| # | Action | Tool/Skill | Duration (s) | Output Summary |")
        lines.append("|---|--------|------------|--------------|----------------|")
        for i, step in enumerate(ctx.steps, 1):
            lines.append(
                f"| {i} | {step['action']} | {step['tool_or_skill']} | "
                f"{step['duration_secs']} | {step['output_summary']} |"
            )
    else:
        lines.append("*No steps recorded.*")
    lines.append("")

    # --- Section 4: Decisions Made ---
    lines.append("## 4. Decisions Made")
    lines.append("")
    if ctx.decisions:
        lines.append("| Decision ID | Options | Chosen | Rationale | Confidence | Reversible |")
        lines.append("|-------------|---------|--------|-----------|------------|------------|")
        for d in ctx.decisions:
            opts = ", ".join(d["options"]) if isinstance(d["options"], list) else d["options"]
            lines.append(
                f"| {d['decision_id']} | {opts} | {d['chosen']} | "
                f"{d['rationale']} | {d['confidence']} | "
                f"{'Yes' if d['reversible'] else 'No'} |"
            )
    else:
        lines.append("*No decisions recorded.*")
    lines.append("")

    # --- Section 5: Quality Assessment ---
    lines.append("## 5. Quality Assessment")
    lines.append("")
    if ctx.quality_scores:
        lines.append("| Dimension | Weight | Score |")
        lines.append("|-----------|--------|-------|")
        _weights = {
            "technical_accuracy": 0.25, "completeness": 0.25,
            "consistency": 0.15, "format": 0.10,
            "actionability": 0.10, "traceability": 0.10,
            "intent_alignment": 0.05,
        }
        total = 0.0
        total_w = 0.0
        for dim, weight in _weights.items():
            score = ctx.quality_scores.get(dim, 0)
            display_name = dim.replace("_", " ").title()
            lines.append(f"| {display_name} | {weight:.0%} | {score:.0f} |")
            total += score * weight
            total_w += weight
        weighted = total / total_w if total_w > 0 else 0
        lines.append(f"| **Weighted Total** | **100%** | **{weighted:.1f}** |")
    else:
        lines.append("*No quality scores recorded.*")
    lines.append("")

    # --- Section 6: Assumptions ---
    lines.append("## 6. Assumptions & Limitations")
    lines.append("")
    if ctx.assumptions:
        lines.append("| ID | Description | Impact | Validation Method |")
        lines.append("|----|-------------|--------|-------------------|")
        for a in ctx.assumptions:
            lines.append(
                f"| {a['assumption_id']} | {a['description']} | "
                f"{a['impact']} | {a.get('validation_method', '')} |"
            )
    else:
        lines.append("*No assumptions recorded.*")
    lines.append("")

    # --- Section 7: RFIs Generated ---
    lines.append("## 7. RFIs Generated")
    lines.append("")
    if ctx.rfis:
        lines.append("| RFI ID | Question | Target | Priority | Blocking |")
        lines.append("|--------|----------|--------|----------|----------|")
        for r in ctx.rfis:
            lines.append(
                f"| {r['rfi_id']} | {r['question']} | {r['target']} | "
                f"{r['priority']} | {'Yes' if r['blocking'] else 'No'} |"
            )
    else:
        lines.append("*No RFIs generated.*")
    lines.append("")

    # --- Section 8: Downstream Dependencies ---
    lines.append("## 8. Downstream Dependencies")
    lines.append("")
    if ctx.downstream_deps:
        lines.append("| Dep ID | Target Deliverable | Type | Notes |")
        lines.append("|--------|--------------------|------|-------|")
        for dep in ctx.downstream_deps:
            lines.append(
                f"| {dep['dep_id']} | {dep['target_deliverable']} | "
                f"{dep['dependency_type']} | {dep.get('notes', '')} |"
            )
    else:
        lines.append("*No downstream dependencies.*")
    lines.append("")

    # --- Section 9: Human Checkpoints ---
    lines.append("## 9. Human Checkpoints")
    lines.append("")
    if ctx.human_checkpoints:
        lines.append("| Checkpoint ID | Required By | Status | Reviewer | Notes |")
        lines.append("|---------------|-------------|--------|----------|-------|")
        for hc in ctx.human_checkpoints:
            lines.append(
                f"| {hc['checkpoint_id']} | {hc['required_by']} | "
                f"{hc['status']} | {hc.get('reviewer', '')} | {hc.get('notes', '')} |"
            )
    else:
        lines.append("*No human checkpoints recorded.*")
    lines.append("")

    # --- Section 10: Audit Trail ---
    lines.append("## 10. Audit Trail")
    lines.append("")
    if ctx.audit_trail:
        lines.append("| Timestamp | Event | Details |")
        lines.append("|-----------|-------|---------|")
        for at in ctx.audit_trail:
            lines.append(f"| {at['timestamp']} | {at['event']} | {at['details']} |")
    else:
        lines.append("*No audit entries.*")
    lines.append("")

    lines.append("---")
    lines.append("*Generated by VSC AMS Trace Engine*")

    return "\n".join(lines)
