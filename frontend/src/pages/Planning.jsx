import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import CapacityEvaluation from '../components/CapacityEvaluation';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { KPICard, PriorityBadge, StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Eye, Clock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Download, AlertCircle, Plus, XCircle, Ban,
  X, Save, MapPin, Users, Wrench, Building2, FileText, Tag, Trash2, DollarSign, List, Package, Info, MessageSquare, Play, CheckCircle, ClipboardCheck, Search, Minimize2, Maximize2, Sparkles, Lock, Loader2
} from 'lucide-react';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';

const PRIORITY_COLORS = {
  P1: 'text-red-600 font-bold',
  P2: 'text-orange-600 font-semibold',
  P3: 'text-yellow-600',
  P4: 'text-blue-600',
};
// Jorge 2026-04-23: P4 = Parada de Plantas (no 'Low').
const PRIORITY_LABELS = { P1: '<24h', P2: '<7d', P3: '>7d', P4: 'Parada de Plantas' };

// David 2026-04-28: lista canónica de disciplinas que Jorge usa en planta.
// Usadas como op.specialty para que el subtotal por disciplina agrupe bien y
// el desglose HH del card del scheduling (ExpandedWOCard) matchee con la
// specialty del técnico asignado. Antes "Mechanical" hardcoded en + Add.
const DISCIPLINAS_OP = [
  'Mecánico', 'Eléctrico', 'Instrumentista', 'Soldador',
  'Lubricador', 'Civil', 'Predictivo', 'Helper', 'Otro',
];

// Jorge SF-515 — Notificación HH: pestaña visible solo en EN_EJECUCION donde
// el supervisor captura valores reales (puesto trabajo, HH, inicio/fin)
// antes de cerrar. Fin real = inicio + duración, editable manualmente.
function NotifHHTab({ wo, onSaved }) {
  const [actualWorkCenter, setActualWorkCenter] = useState(wo.work_center || '');
  const [actualStart, setActualStart] = useState(wo.actual_start ? wo.actual_start.slice(0, 16) : '');
  const [actualDuration, setActualDuration] = useState(wo.actual_hours || wo.estimated_hours || 0);
  const [actualEnd, setActualEnd] = useState(wo.actual_end ? wo.actual_end.slice(0, 16) : '');
  const [actualHH, setActualHH] = useState(wo.actual_hours || 0);
  const [saving, setSaving] = useState(false);

  const computeEnd = (start, hours) => {
    if (!start) return '';
    try {
      const d = new Date(start);
      d.setMinutes(d.getMinutes() + Math.round(parseFloat(hours) * 60));
      return d.toISOString().slice(0, 16);
    } catch { return ''; }
  };

  const handleStartChange = (v) => {
    setActualStart(v);
    if (v && actualDuration) setActualEnd(computeEnd(v, actualDuration));
  };
  const handleDurationChange = (v) => {
    setActualDuration(v);
    if (actualStart && v) setActualEnd(computeEnd(actualStart, v));
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.updateManagedWO(wo.wo_id, {
        work_center: actualWorkCenter,
        actual_start: actualStart || null,
        actual_end: actualEnd || null,
        actual_hours: parseFloat(actualHH) || 0,
      });
      onSaved && onSaved(updated);
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const plan = wo.estimated_hours || 0;
  const variance = plan > 0 && actualHH > 0 ? Math.round(((actualHH - plan) / plan) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-3">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
          <Clock size={14} /> Notificación de HH · captura en tiempo real
        </div>
        <p className="text-[11px] text-amber-700">
          Registrá los valores reales de ejecución. El fin se calcula automáticamente
          como inicio + duración, pero podés editarlo manualmente.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Puesto de trabajo real</label>
          <input value={actualWorkCenter} onChange={e => setActualWorkCenter(e.target.value)}
            className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1.5"
            placeholder="Ej: MECA-01" />
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Duración real (h)</label>
          <input type="number" min="0" step="0.5" value={actualDuration}
            onChange={e => handleDurationChange(e.target.value)}
            className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1.5"
            placeholder={`Plan: ${plan}h`} />
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <label className="text-[10px] font-semibold text-blue-600 uppercase">Fecha/hora inicio real</label>
          <input type="datetime-local" value={actualStart}
            onChange={e => handleStartChange(e.target.value)}
            className="w-full mt-1 text-sm border border-blue-200 rounded px-2 py-1.5 bg-white" />
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <label className="text-[10px] font-semibold text-emerald-600 uppercase">
            Fecha/hora fin real <span className="normal-case text-emerald-500">(auto, editable)</span>
          </label>
          <input type="datetime-local" value={actualEnd}
            onChange={e => setActualEnd(e.target.value)}
            className="w-full mt-1 text-sm border border-emerald-200 rounded px-2 py-1.5 bg-white" />
        </div>
        <div className="bg-white rounded-lg p-3 border col-span-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">HH reales totales</label>
          <div className="flex items-center gap-2 mt-1">
            <input type="number" min="0" step="0.25" value={actualHH}
              onChange={e => setActualHH(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5" />
            {plan > 0 && actualHH > 0 && (
              <span className={`text-[11px] font-bold px-2 py-1 rounded ${Math.abs(variance) <= 10 ? 'bg-emerald-100 text-emerald-700' : Math.abs(variance) <= 25 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                Var: {variance > 0 ? '+' : ''}{variance}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Plan: {plan} HH · Real: {actualHH} HH</p>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar notificación
      </button>
    </div>
  );
}

// Jorge 2026-04-21 — Post-closure review (RCM feedback loop).
// Se muestra solo cuando la OT está CERRADA. Captura causa raíz confirmada,
// lecciones aprendidas, sugerencia de frecuencia PM, exactitud de repuestos.
function PostReviewTab({ wo, onSaved }) {
  const existing = wo.post_closure_review || {};
  const [form, setForm] = useState({
    root_cause_confirmed: existing.root_cause_confirmed || '',
    lessons_learned: existing.lessons_learned || '',
    pm_frequency_suggestion: existing.pm_frequency_suggestion || '',
    spare_parts_accuracy: existing.spare_parts_accuracy || '',
  });
  const [saving, setSaving] = useState(false);
  const hasReview = !!existing.reviewed_at;

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.saveWOPostReview(wo.wo_id, form);
      onSaved && onSaved(res);
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/40 p-3">
        <div className="flex items-center gap-2 text-purple-800 font-bold text-sm mb-1">
          <ClipboardCheck size={14} /> Post-Closure Review · RCM feedback
        </div>
        <p className="text-[11px] text-purple-700">
          Lecciones aprendidas que alimentan la estrategia de mantenimiento.
          Responde en base a lo efectivamente ejecutado.
        </p>
        {hasReview && (
          <p className="text-[10px] text-purple-500 mt-1 italic">
            Revisado por {existing.reviewed_by} el {new Date(existing.reviewed_at).toLocaleString('es')}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Causa raíz confirmada</label>
        <textarea value={form.root_cause_confirmed}
          onChange={e => setForm({ ...form, root_cause_confirmed: e.target.value })}
          placeholder="¿Coincide con la causa sospechada al abrir el aviso? Si no, describí la causa real."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 min-h-[60px]" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Lecciones aprendidas</label>
        <textarea value={form.lessons_learned}
          onChange={e => setForm({ ...form, lessons_learned: e.target.value })}
          placeholder="Qué haríamos distinto la próxima vez. Qué aprendizaje queda para el equipo."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Sugerencia de frecuencia PM</label>
        <select value={form.pm_frequency_suggestion}
          onChange={e => setForm({ ...form, pm_frequency_suggestion: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2">
          <option value="">— Seleccionar —</option>
          <option value="keep">Mantener frecuencia actual</option>
          <option value="increase">Aumentar frecuencia (falla recurrente)</option>
          <option value="decrease">Disminuir frecuencia (sobre-mantenido)</option>
          <option value="redesign">Redesign / cambio de estrategia (RCM)</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Exactitud de repuestos</label>
        <select value={form.spare_parts_accuracy}
          onChange={e => setForm({ ...form, spare_parts_accuracy: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2">
          <option value="">— Seleccionar —</option>
          <option value="exact">Exacto — se usaron todos y ninguno faltó</option>
          <option value="extra">Sobraron repuestos (revisar BOM)</option>
          <option value="missing">Faltaron repuestos críticos</option>
          <option value="substituted">Se sustituyeron por alternativos</option>
        </select>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {hasReview ? 'Actualizar review' : 'Guardar review'}
      </button>
    </div>
  );
}

// Fase 10 Jorge 2026-04-21 — tab de historial en el modal de OT.
// Consume /managed-work-orders/{id}/history que combina audit_log diffs
// (quién cambió qué campo) con execution_notes (status transitions).
function HistoryTab({ wo }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wo?.wo_id) return;
    let cancelled = false;
    setLoading(true);
    api.getManagedWOHistory(wo.wo_id)
      .then(r => { if (!cancelled) { setEntries(r?.entries || []); setError(null); } })
      .catch(e => { if (!cancelled) setError(e.message || 'Error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [wo?.wo_id]);

  const formatValue = (v) => {
    if (v == null || v === '') return <span className="italic text-gray-400">vacío</span>;
    if (typeof v === 'object') return JSON.stringify(v).slice(0, 80);
    const s = String(v);
    return s.length > 80 ? s.slice(0, 77) + '…' : s;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Historial · {entries.length} eventos</h3>
        <span className="text-[10px] text-gray-400">Audit log + notas de ejecución</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">Error: {error}</div>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">Sin historial registrado</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e, idx) => {
            const isChange = e.source === 'audit' && e.changes && Object.keys(e.changes).length > 0;
            const isNote = e.source === 'note';
            return (
              <div key={idx} className={`rounded-lg border p-2.5 ${isChange ? 'bg-blue-50/40 border-blue-200' : isNote ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isChange ? 'bg-blue-200 text-blue-800' : isNote ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                    {isChange ? 'CAMBIO' : isNote ? 'NOTA' : (e.action || 'EVENT')}
                  </span>
                  <span className="text-[10px] text-gray-500">{e.timestamp ? new Date(e.timestamp).toLocaleString('es') : '—'}</span>
                  <span className="text-[10px] font-mono text-gray-600 ml-auto">{e.user || 'system'}</span>
                </div>
                {isChange && (
                  <div className="grid grid-cols-[auto,1fr,auto,1fr] gap-x-2 gap-y-0.5 text-[11px]">
                    {Object.entries(e.changes).map(([field, diff]) => (
                      <React.Fragment key={field}>
                        <span className="font-semibold text-gray-700">{field}:</span>
                        <span className="text-gray-500 line-through truncate">{formatValue(diff.from)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-blue-700 font-medium truncate">{formatValue(diff.to)}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {isNote && e.note && (
                  <p className="text-xs text-gray-700">{e.note}</p>
                )}
                {!isChange && !isNote && (
                  <p className="text-xs text-gray-500 italic">{e.action}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Group C #8 Jorge 2026-04-21 — picker de cuadrilla contratista.
// Si la OT se tercerea, acá se elige. Null = trabajo interno.
function ContractorCrewPicker({ wo, onChange }) {
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const selected = wo.contractor_crew_id || '';

  useEffect(() => {
    let cancelled = false;
    api.listAllCrews(wo.plant_id)
      .then(r => { if (!cancelled) setCrews(Array.isArray(r) ? r : []); })
      .catch(() => { if (!cancelled) setCrews([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [wo.plant_id]);

  const handleChange = async (crewId) => {
    try {
      await api.updateManagedWO(wo.wo_id, { contractor_crew_id: crewId || null });
      onChange && onChange(crewId || null);
    } catch (e) {
      alert('Error: ' + (e.message || 'no se pudo asignar cuadrilla'));
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
      <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold uppercase mb-1">
        Cuadrilla contratista (opcional)
      </div>
      {loading ? (
        <div className="text-xs text-amber-600 italic">Cargando cuadrillas…</div>
      ) : crews.length === 0 ? (
        <div className="text-xs text-amber-600 italic">
          Sin contratistas configurados. Agregalos en <a href="/contractors" className="underline">Contratistas</a>.
        </div>
      ) : (
        <select value={selected} onChange={e => handleChange(e.target.value)}
          className="w-full text-sm font-semibold text-gray-800 bg-white border border-amber-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
          <option value="">— In-house (técnicos propios) —</option>
          {crews.map(c => (
            <option key={c.crew_id} value={c.crew_id}>
              {c.contractor_name} · {c.name}{c.specialty ? ` (${c.specialty})` : ''}{c.size > 1 ? ` · ${c.size} pers` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function PriorityLabel({ priority }) {
  const p = String(priority || 'P3');
  return <span className={PRIORITY_COLORS[p] || 'text-gray-500'}>{PRIORITY_LABELS[p] || p}</span>;
}

/* ── BBP Constants ── */
const PLANNING_GROUPS = [
  { value: 'P01', label: 'P01 - Planta Área Seca' },
  { value: 'P02', label: 'P02 - Planta Heap Leach' },
  { value: 'P03', label: 'P03 - Planta Área Húmeda' },
  { value: 'M01', label: 'M01 - Mina Perforación' },
  { value: 'M02', label: 'M02 - Mina Carguío' },
  { value: 'M03', label: 'M03 - Mina Transporte' },
  { value: 'M04', label: 'M04 - Mina Equipos de Apoyo' },
  { value: 'M05', label: 'M05 - Mina Equipos Auxiliares' },
];
// Every planning group has at minimum: Mechanical, Electrical, Instrumentation, Civil, Lubrication
const WORK_CENTERS = [
  // P01 — Planta Área Seca
  { value: 'PASMEC01', label: 'Mecánico Seca', group: 'P01' },
  { value: 'PASELE01', label: 'Eléctrico Seca', group: 'P01' },
  { value: 'PASINS01', label: 'Instrumentación Seca', group: 'P01' },
  { value: 'PASCIV01', label: 'Civil Seca', group: 'P01' },
  { value: 'PASLUB01', label: 'Lubricación Seca', group: 'P01' },
  { value: 'PSHSIN01', label: 'Synoptic', group: 'P01' },
  { value: 'PSHDCS01', label: 'DCS & Automation', group: 'P01' },
  // P02 — Heap Leach
  { value: 'PARMEC01', label: 'Mecánico Heap Leach', group: 'P02' },
  { value: 'PARELE01', label: 'Eléctrico Heap Leach', group: 'P02' },
  { value: 'PARINS01', label: 'Instrumentación Heap Leach', group: 'P02' },
  { value: 'PARCIV01', label: 'Civil Heap Leach', group: 'P02' },
  { value: 'PARLUB01', label: 'Lubricación Heap Leach', group: 'P02' },
  // P03 — Planta Área Húmeda
  { value: 'PAHMEC01', label: 'Mecánico Húmeda', group: 'P03' },
  { value: 'PAHELE01', label: 'Eléctrico Húmeda', group: 'P03' },
  { value: 'PAHINS01', label: 'Instrumentación Húmeda', group: 'P03' },
  { value: 'PAHCIV01', label: 'Civil Húmeda', group: 'P03' },
  { value: 'PAHLUB01', label: 'Lubricación Húmeda', group: 'P03' },
  // M01 — Perforación
  { value: 'MPCMEC01', label: 'Mecánico Perforación', group: 'M01' },
  { value: 'MPCELE01', label: 'Eléctrico Perforación', group: 'M01' },
  { value: 'MPCINS01', label: 'Instrumentación Perforación', group: 'M01' },
  { value: 'MPCLUB01', label: 'Lubricación Perforación', group: 'M01' },
  { value: 'MPREDI01', label: 'Predictivo Mina', group: 'M01' },
  // M02 — Carguío
  { value: 'MCAMEC01', label: 'Mecánico Carguío', group: 'M02' },
  { value: 'MCAELE01', label: 'Eléctrico Carguío', group: 'M02' },
  { value: 'MCAINS01', label: 'Instrumentación Carguío', group: 'M02' },
  { value: 'MCALUB01', label: 'Lubricación Carguío', group: 'M02' },
  // M03 — Transporte
  { value: 'MTAMEC01', label: 'Mecánico Transporte', group: 'M03' },
  { value: 'MTAELE01', label: 'Eléctrico Transporte', group: 'M03' },
  { value: 'MTAINS01', label: 'Instrumentación Transporte', group: 'M03' },
  { value: 'MTALUB01', label: 'Lubricación Transporte', group: 'M03' },
  // M04 — Equipos de Apoyo
  { value: 'MAPMEC01', label: 'Mecánico Apoyo', group: 'M04' },
  { value: 'MAPELE01', label: 'Eléctrico Apoyo', group: 'M04' },
  { value: 'MAPGRU01', label: 'Grúas y Puentes', group: 'M04' },
  { value: 'MEXTSOL1', label: 'Soldadura (Externo)', group: 'M04' },
  { value: 'MEXTLAV1', label: 'Lavado (Externo)', group: 'M04' },
  { value: 'MEXTNEU1', label: 'Neumáticos (Externo)', group: 'M04' },
  // M05 — Auxiliares
  { value: 'MAUMEC01', label: 'Mecánico Auxiliar', group: 'M05' },
  { value: 'MAUELE01', label: 'Eléctrico Auxiliar', group: 'M05' },
  { value: 'MAUINS01', label: 'Instrumentación Auxiliar', group: 'M05' },
  { value: 'MAUCIV01', label: 'Civil Auxiliar', group: 'M05' },
];
// Jorge (2026-04-20): Puesto de trabajo RESPONSABLE (supervisores) — distinto
// del puesto de trabajo de mantenedores (WORK_CENTERS). Códigos parten con S.
// Se deriva automáticamente de WORK_CENTERS reemplazando el prefijo (P/M) por S.
// La lista real vendrá del backend; esta derivación cubre el caso mientras tanto.
const RESPONSIBLE_WORK_CENTERS = WORK_CENTERS.map(w => ({
  value: 'S' + w.value.slice(1),
  label: 'Supervisor ' + w.label,
  group: w.group,
}));

const WAREHOUSES = [
  { value: 'WH-001', label: 'WH-001 - Main Warehouse Plant' },
  { value: 'WH-002', label: 'WH-002 - Wet Area Storage' },
  { value: 'WH-003', label: 'WH-003 - Heavy Parts Yard' },
  { value: 'WH-004', label: 'WH-004 - Mine Workshop Store' },
  { value: 'WH-005', label: 'WH-005 - Emergency Spares' },
];
const AREAS_EMPRESA = [
  { value: 'SEC', label: 'SEC - Dry Area' },
  { value: 'HUM', label: 'HUM - Wet Area' },
  { value: 'RIP', label: 'RIP - Heap Leach' },
  { value: 'PER', label: 'PER - Perforacion' },
  { value: 'CAR', label: 'CAR - Carguio' },
  { value: 'TRA', label: 'TRA - Transporte' },
  { value: 'APO', label: 'APO - Apoyo Mina' },
  { value: 'AUX', label: 'AUX - Auxiliar Planta' },
  { value: 'TAL', label: 'TAL - Taller' },
];

export default function Planning({ onNavigateTab, viewMode, autoOpenWoId, onClearAutoOpenWo }) {
  const { plant } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ots');
  const [managedWOs, setManagedWOs] = useState([]);
  const [wosLoading, setWosLoading] = useState(false);
  const [workRequests, setWorkRequests] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [otActionLoading, setOtActionLoading] = useState(null);
  const [selectedWR, setSelectedWR] = useState(null); // inline detail modal
  const [selectedOT, setSelectedOT] = useState(null);
  // Jorge (2026-04-20): ventanas de OT minimizables en paralelo.
  // minimizedOTs = lista de {wo_id, wo_number, status, equipment_tag, wo} restauradas luego.
  const [minimizedOTs, setMinimizedOTs] = useState([]);
  const minimizeCurrentOT = () => {
    if (!selectedOT) return;
    setMinimizedOTs(prev => {
      if (prev.some(o => o.wo_id === selectedOT.wo_id)) return prev;
      return [...prev, selectedOT];
    });
    setSelectedOT(null);
  };
  const restoreMinimizedOT = (woId) => {
    const target = minimizedOTs.find(o => o.wo_id === woId);
    if (!target) return;
    // Si hay una OT abierta, la mandamos a minimizadas antes de restaurar la otra.
    setMinimizedOTs(prev => {
      const without = prev.filter(o => o.wo_id !== woId);
      if (selectedOT && !without.some(o => o.wo_id === selectedOT.wo_id)) {
        return [...without, selectedOT];
      }
      return without;
    });
    setSelectedOT(target);
  };
  const closeMinimizedOT = (woId) => {
    setMinimizedOTs(prev => prev.filter(o => o.wo_id !== woId));
  };
  const [otModalTab, setOtModalTab] = useState('resumen');
  const [modalFullscreen, setModalFullscreen] = useState(true);
  const [editOps, setEditOps] = useState([]);
  const [editMats, setEditMats] = useState([]);
  const [editBudget, setEditBudget] = useState({ labor: '', material: '', external: '' });
  const [editDates, setEditDates] = useState({ start: '', end: '' });
  const [showOTCreatedModal, setShowOTCreatedModal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null); // { woId, woNumber, status }
  const [cancelReason, setCancelReason] = useState('');
  // CE2 Tanda C-EXT (Jorge 2026-04-28 12:32): motivo obligatorio al reprogramar
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [savingOT, setSavingOT] = useState(false);
  const [expandedOps, setExpandedOps] = useState({});
  // Jorge SF-559 (2026-04-27): vista agrupada por especialidad con subtotales
  const [opsViewMode, setOpsViewMode] = useState('flat'); // 'flat' | 'bySpec'
  const [collapsedSpecs, setCollapsedSpecs] = useState({});
  const [extModal, setExtModal] = useState({ open: false, opIdx: -1, context: 'operation' });
  const [extForm, setExtForm] = useState({ vendor: '', vendor_other: '', contract_ref: '', purchasing_group: '', service_type: '', specialty: '', personnel_count: '', estimated_hours: '', rate_per_hour: '', estimated_cost: '', currency: 'USD', start_date: '', end_date: '', lead_time_days: '', contact_name: '', contact_phone: '', safety_requirements: '', notes: '' });
  const [woSearch, setWoSearch] = useState("");
  const [woStatusFilter, setWoStatusFilter] = useState("All");
  // Jorge 2026-04-24 14:18: multi-select priority + P2 en Planning (antes era single "All"/P1/P3/P4)
  const [woPriorityFilter, setWoPriorityFilter] = useState([]); // [] = all
  const [woTypeFilter, setWoTypeFilter] = useState("All");
  // AI ranking state — populated when user clicks "Priorizar con IA"
  const [aiScores, setAiScores] = useState({}); // { equipment_tag: { score, alerts, criticality, ... } }
  const [sortByAI, setSortByAI] = useState(false);
  const [filterSLARisk, setFilterSLARisk] = useState(false);
  // Jorge 2026-04-27 (reunión 18:06) — filtro fechas entry pedido para Planning.
  const [woDateFrom, setWoDateFrom] = useState('');
  const [woDateTo, setWoDateTo] = useState('');
  // SF-557 B3 (2026-04-27): multi-select + bulk status change
  const [selectedWoIds, setSelectedWoIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const filteredWOs = useMemo(() => {
    let wos = managedWOs;
    if (woSearch) {
      const q = woSearch.toLowerCase().replace(/[\s\-]+/g, '');
      wos = wos.filter(wo => (wo.wo_number || "").toLowerCase().replace(/[\s\-]+/g, '').includes(q) || (wo.equipment_tag || "").toLowerCase().includes(woSearch.toLowerCase()) || (wo.description || "").toLowerCase().includes(woSearch.toLowerCase()));
    }
    if (woStatusFilter !== "All") wos = wos.filter(wo => wo.status === woStatusFilter);
    if (Array.isArray(woPriorityFilter) && woPriorityFilter.length > 0) {
      wos = wos.filter(wo => woPriorityFilter.includes(wo.priority_code || wo.priority));
    } else if (typeof woPriorityFilter === 'string' && woPriorityFilter !== 'All') {
      wos = wos.filter(wo => (wo.priority_code || wo.priority) === woPriorityFilter);
    }
    if (woTypeFilter !== "All") wos = wos.filter(wo => wo.wo_type === woTypeFilter);
    if (woDateFrom || woDateTo) {
      wos = wos.filter(wo => {
        const d = (wo.created_at || '').slice(0, 10);
        if (!d) return false;
        if (woDateFrom && d < woDateFrom) return false;
        if (woDateTo && d > woDateTo) return false;
        return true;
      });
    }
    // SLA-at-risk filter
    if (filterSLARisk) {
      wos = wos.filter(wo => {
        const r = aiScores[wo.equipment_tag];
        return r && (r.alerts || []).includes('SLA_BREACH_RISK');
      });
    }
    // AI sort — score descending (SLA risk bumped to top)
    if (sortByAI && Object.keys(aiScores).length > 0) {
      wos = [...wos].sort((a, b) => {
        const ra = aiScores[a.equipment_tag] || { score: 0, alerts: [] };
        const rb = aiScores[b.equipment_tag] || { score: 0, alerts: [] };
        const slaA = ra.alerts?.includes('SLA_BREACH_RISK') ? 1000 : 0;
        const slaB = rb.alerts?.includes('SLA_BREACH_RISK') ? 1000 : 0;
        return (rb.score + slaB) - (ra.score + slaA);
      });
    }
    return wos;
  }, [managedWOs, woSearch, woStatusFilter, woPriorityFilter, woTypeFilter, filterSLARisk, sortByAI, aiScores, woDateFrom, woDateTo]);

  const [execData, setExecData] = useState({ actual_hours: '', observations: '', materials_used: [] });
  const [closingWithAI, setClosingWithAI] = useState(false);
  const [matSearchQuery, setMatSearchQuery] = useState('');
  const [matSearchResults, setMatSearchResults] = useState([]);
  const [matSearchLoading, setMatSearchLoading] = useState(false);
  const [activeMatIdx, setActiveMatIdx] = useState(null);

  // SAP Material autocomplete
  // Jorge 2026-04-23: bug fix — cuando el input estaba vacío o con 1 char, el
  // dropdown "se abría y cerraba al clickear" porque limpiábamos resultados.
  // Ahora: empty o 1 char NO limpia resultados previos (deja el dropdown
  // visible con lo que había), y con 1 char ya busca (no espera 2).
  useEffect(() => {
    if (!matSearchQuery || matSearchQuery.length < 1) return; // preserva resultados previos
    const timer = setTimeout(async () => {
      setMatSearchLoading(true);
      try {
        const res = await api.searchMaterials(matSearchQuery);
        setMatSearchResults(Array.isArray(res) ? res : []);
      } catch { setMatSearchResults([]); }
      finally { setMatSearchLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [matSearchQuery]);

  const selectMaterial = (mat, idx) => {
    const n = [...editMats];
    // Keep code/sapId in sync so the readonly UI locks the description field.
    n[idx] = {
      ...n[idx],
      sapId: mat.sapId,
      sap_id: mat.sapId,
      code: mat.sapId,
      description: mat.description,
      unit: mat.unit || 'PZ',
    };
    setEditMats(n);
    setMatSearchQuery('');
    setMatSearchResults([]);
    setActiveMatIdx(null);
  };

  const [aiCloseResult, setAiCloseResult] = useState(null);


  // Auto-calculate costs from operations + materials
  const LABOR_RATE = (() => { try { return JSON.parse(localStorage.getItem('ocp_settings') || '{}').laborRate || 50; } catch { return 50; } })();
  const calculatedCosts = useMemo(() => {
    const laborHours = editOps.reduce((sum, op) => sum + ((op.quantity || 1) * (op.hours || op.duration || 0)), 0);
    const laborCost = laborHours * LABOR_RATE;
    const materialCost = editMats.reduce((sum, m) => sum + ((m.quantity || 1) * (m.unit_price || 0)), 0);
    const externalCost = editOps.filter(op => op.type === 'EXT').reduce((sum, op) => sum + ((op.quantity || 1) * (op.hours || 0) * LABOR_RATE * 1.5), 0);
    return { laborHours, laborCost, materialCost, externalCost, total: laborCost + materialCost + externalCost };
  }, [editOps, editMats]);

  // Init edit state when OT changes
  useEffect(() => {
    if (selectedOT) {
      setEditOps(selectedOT.operations || []);
      setEditMats(selectedOT.materials || []);
      setEditBudget({ labor: selectedOT.planned_labor || '', material: selectedOT.planned_material || '', external: selectedOT.planned_external || '' });
      // Jorge (2026-04-20): Week Number debe aparecer desde el primer momento.
      // Si la OT todavía no tiene planned_start, tomamos hoy como default.
      const defaultStart = new Date().toISOString().slice(0, 10);
      setEditDates({
        start: selectedOT.planned_start || defaultStart,
        end: selectedOT.planned_end || '',
      });
    }
  }, [selectedOT?.wo_id]);


  const verifyAndClose = async (wo) => {
    setClosingWithAI(true);
    setAiCloseResult(null);
    try {
      const result = await api.verifyCloseManagedWO(wo.wo_id, {
        actual_hours: parseFloat(execData.actual_hours) || 0,
        observations: execData.observations || '',
        materials_used: execData.materials_used || [],
      });
      setAiCloseResult(result);
      if (result.ready) {
        // Auto-save execution data then close
        await api.updateManagedWO(wo.wo_id, {
          actual_hours: parseFloat(execData.actual_hours) || 0,
          labor_cost: (parseFloat(execData.actual_hours) || 0) * LABOR_RATE,
        });
        toast.success('AI verification passed');
      }
    } catch (e) {
      toast.error('Verification error: ' + (e.message || ''));
    } finally {
      setClosingWithAI(false);
    }
  };

  const saveOTChanges = async () => {
    if (!selectedOT) return;
    setSavingOT(true);
    try {
      await api.updateManagedWO(selectedOT.wo_id, {
        operations: editOps,
        materials: editMats,
        labor_cost: calculatedCosts.laborCost || parseFloat(editBudget.labor) || 0,
        material_cost: calculatedCosts.materialCost || parseFloat(editBudget.material) || 0,
        external_cost: calculatedCosts.externalCost || parseFloat(editBudget.external) || 0,
        actual_total_cost: calculatedCosts.total || 0,
        // Keep WO-level estimated_hours in sync with sum of ops × qty. Without
        // this, editing operations to 0h left estimated_hours stale (81h at top
        // vs 0h in rows). Send explicit value even if 0 so backend overrides.
        estimated_hours: calculatedCosts.laborHours,
        planned_start: editDates.start || null,
        planned_end: editDates.end || null,
      });
      toast.success('WO updated');
      fetchData();
    } catch(e) { toast.error('Error: ' + (e.message || '')); }
    finally { setSavingOT(false); }
  };

  // Auto-open OT modal when navigated from another tab
  useEffect(() => {
    if (autoOpenWoId && managedWOs.length > 0) {
      const found = managedWOs.find(wo => wo.wo_id === autoOpenWoId || wo.wo_number === autoOpenWoId);
      if (found) {
        setSelectedOT(found);
        setActiveTab('ots');
        onClearAutoOpenWo?.();
      }
    }
  }, [autoOpenWoId, managedWOs]);
  const [createdOT, setCreatedOT] = useState(null); // OT created from this WR
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const isPlanner = viewMode === 'planner';
  const isSupervisor = viewMode === 'supervisor';

  const fetchData = () => {
    setLoading(true);
    setWosLoading(true);
    api.listManagedWOs({ plant_id: plant, limit: 100 })
      .then(res => setManagedWOs(Array.isArray(res) ? res : (res?.items || [])))
      .catch(() => {})
      .finally(() => setWosLoading(false));
    api.listWorkRequests({ plant_id: plant }).then(res => {
      const wrs = Array.isArray(res) ? res : res?.items || [];
      setWorkRequests(wrs);
    }).catch(() => setWorkRequests([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [plant]);
  // Jorge 2026-04-23: auto-refresh al reconectarse el WS
  useEffect(() => {
    const h = () => fetchData();
    window.addEventListener('ws:reconnected', h);
    return () => window.removeEventListener('ws:reconnected', h);
  }, [plant]); // eslint-disable-line react-hooks/exhaustive-deps
  useWebSocket(plant, useCallback((msg) => {
    if (msg.event?.startsWith('wo_') || msg.event?.startsWith('wr_')) fetchData();
  }, []));

  // Only VALIDATED WRs
  const approvedWRs = useMemo(() => workRequests.filter(wr => ['VALIDATED', 'APROBADO', 'APPROVED'].includes(wr.status)), [workRequests]);
  const filteredWRs = useMemo(() => {
    if (priorityFilter === 'All') return approvedWRs;
    return approvedWRs.filter(wr => (wr.priority || wr.priority_code) === priorityFilter);
  }, [approvedWRs, priorityFilter]);

  const kpis = useMemo(() => {
    const total = approvedWRs.length;
    const p1 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P1').length;
    const p2 = approvedWRs.filter(wr => (wr.priority || wr.priority_code) === 'P2').length;
    const withPlanGroup = approvedWRs.filter(wr => wr.planning_group).length;
    const avgAge = total > 0
      ? Math.round(approvedWRs.reduce((sum, wr) => {
          const c = wr.created_at ? new Date(wr.created_at).getTime() : Date.now();
          return sum + (Date.now() - c) / 86400000;
        }, 0) / total) : 0;
    return { total, urgent: p1 + p2, p1, p2, avgAge, withPlanGroup };
  }, [approvedWRs]);

  const paginatedWRs = useMemo(() => filteredWRs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredWRs, page]);
  const totalPages = Math.ceil(filteredWRs.length / PAGE_SIZE);

  /* ── Open detail modal ── */
  const openDetail = (wr) => {
    setSelectedWR(wr);
    setCreatedOT(null);
    setEditFields({
      planning_group: wr.planning_group || '',
      work_center: wr.work_center || '',
      area_empresa: wr.area_empresa || '',
      aviso_coding: wr.aviso_coding || '',
      priority: wr.priority || wr.priority_code || 'P3',
    });
  };

  /* ── Save planning fields ── */
  const savePlanningFields = async () => {
    if (!selectedWR) return;
    const wrId = selectedWR.work_request_id || selectedWR.request_id;
    setSaving(true);
    try {
      await api.updateWorkRequest(wrId, editFields);
      toast.success('Planning data saved');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  /* ── Actions ── */
  const handleCreateOT = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_ot');
    try {
      // 1. Save planning fields to WR first
      if (editFields.planning_group || editFields.work_center || editFields.priority) {
        await api.updateWorkRequest(wrId, {
          planning_group: editFields.planning_group || wr.planning_group || '',
          work_center: editFields.work_center || wr.work_center || '',
          area_empresa: editFields.area_empresa || wr.area_empresa || '',
          aviso_coding: editFields.aviso_coding || wr.aviso_coding || '',
          priority_code: editFields.priority || wr.priority || wr.priority_code || 'P3',
        });
      }
      // 2. Build operations from suggested_actions (WR AI analysis)
      const sugActions = wr.problem_description?.suggested_action || wr.suggested_action || '';
      const resources = wr.problem_description?.resources || wr.resources || [];
      let operations = [];
      if (sugActions) {
        // Parse numbered steps: "1. Do X\n2. Do Y\n..."
        const steps = sugActions.split(/\n/).filter(l => /^\d+[\.\)]\s/.test(l.trim()));
        operations = steps.map((step, i) => {
          const desc = step.replace(/^\d+[\.\)]\s*/, '').trim();
          const res = resources[i] || resources[0] || {};
          return { type: 'INT', description: desc, specialty: res.type || 'Mechanical', quantity: res.quantity || 1, hours: res.hours || 2 };
        });
      }
      // Jorge SF-510: trabajos con equipo detenido siempre terminan con Limpieza y Housekeeping.
      const isShutdown = wr.shutdown_required || wr.ai_classification?.equipment_stopped ||
        wr.ai_classification?.activity_class === 'PARADA' ||
        /parada|shutdown|equipo detenido/i.test(wr.problem_description?.circumstances || '');
      if (isShutdown) {
        operations.push({
          type: 'INT',
          description: 'Limpieza y Housekeeping del área de trabajo',
          specialty: 'Helper',
          quantity: 2,
          hours: 1,
        });
      }
      // 3. Create OT with operations and original text
      const res = await api.createWOFromWR({
        work_request_id: wrId,
        description: wr.problem_description?.original_text || wr.description || 'WO from Notification',
        wo_type: 'PM01',
        priority_code: editFields.priority || wr.priority || wr.priority_code || 'P3',
        equipment_tag: wr.equipment_tag || wr.asset_tag || '',
        equipment_id: wr.equipment_id || '',
        estimated_hours: wr.estimated_hours || 4,
        planning_group: editFields.planning_group || wr.planning_group || '',
        work_center: editFields.work_center || wr.work_center || '',
        operations: operations.length > 0 ? operations : undefined,
      });
      setCreatedOT(res);
      fetchData();
      // Show centered confirmation modal
      setShowOTCreatedModal({ woNumber: res?.wo_number, woId: res?.wo_id });
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not create WO'));
    } finally { setActionLoading(null); }
  };

  const handleReject = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_reject');
    try {
      await api.validateWorkRequest(wrId, { action: 'REJECT', reason: 'Rejected from planning' });
      toast.success('Notification rejected');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not reject'));
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (wr) => {
    const wrId = wr.work_request_id || wr.request_id;
    setActionLoading(wrId + '_cancel');
    try {
      await api.cancelWorkRequest(wrId, { reason: 'Cancelled from planning' });
      toast.success('Notification cancelled');
      fetchData();
      setSelectedWR(null);
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not cancel'));
    } finally { setActionLoading(null); }
  };

  const handleExport = () => {
    const headers = ['ID', 'Equipment', 'Description', 'Priority', 'Planning Group', 'Work Center', 'Reported By', 'Date', 'Days'];
    const rows = filteredWRs.map(wr => {
      const created = wr.created_at ? new Date(wr.created_at) : null;
      const days = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000)) : 0;
      return [
        wr.work_request_id?.slice(0, 10) || wr.request_id?.slice(0, 10) || '',
        wr.equipment_tag || '', wr.problem_description?.original_text || wr.description || '',
        wr.priority || wr.priority_code || '', wr.planning_group || '', wr.work_center || '',
        wr.reported_by || wr.created_by || '', created ? created.toLocaleDateString() : '', days,
      ];
    });
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Avisos Approveds', headers, rows }] }, `approved_notifications_${new Date().toISOString().slice(0, 10)}`);
    toast.success('Exported ' + filteredWRs.length + ' notifications');
  };

  // Export OT inline en el header del tablero Planning (ver abajo)

  const changeOTStatus = async (wo, ns) => {
    const WO_ID = wo.wo_id;
    setOtActionLoading(ns);
    try {
      let upd;
      if (ns === 'CANCELADO') {
        setOtActionLoading(null);
        setShowCancelModal({ woId: WO_ID, woNumber: wo.wo_number, status: wo.status });
        setCancelReason('');
        return;
      }
      else if (ns === 'CREADO' || ns === 'PENDIENTE') upd = await api.draftManagedWO(WO_ID);
      else if (ns === 'LIBERADO') upd = await api.updateManagedWO(WO_ID, { status: 'LIBERADO' });
      else if (ns === 'PLANIFICADO' || ns === 'APROBADO') upd = await api.planManagedWO(WO_ID);
      else if (ns === 'EN_PROGRAMACION') upd = await api.updateManagedWO(WO_ID, { status: 'EN_PROGRAMACION' });
      else if (ns === 'PROGRAMADO') upd = await api.scheduleManagedWO(WO_ID, {});
      else if (ns === 'REPROGRAMADO') {
        // CE2 Tanda C-EXT (Jorge 2026-04-28): motivo obligatorio
        setOtActionLoading(null);
        setShowRescheduleModal({ woId: WO_ID, woNumber: wo.wo_number, status: wo.status });
        setRescheduleReason('');
        return;
      }
      else if (ns === 'EN_EJECUCION' || ns === 'EN_PROGRESO') upd = await api.startManagedWO(WO_ID);
      else if (ns === 'CERRADO') {
        const hours = parseFloat(execData.actual_hours) || wo.actual_hours || 0;
        if (!hours || hours <= 0) {
          toast.error('Record actual hours in Execution tab before closing');
          setOtActionLoading(null);
          setOtModalTab('ejecucion');
          return;
        }
        upd = await api.completeManagedWO(WO_ID, { actual_hours: hours, execution_notes: execData.observations || '' });
      }
      if (upd) {
        const STATUS_LABEL = {
          CREADO: 'Created', LIBERADO: 'Released', PLANIFICADO: 'Planned',
          EN_PROGRAMACION: 'In Scheduling', PROGRAMADO: 'Scheduled', REPROGRAMADO: 'Rescheduled',
          EN_EJECUCION: 'In Execution', COMPLETADO: 'Completed', CERRADO: 'Closed',
          CANCELADO: 'Cancelled', PENDIENTE: 'Pending', APROBADO: 'Approved',
        };
        toast.success('Status updated: ' + (STATUS_LABEL[ns] || ns));
        setSelectedOT(upd);
        fetchData();
      } else {
        toast.error('Transition not allowed or WO not found');
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Could not change status'));
    } finally {
      setOtActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Role indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPlanner ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPlanner ? 'Planner View' : 'Supervisor View'}
        </span>
        <span className="text-xs text-gray-400">
          {isPlanner ? 'Assign group, work center and create WOs' : 'Review backlog and priorities — read only'}
        </span>
        {isPlanner && (<>
          {/* +New Preventive WO removed per Jorge feedback #6 — WOs without aviso only created by strategy engine */}
          <button onClick={() => {
            toast.info('Analizando backlog con IA (Pareto + criticidad + SLA)…');
            api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' })
              .then(res => {
                const ranked = res?.ranked_items || [];
                // Build the scores map by equipment_tag so the table can display per-row score
                const scoreMap = {};
                ranked.forEach(r => {
                  if (!r.equipment_tag) return;
                  // Keep the highest-score entry if the same tag appears multiple times
                  if (!scoreMap[r.equipment_tag] || scoreMap[r.equipment_tag].score < r.total_score) {
                    scoreMap[r.equipment_tag] = {
                      score: r.total_score || 0,
                      alerts: r.alerts || [],
                      criticality: r.criticality_class,
                      sla_remaining: r.sla_remaining_hours,
                      contributions: r.contributions || null,
                      raw_factors: r.raw_factors || null,
                    };
                  }
                });
                setAiScores(scoreMap);
                setSortByAI(true);  // auto-enable AI sort after ranking
                const top = ranked.slice(0, 5);
                const sla = (res?.sla_alerts || []).length;
                if (top.length > 0) {
                  toast.success(
                    <div className="text-xs">
                      <div className="font-bold mb-1">Top 5 OTs priorizadas (Pareto/criticidad)</div>
                      {top.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-purple-700">#{i+1}</span>
                          <span className="font-mono">{r.equipment_tag || '—'}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">{r.criticality_class}</span>
                          <span className="ml-auto font-semibold">{(r.total_score || 0).toFixed(0)}%</span>
                        </div>
                      ))}
                      {sla > 0 && <div className="mt-2 text-red-600 font-semibold">⚠️ {sla} con SLA en riesgo</div>}
                      <div className="mt-1 text-gray-400">Total ranqueado: {ranked.length} OTs</div>
                    </div>,
                    12000
                  );
                } else {
                  toast.info('Sin OTs activas para priorizar');
                }
                fetchData();
              })
              .catch(e => toast.error('Error: ' + (e.message || '')));
          }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
            title="Ranking IA multi-criterio: criticidad del equipo (40%) + urgencia SLA (30%) + repetición histórica / Pareto (20%) + impacto productivo (10%). Prioriza primero P1/P2 fast-track, luego ordena P3/P4 por score combinado.">
            <Sparkles className="w-3 h-3" /> Priorizar con IA
          </button>
        </>)}
      </div>

      {/* KPI Cards — Jorge 2026-04-24 14:18: 4 conteos por status principal */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(() => {
          const byStatus = (keys) => managedWOs.filter(w => keys.includes((w.status || '').toUpperCase())).length;
          const cards = [
            { label: 'Creadas', count: byStatus(['CREADO','CREATED','LIBERADO','APROBADO']), color: 'border-l-gray-400', text: 'text-gray-700' },
            { label: 'Planificadas', count: byStatus(['PLANIFICADO','PLANNED']), color: 'border-l-blue-400', text: 'text-blue-700' },
            { label: 'Programadas', count: byStatus(['PROGRAMADO','EN_PROGRAMACION','SCHEDULED','EN_EJECUCION','EN_PROGRESO','IN_PROGRESS']), color: 'border-l-indigo-400', text: 'text-indigo-700' },
            { label: 'Cerradas', count: byStatus(['CERRADO','CLOSED','COMPLETED']), color: 'border-l-emerald-400', text: 'text-emerald-700' },
          ];
          return cards.map(c => (
            <div key={c.label} className={`bg-white rounded-lg border-l-4 ${c.color} border border-gray-200 p-5`}>
              <p className={`text-sm ${c.text} mb-1`}>{c.label}</p>
              <p className="text-3xl font-bold text-gray-900">{c.count}</p>
            </div>
          ));
        })()}
      </div>

      {/* Unified Filter */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ots')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ots' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Work Orders ({managedWOs.length})
        </button>
      </div>

      {activeTab === "ots" && (
        <div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Work Orders</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{filteredWOs.length} / {managedWOs.length} OTs</span>
                {/* Jorge 2026-04-24 (obs doc): Pasar a Excel en tablero Planning */}
                <button onClick={() => {
                  const headers = ['OT #', 'Tipo', 'Equipo', 'TL', 'Descripción', 'Prioridad', 'Status', 'Plan HH', 'Actual HH', 'Plan Start', 'Plan End', 'Creado'];
                  const rows = filteredWOs.map(wo => [
                    wo.wo_number || '', wo.wo_type || '', wo.equipment_tag || '', wo.technical_location || '',
                    wo.description || wo.wo_title || '', wo.priority_code || '', wo.status || '',
                    wo.estimated_hours || 0, wo.actual_hours || 0,
                    wo.planned_start ? new Date(wo.planned_start).toLocaleDateString() : '',
                    wo.planned_end ? new Date(wo.planned_end).toLocaleDateString() : '',
                    wo.created_at ? new Date(wo.created_at).toLocaleDateString() : '',
                  ]);
                  downloadExport({ format: 'EXCEL', sheets: [{ name: 'Órdenes de Trabajo', headers, rows }] }, `ordenes_planning_${new Date().toISOString().slice(0, 10)}`);
                  toast.success('Exportadas ' + rows.length + ' OTs');
                }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                  <Download className="w-4 h-4" /> Pasar a Excel
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={woSearch} onChange={e => setWoSearch(e.target.value)}
                  placeholder="Search WO number, equipment, description..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              </div>
              <select value={woStatusFilter} onChange={e => setWoStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Status</option>
                <option value="CREADO">Created</option>
                <option value="LIBERADO">Released</option>
                <option value="PLANIFICADO">Planned</option>
                <option value="EN_PROGRAMACION">In Scheduling</option>
                <option value="PROGRAMADO">Scheduled</option>
                <option value="EN_EJECUCION">In Execution</option>
                <option value="CERRADO">Closed</option>
                <option value="CANCELADO">Cancelled</option>
              </select>
              {/* Jorge 2026-04-24 14:18: multi-select priority (P1/P2/P3/P4) */}
              <div className="flex items-center gap-1">
                {['P1','P2','P3','P4'].map(p => {
                  const sel = Array.isArray(woPriorityFilter) && woPriorityFilter.includes(p);
                  return (
                    <button key={p} type="button"
                      onClick={() => setWoPriorityFilter(prev => {
                        const arr = Array.isArray(prev) ? [...prev] : [];
                        const i = arr.indexOf(p);
                        if (i >= 0) arr.splice(i, 1); else arr.push(p);
                        return arr;
                      })}
                      className={`text-xs px-2.5 py-1.5 rounded-md font-bold border ${sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <select value={woTypeFilter} onChange={e => setWoTypeFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Types</option>
                {/* Jorge 2026-04-24 (obs doc): agregar PM2 + PM3 al filtro */}
                <option value="PM01">PM01 - Programado</option>
                <option value="PM02">PM02 - Planificado</option>
                <option value="PM03">PM03 - No Programado (Falla)</option>
              </select>
              <div className="flex items-center gap-1">
                <input type="date" value={woDateFrom} onChange={e => setWoDateFrom(e.target.value)}
                  title="Desde (fecha de creación)"
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white" />
                <span className="text-xs text-gray-400">→</span>
                <input type="date" value={woDateTo} onChange={e => setWoDateTo(e.target.value)}
                  title="Hasta (fecha de creación)"
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white" />
              </div>
              {(woSearch || woStatusFilter !== "All" || (Array.isArray(woPriorityFilter) ? woPriorityFilter.length > 0 : woPriorityFilter !== "All") || woTypeFilter !== "All" || woDateFrom || woDateTo) && (
                <button onClick={() => { setWoSearch(""); setWoStatusFilter("All"); setWoPriorityFilter([]); setWoTypeFilter("All"); setWoDateFrom(""); setWoDateTo(""); }}
                  className="text-xs text-gray-500 hover:text-red-500 px-2 py-2 border border-gray-200 rounded-lg">Clear</button>
              )}
              {/* SF-557: bulk action — pasar OTs seleccionadas a En Programación */}
              {selectedWoIds.size > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-blue-700">{selectedWoIds.size} sel.</span>
                  <button onClick={() => setSelectedWoIds(new Set())}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 border border-gray-200 rounded-lg">
                    Limpiar
                  </button>
                  <button disabled={bulkBusy}
                    onClick={async () => {
                      const ids = Array.from(selectedWoIds);
                      const eligible = filteredWOs.filter(w => ids.includes(w.wo_id) && ['PLANIFICADO', 'LIBERADO', 'CREADO'].includes((w.status || '').toUpperCase()));
                      if (eligible.length === 0) {
                        toast.error('Ninguna seleccionada está en estado PLANIFICADO/LIBERADO/CREADO');
                        return;
                      }
                      if (!window.confirm(`¿Pasar ${eligible.length} OT(s) a "En Programación"? El audit trail registra el cambio.`)) return;
                      setBulkBusy(true);
                      const results = await Promise.allSettled(
                        eligible.map(w => api.updateManagedWO(w.wo_id, { status: 'EN_PROGRAMACION' }))
                      );
                      const ok = results.filter(r => r.status === 'fulfilled').length;
                      const failed = eligible.length - ok;
                      if (failed === 0) toast.success(`✓ ${ok} OT(s) → En Programación`);
                      else toast.error(`${ok} ok · ${failed} fallaron`);
                      setSelectedWoIds(new Set());
                      setBulkBusy(false);
                      fetchData();
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                    {bulkBusy ? 'Procesando…' : '→ En Programación'}
                  </button>
                </div>
              )}
            </div>

            {/* AI ranking controls (visible once the user has run Priorizar con IA) */}
            {Object.keys(aiScores).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap px-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Ranking IA activo</span>
                <button onClick={() => setSortByAI(s => !s)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${sortByAI ? 'bg-purple-600 text-white border-purple-600' : 'border-purple-300 text-purple-700 hover:bg-purple-50'}`}>
                  {sortByAI ? '✓ Ordenar por score' : 'Ordenar por score'}
                </button>
                <button onClick={() => setFilterSLARisk(s => !s)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${filterSLARisk ? 'bg-red-600 text-white border-red-600' : 'border-red-300 text-red-700 hover:bg-red-50'}`}>
                  {filterSLARisk ? '✓ Solo SLA en riesgo' : '⚠️ Solo SLA en riesgo'}
                </button>
                <button onClick={() => { setAiScores({}); setSortByAI(false); setFilterSLARisk(false); }}
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Limpiar ranking
                </button>
              </div>
            )}
          </div>
          {wosLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              Loading WOs...
            </div>
          ) : managedWOs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-3 opacity-40">🔧</div>
              <p className="text-sm font-medium">No WOs registered</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-3 py-3 w-8">
                      <input type="checkbox"
                        checked={filteredWOs.length > 0 && filteredWOs.every(w => selectedWoIds.has(w.wo_id))}
                        onChange={e => {
                          if (e.target.checked) setSelectedWoIds(new Set(filteredWOs.map(w => w.wo_id)));
                          else setSelectedWoIds(new Set());
                        }}
                        title="Seleccionar todas (filtradas)"
                        className="cursor-pointer" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">WO Number</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    {/* Jorge 2026-04-24 14:18: columna "Equipment" reemplazada por TL + TAG */}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubic. Técnica / TAG</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    {Object.keys(aiScores).length > 0 && (
                      <th className="text-left px-4 py-3 text-xs font-semibold text-purple-600 uppercase tracking-wider" title="Score IA multi-criterio (criticidad + SLA + Pareto)">
                        Score IA
                      </th>
                    )}
                    {/* Jorge 2026-04-23 (reunión 17:38): fecha creación OT (distinta a Planned Date) */}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWOs.map((wo, i) => {
                    const SAP_STATUS = {
                      CREADO: { label: 'Created', color: 'bg-yellow-100 text-yellow-700' },
                      LIBERADO: { label: 'Released', color: 'bg-blue-100 text-blue-700' },
                      PLANIFICADO: { label: 'Planned', color: 'bg-teal-100 text-teal-700' },
                      EN_PROGRAMACION: { label: 'In Scheduling', color: 'bg-indigo-100 text-indigo-700' },
                      PROGRAMADO: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700' },
                      REPROGRAMADO: { label: 'Rescheduled', color: 'bg-orange-100 text-orange-700' },
                      EN_EJECUCION: { label: 'In Execution', color: 'bg-amber-100 text-amber-700' },
                      COMPLETADO: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
                      CERRADO: { label: 'Closed', color: 'bg-green-100 text-green-700' },
                      CANCELADO: { label: 'Cancelled', color: 'bg-gray-300 text-gray-600' },
                      PENDIENTE: { label: 'Created', color: 'bg-yellow-100 text-yellow-700' },
                      APROBADO: { label: 'Released', color: 'bg-blue-100 text-blue-700' },
                      EN_PROGRESO: { label: 'In Execution', color: 'bg-amber-100 text-amber-700' },
                    };
                    const TYPE_LABEL = {
                      PM01: 'PM01', PM02: 'PM02', PM03: 'PM03',
                    };
                    const s = SAP_STATUS[wo.status] || { label: wo.status, color: 'bg-gray-100 text-gray-600' };
                    const pColor = { P1: 'text-red-600 font-bold', P2: 'text-orange-600 font-semibold', P3: 'text-yellow-600', P4: 'text-blue-600' };
                    return (
                      <tr key={wo.wo_id || i} className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer ${selectedWoIds.has(wo.wo_id) ? 'bg-blue-50/60' : ''}`} onClick={() => setSelectedOT(wo)}>
                        <td className="px-3 py-3 w-8" onClick={e => e.stopPropagation()}>
                          <input type="checkbox"
                            checked={selectedWoIds.has(wo.wo_id)}
                            onChange={e => {
                              setSelectedWoIds(prev => {
                                const n = new Set(prev);
                                if (e.target.checked) n.add(wo.wo_id);
                                else n.delete(wo.wo_id);
                                return n;
                              });
                            }}
                            className="cursor-pointer" />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{wo.wo_number}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{TYPE_LABEL[wo.wo_type] || wo.wo_type || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {wo.technical_location && <div className="text-blue-600"><span className="font-semibold">TL:</span> {wo.technical_location}</div>}
                          {wo.equipment_tag && <div className="font-mono text-gray-600"><span className="font-semibold">TAG:</span> {wo.equipment_tag}</div>}
                          {!wo.technical_location && !wo.equipment_tag && <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{wo.description || wo.failure_description || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${pColor[wo.priority_code||wo.priority] || 'text-gray-500'}`}>{wo.priority_code||wo.priority||'—'}</span>
                        </td>
                        {Object.keys(aiScores).length > 0 && (() => {
                          const r = aiScores[wo.equipment_tag];
                          if (!r) return <td className="px-4 py-3"><span className="text-xs text-gray-300">—</span></td>;
                          const scoreColor = r.score >= 70 ? 'bg-red-100 text-red-700' : r.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600';
                          const isSLA = (r.alerts || []).includes('SLA_BREACH_RISK');
                          const c = r.contributions;
                          const tipLines = c ? [
                            `Criticidad equipo:  ${c.criticality?.toFixed?.(1) ?? c.criticality}`,
                            `Health score:       ${c.health_score?.toFixed?.(1) ?? c.health_score}`,
                            `Proximidad SLA:     ${c.sla_proximity?.toFixed?.(1) ?? c.sla_proximity}`,
                            `Frecuencia falla:   ${c.failure_frequency?.toFixed?.(1) ?? c.failure_frequency}`,
                            `Costo diferir:      ${c.cost_of_deferral?.toFixed?.(1) ?? c.cost_of_deferral}`,
                            `Seguridad:          ${c.safety_impact?.toFixed?.(1) ?? c.safety_impact}`,
                            `─────────────`,
                            `Total:              ${Math.round(r.score)}`,
                          ].join('\n') : `Score: ${Math.round(r.score)}`;
                          return (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  title={tipLines}
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-help ${scoreColor}`}
                                >
                                  {Math.round(r.score)}%
                                </span>
                                {isSLA && <span title="SLA en riesgo" className="text-[10px]">⚠️</span>}
                                {(r.alerts || []).includes('CHRONIC_EQUIPMENT') && <span title="Equipo crónico" className="text-[10px]">🔁</span>}
                              </div>
                            </td>
                          );
                        })()}
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {wo.created_at ? new Date(wo.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {wo.planned_start ? new Date(wo.planned_start).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—'}
                        </td>
                        <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {wo.status === 'EN_PROGRAMACION' && (
                              <button onClick={async () => {
                                if (!wo.planned_start || !(wo.assigned_workers || []).length) {
                                  toast.error('La OT necesita fecha y técnico asignado antes de reservar');
                                  return;
                                }
                                if (!confirm(`¿Reservar ${wo.wo_number}? Bloquea HH y pasa a PROGRAMADO.`)) return;
                                try {
                                  const upd = await api.scheduleManagedWO(wo.wo_id, { status: 'PROGRAMADO' });
                                  toast.success(`${wo.wo_number} reservada`);
                                  fetchData();
                                } catch (e) { toast.error('Error al reservar'); }
                              }} className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors" title="Reservar HH (pasa a PROGRAMADO)">
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={async () => {
                              if (!confirm(`¿Delete ${wo.wo_number}?`)) return;
                              try { await api.deleteManagedWO(wo.wo_id); toast.success('WO deleted'); fetchData(); }
                              catch(e) { toast.error('Error deleting'); }
                            }} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors" title="Delete WO">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DEAD CODE — tabs removed, blocks unreachable. Kept for reference only. Safe to delete in a future cleanup. */}
      {false && activeTab === 'backlog' && (
        <div>

      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Approved Notifications - Planning Backlog</h3>
          <span className="text-sm text-gray-400">{filteredWRs.length} notifications</span>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 font-medium">Priority:</span>
        {['All', 'P1', 'P2', 'P3', 'P4'].map(opt => (
          <button key={opt} onClick={() => { setPriorityFilter(opt); setPage(0); }}
            className={`text-sm font-medium px-2.5 py-1 rounded transition-colors ${
              priorityFilter === opt ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {opt === 'All' ? 'All' : opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredWRs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 opacity-40">&#128203;</div>
            <p className="text-sm font-medium">No approved notifications</p>
            <p className="text-xs mt-1">Los notifications aparecen aqui cuando el supervisor los aprueba desde Identification</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notification ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning Group</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Work Center</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                {isPlanner && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedWRs.map(wr => {
                const wrId = wr.work_request_id || wr.request_id || '';
                const displayId = 'WN-' + wrId.slice(0, 6);
                const priority = wr.priority || wr.priority_code || 'P3';
                const desc = wr.problem_description?.original_text || wr.description || '';
                const created = wr.created_at ? new Date(wr.created_at) : null;
                const days = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000)) : 0;
                const isLoading = actionLoading && actionLoading.startsWith(wrId);
                const hasPlanData = wr.planning_group && wr.work_center;

                return (
                  <tr key={wrId}
                    className={`border-b border-gray-50 transition-colors cursor-pointer ${
                      !hasPlanData && isPlanner ? 'hover:bg-yellow-50/50 bg-yellow-50/20' : 'hover:bg-emerald-50/50'
                    }`}
                    onClick={() => openDetail(wr)}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-700 font-medium">{displayId}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{wr.equipment_tag || '---'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={desc}>{desc || '---'}</td>
                    <td className="px-4 py-3"><PriorityLabel priority={priority} /></td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {wr.planning_group
                        ? <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{wr.planning_group}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {wr.work_center
                        ? <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{wr.work_center}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${days > 7 ? 'text-red-600' : days > 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {days}d
                      </span>
                    </td>
                    {isPlanner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <span className="text-[10px] text-blue-500 font-medium italic cursor-pointer hover:underline" onClick={() => navigate('/work-requests', { state: { openId: wr.id } })}>View detail →</span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredWRs.length)} de {filteredWRs.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ INLINE DETAIL MODAL ═══ */}
      {selectedWR && (() => {
        const wr = selectedWR;
        const wrId = wr.work_request_id || wr.request_id || '';
        const desc = wr.problem_description?.original_text || wr.description || '';
        const suggestedAction = wr.problem_description?.suggested_action || '';
        const created = wr.created_at ? new Date(wr.created_at) : null;
        const priority = wr.priority || wr.priority_code || 'P3';
        const filteredWCs = editFields.planning_group
          ? WORK_CENTERS.filter(wc => wc.group === editFields.planning_group)
          : WORK_CENTERS;

        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedWR(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-blue-700">WN-{wrId.slice(0, 6)}</span>
                    <PriorityLabel priority={priority} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isPlanner ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isPlanner ? 'Planner' : 'Supervisor'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{wr.equipment_tag || 'No equipment'} · {created ? created.toLocaleDateString() : '---'}</p>
                </div>
                <button onClick={() => setSelectedWR(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Problem Description
                  </label>
                  <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{desc || 'No description'}</p>
                </div>

                {suggestedAction && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Action</label>
                    <p className="text-sm text-emerald-700 mt-1 bg-emerald-50 rounded-lg p-3">{suggestedAction}</p>
                  </div>
                )}

                {/* OT Created confirmation */}
                {createdOT && (
                  <div className="border-2 border-emerald-300 rounded-xl p-4 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h4 className="text-sm font-bold text-emerald-800">Work Order Created</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Número OT</div>
                        <div className="text-xl font-bold font-mono text-emerald-700">{createdOT.wo_number || createdOT.id?.slice(0,8)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Status</div>
                        <div className="text-sm font-semibold text-emerald-700">Pending Scheduling</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Materials */}
                {wr.materials && wr.materials.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials SAP</label>
                    <div className="mt-1 space-y-1">
                      {wr.materials.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-3 py-1.5 border border-gray-100">
                          <span className="font-mono text-emerald-700 font-semibold">{typeof m === 'string' ? m : m.sapId || '—'}</span>
                          {typeof m !== 'string' && m.description && <span className="text-gray-600">— {m.description}</span>}
                          {typeof m !== 'string' && m.quantity && <span className="ml-auto text-gray-400">{m.quantity} {m.unit || 'UD'}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {wr.resources && wr.resources.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {wr.resources.map((r, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded px-2 py-1">
                          {typeof r === 'string' ? r : `${r.type || ''} x${r.quantity || 1} (${r.hours || 0}h)`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Reported By</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.reported_by || wr.created_by || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Notification Type</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.notification_type || '---'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase">Coding</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{wr.aviso_coding || '---'}</div>
                  </div>
                </div>

                {/* ── Planner: Editable BBP fields ── */}
                {isPlanner ? (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Planning Data (Editable)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Planning Group</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.planning_group}
                          onChange={e => {
                            setEditFields(f => ({ ...f, planning_group: e.target.value, work_center: '' }));
                          }}>
                          <option value="">— Select —</option>
                          {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Work Center</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.work_center}
                          onChange={e => setEditFields(f => ({ ...f, work_center: e.target.value }))}>
                          <option value="">— Select —</option>
                          {filteredWCs.map(wc => <option key={wc.value} value={wc.value}>{wc.value} - {wc.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Company Area</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.area_empresa}
                          onChange={e => setEditFields(f => ({ ...f, area_empresa: e.target.value }))}>
                          <option value="">— Select —</option>
                          {AREAS_EMPRESA.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          value={editFields.priority}
                          onChange={e => setEditFields(f => ({ ...f, priority: e.target.value }))}>
                          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{k} - {v}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-blue-200">
                      <button onClick={savePlanningFields} disabled={!!saving || !!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                      <button onClick={() => handleCreateOT(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        {actionLoading?.endsWith('_ot') ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create WO
                      </button>
                      <button onClick={() => handleReject(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => handleCancel(selectedWR)} disabled={!!actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors disabled:opacity-50">
                        <Ban className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Supervisor: Read-only view ── */
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Planning Data (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Planning Group', value: wr.planning_group, icon: MapPin },
                        { label: 'Work Center', value: wr.work_center, icon: Wrench },
                        { label: 'Company Area', value: wr.area_empresa, icon: Building2 },
                        { label: 'Priority', value: `${priority} - ${PRIORITY_LABELS[priority] || priority}`, icon: Tag },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] text-gray-400 uppercase">{label}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">Not assigned</span>}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
        </div>
      )}
      {/* OT DETAIL MODAL */}
      {selectedOT && (() => {
        const wo = selectedOT;
        const SAP = {
          CREADO:{label:'Created',color:'bg-yellow-100 text-yellow-700'},
          LIBERADO:{label:'Released',color:'bg-blue-100 text-blue-700'},
          PLANIFICADO:{label:'Planned',color:'bg-teal-100 text-teal-700'},
          EN_PROGRAMACION:{label:'In Scheduling',color:'bg-indigo-100 text-indigo-700'},
          PROGRAMADO:{label:'Scheduled',color:'bg-purple-100 text-purple-700'},
          REPROGRAMADO:{label:'Rescheduled',color:'bg-orange-100 text-orange-700'},
          EN_EJECUCION:{label:'In Execution',color:'bg-amber-100 text-amber-700'},
          CERRADO:{label:'Closed',color:'bg-green-100 text-green-700'},
          CANCELADO:{label:'Cancelled',color:'bg-gray-300 text-gray-600'},
          PENDIENTE:{label:'Created',color:'bg-yellow-100 text-yellow-700'},
          APROBADO:{label:'Released',color:'bg-blue-100 text-blue-700'},
          EN_PROGRESO:{label:'In Execution',color:'bg-amber-100 text-amber-700'},
        };
        // Jorge (2026-04-20): sacar status CANCELADO de la OT. La cancelación sólo
        // existe en la WR antes de crear OT; una vez creada, sólo avanza en la cadena.
        const NEXT = {
          CREADO:[['LIBERADO','Release','bg-blue-600 text-white hover:bg-blue-700']],
          LIBERADO:[['PLANIFICADO','Mark Planned','bg-teal-600 text-white hover:bg-teal-700']],
          PLANIFICADO:[['EN_PROGRAMACION','To Scheduling','bg-indigo-600 text-white hover:bg-indigo-700']],
          EN_PROGRAMACION:[['PROGRAMADO','Schedule','bg-purple-600 text-white hover:bg-purple-700']],
          PROGRAMADO:[['EN_EJECUCION','Start Execution','bg-amber-500 text-white hover:bg-amber-600'],['REPROGRAMADO','Reschedule','bg-orange-500 text-white hover:bg-orange-600']],
          REPROGRAMADO:[['PROGRAMADO','Reschedule','bg-indigo-600 text-white hover:bg-indigo-700']],
          EN_EJECUCION:[['CERRADO','Close','bg-green-600 text-white hover:bg-green-700'],['REPROGRAMADO','Reschedule','bg-orange-500 text-white hover:bg-orange-600']],
          CERRADO:[],
          PENDIENTE:[['LIBERADO','Release','bg-blue-600 text-white hover:bg-blue-700']],
          APROBADO:[['LIBERADO','Release','bg-blue-600 text-white hover:bg-blue-700']],
          EN_PROGRESO:[['CERRADO','Close','bg-green-600 text-white hover:bg-green-700']],
        };
        const TLBL = {PM01:'PM01',PM02:'PM02',PM03:'PM03'};
        const s = SAP[wo.status] || {label:wo.status,color:"bg-gray-100 text-gray-600"};
        const actions = NEXT[wo.status] || [];
        const ALL = ['CREADO','LIBERADO','PLANIFICADO','EN_PROGRAMACION','PROGRAMADO','EN_EJECUCION','CERRADO'];

        // Execution flow now lives in the top-level Execution module (Bandeja de Cierre).
        // The old 'ejecucion' sub-tab inside this modal was duplicating that flow — removed.
        // Jorge SF-515 — tab "Notificación HH" solo visible en EN_EJECUCION.
        // Jorge 2026-04-21 — tab "Post-Review" solo visible en CERRADO.
        const isExec = wo.status === 'EN_EJECUCION';
        const isClosed = wo.status === 'CERRADO';
        const OT_TABS = [
          { id: 'resumen', label: 'Summary', icon: Info },
          { id: 'operaciones', label: 'Operations', icon: List },
          { id: 'materiales', label: 'Materials', icon: Package },
          { id: 'costos', label: 'Costs', icon: DollarSign },
          ...(isExec ? [{ id: 'notif_hh', label: 'Notif. HH', icon: Clock }] : []),
          ...(isClosed ? [{ id: 'post_review', label: 'Post-Review', icon: ClipboardCheck }] : []),
          { id: 'historial', label: 'History', icon: MessageSquare },
        ];

        const ops = wo.operations || [];
        const costCats = [
          { key: 'labor', label: 'Labor', plan: calculatedCosts.laborCost || wo.labor_cost || (wo.estimated_budget||0)*0.5, real: wo.actual_labor || wo.labor_cost || 0, color: 'blue' },
          { key: 'material', label: 'Materials', plan: calculatedCosts.materialCost || wo.material_cost || (wo.estimated_budget||0)*0.3, real: wo.actual_material || wo.material_cost || 0, color: 'amber' },
          { key: 'external', label: 'External', plan: calculatedCosts.externalCost || wo.external_cost || (wo.estimated_budget||0)*0.2, real: wo.actual_external || wo.external_cost || 0, color: 'purple' },
        ];
        const totalPlan = costCats.reduce((s,c2) => s+c2.plan, 0) || wo.estimated_budget || 0;
        const totalReal = costCats.reduce((s,c2) => s+c2.real, 0);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:pl-[240px]" onClick={() => { setSelectedOT(null); setModalFullscreen(false); }}>
            <div className={`bg-white rounded-2xl shadow-xl flex flex-col transition-all duration-300 ${modalFullscreen ? "w-full h-[94vh]" : "w-[90vw] max-w-5xl h-[85vh]"}`} onClick={e => e.stopPropagation()}>

              {/* HEADER */}
              <div className="border-b px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-gray-900">{wo.wo_number}</h2>
                      <span className={"text-xs px-2.5 py-1 rounded font-semibold "+s.color}>{s.label}</span>
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{TLBL[wo.wo_type]||wo.wo_type||""}</span>
                      {wo.is_fast_track && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">FAST TRACK</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {wo.equipment_tag||"No equipment"} {wo.priority_code ? "\• "+wo.priority_code : ""}
                      {/* Jorge (2026-04-20): link clickeable OT → aviso origen */}
                      {wo.work_request_id && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Abrir en nueva pestaña para no perder el tab Planning
                              // ni el OT modal actual al volver.
                              window.open(`/work-management?tab=identification&openWr=${encodeURIComponent(wo.work_request_id)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline font-mono"
                            title="Ver aviso de origen (nueva pestaña)"
                          >
                            ← {wo.work_request_id} ↗
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                  {/* Controles del modal agrupados a la derecha */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={saveOTChanges}
                      disabled={savingOT}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                      title="Guardar todos los cambios de la OT"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingOT ? 'Saving…' : 'Save OT'}
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button onClick={() => setModalFullscreen(f => !f)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title={modalFullscreen ? 'Resize' : 'Maximize'}>
                      {modalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={minimizeCurrentOT}
                      className="px-2 py-0 h-8 hover:bg-gray-100 rounded-lg text-gray-500 text-xl font-bold leading-none flex items-center justify-center"
                      title="Minimizar a la barra (conservar estado)">_</button>
                    <button onClick={() => setSelectedOT(null)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-colors"
                      title="Cerrar">
                      <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1 mt-3 -mb-4">
                  {OT_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setOtModalTab(tab.id)}
                      className={"flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border border-b-0 transition-colors "+(otModalTab === tab.id ? "bg-white text-blue-700 border-gray-200" : "bg-gray-50 text-gray-500 border-transparent hover:text-gray-700")}>
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* RESUMEN */}
                {otModalTab === 'resumen' && (
                  <div className="space-y-4">
                    {wo.priority_code && (() => {
                      const imp = { P1: { l: 'CRITICAL', c: 'bg-red-50 border-red-300 text-red-800', s: 95 }, P2: { l: 'HIGH', c: 'bg-orange-50 border-orange-300 text-orange-800', s: 75 }, P3: { l: 'MEDIUM', c: 'bg-yellow-50 border-yellow-300 text-yellow-800', s: 45 }, P4: { l: 'LOW', c: 'bg-green-50 border-green-300 text-green-800', s: 20 } };
                      const d = imp[wo.priority_code] || imp.P3;
                      return <div className={"rounded-xl p-4 border-2 flex items-center justify-between "+d.c}>
                        <div><div className="text-xs font-bold uppercase">Production Impact</div><div className="text-lg font-bold">{d.l}</div></div>
                        <div className="text-3xl font-black">{d.s}</div>
                      </div>;
                    })()}
                    {/* WO Title (Título de Cabecera) — from AI main_action */}
                    {wo.wo_title && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">WO Title</label>
                        <p className="text-base font-bold text-gray-900 mt-1">{wo.wo_title}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                      <p className="text-sm text-gray-800 mt-1 bg-gray-50 rounded-lg p-3">{wo.description||wo.failure_description||"No description"}</p>
                    </div>
                    {/* Jorge 2026-04-24 (obs doc): 6 tarjetas Plan/Actual × HH/Duración/Costo */}
                    <div className="grid grid-cols-3 gap-3">
                      {(() => {
                        const opsHH = (editOps || []).reduce((s, o) => s + ((parseFloat(o.quantity) || 1) * (parseFloat(o.hours) || 0)), 0);
                        const plannedHH = opsHH > 0 ? opsHH : (wo.estimated_hours || 0);
                        const actualHH = wo.actual_hours || execData.actual_hours || 0;
                        // Jorge 2026-04-27 (G): Duración planificada = serie + max(paralelos por grupo).
                        // Antes: planned_end - planned_start, lo cual daba 0h cuando ambas
                        // fechas eran el mismo día sin horario.
                        const opsSerieHrs = (editOps || []).filter(o => !o.parallel).reduce((s, o) => s + (parseFloat(o.hours) || 0), 0);
                        const opsParallelGroups = {};
                        for (const o of (editOps || []).filter(o => o.parallel)) {
                          const g = o.parallel_group || 'A';
                          opsParallelGroups[g] = Math.max(opsParallelGroups[g] || 0, parseFloat(o.hours) || 0);
                        }
                        const opsParallelHrs = Object.values(opsParallelGroups).reduce((s, v) => s + v, 0);
                        const opsDuration = opsSerieHrs + opsParallelHrs;
                        const calendarDur = wo.planned_start && wo.planned_end
                          ? Math.max(0, (new Date(wo.planned_end) - new Date(wo.planned_start)) / 3600000) : 0;
                        const plannedDur = opsDuration > 0 ? opsDuration : calendarDur;
                        const actualDur = wo.actual_start && wo.actual_end
                          ? Math.max(0, (new Date(wo.actual_end) - new Date(wo.actual_start)) / 3600000) : 0;
                        const overHH = parseFloat(actualHH) > parseFloat(plannedHH);
                        const overDur = actualDur > plannedDur && plannedDur > 0;
                        const overCost = totalReal > totalPlan && totalPlan > 0;
                        return (
                          <>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-[10px] text-blue-600 font-semibold uppercase mb-1">HH (Plan / Real)</div>
                              <div className="flex items-baseline gap-1.5 text-base font-bold">
                                <span className="text-blue-700">{plannedHH}h</span>
                                <span className="text-gray-300">/</span>
                                <span className={overHH ? 'text-red-600' : 'text-green-700'}>{actualHH}h</span>
                              </div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-3">
                              <div className="text-[10px] text-indigo-600 font-semibold uppercase mb-1">Duración (Plan / Real)</div>
                              <div className="flex items-baseline gap-1.5 text-base font-bold">
                                <span className="text-indigo-700">{plannedDur.toFixed(1)}h</span>
                                <span className="text-gray-300">/</span>
                                <span className={overDur ? 'text-red-600' : 'text-gray-700'}>{actualDur.toFixed(1)}h</span>
                              </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <div className="text-[10px] text-purple-600 font-semibold uppercase mb-1">Costo (Plan / Real)</div>
                              <div className="flex items-baseline gap-1.5 text-base font-bold">
                                <span className="text-purple-700">${totalPlan.toFixed(0)}</span>
                                <span className="text-gray-300">/</span>
                                <span className={overCost ? 'text-red-600' : 'text-amber-700'}>${totalReal.toFixed(0)}</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Status Flow</label>
                      <div className="flex items-center gap-1 text-xs flex-wrap">
                        {ALL.map((st,i) => (
                          <span key={st} className="flex items-center gap-1">
                            <span className={"px-2 py-1 rounded font-semibold "+(wo.status===st?((SAP[st]?.color||"")+" ring-2 ring-offset-1 ring-current"):"bg-gray-100 text-gray-400")}>{SAP[st]?.label}</span>
                            {i<ALL.length-1&&<span className="text-gray-300">\›</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technical Details - C21 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase">Technical Location</div>
                        <div className="text-sm font-mono font-semibold text-gray-800 mt-1 truncate" title={wo.technical_location}>{wo.technical_location || '—'}</div>
                        {/* Jorge 2026-04-23: separar TL y Equipo/TAG */}
                        <div className="text-[10px] text-gray-500 font-semibold uppercase mt-2">Equipo / TAG</div>
                        <div className="text-sm font-mono font-semibold text-gray-800">{wo.equipment_tag || '—'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Planning Group</div>
                        <select value={wo.planning_group || ''}
                          onChange={e => {
                            const v = e.target.value;
                            api.updateManagedWO(wo.wo_id, { planning_group: v, work_center: '' })
                              .then(() => { wo.planning_group = v; wo.work_center = ''; setSelectedOT({...wo}); toast.success('Planning Group actualizado'); })
                              .catch(err => toast.error('Error: ' + (err.message || 'no se pudo actualizar')));
                          }}
                          className="w-full text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer">
                          <option value="">— Seleccionar —</option>
                          {PLANNING_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                          Puesto Trabajo Responsable
                          {/* Jorge 2026-04-23 17:38: locked tras programación (SAP-style) */}
                          {['PROGRAMADO', 'EN_EJECUCION', 'EN_PROGRESO', 'CERRADO', 'CLOSED'].includes(wo.status) && (
                            <span className="ml-1 text-[9px] text-gray-400 normal-case">(bloqueado tras programación)</span>
                          )}
                        </div>
                        <select value={wo.work_center || ''}
                          disabled={!wo.planning_group || ['PROGRAMADO', 'EN_EJECUCION', 'EN_PROGRESO', 'CERRADO', 'CLOSED'].includes(wo.status)}
                          onChange={e => {
                            const v = e.target.value;
                            api.updateManagedWO(wo.wo_id, { work_center: v })
                              .then(() => { wo.work_center = v; setSelectedOT({...wo}); toast.success('Puesto Trabajo Responsable actualizado'); })
                              .catch(err => toast.error('Error: ' + (err.message || 'no se pudo actualizar')));
                          }}
                          className="w-full text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
                          <option value="">{wo.planning_group ? '— Seleccionar —' : 'Selecciona Planning Group primero'}</option>
                          {/* Jorge (2026-04-20): aquí van SUPERVISORES (S-prefix), no mantenedores. */}
                          {(wo.planning_group ? RESPONSIBLE_WORK_CENTERS.filter(w => w.group === wo.planning_group) : []).map(w => <option key={w.value} value={w.value}>{w.value} - {w.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Group C #8 — Contractor crew picker (Jorge 2026-04-21).
                        Opcional: si la OT se tercerea, se asigna a una cuadrilla externa. */}
                    <ContractorCrewPicker wo={wo} onChange={(crewId) => { wo.contractor_crew_id = crewId; setSelectedOT({ ...wo }); }} />

                    {/* C22: Dates - Start/End + Week number */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-[10px] text-blue-600 font-semibold uppercase">Planned Start</div>
                        <input type="date" value={editDates.start ? editDates.start.slice(0, 10) : ''}
                          onChange={e => {
                            const newStart = e.target.value;
                            setEditDates(d => {
                              // Jorge SF-508: al mover start, preservar duración (desplaza end).
                              if (d.start && d.end && newStart) {
                                const oldStart = new Date(d.start.slice(0, 10));
                                const oldEnd = new Date(d.end.slice(0, 10));
                                const durMs = oldEnd - oldStart;
                                if (durMs >= 0) {
                                  const shifted = new Date(new Date(newStart).getTime() + durMs);
                                  return { start: newStart, end: shifted.toISOString().slice(0, 10) };
                                }
                              }
                              return {
                                start: newStart,
                                end: d.end && d.end.slice(0, 10) < newStart ? newStart : d.end,
                              };
                            });
                          }}
                          className="mt-1 text-sm font-semibold text-blue-800 bg-transparent border-none p-0 focus:ring-0 w-full" />
                      </div>
                      <div className={`rounded-lg p-3 border ${editDates.start && editDates.end && editDates.end.slice(0,10) < editDates.start.slice(0,10) ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="text-[10px] text-blue-600 font-semibold uppercase">Planned End</div>
                        <input type="date" value={editDates.end ? editDates.end.slice(0, 10) : ''}
                          min={editDates.start ? editDates.start.slice(0, 10) : undefined}
                          onChange={e => {
                            const newEnd = e.target.value;
                            if (editDates.start && newEnd < editDates.start.slice(0, 10)) {
                              toast.error('Planned End no puede ser anterior a Planned Start');
                              return;
                            }
                            setEditDates(d => ({...d, end: newEnd}));
                          }}
                          className="mt-1 text-sm font-semibold text-blue-800 bg-transparent border-none p-0 focus:ring-0 w-full" />
                      </div>
                      {/* Jorge 2026-04-24 14:18: "Sacar duración del encabezado porque va
                          en el mini-dashboard de arriba. Dejar solo Week/WIC". */}
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="text-[10px] text-indigo-600 font-semibold uppercase">Week (WIC)</div>
                        {editDates.start ? (() => {
                          const d = new Date(editDates.start);
                          const firstJan = new Date(d.getFullYear(), 0, 1);
                          const wic = Math.ceil(((d - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
                          return (
                            <div className="mt-1 text-lg font-bold text-indigo-800 font-mono">
                              W{String(wic).padStart(2, '0')}-{d.getFullYear()}
                            </div>
                          );
                        })() : (
                          <div className="mt-1 text-sm text-indigo-400 italic">Elige Planned Start</div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* OPERACIONES */}
                {otModalTab === 'operaciones' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Operations / Work Steps</h3>
                      <div className="flex items-center gap-2">
                        {/* Jorge (2026-04-20 / QA 2026-04-22): cada paso debe ser
                            una operación propia. Parser robusto que acepta:
                              "1. Paso"   "1) Paso"   "1.- Paso"   "1.Paso" (sin espacio)
                              - Paso      • Paso      * Paso       (viñetas no-numeradas)
                            Si detecta <2 pasos, no hace nada y avisa al usuario. */}
                        {editOps.some(o => /(^|\n)\s*(\d+[\.\)]|\-|•|\*)\s*\S/.test(o.description || '')) && (
                          <button type="button"
                            onClick={() => {
                              // Regex global que captura pasos numerados o viñetas.
                              const STEP_RE = /(^|\n)\s*(?:\d+[\.\)]|\-|•|\*)\s*(.+?)(?=(?:\n\s*(?:\d+[\.\)]|\-|•|\*)\s*)|$)/gs;
                              const next = [];
                              let totalNew = 0;
                              editOps.forEach(op => {
                                const raw = (op.description || '').trim();
                                const matches = Array.from(raw.matchAll(STEP_RE));
                                const steps = matches.map(m => (m[2] || '').trim()).filter(Boolean);
                                if (steps.length < 2) {
                                  next.push(op);
                                } else {
                                  const perStepHours = op.hours ? +(op.hours / steps.length).toFixed(2) : 0;
                                  steps.forEach(s => next.push({ ...op, description: s, hours: perStepHours }));
                                  totalNew += steps.length - 1;   // newly split ops
                                }
                              });
                              if (totalNew === 0) {
                                toast.info('No se detectaron pasos separables. Usá "1. X  2. Y  3. Z" o viñetas.');
                                return;
                              }
                              setEditOps(next);
                              toast.success(`Split en ${next.length} operaciones (+${totalNew})`);
                            }}
                            className="text-xs px-2.5 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                            title="Separar los pasos numerados en operaciones independientes">
                            Split steps
                          </button>
                        )}
                        {/* Repartir HH: toma estimated_hours de la OT y lo distribuye
                            equitativamente entre ops con 0h (o todas si shift-click). */}
                        {editOps.length > 0 && (() => {
                          const zeroOps = editOps.filter(o => (parseFloat(o.hours) || 0) === 0).length;
                          const baseHH = parseFloat(selectedOT?.estimated_hours) || 0;
                          if (baseHH === 0 || zeroOps === 0) return null;
                          return (
                            <button type="button"
                              onClick={() => {
                                const per = baseHH / zeroOps;
                                setEditOps(prev => prev.map(o => (parseFloat(o.hours) || 0) === 0 ? { ...o, hours: Math.round(per * 4) / 4 } : o));
                                toast.success(`Repartidas ${baseHH}h entre ${zeroOps} operaciones (${(baseHH/zeroOps).toFixed(1)}h c/u)`);
                              }}
                              className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                              title={`Repartir ${baseHH}h estimadas entre ${zeroOps} op con 0h`}>
                              Repartir HH
                            </button>
                          );
                        })()}
                        <button type="button" onClick={() => setEditOps(prev => [...prev, { type: 'INT', description: '', specialty: '', quantity: 1, hours: 4 }])}
                          className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">+ Add</button>
                        {/* Jorge SF-559 — toggle vista plana / agrupada por especialidad */}
                        <div className="ml-2 inline-flex items-center gap-0.5 border border-gray-300 rounded-lg overflow-hidden">
                          <button type="button" onClick={() => setOpsViewMode('flat')}
                            className={`text-xs px-2 py-1 ${opsViewMode === 'flat' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            Lista
                          </button>
                          <button type="button" onClick={() => setOpsViewMode('bySpec')}
                            className={`text-xs px-2 py-1 ${opsViewMode === 'bySpec' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            title="Agrupar por especialidad con subtotales HH/duración">
                            Por especialidad
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Subtotales por disciplina — siempre visibles arriba de la lista. SF-559 */}
                    {editOps.length > 0 && (() => {
                      const subtotals = {};
                      editOps.forEach(op => {
                        const spec = (op.specialty || 'Sin especialidad').trim() || 'Sin especialidad';
                        const qty = parseInt(op.quantity) || 1;
                        const hh = (parseFloat(op.hours) || 0) * qty;
                        if (!subtotals[spec]) subtotals[spec] = { hh: 0, count: 0, durSerie: 0, parGroups: {} };
                        subtotals[spec].hh += hh;
                        subtotals[spec].count += 1;
                        if (op.parallel) {
                          const g = op.parallel_group || 'A';
                          subtotals[spec].parGroups[g] = Math.max(subtotals[spec].parGroups[g] || 0, parseFloat(op.hours) || 0);
                        } else {
                          subtotals[spec].durSerie += parseFloat(op.hours) || 0;
                        }
                      });
                      const entries = Object.entries(subtotals).sort((a, b) => b[1].hh - a[1].hh);
                      return (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {entries.map(([spec, s]) => {
                            const dur = s.durSerie + Object.values(s.parGroups).reduce((sum, v) => sum + v, 0);
                            return (
                              <div key={spec} className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                                <span className="font-bold text-blue-700">{spec}</span>
                                <span className="text-gray-500 mx-1">·</span>
                                <span className="text-gray-700">{s.count} ops</span>
                                <span className="text-gray-500 mx-1">·</span>
                                <span className="font-semibold text-gray-800 tabular-nums">{s.hh.toFixed(1)} HH</span>
                                <span className="text-gray-500 mx-1">·</span>
                                <span className="text-gray-600 tabular-nums">{dur.toFixed(1)}h dur</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {editOps.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">No operations</p>
                        <p className="text-xs">Click "+ Add" to create work steps</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editOps.map((op, idx) => {
                          const opSpec = (op.specialty || 'Sin especialidad').trim() || 'Sin especialidad';
                          // SF-559: cuando bySpec, ocultamos op si su grupo está colapsado
                          if (opsViewMode === 'bySpec' && collapsedSpecs[opSpec]) return null;
                          // Insertamos header de sección al inicio de cada grupo de specialty
                          // (la primera vez que aparece en orden de array). El planner aún
                          // puede arrastrar para reordenar — los headers se recalculan.
                          const prevSpec = idx > 0 ? ((editOps[idx - 1].specialty || 'Sin especialidad').trim() || 'Sin especialidad') : null;
                          const isFirstOfGroup = opsViewMode === 'bySpec' && opSpec !== prevSpec;
                          const isExpanded = !!expandedOps[idx];
                          return (
                          <React.Fragment key={idx}>
                          {/* SF-559: header de grupo specialty (clic para colapsar/expandir) */}
                          {isFirstOfGroup && (
                            <div className="flex items-center gap-2 mt-2 pb-1 border-b border-blue-200">
                              <button type="button" onClick={() => setCollapsedSpecs(p => ({ ...p, [opSpec]: !p[opSpec] }))}
                                className="flex items-center gap-1 text-xs font-bold text-blue-700">
                                {collapsedSpecs[opSpec] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {opSpec}
                              </button>
                            </div>
                          )}
                          <div draggable
                            onDragStart={e => { e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={e => {
                              e.preventDefault();
                              const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                              if (isNaN(from) || from === idx) return;
                              const arr = [...editOps];
                              const [moved] = arr.splice(from, 1);
                              arr.splice(idx, 0, moved);
                              setEditOps(arr);
                            }}
                            className={"rounded-lg border "+(op.type === 'EXT' ? "border-purple-200 bg-purple-50/30" : "border-gray-200")+" hover:ring-1 hover:ring-blue-300"}>
                            <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setExpandedOps(prev => ({...prev, [idx]: !prev[idx]}))}>
                              <span className="text-gray-300 cursor-move select-none" title="Arrastrar para reordenar">⋮⋮</span>
                              <span className="text-xs font-bold text-gray-400 w-5">#{idx+1}</span>
                              <span className={"text-xs font-bold px-1.5 py-0.5 rounded "+(op.type === 'EXT' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600")}>{op.type || 'INT'}</span>
                              {op.parallel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300"
                                  title={`Operación en paralelo · grupo ${op.parallel_group || 'A'} · duración = máx del grupo`}>
                                  P·{op.parallel_group || 'A'}
                                </span>
                              )}
                              <span className="flex-1 text-sm font-medium text-gray-800 truncate">{op.description ? op.description.replace(/^\d+[\.\)]\s*/, '').substring(0, 60) + (op.description.length > 60 ? '...' : '') : <span className="text-gray-400 italic">No description</span>}</span>
                              {/* Jorge 2026-04-24 item 28: especialidad editable inline.
                                  David 2026-04-28: cambiado de WORK_CENTERS (códigos SAP) a
                                  disciplinas canónicas que el planner entiende. */}
                              <select value={op.specialty || ''}
                                onClick={e => e.stopPropagation()}
                                onChange={e => { e.stopPropagation(); const n = [...editOps]; n[idx] = {...n[idx], specialty: e.target.value}; setEditOps(n); }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200 hover:bg-blue-100">
                                <option value="">— sin disciplina —</option>
                                {DISCIPLINAS_OP.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                                {op.specialty && !DISCIPLINAS_OP.includes(op.specialty) && (
                                  <option value={op.specialty}>{op.specialty} (legacy)</option>
                                )}
                              </select>
                              <span className="text-[10px] text-gray-500">{op.quantity || 1}p</span>
                              <span className="text-[10px] text-gray-500">{op.hours || 0}h</span>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{((op.quantity || 1) * (op.hours || 0)).toFixed(1)} HH</span>
                              <button type="button" onClick={e => { e.stopPropagation(); setEditOps(prev => prev.filter((_,i) => i !== idx)); }} className="text-red-400 hover:text-red-600 p-1 ml-1"><X size={12} /></button>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 mt-2 mb-2">
                                  <select value={op.type || 'INT'} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], type: e.target.value}; setEditOps(n); if (e.target.value === 'EXT') { setExtModal({ open: true, opIdx: idx, context: 'operation' }); setExtForm({ vendor: '', vendor_other: '', contract_ref: '', purchasing_group: '', service_type: '', specialty: '', personnel_count: '', estimated_hours: '', rate_per_hour: '', estimated_cost: '', currency: 'USD', start_date: '', end_date: '', lead_time_days: '', contact_name: '', contact_phone: '', safety_requirements: '', notes: '' }); } }}
                                    className="text-xs border rounded px-2 py-1 w-16 font-bold">
                                    <option value="INT">INT</option><option value="EXT">EXT</option>
                                  </select>
                                  {op.type === 'EXT' && op.vendor && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{op.vendor}</span>}
                                  {op.type === 'EXT' && <button type="button" onClick={() => { setExtModal({ open: true, opIdx: idx }); setExtForm({ vendor: op.vendor || '', vendor_other: op.vendor_other || '', contract_ref: op.contract_ref || '', purchasing_group: op.purchasing_group || '', service_type: op.service_type || '', specialty: op.specialty || '', personnel_count: op.personnel_count || '', estimated_hours: op.estimated_hours || '', rate_per_hour: op.rate_per_hour || '', estimated_cost: op.estimated_cost || '', currency: op.currency || 'USD', start_date: op.start_date || '', end_date: op.end_date || '', lead_time_days: op.lead_time_days || '', contact_name: op.contact_name || '', contact_phone: op.contact_phone || '', safety_requirements: op.safety_requirements || '', notes: op.notes || '' }); }} className="text-[10px] text-purple-600 underline">Edit vendor</button>}
                                  <textarea value={op.description || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], description: e.target.value}; setEditOps(n); }}
                                    className="flex-1 text-sm border rounded px-2 py-1 min-h-[60px]" placeholder="Describe the action/task" rows={3} />
                                </div>
                                {op.description && /\d+\.\s/.test(op.description) && (
                                  <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                                    {(() => { const steps = []; const raw = op.description; for (let n = 1; n <= 20; n++) { const s = raw.indexOf(`${n}. `); if (s === -1) break; const nx = raw.indexOf(`${n+1}. `, s+1); steps.push({ num: n, text: raw.substring(s, nx > -1 ? nx : undefined).replace(/^\d+\.\s*/, '').trim() }); } return steps.map((s, i) => (<div key={i} className="flex gap-2 text-xs text-gray-700"><span className="font-bold text-emerald-600 min-w-[18px]">{s.num}.</span><span>{s.text}</span></div>)); })()}
                                  </div>
                                )}
                                <div className="hidden">
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Jorge (2026-04-20): especialidad = puesto de trabajo de mantenedor
                                      (WORK_CENTERS filtrados por planning_group, códigos P/M). */}
                                  <div className="flex items-center gap-1">
                                    <label className="text-[10px] text-gray-500">Disciplina:</label>
                                    <select value={op.specialty || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], specialty: e.target.value}; setEditOps(n); }}
                                      className="text-xs border rounded px-2 py-1 max-w-[180px]">
                                      <option value="">— Seleccionar —</option>
                                      {/* David 2026-04-28: disciplinas canónicas que Jorge usa.
                                          Antes mostraba códigos work_center (PASMEC01) que el planner
                                          no entendía y solo aparecía 1 opción si planning_group filtraba. */}
                                      {DISCIPLINAS_OP.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                      ))}
                                      {/* Si la OT ya tiene un valor que NO está en la lista canónica
                                          (legacy), lo mostramos para no perderlo. */}
                                      {op.specialty && !DISCIPLINAS_OP.includes(op.specialty) && (
                                        <option value={op.specialty}>{op.specialty} (legacy)</option>
                                      )}
                                    </select>
                                    {/* Work center especifico (codigo SAP), opcional avanzado */}
                                    <select value={op.work_center || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], work_center: e.target.value}; setEditOps(n); }}
                                      title="Work center SAP especifico (opcional)"
                                      className="text-[10px] border rounded px-1 py-1 max-w-[140px] text-gray-500">
                                      <option value="">WC SAP (opc.)</option>
                                      {(wo.planning_group ? WORK_CENTERS.filter(w => w.group === wo.planning_group) : WORK_CENTERS).map(w => (
                                        <option key={w.value} value={w.value}>{w.value}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Jorge 2026-04-27: agrandar inputs Cantidad/Duración/HH
                                      para que se lean fácil (eran w-12/w-14 text-xs → w-16/w-20 text-sm). */}
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs text-gray-600 font-semibold">Cantidad:</label>
                                    <input type="number" min="1" value={op.quantity || 1} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], quantity: parseInt(e.target.value)||1}; setEditOps(n); }}
                                      className="w-16 text-sm font-semibold border rounded px-2 py-1.5 text-center" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs text-gray-600 font-semibold">Duración (h):</label>
                                    <input type="number" min="0" step="0.5" value={op.hours || 0} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], hours: parseFloat(e.target.value)||0}; setEditOps(n); }}
                                      className="w-20 text-sm font-semibold border rounded px-2 py-1.5 text-center" />
                                  </div>
                                  <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 text-sm font-bold text-emerald-700 whitespace-nowrap">
                                    HH: {((op.quantity || 1) * (op.hours || 0)).toFixed(1)}
                                  </div>
                                  {/* Jorge 2026-04-24 14:18: paralelismo con GRUPOS.
                                      Varias tareas pueden formar el mismo grupo paralelo;
                                      otras pueden formar otro grupo distinto. La duración
                                      total = suma de (max hours por grupo) + suma de ops en serie. */}
                                  <label className="flex items-center gap-1 text-[10px] text-gray-600 cursor-pointer ml-auto">
                                    <input type="checkbox" checked={!!op.parallel}
                                      onChange={e => {
                                        const n = [...editOps];
                                        const isOn = e.target.checked;
                                        n[idx] = { ...n[idx], parallel: isOn, parallel_group: isOn ? (n[idx].parallel_group || 'A') : null };
                                        setEditOps(n);
                                      }}
                                      className="w-3 h-3" />
                                    En paralelo
                                  </label>
                                  {op.parallel && (
                                    <select value={op.parallel_group || 'A'}
                                      onChange={e => { const n = [...editOps]; n[idx] = { ...n[idx], parallel_group: e.target.value }; setEditOps(n); }}
                                      className="text-[10px] border rounded px-1 py-0.5" title="Grupo de paralelismo — tareas en el mismo grupo se ejecutan simultáneamente">
                                      {['A','B','C','D','E'].map(g => <option key={g} value={g}>Grupo {g}</option>)}
                                    </select>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                    {/* Total HH + Duración summary — Jorge 2026-04-20:
                        HH siempre suma (hombre-hora). Duración depende de paralelo/serie:
                        las en serie se suman, las en paralelo se toma la máxima del bloque. */}
                    {editOps.length > 0 && (() => {
                      // Jorge 2026-04-24 14:18: cálculo con grupos paralelos.
                      // Duración = Σ(ops serie) + Σ(max hours de cada grupo paralelo).
                      // HH siempre suma todo (recurso humano).
                      const totalHH = editOps.reduce((s, o) => s + (o.quantity || 1) * (o.hours || 0), 0);
                      const serieHours = editOps.filter(o => !o.parallel).reduce((s, o) => s + (o.hours || 0), 0);
                      // Agrupar paralelos por parallel_group
                      const groups = {};
                      for (const o of editOps.filter(o => o.parallel)) {
                        const g = o.parallel_group || 'A';
                        groups[g] = Math.max(groups[g] || 0, o.hours || 0);
                      }
                      const parallelHours = Object.values(groups).reduce((s, v) => s + v, 0);
                      const totalDuration = serieHours + parallelHours;
                      const parallelCount = editOps.filter(o => o.parallel).length;
                      const groupCount = Object.keys(groups).length;
                      return (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 border flex-wrap gap-2">
                          <span className="text-xs text-gray-500">
                            {editOps.length} operaciones
                            {parallelCount > 0 && ` · ${parallelCount} en paralelo en ${groupCount} grupo${groupCount > 1 ? 's' : ''}`}
                          </span>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-xs text-gray-500">
                              Duración: <strong className="text-gray-800">{totalDuration.toFixed(1)}h</strong>
                              {groupCount > 0 && (
                                <span className="text-[10px] text-gray-400 ml-1">
                                  (serie + {Object.entries(groups).map(([g, h]) => `${g}:max ${h}h`).join(' + ')})
                                </span>
                              )}
                            </span>
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">Total HH: {totalHH.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })()}
                    {/* External Vendor Modal rendered outside tabs */}
                    {false && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setExtModal({ open: false, opIdx: -1 })}>
                        <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                          <div className="p-4 border-b bg-purple-50">
                            <h3 className="font-bold text-purple-800 text-sm">External Service — External Operation</h3>
                            <p className="text-[10px] text-purple-600">Service Entry Sheet (SES) / Purchase Order details</p>
                          </div>
                          <div className="p-4 space-y-3">
                            {/* Vendor */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase">Vendor / Contractor *</label>
                              <select value={extForm.vendor} onChange={e => setExtForm(p => ({...p, vendor: e.target.value}))}
                                className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                <option value="">Select vendor...</option>
                                <option value="MANTTO_EXTERNO">Mantenimiento Externo S.A.</option>
                                <option value="INDUST_SERVICE">Industrial Service SpA</option>
                                <option value="MECANICA_TOTAL">Mecánica Total Ltda</option>
                                <option value="ELECTRO_SERV">Electro Servicios</option>
                                <option value="HIDRAULICA_IND">Hidráulica Industrial</option>
                                <option value="SOLDADURA_ESP">Soldadura Especializada</option>
                                <option value="OTHER">Otro (especificar)</option>
                              </select>
                              {extForm.vendor === 'OTHER' && (
                                <input value={extForm.vendor_other} onChange={e => setExtForm(p => ({...p, vendor_other: e.target.value}))}
                                  placeholder="Nombre del proveedor" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              )}
                            </div>
                            {/* Contract + Purchasing Group */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Contract / PO Ref</label>
                                <input value={extForm.contract_ref} onChange={e => setExtForm(p => ({...p, contract_ref: e.target.value}))}
                                  placeholder="PO-2026-001234" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Purchasing Group</label>
                                <select value={extForm.purchasing_group} onChange={e => setExtForm(p => ({...p, purchasing_group: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                  <option value="">Select...</option>
                                  <option value="001">001 - Mechanical Services</option>
                                  <option value="002">002 - Electrical Services</option>
                                  <option value="003">003 - Civil Works</option>
                                  <option value="004">004 - Instrumentation</option>
                                  <option value="005">005 - Specialized Services</option>
                                </select>
                              </div>
                            </div>
                            {/* Service Type + Specialty */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Service Type *</label>
                                <select value={extForm.service_type} onChange={e => setExtForm(p => ({...p, service_type: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                  <option value="">Select...</option>
                                  <option value="CORRECTIVE">Correctivo</option>
                                  <option value="PREVENTIVE">Preventivo</option>
                                  <option value="PREDICTIVE">Predictivo</option>
                                  <option value="OVERHAUL">Overhaul / Major</option>
                                  <option value="INSPECTION">Inspección</option>
                                  <option value="EMERGENCY">Emergencia</option>
                                  <option value="SHUTDOWN">Parada de Planta</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Specialty *</label>
                                <select value={extForm.specialty} onChange={e => setExtForm(p => ({...p, specialty: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                  <option value="">Select...</option>
                                  <option value="Mechanical">Mecánico</option>
                                  <option value="Electrical">Eléctrico</option>
                                  <option value="Welding">Soldadura</option>
                                  <option value="Instrumentation">Instrumentación</option>
                                  <option value="Hydraulic">Hidráulica</option>
                                  <option value="Scaffolding">Andamios</option>
                                  <option value="Crane">Grúa / Izaje</option>
                                  <option value="Civil">Obras Civiles</option>
                                  <option value="NDT">Ensayos No Destructivos</option>
                                  <option value="Alignment">Alineación / Balanceo</option>
                                  <option value="Other">Otro</option>
                                </select>
                              </div>
                            </div>
                            {/* Personnel + Hours */}
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Personnel #</label>
                                <input type="number" min="1" value={extForm.personnel_count} onChange={e => setExtForm(p => ({...p, personnel_count: e.target.value}))}
                                  placeholder="1" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Est. Hours</label>
                                <input type="number" min="0" step="0.5" value={extForm.estimated_hours} onChange={e => setExtForm(p => ({...p, estimated_hours: e.target.value}))}
                                  placeholder="0" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Rate/Hr ({extForm.currency || 'USD'})</label>
                                <input type="number" min="0" value={extForm.rate_per_hour} onChange={e => setExtForm(p => ({...p, rate_per_hour: e.target.value}))}
                                  placeholder="0.00" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                            </div>
                            {/* Cost + Currency */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Estimated Total Cost</label>
                                <input type="number" min="0" value={extForm.estimated_cost || ((extForm.personnel_count || 1) * (extForm.estimated_hours || 0) * (extForm.rate_per_hour || 0)).toFixed(0)} onChange={e => setExtForm(p => ({...p, estimated_cost: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Currency</label>
                                <select value={extForm.currency || 'USD'} onChange={e => setExtForm(p => ({...p, currency: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                  <option value="USD">USD</option>
                                  <option value="CLP">CLP</option>
                                  <option value="EUR">EUR</option>
                                  <option value="MAD">MAD (Dirham)</option>
                                </select>
                              </div>
                            </div>
                            {/* Dates */}
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Start Date</label>
                                <input type="date" value={extForm.start_date} onChange={e => setExtForm(p => ({...p, start_date: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">End Date</label>
                                <input type="date" value={extForm.end_date} onChange={e => setExtForm(p => ({...p, end_date: e.target.value}))}
                                  className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Lead Time (days)</label>
                                <input type="number" min="0" value={extForm.lead_time_days} onChange={e => setExtForm(p => ({...p, lead_time_days: e.target.value}))}
                                  placeholder="0" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                            </div>
                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Contact Name</label>
                                <input value={extForm.contact_name} onChange={e => setExtForm(p => ({...p, contact_name: e.target.value}))}
                                  placeholder="Responsable del servicio" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Contact Phone</label>
                                <input value={extForm.contact_phone} onChange={e => setExtForm(p => ({...p, contact_phone: e.target.value}))}
                                  placeholder="+56 9 XXXX XXXX" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                              </div>
                            </div>
                            {/* Safety */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase">Safety Requirements / Permits</label>
                              <select value={extForm.safety_requirements} onChange={e => setExtForm(p => ({...p, safety_requirements: e.target.value}))}
                                className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                                <option value="">None</option>
                                <option value="LOTO">LOTO Required</option>
                                <option value="HOT_WORK">Hot Work Permit</option>
                                <option value="CONFINED">Confined Space</option>
                                <option value="HEIGHT">Work at Height</option>
                                <option value="EXCAVATION">Excavation Permit</option>
                                <option value="MULTIPLE">Multiple Permits Required</option>
                              </select>
                            </div>
                            {/* Notes */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-500 uppercase">Notes / Scope of Work</label>
                              <textarea value={extForm.notes} onChange={e => setExtForm(p => ({...p, notes: e.target.value}))}
                                rows={3} placeholder="Detailed scope of work, conditions, exclusions..." className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />
                            </div>
                            {/* Auto-calculated summary */}
                            {(extForm.personnel_count && extForm.estimated_hours && extForm.rate_per_hour) && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs">
                                <span className="font-bold text-purple-800">Cost Summary: </span>
                                <span>{extForm.personnel_count} pers × {extForm.estimated_hours}h × {extForm.currency || 'USD'} {extForm.rate_per_hour}/h = </span>
                                <span className="font-bold text-purple-900">{extForm.currency || 'USD'} {((extForm.personnel_count || 1) * (extForm.estimated_hours || 0) * (extForm.rate_per_hour || 0)).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 border-t flex gap-2 justify-end">
                            <button type="button" onClick={() => setExtModal({ open: false, opIdx: -1 })}
                              className="px-4 py-2 text-xs border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="button" onClick={() => {
                              const vendorName = extForm.vendor === 'OTHER' ? extForm.vendor_other : extForm.vendor;
                              if (extModal.context === 'material') {
                                const n = [...editMats];
                                n[extModal.opIdx] = { ...n[extModal.opIdx], vendor: vendorName, vendor_other: extForm.vendor_other, contract_ref: extForm.contract_ref, lead_time_days: extForm.lead_time_days, notes: extForm.notes };
                                setEditMats(n);
                              } else {
                                const n = [...editOps];
                                n[extModal.opIdx] = { ...n[extModal.opIdx], ...extForm, vendor: vendorName };
                                setEditOps(n);
                              }
                              setExtModal({ open: false, opIdx: -1 });
                            }} className="px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Save External Service</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Save por-tab removido — Jorge 2026-04-20: un solo Save en el header. */}
                  </div>
                )}


                {/* EJECUCION */}
                {otModalTab === 'ejecucion' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2"><ClipboardCheck size={16} /> Registro de Ejecución</h3>
                      <p className="text-xs text-blue-600 mt-1">Complete datos reales. Requerido para cerrar la OT.</p>
                    </div>

                    {/* ── Operations Checklist ── */}
                    {(wo.operations || editOps || []).length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Checklist de Operaciones</label>
                        <div className="space-y-1.5">
                          {(wo.operations || editOps || []).map((op, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border">
                              <input type="checkbox" checked={execData[`op_${idx}_done`] || false}
                                onChange={e => setExecData(prev => ({...prev, [`op_${idx}_done`]: e.target.checked}))}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <span className={"text-xs font-bold px-1.5 py-0.5 rounded "+(op.type === 'EXT' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600")}>{op.type || 'INT'}</span>
                              <span className={"flex-1 text-sm "+(execData[`op_${idx}_done`] ? "line-through text-gray-400" : "text-gray-800")}>{op.description ? (op.description.length > 60 ? op.description.substring(0,60)+'...' : op.description) : `Operación #${idx+1}`}</span>
                              <input type="number" min="0" step="0.5" placeholder="Hrs" value={execData[`op_${idx}_hours`] || ''}
                                onChange={e => setExecData(prev => ({...prev, [`op_${idx}_hours`]: e.target.value}))}
                                className="w-16 border rounded px-2 py-1 text-xs text-center" />
                            </div>
                          ))}
                          <div className="flex justify-between text-xs text-gray-500 px-2 mt-1">
                            <span>{Object.keys(execData).filter(k => k.match(/^op_\d+_done$/) && execData[k]).length}/{(wo.operations || editOps || []).length} completadas</span>
                            <span>Total hrs: {Object.keys(execData).filter(k => k.match(/^op_\d+_hours$/)).reduce((s,k) => s + (parseFloat(execData[k]) || 0), 0).toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Hours: Plan vs Real ── */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Horas Planificadas</label>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">{wo.estimated_hours || '0'}h</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Horas Reales Trabajadas *</label>
                        <input type="number" step="0.5" min="0" value={execData.actual_hours}
                          onChange={e => setExecData(prev => ({...prev, actual_hours: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: 6.5" />
                      </div>
                    </div>
                    {execData.actual_hours && wo.estimated_hours && (() => {
                      const plan = parseFloat(wo.estimated_hours);
                      const real = parseFloat(execData.actual_hours);
                      const delta = real - plan;
                      const pct = plan > 0 ? Math.round((real/plan)*100) : 0;
                      const over = delta > 0;
                      return <div className={"rounded-lg p-3 border "+(over ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{pct}% del estimado</span>
                          <span className={"text-sm font-bold "+(over ? "text-red-600" : "text-green-600")}>{over ? "+" : ""}{delta.toFixed(1)}h {over ? "sobre" : "bajo"} estimado</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className={"h-2 rounded-full "+(over ? "bg-red-500" : "bg-green-500")} style={{width: Math.min(pct, 150)+"%"}} />
                        </div>
                      </div>;
                    })()}

                    {/* ── Time Registration ── */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Inicio Real</label>
                        <input type="datetime-local" value={execData.start_time || ''}
                          onChange={e => setExecData(prev => ({...prev, start_time: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Fin Real</label>
                        <input type="datetime-local" value={execData.end_time || ''}
                          onChange={e => setExecData(prev => ({...prev, end_time: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    {/* ── Downtime ── */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Tiempo de Parada Equipo (hrs)</label>
                        <input type="number" step="0.5" min="0" value={execData.downtime_hours || ''}
                          onChange={e => setExecData(prev => ({...prev, downtime_hours: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Causa de Retraso</label>
                        <select value={execData.delay_cause || ''} onChange={e => setExecData(prev => ({...prev, delay_cause: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                          <option value="">Sin retraso</option>
                          <option value="SPARE_PARTS">Espera de repuestos</option>
                          <option value="EQUIPMENT">Equipo/herramienta no disponible</option>
                          <option value="PERSONNEL">Personal no disponible</option>
                          <option value="ACCESS">Acceso / permisos</option>
                          <option value="WEATHER">Condiciones climáticas</option>
                          <option value="SAFETY">Detención por seguridad</option>
                          <option value="SCOPE_CHANGE">Cambio de alcance</option>
                          <option value="OTHER">Otro</option>
                        </select>
                      </div>
                    </div>

                    {/* ── Materials Used ── */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-2">Materiales Utilizados</label>
                      {(wo.materials || []).length > 0 ? (
                        <div className="space-y-2">
                          {(wo.materials || []).map((mat, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border">
                              <div className="flex-1">
                                <span className="text-xs font-mono text-gray-500">{mat.sapId || mat.sap_id || ''}</span>
                                <span className="text-sm ml-2">{mat.description || mat.name || 'Material'}</span>
                              </div>
                              <div className="text-xs text-gray-500">Plan: {mat.quantity || 0} {mat.unit || 'PZ'}</div>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-400">Real:</label>
                                <input type="number" min="0" defaultValue={mat.quantity_used ?? mat.quantity ?? 0}
                                  className="w-16 border rounded px-2 py-1 text-xs text-center focus:ring-2 focus:ring-blue-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-3">No materials planificados para esta OT</p>
                      )}
                    </div>

                    {/* ── Problems / Findings ── */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Hallazgos / Problemas Encontrados</label>
                      <div className="space-y-2">
                        <select value={execData.finding_type || ''} onChange={e => setExecData(prev => ({...prev, finding_type: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500">
                          <option value="">Sin hallazgos adicionales</option>
                          <option value="ADDITIONAL_DAMAGE">Daño adicional encontrado</option>
                          <option value="SCOPE_INCREASE">Alcance mayor al planificado</option>
                          <option value="ROOT_CAUSE">Causa raíz identificada</option>
                          <option value="SAFETY_ISSUE">Problema de seguridad detectado</option>
                          <option value="RECOMMENDATION">Recomendación para futura intervención</option>
                          <option value="FOLLOWUP_REQUIRED">Requiere seguimiento / nueva OT</option>
                        </select>
                        <textarea rows={3} value={execData.observations}
                          onChange={e => setExecData(prev => ({...prev, observations: e.target.value}))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Describa hallazgos, problemas encontrados, trabajo adicional realizado..." />
                      </div>
                    </div>

                    {/* ── Work Quality ── */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Resultado del Trabajo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[{v:'COMPLETED',l:'Completado',c:'bg-green-100 border-green-300 text-green-800'},{v:'PARTIAL',l:'Parcial',c:'bg-amber-100 border-amber-300 text-amber-800'},{v:'REQUIRES_FOLLOWUP',l:'Requiere Seguimiento',c:'bg-red-100 border-red-300 text-red-800'}].map(opt => (
                          <button key={opt.v} type="button" onClick={() => setExecData(prev => ({...prev, work_result: opt.v}))}
                            className={"py-2 px-3 rounded-lg border text-xs font-semibold transition-all "+(execData.work_result === opt.v ? opt.c + " ring-2 ring-offset-1" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50")}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => verifyAndClose(wo)} disabled={closingWithAI || !execData.actual_hours}
                        className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                        {closingWithAI ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                        {closingWithAI ? 'Verifying...' : 'Verify with AI before Close'}
                      </button>
                      <button onClick={async () => {
                        if (!execData.actual_hours) { toast.error('Record actual hours first'); return; }
                        await api.updateManagedWO(wo.wo_id, {
                          actual_hours: parseFloat(execData.actual_hours) || 0,
                          labor_cost: (parseFloat(execData.actual_hours) || 0) * LABOR_RATE,
                        });
                        toast.success('Execution data saved');
                      }} className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">
                        <Save size={16} />
                      </button>
                    </div>
                    {aiCloseResult && (
                      <div className={"rounded-xl p-4 border-2 "+(aiCloseResult.ready ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                        <div className="flex items-center gap-2 mb-2">
                          {aiCloseResult.ready ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                          <span className={"text-sm font-bold "+(aiCloseResult.ready ? "text-green-800" : "text-amber-800")}>
                            {aiCloseResult.ready ? "WO ready to close" : "Review before closing"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 whitespace-pre-line">{aiCloseResult.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* COSTOS */}
                {otModalTab === 'materiales' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">Materials / Spare Parts</h3>
                      <button type="button" onClick={() => setEditMats(prev => [...prev, { sapId: '', description: '', quantity: 1, unit: 'PZ', type: 'INT' }])}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add</button>
                    </div>
                    {editMats.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm">No materials</p>
                        <p className="text-xs">Click "+ Add" para agregar repuestos</p>
                      </div>
                    ) : (() => {
                      // Split materials by reservation status — reserved items
                      // (carry a reservation_code) are shown first with emerald
                      // background; unreserved go below with a divider.
                      const reservedIdx = [];
                      const pendingIdx = [];
                      editMats.forEach((m, i) => {
                        if (m.reservation_code) reservedIdx.push(i);
                        else pendingIdx.push(i);
                      });
                      const renderRow = (idx) => {
                        const mat = editMats[idx];
                        const isReserved = !!mat.reservation_code;
                        return (
                        <div key={idx} className={`rounded-lg border p-3 ${isReserved ? 'border-emerald-300 bg-emerald-50/60' : 'border-gray-200'}`}>
                          {isReserved && (
                            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Reservado · <span className="font-mono normal-case">{mat.reservation_code}</span>
                            </div>
                          )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="relative">
                                <input value={mat.code || mat.sapId || mat.sap_id || ''}
                                  onFocus={() => {
                                    setActiveMatIdx(idx);
                                    const existing = mat.code || mat.sapId || '';
                                    // Solo sobrescribe la query si hay código; si input está vacío,
                                    // deja el matSearchQuery previo para no cerrar el dropdown.
                                    if (existing) setMatSearchQuery(existing);
                                  }}
                                  onChange={e => { setActiveMatIdx(idx); setMatSearchQuery(e.target.value); const n = [...editMats]; n[idx].code = e.target.value; n[idx].sapId = e.target.value; setEditMats(n); }}
                                  className="w-28 text-xs border rounded px-2 py-1 font-mono" placeholder="Code" />
                                {activeMatIdx === idx && matSearchResults.length > 0 && (
                                  <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {matSearchResults.map((r, ri) => (
                                      <button key={ri} type="button"
                                        onMouseDown={(e) => { e.preventDefault(); selectMaterial(r, idx); }}
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-50 flex items-center gap-2">
                                        <span className="font-mono text-blue-700 font-semibold">{r.sapId}</span>
                                        <span className="text-gray-600 truncate">{r.description}</span>
                                        <span className="ml-auto text-gray-400">{r.unit}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {activeMatIdx === idx && matSearchLoading && <div className="absolute right-1 top-1.5 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                              </div>
                              {/* Jorge (2026-04-20): el texto del material nunca es editable
                                  una vez seleccionado (es la descripción del catálogo). Solo la
                                  cantidad cambia. Se permite tipear sólo si todavía no hay código. */}
                              {(mat.code || mat.sapId || mat.sap_id) ? (
                                <input value={mat.description || ''} readOnly
                                  className="flex-1 text-sm border border-gray-100 bg-gray-50 text-gray-700 rounded px-2 py-1 cursor-not-allowed" />
                              ) : (
                                <input value={mat.description || ''}
                                  onFocus={() => { setActiveMatIdx(idx); if (mat.description) setMatSearchQuery(mat.description); }}
                                  onChange={e => {
                                    const n = [...editMats]; n[idx].description = e.target.value; setEditMats(n);
                                    setActiveMatIdx(idx); setMatSearchQuery(e.target.value);
                                  }}
                                  className="flex-1 text-sm border rounded px-2 py-1" placeholder="Buscar material por nombre o código…" />
                              )}
                              <button onClick={() => setEditMats(prev => prev.filter((_,i) => i !== idx))}
                                className="text-red-400 hover:text-red-600 text-xs px-1">x</button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">Qty:</label>
                                <input type="number" min="1" value={mat.quantity || 1} onChange={e => { const n = [...editMats]; n[idx].quantity = parseInt(e.target.value)||1; setEditMats(n); }}
                                  className="w-14 text-xs border rounded px-1 py-1 text-center" />
                              </div>
                              <input value={mat.unit || 'PZ'} readOnly
                                className="text-xs border border-gray-100 rounded px-2 py-1 w-16 bg-gray-50 text-gray-500 cursor-not-allowed" />
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500">$/u:</label>
                                <input type="number" min="0" step="0.01" value={mat.unit_price || ''} onChange={e => { const n = [...editMats]; n[idx].unit_price = parseFloat(e.target.value) || 0; setEditMats(n); }}
                                  className="w-16 text-xs border rounded px-1 py-1 text-center" placeholder="0" />
                              </div>
                            </div>
                          </div>
                        );
                      };
                      return (
                        <div className="space-y-2">
                          {reservedIdx.length > 0 && (
                            <div className="space-y-2">
                              {reservedIdx.map(i => renderRow(i))}
                            </div>
                          )}
                          {reservedIdx.length > 0 && pendingIdx.length > 0 && (
                            <div className="flex items-center gap-2 my-3">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sin reservar · {pendingIdx.length}</span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                          )}
                          {pendingIdx.length > 0 && (
                            <div className="space-y-2">
                              {pendingIdx.map(i => renderRow(i))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex gap-2 mt-2">
                      {/* Save por-tab removido — Jorge 2026-04-20: un solo Save en el header. */}
                      <button onClick={async () => {
                        const code = 'RES-' + String(Date.now()).slice(-6);
                        const woId = selectedOT?.wo_id;
                        if (!woId) return;
                        // Tag only materials that are NOT yet reserved — those get
                        // stamped with the new code so the UI splits them into the
                        // emerald "reserved" bucket on the next render.
                        const stamped = editMats.map(m => m.reservation_code ? m : { ...m, reservation_code: code });
                        const toReserve = editMats.filter(m => !m.reservation_code).length;
                        if (toReserve === 0) { toast.info('No hay materiales sin reservar'); return; }
                        setEditMats(stamped);
                        // Persist stamped materials + reservation code via saveOTChanges
                        // (uses editMats from state, so wait next tick).
                        await new Promise(r => setTimeout(r, 0));
                        await saveOTChanges();
                        const postRelease = !['CREADO','PENDIENTE'].includes(selectedOT.status) && !!selectedOT.reservation_code;
                        const prev = Array.isArray(selectedOT.reservation_codes) ? selectedOT.reservation_codes : (selectedOT.reservation_code ? [selectedOT.reservation_code] : []);
                        const nextList = postRelease ? [...prev, code] : (prev.length === 0 ? [code] : [...prev.slice(0, -1), code]);
                        try {
                          await api.updateManagedWO(woId, { reservation_code: code, reservation_codes: nextList, materials: stamped });
                          setSelectedOT({ ...selectedOT, reservation_code: code, reservation_codes: nextList, materials: stamped });
                          toast.success(`Reserva ${code}: ${toReserve} material${toReserve > 1 ? 'es' : ''}${postRelease ? ' (segunda reserva)' : ''}`);
                        } catch { toast.success('Reserva: ' + code); }
                      }} disabled={savingOT || editMats.length === 0 || editMats.every(m => !!m.reservation_code)}
                        className="flex-1 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        Create Reservation
                      </button>
                    </div>
                    {/* Historial de reservas — Jorge 2026-04-20 */}
                    {(() => {
                      const list = Array.isArray(selectedOT?.reservation_codes) && selectedOT.reservation_codes.length > 0
                        ? selectedOT.reservation_codes
                        : (selectedOT?.reservation_code ? [selectedOT.reservation_code] : []);
                      if (list.length === 0) return null;
                      return (
                        <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-indigo-600 font-semibold uppercase mb-1">
                            Reservas ({list.length}) {list.length > 1 && '— todas activas en bodega'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {list.map((c, i) => (
                              <span key={i} className="font-mono text-xs font-bold text-indigo-800 bg-white border border-indigo-200 px-1.5 py-0.5 rounded">
                                #{i + 1} {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {otModalTab === 'costos' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800">Cost Control</h3>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-emerald-700 mb-1">Auto-calculated from Operations + Materials</div>
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                          <div className="text-[10px] text-blue-600 font-semibold uppercase">Plan</div>
                          <div className="text-lg font-bold text-blue-800">${totalPlan.toFixed(0)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                          <div className="text-[10px] text-amber-600 font-semibold uppercase">Real</div>
                          <div className="text-lg font-bold text-amber-800">${totalReal.toFixed(0)}</div>
                        </div>
                        <div className={(totalReal - totalPlan) > 0 ? "bg-red-50 rounded-lg p-3 text-center border border-red-200" : "bg-green-50 rounded-lg p-3 text-center border border-green-200"}>
                          <div className="text-[10px] font-semibold uppercase" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>Delta</div>
                          <div className="text-lg font-bold" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>
                            {(totalReal - totalPlan) > 0 ? '+' : ''}{(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      {/* Plan vs Real detail table */}
                      <table className="w-full text-xs mt-3 border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left px-2 py-1.5 font-semibold">Category</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-blue-700">Plan</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-amber-700">Real</th>
                            <th className="text-right px-2 py-1.5 font-semibold">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {costCats.map(ci => {
                            const delta = ci.real - ci.plan;
                            return (
                              <tr key={ci.key} className="border-b">
                                <td className="px-2 py-1.5 font-medium">{ci.label}</td>
                                <td className="px-2 py-1.5 text-right text-blue-700">${ci.plan.toFixed(0)}</td>
                                <td className="px-2 py-1.5 text-right text-amber-700">${ci.real.toFixed(0)}</td>
                                <td className={"px-2 py-1.5 text-right font-bold " + (delta > 0 ? "text-red-600" : "text-green-600")}>
                                  {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-gray-300 font-bold">
                            <td className="px-2 py-1.5">Total</td>
                            <td className="px-2 py-1.5 text-right text-blue-800">${totalPlan.toFixed(0)}</td>
                            <td className="px-2 py-1.5 text-right text-amber-800">${totalReal.toFixed(0)}</td>
                            <td className={"px-2 py-1.5 text-right " + ((totalReal-totalPlan) > 0 ? "text-red-600" : "text-green-600")}>
                              {(totalReal-totalPlan) > 0 ? '+' : ''}{(totalReal-totalPlan).toFixed(0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* NOTIFICACIÓN HH — solo EN_EJECUCION · Jorge SF-515 */}
                {otModalTab === 'notif_hh' && isExec && (
                  <NotifHHTab wo={wo} onSaved={updated => setSelectedOT({ ...wo, ...updated })} />
                )}

                {/* POST-REVIEW — solo CERRADO · Jorge 2026-04-21 RCM feedback */}
                {otModalTab === 'post_review' && isClosed && (
                  <PostReviewTab wo={wo} onSaved={updated => setSelectedOT({ ...wo, post_closure_review: updated })} />
                )}

                {/* HISTORIAL */}
                {otModalTab === 'historial' && (
                  <HistoryTab wo={wo} />
                )}
              </div>

              {/* External Vendor Modal — global, works for operations & materials */}
              {extModal.open && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setExtModal({ open: false, opIdx: -1, context: 'operation' })}>
                  <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b bg-purple-50">
                      <h3 className="font-bold text-purple-800 text-sm">{extModal.context === 'material' ? 'Material Externo — Proveedor' : 'Servicio Externo — SAP PM'}</h3>
                      <p className="text-[10px] text-purple-600">Datos del proveedor / contratista</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Vendor / Contractor *</label>
                        <select value={extForm.vendor} onChange={e => setExtForm(p => ({...p, vendor: e.target.value}))} className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                          <option value="">Seleccionar...</option>
                          <option value="MANTTO_EXTERNO">Mantenimiento Externo S.A.</option>
                          <option value="INDUST_SERVICE">Industrial Service SpA</option>
                          <option value="MECANICA_TOTAL">Mecánica Total Ltda</option>
                          <option value="ELECTRO_SERV">Electro Servicios</option>
                          <option value="HIDRAULICA_IND">Hidráulica Industrial</option>
                          <option value="SOLDADURA_ESP">Soldadura Especializada</option>
                          <option value="OTHER">Otro (especificar)</option>
                        </select>
                        {extForm.vendor === 'OTHER' && <input value={extForm.vendor_other || ''} onChange={e => setExtForm(p => ({...p, vendor_other: e.target.value}))} placeholder="Nombre del proveedor" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" />}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Contract / PO</label><input value={extForm.contract_ref || ''} onChange={e => setExtForm(p => ({...p, contract_ref: e.target.value}))} placeholder="PO-2026-001234" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Purchasing Group</label>
                          <select value={extForm.purchasing_group || ''} onChange={e => setExtForm(p => ({...p, purchasing_group: e.target.value}))} className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                            <option value="">Select...</option><option value="001">001 - Mechanical</option><option value="002">002 - Electrical</option><option value="003">003 - Civil</option><option value="004">004 - Instrumentation</option><option value="005">005 - Specialized</option>
                          </select></div>
                      </div>
                      {extModal.context !== 'material' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Service Type</label>
                            <select value={extForm.service_type || ''} onChange={e => setExtForm(p => ({...p, service_type: e.target.value}))} className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                              <option value="">Select...</option><option value="CORRECTIVE">Correctivo</option><option value="PREVENTIVE">Preventivo</option><option value="OVERHAUL">Overhaul</option><option value="INSPECTION">Inspección</option><option value="EMERGENCY">Emergencia</option><option value="SHUTDOWN">Parada</option>
                            </select></div>
                          <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Specialty</label>
                            <select value={extForm.specialty || ''} onChange={e => setExtForm(p => ({...p, specialty: e.target.value}))} className="w-full text-sm border rounded-lg px-3 py-2 mt-1">
                              <option value="">Select...</option><option value="Mechanical">Mecánico</option><option value="Electrical">Eléctrico</option><option value="Welding">Soldadura</option><option value="Hydraulic">Hidráulica</option><option value="NDT">NDT</option><option value="Crane">Grúa/Izaje</option><option value="Other">Otro</option>
                            </select></div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">{extModal.context === 'material' ? 'Cantidad' : 'Personnel'}</label><input type="number" min="1" value={extForm.personnel_count || ''} onChange={e => setExtForm(p => ({...p, personnel_count: e.target.value}))} placeholder="1" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">{extModal.context === 'material' ? 'Precio Unit.' : 'Rate/Hr'}</label><input type="number" min="0" value={extForm.rate_per_hour || ''} onChange={e => setExtForm(p => ({...p, rate_per_hour: e.target.value}))} placeholder="0.00" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Lead Time (días)</label><input type="number" min="0" value={extForm.lead_time_days || ''} onChange={e => setExtForm(p => ({...p, lead_time_days: e.target.value}))} placeholder="0" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Contacto</label><input value={extForm.contact_name || ''} onChange={e => setExtForm(p => ({...p, contact_name: e.target.value}))} placeholder="Responsable" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                        <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Teléfono</label><input value={extForm.contact_phone || ''} onChange={e => setExtForm(p => ({...p, contact_phone: e.target.value}))} placeholder="+56 9 XXXX" className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                      </div>
                      <div><label className="text-[10px] font-semibold text-gray-500 uppercase">Notas / Alcance</label><textarea value={extForm.notes || ''} onChange={e => setExtForm(p => ({...p, notes: e.target.value}))} rows={2} placeholder="Detalles adicionales..." className="w-full text-sm border rounded-lg px-3 py-2 mt-1" /></div>
                    </div>
                    <div className="p-4 border-t flex gap-2 justify-end">
                      <button type="button" onClick={() => setExtModal({ open: false, opIdx: -1, context: 'operation' })} className="px-4 py-2 text-xs border rounded-lg hover:bg-gray-50">{t('common.cancel') || 'Cancel'}</button>
                      <button type="button" onClick={() => {
                        const vendorName = extForm.vendor === 'OTHER' ? extForm.vendor_other : extForm.vendor;
                        if (extModal.context === 'material') {
                          const n = [...editMats]; n[extModal.opIdx] = { ...n[extModal.opIdx], vendor: vendorName, contract_ref: extForm.contract_ref, lead_time_days: extForm.lead_time_days, notes: extForm.notes, contact_name: extForm.contact_name }; setEditMats(n);
                        } else {
                          const n = [...editOps]; n[extModal.opIdx] = { ...n[extModal.opIdx], ...extForm, vendor: vendorName }; setEditOps(n);
                        }
                        setExtModal({ open: false, opIdx: -1, context: 'operation' });
                      }} className="px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Guardar</button>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div className="border-t px-6 py-3 rounded-b-2xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs flex-wrap">
                  {ALL.map((st,i) => (
                    <span key={st} className="flex items-center gap-0.5">
                      <span className={"px-1.5 py-0.5 rounded font-semibold text-[10px] "+(wo.status===st ? (SAP[st]?.color||"") : "bg-gray-100 text-gray-400")}>{SAP[st]?.label}</span>
                      {i<ALL.length-1&&<span className="text-gray-300 text-[10px]">\›</span>}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {actions.length>0 ? actions.map(([st,lbl,cls]) => (
                    <button key={st} onClick={() => {
                      if (st === 'CERRADO' && !execData.actual_hours && ['EN_EJECUCION','EN_PROGRESO'].includes(wo.status)) {
                        setOtModalTab('ejecucion');
                        toast.error('Record actual hours before closing');
                        return;
                      }
                      changeOTStatus(wo, st);
                    }} disabled={!!otActionLoading} className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors "+cls+(otActionLoading===st?" opacity-60 cursor-wait":"")}>{otActionLoading===st?"...":lbl}</button>
                  )) : (
                    <span className="text-xs text-gray-400 italic">Final status</span>
                  )}
                  {/* Jorge (2026-04-20): botón Close explícito para cerrar la ventana
                      sin confundirlo con la cancelación de la OT (que ya no existe). */}
                  <button
                    onClick={() => setSelectedOT(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DEAD CODE — 'capacity' tab removed (Jorge: "módulo antiguo a eliminar"). Unreachable. Safe to delete in future cleanup. */}
      {false && activeTab === 'capacity' && (
        <CapacityEvaluation />
      )}

      {/* Jorge (2026-04-20): Taskbar de OTs minimizadas — permite tener
          múltiples OTs en paralelo, cada una preserva su estado. */}
      {minimizedOTs.length > 0 && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur border border-gray-200 rounded-full shadow-lg px-2 py-1.5 flex items-center gap-1.5 max-w-[92vw] overflow-x-auto">
          <span className="text-[10px] uppercase text-gray-400 font-semibold px-2 whitespace-nowrap">OTs abiertas:</span>
          {minimizedOTs.map(ot => (
            <div key={ot.wo_id} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => restoreMinimizedOT(ot.wo_id)}
              title={`${ot.wo_number} · ${ot.equipment_tag || ''} · ${ot.status}`}>
              <span className="text-xs font-mono font-bold text-blue-800">{ot.wo_number}</span>
              <span className="text-[10px] text-blue-600 hidden sm:inline">{ot.equipment_tag || '—'}</span>
              <button onClick={e => { e.stopPropagation(); closeMinimizedOT(ot.wo_id); }}
                className="ml-1 text-blue-400 hover:text-red-500 text-xs leading-none"
                title="Descartar cambios y cerrar">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Cancel WO Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Cancel Work Order</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{showCancelModal.woNumber}</p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Cancellation reason *</label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="Explain why this WO is being cancelled..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[80px]" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(null)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                Go Back
              </button>
              <button disabled={!cancelReason.trim()} onClick={async () => {
                const { woId } = showCancelModal;
                try {
                  await api.cancelManagedWO(woId);
                  // Log the reason in history
                  try { await api.updateManagedWO(woId, { cancellation_reason: cancelReason.trim() }); } catch {}
                  toast.success('WO cancelled: ' + showCancelModal.woNumber);
                  setShowCancelModal(null);
                  setCancelReason('');
                  setSelectedOT(null);
                  fetchData();
                } catch (e) { toast.error('Error: ' + (e.message || '')); }
              }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CE2 Tanda C-EXT — Reschedule WO con motivo obligatorio (Jorge 2026-04-28 12:32) */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRescheduleModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">↻</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Reprogramar OT</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{showRescheduleModal.woNumber}</p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
              ⚠️ La OT vuelve a la bandeja del planificador. Quedará registrado el motivo en el audit trail para análisis de adherencia.
            </p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Motivo de reprogramación *</label>
              <textarea value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)}
                placeholder="Ej.: Sacrificada por falla P1 en otra área · Falta repuesto · Equipo no disponible..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 min-h-[80px]" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRescheduleModal(null)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button disabled={!rescheduleReason.trim()} onClick={async () => {
                const { woId } = showRescheduleModal;
                try {
                  await api.rescheduleManagedWO(woId);
                  // Log motivo en notes/audit
                  try { await api.updateManagedWO(woId, { reschedule_reason: rescheduleReason.trim() }); } catch {}
                  toast.success(`OT ${showRescheduleModal.woNumber} reprogramada · vuelve al planificador`);
                  setShowRescheduleModal(null);
                  setRescheduleReason('');
                  setSelectedOT(null);
                  fetchData();
                } catch (e) { toast.error('Error: ' + (e.message || '')); }
              }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Confirmar Reprogramación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OT Created Confirmation Modal */}
      {showOTCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOTCreatedModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Work Order Created</h3>
            <p className="text-sm text-gray-500 mb-1">WO Number:</p>
            <p className="text-lg font-mono font-bold text-emerald-700 mb-6">{showOTCreatedModal.woNumber}</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowOTCreatedModal(null); setSelectedWR(null); }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button onClick={() => { setShowOTCreatedModal(null); setSelectedWR(null); if (showOTCreatedModal.woId) navigate('/work-orders', { state: { openWoId: showOTCreatedModal.woId } }); }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                View WO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}