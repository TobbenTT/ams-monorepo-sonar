"""
State Machine — Workflow Enforcement (GAP-4)
Enforces valid state transitions for all entities with approval workflows.
Prevents illegal jumps (e.g., DRAFT → APPROVED without REVIEWED).
"""

from enum import Enum


class TransitionError(Exception):
    """Raised when an invalid state transition is attempted."""
    pass


# ============================================================
# VALID TRANSITIONS PER ENTITY TYPE
# ============================================================

APPROVAL_TRANSITIONS = {
    "DRAFT": {"REVIEWED", "DRAFT"},
    "REVIEWED": {"APPROVED", "DRAFT"},
    "APPROVED": {"APPROVED"},
}

WORK_REQUEST_TRANSITIONS = {
    "DRAFT": {"PENDING_VALIDATION", "DRAFT"},
    "PENDING_VALIDATION": {"VALIDATED", "REJECTED", "PENDING_VALIDATION"},
    "VALIDATED": {"SUBMITTED_TO_SAP", "VALIDATED"},
    "REJECTED": {"DRAFT", "REJECTED"},
    "SUBMITTED_TO_SAP": {"SUBMITTED_TO_SAP"},
}

WORK_ORDER_TRANSITIONS = {
    "CREATED": {"RELEASED", "CANCELLED", "CREATED"},
    "RELEASED": {"IN_PROGRESS", "CANCELLED", "RELEASED"},
    "IN_PROGRESS": {"COMPLETED", "CANCELLED", "IN_PROGRESS"},
    "COMPLETED": {"CLOSED", "COMPLETED"},
    "CLOSED": {"CLOSED"},
    "CANCELLED": {"CANCELLED"},
}

BACKLOG_TRANSITIONS = {
    "AWAITING_MATERIALS": {"AWAITING_SHUTDOWN", "AWAITING_RESOURCES", "SCHEDULED", "AWAITING_MATERIALS"},
    "AWAITING_SHUTDOWN": {"AWAITING_MATERIALS", "AWAITING_RESOURCES", "SCHEDULED", "AWAITING_SHUTDOWN"},
    "AWAITING_RESOURCES": {"AWAITING_MATERIALS", "AWAITING_SHUTDOWN", "SCHEDULED", "AWAITING_RESOURCES"},
    "AWAITING_APPROVAL": {"AWAITING_MATERIALS", "AWAITING_SHUTDOWN", "AWAITING_RESOURCES", "SCHEDULED", "AWAITING_APPROVAL"},
    "SCHEDULED": {"IN_PROGRESS", "AWAITING_MATERIALS", "AWAITING_SHUTDOWN", "SCHEDULED"},
    "IN_PROGRESS": {"IN_PROGRESS"},
}

WP_APPROVAL_TRANSITIONS = {
    "DRAFT": {"REVIEWED", "DRAFT"},
    "REVIEWED": {"APPROVED", "DRAFT", "REVIEWED"},
    "APPROVED": {"UPLOADED_TO_SAP", "APPROVED"},
    "UPLOADED_TO_SAP": {"UPLOADED_TO_SAP"},
}

SAP_UPLOAD_TRANSITIONS = {
    "GENERATED": {"REVIEWED", "GENERATED"},
    "REVIEWED": {"APPROVED", "GENERATED", "REVIEWED"},
    "APPROVED": {"UPLOADED", "APPROVED"},
    "UPLOADED": {"UPLOADED"},
}

# SAP PM Work Order 8-status lifecycle (Phase 4A)
SAP_WORK_ORDER_TRANSITIONS = {
    "PLN": {"FMA", "LPE", "PLN"},
    "FMA": {"LPE", "FMA"},
    "LPE": {"LIB", "LPE"},
    "LIB": {"IMPR", "LIB"},
    "IMPR": {"NOTP", "NOTI", "IMPR"},
    "NOTP": {"NOTI", "NOTP"},
    "NOTI": {"CTEC", "NOTI"},
    "CTEC": {"CTEC"},
}

# SAP PM Notification 4-status lifecycle (Phase 4A)
SAP_NOTIFICATION_TRANSITIONS = {
    "MEAB": {"METR", "MEAB"},
    "METR": {"ORAS", "METR"},
    "ORAS": {"MECE", "ORAS"},
    "MECE": {"MECE"},
}

# Weekly program lifecycle (Phase 4B)
WEEKLY_PROGRAM_TRANSITIONS = {
    "DRAFT": {"FINAL", "DRAFT"},
    "FINAL": {"ACTIVE", "DRAFT", "FINAL"},
    "ACTIVE": {"COMPLETED", "ACTIVE"},
    "COMPLETED": {"COMPLETED"},
}

# Shutdown lifecycle (Phase 5)
SHUTDOWN_TRANSITIONS = {
    "PLANNED": {"IN_PROGRESS", "CANCELLED", "PLANNED"},
    "IN_PROGRESS": {"COMPLETED", "IN_PROGRESS"},
    "COMPLETED": {"COMPLETED"},
    "CANCELLED": {"CANCELLED"},
}

# MoC lifecycle (Phase 5)
MOC_TRANSITIONS = {
    "DRAFT": {"SUBMITTED", "DRAFT"},
    "SUBMITTED": {"REVIEWING", "DRAFT", "SUBMITTED"},
    "REVIEWING": {"APPROVED", "REJECTED", "REVIEWING"},
    "APPROVED": {"IMPLEMENTING", "APPROVED"},
    "IMPLEMENTING": {"CLOSED", "IMPLEMENTING"},
    "CLOSED": {"CLOSED"},
    "REJECTED": {"DRAFT", "REJECTED"},
}

# FMECA Worksheet lifecycle (Phase 7)
FMECA_WORKSHEET_TRANSITIONS = {
    "DRAFT": {"IN_PROGRESS", "DRAFT"},
    "IN_PROGRESS": {"COMPLETED", "IN_PROGRESS"},
    "COMPLETED": {"APPROVED", "COMPLETED"},
    "APPROVED": {"APPROVED"},
}


# Registry mapping entity types to their transition tables
TRANSITION_REGISTRY: dict[str, dict[str, set[str]]] = {
    "approval": APPROVAL_TRANSITIONS,
    "work_request": WORK_REQUEST_TRANSITIONS,
    "work_order": WORK_ORDER_TRANSITIONS,
    "backlog": BACKLOG_TRANSITIONS,
    "work_package": WP_APPROVAL_TRANSITIONS,
    "sap_upload": SAP_UPLOAD_TRANSITIONS,
    "sap_work_order": SAP_WORK_ORDER_TRANSITIONS,
    "sap_notification": SAP_NOTIFICATION_TRANSITIONS,
    "weekly_program": WEEKLY_PROGRAM_TRANSITIONS,
    "shutdown": SHUTDOWN_TRANSITIONS,
    "moc": MOC_TRANSITIONS,
    "fmeca_worksheet": FMECA_WORKSHEET_TRANSITIONS,
}


class StateMachine:
    """Enforces valid state transitions for entity workflows."""

    @staticmethod
    def validate_transition(
        entity_type: str,
        current_state: str,
        target_state: str,
    ) -> bool:
        """
        Check if a state transition is valid.

        Args:
            entity_type: Key in TRANSITION_REGISTRY (e.g., 'approval', 'work_request')
            current_state: Current status value
            target_state: Desired new status value

        Returns:
            True if transition is valid

        Raises:
            TransitionError: If transition is invalid
            ValueError: If entity_type or current_state is unknown
        """
        transitions = TRANSITION_REGISTRY.get(entity_type)
        if transitions is None:
            raise ValueError(f"Unknown entity type: '{entity_type}'. Valid: {list(TRANSITION_REGISTRY.keys())}")

        valid_targets = transitions.get(current_state)
        if valid_targets is None:
            raise ValueError(f"Unknown state '{current_state}' for entity type '{entity_type}'")

        if target_state not in valid_targets:
            raise TransitionError(
                f"Invalid transition for {entity_type}: "
                f"'{current_state}' → '{target_state}'. "
                f"Valid targets: {sorted(valid_targets)}"
            )

        return True

    @staticmethod
    def get_valid_transitions(entity_type: str, current_state: str) -> set[str]:
        """Return the set of valid target states from current_state."""
        transitions = TRANSITION_REGISTRY.get(entity_type)
        if transitions is None:
            raise ValueError(f"Unknown entity type: '{entity_type}'")
        valid = transitions.get(current_state)
        if valid is None:
            raise ValueError(f"Unknown state '{current_state}' for '{entity_type}'")
        return valid

    @staticmethod
    def get_all_states(entity_type: str) -> list[str]:
        """Return all defined states for an entity type."""
        transitions = TRANSITION_REGISTRY.get(entity_type)
        if transitions is None:
            raise ValueError(f"Unknown entity type: '{entity_type}'")
        return sorted(transitions.keys())
