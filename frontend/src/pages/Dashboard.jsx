import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard, LoadingSpinner, ProgressBar } from '../components/Shared';
import * as api from '../api';

const TREND_DATA = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    MTBF: 950 + Math.random() * 400,
    MTTR: 3.5 + Math.random() * 2,
    OEE: 85 + Math.random() * 10,
}));

export default function Dashboard() {
    const { plant } = useOutletContext();
    const [dash, setDash] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getExecutiveDashboard(plant),
            api.getDashboardAlerts(plant),
            api.getStats(),
            api.getKpiSummary(plant),
        ]).then(([d, a, s, k]) => {
            setDash(d.status === 'fulfilled' ? d.value : null);
            setAlerts(a.status === 'fulfilled' ? (a.value.alerts || a.value || []) : []);
            setStats(s.status === 'fulfilled' ? s.value : null);
            setKpis(k.status === 'fulfilled' ? k.value : null);
            setLoading(false);
        });
    }, [plant]);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;

    const totalNodes = stats?.total_nodes || 0;
    const alertList = Array.isArray(alerts) ? alerts : [];

    return (
        <div>
            <h1 className="page-title">📊 Executive Dashboard</h1>

            <div className="grid grid-6" style={{ marginBottom: 20 }}>
                <KPICard label="Equipment Health" value={kpis?.equipment_health || dash?.equipment_health || '—'} trend={kpis?.equipment_health_trend} trendDir="up" />
                <KPICard label="MTBF" value={kpis?.mtbf || dash?.mtbf || '—'} trend={kpis?.mtbf_trend} trendDir="up" variant="info" />
                <KPICard label="MTTR" value={kpis?.mttr || dash?.mttr || '—'} trend={kpis?.mttr_trend} trendDir="up" variant="info" />
                <KPICard label="OEE" value={kpis?.oee || dash?.oee || '—'} trend={kpis?.oee_trend} trendDir="up" />
                <KPICard label="Backlog Age" value={kpis?.backlog_age || dash?.backlog_age || '—'} trend={kpis?.backlog_trend} trendDir="up" variant="warning" />
                <KPICard label="ISO 55002" value={kpis?.iso_compliance || dash?.iso_compliance || '—'} trend={kpis?.iso_trend} trendDir="up" variant="purple" />
            </div>

            <div className="grid grid-2" style={{ marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">KPI Trends — Last 12 Months</span></div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={TREND_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="MTBF" stroke="#1B5E20" fill="#E8F5E9" strokeWidth={2} />
                            <Area type="monotone" dataKey="OEE" stroke="#0D47A1" fill="#E3F2FD" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">Active Alerts</span><span className="badge badge-danger">{alertList.length || dash?.critical_alerts || 0} critical</span></div>
                    <div>
                        {alertList.length > 0 ? alertList.slice(0, 5).map((a, i) => (
                            <div key={i} className={`alert-item ${(a.level || '').toLowerCase()}`}>
                                <div>
                                    <div className="alert-title">{a.level === 'CRITICAL' ? '🔴' : a.level === 'WARNING' ? '🟡' : '🟢'} {a.message || a.title || 'Alert'}</div>
                                    <div className="alert-time">{a.created_at || a.timestamp || ''}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <div className="empty-icon" style={{ fontSize: '2rem' }}>✅</div>
                                <h3>No active alerts</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header"><span className="card-title">Module Completion</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <ProgressBar label="Strategy Development" value={dash?.strategy_completion || 75} />
                        <ProgressBar label="Planning & Scheduling" value={dash?.planning_completion || 60} variant="info" />
                        <ProgressBar label="Field Operations" value={dash?.field_completion || 45} variant="warning" />
                        <ProgressBar label="Analytics & Reporting" value={dash?.analytics_completion || 85} />
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">System Status</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <span>Total Nodes</span><span className="badge badge-success">{totalNodes}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <span>Reports Generated</span><span className="badge badge-info">{dash?.total_reports || 0}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <span>Notifications</span><span className="badge badge-warning">{dash?.total_notifications || 0}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: '8px 0' }}>
                            <span>Backend Status</span><span className="badge badge-success">{stats ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
