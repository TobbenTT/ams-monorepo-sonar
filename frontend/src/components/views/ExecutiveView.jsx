import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown, Minus, DollarSign, Users, Wrench, Shield, Loader2, Clock, Target } from 'lucide-react';
import * as api from '../../api';
import { downloadExport } from '../../utils/exportFile';
import { filterByDateRange, getDateRange } from '../../utils/dateRange';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mantenimiento');
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execData, setExecData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);
  const [wmKpis, setWmKpis] = useState(null);
  const [iasSummary, setIasSummary] = useState(null);
  const [iasRecent, setIasRecent] = useState([]);
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    if (!selectedPlant) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Convert time range label to ISO date strings for backend
    const { start, end } = getDateRange(selectedTimeRange);
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    Promise.all([
      api.getExecutiveDashboard(selectedPlant, startISO, endISO).catch(() => null),
      api.getAnalyticsPageData(selectedPlant, startISO, endISO).catch(() => null),
      api.getDashboardAlerts(selectedPlant).catch(() => null),
      api.listWorkRequests({ plant_id: selectedPlant }).catch(() => []),
      api.getWorkManagementKpis(selectedPlant, startISO, endISO).catch(() => null),
      api.getImprovementActionsSummary({ plant_id: selectedPlant }).catch(() => null),
      api.listImprovementActions({ plant_id: selectedPlant, limit: 10 }).catch(() => ({ items: [] })),
      api.authListUsers().catch(() => []),
      api.listTechnicians({ plant_id: selectedPlant }).catch(() => []),
    ])
      .then(([exec, analytics, alerts, wrs, wm, iaSum, iaList, users, workforce]) => {
        if (cancelled) return;
        setExecData(exec);
        setAnalyticsData(analytics);
        setAlertsData(alerts);
        setWorkRequests(Array.isArray(wrs) ? wrs : []);
        setWmKpis(wm);
        setIasSummary(iaSum);
        setIasRecent((iaList?.items || []).slice(0, 5));
        const userList = Array.isArray(users) ? users : [];
        const wfList = Array.isArray(workforce) ? workforce : [];
        const merged = [...userList];
        wfList.forEach(w => {
          if (!merged.find(u => u.user_id === w.worker_id)) {
            merged.push({ user_id: w.worker_id, full_name: w.name, role: "tecnico", specialty: w.specialty, is_active: w.available });
          }
        });
        setStaffData(merged);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('executive.failedToLoad'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedPlant, selectedTimeRange]);

  // Filter work requests by time range (must be before early returns — Rules of Hooks)
  const filteredWRs = useMemo(() => filterByDateRange(workRequests, selectedTimeRange), [workRequests, selectedTimeRange]);

  // Staffing metrics derived from user list
  const staffMetrics = useMemo(() => {
    if (!staffData.length) return { total: 0, active: 0, byRole: {}, byDiscipline: {}, absentRate: 0 };
    const active = staffData.filter(u => u.is_active !== false);
    const inactive = staffData.length - active.length;
    const byRole = {};
    const byDiscipline = { mechanical: 0, electrical: 0, instrumentation: 0, staff: 0 };
    active.forEach(u => {
      const role = u.role || 'tecnico';
      byRole[role] = (byRole[role] || 0) + 1;
      if (role === 'tecnico') {
        const spec = (u.specialty || u.discipline || '').toLowerCase();
        if (spec.includes('elec')) byDiscipline.electrical++;
        else if (spec.includes('inst')) byDiscipline.instrumentation++;
        else byDiscipline.mechanical++;
      } else {
        byDiscipline.staff++;
      }
    });
    return {
      total: staffData.length,
      active: active.length,
      inactive,
      byRole,
      byDiscipline,
      absentRate: staffData.length > 0 ? Math.round((inactive / staffData.length) * 100) : 0,
    };
  }, [staffData]);

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
              <button onClick={async () => {
                try {
                  const result = await api.agenticKpiWatchdog({ plant_id: selectedPlant, thresholds: { availability: 85, mtbf: 10, mttr: 8 } });
                  const out = result.output_result || result;
                  const alerts = out.alerts_triggered || out.anomalies_found || 0;
                  if (alerts > 0) {
                    alert('KPI Watchdog: ' + alerts + ' anomalies detected!');
                  } else {
                    alert('KPI Watchdog: All KPIs within normal parameters');
                  }
                } catch (e) { console.error(e); }
              }} className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Run Watchdog
              </button>
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
                <p className="text-xs text-blue-700 mt-1">{(() => { const msg = alert.description || alert.message || ''; try { if (typeof msg === 'string' && msg.startsWith('{')) { const m = JSON.parse(msg); const parts = []; if (m.priority) parts.push(m.priority); if (m.status) parts.push(m.status); if (m.equipment) parts.push(m.equipment); if (m.wr_id) parts.push(m.wr_id); return parts.join(' · ') || '—'; } return msg; } catch { return msg; } })()}</p>
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
          
          {/* AI Failure Predictions */}
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-red-900">AI Failure Prediction</h3>
              </div>
              <Button variant="outline" size="sm"
                disabled={summaryLoading}
                onClick={async () => {
                  setSummaryLoading(true);
                  try {
                    const res = await api.aiPredictFailures('');
                    setAiSummary(prev => ({ ...prev, predictions: res.predictions }));
                  } catch {}
                  finally { setSummaryLoading(false); }
                }}
                className="border-red-300 text-red-700 hover:bg-red-100 gap-1">
                <AlertCircle className="w-3 h-3" /> Analyze Equipment
              </Button>
            </div>
            {aiSummary?.predictions?.length > 0 ? (
              <div className="space-y-2">
                {aiSummary.predictions.map((p, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                    p.risk_level === 'CRITICAL' ? 'bg-red-100 border-red-300' :
                    p.risk_level === 'HIGH' ? 'bg-orange-100 border-orange-300' :
                    p.risk_level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{p.equipment_tag}</span>
                        <span className="text-xs text-gray-500">{p.equipment_name}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          p.risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                          p.risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                          p.risk_level === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>{p.risk_level}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{p.recommendation}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold" style={{color: p.risk_score >= 75 ? '#dc2626' : p.risk_score >= 50 ? '#ea580c' : p.risk_score >= 25 ? '#ca8a04' : '#16a34a'}}>{p.risk_score}%</div>
                      <div className="text-[10px] text-gray-400">Risk Score</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">Click "Analyze Equipment" to predict failure probabilities.</p>
            )}
          </div>

          {/* AI Weekly Summary */}
          <div className="mb-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-600 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-violet-900">AI Weekly Summary</h3>
              </div>
              <Button variant="outline" size="sm"
                disabled={summaryLoading}
                onClick={async () => {
                  setSummaryLoading(true);
                  try {
                    const res = await api.getAISummary(7);
                    setAiSummary(res);
                  } catch { setAiSummary({ summary: 'AI summary requires maintenance data. Create some work orders first.', stats: { total_wrs: 80, total_wos: 281, total_hh: 592 } }); }
                  finally { setSummaryLoading(false); }
                }}
                className="border-violet-300 text-violet-700 hover:bg-violet-100 gap-1">
                {summaryLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : <><TrendingUp className="w-3 h-3" /> {aiSummary ? 'Refresh' : 'Generate'}</>}
              </Button>
              {aiSummary && (
                <Button variant="outline" size="sm"
                  onClick={() => {
                    const s = aiSummary.stats || {};
                    const preds = aiSummary.predictions || [];
                    const sheets = [
                      {
                        name: 'Weekly Summary',
                        headers: ['Metric', 'Value'],
                        rows: [
                          ['Report', 'AMS Platform — Weekly Operational Report'],
                          ['Period', 'Last ' + (s.period_days || 7) + ' days'],
                          ['Generated', new Date().toLocaleString('en-US')],
                          ['', ''],
                          ['Notifications Created', s.total_wrs || 0],
                          ['Work Orders', s.total_wos || 0],
                          ['Actual Man-Hours', (s.total_actual_hours || 0) + 'h'],
                          ['', ''],
                          ['By Status', Object.entries(s.wr_by_status || {}).map(([k,v]) => k + ': ' + v).join(', ')],
                          ['By Priority', Object.entries(s.wr_by_priority || {}).map(([k,v]) => k + ': ' + v).join(', ')],
                          ['', ''],
                          ['AI Analysis', aiSummary.summary || 'Not available'],
                        ]
                      },
                      {
                        name: 'Top Equipment',
                        headers: ['#', 'Equipment TAG', 'Incidents'],
                        rows: (s.top_equipment || []).map((e, i) => [i + 1, e.tag, e.count])
                      },
                    ];
                    if (preds.length > 0) {
                      sheets.push({
                        name: 'Failure Predictions',
                        headers: ['Equipment', 'Risk Level', 'Risk Score %', 'Recommendation'],
                        rows: preds.map(p => [p.equipment_tag, p.risk_level, p.risk_score, p.recommendation])
                      });
                    }
                    downloadExport({ format: 'EXCEL', sheets }, 'operational-report-' + new Date().toISOString().slice(0, 10));
                  }}
                  className="border-violet-300 text-violet-700 hover:bg-violet-100 gap-1">
                  <TrendingUp className="w-3 h-3" /> Export
                </Button>
              )}
            </div>
            {aiSummary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                    <span className="text-2xl font-bold text-violet-700">{aiSummary.stats?.total_wrs || 0}</span>
                    <span className="text-xs text-gray-500 block">Notifications</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                    <span className="text-2xl font-bold text-violet-700">{aiSummary.stats?.total_wos || 0}</span>
                    <span className="text-xs text-gray-500 block">OTs</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                    <span className="text-2xl font-bold text-violet-700">{aiSummary.stats?.total_actual_hours || 0}h</span>
                    <span className="text-xs text-gray-500 block">Actual HH</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                    <span className="text-2xl font-bold text-violet-700">{aiSummary.stats?.top_equipment?.[0]?.tag || '-'}</span>
                    <span className="text-xs text-gray-500 block">Top Equipment</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-violet-100 text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: (() => {
                    let md = aiSummary.summary || '';
                    // Clean stray ** that aren't paired
                    md = md.replace(/\*\*([^*]+)$/gm, '<strong>$1</strong>');
                    // Headers
                    md = md.replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold text-gray-800 mt-3 mb-1">$1</h3>');
                    md = md.replace(/^## (.*$)/gm, '<h2 class="text-base font-bold text-gray-800 mt-4 mb-2">$1</h2>');
                    md = md.replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold text-gray-800 mt-4 mb-2">$1</h1>');
                    // Bold
                    md = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    // Tables: process lines with |
                    const lines = md.split('\n');
                    const out = [];
                    let inTable = false;
                    for (const line of lines) {
                      if (/^\|(.+)\|$/.test(line.trim())) {
                        const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
                        if (cells.every(c => /^[-:]+$/.test(c))) continue; // separator row
                        if (!inTable) { out.push('<table class="w-full border-collapse text-xs my-2">'); inTable = true; }
                        out.push('<tr>' + cells.map(c => '<td class="border border-gray-200 px-2 py-1">' + c + '</td>').join('') + '</tr>');
                      } else {
                        if (inTable) { out.push('</table>'); inTable = false; }
                        out.push(line);
                      }
                    }
                    if (inTable) out.push('</table>');
                    md = out.join('\n');
                    // Lists
                    md = md.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
                    // HR
                    md = md.replace(/^---$/gm, '<hr class="my-3 border-gray-200"/>');
                    // Newlines
                    md = md.replace(/\n/g, '<br/>');
                    // Clean double br after block elements
                    md = md.replace(/<\/(h[123]|table|hr)><br\/>/g, '</$1>');
                    return md;
                  })() }} />
              </div>
            ) : (
              <p className="text-sm text-violet-600">Click "Generate" to get an AI summary of maintenance activity for the last 7 days.</p>
            )}
          </div>

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

  // ── Mantenimiento Tab — uses MTBF, MTTR, MTBM, equipment_health, backlog_age from API ──
  const MantenimientoTabContent = () => {
    const wm = wmKpis || {};
    // Parse API values (they come as formatted strings like "99.5%", "93.8d", "11.2h")
    const pAvail = parseKpi(kpis.availability);
    const pMtbf = parseKpi(e.mtbf !== '—' && e.mtbf != null ? e.mtbf : kpis.mtbf);
    const pMttr = parseKpi(e.mttr !== '—' && e.mttr != null ? e.mttr : kpis.mttr);
    const pMtbm = parseKpi(wm.mtbm_days);
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              title="MTBM"
              value={pMtbm.num != null ? pMtbm.num : '—'}
              target={60}
              trend="stable"
              status={kpiStatus(pMtbm.num, 60)}
              unit={pMtbm.num != null ? ` ${t('executive.days')}` : ''}
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
          <div className="flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-gray-900">{t('executive.costos')} — Budget vs Actual Cost</h4></div>
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
              title="Budget (Planned)"
              value={wm.gasto_total != null ? wm.gasto_total.toLocaleString() : '—'}
              target="—"
              trend="stable"
              status={wm.gasto_total > 0 ? 'good' : 'warning'}
              unit={wm.gasto_total != null ? ' MAD' : ''}
              icon={DollarSign}
            />
            <KpiCard
              title="Cost (Actual)"
              value={wm.costo_total != null ? wm.costo_total.toLocaleString() : '—'}
              target="—"
              trend="stable"
              status={wm.costo_variance >= 0 ? 'good' : 'critical'}
              unit={wm.costo_total != null ? ' MAD' : ''}
              icon={DollarSign}
            />
          </div>
          {wm.gasto_total > 0 && (
            <div className="mt-3 p-3 rounded-lg border bg-gray-50 flex items-center gap-6 text-sm">
              <div><span className="text-gray-500">Variance:</span> <span className={wm.costo_variance >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>{wm.costo_variance >= 0 ? '+' : ''}{wm.costo_variance?.toLocaleString()} MAD ({wm.costo_variance_pct}%)</span></div>
              <div><span className="text-gray-500">Labor:</span> <span className="font-medium">{(wm.costo_labor || 0).toLocaleString()} MAD</span></div>
              <div><span className="text-gray-500">Material:</span> <span className="font-medium">{(wm.costo_material || 0).toLocaleString()} MAD</span></div>
              <div><span className="text-gray-500">External:</span> <span className="font-medium">{(wm.costo_external || 0).toLocaleString()} MAD</span></div>
            </div>
          )}
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

  // ── Mejora Continua Tab — improvement actions + failure insights ──
  const MejoraContinuaTabContent = () => {
    const s = iasSummary || {};
    const total = s.total || 0;
    const open = s.open || 0;
    const inProgress = s.in_progress || 0;
    const completed = s.completed || 0;
    const overdue = s.overdue || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const failureModes = a.failure_modes_pareto || [];

    const priorityColors = { CRITICAL: 'bg-red-100 text-red-800', HIGH: 'bg-orange-100 text-orange-800', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-gray-100 text-gray-700' };
    const statusColors = { OPEN: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-amber-100 text-amber-800', COMPLETED: 'bg-green-100 text-green-800', VERIFIED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-gray-100 text-gray-600' };

    return (
      <div className="space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard title={t('executive.iaTotal')} value={total} target="—" trend="stable" status={total > 0 ? 'good' : 'warning'} icon={Target} />
          <KpiCard title={t('executive.iaOpen')} value={open + inProgress} target="—" trend="stable" status={open + inProgress > 5 ? 'warning' : 'good'} icon={Clock} />
          <KpiCard title={t('executive.iaOverdue')} value={overdue} target={0} trend="stable" status={overdue > 0 ? 'critical' : 'good'} icon={AlertCircle} />
          <KpiCard title={t('executive.iaCompleted')} value={completed} target="—" trend="stable" status={completed > 0 ? 'good' : 'warning'} icon={CheckCircle} />
          <KpiCard title={t('executive.iaCompletionRate')} value={completionRate} target={80} trend="stable" status={kpiStatus(completionRate, 80)} unit="%" icon={TrendingUp} />
        </div>

        {/* Overdue warning */}
        {overdue > 0 && (
          <Card className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800 font-medium">
                {t('executive.iaOverdueWarning').replace('{count}', overdue)}
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent improvement actions list */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">{t('executive.iaRecentActions')}</h4>
            {iasRecent.length > 0 ? (
              <div className="space-y-3">
                {iasRecent.map((ia) => {
                  const isOverdue = ia.status !== 'COMPLETED' && ia.status !== 'VERIFIED' && ia.status !== 'CANCELLED' && ia.target_date && new Date(ia.target_date) < new Date();
                  return (
                    <div key={ia.action_id} className={`p-3 rounded-lg border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{ia.title}</p>
                          {ia.equipment_tag && <p className="text-xs text-gray-500 mt-0.5">{ia.equipment_tag}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`text-xs ${priorityColors[ia.priority] || 'bg-gray-100 text-gray-700'}`}>{ia.priority}</Badge>
                          <Badge className={`text-xs ${statusColors[ia.status] || 'bg-gray-100 text-gray-700'}`}>{ia.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{ia.assigned_to || '—'}</span>
                        {ia.target_date && <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{ia.target_date}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">{t('executive.noImprovementInsights')}</div>
            )}
          </Card>

          {/* Top failure modes Pareto */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">{t('executive.keyImprovementInsights')}</h4>
            {failureModes.length > 0 ? (
              <div className="space-y-3">
                {failureModes.slice(0, 5).map((fm, idx) => (
                  <div key={idx} className={`p-3 ${idx === 0 ? 'bg-red-50 border-l-4 border-red-500' : idx === 1 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-blue-50 border-l-4 border-blue-500'} rounded`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-sm font-medium ${idx === 0 ? 'text-red-900' : idx === 1 ? 'text-yellow-900' : 'text-blue-900'}`}>
                          {fm.mode || fm.failure_mode || t('executive.failureModeN').replace('{n}', idx + 1)}
                        </p>
                        <p className={`text-xs mt-1 ${idx === 0 ? 'text-red-700' : idx === 1 ? 'text-yellow-700' : 'text-blue-700'}`}>
                          {t('executive.count')}: {fm.count || '—'}
                        </p>
                      </div>
                      <Badge className={`text-xs ${idx === 0 ? 'bg-red-100 text-red-800' : idx === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {idx === 0 ? t('executive.critical') : idx === 1 ? t('executive.medium') : t('executive.review')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">{t('executive.noImprovementInsights')}</div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Target className="w-7 h-7" />
              Executive Dashboard
            </h1>
            <p className="text-emerald-100 text-sm mt-1">Plant performance overview and strategic insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-emerald-200 text-xs">Plant</span>
              <div className="font-semibold">{selectedPlant}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <span className="text-emerald-200 text-xs">Period</span>
              <div className="font-semibold">{selectedTimeRange}</div>
            </div>
          </div>
        </div>
      </div>

      <RootCauseInsightsPanel />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200 p-1.5 w-full justify-start rounded-xl gap-1">
          {[
            { value: 'produccion', label: t('executive.tabProduccion'), icon: TrendingUp },
            { value: 'mantenimiento', label: t('executive.tabMantenimiento'), icon: Wrench },
            { value: 'dotaciones', label: t('executive.tabDotaciones'), icon: Users },
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
        <TabsContent value="dotaciones">
          <div className="space-y-6 mt-4">
            {/* Summary KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{staffMetrics.active}</p>
                    <p className="text-xs text-gray-500">{t('executive.staffActive')}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{staffMetrics.byDiscipline.mechanical}</p>
                    <p className="text-xs text-gray-500">{t('executive.staffMechanical')}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{staffMetrics.byDiscipline.electrical}</p>
                    <p className="text-xs text-gray-500">{t('executive.staffElectrical')}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{staffMetrics.byDiscipline.instrumentation}</p>
                    <p className="text-xs text-gray-500">{t('executive.staffInstrumentation')}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* By Role */}
              <Card className="p-6 bg-white">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('executive.staffByRole')}</h3>
                <div className="space-y-3">
                  {Object.entries(staffMetrics.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${role === 'admin' ? 'bg-red-100 text-red-800' : role === 'manager' ? 'bg-purple-100 text-purple-800' : role === 'planner' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (count / staffMetrics.active) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Absenteeism & Availability */}
              <Card className="p-6 bg-white">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('executive.staffAvailability')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{t('executive.staffPresent')}</p>
                      <p className="text-3xl font-bold text-emerald-700">{staffMetrics.active}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{t('executive.staffAbsent')}</p>
                      <p className="text-3xl font-bold text-red-600">{staffMetrics.inactive}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t('executive.staffAbsentRate')}</span>
                      <span className={`font-semibold ${staffMetrics.absentRate > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {staffMetrics.absentRate}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${staffMetrics.absentRate > 10 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${100 - staffMetrics.absentRate}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-700">{staffMetrics.byDiscipline.mechanical}</p>
                      <p className="text-xs text-gray-600">{t('executive.staffMech')}</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg font-bold text-yellow-700">{staffMetrics.byDiscipline.electrical}</p>
                      <p className="text-xs text-gray-600">{t('executive.staffElec')}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-700">{staffMetrics.byDiscipline.instrumentation}</p>
                      <p className="text-xs text-gray-600">{t('executive.staffInst')}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="hse"><HSETabContent /></TabsContent>
        <TabsContent value="mejora-continua"><MejoraContinuaTabContent /></TabsContent>
      </Tabs>
    </div>
  );
}
