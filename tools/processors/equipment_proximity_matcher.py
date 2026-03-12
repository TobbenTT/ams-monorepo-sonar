"""GPS-based equipment proximity matching — G-08 D-5.

Uses the haversine formula to compute great-circle distance between
the technician's GPS position and equipment nodes stored in the DB.

Confidence tiers (auto-fill vs. ranked suggestions):
  - HIGH   (<= HIGH_CONFIDENCE_RADIUS_M = 20 m)
  - MEDIUM (<= MEDIUM_CONFIDENCE_RADIUS_M = 100 m)

Factory function `get_proximity_matcher()` returns a configured instance.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

HIGH_CONFIDENCE_RADIUS_M: float = 20.0
MEDIUM_CONFIDENCE_RADIUS_M: float = 100.0
EARTH_RADIUS_M: float = 6_371_000.0  # WGS-84 mean radius


# ── Haversine helper ──────────────────────────────────────────────────────────

def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance in metres between two WGS-84 points."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))


# ── Data types ────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class EquipmentMatch:
    """One candidate equipment match with its distance and confidence tier."""
    equipment_tag: str
    equipment_id: str
    distance_m: float
    confidence: str  # "HIGH" | "MEDIUM" | "LOW"
    name: str = ""


# ── ProximityMatcher ──────────────────────────────────────────────────────────

class ProximityMatcher:
    """Find nearby equipment given a GPS position and an equipment registry.

    Parameters
    ----------
    high_radius_m:
        Radius (metres) within which a match is considered HIGH confidence.
    medium_radius_m:
        Radius (metres) within which a match is considered MEDIUM confidence.
        Equipment beyond this radius is excluded from results.
    """

    def __init__(
        self,
        high_radius_m: float = HIGH_CONFIDENCE_RADIUS_M,
        medium_radius_m: float = MEDIUM_CONFIDENCE_RADIUS_M,
    ) -> None:
        if high_radius_m <= 0 or medium_radius_m <= 0:
            raise ValueError("Radii must be positive")
        if high_radius_m >= medium_radius_m:
            raise ValueError("high_radius_m must be less than medium_radius_m")
        self._high_r = high_radius_m
        self._medium_r = medium_radius_m

    # ── Public API ────────────────────────────────────────────────────────────

    def find_nearby(
        self,
        lat: float,
        lon: float,
        equipment_registry: list[dict[str, Any]],
        radius_m: float | None = None,
    ) -> list[EquipmentMatch]:
        """Return equipment nodes within *radius_m* sorted by distance.

        Parameters
        ----------
        lat, lon:
            Technician's WGS-84 position.
        equipment_registry:
            List of dicts with keys: equipment_tag, equipment_id, gps_lat, gps_lon.
            Entries without gps_lat/gps_lon are silently skipped.
        radius_m:
            Search radius in metres.  Defaults to ``medium_radius_m``.

        Returns
        -------
        list[EquipmentMatch]
            Sorted ascending by distance (closest first).
        """
        search_r = radius_m if radius_m is not None else self._medium_r
        results: list[EquipmentMatch] = []

        for item in equipment_registry:
            eq_lat = item.get("gps_lat")
            eq_lon = item.get("gps_lon")
            if eq_lat is None or eq_lon is None:
                continue

            dist = _haversine_m(lat, lon, float(eq_lat), float(eq_lon))
            if dist > search_r:
                continue

            confidence = self._tier(dist)
            results.append(
                EquipmentMatch(
                    equipment_tag=item.get("equipment_tag") or item.get("tag") or "",
                    equipment_id=item.get("equipment_id") or item.get("node_id") or "",
                    distance_m=round(dist, 2),
                    confidence=confidence,
                    name=item.get("name", ""),
                )
            )

        results.sort(key=lambda m: m.distance_m)
        return results

    def best_match(
        self,
        lat: float,
        lon: float,
        equipment_registry: list[dict[str, Any]],
    ) -> EquipmentMatch | None:
        """Return the single closest match within medium radius, or None."""
        matches = self.find_nearby(lat, lon, equipment_registry)
        return matches[0] if matches else None

    # ── Private ───────────────────────────────────────────────────────────────

    def _tier(self, distance_m: float) -> str:
        if distance_m <= self._high_r:
            return "HIGH"
        if distance_m <= self._medium_r:
            return "MEDIUM"
        return "LOW"


# ── Factory ───────────────────────────────────────────────────────────────────

def get_proximity_matcher() -> ProximityMatcher:
    """Return a default-configured ProximityMatcher."""
    return ProximityMatcher()
