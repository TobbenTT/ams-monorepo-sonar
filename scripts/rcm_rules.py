"""
rcm_rules.py
============
Pure module containing ALL RCM rule-related constants and functions
extracted from build_maintenance_strategy_construction.py.

No main() or execution code — just constants and functions.
"""
import pandas as pd
import numpy as np
import re

# ═══════════════════════════════════════════════════════════════════════════
# RCM THRESHOLDS
# ═══════════════════════════════════════════════════════════════════════════

RCM_THRESHOLDS = {
    "crit_b_no_op_rpn_min": 60,
    "crit_c_online_rpn_min": 50,
    "crit_c_offline_rpn_min": 100,
}

# ═══════════════════════════════════════════════════════════════════════════
# SUBSYSTEM CLASSIFICATION (Corrección 2: subunit = subsistema funcional)
# ═══════════════════════════════════════════════════════════════════════════

SUBSYSTEM_RULES = [
    # (keywords, subsystem_name) — first match wins
    (["motor", "acoplamiento", "polea", "correa", "reductor", "caja reductora",
      "transmision", "engranaje", "piñon", "corona", "embrague",
      "variador", "inversor", "arrancador"], "Sistema Motriz"),

    (["sensor", "transmisor", "indicador", "switch", "presostato", "termostato",
      "detector", "medidor", "analizador", "instrumento", "plc", "controlador",
      "solenoide", "electrovalvula", "botonera", "alarma", "rele", "relay",
      "interlock", "parada de emergencia", "ups"], "Sistema de Instrumentacion"),

    (["hidraulic", "cilindro hidraulico", "bomba hidraulica",
      "deposito hidraulico", "valvula hidraulica", "manguera hidraulica",
      "filtro hidraulico", "acumulador hidraulico", "unidad hidraulica",
      "pistón"], "Sistema Hidraulico"),

    (["lubricacion", "lubricante", "grasa", "engrasador",
      "bomba de lubricacion", "filtro de aceite", "enfriador de aceite",
      "deposito de aceite", "aceite"], "Sistema de Lubricacion"),

    (["compresor", "aire comprimido", "neumatic", "valvula de aire",
      "filtro de aire", "secador de aire", "deposito de aire",
      "regulador de presion", "niple", "conector"], "Sistema Neumatico"),

    (["cable", "bornera", "terminal", "devanado", "bobina", "estator",
      "rotor", "transformador", "tablero", "armario electrico", "fusible",
      "disyuntor", "interruptor", "colector", "escobilla", "contactor",
      "conexion", "cableado"], "Sistema Electrico"),

    (["chasis", "bastidor", "carcasa", "estructura", "soporte", "perno",
      "pata", "base", "placa", "soldadura", "viga", "columna",
      "proteccion", "guarda", "cobertura", "tapa", "puerta",
      "revestimiento", "coraza", "blindaje", "marco"], "Sistema Estructural"),

    (["sello", "empaquetadura", "junta", "oring", "prensaestopa",
      "retenes", "diafragma", "membrana"], "Sistema de Sellado"),

    (["rodamiento", "cojinete", "buje", "chumacera", "descanso"], "Sistema de Rodamientos"),

    (["enfriador", "radiador", "ventilador", "intercambiador", "serpentin",
      "torre de enfriamiento", "refrigerante"], "Sistema de Refrigeracion"),

    (["banda", "cinta", "transportador", "polines", "rodillo", "tensor",
      "rascador", "chute", "tolva", "alimentador", "faja"], "Sistema de Transporte"),

    (["impulsor", "impeller", "voluta", "cuerpo de bomba", "succion",
      "descarga", "difusor"], "Sistema Humedo"),

    (["valvula", "compuerta", "damper", "actuador"], "Sistema de Valvulas"),

    (["tuberia", "cañeria", "codo", "fitting", "brida", "boquilla",
      "nozzle"], "Sistema de Tuberias"),

    (["eje", "flecha"], "Sistema de Transmision"),
]


def classify_subsystem(mi_name):
    """Classify a maintainable item into its functional subsystem."""
    mi_lower = str(mi_name).lower()
    for keywords, subsystem in SUBSYSTEM_RULES:
        for kw in keywords:
            if kw in mi_lower:
                return subsystem
    return "Sistema General"


# ═══════════════════════════════════════════════════════════════════════════
# DICTIONARIES: detection_method -> CBM technique -> task generation
# Based on cbm-technique-selection.md Section 5 and task-naming-standards.md
# ═══════════════════════════════════════════════════════════════════════════

# Map detection_method patterns (from 03) to task generation rules
DETECTION_MAP = {
    "vibracion": {
        "verb": "Realizar analisis de vibracion en",
        "task_type": "INSPECT",
        "constraint": "ONLINE",
        "limits": "Vibracion <= 4.5 mm/s RMS segun ISO 10816-3 Grupo 1, sin frecuencias de defecto",
        "comment": "Si vibracion > 7.1 mm/s (Zona C/D): programar accion correctiva dentro de 14 dias. Si > 11 mm/s: detener equipo, inspeccionar inmediatamente.",
        # P-F intervals by criticality (weeks): A, B, C
        "interval": {"A": 2, "B": 4, "C": 8},
        "time_units": "WEEKS",
        "access_time": 0,
    },
    "temperatura": {
        "verb": "Realizar termografia en",
        "task_type": "INSPECT",
        "constraint": "ONLINE",
        "limits": "Delta-T <= 10C sobre referencia, temperatura absoluta <= 80C segun clase aislamiento",
        "comment": "Si Delta-T > 25C o absoluta > clase aislamiento: reducir carga, programar inspeccion dentro de 14 dias. Si Delta-T > 2x alarma: detener equipo inmediatamente.",
        "interval": {"A": 2, "B": 4, "C": 6},
        "time_units": "WEEKS",
        "access_time": 0,
    },
    "visual": {
        "verb": "Inspeccionar",
        "task_type": "INSPECT",
        "constraint": "ONLINE",
        "limits": "Sin evidencia visible de deterioro, corrosion, picaduras o perdida de material",
        "comment": "Si se observa deterioro: documentar extension, fotografiar, reportar a supervisor. Si se confirma progresion vs inspeccion anterior: escalar a RCA y programar correctiva.",
        "interval": {"A": 2, "B": 4, "C": 8},
        "time_units": "WEEKS",
        "access_time": 0,
    },
    "torque": {
        "verb": "Verificar torque de pernos en",
        "task_type": "INSPECT",
        "constraint": "OFFLINE",
        "limits": "Torque >= 80% del valor especificado por OEM, marca testigo alineada",
        "comment": "Si torque < 80% especificado: reapretar a especificacion. Si marca testigo desalineada: documentar y reapretar todos los pernos del conjunto.",
        "interval": {"A": 8, "B": 13, "C": 26},
        "time_units": "WEEKS",
        "access_time": 0.5,
    },
    "mpi": {
        "verb": "Realizar inspeccion MPI en",
        "task_type": "TEST",
        "constraint": "OFFLINE",
        "limits": "Sin indicaciones lineales que excedan criterio de aceptacion segun ASME Sec V/VIII",
        "comment": "Si indicaciones exceden criterio de aceptacion: retirar de servicio. Evaluar ingenieria antes de retorno a servicio segun codigo aplicable.",
        "interval": {"A": 13, "B": 26, "C": 52},
        "time_units": "WEEKS",
        "access_time": 1,
    },
    "presion diferencial": {
        "verb": "Medir presion diferencial en",
        "task_type": "INSPECT",
        "constraint": "ONLINE",
        "limits": "Delta-P <= 2x baseline limpio, no exceder maximo OEM",
        "comment": "Si Delta-P > 2x baseline: planificar reemplazo de elemento filtrante. Si Delta-P > 3x o max OEM: reemplazar inmediatamente para evitar bypass.",
        "interval": {"A": 1, "B": 2, "C": 4},
        "time_units": "WEEKS",
        "access_time": 0,
    },
    "corriente": {
        "verb": "Realizar analisis de corriente en",
        "task_type": "TEST",
        "constraint": "ONLINE",
        "limits": "Desbalance de fase < 2%, bandas laterales > 50dB bajo fundamental segun IEEE C37",
        "comment": "Si amplitud bandas laterales > -46dB: programar inspeccion de motor dentro de 28 dias. Si > -40dB: retirar de servicio para inspeccion rotor/estator.",
        "interval": {"A": 4, "B": 8, "C": 13},
        "time_units": "WEEKS",
        "access_time": 0,
    },
    "cable de acero": {
        "verb": "Inspeccionar cable de acero en",
        "task_type": "INSPECT",
        "constraint": "OFFLINE",
        "limits": "Sin hilos rotos visibles, diametro dentro de tolerancia, sin corrosion segun ISO 4309",
        "comment": "Si hilos rotos > criterio ISO 4309: retirar de servicio. Si corrosion superficial: aumentar frecuencia de inspeccion y aplicar proteccion.",
        "interval": {"A": 2, "B": 4, "C": 8},
        "time_units": "WEEKS",
        "access_time": 1,
    },
    "estructural": {
        "verb": "Inspeccionar integridad estructural de",
        "task_type": "INSPECT",
        "constraint": "OFFLINE",
        "limits": "Sin deflexion visible, plomada dentro de 1/500 de altura, sin grietas",
        "comment": "Si deflexion > tolerancia: evaluar ingenieria estructural. Si grietas detectadas: retirar de servicio, evaluar reparacion.",
        "interval": {"A": 8, "B": 13, "C": 26},
        "time_units": "WEEKS",
        "access_time": 1,
    },
    "espesor": {
        "verb": "Medir espesor por ultrasonido en",
        "task_type": "TEST",
        "constraint": "OFFLINE",
        "limits": "Espesor de pared >= minimo de diseno segun ASME B31.3 / API 510",
        "comment": "Si espesor < 75% nominal: aumentar frecuencia de monitoreo a trimestral. Si espesor < minimo de diseno: retirar de servicio, reemplazar/reparar.",
        "interval": {"A": 13, "B": 26, "C": 52},
        "time_units": "WEEKS",
        "access_time": 1,
    },
    "dureza": {
        "verb": "Realizar ensayo de dureza en",
        "task_type": "TEST",
        "constraint": "OFFLINE",
        "limits": "Dureza Shore dentro de +/-10% del valor nominal OEM segun ASTM D2240",
        "comment": "Si dureza fuera de rango OEM > 10%: programar reemplazo. Si degradacion severa (> 25%): reemplazar inmediatamente.",
        "interval": {"A": 13, "B": 26, "C": 52},
        "time_units": "WEEKS",
        "access_time": 0.5,
    },
    # New detection methods from auto-generated FMs
    "resistencia de aislamiento": {
        "verb": "Medir resistencia de aislamiento en",
        "task_type": "TEST",
        "constraint": "OFFLINE",
        "limits": "Resistencia de aislamiento >= 100 MOhm (motor nuevo), no < 50% del valor inicial segun IEEE 43",
        "comment": "Si resistencia < 50 MOhm: programar rebobinado/reemplazo dentro de 30 dias. Si < 1 MOhm/kV: no energizar, reemplazar antes de retorno a servicio.",
        "interval": {"A": 6, "B": 13, "C": 26},
        "time_units": "WEEKS",
        "access_time": 1,
    },
    "calibracion": {
        "verb": "Verificar calibracion de",
        "task_type": "CALIBRATE",
        "constraint": "TEST_MODE",
        "limits": "Lectura dentro de +/-1% FS de referencia calibrada segun ISA 51.1",
        "comment": "Si desviacion > 2%: recalibrar. Si desviacion > 5% o inestable: reemplazar instrumento.",
        "interval": {"A": 13, "B": 26, "C": 52},
        "time_units": "WEEKS",
        "access_time": 0.5,
    },
    "tiempo de respuesta": {
        "verb": "Medir tiempo de respuesta de",
        "task_type": "TEST",
        "constraint": "TEST_MODE",
        "limits": "Tiempo de respuesta dentro de +/-20% del valor nominal OEM",
        "comment": "Si tiempo de respuesta > 150% nominal: programar mantenimiento. Si > 200%: retirar de servicio para reparacion.",
        "interval": {"A": 4, "B": 8, "C": 13},
        "time_units": "WEEKS",
        "access_time": 0.5,
    },
}

# ═══════════════════════════════════════════════════════════════════════════
# MECHANISM DICTIONARIES
# ═══════════════════════════════════════════════════════════════════════════

# Mechanism -> secondary task verb
MECHANISM_TO_SECONDARY = {
    "Desgaste": ("Reemplazar", "REPLACE"),
    "Corrosion": ("Reemplazar", "REPLACE"),
    "Degradacion": ("Restaurar", "REPLACE"),
    "Agrietamiento": ("Reemplazar", "REPLACE"),
    "Rotura/Fractura/Separacion": ("Reemplazar", "REPLACE"),
    "Corte/Desgarro/Perforacion": ("Reemplazar", "REPLACE"),
    "Deformacion": ("Reemplazar", "REPLACE"),
    "Perdida de precarga": ("Reapretar", "REPLACE"),
    "Obstruccion/Bloqueo": ("Limpiar", "CLEAN"),
    "Sobrecalentamiento/Fusion": ("Reparar", "REPAIR"),
    "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)": ("Reparar", "REPAIR"),
    # New mechanisms from FM-MASTER-REFERENCE
    "Arco electrico": ("Reparar", "REPAIR"),
    "Cortocircuito": ("Reparar", "REPAIR"),
    "Circuito abierto": ("Reparar", "REPAIR"),
    "Deriva": ("Calibrar", "REPLACE"),
    "Vencimiento/Caducidad": ("Reemplazar", "REPLACE"),
    "Inmovilizacion (atasque/traba)": ("Reparar", "REPAIR"),
    "Lavado/Erosion por fluido": ("Reemplazar", "REPLACE"),
}

# FT intervals by mechanism
FT_INTERVALS = {
    "Desgaste":                     {"unit": "OPERATING_HOURS", "A": 4000, "B": 8000, "C": 12000},
    "Corrosion":                    {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Degradacion":                  {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Perdida de precarga":          {"unit": "OPERATING_HOURS", "A": 1000, "B": 2000, "C": 4000},
    "Obstruccion/Bloqueo":          {"unit": "WEEKS", "A": 8, "B": 13, "C": 26},
    "Agrietamiento":                {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Rotura/Fractura/Separacion":   {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Sobrecalentamiento/Fusion":    {"unit": "WEEKS", "A": 13, "B": 26, "C": 52},
    "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)": {"unit": "WEEKS", "A": 13, "B": 26, "C": 52},
    "Deformacion":                  {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Corte/Desgarro/Perforacion":   {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Arco electrico":               {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Cortocircuito":                {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Circuito abierto":             {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Deriva":                       {"unit": "WEEKS", "A": 13, "B": 26, "C": 52},
    "Vencimiento/Caducidad":        {"unit": "WEEKS", "A": 26, "B": 52, "C": 78},
    "Inmovilizacion (atasque/traba)": {"unit": "WEEKS", "A": 13, "B": 26, "C": 52},
    "Lavado/Erosion por fluido":    {"unit": "WEEKS", "A": 13, "B": 26, "C": 52},
}

# FT verb selection by mechanism
FT_VERB = {
    "Desgaste": "Reemplazar",
    "Corrosion": "Reemplazar",
    "Degradacion": "Restaurar",
    "Agrietamiento": "Reemplazar",
    "Rotura/Fractura/Separacion": "Reemplazar",
    "Corte/Desgarro/Perforacion": "Reemplazar",
    "Deformacion": "Reemplazar",
    "Perdida de precarga": "Reapretar",
    "Obstruccion/Bloqueo": "Limpiar",
    "Sobrecalentamiento/Fusion": "Reparar",
    "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)": "Reparar",
    "Arco electrico": "Reparar",
    "Cortocircuito": "Reparar",
    "Circuito abierto": "Reparar",
    "Deriva": "Calibrar",
    "Vencimiento/Caducidad": "Reemplazar",
    "Inmovilizacion (atasque/traba)": "Restaurar",
    "Lavado/Erosion por fluido": "Reemplazar",
}

# FT task_type by verb
FT_TASK_TYPE = {
    "Reemplazar": "REPLACE",
    "Restaurar": "REPLACE",
    "Reparar": "REPAIR",
    "Limpiar": "CLEAN",
    "Reapretar": "REPLACE",
    "Calibrar": "CALIBRATE",
}

# ═══════════════════════════════════════════════════════════════════════════
# HIDDEN FAILURE / FFI
# ═══════════════════════════════════════════════════════════════════════════

# Hidden failure keywords (for FFI detection)
HIDDEN_KEYWORDS = [
    "sensor", "detector", "presostato", "switch", "alarma",
    "proteccion", "valvula de seguridad", "valvula de alivio",
    "valvula seguridad", "valvula alivio", "interlock",
    "indicador", "transmisor", "rele", "relay",
    "sistema contra incendio", "parada de emergencia",
    "ups", "respaldo", "instrumentacion",
]

# FFI limits by device type (task-naming-standards.md Section D)
FFI_LIMITS = {
    "sensor": "Salida del sensor responde dentro de +/-5% de senal de referencia calibrada segun ISA 51.1",
    "detector": "Responde a fuente de prueba dentro de sensibilidad y tiempo nominales",
    "presostato": "Lectura dentro de +/-1% FS de referencia calibrada segun ISA 51.1",
    "switch": "Activa dentro del tiempo nominal, contactos en buen estado",
    "alarma": "Activa correctamente ante condicion de prueba, senalizacion visible y audible",
    "valvula": "Abre/cierra a presion de ajuste +/-3% segun ASME BPVC Sec VIII",
    "interlock": "Sistema detiene dentro del tiempo nominal, todos los interlocks activan",
    "indicador": "Lectura dentro de +/-2% FS de referencia calibrada",
    "transmisor": "Salida 4-20mA dentro de +/-0.5% FS de referencia calibrada segun ISA 51.1",
    "rele": "Rele activa dentro del tiempo de pickup nominal segun IEEE C37.90",
    "relay": "Rele activa dentro del tiempo de pickup nominal segun IEEE C37.90",
    "incendio": "Responde a fuente de prueba (calor/humo) dentro de sensibilidad nominal",
    "emergencia": "Sistema detiene dentro del tiempo nominal, todos los interlocks activan",
    "ups": "Mantiene salida nominal durante duracion nominal bajo carga de prueba",
    "instrumentacion": "Lectura dentro de +/-1% FS de referencia calibrada",
}

FFI_COMMENT = "Si dispositivo falla prueba funcional: reemplazar/reparar inmediatamente. No retornar equipo protegido a servicio hasta verificar funcion."

# ═══════════════════════════════════════════════════════════════════════════
# BUDGETED LIFE / SECONDARY ACCESS TIME
# ═══════════════════════════════════════════════════════════════════════════

# Budgeted life estimates by mechanism type (years)
BUDGETED_LIFE = {
    "Desgaste": 3,
    "Corrosion": 5,
    "Degradacion": 5,
    "Agrietamiento": 5,
    "Rotura/Fractura/Separacion": 5,
    "Perdida de precarga": 2,
    "Obstruccion/Bloqueo": 1,
    "Sobrecalentamiento/Fusion": 3,
    "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)": 3,
    "Deformacion": 5,
    "Corte/Desgarro/Perforacion": 3,
    "Arco electrico": 5,
    "Cortocircuito": 5,
    "Circuito abierto": 5,
    "Deriva": 2,
    "Vencimiento/Caducidad": 1,
    "Inmovilizacion (atasque/traba)": 3,
    "Lavado/Erosion por fluido": 2,
}

# Secondary task access time by mechanism complexity (hours)
SECONDARY_ACCESS_TIME = {
    "Desgaste": 4, "Corrosion": 6, "Degradacion": 4,
    "Agrietamiento": 8, "Rotura/Fractura/Separacion": 8,
    "Perdida de precarga": 2, "Obstruccion/Bloqueo": 2,
    "Sobrecalentamiento/Fusion": 6, "Deformacion": 6,
    "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)": 6,
    "Corte/Desgarro/Perforacion": 4,
    "Arco electrico": 6, "Cortocircuito": 6, "Circuito abierto": 4,
    "Deriva": 2, "Vencimiento/Caducidad": 2,
    "Inmovilizacion (atasque/traba)": 4, "Lavado/Erosion por fluido": 4,
}

# ═══════════════════════════════════════════════════════════════════════════
# NEW FM TEMPLATES
# ═══════════════════════════════════════════════════════════════════════════

# New FM templates for auto-generation (Phase 0)
# Each entry: mechanism_es, cause_es, applicable_mi_keywords, evidence, detection_method, failure_pattern
NEW_FM_TEMPLATES = [
    {
        "mechanism": "Arco electrico",
        "cause": "Falla de aislamiento",
        "mi_keywords": ["motor", "transformador", "generador", "bobina", "estator", "rotor"],
        "evidence": "Disminucion de resistencia de aislamiento (>10%/anual), actividad de descargas parciales >100 pC, tendencia tan delta >0.5% sobre baseline",
        "detection_method": "Medicion de resistencia de aislamiento (megger)",
        "failure_pattern": "B",
        "failure_consequence": "OPERACIONAL",
        "partes_falla": "Bobinado",
        "sintomas_falla": "Olores de quemado, descargas visibles, sobrecalentamiento localizado",
        "causas_falla": "Falla de aislamiento",
    },
    {
        "mechanism": "Cortocircuito",
        "cause": "Falla de aislamiento",
        "mi_keywords": ["motor", "transformador", "cable", "contactor", "arrancador"],
        "evidence": "Resistencia de aislamiento <5 MOhm, corriente de fuga elevada, desbalance de fase >5%",
        "detection_method": "Monitoreo de balance de corriente de fase y voltaje",
        "failure_pattern": "B",
        "failure_consequence": "OPERACIONAL",
        "partes_falla": "Aislamiento electrico",
        "sintomas_falla": "Corriente elevada, disparo de protecciones, calentamiento anormal",
        "causas_falla": "Falla de aislamiento",
    },
    {
        "mechanism": "Deriva",
        "cause": "Envejecimiento",
        "mi_keywords": ["sensor", "transmisor", "indicador", "instrumento", "medidor", "analizador"],
        "evidence": "Lecturas con desviacion progresiva >2% del valor de referencia calibrado",
        "detection_method": "Verificacion de calibracion contra referencia patron",
        "failure_pattern": "C",
        "failure_consequence": "NO OPERACIONAL",
        "partes_falla": "Elemento sensor",
        "sintomas_falla": "Lecturas inconsistentes, desviacion gradual de mediciones",
        "causas_falla": "Envejecimiento",
    },
    {
        "mechanism": "Vencimiento/Caducidad",
        "cause": "Envejecimiento",
        "mi_keywords": ["sello", "empaquetadura", "filtro", "membrana", "diafragma", "elastomero", "oring"],
        "evidence": "Perdida de propiedades elasticas, endurecimiento visible, fecha de vencimiento excedida",
        "detection_method": "Ensayo de dureza de componentes elastomericos",
        "failure_pattern": "B",
        "failure_consequence": "NO OPERACIONAL",
        "partes_falla": "Material elastomerico",
        "sintomas_falla": "Fugas incipientes, endurecimiento, agrietamiento superficial",
        "causas_falla": "Envejecimiento",
    },
    {
        "mechanism": "Inmovilizacion (atasque/traba)",
        "cause": "Contaminacion",
        "mi_keywords": ["valvula", "actuador", "cilindro", "compuerta", "damper"],
        "evidence": "Aumento de fuerza/torque requerido para operacion, tiempo de respuesta incrementado >20%",
        "detection_method": "Monitoreo de tiempo de respuesta y fuerza de actuacion",
        "failure_pattern": "C",
        "failure_consequence": "OPERACIONAL",
        "partes_falla": "Mecanismo de actuacion",
        "sintomas_falla": "Operacion lenta, movimiento trabado, ruido anormal al operar",
        "causas_falla": "Contaminacion",
    },
    {
        "mechanism": "Lavado/Erosion por fluido",
        "cause": "Velocidad de fluido excesiva",
        "mi_keywords": ["impulsor", "carcasa", "tuberia", "codo", "nozzle", "boquilla", "impeller"],
        "evidence": "Perdida de espesor de pared en zonas de alta velocidad, patron de erosion direccional visible",
        "detection_method": "Espesor de pared por UT en ubicaciones propensas a erosion",
        "failure_pattern": "C",
        "failure_consequence": "OPERACIONAL",
        "partes_falla": "Superficie interna",
        "sintomas_falla": "Reduccion de eficiencia, fugas incipientes, vibracion por desbalance",
        "causas_falla": "Velocidad de fluido excesiva",
    },
    {
        "mechanism": "Circuito abierto",
        "cause": "Vibracion",
        "mi_keywords": ["conexion", "terminal", "bornera", "cableado", "conector"],
        "evidence": "Resistencia de contacto elevada, puntos calientes en termografia, intermitencia de senal",
        "detection_method": "Monitoreo de temperatura de rodamiento + carga",
        "failure_pattern": "E",
        "failure_consequence": "OPERACIONAL",
        "partes_falla": "Conexion electrica",
        "sintomas_falla": "Intermitencia, calentamiento en terminales, perdida de senal",
        "causas_falla": "Vibracion",
    },
]


# ═══════════════════════════════════════════════════════════════════════════
# TECHNIQUE APPLICABILITY FILTERS (Corrección 4)
# Based on cbm-technique-selection.md — restrict techniques to valid components
# ═══════════════════════════════════════════════════════════════════════════

VIBRATION_APPLICABLE_KEYWORDS = [
    "motor", "bomba", "pump", "reductor", "caja reductora", "gearbox",
    "ventilador", "fan", "compresor", "compressor", "turbina",
    "rodamiento", "cojinete", "bearing", "chumacera", "descanso",
    "acoplamiento", "coupling", "eje", "shaft", "rotor",
    "impulsor", "impeller", "agitador", "centrifuga",
    "transportador", "conveyor", "polea", "tambor",
    "malacate", "hoist", "winch", "grua", "crane",
    "polines", "rodillo",
]

VIBRATION_APPLICABLE_SUBSYSTEMS = [
    "Sistema Motriz", "Sistema de Rodamientos", "Sistema Humedo",
    "Sistema de Transmision", "Sistema de Transporte",
    "Sistema de Refrigeracion",
]

CURRENT_ANALYSIS_KEYWORDS = [
    "motor", "bomba", "compresor", "ventilador", "generador",
]

INSULATION_RESISTANCE_KEYWORDS = [
    "motor", "transformador", "cable", "tablero", "generador",
    "bobina", "estator", "devanado",
]


VIBRATION_EXCLUDED_MI_KEYWORDS = [
    "base", "brida", "camisa", "carcaza", "carcasa", "cuerpo",
    "sello", "empaquetadura", "junta", "oring", "prensaestopa",
    "soporte", "perno", "tuerca", "estructura", "placa",
    "tuberia", "tubería", "cañeria", "cañería", "manguera",
    "conexion", "conexión", "fitting",
    "tapa", "proteccion", "protección", "guarda", "blindaje",
    "revestimiento",
    "tapón", "tapon", "niple", "valvula", "válvula",
    "cable", "bornera", "terminal",
    "panel", "armario", "tablero", "botonera", "selector",
    "sensor", "indicador", "transmisor", "alarma", "sirena",
    "etiquetado", "señalizacion", "señalización", "identificacion",
    "identificación", "pegatina",
    "escalas", "pasamanos", "grating", "puerta", "chapa",
    "pintura", "lubricador", "filtro aire", "filtro aceite",
    "luz", "luces", "conduit", "canalizacion", "canalización",
    "regleta",
    "seguros", "modulo", "módulo", "integrador", "split",
    "abrazadera",
    "anillo", "empalme", "conector", "contacto", "superficie",
    "aspersor", "bandeja", "caja", "mesa", "piola",
    "raspador", "espolon", "espolón", "placa espolon", "taco",
    "freno", "amortiguad",
    "cinta", "correa", "faja",  # belt itself — not measured with accelerometer
    "polin", "polín", "polines", "estación polín", "estacion polin",
]


def is_vibration_applicable(mi_name, subsystem, equip_name="", what=""):
    """Vibration analysis applies only to the MI itself being rotative/mechanical.

    Even if the equipment is a pump or motor, vibration doesn't apply to its
    static components (base, brida, carcasa, sellos, etc.).
    The MI name is the primary discriminator.
    """
    mi_lower = str(mi_name).lower()
    # First check exclusions: static components even on rotating equipment
    if any(kw in mi_lower for kw in VIBRATION_EXCLUDED_MI_KEYWORDS):
        return False
    # Then check if MI itself is a rotative/mechanical component
    if any(kw in mi_lower for kw in VIBRATION_APPLICABLE_KEYWORDS):
        return True
    if subsystem in VIBRATION_APPLICABLE_SUBSYSTEMS:
        return True
    return False


def _mi_has(mi_name, keywords):
    """Check if MI name contains any keyword."""
    mi_lower = str(mi_name).lower()
    return any(kw in mi_lower for kw in keywords)


TECHNIQUE_APPLICABILITY = {
    "vibracion": is_vibration_applicable,

    "corriente": lambda mi, sub, eq, w: _mi_has(
        f"{mi} {eq}", CURRENT_ANALYSIS_KEYWORDS),

    "resistencia de aislamiento": lambda mi, sub, eq, w: _mi_has(
        f"{mi} {eq}", INSULATION_RESISTANCE_KEYWORDS),

    "mpi": lambda mi, sub, eq, w: _mi_has(mi, [
        "eje", "shaft", "estructura", "viga", "columna", "bastidor",
        "chasis", "soldadura", "tambor",
    ]),

    "torque": lambda mi, sub, eq, w: _mi_has(mi, [
        "perno", "brida", "acoplamiento", "union", "unión",
        "conexion", "conexión", "tuerca", "esparrago", "espárrago",
        "tornillo",
    ]),

    "espesor": lambda mi, sub, eq, w: _mi_has(mi, [
        "tuberia", "tubería", "cañeria", "cañería", "carcaza", "carcasa",
        "cuerpo", "camisa", "tambor", "vasija", "tanque", "deposito",
        "depósito", "chute", "tolva", "impulsor", "impeller", "voluta",
    ]),

    "estructural": lambda mi, sub, eq, w: _mi_has(mi, [
        "estructura", "bastidor", "chasis", "viga", "columna",
        "soportación", "soportacion", "marco",
    ]),

    "cable de acero": lambda mi, sub, eq, w: _mi_has(mi, [
        "cable", "eslinga", "piola",
    ]),

    "dureza": lambda mi, sub, eq, w: _mi_has(mi, [
        "sello", "empaquetadura", "oring", "membrana", "diafragma",
        "correa", "cinta", "faja", "revestimiento",
    ]) or sub == "Sistema de Sellado",

    "temperatura": lambda mi, sub, eq, w: _mi_has(mi, [
        "motor", "rodamiento", "cojinete", "tablero", "conexion", "conexión",
        "bornera", "terminal", "cable", "transformador", "contactor",
        "disyuntor", "interruptor", "polin", "polín", "polines",
    ]) or sub in ["Sistema Electrico", "Sistema Motriz", "Sistema de Rodamientos"],

    "presion diferencial": lambda mi, sub, eq, w: _mi_has(mi, [
        "filtro", "intercambiador", "strainer", "colador",
    ]),

    "calibracion": lambda mi, sub, eq, w: _mi_has(mi, [
        "sensor", "transmisor", "indicador", "medidor", "analizador",
        "instrumento", "celda", "pesometro", "pesómetro",
    ]) or sub == "Sistema de Instrumentacion",

    "tiempo de respuesta": lambda mi, sub, eq, w: _mi_has(mi, [
        "valvula", "válvula", "actuador", "switch", "presostato",
        "detector", "rele", "relay",
    ]),
}

# ═══════════════════════════════════════════════════════════════════════════
# VIBRATION EQUIPMENT KEYWORDS
# ═══════════════════════════════════════════════════════════════════════════

# Map equipment-level keywords to vibration task name component
VIBRATION_EQUIP_KEYWORDS = {
    "motor": "motor", "bomba": "bomba", "pump": "bomba",
    "reductor": "reductor", "caja reductora": "reductor",
    "ventilador": "ventilador", "fan": "ventilador",
    "compresor": "compresor", "turbina": "turbina",
    "agitador": "agitador", "centrifuga": "centrifuga",
    "malacate": "malacate", "grua": "grua", "crane": "grua",
    "transportador": "transportador", "conveyor": "transportador",
    "correa": "transportador", "faja": "transportador",
    "chancador": "chancador", "crusher": "chancador",
    "molino": "molino", "mill": "molino",
    "harnero": "harnero", "screen": "harnero",
    "celda": "celda de flotacion",
}


# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def get_criticality_key(abckz):
    """Convert abckz (1.0, 2.0, 3.0) to criticality key (A, B, C)."""
    if abckz == 1 or abckz == 1.0:
        return "A"
    elif abckz == 2 or abckz == 2.0:
        return "B"
    return "C"


def is_hidden_failure(mi_name):
    """Check if maintainable item is a protective/hidden device."""
    mi_lower = str(mi_name).lower()
    return any(kw in mi_lower for kw in HIDDEN_KEYWORDS)


def detect_cbm_technique(detection_method, mi_name="", subsystem="", equip_name="", what=""):
    """Map detection_method to a DETECTION_MAP key, filtering by component applicability.

    Uses equipment context (mi_name, subsystem, equip_name, what) to reject
    techniques that are not applicable to the specific component.
    Falls back to "visual" when no specific technique applies — because visual
    inspection "por {mecanismo}" is always applicable.
    """
    dm_lower = "" if pd.isna(detection_method) else str(detection_method).strip().lower()
    # Map both Spanish and English keywords to DETECTION_MAP keys
    KEYWORD_TO_TECHNIQUE = [
        # (keyword_in_detection_method, technique_key_in_DETECTION_MAP)
        # Spanish keywords
        ("resistencia de aislamiento", "resistencia de aislamiento"),
        ("calibracion", "calibracion"),
        ("tiempo de respuesta", "tiempo de respuesta"),
        ("presion diferencial", "presion diferencial"),
        ("cable de acero", "cable de acero"),
        ("estructural", "estructural"),
        ("espesor", "espesor"),
        ("dureza", "dureza"),
        ("mpi", "mpi"),
        ("torque", "torque"),
        ("corriente", "corriente"),
        ("temperatura", "temperatura"),
        ("termografia", "temperatura"),
        ("vibracion", "vibracion"),
        # English keywords from FM-MASTER
        ("insulation resistance", "resistencia de aislamiento"),
        ("megger", "resistencia de aislamiento"),
        ("calibration", "calibracion"),
        ("response time", "tiempo de respuesta"),
        ("differential pressure", "presion diferencial"),
        ("wire rope", "cable de acero"),
        ("structural survey", "estructural"),
        ("ut thickness", "espesor"),
        ("wall thickness", "espesor"),
        ("hardness", "dureza"),
        ("magnetic particle", "mpi"),
        ("dye penetrant", "mpi"),
        ("dpi", "mpi"),
        ("torque audit", "torque"),
        ("bolt tension", "torque"),
        ("current monitor", "corriente"),
        ("current signature", "corriente"),
        ("phase current", "corriente"),
        ("thermograph", "temperatura"),
        ("thermal scan", "temperatura"),
        ("temperature monitor", "temperatura"),
        ("bearing temperature", "temperatura"),
        ("vibration", "vibracion"),
        ("oil analysis", "visual"),     # no oil entry in DETECTION_MAP → visual
        ("oil particle", "visual"),
        ("load monitor", "visual"),
        ("dimensional", "visual"),
        ("coating", "visual"),
        ("liner thickness", "visual"),
        ("suction pressure", "visual"),
        ("ambient temperature", "visual"),
    ]
    for keyword, technique_key in KEYWORD_TO_TECHNIQUE:
        if keyword in dm_lower:
            if technique_key in TECHNIQUE_APPLICABILITY:
                check_fn = TECHNIQUE_APPLICABILITY[technique_key]
                if not check_fn(mi_name, subsystem, equip_name, what):
                    continue
            return technique_key
    # Fallback: visual inspection is ALWAYS applicable
    return "visual"


# ═══════════════════════════════════════════════════════════════════════════
# VISUAL INSPECTION: ACCEPTABLE LIMITS PER MECHANISM
# Each mechanism has specific limits describing what to look for
# ═══════════════════════════════════════════════════════════════════════════

VISUAL_LIMITS_BY_MECHANISM = {
    "corrosion": "Sin evidencia de corrosion, picaduras, oxidacion o perdida de espesor por ataque quimico/ambiental",
    "desgaste": "Sin evidencia de desgaste anormal, rayaduras, surcos, perdida de material o reduccion de espesor en superficies de contacto",
    "agrietamiento": "Sin grietas, fisuras o propagacion de defectos visibles en superficie; soldaduras sin indicaciones lineales",
    "perdida de precarga": "Pernos/tuercas apretados a especificacion, marcas testigo alineadas, sin holgura perceptible al tacto",
    "deformacion": "Sin deformacion, pandeo, flexion permanente o desviacion geometrica respecto a la forma original",
    "rotura/fractura/separacion": "Sin roturas, fracturas, separacion de componentes o perdida de integridad estructural",
    "corte/desgarro/perforacion": "Sin cortes, desgarros, perforaciones o daño mecanico en superficie; material continuo e integro",
    "sobrecalentamiento/fusion": "Sin decoloracion termica, marcas de quemadura, fusion parcial o deformacion por calor excesivo",
    "sobrecarga termica (quemadura/sobrecalentamiento/fusion)": "Sin decoloracion termica, marcas de quemadura, fusion parcial o deformacion por calor excesivo",
    "obstruccion/bloqueo": "Flujo libre sin obstrucciones, acumulacion de material o restricciones al paso de fluido/material",
    "arco electrico": "Sin marcas de arco, quemaduras en contactos, erosion de superficie o depositos carbonizados",
    "cortocircuito": "Sin evidencia de cortocircuito, aislamiento integro, sin marcas de quemadura en conductores",
    "circuito abierto": "Conexiones firmes, sin cables sueltos, terminales sin corrosion, continuidad electrica verificable",
    "deriva": "Lectura dentro de +/-2% del valor de referencia calibrado, sin desviacion progresiva",
    "vencimiento/caducidad": "Componente dentro de fecha de vida util, sin endurecimiento, agrietamiento o perdida de propiedades",
    "inmovilizacion (atasque/traba)": "Movimiento libre sin restricciones, sin trabas, operacion suave dentro del rango completo",
    "lavado/erosion por fluido": "Sin evidencia de erosion por fluido, patron de desgaste direccional o perdida de material en zonas de alta velocidad",
}

VISUAL_COMMENTS_BY_MECHANISM = {
    "corrosion": "Si se observa corrosion activa o perdida de espesor: documentar extension, fotografiar, reportar a supervisor para evaluar necesidad de tratamiento/reemplazo.",
    "desgaste": "Si desgaste excede tolerancia OEM o afecta funcion: programar reemplazo. Si desgaste menor: monitorear progresion en proxima inspeccion.",
    "agrietamiento": "Si se detectan grietas: marcar extremos, medir longitud, reportar inmediatamente. No retornar a servicio sin evaluacion de ingenieria.",
    "perdida de precarga": "Si marca testigo desalineada o perno suelto: reapretar a torque especificado. Si multiples pernos afectados: evaluar causa raiz (vibracion, fatiga).",
    "deformacion": "Si deformacion afecta funcion o alineacion: retirar de servicio para evaluacion. Si menor y no afecta operacion: monitorear progresion.",
    "rotura/fractura/separacion": "Si se detecta rotura o fractura: retirar de servicio inmediatamente. No operar hasta reemplazo o reparacion autorizada por ingenieria.",
    "corte/desgarro/perforacion": "Si daño compromete integridad: retirar de servicio. Si superficial: documentar y monitorear en proxima inspeccion.",
    "sobrecalentamiento/fusion": "Si marcas de sobrecalentamiento: reducir carga, investigar causa. Si fusion parcial: retirar de servicio inmediatamente.",
    "obstruccion/bloqueo": "Si obstruccion parcial: limpiar y verificar flujo. Si obstruccion recurrente: evaluar causa raiz y frecuencia de limpieza.",
}


def get_visual_limits(mechanism):
    """Get acceptable limits specific to the failure mechanism for visual inspection."""
    mech_lower = str(mechanism).lower().strip()
    return VISUAL_LIMITS_BY_MECHANISM.get(
        mech_lower,
        f"Sin evidencia visible de {mech_lower} o deterioro asociado"
    )


def get_visual_comments(mechanism):
    """Get conditional comments specific to the failure mechanism for visual inspection."""
    mech_lower = str(mechanism).lower().strip()
    return VISUAL_COMMENTS_BY_MECHANISM.get(
        mech_lower,
        f"Si se observa {mech_lower}: documentar extension, fotografiar, reportar a supervisor para evaluar accion correctiva."
    )


def format_mi(mi_name):
    """Format MI name for task descriptions: all lowercase.

    The verb at the start of the task name provides the capital letter.
    MI names are always lowercase: 'Inspeccionar abrazaderas por corrosion'
    Exception: SAP tags (all-caps alphanumeric like 1210PU0001) stay as-is.
    """
    s = str(mi_name).strip()
    if not s:
        return s
    return s.lower()


def truncate_task_name(name, max_len=72):
    """Truncate task name to max 72 characters per SAP T-18.

    Ensures the mechanism/technique part (after 'por ') is never cut.
    Truncates the MI name if needed.
    """
    if len(name) <= max_len:
        return name
    # For visual: "Inspeccionar {mi} por {mechanism}" — keep mechanism intact
    por_match = re.search(r' por (.+)$', name)
    if por_match:
        suffix = por_match.group()  # " por corrosion"
        prefix = name[:por_match.start()]  # "Inspeccionar {mi}"
        avail = max_len - len(suffix)
        if avail > 15:
            return prefix[:avail] + suffix
    # For FFI with tag: keep [tag] intact
    tag_match = re.search(r'\[.+\]$', name)
    if tag_match:
        tag = tag_match.group()
        prefix_max = max_len - len(tag) - 1
        return name[:prefix_max] + " " + tag
    return name[:max_len - 3] + "..."


# Measurable rotary assemblies where vibration accelerometers are installed
VIBRATION_MEASURABLE_ASSEMBLIES = [
    "motor", "motoreductor", "reductor", "bomba", "pump",
    "compresor", "ventilador", "turbina", "agitador",
    "descanso", "descansos", "chumacera",
    "polea", "poleas", "tambor",
]

# Internal subcomponents — vibration is measured at the CONTAINING assembly
VIBRATION_INTERNAL_TO_ASSEMBLY = {
    # MI keyword → assembly where vibration is actually measured
    "rodamiento": None,   # measured at the descanso/motor that contains it
    "cojinete": None,
    "eje": None,          # measured at the descansos that support it
    "impulsor": None,     # measured at the bomba/motor that drives it
    "impeller": None,
    "rotor": None,        # measured at the motor
    "acoplamiento": None, # measured at the motor/reductor it connects
    "engranaje": None,    # measured at the reductor
}


def get_vibration_target(mi, equip_name):
    """For vibration analysis, determine the measurable assembly name.

    Vibration accelerometers are installed on MEASURABLE ASSEMBLIES:
    motor, motoreductor, reductor, bomba, descansos, poleas, tambor.

    Internal subcomponents (rodamientos, eje, impulsor) are NOT where you
    name the task — the task is named after the assembly that CONTAINS them.
    If the MI is already a measurable assembly, use it directly.
    If internal, try to infer from equipment name. If can't, use the MI.
    """
    mi_lower = str(mi).lower()

    # If MI itself IS a measurable assembly → use it
    for kw in VIBRATION_MEASURABLE_ASSEMBLIES:
        if kw in mi_lower:
            return format_mi(mi)

    # If MI is an internal subcomponent → try equipment name for assembly
    for kw in VIBRATION_INTERNAL_TO_ASSEMBLY:
        if kw in mi_lower:
            eq_lower = str(equip_name).lower()
            # Try to find the containing assembly from equipment name
            if "bomba" in eq_lower or "pump" in eq_lower:
                return "bomba"
            if "motor" in eq_lower:
                return "motor"
            if "reductor" in eq_lower or "motoreductor" in eq_lower:
                return "reductor"
            if "ventilador" in eq_lower:
                return "ventilador"
            if "compresor" in eq_lower:
                return "compresor"
            # For conveyor/crusher — subcomponents get measured at descansos
            return "descansos"

    return format_mi(mi)


MECHANISM_SHORT_NAMES = {
    "sobrecarga termica (quemadura/sobrecalentamiento/fusion)": "sobrecarga termica",
    "rotura/fractura/separacion": "rotura/fractura",
    "corte/desgarro/perforacion": "corte/desgarro",
    "inmovilizacion (atasque/traba)": "inmovilizacion",
    "lavado/erosion por fluido": "erosion por fluido",
}


def shorten_mechanism(mechanism):
    """Abbreviate long mechanism names for task descriptions."""
    mech_lower = str(mechanism).lower().strip()
    return MECHANISM_SHORT_NAMES.get(mech_lower, mech_lower)


def build_cb_task_name(technique_key, mi, tag, mechanism, equip_name=""):
    """Build primary task name for CONDITION_BASED.

    Visual: 'Inspeccionar {mi} por {mechanism}'
    Vibration: 'Realizar analisis de vibracion en {equip_type}' (equipment level)
    Other tech: '{verb} {mi}'
    All MI names in lowercase except first letter.
    """
    mi_fmt = format_mi(mi)
    info = DETECTION_MAP[technique_key]
    if technique_key == "visual":
        mech_lower = shorten_mechanism(mechanism)
        name = f"Inspeccionar {mi_fmt} por {mech_lower}"
    elif technique_key == "vibracion":
        target = get_vibration_target(mi, equip_name)
        name = f"Realizar analisis de vibracion en {target}"
    else:
        verb = info["verb"]
        name = f"{verb} {mi_fmt}"
    return truncate_task_name(name)


def build_ft_task_name(mechanism, mi, tag):
    """Build primary task name for FIXED_TIME."""
    verb = FT_VERB.get(mechanism, "Reemplazar")
    name = f"{verb} {format_mi(mi)}"
    return truncate_task_name(name)


def build_ffi_task_name(mi, tag):
    """Build primary task name for FAULT_FINDING — con [sap_func_loc_short]."""
    name = f"Verificar funcionamiento de {format_mi(mi)} [{tag}]"
    return truncate_task_name(name)


def build_secondary_task_name(mechanism, mi, tag):
    """Build secondary task name."""
    verb, _ = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
    name = f"{verb} {format_mi(mi)}"
    return truncate_task_name(name)


def get_ffi_limits(mi_name):
    """Get FFI acceptable limits based on device type."""
    mi_lower = str(mi_name).lower()
    for key, limits in FFI_LIMITS.items():
        if key in mi_lower:
            return limits
    return "Dispositivo responde dentro de especificaciones de diseno OEM segun criterio de aceptacion aplicable"


def assign_tactics_type(row, abckz_map):
    """RCM decision tree per Moubray to assign tactics_type.

    Uses equipment_name, maintainable_item, and fm_what to evaluate
    whether a CBM technique is truly applicable to the component.
    When CBM is viable, ALWAYS prefer CB over FT (Moubray §12.2).
    FT only when CBM is not viable AND pattern is age-related.
    """
    mi = str(row.get("maintainable_item", ""))
    what = str(row.get("fm_what", ""))
    equip_name = str(row.get("equipment_name", ""))
    detection = row.get("detection_method", "")
    consequence = str(row.get("failure_consequence", ""))
    pattern = str(row.get("failure_pattern", ""))
    rpn = row.get("rpn_total", 0)
    tag = str(row.get("equipment_tag", ""))
    crit = get_criticality_key(abckz_map.get(tag, 3))
    subsystem = classify_subsystem(mi)

    # Step 1: Hidden failure → FAULT_FINDING
    if is_hidden_failure(mi):
        return "FAULT_FINDING"

    # Step 2: CBM technically viable? (passes equipment context for filtering)
    technique = detect_cbm_technique(detection, mi, subsystem, equip_name, what)

    if technique is not None:
        # CBM IS viable → ALWAYS prefer CB over FT (Moubray §12.2)
        tech_info = DETECTION_MAP.get(technique, {})
        is_online = tech_info.get("constraint") == "ONLINE"

        if consequence == "OPERACIONAL":
            return "CONDITION_BASED"

        # NO OPERACIONAL
        if crit == "A":
            return "CONDITION_BASED"
        elif crit == "B":
            if is_online or rpn >= 60:
                return "CONDITION_BASED"
            else:
                return "RUN_TO_FAILURE"
        else:  # crit C
            if is_online and rpn >= 50:
                return "CONDITION_BASED"
            elif not is_online and rpn >= 100:
                return "CONDITION_BASED"
            else:
                return "RUN_TO_FAILURE"

    # Step 3: CBM NOT viable (no detection method or technique not applicable)
    # FT only if: age-related pattern AND consequence justifies it
    if pattern in ("B", "C"):
        if consequence == "OPERACIONAL":
            return "FIXED_TIME"
        elif crit in ("A", "B"):
            return "FIXED_TIME"
        else:
            return "RUN_TO_FAILURE"

    if pattern == "A" and (consequence == "OPERACIONAL" or crit == "A"):
        return "FIXED_TIME"

    # Patterns D, E, F → NEVER FT
    return "RUN_TO_FAILURE"


def deduplicate_tasks(df_strat):
    """Post-processing: ensure same task on same equipment has consistent frequency.

    For each (sap_func_loc_short, primary_task_name) group with multiple intervals,
    unify to the most conservative (minimum) interval and its task_id.
    """
    print("\n  Deduplicando frecuencias por equipo...")
    mask = df_strat["primary_task_name"].notna()
    groups = df_strat[mask].groupby(["sap_func_loc_short", "primary_task_name"])

    fixes = 0
    for (tag, task_name), grp in groups:
        intervals = grp["primary_task_interval"].dropna().unique()
        if len(intervals) <= 1:
            continue
        min_interval = intervals.min()
        min_task_id = grp.loc[grp["primary_task_interval"] == min_interval, "primary_task_id"].iloc[0]
        idx_to_fix = grp.index[grp["primary_task_interval"] != min_interval]
        df_strat.loc[idx_to_fix, "primary_task_interval"] = min_interval
        df_strat.loc[idx_to_fix, "primary_task_id"] = min_task_id
        fixes += len(idx_to_fix)

    print(f"    {fixes} filas ajustadas a frecuencia mas conservadora")
    return df_strat


# ═══════════════════════════════════════════════════════════════════════════
# GFSN OPERATIONAL CONTEXT (Goldfields Salares Norte)
# Drivers from client/goldfields-salares-norte/06-maintenance-strategy-drivers.md
# These modify RCM decisions based on the specific plant context
# ═══════════════════════════════════════════════════════════════════════════

GFSN_CONTEXT = {
    "D1_ALTITUDE_INTERVAL_FACTOR": 0.75,
    "D2_SWAPOUT_ENABLED": True,
    "D3_OFFLINE_MONTHS": [10, 11, 12, 1, 2, 3],
    "D4_WINTERIZATION_MONTH": 3,
    "D5_MATERIAL_SPECS": {
        "elastomers": ["HNBR", "FKM"],
        "lubricants": "full_synthetic_cold_rated",
        "coatings": "polyurethane_uv_resistant",
        "steel_charpy": -30,
    },
    "D6_MOTOR_DERATING_SEVERITY": "HIGH",
    "D7_UV_DEGRADATION_FACTOR": 0.60,
}


def apply_altitude_factor(interval, is_uv_exposed=False):
    """Apply GFSN altitude/UV factor to a standard interval.

    D1: All intervals reduced by 25% (factor 0.75)
    D7: UV-exposed components further reduced to 60% of standard
    """
    if is_uv_exposed:
        return max(1, round(interval * GFSN_CONTEXT["D7_UV_DEGRADATION_FACTOR"]))
    return max(1, round(interval * GFSN_CONTEXT["D1_ALTITUDE_INTERVAL_FACTOR"]))
