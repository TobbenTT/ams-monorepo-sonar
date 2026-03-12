import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const STATUS_COLORS = {
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DIAGNOSED: 'bg-green-100 text-green-800',
    ESCALATED: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-gray-100 text-gray-800',
};

export default function Troubleshooting() {
    const { plant } = useOutletContext();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ equipment_type_id: '', equipment_tag: '', plant_id: '' });
    const [symptomText, setSymptomText] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.listTroubleshootingSessions({ plant_id: plant });
            setSessions(Array.isArray(result) ? result : result.sessions || []);
        } catch { setSessions([]); }
        setLoading(false);
    }, [plant]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        setCreating(true);
        try {
            const session = await api.createTroubleshootingSession({ ...form, plant_id: plant });
            setActiveSession(session);
            await load();
        } catch { /* ignore */ }
        setCreating(false);
    };

    const handleAddSymptom = async () => {
        if (!activeSession || !symptomText.trim()) return;
        try {
            const updated = await api.addSymptom(activeSession.session_id, { symptom: symptomText });
            setActiveSession(updated);
            setSymptomText('');
        } catch { /* ignore */ }
    };

    const handleViewSession = async (id) => {
        try {
            const session = await api.getTroubleshootingSession(id);
            setActiveSession(session);
        } catch { /* ignore */ }
    };

    if (loading) return <LoadingSpinner message="Cargando sesiones de troubleshooting..." />;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Interactive Troubleshooting</h1>

            <div className="grid md:grid-cols-3 gap-5">
                {/* Left: Session List + Create */}
                <div className="space-y-4">
                    {/* Create new session */}
                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">New Diagnosis Session</div>
                        <div className="space-y-2">
                            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Equipment Type ID"
                                value={form.equipment_type_id} onChange={e => setForm({ ...form, equipment_type_id: e.target.value })} />
                            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Equipment Tag"
                                value={form.equipment_tag} onChange={e => setForm({ ...form, equipment_tag: e.target.value })} />
                            <button onClick={handleCreate} disabled={creating || !form.equipment_type_id}
                                className="w-full px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50">
                                {creating ? 'Creating...' : 'Start Session'}
                            </button>
                        </div>
                    </div>

                    {/* Session list */}
                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Recent Sessions ({sessions.length})</div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {sessions.map(s => (
                                <button key={s.session_id} onClick={() => handleViewSession(s.session_id)}
                                    className={`w-full text-left p-2 rounded border text-sm hover:bg-muted/50 transition-colors ${activeSession?.session_id === s.session_id ? 'border-primary bg-primary/5' : ''}`}>
                                    <div className="font-medium truncate">{s.equipment_tag || s.equipment_type_id}</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-gray-100'}`}>{s.status}</span>
                                        <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))}
                            {sessions.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No sessions yet</div>}
                        </div>
                    </div>
                </div>

                {/* Right: Active session detail */}
                <div className="md:col-span-2">
                    {activeSession ? (
                        <div className="bg-card rounded-xl border p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold">{activeSession.equipment_tag || activeSession.equipment_type_id}</h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[activeSession.status] || 'bg-gray-100'}`}>{activeSession.status}</span>
                                </div>
                                {activeSession.final_confidence != null && (
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Confidence</div>
                                        <div className="text-2xl font-bold text-green-700">{(activeSession.final_confidence * 100).toFixed(0)}%</div>
                                    </div>
                                )}
                            </div>

                            {/* Symptoms */}
                            <div>
                                <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Symptoms Reported</div>
                                <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded p-3">{activeSession.symptoms || 'No symptoms recorded'}</div>
                            </div>

                            {/* Add symptom */}
                            {activeSession.status === 'IN_PROGRESS' && (
                                <div className="flex gap-2">
                                    <input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Describe symptom..."
                                        value={symptomText} onChange={e => setSymptomText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSymptom()} />
                                    <button onClick={handleAddSymptom} className="px-3 py-1 bg-primary text-white rounded text-sm">Add</button>
                                </div>
                            )}

                            {/* Candidate diagnoses */}
                            {activeSession.candidate_diagnoses && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Candidate Diagnoses</div>
                                    <div className="text-sm whitespace-pre-wrap bg-blue-50 rounded p-3">{activeSession.candidate_diagnoses}</div>
                                </div>
                            )}

                            {/* Tests performed */}
                            {activeSession.tests_performed && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Tests Performed</div>
                                    <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded p-3">{activeSession.tests_performed}</div>
                                </div>
                            )}

                            {/* Final diagnosis */}
                            {activeSession.final_fm_code && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-xs font-bold uppercase text-green-800 mb-2">Final Diagnosis</div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground">FM Code:</span> <strong>{activeSession.final_fm_code}</strong></div>
                                        <div><span className="text-muted-foreground">Mechanism:</span> <strong>{activeSession.final_mechanism}</strong></div>
                                        <div><span className="text-muted-foreground">Cause:</span> <strong>{activeSession.final_cause}</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                            Select or create a troubleshooting session to begin diagnosis
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
