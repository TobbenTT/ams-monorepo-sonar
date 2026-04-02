"""
build_maintenance_strategy_construction.py
==========================================
Construye la tabla de estrategia de mantenimiento (14_maintenance_strategy_construction.xlsx)
a partir de 03_failure_modes.xlsx, aplicando logica RCM para asignar:
  - tactics_type (CONDITION_BASED, FIXED_TIME, FAULT_FINDING, RUN_TO_FAILURE)
  - primary/secondary tasks con naming standards
  - intervalos basados en P-F interval y criticidad
  - acceptable limits con referencia a normas
  - conditional comments

Siguiendo:
  - task-naming-standards.md (Sections A-E)
  - cbm-technique-selection.md (Sections 2-5)
  - maintenance-strategy-examples.md (benchmarks reales)
  - rcm2-moubray-methodology (arbol de decision RCM)
"""
import pandas as pd
import numpy as np
import os
import re
import time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(BASE, "seed_data")
np.random.seed(42)

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


def detect_cbm_technique(detection_method):
    """Map detection_method string to a DETECTION_MAP key."""
    if pd.isna(detection_method) or str(detection_method).strip() == "":
        return None
    dm_lower = str(detection_method).lower()
    # Order matters: check specific patterns first
    for key in ["resistencia de aislamiento", "calibracion", "tiempo de respuesta",
                 "presion diferencial", "cable de acero", "estructural",
                 "espesor", "dureza", "mpi", "torque", "corriente",
                 "temperatura", "vibracion", "visual"]:
        if key in dm_lower:
            return key
    return None


def truncate_task_name(name, max_len=72):
    """Truncate task name to max 72 characters per SAP T-18."""
    if len(name) <= max_len:
        return name
    # Try to keep the tag at the end
    tag_match = re.search(r'\[.+\]$', name)
    if tag_match:
        tag = tag_match.group()
        prefix_max = max_len - len(tag) - 4  # "... "
        return name[:prefix_max] + "... " + tag
    return name[:max_len - 3] + "..."


def build_cb_task_name(technique_key, mi, tag, mechanism):
    """Build primary task name for CONDITION_BASED.
    Visual: 'Inspeccionar {what} por {mechanism}' — sin tag
    Tecnico: 'Realizar {tecnica} en {what}' — sin tag
    """
    info = DETECTION_MAP[technique_key]
    if technique_key == "visual":
        mech_lower = str(mechanism).lower()
        name = f"Inspeccionar {mi} por {mech_lower}"
    else:
        verb = info["verb"]
        name = f"{verb} {mi}"
    return truncate_task_name(name)


def build_ft_task_name(mechanism, mi, tag):
    """Build primary task name for FIXED_TIME — sin tag."""
    verb = FT_VERB.get(mechanism, "Reemplazar")
    name = f"{verb} {mi}"
    return truncate_task_name(name)


def build_ffi_task_name(mi, tag):
    """Build primary task name for FAULT_FINDING — con [sap_func_loc_short]."""
    name = f"Verificar funcionamiento de {mi} [{tag}]"
    return truncate_task_name(name)


def build_secondary_task_name(mechanism, mi, tag):
    """Build secondary task name — sin tag."""
    verb, _ = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
    name = f"{verb} {mi}"
    return truncate_task_name(name)


def get_ffi_limits(mi_name):
    """Get FFI acceptable limits based on device type."""
    mi_lower = str(mi_name).lower()
    for key, limits in FFI_LIMITS.items():
        if key in mi_lower:
            return limits
    return "Dispositivo responde dentro de especificaciones de diseno OEM segun criterio de aceptacion aplicable"


def assign_tactics_type(row, abckz_map):
    """RCM decision tree to assign tactics_type."""
    mi = str(row.get("maintainable_item", ""))
    detection = row.get("detection_method", "")
    consequence = str(row.get("failure_consequence", ""))
    pattern = str(row.get("failure_pattern", ""))
    rpn = row.get("rpn_total", 0)
    tag = str(row.get("equipment_tag", ""))
    crit = get_criticality_key(abckz_map.get(tag, 3))

    # Step 1: Hidden failure?
    if is_hidden_failure(mi):
        return "FAULT_FINDING"

    # Step 2: CBM feasible? (When monitoring is available, prefer CB per Moubray)
    technique = detect_cbm_technique(detection)
    if technique is not None:
        tech_info = DETECTION_MAP.get(technique, {})
        is_online = tech_info.get("constraint") == "ONLINE"

        if consequence == "OPERACIONAL":
            return "CONDITION_BASED"
        else:  # NO OPERACIONAL
            if crit == "A":
                return "CONDITION_BASED"
            elif crit == "B":
                # Medium criticality: CB preferred for most items
                if is_online or rpn >= 100:
                    return "CONDITION_BASED"
                elif pattern in ("B", "C"):
                    return "FIXED_TIME"
                else:
                    return "RUN_TO_FAILURE"
            else:  # crit == "C"
                # Low criticality: CB for online techniques (zero marginal cost)
                # FT only when monitoring requires offline access AND low RPN
                if is_online:
                    if rpn >= 80:
                        return "CONDITION_BASED"
                    elif pattern in ("B", "C"):
                        return "FIXED_TIME"
                    else:
                        return "RUN_TO_FAILURE"
                else:  # OFFLINE technique
                    if rpn >= 150:
                        return "CONDITION_BASED"
                    elif pattern in ("B", "C"):
                        return "FIXED_TIME"
                    else:
                        return "RUN_TO_FAILURE"

    # Step 3: No CBM feasible
    if pattern in ("B", "C"):
        return "FIXED_TIME"
    if consequence == "OPERACIONAL" and crit in ("A", "B"):
        return "FIXED_TIME"
    return "RUN_TO_FAILURE"


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0: AUTO-GENERATE MISSING FMs
# ═══════════════════════════════════════════════════════════════════════════

def phase0_generate_missing_fms(df03, df01):
    """Identify and generate missing failure modes for equipment in 03."""
    print("\n" + "=" * 70)
    print("FASE 0: Auto-generacion de modos de falla faltantes")
    print("=" * 70)

    # Existing mechanisms in 03
    existing_mechanisms = set(df03["fm_mechanism"].dropna().unique())
    print(f"Mecanismos existentes en 03: {len(existing_mechanisms)}")
    for m in sorted(existing_mechanisms):
        print(f"  - {m}")

    # Build equipment lookup
    equip_info = {}
    for _, row in df01[df01["equnr"].notna()].iterrows():
        tag = str(row["sap_func_loc_short"])
        equip_info[tag] = {
            "sap_func_loc": row.get("sap_func_loc", ""),
            "eqktx": row.get("eqktx", ""),
            "equnr": row.get("equnr", ""),
            "eqart": str(row.get("eqart", "")),
        }

    # For each FM template, find applicable equipment that's missing this mechanism
    new_rows = []
    fm_counter = 200000  # Start new FM numbers high to avoid collisions

    for tmpl in NEW_FM_TEMPLATES:
        mechanism = tmpl["mechanism"]
        cause = tmpl["cause"]

        # Find equipment tags in 03 that have maintainable items matching keywords
        # but DON'T have this mechanism
        tags_with_mechanism = set(
            df03[df03["fm_mechanism"] == mechanism]["equipment_tag"].unique()
        )

        # Find candidate tags by MI keywords
        mi_pattern = "|".join(tmpl["mi_keywords"])
        candidates = df03[
            df03["maintainable_item"].str.lower().str.contains(mi_pattern, na=False)
            & ~df03["equipment_tag"].isin(tags_with_mechanism)
        ]

        # Get unique (tag, subunit, MI) combos
        candidate_combos = candidates.drop_duplicates(
            subset=["equipment_tag", "subunit", "maintainable_item"]
        )[["equipment_tag", "subunit", "maintainable_item",
           "sap_func_loc", "sap_func_loc_short", "equipment_name", "equnr",
           "area", "equipment_function_description", "equipment_functional_failure",
           "function_type", "failure_type",
           "maintainable_item_function_description", "maintainable_item_functional_failure"]]

        added = 0
        for _, cand in candidate_combos.iterrows():
            fm_counter += 1
            new_rows.append({
                "equipment_tag": cand["equipment_tag"],
                "equnr": cand["equnr"],
                "sap_func_loc": cand["sap_func_loc"],
                "sap_func_loc_short": cand["sap_func_loc_short"],
                "equipment_name": cand["equipment_name"],
                "area": cand.get("area", ""),
                "equipment_function_description": cand["equipment_function_description"],
                "equipment_functional_failure": cand["equipment_functional_failure"],
                "function_type": cand.get("function_type", "PRIMARY"),
                "failure_type": cand.get("failure_type", "PARTIAL"),
                "subunit": cand["subunit"],
                "maintainable_item": cand["maintainable_item"],
                "maintainable_item_function_description": cand["maintainable_item_function_description"],
                "maintainable_item_functional_failure": cand["maintainable_item_functional_failure"],
                "partes_falla": tmpl["partes_falla"],
                "sintomas_falla": tmpl["sintomas_falla"],
                "causas_falla": tmpl["causas_falla"],
                "fm_what": cand["maintainable_item"],
                "fm_mechanism": mechanism,
                "fm_cause": cause,
                "fm_number": f"FM-{fm_counter}",
                "failure_pattern": tmpl["failure_pattern"],
                "failure_consequence": tmpl["failure_consequence"],
                "evidence": tmpl["evidence"],
                "downtime_hours": np.random.choice([0.5, 1, 2, 4, 8]),
                "detection_method": tmpl["detection_method"],
                "rpn_severity": np.random.randint(3, 8),
                "rpn_occurrence": np.random.randint(3, 7),
                "rpn_detection": np.random.randint(3, 7),
                "rpn_total": 0,  # Will be calculated
            })
            added += 1

        if added > 0:
            print(f"  {mechanism} / {cause}: {added} nuevos FMs generados")

    if not new_rows:
        print("  No se generaron FMs nuevos.")
        return df03

    df_new = pd.DataFrame(new_rows)
    df_new["rpn_total"] = df_new["rpn_severity"] * df_new["rpn_occurrence"] * df_new["rpn_detection"]

    print(f"\nTotal nuevos FMs: {len(df_new)}")
    print(f"Distribucion por mecanismo:")
    print(df_new["fm_mechanism"].value_counts().to_string())

    # Concatenate with original
    df03_extended = pd.concat([df03, df_new], ignore_index=True)
    print(f"\n03 original: {len(df03)} rows -> extendido: {len(df03_extended)} rows")

    return df03_extended


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1-2: BUILD STRATEGY TABLE
# ═══════════════════════════════════════════════════════════════════════════

def build_strategy_table(df03, abckz_map, equip_name_map):
    """Build the 38-column strategy construction table."""
    print("\n" + "=" * 70)
    print("FASE 1-2: Construccion de tabla de estrategia")
    print("=" * 70)

    n = len(df03)
    print(f"Procesando {n} modos de falla...")

    # Pre-compute criticality for all rows
    df03["_crit"] = df03["equipment_tag"].map(
        lambda t: get_criticality_key(abckz_map.get(str(t), 3))
    )

    # Assign tactics_type
    print("  Asignando tactics_type...")
    t0 = time.time()
    tactics_list = []
    for _, row in df03.iterrows():
        tactics_list.append(assign_tactics_type(row, abckz_map))
    df03["_tactics"] = tactics_list
    print(f"    Completado en {time.time() - t0:.1f}s")

    # Detect CBM technique for each row
    df03["_technique"] = df03["detection_method"].apply(detect_cbm_technique)

    # Build output columns
    print("  Generando columnas de estrategia...")
    t0 = time.time()

    results = []
    task_counter = 0

    for idx, row in df03.iterrows():
        tag = str(row["equipment_tag"])
        mi = str(row["maintainable_item"])
        mechanism = str(row["fm_mechanism"])
        tactics = row["_tactics"]
        technique = row["_technique"]
        crit = row["_crit"]

        # strategy_id
        strategy_id = f"S-{idx + 1:06d}"

        # function_and_failure
        mi_func = str(row.get("maintainable_item_function_description", ""))
        mi_fail = str(row.get("maintainable_item_functional_failure", ""))
        func_and_fail = f"{mi_func} | {mi_fail}" if mi_func and mi_func != "nan" else ""

        # Initialize task fields
        p_task_id = None
        p_task_name = None
        p_task_interval = None
        p_op_units = None
        p_time_units = None
        p_limits = None
        p_comment = None
        p_constraint = None
        p_task_type = None
        p_access_time = None

        s_task_id = None
        s_task_name = None
        s_constraint = "OFFLINE"
        s_task_type = None
        s_access_time = None
        s_comments = None

        budgeted_as = None
        budgeted_life = None
        budgeted_life_tu = None
        budgeted_life_ou = None

        if tactics == "CONDITION_BASED":
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"

            if technique and technique in DETECTION_MAP:
                info = DETECTION_MAP[technique]
                p_task_name = build_cb_task_name(technique, mi, tag, mechanism)
                p_task_interval = info["interval"].get(crit, info["interval"]["B"])
                p_time_units = info["time_units"]
                p_op_units = None
                p_limits = info["limits"]
                p_comment = info["comment"]
                p_constraint = info["constraint"]
                p_task_type = info["task_type"]
                p_access_time = info["access_time"]
            else:
                # Fallback for CB without mapped technique
                mech_lower = str(mechanism).lower()
                p_task_name = truncate_task_name(f"Inspeccionar {mi} por {mech_lower}")
                p_task_interval = {"A": 2, "B": 4, "C": 8}.get(crit, 4)
                p_time_units = "WEEKS"
                p_limits = "Sin evidencia visible de deterioro o anomalia"
                p_comment = "Si se observa anomalia: documentar, fotografiar, reportar a supervisor."
                p_constraint = "ONLINE"
                p_task_type = "INSPECT"
                p_access_time = 0

            # Secondary task for CB
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            s_task_name = build_secondary_task_name(mechanism, mi, tag)
            _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
            s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)

            budgeted_as = s_task_type
            budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
            budgeted_life_tu = "YEARS"

        elif tactics == "FIXED_TIME":
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"
            p_task_name = build_ft_task_name(mechanism, mi, tag)
            ft_info = FT_INTERVALS.get(mechanism, {"unit": "WEEKS", "A": 13, "B": 26, "C": 52})
            p_task_interval = ft_info.get(crit, ft_info["B"])
            if ft_info["unit"] == "OPERATING_HOURS":
                p_op_units = "OPERATING_HOURS"
                p_time_units = None
            else:
                p_op_units = None
                p_time_units = "WEEKS"
            p_constraint = "OFFLINE"
            verb = FT_VERB.get(mechanism, "Reemplazar")
            p_task_type = FT_TASK_TYPE.get(verb, "REPLACE")
            p_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)
            # FT: NO budgeted fields (budgeted is for secondary_task only)

        elif tactics == "FAULT_FINDING":
            task_counter += 1
            p_task_id = f"T-{task_counter:06d}"
            p_task_name = build_ffi_task_name(mi, tag)
            p_task_interval = {"A": 4, "B": 6, "C": 13}.get(crit, 6)
            p_time_units = "WEEKS"
            p_limits = get_ffi_limits(mi)
            p_comment = FFI_COMMENT
            p_constraint = "TEST_MODE"
            p_task_type = "TEST"
            p_access_time = 0.5

            # Secondary for FFI
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            s_task_name = build_secondary_task_name(mechanism, mi, tag)
            _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
            s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)

            budgeted_as = s_task_type
            budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
            budgeted_life_tu = "YEARS"

        elif tactics == "RUN_TO_FAILURE":
            # Only secondary task
            task_counter += 1
            s_task_id = f"T-{task_counter:06d}"
            s_task_name = build_secondary_task_name(mechanism, mi, tag)
            _, s_task_type = MECHANISM_TO_SECONDARY.get(mechanism, ("Reemplazar", "REPLACE"))
            s_access_time = SECONDARY_ACCESS_TIME.get(mechanism, 4)

            budgeted_as = s_task_type
            budgeted_life = BUDGETED_LIFE.get(mechanism, 3)
            budgeted_life_tu = "YEARS"

        # Classify subsystem from MI name
        subsystem = classify_subsystem(mi)

        results.append({
            "strategy_id": strategy_id,
            "sap_func_loc_short": tag,
            "equipment_name": equip_name_map.get(tag, ""),
            "subunit": subsystem,
            "maintainable_item": mi,
            "partes_falla": row.get("partes_falla", ""),
            "sintomas_falla": row.get("sintomas_falla", ""),
            "causas_falla": row.get("causas_falla", ""),
            "function_and_failure": func_and_fail,
            "what": row.get("fm_what", ""),
            "mechanism": mechanism,
            "cause": row.get("fm_cause", ""),
            "status": "RECOMMENDED",
            "tactics_type": tactics,
            "primary_task_id": p_task_id,
            "primary_task_name": p_task_name,
            "primary_task_interval": p_task_interval,
            "operational_units": p_op_units,
            "time_units": p_time_units,
            "primary_task_acceptable_limits": p_limits,
            "primary_task_conditional_comments": p_comment,
            "primary_task_constraint": p_constraint,
            "primary_task_task_type": p_task_type,
            "primary_task_access_time": p_access_time,
            "secondary_task_id": s_task_id,
            "secondary_task_name": s_task_name,
            "secondary_task_constraint": s_constraint if s_task_name else None,
            "secondary_task_task_type": s_task_type,
            "secondary_task_access_time": s_access_time,
            "secondary_task_comments": s_comments,
            "budgeted_as": budgeted_as,
            "budgeted_life": budgeted_life,
            "budgeted_life_time_units": budgeted_life_tu,
            "budgeted_life_operational_units": budgeted_life_ou,
            "existing_task": None,
            "justification_category": None,
            "justification": None,
            "notes": None,
        })

        if (idx + 1) % 25000 == 0:
            print(f"    {idx + 1}/{n} filas procesadas...")

    print(f"    {n}/{n} filas procesadas en {time.time() - t0:.1f}s")
    print(f"    Total task IDs generados: {task_counter}")

    return pd.DataFrame(results)


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

def validate(df_strat, df01):
    """Validate the strategy construction table."""
    print("\n" + "=" * 70)
    print("FASE 4: Validacion")
    print("=" * 70)

    errors = 0
    warnings = 0
    n = len(df_strat)

    # 1. Tactics distribution
    dist = df_strat["tactics_type"].value_counts()
    print("\n1. Distribucion de tactics_type:")
    for tt, count in dist.items():
        pct = 100.0 * count / n
        print(f"   {tt}: {count} ({pct:.1f}%)")

    # Check ranges
    cb_pct = 100.0 * dist.get("CONDITION_BASED", 0) / n
    ft_pct = 100.0 * dist.get("FIXED_TIME", 0) / n
    ffi_pct = 100.0 * dist.get("FAULT_FINDING", 0) / n
    rtf_pct = 100.0 * dist.get("RUN_TO_FAILURE", 0) / n

    if cb_pct < 40 or cb_pct > 80:
        print(f"   [WARN] CB {cb_pct:.1f}% fuera de rango esperado (40-80%)")
        warnings += 1
    if ft_pct < 5 or ft_pct > 35:
        print(f"   [WARN] FT {ft_pct:.1f}% fuera de rango esperado (5-35%)")
        warnings += 1

    # 2. CB/FFI must have primary task
    cb_ffi = df_strat[df_strat["tactics_type"].isin(["CONDITION_BASED", "FAULT_FINDING"])]
    missing_primary = cb_ffi["primary_task_name"].isna().sum()
    if missing_primary > 0:
        print(f"\n2. [ERROR] {missing_primary} CB/FFI rows sin primary_task_name")
        errors += missing_primary
    else:
        print(f"\n2. OK: Todos los CB/FFI ({len(cb_ffi)}) tienen primary_task_name")

    missing_limits = cb_ffi["primary_task_acceptable_limits"].isna().sum()
    if missing_limits > 0:
        print(f"   [ERROR] {missing_limits} CB/FFI rows sin acceptable_limits")
        errors += missing_limits
    else:
        print(f"   OK: Todos los CB/FFI tienen acceptable_limits")

    # 3. RTF must NOT have primary task, must have secondary
    rtf = df_strat[df_strat["tactics_type"] == "RUN_TO_FAILURE"]
    rtf_with_primary = rtf["primary_task_name"].notna().sum()
    if rtf_with_primary > 0:
        print(f"\n3. [ERROR] {rtf_with_primary} RTF rows CON primary_task_name")
        errors += rtf_with_primary
    else:
        print(f"\n3. OK: Ningun RTF tiene primary_task_name")

    rtf_no_secondary = rtf["secondary_task_name"].isna().sum()
    if rtf_no_secondary > 0:
        print(f"   [ERROR] {rtf_no_secondary} RTF rows SIN secondary_task_name")
        errors += rtf_no_secondary
    else:
        print(f"   OK: Todos los RTF ({len(rtf)}) tienen secondary_task_name")

    # 4. FT must have primary task
    ft = df_strat[df_strat["tactics_type"] == "FIXED_TIME"]
    ft_no_primary = ft["primary_task_name"].isna().sum()
    if ft_no_primary > 0:
        print(f"\n4. [ERROR] {ft_no_primary} FT rows SIN primary_task_name")
        errors += ft_no_primary
    else:
        print(f"\n4. OK: Todos los FT ({len(ft)}) tienen primary_task_name")

    # 5. Equipment tags exist in hierarchy
    hier_tags = set(df01["sap_func_loc_short"].dropna().astype(str))
    strat_tags = set(df_strat["sap_func_loc_short"].unique())
    orphan_tags = strat_tags - hier_tags
    if orphan_tags:
        print(f"\n5. [WARN] {len(orphan_tags)} tags en estrategia no existen en jerarquia")
        warnings += len(orphan_tags)
    else:
        print(f"\n5. OK: Todos los {len(strat_tags)} tags existen en jerarquia")

    # 6. Task name length
    all_names = pd.concat([
        df_strat["primary_task_name"].dropna(),
        df_strat["secondary_task_name"].dropna()
    ])
    over_72 = (all_names.str.len() > 72).sum()
    if over_72 > 0:
        print(f"\n6. [WARN] {over_72} nombres de tarea exceden 72 caracteres")
        warnings += over_72
    else:
        print(f"\n6. OK: Todos los nombres de tarea <= 72 caracteres")

    # 7. Conditional comments for CB/FFI
    missing_comments = cb_ffi["primary_task_conditional_comments"].isna().sum()
    if missing_comments > 0:
        print(f"\n7. [WARN] {missing_comments} CB/FFI rows sin conditional_comments")
        warnings += missing_comments
    else:
        print(f"\n7. OK: Todos los CB/FFI tienen conditional_comments")

    # 8. FT must NOT have budgeted fields
    ft_with_budget = ft["budgeted_as"].notna().sum()
    if ft_with_budget > 0:
        print(f"\n8. [ERROR] {ft_with_budget} FT rows CON budgeted_as (debe ser vacio)")
        errors += ft_with_budget
    else:
        print(f"\n8. OK: Ningun FT tiene budgeted fields")

    # 9. Subunit distribution
    subunit_dist = df_strat["subunit"].value_counts()
    print(f"\n9. Subunit (subsistemas) distribution ({len(subunit_dist)} unicos):")
    for sub, cnt in subunit_dist.head(15).items():
        print(f"   {sub}: {cnt} ({100*cnt/n:.1f}%)")

    # 10. equipment_name coverage
    missing_name = df_strat["equipment_name"].isna().sum() + (df_strat["equipment_name"] == "").sum()
    if missing_name > 0:
        print(f"\n10. [WARN] {missing_name} rows sin equipment_name")
        warnings += 1
    else:
        print(f"\n10. OK: Todos los rows tienen equipment_name")

    # 11. CB/FFI/RTF must have budgeted fields
    others = df_strat[df_strat["tactics_type"].isin(["CONDITION_BASED", "FAULT_FINDING", "RUN_TO_FAILURE"])]
    others_no_budget = others["budgeted_as"].isna().sum()
    if others_no_budget > 0:
        print(f"\n11. [WARN] {others_no_budget} CB/FFI/RTF rows SIN budgeted_as")
        warnings += 1
    else:
        print(f"\n11. OK: Todos los CB/FFI/RTF tienen budgeted fields")

    print(f"\n{'=' * 40}")
    print(f"RESULTADO: {errors} errores, {warnings} advertencias")
    print(f"{'=' * 40}")

    return errors, warnings


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("CONSTRUCCION DE ESTRATEGIA DE MANTENIMIENTO")
    print("Siguiendo task-naming-standards.md, cbm-technique-selection.md,")
    print("maintenance-strategy-examples.md, rcm2-moubray-methodology")
    print("=" * 70)

    # Load data
    print("\nCargando datos...")
    t0 = time.time()
    df03 = pd.read_excel(os.path.join(SEED, "03_failure_modes.xlsx"))
    df01 = pd.read_excel(os.path.join(SEED, "01_equipment_hierarchy.xlsx"))
    print(f"  03_failure_modes: {len(df03)} rows")
    print(f"  01_equipment_hierarchy: {len(df01)} rows")
    print(f"  Carga en {time.time() - t0:.1f}s")

    # Build lookups
    equip = df01[df01["equnr"].notna()].copy()
    abckz_map = dict(zip(
        equip["sap_func_loc_short"].astype(str),
        equip["abckz"].fillna(3)
    ))
    equip_name_map = dict(zip(
        equip["sap_func_loc_short"].astype(str),
        equip["eqktx"].fillna("")
    ))

    # Phase 0: Auto-generate missing FMs
    df03_ext = phase0_generate_missing_fms(df03, df01)

    # Save updated 03 if new FMs were added
    if len(df03_ext) > len(df03):
        print(f"\nGuardando 03_failure_modes.xlsx actualizado ({len(df03_ext)} rows)...")
        df03_ext.to_excel(
            os.path.join(SEED, "03_failure_modes.xlsx"),
            index=False, engine="openpyxl"
        )
        print("  Guardado.")

    # Phase 1-2: Build strategy table
    df_strat = build_strategy_table(df03_ext, abckz_map, equip_name_map)

    # Phase 3: Write output
    print("\n" + "=" * 70)
    print("FASE 3: Escritura del archivo")
    print("=" * 70)
    out_path = os.path.join(SEED, "14_maintenance_strategy_construction.xlsx")
    print(f"Guardando {len(df_strat)} rows en {out_path}...")
    t0 = time.time()
    df_strat.to_excel(out_path, index=False, engine="openpyxl", sheet_name="Strategies")
    print(f"  Guardado en {time.time() - t0:.1f}s")

    # Phase 4: Validation
    errors, warnings = validate(df_strat, df01)

    # Summary
    print("\n" + "=" * 70)
    print("RESUMEN FINAL")
    print("=" * 70)
    print(f"FMs originales en 03: {len(df03)}")
    print(f"FMs nuevos generados: {len(df03_ext) - len(df03)}")
    print(f"Total FMs procesados: {len(df03_ext)}")
    print(f"Estrategias generadas: {len(df_strat)}")
    print(f"Errores: {errors}")
    print(f"Advertencias: {warnings}")
    print(f"\nArchivo: {out_path}")


if __name__ == "__main__":
    main()
