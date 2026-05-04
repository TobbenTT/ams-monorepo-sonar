import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, Users } from 'lucide-react';
import { getSkillsGaps } from '../api';
import { subscribe } from '../wsSingleton';

export default function SkillsGapsCard({ plantId }) {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    try { setData(await getSkillsGaps(plantId, days)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [plantId, days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!plantId) return;
    const unsub = subscribe(plantId, (msg) => {
      const ev = msg?.event || '';
      if (ev.startsWith('wo.') || ev.startsWith('mwo.') || ev.startsWith('workforce.')) load();
    });
    return unsub;
  }, [plantId, load]);

  const gaps = data?.gaps || [];
  const negativeGaps = gaps.filter(g => g.gap > 0);
  const totalGap = negativeGaps.reduce((s, g) => s + g.gap, 0);
  const status = negativeGaps.length === 0 ? 'good'
    : negativeGaps.length <= 2 ? 'warning'
    : 'critical';

  const COLORS = {
    good:     { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',   label: 'Cobertura OK' },
    warning:  { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', label: 'Vigilar' },
    critical: { border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',       label: 'Brecha alta' },
  };
  const c = COLORS[status];
  const top3 = gaps.slice(0, 3);

  return (
    <>
      <Card
        className={`p-4 border-l-4 ${c.border} ${c.bg} hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => !loading && gaps.length > 0 && setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700 font-medium">Brechas de Skills</p>
            </div>
            <Badge className={`${c.badge} border-0 text-xs`}>{c.label}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              : <p className={`text-3xl font-bold ${c.text}`}>{negativeGaps.length}<span className="text-sm font-normal ml-1">especialidades cortas</span></p>}
          </div>
          <div className="space-y-1 text-xs">
            {top3.map(g => (
              <div key={g.specialty} className="flex justify-between">
                <span className="truncate mr-2 text-gray-700">{g.specialty}</span>
                <span className={`whitespace-nowrap ${g.gap > 0 ? 'font-semibold text-red-700' : 'text-gray-600'}`}>
                  {g.demand_op_count} dem · {g.supply_count} ppl {g.gap > 0 ? `(−${g.gap})` : '✓'}
                </span>
              </div>
            ))}
            {top3.length === 0 && <p className="text-gray-500">Sin demanda registrada</p>}
          </div>
          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            {[30, 90, 180].map(d => (
              <button key={d} type="button" onClick={() => setDays(d)}
                className={`px-2 py-1 text-xs rounded ${days === d ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {d}d
              </button>
            ))}
            <span className="ml-auto text-[10px] text-gray-500 self-center">déficit total: {totalGap}</span>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Brechas de Skills — últimos {days} días</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">Especialidades demandadas</p>
                <p className="text-xl font-bold text-gray-900">{gaps.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <p className="text-gray-500 text-xs">Con brecha (déficit)</p>
                <p className="text-xl font-bold text-red-700">{negativeGaps.length}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">Déficit total (ppl)</p>
                <p className="text-xl font-bold text-gray-900">{totalGap}</p>
              </div>
            </div>
            <div className="max-h-96 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Especialidad</TableHead>
                    <TableHead className="text-right">Demanda (ops)</TableHead>
                    <TableHead className="text-right">Disponibles</TableHead>
                    <TableHead className="text-right">Brecha</TableHead>
                    <TableHead>Acción sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gaps.map(g => (
                    <TableRow key={g.specialty} className={g.gap > 0 ? 'bg-red-50/40' : ''}>
                      <TableCell className="text-xs font-medium">{g.specialty}</TableCell>
                      <TableCell className="text-right text-xs">{g.demand_op_count}</TableCell>
                      <TableCell className="text-right text-xs">{g.supply_count}</TableCell>
                      <TableCell className={`text-right text-xs font-semibold ${g.gap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {g.gap > 0 ? `−${g.gap}` : '✓'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {g.gap > 0 ? 'Capacitar / contratar / outsource' : 'Sin acción'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {gaps.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-500 py-6">Sin demanda en el período.</TableCell></TableRow>
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
