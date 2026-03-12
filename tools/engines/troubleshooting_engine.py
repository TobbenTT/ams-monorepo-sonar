"""
Troubleshooting Engine — deterministic symptom-based diagnostic logic.

Uses equipment_library.json + symptom-catalog.json + decision trees
to match symptoms to failure modes and build diagnostic paths.

No LLM calls — the AI agent (Reliability) provides the intelligence
layer on top of this deterministic engine.
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from tools.models.schemas import (
    DIAGNOSTIC_TEST_COSTS,
    DiagnosisSession,
    DiagnosisStatus,
    DiagnosticPath,
    DiagnosticTest,
    DiagnosticTestType,
    SymptomEntry,
    VALID_FM_COMBINATIONS,
)

# ── Paths ────────────────────────────────────────────────────────────

_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = _ROOT / "data" / "libraries"
KB_DIR = _ROOT / "skills" / "00-knowledge-base" / "data-models" / "troubleshooting"
EQUIPMENT_LIBRARY_PATH = DATA_DIR / "equipment_library.json"
SYMPTOM_CATALOG_PATH = KB_DIR / "symptom-catalog.json"
TREES_DIR = KB_DIR / "trees"

# ── Stop words for keyword extraction ────────────────────────────────

_STOP_WORDS = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "of", "in", "to", "for",
    "with", "on", "at", "from", "by", "about", "as", "into", "through",
    "during", "before", "after", "above", "below", "between", "and", "but",
    "or", "not", "no", "nor", "so", "if", "then", "than", "too", "very",
    "it", "its", "this", "that", "these", "those", "per", "via",
})

# ── Symptom category keywords ───────────────────────────────────────

CATEGORY_KEYWORDS: dict[str, set[str]] = {
    "vibration": {"vibration", "vibrating", "shaking", "oscillation", "resonance", "imbalance", "unbalance", "looseness"},
    "noise": {"noise", "noisy", "sound", "knocking", "scraping", "grinding", "banging", "crackling", "squealing", "rumbling"},
    "temperature": {"temperature", "hot", "overheating", "thermal", "heat", "warm", "cold", "cooling", "temp"},
    "leak": {"leak", "leaking", "leakage", "dripping", "seeping", "oil", "water", "fluid"},
    "pressure": {"pressure", "dp", "differential", "suction", "discharge", "low_pressure", "high_pressure"},
    "flow": {"flow", "throughput", "blocked", "blockage", "restricted", "reduced", "output"},
    "electrical": {"electrical", "insulation", "resistance", "current", "voltage", "phase", "tripping", "overcurrent", "ir"},
    "visual": {"crack", "corrosion", "wear", "deformation", "discoloration", "rust", "erosion", "pitting", "spalling"},
    "smell": {"smell", "odor", "burning", "smoke", "fumes", "acrid"},
    "performance": {"performance", "efficiency", "capacity", "degraded", "reduced", "declining", "slow"},
    "alignment": {"alignment", "misalignment", "offset", "angularity", "runout", "deflection"},
    "contamination": {"contamination", "contaminated", "dirty", "particles", "debris", "dust", "fouling", "deposits"},
}

# ── Caches ───────────────────────────────────────────────────────────

_equipment_library_cache: dict | None = None
_symptom_catalog_cache: dict | None = None


class TroubleshootingEngine:
    """Deterministic troubleshooting engine — static methods, no LLM."""

    # ── Session management ───────────────────────────────────────────

    @staticmethod
    def create_session(
        equipment_type_id: str,
        equipment_tag: str = "",
        plant_id: str = "",
        technician_id: str = "",
    ) -> DiagnosisSession:
        """Create a new diagnosis session."""
        return DiagnosisSession(
            equipment_type_id=equipment_type_id,
            equipment_tag=equipment_tag,
            plant_id=plant_id,
            technician_id=technician_id,
        )

    @staticmethod
    def add_symptom(
        session: DiagnosisSession,
        description: str,
        category: str = "",
        severity: str = "MEDIUM",
    ) -> DiagnosisSession:
        """Add a symptom and re-rank candidate diagnoses."""
        normalized, detected_category = TroubleshootingEngine._normalize_symptom(description)
        if not category:
            category = detected_category

        symptom = SymptomEntry(
            description=description,
            description_normalized=normalized,
            category=category,
            severity=severity,
            observed_at=datetime.now(),
        )
        session.symptoms.append(symptom)

        # Re-rank candidates
        session.candidate_diagnoses = TroubleshootingEngine.match_symptoms(
            session.equipment_type_id, session.symptoms
        )
        return session

    # ── Core algorithm ───────────────────────────────────────────────

    @staticmethod
    def match_symptoms(
        equipment_type_id: str,
        symptoms: list[SymptomEntry],
    ) -> list[DiagnosticPath]:
        """Match symptoms against equipment failure modes and FM MASTER P-conditions.

        Algorithm:
        1. Load equipment library failure modes for this equipment type.
        2. Load symptom catalog (P-conditions from MASTER).
        3. For each symptom, find matching P-conditions via keyword overlap.
        4. Score each FM by: max match across its P-conditions.
        5. Rank by confidence descending, return top candidates.
        """
        if not symptoms:
            return []

        equipment_fms = TroubleshootingEngine._get_equipment_failure_modes(equipment_type_id)
        if not equipment_fms:
            return []

        catalog = TroubleshootingEngine._load_symptom_catalog()
        catalog_symptoms = catalog.get("symptoms", []) if catalog else []

        # Build keyword sets for each submitted symptom
        symptom_keyword_sets = []
        for s in symptoms:
            text = s.description_normalized or s.description
            keywords = TroubleshootingEngine._extract_keywords(text)
            if s.category:
                keywords.update(CATEGORY_KEYWORDS.get(s.category, set()))
            symptom_keyword_sets.append(keywords)

        # Score each equipment FM
        candidates: list[DiagnosticPath] = []

        for fm_info in equipment_fms:
            mechanism = fm_info.get("mechanism", "")
            cause = fm_info.get("cause", "")
            fm_code = fm_info.get("fm_code", "")

            # Find matching catalog symptoms for this FM
            fm_catalog_entries = [
                cs for cs in catalog_symptoms
                if fm_code in cs.get("fm_codes", [])
            ]

            # Also use keywords from the equipment FM's "what" description
            fm_keywords_from_lib = TroubleshootingEngine._extract_keywords(
                fm_info.get("what", "") + " " + fm_info.get("typical_task", "")
            )

            best_score = 0.0
            matched = []

            for symptom_kw in symptom_keyword_sets:
                # Match against catalog P-conditions
                for cs_entry in fm_catalog_entries:
                    cs_keywords = set(cs_entry.get("keywords", []))
                    score = TroubleshootingEngine._keyword_match_score(symptom_kw, cs_keywords)
                    if score > best_score:
                        best_score = score

                # Also match against equipment library description
                lib_score = TroubleshootingEngine._keyword_match_score(symptom_kw, fm_keywords_from_lib)
                if lib_score > best_score:
                    best_score = lib_score

                if best_score > 0:
                    matched.append(fm_info.get("what", ""))

            if best_score > 0:
                # Build recommended test from catalog
                rec_tests = []
                if fm_catalog_entries:
                    primary_cbm = fm_catalog_entries[0].get("primary_cbm", "")
                    threshold = fm_catalog_entries[0].get("threshold", "")
                    test_type = TroubleshootingEngine._infer_test_type(primary_cbm)
                    rec_tests.append(DiagnosticTest(
                        test_type=test_type,
                        description=primary_cbm,
                        threshold=threshold,
                        estimated_cost_usd=DIAGNOSTIC_TEST_COSTS.get(test_type, 0),
                    ))

                candidates.append(DiagnosticPath(
                    fm_code=fm_code,
                    mechanism=mechanism,
                    cause=cause,
                    confidence=min(best_score, 1.0),
                    matched_symptoms=list(set(matched)),
                    recommended_tests=rec_tests,
                    corrective_action=fm_info.get("typical_task", ""),
                    strategy_type=fm_info.get("strategy_type", ""),
                    equipment_context=fm_info.get("maintainable_item", ""),
                ))

        # Sort by confidence descending, return top 5
        candidates.sort(key=lambda c: c.confidence, reverse=True)
        return candidates[:5]

    @staticmethod
    def get_recommended_tests(
        candidate_diagnoses: list[DiagnosticPath],
        tests_already_performed: list[str] | None = None,
    ) -> list[DiagnosticTest]:
        """Get next diagnostic tests ordered by minimum cost first."""
        if tests_already_performed is None:
            tests_already_performed = []

        performed_ids = set(tests_already_performed)
        all_tests: list[DiagnosticTest] = []
        seen_descriptions: set[str] = set()

        for candidate in candidate_diagnoses:
            for test in candidate.recommended_tests:
                if test.test_id not in performed_ids and test.description not in seen_descriptions:
                    all_tests.append(test)
                    seen_descriptions.add(test.description)

        # Sort by cost ascending (minimum-cost-first)
        all_tests.sort(key=lambda t: DIAGNOSTIC_TEST_COSTS.get(t.test_type, 0))
        return all_tests[:3]

    @staticmethod
    def record_test_result(
        session: DiagnosisSession,
        test_id: str,
        result: str,
        measured_value: str = "",
    ) -> DiagnosisSession:
        """Record test result and update candidate rankings.

        PASS → confidence -= 0.20 for candidates expecting abnormal
        FAIL → confidence += 0.15 for candidates expecting abnormal
        """
        session.tests_performed.append({
            "test_id": test_id,
            "result": result,
            "measured_value": measured_value,
            "recorded_at": datetime.now().isoformat(),
        })

        result_upper = result.upper()
        for candidate in session.candidate_diagnoses:
            if result_upper == "FAIL" or result_upper == "ABNORMAL":
                candidate.confidence = min(candidate.confidence + 0.15, 1.0)
            elif result_upper == "PASS" or result_upper == "NORMAL":
                candidate.confidence = max(candidate.confidence - 0.20, 0.0)

        # Re-sort by confidence
        session.candidate_diagnoses.sort(key=lambda c: c.confidence, reverse=True)
        return session

    @staticmethod
    def finalize_diagnosis(
        session: DiagnosisSession,
        selected_fm_code: str,
    ) -> DiagnosisSession:
        """Mark a candidate as the final diagnosis."""
        for candidate in session.candidate_diagnoses:
            if candidate.fm_code == selected_fm_code:
                session.final_diagnosis = candidate
                break
        else:
            # No matching candidate — create stub with FM code
            session.final_diagnosis = DiagnosticPath(
                fm_code=selected_fm_code,
                confidence=1.0,
            )

        session.status = DiagnosisStatus.COMPLETED
        session.completed_at = datetime.now()
        return session

    @staticmethod
    def record_feedback(
        session: DiagnosisSession,
        actual_cause: str,
        notes: str = "",
        expert_consultation_id: str | None = None,
    ) -> DiagnosisSession:
        """Record actual cause after repair — for feedback loop.

        expert_consultation_id: links the feedback to a GAP-W13 consultation.
        """
        session.actual_cause_feedback = actual_cause
        if notes:
            session.notes = (session.notes + "\n" + notes).strip()
        if expert_consultation_id:
            session.notes = (
                session.notes + f"\n[Expert consultation: {expert_consultation_id}]"
            ).strip()
        return session

    @staticmethod
    def apply_expert_knowledge(
        session: DiagnosisSession,
        expert_fm_codes: list[str],
        expert_confidence: float = 0.0,
        expert_guidance: str = "",
    ) -> DiagnosisSession:
        """Re-rank candidates using expert input (GAP-W13 integration).

        - If an expert FM code matches an existing candidate → boost its confidence.
        - If an expert FM code is new → add it as a DiagnosticPath with expert confidence.
        - Appends expert guidance to session notes.
        - Sets status=ESCALATED if not already COMPLETED.
        """
        # Index existing candidates by fm_code
        existing_codes = {c.fm_code: c for c in session.candidate_diagnoses}

        for fm_code in expert_fm_codes:
            if fm_code in existing_codes:
                # Boost existing candidate — average with expert confidence
                cand = existing_codes[fm_code]
                boosted = min(1.0, (cand.confidence + expert_confidence) / 2.0 + 0.15)
                cand.confidence = round(boosted, 3)
            else:
                # Add new candidate from expert
                from tools.models.schemas import DiagnosticPath
                session.candidate_diagnoses.append(
                    DiagnosticPath(
                        fm_code=fm_code,
                        mechanism="",
                        cause="",
                        confidence=expert_confidence,
                        description=f"Expert-suggested: {expert_guidance[:120]}" if expert_guidance else "Expert-suggested",
                        source="expert",
                        test_evidence=[],
                    )
                )

        # Re-sort by confidence descending
        session.candidate_diagnoses.sort(key=lambda x: x.confidence, reverse=True)

        # Append expert guidance note
        if expert_guidance:
            session.notes = (
                session.notes + f"\n[Expert guidance]: {expert_guidance}"
            ).strip()

        # Mark as escalated if still in progress
        if session.status == DiagnosisStatus.IN_PROGRESS:
            session.status = DiagnosisStatus.ESCALATED

        return session

    # ── Decision tree ────────────────────────────────────────────────

    @staticmethod
    def get_decision_tree(
        equipment_type_id: str,
        symptom_category: str = "",
    ) -> dict | None:
        """Load the decision tree for an equipment type."""
        tree = TroubleshootingEngine._load_decision_tree(equipment_type_id)
        if not tree:
            return None

        if symptom_category:
            entry_node_id = tree.get("entry_nodes", {}).get(symptom_category)
            if entry_node_id:
                return {
                    "equipment_type_id": equipment_type_id,
                    "entry_node_id": entry_node_id,
                    "category": symptom_category,
                    "nodes": tree.get("nodes", {}),
                }
            return None
        return tree

    @staticmethod
    def get_corrective_actions(
        fm_code: str,
        equipment_type_id: str,
    ) -> dict:
        """Get corrective actions for a diagnosed failure mode."""
        catalog = TroubleshootingEngine._load_symptom_catalog()
        if not catalog:
            return {"fm_code": fm_code, "actions": []}

        # Find FM in catalog
        for symptom in catalog.get("symptoms", []):
            if fm_code in symptom.get("fm_codes", []):
                return {
                    "fm_code": fm_code,
                    "primary_cbm": symptom.get("primary_cbm", ""),
                    "threshold": symptom.get("threshold", ""),
                    "description": symptom.get("description", ""),
                }

        return {"fm_code": fm_code, "actions": []}

    @staticmethod
    def get_equipment_symptoms(
        equipment_type_id: str,
    ) -> list[dict]:
        """Get all known symptoms for an equipment type."""
        equipment_fms = TroubleshootingEngine._get_equipment_failure_modes(equipment_type_id)
        if not equipment_fms:
            return []

        catalog = TroubleshootingEngine._load_symptom_catalog()
        if not catalog:
            return []

        fm_codes = {fm.get("fm_code", "") for fm in equipment_fms}
        result = []
        for symptom in catalog.get("symptoms", []):
            if any(fc in fm_codes for fc in symptom.get("fm_codes", [])):
                result.append({
                    "symptom_id": symptom.get("symptom_id", ""),
                    "description": symptom.get("description", ""),
                    "description_fr": symptom.get("description_fr", ""),
                    "category": symptom.get("category", ""),
                    "fm_codes": symptom.get("fm_codes", []),
                })

        return result

    @staticmethod
    def get_available_equipment_types() -> list[dict]:
        """List all equipment types that have troubleshooting support."""
        lib = TroubleshootingEngine._load_equipment_library()
        if not lib:
            return []

        result = []
        for et in lib.get("equipment_types", []):
            et_id = et.get("equipment_type_id", "")
            tree = TroubleshootingEngine._load_decision_tree(et_id)
            result.append({
                "equipment_type_id": et_id,
                "name": et.get("name", ""),
                "name_fr": et.get("name_fr", ""),
                "criticality_class": et.get("criticality_class", ""),
                "has_decision_tree": tree is not None,
            })
        return result

    # ── Private helpers ──────────────────────────────────────────────

    @staticmethod
    def _load_equipment_library() -> dict:
        """Load and cache equipment library JSON."""
        global _equipment_library_cache
        if _equipment_library_cache is not None:
            return _equipment_library_cache

        if not EQUIPMENT_LIBRARY_PATH.exists():
            return {}

        with open(EQUIPMENT_LIBRARY_PATH, "r", encoding="utf-8") as f:
            _equipment_library_cache = json.load(f)
        return _equipment_library_cache

    @staticmethod
    def _load_symptom_catalog() -> dict | None:
        """Load and cache symptom catalog JSON."""
        global _symptom_catalog_cache
        if _symptom_catalog_cache is not None:
            return _symptom_catalog_cache

        if not SYMPTOM_CATALOG_PATH.exists():
            return None

        with open(SYMPTOM_CATALOG_PATH, "r", encoding="utf-8") as f:
            _symptom_catalog_cache = json.load(f)
        return _symptom_catalog_cache

    @staticmethod
    def _load_decision_tree(equipment_type_id: str) -> dict | None:
        """Load decision tree JSON for equipment type."""
        # Map equipment type ID to filename
        slug = equipment_type_id.lower().replace("et-", "").replace("_", "-")
        tree_path = TREES_DIR / f"tree-{slug}.json"

        if not tree_path.exists():
            return None

        with open(tree_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def _get_equipment_failure_modes(equipment_type_id: str) -> list[dict]:
        """Get all failure modes for an equipment type from equipment library.

        Returns flat list of dicts with fm_code, mechanism, cause, what, etc.
        """
        lib = TroubleshootingEngine._load_equipment_library()
        if not lib:
            return []

        for et in lib.get("equipment_types", []):
            if et.get("equipment_type_id") == equipment_type_id:
                result = []
                for sa in et.get("sub_assemblies", []):
                    for mi in sa.get("maintainable_items", []):
                        for fm in mi.get("failure_modes", []):
                            mechanism = fm.get("mechanism", "")
                            cause = fm.get("cause", "")
                            # Derive FM code from VALID_FM_COMBINATIONS ordering
                            fm_code = TroubleshootingEngine._derive_fm_code(mechanism, cause)
                            result.append({
                                "fm_code": fm_code,
                                "mechanism": mechanism,
                                "cause": cause,
                                "what": fm.get("what", ""),
                                "typical_task": fm.get("typical_task", ""),
                                "strategy_type": fm.get("strategy_type", ""),
                                "failure_pattern": fm.get("failure_pattern", ""),
                                "failure_consequence": fm.get("failure_consequence", ""),
                                "task_type": fm.get("task_type", ""),
                                "maintainable_item": mi.get("name", ""),
                                "sub_assembly": sa.get("name", ""),
                            })
                return result
        return []

    @staticmethod
    def _derive_fm_code(mechanism: str, cause: str) -> str:
        """Map mechanism+cause to FM-## code based on MASTER ordering."""
        _FM_CODE_MAP = {
            ("ARCS", "BREAKDOWN_IN_INSULATION"): "FM-01",
            ("BLOCKS", "CONTAMINATION"): "FM-02",
            ("BLOCKS", "EXCESSIVE_PARTICLE_SIZE"): "FM-03",
            ("BLOCKS", "INSUFFICIENT_FLUID_VELOCITY"): "FM-04",
            ("BREAKS_FRACTURE_SEPARATES", "CYCLIC_LOADING"): "FM-05",
            ("BREAKS_FRACTURE_SEPARATES", "MECHANICAL_OVERLOAD"): "FM-06",
            ("BREAKS_FRACTURE_SEPARATES", "THERMAL_OVERLOAD"): "FM-07",
            ("CORRODES", "BIO_ORGANISMS"): "FM-08",
            ("CORRODES", "CHEMICAL_ATTACK"): "FM-09",
            ("CORRODES", "CORROSIVE_ENVIRONMENT"): "FM-10",
            ("CORRODES", "CREVICE"): "FM-11",
            ("CORRODES", "DISSIMILAR_METALS_CONTACT"): "FM-12",
            ("CORRODES", "EXPOSURE_TO_ATMOSPHERE"): "FM-13",
            ("CORRODES", "HIGH_TEMP_CORROSIVE_ENVIRONMENT"): "FM-14",
            ("CORRODES", "HIGH_TEMP_ENVIRONMENT"): "FM-15",
            ("CORRODES", "LIQUID_METAL"): "FM-16",
            ("CORRODES", "POOR_ELECTRICAL_CONNECTIONS"): "FM-17",
            ("CORRODES", "POOR_ELECTRICAL_INSULATION"): "FM-18",
            ("CRACKS", "AGE"): "FM-19",
            ("CRACKS", "CYCLIC_LOADING"): "FM-20",
            ("CRACKS", "EXCESSIVE_TEMPERATURE"): "FM-21",
            ("CRACKS", "HIGH_TEMP_CORROSIVE_ENVIRONMENT"): "FM-22",
            ("CRACKS", "IMPACT_SHOCK_LOADING"): "FM-23",
            ("CRACKS", "THERMAL_STRESSES"): "FM-24",
            ("DEGRADES", "AGE"): "FM-25",
            ("DEGRADES", "CHEMICAL_ATTACK"): "FM-26",
            ("DEGRADES", "CHEMICAL_REACTION"): "FM-27",
            ("DEGRADES", "CONTAMINATION"): "FM-28",
            ("DEGRADES", "ELECTRICAL_ARCING"): "FM-29",
            ("DEGRADES", "ENTRAINED_AIR"): "FM-30",
            ("DEGRADES", "EXCESSIVE_TEMPERATURE"): "FM-31",
            ("DEGRADES", "RADIATION"): "FM-32",
            ("DISTORTS", "IMPACT_SHOCK_LOADING"): "FM-33",
            ("DISTORTS", "MECHANICAL_OVERLOAD"): "FM-34",
            ("DISTORTS", "OFF_CENTER_LOADING"): "FM-35",
            ("DISTORTS", "USE"): "FM-36",
            ("DRIFTS", "EXCESSIVE_TEMPERATURE"): "FM-37",
            ("DRIFTS", "IMPACT_SHOCK_LOADING"): "FM-38",
            ("DRIFTS", "STRAY_CURRENT"): "FM-39",
            ("DRIFTS", "UNEVEN_LOADING"): "FM-40",
            ("DRIFTS", "USE"): "FM-41",
            ("EXPIRES", "AGE"): "FM-42",
            ("IMMOBILISED", "CONTAMINATION"): "FM-43",
            ("IMMOBILISED", "LACK_OF_LUBRICATION"): "FM-44",
            ("LOOSES_PRELOAD", "CREEP"): "FM-45",
            ("LOOSES_PRELOAD", "EXCESSIVE_TEMPERATURE"): "FM-46",
            ("LOOSES_PRELOAD", "VIBRATION"): "FM-47",
            ("OPEN_CIRCUIT", "ELECTRICAL_OVERLOAD"): "FM-48",
            ("OVERHEATS_MELTS", "CONTAMINATION"): "FM-49",
            ("OVERHEATS_MELTS", "ELECTRICAL_OVERLOAD"): "FM-50",
            ("OVERHEATS_MELTS", "LACK_OF_LUBRICATION"): "FM-51",
            ("OVERHEATS_MELTS", "MECHANICAL_OVERLOAD"): "FM-52",
            ("OVERHEATS_MELTS", "RELATIVE_MOVEMENT"): "FM-53",
            ("OVERHEATS_MELTS", "RUBBING"): "FM-54",
            ("SEVERS", "ABRASION"): "FM-55",
            ("SEVERS", "IMPACT_SHOCK_LOADING"): "FM-56",
            ("SEVERS", "MECHANICAL_OVERLOAD"): "FM-57",
            ("SHORT_CIRCUITS", "BREAKDOWN_IN_INSULATION"): "FM-58",
            ("SHORT_CIRCUITS", "CONTAMINATION"): "FM-59",
            ("THERMALLY_OVERLOADS", "MECHANICAL_OVERLOAD"): "FM-60",
            ("THERMALLY_OVERLOADS", "OVERCURRENT"): "FM-61",
            ("WASHES_OFF", "EXCESSIVE_FLUID_VELOCITY"): "FM-62",
            ("WASHES_OFF", "USE"): "FM-63",
            ("WEARS", "BREAKDOWN_OF_LUBRICATION"): "FM-64",
            ("WEARS", "ENTRAINED_AIR"): "FM-65",
            ("WEARS", "EXCESSIVE_FLUID_VELOCITY"): "FM-66",
            ("WEARS", "IMPACT_SHOCK_LOADING"): "FM-67",
            ("WEARS", "LOW_PRESSURE"): "FM-68",
            ("WEARS", "LUBRICANT_CONTAMINATION"): "FM-69",
            ("WEARS", "MECHANICAL_OVERLOAD"): "FM-70",
            ("WEARS", "METAL_TO_METAL_CONTACT"): "FM-71",
            ("WEARS", "RELATIVE_MOVEMENT"): "FM-72",
        }
        return _FM_CODE_MAP.get((mechanism, cause), f"FM-??-{mechanism}-{cause}")

    @staticmethod
    def _normalize_symptom(description: str) -> tuple[str, str]:
        """Normalize free-text symptom to (normalized_text, category)."""
        normalized = description.lower().strip()
        # Remove punctuation except hyphens
        normalized = re.sub(r"[^\w\s-]", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()

        # Detect category from keywords
        best_category = ""
        best_count = 0
        words = set(normalized.split())

        for category, cat_keywords in CATEGORY_KEYWORDS.items():
            overlap = len(words & cat_keywords)
            if overlap > best_count:
                best_count = overlap
                best_category = category

        return normalized, best_category

    @staticmethod
    def _extract_keywords(text: str) -> set[str]:
        """Extract meaningful keywords from text."""
        words = re.sub(r"[^\w\s-]", " ", text.lower()).split()
        return {w for w in words if w not in _STOP_WORDS and len(w) > 2}

    @staticmethod
    def _keyword_match_score(
        symptom_keywords: set[str],
        reference_keywords: set[str],
    ) -> float:
        """Jaccard similarity between symptom and reference keywords."""
        if not symptom_keywords or not reference_keywords:
            return 0.0
        intersection = symptom_keywords & reference_keywords
        union = symptom_keywords | reference_keywords
        return len(intersection) / len(union) if union else 0.0

    @staticmethod
    def _infer_test_type(cbm_description: str) -> DiagnosticTestType:
        """Infer diagnostic test type from CBM technique description."""
        desc = cbm_description.lower()
        if any(k in desc for k in ("visual", "inspect", "look", "check")):
            return DiagnosticTestType.SENSORY
        if any(k in desc for k in ("vibration", "spectrum", "orbit")):
            return DiagnosticTestType.VIBRATION_ANALYSIS
        if any(k in desc for k in ("oil", "lubricant", "particle count", "ferrography")):
            return DiagnosticTestType.OIL_ANALYSIS
        if any(k in desc for k in ("thermal", "thermograph", "ir scan", "temperature")):
            return DiagnosticTestType.THERMOGRAPHY
        if any(k in desc for k in ("ultrasonic", "ut ", "thickness")):
            return DiagnosticTestType.ULTRASONIC
        if any(k in desc for k in ("mpi", "dpi", "radiograph", "ndt")):
            return DiagnosticTestType.NDT_INSPECTION
        if any(k in desc for k in ("insulation resistance", "megger", "hipot", "alignment", "laser")):
            return DiagnosticTestType.SPECIALIST_ANALYSIS
        if any(k in desc for k in ("pressure", "flow", "current", "voltage", "gauge", "dcs")):
            return DiagnosticTestType.PROCESS_CHECK
        if any(k in desc for k in ("multimeter", "clamp", "torque", "caliper")):
            return DiagnosticTestType.PORTABLE_INSTRUMENT
        return DiagnosticTestType.SENSORY


def clear_caches() -> None:
    """Clear module-level caches. Useful for testing."""
    global _equipment_library_cache, _symptom_catalog_cache
    _equipment_library_cache = None
    _symptom_catalog_cache = None
