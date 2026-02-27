"""Jack-Knife Diagram Engine — Phase 5 (REF-13 §7.5.4).

Plots MTBF vs MTTR to classify equipment into 4 zones:
- Acute (low MTBF, high MTTR) — immediate attention
- Chronic (low MTBF, low MTTR) — reliability improvement
- Complex (high MTBF, high MTTR) — maintainability improvement
- Controlled (high MTBF, low MTTR) — acceptable performance

Deterministic — no LLM required.
"""

import statistics
from datetime import datetime

from tools.models.schemas import (
    JackKnifeZone, JackKnifePoint, JackKnifeResult,
)


class JackKnifeEngine:
    """Jack-Knife diagram analysis for bad actor identification."""

    @staticmethod
    def analyze(
        plant_id: str,
        equipment_data: list[dict],
    ) -> JackKnifeResult:
        """Classify equipment into Jack-Knife zones.

        Input dicts should have:
            equipment_id, equipment_tag, failure_count,
            total_downtime_hours, operating_hours
        """
        if not equipment_data:
            return JackKnifeResult(plant_id=plant_id, equipment_count=0)

        points: list[JackKnifePoint] = []
        mtbf_values: list[float] = []
        mttr_values: list[float] = []

        for eq in equipment_data:
            failure_count = eq.get("failure_count", 0)
            total_downtime = eq.get("total_downtime_hours", 0)
            operating_hours = eq.get("operating_hours", 8760)

            if failure_count <= 0:
                mtbf = operating_hours / 24.0
                mttr = 0.0
            else:
                mtbf = (operating_hours / failure_count) / 24.0
                mttr = total_downtime / failure_count

            mtbf_values.append(mtbf)
            mttr_values.append(mttr)
            points.append(JackKnifePoint(
                equipment_id=eq.get("equipment_id", ""),
                equipment_tag=eq.get("equipment_tag", ""),
                mtbf_days=round(mtbf, 1),
                mttr_hours=round(mttr, 1),
                failure_count=failure_count,
                total_downtime_hours=total_downtime,
            ))

        median_mtbf = statistics.median(mtbf_values) if mtbf_values else 0
        median_mttr = statistics.median(mttr_values) if mttr_values else 0

        acute = chronic = complex_count = controlled = 0
        for pt in points:
            if pt.mtbf_days < median_mtbf and pt.mttr_hours > median_mttr:
                pt.zone = JackKnifeZone.ACUTE
                acute += 1
            elif pt.mtbf_days < median_mtbf and pt.mttr_hours <= median_mttr:
                pt.zone = JackKnifeZone.CHRONIC
                chronic += 1
            elif pt.mtbf_days >= median_mtbf and pt.mttr_hours > median_mttr:
                pt.zone = JackKnifeZone.COMPLEX
                complex_count += 1
            else:
                pt.zone = JackKnifeZone.CONTROLLED
                controlled += 1

        return JackKnifeResult(
            plant_id=plant_id,
            equipment_count=len(points),
            points=points,
            acute_count=acute,
            chronic_count=chronic,
            complex_count=complex_count,
            controlled_count=controlled,
        )

    @staticmethod
    def get_bad_actors(result: JackKnifeResult) -> list[JackKnifePoint]:
        """Return ACUTE zone items (worst performers)."""
        return [p for p in result.points if p.zone == JackKnifeZone.ACUTE]
