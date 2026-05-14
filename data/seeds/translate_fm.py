"""
translate_fm.py
1. Crear FM-MASTER-REFERENCE-ES.xlsx (traduccion completa del master)
2. Traducir columnas en 03_failure_modes.xlsx
"""
import pandas as pd
import numpy as np
import os

BASE_SEED = os.path.dirname(os.path.abspath(__file__))
BASE_FM = os.path.join(os.path.dirname(BASE_SEED), "skills", "00-knowledge-base", "data-models", "failure-modes")

# ═══════════════════════════════════════════════════════════════════════════
# Diccionarios de traduccion
# ═══════════════════════════════════════════════════════════════════════════

MECHANISM_EN_ES = {
    "Arcs": "Arco electrico",
    "Blocks": "Obstruccion/Bloqueo",
    "Breaks/Fracture/Separates": "Rotura/Fractura/Separacion",
    "Corrodes": "Corrosion",
    "Cracks": "Agrietamiento",
    "Degrades": "Degradacion",
    "Distorts": "Deformacion",
    "Drifts": "Deriva",
    "Expires": "Vencimiento/Caducidad",
    "Immobilised (binds/jams)": "Inmovilizacion (atasque/traba)",
    "Looses Preload": "Perdida de precarga",
    "Open-Circuit": "Circuito abierto",
    "Overheats/Melts": "Sobrecalentamiento/Fusion",
    "Severs (cut, tear, hole)": "Corte/Desgarro/Perforacion",
    "Short-Circuits": "Cortocircuito",
    "Thermally Overloads (burns, overheats, melts)": "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)",
    "Washes Off": "Lavado/Erosion por fluido",
    "Wears": "Desgaste",
}

CAUSE_EN_ES = {
    "Breakdown in insulation": "Falla de aislamiento",
    "Contamination": "Contaminacion",
    "Excessive particle size": "Tamano excesivo de particulas",
    "Insufficient fluid velocity": "Velocidad de fluido insuficiente",
    "Cyclic loading (thermal/mechanical)": "Carga ciclica (termica/mecanica)",
    "Mechanical overload": "Sobrecarga mecanica",
    "Thermal overload": "Sobrecarga termica",
    "Bio-organisms": "Bio-organismos",
    "Chemical attack": "Ataque quimico",
    "Corrosive environment": "Ambiente corrosivo",
    "Crevice": "Hendidura/Resquicio",
    "Dissimilar metals contact": "Contacto de metales disimiles",
    "Exposure to atmosphere": "Exposicion a la atmosfera",
    "Exposure to high temperature corrosive environment": "Exposicion a ambiente corrosivo de alta temperatura",
    "Exposure to high temperature environment": "Exposicion a ambiente de alta temperatura",
    "Exposure to liquid metal": "Exposicion a metal liquido",
    "Poor electrical connections": "Conexiones electricas deficientes",
    "Poor electrical insulation": "Aislamiento electrico deficiente",
    "Age": "Envejecimiento",
    "Excessive temperature": "Temperatura excesiva",
    "High temperature in corrosive environment": "Alta temperatura en ambiente corrosivo",
    "Impact/shock loading": "Carga de impacto/choque",
    "Thermal stresses (heat/cold)": "Esfuerzos termicos (calor/frio)",
    "Chemical reaction": "Reaccion quimica",
    "Electrical arcing": "Arco electrico",
    "Entrained air": "Aire atrapado",
    "Exposure to excessive temperature": "Exposicion a temperatura excesiva",
    "Radiation": "Radiacion",
    "Off-center loading": "Carga descentrada",
    "Use": "Uso normal",
    "Excessive temperature (hot/cold)": "Temperatura excesiva (calor/frio)",
    "Stray current": "Corriente vagabunda",
    "Uneven loading": "Carga desigual",
    "Lack of lubrication": "Falta de lubricacion",
    "Creep": "Fluencia/Creep",
    "Vibration": "Vibracion",
    "Electrical overload": "Sobrecarga electrica",
    "Relative movement between contacting surfaces": "Movimiento relativo entre superficies en contacto",
    "Rubbing": "Roce/Friccion",
    "Abrasion": "Abrasion",
    "Overcurrent": "Sobrecorriente",
    "Excessive fluid velocity": "Velocidad de fluido excesiva",
    "Breakdown of lubrication": "Degradacion del lubricante",
    "Low pressure": "Baja presion",
    "Lubricant contamination (particles)": "Contaminacion del lubricante (particulas)",
    "Metal to metal contact": "Contacto metal con metal",
}

CONSEQUENCE_EN_ES = {
    "OPERATIONAL": "OPERACIONAL",
    "NON-OPERATIONAL": "NO OPERACIONAL",
}

EVIDENCE_EN_ES = {
    "Bearing temperature rising while lubricant is normal, simultaneous elevated motor current/torque, gearbox oil temperature exceeding OEM limit":
        "Temperatura de rodamiento en aumento con lubricante normal, corriente/torque del motor elevados simultaneamente, temperatura de aceite de reductor excediendo limite OEM",
    "Distinctive crackling cavitation noise, pump head/efficiency decreasing, broadband HF vibration (>5 kHz)":
        "Ruido de cavitacion crepitante distintivo, cabeza/eficiencia de bomba disminuyendo, vibracion HF de banda ancha (>5 kHz)",
    "Elastomer hardness increasing (Shore A >15% above spec), surface cracking/crazing/chalking, UPS battery capacity <80% of rated":
        "Dureza de elastomero en aumento (Shore A >15% sobre especificacion), agrietamiento/cuarteado/pulverizacion superficial, capacidad de bateria UPS <80% de nominal",
    "Increasing dP (>50% above clean baseline), decreasing flow rate (>10% below design), heat exchanger approach temperature rising":
        "dP en aumento (>50% sobre linea base limpia), caudal disminuyendo (>10% bajo diseno), temperatura de aproximacion de intercambiador en aumento",
    "Phase current imbalance >5%, voltage imbalance >2% at PCC, cable/neutral temperature elevated":
        "Desbalance de corriente de fase >5%, desbalance de voltaje >2% en PCC, temperatura de cable/neutro elevada",
    "Red-brown oxide powder at press-fit interfaces, increasing bearing clearance on shaft, vibration showing progressive looseness":
        "Polvo de oxido rojo-marron en interfaces de ajuste a presion, holgura de rodamiento en eje en aumento, vibracion mostrando aflojamiento progresivo",
    "Surface cracks by MPI/DPI/eddy current, measurable crack growth between NDE inspections, oxide staining at crack mouths":
        "Grietas superficiales por MPI/DPI/corrientes de Eddy, crecimiento de grieta medible entre inspecciones END, manchas de oxido en bocas de grieta",
    "Surface cracks detectable by MPI/DPI at stress concentrations, vibration amplitude change (stiffness reduction), oxide staining at crack mouths":
        "Grietas superficiales detectables por MPI/DPI en concentradores de esfuerzo, cambio de amplitud de vibracion (reduccion de rigidez), manchas de oxido en bocas de grieta",
    "UT wall thinning at elbows/tees, erosion rate above design allowance, characteristic horseshoe/cat-eye patterns":
        "Adelgazamiento de pared por UT en codos/tees, tasa de erosion sobre tolerancia de diseno, patrones caracteristicos de herradura/ojo de gato",
    "Visible permanent deflection/bowing/twisting, buckling of thin-walled structures, bolt gap opening at flanges":
        "Deflexion/pandeo/torsion permanente visible, pandeo de estructuras de pared delgada, apertura de brecha en pernos de bridas",
    "Visible rust and paint degradation (ASTM D714 blistering, D610 rusting), galvanized coating breakthrough, structural section loss at connections":
        "Oxidacion visible y degradacion de pintura (ampollamiento ASTM D714, oxidacion D610), penetracion de recubrimiento galvanizado, perdida de seccion estructural en conexiones",
    "Witness mark rotation on bolt/nut, bolt torque <70% of spec, audible rattling during operation":
        "Rotacion de marca testigo en perno/tuerca, torque de perno <70% de especificacion, traqueteo audible durante operacion",
}

# For evidence values that contain "Wire rope broken wires" (truncated in the data)
EVIDENCE_PARTIAL = {
    "Wire rope broken wires": "Alambres rotos de cable de acero >6 por paso de torcido segun ISO 4309, deformacion plastica visible en concentradores de esfuerzo, abultamiento superficial de manguera/exposicion de refuerzo",
}

DETECTION_EN_ES = {
    "Bearing temperature + load monitoring": "Monitoreo de temperatura de rodamiento + carga",
    "Differential pressure measurement": "Medicion de presion diferencial",
    "Hardness testing of elastomeric components": "Ensayo de dureza de componentes elastomericos",
    "MPI at known hot spots": "MPI en puntos calientes conocidos",
    "MPI at welds": "MPI en soldaduras",
    "Phase current and voltage balance monitoring": "Monitoreo de balance de corriente de fase y voltaje",
    "Structural survey (deflection, plumb, level)": "Inspeccion estructural (deflexion, plomada, nivel)",
    "Torque audit (calibrated wrench)": "Auditoria de torque (llave calibrada)",
    "UT wall thickness at erosion-prone locations": "Espesor de pared por UT en ubicaciones propensas a erosion",
    "Vibration monitoring (broadband HF cavitation)": "Monitoreo de vibracion (cavitacion HF de banda ancha)",
    "Vibration monitoring for progressive fit loosening": "Monitoreo de vibracion para aflojamiento progresivo de ajuste",
    "Visual coating condition assessment": "Evaluacion visual de condicion de recubrimiento",
    "Wire rope inspection (visual + MRT)": "Inspeccion de cable de acero (visual + MRT)",
}

PATTERN_EN_ES = {
    "Pattern B": "Patron B",
    "Pattern C": "Patron C",
    "Pattern D": "Patron D",
    "Pattern E": "Patron E",
    "B": "B",
    "C": "C",
    "D": "D",
    "E": "E",
}

FREQ_BASIS_EN_ES = {
    "Calendar": "Calendario",
    "Operational": "Operacional",
}

STRATEGY_CB_EN_ES = {
    "Condition-Based": "Basada en condicion",
}

STRATEGY_FT_EN_ES = {
    "Fixed-Time": "Tiempo fijo",
}

STRATEGY_RTF_EN_ES = {
    "Run-to-Failure": "Operar hasta la falla",
}

# ═══════════════════════════════════════════════════════════════════════════
# PARTE 1: Crear FM-MASTER-REFERENCE-ES.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("PARTE 1: Creando FM-MASTER-REFERENCE-ES.xlsx...")

fm_path = os.path.join(BASE_FM, "FM-MASTER-REFERENCE.xlsx")

# Read all sheets
sheet1 = pd.read_excel(fm_path, sheet_name="72 Failure Modes")
sheet2 = pd.read_excel(fm_path, sheet_name="Validation Matrix")
sheet3 = pd.read_excel(fm_path, sheet_name="By Pattern")
sheet4 = pd.read_excel(fm_path, sheet_name="By Frequency Basis")
sheet5 = pd.read_excel(fm_path, sheet_name="By ISO 14224")
sheet6 = pd.read_excel(fm_path, sheet_name="Cause Cross-Reference")

# --- Sheet 1: 72 Failure Modes ---
s1 = sheet1.copy()
s1.rename(columns={
    "FM#": "FM#",
    "Mechanism": "Mecanismo",
    "Cause": "Causa",
    "Freq. Basis": "Base de Frecuencia",
    "Pattern": "Patron",
    "ISO 14224": "ISO 14224",
    "Weibull Beta": "Weibull Beta",
    "Weibull Eta": "Weibull Eta",
    "Degradation Summary": "Resumen de Degradacion",
    "Top P-Conditions": "Principales Condiciones P",
    "Equipment Classes": "Clases de Equipo",
    "OCP Equipment": "Equipo OCP",
    "Primary CBM Technique": "Tecnica CBM Principal",
    "P-F Interval": "Intervalo P-F",
    "Reference Standard": "Norma de Referencia",
    "Strategy (CB)": "Estrategia (BC)",
    "Strategy (FT)": "Estrategia (TF)",
    "Strategy (RTF)": "Estrategia (OHF)",
    "Key Threshold": "Umbral Clave",
}, inplace=True)

s1["Mecanismo"] = s1["Mecanismo"].map(MECHANISM_EN_ES).fillna(s1["Mecanismo"])
s1["Causa"] = s1["Causa"].map(CAUSE_EN_ES).fillna(s1["Causa"])
s1["Base de Frecuencia"] = s1["Base de Frecuencia"].map(FREQ_BASIS_EN_ES).fillna(s1["Base de Frecuencia"])

# --- Sheet 2: Validation Matrix ---
s2 = sheet2.copy()
# Rename first column
first_col = s2.columns[0]
s2.rename(columns={first_col: "Mecanismo \\ Causa"}, inplace=True)
# Translate mechanism names in first column
s2.iloc[:, 0] = s2.iloc[:, 0].map(MECHANISM_EN_ES).fillna(s2.iloc[:, 0])
# Translate column headers (causes)
new_cols = [s2.columns[0]]
for col in s2.columns[1:]:
    new_cols.append(CAUSE_EN_ES.get(col, col))
s2.columns = new_cols

# --- Sheet 3: By Pattern ---
s3 = sheet3.copy()
s3.rename(columns={
    "Pattern": "Patron",
    "RCM Implication": "Implicacion RCM",
    "FM#": "FM#",
    "Mechanism": "Mecanismo",
    "Cause": "Causa",
}, inplace=True)
s3["Mecanismo"] = s3["Mecanismo"].map(MECHANISM_EN_ES).fillna(s3["Mecanismo"])
s3["Causa"] = s3["Causa"].map(CAUSE_EN_ES).fillna(s3["Causa"])

# --- Sheet 4: By Frequency Basis ---
s4 = sheet4.copy()
s4.rename(columns={
    "Freq. Basis": "Base de Frecuencia",
    "Unit Types": "Tipos de Unidad",
    "FM#": "FM#",
    "Mechanism": "Mecanismo",
    "Cause": "Causa",
    "Pattern": "Patron",
}, inplace=True)
s4["Mecanismo"] = s4["Mecanismo"].map(MECHANISM_EN_ES).fillna(s4["Mecanismo"])
s4["Causa"] = s4["Causa"].map(CAUSE_EN_ES).fillna(s4["Causa"])
s4["Base de Frecuencia"] = s4["Base de Frecuencia"].map(FREQ_BASIS_EN_ES).fillna(s4["Base de Frecuencia"])

# --- Sheet 5: By ISO 14224 ---
s5 = sheet5.copy()
s5.rename(columns={
    "ISO 14224 Code": "Codigo ISO 14224",
    "Description": "Descripcion",
    "FM#": "FM#",
    "Mechanism": "Mecanismo",
    "Cause": "Causa",
}, inplace=True)
s5["Mecanismo"] = s5["Mecanismo"].map(MECHANISM_EN_ES).fillna(s5["Mecanismo"])
s5["Causa"] = s5["Causa"].map(CAUSE_EN_ES).fillna(s5["Causa"])

# --- Sheet 6: Cause Cross-Reference ---
s6 = sheet6.copy()
s6.rename(columns={
    "Cause": "Causa",
    "# Mechanisms": "# Mecanismos",
    "Mechanisms (FM#)": "Mecanismos (FM#)",
}, inplace=True)
s6["Causa"] = s6["Causa"].map(CAUSE_EN_ES).fillna(s6["Causa"])

# Write to new file
out_path = os.path.join(BASE_FM, "FM-MASTER-REFERENCE-ES.xlsx")
with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
    s1.to_excel(writer, sheet_name="72 Modos de Falla", index=False)
    s2.to_excel(writer, sheet_name="Matriz de Validacion", index=False)
    s3.to_excel(writer, sheet_name="Por Patron", index=False)
    s4.to_excel(writer, sheet_name="Por Base de Frecuencia", index=False)
    s5.to_excel(writer, sheet_name="Por ISO 14224", index=False)
    s6.to_excel(writer, sheet_name="Referencia Cruzada de Causas", index=False)

print(f"  Creado: {out_path}")
print(f"  Hojas: 6")

# ═══════════════════════════════════════════════════════════════════════════
# PARTE 2: Traducir columnas en 03_failure_modes.xlsx
# ═══════════════════════════════════════════════════════════════════════════
print("\nPARTE 2: Traduciendo columnas en 03_failure_modes.xlsx...")

df03 = pd.read_excel(os.path.join(BASE_SEED, "03_failure_modes.xlsx"))
print(f"  Filas: {len(df03)}")

# fm_mechanism
before = df03["fm_mechanism"].unique()
df03["fm_mechanism"] = df03["fm_mechanism"].map(MECHANISM_EN_ES).fillna(df03["fm_mechanism"])
after = df03["fm_mechanism"].unique()
untranslated = set(after) - set(MECHANISM_EN_ES.values())
print(f"  fm_mechanism: {len(before)} valores unicos -> traducidos. Sin traducir: {untranslated if untranslated else 'ninguno'}")

# fm_cause
before = df03["fm_cause"].unique()
df03["fm_cause"] = df03["fm_cause"].map(CAUSE_EN_ES).fillna(df03["fm_cause"])
after = df03["fm_cause"].unique()
untranslated = set(after) - set(CAUSE_EN_ES.values())
print(f"  fm_cause: {len(before)} valores unicos -> traducidos. Sin traducir: {untranslated if untranslated else 'ninguno'}")

# failure_consequence
before = df03["failure_consequence"].unique()
df03["failure_consequence"] = df03["failure_consequence"].map(CONSEQUENCE_EN_ES).fillna(df03["failure_consequence"])
after = df03["failure_consequence"].unique()
print(f"  failure_consequence: {list(before)} -> {list(after)}")

# evidence
def translate_evidence(val):
    if pd.isna(val):
        return val
    val_str = str(val)
    if val_str in EVIDENCE_EN_ES:
        return EVIDENCE_EN_ES[val_str]
    # Try partial match for truncated values
    for key, translation in EVIDENCE_PARTIAL.items():
        if key in val_str:
            return translation
    return val_str

before_ev = df03["evidence"].nunique()
df03["evidence"] = df03["evidence"].apply(translate_evidence)
after_ev = df03["evidence"].nunique()
# Check for untranslated
remaining_en = set()
for v in df03["evidence"].dropna().unique():
    # If it still contains common English words, flag it
    if any(w in str(v).lower() for w in ["bearing", "crack", "wire", "visible", "phase", "increasing"]):
        remaining_en.add(str(v)[:80])
print(f"  evidence: {before_ev} valores unicos. Posibles sin traducir: {len(remaining_en)}")
if remaining_en:
    for r in list(remaining_en)[:3]:
        print(f"    - {r}")

# detection_method
before = df03["detection_method"].unique()
df03["detection_method"] = df03["detection_method"].map(DETECTION_EN_ES).fillna(df03["detection_method"])
after = df03["detection_method"].unique()
untranslated = [v for v in after if v not in DETECTION_EN_ES.values() and pd.notna(v)]
print(f"  detection_method: {len(before)} valores unicos -> traducidos. Sin traducir: {untranslated if untranslated else 'ninguno'}")

# Save
df03.to_excel(os.path.join(BASE_SEED, "03_failure_modes.xlsx"), index=False, engine="openpyxl")
print(f"\n  03_failure_modes.xlsx guardado ({len(df03)} filas)")

print("\nDone!")
