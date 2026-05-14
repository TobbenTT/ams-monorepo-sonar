import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import * as api from '../api';
import { useToast } from '../components/Toast';

function Pill({ ok, children }) {
  const cls = ok ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300';
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${cls}`}>{children}</span>;
}

export default function PlanificadorAgent() {
  const plantId = useMemo(() => localStorage.getItem('selected_plant') || 'OCP-JFC1', []);
  const [wos, setWos] = useState([]);
  const [woId, setWoId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/v1/managed-work-orders?plant_id=' + plantId + '&limit=50', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('access_token') }
    }).then(r => r.json()).then(d => {
      const arr = d.work_orders || d.items || (Array.isArray(d) ? d : []);
      setWos(arr.filter(w => ['CREADO','PLANIFICADO','EN_PROGRAMACION'].includes(w.status)));
    }).catch(() => {});
  }, [plantId]);

  const run = async () => {
    if (!woId) { toast.error('Elige una OT'); return; }
    setLoading(true); setData(null);
    try {
      setData(await api.planificadorAnalyzeWO(woId, true));
    } catch (e) { toast.error('Error: ' + (e?.message || e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-5 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-7 h-7 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold">Planificador Agent</h1>
          <p className="text-sm text-gray-500">Excel Jorge r30 · Análisis pre-liberación OT (presupuesto + materiales + riesgo + SAP PM)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <select className="flex-1 text-sm px-3 py-2 border rounded" value={woId} onChange={e=>setWoId(e.target.value)}>
            <option value="">— Selecciona OT —</option>
            {wos.map(w => <option key={w.wo_id} value={w.wo_id}>{w.wo_number} · {w.equipment_tag} · {w.status}</option>)}
          </select>
          <button onClick={run} disabled={loading || !woId}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 inline animate-spin mr-1" />Analizando...</> : 'Analizar pre-liberación'}
          </button>
        </div>
      </div>

      {data && !data.error && (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 border-2 ${data.can_release ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
            <div className="flex items-center gap-2 mb-1">
              {data.can_release ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <XCircle className="w-5 h-5 text-rose-700" />}
              <span className={`text-lg font-bold ${data.can_release ? 'text-emerald-800' : 'text-rose-800'}`}>
                {data.can_release ? 'OT lista para liberar' : 'OT NO está lista — bloqueos detectados'}
              </span>
            </div>
            <div className="text-xs text-gray-600">{data.wo_number} · {data.status}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border p-3 text-center">
              <div className="text-xl font-bold text-blue-700">${data.checks.budget.estimated_cost_usd?.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase">Costo estimado</div>
              <div className="text-[10px] mt-1"><Pill ok={data.checks.budget.flag === 'within_budget'}>{data.checks.budget.flag}</Pill></div>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <div className="text-xl font-bold text-amber-700">{data.checks.materials.total}</div>
              <div className="text-[10px] text-gray-500 uppercase">Materiales</div>
              <div className="text-[10px] mt-1"><Pill ok={data.checks.materials.blocking === 0}>{data.checks.materials.blocking} bloqueantes</Pill></div>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <div className="text-xl font-bold text-purple-700">{data.checks.operations.total}</div>
              <div className="text-[10px] text-gray-500 uppercase">Operaciones</div>
              <div className="text-[9px] text-gray-400">{data.checks.operations.specialties.join(', ')}</div>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <div className="text-xl font-bold text-rose-700 uppercase">{data.checks.risk_level}</div>
              <div className="text-[10px] text-gray-500 uppercase">Riesgo</div>
            </div>
          </div>

          {data.checks.materials.details?.length > 0 && (
            <div className="bg-white rounded-xl border p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">Materiales</div>
              <table className="w-full text-xs">
                <thead className="text-gray-500"><tr><th className="text-left">Código</th><th className="text-left">Descripción</th><th className="text-right">Req</th><th className="text-right">Stock</th><th>Status</th></tr></thead>
                <tbody>
                  {data.checks.materials.details.map((m,i) => (
                    <tr key={i} className="border-t border-gray-100"><td className="font-mono">{m.code}</td><td className="text-gray-700 truncate max-w-xs">{m.description}</td><td className="text-right">{m.required}</td><td className="text-right">{m.available}</td><td><Pill ok={m.ok}>{m.ok?'OK':'FALTA'}</Pill></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.ai_recommendation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <div className="text-xs font-bold text-purple-800 mb-1">🤖 Recomendación IA (Claude)</div>
              <pre className="text-[11px] whitespace-pre-wrap text-gray-800">{data.ai_recommendation}</pre>
            </div>
          )}
        </div>
      )}

      {data?.error && <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded">{data.error}</div>}
    </div>
  );
}
