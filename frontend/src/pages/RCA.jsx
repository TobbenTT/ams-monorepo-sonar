import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, KPICard, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

const STAGES = ['Identify', 'Prioritize', 'Analyze', 'Implement', 'Control'];

const CAPA_STATUS_CYCLE = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export default function RCA() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const { t } = useLanguage();
    const [rcas, setRcas] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [showNewRca, setShowNewRca] = useState(false);
    const [newRca, setNewRca] = useState({ event_description: '', equipment_id: '' });
    const [nodes, setNodes] = useState([]);

    // --- Editing state ---
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editingEventInfo, setEditingEventInfo] = useState(false);
    const [editEventDesc, setEditEventDesc] = useState('');
    const [editEquipmentId, setEditEquipmentId] = useState('');
    const [showAddCapa, setShowAddCapa] = useState(false);
    const [newCapa, setNewCapa] = useState({ description: '', type: 'corrective', responsible: '', due_date: '' });
    const editRef = useRef(null);

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

    // --- Edit handlers ---

    // Event Information: start editing
    const startEditEventInfo = () => {
        setEditingEventInfo(true);
        setEditEventDesc(selected.event_description || '');
        setEditEquipmentId(selected.equipment_id || '');
    };

    // Event Information: save to API
    const saveEditEventInfo = async () => {
        try {
            const updated = await api.updateRca(selected.analysis_id, {
                event_description: editEventDesc,
                equipment_id: editEquipmentId,
            });
            setSelected(updated);
            setRcas(prev => prev.map(r =>
                r.analysis_id === selected.analysis_id
                    ? { ...r, event_description: editEventDesc, equipment_id: editEquipmentId }
                    : r
            ));
            toast.success(t('common.saved'));
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
        setEditingEventInfo(false);
    };

    const cancelEditEventInfo = () => {
        setEditingEventInfo(false);
    };

    // 5W+2H: start editing a specific key
    const startEdit5w2h = (key, currentValue) => {
        setEditingField(`5w2h_${key}`);
        setEditValue(currentValue || '');
    };

    // 5W+2H: save on blur or Enter — persist to API
    const saveEdit5w2h = async (key) => {
        const newData = { ...selected.five_w_two_h, [key]: editValue };
        setSelected(prev => ({ ...prev, five_w_two_h: newData }));
        setEditingField(null);
        setEditValue('');
        try {
            await api.updateRca(selected.analysis_id, { analysis_5w2h: newData });
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    // Root Cause Levels: start editing
    const startEditCause = (key, currentValue) => {
        setEditingField(`cause_${key}`);
        setEditValue(currentValue || '');
    };

    // Root Cause Levels: save on blur — persist to API
    const saveEditCause = async (key) => {
        const newCauses = { ...selected.root_cause_levels, [key]: editValue };
        setSelected(prev => ({ ...prev, root_cause_levels: newCauses }));
        setEditingField(null);
        setEditValue('');
        try {
            await api.updateRca(selected.analysis_id, { root_cause_levels: newCauses });
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    // CAPA: cycle status — persist to API
    const cycleCapaStatus = async (index) => {
        const actions = [...(selected.capa_actions || [])];
        const current = actions[index].status || 'PENDING';
        const currentIdx = CAPA_STATUS_CYCLE.indexOf(current);
        const nextIdx = (currentIdx + 1) % CAPA_STATUS_CYCLE.length;
        actions[index] = { ...actions[index], status: CAPA_STATUS_CYCLE[nextIdx] };
        setSelected(prev => ({ ...prev, capa_actions: actions }));
        try {
            await api.updateRca(selected.analysis_id, { capa_actions: actions });
            toast.success(t('common.saved'));
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    // CAPA: add new action — persist to API
    const handleAddCapa = async () => {
        if (!newCapa.description.trim()) {
            toast.error(t('rca.actionRequired'));
            return;
        }
        const action = {
            description: newCapa.description,
            type: newCapa.type,
            responsible: newCapa.responsible,
            due_date: newCapa.due_date,
            status: 'PENDING',
        };
        const actions = [...(selected.capa_actions || []), action];
        setSelected(prev => ({ ...prev, capa_actions: actions }));
        setNewCapa({ description: '', type: 'corrective', responsible: '', due_date: '' });
        setShowAddCapa(false);
        try {
            await api.updateRca(selected.analysis_id, { capa_actions: actions });
            toast.success(t('common.saved'));
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">🔍 {t('rca.title')}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <KPICard label={t('rca.eventsThisYear')} value={summary?.total_events ?? rcas.length} />
                <KPICard label={t('rca.avgResolution')} value={`${summary?.avg_resolution_days ?? 12} ${t('common.days')}`} variant="info" />
                <KPICard label={t('rca.recurrenceRate')} value={`${summary?.recurrence_rate ?? 8}%`} variant="warning" />
                <KPICard label={t('rca.capaCompletion')} value={`${summary?.capa_completion ?? 72}%`} />
            </div>

            {showNewRca && (
                <div className="bg-card border-2 border-primary rounded-lg p-5 shadow-sm mb-4">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('rca.newRCA')}</div>
                    <div className="mb-3.5">
                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('rca.eventDescription')}</div>
                        <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[120px] resize-y" rows={3} value={newRca.event_description} onChange={e => setNewRca(prev => ({ ...prev, event_description: e.target.value }))} placeholder={t('rca.eventDescription')} />
                    </div>
                    <div className="mb-3.5">
                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('common.equipment')}</div>
                        <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={newRca.equipment_id} onChange={e => setNewRca(prev => ({ ...prev, equipment_id: e.target.value }))}>
                            <option value="">{t('rca.selectEquipment')}...</option>
                            {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || ''} — {n.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleCreateRca} disabled={!newRca.event_description.trim()}>{t('common.create')}</button>
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors" onClick={() => setShowNewRca(false)}>{t('common.cancel')}</button>
                    </div>
                </div>
            )}

            <div className="flex gap-5 flex-col lg:flex-row">
                <div className="lg:w-[35%] min-w-0">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-primary uppercase tracking-wider">{t('rca.title')}</span><button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={() => setShowNewRca(true)}>+ {t('rca.newRCA')}</button></div>
                        {loading ? <LoadingSpinner /> : rcas.length === 0 ? <p className="text-muted-foreground p-4">{t('common.noData')}</p> : rcas.map((r, i) => (
                            <div key={i} onClick={() => loadDetail(r)} className={`py-2.5 px-3.5 border-b border-border cursor-pointer border-l-[3px] ${selected?.analysis_id === r.analysis_id ? 'bg-primary/10 border-l-primary' : 'border-l-transparent'}`}>
                                <div className="font-semibold text-[0.85rem]">{r.event_description?.slice(0, 50) || r.analysis_id?.slice(0, 12)}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusBadge status={r.status} />
                                    <span className="text-[0.72rem] text-muted-foreground">{r.equipment_id?.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {selected ? (
                        <div>
                            {/* Stage Progress */}
                            <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                                <div className="flex items-center gap-0 mb-6">
                                    {STAGES.map((s, i) => {
                                        const curIdx = getStageIndex(selected.status);
                                        const isDone = i < curIdx;
                                        const isActive = i === curIdx;
                                        return (
                                            <div key={s} className="flex items-center">
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary text-primary-foreground border-primary' : isDone ? 'bg-green-100 text-green-800 border-green-600' : 'border-border'}`}>{isDone ? '✓' : i + 1}</div>
                                                    <span className="text-xs mt-1">{t(`rca.stages.${s.toLowerCase()}`)}</span>
                                                </div>
                                                {i < STAGES.length - 1 && <div className={`flex-1 h-0.5 min-w-[2rem] ${isDone ? 'bg-green-600' : 'bg-border'}`}></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Event Information (with inline editing) */}
                            <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('rca.eventDescription')}</div>
                                    {!editingEventInfo && (
                                        <button
                                            className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                            onClick={startEditEventInfo}
                                            title={t('common.edit')}
                                        >
                                            {t('common.edit')}
                                        </button>
                                    )}
                                </div>

                                {editingEventInfo ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="font-mono text-xs">{selected.analysis_id?.slice(0, 12)}</span>
                                            <StatusBadge status={selected.status} />
                                        </div>
                                        <div className="mb-3">
                                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('rca.eventDescription')}</div>
                                            <textarea
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[80px] resize-y"
                                                rows={3}
                                                value={editEventDesc}
                                                onChange={e => setEditEventDesc(e.target.value)}
                                                placeholder={t('rca.eventDescription')}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('common.equipment')}</div>
                                            <select
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                value={editEquipmentId}
                                                onChange={e => setEditEquipmentId(e.target.value)}
                                            >
                                                <option value="">{t('rca.selectEquipment')}...</option>
                                                {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.code || ''} — {n.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                onClick={saveEditEventInfo}
                                            >
                                                {t('common.save')}
                                            </button>
                                            <button
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                                onClick={cancelEditEventInfo}
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-xs">{selected.analysis_id?.slice(0, 12)}</span>
                                            <StatusBadge status={selected.status} />
                                        </div>
                                        <p className="text-sm">{selected.event_description || t('common.noData')}</p>
                                        {selected.equipment_id && <div className="mt-2"><span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('common.equipment')}: {selected.equipment_id.slice(0, 8)}</span></div>}
                                    </div>
                                )}
                            </div>

                            {/* 5W + 2H Analysis (with inline cell editing) */}
                            {selected.five_w_two_h && (
                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('rca.fiveW2H')}</div>
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead><tr><th>{t('rca.fiveW2H')}</th><th>{t('common.description')}</th></tr></thead>
                                            <tbody>
                                                {Object.entries(selected.five_w_two_h).map(([k, v]) => (
                                                    <tr key={k}>
                                                        <td className="font-semibold">{k}</td>
                                                        <td
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                if (editingField !== `5w2h_${k}`) {
                                                                    startEdit5w2h(k, v);
                                                                }
                                                            }}
                                                        >
                                                            {editingField === `5w2h_${k}` ? (
                                                                <textarea
                                                                    ref={editRef}
                                                                    className="w-full px-2 py-1 border border-primary rounded bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[36px]"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onBlur={() => saveEdit5w2h(k)}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            saveEdit5w2h(k);
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setEditingField(null);
                                                                            setEditValue('');
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 group">
                                                                    <span>{v || '\u2014'}</span>
                                                                    <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs" title={t('common.edit')}>&#9998;</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Root Cause Levels (with inline editing) */}
                            {selected.root_cause_levels && (
                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('rca.rootCauses')}</div>
                                    <div className="flex flex-col gap-2">
                                        {['physical_cause', 'human_cause', 'latent_cause'].map((k, i) => (
                                            selected.root_cause_levels[k] != null && (
                                                <div
                                                    key={k}
                                                    className={`py-2.5 px-3.5 rounded-sm border-l-[3px] ${i === 0 ? 'bg-orange-50 border-l-orange-800' : i === 1 ? 'bg-amber-50 border-l-amber-700' : 'bg-red-50 border-l-red-800'}`}
                                                    style={{ marginLeft: i * 24 }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[0.72rem] font-bold uppercase text-muted-foreground">{t(`rca.${k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`)}</div>
                                                        {editingField !== `cause_${k}` && (
                                                            <button
                                                                className="text-muted-foreground hover:text-foreground transition-colors text-xs px-1"
                                                                onClick={() => startEditCause(k, selected.root_cause_levels[k])}
                                                                title={t('common.edit')}
                                                            >
                                                                &#9998;
                                                            </button>
                                                        )}
                                                    </div>
                                                    {editingField === `cause_${k}` ? (
                                                        <textarea
                                                            className="w-full mt-1 px-2 py-1 border border-primary rounded bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[36px]"
                                                            value={editValue}
                                                            onChange={e => setEditValue(e.target.value)}
                                                            onBlur={() => saveEditCause(k)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    saveEditCause(k);
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setEditingField(null);
                                                                    setEditValue('');
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className="text-[0.85rem]">{selected.root_cause_levels[k]}</div>
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CAPA Actions (with status cycling + add new action) */}
                            <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('rca.capaActions')}</div>
                                    <button
                                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                        onClick={() => setShowAddCapa(true)}
                                        title={t('rca.addAction')}
                                    >
                                        + {t('rca.addAction')}
                                    </button>
                                </div>

                                {/* Add CAPA form */}
                                {showAddCapa && (
                                    <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 mb-4 bg-primary/5">
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('rca.addAction')}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div className="md:col-span-2">
                                                <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('common.description')}</div>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[60px] resize-y"
                                                    rows={2}
                                                    value={newCapa.description}
                                                    onChange={e => setNewCapa(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder={t('common.description')}
                                                />
                                            </div>
                                            <div>
                                                <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('common.type')}</div>
                                                <select
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    value={newCapa.type}
                                                    onChange={e => setNewCapa(prev => ({ ...prev, type: e.target.value }))}
                                                >
                                                    <option value="corrective">{t('rca.corrective')}</option>
                                                    <option value="preventive">{t('rca.preventive')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('rca.responsible')}</div>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    value={newCapa.responsible}
                                                    onChange={e => setNewCapa(prev => ({ ...prev, responsible: e.target.value }))}
                                                    placeholder={t('rca.responsible')}
                                                />
                                            </div>
                                            <div>
                                                <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('rca.dueDate')}</div>
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    value={newCapa.due_date}
                                                    onChange={e => setNewCapa(prev => ({ ...prev, due_date: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                onClick={handleAddCapa}
                                                disabled={!newCapa.description.trim()}
                                            >
                                                {t('rca.addAction')}
                                            </button>
                                            <button
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                                onClick={() => { setShowAddCapa(false); setNewCapa({ description: '', type: 'corrective', responsible: '', due_date: '' }); }}
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CAPA table */}
                                {selected.capa_actions && selected.capa_actions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead><tr><th>#</th><th>{t('common.actions')}</th><th>{t('common.type')}</th><th>{t('rca.responsible')}</th><th>{t('rca.dueDate')}</th><th>{t('common.status')}</th></tr></thead>
                                            <tbody>
                                                {selected.capa_actions.map((a, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{a.description}</td>
                                                        <td><span className="badge badge-info">{a.type}</span></td>
                                                        <td className="text-xs text-muted-foreground">{a.responsible || '\u2014'}</td>
                                                        <td className="text-xs text-muted-foreground">{a.due_date || '\u2014'}</td>
                                                        <td>
                                                            <button
                                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => cycleCapaStatus(i)}
                                                                title={t('common.status')}
                                                            >
                                                                <StatusBadge status={a.status} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    !showAddCapa && <p className="text-muted-foreground text-sm py-2">{t('common.noData')}</p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-4 flex-wrap">
                                <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleAdvance}>{t('rca.advanceStage')}</button>
                                <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors" onClick={handleRun5w2h}>{t('rca.run5w2h')}</button>
                            </div>
                        </div>
                    ) : <div className="bg-card border border-border rounded-lg p-5 shadow-sm"><div className="text-center py-16 px-5 text-muted-foreground"><div className="text-5xl mb-4 opacity-40">🔍</div><h3>{t('rca.title')}</h3><p>{t('rca.subtitle')}</p></div></div>}
                </div>
            </div>
        </div>
    );
}
