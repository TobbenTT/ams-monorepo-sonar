# FM-17: Corrodes due to Poor electrical connections

> **Combination**: 17 of 72
> **Mechanism**: Corrodes
> **Cause**: Poor electrical connections
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: C (Gradual increase) — corrosion at electrical connections accelerates over time as increased resistance generates more heat, which accelerates oxidation, which further increases resistance — a positive feedback loop
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 1.5–3.0 (wear-out), η 15,000–60,000 hours depending on connection quality, environment, current load, and thermal cycling severity

## Physical Degradation Process

Corrosion due to poor electrical connections occurs through a self-reinforcing degradation cycle unique to current-carrying joints: when an electrical connection is improperly made (insufficient torque, incorrect contact area, contaminated surfaces, or missing anti-oxidant compound), the actual metal-to-metal contact area is reduced, concentrating current flow through a smaller cross-section. This creates localized resistive heating (I²R losses) that drives oxidation at the contact interface. The oxide layer further reduces the conducting area, increasing resistance and temperature — a positive feedback loop that eventually leads to thermal runaway, connection failure, or fire.

The mechanisms at the connection interface include: fretting corrosion from thermal cycling (connections expand and contract with load cycling, causing micro-motion at the contact surface that generates oxide debris — see FM-72); galvanic corrosion at dissimilar metal junctions (copper to aluminum is the most problematic — the aluminum oxidizes preferentially, creating a high-resistance Al₂O₃ layer that insulates the joint); oxidation of aluminum conductors (aluminum forms a tenacious, electrically insulating oxide layer within milliseconds of exposure — all aluminum connections require anti-oxidant compound and proper mechanical preparation); and moisture-induced corrosion at outdoor or humid environment connections (water ingress into improperly sealed connections creates electrolytic corrosion cell).

Copper-to-aluminum connections deserve special attention: when copper and aluminum are in direct contact in a moist environment, galvanic corrosion attacks the aluminum (anode). The resulting aluminum oxide is an excellent electrical insulator, progressively increasing resistance. Simultaneously, different thermal expansion rates (aluminum: 23 μm/m/°C vs. copper: 17 μm/m/°C) cause fretting during thermal cycling, generating more oxide. This combination makes Cu-Al connections the most failure-prone electrical joints in industrial systems.

In OCP phosphate processing, electrical connection corrosion is a significant issue because: the phosphate dust environment contaminates exposed connections and provides a hygroscopic deposit layer that creates electrolyte films; coastal facilities (Jorf Lasfar, Safi) have salt-laden air that accelerates all connection corrosion; high ambient temperatures (up to 45°C summer) combined with heavy electrical loads create severe thermal cycling on connections in MCC panels, junction boxes, and motor terminal boxes; and the widespread use of aluminum power cable (for cost) terminated to copper bus bars and motor terminals creates vulnerable dissimilar metal joints throughout the distribution system.

## Detectable Symptoms (P Condition)

- Elevated temperature at connections (detectable by IR thermography — ΔT >10°C above ambient = concern)
- Discolored or oxidized connection surfaces (greenish-blue on copper, white on aluminum)
- Burnt or heat-damaged insulation adjacent to connection point
- Increased voltage drop across connection (measurable by micro-ohmmeter — >50 μΩ per bolt = investigate)
- Loose connection detectable by torque check (below specified torque per manufacturer)
- Arcing marks or carbon tracking at connection surface (evidence of intermittent contact)
- Fretting debris (oxide powder) visible at bolted connection interface
- Unusual odor (burnt insulation smell) at electrical panels or junction boxes during load

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Switchgear (SG) | Medium-voltage switchgear, MCC panels, distribution boards | Bus bar connections, cable terminations, circuit breaker contacts, fuse clips |
| Transformers (TR) | Power transformers, distribution transformers | HV/LV terminal connections, tap changer contacts, neutral grounding connections |
| Electric motors (EM) | Motor terminal boxes on pumps, conveyors, crushers, mills | Terminal lugs, cable connections in terminal box, grounding connections |
| Cable systems (CA) | Power cable terminations, junction boxes, cable joints | Cable lugs, splice connections, junction box terminals, glands |
| Variable speed drives (VD) | VFD input/output terminals, DC bus connections | Power terminal connections, control wiring, bus bar joints |
| Control panels (CP) | PLC panels, relay panels, DCS marshalling cabinets | Terminal strips, relay sockets, grounding bars, fiber/cable entries |
| Lighting (LT) | Outdoor lighting circuits, hazardous area lighting | Lamp connections, fixture wiring, outdoor junction boxes |
| Grounding systems (GR) | Earthing/grounding connections, bonding conductors | Ground rod connections, bonding jumpers, ground bus connections |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Temperature Effects | IR thermography of electrical connections | 3–12 months | NETA MTS, IEC 62446, NFPA 70B |
| Electrical Effects | Contact resistance measurement (micro-ohmmeter) | 12–24 months | NETA MTS, IEC 62271 |
| Electrical Effects | Torque audit of bolted connections | 12–24 months | NFPA 70B, manufacturer specification |
| Human Senses | Visual inspection for overheating, discoloration, damage | 3–6 months | NFPA 70B, AS/NZS 3000 |
| Temperature Effects | Continuous temperature monitoring on critical connections | Continuous | IEC 61439, NETA MTS |
| Electrical Effects | Power quality monitoring (voltage imbalance indicates connection issues) | Continuous | IEEE 1159, IEC 61000-4-30 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Perform IR thermographic survey on Switchgear [{tag}]`
- **Acceptable limits**: Connection temperature rise ≤15°C above ambient under normal load per NETA MTS severity criteria. Contact resistance ≤ manufacturer specification (typically <100 μΩ for power connections). All bolted connections at specified torque per NFPA 70B. No visible overheating, discoloration, or insulation damage. No arcing marks or carbon tracking.
- **Conditional comments**: If ΔT 10–40°C (NETA "Possible Deficiency"): plan connection maintenance at next available outage — clean, re-prepare surfaces, re-torque, apply anti-oxidant for aluminum connections. If ΔT 40–70°C (NETA "Probable Deficiency"): schedule maintenance within 30 days, reduce load if possible. If ΔT >70°C (NETA "Deficiency — requires immediate action"): de-energize and repair immediately — risk of thermal runaway and fire. For all Cu-Al connections: ensure anti-oxidant compound is applied, use bimetallic lugs or compression connectors rated for the combination.

### Fixed-Time (for connection maintenance program)

- **Task**: `Re-torque connections in MCC [{tag}]`
- **Interval basis**: Annual IR thermographic survey of all energized electrical connections per NETA MTS recommended frequency. Connection re-torque: every 3–5 years for MCC and switchgear, annually for motor terminal boxes in high-vibration service (pumps, crushers, screens). Cu-Al connection inspection: annually with anti-oxidant compound renewal. Outdoor junction box seal verification: annually at coastal sites, every 2 years at inland sites. Grounding system integrity test: every 3 years per IEEE 142, annually for critical grounding.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for power connections above 100A — thermal runaway risk creates fire and arc flash hazard. NEVER acceptable for grounding/earthing connections — loss of ground creates electrocution risk. Acceptable only for low-power control/signal connections where failure causes loss of signal but no safety hazard (e.g., 4–20 mA instrument loops, low-voltage indication circuits) and where redundancy or failure alarm exists.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Temperature Effects + Electrical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
