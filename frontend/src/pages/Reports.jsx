import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';

const REPORT_TEMPLATES = [
    { id: 1, titleKey: "reports.weeklyMaintReport", typeKey: "reports.operational", frequencyKey: "reports.weekly", icon: "\u{1F4CB}", lastGen: "27 Feb 2026", statusKey: "reports.generated" },
    { id: 2, titleKey: "reports.backlogAnalysis", typeKey: "reports.analytical", frequencyKey: "reports.biweekly", icon: "\u{1F4CA}", lastGen: "20 Feb 2026", statusKey: "reports.generated" },
    { id: 3, titleKey: "reports.execKpiDashboard", typeKey: "reports.executive", frequencyKey: "reports.monthly", icon: "\u{1F3AF}", lastGen: "01 Feb 2026", statusKey: "reports.pending" },
    { id: 4, titleKey: "reports.reliabilityReport", typeKey: "reports.technical", frequencyKey: "reports.monthly", icon: "\u{2699}\u{FE0F}", lastGen: "01 Feb 2026", statusKey: "reports.generated" },
    { id: 5, titleKey: "reports.sapOrderClose", typeKey: "reports.sap", frequencyKey: "reports.weekly", icon: "\u{1F517}", lastGen: "27 Feb 2026", statusKey: "reports.generated" },
    { id: 6, titleKey: "reports.fmeaReview", typeKey: "reports.technical", frequencyKey: "reports.quarterly", icon: "\u{1F52C}", lastGen: "15 Jan 2026", statusKey: "reports.inProcess" },
];

// DATA_EXPORTS is computed inside the component from live state

function templateStatusStyle(statusKey) {
    if (statusKey === 'reports.generated') return 'bg-green-100 text-green-800 border border-green-200';
    if (statusKey === 'reports.pending') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (statusKey === 'reports.inProcess') return 'bg-blue-100 text-blue-800 border border-blue-200';
    return 'bg-muted text-muted-foreground border border-border';
}

function WeeklySummarySection({ scheduleWeeks, workRequests, backlogItems }) {
    const { t } = useLanguage();
    const week = (scheduleWeeks || [])[0];
    if (!week) return (
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-5">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('reports.previewWeeklySummary')}</div>
            <p className="text-sm text-muted-foreground py-10 text-center">No data</p>
        </div>
    );
    const wos = week.work_orders || week.work_packages || [];
    const woTotal = wos.length;
    const woCompleted = wos.filter(w => w.status === 'COMPLETED' || w.status === 'DONE').length;
    const adherence = week.adherence ?? week.adherence_pct ?? (woTotal > 0 ? Math.round((woCompleted / woTotal) * 100) : 0);
    const weekLabel = week.week ?? (week.week_number ? `S${week.week_number}` : 'N/A');
    const weekRange = week.start && week.end ? `${week.start} al ${week.end}` : (week.year ? `${week.year}` : '');
    const openWR = (workRequests || []).filter(w => w.status === 'PENDING_VALIDATION' || w.status === 'DRAFT').length;
    const backlogCount = (backlogItems || []).length;

    const adherenceOk = adherence >= 90;
    const completionRate = woTotal > 0 ? Math.round((woCompleted / woTotal) * 100) : 0;
    const completionOk = completionRate >= 80;
    const wrOk = openWR <= 3;
    const backlogOk = backlogCount <= 8;

    const metrics = [
        { label: t('reports.planAdherence'), value: `${adherence}%`, sub: `${t('reports.week')} ${weekLabel}`, ok: adherenceOk, icon: "\u{1F4C5}" },
        { label: t('reports.woCompleted'), value: `${woCompleted}/${woTotal}`, sub: `${completionRate}% ${t('reports.completed')}`, ok: completionOk, icon: "\u{2705}" },
        { label: t('reports.pendingWR'), value: openWR, sub: t('reports.unvalidated'), ok: wrOk, icon: "\u{1F4CB}" },
        { label: t('reports.totalBacklog'), value: backlogCount, sub: t('reports.activeItems'), ok: backlogOk, icon: "\u{1F4E6}" },
    ];

    const p1Count = (workRequests || []).filter(w => w.priority_suggested === 'P1').length;
    const criticalEquipment = (workRequests || []).filter(w => w.production_impact === 'CRITICAL' || w.production_impact === 'HIGH').length;

    return (
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.previewWeeklySummary')}</div>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-mono">{weekLabel}{weekRange ? ` · ${weekRange}` : ''}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {metrics.map((m, i) => (
                    <div key={i} className={`rounded-lg p-3 border ${m.ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="text-xl mb-1">{m.icon}</div>
                        <div className={`text-2xl font-extrabold ${m.ok ? 'text-green-700' : 'text-amber-700'}`}>{m.value}</div>
                        <div className="text-xs font-semibold text-foreground mt-0.5">{m.label}</div>
                        <div className="text-[0.7rem] text-muted-foreground">{m.sub}</div>
                    </div>
                ))}
            </div>
            <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('reports.autoExecSummary')}</div>
                <p className="text-sm text-foreground leading-relaxed">
                    {t('reports.summaryDuring')} <strong>{weekLabel}</strong>, {t('reports.summaryAdherence')} <strong>{adherence}%</strong>{adherenceOk ? t('reports.summaryAboveGoal') : t('reports.summaryBelowGoal')}.
                    {' '}{t('reports.summaryCompleted')} <strong>{woCompleted} de {woTotal}</strong> {t('reports.summaryPlannedWO')} ({completionRate}% {t('reports.summaryCompletionRate')}).
                    {' '}<strong>{openWR} {t('reports.summaryPendingWR')}</strong> {t('reports.summaryAwaitingValidation')} <strong>{p1Count}</strong> {t('reports.summaryP1Priority')}.
                    {' '}{t('reports.summaryActiveBacklog')} <strong>{backlogCount} {t('reports.summaryItems')}</strong>, <strong>{criticalEquipment}</strong> {t('reports.summaryHighImpact')}.
                    {adherenceOk && completionOk
                        ? ` ${t('reports.summaryGoodPerformance')}`
                        : ` ${t('reports.summaryReviewDeviation')}`}
                </p>
            </div>
        </div>
    );
}

export default function Reports() {
    const { plant } = useOutletContext();
    const toast = useToast();
    const { t } = useLanguage();
    const [reports, setReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('monthly');
    const [generating, setGenerating] = useState(false);
    const [preview, setPreview] = useState(null);

    // ── Live data state (replaces empty constants) ──
    const [workRequests, setWorkRequests] = useState([]);
    const [backlogItems, setBacklogItems] = useState([]);
    const [reliabilityKpis, setReliabilityKpis] = useState([]);
    const [kpiHistory, setKpiHistory] = useState([]);
    const [scheduleWeeks, setScheduleWeeks] = useState([]);
    const [sapUploads, setSapUploads] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.listReports({ plant_id: plant }),
            api.listNotifications({ plant_id: plant }),
            api.listWorkRequests({ plant_id: plant }),
            api.listBacklog({ plant_id: plant }),
            api.getAnalyticsPageData(plant),
            api.listPrograms({ plant_id: plant }),
            api.listSapUploads({ plant_id: plant }),
        ]).then(([r, n, wr, bl, analytics, progs, sap]) => {
            setReports(r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : []) : []);
            setNotifications(n.status === 'fulfilled' ? (Array.isArray(n.value) ? n.value : []) : []);
            setWorkRequests(wr.status === 'fulfilled' ? (Array.isArray(wr.value) ? wr.value : []) : []);
            setBacklogItems(bl.status === 'fulfilled' ? (Array.isArray(bl.value) ? bl.value : bl.value?.items || []) : []);
            if (analytics.status === 'fulfilled' && analytics.value) {
                setReliabilityKpis(analytics.value.reliability_kpis || []);
                setKpiHistory(analytics.value.kpi_history || []);
            }
            setScheduleWeeks(progs.status === 'fulfilled' ? (Array.isArray(progs.value) ? progs.value : []) : []);
            setSapUploads(sap.status === 'fulfilled' ? (Array.isArray(sap.value) ? sap.value : []) : []);
            setLoading(false);
        });
    }, [plant]);

    const DATA_EXPORTS = useMemo(() => [
        { titleKey: "reports.workRequests", descKey: "reports.allWoAndRequests", count: workRequests.length, format: "XLSX / CSV", icon: "\u{1F4DD}", exportType: "report" },
        { titleKey: "reports.backlogItems", descKey: "reports.currentBacklogWithReasons", count: backlogItems.length, format: "XLSX / CSV", icon: "\u{1F4E6}", exportType: "report" },
        { titleKey: "reports.reliabilityKpis", descKey: "reports.mtbfMttrAvailability", count: reliabilityKpis.length, format: "XLSX / PDF", icon: "\u{1F4C8}", exportType: "kpis" },
        { titleKey: "reports.sapOrders", descKey: "reports.confirmedClosedSapOrders", count: sapUploads.length, format: "XLSX / SAP", icon: "\u{1F517}", exportType: "report" },
    ], [workRequests.length, backlogItems.length, reliabilityKpis.length, sapUploads.length]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            if (reportType === 'operational') {
                const dbReport = await api.generateReportFromDB({ report_type: 'operational' });
                setPreview(dbReport);
                toast.success('Operational report generated from DB');
                const updated = await api.listReports({ plant_id: plant });
                setReports(Array.isArray(updated) ? updated : []);
                setGenerating(false);
                return;
            }
            const gen = reportType === 'monthly' ? api.generateMonthlyReport : api.generateWeeklyReport;
            const now2 = new Date();
            const startOfYear = new Date(now2.getFullYear(), 0, 1);
            const currentWeek = Math.ceil(((now2 - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            const res = await gen({ plant_id: plant, month: now2.getMonth() + 1, week: currentWeek, week_number: currentWeek, year: now2.getFullYear() });
            setPreview(res);
            toast.success(`${reportType} report generated`);
            const updated = await api.listReports({ plant_id: plant });
            setReports(Array.isArray(updated) ? updated : []);
        } catch (e) {
            toast.error('Report generation failed: ' + e.message);
        }
        setGenerating(false);
    };

    const handleExport = async (format) => {
        const validFormat = (format || 'xlsx').toUpperCase() === 'CSV' ? 'CSV' : 'EXCEL';
        try {
            // If preview is a DB-generated report, export its data directly
            if (preview?.detail_work_requests || preview?.detail_work_orders) {
                const sheets = [
                    {
                        name: 'Summary',
                        headers: ['Metric', 'Value'],
                        rows: preview.summary ? Object.entries(preview.summary).map(([k, v]) => [k.replace(/_/g, ' '), String(v)]) : [],
                    },
                    {
                        name: 'Work Requests',
                        headers: ['ID', 'Equipment', 'Status', 'Priority', 'Description', 'Created'],
                        rows: (preview.detail_work_requests || []).map(wr => [wr.request_id, wr.equipment_tag, wr.status, wr.priority, wr.failure_description, wr.created_at]),
                    },
                    {
                        name: 'Work Orders',
                        headers: ['WO Number', 'Equipment', 'Status', 'Type', 'Planned Start', 'Created'],
                        rows: (preview.detail_work_orders || []).map(wo => [wo.wo_number, wo.equipment_tag, wo.status, wo.wo_type, wo.planned_start, wo.created_at]),
                    },
                ];
                if (preview.work_requests?.by_status) {
                    sheets.push({ name: 'WR by Status', headers: ['Status', 'Count'], rows: Object.entries(preview.work_requests.by_status) });
                }
                if (preview.work_orders?.by_status) {
                    sheets.push({ name: 'WO by Status', headers: ['Status', 'Count'], rows: Object.entries(preview.work_orders.by_status) });
                }
                if (preview.backlog?.by_priority) {
                    sheets.push({ name: 'Backlog by Priority', headers: ['Priority', 'Count'], rows: Object.entries(preview.backlog.by_priority) });
                }
                const name = `report_${(preview.report_type || 'operational').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
                downloadExport({ format: validFormat, sheets }, name);
                toast.success(t('reports.exportDownloaded', { format: validFormat }) || 'Export downloaded');
                return;
            }
            const week = scheduleWeeks[0] || { week: 'N/A', start: '', end: '', adherence: 0, planned_hours: 0, executed_hours: 0, work_orders: [] };
            const wos = week.work_orders || week.work_packages || [];
            const adh = week.adherence ?? week.adherence_pct ?? 0;
            const sheets = [
                {
                    name: 'Weekly Summary',
                    headers: ['Metric', 'Value', 'Target', 'Status'],
                    rows: [
                        ['Plan Adherence', `${adh}%`, '≥90%', adh >= 90 ? 'OK' : 'Below Target'],
                        ['WO Completed', `${wos.filter(w => w.status === 'COMPLETED').length}/${wos.length}`, '≥80%', 'OK'],
                        ['Avisos Pendings', String(workRequests.filter(w => w.status === 'PENDING_VALIDATION' || w.status === 'DRAFT').length), '≤3', ''],
                        ['Total Backlog', String(backlogItems.length), '≤8', ''],
                        ['Planned Hours', `${week.planned_hours ?? 0}h`, '', ''],
                        ['Executed Hours', `${week.executed_hours ?? 0}h`, '', ''],
                    ],
                },
                {
                    name: 'Work Orders',
                    headers: ['WO ID', 'Equipment', 'Type', 'Description', 'Planned H.', 'Actual H.', 'Status', 'Priority', 'Technicians'],
                    rows: wos.map(wo => [wo.id || wo.work_package_id, wo.equipment || wo.equipment_tag, wo.type || wo.wo_type, wo.description || '', `${wo.duration_planned ?? wo.estimated_hours ?? 0}h`, `${wo.duration_actual ?? 0}h`, wo.status, wo.priority, (wo.technicians || []).join(', ')]),
                },
                {
                    name: 'Avisos',
                    headers: ['ID', 'Equipment', 'Failure Description', 'Failure Mode', 'Priority', 'Status', 'Plant', 'Area', 'Technician', 'Est. Duration', 'AI Confidence'],
                    rows: workRequests.map(wr => [wr.id || wr.request_id, wr.equipment_tag, wr.failure_description || '', wr.failure_mode || '', wr.priority_suggested || wr.priority || '', wr.status, wr.plant || wr.plant_id || '', wr.area || '', wr.technician || wr.created_by || '', `${wr.estimated_duration ?? ''}h`, `${wr.ai_confidence ?? ''}%`]),
                },
                {
                    name: 'Backlog',
                    headers: ['ID', 'Aviso ID', 'Equipment', 'Reason', 'Age (days)', 'Est. Hours', 'Plant', 'Priority', 'Group ID'],
                    rows: backlogItems.map(bl => [bl.id || bl.backlog_id, bl.wr_id || bl.work_request_id || '—', bl.equipment_tag, bl.reason, String(bl.age_days ?? ''), String(bl.estimated_hours ?? ''), bl.plant || bl.plant_id || '', bl.priority, bl.group_id || '—']),
                },
            ];
            const name = `report_${(preview?.report_type || reportType).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
            downloadExport({ format: validFormat, sheets }, name);
            toast.success(t('reports.exportDownloaded', { format: validFormat }));
        } catch (e) {
            toast.error(`${t('reports.exportFailed')}: ${e.message}`);
        }
    };

    const handleAckNotification = async (id) => {
        try {
            await api.acknowledgeNotification(id);
            setNotifications(prev => prev.filter(n => n.notification_id !== id));
            toast.success('Notification acknowledged');
        } catch (e) {
            toast.error('Failed to acknowledge: ' + e.message);
        }
    };

    const handleDataExport = async (exp) => {
        try {
            const exportTitle = t(exp.titleKey);
            let sheets = [];
            if (exp.titleKey === 'reports.workRequests') {
                sheets = [{
                    name: 'Avisos',
                    headers: ['ID', 'Equipment', 'Name', 'Failure Description', 'Failure Mode', 'Priority Requested', 'Priority Suggested', 'Status', 'Plant', 'Area', 'Technician', 'Est. Duration (h)', 'AI Confidence (%)', 'Production Impact', 'Created'],
                    rows: workRequests.map(wr => [wr.id || wr.request_id, wr.equipment_tag, wr.equipment_name || '', wr.failure_description || '', wr.failure_mode || '', wr.priority_requested || '', wr.priority_suggested || wr.priority || '', wr.status, wr.plant || wr.plant_id || '', wr.area || '', wr.technician || wr.created_by || '', wr.estimated_duration ?? '', wr.ai_confidence ?? '', wr.production_impact || '', wr.created_at || '']),
                }];
            } else if (exp.titleKey === 'reports.backlogItems') {
                sheets = [{
                    name: 'Backlog Items',
                    headers: ['ID', 'Aviso ID', 'Equipment', 'Reason', 'Age (days)', 'Est. Hours', 'Plant', 'Priority', 'Groupable', 'Group ID'],
                    rows: backlogItems.map(bl => [bl.id || bl.backlog_id, bl.wr_id || bl.work_request_id || '—', bl.equipment_tag, bl.reason, bl.age_days ?? '', bl.estimated_hours ?? '', bl.plant || bl.plant_id || '', bl.priority, bl.groupable ? 'Yes' : 'No', bl.group_id || '—']),
                }];
            } else if (exp.titleKey === 'reports.reliabilityKpis') {
                sheets = [
                    {
                        name: 'Reliability KPIs',
                        headers: ['Equipment', 'Name', 'MTBF (h)', 'MTTR (h)', 'Availability (%)', 'OEE (%)', 'Trend'],
                        rows: reliabilityKpis.map(r => [r.equipment_tag, r.equipment_name, r.mtbf, r.mttr, r.availability, r.oee, r.trend]),
                    },
                    {
                        name: 'KPI History',
                        headers: ['Month', 'Schedule Adherence (%)', 'Planning Time Avg (min)', 'OEE Avg (%)'],
                        rows: kpiHistory.map(k => [k.month, k.schedule_adherence, k.planning_time_avg, k.oee_avg]),
                    },
                ];
            } else if (exp.titleKey === 'reports.sapOrders') {
                sheets = [{
                    name: 'SAP Uploads',
                    headers: ['Upload ID', 'Plant', 'Status', 'Records', 'Created'],
                    rows: sapUploads.map(s => [s.upload_id || s.id, s.plant_id || s.plant, s.status, s.record_count ?? '', s.created_at || '']),
                }];
            }
            const name = `${exportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
            downloadExport({ format: 'EXCEL', sheets }, name);
            toast.success(`${exportTitle} ${t('reports.downloaded')}`);
        } catch (e) {
            toast.error(`${t('reports.exportFailed')}: ${e.message}`);
        }
    };

    if (loading) return <LoadingSpinner message={t('reports.loading') || 'Loading reports...'} />;

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">{"\u{1F4C4}"} {t('reports.title')}</h1>

            {/* Report Template Cards */}
            <div className="mb-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('reports.reportTemplates')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {REPORT_TEMPLATES.map(tpl => (
                        <div key={tpl.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-2 hover:border-primary/40 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{tpl.icon}</span>
                                    <div>
                                        <div className="font-semibold text-sm text-foreground leading-tight">{t(tpl.titleKey)}</div>
                                        <div className="text-[0.7rem] text-muted-foreground">{t(tpl.typeKey)} · {t(tpl.frequencyKey)}</div>
                                    </div>
                                </div>
                                <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${templateStatusStyle(tpl.statusKey)}`}>{t(tpl.statusKey)}</span>
                            </div>
                            <div className="text-[0.7rem] text-muted-foreground">{t('reports.lastGeneration')}: {tpl.lastGen}</div>
                            <div className="flex gap-1.5 mt-auto pt-1">
                                <button className="flex-1 px-2 py-1 text-[0.68rem] font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1" onClick={async () => { try { setGenerating(true); const res = await api.generateReportFromDB({ report_type: t(tpl.titleKey) }); setPreview(res); toast.success(t(tpl.titleKey)); } catch(e) { setPreview({ report_type: t(tpl.titleKey), plant_id: plant, sections: { type: t(tpl.typeKey), frequency: t(tpl.frequencyKey) } }); } finally { setGenerating(false); } }}>
                                    {"\u{1F441}"} {t('reports.view')}
                                </button>
                                <button className="flex-1 px-2 py-1 text-[0.68rem] font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1" onClick={() => handleExport('xlsx')}>
                                    {"\u{2B07}"} {t('reports.download')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Summary Preview */}
            <WeeklySummarySection scheduleWeeks={scheduleWeeks} workRequests={workRequests} backlogItems={backlogItems} />

            {/* Data Export Panel */}
            <div className="mb-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('reports.dataExport')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {DATA_EXPORTS.map((exp, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-2">
                            <div className="text-2xl">{exp.icon}</div>
                            <div className="font-semibold text-sm text-foreground">{t(exp.titleKey)}</div>
                            <div className="text-[0.7rem] text-muted-foreground leading-snug">{t(exp.descKey)}</div>
                            <div className="flex items-center justify-between text-[0.7rem] mt-1">
                                <span className="bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">{exp.count} {t('reports.records')}</span>
                                <span className="text-muted-foreground">{exp.format}</span>
                            </div>
                            <button
                                className="mt-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                                onClick={() => handleDataExport(exp)}
                            >
                                {t('reports.exportBtn')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Existing: Generate Report Bar */}
            <div className="bg-card border border-border rounded-lg shadow-sm mb-5 px-5 py-3">
                <div className="flex items-center gap-4 flex-wrap">
                    <select className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-[200px]" value={reportType} onChange={e => setReportType(e.target.value)} aria-label="Report type">
                        <option value="weekly">{t('reports.weeklyKpiReport')}</option>
                        <option value="monthly">{t('reports.monthlyKpiReport')}</option>
                        <option value="operational">{t('reports.operational') || 'Operational Report'}</option>
                    </select>
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('reports.plant')}: {plant}</span>
                    <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">{t('reports.period')}: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <div className="flex-1" />
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleGenerate} disabled={generating}>{generating ? `\u{23F3} ${t('reports.generating')}` : `\u{1F4CA} ${t('reports.generateReport')}`}</button>
                </div>
            </div>

            {/* Existing: Preview + Recent Reports + Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{t('reports.reportPreview')}</div>
                        {preview ? (
                            <div>
                                <h3 className="text-base font-bold mb-3">
                                    {preview.report_type || reportType} {t('reports.report')} — {preview.plant_id || plant}
                                </h3>

                                {/* Metadata */}
                                {preview.metadata && (
                                    <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-border">
                                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('reports.metadata')}</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {preview.metadata.report_type && <div><span className="text-muted-foreground">{t('reports.metadataType')}:</span> <span className="font-medium">{preview.metadata.report_type}</span></div>}
                                            {preview.metadata.plant_id && <div><span className="text-muted-foreground">{t('reports.metadataPlant')}:</span> <span className="font-medium">{preview.metadata.plant_id}</span></div>}
                                            {preview.metadata.generated_at && <div><span className="text-muted-foreground">{t('reports.metadataGenerated')}:</span> <span className="font-medium">{new Date(preview.metadata.generated_at).toLocaleString('es-ES')}</span></div>}
                                            {preview.metadata.period_start && <div><span className="text-muted-foreground">{t('reports.metadataPeriod')}:</span> <span className="font-medium">{preview.metadata.period_start} — {preview.metadata.period_end}</span></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Sections — handle both array and dict */}
                                {preview.sections && (Array.isArray(preview.sections) ? (
                                    preview.sections.map((section, i) => (
                                        <div key={i} className="mb-4 p-3 bg-card border border-border rounded-lg">
                                            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{section.title || `${t('reports.section')} ${i + 1}`}</div>
                                            {section.content && <p className="text-sm text-foreground mb-2">{section.content}</p>}
                                            {section.metrics && Object.keys(section.metrics).length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                                    {Object.entries(section.metrics).map(([mk, mv]) => (
                                                        <div key={mk} className="bg-muted/40 rounded-md p-2 text-center">
                                                            <div className="text-lg font-bold text-foreground">{typeof mv === 'object' ? mv.value ?? JSON.stringify(mv) : String(mv)}</div>
                                                            <div className="text-[0.68rem] text-muted-foreground">{mk.replace(/_/g, ' ')}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {section.tables && section.tables.length > 0 && section.tables.map((tbl, ti) => (
                                                <div key={ti} className="overflow-x-auto mt-2">
                                                    <table className="w-full text-sm border-collapse">
                                                        {tbl.headers && <thead><tr>{tbl.headers.map((h, hi) => <th key={hi} className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">{h}</th>)}</tr></thead>}
                                                        {tbl.rows && <tbody>{tbl.rows.map((row, ri) => <tr key={ri}>{(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => <td key={ci} className="px-2 py-1 border-b border-border/50">{String(cell ?? '')}</td>)}</tr>)}</tbody>}
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : typeof preview.sections === 'object' && (
                                    Object.entries(preview.sections).map(([k, v]) => (
                                        <div key={k} className="mb-3">
                                            <div className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{k.replace(/_/g, ' ')}</div>
                                            <div className="text-sm text-foreground">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</div>
                                        </div>
                                    ))
                                ))}

                                {/* KPI summaries */}
                                {(preview.planning_kpi_summary || preview.de_kpi_summary || preview.reliability_kpi_summary) && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t('reports.kpiSummary')}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {preview.planning_kpi_summary && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="text-xs font-bold text-blue-700 mb-1">{t('reports.planningKpis')}</div>
                                                    {Object.entries(preview.planning_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm"><span className="text-blue-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                            {preview.de_kpi_summary && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <div className="text-xs font-bold text-amber-700 mb-1">{t('reports.deKpis')}</div>
                                                    {Object.entries(preview.de_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm"><span className="text-amber-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                            {preview.reliability_kpi_summary && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="text-xs font-bold text-green-700 mb-1">{t('reports.reliabilityKpisLabel')}</div>
                                                    {Object.entries(preview.reliability_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm"><span className="text-green-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Traffic lights */}
                                {preview.traffic_lights && Object.keys(preview.traffic_lights).length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t('reports.trafficLight')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(preview.traffic_lights).map(([k, v]) => (
                                                <span key={k} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${v === 'GREEN' ? 'bg-green-100 text-green-700' : v === 'YELLOW' ? 'bg-amber-100 text-amber-700' : v === 'RED' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                                                    {v === 'GREEN' ? '\u{1F7E2}' : v === 'YELLOW' ? '\u{1F7E1}' : v === 'RED' ? '\u{1F534}' : '\u{26AA}'} {k.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DB-generated summary (SF-57) */}
                                {preview.summary && (
                                    <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-border">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Summary</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {Object.entries(preview.summary).map(([k, v]) => (
                                                <div key={k} className="bg-card rounded-md p-2 text-center border border-border">
                                                    <div className="text-lg font-bold text-foreground">{String(v)}{k.includes('pct') ? '%' : ''}</div>
                                                    <div className="text-[0.68rem] text-muted-foreground">{k.replace(/_/g, ' ')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {preview.work_requests?.by_status && Object.keys(preview.work_requests.by_status).length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="text-xs font-bold text-blue-700 mb-2">Work Requests by Status</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(preview.work_requests.by_status).map(([k, v]) => (
                                                <span key={k} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{k}: {v}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {preview.work_orders?.by_status && Object.keys(preview.work_orders.by_status).length > 0 && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-xs font-bold text-green-700 mb-2">Work Orders by Status</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(preview.work_orders.by_status).map(([k, v]) => (
                                                <span key={k} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">{k}: {v}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {preview.backlog?.by_priority && Object.keys(preview.backlog.by_priority).length > 0 && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="text-xs font-bold text-amber-700 mb-2">Backlog by Priority</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(preview.backlog.by_priority).map(([k, v]) => (
                                                <span key={k} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">{k}: {v}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {preview.detail_work_requests?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Recent Work Requests ({preview.detail_work_requests.length})</div>
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                                            <table className="w-full text-sm border-collapse">
                                                <thead><tr><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">ID</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Equipment</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Status</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Priority</th></tr></thead>
                                                <tbody>{preview.detail_work_requests.slice(0, 20).map((wr, i) => (
                                                    <tr key={i}><td className="px-2 py-1 border-b border-border/50 font-mono text-xs">{(wr.request_id || '').slice(0, 8)}</td><td className="px-2 py-1 border-b border-border/50">{wr.equipment_tag}</td><td className="px-2 py-1 border-b border-border/50"><StatusBadge status={wr.status} /></td><td className="px-2 py-1 border-b border-border/50">{wr.priority}</td></tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {preview.detail_work_orders?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Recent Work Orders ({preview.detail_work_orders.length})</div>
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                                            <table className="w-full text-sm border-collapse">
                                                <thead><tr><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">WO #</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Equipment</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Status</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">Type</th></tr></thead>
                                                <tbody>{preview.detail_work_orders.slice(0, 20).map((wo, i) => (
                                                    <tr key={i}><td className="px-2 py-1 border-b border-border/50 font-mono text-xs">{wo.wo_number}</td><td className="px-2 py-1 border-b border-border/50">{wo.equipment_tag}</td><td className="px-2 py-1 border-b border-border/50"><StatusBadge status={wo.status} /></td><td className="px-2 py-1 border-b border-border/50">{wo.wo_type}</td></tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Legacy kpis table */}
                                {preview.kpis && (
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full text-sm border-collapse">
                                            <thead><tr><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">{t('reports.kpi')}</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">{t('reports.value')}</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">{t('reports.target')}</th><th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground border-b border-border">{t('reports.status')}</th></tr></thead>
                                            <tbody>
                                                {Object.entries(preview.kpis).map(([k, v]) => (
                                                    <tr key={k}>
                                                        <td className="px-2 py-1 border-b border-border/50">{k.replace(/_/g, ' ').toUpperCase()}</td>
                                                        <td className="px-2 py-1 border-b border-border/50 font-semibold">{typeof v === 'object' ? v.value : v}</td>
                                                        <td className="px-2 py-1 border-b border-border/50">{typeof v === 'object' ? v.target : '\u{2014}'}</td>
                                                        <td className="px-2 py-1 border-b border-border/50">{typeof v === 'object' && v.status ? <StatusBadge status={v.status} /> : '\u{2014}'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4 flex-wrap">
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={() => handleExport('xlsx')}>{t('reports.exportPDF') || 'Export XLSX'}</button>
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors" onClick={() => handleExport('xlsx')}>{t('reports.exportExcel')}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 px-5 text-muted-foreground"><div className="text-5xl mb-4 opacity-40">{"\u{1F4C4}"}</div><h3>{t('reports.generateAReport')}</h3><p>{t('reports.selectTypeAndGenerate')}</p></div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('reports.recentReports')}</div>
                        {reports.length > 0 ? reports.slice(0, 8).map((r, i) => (
                            <div key={i} onClick={async () => { try { const full = await api.getReport(r.report_id); setPreview(full && Object.keys(full).length > 0 ? full : r); } catch { setPreview(r); } }} className="py-2 border-b border-border/50 cursor-pointer flex justify-between items-center">
                                <div><div className="font-medium text-sm">{r.report_type || t('reports.report')}</div><div className="text-[0.72rem] text-muted-foreground">{r.created_at || r.generated_at || ''}</div></div>
                                <StatusBadge status={r.status || 'GENERATED'} />
                            </div>
                        )) : <p className="text-muted-foreground">{t('reports.noReportsYet')}</p>}
                    </div>

                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('reports.activeNotifications')}</div>
                        {notifications.length > 0 ? notifications.slice(0, 6).map((n, i) => (
                            <div key={i} className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border-l-[3px] mb-2 bg-card border border-border ${(n.level || '').toLowerCase() === 'critical' ? 'border-l-red-600 bg-red-50' : (n.level || '').toLowerCase() === 'warning' ? 'border-l-amber-500 bg-amber-50' : ''}`}>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold">{n.level === 'CRITICAL' ? '\u{1F534}' : n.level === 'WARNING' ? '\u{1F7E1}' : '\u{1F7E2}'} {n.message || n.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{n.created_at || ''}</div>
                                </div>
                                {n.notification_id && (
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors shrink-0" onClick={() => handleAckNotification(n.notification_id)}>{"\u{2713}"}</button>
                                )}
                            </div>
                        )) : <p className="text-muted-foreground">{t('reports.noActiveNotifications')}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
