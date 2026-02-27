import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import * as api from '../api';

export default function WorkPackages() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const confirm = useConfirm();
    const [wps, setWps] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('packages');
    const [sapUploads, setSapUploads] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listWorkPackages({ plant_id: plant }),
            api.listSapUploads({ plant_id: plant }),
        ]).then(([w, s]) => {
            setWps(w.status === 'fulfilled' ? (Array.isArray(w.value) ? w.value : w.value?.items || []) : []);
            setSapUploads(s.status === 'fulfilled' ? (Array.isArray(s.value) ? s.value : []) : []);
            setLoading(false);
        });
    }, [plant]);

    const handleApprove = async (id) => {
        const ok = await confirm('Approve Work Package', 'Are you sure you want to approve this work package?');
        if (!ok) return;
        try {
            await api.approveWorkPackage(id);
            const updated = await api.listWorkPackages({ plant_id: plant });
            setWps(Array.isArray(updated) ? updated : updated?.items || []);
            setSelected(prev => prev ? { ...prev, status: 'APPROVED' } : prev);
            toast.success('Work package approved');
        } catch (e) {
            toast.error('Approve failed: ' + e.message);
        }
    };

    const handleSendToSap = async () => {
        if (!selected) return;
        const ok = await confirm('Send to SAP', `Send work package "${selected.name || selected.work_package_id?.slice(0, 12)}" to SAP?`);
        if (!ok) return;
        try {
            await api.exportData({ format: 'sap', work_package_id: selected.work_package_id, plant_id: plant });
            toast.success('Work package sent to SAP');
            const uploads = await api.listSapUploads({ plant_id: plant });
            setSapUploads(Array.isArray(uploads) ? uploads : []);
        } catch (e) {
            toast.error('SAP export failed: ' + e.message);
        }
    };

    const stats = { total: wps.length, approved: wps.filter(w => w.status === 'APPROVED').length, review: wps.filter(w => w.status === 'REVIEWED' || w.status === 'PRESENTED').length, draft: wps.filter(w => w.status === 'DRAFT').length };

    return (
        <div>
            <h1 className="page-title">📦 Work Packages & SAP Export</h1>

            <div className="tabs" role="tablist">
                <button className={`tab${tab === 'packages' ? ' active' : ''}`} onClick={() => setTab('packages')} role="tab" aria-selected={tab === 'packages'}>📦 Work Packages</button>
                <button className={`tab${tab === 'sap' ? ' active' : ''}`} onClick={() => setTab('sap')} role="tab" aria-selected={tab === 'sap'}>📤 SAP Export</button>
            </div>

            {tab === 'packages' && (
                <>
                    <div className="grid grid-4" style={{ marginBottom: 16 }}>
                        <div className="kpi-card"><div className="kpi-label">Total WPs</div><div className="kpi-value">{stats.total}</div></div>
                        <div className="kpi-card" style={{ borderLeftColor: 'var(--success)' }}><div className="kpi-label">Approved</div><div className="kpi-value">{stats.approved}</div></div>
                        <div className="kpi-card" style={{ borderLeftColor: 'var(--info)' }}><div className="kpi-label">In Review</div><div className="kpi-value">{stats.review}</div></div>
                        <div className="kpi-card" style={{ borderLeftColor: 'var(--warning)' }}><div className="kpi-label">Draft</div><div className="kpi-value">{stats.draft}</div></div>
                    </div>

                    <div className="split-panel">
                        <div className="split-left">
                            <div className="card">
                                <div className="card-title" style={{ marginBottom: 12 }}>Work Packages</div>
                                {loading ? <LoadingSpinner /> : wps.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No work packages</p> : wps.map((wp, i) => (
                                    <div key={i} onClick={() => setSelected(wp)} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: selected?.work_package_id === wp.work_package_id ? 'var(--primary-lighter)' : '', borderLeft: selected?.work_package_id === wp.work_package_id ? '3px solid var(--primary)' : '3px solid transparent' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{wp.name || wp.work_package_id?.slice(0, 12)}</div>
                                        <div className="flex items-center gap-sm" style={{ marginTop: 4 }}>
                                            <StatusBadge status={wp.status} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{wp.task_count || 0} tasks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="split-right">
                            {selected ? (
                                <div className="card">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selected.name || 'Work Package'}</h2>
                                        <StatusBadge status={selected.status} />
                                    </div>
                                    <div className="flex gap-sm flex-wrap" style={{ marginBottom: 16 }}>
                                        <span className="meta-chip">Plant: {selected.plant_id || plant}</span>
                                        <span className="meta-chip">Duration: {selected.total_duration_hours || 0}h</span>
                                        <span className="meta-chip">Tasks: {selected.task_count || 0}</span>
                                    </div>
                                    {selected.tasks && selected.tasks.length > 0 && (
                                        <div style={{ marginBottom: 16, overflowX: 'auto' }}>
                                            <div className="form-label">Included Tasks</div>
                                            <table className="data-table">
                                                <thead><tr><th>Task</th><th>Type</th><th>Duration</th></tr></thead>
                                                <tbody>
                                                    {selected.tasks.map((t, i) => (
                                                        <tr key={i}><td>{t.description || t.task_id?.slice(0, 8)}</td><td className="mono">{t.task_type}</td><td>{t.duration_hours}h</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    <div className="flex gap-sm">
                                        {selected.status !== 'APPROVED' && <button className="btn btn-primary btn-sm" onClick={() => handleApprove(selected.work_package_id)}>✅ Approve</button>}
                                        <button className="btn btn-secondary btn-sm" onClick={handleSendToSap}>📤 Send to SAP</button>
                                    </div>
                                </div>
                            ) : <div className="card"><div className="empty-state"><div className="empty-icon">📦</div><h3>Select a Work Package</h3></div></div>}
                        </div>
                    </div>
                </>
            )}

            {tab === 'sap' && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>SAP Upload History</div>
                    {sapUploads.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead><tr><th>Upload ID</th><th>Template</th><th>Status</th><th>Records</th></tr></thead>
                                <tbody>
                                    {sapUploads.map((u, i) => (
                                        <tr key={i}><td className="mono">{(u.upload_id || '').slice(0, 8)}</td><td>{u.template_type || '—'}</td><td><StatusBadge status={u.status} /></td><td>{u.record_count || 0}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className="empty-state"><div className="empty-icon">📤</div><h3>No SAP Uploads</h3><p>Approve work packages to generate SAP upload files</p></div>}
                </div>
            )}
        </div>
    );
}
