import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BarChart, Bar, LineChart, Line, ComposedChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    ReferenceLine, Cell,
} from 'recharts';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const COLORS = ['#1565C0', '#2E7D32', '#C62828', '#F57F17', '#6A1B9A'];

function SectionTitle({ children }) {
    return <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{children}</div>;
}

export default function Financial() {
    const { plant } = useOutletContext();
    const [data, setData] = useState(null);
    const [roiResult, setRoiResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roiLoading, setRoiLoading] = useState(false);

    // ROI form
    const [roiForm, setRoiForm] = useState({
        equipment_tag: '', annual_breakdown_cost: 50000,
        pm_program_cost: 15000, avoided_breakdowns_per_year: 3,
    });

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getFinancialSummary({ plant_id: plant }),
            api.getBudgetStatus({ plant_id: plant }),
        ]).then(([summary, budget]) => {
            setData({
                summary: summary.status === 'fulfilled' ? summary.value : {},
                budget: budget.status === 'fulfilled' ? budget.value : {},
            });
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

    if (loading) return <LoadingSpinner message="Cargando datos financieros..." />;

    const summary = data?.summary || {};
    const budget = data?.budget || {};
    const costBreakdown = summary.cost_breakdown || [];
    const monthlyCosts = summary.monthly_costs || [];

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Financial Dashboard — ROI & VPN</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard label="Total Annual Cost" value={`$${(summary.total_annual_cost || 0).toLocaleString()}`} />
                <KPICard label="PM vs CM Ratio" value={`${(summary.pm_cm_ratio || 0).toFixed(1)}%`} variant="info" />
                <KPICard label="Budget Utilization" value={`${(budget.utilization_pct || 0).toFixed(1)}%`} />
                <KPICard label="Cost Avoidance" value={`$${(summary.cost_avoidance || 0).toLocaleString()}`} variant="success" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Monthly Cost Trend */}
                <div className="bg-card rounded-xl border p-5">
                    <SectionTitle>Monthly Cost Trend</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={monthlyCosts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="corrective" name="Corrective" fill="#C62828" />
                            <Bar dataKey="preventive" name="Preventive" fill="#2E7D32" />
                            <Line dataKey="total" name="Total" stroke="#1565C0" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Cost Breakdown by Area */}
                <div className="bg-card rounded-xl border p-5">
                    <SectionTitle>Cost Breakdown by Area</SectionTitle>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={costBreakdown} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="area" tick={{ fontSize: 10 }} width={100} />
                            <Tooltip />
                            <Bar dataKey="cost" name="Cost ($)">
                                {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-card rounded-xl border p-5">
                <SectionTitle>ROI Calculator — Preventive vs Corrective</SectionTitle>
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-muted-foreground">Equipment Tag</label>
                        <input className="w-full border rounded px-2 py-1 text-sm" value={roiForm.equipment_tag}
                            onChange={e => setRoiForm({ ...roiForm, equipment_tag: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Annual Breakdown Cost ($)</label>
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={roiForm.annual_breakdown_cost}
                            onChange={e => setRoiForm({ ...roiForm, annual_breakdown_cost: +e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">PM Program Cost ($)</label>
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={roiForm.pm_program_cost}
                            onChange={e => setRoiForm({ ...roiForm, pm_program_cost: +e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Avoided Breakdowns/Year</label>
                        <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={roiForm.avoided_breakdowns_per_year}
                            onChange={e => setRoiForm({ ...roiForm, avoided_breakdowns_per_year: +e.target.value })} />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleRoi} disabled={roiLoading}
                            className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50">
                            {roiLoading ? 'Calculating...' : 'Calculate ROI'}
                        </button>
                    </div>
                </div>
                {roiResult && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                        <div><div className="text-xs text-muted-foreground">ROI</div><div className="text-xl font-bold text-green-700">{(roiResult.roi_pct || 0).toFixed(1)}%</div></div>
                        <div><div className="text-xs text-muted-foreground">Net Savings</div><div className="text-xl font-bold">${(roiResult.net_savings || 0).toLocaleString()}</div></div>
                        <div><div className="text-xs text-muted-foreground">Payback Period</div><div className="text-xl font-bold">{(roiResult.payback_months || 0).toFixed(1)} months</div></div>
                        <div><div className="text-xs text-muted-foreground">NPV (5yr)</div><div className="text-xl font-bold">${(roiResult.npv_5yr || 0).toLocaleString()}</div></div>
                    </div>
                )}
            </div>
        </div>
    );
}
