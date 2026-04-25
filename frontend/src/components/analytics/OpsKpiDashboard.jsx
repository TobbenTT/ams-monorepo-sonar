import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Clock, AlertTriangle, DollarSign, Download, FileSpreadsheet, Loader2, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import * as api from '../../api';

const BUCKET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

const safe = (p) => p.catch(e => { console.error(e); return null; });

function KpiPill({ icon: Icon, label, value, sub, tone = 'emerald' }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20',
        sky: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20',
    };
    return (
        <div className={`rounded-xl p-4 ${tones[tone] || tones.emerald}`}>
            <div className="flex items-center gap-2 mb-1">
                <Icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-2xl font-extrabold tabular-nums">{value ?? '—'}</div>
            {sub && <div className="text-[10.5px] opacity-80 mt-0.5">{sub}</div>}
        </div>
    );
}

function downloadXlsx(path, params) {
    api.downloadReportXlsx(path, params).catch(err => alert('Error descargando reporte: ' + err.message));
}

export default function OpsKpiDashboard({ plantId }) {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [mtbfSeries, setMtbfSeries] = useState([]);
    const [pmCompliance, setPmCompliance] = useState(null);
    const [aging, setAging] = useState(null);
    const [cost, setCost] = useState(null);
    const [adherence, setAdherence] = useState(null);
    const [months, setMonths] = useState(6);

    useEffect(() => {
        if (!plantId) return;
        let cancelled = false;
        setLoading(true);
        Promise.all([
            safe(api.getOpsSummary(plantId)),
            safe(api.getOpsMtbfTimeseries(plantId, months)),
            safe(api.getOpsPmCompliance(plantId)),
            safe(api.getOpsBacklogAging(plantId)),
            safe(api.getOpsCostPerEquipment(plantId, 10)),
            safe(api.getAdherenceComplianceDash(plantId, 30)),
        ]).then(([s, ts, pc, ag, c, ad]) => {
            if (cancelled) return;
            setSummary(s);
            setMtbfSeries(ts?.series || []);
            setPmCompliance(pc);
            setAging(ag);
            setCost(c);
            setAdherence(ad);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [plantId, months]);

    const agingData = useMemo(() => aging?.buckets?.map((b, i) => ({ ...b, fill: BUCKET_COLORS[i] })) || [], [aging]);

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Activity size={18} className="text-emerald-600" />
                        KPIs Operativos de Mantenimiento
                    </h2>
                    <p className="text-xs text-muted-foreground">MTBF, MTTR, PM compliance, backlog y costos · datos reales del último período</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={months} onChange={e => setMonths(Number(e.target.value))}
                        className="text-xs px-2 py-1.5 border border-border rounded-lg bg-background">
                        <option value={3}>Últimos 3 meses</option>
                        <option value={6}>Últimos 6 meses</option>
                        <option value={12}>Últimos 12 meses</option>
                    </select>
                    <button
                        onClick={() => downloadXlsx('/reports-export/kpi-summary.xlsx', { plant_id: plantId })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        <Download size={13} /> KPI Summary .xlsx
                    </button>
                    <button
                        onClick={() => downloadXlsx('/reports-export/weekly-schedule.xlsx', { plant_id: plantId })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-muted">
                        <FileSpreadsheet size={13} /> Weekly Schedule
                    </button>
                    <button
                        onClick={() => downloadXlsx('/reports-export/wos-closed.xlsx', { plant_id: plantId })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-muted">
                        <FileSpreadsheet size={13} /> WOs cerradas mes
                    </button>
                </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
                <KpiPill icon={Activity} tone="sky" label="OTs abiertas" value={summary?.open_wos ?? 0} sub={`${summary?.closed_30d ?? 0} cerradas 30d`} />
                <KpiPill icon={AlertTriangle} tone="rose" label="Atrasadas" value={summary?.overdue_wos ?? 0} sub="planned_end vencido" />
                <KpiPill icon={Clock} tone="amber" label="MTTR 30d" value={summary?.mttr_hours_30d != null ? `${summary.mttr_hours_30d}h` : '—'} sub="promedio correctivos cerrados" />
                <KpiPill icon={TrendingUp} tone="emerald" label="PM compliance" value={summary?.pm_compliance_pct != null ? `${summary.pm_compliance_pct}%` : '—'} sub="on-time / total PM" />
                <KpiPill icon={DollarSign} tone="purple" label="Costo total" value={cost?.total_cost_all ? `$${Math.round(cost.total_cost_all).toLocaleString()}` : '—'} sub={`${cost?.equipment_count ?? 0} equipos`} />
                <KpiPill icon={Target} tone="sky" label="Adherencia" value={adherence?.adherence_pct != null ? `${adherence.adherence_pct}%` : '—'} sub={`${adherence?.adherence_count ?? 0}/${adherence?.total_closed ?? 0} en ±4h plan`} />
                <KpiPill icon={CheckCircle2} tone="emerald" label="Cumplimiento" value={adherence?.compliance_pct != null ? `${adherence.compliance_pct}%` : '—'} sub={`${adherence?.compliance_count ?? 0}/${adherence?.total_closed ?? 0} ≤7d vs plan`} />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* MTBF/MTTR timeseries */}
                <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground">MTBF / MTTR</h3>
                        <span className="text-[10px] text-muted-foreground">días / horas por mes</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={mtbfSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis dataKey="month_label" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line yAxisId="left" type="monotone" dataKey="mtbf_days" stroke="#10b981" strokeWidth={2} name="MTBF (días)" dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="mttr_hours" stroke="#f59e0b" strokeWidth={2} name="MTTR (h)" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* PM compliance by group */}
                <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground">PM compliance por grupo</h3>
                        <span className="text-[10px] text-muted-foreground">overall {pmCompliance?.overall_compliance_pct ?? 0}%</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={pmCompliance?.by_group || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis dataKey="group" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="compliance_pct" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Backlog aging */}
                <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground">Backlog aging</h3>
                        <span className="text-[10px] text-muted-foreground">{aging?.total ?? 0} pendientes</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={agingData} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={(e) => e.count > 0 ? e.range : ''}>
                                {agingData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Cost per equipment top-10 */}
                <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground">Costo por equipo (Top 10)</h3>
                        <span className="text-[10px] text-muted-foreground">Labor + material + externo</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border">
                                    <th className="py-1.5 font-semibold">#</th>
                                    <th className="py-1.5 font-semibold">Equipo</th>
                                    <th className="py-1.5 font-semibold text-right">OTs</th>
                                    <th className="py-1.5 font-semibold text-right">HH real</th>
                                    <th className="py-1.5 font-semibold text-right">Costo total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(cost?.top || []).map((r, i) => (
                                    <tr key={r.equipment_tag} className="border-b border-border/40">
                                        <td className="py-1.5 text-muted-foreground">{i + 1}</td>
                                        <td className="py-1.5 font-mono font-semibold text-foreground truncate max-w-[160px]">{r.equipment_tag}</td>
                                        <td className="py-1.5 text-right tabular-nums">{r.wo_count}</td>
                                        <td className="py-1.5 text-right tabular-nums">{Math.round(r.actual_hours)}h</td>
                                        <td className="py-1.5 text-right tabular-nums font-semibold text-emerald-700">${Math.round(r.total_cost).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(cost?.top || []).length === 0 && (
                                    <tr><td colSpan={5} className="py-6 text-center text-muted-foreground italic">Sin datos de costo</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Stale items alert */}
            {aging?.stale_items && aging.stale_items.length > 0 && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10 p-3">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-rose-800 dark:text-rose-300 mb-2">
                        <AlertTriangle size={14} />
                        {aging.stale_items.length} OTs con más de 90 días abiertas
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px]">
                        {aging.stale_items.slice(0, 10).map(s => (
                            <div key={s.wo_id} className="flex items-center gap-2">
                                <span className="font-mono text-rose-700 dark:text-rose-300">{s.wo_number}</span>
                                <span className="truncate text-foreground">{s.equipment_tag}</span>
                                <span className="ml-auto text-rose-700 dark:text-rose-300 font-bold tabular-nums">{s.age_days}d</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
