# FM-10: Corrodes due to Corrosive environment

> **Combination**: 10 of 72
> **Mechanism**: Corrodes
> **Cause**: Corrosive environment
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — environmental corrosion is progressive with time; rate depends on environment severity, material selection, and protective measures
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 2.0–3.0 (wear-out), η 15,000–80,000 hours depending on environment classification, material, and coating/protection system

## Physical Degradation Process

Corrosion due to a corrosive environment occurs when the general operating environment — rather than a specific process chemical or discrete corrosion mechanism — subjects equipment to sustained electrochemical attack. The corrosive environment encompasses the combined effects of humidity, temperature, airborne contaminants (chlorides, sulfates, industrial pollutants), process spillage, and splash zones that collectively create aggressive conditions for metallic and non-metallic materials. Unlike direct chemical attack (FM-09) which involves contact with concentrated process chemicals, environmental corrosion results from ambient conditions that affect all exposed equipment and structures.

The dominant environmental corrosion mechanism is aqueous electrochemical corrosion: moisture (from humidity, rain, condensation, or process splashing) forms a thin electrolyte film on metal surfaces; dissolved oxygen in the electrolyte drives the cathodic reaction; metal ions dissolve at anodic sites; and the resulting corrosion products (rust for carbon steel, verdigris for copper, white rust for galvanized steel) progressively consume the base material. The corrosion rate is strongly influenced by: relative humidity (corrosion rate increases sharply above 60% RH and accelerates above 80% RH); temperature (higher temperature increases reaction rate but reduces oxygen solubility — net effect depends on balance); chloride concentration in the atmosphere (salt spray deposits create highly conductive, deliquescent electrolyte films); and pH of any surface deposits or condensation.

In OCP phosphate processing, the corrosive environment is notably severe and varies by site: coastal facilities (Jorf Lasfar, Safi) face marine atmosphere corrosion with chloride deposition rates of 60–300 mg/m²/day (ISO 9223 category C4–C5), combined with phosphoric acid mist from process operations; inland mining facilities (Khouribga, Benguerir, Youssoufia) experience lower chloride but suffer from phosphate dust deposition that becomes corrosive when moistened by dew or rain (phosphoric acid formation); all OCP sites experience process spillage zones around acid plants, slurry areas, and fertilizer handling where the ground-level environment is far more aggressive than the ambient atmosphere; and seasonal temperature swings (5–45°C) cause condensation on equipment surfaces during morning temperature rises, providing the electrolyte for corrosion reactions.

## Detectable Symptoms (P Condition)

- Visible rust formation on carbon steel surfaces (surface rust → pitting → laminar scaling)
- Paint system degradation: blistering (ASTM D714), rusting through paint (ASTM D610), adhesion loss
- Galvanized coating consumption (white rust formation, base metal red rust breakthrough)
- Structural steel section loss measurable by UT or caliper at connections and crevices
- Fastener corrosion (bolt head/nut deterioration, loss of thread profile)
- Electrical enclosure corrosion compromising IP rating (moisture ingress through corroded seals)
- Instrument tubing and cable tray corrosion (pitting, perforation of thin-wall materials)
- Concrete reinforcement corrosion causing spalling and rebar section loss

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Structural steel (ST) | Equipment support structures, pipe racks, platforms, handrails | Steel beams/columns, bracing, gusset plates, base plates, fasteners |
| Piping (PI) | Outdoor piping, pipe supports, piping in splash zones | External pipe surface, pipe supports, hangers, spring cans, insulation jacketing |
| Electrical installations (EI) | MCC buildings, transformer yards, cable trays, junction boxes | Enclosures, cable tray, conduit, grounding connections, bus bars |
| Storage tanks (TA) | Atmospheric tanks, day tanks, outdoor process tanks | External shell, roof, wind girders, stairways, nozzle projections |
| Conveyors (CV) | ET-BELT-CONVEYOR outdoor structures, transfer towers | Structural framework, chutes, guards, idler frames, walkways |
| Cranes (CR) | Outdoor gantry cranes, portal cranes at Jorf Lasfar port | Structural members, rail, electrical festoon, hoist housing |
| Civil structures (CS) | Concrete foundations, retaining walls, pipe sleepers | Reinforcing steel (rebar), anchor bolts, embedded plates, expansion joints |
| Instruments (ID) | Outdoor transmitters, analyzers, control valve actuators | Instrument housings, impulse tubing, junction boxes, cable glands |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual coating condition assessment | 6–12 months | ASTM D610 (rusting), ASTM D714 (blistering) |
| Physical Effects / NDT | UT thickness of structural steel at critical sections | 12–24 months | API 574, AS 4100 |
| Physical Effects | Coating adhesion and thickness measurement | 12–24 months | ASTM D4541, SSPC-PA 2, ISO 19840 |
| Chemical Effects | Atmospheric corrosivity monitoring (corrosion coupons) | 12 months | ISO 9226, ISO 9223 |
| Physical Effects / NDT | Concrete half-cell potential survey (rebar corrosion) | 24–60 months | ASTM C876 |
| Human Senses | Structural inspection for section loss and deterioration | 12–24 months | AS 4100, AISC 360 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect coating condition on Structure [{tag}]`
- **Acceptable limits**: Paint system: rusting ≤rating 6 per ASTM D610, blistering ≤rating 6 per ASTM D714, adhesion ≥3.5 MPa per ASTM D4541. Galvanized coating: ≥50 μm remaining zinc thickness. Structural steel: section loss <10% of original thickness. Fasteners: no visible thread deterioration, torque maintainable. Electrical enclosures: IP rating maintained (no visible corrosion holes or seal failure).
- **Conditional comments**: If coating rated <6 (ASTM D610): plan spot repair within 6 months using compatible coating system. If coating failed and substrate corroding: plan full recoating at next shutdown (surface prep to Sa 2½ per ISO 8501-1). If structural section loss 5–10%: engineer assessment for continued service, plan reinforcement or member replacement. If section loss >10%: immediate de-rating or temporary reinforcement, plan replacement. If electrical enclosure corroded: replace enclosure or apply repair, restore IP rating.

### Fixed-Time (for coating renewal programs)

- **Task**: `Repaint structural steelwork on [{tag}]`
- **Interval basis**: Coating system life depends on atmospheric category per ISO 9223: C3 (medium) 10–15 years; C4 (high — inland OCP sites) 7–10 years; C5 (very high — Jorf Lasfar, Safi coastal) 5–8 years. Use high-durability coating systems: zinc-rich primer + epoxy intermediate + polyurethane topcoat (minimum 250 μm DFT) per ISO 12944-5. Galvanized steel: expect 15–25 years at C4, 8–15 years at C5, plan duplex coating (galvanize + paint) for C5 environments. Annual coating condition survey to prioritize worst areas.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for low-cost, easily replaced items where corrosion is cosmetic or where replacement cost is less than maintenance cost (e.g., grating clips, small brackets, nameplates, sacrificial coatings on ground-level equipment). NOT acceptable for structural load-bearing members, pressure boundaries, electrical enclosures protecting critical equipment, or any component where section loss creates safety or functional risk.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
