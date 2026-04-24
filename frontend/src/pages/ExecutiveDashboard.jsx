import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, X, Activity, Wrench, Clock, BarChart3, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { criticalityColor, statusColor } from '../data/mockData';
import { LoadingSpinner } from '../components/Shared';
import PM02CalendarPreview from '../components/PM02CalendarPreview';
import AdherenceCompliancePanel from '../components/AdherenceCompliancePanel';
import * as api from '../api';

function isMet(kpi) {
  if (kpi.lowerBetter) return kpi.current <= kpi.target;
  return kpi.current >= kpi.target;
}

function progressPct(kpi) {
  if (kpi.lowerBetter) {
    if (kpi.current <= kpi.target) return 100;
    const worst = kpi.target * 2.5;
    return Math.max(0, Math.round(((worst - kpi.current) / (worst - kpi.target)) * 100));
  }
  if (kpi.current >= kpi.target) return 100;
  return Math.round((kpi.current / kpi.target) * 100);
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function KPICard({ kpi }) {
  const met = isMet(kpi);
  const pct = progressPct(kpi);
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${met ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'}`}>
          {met ? 'OK' : 'NOK'}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{kpi.current}</span>
        <span className="text-sm text-muted-foreground mb-0.5">{kpi.unit}</span>
        <TrendIcon trend={kpi.trend} />
      </div>
      <div className="text-xs text-muted-foreground">{kpi.targetLabel}: <span className="font-semibold text-foreground">{kpi.target} {kpi.unit}</span></div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${met ? 'bg-green-400' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function trendBadge(trend, t) {
  if (trend === 'IMPROVING') return <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">{t('executive.improving')}</span>;
  if (trend === 'WORSENING') return <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">{t('executive.worsening')}</span>;
  return <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-semibold">{t('executive.stable')}</span>;
}

/* ───── Equipment Report Modal ───── */
function EquipmentReportModal({ equipment, t, onClose, reliabilityKpis = [] }) {
  const rel = reliabilityKpis.find(r => r.equipment_tag === equipment.tag);

  const woStats = { PM01: 0, PM02: 0, PM03: 0, total: 0 };

  const pieData = [
    { name: 'PM-01', value: woStats.PM01 || 1, color: '#ef4444' },
    { name: 'PM-02', value: woStats.PM02 || 2, color: '#3b82f6' },
    { name: 'PM-03', value: woStats.PM03 || 1, color: '#f59e0b' },
  ];

  // Health Score eliminado por decisión de Jorge (QUOTE 43/55: "eso lo eliminaría")

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-[#1B5E20]/10 to-transparent rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-muted-foreground">{equipment.tag}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${criticalityColor(equipment.criticality)}`}>{equipment.criticality}</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">{equipment.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Reliability KPIs */}
          <div>
            <h4 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={14} /> {t('executive.reliabilityKPIs')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="MTBF" value={rel ? `${rel.mtbf}h` : '—'} desc={t('executive.meanTimeBetweenFailures')} />
              <MetricCard label="MTTR" value={rel ? `${rel.mttr}h` : '—'} desc={t('executive.meanTimeToRepair')} />
              <MetricCard label={t('executive.availability')} value={rel ? `${rel.availability}%` : '—'} desc={t('executive.operationalAvailability')} />
              <MetricCard label="OEE" value={rel ? `${rel.oee}%` : '—'} desc={t('executive.overallEquipmentEff')} />
            </div>
          </div>

          {/* Weibull if available */}
          {rel?.weibull_beta != null && (
            <div>
              <h4 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity size={14} /> {t('executive.weibullParams')}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Beta (β)" value={rel.weibull_beta?.toFixed?.(1) ?? '—'} desc={t('executive.shapeParam')} />
                <MetricCard label="Eta (η)" value={rel.weibull_eta ? `${rel.weibull_eta}h` : '—'} desc={t('executive.scaleParam')} />
                <MetricCard label={t('executive.failuresYTD')} value={rel.failures_ytd ?? '—'} desc={t('executive.yearToDate')} />
              </div>
            </div>
          )}

          {/* Planning KPIs */}
          <div>
            <h4 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench size={14} /> {t('executive.planningKPIs')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('executive.orderTypeBreakdown')}</div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} ${t('executive.orders')}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 text-xs mt-1">
                  {pieData.map(d => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <MetricCard label={t('executive.totalWOs')} value={woStats.total || 4} desc={t('executive.inScheduledPeriod')} />
                <MetricCard label={t('executive.corrVsPrev')} value={`${Math.round(((woStats.PM01 + woStats.PM03) / Math.max(woStats.total, 1)) * 100)}% / ${Math.round((woStats.PM02 / Math.max(woStats.total, 1)) * 100)}%`} desc={t('executive.corrVsPrevDesc')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, desc }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-[0.65rem] text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-foreground mt-0.5">{value}</div>
      {desc && <div className="text-[0.6rem] text-muted-foreground mt-0.5">{desc}</div>}
    </div>
  );
}

/* ───── Main ───── */
export default function ExecutiveDashboard() {
  const { t } = useLanguage();
  const { plant } = useOutletContext();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiHistory, setKpiHistory] = useState([]);
  const [reliabilityKpis, setReliabilityKpis] = useState([]);
  const [costByArea, setCostByArea] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [apiKpis, setApiKpis] = useState(null);
  // Jorge Tanda 4: modal calendario PM02 preview anual
  const [showPm02Calendar, setShowPm02Calendar] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getAnalyticsPageData(plant).then(data => {
      setApiKpis(data.kpis);
      setKpiHistory(data.kpi_history || []);
      setReliabilityKpis(data.reliability_kpis || []);
      setCostByArea(data.cost_by_area || []);
      setEquipmentList((data.reliability_kpis || []).map(eq => ({
        tag: eq.equipment_tag, name: eq.equipment_name,
        criticality: 'AA', status: 'RUNNING',
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [plant]);

  const parseNum = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

  const KPI_TARGETS = useMemo(() => {
    const avail = apiKpis ? parseNum(apiKpis.availability) : 0;
    const oee = apiKpis ? parseNum(apiKpis.oee) : 0;
    const mtbf = apiKpis ? parseNum(apiKpis.mtbf) : 0;
    const lastHist = kpiHistory.length > 0 ? kpiHistory[kpiHistory.length - 1] : {};
    return [
      { label: t('executive.scheduleAdherence'), key: 'schedule_adherence', current: lastHist.schedule_adherence || avail, target: 90, trend: 'up', lowerBetter: false, unit: '%', targetLabel: t('executive.target') },
      { label: t('executive.avgOEE'), key: 'oee_avg', current: oee, target: 85, trend: 'up', lowerBetter: false, unit: '%', targetLabel: t('executive.target') },
      { label: t('executive.planningTime'), key: 'planning_time_avg', current: lastHist.planning_time_avg || 78, target: 90, trend: 'down', lowerBetter: true, unit: 'min', targetLabel: t('executive.target') },
      { label: t('executive.mtbfSagMill'), key: 'mtbf_sag', current: mtbf, target: 700, trend: 'up', lowerBetter: false, unit: 'h', targetLabel: t('executive.target') },
      { label: t('executive.fleetAvailability'), key: 'availability', current: avail, target: 97, trend: 'up', lowerBetter: false, unit: '%', targetLabel: t('executive.target') },
    ];
  }, [t, apiKpis, kpiHistory]);

  const radarData = useMemo(() => {
    const avail = apiKpis ? parseNum(apiKpis.availability) : 0;
    const oee = apiKpis ? parseNum(apiKpis.oee) : 0;
    return [
      { pillar: t('executive.pillarPlanning'), value: Math.min(95, Math.round(oee * 1.05)) },
      { pillar: t('executive.pillarReliability'), value: Math.min(95, Math.round(avail * 0.85)) },
      { pillar: t('executive.pillarSafety'), value: 92 },
      { pillar: t('executive.pillarCost'), value: Math.min(90, Math.round(oee * 0.88)) },
      { pillar: t('executive.pillarQuality'), value: Math.min(95, Math.round(avail * 0.92)) },
      { pillar: t('executive.pillarAvailability'), value: Math.round(avail) },
    ];
  }, [t, apiKpis]);

  const metCount = KPI_TARGETS.filter(isMet).length;

  if (loading) return <LoadingSpinner message={t('analyticsPage.loadingAnalytics')} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-300" />
            {t('executive.title')}
          </h1>
          <p className="text-green-200 text-sm mt-1">{t('executive.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full">
            {t('executive.targets')}: {metCount}/{KPI_TARGETS.length}
          </span>
        </div>
      </div>

      {/* Jorge SF-516 + Tanda 4: Adherencia+Cumplimiento (en construcción consolidado)
          y calendario PM02 auto — este último ya clickable. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdherenceCompliancePanel plantId={plant} weeks={12} />
        <button onClick={() => setShowPm02Calendar(true)}
          className="rounded-xl border-2 border-blue-300 bg-blue-50/40 p-4 text-left hover:bg-blue-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Calendario PM02 Estrategia · Preview 12m</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-300">Abrir →</span>
          </div>
          <p className="text-xs text-blue-800">
            Proyección anual de las PM02 generadas desde FMECA → MaintenanceTask. Click para ver heatmap mensual, HH total, tareas próximas y shutdown hours.
          </p>
        </button>
      </div>

      {showPm02Calendar && <PM02CalendarPreview plantId={plant} onClose={() => setShowPm02Calendar(false)} />}

      {/* KPI Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {KPI_TARGETS.map(kpi => <KPICard key={kpi.key} kpi={kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adherence + OEE Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 mb-4 uppercase tracking-wide">{t('executive.trendAdherenceOEE')}</h2>
          {kpiHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpiHistory} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[70, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="schedule_adherence" name={t('executive.adherence')} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="oee_avg" name="OEE %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
        </div>

        {/* Radar: 6 pillars */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 mb-4 uppercase tracking-wide">{t('executive.maintenancePillars')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name={t('executive.score')} dataKey="value" stroke="#1B5E20" fill="#1B5E20" fillOpacity={0.25} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Area */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 mb-4 uppercase tracking-wide">{t('executive.costByArea')}</h2>
          {costByArea.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByArea} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={v => `${(v / 1000).toFixed(1)} K MAD`} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="material" name={t('executive.material')} stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="labor" name={t('executive.labor')} stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
        </div>

        {/* MTBF Bars */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 mb-4 uppercase tracking-wide">{t('executive.mtbfByEquipment')}</h2>
          {reliabilityKpis.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reliabilityKpis.map(eq => {
              const maxMtbf = Math.max(...reliabilityKpis.map(e => e.mtbf));
              const pct = Math.round((eq.mtbf / maxMtbf) * 100);
              return (
                <div key={eq.equipment_tag} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[160px]" title={eq.equipment_name}>
                      <span className="text-muted-foreground mr-1">{eq.equipment_tag}</span>
                      {eq.equipment_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{eq.mtbf}h</span>
                      {trendBadge(eq.trend, t)}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#1B5E20]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
        </div>
      </div>

      {/* Equipment Fleet — Clickable */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-xs font-bold text-[#1B5E20] dark:text-green-400 mb-4 uppercase tracking-wide">
          {t('executive.equipmentFleet')} — {equipmentList.length} {t('executive.assets')}
        </h2>
        {equipmentList.length > 0 ? (
        <>
        <p className="text-xs text-muted-foreground mb-3">{t('executive.clickForReport')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {equipmentList.map(eq => (
            <div key={eq.tag} onClick={() => setSelectedEquipment(eq)}
              className="border border-border rounded-lg p-3 flex flex-col gap-1.5 bg-muted/30 hover:bg-muted hover:border-[#1B5E20]/50 hover:shadow-sm transition-all cursor-pointer group">
              <span className="text-xs font-bold text-muted-foreground font-mono">{eq.tag}</span>
              <span className="text-xs font-semibold text-foreground leading-tight truncate" title={eq.name}>{eq.name}</span>
              <div className="flex items-center gap-1 flex-wrap">
                <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full ${statusColor(eq.status)}`}>
                  {eq.status === 'RUNNING' ? t('executive.running') : eq.status === 'MAINTENANCE' ? t('executive.maintenance') : eq.status}
                </span>
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded border ${criticalityColor(eq.criticality)}`}>{eq.criticality}</span>
              </div>
            </div>
          ))}
        </div>
        </>
        ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
      </div>

      {/* Equipment Report Modal */}
      {selectedEquipment && (
        <EquipmentReportModal equipment={selectedEquipment} t={t} onClose={() => setSelectedEquipment(null)} reliabilityKpis={reliabilityKpis} />
      )}
    </div>
  );
}
