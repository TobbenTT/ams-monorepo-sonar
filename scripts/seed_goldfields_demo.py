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


def _generate_wr_and_wo(db, idx, workers, now):
    """Genera 1 WR + 1 OT con estados distribuidos."""
    equip = random.choice(EQUIPMENT_CATALOG)
    equip_tag, equip_name, area, pg, wc = equip
    problem, priority, description = _pick_scenario(equip_tag)

    # Distribuir creación en últimos 45 días
    created_at = now - timedelta(days=random.randint(0, 45), hours=random.randint(0, 23))

    # Crear WR
    wr = WorkRequestModel(
        equipment_id=equip_tag,
        equipment_tag=equip_tag,
        equipment_confidence=round(random.uniform(0.85, 0.99), 2),
        resolution_method="MANUAL" if random.random() > 0.3 else "AI",
        status="APROBADO",
        problem_description={
            "whatHappens": problem,
            "whenHappens": random.choice(["Durante turno día", "Durante turno noche", "Durante el arranque", "En operación continua"]),
            "triggerEvent": random.choice(["Alarma DCS", "Inspección visual", "Reporte mantenedor", "Análisis predictivo"]),
            "impact": random.choice(["Sin impacto aún", "Pérdida parcial de capacidad", "Degradación progresiva", "Alarma crítica activa"]),
        },
        ai_classification={
            "failure_mode": problem[:80],
            "suggested_specialty": "MECANICO",
            "estimated_hours": random.choice([4, 6, 8, 12, 16, 24]),
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "probable_cause": f"Causa raíz presumida: {description[:60]}",
        },
        spare_parts=[{"code": m[0], "description": m[1], "qty": m[3]} for m in _pick_materials(equip_tag, problem)[:3]],
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
            "type": "INT",
            "description": op_desc,
            "specialty": spec,
            "quantity": qty,
            "hours": hrs,
            "parallel": False,
        }
        for (op_desc, spec, hrs, qty) in ops_template
    ]
    total_hh = sum(o["hours"] * o["quantity"] for o in operations)
    materials = [
        {"code": m[0], "sap_id": m[0], "sapId": m[0], "description": m[1], "unit": m[2], "quantity": m[3], "unit_price": m[4]}
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
        reservation_codes=[reservation_code] if reservation_code else None,
        created_at=created_at,
        updated_at=created_at + timedelta(days=random.randint(1, 7)),
    )

    # Para CERRADO llenar actuals + firma
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
        # Update ops con actuals
        for op in wo.operations:
            op["actual_hours"] = round(op["hours"] * random.uniform(0.9, 1.2), 2)
    elif status == "EN_EJECUCION":
        wo.actual_start = planned_start + timedelta(hours=random.randint(-2, 4))
        wo.completion_pct = random.choice([25, 40, 50, 65, 75])

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
        seed_wos_and_wrs(db, count=100)
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
