import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, KPICard, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

const STAGES = ['Identify', 'Prioritize', 'Analyze', 'Implement', 'Control'];

export default function RCA() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [rcas, setRcas] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [showNewRca, setShowNewRca] = useState(false);
    const [newRca, setNewRca] = useState({ event_description: '', equipment_id: '' });
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listRcas({ plant_id: plant }),
            api.getRcaSummary({ plant_id: plant }),
            api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' }),
        ]).then(([r, s, n]) => {
            setRcas(r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : []) : []);
            setSummary(s.status === 'fulfilled' ? s.value : null);
            setNodes(n.status === 'fulfilled' ? (Array.isArray(n.value) ? n.value : []) : []);
            setLoading(false);
        });
    }, [plant]);

    const loadDetail = async (rca) => {
        try { const d = await api.getRca(rca.analysis_id); setSelected(d); } catch { setSelected(rca); }
    };

    const getStageIndex = (status) => {
        const map = { IDENTIFIED: 0, PRIORITIZED: 1, ANALYZING: 2, IMPLEMENTING: 3, CONTROLLED: 4, COMPLETED: 4, CLOSED: 4 };
        return map[status] ?? 0;
    };

    const handleCreateRca = async () => {
        if (!newRca.event_description.trim()) return;
        try {
            const res = await api.createRca({ ...newRca, plant_id: plant });
            setRcas(prev => [res, ...prev]);
            setShowNewRca(false);
            setNewRca({ event_description: '', equipment_id: '' });
            toast.success('RCA event created');
            loadDetail(res);
        } catch (e) {
            toast.error('Failed to create RCA: ' + e.message);
        }
    };

    const handleRun5w2h = async () => {
        if (!selected?.analysis_id) return;
        try {
            const res = await api.run5w2h(selected.analysis_id, {});
            setSelected(prev => ({ ...prev, five_w_two_h: res.five_w_two_h || res }));
            toast.success('5W2H analysis completed');
        } catch (e) {
            toast.error('5W2H failed: ' + e.message);
        }
    };

    const handleAdvance = async () => {
        if (!selected?.analysis_id) return;
        const curIdx = getStageIndex(selected.status);
        if (curIdx >= STAGES.length - 1) { toast.warning('Already at final stage'); return; }
        try {
            const nextStatus = STAGES[curIdx + 1].toUpperCase();
            const statusMap = { IDENTIFY: 'IDENTIFIED', PRIORITIZE: 'PRIORITIZED', ANALYZE: 'ANALYZING', IMPLEMENT: 'IMPLEMENTING', CONTROL: 'CONTROLLED' };
            await api.advanceRca(selected.analysis_id, { status: statusMap[nextStatus] || nextStatus });
            loadDetail(selected);
            toast.success(`Advanced to ${STAGES[curIdx + 1]}`);
        } catch (e) {
            toast.error('Advance failed: ' + e.message);
        }
    };

    return (
        <div>
            <h1 className="page-title">🔍 RCA & Defect Elimination</h1>

            <div className="grid grid-4" style={{ marginBottom: 20 }}>
                <KPICard label="Events This Year" value={summary?.total_events ?? rcas.length} />
                <KPICard label="Avg Resolution" value={`${summary?.avg_resolution_days ?? 12} days`} variant="info" />
                <KPICard label="Recurrence Rate" value={`${summary?.recurrence_rate ?? 8}%`} variant="warning" />
                <KPICard label="CAPA Completion" value={`${summary?.capa_completion ?? 72}%`} />
            </div>

            {showNewRca && (
                <div className="card" style={{ marginBottom: 16, border: '2px solid var(--primary)' }}>
                    <div className="card-title" style={{ marginBottom: 12 }}>New RCA Event</div>
                    <div className="form-group">
                        <div className="form-label">Event Description</div>
                        <textarea className="form-textarea" rows={3} value={newRca.event_description} onChange={e => setNewRca(prev => ({ ...prev, event_description: e.target.value }))} placeholder="Describe the failure event..." />
                    </div>
                    <div className="form-group">
                        <div className="form-label">Equipment</div>
                        <select className="form-select" value={newRca.equipment_id} onChange={e => setNewRca(prev => ({ ...prev, equipment_id: e.target.value }))}>
                            <option value="">Select Equipment...</option>
                            {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || ''} — {n.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-sm">
                        <button className="btn btn-primary btn-sm" onClick={handleCreateRca} disabled={!newRca.event_description.trim()}>Create</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowNewRca(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="split-panel">
                <div className="split-left">
                    <div className="card">
                        <div className="card-header"><span className="card-title">RCA Events</span><button className="btn btn-primary btn-sm" onClick={() => setShowNewRca(true)}>+ New RCA</button></div>
                        {loading ? <LoadingSpinner /> : rcas.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 16 }}>No RCA events</p> : rcas.map((r, i) => (
                            <div key={i} onClick={() => loadDetail(r)} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: selected?.analysis_id === r.analysis_id ? 'var(--primary-lighter)' : '', borderLeft: selected?.analysis_id === r.analysis_id ? '3px solid var(--primary)' : '3px solid transparent' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.event_description?.slice(0, 50) || r.analysis_id?.slice(0, 12)}</div>
                                <div className="flex items-center gap-sm" style={{ marginTop: 4 }}>
                                    <StatusBadge status={r.status} />
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.equipment_id?.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="split-right">
                    {selected ? (
                        <div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="pipeline">
                                    {STAGES.map((s, i) => {
                                        const curIdx = getStageIndex(selected.status);
                                        const status = i < curIdx ? 'completed' : i === curIdx ? 'active' : '';
                                        return (
                                            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className={`pipeline-step ${status}`}>
                                                    <div className="pipeline-dot">{i < curIdx ? '✓' : i + 1}</div>
                                                    <span>{s}</span>
                                                </div>
                                                {i < STAGES.length - 1 && <div className={`pipeline-line ${i < curIdx ? 'completed' : ''}`}></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title" style={{ marginBottom: 12 }}>Event Information</div>
                                <div className="flex items-center gap-sm" style={{ marginBottom: 8 }}>
                                    <span className="mono" style={{ fontSize: '0.82rem' }}>{selected.analysis_id?.slice(0, 12)}</span>
                                    <StatusBadge status={selected.status} />
                                </div>
                                <p style={{ fontSize: '0.9rem' }}>{selected.event_description || 'No description'}</p>
                                {selected.equipment_id && <div style={{ marginTop: 8 }}><span className="meta-chip">Equipment: {selected.equipment_id.slice(0, 8)}</span></div>}
                            </div>

                            {selected.five_w_two_h && (
                                <div className="card" style={{ marginBottom: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12 }}>5W + 2H Analysis</div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table">
                                            <thead><tr><th>Question</th><th>Answer</th></tr></thead>
                                            <tbody>
                                                {Object.entries(selected.five_w_two_h).map(([k, v]) => (
                                                    <tr key={k}><td style={{ fontWeight: 600 }}>{k}</td><td>{v || '—'}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {selected.root_cause_levels && (
                                <div className="card" style={{ marginBottom: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12 }}>Root Cause — 3 Levels</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {['physical_cause', 'human_cause', 'latent_cause'].map((k, i) => (
                                            selected.root_cause_levels[k] && (
                                                <div key={k} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: i === 0 ? '#FFF3E0' : i === 1 ? '#FFF8E1' : '#FFEBEE', borderLeft: `3px solid ${i === 0 ? '#E65100' : i === 1 ? '#F57F17' : '#C62828'}`, marginLeft: i * 24 }}>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</div>
                                                    <div style={{ fontSize: '0.85rem' }}>{selected.root_cause_levels[k]}</div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selected.capa_actions && selected.capa_actions.length > 0 && (
                                <div className="card" style={{ marginBottom: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12 }}>CAPA Actions</div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table">
                                            <thead><tr><th>#</th><th>Action</th><th>Type</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {selected.capa_actions.map((a, i) => (
                                                    <tr key={i}><td>{i + 1}</td><td>{a.description}</td><td><span className="badge badge-info">{a.type}</span></td><td><StatusBadge status={a.status} /></td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-sm" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={handleAdvance}>▶️ Advance Stage</button>
                                <button className="btn btn-secondary btn-sm" onClick={handleRun5w2h}>📋 Run 5W2H</button>
                            </div>
                        </div>
                    ) : <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><h3>Select an RCA event</h3><p>Click on an event to view the analysis pipeline</p></div></div>}
                </div>
            </div>
        </div>
    );
}
