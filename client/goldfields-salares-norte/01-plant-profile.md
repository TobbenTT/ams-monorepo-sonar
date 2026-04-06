# Salares Norte -- Plant Profile

## 1. Company and Project Overview

| Field | Detail |
|---|---|
| Owner | Gold Fields Limited (JSE / NYSE: GFI) |
| Subsidiary | Gold Fields Chile SpA |
| Project | Salares Norte Gold-Silver Mine |
| Location | Atacama Region, Chile -- 190 km SE of Diego de Almagro, 1,200 km N of Santiago |
| Elevation | 3,900 -- 4,700 m ASL (primary process plant ~4,500 m) |
| EPCM Contractor | Fluor Corporation |
| Mining Contractor | ICV (open-pit mining, fleet operation) |
| First Gold Pour | March 2024 |
| Mine Life | 11.5 years (based on current reserves) |

## 2. Deposit Geology

Salares Norte is a **high-sulphidation epithermal gold-silver deposit** hosted within two principal ore bodies:

- **Brecha Principal** -- Main breccia body, bulk of the reserve.
- **Agua Amarga** -- Secondary zone, contributes supplementary feed.

The ore is silica-rich (high quartz content, Mohs hardness ~7), which has direct consequences for abrasive wear on all material-handling and comminution equipment.

### Reserve and Grade

| Metal | Reserve | Average Grade |
|---|---|---|
| Gold | 3.5 Moz | 5.13 g/t Au |
| Silver | 39 Moz | 57.94 g/t Ag |

These grades place Salares Norte among the **highest-grade open-pit gold mines globally**, enabling economic operation despite the extreme operating environment.

## 3. Mining Method

Open-pit mining with conventional drill-blast-load-haul:

| Equipment | Specification |
|---|---|
| Haul Trucks | CAT 785 (191-tonne payload) |
| Shovels | Komatsu PC5500 hydraulic excavators |
| Fleet Management | Wenco FMS -- 72 connected vehicles |
| Operator | ICV (contract mining) |

Fleet size is moderate given the 2 Mtpa throughput, but the high altitude imposes significant diesel derating (~25-30%) that must be factored into fleet productivity and maintenance scheduling.

## 4. Process Flowsheet

The metallurgical process follows a conventional gold-silver recovery circuit sized for **2 Mtpa (~5,500 tpd)**:

```
ROM Ore
  |
  v
PRIMARY CRUSHING
  |
  v
COARSE ORE STOCKPILE
  |
  v
TWO-STAGE GRINDING
  |-- SAG Mill (4 MW)
  |-- Ball Mill (4 MW)
  |
  v
LEACHING (Cyanide)
  |
  v
COUNTER-CURRENT DECANTATION (CCD)
  |-- Thickener train (multiple stages)
  |
  v
CARBON-IN-PULP (CIP)
  |
  v
MERRILL-CROWE PRECIPITATION
  |
  v
SMELTING / DORE BARS
  |
  v
TAILINGS TREATMENT
  |-- Three Metso VPA Vertical Plate Pressure Filters
  |-- Filtered Dry Stack (>86% water recovery)
```

### Key Process Equipment

| Area | Equipment | Maintenance Significance |
|---|---|---|
| Crushing | Primary jaw/gyratory crusher | High-impact loads on silica ore; liner wear |
| Grinding | 4 MW SAG mill + 4 MW ball mill | Highest power consumers; liner and media management |
| Leaching | Agitated leach tanks | Corrosion management (cyanide environment) |
| CCD | Multi-stage thickener train | Rake mechanisms, underflow pumps |
| CIP | Carbon columns | Valve wear, screen maintenance |
| Merrill-Crowe | Zinc precipitation + clarification | Precision process; filter press maintenance |
| Tailings | 3x Metso VPA Pressure Filters | Cloth replacement, hydraulic cycling, seal integrity |

## 5. Production Profile

| Parameter | Value |
|---|---|
| Throughput | 2 Mtpa (~5,500 tpd) |
| Steady-state Production | 450 -- 580 koz Au-equivalent per year (first 7 years) |
| Gold Recovery | Target >90% |

Production is highly sensitive to plant availability. At 5,500 tpd and 5.13 g/t Au, every day of downtime costs approximately **750 -- 900 oz Au-eq** in lost production (~USD 1.5 -- 2.0 M at USD 2,000/oz).

## 6. Automation and Control Systems

| System | Provider | Scope |
|---|---|---|
| DCS / Process Control | ABB 800xA | Plant-wide distributed control |
| AI / Predictive Analytics | ABB Genix | Equipment health monitoring, anomaly detection |
| Fleet Management | Wenco | Real-time dispatch, payload monitoring, 72 vehicles |

The ABB 800xA platform is the backbone of all process control. ABB Genix provides AI-driven analytics for predictive maintenance, which is particularly valuable given the remoteness and the cost of unplanned downtime.

**Maintenance implications:**
- Instrument calibration at altitude requires adjusted span settings (pressure, flow).
- Communication infrastructure must be maintained for remote monitoring.
- ABB Genix condition monitoring data should feed directly into the SAP PM notification workflow.

## 7. Power Supply

| Parameter | Value |
|---|---|
| Total Capacity | 25.9 MW (hybrid) |
| Diesel Generation | 16 MW |
| Solar PV | 9.9 MW |
| Supplier | Aggreko |
| Contract Term | 10 years |

The hybrid power plant reduces diesel consumption by ~38% during daylight hours. At 4,500 m, diesel generators are **derated ~25-30%**, which was factored into the 16 MW diesel sizing.

**Maintenance implications:**
- Diesel genset maintenance intervals must account for altitude derating and increased thermal stress.
- Solar panel cleaning is minimal (virtually no rain, but dust accumulation possible).
- Power reliability is critical -- no grid connection exists. A total power loss at -20C has catastrophic freezing consequences.

## 8. Water Management

Salares Norte operates under **extreme water scarcity** (<15 mm annual precipitation). The water management strategy is a core constraint:

| Parameter | Value |
|---|---|
| Water Source | Underground wells + process recycling |
| Recycling Rate | >86% (via filtered tailings) |
| Tailings Method | Filtered dry stack (no tailings dam) |
| Filters | 3x Metso VPA Vertical Plate Pressure Filters |

The filtered dry-stack tailings system is both an environmental commitment and a water-recovery mechanism. The three Metso pressure filters are **critical path equipment** -- loss of all three simultaneously would halt the plant.

**Maintenance implications:**
- Filter cloth replacement and hydraulic seal integrity are high-frequency maintenance items.
- Water circuit pipe freezing is the single largest operational risk (see April 2024 incident).
- All water-bearing piping requires heat tracing and insulation maintained annually.

## 9. Infrastructure and Logistics

| Item | Detail |
|---|---|
| Access Road | 190 km from Diego de Almagro (paved + unpaved) |
| Camp | On-site accommodation for operational workforce |
| Roster | Rotational (fly-in/fly-out + bus from Copiapo) |
| Nearest Major City | Copiapo (~280 km) |
| Nearest Port | Caldera / Chanaral |

**Logistics constraints affecting maintenance:**
- Critical spare parts delivery: minimum 6-8 hours by road from Copiapo; 24-48 hours from Santiago.
- Oversized components (mill liners, crusher mantles) require advance logistics planning.
- Winter road closures are possible (snow/ice at passes above 4,000 m).

---

## Sources

1. Gold Fields Chile -- Operations Overview (goldfields.com)
2. Mining Technology -- "Salares Norte Project, Atacama, Chile"
3. NS Energy -- "Salares Norte Gold-Silver Mine, Chile"
4. Fluor Corporation -- "First Gold at Salares Norte"
5. Wenco International Mining Systems -- Salares Norte Fleet Management
6. Aggreko -- "Hybrid Power Solution for Salares Norte"
7. Metso Outotec -- Vertical Plate Pressure Filters for Salares Norte
8. Gold Fields Integrated Annual Report 2024
9. International Mining -- "Salares Norte: Journey to Full Potential"
