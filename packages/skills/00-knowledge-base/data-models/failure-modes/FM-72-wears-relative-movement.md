# FM-72: Wears due to Relative movement between contacting surfaces

> **Combination**: 72 of 72
> **Mechanism**: Wears
> **Cause**: Relative movement between contacting surfaces
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — fretting wear progresses predictably with cumulative oscillatory cycles as oxide debris accumulates and accelerates damage
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 8,000–40,000 hours depending on contact stress, oscillation amplitude, and surface treatment

## Physical Degradation Process

Wear due to relative movement between contacting surfaces — commonly termed fretting wear — occurs when two surfaces nominally clamped together experience small-amplitude oscillatory relative motion (typically 5–300 μm). This micro-motion breaks through protective oxide films at contacting asperities, exposing fresh metal that immediately re-oxidizes. The resulting oxide particles (Fe₂O₃ for steel — characteristic red-brown powder) are harder than the base metal and act as abrasive third bodies, accelerating wear. The process is self-reinforcing: fretting generates oxide debris → debris increases abrasive wear → increased wear produces more debris. The fretting wear coefficient is typically 10–100× higher than sliding wear at the same contact stress because the debris cannot escape from the confined contact zone.

Fretting occurs wherever nominally stationary joints experience vibration-induced micro-motion: interference fits (shaft-hub connections, bearing inner rings on shafts), bolted joints under transverse vibration, splined connections, pin joints, and wire rope strand contacts. The damage pattern is distinctive — localized pitting and material loss at the contact zone surrounded by characteristic oxide powder (red for steel, black for titanium, white for aluminum). Fretting also initiates fatigue cracks at the damaged zone because the fretting pits act as stress concentrators — fretting fatigue is the dominant failure mode for press-fitted shaft shoulders and bearing seats in rotating equipment.

In OCP phosphate processing, fretting wear is significant in: pump shaft bearing seats where vibration causes micro-motion between inner ring and shaft (particularly slurry pumps with high vibration levels); coupling hub bores on shafts; motor rotor cores on shafts; conveyor pulley hub-to-shaft connections; wire rope internal strand-to-strand fretting (the primary life-limiting mechanism for wire ropes under bending fatigue); crusher eccentric shaft bearing fits; and mill trunnion bearing seats. The pervasive vibration environment in OCP phosphate plants (screens, crushers, mills, conveyors) makes fretting a chronic issue requiring systematic attention to fit tolerances, surface treatments, and anti-fretting compounds.

## Detectable Symptoms (P Condition)

- Characteristic red-brown oxide powder (fretting debris) visible at press-fit interfaces or joint edges
- Shaft surface pitting and material loss at bearing seat or coupling hub contact zone
- Increasing bearing clearance on shaft (measured by dial indicator during maintenance)
- Wire rope internal corrosion products (red powder) visible between strands when rope is opened
- Spline tooth surface pitting and darkened contact pattern
- Fretting-initiated cracks at shaft shoulders or keyway edges (detectable by MPI/DPI)
- Increasing vibration from progressive fit loosening (1× and sub-synchronous components)
- Coupling hub loosening on shaft (detected by phase shift in vibration analysis)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP, ET-CENTRIFUGAL-PUMP (bearing seats) | Shaft at bearing inner ring seat, coupling hub bore, impeller hub bore |
| Electric motors (EM) | Motors on pumps, conveyors, crushers (rotor fit) | Rotor core on shaft, bearing seats, coupling end shaft surface |
| Conveyors (CV) | ET-BELT-CONVEYOR pulley-to-shaft connections | Pulley hub bore, shaft at taper lock or key seat, idler bearing seats |
| Crushers (CU) | ET-CRUSHER eccentric shaft, main shaft bearing fits | Eccentric shaft at bushing contact, main shaft at head/mantle seat |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL trunnion bearing fits | Trunnion shaft at bearing seat, gear hub to shaft, pinion shaft bearings |
| Cranes (CR) | Wire ropes, sheave shaft bearings, hook swivel | Wire rope (internal strand fretting), sheave shaft at bearing seat |
| Couplings (CG) | Gear couplings, rigid couplings, keyed hubs | Hub bore on shaft, key-to-keyway contact, spline tooth flanks |
| Fans (FA) | ID/FD fans, process ventilation (hub-to-shaft) | Fan hub on shaft, bearing inner ring seat, shaft at coupling end |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual inspection for fretting debris at fit interfaces | 3–12 months | OEM specification |
| Vibration Effects | Vibration monitoring for progressive looseness | 1–4 weeks | ISO 10816, ISO 20816 |
| Physical Effects / NDT | Magnetic particle inspection at shaft shoulders and keyways | 12–24 months | ISO 9934, ASME V Art. 7 |
| Physical Effects | Shaft diameter measurement at bearing/coupling seats | During overhaul | API 686, OEM specification |
| Chemical Effects | Wire rope internal inspection for corrosion products | 3–6 months | ISO 4309 |
| Physical Effects / NDT | Ultrasonic inspection for fretting fatigue cracks | 12–24 months | ASME V Art. 5, ISO 17640 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor vibration on Pump [{tag}] for fit loosening`
- **Acceptable limits**: No visible fretting debris at accessible fit interfaces. Shaft diameter at bearing seats within OEM tolerance (typically h6 or j6 per ISO 286). Bearing inner ring-to-shaft clearance <0.025 mm (interference fit maintained). Wire rope internal condition per ISO 4309 Section 8. No cracks at shaft shoulders per MPI/DPI.
- **Conditional comments**: If fretting debris visible at bearing seat or coupling hub: plan shaft inspection at next overhaul, measure shaft diameter and roundness. If shaft undersize at bearing seat: apply shaft repair (metal spray + grinding to tolerance, or sleeve installation). If fretting cracks detected at shaft shoulder: replace shaft (fatigue crack propagation risk). If wire rope internal fretting severe (>30% metallic area loss): replace rope within 60 days. Consider anti-fretting compounds (Molykote D-321R or equivalent) at all press-fit interfaces during reassembly.

### Fixed-Time (for proactive fit management)

- **Task**: `Inspect shaft fits on Pump [{tag}] during overhaul`
- **Interval basis**: Measure shaft diameter at all fit locations during every bearing or seal replacement. Wire rope internal inspection per ISO 4309 at intervals not exceeding 6 months for classification D ropes. Apply anti-fretting surface treatments at reassembly: knurling for light interference fits, ceramic-filled epoxy for damaged seats, thermal spray for severely worn shafts. Use interference fits per OEM specification — neither too tight (assembly damage) nor too loose (fretting). Typical shaft-to-bearing fit: j5/j6 for rotating inner ring per ISO 286, H7/h6 for stationary applications.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for rotating shaft fits (bearing seats, coupling hubs, impeller bores) — progressive fretting leads to sudden fit failure with catastrophic secondary damage (bearing migration, coupling separation, impeller release). NEVER acceptable for wire ropes where internal fretting reduces breaking strength below safety factor. Acceptable only for non-critical, easily inspected static joints where fretting causes cosmetic damage only (e.g., equipment mounting pads, non-structural covers).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — CB strategy with operational basis]*
