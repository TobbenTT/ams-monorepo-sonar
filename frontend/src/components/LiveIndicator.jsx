import { useEffect, useState } from 'react';

// Jorge 2026-04-21 — indicador de "Live" + "última actualización hace Xs".
// Props:
//  - lastWsAt: timestamp ms de la última emisión WS recibida (o null).
//  - compact: boolean — versión compacta para headers chicos.
export default function LiveIndicator({ lastWsAt, compact = false }) {
  const [, force] = useState(0);
  // Bug 2026-05-12: el `lastWsAt` que viene como prop solo se setea cuando
  // llega un evento wo_* (Scheduling.jsx:4676). Si el ping/pong sigue vivo
  // pero no hay eventos de OT, el indicador subía a 15s+ aunque el WS
  // estuviera 100% conectado. Ahora escuchamos también `ws:activity`
  // (despachado por wsSingleton en cada pong, ~15s) para reflejar salud
  // real de la conexión, no solo actividad de OT.
  const [activityAt, setActivityAt] = useState(null);
  useEffect(() => {
    const t = setInterval(() => force(n => n + 1), 1000);
    const onActivity = () => setActivityAt(Date.now());
    window.addEventListener('ws:activity', onActivity);
    return () => { clearInterval(t); window.removeEventListener('ws:activity', onActivity); };
  }, []);

  const effective = Math.max(lastWsAt || 0, activityAt || 0) || null;
  const sinceMs = effective ? Date.now() - effective : null;
  const sinceSec = sinceMs != null ? Math.floor(sinceMs / 1000) : null;
  const isLive = sinceMs == null || sinceMs < 60000; // <1 min = live
  const isStale = sinceMs != null && sinceMs > 300000; // >5 min = stale

  const tone = isStale ? 'bg-rose-500' : isLive ? 'bg-emerald-500' : 'bg-amber-500';
  const label = sinceSec == null
    ? 'esperando actividad'
    : sinceSec < 5
      ? 'justo ahora'
      : sinceSec < 60
        ? `hace ${sinceSec}s`
        : sinceSec < 3600
          ? `hace ${Math.floor(sinceSec / 60)}m`
          : `hace ${Math.floor(sinceSec / 3600)}h`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
        title={`Última actualización ${label}`}>
        <span className="relative flex h-2 w-2">
          {isLive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tone} opacity-60`} />}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${tone}`} />
        </span>
        <span className="font-medium">Live</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-white/60 dark:bg-card/60 backdrop-blur-sm"
      title="Datos en tiempo real via WebSocket">
      <span className="relative flex h-2 w-2">
        {isLive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tone} opacity-60`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${tone}`} />
      </span>
      <span className={`font-bold uppercase tracking-wider ${isStale ? 'text-rose-700' : isLive ? 'text-emerald-700' : 'text-amber-700'}`}>
        {isStale ? 'Stale' : 'Live'}
      </span>
      <span className="text-muted-foreground">· {label}</span>
    </div>
  );
}
