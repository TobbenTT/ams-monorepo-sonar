"""
Multi-Plant Variance Detector — REF-12 Recommendation 7
Detects when one plant's metrics diverge >2σ from portfolio mean.

OCP has 15 plants with heterogeneous workflows. Aggregated dashboards
can hide plant-specific problems (Hidden Profile Bias — Neuro-Arq §3.1).

This engine:
1. Collects per-plant metrics
2. Computes portfolio mean and standard deviation
3. Flags plants deviating >2σ (WARNING) or >3σ (CRITICAL)
4. Generates contextual variance alerts
"""

import math
from datetime import date, datetime

from tools.models.schemas import (
    PlantMetricSnapshot,
    PlantVarianceAlert,
    VarianceLevel,
)


class VarianceDetector:
    """Detects outlier plants across a portfolio of metrics."""

    @staticmethod
    def compute_stats(values: list[float]) -> tuple[float, float]:
        """Compute mean and population standard deviation."""
        n = len(values)
        if n == 0:
            return 0.0, 0.0
        mean = sum(values) / n
        if n < 2:
            return mean, 0.0
        variance = sum((v - mean) ** 2 for v in values) / n
        std = math.sqrt(variance)
        return round(mean, 2), round(std, 4)

    @staticmethod
    def z_score(value: float, mean: float, std: float) -> float:
        """Calculate z-score (standard deviations from mean)."""
        if std == 0:
            return 0.0
        return round((value - mean) / std, 2)

    @classmethod
    def detect_variance(
        cls,
        snapshots: list[PlantMetricSnapshot],
        warning_threshold: float = 2.0,
        critical_threshold: float = 3.0,
    ) -> list[PlantVarianceAlert]:
        """Analyze plant metrics and generate variance alerts.

        Args:
            snapshots: Per-plant metric values for the same metric.
            warning_threshold: σ threshold for WARNING (default 2.0).
            critical_threshold: σ threshold for CRITICAL (default 3.0).

        Returns:
            List of PlantVarianceAlert for plants exceeding thresholds.
        """
        if len(snapshots) < 3:
            return []  # Need at least 3 plants for meaningful statistics

        values = [s.metric_value for s in snapshots]
        mean, std = cls.compute_stats(values)

        if std == 0:
            return []  # All plants identical — no variance

        alerts = []
        for snapshot in snapshots:
            z = cls.z_score(snapshot.metric_value, mean, std)
            abs_z = abs(z)

            if abs_z < warning_threshold:
                continue

            if abs_z >= critical_threshold:
                level = VarianceLevel.CRITICAL
            else:
                level = VarianceLevel.WARNING

            direction = "above" if z > 0 else "below"
            alert = PlantVarianceAlert(
                plant_id=snapshot.plant_id,
                plant_name=snapshot.plant_name,
                metric_name=snapshot.metric_name,
                plant_value=snapshot.metric_value,
                portfolio_mean=mean,
                portfolio_std=std,
                z_score=z,
                variance_level=level,
                message=(
                    f"{snapshot.plant_name}: {snapshot.metric_name} is {abs_z:.1f}σ "
                    f"{direction} portfolio mean ({snapshot.metric_value:.1f} vs {mean:.1f})"
                ),
            )
            alerts.append(alert)

        return alerts

    @classmethod
    def detect_multi_metric(
        cls,
        all_snapshots: dict[str, list[PlantMetricSnapshot]],
        warning_threshold: float = 2.0,
        critical_threshold: float = 3.0,
    ) -> list[PlantVarianceAlert]:
        """Analyze multiple metrics across all plants.

        Args:
            all_snapshots: Dict of metric_name → list of PlantMetricSnapshot.

        Returns:
            Combined list of all variance alerts across all metrics.
        """
        all_alerts = []
        for metric_name, snapshots in all_snapshots.items():
            alerts = cls.detect_variance(snapshots, warning_threshold, critical_threshold)
            all_alerts.extend(alerts)
        return all_alerts

    @staticmethod
    def rank_plants(snapshots: list[PlantMetricSnapshot]) -> list[dict]:
        """Rank plants by metric value (for management review dashboard).

        Returns:
            List of dicts with plant info and rank, sorted by metric value descending.
        """
        sorted_snaps = sorted(snapshots, key=lambda s: s.metric_value, reverse=True)
        return [
            {
                "rank": i + 1,
                "plant_id": s.plant_id,
                "plant_name": s.plant_name,
                "metric_value": s.metric_value,
            }
            for i, s in enumerate(sorted_snaps)
        ]
