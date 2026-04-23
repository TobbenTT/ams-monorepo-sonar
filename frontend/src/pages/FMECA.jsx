import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Loader2, Plus, Play, Wrench, CheckCircle2, AlertTriangle,
  Circle, ChevronRight, Trash2, Save,
} from 'lucide-react';
import * as api from '../api';
import DevBanner from '../components/DevBanner';
import { TEMPLATE_KEYS, getTemplate } from '../data/fmecaTemplates';

const STAGES = [
  { key: 'STAGE_1_FUNCTIONS', num: 1, label: 'Funciones', hint: 'Describe qué hace el equipo' },
  { key: 'STAGE_2_FAILURES',  num: 2, label: 'Fallos',    hint: 'Fallos funcionales y modos' },
  { key: 'STAGE_3_EFFECTS',   num: 3, label: 'Efectos',   hint: 'Severidad / Ocurrencia / Detección' },
  { key: 'STAGE_4_DECISIONS', num: 4, label: 'Decisiones', hint: 'Estrategia RCM y tareas' },
];

const CONSEQUENCES = [
  { value: 'EVIDENT_SAFETY',        label: 'Evidente · Seguridad' },
  { value: 'EVIDENT_OPERATIONAL',   label: 'Evidente · Operacional' },
  { value: 'EVIDENT_ENVIRONMENTAL', label: 'Evidente · Ambiental' },
  { value: 'HIDDEN_SAFETY',         label: 'Oculto · Seguridad' },
  { value: 'HIDDEN_OPERATIONAL',    label: 'Oculto · Operacional' },
  { value: 'HIDDEN_ENVIRONMENTAL',  label: 'Oculto · Ambiental' },
];

const RPN_CAT = {
  LOW:      { label: 'Bajo',     color: 'bg-green-100 text-green-700 border-green-300',   dot: 'bg-green-500' },
  MEDIUM:   { label: 'Medio',    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
  HIGH:     { label: 'Alto',     color: 'bg-orange-100 text-orange-700 border-orange-300', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Crítico',  color: 'bg-red-100 text-red-700 border-red-300',          dot: 'bg-red-500' },
};

function categorize(rpn) {
  if (rpn >= 200) return 'CRITICAL';
  if (rpn >= 100) return 'HIGH';
  if (rpn >= 50)  return 'MEDIUM';
  return 'LOW';
}

// Criticality letter → RPN multiplier (ajusta RPN crudo por clase del equipo).
const CRIT_WEIGHT = { AA: 1.3, 'A+': 1.15, A: 1.0, B: 0.9, C: 0.8, D: 0.7 };
const adjustRpn = (rpn, critLetter) => Math.round((rpn || 0) * (CRIT_WEIGHT[critLetter] || 1.0));

const EMPTY_ROW = {
  function_description: '',
  functional_failure: '',
  failure_mode: '',
  failure_effect: '',
  failure_consequence: '',
  severity: 5,
  occurrence: 5,
  detection: 5,
  recommended_action: '',
};

export default function FMECA() {
  const [worksheets, setWorksheets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [draftRow, setDraftRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ equipment_id: '', equipment_tag: '', equipment_name: '', analyst: '' });
  const [templateKey, setTemplateKey] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dismissedSuggest, setDismissedSuggest] = useState(false);

  const plantId = localStorage.getItem('selected_plant') || 'OCP-JFC1';

  const reloadList = useCallback(() => {
    setLoadingList(true);
    api.listFmecaWorksheetsSummary({ plant_id: plantId })
      .then((data) => setWorksheets(Array.isArray(data) ? data : []))
      .catch(() => setWorksheets([]))
      .finally(() => setLoadingList(false));
    api.listFmecaSuggestions(plantId, 10)
      .then((data) => setSuggestions(Array.isArray(data) ? data : []))
      .catch(() => setSuggestions([]));
  }, [plantId]);

  const loadDetail = useCallback((id) => {
    if (!id) { setDetail(null); return; }
    setLoadingDetail(true);
    api.getFmecaWorksheet(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, []);

  useEffect(() => { reloadList(); }, [reloadList]);
  useEffect(() => { loadDetail(selectedId); }, [selectedId, loadDetail]);

  const handleCreate = async () => {
    if (!createForm.equipment_id || !createForm.equipment_tag) {
      alert('Equipment ID y Tag son obligatorios');
      return;
    }
    try {
      setSaving(true);
      const res = await api.createFmecaWorksheet({ ...createForm, plant_id: plantId });
      // Jorge 2026-04-23: si eligió plantilla, pre-popular filas del template
      if (res?.worksheet_id && templateKey) {
        const rows = getTemplate(templateKey);
        for (const row of rows) {
          try { await api.addFmecaRow(res.worksheet_id, row); } catch { /* seguir con el resto */ }
        }
      }
      setShowCreate(false);
      setCreateForm({ equipment_id: '', equipment_tag: '', equipment_name: '', analyst: '' });
      setTemplateKey('');
      reloadList();
      if (res?.worksheet_id) setSelectedId(res.worksheet_id);
    } catch (e) {
      alert('No se pudo crear el worksheet: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = async () => {
    if (!draftRow || !selectedId) return;
    if (!draftRow.function_description.trim()) {
      alert('La descripción de la función es obligatoria');
      return;
    }
    try {
      setSaving(true);
      await api.addFmecaRow(selectedId, {
        ...draftRow,
        severity: Number(draftRow.severity) || 1,
        occurrence: Number(draftRow.occurrence) || 1,
        detection: Number(draftRow.detection) || 1,
        failure_consequence: draftRow.failure_consequence || null,
      });
      setDraftRow(null);
      loadDetail(selectedId);
    } catch (e) {
      alert('No se pudo agregar la fila: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleRunDecisions = async () => {
    if (!selectedId) return;
    const anyConsequence = (detail?.rows || []).some(r => r.failure_consequence);
    if (!anyConsequence) {
      if (!confirm('Ninguna fila tiene "Consecuencia" asignada — el engine no podrá decidir estrategia. ¿Correr de todas formas?')) return;
    }
    try {
      setSaving(true);
      await api.runFmecaDecisions(selectedId);
      loadDetail(selectedId);
    } catch (e) {
      alert('Error corriendo decisiones: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!selectedId) return;
    if (!confirm('¿Generar tareas de mantenimiento para cada fila con estrategia?')) return;
    try {
      setSaving(true);
      const res = await api.generateFmecaTasks(selectedId);
      const created = res?.tasks_created ?? 0;
      const skipped = res?.skipped_duplicates ?? 0;
      alert(`✓ ${created} tareas generadas${skipped ? ` (${skipped} duplicadas omitidas)` : ''}`);
      loadDetail(selectedId);
    } catch (e) {
      alert('Error generando tareas: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handlePushToBacklog = async () => {
    if (!selectedId) return;
    if (!confirm('¿Empujar las filas con estrategia al backlog de Planning como items P1–P4?')) return;
    try {
      setSaving(true);
      const res = await api.pushFmecaToBacklog(selectedId);
      alert(`✓ ${res?.created ?? 0} items en backlog${res?.skipped ? ` (${res.skipped} ya existían)` : ''}`);
    } catch (e) {
      alert('Error empujando al backlog: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromSuggestion = async (sug) => {
    try {
      setSaving(true);
      const res = await api.createFmecaWorksheet({
        equipment_id: sug.equipment_id,
        equipment_tag: sug.equipment_tag,
        equipment_name: sug.equipment_name || sug.equipment_tag,
        analyst: 'auto-sugerido',
        plant_id: plantId,
      });
      reloadList();
      if (res?.worksheet_id) setSelectedId(res.worksheet_id);
    } catch (e) {
      alert('Error creando worksheet: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  // Derived summary from detail.rows
  const summary = useMemo(() => {
    const rows = detail?.rows || [];
    if (rows.length === 0) {
      return { totalRows: 0, avgRpn: 0, maxRpn: 0, critical: 0, high: 0, medium: 0, low: 0, withStrategy: 0, radar: null };
    }
    const avg = (k) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / rows.length;
    const byCat = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    rows.forEach(r => {
      const cat = r.rpn_category || categorize(r.rpn || 0);
      if (byCat[cat] != null) byCat[cat]++;
    });
    const maxRpn = Math.max(...rows.map(r => r.rpn || 0));
    const avgRpn = rows.reduce((s, r) => s + (r.rpn || 0), 0) / rows.length;
    const withStrategy = rows.filter(r => r.strategy_type).length;
    const radar = [
      { axis: 'Severidad',  value: +avg('severity').toFixed(1) },
      { axis: 'Ocurrencia', value: +avg('occurrence').toFixed(1) },
      { axis: 'Detección',  value: +avg('detection').toFixed(1) },
      { axis: 'RPN/10',     value: +(avgRpn / 10).toFixed(1) },
      { axis: 'Max RPN/10', value: +(maxRpn / 10).toFixed(1) },
    ];
    return { totalRows: rows.length, avgRpn: Math.round(avgRpn), maxRpn, critical: byCat.CRITICAL, high: byCat.HIGH, medium: byCat.MEDIUM, low: byCat.LOW, withStrategy, radar };
  }, [detail]);

  const currentStageIndex = STAGES.findIndex(s => s.key === detail?.current_stage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">FMECA — Análisis de Modos de Fallo, Efectos y Criticidad</h1>
        <p className="text-sm text-gray-500 mt-1">Flujo RCM de 4 etapas · RPN = S × O × D · Engine determinístico (sin LLM)</p>
        <div className="mt-3">
          <DevBanner>
            FMECA operativo — 4 etapas (Funciones · Fallos · Efectos · Decisiones), RPN = S × O × D,
            push-to-backlog con prioridad por estrategia (FIXED_TIME→P4, FAULT_FINDING→P3) y
            6 plantillas RCM precargadas (Bomba, Motor, Transformador, Compresor, Correa, Intercambiador).
            Pendiente: export SAP-IW22 + integración histórica con Fallas & Eventos.
          </DevBanner>
        </div>
      </div>

      {/* Fase 3a — Sugerencias auto-init FMECA (equipos con P1/P2 cerradas y sin worksheet) */}
      {suggestions.length > 0 && !dismissedSuggest && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-700" />
              <span className="text-sm font-bold text-amber-900">
                {suggestions.length} equipos con fallas críticas sin FMECA
              </span>
              <span className="text-[11px] text-amber-700">auto-detectado por P1/P2 cerradas</span>
            </div>
            <button onClick={() => setDismissedSuggest(true)}
              className="text-xs text-amber-700 hover:text-amber-900">Ocultar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.slice(0, 6).map(s => (
              <div key={s.equipment_id} className="bg-white rounded-lg border border-amber-200 px-2.5 py-2 flex items-center gap-2">
                {s.equipment_criticality && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    s.equipment_criticality === 'AA' ? 'bg-red-100 text-red-700 border-red-300' :
                    s.equipment_criticality === 'A+' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                    s.equipment_criticality === 'A' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    'bg-blue-100 text-blue-700 border-blue-300'
                  }`}>{s.equipment_criticality}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{s.equipment_tag}</div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {s.critical_closure_count} falla{s.critical_closure_count !== 1 ? 's' : ''} críticas
                  </div>
                </div>
                <button onClick={() => handleCreateFromSuggestion(s)} disabled={saving}
                  className="text-[10px] font-semibold bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 disabled:opacity-50 shrink-0">
                  Crear
                </button>
              </div>
            ))}
          </div>
          {suggestions.length > 6 && (
            <div className="text-[11px] text-amber-700 mt-2">
              Y {suggestions.length - 6} más. Los equipos aparecen ordenados por cantidad de fallas.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* LEFT: worksheet list */}
        <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Worksheets</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700">
              <Plus size={12} /> Nuevo
            </button>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center py-6 text-gray-400"><Loader2 size={16} className="animate-spin" /></div>
          ) : worksheets.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">Sin worksheets. Crea uno para empezar.</p>
          ) : (
            <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
              {worksheets.map(w => (
                <li key={w.worksheet_id}>
                  <button
                    onClick={() => setSelectedId(w.worksheet_id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedId === w.worksheet_id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-gray-500 truncate">{w.worksheet_id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{w.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate mt-0.5">{w.equipment_tag || w.equipment_id}</div>
                    <div className="text-[11px] text-gray-400 truncate">{w.equipment_name || '—'}</div>
                    <div className="text-[10px] text-indigo-600 mt-0.5">
                      Etapa: {STAGES.find(s => s.key === w.current_stage)?.label || w.current_stage}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* RIGHT: detail */}
        <main className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 min-h-[60vh]">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <Wrench size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Selecciona un worksheet o crea uno nuevo.</p>
            </div>
          ) : loadingDetail || !detail ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <div className="text-xs font-mono text-gray-400">{detail.worksheet_id}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">{detail.equipment_tag}</h2>
                    {detail.equipment_criticality && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        detail.equipment_criticality === 'AA' ? 'bg-red-100 text-red-700 border-red-300' :
                        detail.equipment_criticality === 'A+' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                        detail.equipment_criticality === 'A' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        'bg-blue-100 text-blue-700 border-blue-300'
                      }`} title={`Criticidad del equipo: ${detail.equipment_criticality} · RPN ajustado ×${CRIT_WEIGHT[detail.equipment_criticality] || 1}`}>
                        {detail.equipment_criticality}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{detail.equipment_name || '—'} · Analista: {detail.analyst || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleRunDecisions} disabled={saving || !detail.rows?.length}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    title="Corre el motor RCM sobre cada fila con consecuencia asignada">
                    <Play size={12} /> Correr Decisiones RCM
                  </button>
                  <button onClick={handleGenerateTasks} disabled={saving || !detail.rows?.some(r => r.strategy_type)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    title="Genera plantillas de mantenimiento (MaintenanceTaskModel)">
                    <Wrench size={12} /> Generar Tareas
                  </button>
                  <button onClick={handlePushToBacklog} disabled={saving || !detail.rows?.some(r => r.strategy_type)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    title="Crea BacklogItems visibles en Planning con prioridad según RPN">
                    <ChevronRight size={12} /> Push a Backlog
                  </button>
                </div>
              </div>

              {/* Stage navigator */}
              <div className="flex items-center gap-1 mb-5 flex-wrap">
                {STAGES.map((s, i) => {
                  const done = !!detail.stage_completion?.[s.key];
                  const isCurrent = i === currentStageIndex;
                  return (
                    <div key={s.key} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        done ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                        isCurrent ? 'bg-indigo-50 border-indigo-300 text-indigo-700' :
                        'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        <span>{s.num}. {s.label}</span>
                      </div>
                      {i < STAGES.length - 1 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
                    </div>
                  );
                })}
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                <SummaryCard label="Filas" value={summary.totalRows} />
                <SummaryCard label="RPN promedio" value={summary.avgRpn || '—'} />
                <SummaryCard label="RPN máx" value={summary.maxRpn || '—'} tone={summary.maxRpn >= 200 ? 'red' : summary.maxRpn >= 100 ? 'orange' : 'gray'} />
                <SummaryCard label="Críticos" value={summary.critical} tone={summary.critical > 0 ? 'red' : 'gray'} />
                <SummaryCard label="Altos" value={summary.high} tone={summary.high > 0 ? 'orange' : 'gray'} />
                <SummaryCard label="Con estrategia" value={`${summary.withStrategy}/${summary.totalRows}`} tone="blue" />
              </div>

              {/* Radar chart (computed) */}
              {summary.radar && (
                <div className="mb-5 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-semibold text-gray-600">Perfil de riesgo promedio (datos reales)</h3>
                    <span className="text-[10px] text-gray-400">Escala 0–10 · RPN/10 para comparar</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={summary.radar}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8, fill: '#9ca3af' }} />
                      <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} dot={{ r: 3, fill: '#6366f1' }} />
                      <Tooltip formatter={(v) => v.toFixed(1)} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Rows table */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Filas FMECA</h3>
                {!draftRow && (
                  <button onClick={() => setDraftRow({ ...EMPTY_ROW })}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700">
                    <Plus size={12} /> Agregar fila
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['#', 'Función', 'Fallo funcional', 'Modo de fallo', 'Efecto', 'Consecuencia', 'S', 'O', 'D', 'RPN', 'RPN×crit', 'Estrategia'].map(h => (
                        <th key={h} className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.rows || []).map((r, i) => {
                      const cat = r.rpn_category || categorize(r.rpn || 0);
                      const catConf = RPN_CAT[cat];
                      return (
                        <tr key={r.row_id || i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-mono text-gray-400">{r.row_id || `R-${i+1}`}</td>
                          <td className="px-2 py-1.5 max-w-[180px] truncate" title={r.function_description}>{r.function_description}</td>
                          <td className="px-2 py-1.5 max-w-[160px] truncate" title={r.functional_failure}>{r.functional_failure || '—'}</td>
                          <td className="px-2 py-1.5 max-w-[160px] truncate" title={r.failure_mode}>{r.failure_mode || '—'}</td>
                          <td className="px-2 py-1.5 max-w-[180px] truncate text-gray-500" title={r.failure_effect}>{r.failure_effect || '—'}</td>
                          <td className="px-2 py-1.5 text-gray-500">{r.failure_consequence ? r.failure_consequence.replace('_', '·') : '—'}</td>
                          <td className="px-2 py-1.5 text-center font-semibold">{r.severity}</td>
                          <td className="px-2 py-1.5 text-center font-semibold">{r.occurrence}</td>
                          <td className="px-2 py-1.5 text-center font-semibold">{r.detection}</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-bold border ${catConf.color}`}>{r.rpn}</span>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {detail.equipment_criticality ? (
                              <span className="text-[11px] font-bold text-indigo-700">{adjustRpn(r.rpn, detail.equipment_criticality)}</span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-2 py-1.5 text-[10.5px]">
                            {r.strategy_type ? (
                              <span className="text-emerald-700 font-semibold">{r.strategy_type}</span>
                            ) : (
                              <span className="text-gray-400 italic">pendiente</span>
                            )}
                            {r.rcm_path && <div className="text-[9px] text-gray-400">{r.rcm_path}</div>}
                          </td>
                        </tr>
                      );
                    })}

                    {draftRow && (
                      <DraftRowEditor
                        row={draftRow}
                        setRow={setDraftRow}
                        onSave={handleAddRow}
                        onCancel={() => setDraftRow(null)}
                        saving={saving}
                      />
                    )}

                    {(detail.rows || []).length === 0 && !draftRow && (
                      <tr><td colSpan={12} className="px-2 py-8 text-center text-gray-400 italic">
                        Sin filas aún. "Agregar fila" para comenzar con Funciones / Fallos / Efectos.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-2 flex-wrap">
                <AlertTriangle size={12} />
                Flujo recomendado: (1) describe funciones, (2) agrega fallo funcional + modo, (3) completa efecto + S/O/D + consecuencia, (4) corre Decisiones RCM y genera tareas.
              </div>
            </>
          )}
        </main>
      </div>

      {/* Create worksheet modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Nuevo Worksheet FMECA</h3>
            <div className="space-y-3">
              <Field label="Equipment ID (interno)" required
                value={createForm.equipment_id}
                onChange={v => setCreateForm(f => ({ ...f, equipment_id: v }))} />
              <Field label="Equipment Tag" required
                value={createForm.equipment_tag}
                onChange={v => setCreateForm(f => ({ ...f, equipment_tag: v }))} />
              <Field label="Equipment Name"
                value={createForm.equipment_name}
                onChange={v => setCreateForm(f => ({ ...f, equipment_name: v }))} />
              <Field label="Analista"
                value={createForm.analyst}
                onChange={v => setCreateForm(f => ({ ...f, analyst: v }))} />
              {/* Jorge 2026-04-23: plantillas RCM pre-armadas por tipo de equipo */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Plantilla RCM (opcional)</label>
                <select value={templateKey} onChange={e => setTemplateKey(e.target.value)}
                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-300 rounded">
                  <option value="">— Sin plantilla (worksheet vacío) —</option>
                  {TEMPLATE_KEYS.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
                {templateKey && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {TEMPLATE_KEYS.find(t => t.key === templateKey)?.desc}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreate} disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone = 'gray' }) {
  const tones = {
    gray:   'bg-gray-50 text-gray-800 border-gray-200',
    red:    'bg-red-50 text-red-800 border-red-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    blue:   'bg-blue-50 text-blue-800 border-blue-200',
  };
  return (
    <div className={`rounded-lg border p-2 ${tones[tone] || tones.gray}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full mt-1 text-sm px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none" />
    </div>
  );
}

function DraftRowEditor({ row, setRow, onSave, onCancel, saving }) {
  const upd = (k, v) => setRow(r => ({ ...r, [k]: v }));
  const rpn = (Number(row.severity) || 1) * (Number(row.occurrence) || 1) * (Number(row.detection) || 1);
  const cat = categorize(rpn);
  const catConf = RPN_CAT[cat];

  return (
    <>
      <tr className="bg-indigo-50/50 border-b border-indigo-200">
        <td className="px-2 py-1.5 font-mono text-indigo-400">nuevo</td>
        <td className="px-2 py-1.5">
          <input value={row.function_description} onChange={e => upd('function_description', e.target.value)}
            placeholder="p.ej. Transportar pulpa 500 m³/h"
            className="w-full text-xs px-1.5 py-1 border border-gray-300 rounded" />
        </td>
        <td className="px-2 py-1.5">
          <input value={row.functional_failure} onChange={e => upd('functional_failure', e.target.value)}
            placeholder="No transporta"
            className="w-full text-xs px-1.5 py-1 border border-gray-300 rounded" />
        </td>
        <td className="px-2 py-1.5">
          <input value={row.failure_mode} onChange={e => upd('failure_mode', e.target.value)}
            placeholder="Rodamiento agarrotado"
            className="w-full text-xs px-1.5 py-1 border border-gray-300 rounded" />
        </td>
        <td className="px-2 py-1.5">
          <input value={row.failure_effect} onChange={e => upd('failure_effect', e.target.value)}
            placeholder="Parada de línea"
            className="w-full text-xs px-1.5 py-1 border border-gray-300 rounded" />
        </td>
        <td className="px-2 py-1.5">
          <select value={row.failure_consequence || ''} onChange={e => upd('failure_consequence', e.target.value)}
            className="w-full text-xs px-1 py-1 border border-gray-300 rounded">
            <option value="">—</option>
            {CONSEQUENCES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </td>
        <td className="px-2 py-1.5">
          <input type="number" min="1" max="10" value={row.severity}
            onChange={e => upd('severity', e.target.value)}
            className="w-12 text-xs px-1 py-1 border border-gray-300 rounded text-center" />
        </td>
        <td className="px-2 py-1.5">
          <input type="number" min="1" max="10" value={row.occurrence}
            onChange={e => upd('occurrence', e.target.value)}
            className="w-12 text-xs px-1 py-1 border border-gray-300 rounded text-center" />
        </td>
        <td className="px-2 py-1.5">
          <input type="number" min="1" max="10" value={row.detection}
            onChange={e => upd('detection', e.target.value)}
            className="w-12 text-xs px-1 py-1 border border-gray-300 rounded text-center" />
        </td>
        <td className="px-2 py-1.5 text-center">
          <span className={`inline-block px-2 py-0.5 rounded font-bold border ${catConf.color}`}>{rpn}</span>
          <div className={`text-[9px] mt-0.5 ${catConf.color.split(' ')[1]}`}>{catConf.label}</div>
        </td>
        <td className="px-2 py-1.5 text-[10px] text-gray-400 italic">—</td>
        <td className="px-2 py-1.5 text-[10px] text-gray-400 italic">stage 4</td>
      </tr>
      <tr className="bg-indigo-50/50 border-b border-indigo-200">
        <td colSpan={12} className="px-2 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <input value={row.recommended_action} onChange={e => upd('recommended_action', e.target.value)}
              placeholder="Acción recomendada (opcional)"
              className="flex-1 min-w-[200px] text-xs px-2 py-1 border border-gray-300 rounded" />
            <button onClick={onCancel}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 px-2.5 py-1 rounded-lg">
              <Trash2 size={12} /> Descartar
            </button>
            <button onClick={onSave} disabled={saving}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Guardar fila
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
