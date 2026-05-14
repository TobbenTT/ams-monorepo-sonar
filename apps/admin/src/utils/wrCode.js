// SF-678 (jornada VSC 2026-05-08): formato unificado para mostrar código de WR.
// El formato canónico es AV-NNNNN (aviso_number, sequencial, SAP-style).
// Fallback a request_id legible (WR-YYYY-NNNNN) o UUID truncado.
//
// Antes de este util, varios componentes hacían `(wr.request_id||'').slice(0,8)`
// lo que truncaba "WR-2026-NNNNN" a "WR-2026-" y mostraba el formato viejo.
// Jorge pidió en QA jornada VSC 2026-05-08 que TODOS los puntos de UI muestren
// el mismo código AV-NNNNN.

export function formatWRCode(wr) {
  if (!wr) return '';
  const avisoNum = wr.aviso_number ?? wr.avisoNumber ?? null;
  if (avisoNum != null && avisoNum !== '') {
    return `AV-${String(avisoNum).padStart(5, '0')}`;
  }
  const rawId = wr.request_id || wr.work_request_id || wr.id || '';
  if (typeof rawId === 'string' && rawId.startsWith('WR-')) return rawId;
  return typeof rawId === 'string' ? rawId.slice(0, 8) : '';
}
