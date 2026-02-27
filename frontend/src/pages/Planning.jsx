import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KPICard, PriorityBadge, StatusBadge, DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import * as api from '../api';

const COLORS = ['#C62828', '#E65100', '#F57F17', '#1B5E20'];

export default function Planning() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const [backlog, setBacklog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('backlog');
    const [programs, setPrograms] = useState([]);
    const [workRequests, setWorkRequests] = useState([]);
    const [selectedWr, setSelectedWr] = useState('');
    const [recommendation, setRecommendation] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listBacklog(),
            api.listPrograms({ plant_id: plant }),
            api.listWorkRequests({ plant_id: plant }),
        ]).then(([b, p, w]) => {
            setBacklog(b.status === 'fulfilled' ? (Array.isArray(b.value) ? b.value : b.value?.items || []) : []);
            setPrograms(p.status === 'fulfilled' ? (Array.isArray(p.value) ? p.value : []) : []);
            setWorkRequests(w.status === 'fulfilled' ? (Array.isArray(w.value) ? w.value : w.value?.items || []) : []);
            setLoading(false);
        });
    }, [plant]);

    const handleGenerateRec = async () => {
        if (!selectedWr) return;
        setGenerating(true);
        try {
            const res = await api.generateRecommendation(selectedWr);
            setRecommendation(res);
            toast.success('AI recommendation generated');
        } catch (e) {
            toast.error('Recommendation failed: ' + e.message);
        }
        setGenerating(false);
    };

    const stratification = {
        AWAITING_MATERIALS: backlog.filter(b => b.status === 'AWAITING_MATERIALS').length,
        AWAITING_SHUTDOWN: backlog.filter(b => b.status === 'AWAITING_SHUTDOWN').length,
        AWAITING_RESOURCES: backlog.filter(b => b.status === 'AWAITING_RESOURCES').length,
        SCHEDULABLE: backlog.filter(b => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS').length,
    };

    const priorityData = [
        { name: 'Emergency', value: backlog.filter(b => String(b.priority).startsWith('1')).length },
        { name: 'Urgent', value: backlog.filter(b => String(b.priority).startsWith('2')).length },
        { name: 'Normal', value: backlog.filter(b => String(b.priority).startsWith('3')).length },
        { name: 'Planned', value: backlog.filter(b => String(b.priority).startsWith('4')).length },
    ];

    const agingData = [
        { range: '0-7d', count: backlog.filter(b => (b.age_days || 0) <= 7).length },
        { range: '8-14d', count: backlog.filter(b => (b.age_days || 0) > 7 && (b.age_days || 0) <= 14).length },
        { range: '15-30d', count: backlog.filter(b => (b.age_days || 0) > 14 && (b.age_days || 0) <= 30).length },
        { range: '30d+', count: backlog.filter(b => (b.age_days || 0) > 30).length },
    ];

    const columns = [
        { key: 'backlog_id', label: 'ID', mono: true, render: r => (r.backlog_id || '').slice(0, 8) },
        { key: 'equipment_tag', label: 'Equipment', mono: true },
        { key: 'work_order_type', label: 'Type', render: r => <span className="badge badge-info">{r.work_order_type || '—'}</span> },
        { key: 'priority', label: 'Priority', render: r => <PriorityBadge priority={r.priority} /> },
        { key: 'age_days', label: 'Age', render: r => <span>{r.age_days || 0} days</span> },
        { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
        { key: 'materials_ready', label: 'Materials', render: r => r.materials_ready ? '✅' : '❌' },
        { key: 'estimated_duration_hours', label: 'Duration', render: r => `${r.estimated_duration_hours || 0}h` },
    ];

    return (
        <div>
            <h1 className="page-title">📅 Planning & Scheduling</h1>

            <div className="tabs" role="tablist">
                <button className={`tab${tab === 'backlog' ? ' active' : ''}`} onClick={() => setTab('backlog')} role="tab" aria-selected={tab === 'backlog'}>📋 Backlog</button>
                <button className={`tab${tab === 'schedule' ? ' active' : ''}`} onClick={() => setTab('schedule')} role="tab" aria-selected={tab === 'schedule'}>📅 Weekly Schedule</button>
                <button className={`tab${tab === 'planner' ? ' active' : ''}`} onClick={() => setTab('planner')} role="tab" aria-selected={tab === 'planner'}>🤖 AI Planner</button>
            </div>

            {tab === 'backlog' && (
                <>
                    <div className="grid grid-5" style={{ marginBottom: 20 }}>
                        <KPICard label="Awaiting Materials" value={stratification.AWAITING_MATERIALS} variant="warning" />
                        <KPICard label="Awaiting Shutdown" value={stratification.AWAITING_SHUTDOWN} variant="danger" />
                        <KPICard label="Awaiting Resources" value={stratification.AWAITING_RESOURCES} variant="info" />
                        <KPICard label="Schedulable Now" value={stratification.SCHEDULABLE} />
                        <KPICard label="Total Backlog" value={backlog.length} variant="" />
                    </div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={backlog} emptyMsg="No backlog items" sortable />}
                    </div>
                    <div className="grid grid-2">
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 12 }}>Backlog Aging</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={agingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: 12 }}>Priority Distribution</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                                        {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
            {tab === 'schedule' && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>Weekly Programs</div>
                    {programs.length > 0 ? programs.map((p, i) => (
                        <div key={i} className="alert-item info" style={{ marginBottom: 8 }}>
                            <div><div className="alert-title">Week {p.week_number || i + 1} — {p.year || new Date().getFullYear()}</div>
                                <div className="alert-desc"><StatusBadge status={p.status} /></div></div>
                        </div>
                    )) : <div className="empty-state"><div className="empty-icon">📅</div><h3>No weekly programs</h3><p>Create a scheduling program to see the Gantt view</p></div>}
                </div>
            )}
            {tab === 'planner' && (
                <div className="grid grid-2" style={{ gap: 20 }}>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>AI Planner</div>
                        <div className="form-group">
                            <div className="form-label">Select Work Request</div>
                            <select className="form-select" value={selectedWr} onChange={e => setSelectedWr(e.target.value)} aria-label="Select work request">
                                <option value="">Select a work request...</option>
                                {workRequests.map((wr, i) => (
                                    <option key={i} value={wr.work_request_id || wr.request_id}>
                                        {(wr.work_request_id || wr.request_id || '').slice(0, 8)} — {wr.equipment_tag || wr.equipment_identification?.equipment_tag || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={handleGenerateRec} disabled={!selectedWr || generating} style={{ width: '100%', justifyContent: 'center' }}>
                            {generating ? '⏳ Generating...' : '🤖 Generate AI Recommendation'}
                        </button>
                    </div>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>Recommendation</div>
                        {recommendation ? (
                            <div>
                                <div className="flex gap-sm flex-wrap" style={{ marginBottom: 12 }}>
                                    <StatusBadge status={recommendation.planner_action || 'PENDING'} />
                                    {recommendation.ai_confidence != null && (
                                        <span className="badge badge-info">🤖 Confidence: {Math.round(recommendation.ai_confidence * 100)}%</span>
                                    )}
                                </div>
                                {recommendation.recommended_action && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div className="form-label">Recommended Action</div>
                                        <p style={{ fontSize: '0.85rem' }}>{recommendation.recommended_action}</p>
                                    </div>
                                )}
                                {recommendation.scheduling_suggestion && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div className="form-label">Scheduling</div>
                                        <p style={{ fontSize: '0.85rem' }}>{typeof recommendation.scheduling_suggestion === 'object' ? JSON.stringify(recommendation.scheduling_suggestion) : recommendation.scheduling_suggestion}</p>
                                    </div>
                                )}
                                {recommendation.justification && (
                                    <div>
                                        <div className="form-label">Justification</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{recommendation.justification}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state"><div className="empty-icon">🤖</div><h3>AI Planner</h3><p>Select a work request and generate a recommendation</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
