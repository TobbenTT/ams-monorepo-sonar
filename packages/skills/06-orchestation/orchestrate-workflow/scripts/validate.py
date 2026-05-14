"""
Validation script for orchestrate-workflow skill.
Verifies session state, milestone transitions, and gate statuses.
"""
import json
import sys


VALID_STATUSES = {"PENDING", "IN_PROGRESS", "PRESENTED", "APPROVED", "REJECTED"}

VALID_TRANSITIONS = {
    ("PENDING", "IN_PROGRESS"),
    ("IN_PROGRESS", "PRESENTED"),
    ("PRESENTED", "APPROVED"),
    ("PRESENTED", "IN_PROGRESS"),  # modify
    ("PRESENTED", "REJECTED"),
}


def validate_session(session: dict) -> dict:
    """Validate a workflow session state.

    Args:
        session: dict with keys: session_id, equipment_tag, plant_code,
                 milestones (list of gate dicts), interactions (list)

    Returns:
        dict with 'valid' (bool), 'errors' (list), 'warnings' (list), 'info' (list)
    """
    errors = []
    warnings = []
    info = []

    # Session-level checks
    if not session.get("session_id"):
        errors.append("Missing session_id")
    if not session.get("equipment_tag"):
        errors.append("Missing equipment_tag")

    milestones = session.get("milestones", [])
    if len(milestones) != 4:
        errors.append(f"Expected 4 milestones, found {len(milestones)}")

    # Milestone sequence validation
    prev_status = None
    for i, gate in enumerate(milestones):
        number = gate.get("number", i + 1)
        status = gate.get("status", "UNKNOWN")

        if status not in VALID_STATUSES:
            errors.append(f"Milestone {number}: invalid status '{status}'")
            continue

        # Check sequential ordering
        if prev_status == "REJECTED" and status != "PENDING":
            errors.append(
                f"Milestone {number}: should be PENDING because previous "
                f"milestone was REJECTED"
            )
        if prev_status not in ("APPROVED", None) and status != "PENDING":
            if status != "REJECTED":
                warnings.append(
                    f"Milestone {number}: status is '{status}' but previous "
                    f"milestone status was '{prev_status}'"
                )

        prev_status = status

    # Check for required entity types per milestone
    entity_checks = {
        1: ["hierarchy_nodes", "criticality_assessments"],
        2: ["functions", "functional_failures", "failure_modes"],
        3: ["maintenance_tasks", "work_packages"],
        4: ["sap_upload_package"],
    }

    entities = session.get("entities", {})
    for gate in milestones:
        number = gate.get("number", 0)
        status = gate.get("status", "PENDING")
        if status == "APPROVED" and number in entity_checks:
            for entity_type in entity_checks[number]:
                count = entities.get(entity_type, 0)
                if isinstance(count, bool):
                    if not count:
                        warnings.append(
                            f"Milestone {number} approved but {entity_type} is False"
                        )
                elif isinstance(count, (int, float)):
                    if count == 0:
                        warnings.append(
                            f"Milestone {number} approved but {entity_type} count is 0"
                        )

    # Safety check
    sap = entities.get("sap_upload_package")
    if sap and not session.get("is_draft", True):
        errors.append("SAFETY: SAP package exists but is_draft is not True")

    approved_count = sum(
        1 for g in milestones if g.get("status") == "APPROVED"
    )
    info.append(f"{approved_count}/4 milestones approved")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "milestones_approved": approved_count,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate.py <session_json>")
        print("  session_json: JSON object of workflow session state")
        sys.exit(1)

    session = json.loads(sys.argv[1])
    result = validate_session(session)
    print(json.dumps(result, indent=2))
