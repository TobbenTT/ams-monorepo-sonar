import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KPICard, PriorityBadge, StatusBadge, DataTable, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

const COLORS = ['#C62828', '#E65100', '#F57F17', '#1B5E20'];

export default function Planning() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const { t } = useLanguage();
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
            toast.success(t('planning.aiRecommendationGenerated'));
        } catch (e) {
            toast.error(t('planning.recommendationFailed') + e.message);
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
        { name: t('planning.emergency'), value: backlog.filter(b => String(b.priority).startsWith('1')).length },
        { name: t('planning.urgent'), value: backlog.filter(b => String(b.priority).startsWith('2')).length },
        { name: t('planning.normal'), value: backlog.filter(b => String(b.priority).startsWith('3')).length },
        { name: t('planning.planned'), value: backlog.filter(b => String(b.priority).startsWith('4')).length },
    ];

    const agingData = [
        { range: '0-7d', count: backlog.filter(b => (b.age_days || 0) <= 7).length },
        { range: '8-14d', count: backlog.filter(b => (b.age_days || 0) > 7 && (b.age_days || 0) <= 14).length },
        { range: '15-30d', count: backlog.filter(b => (b.age_days || 0) > 14 && (b.age_days || 0) <= 30).length },
        { range: '30d+', count: backlog.filter(b => (b.age_days || 0) > 30).length },
    ];

    const columns = [
        { key: 'backlog_id', label: t('planning.colId'), mono: true, render: r => (r.backlog_id || '').slice(0, 8) },
        { key: 'equipment_tag', label: t('planning.colEquipment'), mono: true },
        { key: 'work_order_type', label: t('planning.colType'), render: r => <span className="badge badge-info">{r.work_order_type || '—'}</span> },
        { key: 'priority', label: t('planning.colPriority'), render: r => <PriorityBadge priority={r.priority} /> },
        { key: 'age_days', label: t('planning.colAge'), render: r => <span>{r.age_days || 0} {t('planning.days')}</span> },
        { key: 'status', label: t('planning.colStatus'), render: r => <StatusBadge status={r.status} /> },
        { key: 'materials_ready', label: t('planning.colMaterials'), render: r => r.materials_ready ? '✅' : '❌' },
        { key: 'estimated_duration_hours', label: t('planning.colDuration'), render: r => `${r.estimated_duration_hours || 0}h` },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">{t('planning.title')}</h1>

            <div className="flex gap-1 border-b border-border mb-4" role="tablist">
                <button className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'backlog' ? 'bg-card border border-border border-b-card text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('backlog')} role="tab" aria-selected={tab === 'backlog'}>{t('planning.tabBacklog')}</button>
                <button className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'schedule' ? 'bg-card border border-border border-b-card text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('schedule')} role="tab" aria-selected={tab === 'schedule'}>{t('planning.tabSchedule')}</button>
                <button className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'planner' ? 'bg-card border border-border border-b-card text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTab('planner')} role="tab" aria-selected={tab === 'planner'}>{t('planning.tabPlanner')}</button>
            </div>

            {tab === 'backlog' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                        <KPICard label={t('planning.awaitingMaterials')} value={stratification.AWAITING_MATERIALS} variant="warning" />
                        <KPICard label={t('planning.awaitingShutdown')} value={stratification.AWAITING_SHUTDOWN} variant="danger" />
                        <KPICard label={t('planning.awaitingResources')} value={stratification.AWAITING_RESOURCES} variant="info" />
                        <KPICard label={t('planning.schedulableNow')} value={stratification.SCHEDULABLE} />
                        <KPICard label={t('planning.totalBacklog')} value={backlog.length} variant="" />
                    </div>
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-5">
                        {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={backlog} emptyMsg={t('planning.noBacklogItems')} sortable />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('planning.backlogAging')}</div>
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
                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('planning.priorityDistribution')}</div>
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
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('planning.weeklyPrograms')}</div>
                    {programs.length > 0 ? programs.map((p, i) => (
                        <div key={i} className="alert-item info mb-2">
                            <div><div className="alert-title">{t('planning.week')} {p.week_number || i + 1} — {p.year || new Date().getFullYear()}</div>
                                <div className="alert-desc"><StatusBadge status={p.status} /></div></div>
                        </div>
                    )) : <div className="text-center py-16 px-5 text-muted-foreground"><div className="text-5xl mb-4 opacity-40">📅</div><h3>{t('planning.noWeeklyPrograms')}</h3><p>{t('planning.noWeeklyProgramsDesc')}</p></div>}
                </div>
            )}
            {tab === 'planner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('planning.aiPlannerTitle')}</div>
                        <div className="mb-3.5">
                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.selectWorkRequest')}</div>
                            <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" value={selectedWr} onChange={e => setSelectedWr(e.target.value)} aria-label={t('planning.selectWorkRequest')}>
                                <option value="">{t('planning.selectWorkRequestPlaceholder')}</option>
                                {workRequests.map((wr, i) => (
                                    <option key={i} value={wr.work_request_id || wr.request_id}>
                                        {(wr.work_request_id || wr.request_id || '').slice(0, 8)} — {wr.equipment_tag || wr.equipment_identification?.equipment_tag || t('planning.unknown')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="w-full justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleGenerateRec} disabled={!selectedWr || generating}>
                            {generating ? `⏳ ${t('planning.generating')}` : `🤖 ${t('planning.generateAIRecommendation')}`}
                        </button>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('planning.recommendation')}</div>
                        {recommendation ? (
                            <div>
                                <div className="flex gap-2 flex-wrap mb-3">
                                    <StatusBadge status={recommendation.planner_action || 'PENDING'} />
                                    {recommendation.ai_confidence != null && (
                                        <span className="badge badge-info">🤖 {t('planning.confidence')}: {Math.round(recommendation.ai_confidence * 100)}%</span>
                                    )}
                                </div>
                                {recommendation.recommended_action && (
                                    <div className="mb-3">
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.recommendedAction')}</div>
                                        <p className="text-sm">{recommendation.recommended_action}</p>
                                    </div>
                                )}
                                {recommendation.scheduling_suggestion && (
                                    <div className="mb-3">
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.scheduling')}</div>
                                        {typeof recommendation.scheduling_suggestion === 'object' ? (
                                            <div className="space-y-2 text-sm">
                                                {recommendation.scheduling_suggestion.recommended_date && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-muted-foreground">{t('planning.date')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.recommended_date}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.recommended_shift && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-muted-foreground">{t('planning.shift')}:</span>
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">{recommendation.scheduling_suggestion.recommended_shift}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.reasoning && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-muted-foreground shrink-0">{t('planning.reasoning')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.reasoning}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.conflicts?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-red-500 shrink-0">{t('planning.conflicts')}:</span>
                                                        <span className="text-red-600">{recommendation.scheduling_suggestion.conflicts.join(', ')}</span>
                                                    </div>
                                                )}
                                                {recommendation.scheduling_suggestion.groupable_with?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-muted-foreground shrink-0">{t('planning.groupableWith')}:</span>
                                                        <span>{recommendation.scheduling_suggestion.groupable_with.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm">{recommendation.scheduling_suggestion}</p>
                                        )}
                                    </div>
                                )}
                                {recommendation.justification && (
                                    <div>
                                        <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('planning.justification')}</div>
                                        <p className="text-sm text-muted-foreground">{recommendation.justification}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-5 text-muted-foreground"><div className="text-5xl mb-4 opacity-40">🤖</div><h3>{t('planning.aiPlannerEmpty')}</h3><p>{t('planning.aiPlannerEmptyDesc')}</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
