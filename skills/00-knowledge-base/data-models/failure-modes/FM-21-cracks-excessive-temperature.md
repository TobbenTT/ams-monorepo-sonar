# FM-21: Cracks due to Excessive temperature

> **Combination**: 21 of 72
> **Mechanism**: Cracks
> **Cause**: Excessive temperature
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — temperature excursion events are unpredictable; cracking depends on transient thermal conditions exceeding material limits
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random for single-event) or 2.0–3.0 (wear-out for cumulative thermal damage), η highly variable

## Physical Degradation Process

Cracking due to excessive temperature occurs when thermal conditions exceed the material's design temperature range, creating thermal stresses, metallurgical changes, or phase transformations that initiate cracks. Three principal mechanisms operate: thermal shock cracking where rapid temperature change generates thermal stress exceeding the material's fracture strength (thermal stress = E × α × ΔT / (1 - ν)); overtemperature embrittlement where sustained exposure above the material's rating causes grain boundary precipitation, sigma phase formation, or sensitization that reduces ductility and toughness to the point where normal operating stresses initiate cracking; and thermal gradient cracking where a steep temperature gradient through the wall thickness creates differential expansion that initiates surface cracks on the hotter or cooler face.

The susceptibility to thermal cracking depends strongly on material properties. Brittle materials (ceramics, glass linings, cast iron) crack from thermal shock at ΔT as low as 40–80°C. Austenitic stainless steels, while ductile, are susceptible to sensitization cracking at 425–870°C (chromium carbide precipitation depletes grain boundaries of corrosion resistance). Carbon steels experience temper embrittlement at 375–575°C (phosphorus and tin segregation to grain boundaries). High-chrome ferritic steels (P91, P22) are susceptible to Type IV cracking in the intercritical heat-affected zone of welds at operating temperatures above 500°C.

In OCP phosphate processing, excessive temperature cracking occurs in: glass-lined reactor equipment at Jorf Lasfar where thermal shock from process upsets cracks the glass lining (exposing the steel substrate to acid attack); kiln and dryer shell sections where refractory failure creates localized hot spots above 400°C (causes carbon steel metallurgical damage); stainless steel welds on acid piping where temperature excursions above 425°C cause sensitization (chromium carbide precipitation); cast iron pump casings that crack from thermal shock when hot acid pumps are water-quenched during emergency shutdown; and refractory linings that crack from rapid heating/cooling during kiln startup and shutdown.

## Detectable Symptoms (P Condition)

- Surface cracking visible as thermal checking pattern (network of fine cracks — "elephant skin")
- DPI/MPI indications at weld heat-affected zones after thermal excursion events
- Glass lining crack detectable by spark test (electric holiday detection per NACE SP0188)
- Refractory surface cracking and spalling visible during internal inspection
- Metallurgical change detectable by replica metallography or hardness testing
- Temperature alarm history showing excursions above material rating
- Temper colors on steel surfaces indicating exposure history (>200°C for carbon steel)
- Cast iron components showing craze cracking pattern after thermal event

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Rotary equipment (RO) | Rotary kilns, rotary dryers, calciners | Kiln shell (hot spot cracking), refractory lining, riding ring |
| Pressure vessels (VE) | Glass-lined reactors, stainless steel vessels, carbon steel at high temp | Glass lining, shell welds (sensitization), nozzle welds |
| Heat exchangers (HE) | Waste heat boilers, high-temperature coolers | Tube-to-tubesheet welds, expansion joints, thermal sleeves |
| Piping (PI) | Stainless steel acid piping, carbon steel steam piping | Butt welds (sensitization), branch connections, thermal expansion loops |
| Pumps (PU) | Hot acid pumps (cast iron/stainless), boiler feed pumps | Cast iron casings (thermal shock), stainless impellers |
| Furnaces (FU) | Phosphate dryers, calciners, reactivation kilns | Refractory lining, refractory anchors, furnace tube supports |
| Valves (VA) | High-temperature control valves, desuperheater spray valves | Body/bonnet (thermal shock from spray), seat faces, stem |
| Concrete structures (CS) | Kiln piers, dryer supports | Surface spalling and cracking (concrete degradation >300°C) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Process temperature monitoring (thermocouples, RTDs) | Continuous | Process design specification |
| Temperature Effects | Kiln shell thermography (hot spot detection) | Weekly–monthly | ISO 18434-1 |
| Physical Effects / NDT | DPI/MPI at welds after thermal excursion events | After each event | ASME V Articles 6/7 |
| Physical Effects / NDT | Spark test (holiday detection) on glass linings | 6–12 months | NACE SP0188 |
| Physical Effects / NDT | Replica metallography for sensitization/embrittlement | 12–24 months | ASTM E1351, API 579 Part 10 |
| Physical Effects | Hardness testing after thermal events | After each event | ASTM E110, ISO 6506 |

## Maintenance Strategy Guidance

### Condition-Based (preferred — event-driven)

- **Primary task**: `Inspect for cracking after thermal event on Vessel [{tag}]`
- **Acceptable limits**: No crack indications per ASME VIII acceptance criteria after thermal excursion. Glass lining: zero holidays per NACE SP0188 spark test. Hardness within ±10% of baseline (change indicates metallurgical damage). No sensitization detectable by oxalic acid etch test (ASTM A262 Practice A) for austenitic stainless steel.
- **Conditional comments**: If thermal shock cracks in glass lining: repair with patch if crack area <100 cm², otherwise reline entire section. If sensitization detected in stainless steel weld HAZ: solution anneal heat treatment if possible, or plan replacement — sensitized material will suffer accelerated intergranular corrosion in acid service. If carbon steel exposed >425°C: metallographic examination for graphitization per API 579 Part 10, fitness-for-service assessment. If refractory cracking >25% of surface: plan refractory repair/replacement at next shutdown.

### Fixed-Time (for thermal protection verification)

- **Task**: `Inspect refractory lining in Kiln [{tag}]`
- **Interval basis**: Internal refractory inspection at every planned shutdown (annual or biannual). Glass lining spark test every 6–12 months per NACE SP0188. Kiln shell thermal scan: weekly during operation. Metallographic examination of high-temperature stainless steel components every 5 years or after significant thermal excursion per API 579. Temperature monitoring calibration verification annually.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure vessels, glass-lined equipment (acid exposure follows immediately), or structural elements in high-temperature service. Acceptable only for expendable refractory elements (sacrificial furnace sections) and non-pressure, non-structural ceramic components where cracking is an expected wear mechanism.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
