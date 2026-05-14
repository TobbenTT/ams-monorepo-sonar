# FM-16: Corrodes due to Exposure to liquid metal

> **Combination**: 16 of 72
> **Mechanism**: Corrodes
> **Cause**: Exposure to liquid metal
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: E (Random) — liquid metal embrittlement (LME) and liquid metal corrosion events are often triggered by unpredictable contact between liquid metals and susceptible substrates; onset is rapid once contact occurs
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 0.8–1.5 (random to early wear-out), η highly variable — from hours (LME cracking) to 10,000+ hours (gradual dissolution) depending on mechanism

## Physical Degradation Process

Corrosion due to exposure to liquid metal encompasses two distinct mechanisms: liquid metal corrosion (LMC — progressive dissolution of a solid metal into a liquid metal) and liquid metal embrittlement (LME — sudden, catastrophic cracking of a solid metal caused by contact with specific liquid metals at stress concentrations). Both mechanisms bypass the normal aqueous electrochemical corrosion process entirely — they are direct metallurgical interactions between the solid substrate and the liquid metal.

Liquid metal corrosion (dissolution) occurs when atoms from the solid metal dissolve into the liquid metal, driven by the solubility of the solid in the liquid at the operating temperature. The rate follows Arrhenius kinetics and increases exponentially with temperature. Common industrial LMC couples include: steel dissolving in molten zinc (galvanizing bath attack), copper alloys dissolving in mercury, aluminum dissolving in gallium, and stainless steel dissolving in molten lead/lead-bismuth. The dissolution is typically uniform but can be accelerated at grain boundaries (intergranular penetration) where the liquid metal preferentially wets and dissolves the grain boundary phase.

Liquid metal embrittlement (LME) is more insidious: certain liquid metal–solid metal couples exhibit a dramatic reduction in ductility and fracture toughness when the liquid metal contacts a stressed solid metal surface. The liquid metal reduces the surface energy at crack tips, enabling brittle crack propagation at stresses far below the normal fracture stress. Critical LME couples include: molten zinc on austenitic stainless steel and high-strength steel (during hot-dip galvanizing or welding of galvanized components), mercury on aluminum alloys and copper alloys, and molten copper brazing alloy on steel under tensile stress.

In OCP phosphate processing, liquid metal corrosion risk is limited but specific: zinc-steel interactions during hot-dip galvanizing of structural components (galvanizer's crack — LME of high-strength bolts during galvanizing); welding on galvanized structures where molten zinc contacts the heat-affected zone (HAZ) of the weld causing LME cracking; mercury exposure in some analytical laboratory equipment and legacy instruments (mercury manometers, thermometers) where accidental mercury contact with aluminum or copper components causes rapid LME; and lead-containing bearing metals (babbitt) in contact with steel shafts at elevated temperatures in legacy equipment. The primary risk at OCP is LME during maintenance activities involving welding or hot work on galvanized structures — this is a maintenance-induced failure mode.

## Detectable Symptoms (P Condition)

- Intergranular cracking at galvanized weld HAZ (visible with MPI/DPI after weld cooling)
- Sudden brittle fracture of galvanized high-strength bolt during or after tightening
- Progressive wall thinning of components in contact with molten metal (dissolution)
- Liquid metal penetration visible as discoloration or surface wetting at grain boundaries
- Mercury droplets found on aluminum or copper surfaces (immediate LME risk)
- Babbitt bearing material loss or detachment from steel backing
- Surface alloying at liquid metal contact zone (metallographic examination reveals intermetallic layers)
- Weld cracking in HAZ of galvanized components (during or shortly after welding)

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Structural steel (ST) | Galvanized structural members requiring field welding | HAZ of welds on galvanized steel, gusset plates, base plates |
| Fasteners (FT) | Hot-dip galvanized high-strength bolts (Grade 8.8+) | Bolt threads and transition radius (LME during galvanizing or under load) |
| Bearings (BE) | Babbitt-lined bearings in legacy pumps, turbines, compressors | Babbitt lining (dissolution/detachment), steel shell (liquid metal contact) |
| Instruments (ID) | Mercury-containing instruments (legacy thermometers, manometers) | Aluminum housings, copper fittings, brass connections (mercury LME) |
| Piping (PI) | Piping in liquid metal circuits (rare — specialty applications) | Pipe wall, weld joints, valve trim |
| Heat exchangers (HE) | Liquid metal heat transfer systems (rare at OCP) | Tube material, tube-to-tubesheet joints, header plates |
| Electrical installations (EI) | Mercury switches (legacy), aluminum bus bars near mercury risk | Aluminum conductors, copper terminals, switch contacts |
| Welded structures (WS) | Any galvanized structure requiring repair welding | Weld HAZ, heat-affected galvanized coating zone, adjacent base metal |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | MPI/DPI at welds on galvanized structures (post-weld) | After each weld | AWS D1.1, ISO 9934/3452 |
| Human Senses | Visual inspection for LME indicators (cracking, liquid metal traces) | 6–12 months | Industry best practice |
| Physical Effects / NDT | Bearing inspection for babbitt condition (UT bond test) | 12–24 months | API 687 |
| Physical Effects / NDT | Metallographic examination of suspect cracking | As needed | ASTM E3, ASTM E407 |
| Human Senses | Mercury contamination survey in laboratory/instrument areas | 12–24 months | OSHA mercury guidelines |
| Physical Effects | Bolt inspection after galvanizing (magnetic particle) | After galvanizing | ASTM A153, ISO 10684 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect welds on galvanized structure for LME on [{tag}]`
- **Acceptable limits**: No cracks detected by MPI/DPI at welds on galvanized or previously galvanized structures. No liquid metal residue visible at any structural connection. Babbitt bearing bond to backing ≥95% per UT bond test. No mercury contamination on aluminum or copper components.
- **Conditional comments**: If LME cracking detected at galvanized weld: stop operation, grind out cracked zone completely, remove all zinc from 100 mm zone around weld, re-weld and inspect per AWS D1.1. If galvanized high-strength bolt cracked: replace entire bolt set with mechanically galvanized bolts (no LME risk) or sherardized bolts per AS/NZS 1252. If mercury contamination found on aluminum: isolate component, decontaminate per OSHA guidelines, replace if intergranular penetration has occurred. For all hot work on galvanized structures: mandatory procedure to remove zinc coating ≥100 mm from weld zone before welding.

### Fixed-Time (for prevention procedures)

- **Task**: `Inspect babbitt bearing bond condition on [{tag}]`
- **Interval basis**: Babbitt bearing inspection: every major overhaul (typically 3–5 years). Develop mandatory hot work procedure for galvanized structures: zinc removal before welding (grinding, acid stripping, or thermal removal) per AWS D1.1. Restrict bolt grade for hot-dip galvanizing to ≤Grade 8.8 (higher grades have elevated LME susceptibility per ISO 10684). Eliminate mercury-containing instruments — replace with electronic alternatives per IEC 61298. Mercury spill response procedure: immediate containment, decontamination, disposal per hazmat regulations.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for structural connections susceptible to LME — sudden brittle failure has no warning. NEVER acceptable for pressure boundaries or rotating equipment where liquid metal contact is possible. Acceptable only for sacrificial components designed for consumption (e.g., sacrificial zinc anodes in CP systems, galvanized coating on non-structural items) where the liquid metal interaction is the intended protection mechanism.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
