import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis } from 'recharts';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

/* ── Equipment-tag prefix → Planning Group / Area mapping ── */
const AREA_PREFIXES = {
  Grinding:      ['BRY','SAG','BAL','MIL','CLS','HYD','CYC'],
  Crushing:      ['CVY','CRU','STK','SCR','FDR','GYR','JAW'],
  Flotation:     ['FLT','CND','CLN','RGH','COL','AIR'],
  Relaves:       ['SED','THK','TAI','SPG','DAM','SEQ','DRY'],
  'Lixiviación': ['LIX','SX','EW','PLS','AGL'],
};

export default function FailuresEvents() {
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const { selectedPlant, selectedTimeRange, selectedArea, viewMode } = useOutletContext();
  const plant = selectedPlant;
  const [actionLoading, setActionLoading] = useState(null);
  const [planningGroup, setPlanningGroup] = useState('All');
  const [level2, setLevel2] = useState('All');
  const [specialty, setSpecialty] = useState('All');
  const [selectedWR, setSelectedWR] = useState(null);
  const [wrEditing, setWrEditing] = useState(false);
  const [wrEditForm, setWrEditForm] = useState({});
  const [wrSaving, setWrSaving] = useState(false);
  const [wrActionComment, setWrActionComment] = useState('');

  // Translated display names for area filter keys
  const AREA_LABELS = {
    Grinding: t('failuresEvents.areas.grinding'),
    Crushing: t('failuresEvents.areas.crushing'),
    Flotation: t('failuresEvents.areas.flotation'),
    Relaves: t('failuresEvents.areas.relaves'),
    'Lixiviación': t('failuresEvents.areas.lixiviacion'),
  };


  // API data state
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const wrData = await api.listWorkRequests({ plant_id: plant });
        if (!cancelled) {
          setWorkRequests(Array.isArray(wrData) ? wrData : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch failures & events data:', err);
          setError(err.message || 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [plant]);

  // --- Filter work requests: time range → page filters ---
  const _timeFiltered = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  const filteredWRs = useMemo(() => {
    let result = _timeFiltered;

    // Planning Group / Area — match equipment tag prefix
    if (planningGroup && planningGroup !== 'All') {
      const prefixes = AREA_PREFIXES[planningGroup];
      if (prefixes) {
        result = result.filter(wr => {
          const tag = (wr.equipment_tag || wr.equipment_name || '').toUpperCase();
          return prefixes.some(p => tag.startsWith(p));
        });
      }
    }

    // Level 2 — discipline / maintenance type
    if (level2 && level2 !== 'All') {
      const l2 = level2.toLowerCase();
      result = result.filter(wr => {
        const specs = (wr.ai_classification?.required_specialties || []).map(s => s.toLowerCase());
        const catalog = (wr.ai_classification?.failure_catalog || wr.problem_description?.failure_catalog || '').toLowerCase();
        const assignedSpec = (wr.validation?.assigned_to_specialty || '').toLowerCase();
        // If no discipline info at all, include by default
        if (!specs.length && !catalog && !assignedSpec) return true;
        return specs.some(s => s.includes(l2)) || catalog.includes(l2) || assignedSpec.includes(l2);
      });
    }

    // Specialty
    if (specialty && specialty !== 'All') {
      const specLower = specialty.toLowerCase();
      result = result.filter(wr => {
        const tag = (wr.equipment_tag || wr.equipment_name || '').toLowerCase();
        const specs = (wr.ai_classification?.required_specialties || []).map(s => s.toLowerCase());
        return tag.includes(specLower.substring(0, 3)) || specs.some(s => s.includes(specLower));
      });
    }

    return result;
  }, [_timeFiltered, planningGroup, level2, specialty]);

  // --- Computed stats for dynamic sections ---
  const masterDataStats = useMemo(() => {
    if (!filteredWRs.length) return { eqPct: 0, failurePct: 0, planningPct: 0, sparePct: 0 };
    const n = filteredWRs.length;
    const withEq = filteredWRs.filter(w => w.equipment_tag && w.equipment_tag !== 'Unknown').length;
    const withFailure = filteredWRs.filter(w => w.ai_classification?.failure_catalog || w.ai_classification?.failure_description).length;
    const withDuration = filteredWRs.filter(w => w.estimated_duration || w.ai_classification?.estimated_duration_hours).length;
    const withParts = filteredWRs.filter(w => (w.spare_parts?.length || 0) > 0 || (w.problem_description?.materials?.length || 0) > 0).length;
    return {
      eqPct: Math.round((withEq / n) * 100),
      failurePct: Math.round((withFailure / n) * 100),
      planningPct: Math.round((withDuration / n) * 100),
      sparePct: Math.round((withParts / n) * 100),
    };
  }, [filteredWRs]);

  const planningStats = useMemo(() => {
    if (!filteredWRs.length) return { laborVar: 0, costVar: 0 };
    const withDuration = filteredWRs.filter(w => w.estimated_duration || w.ai_classification?.estimated_duration_hours);
    const estimated = withDuration.reduce((s, w) => s + (w.estimated_duration || w.ai_classification?.estimated_duration_hours || 0), 0);
    const completed = filteredWRs.filter(w => ['COMPLETED', 'CLOSED'].includes(w.status || ''));
    const actualHours = completed.reduce((s, w) => s + (w.actual_duration || w.ai_classification?.actual_duration_hours || w.estimated_duration || 0), 0);
    const laborVar = estimated > 0 ? Math.round(((actualHours - estimated) / estimated) * 100 * 10) / 10 : 0;
    const completionRate = filteredWRs.length > 0 ? Math.round((completed.length / filteredWRs.length) * 100 * 10) / 10 : 0;
    return { laborVar, costVar: completionRate };
  }, [filteredWRs]);

  const topAssignee = useMemo(() => {
    const counts = {};
    filteredWRs.forEach(wr => {
      const name = wr.assigned_to_name || wr.validation?.assigned_to_name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], initials: sorted[0][0].split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase() } : { name: t('failuresEvents.unassigned'), initials: 'NA' };
  }, [filteredWRs]);

  // --- Compute chart data from work requests ---

  // Work Orders Status: group by equipment_tag, categorize by status
  const workOrdersStatusData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const equipMap = {};
    filteredWRs.forEach((wr) => {
      const eq = wr.equipment_tag || wr.equipment_name || 'Unknown';
      if (!equipMap[eq]) {
        equipMap[eq] = { equipment: eq, inProgress: 0, planned: 0, criticallyDelayed: 0, sparePartsPending: 0 };
      }
      const status = (wr.status || '').toUpperCase();
      if (status.includes('PROGRESS') || status.includes('APPROVED')) {
        equipMap[eq].inProgress += 1;
      } else if (status.includes('PENDING')) {
        equipMap[eq].planned += 1;
      } else if (status.includes('REJECT') || status.includes('OVERDUE')) {
        equipMap[eq].criticallyDelayed += 1;
      } else {
        equipMap[eq].sparePartsPending += 1;
      }
    });
    return Object.values(equipMap).sort((a, b) =>
      (b.inProgress + b.planned + b.criticallyDelayed + b.sparePartsPending) -
      (a.inProgress + a.planned + a.criticallyDelayed + a.sparePartsPending)
    ).slice(0, 10);
  }, [filteredWRs]);

  // MTBF Trend: group work requests by week and work_class to simulate trend
  const mtbfTrendData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const weekMap = {};
    filteredWRs.forEach((wr) => {
      const date = wr.created_at ? new Date(wr.created_at) : new Date();
      const weekNum = Math.ceil((date.getDate()) / 7);
      const monthKey = `${date.getMonth() + 1}`;
      const weekKey = `M${monthKey}-W${weekNum}`;
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { week: weekKey, preventive: 0, corrective: 0, other: 0 };
      }
      const woType = (wr.ai_classification?.work_order_type || wr.work_class || '').toUpperCase();
      if (woType.includes('PREVENT') || woType.includes('PM')) {
        weekMap[weekKey].preventive += 1;
      } else if (woType.includes('CORRECT') || woType.includes('CM')) {
        weekMap[weekKey].corrective += 1;
      } else {
        weekMap[weekKey].other += 1;
      }
    });
    return Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));
  }, [filteredWRs]);

  // Top Delay Root Causes: aggregate from ai_classification or work_class
  const rootCausesData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const causeCounts = {};
    filteredWRs.forEach((wr) => {
      const specialties = wr.ai_classification?.required_specialties || [];
      if (specialties.length > 0) {
        specialties.forEach((s) => {
          causeCounts[s] = (causeCounts[s] || 0) + 1;
        });
      } else {
        const woType = wr.ai_classification?.work_order_type || wr.work_class || 'Unknown';
        causeCounts[woType] = (causeCounts[woType] || 0) + 1;
      }
    });
    const sorted = Object.entries(causeCounts)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    // Add cumulative percentage
    const total = sorted.reduce((sum, item) => sum + item.count, 0);
    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.count;
      return { ...item, percentage: Math.round((cumulative / total) * 100) };
    });
  }, [filteredWRs]);

  // Critical Work Orders: map from work requests, sorted by priority
  const criticalWorkOrders = useMemo(() => {
    if (!filteredWRs.length) return [];
    return filteredWRs
      .map((wr) => {
        const createdDate = wr.created_at ? new Date(wr.created_at) : null;
        const daysOld = createdDate ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const priorityNum = wr.priority_code ? parseInt(wr.priority_code.replace(/\D/g, ''), 10) || 5 : 5;
        return {
          id: wr.request_id || 'N/A',
          equipment: wr.equipment_tag || wr.equipment_name || 'Unknown',
          description: wr.problem_description?.original_text || '',
          status: wr.status || '',
          daysLate: daysOld,
          priority: priorityNum,
          responsible: wr.assigned_to_name || '',
          _raw: wr,
        };
      })
      .sort((a, b) => a.priority - b.priority || b.daysLate - a.daysLate)
      .slice(0, 20);
  }, [filteredWRs]);

  // Weekly sparkline data for Operational Discipline mini-charts
  const weeklySparklineData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const weekMap = {};
    filteredWRs.forEach((wr) => {
      const date = wr.created_at ? new Date(wr.created_at) : new Date();
      const weekNum = Math.ceil(date.getDate() / 7) + ((date.getMonth()) * 4);
      const key = `W${weekNum}`;
      weekMap[key] = (weekMap[key] || 0) + 1;
    });
    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, value], idx) => ({ week: idx + 1, value }));
  }, [filteredWRs]);

  // Repetitive failures data: group by equipment_tag with count > 1
  const repetitiveFailuresData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const equipCounts = {};
    filteredWRs.forEach((wr) => {
      const eq = wr.equipment_tag || wr.equipment_name || 'Unknown';
      equipCounts[eq] = (equipCounts[eq] || 0) + 1;
    });
    return Object.entries(equipCounts)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([equipment, count]) => ({ equipment, count }));
  }, [filteredWRs]);

  // AI Analysis metrics — computed from real data (must be after repetitiveFailuresData)
  const aiMetrics = useMemo(() => {
    if (!filteredWRs.length) return { downtimeReduction: 0, planningImprovement: 0 };
    const repEquips = new Set(repetitiveFailuresData.map(r => r.equipment));
    const totalHours = filteredWRs.reduce((s, w) => s + (w.estimated_duration || w.ai_classification?.estimated_duration_hours || 0), 0);
    const repHours = filteredWRs
      .filter(w => repEquips.has(w.equipment_tag || w.equipment_name || 'Unknown'))
      .reduce((s, w) => s + (w.estimated_duration || w.ai_classification?.estimated_duration_hours || 0), 0);
    const downtimeReduction = totalHours > 0 ? Math.round((repHours / totalHours) * 100) : 0;
    const incomplete = filteredWRs.filter(w => {
      const hasDur = w.estimated_duration || w.ai_classification?.estimated_duration_hours;
      const hasCat = w.ai_classification?.failure_catalog || w.ai_classification?.failure_description;
      return !hasDur || !hasCat;
    }).length;
    const planningImprovement = Math.round((incomplete / filteredWRs.length) * 100);
    return { downtimeReduction, planningImprovement };
  }, [filteredWRs, repetitiveFailuresData]);

  // Priority Distribution: group by priority_code (fix: was using weeklySparklineData)
  const priorityDistributionData = useMemo(() => {
    if (!filteredWRs.length) return [];
    const counts = {};
    filteredWRs.forEach(wr => {
      const p = wr.priority_code || 'N/A';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([priority, count]) => ({ priority, count }));
  }, [filteredWRs]);

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('REJECT') || s.includes('CRITICAL') || s.includes('OVERDUE')) return 'bg-red-100 text-red-800 border-red-300';
    if (s.includes('PENDING') || s.includes('MEDIUM')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (s.includes('APPROVED') || s.includes('PROGRESS')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // ─── Action helper: loading + toast feedback ───
  const runAction = async (actionKey, apiCall) => {
    setActionLoading(actionKey);
    try {
      const result = await apiCall();
      toast.success(t(`failuresEvents.action.${actionKey}.success`) || 'Action completed');
      return result;
    } catch (err) {
      toast.error(err?.message || t(`failuresEvents.action.${actionKey}.error`) || 'Action failed');
      return null;
    } finally {
      setActionLoading(null);
    }
  };
  // ─── AI Recommended Actions handlers ───

  const handleOptimizeStrategy = () => {
    runAction('optimizeStrategy', () => api.createAiSession({
      equipment_tag: (filteredWRs[0]?.equipment_tag || 'OCP-CON1-CHAN01'),
      plant_id: plant || 'OCP-JFC1',
    })).then(r => { if (r) navigate('/ai-agents'); });
  };

  const handleAdjustPlanning = () => {
    runAction('adjustPlanning', () => api.createImprovementAction({
      title: `Adjust Planning Standards — ${planningGroup} area`,
      category: 'Planning',
      priority: 'MEDIUM',
      description: `Labor var: ${planningStats.laborVar}%, Cost var: ${planningStats.costVar}%. ${filteredWRs.length} WRs analyzed.`,
      plant_id: plant,
    }));
  };

  const handleRequestSpareParts = () => {
    runAction('requestSpareParts', () => api.createImprovementAction({
      title: `Spare Parts Data Review — ${masterDataStats.sparePct}% integrity`,
      category: 'Spare Parts',
      priority: masterDataStats.sparePct < 50 ? 'HIGH' : 'MEDIUM',
      description: `Spare parts data integrity at ${masterDataStats.sparePct}%. ${filteredWRs.length} WRs in scope.`,
      plant_id: plant,
    }));
  };

  const handleEscalate = () => {
    const critical = filteredWRs.filter(w => ['P1', 'P2'].includes(w.priority_code));
    runAction('escalate', () => api.createImprovementAction({
      title: `Technical Support Escalation — ${critical.length} P1/P2 WRs`,
      category: 'Escalation',
      priority: 'CRITICAL',
      description: `${critical.length} critical WRs (P1/P2) require technical support in ${planningGroup} area.`,
      plant_id: plant,
    }));
  };

  // ─── Agentic Action Center handlers ───
  const handleCheckAiStatus = async () => {
    setActionLoading('checkAiStatus');
    try {
      const status = await api.getAiStatus();
      toast.info(`AI CoPilot: ${status?.status || 'active'} — ${status?.available_tools || 0} tools`);
    } catch (err) {
      toast.error(err?.message || 'AI Status check failed');
    } finally { setActionLoading(null); }
  };

  const handleGenerateWorkOrder = async () => {
    const pending = filteredWRs.find(w => ['VALIDATED', 'APPROVED', 'ASSIGNED'].includes(w.status));
    if (!pending) { toast.warning(t('failuresEvents.action.generateWO.noData') || 'No hay avisos validados para crear OT'); return; }
    setActionLoading('generateWO');
    try {
      const wo = await api.createWOFromWR({ work_request_id: pending.request_id });
      toast.success(`OT ${wo.wo_number || wo.id} creada desde ${pending.equipment_tag || pending.request_id}`);
    } catch (err) {
      toast.error(err?.message || 'Error creating OT');
    } finally { setActionLoading(null); }
  };

  const handleDispatchSupport = () => {
    const unassigned = filteredWRs.find(w => !w.assigned_to_name && ['VALIDATED', 'APPROVED'].includes(w.status));
    if (!unassigned) { toast.warning(t('failuresEvents.action.dispatchSupport.noData') || 'No hay avisos sin asignar'); return; }
    runAction('dispatchSupport', () => api.assignWorkRequest(unassigned.request_id, {
      workers: [{ worker_id: topAssignee.name || 'auto', worker_name: topAssignee.name || 'Auto-assigned' }],
    }));
  };

  const handleEscalateIssue = () => {
    const overdue = filteredWRs.filter(w => {
      const days = w.created_at ? Math.floor((Date.now() - new Date(w.created_at).getTime()) / 86400000) : 0;
      return days > 7 && !['COMPLETED', 'CLOSED'].includes(w.status);
    });
    runAction('escalateIssue', () => api.createImprovementAction({
      title: `Issue Escalation — ${overdue.length} overdue WRs`,
      category: 'Escalation',
      priority: 'CRITICAL',
      description: `${overdue.length} work requests overdue (>7 days) in ${planningGroup} area.`,
      plant_id: plant,
    }));
  };

  const handleReviewStrategy = () => {
    runAction('reviewStrategy', () => api.createAiSession({
      equipment_tag: (filteredWRs[0]?.equipment_tag || 'OCP-CON1-CHAN01'),
      plant_id: plant || 'OCP-JFC1',
    })).then(r => { if (r) navigate('/ai-agents'); });
  };

  const handleOptimizeAiStrategy = () => {
    runAction('optimizeAiStrategy', () => api.createAiSession({
      equipment_tag: (filteredWRs[0]?.equipment_tag || 'OCP-CON1-CHAN01'),
      plant_id: plant,
      context: { area: planningGroup, repetitive: repetitiveFailuresData.length },
    })).then(r => { if (r) navigate('/ai-agents'); });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('failuresEvents.loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-900 font-semibold mb-2">{t('failuresEvents.failedToLoad')}</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">{t('failuresEvents.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* ═══ EXECUTIVE VIEW: Summary Charts ═══ */}
      {viewMode !== 'tactical' && (<>

      {/* Top Filters Bar */}
      <Card className="p-4 bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Planning Group / Area */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.planningGroupArea')}</span>
            <Select value={planningGroup} onValueChange={setPlanningGroup}>
              <SelectTrigger className={`w-48 ${planningGroup !== 'All' ? 'bg-emerald-50 border-emerald-300' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.allAreas')}</SelectItem>
                <SelectItem value="Grinding">{t('failuresEvents.areas.grinding')}</SelectItem>
                <SelectItem value="Crushing">{t('failuresEvents.areas.crushing')}</SelectItem>
                <SelectItem value="Flotation">{t('failuresEvents.areas.flotation')}</SelectItem>
                <SelectItem value="Relaves">{t('failuresEvents.areas.relaves')}</SelectItem>
                <SelectItem value="Lixiviación">{t('failuresEvents.areas.lixiviacion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level 2 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.level2Label')}</span>
            <Select value={level2} onValueChange={setLevel2}>
              <SelectTrigger className={`w-40 ${level2 !== 'All' ? 'bg-blue-50 border-blue-300' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.all')}</SelectItem>
                <SelectItem value="Mechanical">{t('failuresEvents.mechanical')}</SelectItem>
                <SelectItem value="Electrical">{t('failuresEvents.electrical')}</SelectItem>
                <SelectItem value="Instrumentation">{t('failuresEvents.instrumentation')}</SelectItem>
                <SelectItem value="Lubrication">{t('failuresEvents.lubrication')}</SelectItem>
                <SelectItem value="MonCon">{t('failuresEvents.moncon')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialty */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.specialtyLabel')}</span>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.all')}</SelectItem>
                <SelectItem value="Pumps">{t('failuresEvents.pumps')}</SelectItem>
                <SelectItem value="Motors">{t('failuresEvents.motors')}</SelectItem>
                <SelectItem value="Bearings">{t('failuresEvents.bearings')}</SelectItem>
                <SelectItem value="Valves">{t('failuresEvents.valves')}</SelectItem>
                <SelectItem value="Conveyors">{t('failuresEvents.conveyors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter count */}
          {(planningGroup !== 'All' || level2 !== 'All' || specialty !== 'All') && (
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-red-600"
              onClick={() => { setPlanningGroup('All'); setLevel2('All'); setSpecialty('All'); }}>
              {t('failuresEvents.clearFilters')} ({[planningGroup !== 'All', level2 !== 'All', specialty !== 'All'].filter(Boolean).length})
            </Button>
          )}
        </div>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('failuresEvents.workOrdersStatusTitle')} {planningGroup === 'All' ? t('failuresEvents.allAreasUpper') : (AREA_LABELS[planningGroup] || planningGroup).toUpperCase()}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredWRs.length} {t('failuresEvents.ofTotal')} {_timeFiltered.length} {t('failuresEvents.workRequests')} ({selectedTimeRange})
        </span>
      </div>

      {/* First Row: Work Orders Status + MTBF Trend */}
      <div className="grid grid-cols-12 gap-6">
        {/* Work Orders Status Chart (Left - Large) */}
        <div className="col-span-7">
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('failuresEvents.workOrdersStatusChart')} {AREA_LABELS[planningGroup] || planningGroup} - {level2}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>{t('failuresEvents.inProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>{t('failuresEvents.planned')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>{t('failuresEvents.criticallyDelayed')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>{t('failuresEvents.sparePartsPending')}</span>
                </div>
              </div>
            </div>
            {workOrdersStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={workOrdersStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="equipment" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="inProgress" stackId="a" fill="#22c55e" name={t('failuresEvents.inProgressApproved')} />
                  <Bar dataKey="planned" stackId="a" fill="#3b82f6" name={t('failuresEvents.pending')} />
                  <Bar dataKey="criticallyDelayed" stackId="a" fill="#ef4444" name={t('failuresEvents.rejectedOverdue')} />
                  <Bar dataKey="sparePartsPending" stackId="a" fill="#eab308" name={t('failuresEvents.other')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                {t('failuresEvents.noWorkOrderStatusData')}
              </div>
            )}
          </Card>
        </div>

        {/* MTBF Trend Chart (Right) */}
        <div className="col-span-5">
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('failuresEvents.workOrdersTrendByType')} ({level2})
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span>{t('failuresEvents.preventive')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>{t('failuresEvents.corrective')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>{t('failuresEvents.other')}</span>
                </div>
              </div>
            </div>
            {mtbfTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mtbfTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="preventive" stroke="#059669" strokeWidth={2} name={t('failuresEvents.preventive')} />
                  <Line type="monotone" dataKey="corrective" stroke="#3b82f6" strokeWidth={2} name={t('failuresEvents.corrective')} />
                  <Line type="monotone" dataKey="other" stroke="#9333ea" strokeWidth={2} name={t('failuresEvents.other')} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                {t('failuresEvents.noTrendData')}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Second Row: Top Delay Root Causes */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('failuresEvents.topDelayRootCauses')} ({AREA_LABELS[planningGroup] || planningGroup} {level2})
              </h3>
            </div>
            {rootCausesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={rootCausesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="cause"
                    width={200}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" barSize={40} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#dc2626' }}
                    name={t('failuresEvents.cumulativePercent')}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                {t('failuresEvents.noRootCauseData')}
              </div>
            )}
          </Card>
        </div>
      </div>

      </>)}

      {/* ═══ TACTICAL VIEW: Detailed Tables + AI Insights ═══ */}
      {viewMode === 'tactical' && (<>

      {/* Top Filters Bar (also in tactical) */}
      <Card className="p-4 bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.planningGroupArea')}</span>
            <Select value={planningGroup} onValueChange={setPlanningGroup}>
              <SelectTrigger className={`w-48 ${planningGroup !== 'All' ? 'bg-emerald-50 border-emerald-300' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.allAreas')}</SelectItem>
                <SelectItem value="Grinding">{t('failuresEvents.areas.grinding')}</SelectItem>
                <SelectItem value="Crushing">{t('failuresEvents.areas.crushing')}</SelectItem>
                <SelectItem value="Flotation">{t('failuresEvents.areas.flotation')}</SelectItem>
                <SelectItem value="Relaves">{t('failuresEvents.areas.relaves')}</SelectItem>
                <SelectItem value="Lixiviación">{t('failuresEvents.areas.lixiviacion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.level2Label')}</span>
            <Select value={level2} onValueChange={setLevel2}>
              <SelectTrigger className={`w-40 ${level2 !== 'All' ? 'bg-blue-50 border-blue-300' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.all')}</SelectItem>
                <SelectItem value="Mechanical">{t('failuresEvents.mechanical')}</SelectItem>
                <SelectItem value="Electrical">{t('failuresEvents.electrical')}</SelectItem>
                <SelectItem value="Instrumentation">{t('failuresEvents.instrumentation')}</SelectItem>
                <SelectItem value="Lubrication">{t('failuresEvents.lubrication')}</SelectItem>
                <SelectItem value="MonCon">{t('failuresEvents.moncon')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('failuresEvents.specialtyLabel')}</span>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('failuresEvents.all')}</SelectItem>
                <SelectItem value="Pumps">{t('failuresEvents.pumps')}</SelectItem>
                <SelectItem value="Motors">{t('failuresEvents.motors')}</SelectItem>
                <SelectItem value="Bearings">{t('failuresEvents.bearings')}</SelectItem>
                <SelectItem value="Valves">{t('failuresEvents.valves')}</SelectItem>
                <SelectItem value="Conveyors">{t('failuresEvents.conveyors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(planningGroup !== 'All' || level2 !== 'All' || specialty !== 'All') && (
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-red-600"
              onClick={() => { setPlanningGroup('All'); setLevel2('All'); setSpecialty('All'); }}>
              {t('failuresEvents.clearFilters')} ({[planningGroup !== 'All', level2 !== 'All', specialty !== 'All'].filter(Boolean).length})
            </Button>
          )}
        </div>
      </Card>

      {/* Third Section: Critical Work Orders Table */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('failuresEvents.detailedListTitle')} {AREA_LABELS[planningGroup] || planningGroup} - {level2} ({criticalWorkOrders.length})
        </h3>
        {criticalWorkOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">{t('failuresEvents.workOrderId')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.equipment')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.description')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.status')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.daysOld')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.priority')}</TableHead>
                  <TableHead className="font-semibold">{t('failuresEvents.responsible')}</TableHead>
                  <TableHead className="font-semibold">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalWorkOrders.map((wo, idx) => (
                  <TableRow key={wo.id + '-' + idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedWR(wo._raw)}>
                    <TableCell className="font-medium">{wo.id}</TableCell>
                    <TableCell className="font-medium">{wo.equipment}</TableCell>
                    <TableCell className="max-w-xs truncate">{wo.description || t('failuresEvents.noDescription')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          wo.status.toUpperCase().includes('REJECT') ? 'bg-red-500' :
                          wo.status.toUpperCase().includes('APPROVED') ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <Badge className={getStatusColor(wo.status)}>
                          {wo.status ? wo.status.replace(/_/g, ' ') : t('failuresEvents.unknown')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {wo.daysLate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">P{wo.priority}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {wo.responsible && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                            {wo.responsible.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm">{wo.responsible || t('failuresEvents.unassigned')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/rca');
                        }}
                      >
                        {t('rca.newRCA')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            <div className="text-center">
              <p className="text-sm">{t('failuresEvents.noWorkOrdersYet')}</p>
              <p className="text-xs mt-1">{t('failuresEvents.workOrdersWillAppear')}</p>
            </div>
          </div>
        )}
      </Card>

      {/* NEW SECTION: AI Reliability & Planning Insights */}
      <div className="pt-8 border-t-4 border-emerald-500">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('failuresEvents.aiReliabilityTitle')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('failuresEvents.aiReliabilitySubtitle')}
          </p>
        </div>

        {/* First Row: 3 Analysis Blocks */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* LEFT: Jack-knife Analysis (Enhanced) */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {t('failuresEvents.failureCriticalityVsCost')}
              </h3>
              <div className="flex items-center gap-3 mb-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>P1/P2</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>P3</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>P4</span>
              </div>
              <div className="relative h-64 bg-white rounded-lg">
                {filteredWRs.length > 0 ? (
                  <>
                    {/* Quadrant background zones */}
                    <div className="absolute inset-0 pointer-events-none z-0" style={{ left: 60, top: 20, right: 20, bottom: 30 }}>
                      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-50 opacity-40 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-50 opacity-40"></div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          dataKey="downtime"
                          name={t('failuresEvents.downtimeHours')}
                          domain={[0, 'auto']}
                          label={{ value: t('failuresEvents.estimatedDuration'), position: 'insideBottom', offset: -10, fontSize: 11 }}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="priority"
                          name={t('failuresEvents.priority')}
                          domain={[0, 5]}
                          label={{ value: t('failuresEvents.priorityHighest'), angle: -90, position: 'insideLeft', fontSize: 11 }}
                          tick={{ fontSize: 10 }}
                        />
                        <ZAxis type="number" dataKey="impact" range={[40, 400]} />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ payload }) => {
                            if (!payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white border shadow-lg rounded-lg p-2.5 text-xs max-w-[200px]">
                                <div className="font-bold text-gray-900">{d.equipment}</div>
                                <div className="text-gray-600 mt-1">{t('failuresEvents.priority')}: P{d.priority}</div>
                                <div className="text-gray-600">{t('failuresEvents.downtimeHours')}: {d.downtime}h</div>
                                <div className="text-gray-600">{t('failuresEvents.impact')}: {d.impact}</div>
                              </div>
                            );
                          }}
                        />
                        <Scatter
                          name="P3/P4"
                          data={filteredWRs
                            .filter(wr => !['P1','P2'].includes(wr.priority_code))
                            .map((wr) => {
                              const dt = wr.estimated_duration || wr.ai_classification?.estimated_duration_hours || 1;
                              const p = parseInt((wr.priority_code || 'P4').replace(/\D/g, ''), 10) || 4;
                              return { downtime: dt, priority: p, equipment: wr.equipment_tag || 'N/A', impact: Math.round(dt * (5 - p + 1) * 10) };
                            })}
                          fill={['P1','P2'].length ? '#3b82f6' : '#6b7280'}
                          fillOpacity={0.6}
                        />
                        <Scatter
                          name="P1/P2"
                          data={filteredWRs
                            .filter(wr => ['P1','P2'].includes(wr.priority_code))
                            .map((wr) => {
                              const dt = wr.estimated_duration || wr.ai_classification?.estimated_duration_hours || 1;
                              const p = parseInt((wr.priority_code || 'P2').replace(/\D/g, ''), 10) || 2;
                              return { downtime: dt, priority: p, equipment: wr.equipment_tag || 'N/A', impact: Math.round(dt * (5 - p + 1) * 10) };
                            })}
                          fill="#ef4444"
                          fillOpacity={0.8}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-8 left-16 bg-green-50 px-1.5 py-0.5 rounded text-[9px] text-green-700 border border-green-200 font-medium">
                      RUTINA
                    </div>
                    <div className="absolute top-5 right-4 bg-red-50 px-1.5 py-0.5 rounded text-[9px] text-red-700 border border-red-200 font-medium">
                      {t('failuresEvents.highPriority').toUpperCase()}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {t('failuresEvents.noDataAvailable')}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                {t('failuresEvents.rcaPrioritization')}
              </p>
            </Card>
          </div>

          {/* CENTER: Master Data Reliability */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {t('failuresEvents.masterDataReliability')}
              </h3>
              <div className="space-y-4">
                {[
                  { label: t('failuresEvents.equipmentIdCompleteness'), pct: masterDataStats.eqPct },
                  { label: t('failuresEvents.failureModeAccuracy'), pct: masterDataStats.failurePct },
                  { label: t('failuresEvents.planningStandardsQuality'), pct: masterDataStats.planningPct },
                  { label: t('failuresEvents.sparePartsDataIntegrity'), pct: masterDataStats.sparePct },
                ].map(({ label, pct }) => {
                  const textCls = pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600';
                  const barCls = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">{label}</span>
                        <span className={`text-sm font-semibold ${textCls}`}>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`${barCls} h-3 rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-4">
                {masterDataStats.sparePct < 60
                  ? t('failuresEvents.aiSuggestsSpareParts')
                  : masterDataStats.planningPct < 70
                    ? t('failuresEvents.aiSuggestsPlanningStandards')
                    : t('failuresEvents.dataQualityAcceptable')}
              </p>
            </Card>
          </div>

          {/* RIGHT: Planning Analysis KPIs */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {t('failuresEvents.planningAnalysis')}
              </h3>
              <div className="space-y-6">
                <div className={`${planningStats.laborVar >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                  <p className="text-sm text-gray-600 mb-2">{t('failuresEvents.laborHoursVariance')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${planningStats.laborVar >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {planningStats.laborVar >= 0 ? '+' : ''}{planningStats.laborVar}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {planningStats.laborVar > 10 ? t('failuresEvents.actualHoursHigher') : planningStats.laborVar < -5 ? t('failuresEvents.underEstimatedLabor') : t('failuresEvents.laborVarianceAcceptable')}
                  </p>
                </div>
                <div className={`${planningStats.costVar >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                  <p className="text-sm text-gray-600 mb-2">{t('failuresEvents.sparePartsCostVariance')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${planningStats.costVar >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {planningStats.costVar >= 0 ? '+' : ''}{planningStats.costVar}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {planningStats.costVar < -5 ? t('failuresEvents.aiSuggestsUpdatingStandards') : t('failuresEvents.costVarianceWithinBudget')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Top Recurring Failures */}
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t('failuresEvents.topRecurringFailures')}
          </h3>
          {repetitiveFailuresData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repetitiveFailuresData.slice(0, 4).map((item, idx) => (
                <div key={item.equipment + '-' + idx} className={`bg-white rounded-lg border ${idx === 0 ? 'border-red-200' : 'border-orange-200'} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.equipment}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{t('failuresEvents.occurrences')}</span> {item.count} {t('failuresEvents.workRequestsCount')}
                      </p>
                    </div>
                    <Badge className={idx === 0 ? 'bg-red-100 text-red-800 border-red-300' : 'bg-orange-100 text-orange-800 border-orange-300'}>
                      {idx === 0 ? t('failuresEvents.critical') : t('failuresEvents.high')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('failuresEvents.priority')}: {idx + 1}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-gray-500">
              <p className="text-sm">{t('failuresEvents.noRecurringFailures')}</p>
            </div>
          )}
        </Card>
      </div>

      {/* NEW EXTENDED SECTION: Advanced Tactical Drill-Down */}
      <div className="pt-8 border-t-4 border-emerald-600">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('failuresEvents.advancedTacticalDrillDown')}
          </h2>
        </div>

        {/* AI Overview + Análisis Inteligente */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* AI Overview */}
          <div className="col-span-6">
            <Card className="p-6 bg-white border-l-4 border-emerald-600 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('failuresEvents.aiOverview')}</h3>
              {filteredWRs.length > 0 ? (
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p><span className="font-semibold">{plant || 'Plant'}</span> - {AREA_LABELS[planningGroup] || planningGroup} {t('failuresEvents.areaAnalysis')}</p>
                  <p><span className="font-semibold">{filteredWRs.length}</span> {t('failuresEvents.workRequestsAnalyzed')} ({selectedTimeRange}).</p>
                  <p><span className="font-semibold">{repetitiveFailuresData.length}</span> {t('failuresEvents.equipmentsRecurring')}</p>
                  {repetitiveFailuresData.length > 0 && (
                    <p>{t('failuresEvents.topRecurring')} <span className="font-semibold">{repetitiveFailuresData[0]?.equipment}</span> ({repetitiveFailuresData[0]?.count} {t('failuresEvents.occurrencesCount')})</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('failuresEvents.aiAnalysisBasedOnReal')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('failuresEvents.noWorkRequestsForAI')}</p>
              )}
            </Card>
          </div>

          {/* Análisis Inteligente */}
          <div className="col-span-6">
            <Card className="p-6 bg-emerald-50 border-emerald-300 h-full">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                {t('failuresEvents.analisisInteligente')}
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>{t('failuresEvents.iaDetectingFailures')}</p>
                <p><span className="font-semibold">{t('failuresEvents.planningGroupFilterLabel')}</span> {planningGroup === 'All' ? t('failuresEvents.allValue') : (AREA_LABELS[planningGroup] || planningGroup)}</p>
                <p><span className="font-semibold">{t('failuresEvents.maintenanceLevelLabel')}</span> {level2 === 'All' ? t('failuresEvents.allValue') : level2}</p>
                <p><span className="font-semibold">{t('failuresEvents.responsibleLabel')}</span> {topAssignee.name}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Operational Discipline + Pareto + Repetitivas + Action Center */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Operational Discipline */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">{t('failuresEvents.operationalDiscipline')}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{t('failuresEvents.weeksRollingTrend')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                  {topAssignee.initials}
                </div>
                <span className="text-xs text-gray-600">{topAssignee.name}</span>
              </div>

              {/* Work Orders per Week */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('failuresEvents.workOrdersPerWeek')}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">{filteredWRs.length} {t('failuresEvents.total')}</Badge>
                </div>
                {weeklySparklineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={weeklySparklineData}>
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[80px] text-gray-400 text-xs">{t('failuresEvents.noData')}</div>
                )}
              </div>

              {/* Pending Validation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('failuresEvents.pendingValidation')}</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {filteredWRs.filter(wr => (wr.status || '').includes('PENDING')).length}
                  </Badge>
                </div>
                {weeklySparklineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={weeklySparklineData}>
                      <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[80px] text-gray-400 text-xs">{t('failuresEvents.noData')}</div>
                )}
              </div>

              {/* Equipment Distribution */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('failuresEvents.equipmentDistribution')}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">{workOrdersStatusData.length} {t('failuresEvents.equip')}</Badge>
                </div>
                {weeklySparklineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={weeklySparklineData}>
                      <Bar dataKey="value" fill="#10b981" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[80px] text-gray-400 text-xs">{t('failuresEvents.noData')}</div>
                )}
              </div>

              {/* Priority Distribution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('failuresEvents.priorityDistribution')}</span>
                </div>
                {priorityDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={priorityDistributionData}>
                      <Bar dataKey="count" fill="#10b981" />
                      <XAxis dataKey="priority" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[80px] text-gray-400 text-xs">{t('failuresEvents.noData')}</div>
                )}
              </div>
            </Card>
          </div>

          {/* Pareto Analysis */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">NEW</Badge>
                <h3 className="text-base font-semibold text-gray-900">
                  {t('failuresEvents.paretoAnalysis')} ({selectedTimeRange})
                </h3>
              </div>
              {rootCausesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={rootCausesData.map(item => ({ mode: item.cause, count: item.count, percentage: item.percentage }))}
                    margin={{ top: 20, right: 60, bottom: 60, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mode"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="left"
                      label={{ value: t('failuresEvents.nroCases'), angle: -90, position: 'insideLeft', fontSize: 10 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      label={{ value: t('failuresEvents.accumulated'), angle: 90, position: 'insideRight', fontSize: 10 }}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="count" fill="#059669" name={t('failuresEvents.failureMode')} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="percentage"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#dc2626' }}
                      name={t('failuresEvents.accumulatedPercent')}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  {t('failuresEvents.noFailureModeData')}
                </div>
              )}
            </Card>
          </div>

          {/* Análisis Repetitivas */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">NEW</Badge>
                <h3 className="text-base font-semibold text-gray-900">
                  {t('failuresEvents.repetitiveFailuresAnalysis')}
                </h3>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600">{t('failuresEvents.planningGroupAreaLabel')}</p>
                <p className="text-sm font-bold text-gray-900">{AREA_LABELS[planningGroup] || planningGroup}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">{t('failuresEvents.repetitiveEquipment')} <span className="font-semibold">{repetitiveFailuresData.length}</span></p>
                </div>
              </div>
              {repetitiveFailuresData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={repetitiveFailuresData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="equipment" width={120} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" name={t('failuresEvents.occurrences')} label={{ position: 'right', fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
                  {t('failuresEvents.noRepetitiveFailures')}
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* A1. Analytics & Detailed Critical Work Orders Table */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              &#9660; {t('failuresEvents.a1AnalyticsTitle')}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                {topAssignee.initials}
              </div>
              <span className="text-sm text-gray-600">{topAssignee.name}</span>
            </div>
          </div>

          {filteredWRs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.eventId')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.date')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.equipment')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.workClass')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.description')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.priority')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.durationH')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.status')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.aiClassification')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('failuresEvents.assignedTo')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWRs.slice(0, 15).map((wr, idx) => {
                    const priority = wr.priority_code || wr.priority || 'N/A';
                    const severityColor = (priority === 'P1' || priority === 'P2')
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : priority === 'P3'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300';
                    return (
                      <TableRow key={wr.request_id + '-' + idx} className="hover:bg-gray-50">
                        <TableCell className="text-xs font-medium">{wr.request_id || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{wr.created_at ? wr.created_at.split('T')[0] : 'N/A'}</TableCell>
                        <TableCell className="text-xs font-medium">{wr.equipment_tag || wr.equipment_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{wr.work_class || 'N/A'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{wr.problem_description?.original_text || t('failuresEvents.noDescription')}</TableCell>
                        <TableCell>
                          <Badge className={`${severityColor} text-xs`}>{priority}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-orange-600">{wr.estimated_duration || wr.ai_classification?.estimated_duration_hours || 'N/A'}h</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(wr.status)} text-xs`}>{(wr.status || t('failuresEvents.unknown')).replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{wr.ai_classification?.work_order_type?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{wr.assigned_to_name || t('failuresEvents.unassigned')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400">
              <div className="text-center">
                <p className="text-sm">{t('failuresEvents.noEventsDataYet')}</p>
                <p className="text-xs mt-1">{t('failuresEvents.eventsWillAppear')}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── AI Analysis Complete ── */}
      <div className="pt-8 border-t-4 border-blue-500">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('failuresEvents.aiAnalysisComplete') || 'AI Analysis Complete'}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('failuresEvents.aiAnalysisSubtitle') || 'Data-driven insights from real work request analysis'}</p>
        </div>
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-4">
            <Card className="p-6 bg-white border-l-4 border-blue-500 h-full">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{t('failuresEvents.downtimeReduction') || 'Downtime Reduction Potential'}</h3>
              <div className="text-5xl font-bold text-blue-600">{aiMetrics.downtimeReduction}%</div>
              <p className="text-xs text-gray-500 mt-2">{t('failuresEvents.downtimeReductionDesc') || 'Hours from repetitive equipment failures vs total'}</p>
            </Card>
          </div>
          <div className="col-span-4">
            <Card className="p-6 bg-white border-l-4 border-amber-500 h-full">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{t('failuresEvents.planningGap') || 'Planning Data Gap'}</h3>
              <div className="text-5xl font-bold text-amber-600">{aiMetrics.planningImprovement}%</div>
              <p className="text-xs text-gray-500 mt-2">{t('failuresEvents.planningGapDesc') || 'WRs missing duration or failure catalog data'}</p>
            </Card>
          </div>
          <div className="col-span-4 flex flex-col gap-3 justify-center">
            <Button variant="outline" className="w-full" onClick={() => navigate('/improvement-actions')}>
              {t('failuresEvents.scheduleReviewMeeting') || 'Schedule Review Meeting'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── AI Recommended Actions ── */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('failuresEvents.aiRecommendedActions') || 'AI Recommended Actions'}</h3>
        <div className="space-y-3">
          {[
            { key: 'optimizeStrategy', label: t('failuresEvents.action.optimizeStrategy.label') || 'Optimize Maintenance Strategy', desc: t('failuresEvents.action.optimizeStrategy.desc') || 'AI session for strategy optimization', handler: handleOptimizeStrategy, icon: '\u2699\uFE0F' },
            { key: 'adjustPlanning', label: t('failuresEvents.action.adjustPlanning.label') || 'Adjust Planning Standards', desc: `Labor var: ${planningStats.laborVar}%, Cost var: ${planningStats.costVar}%`, handler: handleAdjustPlanning, icon: '\uD83D\uDCCB' },
            { key: 'requestSpareParts', label: t('failuresEvents.action.requestSpareParts.label') || 'Request Spare Parts Review', desc: `Data integrity: ${masterDataStats.sparePct}%`, handler: handleRequestSpareParts, icon: '\uD83D\uDD27' },
            { key: 'escalate', label: t('failuresEvents.action.escalate.label') || 'Escalate to Technical Support', desc: `${filteredWRs.filter(w => ['P1','P2'].includes(w.priority_code)).length} critical P1/P2 WRs`, handler: handleEscalate, icon: '\uD83D\uDEA8' },
          ].map(action => (
            <div
              key={action.key}
              onClick={actionLoading ? undefined : action.handler}
              className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer ${actionLoading === action.key ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
              {actionLoading === action.key ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Agentic Action Center ── */}
      <Card className="p-6 bg-gray-900 text-white">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold">{t('failuresEvents.agenticActionCenter') || 'Agentic Action Center'}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            
            { key: 'generateWO', label: t('failuresEvents.action.generateWO.label') || 'Generate Work Order', icon: '\uD83D\uDCDD', handler: handleGenerateWorkOrder, color: 'bg-blue-600 hover:bg-blue-500' },
            { key: 'dispatchSupport', label: t('failuresEvents.action.dispatchSupport.label') || 'Dispatch Support', icon: '\uD83D\uDC77', handler: handleDispatchSupport, color: 'bg-amber-600 hover:bg-amber-500' },
            { key: 'escalateIssue', label: t('failuresEvents.action.escalateIssue.label') || 'Escalate Issue', icon: '\u26A1', handler: handleEscalateIssue, color: 'bg-red-600 hover:bg-red-500' },
            { key: 'reviewStrategy', label: t('failuresEvents.action.reviewStrategy.label') || 'Review Strategy', icon: '\uD83D\uDCCA', handler: handleReviewStrategy, color: 'bg-purple-600 hover:bg-purple-500' },
            { key: 'optimizeAiStrategy', label: t('failuresEvents.action.optimizeAiStrategy.label') || 'Optimize Strategy', icon: '\uD83E\uDDE0', handler: handleOptimizeAiStrategy, color: 'bg-indigo-600 hover:bg-indigo-500' },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={actionLoading ? undefined : btn.handler}
              disabled={!!actionLoading}
              className={`${btn.color} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${actionLoading === btn.key ? 'opacity-60' : ''}`}
            >
              {actionLoading === btn.key ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <span className="text-2xl">{btn.icon}</span>
              )}
              <span className="text-sm font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </Card>

      </>)}

      {/* ── WR Detail/Edit Modal ── */}
      {selectedWR && (() => {
        const wr = selectedWR;
        const pd = typeof wr.problem_description === 'object' ? wr.problem_description : {};
        const ai = typeof wr.ai_classification === 'object' ? wr.ai_classification : {};
        const val = typeof wr.validation === 'object' ? wr.validation : {};
        const workers = val.assigned_workers || [];
        const canEdit = !['COMPLETED', 'CLOSED', 'REJECTED'].includes(wr.status);
        const canApprove = ['VALIDATED', 'PENDING_VALIDATION', 'DRAFT'].includes(wr.status);
        const canCreateOT = ['VALIDATED', 'APPROVED', 'ASSIGNED'].includes(wr.status);

        const startEdit = () => {
          setWrEditForm({
            priority_code: wr.priority_code || 'P3',
            description: pd.original_text || String(wr.problem_description || ''),
            suggested_action: pd.suggested_action || '',
            failure_category: pd.failure_mode_detected || '',
            failure_symptom: pd.failure_symptom || '',
            failure_cause: pd.failure_cause || '',
          });
          setWrEditing(true);
        };

        const saveEdit = async () => {
          setWrSaving(true);
          try {
            await api.validateWorkRequest(wr.request_id, {
              action: 'VALIDATE',
              modifications: {
                priority_code: wrEditForm.priority_code,
                problem_description: {
                  ...pd,
                  original_text: wrEditForm.description,
                  suggested_action: wrEditForm.suggested_action,
                  failure_mode_detected: wrEditForm.failure_category,
                  failure_symptom: wrEditForm.failure_symptom,
                  failure_cause: wrEditForm.failure_cause,
                },
              },
            });
            const updated = await api.getWorkRequest(wr.request_id);
            setSelectedWR(updated);
            setWrEditing(false);
          } catch (e) { console.error(e); toast.error('Error saving'); }
          setWrSaving(false);
        };

        const handleApprove = async () => {
          if (!wrActionComment) { toast.warning('Escribe un comentario para aprobar'); return; }
          setWrSaving(true);
          try {
            await api.approveWorkRequest(wr.request_id, { comment: wrActionComment });
            const updated = await api.getWorkRequest(wr.request_id);
            setSelectedWR(updated);
            setWrActionComment('');
          } catch (e) { console.error(e); toast.error('Error al aprobar'); }
          setWrSaving(false);
        };

        const handleReject = async () => {
          if (!wrActionComment) { toast.warning('Escribe una razon para rechazar'); return; }
          setWrSaving(true);
          try {
            await api.rejectWorkRequest(wr.request_id, { reason: wrActionComment });
            const updated = await api.getWorkRequest(wr.request_id);
            setSelectedWR(updated);
            setWrActionComment('');
          } catch (e) { console.error(e); toast.error('Error al rechazar'); }
          setWrSaving(false);
        };

        const handleCreateOT = async () => {
          setWrSaving(true);
          try {
            const result = await api.createWOFromWR({ work_request_id: wr.request_id });
            toast.success(`OT ${result.wo_number} creada exitosamente`);
          } catch (e) { console.error(e); toast.error('Error creating OT'); }
          setWrSaving(false);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setSelectedWR(null); setWrEditing(false); setWrActionComment(''); }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Aviso: {wr.equipment_tag || 'N/A'}</h2>
                  <p className="text-xs text-gray-400 font-mono">{wr.request_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    wr.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    wr.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    wr.status === 'VALIDATED' ? 'bg-blue-100 text-blue-700' :
                    wr.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                    wr.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    wr.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{wr.status?.replace(/_/g, ' ')}</Badge>
                  <Badge className="bg-gray-100 text-gray-700">{wr.priority_code || 'P3'}</Badge>
                  {canEdit && !wrEditing && (
                    <button onClick={startEdit} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Edit</button>
                  )}
                  <button onClick={() => { setSelectedWR(null); setWrEditing(false); setWrActionComment(''); }} className="ml-1 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
                </div>
              </div>
              {/* Body */}
              <div className="p-4 space-y-4">
                {wrEditing ? (
                  <>
                    {/* Edit mode */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Priority</label>
                      <select value={wrEditForm.priority_code} onChange={e => setWrEditForm({...wrEditForm, priority_code: e.target.value})}
                        className="w-full mt-1 border rounded-lg p-2 text-sm">
                        <option value="P1">P1 - Emergencia</option>
                        <option value="P2">P2 - Urgent</option>
                        <option value="P3">P3 - Normal</option>
                        <option value="P4">P4 - Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Description del problema</label>
                      <textarea value={wrEditForm.description} onChange={e => setWrEditForm({...wrEditForm, description: e.target.value})}
                        className="w-full mt-1 border rounded-lg p-2 text-sm" rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Accion sugerida</label>
                      <textarea value={wrEditForm.suggested_action} onChange={e => setWrEditForm({...wrEditForm, suggested_action: e.target.value})}
                        className="w-full mt-1 border rounded-lg p-2 text-sm" rows={2} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Categoria falla</label>
                        <select value={wrEditForm.failure_category} onChange={e => setWrEditForm({...wrEditForm, failure_category: e.target.value})}
                          className="w-full mt-1 border rounded-lg p-2 text-sm">
                          <option value="">—</option>
                          <option value="MECANICO">Mecanico</option>
                          <option value="ELECTRICO">Electrico</option>
                          <option value="INSTRUMENTACION">Instrumentacion</option>
                          <option value="PROCESO">Proceso</option>
                          <option value="ESTRUCTURAL">Estructural</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Sintoma</label>
                        <input value={wrEditForm.failure_symptom} onChange={e => setWrEditForm({...wrEditForm, failure_symptom: e.target.value})}
                          className="w-full mt-1 border rounded-lg p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Causa</label>
                        <input value={wrEditForm.failure_cause} onChange={e => setWrEditForm({...wrEditForm, failure_cause: e.target.value})}
                          className="w-full mt-1 border rounded-lg p-2 text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveEdit} disabled={wrSaving}>
                        {wrSaving ? 'Guardando...' : 'Save changes'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setWrEditing(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View mode */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Description del problema</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{pd.original_text || String(wr.problem_description || 'Sin descripcion')}</p>
                    </div>
                    {(pd.failure_mode_detected || pd.failure_symptom || pd.failure_cause) && (
                      <div className="grid grid-cols-3 gap-3">
                        {pd.failure_mode_detected && (
                          <div className="bg-red-50 rounded p-2">
                            <p className="text-[10px] text-red-500 font-semibold uppercase">Categoria Falla</p>
                            <p className="text-sm font-medium text-red-700">{pd.failure_mode_detected}</p>
                          </div>
                        )}
                        {pd.failure_symptom && (
                          <div className="bg-orange-50 rounded p-2">
                            <p className="text-[10px] text-orange-500 font-semibold uppercase">Sintoma</p>
                            <p className="text-sm font-medium text-orange-700">{pd.failure_symptom}</p>
                          </div>
                        )}
                        {pd.failure_cause && (
                          <div className="bg-yellow-50 rounded p-2">
                            <p className="text-[10px] text-yellow-600 font-semibold uppercase">Causa</p>
                            <p className="text-sm font-medium text-yellow-700">{pd.failure_cause}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {pd.suggested_action && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Accion sugerida</h3>
                        <p className="text-sm text-gray-600 bg-blue-50 rounded p-3">{pd.suggested_action}</p>
                      </div>
                    )}
                    {Object.keys(ai).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Clasificacion AI</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {ai.work_order_type && <div className="bg-gray-50 rounded p-2"><span className="text-gray-400">Tipo OT:</span> <span className="font-medium">{ai.work_order_type}</span></div>}
                          {ai.estimated_duration_hours && <div className="bg-gray-50 rounded p-2"><span className="text-gray-400">Horas est.:</span> <span className="font-medium">{ai.estimated_duration_hours}h</span></div>}
                          {ai.plant_id && <div className="bg-gray-50 rounded p-2"><span className="text-gray-400">Planta:</span> <span className="font-medium">{ai.plant_id}</span></div>}
                          {ai.criticality && <div className="bg-gray-50 rounded p-2"><span className="text-gray-400">Criticidad:</span> <span className="font-medium">{ai.criticality}</span></div>}
                        </div>
                      </div>
                    )}
                    {workers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Technicians asignados</h3>
                        <div className="flex flex-wrap gap-2">
                          {workers.map((w, i) => (
                            <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">{w.name} ({w.specialty || 'General'})</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {pd.resources && pd.resources.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Resources</h3>
                        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                          {pd.resources.map((r, i) => <div key={i}>{r.type}: {r.quantity} ({r.hours}h)</div>)}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 border-t pt-3">
                      <div>Creado: {wr.created_at ? new Date(wr.created_at).toLocaleString() : '—'}</div>
                      <div>Actualizado: {wr.updated_at ? new Date(wr.updated_at).toLocaleString() : '—'}</div>
                      {wr.approved_at && <div>Approved: {new Date(wr.approved_at).toLocaleString()}</div>}
                      {wr.approval_comment && <div>Comentario: {wr.approval_comment}</div>}
                    </div>

                    {/* Approve / Reject section */}
                    {canApprove && (
                      <div className="border-t pt-3 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Comentario (requerido para aprobar/rechazar)</label>
                        <textarea value={wrActionComment} onChange={e => setWrActionComment(e.target.value)}
                          placeholder="Comentario de aprobacion o razon de rechazo..."
                          className="w-full border rounded-lg p-2 text-sm" rows={2} />
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={wrSaving}>
                            {wrSaving ? '...' : 'Approve'}
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={wrSaving}>
                            {wrSaving ? '...' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Create OT button */}
                    {canCreateOT && (
                      <div className="border-t pt-3">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateOT} disabled={wrSaving}>
                          {wrSaving ? 'Creando...' : 'Create Work Order desde este Aviso'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t p-3 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => { navigate('/work-orders'); setSelectedWR(null); setWrEditing(false); }}>
                  Ver en Work Orders
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedWR(null); setWrEditing(false); setWrActionComment(''); }}>Close</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
