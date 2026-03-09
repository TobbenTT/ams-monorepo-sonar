"""
Equipment Resolution Engine — M1 Field Capture (GAP-5)
Resolves equipment TAG from voice/text/image input.
Uses fuzzy matching, alias lookup, and hierarchy search.
"""

import re
from difflib import SequenceMatcher
from dataclasses import dataclass


@dataclass
class ResolutionResult:
    """Result of equipment resolution attempt."""
    equipment_id: str
    equipment_tag: str
    confidence: float
    method: str  # EXACT_MATCH, FUZZY_MATCH, ALIAS_MATCH, HIERARCHY_SEARCH
    alternatives: list[dict]  # Other possible matches
    extra: dict  # Additional data (criticality, description, etc.)


class EquipmentResolver:
    """Resolves equipment identification from field input."""

    def __init__(self, equipment_registry: list[dict]):
        """
        Args:
            equipment_registry: List of dicts with keys:
                equipment_id, tag, description, description_fr, aliases
                Optional: criticality (AA, A+, A, B, C, D)
        """
        self.registry = equipment_registry
        self._tag_index = {eq["tag"].upper(): eq for eq in equipment_registry}
        self._id_index = {eq["equipment_id"]: eq for eq in equipment_registry}
        self._alias_index: dict[str, dict] = {}
        for eq in equipment_registry:
            for alias in eq.get("aliases", []):
                self._alias_index[alias.upper()] = eq
            # Also index description words as aliases for keyword matching
            desc = eq.get("description", "")
            if desc and len(desc) > 3:
                self._alias_index[desc.upper()] = eq

    def _make_result(self, eq: dict, confidence: float, method: str, alternatives: list | None = None) -> ResolutionResult:
        return ResolutionResult(
            equipment_id=eq["equipment_id"],
            equipment_tag=eq["tag"],
            confidence=confidence,
            method=method,
            alternatives=alternatives or [],
            extra={
                "criticality": eq.get("criticality", "B"),
                "description": eq.get("description", ""),
            },
        )

    def resolve(self, input_text: str) -> ResolutionResult | None:
        """
        Resolve equipment from free-text input.
        Tries: exact TAG → TAG patterns in text → alias → fuzzy TAG → fuzzy description.
        """
        cleaned = input_text.strip().upper()

        # 1. Exact TAG match (entire input is a TAG)
        if cleaned in self._tag_index:
            return self._make_result(self._tag_index[cleaned], 1.0, "EXACT_MATCH")

        # 2. Extract TAG patterns from text — supports multiple formats:
        #    BRY-SAG-ML-001, JFC1-SAG-PP-001, P-4501A, PMP-SLP-001, etc.
        tag_patterns = [
            re.compile(r"[A-Z]{2,5}\d?-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}"),  # JFC1-SAG-PP-001
            re.compile(r"[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}"),     # BRY-SAG-ML-001
            re.compile(r"[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}"),                 # PMP-SLP-001
            re.compile(r"[A-Z]-\d{3,5}[A-Z]?"),                           # P-4501A
        ]
        for pattern in tag_patterns:
            tags_found = pattern.findall(cleaned)
            for tag in tags_found:
                # Exact match in registry
                if tag in self._tag_index:
                    return self._make_result(self._tag_index[tag], 0.95, "EXACT_MATCH")
                # Fuzzy match against all tags for extracted pattern
                best = None
                for reg_tag, eq in self._tag_index.items():
                    score = SequenceMatcher(None, tag, reg_tag).ratio()
                    if best is None or score > best[0]:
                        best = (score, eq)
                if best and best[0] >= 0.6:
                    return self._make_result(best[1], best[0] * 0.9, "FUZZY_MATCH")

        # 3. Alias match
        if cleaned in self._alias_index:
            return self._make_result(self._alias_index[cleaned], 0.90, "ALIAS_MATCH")

        # 4. Check if any alias/description keyword appears in the text
        for alias, eq in self._alias_index.items():
            if len(alias) > 4 and alias in cleaned:
                alternatives = self._get_alternatives(cleaned, exclude=eq["tag"])
                return self._make_result(eq, 0.75, "ALIAS_MATCH", alternatives)

        # 5. Fuzzy TAG match
        best_tag_match = self._fuzzy_match_tags(cleaned)
        if best_tag_match and best_tag_match["score"] >= 0.7:
            eq = best_tag_match["equipment"]
            alternatives = self._get_alternatives(cleaned, exclude=eq["tag"])
            return self._make_result(eq, best_tag_match["score"], "FUZZY_MATCH", alternatives)

        # 6. Fuzzy description match
        best_desc_match = self._fuzzy_match_descriptions(input_text)
        if best_desc_match and best_desc_match["score"] >= 0.5:
            eq = best_desc_match["equipment"]
            alternatives = self._get_alternatives(input_text, exclude=eq["tag"])
            return self._make_result(eq, best_desc_match["score"] * 0.8, "HIERARCHY_SEARCH", alternatives)

        return None

    def _fuzzy_match_tags(self, text: str) -> dict | None:
        best = None
        for tag, eq in self._tag_index.items():
            score = SequenceMatcher(None, text, tag).ratio()
            if best is None or score > best["score"]:
                best = {"equipment": eq, "score": score}
        return best

    def _fuzzy_match_descriptions(self, text: str) -> dict | None:
        text_lower = text.lower()
        best = None
        for eq in self.registry:
            for field in ["description", "description_fr"]:
                desc = eq.get(field, "").lower()
                score = SequenceMatcher(None, text_lower, desc).ratio()
                if best is None or score > best["score"]:
                    best = {"equipment": eq, "score": score}
        return best

    def _get_alternatives(self, text: str, exclude: str, max_count: int = 3) -> list[dict]:
        results = []
        for eq in self.registry:
            if eq["tag"] == exclude:
                continue
            desc_score = SequenceMatcher(None, text.lower(), eq.get("description", "").lower()).ratio()
            tag_score = SequenceMatcher(None, text.upper(), eq["tag"]).ratio()
            score = max(desc_score, tag_score)
            if score > 0.3:
                results.append({
                    "equipment_id": eq["equipment_id"],
                    "tag": eq["tag"],
                    "confidence": round(score, 2),
                })
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results[:max_count]
