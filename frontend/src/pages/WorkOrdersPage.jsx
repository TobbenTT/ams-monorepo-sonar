import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Wrench, Download, Plus, ArrowUp, X, Search, AlertTriangle, ChevronDown, Clock, Package, Play, CheckCircle, Lock, FileText, ArrowRight, ClipboardCheck, Zap, Mic, MicOff, Camera, Image, Trash2, Save, DollarSign, List, MessageSquare, Info, Users, MapPin } from 'lucide-react';
import WorkOrderDetailDialog from '../components/tactical/WorkOrderDetailDialog';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { downloadExport } from '../utils/exportFile';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function WorkOrdersPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedPlant, selectedTimeRange, selectedArea, viewMode } = useOutletContext();
  const plant = selectedPlant;
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdWRId, setCreatedWRId] = useState(null); // success popup
  const [createForm, setCreateForm] = useState({
    whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '',
    suggestedAction: '', estimatedDuration: '',
    priority: 'P3', activityClass: 'M001', plantCondition: 'operating',
    failureCategory: 'MECANICO', failureSymptom: '', failureObjectPart: '', failureCause: '',
    resources: [], materials: [], specialEquipment: '',
    circumstances: '', reportedBy: '', supportEquipment: '',
  });
  const [equipSearch, setEquipSearch] = useState('');
  const [allEquipment, setAllEquipment] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [locationNodes, setLocationNodes] = useState([]);
  const [equipResults, setEquipResults] = useState([]);
  const [showEquipSearch, setShowEquipSearch] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [locSearch, setLocSearch] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [showLocSearch, setShowLocSearch] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [showCauses, setShowCauses] = useState(false);
  const [activeResTypeIdx, setActiveResTypeIdx] = useState(-1);
  const [activeMatSapIdx, setActiveMatSapIdx] = useState(-1);
  const [showSpecEquip, setShowSpecEquip] = useState(false);
  // Voice + Photo capture
  const [isRecording, setIsRecording] = useState(false);
  const [photos, setPhotos] = useState([]);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const cameraRef = useRef(null);
  // Managed Work Orders (Jorge Phase 2)
  const [managedWOs, setManagedWOs] = useState([]);
  const [woTab, setWoTab] = useState('ots'); // 'ots' | 'wrs'
  const [showCreateOTModal, setShowCreateOTModal] = useState(false);
  const [approvedWRs, setApprovedWRs] = useState([]);
  const [creatingOT, setCreatingOT] = useState(false);
  const [otCreateForm, setOtCreateForm] = useState({ description: '', wo_type: 'PM01', priority_code: 'P3', equipment_tag: '', equipment_id: '', estimated_hours: 4, failureCategory: 'MECANICO' });
  const [selectedOT, setSelectedOT] = useState(null);
  const [otDetailTab, setOtDetailTab] = useState('resumen');
  const [otOps, setOtOps] = useState([]); // editable operations
  const [otMats, setOtMats] = useState([]); // editable materials
  const [otCosts, setOtCosts] = useState({ labor_cost: 0, material_cost: 0, external_cost: 0 , planned_labor: 0, planned_material: 0, planned_external: 0 });
  const [otSaving, setOtSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [wrSortBy, setWrSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc'

  // ── SAP PM constants (inside component for i18n) ──
  const PLANT_CONDITIONS = [
    { value: 'operating', label: t('workOrders.plantOperating'), color: '#10B981' },
    { value: 'stopped', label: t('workOrders.plantStopped'), color: '#EF4444' },
  ];

  const PRIORITIES = [
    { value: 'P1', label: t('workOrders.priorityUrgent'), sub: '< 24h', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03', claseOTLabel: t('workOrders.notScheduled') },
    { value: 'P2', label: t('workOrders.priorityExecution'), sub: '< 7d', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03', claseOTLabel: t('workOrders.notScheduled') },
    { value: 'P3', label: t('workOrders.priorityNextProg'), sub: '> 7d', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01', claseOTLabel: t('workOrders.scheduled') },
    { value: 'P4', label: t('workOrders.priorityNone'), sub: '', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01', claseOTLabel: t('workOrders.scheduled') },
  ];

  const ACTIVITY_CLASSES = {
    PM01: [{ value: 'M001', label: 'M001 — Solicitud de Mantenimiento' }, { value: 'M003', label: 'M003 — Reparación / Prep. Components' }],
    PM03: [{ value: 'M002', label: 'M002 — Avería' }, { value: 'M003', label: 'M003 — Reparación / Prep. Components' }],
  };

  const SPECIAL_EQUIPMENT = [
    'Grúa 20 Ton', 'Grúa 50 Ton', 'Grúa Horquilla', 'Andamio Multidireccional',
    'Tubular Scaffold', 'Crane Truck', 'Lift Platform', 'MIG/MAG Welder',
    'TIG Welder', 'Arc Welder', 'Portable Compressor', 'Electric Generator',
    'Bomba Sumergible', 'Hidrolavadora', 'Equipo Alineación Láser',
    'Analizador de Vibraciones', 'Cámara Termográfica', 'Megóhmetro',
    'Multímetro Industrial', 'Torquímetro', 'Extractor Hidráulico',
    'Gata Hidráulica', 'Tecle Cadena 5 Ton', 'Esmeril Angular',
    'Taladro Magnético', 'Equipo Ultrasonido', 'Detector de Gases',
  ];

  const RESOURCE_TYPES = [
    'Mechanical', 'Electrical', 'Instrumentation', 'Lubrication', 'Welder',
    'Operador Grúa', 'Andamiero', 'Calderero', 'Ayudante General', 'Supervisor',
  ];
  const COMMON_MATERIALS = [
    { sapId: '10001234', desc: 'Rodamiento SKF 6205' },
    { sapId: '10001235', desc: 'Sello mecánico' },
    { sapId: '10001236', desc: 'Correa V A-68' },
    { sapId: '10001237', desc: 'Aceite ISO 68' },
    { sapId: '10001238', desc: 'Grasa EP2' },
    { sapId: '10001239', desc: 'Filtro aceite hidráulico' },
    { sapId: '10001240', desc: 'Junta tórica NBR' },
    { sapId: '10001241', desc: 'Tornillo M12x50 Gr8.8' },
    { sapId: '10001242', desc: 'Electrodo E7018 3/32' },
    { sapId: '10001243', desc: 'Cable 3x10 AWG' },
    { sapId: '10001244', desc: 'Fusible NH 100A' },
    { sapId: '10001245', desc: 'Contactor 3P 40A' },
    { sapId: '10001246', desc: 'Sensor proximidad inductivo' },
    { sapId: '10001247', desc: 'Transmisor presión 0-10bar' },
    { sapId: '10001248', desc: 'Válvula solenoide 1/2"' },
  ];

  const FAILURE_CATALOG = {
    MECANICO: { label: t('workOrders.failMechanical'), color: '#6366F1', symptoms: ['ALTA VIBRACION','ALTA TEMPERATURA','RUIDO ANORMAL','TRABADO','SIN FLUJO','FILTRACION','DESGASTE VISIBLE','FUGA ACEITE','ATASCAMIENTO'], parts: ['RODAMIENTOS','SELLOS MECANICOS','ACOPLES','EJES','ENGRANAJES','CORREAS','BOMBAS','VALVULAS','FILTROS'], causes: ['DESGASTE','FALTA LUBRICACION','CORROSION','DESALINEADO','OBSTRUIDO','SOBRECARGA','FATIGA','MONTAJE INCORRECTO'] },
    ELECTRICO: { label: t('workOrders.failElectrical'), color: '#F59E0B', symptoms: ['NO ARRANCA','SOBRECALENTAMIENTO','CORTOCIRCUITO','DISPARO PROTECCION','BAJA AISLACION','OPERACION INTERMITENTE','CONSUMO EXCESIVO'], parts: ['MOTOR ELECTRICO','CABLES / CONDUCTORES','PROTECCIONES','TABLERO ELECTRICO','VARIADOR FRECUENCIA','CONTACTOR'], causes: ['PERDIDA AISLACION','DESGASTE','SUELTO','SOBRECARGA ELECTRICA','HUMEDAD','CALENTAMIENTO EXCESIVO'] },
    INSTRUMENTACION: { label: t('workOrders.failInstrumentation'), color: '#06B6D4', symptoms: ['LECTURA ERRONEA','SIN SEÑAL','SEÑAL INESTABLE','NO RESPONDE','ALARMA FALSA','COMUNICACION PERDIDA'], parts: ['SENSOR / TRANSDUCTOR','TRANSMISOR','VALVULA DE CONTROL','PLC / DCS','ACTUADOR','POSICIONADOR'], causes: ['DESCALIBRADO','CONTAMINADO','PERDIDA PARAMETROS','PERDIDA COMUNICACION','OBSTRUCCION'] },
  };

  // Fetch work requests + managed WOs from API
  const reloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wrData, woData] = await Promise.all([
        api.listWorkRequests({ plant_id: plant }).catch(() => []),
        api.listManagedWOs({ plant_id: plant }).catch(() => []),
      ]);
      setWorkRequests(Array.isArray(wrData) ? wrData : []);
      setManagedWOs(Array.isArray(woData) ? woData : []);
      setApprovedWRs((Array.isArray(wrData) ? wrData : []).filter(
        wr => ['VALIDATED', 'APPROVED', 'ASSIGNED'].includes(wr.status)
      ));
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError(err.message || t('workOrders.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [plant]);

  useEffect(() => { reloadData(); }, [reloadData]);

  // Build SAP functional location path from hierarchy
  const buildFuncLocPath = useCallback((node, nodeMap) => {
    const parts = [];
    let current = node;
    while (current) {
      parts.unshift(current.code || current.name || '');
      current = current.parent_node_id ? nodeMap[current.parent_node_id] : null;
    }
    return parts.join('-');
  }, []);

  // Load equipment + locations for create modal search
  useEffect(() => {
    api.listNodes({}).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setAllNodes(nodes);
      const nodeMap = {};
      nodes.forEach(n => { nodeMap[n.node_id] = n; });
      setAllEquipment(nodes.filter(n => n.node_type === 'EQUIPMENT'));
      setLocationNodes(nodes.filter(n =>
        ['PLANT', 'AREA', 'SYSTEM'].includes(n.node_type)
      ).map(n => ({ ...n, _funcLoc: buildFuncLocPath(n, nodeMap) })));
    }).catch(() => {});
  }, [buildFuncLocPath]);

  // Filter equipment results
  useEffect(() => {
    if (equipSearch.length < 2) { setEquipResults([]); return; }
    const q = equipSearch.toLowerCase();
    setEquipResults(allEquipment.filter(n =>
      (n.tag || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [equipSearch, allEquipment]);

  // Filter location results
  useEffect(() => {
    if (locSearch.length < 2) { setLocResults([]); return; }
    const q = locSearch.toLowerCase();
    setLocResults(locationNodes.filter(n =>
      (n._funcLoc || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [locSearch, locationNodes]);

  // Auto-detect equipment tag from description text
  useEffect(() => {
    if (selectedEquip || !createForm.whatHappens || allEquipment.length === 0) return;
    const text = createForm.whatHappens.toUpperCase();
    const found = allEquipment.find(n => {
      const tag = (n.tag || n.code || '').toUpperCase();
      return tag && tag.length >= 4 && text.includes(tag);
    });
    if (found) { selectEquip(found); return; }
    const tagMatch = createForm.whatHappens.match(/\b([A-Z]{1,5}(?:-[A-Z0-9]{1,6}){1,5})\b/i);
    if (tagMatch) {
      const extracted = tagMatch[1].toUpperCase();
      const partial = allEquipment.find(n => {
        const tag = (n.tag || n.code || '').toUpperCase();
        return tag && (tag.includes(extracted) || extracted.includes(tag));
      });
      if (partial) { selectEquip(partial); }
      else { selectEquip({ tag: extracted, name: 'Detectado del texto' }); }
    }
  }, [createForm.whatHappens, allEquipment, selectedEquip]);

  // --- Filter work requests by selected time range ---
  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  // --- Compute aggregated chart data from work requests ---

  // Daily Late Work Orders: group by created_at date, show count per day
  const dailyLateWOData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const dayCounts = {};
    filteredWRs.forEach((wr) => {
      const date = wr.created_at ? wr.created_at.split('T')[0] : 'Unknown';
      dayCounts[date] = (dayCounts[date] || 0) + 1;
    });
    const total = filteredWRs.length || 1;
    const sortedDays = Object.keys(dayCounts).sort();
    let runningSum = 0;
    return sortedDays.map((day) => {
      runningSum += dayCounts[day];
      const pct = Math.round((dayCounts[day] / total) * 100);
      return {
        day: day.slice(5), // MM-DD
        latePercentage: pct,
        rolling30Day: Math.round((runningSum / total) * 100),
        metaLine: 5,
      };
    });
  }, [filteredWRs]);

  // Top Root Causes: aggregate from ai_classification.work_order_type or problem_description
  const rootCausesData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const causeCounts = {};
    filteredWRs.forEach((wr) => {
      const woType = wr.ai_classification?.work_order_type || wr.work_class || 'Unknown';
      causeCounts[woType] = (causeCounts[woType] || 0) + 1;
    });
    return Object.entries(causeCounts)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredWRs]);

  // Delays by Shift: derive from priority distribution as proxy
  const delaysByShiftData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const shiftMap = {};
    filteredWRs.forEach((wr) => {
      const priority = wr.priority || wr.priority_code || 'Unknown';
      const shift = (priority === 'P1' || priority === 'P2') ? t('workOrders.shiftHighPriority') : t('workOrders.shiftStandard');
      shiftMap[shift] = (shiftMap[shift] || 0) + 1;
    });
    return Object.entries(shiftMap).map(([shift, count]) => ({ shift, count }));
  }, [filteredWRs, t]);

  // Delays by Maintenance Type: aggregate work_class
  const delaysByTypeData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const typeCounts = {};
    filteredWRs.forEach((wr) => {
      const wc = wr.work_class || 'Unknown';
      typeCounts[wc] = (typeCounts[wc] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  }, [filteredWRs]);

  // Map work requests to table rows
  const workOrdersData = useMemo(() => {
    return filteredWRs.map((wr) => {
      const createdDate = wr.created_at ? new Date(wr.created_at) : null;
      const daysOld = createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const priority = wr.priority || wr.priority_code || 'Unknown';
      let criticality = 'Low';
      if (priority === 'P1') criticality = 'High';
      else if (priority === 'P2') criticality = 'High';
      else if (priority === 'P3') criticality = 'Medium';
      return {
        id: wr.request_id || t('workOrders.na'),
        description: wr.problem_description?.original_text || t('workOrders.noDescription'),
        area: wr.work_class || t('workOrders.na'),
        criticality,
        delayDays: daysOld,
        responsible: wr.assigned_to_name || t('workOrders.unassigned'),
        status: wr.status || 'Unknown',
        _raw: wr,
      };
    });
  }, [filteredWRs, t]);

  // Compute KPI: percentage of late/pending work orders
  const latePercentage = useMemo(() => {
    if (!filteredWRs.length) return 0;
    const pending = filteredWRs.filter(wr =>
      wr.status === 'PENDING_VALIDATION' || wr.status === 'PENDING_APPROVAL'
    ).length;
    return Math.round((pending / filteredWRs.length) * 100);
  }, [filteredWRs]);

  // ── Export WRs to Excel ──
  const handleExportWRs = useCallback(() => {
    if (!workOrdersData.length) return;
    const headers = ['ID', 'Equipo TAG', 'Descripción', 'Priority', 'Clase', 'Días', 'Asignado', 'Status'];
    const rows = workOrdersData.map(wo => [
      wo.id,
      wo._raw?.equipment_tag || '',
      wo.description || '',
      wo._raw?.priority_code || wo.criticality,
      wo.area,
      wo.delayDays,
      wo.responsible,
      wo.status,
    ]);
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Notifications', headers, rows }] }, `avisos-${plant || 'all'}-${new Date().toISOString().slice(0, 10)}`);
  }, [workOrdersData, plant]);

  // ── Export OTs to Excel ──
  const handleExportOTs = useCallback(() => {
    if (!managedWOs.length) return;
    const headers = ['OT #', 'Equipo', 'Descripción', 'Tipo OT', 'Priority', 'Status', 'Progress %', 'Fast Track', 'Creado'];
    const rows = managedWOs.map(wo => [
      wo.wo_number,
      wo.equipment_tag || '',
      wo.description || '',
      wo.order_type || '',
      wo.priority || '',
      wo.status || '',
      wo.progress ?? 0,
      wo.is_fast_track ? 'Sí' : 'No',
      wo.created_at ? new Date(wo.created_at).toLocaleDateString() : '',
    ]);
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Órdenes de Trabajo', headers, rows }] }, `ordenes-trabajo-${plant || 'all'}-${new Date().toISOString().slice(0, 10)}`);
  }, [managedWOs, plant]);

  // ── AI Assist ──
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDuplicates, setAiDuplicates] = useState([]);

  const handleAssistAI = async () => {
    if (!createForm.whatHappens.trim()) { toast.error('Escribe una descripción primero'); return; }
    setAiLoading(true);
    try {
      // 1. Check duplicates
      if (createForm.whereTag) {
        const dupRes = await api.checkDuplicates({ equipment_tag: createForm.whereTag, problem_description: createForm.whatHappens });
        if (dupRes.duplicate_count > 0) {
          setAiDuplicates(dupRes.duplicates);
          toast.error(`⚠ ${dupRes.duplicate_count} aviso(s) abierto(s) similar(es) encontrado(s) para este equipo`);
        }
      }
      // 2. Get AI suggestions
      const res = await api.aiAssistWR({
        description: createForm.whatHappens,
        equipment_tag: createForm.whereTag || '',
        plant_condition: createForm.plantCondition || '',
        existing_priority: createForm.priority !== 'P3' ? createForm.priority : '',
        existing_category: createForm.failureCategory !== 'MECANICO' ? createForm.failureCategory : '',
        existing_action: createForm.suggestedAction || '',
      });
      const s = res.suggestions || {};
      // 3. Fill only empty/default fields
      const updates = {};
      if (s.failureCategory && !createForm.failureCategory) updates.failureCategory = s.failureCategory;
      if (s.failureCategory && createForm.failureCategory === 'MECANICO') updates.failureCategory = s.failureCategory;
      if (s.priority) updates.priority = s.priority;
      if (s.activityClass) updates.activityClass = s.activityClass;
      if (s.suggestedAction && !createForm.suggestedAction) updates.suggestedAction = s.suggestedAction;
      if (s.estimatedDuration && !createForm.estimatedDuration) updates.estimatedDuration = s.estimatedDuration;
      if (s.failureSymptom && !createForm.failureSymptom) updates.failureSymptom = s.failureSymptom;
      if (s.failureCause && !createForm.failureCause) updates.failureCause = s.failureCause;
      if (s.productionImpact) updates.plantCondition = createForm.plantCondition; // keep user's choice
      if (s.resources && (!createForm.resources || createForm.resources.length === 0)) updates.resources = s.resources;
      if (s.materials && s.materials.length > 0 && (!createForm.materials || createForm.materials.length === 0)) updates.materials = s.materials;

      setCreateForm(prev => ({ ...prev, ...updates }));
      const filled = Object.keys(updates).length;
      toast.success(`IA completó ${filled} campo(s) automáticamente`);
    } catch (err) {
      toast.error('Error al obtener sugerencias de IA');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Create Work Order ──
  const selectedPriority = PRIORITIES.find(p => p.value === createForm.priority);
  const claseOT = selectedPriority?.claseOT || 'PM01';
  const actClasses = ACTIVITY_CLASSES[claseOT] || [];
  const canCreate = createForm.whatHappens.trim() && createForm.technicalLocationCode;

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const res = await api.createWRManual({
        equipment_tag: createForm.whereTag.trim(),
        equipment_name: selectedEquip?.name || createForm.whereTag.trim(),
        plant_id: plant,
        problem_description: createForm.whatHappens.trim(),
        priority: createForm.priority,
        activity_class: createForm.activityClass || '',
        failure_category: createForm.failureCategory || '',
        failure_symptom: createForm.failureSymptom || '',
        failure_cause: createForm.failureCause || '',
        plant_condition: createForm.plantCondition || '',
        suggested_action: createForm.suggestedAction || '',
        estimated_duration: parseFloat(createForm.estimatedDuration) || 4,
        materials: (createForm.materials || []).map(m => typeof m === 'string' ? m : m.name || '').filter(Boolean),
        resources: (createForm.resources || []).map(r => typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1}`).filter(Boolean),
        documents: photos.map((data, i) => ({ name: `foto_${i + 1}.jpg`, data, type: 'photo' })),
        circumstances: createForm.circumstances || '',
        reported_by: user?.full_name || user?.username || '',
        support_equipment: createForm.supportEquipment ? createForm.supportEquipment.split(',').map(s => s.trim()).filter(Boolean) : [],
        technical_location: createForm.technicalLocationCode || '',
        notification_type: 'A1',
      });
      const wrId = res?.request_id || res?.work_request_id || '';
      setCreatedWRId(wrId);
      setCreateForm({ whatHappens: '', whereTag: '', technicalLocation: '', technicalLocationCode: '', suggestedAction: '', estimatedDuration: '', priority: 'P3', activityClass: 'M001', plantCondition: 'operating', failureCategory: 'MECANICO', failureSymptom: '', failureObjectPart: '', failureCause: '', resources: [], materials: [], specialEquipment: '', circumstances: '', reportedBy: '', supportEquipment: '' });
      setSelectedEquip(null);
      setSelectedLoc(null);
      setPhotos([]);
      reloadData();
    } catch (err) {
      toast.error(err.message || t('workOrders.failedToCreate'));
    } finally {
      setCreating(false);
    }
  };

  const setF = (key, val) => setCreateForm(prev => ({ ...prev, [key]: val }));
  const selectEquip = (node) => {
    const tag = node.tag || node.code || node.name;
    setSelectedEquip(node);
    setF('whereTag', tag);
    // Auto-resolve Ubicación Técnica from parent hierarchy
    if (node.parent_node_id) {
      const nodeMap = {};
      allNodes.forEach(n => { nodeMap[n.node_id] = n; });
      const parent = nodeMap[node.parent_node_id];
      if (parent) {
        const funcLoc = buildFuncLocPath(parent, nodeMap);
        setSelectedLoc(parent);
        setF('technicalLocation', parent.name || funcLoc);
        setF('technicalLocationCode', funcLoc);
      }
    }
    // Auto-detect failure category from equipment type/name
    const combined = ((node.name || '') + ' ' + tag).toUpperCase();
    if (/SENSOR|TRANSMISOR|PLC|DCS|INSTRUMENT|VALVULA.CONTROL|MEDIDOR|ANALIZADOR/.test(combined)) {
      setF('failureCategory', 'INSTRUMENTACION'); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', '');
    } else if (/MOTOR.ELEC|TABLERO|TRANSFORM|CABLE|VARIADOR|MCC|INTERRUPTOR/.test(combined)) {
      setF('failureCategory', 'ELECTRICO'); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', '');
    }
    setEquipSearch('');
    setShowEquipSearch(false);
  };

  const selectLocation = (node) => {
    setSelectedLoc(node);
    setF('technicalLocation', node.name || node._funcLoc);
    setF('technicalLocationCode', node._funcLoc || node.code);
    setLocSearch('');
    setShowLocSearch(false);
  };

  const clearLocation = () => {
    setSelectedLoc(null);
    setF('technicalLocation', '');
    setF('technicalLocationCode', '');
  };

  // Resources helpers
  const addResource = () => setCreateForm(prev => ({ ...prev, resources: [...prev.resources, { type: '', quantity: '', hours: '' }] }));
  const updateResource = (idx, field, val) => setCreateForm(prev => {
    const res = [...prev.resources]; res[idx] = { ...res[idx], [field]: val }; return { ...prev, resources: res };
  });
  const removeResource = (idx) => setCreateForm(prev => ({ ...prev, resources: prev.resources.filter((_, i) => i !== idx) }));

  // Materials helpers
  const addMaterial = () => setCreateForm(prev => ({ ...prev, materials: [...prev.materials, { sapId: '', quantity: '', description: '' }] }));
  const updateMaterial = (idx, field, val) => setCreateForm(prev => {
    const mats = [...prev.materials]; mats[idx] = { ...mats[idx], [field]: val }; return { ...prev, materials: mats };
  });
  const removeMaterial = (idx) => setCreateForm(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== idx) }));

  // ── Voice recording (Web Speech API) ──
  const handleVoice = () => {
    if (!SpeechRecognition) { toast.warning(t('workOrders.voiceNotSupported') || 'Tu navegador no soporta reconocimiento de voz. Usa Chrome.'); return; }
    if (isRecording) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    baseTextRef.current = createForm.whatHappens;
    let finalTranscript = '';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const tr = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += tr + ' ';
        else interim += tr;
      }
      const base = baseTextRef.current;
      const sep = base ? '\n' : '';
      setF('whatHappens', (base + sep + finalTranscript + interim).trimEnd());
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        const base = baseTextRef.current;
        const sep = base ? '\n' : '';
        setF('whatHappens', (base + sep + finalTranscript).trimEnd());
      }
    };
    recognition.start();
  };

  // ── Photo capture ──
  const handleCameraClick = () => cameraRef.current?.click();
  const handleCameraChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotos(prev => [...prev, ev.target.result]);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // ── OT Status helpers ──
  const OT_STATUS_COLORS = {
    CREATED: 'bg-yellow-100 text-yellow-700',
    PLANNED: 'bg-blue-100 text-blue-700',
    SCHEDULED: 'bg-indigo-100 text-indigo-700',
    RESCHEDULED: 'bg-orange-100 text-orange-700',
    EN_EJECUCION: 'bg-amber-100 text-amber-700',
    CLOSED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-300 text-gray-600',
    // Legacy compat
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    APROBADO: 'bg-blue-100 text-blue-700',
    EN_PROGRESO: 'bg-amber-100 text-amber-700',
    RECHAZADO: 'bg-red-100 text-red-700',
  };

  const OT_NEXT_ACTION = {
    CREATED: { label: 'Planificar', action: 'plan', icon: ArrowRight },
    PLANNED: { label: 'Programar', action: 'schedule', icon: ClipboardCheck },
    SCHEDULED: { label: 'Start Execution', action: 'start', icon: Play },
    RESCHEDULED: { label: 'Reprogramar', action: 'schedule', icon: ClipboardCheck },
    EN_EJECUCION: { label: 'Close', action: 'complete', icon: CheckCircle },
    // Legacy compat
    PENDIENTE: { label: 'Planificar', action: 'plan', icon: ArrowRight },
    APROBADO: { label: 'Iniciar', action: 'start', icon: Play },
    EN_PROGRESO: { label: 'Close', action: 'complete', icon: CheckCircle },
  };

  const handleOTTransition = async (wo, actionName) => {
    try {
      const fn = {
        plan: api.planManagedWO,
        release: api.releaseManagedWO,
        schedule: api.scheduleManagedWO,
        reschedule: api.rescheduleManagedWO,
        start: api.startManagedWO,
        complete: api.completeManagedWO,
        close: api.closeManagedWO,
      }[actionName];
      if (!fn) return;
      await fn(wo.wo_id, {});
      reloadData();
    } catch (err) {
      toast.error(err.message || t('workOrders.errorChangeStatus') || 'Error al cambiar status');
    }
  };

  const handleValidateWR = async (wrId) => {
    try {
      await api.validateWorkRequest(wrId, { action: 'APPROVE' });
      toast.success('Aviso validado');
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Error al validar');
    }
  };

  const handleRejectWR = async (wrId) => {
    try {
      await api.validateWorkRequest(wrId, { action: 'REJECT', modifications: { rejection_reason: 'Rejected' } });
      toast.success('Notification rejected');
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Error al rechazar');
    }
  };

  const handleCreateOTFromWR = async (wr) => {
    setCreatingOT(true);
    try {
      await api.createWOFromWR({ work_request_id: wr.request_id, plant_id: plant });
      setShowCreateOTModal(false);
      reloadData();
    } catch (err) {
      toast.error(err.message || t('workOrders.errorCreateOT') || 'Error creating WO');
    } finally {
      setCreatingOT(false);
    }
  };

  const handleCreateOTManual = async () => {
    if (!otCreateForm.description.trim() || !otCreateForm.equipment_tag.trim()) return;
    setCreatingOT(true);
    try {
      await api.createManagedWO({
        ...otCreateForm,
        plant_id: plant,
        equipment_id: otCreateForm.equipment_id || otCreateForm.equipment_tag,
      });
      setShowCreateOTModal(false);
      setOtCreateForm({ description: '', wo_type: 'PM01', priority_code: 'P3', equipment_tag: '', equipment_id: '', estimated_hours: 4, failureCategory: 'MECANICO' });
      reloadData();
    } catch (err) {
      toast.error(err.message || t('workOrders.errorCreateOT') || 'Error creating WO');
    } finally {
      setCreatingOT(false);
    }
  };

  // ── Open OT detail & load editable data ──
  const openOTDetail = (ot) => {
    setSelectedOT(ot);
    setOtDetailTab('resumen');
    setOtOps(Array.isArray(ot.operations) ? ot.operations.map((op, i) => ({ ...op, _id: i, op_type: op.op_type || 'INT', quantity: op.quantity || 1, duration: op.duration || op.estimated_hours || op.planned_hours || 1, planned_hours: op.planned_hours || ((op.quantity || 1) * (op.duration || op.estimated_hours || 1)) })) : []);
    setOtMats(Array.isArray(ot.materials) ? ot.materials.map((m, i) => ({ ...m, _id: i, code: m.code || m.sapId || '', unit: m.unit || 'PZ', quantity: parseInt(m.quantity) || 1 })) : []);
    setOtCosts({ labor_cost: ot.labor_cost || 0, material_cost: ot.material_cost || 0, external_cost: ot.external_cost || 0 });
    setNewNote('');
  };

  const isEditable = selectedOT && ['CREATED', 'PLANNED', 'SCHEDULED', 'PENDIENTE', 'APROBADO'].includes(selectedOT.status);
  const isExecuting = selectedOT && ['EN_EJECUCION', 'CLOSED', 'EN_PROGRESO'].includes(selectedOT.status);

  // SLA targets by priority (hours)
  const SLA_HOURS = { P1: 24, P2: 72, P3: 168, P4: 720 };
  const getSlaDays = (ot) => {
    if (!ot?.created_at) return null;
    const sla = SLA_HOURS[ot.priority_code] || 168;
    const elapsed = (Date.now() - new Date(ot.created_at).getTime()) / 3600000;
    const pct = Math.min((elapsed / sla) * 100, 100);
    const remaining = Math.max(sla - elapsed, 0);
    return { sla, elapsed, pct, remaining, overdue: elapsed > sla };
  };

  // Save operations
  const saveOps = async () => {
    setOtSaving(true);
    try {
      const ops = otOps.map(({ _id, ...rest }) => rest);
      const totalHrs = ops.reduce((s, op) => s + (parseFloat(op.planned_hours) || 0), 0);
      await api.updateManagedWO(selectedOT.wo_id, { operations: ops, estimated_hours: totalHrs });
      toast.success(t('workOrders.operationsSaved') || 'Operaciones guardadas');
      reloadData();
    } catch (err) { toast.error(err.message); } finally { setOtSaving(false); }
  };

  // Save materials
  const saveMats = async () => {
    setOtSaving(true);
    try {
      const mats = otMats.map(({ _id, ...rest }) => rest);
      await api.updateManagedWO(selectedOT.wo_id, { materials: mats });
      toast.success(t('workOrders.materialsSaved') || 'Materiales guardados');
      reloadData();
    } catch (err) { toast.error(err.message); } finally { setOtSaving(false); }
  };

  // Save costs
  const saveCosts = async () => {
    setOtSaving(true);
    try {
      const total = (parseFloat(otCosts.labor_cost) || 0) + (parseFloat(otCosts.material_cost) || 0) + (parseFloat(otCosts.external_cost) || 0);
      await api.updateManagedWO(selectedOT.wo_id, { ...otCosts, actual_total_cost: total });
      toast.success(t('workOrders.costsSaved') || 'Costos actualizados');
      reloadData();
    } catch (err) { toast.error(err.message); } finally { setOtSaving(false); }
  };

  // Add execution note
  const addNote = async () => {
    if (!newNote.trim()) return;
    setOtSaving(true);
    try {
      await api.addManagedWONote(selectedOT.wo_id, { note: newNote.trim() });
      setNewNote('');
      toast.success(t('workOrders.noteAdded') || 'Nota agregada');
      // Reload the OT to get updated notes
      const updated = await api.getManagedWO(selectedOT.wo_id);
      setSelectedOT(updated);
    } catch (err) { toast.error(err.message); } finally { setOtSaving(false); }
  };

  // OT stats
  const otStats = useMemo(() => {
    const total = managedWOs.length;
    const byStatus = {};
    managedWOs.forEach(wo => { byStatus[wo.status] = (byStatus[wo.status] || 0) + 1; });
    return { total, ...byStatus };
  }, [managedWOs]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('workOrders.loadingWorkOrders')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-900 font-semibold mb-2">{t('workOrders.failedToLoad')}</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">{t('workOrders.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('workOrders.title')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('workOrders.subtitle')}
            {plant && <span className="ml-2 font-medium">({plant})</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-gray-300" onClick={handleExportWRs} disabled={!workOrdersData.length}>
            <Download className="w-4 h-4" />
            {t('workOrders.export')}
          </Button>

        </div>
      </div>

      {/* ═══ EXECUTIVE VIEW: KPI Cards + Charts ═══ */}
      {viewMode !== 'tactical' && (<>

      {/* Top Section: KPI Card + Main Chart */}
      <div className="grid grid-cols-12 gap-6">
        {/* KPI Card */}
        <div className="col-span-3">
          <Card className="p-6 bg-white border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">{t('workOrders.kpi')}</h3>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">WO</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">{latePercentage}%</span>
                {latePercentage > 5 && <ArrowUp className="w-6 h-6 text-red-500" />}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('workOrders.target')}:</span> 5%
              </p>
              <p className="text-xs text-gray-500">
                {t('workOrders.workOrdersCount').replace('{count}', filteredWRs.length).replace('{range}', selectedTimeRange)}
              </p>
            </div>
          </Card>
        </div>

        {/* Main Chart */}
        <div className="col-span-9">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('workOrders.workOrdersByDate')}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span>{t('workOrders.workOrdersPct')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-emerald-600 rounded"></div>
                    <span>{t('workOrders.cumulative')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-400 rounded"></div>
                    <span>{t('workOrders.targetLine')}</span>
                  </div>
                </div>
              </div>
            </div>
            {dailyLateWOData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={dailyLateWOData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    label={{ value: t('workOrders.date'), position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip />
                  <Bar dataKey="latePercentage" fill="#10b981" name={t('workOrders.workOrdersPct')} />
                  <Line
                    type="monotone"
                    dataKey="rolling30Day"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={false}
                    name={t('workOrders.cumulative')}
                  />
                  <Line
                    type="monotone"
                    dataKey="metaLine"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={t('workOrders.target')}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                {t('workOrders.noDataAvailable')}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Middle Section: Root Causes + Side Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Root Causes Chart */}
        <div className="col-span-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('workOrders.woTypesDistribution')}
              </h3>
            </div>
            {rootCausesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rootCausesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="cause"
                    width={180}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" label={{ position: 'right', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                {t('workOrders.noDataAvailable')}
              </div>
            )}
          </Card>
        </div>

        {/* Side Charts */}
        <div className="col-span-4 space-y-6">
          {/* By Priority Group */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {t('workOrders.byPriorityGroup')}
              </h3>
            </div>
            {delaysByShiftData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={delaysByShiftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="shift" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" label={{ position: 'top', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-gray-400 text-sm">
                {t('workOrders.noDataAvailable')}
              </div>
            )}
          </Card>

          {/* By Work Class */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {t('workOrders.byWorkClass')}
              </h3>
            </div>
            {delaysByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={delaysByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" label={{ position: 'top', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-gray-400 text-sm">
                {t('workOrders.noDataAvailable')}
              </div>
            )}
          </Card>
        </div>
      </div>

      </>)}

      {/* ═══ TACTICAL VIEW: OTs + WRs Tabbed ═══ */}
      {viewMode === 'tactical' && (<>

      {/* OT Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {['CREATED','PLANNED','SCHEDULED','RESCHEDULED','EN_EJECUCION','CLOSED','CANCELLED'].map(st => (
          <Card key={st} className={`p-3 bg-white cursor-pointer border-2 transition-all ${woTab === 'ots' ? 'hover:border-emerald-300' : ''}`}
            onClick={() => setWoTab('ots')}>
            <div className="text-xs text-gray-500 truncate">{st.replace(/_/g, ' ')}</div>
            <div className="text-xl font-bold text-gray-900">{otStats[st] || 0}</div>
          </Card>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setWoTab('ots')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${woTab === 'ots' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}>
          Órdenes de Trabajo ({managedWOs.length})
        </button>
        <button onClick={() => setWoTab('wrs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${woTab === 'wrs' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}>
          Notifications ({workOrdersData.length})
        </button>
      </div>

      {/* ── OTs Table ── */}
      {woTab === 'ots' && (
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Órdenes de Trabajo ({managedWOs.length})
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2 border-gray-300" onClick={handleExportOTs} disabled={!managedWOs.length}>
                <Download className="w-4 h-4" /> Excel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={() => setShowCreateOTModal(true)}>
                <Plus className="w-4 h-4" /> Create WO from Notification
              </Button>
            </div>
          </div>
          {managedWOs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">OT #</TableHead>
                    <TableHead className="font-semibold">Equipment</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...managedWOs].sort((a, b) => {
                    // Fast track OTs first, then by creation date
                    if (a.is_fast_track && !b.is_fast_track) return -1;
                    if (!a.is_fast_track && b.is_fast_track) return 1;
                    return 0;
                  }).map((wo) => {
                    const nextAct = OT_NEXT_ACTION[wo.status];
                    const NextIcon = nextAct?.icon;
                    return (
                      <TableRow key={wo.wo_id} className={`hover:bg-gray-50 cursor-pointer ${wo.is_fast_track ? 'bg-amber-50/50' : ''}`} onClick={() => openOTDetail(wo)}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-medium text-emerald-700">{wo.wo_number}</span>
                            {wo.is_fast_track && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-0.5 whitespace-nowrap">
                                <Zap size={8} /> FAST TRACK
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{wo.equipment_tag}</TableCell>
                        <TableCell className="max-w-xs text-sm truncate">{wo.description}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${
                            wo.wo_type === 'PM01' ? 'bg-red-100 text-red-700' :
                            wo.wo_type === 'PM02' ? 'bg-blue-100 text-blue-700' :
                            wo.wo_type === 'PM03' ? 'bg-purple-100 text-purple-700' :
                            wo.wo_type === 'PM05' ? 'bg-cyan-100 text-cyan-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{{ PM01: 'PM01 - Corrective', PM02: 'PM02 - Preventivo', PM03: 'PM03 - Scheduled', PM05: 'PM05 - Calib./Reparación' }[wo.wo_type] || wo.wo_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCriticalityColor(wo.priority_code === 'P1' || wo.priority_code === 'P2' ? 'High' : wo.priority_code === 'P3' ? 'Medium' : 'Low')}>
                            {wo.priority_code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={OT_STATUS_COLORS[wo.status] || 'bg-gray-100 text-gray-700'}>
                            {wo.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${wo.completion_pct || 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(wo.completion_pct || 0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {nextAct && (
                            <Button size="sm" variant="outline"
                              className="text-xs h-7 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={(e) => { e.stopPropagation(); handleOTTransition(wo, nextAct.action); }}>
                              {NextIcon && <NextIcon className="w-3 h-3 mr-1" />}
                              {nextAct.label}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              <div className="text-center">
                <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No work orders</p>
                <p className="text-xs mt-1">Crea una OT desde un aviso aprobado o manualmente</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── WRs Table (Notifications) ── */}
      {woTab === 'wrs' && (
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications ({workOrdersData.length})
            </h3>
            <Button variant="outline" className="flex items-center gap-2 border-gray-300" onClick={handleExportWRs} disabled={!workOrdersData.length}>
              <Download className="w-4 h-4" /> Excel
            </Button>
          </div>
          {workOrdersData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold w-12">N°</TableHead>
                    <TableHead className="font-semibold">{t('workOrders.woId')}</TableHead>
                    <TableHead className="font-semibold cursor-pointer select-none hover:text-emerald-700" onClick={() => setWrSortBy(prev => prev === 'date_desc' ? 'date_asc' : 'date_desc')}>
                      Fecha {wrSortBy === 'date_desc' ? '↓' : '↑'}
                    </TableHead>
                    <TableHead className="font-semibold">{t('workOrders.equipmentCol')}</TableHead>
                    <TableHead className="font-semibold">{t('workOrders.descriptionCol')}</TableHead>
                    <TableHead className="font-semibold">{t('workOrders.priorityCol')}</TableHead>
                    <TableHead className="font-semibold">{t('workOrders.statusCol')}</TableHead>
                    <TableHead className="font-semibold">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...workOrdersData].sort((a, b) => {
                    const dateA = a._raw?.created_at ? new Date(a._raw.created_at).getTime() : 0;
                    const dateB = b._raw?.created_at ? new Date(b._raw.created_at).getTime() : 0;
                    return wrSortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
                  }).map((wo, idx) => (
                    <TableRow key={wo.id + '-' + idx} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedWorkOrder(wo)}>
                      <TableCell className="text-xs text-gray-400 font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-sm">{wo.id}</TableCell>
                      <TableCell className="text-xs text-gray-500">{wo._raw?.created_at ? new Date(wo._raw.created_at).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-sm">{wo._raw?.equipment_tag || t('workOrders.na')}</TableCell>
                      <TableCell className="max-w-xs text-sm truncate">{wo.description}</TableCell>
                      <TableCell>
                        <Badge className={getCriticalityColor(wo.criticality)}>
                          {wo._raw?.priority_code || wo.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            wo.status === 'APPROVED' || wo.status === 'VALIDATED' ? 'bg-green-500' :
                            wo.status === 'REJECTED' ? 'bg-red-500' :
                            wo.status === 'EN_EJECUCION' || wo.status === 'EN_PROGRESO' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm">{wo.status.replace(/_/g, ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {wo.status === 'PENDING_VALIDATION' && ['admin', 'manager'].includes(user?.role) && (
                            <>
                              <button title="Validar" onClick={(e) => { e.stopPropagation(); handleValidateWR(wo._raw?.request_id || wo.id); }}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button title="Reject" onClick={(e) => { e.stopPropagation(); handleRejectWR(wo._raw?.request_id || wo.id); }}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {['VALIDATED', 'APPROVED', 'ASSIGNED'].includes(wo.status) && (
                            <Button size="sm" variant="outline"
                              className="text-xs h-7 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={(e) => { e.stopPropagation(); handleCreateOTFromWR(wo._raw); }}>
                              <FileText className="w-3 h-3 mr-1" /> Create WO
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              <div className="text-center">
                <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">{t('workOrders.noWorkOrders')}</p>
                <p className="text-xs mt-1">{t('workOrders.noWorkOrdersHint')}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Work Order Detail Dialog */}
      {selectedWorkOrder && (
        <WorkOrderDetailDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onCreateAction={(wo) => {
            setSelectedWorkOrder(null);
          }}
        />
      )}

      {/* Create OT Modal — solo desde Aviso aprobado (Jorge: "las órdenes no se crean manualmente") */}
      {showCreateOTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateOTModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('workOrders.createOTTitle') || 'Create Work Order'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t('workOrders.createOTSubtitle') || 'Selecciona un aviso aprobado para generar la OT'}</p>
                </div>
                <button onClick={() => setShowCreateOTModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {approvedWRs.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.approvedWRs') || 'Approved Notifications'}</label>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {approvedWRs.map(wr => (
                      <div key={wr.request_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {wr.equipment_tag} — {wr.problem_description?.original_text || 'Sin descripción'}
                          </div>
                          <div className="text-xs text-gray-500">{wr.priority_code || 'P3'} · {wr.status}</div>
                        </div>
                        <Button size="sm" className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-xs h-7"
                          onClick={() => handleCreateOTFromWR(wr)} disabled={creatingOT}>
                          <ArrowRight className="w-3 h-3 mr-1" /> {t('workOrders.createOTShort') || 'Create WO'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <ClipboardCheck className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{t('workOrders.noApprovedWRs') || 'No approved notifications pendientes'}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('workOrders.noApprovedWRsHint') || 'Los avisos deben ser aprobados por un supervisor antes de generar una OT'}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-5 rounded-b-xl flex justify-end">
              <Button variant="outline" onClick={() => setShowCreateOTModal(false)}>{t('common.close')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Order Modal — full SAP PM form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('workOrders.createTitle')}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t('workOrders.createSubtitle')}</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Hidden camera input */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleCameraChange} className="hidden" />

              {/* 1. Qué pasó? + Voice / Camera */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('workOrders.whatHappens')}</label>
                  <div className="flex gap-2">
                    {SpeechRecognition ? (
                      <button type="button" onClick={handleVoice}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        {isRecording ? t('workOrders.voiceRecording') || 'Grabando...' : t('workOrders.voiceButton') || 'Voz'}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" title="Requiere HTTPS para funcionar">
                        <Mic className="w-3.5 h-3.5" /> {t('workOrders.voiceButton') || 'Voz'}
                      </span>
                    )}
                    <button type="button" onClick={handleCameraClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      {t('workOrders.photoButton') || 'Foto'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={createForm.whatHappens}
                  onChange={e => setF('whatHappens', e.target.value)}
                  placeholder={t('workOrders.whatHappensPlaceholder')}
                  rows={3}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none ${isRecording ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
                />
                {/* AI Assist button */}
                {createForm.whatHappens.trim().length > 10 && (
                  <div className="mt-2">
                    <button type="button" onClick={handleAssistAI} disabled={aiLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all w-full justify-center ${aiLoading ? 'border-purple-300 bg-purple-50 text-purple-400 animate-pulse' : 'border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-500'}`}>
                      <Zap className="w-4 h-4" />
                      {aiLoading ? 'Analizando...' : 'Asistir con IA'}
                    </button>
                    {aiDuplicates.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-xs font-bold text-amber-800 mb-1">⚠ Notifications similares abiertos:</p>
                        {aiDuplicates.slice(0, 3).map(d => (
                          <div key={d.request_id} className="text-xs text-amber-700 flex items-center gap-2 py-0.5">
                            <span className="font-mono">{(d.request_id || '').slice(0, 8)}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] font-bold">{d.status}</span>
                            <span className="truncate">{d.problem_description?.slice(0, 60)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Photo strip */}
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={photo} alt={`Foto ${i+1}`} className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200" />
                        <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={handleCameraClick} className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] mt-0.5">+</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Condición del Equipo + Priority (arriba para visibilidad) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.plantCondition')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLANT_CONDITIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setF('plantCondition', opt.value);
                          if (opt.value === 'stopped' && createForm.priority !== 'P1') {
                            setF('priority', 'P1');
                            setF('activityClass', ACTIVITY_CLASSES['PM03']?.[0]?.value || 'M002');
                          }
                        }}
                        className="p-2.5 rounded-xl border-2 transition-all text-sm font-bold"
                        style={{
                          borderColor: createForm.plantCondition === opt.value ? opt.color : '#e5e7eb',
                          backgroundColor: createForm.plantCondition === opt.value ? opt.color + '15' : 'transparent',
                          color: createForm.plantCondition === opt.value ? opt.color : '#64748B',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border rounded-xl p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.priorityLabel')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => { setF('priority', p.value); setF('activityClass', ['P1','P2'].includes(p.value) ? 'M002' : 'M001'); }}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 text-center transition-all ${createForm.priority === p.value ? 'scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                        style={{ borderColor: createForm.priority === p.value ? p.color : '#e5e7eb', backgroundColor: createForm.priority === p.value ? p.bg : 'transparent' }}
                      >
                        <div className="text-sm font-bold" style={{ color: p.color }}>{p.value}</div>
                        <div className="text-[9px] text-gray-500 leading-tight">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breakdown alert */}
              {createForm.plantCondition === 'stopped' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-medium">{t('workOrders.breakdownAlert') || 'Equipo detenido — Priority ajustada a P1 (Urgent). Clase OT: PM03 No Scheduled.'}</span>
                </div>
              )}

              {/* 3. ¿Dónde? TAG equipo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.whereTag')}</label>
                {!selectedEquip ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={equipSearch}
                      onChange={e => { setEquipSearch(e.target.value); setShowEquipSearch(true); }}
                      onFocus={() => equipSearch.length >= 2 && setShowEquipSearch(true)}
                      placeholder={t('workOrders.searchTagPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    {equipSearch.length >= 2 && equipResults.length === 0 && (
                      <button onClick={() => { selectEquip({ tag: equipSearch, name: `${equipSearch} (No catalogado)` }); }} className="w-full mt-1 p-2 text-xs text-left rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                        {(t('workOrders.useManualTag') || 'Usar TAG manual: {tag}').replace('{tag}', equipSearch)}
                      </button>
                    )}
                    {showEquipSearch && equipResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                        {equipResults.map((node, i) => (
                          <button key={node.node_id || i} onClick={() => selectEquip(node)} className="w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="text-sm font-bold text-gray-900">{node.tag || node.code}</div>
                            <div className="text-xs text-gray-500">{node.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500">
                    <div>
                      <div className="text-sm font-bold text-emerald-700">{createForm.whereTag}</div>
                      <div className="text-xs text-emerald-600">{selectedEquip.name}</div>
                    </div>
                    <button onClick={() => { setSelectedEquip(null); setF('whereTag', ''); clearLocation(); }}>
                      <X className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Ubicación Técnica (SAP) */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {t('workOrders.technicalLocation')}
                </label>
                {!selectedLoc ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={locSearch}
                      onChange={e => { setLocSearch(e.target.value); setShowLocSearch(true); }}
                      onFocus={() => locSearch.length >= 2 && setShowLocSearch(true)}
                      placeholder={t('workOrders.technicalLocationPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    {showLocSearch && locResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                        {locResults.map((node, i) => (
                          <button key={node.node_id || i} onClick={() => selectLocation(node)} className="w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{node.node_type}</span>
                              <span className="text-sm font-bold text-gray-900">{node._funcLoc}</span>
                            </div>
                            <div className="text-xs text-gray-500">{node.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border-2 border-blue-500">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                        <span className="text-sm font-bold font-mono truncate text-blue-800">{createForm.technicalLocationCode}</span>
                      </div>
                      <div className="text-xs text-blue-600">{createForm.technicalLocation}</div>
                    </div>
                    <button onClick={clearLocation} className="flex-shrink-0 ml-2">
                      <X className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
                )}
                {selectedEquip && selectedLoc && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle className="w-3 h-3" /> {t('workOrders.technicalLocationAuto')} {createForm.whereTag}
                  </div>
                )}
              </div>

              {/* 4. Catálogo de Falla */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('workOrders.failureCatalog')}</label>
                </div>
                <div className="flex gap-1 mb-3 p-1 rounded-lg bg-gray-100">
                  {Object.entries(FAILURE_CATALOG).map(([key, cat]) => (
                    <button key={key} onClick={() => { setF('failureCategory', key); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', ''); }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${createForm.failureCategory === key ? 'bg-white shadow-sm' : ''}`}
                      style={{ color: createForm.failureCategory === key ? cat.color : '#94a3b8' }}>{cat.label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <div className="text-xs font-medium text-gray-600 mb-1">{t('workOrders.symptomLabel')}</div>
                    <button onClick={() => { setShowSymptoms(!showSymptoms); setShowParts(false); setShowCauses(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                      style={{ borderColor: createForm.failureSymptom ? FAILURE_CATALOG[createForm.failureCategory].color : '#e5e7eb' }}>
                      <span className={createForm.failureSymptom ? 'text-gray-900 font-medium' : 'text-gray-400'}>{createForm.failureSymptom || t('workOrders.selectPlaceholder')}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showSymptoms && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                        {FAILURE_CATALOG[createForm.failureCategory].symptoms.map(s => (
                          <button key={s} onClick={() => { setF('failureSymptom', s); setShowSymptoms(false); }}
                            className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${createForm.failureSymptom === s ? 'font-bold bg-gray-50' : ''}`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="text-xs font-medium text-gray-600 mb-1">{t('workOrders.objectPartLabel')}</div>
                    <button onClick={() => { setShowParts(!showParts); setShowSymptoms(false); setShowCauses(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                      style={{ borderColor: createForm.failureObjectPart ? FAILURE_CATALOG[createForm.failureCategory].color : '#e5e7eb' }}>
                      <span className={createForm.failureObjectPart ? 'text-gray-900 font-medium' : 'text-gray-400'}>{createForm.failureObjectPart || t('workOrders.selectPlaceholder')}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showParts && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                        {FAILURE_CATALOG[createForm.failureCategory].parts.map(p => (
                          <button key={p} onClick={() => { setF('failureObjectPart', p); setShowParts(false); }}
                            className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${createForm.failureObjectPart === p ? 'font-bold bg-gray-50' : ''}`}>{p}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="text-xs font-medium text-gray-600 mb-1">{t('workOrders.causeLabel')}</div>
                    <button onClick={() => { setShowCauses(!showCauses); setShowSymptoms(false); setShowParts(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg border text-xs text-left"
                      style={{ borderColor: createForm.failureCause ? FAILURE_CATALOG[createForm.failureCategory].color : '#e5e7eb' }}>
                      <span className={createForm.failureCause ? 'text-gray-900 font-medium' : 'text-gray-400'}>{createForm.failureCause || t('workOrders.selectPlaceholder')}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showCauses && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                        {FAILURE_CATALOG[createForm.failureCategory].causes.map(c => (
                          <button key={c} onClick={() => { setF('failureCause', c); setShowCauses(false); }}
                            className={`w-full text-left px-2 py-1.5 text-xs border-b last:border-b-0 hover:bg-gray-50 ${createForm.failureCause === c ? 'font-bold bg-gray-50' : ''}`}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Acción Sugerida */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.suggestedAction')}</label>
                <textarea value={createForm.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)} placeholder={t('workOrders.suggestedActionPlaceholder')} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
              </div>

              {/* 6. Circunstancias / Detalle */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.circumstances')}</label>
                <textarea
                  value={createForm.circumstances}
                  onChange={e => setF('circumstances', e.target.value)}
                  placeholder={t('workOrders.circumstancesPlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
                <div className="text-[10px] text-gray-400 mt-1">{t('workOrders.circumstancesSapNote')}</div>
              </div>

              {/* 7. Resources necesarios */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('workOrders.requiredResources')}</label>
                  <button onClick={addResource} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                    {t('workOrders.addButton')}
                  </button>
                </div>
                {createForm.resources.length === 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.resourceType')}</div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.resourceQty')}</div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.resourceHours')}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {createForm.resources.map((res, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-gray-50">
                        <div className="relative">
                          <input type="text" placeholder={t('workOrders.resourceType')} value={res.type}
                            onChange={e => { updateResource(i, 'type', e.target.value); setActiveResTypeIdx(i); }}
                            onFocus={() => setActiveResTypeIdx(i)}
                            onBlur={() => setTimeout(() => setActiveResTypeIdx(-1), 150)}
                            className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          {activeResTypeIdx === i && (
                            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {RESOURCE_TYPES.filter(rt => !res.type || rt.toLowerCase().includes(res.type.toLowerCase())).map(rt => (
                                <button key={rt} onClick={() => { updateResource(i, 'type', rt); setActiveResTypeIdx(-1); }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 border-b last:border-b-0">{rt}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input type="text" placeholder={t('workOrders.resourceQty')} value={res.quantity} onChange={e => updateResource(i, 'quantity', e.target.value)}
                            className="w-full p-2 pr-16 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">personas</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="relative flex-1">
                            <input type="text" placeholder={t('workOrders.resourceHours')} value={res.hours} onChange={e => updateResource(i, 'hours', e.target.value)}
                              className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">hrs</span>
                          </div>
                          <button onClick={() => removeResource(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. Duración estimada */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t('workOrders.estimatedDuration')}</label>
                <input type="text" value={createForm.estimatedDuration} onChange={e => setF('estimatedDuration', e.target.value)} placeholder={t('workOrders.estimatedDurationPlaceholder')} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              {/* 9. SAP Materials */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('workOrders.materialsSap')}</label>
                  </div>
                  <button onClick={addMaterial} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                    {t('workOrders.addButton')}
                  </button>
                </div>
                {createForm.materials.length === 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.materialSapId')}</div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.materialQty')}</div>
                    <div className="p-2.5 rounded-lg bg-gray-50 border text-xs text-gray-400">{t('workOrders.materialDescription')}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {createForm.materials.map((mat, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-gray-50">
                        <div className="relative">
                          <input type="text" placeholder={t('workOrders.materialSapId')} value={mat.sapId}
                            onChange={e => { updateMaterial(i, 'sapId', e.target.value); setActiveMatSapIdx(i); }}
                            onFocus={() => setActiveMatSapIdx(i)}
                            onBlur={() => setTimeout(() => setActiveMatSapIdx(-1), 150)}
                            className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          {activeMatSapIdx === i && (
                            <div className="absolute z-20 left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{ minWidth: '280px' }}>
                              {COMMON_MATERIALS.filter(m => !mat.sapId || m.sapId.includes(mat.sapId) || m.desc.toLowerCase().includes(mat.sapId.toLowerCase())).map(m => (
                                <button key={m.sapId} onClick={() => { updateMaterial(i, 'sapId', m.sapId); updateMaterial(i, 'description', m.desc); setActiveMatSapIdx(-1); }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 border-b last:border-b-0">
                                  <span className="font-mono text-emerald-700">{m.sapId}</span> — {m.desc}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input type="text" placeholder={t('workOrders.materialQty')} value={mat.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                            className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">uds</span>
                        </div>
                        <div className="flex gap-1">
                          <input type="text" placeholder={t('workOrders.materialDescription')} value={mat.description} onChange={e => updateMaterial(i, 'description', e.target.value)}
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          <button onClick={() => removeMaterial(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 10. Equipos Especiales */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.specialEquipment')}</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input type="text" value={createForm.specialEquipment}
                    onChange={e => { setF('specialEquipment', e.target.value); setShowSpecEquip(true); }}
                    onFocus={() => setShowSpecEquip(true)}
                    onBlur={() => setTimeout(() => setShowSpecEquip(false), 150)}
                    placeholder={t('workOrders.specialEquipmentPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                  {showSpecEquip && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {SPECIAL_EQUIPMENT.filter(se => !createForm.specialEquipment || se.toLowerCase().includes(createForm.specialEquipment.toLowerCase())).map(se => (
                        <button key={se} onClick={() => {
                          const cur = createForm.specialEquipment;
                          setF('specialEquipment', cur ? `${cur}, ${se}` : se);
                          setShowSpecEquip(false);
                        }} className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b last:border-b-0">{se}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 11. Notification Author (auto - read only) */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t('workOrders.reportedByLabel')}</label>
                <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
                  {user?.full_name || user?.username || 'Sistema'}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Assigned Toutomáticamente — no editable</div>
              </div>

              {/* 12. Support Equipment */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.supportEquipment')}</label>
                <input
                  type="text"
                  value={createForm.supportEquipment}
                  onChange={e => setF('supportEquipment', e.target.value)}
                  placeholder={t('workOrders.supportEquipmentPlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="text-[10px] text-gray-400 mt-1">{t('workOrders.supportEquipmentNote')}</div>
              </div>

              {/* 13-14. Condición y Priority movidos arriba del formulario */}

              {/* 15. Clase de Actividad */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.activityClassLabel').replace('{code}', claseOT)}</label>
                <div className="grid grid-cols-3 gap-2">
                  {actClasses.map(ac => (
                    <button
                      key={ac.value}
                      onClick={() => setF('activityClass', ac.value)}
                      className={`p-2.5 rounded-lg border-2 text-xs font-semibold text-center transition-all ${createForm.activityClass === ac.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {ac.value} — {ac.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-5 rounded-b-xl flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {selectedPriority && <span className="font-mono px-2 py-1 rounded" style={{ backgroundColor: selectedPriority.bg, color: selectedPriority.color }}>{selectedPriority.value} / {claseOT}</span>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>{t('workOrders.cancel')}</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={creating || !canCreate}>
                  {creating ? t('workOrders.creating') : t('workOrders.createWorkRequest')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Aviso Creado — Success Popup ── */}
      {createdWRId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setCreatedWRId(null); setShowCreateModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aviso Creado</h3>
            <p className="text-sm text-gray-500 mb-4">Tu aviso ha sido enviado para revision</p>
            <div className="inline-block px-4 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 mb-6">
              <div className="text-xs text-emerald-600 font-medium">ID</div>
              <div className="text-lg font-bold text-emerald-700 font-mono">{createdWRId.slice(0, 13)}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setCreatedWRId(null); setShowCreateModal(false); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver WRs
              </button>
              <button
                onClick={() => { setCreatedWRId(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Professional OT Detail Modal ── */}
      {selectedOT && (() => {
        const sla = getSlaDays(selectedOT);
        const WO_TYPE_LABELS = { PM01: 'PM01 - Corrective', PM02: 'PM02 - Preventivo', PM03: 'PM03 - Scheduled', PM05: 'PM05 - Calib./Reparación' };
        const SPECIALTY_OPTIONS = ['Mechanical', 'Electrical', 'Instrumentation', 'Welder', 'Lubrication', 'Scaffolding', 'Insulation', 'Operator', 'Supervisor', 'Other'];
        const OP_TYPE_OPTIONS = [{ value: 'INT', label: 'INT' }, { value: 'EXT', label: 'EXT' }];
        const OT_TABS = [
          { id: 'resumen', label: 'Summary', icon: Info },
          { id: 'operaciones', label: 'Operaciones', icon: List },
          { id: 'materiales', label: 'Materials', icon: Package },
          { id: 'costos', label: 'Costos', icon: DollarSign },
          { id: 'historial', label: 'History', icon: MessageSquare },
        ];
        return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedOT(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* ═══ HEADER ═══ */}
            <div className="border-b px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">{selectedOT.wo_number}</h2>
                    <Badge className={OT_STATUS_COLORS[selectedOT.status] || 'bg-gray-100'}>{selectedOT.status.replace(/_/g, ' ')}</Badge>
                    {selectedOT.is_fast_track && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300"><Zap size={8} className="inline" /> FAST TRACK</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{selectedOT.equipment_tag}</span>
                    <span>{WO_TYPE_LABELS[selectedOT.wo_type] || selectedOT.wo_type}</span>
                    <span>{selectedOT.priority_code}</span>
                    {selectedOT.work_request_id && (
                      <span className="text-blue-600 underline cursor-pointer hover:text-blue-800" onClick={() => navigate('/work-requests')}>
                        Aviso: {selectedOT.work_request_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
                {/* SLA indicator */}
                {sla && !['CLOSED', 'CANCELLED'].includes(selectedOT.status) && (
                  <div className={`text-center px-3 py-1.5 rounded-lg border text-xs ${sla.overdue ? 'bg-red-50 border-red-200 text-red-700' : sla.pct > 75 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <div className="font-semibold">{sla.overdue ? 'SLA Vencido' : `${Math.round(sla.remaining)}h restantes`}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className={`h-1.5 rounded-full ${sla.overdue ? 'bg-red-500' : sla.pct > 75 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(sla.pct, 100)}%` }} />
                    </div>
                  </div>
                )}
                <button onClick={() => setSelectedOT(null)} className="p-2 hover:bg-gray-100 rounded-lg ml-3"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-3 -mb-4 border-b-0">
                {OT_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setOtDetailTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 transition-colors ${otDetailTab === tab.id ? 'bg-white text-emerald-700 border-gray-200' : 'bg-gray-50 text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'}`}>
                      <Icon size={13} /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══ TAB CONTENT ═══ */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ─── TAB: RESUMEN ─── */}
              {otDetailTab === 'resumen' && (
                <div className="space-y-4">
                  {/* Productive Impact Banner */}
                  <div className={`rounded-xl p-4 border-2 flex items-center justify-between ${
                    selectedOT.priority_code === 'P1' ? 'bg-red-50 border-red-300' :
                    selectedOT.priority_code === 'P2' ? 'bg-orange-50 border-orange-300' :
                    selectedOT.priority_code === 'P3' ? 'bg-yellow-50 border-yellow-300' :
                    'bg-green-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                        selectedOT.priority_code === 'P1' ? 'bg-red-600' :
                        selectedOT.priority_code === 'P2' ? 'bg-orange-500' :
                        selectedOT.priority_code === 'P3' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {selectedOT.priority_code === 'P1' ? '!' : selectedOT.priority_code === 'P2' ? '!!' : selectedOT.priority_code === 'P3' ? '-' : '\u2713'}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Production Impact</div>
                        <div className="text-lg font-bold">{selectedOT.priority_code === 'P1' ? 'CRITICO' : selectedOT.priority_code === 'P2' ? 'ALTO' : selectedOT.priority_code === 'P3' ? 'MEDIO' : 'BAJO'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Score Criticidad</div>
                      <div className={`text-3xl font-bold ${
                        selectedOT.priority_code === 'P1' ? 'text-red-600' :
                        selectedOT.priority_code === 'P2' ? 'text-orange-600' :
                        selectedOT.priority_code === 'P3' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{selectedOT.priority_code === 'P1' ? '95' : selectedOT.priority_code === 'P2' ? '75' : selectedOT.priority_code === 'P3' ? '45' : '20'}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-semibold">{Math.round(selectedOT.completion_pct || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${selectedOT.completion_pct || 0}%` }} />
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Planned Hrs</div>
                      <div className="text-lg font-bold text-gray-900">{selectedOT.estimated_hours || 0}h</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Actual Hrs</div>
                      <div className={`text-lg font-bold ${(selectedOT.actual_hours || 0) > (selectedOT.estimated_hours || 0) ? 'text-red-600' : 'text-gray-900'}`}>{selectedOT.actual_hours || 0}h</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Costo Plan</div>
                      <div className="text-lg font-bold text-gray-900">${(selectedOT.budget_amount || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Costo Real</div>
                      <div className={`text-lg font-bold ${(selectedOT.actual_total_cost || 0) > (selectedOT.budget_amount || 0) && selectedOT.budget_amount ? 'text-red-600' : 'text-gray-900'}`}>${(selectedOT.actual_total_cost || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-gray-500 text-xs block mb-1">Descripción</label>
                    {isEditable ? (
                      <textarea className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" rows={2} defaultValue={selectedOT.description}
                        onBlur={async (e) => {
                          if (e.target.value !== selectedOT.description) {
                            await api.updateManagedWO(selectedOT.wo_id, { description: e.target.value });
                            reloadData();
                          }
                        }} />
                    ) : (
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2.5">{selectedOT.description || '—'}</p>
                    )}
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {isEditable ? (
                      <>
                        <div>
                          <label className="text-gray-500 text-xs block mb-1">Tipo OT</label>
                          <select className="w-full border rounded-lg p-2 text-sm" defaultValue={selectedOT.wo_type}
                            onChange={async (e) => { await api.updateManagedWO(selectedOT.wo_id, { wo_type: e.target.value }); reloadData(); }}>
                            {Object.entries(WO_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs block mb-1">Priority</label>
                          <select className="w-full border rounded-lg p-2 text-sm" defaultValue={selectedOT.priority_code}
                            onChange={async (e) => { await api.updateManagedWO(selectedOT.wo_id, { priority_code: e.target.value }); reloadData(); }}>
                            <option value="P1">P1 - Urgent</option>
                            <option value="P2">P2 - Programa en Ejecución</option>
                            <option value="P3">P3 - Próximo Programa</option>
                            <option value="P4">P4 - Parada de Planta</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs block mb-1">Estimated Hours</label>
                          <input type="number" className="w-full border rounded-lg p-2 text-sm" defaultValue={selectedOT.estimated_hours}
                            onBlur={async (e) => { const val = parseFloat(e.target.value); if (val !== selectedOT.estimated_hours) { await api.updateManagedWO(selectedOT.wo_id, { estimated_hours: val }); reloadData(); } }} />
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs block mb-1">Budget ($)</label>
                          <input type="number" className="w-full border rounded-lg p-2 text-sm" defaultValue={selectedOT.budget_amount || 0}
                            onBlur={async (e) => { await api.updateManagedWO(selectedOT.wo_id, { budget_amount: parseFloat(e.target.value) || 0 }); reloadData(); }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Type</span><span className="font-medium">{WO_TYPE_LABELS[selectedOT.wo_type] || selectedOT.wo_type}</span></div>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Clase</span><span className="font-medium">{selectedOT.work_class || '—'}</span></div>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Inicio Plan.</span><span className="font-medium">{selectedOT.planned_start ? new Date(selectedOT.planned_start).toLocaleDateString() : '—'}</span></div>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Fin Plan.</span><span className="font-medium">{selectedOT.planned_end ? new Date(selectedOT.planned_end).toLocaleDateString() : '—'}</span></div>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Inicio Real</span><span className="font-medium">{selectedOT.actual_start ? new Date(selectedOT.actual_start).toLocaleDateString() : '—'}</span></div>
                        <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500 text-xs block">Fin Real</span><span className="font-medium">{selectedOT.actual_end ? new Date(selectedOT.actual_end).toLocaleDateString() : '—'}</span></div>
                      </>
                    )}
                  </div>

                  {/* Assigned workers */}
                  {selectedOT.assigned_workers?.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-xs block mb-1"><Users size={12} className="inline mr-1" />Personal Asignado</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedOT.assigned_workers.map((w, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                            <Users size={10} /> {w.name || w.worker_id} {w.specialty && <span className="text-emerald-500">({w.specialty})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: OPERACIONES ─── */}
              {otDetailTab === 'operaciones' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Operations / Work Steps</h3>
                      <p className="text-xs text-gray-500">Define las operaciones necesarias, especialidad y horas planificadas</p>
                    </div>
                    <div className="flex gap-2">
                      {isEditable && (
                        <Button size="sm" variant="outline" onClick={() => setOtOps(prev => [...prev, { _id: Date.now(), step: prev.length + 1, description: '', op_type: 'INT', specialty: 'Mechanical', quantity: 1, duration: 1, planned_hours: 1, actual_hours: 0 }])}>
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      )}
                      {isEditable && otOps.length > 0 && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveOps} disabled={otSaving}>
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                      )}
                    </div>
                  </div>

                  {otOps.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <List className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No operations definidas</p>
                      {isEditable && <p className="text-xs mt-1">Agrega pasos de trabajo con especialidad y horas</p>}
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-10">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-28">Specialty</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Cant.</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Duración</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">HH Plan</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">HH Real</th>
                            {isEditable && <th className="px-3 py-2 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {otOps.map((op, idx) => {
                            const hhPlan = (parseFloat(op.quantity) || 1) * (parseFloat(op.duration) || 1);
                            return (
                            <tr key={op._id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-400 font-mono text-xs">{idx + 1}</td>
                              <td className="px-3 py-2">
                                {isEditable ? (
                                  <input type="text" className="w-full border-0 border-b border-gray-200 p-0 text-sm focus:border-emerald-400 focus:ring-0 bg-transparent" placeholder="Título de la operación..."
                                    value={op.description} onChange={(e) => setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, description: e.target.value } : o))} />
                                ) : <span>{op.description || '—'}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <select className={`w-full border-0 border-b-2 p-0 text-xs text-center font-bold focus:ring-0 rounded ${(op.op_type || 'INT') === 'EXT' ? 'border-purple-400 text-purple-700 bg-purple-50' : 'border-blue-400 text-blue-700 bg-blue-50'}`}
                                    value={op.op_type || 'INT'} onChange={(e) => setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, op_type: e.target.value } : o))}>
                                    {OP_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                  </select>
                                ) : <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${op.op_type === 'EXT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{op.op_type || 'INT'}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditable ? (
                                  <select className="w-full border-0 border-b border-gray-200 p-0 text-xs focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={op.specialty || 'Mechanical'} onChange={(e) => setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, specialty: e.target.value } : o))}>
                                    {SPECIALTY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                ) : <span className="text-xs">{op.specialty || '—'}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <input type="number" min="1" className="w-12 border-0 border-b border-gray-200 p-0 text-sm text-center focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={op.quantity || 1} onChange={(e) => { const q = parseInt(e.target.value) || 1; setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, quantity: q, planned_hours: q * (parseFloat(o.duration) || 1) } : o)); }} />
                                ) : <span>{op.quantity || 1}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <input type="number" min="0.5" step="0.5" className="w-12 border-0 border-b border-gray-200 p-0 text-sm text-center focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={op.duration || 1} onChange={(e) => { const d = parseFloat(e.target.value) || 1; setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, duration: d, planned_hours: (parseInt(o.quantity) || 1) * d } : o)); }} />
                                ) : <span>{op.duration || 1}</span>}
                              </td>
                              <td className="px-3 py-2 text-center font-medium">{hhPlan}h</td>
                              <td className="px-3 py-2 text-center">
                                {isExecuting ? (
                                  <input type="number" className="w-14 border-0 border-b border-gray-200 p-0 text-sm text-center focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={op.actual_hours || ''} onChange={(e) => setOtOps(prev => prev.map(o => o._id === op._id ? { ...o, actual_hours: parseFloat(e.target.value) || 0 } : o))} />
                                ) : <span className={`${(op.actual_hours || 0) > hhPlan ? 'text-red-600 font-semibold' : ''}`}>{op.actual_hours || 0}h</span>}
                              </td>
                              {isEditable && (
                                <td className="px-3 py-2">
                                  <button onClick={() => setOtOps(prev => prev.filter(o => o._id !== op._id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </td>
                              )}
                            </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold">
                          <tr>
                            <td className="px-3 py-2" colSpan={6}><span className="text-xs text-gray-500">TOTAL</span></td>
                            <td className="px-3 py-2 text-center text-xs">{otOps.reduce((s, o) => s + ((parseInt(o.quantity) || 1) * (parseFloat(o.duration) || 1)), 0)}h</td>
                            <td className="px-3 py-2 text-center text-xs">{otOps.reduce((s, o) => s + (parseFloat(o.actual_hours) || 0), 0)}h</td>
                            {isEditable && <td></td>}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* Labour summary by specialty */}
                  {otOps.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Summary by Specialty</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(otOps.reduce((acc, op) => { const s = op.specialty || 'Sin definir'; acc[s] = (acc[s] || 0) + (parseFloat(op.planned_hours) || 0); return acc; }, {})).map(([spec, hrs]) => (
                          <span key={spec} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-200">
                            {spec}: {hrs}h
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExecuting && otOps.length > 0 && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveOps} disabled={otSaving}>
                      <Save className="w-3 h-3 mr-1" /> Save Actual Hours
                    </Button>
                  )}

                  {/* AI Copilot for planning */}
                  {isEditable && otOps.length === 0 && selectedOT?.description && (
                    <button type="button" onClick={async () => {
                      try {
                        const res = await api.aiAssistWR({
                          description: selectedOT.description,
                          equipment_tag: selectedOT.equipment_tag || '',
                          plant_condition: '',
                          existing_priority: selectedOT.priority_code || '',
                          existing_category: '',
                          existing_action: '',
                        });
                        const s = res.suggestions || {};
                        if (s.resources?.length > 0) {
                          setOtOps(s.resources.map((r, i) => ({
                            _id: Date.now() + i,
                            description: s.suggestedAction || selectedOT.description?.slice(0, 100) || 'Intervención',
                            op_type: r.op_type || 'INT',
                            specialty: r.type || 'Mechanical',
                            quantity: r.quantity || 1,
                            duration: r.hours || 1,
                            planned_hours: (r.quantity || 1) * (r.hours || 1),
                            actual_hours: 0,
                          })));
                          toast.success(`IA sugirió ${s.resources.length} operación(es)`);
                        }
                      } catch { toast.error('Error al obtener sugerencias'); }
                    }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all w-full justify-center">
                      <Zap className="w-4 h-4" /> Sugerir operaciones con IA
                    </button>
                  )}
                </div>
              )}

              {/* ─── TAB: MATERIALES ─── */}
              {otDetailTab === 'materiales' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Lista de Materials / Spare Parts</h3>
                      <p className="text-xs text-gray-500">Código SAP, descripción y cantidad requerida</p>
                    </div>
                    <div className="flex gap-2">
                      {isEditable && (
                        <Button size="sm" variant="outline" onClick={() => setOtMats(prev => [...prev, { _id: Date.now(), code: '', description: '', quantity: 1, unit: 'PZ', reserved: false }])}>
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      )}
                      {isEditable && otMats.length > 0 && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveMats} disabled={otSaving}>
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                      )}
                    </div>
                  </div>

                  {otMats.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No materials definidos</p>
                      {isEditable && <p className="text-xs mt-1">Agrega repuestos y materiales necesarios</p>}
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-28">Código SAP</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Cant.</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Unidad</th>
                            {isEditable && <th className="px-3 py-2 w-10"></th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {otMats.map((mat) => (
                            <tr key={mat._id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                {isEditable ? (
                                  <input type="text" className="w-full border-0 border-b border-gray-200 p-0 text-xs font-mono focus:border-emerald-400 focus:ring-0 bg-transparent" placeholder="10034567"
                                    value={mat.code || ''} onChange={(e) => setOtMats(prev => prev.map(m => m._id === mat._id ? { ...m, code: e.target.value } : m))} />
                                ) : <span className="font-mono text-xs">{mat.code || '(Sin codigo)'}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <select className={`w-full border-0 border-b-2 p-0 text-xs text-center font-bold focus:ring-0 rounded ${(mat.mat_type || 'INT') === 'EXT' ? 'border-purple-400 text-purple-700 bg-purple-50' : 'border-blue-400 text-blue-700 bg-blue-50'}`}
                                    value={mat.mat_type || 'INT'} onChange={(e) => setOtMats(prev => prev.map(m => m._id === mat._id ? { ...m, mat_type: e.target.value } : m))}>
                                    <option value="INT">INT</option><option value="EXT">EXT</option>
                                  </select>
                                ) : <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${(mat.mat_type || 'INT') === 'EXT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{mat.mat_type || 'INT'}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditable ? (
                                  <input type="text" className="w-full border-0 border-b border-gray-200 p-0 text-sm focus:border-emerald-400 focus:ring-0 bg-transparent" placeholder="Descripción del material..."
                                    value={mat.description || ''} onChange={(e) => setOtMats(prev => prev.map(m => m._id === mat._id ? { ...m, description: e.target.value } : m))} />
                                ) : <span>{mat.description || '—'}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <input type="number" className="w-14 border-0 border-b border-gray-200 p-0 text-sm text-center focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={mat.quantity || ''} onChange={(e) => setOtMats(prev => prev.map(m => m._id === mat._id ? { ...m, quantity: parseInt(e.target.value) || 0 } : m))} />
                                ) : <span>{mat.quantity || 0}</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isEditable ? (
                                  <select className="w-14 border-0 border-b border-gray-200 p-0 text-xs text-center focus:border-emerald-400 focus:ring-0 bg-transparent"
                                    value={mat.unit || 'PZ'} onChange={(e) => setOtMats(prev => prev.map(m => m._id === mat._id ? { ...m, unit: e.target.value } : m))}>
                                    <option value="PZ">PZ</option><option value="KG">KG</option><option value="LT">LT</option><option value="MT">MT</option><option value="UN">UN</option>
                                  </select>
                                ) : <span className="text-xs">{mat.unit || 'PZ'}</span>}
                              </td>
                              {isEditable && (
                                <td className="px-3 py-2">
                                  <button onClick={() => setOtMats(prev => prev.filter(m => m._id !== mat._id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: COSTOS ─── */}
              {otDetailTab === 'costos' && (() => {
                const budget = selectedOT.budget_amount || 0;
                const totalCost = (parseFloat(otCosts.labor_cost) || 0) + (parseFloat(otCosts.material_cost) || 0) + (parseFloat(otCosts.external_cost) || 0);
                const plannedTotal = (parseFloat(otCosts.planned_labor) || 0) + (parseFloat(otCosts.planned_material) || 0) + (parseFloat(otCosts.planned_external) || 0);
                const delta = totalCost - plannedTotal;
                const deltaColor = delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-500';
                const variance = budget > 0 ? ((totalCost - budget) / budget * 100) : 0;
                const overBudget = budget > 0 && totalCost > budget;
                return (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800">Cost Control</h3>

                    {/* Budget vs Actual */}
                    <div className={`rounded-xl p-4 border ${overBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Budget vs Real</span>
                        {budget > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded ${overBudget ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}% variación
                        </span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Budget</div>
                          <div className="text-2xl font-bold text-gray-900">${budget.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Costo Real</div>
                          <div className={`text-2xl font-bold ${overBudget ? 'text-red-600' : 'text-emerald-700'}`}>${totalCost.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Delta</div>
                          <div className={`text-2xl font-bold ${delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {delta > 0 ? '+' : ''}{delta === 0 ? '-' : '$' + delta.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {budget > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-3 relative">
                            <div className={`h-3 rounded-full transition-all ${overBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }} />
                            {totalCost > budget && <div className="absolute right-0 top-0 h-3 rounded-r-full bg-red-300" style={{ width: `${Math.min(((totalCost - budget) / budget) * 100, 30)}%` }} />}
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                            <span>$0</span><span>${budget.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cost breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'labor_cost', pkey: 'planned_labor', label: 'Labor', icon: Users, color: 'blue' },
                        { key: 'material_cost', pkey: 'planned_material', label: 'Materials', icon: Package, color: 'amber' },
                        { key: 'external_cost', pkey: 'planned_external', label: 'Servicios Ext.', icon: Wrench, color: 'purple' },
                      ].map(({ key, pkey, label, icon: CIcon, color }) => {
                        const planned = parseFloat(otCosts[pkey]) || selectedOT[pkey.replace('planned_', 'planned_') + '_cost'] || 0;
                        const real = parseFloat(otCosts[key]) || selectedOT[key] || 0;
                        const itemDelta = real - planned;
                        return (
                        <div key={key} className={`rounded-lg border p-3 bg-${color}-50/50`}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <CIcon size={14} className={`text-${color}-600`} />
                            <span className="text-xs text-gray-600">{label}</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400 uppercase">Plan</span>
                              {isEditable ? (
                                <input type="number" className="w-24 border rounded p-1 text-xs font-semibold text-right"
                                  value={otCosts[pkey] || ''} onChange={(e) => setOtCosts(prev => ({ ...prev, [pkey]: parseFloat(e.target.value) || 0 }))} />
                              ) : (
                                <span className="text-sm font-medium text-gray-600">${planned.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400 uppercase">Real</span>
                              {isExecuting || isEditable ? (
                                <input type="number" className="w-24 border rounded p-1 text-xs font-semibold text-right"
                                  value={otCosts[key] || ''} onChange={(e) => setOtCosts(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))} />
                              ) : (
                                <span className="text-sm font-bold text-gray-900">${real.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between border-t pt-1">
                              <span className="text-[10px] text-gray-400 uppercase">Delta</span>
                              <span className={`text-xs font-bold ${itemDelta > 0 ? 'text-red-600' : itemDelta < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {itemDelta === 0 ? '-' : (itemDelta > 0 ? '+$' : '-$') + Math.abs(itemDelta).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    {(isExecuting || isEditable) && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveCosts} disabled={otSaving}>
                        <Save className="w-3 h-3 mr-1" /> Save Costos
                      </Button>
                    )}
                  </div>
                );
              })()}

              {/* ─── TAB: HISTORIAL ─── */}
              {otDetailTab === 'historial' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">History de Ejecución</h3>

                  {/* Status timeline */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {['CREATED', 'PLANNED', 'SCHEDULED', 'EN_EJECUCION', 'CLOSED'].map((st, idx) => {
                      const states = ['CREATED', 'PLANNED', 'SCHEDULED', 'EN_EJECUCION', 'CLOSED'];
                      const currentIdx = states.indexOf(selectedOT.status);
                      const isPast = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={st} className="flex items-center">
                          <div className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${isCurrent ? 'bg-emerald-600 text-white' : isPast ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                            {st.replace(/_/g, ' ')}
                          </div>
                          {idx < 4 && <div className={`w-4 h-0.5 ${isPast ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Key dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selectedOT.created_at && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Creado</span><br /><span className="font-medium">{new Date(selectedOT.created_at).toLocaleString()}</span></div>}
                    {selectedOT.released_at && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Liberado por {selectedOT.released_by || '—'}</span><br /><span className="font-medium">{new Date(selectedOT.released_at).toLocaleString()}</span></div>}
                    {selectedOT.actual_start && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Inicio Real</span><br /><span className="font-medium">{new Date(selectedOT.actual_start).toLocaleString()}</span></div>}
                    {selectedOT.actual_end && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Fin Real</span><br /><span className="font-medium">{new Date(selectedOT.actual_end).toLocaleString()}</span></div>}
                    {selectedOT.closed_at && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Closed por {selectedOT.closed_by || '—'}</span><br /><span className="font-medium">{new Date(selectedOT.closed_at).toLocaleString()}</span></div>}
                  </div>

                  {/* Execution notes */}
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Notas de Ejecución ({selectedOT.execution_notes?.length || 0})</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(selectedOT.execution_notes || []).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">Sin notas de ejecución</p>
                      ) : (
                        selectedOT.execution_notes.map((note, i) => (
                          <div key={i} className="flex gap-3 text-xs bg-gray-50 rounded-lg p-3">
                            <div className="w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <div>
                              <div className="text-gray-400">{note.timestamp ? new Date(note.timestamp).toLocaleString() : ''} {note.user && <span className="text-gray-600 font-medium">- {note.user}</span>}</div>
                              <div className="text-gray-700 mt-0.5">{note.note}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add note */}
                  {!['CLOSED', 'CANCELLED'].includes(selectedOT.status) && (
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Add nota de ejecución..."
                        value={newNote} onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} />
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={addNote} disabled={otSaving || !newNote.trim()}>
                        <MessageSquare className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="border-t px-6 py-3 rounded-b-2xl flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-400">Creado: {selectedOT.created_at ? new Date(selectedOT.created_at).toLocaleString() : '—'}</span>
              <div className="flex gap-2">
                {(() => {
                  const nxt = OT_NEXT_ACTION[selectedOT.status];
                  if (!nxt) return null;
                  const NxtIcon = nxt.icon;
                  return (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={async () => { await handleOTTransition(selectedOT, nxt.action); setSelectedOT(null); }}>
                      {NxtIcon && <NxtIcon className="w-3 h-3 mr-1" />}
                      {nxt.label}
                    </Button>
                  );
                })()}
                <Button variant="outline" size="sm"
                  onClick={async () => {
                    try {
                      const res = await api.aiSuggestSchedule(selectedOT.wo_id);
                      const dates = (res.suggested_dates || []).slice(0, 3).map(d => d.date + ' (' + d.day_name + ', ' + d.available_hours + 'h libres)').join('\n');
                      toast.success('Fechas sugeridas por IA:\n' + dates + '\n\n' + (res.ai_recommendation || ''), 12000);
                    } catch { toast.error('Error sugiriendo fechas'); }
                  }}
                  className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50">
                  <Clock size={14} /> Sugerir Fecha IA
                </Button>
                <Button variant="outline" size="sm"
                  onClick={async () => {
                    try {
                      const res = await api.aiVerifyClose(selectedOT.wo_id);
                      if (res.can_close && res.checks_passed) {
                        toast.success('Verificacion IA: Todo OK para cerrar');
                      } else {
                        const parts = [];
                        if (res.issues?.length) parts.push('Problemas:\n' + res.issues.join('\n'));
                        if (res.warnings?.length) parts.push('Advertencias:\n' + res.warnings.join('\n'));
                        if (res.ai_recommendation) parts.push('IA: ' + res.ai_recommendation);
                        toast[res.can_close ? 'success' : 'error'](parts.join('\n\n'), 12000);
                      }
                    } catch (e) { toast.error('Error al verificar con IA'); }
                  }}
                  className="gap-1 text-violet-600 border-violet-300 hover:bg-violet-50">
                  <Zap size={14} /> Verificar IA
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedOT(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      </>)}
    </div>
  );
}
