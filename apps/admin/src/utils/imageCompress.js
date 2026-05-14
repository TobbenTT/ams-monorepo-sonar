/**
 * Compresión client-side de imágenes antes de upload.
 *
 * Problema (Jorge/Gonzalo 2026-04-30 + Magdalena docx 2026-05-05):
 * Fotos directas del móvil pesan 3-8MB → como dataURL crecen ~33%.
 * Si el usuario carga 2-3 fotos, el JSON del WR excede el límite del
 * backend o nginx (multipart 50MB pero JSON body ~8MB típico).
 *
 * Solución: redimensionar a max 1600px lado largo + JPEG quality 0.85
 * → resultado típico 200-400KB sin pérdida visual relevante para
 * documentar fallas de equipo.
 */

const DEFAULT_MAX_DIM = 1600;
const DEFAULT_QUALITY = 0.85;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024; // 2MB después de comprimir

/**
 * Comprime un dataURL o File a JPEG client-side.
 * @param {string|File|Blob} input — dataURL ("data:image/...") o File/Blob
 * @param {object} opts — { maxDim, quality, maxBytes }
 * @returns {Promise<{dataUrl: string, sizeBytes: number, originalBytes: number, ratio: number}>}
 */
export async function compressImage(input, opts = {}) {
  const maxDim = opts.maxDim || DEFAULT_MAX_DIM;
  let quality = opts.quality ?? DEFAULT_QUALITY;
  const maxBytes = opts.maxBytes || DEFAULT_MAX_BYTES;

  const srcDataUrl = typeof input === 'string' ? input : await fileToDataUrl(input);
  const originalBytes = Math.round((srcDataUrl.length - srcDataUrl.indexOf(',') - 1) * 0.75);

  const img = await loadImage(srcDataUrl);
  const { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Iterativamente bajar quality si todavía excede maxBytes
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let sizeBytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
  let attempts = 0;
  while (sizeBytes > maxBytes && quality > 0.4 && attempts < 5) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    sizeBytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
    attempts++;
  }

  return {
    dataUrl,
    sizeBytes,
    originalBytes,
    ratio: originalBytes > 0 ? sizeBytes / originalBytes : 1,
    width: targetW,
    height: targetH,
    quality_used: quality,
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default compressImage;
