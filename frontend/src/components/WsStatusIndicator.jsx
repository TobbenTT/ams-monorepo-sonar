import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

/**
 * Indicador de estado WS + "Sync hace Xs".
 * Eventos:
 *  - ws:status → connected/attempt
 *  - ws:activity → timestamp del último mensaje recibido
 */
export default function WsStatusIndicator() {
  const [state, setState] = useState({ connected: true, attempt: 0 });
  const [lastAt, setLastAt] = useState(null);
  const [, force] = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    const onStatus = (e) => setState(prev => ({ ...prev, ...(e.detail || {}) }));
    const onActivity = (e) => setLastAt(e.detail?.at || Date.now());
    window.addEventListener('ws:status', onStatus);
    window.addEventListener('ws:activity', onActivity);
    tickRef.current = setInterval(() => force(n => n + 1), 1000);
    return () => {
      window.removeEventListener('ws:status', onStatus);
      window.removeEventListener('ws:activity', onActivity);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const fmtAgo = (ms) => {
    if (ms == null) return '';
    const s = Math.floor(ms / 1000);
    if (s < 5) return 'ahora';
    if (s < 60) return `hace ${s}s`;
    if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
    return `hace ${Math.floor(s / 3600)}h`;
  };

  const sinceMs = lastAt ? Date.now() - lastAt : null;
  const ago = fmtAgo(sinceMs);

  if (state.connected) {
    const tip = lastAt ? `Tiempo real activo · última señal ${ago}` : 'Tiempo real activo';
    return (
      <span title={tip} className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
        <Wifi size={11} />
        <span className="hidden md:inline">Sync {ago || 'OK'}</span>
      </span>
    );
  }

  if (state.attempt <= 2) {
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
