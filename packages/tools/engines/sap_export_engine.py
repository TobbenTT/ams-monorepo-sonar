"""
SAP Export Engine — Deterministic
Generates SAP PM upload templates from Work Packages.
Based on REF-03: 3 linked templates (Maintenance Item, Task List, Work Plan).
"""

from datetime import datetime

from tools.models.schemas import (
    MaintenanceTask,
    SAPMaintenanceItem,
    SAPMaintenancePlan,
    SAPOperation,
    SAPTaskList,
    SAPUploadPackage,
    WPConstraint,
    WorkPackage,
)


# Constraint to SAP system_condition mapping
CONSTRAINT_TO_SAP = {
    WPConstraint.ONLINE: 1,   # Running
    WPConstraint.OFFLINE: 3,  # Stopped
}

# Frequency unit mapping to SAP cycle unit
FREQ_UNIT_TO_SAP = {
    "DAYS": "DAY",
    "WEEKS": "WK",
    "MONTHS": "MON",
    "YEARS": "YR",
    "HOURS": "H",
    "OPERATING_HOURS": "H",
}


class SAPExportEngine:
    """Generates SAP PM upload package from work packages."""

    @staticmethod
    def generate_upload_package(
        work_packages: list[WorkPackage],
        plant_code: str,
        plan_description: str = "",
        tasks: dict[str, "MaintenanceTask"] | None = None,
    ) -> SAPUploadPackage:
        """
        Generate a complete SAP upload package from a list of work packages.
        Creates linked Maintenance Items, Task Lists, and a Maintenance Plan.

        Args:
            tasks: Optional dict mapping task_id → MaintenanceTask for field population.
        """
        if not work_packages:
            raise ValueError("At least one work package is required")

        tasks = tasks or {}
        maintenance_items = []
        task_lists = []

        for idx, wp in enumerate(work_packages, start=1):
            mi_ref = f"$MI{idx}"
            tl_ref = f"$TL{idx}"

            # Generate Maintenance Item
            mi = SAPMaintenanceItem(
                item_ref=mi_ref,
                description=wp.name,
                order_type="PM03",
                func_loc="",  # Must be filled from hierarchy
                main_work_center="",  # Must be filled from labour
                planner_group=1,
                task_list_ref=tl_ref,
                priority="4",  # Default planned
            )
            maintenance_items.append(mi)

            # Generate Task List with operations
            operations = []
            for task_alloc in wp.allocated_tasks:
                task = tasks.get(task_alloc.task_id)
                if task:
                    short_text = task.name[:72]
                    duration = sum(
                        lr.quantity * lr.hours_per_person for lr in task.labour_resources
                    ) or 0.5  # Fallback minimum
                    num_workers = sum(lr.quantity for lr in task.labour_resources) or 1
                    work_centre = (
                        task.labour_resources[0].specialty.value if task.labour_resources else ""
                    )
                else:
                    short_text = "Task placeholder"
                    duration = 0.5  # Default minimum
                    num_workers = 1
                    work_centre = ""

                op = SAPOperation(
                    operation_number=task_alloc.operation_number,
                    work_centre=work_centre,
                    control_key="PMIN",
                    short_text=short_text,
                    duration_hours=duration,
                    unit="H",
                    num_workers=num_workers,
                )
                operations.append(op)

            tl = SAPTaskList(
                list_ref=tl_ref,
                description=wp.name,
                func_loc="",
                system_condition=CONSTRAINT_TO_SAP.get(wp.constraint, 1),
                operations=operations,
            )
            task_lists.append(tl)

        # Determine cycle from first work package
        first_wp = work_packages[0]
        cycle_unit = FREQ_UNIT_TO_SAP.get(first_wp.frequency_unit.value, "DAY")

        maintenance_plan = SAPMaintenancePlan(
            plan_id="",
            description=plan_description or f"Plan for {plant_code}",
            category="PM",
            cycle_value=int(first_wp.frequency_value),
            cycle_unit=cycle_unit,
            call_horizon_pct=50,
            scheduling_period=14,
            scheduling_unit="DAY",
        )

        return SAPUploadPackage(
            plant_code=plant_code,
            maintenance_plan=maintenance_plan,
            maintenance_items=maintenance_items,
            task_lists=task_lists,
        )

    @staticmethod
    def validate_cross_references(package: SAPUploadPackage) -> list[str]:
        """Validate that all $MI/$TL cross-references are consistent."""
        errors = []

        mi_refs = {mi.item_ref for mi in package.maintenance_items}
        tl_refs = {tl.list_ref for tl in package.task_lists}

        # Every MI must reference an existing TL
        for mi in package.maintenance_items:
            if mi.task_list_ref not in tl_refs:
                errors.append(
                    f"Maintenance Item {mi.item_ref} references {mi.task_list_ref} "
                    f"which does not exist in task lists"
                )

        # Every TL should be referenced by at least one MI
        referenced_tls = {mi.task_list_ref for mi in package.maintenance_items}
        orphan_tls = tl_refs - referenced_tls
        for tl in orphan_tls:
            errors.append(f"Task List {tl} is not referenced by any Maintenance Item")

        return errors

    @staticmethod
    def validate_sap_field_lengths(package: SAPUploadPackage) -> list[str]:
        """Validate SAP field length constraints."""
        errors = []
        for tl in package.task_lists:
            for op in tl.operations:
                if len(op.short_text) > 72:
                    errors.append(
                        f"Operation {op.operation_number} in {tl.list_ref}: "
                        f"short_text exceeds 72 chars ({len(op.short_text)})"
                    )
        return errors
