import { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { ArrowUp, ArrowDown, Minus, TrendingUp, AlertCircle, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as api from '../../api';
import { filterByDateRange } from '../../utils/dateRange';

// Helper: determine KPI status based on value vs target
function kpiStatus(value, target, lowerIsBetter = false) {
  if (value === '—' || value === null || value === undefined) return 'warning';
  const v = typeof value === 'number' ? value : parseFloat(value);
  const t = typeof target === 'number' ? target : parseFloat(target);
  if (isNaN(v) || isNaN(t)) return 'warning';
  const ratio = lowerIsBetter ? t / v : v / t;
  if (ratio >= 1) return 'good';
  if (ratio >= 0.9) return 'warning';
  return 'critical';
}

function KpiCard({ title, value, target, trend, status, unit = '', weeklyData, onClick }) {
  const statusColors = {
    good: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    critical: 'border-red-500 bg-red-50',
  };

  const statusTextColors = {
    good: 'text-green-700',
    warning: 'text-yellow-700',
    critical: 'text-red-700',
  };

  const statusLabels = {
    good: 'On Track',
    warning: 'Watch',
    critical: 'Action Required',
  };

  const statusIcons = {
    good: CheckCircle,
    warning: AlertCircle,
    critical: AlertCircle,
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;
  const StatusIcon = statusIcons[status];

  return (
    <Card
      className={`p-4 border-l-4 ${statusColors[status]} cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-sm text-gray-700 font-medium flex-1">{title}</p>
          <Badge
            className={`${statusColors[status]} ${statusTextColors[status]} border-0 text-xs flex items-center gap-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusLabels[status]}
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${statusTextColors[status]}`}>
            {value}{unit}
          </p>
          {TrendIcon && <TrendIcon className={`w-5 h-5 ${statusTextColors[status]}`} />}
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">Target:</span> {target}{unit}
        </div>

        {weeklyData && weeklyData.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={weeklyData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={status === 'good' ? '#10b981' : status === 'warning' ? '#eab308' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                />
                <ReferenceLine
                  y={typeof target === 'number' ? target : 0}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-1 text-center">Last 12 weeks trend</p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs hover:bg-white/50 flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" />
          View Details
        </Button>
      </div>
    </Card>
  );
}

export default function KpiControlPanel({ selectedPlant, selectedTimeRange, onKpiClick }) {
  const [viewMode, setViewMode] = useState('accumulated');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API data
  const [execData, setExecData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    if (!selectedPlant) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getExecutiveDashboard(selectedPlant).catch(() => null),
      api.getAnalyticsPageData(selectedPlant).catch(() => null),
      api.listWorkRequests({ plant_id: selectedPlant }).catch(() => []),
    ])
      .then(([exec, analytics, wrs]) => {
        if (cancelled) return;
        setExecData(exec);
        setAnalyticsData(analytics);
        setWorkRequests(Array.isArray(wrs) ? wrs : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load KPI data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedPlant]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600 text-sm">Loading KPI data...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-800 font-medium text-sm">Error loading KPIs</p>
        <p className="text-red-600 text-xs mt-1">{error}</p>
      </Card>
    );
  }

  // ── Compute KPIs from API data ──
  const e = execData || {};
  const a = analyticsData || {};
  const kpis = a.kpis || {};
  const woByType = a.work_orders_by_type || [];
  const reliabilityKpisRaw = a.reliability_kpis || [];

  // Filter work requests by time range
  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  const totalWrs = filteredWRs.length;
  const lateNotifs = filteredWRs.filter(wr => wr.status === 'late' || wr.is_late).length;
  const lateWos = filteredWRs.filter(wr => wr.status === 'overdue' || wr.is_overdue).length;
  const lateNotifPct = totalWrs > 0 ? Math.round((lateNotifs / totalWrs) * 100) : '—';
  const lateWoPct = totalWrs > 0 ? Math.round((lateWos / totalWrs) * 100) : '—';

  const schedAdherence = e.schedule_adherence;
  const mtbf = e.mtbf !== '—' && e.mtbf != null ? e.mtbf : (kpis.mtbf || '—');
  const mttr = e.mttr !== '—' && e.mttr != null ? e.mttr : (kpis.mttr || '—');
  const availability = kpis.availability || '—';
  const oee = kpis.oee || e.oee || '—';

  // Work type breakdowns
  const correctiveHours = woByType.find(w => w.type?.toUpperCase() === 'CORRECTIVE')?.hours || '—';
  const preventiveHours = woByType.find(w => w.type?.toUpperCase() === 'PREVENTIVE')?.hours || '—';
  const correctiveCount = woByType.find(w => w.type?.toUpperCase() === 'CORRECTIVE')?.count || 0;
  const preventiveCount = woByType.find(w => w.type?.toUpperCase() === 'PREVENTIVE')?.count || 0;
  const totalHours = woByType.reduce((s, w) => s + (w.hours || 0), 0);

  // Planned vs unplanned
  const plannedWrs = filteredWRs.filter(wr => wr.work_type === 'preventive' || wr.work_type === 'planned').length;
  const unplannedWrs = filteredWRs.filter(wr => wr.work_type === 'corrective' || wr.priority === 'emergency').length;
  const plannedPct = totalWrs > 0 ? Math.round((plannedWrs / totalWrs) * 100) : '—';
  const unplannedPct = totalWrs > 0 ? Math.round((unplannedWrs / totalWrs) * 100) : '—';

  // Rework — check for rework flag
  const reworkCount = filteredWRs.filter(wr => wr.is_rework || wr.rework).length;
  const reworkPct = totalWrs > 0 ? Math.round((reworkCount / totalWrs) * 100) : '—';

  // No weekly trend data from API — leave empty unless kpi_history available
  const kpiHistory = a.kpi_history || [];
  const buildWeeklyFromHistory = (key) => {
    if (kpiHistory.length === 0) return [];
    return kpiHistory.slice(-12).map((h, idx) => ({
      week: h.period || `W${idx + 1}`,
      value: h[key] || 0,
    }));
  };

  // 1. OPERATIONAL DISCIPLINE
  const operationalDisciplineKpis = [
    {
      title: 'Late Notifications (%)',
      value: lateNotifPct,
      target: 10,
      trend: 'stable',
      status: kpiStatus(lateNotifPct, 10, true),
      weeklyData: [],
    },
    {
      title: 'Late Work Orders (%)',
      value: lateWoPct,
      target: 15,
      trend: 'stable',
      status: kpiStatus(lateWoPct, 15, true),
      weeklyData: [],
    },
    {
      title: 'Schedule Compliance (%)',
      value: schedAdherence !== '—' && schedAdherence != null ? schedAdherence : '—',
      target: 90,
      trend: 'stable',
      status: kpiStatus(schedAdherence, 90),
      weeklyData: [],
    },
  ];

  // 2. PLANNING
  const backlogAge = e.backlog_age;
  const planningKpis = [
    {
      title: 'Backlog Age',
      value: backlogAge !== '—' && backlogAge != null ? backlogAge : '—',
      target: '< 4 weeks',
      trend: 'stable',
      status: backlogAge === '—' || backlogAge == null ? 'warning' : 'good',
      weeklyData: [],
    },
    {
      title: 'Schedule Adherence (%)',
      value: schedAdherence !== '—' && schedAdherence != null ? schedAdherence : '—',
      target: 85,
      trend: 'stable',
      status: kpiStatus(schedAdherence, 85),
      weeklyData: [],
    },
    {
      title: 'Planned Work (%)',
      value: plannedPct,
      target: 65,
      trend: 'stable',
      status: kpiStatus(plannedPct, 65),
      weeklyData: [],
    },
    {
      title: 'Unplanned Work (%)',
      value: unplannedPct,
      target: 35,
      trend: 'stable',
      status: kpiStatus(unplannedPct, 35, true),
      weeklyData: [],
    },
  ];

  // 3. RELIABILITY
  const reliabilityKpis = [
    {
      title: 'Availability (%)',
      value: availability !== '—' ? availability : '—',
      target: 95,
      trend: 'stable',
      status: kpiStatus(availability, 95),
      weeklyData: buildWeeklyFromHistory('availability'),
    },
    {
      title: 'MTBF (hours)',
      value: mtbf !== '—' ? mtbf : '—',
      target: 300,
      trend: 'stable',
      status: kpiStatus(mtbf, 300),
      weeklyData: buildWeeklyFromHistory('mtbf'),
    },
    {
      title: 'MTTR (hours)',
      value: mttr !== '—' ? mttr : '—',
      target: 3.5,
      trend: 'stable',
      status: kpiStatus(mttr, 3.5, true),
      weeklyData: buildWeeklyFromHistory('mttr'),
    },
  ];

  // 4. EXECUTION METRICS
  const executionKpis = [
    {
      title: 'Corrective Hours',
      value: correctiveHours !== '—' ? correctiveHours : '—',
      target: 900,
      trend: 'stable',
      status: kpiStatus(correctiveHours, 900, true),
      weeklyData: [],
    },
    {
      title: 'Preventive Hours',
      value: preventiveHours !== '—' ? preventiveHours : '—',
      target: 800,
      trend: 'stable',
      status: preventiveHours === '—' ? 'warning' : 'good',
      weeklyData: [],
    },
    {
      title: 'Rework (%)',
      value: reworkPct,
      target: 10,
      trend: 'stable',
      status: kpiStatus(reworkPct, 10, true),
      weeklyData: [],
    },
    {
      title: 'Total Work Requests',
      value: totalWrs,
      target: '—',
      trend: 'stable',
      status: totalWrs > 0 ? 'good' : 'warning',
      weeklyData: [],
    },
    {
      title: 'WO Types (Corr/Prev)',
      value: `${correctiveCount}/${preventiveCount}`,
      target: '—',
      trend: 'stable',
      status: correctiveCount > preventiveCount ? 'warning' : 'good',
    },
  ];

  // Summary badges
  const allKpis = [...operationalDisciplineKpis, ...planningKpis, ...reliabilityKpis, ...executionKpis];
  const criticalCount = allKpis.filter(k => k.status === 'critical').length;
  const watchCount = allKpis.filter(k => k.status === 'warning').length;
  const goodCount = allKpis.filter(k => k.status === 'good').length;

  return (
    <div className="space-y-6">
      {/* Filter Controls - More Compact */}
      <Card className="p-4 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'accumulated' ? 'default' : 'ghost'}
                  className={viewMode === 'accumulated' ? 'bg-emerald-600 text-white h-8 text-xs' : 'h-8 text-xs'}
                  onClick={() => setViewMode('accumulated')}
                >
                  Accumulated
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                  className={viewMode === 'weekly' ? 'bg-emerald-600 text-white h-8 text-xs' : 'h-8 text-xs'}
                  onClick={() => setViewMode('weekly')}
                >
                  Weekly
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                  className={selectedFilter === 'all' ? 'bg-emerald-600 text-white h-8 text-xs' : 'h-8 text-xs'}
                  onClick={() => setSelectedFilter('all')}
                >
                  All Equipment
                </Button>
                <Button
                  size="sm"
                  variant={selectedFilter === 'critical' ? 'default' : 'ghost'}
                  className={selectedFilter === 'critical' ? 'bg-emerald-600 text-white h-8 text-xs' : 'h-8 text-xs'}
                  onClick={() => setSelectedFilter('critical')}
                >
                  Critical Only
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
              {criticalCount} Critical
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
              {watchCount} Watch
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
              {goodCount} On Track
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white shadow-sm">
        {/* 1. OPERATIONAL DISCIPLINE - HIGHEST PRIORITY */}
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-lg">1. Operational Discipline</h4>
                <p className="text-sm text-emerald-700">Core execution metrics - highest priority</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
              PRIORITY
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationalDisciplineKpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                {...kpi}
                onClick={() => onKpiClick('operationalDiscipline', kpi.title, filteredWRs.filter(wr => wr.status === 'late' || wr.is_late || wr.status === 'overdue' || wr.is_overdue))}
              />
            ))}
          </div>
        </div>

        {/* 2. PLANNING - OPERATIONAL ONLY */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">2. Planning & Scheduling</h4>
              <p className="text-sm text-gray-600">Operational planning metrics (financial excluded)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planningKpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                {...kpi}
                onClick={() => onKpiClick('planning', kpi.title, [])}
              />
            ))}
          </div>
        </div>

        {/* 3. RELIABILITY - CRITICAL EQUIPMENT FOCUS */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">3. Reliability Metrics</h4>
              <p className="text-sm text-gray-600">Simplified view - critical equipment focus</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reliabilityKpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                {...kpi}
                onClick={() => onKpiClick('reliability', kpi.title, [])}
              />
            ))}
          </div>
        </div>

        {/* 4. EXECUTION - SUPERVISOR FOCUS */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">4. Execution Metrics</h4>
              <p className="text-sm text-gray-600">Supervisor role - impact on execution and deviations</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {executionKpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                {...kpi}
                onClick={() => onKpiClick('execution', kpi.title, filteredWRs)}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
