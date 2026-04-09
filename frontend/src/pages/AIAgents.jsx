import { useState, useEffect } from 'react';
import {
  BrainCircuit, Wrench, AlertTriangle, CheckCircle, Loader2, Play, ChevronRight, ChevronDown,
  Search, ClipboardCheck, Cpu, FolderOpen, Users, Building2, FlaskConical, HardHat,
  DollarSign, Globe, Zap, Shield, Activity, Bot, Sparkles,
} from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

const TABS = [
  { id: 'status', icon: Activity, label: 'Overview' },
  { id: 'troubleshoot', icon: Search, label: 'Diagnostics' },
  { id: 'checklists', icon: ClipboardCheck, label: 'Checklists' },
  { id: 'sessions', icon: BrainCircuit, label: 'Strategy' },
  { id: 'or_projects', icon: FolderOpen, label: 'OR Projects' },
  { id: 'tools', icon: Wrench, label: 'Tools' },
];

const AGENT_META = {
  orchestrator:         { label: 'Orchestrator',          team: 'A', icon: BrainCircuit, gradient: 'from-purple-500 to-indigo-500' },
  project_orchestrator: { label: 'Project Orchestrator',  team: 'A', icon: Building2,    gradient: 'from-purple-500 to-indigo-500' },
  engineering:          { label: 'Engineering & Design',  team: 'A', icon: FlaskConical, gradient: 'from-blue-500 to-indigo-500' },
  construction:         { label: 'Construction Mgmt',     team: 'A', icon: HardHat,      gradient: 'from-blue-500 to-indigo-500' },
  contracts:            { label: 'Contracts & Compliance', team: 'A', icon: Shield,      gradient: 'from-blue-500 to-indigo-500' },
  reliability:          { label: 'Asset Management',      team: 'B', icon: Cpu,          gradient: 'from-emerald-500 to-teal-500' },
  planning:             { label: 'Planning',              team: 'B', icon: ClipboardCheck, gradient: 'from-emerald-500 to-teal-500' },
  spare_parts:          { label: 'Spare Parts',           team: 'B', icon: Wrench,       gradient: 'from-emerald-500 to-teal-500' },
  operations:           { label: 'Operations',            team: 'B', icon: Users,        gradient: 'from-emerald-500 to-teal-500' },
  hse:                  { label: 'HSE',                   team: 'B', icon: AlertTriangle, gradient: 'from-red-500 to-orange-500' },
  execution:            { label: 'Execution',             team: 'B', icon: Play,         gradient: 'from-emerald-500 to-teal-500' },
  finance:              { label: 'Finance',               team: 'C', icon: DollarSign,   gradient: 'from-amber-500 to-orange-500' },
  hr_talent:            { label: 'HR & Talent',           team: 'C', icon: Users,        gradient: 'from-amber-500 to-orange-500' },
  it_ot:                { label: 'IT/OT & Comms',         team: 'C', icon: Cpu,          gradient: 'from-amber-500 to-orange-500' },
  web_intelligence:     { label: 'Web Intelligence',      team: 'D', icon: Globe,        gradient: 'from-slate-500 to-zinc-500' },
};

const TEAM_META = {
  A: { label: 'Project Delivery', color: 'border-indigo-200 bg-indigo-50/50', badge: 'bg-indigo-100 text-indigo-700' },
  B: { label: 'Operations & Assets', color: 'border-emerald-200 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' },
  C: { label: 'Corporate Support', color: 'border-amber-200 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
  D: { label: 'Intelligence', color: 'border-slate-200 bg-slate-50/50', badge: 'bg-slate-100 text-slate-700' },
};

export default function AIAgents() {
  const [tab, setTab] = useState('status');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-fuchsia-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CORTEX AI Engine</h1>
              <p className="text-purple-100 text-sm">Intelligent maintenance agents for autonomous decision-making</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1.5 flex-wrap">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

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
  if (!status) return <ErrorCard message="Could not connect to AI system" />;

  const ready = status.status === 'ready';
  const agentTools = status.agent_tools || {};

  const teamGroups = {};
  Object.entries(agentTools).forEach(([agent, count]) => {
    const meta = AGENT_META[agent];
    if (!meta) return;
    if (!teamGroups[meta.team]) teamGroups[meta.team] = [];
    teamGroups[meta.team].push({ agent, count, meta });
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className={`rounded-2xl p-5 border-2 ${ready ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            {ready ? <CheckCircle className="w-7 h-7 text-emerald-500" /> : <AlertTriangle className="w-7 h-7 text-amber-500" />}
            <span className="font-bold text-lg">{ready ? 'Online' : 'Offline'}</span>
          </div>
          <p className="text-sm text-gray-600">{ready ? 'All CORTEX agents operational' : 'API key not configured'}</p>
        </div>

        <div className="rounded-2xl p-5 border bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Tools</span>
            <Wrench className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{status.total_tools}</div>
          <p className="text-xs text-gray-400 mt-1">domain tools registered</p>
        </div>

        <div className="rounded-2xl p-5 border bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Agents</span>
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{Object.keys(agentTools).length}</div>
          <p className="text-xs text-gray-400 mt-1">specialized agents</p>
        </div>

        <div className="rounded-2xl p-5 border bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Teams</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">4</div>
          <p className="text-xs text-gray-400 mt-1">work teams active</p>
        </div>
      </div>

      {/* Teams */}
      {Object.entries(teamGroups).sort(([a], [b]) => a.localeCompare(b)).map(([team, agents]) => {
        const tmeta = TEAM_META[team] || {};
        return (
          <div key={team} className={`rounded-2xl border-2 p-5 ${tmeta.color}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tmeta.badge}`}>TEAM {team}</span>
              <span className="text-sm font-semibold text-gray-700">{tmeta.label}</span>
              <span className="text-xs text-gray-400 ml-auto">{agents.length} agents</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {agents.map(({ agent, count, meta }) => {
                const Icon = meta.icon;
                return (
                  <div key={agent} className="bg-white rounded-xl p-3 border shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{meta.label}</p>
                    <p className="text-xs text-gray-400">{count} tools</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* OR Gates */}
      {status.milestones?.length > 0 && (
        <div className="rounded-2xl border p-5 bg-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Workflow: 5 Gates OR
          </h3>
          <div className="flex gap-3 flex-wrap">
            {status.milestones.map((m) => (
              <div key={m.number} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-3 border">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  G{m.number}
                </span>
                <span className="text-sm font-medium text-gray-700">{m.name.replace(/^G\d+ — /, '')}</span>
              </div>
            ))}
          </div>
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

  useEffect(() => { api.listDiagnostics().then(setHistory).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptom.trim() || !equipmentTag.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.runTroubleshooting({ equipment_tag: equipmentTag, plant_id: plantId, symptom_description: symptom });
      setResult(res);
      setHistory(prev => [res, ...prev]);
    } catch (err) { setResult({ error: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          AI Fault Diagnostics
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Equipment Tag</label>
              <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
                placeholder="e.g. SAG-MILL-001" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Plant</label>
              <input type="text" value={plantId} onChange={(e) => setPlantId(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Symptom Description</label>
            <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)}
              placeholder="Describe the abnormal behavior observed..."
              rows={4} className="w-full px-3 py-2.5 border rounded-xl text-sm resize-none" />
          </div>
          <button type="submit" disabled={loading || !symptom.trim() || !equipmentTag.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-bold mb-4 text-lg">Diagnosis Result</h3>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Reliability agent analyzing...</p>
          </div>
        )}
        {result && !result.error && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Confidence:</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(result.confidence_score || 0) >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${(result.confidence_score || 0) * 100}%` }} />
              </div>
              <span className={`text-sm font-bold ${(result.confidence_score || 0) >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {Math.round((result.confidence_score || 0) * 100)}%
              </span>
            </div>
            {result.probable_causes?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600">Probable Causes</h4>
                <div className="space-y-1.5">
                  {result.probable_causes.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-red-50 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {typeof c === 'string' ? c : JSON.stringify(c)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.recommended_actions?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-emerald-600">Recommended Actions</h4>
                <div className="space-y-1.5">
                  {result.recommended_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-emerald-50 rounded-lg px-3 py-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {typeof a === 'string' ? a : JSON.stringify(a)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.ai_diagnosis && (
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-800">Full diagnosis JSON</summary>
                <pre className="mt-2 p-4 bg-gray-50 rounded-xl text-xs overflow-auto max-h-60 border">{JSON.stringify(result.ai_diagnosis, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
        {result?.error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{result.error}</div>}
        {!result && !loading && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Fill the form and click "Analyze with AI"</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Diagnostic History</h3>
          <div className="divide-y max-h-60 overflow-y-auto rounded-xl border">
            {history.map((d) => (
              <div key={d.diagnostic_id} className="py-3 px-4 flex justify-between items-center text-sm hover:bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-800">{d.equipment_tag}</span>
                  <span className="text-gray-400 ml-2">{d.symptom_description?.slice(0, 60)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${(d.confidence_score || 0) >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${(d.confidence_score || 0) * 100}%` }} />
                  </div>
                  <span className={`font-mono text-xs font-bold ${(d.confidence_score || 0) >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.round((d.confidence_score || 0) * 100)}%
                  </span>
                </div>
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
    try { setChecklist(await api.generateChecklist({ work_package_id: wpId, equipment_tag: equipmentTag })); }
    catch (err) { setChecklist({ error: err.message }); }
    finally { setLoading(false); }
  };

  const toggleItem = async (index) => {
    if (!checklist?.checklist_id) return;
    try { setChecklist(await api.updateChecklistItem(checklist.checklist_id, { item_index: index, completed: !(checklist.checklist_items || [])[index]?.completed })); }
    catch { /* ignore */ }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-white" />
          </div>
          Generate Checklist
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Work Package ID</label>
            <input type="text" value={wpId} onChange={(e) => setWpId(e.target.value)}
              placeholder="e.g. WP-001" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Equipment Tag (optional)</label>
            <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <button onClick={handleGenerate} disabled={loading || !wpId.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Checklist'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-bold mb-4 text-lg">Execution Checklist</h3>
        {checklist && !checklist.error ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                  style={{ width: `${checklist.total_items > 0 ? (checklist.completed_items / checklist.total_items) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-700">{checklist.completed_items}/{checklist.total_items}</span>
            </div>
            {(checklist.safety_items || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Safety</h4>
                {checklist.safety_items.map((item, i) => <CItem key={`s-${i}`} item={item} />)}
              </div>
            )}
            {(checklist.loto_steps || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">LOTO</h4>
                {checklist.loto_steps.map((item, i) => <CItem key={`l-${i}`} item={item} />)}
              </div>
            )}
            {(checklist.checklist_items || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Execution Steps</h4>
                {checklist.checklist_items.map((item, i) => <CItem key={`c-${i}`} item={item} onClick={() => toggleItem(i)} />)}
              </div>
            )}
            {(checklist.ppe_requirements || []).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">PPE Required</h4>
                <div className="flex flex-wrap gap-1.5">
                  {checklist.ppe_requirements.map((ppe, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">{ppe}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : checklist?.error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{checklist.error}</div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter a Work Package ID to generate the checklist</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CItem({ item, onClick }) {
  return (
    <div className={`flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
        {item.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{item.description}</span>
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

  useEffect(() => { api.listAiSessions().then(setSessions).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!equipmentTag.trim()) return;
    setCreating(true);
    try {
      const session = await api.createAiSession({ equipment_tag: equipmentTag });
      setSessions(prev => [session, ...prev]);
      setEquipmentTag('');
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          New Strategy Session
        </h3>
        <div className="flex gap-3">
          <input type="text" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)}
            placeholder="Equipment tag (e.g. SAG-MILL-001)"
            className="flex-1 px-3 py-2.5 border rounded-xl text-sm" />
          <button onClick={handleCreate} disabled={creating || !equipmentTag.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start
          </button>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="rounded-2xl border bg-white divide-y overflow-hidden">
          {sessions.map((s) => (
            <div key={s.session_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold text-sm text-gray-800">{s.equipment_tag}</div>
                <div className="text-xs text-gray-400">
                  Gate {s.current_milestone}/{(s.milestone_gates || []).length} · {s.status}
                  {s.created_at && ` · ${new Date(s.created_at).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {(s.milestone_gates || []).map((g) => (
                    <div key={g.number}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        g.status === 'APPROVED'     ? 'bg-emerald-500 text-white' :
                        g.status === 'PRESENTED'    ? 'bg-amber-500 text-white' :
                        g.status === 'IN_PROGRESS'  ? 'bg-blue-500 text-white' :
                        g.status === 'REJECTED'     ? 'bg-red-500 text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                      {g.number}
                    </div>
                  ))}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No active sessions</p>
          <p className="text-xs">Create a new session to start AI-powered strategy analysis</p>
        </div>
      )}
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

  useEffect(() => { api.listORProjects().then(setProjects).catch(() => {}); }, []);

  const handleCreate = async () => {
    if (!form.client_name.trim()) return;
    setCreating(true);
    try {
      const proj = await api.createORProject(form);
      setProjects(prev => [proj, ...prev]);
      setForm({ client_name: '', plant_code: '', project_type: 'greenfield' });
      setShowForm(false);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Operational Readiness Projects</h3>
          <p className="text-sm text-gray-500">Each project activates CORTEX agents to generate consulting deliverables</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-xl text-sm font-semibold shadow-sm">
          <Play className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-6">
          <h4 className="font-bold mb-4">New OR Project</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Client</label>
              <input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="e.g. AMS Industrial" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Plant Code</label>
              <input type="text" value={form.plant_code} onChange={e => setForm(f => ({ ...f, plant_code: e.target.value }))}
                placeholder="e.g. OCP-JFC2" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Project Type</label>
              <select value={form.project_type} onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))}
                className="w-full px-3 py-2.5 border rounded-xl text-sm">
                <option value="greenfield">Greenfield (new plant)</option>
                <option value="brownfield">Brownfield (expansion)</option>
                <option value="revamp">Revamp (renovation)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={creating || !form.client_name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Create
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="rounded-2xl border bg-white divide-y overflow-hidden">
          {projects.map((p, idx) => (
            <div key={p.project_id || idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-semibold">{p.client_name}</div>
                <div className="text-xs text-gray-400">
                  {p.plant_code && <span className="mr-2">{p.plant_code}</span>}
                  <span className="capitalize">{p.project_type}</span>
                  {p.created_at && ` · ${new Date(p.created_at).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {['G0','G1','G2','G3','G4'].map((g) => {
                    const gStatus = (p.gate_status || {})[g];
                    return (
                      <div key={g} title={`${g}: ${gStatus || 'PENDING'}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                          gStatus === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                          gStatus === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>{g.replace('G','')}</div>
                    );
                  })}
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>{p.status || 'ACTIVE'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No active OR projects</p>
          <p className="text-xs">Create a new project to activate all CORTEX agents</p>
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

  useEffect(() => { api.listAiTools().then((d) => setTools(d.tools || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = tools.filter(t => t.name.includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
        </div>
        <span className="text-sm text-gray-400 font-medium">{filtered.length} tools</span>
      </div>
      <div className="rounded-2xl border bg-white divide-y max-h-[65vh] overflow-y-auto">
        {filtered.map((tool) => (
          <div key={tool.name} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono text-sm font-semibold text-indigo-600">{tool.name}</span>
            </div>
            <p className="text-xs text-gray-500 pl-5.5">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared ─────────────────────────────────────────────────────── */
function LoadingCard() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-3">
      <AlertTriangle className="w-6 h-6" />
      <div>
        <p className="font-semibold">Connection Error</p>
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
}
