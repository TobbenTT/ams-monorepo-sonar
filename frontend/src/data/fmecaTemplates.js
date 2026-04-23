/**
 * Plantillas RCM por tipo de equipo.
 * Jorge 2026-04-23: pivot reliability necesita templates pre-armados
 * para que el analista no parta de cero en cada FMECA.
 *
 * Cada template es un array de rows que se inyectan al worksheet al
 * hacer "Usar plantilla" al crear. El analista después las edita.
 *
 * RPN = Severity × Occurrence × Detection. Escala 1-10 cada uno.
 * Valores base son CONSERVADORES (tirando a alto) para que el analista
 * tenga que justificar bajarlos, no subirlos.
 */

export const TEMPLATE_KEYS = [
  { key: 'BOMBA_CENTRIFUGA', label: 'Bomba Centrífuga', desc: 'Rodamientos, sellos, impulsor, cavitación, alineación' },
  { key: 'MOTOR_ELECTRICO',  label: 'Motor Eléctrico',  desc: 'Aislación, rodamientos, térmico, acople, vibración' },
  { key: 'TRANSFORMADOR',    label: 'Transformador',    desc: 'Aceite, bujes, refrigeración, protecciones, carga' },
  { key: 'COMPRESOR',        label: 'Compresor',        desc: 'Válvulas, pistones, aceite, cilindros, refrigeración' },
  { key: 'CORREA_TRANSPORT', label: 'Correa Transport.',desc: 'Empalme, polines, desalineación, lona, chancadores' },
  { key: 'INTERCAMBIADOR',   label: 'Intercambiador',   desc: 'Fouling, corrosión tubos, fuga, caída de presión' },
];

const T = {
  BOMBA_CENTRIFUGA: [
    { function_description: 'Impulsar fluido a caudal Q y presión P nominal', functional_failure: 'Caudal inferior al nominal', failure_mode: 'Desgaste de impulsor', failure_effect: 'Reducción de caudal 10-30%, aumento de HP', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 6, occurrence: 5, detection: 4, recommended_action: 'Inspección termográfica + medición de vibración mensual; overhaul cada 24 meses.' },
    { function_description: 'Impulsar fluido sin fugas al exterior', functional_failure: 'Fuga por sello mecánico', failure_mode: 'Desgaste / daño de sello mecánico', failure_effect: 'Goteo, contaminación, pérdida de producto', failure_consequence: 'EVIDENT_ENVIRONMENTAL', severity: 7, occurrence: 6, detection: 3, recommended_action: 'Cambio preventivo de sellos cada 18 meses; monitoreo de caída visible.' },
    { function_description: 'Rotar sobre rodamientos sin vibración excesiva', functional_failure: 'Vibración fuera de norma ISO 10816', failure_mode: 'Fallo de rodamiento', failure_effect: 'Ruido, calentamiento, parada súbita posible', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 8, occurrence: 4, detection: 3, recommended_action: 'Análisis de vibración mensual (envelope + FFT); lubricación según curva.' },
    { function_description: 'Mantener alineación con motor accionador', functional_failure: 'Desalineación angular/paralela', failure_mode: 'Asentamiento de base / desgaste acople', failure_effect: 'Vibración, carga axial en rodamientos, desgaste acople', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 6, occurrence: 5, detection: 5, recommended_action: 'Alineación láser post-overhaul y cada 12 meses; inspección del acople.' },
    { function_description: 'Operar sin cavitación (NPSHd > NPSHr)', functional_failure: 'Cavitación', failure_mode: 'NPSH disponible insuficiente / obstrucción succión', failure_effect: 'Ruido metálico, erosión de impulsor, pérdida caudal', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 3, detection: 4, recommended_action: 'Verificar NPSH de diseño; inspección de succión y filtros; ajuste operacional.' },
  ],
  MOTOR_ELECTRICO: [
    { function_description: 'Convertir energía eléctrica en mecánica a P nom.', functional_failure: 'No arranca / no desarrolla torque', failure_mode: 'Falla de aislación en bobinado', failure_effect: 'Disparo térmico, quemado de fase, parada planta', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 9, occurrence: 3, detection: 3, recommended_action: 'Megado anual; índice de polarización; termografía trimestral.' },
    { function_description: 'Girar sin vibración excesiva', functional_failure: 'Vibración > ISO 10816-3', failure_mode: 'Fallo de rodamientos (lubricación / desgaste)', failure_effect: 'Ruido, calor, parada no programada', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 5, detection: 3, recommended_action: 'Monitoreo vibratorio mensual; relubricación según fabricante.' },
    { function_description: 'Disipar calor bajo carga continua', functional_failure: 'Sobretemperatura en carcasa', failure_mode: 'Obstrucción de ventilador / ambiente caliente / sobrecarga', failure_effect: 'Degradación de aislación, reducción de vida útil', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 6, occurrence: 4, detection: 4, recommended_action: 'Termografía trimestral; limpieza de aletas; verificar corriente.' },
    { function_description: 'Transmitir potencia al acople de carga', functional_failure: 'Desalineación / desgaste acople', failure_mode: 'Desgaste elemento elástico / desalineación', failure_effect: 'Vibración adicional, carga en rodamientos', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 5, occurrence: 5, detection: 4, recommended_action: 'Alineación láser anual; inspección acople semestral.' },
    { function_description: 'Proteger contra sobrecarga eléctrica', functional_failure: 'Protección térmica no actúa', failure_mode: 'Fallo de relé térmico / mala calibración', failure_effect: 'Daño irreversible en bobinado ante sobrecarga', failure_consequence: 'HIDDEN_SAFETY', severity: 8, occurrence: 3, detection: 8, recommended_action: 'Test de relé térmico anual; calibración de IR/IN; reemplazo 5 años.' },
  ],
  TRANSFORMADOR: [
    { function_description: 'Transformar tensión primaria a secundaria', functional_failure: 'Fallo interno / disparo protecciones', failure_mode: 'Degradación aislación papel/aceite', failure_effect: 'Pérdida total, impacto ambiental, indisponibilidad larga', failure_consequence: 'EVIDENT_SAFETY', severity: 10, occurrence: 2, detection: 4, recommended_action: 'DGA cronograma anual; ensayo físico-químico aceite; rigidez dieléctrica.' },
    { function_description: 'Disipar calor bajo carga nominal', functional_failure: 'Sobretemperatura persistente', failure_mode: 'Obstrucción radiadores / falla ventiladores', failure_effect: 'Envejecimiento acelerado aislación, disparo térmico', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 4, detection: 4, recommended_action: 'Termografía semestral; test de ventiladores y bombas aceite; limpieza radiadores.' },
    { function_description: 'Contener aceite dieléctrico sin fugas', functional_failure: 'Fuga de aceite', failure_mode: 'Deterioro empaquetaduras / soldaduras', failure_effect: 'Pérdida aceite, exposición ambiental, riesgo arco', failure_consequence: 'EVIDENT_ENVIRONMENTAL', severity: 8, occurrence: 3, detection: 3, recommended_action: 'Inspección visual mensual; reapriete empaquetaduras; cambio empaques 10 años.' },
    { function_description: 'Operar con protecciones activas (Buchholz, RIS)', functional_failure: 'Protección no actúa ante falla', failure_mode: 'Relé dañado / cableado corrompido', failure_effect: 'Daño catastrófico sin aislamiento', failure_consequence: 'HIDDEN_SAFETY', severity: 10, occurrence: 2, detection: 9, recommended_action: 'Test funcional anual Buchholz, RIS; verificación cableado secundario.' },
  ],
  COMPRESOR: [
    { function_description: 'Entregar caudal de aire/gas a presión nominal', functional_failure: 'Caudal o presión insuficiente', failure_mode: 'Desgaste anillos/válvulas', failure_effect: 'Pérdida capacidad planta, aumento consumo', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 5, detection: 4, recommended_action: 'Inspección válvulas cada 8000h; análisis aceite trimestral.' },
    { function_description: 'Operar sin contaminación de aceite', functional_failure: 'Alto contenido de metales en aceite', failure_mode: 'Desgaste cojinetes / pistones', failure_effect: 'Pérdida compresión, seizure, parada no programada', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 8, occurrence: 4, detection: 3, recommended_action: 'Análisis de aceite cada 2000h; cambio según SOAP.' },
    { function_description: 'Disipar calor en enfriador', functional_failure: 'Sobretemperatura descarga', failure_mode: 'Fouling en intercambiador / falla ventilador', failure_effect: 'Degradación aceite, disparo por alta temp', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 6, occurrence: 5, detection: 3, recommended_action: 'Limpieza intercambiadores semestral; termografía trimestral.' },
    { function_description: 'Operar con vibración dentro de norma', functional_failure: 'Vibración excesiva', failure_mode: 'Desbalanceo rotor / falla rodamiento', failure_effect: 'Ruido, daño progresivo, parada', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 4, detection: 3, recommended_action: 'Monitoreo vibratorio mensual; balanceo post-overhaul.' },
  ],
  CORREA_TRANSPORT: [
    { function_description: 'Transportar material a capacidad nominal', functional_failure: 'Pérdida de capacidad / derrame', failure_mode: 'Desalineación / desgaste lona', failure_effect: 'Reducción tonelaje, contaminación área', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 6, detection: 3, recommended_action: 'Inspección visual diaria; alineación cada 90 días; cambio lona según desgaste.' },
    { function_description: 'Operar sin fallas en empalme', functional_failure: 'Ruptura de empalme', failure_mode: 'Envejecimiento empalme vulcanizado', failure_effect: 'Parada prolongada, reempalme urgente', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 9, occurrence: 3, detection: 4, recommended_action: 'Inspección NDT empalmes cada 12 meses; reempalme planificado 5-7 años.' },
    { function_description: 'Operar sin atasco en chancador/transferencia', functional_failure: 'Atasco / bloqueo', failure_mode: 'Material sobre-dimensionado / humedad', failure_effect: 'Parada, daño estructural, riesgo operador', failure_consequence: 'EVIDENT_SAFETY', severity: 8, occurrence: 4, detection: 5, recommended_action: 'Sensores de nivel; control granulometría aguas arriba.' },
    { function_description: 'Polines giran sin fricción', functional_failure: 'Polín trabado', failure_mode: 'Fallo de rodamiento polín / acumulación material', failure_effect: 'Desgaste acelerado lona, riesgo incendio', failure_consequence: 'EVIDENT_SAFETY', severity: 7, occurrence: 7, detection: 4, recommended_action: 'Inspección termográfica mensual; cambio polines por lote preventivo.' },
  ],
  INTERCAMBIADOR: [
    { function_description: 'Transferir calor entre fluidos a ΔT de diseño', functional_failure: 'Reducción de transferencia', failure_mode: 'Fouling en tubos / placas', failure_effect: 'Aumento ΔP, menor eficiencia, mayor consumo', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 6, occurrence: 6, detection: 4, recommended_action: 'Limpieza química o mecánica cada 12-18 meses; monitoreo ΔP continuo.' },
    { function_description: 'Contener fluidos sin mezcla entre lados', functional_failure: 'Fuga interna entre pasos', failure_mode: 'Corrosión / perforación tubos', failure_effect: 'Contaminación cruzada, pérdida producto', failure_consequence: 'EVIDENT_ENVIRONMENTAL', severity: 8, occurrence: 3, detection: 5, recommended_action: 'Prueba hidrostática cada 24 meses; inspección boroscópica.' },
    { function_description: 'Operar sin vibración inducida', functional_failure: 'Vibración por flujo', failure_mode: 'Caudal fuera de diseño / deflector dañado', failure_effect: 'Fatiga tubos, fuga por rotura', failure_consequence: 'EVIDENT_OPERATIONAL', severity: 7, occurrence: 3, detection: 5, recommended_action: 'Verificar caudales operacionales; inspección deflectores en overhaul.' },
  ],
};

export function getTemplate(key) {
  return (T[key] || []).map(r => ({ ...r }));
}
