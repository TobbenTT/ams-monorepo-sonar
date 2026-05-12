/**
 * Construye una URL de foto autenticada agregando ?token= con el JWT actual.
 *
 * Necesario porque `<img src="...">` no manda el header Authorization. El
 * endpoint backend `/api/v1/capture/photos/{filename}` ahora valida JWT
 * (security audit 2026-05-12 — antes era público).
 *
 * Uso:
 *   <img src={photoUrl(url)} />
 *
 * Si la URL ya tiene un token o no es un path de fotos AMS, retorna sin cambios.
 */
export function photoUrl(url) {
    if (!url || typeof url !== 'string') return url;
    // Data URLs (base64) — sin cambio
    if (url.startsWith('data:')) return url;
    // URLs externas (http://otro) — sin cambio
    if (/^https?:\/\//.test(url) && !url.includes(window.location.host)) return url;
    // Solo URLs de fotos AMS
    if (!url.includes('/capture/photos/')) return url;
    // Si ya trae token, no duplicar
    if (url.includes('token=')) return url;
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(token)}`;
}

export default photoUrl;
