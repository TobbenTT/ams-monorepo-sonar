# FM-31: Degrades due to Exposure to excessive temperature

> **Combination**: 31 of 72
> **Mechanism**: Degrades
> **Cause**: Exposure to excessive temperature
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — temperature excursion events are unpredictable process upsets; degradation severity depends on excursion magnitude and duration
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 0.8–1.5 (mostly random), η highly variable depending on excursion frequency and material thermal sensitivity

## Physical Degradation Process

Degradation due to exposure to excessive temperature occurs when components are subjected to temperatures above their rated design range, causing permanent material property changes. This differs from overheating (FM-49 through FM-54) which focuses on heat generation; here the focus is on exposure to an externally imposed temperature — the component is a passive victim of a hot environment rather than generating heat itself.

The degradation mechanisms are material-dependent: polymers undergo thermal decomposition (chain scission, cross-linking, or depolymerization) at temperatures above their maximum continuous service temperature; lubricants suffer thermal cracking (long hydrocarbon chains break into shorter ones, reducing viscosity) and accelerated oxidation; electronic components experience accelerated aging (electrolytic capacitor electrolyte evaporation, solder joint intermetallic growth, semiconductor diffusion); and paints/coatings blister, char, or decompose. The Arrhenius relationship governs all these — each 10°C above the rated temperature approximately halves the remaining useful life.

The distinction from FM-21 (Cracks due to Excessive temperature) is that degradation describes a diffuse property change throughout the material rather than a localized crack. The material becomes uniformly weaker, more brittle, less elastic, or less effective — but remains physically intact (not cracked or fractured). Often, degradation precedes and enables cracking.

In OCP phosphate processing, thermal exposure degradation occurs in: instrumentation and electronics near kilns and dryers at Khouribga/Youssoufia (ambient >60°C — exceeds rating of many electronics); cable insulation in hot zones (PVC becomes brittle above 70°C, XLPE above 90°C sustained); lubricant in bearings near hot process equipment; elastomeric seals on equipment near heat sources; fire protection coatings and passive fireproofing that degrade from sustained heat exposure; and pneumatic instrument tubing (nylon/polyethylene) that softens near hot surfaces.

## Detectable Symptoms (P Condition)

- Material becoming brittle, discolored, or chalky from thermal exposure
- Cable insulation cracking or hardening (bend test: cracked insulation indicates thermal degradation)
- Electronic component parameter drift beyond specification (capacitance, resistance)
- Lubricant viscosity reduced >20% from thermal cracking (measured per ASTM D445)
- Polymer dimensional change (shrinkage, warping, distortion)
- Paint system blistering, flaking, or chalking in hot zones
- Pneumatic tubing softening or deforming near heat sources
- Equipment operating temperature exceeding material rating (logged by DCS/SCADA)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electrical installations (EI) | Cable trays near kilns, instrument cable, power cable | PVC/XLPE cable insulation, cable glands, junction box seals |
| Control logic units (CL) | PLC/DCS cabinets near heat sources, field-mounted controllers | Electrolytic capacitors, LCD displays, power supplies, fans |
| Input devices (ID) | Field instruments near kilns/dryers | Transmitter electronics, wiring insulation, housing seals |
| Seals and gaskets (SG) | Seals on equipment near heat sources | EPDM/Viton O-rings, gasket materials, packing |
| Pumps (PU) | Pump bearings near hot process equipment | Bearing grease/oil, mechanical seal elastomers |
| Piping (PI) | Polymer piping near heat sources, pneumatic tubing | PVC/CPVC/PE pipe material, nylon instrument tubing |
| Safety devices (SD) | Fire detection, passive fireproofing, fire-rated dampers | Detector elements, intumescent coatings, fireproofing boards |
| Coatings (CO) | Paint systems on hot equipment, thermal insulation cladding | Paint (epoxy, polyurethane), insulation cladding (aluminum, PVC) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Ambient temperature monitoring near sensitive equipment | Continuous | OEM rated temperature range |
| Human Senses | Visual inspection for thermal degradation signs | 1–3 months | Industry practice |
| Electrical Effects | Cable insulation resistance testing | 12–24 months | IEEE 400, IEC 60502 |
| Physical Effects | Material property testing (hardness, flexibility) | 6–12 months | ASTM D2240, D412 |
| Electrical Effects | Electronic component parameter verification | 12–24 months | IEC 61709, OEM specification |
| Temperature Effects | Thermal mapping of equipment areas | 12–24 months | ISO 18434-1 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor ambient temperature near Electronics [{tag}]`
- **Acceptable limits**: Ambient temperature within OEM-rated operating range for all installed equipment. Cable insulation resistance ≥1 MΩ/km per IEEE 400. Polymer material hardness within ±15 points of as-new. No visible cracking, discoloration, or embrittlement. Lubricant viscosity within ±15% of nominal.
- **Conditional comments**: If ambient temperature exceeding equipment rating: install heat shields, additional ventilation, or relocate equipment. If cable insulation resistance declining: plan cable replacement at next outage for affected section. If polymer materials showing thermal degradation: replace, and upgrade to higher-temperature-rated material. If lubricant thermally cracked: change lubricant, upgrade to synthetic grade rated for actual operating temperature.

### Fixed-Time (for thermal protection maintenance)

- **Task**: `Inspect heat protection on Cable Tray [{tag}]`
- **Interval basis**: Thermal insulation and heat shields: inspect every 12 months for damage and effectiveness. Cabinet cooling systems (air conditioning, fans, filtered ventilation): functional test and filter change every 3–6 months. Cable insulation testing in hot zones: every 2–3 years per IEEE 400. Thermal mapping of plant areas: at commissioning and after any process change affecting heat emissions. Consider upgrading materials in hot zones: PVC cable → XLPE; standard electronics → extended temperature range; mineral oil → synthetic lubricant.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety-critical electronics (SIS, fire/gas systems), power cables, or safety system components in hot zones. Acceptable for non-critical, easily replaced components where thermal degradation causes only minor operational disruption and replacement is straightforward (e.g., cable ties, labels, non-critical sensor housings).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — CB strategy with operational basis]*
