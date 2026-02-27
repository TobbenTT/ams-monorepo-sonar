# FM-53: Overheats/Melts due to Relative movement between contacting surfaces

> **Combination**: 53 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Relative movement between contacting surfaces
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — progressive development as alignment degrades, clearances change, or contact conditions evolve with cumulative operating time
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 1.5–3.0 (gradual wear-out), η 5,000–25,000 hours depending on contact conditions, alignment quality, and material pair

## Physical Degradation Process

Overheating due to relative movement between contacting surfaces occurs when components that should be either stationary relative to each other or moving with a designed lubricant film develop unintended sliding, rubbing, or oscillating contact that generates frictional heat. The heat generation rate is proportional to the friction coefficient, normal force, and relative velocity (Q = μ × F × v). When the heat generation exceeds the assembly's heat dissipation capacity, temperature rises to levels that damage materials, lubricants, and adjacent components.

Key mechanisms include: fretting at interference fits (shaft-hub, bearing inner ring-shaft) where micro-oscillation under vibration generates localized heating and oxide debris; rubbing contact between rotating and stationary parts (labyrinth seal rub, impeller-casing contact, shaft-bearing housing rub); misalignment-induced coupling sliding (gear coupling tooth sliding, disc coupling flex element distortion); and brake/clutch surface heating from sustained slip or drag. The heat is highly localized at the contact interface — surface flash temperatures can reach hundreds of degrees above bulk temperature, causing localized melting, surface tempering, and metallurgical transformation even when average component temperature appears acceptable.

In OCP phosphate processing, relative-movement overheating is common in: mechanical seal faces on slurry pumps where shaft deflection from hydraulic loads creates angular misalignment and uneven face contact; coupling elements on mill drives where alignment degrades due to foundation settlement; brake discs on conveyor drives during sustained downhill braking (loaded conveyors on the decline from Khouribga to Jorf Lasfar); labyrinth seals on mill trunnions where thermal distortion reduces radial clearance; and fretting at bearing seat fits on equipment subject to high vibration.

## Detectable Symptoms (P Condition)

- Localized hot spots detectable by thermography at seal, coupling, or bearing locations
- Discoloration, heat marks, or temper colors on contacting surfaces (visible during inspection)
- Fretting corrosion (reddish-brown oxide powder) at interference fit surfaces
- Mechanical seal leakage rate increasing (face damage from overheating)
- Coupling element temperature elevated (check by touching or infrared after shutdown)
- Unusual burning smell near rotating equipment
- Vibration pattern showing rub-related symptoms (sub-synchronous whirl, truncated waveform)
- Audible rubbing or squealing sounds from contact zones

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP (CL-SEAL-MECHANICAL), ET-CENTRIFUGAL-PUMP | Mechanical seal faces, shaft sleeves, wear rings (rubbing contact) |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL trunnion seals, couplings | Trunnion labyrinth seals, main coupling, girth gear guard contact |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR brakes, couplings, pulley lagging | Brake disc/pad, fluid coupling, belt-pulley surface (tracking rub) |
| Compressors (CO) | Reciprocating compressors, screw compressors | Piston rings-cylinder, valve plates, shaft seals |
| Fans (FA) | ID/FD fans, process fans | Shaft seals, impeller tip clearance (casing rub), coupling |
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes | Gear tooth sliding contact, shaft seals, coupling alignment |
| Electric motors (EM) | Large motors with sleeve bearings | Shaft journal-bearing contact (during startup/shutdown), end shield rub |
| Turbines (TU) | Steam turbines (cogeneration) | Blade tip seals, labyrinth seals, journal bearings, coupling |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Thermography at seals, couplings, and bearing housings | 1–3 months | ISO 18434-1, NETA MTS |
| Vibration Effects | Vibration monitoring (rub detection — sub-synchronous) | 1–4 weeks | ISO 10816, ISO 7919 |
| Human Senses | Visual inspection for heat marks and fretting debris | 1–4 weeks | OEM manual, API 686 |
| Chemical Effects | Wear debris analysis in lubricant (ferrography) | 1–3 months | ASTM D7684, ISO 21018 |
| Temperature Effects | Seal face temperature monitoring (embedded RTD) | Continuous | API 682 |
| Primary Effects | Mechanical seal leakage monitoring | Daily–weekly | API 682 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor seal temperature on Pump [{tag}]`
- **Acceptable limits**: Seal face temperature ≤80°C (for standard elastomers per API 682). Coupling surface temperature ≤60°C above ambient. No visible fretting debris at bearing seats. Vibration rub indicators absent (no sub-synchronous components >25% of 1× amplitude). Mechanical seal leakage ≤permissible per API 682 Plan specification.
- **Conditional comments**: If seal temperature rising trend >5°C/month: investigate alignment, check flush plan function, plan seal inspection at next opportunity. If fretting detected at bearing fit: plan bearing replacement with correct interference fit per OEM specification, consider adhesive retention compound (Loctite 620). If coupling temperature elevated: check alignment (laser alignment to ≤0.05 mm offset, ≤0.05 mm/100 mm angularity per API 686). If brake disc overheating: adjust brake clearance, check brake release mechanism.

### Fixed-Time (for alignment verification)

- **Task**: `Verify alignment on Pump-Motor Set [{tag}]`
- **Interval basis**: Laser alignment check every 12 months for critical rotating equipment per API 686. After any foundation work, coupling replacement, or motor replacement: mandatory re-alignment before startup. Mechanical seal replacement: per OEM life expectancy or at major overhaul (typically 8,000–20,000 hours in slurry service). Brake pad/disc inspection every 6–12 months for conveyor brakes. Coupling element inspection at every major shutdown.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for mechanical seals on hazardous or environmentally sensitive fluids — overheating causes seal failure and process fluid release. NEVER acceptable for brakes — overheating causes brake fade and loss of stopping function. Acceptable only for non-critical, easily replaced wear elements (labyrinth seal strips, packing rings) where overheating damage is confined to the replaceable element and does not propagate to expensive components.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
