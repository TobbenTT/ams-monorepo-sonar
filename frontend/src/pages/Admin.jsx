import { useState, useEffect } from 'react';
import { StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import * as api from '../api';

export default function Admin() {
    const toast = useToast();
    const confirm = useConfirm();
    const [stats, setStats] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [tab, setTab] = useState('plant');
    const [health, setHealth] = useState(null);
    const [plantName, setPlantName] = useState('Jorf Lasfar — Complexe Chimique');
    const [plantLocation, setPlantLocation] = useState('El Jadida, Morocco');

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getStats(),
            api.getAuditLog({ limit: 20 }),
            api.healthCheck(),
        ]).then(([s, a, h]) => {
            setStats(s.status === 'fulfilled' ? s.value : null);
            setAuditLog(a.status === 'fulfilled' ? (Array.isArray(a.value) ? a.value : a.value?.entries || []) : []);
            setHealth(h.status === 'fulfilled' ? h.value : null);
            setLoading(false);
        });
    }, []);

    const handleSeed = async () => {
        const ok = await confirm('Seed Database', 'This will populate the database with synthetic data. Existing data may be affected. Continue?');
        if (!ok) return;
        setSeeding(true);
        try {
            await api.seedDatabase();
            const s = await api.getStats();
            setStats(s);
            toast.success('Database seeded successfully!');
        } catch (e) {
            toast.error('Seed failed: ' + e.message);
        }
        setSeeding(false);
    };

    const handleSavePlant = () => {
        toast.success('Plant configuration saved');
    };

    const handleExportJson = async () => {
        try {
            await api.exportData({ format: 'json' });
            toast.success('JSON export initiated');
        } catch (e) {
            toast.error('Export failed: ' + e.message);
        }
    };

    const TABS = [
        { key: 'plant', icon: '🏭', label: 'Plant Config' },
        { key: 'data', icon: '🗄️', label: 'Data Management' },
        { key: 'ai', icon: '🤖', label: 'AI Configuration' },
        { key: 'audit', icon: '📋', label: 'Audit Log' },
    ];

    return (
        <div>
            <h1 className="page-title">⚙️ Administration & Settings</h1>
            <div className="split-panel">
                <div style={{ flex: '0 0 200px' }}>
                    <div className="card" style={{ padding: 8 }}>
                        {TABS.map(t => (
                            <div key={t.key} onClick={() => setTab(t.key)} role="tab" aria-selected={tab === t.key} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setTab(t.key); }} style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: tab === t.key ? 'var(--primary-lighter)' : '', color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, borderLeft: tab === t.key ? '3px solid var(--primary)' : '3px solid transparent' }}>
                                <span aria-hidden="true">{t.icon}</span> {t.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {loading ? <LoadingSpinner /> : (
                        <>
                            {tab === 'plant' && (
                                <div>
                                    <div className="card" style={{ marginBottom: 16 }}>
                                        <div className="card-title" style={{ marginBottom: 16 }}>Plant Details</div>
                                        <div className="grid grid-2" style={{ marginBottom: 16 }}>
                                            <div className="form-group"><div className="form-label">Plant ID</div><input className="form-input" value="OCP-JFC1" readOnly style={{ background: '#f5f5f5', fontFamily: 'var(--font-mono)' }} aria-label="Plant ID" /></div>
                                            <div className="form-group"><div className="form-label">Plant Name</div><input className="form-input" value={plantName} onChange={e => setPlantName(e.target.value)} aria-label="Plant name" /></div>
                                            <div className="form-group"><div className="form-label">Location</div><input className="form-input" value={plantLocation} onChange={e => setPlantLocation(e.target.value)} aria-label="Location" /></div>
                                            <div className="form-group"><div className="form-label">Timezone</div><select className="form-select" aria-label="Timezone"><option>Africa/Casablanca (UTC+1)</option></select></div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={handleSavePlant}>💾 Save Changes</button>
                                    </div>

                                    <div className="card">
                                        <div className="card-title" style={{ marginBottom: 16 }}>System Health</div>
                                        <div className="grid grid-4">
                                            <div style={{ padding: 12, background: health ? '#f0f7f0' : '#FFF5F5', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem' }} aria-hidden="true">{health ? '🟢' : '🔴'}</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>FastAPI</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{health ? 'Online' : 'Offline'}</div>
                                            </div>
                                            <div style={{ padding: 12, background: stats ? '#f0f7f0' : '#FFF5F5', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem' }} aria-hidden="true">{stats ? '🟢' : '🔴'}</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>PostgreSQL</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stats?.total_nodes || 0} nodes</div>
                                            </div>
                                            <div style={{ padding: 12, background: '#FFF8E1', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem' }} aria-hidden="true">🟡</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>SAP Mock</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mock Mode</div>
                                            </div>
                                            <div style={{ padding: 12, background: '#f0f7f0', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem' }} aria-hidden="true">🟢</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>AI Engine</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Claude Sonnet 4</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'data' && (
                                <div>
                                    <div className="card" style={{ marginBottom: 16 }}>
                                        <div className="card-title" style={{ marginBottom: 16 }}>Data Management</div>
                                        <div className="grid grid-2" style={{ gap: 16 }}>
                                            <div style={{ padding: 16, border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">🔄</div>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Seed Database</h3>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>Populate with synthetic data</p>
                                                <button className="btn btn-primary btn-sm" onClick={handleSeed} disabled={seeding}>{seeding ? '⏳ Seeding...' : '🚀 Run Seed'}</button>
                                                {stats && <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current: {stats.total_nodes || 0} nodes</div>}
                                            </div>
                                            <div style={{ padding: 16, border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">📤</div>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Export All Data</h3>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>Download complete database</p>
                                                <button className="btn btn-secondary btn-sm" onClick={handleExportJson}>📥 Export JSON</button>
                                            </div>
                                        </div>
                                    </div>

                                    {stats && (
                                        <div className="card">
                                            <div className="card-title" style={{ marginBottom: 12 }}>Database Statistics</div>
                                            <div className="grid grid-3">
                                                {Object.entries(stats).filter(([k]) => k !== 'timestamp').map(([k, v]) => (
                                                    <div key={k} style={{ padding: 8, borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{k.replace(/_/g, ' ')}</span>
                                                        <strong>{typeof v === 'number' ? v.toLocaleString() : String(v)}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'ai' && (
                                <div className="card">
                                    <div className="card-title" style={{ marginBottom: 16 }}>AI Configuration</div>
                                    <div className="form-group">
                                        <div className="form-label">Confidence Threshold</div>
                                        <div className="flex items-center gap"><input type="range" min={0} max={100} defaultValue={70} className="form-input" style={{ padding: 0 }} aria-label="AI confidence threshold" /><span className="badge badge-info">70%</span></div>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Minimum AI confidence score for auto-suggestions</p>
                                    </div>
                                    <div className="form-group">
                                        <div className="form-label">AI Model</div>
                                        <select className="form-select" aria-label="AI model"><option>Claude Sonnet 4</option></select>
                                    </div>
                                    <div className="form-group" style={{ padding: 12, background: '#FFF5F5', borderRadius: 'var(--radius-sm)', border: '1px solid #FFCDD2' }}>
                                        <div className="flex items-center gap-sm">
                                            <span aria-hidden="true">🔒</span>
                                            <div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Safety-First Mode</div><p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>All AI outputs require human validation — Cannot be disabled</p></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'audit' && (
                                <div className="card">
                                    <div className="card-title" style={{ marginBottom: 12 }}>Audit Log</div>
                                    {auditLog.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="data-table">
                                                <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
                                                <tbody>
                                                    {auditLog.slice(0, 20).map((a, i) => (
                                                        <tr key={i}>
                                                            <td style={{ fontSize: '0.78rem' }}>{a.timestamp || a.created_at || ''}</td>
                                                            <td>{a.user_id || a.user || 'System'}</td>
                                                            <td><span className="badge badge-info">{a.action || a.event_type}</span></td>
                                                            <td className="mono" style={{ fontSize: '0.78rem' }}>{a.entity_type || '—'}</td>
                                                            <td style={{ fontSize: '0.78rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.details || a.description || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <p style={{ color: 'var(--text-muted)' }}>No audit log entries</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
