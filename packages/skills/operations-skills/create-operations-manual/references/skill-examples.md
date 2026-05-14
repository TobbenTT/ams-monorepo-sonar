# Examples - create-operations-manual

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example: Startup Procedure Step Format

**System**: Cooling Water System (System 31)
**Procedure**: SOP-031-STR-001 - Normal Startup of Cooling Water System

```
PROCEDIMIENTO DE ARRANQUE NORMAL - SISTEMA DE AGUA DE ENFRIAMIENTO (SISTEMA 31)

Codigo: SOP-031-STR-001
Revision: A
Fecha: 2025-01-15

PRECONDICIONES:
[ ] Mantenimiento del sistema completado y autorizado para arranque
[ ] Todos los permisos de trabajo cerrados para Sistema 31
[ ] Suministro de agua de reposicion disponible (verificar FI-3101 > 0)
[ ] Energia electrica disponible en MCC-031
[ ] Quimica del agua analizada y dentro de especificaciones
[ ] Torre de enfriamiento inspeccionada (relleno, eliminadores, boquillas)

PPE REQUERIDO:
- Casco de seguridad
- Lentes de seguridad
- Zapatos de seguridad
- Proteccion auditiva (en area de torre y bombas)

RIESGOS Y PRECAUCIONES:
- Riesgo electrico (equipos energizados): Mantener distancia de seguridad con tableros
- Superficie humeda/resbaladiza (area de torre): Caminar con precaucion
- Quimicos de tratamiento de agua: Usar guantes al manipular

PROCEDIMIENTO:

Paso | Accion                                                           | Responsable      | Verificacion
-----|------------------------------------------------------------------|------------------|-----------------------------------------
1    | Verificar nivel en basin de torre CT-3101 en LI-3101.            | Operador Campo   | Nivel entre 70-80% (LI-3101)
     | NOTA: Si nivel < 50%, completar llenado antes de continuar.      |                  |
2    | Verificar que valvula de reposicion de agua LCV-3101 esta en     | Operador Campo   | Valvula en posicion AUTO en DCS
     | modo automatico.                                                  |                  |
3    | Verificar alineamiento de succion bomba P-3101A:                 | Operador Campo   | Valvulas de succion e impulsion abiertas
     | - Abrir valvula de succion HV-3101A (si cerrada)                 |                  |
     | - Abrir valvula de impulsion HV-3102A (si cerrada)               |                  |
4    | ⚠ ADVERTENCIA: Verificar que venteo de bomba esta cerrado antes  |                  |
     | de arrancar. Riesgo de salpicadura de agua.                      |                  |
5    | Desde DCS, arrancar bomba P-3101A presionando boton START en     | Operador Panel   | II-3101A indica corriente nominal
     | pantalla SCR-031-01.                                              |                  | PI-3105 indica > 3.5 bar
6    | Verificar presion de descarga en PI-3105.                        | Operador Panel   | PI-3105: 3.5 - 4.2 bar
     | Si presion < 3.5 bar, verificar alineamiento de valvulas.       |                  |
7    | Verificar flujo total en FI-3110.                                | Operador Panel   | FI-3110: > 800 m3/hr
8    | Abrir valvulas de suministro a consumidores de enfriamiento:     | Operador Campo   | Todas las valvulas indicadas abiertas
     | - HV-3120 (Enfriamiento compresor C-2501)                       |                  |
     | - HV-3121 (Enfriamiento intercambiador E-2201)                  |                  |
     | - HV-3122 (Enfriamiento generador G-1001)                       |                  |
9    | Verificar temperatura de retorno de agua en TI-3115.             | Operador Panel   | TI-3115: < 35 C
10   | Arrancar ventiladores de torre CT-3101-F1 y CT-3101-F2.         | Operador Panel   | Motores corriendo, II-3130/3131 normal
11   | Registrar en bitacora: hora de arranque, presion, flujo, y      | Operador Panel   | Registro completado en bitacora
     | temperatura inicial.                                              |                  |
12   | Monitorear sistema durante primera hora. Verificar cada 15 min:  | Operador Panel   | Parametros estables por 1 hora
     | - Presion PI-3105 (3.5-4.2 bar)                                 |                  |
     | - Flujo FI-3110 (>800 m3/hr)                                    |                  |
     | - Temperatura retorno TI-3115 (<35 C)                           |                  |
     | - Nivel basin LI-3101 (70-80%)                                  |                  |

SISTEMA EN OPERACION NORMAL CUANDO:
- Presion descarga PI-3105 estable entre 3.5-4.2 bar
- Flujo total FI-3110 > 800 m3/hr
- Temperatura retorno TI-3115 < 35 C
- Nivel basin LI-3101 controlando entre 70-80%
- Todos los consumidores recibiendo agua de enfriamiento
```

### Example: Troubleshooting Matrix Entry

| Sintoma | Posible Causa | Verificacion | Accion Correctiva |
|---------|--------------|--------------|-------------------|
| Presion de descarga baja (PI-3105 < 3.5 bar) | 1. Filtro de succion obstruido | Verificar dP en PDI-3103 (> 0.5 bar = obstruido) | Cambiar a filtro standby, limpiar filtro obstruido |
| | 2. Desgaste de impeller | Comparar corriente vs. historico en II-3101A | Programar inspeccion de bomba con Mantenimiento |
| | 3. Valvula de recirculacion abierta | Verificar posicion de HV-3108 | Cerrar HV-3108 si esta abierta |
| | 4. Cavitacion (nivel bajo en basin) | Verificar LI-3101 < 40% | Reducir carga, verificar reposicion LCV-3101 |
| Temperatura de retorno alta (TI-3115 > 35 C) | 1. Ventiladores de torre detenidos | Verificar estado de CT-3101-F1/F2 | Arrancar ventiladores |
| | 2. Relleno de torre danado o sucio | Inspeccion visual de torre | Programar limpieza/reemplazo con Mantenimiento |
| | 3. Carga termica superior a diseno | Verificar carga de proceso actual | Reducir carga de proceso o agregar torre standby |
