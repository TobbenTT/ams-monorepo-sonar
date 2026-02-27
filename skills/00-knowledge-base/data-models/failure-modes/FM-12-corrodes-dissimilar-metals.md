# FM-12: Corrodes due to Dissimilar metals contact

> **Combination**: 12 of 72
> **Mechanism**: Corrodes
> **Cause**: Dissimilar metals contact
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — galvanic corrosion progresses steadily with time; rate is constant for a given electrolyte and metal couple, making it predictable
> **ISO 14224 Failure Mechanism**: 2.2 Corrosion
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 10,000–50,000 hours depending on potential difference between metals, electrolyte conductivity, and area ratio

## Physical Degradation Process

Galvanic corrosion (also called bimetallic corrosion or dissimilar metals corrosion) occurs when two different metals or alloys are electrically connected in the presence of an electrolyte. The metal with the more negative electrochemical potential (anodic metal) preferentially corrodes, while the more noble metal (cathodic) is protected. The driving force is the potential difference between the two metals in the galvanic series — larger potential differences produce higher corrosion rates. The critical geometric parameter is the cathode-to-anode area ratio: a large cathode (noble metal) coupled to a small anode (active metal) creates extremely high anodic current density and rapid attack — the classic example is a stainless steel pipe connected to a small carbon steel fitting, where the fitting corrodes rapidly.

The galvanic corrosion rate depends on three factors: (1) the potential difference between the coupled metals (from the galvanic series in the specific electrolyte — seawater, phosphoric acid, etc.); (2) the electrolyte conductivity (high conductivity spreads the galvanic effect over a larger area, while low conductivity concentrates attack near the junction); and (3) the cathode-to-anode area ratio (the larger the cathode relative to the anode, the more severe the attack on the anode). In highly conductive electrolytes like seawater (conductivity ~50 mS/cm), galvanic attack spreads 5–10 pipe diameters from the junction; in low-conductivity fresh water (<1 mS/cm), attack is concentrated within 1–2 pipe diameters of the junction.

In OCP phosphate processing, galvanic corrosion is a persistent design and maintenance issue because: the process chain uses multiple alloys in contact — carbon steel piping connected to stainless steel equipment, copper alloy heat exchanger tubes in steel tube sheets, aluminum instrument housings on steel structures; seawater systems at Jorf Lasfar create highly conductive electrolyte that maximizes galvanic effects (naval brass tubes in Muntz metal tube sheets, steel pipes to copper-nickel exchangers); phosphoric acid systems combine carbon steel, stainless steel, Hastelloy, and rubber-lined equipment with transition joints; and zinc-coated (galvanized) components are rapidly sacrificed when coupled to stainless steel or copper in acidic or chloride environments. The widespread use of cathodic protection systems (sacrificial anodes, impressed current) at OCP for buried piping and marine structures intentionally uses the galvanic principle — but unintended galvanic couples are a constant threat.

## Detectable Symptoms (P Condition)

- Accelerated corrosion of the less noble metal concentrated at or near the junction with the more noble metal
- Clean, protected surface on the noble metal adjacent to the corroding active metal
- Distinctive corrosion pattern: severe attack within 1–5 pipe diameters of the dissimilar metal junction
- Galvanic couple potential measurable by reference electrode (>100 mV difference = significant risk)
- Wall thinning of carbon steel at transition to stainless steel flange or fitting
- Rapid sacrificial anode consumption (faster than design rate indicates stray galvanic coupling)
- Zinc coating consumption at contact with copper or stainless steel fasteners
- Bolt/nut corrosion where carbon steel fasteners are used on stainless steel flanges

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Carbon steel to stainless steel transitions, copper to steel | Transition joints, flanged connections, reducer fittings at material changes |
| Heat exchangers (HE) | Copper alloy tubes in steel shell, titanium tubes in SS tube sheet | Tube-to-tubesheet interface, water box (steel) to tube sheet (alloy), channel covers |
| Pumps (PU) | Bronze impeller in steel casing, alloy trim in steel body | Impeller-to-casing interface, wear rings (dissimilar pair), seal components |
| Valves (VA) | Bronze trim in steel body, alloy seats in carbon steel | Seat ring-to-body junction, stem (alloy) to packing gland (steel), bonnet bolting |
| Structural steel (ST) | Aluminum cladding on steel structure, stainless handrails on CS | Cladding attachment points, dissimilar metal fasteners, guardrail posts |
| Electrical installations (EI) | Copper bus bars to aluminum cable, copper to steel grounding | Cable lugs, grounding connections, junction box terminals, transformer connections |
| Fasteners (FT) | Carbon steel bolts on stainless flanges, brass on aluminum | Bolt/nut in dissimilar flange, washer interfaces, threaded connections |
| Buried piping (PI) | CP system components, transition joints in buried service | Anode-to-pipe connections, insulating flanges, casing-to-pipe contact |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects / NDT | UT thickness at dissimilar metal junctions | 6–12 months | API 574, API 570 |
| Electrical Effects | Galvanic potential measurement at bimetallic joints | 12–24 months | NACE SP0169, ASTM G71 |
| Human Senses | Visual inspection for accelerated corrosion at junctions | 6–12 months | NACE SP0108 |
| Chemical Effects | Corrosion coupon monitoring (galvanic couple coupons) | 6–12 months | ASTM G71, ASTM G82 |
| Physical Effects / NDT | Pipe-to-soil potential survey (buried dissimilar metal) | 12 months | NACE SP0169, AS 2832 |
| Electrical Effects | CP system current output monitoring | Monthly | NACE SP0169, ISO 15589 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Measure wall thickness at dissimilar metal joint on [{tag}]`
- **Acceptable limits**: Wall thickness of anodic metal ≥ minimum required per pressure calculation at junction zone. Galvanic potential difference at insulating flange <50 mV (insulation effective). Sacrificial anode consumption ≤design rate. No visible accelerated corrosion pattern within 5 pipe diameters of bimetallic junction.
- **Conditional comments**: If wall thinning >20% at junction: install insulating gasket kit (insulating gasket + insulating sleeves + washers per NACE SP0286) to electrically isolate the couple. If insulating flange showing potential across joint: replace insulating gasket set (gasket or sleeves have failed). If galvanic corrosion rate >2× general corrosion rate: redesign junction — options include transition pieces (alloy spool between dissimilar metals), dielectric unions, or material upgrade to eliminate the couple. If CP system current increasing: investigate stray galvanic couples or coating failure.

### Fixed-Time (for insulation joint maintenance)

- **Task**: `Test insulating flange on [{tag}]`
- **Interval basis**: Insulating flange/joint integrity test: annually per NACE SP0286 (measure resistance across joint — minimum 1 MΩ dry, verify potential isolation). Sacrificial anode replacement: when consumed >85% (typically 3–7 years depending on environment). Transition joint inspection: every 2–3 years with UT focused on the 5-diameter zone adjacent to the junction on the anodic side. At design stage: follow NACE SP0108 galvanic series for material selection, avoid unfavorable area ratios (large cathode/small anode), and install electrical isolation at all dissimilar metal junctions.

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for intentionally sacrificial components designed as galvanic protection (sacrificial anodes, zinc-coated bolting on steel flanges where bolt replacement is planned). NOT acceptable for pressure boundaries, structural connections, electrical systems, or any component where through-wall galvanic corrosion causes leakage, structural failure, or electrical fault.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.2 Corrosion], [REF-01 §3.5 — CB strategy with calendar basis]*
