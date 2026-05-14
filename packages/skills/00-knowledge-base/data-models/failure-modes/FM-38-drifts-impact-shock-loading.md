# FM-38: Drifts due to Impact/shock loading

> **Combination**: 38 of 72
> **Mechanism**: Drifts
> **Cause**: Impact/shock loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — impact events causing drift are unpredictable; driven by accidental contact, process upsets, or vibration events
> **ISO 14224 Failure Mechanism**: 3.4 Out of adjustment
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on instrument robustness and exposure to impact sources

## Physical Degradation Process

Drift due to impact or shock loading occurs when a sudden mechanical shock permanently displaces or damages the sensing element, mechanical linkage, or reference datum of a measurement instrument or precision mechanical device, causing its output to shift from its calibrated value. The drift mechanism depends on the device type: in bourdon tube pressure gauges, impact can permanently deform the tube changing the zero and span; in strain gauge transducers, impact can shift the bonding of the gauge to the substrate; in mechanical switches and relays, impact can displace contact set-points; in precision potentiometers and encoders, impact can shift the wiper or damage the track; and in optical/laser instruments, impact can misalign optical paths.

Unlike temperature-induced drift (FM-37) which may be temporary and recoverable, impact-induced drift is almost always permanent — the physical displacement of the sensing element does not self-correct when the impact force is removed. The drift magnitude depends on the impact energy relative to the instrument's shock rating (typically specified in g-force per IEC 60068-2-27 or equivalent). Even minor impacts that don't visibly damage the instrument can cause detectable drift in high-precision devices — a 10g shock can shift a precision pressure transmitter by 0.1–0.5% of span.

In OCP phosphate processing, impact-induced drift is most common for: field instruments mounted on vibrating equipment (vibrating screens, crushers, mills) where cumulative shock exposure gradually shifts calibration; instruments on slurry pipelines subjected to water hammer and flow transients; pressure gauges on mobile equipment (loaders, trucks, excavators at Khouribga mining operations) subjected to vehicle motion and terrain shocks; instruments near blasting operations at open-pit mines; and instruments on equipment subject to accidental contact during maintenance activities.

## Detectable Symptoms (P Condition)

- Instrument reading shifting suddenly after a known impact event (step change rather than gradual drift)
- Calibration verification showing >0.5% of span shift since last calibration (with impact event in between)
- Instrument disagreement with redundant measurement developing suddenly
- Visible damage to instrument housing, mounting bracket, or conduit connection
- Control loop suddenly showing offset that wasn't present before
- Mechanical gauge needle not returning to zero when depressurized
- Switch or relay actuating at different set-point than calibrated
- Alarm event log showing simultaneous multiple instrument deviations (correlated with impact event)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Input devices (ID) | Pressure gauges and transmitters on vibrating equipment, field instruments | Bourdon tubes, diaphragm seals, strain gauge elements, electronics |
| Control valves (CV) | Control valves with positioners on vibrating service | Positioner feedback linkage, nozzle-flapper mechanism, I/P converter |
| Safety devices (SD) | Pressure switches, vibration switches, limit switches | Switch mechanism, spring calibration, contact set-point |
| Analyzers (AN) | Field analyzers near crushers, pH meters on agitated tanks | Optical alignment, electrode reference, sample system tubing |
| Flow meters (FM) | Flow meters on slurry lines (water hammer exposure) | Transducer elements, coil alignment, signal conditioning |
| Level instruments (LI) | Level switches on vibrating hoppers, ultrasonic level gauges | Float mechanism, probe alignment, transducer mounting |
| Weighing equipment (WE) | Belt weighers on conveyors, truck scales at Khouribga | Load cells, lever systems, calibration weights, junction boxes |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Calibration verification (comparison with reference) | 3–12 months | ISA 67.04, IEC 61511 |
| Primary Effects | Post-event calibration check (after known impact) | After each event | OEM service procedure |
| Primary Effects | Redundant instrument cross-checking | Continuous | IEC 61511 |
| Vibration Effects | Vibration monitoring at instrument mounting locations | Monthly–quarterly | IEC 60068-2-6 (vibration rating) |
| Human Senses | Visual inspection of instrument mounting integrity | 1–4 weeks | OEM installation standard |

## Maintenance Strategy Guidance

### Condition-Based (preferred — event-driven)

- **Primary task**: `Verify calibration of Instrument [{tag}] after impact event`
- **Acceptable limits**: Drift ≤±0.5% of span for safety instruments per ISA 67.04. Drift ≤±1.0% of span for process instruments. Mounting bracket and conduit connections secure. No visible housing damage. Zero reading correct when process condition known.
- **Conditional comments**: If drift detected after impact event: recalibrate. If drift recurs after repeated impacts: relocate instrument to lower-vibration location, install vibration isolation mount, or upgrade to shock-resistant model (IEC 60068-2-27 rated). If mounting damage found: repair mounting before recalibration (unstable mounting invalidates calibration). If internal damage suspected (calibration won't hold): replace instrument.

### Fixed-Time (for vibration-prone installations)

- **Task**: `Calibrate instruments on Vibrating Screen [{tag}]`
- **Interval basis**: Instruments on vibrating equipment (screens, crushers, mills): calibration every 3–6 months (accelerated interval due to cumulative shock exposure). Instruments on mobile equipment: calibration every 6 months or per hours of operation. Belt weighers: verify with known test weight every 1–3 months per OIML R50. Install anti-vibration mounts (elastomeric isolators, remote mounting with capillary tubing for pressure) to extend calibration intervals.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for safety instruments (SIS/SIF) or custody transfer measurements. Acceptable for non-critical local indication instruments where moderate drift has no process or safety consequence — e.g., local pressure gauges for operator reference only (not connected to control or protection systems), provided redundant measurement exists for control purposes.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 3.4 Out of adjustment], [REF-01 §3.5 — CB strategy with operational basis]*
