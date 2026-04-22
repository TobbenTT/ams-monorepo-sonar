import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Loader2, AlertCircle, BarChart3, Filter, X, Activity, Gauge, Clock, Wrench, CheckCircle2, AlertTriangle, Target, Zap } from 'lucide-react';
import * as api from '../api';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';
import OpsKpiDashboard from '../components/analytics/OpsKpiDashboard';

const AREA_PREFIXES = {
  Crushing:   ['CVY','CRU','STK','SCR','FDR','GYR','JAW'],
  Grinding:   ['BRY','SAG','BAL','MIL','CLS','HYD','CYC'],
  Flotation:  ['FLT','CND','CLN','RGH','COL','AIR'],
  Thickening: ['SED','THK','TAI','SPG','DAM'],
  Tailings:   ['SEQ','DRY','PMP','FIL'],
};
const AREA_NAMES = Object.keys(AREA_PREFIXES);

const AREA_I18N_KEYS = {
  Crushing: 'analyticsPage.areaCrushing',
  Grinding: 'analyticsPage.areaGrinding',
  Flotation: 'analyticsPage.areaFlotation',
  Thickening: 'analyticsPage.areaThickening',
  Tailings: 'analyticsPage.areaTailings',
};

export default function AnalyticsPage() {
  const ctx = useOutletContext();
  const { t } = useLanguage();
  const plantId = ctx?.selectedPlant?.plant_id || ctx?.selectedPlant || ctx?.plant || 'OCP-JFC1';
  const selectedTimeRange = ctx?.selectedTimeRange || 'Last 30 Days';
  const [activeTab, setActiveTab] = useState('operational');
  const [selectedAreas, setSelectedAreas] = useState(new Set(AREA_NAMES));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState({ mtbf: '\u2014', mttr: '\u2014', availability: '\u2014', oee: '\u2014' });
  const [kpiHistory, setKpiHistory] = useState([]);
  const [workOrdersByType, setWorkOrdersByType] = useState([]);
  const [costByArea, setCostByArea] = useState([]);
  const [reliabilityKpis, setReliabilityKpis] = useState([]);
  const [assetHealth, setAssetHealth] = useState({ count: 0, assets: [] });
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
        const [pageData, healthData, wrs] = await Promise.all([
          timeout(api.getAnalyticsPageData(plantId), 8000).catch(() => ({ kpis: {}, kpi_history: [], work_orders_by_type: [], cost_by_area: [], reliability_kpis: [] })),
          timeout(api.getAssetHealth({ plant_id: plantId }), 8000).catch(() => ({ count: 0, assets: [] })),
          timeout(api.listWorkRequests({ plant_id: plantId, limit: 50 }), 8000).catch(() => []),
        ]);
        if (!cancelled) {
          setKpis(pageData.kpis || { mtbf: '\u2014', mttr: '\u2014', availability: '\u2014', oee: '\u2014' });
          setKpiHistory(pageData.kpi_history || []);
          setWorkOrdersByType(pageData.work_orders_by_type || []);
          setCostByArea(pageData.cost_by_area || []);
          setReliabilityKpis(pageData.reliability_kpis || []);
          setAssetHealth(healthData || { count: 0, assets: [] });
          const wrArr = Array.isArray(wrs) ? wrs : (wrs?.items || wrs?.requests || []);
          setWorkRequests(wrArr);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || t('analyticsPage.failedToLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [plantId]);

  const toggleArea = (area) => {
    setSelectedAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area); else next.add(area);
      return next;
    });
  };
  const allAreasSelected = selectedAreas.size === AREA_NAMES.length;
  const clearAreaFilters = () => setSelectedAreas(new Set(AREA_NAMES));

  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  const areaFilteredWRs = useMemo(() => {
    if (allAreasSelected) return filteredWRs;
    return filteredWRs.filter(wr => {
      const tag = (wr.equipment_tag || wr.equipment_id || '').toUpperCase();
      if (!tag) return true;
      return [...selectedAreas].some(area =>
        AREA_PREFIXES[area]?.some(prefix => tag.startsWith(prefix))
      );
    });
  }, [filteredWRs, selectedAreas, allAreasSelected]);

  const wrCountByArea = useMemo(() => {
    const counts = {};
    AREA_NAMES.forEach(area => { counts[area] = 0; });
    filteredWRs.forEach(wr => {
      const tag = (wr.equipment_tag || wr.equipment_id || '').toUpperCase();
      if (!tag) return;
      for (const area of AREA_NAMES) {
        if (AREA_PREFIXES[area].some(prefix => tag.startsWith(prefix))) {
          counts[area]++;
          break;
        }
      }
    });
    return counts;
  }, [filteredWRs]);

  const disciplineKpis = useMemo(() => {
    const total = areaFilteredWRs.length;
    if (total === 0) return { pendingPct: 0, unassignedPct: 0, validatedPct: 0, draftPct: 0 };
    const pending = areaFilteredWRs.filter(wr =>
      ['PENDING_VALIDATION', 'PENDING', 'PENDIENTE'].includes((wr.status || '').toUpperCase())
    ).length;
    const draft = areaFilteredWRs.filter(wr =>
      (wr.status || '').toUpperCase() === 'DRAFT'
    ).length;
    const validated = areaFilteredWRs.filter(wr =>
      ['VALIDATED', 'APPROVED', 'APROBADO', 'COMPLETED', 'CLOSED', 'CERRADO'].includes((wr.status || '').toUpperCase())
    ).length;
    const unassigned = areaFilteredWRs.filter(wr =>
      !(wr.assigned_to || wr.assigned_to_name)
    ).length;
    return {
      pendingPct: ((pending / total) * 100).toFixed(1),
      draftPct: ((draft / total) * 100).toFixed(1),
      validatedPct: ((validated / total) * 100).toFixed(1),
      unassignedPct: ((unassigned / total) * 100).toFixed(1),
    };
  }, [areaFilteredWRs]);

  const trendData = useMemo(() => {
    if (kpiHistory.length === 0) return [];
    return kpiHistory.map(item => ({
      month: item.month || item.period || '',
      adherence: item.schedule_adherence || 0,
      oee: item.oee_avg || 0,
      target: 95,
    }));
  }, [kpiHistory]);

  const paretoData = useMemo(() => {
    if (workOrdersByType.length === 0) return [];
    return workOrdersByType.map((item, i) => ({
      category: item.type || `Type ${i + 1}`,
      value: item.count || 0,
      hours: item.hours || 0,
    }));
  }, [workOrdersByType]);

  const delayCausesData = useMemo(() => {
    if (costByArea.length === 0) return [];
    return costByArea.map(item => ({
      cause: item.area || item.name || 'Unknown',
      percentage: item.cost || item.percentage || item.value || 0,
    }));
  }, [costByArea]);

  const reliabilityAsset = reliabilityKpis.length > 0 ? reliabilityKpis[0] : null;
  const healthAssetName = assetHealth.count > 0 && assetHealth.assets[0]?.equipment_name
    ? assetHealth.assets[0].equipment_name
    : t('analyticsPage.noAssetSelected');

  const getCriticalityColor = (c) => {
    if (c === 'High') return 'bg-red-100 text-red-800 border-red-300';
    if (c === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };
  const getCriticalityLabel = (c) => {
    if (c === 'High') return t('analyticsPage.critHigh');
    if (c === 'Medium') return t('analyticsPage.critMedium');
    return t('analyticsPage.critLow');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">{t('analyticsPage.loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>{t('analyticsPage.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Real SQL KPI dashboard — MTBF, MTTR, PM compliance, backlog aging, cost */}
      <OpsKpiDashboard plantId={plantId} />

      {/* ═══ EXECUTIVE VIEW ═══ */}
      {viewMode !== 'tactical' && (<>

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="w-7 h-7" />
              Executive Analytics
            </h1>
            <p className="text-emerald-100 text-sm mt-1">Performance overview and reliability metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-emerald-200 text-xs">Plant</span>
              <div className="font-semibold">{plantId}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-emerald-200 text-xs">Period</span>
              <div className="font-semibold">{selectedTimeRange}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('analyticsPage.availability'), value: kpis.availability, icon: Gauge, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
          { label: t('analyticsPage.mtbf'), value: kpis.mtbf, icon: Clock, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
          { label: t('analyticsPage.mttr'), value: kpis.mttr, icon: Wrench, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
          { label: t('analyticsPage.oee'), value: kpis.oee, icon: Zap, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div key={kpi.label} className={`${kpi.bg} border rounded-xl p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                <KIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONDITION MONITORING */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-foreground">
          {t('analyticsPage.conditionMonitoringTitle')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {reliabilityAsset ? reliabilityAsset.equipment_name : t('analyticsPage.allAssets')} — {t('analyticsPage.wrsCount', { count: filteredWRs.length, range: selectedTimeRange })}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Adherence & OEE Trend */}
        <div className="lg:col-span-7">
          <Card className="p-5 h-full">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t('analyticsPage.scheduleAdherenceOeeTrend')}
            </h3>
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">{t('analyticsPage.noHistoricalKpi')}</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" name={t('analyticsPage.target95')} dot={false} />
                    <Line type="monotone" dataKey="adherence" stroke="#10b981" strokeWidth={2} name={t('analyticsPage.scheduleAdherencePct')} dot={{ fill: '#10b981', r: 3 }} />
                    <Line type="monotone" dataKey="oee" stroke="#8b5cf6" strokeWidth={2} name={t('analyticsPage.oeePct')} dot={{ fill: '#8b5cf6', r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-muted-foreground">{t('analyticsPage.scheduleAdherencePct')}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-muted-foreground">{t('analyticsPage.oeePct')}</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-red-400"></div><span className="text-muted-foreground">{t('analyticsPage.target95')}</span></div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Reliability KPIs */}
        <div className="lg:col-span-5">
          <Card className="p-5 h-full">
            <h3 className="text-sm font-semibold text-foreground mb-1">KPIs de Reliability</h3>
            <p className="text-xs text-muted-foreground mb-4">{healthAssetName}</p>
            {reliabilityAsset ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: t('analyticsPage.mtbf'), value: `${reliabilityAsset.mtbf}h`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: t('analyticsPage.mttr'), value: `${reliabilityAsset.mttr}h`, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: t('analyticsPage.availAbbr'), value: `${reliabilityAsset.availability}%`, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  ].map(m => (
                    <div key={m.label} className={`p-4 rounded-xl border ${m.color}`}>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-2xl font-bold">{m.value}</p>
                    </div>
                  ))}
                </div>
                {reliabilityAsset.oee != null && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground">OEE</p>
                    <p className="text-2xl font-bold text-emerald-700">{reliabilityAsset.oee}%</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">{t('analyticsPage.noReliabilityData')}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Work Orders + Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('analyticsPage.workOrdersByType')}</h3>
            {paretoData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">{t('analyticsPage.noWorkOrderData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-xs">{t('analyticsPage.colType')}</TableHead>
                      <TableHead className="font-semibold text-xs">{t('analyticsPage.colCount')}</TableHead>
                      <TableHead className="font-semibold text-xs">{t('analyticsPage.colHours')}</TableHead>
                      <TableHead className="font-semibold text-xs">{t('analyticsPage.colCriticality')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paretoData.map((order, i) => {
                      const crit = order.hours > 40 ? 'High' : order.hours > 20 ? 'Medium' : 'Low';
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{order.category}</TableCell>
                          <TableCell className="text-xs">{order.value}</TableCell>
                          <TableCell className="text-xs font-semibold text-orange-600">{order.hours}</TableCell>
                          <TableCell><Badge className={getCriticalityColor(crit) + ' text-xs'}>{getCriticalityLabel(crit)}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="p-5 h-full">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('analyticsPage.costByArea')}</h3>
            {delayCausesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">{t('analyticsPage.noCostData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={delayCausesData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="cause" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      </>)}

      {/* ═══ TACTICAL VIEW ═══ */}
      {viewMode === 'tactical' && (<>

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Target className="w-7 h-7" />
              Tactical Operations Analytics
            </h1>
            <p className="text-indigo-100 text-sm mt-1">Operational discipline and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-indigo-200 text-xs">Plant</span>
              <div className="font-semibold">{plantId}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-indigo-200 text-xs">WRs</span>
              <div className="font-semibold">{areaFilteredWRs.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'results'
              ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('analyticsPage.tabResultsKpis')}
        </button>
        <button
          onClick={() => setActiveTab('operational')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'operational'
              ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('analyticsPage.tabOperationalKpis')}
        </button>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('analyticsPage.availability'), value: kpis.availability, sub: t('analyticsPage.vsTarget95'), icon: Gauge, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
              { label: t('analyticsPage.mtbf'), value: kpis.mtbf, sub: t('analyticsPage.meanTimeBetweenFailures'), icon: Clock, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
              { label: t('analyticsPage.mttr'), value: kpis.mttr, sub: t('analyticsPage.meanTimeToRepair'), icon: Wrench, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
              { label: t('analyticsPage.oee'), value: kpis.oee, sub: t('analyticsPage.overallEquipmentEffectiveness'), icon: Zap, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
            ].map(kpi => {
              const KIcon = kpi.icon;
              return (
                <div key={kpi.label} className={`${kpi.bg} border rounded-xl p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                      <KIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${kpi.textColor} mb-1`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t('analyticsPage.scheduleAdherenceOeeTrendRange', { range: selectedTimeRange })}
            </h3>
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">{t('analyticsPage.noHistoricalKpi')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" name={t('analyticsPage.target95')} dot={false} />
                  <Line type="monotone" dataKey="adherence" stroke="#10b981" strokeWidth={3} name={t('analyticsPage.scheduleAdherencePct')} dot={{ fill: '#10b981', r: 4 }} />
                  <Line type="monotone" dataKey="oee" stroke="#8b5cf6" strokeWidth={3} name={t('analyticsPage.oeePct')} dot={{ fill: '#8b5cf6', r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      {/* Operational Discipline Tab */}
      {activeTab === 'operational' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">{t('analyticsPage.operationalDiscipline')}</h2>
            <span className="text-sm text-muted-foreground">{t('analyticsPage.wrsAnalyzed', { count: areaFilteredWRs.length, range: selectedTimeRange })}</span>
          </div>

          {/* Area Filters */}
          <Card className="p-4">
            <div className="flex flex-row items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">{t('analyticsPage.filterByProcessArea')}</span>
              {AREA_NAMES.map(area => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedAreas.has(area)
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {t(AREA_I18N_KEYS[area])} ({wrCountByArea[area] || 0})
                </button>
              ))}
              {!allAreasSelected && (
                <button onClick={clearAreaFilters} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>

          {/* Discipline KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('analyticsPage.pendingNotices'), value: `${disciplineKpis.pendingPct}%`, sub: t('analyticsPage.wrsPendingValidation'), icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', gradient: 'from-amber-500 to-amber-600' },
              { label: t('analyticsPage.unassigned'), value: `${disciplineKpis.unassignedPct}%`, sub: t('analyticsPage.wrsNoTechnician'), icon: AlertCircle, bg: 'bg-red-50 border-red-200', textColor: 'text-red-700', gradient: 'from-red-500 to-red-600' },
              { label: t('analyticsPage.programCompliance'), value: trendData.length > 0 ? `${trendData[trendData.length - 1].adherence.toFixed(1)}%` : '\u2014', sub: t('analyticsPage.scheduleAdherence'), icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
              { label: t('analyticsPage.averageOee'), value: trendData.length > 0 ? `${trendData[trendData.length - 1].oee.toFixed(1)}%` : '\u2014', sub: t('analyticsPage.overallEquipmentEffectiveness'), icon: Zap, bg: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', gradient: 'from-blue-500 to-blue-600' },
            ].map(kpi => {
              const KIcon = kpi.icon;
              return (
                <div key={kpi.label} className={`${kpi.bg} border rounded-xl p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                        <KIcon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Trend + Pareto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('analyticsPage.adherenceOeeTrend')}</h3>
              {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mb-1 opacity-40" /><p className="text-xs">{t('analyticsPage.noTrendData')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="adherence" stroke="#10b981" strokeWidth={2} dot={false} name={t('analyticsPage.adherencePct')} />
                    <Line type="monotone" dataKey="oee" stroke="#8b5cf6" strokeWidth={2} dot={false} name={t('analyticsPage.oeePct')} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('analyticsPage.workOrdersByTypePareto')}</h3>
              {paretoData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mb-1 opacity-40" /><p className="text-xs">{t('analyticsPage.noData')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={paretoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name={t('analyticsPage.colCount')} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* WR Status Breakdown */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('analyticsPage.wrStatusBreakdown', { range: selectedTimeRange })}</h3>
            {areaFilteredWRs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('analyticsPage.noWrsInPeriod')}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(
                  areaFilteredWRs.reduce((acc, wr) => {
                    const s = (wr.status || 'UNKNOWN').toUpperCase();
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                  const statusColors = {
                    'PENDIENTE': 'bg-amber-50 border-amber-200 text-amber-700',
                    'PENDING': 'bg-amber-50 border-amber-200 text-amber-700',
                    'APROBADO': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    'APPROVED': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    'VALIDATED': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    'RECHAZADO': 'bg-red-50 border-red-200 text-red-700',
                    'CANCELADO': 'bg-red-50 border-red-200 text-red-700',
                    'ELIMINADO': 'bg-gray-50 border-gray-200 text-gray-700',
                    'COMPLETED': 'bg-blue-50 border-blue-200 text-blue-700',
                    'CLOSED': 'bg-blue-50 border-blue-200 text-blue-700',
                  };
                  const color = statusColors[status] || 'bg-muted border-border text-foreground';
                  return (
                    <div key={status} className={`p-4 rounded-xl border text-center ${color}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs font-medium mt-1">{status.replace(/_/g, ' ')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      </>)}
    </div>
  );
}
