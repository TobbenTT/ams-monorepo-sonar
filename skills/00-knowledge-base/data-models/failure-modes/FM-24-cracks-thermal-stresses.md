# FM-24: Cracks due to Thermal stresses (heat/cold)

> **Combination**: 24 of 72
> **Mechanism**: Cracks
> **Cause**: Thermal stresses (heat/cold)
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — thermal stress cracking develops progressively with accumulated thermal cycles; life is predictable from temperature range and Coffin-Manson relationship
> **ISO 14224 Failure Mechanism**: 2.6 Fatigue
> **Weibull Guidance**: β typically 2.0–4.0 (wear-out), η 1,000–50,000 cycles depending on temperature range ΔT, material thermal fatigue resistance, and component geometry

## Physical Degradation Process

Cracking due to thermal stresses occurs when temperature gradients or temperature cycling generate mechanical stresses through differential thermal expansion that exceed the material's fatigue endurance. The thermal stress magnitude is σ_th = E × α × ΔT / (1-ν), where E is elastic modulus, α is thermal expansion coefficient, ΔT is the temperature differential, and ν is Poisson's ratio. For constrained components (fixed-end pipes, thick-walled vessels, dissimilar metal welds), even moderate temperature changes generate significant stresses — a 100°C temperature change in constrained carbon steel generates approximately 250 MPa thermal stress, approaching the yield strength.

Two principal mechanisms operate: thermal fatigue from cyclic temperature variation (startup/shutdown, process fluctuations, day/night ambient cycling) where the Coffin-Manson low-cycle fatigue relationship governs crack initiation life; and thermal gradient cracking where a sustained temperature difference through the component wall or between adjacent sections of different temperature creates persistent thermal stress that drives time-dependent crack growth. The cracks characteristically initiate on the surface experiencing the highest thermal strain — typically the hotter surface for heating events and the cooler surface for cooling events.

Thermal fatigue cracks have a distinctive appearance: closely spaced, shallow, surface-initiating cracks oriented perpendicular to the maximum thermal stress direction, often forming a network pattern ("checking" or "crazing"). As individual cracks deepen, they may link up with adjacent cracks, creating a through-wall crack path. Dissimilar metal welds (DMWs) are particularly susceptible because different expansion coefficients of the two metals create additional cyclic stress at the interface.

In OCP phosphate processing, thermal stress cracking is critical at: kiln and dryer shell sections that cycle between ambient and operating temperature during startup/shutdown (ΔT > 200°C); dissimilar metal welds between carbon steel and stainless steel on acid piping transitions at Jorf Lasfar; heat exchanger expansion joints and floating heads; piping expansion loops that absorb thermal movement; and outdoor piping at Khouribga/Benguerir that experiences significant day-night temperature cycling (summer ΔT up to 30°C diurnal range at altitude).

## Detectable Symptoms (P Condition)

- Surface checking or crazing pattern detectable by DPI (network of fine surface cracks)
- Individual thermal fatigue cracks at high-stress locations (DPI/MPI indication)
- Cracking at dissimilar metal welds (visible by DPI or detectable by UT)
- Expansion loop or bellows cracking (visible or detectable by leak test)
- Pipe support damage indicating excessive thermal movement (bent guides, broken stops)
- Flange leakage correlated with temperature cycling (gasket seating disturbed by thermal movement)
- Crack oxide staining (rust bleeding at crack mouths on carbon steel)
- Strain gauge readings at thermal stress locations exceeding yield at temperature extremes

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Thermal expansion loops, dissimilar metal welds, steam piping | Expansion loop elbows, DMW joints, branch connections, pipe shoes/guides |
| Rotary equipment (RO) | Rotary kilns, rotary dryers (startup/shutdown cycling) | Kiln shell welds, tire contact zone, inlet/outlet transitions |
| Heat exchangers (HE) | High-temperature exchangers, thermal cycling service | Tube-to-tubesheet welds, expansion bellows, floating head bolting |
| Pressure vessels (VE) | Vessels with thermal cycling, hot-wall/cold-wall transitions | Shell-to-nozzle welds, skirt-to-head junction, thermal sleeve connections |
| Furnaces (FU) | Kilns, dryers, calciners | Refractory-to-shell interface, refractory anchor welds, sight ports |
| Valves (VA) | Thermal cycling valves, desuperheater spray valves | Body (thermal shock from quench spray), seat ring, stem packing area |
| Pumps (PU) | Hot acid pumps that cycle on/off frequently | Casing (thermal fatigue from temperature cycling), nozzle welds |
| Storage tanks (TA) | Tanks with thermal cycling contents | Floor-to-shell weld, shell course welds, nozzle connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | DPI for thermal fatigue crack detection | 6–12 months | ASME V Article 6, ISO 3452 |
| Physical Effects / NDT | UT at dissimilar metal welds and known hot spots | 6–12 months | ASME V Article 4, EPRI DMW guidelines |
| Temperature Effects | Thermal cycle counting (DCS/SCADA logging) | Continuous | ASME VIII Div 2, EN 13445 |
| Physical Effects | Pipe support and expansion system inspection | 6–12 months | ASME B31.3, API 570 |
| Physical Effects / NDT | Phased array UT for crack depth measurement | 6–12 months | ASME V Article 4 |
| Primary Effects | Flange leakage monitoring during thermal transients | Continuous–daily | ASME PCC-1 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform DPI on Expansion Loop Elbows [{tag}]`
- **Acceptable limits**: No thermal fatigue crack indications per ASME VIII acceptance criteria. DMW joints: no cracking detectable by UT at fusion line. Expansion bellows: no visible cracks or thinning per EJMA standard. Pipe supports: correctly guiding thermal movement, no seized or binding supports. Thermal cycle count within design fatigue life per ASME VIII Div 2 fatigue curve.
- **Conditional comments**: If thermal fatigue cracks detected on surface: measure depth by UT, assess remaining life per BS 7910, plan repair or replacement based on remaining fatigue cycles. If DMW cracking: plan weld replacement with compatible filler metal (Inconel 82/182 for CS-to-SS transitions) within 30 days. If expansion bellows cracked: replace immediately (bellows failure can cause pipe rupture from unrestrained thermal expansion). If thermal cycle count approaching 50% of design life: implement enhanced NDE program, consider operational changes to reduce cycling.

### Fixed-Time (for thermal fatigue-limited components)

- **Task**: `Inspect dissimilar metal welds on Piping [{tag}]`
- **Interval basis**: DMW inspection: every 3–5 years per industry practice (EPRI guidelines for DMW management). Expansion bellows: inspect every 2–3 years per EJMA guidelines. Kiln shell thermal fatigue inspection: at every planned shutdown (annually). Thermal cycle logging: continuous with alarm at 50% and 80% of design fatigue life. Pipe support survey: annually or after any process upset causing abnormal thermal movement.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment, expansion joints/bellows, or dissimilar metal welds — thermal fatigue crack growth to failure can cause sudden pipe rupture during the next thermal cycle. Acceptable only for non-pressure, non-structural components where thermal cracking is cosmetic (e.g., paint checking on hot surfaces, non-critical refractory surface cracking).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects (NDT)], [ISO 14224 Table B.2 — 2.6 Fatigue], [REF-01 §3.5 — CB strategy with operational basis]*
