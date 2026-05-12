// SF-672 (jornada VSC 2026-05-08, Jorge): el TAG debe ser un código corto
// (último segmento del Technical Location de 5 niveles), no la copia del
// sap_func_loc completo. Algunos endpoints pueden seguir devolviendo el path
// largo (legacy datasets) — este util normaliza el display para que sea
// consistente en captura, listado y detalle de OT/WR.
//
// Reglas:
//   - Si el tag ya es corto (sin separadores "-" o "/"), se devuelve tal cual.
//   - Si contiene "-": tomamos el último segmento (ej. "SN-3000-3100-3150-3150XM0020" → "3150XM0020").
//   - Si contiene "/": tomamos el último segmento.
//   - Si el resultado supera 25 chars (caso patológico), no truncamos —
//     dejamos al CSS truncar con ellipsis para no perder trazabilidad.
//
// IMPORTANTE: este util es para DISPLAY only. La PK/foreign key sigue siendo
// el tag completo guardado en BD. La regla de "corregir desde la fuente"
// (Jorge SF-672) se aplica en migración de datos aparte.

export function shortTag(tag) {
  if (!tag) return '';
  const s = String(tag).trim();
  if (!s) return '';
  // Si tiene separador "-" o "/", último segmento
  const dashIdx = s.lastIndexOf('-');
  const slashIdx = s.lastIndexOf('/');
  const cut = Math.max(dashIdx, slashIdx);
  if (cut >= 0 && cut < s.length - 1) {
    return s.substring(cut + 1);
  }
  return s;
}

// Combinación equipment_tag + sap_func_loc (display canónico):
//   - Si tag es subset del func_loc (último segmento), mostramos solo tag.
//   - Si tag y func_loc son distintos, mostramos "{tag} ({func_loc})" para audit.
export function displayTagWithLocation(tag, funcLoc) {
  const short = shortTag(tag);
  if (!funcLoc) return short;
  const flShort = shortTag(funcLoc);
  if (short === flShort) return short;
  return short;
}
