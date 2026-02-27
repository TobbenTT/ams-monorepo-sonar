# FM-08: Corrodes due to Bio-organisms

> **Combination**: 8 of 72
> **Mechanism**: Corrodes
> **Cause**: Bio-organisms
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — microbiologically influenced corrosion (MIC) progresses with time as biofilm colonies mature and create sustained corrosive micro-environments
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 15,000–60,000 hours depending on water chemistry, temperature, material, and biocide treatment effectiveness

## Physical Degradation Process

Microbiologically influenced corrosion (MIC) occurs when micro-organisms — primarily sulfate-reducing bacteria (SRB), iron-oxidizing bacteria (IOB), acid-producing bacteria (APB), and algae — colonize metal surfaces in aqueous environments and create localized corrosive conditions. The process begins with biofilm formation: planktonic bacteria attach to metal surfaces within hours of water contact, forming a structured biofilm matrix (extracellular polymeric substances — EPS) that traps nutrients, concentrates corrosive metabolic by-products, and shields the colony from bulk-water biocides. Within the biofilm, conditions differ radically from the bulk water: pH can drop to 2–3 under APB colonies, oxygen is depleted under aerobic biofilm layers creating differential aeration cells, and SRB generate hydrogen sulfide (H₂S) that attacks steel at rates of 1–5 mm/year — far exceeding normal corrosion rates.

The most damaging MIC mechanism in industrial systems is SRB-driven corrosion under anaerobic conditions. SRB use sulfate (SO₄²⁻) as a terminal electron acceptor, producing H₂S and bisulfide (HS⁻) that attack steel by depolarizing the cathodic reaction and forming iron sulfide (FeS) — a cathodic compound that accelerates galvanic corrosion of adjacent steel. The resulting pitting is characteristic: hemispherical pits with black FeS deposits and a distinctive sulfide odor. IOB create tubercles (rust mounds) over localized anodes, establishing oxygen concentration cells that drive under-deposit pitting. APB produce organic acids (acetic, formic, succinic) that directly attack metals and undermine passive films on stainless steels.

In OCP phosphate processing, MIC risk is present in: cooling water systems at Jorf Lasfar industrial complex (seawater-cooled and fresh water circuits provide ideal bacterial habitat); fire water systems with stagnant water in dead legs and seldom-used branches; slurry pipeline segments with low flow velocity allowing biofilm attachment; phosphoric acid storage tanks where extremophilic bacteria (acidophiles) survive in dilute acid conditions; and buried carbon steel piping in moist soil (soil bacteria, particularly near fertilizer plants where nutrient-rich soil promotes bacterial growth). The warm Moroccan climate (annual average 18–22°C) is ideal for mesophilic bacteria — the most aggressive MIC species operate optimally at 25–40°C.

## Detectable Symptoms (P Condition)

- Black FeS deposits under tubercles or biofilm (characteristic H₂S odor when disturbed)
- Localized pitting under deposits — hemispherical pits with smooth interior walls
- Rapid increase in planktonic or sessile bacterial counts (>10⁴ CFU/mL planktonic = concern)
- Biofilm visible on pipe/tank internal surfaces (slimy, colored deposits — green/brown/black)
- Increased corrosion coupon rates (>2× baseline) despite stable water chemistry
- Cooling water pH depression or sulfide detection at system outlets
- Fire water system showing rust-colored or black discharge at test outlets
- UT thickness loss concentrated at 6 o'clock position in horizontal pipes (biofilm settles by gravity)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Heat exchangers (HE) | Cooling water heat exchangers, condensers at Jorf Lasfar | Carbon steel tubes, tube sheets, water boxes, channel covers |
| Piping (PI) | Cooling water piping, fire water piping, buried piping | Internal pipe wall (6 o'clock pitting), dead legs, branch connections |
| Storage tanks (TA) | Fire water storage tanks, raw water tanks | Tank bottom plates, first course shell (water line), internal coatings |
| Pumps (PU) | Cooling water pumps, fire water pumps | Pump casing (volute), impeller, wear rings, seal chamber |
| Valves (VA) | Fire water valves, cooling water isolation valves | Valve body (internal), seat faces, stem packing area |
| Cooling towers (CT) | Jorf Lasfar cooling towers, evaporative condensers | Fill media, basin, distribution piping, structural supports |
| Fire protection (FP) | Sprinkler piping, fire hydrant systems, deluge systems | Sprinkler heads (blockage + corrosion), pipe internals, valve seats |
| Buried piping (PI) | Underground fire water, process water, drainage | External pipe surface (soil-side MIC), coating holidays, CP shielding |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Chemical Effects | Bacterial count monitoring (planktonic + sessile) | 1–3 months | NACE TM0194, ASTM D6974 |
| Chemical Effects | Sulfide/H₂S detection in water systems | 1–3 months | NACE SP0106 |
| Physical Effects / NDT | UT thickness at MIC-susceptible locations (6 o'clock) | 6–12 months | API 574, ASME B31.3 |
| Physical Effects / NDT | Internal visual inspection (borescope) for biofilm/tubercles | 12–24 months | NACE SP0775 |
| Chemical Effects | Corrosion coupon monitoring in water circuits | 3–6 months | NACE RP0775, ASTM G4 |
| Human Senses | Odor detection (H₂S) and visual inspection at access points | 1–3 months | Operator rounds |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor bacterial counts in Cooling Water System [{tag}]`
- **Acceptable limits**: Planktonic bacteria <10⁴ CFU/mL, sessile bacteria <10⁴ CFU/cm². Sulfide <0.5 mg/L in cooling water. Corrosion coupon rate <0.1 mm/year (carbon steel) or <0.025 mm/year (stainless steel). No visible biofilm on inspection coupons or borescope images. UT thickness ≥minimum per API 574 calculations.
- **Conditional comments**: If bacterial counts >10⁴ CFU/mL: review biocide treatment program, consider shock dosing (chlorine 5–10 ppm for 2 hours or non-oxidizing biocide per manufacturer). If sessile counts >10⁵ CFU/cm²: mechanical cleaning (pigging, hydroblasting) required — biocide alone cannot penetrate mature biofilm. If pitting detected by UT: increase monitoring frequency to quarterly, engineer fitness-for-service assessment per API 579. If fire water system shows MIC indicators: flush system, apply biocide treatment, inspect sprinkler heads for blockage.

### Fixed-Time (for biocide treatment and inspection)

- **Task**: `Inspect fire water piping internals for MIC on [{tag}]`
- **Interval basis**: Cooling water biocide treatment: continuous (oxidizing) + periodic shock (non-oxidizing, quarterly). Fire water system flush and inspection: annually per NFPA 25. Buried piping CP survey: annually per NACE SP0169. Internal inspection of cooling water exchangers: every 2–3 years during turnaround. Corrosion coupon retrieval and analysis: every 90 days. Dead leg elimination or periodic flushing: quarterly for fire water, monthly for cooling water dead legs >3 pipe diameters long.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment (piping, vessels, exchangers) — MIC pitting causes through-wall penetration with leak/rupture risk. NEVER acceptable for fire water systems — MIC blockage of sprinkler heads compromises fire protection. Acceptable only for non-critical, easily replaced sacrificial components in water systems (corrosion coupons, sacrificial anodes) where failure is the intended monitoring mechanism.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Chemical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
