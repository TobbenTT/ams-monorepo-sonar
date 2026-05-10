"""
mi_class_rules.py
=================
RCM-based functional failure analysis for ~40 MI (Maintainable Item) classes.

Each class follows the full RCM chain:
    Function → Functional Failures → Failure Modes (with "why" justification)

Context: Goldfields Salares Norte — 4,500 m altitude, -20°C winters,
extreme UV, silica-rich ore (quartz Mohs 7), cyanide process.

FM references come from FM-MASTER-REFERENCE-ES.xlsx (72 failure modes).
Detection methods and P-F intervals from "Tecnica CBM Principal" / "Intervalo P-F".

No main() — pure constant module with helper functions.
"""

from __future__ import annotations
from typing import Optional

# ═══════════════════════════════════════════════════════════════════════════════
# MI_CLASS_RULES — ~40 classes with full RCM functional analysis
# ═══════════════════════════════════════════════════════════════════════════════

MI_CLASS_RULES: dict = {

    # ═══════════════════════════════════════════════════════════════════════════
    # P1 CRITICAL — DETAILED ANALYSIS
    # ═══════════════════════════════════════════════════════════════════════════

    # -----------------------------------------------------------------------
    # 1. BEARING
    # -----------------------------------------------------------------------
    "bearing": {
        "keywords": ["rodamiento", "rodamientos", "cojinete", "chumacera",
                      "descanso", "buje rodamiento", "bearing"],
        "material": "acero al cromo (AISI 52100) / bronce / ceramico",
        "functions": [
            {
                "function_es": "Soportar cargas radiales y axiales permitiendo rotacion con friccion minima",
                "functional_failures": [
                    {
                        "failure_es": "Friccion excesiva — no gira libremente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Contacto rodante continuo degrada pistas y elementos rodantes, genera particulas metalicas, aumenta holgura radial hasta perdida de geometria",
                                "pattern": "B",
                                "detection": "Vibration analysis (envelope/demodulation)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-64",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Degradacion del lubricante",
                                "why": "Lubricante pierde viscosidad y aditivos EP por oxidacion termica; pelicula lubricante insuficiente permite contacto metal-metal en pistas",
                                "pattern": "B",
                                "detection": "Oil analysis (oxidation, viscosity, TAN, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-69",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contaminacion del lubricante (particulas)",
                                "why": "Particulas de silice del proceso ingresan por sellos; actuan como abrasivo entre elementos rodantes y pistas acelerando desgaste 3-5x",
                                "pattern": "C",
                                "detection": "Oil particle count (ISO 4406)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-44",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Falta de lubricacion",
                                "why": "Sin pelicula lubricante, contacto metal-metal genera calor por friccion que dilata elementos rodantes hasta traba completa del rodamiento",
                                "pattern": "C",
                                "detection": "Vibration analysis (envelope/demodulation)",
                                "pf_interval": "2-8 wk",
                            },
                            {
                                "fm_ref": "FM-71",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contacto metal con metal",
                                "why": "Perdida de pelicula lubricante o holgura excesiva causa contacto directo entre jaula y elementos rodantes, generando adhesion y desprendimiento",
                                "pattern": "B",
                                "detection": "Dimensional measurement of wear components",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-51",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Falta de lubricacion",
                                "why": "Friccion seca eleva temperatura hasta 200-300°C; acero pierde dureza, jaula se deforma, elementos rodantes se sueldan a pista",
                                "pattern": "B",
                                "detection": "Bearing temperature monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                            {
                                "fm_ref": "FM-52",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga radial excesiva (ej. desalineacion, desbalance) incrementa esfuerzos Hertz en pista; calor generado supera capacidad de disipacion",
                                "pattern": "E",
                                "detection": "Bearing temperature + load monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                    {
                        "failure_es": "No mantiene posicion axial/radial del eje — holgura excesiva",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Cargas superiores a capacidad dinamica basica aceleran fatiga superficial (spalling), aumentando holgura hasta perdida de posicionamiento",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-67",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impactos transitorios (arranques, trozo mineral) generan indentaciones Brinell en pistas que se convierten en puntos de concentracion de fatiga",
                                "pattern": "B",
                                "detection": "Liner thickness/profile measurement (template, UT)",
                                "pf_interval": "Monthly-quarterly",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion afloja tuercas de fijacion del rodamiento; desplazamiento axial genera carga irregular y fatiga prematura de pista",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura catastrofica — fragmentacion del rodamiento",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Fatiga subsuperficial por ciclos de carga Hertz genera grietas que propagan hasta fractura de anillo; millones de ciclos a 4500m con vibracion amplificada",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga instantanea (trabamiento descendente, falla de acoplamiento) supera resistencia ultima del anillo; fractura fragil inmediata",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: rodamiento no es componente electrico",
            "FM-02": "Obstruccion por contaminacion: rodamiento no conduce fluido interno",
            "FM-08": "Corrosion por bio-organismos: componente interno sin exposicion biologica",
            "FM-09": "Corrosion quimica: rodamiento interno sellado, no contacto con proceso",
            "FM-13": "Corrosion atmosferica: componente interno no expuesto a atmosfera",
            "FM-17": "Conexiones electricas deficientes: no tiene conexiones electricas",
            "FM-25": "Degradacion por envejecimiento: acero al cromo no degrada por edad en servicio normal",
            "FM-37": "Deriva por temperatura: no es instrumento de medicion",
            "FM-40": "Deriva por carga desigual: no es instrumento de medicion",
            "FM-41": "Deriva por uso normal: no es instrumento de medicion",
            "FM-42": "Vencimiento: acero no tiene vida util por caducidad",
            "FM-48": "Circuito abierto: no es componente electrico",
            "FM-55": "Corte/desgarro por abrasion: geometria cerrada, no sujeta a flujo abrasivo externo",
            "FM-58": "Cortocircuito: no es componente electrico",
            "FM-62": "Erosion por fluido: no es componente de flujo",
        },
    },

    # -----------------------------------------------------------------------
    # 2. SHAFT
    # -----------------------------------------------------------------------
    "shaft": {
        "keywords": ["eje", "flecha", "arbol", "vastago", "shaft"],
        "material": "acero al carbono AISI 1045 / acero aleado 4140",
        "functions": [
            {
                "function_es": "Transmitir torque desde el motor al equipo impulsado manteniendo alineacion rotativa",
                "functional_failures": [
                    {
                        "failure_es": "No transmite torque — rotura o fractura del eje",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Flexion rotativa genera esfuerzos alternantes en cambios de seccion (chaveteros, hombros); grieta de fatiga propaga hasta fractura subita",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Trabamiento del equipo (ej. crusher tramp iron) aplica torque instantaneo superior a Sut del eje; fractura torsional",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Ciclos termicos diarios (-20°C a +40°C en Salares Norte) inducen esfuerzos termicos en uniones bimetalicas; grietas inician en chaveteros",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Vibracion excesiva — eje desbalanceado o desalineado",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga lateral excesiva (correa demasiado tensada, desalineacion) produce deflexion permanente; runout genera vibracion 1x",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Fretting en asientos de rodamiento genera perdida de ajuste; eje vibra dentro del rodamiento, amplificando desbalance",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion afloja tuercas de fijacion de acoplamientos y poleas; juego axial genera golpeteo y amplifica vibracion",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Desgaste en zonas de contacto — perdida de ajuste",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-71",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contacto metal con metal",
                                "why": "Chavetero y chaveta bajo torque oscilante generan desgaste adhesivo; holgura crece hasta que chaveta golpea y fractura",
                                "pattern": "B",
                                "detection": "Dimensional measurement of wear components",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Torque sostenido superior al diseno plastifica zona del chavetero; deformacion permanente impide ajuste correcto",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "En bombas de slurry, particulas de silice erosionan zona de sello del eje reduciendo diametro hasta fuga incontrolable",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-67",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impactos repetitivos (ej. molino de bolas) generan martillado en superficie de eje; pitting progresivo",
                                "pattern": "B",
                                "detection": "Liner thickness/profile measurement (template, UT)",
                                "pf_interval": "Monthly-quarterly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: eje no es componente electrico",
            "FM-02": "Obstruccion: eje no conduce fluido",
            "FM-09": "Corrosion quimica: eje no esta expuesto a proceso quimico directamente",
            "FM-17": "Conexiones electricas: no aplica a componente mecanico",
            "FM-25": "Degradacion por envejecimiento: acero no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-40": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: acero no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 3. SEAL_MECHANICAL
    # -----------------------------------------------------------------------
    "seal_mechanical": {
        "keywords": ["sello mecanico", "sello mecánico", "mechanical seal",
                      "sello de bomba", "cara de sello"],
        "material": "carburo de silicio / carbono / PTFE / acero inoxidable",
        "functions": [
            {
                "function_es": "Impedir fuga de fluido de proceso en la interfaz eje-carcasa durante rotacion",
                "functional_failures": [
                    {
                        "failure_es": "Fuga excesiva — supera limite aceptable",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Caras de sello (rotativa vs estacionaria) en contacto deslizante continuo; pelicula de fluido de micrometros se pierde progresivamente hasta apertura de gap",
                                "pattern": "B",
                                "detection": "Seal face temperature monitoring",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Particulas de silice (quartz Mohs 7) en slurry de Salares Norte rayan caras de sello SiC; surcos permiten fuga y aceleran desgaste 2-3x",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-66",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Alta velocidad periferica del eje genera turbulencia en pelicula de sello; cavitacion local erosiona cara de carbono",
                                "pattern": "B",
                                "detection": "UT wall thickness at erosion-prone locations",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-07",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga termica",
                                "why": "Marcha en seco genera calor extremo en caras de sello; choque termico fractura cara de carburo de silicio o carbono",
                                "pattern": "E",
                                "detection": "Thermal scan on kiln shell",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-53",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Perdida de lubricacion de pelicula entre caras genera calor por friccion; temperatura supera limite del o-ring secundario causando fuga cascada",
                                "pattern": "B",
                                "detection": "Seal face temperature monitoring",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sello trabado — no permite rotacion del eje",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-43",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Contaminacion",
                                "why": "Slurry cristaliza entre resortes y camisa del sello durante parada; al arrancar, sello no puede flotar axialmente",
                                "pattern": "C",
                                "detection": "Valve partial stroke testing (PST)",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura de componentes — falla catastrofica del sello",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Ciclaje termico diario (-20°C a +60°C proceso) genera fatiga en resortes y anillos de retencion; fractura de resorte libera caras",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "O-rings secundarios (EPDM, Viton) pierden elasticidad por UV y ozono en zona de almacenaje; al instalar pierden capacidad de sellado estatico",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: sello mecanico no es electrico",
            "FM-02": "Obstruccion: sello no conduce fluido internamente",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-40": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: sello no usa aceite (usa flush water)",
        },
    },

    # -----------------------------------------------------------------------
    # 4. SEAL_ELASTOMERIC
    # -----------------------------------------------------------------------
    "seal_elastomeric": {
        "keywords": ["sello", "sellos", "retén", "reten", "o-ring", "oring",
                      "lip seal", "sello de labio", "sello de aceite",
                      "empaquetadura prensaestopa", "prensaestopa"],
        "material": "NBR / FKM (Viton) / EPDM / PTFE",
        "functions": [
            {
                "function_es": "Contener fluido o lubricante impidiendo fugas y evitando ingreso de contaminantes",
                "functional_failures": [
                    {
                        "failure_es": "Fuga — fluido escapa por la interfaz sellada",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Elastomero pierde elasticidad por envejecimiento termico y UV; compresion permanente (compression set) impide retorno a forma original, abriendo gap",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-27",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Reaccion quimica",
                                "why": "Cianuro y reactivos de proceso atacan quimicamente NBR standard; hinchamiento y deterioro del elastomero hasta perdida de sellado",
                                "pattern": "B",
                                "detection": "Oil analysis (TAN, viscosity, oxidation, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-31",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Exposicion a temperatura excesiva",
                                "why": "En Salares Norte, temperatura oscila -20°C a +40°C diariamente; NBR standard falla por debajo de -30°C (rigidez), FKM necesario para este rango",
                                "pattern": "E",
                                "detection": "Ambient temperature monitoring near sensitive equipment",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Labio de sello en contacto con eje rotativo se desgasta progresivamente; surco en eje expone zona desgastada permitiendo fuga",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Particulas de silice atrapadas entre labio y eje cortan el elastomero; efecto lija destruye superficie de sellado en horas",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Ingreso de contaminantes — sello no impide entrada de polvo/agua",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-42",
                                "mechanism_es": "Vencimiento/Caducidad",
                                "cause_es": "Envejecimiento",
                                "why": "Sello almacenado por mas de 5 anos pierde propiedades elasticas; al instalar no sella correctamente desde el inicio",
                                "pattern": "B",
                                "detection": "Battery capacity testing (discharge test)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-57",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Instalacion forzada (ej. con herramienta inapropiada) corta o desgarra labio del sello; defecto oculto permite ingreso de silice",
                                "pattern": "E",
                                "detection": "Wire rope inspection (visual + MRT)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: sello elastomerico no es electrico",
            "FM-02": "Obstruccion: sello no conduce fluido",
            "FM-08": "Bio-organismos: elastomero no soporta crecimiento biologico",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-47": "Perdida de precarga: sello no tiene precarga por perno",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: sello no contiene lubricante propio",
        },
    },

    # -----------------------------------------------------------------------
    # 5. IMPELLER
    # -----------------------------------------------------------------------
    "impeller": {
        "keywords": ["impulsor", "impeller", "rodete", "rotor de bomba",
                      "rotor bomba"],
        "material": "acero inoxidable / hi-chrome iron (28% Cr) / caucho natural",
        "functions": [
            {
                "function_es": "Transferir energia cinetica al fluido mediante rotacion, generando presion y caudal de diseno",
                "functional_failures": [
                    {
                        "failure_es": "Caudal/presion insuficiente — impulsor no entrega energia al fluido",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Silice (quartz Mohs 7) en slurry de Salares Norte erosiona alabes y shrouds; perdida de perfil hidraulico reduce head 2-4% por cada 1mm de desgaste",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Velocidad periferica >25m/s en slurry genera erosion concentrada en borde de ataque de alabes y cutwater del volute",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-65",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Aire atrapado",
                                "why": "NPSH disponible reducido 40% a 4500m; cavitacion en ojo del impulsor genera implosion de burbujas que arranca material de alabes",
                                "pattern": "E",
                                "detection": "Vibration monitoring (broadband HF cavitation)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-66",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Operacion fuera de BEP genera recirculacion interna; vortices erosionan backplate y sidewalls del impulsor",
                                "pattern": "B",
                                "detection": "UT wall thickness at erosion-prone locations",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-63",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Uso normal",
                                "why": "Incluso en condiciones normales de operacion, slurry de silice erosiona impulsor; vida util 2000-4000h vs 6000-8000h en otras minas",
                                "pattern": "B",
                                "detection": "Coating thickness measurement (DFT gauge)",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Vibracion excesiva — desbalance por desgaste diferencial",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Desgaste asimetrico de alabes genera desbalance de masa; vibracion 1x crece hasta ser destructiva para rodamientos y sello",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Cianuro y pH extremos atacan acero al carbono; corrosion localizada en alabes genera perdida asimetrica de masa y desbalance",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura del impulsor — fragmentacion catastrofica",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Vibracion por desbalance + ciclos de arranque/parada generan fatiga en union alabe-shroud; fractura libera fragmento que destruye volute",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Trozo solido (tramp metal, piedra sobredimensionada) impacta alabe; fractura instantanea con dano colateral",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "Hi-chrome iron es fragil; microgrietas de fundicion propagan con servicio; inspeccion de recambio revela grietas ocultas",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Arranques/paradas generan choque termico y mecanico en alabes; grietas de fatiga inician en radios de pie de alabe",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: impulsor no es electrico",
            "FM-08": "Bio-organismos: proceso minero inhibe crecimiento biologico",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal no caduca",
            "FM-47": "Perdida de precarga: impulsor fijado por tuerca unica con torque definido, no sujeto a aflojamiento normal",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 6. FASTENER
    # -----------------------------------------------------------------------
    "fastener": {
        "keywords": ["perno", "pernos", "tornillo", "tuerca", "arandela",
                      "sujetador", "sujetadores", "prisionero", "esparrago",
                      "stud", "bolt", "nut"],
        "material": "acero grado 8.8 / 10.9 / ASTM A193 B7 / inoxidable 316",
        "functions": [
            {
                "function_es": "Unir componentes mecanicos manteniendo la precarga de apriete requerida bajo cargas estaticas y dinamicas",
                "functional_failures": [
                    {
                        "failure_es": "Perdida de union — perno no mantiene precarga",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion de equipos rotativos genera micro-deslizamiento en hilos de rosca (efecto Junker); precarga cae hasta holgura total en semanas",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-45",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Fluencia/Creep",
                                "why": "Perno a alta temperatura (bridas de escape, hornos) sufre creep en hilos; relajacion de precarga sin aflojamiento visible",
                                "pattern": "B",
                                "detection": "Ultrasonic bolt tension measurement",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-46",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Temperatura excesiva",
                                "why": "Ciclaje termico diario (-20°C a +40°C en Salares Norte) genera expansion/contraccion diferencial perno-brida; precarga cae 5-15% por ciclo",
                                "pattern": "E",
                                "detection": "Post-event bolt torque and condition inspection",
                                "pf_interval": "Event-based",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura del perno — falla catastrofica de union",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Concentrador de esfuerzos en primer hilo de rosca bajo carga ciclica propaga grieta de fatiga; fractura subita sin deformacion previa",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Sobre-apriete durante montaje o carga de choque excede Sut del perno; fractura inmediata en zona de transicion cabeza-vastago",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Pernos de shell de molino SAG bajo impacto continuo de bolas y mineral; fatiga genera grietas que no se detectan externamente",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Corrosion — perno pierde seccion resistente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Pernos expuestos a salpicadura de solucion cianurada pierden seccion; combinado con carga ciclica, inicia corrosion bajo tension",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "A 4500m la radiacion UV extrema degrada recubrimiento protector; humedad de condensacion matinal inicia oxidacion en pernos de estructura exterior",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: perno no es componente electrico",
            "FM-02": "Obstruccion: perno no conduce fluido",
            "FM-08": "Bio-organismos: componente metalico seco",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-25": "Degradacion por envejecimiento: acero de alta resistencia no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: acero no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: perno no expuesto a flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 7. STRUCTURE_STEEL
    # -----------------------------------------------------------------------
    "structure_steel": {
        "keywords": ["estructura", "marco", "chasis", "bastidor", "armazon",
                      "columna", "viga", "cercha", "portico",
                      "soldadura", "soldada", "soldadas", "soldado",
                      "union soldada", "uniones soldadas"],
        "material": "acero estructural ASTM A36 / A572 Gr.50",
        "functions": [
            {
                "function_es": "Soportar cargas estaticas y dinamicas de equipos e instalaciones manteniendo integridad geometrica",
                "functional_failures": [
                    {
                        "failure_es": "Perdida de capacidad portante — estructura no soporta cargas de diseno",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Salpicadura de solucion cianurada y acida reduce espesor de perfiles; perdida de seccion reduce capacidad portante progresivamente",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "UV extremo a 4500m degrada pintura en 2-3 anos; condensacion matinal + polvo de silice inicia oxidacion en zonas sin recubrimiento",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Viento persistente + vibracion de equipos genera fatiga en soldaduras de nudos; grieta propaga hasta fractura de conexion",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Expansion termica diferencial (-20°C a +40°C) genera esfuerzos ciclicos en soldaduras restringidas; grietas en pie de soldadura",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Deformacion excesiva — deflexion fuera de tolerancia",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Acumulacion de mineral en plataformas o impacto de vehiculos supera capacidad de diseno; deflexion permanente desalinea equipos montados",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impacto de camion minero o caida de roca deforma perfil; pandeo local reduce capacidad de columna criticamente",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga sismica o de viento extremo combinada con corrosion previa supera capacidad residual; colapso parcial o total",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: estructura no es electrica",
            "FM-02": "Obstruccion: estructura no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-25": "Degradacion por envejecimiento: acero estructural no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: acero no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: estructura no sujeta a flujo abrasivo (excepto liners que son clase aparte)",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: estructura no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 8. MOTOR_WINDING
    # -----------------------------------------------------------------------
    "motor_winding": {
        "keywords": ["motor electrico", "motor eléctrico", "motor", "estator",
                      "bobinado", "winding", "devanado"],
        "material": "cobre esmaltado / aislamiento Clase F-H / acero silicio",
        "functions": [
            {
                "function_es": "Convertir energia electrica en torque mecanico rotativo de forma continua y eficiente",
                "functional_failures": [
                    {
                        "failure_es": "No genera torque — motor no arranca o se detiene",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-01",
                                "mechanism_es": "Arco electrico",
                                "cause_es": "Falla de aislamiento",
                                "why": "A 4500m la densidad del aire es 65% de la normal; tension de descarga parcial se reduce ~35%, acelerando deterioro de aislamiento entre espiras",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-58",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Falla de aislamiento",
                                "why": "Condensacion diaria (ciclaje -20°C/+40°C) deposita humedad en cabezas de bobina; combinado con polvo de silice, crea camino conductivo entre espiras",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-48",
                                "mechanism_es": "Circuito abierto",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Arranques frecuentes de motor (6-8x corriente nominal) generan esfuerzos electromagneticos que mueven conductores; fatiga de cobre en salida de ranura",
                                "pattern": "E",
                                "detection": "Thermography of electrical connections",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-61",
                                "mechanism_es": "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)",
                                "cause_es": "Sobrecorriente",
                                "why": "Desbalance de tension de red o fase perdida genera sobrecorriente en devanado; a altitud, refrigeracion por aire reducida 35% impide disipar calor",
                                "pattern": "E",
                                "detection": "Phase current and voltage balance monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                            {
                                "fm_ref": "FM-60",
                                "mechanism_es": "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Equipo impulsado trabado (crusher, pump) demanda corriente >150% nominal; motor sin proteccion adecuada se quema en minutos a altitud",
                                "pattern": "E",
                                "detection": "Motor current monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento — motor opera sobre temperatura de diseno",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-49",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de silice bloquea canales de ventilacion del motor; flujo de aire reducido + altitud = temperatura de bobinado excede Clase F en horas",
                                "pattern": "C",
                                "detection": "Operating temperature trending (RTD/thermocouple/thermography)",
                                "pf_interval": "Continuous-monthly",
                            },
                            {
                                "fm_ref": "FM-50",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Armonicos de VFD + baja densidad de aire reducen capacidad de refrigeracion; temperatura sube exponencialmente segun Arrhenius (10°C = 1/2 vida)",
                                "pattern": "E",
                                "detection": "Thermography of panels and connections",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion de aislamiento — vida util reducida",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Aislamiento clase F tiene vida termica de 20000h a 155°C; a altitud con derating insuficiente, vida real puede ser 50% del nominal",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-29",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Arco electrico",
                                "why": "Descargas parciales (PD) a tension reducida de inception (altitud) erosionan aislamiento inter-espiras; carbonizacion progresiva hasta cortocircuito",
                                "pattern": "C",
                                "detection": "Contact resistance measurement (micro-ohm)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-28",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de silice + condensacion forma pasta conductiva en cabezas de bobina; corriente de fuga entre fases degrada aislamiento",
                                "pattern": "C",
                                "detection": "Oil analysis (particle count, water, viscosity, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Falla de rodamientos del motor — vibracion/ruido excesivo",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-44",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Falta de lubricacion",
                                "why": "Grasa mineral se endurece a -20°C; rodamiento arranca sin lubricacion efectiva, genera calor y traba en minutos",
                                "pattern": "C",
                                "detection": "Vibration analysis (envelope/demodulation)",
                                "pf_interval": "2-8 wk",
                            },
                            {
                                "fm_ref": "FM-51",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Falta de lubricacion",
                                "why": "Intervalo de reengrase OEM no ajustado a altitud y polvo; grasa se agota antes de proximo servicio, rodamiento se sobrecalienta",
                                "pattern": "B",
                                "detection": "Bearing temperature monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                            {
                                "fm_ref": "FM-64",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Degradacion del lubricante",
                                "why": "Grasa degradada por alta temperatura de operacion pierde consistencia NLGI; no mantiene pelicula en zona de carga de rodamiento",
                                "pattern": "B",
                                "detection": "Oil analysis (oxidation, viscosity, TAN, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Corriente de eje (shaft voltage) por VFD genera EDM pitting en pistas de rodamiento; hoyuelos microscopicos acumulan hasta rugosidad excesiva",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: motor no conduce fluido (ventilacion no es obstruccion FM-02)",
            "FM-08": "Bio-organismos: componente seco, no expuesto a crecimiento biologico",
            "FM-09": "Corrosion quimica: motor no expuesto a proceso quimico directamente",
            "FM-37": "Deriva: motor no es instrumento",
            "FM-42": "Vencimiento: componentes metalicos/cobre no caducan",
            "FM-55": "Abrasion: bobinado no expuesto a flujo abrasivo",
            "FM-62": "Erosion por fluido: motor no contacta fluido de proceso",
        },
    },

    # -----------------------------------------------------------------------
    # 9. CABLE_POWER
    # -----------------------------------------------------------------------
    "cable_power": {
        "keywords": ["cable de poder", "cable de fuerza", "cable electrico",
                      "cable eléctrico", "cable", "cableado", "conductor",
                      "alambre", "cable mv", "cable bt"],
        "material": "cobre / aluminio / aislamiento XLPE-EPR",
        "functions": [
            {
                "function_es": "Conducir energia electrica desde fuente hasta carga sin perdida excesiva ni riesgo de arco",
                "functional_failures": [
                    {
                        "failure_es": "Circuito abierto — no conduce corriente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-48",
                                "mechanism_es": "Circuito abierto",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Sobrecorriente funde conductor en punto de menor seccion (empalme, dano mecanico); circuito se abre sin posibilidad de recierre",
                                "pattern": "E",
                                "detection": "Thermography of electrical connections",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-17",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Conexiones electricas deficientes",
                                "why": "Corrosion en terminal por condensacion + polvo de silice aumenta resistencia de contacto; calentamiento progresivo hasta fusion de terminal",
                                "pattern": "C",
                                "detection": "IR thermographic survey",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Cortocircuito — aislamiento falla entre conductores",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-58",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Falla de aislamiento",
                                "why": "XLPE envejece por calor y UV a altitud; microgrietas permiten humedad de condensacion que reduce rigidez dielectrica hasta breakdown",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-01",
                                "mechanism_es": "Arco electrico",
                                "cause_es": "Falla de aislamiento",
                                "why": "A 4500m distancia de arco se reduce ~35%; cables en bandeja con espaciamiento estandar pueden experimentar arco entre fases",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-59",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de silice + condensacion en terminaciones de cable crea camino conductivo entre fases; tracking superficial progresa hasta arco",
                                "pattern": "C",
                                "detection": "Surface insulation resistance measurement",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion de aislamiento — vida reducida sin falla inmediata",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "XLPE pierde propiedades dielectricas por envejecimiento termico; regla 10°C Arrhenius reduce vida 50% por cada 10°C sobre nominal",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-32",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Radiacion",
                                "why": "UV extremo a 4500m degrada chaqueta exterior de cable en bandejas exteriores; exposicion del aislamiento primario acelera falla",
                                "pattern": "B",
                                "detection": "Visual inspection for chalking, cracking, discoloration",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-29",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Arco electrico",
                                "why": "Micro-arcos en conexiones flojas carbonizan aislamiento adyacente; zona carbonizada es conductiva, propagando dano",
                                "pattern": "C",
                                "detection": "Contact resistance measurement (micro-ohm)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento — cable opera sobre capacidad de ampacidad",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-61",
                                "mechanism_es": "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)",
                                "cause_es": "Sobrecorriente",
                                "why": "Cable dimensionado para altitud (ampacidad reducida por menor conveccion) pero proteccion no ajustada; sobrecorriente cronica degrada aislamiento",
                                "pattern": "E",
                                "detection": "Phase current and voltage balance monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: cable no conduce fluido",
            "FM-05": "Rotura por fatiga: cable de poder es estatico, no sujeto a carga ciclica mecanica",
            "FM-09": "Corrosion quimica: cable no expuesto a proceso quimico directamente",
            "FM-37": "Deriva: no es instrumento",
            "FM-44": "Falta de lubricacion: cable no requiere lubricacion",
            "FM-47": "Perdida de precarga: cable no tiene precarga mecanica (terminales si, pero son clase aparte)",
            "FM-55": "Abrasion: cable no expuesto a flujo abrasivo",
            "FM-64": "Degradacion lubricante: no aplica",
        },
    },

    # -----------------------------------------------------------------------
    # 10. PIPE_PROCESS
    # -----------------------------------------------------------------------
    "pipe_process": {
        "keywords": ["tuberia", "tubería", "tubo", "cañeria", "cañería",
                      "ducto", "manifold", "niple", "pipe"],
        "material": "acero al carbono A106 / HDPE / acero inoxidable 316L",
        "functions": [
            {
                "function_es": "Conducir fluidos de proceso entre equipos manteniendo contencion a presion y temperatura de diseno",
                "functional_failures": [
                    {
                        "failure_es": "Fuga — fluido escapa por pared o uniones",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Slurry de silice (Mohs 7) a velocidad >2m/s erosiona codos y tees; pared se adelgaza hasta perforacion, especialmente en radio exterior de curvas",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Velocidad >3m/s en slurry concentrado genera turbulencia extrema en reducciones; erosion localizada 5-10x mas rapida que tramo recto",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Solucion de cianuro (pH 10-11) y acido sulfurico (pH 1-2) atacan acero al carbono; perdida de espesor uniforme o localizada en soldaduras",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-11",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Hendidura/Resquicio",
                                "why": "Zona de traslape en juntas y bajo gaskets de brida genera celda de concentracion; corrosion acelerada en resquicio hasta perforacion",
                                "pattern": "B",
                                "detection": "UT thickness at flange faces and gasket lines",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "HDPE pierde ductilidad por UV y oxidacion termica; tuberias expuestas a sol a 4500m se agrietan en 5-7 anos vs 20+ anos bajo tierra",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Expansion termica diaria (-20°C a +60°C proceso) en tuberia restringida genera fatiga en soldaduras de conexion a equipos",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Obstruccion — fluido no puede circular",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-02",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Contaminacion",
                                "why": "Incrustaciones de sales precipitan en tramos de baja velocidad; en Salares Norte, congelamiento de agua en dead legs es causa principal de bloqueo",
                                "pattern": "C",
                                "detection": "Differential pressure measurement",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-04",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Velocidad de fluido insuficiente",
                                "why": "Velocidad <1.5m/s en slurry permite sedimentacion de solidos; acumulacion progresiva hasta bloqueo total de seccion",
                                "pattern": "D",
                                "detection": "Pipeline flow velocity monitoring (electromagnetic/ultrasonic)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-03",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Tamano excesivo de particulas",
                                "why": "Roca sobredimensionada pasa screening y se aloja en reduccion o codo; bloqueo subito con spike de presion upstream",
                                "pattern": "E",
                                "detection": "dP monitoring with alarm",
                                "pf_interval": "Minutes-hours",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura catastrofica — perdida total de contencion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Golpe de ariete (cierre rapido de valvula) o presion de hielo (expansion 9%) supera presion de diseno; fractura fragil a -20°C en acero sin ensayo Charpy",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-24",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Esfuerzos termicos (calor/frio)",
                                "why": "Congelamiento de agua en tuberia genera presion de expansion; acero a -20°C pierde tenacidad, grieta propaga rapidamente",
                                "pattern": "B",
                                "detection": "DPI for thermal fatigue crack detection",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Corrosion externa — perdida de espesor desde superficie exterior",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Tuberia enterrada o en contacto con suelo humedo sin proteccion catodica pierde espesor; condensacion + derrames aceleran corrosion exterior",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Tuberia exterior sin recubrimiento adecuado; UV degrada pintura, condensacion matinal inicia oxidacion",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: tuberia no es electrica (heat tracing es componente aparte)",
            "FM-08": "Bio-organismos: proceso minero con cianuro inhibe crecimiento biologico",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal/HDPE no caduca en sentido estricto",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: tuberia no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 11. VALVE_PROCESS
    # -----------------------------------------------------------------------
    "valve_process": {
        "keywords": ["valvula", "válvula", "válvulas", "valvulas", "compuerta",
                      "globo", "mariposa", "check", "alivio", "retencion",
                      "valvula de bola", "ball valve", "gate valve",
                      "valvula pinch", "knife gate"],
        "material": "acero fundido / acero inoxidable / bronce / HDPE",
        "functions": [
            {
                "function_es": "Regular, aislar o controlar el flujo de fluidos en el sistema de proceso de forma confiable",
                "functional_failures": [
                    {
                        "failure_es": "Fuga pasante — valvula no sella cuando esta cerrada",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Particulas de silice erosionan asiento y obturador durante cierre/apertura; surcos en superficie de sellado impiden cierre hermetico",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Throttling genera velocidad extrema en orificio parcialmente abierto; erosion por turbulencia destruye trim en semanas",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-65",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Aire atrapado",
                                "why": "Cavitacion por caida de presion a traves de valvula (especialmente a altitud con NPSH reducido); implosion de burbujas erosiona downstream face",
                                "pattern": "E",
                                "detection": "Vibration monitoring (broadband HF cavitation)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-71",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contacto metal con metal",
                                "why": "Cierre metal-metal (knife gate) genera desgaste adhesivo en cada operacion; despues de miles de ciclos, gap entre cuchilla y asiento impide sellado",
                                "pattern": "B",
                                "detection": "Dimensional measurement of wear components",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Solucion cianurada corroe asientos de acero al carbono; pitting localizado en zona de sellado impide cierre hermetico",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Valvula trabada — no abre ni cierra",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-43",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Contaminacion",
                                "why": "Slurry cristaliza alrededor del vastago y empaquetadura durante parada prolongada; torque de operacion supera capacidad del actuador",
                                "pattern": "C",
                                "detection": "Valve partial stroke testing (PST)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-44",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Falta de lubricacion",
                                "why": "Lubricante del vastago se seca o congela a -20°C; friccion en empaquetadura impide movimiento, valvula aparenta estar cerrada pero no lo esta",
                                "pattern": "C",
                                "detection": "Vibration analysis (envelope/demodulation)",
                                "pf_interval": "2-8 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "Obstruccion — valvula no permite paso de fluido estando abierta",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-02",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Contaminacion",
                                "why": "Acumulacion de solidos en cuerpo de valvula (especialmente check valves horizontales); flujo restringido progresivamente",
                                "pattern": "C",
                                "detection": "Differential pressure measurement",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-03",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Tamano excesivo de particulas",
                                "why": "Roca sobredimensionada se aloja entre obturador y asiento; valvula ni abre ni cierra completamente",
                                "pattern": "E",
                                "detection": "dP monitoring with alarm",
                                "pf_interval": "Minutes-hours",
                            },
                        ],
                    },
                    {
                        "failure_es": "Fuga externa — fluido escapa por cuerpo, empaquetadura o bridas",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-11",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Hendidura/Resquicio",
                                "why": "Corrosion en resquicio entre empaquetadura y vastago genera camino de fuga; cianuro escapa al ambiente (riesgo HSE)",
                                "pattern": "B",
                                "detection": "UT thickness at flange faces and gasket lines",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "Cuerpo de fundicion envejece por ciclos termicos; microgrietas de fundicion propagan hasta fuga a traves de pared",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: valvula de proceso no es electrica (actuador electrico es clase aparte)",
            "FM-08": "Bio-organismos: proceso con cianuro inhibe crecimiento",
            "FM-17": "Conexiones electricas: no aplica a cuerpo de valvula",
            "FM-37": "Deriva: valvula no es instrumento de medicion",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: lubricacion de vastago es auxiliar, no modo de falla primario",
        },
    },

    # -----------------------------------------------------------------------
    # 12. BELT_CONVEYOR
    # -----------------------------------------------------------------------
    "belt_conveyor": {
        "keywords": ["correa", "banda", "conveyor", "faja", "transportador",
                      "belt", "correa transportadora"],
        "material": "caucho SBR/NBR reforzado con nylon/acero / aramida",
        "functions": [
            {
                "function_es": "Transportar mineral a granel de forma continua entre puntos de proceso sin derrames ni roturas",
                "functional_failures": [
                    {
                        "failure_es": "Rotura de correa — transporte interrumpido",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-56",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Roca puntiaguda sobredimensionada (>300mm) cae desde altura en punto de carga; perfora cubierta y corta cables de acero o telas de nylon",
                                "pattern": "E",
                                "detection": "Belt rip detection (electromagnetic loop/sensor cord)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-57",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Atascamiento de material entre correa y estructura genera tension lateral; desgarro longitudinal progresivo hasta rotura total",
                                "pattern": "E",
                                "detection": "Wire rope inspection (visual + MRT)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Flexion repetitiva sobre poleas fatiga cables de acero internos; a -20°C caucho se rigidiza y concentra esfuerzos en empalme",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Desgaste de cubierta — espesor insuficiente para proteccion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Silice (Mohs 7) en punto de carga y bajo faldones erosiona cubierta carry-side; perdida de 1-2mm/mes en zona de impacto",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "UV extremo a 4500m degrada caucho SBR en secciones expuestas al sol; agrietamiento superficial (weather checking) reduce vida 30-50%",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-32",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Radiacion",
                                "why": "Radiacion UV a altitud rompe cadenas polimero del caucho; cubierta se endurece y agrieta, exponiendo refuerzo textil a humedad",
                                "pattern": "B",
                                "detection": "Visual inspection for chalking, cracking, discoloration",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Desalineacion — correa se desvia de trayectoria central",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Carga descentrada deforma estructura de soporte de polines; inclinacion permanente genera desviacion progresiva de correa",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Acumulacion de material adherido (carry-back) en polea motriz genera diametro desigual; correa migra hacia lado de mayor diametro",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Falla de empalme — separacion de union",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Arranque con correa cargada aplica tension >110% nominal; empalme vulcanizado es el punto mas debil, se separa",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: correa no es electrica",
            "FM-02": "Obstruccion: correa no conduce fluido internamente",
            "FM-08": "Bio-organismos: no aplica a caucho sintetico en ambiente seco",
            "FM-09": "Corrosion quimica: caucho resistente a pH del proceso",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: caucho no tiene fecha de caducidad en servicio",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: correa no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 13. LINER_WEAR
    # -----------------------------------------------------------------------
    "liner_wear": {
        "keywords": ["revestimiento", "revestimientos", "liner", "camisa",
                      "blindaje", "placa de desgaste", "wear plate",
                      "chute liner", "liner de chute"],
        "material": "acero AR400/AR500 / ceramica Al2O3 / caucho NR / hi-chrome 28%Cr",
        "functions": [
            {
                "function_es": "Proteger superficies estructurales contra erosion y abrasion por material de proceso, manteniendo perfil de flujo",
                "functional_failures": [
                    {
                        "failure_es": "Desgaste excesivo — liner no protege la superficie base",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Silice (Mohs 7) abrasiona superficie de liner en cada tonelada transportada; vida util directamente proporcional a dureza y espesor vs abrasividad del ore",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-67",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Carga de impacto/choque",
                                "why": "ROM (run-of-mine) hasta 1000mm impacta liner de chute en punto de descarga; impacto repetitivo genera craterización y fractura de ceramica",
                                "pattern": "B",
                                "detection": "Liner thickness/profile measurement (template, UT)",
                                "pf_interval": "Monthly-quarterly",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "En chutes de alta velocidad (>5m/s), slurry de silice genera erosion por impacto angular que remueve material 10x mas rapido que abrasion por deslizamiento",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-63",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Uso normal",
                                "why": "Incluso a velocidades de diseno, flujo abrasivo continuo erosiona liner; en Salares Norte vida de liner de molino SAG es 4000-6000h",
                                "pattern": "B",
                                "detection": "Coating thickness measurement (DFT gauge)",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Exceso de carga de bolas en molino genera presion de contacto superior al diseno del liner; desgaste acelerado en zona de carga",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                    {
                        "failure_es": "Desprendimiento — liner se separa de estructura base",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Vibracion continua del equipo fatiga pernos de fijacion de liner; perno fractura y liner rota libre, danando equipo downstream",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Impacto de roca sobredimensionada fractura liner de ceramica; fragmentos entran en proceso danando equipos downstream",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Corrosion bajo liner — falla oculta de estructura base",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Fluido de proceso penetra por pernos de liner y espacio entre liner y shell; corrosion oculta reduce espesor de shell sin indicacion externa",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: liner no es electrico",
            "FM-02": "Obstruccion: liner no conduce fluido",
            "FM-08": "Bio-organismos: no aplica en proceso minero",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-25": "Degradacion por envejecimiento: acero/ceramica no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: liner no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 14. GEAR
    # -----------------------------------------------------------------------
    "gear": {
        "keywords": ["engranaje", "piñon", "piñón", "corona", "cremallera",
                      "gear", "pinion", "ring gear"],
        "material": "acero aleado cementado AISI 8620/4320 / acero al manganeso",
        "functions": [
            {
                "function_es": "Transmitir torque entre ejes cambiando velocidad y direccion de rotacion con relacion definida",
                "functional_failures": [
                    {
                        "failure_es": "Desgaste excesivo de dientes — perdida de perfil de evolvente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-71",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contacto metal con metal",
                                "why": "Contacto directo entre flancos de dientes remueve material de superficie cementada; una vez traspasada capa dura, desgaste acelera exponencialmente",
                                "pattern": "B",
                                "detection": "Dimensional measurement of wear components",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-64",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Degradacion del lubricante",
                                "why": "Aceite de reductor pierde aditivos EP por oxidacion; pelicula insuficiente permite micro-pitting en flancos de dientes bajo carga",
                                "pattern": "B",
                                "detection": "Oil analysis (oxidation, viscosity, TAN, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-69",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contaminacion del lubricante (particulas)",
                                "why": "Particulas metalicas de desgaste inicial recirculan en aceite; efecto de abrasion en tres cuerpos acelera desgaste de flancos",
                                "pattern": "C",
                                "detection": "Oil particle count (ISO 4406)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Torque superior al diseno (ej. arranque de molino cargado) genera deformacion plastica en raiz de diente; pitting macroscopico",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                    {
                        "failure_es": "Fractura de diente — perdida de transmision de torque",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Fatiga por flexion en raiz de diente propaga grieta; fractura subita de diente genera cascada de fallas en dientes adyacentes",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Tramp metal en molino o trabamiento de equipo aplica torque instantaneo >3x nominal; diente fractura por sobrecarga unica",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento — temperatura de operacion excesiva",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-51",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Falta de lubricacion",
                                "why": "Perdida de nivel de aceite o falla de bomba de lubricacion; contacto seco genera calor extremo en flancos, recocido de capa cementada",
                                "pattern": "B",
                                "detection": "Bearing temperature monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                            {
                                "fm_ref": "FM-52",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga continua superior al diseno genera calor por friccion en flancos; a altitud, enfriamiento del aceite es 35% menos eficiente",
                                "pattern": "E",
                                "detection": "Bearing temperature + load monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: engranaje no es electrico",
            "FM-02": "Obstruccion: engranaje no conduce fluido",
            "FM-09": "Corrosion quimica: engranaje esta sumergido en aceite, no expuesto a proceso",
            "FM-13": "Corrosion atmosferica: engranaje cerrado en carcasa con aceite",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-25": "Degradacion por envejecimiento: acero cementado no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: engranaje en caja cerrada, no sujeto a slurry abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 15. COUPLING
    # -----------------------------------------------------------------------
    "coupling": {
        "keywords": ["acoplamiento", "coupling", "junta flexible", "cardanico",
                      "acople", "acoplamiento flexible", "grid coupling",
                      "fluid coupling"],
        "material": "acero / elastomero (poliuretano, Hytrel) / aleacion especial",
        "functions": [
            {
                "function_es": "Conectar ejes de motor y equipo impulsado, transmitiendo torque y compensando desalineacion angular/paralela",
                "functional_failures": [
                    {
                        "failure_es": "No transmite torque — falla de elemento de transmision",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Elemento elastomerico (jaw insert, grid) fatiga por ciclos de torque; a -20°C caucho pierde elasticidad y concentra esfuerzos en raiz de diente",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Arranque de equipo trabado aplica torque >3x nominal; elemento fusible del acoplamiento fractura (diseno intencional) o cubo se fractura (falla)",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Elemento elastomerico pierde propiedades por ozono y ciclaje termico; rigidez aumenta, acoplamiento ya no compensa desalineacion, transmite vibracion",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Vibracion excesiva — acoplamiento no compensa desalineacion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Desalineacion excesiva genera deslizamiento relativo entre grid y ranura del cubo; desgaste de grid hasta holgura y golpeteo",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-70",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Torque continuo superior al rating deforma dientes de cubo; holgura crece y genera impacto rotativo 2x RPM",
                                "pattern": "E",
                                "detection": "Load monitoring (power, current, pressure)",
                                "pf_interval": "Continuous",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Pernos de acoplamiento se aflojan por vibracion; juego angular genera golpe 1x que escala a dano de rodamiento",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento de elemento elastomerico",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-52",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Histeresis en elemento elastomerico bajo torque excesivo genera calor; elastomero se reblandece y pierde capacidad de transmision",
                                "pattern": "E",
                                "detection": "Bearing temperature + load monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: acoplamiento no es electrico",
            "FM-02": "Obstruccion: no conduce fluido (excepto fluid coupling, que es caso especial)",
            "FM-09": "Corrosion quimica: componente interno no expuesto a proceso",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: componentes metalicos no caducan",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: acoplamiento cerrado, no expuesto a slurry",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: acoplamientos elastomericos no usan lubricante (grid couplings si)",
        },
    },

    # -----------------------------------------------------------------------
    # 16. FAN_BLADE
    # -----------------------------------------------------------------------
    "fan_blade": {
        "keywords": ["ventilador", "fan", "aspa", "helice", "alabe de ventilador",
                      "impulsor de ventilador"],
        "material": "acero / aluminio / FRP (fibra de vidrio reforzada)",
        "functions": [
            {
                "function_es": "Generar flujo de aire forzado para refrigeracion de equipos, ventilacion de recintos o desempolvado",
                "functional_failures": [
                    {
                        "failure_es": "Caudal de aire insuficiente — ventilador no entrega flujo de diseno",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Polvo de silice transportado erosiona borde de ataque de alabes; perdida de perfil aerodinamico reduce eficiencia y caudal",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Velocidad en punta de alabe >80m/s con particulas de silice genera erosion concentrada; a 4500m mayor velocidad necesaria por baja densidad de aire",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-63",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Uso normal",
                                "why": "Incluso con aire limpio, operacion continua a alta velocidad periferica erosiona borde de ataque; vida reducida a altitud por mayor RPM requerido",
                                "pattern": "B",
                                "detection": "Coating thickness measurement (DFT gauge)",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Vibracion excesiva — desbalance por desgaste diferencial o deposito",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Pernos de fijacion de aspas se aflojan por vibracion propia; desequilibrio crece hasta nivel destructivo para rodamientos",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Impacto de objeto extraño o acumulacion de hielo desigual deforma alabe; desbalance de masa genera vibracion 1x creciente",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura de alabe — fragmentacion catastrofica",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Vibracion aerodinamica a frecuencia natural del alabe genera resonancia; fatiga en raiz de alabe hasta fractura; fragmento sale como proyectil",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Objeto extraño ingresa a ventilador; impacto fractura alabe instantaneamente con dano colateral a otros alabes y carcasa",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "FRP pierde resistencia por UV y ciclaje termico; delaminacion progresiva en raiz de alabe hasta fractura sin aviso",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: aspa no es electrica",
            "FM-02": "Obstruccion: ventilador no conduce fluido internamente",
            "FM-08": "Bio-organismos: no aplica en ambiente seco de altitud",
            "FM-09": "Corrosion quimica: ventilador maneja aire, no fluido quimico",
            "FM-17": "Conexiones electricas: no aplica al alabe",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal/FRP no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: alabe no usa lubricacion",
        },
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # P2 IMPORTANT
    # ═══════════════════════════════════════════════════════════════════════════

    # -----------------------------------------------------------------------
    # 17. GASKET
    # -----------------------------------------------------------------------
    "gasket": {
        "keywords": ["empaquetadura", "empaque", "junta", "gasket",
                      "junta espirometalica", "junta de brida"],
        "material": "grafito flexible / PTFE / fibra comprimida / acero+grafito (spiralwound)",
        "functions": [
            {
                "function_es": "Sellar uniones bridadas estaticas impidiendo fugas de fluido a presion y temperatura de operacion",
                "functional_failures": [
                    {
                        "failure_es": "Fuga en junta — fluido escapa entre bridas",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion de tuberia afloja pernos de brida; presion de contacto en gasket cae por debajo de minimo de sellado",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-45",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Fluencia/Creep",
                                "why": "Gasket de PTFE o fibra comprimida sufre creep bajo carga sostenida; espesor disminuye y precarga de perno se pierde (gasket relaxation)",
                                "pattern": "B",
                                "detection": "Ultrasonic bolt tension measurement",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Elastomero o fibra organica del gasket pierde resiliencia con temperatura y tiempo; no recupera despues de relajacion termica",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-27",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Reaccion quimica",
                                "why": "Cianuro y acido atacan gaskets de fibra; degradacion quimica reduce integridad mecanica del material de sellado",
                                "pattern": "B",
                                "detection": "Oil analysis (TAN, viscosity, oxidation, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura de gasket — falla catastrofica de sellado",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-07",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga termica",
                                "why": "Choque termico (liquido caliente en tuberia fria a -20°C) genera expansion diferencial que aplasta o fractura gasket",
                                "pattern": "E",
                                "detection": "Thermal scan on kiln shell",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Slurry abrasivo fluye entre bridas con gasket parcialmente fallado; efecto de chorro de arena destruye gasket y rana cara de brida",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-57",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Sobre-apriete de pernos aplasta gasket mas alla de su limite de compresion; extruye fuera de brida y pierde funcion de sellado",
                                "pattern": "E",
                                "detection": "Wire rope inspection (visual + MRT)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: gasket no es electrico",
            "FM-02": "Obstruccion: gasket no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: gasket no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 18. CONNECTION_ELECTRICAL
    # -----------------------------------------------------------------------
    "connection_electrical": {
        "keywords": ["terminal", "terminales", "bornera", "borne", "conector",
                      "prensaestopa", "cable lug", "empalme electrico"],
        "material": "cobre estanado / bronce fosforico / plastico PA66",
        "functions": [
            {
                "function_es": "Proveer punto de conexion electrica segura con resistencia de contacto minima entre conductores",
                "functional_failures": [
                    {
                        "failure_es": "Alta resistencia de contacto — calentamiento en conexion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-17",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Conexiones electricas deficientes",
                                "why": "Condensacion + polvo de silice forma capa resistiva en superficies de contacto; calentamiento por I²R progresivo hasta fusion",
                                "pattern": "C",
                                "detection": "IR thermographic survey",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion de equipo afloja tornillos de bornes; area de contacto disminuye, resistencia sube, calentamiento localizado",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Circuito abierto — conexion interrumpida",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-48",
                                "mechanism_es": "Circuito abierto",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Sobrecorriente transitoria funde terminal de menor seccion; circuito abierto sin indicacion visible",
                                "pattern": "E",
                                "detection": "Thermography of electrical connections",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-01",
                                "mechanism_es": "Arco electrico",
                                "cause_es": "Falla de aislamiento",
                                "why": "Terminal flojo genera micro-arcos bajo carga; arco erosiona cobre hasta circuito abierto, con riesgo de incendio en panel",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Cortocircuito — aislamiento entre terminales falla",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-58",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Falla de aislamiento",
                                "why": "Polvo conductor (silice + humedad) se deposita entre terminales; a altitud, distancia de arco reducida permite flashover entre fases",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-59",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Contaminacion",
                                "why": "Deposito de polvo conductivo + condensacion crea tracking superficial entre bornes de diferentes fases",
                                "pattern": "C",
                                "detection": "Surface insulation resistance measurement",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion — vida util reducida",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Aislamiento plastico de terminales (PA66) pierde propiedades mecanicas por UV y temperatura; se agrieta y expone partes vivas",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: terminal no conduce fluido",
            "FM-05": "Rotura por fatiga: terminal no sujeto a carga ciclica mecanica significativa",
            "FM-09": "Corrosion quimica: terminal no expuesto a proceso",
            "FM-37": "Deriva: terminal no es instrumento",
            "FM-55": "Abrasion: terminal no expuesto a flujo abrasivo",
            "FM-64": "Degradacion lubricante: terminal no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 19. FILTER_ELEMENT
    # -----------------------------------------------------------------------
    "filter_element": {
        "keywords": ["filtro", "cedazo", "malla filtrante", "cartucho",
                      "elemento filtrante", "filter element", "bolsa filtrante"],
        "material": "acero inoxidable mesh / celulosa / polipropileno / PTFE",
        "functions": [
            {
                "function_es": "Retener particulas contaminantes del fluido manteniendo caida de presion dentro de limites aceptables",
                "functional_failures": [
                    {
                        "failure_es": "Obstruccion — caida de presion excesiva",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-02",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Contaminacion",
                                "why": "Acumulacion progresiva de particulas retenidas reduce area libre de flujo; dP sube exponencialmente al final de vida util del elemento",
                                "pattern": "C",
                                "detection": "Differential pressure measurement",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-03",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Tamano excesivo de particulas",
                                "why": "Evento de alta contaminacion upstream satura filtro instantaneamente; bloqueo total en minutos",
                                "pattern": "E",
                                "detection": "dP monitoring with alarm",
                                "pf_interval": "Minutes-hours",
                            },
                        ],
                    },
                    {
                        "failure_es": "Bypass — filtro no retiene particulas",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Particulas de silice erosionan malla metalica; agujeros permiten paso de contaminantes que danan equipo downstream",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-56",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Golpe de ariete o surge de presion colapsa elemento filtrante; bypass total sin indicacion de dP",
                                "pattern": "E",
                                "detection": "Belt rip detection (electromagnetic loop/sensor cord)",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion — elemento pierde propiedades de filtracion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Celulosa y polipropileno pierden resistencia mecanica con temperatura y ciclaje; microestructura del medio abre, reduciendo eficiencia de captura",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-28",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Contaminacion",
                                "why": "Agua en aceite hidraulico satura medio filtrante de celulosa; medio pierde integridad y colapsa bajo dP normal",
                                "pattern": "C",
                                "detection": "Oil analysis (particle count, water, viscosity, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-42",
                                "mechanism_es": "Vencimiento/Caducidad",
                                "cause_es": "Envejecimiento",
                                "why": "Elemento filtrante almacenado pierde propiedades por degradacion del adhesivo y del medio; instalacion despues de fecha limite genera bypass",
                                "pattern": "B",
                                "detection": "Battery capacity testing (discharge test)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: filtro no es electrico",
            "FM-05": "Rotura por fatiga: elemento filtrante es consumible, no sujeto a fatiga significativa",
            "FM-09": "Corrosion quimica: material seleccionado compatible con fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: filtro no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: filtro retiene contaminantes, no genera lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 20. SENSOR_INSTRUMENT
    # -----------------------------------------------------------------------
    "sensor_instrument": {
        "keywords": ["sensor", "transmisor", "indicador", "medidor", "analizador",
                      "detector", "presostato", "termostato", "switch de nivel",
                      "switch de presion", "switch de flujo", "termopar",
                      "rtd", "pt100", "celda de carga",
                      "sistema monitoreo", "monitoreo en linea",
                      "pesometro", "codificador"],
        "material": "acero inoxidable 316L / ceramica / electronica",
        "functions": [
            {
                "function_es": "Medir variables de proceso (presion, temperatura, flujo, nivel) y transmitir senal precisa al sistema de control",
                "functional_failures": [
                    {
                        "failure_es": "Medicion incorrecta — lectura fuera de tolerancia",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-41",
                                "mechanism_es": "Deriva",
                                "cause_es": "Uso normal",
                                "why": "Componentes electronicos y sensores derivan naturalmente con el tiempo; a altitud, variacion de presion barometrica agrega error en transmisores de presion",
                                "pattern": "B",
                                "detection": "Scheduled calibration verification",
                                "pf_interval": "3-24 mo",
                            },
                            {
                                "fm_ref": "FM-37",
                                "mechanism_es": "Deriva",
                                "cause_es": "Temperatura excesiva (calor/frio)",
                                "why": "Ciclaje -20°C a +40°C diario genera esfuerzos termicos en componentes SMD; soldaduras se fatigan, resistencias cambian valor, deriva excesiva",
                                "pattern": "E",
                                "detection": "Calibration verification",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-38",
                                "mechanism_es": "Deriva",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Vibracion de equipo transmitida a instrumento desplaza mecanismo de medicion; celda de carga pierde zero, transmisor de presion genera offset",
                                "pattern": "E",
                                "detection": "Calibration verification",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-40",
                                "mechanism_es": "Deriva",
                                "cause_es": "Carga desigual",
                                "why": "Instrumento montado en tuberia con vibracion asimetrica o carga lateral; sensor mecanico se desplaza de zero",
                                "pattern": "C",
                                "detection": "Calibration verification with known reference",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sin senal — instrumento no transmite",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-48",
                                "mechanism_es": "Circuito abierto",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Descarga atmosferica (rayos frecuentes a 4500m) induce sobretension en loop 4-20mA; quema electronica del transmisor",
                                "pattern": "E",
                                "detection": "Thermography of electrical connections",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-17",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Conexiones electricas deficientes",
                                "why": "Condensacion en caja de conexiones del instrumento corroe terminales; resistencia de loop sube hasta que transmisor no puede mantener 4mA",
                                "pattern": "C",
                                "detection": "IR thermographic survey",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion — vida util reducida del sensor",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Diafragma de sensor de presion pierde elasticidad con ciclos; membrana ceramica de pH metro se contamina y pierde sensibilidad",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-28",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Contaminacion",
                                "why": "Deposito de escala o slurry en membrana de sensor obstruye medicion; sensor indica valor congelado o erratico",
                                "pattern": "C",
                                "detection": "Oil analysis (particle count, water, viscosity, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-42",
                                "mechanism_es": "Vencimiento/Caducidad",
                                "cause_es": "Envejecimiento",
                                "why": "Electrodos de pH y sensores electroquimicos tienen vida util limitada (6-24 meses); despues de ese periodo, medicion no es confiable",
                                "pattern": "B",
                                "detection": "Battery capacity testing (discharge test)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: sensor no conduce fluido (impulse lines si, pero son tuberia)",
            "FM-05": "Rotura por fatiga: sensor no sujeto a carga ciclica mecanica significativa",
            "FM-09": "Corrosion quimica: materiales de sensor seleccionados compatibles (316L, Hastelloy)",
            "FM-47": "Perdida de precarga: sensor fijado puntualmente, no critico",
            "FM-55": "Abrasion: sensor no en flujo abrasivo directo (si lo esta, se usa clase aparte)",
            "FM-58": "Cortocircuito: electronica de bajo voltaje, protegida por barreras IS",
            "FM-64": "Degradacion lubricante: sensor no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 21. PROTECTIVE_DEVICE
    # -----------------------------------------------------------------------
    "protective_device": {
        "keywords": ["rele", "relé", "relay", "fusible", "fuse",
                      "proteccion", "guardamotor", "overload",
                      "parada de emergencia", "e-stop", "safety relay"],
        "material": "plastico / contactos plata-niquel / electronica",
        "functions": [
            {
                "function_es": "Detectar condicion anormal y actuar para proteger equipo o personal interrumpiendo circuito o senalizando alarma",
                "functional_failures": [
                    {
                        "failure_es": "No actua cuando se requiere — falla oculta de proteccion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Contactos de rele se oxidan por desuso prolongado; cuando se demanda actuacion, contacto no cierra o no abre",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-42",
                                "mechanism_es": "Vencimiento/Caducidad",
                                "cause_es": "Envejecimiento",
                                "why": "Bateria de backup de rele de proteccion pierde capacidad; en corte de energia, rele no mantiene estado y no senaliza correctamente",
                                "pattern": "B",
                                "detection": "Battery capacity testing (discharge test)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-29",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Arco electrico",
                                "why": "Cada operacion de contacto genera micro-arco; material de contacto se erosiona progresivamente hasta que no hace contacto confiable",
                                "pattern": "C",
                                "detection": "Contact resistance measurement (micro-ohm)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Actua sin condicion anormal — disparo espurio",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-41",
                                "mechanism_es": "Deriva",
                                "cause_es": "Uso normal",
                                "why": "Set point de proteccion termica deriva con envejecimiento de bimetalico; dispara a corriente inferior a la calibrada",
                                "pattern": "B",
                                "detection": "Scheduled calibration verification",
                                "pf_interval": "3-24 mo",
                            },
                            {
                                "fm_ref": "FM-59",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Contaminacion",
                                "why": "Polvo conductivo + condensacion en placa de circuito genera corriente de fuga; electronica interpreta como senal de falla",
                                "pattern": "C",
                                "detection": "Surface insulation resistance measurement",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: dispositivo no conduce fluido",
            "FM-05": "Rotura por fatiga: dispositivo no sujeto a carga mecanica ciclica",
            "FM-09": "Corrosion quimica: dispositivo en panel protegido",
            "FM-47": "Perdida de precarga: dispositivo fijado en riel DIN, no critico",
            "FM-55": "Abrasion: dispositivo no expuesto a flujo abrasivo",
        },
    },

    # -----------------------------------------------------------------------
    # 22. LUBRICANT
    # -----------------------------------------------------------------------
    "lubricant": {
        "keywords": ["lubricante", "aceite", "grasa", "lubricacion",
                      "aceite hidraulico", "aceite de reductor"],
        "material": "aceite mineral / sintetico PAO / grasa base litio/poliurea",
        "functions": [
            {
                "function_es": "Reducir friccion y desgaste entre superficies en contacto, disipar calor y proteger contra corrosion",
                "functional_failures": [
                    {
                        "failure_es": "Lubricacion insuficiente — no reduce friccion adecuadamente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-27",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Reaccion quimica",
                                "why": "Oxidacion del aceite por temperatura y catalisis metalica genera acidos (TAN sube); viscosidad cambia, aditivos se agotan, pelicula lubricante falla",
                                "pattern": "B",
                                "detection": "Oil analysis (TAN, viscosity, oxidation, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-28",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Contaminacion",
                                "why": "Ingreso de agua (condensacion a altitud) y particulas de silice degrada propiedades del lubricante; emulsificacion reduce capacidad de pelicula",
                                "pattern": "C",
                                "detection": "Oil analysis (particle count, water, viscosity, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-31",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Exposicion a temperatura excesiva",
                                "why": "Grasa mineral se endurece a -20°C perdiendo bombeabilidad; al arrancar equipo, lubricante no fluye a zona de contacto durante minutos criticos",
                                "pattern": "E",
                                "detection": "Ambient temperature monitoring near sensitive equipment",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                    {
                        "failure_es": "Contaminacion — lubricante se convierte en medio abrasivo",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-69",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contaminacion del lubricante (particulas)",
                                "why": "Particulas metalicas de desgaste y silice externa circulan en aceite; abrasion en tres cuerpos acelera desgaste de superficies lubricadas",
                                "pattern": "C",
                                "detection": "Oil particle count (ISO 4406)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: lubricante no es electrico",
            "FM-02": "Obstruccion: lubricante es el fluido, no el conducto",
            "FM-05": "Rotura: lubricante no es componente solido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: lubricante no es instrumento",
            "FM-47": "Perdida de precarga: no aplica a fluido",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: lubricante no se erosiona (se contamina, que es FM-28)",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 23. PUMP_CASING
    # -----------------------------------------------------------------------
    "pump_casing": {
        "keywords": ["carcasa de bomba", "cuerpo de bomba", "voluta",
                      "casing", "housing de bomba", "pump casing"],
        "material": "hi-chrome iron 28%Cr / fundicion gris / acero inoxidable duplex",
        "functions": [
            {
                "function_es": "Contener fluido a presion y dirigir flujo alrededor del impulsor convirtiendo energia cinetica en presion",
                "functional_failures": [
                    {
                        "failure_es": "Fuga — carcasa no contiene fluido a presion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Silice erosiona cutwater y sidewalls del volute; pared se adelgaza hasta perforacion, fuga de slurry presurizado",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-62",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Velocidad de fluido excesiva",
                                "why": "Zona de cutwater recibe flujo a maxima velocidad; erosion localizada 5x mas rapida que resto del volute",
                                "pattern": "C",
                                "detection": "UT thickness at high-velocity points",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Solucion cianurada corroe acero al carbono internamente; pitting localizado en zona de baja velocidad (stagnation points)",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "Hi-chrome iron es inherentemente fragil; microgrietas de fundicion propagan con vibracion de servicio hasta fuga",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Rotura catastrofica — fractura de carcasa",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Pulsaciones de presion fatigan zona de conexion de succion; grieta propaga desde defecto de fundicion hasta fractura",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Congelamiento de contenido a -20°C genera expansion 9%; presion de hielo fractura carcasa de fundicion fragil",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: carcasa no es electrica",
            "FM-08": "Bio-organismos: proceso con cianuro inhibe crecimiento",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 24. TANK_VESSEL
    # -----------------------------------------------------------------------
    "tank_vessel": {
        "keywords": ["tanque", "estanque", "deposito", "cuba", "reactor",
                      "vessel", "recipiente a presion"],
        "material": "acero al carbono A516 / acero inoxidable 316L / HDPE / FRP",
        "functions": [
            {
                "function_es": "Almacenar o contener fluidos de proceso a presion y temperatura de diseno sin fugas ni falla estructural",
                "functional_failures": [
                    {
                        "failure_es": "Fuga — perdida de contencion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Cianuro y pH extremos atacan paredes internas de acero al carbono; perdida de espesor uniforme reduce presion admisible",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-11",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Hendidura/Resquicio",
                                "why": "Zona bajo baffles y supports internos genera celda de concentracion; corrosion acelerada oculta bajo componente interno",
                                "pattern": "B",
                                "detection": "UT thickness at flange faces and gasket lines",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Superficie exterior sin recubrimiento adecuado; derrames y condensacion generan corrosion exterior que converge con interna",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "UV extremo a 4500m degrada recubrimiento exterior; corrosion atmosferica inicia en soldaduras y bordes no protegidos",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-19",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Envejecimiento",
                                "why": "Tanques HDPE y FRP pierden ductilidad por UV; grietas superficiales propagan bajo presion interna",
                                "pattern": "B",
                                "detection": "Dye penetrant inspection (DPI)",
                                "pf_interval": "6-24 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Deformacion o colapso — tanque pierde integridad estructural",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impacto de vehiculo o caida de objeto deforma shell; pandeo local reduce resistencia a presion/vacio",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Vacio accidental (venteo insuficiente) o viento extremo genera presion negativa; shell colapsa por pandeo",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: tanque no es electrico",
            "FM-02": "Obstruccion: tanque es recipiente de almacenamiento, no conducto",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: tanque no es instrumento",
            "FM-42": "Vencimiento: metal/HDPE no caduca en sentido estricto",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: tanque no usa lubricacion",
        },
    },

    # -----------------------------------------------------------------------
    # 25. BRAKE_MECHANICAL
    # -----------------------------------------------------------------------
    "brake_mechanical": {
        "keywords": ["freno", "brake", "pastilla de freno", "disco de freno",
                      "freno de disco", "freno de tambor", "caliper"],
        "material": "acero / material de friccion (semi-metalico/ceramico)",
        "functions": [
            {
                "function_es": "Detener o retener movimiento de equipo rotativo aplicando fuerza de friccion controlada",
                "functional_failures": [
                    {
                        "failure_es": "No detiene equipo — freno no genera torque de frenado suficiente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Cada frenada remueve material de pastilla/zapata; al llegar a indicador de desgaste, fuerza de contacto insuficiente para detener equipo",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Material de friccion pierde coeficiente por degradacion termica acumulada; torque de frenado se reduce sin cambio de espesor visible",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-44",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Falta de lubricacion",
                                "why": "Mecanismo de caliper se traba por falta de lubricacion en guias; pastilla no contacta disco uniformemente, frenado parcial",
                                "pattern": "C",
                                "detection": "Vibration analysis (envelope/demodulation)",
                                "pf_interval": "2-8 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "No libera — freno permanece aplicado",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-43",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de mineral y humedad ingresan al mecanismo; corrosion y acumulacion de contaminantes impiden retraccion del caliper",
                                "pattern": "C",
                                "detection": "Valve partial stroke testing (PST)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-53",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Freno parcialmente aplicado genera calor por friccion continua; disco se recalienta, deforma (DTV) y genera vibracion/grabbing",
                                "pattern": "B",
                                "detection": "Seal face temperature monitoring",
                                "pf_interval": "Continuous",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: freno mecanico no es electrico",
            "FM-02": "Obstruccion: freno no conduce fluido",
            "FM-09": "Corrosion quimica: freno no expuesto a proceso quimico",
            "FM-17": "Conexiones electricas: no aplica a freno mecanico",
            "FM-37": "Deriva: freno no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 26. SPRING
    # -----------------------------------------------------------------------
    "spring": {
        "keywords": ["resorte", "spring", "muelle", "resorte de retorno",
                      "amortiguador", "amortiguacion", "sistema amortiguacion",
                      "cama de impacto", "cama impacto"],
        "material": "acero de resorte ASTM A228 / acero inoxidable 302",
        "functions": [
            {
                "function_es": "Almacenar y liberar energia mecanica elastica para generar fuerza de retorno o amortiguacion",
                "functional_failures": [
                    {
                        "failure_es": "No genera fuerza suficiente — resorte fatigado o roto",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Millones de ciclos de compresion/extension generan fatiga en superficie del alambre; grieta inicia en marca de herramienta y propaga hasta fractura",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-36",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Uso normal",
                                "why": "Creep del acero de resorte bajo carga sostenida reduce longitud libre; fuerza de retorno disminuye progresivamente (set del resorte)",
                                "pattern": "B",
                                "detection": "Dimensional survey against baseline",
                                "pf_interval": "6-24 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Resorte expuesto a salpicadura de proceso pierde seccion; ademas, pitting de corrosion actua como concentrador de fatiga",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: resorte no es electrico",
            "FM-02": "Obstruccion: resorte no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: resorte no en flujo abrasivo directo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 27. CHAIN_DRIVE
    # -----------------------------------------------------------------------
    "chain_drive": {
        "keywords": ["cadena", "eslabon", "chain", "cadena de transmision",
                      "sprocket"],
        "material": "acero aleado cementado / acero inoxidable",
        "functions": [
            {
                "function_es": "Transmitir potencia mecanica entre ejes paralelos mediante engrane positivo de eslabones y sprockets",
                "functional_failures": [
                    {
                        "failure_es": "Rotura de cadena — transmision interrumpida",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Cada eslabon experimenta ciclo de tension al pasar por sprocket; fatiga en placa lateral hasta fractura, cadena se abre",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Arranque con carga completa o atascamiento genera tension >3x nominal; eslabon mas debil fractura instantaneamente",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Elongacion excesiva — cadena pierde sincronismo con sprocket",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-71",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contacto metal con metal",
                                "why": "Pasador y buje en contacto articulado se desgastan; elongacion acumulada de 1-3% causa salto de dientes en sprocket",
                                "pattern": "B",
                                "detection": "Dimensional measurement of wear components",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-64",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Degradacion del lubricante",
                                "why": "Lubricante de cadena se contamina con polvo de silice; articulation seca acelera desgaste de pasadores y bujes 3-5x",
                                "pattern": "B",
                                "detection": "Oil analysis (oxidation, viscosity, TAN, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Movimiento articulado en cada sprocket genera desgaste en pasador/buje; elongacion progresiva medible con calibre go/no-go",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "Corrosion — cadena pierde seccion resistente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Cadena expuesta a salpicadura y ambiente corrosivo; corrosion en articulaciones inmoviliza eslabones y genera puntos de concentracion de fatiga",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: cadena no es electrica",
            "FM-02": "Obstruccion: cadena no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 28. WIRE_ROPE
    # -----------------------------------------------------------------------
    "wire_rope": {
        "keywords": ["cable de acero", "cable acerado", "wire rope",
                      "guaya", "estrobo", "sling"],
        "material": "acero de alta resistencia galvanizado / acero inoxidable",
        "functions": [
            {
                "function_es": "Transmitir fuerza de traccion para izar, arrastrar o suspender cargas de forma segura",
                "functional_failures": [
                    {
                        "failure_es": "Rotura — cable no soporta carga",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Flexion repetitiva sobre poleas fatiga alambres individuales; rotura progresiva de alambres externos hasta perdida de >10% de seccion",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-57",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga de choque (caida subita, enganche) excede resistencia de rotura del cable; fractura instantanea",
                                "pattern": "E",
                                "detection": "Wire rope inspection (visual + MRT)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Cable arrastrado sobre roca o borde metalico erosiona alambres exteriores; perdida de seccion reduce factor de seguridad",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion — cable pierde resistencia sin rotura visible",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Exposicion a humedad y quimicos de proceso corroe alambres internos (invisible externamente); perdida de seccion oculta",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Alambres dentro de los torones se mueven entre si bajo flexion; desgaste interno (valley breaks) no visible externamente",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: cable de acero no es electrico",
            "FM-02": "Obstruccion: cable no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: acero no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 29. WHEEL
    # -----------------------------------------------------------------------
    "wheel": {
        "keywords": ["rueda", "ruedas", "llanta", "polea", "polea motriz",
                      "polea tensora", "polea de cola"],
        "material": "acero fundido / acero con recubrimiento de caucho / poliuretano",
        "functions": [
            {
                "function_es": "Transmitir o guiar movimiento rotativo mediante contacto superficial con carga",
                "functional_failures": [
                    {
                        "failure_es": "Desgaste de superficie de contacto — perdida de traccion o perfil",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-72",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Movimiento relativo entre superficies en contacto",
                                "why": "Contacto rueda/riel o polea/correa genera desgaste continuo; perdida de diametro cambia relacion de transmision y traccion",
                                "pattern": "B",
                                "detection": "Vibration monitoring for progressive fit loosening",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-55",
                                "mechanism_es": "Corte/Desgarro/Perforacion",
                                "cause_es": "Abrasion",
                                "why": "Silice atrapada entre polea y correa abrasiona recubrimiento de caucho; lagging se despega y genera vibracion",
                                "pattern": "B",
                                "detection": "UT thickness measurement",
                                "pf_interval": "1-6 mo",
                            },
                            {
                                "fm_ref": "FM-67",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Ruedas de grua o puente reciben impactos de carga; superficie se martilla (Brinell damage) generando planos (flats)",
                                "pattern": "B",
                                "detection": "Liner thickness/profile measurement (template, UT)",
                                "pf_interval": "Monthly-quarterly",
                            },
                        ],
                    },
                    {
                        "failure_es": "Deformacion — rueda pierde geometria circular",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga superior a capacidad de la rueda genera deformacion plastica; ovalamiento genera vibracion ciclica",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Recubrimiento de poliuretano pierde elasticidad por UV y ciclaje termico; se endurece y agrieta, perdiendo adherencia al nucleo de acero",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: rueda/polea no es electrica",
            "FM-02": "Obstruccion: no conduce fluido",
            "FM-09": "Corrosion quimica: no expuesta a proceso",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 30. REDUCER_GEARBOX
    # -----------------------------------------------------------------------
    "reducer_gearbox": {
        "keywords": ["reductor", "caja reductora", "gearbox", "multiplicador",
                      "reductor de velocidad"],
        "material": "acero aleado cementado / fundicion de hierro / aluminio (carcasa)",
        "functions": [
            {
                "function_es": "Reducir velocidad y multiplicar torque entre motor y equipo impulsado con relacion definida y eficiencia >95%",
                "functional_failures": [
                    {
                        "failure_es": "No transmite potencia — falla interna de engranajes o rodamientos",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Fatiga por flexion en raiz de diente de pinon; grieta propaga hasta fractura, engranaje pierde transmision",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-06",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Tramp metal o trabamiento de equipo impulsado aplica torque instantaneo que excede resistencia de diente; fractura con dano cascada",
                                "pattern": "E",
                                "detection": "UT thickness at corroded/worn sections",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion del lubricante — proteccion insuficiente de componentes internos",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-27",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Reaccion quimica",
                                "why": "Aceite de reductor se oxida por temperatura; a altitud, enfriamiento 35% menos eficiente, aceite opera mas caliente y se degrada mas rapido",
                                "pattern": "B",
                                "detection": "Oil analysis (TAN, viscosity, oxidation, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-28",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Contaminacion",
                                "why": "Condensacion interna (ciclaje termico) introduce agua; agua emulsificada reduce capacidad de pelicula lubricante y corroe rodamientos",
                                "pattern": "C",
                                "detection": "Oil analysis (particle count, water, viscosity, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-64",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Degradacion del lubricante",
                                "why": "Aceite degradado pierde aditivos EP/AW; flancos de dientes operan en regimen de lubricacion limite, micro-pitting progresivo",
                                "pattern": "B",
                                "detection": "Oil analysis (oxidation, viscosity, TAN, wear metals)",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-69",
                                "mechanism_es": "Desgaste",
                                "cause_es": "Contaminacion del lubricante (particulas)",
                                "why": "Particulas de desgaste recirculan; abrasion en tres cuerpos acelera deterioro de dientes y rodamientos",
                                "pattern": "C",
                                "detection": "Oil particle count (ISO 4406)",
                                "pf_interval": "1-3 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento — temperatura de operacion excesiva",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-51",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Falta de lubricacion",
                                "why": "Perdida de nivel de aceite por fuga en sello; rodamientos y engranajes operan secos, calor de friccion destruye componentes en horas",
                                "pattern": "B",
                                "detection": "Bearing temperature monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                            {
                                "fm_ref": "FM-52",
                                "mechanism_es": "Sobrecalentamiento/Fusion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga continua superior a rating genera calor excesivo; cooler de aceite dimensionado para altitud insuficiente, temperatura escala",
                                "pattern": "E",
                                "detection": "Bearing temperature + load monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: reductor no es electrico",
            "FM-02": "Obstruccion: reductor no conduce fluido de proceso",
            "FM-09": "Corrosion quimica: componentes internos protegidos por aceite",
            "FM-13": "Corrosion atmosferica: interior sellado, exterior pintado",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: componentes metalicos no caducan",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 31. HEAT_EXCHANGER
    # -----------------------------------------------------------------------
    "heat_exchanger": {
        "keywords": ["intercambiador de calor", "heat exchanger", "enfriador",
                      "cooler", "radiador", "intercambiador"],
        "material": "acero al carbono / cobre-niquel / acero inoxidable 316L / titanio",
        "functions": [
            {
                "function_es": "Transferir calor entre dos fluidos sin mezclarlos, manteniendo temperaturas de proceso dentro de limites operacionales",
                "functional_failures": [
                    {
                        "failure_es": "Transferencia de calor insuficiente — temperatura de salida fuera de especificacion",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-02",
                                "mechanism_es": "Obstruccion/Bloqueo",
                                "cause_es": "Contaminacion",
                                "why": "Incrustaciones de escala y depositos de solidos reducen coeficiente de transferencia; approach temperature sube progresivamente",
                                "pattern": "C",
                                "detection": "Differential pressure measurement",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-63",
                                "mechanism_es": "Lavado/Erosion por fluido",
                                "cause_es": "Uso normal",
                                "why": "Depositos graduales de escala en tubos reducen area efectiva de transferencia; rendimiento decae hasta ser inaceptable",
                                "pattern": "B",
                                "detection": "Coating thickness measurement (DFT gauge)",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Fuga interna — fluidos se mezclan",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Delta de temperatura extremo (-20°C exterior a +60°C proceso) genera fatiga termica en tubos y tube-sheet; grietas permiten cruce de fluidos",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-24",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Esfuerzos termicos (calor/frio)",
                                "why": "Choque termico al arrancar con fluido caliente en intercambiador frio a -20°C; expansion diferencial fractura union tubo-placa",
                                "pattern": "B",
                                "detection": "DPI for thermal fatigue crack detection",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-09",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ataque quimico",
                                "why": "Cianuro y pH extremo corroen tubos de acero al carbono; perforacion permite contaminacion cruzada de fluidos",
                                "pattern": "B",
                                "detection": "UT thickness measurement at TMLs",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-11",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Hendidura/Resquicio",
                                "why": "Corrosion en resquicio entre tubo y tube-sheet; dano oculto hasta que fuga cruza fluidos",
                                "pattern": "B",
                                "detection": "UT thickness at flange faces and gasket lines",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Congelamiento — fluido de enfriamiento se congela en tubos",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-07",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Sobrecarga termica",
                                "why": "Agua de enfriamiento sin glicol se congela a -20°C; expansion de hielo fractura tubos y tube-sheet",
                                "pattern": "E",
                                "detection": "Thermal scan on kiln shell",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: intercambiador no es electrico",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: metal no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: intercambiador no maneja slurry normalmente (si lo hace, es caso especial)",
            "FM-58": "Cortocircuito: no es electrico",
            "FM-64": "Degradacion lubricante: intercambiador no usa lubricacion",
        },
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # P3 AUXILIARY — fewer FMs expected
    # ═══════════════════════════════════════════════════════════════════════════

    # -----------------------------------------------------------------------
    # 32. ENCLOSURE_CABINET
    # -----------------------------------------------------------------------
    "enclosure_cabinet": {
        "keywords": ["gabinete", "tablero", "panel", "cofre", "enclosure",
                      "mcc", "cabinet", "sala electrica",
                      "caja sistema monitoreo", "caja control", "caja conexion"],
        "material": "acero con pintura epoxi / acero inoxidable 304 / NEMA 4X",
        "functions": [
            {
                "function_es": "Proteger componentes electricos y de control contra ambiente, polvo, agua y contacto accidental",
                "functional_failures": [
                    {
                        "failure_es": "Ingreso de contaminantes — gabinete no protege contenido",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Empaquetadura de puerta pierde elasticidad por UV y ciclaje termico; gap permite ingreso de polvo de silice conductivo",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Golpe accidental deforma puerta de gabinete; sello no asienta, grado IP comprometido",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "Corrosion de gabinete — perdida de integridad estructural",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Salpicadura de proceso y condensacion corroen gabinete de acero pintado; perforacion permite ingreso de agua a componentes electricos",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "UV degrada pintura en 2-3 anos; humedad ataca acero base, especialmente en bordes y puntos de fijacion",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: gabinete es contenedor, no componente electrico activo",
            "FM-02": "Obstruccion: gabinete no conduce fluido",
            "FM-05": "Rotura por fatiga: gabinete no sujeto a carga ciclica significativa",
            "FM-17": "Conexiones electricas: aplica a componentes dentro, no al gabinete",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: gabinete no es circuito electrico",
            "FM-55": "Abrasion: gabinete no en flujo abrasivo",
            "FM-58": "Cortocircuito: gabinete no es circuito",
        },
    },

    # -----------------------------------------------------------------------
    # 33. DOOR_ACCESS
    # -----------------------------------------------------------------------
    "door_access": {
        "keywords": ["puerta", "porton", "portón", "puerta de acceso",
                      "escotilla", "tapa de inspeccion", "door"],
        "material": "acero galvanizado / acero pintado / aluminio",
        "functions": [
            {
                "function_es": "Permitir acceso controlado a areas o equipos, manteniendo cerramiento y seguridad cuando esta cerrada",
                "functional_failures": [
                    {
                        "failure_es": "No cierra/sella — puerta no cumple funcion de cerramiento",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Viento fuerte o impacto accidental deforma hoja de puerta; marco no alinea con cerradura, puerta no cierra",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Pernos de bisagra se aflojan por vibracion del edificio; puerta descuelga y no alinea con marco",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Bisagras y cerradura expuestas a salpicadura se corroen; mecanismo se traba o marco pierde integridad",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: puerta no es electrica",
            "FM-02": "Obstruccion: puerta no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: puerta no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 34. GRATING_PLATFORM
    # -----------------------------------------------------------------------
    "grating_platform": {
        "keywords": ["grating", "rejilla", "plataforma", "piso metalico",
                      "pasarela", "walkway"],
        "material": "acero galvanizado / acero pintado / FRP",
        "functions": [
            {
                "function_es": "Proveer superficie de transito segura para personal con capacidad de carga y drenaje adecuados",
                "functional_failures": [
                    {
                        "failure_es": "Perdida de capacidad portante — riesgo de colapso",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Galvanizado se degrada por UV y condensacion; barra portante de grating pierde seccion, capacidad de carga se reduce sin indicacion visual obvia",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Derrames de proceso y salpicadura corroen grating; especialmente critico en areas de proceso quimico",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Equipo pesado colocado sobre grating disenado para transito peatonal; deflexion permanente genera riesgo de tropiezo",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: grating no es electrico",
            "FM-02": "Obstruccion: grating no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: grating no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 35. RAILING_HANDRAIL
    # -----------------------------------------------------------------------
    "railing_handrail": {
        "keywords": ["baranda", "pasamano", "guardera", "railing", "handrail",
                      "barandilla", "proteccion de caida"],
        "material": "acero galvanizado / acero pintado / acero inoxidable",
        "functions": [
            {
                "function_es": "Proteger personal contra caidas desde altura cumpliendo norma de seguridad (OSHA 1910.29 / EN 14122)",
                "functional_failures": [
                    {
                        "failure_es": "No resiste carga de impacto — baranda cede ante persona",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Corrosion en base de parante reduce seccion resistente; baranda aparenta solidez pero cede ante carga lateral de persona",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "UV degrada pintura, condensacion inicia corrosion; parantes en zona de salpicadura pierden >50% de seccion en 3-5 anos sin mantenimiento",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impacto de vehiculo o equipo deforma baranda; una vez deformada pierde capacidad de absorber siguiente impacto",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Vibracion del equipo o edificio afloja pernos de fijacion; baranda se suelta de soporte, creando espacio de caida",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: baranda no es electrica",
            "FM-02": "Obstruccion: baranda no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: baranda no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 36. LIGHTING
    # -----------------------------------------------------------------------
    "lighting": {
        "keywords": ["luminaria", "lampara", "lámpara", "luz", "luces",
                      "led", "proyector", "piloto", "baliza", "beacon"],
        "material": "aluminio / policarbonato / LED / vidrio",
        "functions": [
            {
                "function_es": "Proveer iluminacion adecuada para operacion segura y cumplimiento de normas de iluminacion industrial",
                "functional_failures": [
                    {
                        "failure_es": "No ilumina — luminaria apagada",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-48",
                                "mechanism_es": "Circuito abierto",
                                "cause_es": "Sobrecarga electrica",
                                "why": "Descarga atmosferica o transitorio de red quema driver LED; circuito abierto, luminaria apagada",
                                "pattern": "E",
                                "detection": "Thermography of electrical connections",
                                "pf_interval": "1-3 mo",
                            },
                            {
                                "fm_ref": "FM-42",
                                "mechanism_es": "Vencimiento/Caducidad",
                                "cause_es": "Envejecimiento",
                                "why": "LED tiene vida util de 50000h; despues de ese periodo, flujo luminoso cae por debajo de 70% (L70) y no cumple norma",
                                "pattern": "B",
                                "detection": "Battery capacity testing (discharge test)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-17",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Conexiones electricas deficientes",
                                "why": "Condensacion en caja de conexiones corroe terminales; resistencia de contacto sube hasta que no fluye corriente suficiente",
                                "pattern": "C",
                                "detection": "IR thermographic survey",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Degradacion optica — ilumina pero insuficiente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Lente de policarbonato se opaca por UV extremo a 4500m; transmitancia baja 30-50% en 2-3 anos, iluminacion inadecuada",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-32",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Radiacion",
                                "why": "UV a altitud rompe cadenas de policarbonato; amarillamiento y chalking de lente hasta opacidad",
                                "pattern": "B",
                                "detection": "Visual inspection for chalking, cracking, discoloration",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: luminaria no conduce fluido",
            "FM-05": "Rotura por fatiga: luminaria no sujeta a carga ciclica",
            "FM-09": "Corrosion quimica: luminaria no expuesta a proceso",
            "FM-37": "Deriva: luminaria no es instrumento de medicion",
            "FM-47": "Perdida de precarga: fijacion de luminaria no critica estructuralmente",
            "FM-55": "Abrasion: luminaria no en flujo abrasivo",
        },
    },

    # -----------------------------------------------------------------------
    # 37. LABEL_TAG
    # -----------------------------------------------------------------------
    "label_tag": {
        "keywords": ["etiqueta", "placa de identificacion", "placa de identificación",
                      "nameplate", "tag", "label", "rotulacion", "diagrama de conexiones"],
        "material": "acero inoxidable 316 / aluminio anodizado / plastico UV-estabilizado",
        "functions": [
            {
                "function_es": "Proveer identificacion permanente y legible del equipo para operacion y mantenimiento seguros",
                "functional_failures": [
                    {
                        "failure_es": "Ilegible — informacion no se puede leer",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "UV extremo a 4500m degrada tintas y plasticos; texto se desvanece en 1-2 anos en etiquetas no resistentes a UV",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Placa metalica grabada se corroe si no es inoxidable; grabado desaparece bajo capa de oxido",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-32",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Radiacion",
                                "why": "UV rompe pigmentos y polimeros de etiqueta adhesiva; desintegracion fisica del soporte, etiqueta se desprende",
                                "pattern": "B",
                                "detection": "Visual inspection for chalking, cracking, discoloration",
                                "pf_interval": "3-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: etiqueta no es electrica",
            "FM-02": "Obstruccion: etiqueta no conduce fluido",
            "FM-05": "Rotura por fatiga: etiqueta no sujeta a carga ciclica",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-47": "Perdida de precarga: fijacion de etiqueta no critica",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: etiqueta no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 38. LOCK_LATCH
    # -----------------------------------------------------------------------
    "lock_latch": {
        "keywords": ["candado", "cerradura", "latch", "albaba", "loto",
                      "bloqueo", "tagout", "lock"],
        "material": "acero / laton / nylon de ingenieria",
        "functions": [
            {
                "function_es": "Asegurar aislamiento de energia o acceso restringido para proteccion de personal durante mantenimiento",
                "functional_failures": [
                    {
                        "failure_es": "No asegura — candado/cerradura no cierra o no retiene",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Mecanismo interno de cerradura se corroe por condensacion y salpicadura; cilindro no gira, candado inutilizable",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-43",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de silice ingresa a mecanismo; al congelarse humedad dentro del cilindro, candado no se puede abrir ni cerrar",
                                "pattern": "C",
                                "detection": "Valve partial stroke testing (PST)",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Cuerpo de nylon de candado LOTO pierde resistencia por UV; se vuelve fragil y rompe con fuerza manual, anulando proposito de seguridad",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: candado no es electrico activo",
            "FM-02": "Obstruccion: candado no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: candado no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # -----------------------------------------------------------------------
    # 39. BREAKER_SWITCHGEAR
    # -----------------------------------------------------------------------
    "breaker_switchgear": {
        "keywords": ["breaker", "interruptor", "disyuntor", "contactor",
                      "partidor", "arrancador", "switchgear", "seccionador"],
        "material": "plastico termoestable / cobre / contactos plata-niquel",
        "functions": [
            {
                "function_es": "Proteger circuitos electricos interrumpiendo corriente ante sobrecarga o cortocircuito, y permitir maniobra segura",
                "functional_failures": [
                    {
                        "failure_es": "No interrumpe falla — breaker no dispara ante sobrecorriente",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Mecanismo de disparo pierde calibracion con el tiempo; resorte pierde fuerza, breaker no actua dentro de curva de proteccion",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-29",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Arco electrico",
                                "why": "Cada operacion bajo carga genera arco en contactos; material de contacto se erosiona, capacidad de interrupcion se reduce",
                                "pattern": "C",
                                "detection": "Contact resistance measurement (micro-ohm)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-43",
                                "mechanism_es": "Inmovilizacion (atasque/traba)",
                                "cause_es": "Contaminacion",
                                "why": "Polvo de silice + condensacion dentro del mecanismo; contacto movil se traba en posicion cerrada, no abre ante falla",
                                "pattern": "C",
                                "detection": "Valve partial stroke testing (PST)",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                    {
                        "failure_es": "Disparo espurio — breaker abre sin condicion de falla",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-01",
                                "mechanism_es": "Arco electrico",
                                "cause_es": "Falla de aislamiento",
                                "why": "A 4500m rigidez dielectrica del aire reducida 35%; arco entre fases a tension nominal en switchgear no rated para altitud",
                                "pattern": "B",
                                "detection": "Insulation resistance testing (megger)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-59",
                                "mechanism_es": "Cortocircuito",
                                "cause_es": "Contaminacion",
                                "why": "Polvo conductivo + humedad en camara de arco; tracking superficial dispara proteccion diferencial",
                                "pattern": "C",
                                "detection": "Surface insulation resistance measurement",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Sobrecalentamiento — conexiones o contactos se calientan",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-17",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Conexiones electricas deficientes",
                                "why": "Terminales de potencia se corroen por condensacion; resistencia de contacto sube, calentamiento por I²R, riesgo de incendio en panel",
                                "pattern": "C",
                                "detection": "IR thermographic survey",
                                "pf_interval": "3-12 mo",
                            },
                            {
                                "fm_ref": "FM-61",
                                "mechanism_es": "Sobrecarga termica (quemadura/sobrecalentamiento/fusion)",
                                "cause_es": "Sobrecorriente",
                                "why": "Carga sostenida al limite de capacidad del breaker; calor disipado en contactos acelera degradacion, breaker opera a temperatura excesiva",
                                "pattern": "E",
                                "detection": "Phase current and voltage balance monitoring",
                                "pf_interval": "Continuous-weekly",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-02": "Obstruccion: breaker no conduce fluido",
            "FM-05": "Rotura por fatiga: breaker no sujeto a carga mecanica ciclica significativa",
            "FM-09": "Corrosion quimica: breaker en panel protegido",
            "FM-37": "Deriva: breaker no es instrumento (reles de proteccion son clase protective_device)",
            "FM-55": "Abrasion: breaker no en flujo abrasivo",
            "FM-64": "Degradacion lubricante: breaker no usa lubricacion relevante",
        },
    },

    # -----------------------------------------------------------------------
    # 40. CONDUIT_RACEWAY
    # -----------------------------------------------------------------------
    "conduit_raceway": {
        "keywords": ["conduit", "canalizacion", "canalización", "bandeja",
                      "raceway", "tubo conduit", "abrazadera conduit"],
        "material": "acero galvanizado / PVC / aluminio / FRP",
        "functions": [
            {
                "function_es": "Proteger cables electricos contra dano mecanico, ambiente y proporcionar soporte estructural al cableado",
                "functional_failures": [
                    {
                        "failure_es": "No protege cables — conduit deteriorado",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Galvanizado se consume por UV y condensacion; acero base se corroe hasta perforacion, cables quedan expuestos a dano mecanico y humedad",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Salpicadura de proceso corroe conduit metalico; en area de proceso quimico, vida util reducida 50%",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "PVC y FRP se degradan por UV extremo a 4500m; fragilizacion y agrietamiento exponen cables",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Impacto de vehiculo o equipo aplasta conduit; cables internos se danan por compresion",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: conduit no es conductor activo",
            "FM-02": "Obstruccion: conduit no conduce fluido",
            "FM-17": "Conexiones electricas: conduit no tiene conexiones electricas activas",
            "FM-37": "Deriva: no es instrumento",
            "FM-48": "Circuito abierto: conduit no es circuito",
            "FM-55": "Abrasion: conduit no en flujo abrasivo",
            "FM-58": "Cortocircuito: conduit no es circuito",
        },
    },

    # -----------------------------------------------------------------------
    # 41. SUPPORT_BRACKET
    # -----------------------------------------------------------------------
    "support_bracket": {
        "keywords": ["soporte", "soportes", "base", "pedestal", "bancada",
                      "apoyo", "mensula", "cartela", "bracket", "support"],
        "material": "acero estructural / fundicion / acero inoxidable",
        "functions": [
            {
                "function_es": "Proveer apoyo estructural y fijacion a equipos, tuberias o cables absorbiendo cargas estaticas y dinamicas",
                "functional_failures": [
                    {
                        "failure_es": "Perdida de capacidad de soporte — fijacion falla",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-05",
                                "mechanism_es": "Rotura/Fractura/Separacion",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Vibracion de equipo soportado fatiga soldadura de mensula; grieta en pie de soldadura hasta fractura de soporte",
                                "pattern": "B",
                                "detection": "MPI at known hot spots",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Soporte en zona de salpicadura pierde seccion; capacidad residual cae por debajo de carga de servicio",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Soporte exterior sin mantenimiento de pintura; corrosion especialmente severa en anclajes embebidos en concreto",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Pernos de anclaje se aflojan por vibracion; equipo soportado se desplaza, generando desalineacion y carga excentrica",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                    {
                        "failure_es": "Deformacion — soporte se deflecta fuera de tolerancia",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Golpe accidental durante maniobra de mantenimiento deforma soporte; equipo montado queda desalineado",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-34",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Sobrecarga mecanica",
                                "why": "Carga superior al diseno (ej. tuberia llena de agua vs vacia) deflecta soporte permanentemente",
                                "pattern": "E",
                                "detection": "Structural survey (deflection, plumb, level)",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-20",
                                "mechanism_es": "Agrietamiento",
                                "cause_es": "Carga ciclica (termica/mecanica)",
                                "why": "Expansion termica de tuberia transmite carga ciclica a soporte; grieta en soldadura de conexion a estructura",
                                "pattern": "B",
                                "detection": "MPI at welds",
                                "pf_interval": "6-12 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {
            "FM-01": "Arco electrico: soporte no es electrico",
            "FM-02": "Obstruccion: soporte no conduce fluido",
            "FM-17": "Conexiones electricas: no aplica",
            "FM-25": "Degradacion por envejecimiento: acero no degrada por edad",
            "FM-37": "Deriva: no es instrumento",
            "FM-42": "Vencimiento: acero no caduca",
            "FM-48": "Circuito abierto: no es electrico",
            "FM-55": "Abrasion: soporte no en flujo abrasivo",
            "FM-58": "Cortocircuito: no es electrico",
        },
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # DEFAULT — catch-all for unclassified MIs
    # ═══════════════════════════════════════════════════════════════════════════
    "default": {
        "keywords": [],
        "material": "varios",
        "functions": [
            {
                "function_es": "Cumplir funcion operativa general dentro del sistema de mantenimiento de planta",
                "functional_failures": [
                    {
                        "failure_es": "Perdida de funcion general",
                        "failure_modes": [
                            {
                                "fm_ref": "FM-10",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Ambiente corrosivo",
                                "why": "Componente generico expuesto a ambiente agresivo de Salares Norte (UV, condensacion, salpicadura quimica)",
                                "pattern": "B",
                                "detection": "Visual coating condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-13",
                                "mechanism_es": "Corrosion",
                                "cause_es": "Exposicion a la atmosfera",
                                "why": "Componente exterior sujeto a UV extremo y condensacion a 4500m",
                                "pattern": "B",
                                "detection": "Visual coating and corrosion condition assessment",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-25",
                                "mechanism_es": "Degradacion",
                                "cause_es": "Envejecimiento",
                                "why": "Materiales organicos (plastico, caucho, adhesivos) degradan por UV y ciclaje termico a altitud",
                                "pattern": "B",
                                "detection": "Hardness testing of elastomeric components",
                                "pf_interval": "6-12 mo",
                            },
                            {
                                "fm_ref": "FM-33",
                                "mechanism_es": "Deformacion",
                                "cause_es": "Carga de impacto/choque",
                                "why": "Dano mecanico por maniobra de mantenimiento o impacto accidental",
                                "pattern": "E",
                                "detection": "Visual inspection for dents, bends, deformation",
                                "pf_interval": "1-4 wk",
                            },
                            {
                                "fm_ref": "FM-47",
                                "mechanism_es": "Perdida de precarga",
                                "cause_es": "Vibracion",
                                "why": "Fijaciones mecanicas se aflojan por vibracion de equipos adyacentes",
                                "pattern": "B",
                                "detection": "Torque audit (calibrated wrench)",
                                "pf_interval": "3-6 mo",
                            },
                        ],
                    },
                ],
            },
        ],
        "excluded_fms": {},
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Build a global keyword→class index sorted by keyword length (longest first).
# This guarantees "sello mecanico" matches seal_mechanical before "sello"
# matches seal_elastomeric, regardless of class iteration order.
_KEYWORD_INDEX: list[tuple[str, str, dict]] = []  # (keyword, class_name, class_dict)
for _name, _cls in MI_CLASS_RULES.items():
    if _name == "default":
        continue
    for _kw in _cls.get("keywords", []):
        _KEYWORD_INDEX.append((_kw, _name, _cls))
_KEYWORD_INDEX.sort(key=lambda x: len(x[0]), reverse=True)


def classify_mi(mi_name: str) -> tuple[str, dict]:
    """
    Classify a Maintainable Item name into one of the ~40 MI classes.

    Uses longest-keyword-first matching across ALL classes to avoid ambiguity
    (e.g., "sello mecanico" matches seal_mechanical before "sello" matches
    seal_elastomeric).

    Parameters
    ----------
    mi_name : str
        Spanish MI name as it appears in SAP (e.g., "RODAMIENTO DE BOLAS 6310")

    Returns
    -------
    tuple[str, dict]
        (class_name, class_dict) — the matched class and its full definition.
        Returns ("default", ...) if no specific class matches.
    """
    mi_lower = mi_name.strip().lower()
    for kw, cls_name, cls_dict in _KEYWORD_INDEX:
        if kw in mi_lower:
            return cls_name, cls_dict
    return "default", MI_CLASS_RULES["default"]


def get_failure_modes_for_mi(mi_name: str) -> list[dict]:
    """
    Return a flat list of all applicable failure modes for a given MI name.

    Each entry is a dict with keys: fm_ref, mechanism_es, cause_es, why,
    pattern, detection, pf_interval, function_es, failure_es.

    Parameters
    ----------
    mi_name : str
        Spanish MI name.

    Returns
    -------
    list[dict]
        Flat list of failure mode dicts with full RCM chain context.
    """
    cls_name, cls_dict = classify_mi(mi_name)
    results = []
    for func in cls_dict.get("functions", []):
        for ff in func.get("functional_failures", []):
            for fm in ff.get("failure_modes", []):
                entry = dict(fm)  # shallow copy
                entry["function_es"] = func["function_es"]
                entry["failure_es"] = ff["failure_es"]
                entry["mi_class"] = cls_name
                results.append(entry)
    return results


def get_excluded_fms_for_mi(mi_name: str) -> dict[str, str]:
    """
    Return the excluded failure modes with justification for a given MI name.

    Parameters
    ----------
    mi_name : str
        Spanish MI name.

    Returns
    -------
    dict[str, str]
        Mapping of FM code to exclusion reason.
    """
    _, cls_dict = classify_mi(mi_name)
    return cls_dict.get("excluded_fms", {})


def get_all_class_names() -> list[str]:
    """Return sorted list of all MI class names (excluding 'default')."""
    return sorted(name for name in MI_CLASS_RULES if name != "default")


def get_class_summary() -> dict[str, dict]:
    """
    Return a summary of each class: name, material, #functions,
    #total_failure_modes, #excluded_fms.
    """
    summary = {}
    for name, cls in MI_CLASS_RULES.items():
        if name == "default":
            continue
        total_fms = 0
        for func in cls.get("functions", []):
            for ff in func.get("functional_failures", []):
                total_fms += len(ff.get("failure_modes", []))
        summary[name] = {
            "material": cls.get("material", ""),
            "num_keywords": len(cls.get("keywords", [])),
            "num_functions": len(cls.get("functions", [])),
            "num_failure_modes": total_fms,
            "num_excluded_fms": len(cls.get("excluded_fms", {})),
        }
    return summary
