import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, Calendar } from 'lucide-react';
import { getProgramAdherence } from '../api';
import { subscribe } from '../wsSingleton';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_THRESHOLDS = { green: 90, yellow: 70 };

function getThresholds(plantId) {
  try {
    const s = JSON.parse(
      localStorage.getItem(`ocp_settings_${plantId}`) ||
      localStorage.getItem('ocp_settings') ||
      '{}'
    );
    const t = s.kpiTargets?.programAdherence || {};
    return {
      green: Number(t.green) || DEFAULT_THRESHOLDS.green,
      yellow: Number(t.yellow) || DEFAULT_THRESHOLDS.yellow,
    };
  } catch { return DEFAULT_THRESHOLDS; }
}

function statusFor(pct, thresholds) {
  if (pct == null) return 'warning';
  if (pct >= thresholds.green) return 'good';
  if (pct >= thresholds.yellow) return 'warning';
  return 'critical';
}

export default function ProgramAdherenceCard({ plantId }) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const COLORS = {
    good:     { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',   label: t('kpiCards.labelOnTarget') },
    warning:  { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', label: t('kpiCards.labelWatch') },
    critical: { border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',       label: t('kpiCards.labelAction') },
  };

  const thresholds = useMemo(() => getThresholds(plantId), [plantId]);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true); setError(null);
    try {
      const r = await getProgramAdherence(plantId, period);
      setData(r);
    } catch (e) {
      setError(e?.message || 'Error');
    } finally { setLoading(false); }
  }, [plantId, period]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!plantId) return;
    const unsub = subscribe(plantId, (msg) => {
      const ev = msg?.event || '';
      if (ev.startsWith('wo.') || ev.startsWith('mwo.') || ev.startsWith('managed_work_order.')) load();
    });
    return unsub;
  }, [plantId, load]);

  const pct = data?.adherence_pct;
  const status = statusFor(pct, thresholds);
  const c = COLORS[status];

  const periodLabel = period === 'week'
    ? t('kpiCards.weekRange', { start: data?.start ?? '', end: data?.end ?? '' })
    : t('kpiCards.dayRange', { date: data?.ref_date ?? '' });

  return (
    <>
      <Card
        className={`p-4 border-l-4 ${c.border} ${c.bg} hover:shadow-lg transition-all cursor-pointer`}
        onClick={() => !loading && data?.total_planned > 0 && setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700 font-medium">{t('kpiCards.adherence.title')}</p>
            </div>
            <Badge className={`${c.badge} border-0 text-xs`}>{c.label}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {loading
              ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              : <p className={`text-3xl font-bold ${c.text}`}>{pct == null ? '—' : `${pct}%`}</p>}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{data ? t('kpiCards.adherence.adherentRatio', { adherent: data.adherent, total: data.total_planned }) : '—'}</span>
            <span>{t('kpiCards.adherence.deviatedPending', { deviated: data?.non_adherent ?? 0, pending: data?.not_executed ?? 0 })}</span>
          </div>
          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            {[{v:'week',l:t('kpiCards.week')},{v:'day',l:t('kpiCards.day')}].map(opt => (
              <button key={opt.v} type="button" onClick={() => setPeriod(opt.v)}
                className={`px-2 py-1 text-xs rounded ${period === opt.v ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
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
            <DialogTitle>{t('kpiCards.adherence.dialogTitle', { period: periodLabel })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-500 text-xs">{t('kpiCards.adherence.pctAdherence')}</p>
                <p className={`text-xl font-bold ${c.text}`}>{pct == null ? '—' : `${pct}%`}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-gray-500 text-xs">{t('kpiCards.adherence.onSchedule')}</p>
                <p className="text-xl font-bold text-green-700">{data?.adherent ?? 0}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-gray-500 text-xs">{t('kpiCards.adherence.deviated')}</p>
                <p className="text-xl font-bold text-yellow-700">{data?.non_adherent ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-gray-500 text-xs">{t('kpiCards.adherence.pending')}</p>
                <p className="text-xl font-bold text-gray-700">{data?.not_executed ?? 0}</p>
              </div>
            </div>

            <div className="max-h-96 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('kpiCards.wo')}</TableHead>
                    <TableHead>{t('kpiCards.equipment')}</TableHead>
                    <TableHead>{t('kpiCards.adherence.colPlan')}</TableHead>
                    <TableHead>{t('kpiCards.adherence.colActual')}</TableHead>
                    <TableHead className="text-right">{t('kpiCards.adherence.colDeltaDays')}</TableHead>
                    <TableHead>{t('kpiCards.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items || []).map((it) => {
                    const tag = it.actual_date == null
                      ? { label: t('kpiCards.adherence.tagPending'), cls: 'bg-gray-100 text-gray-600' }
                      : it.is_adherent
                        ? { label: t('kpiCards.adherence.tagAdherent'), cls: 'bg-green-100 text-green-800' }
                        : { label: t('kpiCards.adherence.tagDeviated'), cls: 'bg-yellow-100 text-yellow-800' };
                    return (
                      <TableRow key={it.wo_id}>
                        <TableCell className="font-mono text-xs">{it.wo_number}</TableCell>
                        <TableCell className="text-xs">{it.equipment_tag || '—'}</TableCell>
                        <TableCell className="text-xs">{it.planned_date || '—'}</TableCell>
                        <TableCell className="text-xs">{it.actual_date || '—'}</TableCell>
                        <TableCell className={`text-right text-xs font-semibold ${
                          it.delta_days == null ? '' :
                          it.delta_days === 0 ? 'text-green-700' :
                          'text-yellow-700'
                        }`}>
                          {it.delta_days == null ? '—' : it.delta_days > 0 ? `+${it.delta_days}` : it.delta_days}
                        </TableCell>
                        <TableCell><Badge className={`${tag.cls} border-0 text-xs`}>{tag.label}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  {(!data?.items || data.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">
                        {t('kpiCards.noWorkOrdersInPeriod')}
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
