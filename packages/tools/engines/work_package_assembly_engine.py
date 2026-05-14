"""Work Package Assembly Engine — G5 Gap Closure (Phase 7).

Bundles the 7 mandatory work package elements (REF-14 §5.5),
tracks per-element readiness, and generates compliance reports.

Deterministic — no LLM required.
"""

from datetime import datetime

from tools.models.schemas import (
    WorkPackageElementType,
    WorkPackageReadiness,
    ElementReadinessStatus,
    ElementReadiness,
    AssembledWorkPackage,
    WorkPackageComplianceReport,
)

ALL_REQUIRED_ELEMENTS = list(WorkPackageElementType)


class WorkPackageAssemblyEngine:
    """Assembles work packages with 7 mandatory elements and tracks readiness."""

    @staticmethod
    def assemble_work_package(
        package_id: str,
        name: str = "",
        equipment_tag: str = "",
        element_data: list[dict] | None = None,
        assembled_by: str = "",
    ) -> AssembledWorkPackage:
        """Assemble a work package from element data.

        Args:
            package_id: Unique identifier.
            name: Package name.
            equipment_tag: Equipment tag this package applies to.
            element_data: List of dicts with keys:
                element_type, status (MISSING|DRAFT|READY|EXPIRED),
                reference, expires_at, notes
            assembled_by: Person assembling the package.

        Returns:
            AssembledWorkPackage with per-element readiness.
        """
        element_data = element_data or []
        provided_map: dict[str, dict] = {}
        for ed in element_data:
            et = ed.get("element_type", "")
            provided_map[et] = ed

        elements: list[ElementReadiness] = []
        for req in ALL_REQUIRED_ELEMENTS:
            if req.value in provided_map:
                d = provided_map[req.value]
                status_str = d.get("status", "MISSING")
                try:
                    status = ElementReadinessStatus(status_str)
                except ValueError:
                    status = ElementReadinessStatus.MISSING
                elements.append(ElementReadiness(
                    element_type=req,
                    status=status,
                    reference=d.get("reference", ""),
                    expires_at=d.get("expires_at"),
                    notes=d.get("notes", ""),
                ))
            else:
                elements.append(ElementReadiness(
                    element_type=req,
                    status=ElementReadinessStatus.MISSING,
                ))

        ready_count = sum(1 for e in elements if e.status == ElementReadinessStatus.READY)
        total = len(ALL_REQUIRED_ELEMENTS)
        readiness_pct = round((ready_count / total) * 100, 1) if total > 0 else 0.0

        has_blocked = any(e.status == ElementReadinessStatus.EXPIRED for e in elements)
        if has_blocked:
            overall = WorkPackageReadiness.BLOCKED
        elif ready_count == total:
            overall = WorkPackageReadiness.READY
        elif ready_count == 0:
            overall = WorkPackageReadiness.NOT_STARTED
        else:
            overall = WorkPackageReadiness.PARTIAL

        return AssembledWorkPackage(
            package_id=package_id,
            name=name,
            equipment_tag=equipment_tag,
            elements=elements,
            ready_count=ready_count,
            total_required=total,
            readiness_pct=readiness_pct,
            overall_readiness=overall,
            assembled_by=assembled_by,
            assembled_at=datetime.now(),
        )

    @staticmethod
    def check_element_readiness(package: AssembledWorkPackage) -> list[str]:
        """Return issue strings for elements that are not READY.

        Returns:
            List of human-readable issue descriptions.
        """
        issues: list[str] = []
        for elem in package.elements:
            if elem.status == ElementReadinessStatus.MISSING:
                issues.append(f"{elem.element_type.value}: MISSING — not yet provided")
            elif elem.status == ElementReadinessStatus.DRAFT:
                issues.append(f"{elem.element_type.value}: DRAFT — needs finalization")
            elif elem.status == ElementReadinessStatus.EXPIRED:
                issues.append(f"{elem.element_type.value}: EXPIRED — renewal required")
        return issues

    @staticmethod
    def generate_compliance_report(
        packages: list[AssembledWorkPackage],
        plant_id: str = "",
    ) -> WorkPackageComplianceReport:
        """Generate a compliance report across multiple work packages.

        Args:
            packages: List of assembled work packages.
            plant_id: Plant identifier.

        Returns:
            WorkPackageComplianceReport with statistics and recommendations.
        """
        total = len(packages)
        compliant = sum(1 for p in packages if p.overall_readiness == WorkPackageReadiness.READY)
        non_compliant = total - compliant
        compliance_pct = round((compliant / total) * 100, 1) if total > 0 else 0.0

        missing_summary: dict[str, int] = {}
        for pkg in packages:
            for elem in pkg.elements:
                if elem.status != ElementReadinessStatus.READY:
                    key = elem.element_type.value
                    missing_summary[key] = missing_summary.get(key, 0) + 1

        recommendations: list[str] = []
        if non_compliant > 0:
            recommendations.append(
                f"{non_compliant} of {total} packages are not fully compliant"
            )
        if missing_summary:
            worst = max(missing_summary, key=missing_summary.get)
            recommendations.append(
                f"Most common gap: {worst} (missing/draft/expired in {missing_summary[worst]} packages)"
            )
        blocked_count = sum(
            1 for p in packages if p.overall_readiness == WorkPackageReadiness.BLOCKED
        )
        if blocked_count > 0:
            recommendations.append(
                f"{blocked_count} packages are BLOCKED due to expired elements — address urgently"
            )
        if compliance_pct == 100.0 and total > 0:
            recommendations.append("All packages fully compliant — ready for execution")

        return WorkPackageComplianceReport(
            plant_id=plant_id,
            total_packages=total,
            compliant_count=compliant,
            non_compliant_count=non_compliant,
            compliance_pct=compliance_pct,
            missing_elements_summary=missing_summary,
            recommendations=recommendations,
        )
