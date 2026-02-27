# FM-11: Corrodes due to Crevice

> **Combination**: 11 of 72
> **Mechanism**: Corrodes
> **Cause**: Crevice
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — crevice corrosion progresses with time once initiated; rate accelerates as the crevice environment becomes increasingly acidic and depleted of oxygen
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 10,000–60,000 hours depending on crevice geometry, alloy composition (Mo content), chloride concentration, and temperature

## Physical Degradation Process

Crevice corrosion is a localized electrochemical corrosion mechanism that occurs within shielded areas where a stagnant solution volume exists between two surfaces — typically at gasket-to-flange interfaces, under deposits, beneath O-rings, at lap joints, under bolt heads, and anywhere two surfaces create a gap narrow enough (typically 0.025–0.1 mm) to restrict fluid exchange with the bulk environment. The mechanism follows the differential aeration model: oxygen in the stagnant crevice solution is consumed by initial corrosion reactions and cannot be replenished by diffusion from the bulk solution; this creates an oxygen concentration cell where the crevice interior becomes anodic (active) and the exterior surface becomes cathodic (protected).

As corrosion proceeds within the crevice, dissolved metal ions (Fe²⁺, Cr³⁺, Ni²⁺) hydrolyze, producing hydrogen ions that progressively acidify the crevice solution — pH can drop from neutral (7) to highly acidic (1–2) within the crevice. Simultaneously, chloride ions migrate into the crevice to balance the positive metal ion charge, dramatically increasing the local chloride concentration (often 3–10× the bulk concentration). This combination of low pH and high chloride concentration destroys the passive film on stainless steels and nickel alloys, causing rapid pitting-type attack within the crevice while the external surface remains protected and shows no deterioration. The insidious nature of crevice corrosion is that the external appearance gives no warning — severe crevice attack can exist beneath an apparently intact gasket or deposit.

In OCP phosphate processing, crevice corrosion is particularly aggressive because: phosphoric acid service creates chloride-containing, acidic environments where crevice initiation is rapid; seawater-cooled systems at Jorf Lasfar have high chloride content (≈19,000 ppm Cl⁻) that drives severe crevice attack on stainless steels at flange joints and under deposits; bolted connections in splash zones develop crevices under bolt heads/nuts and between flanges; gasket interfaces on acid piping and tanks experience crevice attack at the gasket-to-metal contact zone; and deposits from phosphate slurry and gypsum create under-deposit crevices on pipe walls, heat exchanger tube surfaces, and tank bottoms. Alloy selection is critical — molybdenum content determines crevice corrosion resistance: 316L (2% Mo) is marginal in warm chloride service, alloy 2205 (3% Mo) provides moderate resistance, and alloys 625/C-276 (>8% Mo) are required for severe crevice conditions.

## Detectable Symptoms (P Condition)

- Gasket face staining or deposit at outer edge of crevice (corrosion product seepage)
- Weeping or seepage at flanged joints (through-wall crevice attack at gasket line)
- Under-deposit pitting visible after cleaning (hemispherical pits with acidic deposits)
- Bolt/stud corrosion under washers or at bolt-to-flange interface
- Lap joint corrosion at weld overlay or clad edges (crevice at clad-to-base metal boundary)
- Tube-to-tubesheet joint leakage in heat exchangers (crevice at rolled/expanded joint)
- UT thickness loss concentrated at gasket contact line on flange faces
- pH paper test showing acidic conditions within crevice during inspection (<3 indicates active crevice corrosion)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Flanged acid piping, socket-welded connections, lined piping | Flange faces at gasket, socket weld crevice, lining termination points |
| Heat exchangers (HE) | Shell-and-tube exchangers in seawater/acid service | Tube-to-tubesheet joints, baffle-to-tube contacts, gasket faces |
| Pumps (PU) | Acid pumps with bolted casings, packed pumps | Casing split line, packing-to-shaft interface, wear ring crevice |
| Valves (VA) | Flanged valves in acid/chloride service | Bonnet-to-body joint, seat ring crevice, packing gland interface |
| Storage tanks (TA) | Acid tanks with nozzle reinforcing pads, bottom sumps | Reinforcing pad crevice, floor-to-shell crevice, sump joints |
| Pressure vessels (VE) | Reactors, columns with internal trays/baffles | Tray support ring crevice, nozzle-to-shell joints, internal attachment welds |
| Fasteners (FT) | Bolting in acid/seawater splash zones | Under bolt head, nut-to-flange, washer-to-flange, thread roots |
| Structural steel (ST) | Lap joints, stiffener-to-plate connections in splash zones | Lap joint overlap zone, stiffener toes, gusset plate connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | UT thickness at flange faces and gasket lines | 6–12 months | API 574, API 570 |
| Human Senses | Visual inspection for crevice corrosion indicators (staining, seepage) | 3–6 months | API 574, NACE SP0108 |
| Physical Effects / NDT | Tube-to-tubesheet inspection (eddy current, UT) | 12–24 months | ASME V Art. 8, ASTM E2096 |
| Physical Effects / NDT | Dye penetrant inspection of crevice zones (during maintenance) | During overhaul | ASME V Art. 6, ISO 3452 |
| Chemical Effects | Process fluid analysis for metal ion content (crevice dissolution indicator) | Monthly | ASTM D5185 |
| Physical Effects / NDT | Radiographic profile of flanged joints (wall loss at gasket) | 12–24 months | ASME V Art. 2 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect flange faces for crevice corrosion on [{tag}]`
- **Acceptable limits**: Flange face: no visible pitting or material loss at gasket contact zone, surface finish ≤6.3 μm Ra per ASME B16.5. Tube-to-tubesheet: no wall loss >20% at expanded zone per ASME PCC-2. Under-bolt-head: no visible pitting or section reduction. No seepage or weeping at any crevice location.
- **Conditional comments**: If crevice pitting <1 mm deep on flange face: machine flange face to restore finish, use improved gasket material (PTFE envelope or spiral wound with PTFE filler). If crevice pitting >1 mm: engineer assessment for flange repair or replacement, verify flange rating adequate with reduced thickness. If tube-to-tubesheet crevice corrosion: re-expand tubes per ASME PCC-2, consider seal welding for severe service. If recurring crevice corrosion: upgrade alloy to higher Mo content (minimum 3% Mo for chloride service, 6%+ for warm seawater).

### Fixed-Time (for crevice-prone joints)

- **Task**: `Inspect tube-to-tubesheet joints on Exchanger [{tag}]`
- **Interval basis**: Flanged joints in acid/chloride service: inspect flange faces at every gasket change (typically 2–4 years). Tube-to-tubesheet joints in seawater service: inspect every 2–3 years by eddy current. Bolting in splash zones: replace every 3–5 years with upgraded material (B8M Class 2 or alloy 625 bolting for chloride service). Use crevice-free design where possible: butt welds instead of socket welds, full-penetration welds instead of fillet welds, raised face flanges with proper gasket selection, tell-tale holes in reinforcing pads.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing crevice joints — localized through-wall attack causes leakage at unpredictable locations. NEVER acceptable for tube-to-tubesheet joints in heat exchangers handling hazardous fluids. Acceptable only for non-pressure, non-structural lap joints where crevice corrosion is cosmetic (e.g., architectural cladding overlaps, non-structural brackets).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
