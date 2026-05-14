# FM-26: Degrades due to Chemical attack

> **Combination**: 26 of 72
> **Mechanism**: Degrades
> **Cause**: Chemical attack
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — chemical degradation is progressive with cumulative exposure time; rate is predictable based on chemical concentration, temperature, and material compatibility
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 5,000–30,000 hours depending on chemical aggressiveness, material selection, and temperature

## Physical Degradation Process

Degradation due to chemical attack occurs when process chemicals or environmental agents cause progressive deterioration of material properties through chemical reaction with the material matrix — distinct from corrosion (which involves electrochemical metal dissolution) in that degradation refers primarily to polymeric, elastomeric, composite, and non-metallic material breakdown. Chemical attack mechanisms include: solvent swelling (process fluids absorb into polymer matrix, causing dimensional change and softening); chemical depolymerization (acid or alkali breaks polymer chain bonds, reducing molecular weight and strength); oxidative degradation (strong oxidizers attack polymer backbone); extraction of plasticizers and fillers (solvents leach out essential additives); and hydrolysis (water reacts with ester bonds in polyester, polyurethane, and nylon).

The degradation rate follows Arrhenius kinetics — for every 10°C temperature increase, the chemical attack rate approximately doubles. This means that materials compatible at ambient temperature may fail rapidly at elevated process temperature. Chemical compatibility charts (published by material suppliers) are the primary reference for material selection, but they typically test at standard conditions — actual process mixtures, trace contaminants, and temperature cycling can create more aggressive conditions than the standard tests predict.

In OCP phosphate processing, chemical degradation is particularly aggressive due to the corrosive process environment: phosphoric acid (H₃PO₄ at 28–54% concentration) attacks EPDM, natural rubber, and polyester-based materials; hydrofluoric acid (HF present as impurity in phosphoric acid from fluorapatite ore) attacks glass, glass fiber reinforcement, and silicone rubbers; sulfuric acid (H₂SO₄ used in the wet process) attacks most rubbers except specialized grades (Viton, PTFE-lined); and chlorides from seawater used for cooling at Jorf Lasfar/Safi cause stress corrosion of polymeric reinforcements. The combination of acids and elevated temperature (80–110°C in the acid circuit) makes material selection critical.

## Detectable Symptoms (P Condition)

- Polymer swelling, softening, or dimensional change (>5% volume change indicates incompatibility)
- Surface tackiness, blistering, or delamination of linings and coatings
- Hardness change (either softening from swelling or hardening from extraction of plasticizers)
- Weight change of coupons or test specimens exposed to process fluid (>3% per ASTM D471)
- Tensile strength reduction (>25% from original per ASTM D412 indicates material failure threshold)
- Color change or discoloration of polymer materials
- FRP (fiberglass) surface becoming rough, chalky, or exposing fibers (resin degradation)
- Gasket material extrusion, compression set increase, or seal failure rate increase

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Piping (PI) | Rubber-lined acid piping, FRP piping, PVC/CPVC piping | Rubber linings (natural, EPDM, Viton), FRP shell, PVC joints |
| Storage tanks (TA) | FRP acid tanks, rubber-lined tanks, HDPE tanks | FRP shell and laminate, rubber lining, HDPE weld joints |
| Pumps (PU) | Rubber-lined slurry pumps, PTFE-lined chemical pumps | Impeller rubber (CL-IMPELLER-SLURRY), casing lining, shaft sleeve |
| Valves (VA) | Rubber-lined butterfly valves, PTFE-lined ball valves | Lining material, seat inserts, packing rings, diaphragm |
| Seals and gaskets (SG) | Process gaskets, O-rings, mechanical seal faces | EPDM/Viton/PTFE seal material, gasket sheets, expansion joint elastomers |
| Heat exchangers (HE) | Graphite heat exchangers, PTFE heat exchangers | Graphite blocks, PTFE tubes/plates, gaskets between sections |
| Filters (FS) | ET-BELT-FILTER (CL-FILTER-CLOTH), polypropylene filter plates | Filter cloth (polypropylene, polyester), plate material, drainage grid |
| Hoses (HO) | Chemical transfer hoses, acid loading hoses | Inner tube material, reinforcement (if exposed), cover material |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Physical Effects | Hardness and dimensional measurement of polymer components | 6–12 months | ASTM D2240, ASTM D471 |
| Human Senses | Visual inspection for swelling, blistering, discoloration | 1–3 months | OEM compatibility data |
| Chemical Effects | Process fluid analysis (concentration, contaminants, pH) | Weekly–monthly | Process specification |
| Physical Effects | Lining adhesion testing (pull-off test) | 12–24 months | ASTM D4541, ISO 4624 |
| Physical Effects / NDT | FRP laminate thickness and condition assessment | 12–24 months | ASTM D5687, BS 4994 |
| Physical Effects | Coupon exposure testing (periodic weight/property check) | 3–6 months | ASTM D471, NACE TM0174 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect lining condition on Acid Piping [{tag}]`
- **Acceptable limits**: Lining thickness ≥70% of original applied thickness. No blistering, delamination, or exposed substrate. Hardness within ±15 points of as-new Shore A. FRP laminate: no fiber exposure, resin intact per Barcol hardness test (≥80% of as-new). Gasket material within compatibility limits per manufacturer data.
- **Conditional comments**: If lining softened or swollen >5%: verify chemical compatibility, consider material upgrade. If blistering or delamination <10% of area: plan spot repair within 30 days. If blistering >10% or substrate exposed: plan complete relining within 14 days (substrate corrosion accelerates rapidly once exposed). If FRP Barcol hardness drops >20%: plan replacement, investigate chemical exposure changes.

### Fixed-Time (for known chemical exposure environments)

- **Task**: `Replace gaskets on Acid Circuit Flanges [{tag}]`
- **Interval basis**: Based on material compatibility life in specific chemical service. Typical intervals: EPDM in phosphoric acid (28%): 2–3 years; Viton in phosphoric acid: 5–8 years; PTFE gaskets in acid service: 8–15 years; rubber linings in acid piping: 5–10 years (depending on acid concentration and temperature); FRP in acid service: 10–20 years with annual inspection; filter cloth in acid service: 500–2,000 hours. Reduce intervals by 50% for operations above 60°C.

### Run-to-Failure (applicability criteria)

- **Applicability**: NEVER acceptable for containment linings on corrosive fluid circuits — lining failure exposes the structural substrate to rapid corrosion, risking containment breach. Acceptable only for non-critical components in benign chemical environments where degradation causes cosmetic change rather than functional failure.

---

*Cross-references: [RCM2 Moubray Ch.8 — On-Condition Tasks, Physical Effects], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — CB strategy with calendar basis]*
