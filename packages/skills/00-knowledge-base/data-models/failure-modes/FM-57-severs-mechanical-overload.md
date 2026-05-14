# FM-57: Severs (cut, tear, hole) due to Mechanical overload

> **Combination**: 57 of 72
> **Mechanism**: Severs (cut, tear, hole)
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — mechanical overload events causing severing are unpredictable; driven by abnormal loads, misoperation, or external forces exceeding ultimate material strength
> **ISO 14224 Failure Mechanism**: 2.5 Breakage
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on safety factor margin and load variability

## Physical Degradation Process

Severing due to mechanical overload occurs when applied mechanical forces exceed the ultimate tensile strength (UTS) of a component, causing it to tear, rupture, or separate. Unlike impact severing (FM-56) which involves sudden dynamic loads, mechanical overload severing can result from either sudden overload (single event exceeding UTS) or sustained overload (load exceeding yield strength causing progressive necking and eventual rupture). The failure mechanism follows the material's stress-strain curve: elastic deformation → yield → plastic deformation → necking → fracture.

For ductile materials (structural steel, copper), significant plastic deformation (elongation 15–30%) occurs before severance, providing visible warning. For brittle materials (cast iron, hardened steel, ceramics), fracture occurs with minimal plastic deformation (<2% elongation), providing little or no warning. The most dangerous scenario is when design safety factors have been eroded by prior damage (corrosion thinning, fatigue cracking, thermal degradation) and a normal operating load that was previously within the elastic range now exceeds the reduced section's UTS — this is a "weakest link" failure that appears sudden but has an underlying progressive cause.

In OCP phosphate processing, mechanical overload severing occurs in several contexts: wire rope severance on cranes and draglines when lifting loads exceed rope safe working load (particularly during phosphate ore handling at Khouribga open pit); conveyor belt tear or severance when material jams between belt and structure; hydraulic hose burst when system pressure exceeds hose rating (common on mobile equipment hydraulic systems); filter cloth tearing when differential pressure exceeds cloth tensile strength due to blinding; structural member failure on aging equipment supports that have section loss from corrosion combined with increased loading; and shaft severance on pumps and agitators when torque exceeds the reduced section capacity of a corroded or fretted shaft.

## Detectable Symptoms (P Condition)

- Visible plastic deformation (bending, stretching, necking) at stress concentration points
- Wire rope broken wires exceeding discard criteria (>6 in one lay length per ISO 4309)
- Hydraulic hose surface bulging, abrasion, or reinforcement wire exposure
- Increasing elongation or permanent set in lifting chains or slings (>3% of original length)
- Structural member deflection exceeding design limits (measured by survey or inclinometer)
- Crack initiation at stress risers (weld toes, sharp notches, keyways) detectable by MPI or DPI
- Filter cloth ΔP approaching maximum rated differential per manufacturer specification
- Shaft diameter reduction at corrosion/fretting sites (measurable by caliper or micrometer)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Cranes (CR) | Overhead cranes, gantry cranes, mobile cranes at Khouribga | Wire ropes, hooks, sheaves, structural boom members, outrigger legs |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevators | Belt carcass, splice joints, bucket attachments, take-up cables |
| Piping (PI) | High-pressure slurry piping, hydraulic piping | Pipe wall (at corroded/thinned sections), expansion bellows, hose assemblies |
| Pumps (PU) | ET-SLURRY-PUMP shaft, ET-CENTRIFUGAL-PUMP coupling | Pump shaft (at keyway, seal, or corrosion site), coupling elements, foundation bolts |
| Pressure vessels (VE) | Compressed air receivers, accumulators, autoclaves | Shell wall (at corrosion pits), nozzle necks, manway bolting |
| Structural steel (ST) | Equipment support frames, pipe racks, headframes | Tension members, gusset plates, connection bolts, column bases |
| Filters and strainers (FS) | ET-BELT-FILTER (CL-FILTER-CLOTH), pressure filters | Filter cloth, tie bars, filter plate lugs, clamp mechanisms |
| Lifting equipment (LE) | Chain hoists, hydraulic jacks, lifting slings | Chains, slings (wire rope and synthetic), shackles, eyebolts |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Wire rope inspection (visual + MRT) | 1–3 months | ISO 4309, AS 2759 |
| Physical Effects / NDT | Magnetic particle / dye penetrant inspection at stress risers | 6–12 months | ASME V Articles 6/7, ISO 9934/3452 |
| Physical Effects / NDT | Ultrasonic thickness at corroded/thinned areas | 3–6 months | API 574, ASME B31.3 |
| Primary Effects | Load monitoring on cranes and lifting equipment | Continuous | ISO 4310, AS 1418 |
| Human Senses | Visual inspection for deformation and damage | 1–4 weeks | API 574, AS 4100 |
| Physical Effects | Hydraulic hose pressure testing and visual inspection | 6–12 months | SAE J517, EN 853/857 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect wire rope condition on Crane [{tag}]`
- **Acceptable limits**: Broken wires ≤ discard number per ISO 4309 Table 2 (varies by rope construction). Rope diameter reduction ≤10% of nominal per ISO 4309. No visible corrosion, kinks, birdcaging, or core protrusion. For hydraulic hoses: no surface damage, bulging, or leakage; within manufacturer-specified service life. For structural steel: deflection within L/360 (beams) or H/200 (columns) per AS 4100.
- **Conditional comments**: If broken wire count >50% of discard criteria: increase inspection frequency to weekly, plan rope replacement within 60 days. If rope diameter reduction >7%: plan rope replacement at next opportunity. If hose surface damage exposes reinforcement: replace immediately (burst risk). If structural deflection exceeds limits: de-rate load, engineer repair/reinforcement. If shaft diameter reduction >5% at any section: schedule shaft replacement (stress concentration creates rupture risk).

### Fixed-Time (for life-limited components)

- **Task**: `Replace hydraulic hoses on Mobile Equipment [{tag}]`
- **Interval basis**: Hydraulic hoses: replace every 6–8 years regardless of condition per SAE J1273 (rubber aging degrades burst pressure even without visible damage). Wire ropes on cranes: maximum 5–8 years depending on classification per ISO 4309 Annex C, or when discard criteria reached — whichever is first. Lifting slings: discard at manufacturer-specified intervals or when inspection criteria exceeded per AS 1353. Filter cloth: replace based on throughput/cycles or when ΔP reaches 80% of maximum rating.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for lifting equipment (ropes, chains, slings, hooks) — severance causes dropped load with potentially fatal consequences. NEVER acceptable for pressure containment boundaries (vessels, piping, hoses at >10 bar). Acceptable only for non-safety, non-pressure components where severance causes only minor operational disruption — e.g., V-belts on non-critical drives, sacrificial shear pins (designed to sever as overload protection).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.5 Breakage], [REF-01 §3.5 — CB strategy with operational basis]*
