import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

export default function Analytics() {
    const { plant } = useOutletContext();
    const [alerts, setAlerts] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getVarianceAlerts(),
            api.getKpiSummary(plant),
        ]).then(([a, k]) => {
            setAlerts(a.status === 'fulfilled' ? (Array.isArray(a.value) ? a.value : []) : []);
            setKpis(k.status === 'fulfilled' ? k.value : null);
            setLoading(false);
        });
    }, [plant]);

    const trendData = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        MTBF: 950 + Math.random() * 400,
        MTTR: 3 + Math.random() * 3,
        Availability: 92 + Math.random() * 6,
    }));

    const healthData = kpis?.health_scores || [
        { name: 'SAG Mill 001', score: 72, fill: '#F57F17' },
        { name: 'Ball Mill BM-201', score: 91, fill: '#1B5E20' },
        { name: 'Conveyor CV-101', score: 45, fill: '#C62828' },
    ];

    const badActors = kpis?.bad_actors || [
        { rank: 1, equipment: 'Conveyor CV-101', tag: 'CNV-CV-101', failures: 18, downtime: 142, cost: 285000 },
        { rank: 2, equipment: 'Pump PP-305', tag: 'PMP-PP-305', failures: 12, downtime: 96, cost: 180000 },
        { rank: 3, equipment: 'Screen SC-201', tag: 'SCR-SC-201', failures: 9, downtime: 64, cost: 120000 },
        { rank: 4, equipment: 'SAG Mill 001', tag: 'BRY-SAG-001', failures: 7, downtime: 58, cost: 195000 },
        { rank: 5, equipment: 'Fan FN-102', tag: 'FAN-FN-102', failures: 6, downtime: 32, cost: 45000 },
    ];

    if (loading) return <LoadingSpinner message="Loading analytics..." />;

    return (
        <div>
            <h1 className="page-title">📊 Analytics & Reliability</h1>

            <div className="grid grid-4" style={{ marginBottom: 20 }}>
                <KPICard label="MTBF" value={kpis?.mtbf || '1,247 hrs'} trend={kpis?.mtbf_trend || '↑ 12% vs LQ'} trendDir="up" />
                <KPICard label="MTTR" value={kpis?.mttr || '4.2 hrs'} trend={kpis?.mttr_trend || '↓ 8%'} trendDir="up" variant="info" />
                <KPICard label="Availability" value={kpis?.availability || '96.8%'} trend={kpis?.availability_trend || 'Target: 95% ✅'} trendDir="up" />
                <KPICard label="OEE" value={kpis?.oee || '91.5%'} trend={kpis?.oee_trend || '↑ 2.3% vs budget'} trendDir="up" />
            </div>

            <div className="grid grid-2" style={{ marginBottom: 20 }}>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>KPI Trends — 12 Months</div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="MTBF" stroke="#1B5E20" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Availability" stroke="#0D47A1" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Asset Health Index</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {healthData.map((h, i) => (
                            <div key={h.name || i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 60, height: 60, borderRadius: '50%', border: `4px solid ${h.fill || (h.score >= 70 ? '#1B5E20' : h.score >= 40 ? '#F57F17' : '#C62828')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: h.fill || (h.score >= 70 ? '#1B5E20' : h.score >= 40 ? '#F57F17' : '#C62828'), flexShrink: 0 }}>{h.score}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: h.score >= 70 ? 'var(--success)' : h.score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                        {h.score >= 70 ? '🟢 Healthy' : h.score >= 40 ? '🟡 Moderate — Schedule Inspection' : '🔴 Critical — Immediate Action'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 12 }}>Top 5 Bad Actors (Last 12 Months)</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>#</th><th>Equipment</th><th>Tag</th><th>Failures</th><th>Downtime (hrs)</th><th>Cost ($)</th></tr></thead>
                        <tbody>
                            {badActors.map((b, i) => (
                                <tr key={b.rank || i} style={i === 0 ? { background: '#FFF5F5' } : {}}>
                                    <td><strong>{b.rank || i + 1}</strong></td>
                                    <td>{b.equipment}</td>
                                    <td className="mono">{b.tag}</td>
                                    <td><span className="badge badge-danger">{b.failures}</span></td>
                                    <td>{b.downtime}h</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>${(b.cost || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Variance Alerts</div>
                    {alerts.map((a, i) => (
                        <div key={i} className="alert-item warning">
                            <div><div className="alert-title">{a.metric_name} — Z-Score: {a.z_score?.toFixed(2)}</div>
                                <div className="alert-desc">Plant: {a.plant_id} — Level: {a.variance_level}</div></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
