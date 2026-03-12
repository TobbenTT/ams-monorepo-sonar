import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const STATUS_BADGE = {
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    VIEWED: 'bg-blue-100 text-blue-800',
    RESPONDED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    RAW: 'bg-yellow-100 text-yellow-800',
    VALIDATED: 'bg-green-100 text-green-800',
    PROMOTED: 'bg-purple-100 text-purple-800',
};

export default function ExpertKnowledge() {
    const { plant } = useOutletContext();
    const [tab, setTab] = useState('experts');
    const [experts, setExperts] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [e, c, k] = await Promise.allSettled([
                api.listExperts({ plant_id: plant }),
                api.listConsultations({ plant_id: plant }),
                api.listContributions({ plant_id: plant }),
            ]);
            setExperts(e.status === 'fulfilled' ? (Array.isArray(e.value) ? e.value : e.value.experts || []) : []);
            setConsultations(c.status === 'fulfilled' ? (Array.isArray(c.value) ? c.value : c.value.consultations || []) : []);
            setContributions(k.status === 'fulfilled' ? (Array.isArray(k.value) ? k.value : k.value.contributions || []) : []);
        } catch { /* ignore */ }
        setLoading(false);
    }, [plant]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <LoadingSpinner message="Cargando portal de expertos..." />;

    const tabs = [
        { id: 'experts', label: 'Expert Directory', count: experts.length },
        { id: 'consultations', label: 'Consultations', count: consultations.length },
        { id: 'contributions', label: 'Knowledge Base', count: contributions.length },
    ];

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Expert Knowledge Portal</h1>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard label="Registered Experts" value={experts.length} />
                <KPICard label="Active Consultations" value={consultations.filter(c => c.status !== 'CLOSED').length} variant="info" />
                <KPICard label="Knowledge Contributions" value={contributions.length} />
                <KPICard label="Promoted to KB" value={contributions.filter(c => c.status === 'PROMOTED').length} variant="success" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {/* Expert Directory */}
            {tab === 'experts' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experts.map(exp => (
                        <div key={exp.expert_id} className="bg-card rounded-xl border p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="font-medium">{exp.name}</div>
                                    <div className="text-xs text-muted-foreground">{exp.role} — {exp.plant_id}</div>
                                </div>
                                {exp.is_retired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">Retired</span>}
                            </div>
                            <div className="text-xs space-y-1 mt-3">
                                <div><span className="text-muted-foreground">Experience:</span> {exp.years_experience} years</div>
                                <div><span className="text-muted-foreground">Domains:</span> {(exp.domains || []).join(', ') || '—'}</div>
                                <div><span className="text-muted-foreground">Resolutions:</span> {exp.resolution_count}</div>
                                <div><span className="text-muted-foreground">Contact:</span> {exp.preferred_contact || exp.contact_method || '—'}</div>
                            </div>
                        </div>
                    ))}
                    {experts.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">No experts registered yet</div>}
                </div>
            )}

            {/* Consultations */}
            {tab === 'consultations' && (
                <div className="bg-card rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-2 text-xs font-medium">Equipment</th>
                                <th className="text-left px-4 py-2 text-xs font-medium">Expert</th>
                                <th className="text-left px-4 py-2 text-xs font-medium">Status</th>
                                <th className="text-left px-4 py-2 text-xs font-medium">Requested</th>
                                <th className="text-left px-4 py-2 text-xs font-medium">Response Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultations.map(c => (
                                <tr key={c.consultation_id} className="border-t hover:bg-muted/20">
                                    <td className="px-4 py-2">{c.equipment_tag || c.equipment_type_id}</td>
                                    <td className="px-4 py-2">{c.expert_id}</td>
                                    <td className="px-4 py-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">{new Date(c.requested_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{c.response_time_minutes > 0 ? `${c.response_time_minutes.toFixed(0)} min` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {consultations.length === 0 && <div className="text-center text-muted-foreground py-8">No consultations yet</div>}
                </div>
            )}

            {/* Knowledge Contributions */}
            {tab === 'contributions' && (
                <div className="space-y-3">
                    {contributions.map(k => (
                        <div key={k.contribution_id} className="bg-card rounded-xl border p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{k.equipment_type_id || 'General'}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[k.status] || 'bg-gray-100'}`}>{k.status}</span>
                                </div>
                                {k.status === 'VALIDATED' && (
                                    <button onClick={() => api.promoteContribution(k.contribution_id).then(load)}
                                        className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                                        Promote to KB
                                    </button>
                                )}
                            </div>
                            {k.fm_codes && <div className="text-xs"><span className="text-muted-foreground">FM Codes:</span> {k.fm_codes}</div>}
                            {k.diagnostic_steps && <div className="text-xs mt-1"><span className="text-muted-foreground">Diagnostic:</span> {k.diagnostic_steps}</div>}
                            {k.corrective_actions && <div className="text-xs mt-1"><span className="text-muted-foreground">Actions:</span> {k.corrective_actions}</div>}
                            {k.tips && <div className="text-xs mt-1 italic text-muted-foreground">Tip: {k.tips}</div>}
                        </div>
                    ))}
                    {contributions.length === 0 && <div className="text-center text-muted-foreground py-8">No knowledge contributions yet</div>}
                </div>
            )}
        </div>
    );
}
