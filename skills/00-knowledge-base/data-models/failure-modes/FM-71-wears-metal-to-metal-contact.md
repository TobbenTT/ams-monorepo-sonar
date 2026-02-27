# FM-71: Wears due to Metal to metal contact

> **Combination**: 71 of 72
> **Mechanism**: Wears
> **Cause**: Metal to metal contact
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — adhesive wear progresses predictably with cumulative operating cycles as surface conditions deteriorate
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 5,000–30,000 hours depending on material pair, lubrication effectiveness, and contact geometry

## Physical Degradation Process

Wear due to metal-to-metal contact occurs through adhesive wear — when two metallic surfaces in relative motion make direct contact (without adequate separation by lubricant, oxide layer, or coating), micro-welding occurs at asperity junctions. As the surfaces continue to move, these micro-welds fracture, transferring material from one surface to the other or releasing wear particles. The adhesive wear rate is governed by Archard's equation: V = K × W × L / H, where V is volume removed, K is the wear coefficient (material-pair dependent), W is normal load, L is sliding distance, and H is hardness of the softer material.

Adhesive wear is the most fundamental wear mechanism — it occurs whenever lubricant film or protective surface layers are absent. Material compatibility is critical: similar metals (steel-on-steel) have high adhesion tendency and high wear rates; dissimilar metals or hard-on-soft combinations (hardened steel on bronze, stellite on stainless) have lower adhesion and longer life. Surface treatments (nitriding, chrome plating, thermal spray) and coatings (DLC, TiN, WC) dramatically reduce adhesive wear by preventing metal-to-metal contact.

The wear progression follows three stages: running-in (initial high wear rate as asperities conform), steady-state (moderate, predictable wear rate as surfaces are smoothed), and severe wear (accelerating wear as protective surfaces are consumed and base metal is exposed). Once severe adhesive wear begins, the generated debris contaminates the lubricant and causes secondary abrasive wear — the transition from mild to severe is rapid and difficult to reverse.

In OCP phosphate processing, metal-to-metal contact wear occurs in: pump shaft sleeves at packing and seal locations; valve stem packing contact surfaces; wire rope on sheave grooves and drum wrapping; chain links on sprocket teeth; brake disc and pad contact surfaces; gear coupling tooth contact; and any bearing surface where lubrication is marginal (startup, shutdown, or boundary lubrication conditions).

## Detectable Symptoms (P Condition)

- Increasing shaft sleeve diameter at seal/packing contact zone (measurable by micrometer)
- Wire rope flattened strands and groove wear on sheaves (visible during inspection)
- Brake disc thickness decreasing (measured by caliper or UT)
- Valve stem surface scoring or roughness at packing zone
- Chain elongation (pitch increase from pin-bushing wear — measured by chain gauge)
- Coupling tooth surface scoring or material transfer marks
- Wear debris in lubricant analysis (adhesive wear particles: flat, platelets, often with temper colors)
- Increasing clearance between mating parts (bearing clearance, gear backlash)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP shaft sleeve, stuffing box | Shaft sleeve, packing rings, wear rings, throat bush |
| Valves (VA) | Gate valves, globe valves, control valves | Stem at packing zone, gate/wedge guides, seat faces |
| Cranes (CR) | Overhead cranes, mobile cranes, draglines | Wire rope, sheave grooves, drum grooves, hook swivel |
| Conveyors (CV) | Chain conveyors, bucket elevator chains | Chain pins/bushings, sprocket teeth, slide rails |
| Brakes (BR) | Conveyor brakes, crane brakes, motor brakes | Brake disc, brake pads/shoes, drum surface |
| Couplings (CG) | Gear couplings, grid couplings, chain couplings | Coupling teeth, grid elements, chain links |
| Gearboxes (GB) | Gearboxes with marginal lubrication conditions | Gear tooth flanks (scuffing), shaft journals, thrust washers |
| Compressors (CO) | Reciprocating compressor piston/cylinder | Piston rings, cylinder liner, crosshead slides |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Dimensional measurement of wear components | 3–12 months | OEM specification |
| Physical Effects | Wire rope inspection (broken wires, rope diameter) | 1–3 months | ISO 4309 |
| Chemical Effects | Lubricant wear particle analysis | 1–3 months | ASTM D5185, D7684 |
| Physical Effects | Chain elongation measurement | 1–3 months | ISO 606, DIN 8187 |
| Physical Effects | Brake disc thickness measurement | 3–6 months | OEM specification |
| Human Senses | Visual inspection for scoring, galling, material transfer | 1–6 months | OEM manual |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure shaft sleeve diameter on Pump [{tag}]`
- **Acceptable limits**: Shaft sleeve diameter within OEM tolerance (typically wear limit = +0.5 mm). Wire rope per ISO 4309 discard criteria. Chain elongation ≤3% for precision drives, ≤5% for heavy-duty per ISO 606. Brake disc ≥ minimum thickness per OEM. Valve stem surface roughness ≤3.2 μm Ra at packing zone.
- **Conditional comments**: If shaft sleeve near wear limit: plan replacement at next seal/packing change. If wire rope approaching discard criteria: plan replacement within 30 days, increase inspection frequency to weekly. If chain elongation >2%: plan replacement at next shutdown (sprocket damage accelerates beyond 3%). If brake disc below minimum: replace immediately (reduced braking effectiveness is safety hazard). If valve stem scored: re-polish or replace stem, replace packing, investigate packing material compatibility.

### Fixed-Time (for sacrificial wear components)

- **Task**: `Replace packing on Valve [{tag}]`
- **Interval basis**: Valve packing: replace at each valve overhaul or when leakage rate exceeds acceptable limits. Pump shaft sleeves: replace at each mechanical seal or packing change. Wire rope: maximum calendar life per ISO 4309 Annex C or discard criteria — whichever first. Chain: replace when elongation reaches discard limit, typically 1–3 years in heavy-duty phosphate service. Brake pads: replace when thickness ≤OEM minimum or when brake performance test fails. Apply appropriate surface treatments to extend life: hard chrome on shaft sleeves, nitriding on valve stems, hardfacing on coupling teeth.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for inexpensive, easily replaced sacrificial wear elements designed for contact service (brake pads, packing rings, chain links) where wear is the expected consumption mechanism and replacement is straightforward. NOT acceptable for expensive base components (shafts, sheaves, cylinders) where metal-to-metal wear damages the expensive component — use sacrificial sleeves and replaceable wear elements to protect base components.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
