# FM-49: Overheats/Melts due to Contamination

> **Combination**: 49 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Contamination
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — contaminant accumulation on heat transfer surfaces and in lubricant systems is progressive with time, causing gradual thermal performance degradation
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 1.5–2.5 (gradual), η 3,000–15,000 hours depending on environment cleanliness, filtration, and cleaning frequency

## Physical Degradation Process

Overheating due to contamination occurs when foreign materials accumulate on heat dissipation surfaces or within lubrication/cooling circuits, creating thermal insulation barriers that impede heat rejection. The contamination acts as a thermal blanket: even a thin layer of dust, scale, or biological growth on a heat transfer surface dramatically reduces heat dissipation — 1 mm of calcium carbonate scale has the same thermal resistance as 30 mm of steel. As the contamination layer thickens, the component operates at progressively higher temperatures until the thermal limit is exceeded, causing material degradation, lubricant breakdown, or melting.

The contamination sources include: airborne dust accumulation on motor cooling fins, transformer radiators, and VFD heat sinks; scale deposition in cooling water circuits (calcium carbonate, calcium sulfate, silica); biological fouling in seawater cooling systems (biofilm, barnacles, mussels); lubricant contamination with process material, water, or wear debris that reduces lubricant thermal conductivity and viscosity; and internal fouling of instrument air systems with oil and water that reduces pneumatic cooling effectiveness.

In OCP phosphate processing, contamination-induced overheating is extremely common due to: pervasive phosphate dust at Khouribga and Benguerir that coats motor cooling fins, reduces VFD heat sink effectiveness, and blocks transformer radiator air flow; calcium sulfate (gypsum) scale in cooling water heat exchangers at Jorf Lasfar; marine biofouling in seawater cooling circuits at Jorf Lasfar and Safi; phosphate slurry ingress into bearing lubrication systems through failed seals; and wet, sticky ore that clogs conveyor structure ventilation openings.

## Detectable Symptoms (P Condition)

- Component operating temperature increasing trend (>10°C above clean baseline per ISO 10816)
- Motor winding temperature approaching thermal class limit at loads previously within safe range
- Cooling water outlet temperature increasing (reduced heat removal) at constant process conditions
- Heat exchanger approach temperature increasing >5°C above design per TEMA specification
- VFD heat sink temperature alarm or power derating activation
- Lubricant temperature exceeding OEM specification despite normal load
- Visible contamination layer on cooling fins, radiators, or heat sink surfaces
- Air filter differential pressure exceeding clean baseline by >100% (motor ventilation, VFD cabinet)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electric motors (EM) | ET-SAG-MILL drive, ET-BALL-MILL drive, ET-CRUSHER drive, TEFC motors | Cooling fins (external), internal cooling passages, air-to-air heat exchanger |
| Frequency converters (FC) | VFDs on ET-SLURRY-PUMP, ET-BELT-CONVEYOR | Heat sink fins, cooling fan filters, power module surfaces |
| Power transformers (PT) | Oil-filled transformers, dry-type transformers | Radiator fins (oil-filled), cooling ducts (dry-type), oil cooler tubes |
| Heat exchangers (HE) | Lube oil coolers, bearing cooling circuits, process coolers | Tube bundle (fouling), plate surfaces, cooling water passages |
| Bearings (BE) | All rotating equipment bearings with external cooling | Bearing housing cooling fins, oil cooler, grease fill contamination |
| Gearboxes (GB) | Mill gearboxes, conveyor gearboxes | Oil cooler, breather filter, oil sump (contamination buildup) |
| Compressors (CO) | Instrument air compressors, process gas compressors | Intercooler/aftercooler tubes, oil cooler, air intake filter |
| Control logic units (CL) | PLC/DCS cabinets, MCC panels | Cabinet air conditioning filters, ventilation louvers, electronics cooling |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | Operating temperature trending (RTD, thermocouple, thermography) | Continuous–monthly | ISO 10816, IEC 60034-11, NETA MTS |
| Primary Effects | Heat exchanger performance monitoring (UA trending) | Weekly–monthly | TEMA, ASME PTC 12.5 |
| Primary Effects | Filter differential pressure monitoring | Weekly–monthly | OEM specification |
| Human Senses | Visual inspection of cooling surface cleanliness | 1–4 weeks | NFPA 70B, OEM manual |
| Chemical Effects | Lubricant analysis (particle count, water content, viscosity) | 1–3 months | ISO 4406, ASTM D6224, ASTM D445 |
| Primary Effects | Cooling water quality analysis (hardness, biological activity) | Weekly–monthly | ASHRAE guidelines, CTI |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor bearing temperature on Pump [{tag}]`
- **Acceptable limits**: Operating temperature ≤OEM maximum at rated load. Temperature rise above ambient ≤maximum per IEC 60034-1 (motor). Heat exchanger UA ≥80% of clean design per TEMA. Lubricant contamination ≤ISO 18/16/13 per ISO 4406 for typical hydraulic systems. Air filter ΔP ≤2× clean baseline.
- **Conditional comments**: If temperature rise >10°C above clean baseline at same load: inspect and clean cooling surfaces within 30 days. If temperature approaching OEM maximum: clean immediately, reduce load until cleaned. If lubricant contamination exceeds target cleanliness: change lubricant, investigate contamination source (failed seal, environmental ingress). If heat exchanger UA <70% of design: schedule chemical or mechanical cleaning within 2 weeks.

### Fixed-Time (primary strategy for dusty environments)

- **Task**: `Clean cooling surfaces on Motor [{tag}]`
- **Interval basis**: Motor cooling fins in dusty environment (Khouribga, Benguerir): clean every 1–3 months. VFD cabinet air filters: replace every 1–3 months in dusty environment. Transformer radiator fins: clean every 6–12 months. Cooling water heat exchangers: chemical CIP every 3–6 months (acid wash for scale, biocide for biofilm). Lube oil change: per OEM interval OR when oil analysis indicates contamination, whichever is first. Cabinet air conditioning filters: monthly in dusty environments.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for critical electric motors, VFDs, or transformers — overheating causes insulation degradation and eventual burnout. Acceptable only for non-critical equipment with inherent thermal protection (thermal overload relay, thermal cutout) that will safely de-energize the equipment before damage occurs, AND where the production consequence of unplanned shutdown is acceptable.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — FT strategy with calendar basis]*
