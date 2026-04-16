import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  Search, Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Loader2, ArrowRight, Target, Zap, Shield, Clock, FileText, Activity,
  TrendingUp, X, Play,
} from 'lucide-react';

const STAGES = [
  { id: 'IDENTIFIED', label: 'Identified', icon: Target, color: 'bg-red-500' },
  { id: 'ANALYZING', label: 'Analyzing', icon: Search, color: 'bg-amber-500' },
  { id: 'IMPLEMENTING', label: 'Implementing', icon: Play, color: 'bg-blue-500' },
  { id: 'CONTROLLED', label: 'Controlled', icon: Shield, color: 'bg-emerald-500' },
  { id: 'CLOSED', label: 'Closed', icon: CheckCircle, color: 'bg-gray-400' },
];

const W5H2_KEYS = [
  { key: 'what', label: 'What happened?', icon: '1', color: 'border-red-400 bg-red-50 dark:bg-red-900/10' },
  { key: 'where', label: 'Where did it happen?', icon: '2', color: 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' },
  { key: 'when', label: 'When did it happen?', icon: '3', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' },
  { key: 'who', label: 'Who was involved?', icon: '4', color: 'border-purple-400 bg-purple-50 dark:bg-purple-900/10' },
  { key: 'why', label: 'Why did it happen?', icon: '5', color: 'border-orange-400 bg-orange-50 dark:bg-orange-900/10' },
  { key: 'how', label: 'How did it happen?', icon: 'H1', color: 'border-teal-400 bg-teal-50 dark:bg-teal-900/10' },
  { key: 'how_much', label: 'How much impact?', icon: 'H2', color: 'border-pink-400 bg-pink-50 dark:bg-pink-900/10' },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Search size={22} className="text-red-700 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Root Cause Analysis</h1>
            <p className="text-sm text-muted-foreground">Identify, analyze and eliminate failure root causes</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors">
          <Plus size={16} /> New RCA
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
              return (
                <div key={wr.request_id} className="flex items-center gap-3 bg-white dark:bg-card rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/30">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wr.priority_code === 'P1' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{wr.priority_code}</span>
                  <span className="text-xs font-mono text-muted-foreground">{wr.equipment_tag}</span>
                  <span className="text-xs text-foreground flex-1 truncate">{pd.original_text || wr.description || ''}</span>
                  <span className="text-[10px] text-red-500">{pd.failure_mode_detected}</span>
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
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search RCA events..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            {filterStage !== 'all' && (
              <button onClick={() => setFilterStage('all')} className="text-xs text-blue-600 hover:underline">Clear filter</button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Search size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-foreground font-semibold mb-1">No RCA events yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start an RCA from a critical failure above, or create one manually</p>
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
              <h3 className="text-sm font-bold text-foreground">5W + 2H Analysis</h3>
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
                      placeholder="Click to fill or use AI Auto-Fill..."
                      className="w-full text-sm bg-transparent border-0 focus:outline-none text-foreground resize-none min-h-[40px] placeholder:text-gray-400" rows={2} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Root causes */}
          {selected.root_cause_levels && Object.keys(selected.root_cause_levels).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Root Cause Levels</h3>
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
          {(selected.corrective_actions || []).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Corrective Actions (CAPA)</h3>
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
            </div>
          )}

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
                <h3 className="text-lg font-bold text-foreground">New Root Cause Analysis</h3>
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
                <p className="text-xs text-amber-700">No critical failures detected. You can describe the event manually below.</p>
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
                Create RCA + AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
