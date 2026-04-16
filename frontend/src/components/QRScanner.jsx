import { useState, useRef, useEffect } from 'react';
import { Camera, X, QrCode } from 'lucide-react';

/**
 * QR Scanner component using browser BarcodeDetector API.
 * Falls back to manual input if not supported.
 */
export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!supported) return;
    let stream = null;
    let detector = null;
    let animId = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        detector = new BarcodeDetector({ formats: ['qr_code'] });
        setScanning(true);

        async function detect() {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            animId = requestAnimationFrame(detect);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) { onScan(code); return; }
            }
          } catch {}
          animId = requestAnimationFrame(detect);
        }
        detect();
      } catch (err) {
        setError('Camera access denied or not available');
      }
    }

    startCamera();
    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [supported, onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold flex items-center gap-2"><QrCode size={20} /> Scan Equipment QR</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={24} /></button>
        </div>

        {supported && !error ? (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square mb-4">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg animate-pulse" />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 mb-4 text-center">
            <Camera size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">{error || 'QR scanning not supported in this browser'}</p>
            <p className="text-gray-500 text-xs">Enter the equipment code manually below</p>
          </div>
        )}

        <div className="flex gap-2">
          <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)}
            placeholder="Enter equipment TAG manually..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-emerald-500" />
          <button onClick={() => manualCode.trim() && onScan(manualCode.trim())}
            disabled={!manualCode.trim()}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 disabled:opacity-40">
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
