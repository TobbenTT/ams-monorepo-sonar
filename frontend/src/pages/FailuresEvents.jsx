import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import * as api from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis } from 'recharts';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { selectedPlant, selectedTimeRange, selectedArea, viewMode } = useOutletContext();
  const plant = selectedPlant;
  const [planningGroup, setPlanningGroup] = useState('All');
  const [level2, setLevel2] = useState('All');
  const [specialty, setSpecialty] = useState('All');

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
  const [rcas, setRcas] = useState([]);
  const [rcaSummary, setRcaSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [wrData, rcaData, rcaSumData] = await Promise.allSettled([
          api.listWorkRequests({ plant_id: plant }),
          api.listRcas({ plant_id: plant }),
          api.getRcaSummary({ plant_id: plant }),
        ]);
        if (!cancelled) {
          setWorkRequests(Array.isArray(wrData.value) ? wrData.value : []);
          setRcas(Array.isArray(rcaData.value) ? rcaData.value : []);
          setRcaSummary(rcaSumData.value || null);
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
    const highP = filteredWRs.filter(w => w.priority_code === 'P1' || w.priority_code === 'P2').length;
    const ratio = highP / filteredWRs.length;
    return {
      laborVar: Math.round((ratio * 30 - 5) * 10) / 10,
      costVar: Math.round((ratio * 15 - 8) * 10) / 10,
    };
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

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('REJECT') || s.includes('CRITICAL') || s.includes('OVERDUE')) return 'bg-red-100 text-red-800 border-red-300';
    if (s.includes('PENDING') || s.includes('MEDIUM')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (s.includes('APPROVED') || s.includes('PROGRESS')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalWorkOrders.map((wo, idx) => (
                  <TableRow key={wo.id + '-' + idx} className="hover:bg-gray-50 cursor-pointer">
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
          {/* LEFT: Jack-knife Analysis */}
          <div className="col-span-4">
            <Card className="p-6 bg-white h-full">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {t('failuresEvents.failureCriticalityVsCost')}
              </h3>
              <div className="relative h-64 bg-white rounded-lg">
                {filteredWRs.length > 0 ? (
                  <>
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
                          domain={[0, 6]}
                          label={{ value: t('failuresEvents.priorityHighest'), angle: -90, position: 'insideLeft', fontSize: 11 }}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value, name) => [value, name]}
                        />
                        <Scatter
                          name={t('failuresEvents.workRequestsScatter')}
                          data={filteredWRs.map((wr) => ({
                            downtime: wr.estimated_duration || wr.ai_classification?.estimated_duration_hours || 1,
                            priority: parseInt((wr.priority_code || 'P5').replace(/\D/g, ''), 10) || 5,
                            equipment: wr.equipment_tag || wr.equipment_name || 'Unknown',
                          }))}
                          fill="#6b7280"
                          shape="circle"
                        />
                        <Scatter
                          name={t('failuresEvents.highPriorityP1P2')}
                          data={filteredWRs
                            .filter(wr => {
                              const p = (wr.priority_code || '');
                              return p === 'P1' || p === 'P2';
                            })
                            .map((wr) => ({
                              downtime: wr.estimated_duration || wr.ai_classification?.estimated_duration_hours || 1,
                              priority: parseInt((wr.priority_code || 'P5').replace(/\D/g, ''), 10) || 5,
                              equipment: wr.equipment_tag || wr.equipment_name || 'Unknown',
                            }))}
                          fill="#ef4444"
                          shape="circle"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-8 left-16 bg-white/80 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">
                      {t('failuresEvents.lowPriority')}
                    </div>
                    <div className="absolute top-12 right-20 bg-white/80 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">
                      {t('failuresEvents.highPriority')}
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

        {/* Second Row: AI Recommendations + Actions */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* LEFT: Placeholder for future content or full width recommendations */}
          <div className="col-span-8">
            <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('failuresEvents.aiAnalysisComplete')}</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {t('failuresEvents.aiAnalysisDescription')}
                    <span className="font-semibold text-emerald-700"> {t('failuresEvents.highPriorityActions')}</span> {t('failuresEvents.couldReduceDowntime')} <span className="font-semibold text-emerald-700">25%</span> {t('failuresEvents.andImprovePlanning')} <span className="font-semibold text-emerald-700">15%</span>.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                      {t('failuresEvents.viewFullAIReport')}
                    </Button>
                    <Button variant="outline" className="text-sm border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                      {t('failuresEvents.scheduleReviewMeeting')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: AI Recommended Actions Panel */}
          <div className="col-span-4">
            <Card className="p-6 bg-white border-l-4 border-emerald-500">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {t('failuresEvents.aiRecommendedActions')}
              </h3>

              {/* Chronic Failure Solutions */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('failuresEvents.chronicFailureSolutions')}
                </p>
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 cursor-pointer hover:bg-emerald-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t('failuresEvents.generateProactiveRCA')}</p>
                        <p className="text-xs text-gray-600 mt-1">{t('failuresEvents.generateProactiveRCADesc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 cursor-pointer hover:bg-emerald-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t('failuresEvents.optimizeMaintenanceStrategy')}</p>
                        <p className="text-xs text-gray-600 mt-1">{t('failuresEvents.optimizeMaintenanceStrategyDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Planning Deviations */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('failuresEvents.planningDeviations')}
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t('failuresEvents.adjustPlanningStandards')}</p>
                        <p className="text-xs text-gray-600 mt-1">{t('failuresEvents.adjustPlanningStandardsDesc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t('failuresEvents.requestSpareParts')}</p>
                        <p className="text-xs text-gray-600 mt-1">{t('failuresEvents.requestSparePartsDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalation */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('failuresEvents.escalation')}
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{t('failuresEvents.escalateToTechnicalSupport')}</p>
                      <p className="text-xs text-gray-600 mt-1">{t('failuresEvents.escalateToTechnicalSupportDesc')}</p>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('failuresEvents.aiSelectedForRCA')}
                    </Button>
                    <span className="text-xs text-gray-500">{t('failuresEvents.priority')}: {idx + 1}</span>
                  </div>
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
          <div className="col-span-3">
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
            </Card>
          </div>

          {/* Pareto Analysis */}
          <div className="col-span-3">
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
          <div className="col-span-3">
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

          {/* Agentic Action Center */}
          <div className="col-span-3">
            <Card className="p-6 bg-emerald-900 text-white h-full">
              <h3 className="text-lg font-bold mb-6">{t('failuresEvents.agenticActionCenter')}</h3>
              <div className="space-y-3">
                <div className="bg-emerald-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-emerald-600 transition-colors">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.agenticCoPilotReady')}</span>
                </div>

                <div className="bg-teal-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-teal-600 transition-colors">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.generateWorkOrder')}</span>
                </div>

                <div className="bg-blue-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-blue-600 transition-colors">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.dispatchSupport')}</span>
                </div>

                <div className="bg-yellow-600 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-yellow-500 transition-colors">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.escalateIssue')}</span>
                </div>

                <div className="bg-purple-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-purple-600 transition-colors">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.reviewStrategy')}</span>
                </div>

                <div className="bg-cyan-700 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-cyan-600 transition-colors">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t('failuresEvents.optimizeStrategy')}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-700">
                <p className="text-xs text-emerald-200">{t('failuresEvents.statusAgenticReady')}</p>
              </div>
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

      </>)}
    </div>
  );
}
