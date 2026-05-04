import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, Target } from 'lucide-react';
import { getProgramCompliance } from '../api';
import { subscribe } from '../wsSingleton';

const DEFAULT_THRESHOLDS = { green: 95, yellow: 80 };

function getThresholds(plantId) {
  try {
    const s = JSON.parse(
      localStorage.getItem(`ocp_settings_${plantId}`) ||
      localStorage.getItem('ocp_settings') ||
      '{}'
    );
    const t = s.kpiTargets?.programCompliance || {};
    return {
      green: Number(t.green) || DEFAULT_THRESHOLDS.green,
      yellow: Number(t.yellow) || DEFAULT_THRESHOLDS.yellow,
    };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

function statusFor(pct, thresholds) {
  if (pct == null) return 'warning';
  if (pct >= thresholds.green) return 'good';
  if (pct >= thresholds.yellow) return 'warning';
  return 'critical';
}

const COLORS = {
  good:     { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',   label: 'En meta' },
  warning:  { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', label: 'Vigilar' },
  critical: { border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',       label: 'Acción' },
};

export default function ProgramComplianceCard({ plantId }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const thresholds = useMemo(() => getThresholds(plantId), [plantId]);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getProgramCompliance(plantId, period);
      setData(r);
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [plantId, period]);

  useEffect(() => { load(); }, [load]);

  // SF-574 #4 — refresh en tiempo real cuando hay cambios en WOs.
  useEffect(() => {
    if (!plantId) return;
    const unsub = subscribe(plantId, (msg) => {
      const ev = msg?.event || '';
      if (ev.startsWith('wo.') || ev.startsWith('mwo.') || ev.startsWith('managed_work_order.')) {
        load();
      }
    });
    return unsub;
  }, [plantId, load]);

  const pct = data?.compliance_pct;
  const status = statusFor(pct, thresholds);
  const c = COLORS[status];

  const periodLabel = period === 'week'
    ? `Semana ${data?.start ?? ''} → ${data?.end ?? ''}`
    : `Día ${data?.ref_date ?? ''}`;

  return (
    <>
      <Card
        className={`p-4 border-l-4 ${c.border} ${c.bg} hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => !loading && data?.total_wo > 0 && setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Target className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700 font-medium">Cumplimiento de Programa</p>
            </div>
            <Badge className={`${c.badge} border-0 text-xs`}>{c.label}</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <p className={`text-3xl font-bold ${c.text}`}>
                {pct == null ? '—' : `${pct}%`}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {data ? `${data.total_actual_h}h / ${data.total_planned_h}h` : '—'}
            </span>
            <span>{data?.total_wo ?? 0} OT</span>
          </div>

          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            {[
              { v: 'week', l: 'Semana' },
              { v: 'day',  l: 'Día' },
            ].map(opt => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setPeriod(opt.v)}
                className={`px-2 py-1 text-xs rounded ${period === opt.v
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {opt.l}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-gray-500 self-center">{periodLabel}</span>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Cumplimiento de Programa — {periodLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">% Cumplimiento</p>
                <p className={`text-xl font-bold ${c.text}`}>{pct == null ? '—' : `${pct}%`}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">HH ejecutadas / planificadas</p>
                <p className="text-xl font-bold text-gray-900">
                  {data?.total_actual_h ?? '—'}h / {data?.total_planned_h ?? '—'}h
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">OTs en período</p>
                <p className="text-xl font-bold text-gray-900">{data?.total_wo ?? 0}</p>
              </div>
            </div>

            <div className="max-h-96 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OT</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">HH plan</TableHead>
                    <TableHead className="text-right">HH real</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items || []).map((it) => {
                    const itemPct = it.planned_h > 0
                      ? Math.round((it.actual_h / it.planned_h) * 100)
                      : null;
                    const itemStatus = statusFor(itemPct, thresholds);
                    return (
                      <TableRow key={it.wo_id}>
                        <TableCell className="font-mono text-xs">{it.wo_number}</TableCell>
                        <TableCell className="text-xs">{it.equipment_tag || '—'}</TableCell>
                        <TableCell className="text-xs">{it.status}</TableCell>
                        <TableCell className="text-right text-xs">{it.planned_h}</TableCell>
                        <TableCell className="text-right text-xs">{it.actual_h}</TableCell>
                        <TableCell className={`text-right text-xs font-semibold ${COLORS[itemStatus].text}`}>
                          {itemPct == null ? '—' : `${itemPct}%`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!data?.items || data.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">
                        Sin OTs planificadas en el período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
