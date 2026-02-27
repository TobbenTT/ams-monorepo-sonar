"""Planner Engine — generates AI recommendations for work requests.

Checks workforce availability, material inventory, shutdown windows,
production impact, backlog groupability, and risk assessment.
Returns PlannerRecommendation with suggested action (APPROVE/MODIFY/ESCALATE/DEFER).

Deterministic — no LLM required.
"""

from datetime import datetime, date, timedelta

from tools.models.schemas import (
    StructuredWorkRequest, PlannerRecommendation,
    ResourceAnalysis, WorkforceAvailability, MaterialsStatus, MissingMaterial,
    ShutdownWindow, ProductionImpact, SchedulingSuggestion, RiskAssessment,
    PlannerAction, RiskLevel, ShiftType, Priority, ShutdownType,
)


class PlannerEngine:
    """Generates planner recommendations for validated work requests."""

    @staticmethod
    def recommend(
        work_request: StructuredWorkRequest,
        workforce: list[dict],
        inventory: list[dict],
        shutdowns: list[dict],
        backlog: list[dict],
    ) -> PlannerRecommendation:
        """
        Analyse a work request against available resources and generate recommendation.

        Args:
            work_request: The structured work request to analyse.
            workforce: List of dicts {worker_id, name, specialty, shift, available, certifications}.
            inventory: List of dicts {material_code, description, quantity_available, warehouse}.
            shutdowns: List of dicts {shutdown_id, start_date, end_date, type, areas, description}.
            backlog: List of dicts {backlog_id, equipment_tag, priority, specialties, shutdown_required}.
        """
        # 1. Analyse workforce availability
        workforce_analysis = _analyse_workforce(
            work_request.ai_classification.required_specialties, workforce
        )

        # 2. Check material availability
        materials_status = _check_materials(work_request.spare_parts_suggested, inventory)

        # 3. Find next shutdown window
        shutdown_window = _find_shutdown_window(shutdowns)

        # 4. Estimate production impact
        production_impact = _estimate_production_impact(work_request)

        # 5. Find groupable backlog items
        groupable = _find_groupable(work_request, backlog)

        # 6. Determine scheduling suggestion
        scheduling = _suggest_schedule(
            work_request, workforce_analysis, materials_status, shutdown_window, groupable
        )

        # 7. Assess risk
        risk = _assess_risk(work_request, materials_status, workforce_analysis)

        # 8. Determine recommended action
        action, confidence = _determine_action(
            work_request, materials_status, workforce_analysis, risk
        )

        resource_analysis = ResourceAnalysis(
            workforce_available=workforce_analysis,
            materials_status=materials_status,
            shutdown_window=shutdown_window,
            production_impact=production_impact,
        )

        return PlannerRecommendation(
            work_request_id=work_request.request_id,
            generated_at=datetime.now(),
            resource_analysis=resource_analysis,
            scheduling_suggestion=scheduling,
            risk_assessment=risk,
            planner_action_required=action,
            ai_confidence=confidence,
        )


def _analyse_workforce(
    required_specialties: list[str], workforce: list[dict]
) -> list[WorkforceAvailability]:
    results = []
    for spec in required_specialties:
        available = [
            w for w in workforce
            if w.get("specialty", "").upper() == spec.upper() and w.get("available", False)
        ]
        results.append(WorkforceAvailability(
            specialty=spec,
            technicians_available=len(available),
            next_available_slot=datetime.now() + timedelta(days=1 if available else 3),
        ))
    return results


def _check_materials(
    spare_parts: list, inventory: list[dict]
) -> MaterialsStatus:
    if not spare_parts:
        return MaterialsStatus(all_available=True, missing_items=[])

    inventory_index = {item.get("material_code", ""): item for item in inventory}
    missing = []

    for part in spare_parts:
        code = part.sap_material_code
        inv = inventory_index.get(code)
        if not inv or inv.get("quantity_available", 0) < part.quantity_needed:
            missing.append(MissingMaterial(
                material_code=code,
                description=part.description,
                estimated_arrival=date.today() + timedelta(days=14),
                alternative_available=False,
            ))

    return MaterialsStatus(
        all_available=len(missing) == 0,
        missing_items=missing,
    )


def _find_shutdown_window(shutdowns: list[dict]) -> ShutdownWindow:
    future = []
    today = date.today()
    for sd in shutdowns:
        start = sd.get("start_date")
        if isinstance(start, str):
            start = date.fromisoformat(start)
        if start and start >= today:
            future.append(sd)

    future.sort(key=lambda s: s.get("start_date", ""))

    if future:
        sd = future[0]
        start = sd.get("start_date")
        if isinstance(start, str):
            start = date.fromisoformat(start)
        end = sd.get("end_date")
        if isinstance(end, str):
            end = date.fromisoformat(end)
        sd_type = sd.get("type", "MINOR_8H")
        duration = (end - start).total_seconds() / 3600 if start and end else 8.0
        return ShutdownWindow(
            next_available=datetime.combine(start, datetime.min.time()) if start else None,
            type=ShutdownType(sd_type) if sd_type in [e.value for e in ShutdownType] else ShutdownType.MINOR_8H,
            duration_hours=duration,
        )

    return ShutdownWindow(next_available=None, type=None, duration_hours=None)


def _estimate_production_impact(wr: StructuredWorkRequest) -> ProductionImpact:
    duration = wr.ai_classification.estimated_duration_hours
    is_emergency = wr.ai_classification.priority_suggested == Priority.EMERGENCY
    return ProductionImpact(
        estimated_downtime_hours=duration if is_emergency else duration * 0.5,
        production_loss_tons=duration * 10.0 if is_emergency else None,
        cost_estimate_usd=duration * 5000.0 if is_emergency else duration * 1000.0,
    )


def _find_groupable(wr: StructuredWorkRequest, backlog: list[dict]) -> list[str]:
    eq_tag = wr.equipment_identification.equipment_tag
    area = "-".join(eq_tag.split("-")[:2]) if "-" in eq_tag else eq_tag
    groupable = []
    for item in backlog:
        item_tag = item.get("equipment_tag", "")
        item_area = "-".join(item_tag.split("-")[:2]) if "-" in item_tag else item_tag
        if item_area == area:
            groupable.append(item.get("backlog_id", ""))
    return groupable


def _suggest_schedule(
    wr: StructuredWorkRequest,
    workforce: list[WorkforceAvailability],
    materials: MaterialsStatus,
    shutdown: ShutdownWindow,
    groupable: list[str],
) -> SchedulingSuggestion:
    conflicts = []

    # Determine earliest date based on constraints
    earliest = date.today() + timedelta(days=1)

    all_workforce_ok = all(w.technicians_available > 0 for w in workforce)
    if not all_workforce_ok:
        earliest = date.today() + timedelta(days=3)
        conflicts.append("Workforce not immediately available")

    if not materials.all_available:
        earliest = date.today() + timedelta(days=14)
        conflicts.append(f"{len(materials.missing_items)} material(s) not in stock")

    # Emergency overrides scheduling
    if wr.ai_classification.priority_suggested == Priority.EMERGENCY:
        earliest = date.today()
        conflicts = [c for c in conflicts if "Workforce" not in c]

    reasoning_parts = []
    if wr.ai_classification.priority_suggested in (Priority.EMERGENCY, Priority.URGENT):
        reasoning_parts.append(f"Priority {wr.ai_classification.priority_suggested.value} requires expedited scheduling.")
    if materials.all_available:
        reasoning_parts.append("All materials available.")
    else:
        reasoning_parts.append("Materials procurement needed.")
    if all_workforce_ok:
        reasoning_parts.append("Workforce available.")
    if groupable:
        reasoning_parts.append(f"Can be grouped with {len(groupable)} backlog item(s).")

    return SchedulingSuggestion(
        recommended_date=earliest,
        recommended_shift=ShiftType.MORNING,
        reasoning=" ".join(reasoning_parts) if reasoning_parts else "Standard scheduling.",
        conflicts=conflicts,
        groupable_with=groupable,
    )


def _assess_risk(
    wr: StructuredWorkRequest,
    materials: MaterialsStatus,
    workforce: list[WorkforceAvailability],
) -> RiskAssessment:
    risk_factors = []

    has_safety = len(wr.ai_classification.safety_flags) > 0
    is_high_priority = wr.ai_classification.priority_suggested in (Priority.EMERGENCY, Priority.URGENT)
    materials_missing = not materials.all_available
    workforce_short = any(w.technicians_available == 0 for w in workforce)

    if has_safety:
        risk_factors.append("Safety flags present — requires immediate attention")
    if is_high_priority:
        risk_factors.append(f"High priority ({wr.ai_classification.priority_suggested.value})")
    if materials_missing:
        risk_factors.append(f"{len(materials.missing_items)} material(s) unavailable")
    if workforce_short:
        risk_factors.append("Required specialty has no available technicians")

    # Determine risk level
    score = sum([
        has_safety * 3,
        is_high_priority * 2,
        materials_missing * 1,
        workforce_short * 1,
    ])

    if score >= 5:
        level = RiskLevel.CRITICAL
        rec = "Immediate escalation required. Safety and resource issues must be resolved."
    elif score >= 3:
        level = RiskLevel.HIGH
        rec = "Expedite material procurement and workforce allocation."
    elif score >= 1:
        level = RiskLevel.MEDIUM
        rec = "Monitor material arrival and workforce scheduling."
    else:
        level = RiskLevel.LOW
        rec = "Standard processing. No significant risk factors identified."
        risk_factors.append("No significant risk factors")

    return RiskAssessment(
        risk_level=level,
        risk_factors=risk_factors,
        recommendation=rec,
    )


def _determine_action(
    wr: StructuredWorkRequest,
    materials: MaterialsStatus,
    workforce: list[WorkforceAvailability],
    risk: RiskAssessment,
) -> tuple[PlannerAction, float]:
    """Determine recommended planner action and confidence."""
    has_safety = len(wr.ai_classification.safety_flags) > 0
    is_emergency = wr.ai_classification.priority_suggested == Priority.EMERGENCY

    # Escalate safety emergencies
    if has_safety and is_emergency:
        return PlannerAction.ESCALATE, 0.95

    # Defer if materials are missing and not urgent
    if not materials.all_available and wr.ai_classification.priority_suggested == Priority.PLANNED:
        return PlannerAction.DEFER, 0.80

    # Modify if workforce shortage
    all_workforce_ok = all(w.technicians_available > 0 for w in workforce)
    if not all_workforce_ok:
        return PlannerAction.MODIFY, 0.70

    # Approve if everything is available
    if materials.all_available and all_workforce_ok:
        return PlannerAction.APPROVE, 0.85

    # Default: approve with lower confidence
    return PlannerAction.APPROVE, 0.60
