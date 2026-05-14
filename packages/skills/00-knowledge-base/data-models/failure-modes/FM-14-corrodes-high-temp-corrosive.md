# FM-14: Corrodes due to Exposure to high temperature corrosive environment

> **Combination**: 14 of 72
> **Mechanism**: Corrodes
> **Cause**: Exposure to high temperature corrosive environment
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — high-temperature corrosion is progressive with cumulative exposure; rate follows Arrhenius kinetics and is accelerated exponentially by temperature
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 8,000–40,000 hours depending on temperature, gas composition (sulfur, chlorine, vanadium), and alloy selection

## Physical Degradation Process

High-temperature corrosion in a corrosive environment occurs when metallic components operate at elevated temperatures (typically >200°C for carbon steel, >400°C for stainless steels) in atmospheres or process fluids containing corrosive species — primarily sulfur compounds (H₂S, SO₂, sulfate deposits), chlorine/HCl, vanadium pentoxide (from fuel oil combustion), and molten salts. At these temperatures, corrosion mechanisms differ fundamentally from aqueous electrochemical corrosion: attack occurs through direct gas-solid reactions, molten salt dissolution of protective oxide scales, and solid-state diffusion of corrosive species through the metal — no liquid water electrolyte is required.

The principal high-temperature corrosion mechanisms include: sulfidation (H₂S or SO₂ attack forming metal sulfides, which grow 10–100× faster than oxides and provide no protection — carbon steel in H₂S service follows the McConomy curves); hot corrosion (molten salt deposits, typically Na₂SO₄ + V₂O₅ from fuel oil combustion, dissolve the protective Cr₂O₃ scale on alloys, causing catastrophic fluxing attack at 600–900°C); chloride-accelerated oxidation (HCl or Cl₂ penetrate oxide scales and form volatile metal chlorides that evaporate and re-oxidize at the scale surface, creating a cyclic, self-propagating attack — "active oxidation"); and carburization/metal dusting (carbon-rich atmospheres at 400–800°C cause carbon ingress that embrittles austenitic alloys and creates pitting-type metal dusting attack).

In OCP phosphate processing, high-temperature corrosive environments are present in: rotary kilns for phosphate calcination (800–1000°C, combustion gas atmosphere with sulfur from phosphate ore — H₂S and SO₂ attack on kiln shell and internals); rotary dryers operating at 300–600°C gas temperature (sulfurous gas + phosphate dust creates aggressive deposits on dryer shell and flights); boiler tubes in OCP power generation facilities (fuel oil firing produces vanadium + sodium sulfate deposits causing hot corrosion at 550–700°C on superheater tubes); waste heat recovery systems on sulfuric acid plants at Jorf Lasfar (SO₂/SO₃-rich gas at 400–600°C); and exhaust systems on diesel mobile equipment at mining sites (intermittent high-temperature sulfidation and oxidation). Material selection is critical: carbon steel is adequate below 260°C in H₂S service, 5Cr-0.5Mo extends the limit to 400°C, 9Cr-1Mo to 550°C, and austenitic stainless steels (304H, 310, 347) are required above 550°C per API RP 941.

## Detectable Symptoms (P Condition)

- Scale thickness increasing and becoming multi-layered (oxide + sulfide layers)
- Wall thinning detectable by UT on cooled surface (comparing to baseline records)
- Tube metal temperature trending upward (thermocouple or IR pyrometry — indicates scale buildup)
- Deposit accumulation on heat transfer surfaces (vanadium-rich deposits — green/black color)
- Tube ovality or distortion from creep-accelerated corrosion thinning
- Ash/slag deposits showing sulfate or chloride content on chemical analysis
- Internal surface roughening visible during inspection shutdown (pitting under deposits)
- Exhaust gas composition change indicating increased corrosion rate (metal content in ash)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Rotary equipment (RO) | Rotary kilns (phosphate calcination), rotary dryers | Kiln shell, refractory anchor system, riding rings (hot zone), flights, lifters |
| Boilers (BO) | Steam boilers at OCP power plants, waste heat boilers | Superheater tubes, reheater tubes, economizer tubes, steam drum internals |
| Heat exchangers (HE) | Waste heat recovery, gas-gas exchangers, air preheaters | Tube bundles, tube sheets (hot side), baffles, header boxes |
| Furnaces (FU) | Process heaters, calcination furnaces, annealing furnaces | Radiant tubes, tube hangers, tube supports, refractory anchors |
| Piping (PI) | High-temperature process gas piping, flue gas ducting | Pipe wall (hot spots), elbows (erosion-corrosion), expansion joints |
| Stacks/chimneys (SK) | Kiln exhaust stacks, boiler stacks, acid plant stacks | Stack liner (below dew point zone — acid condensation), dampers, expansion joints |
| Fans (FA) | ID fans on kilns, boiler ID/FD fans, process gas fans | Fan impeller blades, shaft, housing, inlet cone, bearings (heat exposure) |
| Refractory (RF) | Kiln linings, furnace linings, duct linings | Refractory brick/castable (chemical attack by process deposits), anchors |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Tube metal temperature monitoring (thermocouples, IR) | Continuous/weekly | API 530, ASME PCC-3 |
| Physical Effects / NDT | UT thickness at hot zones and deposit-prone locations | 6–12 months | API 574, API 530 |
| Chemical Effects | Deposit/ash analysis for corrosive species (V, Na, S, Cl) | 3–6 months | ASTM D3682 |
| Physical Effects / NDT | Tube inspection (IRIS, remote field ET) during shutdown | 12–24 months | ASME V Art. 8 |
| Physical Effects / NDT | Refractory thickness measurement (UT or laser scanning) | 12–24 months | API 936, ASTM C1161 |
| Primary Effects | Flue gas analysis for corrosive species (SO₂, HCl) | Monthly | EPA methods, ISO 7935 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure tube thickness on Kiln Hot Zone [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum per API 530 or ASME pressure calculation plus corrosion allowance for next inspection period. Tube metal temperature ≤ maximum allowable per API 530 Table 1 for the alloy. Deposit thickness ≤ design limit (excessive deposits increase tube temperature). Refractory thickness ≥ minimum for thermal protection of shell.
- **Conditional comments**: If tube thinning rate >design corrosion allowance: investigate cause (temperature excursion, fuel quality change, deposit accumulation), consider alloy upgrade. If tube metal temperature trending upward: clean deposits by soot blowing or mechanical cleaning during next shutdown. If kiln shell hot spots detected by IR thermography: refractory failure — plan patch repair at next kiln stop, monitor shell temperature continuously. If deposit analysis shows high vanadium (>50 ppm in fuel oil ash): add magnesium-based additive to raise ash fusion temperature above operating temperature.

### Fixed-Time (for deposit removal and inspection)

- **Task**: `Inspect kiln internals during reline on [{tag}]`
- **Interval basis**: Kiln refractory inspection: every reline cycle (typically 12–24 months). Boiler tube inspection: annual during boiler overhaul. Waste heat boiler chemical cleaning: every 2–3 years or when efficiency drops >5%. Kiln shell UT survey: every reline shutdown. Superheater tube replacement: plan on alloy life basis per API RP 530 remaining life calculation. Fuel quality monitoring: every delivery for fuel oil (vanadium, sodium, sulfur content per ASTM D4294).

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing tubes (boiler, heat exchanger) — rupture at high temperature causes steam explosion or hazardous gas release. NEVER acceptable for kiln shell — through-wall failure causes catastrophic kiln collapse. Acceptable only for sacrificial, replaceable internals designed for consumption (furnace baffles, sacrificial liners, castable refractory wear zones) where scheduled replacement is planned.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
