# FM-54: Overheats/Melts due to Rubbing

> **Combination**: 54 of 72
> **Mechanism**: Overheats/Melts
> **Cause**: Rubbing
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: E (Random) — rubbing contact initiation is unpredictable; caused by sudden clearance loss, bearing failure, shaft deflection, or foreign object ingress
> **ISO 14224 Failure Mechanism**: 2.7 Overheating
> **Weibull Guidance**: β typically 0.8–1.5 (mostly random), η highly variable depending on the severity of rubbing contact and material pair

## Physical Degradation Process

Overheating due to rubbing occurs when rotating or moving parts make direct contact with adjacent stationary parts, generating intense frictional heat at the contact zone. Rubbing differs from the designed sliding contact in FM-53 in that it represents an abnormal, unintended contact event — the parts were not designed to touch, and when they do, the resulting friction and heat generation can be severe. The contact surface temperatures at a rub event can exceed 600°C locally (steel-on-steel), sufficient to cause surface tempering, local welding, and material transfer.

Rubbing contact initiates through: bearing failure allowing shaft to contact housing or seal surfaces; thermal growth exceeding designed clearance (rotor expands more than stator in hot running); shaft deflection from unbalance, misalignment, or hydraulic forces exceeding clearance; foreign object lodging between rotating and stationary parts; structural deflection under load reducing operating clearances; and process material buildup on rotating parts reducing clearance. Once rubbing initiates, the thermal expansion from frictional heating further reduces clearance, creating a self-reinforcing cycle that rapidly escalates to severe damage.

The rub can be: light rub (intermittent contact on one spot per revolution — produces 1× and harmonic vibration signatures); partial rub (contact over an arc of the circumference — produces sub-synchronous vibration at shaft natural frequency); or full rub (continuous contact — produces severe heating and rapid destruction). Light rubs may persist for extended periods; full rubs typically cause catastrophic damage within minutes.

In OCP phosphate processing, rubbing occurs in: slurry pump wear rings when ring clearance closes due to solids accumulation or shaft deflection; kiln seals when thermal distortion reduces the kiln-seal clearance; fan impellers contacting casing when bearing failure or thermal growth closes tip clearance; motor rotor contacting stator when bearing clearance is consumed; and compressor pistons contacting cylinders when piston ring failure allows metal-to-metal contact.

## Detectable Symptoms (P Condition)

- Vibration spectrum showing rub signatures (1×, 2×, ½× sub-synchronous, or broadband at natural frequency)
- Shaft orbit showing truncated or flattened pattern at rub location (proximity probe data)
- Temperature spike at rubbing location (detectable by embedded RTD or thermography)
- Audible metallic scraping, grinding, or squealing sound from equipment
- Smoke, burning smell, or visible sparks from contact zone
- Sudden increase in motor current (additional friction load)
- Material transfer visible on disassembly (scoring marks, smeared metal, heat discoloration)
- Foreign object impact detected by acoustic emission before rubbing initiates

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Pumps (PU) | ET-SLURRY-PUMP (CL-IMPELLER-SLURRY), ET-CENTRIFUGAL-PUMP | Wear rings (impeller-casing), throat bush, shaft sleeve, mechanical seal |
| Fans (FA) | ID/FD fans, process ventilation fans | Impeller tip-casing clearance, shaft seals, bearing housing |
| Compressors (CO) | Reciprocating compressors, screw compressors | Piston-cylinder, rotor-casing (screw), valve plates |
| Electric motors (EM) | Large induction motors, wound rotor motors | Rotor-stator air gap, bearing failure-induced contact |
| Mills (ML) | ET-SAG-MILL, ET-BALL-MILL | Trunnion seal contact, girth gear-pinion mesh, liner protrusion |
| Rotary equipment (RO) | Rotary kilns, rotary dryers | Kiln shell-seal plate, riding ring-support roller, kiln shell-refractory |
| Turbines (TU) | Steam turbines at cogeneration plants | Blade tip-casing, labyrinth seal-shaft, journal bearing |
| Conveyors and elevators (CV) | Belt conveyor pulleys, bucket elevator sprockets | Belt-structure contact (mistracking), scraper-belt contact |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Vibration Effects | Vibration monitoring (rub detection — ½× sub-sync, orbit analysis) | Continuous–weekly | ISO 7919, ISO 10816, API 670 |
| Temperature Effects | Temperature monitoring at seal/clearance locations | Continuous–weekly | ISO 10816, OEM specification |
| Human Senses | Audible rubbing sound detection | Continuous (operator rounds) | OEM manual |
| Vibration Effects | Shaft orbit monitoring (proximity probes on critical machinery) | Continuous | API 670, ISO 7919 |
| Primary Effects | Motor current monitoring (increased friction load) | Continuous | NEMA MG-1 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Monitor vibration on Pump [{tag}] for rub detection`
- **Acceptable limits**: No sub-synchronous vibration components >25% of 1× amplitude. Shaft orbit within bearing clearance (no truncation/flattening). Operating clearances (wear ring, seal, impeller tip) within OEM specification. No audible rubbing or abnormal sounds. Temperature at clearance locations ≤OEM limit.
- **Conditional comments**: If light rub detected (intermittent ½× vibration): investigate root cause (bearing condition, alignment, balance), plan corrective action at next opportunity within 30 days. If partial rub (sustained sub-synchronous vibration >50% of 1×): plan shutdown within 7 days — continuing operation causes progressive damage. If full rub (continuous contact, temperature spike, metallic noise): IMMEDIATE shutdown — continued operation for even minutes causes catastrophic damage. After any rub event: inspect clearances, replace damaged components, correct root cause before restart.

### Fixed-Time (for clearance verification)

- **Task**: `Measure wear ring clearance on Pump [{tag}]`
- **Interval basis**: Wear ring clearance measurement at every pump overhaul (typically 5,000–15,000 hours in slurry service). Replace wear rings when clearance exceeds 2× design clearance per API 610/Hydraulic Institute. Fan impeller tip clearance check annually or whenever abnormal vibration detected. Motor air gap measurement at major overhaul (every 5–10 years) per IEEE 56. Kiln seal clearance check every 6–12 months. Install proximity probes on critical machinery to enable continuous clearance monitoring per API 670.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for any rotating machinery — rubbing causes rapid escalation to catastrophic failure (bearing seizure, shaft scoring, impeller destruction, motor burnout). There is no safe RTF scenario for rubbing contact. Even on non-critical equipment, rubbing should be detected and corrected promptly to prevent secondary damage that increases repair cost and downtime.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Vibration Effects], [ISO 14224 Table B.2 — 2.7 Overheating], [REF-01 §3.5 — CB strategy with operational basis]*
