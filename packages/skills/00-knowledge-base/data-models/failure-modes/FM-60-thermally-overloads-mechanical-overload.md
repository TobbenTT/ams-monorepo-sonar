# FM-60: Thermally Overloads (burns, overheats, melts) due to Mechanical overload

> **Combination**: 60 of 72
> **Mechanism**: Thermally Overloads (burns, overheats, melts)
> **Cause**: Mechanical overload
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — mechanical overload events are unpredictable and driven by process upsets, material variations, and abnormal operating conditions; not age-related
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on overload margin, thermal mass, and protection adequacy

## Physical Degradation Process

Thermal overload due to mechanical overload occurs when an equipment item is subjected to mechanical loads exceeding its design capacity, forcing the prime mover (typically an electric motor) to draw excess current to deliver the required torque. The excess current generates resistive heating (P = I²R) in motor windings, cables, and connections that exceeds the heat dissipation capacity. For electric motors, winding temperature rises approximately with the square of the load ratio — a motor at 120% load generates approximately 44% more heat than at rated load. This excess heat degrades winding insulation per the Arrhenius model, ultimately causing insulation failure and motor burnout.

The mechanical overload condition can be sustained (continuous overload due to process conditions) or transient (intermittent peaks during abnormal events). Sustained overloads at 110–130% of rated load cause progressive thermal degradation over hours to days, often without tripping conventional thermal overload relays if the overload is just above the relay's service factor setting. Transient overloads at >150% cause rapid temperature excursions that can exceed insulation thermal limits within minutes. Repeated thermal cycling from intermittent overloads causes cumulative insulation damage even when individual events are within thermal relay trip times.

In OCP phosphate processing, mechanical overload is a critical failure cause for several equipment types: SAG mill and ball mill motors overload when feed hardness exceeds specification or when mill charge ratio is incorrect (typically during grade transitions at Khouribga); crusher motors overload when uncrushable tramp material enters the crushing chamber; slurry pump motors overload when slurry density increases above design (>1.6 SG in phosphate slurry circuits); belt conveyor motors overload during material surge loading, wet material sticking to belts, or belt misalignment increasing friction; and compressor motors overload when discharge pressure exceeds design due to downstream blockage or fouled intercoolers.

## Detectable Symptoms (P Condition)

- Motor current trending >100% of nameplate full load amps (FLA) during normal operation
- Motor winding temperature exceeding thermal class rating (measured by RTD/thermocouple: Class B >130°C, F >155°C, H >180°C)
- Elevated motor frame temperature detectable by thermography (>15°C above similar unloaded motor)
- Thermal overload relay or electronic overload tripping repeatedly (>2 trips per month indicates developing problem)
- Bearing temperature increase due to shaft deflection from overload forces (>10°C above baseline per ISO 10816)
- Visible darkening or discoloration of motor paint near end-bells indicating excessive internal heat
- Insulation resistance declining between scheduled tests (>10% drop in 6 months per IEEE 43)
- Vibration amplitude increase at 1× running speed indicating rotor deflection from overload torque

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive (CL-MOTOR-HV), ET-BALL-MILL drive, ET-CRUSHER drive, ET-COMPRESSOR drive | Stator winding insulation, rotor bars/end rings, bearings (increased load) |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), ET-CENTRIFUGAL-PUMP, ET-VACUUM-PUMP | Motor coupling, impeller (increased torque demand), mechanical seal (shaft deflection) |
| Compressors (CO) | ET-COMPRESSOR (CL-VALVE-INLET), instrument air compressors | Drive motor, coupling, valves (increased differential pressure) |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR (CL-BELT-RUBBER), bucket elevators | Drive motor, gearbox, belts/chains (increased tension) |
| Crushers (CU) | ET-CRUSHER (CL-LINER-MANGANESE), jaw/cone/impact crushers | Drive motor, toggle plate/mantle, bearings (shock loading) |
| Agitators and mixers (AG) | Slurry agitators in attack tanks, thickener rakes | Drive motor, gearbox, shaft/impeller (increased viscosity load) |
| Fans (FA) | Process fans, ID/FD fans on kilns and dryers | Drive motor, bearings, shaft (increased air density or system resistance) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Electrical Effects | Motor current monitoring (continuous or periodic) | Continuous–weekly | NEMA MG-1, IEC 60034-1 |
| Temperature Effects | Motor winding temperature monitoring (RTD/thermocouple) | Continuous | IEEE 1 (motor protection), IEC 60034-11 |
| Temperature Effects | Thermography of motor frame and connections | 1–3 months | NETA MTS, ISO 18434-1 |
| Vibration Effects | Vibration monitoring for overload-induced deflection | 1–4 weeks | ISO 10816, ISO 20816 |
| Electrical Effects | Insulation resistance trending | 6–12 months | IEEE 43 |
| Primary Effects | Process parameter monitoring (flow, pressure, load) | Continuous | Process design specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor motor current on Drive Motor [{tag}]`
- **Acceptable limits**: Running current ≤100% nameplate FLA at rated voltage per NEMA MG-1. Winding temperature ≤insulation class rating minus 10°C safety margin per IEEE 1. Current unbalance between phases ≤5%. Service factor: sustained operation >SF×FLA not recommended regardless of relay setting.
- **Conditional comments**: If current 100–110% FLA sustained: investigate mechanical load cause, reduce load to rated within 72 hours. If current 110–125% FLA: reduce load immediately, investigate root cause (process overload, mechanical binding). If winding temperature within 10°C of class limit: reduce load immediately, verify cooling system (fan, air filters). If thermal overload trips >2× per month: do NOT increase relay setting — investigate and correct mechanical overload cause.

### Fixed-Time (for thermal protection verification)

- **Task**: `Test thermal overload protection on Motor Circuit [{tag}]`
- **Interval basis**: Verify thermal overload relay/electronic overload trip settings annually per NETA MTS. Confirm settings match motor nameplate FLA and service factor. For electronic overloads: verify thermal model parameters (I²t curve, trip class). For critical mill/crusher drives: calibrate current transformers feeding protection relays every 3 years per IEC 60044.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for motors driving critical process equipment (mills, crushers, main conveyors) — thermal overload burnout causes extended outages (motor rewinding/replacement 2–12 weeks). Acceptable only for small (<5 kW), non-critical, individually protected motors where spares are stocked and replacement can occur within the process buffer time.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
