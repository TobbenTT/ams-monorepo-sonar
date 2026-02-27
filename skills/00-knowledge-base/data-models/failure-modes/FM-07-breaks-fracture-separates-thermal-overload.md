# FM-07: Breaks/Fracture/Separates due to Thermal overload

> **Combination**: 7 of 72
> **Mechanism**: Breaks/Fracture/Separates
> **Cause**: Thermal overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — thermal overload events are unpredictable process upsets; fracture depends on transient temperature conditions exceeding material limits
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on thermal shock magnitude, material thermal properties, and protection system effectiveness

## Physical Degradation Process

Fracture due to thermal overload occurs through two principal mechanisms: thermal shock fracture and high-temperature embrittlement. Thermal shock occurs when a rapid temperature change generates thermal stresses that exceed the material's fracture strength — the temperature gradient across the component creates differential expansion/contraction that generates tensile stress on the cooler surface. The thermal shock resistance parameter (R = σ_f × k / E × α) determines susceptibility: materials with high thermal conductivity (k), high fracture strength (σ_f), low elastic modulus (E), and low thermal expansion coefficient (α) resist thermal shock. Ceramics, cast iron, and glass have very poor thermal shock resistance; metals generally resist single-event thermal shock but can still fracture under severe gradients.

High-temperature embrittlement occurs when sustained exposure to temperatures above the material's design range causes metallurgical changes that reduce ductility and toughness. For carbon steel, exposure above 425°C causes graphitization (carbon migrates to grain boundaries, forming graphite nodules that act as crack initiators). For stainless steel, exposure at 425–870°C causes sigma phase embrittlement (formation of brittle intermetallic compounds). For cast iron, temperatures above 400°C cause growth and crazing (permanent dimensional increase from graphite formation). Once embrittled, the material is permanently degraded — cooling to ambient temperature does not restore original toughness, and the component is susceptible to fracture under normal operating loads.

In OCP phosphate processing, thermal overload fracture occurs in: rotary kiln and dryer refractory failure exposing the steel shell to direct flame contact (>800°C locally); cast iron pump casings in acid service that experience thermal shock during water quench events; heat exchanger tubes that rupture during tube-side blockage (loss of coolant causes rapid temperature rise); glass-lined reactor equipment where thermal shock >40°C/minute can crack the glass lining; and concrete structures near kilns at Khouribga/Youssoufia that experience surface spalling from heat exposure during upset conditions.

## Detectable Symptoms (P Condition)

- Surface temperature exceeding material design rating (measured by thermocouple, RTD, or thermography)
- Visible heat discoloration (temper colors on steel: straw 200°C, blue 300°C, grey 400°C+)
- Surface crazing or heat checking patterns (network of fine surface cracks from thermal cycling)
- Refractory spalling or loss exposing structural shell to elevated temperature
- Material hardness change after thermal event (increased hardness indicates embrittlement for carbon steel)
- Metallurgical degradation detectable by replica metallography (in-situ microstructure examination)
- Dimensional changes (cast iron growth) measurable by precision survey
- Creep deformation visible as sagging, bowing, or bulging of hot-face components

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Rotary equipment (RO) | Rotary kilns (Khouribga, Youssoufia), rotary dryers, calciners | Kiln shell (behind damaged refractory), riding rings, support rollers |
| Heat exchangers (HE) | Waste heat boilers, acid coolers, condensers | Tube bundle (thermal shock during process upset), tube sheets, baffles |
| Pressure vessels (VE) | Reactors, digesters, flash tanks | Shell/head (high-temperature zone), nozzle thermal sleeves |
| Furnaces and fired equipment (FU) | Phosphate dryers, calciners, reactivation kilns | Furnace shell, radiant tubes, tube hangers, refractory anchors |
| Pumps (PU) | Hot acid pumps, boiler feed pumps | Cast iron casings (thermal shock), shaft, mechanical seal faces |
| Piping (PI) | Steam piping, hot gas ducts, thermal expansion loops | Pipe wall at temperature transitions, branch connections, weld joints |
| Valves (VA) | High-temperature isolation valves, desuperheater spray valves | Valve body (thermal shock from spray quench), seat/disc (differential expansion) |
| Concrete structures (CS) | Kiln support piers, dryer foundations, fireproofing | Concrete surface (spalling), reinforcing steel (strength loss >300°C) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Process temperature monitoring (thermocouples, RTDs) | Continuous | Process design specification |
| Temperature Effects | Thermography of kiln shell and refractory lining | 1–4 weeks | ISO 18434-1 (kiln shell scan) |
| Physical Effects / NDT | Replica metallography (in-situ microstructure) | 12–24 months | ASTM E1351, API 579 Part 10 |
| Physical Effects / NDT | Hardness testing after thermal events | After each event | ASTM E110, ISO 6506 |
| Physical Effects / NDT | MPI/DPI for surface cracking after thermal event | After each event | ASME V Articles 6/7 |
| Human Senses | Visual inspection for heat discoloration and distortion | 1–4 weeks | API 574, API 573 |

## Maintenance Strategy Guidance

### Condition-Based (preferred — event-driven)

- **Primary task**: `Perform thermal scan on Kiln Shell [{tag}]`
- **Acceptable limits**: Shell temperature ≤350°C for carbon steel kilns (below graphitization threshold). No hot spots >50°C above surrounding shell temperature (indicates refractory loss). Temperature rate-of-change ≤5°C/minute during startup/shutdown (to prevent thermal shock). Material hardness within ±10% of as-built specification.
- **Conditional comments**: If kiln shell hot spot 350–400°C: reduce firing rate, plan refractory repair at next shutdown (within 30 days). If hot spot >400°C or visibly cherry-red: reduce firing rate immediately to minimum, plan emergency refractory repair. If thermal event exposure confirmed >425°C on carbon steel: perform metallographic replica examination and hardness survey to assess embrittlement — if graphitization detected, assess fitness-for-service per API 579 Part 10. If thermal shock cracking found on heat exchanger tubes: plug affected tubes, plan bundle replacement.

### Fixed-Time (for refractory and thermal protection systems)

- **Task**: `Inspect refractory lining in Kiln [{tag}]`
- **Interval basis**: Thermal scan of kiln shell: weekly during operation (identifies refractory loss before shell damage). Internal refractory inspection: at every planned shutdown (typically annual). Refractory relining: based on thickness measurement — replace sections <50% of original design thickness. Thermal protection coatings on structural steel: inspect every 12 months per ASTM E605. Emergency cooling system functional test: every 6 months.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment or structural load-bearing elements in high-temperature service — thermal embrittlement followed by fracture can be catastrophic (kiln shell collapse, pressure vessel rupture). Acceptable only for sacrificial thermal elements (expendable refractory sections, thermal fuses) designed to fail and alert operators to abnormal temperature conditions.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
