import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, Activity } from 'lucide-react';
import { getCycleTimes } from '../api';
import { subscribe } from '../wsSingleton';
import { useLanguage } from '../contexts/LanguageContext';

export default function CycleTimesCard({ plantId }) {
  const { t } = useLanguage();
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const STAGES = [
    { key: 'wr_to_wo',        label: t('kpiCards.cycleTimes.stageWrToWo'),         field: 'wr_to_wo_d' },
    { key: 'wo_to_planned',   label: t('kpiCards.cycleTimes.stageWoToPlanned'),    field: 'wo_to_planned_d' },
    { key: 'planned_to_start',label: t('kpiCards.cycleTimes.stagePlannedToStart'), field: 'planned_to_start_d' },
    { key: 'start_to_close',  label: t('kpiCards.cycleTimes.stageStartToClose'),   field: 'start_to_close_d' },
  ];

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
              <p className="text-sm text-gray-700 font-medium">{t('kpiCards.cycleTimes.title')}</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-0 text-xs">
              {outlierCount > 0 ? t('kpiCards.cycleTimes.outliersBadge', { count: outlierCount }) : t('kpiCards.labelOk')}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              : <p className="text-3xl font-bold text-indigo-700">{totalAvg.toFixed(1)}<span className="text-base font-normal ml-1">{t('kpiCards.cycleTimes.totalCycle')}</span></p>}
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
            <span className="ml-auto text-[10px] text-gray-500 self-center">{t('kpiCards.cycleTimes.otsClosed', { count: data?.total_closed ?? 0 })}</span>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('kpiCards.cycleTimes.dialogTitle', { days })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {STAGES.map(st => {
                const s = data?.stages?.[st.key] || {};
                return (
                  <div key={st.key} className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">{st.label}</p>
                    <p className="text-lg font-bold text-gray-900">{s.avg ?? '—'}<span className="text-xs font-normal ml-1">{t('kpiCards.cycleTimes.avgSuffix')}</span></p>
                    <p className="text-[10px] text-gray-500">{t('kpiCards.cycleTimes.avgStats', { median: s.median ?? '—', p90: s.p90 ?? '—', count: s.count ?? 0 })}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">{t('kpiCards.cycleTimes.outliersTitle')}</p>
              <div className="max-h-72 overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('kpiCards.wo')}</TableHead>
                      <TableHead>{t('kpiCards.equipment')}</TableHead>
                      <TableHead>{t('kpiCards.cycleTimes.colType')}</TableHead>
                      <TableHead className="text-right">{t('kpiCards.cycleTimes.colNoticeWo')}</TableHead>
                      <TableHead className="text-right">{t('kpiCards.cycleTimes.colWoPlan')}</TableHead>
                      <TableHead className="text-right">{t('kpiCards.cycleTimes.colPlanStart')}</TableHead>
                      <TableHead className="text-right">{t('kpiCards.cycleTimes.colStartClose')}</TableHead>
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
                      <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">{t('kpiCards.cycleTimes.emptyOutliers')}</TableCell></TableRow>
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
