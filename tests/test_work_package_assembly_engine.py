"""Tests for Work Package Assembly Engine — Phase 7 (G5)."""

from tools.engines.work_package_assembly_engine import WorkPackageAssemblyEngine
from tools.models.schemas import (
    WorkPackageReadiness,
    ElementReadinessStatus,
    WorkPackageElementType,
    AssembledWorkPackage,
)


def _all_ready_elements():
    return [
        {"element_type": et.value, "status": "READY", "reference": f"REF-{et.value}"}
        for et in WorkPackageElementType
    ]


def _partial_elements():
    elements = _all_ready_elements()
    elements[0]["status"] = "MISSING"
    elements[1]["status"] = "DRAFT"
    return elements


class TestAssembleWorkPackage:

    def test_all_ready(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package(
            "WP-1", name="Pump Overhaul", element_data=_all_ready_elements(),
        )
        assert isinstance(pkg, AssembledWorkPackage)
        assert pkg.package_id == "WP-1"
        assert pkg.ready_count == 7
        assert pkg.readiness_pct == 100.0
        assert pkg.overall_readiness == WorkPackageReadiness.READY

    def test_partial_readiness(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package(
            "WP-2", element_data=_partial_elements(),
        )
        assert pkg.ready_count == 5
        assert pkg.overall_readiness == WorkPackageReadiness.PARTIAL
        assert pkg.readiness_pct < 100.0

    def test_no_elements(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-3")
        assert pkg.ready_count == 0
        assert pkg.readiness_pct == 0.0
        assert pkg.overall_readiness == WorkPackageReadiness.NOT_STARTED
        assert len(pkg.elements) == 7

    def test_blocked_on_expired(self):
        elements = _all_ready_elements()
        elements[2]["status"] = "EXPIRED"
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-4", element_data=elements)
        assert pkg.overall_readiness == WorkPackageReadiness.BLOCKED

    def test_all_missing(self):
        elements = [{"element_type": et.value, "status": "MISSING"} for et in WorkPackageElementType]
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-5", element_data=elements)
        assert pkg.ready_count == 0
        assert pkg.overall_readiness == WorkPackageReadiness.NOT_STARTED

    def test_assembled_by(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package(
            "WP-6", assembled_by="John Doe",
        )
        assert pkg.assembled_by == "John Doe"

    def test_equipment_tag(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package(
            "WP-7", equipment_tag="PUMP-001",
        )
        assert pkg.equipment_tag == "PUMP-001"

    def test_invalid_status_defaults_to_missing(self):
        elements = [{"element_type": WorkPackageElementType.WORK_PERMIT.value, "status": "INVALID"}]
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-8", element_data=elements)
        wp_elem = next(e for e in pkg.elements if e.element_type == WorkPackageElementType.WORK_PERMIT)
        assert wp_elem.status == ElementReadinessStatus.MISSING


class TestCheckElementReadiness:

    def test_all_ready_no_issues(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-1", element_data=_all_ready_elements())
        issues = WorkPackageAssemblyEngine.check_element_readiness(pkg)
        assert len(issues) == 0

    def test_missing_elements_reported(self):
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-2")
        issues = WorkPackageAssemblyEngine.check_element_readiness(pkg)
        assert len(issues) == 7
        assert all("MISSING" in i for i in issues)

    def test_draft_elements_reported(self):
        elements = _all_ready_elements()
        elements[0]["status"] = "DRAFT"
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-3", element_data=elements)
        issues = WorkPackageAssemblyEngine.check_element_readiness(pkg)
        assert len(issues) == 1
        assert "DRAFT" in issues[0]

    def test_expired_elements_reported(self):
        elements = _all_ready_elements()
        elements[3]["status"] = "EXPIRED"
        pkg = WorkPackageAssemblyEngine.assemble_work_package("WP-4", element_data=elements)
        issues = WorkPackageAssemblyEngine.check_element_readiness(pkg)
        assert len(issues) == 1
        assert "EXPIRED" in issues[0]


class TestGenerateComplianceReport:

    def test_all_compliant(self):
        pkgs = [
            WorkPackageAssemblyEngine.assemble_work_package(f"WP-{i}", element_data=_all_ready_elements())
            for i in range(3)
        ]
        report = WorkPackageAssemblyEngine.generate_compliance_report(pkgs, plant_id="PLANT-1")
        assert report.plant_id == "PLANT-1"
        assert report.total_packages == 3
        assert report.compliant_count == 3
        assert report.compliance_pct == 100.0
        assert any("fully compliant" in r for r in report.recommendations)

    def test_mixed_compliance(self):
        pkgs = [
            WorkPackageAssemblyEngine.assemble_work_package("WP-1", element_data=_all_ready_elements()),
            WorkPackageAssemblyEngine.assemble_work_package("WP-2"),
        ]
        report = WorkPackageAssemblyEngine.generate_compliance_report(pkgs)
        assert report.compliant_count == 1
        assert report.non_compliant_count == 1
        assert report.compliance_pct == 50.0

    def test_empty_packages(self):
        report = WorkPackageAssemblyEngine.generate_compliance_report([])
        assert report.total_packages == 0
        assert report.compliance_pct == 0.0

    def test_blocked_packages_warning(self):
        elements = _all_ready_elements()
        elements[0]["status"] = "EXPIRED"
        pkgs = [WorkPackageAssemblyEngine.assemble_work_package("WP-1", element_data=elements)]
        report = WorkPackageAssemblyEngine.generate_compliance_report(pkgs)
        assert any("BLOCKED" in r for r in report.recommendations)

    def test_missing_elements_summary(self):
        pkgs = [WorkPackageAssemblyEngine.assemble_work_package("WP-1")]
        report = WorkPackageAssemblyEngine.generate_compliance_report(pkgs)
        assert len(report.missing_elements_summary) == 7
