/**
 * Executive Views — Dedicated pages for each manager sidebar module.
 * Ported from reference design (Diseño esperado), translated to Spanish.
 */
import { useOutletContext } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
    Shield, AlertTriangle, TrendingUp, TrendingDown, Factory,
    Activity, Clock, Gauge, Target, DollarSign,
    ShieldCheck, Eye, Calendar, AlertCircle, BarChart3, CheckCircle2,
} from 'lucide-react';

/* ── Shared helpers ──────────────────────────────────────────────────────── */
const chartTooltip = { backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 };
const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' };

function KPIBox({ icon: Icon, value, sublabel, label, iconBg, iconColor, badge }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg border ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                {badge && <span className={`text-xs font-semibold ${badge.color}`}>{badge.text}</span>}
            </div>
            <div className="mb-1">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {sublabel && <div className="text-sm text-muted-foreground mt-1">{sublabel}</div>}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
        </div>
    );
}

function SectionTitle({ children }) {
    return <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{children}</h3>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. GESTIÓN DE RIESGOS
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecRiskManagement() {
    const { plant } = useOutletContext();
    const riskTrend = [
        { week: 'S1', operational: 68, safety: 45, environmental: 32, financial: 55 },
        { week: 'S2', operational: 72, safety: 48, environmental: 35, financial: 58 },
        { week: 'S3', operational: 65, safety: 42, environmental: 38, financial: 52 },
        { week: 'S4', operational: 70, safety: 50, environmental: 40, financial: 60 },
    ];
    const riskByArea = [
        { area: 'Trituración', score: 78, exposure: '$95k/día' },
        { area: 'Molienda', score: 87, exposure: '$120k/día' },
        { area: 'Flotación', score: 62, exposure: '$65k/día' },
        { area: 'Espesamiento', score: 75, exposure: '$45k/día' },
        { area: 'Relaves', score: 68, exposure: '$35k/día' },
    ];
    const topRiskAssets = [
        { asset: 'Molino de Bolas #1', area: 'Molienda', riskScore: 92, probability: 'Alta', impact: '$120k/día', status: 'En Progress', plan: 'Reemplazo de rodamientos programado para próxima parada' },
        { asset: 'Trituradora Primaria', area: 'Trituración', riskScore: 87, probability: 'Alta', impact: '$95k/día', status: 'Planificado', plan: 'Inspección de revestimientos y guardas' },
        { asset: 'Bomba Principal P-201', area: 'Bombeo', riskScore: 85, probability: 'Crítica', impact: '$85k/día', status: 'Activo', plan: 'Bomba standby activa, reemplazo de sellos urgente' },
        { asset: 'Espesador #3', area: 'Espesamiento', riskScore: 78, probability: 'Media', impact: '$45k/día', status: 'Monitoreo', plan: 'Plan de respuesta de emergencia actualizado' },
        { asset: 'Motor SAG Mill', area: 'Molienda', riskScore: 72, probability: 'Media', impact: '$110k/día', status: 'Planificado', plan: 'Alineación de motor y monitoreo de vibración' },
    ];

    const probColor = (p) => p === 'Crítica' ? 'bg-red-100 text-red-700' : p === 'Alta' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';
    const statusColor = (s) => s === 'Activo' ? 'bg-green-100 text-green-700' : s === 'En Progress' ? 'bg-blue-100 text-blue-700' : s === 'Planificado' ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground';

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Gestión de Riesgos</h2><p className="text-muted-foreground text-sm">Exposición estratégica al riesgo y supervisión de mitigación — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={AlertTriangle} value="78" label="Score Promedio de Riesgo" iconBg="bg-red-50 border-red-200" iconColor="text-red-600" />
                <KPIBox icon={Shield} value="12" label="Activos de Alto Riesgo" iconBg="bg-orange-50 border-orange-200" iconColor="text-orange-600" />
                <KPIBox icon={Factory} value="$540k" sublabel="por día de exposición" label="Exposición Producción" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" />
                <KPIBox icon={TrendingUp} value="8" label="Planes de Mitigación Activos" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" badge={{ text: '↓ 12%', color: 'text-emerald-600' }} />
            </div>
            <div>
                <SectionTitle>Trend de Exposición al Riesgo por Categoría</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={riskTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="week" tick={axisTick} stroke="var(--border)" />
                            <YAxis domain={[0, 100]} tick={axisTick} stroke="var(--border)" />
                            <Tooltip contentStyle={chartTooltip} />
                            <Legend />
                            <Line type="monotone" dataKey="operational" stroke="#f97316" strokeWidth={2} name="Riesgo Operacional" />
                            <Line type="monotone" dataKey="safety" stroke="#ef4444" strokeWidth={2} name="Riesgo Seguridad" />
                            <Line type="monotone" dataKey="environmental" stroke="#10b981" strokeWidth={2} name="Riesgo Ambiental" />
                            <Line type="monotone" dataKey="financial" stroke="#3b82f6" strokeWidth={2} name="Riesgo Financiero" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Score de Riesgo por Área de Planta</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={riskByArea}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="area" tick={axisTick} stroke="var(--border)" />
                            <YAxis domain={[0, 100]} tick={axisTick} stroke="var(--border)" />
                            <Tooltip contentStyle={chartTooltip} />
                            <Bar dataKey="score" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Activos de Mayor Riesgo — Estado de Mitigación</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted border-b border-border">
                            <tr>{['Activo', 'Área', 'Score', 'Probabilidad', 'Impacto', 'Estado', 'Plan de Mitigación'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {topRiskAssets.map((a, i) => (
                                <tr key={i} className="hover:bg-muted transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{a.asset}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{a.area}</td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-lg font-bold text-red-600">{a.riskScore}</span><div className="w-16 bg-muted rounded-full h-2 overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${a.riskScore}%` }} /></div></div></td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${probColor(a.probability)}`}>{a.probability}</span></td>
                                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{a.impact}</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(a.status)}`}>{a.status}</span></td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{a.plan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CONFIABILIDAD DE PLANTA
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecPlantReliability() {
    const { plant } = useOutletContext();
    const mtbfTrend = [{ month: 'Ene', mtbf: 720 }, { month: 'Feb', mtbf: 680 }, { month: 'Mar', mtbf: 750 }, { month: 'Abr', mtbf: 710 }, { month: 'May', mtbf: 780 }, { month: 'Jun', mtbf: 820 }];
    const mttrTrend = [{ month: 'Ene', mttr: 4.5 }, { month: 'Feb', mttr: 5.2 }, { month: 'Mar', mttr: 4.8 }, { month: 'Abr', mttr: 4.2 }, { month: 'May', mttr: 3.9 }, { month: 'Jun', mttr: 3.5 }];
    const availByArea = [{ area: 'Trituración', availability: 96.5 }, { area: 'Molienda', availability: 94.2 }, { area: 'Flotación', availability: 97.8 }, { area: 'Espesamiento', availability: 95.5 }, { area: 'Relaves', availability: 98.2 }];
    const pareto = [{ cause: 'Fallas de Rodamientos', hours: 124, pct: 28 }, { cause: 'Problemas Eléctricos', hours: 98, pct: 22 }, { cause: 'Fugas de Sellos', hours: 85, pct: 19 }, { cause: 'Fallas de Correas', hours: 67, pct: 15 }, { cause: 'Lubricación', hours: 45, pct: 10 }, { cause: 'Otros', hours: 26, pct: 6 }];

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Reliability de Planta</h2><p className="text-muted-foreground text-sm">Indicadores de rendimiento y confiabilidad de equipos — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={TrendingUp} value="820h" label="MTBF (Actual)" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" badge={{ text: '↑ 14%', color: 'text-emerald-600' }} />
                <KPIBox icon={Clock} value="3.5h" label="MTTR (Actual)" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" badge={{ text: '↓ 22%', color: 'text-blue-600' }} />
                <KPIBox icon={Gauge} value="96.4%" label="Efectividad General (OEE)" iconBg="bg-purple-50 border-purple-200" iconColor="text-purple-600" badge={{ text: 'Meta: 95%', color: 'text-purple-600' }} />
                <KPIBox icon={Activity} value="445h" label="Tiempo Fuera de Servicio (YTD)" iconBg="bg-orange-50 border-orange-200" iconColor="text-orange-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Trend MTBF (Hours)</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={mtbfTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Line type="monotone" dataKey="mtbf" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name="MTBF" /></LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Trend MTTR (Hours)</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={mttrTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Line type="monotone" dataKey="mttr" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="MTTR" /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Availability de Equipos por Área</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={availByArea}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="area" tick={axisTick} stroke="var(--border)" /><YAxis domain={[90, 100]} tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} formatter={(v) => `${v}%`} /><Bar dataKey="availability" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Análisis Pareto de Tiempo Fuera de Servicio</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full"><thead className="bg-muted border-b border-border"><tr>{['Failure Cause', 'Hours (YTD)', '% of Total', 'Distribution'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">{pareto.map((p, i) => (
                            <tr key={i} className="hover:bg-muted"><td className="px-6 py-4 text-sm font-semibold text-foreground">{p.cause}</td><td className="px-6 py-4 text-sm font-bold text-foreground">{p.hours}h</td><td className="px-6 py-4 text-sm font-semibold text-orange-600">{p.pct}%</td><td className="px-6 py-4"><div className="flex-1 bg-muted rounded-full h-3 overflow-hidden max-w-md"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.pct * 3}%` }} /></div></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. DESEMPEÑO DE MANTENIMIENTO
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecMaintPerformance() {
    const { plant } = useOutletContext();
    const plannedVs = [{ month: 'Ene', planned: 68, unplanned: 32 }, { month: 'Feb', planned: 65, unplanned: 35 }, { month: 'Mar', planned: 70, unplanned: 30 }, { month: 'Abr', planned: 72, unplanned: 28 }, { month: 'May', planned: 74, unplanned: 26 }, { month: 'Jun', planned: 76, unplanned: 24 }];
    const completionRate = [{ month: 'Ene', rate: 82 }, { month: 'Feb', rate: 79 }, { month: 'Mar', rate: 85 }, { month: 'Abr', rate: 84 }, { month: 'May', rate: 88 }, { month: 'Jun', rate: 90 }];
    const backlogRisk = [{ category: 'Crítico', count: 12, hours: 156 }, { category: 'Alto', count: 28, hours: 342 }, { category: 'Medio', count: 54, hours: 485 }, { category: 'Bajo', count: 89, hours: 612 }];
    const perfByArea = [{ area: 'Molienda', completion: 88, plannedPct: 74, backlog: 42 }, { area: 'Trituración', completion: 92, plannedPct: 78, backlog: 28 }, { area: 'Flotación', completion: 95, plannedPct: 82, backlog: 18 }, { area: 'Espesamiento', completion: 91, plannedPct: 76, backlog: 24 }, { area: 'Relaves', completion: 89, plannedPct: 80, backlog: 15 }];

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Desempeño de Mantenimiento</h2><p className="text-muted-foreground text-sm">Indicadores clave de desempeño y métricas de ejecución — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={TrendingUp} value="76%" sublabel="Meta: 80%" label="% Mantenimiento Planificado" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" badge={{ text: '↑ 8%', color: 'text-emerald-600' }} />
                <KPIBox icon={CheckCircle2} value="90%" sublabel="Este mes" label="Tasa de Completitud" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" badge={{ text: '↑ 5%', color: 'text-blue-600' }} />
                <KPIBox icon={AlertCircle} value="183" sublabel="ítems" label="Backlog Total" iconBg="bg-orange-50 border-orange-200" iconColor="text-orange-600" badge={{ text: '↑ 12', color: 'text-orange-600' }} />
                <KPIBox icon={BarChart3} value="1,595h" sublabel="horas de backlog" label="Exposición de Backlog" iconBg="bg-purple-50 border-purple-200" iconColor="text-purple-600" />
            </div>
            <div>
                <SectionTitle>Trend Mantenimiento Planificado vs No Planificado</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}><BarChart data={plannedVs}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis domain={[0, 100]} tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} formatter={(v) => `${v}%`} /><Legend /><Bar dataKey="planned" stackId="a" fill="#10b981" name="Planificado %" /><Bar dataKey="unplanned" stackId="a" fill="#ef4444" name="No Planificado %" /></BarChart></ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Trend Tasa de Completitud</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}><LineChart data={completionRate}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis domain={[70, 100]} tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} formatter={(v) => `${v}%`} /><Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} /></LineChart></ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Exposición de Riesgo del Backlog</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full"><thead className="bg-muted border-b border-border"><tr>{['Priority', 'Orders', 'Total Hours', 'Risk Level'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">{backlogRisk.map((r, i) => (
                            <tr key={i} className="hover:bg-muted"><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${r.category === 'Crítico' ? 'bg-red-100 text-red-700' : r.category === 'Alto' ? 'bg-orange-100 text-orange-700' : r.category === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{r.category}</span></td><td className="px-6 py-4 text-lg font-bold text-foreground">{r.count}</td><td className="px-6 py-4 text-lg font-bold text-foreground">{r.hours}h</td><td className="px-6 py-4">{r.category === 'Crítico' || r.category === 'Alto' ? <span className="flex items-center gap-2 text-red-600"><AlertCircle className="w-4 h-4" /><span className="text-xs font-semibold">Alto Riesgo</span></span> : <span className="text-xs font-semibold text-blue-600">Manejable</span>}</td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
            <div>
                <SectionTitle>Resumen de Desempeño por Área</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full"><thead className="bg-muted border-b border-border"><tr>{['Área', 'Tasa Completitud', '% Planificado', 'Backlog', 'Estado'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">{perfByArea.map((a, i) => (
                            <tr key={i} className="hover:bg-muted"><td className="px-6 py-4 text-sm font-semibold text-foreground">{a.area}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="text-lg font-bold text-blue-600">{a.completion}%</span><div className="w-20 bg-muted rounded-full h-2 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${a.completion}%` }} /></div></div></td><td className="px-6 py-4 text-sm font-semibold text-emerald-600">{a.plannedPct}%</td><td className="px-6 py-4 text-sm font-bold text-foreground">{a.backlog}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${a.completion >= 90 ? 'bg-emerald-100 text-emerald-700' : a.completion >= 85 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.completion >= 90 ? 'Excelente' : a.completion >= 85 ? 'Bueno' : 'Requiere Atención'}</span></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. FINANZAS DE MANTENIMIENTO
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecMaintFinancials() {
    const { plant } = useOutletContext();
    const costTrend = [{ month: 'Ene', planned: 195000, unplanned: 65000, total: 260000 }, { month: 'Feb', planned: 210000, unplanned: 72000, total: 282000 }, { month: 'Mar', planned: 188000, unplanned: 58000, total: 246000 }, { month: 'Abr', planned: 205000, unplanned: 68000, total: 273000 }, { month: 'May', planned: 218000, unplanned: 61000, total: 279000 }, { month: 'Jun', planned: 225000, unplanned: 55000, total: 280000 }];
    const costByArea = [{ area: 'Molienda', cost: 485000, budget: 520000, variance: -6.7 }, { area: 'Trituración', cost: 342000, budget: 350000, variance: -2.3 }, { area: 'Flotación', cost: 298000, budget: 280000, variance: 6.4 }, { area: 'Espesamiento', cost: 215000, budget: 230000, variance: -6.5 }, { area: 'Relaves', cost: 175000, budget: 165000, variance: 6.1 }];
    const breakdown = [{ category: 'Mano de Obra', value: 42, color: '#3b82f6' }, { category: 'Spare parts', value: 35, color: '#10b981' }, { category: 'Contratistas', value: 15, color: '#f59e0b' }, { category: 'Tools', value: 8, color: '#8b5cf6' }];

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Finanzas de Mantenimiento</h2><p className="text-muted-foreground text-sm">Seguimiento de presupuesto y gestión de costos — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={DollarSign} value="$2.42M" sublabel="YTD Real" label="Costo Total Mantenimiento" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" badge={{ text: 'vs Budget', color: 'text-orange-600' }} />
                <KPIBox icon={TrendingUp} value="$1.74M" sublabel="YTD Real" label="Mantenimiento Planificado" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" badge={{ text: '72%', color: 'text-emerald-600' }} />
                <KPIBox icon={TrendingDown} value="$680k" sublabel="YTD Real" label="Mantenimiento No Planificado" iconBg="bg-red-50 border-red-200" iconColor="text-red-600" badge={{ text: '28%', color: 'text-red-600' }} />
                <KPIBox icon={DollarSign} value="$280k" sublabel="Este mes" label="Tasa Mensual Actual" iconBg="bg-purple-50 border-purple-200" iconColor="text-purple-600" badge={{ text: '↓ $125k', color: 'text-emerald-600' }} />
            </div>
            <div>
                <SectionTitle>Trend de Costos — Planificado vs No Planificado</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={350}><LineChart data={costTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip contentStyle={chartTooltip} formatter={(v) => `$${v.toLocaleString()}`} /><Legend /><Line type="monotone" dataKey="planned" stroke="#10b981" strokeWidth={2} name="Planificado" /><Line type="monotone" dataKey="unplanned" stroke="#ef4444" strokeWidth={2} name="No Planificado" /><Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" name="Total" /></LineChart></ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Desglose de Costos por Categoría</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={breakdown} cx="50%" cy="50%" labelLine={false} label={({ category, value }) => `${category}: ${value}%`} outerRadius={90} dataKey="value">{breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Variación Presupuestal por Área</SectionTitle>
                    <div className="space-y-4 mt-2">{costByArea.map((a, i) => (
                        <div key={i}><div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-foreground">{a.area}</span><div className="text-right"><div className="text-sm font-bold text-foreground">${(a.cost / 1000).toFixed(0)}k / ${(a.budget / 1000).toFixed(0)}k</div><div className={`text-xs font-semibold ${a.variance < 0 ? 'text-emerald-600' : 'text-red-600'}`}>{a.variance > 0 ? '+' : ''}{a.variance.toFixed(1)}%</div></div></div><div className="relative w-full bg-muted rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${a.variance < 0 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${(a.cost / a.budget) * 100}%` }} /></div></div>
                    ))}</div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. SEGURIDAD Y CUMPLIMIENTO
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecSafetyCompliance() {
    const { plant } = useOutletContext();
    const trirTrend = [{ month: 'Ene', trir: 0.65 }, { month: 'Feb', trir: 0.58 }, { month: 'Mar', trir: 0.52 }, { month: 'Abr', trir: 0.48 }, { month: 'May', trir: 0.45 }, { month: 'Jun', trir: 0.42 }];
    const nearMiss = [{ area: 'Molienda', count: 12 }, { area: 'Trituración', count: 8 }, { area: 'Flotación', count: 5 }, { area: 'Espesamiento', count: 4 }, { area: 'Relaves', count: 3 }];
    const metrics = [{ metric: 'Near-Miss Reports', value: 32, trend: '↑', change: 15, status: 'positive' }, { metric: 'Safety Observations', value: 128, trend: '↑', change: 22, status: 'positive' }, { metric: 'Training Hours', value: 456, trend: '↑', change: 12, status: 'positive' }, { metric: 'Audits Completed', value: 18, trend: '→', change: 0, status: 'neutral' }];

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Seguridad y Cumplimiento</h2><p className="text-muted-foreground text-sm">Desempeño de seguridad en mantenimiento y seguimiento de cumplimiento — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={ShieldCheck} value="0.42" sublabel="Mejor industria: 0.35" label="TRIR" iconBg="bg-green-50 border-green-200" iconColor="text-green-600" badge={{ text: '↓ 35%', color: 'text-green-600' }} />
                <KPIBox icon={AlertTriangle} value="32" sublabel="YTD" label="Reportes de Cuasi-Accidentes" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" badge={{ text: '↑ 15%', color: 'text-blue-600' }} />
                <KPIBox icon={Eye} value="128" sublabel="YTD" label="Observations de Seguridad" iconBg="bg-purple-50 border-purple-200" iconColor="text-purple-600" badge={{ text: '↑ 22%', color: 'text-purple-600' }} />
                <KPIBox icon={Calendar} value="182" sublabel="Récord: 245 días" label="Días Sin Incidente con Tiempo Perdido" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" />
            </div>
            <div>
                <SectionTitle>Trend TRIR (6 Meses)</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}><LineChart data={trirTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={axisTick} stroke="var(--border)" /><YAxis domain={[0, 1]} tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Line type="monotone" dataKey="trir" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} /></LineChart></ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Cuasi-Accidentes por Área (YTD)</SectionTitle>
                <div className="bg-card border border-border rounded-lg p-5">
                    <ResponsiveContainer width="100%" height={300}><BarChart data={nearMiss}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="area" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Métricas de Desempeño de Seguridad</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full"><thead className="bg-muted border-b border-border"><tr>{['Métrica', 'Valor Actual (YTD)', 'Trend', 'vs Año Previous', 'Estado'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">{metrics.map((m, i) => (
                            <tr key={i} className="hover:bg-muted"><td className="px-6 py-4 text-sm font-semibold text-foreground">{m.metric}</td><td className="px-6 py-4 text-lg font-bold text-foreground">{m.value}</td><td className="px-6 py-4 text-lg">{m.trend}</td><td className="px-6 py-4"><span className={`text-sm font-semibold ${m.status === 'positive' ? 'text-emerald-600' : 'text-muted-foreground'}`}>{m.change > 0 ? '+' : ''}{m.change}%</span></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${m.status === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{m.status === 'positive' ? 'Mejorando' : 'Estable'}</span></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. CRITICIDAD DE ACTIVOS
   ═══════════════════════════════════════════════════════════════════════════ */
export function ExecAssetCriticality() {
    const { plant } = useOutletContext();
    const distribution = [{ level: 'Crítico', count: 24, color: '#ef4444' }, { level: 'Alto', count: 38, color: '#f97316' }, { level: 'Medio', count: 67, color: '#eab308' }, { level: 'Bajo', count: 142, color: '#3b82f6' }];
    const byArea = [{ area: 'Molienda', critical: 8, high: 12, medium: 18 }, { area: 'Trituración', critical: 6, high: 10, medium: 14 }, { area: 'Flotación', critical: 4, high: 8, medium: 15 }, { area: 'Espesamiento', critical: 3, high: 5, medium: 10 }, { area: 'Relaves', critical: 3, high: 3, medium: 10 }];
    const assets = [
        { asset: 'Molino de Bolas #1', area: 'Molienda', criticality: 'Crítico', impact: '$120k/día', safetyRisk: 'Alto', envRisk: 'Medio', redundancy: 'Ninguna', strategy: 'Predictivo + Preventivo' },
        { asset: 'Trituradora Primaria', area: 'Trituración', criticality: 'Crítico', impact: '$95k/día', safetyRisk: 'Crítico', envRisk: 'Bajo', redundancy: 'Ninguna', strategy: 'Basado en Condición' },
        { asset: 'Molino SAG', area: 'Molienda', criticality: 'Crítico', impact: '$110k/día', safetyRisk: 'Alto', envRisk: 'Medio', redundancy: 'Ninguna', strategy: 'Predictivo' },
        { asset: 'Bomba P-201', area: 'Bombeo', criticality: 'Crítico', impact: '$85k/día', safetyRisk: 'Medio', envRisk: 'Alto', redundancy: 'Standby Disponible', strategy: 'Preventivo' },
        { asset: 'Espesador #3', area: 'Espesamiento', criticality: 'Alto', impact: '$45k/día', safetyRisk: 'Bajo', envRisk: 'Crítico', redundancy: 'Ninguna', strategy: 'Basado en Condición' },
    ];
    const critColor = (l) => l === 'Crítico' ? 'bg-red-100 text-red-700 border-red-300' : l === 'Alto' ? 'bg-orange-100 text-orange-700 border-orange-300' : l === 'Medio' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-blue-100 text-blue-700 border-blue-300';
    const riskColor = (r) => r === 'Crítico' ? 'bg-red-100 text-red-700' : r === 'Alto' ? 'bg-orange-100 text-orange-700' : r === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700';

    return (
        <div className="space-y-6">
            <div><h2 className="text-2xl text-foreground font-semibold mb-1">Criticidad de Activos</h2><p className="text-muted-foreground text-sm">Clasificación estratégica de activos y evaluación de criticidad — {plant}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIBox icon={AlertCircle} value="24" label="Activos Críticos" iconBg="bg-red-50 border-red-200" iconColor="text-red-600" />
                <KPIBox icon={Target} value="38" label="Alta Criticidad" iconBg="bg-orange-50 border-orange-200" iconColor="text-orange-600" />
                <KPIBox icon={Factory} value="$890k" sublabel="por día total" label="Impacto Producción Activos Críticos" iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600" />
                <KPIBox icon={Shield} value="12%" label="Activos con Redundancia" iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Distribución de Criticidad de Activos</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}><BarChart data={distribution}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="level" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="count" radius={[4, 4, 0, 0]}>{distribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Activos Críticos por Área</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}><BarChart data={byArea}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="area" tick={axisTick} stroke="var(--border)" /><YAxis tick={axisTick} stroke="var(--border)" /><Tooltip contentStyle={chartTooltip} /><Legend /><Bar dataKey="critical" stackId="a" fill="#ef4444" name="Crítico" /><Bar dataKey="high" stackId="a" fill="#f97316" name="Alto" /><Bar dataKey="medium" stackId="a" fill="#eab308" name="Medio" /></BarChart></ResponsiveContainer>
                </div>
            </div>
            <div>
                <SectionTitle>Registro de Activos Críticos</SectionTitle>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full"><thead className="bg-muted border-b border-border"><tr>{['Activo', 'Área', 'Criticidad', 'Impacto Producción', 'Riesgo Seguridad', 'Riesgo Ambiental', 'Redundancia', 'Estrategia'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">{assets.map((a, i) => (
                            <tr key={i} className="hover:bg-muted"><td className="px-6 py-4 text-sm font-semibold text-foreground">{a.asset}</td><td className="px-6 py-4 text-sm text-muted-foreground">{a.area}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${critColor(a.criticality)}`}>{a.criticality}</span></td><td className="px-6 py-4 text-sm font-semibold text-foreground">{a.impact}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor(a.safetyRisk)}`}>{a.safetyRisk}</span></td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor(a.envRisk)}`}>{a.envRisk}</span></td><td className="px-6 py-4"><span className={`text-xs font-medium ${a.redundancy === 'Ninguna' ? 'text-red-600' : 'text-emerald-600'}`}>{a.redundancy}</span></td><td className="px-6 py-4 text-sm text-muted-foreground">{a.strategy}</td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
