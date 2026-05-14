"""Knowledge Base Curator service — extracts knowledge from resolved sessions.

Mines resolved troubleshooting diagnostics and completed RCA analyses,
then creates ExpertContribution entries in the knowledge base for
downstream validation and promotion.

Pipeline:
  1. Query resolved TroubleshootingDiagnostic records in lookback window
  2. Query completed RCAAnalysis records in lookback window
  3. Extract structured knowledge from each source
  4. Deduplicate against existing contributions
  5. Persist new ExpertContribution entries (status=PENDING)
  6. Return curation summary
"""

import json
import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from api.database.models import (
    TroubleshootingDiagnosticModel,
    RCAAnalysisModel,
    ExpertContributionModel,
)
from api.services.audit_service import log_action

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper — safe JSON field access
# ---------------------------------------------------------------------------

def _safe_json(value) -> dict | list | None:
    """Return parsed JSON regardless of whether the column is already parsed."""
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None
    return None


def _to_json_text(value) -> str:
    """Serialize a Python object to a JSON string for Text columns."""
    if value is None:
        return "[]"
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Extraction helpers — Troubleshooting
# ---------------------------------------------------------------------------

def _extract_steps(ai_diagnosis) -> list[str]:
    """Extract diagnostic steps from ai_diagnosis JSON.

    Expected structures:
      - dict with keys like "steps", "verification_steps", "diagnosis_steps"
      - plain string (wrap in list)
    """
    parsed = _safe_json(ai_diagnosis)
    if parsed is None:
        return []
    if isinstance(parsed, str):
        return [parsed] if parsed.strip() else []
    if isinstance(parsed, list):
        return [str(s) for s in parsed if s]
    if isinstance(parsed, dict):
        steps: list[str] = []
        for key in ("steps", "verification_steps", "diagnosis_steps",
                     "diagnostic_steps", "pasos_verificacion"):
            val = parsed.get(key)
            if isinstance(val, list):
                steps.extend(str(s) for s in val if s)
            elif isinstance(val, str) and val.strip():
                steps.append(val)
        # If no known keys matched, try "diagnosis" text as a step
        if not steps and parsed.get("diagnosis"):
            steps.append(str(parsed["diagnosis"]))
        return steps
    return []


def _extract_actions(recommended_actions, resolution_notes: str) -> list[str]:
    """Combine recommended_actions JSON + resolution_notes into action strings."""
    actions: list[str] = []
    parsed = _safe_json(recommended_actions)
    if isinstance(parsed, list):
        actions.extend(str(a) for a in parsed if a)
    elif isinstance(parsed, dict):
        for key in ("actions", "corrective_actions", "recommendations"):
            val = parsed.get(key)
            if isinstance(val, list):
                actions.extend(str(a) for a in val if a)
            elif isinstance(val, str) and val.strip():
                actions.append(val)
        if not actions:
            # Fallback: dump all values
            for v in parsed.values():
                if isinstance(v, str) and v.strip():
                    actions.append(v)
    elif isinstance(parsed, str) and parsed.strip():
        actions.append(parsed)

    if resolution_notes and resolution_notes.strip():
        actions.append(f"[Resolucion] {resolution_notes.strip()}")
    return actions


# ---------------------------------------------------------------------------
# Extraction helpers — RCA
# ---------------------------------------------------------------------------

def _extract_5w2h_steps(analysis_5w2h) -> list[str]:
    """Parse 5W2H JSON into diagnostic step strings."""
    parsed = _safe_json(analysis_5w2h)
    if not isinstance(parsed, dict):
        return []
    steps: list[str] = []
    label_map = {
        "what": "Que",
        "why": "Por que",
        "where": "Donde",
        "when": "Cuando",
        "who": "Quien",
        "how": "Como",
        "how_much": "Cuanto",
    }
    for key, label in label_map.items():
        val = parsed.get(key)
        if val and isinstance(val, str) and val.strip():
            steps.append(f"{label}: {val.strip()}")
        elif val and isinstance(val, list):
            steps.append(f"{label}: {'; '.join(str(v) for v in val)}")
    return steps


def _extract_rca_solutions(solutions) -> list[str]:
    """Parse solutions JSON into action strings."""
    parsed = _safe_json(solutions)
    if isinstance(parsed, list):
        actions: list[str] = []
        for item in parsed:
            if isinstance(item, str) and item.strip():
                actions.append(item)
            elif isinstance(item, dict):
                desc = item.get("description") or item.get("action") or item.get("solution", "")
                if desc and str(desc).strip():
                    actions.append(str(desc).strip())
        return actions
    if isinstance(parsed, dict):
        return [str(v) for v in parsed.values() if v and str(v).strip()]
    return []


def _extract_rca_tips(cause_effect, evidence_5p) -> list[str]:
    """Extract patterns/tips from cause-effect analysis and 5P evidence."""
    tips: list[str] = []

    ce = _safe_json(cause_effect)
    if isinstance(ce, dict):
        for key in ("root_cause", "causa_raiz", "cause", "pattern"):
            val = ce.get(key)
            if isinstance(val, str) and val.strip():
                tips.append(f"[Causa-Efecto] {val.strip()}")
            elif isinstance(val, list):
                tips.extend(f"[Causa-Efecto] {str(v)}" for v in val if v)
        # Ishikawa categories
        for key in ("man", "machine", "method", "material", "environment"):
            val = ce.get(key)
            if isinstance(val, str) and val.strip():
                tips.append(f"[{key.title()}] {val.strip()}")
            elif isinstance(val, list):
                tips.extend(f"[{key.title()}] {str(v)}" for v in val if v)

    ep = _safe_json(evidence_5p)
    if isinstance(ep, list):
        for i, why in enumerate(ep, 1):
            if isinstance(why, str) and why.strip():
                tips.append(f"[5P-{i}] {why.strip()}")
            elif isinstance(why, dict):
                q = why.get("question") or why.get("pregunta", "")
                a = why.get("answer") or why.get("respuesta", "")
                if q or a:
                    tips.append(f"[5P-{i}] {q} -> {a}")

    return tips


# ---------------------------------------------------------------------------
# Deduplication helper
# ---------------------------------------------------------------------------

def _contribution_exists(db: Session, source_type: str, source_id: str) -> bool:
    """Check if a contribution already exists for this source.

    Uses consultation_id field to store the composite key 'SOURCE_TYPE:SOURCE_ID'.
    """
    tag = f"{source_type}:{source_id}"
    return (
        db.query(ExpertContributionModel.contribution_id)
        .filter(ExpertContributionModel.consultation_id == tag)
        .first()
    ) is not None


# ---------------------------------------------------------------------------
# Single-diagnostic extraction (public)
# ---------------------------------------------------------------------------

def extract_from_diagnostic(
    db: Session,
    diagnostic_id: str,
) -> dict | None:
    """Extract knowledge from a single resolved troubleshooting diagnostic.

    Returns the knowledge dict or None if not found / not resolved.
    """
    diag = (
        db.query(TroubleshootingDiagnosticModel)
        .filter(TroubleshootingDiagnosticModel.diagnostic_id == diagnostic_id)
        .first()
    )
    if not diag:
        log.warning("Diagnostic %s not found", diagnostic_id)
        return None
    if not diag.resolved:
        log.info("Diagnostic %s is not resolved — skipping", diagnostic_id)
        return None

    return {
        "source_type": "TROUBLESHOOTING",
        "source_id": diag.diagnostic_id,
        "equipment_tag": diag.equipment_tag or "",
        "symptom_descriptions": [diag.symptom_description] if diag.symptom_description else [],
        "diagnostic_steps": _extract_steps(diag.ai_diagnosis),
        "corrective_actions": _extract_actions(diag.recommended_actions, diag.resolution_notes),
        "tips": [],
        "confidence": diag.confidence_score or 0.5,
    }


# ---------------------------------------------------------------------------
# Main curation pipeline (public)
# ---------------------------------------------------------------------------

def curate_knowledge(
    db: Session,
    plant_id: str = "OCP-JFC1",
    days_lookback: int = 30,
) -> dict:
    """Curate knowledge from resolved diagnostics and completed RCAs.

    Steps:
      1. Query resolved troubleshooting diagnostics in the lookback window
      2. Query completed RCA analyses in the lookback window
      3. Extract structured knowledge from each source
      4. Deduplicate against existing contributions
      5. Persist new ExpertContribution entries
      6. Return curation summary
    """
    cutoff = datetime.now() - timedelta(days=days_lookback)
    knowledge_items: list[dict] = []
    created = 0
    skipped = 0

    # ── Step 1: Resolved troubleshooting diagnostics ──────────────────
    diagnostics = (
        db.query(TroubleshootingDiagnosticModel)
        .filter(
            TroubleshootingDiagnosticModel.plant_id == plant_id,
            TroubleshootingDiagnosticModel.resolved.is_(True),
            TroubleshootingDiagnosticModel.created_at >= cutoff,
            TroubleshootingDiagnosticModel.resolution_notes != "",
        )
        .all()
    )
    log.info("Found %d resolved diagnostics in lookback window", len(diagnostics))

    # ── Step 2: Completed RCA analyses ────────────────────────────────
    rcas = (
        db.query(RCAAnalysisModel)
        .filter(
            RCAAnalysisModel.plant_id == plant_id,
            RCAAnalysisModel.status == "COMPLETED",
            RCAAnalysisModel.completed_at >= cutoff,
        )
        .all()
    )
    log.info("Found %d completed RCAs in lookback window", len(rcas))

    # ── Step 3: Extract from diagnostics ──────────────────────────────
    for diag in diagnostics:
        item = {
            "source_type": "TROUBLESHOOTING",
            "source_id": diag.diagnostic_id,
            "equipment_tag": diag.equipment_tag or "",
            "symptom_descriptions": [diag.symptom_description] if diag.symptom_description else [],
            "diagnostic_steps": _extract_steps(diag.ai_diagnosis),
            "corrective_actions": _extract_actions(diag.recommended_actions, diag.resolution_notes),
            "tips": [],
            "confidence": diag.confidence_score or 0.5,
        }
        knowledge_items.append(item)

    # ── Step 4: Extract from RCAs ─────────────────────────────────────
    for rca in rcas:
        item = {
            "source_type": "RCA",
            "source_id": rca.analysis_id,
            "equipment_tag": rca.equipment_id or "",
            "symptom_descriptions": [rca.event_description] if rca.event_description else [],
            "diagnostic_steps": _extract_5w2h_steps(rca.analysis_5w2h),
            "corrective_actions": _extract_rca_solutions(rca.solutions),
            "tips": _extract_rca_tips(rca.cause_effect, rca.evidence_5p),
            "confidence": 0.85,
        }
        knowledge_items.append(item)

    # ── Step 5: Persist new contributions ─────────────────────────────
    for item in knowledge_items:
        source_tag = f"{item['source_type']}:{item['source_id']}"
        if _contribution_exists(db, item["source_type"], item["source_id"]):
            log.debug("Contribution already exists for %s — skipping", source_tag)
            skipped += 1
            continue

        contribution = ExpertContributionModel(
            consultation_id=source_tag,
            expert_id="SYSTEM_CURATOR",
            equipment_type_id=item["equipment_tag"],
            fm_codes=_to_json_text([]),
            symptom_descriptions=_to_json_text(item["symptom_descriptions"]),
            diagnostic_steps=_to_json_text(item["diagnostic_steps"]),
            corrective_actions=_to_json_text(item["corrective_actions"]),
            tips=_to_json_text(item["tips"]),
            status="PENDING",
        )
        db.add(contribution)
        db.flush()

        log_action(
            db,
            entity_type="expert_contribution",
            entity_id=contribution.contribution_id,
            action="CURATED_FROM_" + item["source_type"],
            payload={
                "source_id": item["source_id"],
                "equipment_tag": item["equipment_tag"],
                "confidence": item["confidence"],
            },
            user="SYSTEM_CURATOR",
        )
        created += 1
        log.info("Created contribution %s from %s", contribution.contribution_id, source_tag)

    db.commit()

    # ── Step 6: Return summary ────────────────────────────────────────
    summary_msg = (
        f"Curated {created} new contributions "
        f"({len(diagnostics)} diagnostics, {len(rcas)} RCAs); "
        f"{skipped} skipped (already existed)"
    )
    log.info(summary_msg)

    return {
        "plant_id": plant_id,
        "curated_at": datetime.now().isoformat(),
        "period_days": days_lookback,
        "diagnostics_processed": len(diagnostics),
        "rca_processed": len(rcas),
        "contributions_created": created,
        "contributions_skipped": skipped,
        "knowledge_items": knowledge_items,
        "summary": summary_msg,
    }
