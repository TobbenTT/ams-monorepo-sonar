import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

/**
 * Indicador de estado del WebSocket.
 * - Verde · Conectado: tiempo real activo.
 * - Amber · Reconectando: el servidor quizás está reiniciando (deploy).
 * - Rojo · Offline: no hay conexión.
 *
 * Se suscribe a window 'ws:status' (emitido desde wsSingleton.js).
 */
export default function WsStatusIndicator() {
  const [state, setState] = useState({ connected: true, attempt: 0 });

  useEffect(() => {
    const handler = (e) => setState(e.detail || state);
    window.addEventListener('ws:status', handler);
    return () => window.removeEventListener('ws:status', handler);
  }, []);

  if (state.connected) {
    return (
      <span title="Tiempo real activo" className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
        <Wifi size={11} />
        <span className="hidden md:inline">Online</span>
      </span>
    );
  }

  if (state.attempt <= 2) {
    // Primeros 2 intentos = probablemente restart corto de backend
    return (
      <span title="Reconectando al servidor…" className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
        <Loader2 size={11} className="animate-spin" />
        <span className="hidden md:inline">Reconectando…</span>
      </span>
    );
  }

  return (
    <span title={`Sin conexión (intento ${state.attempt}). El servidor puede estar en mantenimiento.`} className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-semibold">
      <WifiOff size={11} />
      <span className="hidden md:inline">Offline</span>
    </span>
  );
}
