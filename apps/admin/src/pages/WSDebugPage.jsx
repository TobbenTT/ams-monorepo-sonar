import { useEffect, useState, useCallback } from 'react';
import * as api from '../api';
import { Activity, RefreshCw, Wifi, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * WS Debug — auditor en tiempo real para diagnosticar problemas WebSocket.
 * Jorge 2026-04-27: para cuando alguien dice "no se actualiza" y no se reproduce.
 *
 * Polling: 2s. Datos in-memory en backend (se pierden al restart, OK).
 */

const fmtTime = (ts) => {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const eventStyle = (type) => {
  switch (type) {
    case 'connect': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'disconnect': return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'broadcast': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'send_error':
    case 'loop_error': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

export default function WSDebugPage() {
  const [conns, setConns] = useState({ total: 0, by_plant: {}, connections: [] });
  const [events, setEvents] = useState([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([api.getWsConnections(), api.getWsAuditLog(200)]);
      setConns(c);
      setEvents(a.events || []);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e.message || String(e) || 'Error fetching WS audit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (paused) return;
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [paused, refresh]);

  const filtered = events.filter(e => filter === 'all' || e.type === filter);
  const errorCount = events.filter(e => e.type === 'send_error' || e.type === 'loop_error').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Activity size={22} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">WebSocket Debug</h1>
            <p className="text-sm text-muted-foreground">
              Auditor en tiempo real · ring buffer in-memory (últimos 300 eventos)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(p => !p)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${paused ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
            {paused ? 'Reanudar' : 'Pausar (2s polling)'}
          </button>
          <button onClick={() => refresh()} disabled={loading}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 disabled:cursor-wait flex items-center gap-1.5">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            {loading ? 'Cargando…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border-2 p-4 bg-emerald-50 border-emerald-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">Conexiones activas</div>
          <div className="text-3xl font-extrabold text-emerald-700 flex items-center gap-2">
            <Wifi size={22} /> {conns.total}
          </div>
        </div>
        <div className="rounded-xl border-2 p-4 bg-blue-50 border-blue-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700/70">Plantas conectadas</div>
          <div className="text-3xl font-extrabold text-blue-700">{Object.keys(conns.by_plant || {}).length}</div>
        </div>
        <div className="rounded-xl border-2 p-4 bg-purple-50 border-purple-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700/70">Eventos en buffer</div>
          <div className="text-3xl font-extrabold text-purple-700">{events.length}</div>
        </div>
        <div className={`rounded-xl border-2 p-4 ${errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${errorCount > 0 ? 'text-red-700/70' : 'text-gray-700/70'}`}>Errores en buffer</div>
          <div className={`text-3xl font-extrabold ${errorCount > 0 ? 'text-red-700' : 'text-gray-600'}`}>{errorCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3">Conexiones activas</h2>
          {conns.connections.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin conexiones</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-bold">Planta</th>
                    <th className="px-2 py-1.5 text-left font-bold">Client ID</th>
                    <th className="px-2 py-1.5 text-left font-bold">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {conns.connections.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1.5 font-mono">{c.plant_id || '—'}</td>
                      <td className="px-2 py-1.5 font-mono text-[10px]">{c.client_id || '—'}</td>
                      <td className="px-2 py-1.5 font-mono">{c.user_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Eventos recientes (newest first)</h2>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="text-xs border rounded px-2 py-1">
              <option value="all">Todos</option>
              <option value="connect">Connect</option>
              <option value="disconnect">Disconnect</option>
              <option value="broadcast">Broadcast</option>
              <option value="send_error">Send error</option>
              <option value="loop_error">Loop error</option>
            </select>
          </div>
          <div className="overflow-y-auto max-h-[500px] space-y-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin eventos</p>
            ) : filtered.map((e, i) => (
              <div key={i} className={`text-[11px] rounded border px-2 py-1.5 ${eventStyle(e.type)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase">{e.type}</span>
                  <span className="font-mono text-[10px] opacity-70">{fmtTime(e.ts)}</span>
                </div>
                <div className="font-mono text-[10px] mt-0.5 break-all">
                  {Object.entries(e).filter(([k]) => k !== 'ts' && k !== 'type').map(([k, v]) => (
                    <span key={k} className="mr-2"><b>{k}:</b> {String(v)}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-[10px] text-muted-foreground text-right">
          Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
        </p>
      )}
    </div>
  );
}
