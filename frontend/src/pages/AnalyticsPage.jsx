import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Loader2, AlertCircle, BarChart3, Filter, X } from 'lucide-react';
import * as api from '../api';
import { filterByDateRange } from '../utils/dateRange';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { selectedPlant, selectedTimeRange, selectedArea, viewMode } = useOutletContext();
  const { t } = useLanguage();
  const plantId = selectedPlant?.plant_id || selectedPlant || 'OCP-JFC1';
  const [activeTab, setActiveTab] = useState('operational');
  const [selectedAreas, setSelectedAreas] = useState(new Set(AREA_NAMES)); // all selected by default

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API data state
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
        const [pageData, healthData, wrs] = await Promise.all([
          api.getAnalyticsPageData(plantId),
          api.getAssetHealth({ plant_id: plantId }).catch(() => ({ count: 0, assets: [] })),
          api.listWorkRequests({ plant_id: plantId }).catch(() => []),
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

  // ── Area toggle helpers ──
  const toggleArea = (area) => {
    setSelectedAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area); else next.add(area);
      return next;
    });
  };
  const allAreasSelected = selectedAreas.size === AREA_NAMES.length;
  const clearAreaFilters = () => setSelectedAreas(new Set(AREA_NAMES));

  // ── Derived data from WRs ──
  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  // Area-filtered WRs for discipline tab
  const areaFilteredWRs = useMemo(() => {
    if (allAreasSelected) return filteredWRs;
    return filteredWRs.filter(wr => {
      const tag = (wr.equipment_tag || wr.equipment_id || '').toUpperCase();
      if (!tag) return true; // include WRs without equipment tag
      return [...selectedAreas].some(area =>
        AREA_PREFIXES[area]?.some(prefix => tag.startsWith(prefix))
      );
    });
  }, [filteredWRs, selectedAreas, allAreasSelected]);

  // Count WRs per area (for badge counts)
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

  // WR-based discipline KPIs (using real available data)
  const disciplineKpis = useMemo(() => {
    const total = areaFilteredWRs.length;
    if (total === 0) return { pendingPct: 0, unassignedPct: 0, validatedPct: 0, draftPct: 0 };

    const pending = areaFilteredWRs.filter(wr =>
      ['PENDING_VALIDATION', 'PENDING'].includes((wr.status || '').toUpperCase())
    ).length;
    const draft = areaFilteredWRs.filter(wr =>
      (wr.status || '').toUpperCase() === 'DRAFT'
    ).length;
    const validated = areaFilteredWRs.filter(wr =>
      ['VALIDATED', 'APPROVED', 'COMPLETED', 'CLOSED'].includes((wr.status || '').toUpperCase())
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

  // Build availability/adherence trend from kpi_history
  const trendData = useMemo(() => {
    if (kpiHistory.length === 0) return [];
    return kpiHistory.map(item => ({
      month: item.month || item.period || '',
      adherence: item.schedule_adherence || 0,
      oee: item.oee_avg || 0,
      target: 95,
    }));
  }, [kpiHistory]);

  // Pareto data
  const paretoData = useMemo(() => {
    if (workOrdersByType.length === 0) return [];
    return workOrdersByType.map((item, i, arr) => ({
      category: item.type || `Type ${i + 1}`,
      value: item.count || 0,
      hours: item.hours || 0,
    }));
  }, [workOrdersByType]);

  // Cost by area
  const delayCausesData = useMemo(() => {
    if (costByArea.length === 0) return [];
    return costByArea.map(item => ({
      cause: item.area || item.name || 'Unknown',
      percentage: item.cost || item.percentage || item.value || 0,
    }));
  }, [costByArea]);

  // Asset health score
  const healthScore = assetHealth.count > 0 && assetHealth.assets[0]?.health_score
    ? assetHealth.assets[0].health_score
    : null;
  const healthAssetName = assetHealth.count > 0 && assetHealth.assets[0]?.equipment_name
    ? assetHealth.assets[0].equipment_name
    : t('analyticsPage.noAssetSelected');

  // Gauge needle angle (0% = -90deg left, 100% = 90deg right)
  const needleAngle = healthScore != null ? -90 + (healthScore / 100) * 180 : 0;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = 140 + 80 * Math.cos(needleRad - Math.PI / 2);
  const needleY = 140 + 80 * Math.sin(needleRad - Math.PI / 2);

  // Reliability equipment
  const reliabilityAsset = reliabilityKpis.length > 0 ? reliabilityKpis[0] : null;

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
    <div className="p-6 space-y-6 bg-gray-50">
      {/* ═══ EXECUTIVE VIEW: KPIs + Condition Monitoring + Charts ═══ */}
      {viewMode !== 'tactical' && (<>

      {/* TOP KPI ROW */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: t('analyticsPage.availability'), value: kpis.availability, badge: t('analyticsPage.availability'), badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
          { label: t('analyticsPage.mtbf'), value: kpis.mtbf, badge: t('analyticsPage.reliability'), badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
          { label: t('analyticsPage.mttr'), value: kpis.mttr, badge: kpis.mttr !== '\u2014' ? t('analyticsPage.alert') : t('analyticsPage.noDataBadge'), badgeCls: kpis.mttr !== '\u2014' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800 border-gray-300' },
          { label: t('analyticsPage.oee'), value: kpis.oee, badge: kpis.oee !== '\u2014' ? t('analyticsPage.performance') : t('analyticsPage.noDataBadge'), badgeCls: kpis.oee !== '\u2014' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-6 bg-white">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
                <Badge className={`${kpi.badgeCls} text-xs`}>{kpi.badge}</Badge>
              </div>
              <p className="text-5xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* CONDITION MONITORING & ASSET VITAL SIGNS */}
      <h2 className="text-xl font-bold text-gray-900">
        {t('analyticsPage.conditionMonitoringTitle')}
        <span className="text-sm font-normal text-gray-500 ml-3">
          {reliabilityAsset ? reliabilityAsset.equipment_name : t('analyticsPage.allAssets')} — {t('analyticsPage.wrsCount', { count: filteredWRs.length, range: selectedTimeRange })}
        </span>
      </h2>

      <div className="grid grid-cols-12 gap-6">
        {/* Availability & OEE Trend */}
        <div className="col-span-7">
          <Card className="p-6 bg-white h-full">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {t('analyticsPage.scheduleAdherenceOeeTrend')}
            </h3>
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BarChart3 className="w-10 h-10 mb-2" />
                <p className="text-sm">{t('analyticsPage.noHistoricalKpi')}</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
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
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded"></div><span className="text-gray-600">{t('analyticsPage.scheduleAdherencePct')}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded"></div><span className="text-gray-600">{t('analyticsPage.oeePct')}</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-red-400"></div><span className="text-gray-600">{t('analyticsPage.target95')}</span></div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* KPIs de Reliability */}
        <div className="col-span-5">
          <Card className="p-6 bg-white h-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              KPIs de Reliability
            </h3>
            <p className="text-xs text-gray-500 mb-4">{healthAssetName}</p>

            {reliabilityAsset && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{t('analyticsPage.mtbf')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reliabilityAsset.mtbf}h</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{t('analyticsPage.mttr')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reliabilityAsset.mttr}h</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{t('analyticsPage.availAbbr')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reliabilityAsset.availability}%</p>
                  </div>
                </div>
                {reliabilityAsset.oee != null && (
                  <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">OEE</p>
                    <p className="text-2xl font-bold text-emerald-700">{reliabilityAsset.oee}%</p>
                  </div>
                )}
              </div>
            )}
            {!reliabilityAsset && (
              <p className="text-center text-sm text-gray-400">{t('analyticsPage.noReliabilityData')}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Work Orders + Cost */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <Card className="p-6 bg-white">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('analyticsPage.workOrdersByType')}</h3>
            {paretoData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <BarChart3 className="w-10 h-10 mb-2" />
                <p className="text-sm">{t('analyticsPage.noWorkOrderData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
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
                        <TableRow key={i} className="hover:bg-gray-50">
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
        <div className="col-span-5">
          <Card className="p-6 bg-white h-full">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('analyticsPage.costByArea')}</h3>
            {delayCausesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <BarChart3 className="w-10 h-10 mb-2" />
                <p className="text-sm">{t('analyticsPage.noCostData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={delayCausesData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="cause" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      </>)}

      {/* ═══ TACTICAL VIEW: Operational Discipline + Detailed Analysis ═══ */}
      {viewMode === 'tactical' && (<>

      {/* OPERATIONAL DISCIPLINE SECTION */}
      <div className="pt-8 border-t-4 border-emerald-600">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={activeTab === 'results' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('results')}
            className={activeTab === 'results' ? 'bg-emerald-600 text-white' : 'text-gray-600'}
          >
            {t('analyticsPage.tabResultsKpis')}
          </Button>
          <Button
            variant={activeTab === 'operational' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('operational')}
            className={activeTab === 'operational' ? 'bg-emerald-600 text-white' : 'text-gray-600'}
          >
            {t('analyticsPage.tabOperationalKpis')}
          </Button>
        </div>

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">{t('analyticsPage.resultsKpisTitle')}</h2>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: t('analyticsPage.availability'), value: kpis.availability, sub: t('analyticsPage.vsTarget95'), icon: TrendingUp, color: 'border-emerald-500' },
                { label: t('analyticsPage.mtbf'), value: kpis.mtbf, sub: t('analyticsPage.meanTimeBetweenFailures'), icon: TrendingUp, color: '' },
                { label: t('analyticsPage.mttr'), value: kpis.mttr, sub: t('analyticsPage.meanTimeToRepair'), icon: TrendingUp, color: '' },
                { label: t('analyticsPage.oee'), value: kpis.oee, sub: t('analyticsPage.overallEquipmentEffectiveness'), icon: null, color: '' },
              ].map(kpi => (
                <Card key={kpi.label} className={`p-6 bg-white ${kpi.color ? `border-t-4 ${kpi.color}` : ''}`}>
                  <p className="text-sm text-gray-600 mb-2">{kpi.label}</p>
                  <p className="text-5xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm">
                    {kpi.icon && <kpi.icon className="w-4 h-4" />}
                    <span>{kpi.sub}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trend Chart */}
            <Card className="p-6 bg-white">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {t('analyticsPage.scheduleAdherenceOeeTrendRange', { range: selectedTimeRange })}
              </h3>
              {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <BarChart3 className="w-10 h-10 mb-2" />
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

        {/* ── Operational Discipline Tab ── */}
        {activeTab === 'operational' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('analyticsPage.operationalDiscipline')}
              <span className="text-sm font-normal text-gray-500 ml-3">{t('analyticsPage.wrsAnalyzed', { count: areaFilteredWRs.length, range: selectedTimeRange })}</span>
            </h2>

            {/* Advanced Filters — Process Area */}
            <Card className="p-4 bg-white">
              <div className="flex flex-row items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{t('analyticsPage.filterByProcessArea')}</span>
                {AREA_NAMES.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                      selectedAreas.has(area)
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}
                  >
                    {t(AREA_I18N_KEYS[area])} ({wrCountByArea[area] || 0})
                  </button>
                ))}
                {!allAreasSelected && (
                  <button onClick={clearAreaFilters} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>

            {/* Discipline KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
              <Card className="p-4 bg-white border-t-4 border-amber-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{t('analyticsPage.pendingNotices')}</p>
                  <span className={`text-xs font-medium ${Number(disciplineKpis.pendingPct) > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{disciplineKpis.pendingPct}%</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{disciplineKpis.pendingPct}%</p>
                <p className="text-xs text-gray-500 mt-2">{t('analyticsPage.wrsPendingValidation')}</p>
              </Card>

              <Card className="p-4 bg-white border-t-4 border-red-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{t('analyticsPage.unassigned')}</p>
                  <span className={`text-xs font-medium ${Number(disciplineKpis.unassignedPct) > 20 ? 'text-red-600' : 'text-emerald-600'}`}>{disciplineKpis.unassignedPct}%</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{disciplineKpis.unassignedPct}%</p>
                <p className="text-xs text-gray-500 mt-2">{t('analyticsPage.wrsNoTechnician')}</p>
              </Card>

              <Card className="p-4 bg-white border-t-4 border-emerald-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{t('analyticsPage.programCompliance')}</p>
                  {trendData.length > 0 && (
                    <span className="text-xs font-medium text-emerald-600">{trendData[trendData.length - 1]?.adherence?.toFixed(1)}%</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {trendData.length > 0 ? `${trendData[trendData.length - 1].adherence.toFixed(1)}%` : '\u2014'}
                </p>
                <p className="text-xs text-gray-500 mt-2">{t('analyticsPage.scheduleAdherence')}</p>
              </Card>

              <Card className="p-4 bg-white border-t-4 border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{t('analyticsPage.averageOee')}</p>
                  {trendData.length > 0 && (
                    <span className="text-xs font-medium text-emerald-600">{trendData[trendData.length - 1]?.oee?.toFixed(1)}%</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {trendData.length > 0 ? `${trendData[trendData.length - 1].oee.toFixed(1)}%` : '\u2014'}
                </p>
                <p className="text-xs text-gray-500 mt-2">{t('analyticsPage.overallEquipmentEffectiveness')}</p>
              </Card>
            </div>

            {/* Trend + Pareto */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 bg-white">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('analyticsPage.adherenceOeeTrend')}</h3>
                {trendData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <BarChart3 className="w-8 h-8 mb-1" /><p className="text-xs">{t('analyticsPage.noTrendData')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
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

              <Card className="p-6 bg-white">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('analyticsPage.workOrdersByTypePareto')}</h3>
                {paretoData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <BarChart3 className="w-8 h-8 mb-1" /><p className="text-xs">{t('analyticsPage.noData')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paretoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" name={t('analyticsPage.colCount')} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* WR Breakdown summary */}
            <Card className="p-6 bg-white">
              <h3 className="text-base font-semibold text-gray-900 mb-4">{t('analyticsPage.wrStatusBreakdown', { range: selectedTimeRange })}</h3>
              {areaFilteredWRs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">{t('analyticsPage.noWrsInPeriod')}</p>
              ) : (
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(
                    areaFilteredWRs.reduce((acc, wr) => {
                      const s = (wr.status || 'UNKNOWN').toUpperCase();
                      acc[s] = (acc[s] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                    <div key={status} className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-600 mt-1">{status.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      </>)}
    </div>
  );
}
