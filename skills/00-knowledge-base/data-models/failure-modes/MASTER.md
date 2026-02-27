# Failure Modes Master Reference — 72 Authoritative Combinations

> **Source**: SRC-09 — *Failure Modes (Mechanism + Cause).xlsx*
> **Synthesized from**: 72 individual FM files in `failure-modes/FM-{01-72}-*.md`
> **Version**: 1.0 | **Date**: 2026-02-26
> **Authority**: Single authoritative synthesized reference for all 72 failure mode definitions. Individual FM files remain the canonical deep-dive source for each combination.

---

## Purpose

This document synthesizes the essential reliability engineering content from 72 individual failure mode descriptions into a single scannable reference.

| Consumer | Usage |
|----------|-------|
| Reliability Agent — `validate-failure-modes` | Validate mechanism+cause pairs, look up valid combos |
| Reliability Agent — `perform-fmeca` | Stage 2: identify FMs; Stage 5: select technique, P-F interval, limits |
| Reliability Agent — `run-rcm-decision-tree` | Determine failure pattern (FT eligibility), frequency basis |
| FMECA Engine — `tools/engines/fmeca_engine.py` | Failure mode identification and RPN assessment |
| RCM Decision Engine — `tools/engines/rcm_decision_engine.py` | Cause-to-frequency validation, pattern classification |
| FailureMode Schema — `tools/models/schemas.py` | `VALID_FM_COMBINATIONS` enforcement (72 valid pairs) |
| API Service — `api/services/fmea_service.py` | Database persistence and input validation |
| Streamlit UI — pages 3 (FMEA), 16 (FMECA) | Display, input validation, strategy visualization |

---

## Taxonomy Summary

- **18 Mechanisms**: ARCS, BLOCKS, BREAKS/FRACTURE/SEPARATES, CORRODES, CRACKS, DEGRADES, DISTORTS, DRIFTS, EXPIRES, IMMOBILISED, LOOSES PRELOAD, OPEN-CIRCUIT, OVERHEATS/MELTS, SEVERS, SHORT-CIRCUITS, THERMALLY OVERLOADS, WASHES OFF, WEARS
- **44 Causes**: See `Cause` enum in `tools/models/schemas.py`
- **72 Valid Combinations** — only 9.1% of the 792 theoretical pairs (18 x 44)

### Failure Pattern Distribution

| Pattern | Count | Description | RCM Implication |
|---------|-------|-------------|-----------------|
| B (Age-related) | ~35 | Progressive wear-out, β > 2.0 | FT eligible if feasible |
| C (Gradual increase) | ~14 | Slowly increasing failure rate | FT eligible if feasible |
| E (Random) | ~22 | Constant failure rate, β ≈ 1.0 | FT NOT applicable |
| D (Random + break-in) | 1 | Initial elevated risk | FT NOT applicable |

### Frequency Basis Distribution

| Basis | Count | Unit Types |
|-------|-------|------------|
| Calendar | ~30 | Days, Weeks, Months, Years |
| Operational | ~42 | Operating Hours, Cycles, Tonnes |

---

## How to Read Each Entry

Each FM card follows this format:

```
#### FM-## | Mechanism + Cause | Cal/Op | Pattern | ISO code
> Degradation: 2-sentence physical process + OCP context
- Weibull: β and η ranges
- Top P-conditions: 3 most detectable pre-failure symptoms
- Equipment: ISO 14224 classes + OCP examples
- Primary CBM: Best technique | P-F interval | Reference standard
- Strategy: CB/FT/RTF guidance summary
- Key threshold: Most critical actionable numeric limit
```

**Abbreviations**: Cal = Calendar, Op = Operational, CB = Condition-Based, FT = Fixed-Time, RTF = Run-to-Failure, IR = Insulation Resistance, UT = Ultrasonic Testing, MPI = Magnetic Particle Inspection, DPI = Dye Penetrant Inspection, PD = Partial Discharge, ΔP = Differential Pressure, P-F = Predictive-to-Functional failure interval.

---

## Mechanism-Cause Validation Matrix (Compact)

| Mechanism | # | Valid Causes (FM#) |
|-----------|---|-------------------|
| ARCS | 1 | Breakdown in insulation (01) |
| BLOCKS | 3 | Contamination (02), Excessive particle size (03), Insufficient fluid velocity (04) |
| BREAKS/FRACTURE/SEPARATES | 3 | Cyclic loading (05), Mechanical overload (06), Thermal overload (07) |
| CORRODES | 11 | Bio-organisms (08), Chemical attack (09), Corrosive environment (10), Crevice (11), Dissimilar metals contact (12), Exposure to atmosphere (13), High temp corrosive environment (14), High temp environment (15), Liquid metal (16), Poor electrical connections (17), Poor electrical insulation (18) |
| CRACKS | 6 | Age (19), Cyclic loading (20), Excessive temperature (21), High temp corrosive environment (22), Impact/shock loading (23), Thermal stresses (24) |
| DEGRADES | 8 | Age (25), Chemical attack (26), Chemical reaction (27), Contamination (28), Electrical arcing (29), Entrained air (30), Excessive temperature (31), Radiation (32) |
| DISTORTS | 4 | Impact/shock loading (33), Mechanical overload (34), Off-center loading (35), Use (36) |
| DRIFTS | 5 | Excessive temperature (37), Impact/shock loading (38), Stray current (39), Uneven loading (40), Use (41) |
| EXPIRES | 1 | Age (42) |
| IMMOBILISED | 2 | Contamination (43), Lack of lubrication (44) |
| LOOSES PRELOAD | 3 | Creep (45), Excessive temperature (46), Vibration (47) |
| OPEN-CIRCUIT | 1 | Electrical overload (48) |
| OVERHEATS/MELTS | 6 | Contamination (49), Electrical overload (50), Lack of lubrication (51), Mechanical overload (52), Relative movement (53), Rubbing (54) |
| SEVERS | 3 | Abrasion (55), Impact/shock loading (56), Mechanical overload (57) |
| SHORT-CIRCUITS | 2 | Breakdown in insulation (58), Contamination (59) |
| THERMALLY OVERLOADS | 2 | Mechanical overload (60), Overcurrent (61) |
| WASHES OFF | 2 | Excessive fluid velocity (62), Use (63) |
| WEARS | 9 | Breakdown of lubrication (64), Entrained air (65), Excessive fluid velocity (66), Impact/shock loading (67), Low pressure (68), Lubricant contamination (69), Mechanical overload (70), Metal to metal contact (71), Relative movement (72) |

**Total: 72 valid combinations**

---

## The 72 Failure Modes

### ARCS (1 combination: FM-01)

General character: Electrical discharge through failed insulation. Calendar-based. Pattern B. Primary CBM: insulation resistance, partial discharge monitoring.

---

#### FM-01 | Arcs + Breakdown in insulation | Cal | B | ISO 4.1/4.5

> **Degradation**: Insulation aging follows Arrhenius relationship — every 10°C above rated temperature halves life; partial discharges create self-accelerating erosion until arc flash >5,000°C. At OCP, high ambient near dryers (>45°C), phosphate dust, and coastal humidity at Jorf Lasfar/Safi accelerate HV motor insulation degradation.

- **Weibull**: β 2.5–3.5, η 15,000–25,000 h
- **Top P-conditions**: Declining insulation resistance (>10%/yr), PD activity >100 pC, tan delta trending >0.5% above baseline
- **Equipment**: Electric motors (EM), power transformers (PT), switchgear (SG), generators (EG), VFDs (FC), power cables (PC) — SAG/ball mill drives, substation transformers
- **Primary CBM**: Insulation resistance testing (megger) | P-F 6–12 mo | IEEE 43, IEC 60085
- **Strategy**: CB preferred (measure insulation resistance on motor winding). FT: replace cable terminations per insulation class thermal life (Class F: 20 yr, derate 50% if >40°C). RTF: only redundant non-critical supplies.
- **Key threshold**: IR <50 MΩ → schedule rewinding within 30 days; IR <1 MΩ/kV → do not energize

---

### BLOCKS (3 combinations: FM-02 to FM-04)

General character: Progressive or sudden flow obstruction. Mixed patterns (C, E, D). Primary CBM: differential pressure monitoring, flow rate trending.

---

#### FM-02 | Blocks + Contamination | Cal | C | ISO 5.1

> **Degradation**: Foreign particles, scale, biological growth progressively accumulate on internal surfaces, reducing effective flow cross-section until functional failure. At OCP, gypsum scale in phosphoric acid exchangers, phosphate clay deposits, and marine biofouling in seawater cooling at Jorf Lasfar/Safi are primary contaminants.

- **Weibull**: β 2.0–3.0, η 1,000–5,000 h
- **Top P-conditions**: Increasing ΔP (>50% above clean baseline), decreasing flow rate (>10% below design), heat exchanger approach temperature rising
- **Equipment**: Filters/strainers (FS), valves (VA), pumps (PU), heat exchangers (HE), piping (PI), instruments (ID), cooling systems (CS) — slurry filters, seawater coolers
- **Primary CBM**: Differential pressure measurement | P-F 1–4 wk | OEM max ΔP spec
- **Strategy**: CB preferred (measure ΔP on filter). FT: replace filter element per OEM interval adjusted for fluid cleanliness (slurry 1–3 mo; seawater 3–6 mo). RTF: only duplex filter with auto-switchover.
- **Key threshold**: ΔP 2–3× baseline → clean within 2 weeks; ΔP >3× baseline → replace/clean immediately

---

#### FM-03 | Blocks + Excessive particle size | Op | E | ISO 5.1

> **Degradation**: Particles exceeding design passage size lodge at restrictions, causing sudden flow obstruction — transition from normal to zero flow can occur within seconds. At OCP, critical at trommel screens downstream of SAG mills (ball fragments), hydrocyclone feed distributors, and pinch valve orifices in slurry circuits.

- **Weibull**: β 0.8–1.2, η highly variable (depends on upstream screening)
- **Top P-conditions**: Sudden step-change ΔP increase (>100% in minutes), upstream pressure spike >15%, flow rate drop >20%
- **Equipment**: Filters/strainers (FS), valves (VA), pumps (PU), hydrocyclones (HC), piping (PI), instruments (ID), nozzles (ND) — trommel screens, slurry pinch valves
- **Primary CBM**: ΔP monitoring with alarm | P-F minutes–hours | OEM max ΔP spec
- **Strategy**: CB preferred (monitor ΔP on suction strainer — alarm-driven). FT: inspect screen panels at every shutdown (weekly vibrating, monthly trommel). RTF: acceptable for duplex strainers with auto-switchover.
- **Key threshold**: Sudden ΔP >100% of baseline → clear blockage at next safe opportunity; >2 events/month → investigate upstream screening

---

#### FM-04 | Blocks + Insufficient fluid velocity | Op | D | ISO 5.1

> **Degradation**: Flow velocity below critical deposition velocity (Vc) allows suspended solids to settle, forming a stationary bed that progressively reduces cross-section in a positive feedback loop toward complete blockage. At OCP, critical for the 187 km Khouribga–Jorf Lasfar slurry pipeline and beneficiation launders where velocity must exceed 2.0–2.5 m/s.

- **Weibull**: β 0.8–1.5, η highly variable (depends on slurry properties and operating regime)
- **Top P-conditions**: Velocity falling below design minimum, increasing pipeline ΔP at constant flow, density meter showing lower solids at discharge vs inlet
- **Equipment**: Piping (PI), pumps (PU), valves (VA), gravity flow channels (GF), storage tanks (TA), heat exchangers (HE), hydrocyclones (HC) — Khouribga-Jorf slurry pipeline
- **Primary CBM**: Pipeline flow velocity monitoring (electromagnetic/ultrasonic) | P-F continuous | Durand equation
- **Strategy**: CB preferred (monitor slurry velocity ≥1.2×Vc). FT: water flush at every planned shutdown (before pipeline sits idle >4 hr). RTF: NEVER for long-distance slurry pipelines or setting materials.
- **Key threshold**: Velocity <1.0×Vc for >30 min → initiate water flush; complete blockage → do NOT increase pump pressure (rupture risk)

---

### BREAKS/FRACTURE/SEPARATES (3 combinations: FM-05 to FM-07)

General character: Component separation from mechanical or thermal stress. Mixed patterns (B, E). Primary CBM: NDT (MPI, DPI, UT), load monitoring.

---

#### FM-05 | Breaks/Fracture/Separates + Cyclic loading | Op | B | ISO 2.6

> **Degradation**: Three-stage fatigue: crack initiation at stress concentrators (10⁴–10⁶ cycles), stable propagation per Paris' law, then sudden final fracture when remaining section fails. At OCP, prevalent in SAG/ball mill trunnion shafts (~5×10⁶ cycles/yr), vibrating screen side plates (10⁸+ cycles/yr), and slurry pump shafts.

- **Weibull**: β 2.5–5.0, η 10⁶–10⁸ cycles
- **Top P-conditions**: Surface cracks detectable by MPI/DPI at stress concentrations, vibration amplitude change (stiffness reduction), oxide staining at crack mouths
- **Equipment**: Mills (ML), vibrating equipment (VS), pumps (PU), conveyors (CV), piping (PI), pressure vessels (VE), rotary kilns (RO), cranes (CR) — SAG mill trunnion, vibrating screens
- **Primary CBM**: MPI at known hot spots | P-F 6–12 mo | ASME V Art 7, ISO 9934
- **Strategy**: CB preferred (perform MPI on mill trunnion shaft). FT: replace vibrating screen side plates per design fatigue life (2–5 yr) with safety factor ≥4. RTF: NEVER for rotating shafts, pressure boundaries, or lifting equipment.
- **Key threshold**: Crack <25% section → monitor quarterly; 25–50% → repair within 30 days; >50% or >1 mm/month growth → remove from service immediately

---

#### FM-06 | Breaks/Fracture/Separates + Mechanical overload | Op | E | ISO 2.5

> **Degradation**: Single-event load exceeds ultimate material strength causing immediate separation — ductile materials neck and deform visibly; brittle materials fracture suddenly. At OCP, common in crusher toggle plates (designed fuse), SAG mill liner bolts during charge cascading, pump shafts from tramp material impact.

- **Weibull**: β 0.8–1.2, η highly variable (depends on design safety factor)
- **Top P-conditions**: Visible deformation/bending at connections, section loss from corrosion reducing safety factor, bolt stretch >1% (ultrasonic gauging)
- **Equipment**: Crushers (CU), mills (ML), pumps (PU), conveyors (CV), structural steel (ST), valves (VA), gearboxes (GB), cranes (CR) — crusher toggle plates, mill liner bolts
- **Primary CBM**: UT thickness at corroded/worn sections | P-F 3–12 mo | API 574, ASME B31.3
- **Strategy**: CB preferred (inspect structural condition of crusher frame). FT: replace toggle plates at every major shutdown; belt splices every 12–24 mo. RTF: acceptable for designed sacrificial elements (toggle plates, shear pins).
- **Key threshold**: Section loss >30% → de-rate and plan replacement; visible plastic deformation → reduce load, repair within 30 days

---

#### FM-07 | Breaks/Fracture/Separates + Thermal overload | Op | E | ISO 2.5

> **Degradation**: Thermal shock fracture (rapid ΔT exceeds material fracture strength) or high-temperature embrittlement (>425°C causes graphitization in carbon steel, sigma phase in stainless). At OCP, occurs in kiln/dryer refractory failure exposing shell to >800°C, cast iron pump casings during water quench, and heat exchanger tubes during blockage.

- **Weibull**: β 0.8–1.2, η highly variable (depends on thermal shock magnitude)
- **Top P-conditions**: Surface temperature exceeding design rating, heat discoloration (straw 200°C, blue 300°C, grey 400°C+), refractory spalling exposing structural shell
- **Equipment**: Rotary equipment (RO), heat exchangers (HE), pressure vessels (VE), furnaces (FU), pumps (PU), piping (PI), valves (VA), concrete (CS) — kilns, acid coolers
- **Primary CBM**: Thermal scan on kiln shell | P-F 1–4 wk | ISO 18434-1
- **Strategy**: CB preferred (thermal scan kiln shell). FT: internal refractory inspection at every annual shutdown; replace sections <50% of design thickness. RTF: NEVER for pressure-containing or structural elements.
- **Key threshold**: Shell temp >350°C (carbon steel) → reduce firing, plan refractory repair; >400°C or cherry-red → reduce firing immediately, emergency repair

---

### CORRODES (11 combinations: FM-08 to FM-18)

General character: Progressive electrochemical/chemical material loss. All 11 are Calendar-based. Patterns: mostly B (age-related). Primary CBM: UT thickness, visual coating assessment, bacterial monitoring.

---

#### FM-08 | Corrodes + Bio-organisms | Cal | B | ISO 2.2

> **Degradation**: Microbiologically influenced corrosion (MIC) occurs when sulfate-reducing, iron-oxidizing, and acid-producing bacteria colonize metal surfaces, forming biofilms that create localized acidic, oxygen-depleted micro-environments driving pitting at 1–5 mm/yr. At OCP, cooling water systems at Jorf Lasfar (seawater circuits), stagnant fire water dead legs, and buried piping in nutrient-rich soil near fertilizer plants are prime MIC habitats.

- **Weibull**: β 1.5–3.0, η 15,000–60,000 h
- **Top P-conditions**: Black FeS deposits under tubercles (H₂S odor), localized hemispherical pitting at 6 o'clock in horizontal pipes, planktonic bacterial counts >10⁴ CFU/mL
- **Equipment**: Heat exchangers (HE), piping (PI), storage tanks (TA), pumps (PU), valves (VA), cooling towers (CT), fire protection (FP) — Jorf Lasfar cooling water exchangers, fire water systems
- **Primary CBM**: Bacterial count monitoring (planktonic + sessile) | P-F 1–3 mo | NACE TM0194, ASTM D6974
- **Strategy**: CB preferred (monitor bacterial counts in cooling water). FT: fire water flush/inspection annually per NFPA 25; biocide shock dosing quarterly. RTF: only sacrificial monitoring components (corrosion coupons).
- **Key threshold**: Planktonic >10⁴ CFU/mL → review biocide program; sessile >10⁵ CFU/cm² → mechanical cleaning required

---

#### FM-09 | Corrodes + Chemical attack | Cal | B | ISO 2.2

> **Degradation**: Direct chemical dissolution where process chemicals react with equipment material, causing progressive mass loss following Arrhenius kinetics — rate doubles per 10°C increase. At OCP, phosphoric acid (28–54% H₃PO₄) attacks carbon steel at 2–10 mm/yr, sulfuric acid is aggressive to most metals, and HF from fluorapatite dissolution attacks glass and refractories at Jorf Lasfar/Safi.

- **Weibull**: β 2.0–3.5, η 10,000–50,000 h
- **Top P-conditions**: Progressive wall thinning by UT (uniform loss pattern), lining degradation (blistering, delamination, pinholing), corrosion coupon weight loss >2× design rate
- **Equipment**: Reactors (RE), storage tanks (TA), pumps (PU), piping (PI), heat exchangers (HE), valves (VA), filters (FS) — phosphoric acid attack tanks, H₂SO₄/H₃PO₄ storage, acid transfer pumps
- **Primary CBM**: UT thickness measurement at TMLs | P-F 3–6 mo | API 510, API 574, API 570
- **Strategy**: CB preferred (measure wall thickness on acid piping). FT: reline acid tanks per lining life — rubber 5–8 yr, PTFE 10–15 yr, brick 10–20 yr. RTF: only sacrificial wear components (corrosion coupons, gaskets).
- **Key threshold**: Corrosion rate >design allowance → investigate root cause; lining holiday detected → repair within 30 days

---

#### FM-10 | Corrodes + Corrosive environment | Cal | B | ISO 2.2

> **Degradation**: Environmental electrochemical attack from humidity, airborne contaminants, and process spillage forming thin electrolyte films; rate increases sharply above 60% RH and accelerates above 80% RH with chloride deposition. OCP coastal sites (Jorf Lasfar, Safi) face ISO 9223 C4–C5 marine atmosphere with chloride deposition 60–300 mg/m²/day.

- **Weibull**: β 2.0–3.0, η 15,000–80,000 h
- **Top P-conditions**: Visible rust and paint degradation (ASTM D714 blistering, D610 rusting), galvanized coating white/red rust breakthrough, structural section loss at connections
- **Equipment**: Structural steel (ST), piping (PI), electrical installations (EI), storage tanks (TA), conveyors (CV), cranes (CR), instruments (ID) — pipe racks, cable trays, outdoor tanks
- **Primary CBM**: Visual coating condition assessment | P-F 6–12 mo | ASTM D610, ASTM D714
- **Strategy**: CB preferred (inspect coating condition). FT: repaint per ISO 9223 — C5 coastal 5–8 yr, C4 inland 7–10 yr; min 250 μm DFT zinc-rich + epoxy + PU per ISO 12944-5. RTF: only low-cost cosmetic items.
- **Key threshold**: Coating <rating 6 per ASTM D610 → plan spot repair; structural section loss >10% → immediate de-rate

---

#### FM-11 | Corrodes + Crevice | Cal | B | ISO 2.2

> **Degradation**: Localized electrochemical attack within stagnant solution volumes at gasket-flange interfaces where oxygen depletion and chloride migration create acidic micro-environments (pH 1–2) destroying passive films on stainless steels. At OCP, phosphoric acid service and seawater systems at Jorf Lasfar (~19,000 ppm Cl⁻) drive severe crevice attack at flanges and tube-to-tubesheet interfaces.

- **Weibull**: β 1.5–3.0, η 10,000–60,000 h
- **Top P-conditions**: Gasket face staining/seepage at outer crevice edge, weeping at flanged joints, under-deposit hemispherical pitting visible after cleaning
- **Equipment**: Piping (PI), heat exchangers (HE), pumps (PU), valves (VA), storage tanks (TA), pressure vessels (VE), fasteners (FT) — flanged acid piping, seawater exchangers, splash-zone bolting
- **Primary CBM**: UT thickness at flange faces and gasket lines | P-F 6–12 mo | API 574, API 570
- **Strategy**: CB preferred (inspect flange faces for crevice corrosion). FT: inspect flange faces at every gasket change (2–4 yr); replace splash-zone bolting every 3–5 yr with alloy 625. RTF: only non-pressure cosmetic lap joints.
- **Key threshold**: Crevice pitting >1 mm on flange face → engineer assessment; flange finish must be restored to ≤6.3 μm Ra per ASME B16.5

---

#### FM-12 | Corrodes + Dissimilar metals | Cal | B | ISO 2.2

> **Degradation**: Galvanic corrosion when two metals with different electrochemical potentials are electrically connected in an electrolyte — the more active (anodic) metal corrodes preferentially; severity depends on potential difference, electrolyte conductivity, and cathode-to-anode area ratio. At OCP, carbon steel-to-stainless transitions, copper alloy tubes in steel tube sheets, and seawater systems at Jorf Lasfar (conductivity ~50 mS/cm) create persistent couples.

- **Weibull**: β 2.0–3.5, η 10,000–50,000 h
- **Top P-conditions**: Accelerated corrosion of less noble metal at junction with clean noble metal adjacent, distinctive wall thinning within 1–5 pipe diameters of junction, galvanic potential >100 mV
- **Equipment**: Piping (PI), heat exchangers (HE), pumps (PU), valves (VA), structural steel (ST), electrical installations (EI), fasteners (FT) — CS-to-SS transitions, copper tubes in steel shells, Cu-Al terminations
- **Primary CBM**: UT thickness at dissimilar metal junctions | P-F 6–12 mo | API 574, API 570
- **Strategy**: CB preferred (measure wall thickness at dissimilar metal joint). FT: insulating flange test annually per NACE SP0286; sacrificial anode replacement when >85% consumed (3–7 yr). RTF: only intentionally sacrificial components (zinc anodes).
- **Key threshold**: Wall thinning >20% at junction → install insulating gasket kit per NACE SP0286; galvanic rate >2× general rate → redesign junction

---

#### FM-13 | Corrodes + Exposure to atmosphere | Cal | B | ISO 2.2

> **Degradation**: Atmospheric corrosion under thin moisture films (10–100 μm) governed by time-of-wetness, amplified by airborne chlorides, SO₂, and phosphate dust forming hygroscopic conductive films. OCP coastal sites (Jorf Lasfar, Safi) are ISO 9223 C4/C5 with 60–300 mg/m²/day chloride and 70–80% avg RH — among the most aggressive atmospheric environments in North Africa.

- **Weibull**: β 1.5–2.5, η 30,000–100,000 h
- **Top P-conditions**: Progressive surface rust (orange to lamellar scaling to deep pitting), coating chalking/cracking/blistering/delamination, galvanized white rust with red rust breakthrough
- **Equipment**: Structural steel (ST), storage tanks (TA), piping (PI), cranes (CR), conveyors (CV), electrical installations (EI), civil structures (CS) — all outdoor steelwork, pipe racks, cable trays
- **Primary CBM**: Visual coating and corrosion condition assessment | P-F 6–12 mo | ASTM D610, ISO 4628
- **Strategy**: CB preferred (assess coating condition on outdoor structure). FT: repaint per ISO 9223 — C5 coastal full recoat 6–8 yr, C3 inland 12–15 yr; min C5-M system ≥320 μm DFT. RTF: only low-cost non-structural items.
- **Key threshold**: Coating <5 per ASTM D610 or adhesion <2.0 MPa → plan full recoating at next shutdown

---

#### FM-14 | Corrodes + High-temp corrosive environment | Cal | B | ISO 2.2

> **Degradation**: High-temperature corrosion above 200°C (CS)/400°C (SS) through sulfidation (H₂S/SO₂ forming sulfides 10–100× faster than oxides), hot corrosion (molten Na₂SO₄+V₂O₅ fluxing Cr₂O₃ at 600–900°C), and chloride-accelerated active oxidation. At OCP, rotary kilns for phosphate calcination (800–1000°C), dryers at 300–600°C, and waste heat recovery at Jorf Lasfar sulfuric acid plants are primary zones.

- **Weibull**: β 2.0–3.5, η 8,000–40,000 h
- **Top P-conditions**: Multi-layered scale buildup (oxide+sulfide), tube metal temperature trending upward, vanadium-rich deposit accumulation (green/black)
- **Equipment**: Rotary equipment (RO), boilers (BO), heat exchangers (HE), furnaces (FU), piping (PI), stacks (SK), fans (FA) — rotary kilns, superheater tubes, waste heat boilers
- **Primary CBM**: Tube metal temperature monitoring (thermocouples, IR) | P-F continuous/weekly | API 530, ASME PCC-3
- **Strategy**: CB preferred (measure tube thickness on kiln hot zone). FT: kiln refractory inspection every reline (12–24 mo); boiler tube inspection annually. RTF: only sacrificial replaceable internals (furnace baffles).
- **Key threshold**: Tube metal temp >max allowable per API 530 → clean deposits or upgrade alloy; vanadium >50 ppm in fuel ash → add Mg-based additive

---

#### FM-15 | Corrodes + High-temp environment | Cal | B | ISO 2.2

> **Degradation**: High-temperature oxidation (scaling/dry corrosion) via solid-state diffusion forming oxide scales following parabolic kinetics; scale protectiveness depends on chromium content — carbon steel limited to ~540°C, 304 SS to ~870°C; thermal cycling accelerates by spalling protective scale. At OCP, kiln/dryer shell exterior surfaces, boiler steam-side magnetite growth (>350°C exfoliating), and high-temperature bolt oxidation are key concerns.

- **Weibull**: β 2.0–3.5, η 15,000–80,000 h
- **Top P-conditions**: Progressive oxide scale with spallation (rough pitted surface), steam-side oxide exfoliation detected by tube temperature increase, bolt torque relaxation from thread oxidation
- **Equipment**: Rotary equipment (RO), boilers (BO), furnaces (FU), piping (PI), heat exchangers (HE), fasteners (FT), fans (FA) — kiln/dryer shells, superheater tubes, high-temp bolting
- **Primary CBM**: Surface temperature monitoring (thermocouples, IR pyrometry) | P-F continuous/weekly | API 530, ASME PCC-3
- **Strategy**: CB preferred (measure wall thickness on kiln shell hot zone). FT: boiler chemical clean every 5–10 yr; kiln shell UT every reline; high-temp bolt replacement every 5–8 yr. RTF: only sacrificial internals (furnace baffles, heater elements).
- **Key threshold**: Steam-side oxide >500 μm → plan chemical cleaning; high-temp bolt torque loss >20% → re-torque using hot-bolting procedure

---

#### FM-16 | Corrodes + Liquid metal | Cal | E | ISO 2.2

> **Degradation**: Liquid metal embrittlement (LME) causes sudden catastrophic brittle cracking when specific liquid-solid metal couples interact under tensile stress; liquid metal corrosion (LMC) is progressive dissolution at Arrhenius-governed rates. At OCP, primary risks are LME during welding on galvanized structures (molten zinc contacts HAZ), galvanized high-strength bolt cracking, and babbitt bearing degradation.

- **Weibull**: β 0.8–1.5, η hours (LME) to 10,000+ h (dissolution)
- **Top P-conditions**: Intergranular cracking at galvanized weld HAZ (MPI/DPI post-weld), sudden brittle fracture of galvanized high-strength bolt during/after tightening, weld HAZ cracking
- **Equipment**: Structural steel (ST), fasteners (FT), bearings (BE), instruments (ID), piping (PI), welded structures (WS) — galvanized structures requiring field welding, babbitt bearings
- **Primary CBM**: MPI/DPI at welds on galvanized structures (post-weld) | P-F after each weld | AWS D1.1, ISO 9934
- **Strategy**: CB preferred (inspect welds on galvanized structure for LME). FT: mandatory zinc removal ≥100 mm from weld zone per AWS D1.1; restrict bolt grade ≤8.8 per ISO 10684. RTF: only sacrificial zinc anodes in CP systems.
- **Key threshold**: Any LME crack at galvanized weld → stop operation, grind out completely, remove all zinc 100 mm around weld, re-weld and inspect

---

#### FM-17 | Corrodes + Poor electrical connections | Cal | C | ISO 2.2

> **Degradation**: Poor contact concentrates current through reduced cross-section, generating I²R resistive heating that drives oxidation, which further reduces contact area — a self-reinforcing positive feedback loop toward thermal runaway. At OCP, phosphate dust contaminates connections, coastal salt air accelerates oxidation, and widespread aluminum-to-copper terminations create vulnerable dissimilar metal joints.

- **Weibull**: β 1.5–3.0, η 15,000–60,000 h
- **Top P-conditions**: Elevated temperature at connections (IR thermography ΔT >10°C), discolored/oxidized surfaces (greenish-blue Cu, white Al), voltage drop >50 μΩ per bolt
- **Equipment**: Switchgear (SG), transformers (TR), electric motors (EM), cable systems (CA), VFDs (VD), control panels (CP) — MCC panels, motor terminal boxes, Cu-Al terminations
- **Primary CBM**: IR thermographic survey | P-F 3–12 mo | NETA MTS, IEC 62446, NFPA 70B
- **Strategy**: CB preferred (perform IR survey on switchgear). FT: re-torque MCC connections every 3–5 yr; Cu-Al inspection annually with anti-oxidant renewal. RTF: only low-power control connections (<100A) with redundancy.
- **Key threshold**: ΔT >70°C (NETA "Deficiency") → de-energize and repair immediately — risk of thermal runaway and fire

---

#### FM-18 | Corrodes + Poor electrical insulation | Cal | C | ISO 2.2

> **Degradation**: Stray current corrosion when current leaves intended conductor path and flows through metallic structures; per Faraday's Law, 1 A DC dissolves ~9 kg steel/yr at the anodic discharge point — potentially the most rapid corrosion form. At OCP, buried piping near Jorf Lasfar CP systems, DC-powered draglines at Khouribga, and phosphate ore DC rail transport are primary risk sources.

- **Weibull**: β 1.5–2.5, η 20,000–80,000 h
- **Top P-conditions**: Localized deep pitting at discrete points on buried piping, pipe-to-soil potential positive shifts near foreign CP systems, insulating flange resistance <1 MΩ
- **Equipment**: Buried piping (PI), storage tanks (TA), structural steel (ST), cathodic protection (CP), electrical installations (EI), railways (RW) — slurry pipelines, tank farms, Khouribga draglines and rail
- **Primary CBM**: Pipe-to-soil potential survey | P-F 3–12 mo | NACE SP0169, ISO 15589-1
- **Strategy**: CB preferred (perform pipe-to-soil potential survey). FT: insulating flange test annually per NACE SP0286; CP rectifier output monthly; CIPS every 3–5 yr. RTF: only non-critical above-ground structures.
- **Key threshold**: Pipe-to-soil positive shift → investigate stray current source, install drainage bond; AC voltage >15V → install AC mitigation per NACE SP21424

---

### CRACKS (6 combinations: FM-19 to FM-24)

General character: Crack initiation and propagation from age, cyclic, thermal, or environmental stress. Mixed patterns (B, C, E). Primary CBM: NDT (DPI, MPI, UT), process temperature monitoring.

---

#### FM-19 | Cracks + Age | Cal | B | ISO 2.5/2.6

> **Degradation**: Age-induced cracking through time-dependent mechanisms — SCC, hydrogen embrittlement, creep cracking, polymer chain scission — that initiate and propagate cracks under normal stresses well below yield over years. At OCP, stainless steel in hot phosphoric acid with chlorides at Jorf Lasfar (chloride SCC >50°C), age-cracking rubber linings, and hydrogen-embrittled high-strength bolts on mills are primary concerns.

- **Weibull**: β 2.5–4.0, η 50,000–200,000 h
- **Top P-conditions**: Surface cracks by DPI/MPI at welds and stress concentrations, elastomer crazing/hardening (Shore A change >15%), seal leakage through aged gaskets
- **Equipment**: Pressure vessels (VE), piping (PI), valves (VA), pumps (PU), storage tanks (TA), rubber-lined equipment (RL), seals/gaskets (SG) — SS acid vessels, rubber linings, elastomeric seals
- **Primary CBM**: Dye penetrant inspection (DPI) | P-F 6–24 mo | ASME V Article 6, ISO 3452
- **Strategy**: CB preferred (perform DPI on vessel weld seams). FT: replace elastomeric seals per life (EPDM 5–10 yr, Viton 10–15 yr, PTFE 15–20 yr); RBI per API 580/581. RTF: only non-critical elastomerics with minor leakage.
- **Key threshold**: SCC crack in stainless steel → assess by UT, plan repair (sudden failure possible); elastomer hardness >15% above spec → replace immediately

---

#### FM-20 | Cracks + Cyclic loading | Op | B | ISO 2.6

> **Degradation**: Fatigue cracking at stress concentrations (weld toes, keyways, corrosion pits) propagating per Paris' law da/dN = C(ΔK)^m; crack growth is measurable between inspections enabling remaining life prediction. At OCP, vibrating screen weld joints at Khouribga (10⁸+ cycles/yr), small-bore piping connections, kiln shell welds from thermal cycling, and slurry pump nozzle welds are primary fatigue locations.

- **Weibull**: β 3.0–5.0, η 10⁶–10⁹ cycles
- **Top P-conditions**: Surface cracks by MPI/DPI/eddy current at fatigue-prone locations, measurable crack growth between NDE inspections, oxide staining at crack mouths
- **Equipment**: Vibrating equipment (VS), piping (PI), pressure vessels (VE), mills (ML), pumps (PU), rotary equipment (RO), cranes (CR) — vibrating screens, SAG/ball mill shells, slurry pump casings
- **Primary CBM**: MPI at welds | P-F 6–12 mo | ASME V Article 7, ISO 9934
- **Strategy**: CB preferred (perform MPI on screen side plates). FT: inspect per BS 7608; vibrating screens every 6–12 mo; initiate NDE at 50% design fatigue life. RTF: never for pressure boundaries, structural members, rotating shafts.
- **Key threshold**: Crack >25% of section or growth exceeding prediction → remove from service (sudden fracture risk)

---

#### FM-21 | Cracks + Excessive temperature | Op | E | ISO 2.5

> **Degradation**: Thermal shock cracking from rapid temperature change (σ = E·α·ΔT/(1-ν)) or overtemperature embrittlement from sustained exposure (grain boundary precipitation, sigma phase, sensitization). At OCP, glass-lined reactor thermal shock at Jorf Lasfar, kiln shell hot spots from refractory failure (>400°C), and cast iron pump thermal shock from emergency water quench are key scenarios.

- **Weibull**: β 0.8–1.2 (single event) or 2.0–3.0 (cumulative), η highly variable
- **Top P-conditions**: Surface thermal checking ("elephant skin" crack network), glass lining crack by spark test per NACE SP0188, metallurgical change by replica metallography or hardness shift
- **Equipment**: Rotary equipment (RO), pressure vessels (VE), heat exchangers (HE), piping (PI), pumps (PU), furnaces (FU), valves (VA) — kilns, glass-lined reactors, cast iron pumps
- **Primary CBM**: Process temperature monitoring (thermocouples, RTDs) | P-F continuous | Process design specification
- **Strategy**: CB preferred — event-driven (inspect after thermal event). FT: refractory inspection every shutdown; glass lining spark test every 6–12 mo; kiln shell thermal scan weekly. RTF: only expendable refractory and non-pressure ceramics.
- **Key threshold**: Glass lining holiday → repair if <100 cm², reline if larger; sensitization in SS HAZ → solution anneal or replace

---

#### FM-22 | Cracks + High-temp corrosive environment | Cal | C | ISO 2.5

> **Degradation**: Synergistic combination of temperature, corrosive species, and stress — SCC accelerated by temperature (chloride SCC >50°C, caustic SCC >65°C), HTHA from hydrogen at >200°C forming methane that nucleates intergranular fissures, polythionic acid cracking of sensitized SS during cooldown. At OCP, Jorf Lasfar phosphoric acid plant SS at 80–110°C with chlorides/fluorides and kiln zones above HTHA threshold are primary locations.

- **Weibull**: β 1.5–3.0, η 10,000–50,000 h
- **Top P-conditions**: SCC branching crack patterns by DPI (highly branched dendritic), HTHA fissuring by advanced UT (backscatter, velocity ratio), metallographic replica showing grain boundary attack
- **Equipment**: Pressure vessels (VE), heat exchangers (HE), piping (PI), pumps (PU), valves (VA), storage tanks (TA), boilers (BO) — phosphoric acid reactors/evaporators, hot acid piping, caustic service vessels
- **Primary CBM**: DPI for surface SCC detection | P-F 6–12 mo | ASME V Article 6, ISO 3452
- **Strategy**: CB preferred (perform NDE on acid vessel welds). FT: per API 580/581 RBI — SS >50°C with chlorides every 2–3 yr; CS in caustic >65°C every 3–5 yr. RTF: NEVER — SCC/HTHA failures are sudden and catastrophic.
- **Key threshold**: Any HTHA fissuring → de-rate vessel per API 579; corrosion rate >0.5 mm/yr SS or >1.0 mm/yr CS → review process chemistry

---

#### FM-23 | Cracks + Impact/shock loading | Op | E | ISO 2.5

> **Degradation**: Sudden high-energy impacts generate stresses exceeding dynamic fracture toughness; susceptibility increases at low temperatures via ductile-to-brittle transition. At OCP, cast iron pump/valve casings from water hammer, crusher castings from tramp metal, and winter conditions at Khouribga (0 to −5°C) reducing carbon steel toughness are primary risks.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Visible surface crack from impact dent, water hammer pressure >2× normal logged by instrumentation, cast iron crack with sharp edges at impact site
- **Equipment**: Pumps (PU), valves (VA), piping (PI), crushers (CU), concrete (CS), storage tanks (TA), pressure vessels (VE), conveyors (CV) — cast iron pumps, water hammer piping, crusher castings
- **Primary CBM**: DPI/MPI at impact locations | P-F after event + 6–12 mo | ASME V Articles 6/7
- **Strategy**: CB preferred — event-driven (inspect after impact). FT: surge vessel pre-charge check 6–12 mo; slow-closing valve timing annually; winter visual at Khouribga (Dec–Feb). RTF: only sacrificial impact absorbers (toggle plates, expendable chute liners).
- **Key threshold**: Crack in cast iron → replace immediately (cannot be reliably weld-repaired); water hammer >1.5× design → install surge protection

---

#### FM-24 | Cracks + Thermal stresses | Op | B | ISO 2.6

> **Degradation**: Temperature gradients or cycling generate differential expansion stresses (σ = E·α·ΔT/(1-ν)); a 100°C constrained change in carbon steel generates ~250 MPa approaching yield; Coffin-Manson low-cycle fatigue governs life. At OCP, kiln/dryer cycling during startup (ΔT >200°C), dissimilar metal welds on CS-to-SS acid piping at Jorf Lasfar, and outdoor piping at Khouribga with 30°C diurnal swings are critical.

- **Weibull**: β 2.0–4.0, η 1,000–50,000 cycles
- **Top P-conditions**: Surface checking/crazing by DPI (fine crack network perpendicular to thermal stress), cracking at dissimilar metal welds, pipe support damage from excessive thermal movement
- **Equipment**: Piping (PI), rotary equipment (RO), heat exchangers (HE), pressure vessels (VE), furnaces (FU), valves (VA), pumps (PU) — expansion loops, DMW joints, kiln shell welds, expansion bellows
- **Primary CBM**: DPI for thermal fatigue crack detection | P-F 6–12 mo | ASME V Article 6, ISO 3452
- **Strategy**: CB preferred (perform DPI on expansion loop elbows). FT: DMW inspection every 3–5 yr; expansion bellows every 2–3 yr per EJMA; thermal cycle logging with alarm at 50%/80% design life. RTF: never for pressure boundaries, expansion joints, or DMWs.
- **Key threshold**: DMW cracking → plan weld replacement (Inconel 82/182 for CS-to-SS) within 30 days; bellows cracked → replace immediately

---

### DEGRADES (8 combinations: FM-25 to FM-32)

General character: Progressive material property deterioration. All Calendar-based except FM-30, FM-31. Patterns: mostly B. Primary CBM: oil analysis, hardness testing, visual inspection.

---

#### FM-25 | Degrades + Age | Cal | B | ISO 2.0

> **Degradation**: Material properties deteriorate as a time-dependent function of environmental exposure regardless of operating status — polymer chain scission, plasticizer migration, capacitor dielectric aging. At OCP, EPDM/nitrile seals age across all plants, outdoor conveyor belt rubber suffers oxidation and ozone cracking at Khouribga, and UPS capacitor aging degrades PLC/DCS reliability.

- **Weibull**: β 2.5–4.0, η 30,000–100,000 h
- **Top P-conditions**: Elastomer hardness increasing (Shore A >15% above spec), surface cracking/crazing/chalking on polymers, UPS battery capacity <80% of rated
- **Equipment**: Seals/gaskets (SG), conveyors (CV), safety devices (SD), UPS (UP), control logic (CL), piping (PI), hoses (HO) — conveyor belts, fire extinguishers, UPS batteries, PLC modules
- **Primary CBM**: Hardness testing of elastomeric components | P-F 6–12 mo | ASTM D2240, ISO 7619
- **Strategy**: CB preferred (test battery capacity on UPS). FT: replace per calendar life — EPDM/nitrile 5–8 yr, Viton 10–15 yr, VRLA batteries 3–5 yr per IEEE 450, hoses 6–8 yr. RTF: only non-critical cosmetic polymers.
- **Key threshold**: Battery capacity <80% → replace within 12 mo; <70% → replace within 30 days

---

#### FM-26 | Degrades + Chemical attack | Cal | B | ISO 2.0

> **Degradation**: Process chemicals cause progressive deterioration of polymeric/elastomeric materials through solvent swelling, depolymerization, oxidative degradation, and hydrolysis; rate doubles per 10°C. At OCP, phosphoric acid (28–54%), HF impurities, and sulfuric acid attack EPDM, natural rubber, and FRP linings in wet-process acid circuits at Jorf Lasfar/Safi at 80–110°C.

- **Weibull**: β 2.0–3.5, η 5,000–30,000 h
- **Top P-conditions**: Polymer swelling/softening (>5% volume change), surface blistering/delamination of linings, FRP roughening with exposed fibers
- **Equipment**: Piping (PI), storage tanks (TA), pumps (PU), valves (VA), seals/gaskets (SG), heat exchangers (HE), filters (FS) — rubber-lined acid piping, FRP acid tanks, slurry pump liners
- **Primary CBM**: Hardness and dimensional measurement | P-F 6–12 mo | ASTM D2240, ASTM D471
- **Strategy**: CB preferred (inspect lining condition on acid piping). FT: replace gaskets per compatibility life — EPDM in H₃PO₄ 2–3 yr; Viton 5–8 yr; PTFE 8–15 yr. RTF: never for containment linings on corrosive circuits.
- **Key threshold**: Blistering >10% area or substrate exposed → relining within 14 days

---

#### FM-27 | Degrades + Chemical reaction | Cal | B | ISO 2.0

> **Degradation**: Component's own material undergoes internal chemical transformation — oil oxidation forms varnish/sludge, rubber reversion breaks sulfur cross-links, concrete carbonation reduces alkalinity; reactions accelerated by temperature and contamination. At OCP, mill gearbox oil at 70–90°C oxidizes faster, transformer oil degrades cellulose insulation, and coastal concrete at Jorf Lasfar/Safi carbonates from humidity and CO₂.

- **Weibull**: β 2.0–3.0, η 10,000–50,000 h
- **Top P-conditions**: Oil TAN >2.0 mg KOH/g, varnish/sludge visible on surfaces, transformer DGA showing CO >300 ppm
- **Equipment**: Gearboxes (GB), hydraulic systems (HY), transformers (PT), compressors (CO), pumps (PU), rubber-lined equipment (RL), concrete (CS) — mill gearboxes, oil-filled transformers
- **Primary CBM**: Oil analysis (TAN, viscosity, oxidation, wear metals) | P-F 1–3 mo | ASTM D974, D445, D6224, ISO 4406
- **Strategy**: CB preferred (analyze lubricant condition on gearbox). FT: oil change per OEM or analysis — mineral 3,000–8,000 h, synthetic 8,000–15,000 h. RTF: never for transformer oil or safety-critical lubricants.
- **Key threshold**: TAN >4.0 mg KOH/g → change oil immediately (acid attack on bearing surfaces)

---

#### FM-28 | Degrades + Contamination | Cal | C | ISO 2.0

> **Degradation**: Foreign particles, water, or chemicals infiltrate and progressively degrade the working medium — abrasive particles in oil generate secondary wear in geometric progression, water causes hydrogen embrittlement and additive hydrolysis. At OCP, phosphate dust (Mohs 5–6) enters lubricant systems, seawater leaks into cooling circuits at Jorf Lasfar/Safi, and slurry ingress contaminates pump bearing oil.

- **Weibull**: β 1.5–2.5, η 3,000–15,000 h
- **Top P-conditions**: Particle count exceeding ISO 4406 target, water in oil >200 ppm, metallic wear debris trending upward (ferrography)
- **Equipment**: Gearboxes (GB), hydraulic systems (HY), pumps (PU), transformers (PT), compressors (CO), engines (EN), cooling systems (CS), motors (EM) — mill gearboxes, mobile hydraulics, slurry pump bearings
- **Primary CBM**: Oil analysis (particle count, water, viscosity, wear metals) | P-F 1–3 mo | ISO 4406, ASTM D6304
- **Strategy**: CB preferred (analyze lubricant contamination). FT: replace oil filters per OEM or ΔP bypass; desiccant breathers every 3–6 mo in humid environments. RTF: never for hydraulic servo, transformer oil, or engine oil.
- **Key threshold**: Water >500 ppm → drain/dehydrate and find source; particle count exceeding target by 2 ISO codes → upgrade filtration

---

#### FM-29 | Degrades + Electrical arcing | Op | C | ISO 2.0

> **Degradation**: Repetitive arcing during switching progressively erodes contact surfaces, deposits conductive carbon on insulation, and degrades arc chutes; each operation ablates 10–100 μg of contact material at >5,000°C. At OCP, motor contactors cycling >100 times/day on slurry pump auto-start/stop and frequent overcurrent trips suffer accelerated erosion; phosphate dust increases arc energy.

- **Weibull**: β 1.5–2.5, η 5,000–50,000 operations
- **Top P-conditions**: Contact resistance >50% above baseline (micro-ohm test), thermography ΔT >10°C at contacts, visible contact pitting/erosion
- **Equipment**: Switchgear (SG), control logic (CL), motors (EM), VFDs (FC), generators (EG), UPS (UP) — LV MCC contactors, MV circuit breakers, wound rotor slip ring brushes
- **Primary CBM**: Contact resistance measurement (micro-ohm) | P-F 6–12 mo | NETA MTS, IEC 62271-100
- **Strategy**: CB preferred (measure contact resistance on circuit breaker). FT: replace contacts at 80% OEM-rated endurance (LV: 100k–1M ops AC-3). RTF: only low-duty contactors in non-critical circuits.
- **Key threshold**: Contact resistance >200% baseline or pitting >50% area → replace before next operational cycle

---

#### FM-30 | Degrades + Entrained air | Op | E | ISO 2.0

> **Degradation**: Gas bubbles in liquid cause cavitation erosion (micro-jets >100 m/s), accelerated oil oxidation (10× at 10% air), and micro-dieseling (>1,000°C localized ignition of compressed air in high-pressure zones). At OCP, slurry pump suction vortexing causes impeller cavitation, air entry through worn hydraulic seals creates valve erosion, and foam from shaft seal leaks reduces bearing oil film.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Cavitation noise (cracking/rattling at pump suction), foam in oil reservoirs, pump discharge pressure fluctuating >±5%
- **Equipment**: Pumps (PU), hydraulic systems (HY), gearboxes (GB), valves (VA), compressors (CO), piping (PI) — slurry pumps, mobile equipment hydraulics, mill gearbox oil systems
- **Primary CBM**: Vibration monitoring (cavitation detection — broadband HF) | P-F 1–4 wk | ISO 10816, ISO 13709
- **Strategy**: CB preferred (monitor pump NPSH). FT: verify pump suction submergence at every outage. RTF: never for critical pumps or hydraulic systems.
- **Key threshold**: NPSHa must be ≥ NPSHr + 0.5 m; cavitation erosion on impeller → correct NPSH deficiency before replacing impeller

---

#### FM-31 | Degrades + Exposure to excessive temperature | Op | E | ISO 2.0

> **Degradation**: Components above rated range suffer permanent property changes — polymers decompose, lubricants crack, electronics age per Arrhenius (each 10°C above rating halves life). At OCP, instrumentation near kilns/dryers at Khouribga exceeds 60°C (many rated 55°C), PVC cable becomes brittle >70°C, nylon tubing softens near hot surfaces.

- **Weibull**: β 0.8–1.5, η highly variable
- **Top P-conditions**: Material becoming brittle/discolored/chalky, cable insulation cracking/hardening, equipment temperature exceeding material rating (DCS logged)
- **Equipment**: Electrical installations (EI), control logic (CL), instruments (ID), seals/gaskets (SG), pumps (PU), piping (PI), safety devices (SD) — cable trays near kilns, field instruments near dryers
- **Primary CBM**: Ambient temperature monitoring near sensitive equipment | P-F continuous | OEM rated range
- **Strategy**: CB preferred (monitor ambient temperature near electronics). FT: inspect heat protection every 12 mo; cabinet cooling filters 3–6 mo; cable testing in hot zones every 2–3 yr. RTF: never for safety-critical electronics or power cables.
- **Key threshold**: Cable IR <1 MΩ/km per IEEE 400 → plan cable replacement at next outage

---

#### FM-32 | Degrades + Radiation | Cal | B | ISO 2.0

> **Degradation**: UV radiation breaks C-C bonds in polymers causing chain scission, cross-linking, and photo-oxidation in the outer 100–300 μm; surface embrittlement admits moisture to accelerate bulk degradation. At OCP, Morocco UV index 9–11 in summer; outdoor conveyor belt covers at Khouribga, FRP piping/tank surfaces, and cable insulation suffer accelerated UV degradation.

- **Weibull**: β 2.0–3.5, η 20,000–80,000 h
- **Top P-conditions**: Surface chalking/fading/discoloration, surface cracking/crazing on UV-exposed surfaces, FRP roughening with fiber exposure
- **Equipment**: Electrical installations (EI), piping (PI), storage tanks (TA), conveyors (CV), seals/gaskets (SG), structural steel (ST) — outdoor cable, FRP piping/tanks, conveyor covers
- **Primary CBM**: Visual inspection for chalking, cracking, discoloration | P-F 3–12 mo | ASTM D4214, ASTM D660
- **Strategy**: CB preferred (inspect coating on outdoor structure). FT: repaint 5–8 yr coastal, 7–10 yr inland; FRP gel coat every 5–8 yr per BS 4994. RTF: only cosmetic coatings on non-structural elements.
- **Key threshold**: FRP Barcol hardness drops >20% or fibers exposed → apply UV-resistant topcoat within 6 months

---

### DISTORTS (4 combinations: FM-33 to FM-36)

General character: Permanent geometry change from mechanical or operational stress. Mostly Operational. Patterns: E (impact/overload) and B/C (progressive). Primary CBM: visual/dimensional survey.

---

#### FM-33 | Distorts + Impact/shock loading | Op | E | ISO 1.4

> **Degradation**: Sudden high-energy impact generates stresses exceeding yield but below UTS, causing permanent plastic deformation (bent, dented, buckled) without fracture; altered geometry creates stress concentrations and misalignment. At OCP, falling rock impacts conveyor steelwork at transfer points, tramp metal distorts crusher guards, and mobile equipment contacts pipe supports.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Visible bending/denting/buckling, alignment deviation exceeding tolerance, increased vibration from distortion-induced unbalance
- **Equipment**: Conveyors (CV), crushers (CU), piping (PI), pumps (PU), storage tanks (TA), structural steel (ST) — conveyor stringers, transfer chutes, crusher guards, pipe supports
- **Primary CBM**: Visual inspection for dents, bends, deformation | P-F 1–4 wk | API 574, AS 4100
- **Strategy**: CB preferred (inspect structural alignment). FT: inspect impact protection (wear plates, deflectors) every 3–6 mo. RTF: only non-structural, non-safety cosmetic elements.
- **Key threshold**: Pipe dent >6% of diameter → fitness-for-service per API 579; shaft runout >50 μm → realign

---

#### FM-34 | Distorts + Mechanical overload | Op | E | ISO 1.4

> **Degradation**: Sustained or repeated loads exceeding yield cause permanent plastic deformation — bending, buckling, twist; once yielded, geometry change is self-reinforcing through stress redistribution. At OCP, conveyor stringers deflect during material surges, piping distorts from thermal expansion beyond design, and aging structural steel is overloaded from cumulative equipment additions.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Visible permanent deflection/bowing/twisting, buckling of thin-walled structures, bolt gap opening at flanges
- **Equipment**: Structural steel (ST), conveyors (CV), storage tanks (TA), piping (PI), cranes (CR), pumps (PU), pressure vessels (VE) — equipment support frames, phosphoric acid tanks, crane beams
- **Primary CBM**: Structural survey (deflection, plumb, level) | P-F 6–12 mo | AS 4100, AISC 360
- **Strategy**: CB preferred (survey structural deflection). FT: comprehensive structural survey every 5 yr; tank per API 653 (5–10 yr); crane runway annually per AS 1418. RTF: never for primary structural members or pressure boundaries.
- **Key threshold**: Beam deflection >L/200 or increasing under constant load → de-rate, plan reinforcement

---

#### FM-35 | Distorts + Off-center loading | Op | C | ISO 1.4

> **Degradation**: Asymmetric loads create eccentric stresses progressively deforming components toward the loaded side; eccentricity is self-reinforcing as geometry shift increases the moment arm. At OCP, SAG/ball mill charge asymmetry during startup creates massive eccentric trunnion loads, conveyor belt off-centering distorts idler frames, and differential silo draw-off creates asymmetric wall loads.

- **Weibull**: β 1.5–2.5, η 5,000–25,000 h
- **Top P-conditions**: Belt mistracking (consistently one side), differential bearing temperature (loaded side >10°C hotter), uneven wear on bearings/liners
- **Equipment**: Mills (ML), conveyors (CV), cranes (CR), storage tanks (TA), pumps (PU), structural steel (ST) — SAG/ball mills, belt conveyors at Khouribga, silos
- **Primary CBM**: Alignment and level survey | P-F 3–12 mo | API 686, AS 4100
- **Strategy**: CB preferred (check belt tracking). FT: precision level survey every 12 mo for critical rotating equipment; crane rail annually per AS 1418. RTF: never for rotating equipment foundations or structural frames.
- **Key threshold**: Foundation differential >5 mm between supports → re-shim and investigate; belt off-center >50 mm → adjust within 30 days

---

#### FM-36 | Distorts + Use | Op | B | ISO 1.4

> **Degradation**: Cumulative regular operational loads cause progressive geometry change through ratcheting, ambient-temperature creep, settling, and ovalization — even within-design loads cause plastic micro-strain over millions of cycles. At OCP, SAG/ball mill shells progressively ovalize under repeated charge, kiln riding rings wear and ovalize changing axis alignment, conveyor pulleys lose crown.

- **Weibull**: β 2.0–3.5, η 10,000–50,000 h
- **Top P-conditions**: Mill shell ovality increasing (>0.5% of diameter), kiln riding ring gap differential exceeding tolerance, progressive dimensional change vs as-built baseline
- **Equipment**: Mills (ML), rotary equipment (RO), conveyors (CV), pumps (PU), cranes (CR), valves (VA), heat exchangers (HE) — SAG/ball mill shells, rotary kilns/dryers, conveyor pulleys
- **Primary CBM**: Dimensional survey against baseline | P-F 6–24 mo | OEM specification, API 686
- **Strategy**: CB preferred (measure shell ovality on mill). FT: kiln alignment every 6–12 mo; mill ovality at every reline (18–36 mo); pump impeller every 5,000–15,000 h. RTF: only non-precision components where geometry change is cosmetic.
- **Key threshold**: Mill ovality >1.0% → engineer assessment, reduce load; impeller distortion >5% throat area → replace

---

### DRIFTS (5 combinations: FM-37 to FM-41)

General character: Progressive instrument calibration shift. Mostly Operational. Patterns: E (event-driven) and B/C (progressive). Primary CBM: calibration verification.

---

#### FM-37 | Drifts + Excessive temperature | Op | E | ISO 3.4

> **Degradation**: Temperature excursions outside rated range cause sensing elements to shift via thermal expansion, semiconductor junction voltage shift, and spring rate change; drift may be temporary or permanent. At OCP, pressure transmitters near kilns/dryers exceed 60°C (rated 55°C), pH electrodes in acid reach 80–110°C, and outdoor instruments at Khouribga face >45°C summer and <0°C winter.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Deviation from redundant reading >1% of span, calibration drift >0.5% since last verification, smart transmitter diagnostic flags
- **Equipment**: Instruments (ID), analyzers (AN), control valves (CV), safety devices (SD), flow meters (FM), level instruments (LI) — pressure transmitters, pH analyzers, PSVs on steam
- **Primary CBM**: Calibration verification | P-F 3–12 mo | ISA 67.04, IEC 61511
- **Strategy**: CB preferred (verify calibration). FT: SIS instruments 6–12 mo; harsh thermal environment 3–6 mo; pH in hot acid 1–3 mo. RTF: never for SIS/SIF or safety-critical instruments.
- **Key threshold**: Drift >1.0% of span → recalibrate immediately and install thermal barrier

---

#### FM-38 | Drifts + Impact/shock loading | Op | E | ISO 3.4

> **Degradation**: Sudden mechanical shock permanently displaces sensing elements, deforms bourdon tubes, shifts strain gauge bonding; even 10g shocks can shift precision transmitters 0.1–0.5% of span. At OCP, field instruments on vibrating screens/crushers/mills suffer cumulative shock, instruments on slurry lines experience water hammer, pressure gauges on mobile equipment endure terrain shocks.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Sudden step-change after known impact, calibration shift >0.5% between verifications, gauge needle not returning to zero
- **Equipment**: Instruments (ID), control valves (CV), safety devices (SD), analyzers (AN), flow meters (FM), weighing equipment (WE) — gauges on vibrating equipment, belt weighers, limit switches
- **Primary CBM**: Calibration verification | P-F 3–12 mo | ISA 67.04, IEC 61511
- **Strategy**: CB preferred (verify calibration after impact event). FT: instruments on vibrating equipment 3–6 mo; belt weighers 1–3 mo per OIML R50; install anti-vibration mounts. RTF: never for safety instruments or custody transfer.
- **Key threshold**: Drift >0.5% on safety instrument → recalibrate; recurrence → relocate or upgrade to shock-resistant model

---

#### FM-39 | Drifts + Stray current | Cal | C | ISO 3.4

> **Degradation**: Unwanted electrical currents through unintended paths introduce parasitic voltages via galvanic, capacitive, or inductive coupling; microamp-level stray currents cause significant errors on low-level signals (thermocouples 0–50 mV). At OCP, extensive VFD installations at Jorf Lasfar generate high common-mode noise, CP on underground piping couples into nearby instruments, and long cable runs parallel power cables.

- **Weibull**: β 1.5–2.5, η 5,000–20,000 h
- **Top P-conditions**: Reading varying with nearby equipment operation, difference between installed reading and portable calibrator, AC ripple on 4–20 mA loop >1% of span
- **Equipment**: Instruments (ID), analyzers (AN), control logic (CL), flow meters (FM), weighing equipment (WE), level instruments (LI) — thermocouples, pH analyzers, EM flow meters, belt weighers
- **Primary CBM**: Instrument signal quality analysis (noise, ripple) | P-F 3–6 mo | IEC 61326, NAMUR NE 21
- **Strategy**: CB preferred (measure signal quality). FT: earth resistance test every 12 mo (≤10Ω per IEEE 142); cable shield integrity every 12–24 mo. RTF: never for SIS, custody transfer, or environmental compliance.
- **Key threshold**: AC noise on 4–20 mA >1% of span (>0.16 mA p-p) → check shield continuity, verify single-point grounding

---

#### FM-40 | Drifts + Uneven loading | Op | C | ISO 3.4

> **Degradation**: Asymmetric or non-uniform mechanical loads progressively shift calibration of weighing instruments; differential stress/strain across sensing elements creates systematic bias from wear, settlement, or process variation. At OCP, belt weighers at Khouribga drift from off-center material, tank weighing drifts from differential thermal expansion, and valve positioners drift from uneven packing friction.

- **Weibull**: β 1.5–2.5, η 5,000–20,000 h
- **Top P-conditions**: Weighing instrument deviating from independent check, calibration shifting with loading position, load cell output imbalance >2%
- **Equipment**: Weighing equipment (WE), instruments (ID), control valves (CV), level instruments (LI), flow meters (FM), conveyor scales (WE) — belt weighers, tank weighing, truck scales, positioners
- **Primary CBM**: Calibration verification with known reference | P-F 3–6 mo | OIML R50/R60, ISA 67.04
- **Strategy**: CB preferred (verify belt weigher calibration). FT: custody belt weighers monthly; process weighers 3–6 mo; valve stroke test 6–12 mo. RTF: never for custody transfer or safety instruments.
- **Key threshold**: Belt weigher accuracy >±0.5% → recalibrate; load cells unbalanced >5% → re-shim, inspect for binding

---

#### FM-41 | Drifts + Use | Op | B | ISO 3.4

> **Degradation**: Normal use progressively shifts instrument output through elastic after-effect, electrode aging, spring relaxation, electronic drift, and linkage wear; drift rate is predictable and determines calibration intervals. At OCP, pH electrodes in phosphoric acid at Jorf Lasfar last 3–6 mo vs 12–24 mo in clean water, kiln thermocouples degrade from cycling, and safety valve springs relax.

- **Weibull**: β 1.5–3.0, η 5,000–30,000 h
- **Top P-conditions**: Progressive calibration drift trending (consistent direction), as-found data showing systematic shift, pH electrode response time >30 s to 95%
- **Equipment**: Instruments (ID), analyzers (AN), safety devices (SD), control valves (CV), flow meters (FM), level instruments (LI), weighing equipment (WE) — all process transmitters, pH analyzers, PSVs, belt weighers
- **Primary CBM**: Scheduled calibration verification | P-F 3–24 mo | ISA 67.04, IEC 61511, API 576
- **Strategy**: CB preferred (verify calibration of transmitter). FT: SIS 6–12 mo; acid transmitters 3–6 mo; pH in acid 1–3 mo; PSVs per API 576 3–5 yr; adjust intervals per as-found/as-left data. RTF: never for SIS/SIF, custody transfer, or environmental compliance.
- **Key threshold**: SIS drift >0.5% of span → recalibrate and shorten interval; pH slope <85% Nernst theoretical → replace electrode

---

### EXPIRES (1 combination: FM-42)

General character: Time-dependent intrinsic aging causing loss of function regardless of operating status. Calendar-based. Pattern B (strong wear-out). Primary CBM: capacity testing; primary strategy is Scheduled Discard.

---

#### FM-42 | Expires + Age | Cal | B | ISO 2.0

> **Degradation**: Intrinsic material aging causes loss of capability regardless of use — elastomer cross-link degradation, chemical decomposition, battery electrolyte aging, adhesive bond reduction — with sharp failure probability increase after rated life (β 3.0–6.0). At OCP, fire suppression agents, emergency breathing apparatus at Jorf Lasfar acid plants, UPS batteries protecting PLC/DCS, and electrochemical gas sensors all have regulatory shelf-life limits.

- **Weibull**: β 3.0–6.0, η per manufacturer rated life
- **Top P-conditions**: Approaching/exceeding manufacturer shelf life, battery capacity <80% per IEEE 450, fire suppression agent weight loss >5%
- **Equipment**: Valves/PSVs (VA), fire/gas detectors (FG), UPS (UP), fire suppression (NO), control logic (CL), instruments (ID), filters (FS) — PSVs on acid reactors, gas detectors, UPS batteries, sprinkler heads
- **Primary CBM**: Battery capacity testing (discharge test) | P-F 6–12 mo | IEEE 450, IEC 60896
- **Strategy**: CB limited. **FT — Scheduled Discard is primary**: gas sensors 2 yr, catalytic bead 3 yr, VRLA batteries 4 yr, sprinkler heads 50 yr per NFPA 25, PSV elastomers per API 576 (3–5 yr corrosive). RTF: NEVER for safety-critical expired components.
- **Key threshold**: Battery capacity <80% → replace within 60 days; <60% → replace immediately

---

### IMMOBILISED (2 combinations: FM-43 to FM-44)

General character: Binding/seizure from contamination or lubrication failure. Mixed basis. Patterns: C. Primary CBM: valve stroke testing, vibration/temperature monitoring.

---

#### FM-43 | Immobilised + Contamination | Cal | C | ISO 1.6

> **Degradation**: Foreign particles accumulate in clearance spaces between moving parts, progressively increasing friction until binding or seizure. At OCP, phosphate slurry penetrates valve stem seals at Khouribga/Benguerir beneficiation plants, and acid corrosion products restrict actuator pistons at Jorf Lasfar.

- **Weibull**: β 1.5–2.5, η 2,000–10,000 h
- **Top P-conditions**: Increased actuating force/torque trending, valve stroke time >25% above baseline, partial stroke test showing increased friction
- **Equipment**: Valves (VA), pumps (PU), compressors (CO), conveyors (CV), cranes (CR), actuators (CL) — slurry pump discharge valves, acid circuit control valves
- **Primary CBM**: Valve partial stroke testing (PST) | P-F 1–4 wk | IEC 61508, ISA 84
- **Strategy**: CB preferred (partial stroke test on control valve). FT: clean/inspect valve stem every 6–12 mo in slurry service. RTF: only manual valves in non-critical service.
- **Key threshold**: Stroke time >125% baseline → schedule cleaning within 30 days; fail to achieve full stroke → immediate corrective action

---

#### FM-44 | Immobilised + Lack of lubrication | Cal | C | ISO 1.6

> **Degradation**: Lubricant film depletes through evaporation, oxidation, or consumption until metal-to-metal contact creates friction, heat, and thermal expansion leading to seizure. At OCP, conveyor idler bearings at Khouribga in >45°C ambient accelerate grease loss; SAG/ball mill trunnion bearing seizure causes catastrophic damage.

- **Weibull**: β 2.0–3.5, η 3,000–15,000 h
- **Top P-conditions**: Elevated bearing temperature (ΔT >15°C above baseline), vibration at bearing defect frequencies (BPFO/BPFI/BSF), audible grinding/squealing
- **Equipment**: Pumps (PU), compressors (CO), motors (EM), conveyors (CV), cranes (CR), fans (FA) — SAG mill drives, belt conveyor idlers, slurry pump bearings
- **Primary CBM**: Vibration analysis (envelope/demodulation) | P-F 2–8 wk | ISO 10816-3, ISO 15243
- **Strategy**: CB preferred (vibration analysis on bearing). FT: relubricate per SKF formula — conveyor idlers 3–6 mo, mill motor bearings 1–3 mo. RTF: only sealed-for-life bearings.
- **Key threshold**: Vibration >7.1 mm/s RMS (ISO Zone D) → schedule immediate replacement; bearing temp >90°C → stop immediately

---

### LOOSES PRELOAD (3 combinations: FM-45 to FM-47)

General character: Bolted joint preload loss from creep, temperature, or vibration. Mixed basis. Patterns: B (creep/vibration), E (temperature). Primary CBM: bolt tension measurement, torque audit.

---

#### FM-45 | Looses preload + Creep | Cal | B | ISO 1.5

> **Degradation**: Materials in bolted assemblies undergo slow time-dependent plastic deformation under sustained stress, following logarithmic creep relaxation that reduces clamping force progressively. At OCP, PTFE-lined gaskets on phosphoric acid piping at Jorf Lasfar (80–110°C) and kiln shell flanges at Khouribga (300–900°C) are most affected.

- **Weibull**: β 2.0–3.5, η 20,000–60,000 h
- **Top P-conditions**: Bolt torque <80% of spec, visible gasket extrusion at flange edges, minor weeping/seepage at gasketed joints
- **Equipment**: Pressure vessels (VE), heat exchangers (HE), piping (PI), valves (VA), pumps (PU), rotary equipment (RO) — acid reactors, kiln flanges, steam piping
- **Primary CBM**: Ultrasonic bolt tension measurement | P-F 6–12 mo | ASTM E1685, EN 14399
- **Strategy**: CB preferred (measure bolt tension on flange). FT: re-torque every 12–24 mo for joints >200°C; PTFE gaskets every 6–12 mo. RTF: only low-consequence joints with secondary containment.
- **Key threshold**: Preload <70% → replace gasket (cannot reliably re-torque crept gasket); active leakage → repair within 7 days

---

#### FM-46 | Looses preload + Excessive temperature | Op | E | ISO 1.5

> **Degradation**: Temperature excursions beyond design cause simultaneous differential thermal expansion, bolt yield strength reduction, and gasket degradation — damage can be immediate and severe from a single event. At OCP, kiln/dryer upsets at Khouribga cause flame impingement >500°C on casing flanges; PTFE decomposes above 260°C.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: DCS high-high temperature alarm, bolt head temper colors (straw 200°C, blue 300°C, black >400°C), gasket charring/embrittlement
- **Equipment**: Rotary equipment (RO), pressure vessels (VE), heat exchangers (HE), piping (PI), valves (VA), boilers (BO) — rotary kilns, waste heat boilers, hot gas ducts
- **Primary CBM**: Post-event bolt torque and condition inspection | P-F event-based | ASME PCC-1
- **Strategy**: CB preferred (inspect bolts after temperature event). FT: verify thermal protection annually; inspect hot flange insulation every 12 mo. RTF: never for joints with hazardous fluids.
- **Key threshold**: Bolt temper colors >350°C → replace all bolts; temperature >120% gasket max → replace gasket regardless of visible condition

---

#### FM-47 | Looses preload + Vibration | Op | B | ISO 1.5

> **Degradation**: Cyclic transverse forces cause incremental nut rotation via Junker mechanism (0.001–0.01°/cycle), with loosening rate accelerating as preload decreases. At OCP, vibrating screens at Khouribga (10–25 mm/s RMS), SAG/ball mill foundations, and crushers generate severe vibration; phosphate dust acts as dry lubricant reducing bolt head friction.

- **Weibull**: β 1.5–3.0, η 5,000–30,000 h
- **Top P-conditions**: Witness mark rotation on bolt/nut, bolt torque <70% of spec, audible rattling during operation
- **Equipment**: Vibrating equipment (VS), crushers (CU), mills (ML), conveyors (CV), pumps (PU), fans (FA), structural steel (ST) — vibrating screens, crusher liners, mill foundations
- **Primary CBM**: Torque audit (calibrated wrench) | P-F 3–6 mo | ASME PCC-1, VDI 2230
- **Strategy**: CB preferred (check bolt torque on vibrating equipment). FT: re-torque screens every 500–1,000 h; crusher liners every 500 h; mill foundations every 6 mo. RTF: never for structural, rotating equipment, or safety guard connections.
- **Key threshold**: Preload <60% or nut rotated >30° → replace bolt/nut set and upgrade locking method (nord-lock, thread-lock)

---

### OPEN-CIRCUIT (1 combination: FM-48)

General character: Electrical discontinuity from overload-induced fusing. Operational. Pattern E. Primary CBM: thermography.

---

#### FM-48 | Open-circuit + Electrical overload | Op | E | ISO 4.2

> **Degradation**: Current exceeding conductor thermal capacity causes I²R heating, with localized hot spots at high-resistance connections fusing first; self-accelerating as temperature increases resistance. At OCP, SAG/ball mill DOL starts draw 600–800% FLA stressing terminations; harmonic-rich VFD environments cause additional heating.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Thermography ΔT >10°C at connections, increasing contact resistance (>50% above initial), discoloration/heat marks at connections
- **Equipment**: Motors (EM), switchgear (SG), power cables (PC), VFDs (FC), UPS (UP), generators (EG) — mill drive terminals, MV/LV switchgear, MCC panels
- **Primary CBM**: Thermography of electrical connections | P-F 1–3 mo | NETA MTS, ISO 18434-1
- **Strategy**: CB preferred (thermography on electrical connections). FT: re-torque motor terminals every 12 mo first 2 yr, then 3–5 yr. RTF: only designed protective elements (fuses, thermal overloads).
- **Key threshold**: ΔT >40°C or absolute >105°C (NETA Priority 1) → de-energize and repair immediately (imminent failure/fire)

---

### OVERHEATS/MELTS (6 combinations: FM-49 to FM-54)

General character: Excessive temperature from contamination, electrical, mechanical, or frictional causes. Mostly Operational. Mixed patterns. Primary CBM: temperature monitoring, thermography, vibration.

---

#### FM-49 | Overheats/melts + Contamination | Cal | C | ISO 2.7

> **Degradation**: Foreign material on heat dissipation surfaces creates thermal insulation — 1 mm calcium carbonate scale equals 30 mm steel in thermal resistance, causing progressive temperature rise. At OCP, pervasive phosphate dust coats motor fins and VFD heat sinks at Khouribga; gypsum scale and marine biofouling degrade cooling at Jorf Lasfar/Safi.

- **Weibull**: β 1.5–2.5, η 3,000–15,000 h
- **Top P-conditions**: Operating temperature >10°C above clean baseline, heat exchanger approach temperature increasing >5°C, visible contamination on cooling surfaces
- **Equipment**: Motors (EM), VFDs (FC), transformers (PT), heat exchangers (HE), bearings (BE), gearboxes (GB), control cabinets (CL) — SAG mill drives, VFD panels, substation transformers
- **Primary CBM**: Operating temperature trending (RTD/thermocouple/thermography) | P-F continuous–monthly | ISO 10816, IEC 60034-11
- **Strategy**: CB preferred (monitor winding temperature). FT: clean motor fins 1–3 mo in dust; VFD filters 1–3 mo; HX chemical CIP 3–6 mo. RTF: never for critical motors, VFDs, or transformers.
- **Key threshold**: Temperature approaching OEM max at rated load → clean immediately and reduce load until cleaned

---

#### FM-50 | Overheats/melts + Electrical overload | Op | E | ISO 2.7

> **Degradation**: Current exceeding continuous thermal rating generates I²R heating beyond material limits; connection overheating is self-accelerating as temperature increases resistance in a thermal runaway loop. At OCP, high-inertia SAG mill starts (600% FLA for 15–30 s), loose connections from vibration, and VFD harmonic heating are primary drivers.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Connection thermography ΔT >10°C per NETA, winding temperature above thermal class, cable surface >70°C for PVC
- **Equipment**: Motors (EM), transformers (PT), switchgear (SG), cables (PC), VFDs (FC), generators (EG) — mill drives, MCC panels, VFDs
- **Primary CBM**: Thermography of panels and connections | P-F 1–3 mo | NETA MTS, ISO 18434-1
- **Strategy**: CB preferred (thermography on electrical panel). FT: re-torque MCC every 3–5 yr, annually near mills/crushers. RTF: only for fuses (designed protection function).
- **Key threshold**: ΔT >40°C or absolute >105°C (NETA Priority 1) → de-energize and repair immediately

---

#### FM-51 | Overheats/melts + Lack of lubrication | Op | B | ISO 2.7

> **Degradation**: Insufficient lubricant film causes metal-to-metal contact increasing friction 60-fold while eliminating heat transport; temperature escalates from 60–80°C to seizure >250°C within minutes once film collapses. At OCP, SAG/ball mill trunnion bearings are highest-consequence; conveyor idlers in dust and slurry pump bearings with seal leakage are most frequent.

- **Weibull**: β 2.0–4.0 (depletion) or 0.8–1.2 (sudden loss), η 3,000–20,000 h
- **Top P-conditions**: Bearing temperature rising >10°C above trend, high-frequency vibration (>5 kHz envelope) indicating metal contact, oil level below minimum
- **Equipment**: Pumps (PU), mills (ML), crushers (CU), conveyors (CV), compressors (CO), gearboxes (GB), fans (FA), motors (EM) — SAG mill trunnion bearings, slurry pump bearings, crusher main shaft
- **Primary CBM**: Bearing temperature monitoring | P-F continuous–weekly | ISO 10816, ISO 281
- **Strategy**: CB preferred (monitor bearing temp on mill trunnion). FT: relubricate per SKF — pump bearings monthly–quarterly, oil changes 3,000–8,000 h mineral / 8,000–15,000 h synthetic. RTF: only sealed-for-life on non-critical equipment.
- **Key threshold**: Temp >20°C above baseline or rate >2°C/hr → shut down immediately; trip at 95°C rolling, 85°C babbitt

---

#### FM-52 | Overheats/melts + Mechanical overload | Op | E | ISO 2.7

> **Degradation**: Excessive loads increase contact pressures beyond lubricant film capacity (λ <1.0), generating metal-to-metal heat despite adequate lubrication. At OCP, crushers processing hard rock or tramp metal, slurry pumps with high-density feed, and gearboxes during surge loading are primary occurrences.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Bearing temperature rising while lubricant is normal, simultaneous elevated motor current/torque, gearbox oil temperature exceeding OEM limit
- **Equipment**: Crushers (CU), pumps (PU), mills (ML), gearboxes (GB), conveyors (CV), compressors (CO), fans (FA) — jaw/cone crushers, slurry pumps, mill gearboxes
- **Primary CBM**: Bearing temperature + load monitoring | P-F continuous–weekly | ISO 10816, OEM spec
- **Strategy**: CB preferred (monitor bearing temp and load on crusher). FT: verify overload protection annually; test torque limiter at each shutdown. RTF: never for large rotating equipment.
- **Key threshold**: Bearing temp rising with load increase → reduce load to rated within 1 hr; repeated overloads → install torque limiters

---

#### FM-53 | Overheats/melts + Relative movement | Op | B | ISO 2.7

> **Degradation**: Unintended sliding, fretting, or oscillating contact generates localized frictional heat (Q = μ·F·v) with flash temperatures hundreds of degrees above bulk, causing melting and metallurgical damage. At OCP, slurry pump seal faces with shaft deflection, mill drive couplings with foundation settlement, and conveyor brake discs during sustained downhill braking from Khouribga.

- **Weibull**: β 1.5–3.0, η 5,000–25,000 h
- **Top P-conditions**: Hot spots at seal/coupling locations (thermography), fretting corrosion (reddish-brown oxide) at interference fits, increasing mechanical seal leakage
- **Equipment**: Pumps (PU), mills (ML), conveyors (CV), compressors (CO), fans (FA), gearboxes (GB), motors (EM) — slurry pump seals, mill trunnion labyrinth seals, conveyor brakes
- **Primary CBM**: Seal face temperature monitoring | P-F continuous | API 682
- **Strategy**: CB preferred (monitor seal temperature). FT: laser alignment every 12 mo per API 686; mechanical seal replacement per OEM life (8,000–20,000 h slurry). RTF: never for seals on hazardous fluids or brakes.
- **Key threshold**: Alignment >0.05 mm offset or angularity → realign per API 686; seal temp trend >5°C/month → investigate

---

#### FM-54 | Overheats/melts + Rubbing | Op | E | ISO 2.7

> **Degradation**: Abnormal contact between rotating and stationary parts generates >600°C locally; thermal expansion further reduces clearance creating a self-reinforcing cycle escalating to catastrophic damage within minutes. At OCP, slurry pump wear rings with solids buildup, kiln seals with thermal distortion, fan impellers contacting casings, and motor rotors contacting stators.

- **Weibull**: β 0.8–1.5, η highly variable
- **Top P-conditions**: Sub-synchronous vibration (½×) or truncated shaft orbit indicating rub, temperature spike at rubbing location, audible metallic scraping
- **Equipment**: Pumps (PU), fans (FA), compressors (CO), motors (EM), mills (ML), kilns (RO), conveyors (CV) — slurry pump wear rings, fan impeller tips, kiln shell seals
- **Primary CBM**: Vibration monitoring (rub detection — ½× sub-synchronous, orbit analysis) | P-F continuous–weekly | ISO 7919, API 670
- **Strategy**: CB preferred (monitor vibration for rub). FT: measure wear ring clearance at every overhaul; replace at 2× design clearance per API 610. RTF: never for any rotating machinery.
- **Key threshold**: Full rub (continuous contact, temp spike, metallic noise) → IMMEDIATE shutdown; partial rub (½× >50% of 1×) → shutdown within 7 days

---

### SEVERS (3 combinations: FM-55 to FM-57)

General character: Through-wall material removal by abrasion, impact, or overload. Operational. Patterns: B (abrasion), E (impact/overload). Primary CBM: UT thickness, belt rip detection, wire rope inspection.

---

#### FM-55 | Severs + Abrasion | Op | B | ISO 2.3

> **Degradation**: Hard particles progressively remove wall material through cutting and plowing per Archard's equation until through-wall penetration; thinning accelerates as reduced thickness increases stress and turbulence. At OCP, quartz content (5–15% SiO₂, Mohs 7) in phosphate ore drives aggressive erosion at slurry pipeline elbows, pump cut-waters, and hydrocyclone apexes.

- **Weibull**: β 2.0–4.0, η 2,000–15,000 h
- **Top P-conditions**: Wall thickness trending below API 574 minimum, rate-of-loss >0.5 mm/yr, visible wear grooves on internal surfaces
- **Equipment**: Piping (PI), pumps (PU), valves (VA), conveyors (CV), filters (FS), hydrocyclones (HC) — slurry pipeline elbows, slurry pump casings, pinch valves, belt filter cloth
- **Primary CBM**: UT thickness measurement | P-F 1–6 mo | API 574, ASME B31.3
- **Strategy**: CB preferred (measure wall thickness on slurry elbow). FT: replace liners — pump casings 3,000–8,000 h, chute liners 6–12 mo, cyclone apex 1,000–4,000 h. RTF: never for pressurized slurry piping.
- **Key threshold**: Wall at or below minimum design → remove from service immediately per API 574 (sudden rupture risk)

---

#### FM-56 | Severs + Impact/shock loading | Op | E | ISO 2.5

> **Degradation**: Sudden high-energy impacts exceed UTS or fracture toughness causing immediate penetration or puncture; repeated sub-critical impacts create cumulative denting and micro-crack initiation. At OCP, large rock fragments (>300 mm) on conveyor belts at Khouribga is #1 cause of belt replacement; tramp metal in crushers and oversize in pumps are also frequent.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Visible dents/gouges, belt rip detection system activation, surface cracking around impact sites on brittle materials
- **Equipment**: Conveyors (CV), crushers (CU), pumps (PU), piping (PI), storage tanks (TA), filters (FS), screens (SC) — conveyor loading zones, crusher liners, slurry pump casings
- **Primary CBM**: Belt rip detection (electromagnetic loop/sensor cord) | P-F continuous | DIN 22109, ISO 15236
- **Strategy**: CB preferred (inspect belt at loading zone). FT: replace impact idlers 12–18 mo; crusher blow bars at 20–40% weight loss; screen panels 2,000–6,000 h. RTF: only designed sacrificial elements.
- **Key threshold**: Belt carcass damage → splice within 2 weeks or replace within 30 days; pump casing punctured → immediate shutdown

---

#### FM-57 | Severs + Mechanical overload | Op | E | ISO 2.5

> **Degradation**: Applied forces exceed UTS causing tear, rupture, or separation; most dangerous when prior damage (corrosion, fatigue) erodes safety factors so normal loads exceed reduced section's capacity. At OCP, wire rope severance on cranes at Khouribga open pit, conveyor belt tears from jams, and hydraulic hose bursts on mobile equipment are primary occurrences.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Wire rope broken wires >6 per lay length per ISO 4309, visible plastic deformation at stress concentrations, hose surface bulging/reinforcement exposure
- **Equipment**: Cranes (CR), conveyors (CV), piping (PI), pumps (PU), pressure vessels (VE), structural steel (ST), lifting equipment (LE) — overhead cranes, belt carcass, hydraulic hoses
- **Primary CBM**: Wire rope inspection (visual + MRT) | P-F 1–3 mo | ISO 4309, AS 2759
- **Strategy**: CB preferred (inspect wire rope on crane). FT: replace hoses every 6–8 yr per SAE J1273; wire ropes max 5–8 yr per ISO 4309. RTF: never for lifting equipment or pressure containment; only for shear pins, V-belts.
- **Key threshold**: Rope diameter reduction >10% → discard per ISO 4309; hose reinforcement exposed → replace immediately (burst risk)

---

### SHORT-CIRCUITS (2 combinations: FM-58 to FM-59)

General character: Unintended current path from insulation failure or contamination. Calendar-based. Patterns: B (insulation aging), C (contamination). Primary CBM: insulation resistance, surface cleanliness.

---

#### FM-58 | Short-circuits + Breakdown in insulation | Cal | B | ISO 4.1

> **Degradation**: Insulation dielectric strength degrades following Arrhenius thermal aging (every 10°C above class halves life), with micro-voids enabling partial discharge that self-accelerates until arc fault at 25–40 kA prospective currents. At OCP, phosphate dust creates conductive deposits, coastal humidity (>85% RH) promotes moisture ingress, and VFD dV/dt imposes 2–3× peak voltage on motor insulation.

- **Weibull**: β 2.5–4.0, η 12,000–30,000 h
- **Top P-conditions**: Declining IR (>10%/yr per IEEE 43), PD >100 pC per IEC 60270, tan delta increasing >0.05 or >2× baseline
- **Equipment**: Motors (EM), transformers (PT), switchgear (SG), cables (PC), generators (EG), VFDs (FC) — SAG/ball mill HV drives, substation transformers, MV XLPE cables
- **Primary CBM**: Insulation resistance testing (megger) | P-F 6–12 mo | IEEE 43, IEC 60085
- **Strategy**: CB preferred (measure IR on motor winding). FT: replace cable terminations per insulation class life (Class F: 20 yr, derate 30–40% at coastal sites). RTF: only redundant non-critical circuits with adequate protection.
- **Key threshold**: IR <50 MΩ or PI <1.5 → schedule rewinding within 30 days; IR <1 MΩ/kV → do NOT energize

---

#### FM-59 | Short-circuits + Contamination | Cal | C | ISO 4.1

> **Degradation**: Conductive or hygroscopic contaminants on insulation surfaces absorb moisture, dropping surface resistance from >100 MΩ to <1 kΩ, initiating tracking arcs that carbonize insulation until flashover at >5,000°C. At OCP, phosphate dust at Khouribga, acid mist and gypsum at Jorf Lasfar/Safi, combined with >85% coastal humidity cause MV switchgear incidents peaking October–March.

- **Weibull**: β 1.5–2.5, η 3,000–15,000 h
- **Top P-conditions**: Decreasing surface IR (<100 MΩ at 500V DC), visible conductive deposits on bus bars/insulators, partial discharge activity (TEV/ultrasonic)
- **Equipment**: Switchgear (SG), motors (EM), control logic (CL), transformers (PT), VFDs (FC), junction boxes (JB) — MV switchgear, MCC panels, PLC/DCS cabinets
- **Primary CBM**: Surface insulation resistance measurement | P-F 3–6 mo | IEC 62631-3, IEEE 43
- **Strategy**: CB preferred (inspect switchgear cleanliness). FT: clean insulation surfaces every 3–6 mo at Khouribga (heavy dust), 6–12 mo at Jorf Lasfar (chemical). RTF: only individually fused low-energy control circuits.
- **Key threshold**: Surface IR <100 MΩ at 500V DC → schedule cleaning within 30 days; active tracking/PD → de-energize and clean immediately

---

### THERMALLY OVERLOADS (2 combinations: FM-60 to FM-61)

General character: Motor/conductor thermal damage from excess current. Operational. Pattern E. Primary CBM: motor current monitoring, phase balance.

---

#### FM-60 | Thermally overloads + Mechanical overload | Op | E | ISO 2.7

> **Degradation**: Mechanical loads >design force motors to draw excess current, generating I²R heating that degrades insulation per Arrhenius; a motor at 120% load generates ~44% more heat. At OCP, SAG/ball mill motors overload during hard rock feed, crusher motors from tramp material, slurry pumps from density >1.6 SG, and conveyors from surge loading.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Motor current trending >100% FLA, winding temperature exceeding thermal class (RTD), repeated overload trips (>2/month)
- **Equipment**: Motors (EM), pumps (PU), compressors (CO), conveyors (CV), crushers (CU), fans (FA) — SAG/ball mill drives, crusher drives, slurry pump drives
- **Primary CBM**: Motor current monitoring | P-F continuous–weekly | NEMA MG-1, IEC 60034-1
- **Strategy**: CB preferred (monitor motor current). FT: test thermal protection annually per NETA MTS. RTF: only small (<5 kW) non-critical individually protected motors.
- **Key threshold**: Current 110–125% FLA → reduce load immediately; do NOT increase relay setting on repeated trips — investigate root cause

---

#### FM-61 | Thermally overloads + Overcurrent | Op | E | ISO 2.7

> **Degradation**: Electrical overcurrent from phase imbalance, single-phasing, voltage depression, or harmonic distortion; negative-sequence current heats rotor bars at ~6× the rate of positive-sequence. At OCP, MV overhead lines at Khouribga cause phase loss, VFD-driven pumps produce 25–40% THD-I, and legacy undersized cables at pre-1990 sites exceed ampacity.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Phase current imbalance >5%, voltage imbalance >2% at PCC, cable/neutral temperature elevated (thermography)
- **Equipment**: Motors (EM), transformers (PT), cables (PC), switchgear (SG), VFDs (FC), capacitor banks (CB), UPS (UP) — mill drives, VFD-fed pumps, distribution transformers
- **Primary CBM**: Phase current and voltage balance monitoring | P-F continuous–weekly | NEMA MG-1, IEC 60034-26
- **Strategy**: CB preferred (measure phase balance). FT: verify relay settings every 3 yr per NETA MTS; power quality survey annually per IEEE 519. RTF: only small individually protected motors.
- **Key threshold**: Voltage imbalance >3% or single phase → trip immediately (rotor destroyed in 2–10 min); THD-I >15% → install output reactor/sine-wave filter

---

### WASHES OFF (2 combinations: FM-62 to FM-63)

General character: Progressive removal of protective coatings/layers by fluid or use. Mixed basis. Patterns: C (velocity-driven), B (use-driven). Primary CBM: UT thickness, coating DFT measurement.

---

#### FM-62 | Washes off + Excessive fluid velocity | Op | C | ISO 2.3

> **Degradation**: Fluid kinetic energy exceeding coating adhesion progressively removes protective linings via hydrodynamic shear and particle-assisted erosion; wall shear scales with velocity² so doubling velocity quadruples erosive force. At OCP, rubber-lined slurry pipes at Khouribga lose linings at elbows at 2–5 m/s, pump volute linings erode at the tongue, and PTFE linings in acid piping at Jorf Lasfar fail from gypsum-laden flow.

- **Weibull**: β 1.5–3.0, η 5,000–20,000 h
- **Top P-conditions**: UT wall thickness loss >10% from baseline, visible lining bare spots during internal inspection, downstream coating particles in fluid
- **Equipment**: Piping (PI), pumps (PU), valves (VA), heat exchangers (HE), filters (FS), pressure vessels (VE) — rubber-lined slurry pipelines, PTFE-lined acid piping, slurry pump volutes
- **Primary CBM**: UT thickness at high-velocity points | P-F 1–6 mo | ASME B31.3, API 570/574
- **Strategy**: CB preferred (measure wall thickness on elbow). FT: replace rubber lining — elbows 12–18 mo, straight 24–36 mo, pump volutes 6–12 mo. RTF: only non-pressure atmospheric components.
- **Key threshold**: Wall <120% design minimum → schedule replacement within 30 days; at or below minimum → remove immediately per API 574

---

#### FM-63 | Washes off + Use | Op | B | ISO 2.3

> **Degradation**: Normal operational exposure progressively depletes protective coatings at predictable rates through mild fluid abrasion, chemical dissolution, and weathering; depletion scales linearly with time or throughput. At OCP, marine atmosphere at Jorf Lasfar/Safi consumes paint 30–40% faster than inland; rubber linings, anti-corrosion coatings, and chrome pump shaft sleeves thin with cumulative hours.

- **Weibull**: β 2.0–4.0, η 5,000–30,000 h
- **Top P-conditions**: Coating DFT <70% of original, visual chalking/blistering/rust bleeding (ASTM D610/D714), corrosion rate increase on protected surfaces
- **Equipment**: Piping (PI), storage tanks (TA), heat exchangers (HE), pressure vessels (VE), pumps (PU), conveyors (CV), cranes (CR) — structural steel, cooling water piping, pump shaft sleeves
- **Primary CBM**: Coating thickness measurement (DFT gauge) | P-F 3–12 mo | SSPC-PA 2, ISO 19840
- **Strategy**: CB preferred for high-value coatings. FT: scheduled restoration — repaint marine 5–7 yr, inland 7–10 yr; rubber linings 3–5 yr in slurry. RTF: only aesthetic coatings on non-structural indoor equipment.
- **Key threshold**: DFT <50% minimum or rust Ri 4 (>8%) → full restoration within 30 days; base metal exposed >10% → immediate spot-prime

---

### WEARS (9 combinations: FM-64 to FM-72)

General character: Progressive material removal from mechanical contact, fluid erosion, or lubrication failure. All Operational. Patterns: B (progressive), E (event-driven), C (contamination). Primary CBM: oil analysis, UT thickness, vibration, dimensional measurement.

---

#### FM-64 | Wears + Breakdown of lubrication | Op | B | ISO 2.4

> **Degradation**: Lubricant properties degrade through oxidation, thermal cracking, additive depletion, and water contamination until specific film thickness drops below 1.0, transitioning from mild oxidative wear (~1 μm/1000 h) to severe adhesive wear (~10–100 μm/1000 h). At OCP, high gearbox temps (70–90°C), phosphate dust ingress, and extended intervals on hard-to-stop equipment accelerate breakdown.

- **Weibull**: β 2.0–3.5, η 5,000–25,000 h
- **Top P-conditions**: Oil TAN >2.0 mg KOH/g, viscosity change >20%, wear metals (Fe, Cu, Sn) increasing
- **Equipment**: Gearboxes (GB), pumps (PU), compressors (CO), motors (EM), conveyors (CV), crushers (CU), engines (EN) — mill gearboxes, crusher gearboxes, large motor bearings
- **Primary CBM**: Oil analysis (oxidation, viscosity, TAN, wear metals) | P-F 1–3 mo | ASTM D974/D445/E2412, ISO 4406
- **Strategy**: CB preferred (analyze lubricant on gearbox). FT: oil change — mineral 4,000–8,000 h, synthetic 8,000–16,000 h; reduce 30% if >80°C. RTF: only sealed-for-life non-critical small bearings.
- **Key threshold**: TAN >4.0 mg KOH/g or wear metals step-change → change oil immediately AND investigate wear source

---

#### FM-65 | Wears + Entrained air (cavitation) | Op | E | ISO 2.4

> **Degradation**: Air/vapor bubbles implode near surfaces generating micro-jets at >1 GPa and >5,000°C, progressively removing material at 0.1–10 mm/yr with characteristic spongy pitting at impeller tips, vortex cores, and downstream of restrictions. At OCP, slurry pump impellers at Khouribga cavitate with marginal NPSH; control valves at Jorf Lasfar flash in hot acid; cyclone feed pumps entrain air.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Distinctive crackling cavitation noise, pump head/efficiency decreasing, broadband HF vibration (>5 kHz)
- **Equipment**: Pumps (PU), valves (VA), piping (PI), hydraulic systems (HY), hydrocyclones (HC) — slurry pumps, cooling water pumps, control valves, classification cyclones
- **Primary CBM**: Vibration monitoring (broadband HF cavitation) | P-F 1–4 wk | ISO 10816, ISO 13709
- **Strategy**: CB preferred (monitor NPSH and vibration on pump). FT: inspect impeller at overhaul — cast iron 2,000–5,000 h, high-chrome 5,000–12,000 h, duplex 10,000–25,000 h. RTF: only non-critical small pumps.
- **Key threshold**: NPSHa < NPSHr × 1.3 → correct suction deficiency immediately; cavitation depth >2 mm → replace and upgrade material

---

#### FM-66 | Wears + Excessive fluid velocity | Op | B | ISO 2.4

> **Degradation**: Suspended particles at high velocity impact surfaces causing erosion following power-law (rate ∝ velocity²·⁰⁻⁴·⁰); doubling velocity increases erosion 4–16×. At OCP, slurry pipeline elbows on Khouribga–Jorf line erode at up to 4 m/s, pump cut-water sees 2–3× average velocity, hydrocyclone apexes experience maximum vortex velocity, and reactor jet nozzles suffer concentrated erosion.

- **Weibull**: β 2.0–4.0, η 3,000–20,000 h
- **Top P-conditions**: UT wall thinning at elbows/tees, erosion rate above design allowance, characteristic horseshoe/cat-eye patterns
- **Equipment**: Piping (PI), pumps (PU), valves (VA), hydrocyclones (HC), heat exchangers (HE), nozzles (NO) — Khouribga-Jorf slurry pipeline, slurry pump impellers, classification cyclones
- **Primary CBM**: UT wall thickness at erosion-prone locations | P-F 1–6 mo | API 574, ASME B31.3
- **Strategy**: CB preferred (measure wall thickness on pipeline elbow). FT: replace pump impeller 3,000–10,000 h; elbows 12–36 mo; cyclone apex 1,000–5,000 h. RTF: only non-pressurized gravity chute liners.
- **Key threshold**: Wall 100–120% of minimum → plan replacement within 30 days; at/below minimum → remove immediately

---

#### FM-67 | Wears + Impact/shock loading | Op | B | ISO 2.4

> **Degradation**: Repeated high-energy impacts cause progressive removal through surface fatigue, spalling, and plastic deformation; austenitic Mn steel work-hardens (200→500 HB) but material is still consumed. At OCP, crusher liners at 5–15 m/s, vibrating screen panels at Khouribga, mill liners from cascading charge, and conveyor loading zones from falling material.

- **Weibull**: β 1.5–3.0, η 3,000–15,000 h
- **Top P-conditions**: Progressive thickness reduction at impact zones, crusher liner profile worn beyond OEM minimum, screen apertures worn >110% nominal
- **Equipment**: Crushers (CU), mills (ML), screens (SC), conveyors (CV), feeders (FE), chutes (PI) — jaw/cone/impact crushers, SAG/ball mills, vibrating screens, conveyor loading zones
- **Primary CBM**: Liner thickness/profile measurement (template, UT) | P-F monthly–quarterly | OEM specification
- **Strategy**: CB preferred (measure liner thickness on crusher). FT: jaw plates 500–2,000 h, cone mantle 1,500–4,000 h, blow bars 200–800 h, mill liners 6,000–18,000 h. RTF: acceptable for sacrificial components (chute liners, screen panels, impact idler rings).
- **Key threshold**: Crusher liner at/below OEM minimum → replace within 7 days (risk of frame damage)

---

#### FM-68 | Wears + Low pressure | Op | E | ISO 2.4

> **Degradation**: Insufficient pressure at critical locations allows cavitation, flashing, or loss of hydrodynamic bearing film, all causing accelerated material removal. At OCP, slurry pump suction in deep Khouribga sumps with SG 1.3–1.6 approaches cavitation limits, acid control valves at 80–110°C flash near vapor pressure, and mill lube oil loses film from filter blockage.

- **Weibull**: β 0.8–1.2, η highly variable
- **Top P-conditions**: Suction pressure below design minimum (approaching NPSHr), cavitation noise at pump, oil supply pressure below OEM minimum at bearing
- **Equipment**: Pumps (PU), valves (VA), bearings (BE), compressors (CO), piping (PI), hydraulic systems (HY) — deep sump slurry pumps, high-ΔP control valves, mill trunnion bearings
- **Primary CBM**: Suction pressure monitoring | P-F continuous | ISO 13709, HI 9.6.1
- **Strategy**: CB preferred (monitor suction pressure). FT: clean suction strainer every 3 mo in slurry; NPSH verification at every process change. RTF: only non-critical small pumps.
- **Key threshold**: NPSHa < NPSHr × 1.3 → correct immediately; bearing oil below OEM minimum → trip before damage

---

#### FM-69 | Wears + Lubricant contamination (particles) | Cal | C | ISO 2.4

> **Degradation**: Hard particles (1–25 μm) circulating in lubricant bridge the oil film causing three-body abrasive wear; process is autocatalytic as wear debris generates secondary particles. At OCP, phosphate dust ingresses through seals, slurry leaks through failed mechanical seals, and improper oil handling introduces contamination — a bearing at ISO 21/19/16 has only 20% of life at 15/13/10.

- **Weibull**: β 1.5–2.5, η 5,000–30,000 h
- **Top P-conditions**: ISO 4406 count exceeding target by ≥2 codes, wear metals trending upward, ferrography showing cutting wear (long ribbon particles)
- **Equipment**: Gearboxes (GB), pumps (PU), hydraulic systems (HY), compressors (CO), motors (EM), engines (EN), conveyors (CV) — mill gearboxes, hydraulic servo valves, mobile equipment
- **Primary CBM**: Oil particle count (ISO 4406) | P-F 1–3 mo | ISO 4406/4407
- **Strategy**: CB preferred (analyze particle count on gearbox oil). FT: replace filters per ΔP or OEM (1,000–3,000 h); desiccant breathers every 3–6 mo in dusty OCP. RTF: never for servo valves or precision gears.
- **Key threshold**: Count exceeding target by >4 ISO codes → flush, replace oil, inspect seals, install kidney-loop filtration

---

#### FM-70 | Wears + Mechanical overload | Op | E | ISO 2.4

> **Degradation**: Loads exceeding design squeeze lubricant film thinner (thickness ∝ load⁻⁰·⁷³ per EHL), causing asperity contact and transition from mild to severe wear with as little as 25% overload. At OCP, crusher liners wear faster in harder rock zones (WI 10–18 kWh/t), pump wear rings open rapidly at densities above design, and gearbox teeth pit above rated torque.

- **Weibull**: β 0.8–1.5, η highly variable
- **Top P-conditions**: Wear rate increasing above trend, operating load sustained above design, oil analysis wear metals correlated with load events
- **Equipment**: Crushers (CU), pumps (PU), gearboxes (GB), mills (ML), conveyors (CV), compressors (CO), valves (VA) — crusher liners, pump wear rings, mill gearboxes
- **Primary CBM**: Load monitoring (power, current, pressure) | P-F continuous | Equipment design spec
- **Strategy**: CB preferred (monitor operating load). FT: verify overload protection annually; torque limiter test at each shutdown. RTF: only sacrificial parts (shear pins, screen panels).
- **Key threshold**: Load consistently >100% design → investigate and reduce; wear rate >150% historical → adjust maintenance interval

---

#### FM-71 | Wears + Metal to metal contact | Op | B | ISO 2.4

> **Degradation**: Direct metallic surface contact without lubricant film causes micro-welding at asperity junctions; continued motion fractures welds, transferring material per Archard's equation, progressing through running-in, steady-state, and severe wear. At OCP, pump shaft sleeves at packing/seal zones, wire ropes on sheaves, chain pins on bushings, valve stems at packing contact.

- **Weibull**: β 2.0–3.5, η 5,000–30,000 h
- **Top P-conditions**: Increasing shaft sleeve diameter at seal zone (micrometer), wire rope flattened strands and sheave groove wear, chain elongation >2%
- **Equipment**: Pumps (PU), valves (VA), cranes (CR), conveyors (CV), brakes (BR), couplings (CG), gearboxes (GB) — slurry pump shaft sleeves, overhead crane wire rope, chain conveyors
- **Primary CBM**: Dimensional measurement of wear components | P-F 3–12 mo | OEM specification
- **Strategy**: CB preferred (measure shaft sleeve diameter). FT: replace packing at every valve overhaul; shaft sleeves at seal change; wire rope per ISO 4309. RTF: acceptable for sacrificial elements (brake pads, packing, chain links).
- **Key threshold**: Wire rope approaching ISO 4309 discard → replace within 30 days; brake disc below OEM minimum → replace immediately (safety)

---

#### FM-72 | Wears + Relative movement (fretting) | Op | B | ISO 2.4

> **Degradation**: Small-amplitude oscillatory motion (5–300 μm) between clamped surfaces breaks oxide films, generating hard Fe₂O₃ debris as abrasive third body with wear coefficient 10–100× higher than sliding wear; fretting also initiates fatigue cracks. At OCP, pump shaft bearing seats fret from vibration, coupling hubs loosen, wire ropes suffer internal strand fretting (primary life limiter), and crusher eccentric shaft fits degrade.

- **Weibull**: β 2.0–3.5, η 8,000–40,000 h
- **Top P-conditions**: Red-brown oxide powder (fretting debris) at press-fit interfaces, increasing bearing clearance on shaft (dial indicator), vibration showing progressive looseness
- **Equipment**: Pumps (PU), motors (EM), conveyors (CV), crushers (CU), mills (ML), cranes (CR), couplings (CG), fans (FA) — pump bearing seats, motor rotor fits, wire ropes, mill trunnion seats
- **Primary CBM**: Vibration monitoring for progressive fit loosening | P-F 1–4 wk | ISO 10816, ISO 20816
- **Strategy**: CB preferred (monitor vibration for fit loosening). FT: measure shaft at all fits during every bearing replacement; wire rope internal inspection per ISO 4309 every 6 mo; apply anti-fretting compound at all press-fits during reassembly. RTF: never for rotating shaft fits or wire ropes.
- **Key threshold**: Shaft undersize at bearing seat → apply shaft repair (metal spray + grind); fretting cracks at shaft shoulder → replace shaft immediately (fatigue risk)

---

## Appendix D: Cross-Reference Views

### D.1 Failure Modes by Pattern

**B (Age-related) — FT eligible** (~35 FMs):
FM-01, FM-05, FM-08, FM-09, FM-10, FM-11, FM-12, FM-13, FM-14, FM-15, FM-19, FM-20, FM-24, FM-25, FM-26, FM-27, FM-32, FM-36, FM-41, FM-42, FM-45, FM-47, FM-51, FM-53, FM-55, FM-58, FM-63, FM-64, FM-66, FM-67, FM-71, FM-72

**C (Gradual increase) — FT eligible** (~14 FMs):
FM-02, FM-17, FM-18, FM-22, FM-28, FM-29, FM-35, FM-39, FM-40, FM-43, FM-44, FM-49, FM-59, FM-62, FM-69

**E (Random) — FT NOT applicable** (~22 FMs):
FM-03, FM-06, FM-07, FM-16, FM-21, FM-23, FM-30, FM-31, FM-33, FM-34, FM-37, FM-38, FM-46, FM-48, FM-50, FM-52, FM-54, FM-56, FM-57, FM-60, FM-61, FM-65, FM-68, FM-70

**D (Random + break-in) — FT NOT applicable** (1 FM):
FM-04

### D.2 Causes Across Multiple Mechanisms

| Cause | Mechanisms (FM#) | Count |
|-------|-------------------|-------|
| Mechanical overload | BREAKS (06), DISTORTS (34), OVERHEATS/MELTS (52), SEVERS (57), THERMALLY OVERLOADS (60), WEARS (70) | 6 |
| Contamination | BLOCKS (02), DEGRADES (28), IMMOBILISED (43), OVERHEATS/MELTS (49), SHORT-CIRCUITS (59) | 5 |
| Impact/shock loading | CRACKS (23), DISTORTS (33), DRIFTS (38), SEVERS (56), WEARS (67) | 5 |
| Excessive temperature | CRACKS (21), DRIFTS (37), LOOSES PRELOAD (46) | 3 |
| Age | CRACKS (19), DEGRADES (25), EXPIRES (42) | 3 |
| Use | DISTORTS (36), DRIFTS (41), WASHES OFF (63) | 3 |
| Breakdown in insulation | ARCS (01), SHORT-CIRCUITS (58) | 2 |
| Chemical attack | CORRODES (09), DEGRADES (26) | 2 |
| Cyclic loading | BREAKS (05), CRACKS (20) | 2 |
| Electrical overload | OPEN-CIRCUIT (48), OVERHEATS/MELTS (50) | 2 |
| Entrained air | DEGRADES (30), WEARS (65) | 2 |
| Excessive fluid velocity | WASHES OFF (62), WEARS (66) | 2 |
| Lack of lubrication | IMMOBILISED (44), OVERHEATS/MELTS (51) | 2 |
| Relative movement | OVERHEATS/MELTS (53), WEARS (72) | 2 |

### D.3 Failure Modes by Frequency Basis

**Calendar-based** (~30): FM-01, FM-02, FM-08, FM-09, FM-10, FM-11, FM-12, FM-13, FM-14, FM-15, FM-16, FM-17, FM-18, FM-19, FM-22, FM-25, FM-26, FM-27, FM-28, FM-29, FM-32, FM-39, FM-42, FM-45, FM-47, FM-49, FM-58, FM-59, FM-62, FM-63

**Operational-based** (~42): FM-03, FM-04, FM-05, FM-06, FM-07, FM-20, FM-21, FM-23, FM-24, FM-30, FM-31, FM-33, FM-34, FM-35, FM-36, FM-37, FM-38, FM-40, FM-41, FM-43, FM-44, FM-46, FM-48, FM-50, FM-51, FM-52, FM-53, FM-54, FM-55, FM-56, FM-57, FM-60, FM-61, FM-64, FM-65, FM-66, FM-67, FM-68, FM-69, FM-70, FM-71, FM-72

---

## Appendix E: Consumer Reference

### Enum Mapping (Python — `tools/models/schemas.py`)

| Document Name | `Mechanism` Enum Value |
|---------------|----------------------|
| Arcs | `ARCS` |
| Blocks | `BLOCKS` |
| Breaks/Fracture/Separates | `BREAKS_FRACTURE_SEPARATES` |
| Corrodes | `CORRODES` |
| Cracks | `CRACKS` |
| Degrades | `DEGRADES` |
| Distorts | `DISTORTS` |
| Drifts | `DRIFTS` |
| Expires | `EXPIRES` |
| Immobilised | `IMMOBILISED` |
| Looses Preload | `LOOSES_PRELOAD` |
| Open-Circuit | `OPEN_CIRCUIT` |
| Overheats/Melts | `OVERHEATS_MELTS` |
| Severs | `SEVERS` |
| Short-Circuits | `SHORT_CIRCUITS` |
| Thermally Overloads | `THERMALLY_OVERLOADS` |
| Washes Off | `WASHES_OFF` |
| Wears | `WEARS` |

### Validation Rules

1. **SRC-09**: Only the 72 combinations in the matrix above are valid. Enforced by `VALID_FM_COMBINATIONS` in `schemas.py`.
2. **FM-01**: `what` field must start with uppercase letter.
3. **FM-02**: `is_hidden` must match `failure_consequence` type (hidden → HIDDEN_SAFETY/HIDDEN_NONSAFETY).
4. **Frequency units**: Calendar causes use calendar units (days/weeks/months/years); operational causes use operational units (hours/cycles/tonnes).
5. **FT eligibility**: Only patterns B and C are age-related (FT eligible). Patterns D and E are random (FT not applicable).

### Deep-Dive References

For full detail on any FM (complete degradation process, all P-conditions, full equipment table, all detection techniques, complete strategy guidance), see the individual file: `FM-{##}-{slug}.md` in this directory.

See also:
- [INDEX.md](INDEX.md) — Navigable links to all 72 individual FM files
- [FM-MASTER-REFERENCE.xlsx](FM-MASTER-REFERENCE.xlsx) — Excel version with filtering and cross-reference sheets
