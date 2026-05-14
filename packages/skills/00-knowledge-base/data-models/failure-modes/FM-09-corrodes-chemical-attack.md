# FM-09: Corrodes due to Chemical attack

> **Combination**: 9 of 72
> **Mechanism**: Corrodes
> **Cause**: Chemical attack
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — chemical corrosion progresses predictably with cumulative exposure time; rate is governed by concentration, temperature, and material compatibility
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 10,000–50,000 hours depending on chemical concentration, temperature, and alloy selection

## Physical Degradation Process

Corrosion due to chemical attack occurs when process chemicals directly dissolve or react with the equipment material, causing progressive mass loss and wall thinning. Unlike electrochemical corrosion (which requires an electrolyte and galvanic driving force), direct chemical attack can occur in non-aqueous environments through chemical dissolution — the metal reacts with the chemical to form soluble or loosely adherent corrosion products that are continuously removed, exposing fresh metal. The corrosion rate follows Arrhenius kinetics: rate doubles approximately every 10°C increase in temperature, and increases with chemical concentration up to a critical point (some chemicals show a maximum corrosion rate at intermediate concentrations).

The most important chemical attacks in industrial service are: acid corrosion (H₂SO₄, HCl, H₃PO₄, HF) where hydrogen ions directly attack the metal surface; caustic corrosion (NaOH, KOH) causing stress corrosion cracking in carbon steel and general corrosion in aluminum/zinc; oxidizing chemical attack (HNO₃, chlorine, hypochlorite, hydrogen peroxide) where strong oxidizers can either passivate or aggressively attack metals depending on concentration and alloy; and organic acid attack (acetic, formic, citric) which is often underestimated but causes significant corrosion of carbon steel at elevated temperatures. The corrosion morphology is typically uniform (general thinning) for acids attacking carbon steel, but can be localized (pitting, intergranular attack) for chemicals attacking passive alloys (stainless steels, nickel alloys).

In OCP phosphate processing, chemical corrosion is the dominant degradation mechanism throughout the phosphoric acid production chain at Jorf Lasfar and Safi: phosphoric acid (H₃PO₄, 28–54% concentration) attacks carbon steel at 2–10 mm/year depending on temperature and impurities; sulfuric acid (H₂SO₄, 98% concentration for feed, 28% in reaction circuit) aggressively attacks most metals except lead, high-silicon cast iron (Duriron), and specific alloys (Alloy 20, Hastelloy); hydrofluoric acid (HF, present as impurity from fluorapatite dissolution) is extremely aggressive to glass, silica-containing refractories, and most metals; and the phosphogypsum slurry (acidic, abrasive, containing residual H₂SO₄ and H₃PO₄) attacks carbon steel piping and pumps in the filtration and stacking circuits. Silicon carbide, rubber linings, and PTFE-lined equipment are widely used at OCP to resist chemical attack.

## Detectable Symptoms (P Condition)

- Progressive wall thinning measurable by UT (uniform loss pattern in acid service)
- Lining or coating degradation exposing substrate (blistering, delamination, pinholing)
- Rubber lining hardening, swelling, or chemical discoloration (acid penetration indicators)
- Increasing corrosion coupon weight loss rates (>2× design corrosion allowance rate)
- Process fluid discoloration from dissolved metal (iron content in phosphoric acid increasing)
- Flange face corrosion and gasket deterioration at chemical service joints
- Tank/vessel floor thinning concentrated at liquid/sludge contact zone
- Piping elbow and tee thinning from combined chemical attack and flow turbulence

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Reactors (RE) | Phosphoric acid reaction tanks (attack tanks), digesters | Reactor shell lining, agitator shaft, baffles, nozzle linings |
| Storage tanks (TA) | H₂SO₄ tanks, H₃PO₄ tanks, acid day tanks | Tank floor, first course shell, roof (vapor phase), nozzles, level instruments |
| Pumps (PU) | Acid transfer pumps, reactor circulation pumps | Pump casing lining, impeller (alloy or rubber-lined), shaft sleeve, seal faces |
| Piping (PI) | Acid piping (H₃PO₄, H₂SO₄), slurry piping | Pipe wall, elbow/tee fittings, flange faces, gaskets, expansion joints |
| Heat exchangers (HE) | Acid coolers, evaporator tubes, preheaters | Tube bundle (alloy selection critical), tube sheets, channel covers, gaskets |
| Valves (VA) | Acid isolation valves, control valves in acid service | Valve body lining, trim (plug/seat — alloy or ceramic), stem packing, gaskets |
| Filters (FS) | Phosphoric acid filters, belt filters in acid circuit | Filter cloth, filter plates (polypropylene), frame seals, drainage piping |
| Agitators (AG) | Reactor agitators, acid tank mixers | Impeller (alloy or rubber-coated), shaft, shaft sleeve, mechanical seal |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | UT thickness measurement at TMLs | 3–6 months | API 510, API 574, API 570 |
| Chemical Effects | Corrosion coupon monitoring | 3–6 months | NACE RP0775, ASTM G1/G4 |
| Physical Effects / NDT | Lining inspection (spark testing, visual) | 6–12 months | NACE SP0892, ASTM D5162 |
| Chemical Effects | Process fluid metal content analysis (dissolved Fe, Cr, Ni) | Monthly | ASTM D5185 |
| Primary Effects | Corrosion rate monitoring (ER probes, LPR probes) | Continuous | NACE SP0775 |
| Physical Effects / NDT | Radiographic inspection of piping (profile radiography) | 12–24 months | ASME V Art. 2, API 574 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness on Acid Piping [{tag}]`
- **Acceptable limits**: Wall thickness ≥ minimum required per API 574/570 pressure calculation plus corrosion allowance for next inspection interval. Lining integrity: no holidays per spark test at voltage specified by lining manufacturer. Corrosion coupon rate ≤ design corrosion allowance (typically 0.1–0.5 mm/year for lined equipment, 0.5–2.0 mm/year for unlined alloy). Dissolved iron in product acid ≤ specification.
- **Conditional comments**: If corrosion rate >design allowance: investigate root cause (concentration change, temperature excursion, lining failure), adjust chemical treatment or plan material upgrade. If lining holiday detected: repair within 30 days using qualified lining repair procedure (surface prep + patch application per manufacturer). If wall thickness approaching retirement: plan replacement at next turnaround, consider material upgrade (alloy or improved lining system). If acid piping elbow thinning: install wear-back fittings or schedule elbow replacement.

### Fixed-Time (for lining renewal)

- **Task**: `Reline acid tank on [{tag}]`
- **Interval basis**: Rubber lining life in phosphoric acid service: 5–8 years (soft rubber) to 8–12 years (hard rubber/ebonite) depending on temperature and acid concentration. PTFE lining: 10–15 years. Brick/tile lining: 10–20 years with periodic repointing. Acid-resistant coating (vinyl ester, novolac epoxy): 3–5 years. Schedule relining during major turnarounds. Corrosion coupons provide leading indicator — plan relining when coupon rate indicates lining breach imminent.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for pressure-containing equipment in acid service — through-wall penetration causes hazardous chemical release. NEVER acceptable for lined equipment protecting structural substrate — substrate attack accelerates exponentially once lining fails. Acceptable only for sacrificial wear components designed for chemical service (sacrificial anodes, corrosion coupons, replaceable gaskets, packing rings).

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
