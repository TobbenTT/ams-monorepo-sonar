import { useState, useEffect } from 'react';
import { BrainCircuit, Wrench, AlertTriangle, CheckCircle, Loader, Play, ChevronRight, Search, ClipboardCheck, Cpu } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const TABS = [
    { id: 'status', icon: Cpu, label: 'Estado IA' },
    { id: 'troubleshoot', icon: Search, label: 'Troubleshooting' },
    { id: 'checklists', icon: ClipboardCheck, label: 'Checklists' },
    { id: 'sessions', icon: BrainCircuit, label: 'Sesiones' },
    { id: 'tools', icon: Wrench, label: 'Herramientas' },
];

export default function AIAgents() {
    const [tab, setTab] = useState('status');
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Agentes IA (CORTEX)</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
                {TABS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            tab === id
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'status' && <StatusTab />}
            {tab === 'troubleshoot' && <TroubleshootTab />}
            {tab === 'checklists' && <ChecklistsTab />}
            {tab === 'sessions' && <SessionsTab />}
            {tab === 'tools' && <ToolsTab />}
        </div>
    );
}

/* ── Status Tab ─────────────────────────────────────────────────── */

function StatusTab() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAiStatus().then(setStatus).catch(() => setStatus(null)).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingCard />;
    if (!status) return <ErrorCard message="No se pudo conectar con el sistema de IA" />;

    const ready = status.status === 'ready';

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status card */}
            <div className={`rounded-xl border p-5 ${ready ? 'border-green-500/30 bg-green-50' : 'border-yellow-500/30 bg-yellow-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                    {ready ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                    <h3 className="font-semibold text-lg">{ready ? 'Sistema Listo' : 'API Key no configurada'}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    {ready
                        ? 'Los agentes de IA están disponibles para análisis.'
                        : 'Configure ANTHROPIC_API_KEY en el servidor para activar los agentes.'}
                </p>
            </div>

            {/* Tools card */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-3">Herramientas Registradas</h3>
                <div className="text-3xl font-bold text-primary">{status.total_tools}</div>
                <p className="text-sm text-muted-foreground mt-1">herramientas de dominio disponibles</p>
            </div>

            {/* Agents card */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-3">Agentes Especializados</h3>
                <div className="space-y-2">
                    {Object.entries(status.agent_tools || {}).map(([agent, count]) => (
                        <div key={agent} className="flex justify-between items-center text-sm">
                            <span className="capitalize">{agent.replace('_', ' ')}</span>
                            <span className="font-mono text-muted-foreground">{count} tools</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Milestones overview */}
            <div className="rounded-xl border p-5 md:col-span-2 lg:col-span-3">
                <h3 className="font-semibold mb-3">Workflow: 4 Milestones</h3>
                <div className="flex gap-2 flex-wrap">
                    {(status.milestones || []).map((m) => (
                        <div key={m.number} className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                {m.number}
                            </span>
                            <span className="text-sm">{m.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Troubleshooting Tab ────────────────────────────────────────── */

function TroubleshootTab() {
    const [symptom, setSymptom] = useState('');
    const [equipmentTag, setEquipmentTag] = useState('');
    const [plantId, setPlantId] = useState('OCP');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.listDiagnostics().then(setHistory).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptom.trim() || !equipmentTag.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await api.runTroubleshooting({
                equipment_tag: equipmentTag,
                plant_id: plantId,
                symptom_description: symptom,
            });
            setResult(res);
            setHistory(prev => [res, ...prev]);
        } catch (err) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {/* Input form */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" /> Diagnóstico de Fallas
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tag del Equipo</label>
                        <input
                            type="text"
                            value={equipmentTag}
                            onChange={(e) => setEquipmentTag(e.target.value)}
                            placeholder="ej: SAG-MILL-001"
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Planta</label>
                        <input
                            type="text"
                            value={plantId}
                            onChange={(e) => setPlantId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción del Síntoma</label>
                        <textarea
                            value={symptom}
                            onChange={(e) => setSymptom(e.target.value)}
                            placeholder="Describa el comportamiento anormal observado..."
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !symptom.trim() || !equipmentTag.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        {loading ? 'Analizando...' : 'Analizar con IA'}
                    </button>
                </form>
            </div>

            {/* Results */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4">Resultado del Diagnóstico</h3>
                {loading && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Loader className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm">El agente de Confiabilidad está analizando...</p>
                    </div>
                )}
                {result && !result.error && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Confianza:</span>
                            <span className={`font-bold ${result.confidence_score >= 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {Math.round((result.confidence_score || 0) * 100)}%
                            </span>
                        </div>
                        {result.probable_causes?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Causas Probables</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {result.probable_causes.map((c, i) => (
                                        <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {result.recommended_actions?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Acciones Recomendadas</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {result.recommended_actions.map((a, i) => (
                                        <li key={i}>{typeof a === 'string' ? a : JSON.stringify(a)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {result.ai_diagnosis && (
                            <details className="text-sm">
                                <summary className="cursor-pointer font-medium">Diagnóstico completo</summary>
                                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-60">
                                    {JSON.stringify(result.ai_diagnosis, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                )}
                {result?.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {result.error}
                    </div>
                )}
                {!result && !loading && (
                    <p className="text-sm text-muted-foreground">Complete el formulario y haga clic en "Analizar con IA".</p>
                )}
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="rounded-xl border p-5 lg:col-span-2">
                    <h3 className="font-semibold mb-3">Historial de Diagnósticos</h3>
                    <div className="divide-y max-h-60 overflow-y-auto">
                        {history.map((d) => (
                            <div key={d.diagnostic_id} className="py-2 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-medium">{d.equipment_tag}</span>
                                    <span className="text-muted-foreground ml-2">{d.symptom_description?.slice(0, 60)}...</span>
                                </div>
                                <span className={`font-mono text-xs ${d.confidence_score >= 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {Math.round((d.confidence_score || 0) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Checklists Tab ─────────────────────────────────────────────── */

function ChecklistsTab() {
    const [wpId, setWpId] = useState('');
    const [equipmentTag, setEquipmentTag] = useState('');
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!wpId.trim()) return;
        setLoading(true);
        try {
            const res = await api.generateChecklist({
                work_package_id: wpId,
                equipment_tag: equipmentTag,
            });
            setChecklist(res);
        } catch (err) {
            setChecklist({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (index) => {
        if (!checklist?.checklist_id) return;
        const items = checklist.checklist_items || [];
        const item = items[index];
        if (!item) return;
        try {
            const updated = await api.updateChecklistItem(checklist.checklist_id, {
                item_index: index,
                completed: !item.completed,
            });
            setChecklist(updated);
        } catch {
            // ignore
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" /> Generar Checklist
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">ID del Work Package</label>
                        <input
                            type="text"
                            value={wpId}
                            onChange={(e) => setWpId(e.target.value)}
                            placeholder="ej: WP-001"
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tag del Equipo (opcional)</label>
                        <input
                            type="text"
                            value={equipmentTag}
                            onChange={(e) => setEquipmentTag(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !wpId.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                        {loading ? 'Generando...' : 'Generar Checklist'}
                    </button>
                </div>
            </div>

            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4">Checklist de Ejecución</h3>
                {checklist && !checklist.error && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Progreso:</span>
                            <span className="font-bold">{checklist.completed_items}/{checklist.total_items}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${checklist.total_items > 0 ? (checklist.completed_items / checklist.total_items) * 100 : 0}%` }}
                            />
                        </div>

                        {(checklist.safety_items || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-red-600 mb-1">Seguridad</h4>
                                {checklist.safety_items.map((item, i) => (
                                    <ChecklistItem key={`s-${i}`} item={item} />
                                ))}
                            </div>
                        )}

                        {(checklist.loto_steps || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-yellow-600 mb-1">LOTO</h4>
                                {checklist.loto_steps.map((item, i) => (
                                    <ChecklistItem key={`l-${i}`} item={item} />
                                ))}
                            </div>
                        )}

                        {(checklist.checklist_items || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Pasos de Ejecución</h4>
                                {checklist.checklist_items.map((item, i) => (
                                    <ChecklistItem key={`c-${i}`} item={item} onClick={() => toggleItem(i)} />
                                ))}
                            </div>
                        )}

                        {(checklist.ppe_requirements || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">EPP Requerido</h4>
                                <div className="flex flex-wrap gap-1">
                                    {checklist.ppe_requirements.map((ppe, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{ppe}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {checklist?.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{checklist.error}</div>
                )}
                {!checklist && !loading && (
                    <p className="text-sm text-muted-foreground">Ingrese un Work Package ID para generar el checklist.</p>
                )}
            </div>
        </div>
    );
}

function ChecklistItem({ item, onClick }) {
    return (
        <div
            className={`flex items-center gap-2 py-1.5 text-sm ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                {item.description}
            </span>
        </div>
    );
}

/* ── Sessions Tab ───────────────────────────────────────────────── */

function SessionsTab() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [equipmentTag, setEquipmentTag] = useState('');

    useEffect(() => {
        api.listAiSessions().then(setSessions).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!equipmentTag.trim()) return;
        setCreating(true);
        try {
            const session = await api.createAiSession({ equipment_tag: equipmentTag });
            setSessions(prev => [session, ...prev]);
            setEquipmentTag('');
        } catch (err) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <LoadingCard />;

    return (
        <div className="space-y-4">
            {/* Create session */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-3">Nueva Sesión de Estrategia</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={equipmentTag}
                        onChange={(e) => setEquipmentTag(e.target.value)}
                        placeholder="Tag del equipo (ej: SAG-MILL-001)"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating || !equipmentTag.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Iniciar
                    </button>
                </div>
            </div>

            {/* Sessions list */}
            {sessions.length > 0 ? (
                <div className="rounded-xl border divide-y">
                    {sessions.map((s) => (
                        <div key={s.session_id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium text-sm">{s.equipment_tag}</div>
                                <div className="text-xs text-muted-foreground">
                                    Milestone {s.current_milestone}/4 · {s.status}
                                    {s.created_at && ` · ${new Date(s.created_at).toLocaleDateString()}`}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {(s.milestone_gates || []).map((g) => (
                                        <div
                                            key={g.number}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                g.status === 'APPROVED' ? 'bg-green-500 text-white' :
                                                g.status === 'PRESENTED' ? 'bg-yellow-500 text-white' :
                                                g.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                                                g.status === 'REJECTED' ? 'bg-red-500 text-white' :
                                                'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {g.number}
                                        </div>
                                    ))}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    No hay sesiones activas. Cree una nueva sesión para comenzar.
                </div>
            )}
        </div>
    );
}

/* ── Tools Tab ──────────────────────────────────────────────────── */

function ToolsTab() {
    const [tools, setTools] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listAiTools()
            .then((data) => setTools(data.tools || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = tools.filter(
        (t) => t.name.includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingCard />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar herramientas..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background"
                />
                <span className="text-sm text-muted-foreground">{filtered.length} herramientas</span>
            </div>
            <div className="rounded-xl border divide-y max-h-[60vh] overflow-y-auto">
                {filtered.map((tool) => (
                    <div key={tool.name} className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-primary">{tool.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{tool.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Shared components ──────────────────────────────────────────── */

function LoadingCard() {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
    );
}

function ErrorCard({ message }) {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {message}
        </div>
    );
}
