import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown, Minus, DollarSign, Users, Wrench, Shield, Loader2 } from 'lucide-react';
import * as api from '../../api';
import { filterByDateRange } from '../../utils/dateRange';
import { useLanguage } from '../../contexts/LanguageContext';

// Helper: determine KPI status based on value vs target
function kpiStatus(value, target, lowerIsBetter = false) {
  if (value === '—' || value === null || value === undefined) return 'warning';
  const v = typeof value === 'number' ? value : parseFloat(value);
  const tgt = typeof target === 'number' ? target : parseFloat(target);
  if (isNaN(v) || isNaN(tgt)) return 'warning';
  const ratio = lowerIsBetter ? tgt / v : v / tgt;
  if (ratio >= 1) return 'good';
  if (ratio >= 0.9) return 'warning';
  return 'critical';
}

// Helper: format KPI value — show "—" for missing data
function fmtKpi(val, unit = '') {
  if (val === '—' || val === null || val === undefined || val === '') return '—';
  return `${val}${unit}`;
}

// Helper: strip unit suffix from API-formatted strings like "99.5%", "93.8d", "11.2h"
// Returns { num: 99.5, raw: "99.5%" } or { num: null, raw: "—" }
function parseKpi(val) {
  if (val === '—' || val === '---' || val === null || val === undefined || val === '') return { num: null, raw: '—' };
  if (typeof val === 'number') return { num: val, raw: String(val) };
  const match = String(val).match(/^([\d.]+)/);
  if (match) return { num: parseFloat(match[1]), raw: String(val) };
  return { num: null, raw: String(val) };
}

export default function ExecutiveView({ selectedPlant, selectedTimeRange, selectedArea }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('mantenimiento');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [execData, setExecData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    if (!selectedPlant) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getExecutiveDashboard(selectedPlant).catch(() => null),
      api.getAnalyticsPageData(selectedPlant).catch(() => null),
      api.getDashboardAlerts(selectedPlant).catch(() => null),
      api.listWorkRequests({ plant_id: selectedPlant }).catch(() => []),
    ])
      .then(([exec, analytics, alerts, wrs]) => {
        if (cancelled) return;
        setExecData(exec);
        setAnalyticsData(analytics);
        setAlertsData(alerts);
        setWorkRequests(Array.isArray(wrs) ? wrs : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('executive.failedToLoad'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedPlant]);

  // Filter work requests by time range (must be before early returns — Rules of Hooks)
  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600 text-sm">{t('executive.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="p-6 border-red-200 bg-red-50 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-medium mb-1">{t('executive.errorLoading')}</p>
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  // Shorthand — safe access
  const e = execData || {};
  const a = analyticsData || {};

  const kpis = a.kpis || {};

  const KpiCard = ({ title, value, target, trend, status, unit = '', icon: Icon }) => {
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
      good: t('executive.onTrack'),
      warning: t('executive.watch'),
      critical: t('executive.actionRequired'),
    };
    const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;
    return (
      <Card className={`p-4 border-l-4 ${statusColors[status]} hover:shadow-lg transition-all`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              {Icon && <Icon className="w-4 h-4 text-gray-600" />}
              <p className="text-sm text-gray-700 font-medium">{title}</p>
            </div>
            <Badge className={`${statusColors[status]} ${statusTextColors[status]} border-0 text-xs`}>
              {statusLabels[status]}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${statusTextColors[status]}`}>{value}{unit}</p>
            {TrendIcon && <TrendIcon className={`w-5 h-5 ${statusTextColors[status]}`} />}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t('executive.target')}:</span> {target}{unit}
          </div>
        </div>
      </Card>
    );
  };

  // ── Empty chart placeholder ──
  const EmptyChart = ({ message }) => (
    <div className="flex items-center justify-center h-[300px] text-gray-400">
      <div className="text-center">
        <Minus className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{message || t('executive.noDataAvailable')}</p>
      </div>
    </div>
  );

  // ── Root Cause Insights — show real alerts if any ──
  const RootCauseInsightsPanel = () => {
    const alerts = alertsData?.alerts || [];
    const totalActive = alertsData?.total_active || 0;

    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">{t('executive.rootCauseTitle')}</h3>
              <p className="text-sm text-blue-700">
                {totalActive > 0 ? t('executive.rootCauseActiveAlerts').replace('{count}', totalActive) : t('executive.rootCauseNoAlerts')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">{t('executive.viewFullAnalysis')}</Button>
        </div>
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">{alert.title || alert.type || t('executive.alert')}</p>
                <p className="text-xs text-blue-700 mt-1">{alert.description || alert.message || '—'}</p>
                <Badge className={`mt-2 text-xs ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>{alert.severity || t('executive.info')}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg border border-blue-200 text-center text-sm text-blue-700">
            {t('executive.rootCauseNoFindings')}
          </div>
        )}
      </Card>
    );
  };

  // ── Production Tab — uses OEE and schedule_adherence from API ──
  const ProductionTabContent = () => {
    const pOee = parseKpi(e.oee !== '—' && e.oee != null ? e.oee : kpis.oee);
    const pSched = parseKpi(e.schedule_adherence);
    const pAvail = parseKpi(kpis.availability);

    // Build trend from kpi_history if available
    const kpiHistory = a.kpi_history || [];
    const hasHistory = kpiHistory.length > 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="OEE"
            value={pOee.num != null ? pOee.num : '—'}
            target={90}
            trend="stable"
            status={kpiStatus(pOee.num, 90)}
            unit={pOee.num != null ? '%' : ''}
            icon={CheckCircle}
          />
          <KpiCard
            title={t('executive.scheduleAdherence')}
            value={pSched.num != null ? pSched.num : '—'}
            target={85}
            trend="stable"
            status={kpiStatus(pSched.num, 85)}
            unit={pSched.num != null ? '%' : ''}
            icon={TrendingUp}
          />
          <KpiCard
            title={t('executive.availability')}
            value={pAvail.num != null ? pAvail.num : '—'}
            target={95}
            trend="stable"
            status={kpiStatus(pAvail.num, 95)}
            unit={pAvail.num != null ? '%' : ''}
            icon={CheckCircle}
          />
          <KpiCard
            title={t('executive.strategyCompletion')}
            value={e.strategy_completion != null ? e.strategy_completion : '—'}
            target={100}
            trend="stable"
            status={kpiStatus(e.strategy_completion, 100)}
            unit={e.strategy_completion != null ? '%' : ''}
            icon={TrendingUp}
          />
        </div>

        {/* Completion breakdown */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">{t('executive.implementationProgress')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('executive.strategy'), val: e.strategy_completion },
              { label: t('executive.planning'), val: e.planning_completion },
              { label: t('executive.field'), val: e.field_completion },
              { label: t('executive.analytics'), val: e.analytics_completion },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {item.val != null ? `${item.val}%` : '—'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.val != null ? item.val : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trend chart — from kpi_history if available */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">{t('executive.kpiTrend')}</h4>
          {hasHistory ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oee" stroke="#10b981" strokeWidth={2} name="OEE" />
                <Line type="monotone" dataKey="availability" stroke="#6366f1" strokeWidth={2} name={t('executive.availability')} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message={t('executive.noHistoricalTrend')} />
          )}
        </Card>
      </div>
    );
  };

  // ── Mantenimiento Tab — uses MTBF, MTTR, equipment_health, backlog_age from API ──
  const MantenimientoTabContent = () => {
    // Parse API values (they come as formatted strings like "99.5%", "93.8d", "11.2h")
    const pAvail = parseKpi(kpis.availability);
    const pMtbf = parseKpi(e.mtbf !== '—' && e.mtbf != null ? e.mtbf : kpis.mtbf);
    const pMttr = parseKpi(e.mttr !== '—' && e.mttr != null ? e.mttr : kpis.mttr);
    const pSched = parseKpi(e.schedule_adherence);
    const pEqHealth = parseKpi(e.equipment_health);
    const pBacklog = parseKpi(e.backlog_age);
    const pIso = parseKpi(e.iso_compliance);

    // Derive work order stats from filtered work requests
    const totalWrs = filteredWRs.length;
    const correctiveWrs = filteredWRs.filter(wr => wr.work_type === 'corrective' || wr.priority === 'emergency').length;
    const plannedPct = totalWrs > 0 ? Math.round(((totalWrs - correctiveWrs) / totalWrs) * 100) : null;

    // Costs from work_orders_by_type in analytics (case-insensitive match)
    const woByType = a.work_orders_by_type || [];
    const correctiveEntry = woByType.find(w => w.type?.toUpperCase() === 'CORRECTIVE');
    const preventiveEntry = woByType.find(w => w.type?.toUpperCase() === 'PREVENTIVE');
    const correctiveHours = correctiveEntry?.hours ?? null;
    const preventiveHours = preventiveEntry?.hours ?? null;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-gray-900">{t('executive.resultados')}</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title={t('executive.availability')}
              value={pAvail.num != null ? pAvail.num : '—'}
              target={95}
              trend="stable"
              status={kpiStatus(pAvail.num, 95)}
              unit={pAvail.num != null ? '%' : ''}
            />
            <KpiCard
              title={t('executive.mtbf')}
              value={pMtbf.num != null ? pMtbf.num : '—'}
              target={300}
              trend="stable"
              status={kpiStatus(pMtbf.num, 300)}
              unit={pMtbf.num != null ? ` ${t('executive.days')}` : ''}
            />
            <KpiCard
              title={t('executive.mttr')}
              value={pMttr.num != null ? pMttr.num : '—'}
              target={3.5}
              trend="stable"
              status={kpiStatus(pMttr.num, 3.5, true)}
              unit={pMttr.num != null ? ` ${t('executive.hrs')}` : ''}
            />
            <KpiCard
              title={t('executive.scheduleCompliance')}
              value={pSched.num != null ? pSched.num : '—'}
              target={90}
              trend="stable"
              status={kpiStatus(pSched.num, 90)}
              unit={pSched.num != null ? '%' : ''}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-gray-900">{t('executive.costos')}</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title={t('executive.equipmentHealth')}
              value={pEqHealth.num != null ? pEqHealth.num : '—'}
              target={95}
              trend="stable"
              status={kpiStatus(pEqHealth.num, 95)}
              unit={pEqHealth.num != null ? '%' : ''}
              icon={DollarSign}
            />
            <KpiCard
              title={t('executive.correctiveHours')}
              value={correctiveHours != null ? correctiveHours : '—'}
              target="—"
              trend="stable"
              status={correctiveHours != null ? 'warning' : 'warning'}
              unit={correctiveHours != null ? ` ${t('executive.hrs')}` : ''}
              icon={DollarSign}
            />
            <KpiCard
              title={t('executive.preventiveHours')}
              value={preventiveHours != null ? preventiveHours : '—'}
              target="—"
              trend="stable"
              status={preventiveHours != null ? 'good' : 'warning'}
              unit={preventiveHours != null ? ` ${t('executive.hrs')}` : ''}
              icon={DollarSign}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4"><Wrench className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-gray-900">{t('executive.disciplinaOperacional')}</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title={t('executive.backlogAge')}
              value={pBacklog.num != null ? pBacklog.num : '—'}
              target={t('executive.lessThanWeeks').replace('{n}', '4')}
              trend="stable"
              status={pBacklog.num != null ? (pBacklog.num < 672 ? 'good' : 'warning') : 'warning'}
              unit={pBacklog.num != null ? ` ${t('executive.hrs')}` : ''}
            />
            <KpiCard
              title={t('executive.isoCompliance')}
              value={pIso.num != null ? pIso.num : '—'}
              target={100}
              trend="stable"
              status={kpiStatus(pIso.num, 100)}
              unit={pIso.num != null ? '%' : ''}
            />
            <KpiCard
              title={t('executive.plannedWork')}
              value={plannedPct != null ? plannedPct : '—'}
              target={65}
              trend="stable"
              status={kpiStatus(plannedPct, 65)}
              unit={plannedPct != null ? '%' : ''}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-gray-900">{t('executive.dotacion')}</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard title={t('executive.totalReports')} value={e.total_reports != null ? e.total_reports : '—'} target="—" trend="stable" status={e.total_reports > 0 ? 'good' : 'warning'} icon={Users} />
            <KpiCard title={t('executive.totalNotifications')} value={e.total_notifications != null ? e.total_notifications : '—'} target="—" trend="stable" status={e.total_notifications > 0 ? 'good' : 'warning'} icon={Users} />
            <KpiCard title={t('executive.criticalAlerts')} value={e.critical_alerts != null ? e.critical_alerts : '—'} target={0} trend="stable" status={e.critical_alerts > 0 ? 'critical' : 'good'} icon={Users} />
          </div>
        </div>
      </div>
    );
  };

  // ── HSE Tab — keep structure, use alerts data ──
  const HSETabContent = () => {
    const critAlerts = alertsData?.total_active || 0;
    // No specific HSE API, show empty states
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title={t('executive.activeAlerts')} value={critAlerts} target={0} trend="stable" status={critAlerts > 0 ? 'critical' : 'good'} icon={Shield} />
          <KpiCard title={t('executive.nearMisses')} value="—" target={5} trend="stable" status="warning" icon={AlertCircle} />
          <KpiCard title={t('executive.daysWithoutIncident')} value="—" target={30} trend="stable" status="warning" icon={CheckCircle} />
          <KpiCard title={t('executive.safetyTrainingCompliance')} value="—" target="95%" trend="stable" status="warning" icon={Shield} />
        </div>
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">{t('executive.hseTrend')}</h4>
          <EmptyChart message={t('executive.hseTrendNoData')} />
        </Card>
      </div>
    );
  };

  // ── Mejora Continua Tab — derive from work requests and analytics ──
  const MejoraContinuaTabContent = () => {
    const recentReports = e.recent_reports || [];
    const recentNotifs = e.recent_notifications || [];
    const failureModes = a.failure_modes_pareto || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title={t('executive.totalWorkRequests')}
            value={workRequests.length}
            target="—"
            trend="stable"
            status={workRequests.length > 0 ? 'good' : 'warning'}
            icon={TrendingUp}
          />
          <KpiCard
            title={t('executive.recentReports')}
            value={recentReports.length}
            target="—"
            trend="stable"
            status={recentReports.length > 0 ? 'good' : 'warning'}
            icon={CheckCircle}
          />
          <KpiCard
            title={t('executive.failureModesIdentified')}
            value={failureModes.length}
            target="—"
            trend="stable"
            status={failureModes.length > 0 ? 'good' : 'warning'}
            icon={AlertCircle}
          />
          <KpiCard
            title={t('executive.fieldCompletion')}
            value={e.field_completion != null ? e.field_completion : '—'}
            target={100}
            trend="stable"
            status={kpiStatus(e.field_completion, 100)}
            unit={e.field_completion != null ? '%' : ''}
            icon={TrendingUp}
          />
        </div>
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">{t('executive.keyImprovementInsights')}</h4>
          {recentNotifs.length > 0 || failureModes.length > 0 ? (
            <div className="space-y-3">
              {failureModes.slice(0, 3).map((fm, idx) => (
                <div key={idx} className={`p-4 ${idx === 0 ? 'bg-red-50 border-l-4 border-red-500' : idx === 1 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-blue-50 border-l-4 border-blue-500'} rounded`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${idx === 0 ? 'text-red-900' : idx === 1 ? 'text-yellow-900' : 'text-blue-900'}`}>
                        {fm.mode || fm.failure_mode || t('executive.failureModeN').replace('{n}', idx + 1)}
                      </p>
                      <p className={`text-sm mt-1 ${idx === 0 ? 'text-red-700' : idx === 1 ? 'text-yellow-700' : 'text-blue-700'}`}>
                        {t('executive.count')}: {fm.count || '—'}
                      </p>
                    </div>
                    <Badge className={`${idx === 0 ? 'bg-red-100 text-red-800' : idx === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {idx === 0 ? t('executive.critical') : idx === 1 ? t('executive.medium') : t('executive.review')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
              {t('executive.noImprovementInsights')}
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <RootCauseInsightsPanel />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200 p-1.5 w-full justify-start rounded-xl gap-1">
          {[
            { value: 'produccion', label: t('executive.tabProduccion'), icon: TrendingUp },
            { value: 'mantenimiento', label: t('executive.tabMantenimiento'), icon: Wrench },
            { value: 'hse', label: t('executive.tabHSE'), icon: Shield },
            { value: 'mejora-continua', label: t('executive.tabMejoraContinua'), icon: CheckCircle },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-600/25 data-[state=active]:scale-[1.02] data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-white/60"
            >
              <tab.icon className="w-4 h-4 mr-2" />{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="produccion"><ProductionTabContent /></TabsContent>
        <TabsContent value="mantenimiento"><MantenimientoTabContent /></TabsContent>
        <TabsContent value="hse"><HSETabContent /></TabsContent>
        <TabsContent value="mejora-continua"><MejoraContinuaTabContent /></TabsContent>
      </Tabs>
    </div>
  );
}
