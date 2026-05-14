"""Life Cycle Cost (LCC) Calculator — Phase 5 (REF-13 §7.5.7 / ISO 15663-1).

Evaluates total ownership cost: acquisition + operation + maintenance + disposal.
NPV calculations for long-term cost comparison.

Deterministic — no LLM required.
"""

from tools.models.schemas import LCCInput, LCCResult


class LCCEngine:
    """Life Cycle Cost calculator per ISO 15663-1."""

    @staticmethod
    def calculate(inp: LCCInput) -> LCCResult:
        """Calculate total LCC with NPV.

        total_lcc = acquisition + installation + NPV(operating) + NPV(maintenance) - NPV(salvage)
        """
        r = inp.discount_rate
        life = inp.expected_life_years

        npv_operating = _npv_annuity(inp.annual_operating_cost, r, life)
        npv_maintenance = _npv_annuity(inp.annual_maintenance_cost, r, life)
        npv_salvage = inp.salvage_value / ((1 + r) ** life) if r > 0 and life > 0 else inp.salvage_value

        total_lcc = (
            inp.acquisition_cost
            + inp.installation_cost
            + npv_operating
            + npv_maintenance
            - npv_salvage
        )
        total_lcc = max(0.0, total_lcc)

        npv = npv_operating + npv_maintenance
        annualized = total_lcc / life if life > 0 else total_lcc

        if total_lcc > 0:
            acq_pct = ((inp.acquisition_cost + inp.installation_cost) / total_lcc) * 100
            op_pct = (npv_operating / total_lcc) * 100
            maint_pct = (npv_maintenance / total_lcc) * 100
        else:
            acq_pct = op_pct = maint_pct = 0.0

        if maint_pct > 50:
            recommendation = "Maintenance-dominant: consider reliability improvement or replacement"
        elif op_pct > 50:
            recommendation = "Operating-cost-dominant: optimize operational parameters"
        elif acq_pct > 50:
            recommendation = "Capital-dominant: evaluate lease/rental alternatives"
        else:
            recommendation = "Balanced cost profile"

        return LCCResult(
            equipment_id=inp.equipment_id,
            total_lcc=round(total_lcc, 2),
            npv=round(npv, 2),
            annualized_cost=round(annualized, 2),
            acquisition_pct=round(acq_pct, 1),
            operating_pct=round(op_pct, 1),
            maintenance_pct=round(maint_pct, 1),
            recommendation=recommendation,
        )

    @staticmethod
    def compare_alternatives(inputs: list[LCCInput]) -> list[LCCResult]:
        """Calculate LCC for each alternative, sort by total_lcc ascending."""
        results = [LCCEngine.calculate(inp) for inp in inputs]
        return sorted(results, key=lambda r: r.total_lcc)

    @staticmethod
    def find_breakeven(input_a: LCCInput, input_b: LCCInput) -> int | None:
        """Find the year where cumulative cost of A crosses B.

        Returns the breakeven year, or None if no crossover within max(life_a, life_b).
        """
        max_years = max(input_a.expected_life_years, input_b.expected_life_years)
        r_a = input_a.discount_rate
        r_b = input_b.discount_rate

        cum_a = input_a.acquisition_cost + input_a.installation_cost
        cum_b = input_b.acquisition_cost + input_b.installation_cost
        a_was_higher = cum_a > cum_b

        for year in range(1, max_years + 1):
            discount_a = 1 / ((1 + r_a) ** year)
            discount_b = 1 / ((1 + r_b) ** year)
            cum_a += (input_a.annual_operating_cost + input_a.annual_maintenance_cost) * discount_a
            cum_b += (input_b.annual_operating_cost + input_b.annual_maintenance_cost) * discount_b

            a_is_higher = cum_a > cum_b
            if a_is_higher != a_was_higher:
                return year

        return None


def _npv_annuity(annual_cost: float, rate: float, years: int) -> float:
    """Present value of an annuity."""
    if rate <= 0 or years <= 0:
        return annual_cost * years
    return annual_cost * (1 - (1 + rate) ** (-years)) / rate
