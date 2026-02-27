# FM-20: Cracks due to Cyclic loading (thermal/mechanical)

> **Combination**: 20 of 72
> **Mechanism**: Cracks
> **Cause**: Cyclic loading (thermal/mechanical)
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — fatigue cracks initiate and propagate progressively with accumulated cycles; life is predictable from stress amplitude and S-N curve data
> **ISO 14224 Failure Mechanism**: 2.6 Fatigue
> **Weibull Guidance**: β typically 3.0–5.0 (wear-out), η 10⁶–10⁹ cycles depending on stress amplitude, material fatigue limit, and surface condition

## Physical Degradation Process

Fatigue cracking due to cyclic loading is the initiation and stable propagation of cracks under repeated mechanical or thermal stress cycling. This differs from FM-05 (Breaks/Fracture/Separates due to Cyclic loading) in that this failure mode describes the cracking stage BEFORE final separation — the crack exists and grows but the component has not yet fractured. Detecting and managing cracks in this stage is the primary objective of on-condition maintenance for fatigue-prone components.

Fatigue crack initiation occurs at stress concentrations (weld toes, notches, keyways, corrosion pits, machining marks) where local stress exceeds the material's fatigue endurance limit. For steels, the endurance limit is approximately 40–50% of UTS for smooth specimens but can be reduced to 10–20% of UTS at poorly finished weld toes. Once initiated, the crack propagates per Paris' law: da/dN = C(ΔK)^m, where the growth rate depends on the stress intensity factor range (ΔK) at the crack tip. This growth is stable and measurable — crack length can be tracked over time to predict remaining life.

Thermal fatigue cracks follow the Coffin-Manson low-cycle fatigue relationship where the plastic strain range per cycle determines fatigue life. Thermal cycling creates strain through differential expansion (Δε = α × ΔT). Components experiencing frequent startup/shutdown cycles are most affected. Thermal fatigue cracks are typically surface-initiating, closely spaced, and oriented perpendicular to the maximum thermal stress direction — a distinctive "elephant skin" or "crazy paving" crack pattern.

In OCP phosphate processing, fatigue cracking is prevalent in: weld joints on vibrating screen structures at Khouribga (10⁸+ cycles per year at 900–1200 RPM excitation); small-bore piping connections on main headers subjected to vibration; kiln and dryer shell sections experiencing thermal cycling during operational fluctuations; pump casings at nozzle-to-body welds from pressure cycling; and foundation bolts on reciprocating equipment.

## Detectable Symptoms (P Condition)

- Surface cracks detectable by MPI, DPI, or eddy current at known fatigue-prone locations
- Crack growth measurable between successive NDE inspections (track rate per Paris' law)
- Oxide staining (rust bleeding) at crack mouths on carbon steel (crack "weeping")
- Vibration signature change indicating stiffness reduction (natural frequency decrease)
- Acoustic emission events during load cycling (crack growth bursts)
- Beach marks / clamshell marks visible on exposed fracture surfaces (if partially cracked)
- Strain gauge readings showing stress redistribution around developing crack

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Vibrating equipment (VS) | Vibrating screens, vibrating feeders | Side plates, cross-beams, deck support welds, spring mounts |
| Piping (PI) | Small-bore connections, thermal cycling piping, vibrating piping | Socket welds, branch connections, expansion loop elbows |
| Pressure vessels (VE) | Cyclic-pressure vessels, thermal cycling vessels | Nozzle-to-shell welds, saddle/skirt attachment welds, manway reinforcement |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL shell and trunnion | Shell-to-head welds, liner bolt holes, trunnion fillet radius |
| Pumps (PU) | ET-SLURRY-PUMP casing, high-pressure pumps | Casing nozzle welds, volute tongue, shaft at keyway/step |
| Rotary equipment (RO) | Rotary kilns, rotary dryers | Shell butt welds, tire contact zone, support ring welds |
| Cranes (CR) | Overhead crane beams, runway beams | Welded connections, rail clips, wheel axle fillets |
| Heat exchangers (HE) | Thermal cycling heat exchangers, tube-to-tubesheet joints | Tube-to-tubesheet welds, expansion joint bellows |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Magnetic particle inspection (MPI) at welds | 6–12 months | ASME V Article 7, ISO 9934 |
| Physical Effects / NDT | Dye penetrant inspection (DPI) | 6–12 months | ASME V Article 6, ISO 3452 |
| Physical Effects / NDT | Phased array UT for crack sizing | 6–12 months | ASME V Article 4, ISO 16826 |
| Physical Effects / NDT | Eddy current at known initiation sites | 6–12 months | ASME V Article 8, ISO 15548 |
| Physical Effects / NDT | Time-of-flight diffraction (TOFD) for crack depth | 6–12 months | ASME V Article 4, BS 7706 |
| Vibration Effects | Vibration monitoring (natural frequency shift) | 1–4 weeks | ISO 10816, ISO 13373 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform MPI on Screen Side Plates [{tag}]`
- **Acceptable limits**: No crack indications at weld toes per ASME VIII or BS 7608 acceptance criteria. For tracked cracks: growth rate within fracture mechanics prediction with safety factor ≥2 on remaining life per BS 7910. For weld joints: no linear indications >3 mm. For shafts: no indications at keyways, steps, or fillet radii.
- **Conditional comments**: If crack <10% of section: monitor at 3–6 month intervals, engineer repair plan per BS 7910 fitness-for-service. If crack 10–25% of section: schedule weld repair at next planned outage using approved repair procedure per ASME PCC-2 Article 401. If crack >25% of section or growth rate exceeding prediction: remove from service for repair or replacement — risk of sudden fracture. After weld repair: perform NDE to verify repair quality, apply weld toe grinding or peening to improve fatigue life at repair location.

### Fixed-Time (for fatigue-life management)

- **Task**: `Inspect fatigue-critical welds on Screen [{tag}]`
- **Interval basis**: Inspection intervals based on design fatigue life and safety factor per BS 7608 or DNV-RP-C203. For vibrating screens: inspect all fatigue-critical welds every 6–12 months (high cycle count). For pressure vessels: interval per API 510 risk-based inspection, considering cyclic service factor. For piping: per API 570, with reduced intervals for small-bore connections (<50 mm) in vibrating service. Implement fatigue life tracking for critical components — when 50% of design fatigue life consumed, initiate NDE program.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure boundaries, structural load-bearing members, rotating shafts, or any component where crack propagation to fracture has safety consequences. Acceptable only for non-critical, non-pressure, non-structural elements where cracking is cosmetic and replacement is simple — but even then, periodic monitoring is recommended to prevent unexpected crack extension.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects (NDT)], [ISO 14224 Table B.2 — 2.6 Fatigue], [REF-01 §3.5 — CB strategy with operational basis]*
