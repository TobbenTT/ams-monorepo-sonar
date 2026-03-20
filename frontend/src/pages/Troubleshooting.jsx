import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KPICard, LoadingSpinner } from '../components/Shared';
import * as api from '../api';

const STATUS_COLORS = {
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DIAGNOSED: 'bg-green-100 text-green-800',
    ESCALATED: 'bg-yellow-100 text-yellow-800',
    ABANDONED: 'bg-red-100 text-red-800',
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
    const [recommendedTests, setRecommendedTests] = useState([]);
    const [testForm, setTestForm] = useState({ test_id: '', result: '', measured_value: '' });

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
            const updated = await api.addSymptom(activeSession.session_id, { description: symptomText });
            setActiveSession(updated);
            setSymptomText('');
            // Refresh recommended tests after new symptom
            loadTests(activeSession.session_id);
        } catch { /* ignore */ }
    };

    const loadTests = async (sessionId) => {
        try {
            const tests = await api.getDiagnosticTests(sessionId);
            setRecommendedTests(Array.isArray(tests) ? tests : []);
        } catch { setRecommendedTests([]); }
    };

    const handleViewSession = async (id) => {
        try {
            const session = await api.getTroubleshootingSession(id);
            setActiveSession(session);
            if (session.status === 'IN_PROGRESS') loadTests(id);
            else setRecommendedTests([]);
        } catch { /* ignore */ }
    };

    const handleRecordTest = async () => {
        if (!activeSession || !testForm.test_id || !testForm.result) return;
        try {
            const updated = await api.recordTestResult(activeSession.session_id, testForm);
            setActiveSession(updated);
            setTestForm({ test_id: '', result: '', measured_value: '' });
            loadTests(activeSession.session_id);
        } catch { /* ignore */ }
    };

    const handleFinalize = async (fmCode) => {
        if (!activeSession) return;
        try {
            const updated = await api.completeTroubleshooting(activeSession.session_id, { selected_fm_code: fmCode });
            setActiveSession(updated);
            setRecommendedTests([]);
            await load();
        } catch { /* ignore */ }
    };

    if (loading) return <LoadingSpinner message="Cargando sesiones de troubleshooting..." />;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-foreground mb-5">Troubleshooting Interactivo</h1>

            <div className="grid md:grid-cols-3 gap-5">
                {/* Left: Session List + Create */}
                <div className="space-y-4">
                    {/* Create new session */}
                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Nueva Sesión de Diagnóstico</div>
                        <div className="space-y-2">
                            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Tipo de Equipo (ID)"
                                value={form.equipment_type_id} onChange={e => setForm({ ...form, equipment_type_id: e.target.value })} />
                            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Tag del Equipo"
                                value={form.equipment_tag} onChange={e => setForm({ ...form, equipment_tag: e.target.value })} />
                            <button onClick={handleCreate} disabled={creating || !form.equipment_type_id}
                                className="w-full px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50">
                                {creating ? 'Creando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </div>

                    {/* Session list */}
                    <div className="bg-card rounded-xl border p-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Sesiones Recientes ({sessions.length})</div>
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
                            {sessions.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">Sin sesiones aún</div>}
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
                                        <div className="text-xs text-muted-foreground">Confianza</div>
                                        <div className="text-2xl font-bold text-green-700">{(activeSession.final_confidence * 100).toFixed(0)}%</div>
                                    </div>
                                )}
                            </div>

                            {/* Symptoms */}
                            <div>
                                <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Síntomas Reportados</div>
                                {Array.isArray(activeSession.symptoms) && activeSession.symptoms.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {activeSession.symptoms.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2 text-sm">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                                    s.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                    s.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                    s.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>{s.severity || 'MEDIUM'}</span>
                                                {s.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.category}</span>}
                                                <span>{s.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground bg-muted/30 rounded p-3">Sin síntomas registrados</div>
                                )}
                            </div>

                            {/* Add symptom */}
                            {activeSession.status === 'IN_PROGRESS' && (
                                <div className="flex gap-2">
                                    <input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Describir síntoma..."
                                        value={symptomText} onChange={e => setSymptomText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSymptom()} />
                                    <button onClick={handleAddSymptom} className="px-3 py-1 bg-primary text-white rounded text-sm">Agregar</button>
                                </div>
                            )}

                            {/* Recommended tests */}
                            {activeSession.status === 'IN_PROGRESS' && recommendedTests.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Pruebas Recomendadas</div>
                                    <div className="space-y-1.5">
                                        {recommendedTests.map((t, i) => (
                                            <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded px-3 py-2 text-sm flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">{t.test_type || t.test_id}</span>
                                                    {t.description && <span className="text-muted-foreground ml-2">— {t.description}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {t.estimated_time_minutes && <span>{t.estimated_time_minutes}min</span>}
                                                    {t.estimated_cost_usd && <span>${t.estimated_cost_usd}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Record test result */}
                            {activeSession.status === 'IN_PROGRESS' && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Registrar Resultado de Prueba</div>
                                    <div className="flex gap-2 flex-wrap">
                                        <input className="border rounded px-2 py-1 text-sm w-32" placeholder="ID Prueba"
                                            value={testForm.test_id} onChange={e => setTestForm({ ...testForm, test_id: e.target.value })} />
                                        <select className="border rounded px-2 py-1 text-sm" value={testForm.result}
                                            onChange={e => setTestForm({ ...testForm, result: e.target.value })}>
                                            <option value="">Resultado...</option>
                                            <option value="PASS">PASS (Normal)</option>
                                            <option value="FAIL">FAIL (Anormal)</option>
                                            <option value="INCONCLUSIVE">Inconcluso</option>
                                        </select>
                                        <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="Valor medido (opcional)"
                                            value={testForm.measured_value} onChange={e => setTestForm({ ...testForm, measured_value: e.target.value })} />
                                        <button onClick={handleRecordTest} disabled={!testForm.test_id || !testForm.result}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">Registrar</button>
                                    </div>
                                </div>
                            )}

                            {/* Candidate diagnoses */}
                            {Array.isArray(activeSession.candidate_diagnoses) && activeSession.candidate_diagnoses.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Diagnósticos Candidatos</div>
                                    <div className="space-y-1.5">
                                        {activeSession.candidate_diagnoses.map((c, i) => (
                                            <div key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-sm flex items-center justify-between">
                                                <div>
                                                    <span className="font-bold text-blue-800 dark:text-blue-300">{c.fm_code}</span>
                                                    <span className="ml-2">{c.mechanism}</span>
                                                    {c.cause && <span className="text-muted-foreground ml-1">— {c.cause}</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium">{(c.confidence * 100).toFixed(0)}%</span>
                                                    {activeSession.status === 'IN_PROGRESS' && (
                                                        <button onClick={() => handleFinalize(c.fm_code)}
                                                            className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700">
                                                            Seleccionar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tests performed */}
                            {Array.isArray(activeSession.tests_performed) && activeSession.tests_performed.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Pruebas Realizadas</div>
                                    <div className="space-y-1.5">
                                        {activeSession.tests_performed.map((t, i) => (
                                            <div key={i} className="bg-muted/30 rounded px-3 py-2 text-sm flex items-center justify-between">
                                                <span>{t.test_id || t.test_type}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                                    t.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                                                    t.result === 'PASS' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>{t.result}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Final diagnosis */}
                            {activeSession.final_fm_code && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="text-xs font-bold uppercase text-green-800 dark:text-green-300 mb-2">Diagnóstico Final</div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-muted-foreground">Código FM:</span> <strong>{activeSession.final_fm_code}</strong></div>
                                        <div><span className="text-muted-foreground">Mecanismo:</span> <strong>{activeSession.final_mechanism}</strong></div>
                                        <div><span className="text-muted-foreground">Causa:</span> <strong>{activeSession.final_cause}</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                            Selecciona o crea una sesión de troubleshooting para comenzar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
