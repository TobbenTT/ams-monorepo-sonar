import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BarChart, Bar, LineChart, Line, ComposedChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, ReferenceLine,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity, Wrench, Factory, Package, Calculator } from 'lucide-react';
import { KPICard, LoadingSpinner, DataTable } from '../components/Shared';
import * as api from '../api';

const COLORS = ['#1565C0', '#2E7D32', '#C62828', '#F57F17', '#6A1B9A', '#00838F', '#4E342E', '#37474F'];
const PIE_COLORS = ['#1565C0', '#2E7D32', '#C62828', '#F57F17', '#6A1B9A', '#00838F', '#EF6C00', '#AD1457'];

function fmt(n) {
    if (n == null) return '$0';
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
}

function fmtFull(n) {
    if (n == null) return '$0';
    return `$${Math.round(n).toLocaleString()}`;
}

function pct(n) {
    if (n == null) return '0%';
    return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function SectionTitle({ children, icon: Icon }) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border rounded-lg shadow-lg p-3 text-xs">
            <div className="font-semibold mb-1">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-semibold">{fmt(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ── Tabs ──
const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'opex', label: 'OPEX', icon: DollarSign },
    { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
    { id: 'capex', label: 'CAPEX', icon: Factory },
    { id: 'equipment', label: 'Equipos', icon: Package },
    { id: 'roi', label: 'ROI Calculator', icon: Calculator },
];

export default function Financial() {
    const { plant } = useOutletContext();
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [costByArea, setCostByArea] = useState([]);
    const [maintCosts, setMaintCosts] = useState([]);
    const [capexProjects, setCapexProjects] = useState([]);
    const [kpiData, setKpiData] = useState({});
    const [equipCosts, setEquipCosts] = useState([]);

    // ROI form
    const [roiForm, setRoiForm] = useState({
        equipment_tag: '', annual_breakdown_cost: 50000,
        pm_program_cost: 15000, avoided_breakdowns_per_year: 3,
    });
    const [roiResult, setRoiResult] = useState(null);
    const [roiLoading, setRoiLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getFinancialSummary({ plant_id: plant }),
            api.getMonthlyTrend(),
            api.getCostByArea(),
            api.getMaintenanceCosts(),
            api.getCapexProjects(),
            api.getFinancialKpis(),
            api.getEquipmentCosts(),
        ]).then(([s, mt, ca, mc, cp, kp, ec]) => {
            if (s.status === 'fulfilled') setSummary(s.value);
            if (mt.status === 'fulfilled') setMonthlyTrend(mt.value);
            if (ca.status === 'fulfilled') setCostByArea(ca.value);
            if (mc.status === 'fulfilled') setMaintCosts(mc.value);
            if (cp.status === 'fulfilled') setCapexProjects(cp.value);
            if (kp.status === 'fulfilled') setKpiData(kp.value);
            if (ec.status === 'fulfilled') setEquipCosts(ec.value);
            setLoading(false);
        });
    }, [plant]);

    const handleRoi = async () => {
        setRoiLoading(true);
        try {
            const result = await api.calculateRoi(roiForm);
            setRoiResult(result);
        } catch { /* ignore */ }
        setRoiLoading(false);
    };

    // Derived data for charts
    const areaChartData = useMemo(() =>
        costByArea.slice(0, 8).map(c => ({ ...c, name: c.area || c.cost_center })),
    [costByArea]);

    const maintByFleet = useMemo(() => {
        const map = {};
        maintCosts.forEach(m => {
            if (!map[m.fleet_description]) map[m.fleet_description] = 0;
            map[m.fleet_description] += m.total;
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [maintCosts]);

    const maintByCostType = useMemo(() => {
        const map = {};
        maintCosts.forEach(m => {
            const key = m.cost_type_desc || m.cost_type;
            if (!map[key]) map[key] = 0;
            map[key] += m.total;
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    }, [maintCosts]);

    if (loading) return <LoadingSpinner message="Cargando datos financieros..." />;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
                <div className="text-xs text-muted-foreground">Presupuesto Anual 2026</div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            tab === t.id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}>
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════════════
                TAB: OVERVIEW
            ════════════════════════════════════════════════════════════ */}
            {tab === 'overview' && (
                <div className="space-y-5">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPICard label="Total OPEX Budget" value={fmt(summary.total_opex_budget)} variant="info" />
                        <KPICard label="Total CAPEX" value={fmt(summary.total_capex)} variant="purple" />
                        <KPICard label="Maint. Budget" value={fmt(summary.total_maintenance)} variant="success" />
                        <KPICard label="Variance"
                            value={pct(summary.variance_pct)}
                            variant={summary.variance_pct > 0 ? 'danger' : 'success'}
                            trend={summary.variance_pct > 5 ? 'Over budget' : summary.variance_pct < -5 ? 'Under budget' : 'On track'}
                            trendDir={summary.variance_pct > 5 ? 'down' : summary.variance_pct < -5 ? 'up' : 'neutral'}
                        />
                    </div>

                    {/* Secondary KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPICard label="Equipment Tracked" value={kpiData.equipment_count || 0} />
                        <KPICard label="Cost / Equipment" value={fmt(kpiData.cost_per_equipment)} variant="info" />
                        <KPICard label="WO Completion" value={`${kpiData.wo_completion_rate || 0}%`} variant="success" />
                        <KPICard label="Avg WO Duration" value={`${kpiData.wo_avg_hours || 0}h`} variant="warning" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Monthly Budget vs Actual */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={TrendingUp}>Presupuesto vs Real (Mensual)</SectionTitle>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="budget" name="Budget" fill="#1565C0" opacity={0.7} radius={[4,4,0,0]} />
                                    <Bar dataKey="actual" name="Actual" fill="#2E7D32" opacity={0.8} radius={[4,4,0,0]} />
                                    <Line dataKey="variance" name="Variance" stroke="#C62828" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cost by Area */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={Factory}>Costos por Area</SectionTitle>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={areaChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="budget" name="Budget" fill="#1565C0" opacity={0.7} radius={[0,4,4,0]} />
                                    <Bar dataKey="actual" name="Actual" fill="#F57F17" opacity={0.8} radius={[0,4,4,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Executive KPIs Table */}
                    {kpiData.executive_kpis?.length > 0 && (
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={Activity}>KPIs Ejecutivos</SectionTitle>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="py-2 px-2">Categoria</th>
                                            <th className="py-2 px-2">KPI</th>
                                            <th className="py-2 px-2">Unidad</th>
                                            <th className="py-2 px-2 text-right">Budget</th>
                                            <th className="py-2 px-2 text-right">Actual</th>
                                            <th className="py-2 px-2 text-right">Var %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kpiData.executive_kpis.map((k, i) => (
                                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                                <td className="py-1.5 px-2 font-medium">{k.category}</td>
                                                <td className="py-1.5 px-2">{k.description}</td>
                                                <td className="py-1.5 px-2 text-muted-foreground">{k.unit}</td>
                                                <td className="py-1.5 px-2 text-right font-mono">{k.budget?.toLocaleString()}</td>
                                                <td className="py-1.5 px-2 text-right font-mono">{k.actual?.toLocaleString() || '-'}</td>
                                                <td className={`py-1.5 px-2 text-right font-semibold ${
                                                    k.variance_pct > 5 ? 'text-red-600' : k.variance_pct < -5 ? 'text-green-600' : 'text-muted-foreground'
                                                }`}>{k.variance_pct ? pct(k.variance_pct) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB: OPEX
            ════════════════════════════════════════════════════════════ */}
            {tab === 'opex' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <KPICard label="Total OPEX Budget" value={fmt(summary.total_opex_budget)} variant="info" />
                        <KPICard label="Total OPEX Actual" value={fmt(summary.total_opex_actual)} />
                        <KPICard label="Variance" value={fmt(summary.variance)}
                            variant={summary.variance > 0 ? 'danger' : 'success'} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Monthly OPEX Trend */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={TrendingUp}>OPEX Mensual</SectionTitle>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Area dataKey="opex_budget" name="OPEX Budget" fill="#1565C0" fillOpacity={0.1} stroke="#1565C0" />
                                    <Bar dataKey="actual" name="Actual" fill="#2E7D32" opacity={0.8} radius={[4,4,0,0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* OPEX by Area Pie */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={Factory}>Distribucion OPEX por Area</SectionTitle>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={areaChartData} dataKey="budget" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={100} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ strokeWidth: 1 }}>
                                        {areaChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => fmtFull(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* OPEX Detail Table */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle>Detalle OPEX por Centro de Costo</SectionTitle>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 px-2">Centro Costo</th>
                                        <th className="py-2 px-2">Area</th>
                                        <th className="py-2 px-2 text-right">Budget</th>
                                        <th className="py-2 px-2 text-right">Actual</th>
                                        <th className="py-2 px-2 text-right">Varianza</th>
                                        <th className="py-2 px-2">Ejecucion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costByArea.map((r, i) => {
                                        const execPct = r.budget > 0 ? ((r.actual / r.budget) * 100) : 0;
                                        return (
                                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                                <td className="py-1.5 px-2 font-mono font-medium">{r.cost_center}</td>
                                                <td className="py-1.5 px-2">{r.area}</td>
                                                <td className="py-1.5 px-2 text-right font-mono">{fmtFull(r.budget)}</td>
                                                <td className="py-1.5 px-2 text-right font-mono">{fmtFull(r.actual)}</td>
                                                <td className={`py-1.5 px-2 text-right font-mono font-semibold ${
                                                    r.variance > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>{fmtFull(r.variance)}</td>
                                                <td className="py-1.5 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${execPct > 100 ? 'bg-red-500' : execPct > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                                style={{ width: `${Math.min(execPct, 100)}%` }} />
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground w-8">{execPct.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB: MAINTENANCE
            ════════════════════════════════════════════════════════════ */}
            {tab === 'maintenance' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPICard label="Total Maint. Budget" value={fmt(summary.total_maintenance)} variant="info" />
                        <KPICard label="Cost / Equipment" value={fmt(kpiData.cost_per_equipment)} variant="success" />
                        <KPICard label="Equipment Count" value={kpiData.equipment_count || 0} />
                        <KPICard label="Cost Types" value={maintByCostType.length} variant="purple" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* By Fleet */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={Wrench}>Costo por Flota / Area</SectionTitle>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={maintByFleet} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Budget" radius={[0,4,4,0]}>
                                        {maintByFleet.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* By Cost Type */}
                        <div className="bg-card rounded-xl border p-5">
                            <SectionTitle icon={DollarSign}>Costo por Tipo</SectionTitle>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie data={maintByCostType} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={110} innerRadius={45} paddingAngle={2}
                                        label={({ name, percent }) => `${name.substring(0, 20)} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ strokeWidth: 1 }}>
                                        {maintByCostType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => fmtFull(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Maintenance Budget */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle icon={TrendingUp}>Presupuesto Mantenimiento Mensual</SectionTitle>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="maint_budget" name="Maint. Budget" fill="#6A1B9A" opacity={0.8} radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Maintenance Cost Detail Table */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle>Detalle Costos Mantenimiento</SectionTitle>
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 px-2">Flota</th>
                                        <th className="py-2 px-2">Descripcion</th>
                                        <th className="py-2 px-2">Tipo Costo</th>
                                        <th className="py-2 px-2 text-right">Total Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintCosts.slice(0, 50).map((r, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="py-1.5 px-2 font-mono">{r.fleet_group}</td>
                                            <td className="py-1.5 px-2">{r.fleet_description}</td>
                                            <td className="py-1.5 px-2">{r.cost_type_desc}</td>
                                            <td className="py-1.5 px-2 text-right font-mono font-semibold">{fmtFull(r.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB: CAPEX
            ════════════════════════════════════════════════════════════ */}
            {tab === 'capex' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <KPICard label="Total CAPEX" value={fmt(summary.total_capex)} variant="purple" />
                        <KPICard label="Projects" value={capexProjects.length} variant="info" />
                        <KPICard label="Approved" value={capexProjects.filter(p => p.status === 'APPROVED').length} variant="success" />
                    </div>

                    {/* CAPEX by project bar chart */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle icon={Factory}>Proyectos CAPEX</SectionTitle>
                        <ResponsiveContainer width="100%" height={Math.max(250, capexProjects.length * 35)}>
                            <BarChart data={capexProjects} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                <YAxis type="category" dataKey="project" width={200} tick={{ fontSize: 9 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="annual_budget" name="Budget" radius={[0,4,4,0]}>
                                    {capexProjects.map((p, i) => (
                                        <Cell key={i} fill={p.priority === '1-Critica' ? '#C62828' : p.priority === '2-Alta' ? '#F57F17' : '#1565C0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* CAPEX Table */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle>Detalle Proyectos CAPEX</SectionTitle>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 px-2">ID</th>
                                        <th className="py-2 px-2">Categoria</th>
                                        <th className="py-2 px-2">Proyecto</th>
                                        <th className="py-2 px-2">Prioridad</th>
                                        <th className="py-2 px-2">Estado</th>
                                        <th className="py-2 px-2 text-right">Budget Anual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {capexProjects.map((p, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="py-1.5 px-2 font-mono">{p.capex_id}</td>
                                            <td className="py-1.5 px-2">{p.category}</td>
                                            <td className="py-1.5 px-2 font-medium">{p.project}</td>
                                            <td className="py-1.5 px-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    p.priority === '1-Critica' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    p.priority === '2-Alta' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>{p.priority}</span>
                                            </td>
                                            <td className="py-1.5 px-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 text-right font-mono font-bold">{fmtFull(p.annual_budget)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB: EQUIPMENT
            ════════════════════════════════════════════════════════════ */}
            {tab === 'equipment' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <KPICard label="Equipment Tracked" value={kpiData.equipment_count || 0} variant="info" />
                        <KPICard label="Avg Cost / Equipment" value={fmt(kpiData.cost_per_equipment)} variant="success" />
                        <KPICard label="Total Maint. Budget" value={fmt(kpiData.total_maintenance_budget)} />
                    </div>

                    {/* Top equipment bar */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle icon={Package}>Top 20 Equipos por Costo</SectionTitle>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={equipCosts.slice(0, 20)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} />
                                <YAxis type="category" dataKey="description" width={160} tick={{ fontSize: 9 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="annual_budget" name="Budget Anual" radius={[0,4,4,0]}>
                                    {equipCosts.slice(0, 20).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Equipment Table */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle>Detalle Costos por Equipo</SectionTitle>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 px-2">Tag</th>
                                        <th className="py-2 px-2">Descripcion</th>
                                        <th className="py-2 px-2">Centro Costo</th>
                                        <th className="py-2 px-2 text-right">Budget Anual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipCosts.map((e, i) => (
                                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="py-1.5 px-2 font-mono text-primary">{e.equipment_tag}</td>
                                            <td className="py-1.5 px-2">{e.description}</td>
                                            <td className="py-1.5 px-2 text-muted-foreground">{e.cost_center}</td>
                                            <td className="py-1.5 px-2 text-right font-mono font-semibold">{fmtFull(e.annual_budget)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB: ROI CALCULATOR
            ════════════════════════════════════════════════════════════ */}
            {tab === 'roi' && (
                <div className="space-y-5">
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle icon={Calculator}>ROI Calculator -- Preventive vs Corrective</SectionTitle>
                        <div className="grid md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-muted-foreground">Equipment Tag</label>
                                <input className="w-full border rounded px-2 py-1.5 text-sm bg-background" value={roiForm.equipment_tag}
                                    onChange={e => setRoiForm({ ...roiForm, equipment_tag: e.target.value })}
                                    placeholder="e.g. BRY-SAG-ML-001" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Annual Breakdown Cost ($)</label>
                                <input type="number" className="w-full border rounded px-2 py-1.5 text-sm bg-background" value={roiForm.annual_breakdown_cost}
                                    onChange={e => setRoiForm({ ...roiForm, annual_breakdown_cost: +e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">PM Program Cost ($)</label>
                                <input type="number" className="w-full border rounded px-2 py-1.5 text-sm bg-background" value={roiForm.pm_program_cost}
                                    onChange={e => setRoiForm({ ...roiForm, pm_program_cost: +e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Avoided Breakdowns/Year</label>
                                <input type="number" className="w-full border rounded px-2 py-1.5 text-sm bg-background" value={roiForm.avoided_breakdowns_per_year}
                                    onChange={e => setRoiForm({ ...roiForm, avoided_breakdowns_per_year: +e.target.value })} />
                            </div>
                            <div className="flex items-end">
                                <button onClick={handleRoi} disabled={roiLoading}
                                    className="w-full px-4 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                    {roiLoading ? 'Calculating...' : 'Calculate ROI'}
                                </button>
                            </div>
                        </div>
                        {roiResult && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/30 rounded-lg border">
                                <div>
                                    <div className="text-xs text-muted-foreground">ROI</div>
                                    <div className="text-2xl font-bold text-green-700">{(roiResult.roi_pct || 0).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Net Savings</div>
                                    <div className="text-2xl font-bold">${(roiResult.net_savings || roiResult.annual_net_savings || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Payback Period</div>
                                    <div className="text-2xl font-bold">{(roiResult.payback_months || 0).toFixed(1)} months</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">NPV (5yr)</div>
                                    <div className="text-2xl font-bold">${(roiResult.npv_5yr || roiResult.npv || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        )}
                        {roiResult?.recommendation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                                <span className="font-semibold">Recommendation: </span>{roiResult.recommendation}
                            </div>
                        )}
                    </div>

                    {/* WO Stats */}
                    <div className="bg-card rounded-xl border p-5">
                        <SectionTitle icon={Wrench}>Work Order Statistics</SectionTitle>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <KPICard label="Total Work Orders" value={kpiData.wo_total || 0} />
                            <KPICard label="Completed" value={kpiData.wo_completed || 0} variant="success" />
                            <KPICard label="Completion Rate" value={`${kpiData.wo_completion_rate || 0}%`} variant="info" />
                            <KPICard label="Avg Duration" value={`${kpiData.wo_avg_hours || 0}h`} variant="warning" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
