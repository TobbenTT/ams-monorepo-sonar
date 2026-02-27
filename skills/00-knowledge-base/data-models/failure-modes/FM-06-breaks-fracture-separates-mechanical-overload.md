# FM-06: Breaks/Fracture/Separates due to Mechanical overload

> **Combination**: 6 of 72
> **Mechanism**: Breaks/Fracture/Separates
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — mechanical overload events causing fracture are unpredictable; driven by abnormal loads, process upsets, tramp material, or misoperation
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on design safety factor and load variability

## Physical Degradation Process

Fracture due to mechanical overload occurs when a single applied load or a combination of loads exceeds the ultimate strength of the component, causing immediate separation. For ductile materials (mild steel, stainless steel), significant plastic deformation precedes fracture — the material necks, elongates, and deforms visibly before separating with a cup-and-cone fracture surface. For brittle materials (cast iron, hardened steel, ceramics, concrete), fracture occurs with minimal plastic deformation — a sudden, clean break with a flat, granular fracture surface. Many real-world fractures are mixed-mode: a prior crack or defect (from fatigue, corrosion, or manufacturing) reduces the effective cross-section until a normal operating load exceeds the reduced section's capacity.

The critical distinction from fatigue fracture (FM-05) is that overload fracture is a single-event failure — the load on the cycle of failure exceeds the material capacity, whereas fatigue requires many sub-critical cycles. However, in practice, the two mechanisms often interact: prior fatigue cracking reduces the section, and then a normal or slightly elevated operating load causes the remaining section to fracture by overload. Fracture toughness (K_IC) governs the critical crack size for unstable fracture — brittle materials with low K_IC (cast iron: ~20 MPa√m) are far more susceptible to sudden overload fracture than tough materials (structural steel: ~100 MPa√m).

In OCP phosphate processing, overload fracture is most common in: crusher toggle plates (designed as a sacrificial fuse element that breaks to protect the main frame when uncrushable material enters); SAG mill liner bolts that fracture when liners shift during charge cascading; pump shafts that fracture when the impeller contacts tramp material or when hydraulic shock loading occurs during valve slam; conveyor belt splice failures during surge loading or material jam; and structural steel connections at aging installations where corrosion section loss has reduced the member capacity below the applied load.

## Detectable Symptoms (P Condition)

- Visible deformation or bending at overloaded connections (yield precedes fracture in ductile materials)
- Cracks developing at stress concentration points under high load (precursor to overload fracture)
- Section loss from corrosion or wear reducing safety factor below acceptable margin (measured by UT/caliper)
- Repeated overload events logged by protection systems (limit switches, load cells, torque monitors)
- Material hardness change at highly stressed zones (strain hardening preceding fracture)
- Bolt stretch (permanent elongation) measured by ultrasonic bolt gauging (>1% indicates yield)
- Audible yielding sounds (creaking, groaning) from heavily loaded structural members
- Vibration pattern change indicating looseness or incipient structural failure

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Crushers (CU) | ET-CRUSHER (CL-LINER-MANGANESE), jaw/cone/impact crushers | Toggle plate (designed fuse), main shaft, frame tie rods, flywheel key |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL | Liner bolts, girth gear teeth, trunnion bearing caps, discharge grate |
| Pumps (PU) | ET-SLURRY-PUMP shaft, ET-CENTRIFUGAL-PUMP impeller | Pump shaft, impeller hub/vanes, coupling bolts, bearing housing |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevators | Belt splice joints, take-up screw, bucket attachment pins, drive chain links |
| Structural steel (ST) | Equipment support structures, pipe racks, platforms, headframes | Gusset plates, connection bolts, column base plates, bracing rods |
| Valves (VA) | Large isolation valves, gate valves on slurry circuits | Stem (at packing gland), handwheel key, yoke bolts, body-bonnet bolts |
| Gearboxes (GB) | Mill gearbox, crusher gearbox, conveyor drive gearbox | Gear teeth, input/output shafts, bearing retainer bolts, housing |
| Cranes (CR) | Overhead cranes, mobile cranes | Hook, sheave pins, boom sections, outrigger cylinders |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Ultrasonic thickness at corroded/worn sections | 3–12 months | API 574, ASME B31.3 |
| Physical Effects / NDT | MPI/DPI at stress concentration points | 6–12 months | ASME V Articles 6/7 |
| Primary Effects | Load monitoring (load cells, torque sensors) | Continuous | Equipment design specification |
| Human Senses | Visual inspection for deformation and yielding signs | 1–4 weeks | API 574, AS 4100 |
| Physical Effects / NDT | Ultrasonic bolt tension measurement | 6–12 months | ASTM E1685 |
| Vibration Effects | Vibration monitoring for looseness/structural change | 1–4 weeks | ISO 10816 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect structural condition of Crusher Frame [{tag}]`
- **Acceptable limits**: No visible plastic deformation at connections or load-bearing members. Section thickness ≥ minimum design per fitness-for-service assessment (API 579/ASME FFS-1). All bolts torqued to specification. Toggle plate intact (for crushers). Safety factor ≥ 2.0 on UTS at maximum operating load for critical components.
- **Conditional comments**: If deformation visible but <50% of fracture elongation: reduce load, schedule repair/reinforcement within 30 days. If cracks detected at stress risers: assess criticality by fracture mechanics (BS 7910), plan repair or replacement based on remaining life. If section loss >30% of original: de-rate component capacity, plan replacement. If toggle plate fractured: replace immediately (this is designed behavior — ensure correct replacement grade is used as a calibrated fuse).

### Fixed-Time (for sacrificial/fuse elements)

- **Task**: `Inspect and replace toggle plate on Crusher [{tag}]`
- **Interval basis**: Toggle plates: inspect at every major crusher shutdown, replace when fractured or when visual inspection shows prior cracking (do NOT upgrade to higher strength — toggle must fail before main frame). Liner bolts on mills: replace at each relining campaign (consider bolts consumed). Belt splices: inspect visually every 3 months, destructive test sample splices every 12–24 months per DIN 22110. Critical structural bolts: replace every 5–10 years (fatigue life of pre-loaded bolts per VDI 2230).

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for designed sacrificial elements (crusher toggle plates, shear pins, rupture discs) where fracture IS the intended protective function and the fracture does not create a safety hazard. NOT acceptable for load-bearing structural members, rotating shafts, pressure boundaries, or lifting equipment where sudden fracture can cause personnel injury, environmental release, or cascading equipment damage.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
