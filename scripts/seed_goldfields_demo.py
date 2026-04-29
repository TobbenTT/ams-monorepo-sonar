"""Seeder para demo — limpia toda la data GOLDFIELDS-SN y crea 100 WRs/OTs
realistas de minería chilena con todos los campos bien poblados.

Usage: docker cp este_archivo ocp-backend:/app/seed_demo.py
       docker exec ocp-backend python3 /app/seed_demo.py
"""
from __future__ import annotations
import random
from datetime import datetime, timedelta
from sqlalchemy import text

from api.database.connection import SessionLocal, engine
from api.database.models import (
    WorkRequestModel, ManagedWorkOrderModel, WorkforceModel,
)

PLANT = "GOLDFIELDS-SN"
random.seed(42)  # reproducible

# ═══════════════════════════════════════════════════════════════════════
# CATÁLOGOS REALISTAS DE MINERÍA CHILENA
# ═══════════════════════════════════════════════════════════════════════

# Equipos por área — tags tipo Goldfields con prefijo real
EQUIPMENT_CATALOG = [
    # Molienda
    ("BRY-SAG-ML-001", "Molino SAG 01 · 38ft × 20MW", "Molienda", "P01", "PMEC01"),
    ("BRY-SAG-ML-002", "Molino SAG 02 · 38ft × 20MW", "Molienda", "P01", "PMEC01"),
    ("BRY-BAL-ML-001", "Molino Bolas 01 · 26ft × 16MW", "Molienda", "P01", "PMEC01"),
    ("BRY-BAL-ML-002", "Molino Bolas 02 · 26ft × 16MW", "Molienda", "P01", "PMEC01"),
    ("BRY-CYC-NST-01", "Nest Ciclones 01 · 10 × D26", "Molienda", "P01", "PMEC01"),
    # Chancado
    ("CRU-GIR-01", "Chancador Giratorio 60×113", "Chancado", "P02", "PMEC02"),
    ("CRU-CON-HP-01", "Chancador Cónico HP800 01", "Chancado", "P02", "PMEC02"),
    ("CRU-CON-HP-02", "Chancador Cónico HP800 02", "Chancado", "P02", "PMEC02"),
    ("CRU-JAW-01", "Chancador Mandíbula 01", "Chancado", "P02", "PMEC02"),
    # Correas
    ("CVY-CV-001", "Correa Principal CV-001 · 1800t/h", "Transporte", "P02", "PMEC02"),
    ("CVY-CV-002", "Correa Secundaria CV-002", "Transporte", "P02", "PMEC02"),
    ("CVY-CV-003", "Correa Stock Pile CV-003", "Transporte", "P02", "PMEC02"),
    # Flotación
    ("FLT-CEL-RG-01", "Celda Rougher 01 · 300m³", "Flotación", "P03", "PMEC03"),
    ("FLT-CEL-RG-02", "Celda Rougher 02 · 300m³", "Flotación", "P03", "PMEC03"),
    ("FLT-CEL-CL-01", "Celda Cleaner 01 · 160m³", "Flotación", "P03", "PMEC03"),
    ("FLT-BCO-CND-01", "Banco Columnas Cleaner", "Flotación", "P03", "PMEC03"),
    # Espesadores
    ("THK-CNC-01", "Espesador Concentrado 01 · 40m", "Espesado", "P03", "PMEC03"),
    ("THK-REL-01", "Espesador Relaves 01 · 90m", "Tranque", "P04", "PMEC04"),
    ("THK-REL-02", "Espesador Relaves 02 · 90m", "Tranque", "P04", "PMEC04"),
    # Bombas
    ("PMP-SL-HP-001", "Bomba Slurry HP 001 · 650kW", "Molienda", "P01", "PMEC01"),
    ("PMP-SL-HP-002", "Bomba Slurry HP 002 · 650kW", "Molienda", "P01", "PMEC01"),
    ("PMP-AGUA-01", "Bomba Agua Proceso 01 · 250kW", "Servicios", "P04", "PMEC04"),
    ("PMP-REL-01", "Bomba Relaves 01 · 1200kW", "Tranque", "P04", "PMEC04"),
    # Eléctrico
    ("SUB-MT-P01", "Subestación MT Planta 01 · 23kV", "Eléctrico", "E01", "PELEC01"),
    ("SUB-AT-S01", "Subestación AT Mina · 220kV", "Eléctrico", "E01", "PELEC01"),
    ("MCC-ML-01", "MCC Molienda 01", "Eléctrico", "E01", "PELEC01"),
    ("TRF-PRI-01", "Transformador Principal 01 · 80MVA", "Eléctrico", "E01", "PELEC01"),
    # Instrumentación
    ("ANL-XRF-01", "Analizador XRF Courier", "Instrumentación", "I01", "PINST01"),
    ("DCS-PLT-01", "DCS Planta · Yokogawa", "Instrumentación", "I01", "PINST01"),
    ("PLC-FLT-01", "PLC Flotación · Rockwell", "Instrumentación", "I01", "PINST01"),
    # Compresores / Hidráulica
    ("COM-AIRE-01", "Compresor Aire 01 · 1800cfm", "Servicios", "H01", "PHIDR01"),
    ("COM-AIRE-02", "Compresor Aire 02 · 1800cfm", "Servicios", "H01", "PHIDR01"),
    ("HID-CEN-01", "Central Hidráulica Crusher", "Servicios", "H01", "PHIDR01"),
]

# Problemas típicos por tipo de equipo
FAILURE_SCENARIOS = {
    "ML": [  # Molinos
        ("Fuga de aceite en trunnion bearing", "P3", "Desgaste del sello primario, goteo observado durante turno noche. Volumen ~2 L/h."),
        ("Vibración anormal en pinion drive", "P2", "Vibración elevada en rodamiento de piñón, supera umbral alarma 5 mm/s RMS."),
        ("Ruido anormal en reductor", "P3", "Ruido metálico intermitente, probable falla de dentado."),
        ("Temperatura alta en lubrication unit", "P3", "Temperatura aceite lubricación sube de 55 a 72 °C, posible obstrucción filtro."),
        ("Desgaste avanzado en liners", "P4", "Medición UT indica 40% desgaste en liners de tapa alimentación."),
    ],
    "PMP": [
        ("Fuga en sello mecánico", "P2", "Sello primario perdiendo agua, flujo estimado 3 L/min. Requiere detención para cambio."),
        ("Vibración en descanso motor", "P3", "Vibración axial elevada en motor, rodamiento NDE deteriorado."),
        ("Cavitación por baja succión", "P3", "Ruido de cavitación y caída de eficiencia, revisar línea succión."),
        ("Impulsor desgastado", "P4", "Ovalización de impulsor por abrasión, programar cambio en próxima parada."),
    ],
    "CVY": [
        ("Desgaste avanzado en cinta", "P3", "Pérdida de espesor >20% en zona de impacto, riesgo de rotura."),
        ("Polines trabados", "P4", "3 polines detectados trabados en zona STK-001 a STK-015."),
        ("Desalineación de correa", "P3", "Correa se desvía 80mm en zona cola, requiere ajuste de polines guía."),
        ("Empalme deteriorado", "P2", "Delaminación en empalme vulcanizado zona cabeza, programar reemplazo."),
    ],
    "CRU": [
        ("Fuga hidráulica en ajuste", "P2", "Fuga continua en cilindro de ajuste de gap, pérdida presión sistema."),
        ("Falla rodamiento eje excéntrico", "P1", "Ruido crítico y temperatura 95°C, detener equipo antes de falla catastrófica."),
        ("Desgaste en manto y cóncavo", "P4", "Desgaste programado alcanzado 85%, cambio planificado."),
        ("Atoro de material no procesable", "P2", "Material no chancable atrapado en chamber, requiere rescate."),
    ],
    "FLT": [
        ("Agitador con vibración alta", "P3", "Mecanismo de agitación presenta vibración fuera de rango."),
        ("Falla en válvula dart", "P3", "Válvula dart de descarga pegada, no regula nivel correctamente."),
        ("Desgaste de impulsor rotor", "P4", "Programado — rotor de agitación con desgaste 60%."),
    ],
    "THK": [
        ("Falla torque mecanismo rastrillo", "P2", "Torque supera umbral, posible sedimento excesivo. Detener antes de daño."),
        ("Corrosión en base de mecanismo", "P4", "Inspección detectó corrosión en base, requiere tratamiento."),
    ],
    "SUB": [
        ("Alarma sobrecarga trafo", "P1", "Sobrecarga sostenida 110% en trafo principal, riesgo disparo."),
        ("Falla breaker MT", "P2", "Breaker MT no recierra tras falta, requiere mantenimiento."),
    ],
    "TRF": [
        ("Fuga de aceite", "P2", "Goteo constante en válvula de muestreo, pérdida ~5L/día."),
        ("Temperatura devanado alta", "P3", "Alarma de temperatura devanado en 85°C, ventilación forzada intermitente."),
    ],
    "MCC": [
        ("Contactor pegado en partidor", "P2", "Partidor de motor MCC-F15 no desengancha, reiniciar manualmente."),
    ],
    "DCS": [
        ("Falla comunicación módulo", "P3", "Módulo E/S 05-03 sin comunicación hace 4 horas."),
    ],
    "PLC": [
        ("Error CPU redundante", "P3", "CPU B marca error checksum, revisar firmware."),
    ],
    "ANL": [
        ("Calibración fuera de rango", "P3", "Desvío de lectura XRF vs ensayo químico > 8%, requiere recalibración."),
    ],
    "COM": [
        ("Temperatura descarga alta", "P3", "T° de descarga sube a 110°C, revisar aftercooler."),
        ("Falla válvula admisión", "P2", "Válvula admisión V-03 no modula correctamente."),
    ],
    "HID": [
        ("Contaminación de aceite", "P3", "Partículas Fe detectadas en análisis, cambio de aceite + filtros."),
    ],
}

# Operaciones típicas por tipo de trabajo
OPERATIONS_TEMPLATES = {
    "PMP_SELLO": [
        ("Bloqueo LOTO y despresurizar línea", "Mecánico", 0.5, 2),
        ("Drenar fluido y retirar acople", "Mecánico", 1.0, 2),
        ("Desmontar sello mecánico antiguo", "Mecánico", 1.5, 2),
        ("Limpieza e inspección de asientos", "Mecánico", 1.0, 1),
        ("Instalar sello nuevo según torque fabricante", "Mecánico", 2.0, 2),
        ("Reinstalar acople y alinear", "Mecánico", 1.5, 2),
        ("Prueba hidrostática y arranque", "Mecánico", 1.0, 2),
    ],
    "CVY_EMPALME": [
        ("Bloqueo y señalización LOTO", "Mecánico", 0.5, 2),
        ("Tensado y retiro de correa dañada", "Mecánico", 2.0, 3),
        ("Preparación de superficies empalme", "Mecánico", 1.5, 2),
        ("Vulcanizado en caliente (empalme)", "Mecánico", 4.0, 2),
        ("Aplicar presión y curado", "Mecánico", 2.0, 1),
        ("Alineación y tensionado", "Mecánico", 1.5, 2),
        ("Prueba de arranque con 30% carga", "Mecánico", 1.0, 2),
    ],
    "ML_LUBRICATION": [
        ("LOTO completo del molino", "Mecánico", 0.5, 2),
        ("Purga de sistema lubricación", "Mecánico", 1.0, 1),
        ("Cambio de filtros de alta presión", "Mecánico", 1.5, 2),
        ("Recarga de aceite ISO VG 320 (1200 L)", "Mecánico", 2.0, 2),
        ("Limpieza de intercambiador", "Mecánico", 2.0, 2),
        ("Verificación de presión y temperatura", "Instrumentista", 1.0, 1),
        ("Arranque y monitoreo 30 min", "Mecánico", 1.0, 2),
    ],
    "CRU_RODAMIENTO": [
        ("Parada coordinada chancado", "Mecánico", 1.0, 3),
        ("LOTO y aseguramiento de carga", "Mecánico", 1.0, 2),
        ("Retiro de coraza superior", "Mecánico", 4.0, 4),
        ("Desmontaje eje excéntrico", "Mecánico", 6.0, 4),
        ("Inspección y reemplazo rodamiento", "Mecánico", 4.0, 3),
        ("Montaje eje y alineación", "Mecánico", 6.0, 4),
        ("Cierre de coraza y verificación torque", "Mecánico", 3.0, 4),
        ("Arranque en vacío y pruebas", "Mecánico", 2.0, 3),
    ],
    "ELEC_TRF": [
        ("Coordinación con Operaciones y LOTO eléctrico", "Eléctrico", 1.5, 2),
        ("Descarga equipo y puesta a tierra", "Eléctrico", 1.0, 2),
        ("Retiro y ensayo de muestra aceite", "Eléctrico", 1.0, 1),
        ("Inspección termográfica bornas", "Eléctrico", 1.0, 1),
        ("Reparación o reemplazo elemento dañado", "Eléctrico", 3.0, 2),
        ("Prueba aislación y dieléctrico", "Eléctrico", 2.0, 1),
        ("Energización escalonada y verificación", "Eléctrico", 1.0, 2),
    ],
    "INST_CAL": [
        ("Preparación de estándares calibración", "Instrumentista", 1.0, 1),
        ("Rutina automática de autocalibración", "Instrumentista", 2.0, 1),
        ("Comparación vs ensayo químico lab", "Instrumentista", 1.5, 1),
        ("Ajuste de offsets por canal", "Instrumentista", 2.0, 1),
        ("Reporte final y certificado", "Instrumentista", 0.5, 1),
    ],
    "DEFAULT": [
        ("Bloqueo LOTO y perímetro seguridad", "Mecánico", 0.5, 2),
        ("Inspección visual y diagnóstico", "Mecánico", 1.0, 1),
        ("Ejecución de actividad principal", "Mecánico", 3.0, 2),
        ("Verificación y prueba funcional", "Mecánico", 1.0, 2),
        ("Cierre LOTO y puesta en servicio", "Mecánico", 0.5, 2),
    ],
}

# Materiales típicos
MATERIAL_CATALOG = [
    ("10002001", "Kit sello mecánico bomba centrífuga", "UN"),
    ("10002020", "Kit sellos rotor", "UN"),
    ("10002050", "Empaquetadura / junta de asiento", "UN"),
    ("10003010", "Rodamiento SKF 23256", "UN"),
    ("10003020", "Rodamiento SKF 22320 EK/C3", "UN"),
    ("10003030", "Rodamiento cónico FAG 32232", "UN"),
    ("10004010", "Aceite lubricante ISO VG 46", "LT"),
    ("10004020", "Aceite ISO VG 320 molino", "LT"),
    ("10004030", "Grasa lubricante NLGI 2", "KG"),
    ("10005010", "Pernos fijación M16×60 gr8.8", "UN"),
    ("10005015", "Pernos fijación M24×120 gr10.9", "UN"),
    ("10005020", "Tuercas M20 auto-frenantes", "UN"),
    ("10006001", "Cinta transportadora ST1800 · 1800mm", "ML"),
    ("10006010", "Kit empalme vulcanizado 1800mm", "UN"),
    ("10006020", "Polín de retorno ø152mm × 1200", "UN"),
    ("10006025", "Polín de carga ø152mm × 450", "UN"),
    ("10007010", "Cartucho filtro aire 420/95", "UN"),
    ("10007020", "Filtro hidráulico HP 25 micron", "UN"),
    ("10008010", "Manguera hidráulica HT-6 × 2m", "UN"),
    ("10008020", "Racor hidráulico NPT 3/4 x JIC", "UN"),
    ("10009010", "Tornillo de anclaje M30 × 400", "UN"),
    ("10009020", "Placa base impeller metálico", "UN"),
    ("10010010", "Coraza bola forjada 5\"", "KG"),
    ("10010020", "Liner tapa alimentación SAG", "UN"),
    ("10011010", "Contactor Siemens 3RT1076", "UN"),
    ("10011020", "Fusible NH3 315A", "UN"),
    ("10011030", "Relé térmico Schneider LRD3365", "UN"),
    ("10012010", "Sensor vibración CTC MH603", "UN"),
    ("10012020", "Transmisor temperatura Rosemount 3144P", "UN"),
    ("10012030", "Válvula solenoide Asco NF 3/4\"", "UN"),
]

# Técnicos chilenos con perfil completo
WORKFORCE_CATALOG = [
    # Mecánicos (más cantidad)
    ("Juan Pérez Soto", "MECANICO", "day", "5x2", ["Soldadura", "Hidráulica", "Altura"], ["LOTO", "Trabajo en Altura"]),
    ("Pedro Silva Muñoz", "MECANICO", "day", "5x2", ["Soldadura", "Neumática"], ["LOTO", "Espacio Confinado"]),
    ("Carlos Mendoza Lara", "MECANICO", "day", "5x2", ["Hidráulica", "Altura"], ["LOTO", "Trabajo en Altura"]),
    ("Luis Rojas Vidal", "MECANICO", "day", "5x2", ["Soldadura"], ["LOTO"]),
    ("Fernando Torres Díaz", "MECANICO", "day", "5x2", ["Vibraciones"], ["LOTO", "NFPA 70E"]),
    ("Hugo Martínez Paredes", "MECANICO", "day", "5x2", ["Hidráulica"], ["LOTO"]),
    ("Diego Castro Parra", "MECANICO", "day", "5x2", ["Soldadura", "Altura"], ["LOTO", "Trabajo en Altura"]),
    ("Rodrigo Figueroa Neira", "MECANICO", "day", "5x2", ["Neumática"], ["LOTO"]),
    ("Roberto Sepúlveda Cortés", "MECANICO", "day", "5x2", ["Soldadura", "Hidráulica"], ["LOTO"]),
    ("Marcelo Aguirre Reyes", "MECANICO", "day", "5x2", ["Vibraciones", "Termografía"], ["LOTO", "Primeros Auxilios"]),
    ("Sergio Valenzuela Rubio", "MECANICO", "night", "5x2", ["Hidráulica"], ["LOTO", "Espacio Confinado"]),
    ("Jaime Venegas Silva", "MECANICO", "night", "5x2", ["Soldadura"], ["LOTO"]),
    # Soldadores
    ("Manuel Fuentes Araya", "SOLDADOR", "day", "5x2", ["Soldadura", "Altura", "Espacio confinado"], ["LOTO", "Trabajo en Altura", "Espacio Confinado"]),
    ("Raúl Espinoza Palma", "SOLDADOR", "day", "5x2", ["Soldadura"], ["LOTO", "Trabajo en Altura"]),
    ("Víctor Herrera Quintana", "SOLDADOR", "day", "5x2", ["Soldadura", "Altura"], ["LOTO", "Trabajo en Altura"]),
    # Eléctricos
    ("Andrés García Ramírez", "ELECTRICO", "day", "5x2", ["Alta tensión", "PLC/DCS"], ["SEC Clase A", "NFPA 70E", "LOTO"]),
    ("Cristián Núñez Bravo", "ELECTRICO", "day", "5x2", ["Alta tensión"], ["SEC Clase A", "NFPA 70E"]),
    ("Claudio Pizarro Hernández", "ELECTRICO", "day", "5x2", ["PLC/DCS"], ["SEC Clase B", "NFPA 70E"]),
    ("Patricio Meneses Soto", "ELECTRICO", "night", "5x2", ["Alta tensión"], ["SEC Clase A", "NFPA 70E"]),
    ("José Araya Cortez", "ELECTRICO", "day", "5x2", ["PLC/DCS", "Termografía"], ["SEC Clase C", "NFPA 70E"]),
    # Instrumentistas
    ("Mauricio Olivares Tapia", "INSTRUMENTISTA", "day", "5x2", ["PLC/DCS", "Termografía"], ["SEC Clase C", "LOTO"]),
    ("Alejandro Becerra Álvarez", "INSTRUMENTISTA", "day", "5x2", ["PLC/DCS"], ["SEC Clase C"]),
    ("Felipe Cáceres Lillo", "INSTRUMENTISTA", "day", "5x2", ["Vibraciones"], ["LOTO"]),
    # Lubricadores
    ("Nelson Contreras Moya", "LUBRICADOR", "day", "5x2", [], ["LOTO"]),
    ("Raimundo Pino Salinas", "LUBRICADOR", "day", "5x2", [], ["LOTO"]),
    # Civil
    ("Gonzalo Yáñez Díaz", "CIVIL", "day", "5x2", ["Altura"], ["LOTO", "Trabajo en Altura"]),
    ("Pablo Medina Cortés", "CIVIL", "day", "5x2", ["Altura"], ["LOTO", "Trabajo en Altura"]),
    # Predictivo
    ("Francisco Rivas Guerra", "PREDICTIVO", "day", "5x2", ["Vibraciones", "Termografía"], ["LOTO"]),
    ("Eduardo Salgado Romero", "PREDICTIVO", "day", "5x2", ["Vibraciones", "Termografía"], ["LOTO"]),
    # 7x7 (turno remoto)
    ("Matías Bravo Quezada", "MECANICO", "day", "7x7", ["Soldadura", "Hidráulica"], ["LOTO", "Trabajo en Altura"]),
    ("Nicolás Oyarce Fuentes", "MECANICO", "day", "7x7", ["Soldadura"], ["LOTO"]),
    ("Álvaro Moreno Sánchez", "ELECTRICO", "day", "7x7", ["Alta tensión"], ["SEC Clase A"]),
    # Supervisores (se meten en workforce también)
    ("Ricardo Valdés Escobar", "MECANICO", "day", "5x2", ["Hidráulica", "Vibraciones"], ["LOTO", "Primeros Auxilios"]),
    ("María González Soto", "ELECTRICO", "day", "5x2", ["Alta tensión", "PLC/DCS"], ["SEC Clase A", "NFPA 70E"]),
    ("Catalina Molina Flores", "INSTRUMENTISTA", "day", "5x2", ["PLC/DCS"], ["SEC Clase C"]),
]


# ═══════════════════════════════════════════════════════════════════════
# LIMPIEZA
# ═══════════════════════════════════════════════════════════════════════

def wipe_plant_data(db):
    """Wipe NUCLEAR para demo limpio. Borra TODO work_request + managed_wo +
    workforce de todas las plantas. WR no tiene plant_id entonces hay que
    arrasar. Usar solo para entorno de demo."""
    print(f"[wipe] Limpiando TODA la data (WRs + WOs + workforce + audit)...")
    # Orden importa por foreign keys. Desactivo FK temporalmente para SQLite.
    try:
        db.execute(text("PRAGMA foreign_keys = OFF"))
    except Exception:
        pass
    stmts = [
        "DELETE FROM field_captures",  # FK hacia work_requests
        "DELETE FROM backlog_items",
        "DELETE FROM managed_work_orders",
        "DELETE FROM work_requests",
        "DELETE FROM workforce",
        "DELETE FROM audit_log",
        # Reliability data — Jorge 17:56
        "DELETE FROM improvement_actions",
        "DELETE FROM rca_analyses",
        "DELETE FROM fmeca_worksheets",
    ]
    for s in stmts:
        try:
            r = db.execute(text(s))
            print(f"  ✓ {r.rowcount} rows · {s[:80]}")
        except Exception as e:
            print(f"  ! skip ({str(e)[:60]})")
    db.commit()


# ═══════════════════════════════════════════════════════════════════════
# WORKFORCE
# ═══════════════════════════════════════════════════════════════════════

def seed_workforce(db):
    print(f"[workforce] Creando {len(WORKFORCE_CATALOG)} técnicos...")
    base_date = "2026-04-14"  # lunes para ciclos 7x7
    count = 0
    for (name, specialty, shift, pattern, skills, certs) in WORKFORCE_CATALOG:
        w = WorkforceModel(
            name=name,
            specialty=specialty,
            shift=shift,
            plant_id=PLANT,
            available=True,
            years_experience=random.randint(3, 25),
            competency_level=random.choice(["A", "A", "B", "B", "C"]),
            safety_training_current=True,
            certifications=certs,
            skills=skills,
            shift_pattern=pattern,
            shift_cycle_start=base_date if pattern in ("7x7", "14x14") else None,
        )
        db.add(w)
        count += 1
    db.commit()
    print(f"  ✓ {count} técnicos creados")
    return count


# ═══════════════════════════════════════════════════════════════════════
# MATERIALES (ensure catalog exists)
# ═══════════════════════════════════════════════════════════════════════

def seed_materials(db):
    print("[materials] Verificando catálogo SAP...")
    existing = {r[0] for r in db.execute(text("SELECT sap_id FROM sap_materials")).fetchall()}
    added = 0
    for code, desc, unit in MATERIAL_CATALOG:
        if code in existing:
            continue
        try:
            db.execute(text(
                "INSERT INTO sap_materials (sap_id, description, category, unit) VALUES (:c, :d, :cat, :u)"
            ), {"c": code, "d": desc, "cat": "REPUESTO", "u": unit})
            added += 1
        except Exception:
            pass
    db.commit()
    print(f"  ✓ {added} materiales agregados al catálogo")


# ═══════════════════════════════════════════════════════════════════════
# WRs + OTs
# ═══════════════════════════════════════════════════════════════════════

def _pick_scenario(equip_tag):
    """Devuelve (problem, priority, description) basado en el tag."""
    prefix = None
    for p in ["BRY", "PMP", "CVY", "CRU", "FLT", "THK", "SUB", "MCC", "TRF", "DCS", "PLC", "ANL", "COM", "HID"]:
        if equip_tag.startswith(p):
            prefix = p
            break
    # Map prefix to scenario key
    key_map = {
        "BRY": "ML", "PMP": "PMP", "CVY": "CVY", "CRU": "CRU",
        "FLT": "FLT", "THK": "THK", "SUB": "SUB", "MCC": "MCC",
        "TRF": "TRF", "DCS": "DCS", "PLC": "PLC", "ANL": "ANL",
        "COM": "COM", "HID": "HID",
    }
    key = key_map.get(prefix, "PMP")
    return random.choice(FAILURE_SCENARIOS.get(key, FAILURE_SCENARIOS["PMP"]))


def _pick_ops_template(equip_tag, problem):
    """Devuelve lista de operaciones según equipo + problema."""
    pl = problem.lower()
    if "sello" in pl and equip_tag.startswith("PMP"):
        return OPERATIONS_TEMPLATES["PMP_SELLO"]
    if "cinta" in pl or "empalme" in pl:
        return OPERATIONS_TEMPLATES["CVY_EMPALME"]
    if "lubric" in pl or ("aceite" in pl and equip_tag.startswith("BRY")):
        return OPERATIONS_TEMPLATES["ML_LUBRICATION"]
    if "rodamiento" in pl and equip_tag.startswith("CRU"):
        return OPERATIONS_TEMPLATES["CRU_RODAMIENTO"]
    if equip_tag.startswith(("SUB", "TRF", "MCC")):
        return OPERATIONS_TEMPLATES["ELEC_TRF"]
    if equip_tag.startswith(("ANL", "DCS", "PLC")):
        return OPERATIONS_TEMPLATES["INST_CAL"]
    return OPERATIONS_TEMPLATES["DEFAULT"]


def _pick_materials(equip_tag, problem):
    """Selecciona 2-5 materiales relevantes."""
    pl = problem.lower()
    out = []
    if "sello" in pl:
        out += [("10002001", "Kit sello mecánico bomba centrífuga", "UN", 1, 450),
                ("10002050", "Empaquetadura / junta de asiento", "UN", 2, 18)]
    if "rodamiento" in pl:
        out += [("10003020", "Rodamiento SKF 22320 EK/C3", "UN", 2, 1200),
                ("10004030", "Grasa lubricante NLGI 2", "KG", 3, 28)]
    if "cinta" in pl or "empalme" in pl:
        out += [("10006001", "Cinta transportadora ST1800 · 1800mm", "ML", 30, 180),
                ("10006010", "Kit empalme vulcanizado 1800mm", "UN", 1, 1850)]
    if "aceite" in pl or "lubric" in pl:
        out += [("10004020", "Aceite ISO VG 320 molino", "LT", 1200, 3.2),
                ("10007020", "Filtro hidráulico HP 25 micron", "UN", 4, 88)]
    if "filtro" in pl:
        out += [("10007010", "Cartucho filtro aire 420/95", "UN", 2, 65)]
    if "vibra" in pl:
        out += [("10012010", "Sensor vibración CTC MH603", "UN", 1, 340)]
    if equip_tag.startswith(("SUB", "TRF", "MCC")):
        out += [("10011010", "Contactor Siemens 3RT1076", "UN", 1, 280),
                ("10011030", "Relé térmico Schneider LRD3365", "UN", 1, 95)]
    # Always pernos genéricos
    out.append(("10005010", "Pernos fijación M16×60 gr8.8", "UN", random.randint(4, 24), 1.2))
    # Dedupe por código
    seen = set()
    clean = []
    for m in out:
        if m[0] in seen:
            continue
        seen.add(m[0])
        clean.append(m)
    return clean[:6]


def _next_aviso_number(db) -> int:
    """Devuelve el siguiente número correlativo de Aviso."""
    r = db.execute(text("SELECT COALESCE(MAX(aviso_number), 0) + 1 FROM work_requests")).scalar()
    return int(r or 1)


def _generate_wr_and_wo(db, idx, workers, now):
    """Genera 1 WR + 1 OT con estados distribuidos."""
    equip = random.choice(EQUIPMENT_CATALOG)
    equip_tag, equip_name, area, pg, wc = equip
    problem, priority, description = _pick_scenario(equip_tag)

    # Distribuir creación en últimos 45 días
    created_at = now - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23))

    # Crear WR con TODOS los campos que el UI espera
    whenHappens = random.choice(["Durante turno día", "Durante turno noche", "Durante el arranque", "En operación continua"])
    full_text = f"{problem}. {whenHappens}. {description}"
    est_hrs = random.choice([4, 6, 8, 12, 16, 24])
    prod_impact = "HIGH" if priority == "P1" else "MEDIUM" if priority == "P2" else "LOW"

    wr = WorkRequestModel(
        aviso_number=_next_aviso_number(db),
        equipment_id=equip_tag,
        equipment_tag=equip_tag,
        equipment_confidence=round(random.uniform(0.85, 0.99), 2),
        resolution_method="MANUAL" if random.random() > 0.3 else "AI",
        status="APROBADO",
        problem_description={
            "whatHappens": problem,
            "whenHappens": whenHappens,
            "triggerEvent": random.choice(["Alarma DCS", "Inspección visual", "Reporte mantenedor", "Análisis predictivo"]),
            "impact": random.choice(["Sin impacto aún", "Pérdida parcial de capacidad", "Degradación progresiva", "Alarma crítica activa"]),
            "original_text": full_text,
            "structured_description": problem,
            "technical_location": equip_tag,
            "technical_location_code": equip_tag,
            "failure_mode_detected": problem[:50],
            "failure_mode_code": problem.split(" ")[0][:10].upper(),
            "wo_title": f"{equip_tag} — {problem[:40]}",
        },
        ai_classification={
            "failure_mode": problem[:80],
            "suggested_specialty": "MECANICO",
            "estimated_hours": est_hrs,
            "estimated_duration_hours": est_hrs,
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "probable_cause": f"Causa raíz presumida: {description[:60]}",
            "plant_id": PLANT,
            "wo_title": f"{equip_tag} — {problem[:40]}",
            "production_impact": prod_impact,
            "required_specialties": ["Mecánico"],
            "priority_suggested": priority,
            "equipment_name": equip_tag,
        },
        spare_parts=[{"code": m[0], "name": m[1], "description": m[1], "qty": m[3], "quantity": m[3]} for m in _pick_materials(equip_tag, problem)[:3]],
        priority_code=priority,
        work_class="NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO",
        created_by="admin",
        reported_by="mantenedor_turno",
        reported_at=created_at,
        circumstances=description,
        planning_group=pg,
        work_center=wc,
        created_at=created_at,
        approval_comment="Aprobado para ejecución",
        approved_at=created_at + timedelta(hours=random.randint(1, 8)),
    )
    db.add(wr)
    db.flush()

    # Crear OT
    # Mapping prioridad → tipo
    wo_type = "PM03" if priority in ("P1", "P2") else "PM01"
    estimated = float(wr.ai_classification.get("estimated_hours", 8))
    ops_template = _pick_ops_template(equip_tag, problem)
    operations = [
        {
            "op_number": op_idx + 1,
            "type": "INT",
            "op_type": "INT",
            "description": op_desc,
            "specialty": spec,
            "quantity": qty,
            "hours": hrs,
            "duration": hrs,
            "planned_hours": hrs,
            "estimated_hours": hrs,
            "actual_hours": 0.0,
            "completion_pct": 0.0,
            "status": "PENDING",
            "notifications": [],
            "parallel": False,
        }
        for op_idx, (op_desc, spec, hrs, qty) in enumerate(ops_template)
    ]
    total_hh = sum(o["hours"] * o["quantity"] for o in operations)
    # SF-588 — clasificar cada material por clase de gasto SAP
    def _cost_element_of(desc):
        d = (desc or "").lower()
        if any(k in d for k in ("aceite", "grasa", "lubric", "oil")): return "INSUMO_LUBRICANTE"
        if any(k in d for k in ("filtro", "cinta", "polin", "manguera", "racor", "perno", "tuerca")): return "REPUESTO_CONSUMIBLE"
        if any(k in d for k in ("rodamiento", "sello", "kit", "liner", "coraza", "impeller")): return "REPUESTO_CRITICO"
        if any(k in d for k in ("contactor", "fusible", "relé", "sensor", "transmisor", "válvula")): return "REPUESTO_ELECTRICO"
        if any(k in d for k in ("herramienta", "andamio", "grúa", "mandil")): return "HERRAMIENTA_EQUIPO"
        return "REPUESTO_CONSUMIBLE"
    materials = [
        {
            "code": m[0], "sap_id": m[0], "sapId": m[0],
            "description": m[1], "unit": m[2], "quantity": m[3], "unit_price": m[4],
            "cost_element": _cost_element_of(m[1]),
        }
        for m in _pick_materials(equip_tag, problem)
    ]

    # Distribución de estados para tener variedad
    status_bucket = idx % 10
    if wo_type == "PM03":
        # PM03 va directo a PROGRAMADO o EN_EJECUCION o CERRADO
        if status_bucket < 3:
            status = "PROGRAMADO"
        elif status_bucket < 5:
            status = "EN_EJECUCION"
        else:
            status = "CERRADO"
    else:
        if status_bucket == 0:
            status = "LIBERADO"
        elif status_bucket == 1:
            status = "PLANIFICADO"
        elif status_bucket == 2:
            status = "EN_PROGRAMACION"
        elif status_bucket in (3, 4, 5):
            status = "PROGRAMADO"
        elif status_bucket == 6:
            status = "EN_EJECUCION"
        else:
            status = "CERRADO"

    # Fechas coherentes
    planned_start = created_at + timedelta(days=random.randint(2, 14))
    duration_days = max(1, int(total_hh / 10))
    planned_end = planned_start + timedelta(days=duration_days)

    # Técnicos asignados por especialidad
    main_spec = operations[0]["specialty"].upper()
    spec_map = {"MECÁNICO": "MECANICO", "ELÉCTRICO": "ELECTRICO", "INSTRUMENTISTA": "INSTRUMENTISTA"}
    main_spec_norm = spec_map.get(main_spec, main_spec)
    candidates = [w for w in workers if w.specialty == main_spec_norm]
    if not candidates:
        candidates = workers
    assigned = random.sample(candidates, min(random.randint(1, 3), len(candidates)))
    assigned_workers = [
        {"worker_id": w.worker_id, "name": w.name, "specialty": w.specialty}
        for w in assigned
    ]

    labor_cost = round(total_hh * 50, 2)
    material_cost = round(sum(m["quantity"] * m["unit_price"] for m in materials), 2)

    # Equipos de apoyo (Jorge 2026-04-28 17:56) — algunas OTs requieren grúa, mandil, andamios
    SUPPORT_EQUIPS_CATALOG = [
        {"tag": "GRUA-50T-01", "name": "Grúa móvil 50T #1", "equipment_type": "MOBILE_CRANE", "hours": 4},
        {"tag": "GRUA-100T-01", "name": "Grúa móvil 100T #1", "equipment_type": "MOBILE_CRANE", "hours": 6},
        {"tag": "PUENTE-A-01", "name": "Puente grúa Área Molienda", "equipment_type": "BRIDGE_CRANE", "hours": 2},
        {"tag": "MAN-HID-01", "name": "Mandil hidráulico", "equipment_type": "HYDRAULIC_TRUCK", "hours": 3},
        {"tag": "AND-MOV-01", "name": "Andamio móvil 6m", "equipment_type": "SCAFFOLDING", "hours": 8},
        {"tag": "MONT-15T-01", "name": "Montacargas 15T", "equipment_type": "FORKLIFT", "hours": 2},
    ]
    needs_support = ("sello" in problem.lower() or "rodamiento" in problem.lower()
                     or "motor" in problem.lower() or equip_tag.startswith(("BRY", "PMP", "CRU"))
                     or random.random() < 0.3)
    support_equipment = random.sample(SUPPORT_EQUIPS_CATALOG, k=random.randint(1, 2)) if needs_support else []
    # Reservation code
    reservation_code = f"RES-{random.randint(700000, 999999)}" if status not in ("LIBERADO", "CREADO") else None
    if reservation_code:
        for m in materials:
            m["reservation_code"] = reservation_code

    wo_number = f"OT-2026-{50000 + idx:05d}"
    wo = ManagedWorkOrderModel(
        wo_number=wo_number,
        work_request_id=wr.request_id,
        plant_id=PLANT,
        equipment_id=equip_tag,
        equipment_tag=equip_tag,
        description=problem + " — " + equip_name,
        wo_type=wo_type,
        priority_code=priority,
        work_class="NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO",
        operations=operations,
        materials=materials,
        estimated_hours=total_hh,
        status=status,
        planning_group=pg,
        work_center=wc,
        planned_start=planned_start if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO") else None,
        planned_end=planned_end if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO") else None,
        assigned_workers=assigned_workers if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO") else None,
        labor_cost=labor_cost,
        material_cost=material_cost,
        actual_total_cost=labor_cost + material_cost,
        budget_amount=round((labor_cost + material_cost) * 1.1, 2),
        budget_approved=True,
        is_fast_track=(priority in ("P1", "P2")),
        planned_by="planificador_ocp",
        released_by="planificador_ocp" if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO") else None,
        released_at=created_at + timedelta(days=2) if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO") else None,
        reservation_code=reservation_code,
        support_equipment=support_equipment,
        reservation_codes=[reservation_code] if reservation_code else None,
        created_at=created_at,
        updated_at=created_at + timedelta(days=random.randint(1, 7)),
    )

    # Para CERRADO llenar actuals + firma + notificaciones parciales SP5 (SF-572)
    if status == "CERRADO":
        wo.actual_start = planned_start + timedelta(hours=random.randint(-2, 4))
        duration_actual = int(total_hh * random.uniform(0.85, 1.25))
        wo.actual_end = wo.actual_start + timedelta(hours=duration_actual)
        wo.actual_hours = round(total_hh * random.uniform(0.85, 1.25), 1)
        wo.completion_pct = 100.0
        wo.closed_by = "supervisor_ocp"
        wo.closed_at = wo.actual_end
        supervisor_names = ["Ricardo Valdés", "María González", "Catalina Molina"]
        wo.closed_by_signature = random.choice(supervisor_names)
        wo.closure_notes = random.choice([
            "Trabajo completado sin observaciones. Equipo operando normal.",
            "Se detectó desgaste secundario que se documentó para próximo preventivo.",
            "Requirió tiempo adicional por imprevistos en desmontaje.",
            "OK — pruebas funcionales satisfactorias.",
        ])
        # Supervisor validation pre-cierre (SF-573)
        wo.supervisor_validated_by = "supervisor_ocp" if hasattr(wo, "supervisor_validated_by") else None
        # Update ops con actuals + historial de notificaciones parciales (SF-572)
        worker_names = [w["name"] for w in assigned_workers] or ["Juan Pérez Soto"]
        for op in wo.operations:
            planned_h = float(op.get("planned_hours") or op.get("hours") or 0)
            actual_h = round(planned_h * random.uniform(0.9, 1.2), 2)
            op["actual_hours"] = actual_h
            op["completion_pct"] = 100.0
            op["status"] = "COMPLETED"
            # Si el op es largo (>4h), simular 2-3 partials multi-turno
            n_partials = 1 if planned_h <= 4 else random.randint(2, 3)
            partial_h = round(actual_h / n_partials, 2)
            op_notifs = []
            for k in range(n_partials):
                op_notifs.append({
                    "type": "PARTIAL",
                    "hours": partial_h if k < n_partials - 1 else round(actual_h - partial_h * (n_partials - 1), 2),
                    "technician_id": random.choice(worker_names),
                    "shift": random.choice(["day", "night"]),
                    "note": None,
                    "timestamp": (wo.actual_start + timedelta(hours=k * 4)).isoformat(),
                    "user": "supervisor_ocp",
                })
            op["notifications"] = op_notifs
    elif status == "EN_EJECUCION":
        wo.actual_start = planned_start + timedelta(hours=random.randint(-2, 4))
        wo.completion_pct = random.choice([25, 40, 50, 65, 75])
        # Algunas ops ya tienen partials; el resto pendientes
        n_done = max(1, int(len(wo.operations) * (wo.completion_pct / 100)))
        worker_names = [w["name"] for w in assigned_workers] or ["Juan Pérez Soto"]
        for idx, op in enumerate(wo.operations):
            if idx < n_done:
                planned_h = float(op.get("planned_hours") or op.get("hours") or 0)
                actual_h = round(planned_h * random.uniform(0.6, 1.0), 2)
                op["actual_hours"] = actual_h
                op["completion_pct"] = round(min(100, actual_h / planned_h * 100 if planned_h > 0 else 0), 1)
                op["status"] = "COMPLETED" if op["completion_pct"] >= 100 else "IN_PROGRESS"
                op["notifications"] = [{
                    "type": "PARTIAL",
                    "hours": actual_h,
                    "technician_id": random.choice(worker_names),
                    "shift": "day",
                    "note": None,
                    "timestamp": wo.actual_start.isoformat(),
                    "user": "supervisor_ocp",
                }]

    # execution_notes timeline
    notes = []
    notes.append({"timestamp": created_at.isoformat(), "user": "system", "note": "OT creada desde WR aprobada"})
    if status in ("PROGRAMADO", "EN_EJECUCION", "CERRADO"):
        notes.append({"timestamp": (created_at + timedelta(days=2)).isoformat(), "user": "planificador_ocp", "note": "OT programada y reservada"})
    if status in ("EN_EJECUCION", "CERRADO"):
        notes.append({"timestamp": (wo.actual_start or planned_start).isoformat(), "user": "supervisor_ocp", "note": "Inicio ejecución"})
    if status == "CERRADO":
        notes.append({"timestamp": wo.closed_at.isoformat(), "user": "supervisor_ocp", "note": f"Cierre firmado por {wo.closed_by_signature}"})
    wo.execution_notes = notes
    wo.version = len(notes)

    db.add(wo)

    # Marcar WR como consumido
    wr.status = "OT_CREADA"

    return wr, wo


def seed_standalone_wrs(db, count_pending=20, count_approved=10, count_rejected=8, count_cancelled=2):
    """WRs que NO tienen OT todavía — para alimentar el tab Identification:
    PENDIENTE (esperando revisión), APROBADO (listo para convertir),
    RECHAZADO (devuelto al mantenedor), CANCELADO."""
    print(f"[wrs standalone] {count_pending}P + {count_approved}A + {count_rejected}R + {count_cancelled}C...")
    now = datetime.now()
    total = count_pending + count_approved + count_rejected + count_cancelled

    rejection_reasons = [
        "Duplicado con WR-2026-00087. Coordinar con supervisor para consolidar.",
        "Falta información técnica — especificar condición del equipo al momento de la falla.",
        "El equipo está en plan de mantenimiento programado la próxima semana, no requiere OT adicional.",
        "Prioridad asignada incorrecta — reclasificar según matriz de criticidad.",
        "Equipo fuera de servicio por razones operacionales, no es falla de mantención.",
    ]

    for i in range(total):
        equip = random.choice(EQUIPMENT_CATALOG)
        equip_tag, equip_name, area, pg, wc = equip
        problem, priority, description = _pick_scenario(equip_tag)
        created_at = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))

        if i < count_pending:
            status = "PENDIENTE"
            approved_at = None
            approval_comment = None
            rejection_reason = None
        elif i < count_pending + count_approved:
            status = "APROBADO"
            approved_at = created_at + timedelta(hours=random.randint(1, 24))
            approval_comment = random.choice([
                "Aprobado. Coordinar con operaciones ventana detención.",
                "OK · proceder con planificación, repuestos disponibles.",
                "Aprobado, validar equipos de apoyo antes de asignar.",
            ])
            rejection_reason = None
        elif i < count_pending + count_approved + count_rejected:
            status = "RECHAZADO"
            approved_at = None
            approval_comment = None
            rejection_reason = random.choice(rejection_reasons)
        else:
            status = "CANCELADO"
            approved_at = None
            approval_comment = "Cancelado por mantenedor — falla se autoresolvió."
            rejection_reason = None

        wr = WorkRequestModel(
            aviso_number=_next_aviso_number(db),
            equipment_id=equip_tag,
            equipment_tag=equip_tag,
            equipment_confidence=round(random.uniform(0.80, 0.98), 2),
            resolution_method="AI" if random.random() > 0.5 else "MANUAL",
            status=status,
            problem_description=(lambda whn=random.choice(["Durante turno día", "Durante turno noche", "Durante el arranque", "En operación continua"]): {
                "whatHappens": problem,
                "whenHappens": whn,
                "triggerEvent": random.choice(["Alarma DCS", "Inspección visual", "Reporte mantenedor", "Análisis predictivo"]),
                "impact": random.choice(["Sin impacto aún", "Pérdida parcial de capacidad", "Degradación progresiva"]),
                "original_text": f"{problem}. {whn}. {description}",
                "structured_description": problem,
                "technical_location": equip_tag,
                "technical_location_code": equip_tag,
                "failure_mode_detected": problem[:50],
                "failure_mode_code": problem.split(" ")[0][:10].upper(),
                "wo_title": f"{equip_tag} — {problem[:40]}",
            })(),
            ai_classification=(lambda eh=random.choice([4, 6, 8, 12, 16]): {
                "failure_mode": problem[:80],
                "suggested_specialty": "MECANICO",
                "estimated_hours": eh,
                "estimated_duration_hours": eh,
                "confidence": round(random.uniform(0.75, 0.95), 2),
                "probable_cause": description[:80],
                "plant_id": PLANT,
                "wo_title": f"{equip_tag} — {problem[:40]}",
                "production_impact": "HIGH" if priority == "P1" else "MEDIUM" if priority == "P2" else "LOW",
                "required_specialties": ["Mecánico"],
                "priority_suggested": priority,
                "equipment_name": equip_tag,
            })(),
            spare_parts=[{"code": m[0], "name": m[1], "description": m[1], "qty": m[3], "quantity": m[3]} for m in _pick_materials(equip_tag, problem)[:3]],
            priority_code=priority,
            work_class="NO_PROGRAMADO" if priority in ("P1", "P2") else "PROGRAMADO",
            created_by=random.choice(["tecnico_1", "tecnico_2", "tecnico_3", "supervisor_ocp"]),
            reported_by=random.choice(["mantenedor_turno", "supervisor_area", "operaciones"]),
            reported_at=created_at,
            circumstances=description,
            planning_group=pg,
            work_center=wc,
            created_at=created_at,
            approved_at=approved_at,
            approval_comment=approval_comment,
            rejection_reason=rejection_reason,
        )
        db.add(wr)

    db.commit()
    print(f"  ✓ {total} WRs standalone creados")


def seed_critical_equipment_hierarchy(db):
    """Crea hierarchy_nodes con criticality A/B/C/D para los equipos del catálogo.
    A = molinos SAG/Bolas (críticos máximos). B = chancadores, bombas slurry, subestaciones.
    C = correas, celdas. D = compresores, equipos auxiliares.
    """
    from api.database.models import HierarchyNodeModel
    print("[hierarchy] Creando nodos de equipos con criticidad...")
    crit_map = {
        "BRY-SAG-ML-001": "A", "BRY-SAG-ML-002": "A",
        "BRY-BAL-ML-001": "A", "BRY-BAL-ML-002": "A",
        "BRY-CYC-NST-01": "B",
        "CRU-GIR-01": "A", "CRU-CON-HP-01": "B", "CRU-CON-HP-02": "B", "CRU-JAW-01": "B",
        "CVY-CV-001": "B", "CVY-CV-002": "C", "CVY-CV-003": "C",
        "FLT-CEL-RG-01": "C", "FLT-CEL-RG-02": "C", "FLT-CEL-CL-01": "C", "FLT-BCO-CND-01": "C",
        "THK-CNC-01": "B", "THK-REL-01": "B", "THK-REL-02": "B",
        "PMP-SL-HP-001": "B", "PMP-SL-HP-002": "B", "PMP-AGUA-01": "C", "PMP-REL-01": "B",
        "SUB-MT-P01": "A", "SUB-AT-S01": "A", "MCC-ML-01": "B", "TRF-PRI-01": "A",
        "ANL-XRF-01": "C", "DCS-PLT-01": "B", "PLC-FLT-01": "C",
        "COM-AIRE-01": "C", "COM-AIRE-02": "C", "HID-CEN-01": "C",
    }
    # Plant + area nodes (parent)
    plant_node = db.query(HierarchyNodeModel).filter_by(code=PLANT, node_type="PLANT").first()
    if not plant_node:
        plant_node = HierarchyNodeModel(
            node_type="PLANT", name="Goldfields Salares Norte", code=PLANT,
            level=1, plant_id=PLANT, criticality="A",
        )
        db.add(plant_node); db.flush()
    count = 0
    for tag, name, area, pg, wc in EQUIPMENT_CATALOG:
        existing = db.query(HierarchyNodeModel).filter_by(code=tag).first()
        if existing:
            existing.criticality = crit_map.get(tag, "C")
            existing.tag = tag
            continue
        node = HierarchyNodeModel(
            node_type="EQUIPMENT", name=name, code=tag, tag=tag,
            parent_node_id=plant_node.node_id,
            level=4, plant_id=PLANT,
            criticality=crit_map.get(tag, "C"),
            sap_func_loc=wc,
        )
        db.add(node); count += 1
    db.commit()
    print(f"  ✓ {count} equipos creados con criticality")


def seed_rca_and_capa(db):
    """Crea ~6 análisis RCA con solutions + ImprovementActions (CAPA) — algunas
    abiertas, algunas vencidas (close-the-loop visible), algunas cerradas."""
    from api.database.models import RCAAnalysisModel, ImprovementActionModel
    from datetime import date, timedelta
    print("[rca] Creando 6 RCAs + ~12 acciones de mejora...")
    now = datetime.now()
    rca_specs = [
        ("BRY-SAG-ML-001", "Falla recurrente en sello de trunnion bearing", "REVIEWED", "Material del sello no resistente a temperatura operativa", -45),
        ("PMP-SL-HP-001", "Sobrecalentamiento sostenido en motor", "COMPLETED", "Filtros de admisión obstruidos por presencia de polvo", -30),
        ("CRU-CON-HP-01", "Vibración elevada en cone crusher", "UNDER_INVESTIGATION", "Posible desgaste irregular del bowl liner", -7),
        ("CVY-CV-001", "Empalmes de cinta fallando antes de tiempo", "OPEN", "Calidad del kit de empalme actual deficiente", -3),
        ("SUB-MT-P01", "Falla en interruptor MT recurrente", "REVIEWED", "Configuración relé térmico incorrecta", -60),
        ("BRY-BAL-ML-001", "Bajo rendimiento del molino de bolas", "COMPLETED", "Carga de bolas fuera de rango óptimo", -20),
    ]
    rca_ids = []
    for tag, event, status, root_cause, days_ago in rca_specs:
        rca = RCAAnalysisModel(
            event_description=event,
            plant_id=PLANT,
            equipment_id=tag,
            level="LEVEL_2",
            status=status,
            team_members=["Ingeniero Confiabilidad", "Supervisor Mecánico", "Operaciones"],
            analysis_5w2h={
                "what": event,
                "when": (now + timedelta(days=days_ago)).isoformat(),
                "where": tag,
                "who": "Equipo mantenimiento",
                "why": root_cause,
                "how": "Detectado en inspección rutina + análisis vibracional",
                "how_much": "Pérdida estimada $15-25k por evento",
            },
            cause_effect={
                "causes": [
                    {"description": root_cause, "score": 0.85, "category": "Material/Calidad"},
                    {"description": "Procedimiento de instalación no optimizado", "score": 0.45, "category": "Método"},
                ],
            },
            solutions=[
                {"description": f"Cambiar a material/proveedor alternativo", "type": "CORRECTIVE", "priority": "HIGH", "responsible": "Compras"},
                {"description": f"Actualizar procedimiento estándar y capacitar", "type": "PREVENTIVE", "priority": "MEDIUM", "responsible": "Confiabilidad"},
            ],
            created_at=now + timedelta(days=days_ago),
            completed_at=now + timedelta(days=days_ago + 14) if status in ("COMPLETED", "REVIEWED") else None,
        )
        db.add(rca); db.flush()
        rca_ids.append((rca.analysis_id, tag, event))
    db.commit()
    # Crear ImprovementActions a partir de los RCAs
    actions_created = 0
    for rca_id, tag, event in rca_ids:
        # 2 acciones por RCA: 1 corrective abierta + 1 preventive (random vencida o cerrada)
        statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "OPEN"]  # algunas abiertas, otras cerradas
        for j, (typ, prio, status) in enumerate([
            ("CORRECTIVE", "HIGH", random.choice(statuses)),
            ("PREVENTIVE", "MEDIUM", random.choice(statuses)),
        ]):
            target_offset = random.randint(-30, 14)  # algunas pasadas (vencidas), otras futuras
            target_dt = (date.today() + timedelta(days=target_offset))
            action = ImprovementActionModel(
                title=f"{event[:80]} — Acción {j+1}",
                description=f"Acción derivada de RCA {rca_id[:8]}",
                plant_id=PLANT,
                equipment_id=tag,
                equipment_tag=tag,
                source_type="RCA",
                source_ref=rca_id,
                action_type=typ,
                priority=prio,
                category=random.choice(["Strategy", "Planning", "Spare Parts", "Procedures", "Training"]),
                assigned_to=random.choice(["Ricardo Valdés", "María González", "Catalina Molina", "Pedro Silva"]),
                created_by="ingeniero_confiabilidad",
                target_date=target_dt,
                status=status,
                completed_at=now if status == "COMPLETED" else None,
                ai_generated=False,
                notes=f"Plan: implementar mejora identificada en RCA. Equipo crítico {tag}.",
            )
            db.add(action); actions_created += 1
    db.commit()
    print(f"  ✓ {len(rca_ids)} RCAs + {actions_created} ImprovementActions")


def seed_fmeca_worksheets(db):
    """Crea FMECA worksheets con rows para 4 equipos críticos (top RPN para Pareto/insights)."""
    from api.database.models import FMECAWorksheetModel
    print("[fmeca] Creando 4 FMECA worksheets...")
    worksheets = [
        ("BRY-SAG-ML-001", "Molino SAG 01", [
            ("Sello trunnion", "Fuga de aceite progresiva", "Desgaste sello", 8, 6, 5, "Inspeccion visual cada 30 dias"),
            ("Pinion drive", "Vibracion alta", "Desalineacion", 7, 4, 6, "Analisis vibracional mensual"),
            ("Lubricacion", "Temperatura alta", "Filtro obstruido", 6, 5, 7, "Cambio filtro segun pauta"),
            ("Liners", "Desgaste avanzado", "Vida util agotada", 5, 7, 4, "Medicion UT cada 60 dias"),
        ]),
        ("PMP-SL-HP-001", "Bomba Slurry HP 001", [
            ("Sello mecanico", "Fuga primaria", "Desgaste sello", 9, 6, 5, "Inspeccion semanal"),
            ("Rodamiento", "Ruido anormal", "Lubricacion deficiente", 8, 5, 6, "Engrase cada 7 dias"),
            ("Impeller", "Cavitacion", "NPSH insuficiente", 7, 3, 7, "Monitor presion succion"),
        ]),
        ("CRU-CON-HP-01", "Chancador HP800", [
            ("Bowl liner", "Desgaste irregular", "Material abrasivo", 7, 7, 4, "Cambio liner cada 800h"),
            ("Mantle", "Fractura", "Sobrecarga", 9, 3, 5, "Sensor sobrecarga + LOTO"),
            ("Hydraulic system", "Perdida de presion", "Fuga interna", 6, 4, 7, "Test presion mensual"),
        ]),
        ("SUB-MT-P01", "Subestacion MT", [
            ("Interruptor", "No conmuta", "Contactos desgastados", 9, 4, 6, "Termografia trimestral"),
            ("Trafo poder", "Sobretemperatura", "Enfriamiento bajo", 8, 3, 5, "Inspeccion ventiladores"),
        ]),
    ]
    count = 0
    for tag, name, rows_data in worksheets:
        ws = FMECAWorksheetModel(
            equipment_id=tag,
            equipment_tag=tag,
            equipment_name=name,
            status="ACTIVE",
            current_stage="STAGE_5_RPN",
            rows=[
                {
                    "function": part,
                    "failure_mode": fm,
                    "failure_cause": cause,
                    "severity": s,
                    "occurrence": o,
                    "detection": d,
                    "rpn": s * o * d,
                    "current_controls": ctrl,
                    "recommended_action": f"Revisar pauta + monitoreo intensivo si RPN > 100",
                }
                for (part, fm, cause, s, o, d, ctrl) in rows_data
            ],
            analyst="Ingeniero Confiabilidad",
            created_at=datetime.now() - timedelta(days=random.randint(30, 180)),
        )
        db.add(ws); count += 1
    db.commit()
    print(f"  ✓ {count} FMECA worksheets con rows + RPNs calculados")


def seed_absorbed_cancellations(db, n_links=8):
    """SF-579 — Para demos de cancelación por absorción: toma N pares (PM01 PROGRAMADO,
    PM03 cualquier estado) del mismo equipo y marca el PM01 como cancelado por
    absorción apuntando al PM03. Esto hace visible el panel "OTs absorbidas" en
    el detalle del PM03 + el banner ámbar en la PM01 cancelada."""
    print(f"[absorbed] Creando {n_links} cancelaciones por absorción (SF-579)...")
    pm03_active = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == PLANT,
        ManagedWorkOrderModel.wo_type == "PM03",
        ManagedWorkOrderModel.status.in_(("PROGRAMADO", "EN_EJECUCION", "CERRADO")),
    ).all()
    pm01_pending = db.query(ManagedWorkOrderModel).filter(
        ManagedWorkOrderModel.plant_id == PLANT,
        ManagedWorkOrderModel.wo_type == "PM01",
        ManagedWorkOrderModel.status.in_(("PROGRAMADO", "PLANIFICADO", "EN_PROGRAMACION")),
    ).all()
    if not pm03_active or not pm01_pending:
        print("  ! Sin candidatos suficientes")
        return 0
    created = 0
    used_pm01 = set()
    for absorber in pm03_active[:n_links]:
        # Buscar PM01 mismo equipo o área
        candidates = [w for w in pm01_pending
                      if w.wo_id not in used_pm01 and (w.equipment_tag == absorber.equipment_tag or w.work_center == absorber.work_center)]
        if not candidates:
            candidates = [w for w in pm01_pending if w.wo_id not in used_pm01]
        if not candidates:
            continue
        victim = random.choice(candidates)
        victim.status = "CANCELADO"
        victim.cancellation_type = "ABSORBED"
        victim.absorbed_by_wo_id = absorber.wo_id
        victim.cancellation_reason = f"Falla atendida en intervención no programada {absorber.wo_number} ({absorber.equipment_tag})"
        used_pm01.add(victim.wo_id)
        created += 1
    db.commit()
    print(f"  ✓ {created} OTs PM01 canceladas por absorción → PM03")
    return created


def seed_wos_and_wrs(db, count=100):
    print(f"[data] Creando {count} pares WR+OT realistas...")
    workers = db.query(WorkforceModel).filter(WorkforceModel.plant_id == PLANT).all()
    now = datetime.now()
    for i in range(count):
        _generate_wr_and_wo(db, i, workers, now)
        if (i + 1) % 20 == 0:
            db.commit()
            print(f"  · {i + 1}/{count} completados...")
    db.commit()
    # Verificar conteos
    wr_count = db.execute(text(f"SELECT COUNT(*) FROM work_requests WHERE equipment_tag LIKE 'BRY-%' OR equipment_tag LIKE 'CRU-%' OR equipment_tag LIKE 'CVY-%' OR equipment_tag LIKE 'FLT-%' OR equipment_tag LIKE 'PMP-%'")).scalar()
    wo_count = db.execute(text(f"SELECT COUNT(*), status FROM managed_work_orders WHERE plant_id = '{PLANT}' GROUP BY status")).fetchall()
    print(f"\n  ✓ WRs: {wr_count}")
    print("  ✓ WOs por status:")
    for row in wo_count:
        print(f"      {row[1]}: {row[0]}")


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

def seed_pa_demo_patterns(db):
    """Inyecta patrones detectables por las secciones de PerformanceAnalysis:
    - Fallas crónicas (≥3 WRs mismo equipo+modo en 7d)
    - Cruce con estrategia (PM01 cerrados con cadencia <60d)
    - Causas de no-cumplimiento (closure_notes con patrones "no se hizo porque...")
    """
    print("[PA patterns] Inyectando casos demo para secciones vacías...")
    now = datetime.utcnow()
    chronic_specs = [
        ("PMP-AGUA-01", "Vibración axial bomba"),
        ("THK-CNC-01", "Falla torque rastrillo"),
        ("CVY-CV-001", "Patinado correa transportadora"),
    ]
    chronic_count = 0
    for tag, mode in chronic_specs:
        # 4 avisos del mismo equipo+modo en 5 días (entra en ventana 7d)
        for k in range(4):
            created = now - timedelta(days=20 - k * 1.2)  # ~1 día entre cada uno
            wr = WorkRequestModel(
                aviso_number=_next_aviso_number(db),
                equipment_id=tag,
                equipment_tag=tag,
                resolution_method="MANUAL",
                status="APROBADO",
                problem_description={
                    "whatHappens": mode,
                    "failure_mode_detected": mode,
                    "failure_category": mode,
                    "wo_title": f"{tag} — {mode}",
                },
                ai_classification={
                    "failure_mode": mode,
                    "failure_type": mode,
                    "part_object": mode,
                    "suggested_specialty": "MECANICO",
                    "estimated_hours": 4,
                    "confidence": 0.92,
                    "probable_cause": f"Repetición sospechosa — posible falla crónica ({mode})",
                    "production_impact": "MEDIUM",
                    "priority_suggested": "P2",
                    "plant_id": PLANT,
                },
                priority_code="P2",
                work_class="NO_PROGRAMADO",
                created_by="admin",
                reported_by="mantenedor_turno",
                reported_at=created,
                circumstances=f"Repetición #{k+1} del mismo modo en pocos días",
                planning_group="MEC",
                work_center="MEC",
                created_at=created,
                approved_at=created + timedelta(hours=2),
                approval_comment="Aprobado — flag de potencial falla crónica",
            )
            db.add(wr)
            chronic_count += 1
    db.flush()

    # ── Strategy mismatches: 3 equipos con PM01 cerrados cadencia 30d ──
    strategy_specs = [
        ("PMP-SL-HP-002", "Inspección rodamiento bomba"),
        ("VLV-PN-MM-08", "Lubricación válvula neumática"),
        ("MOL-CCO-01", "Cambio liners molino"),
    ]
    strategy_count = 0
    for tag, desc in strategy_specs:
        # 4 PM01 cerradas a 30, 60, 90, 120 días atrás → cadencia 30d (umbral <60)
        for k in range(4):
            actual_end = now - timedelta(days=30 * (4 - k))
            actual_start = actual_end - timedelta(hours=4)
            wo = ManagedWorkOrderModel(
                wo_number=f"OT-PM-STRAT-{tag[:6]}-{k:02d}",
                plant_id=PLANT,
                equipment_id=tag,
                equipment_tag=tag,
                description=desc,
                wo_type="PM01",
                priority_code="P3",
                work_class="PROGRAMADO",
                operations=[{
                    "op_number": 1, "description": desc, "specialty": "Mecánico",
                    "op_type": "INT", "quantity": 1, "duration": 4, "estimated_hours": 4,
                    "planned_hours": 4, "actual_hours": 4.2, "completion_pct": 100.0,
                    "status": "COMPLETED", "notifications": [],
                }],
                materials=[], estimated_hours=4, actual_hours=4.2,
                status="CERRADO", planning_group="MEC", work_center="MEC",
                planned_start=actual_start, planned_end=actual_end,
                actual_start=actual_start, actual_end=actual_end,
                completion_pct=100.0, closed_by="supervisor_ocp",
                closed_at=actual_end, closed_by_signature="Ricardo Valdés",
                closure_notes="OK — preventivo programado ejecutado.",
                planned_by="planificador_ocp", released_by="planificador_ocp",
                released_at=actual_start - timedelta(days=1),
                labor_cost=400000, material_cost=80000,
                actual_total_cost=480000, budget_amount=528000, budget_approved=True,
                created_at=actual_start - timedelta(days=2),
                updated_at=actual_end,
            )
            db.add(wo)
            strategy_count += 1
    db.flush()

    # ── Non-compliance: 3 OTs con closure_notes que matchean los patrones ──
    nc_specs = [
        ("CRU-CON-HP-01", "Cambio camisa cono", "No se hizo porque repuesto no llegó del proveedor a tiempo"),
        ("BRY-SAG-ML-002", "Inspección rodamiento secundario", "Operaciones no liberó el equipo, producción no podía parar"),
        ("PMP-REL-01", "Servicio externo bomba relave", "Servicio externo no llegó — reagendado para próxima semana"),
    ]
    nc_count = 0
    for tag, desc, note in nc_specs:
        actual_end = now - timedelta(days=random.randint(5, 25))
        actual_start = actual_end - timedelta(hours=2)
        wo = ManagedWorkOrderModel(
            wo_number=f"OT-NC-{tag[:6]}-{random.randint(100,999)}",
            plant_id=PLANT,
            equipment_id=tag, equipment_tag=tag,
            description=desc, wo_type="PM01",
            priority_code="P3", work_class="PROGRAMADO",
            operations=[{
                "op_number": 1, "description": desc, "specialty": "Mecánico",
                "op_type": "INT", "quantity": 1, "duration": 2, "estimated_hours": 2,
                "planned_hours": 2, "actual_hours": 0.5, "completion_pct": 25.0,
                "status": "COMPLETED",
                "notif_notes": note,
                "notifications": [{
                    "type": "PARTIAL", "hours": 0.5,
                    "technician_id": "Juan Pérez Soto", "shift": "day",
                    "note": note, "timestamp": actual_start.isoformat(),
                    "user": "supervisor_ocp",
                }],
            }],
            materials=[], estimated_hours=2, actual_hours=0.5,
            status="CERRADO", planning_group="MEC", work_center="MEC",
            planned_start=actual_start, planned_end=actual_end,
            actual_start=actual_start, actual_end=actual_end,
            completion_pct=25.0, closed_by="supervisor_ocp",
            closed_at=actual_end, closed_by_signature="Ricardo Valdés",
            closure_notes=note,
            execution_notes=[{"note": note, "timestamp": actual_start.isoformat(), "user": "supervisor_ocp"}],
            planned_by="planificador_ocp", released_by="planificador_ocp",
            released_at=actual_start - timedelta(days=1),
            labor_cost=80000, material_cost=0,
            actual_total_cost=80000, budget_amount=200000, budget_approved=True,
            created_at=actual_start - timedelta(days=2),
            updated_at=actual_end,
        )
        db.add(wo)
        nc_count += 1
    db.commit()
    print(f"  ✓ {chronic_count} WRs (3 clusters fallas crónicas) + {strategy_count} OTs PM01 (3 cadencias desviadas) + {nc_count} OTs no-cumplimiento")


def main():
    print("╔════════════════════════════════════════════════╗")
    print("║  SEED DEMO · GOLDFIELDS SALARES NORTE          ║")
    print("╚════════════════════════════════════════════════╝\n")
    db = SessionLocal()
    try:
        wipe_plant_data(db)
        print()
        seed_workforce(db)
        print()
        seed_materials(db)
        print()
        seed_critical_equipment_hierarchy(db)
        print()
        seed_wos_and_wrs(db, count=100)
        print()
        seed_absorbed_cancellations(db, n_links=8)
        print()
        seed_rca_and_capa(db)
        print()
        seed_fmeca_worksheets(db)
        print()
        seed_standalone_wrs(db)
        print()
        seed_pa_demo_patterns(db)
        print("\n✅ Seed completado.")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
