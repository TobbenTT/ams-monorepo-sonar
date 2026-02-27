# FM-19: Cracks due to Age

> **Combination**: 19 of 72
> **Mechanism**: Cracks
> **Cause**: Age
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — age-induced cracking is progressive and time-dependent; crack initiation and growth rates are predictable based on material properties and environmental exposure
> **ISO 14224 Failure Mechanism**: 2.5 Breakage / 2.6 Fatigue
> **Weibull Guidance**: β typically 2.5–4.0 (wear-out), η 50,000–200,000 hours depending on material, environment, and stress intensity

## Physical Degradation Process

Cracking due to age occurs when materials deteriorate through time-dependent degradation mechanisms that eventually initiate and propagate cracks, even under normal operating stresses well below the yield strength. The primary aging mechanisms include: stress corrosion cracking (SCC) where the synergistic combination of tensile stress, corrosive environment, and susceptible material causes intergranular or transgranular crack growth over months to years; hydrogen embrittlement where atomic hydrogen from cathodic protection, corrosion reactions, or process environments diffuses into steel and reduces fracture toughness; creep cracking at elevated temperature where grain boundary sliding and void coalescence create intergranular cracks over thousands of hours; and polymer/elastomer aging where UV exposure, ozone, and thermal oxidation cause chain scission creating surface cracking and embrittlement.

The critical feature of age-related cracking is that it progresses below detectable thresholds for extended periods before becoming measurable — SCC cracks can grow for years at sub-critical rates before reaching critical size for rapid propagation. Material susceptibility is key: austenitic stainless steel is susceptible to chloride SCC above 50°C; high-strength steel (>1000 MPa UTS) is susceptible to hydrogen embrittlement; carbon steel is susceptible to carbonate/amine SCC in specific environments; and natural rubber/EPDM degrades through ozone cracking.

In OCP phosphate processing, age-related cracking is significant for: stainless steel piping and vessels in hot phosphoric acid service at Jorf Lasfar (chloride SCC from seawater-contaminated cooling circuits); rubber-lined equipment where linings crack and debond with age; elastomeric seals and gaskets on equipment throughout the process (EPDM, Viton, PTFE — all have finite shelf and service life); high-strength bolting on mill and crusher applications (hydrogen embrittlement risk from cathodic protection or acid exposure); and concrete structures at coastal sites where carbonation-induced rebar corrosion causes concrete cracking over decades.

## Detectable Symptoms (P Condition)

- Surface cracks visible during inspection (enhanced by DPI or MPI for metallic components)
- Elastomer surface crazing, checking, or hardening (visible by 10× magnification)
- Acoustic emission activity at stressed locations (crack growth events)
- Ultrasonic testing showing crack indications at known susceptible locations
- Loss of seal integrity (leakage through age-cracked gaskets or O-rings)
- Hardness increase in susceptible materials (embrittlement precursor for steel)
- Material elongation at break decreasing (tensile testing of sampled material)
- Concrete surface cracking with rust staining (indicating rebar corrosion beneath)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pressure vessels (VE) | Stainless steel acid vessels, carbon steel receivers | Shell/head welds (SCC), nozzle attachments, support skirts |
| Piping (PI) | Stainless steel acid piping, carbon steel process piping | Butt welds, branch connections, bends (residual stress zones) |
| Valves (VA) | Stainless steel acid valves, high-pressure valves | Body/bonnet welds, stem (hydrogen embrittlement), packing gland |
| Pumps (PU) | Acid pumps, seawater pumps (stainless steel) | Casing (SCC), shaft, impeller hub |
| Storage tanks (TA) | Acid storage tanks, brine tanks | Floor plates, shell-to-floor weld, roof-to-shell junction |
| Rubber-lined equipment (RL) | Rubber-lined piping, tanks, chutes | Rubber lining (age cracking, debonding), elastomeric expansion joints |
| Seals and gaskets (SG) | Process seals throughout the plant | O-rings, gaskets, mechanical seal elastomers, expansion joint bellows |
| Concrete structures (CS) | Coastal structures at Jorf Lasfar/Safi, acid bund walls | Reinforced concrete (carbonation cracking), acid-resistant coatings |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Dye penetrant inspection (DPI) for surface cracks | 6–24 months | ASME V Article 6, ISO 3452 |
| Physical Effects / NDT | Magnetic particle inspection (MPI) at welds | 6–24 months | ASME V Article 7, ISO 9934 |
| Physical Effects / NDT | Ultrasonic testing (TOFD, phased array) for subsurface cracks | 12–24 months | ASME V Article 4, ISO 16826 |
| Physical Effects / NDT | Acoustic emission monitoring | 12–24 months | ASTM E1932, EN 13554 |
| Human Senses | Visual inspection for surface cracking and deterioration | 1–6 months | API 574, API 510 |
| Physical Effects | Hardness testing (embrittlement detection) | 12–24 months | ASTM E110, ISO 6506 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform DPI on Vessel Weld Seams [{tag}]`
- **Acceptable limits**: No linear crack indications per ASME VIII Division 1 acceptance criteria. No SCC branching patterns. Elastomer Shore A hardness within ±15% of as-new specification per ASTM D2240. No visible surface cracking on rubber linings. Concrete carbonation depth <50% of cover depth per EN 14630.
- **Conditional comments**: If SCC crack found in stainless steel: assess extent by UT, plan weld repair or component replacement — SCC cracks propagate unpredictably and can cause sudden failure. If elastomer hardening >15% above as-new: plan replacement at next opportunity (brittle failure imminent). If hydrogen embrittlement suspected in high-strength bolts: replace entire bolt set with lower-strength grade or apply barrier coating. If concrete carbonation reaching rebar: apply re-alkalisation or cathodic protection per EN 12696.

### Fixed-Time (for age-limited components)

- **Task**: `Replace elastomeric seals on Valve [{tag}]`
- **Interval basis**: Elastomeric O-rings and gaskets: replace per material-specific shelf life + service life limits (EPDM: 5–10 years total; Viton: 10–15 years; PTFE: 15–20 years, per AS 568 and manufacturer data). Expansion joint bellows: replace every 10–15 years or per manufacturer's rated cycle life. Rubber linings: inspect at 5-year intervals, plan replacement at 10–15 years depending on service. Risk-based inspection (RBI) per API 580/581 to set inspection intervals for SCC-susceptible equipment.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment susceptible to SCC or hydrogen embrittlement — sudden brittle fracture has catastrophic consequences. Acceptable for non-critical elastomeric components where age cracking causes minor leakage with no safety, environmental, or significant production consequence (e.g., garden hose connections, non-process gaskets).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.6 — Scheduled Discard Tasks], [ISO 14224 Table B.2 — 2.5 Breakage, 2.6 Fatigue], [REF-01 §3.5 — FT strategy with calendar basis]*
