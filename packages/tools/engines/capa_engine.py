"""
CAPA Engine — REF-12 Recommendation 8 (ISO 55002 §10.2)
Corrective and Preventive Action tracking with PDCA cycle management.

Addresses ISO 55002 gaps:
- §10.1 Nonconformity and corrective action
- §10.2 Preventive action
- §10.4 Continual improvement

CAPA lifecycle: OPEN → IN_PROGRESS → CLOSED → VERIFIED
PDCA phases: PLAN → DO → CHECK → ACT
"""

from datetime import date, datetime

from tools.models.schemas import (
    CAPAItem,
    CAPAStatus,
    CAPAType,
    PDCAPhase,
)


class CAPAEngine:
    """Manages CAPA lifecycle and PDCA tracking."""

    # Valid PDCA phase transitions
    PDCA_TRANSITIONS = {
        PDCAPhase.PLAN: [PDCAPhase.DO],
        PDCAPhase.DO: [PDCAPhase.CHECK],
        PDCAPhase.CHECK: [PDCAPhase.ACT, PDCAPhase.DO],  # CHECK→DO = rework
        PDCAPhase.ACT: [PDCAPhase.PLAN],  # ACT→PLAN = new cycle
    }

    # Valid status transitions
    STATUS_TRANSITIONS = {
        CAPAStatus.OPEN: [CAPAStatus.IN_PROGRESS],
        CAPAStatus.IN_PROGRESS: [CAPAStatus.CLOSED, CAPAStatus.OPEN],  # Can reopen
        CAPAStatus.CLOSED: [CAPAStatus.VERIFIED, CAPAStatus.IN_PROGRESS],  # Can reopen
        CAPAStatus.VERIFIED: [],  # Terminal state
    }

    @staticmethod
    def create_capa(
        capa_type: CAPAType,
        title: str,
        description: str,
        plant_id: str,
        source: str,
        assigned_to: str = "",
        equipment_id: str | None = None,
        target_date: date | None = None,
    ) -> CAPAItem:
        """Create a new CAPA item in OPEN status, PLAN phase."""
        return CAPAItem(
            capa_type=capa_type,
            title=title,
            description=description,
            plant_id=plant_id,
            source=source,
            assigned_to=assigned_to,
            equipment_id=equipment_id,
            target_date=target_date,
            current_phase=PDCAPhase.PLAN,
            status=CAPAStatus.OPEN,
        )

    @classmethod
    def advance_phase(cls, capa: CAPAItem, target_phase: PDCAPhase) -> tuple[CAPAItem, str]:
        """Advance CAPA to next PDCA phase.

        Returns:
            Tuple of (updated CAPAItem, status_message).
        """
        allowed = cls.PDCA_TRANSITIONS.get(capa.current_phase, [])
        if target_phase not in allowed:
            return capa, (
                f"Cannot transition from {capa.current_phase.value} to {target_phase.value}. "
                f"Allowed: {[p.value for p in allowed]}"
            )
        capa.current_phase = target_phase
        return capa, f"Phase advanced to {target_phase.value}"

    @classmethod
    def update_status(
        cls,
        capa: CAPAItem,
        new_status: CAPAStatus,
        effectiveness_verified: bool = False,
    ) -> tuple[CAPAItem, str]:
        """Update CAPA status with lifecycle validation.

        Returns:
            Tuple of (updated CAPAItem, status_message).
        """
        allowed = cls.STATUS_TRANSITIONS.get(capa.status, [])
        if new_status not in allowed:
            return capa, (
                f"Cannot transition from {capa.status.value} to {new_status.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )

        if new_status == CAPAStatus.IN_PROGRESS:
            capa.status = CAPAStatus.IN_PROGRESS

        elif new_status == CAPAStatus.CLOSED:
            capa.status = CAPAStatus.CLOSED
            capa.closed_at = datetime.now()

        elif new_status == CAPAStatus.VERIFIED:
            if not effectiveness_verified:
                return capa, "Cannot verify: effectiveness_verified must be True"
            capa.status = CAPAStatus.VERIFIED
            capa.effectiveness_verified = True
            capa.verified_at = datetime.now()

        elif new_status == CAPAStatus.OPEN:
            # Reopening
            capa.status = CAPAStatus.OPEN
            capa.closed_at = None
            capa.verified_at = None
            capa.effectiveness_verified = False

        return capa, f"Status updated to {new_status.value}"

    @staticmethod
    def add_action(capa: CAPAItem, action: str, completed: bool = False) -> CAPAItem:
        """Add an action to the CAPA item."""
        if completed:
            capa.actions_completed.append(action)
        else:
            capa.actions_planned.append(action)
        return capa

    @staticmethod
    def set_root_cause(capa: CAPAItem, root_cause: str) -> CAPAItem:
        """Set the root cause analysis result."""
        capa.root_cause = root_cause
        return capa

    @staticmethod
    def is_overdue(capa: CAPAItem, reference_date: date | None = None) -> bool:
        """Check if CAPA is past its target date and not yet closed."""
        if capa.target_date is None:
            return False
        if capa.status in (CAPAStatus.CLOSED, CAPAStatus.VERIFIED):
            return False
        ref = reference_date or date.today()
        return ref > capa.target_date

    @classmethod
    def get_summary(cls, capas: list[CAPAItem], reference_date: date | None = None) -> dict:
        """Generate summary statistics for a list of CAPAs."""
        ref = reference_date or date.today()
        return {
            "total": len(capas),
            "open": len([c for c in capas if c.status == CAPAStatus.OPEN]),
            "in_progress": len([c for c in capas if c.status == CAPAStatus.IN_PROGRESS]),
            "closed": len([c for c in capas if c.status == CAPAStatus.CLOSED]),
            "verified": len([c for c in capas if c.status == CAPAStatus.VERIFIED]),
            "overdue": len([c for c in capas if cls.is_overdue(c, ref)]),
            "corrective": len([c for c in capas if c.capa_type == CAPAType.CORRECTIVE]),
            "preventive": len([c for c in capas if c.capa_type == CAPAType.PREVENTIVE]),
            "by_phase": {
                phase.value: len([c for c in capas if c.current_phase == phase])
                for phase in PDCAPhase
            },
        }
