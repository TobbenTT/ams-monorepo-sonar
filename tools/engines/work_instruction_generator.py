"""
Work Instruction Generator (OPP-6)
Generates structured work instruction data from work packages.
Based on REF-07: WI structure, 4 WP type templates.
"""

from dataclasses import dataclass, field
from datetime import date


@dataclass
class WIOperation:
    """A single operation in a work instruction."""
    operation_number: int
    trade: str
    description: str
    acceptable_limits: str
    conditional_comments: str
    duration_hours: float
    num_workers: int
    materials: list[str]
    notes: str = ""


@dataclass
class WISafetySection:
    """Safety section of a work instruction."""
    isolation_required: bool
    permits_required: list[str]
    ppe_required: list[str]
    environmental_controls: list[str]
    risk_assessment_ref: str = ""


@dataclass
class WIResourceSummary:
    """Resource summary for a work instruction."""
    total_duration_hours: float
    trades_required: list[dict]  # [{trade, people}]
    materials_required: list[dict]  # [{description, stock_code, qty}]
    special_tools: list[str]
    special_equipment: list[str]


@dataclass
class WorkInstruction:
    """Complete work instruction document."""
    # Header
    wp_name: str
    wp_code: str
    equipment_name: str
    equipment_tag: str
    frequency: str
    constraint: str
    revision: int = 1
    issue_date: date = field(default_factory=date.today)

    # Sections
    safety: WISafetySection = field(default_factory=lambda: WISafetySection(
        isolation_required=False, permits_required=[], ppe_required=[], environmental_controls=[],
    ))
    pre_task_notes: str = ""
    operations: list[WIOperation] = field(default_factory=list)
    resources: WIResourceSummary = field(default_factory=lambda: WIResourceSummary(
        total_duration_hours=0, trades_required=[], materials_required=[],
        special_tools=[], special_equipment=[],
    ))
    post_task_notes: str = ""

    # Metadata
    prepared_by: str = ""
    reviewed_by: str = ""
    approved_by: str = ""


# Default PPE by constraint type
DEFAULT_PPE = {
    "ONLINE": ["Hard hat", "Safety glasses", "Safety boots", "Hi-vis vest", "Hearing protection"],
    "OFFLINE": ["Hard hat", "Safety glasses", "Safety boots", "Hi-vis vest", "Hearing protection", "Gloves"],
    "TEST_MODE": ["Hard hat", "Safety glasses", "Safety boots", "Hi-vis vest"],
}

# Additional PPE for specific trades
TRADE_PPE = {
    "ELECTRICIAN": ["Insulated gloves", "Arc flash protection"],
    "FITTER": ["Gloves", "Face shield (grinding)"],
    "LUBRICATOR": ["Chemical-resistant gloves", "Splash goggles"],
}


class WorkInstructionGenerator:
    """Generates work instructions from work packages and tasks."""

    @staticmethod
    def generate(
        wp_name: str,
        wp_code: str,
        equipment_name: str,
        equipment_tag: str,
        frequency: str,
        constraint: str,
        tasks: list[dict],
        job_preparation: str = "",
        post_shutdown: str = "",
    ) -> WorkInstruction:
        """
        Generate a complete work instruction.

        Args:
            tasks: List of dicts with keys matching MaintenanceTask fields:
                name, task_type, constraint, acceptable_limits, conditional_comments,
                labour_resources, material_resources, tools, special_equipment
        """
        operations = []
        all_trades: dict[str, int] = {}
        all_materials: list[dict] = []
        all_tools: list[str] = []
        all_special_equipment: list[str] = []
        total_hours = 0.0
        needs_isolation = constraint == "OFFLINE"

        for idx, task in enumerate(tasks):
            op_num = (idx + 1) * 10

            # Collect labour
            trade = ""
            workers = 1
            task_hours = 0.0
            for lr in task.get("labour_resources", []):
                trade = lr.get("specialty", "")
                workers = lr.get("quantity", 1)
                hours = lr.get("hours_per_person", 0) * workers
                task_hours += hours
                all_trades[trade] = all_trades.get(trade, 0) + workers

            total_hours += task_hours

            # Collect materials
            mat_descs = []
            for mr in task.get("material_resources", []):
                desc = mr.get("description", "")
                qty = mr.get("quantity", 1)
                code = mr.get("stock_code", "")
                mat_descs.append(f"{desc} ({code}), qty: {qty}")
                all_materials.append({"description": desc, "stock_code": code, "qty": qty})

            # Collect tools
            for t in task.get("tools", []):
                if t not in all_tools:
                    all_tools.append(t)

            for se in task.get("special_equipment", []):
                if se not in all_special_equipment:
                    all_special_equipment.append(se)

            operations.append(WIOperation(
                operation_number=op_num,
                trade=trade,
                description=task.get("name", ""),
                acceptable_limits=task.get("acceptable_limits", ""),
                conditional_comments=task.get("conditional_comments", ""),
                duration_hours=task_hours,
                num_workers=workers,
                materials=mat_descs,
            ))

        # Build safety section
        ppe = list(DEFAULT_PPE.get(constraint, DEFAULT_PPE["ONLINE"]))
        for trade_name in all_trades:
            trade_extra = TRADE_PPE.get(trade_name, [])
            for item in trade_extra:
                if item not in ppe:
                    ppe.append(item)

        safety = WISafetySection(
            isolation_required=needs_isolation,
            permits_required=["LOTOTO"] if needs_isolation else [],
            ppe_required=ppe,
            environmental_controls=["Spill containment"] if needs_isolation else [],
        )

        resources = WIResourceSummary(
            total_duration_hours=total_hours,
            trades_required=[{"trade": t, "people": c} for t, c in all_trades.items()],
            materials_required=all_materials,
            special_tools=all_tools,
            special_equipment=all_special_equipment,
        )

        return WorkInstruction(
            wp_name=wp_name,
            wp_code=wp_code,
            equipment_name=equipment_name,
            equipment_tag=equipment_tag,
            frequency=frequency,
            constraint=constraint,
            safety=safety,
            pre_task_notes=job_preparation,
            operations=operations,
            resources=resources,
            post_task_notes=post_shutdown,
        )

    @staticmethod
    def validate_work_instruction(wi: WorkInstruction) -> list[str]:
        """Validate a generated work instruction for completeness."""
        issues = []

        if not wi.operations:
            issues.append("ERROR: Work instruction has no operations")

        if wi.constraint == "OFFLINE" and not wi.safety.isolation_required:
            issues.append("ERROR: Offline WI must require isolation")

        if wi.resources.total_duration_hours == 0:
            issues.append("WARNING: Total duration is 0 hours")

        if not wi.resources.trades_required:
            issues.append("ERROR: No trades assigned")

        for op in wi.operations:
            if not op.description:
                issues.append(f"ERROR: Operation {op.operation_number} has no description")
            if op.duration_hours <= 0:
                issues.append(f"WARNING: Operation {op.operation_number} has 0 duration")

        return issues
