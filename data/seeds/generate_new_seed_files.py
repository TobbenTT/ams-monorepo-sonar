"""
generate_new_seed_files.py — Parte B
Genera archivos 31-40 con datos sintéticos realistas para cerrar gaps operacionales.
Usa datos existentes de archivos 01-30 como base.
"""
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
np.random.seed(42)

print("=" * 70)
print("PARTE B: Generar archivos nuevos (31-40)")
print("=" * 70)

# ─── Cargar datos fuente ─────────────────────────────────────────────────────
hier = pd.read_excel(os.path.join(BASE, "01_equipment_hierarchy.xlsx"))
equip = hier[hier["equnr"].notna()].copy()
equip["sap_func_loc_short"] = equip["sap_func_loc_short"].astype(str)
lookup = dict(zip(equip["sap_func_loc_short"], equip["eqktx"]))
lookup_fl = dict(zip(equip["sap_func_loc_short"], equip["sap_func_loc"]))
lookup_eqart = dict(zip(equip["sap_func_loc_short"], equip["eqart"]))
lookup_wc = dict(zip(equip["sap_func_loc_short"], equip["planning_center"]))

backlog = pd.read_excel(os.path.join(BASE, "23_active_backlog.xlsx"))
mplans = pd.read_excel(os.path.join(BASE, "17_maintenance_plans.xlsx"))
workforce = pd.read_excel(os.path.join(BASE, "09_workforce.xlsx"))
work_centers_df = pd.read_excel(os.path.join(BASE, "11_work_centers.xlsx"))
wp = pd.read_excel(os.path.join(BASE, "05_work_packages.xlsx"))

AREAS = ["Chancado Primario", "Molienda", "Flotación", "Espesadores", "Filtración",
         "Lixiviación", "Planta de Ácido", "Servicios Generales", "Mina"]
SPECIALTIES = ["Mecánica", "Eléctrica", "Instrumentación", "Soldadura", "Lubricación",
               "Andamios", "Operador Grúa", "Supervisión", "General"]
WORK_CENTERS = list(work_centers_df["work_center"].unique()) if "work_center" in work_centers_df.columns else [
    "PASMEC01", "PASELE01", "PASINS01", "PHUMEC01", "PHUELE01",
    "MPCMEC01", "MPCELE01", "MCTMEC01", "MCTELE01"]
SHIFTS = ["Día 7x7", "Noche 7x7"]
SUPERVISORS = list(workforce["name"]) if "name" in workforce.columns else [
    f"Supervisor {i}" for i in range(1, 11)]

# Equipos disponibles (muestra representativa)
equip_sample = equip.sample(min(300, len(equip)), random_state=42)
equip_tags = list(equip_sample["sap_func_loc_short"])

# Fechas base: 3 semanas desde 2026-04-06
START_DATE = datetime(2026, 4, 6)
WEEK_DATES = {
    1: [START_DATE + timedelta(days=d) for d in range(7)],
    2: [START_DATE + timedelta(days=7 + d) for d in range(7)],
    3: [START_DATE + timedelta(days=14 + d) for d in range(7)],
}
ALL_DATES = [START_DATE + timedelta(days=d) for d in range(21)]

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 31: maintenance_schedule_3w.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 31_maintenance_schedule_3w.xlsx...")

PRE_OPS = [
    ("0010", "Charla de seguridad / AST", "Supervisión", 0.5, 2),
    ("0020", "Gestión de permisos de trabajo", "Supervisión", 0.5, 1),
    ("0030", "Bloqueo y etiquetado LOTO", "Mecánica", 0.5, 2),
    ("0040", "Aislamiento de energías", "Eléctrica", 0.5, 1),
]
POST_OPS = [
    ("0070", "Verificación de torques y ajustes", "Mecánica", 0.5, 1),
    ("0080", "Prueba funcional / test run", "Mecánica", 1.0, 2),
    ("0090", "Retiro LOTO y reconexión de energías", "Eléctrica", 0.5, 2),
    ("0100", "House-keeping y limpieza de área", "General", 0.5, 2),
    ("0110", "Entrega de equipo a operaciones", "Supervisión", 0.5, 2),
]
MAIN_OPS_PM = [
    ("Inspección visual y verificación de estado general", "Mecánica", 1.5),
    ("Medición de vibración y análisis", "Instrumentación", 1.0),
    ("Verificación de parámetros eléctricos", "Eléctrica", 1.0),
    ("Lubricación según carta de lubricación", "Lubricación", 1.0),
    ("Cambio de filtros y limpieza de componentes", "Mecánica", 2.0),
    ("Verificación de alineación y torques", "Mecánica", 1.5),
    ("Inspección termográfica", "Instrumentación", 1.0),
    ("Verificación de instrumentación y calibración", "Instrumentación", 1.5),
    ("Medición de espesores por ultrasonido", "Instrumentación", 1.5),
    ("Reemplazo de sellos y empaquetaduras", "Mecánica", 2.5),
]
MAIN_OPS_CM = [
    ("Diagnóstico de falla y causa raíz", "Mecánica", 2.0),
    ("Desmontaje de componente fallado", "Mecánica", 3.0),
    ("Reparación / reemplazo de componente", "Mecánica", 4.0),
    ("Ajuste y calibración post-reparación", "Instrumentación", 1.5),
    ("Verificación de funcionamiento", "Mecánica", 1.0),
]

rows_31 = []
order_counter = 500000
for week_num in range(1, 4):
    # PM orders: ~40-50 per week
    n_pm = np.random.randint(40, 55)
    # CM orders from backlog: ~15-25 per week
    n_cm = np.random.randint(15, 26)

    for i in range(n_pm + n_cm):
        order_counter += 1
        order_number = f"00{order_counter}"
        is_pm = i < n_pm
        order_type = "PM02" if is_pm else "PM01"
        source = "PM_PLAN" if is_pm else "BACKLOG"
        tag = np.random.choice(equip_tags)
        fl = lookup_fl.get(tag, f"SN-{tag}")
        name = lookup.get(tag, "")
        date = np.random.choice(WEEK_DATES[week_num])
        priority = np.random.choice(["1-Inmediata", "2-Alta", "3-Media", "4-Baja"],
                                     p=[0.05, 0.15, 0.50, 0.30] if is_pm else [0.15, 0.35, 0.35, 0.15])
        wc = np.random.choice(WORK_CENTERS)

        if is_pm:
            main_ops = [MAIN_OPS_PM[j] for j in np.random.choice(len(MAIN_OPS_PM),
                        size=np.random.randint(2, 4), replace=False)]
        else:
            main_ops = [MAIN_OPS_CM[j] for j in np.random.choice(len(MAIN_OPS_CM),
                        size=np.random.randint(2, 4), replace=False)]

        order_desc = f"{'PM' if is_pm else 'CM'} - {name}" if name else f"{'Preventivo' if is_pm else 'Correctivo'} - {tag}"

        # Determinar si necesita andamio o permisos especiales
        needs_scaffold = np.random.random() < 0.2
        needs_height_permit = needs_scaffold or np.random.random() < 0.1
        mat_available = np.random.choice(["Sí", "No"], p=[0.85, 0.15])
        status = "PROGRAMADO" if mat_available == "Sí" else "EN_ESPERA_MATERIAL"
        if needs_height_permit and np.random.random() < 0.1:
            status = "EN_ESPERA_PERMISO"

        constraint = ""
        if needs_scaffold:
            constraint = "Requiere montaje de andamio previo"
        if np.random.random() < 0.1:
            constraint = "Solo turno noche por interferencia con producción"
        if np.random.random() < 0.05:
            constraint = "Requiere shutdown parcial del sistema"

        # Build operations sequence
        all_ops = []
        # Pre-maintenance
        for op_num, op_desc, spec, dur, persons in PRE_OPS:
            all_ops.append((op_num, op_desc, spec, dur, persons))
        if needs_scaffold:
            all_ops.append(("0045", "Montaje de andamios", "Andamios", 2.0, 3))
        # Main operations
        for idx, (op_desc, spec, dur) in enumerate(main_ops):
            op_num = f"00{50 + idx * 5}"
            all_ops.append((op_num, op_desc, spec, dur, np.random.randint(1, 3)))
        if needs_scaffold:
            all_ops.append(("0065", "Desmontaje de andamios", "Andamios", 1.5, 3))
        # Post-maintenance
        for op_num, op_desc, spec, dur, persons in POST_OPS:
            all_ops.append((op_num, op_desc, spec, dur, persons))

        # Calculate times
        current_start = date.replace(hour=7, minute=0)
        for op_num, op_desc, spec, dur, persons in all_ops:
            op_end = current_start + timedelta(hours=dur)
            rows_31.append({
                "schedule_week": f"Semana {week_num}",
                "scheduled_date": date.strftime("%Y-%m-%d"),
                "order_number": order_number,
                "order_type": order_type,
                "sap_func_loc": fl,
                "sap_func_loc_short": tag,
                "equipment_name": name,
                "order_description": order_desc,
                "priority": priority,
                "operation_number": op_num,
                "operation_description": op_desc,
                "work_center": wc,
                "specialty": spec,
                "planned_hours": dur,
                "num_persons": persons,
                "planned_start": current_start.strftime("%Y-%m-%d %H:%M"),
                "planned_end": op_end.strftime("%Y-%m-%d %H:%M"),
                "material_required": "Sí" if "Cambio" in op_desc or "Reemplazo" in op_desc or "filtro" in op_desc.lower() else "No",
                "material_available": mat_available,
                "status": status,
                "source": source,
                "constraint_notes": constraint,
            })
            current_start = op_end

df31 = pd.DataFrame(rows_31)
df31.to_excel(os.path.join(BASE, "31_maintenance_schedule_3w.xlsx"), index=False, engine="openpyxl")
n_orders_31 = df31["order_number"].nunique()
print(f"    {len(df31)} filas, {n_orders_31} OTs generadas")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 32: typical_operations.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 32_typical_operations.xlsx...")

rows_32 = []
cat_id = 0

# PRE_MANTENIMIENTO
pre_ops = [
    ("AST_001", "Charla de seguridad / Análisis Seguro de Trabajo (AST)",
     "Reunión previa con todo el equipo de trabajo. Identificar riesgos específicos de la tarea, EPP requerido, procedimientos de emergencia. Firmar documento AST.",
     "Todos", "Supervisión", 0.5, 2, "No", "", "Alto", "Sí", 1),
    ("PTW_001", "Gestión de permisos de trabajo",
     "Solicitar y obtener aprobación del permiso de trabajo correspondiente. Verificar condiciones del área. Confirmar vigencia del permiso y alcance autorizado.",
     "Todos", "Supervisión", 0.5, 1, "Sí", "General", "Alto", "Sí", 2),
    ("LOTO_LOCK", "Bloqueo y etiquetado de equipos (LOTO)",
     "Identificar todas las fuentes de energía del equipo. Aplicar dispositivos de bloqueo en cada punto. Colocar etiquetas con nombre del responsable. Verificar energía cero con instrumentos.",
     "Todos", "Mecánica", 0.5, 2, "No", "", "Crítico", "Sí", 3),
    ("ISOL_ELEC", "Aislamiento de energía eléctrica",
     "Abrir breakers/seccionadores. Verificar ausencia de tensión con multímetro. Instalar tierras temporales si aplica. Señalizar tableros.",
     "Todos", "Eléctrica", 0.5, 1, "Sí", "Trabajo eléctrico", "Crítico", "Sí", 4),
    ("ISOL_HYD", "Aislamiento de energía hidráulica",
     "Cerrar válvulas de corte. Despresurizar líneas. Verificar manómetros en cero. Instalar bridas ciegas si es necesario.",
     "Bombas, Cilindros, Válvulas", "Mecánica", 0.5, 1, "No", "", "Crítico", "Condicional", 5),
    ("ISOL_PNEU", "Aislamiento de energía neumática",
     "Cerrar suministro de aire. Purgar líneas. Verificar presión cero. Bloquear válvulas de corte.",
     "Compresores, Actuadores", "Mecánica", 0.5, 1, "No", "", "Crítico", "Condicional", 6),
    ("ISOL_THERM", "Aislamiento de energía térmica",
     "Verificar temperaturas de superficie. Esperar enfriamiento si excede 50°C. Instalar protecciones térmicas.",
     "Hornos, Secadores, Calderas", "Mecánica", 0.5, 1, "No", "", "Alto", "Condicional", 7),
    ("DRAIN_001", "Vaciado y purgado de líneas",
     "Drenar fluidos del sistema. Purgar con aire/nitrógeno si aplica. Verificar ausencia de producto residual. Disponer residuos según protocolo ambiental.",
     "Bombas, Tuberías, Tanques", "Mecánica", 1.0, 2, "No", "", "Alto", "Condicional", 8),
    ("SCAFF_MOUNT", "Montaje de andamios",
     "Inspeccionar componentes del andamio. Montar según plano de armado aprobado. Instalar barandas, rodapiés y malla. Obtener tarjeta verde de aprobación.",
     "Equipos en altura >1.8m", "Andamios", 2.0, 3, "Sí", "Trabajo en altura", "Alto", "Condicional", 9),
    ("LIFELINE", "Instalación de líneas de vida",
     "Identificar puntos de anclaje certificados. Instalar línea de vida horizontal/vertical. Verificar capacidad de carga. Inspeccionar arneses y conectores.",
     "Equipos en altura >1.8m", "Andamios", 1.0, 2, "Sí", "Trabajo en altura", "Crítico", "Condicional", 10),
    ("CONFSPACE", "Ventilación de espacios confinados",
     "Instalar ventilación forzada. Monitorear O2, LEL, H2S, CO con detector multigás. Esperar condiciones seguras (O2: 19.5-23.5%, LEL <10%).",
     "Tanques, Silos, Tolvas", "Supervisión", 1.0, 2, "Sí", "Espacio confinado", "Crítico", "Condicional", 11),
    ("GAS_MON", "Monitoreo continuo de gases",
     "Instalar monitor de gases fijo en punto de trabajo. Calibrar detectores portátiles. Definir vigía de seguridad. Establecer plan de evacuación.",
     "Tanques, Silos, Áreas confinadas", "Supervisión", 0.5, 1, "Sí", "Espacio confinado", "Crítico", "Condicional", 12),
    ("AREA_DELIM", "Señalización y delimitación de área",
     "Instalar conos, cintas y barreras. Colocar señalética de advertencia. Notificar a operaciones y áreas adyacentes. Definir rutas de evacuación.",
     "Todos", "General", 0.5, 2, "No", "", "Medio", "Sí", 13),
]

for code, desc, detail, eqart, spec, dur, persons, permit, ptype, safety, mandatory, seq in pre_ops:
    cat_id += 1
    rows_32.append({
        "operation_catalog_id": f"OPC-{cat_id:04d}",
        "operation_category": "PRE_MANTENIMIENTO",
        "operation_code": code,
        "operation_description": desc,
        "description_detail": detail,
        "eqart_applicable": eqart,
        "specialty_required": spec,
        "typical_duration_hours": dur,
        "num_persons": persons,
        "requires_permit": permit,
        "permit_type": ptype,
        "safety_level": safety,
        "mandatory": mandatory,
        "sequence_order": seq,
    })

# ACTIVIDAD_PRINCIPAL — Operaciones de mantenimiento típicas
main_ops_catalog = [
    ("INSP_VIS", "Inspección visual general del equipo", "Inspeccionar estado general: corrosión, fugas, desgaste visible, conexiones sueltas, estado de pintura y protecciones.", "Todos", "Mecánica", 1.0, 1, "No", "", "Bajo", "Sí", 1),
    ("MED_VIB", "Medición y análisis de vibración", "Instalar acelerómetro en puntos definidos. Tomar mediciones en 3 ejes. Comparar con baseline y alertar si excede ISO 10816.", "Rotativos", "Instrumentación", 1.0, 1, "No", "", "Bajo", "Condicional", 2),
    ("MED_TEMP", "Medición de temperatura con termografía", "Realizar barrido termográfico de componentes críticos. Identificar puntos calientes anormales. Comparar con historial.", "Eléctricos, Rotativos", "Instrumentación", 1.0, 1, "No", "", "Bajo", "Condicional", 3),
    ("MED_ESP", "Medición de espesores por ultrasonido", "Medir espesores en puntos de control definidos. Registrar valores y comparar con mínimos de diseño. Alertar si <mínimo+1mm.", "Tuberías, Tanques, Chutes", "Instrumentación", 1.5, 1, "No", "", "Bajo", "Condicional", 4),
    ("LUBR_001", "Lubricación según carta de lubricación", "Aplicar lubricante especificado en puntos según carta. Verificar nivel de aceite. Purgar graseros viejos antes de inyectar.", "Rotativos, Reductores", "Lubricación", 1.0, 1, "No", "", "Bajo", "Condicional", 5),
    ("FILT_001", "Cambio de filtros", "Retirar filtro usado. Limpiar housing. Instalar filtro nuevo verificando especificación. Purgar aire si aplica.", "Compresores, Hidráulicos", "Mecánica", 1.5, 1, "Sí", "", "Bajo", "Condicional", 6),
    ("SEAL_001", "Reemplazo de sellos y empaquetaduras", "Retirar sello desgastado. Limpiar superficie de asiento. Instalar sello nuevo con lubricación adecuada. Verificar estanqueidad.", "Bombas, Válvulas", "Mecánica", 2.5, 2, "No", "", "Medio", "Condicional", 7),
    ("ALIGN_001", "Verificación y corrección de alineación", "Instalar equipo de alineación láser. Medir desalineación angular y paralela. Corregir con suplementos. Verificar tolerancia.", "Rotativos", "Mecánica", 2.0, 2, "No", "", "Medio", "Condicional", 8),
    ("BELT_001", "Inspección y ajuste de correas/bandas", "Verificar tensión con tensiómetro. Inspeccionar desgaste y grietas. Ajustar tensión según especificación. Verificar alineación de poleas.", "Transportadores, Drives", "Mecánica", 1.5, 2, "No", "", "Medio", "Condicional", 9),
    ("ELEC_VER", "Verificación de parámetros eléctricos", "Medir voltaje, corriente, resistencia de aislamiento con megger. Verificar conexiones. Reapretar bornes. Comparar con valores nominales.", "Motores, CCM, Transformadores", "Eléctrica", 1.5, 1, "Sí", "Trabajo eléctrico", "Alto", "Condicional", 10),
    ("DIAG_FALLA", "Diagnóstico de falla y análisis de causa raíz", "Recopilar información de operadores. Inspeccionar componentes fallados. Identificar modo de falla y causa probable. Documentar hallazgos.", "Todos", "Mecánica", 2.0, 2, "No", "", "Medio", "Condicional", 11),
    ("DESM_001", "Desmontaje de componente", "Marcar posiciones antes de desmontar. Retirar componente con herramienta/izaje adecuado. Proteger superficies mecanizadas. Almacenar pernería en orden.", "Todos", "Mecánica", 3.0, 2, "No", "", "Medio", "Condicional", 12),
    ("REPAR_001", "Reparación / reemplazo de componente", "Reparar o instalar componente nuevo/reacondicionado. Verificar especificaciones. Aplicar torques según tabla. Verificar holguras y tolerancias.", "Todos", "Mecánica", 4.0, 2, "No", "", "Medio", "Condicional", 13),
    ("MONT_001", "Montaje y ensamble de componentes", "Instalar componentes en secuencia según procedimiento. Aplicar torques con llave calibrada. Conectar líneas auxiliares.", "Todos", "Mecánica", 3.0, 2, "No", "", "Medio", "Condicional", 14),
    ("CALIB_001", "Calibración de instrumentos", "Simular señal con calibrador patrón. Verificar lectura vs. rango. Ajustar zero y span. Emitir certificado de calibración.", "Instrumentos", "Instrumentación", 1.5, 1, "No", "", "Medio", "Condicional", 15),
    ("SOLD_001", "Reparación por soldadura", "Preparar juntas según WPS. Precalentar si aplica. Soldar con proceso especificado. Inspección visual y END si es requerido.", "Estructuras, Tuberías", "Soldadura", 4.0, 2, "Sí", "Trabajo en caliente", "Alto", "Condicional", 16),
    ("IZAJE_001", "Izaje y maniobras de carga", "Planificar maniobra según peso y CG. Inspeccionar eslingas/grilletes. Señalizar área de izaje. Ejecutar con rigger certificado.", "Equipos pesados", "Operador Grúa", 2.0, 3, "Sí", "Izaje crítico", "Crítico", "Condicional", 17),
    ("OIL_SAMPLE", "Toma de muestra de aceite", "Obtener muestra en punto de muestreo definido. Usar envase limpio y etiquetado. Registrar horas de operación del aceite. Enviar a laboratorio.", "Reductores, Hidráulicos", "Lubricación", 0.5, 1, "No", "", "Bajo", "Condicional", 18),
]

for code, desc, detail, eqart, spec, dur, persons, permit, ptype, safety, mandatory, seq in main_ops_catalog:
    cat_id += 1
    rows_32.append({
        "operation_catalog_id": f"OPC-{cat_id:04d}",
        "operation_category": "ACTIVIDAD_PRINCIPAL",
        "operation_code": code,
        "operation_description": desc,
        "description_detail": detail,
        "eqart_applicable": eqart,
        "specialty_required": spec,
        "typical_duration_hours": dur,
        "num_persons": persons,
        "requires_permit": permit,
        "permit_type": ptype,
        "safety_level": safety,
        "mandatory": mandatory,
        "sequence_order": seq,
    })

# POST_MANTENIMIENTO
post_ops = [
    ("TORQUE_VER", "Verificación de torques y ajustes finales",
     "Verificar todos los pernos críticos con torquímetro calibrado. Registrar valores. Marcar pernos verificados con pintura.",
     "Todos", "Mecánica", 0.5, 1, "No", "", "Alto", "Sí", 1),
    ("TEST_RUN", "Prueba funcional / test run",
     "Coordinar con operaciones. Arrancar equipo en vacío. Verificar parámetros de operación (vibración, temperatura, presión, corriente). Gradualmente llevar a carga nominal.",
     "Todos", "Mecánica", 1.0, 2, "No", "", "Alto", "Sí", 2),
    ("LOTO_UNLOCK", "Desbloqueo de equipos (retiro LOTO)",
     "Verificar que todos los trabajadores retiraron herramientas. Retirar cada candado por su dueño. Reconectar energías en secuencia. Verificar protecciones en su lugar.",
     "Todos", "Mecánica", 0.5, 2, "No", "", "Crítico", "Sí", 3),
    ("ENERGY_RECON", "Reconexión de energías",
     "Cerrar breakers/seccionadores en secuencia. Verificar tensión de alimentación. Verificar sentido de giro. Re-presurizar sistemas hidráulicos/neumáticos.",
     "Todos", "Eléctrica", 0.5, 1, "No", "", "Alto", "Sí", 4),
    ("SCAFF_REMOVE", "Desmontaje de andamios",
     "Retirar andamio en secuencia inversa al armado. Inspeccionar y almacenar componentes. Retirar tarjeta de aprobación. Liberar área.",
     "Equipos en altura >1.8m", "Andamios", 1.5, 3, "Sí", "Trabajo en altura", "Alto", "Condicional", 5),
    ("LIFELINE_REM", "Retiro de líneas de vida",
     "Desinstalar líneas de vida temporales. Inspeccionar y almacenar equipos. Verificar que no quedan elementos temporales en altura.",
     "Equipos en altura >1.8m", "Andamios", 0.5, 2, "No", "", "Alto", "Condicional", 6),
    ("HOUSEKEEP", "House-keeping / limpieza de área",
     "Retirar todos los materiales sobrantes. Limpiar derrames. Clasificar residuos (chatarra, contaminados, reciclables). Dejar área en condición operativa.",
     "Todos", "General", 0.5, 2, "No", "", "Medio", "Sí", 7),
    ("HANDOVER", "Entrega de equipo a operaciones (handover)",
     "Reunión con operador/supervisor de turno. Explicar trabajos realizados. Indicar restricciones o monitoreo especial. Firmar acta de entrega.",
     "Todos", "Supervisión", 0.5, 2, "No", "", "Alto", "Sí", 8),
    ("PTW_CLOSE", "Cierre de permisos de trabajo",
     "Verificar que el área está limpia y segura. Firmar cierre del permiso. Devolver copia al departamento de seguridad.",
     "Todos", "Supervisión", 0.25, 1, "No", "", "Alto", "Sí", 9),
    ("PHOTO_POST", "Registro fotográfico post-intervención",
     "Fotografiar equipo en condición as-left. Documentar cualquier condición pendiente. Subir fotos al sistema con referencia a la OT.",
     "Todos", "General", 0.25, 1, "No", "", "Bajo", "Sí", 10),
]

for code, desc, detail, eqart, spec, dur, persons, permit, ptype, safety, mandatory, seq in post_ops:
    cat_id += 1
    rows_32.append({
        "operation_catalog_id": f"OPC-{cat_id:04d}",
        "operation_category": "POST_MANTENIMIENTO",
        "operation_code": code,
        "operation_description": desc,
        "description_detail": detail,
        "eqart_applicable": eqart,
        "specialty_required": spec,
        "typical_duration_hours": dur,
        "num_persons": persons,
        "requires_permit": permit,
        "permit_type": ptype,
        "safety_level": safety,
        "mandatory": mandatory,
        "sequence_order": seq,
    })

df32 = pd.DataFrame(rows_32)
df32.to_excel(os.path.join(BASE, "32_typical_operations.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df32)} operaciones típicas catalogadas")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 33: shutdown_detail.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 33_shutdown_detail.xlsx...")

SHUTDOWN_START = datetime(2026, 5, 4, 6, 0)  # Lunes 6:00
SHUTDOWN_DAYS = 7

# WBS structure
rows_33 = []
act_id = 0

def add_activity(name, atype, parent, tag, dur, spec, wc, persons, predecessor=None,
                 dep_type="FS", lag=0, critical=False, constraint="ASAP", notes="",
                 order_num=""):
    global act_id
    act_id += 1
    aid = f"SD-{act_id:04d}"
    fl = lookup_fl.get(tag, "") if tag else ""
    ename = lookup.get(tag, "") if tag else ""
    rows_33.append({
        "shutdown_id": "SHUT-2026-003",
        "activity_id": aid,
        "activity_name": name,
        "activity_type": atype,
        "parent_activity_id": parent,
        "sap_func_loc": fl,
        "sap_func_loc_short": tag or "",
        "equipment_name": ename,
        "order_number": order_num,
        "predecessor_id": predecessor or "",
        "dependency_type": dep_type if predecessor else "",
        "lag_hours": lag if predecessor else 0,
        "planned_start": "",  # will be calculated
        "planned_end": "",
        "duration_hours": dur,
        "work_center": wc,
        "specialty": spec,
        "num_persons": persons,
        "is_critical_path": "Sí" if critical else "No",
        "float_hours": 0 if critical else np.random.choice([2, 4, 8, 12, 16, 24]),
        "status": "PLANIFICADO",
        "constraint_type": constraint,
        "notes": notes,
    })
    return aid

# Phase 0: Milestones
ms_start = add_activity("INICIO PARADA MAYOR", "MILESTONE", "", "", 0, "Supervisión", "", 0,
                         critical=True, constraint="MUST_START", notes="Fecha fija acordada con operaciones")

# Phase 1: Preparación (Día -1 y Día 0)
p1 = add_activity("FASE 1: PREPARACIÓN", "PREP", "", "", 16, "Supervisión", "", 0,
                   predecessor=ms_start, critical=True)
p1_1 = add_activity("Reunión de coordinación general", "PREP", p1, "", 2, "Supervisión", "PASMEC01", 10,
                     predecessor=ms_start, critical=True)
p1_2 = add_activity("Verificación de materiales y repuestos", "PREP", p1, "", 4, "General", "PASMEC01", 4,
                     predecessor=p1_1, critical=True)
p1_3 = add_activity("Montaje de andamios - Área Molienda", "PREP", p1, "", 6, "Andamios", "PASMEC01", 6,
                     predecessor=p1_1, notes="8 andamios tipo torre")
p1_4 = add_activity("Montaje de andamios - Área Flotación", "PREP", p1, "", 4, "Andamios", "PASMEC01", 4,
                     predecessor=p1_1)
p1_5 = add_activity("Pre-posicionamiento de equipos de izaje", "PREP", p1, "", 3, "Operador Grúa", "PASMEC01", 3,
                     predecessor=p1_1)
p1_6 = add_activity("Instalación de iluminación temporal", "PREP", p1, "", 3, "Eléctrica", "PASELE01", 3,
                     predecessor=p1_1)

# Phase 2: Parada de planta
ms_stop = add_activity("HITO: PLANTA DETENIDA", "MILESTONE", "", "", 0, "Supervisión", "", 0,
                        predecessor=p1_2, critical=True, notes="Operaciones confirma planta detenida")
p2 = add_activity("FASE 2: AISLAMIENTO Y BLOQUEO", "PREP", "", "", 8, "Supervisión", "", 0,
                   predecessor=ms_stop, critical=True)
p2_1 = add_activity("Aislamiento eléctrico general - Molienda", "PREP", p2, "", 3, "Eléctrica", "PASELE01", 4,
                     predecessor=ms_stop, critical=True, notes="52 puntos LOTO")
p2_2 = add_activity("Aislamiento eléctrico general - Flotación", "PREP", p2, "", 2, "Eléctrica", "PASELE01", 3,
                     predecessor=ms_stop, notes="38 puntos LOTO")
p2_3 = add_activity("Drenaje de celdas de flotación", "PREP", p2, "", 4, "Mecánica", "PASMEC01", 4,
                     predecessor=p2_2)
p2_4 = add_activity("Vaciado de molino SAG", "PREP", p2, "", 6, "Mecánica", "PASMEC01", 6,
                     predecessor=p2_1, critical=True, notes="Vaciado completo + lavado")
p2_5 = add_activity("Drenaje de espesadores", "PREP", p2, "", 4, "Mecánica", "PASMEC01", 3,
                     predecessor=ms_stop)

# Phase 3: Ejecución principal — equipos reales del dataset
critical_equips = equip_sample.head(30)
p3 = add_activity("FASE 3: INTERVENCIONES PRINCIPALES", "EXEC", "", "", 96, "Supervisión", "", 0,
                   predecessor=p2_4, critical=True)

prev_critical = p2_4
for idx, (_, row) in enumerate(critical_equips.iterrows()):
    tag = str(row["sap_func_loc_short"])
    is_crit = idx < 5  # primeros 5 en camino crítico
    spec = np.random.choice(["Mecánica", "Eléctrica", "Instrumentación"])
    wc = np.random.choice(WORK_CENTERS)
    dur = np.random.choice([4, 6, 8, 12, 16, 24])
    order = f"00{600000 + idx}"
    pred = prev_critical if is_crit else p2_4

    parent_act = add_activity(f"Intervención: {lookup.get(tag, tag)}", "EXEC", p3, tag, dur, spec, wc,
                               np.random.randint(2, 6), predecessor=pred, critical=is_crit,
                               order_num=order,
                               notes=np.random.choice([
                                   "Overhaul completo", "Cambio de revestimientos",
                                   "Reparación de estructura", "Cambio de rodamientos principales",
                                   "Recambio de componentes internos", "Rebobinado de motor",
                                   "Reemplazo de sellos mecánicos", "Cambio de impulsor",
                                   "Reparación de eje", "Reemplazo de reductor"]))
    if is_crit:
        prev_critical = parent_act

# Phase 4: Pruebas y puesta en marcha
p4 = add_activity("FASE 4: PRUEBAS Y PUESTA EN MARCHA", "POST", "", "", 16, "Supervisión", "", 0,
                   predecessor=prev_critical, critical=True)
p4_1 = add_activity("Retiro de bloqueos LOTO - Molienda", "POST", p4, "", 3, "Eléctrica", "PASELE01", 4,
                     predecessor=prev_critical, critical=True)
p4_2 = add_activity("Retiro de bloqueos LOTO - Flotación", "POST", p4, "", 2, "Eléctrica", "PASELE01", 3,
                     predecessor=prev_critical)
p4_3 = add_activity("Verificación de giro de motores", "POST", p4, "", 2, "Eléctrica", "PASELE01", 4,
                     predecessor=p4_1, critical=True)
p4_4 = add_activity("Prueba hidrostática de líneas reparadas", "POST", p4, "", 3, "Mecánica", "PASMEC01", 3,
                     predecessor=p4_1)
p4_5 = add_activity("Llenado de celdas de flotación", "POST", p4, "", 4, "Mecánica", "PASMEC01", 3,
                     predecessor=p4_2)
p4_6 = add_activity("Arranque de molino SAG en vacío", "POST", p4, "", 2, "Mecánica", "PASMEC01", 6,
                     predecessor=p4_3, critical=True, notes="4 horas en vacío antes de alimentar")
p4_7 = add_activity("Rampa de carga progresiva", "POST", p4, "", 8, "Supervisión", "PASMEC01", 4,
                     predecessor=p4_6, critical=True, notes="25% → 50% → 75% → 100% en 8 horas")
p4_8 = add_activity("Desmontaje de andamios", "POST", p4, "", 6, "Andamios", "PASMEC01", 6,
                     predecessor=p4_3)
p4_9 = add_activity("House-keeping general", "POST", p4, "", 4, "General", "PASMEC01", 10,
                     predecessor=p4_3)

ms_end = add_activity("HITO: PLANTA EN OPERACIÓN NORMAL", "MILESTONE", "", "", 0, "Supervisión", "", 0,
                       predecessor=p4_7, critical=True, notes="Producción confirma operación estable")

# Calculate planned dates
activity_map = {r["activity_id"]: i for i, r in enumerate(rows_33)}
for i, r in enumerate(rows_33):
    if r["predecessor_id"] and r["predecessor_id"] in activity_map:
        pred_idx = activity_map[r["predecessor_id"]]
        pred_end = rows_33[pred_idx].get("_end_dt", SHUTDOWN_START)
        start = pred_end + timedelta(hours=float(r["lag_hours"]))
    else:
        start = SHUTDOWN_START
    end = start + timedelta(hours=float(r["duration_hours"]))
    rows_33[i]["planned_start"] = start.strftime("%Y-%m-%d %H:%M")
    rows_33[i]["planned_end"] = end.strftime("%Y-%m-%d %H:%M")
    rows_33[i]["_end_dt"] = end

# Remove temp field
for r in rows_33:
    r.pop("_end_dt", None)

df33 = pd.DataFrame(rows_33)
df33.to_excel(os.path.join(BASE, "33_shutdown_detail.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df33)} actividades de shutdown generadas")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 34: permits_to_work.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 34_permits_to_work.xlsx...")

PERMIT_TYPES = [
    ("Trabajo en altura", 0.25),
    ("Espacio confinado", 0.10),
    ("Trabajo en caliente", 0.15),
    ("Izaje crítico", 0.15),
    ("Excavación", 0.05),
    ("Trabajo eléctrico", 0.20),
    ("Radiografía industrial", 0.05),
    ("Trabajo general", 0.05),
]
ptype_names = [p[0] for p in PERMIT_TYPES]
ptype_probs = [p[1] for p in PERMIT_TYPES]

PPE_SPECIAL = {
    "Trabajo en altura": "Arnés de cuerpo completo, línea de vida retráctil, casco con barbiquejo",
    "Espacio confinado": "Detector multigás, arnés de rescate, equipo de ventilación forzada",
    "Trabajo en caliente": "Máscara de soldar, guantes de cuero largo, mandil ignífugo, biombo",
    "Izaje crítico": "Chaleco reflectante, radio comunicación, silbato de señalización",
    "Excavación": "Detector de servicios subterráneos, barricadas",
    "Trabajo eléctrico": "Guantes dieléctricos clase 0/00, tapete aislante, protector facial arc-flash",
    "Radiografía industrial": "Dosímetro personal, señalización radiactiva, área de exclusión",
    "Trabajo general": "EPP estándar (casco, lentes, guantes, zapatos de seguridad)",
}

LOTO_DETAILS = [
    "Breaker BKR-001 (480V), Válvula V-101 (agua proceso), Válvula V-102 (aire comprimido)",
    "Seccionador SEC-003 (4.16kV), Válvula V-201 (pulpa), Válvula V-202 (reactivo)",
    "Breaker BKR-015 (600V), Válvula V-301 (aceite hidráulico), Válvula V-302 (retorno)",
    "Interruptor INT-007 (23kV), Seccionador SEC-008, Puesta a tierra PAT-003",
    "Válvula V-401 (ácido), Válvula V-402 (agua lavado), Breaker BKR-022 (480V)",
    "Breaker BKR-030 (480V), Válvula V-501 (aire instrumental), Enclavamiento ENC-012",
]

safety_sups = [s for s in SUPERVISORS[:5]]
rows_34 = []
for i in range(350):
    ptype = np.random.choice(ptype_names, p=ptype_probs)
    tag = np.random.choice(equip_tags)
    date = np.random.choice(ALL_DATES)
    shift = np.random.choice(SHIFTS)
    valid_hours = int(np.random.choice([8, 12]))
    loto_pts = np.random.randint(2, 8) if ptype in ["Trabajo eléctrico", "Trabajo en caliente", "Trabajo general"] else 0

    rows_34.append({
        "permit_id": f"PTW-2026-{i+1:04d}",
        "permit_type": ptype,
        "order_number": f"00{500000 + np.random.randint(0, n_orders_31)}",
        "sap_func_loc": lookup_fl.get(tag, ""),
        "sap_func_loc_short": tag,
        "equipment_name": lookup.get(tag, ""),
        "description": f"{ptype} para intervención en {lookup.get(tag, tag)}",
        "requested_by": np.random.choice(SUPERVISORS),
        "approved_by": np.random.choice(safety_sups),
        "safety_supervisor": np.random.choice(safety_sups),
        "valid_from": date.strftime("%Y-%m-%d") + f" {7 if shift == 'Día 7x7' else 19}:00",
        "valid_to": (date + timedelta(hours=valid_hours)).strftime("%Y-%m-%d %H:%M"),
        "shift": shift,
        "loto_points": loto_pts,
        "loto_detail": np.random.choice(LOTO_DETAILS) if loto_pts > 0 else "",
        "gas_monitoring_required": "Sí" if ptype == "Espacio confinado" else ("Sí" if np.random.random() < 0.1 else "No"),
        "rescue_plan_required": "Sí" if ptype in ["Espacio confinado", "Trabajo en altura"] else "No",
        "ppe_special": PPE_SPECIAL.get(ptype, "EPP estándar"),
        "status": np.random.choice(["APROBADO", "ACTIVO", "CERRADO"], p=[0.3, 0.3, 0.4]),
        "risk_level": "Alto" if ptype in ["Espacio confinado", "Izaje crítico", "Radiografía industrial"] else (
            "Medio" if ptype in ["Trabajo en altura", "Trabajo en caliente", "Trabajo eléctrico"] else "Bajo"),
    })

df34 = pd.DataFrame(rows_34)
df34.to_excel(os.path.join(BASE, "34_permits_to_work.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df34)} permisos de trabajo generados")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 35: weekly_program.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 35_weekly_program.xlsx...")

PLANNING_GROUPS = ["M01", "M02", "P01", "P02"]
rows_35 = []
for week_label in ["2026-W14", "2026-W15", "2026-W16"]:
    week_num = int(week_label.split("W")[1])
    week_start = START_DATE + timedelta(weeks=week_num - 14)
    for day_offset in range(7):
        date = week_start + timedelta(days=day_offset)
        for pg in PLANNING_GROUPS:
            for wc in WORK_CENTERS[:6]:
                for spec in ["Mecánica", "Eléctrica", "Instrumentación"]:
                    avail = np.random.randint(16, 40)
                    hh_pm = round(np.random.uniform(4, avail * 0.5), 1)
                    hh_cm = round(np.random.uniform(2, avail * 0.3), 1)
                    hh_shut = round(np.random.uniform(0, avail * 0.1), 1)
                    total = round(hh_pm + hh_cm + hh_shut, 1)
                    util = round(total / avail * 100, 1) if avail > 0 else 0

                    rows_35.append({
                        "program_week": week_label,
                        "program_date": date.strftime("%Y-%m-%d"),
                        "planning_group": pg,
                        "work_center": wc,
                        "specialty": spec,
                        "available_hh": avail,
                        "planned_hh_pm": hh_pm,
                        "planned_hh_cm": hh_cm,
                        "planned_hh_shutdown": hh_shut,
                        "total_planned_hh": total,
                        "utilization_pct": util,
                        "overload_flag": "Sí" if util > 100 else "No",
                        "num_orders_pm": np.random.randint(2, 8),
                        "num_orders_cm": np.random.randint(1, 5),
                        "backlog_hh_remaining": round(np.random.uniform(20, 200), 1),
                        "compliance_target_pct": 90.0,
                        "notes": "Priorizar equipos críticos A" if util > 100 else "",
                    })

df35 = pd.DataFrame(rows_35)
df35.to_excel(os.path.join(BASE, "35_weekly_program.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df35)} registros de programa semanal")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 36: resource_availability.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 36_resource_availability.xlsx...")

ABSENCE_REASONS = ["", "", "", "", "Vacaciones", "Licencia médica", "Capacitación", "Descanso rotativo"]
rows_36 = []
for date in ALL_DATES:
    for shift in SHIFTS:
        for wc in WORK_CENTERS[:6]:
            for spec in SPECIALTIES[:5]:
                total_hc = np.random.randint(3, 8)
                absent = np.random.randint(0, min(3, total_hc))
                avail_hc = total_hc - absent
                avail_hh = avail_hc * (10 if shift == "Día 7x7" else 10)
                assigned = round(np.random.uniform(0, avail_hh), 1)

                rows_36.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "shift": shift,
                    "work_center": wc,
                    "specialty": spec,
                    "total_headcount": total_hc,
                    "available_headcount": avail_hc,
                    "available_hh": avail_hh,
                    "assigned_hh": assigned,
                    "remaining_hh": round(avail_hh - assigned, 1),
                    "absence_reason": np.random.choice(ABSENCE_REASONS) if absent > 0 else "",
                    "absent_count": absent,
                })

df36 = pd.DataFrame(rows_36)
df36.to_excel(os.path.join(BASE, "36_resource_availability.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df36)} registros de disponibilidad de recursos")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 37: material_reservations.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 37_material_reservations.xlsx...")

# Load spare parts for realistic material numbers
spare = pd.read_excel(os.path.join(BASE, "07_spare_parts_inventory.xlsx"))
mat_nums = list(spare["material_number"].unique())[:200]
mat_descs = dict(zip(spare["material_number"], spare["description"]))
mat_units = dict(zip(spare["material_number"], spare["unit"]))
storage_locs = ["AL01", "AL02", "AL03", "BOD-MINA", "BOD-PLANTA"]

rows_37 = []
orders_31 = list(df31["order_number"].unique())
for i in range(800):
    mat = np.random.choice(mat_nums)
    qty_req = np.random.randint(1, 20)
    qty_avail = np.random.randint(0, qty_req + 5)
    if qty_avail >= qty_req:
        status = "DISPONIBLE"
    elif qty_avail > 0:
        status = "PARCIAL"
    else:
        status = np.random.choice(["NO_DISPONIBLE", "EN_TRANSITO"], p=[0.6, 0.4])

    rows_37.append({
        "reservation_id": f"RES-2026-{i+1:05d}",
        "order_number": np.random.choice(orders_31),
        "operation_number": np.random.choice(["0050", "0055", "0060"]),
        "material_number": mat,
        "description": mat_descs.get(mat, f"Material {mat}"),
        "quantity_required": qty_req,
        "quantity_available": min(qty_avail, qty_req),
        "unit": mat_units.get(mat, "UN"),
        "storage_location": np.random.choice(storage_locs),
        "availability_status": status,
        "expected_delivery_date": (START_DATE + timedelta(days=np.random.randint(1, 25))).strftime("%Y-%m-%d") if status in ["NO_DISPONIBLE", "EN_TRANSITO"] else "",
        "is_critical": "Sí" if status in ["NO_DISPONIBLE", "EN_TRANSITO"] and np.random.random() < 0.3 else "No",
    })

df37 = pd.DataFrame(rows_37)
df37.to_excel(os.path.join(BASE, "37_material_reservations.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df37)} reservas de materiales")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 38: kpi_snapshots.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 38_kpi_snapshots.xlsx...")

KPI_DEFS = [
    ("schedule_compliance", "%", 85, 90, 70, 98),
    ("pm_compliance", "%", 90, 95, 75, 100),
    ("backlog_weeks", "semanas", 4, 3, 2, 8),
    ("wrench_time", "%", 35, 40, 25, 50),
    ("mtbf", "horas", 1200, 1500, 500, 3000),
    ("mttr", "horas", 6, 4, 2, 24),
    ("availability", "%", 92, 95, 85, 99),
    ("emergency_pct", "%", 12, 10, 5, 30),
    ("rework_pct", "%", 5, 3, 1, 15),
]

rows_38 = []
# Weekly snapshots for 52 weeks (2025-W14 to 2026-W16)
for week_offset in range(52):
    snap_date = datetime(2025, 4, 7) + timedelta(weeks=week_offset)
    for area in AREAS[:5]:
        for pg in PLANNING_GROUPS[:2]:
            for kpi_name, unit, baseline, target, lo, hi in KPI_DEFS:
                # Simulate trending improvement with noise
                trend_factor = week_offset / 52 * 0.1  # 10% improvement over year
                value = baseline + (target - baseline) * trend_factor + np.random.normal(0, (hi - lo) * 0.05)
                value = round(max(lo, min(hi, value)), 2)
                variance = round((value - target) / target * 100, 1) if target != 0 else 0
                trend = "UP" if value > baseline else ("DOWN" if value < baseline else "STABLE")
                # Invert trend meaning for metrics where lower is better
                if kpi_name in ["mttr", "emergency_pct", "rework_pct", "backlog_weeks"]:
                    trend = "DOWN" if value < baseline else ("UP" if value > baseline else "STABLE")

                rows_38.append({
                    "snapshot_date": snap_date.strftime("%Y-%m-%d"),
                    "period_type": "SEMANAL",
                    "area": area,
                    "planning_group": pg,
                    "kpi_name": kpi_name,
                    "kpi_value": value,
                    "kpi_target": target,
                    "kpi_unit": unit,
                    "trend": trend,
                    "variance_pct": variance,
                })

df38 = pd.DataFrame(rows_38)
df38.to_excel(os.path.join(BASE, "38_kpi_snapshots.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df38)} snapshots de KPIs")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 39: execution_checklists.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 39_execution_checklists.xlsx...")

EQART_TYPES = list(equip["eqart"].dropna().unique())[:15]

CHECKLIST_TEMPLATES = {
    "PM": [
        (1, "Verificar condiciones de seguridad del área", "VERIFICACION", "", "", "Sí", "No", "Sí"),
        (2, "Inspeccionar estado general del equipo - registro fotográfico", "FOTO", "", "", "Sí", "Sí", "No"),
        (3, "Verificar nivel de aceite/lubricante", "MEDICION", "Normal", "nivel", "Sí", "No", "No"),
        (4, "Medir vibración punto DE (Drive End)", "MEDICION", "<4.5", "mm/s", "Sí", "No", "No"),
        (5, "Medir vibración punto NDE (Non-Drive End)", "MEDICION", "<4.5", "mm/s", "Sí", "No", "No"),
        (6, "Medir temperatura de rodamientos", "MEDICION", "<80", "°C", "Sí", "No", "No"),
        (7, "Verificar estado de correas/acoples", "VERIFICACION", "", "", "No", "No", "No"),
        (8, "Verificar ausencia de fugas", "VERIFICACION", "", "", "Sí", "No", "No"),
        (9, "Lubricar puntos según carta de lubricación", "ACCION", "", "", "Sí", "No", "No"),
        (10, "Medir resistencia de aislamiento (megger)", "MEDICION", ">100", "MΩ", "No", "No", "No"),
        (11, "Verificar apriete de conexiones eléctricas", "ACCION", "", "", "No", "No", "Sí"),
        (12, "Verificar protecciones y guardas en su lugar", "VERIFICACION", "", "", "Sí", "No", "Sí"),
        (13, "Registrar condición as-left del equipo", "FOTO", "", "", "Sí", "Sí", "No"),
        (14, "Verificar LOTO retirado completamente", "LOTO", "", "", "Sí", "No", "Sí"),
    ],
    "CM": [
        (1, "Verificar condiciones de seguridad y bloqueo LOTO", "LOTO", "", "", "Sí", "No", "Sí"),
        (2, "Registrar condición as-found del equipo", "FOTO", "", "", "Sí", "Sí", "No"),
        (3, "Identificar componente fallado", "VERIFICACION", "", "", "Sí", "No", "No"),
        (4, "Verificar disponibilidad de repuesto correcto", "VERIFICACION", "", "", "Sí", "No", "No"),
        (5, "Desmontaje de componente (registrar condición)", "ACCION", "", "", "Sí", "Sí", "No"),
        (6, "Inspeccionar asiento/alojamiento", "VERIFICACION", "", "", "Sí", "No", "No"),
        (7, "Montaje de componente nuevo/reparado", "ACCION", "", "", "Sí", "No", "No"),
        (8, "Verificar torques según especificación", "MEDICION", "Según tabla", "Nm", "Sí", "No", "Sí"),
        (9, "Reconectar servicios (eléctrico, hidráulico, neumático)", "ACCION", "", "", "Sí", "No", "Sí"),
        (10, "Verificar alineación", "MEDICION", "<0.05", "mm", "No", "No", "No"),
        (11, "Prueba de giro sin carga", "VERIFICACION", "", "", "Sí", "No", "Sí"),
        (12, "Prueba con carga progresiva", "VERIFICACION", "", "", "Sí", "No", "Sí"),
        (13, "Medir parámetros de operación normal", "MEDICION", "Según diseño", "", "Sí", "No", "No"),
        (14, "Registrar condición as-left del equipo", "FOTO", "", "", "Sí", "Sí", "No"),
        (15, "Verificar LOTO retirado completamente", "LOTO", "", "", "Sí", "No", "Sí"),
    ],
    "PDM": [
        (1, "Verificar condiciones de acceso seguro", "VERIFICACION", "", "", "Sí", "No", "Sí"),
        (2, "Calibrar equipo de medición", "ACCION", "", "", "Sí", "No", "No"),
        (3, "Medición de vibración - todos los puntos", "MEDICION", "Según baseline", "mm/s", "Sí", "No", "No"),
        (4, "Análisis termográfico", "MEDICION", "<ΔT 15°C", "°C", "No", "No", "No"),
        (5, "Toma de muestra de aceite", "ACCION", "", "", "No", "No", "No"),
        (6, "Medición de ultrasonido", "MEDICION", "Según baseline", "dBμV", "No", "No", "No"),
        (7, "Medición de espesores", "MEDICION", ">mínimo diseño", "mm", "No", "No", "No"),
        (8, "Registrar resultados en sistema", "ACCION", "", "", "Sí", "No", "No"),
        (9, "Generar alerta si valor fuera de rango", "VERIFICACION", "", "", "Sí", "No", "No"),
    ],
}

rows_39 = []
cl_id = 0
for eqart in EQART_TYPES:
    for mtype, steps in CHECKLIST_TEMPLATES.items():
        cl_id += 1
        for step_num, desc, stype, expected, unit, mandatory, photo, safety in steps:
            rows_39.append({
                "checklist_id": f"CL-{cl_id:04d}",
                "eqart": eqart,
                "maintenance_type": mtype,
                "checklist_name": f"Checklist {mtype} - {eqart}",
                "step_number": step_num,
                "step_description": desc,
                "step_type": stype,
                "expected_value": expected,
                "unit": unit,
                "is_mandatory": mandatory,
                "requires_photo": photo,
                "safety_critical": safety,
            })

df39 = pd.DataFrame(rows_39)
df39.to_excel(os.path.join(BASE, "39_execution_checklists.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df39)} items de checklists de ejecución")

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVO 40: daily_log.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\n  Generando 40_daily_log.xlsx...")

ENTRY_TYPES = ["NOVEDAD", "HANDOVER", "INCIDENTE", "AVANCE", "HALLAZGO"]
ENTRY_PROBS = [0.30, 0.20, 0.10, 0.25, 0.15]

NOVEDAD_TEMPLATES = [
    "Se detectó fuga menor en sello mecánico de {equip}. Programar intervención.",
    "Vibración elevada reportada por operador en {equip}. Monitorear por 24h.",
    "Nivel de aceite bajo en {equip}. Se completó relleno.",
    "Alarma de temperatura alta en {equip}. Se verificó y normalizó.",
    "Ruido anormal en rodamiento DE de {equip}. Solicitar análisis de vibración.",
    "Correa desalineada en {equip}. Se ajustó durante turno.",
    "Falla intermitente en sensor de {equip}. Programar calibración.",
    "Goteo en línea de refrigeración de {equip}. Se aplicó sellante temporal.",
]
HANDOVER_TEMPLATES = [
    "Turno sin novedades mayores. {n} OTs completadas, {m} en progreso.",
    "Pendiente cierre de permiso en {equip}. OT en espera de prueba funcional.",
    "Se avanzó al 80% en OT de {equip}. Turno siguiente debe completar montaje.",
    "Material llegó para OT de {equip}. Priorizar mañana primer turno.",
    "Parada de emergencia de {equip} a las {hora}. Se restableció operación.",
]
INCIDENTE_TEMPLATES = [
    "Cuasi-accidente: herramienta cayó desde andamio en zona de {equip}. Sin lesionados. Se reforzó uso de porta-herramientas.",
    "Derrame menor de aceite hidráulico (2L) durante intervención en {equip}. Contenido y limpiado.",
    "Conato de incendio durante soldadura en {equip}. Extinguido inmediatamente con extintor. Se reforzó AST.",
]
AVANCE_TEMPLATES = [
    "OT {ot} completada. Equipo {equip} entregado a operaciones. Funcionando normal.",
    "OT {ot} avance 60%. Pendiente montaje de componente principal en {equip}.",
    "OT {ot} en espera de material (ETA mañana) para {equip}.",
    "Inspección predictiva completada en {equip}. Todos los valores dentro de rango.",
]
HALLAZGO_TEMPLATES = [
    "Se encontró corrosión avanzada en base de {equip}. Requiere reparación estructural.",
    "Guarda de protección dañada en {equip}. Se solicitó reemplazo.",
    "Cableado deteriorado en CCM de {equip}. Programar reemplazo preventivo.",
    "Fundación con grieta visible en {equip}. Solicitar evaluación estructural.",
    "Perno de anclaje suelto en {equip}. Se reapretó y marcó para seguimiento.",
]

rows_40 = []
log_id = 0
for date in ALL_DATES:
    for shift in SHIFTS:
        n_entries = np.random.randint(4, 10)
        for _ in range(n_entries):
            log_id += 1
            etype = np.random.choice(ENTRY_TYPES, p=ENTRY_PROBS)
            tag = np.random.choice(equip_tags)
            ename = lookup.get(tag, tag)
            area = np.random.choice(AREAS)
            wc = np.random.choice(WORK_CENTERS[:6])
            supervisor = np.random.choice(SUPERVISORS)

            if etype == "NOVEDAD":
                desc = np.random.choice(NOVEDAD_TEMPLATES).format(equip=ename)
            elif etype == "HANDOVER":
                desc = np.random.choice(HANDOVER_TEMPLATES).format(
                    equip=ename, n=np.random.randint(3, 8), m=np.random.randint(1, 4),
                    hora=f"{np.random.randint(8,18)}:{np.random.choice(['00','15','30','45'])}")
            elif etype == "INCIDENTE":
                desc = np.random.choice(INCIDENTE_TEMPLATES).format(equip=ename)
            elif etype == "AVANCE":
                desc = np.random.choice(AVANCE_TEMPLATES).format(
                    equip=ename, ot=f"00{500000 + np.random.randint(0, n_orders_31)}")
            else:
                desc = np.random.choice(HALLAZGO_TEMPLATES).format(equip=ename)

            priority = "CRITICO" if etype == "INCIDENTE" else (
                "ATENCION" if etype == "HALLAZGO" or (etype == "NOVEDAD" and np.random.random() < 0.3) else "NORMAL")
            follow_up = "Sí" if priority != "NORMAL" or np.random.random() < 0.2 else "No"

            rows_40.append({
                "log_id": f"LOG-{log_id:05d}",
                "log_date": date.strftime("%Y-%m-%d"),
                "shift": shift,
                "area": area,
                "work_center": wc,
                "shift_supervisor": supervisor,
                "entry_type": etype,
                "description": desc,
                "related_order": f"00{500000 + np.random.randint(0, n_orders_31)}" if etype in ["AVANCE", "NOVEDAD"] else "",
                "sap_func_loc": lookup_fl.get(tag, ""),
                "sap_func_loc_short": tag,
                "equipment_name": ename,
                "priority_flag": priority,
                "follow_up_required": follow_up,
                "follow_up_assigned_to": np.random.choice(SUPERVISORS) if follow_up == "Sí" else "",
            })

df40 = pd.DataFrame(rows_40)
df40.to_excel(os.path.join(BASE, "40_daily_log.xlsx"), index=False, engine="openpyxl")
print(f"    {len(df40)} entradas de bitácora diaria")

print("\n" + "=" * 70)
print("PARTE B COMPLETADA — 10 archivos nuevos generados (31-40)")
print("=" * 70)
