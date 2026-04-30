// SF-568 — Smart Assignment IA modal: lista top-10 técnicos rankeados por
// (specialty + skills + shift + HH disponibles). Reusable desde cualquier vista
// que necesite asignar técnicos a una OT/operación.
import { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { rankTechniciansForOperation } from '../api';

export default function SmartAssignModal({
  open,
  onClose,
  plantId,
  specialty,           // op specialty (string)
  shift = 'day',       // 'day' | 'night'
  plannedHours = 1,
  excludeWorkerIds = [],
  woDescription = '',  // optional WO description for richer Claude context
  equipmentTag = '',
  onSelect,            // (worker) => void; called when user picks a candidate
}) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setAiRecommendation(null);
    rankTechniciansForOperation({
      plant_id: plantId,
      specialty,
      shift,
      planned_hours: plannedHours,
      exclude_worker_ids: excludeWorkerIds,
      wo_description: woDescription,
      equipment_tag: equipmentTag,
    })
      .then(res => {
        setCandidates(res?.candidates || []);
        setAiRecommendation(res?.ai_recommendation || null);
      })
      .catch(e => setError(e.message || 'Error al rankear'))
      .finally(() => setLoading(false));
  }, [open, plantId, specialty, shift, plannedHours]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-gradient-to-r from-purple-50 to-purple-100">
          <Sparkles className="w-5 h-5 text-purple-700" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Smart Assignment IA</h3>
            <p className="text-xs text-gray-600">
              Top candidatos para <strong>{specialty || '—'}</strong> · turno {shift} · {plannedHours}h
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/60"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-center text-sm text-muted-foreground py-8">Calculando ranking…</p>}
          {error && <p className="text-center text-sm text-red-600 py-8">{error}</p>}
          {!loading && !error && candidates.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Sin candidatos disponibles para este perfil.</p>
          )}
          {!loading && aiRecommendation && (
            <div className="mb-4 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-purple-900 mb-1">
                    Recomendación Claude:{' '}
                    <span className="text-fuchsia-700">
                      {(candidates.find(c => c.worker_id === aiRecommendation.recommended_worker_id) || {}).name || '—'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-snug">{aiRecommendation.reasoning}</p>
                  {(aiRecommendation.warnings || []).length > 0 && (
                    <ul className="mt-1.5 text-[10px] text-amber-700 list-disc pl-4 space-y-0.5">
                      {aiRecommendation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
          {!loading && candidates.length > 0 && (
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left font-semibold">Técnico</th>
                  <th className="px-2 py-1.5 text-left font-semibold">Spec</th>
                  <th className="px-2 py-1.5 text-left font-semibold">Skills</th>
                  <th className="px-2 py-1.5 text-left font-semibold">Turno</th>
                  <th className="px-2 py-1.5 text-right font-semibold">HH</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Score</th>
                  <th className="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => {
                  const scoreColor = c.score >= 80 ? 'text-emerald-600' : c.score >= 50 ? 'text-amber-600' : 'text-gray-500';
                  const isAiPick = aiRecommendation?.recommended_worker_id === c.worker_id;
                  return (
                    <tr key={c.worker_id} className={`border-b border-border ${isAiPick ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-muted/30'}`}>
                      <td className="px-2 py-1.5 font-medium">
                        {c.name || c.worker_id}
                        {isAiPick && <span className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded bg-purple-600 text-white">🤖 IA</span>}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{c.specialty || '—'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[140px]" title={(c.skills || []).join(', ')}>
                        {(c.skills || []).slice(0, 3).join(', ') || '—'}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{c.shift || '—'}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{(c.hh_available || 0).toFixed(1)}</td>
                      <td className={`px-2 py-1.5 text-right font-bold ${scoreColor}`}>
                        {c.score.toFixed(0)}
                        <span className="text-[9px] block font-normal text-muted-foreground" title={JSON.stringify(c.breakdown)}>
                          {Object.keys(c.breakdown || {}).length} criterios
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => { onSelect && onSelect(c); onClose(); }}
                          className="text-[10px] px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Asignar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          Score: specialty match (+40), skill match (+30), shift match (+20), HH disp. (hasta +10), absence/overload (penalty).
        </div>
      </div>
    </div>
  );
}
