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
  // 0D1 v2: el mapping LOCAL siempre gana sobre el name del DB. Esto evita
  // que si la BD tiene el nombre real del cliente (ej. "Goldfields - Salares
  // Norte" desde un seed viejo) la UI lo muestre. Solo si el plant_id es
  // desconocido caemos al name del DB.
  if (typeof plantIdOrObj === 'object') {
    const mapped = PLANT_DISPLAY_NAMES[plantIdOrObj.plant_id];
    if (mapped) return mapped;
    return plantIdOrObj.name || plantIdOrObj.plant_id || '';
  }
  return PLANT_DISPLAY_NAMES[plantIdOrObj] || plantIdOrObj;
}
