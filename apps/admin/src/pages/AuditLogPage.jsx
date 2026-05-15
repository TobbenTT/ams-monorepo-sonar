import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  ScrollText, RefreshCw, Filter, User, Clock, Loader2, Search,
  ChevronDown, ChevronUp, Download, Calendar,
} from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  AUTO_CREATE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  UPDATE: 'bg-blue-100 text-blue-800 border border-blue-200',
  DELETE: 'bg-red-100 text-red-800 border border-red-200',
  SOFT_DELETE: 'bg-red-50 text-red-700 border border-red-200',
  PERMANENT_DELETE: 'bg-red-200 text-red-900 border border-red-300',
  APPROVE: 'bg-green-100 text-green-800 border border-green-200',
  REJECT: 'bg-orange-100 text-orange-800 border border-orange-200',
  VALIDATE_APPROVE: 'bg-green-100 text-green-800 border border-green-200',
  VALIDATE_REJECT: 'bg-orange-100 text-orange-800 border border-orange-200',
  VALIDATE_MODIFY: 'bg-purple-100 text-purple-800 border border-purple-200',
  CLOSE: 'bg-slate-100 text-slate-700 border border-slate-200',
  CANCEL: 'bg-amber-100 text-amber-800 border border-amber-200',
  START: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
  COMPLETE: 'bg-teal-100 text-teal-800 border border-teal-200',
  RESTORE: 'bg-violet-100 text-violet-800 border border-violet-200',
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  PLANIFICADO: 'bg-blue-50 text-blue-700 border border-blue-200',
  PROGRAMADO: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  EN_EJECUCION: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  CERRADO: 'bg-slate-200 text-slate-800 border border-slate-300',
  FAST_TRACK_PROGRAMADO: 'bg-red-50 text-red-700 border border-red-200',
  CLASSIFY: 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200',
  // SP5 — eventos de regla de negocio
  BLOCKED_FAILURE_LOAD: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',  // SF-570
  EXPRESS_PM03_CONVERSION: 'bg-purple-100 text-purple-800 border border-purple-300',   // SF-569
  FINAL_NOTIFICATION_AUTO: 'bg-emerald-100 text-emerald-800 border border-emerald-300', // SF-572
};

const ACTION_LABELS = {
  BLOCKED_FAILURE_LOAD: '🚫 Falla bloqueada en OT programada',
  EXPRESS_PM03_CONVERSION: '⚡ Aviso → PM03 express',
  FINAL_NOTIFICATION_AUTO: '✅ Notificación FINAL automática',
};

const ENTITY_ICONS = {
  work_request: '📋', managed_work_order: '🔧', work_order: '🔧',
  work_package: '📦', backlog_item: '📊', execution_checklist: '✅',
  user: '👤', equipment: '⚙️', failure: '⚠️', improvement: '📈',
  settings: '⚙️', rca: '🔍', rca_analysis: '🔍', health_score: '💚',
  expert_contribution: '🧠', fmeca_worksheet: '📄', maintenance_task: '🔩',
  field_capture: '📸', sync_conflict: '🔄',
};

const ENTITY_LABELS = {
  work_request: 'Work Request',
  managed_work_order: 'Work Order',
  work_package: 'Work Package',
  backlog_item: 'Backlog',
  execution_checklist: 'Checklist',
  rca: 'Root Cause Analysis',
  rca_analysis: 'RCA Analysis',
  health_score: 'Health Score',
  expert_contribution: 'Expert Knowledge',
  fmeca_worksheet: 'FMECA',
  maintenance_task: 'Task',
  field_capture: 'Field Capture',
  sync_conflict: 'Sync Conflict',
};

function getActionColor(action) {
  const upper = (action || '').toUpperCase();
  if (ACTION_COLORS[upper]) return ACTION_COLORS[upper];
  if (upper.startsWith('VALIDATE')) return 'bg-purple-100 text-purple-800 border border-purple-200';
  if (upper.includes('CREATE')) return ACTION_COLORS.CREATE;
  if (upper.includes('DELETE')) return ACTION_COLORS.DELETE;
  return 'bg-gray-100 text-gray-700 border border-gray-200';
}

export default function AuditLogPage() {
  const { lang } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(200);
  const [expandedId, setExpandedId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState(''); // chip filter para SP5 events

  const fetchLog = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit };
      if (filterType) params.entity_type = filterType;
      const data = await api.getAuditLog(params);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, limit]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const entityTypes = [...new Set(entries.map(e => e.entity_type))].sort();

  const filtered = entries.filter(e => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = (e.entity_id || '').toLowerCase().includes(q)
        || (e.user || '').toLowerCase().includes(q)
        || (e.action || '').toLowerCase().includes(q)
        || (e.entity_type || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (dateFrom && e.timestamp && e.timestamp < dateFrom) return false;
    if (dateTo && e.timestamp && e.timestamp > dateTo + 'T23:59:59') return false;
    if (actionFilter && e.action !== actionFilter) return false;
    return true;
  });

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'Payload'];
    const rows = filtered.map(e => [
      e.timestamp || '',
      e.action || '',
      e.entity_type || '',
      e.entity_id || '',
      e.user || 'system',
      e.payload ? JSON.stringify(e.payload) : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <ScrollText size={22} className="text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lang === 'es' ? 'Registro de Actividad' : 'Activity Log'}</h1>
            <p className="text-sm text-muted-foreground">{lang === 'es' ? 'Quien hizo que y cuando' : 'Who did what and when'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-muted disabled:opacity-40 text-foreground transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={fetchLog} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-muted disabled:opacity-40 text-foreground transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {lang === 'es' ? 'Actualizar' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'es' ? 'Buscar por usuario, ID, accion o tipo...' : 'Search by user, ID, action or type...'}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">{lang === 'es' ? 'Todos los tipos' : 'All types'}</option>
              {entityTypes.map(t => (
                <option key={t} value={t}>{ENTITY_LABELS[t] || t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="text-gray-400 text-xs">—</span>
            <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            {filtered.length} {lang === 'es' ? 'registros' : 'entries'}
          </span>
        </div>

        {/* SP5 — chips de filtro rápido para eventos de regla de negocio */}
        <div className="flex flex-wrap gap-2 mt-2 px-1">
          <span className="text-xs text-gray-500 self-center">Eventos:</span>
          {[
            { v: '', l: 'Todos', cls: 'bg-gray-100 text-gray-700' },
            { v: 'BLOCKED_FAILURE_LOAD', l: '🚫 Bloqueos capacidad', cls: 'bg-rose-100 text-rose-800' },
            { v: 'EXPRESS_PM03_CONVERSION', l: '⚡ Conversiones express', cls: 'bg-purple-100 text-purple-800' },
            { v: 'FINAL_NOTIFICATION_AUTO', l: '✅ Auto-finalizaciones', cls: 'bg-emerald-100 text-emerald-800' },
          ].map(({ v, l, cls }) => (
            <button
              key={v || 'all'}
              onClick={() => setActionFilter(v)}
              className={`text-xs px-2 py-1 rounded-full border ${cls} ${actionFilter === v ? 'ring-2 ring-offset-1 ring-blue-400' : 'opacity-70 hover:opacity-100'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ScrollText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{lang === 'es' ? 'No hay registros de actividad' : 'No activity log entries'}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border/50 overflow-hidden" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id}>
                <div
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {ENTITY_ICONS[entry.entity_type] || '📝'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getActionColor(entry.action)} title={entry.action}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {ENTITY_LABELS[entry.entity_type] || entry.entity_type}
                      </span>
                      {entry.entity_id && (
                        <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {entry.entity_id}
                        </code>
                      )}
                    </div>
                    {entry.payload && !isExpanded && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-xl">
                        {typeof entry.payload === 'object' ? JSON.stringify(entry.payload).slice(0, 100) + '...' : String(entry.payload).slice(0, 100)}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`font-medium ${entry.user && entry.user !== 'system' ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {entry.user || 'system'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>

                  {/* Expand arrow */}
                  <div className="flex-shrink-0 text-gray-300 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 ml-14">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{lang === 'es' ? 'Accion' : 'Action'}</p>
                        <Badge className={getActionColor(entry.action)}>{entry.action}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{lang === 'es' ? 'Tipo' : 'Entity Type'}</p>
                        <p className="font-medium">{ENTITY_LABELS[entry.entity_type] || entry.entity_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">ID</p>
                        <code className="text-xs bg-white px-2 py-1 rounded border">{entry.entity_id || '—'}</code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{lang === 'es' ? 'Fecha/Hora' : 'Date/Time'}</p>
                        <p className="font-medium">{formatFullDate(entry.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{lang === 'es' ? 'Usuario' : 'User'}</p>
                        <p className={`font-medium ${entry.user && entry.user !== 'system' ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {entry.user || 'system'}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs text-gray-400 mb-1">Payload</p>
                        {entry.payload ? (
                          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-40">
                            {JSON.stringify(entry.payload, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-gray-400 italic text-xs">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
