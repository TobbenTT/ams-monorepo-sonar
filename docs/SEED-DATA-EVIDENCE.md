# Evidencia: Los TAGs numericos vienen del Excel de seed data

## Archivo fuente
`seed_data/01_equipment_hierarchy.xlsx` — Sheet: "Equipment Hierarchy" — 3,833 filas

## Columnas relevantes
| Columna | Campo SAP | Contenido |
|---------|-----------|-----------|
| `sap_func_loc` | Functional Location | `SN-3000-3100-3110-3110MI0001` |
| `pltxt` | Name | `Molino SAG` |
| `equnr` | Equipment Number (TAG) | `000000000189` |
| `eqktx` | Equipment Description | `Molino SAG` |

## Ejemplo: Molienda SAG

```
FL: SN-3000-3100-3110-3110BN0011   | Name: Tolva bolas SAG              | TAG: 000000000175
FL: SN-3000-3100-3110-3110MI0001   | Name: Molino SAG                   | TAG: 000000000189
FL: SN-3000-3100-3110-3110PU0061   | Name: Bomba alimentacion hidrocicl | TAG: 000000000191
FL: SN-3000-3100-3110-3110CV0004   | Name: Correa transferencia pebbles | TAG: 000000000179
FL: SN-3000-3100-3100-3100FP1001   | Name: Tablero SCI                  | TAG: 000000000172
FL: SN-3000-3100-3100-3100US0001   | Name: Subestacion unitaria Molien  | TAG: 000000000173
```

## Problema
El campo `equnr` (Equipment Number) en el Excel tiene **IDs numericos de SAP** (000000000189) como TAG. Esto es el numero interno de SAP, NO un TAG descriptivo.

En una planta real, el TAG seria algo como `SAG-MILL-001` o `PP-CR-001`. Pero los datos del Excel usan el numero de equipo de SAP como TAG.

## Solucion
1. El cliente debe proporcionar TAGs reales (descriptivos) en vez de IDs numericos de SAP
2. O se puede usar el campo `sap_func_loc` como identificador (ej: `3110MI0001` — la parte final del functional location)
3. El frontend ya fue arreglado para mostrar el NOMBRE del equipo en vez del TAG numerico

## Codigos de ubicacion (SN-3000-3100-3100)
Los codigos `SN-3000-3100-3100` NO estan duplicados. Es la jerarquia real de SAP PM:
- `SN` = Planta (Salares Norte)
- `SN-3000` = Area (Planta Concentradora)
- `SN-3000-3100` = Sistema (Planta de Molienda)
- `SN-3000-3100-3100` = Sub-sistema dentro de Molienda
- `SN-3000-3100-3110` = Molienda SAG

El "3100" aparece dos veces porque el sub-sistema tiene el mismo codigo que su sistema padre — es convencion del Excel, no un bug.
