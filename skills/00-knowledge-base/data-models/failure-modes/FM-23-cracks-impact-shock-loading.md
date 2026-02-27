# FM-23: Cracks due to Impact/shock loading

> **Combination**: 23 of 72
> **Mechanism**: Cracks
> **Cause**: Impact/shock loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — impact events are unpredictable; crack initiation depends on random impact energy, material toughness, and existing defects
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on impact frequency and material fracture toughness

## Physical Degradation Process

Cracking due to impact or shock loading occurs when a sudden high-energy mechanical event generates stresses exceeding the material's dynamic fracture toughness at the point of impact, initiating a crack. Unlike fatigue cracking (FM-20) which requires many sub-critical cycles, impact cracking can initiate from a single event if the impact energy is sufficient. The crack may propagate partially through the section and arrest (if the material is tough enough to absorb the remaining energy), creating a dormant crack that may later grow under service loads, or it may propagate to complete fracture if the material is brittle.

Impact crack susceptibility depends critically on material toughness, which varies with temperature. Many structural steels undergo a ductile-to-brittle transition at low temperatures — above the transition temperature, the material absorbs impact energy through plastic deformation; below it, the material fractures in a brittle manner with minimal energy absorption. This transition temperature effect means that equipment operating in cold conditions (winter at Khouribga: 0°C to -5°C) is more susceptible to impact cracking than the same equipment in warm conditions. For cast iron (inherently brittle), impact cracking occurs at any temperature.

In OCP phosphate processing, impact cracking is common in: cast iron pump casings subjected to water hammer or flow-induced pressure transients; cast iron valve bodies subjected to water hammer; crusher frame castings subjected to tramp metal impact; concrete foundations subjected to repeated impact from falling rock; piping systems subjected to water hammer during rapid valve closure; and refractory linings subjected to large rock impact in kilns and dryers. The winter temperature at Khouribga and Benguerir (elevation ~700–800 m) reduces carbon steel toughness, making outdoor structural steel more susceptible to impact cracking during the cold season.

## Detectable Symptoms (P Condition)

- Visible surface crack emanating from impact dent or gouge
- Audible impact event followed by change in equipment sound or vibration
- DPI/MPI indications at impact locations and adjacent stress concentrations
- Cast iron components: visible crack with sharp edges at impact site
- Pressure test failure after impact event (leak at crack location)
- Water hammer events logged by pressure transients (spike >2× normal operating pressure)
- Concrete spalling or cracking at impact zones
- Ultrasonic testing showing crack indication at or near impact site

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | Cast iron pumps (ET-CENTRIFUGAL-PUMP), ductile iron casings | Cast iron casing, foot mountings, bearing housing |
| Valves (VA) | Cast iron valves, water hammer-susceptible valves | Body (cast iron), bonnet, handwheel |
| Piping (PI) | Water hammer-susceptible piping, slurry piping | Pipe wall at supports, branch connections, elbows |
| Crushers (CU) | ET-CRUSHER frame (cast steel/iron), jaw plates | Frame castings, toggle plate seat, pitman |
| Concrete structures (CS) | Equipment foundations, process area floors | Foundation blocks, bund walls, equipment pads |
| Storage tanks (TA) | Atmospheric tanks subjected to external impact | Shell plates (impact dents becoming cracks), roof structure |
| Pressure vessels (VE) | Process vessels subjected to pressure transients | Shell (pressure surge cracking), nozzles, supports |
| Conveyors (CV) | Head/tail pulley structures, transfer point structures | Structural connections at impact zones, chute walls |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | DPI/MPI at impact locations | After each event + 6–12 months | ASME V Articles 6/7 |
| Physical Effects / NDT | UT crack detection at impact sites | After each event | ASME V Article 4 |
| Primary Effects | Pressure transient monitoring (water hammer detection) | Continuous | API RP 14E, process design |
| Human Senses | Visual inspection of cast iron for cracks | 1–4 weeks | API 574 |
| Physical Effects / NDT | Acoustic emission during pressure testing | Per inspection interval | ASTM E1932 |
| Primary Effects | Impact event detection/logging | Continuous | Process monitoring system |

## Maintenance Strategy Guidance

### Condition-Based (preferred — event-driven)

- **Primary task**: `Inspect for cracks after impact event on Pump [{tag}]`
- **Acceptable limits**: No crack indications by DPI/MPI at impact site and adjacent stress concentrations. Cast iron: no visible cracks (zero tolerance — cast iron cracks propagate). Carbon steel: no cracks exceeding ASME VIII acceptance criteria. Concrete: no cracking pattern indicating structural compromise. Water hammer: pressure transients ≤1.5× design pressure per system design.
- **Conditional comments**: If crack in cast iron component: replace component (cast iron cannot be reliably weld repaired in the field). If crack in carbon steel: assess by fracture mechanics per BS 7910, weld repair if possible per ASME PCC-2. If water hammer events recurring: install surge protection (surge vessels, slow-closing valves, air chambers per AWWA M11). If concrete impact damage: repair with structural epoxy grout, install impact protection for recurring locations.

### Fixed-Time (for water hammer prevention)

- **Task**: `Test surge protection on Pipeline [{tag}]`
- **Interval basis**: Surge vessel pre-charge pressure check every 6–12 months. Slow-closing valve timing verification annually. Check valve slam test (verify non-slam closing) annually. Cast iron equipment in outdoor cold-temperature service: enhanced visual inspection during winter months (December–February at Khouribga). Pressure transient recording review monthly to identify developing water hammer patterns.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment (vessels, piping, valve bodies) — impact cracking in pressure components risks catastrophic failure. NEVER acceptable for cast iron components — brittle fracture occurs without warning. Acceptable only for sacrificial impact absorbers (crusher toggle plates, impact curtains, expendable chute liners) designed to crack as part of their protective function.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
