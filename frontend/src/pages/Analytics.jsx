import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ReferenceLine,
} from 'recharts';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

// ── Colour palette helpers ────────────────────────────────────────────────
const PIE_COLORS = ['#1565C0', '#2E7D32', '#C62828'];

const trendBadge = (trend) => {
    const map = {
        IMPROVING: 'bg-green-100 text-green-800',
        STABLE: 'bg-blue-100 text-blue-800',
        WORSENING: 'bg-red-100 text-red-800',
    };
    return map[trend] ?? 'bg-gray-100 text-gray-700';
};

// ── Section header helper ─────────────────────────────────────────────────
function ChartTitle({ children }) {
    return (
        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
            {children}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function Analytics() {
    const { plant } = useOutletContext();
    const { t } = useLanguage();
    const [alerts, setAlerts] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [kpiHistory, setKpiHistory] = useState([]);
    const [analyticsData, setAnalyticsData] = useState({ failure_modes_pareto: [], work_orders_by_type: [], cost_by_area: [] });
    const [reliabilityKpis, setReliabilityKpis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getVarianceAlerts(),
            api.getAnalyticsPageData(plant),
        ]).then(([a, d]) => {
            setAlerts(a.status === 'fulfilled' ? (Array.isArray(a.value) ? a.value : []) : []);
            if (d.status === 'fulfilled' && d.value) {
                const data = d.value;
                setKpis(data.kpis);
                setKpiHistory(data.kpi_history || []);
                setAnalyticsData({
                    failure_modes_pareto: data.failure_modes_pareto || [],
                    work_orders_by_type: data.work_orders_by_type || [],
                    cost_by_area: data.cost_by_area || [],
                });
                setReliabilityKpis(data.reliability_kpis || []);
            }
            setLoading(false);
        });
    }, [plant]);

    if (loading) return <LoadingSpinner message={t('analyticsPage.loadingAnalytics')} />;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">{t('analyticsPage.title')}</h1>

            {/* ── API KPI Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard label="MTBF" value={kpis?.mtbf ?? '—'} trendDir="up" />
                <KPICard label="MTTR" value={kpis?.mttr ?? '—'} trendDir="up" variant="info" />
                <KPICard label="Availability" value={kpis?.availability ?? '—'} trendDir="up" />
                <KPICard label="OEE" value={kpis?.oee ?? '—'} trendDir="up" />
            </div>

            {/* ── Charts row 1: KPI Trends + Pareto ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. KPI Trends — ComposedChart with Area + Line */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.kpiTrendsTitle')}</ChartTitle>
                    {kpiHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={kpiHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" domain={[70, 100]} tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" domain={[75, 95]} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="schedule_adherence"
                                name={t('analyticsPage.adherencePct')}
                                stroke="#1B5E20"
                                fill="#E8F5E9"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="oee_avg"
                                name={t('analyticsPage.oeePct')}
                                stroke="#1565C0"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={{ r: 3 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>

                {/* 2. Pareto Chart — Failure Modes */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.paretoTitle')}</ChartTitle>
                    {analyticsData.failure_modes_pareto.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={analyticsData.failure_modes_pareto}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="mode" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: t('analyticsPage.qty'), angle: -90, position: 'insideLeft', fontSize: 10 }} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: '%', angle: 90, position: 'insideRight', fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" name={t('analyticsPage.quantity')} fill="#1565C0" radius={[3, 3, 0, 0]} />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="cumulative_pct"
                                name={t('analyticsPage.cumulativePct')}
                                stroke="#C62828"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                            <ReferenceLine yAxisId="right" y={80} stroke="#F57F17" strokeDasharray="4 2" label={{ value: '80%', position: 'insideTopRight', fontSize: 10, fill: '#F57F17' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>
            </div>

            {/* ── Charts row 2: Pie + Stacked Bar ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 3. Pie Chart — OTs por Tipo */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.woByTypeTitle')}</ChartTitle>
                    {analyticsData.work_orders_by_type.length > 0 ? (
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="55%" height={240}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.work_orders_by_type}
                                    dataKey="count"
                                    nameKey="type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {analyticsData.work_orders_by_type.map((_, idx) => (
                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-3">
                            {analyticsData.work_orders_by_type.map((d, idx) => (
                                <div key={d.type} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                                    <div>
                                        <div className="font-semibold text-foreground">{d.type}</div>
                                        <div className="text-xs text-muted-foreground">{d.count} {t('analyticsPage.wos')} · {d.hours} h</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>

                {/* 4. Stacked Bar — Costos por Area */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.costByAreaTitle')}</ChartTitle>
                    {analyticsData.cost_by_area.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analyticsData.cost_by_area}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`${(v / 1000).toFixed(1)}K MAD`]} />
                            <Legend />
                            <Bar dataKey="material" name={t('analyticsPage.material')} stackId="cost" fill="#2E7D32" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="labor" name={t('analyticsPage.labor')} stackId="cost" fill="#1565C0" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>
            </div>

            {/* ── Charts row 3: Planning Time + MTBF/MTTR Table ────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 5. Line Chart — Tiempo de Planning */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.planningTimeTitle')}</ChartTitle>
                    {kpiHistory.length > 0 ? (
                    <>
                    <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                        {t('analyticsPage.planningTimeReduction')}
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={kpiHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis domain={[60, 160]} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`${v} min`, t('analyticsPage.avgTime')]} />
                            <Line
                                type="monotone"
                                dataKey="planning_time_avg"
                                name={t('analyticsPage.planningTimeMin')}
                                stroke="#1B5E20"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#1B5E20' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    </>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>

                {/* 6. MTBF / MTTR / Availability Table */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.reliabilityTableTitle')}</ChartTitle>
                    {reliabilityKpis.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                                    <th className="text-left py-2 pr-2 font-semibold">{t('analyticsPage.equipment')}</th>
                                    <th className="text-right py-2 pr-2 font-semibold">MTBF</th>
                                    <th className="text-right py-2 pr-2 font-semibold">MTTR</th>
                                    <th className="text-right py-2 pr-2 font-semibold">{t('analyticsPage.availabilityPct')}</th>
                                    <th className="text-right py-2 pr-2 font-semibold">OEE%</th>
                                    <th className="text-left py-2 font-semibold">{t('analyticsPage.trend')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reliabilityKpis.map((r) => (
                                    <tr key={r.equipment_tag} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                                        <td className="py-2 pr-2">
                                            <div className="font-semibold text-xs text-foreground leading-tight">{r.equipment_name}</div>
                                            <div className="font-mono text-xs text-muted-foreground">{r.equipment_tag}</div>
                                        </td>
                                        <td className="py-2 pr-2 text-right text-xs font-mono">{r.mtbf}h</td>
                                        <td className="py-2 pr-2 text-right text-xs font-mono">{r.mttr}h</td>
                                        <td className="py-2 pr-2 text-right text-xs font-mono font-semibold">{r.availability}%</td>
                                        <td className="py-2 pr-2 text-right text-xs font-mono font-semibold">{r.oee}%</td>
                                        <td className="py-2">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${trendBadge(r.trend)}`}>
                                                {r.trend === 'IMPROVING' ? '↑' : r.trend === 'WORSENING' ? '↓' : '→'} {r.trend}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : <p className="text-sm text-muted-foreground py-10 text-center">No data</p>}
                </div>
            </div>

            {/* ── Existing: Variance Alerts (API) ──────────────────────── */}
            {alerts.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <ChartTitle>{t('analyticsPage.varianceAlerts')}</ChartTitle>
                    {alerts.map((a, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border-l-[3px] mb-2 bg-amber-50 border border-border border-l-amber-500"
                        >
                            <div>
                                <div className="text-sm font-semibold">
                                    {a.metric_name} — Z-Score: {a.z_score?.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    Plant: {a.plant_id} — Level: {a.variance_level}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
