import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader2, AlertTriangle, Inbox, ClipboardCheck } from 'lucide-react';
import { getBacklogAlerts } from '../api';
import { subscribe } from '../wsSingleton';
import { useLanguage } from '../contexts/LanguageContext';
import { formatWRCode } from '../utils/wrCode';

const DEFAULT_THRESHOLDS = { yellow: 5, red: 15 };

function getThresholds(plantId, key) {
  try {
    const s = JSON.parse(
      localStorage.getItem(`ocp_settings_${plantId}`) ||
      localStorage.getItem('ocp_settings') ||
      '{}'
    );
    const t = s.kpiTargets?.[key] || {};
    return {
      yellow: Number(t.yellow) || DEFAULT_THRESHOLDS.yellow,
      red: Number(t.red) || DEFAULT_THRESHOLDS.red,
    };
  } catch { return DEFAULT_THRESHOLDS; }
}

function statusFor(count, t) {
  if (count >= t.red) return 'critical';
  if (count >= t.yellow) return 'warning';
  return 'good';
}

function CountCard({ title, count, status, icon: Icon, onClick, hint, loading, COLORS }) {
  const c = COLORS[status];
  return (
    <Card
      className={`p-4 border-l-4 ${c.border} ${c.bg} hover:shadow-lg transition-all cursor-pointer`}
      onClick={() => !loading && count > 0 && onClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && count > 0) { e.preventDefault(); onClick(); } }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {Icon && <Icon className="w-4 h-4 text-gray-600" />}
            <p className="text-sm text-gray-700 font-medium">{title}</p>
          </div>
          <Badge className={`${c.badge} border-0 text-xs`}>{c.label}</Badge>
        </div>
        <div className="flex items-baseline gap-2">
          {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                   : <p className={`text-3xl font-bold ${c.text}`}>{count}</p>}
        </div>
        <p className="text-xs text-gray-600">{hint}</p>
      </div>
    </Card>
  );
}

export default function BacklogAlertsCards({ plantId }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // 'wr' | 'wo' | null

  const COLORS = {
    good:     { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',   label: t('kpiCards.labelOk') },
    warning:  { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', label: t('kpiCards.labelWatch') },
    critical: { border: 'border-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',       label: t('kpiCards.labelAction') },
  };

  const tWr = useMemo(() => getThresholds(plantId, 'delayedNotifications'), [plantId]);
  const tWo = useMemo(() => getThresholds(plantId, 'pendingClose'), [plantId]);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    try {
      const r = await getBacklogAlerts(plantId);
      setData(r);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [plantId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!plantId) return;
    const unsub = subscribe(plantId, (msg) => {
      const ev = msg?.event || '';
      if (ev.startsWith('wr.') || ev.startsWith('wo.') || ev.startsWith('mwo.')) load();
    });
    return unsub;
  }, [plantId, load]);

  const wrCount = data?.delayed_notifications?.count ?? 0;
  const woCount = data?.pending_close?.count ?? 0;

  return (
    <>
      <CountCard
        title={t('kpiCards.backlog.delayedNotices')}
        icon={AlertTriangle}
        count={wrCount}
        loading={loading}
        status={statusFor(wrCount, tWr)}
        hint={t('kpiCards.backlog.hintDelayedNotices')}
        onClick={() => setOpen('wr')}
        COLORS={COLORS}
      />
      <CountCard
        title={t('kpiCards.backlog.lateWorkOrders')}
        icon={ClipboardCheck}
        count={woCount}
        loading={loading}
        status={statusFor(woCount, tWo)}
        hint={t('kpiCards.backlog.hintLateWorkOrders')}
        onClick={() => setOpen('wo')}
        COLORS={COLORS}
      />

      <Dialog open={open === 'wr'} onOpenChange={(v) => setOpen(v ? 'wr' : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5" /> {t('kpiCards.backlog.dialogDelayedNotices')}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[28rem] overflow-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('kpiCards.backlog.colNotice')}</TableHead>
                  <TableHead>{t('kpiCards.equipment')}</TableHead>
                  <TableHead>{t('kpiCards.priority')}</TableHead>
                  <TableHead>{t('kpiCards.status')}</TableHead>
                  <TableHead className="text-right">{t('kpiCards.backlog.colAge')}</TableHead>
                  <TableHead className="text-right">{t('kpiCards.backlog.colSlaOverdue')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.delayed_notifications?.items || []).map((it) => (
                  <TableRow key={it.request_id}>
                    <TableCell className="font-mono text-xs">{formatWRCode(it)}</TableCell>
                    <TableCell className="text-xs">{it.equipment_tag}</TableCell>
                    <TableCell><Badge className="bg-gray-100 text-gray-800 border-0 text-xs">{it.priority}</Badge></TableCell>
                    <TableCell className="text-xs">{it.status}</TableCell>
                    <TableCell className="text-right text-xs">{it.age_hours}h</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-red-700">+{it.overdue_hours}h</TableCell>
                  </TableRow>
                ))}
                {wrCount === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">{t('kpiCards.backlog.emptyNoSla')}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'wo'} onOpenChange={(v) => setOpen(v ? 'wo' : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" /> {t('kpiCards.backlog.dialogLateWorkOrders')}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[28rem] overflow-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('kpiCards.wo')}</TableHead>
                  <TableHead>{t('kpiCards.equipment')}</TableHead>
                  <TableHead>{t('kpiCards.priority')}</TableHead>
                  <TableHead>{t('kpiCards.status')}</TableHead>
                  <TableHead>{t('kpiCards.backlog.colActualEnd')}</TableHead>
                  <TableHead className="text-right">{t('kpiCards.backlog.colPending')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.pending_close?.items || []).map((it) => (
                  <TableRow key={it.wo_id}>
                    <TableCell className="font-mono text-xs">{it.wo_number}</TableCell>
                    <TableCell className="text-xs">{it.equipment_tag}</TableCell>
                    <TableCell><Badge className="bg-gray-100 text-gray-800 border-0 text-xs">{it.priority}</Badge></TableCell>
                    <TableCell className="text-xs">{it.status}</TableCell>
                    <TableCell className="text-xs">{it.actual_end?.slice(0,16) ?? '—'}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-red-700">{it.hours_since_end}h</TableCell>
                  </TableRow>
                ))}
                {woCount === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">{t('kpiCards.backlog.emptyNoPendingClose')}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
