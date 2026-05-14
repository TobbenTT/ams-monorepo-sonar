# FM-47: Looses Preload due to Vibration

> **Combination**: 47 of 72
> **Mechanism**: Looses Preload
> **Cause**: Vibration
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — vibration-induced loosening is progressive with cumulative operational cycles; rate depends on vibration amplitude and bolt joint design
> **ISO 14224 Failure Mechanism**: 1.5 Looseness
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 5,000–30,000 hours depending on vibration severity, bolt grade, and locking method

## Physical Degradation Process

Preload loss due to vibration occurs when cyclic lateral (transverse) forces cause relative slip between the bolt head/nut and the clamped surfaces, progressively rotating the nut in the loosening direction. This mechanism, characterized by Junker (1969), is the dominant cause of bolted joint loosening in vibrating machinery. The critical parameter is the ratio of transverse force to clamp force — when transverse forces from vibration overcome friction under the nut/bolt head, the nut experiences a net loosening torque. Each vibration cycle produces a small incremental rotation (typically 0.001–0.01° per cycle), and over thousands of cycles, the cumulative rotation significantly reduces preload.

The loosening progression follows three stages: initial bedding-in (first 100–1,000 cycles) where surface asperities on mating surfaces flatten and embedding of the bolt head/nut reduces preload by 5–15% without nut rotation; progressive loosening (steady-state) where nut rotation occurs at a rate proportional to vibration amplitude and inversely proportional to remaining preload; and accelerated loosening where reduced preload increases the slip ratio, causing the loosening rate to increase exponentially — once a joint begins to loosen, it accelerates rapidly. Joints without positive locking devices (lock nuts, lock wire, nord-lock washers) are particularly susceptible.

In OCP phosphate processing, vibration-induced loosening is pervasive due to the heavy vibratory equipment throughout the value chain: vibrating screens at Khouribga and Benguerir beneficiation plants generate severe vibration (10–25 mm/s RMS) transmitted to structural bolting and guard connections; SAG mill and ball mill foundations experience continuous low-frequency vibration (3–8 Hz) that loosens anchor bolts and foundation connections; crushers generate high-amplitude impact vibration that loosens liner bolts, toggle plate connections, and guard fasteners; and belt conveyor structures experience continuous vibration from idler rotation and belt flap. The combination of phosphate dust (which acts as a dry lubricant reducing friction under bolt heads) and vibration is particularly aggressive.

## Detectable Symptoms (P Condition)

- Visible rotation marks or witness marks on bolt/nut showing relative movement from initial position
- Bolt torque check showing <70% of specified installation torque (calibrated wrench per ASME PCC-1)
- Audible rattling or clicking from loose bolted connections during operation
- Visible gap developing between clamped surfaces or at flange joints
- Increasing vibration amplitude at structural connections (loose bolts reduce joint stiffness)
- Lock washers flattened, lock wire broken, or locking tab bent back (indicating nut has rotated)
- Paint crack-tell indicators broken at bolt/nut/surface interface
- Bolt protrusion above nut increasing (nut backing off), measurable by ruler or depth gauge

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Vibrating equipment (VS) | Vibrating screens (Khouribga, Benguerir), vibrating feeders | Screen deck bolts, side plate connections, spring mounting bolts, motor base bolts |
| Crushers (CU) | ET-CRUSHER (jaw, cone, impact), hammer mills | Liner retention bolts, toggle plate connections, guard bolting, bearing housing bolts |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL foundations and accessories | Foundation anchor bolts, trunnion bearing bolts, liner bolts, gear guard connections |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevators | Structural splice bolts, idler frame bolts, pulley bearing bolts, guard bolting |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), ET-CENTRIFUGAL-PUMP | Base plate anchor bolts, coupling guard bolts, bearing housing bolts |
| Fans (FA) | ID/FD fans, process ventilation fans | Foundation bolts, bearing pedestal bolts, inlet damper linkage |
| Compressors (CO) | Reciprocating compressors, screw compressors | Foundation anchor bolts, cylinder head bolts, crosshead guide bolts |
| Structural steel (ST) | Equipment support structures, pipe racks, platforms | Splice connections, bracing bolts, handrail connections, grating clips |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Torque audit (calibrated wrench check) | 3–6 months | ASME PCC-1, VDI 2230 |
| Human Senses | Visual inspection for loosening indicators | 1–4 weeks | AS 4100, ASME PCC-1 |
| Vibration Effects | Vibration monitoring at bolted joints | 1–4 weeks | ISO 10816, ISO 20816 |
| Physical Effects | Witness mark / paint-tell indicator inspection | 1–4 weeks | Industry best practice |
| Physical Effects / NDT | Ultrasonic bolt tension measurement (critical joints) | 6–12 months | ASTM E1685 |

## Maintenance Strategy Guidance

### Condition-Based (preferred for accessible joints)

- **Primary task**: `Check bolt torque on Vibrating Screen Frame [{tag}]`
- **Acceptable limits**: Bolt preload ≥80% of specified installation torque per equipment manual. All locking devices intact (lock nuts tight, lock wire unbroken, nord-lock washers engaged). No visible relative rotation between bolt/nut and clamped surface. No audible looseness during operation.
- **Conditional comments**: If preload 60–80% of target: re-torque to specification using correct sequence, inspect for surface damage. If preload <60% or nut has rotated >30°: replace bolt/nut set (possible thread damage from relative rotation under load), upgrade locking method. If multiple bolts in same joint loose: investigate vibration source, consider vibration isolation or joint redesign. If anchor bolts loose: check for grout cracking and foundation degradation.

### Fixed-Time (primary strategy for vibrating equipment)

- **Task**: `Re-torque structural bolting on Vibrating Screen [{tag}]`
- **Interval basis**: Vibrating screens and feeders: every 500–1,000 operating hours (monthly). Crusher liner bolts: check every 500 hours, re-torque after each liner change. Mill foundation bolts: every 6 months. Conveyor structural splices: every 12 months. Use calibrated torque wrench or tension-indicating washers. Apply anti-vibration locking: nord-lock washers for critical joints, chemical thread-lock (Loctite 243) for non-removable fasteners, lock wire for safety-critical connections per AS/NZS 1252.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for structural connections, rotating equipment foundations, safety guards, or any bolted joint where loosening could cause equipment detachment, structural collapse, or personnel hazard. Acceptable only for non-critical cosmetic or non-structural fasteners (equipment nameplates, access covers on non-pressurized enclosures) where loss has no safety or functional consequence.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 1.5 Looseness], [REF-01 §3.5 — FT strategy with operational basis]*
