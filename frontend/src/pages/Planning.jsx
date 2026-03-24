import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus, Eye, Loader2, Clock, ChevronRight, ChevronLeft, ArrowRight
} from 'lucide-react';
import * as api from '../api';

const STRATEGY_COLORS = {
  Corrective: 'bg-orange-100 text-orange-700 border-orange-200',
  Preventive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Predictive: 'bg-blue-100 text-blue-700 border-blue-200',
  Improvement: 'bg-purple-100 text-purple-700 border-purple-200',
};

function getStrategy(wo) {
  if (wo.work_order_type === 'PM01') return 'Preventive';
  if (wo.work_order_type === 'PM03') return 'Corrective';
  if (wo.work_order_type === 'PM05') return 'Predictive';
  if (wo.work_order_type === 'PM04') return 'Improvement';
  // Fallback: check description keywords
  const desc = (wo.description || '').toLowerCase();
  if (desc.includes('preventiv') || desc.includes('inspection') || desc.includes('lubrication')) return 'Preventive';
  if (desc.includes('predictiv') || desc.includes('vibration') || desc.includes('monitoring')) return 'Predictive';
  return 'Corrective';
}

function getPlanningStatus(wo) {
  if (wo.status === 'RELEASED' || wo.status === 'SCHEDULED') return 'Ready';
  return 'In Planning';
}

const PRIORITY_COLORS = {
  P1: 'text-red-600 font-bold',
  P2: 'text-orange-600 font-semibold',
  P3: 'text-yellow-600',
  P4: 'text-green-600',
  1: 'text-red-600 font-bold',
  2: 'text-orange-600 font-semibold',
  3: 'text-yellow-600',
  4: 'text-green-600',
};

function PriorityLabel({ priority }) {
  const p = String(priority || '');
  const label = p.startsWith('P') ? p : `P${p}`;
  const display = label === 'P1' ? 'Critical' : label === 'P2' ? 'High' : label === 'P3' ? 'Medium' : 'Low';
  return <span className={PRIORITY_COLORS[p] || 'text-gray-500'}>{display}</span>;
}

function StatusLabel({ status }) {
  if (status === 'Ready') return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Ready</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">In Planning</span>;
}

export default function Planning({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [managedWOs, setManagedWOs] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);

  // Filters
  const [originFilter, setOriginFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create OT modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    equipment_tag: '', description: '', work_order_type: 'PM02',
    priority: 'P3', estimated_duration_hours: 4,
  });
  const [creating, setCreating] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchAll = () => {
    setLoading(true);
    Promise.allSettled([
      api.listManagedWOs({ plant_id: plant }),
      api.listWorkRequests({ plant_id: plant }),
    ]).then(([woRes, wrRes]) => {
      const wos = woRes.status === 'fulfilled' ? (Array.isArray(woRes.value) ? woRes.value : woRes.value?.items || []) : [];
      setManagedWOs(wos);
      const wrs = wrRes.status === 'fulfilled' ? (Array.isArray(wrRes.value) ? wrRes.value : wrRes.value?.items || []) : [];
      setWorkRequests(wrs);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAll(); }, [plant]);

  // Filter OTs in planning phase
  const planningWOs = useMemo(() =>
    managedWOs.filter(wo => ['DRAFT', 'PLANNED', 'RELEASED'].includes(wo.status)),
  [managedWOs]);

  // Apply filters
  const filteredWOs = useMemo(() => {
    let list = [...planningWOs];

    if (originFilter === 'From WR') {
      list = list.filter(wo => wo.source_wr_id || wo.work_request_id);
    } else if (originFilter === 'From Strategy') {
      list = list.filter(wo => !wo.source_wr_id && !wo.work_request_id);
    }

    if (statusFilter === 'In Planning') {
      list = list.filter(wo => ['DRAFT', 'PLANNED'].includes(wo.status));
    } else if (statusFilter === 'Ready') {
      list = list.filter(wo => wo.status === 'RELEASED' || wo.status === 'SCHEDULED');
    }

    return list;
  }, [planningWOs, originFilter, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = planningWOs.length;
    const inPlanning = planningWOs.filter(wo => ['DRAFT', 'PLANNED'].includes(wo.status)).length;
    const ready = planningWOs.filter(wo => wo.status === 'RELEASED' || wo.status === 'SCHEDULED').length;
    const overdue = planningWOs.filter(wo => {
      if (!wo.created_at) return false;
      const age = (Date.now() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return age > 14 && ['DRAFT', 'PLANNED'].includes(wo.status);
    }).length;
    return { total, inPlanning, ready, overdue };
  }, [planningWOs]);

  // Paginated data
  const paginatedWOs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredWOs.slice(start, start + PAGE_SIZE);
  }, [filteredWOs, page]);
  const totalPages = Math.ceil(filteredWOs.length / PAGE_SIZE);

  // Find WR origin for an OT
  const getWROrigin = (wo) => {
    const wrId = wo.source_wr_id || wo.work_request_id;
    if (!wrId) return null;
    const wr = workRequests.find(w => w.work_request_id === wrId || w.request_id === wrId);
    return wr ? (wr.wo_number || wr.work_request_id?.slice(0, 10) || wrId.slice(0, 10)) : wrId.slice(0, 10);
  };

  // Create OT
  const handleCreateOT = async () => {
    if (!createForm.equipment_tag.trim()) { toast.error('Equipment tag is required'); return; }
    setCreating(true);
    try {
      const result = await api.createManagedWO({
        plant_id: plant || 'OCP-JFC1',
        ...createForm,
        estimated_duration_hours: parseFloat(createForm.estimated_duration_hours) || 4,
      });
      toast.success(`OT ${result?.wo_number || ''} created`);
      setShowCreateModal(false);
      setCreateForm({ equipment_tag: '', description: '', work_order_type: 'PM02', priority: 'P3', estimated_duration_hours: 4 });
      fetchAll();
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setCreating(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total OTs</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-yellow-400 border border-gray-200 p-5">
          <p className="text-sm text-yellow-600 mb-1">In Planning</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.inPlanning}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Ready to Schedule</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.ready}</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-red-400 border border-gray-200 p-5">
          <p className="text-sm text-red-600 mb-1">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{kpis.overdue}</p>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Work Orders Backlog</h3>
          <span className="text-sm text-gray-400">{filteredWOs.length} orders</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create OT
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Origin:</span>
          {['All', 'From WR', 'From Strategy'].map(opt => (
            <button
              key={opt}
              onClick={() => { setOriginFilter(opt); setPage(0); }}
              className={`text-sm font-medium px-2 py-0.5 rounded transition-colors ${
                originFilter === opt
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          {['All', 'In Planning', 'Ready'].map(opt => (
            <button
              key={opt}
              onClick={() => { setStatusFilter(opt); setPage(0); }}
              className={`text-sm font-medium px-2 py-0.5 rounded transition-colors ${
                statusFilter === opt
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredWOs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 opacity-40">📋</div>
            <p className="text-sm font-medium">No work orders in planning</p>
            <p className="text-xs mt-1">Create an OT or approve a Work Request to start</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">OT ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">WR Origin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Strategy</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. HH</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWOs.map(wo => {
                const strategy = getStrategy(wo);
                const planStatus = getPlanningStatus(wo);
                const wrOrigin = getWROrigin(wo);
                return (
                  <tr
                    key={wo.work_order_id || wo.wo_number}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = '/work-orders'}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {wo.wo_number || (wo.work_order_id || '').slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      {wrOrigin
                        ? <span className="text-emerald-600 font-medium cursor-pointer hover:underline" onClick={e => { e.stopPropagation(); if (onNavigateTab) onNavigateTab('identification'); }}>
                            WR-{wrOrigin}
                          </span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{wo.equipment_tag || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{wo.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STRATEGY_COLORS[strategy] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {strategy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{wo.estimated_duration_hours || 0}h</td>
                    <td className="px-4 py-3">
                      <PriorityLabel priority={wo.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusLabel status={planStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredWOs.length)} of {filteredWOs.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create OT Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Work Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Tag *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  value={createForm.equipment_tag}
                  onChange={e => setCreateForm(f => ({ ...f, equipment_tag: e.target.value }))}
                  placeholder="e.g. P-1201A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Work order description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.work_order_type}
                    onChange={e => setCreateForm(f => ({ ...f, work_order_type: e.target.value }))}
                  >
                    <option value="PM01">PM01 - Preventive</option>
                    <option value="PM02">PM02 - Planned</option>
                    <option value="PM03">PM03 - Corrective</option>
                    <option value="PM05">PM05 - Predictive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.priority}
                    onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.estimated_duration_hours}
                    onChange={e => setCreateForm(f => ({ ...f, estimated_duration_hours: e.target.value }))}
                    min="0" step="0.5"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleCreateOT}
                disabled={creating}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create OT</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
