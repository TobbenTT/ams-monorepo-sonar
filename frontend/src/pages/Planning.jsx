import { useState, useEffect, useMemo } from 'react';
import CapacityEvaluation from '../components/CapacityEvaluation';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, Download, AlertCircle, Plus, XCircle, Ban,
  X, Save, MapPin, Users, Wrench, Building2, FileText, Tag, Trash2, DollarSign, List, Package, Info, MessageSquare, Play, CheckCircle, ClipboardCheck
} from 'lucide-react';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';

const PRIORITY_COLORS = {
  P1: 'text-red-600 font-bold',
  P2: 'text-orange-600 font-semibold',
  P3: 'text-yellow-600',
  P4: 'text-blue-600',
};
const PRIORITY_LABELS = { P1: 'Inmediata', P2: 'Alta', P3: 'Media', P4: 'Baja' };

function PriorityLabel({ priority }) {
  const p = String(priority || 'P3');
  return <span className={PRIORITY_COLORS[p] || 'text-gray-500'}>{PRIORITY_LABELS[p] || p}</span>;
}

/* ── BBP Constants ── */
const PLANNING_GROUPS = [
  { value: 'P01', label: 'P01 - Planta Area Seca' },
  { value: 'P02', label: 'P02 - Planta Area Ripio' },
  { value: 'P03', label: 'P03 - Planta Area Humeda' },
  { value: 'M01', label: 'M01 - Mina Perforacion' },
  { value: 'M02', label: 'M02 - Mina Tronadura' },
  { value: 'M03', label: 'M03 - Mina Carguio' },
  { value: 'M04', label: 'M04 - Mina Transporte' },
  { value: 'M05', label: 'M05 - Mina Apoyo' },
];
const WORK_CENTERS = [
  { value: 'PASMEC01', label: 'Mecanico Area Seca', group: 'P01' },
  { value: 'PASELE01', label: 'Electrico Area Seca', group: 'P01' },
  { value: 'PHUMEC01', label: 'Mecanico Area Humeda', group: 'P03' },
  { value: 'PHUELE01', label: 'Electrico Area Humeda', group: 'P03' },
  { value: 'PRIPMEC1', label: 'Mecanico Area Ripio', group: 'P02' },
  { value: 'PRIPELE1', label: 'Electrico Area Ripio', group: 'P02' },
  { value: 'MPCMEC01', label: 'Mecanico Perforacion', group: 'M01' },
  { value: 'MPCELE01', label: 'Electrico Perforacion', group: 'M01' },
  { value: 'MTRMEC01', label: 'Mecanico Tronadura', group: 'M02' },
  { value: 'MCTMEC01', label: 'Mecanico Carguio/Transporte', group: 'M03' },
  { value: 'MCTELE01', label: 'Electrico Carguio/Transporte', group: 'M03' },
  { value: 'MAPMEC01', label: 'Mecanico Apoyo Mina', group: 'M05' },
  { value: 'MAPELE01', label: 'Electrico Apoyo Mina', group: 'M05' },
];
const AREAS_EMPRESA = [
  { value: 'SEC', label: 'SEC - Area Seca' },
  { value: 'HUM', label: 'HUM - Area Humeda' },
  { value: 'RIP', label: 'RIP - Area Ripio' },
  { value: 'PER', label: 'PER - Perforacion' },
  { value: 'CAR', label: 'CAR - Carguio' },
  { value: 'TRA', label: 'TRA - Transporte' },
  { value: 'APO', label: 'APO - Apoyo Mina' },
  { value: 'AUX', label: 'AUX - Auxiliar Planta' },
  { value: 'TAL', label: 'TAL - Taller' },
];

export default function Planning({ onNavigateTab, viewMode, autoOpenWoId, onClearAutoOpenWo }) {
  const { plant } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ots');
  const [managedWOs, setManagedWOs] = useState([]);
  const [wosLoading, setWosLoading] = useState(false);
  const [workRequests, setWorkRequests] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [otActionLoading, setOtActionLoading] = useState(null);
  const [selectedWR, setSelectedWR] = useState(null); // inline detail modal
  const [selectedOT, setSelectedOT] = useState(null);
  const [otModalTab, setOtModalTab] = useState('resumen');
  const [editOps, setEditOps] = useState([]);
  const [editMats, setEditMats] = useState([]);
  const [editBudget, setEditBudget] = useState({ labor: '', material: '', external: '' });
  const [editDates, setEditDates] = useState({ start: '', end: '' });
  const [savingOT, setSavingOT] = useState(false);
  const [execData, setExecData] = useState({ actual_hours: '', observations: '', materials_used: [] });
  const [closingWithAI, setClosingWithAI] = useState(false);
  const [aiCloseResult, setAiCloseResult] = useState(null);

  // Init edit state when OT changes
  useEffect(() => {
    if (selectedOT) {
      setEditOps(selectedOT.operations || []);
      setEditMats(selectedOT.materials || []);
      setEditBudget({ labor: selectedOT.planned_labor || '', material: selectedOT.planned_material || '', external: selectedOT.planned_external || '' });
      setEditDates({ start: selectedOT.planned_start || '', end: selectedOT.planned_end || '' });
    }
  }, [selectedOT?.wo_id]);

  const saveOTChanges = async () => {
    if (!selectedOT) return;
    setSavingOT(true);
    try {
      await api.updateManagedWO(selectedOT.wo_id, {
        operations: editOps,
        materials: editMats,
        planned_labor: parseFloat(editBudget.labor) || 0,
        planned_material: parseFloat(editBudget.material) || 0,
        planned_external: parseFloat(editBudget.external) || 0,
        planned_start: editDates.start || null,
        planned_end: editDates.end || null,
      });
      toast.success('OT actualizada');
      fetchData();
    } catch(e) { toast.error('Error: ' + (e.message || '')); }
    finally { setSavingOT(false); }
  };

  // Auto-open OT modal when navigated from another tab
  useEffect(() => {
    if (autoOpenWoId && managedWOs.length > 0) {
      const found = managedWOs.find(wo => wo.wo_id === autoOpenWoId || wo.wo_number === autoOpenWoId);
      if (found) {
        setSelectedOT(found);
        setActiveTab('ots');
        onClearAutoOpenWo?.();
      }
    }
  }, [autoOpenWoId, managedWOs]);
  const [createdOT, setCreatedOT] = useState(null); // OT created from this WR
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const isPlanner = viewMode === 'planner';
  const isSupervisor = viewMode === 'supervisor';

  const fetchData = () => {
    setLoading(true);
    setWosLoading(true);
    api.listManagedWOs({ plant_id: plant, limit: 100 })
      .then(res => setManagedWOs(Array.isArray(res) ? res : (res?.items || [])))
      .catch(() => {})
      .finally(() => setWosLoading(false));
    api.listWorkRequests({ plant_id: plant }).then(res => {
      const wrs = Array.isArray(res) ? res : res?.items || [];
      setWorkRequests(wrs);
    }).catch(() => setWorkRequests([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [plant]);

  // Only VALIDATED WRs
  const approvedWRs = useMemo(() => workRequests.filter(wr => ['VALIDATED', 'APROBADO', 'APPROVED'].includes(wr.status)), [workRequests]);
  const filteredWRs = useMemo(() => {
    if (priorityFilter === 'All') return approvedWRs;
    return approvedWRs.filter(wr => (wr.priority || wr.priority_code) === priorityFilter);
  }, [approvedWRs, priorityFilter]);

  const kpis = useMemo(() => {
    const total = approvedWRs.length;
    const p1 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P1').length;
    const p2 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P2').length;
    const withPlanGroup = approvedWRs.filter(wr => wr.planning_group).length;
    const avgAge = total > 0
      ? Math.round(approvedWRs.reduce((sum, wr) => {
          const c = wr.created_at ? new Date(wr.created_at).getTime() : Date.now();
          return sum + (Date.now() - c) / 86400000;
        }, 0) / total) : 0;
    return { total, urgent: p1 + p2, p1, p2, avgAge, withPlanGroup };
  }, [approvedWRs]);

  const paginatedWRs = useMemo(() => filteredWRs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredWRs, page]);
  const totalPages = Math.ceil(filteredWRs.length / PAGE_SIZE);

  /* ── Open detail modal ── */
  const openDetail = (wr) => {
    setSelectedWR(wr);
    setCreatedOT(null);
    setEditFields({
      planning_group: wr.planning_group || '',
      work_center: wr.work_center || '',
      area_empresa: wr.area_empresa || '',
      aviso_coding: wr.aviso_coding || '',
      priority: wr.priority || wr.priority_code || 'P3',
    });
  };

  /* ── Save planning fields ── */
  const savePlanningFields = async () => {
    if (!selectedWR) return;
    const wrId = selectedWR.work_request_id || selectedWR.request_id;
    setSaving(true);
    try {
      await api.updateWorkRequest(wrId, editFields);
      toast.success('Datos de planificacion guardados');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  /* ── Actions ── */
  const handleCreateOT = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_ot');
    try {
      // 1. Save planning fields to WR first
      if (editFields.planning_group || editFields.work_center || editFields.priority) {
        await api.updateWorkRequest(wrId, {
          planning_group: editFields.planning_group || wr.planning_group || '',
          work_center: editFields.work_center || wr.work_center || '',
          area_empresa: editFields.area_empresa || wr.area_empresa || '',
          aviso_coding: editFields.aviso_coding || wr.aviso_coding || '',
          priority_code: editFields.priority || wr.priority || wr.priority_code || 'P3',
        });
      }
      // 2. Create OT with updated data
      const res = await api.createWOFromWR({
        work_request_id: wrId,
        description: wr.problem_description?.original_text || wr.description || 'OT desde Aviso',
        wo_type: 'PM01',
        priority_code: editFields.priority || wr.priority || wr.priority_code || 'P3',
        equipment_tag: wr.equipment_tag || wr.asset_tag || '',
        equipment_id: wr.equipment_id || '',
        estimated_hours: wr.estimated_hours || 4,
        planning_group: editFields.planning_group || wr.planning_group || '',
        work_center: editFields.work_center || wr.work_center || '',
      });
      setCreatedOT(res);
      toast.success('OT creada: ' + (res?.wo_number || 'OK'));
      fetchData();
      // 3. Navigate to the new OT in Work Orders
      if (res?.wo_id) {
        setTimeout(() => navigate('/work-orders', { state: { openWoId: res.wo_id } }), 1200);
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo crear OT'));
    } finally { setActionLoading(null); }
  };

  const handleReject = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_reject');
    try {
      await api.validateWorkRequest(wrId, { action: 'REJECT', reason: 'Rechazado desde planificacion' });
      toast.success('Aviso rechazado');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo rechazar'));
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_cancel');
    try {
      await api.cancelWorkRequest(wrId, { reason: 'Cancelado desde planificacion' });
      toast.success('Aviso cancelado');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cancelar'));
    } finally { setActionLoading(null); }
  };

  const handleExport = () => {
    const headers = ['ID', 'Equipo', 'Descripcion', 'Prioridad', 'Grupo Plan.', 'Puesto Trabajo', 'Reportado por', 'Fecha', 'Dias'];
    const rows = filteredWRs.map(wr => {
      const created = wr.created_at ? new Date(wr.created_at) : null;
      const days = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000)) : 0;
      return [
        wr.work_request_id?.slice(0, 10) || wr.request_id?.slice(0, 10) || '',
        wr.equipment_tag || '', wr.problem_description?.original_text || wr.description || '',
        wr.priority || wr.priority_code || '', wr.planning_group || '', wr.work_center || '',
        wr.reported_by || wr.created_by || '', created ? created.toLocaleDateString() : '', days,
      ];
    });
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Avisos Aprobados', headers, rows }] }, `avisos_aprobados_${new Date().toISOString().slice(0, 10)}`);
    toast.success('Exportado ' + filteredWRs.length + ' avisos');
  };

  const changeOTStatus = async (wo, ns) => {
    const WO_ID = wo.wo_id;
    setOtActionLoading(ns);
    try {
      let upd;
      if (ns === 'CREADO' || ns === 'PENDIENTE')   upd = await api.draftManagedWO(WO_ID);
      else if (ns === 'PLANIFICADO' || ns === 'APROBADO') upd = await api.planManagedWO(WO_ID);
      else if (ns === 'PROGRAMADO')   upd = await api.scheduleManagedWO(WO_ID, {});
      else if (ns === 'REPROGRAMADO') upd = await api.rescheduleManagedWO(WO_ID);
      else if (ns === 'CANCELADO')    upd = await api.closeManagedWO(WO_ID);
      else if (ns === 'EN_EJECUCION' || ns === 'EN_PROGRESO') upd = await api.startManagedWO(WO_ID);
      else if (ns === 'CERRADO') {
        const hours = parseFloat(execData.actual_hours) || wo.actual_hours || 0;
        if (!hours || hours <= 0) {
          toast.error('Registre las horas reales en la tab Ejecucion antes de cerrar');
          setOtActionLoading(null);
          setOtModalTab('ejecucion');
          return;
        }
        upd = await api.completeManagedWO(WO_ID, { actual_hours: hours, execution_notes: execData.observations || '' });
      }
      if (upd) {
        toast.success('Estado actualizado: ' + ns);
        setSelectedOT(upd);
        fetchData();
      } else {
        toast.error('Transicion no permitida o WO no encontrada');
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cambiar estado'));
    } finally {
      setOtActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Role indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPlanner ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPlanner ? 'Vista Planificador' : 'Vista Supervisor'}
        </span>
        <span className="text-xs text-gray-400">
          {isPlanner ? 'Asignar grupo, puesto de trabajo y crear OTs' : 'Revisar backlog y prioridades — solo lectura'}
        </span>
        {isPlanner && (
          <button onClick={async () => {
            try {
              const wo = await api.draftManagedWO({
                plant_id: 'OCP-JFC1',
                wo_type: 'PM02',
                priority_code: 'P3',
                description: 'Nueva OT Preventiva',
                estimated_hours: 4,
              });
              toast.success('OT Preventiva ' + (wo.wo_number || wo.wo_id || '') + ' creada');
              fetchData();
            } catch (e) { toast.error('Error: ' + (e.message || '')); }
          }} className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
            + Nueva OT Preventiva
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-blue-400 border border-gray-200 p-5">
          <p className="text-sm text-blue-600 mb-1">Ordenes de Trabajo</p>
          <p className="text-3xl font-bold text-gray-900">{managedWOs.length}</p>
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
          <p className="text-sm text-gray-500 mb-1">Con Grupo Asignado</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.withPlanGroup}<span className="text-lg text-gray-400 ml-1">/ {kpis.total}</span></p>
        </div>
      </div>

      {/* Unified Filter */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ots')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ots' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Ordenes de Trabajo ({managedWOs.length})
        </button>
        <button
          onClick={() => setActiveTab('backlog')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'backlog' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Avisos ({workRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('capacidades')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'capacidades' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Capacidades
        </button>
      </div>

      {activeTab === "ots" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ordenes de Trabajo</h3>
            <span className="text-sm text-gray-400">{managedWOs.length} OTs</span>
          </div>
          {wosLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              Cargando OTs...
            </div>
          ) : managedWOs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-3 opacity-40">🔧</div>
              <p className="text-sm font-medium">No hay OTs registradas</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nro OT</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripcion</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridad</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Plan.</th>
                  </tr>
                </thead>
                <tbody>
                  {managedWOs.map((wo, i) => {
                    const SAP_STATUS = {
                      CREADO: { label: 'Creado', color: 'bg-yellow-100 text-yellow-700' },
                      PLANIFICADO: { label: 'Planificado', color: 'bg-blue-100 text-blue-700' },
                      PROGRAMADO: { label: 'Programado', color: 'bg-indigo-100 text-indigo-700' },
                      REPROGRAMADO: { label: 'Reprogramado', color: 'bg-orange-100 text-orange-700' },
                      EN_EJECUCION: { label: 'En Ejecucion', color: 'bg-amber-100 text-amber-700' },
                      CERRADO: { label: 'Cerrado', color: 'bg-green-100 text-green-700' },
                      CANCELADO: { label: 'Cancelado', color: 'bg-gray-300 text-gray-600' },
                      PENDIENTE: { label: 'Creado', color: 'bg-yellow-100 text-yellow-700' },
                      APROBADO: { label: 'Planificado', color: 'bg-blue-100 text-blue-700' },
                      EN_PROGRESO: { label: 'En Ejecucion', color: 'bg-amber-100 text-amber-700' },
                    };
                    const TYPE_LABEL = {
                      PM01: 'PM01', PM02: 'PM02', PM03: 'PM03', PM05: 'PM05',
                    };
                    const s = SAP_STATUS[wo.status] || { label: wo.status, color: 'bg-gray-100 text-gray-600' };
                    const pColor = { P1: 'text-red-600 font-bold', P2: 'text-orange-600 font-semibold', P3: 'text-yellow-600', P4: 'text-blue-600' };
                    return (
                      <tr key={wo.wo_id || i} className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => setSelectedOT(wo)}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{wo.wo_number}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{TYPE_LABEL[wo.wo_type] || wo.wo_type || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">{wo.equipment_tag || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{wo.description || wo.failure_description || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${pColor[wo.priority_code||wo.priority] || 'text-gray-500'}`}>{wo.priority_code||wo.priority||'—'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {wo.planned_start ? new Date(wo.planned_start).toLocaleDateString('es', { day: '2-digit', month: 'short' }) : '—'}
                        </td>
                        <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                          <button onClick={async () => {
                            if (!confirm(`¿Eliminar ${wo.wo_number}?`)) return;
                            try { await api.deleteManagedWO(wo.wo_id); toast.success('OT eliminada'); fetchData(); }
                            catch(e) { toast.error('Error al eliminar'); }
                          }} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors" title="Eliminar OT">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {activeTab === 'backlog' && (
        <div>

      {/* Title */}
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
              priorityFilter === opt ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grupo Plan.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Puesto Trabajo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dias</th>
                {isPlanner && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedWRs.map(wr => {
                const wrId = wr.work_request_id || wr.request_id || '';
                const displayId = 'WN-' + wrId.slice(0, 6);
                const priority = wr.priority || wr.priority_code || 'P3';
                const desc = wr.problem_description?.original_text || wr.description || '';
                const created = wr.created_at ? new Date(wr.created_at) : null;
                const days = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000)) : 0;
                const isLoading = actionLoading && actionLoading.startsWith(wrId);
                const hasPlanData = wr.planning_group && wr.work_center;

                return (
                  <tr key={wrId}
                    className={`border-b border-gray-50 transition-colors cursor-pointer ${
                      !hasPlanData && isPlanner ? 'hover:bg-yellow-50/50 bg-yellow-50/20' : 'hover:bg-emerald-50/50'
                    }`}
                    onClick={() => openDetail(wr)}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-700 font-medium">{displayId}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{wr.equipment_tag || '---'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={desc}>{desc || '---'}</td>
                    <td className="px-4 py-3"><PriorityLabel priority={priority} /></td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {wr.planning_group
                        ? <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{wr.planning_group}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {wr.work_center
                        ? <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{wr.work_center}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${days > 7 ? 'text-red-600' : days > 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {days}d
                      </span>
                    </td>
                    {isPlanner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <span className="text-[10px] text-blue-500 font-medium italic cursor-pointer hover:underline" onClick={() => navigate('/work-requests', { state: { openId: wr.id } })}>Ver detalle →</span>
                        </div>
                      </td>
                    )}
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
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredWRs.length)} de {filteredWRs.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ INLINE DETAIL MODAL ═══ */}
      {selectedWR && (() => {
        const wr = selectedWR;
        const wrId = wr.work_request_id || wr.request_id || '';
        const desc = wr.problem_description?.original_text || wr.description || '';
        const suggestedAction = wr.problem_description?.suggested_action || '';
        const created = wr.created_at ? new Date(wr.created_at) : null;
        const priority = wr.priority || wr.priority_code || 'P3';
        const filteredWCs = editFields.planning_group
          ? WORK_CENTERS.filter(wc => wc.group === editFields.planning_group)
          : WORK_CENTERS;

        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedWR(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-blue-700">WN-{wrId.slice(0, 6)}</span>
                    <PriorityLabel priority={priority} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isPlanner ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isPlanner ? 'Planificador' : 'Supervisor'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{wr.equipment_tag || 'Sin equipo'} · {created ? created.toLocaleDateString() : '---'}</p>
                </div>
                <button onClick={() => setSelectedWR(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Descripcion del Problema
                  </label>
                  <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{desc || 'Sin descripcion'}</p>
                </div>

                {suggestedAction && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accion Sugerida</label>
                    <p className="text-sm text-emerald-700 mt-1 bg-emerald-50 rounded-lg p-3">{suggestedAction}</p>
                  </div>
                )}

                {/* OT Created confirmation */}
                {createdOT && (
                  <div className="border-2 border-emerald-300 rounded-xl p-4 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h4 className="text-sm font-bold text-emerald-800">Orden de Trabajo Creada</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Número OT</div>
                        <div className="text-xl font-bold font-mono text-emerald-700">{createdOT.wo_number || createdOT.id?.slice(0,8)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Estado</div>
                        <div className="text-sm font-semibold text-emerald-700">Pendiente de Scheduling</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Materials */}
                {wr.materials && wr.materials.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materiales SAP</label>
                    <div className="mt-1 space-y-1">
                      {wr.materials.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-3 py-1.5 border border-gray-100">
                          <span className="font-mono text-emerald-700 font-semibold">{typeof m === 'string' ? m : m.sapId || '—'}</span>
                          {typeof m !== 'string' && m.description && <span className="text-gray-600">— {m.description}</span>}
                          {typeof m !== 'string' && m.quantity && <span className="ml-auto text-gray-400">{m.quantity} {m.unit || 'UD'}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {wr.resources && wr.resources.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recursos</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {wr.resources.map((r, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded px-2 py-1">
                          {typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1} (${r.hours || 0}h)`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Reportado por</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.reported_by || wr.created_by || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Tipo Notificacion</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.notification_type || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Codificacion</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.aviso_coding || '---'}</div>
                  </div>
                </div>

                {/* ── Planner: Editable BBP fields ── */}
                {isPlanner ? (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Datos de Planificacion (Editable)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Grupo Planificacion</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.planning_group}
                          onChange={e => {
                            setEditFields(f => ({ ...f, planning_group: e.target.value, work_center: '' }));
                          }}>
                          <option value="">— Seleccionar —</option>
                          {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Puesto de Trabajo</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.work_center}
                          onChange={e => setEditFields(f => ({ ...f, work_center: e.target.value }))}>
                          <option value="">— Seleccionar —</option>
                          {filteredWCs.map(wc => <option key={wc.value} value={wc.value}>{wc.value} - {wc.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Area Empresa</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.area_empresa}
                          onChange={e => setEditFields(f => ({ ...f, area_empresa: e.target.value }))}>
                          <option value="">— Seleccionar —</option>
                          {AREAS_EMPRESA.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Prioridad</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.priority}
                          onChange={e => setEditFields(f => ({ ...f, priority: e.target.value }))}>
                          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{k} - {v}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-blue-200">
                      <button onClick={savePlanningFields} disabled={!!saving || !!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar
                      </button>
                      <button onClick={() => handleCreateOT(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        {actionLoading?.endsWith('_ot') ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        Crear OT
                      </button>
                      <button onClick={() => handleReject(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                      <button onClick={() => handleCancel(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors disabled:opacity-50">
                        <Ban className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Supervisor: Read-only view ── */
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Datos de Planificacion (Solo lectura)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Grupo Planificacion', value: wr.planning_group, icon: MapPin },
                        { label: 'Puesto de Trabajo', value: wr.work_center, icon: Wrench },
                        { label: 'Area Empresa', value: wr.area_empresa, icon: Building2 },
                        { label: 'Prioridad', value: `${priority} - ${PRIORITY_LABELS[priority] || priority}`, icon: Tag },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] text-gray-400 uppercase">{label}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">Sin asignar</span>}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
        </div>
      )}
      {/* OT DETAIL MODAL */}
      {selectedOT && (() => {
        const wo = selectedOT;
        const SAP = {
          CREADO:{label:'Creado',color:'bg-yellow-100 text-yellow-700'},
          PLANIFICADO:{label:'Planificado',color:'bg-blue-100 text-blue-700'},
          PROGRAMADO:{label:'Programado',color:'bg-indigo-100 text-indigo-700'},
          REPROGRAMADO:{label:'Reprogramado',color:'bg-orange-100 text-orange-700'},
          EN_EJECUCION:{label:'En Ejecucion',color:'bg-amber-100 text-amber-700'},
          CERRADO:{label:'Cerrado',color:'bg-green-100 text-green-700'},
          CANCELADO:{label:'Cancelado',color:'bg-gray-300 text-gray-600'},
          PENDIENTE:{label:'Creado',color:'bg-yellow-100 text-yellow-700'},
          APROBADO:{label:'Planificado',color:'bg-blue-100 text-blue-700'},
          EN_PROGRESO:{label:'En Ejecucion',color:'bg-amber-100 text-amber-700'},
        };
        const NEXT = {
          CREADO:[['PLANIFICADO','Planificar','bg-blue-600 text-white hover:bg-blue-700'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          PLANIFICADO:[['PROGRAMADO','Programar','bg-indigo-600 text-white hover:bg-indigo-700'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          PROGRAMADO:[['EN_EJECUCION','Iniciar Ejecucion','bg-amber-500 text-white hover:bg-amber-600'],['REPROGRAMADO','Reprogramar','bg-orange-500 text-white hover:bg-orange-600'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          REPROGRAMADO:[['PROGRAMADO','Reprogramar','bg-indigo-600 text-white hover:bg-indigo-700'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          EN_EJECUCION:[['CERRADO','Cerrar','bg-green-600 text-white hover:bg-green-700'],['REPROGRAMADO','Reprogramar','bg-orange-500 text-white hover:bg-orange-600']],
          CERRADO:[],
          CANCELADO:[],
          PENDIENTE:[['PLANIFICADO','Planificar','bg-blue-600 text-white hover:bg-blue-700'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          APROBADO:[['PROGRAMADO','Programar','bg-indigo-600 text-white hover:bg-indigo-700'],['EN_EJECUCION','Iniciar','bg-amber-500 text-white hover:bg-amber-600'],['CANCELADO','Cancelar','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          EN_PROGRESO:[['CERRADO','Cerrar','bg-green-600 text-white hover:bg-green-700']],
        };
        const TLBL = {PM01:'PM01',PM02:'PM02',PM03:'PM03',PM05:'PM05'};
        const s = SAP[wo.status] || {label:wo.status,color:"bg-gray-100 text-gray-600"};
        const actions = NEXT[wo.status] || [];
        const ALL = ['CREADO','PLANIFICADO','PROGRAMADO','EN_EJECUCION','CERRADO'];

        const OT_TABS = [
          { id: 'resumen', label: 'Resumen', icon: Info },
          { id: 'operaciones', label: 'Operaciones', icon: List },
          { id: 'ejecucion', label: 'Ejecucion', icon: Play, show: ['EN_EJECUCION','CERRADO','EN_PROGRESO'].includes(wo.status) },
          { id: 'materiales', label: 'Materiales', icon: Package },
          { id: 'costos', label: 'Costos', icon: DollarSign },
          { id: 'historial', label: 'Historial', icon: MessageSquare },
        ].filter(t => t.show === undefined || t.show);

        const ops = wo.operations || [];
        const costCats = [
          { key: 'labor', label: 'Mano de Obra', plan: wo.planned_labor || (wo.estimated_budget||0)*0.5, real: wo.actual_labor || 0, color: 'blue' },
          { key: 'material', label: 'Materiales', plan: wo.planned_material || (wo.estimated_budget||0)*0.3, real: wo.actual_material || 0, color: 'amber' },
          { key: 'external', label: 'Externo', plan: wo.planned_external || (wo.estimated_budget||0)*0.2, real: wo.actual_external || 0, color: 'purple' },
        ];
        const totalPlan = costCats.reduce((s,c2) => s+c2.plan, 0) || wo.estimated_budget || 0;
        const totalReal = costCats.reduce((s,c2) => s+c2.real, 0);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOT(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

              {/* HEADER */}
              <div className="border-b px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-gray-900">{wo.wo_number}</h2>
                      <span className={"text-xs px-2.5 py-1 rounded font-semibold "+s.color}>{s.label}</span>
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{TLBL[wo.wo_type]||wo.wo_type||""}</span>
                      {wo.is_fast_track && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">FAST TRACK</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{wo.equipment_tag||"Sin equipo"} {wo.priority_code ? "\• "+wo.priority_code : ""}</p>
                  </div>
                  <button onClick={() => setSelectedOT(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex gap-1 mt-3 -mb-4">
                  {OT_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setOtModalTab(tab.id)}
                      className={"flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 transition-colors "+(otModalTab === tab.id ? "bg-white text-blue-700 border-gray-200" : "bg-gray-50 text-gray-500 border-transparent hover:text-gray-700")}>
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* RESUMEN */}
                {otModalTab === 'resumen' && (
                  <div className="space-y-4">
                    {wo.priority_code && (() => {
                      const imp = { P1: { l: 'CRITICO', c: 'bg-red-50 border-red-300 text-red-800', s: 95 }, P2: { l: 'ALTO', c: 'bg-orange-50 border-orange-300 text-orange-800', s: 75 }, P3: { l: 'MEDIO', c: 'bg-yellow-50 border-yellow-300 text-yellow-800', s: 45 }, P4: { l: 'BAJO', c: 'bg-green-50 border-green-300 text-green-800', s: 20 } };
                      const d = imp[wo.priority_code] || imp.P3;
                      return <div className={"rounded-xl p-4 border-2 flex items-center justify-between "+d.c}>
                        <div><div className="text-xs font-bold uppercase">Impacto Productivo</div><div className="text-lg font-bold">{d.l}</div></div>
                        <div className="text-3xl font-black">{d.s}</div>
                      </div>;
                    })()}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Descripcion</label>
                      <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{wo.description||wo.failure_description||"Sin descripcion"}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-[10px] text-blue-600 font-semibold uppercase">Horas Plan.</div><div className="text-lg font-bold text-blue-700">{wo.estimated_hours||"0"}h</div></div>
                      <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-[10px] text-green-600 font-semibold uppercase">Horas Real</div><div className="text-lg font-bold text-green-700">{wo.actual_hours||execData.actual_hours||"0"}h</div></div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-[10px] text-purple-600 font-semibold uppercase">Costo Plan</div><div className="text-lg font-bold text-purple-700">${totalPlan.toFixed(0)}</div></div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center"><div className="text-[10px] text-amber-600 font-semibold uppercase">Costo Real</div><div className="text-lg font-bold text-amber-700">${totalReal.toFixed(0)}</div></div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Flujo SAP</label>
                      <div className="flex items-center gap-1 text-xs flex-wrap">
                        {ALL.map((st,i) => (
                          <span key={st} className="flex items-center gap-1">
                            <span className={"px-2 py-1 rounded font-semibold "+(wo.status===st?((SAP[st]?.color||"")+" ring-2 ring-offset-1 ring-current"):"bg-gray-100 text-gray-400")}>{SAP[st]?.label}</span>
                            {i<ALL.length-1&&<span className="text-gray-300">\›</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* OPERACIONES */}
                {otModalTab === 'operaciones' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Operaciones / Pasos de Trabajo</h3>
                      <button type="button" onClick={() => setEditOps(prev => [...prev, { type: 'INT', description: '', specialty: 'Mecanico', quantity: 1, hours: 4 }])}
                        className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">+ Agregar</button>
                    </div>
                    {editOps.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">Sin operaciones</p>
                        <p className="text-xs">Click "+ Agregar" para crear pasos de trabajo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editOps.map((op, idx) => (
                          <div key={idx} className={"rounded-lg border p-3 "+(op.type === 'EXT' ? "border-purple-200 bg-purple-50/30" : "border-gray-200")}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-gray-400 w-5">#{idx+1}</span>
                              <select value={op.type || 'INT'} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], type: e.target.value}; setEditOps(n); }}
                                className="text-xs border rounded px-2 py-1 w-16 font-bold">
                                <option value="INT">INT</option><option value="EXT">EXT</option>
                              </select>
                              <input value={op.description || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], description: e.target.value}; setEditOps(n); }}
                                className="flex-1 text-sm border rounded px-2 py-1" placeholder="Descripcion de la operacion" />
                              <button type="button" onClick={() => setEditOps(prev => prev.filter((_,i) => i !== idx))}
                                className="text-red-400 hover:text-red-600 p-1">
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 ml-7">
                              <select value={op.specialty || 'Mecanico'} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], specialty: e.target.value}; setEditOps(n); }}
                                className="text-xs border rounded px-2 py-1">
                                {['Mecanico','Electrico','Instrumentista','Soldador','Lubricacion','Operador Grua','Andamiero','Supervisor','Otro'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">Cant:</label>
                                <input type="number" min="1" value={op.quantity || 1} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], quantity: parseInt(e.target.value)||1}; setEditOps(n); }}
                                  className="w-12 text-xs border rounded px-1 py-1 text-center" />
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">Horas:</label>
                                <input type="number" min="0" step="0.5" value={op.hours || 0} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], hours: parseFloat(e.target.value)||0}; setEditOps(n); }}
                                  className="w-14 text-xs border rounded px-1 py-1 text-center" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={saveOTChanges} disabled={savingOT}
                      className="w-full mt-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {savingOT ? 'Guardando...' : 'Guardar Operaciones'}
                    </button>
                  </div>
                )}


                {/* EJECUCION */}
                {otModalTab === 'ejecucion' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2"><ClipboardCheck size={16} /> Registro de Ejecucion</h3>
                      <p className="text-xs text-blue-600 mt-1">Complete los datos reales. Son obligatorios para cerrar la OT.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Horas Planificadas</label>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">{wo.estimated_hours || '0'}h</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Horas Reales Trabajadas *</label>
                        <input type="number" step="0.5" min="0" value={execData.actual_hours}
                          onChange={e => setExecData(prev => ({...prev, actual_hours: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 6.5" />
                      </div>
                    </div>
                    {execData.actual_hours && wo.estimated_hours && (() => {
                      const plan = parseFloat(wo.estimated_hours);
                      const real = parseFloat(execData.actual_hours);
                      const delta = real - plan;
                      const pct = plan > 0 ? Math.round((real/plan)*100) : 0;
                      const over = delta > 0;
                      return <div className={"rounded-lg p-3 border "+(over ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{pct}% del estimado</span>
                          <span className={"text-sm font-bold "+(over ? "text-red-600" : "text-green-600")}>{over ? "+" : ""}{delta.toFixed(1)}h {over ? "sobre" : "bajo"} estimado</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className={"h-2 rounded-full "+(over ? "bg-red-500" : "bg-green-500")} style={{width: Math.min(pct, 150)+"%"}} />
                        </div>
                      </div>;
                    })()}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-2">Materiales Utilizados</label>
                      {(wo.materials || []).length > 0 ? (
                        <div className="space-y-2">
                          {(wo.materials || []).map((mat, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border">
                              <div className="flex-1">
                                <span className="text-xs font-mono text-gray-500">{mat.sapId || mat.sap_id || ''}</span>
                                <span className="text-sm ml-2">{mat.description || mat.name || 'Material'}</span>
                              </div>
                              <div className="text-xs text-gray-500">Plan: {mat.quantity || 0} {mat.unit || 'PZ'}</div>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-400">Real:</label>
                                <input type="number" min="0" defaultValue={mat.quantity_used ?? mat.quantity ?? 0}
                                  className="w-16 border rounded px-2 py-1 text-xs text-center focus:ring-2 focus:ring-blue-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-3">Sin materiales planificados para esta OT</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Observaciones de Ejecucion</label>
                      <textarea rows={3} value={execData.observations}
                        onChange={e => setExecData(prev => ({...prev, observations: e.target.value}))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Hallazgos, problemas encontrados, trabajos adicionales..." />
                    </div>
                    {aiCloseResult && (
                      <div className={"rounded-xl p-4 border-2 "+(aiCloseResult.ready ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                        <div className="flex items-center gap-2 mb-2">
                          {aiCloseResult.ready ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                          <span className={"text-sm font-bold "+(aiCloseResult.ready ? "text-green-800" : "text-amber-800")}>
                            {aiCloseResult.ready ? "OT lista para cerrar" : "Revisar antes de cerrar"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 whitespace-pre-line">{aiCloseResult.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* COSTOS */}
                {otModalTab === 'materiales' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Materiales / Repuestos</h3>
                      <button type="button" onClick={() => setEditMats(prev => [...prev, { sapId: '', description: '', quantity: 1, unit: 'PZ', type: 'INT' }])}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Agregar</button>
                    </div>
                    {editMats.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">Sin materiales</p>
                        <p className="text-xs">Click "+ Agregar" para agregar repuestos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editMats.map((mat, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <input value={mat.sapId || ''} onChange={e => { const n = [...editMats]; n[idx].sapId = e.target.value; setEditMats(n); }}
                                className="w-24 text-xs border rounded px-2 py-1 font-mono" placeholder="SAP Code" />
                              <input value={mat.description || ''} onChange={e => { const n = [...editMats]; n[idx].description = e.target.value; setEditMats(n); }}
                                className="flex-1 text-sm border rounded px-2 py-1" placeholder="Material description" />
                              <button onClick={() => setEditMats(prev => prev.filter((_,i) => i !== idx))}
                                className="text-red-400 hover:text-red-600 text-xs px-1">x</button>
                            </div>
                            <div className="flex items-center gap-3">
                              <select value={mat.type || 'INT'} onChange={e => { const n = [...editMats]; n[idx].type = e.target.value; setEditMats(n); }}
                                className="text-xs border rounded px-2 py-1 w-16 font-bold">
                                <option value="INT">INT</option><option value="EXT">EXT</option>
                              </select>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">Qty:</label>
                                <input type="number" min="1" value={mat.quantity || 1} onChange={e => { const n = [...editMats]; n[idx].quantity = parseInt(e.target.value)||1; setEditMats(n); }}
                                  className="w-14 text-xs border rounded px-1 py-1 text-center" />
                              </div>
                              <select value={mat.unit || 'PZ'} onChange={e => { const n = [...editMats]; n[idx].unit = e.target.value; setEditMats(n); }}
                                className="text-xs border rounded px-2 py-1 w-16">
                                {['PZ','KG','LT','MT','UD','GL','M3'].map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={saveOTChanges} disabled={savingOT}
                      className="w-full mt-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {savingOT ? 'Guardando...' : 'Guardar Materiales'}
                    </button>
                  </div>
                )}

                {otModalTab === 'costos' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800">Control de Costos</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <label className="text-xs font-semibold text-blue-700 block mb-2">Fechas Planificadas</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-500">Inicio</label>
                          <input type="date" value={editDates.start} onChange={e => setEditDates(p => ({...p, start: e.target.value}))}
                            className="w-full text-xs border rounded px-2 py-1.5" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">Fin</label>
                          <input type="date" value={editDates.end} onChange={e => setEditDates(p => ({...p, end: e.target.value}))}
                            className="w-full text-xs border rounded px-2 py-1.5" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {costCats.map(cat => {
                        const delta = cat.real - cat.plan;
                        const over = delta > 0;
                        return (
                          <div key={cat.key} className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{cat.label}</span>
                              <span className={"text-xs font-bold "+(over ? "text-red-600" : delta < 0 ? "text-green-600" : "text-gray-500")}>
                                {delta !== 0 ? (over ? "+" : "") + "$" + Math.abs(delta).toFixed(0) : "\—"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div><span className="text-gray-500">Plan:</span> <span className="font-medium">${cat.plan.toFixed(0)}</span></div>
                              <div><span className="text-gray-500">Real:</span> <span className="font-medium">${cat.real.toFixed(0)}</span></div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-blue-800">Total</span>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Plan: ${totalPlan.toFixed(0)} | Real: ${totalReal.toFixed(0)}</div>
                          <div className={"text-sm font-bold "+(totalReal > totalPlan ? "text-red-600" : "text-green-600")}>
                            {totalReal > totalPlan ? "+" : ""}${(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* HISTORIAL */}
                {otModalTab === 'historial' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800">Historial de Ejecucion</h3>
                    {(() => {
                      let notes = wo.execution_notes;
                      if (!notes) return <p className="text-center text-gray-400 text-sm py-6">Sin notas de ejecucion registradas</p>;
                      if (typeof notes === 'string') {
                        try { notes = JSON.parse(notes); } catch(e) {
                          return <div className="bg-gray-50 rounded-lg p-3 border"><pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{notes}</pre></div>;
                        }
                      }
                      const items = Array.isArray(notes) ? notes : [notes];
                      return <div className="space-y-2">
                        {items.map((entry, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString('es', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</span>
                            </div>
                            <p className="text-xs text-gray-700">{entry.note || entry.message || JSON.stringify(entry)}</p>
                          </div>
                        ))}
                      </div>;
                    })()}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Creado: {wo.created_at ? new Date(wo.created_at).toLocaleString("es") : "\—"}</p>
                      {wo.planned_start && <p>Inicio planificado: {new Date(wo.planned_start).toLocaleString("es")}</p>}
                      {wo.planned_end && <p>Fin planificado: {new Date(wo.planned_end).toLocaleString("es")}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="border-t px-6 py-3 rounded-b-2xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs flex-wrap">
                  {ALL.map((st,i) => (
                    <span key={st} className="flex items-center gap-0.5">
                      <span className={"px-1.5 py-0.5 rounded font-semibold text-[10px] "+(wo.status===st ? (SAP[st]?.color||"") : "bg-gray-100 text-gray-400")}>{SAP[st]?.label}</span>
                      {i<ALL.length-1&&<span className="text-gray-300 text-[10px]">\›</span>}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {actions.length>0 ? actions.map(([st,lbl,cls]) => (
                    <button key={st} onClick={() => {
                      if (st === 'CERRADO' && !execData.actual_hours && ['EN_EJECUCION','EN_PROGRESO'].includes(wo.status)) {
                        setOtModalTab('ejecucion');
                        toast.error('Registre las horas reales antes de cerrar');
                        return;
                      }
                      changeOTStatus(wo, st);
                    }} disabled={!!otActionLoading} className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors "+cls+(otActionLoading===st?" opacity-60 cursor-wait":"")}>{otActionLoading===st?"...":lbl}</button>
                  )) : (
                    <span className="text-xs text-gray-400 italic">Estado final</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'capacidades' && (
        <CapacityEvaluation />
      )}

    </div>
  );
}