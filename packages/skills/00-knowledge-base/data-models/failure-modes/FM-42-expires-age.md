# FM-42: Expires due to Age

> **Combination**: 42 of 72
> **Mechanism**: Expires
> **Cause**: Age
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — component has a definite shelf life or service life beyond which it loses its functional properties regardless of operating conditions
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 3.0–6.0 (strong wear-out, narrow spread), η defined by manufacturer's rated life or regulatory certification period

## Physical Degradation Process

Expiration is the loss of functional capability due to time-dependent material degradation that occurs regardless of whether the component is actively in service. Unlike wear or corrosion which require operational stress or environmental exposure, expiration is governed by intrinsic material aging processes: elastomer cross-link degradation (hardening and cracking of rubber seals and O-rings), chemical decomposition of active agents (fire suppression media, corrosion inhibitors, desiccants), battery electrolyte degradation (capacity loss in standby batteries), adhesive bond strength reduction, and lubricant additive depletion in stored greases.

The distinguishing characteristic of expiration is that it occurs on a calendar basis with relatively predictable timelines, making it one of the few failure mechanisms that genuinely follows an age-related pattern (Nowlan & Heap Pattern B). The conditional probability of failure increases sharply after the rated life period, and the Weibull β is typically high (3.0–6.0), indicating a tight clustering of failures around the characteristic life. This makes scheduled discard the primary and most effective maintenance strategy — the component is replaced at or before its rated life regardless of apparent condition.

In OCP phosphate processing facilities, expiration is particularly relevant for safety-critical items with regulatory shelf life requirements: fire suppression agents (halon, FM-200, dry chemical) in beneficiation plant fire protection systems, emergency breathing apparatus in confined spaces around acid plants at Jorf Lasfar, calibration gas cylinders for gas detection systems, and backup batteries for UPS systems protecting PLC/DCS controllers. Rubber components (expansion joints, diaphragm seals) in phosphoric acid service degrade faster due to chemical exposure but still have calendar-based manufacturer limits.

## Detectable Symptoms (P Condition)

- Approaching or exceeding manufacturer's stated shelf life or service life date
- Elastomer hardening detectable by Shore A durometer reading exceeding manufacturer specification (typically >+15 points from new)
- Battery capacity test showing <80% of rated capacity per IEEE 450 / IEC 60896
- Lubricant analysis showing additive depletion (TAN increase >2.0 mg KOH/g above baseline, antioxidant <25% of initial)
- Fire suppression agent weight loss >5% of original charge (indicates slow leakage or decomposition)
- Visual degradation: cracking, discoloration, brittleness on elastomer components
- Calibration gas concentration drift >10% from certified value

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Valves (VA) — safety/relief | PSV on pressure vessels, acid reactors at Jorf Lasfar | Elastomer seats, diaphragms, spring packs (rated life per ASME) |
| Fire and gas detectors (FG) | Fire detection systems in beneficiation plants, gas detectors in acid plants | Sensing elements (catalytic bead, IR, electrochemical cells), calibration gas |
| Uninterruptible power supply (UP) | UPS protecting DCS/PLC at all OCP sites | Battery cells (VRLA: 3–5 years, flooded lead-acid: 10–15 years) |
| Nozzles (NO) — fire suppression | Deluge systems, sprinkler heads, FM-200 systems | Suppression agent charge, fusible links, sprinkler heads (50-year NFPA limit) |
| Control logic units (CL) | PLC/DCS backup batteries, firmware EPROM | Backup batteries (lithium: 5–10 years), EPROM data retention |
| Input devices (ID) | Electrochemical gas sensors, pH probes in acid service | Sensor elements with rated operational life (typically 1–3 years) |
| Filters and strainers (FS) | Desiccant breathers on transformers, air dryers | Desiccant cartridges, activated carbon filters |
| Pressure vessels (VE) — certified | ASME-coded vessels in acid plant | Certification validity (statutory inspection intervals) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Primary Effects | Battery capacity testing (discharge test) | 6–12 months | IEEE 450, IEC 60896 |
| Primary Effects | Fire suppression agent weight/pressure check | 1–6 months | NFPA 12, NFPA 2001 |
| Human Senses | Visual inspection of elastomers for cracking/hardening | 1–3 months | OEM service manual |
| Chemical Effects | Lubricant analysis for additive depletion | 3–6 months | ASTM D974 (TAN), ASTM D6810 |
| Primary Effects | Calibration verification of gas sensors | 3–6 months | ISA 92.00.01, OEM specification |

## Maintenance Strategy Guidance

### Condition-Based (limited applicability)

- **Primary task**: `Test battery capacity on UPS Battery Bank [{tag}]`
- **Acceptable limits**: Battery capacity ≥80% of rated Ah at C/10 rate per IEEE 450. Individual cell voltage within ±0.05V of string average. Internal resistance <150% of baseline.
- **Conditional comments**: If capacity <80%: schedule replacement within 60 days, increase testing to quarterly. If any cell below 1.75V under load: replace cell/string immediately. If capacity <60%: replace immediately, do not rely on UPS.

### Fixed-Time — Scheduled Discard (primary strategy for this mechanism)

- **Task**: `Replace Sensor Element on Gas Detector [{tag}]`
- **Interval basis**: Manufacturer's rated operational life is the controlling limit. Typical intervals: electrochemical gas sensors 2 years, catalytic bead sensors 3 years, VRLA batteries 4 years, sprinkler heads 50 years (NFPA 25), PSV elastomers per ASME/API 576 interval (typically 3–5 years in corrosive service). No condition assessment can reliably extend beyond manufacturer's rated life for safety-critical components.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER for safety-critical expired components (fire suppression, emergency breathing, PSVs, UPS batteries). Acceptable only for non-safety items with low consequence: desiccant breathers on non-critical equipment, indicator-only calibration gases, non-safety lubricants past shelf date (with re-analysis confirmation).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.7 — Scheduled Discard Tasks], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — FT strategy with calendar basis]*
