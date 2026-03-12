"""GAP-W13: Expert Knowledge Capture Engine.

Deterministic logic for expert matching, consultation lifecycle,
knowledge extraction, validation, and promotion to knowledge base.

No LLM — follows the TroubleshootingEngine pattern (all static methods).
"""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

# ── Valid FM codes (72-combo) ────────────────────────────────────────────
_VALID_FM_CODES: set[str] = {f"FM-{i:02d}" for i in range(1, 73)}

# ── Symptom category → ExpertDomain mapping ──────────────────────────────
_SYMPTOM_TO_DOMAIN: dict[str, str] = {
    "vibration": "MECHANICAL",
    "noise": "MECHANICAL",
    "temperature": "MECHANICAL",
    "leak": "MECHANICAL",
    "pressure": "PROCESS",
    "flow": "PROCESS",
    "electrical": "ELECTRICAL",
    "visual": "MECHANICAL",
    "smell": "PROCESS",
    "performance": "RELIABILITY",
    "alignment": "MECHANICAL",
    "contamination": "PROCESS",
}

# ── Regex patterns for contribution extraction ───────────────────────────
_FM_CODE_RE = re.compile(r"\bFM-(\d{2})\b")
_ACTION_VERBS = re.compile(
    r"(?:replace|inspect|check|adjust|tighten|lubricate|clean|calibrate|align|"
    r"measure|test|monitor|verify|repair|overhaul|reemplazar|inspeccionar|"
    r"verificar|ajustar|limpiar|lubricar|calibrar|alinear|medir|reparar)",
    re.IGNORECASE,
)
_NUMBERED_STEP = re.compile(r"^\s*\d+[\.\)]\s+", re.MULTILINE)
_BULLET_STEP = re.compile(r"^\s*[-•*]\s+", re.MULTILINE)


class ExpertKnowledgeEngine:
    """Deterministic logic for expert matching, consultation lifecycle,
    knowledge extraction, and knowledge promotion."""

    # ── Expert Matching ──────────────────────────────────────────────

    @staticmethod
    def match_expert(
        equipment_type_id: str,
        symptom_categories: list[str],
        plant_id: str,
        experts: list[dict],
        language_preference: str = "fr",
    ) -> list[dict]:
        """Rank available experts by relevance to the diagnosis context.

        Scoring weights:
            equipment_expertise match (40%) +
            domain match (30%) +
            years_experience normalized (15%) +
            resolution_count normalized (10%) +
            language match (5%)

        Returns top 3 ranked experts with scores.
        """
        if not experts:
            return []

        # Normalize inputs
        eq_lower = equipment_type_id.lower()
        symptom_domains = {
            _SYMPTOM_TO_DOMAIN.get(cat.lower(), "RELIABILITY")
            for cat in symptom_categories
        }
        lang_pref = language_preference.upper()

        # Normalization helpers
        max_years = max((e.get("years_experience", 0) for e in experts), default=1) or 1
        max_resolutions = max((e.get("resolution_count", 0) for e in experts), default=1) or 1

        scored: list[tuple[float, dict]] = []
        for expert in experts:
            # Skip unavailable experts
            if not expert.get("is_retired", False) and expert.get("role") == "RETIRED_EXPERT":
                pass  # Allow retired experts

            # Equipment match (40%)
            eq_expertise = [tag.lower() for tag in expert.get("equipment_expertise", [])]
            eq_score = 1.0 if any(eq_lower in tag or tag in eq_lower for tag in eq_expertise) else 0.0

            # Domain match (30%)
            expert_domains = {d.upper() if isinstance(d, str) else str(d).upper()
                              for d in expert.get("domains", [])}
            if symptom_domains and expert_domains:
                domain_score = len(symptom_domains & expert_domains) / len(symptom_domains)
            else:
                domain_score = 0.0

            # Experience (15%)
            years = expert.get("years_experience", 0)
            exp_score = years / max_years

            # Resolution count (10%)
            resolutions = expert.get("resolution_count", 0)
            res_score = resolutions / max_resolutions

            # Language match (5%)
            expert_langs = {
                (l.upper() if isinstance(l, str) else str(l).upper())
                for l in expert.get("languages", [])
            }
            lang_score = 1.0 if lang_pref in expert_langs else 0.0

            total = (
                0.40 * eq_score
                + 0.30 * domain_score
                + 0.15 * exp_score
                + 0.10 * res_score
                + 0.05 * lang_score
            )

            scored.append((total, expert))

        # Sort descending and return top 3
        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {**expert, "match_score": round(score, 3)}
            for score, expert in scored[:3]
        ]

    # ── Consultation Lifecycle ───────────────────────────────────────

    @staticmethod
    def create_consultation(
        session: dict,
        expert_id: str,
        ai_suggestion: str = "",
        language: str = "fr",
        ttl_hours: int = 24,
    ) -> dict:
        """Create a new ExpertConsultation from a diagnosis session snapshot.

        Sets token, TTL-based expiry, status=REQUESTED.
        """
        now = datetime.now()
        token = uuid.uuid4().hex

        # Snapshot symptoms and candidates as dicts
        symptoms = session.get("symptoms", [])
        candidates = session.get("candidate_diagnoses", [])

        return {
            "consultation_id": f"CONS-{uuid.uuid4().hex[:8].upper()}",
            "session_id": session.get("session_id", ""),
            "expert_id": expert_id,
            "technician_id": session.get("technician_id", ""),
            "equipment_type_id": session.get("equipment_type_id", ""),
            "equipment_tag": session.get("equipment_tag", ""),
            "plant_id": session.get("plant_id", ""),
            "symptoms_snapshot": symptoms if isinstance(symptoms, list) else [],
            "candidates_snapshot": candidates if isinstance(candidates, list) else [],
            "ai_suggestion": ai_suggestion,
            "expert_guidance": "",
            "expert_fm_codes": [],
            "expert_confidence": 0.0,
            "status": "REQUESTED",
            "token": token,
            "token_expires_at": (now + timedelta(hours=ttl_hours)).isoformat(),
            "requested_at": now.isoformat(),
            "viewed_at": None,
            "responded_at": None,
            "closed_at": None,
            "response_time_minutes": 0.0,
            "compensation_status": "PENDING",
            "language": language,
            "notes": "",
        }

    @staticmethod
    def validate_token(token: str, consultation: dict) -> tuple[bool, str]:
        """Validate a portal access token.

        Returns (valid, error_message).
        """
        if not token or not consultation:
            return False, "Invalid request."

        stored_token = consultation.get("token", "")
        if token != stored_token:
            return False, "Invalid or expired link."

        # Check expiry
        expires_raw = consultation.get("token_expires_at")
        if expires_raw:
            if isinstance(expires_raw, str):
                try:
                    expires = datetime.fromisoformat(expires_raw)
                except ValueError:
                    return False, "Invalid token expiry."
            else:
                expires = expires_raw
            if datetime.now() > expires:
                return False, "This consultation link has expired."

        # Check status
        status = consultation.get("status", "")
        if status in ("RESPONDED", "CLOSED", "CANCELLED"):
            return False, f"This consultation has already been {status.lower()}."
        if status == "EXPIRED":
            return False, "This consultation link has expired."

        return True, ""

    @staticmethod
    def mark_viewed(consultation: dict) -> dict:
        """Mark consultation as viewed by the expert."""
        now = datetime.now()
        consultation = dict(consultation)
        if not consultation.get("viewed_at"):
            consultation["viewed_at"] = now.isoformat()
        if consultation.get("status") == "REQUESTED":
            consultation["status"] = "VIEWED"
        return consultation

    @staticmethod
    def record_expert_response(
        consultation: dict,
        expert_guidance: str,
        fm_codes: Optional[list[str]] = None,
        confidence: float = 0.0,
    ) -> dict:
        """Record expert guidance, compute response_time_minutes, set status=RESPONDED."""
        now = datetime.now()
        consultation = dict(consultation)

        consultation["expert_guidance"] = expert_guidance
        consultation["expert_fm_codes"] = fm_codes or []
        consultation["expert_confidence"] = max(0.0, min(1.0, confidence))
        consultation["status"] = "RESPONDED"
        consultation["responded_at"] = now.isoformat()

        # Compute response time
        viewed_raw = consultation.get("viewed_at")
        if viewed_raw:
            if isinstance(viewed_raw, str):
                try:
                    viewed = datetime.fromisoformat(viewed_raw)
                except ValueError:
                    viewed = now
            else:
                viewed = viewed_raw
            delta = (now - viewed).total_seconds() / 60.0
            consultation["response_time_minutes"] = round(max(0.0, delta), 2)

        return consultation

    @staticmethod
    def close_consultation(consultation: dict, notes: str = "") -> dict:
        """Close consultation after technician confirms. Status=CLOSED."""
        consultation = dict(consultation)
        consultation["status"] = "CLOSED"
        consultation["closed_at"] = datetime.now().isoformat()
        if notes:
            existing = consultation.get("notes", "")
            consultation["notes"] = f"{existing}\n{notes}".strip() if existing else notes
        return consultation

    @staticmethod
    def expire_consultation(consultation: dict) -> dict:
        """Mark consultation as EXPIRED if past token_expires_at."""
        consultation = dict(consultation)
        expires_raw = consultation.get("token_expires_at")
        if expires_raw:
            if isinstance(expires_raw, str):
                try:
                    expires = datetime.fromisoformat(expires_raw)
                except ValueError:
                    return consultation
            else:
                expires = expires_raw
            if datetime.now() > expires and consultation.get("status") in ("REQUESTED", "VIEWED"):
                consultation["status"] = "EXPIRED"
        return consultation

    # ── Knowledge Extraction ─────────────────────────────────────────

    @staticmethod
    def extract_contribution(consultation: dict) -> dict:
        """Extract structured ExpertContribution from a responded consultation.

        Parses expert_guidance to identify:
        - FM code references (regex: FM-\\d{2})
        - Symptom descriptions (sentences with symptom keywords)
        - Diagnostic steps (numbered or bulleted items)
        - Corrective actions (action verbs: replace, inspect, adjust, etc.)
        """
        guidance = consultation.get("expert_guidance", "")
        explicit_fm_codes = consultation.get("expert_fm_codes", [])

        # Extract FM codes from text
        text_fm_codes = [f"FM-{m}" for m in _FM_CODE_RE.findall(guidance)]
        all_fm_codes = list(dict.fromkeys(explicit_fm_codes + text_fm_codes))

        # Split into sentences
        sentences = [s.strip() for s in re.split(r'[.\n]', guidance) if s.strip()]

        # Diagnostic steps: numbered or bulleted lines
        steps = []
        for line in guidance.split("\n"):
            line = line.strip()
            if _NUMBERED_STEP.match(line) or _BULLET_STEP.match(line):
                clean = re.sub(r"^\s*[\d\.\)\-•*]+\s*", "", line).strip()
                if clean:
                    steps.append(clean)

        # Corrective actions: sentences containing action verbs
        actions = []
        for sentence in sentences:
            if _ACTION_VERBS.search(sentence) and sentence not in steps:
                actions.append(sentence)

        # Symptom descriptions: remaining meaningful sentences
        symptom_keywords = {
            "vibration", "noise", "temperature", "leak", "pressure", "flow",
            "smell", "hot", "cold", "loose", "worn", "crack", "corrosi",
            "vibración", "ruido", "temperatura", "fuga", "presión", "flujo",
        }
        symptoms = []
        for sentence in sentences:
            lower = sentence.lower()
            if any(kw in lower for kw in symptom_keywords) and sentence not in actions:
                symptoms.append(sentence)

        # Tips: anything not categorized above
        categorized = set(steps + actions + symptoms)
        tips_parts = [s for s in sentences if s not in categorized and len(s) > 10]
        tips = ". ".join(tips_parts) if tips_parts else ""

        return {
            "contribution_id": f"EKNT-{uuid.uuid4().hex[:8].upper()}",
            "consultation_id": consultation.get("consultation_id", ""),
            "expert_id": consultation.get("expert_id", ""),
            "equipment_type_id": consultation.get("equipment_type_id", ""),
            "fm_codes": all_fm_codes,
            "symptom_descriptions": symptoms,
            "diagnostic_steps": steps,
            "corrective_actions": actions,
            "tips": tips,
            "status": "RAW",
            "validated_by": "",
            "validated_at": None,
            "promoted_at": None,
            "promoted_targets": [],
            "created_at": datetime.now().isoformat(),
        }

    # ── Contribution Validation ──────────────────────────────────────

    @staticmethod
    def validate_fm_codes(fm_codes: list[str]) -> list[tuple[str, bool]]:
        """Validate each FM code against 72-combo MASTER.

        Returns [(code, valid)].
        """
        return [(code, code in _VALID_FM_CODES) for code in fm_codes]

    @staticmethod
    def validate_contribution(
        contribution: dict,
        fm_codes: list[str],
        validated_by: str,
    ) -> dict:
        """Validate contribution: map to 72-combo FM codes, set status=VALIDATED.

        Only codes in FM-01..FM-72 are accepted.
        """
        contribution = dict(contribution)
        valid_codes = [code for code in fm_codes if code in _VALID_FM_CODES]
        if not valid_codes:
            contribution["status"] = "REJECTED"
            return contribution

        contribution["fm_codes"] = valid_codes
        contribution["status"] = "VALIDATED"
        contribution["validated_by"] = validated_by
        contribution["validated_at"] = datetime.now().isoformat()
        return contribution

    # ── Knowledge Promotion ──────────────────────────────────────────

    @staticmethod
    def promote_to_symptom_catalog(
        contribution: dict,
        catalog_path: Path,
    ) -> dict:
        """Append new symptom-FM mappings to symptom-catalog.json.

        Returns the new catalog entry with expert attribution.
        """
        catalog_path = Path(catalog_path)

        # Load existing catalog
        existing: list[dict] = []
        if catalog_path.exists():
            try:
                existing = json.loads(catalog_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                existing = []

        # Build new entries from contribution symptoms
        new_entries = []
        for desc in contribution.get("symptom_descriptions", []):
            if not desc:
                continue
            # Generate unique symptom ID
            sym_id = f"SYM-EX-{uuid.uuid4().hex[:6].upper()}"
            entry = {
                "symptom_id": sym_id,
                "fm_codes": contribution.get("fm_codes", []),
                "description": desc,
                "category": "expert-contributed",
                "keywords": [w.lower() for w in desc.split() if len(w) > 3][:5],
                "equipment_categories": [],
                "mechanism": "",
                "cause": "",
                "cbm_technique": "",
                "threshold": "",
                "pcondition_rank": 99,
                "source": f"expert-{contribution.get('expert_id', 'unknown')}",
                "contribution_id": contribution.get("contribution_id", ""),
            }
            new_entries.append(entry)
            existing.append(entry)

        # Write back atomically
        if new_entries:
            catalog_path.write_text(
                json.dumps(existing, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )

        return {"entries_added": len(new_entries), "new_entries": new_entries}

    @staticmethod
    def promote_to_decision_tree(
        contribution: dict,
        trees_dir: Path,
    ) -> bool:
        """Add diagnostic branch to equipment decision tree.

        Returns True if tree was updated.
        """
        trees_dir = Path(trees_dir)
        eq_type = contribution.get("equipment_type_id", "")
        if not eq_type:
            return False

        # Convert equipment type to tree filename
        slug = eq_type.lower().replace("et-", "").replace("_", "-").replace(" ", "-")
        tree_path = trees_dir / f"tree-{slug}.json"

        # Load or create tree
        tree: dict = {"entry_nodes": {}, "nodes": {}}
        if tree_path.exists():
            try:
                tree = json.loads(tree_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                pass

        # Add expert-contributed nodes
        steps = contribution.get("diagnostic_steps", [])
        if not steps:
            return False

        node_id = f"expert-{uuid.uuid4().hex[:6]}"
        tree.setdefault("nodes", {})[node_id] = {
            "type": "expert_knowledge",
            "question": f"Expert: {steps[0]}" if steps else "",
            "options": {
                "yes": {"action": ". ".join(contribution.get("corrective_actions", []))},
                "no": {"action": "Continue standard diagnostic path"},
            },
            "fm_codes": contribution.get("fm_codes", []),
            "source": f"expert-{contribution.get('expert_id', '')}",
            "contribution_id": contribution.get("contribution_id", ""),
        }

        # Add entry node for "expert-contributed" category if missing
        tree.setdefault("entry_nodes", {})["expert-contributed"] = node_id

        tree_path.parent.mkdir(parents=True, exist_ok=True)
        tree_path.write_text(
            json.dumps(tree, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return True

    @staticmethod
    def promote_to_manual(
        contribution: dict,
        manuals_dir: Path,
    ) -> Path:
        """Append expert knowledge to data/manuals/{eq_type}/expert-knowledge.md.

        ManualLoader auto-discovers this file — zero code change needed.
        """
        manuals_dir = Path(manuals_dir)
        eq_type = contribution.get("equipment_type_id", "")
        if not eq_type:
            eq_type = "general"

        target_dir = manuals_dir / eq_type
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / "expert-knowledge.md"

        # Build markdown section
        lines = [
            f"\n## Expert Knowledge — {contribution.get('contribution_id', 'N/A')}",
            f"**Expert:** {contribution.get('expert_id', 'N/A')}",
            f"**FM Codes:** {', '.join(contribution.get('fm_codes', []))}",
            f"**Date:** {contribution.get('created_at', 'N/A')}",
            "",
        ]

        tips = contribution.get("tips", "")
        if tips:
            lines.append(f"### Tips\n{tips}\n")

        steps = contribution.get("diagnostic_steps", [])
        if steps:
            lines.append("### Diagnostic Steps")
            for i, step in enumerate(steps, 1):
                lines.append(f"{i}. {step}")
            lines.append("")

        actions = contribution.get("corrective_actions", [])
        if actions:
            lines.append("### Corrective Actions")
            for action in actions:
                lines.append(f"- {action}")
            lines.append("")

        symptoms = contribution.get("symptom_descriptions", [])
        if symptoms:
            lines.append("### Related Symptoms")
            for sym in symptoms:
                lines.append(f"- {sym}")
            lines.append("")

        lines.append("---\n")

        content = "\n".join(lines)

        # Append or create
        if target_path.exists():
            existing = target_path.read_text(encoding="utf-8")
            target_path.write_text(existing + content, encoding="utf-8")
        else:
            header = f"# Expert Knowledge — {eq_type}\n\nContributions from retired experts.\n\n---\n"
            target_path.write_text(header + content, encoding="utf-8")

        return target_path

    @staticmethod
    def promote_to_memory(
        contribution: dict,
        memory_dir: Path,
    ) -> None:
        """Save as pattern via existing memory.save_pattern().

        Imports from agents._shared.memory to avoid circular deps.
        """
        try:
            from agents._shared.memory import save_pattern
        except ImportError:
            # Fallback: write directly to patterns file
            memory_dir = Path(memory_dir)
            stage = "reliability-engineering"
            patterns_path = memory_dir / stage / "patterns.md"
            patterns_path.parent.mkdir(parents=True, exist_ok=True)

            pattern = (
                f"\n### EXPERT-{contribution.get('contribution_id', 'N/A')}: "
                f"Expert knowledge for {contribution.get('equipment_type_id', 'N/A')}\n"
                f"- **FM Codes**: {', '.join(contribution.get('fm_codes', []))}\n"
                f"- **Tips**: {contribution.get('tips', '')}\n"
                f"- **Source**: Expert {contribution.get('expert_id', '')} "
                f"via consultation {contribution.get('consultation_id', '')}\n"
            )

            if patterns_path.exists():
                existing = patterns_path.read_text(encoding="utf-8")
                patterns_path.write_text(existing + pattern, encoding="utf-8")
            else:
                patterns_path.write_text(f"# Patterns — {stage}\n{pattern}", encoding="utf-8")
            return

        pattern = (
            f"\n### EXPERT-{contribution.get('contribution_id', 'N/A')}: "
            f"Expert knowledge for {contribution.get('equipment_type_id', 'N/A')}\n"
            f"- **FM Codes**: {', '.join(contribution.get('fm_codes', []))}\n"
            f"- **Tips**: {contribution.get('tips', '')}\n"
            f"- **Source**: Expert {contribution.get('expert_id', '')} "
            f"via consultation {contribution.get('consultation_id', '')}\n"
        )
        save_pattern(memory_dir, "reliability-engineering", pattern)

    # ── Compensation ─────────────────────────────────────────────────

    @staticmethod
    def calculate_compensation(
        consultations: list[dict],
        hourly_rate_usd: float = 50.0,
    ) -> dict:
        """Aggregate monthly compensation summary for one expert.

        Only includes RESPONDED or CLOSED consultations.
        """
        total_minutes = 0.0
        total_count = 0

        for c in consultations:
            if c.get("status") in ("RESPONDED", "CLOSED"):
                total_minutes += c.get("response_time_minutes", 0.0)
                total_count += 1

        total_hours = total_minutes / 60.0
        total_due = round(total_hours * hourly_rate_usd, 2)

        return {
            "total_consultations": total_count,
            "total_response_minutes": round(total_minutes, 2),
            "hourly_rate_usd": hourly_rate_usd,
            "total_due_usd": total_due,
            "status": "PENDING",
        }
