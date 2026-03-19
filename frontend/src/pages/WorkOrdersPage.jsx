import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import * as api from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Wrench, Download, Plus, ArrowUp, X, Search, AlertTriangle, ChevronDown, Clock, Package } from 'lucide-react';
import WorkOrderDetailDialog from '../components/tactical/WorkOrderDetailDialog';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';

export default function WorkOrdersPage() {
  const { t } = useLanguage();
  const { selectedPlant, selectedTimeRange, selectedArea, viewMode } = useOutletContext();
  const plant = selectedPlant;
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    whatHappens: '', whereTag: '', suggestedAction: '', estimatedDuration: '',
    priority: 'P3', activityClass: 'CR', plantCondition: 'operating',
    failureCategory: 'MECANICO', failureSymptom: '', failureObjectPart: '', failureCause: '',
    resources: [], materials: [], specialEquipment: '',
  });
  const [equipSearch, setEquipSearch] = useState('');
  const [allEquipment, setAllEquipment] = useState([]);
  const [equipResults, setEquipResults] = useState([]);
  const [showEquipSearch, setShowEquipSearch] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const [showCauses, setShowCauses] = useState(false);

  // ── SAP PM constants (inside component for i18n) ──
  const PLANT_CONDITIONS = [
    { value: 'operating', label: t('workOrders.plantOperating'), color: '#10B981' },
    { value: 'stopped', label: t('workOrders.plantStopped'), color: '#EF4444' },
  ];

  const PRIORITIES = [
    { value: 'P1', label: t('workOrders.priorityUrgent'), sub: '< 24h', color: '#EF4444', bg: '#FEE2E2', claseOT: 'PM03', claseOTLabel: t('workOrders.notScheduled') },
    { value: 'P2', label: t('workOrders.priorityExecution'), sub: '< 7d', color: '#F97316', bg: '#FED7AA', claseOT: 'PM03', claseOTLabel: t('workOrders.notScheduled') },
    { value: 'P3', label: t('workOrders.priorityNextProg'), sub: '7-14d', color: '#EAB308', bg: '#FEF3C7', claseOT: 'PM01', claseOTLabel: t('workOrders.scheduled') },
    { value: 'P4', label: t('workOrders.priorityNone'), sub: '> 14d', color: '#3B82F6', bg: '#DBEAFE', claseOT: 'PM01', claseOTLabel: t('workOrders.scheduled') },
  ];

  const ACTIVITY_CLASSES = {
    PM01: [{ value: 'CR', label: t('workOrders.actCorrective') }, { value: 'MC', label: t('workOrders.actConditionMonitoring') }, { value: 'MJ', label: t('workOrders.actImprovement') }, { value: 'IO', label: t('workOrders.actOperationalIncident') }],
    PM03: [{ value: 'CR', label: t('workOrders.actCorrective') }, { value: 'IP', label: t('workOrders.actUnexpected') }, { value: 'IO', label: t('workOrders.actOperationalIncident') }],
  };

  const FAILURE_CATALOG = {
    MECANICO: { label: t('workOrders.failMechanical'), color: '#6366F1', symptoms: ['ALTA VIBRACION','ALTA TEMPERATURA','RUIDO ANORMAL','TRABADO','SIN FLUJO','FILTRACION','DESGASTE VISIBLE','FUGA ACEITE','ATASCAMIENTO'], parts: ['RODAMIENTOS','SELLOS MECANICOS','ACOPLES','EJES','ENGRANAJES','CORREAS','BOMBAS','VALVULAS','FILTROS'], causes: ['DESGASTE','FALTA LUBRICACION','CORROSION','DESALINEADO','OBSTRUIDO','SOBRECARGA','FATIGA','MONTAJE INCORRECTO'] },
    ELECTRICO: { label: t('workOrders.failElectrical'), color: '#F59E0B', symptoms: ['NO ARRANCA','SOBRECALENTAMIENTO','CORTOCIRCUITO','DISPARO PROTECCION','BAJA AISLACION','OPERACION INTERMITENTE','CONSUMO EXCESIVO'], parts: ['MOTOR ELECTRICO','CABLES / CONDUCTORES','PROTECCIONES','TABLERO ELECTRICO','VARIADOR FRECUENCIA','CONTACTOR'], causes: ['PERDIDA AISLACION','DESGASTE','SUELTO','SOBRECARGA ELECTRICA','HUMEDAD','CALENTAMIENTO EXCESIVO'] },
    INSTRUMENTACION: { label: t('workOrders.failInstrumentation'), color: '#06B6D4', symptoms: ['LECTURA ERRONEA','SIN SEÑAL','SEÑAL INESTABLE','NO RESPONDE','ALARMA FALSA','COMUNICACION PERDIDA'], parts: ['SENSOR / TRANSDUCTOR','TRANSMISOR','VALVULA DE CONTROL','PLC / DCS','ACTUADOR','POSICIONADOR'], causes: ['DESCALIBRADO','CONTAMINADO','PERDIDA PARAMETROS','PERDIDA COMUNICACION','OBSTRUCCION'] },
  };

  // Fetch work requests from API
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.listWorkRequests({ plant_id: plant });
        if (!cancelled) {
          setWorkRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch work requests:', err);
          setError(err.message || t('workOrders.failedToLoad'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [plant]);

  // Load equipment for create modal search
  useEffect(() => {
    api.listNodes({}).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setAllEquipment(nodes.filter(n => n.node_type === 'EQUIPMENT'));
    }).catch(() => {});
  }, []);

  // Filter equipment results
  useEffect(() => {
    if (equipSearch.length < 2) { setEquipResults([]); return; }
    const q = equipSearch.toLowerCase();
    setEquipResults(allEquipment.filter(n =>
      (n.tag || '').toLowerCase().includes(q) || (n.code || '').toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [equipSearch, allEquipment]);

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

  // ── Export to CSV ──
  const handleExport = useCallback(() => {
    if (!workOrdersData.length) return;
    const headers = [t('workOrders.csvWoId'), t('workOrders.csvEquipment'), t('workOrders.csvDescription'), t('workOrders.csvPriority'), t('workOrders.csvWorkClass'), t('workOrders.csvDaysOld'), t('workOrders.csvAssignedTo'), t('workOrders.csvStatus')];
    const rows = workOrdersData.map(wo => [
      wo.id,
      wo._raw?.equipment_tag || t('workOrders.na'),
      `"${(wo.description || '').replace(/"/g, '""')}"`,
      wo._raw?.priority_code || wo.criticality,
      wo.area,
      wo.delayDays,
      wo.responsible,
      wo.status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-orders-${plant || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workOrdersData, plant, t]);

  // ── Create Work Order ──
  const selectedPriority = PRIORITIES.find(p => p.value === createForm.priority);
  const claseOT = selectedPriority?.claseOT || 'PM01';
  const actClasses = ACTIVITY_CLASSES[claseOT] || [];
  const canCreate = createForm.whatHappens.trim() && createForm.whereTag.trim();

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      await api.submitCapture({
        capture_type: 'TEXT',
        raw_text_input: createForm.whatHappens.trim(),
        equipment_tag_manual: createForm.whereTag.trim(),
        plant_id: plant,
        technician_id: 'desktop',
        technician_name: 'Desktop User',
        suggested_action: createForm.suggestedAction || undefined,
        estimated_duration: createForm.estimatedDuration || undefined,
        plant_condition: createForm.plantCondition,
        priority: createForm.priority,
        activity_class: createForm.activityClass || undefined,
        failure_category: createForm.failureCategory || undefined,
        failure_symptom: createForm.failureSymptom || undefined,
        failure_object_part: createForm.failureObjectPart || undefined,
        failure_cause: createForm.failureCause || undefined,
        resources: createForm.resources.length > 0 ? createForm.resources : undefined,
        materials: createForm.materials.length > 0 ? createForm.materials : undefined,
        special_equipment: createForm.specialEquipment || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ whatHappens: '', whereTag: '', suggestedAction: '', estimatedDuration: '', priority: 'P3', activityClass: 'CR', plantCondition: 'operating', failureCategory: 'MECANICO', failureSymptom: '', failureObjectPart: '', failureCause: '', resources: [], materials: [], specialEquipment: '' });
      setSelectedEquip(null);
      const data = await api.listWorkRequests({ plant_id: plant });
      setWorkRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err.message || t('workOrders.failedToCreate'));
    } finally {
      setCreating(false);
    }
  };

  const setF = (key, val) => setCreateForm(prev => ({ ...prev, [key]: val }));
  const selectEquip = (node) => {
    const tag = node.tag || node.code || node.name;
    setSelectedEquip(node);
    setF('whereTag', tag);
    setEquipSearch('');
    setShowEquipSearch(false);
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
          <Button variant="outline" className="flex items-center gap-2 border-gray-300" onClick={handleExport} disabled={!workOrdersData.length}>
            <Download className="w-4 h-4" />
            {t('workOrders.export')}
          </Button>
          {viewMode === 'tactical' && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              {t('workOrders.createWorkOrder')}
            </Button>
          )}
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

      {/* ═══ TACTICAL VIEW: Detailed Work Orders Table ═══ */}
      {viewMode === 'tactical' && (<>

      {/* Bottom Section: Work Orders Table */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('workOrders.workOrdersTableTitle').replace('{count}', workOrdersData.length)}
        </h3>
        {workOrdersData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">{t('workOrders.woId')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.equipmentCol')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.descriptionCol')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.priorityCol')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.workClassCol')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.daysOld')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.assignedTo')}</TableHead>
                  <TableHead className="font-semibold">{t('workOrders.statusCol')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrdersData.map((wo, idx) => (
                  <TableRow
                    key={wo.id + '-' + idx}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedWorkOrder(wo)}
                  >
                    <TableCell className="font-medium text-sm">{wo.id}</TableCell>
                    <TableCell className="text-sm">{wo._raw?.equipment_tag || t('workOrders.na')}</TableCell>
                    <TableCell className="max-w-xs text-sm truncate">{wo.description}</TableCell>
                    <TableCell>
                      <Badge className={getCriticalityColor(wo.criticality)}>
                        {wo._raw?.priority_code || wo.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{wo.area}</TableCell>
                    <TableCell className="font-semibold">{wo.delayDays}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {wo.responsible !== t('workOrders.unassigned') && (
                          <Avatar className="w-8 h-8 bg-emerald-500">
                            <AvatarFallback className="bg-emerald-500 text-white text-xs">
                              {wo.responsible.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-sm">{wo.responsible}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          wo.status === 'APPROVED' ? 'bg-green-500' :
                          wo.status === 'REJECTED' ? 'bg-red-500' :
                          wo.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm">{wo.status.replace(/_/g, ' ')}</span>
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

      {/* Work Order Detail Dialog */}
      {selectedWorkOrder && (
        <WorkOrderDetailDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onCreateAction={(wo) => {
            console.log('Create action from WO:', wo);
            setSelectedWorkOrder(null);
          }}
        />
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
              {/* 1. What happened? */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.whatHappens')}</label>
                <textarea
                  value={createForm.whatHappens}
                  onChange={e => setF('whatHappens', e.target.value)}
                  placeholder={t('workOrders.whatHappensPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* 2. Where? TAG equipment */}
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
                      <button onClick={() => { selectEquip({ tag: equipSearch, name: 'Manual' }); }} className="w-full mt-1 p-2 text-xs text-left rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                        {t('workOrders.useManualTag').replace('{tag}', equipSearch)}
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
                    <button onClick={() => { setSelectedEquip(null); setF('whereTag', ''); }}>
                      <X className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Priority + Activity Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.priorityLabel')}</label>
                  <div className="space-y-1.5">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => { setF('priority', p.value); setF('activityClass', ACTIVITY_CLASSES[p.claseOT]?.[0]?.value || 'CR'); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 text-left transition-all ${createForm.priority === p.value ? 'scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
                        style={{ borderColor: createForm.priority === p.value ? p.color : '#e5e7eb', backgroundColor: createForm.priority === p.value ? p.bg : 'transparent' }}
                      >
                        <div>
                          <div className="text-sm font-bold" style={{ color: p.color }}>{p.value}</div>
                          <div className="text-xs text-gray-600">{p.label}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{p.sub}</div>
                          <div className="text-[10px] font-mono text-gray-400">{p.claseOTLabel}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.activityClassLabel').replace('{code}', claseOT)}</label>
                    <select value={createForm.activityClass} onChange={e => setF('activityClass', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                      {actClasses.map(ac => <option key={ac.value} value={ac.value}>{ac.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.suggestedAction')}</label>
                    <textarea value={createForm.suggestedAction} onChange={e => setF('suggestedAction', e.target.value)} placeholder={t('workOrders.suggestedActionPlaceholder')} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t('workOrders.estimatedDuration')}</label>
                    <input type="text" value={createForm.estimatedDuration} onChange={e => setF('estimatedDuration', e.target.value)} placeholder={t('workOrders.estimatedDurationPlaceholder')} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                </div>
              </div>

              {/* 4. Plant Condition */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.plantCondition')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLANT_CONDITIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setF('plantCondition', opt.value)}
                      className="p-3 rounded-xl border-2 transition-all text-sm font-bold"
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

              {/* 5. Required Resources */}
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
                        <input type="text" placeholder={t('workOrders.resourceType')} value={res.type} onChange={e => updateResource(i, 'type', e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <input type="text" placeholder={t('workOrders.resourceQty')} value={res.quantity} onChange={e => updateResource(i, 'quantity', e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <div className="flex gap-1">
                          <input type="text" placeholder={t('workOrders.resourceHours')} value={res.hours} onChange={e => updateResource(i, 'hours', e.target.value)}
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                          <button onClick={() => removeResource(i)} className="px-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Materials (SAP) */}
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
                        <input type="text" placeholder={t('workOrders.materialSapId')} value={mat.sapId} onChange={e => updateMaterial(i, 'sapId', e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <input type="text" placeholder={t('workOrders.materialQty')} value={mat.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
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

              {/* 7. Special Equipment */}
              <div className="border rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('workOrders.specialEquipment')}</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={createForm.specialEquipment} onChange={e => setF('specialEquipment', e.target.value)}
                    placeholder={t('workOrders.specialEquipmentPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                </div>
              </div>

              {/* 8. Failure Catalog */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('workOrders.failureCatalog')}</label>
                </div>
                {/* Category tabs */}
                <div className="flex gap-1 mb-3 p-1 rounded-lg bg-gray-100">
                  {Object.entries(FAILURE_CATALOG).map(([key, cat]) => (
                    <button key={key} onClick={() => { setF('failureCategory', key); setF('failureSymptom', ''); setF('failureObjectPart', ''); setF('failureCause', ''); }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${createForm.failureCategory === key ? 'bg-white shadow-sm' : ''}`}
                      style={{ color: createForm.failureCategory === key ? cat.color : '#94a3b8' }}>{cat.label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Symptom */}
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
                  {/* Object Part */}
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
                  {/* Cause */}
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

      </>)}
    </div>
  );
}
