import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Package, Clock, AlertTriangle, Users, TrendingDown, Layers, Loader2 } from 'lucide-react';
import { priorityColor, statusColor } from '../data/mockData';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const REASON_COLORS = {
  READY:               '#10b981',
  AWAITING_SHUTDOWN:   '#6366f1',
  AWAITING_MATERIALS:  '#f59e0b',
  WORKFORCE_UNAVAILABLE: '#3b82f6',
  AWAITING_APPROVAL:   '#ef4444',
  SCHEDULED_SHUTDOWN:  '#10b981',
};

const PRIORITY_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 };

const BAR_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'];

// Normalize API backlog item to the shape the UI expects
function normalizeItem(item) {
  const pMap = { '1_CRITICAL': 'P1', '2_URGENT': 'P2', '3_NORMAL': 'P3', '4_LOW': 'P4' };
  return {
    id: item.backlog_id || item.id,
    wr_id: item.work_request_id || item.wr_id || null,
    equipment_tag: item.equipment_tag || '',
    reason: item.blocking_reason || item.status || item.reason || 'AWAITING_APPROVAL',
    age_days: item.age_days ?? 0,
    estimated_hours: item.estimated_hours ?? 0,
    plant: item.plant || '',
    priority: pMap[item.priority] || item.priority || 'P3',
    group_id: item.group_id || null,
  };
}

export default function Backlog() {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState('priority');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listBacklog()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems(arr.map(normalizeItem));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // KPIs
  const totalBacklog = items.length;
  const totalHours = items.reduce((acc, b) => acc + (b.estimated_hours || 0), 0);
  const p1Urgentes = items.filter((b) => b.priority === 'P1').length;
  const sinMateriales = items.filter((b) => b.reason === 'AWAITING_MATERIALS').length;

  // Sort
  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'priority') {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      return pa !== pb ? pa - pb : b.age_days - a.age_days;
    }
    return b.age_days - a.age_days;
  });

  // Grouping
  const groupedMap = {};
  items.forEach((item) => {
    if (item.group_id) {
      if (!groupedMap[item.group_id]) groupedMap[item.group_id] = [];
      groupedMap[item.group_id].push(item);
    }
  });
  const groups = Object.entries(groupedMap).map(([gid, groupItems]) => ({
    group_id: gid,
    items: groupItems,
    total_hours: groupItems.reduce((acc, i) => acc + i.estimated_hours, 0),
    tags: [...new Set(groupItems.map((i) => i.equipment_tag))],
    priority: groupItems.map((i) => PRIORITY_ORDER[i.priority] ?? 99).sort()[0],
  }));

  // Chart data derived from actual items
  const reasonCounts = {};
  items.forEach((item) => {
    const r = item.reason || 'UNKNOWN';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });
  const chartData = Object.entries(reasonCounts).map(([reason, count], idx) => ({
    reason,
    count,
    pct: items.length > 0 ? Math.round((count / items.length) * 100) : 0,
    color: BAR_COLORS[idx % BAR_COLORS.length],
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">{t('common.loading') || 'Loading...'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('backlog.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('backlog.subtitle')}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4">
          <div className="bg-indigo-100 rounded-lg p-3">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('backlog.totalBacklog')}</p>
            <p className="text-2xl font-bold text-gray-800">{totalBacklog}</p>
            <p className="text-xs text-gray-400">{t('backlog.pendingOrders')}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4">
          <div className="bg-amber-100 rounded-lg p-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('backlog.pendingHours')}</p>
            <p className="text-2xl font-bold text-gray-800">{totalHours}</p>
            <p className="text-xs text-gray-400">{t('backlog.estimatedHoursLabel')}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-red-200 shadow-sm p-4 flex items-center gap-4">
          <div className="bg-red-100 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('backlog.urgentP1')}</p>
            <p className="text-2xl font-bold text-red-700">{p1Urgentes}</p>
            <p className="text-xs text-gray-400">{t('backlog.requireAction')}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-amber-200 shadow-sm p-4 flex items-center gap-4">
          <div className="bg-amber-100 rounded-lg p-3">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('backlog.noMaterials')}</p>
            <p className="text-2xl font-bold text-amber-700">{sinMateriales}</p>
            <p className="text-xs text-gray-400">{t('backlog.blockedByStock')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t('backlog.byReason')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="reason" type="category" width={130} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(val, name) => [val, t('backlog.ordersTooltip')]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-3">
            {chartData.map((d) => (
              <div key={d.reason} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground">{d.reason} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Work grouping panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-muted-foreground">{t('backlog.workGrouping')}</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {t('backlog.groupableDesc')}
          </p>
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.group_id} className="border border-indigo-100 bg-indigo-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700">{g.group_id}</span>
                  <span className="text-xs font-medium text-indigo-600">{g.total_hours} h</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {g.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-card border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{g.items.length} {t('backlog.ordersCount')}</span>
                  <button className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    {t('backlog.createPackage')}
                  </button>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">{t('backlog.noGroups')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Full table */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t('backlog.fullList')}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('backlog.sortByLabel')}</span>
            {[
              { key: 'priority', label: t('backlog.sortPriority') },
              { key: 'age', label: t('backlog.sortAge') },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  sortBy === opt.key
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-card text-gray-600 border-gray-300 hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted border-b border-border">
                {[t('backlog.id'), t('backlog.equipment'), t('backlog.reason'), t('backlog.sortPriority'), t('backlog.age'), t('backlog.estimatedHours'), t('backlog.plant'), t('backlog.group')].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 hover:bg-muted transition-colors ${
                    item.priority === 'P1' ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-muted-foreground">{item.id}</td>
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                    {item.equipment_tag}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: REASON_COLORS[item.reason] ?? '#6b7280' }}
                    >
                      {t(`backlog.reasons.${item.reason}`) !== `backlog.reasons.${item.reason}` ? t(`backlog.reasons.${item.reason}`) : item.reason}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${priorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-bold ${
                      item.age_days >= 7
                        ? 'text-red-600'
                        : item.age_days >= 4
                        ? 'text-amber-600'
                        : 'text-gray-700'
                    }`}>
                      {item.age_days} d{item.age_days >= 7 && (
                        <AlertTriangle className="inline w-3 h-3 ml-1 text-red-500" />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-medium text-gray-700">
                    {item.estimated_hours} h
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.plant}</td>
                  <td className="px-3 py-2">
                    {item.group_id ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {item.group_id}
                      </span>
                    ) : (
                      <span className="text-gray-300">{'\u2014'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted border-t border-border">
                <td colSpan={5} className="px-3 py-2 text-xs font-semibold text-gray-600">
                  {t('backlog.totalOrders', { count: sorted.length })}
                </td>
                <td className="px-3 py-2 text-center text-xs font-bold text-gray-800">
                  {totalHours} h
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
