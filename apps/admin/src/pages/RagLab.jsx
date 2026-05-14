import React, { useEffect, useState } from 'react';
import { Sparkles, UserCheck, Brain, FileText, Database, Loader2 } from 'lucide-react';
import * as api from '../api';
import { useToast } from '../components/Toast';

const TABS = [
  { id: 33, key: 'rcm', name: '#33 RCM Strategy Advisor', icon: Sparkles, color: 'rose' },
  { id: 34, key: 'handover', name: '#34 Shift Handover', icon: UserCheck, color: 'amber' },
  { id: 35, key: 'lessons', name: '#35 Post-Maint Learning', icon: Brain, color: 'emerald' },
  { id: 40, key: 'kb', name: '#40 KB Curator', icon: FileText, color: 'purple' },
];

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Output({ loading, data, sources }) {
  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Procesando con Claude + LanceDB...</div>;
  if (!data) return null;
  return (
    <div className="space-y-3">
      <pre className="bg-gray-900 text-emerald-200 text-xs p-3 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
      {sources?.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-gray-600 mb-1">Fuentes recuperadas (LanceDB):</div>
          <div className="space-y-1">
            {sources.map((s, i) => (
              <div key={i} className="text-[11px] bg-gray-50 border border-gray-200 rounded p-2">
                <div className="font-mono text-gray-500">{s.source_type}/{s.source_id} · score {s.score?.toFixed(3)}</div>
                <div className="text-gray-700 mt-0.5">{(s.text || '').slice(0, 200)}{s.text?.length > 200 ? '…' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RcmTab() {
  const [tag, setTag] = useState('343-PP-001');
  const [mode, setMode] = useState('cavitación recurrente');
  const [ctx, setCtx] = useState('Reincidencias en últimos 6 meses, NPSH bajo sospecha');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const run = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await api.ragRcmStrategy({ equipment_tag: tag, failure_mode: mode, context: ctx });
      setResult(r);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };
  return (
    <Card title="🎯 #33 RCM Strategy Advisor — Sugiere estrategia preventiva con histórico real">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input className="text-sm px-3 py-2 border rounded" placeholder="Tag equipo" value={tag} onChange={e => setTag(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded" placeholder="Modo de falla" value={mode} onChange={e => setMode(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded" placeholder="Contexto adicional" value={ctx} onChange={e => setCtx(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded hover:bg-rose-700 disabled:opacity-50 mb-3">
        {loading ? 'Procesando...' : 'Generar estrategia RCM'}
      </button>
      <Output loading={loading} data={result?.claude_response} sources={result?.sources} />
    </Card>
  );
}

function HandoverTab() {
  const [shift, setShift] = useState('day');
  const [notes, setNotes] = useState('Bomba 343-PP-001 con vibración alta, en seguimiento. Stock empaque mecánico bajo (2 unidades).');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const run = async () => {
    setLoading(true); setResult(null);
    try {
      const open_wos = [
        { id: 'OT-50108', status: 'EN_EJECUCION', equipment_tag: 'CRU-CON-HP-01', problem: 'vibración severa en chancador cono' },
        { id: 'OT-50106', status: 'PROGRAMADO', equipment_tag: 'PMP-AGUA-01', problem: 'humo blanco motor + ruido' },
        { id: 'OT-50091', status: 'EN_EJECUCION', equipment_tag: '343-PP-001', problem: 'cavitación bomba centrífuga' },
      ];
      const r = await api.ragShiftHandover({ shift, open_wos, notes });
      setResult(r);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };
  return (
    <Card title="🌙 #34 Shift Handover Assistant — Resumen turno con histórico">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <select className="text-sm px-3 py-2 border rounded" value={shift} onChange={e => setShift(e.target.value)}>
          <option value="day">Turno día</option>
          <option value="night">Turno noche</option>
        </select>
        <input className="text-sm px-3 py-2 border rounded" placeholder="Notas turno" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="text-[11px] text-gray-500 mb-2">Demo usa 3 OTs abiertas mock + retrieval contra ot_history.</div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded hover:bg-amber-700 disabled:opacity-50 mb-3">
        {loading ? 'Procesando...' : 'Generar handover'}
      </button>
      <Output loading={loading} data={result?.handover} sources={result?.sources} />
    </Card>
  );
}

function LessonsTab() {
  const [woId, setWoId] = useState('OT-50091');
  const [tag, setTag] = useState('343-PP-001');
  const [mode, setMode] = useState('cavitación');
  const [actions, setActions] = useState('Reemplazo empaque mecánico + alineación + verificación NPSH');
  const [outcome, setOutcome] = useState('recurrent');
  const [notes, setNotes] = useState('Tercera reincidencia en el año, sospecha de problema sistémico');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const run = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await api.ragPostMaintLearn({ wo_id: woId, equipment_tag: tag, failure_mode: mode, actions_taken: actions, outcome, notes });
      setResult(r);
      toast.success(`Indexado: ${r.chunks_indexed} chunks en lessons_learned`);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };
  return (
    <Card title="📚 #35 Post-Maintenance Learning — Captura aprendizaje + indexa para futuro retrieval">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input className="text-sm px-3 py-2 border rounded" placeholder="OT ID" value={woId} onChange={e => setWoId(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded" placeholder="Equipment tag" value={tag} onChange={e => setTag(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded" placeholder="Modo de falla" value={mode} onChange={e => setMode(e.target.value)} />
        <input className="text-sm px-3 py-2 border rounded md:col-span-2" placeholder="Acciones tomadas" value={actions} onChange={e => setActions(e.target.value)} />
        <select className="text-sm px-3 py-2 border rounded" value={outcome} onChange={e => setOutcome(e.target.value)}>
          <option value="ok">OK — sin reincidencia</option>
          <option value="recurrent">Recurrente</option>
          <option value="escalated">Escalado</option>
        </select>
        <textarea className="text-sm px-3 py-2 border rounded md:col-span-3" rows={2} placeholder="Notas" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-700 disabled:opacity-50 mb-3">
        {loading ? 'Indexando...' : 'Capturar lección'}
      </button>
      <Output loading={loading} data={result?.ai_summary || (result ? `Indexado OK · ${result.chunks_indexed} chunks · lesson_id=${result.lesson_id}` : null)} />
    </Card>
  );
}

function KbTab() {
  const [text, setText] = useState('Procedimiento: Para detectar cavitación temprana en bombas centrífugas, monitorear vibración en banda 2-4x BPF y NPSH disponible. Si NPSH-A < NPSH-R + 1m → riesgo alto.');
  const [cat, setCat] = useState('reliability/pumps');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const run = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await api.ragKbCurator({ new_entry_text: text, proposed_category: cat });
      setResult(r);
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };
  return (
    <Card title="🗂 #40 KB Curator — Auto-categoriza + detecta duplicados">
      <textarea className="w-full text-sm px-3 py-2 border rounded mb-2" rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Texto entrada KB" />
      <input className="text-sm px-3 py-2 border rounded mb-3 w-full" placeholder="Categoría propuesta" value={cat} onChange={e => setCat(e.target.value)} />
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded hover:bg-purple-700 disabled:opacity-50 mb-3">
        {loading ? 'Procesando...' : 'Curar entrada'}
      </button>
      <Output loading={loading} data={result?.decision} sources={result?.sources} />
    </Card>
  );
}

export default function RagLab() {
  const [tab, setTab] = useState('rcm');
  const [stats, setStats] = useState(null);
  useEffect(() => { api.ragStats().then(setStats).catch(() => {}); }, []);
  const TabComp = { rcm: RcmTab, handover: HandoverTab, lessons: LessonsTab, kb: KbTab }[tab];
  return (
    <div className="p-5 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Database className="w-7 h-7 text-purple-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RAG Lab — Phase 2 Capabilities</h1>
          <p className="text-sm text-gray-500">LanceDB + sentence-transformers + Claude Sonnet 4.6 · Lazy load · idle 0 RAM</p>
        </div>
      </div>

      {stats && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs flex flex-wrap gap-3">
          <span><strong>Modelo:</strong> {stats.model || '—'}</span>
          <span><strong>Loaded:</strong> {String(stats.loaded)}</span>
          <span><strong>Tablas:</strong> {(stats.tables || []).map(t => `${t.name}(${t.rows ?? '—'})`).join(' · ') || '(vacío)'}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${active ? `border-${t.color}-600 text-${t.color}-700` : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              <Icon className="w-4 h-4" /> {t.name}
            </button>
          );
        })}
      </div>

      <TabComp />
    </div>
  );
}
