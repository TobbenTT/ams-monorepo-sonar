import { useState, useEffect, useMemo } from 'react';
import CapacityEvaluation from '../components/CapacityEvaluation';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Download, AlertCircle, Plus, XCircle, Ban,
  X, Save, MapPin, Users, Wrench, Building2, FileText, Tag, Trash2, DollarSign, List, Package, Info, MessageSquare, Play, CheckCircle, ClipboardCheck, Search
} from 'lucide-react';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';

const PRIORITY_COLORS = {
  P1: 'text-red-600 font-bold',
  P2: 'text-orange-600 font-semibold',
  P3: 'text-yellow-600',
  P4: 'text-blue-600',
};
const PRIORITY_LABELS = { P1: 'Immediate', P2: 'High', P3: 'Medium', P4: 'Low' };

function PriorityLabel({ priority }) {
  const p = String(priority || 'P3');
  return <span className={PRIORITY_COLORS[p] || 'text-gray-500'}>{PRIORITY_LABELS[p] || p}</span>;
}

/* ── BBP Constants ── */
const PLANNING_GROUPS = [
  { value: 'P01', label: 'P01 - Plant GP Dry Area' },
  { value: 'P02', label: 'P02 - Plant GP Heap Leach' },
  { value: 'P03', label: 'P03 - Plant GP Wet Area' },
  { value: 'M01', label: 'M01 - Mine GP Drilling' },
  { value: 'M02', label: 'M02 - Mine GP Loading' },
  { value: 'M03', label: 'M03 - Mine GP Hauling' },
  { value: 'M04', label: 'M04 - Mine GP Support Equipment' },
  { value: 'M05', label: 'M05 - Mine GP Auxiliary Equipment' },
];
const WORK_CENTERS = [
  { value: 'PASMEC01', label: 'Mechanical Dry Area', group: 'P01' },
  { value: 'PASELE01', label: 'Electrical Dry Area', group: 'P01' },
  { value: 'PASINS01', label: 'Instrumentation Dry Area', group: 'P01' },
  { value: 'PASLUB01', label: 'Lubrication Dry Area', group: 'P01' },
  { value: 'PARELE01', label: 'Electrical Heap Leach', group: 'P02' },
  { value: 'PARINS01', label: 'Instrumentation Heap Leach', group: 'P02' },
  { value: 'PAHMEC01', label: 'Mechanical Wet Area', group: 'P03' },
  { value: 'PAHELE01', label: 'Electrical Wet Area', group: 'P03' },
  { value: 'PAHINS01', label: 'Instrumentation Wet Area', group: 'P03' },
  { value: 'PSHSIN01', label: 'Synoptic', group: 'P01' },
  { value: 'PSHDCS01', label: 'DCS & Automation', group: 'P01' },
  { value: 'MPCMEC01', label: 'Mechanical Drilling & Loading', group: 'M01' },
  { value: 'MTAMEC01', label: 'Mechanical Hauling & Support', group: 'M03' },
  { value: 'MPCELE01', label: 'Electrical Drilling & Loading', group: 'M01' },
  { value: 'MTAELE01', label: 'Electrical Hauling & Support', group: 'M03' },
  { value: 'MPREDI01', label: 'Predictive Mine', group: 'M01' },
  { value: 'MEXTSOL1', label: 'Welding (External)', group: 'M04' },
  { value: 'MEXTLAV1', label: 'Washing (External)', group: 'M04' },
  { value: 'MEXTNEU1', label: 'Tires (External)', group: 'M04' },
  { value: 'MAPELE01', label: 'Electrical Mine Support', group: 'M05' },
];
const WAREHOUSES = [
  { value: 'WH-001', label: 'WH-001 - Main Warehouse Plant' },
  { value: 'WH-002', label: 'WH-002 - Wet Area Storage' },
  { value: 'WH-003', label: 'WH-003 - Heavy Parts Yard' },
  { value: 'WH-004', label: 'WH-004 - Mine Workshop Store' },
  { value: 'WH-005', label: 'WH-005 - Emergency Spares' },
];
const AREAS_EMPRESA = [
  { value: 'SEC', label: 'SEC - Dry Area' },
  { value: 'HUM', label: 'HUM - Wet Area' },
  { value: 'RIP', label: 'RIP - Heap Leach' },
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
  const [expandedOps, setExpandedOps] = useState({});
  const [woSearch, setWoSearch] = useState("");
  const [woStatusFilter, setWoStatusFilter] = useState("All");
  const [woPriorityFilter, setWoPriorityFilter] = useState("All");
  const [woTypeFilter, setWoTypeFilter] = useState("All");

  const filteredWOs = useMemo(() => {
    let wos = managedWOs;
    if (woSearch) {
      const q = woSearch.toLowerCase();
      wos = wos.filter(wo => (wo.wo_number || "").toLowerCase().includes(q) || (wo.equipment_tag || "").toLowerCase().includes(q) || (wo.description || "").toLowerCase().includes(q));
    }
    if (woStatusFilter !== "All") wos = wos.filter(wo => wo.status === woStatusFilter);
    if (woPriorityFilter !== "All") wos = wos.filter(wo => (wo.priority_code || wo.priority) === woPriorityFilter);
    if (woTypeFilter !== "All") wos = wos.filter(wo => wo.wo_type === woTypeFilter);
    return wos;
  }, [managedWOs, woSearch, woStatusFilter, woPriorityFilter, woTypeFilter]);

  const [execData, setExecData] = useState({ actual_hours: '', observations: '', materials_used: [] });
  const [closingWithAI, setClosingWithAI] = useState(false);
  const [matSearchQuery, setMatSearchQuery] = useState('');
  const [matSearchResults, setMatSearchResults] = useState([]);
  const [matSearchLoading, setMatSearchLoading] = useState(false);
  const [activeMatIdx, setActiveMatIdx] = useState(null);

  // SAP Material autocomplete
  useEffect(() => {
    if (!matSearchQuery || matSearchQuery.length < 2) { setMatSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setMatSearchLoading(true);
      try {
        const res = await api.searchMaterials(matSearchQuery);
        setMatSearchResults(Array.isArray(res) ? res : []);
      } catch { setMatSearchResults([]); }
      finally { setMatSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [matSearchQuery]);

  const selectMaterial = (mat, idx) => {
    const n = [...editMats];
    n[idx] = { ...n[idx], sapId: mat.sapId, description: mat.description, unit: mat.unit || 'PZ' };
    setEditMats(n);
    setMatSearchQuery('');
    setMatSearchResults([]);
    setActiveMatIdx(null);
  };

  const [aiCloseResult, setAiCloseResult] = useState(null);


  // Auto-calculate costs from operations + materials
  const LABOR_RATE = 50; // $/hr default
  const calculatedCosts = useMemo(() => {
    const laborHours = editOps.reduce((sum, op) => sum + ((op.quantity || 1) * (op.hours || op.duration || 0)), 0);
    const laborCost = laborHours * LABOR_RATE;
    const materialCost = editMats.reduce((sum, m) => sum + ((m.quantity || 1) * (m.unit_price || 0)), 0);
    const externalCost = editOps.filter(op => op.type === 'EXT').reduce((sum, op) => sum + ((op.quantity || 1) * (op.hours || 0) * LABOR_RATE * 1.5), 0);
    return { laborHours, laborCost, materialCost, externalCost, total: laborCost + materialCost + externalCost };
  }, [editOps, editMats]);

  // Init edit state when OT changes
  useEffect(() => {
    if (selectedOT) {
      setEditOps(selectedOT.operations || []);
      setEditMats(selectedOT.materials || []);
      setEditBudget({ labor: selectedOT.planned_labor || '', material: selectedOT.planned_material || '', external: selectedOT.planned_external || '' });
      setEditDates({ start: selectedOT.planned_start || '', end: selectedOT.planned_end || '' });
    }
  }, [selectedOT?.wo_id]);


  const verifyAndClose = async (wo) => {
    setClosingWithAI(true);
    setAiCloseResult(null);
    try {
      const result = await api.verifyCloseManagedWO(wo.wo_id, {
        actual_hours: parseFloat(execData.actual_hours) || 0,
        observations: execData.observations || '',
        materials_used: execData.materials_used || [],
      });
      setAiCloseResult(result);
      if (result.ready) {
        // Auto-save execution data then close
        await api.updateManagedWO(wo.wo_id, {
          actual_hours: parseFloat(execData.actual_hours) || 0,
          labor_cost: (parseFloat(execData.actual_hours) || 0) * LABOR_RATE,
        });
        toast.success('AI verification passed');
      }
    } catch (e) {
      toast.error('Verification error: ' + (e.message || ''));
    } finally {
      setClosingWithAI(false);
    }
  };

  const saveOTChanges = async () => {
    if (!selectedOT) return;
    setSavingOT(true);
    try {
      await api.updateManagedWO(selectedOT.wo_id, {
        operations: editOps,
        materials: editMats,
        labor_cost: calculatedCosts.laborCost || parseFloat(editBudget.labor) || 0,
        material_cost: calculatedCosts.materialCost || parseFloat(editBudget.material) || 0,
        external_cost: calculatedCosts.externalCost || parseFloat(editBudget.external) || 0,
        actual_total_cost: calculatedCosts.total || 0,
        estimated_hours: calculatedCosts.laborHours || undefined,
        planned_start: editDates.start || null,
        planned_end: editDates.end || null,
      });
      toast.success('WO updated');
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
      toast.success('Planning data saved');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not save'));
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
        description: wr.problem_description?.original_text || wr.description || 'WO from Notification',
        wo_type: 'PM01',
        priority_code: editFields.priority || wr.priority || wr.priority_code || 'P3',
        equipment_tag: wr.equipment_tag || wr.asset_tag || '',
        equipment_id: wr.equipment_id || '',
        estimated_hours: wr.estimated_hours || 4,
        planning_group: editFields.planning_group || wr.planning_group || '',
        work_center: editFields.work_center || wr.work_center || '',
      });
      setCreatedOT(res);
      toast.success('WO created: ' + (res?.wo_number || 'OK'));
      fetchData();
      // 3. Navigate to the new OT in Work Orders
      if (res?.wo_id) {
        setTimeout(() => navigate('/work-orders', { state: { openWoId: res.wo_id } }), 1200);
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not create WO'));
    } finally { setActionLoading(null); }
  };

  const handleReject = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_reject');
    try {
      await api.validateWorkRequest(wrId, { action: 'REJECT', reason: 'Rejected from planning' });
      toast.success('Notification rejected');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not reject'));
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_cancel');
    try {
      await api.cancelWorkRequest(wrId, { reason: 'Cancelled from planning' });
      toast.success('Notification cancelled');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not cancel'));
    } finally { setActionLoading(null); }
  };

  const handleExport = () => {
    const headers = ['ID', 'Equipment', 'Description', 'Priority', 'Planning Group', 'Work Center', 'Reported By', 'Date', 'Days'];
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
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Avisos Approveds', headers, rows }] }, `approved_notifications_${new Date().toISOString().slice(0, 10)}`);
    toast.success('Exported ' + filteredWRs.length + ' notifications');
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
      else if (ns === 'CANCELADO')    upd = await api.cancelManagedWO(WO_ID);
      else if (ns === 'EN_EJECUCION' || ns === 'EN_PROGRESO') upd = await api.startManagedWO(WO_ID);
      else if (ns === 'CERRADO') {
        const hours = parseFloat(execData.actual_hours) || wo.actual_hours || 0;
        if (!hours || hours <= 0) {
          toast.error('Record actual hours in Execution tab before closing');
          setOtActionLoading(null);
          setOtModalTab('ejecucion');
          return;
        }
        upd = await api.completeManagedWO(WO_ID, { actual_hours: hours, execution_notes: execData.observations || '' });
      }
      if (upd) {
        toast.success('Status updated: ' + ns);
        setSelectedOT(upd);
        fetchData();
      } else {
        toast.error('Transition not allowed or WO not found');
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not change status'));
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
          {isPlanner ? 'Planner View' : 'Supervisor View'}
        </span>
        <span className="text-xs text-gray-400">
          {isPlanner ? 'Assign group, work center and create WOs' : 'Review backlog and priorities — read only'}
        </span>
        {isPlanner && (
          <button onClick={async () => {
            try {
              const wo = await api.createManagedWO({
                plant_id: 'OCP-JFC1',
                wo_type: 'PM02',
                priority_code: 'P3',
                description: 'New Preventive WO',
                estimated_hours: 4,
              });
              toast.success('OT Preventiva ' + (wo.wo_number || wo.wo_id || '') + ' creada');
              fetchData();
            } catch (e) { toast.error('Error: ' + (e.message || '')); }
          }} className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
            + New Preventive WO
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border-l-4 border-l-blue-400 border border-gray-200 p-5">
          <p className="text-sm text-blue-600 mb-1">Work Orders</p>
          <p className="text-3xl font-bold text-gray-900">{managedWOs.length}</p>
        </div>
        <div className="bg-white rounded-lg border-l-4 border-l-red-400 border border-gray-200 p-5">
          <p className="text-sm text-red-600 mb-1">Urgent (P1+P2)</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.urgent}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Average Age</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.avgAge}<span className="text-lg text-gray-400 ml-1">days</span></p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">With Planning Group</p>
          <p className="text-3xl font-bold text-gray-900">{kpis.withPlanGroup}<span className="text-lg text-gray-400 ml-1">/ {kpis.total}</span></p>
        </div>
      </div>

      {/* Unified Filter */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ots')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ots' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Work Orders ({managedWOs.length})
        </button>
        <button
          onClick={() => setActiveTab('backlog')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'backlog' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Notifications ({workRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('capacity')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'capacity' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Capacidades
        </button>
      </div>

      {activeTab === "ots" && (
        <div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Work Orders</h3>
              <span className="text-sm text-gray-400">{filteredWOs.length} / {managedWOs.length} OTs</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={woSearch} onChange={e => setWoSearch(e.target.value)}
                  placeholder="Search WO number, equipment, description..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              </div>
              <select value={woStatusFilter} onChange={e => setWoStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Status</option>
                <option value="CREADO">Created</option>
                <option value="PLANIFICADO">Released</option>
                <option value="LIBERADO">Released</option>
                <option value="PROGRAMADO">Scheduled</option>
                <option value="EN_EJECUCION">In Execution</option>
                <option value="CERRADO">Closed</option>
                <option value="CANCELADO">Cancelled</option>
              </select>
              <select value={woPriorityFilter} onChange={e => setWoPriorityFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Priority</option>
                <option value="P1">P1 - Immediate</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
              <select value={woTypeFilter} onChange={e => setWoTypeFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Types</option>
                <option value="PM01">PM01 - Corrective</option>
                <option value="PM02">PM02 - Preventive</option>
                <option value="PM03">PM03 - Predictive</option>
                <option value="PM05">PM05 - Improvement</option>
                <option value="PM07">PM07</option>
              </select>
              {(woSearch || woStatusFilter !== "All" || woPriorityFilter !== "All" || woTypeFilter !== "All") && (
                <button onClick={() => { setWoSearch(""); setWoStatusFilter("All"); setWoPriorityFilter("All"); setWoTypeFilter("All"); }}
                  className="text-xs text-gray-500 hover:text-red-500 px-2 py-2 border border-gray-200 rounded-lg">Clear</button>
              )}
            </div>
          </div>
          {wosLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              Loading WOs...
            </div>
          ) : managedWOs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-3 opacity-40">🔧</div>
              <p className="text-sm font-medium">No WOs registered</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">WO Number</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWOs.map((wo, i) => {
                    const SAP_STATUS = {
                      CREADO: { label: 'Created', color: 'bg-yellow-100 text-yellow-700' },
                      PLANIFICADO: { label: 'Released', color: 'bg-emerald-100 text-emerald-700' },
                      PROGRAMADO: { label: 'Scheduled', color: 'bg-indigo-100 text-indigo-700' },
                      REPROGRAMADO: { label: 'Rescheduled', color: 'bg-orange-100 text-orange-700' },
                      EN_EJECUCION: { label: 'In Execution', color: 'bg-amber-100 text-amber-700' },
                      CERRADO: { label: 'Closed', color: 'bg-green-100 text-green-700' },
                      CANCELADO: { label: 'Cancelled', color: 'bg-gray-300 text-gray-600' },
                      PENDIENTE: { label: 'Created', color: 'bg-yellow-100 text-yellow-700' },
                      APROBADO: { label: 'Released', color: 'bg-emerald-100 text-emerald-700' },
                      EN_PROGRESO: { label: 'In Execution', color: 'bg-amber-100 text-amber-700' },
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
                          {wo.planned_start ? new Date(wo.planned_start).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—'}
                        </td>
                        <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                          <button onClick={async () => {
                            if (!confirm(`¿Delete ${wo.wo_number}?`)) return;
                            try { await api.deleteManagedWO(wo.wo_id); toast.success('WO deleted'); fetchData(); }
                            catch(e) { toast.error('Error deleting'); }
                          }} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors" title="Delete WO">
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
          <h3 className="text-lg font-bold text-gray-900">Approved Notifications - Planning Backlog</h3>
          <span className="text-sm text-gray-400">{filteredWRs.length} notifications</span>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 font-medium">Priority:</span>
        {['All', 'P1', 'P2', 'P3', 'P4'].map(opt => (
          <button key={opt} onClick={() => { setPriorityFilter(opt); setPage(0); }}
            className={`text-sm font-medium px-2.5 py-1 rounded transition-colors ${
              priorityFilter === opt ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {opt === 'All' ? 'All' : opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredWRs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 opacity-40">&#128203;</div>
            <p className="text-sm font-medium">No approved notifications</p>
            <p className="text-xs mt-1">Los notifications aparecen aqui cuando el supervisor los aprueba desde Identification</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notification ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning Group</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Work Center</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                {isPlanner && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
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
                          <span className="text-[10px] text-blue-500 font-medium italic cursor-pointer hover:underline" onClick={() => navigate('/work-requests', { state: { openId: wr.id } })}>View detail →</span>
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
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredWRs.length)} de {filteredWRs.length}
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
                      {isPlanner ? 'Planner' : 'Supervisor'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{wr.equipment_tag || 'No equipment'} · {created ? created.toLocaleDateString() : '---'}</p>
                </div>
                <button onClick={() => setSelectedWR(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Problem Description
                  </label>
                  <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{desc || 'No description'}</p>
                </div>

                {suggestedAction && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Action</label>
                    <p className="text-sm text-emerald-700 mt-1 bg-emerald-50 rounded-lg p-3">{suggestedAction}</p>
                  </div>
                )}

                {/* OT Created confirmation */}
                {createdOT && (
                  <div className="border-2 border-emerald-300 rounded-xl p-4 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h4 className="text-sm font-bold text-emerald-800">Work Order Created</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Número OT</div>
                        <div className="text-xl font-bold font-mono text-emerald-700">{createdOT.wo_number || createdOT.id?.slice(0,8)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Status</div>
                        <div className="text-sm font-semibold text-emerald-700">Pending Scheduling</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Materials */}
                {wr.materials && wr.materials.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials SAP</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</label>
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
                    <div className="text-[10px] text-gray-400 uppercase">Reported By</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.reported_by || wr.created_by || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Notification Type</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.notification_type || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Coding</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.aviso_coding || '---'}</div>
                  </div>
                </div>

                {/* ── Planner: Editable BBP fields ── */}
                {isPlanner ? (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Planning Data (Editable)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Planning Group</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.planning_group}
                          onChange={e => {
                            setEditFields(f => ({ ...f, planning_group: e.target.value, work_center: '' }));
                          }}>
                          <option value="">— Select —</option>
                          {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Work Center</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.work_center}
                          onChange={e => setEditFields(f => ({ ...f, work_center: e.target.value }))}>
                          <option value="">— Select —</option>
                          {filteredWCs.map(wc => <option key={wc.value} value={wc.value}>{wc.value} - {wc.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Company Area</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.area_empresa}
                          onChange={e => setEditFields(f => ({ ...f, area_empresa: e.target.value }))}>
                          <option value="">— Select —</option>
                          {AREAS_EMPRESA.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
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
                        Save
                      </button>
                      <button onClick={() => handleCreateOT(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        {actionLoading?.endsWith('_ot') ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create WO
                      </button>
                      <button onClick={() => handleReject(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => handleCancel(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors disabled:opacity-50">
                        <Ban className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Supervisor: Read-only view ── */
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Planning Data (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Planning Group', value: wr.planning_group, icon: MapPin },
                        { label: 'Work Center', value: wr.work_center, icon: Wrench },
                        { label: 'Company Area', value: wr.area_empresa, icon: Building2 },
                        { label: 'Priority', value: `${priority} - ${PRIORITY_LABELS[priority] || priority}`, icon: Tag },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] text-gray-400 uppercase">{label}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">Not assigned</span>}</div>
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
          CREADO:{label:'Created',color:'bg-yellow-100 text-yellow-700'},
          PLANIFICADO:{label:'Released',color:'bg-emerald-100 text-emerald-700'},
          LIBERADO:{label:'Released',color:'bg-emerald-100 text-emerald-700'},
          PROGRAMADO:{label:'Scheduled',color:'bg-indigo-100 text-indigo-700'},
          REPROGRAMADO:{label:'Rescheduled',color:'bg-orange-100 text-orange-700'},
          EN_EJECUCION:{label:'In Execution',color:'bg-amber-100 text-amber-700'},
          CERRADO:{label:'Closed',color:'bg-green-100 text-green-700'},
          CANCELADO:{label:'Cancelled',color:'bg-gray-300 text-gray-600'},
          PENDIENTE:{label:'Created',color:'bg-yellow-100 text-yellow-700'},
          APROBADO:{label:'Released',color:'bg-emerald-100 text-emerald-700'},
          EN_PROGRESO:{label:'In Execution',color:'bg-amber-100 text-amber-700'},
        };
        const NEXT = {
          CREADO:[['PLANIFICADO','Release','bg-blue-600 text-white hover:bg-blue-700'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          PLANIFICADO:[['PROGRAMADO','Schedule','bg-indigo-600 text-white hover:bg-indigo-700'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          PROGRAMADO:[['EN_EJECUCION','Start Execution','bg-amber-500 text-white hover:bg-amber-600'],['REPROGRAMADO','Reschedule','bg-orange-500 text-white hover:bg-orange-600'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          REPROGRAMADO:[['PROGRAMADO','Reschedule','bg-indigo-600 text-white hover:bg-indigo-700'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          EN_EJECUCION:[['CERRADO','Close','bg-green-600 text-white hover:bg-green-700'],['REPROGRAMADO','Reschedule','bg-orange-500 text-white hover:bg-orange-600']],
          CERRADO:[],
          CANCELADO:[],
          PENDIENTE:[['PLANIFICADO','Release','bg-blue-600 text-white hover:bg-blue-700'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          APROBADO:[['PROGRAMADO','Schedule','bg-indigo-600 text-white hover:bg-indigo-700'],['EN_EJECUCION','Start','bg-amber-500 text-white hover:bg-amber-600'],['CANCELADO','Cancel','bg-gray-100 text-gray-700 hover:bg-gray-200']],
          EN_PROGRESO:[['CERRADO','Close','bg-green-600 text-white hover:bg-green-700']],
        };
        const TLBL = {PM01:'PM01',PM02:'PM02',PM03:'PM03',PM05:'PM05'};
        const s = SAP[wo.status] || {label:wo.status,color:"bg-gray-100 text-gray-600"};
        const actions = NEXT[wo.status] || [];
        const ALL = ['CREADO','PLANIFICADO','PROGRAMADO','EN_EJECUCION','CERRADO'];

        const OT_TABS = [
          { id: 'resumen', label: 'Summary', icon: Info },
          { id: 'operaciones', label: 'Operations', icon: List },
          { id: 'ejecucion', label: 'Execution', icon: Play, show: ['EN_EJECUCION','CERRADO','EN_PROGRESO'].includes(wo.status) },
          { id: 'materiales', label: 'Materials', icon: Package },
          { id: 'costos', label: 'Costs', icon: DollarSign },
          { id: 'historial', label: 'History', icon: MessageSquare },
        ].filter(t => t.show === undefined || t.show);

        const ops = wo.operations || [];
        const costCats = [
          { key: 'labor', label: 'Labor', plan: calculatedCosts.laborCost || wo.labor_cost || (wo.estimated_budget||0)*0.5, real: wo.actual_labor || wo.labor_cost || 0, color: 'blue' },
          { key: 'material', label: 'Materials', plan: calculatedCosts.materialCost || wo.material_cost || (wo.estimated_budget||0)*0.3, real: wo.actual_material || wo.material_cost || 0, color: 'amber' },
          { key: 'external', label: 'External', plan: calculatedCosts.externalCost || wo.external_cost || (wo.estimated_budget||0)*0.2, real: wo.actual_external || wo.external_cost || 0, color: 'purple' },
        ];
        const totalPlan = costCats.reduce((s,c2) => s+c2.plan, 0) || wo.estimated_budget || 0;
        const totalReal = costCats.reduce((s,c2) => s+c2.real, 0);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedOT(null); setModalFullscreen(false); }}>
            <div className={`bg-white rounded-2xl shadow-xl flex flex-col transition-all duration-300 ${modalFullscreen ? "w-[98vw] h-[96vh]" : "w-[90vw] max-w-5xl h-[85vh]"}`} onClick={e => e.stopPropagation()}>

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
                    <p className="text-sm text-gray-500 mt-0.5">{wo.equipment_tag||"No equipment"} {wo.priority_code ? "\• "+wo.priority_code : ""}</p>
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
                      const imp = { P1: { l: 'CRITICAL', c: 'bg-red-50 border-red-300 text-red-800', s: 95 }, P2: { l: 'HIGH', c: 'bg-orange-50 border-orange-300 text-orange-800', s: 75 }, P3: { l: 'MEDIUM', c: 'bg-yellow-50 border-yellow-300 text-yellow-800', s: 45 }, P4: { l: 'LOW', c: 'bg-green-50 border-green-300 text-green-800', s: 20 } };
                      const d = imp[wo.priority_code] || imp.P3;
                      return <div className={"rounded-xl p-4 border-2 flex items-center justify-between "+d.c}>
                        <div><div className="text-xs font-bold uppercase">Production Impact</div><div className="text-lg font-bold">{d.l}</div></div>
                        <div className="text-3xl font-black">{d.s}</div>
                      </div>;
                    })()}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                      <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{wo.description||wo.failure_description||"No description"}</p>
                    </div>
                    {ops.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-indigo-500 uppercase mb-1">First Operation</div>
                        <p className="text-sm font-semibold text-indigo-800">{ops[0].description || "—"}</p>
                        {ops.length > 1 && <p className="text-xs text-indigo-500 mt-1">+{ops.length - 1} more operation{ops.length > 2 ? 's' : ''}</p>}
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-[10px] text-blue-600 font-semibold uppercase">Planned Hrs</div><div className="text-lg font-bold text-blue-700">{wo.estimated_hours||"0"}h</div></div>
                      <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-[10px] text-green-600 font-semibold uppercase">Actual Hrs</div><div className="text-lg font-bold text-green-700">{wo.actual_hours||execData.actual_hours||"0"}h</div></div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-[10px] text-purple-600 font-semibold uppercase">Planned Cost</div><div className="text-lg font-bold text-purple-700">${totalPlan.toFixed(0)}</div></div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center"><div className="text-[10px] text-amber-600 font-semibold uppercase">Actual Cost</div><div className="text-lg font-bold text-amber-700">${totalReal.toFixed(0)}</div></div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">SAP Flow</label>
                      <div className="flex items-center gap-1 text-xs flex-wrap">
                        {ALL.map((st,i) => (
                          <span key={st} className="flex items-center gap-1">
                            <span className={"px-2 py-1 rounded font-semibold "+(wo.status===st?((SAP[st]?.color||"")+" ring-2 ring-offset-1 ring-current"):"bg-gray-100 text-gray-400")}>{SAP[st]?.label}</span>
                            {i<ALL.length-1&&<span className="text-gray-300">\›</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technical Details - C21 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase">Technical Location</div>
                        <div className="text-sm font-mono font-semibold text-gray-800 mt-1">{wo.technical_location || wo.equipment_tag || '—'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase">Planning Group</div>
                        <div className="text-sm font-semibold text-gray-800 mt-1">{wo.planning_group || '—'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase">Work Center</div>
                        <div className="text-sm font-semibold text-gray-800 mt-1">{wo.work_center || '—'}</div>
                      </div>
                    </div>

                    {/* C22: Dates - Start/End + Week number */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-[10px] text-blue-600 font-semibold uppercase">Planned Start</div>
                        <input type="date" value={editDates.start ? editDates.start.slice(0, 10) : ''}
                          onChange={e => setEditDates(d => ({...d, start: e.target.value}))}
                          className="mt-1 text-sm font-semibold text-blue-800 bg-transparent border-none p-0 focus:ring-0 w-full" />
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-[10px] text-blue-600 font-semibold uppercase">Planned End</div>
                        <input type="date" value={editDates.end ? editDates.end.slice(0, 10) : ''}
                          onChange={e => setEditDates(d => ({...d, end: e.target.value}))}
                          className="mt-1 text-sm font-semibold text-blue-800 bg-transparent border-none p-0 focus:ring-0 w-full" />
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="text-[10px] text-indigo-600 font-semibold uppercase">Week Number</div>
                        <div className="text-lg font-bold text-indigo-800 mt-1">
                          {editDates.start ? 'W' + String(Math.ceil(((new Date(editDates.start) - new Date(new Date(editDates.start).getFullYear(), 0, 1)) / 86400000 + new Date(new Date(editDates.start).getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0') : '—'}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* OPERACIONES */}
                {otModalTab === 'operaciones' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Operations / Work Steps</h3>
                      <button type="button" onClick={() => setEditOps(prev => [...prev, { type: 'INT', description: '', specialty: 'Mechanical', quantity: 1, hours: 4 }])}
                        className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">+ Add</button>
                    </div>
                    {editOps.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">No operations</p>
                        <p className="text-xs">Click "+ Add" to create work steps</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editOps.map((op, idx) => {
                          const isExpanded = !!expandedOps[idx];
                          return (
                          <div key={idx} className={"rounded-lg border "+(op.type === 'EXT' ? "border-purple-200 bg-purple-50/30" : "border-gray-200")}>
                            <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setExpandedOps(prev => ({...prev, [idx]: !prev[idx]}))}>
                              <span className="text-xs font-bold text-gray-400 w-5">#{idx+1}</span>
                              <span className={"text-xs font-bold px-1.5 py-0.5 rounded "+(op.type === 'EXT' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600")}>{op.type || 'INT'}</span>
                              <span className="flex-1 text-sm font-medium text-gray-800 truncate">{op.description || <span className="text-gray-400 italic">No description</span>}</span>
                              <span className="text-xs text-gray-500">{op.specialty || 'Mechanical'} · {((op.quantity || 1) * (op.hours || 0)).toFixed(1)}HH</span>
                              <button type="button" onClick={e => { e.stopPropagation(); setEditOps(prev => prev.filter((_,i) => i !== idx)); }} className="text-red-400 hover:text-red-600 p-1 ml-1"><X size={12} /></button>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 mt-2 mb-2">
                                  <select value={op.type || 'INT'} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], type: e.target.value}; setEditOps(n); }}
                                    className="text-xs border rounded px-2 py-1 w-16 font-bold">
                                    <option value="INT">INT</option><option value="EXT">EXT</option>
                                  </select>
                                  <input value={op.description || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], description: e.target.value}; setEditOps(n); }}
                                    className="flex-1 text-sm border rounded px-2 py-1" placeholder="Describe the action/task" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <select value={op.specialty || 'Mechanical'} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], specialty: e.target.value}; setEditOps(n); }}
                                    className="text-xs border rounded px-2 py-1">
                                    {['Mechanical','Electrical','Instrument Tech','Welder','Lubrication','Crane Operator','Scaffolder','Boilermaker','Other'].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <div className="flex items-center gap-1">
                                    <label className="text-[10px] text-gray-500">Qty:</label>
                                    <input type="number" min="1" value={op.quantity || 1} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], quantity: parseInt(e.target.value)||1}; setEditOps(n); }}
                                      className="w-12 text-xs border rounded px-1 py-1 text-center" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <label className="text-[10px] text-gray-500">Hours:</label>
                                    <input type="number" min="0" step="0.5" value={op.hours || 0} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], hours: parseFloat(e.target.value)||0}; setEditOps(n); }}
                                      className="w-14 text-xs border rounded px-1 py-1 text-center" />
                                  </div>
                                  <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                                    {((op.quantity || 1) * (op.hours || 0)).toFixed(1)} HH
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                    <button type="button" onClick={saveOTChanges} disabled={savingOT}
                      className="w-full mt-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {savingOT ? 'Saving...' : 'Save Operations'}
                    </button>
                  </div>
                )}


                {/* EJECUCION */}
                {otModalTab === 'ejecucion' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2"><ClipboardCheck size={16} /> Execution Record</h3>
                      <p className="text-xs text-blue-600 mt-1">Complete actual data. Required to close the WO.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Planned Hours</label>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">{wo.estimated_hours || '0'}h</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Actual Hrses Trabajadas *</label>
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
                          <span className="text-xs font-medium">{pct}% of estimate</span>
                          <span className={"text-sm font-bold "+(over ? "text-red-600" : "text-green-600")}>{over ? "+" : ""}{delta.toFixed(1)}h {over ? "over" : "under"} estimado</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className={"h-2 rounded-full "+(over ? "bg-red-500" : "bg-green-500")} style={{width: Math.min(pct, 150)+"%"}} />
                        </div>
                      </div>;
                    })()}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-2">Materials Used</label>
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
                        <p className="text-xs text-gray-400 italic py-3">No materials planificados para esta OT</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Execution Observations</label>
                      <textarea rows={3} value={execData.observations}
                        onChange={e => setExecData(prev => ({...prev, observations: e.target.value}))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Findings, problems encountered, additional work..." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => verifyAndClose(wo)} disabled={closingWithAI || !execData.actual_hours}
                        className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                        {closingWithAI ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                        {closingWithAI ? 'Verifying...' : 'Verify with AI before Close'}
                      </button>
                      <button onClick={async () => {
                        if (!execData.actual_hours) { toast.error('Record actual hours first'); return; }
                        await api.updateManagedWO(wo.wo_id, {
                          actual_hours: parseFloat(execData.actual_hours) || 0,
                          labor_cost: (parseFloat(execData.actual_hours) || 0) * LABOR_RATE,
                        });
                        toast.success('Execution data saved');
                      }} className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">
                        <Save size={16} />
                      </button>
                    </div>
                    {aiCloseResult && (
                      <div className={"rounded-xl p-4 border-2 "+(aiCloseResult.ready ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                        <div className="flex items-center gap-2 mb-2">
                          {aiCloseResult.ready ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                          <span className={"text-sm font-bold "+(aiCloseResult.ready ? "text-green-800" : "text-amber-800")}>
                            {aiCloseResult.ready ? "WO ready to close" : "Review before closing"}
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
                      <h3 className="text-sm font-semibold text-gray-800">Materials / Spare Parts</h3>
                      <button type="button" onClick={() => setEditMats(prev => [...prev, { sapId: '', description: '', quantity: 1, unit: 'PZ', type: 'INT' }])}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add</button>
                    </div>
                    {editMats.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">No materials</p>
                        <p className="text-xs">Click "+ Add" para agregar repuestos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editMats.map((mat, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="relative">
                                <input value={activeMatIdx === idx ? matSearchQuery : (mat.sapId || '')}
                                  onFocus={() => { setActiveMatIdx(idx); setMatSearchQuery(mat.sapId || ''); }}
                                  onChange={e => { setActiveMatIdx(idx); setMatSearchQuery(e.target.value); const n = [...editMats]; n[idx].sapId = e.target.value; setEditMats(n); }}
                                  className="w-28 text-xs border rounded px-2 py-1 font-mono" placeholder="SAP Code" />
                                {activeMatIdx === idx && matSearchResults.length > 0 && (
                                  <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {matSearchResults.map((r, ri) => (
                                      <button key={ri} type="button" onClick={() => selectMaterial(r, idx)}
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-50 flex items-center gap-2">
                                        <span className="font-mono text-blue-700 font-semibold">{r.sapId}</span>
                                        <span className="text-gray-600 truncate">{r.description}</span>
                                        <span className="ml-auto text-gray-400">{r.unit}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {activeMatIdx === idx && matSearchLoading && <div className="absolute right-1 top-1.5 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                              </div>
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
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">$/u:</label>
                                <input type="number" min="0" step="0.01" value={mat.unit_price || ''} onChange={e => { const n = [...editMats]; n[idx].unit_price = parseFloat(e.target.value) || 0; setEditMats(n); }}
                                  className="w-16 text-xs border rounded px-1 py-1 text-center" placeholder="0" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={saveOTChanges} disabled={savingOT}
                      className="w-full mt-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {savingOT ? 'Saving...' : 'Save Materials'}
                    </button>
                  </div>
                )}

                {otModalTab === 'costos' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800">Cost Control</h3>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-emerald-700 mb-1">Auto-calculated from Operations + Materials</div>
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                          <div className="text-[10px] text-blue-600 font-semibold uppercase">Plan</div>
                          <div className="text-lg font-bold text-blue-800">${totalPlan.toFixed(0)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                          <div className="text-[10px] text-amber-600 font-semibold uppercase">Real</div>
                          <div className="text-lg font-bold text-amber-800">${totalReal.toFixed(0)}</div>
                        </div>
                        <div className={(totalReal - totalPlan) > 0 ? "bg-red-50 rounded-lg p-3 text-center border border-red-200" : "bg-green-50 rounded-lg p-3 text-center border border-green-200"}>
                          <div className="text-[10px] font-semibold uppercase" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>Delta</div>
                          <div className="text-lg font-bold" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>
                            {(totalReal - totalPlan) > 0 ? '+' : ''}{(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      {/* Plan vs Real detail table */}
                      <table className="w-full text-xs mt-3 border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left px-2 py-1.5 font-semibold">Category</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-blue-700">Plan</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-amber-700">Real</th>
                            <th className="text-right px-2 py-1.5 font-semibold">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {costCats.map(ci => {
                            const delta = ci.real - ci.plan;
                            return (
                              <tr key={ci.key} className="border-b">
                                <td className="px-2 py-1.5 font-medium">{ci.label}</td>
                                <td className="px-2 py-1.5 text-right text-blue-700">${ci.plan.toFixed(0)}</td>
                                <td className="px-2 py-1.5 text-right text-amber-700">${ci.real.toFixed(0)}</td>
                                <td className={"px-2 py-1.5 text-right font-bold " + (delta > 0 ? "text-red-600" : "text-green-600")}>
                                  {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-gray-300 font-bold">
                            <td className="px-2 py-1.5">Total</td>
                            <td className="px-2 py-1.5 text-right text-blue-800">${totalPlan.toFixed(0)}</td>
                            <td className="px-2 py-1.5 text-right text-amber-800">${totalReal.toFixed(0)}</td>
                            <td className={"px-2 py-1.5 text-right " + ((totalReal-totalPlan) > 0 ? "text-red-600" : "text-green-600")}>
                              {(totalReal-totalPlan) > 0 ? '+' : ''}{(totalReal-totalPlan).toFixed(0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* HISTORIAL */}
                {otModalTab === 'historial' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800">Execution History</h3>
                    {(() => {
                      let notes = wo.execution_notes;
                      if (!notes) return <p className="text-center text-gray-400 text-sm py-6">No execution notes recorded</p>;
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
                              <span className="text-[10px] text-gray-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</span>
                            </div>
                            <p className="text-xs text-gray-700">{entry.note || entry.message || JSON.stringify(entry)}</p>
                          </div>
                        ))}
                      </div>;
                    })()}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Created: {wo.created_at ? new Date(wo.created_at).toLocaleString("es") : "\—"}</p>
                      {wo.planned_start && <p>Start planificado: {new Date(wo.planned_start).toLocaleString("es")}</p>}
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
                        toast.error('Record actual hours before closing');
                        return;
                      }
                      changeOTStatus(wo, st);
                    }} disabled={!!otActionLoading} className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors "+cls+(otActionLoading===st?" opacity-60 cursor-wait":"")}>{otActionLoading===st?"...":lbl}</button>
                  )) : (
                    <span className="text-xs text-gray-400 italic">Final status</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'capacity' && (
        <CapacityEvaluation />
      )}

    </div>
  );
}