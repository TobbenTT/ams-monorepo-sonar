"""
equipment_bom_templates.py
===========================
Defines the expected BOM (Bill of Materials / MI list) for each equipment
type (catalog profile code).  Used by rebuild_failure_modes_v2.py to
auto-complete missing MIs when generating RCM failure modes.

Each profile maps to:
  - description: human-readable equipment type name
  - required_mis: dict  MI_name → {mi_class, mandatory, check_hierarchy?}

Items with  check_hierarchy=True  should be verified against the SAP
hierarchy before adding them as MIs — if a separate L4 equipment of
that type already exists in the same functional location prefix, the MI
is redundant at this level.

Usage:
    from equipment_bom_templates import EQUIPMENT_BOM_TEMPLATE, complete_equipment_mis
"""

from __future__ import annotations

import re
from typing import Any

# ---------------------------------------------------------------------------
# EQUIPMENT BOM TEMPLATES
# ---------------------------------------------------------------------------
EQUIPMENT_BOM_TEMPLATE: dict[str, dict[str, Any]] = {
    # ======================================================================
    # PUMPS
    # ======================================================================
    "BOMB_CEN": {
        "description": "Bomba centrífuga de pulpa/agua",
        "required_mis": {
            "Impulsor": {"mi_class": "impeller", "mandatory": True},
            "Carcaza": {"mi_class": "pump_casing", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Acoplamiento": {"mi_class": "coupling", "mandatory": True},
            "Descansos": {"mi_class": "bearing", "mandatory": True},
            "Base": {"mi_class": "structure_steel", "mandatory": True},
            "Lubricante": {"mi_class": "lubricant", "mandatory": True},
            "Camisa": {"mi_class": "liner_wear", "mandatory": False},
            "Tubería": {"mi_class": "pipe_process", "mandatory": False},
            "Brida": {"mi_class": "fastener", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
        },
    },
    "BOMB_REC": {
        "description": "Bomba reciprocante / dosificadora de diafragma",
        "required_mis": {
            "Diafragma": {"mi_class": "diaphragm", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Válvulas": {"mi_class": "valve_check", "mandatory": True},
            "Silenciador": {"mi_class": "silencer", "mandatory": True},
            "Cuerpo": {"mi_class": "pump_casing", "mandatory": True},
            "Guardias": {"mi_class": "guard_safety", "mandatory": False},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Acoplamiento": {"mi_class": "coupling", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Base": {"mi_class": "structure_steel", "mandatory": False},
            "Lubricante": {"mi_class": "lubricant", "mandatory": True},
        },
    },
    "BOMB_ROT": {
        "description": "Bomba rotativa / de desplazamiento positivo",
        "required_mis": {
            "Rotor": {"mi_class": "rotor", "mandatory": True},
            "Estator": {"mi_class": "stator", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Acomplamiento": {"mi_class": "coupling", "mandatory": True},
            "Válvulas": {"mi_class": "valve_check", "mandatory": True},
            "Empaquetaduras": {"mi_class": "gasket", "mandatory": True},
            "Filtro": {"mi_class": "filter", "mandatory": False},
            "Lubricante": {"mi_class": "lubricant", "mandatory": True},
            "Aceite": {"mi_class": "lubricant", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Tuberías": {"mi_class": "pipe_process", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
        },
    },
    "BOMB_TUR": {
        "description": "Bomba turbina vertical / sumergible",
        "required_mis": {
            "Impulsores": {"mi_class": "impeller", "mandatory": True},
            "Tazones": {"mi_class": "pump_casing", "mandatory": True},
            "Difusor": {"mi_class": "diffuser", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Cojinetes": {"mi_class": "bearing", "mandatory": True},
            "Bujes": {"mi_class": "bushing", "mandatory": True},
            "Anillos desgaste": {"mi_class": "liner_wear", "mandatory": True},
            "Acoplamiento motor": {"mi_class": "coupling", "mandatory": True},
            "Acoplamiento tubos": {"mi_class": "coupling", "mandatory": False},
            "Tubo columna": {"mi_class": "pipe_process", "mandatory": True},
            "Válvulas": {"mi_class": "valve_check", "mandatory": False},
            "Tubería": {"mi_class": "pipe_process", "mandatory": False},
            "Tornillos": {"mi_class": "fastener", "mandatory": False},
            "Caja control": {"mi_class": "control_panel", "mandatory": False},
        },
    },

    # ======================================================================
    # CONVEYOR
    # ======================================================================
    "CORR_TRA": {
        "description": "Correa transportadora de mineral",
        "required_mis": {
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Reductor": {"mi_class": "reducer_gearbox", "mandatory": False, "check_hierarchy": True},
            "Acoplamiento": {"mi_class": "coupling", "mandatory": True},
            "Freno motriz": {"mi_class": "brake_mechanical", "mandatory": True},
            "Poleas": {"mi_class": "wheel", "mandatory": True},
            "Ejes": {"mi_class": "shaft", "mandatory": True},
            "Descansos": {"mi_class": "bearing", "mandatory": True},
            "Tambor": {"mi_class": "wheel", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Correa": {"mi_class": "belt_conveyor", "mandatory": True},
            "Polines": {"mi_class": "support_bracket", "mandatory": True},
            "Raspadores": {"mi_class": "liner_wear", "mandatory": True},
            "Estructura": {"mi_class": "structure_steel", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": True},
            "Lubricante": {"mi_class": "lubricant", "mandatory": True},
            "Cama Impacto": {"mi_class": "liner_wear", "mandatory": False},
            "Guardera": {"mi_class": "guard_safety", "mandatory": False},
        },
    },

    # ======================================================================
    # MOTORS
    # ======================================================================
    "MOT_ELÉC": {
        "description": "Motor eléctrico (AC/DC)",
        "required_mis": {
            "Bobinado estator": {"mi_class": "motor_winding", "mandatory": True},
            "Rotor": {"mi_class": "rotor", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Carcasa": {"mi_class": "motor_casing", "mandatory": True},
            "Ventilador": {"mi_class": "fan_cooling", "mandatory": True},
            "Caja conexion": {"mi_class": "junction_box", "mandatory": True},
            "Acople": {"mi_class": "coupling", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Cojinetes": {"mi_class": "bearing", "mandatory": False},
            "Calefactor": {"mi_class": "heater_anticondensation", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Grasa": {"mi_class": "lubricant", "mandatory": True},
        },
    },

    # ======================================================================
    # FANS / VENTILATION
    # ======================================================================
    "VENT_AX": {
        "description": "Ventilador axial",
        "required_mis": {
            "Aspas": {"mi_class": "impeller", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Carcasa": {"mi_class": "fan_casing", "mandatory": True},
            "Acoplamiento": {"mi_class": "coupling", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": False},
            "Guardas": {"mi_class": "guard_safety", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Ductos": {"mi_class": "duct", "mandatory": False},
        },
    },
    "VENT_CEN": {
        "description": "Ventilador centrífugo",
        "required_mis": {
            "Rotor": {"mi_class": "impeller", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Carcasa": {"mi_class": "fan_casing", "mandatory": True},
            "Acoplamiento": {"mi_class": "coupling", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Cuello de succión": {"mi_class": "inlet_cone", "mandatory": False},
            "Guardas": {"mi_class": "guard_safety", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Soportes de ductos": {"mi_class": "support_bracket", "mandatory": False},
        },
    },

    # ======================================================================
    # COMPRESSORS / HYDRAULIC
    # ======================================================================
    "COMP_TOR": {
        "description": "Compresor de tornillo rotativo",
        "required_mis": {
            "Compresor": {"mi_class": "compressor_element", "mandatory": True},
            "Tornillo rotatorio": {"mi_class": "rotor", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Acoplamientos": {"mi_class": "coupling", "mandatory": True},
            "Filtro aceite": {"mi_class": "filter", "mandatory": True},
            "Filtro aire": {"mi_class": "filter", "mandatory": True},
            "Separador aceite": {"mi_class": "filter", "mandatory": True},
            "Intercambiador calor": {"mi_class": "heat_exchanger", "mandatory": True},
            "Válvulas": {"mi_class": "valve_check", "mandatory": True},
            "Aceite": {"mi_class": "lubricant", "mandatory": True},
            "Depósito aire": {"mi_class": "vessel_pressure", "mandatory": False},
            "Ventiladores": {"mi_class": "fan_cooling", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
        },
    },
    "COMP_HID": {
        "description": "Compuerta hidráulica / cilindro hidráulico",
        "required_mis": {
            "Cilindro hidráulico": {"mi_class": "cylinder_hydraulic", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Vástago": {"mi_class": "shaft", "mandatory": True},
            "Válvulas": {"mi_class": "valve_hydraulic", "mandatory": True},
            "Mangueras": {"mi_class": "hose_hydraulic", "mandatory": True},
            "Bomba hidráulica": {"mi_class": "pump_hydraulic", "mandatory": True},
            "Filtro aceite": {"mi_class": "filter", "mandatory": True},
            "Aceite hidráulico": {"mi_class": "lubricant", "mandatory": True},
            "Acumulador": {"mi_class": "vessel_pressure", "mandatory": False},
            "Conexiones": {"mi_class": "fitting", "mandatory": False},
            "Panel control": {"mi_class": "control_panel", "mandatory": False},
        },
    },

    # ======================================================================
    # AGITATOR
    # ======================================================================
    "AGIT_MEC": {
        "description": "Agitador mecánico",
        "required_mis": {
            "Impeller": {"mi_class": "impeller", "mandatory": True},
            "Aspas": {"mi_class": "impeller", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Acoplamiento flexible": {"mi_class": "coupling", "mandatory": True},
            "Soporte agitador": {"mi_class": "support_bracket", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Reductor": {"mi_class": "reducer_gearbox", "mandatory": False, "check_hierarchy": True},
            "Empaquetaduras": {"mi_class": "gasket", "mandatory": False},
            "Revestimiento": {"mi_class": "liner_wear", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Baffles": {"mi_class": "structure_steel", "mandatory": False},
        },
    },

    # ======================================================================
    # CRANES / HOISTS
    # ======================================================================
    "PUEN_GRÚ": {
        "description": "Puente grúa / grúa overhead",
        "required_mis": {
            "Estructura de acero": {"mi_class": "structure_steel", "mandatory": True},
            "Cable de acero": {"mi_class": "wire_rope", "mandatory": True},
            "Gancho": {"mi_class": "hook", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Ruedas": {"mi_class": "wheel", "mandatory": True},
            "Freno": {"mi_class": "brake_mechanical", "mandatory": True},
            "Malacate": {"mi_class": "winch", "mandatory": True},
            "Colectores de corriente": {"mi_class": "collector_current", "mandatory": True},
            "Armario eléctrico": {"mi_class": "control_panel", "mandatory": True},
            "Botonera": {"mi_class": "control_panel", "mandatory": True},
            "Interruptores límite de carrera": {"mi_class": "switch_limit", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Lubricante": {"mi_class": "lubricant", "mandatory": True},
        },
    },
    "TECL_ELE": {
        "description": "Tecle eléctrico / polipasto",
        "required_mis": {
            "Cadena": {"mi_class": "chain", "mandatory": True},
            "Bloque de gancho": {"mi_class": "hook", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Freno": {"mi_class": "brake_mechanical", "mandatory": True},
            "Armario eléctrico": {"mi_class": "control_panel", "mandatory": True},
            "Interruptores": {"mi_class": "switch_limit", "mandatory": True},
            "Colgante": {"mi_class": "control_panel", "mandatory": True},
            "Polipasto de cable": {"mi_class": "wire_rope", "mandatory": False},
            "Colectores de corriente": {"mi_class": "collector_current", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
        },
    },

    # ======================================================================
    # SCREENING
    # ======================================================================
    "HARN_EST": {
        "description": "Harnero estático / vibratorio",
        "required_mis": {
            "Palmetas": {"mi_class": "screen_deck", "mandatory": True},
            "Estructura": {"mi_class": "structure_steel", "mandatory": True},
            "Frame": {"mi_class": "structure_steel", "mandatory": True},
            "Resortes": {"mi_class": "spring", "mandatory": True},
            "Eje": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Correas transmisión": {"mi_class": "belt_drive", "mandatory": True},
            "Revestimientos": {"mi_class": "liner_wear", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": True},
            "Guardas": {"mi_class": "guard_safety", "mandatory": False},
            "Longarinas": {"mi_class": "structure_steel", "mandatory": False},
            "Faldón perimetral": {"mi_class": "liner_wear", "mandatory": False},
        },
    },

    # ======================================================================
    # THICKENER
    # ======================================================================
    "ESPESADO": {
        "description": "Espesador de pulpa",
        "required_mis": {
            "Estanque espesador": {"mi_class": "vessel_tank", "mandatory": True},
            "Estructura rastra": {"mi_class": "structure_steel", "mandatory": True},
            "Corona principal": {"mi_class": "ring_gear", "mandatory": True},
            "Blade": {"mi_class": "scraper", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Estructura feedwel": {"mi_class": "structure_steel", "mandatory": True},
            "Revestimientos": {"mi_class": "liner_wear", "mandatory": True},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Reductor": {"mi_class": "reducer_gearbox", "mandatory": False, "check_hierarchy": True},
            "Aceite": {"mi_class": "lubricant", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Válvulas": {"mi_class": "valve_process", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Tablero control": {"mi_class": "control_panel", "mandatory": False},
        },
    },

    # ======================================================================
    # FILTER PRESS
    # ======================================================================
    "FIL_PREN": {
        "description": "Filtro prensa",
        "required_mis": {
            "Placas": {"mi_class": "filter_plate", "mandatory": True},
            "Telas de filtro": {"mi_class": "filter_cloth", "mandatory": True},
            "Cilindros hidráulicos": {"mi_class": "cylinder_hydraulic", "mandatory": True},
            "Bastidor": {"mi_class": "structure_steel", "mandatory": True},
            "Cabezal fijo": {"mi_class": "structure_steel", "mandatory": True},
            "Cabezal móvil": {"mi_class": "structure_steel", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Válvulas": {"mi_class": "valve_process", "mandatory": True},
            "Aceite hidráulico": {"mi_class": "lubricant", "mandatory": True},
            "Colector de lavado": {"mi_class": "pipe_process", "mandatory": False},
            "Rieles": {"mi_class": "structure_steel", "mandatory": False},
            "Panel de control": {"mi_class": "control_panel", "mandatory": False},
            "Mangueras": {"mi_class": "hose_hydraulic", "mandatory": False},
        },
    },

    # ======================================================================
    # HEAT EXCHANGERS
    # ======================================================================
    "INT_ENFR": {
        "description": "Intercambiador de calor enfriador (shell & tube)",
        "required_mis": {
            "Tubos": {"mi_class": "tube_heat_exchanger", "mandatory": True},
            "Carcasa": {"mi_class": "shell_vessel", "mandatory": True},
            "Placas tubulares": {"mi_class": "tubesheet", "mandatory": True},
            "Baffles": {"mi_class": "baffle", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Empaquetaduras": {"mi_class": "gasket", "mandatory": True},
            "Conexiones": {"mi_class": "fitting", "mandatory": True},
            "Válvulas": {"mi_class": "valve_process", "mandatory": False},
            "Ánodos sacrificio": {"mi_class": "anode_sacrificial", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
        },
    },
    "INT_PLAC": {
        "description": "Intercambiador de calor de placas",
        "required_mis": {
            "Placas": {"mi_class": "plate_heat_exchanger", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Columna soporte": {"mi_class": "structure_steel", "mandatory": True},
            "Barra soporte": {"mi_class": "structure_steel", "mandatory": True},
            "Conexiones": {"mi_class": "fitting", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": True},
            "Válvulas": {"mi_class": "valve_process", "mandatory": False},
            "RTD": {"mi_class": "sensor_temperature", "mandatory": False},
            "Sensores": {"mi_class": "sensor_process", "mandatory": False},
            "Tubería": {"mi_class": "pipe_process", "mandatory": False},
        },
    },

    # ======================================================================
    # ELECTRICAL POWER
    # ======================================================================
    "TRAN_POT": {
        "description": "Transformador de potencia",
        "required_mis": {
            "Bobinados": {"mi_class": "transformer_winding", "mandatory": True},
            "Núcleo magnético": {"mi_class": "transformer_core", "mandatory": True},
            "Aceite dieléctrico": {"mi_class": "oil_dielectric", "mandatory": True},
            "Bushing": {"mi_class": "bushing_transformer", "mandatory": True},
            "Cambiador de Taps Automático": {"mi_class": "tap_changer", "mandatory": True},
            "Radiadores": {"mi_class": "radiator_cooling", "mandatory": True},
            "Ventiladores": {"mi_class": "fan_cooling", "mandatory": False},
            "Relé Bucholz": {"mi_class": "relay_protection", "mandatory": True},
            "Relé de protección": {"mi_class": "relay_protection", "mandatory": True},
            "Tanque de transformador": {"mi_class": "tank_transformer", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Respiradero": {"mi_class": "breather", "mandatory": False},
            "Pararrayos": {"mi_class": "surge_arrester", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
        },
    },
    "CELD_VDF": {
        "description": "Celda variador de frecuencia (VDF/VFD)",
        "required_mis": {
            "Módulo rectificador": {"mi_class": "power_electronics", "mandatory": True},
            "Módulo inversor": {"mi_class": "power_electronics", "mandatory": True},
            "Módulo convertidor": {"mi_class": "power_electronics", "mandatory": True},
            "Filtros": {"mi_class": "filter_electronic", "mandatory": True},
            "Ventilador": {"mi_class": "fan_cooling", "mandatory": True},
            "Tarjetas": {"mi_class": "pcb_control", "mandatory": True},
            "Semiconductores": {"mi_class": "power_electronics", "mandatory": True},
            "Fusibles de entrada": {"mi_class": "fuse", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": False},
            "Panel de control local": {"mi_class": "control_panel", "mandatory": True},
            "Reactancia de entrada": {"mi_class": "reactor_line", "mandatory": False},
            "Reactancia de salida": {"mi_class": "reactor_line", "mandatory": False},
            "Intercambiadores de Calor": {"mi_class": "heat_exchanger", "mandatory": False},
            "Contactor de potencia": {"mi_class": "contactor", "mandatory": True},
        },
    },
    "TAB_CEL": {
        "description": "Tablero / celda eléctrica de distribución",
        "required_mis": {
            "Interruptores": {"mi_class": "circuit_breaker", "mandatory": True},
            "Barras": {"mi_class": "busbar", "mandatory": True},
            "Contactores": {"mi_class": "contactor", "mandatory": True},
            "Relé de protección": {"mi_class": "relay_protection", "mandatory": True},
            "Cableado": {"mi_class": "cable_power", "mandatory": True},
            "Conexiones": {"mi_class": "terminal", "mandatory": True},
            "Cubículo": {"mi_class": "enclosure_electrical", "mandatory": True},
            "Luces piloto": {"mi_class": "indicator_lamp", "mandatory": False},
            "Fusibles": {"mi_class": "fuse", "mandatory": False},
            "Puesta a tierra": {"mi_class": "grounding", "mandatory": True},
            "Ventilación": {"mi_class": "fan_cooling", "mandatory": False},
        },
    },
    "CEL_PMOT": {
        "description": "Celda de partida de motor (MCC)",
        "required_mis": {
            "Contactor": {"mi_class": "contactor", "mandatory": True},
            "Breaker": {"mi_class": "circuit_breaker", "mandatory": True},
            "Relé térmico": {"mi_class": "relay_protection", "mandatory": True},
            "Partidor": {"mi_class": "motor_starter", "mandatory": True},
            "Cableado": {"mi_class": "cable_power", "mandatory": True},
            "Cubículo": {"mi_class": "enclosure_electrical", "mandatory": True},
            "Contactos": {"mi_class": "contact_electrical", "mandatory": True},
            "Conexiones eléctricas": {"mi_class": "terminal", "mandatory": True},
            "Circuito magnético": {"mi_class": "circuit_magnetic", "mandatory": True},
            "Relé falla a tierra": {"mi_class": "relay_protection", "mandatory": False},
            "Transformador de control": {"mi_class": "transformer_control", "mandatory": False},
            "Luces piloto": {"mi_class": "indicator_lamp", "mandatory": False},
        },
    },
    "CEL_IPOT": {
        "description": "Celda de interrupción de potencia",
        "required_mis": {
            "Interruptor de potencia": {"mi_class": "circuit_breaker", "mandatory": True},
            "Breaker": {"mi_class": "circuit_breaker", "mandatory": True},
            "Relé de protecciones": {"mi_class": "relay_protection", "mandatory": True},
            "Contactos": {"mi_class": "contact_electrical", "mandatory": True},
            "Cableado": {"mi_class": "cable_power", "mandatory": True},
            "Cubículo": {"mi_class": "enclosure_electrical", "mandatory": True},
            "Conexiones eléctricas": {"mi_class": "terminal", "mandatory": True},
            "Circuito magnético": {"mi_class": "circuit_magnetic", "mandatory": True},
            "Relé falla a tierra": {"mi_class": "relay_protection", "mandatory": False},
            "Transformador de potencial": {"mi_class": "transformer_instrument", "mandatory": False},
            "Resortes mecanismo accionamiento": {"mi_class": "spring", "mandatory": False},
            "Conexión a tierra": {"mi_class": "grounding", "mandatory": True},
        },
    },

    # ======================================================================
    # VALVES
    # ======================================================================
    "VALVULAS": {
        "description": "Válvula de proceso (compuerta, globo, bola, mariposa, etc.)",
        "required_mis": {
            "Cuerpo": {"mi_class": "valve_body", "mandatory": True},
            "Obturador": {"mi_class": "valve_plug", "mandatory": True},
            "Vástago": {"mi_class": "shaft", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Empaquetaduras": {"mi_class": "gasket", "mandatory": True},
            "Asiento": {"mi_class": "valve_seat", "mandatory": True},
            "Actuador": {"mi_class": "actuator", "mandatory": False},
            "Volante": {"mi_class": "handwheel", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Brida": {"mi_class": "flange", "mandatory": False},
            "Posicionador": {"mi_class": "positioner", "mandatory": False},
        },
    },

    # ======================================================================
    # AIR ACCUMULATOR
    # ======================================================================
    "ACUM_AIR": {
        "description": "Acumulador / receptor de aire comprimido",
        "required_mis": {
            "Vasija": {"mi_class": "vessel_pressure", "mandatory": True},
            "Vejiga": {"mi_class": "bladder", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Válvulas": {"mi_class": "valve_safety", "mandatory": True},
            "Conectores de aire": {"mi_class": "fitting", "mandatory": True},
            "Tuberías": {"mi_class": "pipe_process", "mandatory": False},
            "Niples": {"mi_class": "fitting", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Manómetro": {"mi_class": "gauge_pressure", "mandatory": False},
        },
    },

    # ======================================================================
    # AGITATED TANK
    # ======================================================================
    "EST_AGIT": {
        "description": "Estanque agitado de proceso",
        "required_mis": {
            "Estanque": {"mi_class": "vessel_tank", "mandatory": True},
            "Agitador": {"mi_class": "impeller", "mandatory": True},
            "Eje agitador": {"mi_class": "shaft", "mandatory": True},
            "Rodamientos": {"mi_class": "bearing", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": True},
            "Revestimiento": {"mi_class": "liner_wear", "mandatory": True},
            "Baffles": {"mi_class": "structure_steel", "mandatory": False},
            "Válvulas": {"mi_class": "valve_process", "mandatory": False},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
            "Reductor": {"mi_class": "reducer_gearbox", "mandatory": False, "check_hierarchy": True},
            "Tuberías": {"mi_class": "pipe_process", "mandatory": False},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Pernos": {"mi_class": "fastener", "mandatory": False},
        },
    },

    # ======================================================================
    # BINS / CHUTES
    # ======================================================================
    "TOLVA": {
        "description": "Tolva de almacenamiento / bin",
        "required_mis": {
            "Paredes tolva": {"mi_class": "vessel_tank", "mandatory": True},
            "Estructura": {"mi_class": "structure_steel", "mandatory": True},
            "Revestimientos": {"mi_class": "liner_wear", "mandatory": True},
            "Planchas desgaste": {"mi_class": "liner_wear", "mandatory": True},
            "Compuerta": {"mi_class": "gate", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": True},
            "Soportes": {"mi_class": "support_bracket", "mandatory": False},
            "Brida": {"mi_class": "flange", "mandatory": False},
            "Guarderas": {"mi_class": "guard_safety", "mandatory": False},
            "Fijación": {"mi_class": "fastener", "mandatory": False},
        },
    },
    "CHUTE": {
        "description": "Chute de transferencia",
        "required_mis": {
            "Paredes chute": {"mi_class": "structure_steel", "mandatory": True},
            "Estructura": {"mi_class": "structure_steel", "mandatory": True},
            "Revestimientos": {"mi_class": "liner_wear", "mandatory": True},
            "Placas de desgaste": {"mi_class": "liner_wear", "mandatory": True},
            "Cama de Impacto": {"mi_class": "liner_wear", "mandatory": True},
            "Faldón": {"mi_class": "liner_wear", "mandatory": True},
            "Pernos": {"mi_class": "fastener", "mandatory": True},
            "Sellos": {"mi_class": "seal_mechanical", "mandatory": False},
            "Guarderas": {"mi_class": "guard_safety", "mandatory": False},
            "Cilindros neumáticos": {"mi_class": "cylinder_pneumatic", "mandatory": False},
        },
    },

    # ======================================================================
    # LUBRICATION SYSTEM
    # ======================================================================
    "SIST_LUB": {
        "description": "Sistema de lubricación centralizado",
        "required_mis": {
            "Bomba": {"mi_class": "pump_lubrication", "mandatory": True},
            "Estanque": {"mi_class": "vessel_tank", "mandatory": True},
            "Tuberías": {"mi_class": "pipe_process", "mandatory": True},
            "Válvulas": {"mi_class": "valve_process", "mandatory": True},
            "Filtro": {"mi_class": "filter", "mandatory": True},
            "Distribuidores": {"mi_class": "distributor", "mandatory": True},
            "Mangueras": {"mi_class": "hose_hydraulic", "mandatory": False},
            "Conexiones": {"mi_class": "fitting", "mandatory": False},
            "Indicador nivel": {"mi_class": "gauge_level", "mandatory": False},
            "Panel control": {"mi_class": "control_panel", "mandatory": False},
            "Motor eléctrico": {"mi_class": "motor_winding", "mandatory": False, "check_hierarchy": True},
        },
    },
}


# ---------------------------------------------------------------------------
# HELPER: Normalise MI name for fuzzy matching
# ---------------------------------------------------------------------------
_STRIP_RE = re.compile(r"[\s\-_/()]+")
_ACCENT_MAP = str.maketrans(
    "áéíóúàèìòùäëïöüâêîôûñ",
    "aeiouaeiouaeiouaeioun",
)


def _normalise(name: str) -> str:
    """Lower-case, strip accents, collapse whitespace."""
    return _STRIP_RE.sub("", name.lower().translate(_ACCENT_MAP))


# ---------------------------------------------------------------------------
# HIERARCHY KEYWORDS  (for check_hierarchy items)
# ---------------------------------------------------------------------------
_HIERARCHY_MOTOR_KW = {"motor", "mot", "embt", "motel"}
_HIERARCHY_REDUCTOR_KW = {"reductor", "reducer", "gearbox", "gear"}


def _hierarchy_has_equipment(
    equip_tag: str,
    mi_name: str,
    hierarchy_df: list[dict],
) -> bool:
    """
    Check if a separate L4 equipment matching *mi_name* already exists
    under the same area prefix (first 4 chars of equip_tag).

    Parameters
    ----------
    equip_tag : str
        Tag of the parent equipment (e.g. '3110PU0061').
    mi_name : str
        MI name like 'Motor eléctrico' or 'Reductor'.
    hierarchy_df : list[dict]
        List of L4 equipment dicts (same format as equipment_l4 in v2).
    """
    area_prefix = equip_tag[:4] if len(equip_tag) >= 4 else equip_tag
    mi_lower = _normalise(mi_name)

    if "motor" in mi_lower or "mot" in mi_lower:
        keywords = _HIERARCHY_MOTOR_KW
    elif "reductor" in mi_lower or "gear" in mi_lower:
        keywords = _HIERARCHY_REDUCTOR_KW
    else:
        keywords = {mi_lower[:6]}  # first 6 normalised chars

    for eq in hierarchy_df:
        eq_tag = eq.get("sap_func_loc_short", "") or ""
        if not eq_tag.startswith(area_prefix):
            continue
        if eq_tag == equip_tag:
            continue  # skip self
        pltxt_norm = _normalise(eq.get("pltxt", "") or "")
        eqart_desc_norm = _normalise(eq.get("eqart_desc", "") or "")
        eqart = (eq.get("eqart", "") or "").upper()
        for kw in keywords:
            if kw in pltxt_norm or kw in eqart_desc_norm or kw in eqart.lower():
                return True
    return False


# ---------------------------------------------------------------------------
# MAIN API
# ---------------------------------------------------------------------------
def complete_equipment_mis(
    equip_tag: str,
    profile_code: str,
    catalog_mis: list[str],
    hierarchy_df: list[dict],
) -> tuple[list[str], list[str]]:
    """
    Compare catalog MIs against the BOM template for *profile_code* and
    return a completed list filling in any missing mandatory/optional MIs.

    Parameters
    ----------
    equip_tag : str
        Equipment tag (sap_func_loc_short), e.g. '3110PU0061'.
    profile_code : str
        Catalog profile code, e.g. 'BOMB_CEN'.
    catalog_mis : list[str]
        MIs already present from the catalog profile (from 15_catalog_profiles).
    hierarchy_df : list[dict]
        Full L4 equipment list for hierarchy lookups.

    Returns
    -------
    (complete_mi_list, added_mi_list)
        complete_mi_list : catalog MIs + any added MIs (de-duped, preserving order)
        added_mi_list    : only the MIs that were auto-added
    """
    template = EQUIPMENT_BOM_TEMPLATE.get(profile_code)
    if not template:
        return list(catalog_mis), []

    # Build normalised set of existing MIs
    existing_norm = {_normalise(m) for m in catalog_mis}

    complete = list(catalog_mis)
    added: list[str] = []

    for mi_name, mi_info in template["required_mis"].items():
        mi_norm = _normalise(mi_name)

        # Check if already present (case-insensitive, accent-insensitive)
        if mi_norm in existing_norm:
            continue

        # Also check partial match — e.g. 'Rodamiento' vs 'Rodamientos'
        already_covered = False
        for ex in existing_norm:
            # One is a prefix of the other (at least 5 chars overlap)
            if len(mi_norm) >= 5 and len(ex) >= 5:
                if mi_norm[:5] == ex[:5]:
                    already_covered = True
                    break
        if already_covered:
            continue

        # For check_hierarchy items, verify the hierarchy first
        if mi_info.get("check_hierarchy"):
            if _hierarchy_has_equipment(equip_tag, mi_name, hierarchy_df):
                continue  # A separate L4 equipment exists; skip this MI

        # Add the missing MI
        complete.append(mi_name)
        added.append(mi_name)
        existing_norm.add(mi_norm)

    return complete, added
