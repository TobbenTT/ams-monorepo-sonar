# FM-32: Degrades due to Radiation

> **Combination**: 32 of 72
> **Mechanism**: Degrades
> **Cause**: Radiation
> **Frequency Basis**: Calendar
> **Typical Failure Pattern**: B (Age-related) — radiation degradation is progressive with cumulative exposure dose; rate is predictable based on radiation intensity and material susceptibility
> **ISO 14224 Failure Mechanism**: 2.0 Material defect (general)
> **Weibull Guidance**: β typically 2.0–3.5 (wear-out), η 20,000–80,000 hours depending on radiation type/intensity and material susceptibility

## Physical Degradation Process

Degradation due to radiation occurs when electromagnetic radiation (ultraviolet, infrared) or nuclear radiation breaks molecular bonds in organic materials, causing progressive deterioration of mechanical and physical properties. The dominant radiation source in industrial environments is solar ultraviolet (UV) radiation, which has sufficient photon energy (3.1–4.0 eV for UV-A/B) to break carbon-carbon and carbon-hydrogen bonds in polymers. UV photodegradation causes: chain scission (molecular weight reduction, loss of tensile strength and elongation); cross-linking (embrittlement, surface hardening, cracking); photo-oxidation (combined UV and oxygen attack, forming carbonyl groups that accelerate further degradation); and discoloration (breakdown of pigments and stabilizers).

Infrared radiation (heat radiation) from furnaces, kilns, and hot process equipment contributes to thermal degradation of nearby components — the effect is equivalent to elevated temperature exposure but transmitted by radiation rather than convection or conduction. Nuclear radiation (gamma, neutron) is relevant only for specialized applications (nuclear level gauges, thickness gauges) where source capsule degradation or radiation damage to detector electronics occurs over time.

UV degradation is surface-dominated — the UV photons are absorbed in the outer 100–300 μm of the material, creating a degraded surface layer that cracks and crazes while the bulk material remains relatively unaffected. This surface cracking then provides pathways for moisture, chemicals, and oxygen to reach the bulk material, accelerating bulk degradation. UV stabilizers (HALS, carbon black) are added to polymers to absorb UV before it damages the polymer backbone, but these stabilizers are consumed over time and have finite protection life.

In OCP phosphate processing, radiation degradation is significant for: outdoor cable insulation, conduit, and cable tray at all sites (Morocco receives high UV intensity — UV index 9–11 in summer); rubber components exposed to direct sunlight (conveyor belt covers, outdoor piping lagging, expansion joint bellows); fiberglass (FRP) piping and tank surfaces exposed to sunlight (UV degrades the resin, exposing glass fibers); outdoor instrument housings and tubing; and polymer-based coatings and sealants on outdoor structures.

## Detectable Symptoms (P Condition)

- Surface chalking, fading, or discoloration of outdoor polymer/paint materials
- Surface cracking or crazing pattern on UV-exposed surfaces (characteristic fine mesh)
- FRP surface becoming rough, fiber-prominent, and chalky (resin degradation)
- Rubber becoming hard, brittle, or developing surface cracks on sun-exposed side only
- Cable insulation cracking when flexed (bend test failure on UV-exposed sections)
- Tensile strength of surface layer reduced >25% from as-new (coupon testing)
- Paint adhesion failure on UV-degraded surfaces (pull-off test per ASTM D4541)
- Protective coating thickness reduction from surface erosion of degraded material

## Applicable Equipment & Components

| Equipment Class (ISO 14224) | OCP Equipment Examples | Susceptible Maintainable Items |
|---|---|---|
| Electrical installations (EI) | Outdoor cable, conduit, cable tray covers | PVC cable sheath, PE conduit, polycarbonate covers |
| Piping (PI) | FRP piping, HDPE piping, outdoor rubber-lined piping | FRP resin surface, HDPE pipe, rubber lining (exposed sections) |
| Storage tanks (TA) | FRP tanks, HDPE tanks, outdoor rubber-lined tanks | FRP tank shell (resin surface), HDPE welds, external coatings |
| Conveyors (CV) | ET-BELT-CONVEYOR (outdoor rubber belt), outdoor structures | Belt rubber cover (top cover), lagging rubber, structural coatings |
| Seals and gaskets (SG) | Outdoor expansion joints, exposed seal elements | EPDM/rubber bellows, gaskets on outdoor flanges, O-rings |
| Structural steel (ST) | Outdoor structures, pipe racks, platforms | Paint systems (topcoat UV degradation), galvanized surfaces |
| Instruments (ID) | Outdoor instrument housings, solar-exposed enclosures | Polycarbonate/fiberglass housings, tubing, wiring insulation |
| Safety devices (SD) | Outdoor fire detection, safety signage | Detector lenses, signage material, fire hose reels |

## Recommended Detection & Monitoring

| CBM Category (Moubray) | Technique | Typical P-F Interval | Reference Standard |
|---|---|---|---|
| Human Senses | Visual inspection for chalking, cracking, discoloration | 3–12 months | ASTM D4214 (chalking), ASTM D660 (cracking) |
| Physical Effects | Surface hardness testing of exposed polymers | 12–24 months | ASTM D2240, ISO 7619 |
| Physical Effects | Paint adhesion testing (pull-off) | 12–24 months | ASTM D4541, ISO 4624 |
| Physical Effects | FRP Barcol hardness / surface condition assessment | 12–24 months | ASTM D2583, BS 4994 |
| Physical Effects / NDT | Cable insulation testing (UV-exposed outdoor runs) | 24–60 months | IEEE 400, IEC 60502 |
| Physical Effects | Coating thickness measurement | 12–24 months | SSPC-PA 2, ISO 19840 |

## Maintenance Strategy Guidance

### Condition-Based (preferred)

- **Primary task**: `Inspect coating condition on Outdoor Structure [{tag}]`
- **Acceptable limits**: Paint: chalking ≤rating 6 per ASTM D4214, no cracking per ASTM D660 rating >6. FRP: Barcol hardness ≥80% of as-new, no fiber exposure. HDPE/PVC: no surface cracking when flexed, hardness within ±10 points of as-new. Cable insulation: no visible cracking, flexible when bent to minimum bend radius.
- **Conditional comments**: If paint chalking >rating 6: plan recoating within 12 months (UV protection of substrate being lost). If FRP surface degraded with fiber exposure: apply UV-resistant topcoat (gel coat) within 6 months to prevent accelerated structural degradation. If outdoor cable cracking: plan cable replacement, install UV-resistant conduit or cable protection for replacement. If rubber cracking on sun-exposed side: plan replacement, consider UV-resistant compound (EPDM with carbon black, or UV-stabilized formulation).

### Fixed-Time (for UV protection renewal)

- **Task**: `Repaint outdoor structure on Pipe Rack [{tag}]`
- **Interval basis**: Outdoor paint systems in Morocco: epoxy/polyurethane topcoat 5–8 years (coastal sites: Jorf Lasfar, Safi — accelerated by UV + salt), 7–10 years (inland: Khouribga, Benguerir). FRP UV protective gel coat: reapply every 5–8 years per BS 4994. Outdoor cable: inspect every 3 years, plan replacement at 15–20 years for UV-exposed runs. Use UV-stabilized materials for all new outdoor installations (carbon black-filled PE, UV-stabilized EPDM, acrylic-urethane topcoats).

### Run-to-Failure (applicability criteria)

- **Applicability**: Acceptable for cosmetic/aesthetic coatings on non-structural elements where UV degradation is purely appearance-related. NOT acceptable for UV-protective coatings on FRP (structural degradation follows), cables (insulation failure causes faults), or weather-protective coatings on steel (corrosion follows coating failure — see CORRODES mechanisms FM-08 to FM-18).

---

*Cross-references: [RCM2 Moubray Ch.7 §7.5 — Scheduled Restoration Tasks], [ISO 14224 Table B.2 — 2.0 Material defect], [REF-01 §3.5 — FT strategy with calendar basis]*
