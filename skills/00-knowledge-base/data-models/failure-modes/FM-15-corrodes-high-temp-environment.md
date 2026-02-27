# FM-15: Corrodes due to Exposure to high temperature environment

> **Combination**: 15 of 72
> **Mechanism**: Corrodes
> **Cause**: Exposure to high temperature environment
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — high-temperature oxidation progresses predictably with cumulative exposure following parabolic kinetics; rate is temperature-dependent per Arrhenius relationship
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 15,000–80,000 hours depending on temperature, alloy chromium content, and thermal cycling severity

## Physical Degradation Process

High-temperature oxidation (also called scaling, dry corrosion, or gaseous corrosion) occurs when metals react with oxygen at elevated temperatures to form oxide scales. Unlike aqueous corrosion which requires an electrolyte, high-temperature oxidation is a direct gas-solid reaction driven by solid-state diffusion of oxygen inward and metal ions outward through the growing oxide scale. The oxidation rate follows parabolic kinetics (Wagner theory): the scale growth rate decreases over time as the thickening scale provides an increasing diffusion barrier — but the cumulative scale thickness continues to grow, consuming base metal.

The protectiveness of the oxide scale depends critically on the alloy composition: chromium is the primary element providing oxidation resistance — it forms a dense, adherent Cr₂O₃ scale that dramatically slows further oxidation. Carbon steel (no Cr) forms porous, multi-layered iron oxide scales (FeO/Fe₃O₄/Fe₂O₃) that provide limited protection and spall under thermal cycling, exposing fresh metal. The critical transitions are: carbon steel — limited to ~540°C continuous, ~425°C with thermal cycling; 2¼Cr-1Mo — to ~580°C; 9Cr-1Mo — to ~650°C; 304 SS (18Cr) — to ~870°C continuous; 310 SS (25Cr) — to ~1100°C. Thermal cycling dramatically accelerates oxidation because differential thermal expansion between metal and oxide causes scale cracking and spallation during each cycle, eliminating the protective barrier.

In OCP phosphate processing, high-temperature oxidation (without significant corrosive species — distinguishing this from FM-14) occurs in: kiln shell exterior surfaces exposed to radiative and convective heat from the charge; dryer shell components in the hot gas zone; kiln support rollers and thrust rollers operating at elevated surface temperatures from heat conduction through the kiln shell; boiler steam drum and water wall tubes in the steam-side oxidation zone (internal magnetite growth at >350°C reduces heat transfer and eventually exfoliates, causing tube blockage); electrical resistance heater elements in process heating applications; and exhaust ductwork and stack components in the oxidation zone (above acid dew point, where the dominant mechanism is oxidation rather than acid attack). High-temperature bolt relaxation (reduced by oxidation of bolt thread surfaces) contributes to joint loosening on kilns and dryers.

## Detectable Symptoms (P Condition)

- Progressive oxide scale buildup on exposed surfaces (measurable scale thickness)
- Scale spallation leaving rough, pitted metal surface (evidence of thermal cycling damage)
- Metal cross-section reduction visible during UT measurement (original thickness - current thickness - scale)
- Steam-side oxide exfoliation blocking boiler tubes (detected by tube temperature increase)
- Component dimensional change (growth from oxide volume > metal volume consumed)
- Surface color change indicating temperature history (blue/straw for steel 250–350°C, grey scale >500°C)
- Bolt torque relaxation from thread oxidation and embedment (measurable by torque audit)
- Component distortion from differential oxidation rates on heated vs. cooled surfaces

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Rotary equipment (RO) | Rotary kilns, rotary dryers (shell oxidation) | Kiln/dryer shell (external hot zone), riding rings, support roller journals |
| Boilers (BO) | Steam boilers (steam-side oxidation), waste heat boilers | Water wall tubes (steam-side), superheater/reheater tubes, steam drum internals |
| Furnaces (FU) | Process heaters, calcination furnaces | Radiant tubes, tube hangers, alloy internals, door frames, observation ports |
| Piping (PI) | High-temperature steam piping, exhaust ducting | Pipe wall (long-term service), expansion bellows, desuperheater nozzles |
| Heat exchangers (HE) | Superheaters, air preheaters, waste heat recovery | Tube surfaces (both sides), tube sheets, header plates, tie rods |
| Fasteners (FT) | High-temperature bolting on kilns, turbines, flanges | Bolt threads (oxidation + relaxation), nut faces, washer surfaces |
| Fans (FA) | Hot gas fans, kiln exhaust fans | Impeller blades, shaft in hot zone, housing, inlet cone |
| Electrical heaters (EH) | Resistance heaters, immersion heaters, trace heating | Heating elements, element sheaths, terminal connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Surface temperature monitoring (thermocouples, IR pyrometry) | Continuous/weekly | API 530, ASME PCC-3 |
| Physical Effects / NDT | UT thickness measurement at hot zones | 6–12 months | API 574, API 530 |
| Physical Effects / NDT | Metallographic replication (oxide/microstructure assessment) | 12–24 months | ASTM E1351, API 579 Annex F |
| Physical Effects | Dimensional measurement (growth from oxidation) | 12–24 months | OEM specification |
| Physical Effects / NDT | Boiler tube steam-side oxide thickness (UT or sampling) | 12–24 months | EPRI guidelines, ASME PCC-3 |
| Physical Effects | Bolt torque audit on high-temperature joints | 6–12 months | ASME PCC-1, API 574 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness on Kiln Shell Hot Zone [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum required for structural/pressure integrity at operating temperature per design calculation. Steam-side oxide thickness ≤500 μm (exfoliation risk increases rapidly above this per EPRI guidelines). Surface temperature ≤ maximum allowable for the alloy per API 530 or ASME Section II. Scale adhesion: no loose or spalling scale that could block downstream equipment.
- **Conditional comments**: If wall thinning rate exceeds design basis: investigate for temperature excursion or thermal cycling damage, consider weld overlay or alloy upgrade. If steam-side oxide >500 μm: plan chemical cleaning per ASME guidelines to remove oxide before exfoliation causes tube blockage. If kiln shell hot spots >50°C above surrounding area: indicates refractory loss — plan spot refractory repair. If high-temperature bolting torque loss >20%: re-torque using hot-bolting procedure, consider alloy upgrade (B16 or alloy 718 studs for >540°C service per ASME PCC-1).

### Fixed-Time (for oxide management)

- **Task**: `Perform chemical clean on Boiler [{tag}] to remove steam-side oxide`
- **Interval basis**: Boiler chemical cleaning to remove steam-side magnetite: every 5–10 years based on oxide thickness monitoring per EPRI guidelines. Kiln shell thickness survey: every reline shutdown (12–24 months). High-temperature bolt replacement: every 5–8 years or when thread deterioration prevents proper tensioning. Metallographic replication at high-temperature zones: every 2–3 years to track creep damage and microstructural degradation. For carbon steel components exceeding oxidation limits: plan material upgrade during next replacement.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing components at elevated temperature — through-wall failure at temperature causes catastrophic steam or gas release. NEVER acceptable for kiln or dryer shell — structural failure during rotation. Acceptable for sacrificial internals designed for replacement (furnace baffles, expendable support hangers, castable refractory wear zones) and for electrical heater elements where failure is detectable and does not create hazard.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
