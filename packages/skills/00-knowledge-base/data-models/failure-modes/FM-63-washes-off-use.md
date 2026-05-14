# FM-63: Washes Off due to Use

> **Combination**: 63 of 72
> **Mechanism**: Washes Off
> **Cause**: Use
> **Frequency Basis**: Operational
> **Typical Failure Pattern**: B (Age-related) — surface treatments deplete progressively with cumulative operational exposure; depletion rate is relatively predictable based on operating hours or throughput
> **ISO 14224 Failure Mechanism**: 2.3 Erosion
> **Weibull Guidance**: β typically 2.0–4.0 (wear-out), η 5,000–30,000 hours depending on coating type, fluid properties, and operating conditions

## Physical Degradation Process

Wash-off due to normal use occurs when the gradual, cumulative effect of regular operational exposure depletes surface treatments, protective coatings, or sacrificial layers at a predictable rate consistent with normal operating conditions. Unlike wash-off from excessive velocity (which implies an abnormal condition), this failure mode represents the expected, designed-for consumption of a protective surface treatment over its intended service life. The degradation is primarily due to the combined effects of normal fluid flow, mild abrasion from process fluids, chemical dissolution of coating material by process chemicals, and mechanical contact during normal equipment operation.

Common examples include: paint systems on structural steel and equipment surfaces that weather and chalk with normal atmospheric exposure, sacrificial zinc coatings (galvanizing) on structural elements that oxidize progressively, anti-fouling coatings on heat exchanger surfaces that deplete through chemical dissolution, corrosion inhibitor treatments on cooling water piping that are consumed through normal electrochemical reaction, and wear-resistant coatings on pump internals that thin with cumulative throughput. The rate of depletion is reasonably predictable and scales linearly with operational time or throughput volume, making this one of the few modes suitable for scheduled restoration (re-coating) at fixed intervals.

In OCP phosphate processing, this failure mode is most significant for: protective paint systems on structural steel and piping exposed to the coastal marine atmosphere at Jorf Lasfar and Safi (salt spray accelerates coating consumption), anti-corrosion coatings on cooling water systems using Atlantic seawater, rubber linings in slurry launders and chutes that wear at normal operating velocities, and chrome/tungsten carbide coatings on pump shaft sleeves that thin with cumulative hours in phosphate slurry service. The seasonal variation in ambient conditions (humidity, temperature) means coating life at Atlantic coast facilities is typically 30–40% shorter than inland sites like Khouribga.

## Detectable Symptoms (P Condition)

- Coating thickness measurements showing progressive thinning (<70% of original applied thickness per SSPC-PA 2)
- Visual chalking, fading, blistering, or rust bleeding on paint systems per ASTM D610/D714
- Measurable increase in corrosion rate on protected surfaces via corrosion coupons or ER probes
- Visible base metal exposure through coating at edges, welds, and high-contact areas
- Heat transfer coefficient degradation in coated heat exchangers (outlet temperature trending away from design)
- Increasing corrosion inhibitor consumption rate in treated water systems (chemical dosing rate increasing >20%)
- Coating adhesion test (pull-off per ASTM D4541) showing <50% of original adhesion strength

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Slurry pipelines, cooling water piping, structural piping | External paint system, internal coating/lining, galvanized surfaces |
| Storage tanks (TA) | Phosphoric acid storage, water storage tanks | Internal lining (epoxy, rubber), external paint, cathodic protection anodes |
| Heat exchangers (HE) | ET-HEAT-EXCHANGER cooling circuits, acid coolers | Anti-fouling coating, tube protective coating, plate gasket surfaces |
| Pressure vessels (VE) | Process vessels, separators, reactors | Internal lining, external paint system, sacrificial anodes |
| Pumps (PU) | ET-SLURRY-PUMP shaft sleeves, impeller coatings | Chrome/carbide coatings on shaft sleeves, impeller hard-facing |
| Conveyors and elevators (CV) | ET-BELT-CONVEYOR structural steel, chute linings | Structural paint system, chute liner plates, hopper linings |
| Cranes (CR) | Overhead cranes, gantry crane structures | Structural paint system (particularly at coastal facilities) |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | Coating thickness measurement (DFT gauge) | 3–12 months | SSPC-PA 2, ISO 19840 |
| Human Senses | Visual coating condition assessment (ASTM rating) | 1–6 months | ASTM D610 (rust), ASTM D714 (blistering), ASTM D4214 (chalking) |
| Chemical Effects | Corrosion coupon analysis in treated water systems | 1–3 months | ASTM G1, NACE RP0775 |
| Primary Effects | Corrosion rate monitoring (ER probes, LPR) | Continuous–monthly | NACE SP0775, ISO 11463 |
| Physical Effects / NDT | Coating adhesion testing (pull-off) | 6–12 months | ASTM D4541, ISO 4624 |

## Maintenance Strategy Guidance

### Condition-Based (preferred for high-value coatings)

- **Primary task**: `Measure coating thickness on Pipe External [{tag}]`
- **Acceptable limits**: Coating DFT ≥70% of specified minimum per SSPC-PA 2. Rust grade ≤Ri 2 (≤1% rust) per ISO 4628-3. Adhesion ≥3 MPa or ≥50% of original per ASTM D4541.
- **Conditional comments**: If DFT <70% minimum: plan spot repair/touch-up at next maintenance window (within 90 days). If DFT <50% minimum or rust grade Ri 4 (>8% rust): schedule full coating restoration within 30 days. If base metal exposed over >10% of surface: immediate spot-prime to prevent accelerated substrate corrosion, plan full re-coat.

### Fixed-Time — Scheduled Restoration (primary strategy for coating systems)

- **Task**: `Repaint external surfaces on Structure [{tag}]`
- **Interval basis**: Based on coating system design life in the specific environment. Typical intervals: marine atmosphere (Jorf Lasfar, Safi) 5–7 years for epoxy/polyurethane systems, inland (Khouribga, Benguerir) 7–10 years. Internal linings: rubber linings 3–5 years in slurry service, epoxy linings 5–8 years in acid service. Surface preparation to SSPC-SP 10 (near-white blast) minimum for full re-coat.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for aesthetic coatings on non-structural, non-process equipment where coating loss has no corrosion consequence (indoor equipment in climate-controlled areas). NOT acceptable for coatings providing corrosion protection in aggressive environments (marine, acid, slurry) — unprotected substrate deterioration accelerates exponentially once coating is lost.

---

*Cross-references: [RCM2 Moubray Ch.7 §7.6 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.3 Erosion], [REF-01 §3.5 — FT strategy with operational basis]*
