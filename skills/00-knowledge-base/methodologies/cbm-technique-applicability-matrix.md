# CBM Technique Applicability Matrix

Defines which condition-based monitoring technique applies to which component type. This is the reference for `TECHNIQUE_APPLICABILITY` in `scripts/rcm_rules.py`.

Sources: cbm-technique-selection.md, FM-MASTER-REFERENCE-ES.xlsx, NASA RCM Guide, ISO standards.

---

## Master Applicability Table

| Technique | Valid Components | NOT Valid For | P-F Interval | Monitoring Interval | Standard |
|-----------|-----------------|---------------|-------------|--------------------|----|
| **Vibration analysis** | Rotating >60 RPM: motor, bomba, reductor, ventilador, compresor, turbina. Bearings: rodamiento, cojinete, chumacera, descanso. Mechanical: acoplamiento, eje, impulsor, polea, tambor | Static: pernos, estructura, armarios, paneles, cables, sellos, cinta/correa, polines, instrumentacion, valvulas, tuberias, revestimientos | weeks-months | 2-12 weeks | ISO 10816-3, ISO 20816-1 |
| **Motor current analysis (MCSA)** | AC induction motors: motor, bomba, compresor, ventilador, generador | Non-electric equipment, DC motors | 2-6 months | 4-12 weeks | IEEE C37, NEMA MG-1 |
| **Insulation resistance (Megger)** | Electrical: motor, transformador, cable, tablero, generador, bobina, estator, devanado | Non-electrical equipment | 3-12 months | 6-26 weeks | IEEE 43, IEC 60085 |
| **MPI (Magnetic Particle)** | Large structures: eje principal, estructura, viga, columna, bastidor, chasis, soldadura, tambor | Small components: pernos, sellos, cables, instrumentacion, etiquetado, luces, grating | 6-24 months | 13-52 weeks | ASME Sec V, ISO 9934 |
| **Torque verification** | Bolted connections: perno, brida, acoplamiento, union, conexion, tuerca, esparrago, tornillo | Non-bolted components | months | 8-26 weeks | OEM spec |
| **UT thickness** | Pressure walls: tuberia, cañeria, carcaza, carcasa, cuerpo, camisa, tambor, vasija, tanque, deposito, chute, tolva, impulsor, voluta | Non-pressure components, structural | 6-24 months | 13-52 weeks | ASME B31.3, API 510/570 |
| **Structural integrity** | Large structures: estructura, bastidor, chasis, viga, columna, soportacion, marco | Small components, pernos, sellos, instrumentation | months | 8-26 weeks | AISC, local codes |
| **Wire rope inspection** | Cables: cable de acero, eslinga, piola | Non-cable components | weeks-months | 2-8 weeks | ISO 4309 |
| **Hardness testing** | Elastomers: sello, empaquetadura, oring, membrana, diafragma, correa, cinta, faja, revestimiento | Metal/rigid components | months | 13-52 weeks | ASTM D2240 |
| **Thermography (IR)** | Electrical: tablero, conexion, bornera, terminal, cable, transformador, contactor, disyuntor, interruptor. Mechanical: motor, rodamiento, cojinete. Transport: polin, polines | Buried/inaccessible components, components under water spray | days-weeks | 2-6 weeks | NETA MTS, ISO 18434-1 |
| **Differential pressure** | Flow-restricting: filtro, intercambiador, strainer, colador | Non-flow components | 1-4 weeks | daily-weekly | OEM spec |
| **Calibration** | Instruments: sensor, transmisor, indicador, medidor, analizador, instrumento, celda, pesometro | Non-instrument components | months | 13-52 weeks | ISA 51.1 |
| **Response time** | Protective devices: valvula, actuador, switch, presostato, detector, rele, relay | Non-protective components | weeks-months | 4-13 weeks | OEM spec |
| **Visual inspection** | **ALL components** — universal fallback | Nothing excluded | days-weeks | 2-8 weeks | General |

---

## Vibration Analysis: Special Rules

### Equipment-Level Rule
Vibration is measured at the **equipment level** (motor, bomba, reductor, transportador), not at the subcomponent level (rodamiento, eje, impulsor). The task name should reference the equipment type, not the MI.

Examples:
- Correct: "Realizar analisis de vibracion en bomba"
- Incorrect: "Realizar analisis de vibracion en Rodamientos"

### Exclusion-First Logic
Even if the equipment is a rotating machine (e.g., pump), vibration does NOT apply to its static subcomponents:
- Base, brida, camisa, carcaza → Visual inspection
- Sellos, empaquetaduras → Hardness/visual
- Tuberia, conexiones → UT/visual
- Pernos → Torque verification

### Polines (Idler Rollers)
- Vibration: NOT applicable (not a primary rotating machine)
- Thermography: YES (detects seized bearings via heat)
- Visual: YES (checks rotation, wear, alignment)

---

## Thermography: Special Rules

Thermography applies to components where thermal anomalies indicate failure:
1. **Electrical connections**: loose connections, overloaded circuits → hot spots
2. **Motors/bearings**: bearing failure, overload → elevated temperature
3. **Polines**: seized bearing → hot idler roller (detected by IR during belt operation)
4. **Switchgear**: loose bus connections, overloaded breakers

NOT applicable to:
- Components requiring disassembly to access
- Components under continuous water/coolant spray
- Internal component failures without surface thermal signature

---

## Visual Inspection: Universal Fallback

Visual inspection is ALWAYS applicable as a minimum CBM technique. When a specific technique (vibration, MPI, UT, etc.) is not applicable to a component, the system falls back to visual inspection.

The visual inspection task name includes the failure mechanism:
- "Inspeccionar {mi} por corrosion"
- "Inspeccionar {mi} por desgaste"
- "Inspeccionar {mi} por agrietamiento"
- "Inspeccionar {mi} por perdida de precarga"
- "Inspeccionar {mi} por deformacion"
- etc.

This ensures every failure mode has at least one proactive maintenance task.

---

## Detection Capability Summary

| Technique | Bearing Failure | Misalignment | Corrosion/Erosion | Cracking | Electrical Fault | Fouling/Blockage |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|
| Vibration | 95% | 85% | - | - | - | - |
| Thermography | 90% | - | - | - | 95% | - |
| Oil Analysis | 90% | - | - | - | - | - |
| UT Thickness | - | - | 95% | 80% | - | - |
| MPI/DPI | - | - | - | 95% | - | - |
| Visual | 50% | 60% | 90% | 85% | 50% | 95% |
| Differential P | - | - | - | - | - | 95% |
| Current Analysis | 80% | 70% | - | - | 90% | - |
