import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, Download, AlertCircle, Plus, XCircle, Ban
} from 'lucide-react';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';

const PRIORITY_COLORS = {
  P1: 'text-red-600 font-bold',
  P2: 'text-orange-600 font-semibold',
  P3: 'text-yellow-600',
  P4: 'text-blue-600',
};

const PRIORITY_LABELS = {
  P1: 'Urgente',
  P2: 'Alta',
  P3: 'Media',
  P4: 'Parada Planta',
};

function PriorityLabel({ priority }) {
  const p = String(priority || 'P3');
  const label = PRIORITY_LABELS[p] || p;
  return <span className={PRIORITY_COLORS[p] || 'text-gray-500'}>{label}</span>;
}

export default function Planning({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [workRequests, setWorkRequests] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null); // track which WR action is loading
  const [expandedWR, setExpandedWR] = useState(null); // which WR detail is expanded

  // Pagination
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchData = () => {
    setLoading(true);
    api.listWorkRequests({ plant_id: plant }).then(res => {
      const wrs = Array.isArray(res) ? res : res?.items || [];
      setWorkRequests(wrs);
    }).catch(() => {
      setWorkRequests([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [plant]);

  // Only approved WRs (VALIDATED status)
  const approvedWRs = useMemo(() =>
    workRequests.filter(wr => wr.status === 'VALIDATED'),
  [workRequests]);

  // Apply priority filter
  const filteredWRs = useMemo(() => {
    if (priorityFilter === 'All') return approvedWRs;
    return approvedWRs.filter(wr => (wr.priority || wr.priority_code) === priorityFilter);
  }, [approvedWRs, priorityFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = approvedWRs.length;
    const p1 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P1').length;
    const p2 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P2').length;
    const urgent = p1 + p2;
    const avgAge = total > 0
      ? Math.round(approvedWRs.reduce((sum, wr) => {
          const created = wr.created_at ? new Date(wr.created_at).getTime() : Date.now();
          return sum + (Date.now() - created) / (1000 * 60 * 60 * 24);
        }, 0) / total)
      : 0;
    return { total, urgent, p1, p2, avgAge };
  }, [approvedWRs]);

  // Paginated
  const paginatedWRs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredWRs.slice(start, start + PAGE_SIZE);
  }, [filteredWRs, page]);
  const totalPages = Math.ceil(filteredWRs.length / PAGE_SIZE);

  // ── Actions ──
  const handleCreateOT = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_ot');
    try {
      const res = await api.createWOFromWR({
        work_request_id: wrId,
        description: wr.problem_description?.original_text || wr.description || 'OT desde Aviso',
        wo_type: 'CORRECTIVO',
        priority_code: wr.priority || wr.priority_code || 'P3',
        equipment_tag: wr.equipment_tag || wr.asset_tag || '',
        equipment_id: wr.equipment_id || '',
        estimated_hours: wr.estimated_hours || 4,
      });
      toast.success('OT creada: ' + (res?.wo_number || 'OK'));
      fetchData(); // reload to remove this WR from approved list
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo crear OT'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_reject');
    try {
      await api.validateWorkRequest(wrId, { action: 'REJECT', reason: 'Rechazado desde planificacion' });
      toast.success('Aviso rechazado');
      fetchData();
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo rechazar'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_cancel');
    try {
      await api.cancelWorkRequest(wrId, { reason: 'Cancelado desde planificacion' });
      toast.success('Aviso cancelado');
      fetchData();
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cancelar'));
    } finally {
      setActionLoading(null);
    }
  };

  // Export
  const handleExport = () => {
    const headers = ['ID', 'Equipo', 'Descripcion', 'Prioridad', 'Reportado por', 'Fecha', 'Dias'];
    const rows = filteredWRs.map(wr => {
      const created = wr.created_at ? new Date(wr.created_at) : null;
      const days = created ? Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return [
        wr.work_request_id?.slice(0, 10) || wr.request_id?.slice(0, 10) || '',
        wr.equipment_tag || '',
        wr.problem_description?.original_text || wr.description || '',
        wr.priority || wr.priority_code || '',
        wr.reported_by || wr.created_by || '',
        created ? created.toLocaleDateString() : '',
        days,
      ];
    });
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Avisos Aprobados', headers, rows }] }, `avisos_aprobados_${new Date().toISOString().slice(0, 10)}`);
    toast.success('Exportado ' + filteredWRs.length + ' avisos');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-emerald-400 border border-gray-200 p-5">
          <p className="text-sm text-emerald-600 mb-1">Avisos Aprobados</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-red-400 border border-gray-200 p-5">
          <p className="text-sm text-red-600 mb-1">Urgentes (P1+P2)</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.urgent}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Edad Promedio</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.avgAge}<span className="text-lg text-gray-400 ml-1">dias</span></p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Pendientes OT</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
          <p className="text-xs text-gray-400 mt-1">Requieren crear OT</p>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Avisos Aprobados - Backlog de Planificacion</h3>
          <span className="text-sm text-gray-400">{filteredWRs.length} avisos</span>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 font-medium">Prioridad:</span>
        {['All', 'P1', 'P2', 'P3', 'P4'].map(opt => (
          <button key={opt} onClick={() => { setPriorityFilter(opt); setPage(0); }}
            className={`text-sm font-medium px-2.5 py-1 rounded transition-colors ${
              priorityFilter === opt
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {opt === 'All' ? 'Todos' : opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredWRs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 opacity-40">&#128203;</div>
            <p className="text-sm font-medium">No hay avisos aprobados</p>
            <p className="text-xs mt-1">Los avisos aparecen aqui cuando el supervisor los aprueba desde Identification</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Aviso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripcion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reportado por</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dias</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWRs.map(wr => {
                const wrId = wr.work_request_id || wr.request_id || '';
                const displayId = 'WN-' + wrId.slice(0, 6);
                const priority = wr.priority || wr.priority_code || 'P3';
                const desc = wr.problem_description?.original_text || wr.description || '';
                const created = wr.created_at ? new Date(wr.created_at) : null;
                const days = created ? Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const isLoading = actionLoading && actionLoading.startsWith(wrId);

                return (
                  <tr key={wrId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-700 font-medium">{displayId}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{wr.equipment_tag || '---'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={desc}>{desc || '---'}</td>
                    <td className="px-4 py-3"><PriorityLabel priority={priority} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{wr.reported_by || wr.created_by || '---'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${days > 7 ? 'text-red-600' : days > 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {days}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Crear OT - primary action */}
                        <button
                          onClick={() => handleCreateOT(wr)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          title="Crear Orden de Trabajo">
                          {actionLoading === wrId + '_ot'
                            ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Plus className="w-3.5 h-3.5" />}
                          Crear OT
                        </button>
                        {/* Rechazar */}
                        <button
                          onClick={() => handleReject(wr)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                          title="Rechazar aviso">
                          {actionLoading === wrId + '_reject'
                            ? <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />}
                        </button>
                        {/* Cancelar */}
                        <button
                          onClick={() => handleCancel(wr)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                          title="Cancelar aviso">
                          {actionLoading === wrId + '_cancel'
                            ? <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                            : <Ban className="w-3.5 h-3.5" />}
                        </button>
                      </div>
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
              Mostrando {page * PAGE_SIZE + 1}--{Math.min((page + 1) * PAGE_SIZE, filteredWRs.length)} de {filteredWRs.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
