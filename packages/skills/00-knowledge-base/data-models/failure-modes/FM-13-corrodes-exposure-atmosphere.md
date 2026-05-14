# FM-13: Corrodes due to Exposure to atmosphere

> **Combination**: 13 of 72
> **Mechanism**: Corrodes
> **Cause**: Exposure to atmosphere
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — atmospheric corrosion progresses with cumulative exposure time; rate is relatively constant for a given location and protection system
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 1.5–2.5 (wear-out), η 30,000–100,000 hours depending on atmospheric corrosivity category (ISO 9223 C1-CX), material, and coating protection

## Physical Degradation Process

Atmospheric corrosion is the electrochemical deterioration of metals caused by their exposure to the natural atmosphere. It differs from corrosion in immersion or process environments because the electrolyte is a thin moisture film (typically 10–100 μm thick) formed by rain, dew, condensation, or hygroscopic absorption of humidity by surface contaminants. This thin-film electrolyte is highly aerated (dissolved oxygen readily available from the atmosphere), making cathodic reaction rates high and corrosion rapid compared to immersed conditions where oxygen must diffuse through a thick liquid layer. Atmospheric corrosion is the single largest cause of metallic material degradation worldwide, responsible for more tonnage loss than all other corrosion forms combined.

The atmospheric corrosion rate is governed by the time-of-wetness (ToW) — the fraction of time that the surface is covered by a corrosive moisture film. ToW depends on: relative humidity (corrosion initiates above the critical humidity of ~60% RH for clean steel, but as low as 35% RH for salt-contaminated surfaces); temperature cycling (condensation forms when surface temperature drops below the dew point, particularly during morning warming cycles); rainfall (washes contaminants from sheltered surfaces, but deposits contaminants on others); and sheltering (rain-sheltered but unventilated surfaces accumulate chlorides and sulfates without being washed, creating severe localized attack). The corrosion rate is amplified by airborne contaminants: chlorides from marine aerosol deposit as hygroscopic salts that absorb moisture at low humidity and create highly conductive electrolyte films; sulfur dioxide (SO₂) from industrial emissions forms sulfuric acid on wet surfaces; and phosphate dust forms weak phosphoric acid when wetted.

In OCP's Moroccan environment, atmospheric corrosion conditions span a wide range per ISO 9223: coastal facilities (Jorf Lasfar — C4/C5, Safi — C4/C5) experience high chloride deposition rates (60–300 mg/m²/day) combined with high humidity from Atlantic maritime influence (annual average RH 70–80%), making steel corrosion rates 50–200 μm/year for unprotected carbon steel; inland mining sites (Khouribga — C3/C4, Benguerir — C3, Youssoufia — C3) have lower humidity and negligible marine chloride but experience phosphate dust deposition and higher temperature extremes; all sites share intense UV radiation (contributing to coating degradation per FM-32) and periodic sand/dust storms that abrade protective coatings. The combination of marine chloride and industrial phosphate emissions at Jorf Lasfar creates one of the most aggressive atmospheric corrosion environments in North Africa.

## Detectable Symptoms (P Condition)

- Progressive surface rust formation (carbon steel: uniform orange-brown → lamellar scaling → deep pitting)
- Coating system degradation: chalking, checking, cracking, blistering, and delamination sequence
- Paint under-film corrosion (creepage from scribe or damaged areas — measurable per ASTM D1654)
- Galvanized surface white rust (zinc hydroxide) → red rust breakthrough at consumed areas
- Aluminum surface pitting under white aluminum oxide deposits (filiform corrosion under coatings)
- Stainless steel tea-staining and pitting in marine atmosphere (particularly ferritic and 304 grades)
- Section loss measurable by caliper or UT at sheltered, unwashed surfaces (worst case locations)
- Fastener deterioration — thread profile loss, nut binding, bolt head section reduction

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Structural steel (ST) | All outdoor steel structures — pipe racks, platforms, equipment supports | Columns, beams, bracing, base plates, handrails, stairways, grating |
| Storage tanks (TA) | Atmospheric storage tanks (external surfaces) | External shell plates, roof plates, wind girders, stairway stringers, nozzle necks |
| Piping (PI) | External surface of all outdoor piping (not CUI — see FM-10) | Pipe external surface, pipe supports, spring hangers, expansion loops |
| Cranes (CR) | Outdoor gantry cranes, portal cranes, tower cranes | Structural boom/jib, platform steelwork, festoon systems, rail |
| Conveyors (CV) | ET-BELT-CONVEYOR outdoor structures, transfer towers | Structural frame, chute plates, guard panels, walkway stringers |
| Electrical installations (EI) | Outdoor switchgear, transformer structures, cable trays | Enclosure external surfaces, cable tray, support brackets, bus bar connections |
| Civil structures (CS) | Reinforced concrete exposed to atmosphere | Rebar (through concrete carbonation or chloride ingress), anchor bolts, embedments |
| Vehicles/mobile (VH) | Mobile equipment, haul trucks, front-end loaders | Frame, body panels, hydraulic cylinder rods, exposed linkages |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual coating and corrosion condition assessment | 6–12 months | ASTM D610, ISO 4628 series |
| Physical Effects | Coating thickness measurement (DFT remaining) | 12–24 months | SSPC-PA 2, ISO 19840 |
| Physical Effects | Coating adhesion testing (pull-off) | 12–24 months | ASTM D4541, ISO 4624 |
| Physical Effects / NDT | UT thickness at critical structural sections | 12–24 months | API 574, AS 4100 |
| Chemical Effects | Atmospheric corrosivity classification (coupon survey) | 12 months | ISO 9223, ISO 9226 |
| Physical Effects | Visual/dimensional inspection of fastener condition | 12–24 months | AS 4100, AS/NZS 1252 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Assess coating condition on Outdoor Structure [{tag}]`
- **Acceptable limits**: Coating rusting ≤rating 7 per ASTM D610 (Ri 2 per ISO 4628-3). Coating DFT ≥50% of original specified thickness. Adhesion ≥3.0 MPa per ASTM D4541. Galvanized coating ≥50 μm remaining zinc. No visible substrate pitting under coating defects. Structural steel section within 90% of original per AS 4100 capacity calculation.
- **Conditional comments**: If coating rating 5–7 (ASTM D610): plan maintenance painting (spot repair at defects, overcoat intact areas) within 12 months. If coating rating <5 or adhesion <2.0 MPa: plan full recoating with surface preparation to Sa 2½ per ISO 8501-1 at next shutdown. If substrate pitting >0.5 mm: assess structural capacity, fill pits with weld metal or epoxy before recoating. If galvanized coating consumed >50%: plan overcoating with organic zinc-rich primer system. If rebar corrosion suspected (concrete cracking/spalling): half-cell potential survey, concrete repair per ACI 318.

### Fixed-Time (for systematic coating maintenance)

- **Task**: `Repaint outdoor steelwork on [{tag}]`
- **Interval basis**: Develop site-specific coating maintenance program based on ISO 9223 corrosivity category: C3 sites (Benguerir, Youssoufia) — full recoat every 12–15 years, maintenance painting every 5–7 years; C4 sites (Khouribga) — full recoat every 8–12 years, maintenance painting every 4–6 years; C5 sites (Jorf Lasfar, Safi) — full recoat every 6–8 years, maintenance painting every 3–4 years. Use ISO 12944-5 coating systems appropriate to corrosivity category (minimum C5-M system for coastal: zinc primer + epoxy + polyurethane, ≥320 μm DFT). Annual coating condition survey to prioritize areas.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for low-cost, non-structural items where atmospheric corrosion affects appearance only (nameplates, non-structural brackets, ground-level guards with easy access for replacement). NOT acceptable for structural load-bearing members, pressure boundaries, safety-critical connections, or any component where section loss creates structural, functional, or safety risk. Use weathering steel (Corten) only in low-chloride environments (not suitable for OCP coastal sites).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — FT strategy with calendar basis]*
