import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  Search, Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Loader2, ArrowRight, Target, Zap, Shield, Clock, FileText, Activity,
  TrendingUp, X, Play, Fish, Send, Trash2,
} from 'lucide-react';

// Ishikawa 6M categorías (estándar RCA industrial).
const ISHIKAWA_CATS = [
  { key: 'METODO',         label: 'Método',       color: '#6366f1' },
  { key: 'MAQUINA',        label: 'Máquina',      color: '#ef4444' },
  { key: 'MATERIAL',       label: 'Material',     color: '#f59e0b' },
  { key: 'MANO_OBRA',      label: 'Mano de obra', color: '#10b981' },
  { key: 'MEDIO_AMBIENTE', label: 'Medio amb.',   color: '#06b6d4' },
  { key: 'MEDICION',       label: 'Medición',     color: '#a855f7' },
];

// 5P evidence categories (per RCAEngine).
const EVIDENCE_5P = [
  { key: 'PARTS',      label: 'Parts (piezas físicas)',       color: '#6366f1' },
  { key: 'POSITION',   label: 'Position (posición/escena)',   color: '#ef4444' },
  { key: 'PEOPLE',     label: 'People (testimonios)',         color: '#10b981' },
  { key: 'PAPERS',     label: 'Papers (registros/procedim.)', color: '#f59e0b' },
  { key: 'PARADIGMS',  label: 'Paradigms (cultura/normas)',   color: '#a855f7' },
];

const STAGES = [
  { id: 'IDENTIFIED', label: 'Identificada', icon: Target, color: 'bg-red-500' },
  { id: 'ANALYZING', label: 'Analizando', icon: Search, color: 'bg-amber-500' },
  { id: 'IMPLEMENTING', label: 'Implementando', icon: Play, color: 'bg-blue-500' },
  { id: 'CONTROLLED', label: 'Controlada', icon: Shield, color: 'bg-emerald-500' },
  { id: 'CLOSED', label: 'Cerrada', icon: CheckCircle, color: 'bg-gray-400' },
];

const W5H2_KEYS = [
  { key: 'what', label: '¿Qué pasó?', icon: '1', color: 'border-red-400 bg-red-50 dark:bg-red-900/10' },
  { key: 'where', label: '¿Dónde pasó?', icon: '2', color: 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' },
  { key: 'when', label: '¿Cuándo pasó?', icon: '3', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' },
  { key: 'who', label: '¿Quién estuvo involucrado?', icon: '4', color: 'border-purple-400 bg-purple-50 dark:bg-purple-900/10' },
  { key: 'why', label: '¿Por qué pasó?', icon: '5', color: 'border-orange-400 bg-orange-50 dark:bg-orange-900/10' },
  { key: 'how', label: '¿Cómo pasó?', icon: 'H1', color: 'border-teal-400 bg-teal-50 dark:bg-teal-900/10' },
  { key: 'how_much', label: '¿Qué impacto tuvo?', icon: 'H2', color: 'border-pink-400 bg-pink-50 dark:bg-pink-900/10' },
];

export default function RCA() {
  const { plant } = useOutletContext();
  const toast = useToast();
  const { t } = useLanguage();
  const [rcas, setRcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDesc, setCreateDesc] = useState('');
  const [createEquip, setCreateEquip] = useState('');
  const [creating, setCreating] = useState(false);
  const [running5w2h, setRunning5w2h] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [recentFailures, setRecentFailures] = useState([]);
  const [filterStage, setFilterStage] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rcaRes, wrRes] = await Promise.all([
        api.listRcas({ plant_id: plant }).catch(() => []),
        api.listWorkRequests({ plant_id: plant, status: 'VALIDATED', limit: 20 }).catch(() => []),
      ]);
      setRcas(Array.isArray(rcaRes) ? rcaRes : []);
      const wrs = Array.isArray(wrRes) ? wrRes : [];
      // Extract failures with P1/P2 or recurrent equipment
      const failures = wrs.filter(wr => {
        const pd = wr.problem_description || {};
        return wr.priority_code === 'P1' || wr.priority_code === 'P2' || pd.failure_mode_detected;
      }).slice(0, 10);
      setRecentFailures(failures);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [plant]);
  useWebSocket(plant, useCallback((msg) => { if (msg.event) loadData(); }, []));

  const handleCreate = async (desc, equip) => {
    if (!desc?.trim()) return;
    setCreating(true);
    try {
      const res = await api.createRca({ event_description: desc, equipment_id: equip || '', plant_id: plant });
      toast.success('RCA created — running AI analysis...');
      setShowCreate(false);
      setCreateDesc('');
      setCreateEquip('');
      setSelected(res);
      // Auto-run 5W2H with AI immediately
      try {
        const aiRes = await api.run5w2h(res.analysis_id, {});
        setSelected(prev => ({ ...prev, five_w_two_h: aiRes.five_w_two_h || aiRes }));
        toast.success('AI completed 5W2H analysis automatically');
      } catch {
        toast.info('RCA created — click AI Auto-Fill to analyze');
      }
      loadData();
    } catch (e) { toast.error('Error: ' + (e.message || '')); }
    setCreating(false);
  };

  const handleCreateFromWR = (wr) => {
    const pd = wr.problem_description || {};
    const desc = pd.original_text || wr.description || '';
    const symptom = pd.failure_symptom || '';
    const cause = pd.failure_cause || '';
    const mode = pd.failure_mode_detected || '';
    const fullDesc = [desc, mode && `Category: ${mode}`, symptom && `Symptom: ${symptom}`, cause && `Cause: ${cause}`].filter(Boolean).join('. ');
    handleCreate(fullDesc + ' [Equipment: ' + (wr.equipment_tag || '') + ', Priority: ' + (wr.priority_code || '') + ']', wr.equipment_tag);
  };

  const handle5w2h = async () => {
    if (!selected?.analysis_id) return;
    setRunning5w2h(true);
    try {
      const res = await api.run5w2h(selected.analysis_id, {});
      setSelected(prev => ({ ...prev, five_w_two_h: res.five_w_two_h || res }));
      toast.success('5W2H analysis completed by AI');
    } catch (e) { toast.error('5W2H failed: ' + (e.message || '')); }
    setRunning5w2h(false);
  };

  const handleAdvance = async () => {
    if (!selected?.analysis_id) return;
    setAdvancing(true);
    try {
      const stageOrder = ['IDENTIFIED', 'ANALYZING', 'IMPLEMENTING', 'CONTROLLED', 'CLOSED'];
      const curIdx = stageOrder.indexOf(selected.status || 'IDENTIFIED');
      const next = stageOrder[Math.min(curIdx + 1, stageOrder.length - 1)];
      await api.advanceRca(selected.analysis_id, { status: next });
      const updated = await api.getRca(selected.analysis_id).catch(() => ({ ...selected, status: next }));
      setSelected(updated);
      loadData();
      toast.success('Advanced to ' + next);
    } catch (e) { toast.error('Error: ' + (e.message || '')); }
    setAdvancing(false);
  };

  const handleSave5w2h = async (key, value) => {
    if (!selected?.analysis_id) return;
    const newData = { ...(selected.five_w_two_h || {}), [key]: value };
    setSelected(prev => ({ ...prev, five_w_two_h: newData }));
    try { await api.updateRca(selected.analysis_id, { analysis_5w2h: newData }); } catch {}
  };

  // Ishikawa — cause_effect.branches = { METODO: [...], MAQUINA: [...], ... }
  const saveIshikawa = async (branches) => {
    if (!selected?.analysis_id) return;
    const ce = { ...(selected.cause_effect || {}), branches };
    setSelected(prev => ({ ...prev, cause_effect: ce }));
    try { await api.updateRca(selected.analysis_id, { cause_effect: ce }); }
    catch (e) { toast.error('Error guardando Ishikawa'); }
  };

  // 5P evidence list — array of { category, description, source, fragility_score }
  const save5P = async (evidence) => {
    if (!selected?.analysis_id) return;
    setSelected(prev => ({ ...prev, evidence_5p: evidence }));
    try { await api.updateRca(selected.analysis_id, { evidence_5p: evidence }); }
    catch (e) { toast.error('Error guardando evidencia'); }
  };

  const handlePushToCapa = async () => {
    if (!selected?.analysis_id) return;
    if (!(selected.solutions || []).length) {
      toast.info('El RCA no tiene soluciones cargadas todavía');
      return;
    }
    try {
      const res = await api.pushRcaToCapa(selected.analysis_id);
      toast.success(`✓ ${res.created} CAPA creada(s)${res.skipped ? ` · ${res.skipped} omitidas (ya existían)` : ''}`);
    } catch (e) { toast.error('Error creando CAPA: ' + (e.message || '')); }
  };

  // Filter
  const filtered = rcas.filter(r => {
    if (filterStage !== 'all' && r.status !== filterStage) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (r.event_description || '').toLowerCase().includes(q) || (r.equipment_id || '').toLowerCase().includes(q);
    }
    return true;
  });

  const stageCount = (id) => rcas.filter(r => r.status === id).length;

  if (loading) return <div className="p-6 flex justify-center min-h-[300px] items-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

  return (
    <div className="p-6 space-y-5">
      {/* Banner removido: 5M (Ishikawa), 5-Why, Fault-Tree, solutions, push-to-CAPA, integración FMECA todos operativos. */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Search size={22} className="text-red-700 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análisis de Causa Raíz</h1>
            <p className="text-sm text-muted-foreground">Identifica, analiza y elimina las causas raíz de fallas</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors">
          <Plus size={16} /> Nuevo RCA
        </button>
      </div>

      {/* Stage pipeline */}
      <div className="grid grid-cols-5 gap-2">
        {STAGES.map(s => {
          const count = stageCount(s.id);
          const isActive = filterStage === s.id;
          return (
            <button key={s.id} onClick={() => setFilterStage(isActive ? 'all' : s.id)}
              className={`rounded-xl border-2 p-3 text-center transition-all hover:shadow-md ${isActive ? 'ring-2 ring-blue-500 shadow-md' : ''} ${count > 0 ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <s.icon size={16} className="text-white" />
              </div>
              <div className="text-xl font-extrabold text-foreground">{count}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Critical failures from WRs (auto-detected) */}
      {recentFailures.length > 0 && !selected && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-bold text-red-800 dark:text-red-300">Critical Failures Detected</span>
            <span className="text-xs text-red-500 ml-auto">{recentFailures.length} P1/P2 events without RCA</span>
          </div>
          <div className="space-y-2">
            {recentFailures.slice(0, 5).map(wr => {
              const pd = wr.problem_description || {};
              // Fase 3b — sugerir nivel RCA: recurrencia del equipo + prioridad.
              const equipFailures = recentFailures.filter(f => f.equipment_tag === wr.equipment_tag).length;
              const suggestedLevel = equipFailures >= 3 ? 1 : (wr.priority_code === 'P1' ? 2 : 3);
              const levelLabels = { 1: 'Nivel 1 · Análisis profundo', 2: 'Nivel 2 · RCFA', 3: 'Nivel 3 · 5-porqué' };
              const levelColor = suggestedLevel === 1 ? 'bg-red-100 text-red-700' : suggestedLevel === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
              return (
                <div key={wr.request_id} className="flex items-center gap-3 bg-white dark:bg-card rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/30">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wr.priority_code === 'P1' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{wr.priority_code}</span>
                  <span className="text-xs font-mono text-muted-foreground">{wr.equipment_tag}</span>
                  <span className="text-xs text-foreground flex-1 truncate">{pd.original_text || wr.description || ''}</span>
                  <span className="text-[10px] text-red-500">{pd.failure_mode_detected}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColor}`} title={`Recurrencia equipo: ${equipFailures}`}>{levelLabels[suggestedLevel]}</span>
                  <button onClick={() => handleCreateFromWR(wr)}
                    className="text-[10px] px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-semibold shrink-0">
                    Start RCA
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + list */}
      {!selected && (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar eventos RCA…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            {filterStage !== 'all' && (
              <button onClick={() => setFilterStage('all')} className="text-xs text-blue-600 hover:underline">Clear filter</button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Search size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-foreground font-semibold mb-1">Aún no hay eventos RCA</p>
              <p className="text-sm text-muted-foreground mb-4">Inicia un RCA desde una falla crítica arriba, o crea uno manualmente</p>
              <button onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                <Plus size={14} className="inline mr-1" /> Create First RCA
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(rca => {
                const stage = STAGES.find(s => s.id === rca.status) || STAGES[0];
                return (
                  <div key={rca.analysis_id} onClick={() => api.getRca(rca.analysis_id).then(setSelected).catch(() => setSelected(rca))}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-red-200 transition-all">
                    <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <stage.icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{rca.event_description}</p>
                      <p className="text-xs text-muted-foreground">{rca.equipment_id || 'No equipment'} · Created {rca.created_at ? new Date(rca.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${stage.color} text-white`}>{stage.label}</span>
                    <ArrowRight size={14} className="text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ RCA DETAIL ═══ */}
      {selected && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <ArrowRight size={14} className="rotate-180" /> Back to list
          </button>

          {/* Event header */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">{selected.event_description}</h2>
              <div className="flex items-center gap-2">
                {selected.equipment_id && <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">{selected.equipment_id}</span>}
                <span className={`text-xs font-bold px-2 py-1 rounded text-white ${(STAGES.find(s => s.id === selected.status) || STAGES[0]).color}`}>
                  {(STAGES.find(s => s.id === selected.status) || STAGES[0]).label}
                </span>
              </div>
            </div>
            {/* Stage progress */}
            <div className="flex items-center gap-1">
              {STAGES.map((s, i) => {
                const curIdx = STAGES.findIndex(st => st.id === selected.status);
                const done = i <= curIdx;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={`h-2 flex-1 rounded-full ${done ? s.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                    {i < STAGES.length - 1 && <div className="w-1" />}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {STAGES.map(s => <span key={s.id} className="text-[9px] text-muted-foreground">{s.label}</span>)}
            </div>
          </div>

          {/* 5W2H Analysis */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Análisis 5W + 2H</h3>
              <button onClick={handle5w2h} disabled={running5w2h}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                {running5w2h ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                {running5w2h ? 'AI Analyzing...' : 'AI Auto-Fill'}
              </button>
            </div>
            <div className="space-y-3">
              {W5H2_KEYS.map(item => {
                const value = (selected.five_w_two_h || {})[item.key] || '';
                return (
                  <div key={item.key} className={`border-l-4 rounded-lg p-3 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded">{item.icon}</span>
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                    </div>
                    <textarea value={value}
                      onChange={e => {
                        const newVal = e.target.value;
                        setSelected(prev => ({ ...prev, five_w_two_h: { ...(prev.five_w_two_h || {}), [item.key]: newVal } }));
                      }}
                      onBlur={e => handleSave5w2h(item.key, e.target.value)}
                      placeholder="Click para completar o usa Auto-completar con IA…"
                      className="w-full text-sm bg-transparent border-0 focus:outline-none text-foreground resize-none min-h-[40px] placeholder:text-gray-400" rows={2} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ishikawa Diagram (6M fishbone) */}
          <IshikawaCard
            effect={selected.event_description}
            branches={selected.cause_effect?.branches || {}}
            onSave={saveIshikawa}
          />

          {/* 5-Why Cascading */}
          <FiveWhyCard
            effect={selected.event_description}
            whys={selected.cause_effect?.five_whys || []}
            onSave={async (whys) => {
              const ce = { ...(selected.cause_effect || {}), five_whys: whys };
              setSelected(prev => ({ ...prev, cause_effect: ce }));
              try { await api.updateRca(selected.analysis_id, { cause_effect: ce }); } catch {}
            }}
          />

          {/* Fault Tree (AND/OR gates) */}
          <FaultTreeCard
            topEvent={selected.event_description}
            tree={selected.cause_effect?.fault_tree || { gate: 'OR', events: [] }}
            onSave={async (tree) => {
              const ce = { ...(selected.cause_effect || {}), fault_tree: tree };
              setSelected(prev => ({ ...prev, cause_effect: ce }));
              try { await api.updateRca(selected.analysis_id, { cause_effect: ce }); } catch {}
            }}
          />

          {/* 5P Evidence */}
          <Evidence5PCard
            evidence={selected.evidence_5p || []}
            onSave={save5P}
          />

          {/* Root causes */}
          {selected.root_cause_levels && Object.keys(selected.root_cause_levels).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Niveles de causa raíz</h3>
              <div className="space-y-2">
                {Object.entries(selected.root_cause_levels).map(([level, cause]) => (
                  <div key={level} className="flex items-start gap-3 text-sm">
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded shrink-0">{level}</span>
                    <span className="text-foreground">{cause}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAPAs */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-foreground">Acciones correctivas (CAPA)</h3>
              <div className="flex gap-2">
                {/* Jorge 2026-04-23: FMECA ↔ RCA — crear worksheet FMECA desde este RCA */}
                <button onClick={async () => {
                  try {
                    const r = await api.createFmecaFromRca(selected.analysis_id || selected.id, '');
                    toast.success(`FMECA creado con ${r.rows_added || 0} filas del RCA`);
                    window.open(`/fmeca?open=${r.worksheet_id}`, '_blank');
                  } catch(e) { toast.error(e.message || 'Error creando FMECA'); }
                }}
                  title="Crea un worksheet FMECA pre-poblado con las causas Ishikawa + soluciones de este RCA"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Send size={12} /> Crear FMECA
                </button>
                <button onClick={handlePushToCapa}
                  disabled={!(selected.solutions || []).length}
                  title="Crea ImprovementAction rows para cada solución cargada"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <Send size={12} /> Push a CAPA
                </button>
              </div>
            </div>
            {(selected.corrective_actions || []).length > 0 ? (
              <div className="space-y-2">
                {selected.corrective_actions.map((capa, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle size={14} className={capa.status === 'COMPLETED' ? 'text-emerald-500' : 'text-gray-300'} />
                    <span className="flex-1 text-foreground">{capa.description}</span>
                    <span className="text-xs text-muted-foreground">{capa.responsible}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${capa.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : capa.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {capa.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sin soluciones cargadas. Agrega desde la sección 5W2H o directamente en Improvement Actions.</p>
            )}
          </div>

          {/* Advance button */}
          {selected.status !== 'CLOSED' && (
            <div className="flex justify-end gap-3">
              <button onClick={handleAdvance} disabled={advancing}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold disabled:opacity-50 transition-colors">
                {advancing ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Advance Stage
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ CREATE MODAL — Select from existing failures ═══ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Nuevo análisis de causa raíz</h3>
                <p className="text-xs text-muted-foreground">Select a failure event or describe manually</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>

            {/* Recent failures to pick from */}
            {recentFailures.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-red-600 mb-2 block flex items-center gap-1">
                  <AlertTriangle size={12} /> Select from recent critical failures:
                </label>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {recentFailures.map(wr => {
                    const pd = wr.problem_description || {};
                    return (
                      <button key={wr.request_id} onClick={() => { handleCreateFromWR(wr); }}
                        disabled={creating}
                        className="w-full text-left bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wr.priority_code === 'P1' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{wr.priority_code}</span>
                          <span className="text-xs font-mono text-muted-foreground">{wr.equipment_tag}</span>
                          <span className="text-[10px] text-red-500 ml-auto">{pd.failure_mode_detected || ''}</span>
                        </div>
                        <p className="text-xs text-foreground mt-1 line-clamp-2">{pd.original_text || wr.description || ''}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active WOs to pick from */}
            {recentFailures.length === 0 && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">No se detectaron fallas críticas. Puedes describir el evento manualmente abajo.</p>
              </div>
            )}

            {/* Manual entry */}
            <div className="border-t border-border pt-4 space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Or describe manually:</label>
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)}
                placeholder="Describe the failure event..."
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[60px]" />
              <input value={createEquip} onChange={e => setCreateEquip(e.target.value)}
                placeholder="Equipment TAG or name"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30" />
              <button onClick={() => handleCreate(createDesc, createEquip)} disabled={creating || !createDesc.trim()}
                className="w-full py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Crear RCA + análisis IA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ISHIKAWA 6M FISHBONE — SVG viewer + editor
   ═══════════════════════════════════════════════════════════ */
function IshikawaCard({ effect, branches, onSave }) {
  const [editing, setEditing] = useState(null); // { catKey, idx|null, text }

  const addCause = (catKey, text) => {
    if (!text.trim()) return;
    const next = { ...branches, [catKey]: [...(branches[catKey] || []), text.trim()] };
    onSave(next);
  };
  const removeCause = (catKey, idx) => {
    const next = { ...branches, [catKey]: (branches[catKey] || []).filter((_, i) => i !== idx) };
    onSave(next);
  };

  // SVG geometry
  const W = 720, H = 340;
  const spineY = H / 2;
  const spineX1 = 30, spineX2 = W - 180;
  const branchLen = 110; // diagonal length
  // 3 branches above, 3 below alternating along spine
  const branchX = [spineX1 + 80, spineX1 + 240, spineX1 + 400];
  // catLayout: [{cat, x, top}]
  const catLayout = ISHIKAWA_CATS.map((c, i) => ({
    ...c,
    x: branchX[i % 3],
    top: i < 3,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Fish size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-foreground">Diagrama Ishikawa — 6M</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">Click en una categoría para agregar causa</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 680 }}>
          {/* Spine */}
          <line x1={spineX1} y1={spineY} x2={spineX2} y2={spineY} stroke="#334155" strokeWidth="3" />
          {/* Arrow head */}
          <polygon points={`${spineX2},${spineY-10} ${spineX2+20},${spineY} ${spineX2},${spineY+10}`} fill="#334155" />
          {/* Effect box (right) */}
          <rect x={spineX2 + 24} y={spineY - 30} width="150" height="60" rx="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
          <foreignObject x={spineX2 + 28} y={spineY - 26} width="142" height="52">
            <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, lineHeight: 1.2, padding: 2, overflow: 'hidden' }}>
              {effect || 'Efecto / evento'}
            </div>
          </foreignObject>

          {/* Branches */}
          {catLayout.map((c, i) => {
            const startX = c.x;
            const startY = spineY;
            const endX = startX - 40;
            const endY = c.top ? startY - branchLen : startY + branchLen;
            const labelOffsetY = c.top ? -8 : 18;
            const causes = branches[c.key] || [];
            return (
              <g key={c.key}>
                {/* Diagonal branch */}
                <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={c.color} strokeWidth="2" />
                {/* Category label */}
                <text x={endX - 5} y={endY + labelOffsetY} fill={c.color} fontSize="12" fontWeight="700" textAnchor="end">
                  {c.label}
                </text>
                {/* Cause leaves */}
                {causes.slice(0, 4).map((cause, idx) => {
                  const t = (idx + 1) / 5; // position along branch
                  const px = startX + (endX - startX) * t;
                  const py = startY + (endY - startY) * t;
                  const leafEndX = px - 35;
                  const leafEndY = py;
                  return (
                    <g key={idx}>
                      <line x1={px} y1={py} x2={leafEndX} y2={leafEndY} stroke={c.color} strokeWidth="1" />
                      <foreignObject x={leafEndX - 110} y={leafEndY - 9} width="108" height="18">
                        <div
                          style={{ fontSize: 9.5, color: '#475569', textAlign: 'right', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                          title="Click para quitar"
                          onClick={() => removeCause(c.key, idx)}>
                          {cause}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
                {/* Click zone to add cause */}
                <circle cx={endX} cy={endY} r={14} fill={c.color} fillOpacity="0.15" stroke={c.color} style={{ cursor: 'pointer' }}
                  onClick={() => setEditing({ catKey: c.key, text: '' })} />
                <text x={endX} y={endY + 4} fill={c.color} fontSize="14" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>+</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Category chips list for mobile/detail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
        {ISHIKAWA_CATS.map(c => (
          <div key={c.key} className="rounded-lg border border-border p-2 bg-background">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
              <button onClick={() => setEditing({ catKey: c.key, text: '' })}
                className="text-[10px] text-indigo-600 hover:underline">+ agregar</button>
            </div>
            <div className="space-y-0.5">
              {(branches[c.key] || []).length === 0 ? (
                <span className="text-[10px] text-muted-foreground italic">—</span>
              ) : (branches[c.key] || []).map((cause, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[11px] group">
                  <span className="flex-1 text-foreground">• {cause}</span>
                  <button onClick={() => removeCause(c.key, idx)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add-cause inline dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-bold mb-2">
              Agregar causa en <span style={{ color: ISHIKAWA_CATS.find(c => c.key === editing.catKey)?.color }}>
                {ISHIKAWA_CATS.find(c => c.key === editing.catKey)?.label}
              </span>
            </h4>
            <input value={editing.text}
              onChange={e => setEditing(ed => ({ ...ed, text: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { addCause(editing.catKey, editing.text); setEditing(null); } }}
              placeholder="p.ej. Lubricación insuficiente"
              autoFocus
              className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setEditing(null)} className="text-xs text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg">Cancelar</button>
              <button onClick={() => { addCause(editing.catKey, editing.text); setEditing(null); }}
                className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5P EVIDENCE CARD — structured evidence by 5 categories
   ═══════════════════════════════════════════════════════════ */
function Evidence5PCard({ evidence, onSave }) {
  const [adding, setAdding] = useState(null); // { category, description, source, fragility_score }

  const addEvidence = () => {
    if (!adding?.description?.trim()) return;
    onSave([...evidence, { ...adding }]);
    setAdding(null);
  };
  const removeEvidence = (idx) => {
    onSave(evidence.filter((_, i) => i !== idx));
  };

  const grouped = EVIDENCE_5P.map(cat => ({
    ...cat,
    items: evidence.filter(e => e.category === cat.key),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-foreground">Evidencia 5P — Parts · Position · People · Papers · Paradigms</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">Fragility 1–5 (1 = se pierde rápido)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        {grouped.map(cat => (
          <div key={cat.key} className="rounded-lg border border-border p-2 bg-background min-h-[120px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold" style={{ color: cat.color }}>{cat.label.split(' ')[0]}</span>
              <button onClick={() => setAdding({ category: cat.key, description: '', source: '', fragility_score: 3 })}
                className="text-[10px] text-indigo-600 hover:underline">+</button>
            </div>
            {cat.items.length === 0 ? (
              <p className="text-[10px] italic text-muted-foreground">Sin evidencia</p>
            ) : (
              <div className="space-y-1">
                {cat.items.map((e, i) => {
                  const globalIdx = evidence.findIndex(x => x === e);
                  return (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded p-1.5 text-[10.5px] group">
                      <div className="flex items-start gap-1">
                        <span className="flex-1 text-foreground leading-tight">{e.description}</span>
                        <button onClick={() => removeEvidence(globalIdx)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0"><Trash2 size={10} /></button>
                      </div>
                      {e.source && <div className="text-[9px] text-muted-foreground mt-0.5">fuente: {e.source}</div>}
                      {e.fragility_score && (
                        <div className="mt-0.5 flex items-center gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={`w-1.5 h-1.5 rounded-full ${n <= e.fragility_score ? 'bg-amber-500' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add evidence modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setAdding(null)}>
          <div className="bg-white dark:bg-card rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-bold mb-3">
              Nueva evidencia <span style={{ color: EVIDENCE_5P.find(c => c.key === adding.category)?.color }}>
                {EVIDENCE_5P.find(c => c.key === adding.category)?.label}
              </span>
            </h4>
            <div className="space-y-2">
              <textarea value={adding.description}
                onChange={e => setAdding(a => ({ ...a, description: e.target.value }))}
                placeholder="Describe la evidencia (qué se observó / registró)"
                rows={3}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background resize-y" />
              <input value={adding.source}
                onChange={e => setAdding(a => ({ ...a, source: e.target.value }))}
                placeholder="Fuente (operador, bitácora, foto, etc.)"
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background" />
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Fragilidad (1 = se pierde rápido, 5 = persistente)</label>
                <input type="range" min="1" max="5" value={adding.fragility_score}
                  onChange={e => setAdding(a => ({ ...a, fragility_score: Number(e.target.value) }))}
                  className="w-full" />
                <div className="text-xs text-center font-bold">{adding.fragility_score}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAdding(null)} className="text-xs text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg">Cancelar</button>
              <button onClick={addEvidence}
                className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── 5-Why ─────────────────────────────────────────────────────────────
   5 niveles cascading: cada respuesta vuelve a preguntar "¿Por qué?".
   El último why se considera la causa raíz candidata. */
function FiveWhyCard({ effect, whys, onSave }) {
  const [list, setList] = useState(() => {
    const arr = Array.isArray(whys) ? [...whys] : [];
    while (arr.length < 5) arr.push('');
    return arr.slice(0, 5);
  });

  const updateAt = (i, val) => {
    const next = [...list];
    next[i] = val;
    setList(next);
  };
  const handleBlur = () => {
    const cleaned = list.map(s => (s || '').trim());
    onSave(cleaned);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">5-Why · Cinco porqués</h3>
        <span className="text-[10px] text-muted-foreground">El último why = causa raíz candidata</span>
      </div>
      <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
        <span className="font-semibold">Efecto observado:</span> {effect || '—'}
      </div>
      <div className="space-y-2">
        {list.map((val, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                {i === 0 ? '¿Por qué ocurrió el efecto?' : `¿Por qué la respuesta #${i}?`}
              </label>
              <textarea
                value={val}
                onChange={e => updateAt(i, e.target.value)}
                onBlur={handleBlur}
                placeholder={i === 4 ? 'Causa raíz candidata...' : 'Respuesta...'}
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      {list[4] && list[4].trim() && (
        <div className="mt-3 bg-red-50 border-l-4 border-red-500 px-3 py-2 rounded">
          <div className="text-[10px] font-bold text-red-700 uppercase">Causa raíz candidata</div>
          <div className="text-sm text-red-900 mt-1">{list[4]}</div>
        </div>
      )}
    </div>
  );
}


/* ── Fault-Tree ────────────────────────────────────────────────────────
   Top event + 1 nivel de gates (AND/OR) con eventos contribuyentes.
   Simplificado: 1 gate raíz + lista de eventos hijos. Cumple para análisis
   típicos de fallas; FTA full-tree (gates anidados) se construye iterando. */
function FaultTreeCard({ topEvent, tree, onSave }) {
  const [gate, setGate] = useState(tree?.gate || 'OR');
  const [events, setEvents] = useState(Array.isArray(tree?.events) ? tree.events : []);
  const [adding, setAdding] = useState('');
  const confirm = useConfirm();

  const persist = (g, ev) => onSave({ gate: g, events: ev });

  const addEvent = () => {
    const v = adding.trim();
    if (!v) return;
    const next = [...events, { description: v, probability: null }];
    setEvents(next);
    setAdding('');
    persist(gate, next);
  };
  const removeEvent = async (i) => {
    const desc = (events[i]?.description || `Evento #${i + 1}`).slice(0, 50);
    if (!await confirm({ title: 'Quitar evento del fault tree', message: `¿Quitar "${desc}"?`, variant: 'danger', confirmText: 'Quitar' })) return;
    const next = events.filter((_, j) => j !== i);
    setEvents(next);
    persist(gate, next);
  };
  const setGateAndPersist = (g) => {
    setGate(g);
    persist(g, events);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Fault Tree · Árbol de fallas</h3>
        <span className="text-[10px] text-muted-foreground">Top event → {gate} → causas contribuyentes</span>
      </div>
      <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
        <span className="font-semibold">Top event:</span> {topEvent || '—'}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground">Compuerta lógica:</span>
        <button
          onClick={() => setGateAndPersist('OR')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border ${gate === 'OR' ? 'bg-rose-600 text-white border-rose-600' : 'bg-card text-muted-foreground border-border'}`}
        >OR (cualquiera)</button>
        <button
          onClick={() => setGateAndPersist('AND')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border ${gate === 'AND' ? 'bg-rose-600 text-white border-rose-600' : 'bg-card text-muted-foreground border-border'}`}
        >AND (todas)</button>
      </div>
      <div className="space-y-2">
        {events.map((ev, i) => (
          <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
              E{i + 1}
            </span>
            <span className="flex-1 text-sm text-foreground">{ev.description}</span>
            <button onClick={() => removeEvent(i)} className="text-rose-600 hover:bg-rose-50 p-1 rounded">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={adding}
          onChange={e => setAdding(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEvent()}
          placeholder="Evento contribuyente (causa básica)..."
          className="flex-1 text-sm bg-muted border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        />
        <button onClick={addEvent} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700">
          + Añadir
        </button>
      </div>
    </div>
  );
}
