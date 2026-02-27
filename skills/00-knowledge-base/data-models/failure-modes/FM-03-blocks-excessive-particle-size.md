# FM-03: Blocks due to Excessive particle size

> **Combination**: 3 of 72
> **Mechanism**: Blocks
> **Cause**: Excessive particle size
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — oversized particle ingress events are unpredictable; blockage depends on upstream screening reliability and process upsets
> **ISO 14224 Failure Mechanism**: 5.1 Blockage/plugged
> **Weibull Guidance**: β typically 0.8–1.2 (random), η highly variable depending on upstream screening effectiveness and feed variability

## Physical Degradation Process

Particles exceeding the component's design passage size lodge at restrictions, orifices, or between close-tolerance surfaces, causing sudden flow obstruction. In screens and filters, oversized particles bridge across openings. In valves, particles wedge between seat and disc or plug and body. In pumps, oversized solids jam between impeller and wear ring or casing. Unlike gradual contamination buildup (FM-02), blockage from oversized particles can be sudden and complete when a single large particle or agglomerate enters the system — the transition from normal flow to zero flow can occur within seconds.

The root causes of oversized particle ingress are: upstream screening failure (screen panel perforation, trommel damage, or grizzly bar breakage allowing oversize material through); crusher product variation (when crusher setting opens due to wear or hydraulic system failure, product size increases); process upset generating abnormal solids (scale fragments from vessel walls, collapsed refractory, broken liner pieces); and agglomeration of fine particles into oversize clumps (common in wet sticky materials like phosphate clay). The blockage severity depends on the ratio of particle size to passage size — particles between 60–100% of passage size are most likely to bridge; particles >100% block instantly; particles <60% generally pass through.

In OCP phosphate beneficiation, this failure mode is critical at: trommel screens downstream of SAG mills at Khouribga where ball fragments and oversize pebbles must be separated; hydrocyclone feed distributors where oversize particles can block individual cyclone inlets; pinch valve orifices in slurry circuits where rock fragments wedge and prevent valve closure; filter feed distributors where agglomerated gypsum can block nozzles; and conveyor belt scraper blades that become fouled with large sticky material. The OCP phosphate ore variability between geological zones (Zone A/B/C at Khouribga) means that particle size distribution can change significantly with mining advance, creating unpredictable oversize events.

## Detectable Symptoms (P Condition)

- Sudden step-change increase in differential pressure (>100% within minutes, not gradual trend)
- Upstream pressure spike >15% with simultaneous downstream pressure drop
- Flow rate drop >20% not explained by demand changes
- Screen or strainer differential pressure alarm activation
- Audible flow restriction, hammering, or banging sounds in piping
- Cyclone operation anomaly (spray angle change, roping at apex)
- Pump cavitation noise or flow instability (blocked suction strainer)
- Visible accumulation of oversize material at screens or grizzly bars

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Filters and strainers (FS) | ET-SAG-MILL trommel screen, bucket strainers, Y-strainers | Screen panels, strainer baskets, mesh elements |
| Valves (VA) | Pinch valves (CL-VALVE-PINCH) on slurry circuits, knife gate valves | Pinch tube throat, gate/disc passage, seat ring, small-bore ports |
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), ET-CENTRIFUGAL-PUMP | Suction strainer, impeller eye, wear ring clearance, balance passages |
| Hydrocyclones (HC) | Classification hydrocyclones at Khouribga/Benguerir | Inlet feed nozzle, apex (spigot) orifice, vortex finder entry |
| Piping (PI) | Slurry pipelines, restriction orifices, flow nozzles | Orifice plates, restriction fittings, small-bore branches, tee pieces |
| Input devices (ID) | Flow meters (CL-INSTR-FLOW), sample probes, density meters | Orifice bore, venturi throat, sample probe tips, impulse connections |
| Nozzles and distributors (ND) | Filter feed distributors, spray nozzles, washing nozzles | Nozzle orifice, distributor manifold passages, spray holes |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Differential pressure monitoring with alarm | Minutes–hours | OEM max ΔP specification |
| Primary Effects | Flow rate monitoring with low-flow alarm | Minutes–hours | Process design specification |
| Primary Effects | Upstream particle size analysis (PSA) | Daily–weekly | ISO 13317, ISO 13320 |
| Human Senses | Visual inspection of strainers, screens, and reject streams | 1–3 days | OEM service manual |
| Primary Effects | Cyclone performance monitoring (inlet pressure, underflow density) | Continuous | Cyclone design specification |

## Maintenance Strategy Guidance

### Condition-Based (preferred — alarm-driven)

- **Primary task**: `Monitor ΔP on Suction Strainer [{tag}]`
- **Acceptable limits**: ΔP ≤ OEM maximum for clean/partially loaded condition. Flow rate ≥minimum design for downstream process requirement. Upstream PSA within specification (P80 within ±10% of target).
- **Conditional comments**: If sudden ΔP increase >100% of baseline: clear blockage at next safe opportunity (may require process shutdown). If repeated blockage events (>2 per month): investigate upstream screening effectiveness, inspect screen panels for perforation, verify crusher settings. If cyclone performance deviation >15%: check for blocked cyclone inlets, inspect feed distributor. For automated strainers: verify auto-backwash cycle initiating correctly on ΔP trigger.

### Fixed-Time (for upstream screening maintenance)

- **Task**: `Inspect screen panels on Trommel Screen [{tag}]`
- **Interval basis**: Visual inspection of screening media at every planned shutdown (weekly for vibrating screens, monthly for trommel screens). Replace screen panels based on open area measurement — replace when >10% of apertures are blinded, damaged, or worn oversize per OEM specification. Inspect grizzly bars: check for broken or displaced bars every shutdown. For automated backwash strainers: clean override timer set to maximum tolerable interval (typically 4–8 hours) regardless of ΔP trigger.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable when: duplex strainer arrangement allows online switchover and clearing; the blocked component is a sacrificial screening element designed to block and be replaced (e.g., basket strainer protecting a pump); and blockage activates automatic bypass or standby equipment. NOT acceptable for single-path strainers protecting critical equipment, hydrocyclone feeds without individual isolation, or instrument impulse lines where blockage causes loss of safety-critical measurement.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Primary Effects], [ISO 14224 Table B.2 — 5.1 Blockage/plugged], [REF-01 §3.5 — CB strategy with operational basis]*
