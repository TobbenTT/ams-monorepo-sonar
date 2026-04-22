import { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCircle2, Loader2, AlertTriangle, Info, Filter, Search } from 'lucide-react';
import { useToast } from '../components/Toast';
import * as api from '../api';

const LEVEL_STYLES = {
  CRITICAL: { bg: 'bg-red-50 border-red-300', text: 'text-red-700', dot: 'bg-red-500', label: 'Crítica' },
  HIGH:     { bg: 'bg-orange-50 border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Alta' },
  MEDIUM:   { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Media' },
  LOW:      { bg: 'bg-blue-50 border-blue-300', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Baja' },
  INFO:     { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Info' },
};

function fmtRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return then.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

export default function NotificationsCenter() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const reload = () => {
    setLoading(true);
    api.listNotificationsV2({ limit: 200 })
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const types = useMemo(() => {
    const s = new Set(items.map(n => n.type).filter(Boolean));
    return ['all', ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(n => {
      if (filter === 'unread' && n.is_read) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(n.title || '').toLowerCase().includes(q) && !(n.message || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, typeFilter, search]);

  const counts = useMemo(() => ({
    total: items.length,
    unread: items.filter(n => !n.is_read).length,
    critical: items.filter(n => (n.priority || '').toUpperCase() === 'CRITICAL').length,
  }), [items]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setItems(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Todas marcadas como leídas');
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Bell size={22} className="text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h1>
            <p className="text-sm text-muted-foreground">Alertas del sistema · {counts.total} totales · {counts.unread} sin leer</p>
          </div>
        </div>
        {counts.unread > 0 && (
          <button onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            <CheckCircle2 size={14} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard label="Sin leer" value={counts.unread} tone={counts.unread ? 'amber' : 'gray'} />
        <SummaryCard label="Críticas" value={counts.critical} tone={counts.critical ? 'red' : 'gray'} />
        <SummaryCard label="Total (últimas 200)" value={counts.total} tone="gray" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-amber-300" />
        </div>
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded ${filter === f ? 'bg-amber-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              {f === 'all' ? 'Todas' : 'Sin leer'}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm">
          {types.map(t => <option key={t} value={t}>{t === 'all' ? 'Todos los tipos' : t}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm italic">
            Sin notificaciones {filter === 'unread' ? 'sin leer' : ''}.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(n => {
              const lvl = LEVEL_STYLES[(n.priority || '').toUpperCase()] || LEVEL_STYLES.INFO;
              return (
                <div key={n.notification_id} onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${!n.is_read ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-transparent' : lvl.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${n.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title || 'Sin título'}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${lvl.bg} ${lvl.text}`}>{lvl.label}</span>
                      {n.type && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{n.type}</span>}
                    </div>
                    {n.message && <p className={`text-xs mt-0.5 ${n.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.message}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{fmtRelative(n.created_at)}</span>
                      {n.entity_id && <span className="font-mono">{n.entity_id}</span>}
                      {n.channel && <span>· {n.channel}</span>}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button onClick={e => { e.stopPropagation(); handleMarkRead(n.notification_id); }}
                      className="shrink-0 text-xs text-amber-700 hover:underline">Marcar leída</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = 'gray' }) {
  const tones = {
    gray:  'bg-gray-50 text-gray-800 border-gray-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red:   'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
