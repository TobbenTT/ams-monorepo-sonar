# FM-27: Degrades due to Chemical reaction

> **Combination**: 27 of 72
> **Mechanism**: Degrades
> **Cause**: Chemical reaction
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — chemical reaction products accumulate progressively, degrading material properties over time
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 2.0–3.0 (wear-out), η 10,000–50,000 hours depending on reactant concentration, temperature, and material susceptibility

## Physical Degradation Process

Degradation due to chemical reaction occurs when a component's own material undergoes a chemical transformation that progressively alters its composition and properties. Unlike chemical attack (FM-26) where an external agent dissolves or swells the material, chemical reaction degradation involves internal material transformation — the material reacts with environmental agents (oxygen, water, process chemicals) to form new compounds that are weaker, more brittle, or dimensionally different from the original material.

Key mechanisms include: oxidation of lubricating oils and greases (polymerization forms varnish and sludge, acid number increases, viscosity changes); vulcanization reversal in rubber (sulfur cross-links break down at elevated temperature, causing softening and loss of elasticity); carbonization of organic materials (thermal decomposition converts polymer to carbon at elevated temperature); cement hydration degradation (calcium hydroxide reacts with CO₂ to form calcium carbonate — carbonation — reducing alkalinity and initiating rebar corrosion); and chemical incompatibility reactions (mixing of incompatible lubricants forming gel or precipitate).

The distinction from FM-26 is that chemical reaction degradation can occur within the material itself (oil oxidation, rubber reversion) or between the material and normal atmospheric components (oxygen, CO₂, moisture), whereas FM-26 specifically involves attack by aggressive process chemicals. Chemical reactions are accelerated by temperature (Arrhenius relationship) and catalyzed by contamination (wear metals catalyze oil oxidation; copper accelerates rubber degradation).

In OCP phosphate processing, chemical reaction degradation is significant for: lubricating oils in high-temperature service (mill gearbox oil at 70–90°C oxidizes faster than in cooler applications); hydraulic fluids on mobile equipment at Khouribga (hot ambient + high-duty cycling); transformer oil (oxidation produces acids and sludge that degrade insulation); rubber components in ozone-rich environments (ozone attacks double bonds in unsaturated rubbers); and reinforced concrete structures at coastal sites where carbonation is accelerated by humidity and CO₂.

## Detectable Symptoms (P Condition)

- Oil analysis showing increasing acid number (TAN >2.0 mg KOH/g for industrial oils per ASTM D974)
- Oil color darkening beyond normal range (oxidation indicator)
- Varnish or sludge deposits visible on equipment surfaces during inspection
- Rubber surface tackiness or reversion (surface becomes sticky when heated)
- Concrete carbonation front advancing (phenolphthalein test showing depth >50% of cover)
- Oil viscosity change >20% from nominal (either increase from oxidation or decrease from thermal cracking)
- Dissolved gas analysis in transformer oil showing CO, CO₂ (cellulose degradation) or H₂ (partial discharge)
- Lubricant additive depletion below effective concentration

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes, crusher gearboxes | Lubricating oil, gear tooth surfaces (varnish), bearings (sludge) |
| Hydraulic systems (HY) | Mobile equipment hydraulics, process hydraulic presses | Hydraulic fluid, valve spools (varnish), actuator seals |
| Power transformers (PT) | Oil-filled transformers, oil circuit breakers | Transformer oil, cellulose insulation (paper), bushings |
| Compressors (CO) | Air compressors (oil-flooded), gas compressors | Compressor oil, air-oil separator element, valve seats |
| Pumps (PU) | Lubricated pumps, positive displacement pumps | Lubricating oil, bearing surfaces, mechanical seals |
| Rubber-lined equipment (RL) | Rubber-lined piping, conveyor lagging, seals | Rubber material (reversion at high temperature, ozone attack) |
| Concrete structures (CS) | Coastal structures, acid bund walls, equipment foundations | Concrete (carbonation), reinforcing steel (corrosion after carbonation) |
| Electrical installations (EI) | Cable insulation, switchgear insulation | PVC plasticizer migration, XLPE oxidation, SF₆ gas decomposition |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Chemical Effects | Oil analysis (TAN, viscosity, oxidation, wear metals) | 1–3 months | ASTM D974, D445, D6224, ISO 4406 |
| Chemical Effects | Dissolved gas analysis (transformer oil) | 6–12 months | IEEE C57.104, IEC 60599 |
| Chemical Effects | Concrete carbonation testing (phenolphthalein) | 2–5 years | EN 14630, BS 1881-210 |
| Human Senses | Visual inspection for varnish, sludge, discoloration | 1–6 months | OEM manual, industry practice |
| Chemical Effects | Oil additive analysis (remaining additive concentration) | 3–6 months | ASTM D5185, D4951 |
| Physical Effects | Rubber hardness/elasticity testing | 6–12 months | ASTM D2240, D395 |

## Maintenance Strategy Guidance

### Condition-Based (preferred for oil-lubricated equipment)

- **Primary task**: `Analyze lubricant condition on Gearbox [{tag}]`
- **Acceptable limits**: TAN ≤2.0 mg KOH/g (mineral oil) per ASTM D974. Viscosity within ±15% of nominal grade per ISO 3448. Oxidation ≤25 abs/cm per ASTM E2412 (FTIR). Water content ≤200 ppm per ASTM D6304. Particle count within target cleanliness per ISO 4406. No varnish deposits visible.
- **Conditional comments**: If TAN 2.0–4.0: plan oil change within 30 days, investigate root cause (overtemperature, contamination). If TAN >4.0: change oil immediately (acid attack on bearing surfaces). If varnish detected: chemical flush before refilling, investigate oil cooler effectiveness. If transformer DGA shows CO >300 ppm or CO₂/CO ratio <3: investigate cellulose degradation, assess remaining insulation life per IEEE C57.91.

### Fixed-Time (for oil change and material replacement)

- **Task**: `Change lubricating oil on Gearbox [{tag}]`
- **Interval basis**: Oil change per OEM recommendation OR oil analysis limits — whichever is first. Typical: mineral oil in gearboxes 3,000–8,000 hours; synthetic 8,000–15,000 hours; hydraulic fluid 3,000–5,000 hours; transformer oil: top-up or recondition per DGA results (no fixed interval for well-maintained oil). Rubber components in ozone-rich environments: inspect every 6 months, replace at 5–8 year calendar life. Concrete carbonation: resurvey every 2–5 years depending on progression rate; apply anti-carbonation coating when depth reaches 25% of cover.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for transformer oil or safety-critical lubricant systems. Acceptable for non-critical, small-volume lubricant applications where oil change is simple and economical (e.g., small gearboxes with ≤5L capacity, pillow block bearings) — but even then, a basic time-based change program is recommended.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Chemical Effects], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — CB strategy with calendar basis]*
