// 0D1 (reunión VSC 2026-05-11): util compartido para mostrar nombre legible
// de planta en lugar del plant_id técnico (que puede contener nombre del
// cliente real, ej. "GOLDFIELDS-SN"). El plant_id queda como identificador
// interno; la UI muestra el name del catálogo de plantas + fallback genérico.
//
// El mapping de PLANT_DISPLAY_NAMES debe coincidir con el name persistido en
// la tabla plants. Si una planta nueva no está acá, cae al fallback "Planta
// (id)".

export const PLANT_DISPLAY_NAMES = {
  'GOLDFIELDS-SN': 'Planta Minera Cliente',
  'OCP-JFC1': 'Jorf Fertilizers Complex 1',
  'FLUOR-ALFA': 'Fluor Alfa',
  'DEMO-CORP': 'Demo Mining Corporation',
};

export function displayPlantName(plantIdOrObj) {
  if (!plantIdOrObj) return '';
  // Si nos pasan el objeto plant {plant_id, name}, preferimos el name del DB
  if (typeof plantIdOrObj === 'object') {
    return plantIdOrObj.name || PLANT_DISPLAY_NAMES[plantIdOrObj.plant_id] || plantIdOrObj.plant_id || '';
  }
  // Si nos pasan el id como string
  return PLANT_DISPLAY_NAMES[plantIdOrObj] || plantIdOrObj;
}
