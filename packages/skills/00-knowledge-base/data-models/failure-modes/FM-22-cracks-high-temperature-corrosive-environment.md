# FM-22: Cracks due to High temperature in corrosive environment

> **Combination**: 22 of 72
> **Mechanism**: Cracks
> **Cause**: High temperature in corrosive environment
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — stress corrosion and high-temperature corrosion cracking develop progressively with cumulative exposure time
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 1.5–3.0 (gradual wear-out), η 10,000–50,000 hours depending on material, temperature, corrosive species, and stress level

## Physical Degradation Process

Cracking due to high temperature in a corrosive environment represents the synergistic combination of elevated temperature, corrosive chemical species, and mechanical stress — a combination far more damaging than any factor alone. The primary mechanisms are: stress corrosion cracking (SCC) where temperature accelerates both the electrochemical corrosion rate and the diffusion of corrosive species to the crack tip; high-temperature hydrogen attack (HTHA) where hydrogen at elevated temperature (>200°C) reacts with carbon in steel to form methane (CH₄), creating internal pressure that nucleates intergranular fissures; creep-fatigue interaction where elevated temperature reduces material strength while corrosion creates surface defects that initiate creep cracks; and polythionic acid cracking where sensitized stainless steel exposed to sulfur-containing environments cracks along chromium-depleted grain boundaries.

The temperature dependency is critical: most SCC mechanisms have a threshold temperature below which cracking does not occur. Chloride SCC of austenitic stainless steel requires >50°C; caustic SCC of carbon steel occurs above 65°C; HTHA threshold follows the Nelson curve (API 941); and polythionic acid cracking occurs during cooldown from operating temperature when sulfide deposits combine with atmospheric moisture.

In OCP phosphate processing, this failure mode is most significant at: Jorf Lasfar phosphoric acid plant where stainless steel equipment operates at 80–110°C in concentrated phosphoric acid containing chlorides from seawater contamination and fluorides from phosphate rock; sulfuric acid circuits where carbon steel operates above 65°C with trace caustic contamination at neutralization points; high-temperature zones on kilns at Khouribga where steel operates above the HTHA threshold in sulfur-containing gas environments; and stainless steel heat exchanger tubes in hot acid service where tube-side temperature fluctuations create cyclic thermal and corrosion stress.

## Detectable Symptoms (P Condition)

- SCC branching crack patterns detectable by DPI (characteristic highly branched, dendritic pattern)
- HTHA fissuring detectable by advanced UT (backscatter, velocity ratio, or AUBT techniques)
- Intergranular corrosion measurable by electrochemical potentiokinetic reactivation (EPR) testing
- Hardness change at weld HAZ indicating sensitization (measurable by portable hardness tester)
- Corrosion coupon analysis showing accelerated attack at elevated temperature
- Increasing corrosion rate from ER probes or LPR measurements above baseline
- Metallographic replica showing grain boundary attack, carbide precipitation, or micro-fissures
- Acoustic emission activity at welds and high-stress locations during operation

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pressure vessels (VE) | Phosphoric acid reactors, digesters, evaporators | Shell welds, nozzle-to-shell junctions, head-to-shell transition |
| Heat exchangers (HE) | Acid coolers, heat recovery exchangers, evaporator tubes | Tube-to-tubesheet welds, U-bend sections, baffle contact zones |
| Piping (PI) | Hot acid piping (316L/317L SS), carbon steel in caustic service | Butt welds (HAZ sensitization), branch connections, dead legs |
| Pumps (PU) | Hot acid pumps (duplex SS, Alloy 20, Hastelloy) | Casing welds, impeller, shaft (SCC at keyway) |
| Valves (VA) | High-temperature acid valves, caustic service valves | Body/bonnet welds, seat faces, stem (SCC under packing stress) |
| Storage tanks (TA) | Hot acid storage, caustic storage tanks | Shell plates, floor-to-shell welds, heating coil connections |
| Boilers (BO) | Waste heat boilers, steam generators | Tubes (caustic SCC at deposits), drum welds, downcomer connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | DPI for surface SCC crack detection | 6–12 months | ASME V Article 6, ISO 3452 |
| Physical Effects / NDT | Advanced UT for HTHA detection (AUBT, velocity ratio) | 12–24 months | API 941, API RP 941 |
| Physical Effects / NDT | Replica metallography for sensitization assessment | 12–24 months | ASTM E1351, ASTM A262 |
| Chemical Effects | Corrosion rate monitoring (ER probes, LPR, coupons) | Monthly–quarterly | NACE SP0775, ISO 11463 |
| Physical Effects / NDT | Phased array UT for crack sizing at welds | 6–12 months | ASME V Article 4 |
| Chemical Effects | Process fluid chemistry monitoring (Cl⁻, F⁻, pH, H₂S) | Weekly–monthly | Process specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform NDE on Acid Vessel Welds [{tag}]`
- **Acceptable limits**: No SCC indications per ASME VIII acceptance criteria. No HTHA fissuring per API 941 damage assessment. Sensitization degree within acceptable limits per ASTM A262 Practice A/C. Corrosion rate within design corrosion allowance (typically ≤0.5 mm/yr for stainless steel in acid, ≤1.0 mm/yr for carbon steel).
- **Conditional comments**: If SCC cracking detected: assess extent by UT mapping, plan weld repair using low-carbon or stabilized grade filler (316L/321/347) per ASME PCC-2. If HTHA fissuring suspected: de-rate vessel per API 579 Part 10, plan replacement with HTHA-resistant material (Cr-Mo steel per Nelson curve). If sensitization detected: solution anneal if feasible, or plan replacement with low-carbon grade (316L with C ≤0.03%). If corrosion rate increasing: review process chemistry, adjust inhibitor program.

### Fixed-Time (for risk-based inspection)

- **Task**: `Inspect hot acid piping weld joints [{tag}]`
- **Interval basis**: Per API 580/581 risk-based inspection methodology. High-susceptibility circuits (austenitic SS above 50°C with chlorides): inspect every 2–3 years. Carbon steel in caustic above 65°C: inspect every 3–5 years per API 571 (caustic SCC). Equipment above Nelson curve threshold: per API 941 damage mechanism review. Post-weld heat treatment verification after any repair welding. Material verification (PMI) every 5 years to confirm correct alloy in-service per API RP 578.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for any equipment in hot corrosive service — SCC and HTHA failures are sudden and catastrophic (vessel rupture, pipe burst, toxic release). No exceptions for this failure mode — the combination of high temperature and corrosion eliminates all material safety margins and cracking can progress from undetectable to critical within a single inspection interval.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects (NDT)], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with calendar basis]*
