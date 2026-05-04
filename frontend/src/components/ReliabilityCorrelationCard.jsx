import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, ShieldAlert } from 'lucide-react';
import { getReliabilityCorrelation } from '../api';
import { subscribe } from '../wsSingleton';

export default function ReliabilityCorrelationCard({ plantId }) {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    try { setData(await getReliabilityCorrelation(plantId, days, 10)); }
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

  const correlated = (data?.items || []).filter(it => it.high_correlation).length;
  const top3 = (data?.items || []).slice(0, 3);

  return (
    <>
      <Card
        className={`p-4 border-l-4 ${correlated > 0 ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'} hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => !loading && data?.total_equipment > 0 && setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <ShieldAlert className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700 font-medium">Confiabilidad por Activo</p>
            </div>
            <Badge className={`${correlated > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} border-0 text-xs`}>
              {correlated > 0 ? `${correlated} crítico${correlated === 1 ? '' : 's'}` : 'OK'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              : <p className="text-3xl font-bold text-gray-900">{data?.total_equipment ?? 0}<span className="text-sm font-normal ml-1">activos con fallas</span></p>}
          </div>
          <div className="space-y-1 text-xs">
            {top3.map(it => (
              <div key={it.equipment_tag} className="flex justify-between">
                <span className={`truncate mr-2 ${it.high_correlation ? 'font-semibold text-red-700' : 'text-gray-700'}`}>{it.equipment_tag}</span>
                <span className="text-gray-600 whitespace-nowrap">{it.failure_count}f · {it.availability_pct}%</span>
              </div>
            ))}
            {top3.length === 0 && <p className="text-gray-500">Sin fallas registradas</p>}
          </div>
          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            {[30, 90, 180].map(d => (
              <button key={d} type="button" onClick={() => setDays(d)}
                className={`px-2 py-1 text-xs rounded ${days === d ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {d}d
              </button>
            ))}
            <span className="ml-auto text-[10px] text-gray-500 self-center">avg disp {data?.avg_availability_pct ?? '—'}%</span>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confiabilidad por Activo — últimos {days} días</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">Activos con fallas</p>
                <p className="text-xl font-bold text-gray-900">{data?.total_equipment ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">Avg disponibilidad</p>
                <p className="text-xl font-bold text-gray-900">{data?.avg_availability_pct ?? '—'}%</p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <p className="text-gray-500 text-xs">Alta correlación IA</p>
                <p className="text-xl font-bold text-red-700">{correlated}</p>
              </div>
            </div>
            <div className="max-h-96 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-right">Fallas</TableHead>
                    <TableHead className="text-right">Downtime (h)</TableHead>
                    <TableHead className="text-right">MTBF (d)</TableHead>
                    <TableHead className="text-right">MTTR (h)</TableHead>
                    <TableHead className="text-right">Disp. (%)</TableHead>
                    <TableHead>IA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items || []).map(it => (
                    <TableRow key={it.equipment_tag} className={it.high_correlation ? 'bg-red-50/50' : ''}>
                      <TableCell className="text-xs font-medium">{it.equipment_tag}</TableCell>
                      <TableCell className="text-right text-xs">{it.failure_count}</TableCell>
                      <TableCell className="text-right text-xs">{it.downtime_h}</TableCell>
                      <TableCell className="text-right text-xs">{it.mtbf_days}</TableCell>
                      <TableCell className="text-right text-xs">{it.mttr_hours ?? '—'}</TableCell>
                      <TableCell className={`text-right text-xs font-semibold ${
                        it.availability_pct >= 90 ? 'text-green-700' :
                        it.availability_pct >= 70 ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>{it.availability_pct}%</TableCell>
                      <TableCell>
                        {it.high_correlation
                          ? <Badge className="bg-red-100 text-red-800 border-0 text-xs">Crítico</Badge>
                          : <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">—</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.items || data.items.length === 0) && (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">Sin fallas registradas en el período.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-gray-500">
              <strong>Correlación IA:</strong> activo flageado cuando failure_count &gt; promedio + 1σ <em>y</em> availability &lt; promedio − 1σ.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
