import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

export default function Reports() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [reports, setReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('monthly');
    const [generating, setGenerating] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listReports({ plant_id: plant }),
            api.listNotifications({ plant_id: plant }),
        ]).then(([r, n]) => {
            setReports(r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : []) : []);
            setNotifications(n.status === 'fulfilled' ? (Array.isArray(n.value) ? n.value : []) : []);
            setLoading(false);
        });
    }, [plant]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const gen = reportType === 'monthly' ? api.generateMonthlyReport : api.generateWeeklyReport;
            const res = await gen({ plant_id: plant, month: new Date().getMonth() + 1, week: 1, year: new Date().getFullYear() });
            setPreview(res);
            toast.success(`${reportType} report generated`);
            const updated = await api.listReports({ plant_id: plant });
            setReports(Array.isArray(updated) ? updated : []);
        } catch (e) {
            toast.error('Report generation failed: ' + e.message);
        }
        setGenerating(false);
    };

    const handleExport = async (format) => {
        try {
            await api.exportData({ format, plant_id: plant, report_id: preview?.report_id });
            toast.success(`Export ${format.toUpperCase()} initiated`);
        } catch (e) {
            toast.error(`Export failed: ${e.message}`);
        }
    };

    const handleAckNotification = async (id) => {
        try {
            await api.acknowledgeNotification(id);
            setNotifications(prev => prev.filter(n => n.notification_id !== id));
            toast.success('Notification acknowledged');
        } catch (e) {
            toast.error('Failed to acknowledge: ' + e.message);
        }
    };

    return (
        <div>
            <h1 className="page-title">📄 Reports & Data Export</h1>

            <div className="card" style={{ marginBottom: 20, padding: '12px 20px' }}>
                <div className="flex items-center gap" style={{ flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 200 }} value={reportType} onChange={e => setReportType(e.target.value)} aria-label="Report type">
                        <option value="weekly">Weekly KPI Report</option>
                        <option value="monthly">Monthly KPI Report</option>
                    </select>
                    <span className="meta-chip">Plant: {plant}</span>
                    <span className="meta-chip">Period: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>{generating ? '⏳ Generating...' : '📊 Generate Report'}</button>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: 20 }}>
                <div>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>Report Preview</div>
                        {preview ? (
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
                                    {preview.report_type || reportType} Report — {preview.plant_id || plant}
                                </h3>
                                {preview.sections && typeof preview.sections === 'object' && Object.entries(preview.sections).map(([k, v]) => (
                                    <div key={k} style={{ marginBottom: 12 }}>
                                        <div className="form-label">{k.replace(/_/g, ' ')}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</div>
                                    </div>
                                ))}
                                {preview.kpis && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table">
                                            <thead><tr><th>KPI</th><th>Value</th><th>Target</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {Object.entries(preview.kpis).map(([k, v]) => (
                                                    <tr key={k}>
                                                        <td>{k.replace(/_/g, ' ').toUpperCase()}</td>
                                                        <td style={{ fontWeight: 600 }}>{typeof v === 'object' ? v.value : v}</td>
                                                        <td>{typeof v === 'object' ? v.target : '—'}</td>
                                                        <td>{typeof v === 'object' && v.status ? <StatusBadge status={v.status} /> : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="flex gap-sm" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleExport('pdf')}>📄 Export PDF</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleExport('xlsx')}>📊 Export Excel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state"><div className="empty-icon">📄</div><h3>Generate a report</h3><p>Select a report type and click Generate</p></div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-title" style={{ marginBottom: 12 }}>Recent Reports</div>
                        {reports.length > 0 ? reports.slice(0, 8).map((r, i) => (
                            <div key={i} onClick={() => setPreview(r)} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{r.report_type || 'Report'}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.created_at || r.generated_at || ''}</div></div>
                                <StatusBadge status={r.status || 'GENERATED'} />
                            </div>
                        )) : <p style={{ color: 'var(--text-muted)' }}>No reports generated yet</p>}
                    </div>

                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 12 }}>Active Notifications</div>
                        {notifications.length > 0 ? notifications.slice(0, 6).map((n, i) => (
                            <div key={i} className={`alert-item ${(n.level || '').toLowerCase()}`}>
                                <div style={{ flex: 1 }}>
                                    <div className="alert-title">{n.level === 'CRITICAL' ? '🔴' : n.level === 'WARNING' ? '🟡' : '🟢'} {n.message || n.title}</div>
                                    <div className="alert-time">{n.created_at || ''}</div>
                                </div>
                                {n.notification_id && (
                                    <button className="btn btn-sm" style={{ flexShrink: 0 }} onClick={() => handleAckNotification(n.notification_id)}>✓</button>
                                )}
                            </div>
                        )) : <p style={{ color: 'var(--text-muted)' }}>No active notifications</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
