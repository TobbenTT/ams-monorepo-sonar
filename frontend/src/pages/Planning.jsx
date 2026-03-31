import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, Download, AlertCircle, Plus, XCircle, Ban, X, Wrench, Play
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
  P1: 'Immediate',
  P2: 'High',
  P3: 'Medium',
  P4: 'Plant Shutdown',
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

  // OTs state
  const [managedWOs, setManagedWOs] = useState([]);
  const [activeTab, setActiveTab] = useState('ots');
  const [selectedOT, setSelectedOT] = useState(null);

  const fetchOTs = () => {
    api.listManagedWOs({ plant_id: plant }).then(res => {
      setManagedWOs(Array.isArray(res) ? res : []);
    }).catch(() => setManagedWOs([]));
  };

  useEffect(() => { fetchData(); fetchOTs(); }, [plant]);

  const changeOTStatus = async (wo, newStatus) => {
    try {
      let upd;
      const WO_ID = wo.wo_id;
      if (newStatus === 'PLANIFICADO') upd = await api.planManagedWO(WO_ID);
      else if (newStatus === 'PROGRAMADO') upd = await api.scheduleManagedWO(WO_ID, {});
      else if (newStatus === 'EN_EJECUCION') upd = await api.startManagedWO(WO_ID);
      else if (newStatus === 'CERRADO') upd = await api.completeManagedWO(WO_ID, { actual_hours: wo.estimated_hours || 0 });
      else if (newStatus === 'CANCELADO') upd = await api.closeManagedWO(WO_ID);
      else if (newStatus === 'REPROGRAMADO') upd = await api.rescheduleManagedWO(WO_ID);
      if (upd) { toast.success('Status updated: ' + newStatus); setSelectedOT(upd); fetchOTs(); }
    } catch(e) { toast.error('Error: ' + (e.message || '')); }
  };

  // Only approved WRs (VALIDATED status)
  const approvedWRs = useMemo(() =>
    workRequests.filter(wr => ['VALIDATED', 'APROBADO', 'APPROVED'].includes(wr.status)),
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
      fetchData();
      // Navigate to scheduling tab to see the new OT
      if (onNavigateTab) onNavigateTab('scheduling');
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
        {/* Tab selector */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('ots')} className={'px-4 py-2 text-sm font-medium border-b-2 transition-colors ' + (activeTab === 'ots' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500 hover:text-gray-700')}>
          Work Orders ({managedWOs.length})
        </button>
        <button onClick={() => setActiveTab('backlog')} className={'px-4 py-2 text-sm font-medium border-b-2 transition-colors ' + (activeTab === 'backlog' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500 hover:text-gray-700')}>
          Notifications ({approvedWRs.length})
        </button>
      </div>

      {/* OTs Tab */}
      {activeTab === 'ots' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Work Orders</h3>
            <span className="text-sm text-gray-400">{managedWOs.length} WOs</span>
          </div>
          {managedWOs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No work orders yet</p>
              <p className="text-xs mt-1">Create WOs from approved notifications</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left">WO #</th>
                  <th className="px-4 py-3 text-left">Equipment</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {managedWOs.map((wo, i) => {
                    const STATUS_COLORS = { CREADO: 'bg-gray-100 text-gray-700', PLANIFICADO: 'bg-blue-100 text-blue-700', PROGRAMADO: 'bg-indigo-100 text-indigo-700', EN_EJECUCION: 'bg-amber-100 text-amber-700', CERRADO: 'bg-green-100 text-green-700', CANCELADO: 'bg-red-100 text-red-700', REPROGRAMADO: 'bg-purple-100 text-purple-700' };
                    const STATUS_LABELS = { CREADO: 'Created', PLANIFICADO: 'Planned', PROGRAMADO: 'Scheduled', EN_EJECUCION: 'In Execution', CERRADO: 'Closed', CANCELADO: 'Cancelled', REPROGRAMADO: 'Rescheduled' };
                    const NEXT = { CREADO: ['PLANIFICADO', 'Plan'], PLANIFICADO: ['PROGRAMADO', 'Schedule'], PROGRAMADO: ['EN_EJECUCION', 'Start Execution'], EN_EJECUCION: ['CERRADO', 'Close'], REPROGRAMADO: ['PROGRAMADO', 'Reschedule'] };
                    const next = NEXT[wo.status];
                    return (
                      <tr key={wo.wo_id || i} className="border-t border-gray-100 hover:bg-blue-50/30 cursor-pointer" onClick={() => setSelectedOT(wo)}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{wo.wo_number}{wo.is_fast_track && <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1 rounded">FT</span>}</td>
                        <td className="px-4 py-3 text-xs">{wo.equipment_tag || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{wo.description || wo.failure_description || '—'}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{wo.wo_type || '—'}</span></td>
                        <td className="px-4 py-3"><PriorityLabel priority={wo.priority_code || wo.priority} /></td>
                        <td className="px-4 py-3"><span className={'text-xs px-2 py-0.5 rounded font-semibold ' + (STATUS_COLORS[wo.status] || 'bg-gray-100')}>{STATUS_LABELS[wo.status] || wo.status}</span></td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          {next && <button onClick={() => changeOTStatus(wo, next[0])} className="text-xs px-2 py-1 rounded bg-[#1B5E20] text-white hover:bg-[#2E7D32] font-medium">{next[1]}</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WR Backlog Tab */}
      {activeTab === "backlog" && (<>
      <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Approved Notifications - Planning Backlog</h3>
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
    </>)}

      {/* OT Detail Modal */}
      {selectedOT && (() => { const wo = selectedOT; const SAP = { CREADO: {label:'Created',color:'bg-gray-100 text-gray-700'}, PLANIFICADO: {label:'Planned',color:'bg-blue-100 text-blue-700'}, PROGRAMADO: {label:'Scheduled',color:'bg-indigo-100 text-indigo-700'}, EN_EJECUCION: {label:'In Execution',color:'bg-amber-100 text-amber-700'}, CERRADO: {label:'Closed',color:'bg-green-100 text-green-700'}, CANCELADO: {label:'Cancelled',color:'bg-red-100 text-red-700'} }; const s = SAP[wo.status] || {label:wo.status,color:'bg-gray-100'}; const NEXT = { CREADO:[['PLANIFICADO','Plan','bg-blue-600 text-white']], PLANIFICADO:[['PROGRAMADO','Schedule','bg-indigo-600 text-white']], PROGRAMADO:[['EN_EJECUCION','Start Execution','bg-amber-500 text-white'],['REPROGRAMADO','Reschedule','bg-orange-500 text-white']], EN_EJECUCION:[['CERRADO','Close','bg-green-600 text-white']], REPROGRAMADO:[['PROGRAMADO','Reschedule','bg-indigo-600 text-white']] }; const actions = NEXT[wo.status] || []; const ALL = ['CREADO','PLANIFICADO','PROGRAMADO','EN_EJECUCION','CERRADO']; return (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOT(null)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl flex items-center justify-between"><div><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-lg font-bold text-blue-700">{wo.wo_number}</span><span className={'text-xs px-2 py-0.5 rounded font-semibold '+s.color}>{s.label}</span><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{wo.wo_type||''}</span>{wo.is_fast_track&&<span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">FAST TRACK</span>}</div><p className="text-sm text-gray-500 mt-0.5">{wo.equipment_tag||'No equipment'}</p></div><button onClick={() => setSelectedOT(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button></div><div className="px-6 py-5 space-y-4"><div><label className="text-xs font-semibold text-gray-500 uppercase">Description</label><p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{wo.description||wo.failure_description||'No description'}</p></div><div className="grid grid-cols-3 gap-3"><div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-[10px] text-blue-600 font-semibold uppercase">Planned Hrs</div><div className="text-lg font-bold text-blue-700">{wo.estimated_hours||'0'}h</div></div><div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-[10px] text-green-600 font-semibold uppercase">Actual Hrs</div><div className="text-lg font-bold text-green-700">{wo.actual_hours||'0'}h</div></div><div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-[10px] text-purple-600 font-semibold uppercase">Budget</div><div className="text-lg font-bold text-purple-700">${wo.estimated_budget||'0'}</div></div></div><div><label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">SAP Flow</label><div className="flex items-center gap-1 text-xs flex-wrap">{ALL.map((st,i) => (<span key={st} className="flex items-center gap-1"><span className={'px-2 py-1 rounded font-semibold '+(wo.status===st?((SAP[st]?.color||'')+' ring-2 ring-offset-1 ring-current'):'bg-gray-100 text-gray-400')}>{SAP[st]?.label}</span>{i<ALL.length-1&&<span className="text-gray-300">{'>'}</span>}</span>))}</div></div>{actions.length>0 ? (<div className="flex items-center gap-3 flex-wrap mt-2">{actions.map(([st,lbl,cls]) => (<button key={st} onClick={() => changeOTStatus(wo, st)} className={'px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90 '+cls}>{lbl}</button>))}<button onClick={() => changeOTStatus(wo, 'CANCELADO')} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button></div>) : (<p className="text-xs text-gray-400 italic">Final status — no transitions</p>)}{wo.execution_notes && <div><label className="text-xs font-semibold text-gray-500 uppercase">Execution History</label><pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans mt-1 bg-gray-50 rounded-lg p-3">{typeof wo.execution_notes === 'string' ? wo.execution_notes : JSON.stringify(wo.execution_notes, null, 2)}</pre></div>}</div></div></div>); })()}

  </div>
    </div>
  );
}
