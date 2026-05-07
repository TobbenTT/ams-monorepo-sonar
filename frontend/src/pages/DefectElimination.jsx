import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Bug, AlertTriangle, CheckCircle, Clock, ChevronRight, Plus, Target, X, Loader2, ArrowRight } from 'lucide-react';
// Mock data removed — uses real API data
import * as api from '../api';
import { useToast } from '../components/Toast';

const PRIORITY_COLORS = {
  ALTO: 'bg-red-100 text-red-700 border-red-200',
  MODERADO: 'bg-amber-100 text-amber-700 border-amber-200',
  BAJO: 'bg-green-100 text-green-700 border-green-200',
};

const SOLUTION_STATUS_COLORS = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-muted text-muted-foreground',
};

function getStageFromStatus(status) {
  const map = { IDENTIFIED: 1, PRIORITIZED: 2, ANALYZING: 3, IMPLEMENTING: 4, CONTROLLED: 5, COMPLETED: 5, CLOSED: 5 };
  return map[status] || 1;
}

const STATUS_ORDER = ['IDENTIFIED', 'PRIORITIZED', 'ANALYZING', 'IMPLEMENTING', 'CONTROLLED', 'CLOSED'];

function getNextStatus(currentStatus) {
  const idx = STATUS_ORDER.indexOf(currentStatus);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

export default function DefectElimination() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();

  const STAGES = [
    t('rca.stages.identify'),
    t('rca.stages.prioritize'),
    t('rca.stages.analyze'),
    t('rca.stages.implement'),
    t('rca.stages.control'),
  ];

  const SOLUTION_STATUS_LABELS = {
    COMPLETED: t('common.completed'),
    IN_PROGRESS: t('defectElimination.inProgress'),
    PENDING: t('common.pending'),
  };

  const FIVE_W_LABELS = {
    what: t('rca.questions.what'),
    when: t('rca.questions.when'),
    where: t('rca.questions.where'),
    who: t('rca.questions.who'),
    why: t('rca.questions.why'),
  };

  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('5w');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [creating, setCreating] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  function transformRcaData(data) {
    return data.map((r, i) => ({
      id: r.analysis_id?.slice(0, 8) || `DE-${i + 1}`,
      analysis_id: r.analysis_id,
      status: r.status || 'IDENTIFIED',
      title: r.event_description || t('common.noData'),
      equipment_tag: r.equipment_id?.slice(0, 12) || 'N/A',
      priority: r.status === 'IDENTIFIED' ? 'ALTO' : r.status === 'PRIORITIZED' ? 'MODERADO' : 'BAJO',
      stage: getStageFromStatus(r.status),
      detection_date: r.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      rca_method: '5W+2H + Ishikawa',
      recurrence_count: 0,
      five_w_answers: r.five_w_two_h || {},
      physical_cause: r.root_cause_levels?.physical_cause || '',
      human_cause: r.root_cause_levels?.human_cause || '',
      latent_cause: r.root_cause_levels?.latent_cause || '',
      solutions: (r.capa_actions || []).map(a => ({
        action: a.description,
        responsible: a.responsible || t('common.pending'),
        due_date: a.due_date || '',
        status: a.status || 'PENDING',
      })),
      kpis: { recurrence_rate: 0, mean_time_between_defects: null, resolution_time: null },
    }));
  }

  function loadCases() {
    setLoading(true);
    api.listRcas({ plant_id: plant }).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const transformed = transformRcaData(data);
        setCases(transformed);
        setSelected(prev => {
          const match = transformed.find(t => t.analysis_id === prev?.analysis_id);
          return match || transformed[0];
        });
      }
    }).catch(() => {
      // Keep mock data as fallback — no toast needed
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCases();
  }, [plant]);

  async function handleCreateCase() {
    if (!newDesc.trim()) return;
    setCreating(true);
    try {
      await api.createRca({
        event_description: newDesc.trim(),
        equipment_id: newEquipment.trim() || undefined,
        plant_id: plant,
      });
      toast.success(t('defectElimination.caseCreated'));
      setShowNew(false);
      setNewDesc('');
      setNewEquipment('');
      loadCases();
    } catch (err) {
      toast.error(t('defectElimination.createError') + ': ' + (err.message || ''));
    } finally {
      setCreating(false);
    }
  }

  async function handleAdvanceStage() {
    if (!selected?.analysis_id || !selected?.status) return;
    const next = getNextStatus(selected.status);
    if (!next) {
      toast.warning(t('defectElimination.alreadyFinalStage'));
      return;
    }
    setAdvancing(true);
    try {
      await api.advanceRca(selected.analysis_id, { status: next });
      toast.success(t('defectElimination.stageAdvanced') + ': ' + next);
      loadCases();
    } catch (err) {
      toast.error(t('defectElimination.advanceError') + ': ' + (err.message || ''));
    } finally {
      setAdvancing(false);
    }
  }

  // KPI calculations — use dynamic cases state
  const activeCasesCount = cases.filter((c) => c.stage < 5).length;
  const completedCasesCount = cases.filter((c) => c.stage === 5).length;
  const totalRecurrence = cases.reduce((acc, c) => acc + c.recurrence_count, 0);
  const openActions = cases.reduce((acc, c) => {
    return acc + (c.solutions || []).filter((s) => s.status !== 'COMPLETED').length;
  }, 0);

  const tabs = [
    { id: '5w', label: '5W+2H' },
    { id: 'rca', label: t('defectElimination.rcaRootCause') },
    { id: 'solutions', label: t('defectElimination.solutions') },
  ];

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Banner removido: workflow RCA→solución y push→FMECA con RPN before/after operativos. */}
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 to-rose-700 rounded-2xl px-8 py-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Bug className="w-7 h-7 text-rose-200" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('defectElimination.title')}</h1>
            <p className="text-rose-200 text-sm mt-0.5">{t('defectElimination.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-white text-rose-700 font-bold text-sm px-4 py-2 rounded-lg shadow hover:bg-rose-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('defectElimination.newCase')}
        </button>
      </div>

      {/* New Case Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{t('defectElimination.newCase')}</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('defectElimination.eventDescription')} *
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder={t('defectElimination.eventPlaceholder')}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('defectElimination.equipmentId')}
                </label>
                <input
                  type="text"
                  value={newEquipment}
                  onChange={e => setNewEquipment(e.target.value)}
                  placeholder="PUMP-001, CONV-210..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowNew(false)}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground px-4 py-2"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateCase}
                  disabled={creating || !newDesc.trim()}
                  className="flex items-center gap-2 bg-rose-600 text-white font-bold text-sm px-5 py-2 rounded-lg shadow hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? t('defectElimination.creating') : t('defectElimination.createCase')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-blue-100 dark:border-blue-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('defectElimination.activeCases')}</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{activeCasesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('defectElimination.inProgress')}</p>
        </div>
        <div className="bg-card rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('defectElimination.completedCases')}</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{completedCasesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('defectElimination.stage5of5')}</p>
        </div>
        <div className="bg-card rounded-xl border border-red-100 dark:border-red-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('defectElimination.totalRecurrence')}</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{totalRecurrence}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('defectElimination.repeatedFailures')}</p>
        </div>
        <div className="bg-card rounded-xl border border-amber-100 dark:border-amber-900/30 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t('defectElimination.openActions')}</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openActions}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('defectElimination.incomplete')}</p>
        </div>
      </div>

      {/* Main layout: left panel + right panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel: case list */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">{t('defectElimination.deCases')} ({cases.length})</h2>
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          )}
          {cases.map((c) => {
            const isSelected = selected.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setActiveTab('5w'); }}
                className={`w-full text-left bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-all
                  ${isSelected ? 'border-rose-400 ring-2 ring-rose-200' : 'border-border hover:border-border'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground font-mono">{c.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[c.priority] || 'bg-muted text-muted-foreground'}`}>
                    {c.priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug mb-1">{c.title}</p>
                <p className="text-xs text-muted-foreground mb-3 font-mono">{c.equipment_tag}</p>

                {/* 5-stage progress bar */}
                <div className="flex gap-1 mb-2">
                  {STAGES.map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-1.5 rounded-full ${idx < c.stage ? 'bg-green-400' : 'bg-muted'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {STAGES[Math.min(c.stage, STAGES.length - 1)]}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {c.recurrence_count} {t('defectElimination.recurrences')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right panel: case detail */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {selected ? (
            <>
              {/* Case header */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground font-mono">{selected.id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[selected.priority] || 'bg-muted text-muted-foreground'}`}>
                        {selected.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{selected.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('common.equipment')}: <span className="font-mono font-semibold text-foreground">{selected.equipment_tag}</span>
                      &nbsp;&mdash;&nbsp;{t('defectElimination.detected')}: {selected.detection_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selected.analysis_id && getNextStatus(selected.status) && (
                      <button
                        onClick={handleAdvanceStage}
                        disabled={advancing}
                        className="flex items-center gap-1.5 bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {advancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        {advancing ? t('defectElimination.advancing') : t('defectElimination.advanceStage')}
                      </button>
                    )}
                    {/* Defect Elimination → FMECA: cierre del ciclo RCM. Visible si el RCA
                        está COMPLETED o más; registra el modo de falla con RPN before/after
                        en el worksheet del equipo como evidencia de mitigación. */}
                    {selected.analysis_id && ['COMPLETED', 'REVIEWED', 'CONTROLLED', 'CLOSED'].includes(selected.status) && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.pushRcaToFmeca(selected.analysis_id);
                            if (res?.skipped) {
                              toast.warning(res.reason || 'No aplicable');
                            } else {
                              toast.success(`FMECA ${res.action === 'CREATED' ? 'creada' : 'actualizada'}: RPN ${res.rpn_before} → ${res.rpn_after}`);
                            }
                          } catch (e) { toast.error('Error: ' + (e.message || '')); }
                        }}
                        title="Registrar mitigación en FMECA del equipo (cierra ciclo RCM)"
                        className="flex items-center gap-1.5 bg-purple-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow hover:bg-purple-700 transition-colors"
                      >
                        <Target className="w-3.5 h-3.5" /> Push → FMECA
                      </button>
                    )}
                    <Target className="w-6 h-6 text-rose-400 mt-1" />
                  </div>
                </div>

                {/* Stage progress stepper */}
                <div className="flex items-center gap-0 mt-4">
                  {STAGES.map((stage, idx) => {
                    const done = idx < selected.stage;
                    const current = idx === selected.stage - 1;
                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                              ${done ? 'bg-green-500 text-white' : current ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}
                            `}
                          >
                            {done ? <CheckCircle className="w-4 h-4" /> : <span>{idx + 1}</span>}
                          </div>
                          <span className={`text-xs mt-1 font-medium text-center leading-tight
                            ${done ? 'text-green-600' : current ? 'text-rose-600' : 'text-muted-foreground'}
                          `}>
                            {stage}
                          </span>
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-green-300' : 'bg-muted'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 text-xs font-bold py-3 px-4 transition-colors uppercase tracking-wide
                        ${activeTab === tab.id
                          ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-b-2 border-rose-500'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Tab: 5W+2H */}
                  {activeTab === '5w' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('defectElimination.method')}: <span className="font-semibold text-foreground">{selected.rca_method}</span>
                      </p>
                      {selected.five_w_answers && Object.entries(selected.five_w_answers).map(([key, value]) => (
                        <div key={key} className="flex gap-3 items-start">
                          <span className="w-20 flex-shrink-0 text-xs font-bold text-rose-600 uppercase tracking-wider pt-0.5">
                            {FIVE_W_LABELS[key] || key.toUpperCase()}
                          </span>
                          <div className="flex-1 bg-muted rounded-lg border border-border px-3 py-2 text-sm text-foreground">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: RCA */}
                  {activeTab === 'rca' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{t('defectElimination.rcaMethod')}:</span>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {selected.rca_method}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {/* Physical cause */}
                        <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{t('rca.physicalCause')}</span>
                          </div>
                          <p className="text-sm text-red-800 dark:text-red-300">{selected.physical_cause}</p>
                        </div>
                        {/* Human cause */}
                        <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">{t('rca.humanCause')}</span>
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-300">{selected.human_cause}</p>
                        </div>
                        {/* Latent cause */}
                        <div className="rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">{t('rca.latentCause')}</span>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-300">{selected.latent_cause}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Solutions */}
                  {activeTab === 'solutions' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        {(selected.solutions || []).map((sol, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-muted rounded-lg border border-border p-3">
                            <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground mb-1">{sol.action}</p>
                              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                                <span>{t('rca.responsible')}: <span className="font-semibold text-foreground">{sol.responsible}</span></span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {sol.due_date}
                                </span>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${SOLUTION_STATUS_COLORS[sol.status] || 'bg-muted text-muted-foreground'}`}>
                              {SOLUTION_STATUS_LABELS[sol.status] || sol.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* KPI sub-cards */}
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1">{t('defectElimination.recurrences')}</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{selected.kpis.recurrence_rate}</p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-1">MTBD (h)</p>
                          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            {selected.kpis.mean_time_between_defects ?? '—'}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">{t('defectElimination.resolution')} ({t('common.days')})</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {selected.kpis.resolution_time ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 shadow-sm flex flex-col items-center gap-3 text-muted-foreground">
              <Bug className="w-12 h-12 opacity-30" />
              <p className="text-sm font-semibold">{t('defectElimination.selectCase')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
