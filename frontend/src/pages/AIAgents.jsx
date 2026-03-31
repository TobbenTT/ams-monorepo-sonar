import { useState, useEffect } from 'react';
import { BrainCircuit, Wrench, AlertTriangle, CheckCircle, Loader, Play, ChevronRight, Search, ClipboardCheck, Cpu, FolderOpen, Users, Building2, FlaskConical, HardHat, DollarSign, Globe } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

const TABS = [
    { id: 'status', icon: Cpu, label: 'Estado IA' },
    { id: 'troubleshoot', icon: Search, label: 'Troubleshooting' },
    { id: 'checklists', icon: ClipboardCheck, label: 'Checklists' },
    { id: 'sessions', icon: BrainCircuit, label: 'Sesiones' },
    { id: 'or_projects', icon: FolderOpen, label: 'Proyectos OR' },
    { id: 'tools', icon: Wrench, label: 'Herramientas' },
];

// Agent display metadata
const AGENT_META = {
    orchestrator:        { label: 'Orchestrator',         team: 'A', icon: BrainCircuit, color: 'bg-purple-100 text-purple-700' },
    project_orchestrator:{ label: 'Project Orchestrator', team: 'A', icon: Building2,    color: 'bg-purple-100 text-purple-700' },
    engineering:         { label: 'Engineering & Design', team: 'A', icon: FlaskConical, color: 'bg-blue-100 text-blue-700' },
    construction:        { label: 'Construction Mgmt',    team: 'A', icon: HardHat,      color: 'bg-blue-100 text-blue-700' },
    contracts:           { label: 'Contracts & Compliance',team:'A', icon: Wrench,       color: 'bg-blue-100 text-blue-700' },
    reliability:         { label: 'Asset Management',     team: 'B', icon: Cpu,          color: 'bg-green-100 text-green-700' },
    planning:            { label: 'Planning',             team: 'B', icon: ClipboardCheck,color:'bg-green-100 text-green-700' },
    spare_parts:         { label: 'Spare Parts',          team: 'B', icon: Wrench,       color: 'bg-green-100 text-green-700' },
    operations:          { label: 'Operations',           team: 'B', icon: Users,        color: 'bg-green-100 text-green-700' },
    hse:                 { label: 'HSE',                  team: 'B', icon: AlertTriangle, color:'bg-red-100 text-red-700' },
    execution:           { label: 'Execution',            team: 'B', icon: Play,         color: 'bg-green-100 text-green-700' },
    finance:             { label: 'Finance',              team: 'C', icon: DollarSign,   color: 'bg-orange-100 text-orange-700' },
    hr_talent:           { label: 'HR & Talent',          team: 'C', icon: Users,        color: 'bg-orange-100 text-orange-700' },
    it_ot:               { label: 'IT/OT & Comms',        team: 'C', icon: Cpu,          color: 'bg-orange-100 text-orange-700' },
    web_intelligence:    { label: 'Web Intelligence',     team: 'D', icon: Globe,        color: 'bg-gray-100 text-gray-700' },
};

const TEAM_LABELS = {
    A: 'Team A — Project Delivery',
    B: 'Team B — Operations & Assets',
    C: 'Team C — Corporate Support',
    D: 'Team D — Intelligence',
};

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
            <div className="flex gap-1 bg-muted rounded-lg p-1 flex-wrap">
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
            {tab === 'status'       && <StatusTab />}
            {tab === 'troubleshoot' && <TroubleshootTab />}
            {tab === 'checklists'   && <ChecklistsTab />}
            {tab === 'sessions'     && <SessionsTab />}
            {tab === 'or_projects'  && <ORProjectsTab />}
            {tab === 'tools'        && <ToolsTab />}
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
    const agentTools = status.agent_tools || {};
    const teams = status.agent_teams || {};

    // Group agents by team
    const teamGroups = {};
    Object.entries(agentTools).forEach(([agent, count]) => {
        const meta = AGENT_META[agent];
        if (!meta) return;
        const team = meta.team;
        if (!teamGroups[team]) teamGroups[team] = [];
        teamGroups[team].push({ agent, count, meta });
    });

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                {/* Status card */}
                <div className={`rounded-xl border p-5 ${ready ? 'border-green-500/30 bg-green-50' : 'border-yellow-500/30 bg-yellow-50'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        {ready ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                        <h3 className="font-semibold text-lg">{ready ? 'Sistema Listo' : 'API Key no configurada'}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {ready
                            ? 'Los 13 agentes CORTEX están disponibles.'
                            : 'Configure ANTHROPIC_API_KEY en el servidor para activar los agentes.'}
                    </p>
                </div>

                {/* Tools count */}
                <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Herramientas Registradas</h3>
                    <div className="text-4xl font-bold text-primary">{status.total_tools}</div>
                    <p className="text-sm text-muted-foreground mt-1">herramientas de dominio disponibles</p>
                </div>

                {/* Agents count */}
                <div className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-1">Agentes Especializados</h3>
                    <div className="text-4xl font-bold text-primary">{Object.keys(agentTools).length}</div>
                    <p className="text-sm text-muted-foreground mt-1">agentes en 4 equipos de trabajo</p>
                </div>
            </div>

            {/* Teams */}
            {Object.entries(teamGroups).sort(([a], [b]) => a.localeCompare(b)).map(([team, agents]) => (
                <div key={team} className="rounded-xl border p-5">
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        {TEAM_LABELS[team] || `Team ${team}`}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {agents.map(({ agent, count, meta }) => {
                            const Icon = meta.icon;
                            return (
                                <div key={agent} className={`rounded-lg px-3 py-2 ${meta.color}`}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-semibold truncate">{meta.label}</span>
                                    </div>
                                    <div className="text-xs opacity-75">{count} tools</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* OR Gates */}
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-3">Workflow: 5 Gates OR</h3>
                <div className="flex gap-2 flex-wrap">
                    {(status.milestones || []).map((m) => (
                        <div key={m.number} className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                G{m.number}
                            </span>
                            <span className="text-sm">{m.name.replace(/^G\d+ — /, '')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── OR Projects Tab ────────────────────────────────────────────── */

function ORProjectsTab() {
    const toast = useToast();
    const [projects, setProjects] = useState([]);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ client_name: '', plant_code: '', project_type: 'greenfield' });
    const [showForm, setShowForm] = useState(false);

    const handleCreate = async () => {
        if (!form.client_name.trim()) return;
        setCreating(true);
        try {
            const res = await api.createORProject(form);
            setProjects(prev => [res, ...prev]);
            setForm({ client_name: '', plant_code: '', project_type: 'greenfield' });
            setShowForm(false);
        } catch (err) {
            toast.error('Error al crear proyecto: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        api.listORProjects().then(setProjects).catch(() => {});
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Proyectos Operational Readiness</h3>
                    <p className="text-sm text-muted-foreground">Cada proyecto activa múltiples agentes CORTEX para generar entregables de consultoría</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                    <Play className="w-4 h-4" />
                    Nuevo Proyecto
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="rounded-xl border p-5 bg-muted/30">
                    <h4 className="font-semibold mb-3">Nuevo Proyecto OR</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cliente</label>
                            <input
                                type="text"
                                value={form.client_name}
                                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                                placeholder="ej: OCP Group"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Código de Planta</label>
                            <input
                                type="text"
                                value={form.plant_code}
                                onChange={e => setForm(f => ({ ...f, plant_code: e.target.value }))}
                                placeholder="ej: OCP-JFC2"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo de Proyecto</label>
                            <select
                                value={form.project_type}
                                onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                            >
                                <option value="greenfield">Greenfield (planta nueva)</option>
                                <option value="brownfield">Brownfield (ampliación)</option>
                                <option value="revamp">Revamp (renovación)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !form.client_name.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Crear
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Projects list */}
            {projects.length > 0 ? (
                <div className="rounded-xl border divide-y">
                    {projects.map((p, idx) => (
                        <div key={p.project_id || idx} className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{p.client_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {p.plant_code && <span className="mr-2">{p.plant_code}</span>}
                                        <span className="capitalize">{p.project_type}</span>
                                        {p.created_at && ` · ${new Date(p.created_at).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Gate progress */}
                                    <div className="flex gap-1">
                                        {['G0','G1','G2','G3','G4'].map((g) => {
                                            const gStatus = (p.gate_status || {})[g];
                                            return (
                                                <div
                                                    key={g}
                                                    title={`${g}: ${gStatus || 'PENDING'}`}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        gStatus === 'COMPLETED' ? 'bg-green-500 text-white' :
                                                        gStatus === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                                                        'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {g.replace('G','')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {p.status || 'ACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                    <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No active OR projects.</p>
                    <p>Cree un nuevo proyecto para activar los 13 agentes CORTEX.</p>
                </div>
            )}
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
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" /> Diagnóstico de Fallas
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tag del Equipo</label>
                        <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
                            placeholder="ej: SAG-MILL-001" className="w-full px-3 py-2 border rounded-lg text-sm bg-background" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Planta</label>
                        <input type="text" value={plantId} onChange={(e) => setPlantId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción del Síntoma</label>
                        <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)}
                            placeholder="Describa el comportamiento anormal observado..."
                            rows={4} className="w-full px-3 py-2 border rounded-lg text-sm bg-background resize-none" />
                    </div>
                    <button type="submit" disabled={loading || !symptom.trim() || !equipmentTag.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        {loading ? 'Analizando...' : 'Analizar con IA'}
                    </button>
                </form>
            </div>

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
                                    {result.probable_causes.map((c, i) => <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>)}
                                </ul>
                            </div>
                        )}
                        {result.recommended_actions?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Acciones Recomendadas</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {result.recommended_actions.map((a, i) => <li key={i}>{typeof a === 'string' ? a : JSON.stringify(a)}</li>)}
                                </ul>
                            </div>
                        )}
                        {result.ai_diagnosis && (
                            <details className="text-sm">
                                <summary className="cursor-pointer font-medium">Diagnóstico completo</summary>
                                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-60">{JSON.stringify(result.ai_diagnosis, null, 2)}</pre>
                            </details>
                        )}
                    </div>
                )}
                {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{result.error}</div>}
                {!result && !loading && <p className="text-sm text-muted-foreground">Complete el formulario y haga clic en "Analizar con IA".</p>}
            </div>

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
            const res = await api.generateChecklist({ work_package_id: wpId, equipment_tag: equipmentTag });
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
            const updated = await api.updateChecklistItem(checklist.checklist_id, { item_index: index, completed: !item.completed });
            setChecklist(updated);
        } catch { /* ignore */ }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> Generar Checklist</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">ID del Work Package</label>
                        <input type="text" value={wpId} onChange={(e) => setWpId(e.target.value)}
                            placeholder="ej: WP-001" className="w-full px-3 py-2 border rounded-lg text-sm bg-background" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tag del Equipo (opcional)</label>
                        <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background" />
                    </div>
                    <button onClick={handleGenerate} disabled={loading || !wpId.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">
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
                            <div className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${checklist.total_items > 0 ? (checklist.completed_items / checklist.total_items) * 100 : 0}%` }} />
                        </div>
                        {(checklist.safety_items || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-red-600 mb-1">Seguridad</h4>
                                {checklist.safety_items.map((item, i) => <ChecklistItem key={`s-${i}`} item={item} />)}
                            </div>
                        )}
                        {(checklist.loto_steps || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-yellow-600 mb-1">LOTO</h4>
                                {checklist.loto_steps.map((item, i) => <ChecklistItem key={`l-${i}`} item={item} />)}
                            </div>
                        )}
                        {(checklist.checklist_items || []).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Pasos de Ejecución</h4>
                                {checklist.checklist_items.map((item, i) => <ChecklistItem key={`c-${i}`} item={item} onClick={() => toggleItem(i)} />)}
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
                {checklist?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{checklist.error}</div>}
                {!checklist && !loading && <p className="text-sm text-muted-foreground">Ingrese un Work Package ID para generar el checklist.</p>}
            </div>
        </div>
    );
}

function ChecklistItem({ item, onClick }) {
    return (
        <div className={`flex items-center gap-2 py-1.5 text-sm ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.description}</span>
        </div>
    );
}

/* ── Sessions Tab ───────────────────────────────────────────────── */

function SessionsTab() {
    const toast = useToast();
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
            toast.error(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <LoadingCard />;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border p-5">
                <h3 className="font-semibold mb-3">Nueva Sesión de Estrategia</h3>
                <div className="flex gap-2">
                    <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
                        placeholder="Tag del equipo (ej: SAG-MILL-001)"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background" />
                    <button onClick={handleCreate} disabled={creating || !equipmentTag.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">
                        {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Iniciar
                    </button>
                </div>
            </div>

            {sessions.length > 0 ? (
                <div className="rounded-xl border divide-y">
                    {sessions.map((s) => (
                        <div key={s.session_id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium text-sm">{s.equipment_tag}</div>
                                <div className="text-xs text-muted-foreground">
                                    Gate {s.current_milestone}/{(s.milestone_gates || []).length} · {s.status}
                                    {s.created_at && ` · ${new Date(s.created_at).toLocaleDateString()}`}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {(s.milestone_gates || []).map((g) => (
                                        <div key={g.number}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                g.status === 'APPROVED'    ? 'bg-green-500 text-white' :
                                                g.status === 'PRESENTED'  ? 'bg-yellow-500 text-white' :
                                                g.status === 'IN_PROGRESS'? 'bg-blue-500 text-white' :
                                                g.status === 'REJECTED'   ? 'bg-red-500 text-white' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
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
                    No active sessions. Create a new session to start.
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
        api.listAiTools().then((data) => setTools(data.tools || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const filtered = tools.filter(
        (t) => t.name.includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingCard />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar herramientas..." className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background" />
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
