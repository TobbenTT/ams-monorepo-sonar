import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, Activity } from 'lucide-react';
import { getCycleTimes } from '../api';
import { subscribe } from '../wsSingleton';

const STAGES = [
  { key: 'wr_to_wo',        label: 'Aviso → OT',          field: 'wr_to_wo_d' },
  { key: 'wo_to_planned',   label: 'OT → Planificada',    field: 'wo_to_planned_d' },
  { key: 'planned_to_start',label: 'Planif → Inicio',     field: 'planned_to_start_d' },
  { key: 'start_to_close',  label: 'Inicio → Cierre',     field: 'start_to_close_d' },
];

export default function CycleTimesCard({ plantId }) {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    try { setData(await getCycleTimes(plantId, days)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [plantId, days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!plantId) return;
    const unsub = subscribe(plantId, (msg) => {
      const ev = msg?.event || '';
      if (ev.startsWith('wo.') || ev.startsWith('mwo.')) load();
    });
    return unsub;
  }, [plantId, load]);

  const totalAvg = STAGES.reduce((s, st) => s + (data?.stages?.[st.key]?.avg || 0), 0);
  const outlierCount = data?.outliers?.length ?? 0;

  return (
    <>
      <Card
        className="p-4 border-l-4 border-indigo-500 bg-indigo-50 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => !loading && data?.total_closed > 0 && setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Activity className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700 font-medium">Tiempos de ciclo</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-0 text-xs">
              {outlierCount > 0 ? `${outlierCount} outliers` : 'OK'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              : <p className="text-3xl font-bold text-indigo-700">{totalAvg.toFixed(1)}<span className="text-base font-normal ml-1">d ciclo total</span></p>}
          </div>
          <div className="space-y-1 text-xs">
            {STAGES.map(st => {
              const s = data?.stages?.[st.key];
              return (
                <div key={st.key} className="flex justify-between">
                  <span className="text-gray-600">{st.label}</span>
                  <span className="font-medium text-gray-800">{s?.avg != null ? `${s.avg}d` : '—'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            {[30, 90, 180].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-2 py-1 text-xs rounded ${days === d ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {d}d
              </button>
            ))}
            <span className="ml-auto text-[10px] text-gray-500 self-center">{data?.total_closed ?? 0} OT cerradas</span>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tiempos de ciclo — últimos {days} días</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {STAGES.map(st => {
                const s = data?.stages?.[st.key] || {};
                return (
                  <div key={st.key} className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">{st.label}</p>
                    <p className="text-lg font-bold text-gray-900">{s.avg ?? '—'}<span className="text-xs font-normal ml-1">d avg</span></p>
                    <p className="text-[10px] text-gray-500">med {s.median ?? '—'} · p90 {s.p90 ?? '—'} · n {s.count ?? 0}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">Outliers (etapa &gt; 2σ del promedio)</p>
              <div className="max-h-72 overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OT</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Aviso→OT</TableHead>
                      <TableHead className="text-right">OT→Plan</TableHead>
                      <TableHead className="text-right">Plan→Inicio</TableHead>
                      <TableHead className="text-right">Inicio→Close</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.outliers || []).map(it => (
                      <TableRow key={it.wo_id}>
                        <TableCell className="font-mono text-xs">{it.wo_number}</TableCell>
                        <TableCell className="text-xs">{it.equipment_tag || '—'}</TableCell>
                        <TableCell className="text-xs">{it.wo_type || '—'}</TableCell>
                        <TableCell className="text-right text-xs">{it.wr_to_wo_d ?? '—'}</TableCell>
                        <TableCell className="text-right text-xs">{it.wo_to_planned_d ?? '—'}</TableCell>
                        <TableCell className="text-right text-xs">{it.planned_to_start_d ?? '—'}</TableCell>
                        <TableCell className="text-right text-xs">{it.start_to_close_d ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {(!data?.outliers || data.outliers.length === 0) && (
                      <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">Sin outliers — proceso estable.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
