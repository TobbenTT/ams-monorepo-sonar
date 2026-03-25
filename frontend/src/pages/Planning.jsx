import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, ArrowRight, Download, AlertCircle
} from 'lucide-react';
import * as api from '../api';
import WorkOrderDetailDialog from '../components/tactical/WorkOrderDetailDialog';
import { downloadExport } from '../utils/exportFile';

const STRATEGY_COLORS = {
  Corrective: 'bg-orange-100 text-orange-700 border-orange-200',
  Preventive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Predictive: 'bg-blue-100 text-blue-700 border-blue-200',
  Improvement: 'bg-purple-100 text-purple-700 border-purple-200',
};

function getStrategy(wo) {
  const t = (wo.wo_type || wo.work_order_type || '').toUpperCase();
  if (t.includes('PREVENT') || t === 'PM01') return 'Preventive';
  if (t.includes('CORRECT') || t === 'PM03') return 'Corrective';
  if (t.includes('PREDICT') || t.includes('MONITOREO') || t === 'PM05') return 'Predictive';
  if (t.includes('MEJORA') || t.includes('IMPROV') || t === 'PM04') return 'Improvement';
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
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [managedWOs, setManagedWOs] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);

  // Filters
  const [originFilter, setOriginFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Aviso, OT



  // WO Detail dialog
  const [selectedWO, setSelectedWO] = useState(null);

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

  // Approved WRs (VALIDATED = approved by supervisor, not yet converted to OT)
  const approvedWRs = useMemo(() =>
    workRequests.filter(wr => wr.status === 'VALIDATED').map(wr => ({
      ...wr,
      _rowType: 'WR',
      _displayId: `WN-${wr.work_request_id?.slice(0, 6) || wr.request_id?.slice(0, 6) || '???'}`,
      wo_number: null,
      equipment_tag: wr.equipment_tag || wr.asset_tag || '',
      description: wr.description || '',
      priority_code: wr.priority || 'P3',
      estimated_hours: wr.estimated_hours || 0,
      estimated_duration_hours: wr.estimated_hours || 0,
      wo_type: wr.work_type || '',
      work_order_type: wr.work_type || '',
      created_at: wr.created_at,
    })),
  [workRequests]);

  // Apply filters - combine OTs (tagged) + approved WRs
  const filteredWOs = useMemo(() => {
    const otsTagged = planningWOs.map(wo => ({ ...wo, _rowType: 'OT', _displayId: wo.wo_number || (wo.wo_id || '').slice(0, 10) }));
    let list = [...otsTagged, ...approvedWRs];

    // Type filter
    if (typeFilter === 'Aviso') {
      list = list.filter(item => item._rowType === 'WR');
    } else if (typeFilter === 'OT') {
      list = list.filter(item => item._rowType === 'OT');
    }

    if (originFilter === 'From WR') {
      list = list.filter(wo => wo._rowType === 'WR' || wo.work_request_id || wo.source_wr_id);
    } else if (originFilter === 'From Strategy') {
      list = list.filter(wo => wo._rowType === 'OT' && !wo.source_wr_id && !wo.work_request_id);
    }

    if (statusFilter === 'In Planning') {
      list = list.filter(wo => wo._rowType === 'WR' || ['DRAFT', 'PLANNED'].includes(wo.status));
    } else if (statusFilter === 'Ready') {
      list = list.filter(wo => wo._rowType === 'OT' && (wo.status === 'RELEASED' || wo.status === 'SCHEDULED'));
    }

    return list;
  }, [planningWOs, approvedWRs, originFilter, statusFilter, typeFilter]);

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
    const avisos = approvedWRs.length;
    return { total, inPlanning, ready, overdue, avisos };
  }, [planningWOs, approvedWRs]);

  // Paginated data
  const paginatedWOs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredWOs.slice(start, start + PAGE_SIZE);
  }, [filteredWOs, page]);
  const totalPages = Math.ceil(filteredWOs.length / PAGE_SIZE);

  // Find WR origin for an OT
  const getWROrigin = (wo) => {
    const wrId = wo.work_request_id || wo.source_wr_id;
    if (!wrId) return null;
    const wr = workRequests.find(w => w.work_request_id === wrId || w.request_id === wrId);
    return wr ? (wr.wo_number || wr.work_request_id?.slice(0, 10) || wrId.slice(0, 10)) : wrId.slice(0, 10);
  };



  // Export filtered WOs to Excel
  const handleExport = () => {
    const headers = [
      'OT Number', 'Type', 'Priority', 'Equipment', 'Description',
      'Status', 'Strategy', 'Estimated Hours', 'Planned Start', 'Planned End'
    ];
    const rows = filteredWOs.map(wo => {
      const strategy = getStrategy(wo);
      const planStatus = getPlanningStatus(wo);
      const prio = wo.priority_code || wo.priority || '';
      return [
        wo.wo_number || wo.wo_id || '',
        wo.wo_type || wo.work_order_type || '',
        prio,
        wo.equipment_tag || '',
        wo.description || '',
        planStatus,
        strategy,
        wo.estimated_hours || wo.estimated_duration_hours || 0,
        wo.planned_start ? new Date(wo.planned_start).toLocaleDateString() : '',
        wo.planned_end ? new Date(wo.planned_end).toLocaleDateString() : ''
      ];
    });
    downloadExport({
      format: 'EXCEL',
      sheets: [{ name: 'Planning Backlog', headers, rows }]
    }, `planning_backlog_${new Date().toISOString().slice(0, 10)}`);
    toast.success(`Exported ${filteredWOs.length} work orders`);
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
        <div className="bg-white rounded-lg border-l-4 border-l-blue-400 border border-gray-200 p-5">
          <p className="text-sm text-blue-600 mb-1">Avisos Aprobados</p>
          <p className="text-3xl font-bold text-red-600">{kpis.overdue}</p>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Backlog de Planificación</h3>
          <span className="text-sm text-gray-400">{filteredWOs.length} items</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>

        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Tipo:</span>
          {['All', 'Aviso', 'OT'].map(opt => (
            <button
              key={opt}
              onClick={() => { setTypeFilter(opt); setPage(0); }}
              className={`text-sm font-medium px-2 py-0.5 rounded transition-colors ${
                typeFilter === opt
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
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
            <p className="text-sm font-medium">No items in planning</p>
            <p className="text-xs mt-1">Approve a Work Request or create an OT from the Identification tab</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Número</th>
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
                const planStatus = wo._rowType === 'WR' ? 'Aprobado' : getPlanningStatus(wo);
                const isWR = wo._rowType === 'WR';
                return (
                  <tr
                    key={isWR ? (wo.work_request_id || wo.request_id) : (wo.wo_id || wo.wo_number)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (isWR) {
                        if (onNavigateTab) onNavigateTab('identification');
                      } else {
                        setSelectedWO(wo);
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      {isWR
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200"><AlertCircle className="w-3 h-3" /> Aviso</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">OT</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {wo._displayId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{wo.equipment_tag || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{wo.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STRATEGY_COLORS[strategy] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {strategy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{wo.estimated_hours || wo.estimated_duration_hours || 0}h</td>
                    <td className="px-4 py-3">
                      <PriorityLabel priority={wo.priority_code || wo.priority} />
                    </td>
                    <td className="px-4 py-3">
{isWR
                        ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Aprobado</span>
                        : <StatusLabel status={planStatus} />
                      }
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

            {/* WO Detail Dialog */}
      {selectedWO && (
        <WorkOrderDetailDialog
          workOrder={selectedWO}
          open={!!selectedWO}
          onClose={() => setSelectedWO(null)}
        />
      )}
    </div>
  );
}
