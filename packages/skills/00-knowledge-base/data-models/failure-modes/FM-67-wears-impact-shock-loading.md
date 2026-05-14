# FM-67: Wears due to Impact/shock loading

> **Combination**: 67 of 72
> **Mechanism**: Wears
> **Cause**: Impact/shock loading
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — impact wear accumulates progressively with cumulative impacts; predictable from impact frequency and energy
> **ISO 14224 Failure Mechanism**: 2.4 Wear
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 3,000–15,000 hours depending on impact energy, frequency, and material toughness

## Physical Degradation Process

Wear due to impact/shock loading occurs when repeated high-energy impacts cause progressive material removal through surface fatigue, spalling, and deformation. Unlike single-impact damage (FM-56, FM-23), impact wear is the cumulative result of many repetitive impacts, each removing a small amount of material. The wear mechanism combines: surface fatigue (repeated impact generates subsurface cracks that propagate and release material as spall fragments); plastic deformation accumulation (each impact creates micro-deformation that accumulates into gross material loss); and work hardening followed by fracture (material at the impact surface hardens from repeated deformation until it becomes brittle enough to fracture under subsequent impacts).

Impact wear rate depends on: impact energy per event (mass × velocity²/2), impact frequency, angle of impact, material hardness and toughness (the optimal wear resistance is achieved with materials that can absorb impact energy through both plastic deformation and strain hardening — manganese steel is the classic example), and the nature of the impacting agent. Austenitic manganese steel (Hadfield steel, 12–14% Mn) is uniquely suited for impact wear because it work-hardens from 200 HB to 500 HB under repeated impact, creating a hard wear-resistant surface while maintaining a tough, crack-resistant core.

In OCP phosphate processing, impact wear is pervasive at: crusher liners where rock impacts at velocities of 5–15 m/s progressively erode the manganese steel; vibrating screen panels where material drops and impacts the screen surface; conveyor belt loading zones where falling material impacts the belt rubber; mill liners where the cascading charge (steel balls + rock at 25–40% of critical speed) impacts the liner surface; and chute and hopper impact zones where material free-falls and strikes the wall.

## Detectable Symptoms (P Condition)

- Progressive thickness reduction at impact zones (measurable by UT or template gauge)
- Visible wear pattern at impact locations (concave depressions, grooves, spalling)
- Crusher liner profile worn beyond OEM minimum per template measurement
- Screen panel apertures worn oversize (>110% of nominal opening)
- Mill liner height decreasing (measurable by internal survey during shutdown)
- Belt rubber cover thinning at loading zone (measurable by thickness gauge)
- Increasing product size from crushers (worn liner reduces closed-side setting accuracy)
- Rattling or abnormal noise indicating worn components have excessive clearance

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Crushers (CU) | ET-CRUSHER (CL-LINER-MANGANESE), jaw/cone/impact crushers | Manganese jaw plates, mantle/concave, blow bars, hammer tips |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL | Mill liners (rubber, steel, composite), lifter bars, grate plates |
| Screens (SC) | Vibrating screens at Khouribga/Benguerir | Screen panels (polyurethane, rubber, woven wire), side liners |
| Conveyors (CV) | ET-BELT-CONVEYOR loading zones, chute liners | Impact idlers, belt cover rubber, chute liner plates, skirt rubber |
| Storage equipment (ST) | Hoppers, bins, silos | Impact wear plates, hopper cone liners, feeder apron plates |
| Feeders (FE) | Apron feeders, vibrating feeders, belt feeders | Apron plates, liner plates, skirt plates, belt cover |
| Piping (PI) | Gravity chutes, transfer chutes | Chute liner (AR plate, ceramics, rubber), deflector plates |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Liner thickness/profile measurement (template, UT) | Monthly–quarterly | OEM specification |
| Physical Effects | Screen aperture measurement (go/no-go gauge) | 1–4 weeks | Screen manufacturer specification |
| Physical Effects / NDT | Mill liner internal survey (during shutdown) | Per reline cycle | OEM specification |
| Human Senses | Visual/audible inspection for excessive wear | Weekly | OEM manual |
| Primary Effects | Product size analysis (crushed/screened product PSD) | Daily–weekly | ISO 13320, ISO 13317 |
| Physical Effects | Belt cover thickness at loading zone | Monthly–quarterly | DIN 22102 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure liner thickness on Crusher [{tag}]`
- **Acceptable limits**: Liner thickness ≥ OEM minimum per template profile. Screen aperture within ±10% of nominal. Mill liner height ≥ minimum for effective grinding (typically 40–50% of original). Belt cover ≥ 50% of original thickness at loading zone. Crusher CSS (closed-side setting) within specification.
- **Conditional comments**: If crusher liner at 110–130% of minimum: plan replacement at next scheduled shutdown. If at or below minimum: schedule replacement within 7 days (risk of liner dislodging or rock-on-rock contact damaging frame). If screen apertures >110%: replace panels (product contamination with oversize). If mill liner height insufficient: schedule reline. Track wear rate to predict replacement timing — use exponential wear model (wear accelerates as liner thins because thinner liner provides less protection).

### Fixed-Time (primary strategy for wear components)

- **Task**: `Replace crusher liners on Crusher [{tag}]`
- **Interval basis**: Based on historical throughput and wear rate. Typical: jaw crusher plates 500–2,000 hours depending on rock hardness; cone crusher mantle/concave 1,500–4,000 hours; impact crusher blow bars 200–800 hours; mill liners 6,000–18,000 hours (rubber-steel composite); screen panels 1,000–5,000 hours; conveyor chute liners 3–12 months. Always validate with actual thickness measurement — throughput and rock hardness vary.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for sacrificial impact wear components specifically designed for wear and easy replacement (chute liner plates, screen panels, impact idler rubber rings) where complete wear-through causes only minor spillage or off-spec product rather than safety or environmental consequences. NOT acceptable for crusher liners (dislodgement risk), mill liners (exposure of shell to grinding media), or any wear surface whose failure causes equipment structural damage.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.4 Wear], [REF-01 §3.5 — FT strategy with operational basis]*
