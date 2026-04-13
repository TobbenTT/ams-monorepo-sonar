import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StatusBadge, LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';
import {
    FileText, BarChart3, Target, Settings, Link2, Microscope,
    Download, Eye, Calendar, CheckCircle2, ClipboardList, Package,
    TrendingUp, Bell, ChevronRight, FileSpreadsheet, FilePieChart,
    Clock, AlertTriangle, Play, Filter, RefreshCw, Printer
} from 'lucide-react';

const TEMPLATE_ICONS = {
    1: FileText,
    2: BarChart3,
    3: Target,
    4: Settings,
    5: Link2,
    6: Microscope,
};

const REPORT_TEMPLATES = [
    { id: 1, titleKey: "reports.weeklyMaintReport", typeKey: "reports.operational", frequencyKey: "reports.weekly", lastGen: "27 Feb 2026", statusKey: "reports.generated" },
    { id: 2, titleKey: "reports.backlogAnalysis", typeKey: "reports.analytical", frequencyKey: "reports.biweekly", lastGen: "20 Feb 2026", statusKey: "reports.generated" },
    { id: 3, titleKey: "reports.execKpiDashboard", typeKey: "reports.executive", frequencyKey: "reports.monthly", lastGen: "01 Feb 2026", statusKey: "reports.pending" },
    { id: 4, titleKey: "reports.reliabilityReport", typeKey: "reports.technical", frequencyKey: "reports.monthly", lastGen: "01 Feb 2026", statusKey: "reports.generated" },
    { id: 5, titleKey: "reports.sapOrderClose", typeKey: "reports.sap", frequencyKey: "reports.weekly", lastGen: "27 Feb 2026", statusKey: "reports.generated" },
    { id: 6, titleKey: "reports.fmeaReview", typeKey: "reports.technical", frequencyKey: "reports.quarterly", lastGen: "15 Jan 2026", statusKey: "reports.inProcess" },
];

function templateStatusStyle(statusKey) {
    if (statusKey === 'reports.generated') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (statusKey === 'reports.pending') return 'bg-amber-100 text-amber-700 border border-amber-200';
    if (statusKey === 'reports.inProcess') return 'bg-blue-100 text-blue-700 border border-blue-200';
    return 'bg-muted text-muted-foreground border border-border';
}

function StatCard({ icon: Icon, label, value, sub, color }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        purple: 'from-purple-500 to-purple-600',
        amber: 'from-amber-500 to-amber-600',
    };
    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color] || colors.blue} flex items-center justify-center shadow-lg shadow-${color}-500/20`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground font-medium">{label}</div>
                {sub && <div className="text-[0.65rem] text-muted-foreground/70">{sub}</div>}
            </div>
        </div>
    );
}

function WeeklySummarySection({ scheduleWeeks, workRequests, backlogItems }) {
    const { t } = useLanguage();
    const week = (scheduleWeeks || [])[0];
    if (!week) return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.previewWeeklySummary')}</span>
            </div>
            <p className="text-sm text-muted-foreground py-8 text-center">No schedule data available</p>
        </div>
    );
    const wos = week.work_orders || week.work_packages || [];
    const woTotal = wos.length;
    const woCompleted = wos.filter(w => w.status === 'COMPLETED' || w.status === 'DONE').length;
    const adherence = week.adherence ?? week.adherence_pct ?? (woTotal > 0 ? Math.round((woCompleted / woTotal) * 100) : 0);
    const weekLabel = week.week ?? (week.week_number ? `S${week.week_number}` : 'N/A');
    const weekRange = week.start && week.end ? `${week.start} — ${week.end}` : (week.year ? `${week.year}` : '');
    const openWR = (workRequests || []).filter(w => w.status === 'PENDING_VALIDATION' || w.status === 'DRAFT').length;
    const backlogCount = (backlogItems || []).length;
    const completionRate = woTotal > 0 ? Math.round((woCompleted / woTotal) * 100) : 0;

    const metrics = [
        { label: t('reports.planAdherence'), value: `${adherence}%`, sub: `${t('reports.week')} ${weekLabel}`, ok: adherence >= 90, icon: Calendar, color: 'blue' },
        { label: t('reports.woCompleted'), value: `${woCompleted}/${woTotal}`, sub: `${completionRate}% ${t('reports.completed')}`, ok: completionRate >= 80, icon: CheckCircle2, color: 'green' },
        { label: t('reports.pendingWR'), value: openWR, sub: t('reports.unvalidated'), ok: openWR <= 3, icon: ClipboardList, color: 'amber' },
        { label: t('reports.totalBacklog'), value: backlogCount, sub: t('reports.activeItems'), ok: backlogCount <= 8, icon: Package, color: 'purple' },
    ];

    const p1Count = (workRequests || []).filter(w => w.priority_suggested === 'P1').length;
    const criticalEquipment = (workRequests || []).filter(w => w.production_impact === 'CRITICAL' || w.production_impact === 'HIGH').length;

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.previewWeeklySummary')}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg font-mono">{weekLabel}{weekRange ? ` · ${weekRange}` : ''}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {metrics.map((m, i) => {
                    const MIcon = m.icon;
                    return (
                        <div key={i} className={`rounded-xl p-4 border transition-all ${m.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <MIcon className={`w-5 h-5 mb-2 ${m.ok ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <div className={`text-2xl font-extrabold ${m.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{m.value}</div>
                            <div className="text-xs font-semibold text-foreground mt-1">{m.label}</div>
                            <div className="text-[0.65rem] text-muted-foreground">{m.sub}</div>
                        </div>
                    );
                })}
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('reports.autoExecSummary')}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                    {t('reports.summaryDuring')} <strong>{weekLabel}</strong>, {t('reports.summaryAdherence')} <strong>{adherence}%</strong>{adherence >= 90 ? t('reports.summaryAboveGoal') : t('reports.summaryBelowGoal')}.
                    {' '}{t('reports.summaryCompleted')} <strong>{woCompleted} de {woTotal}</strong> {t('reports.summaryPlannedWO')} ({completionRate}% {t('reports.summaryCompletionRate')}).
                    {' '}<strong>{openWR} {t('reports.summaryPendingWR')}</strong> {t('reports.summaryAwaitingValidation')} <strong>{p1Count}</strong> {t('reports.summaryP1Priority')}.
                    {' '}{t('reports.summaryActiveBacklog')} <strong>{backlogCount} {t('reports.summaryItems')}</strong>, <strong>{criticalEquipment}</strong> {t('reports.summaryHighImpact')}.
                    {adherence >= 90 && completionRate >= 80
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
    const [activeFilter, setActiveFilter] = useState('all');

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
        { titleKey: "reports.workRequests", descKey: "reports.allWoAndRequests", count: workRequests.length, format: "XLSX / CSV", icon: ClipboardList, exportType: "report", color: 'blue' },
        { titleKey: "reports.backlogItems", descKey: "reports.currentBacklogWithReasons", count: backlogItems.length, format: "XLSX / CSV", icon: Package, exportType: "report", color: 'amber' },
        { titleKey: "reports.reliabilityKpis", descKey: "reports.mtbfMttrAvailability", count: reliabilityKpis.length, format: "XLSX / PDF", icon: TrendingUp, exportType: "kpis", color: 'green' },
        { titleKey: "reports.sapOrders", descKey: "reports.confirmedClosedSapOrders", count: sapUploads.length, format: "XLSX / SAP", icon: Link2, exportType: "report", color: 'purple' },
    ], [workRequests.length, backlogItems.length, reliabilityKpis.length, sapUploads.length]);

    const filteredTemplates = useMemo(() => {
        if (activeFilter === 'all') return REPORT_TEMPLATES;
        const filterMap = {
            executive: ['reports.executive'],
            operations: ['reports.operational'],
            reliability: ['reports.technical'],
            engineering: ['reports.technical'],
            financial: ['reports.analytical'],
            planning: ['reports.sap'],
        };
        const allowed = filterMap[activeFilter] || [];
        return REPORT_TEMPLATES.filter(t => allowed.includes(t.typeKey));
    }, [activeFilter]);

    const generatedThisMonth = reports.filter(r => {
        try {
            const d = new Date(r.created_at || r.generated_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } catch { return false; }
    }).length;

    const reportTypes = [...new Set(reports.map(r => r.report_type).filter(Boolean))].length;
    const lastGenerated = reports.length > 0 ? (reports[0].created_at || reports[0].generated_at || '—') : '—';
    const lastGenShort = lastGenerated !== '—' ? new Date(lastGenerated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            if (reportType === 'operational') {
                const dbReport = await api.generateReportFromDB({ report_type: 'operational', plant_id: plant });
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
            if (preview?.detail_work_requests || preview?.detail_work_orders) {
                const sheets = [
                    { name: 'Summary', headers: ['Metric', 'Value'], rows: preview.summary ? Object.entries(preview.summary).map(([k, v]) => [k.replace(/_/g, ' '), String(v)]) : [] },
                    { name: 'Work Requests', headers: ['ID', 'Equipment', 'Status', 'Priority', 'Description', 'Created'], rows: (preview.detail_work_requests || []).map(wr => [wr.request_id, wr.equipment_tag, wr.status, wr.priority, wr.failure_description, wr.created_at]) },
                    { name: 'Work Orders', headers: ['WO Number', 'Equipment', 'Status', 'Type', 'Planned Start', 'Created'], rows: (preview.detail_work_orders || []).map(wo => [wo.wo_number, wo.equipment_tag, wo.status, wo.wo_type, wo.planned_start, wo.created_at]) },
                ];
                if (preview.work_requests?.by_status) sheets.push({ name: 'WR by Status', headers: ['Status', 'Count'], rows: Object.entries(preview.work_requests.by_status) });
                if (preview.work_orders?.by_status) sheets.push({ name: 'WO by Status', headers: ['Status', 'Count'], rows: Object.entries(preview.work_orders.by_status) });
                if (preview.backlog?.by_priority) sheets.push({ name: 'Backlog by Priority', headers: ['Priority', 'Count'], rows: Object.entries(preview.backlog.by_priority) });
                const name = `report_${(preview.report_type || 'operational').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
                downloadExport({ format: validFormat, sheets }, name);
                toast.success(t('reports.exportDownloaded', { format: validFormat }) || 'Export downloaded');
                return;
            }
            const week = scheduleWeeks[0] || { week: 'N/A', start: '', end: '', adherence: 0, planned_hours: 0, executed_hours: 0, work_orders: [] };
            const wos = week.work_orders || week.work_packages || [];
            const adh = week.adherence ?? week.adherence_pct ?? 0;
            const sheets = [
                { name: 'Weekly Summary', headers: ['Metric', 'Value', 'Target', 'Status'], rows: [
                    ['Plan Adherence', `${adh}%`, '>=90%', adh >= 90 ? 'OK' : 'Below Target'],
                    ['WO Completed', `${wos.filter(w => w.status === 'COMPLETED').length}/${wos.length}`, '>=80%', 'OK'],
                    ['Pending WRs', String(workRequests.filter(w => w.status === 'PENDING_VALIDATION' || w.status === 'DRAFT').length), '<=3', ''],
                    ['Total Backlog', String(backlogItems.length), '<=8', ''],
                    ['Planned Hours', `${week.planned_hours ?? 0}h`, '', ''],
                    ['Executed Hours', `${week.executed_hours ?? 0}h`, '', ''],
                ] },
                { name: 'Work Orders', headers: ['WO ID', 'Equipment', 'Type', 'Description', 'Planned H.', 'Actual H.', 'Status', 'Priority', 'Technicians'], rows: wos.map(wo => [wo.id || wo.work_package_id, wo.equipment || wo.equipment_tag, wo.type || wo.wo_type, wo.description || '', `${wo.duration_planned ?? wo.estimated_hours ?? 0}h`, `${wo.duration_actual ?? 0}h`, wo.status, wo.priority, (wo.technicians || []).join(', ')]) },
                { name: 'Work Requests', headers: ['ID', 'Equipment', 'Failure Description', 'Failure Mode', 'Priority', 'Status', 'Plant', 'Area', 'Technician', 'Est. Duration', 'AI Confidence'], rows: workRequests.map(wr => [wr.id || wr.request_id, wr.equipment_tag, wr.failure_description || '', wr.failure_mode || '', wr.priority_suggested || wr.priority || '', wr.status, wr.plant || wr.plant_id || '', wr.area || '', wr.technician || wr.created_by || '', `${wr.estimated_duration ?? ''}h`, `${wr.ai_confidence ?? ''}%`]) },
                { name: 'Backlog', headers: ['ID', 'WR ID', 'Equipment', 'Reason', 'Age (days)', 'Est. Hours', 'Plant', 'Priority', 'Group ID'], rows: backlogItems.map(bl => [bl.id || bl.backlog_id, bl.wr_id || bl.work_request_id || '', bl.equipment_tag, bl.reason, String(bl.age_days ?? ''), String(bl.estimated_hours ?? ''), bl.plant || bl.plant_id || '', bl.priority, bl.group_id || '']) },
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
                sheets = [{ name: 'Work Requests', headers: ['ID', 'Equipment', 'Name', 'Failure Description', 'Failure Mode', 'Priority Requested', 'Priority Suggested', 'Status', 'Plant', 'Area', 'Technician', 'Est. Duration (h)', 'AI Confidence (%)', 'Production Impact', 'Created'], rows: workRequests.map(wr => [wr.id || wr.request_id, wr.equipment_tag, wr.equipment_name || '', wr.failure_description || '', wr.failure_mode || '', wr.priority_requested || '', wr.priority_suggested || wr.priority || '', wr.status, wr.plant || wr.plant_id || '', wr.area || '', wr.technician || wr.created_by || '', wr.estimated_duration ?? '', wr.ai_confidence ?? '', wr.production_impact || '', wr.created_at || '']) }];
            } else if (exp.titleKey === 'reports.backlogItems') {
                sheets = [{ name: 'Backlog Items', headers: ['ID', 'WR ID', 'Equipment', 'Reason', 'Age (days)', 'Est. Hours', 'Plant', 'Priority', 'Groupable', 'Group ID'], rows: backlogItems.map(bl => [bl.id || bl.backlog_id, bl.wr_id || bl.work_request_id || '', bl.equipment_tag, bl.reason, bl.age_days ?? '', bl.estimated_hours ?? '', bl.plant || bl.plant_id || '', bl.priority, bl.groupable ? 'Yes' : 'No', bl.group_id || '']) }];
            } else if (exp.titleKey === 'reports.reliabilityKpis') {
                sheets = [
                    { name: 'Reliability KPIs', headers: ['Equipment', 'Name', 'MTBF (h)', 'MTTR (h)', 'Availability (%)', 'OEE (%)', 'Trend'], rows: reliabilityKpis.map(r => [r.equipment_tag, r.equipment_name, r.mtbf, r.mttr, r.availability, r.oee, r.trend]) },
                    { name: 'KPI History', headers: ['Month', 'Schedule Adherence (%)', 'Planning Time Avg (min)', 'OEE Avg (%)'], rows: kpiHistory.map(k => [k.month, k.schedule_adherence, k.planning_time_avg, k.oee_avg]) },
                ];
            } else if (exp.titleKey === 'reports.sapOrders') {
                sheets = [{ name: 'SAP Uploads', headers: ['Upload ID', 'Plant', 'Status', 'Records', 'Created'], rows: sapUploads.map(s => [s.upload_id || s.id, s.plant_id || s.plant, s.status, s.record_count ?? '', s.created_at || '']) }];
            }
            const name = `${exportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
            downloadExport({ format: 'EXCEL', sheets }, name);
            toast.success(`${exportTitle} ${t('reports.downloaded')}`);
        } catch (e) {
            toast.error(`${t('reports.exportFailed')}: ${e.message}`);
        }
    };

    if (loading) return <LoadingSpinner message={t('reports.loading') || 'Loading reports...'} />;

    const filterTabs = [
        { key: 'all', label: 'All' },
        { key: 'executive', label: 'Executive' },
        { key: 'operations', label: 'Operations' },
        { key: 'reliability', label: 'Reliability' },
        { key: 'engineering', label: 'Engineering' },
        { key: 'financial', label: 'Financial' },
        { key: 'planning', label: 'Planning' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <FilePieChart className="w-7 h-7" />
                            Reports & Analytics
                        </h1>
                        <p className="text-teal-100 text-sm mt-1">Generate, view, and export maintenance reports</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                            <span className="text-teal-200 text-xs">Plant</span>
                            <div className="font-semibold">{plant}</div>
                        </div>
                        <button
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {generating ? 'Generating...' : 'Quick Generate'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Reports" value={reports.length} color="blue" />
                <StatCard icon={Calendar} label="Generated This Month" value={generatedThisMonth} color="green" />
                <StatCard icon={BarChart3} label="Report Types" value={reportTypes || REPORT_TEMPLATES.length} color="purple" />
                <StatCard icon={Clock} label="Last Generated" value={lastGenShort} color="amber" />
            </div>

            {/* Report Type Selector + Generate */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Generate:</span>
                    </div>
                    <select
                        className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        value={reportType}
                        onChange={e => setReportType(e.target.value)}
                    >
                        <option value="weekly">{t('reports.weeklyKpiReport')}</option>
                        <option value="monthly">{t('reports.monthlyKpiReport')}</option>
                        <option value="operational">{t('reports.operational') || 'Operational Report'}</option>
                    </select>
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg font-mono">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex-1" />
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm flex items-center gap-2"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                        {generating ? t('reports.generating') : t('reports.generateReport')}
                    </button>
                </div>
            </div>

            {/* Filter Tabs + Report Templates */}
            <div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                activeFilter === tab.key
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map(tpl => {
                        const TIcon = TEMPLATE_ICONS[tpl.id] || FileText;
                        return (
                            <div key={tpl.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 flex items-center justify-center group-hover:from-teal-100 group-hover:to-emerald-100 transition-colors">
                                            <TIcon className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-foreground leading-tight">{t(tpl.titleKey)}</div>
                                            <div className="text-[0.7rem] text-muted-foreground">{t(tpl.typeKey)} · {t(tpl.frequencyKey)}</div>
                                        </div>
                                    </div>
                                    <span className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${templateStatusStyle(tpl.statusKey)}`}>
                                        {t(tpl.statusKey)}
                                    </span>
                                </div>
                                <div className="text-[0.7rem] text-muted-foreground mb-3">{t('reports.lastGeneration')}: {tpl.lastGen}</div>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                                        onClick={async () => {
                                            try {
                                                setGenerating(true);
                                                const res = await api.generateReportFromDB({ report_type: t(tpl.titleKey), plant_id: plant });
                                                setPreview(res);
                                                toast.success(t(tpl.titleKey));
                                            } catch {
                                                setPreview({ report_type: t(tpl.titleKey), plant_id: plant, sections: { type: t(tpl.typeKey), frequency: t(tpl.frequencyKey) } });
                                            } finally {
                                                setGenerating(false);
                                            }
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        onClick={() => handleExport('xlsx')}
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Summary */}
            <WeeklySummarySection scheduleWeeks={scheduleWeeks} workRequests={workRequests} backlogItems={backlogItems} />

            {/* Data Export Panel */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.dataExport')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DATA_EXPORTS.map((exp, i) => {
                        const EIcon = exp.icon;
                        const colorMap = {
                            blue: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
                            amber: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
                            green: { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
                            purple: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
                        };
                        const c = colorMap[exp.color] || colorMap.blue;
                        return (
                            <div key={i} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-xl p-5 flex flex-col gap-3`}>
                                <div className={`w-10 h-10 rounded-xl bg-white/80 border ${c.border} flex items-center justify-center`}>
                                    <EIcon className={`w-5 h-5 ${c.icon}`} />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">{t(exp.titleKey)}</div>
                                    <div className="text-[0.7rem] text-muted-foreground leading-snug mt-1">{t(exp.descKey)}</div>
                                </div>
                                <div className="flex items-center justify-between text-[0.7rem]">
                                    <span className={`${c.badge} px-2.5 py-1 rounded-lg font-semibold`}>{exp.count} records</span>
                                    <span className="text-muted-foreground font-mono">{exp.format}</span>
                                </div>
                                <button
                                    className="mt-auto px-3 py-2 text-xs font-medium rounded-lg bg-white/80 border border-white hover:bg-white transition-colors w-full flex items-center justify-center gap-1.5 text-foreground shadow-sm"
                                    onClick={() => handleDataExport(exp)}
                                >
                                    <Download className="w-3.5 h-3.5" /> {t('reports.exportBtn')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview + Recent Reports + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Preview - takes 3 cols */}
                <div className="lg:col-span-3">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.reportPreview')}</span>
                            </div>
                            {preview && (
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all flex items-center gap-1.5" onClick={() => handleExport('xlsx')}>
                                        <Download className="w-3.5 h-3.5" /> XLSX
                                    </button>
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5" onClick={() => handleExport('csv')}>
                                        <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                                    </button>
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all flex items-center gap-1.5" onClick={() => {
                                        const el = document.getElementById('report-preview');
                                        if (!el) return;
                                        const w = window.open('', '_blank');
                                        w.document.write(`<html><head><title>AMS Report</title><style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1e293b}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#0f766e;color:white;padding:10px 14px;text-align:left;font-size:13px}td{padding:8px 14px;border-bottom:1px solid #e2e8f0;font-size:13px}tr:nth-child(even){background:#f8fafc}h1,h2,h3{color:#0f766e}h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;font-weight:400;color:#64748b;margin-bottom:24px}.kpi{display:inline-block;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:8px 16px;margin:4px;text-align:center}.kpi .v{font-size:24px;font-weight:700;color:#059669}.kpi .l{font-size:11px;color:#64748b}@media print{body{padding:20px}}</style></head><body><h1>MAGEAM Report</h1><h2>${new Date().toLocaleDateString()}</h2>${el.innerHTML}<br><p style="color:#94a3b8;font-size:11px;margin-top:30px">Generated by MAGEAM v2.0 — Value Strategy Consulting</p></body></html>`);
                                        w.document.close();
                                        setTimeout(() => { w.print(); }, 500);
                                    }}>
                                        <Download className="w-3.5 h-3.5" /> PDF
                                    </button>
                                </div>
                            )}
                        </div>
                        {preview ? (
                            <div id="report-preview" className="space-y-4">
                                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 rounded-xl p-4">
                                    <h3 className="text-base font-bold text-foreground">
                                        {preview.report_type || reportType} Report — {preview.plant_id || plant}
                                    </h3>
                                    {preview.metadata && (
                                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                            {preview.metadata.report_type && <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{preview.metadata.report_type}</span></div>}
                                            {preview.metadata.plant_id && <div><span className="text-muted-foreground">Plant:</span> <span className="font-medium">{preview.metadata.plant_id}</span></div>}
                                            {preview.metadata.generated_at && <div><span className="text-muted-foreground">Generated:</span> <span className="font-medium">{new Date(preview.metadata.generated_at).toLocaleString()}</span></div>}
                                            {preview.metadata.period_start && <div><span className="text-muted-foreground">Period:</span> <span className="font-medium">{preview.metadata.period_start} — {preview.metadata.period_end}</span></div>}
                                        </div>
                                    )}
                                </div>

                                {/* Sections */}
                                {preview.sections && (Array.isArray(preview.sections) ? (
                                    preview.sections.map((section, i) => (
                                        <div key={i} className="p-4 bg-card border border-border rounded-xl">
                                            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{section.title || `Section ${i + 1}`}</div>
                                            {section.content && <p className="text-sm text-foreground mb-2">{section.content}</p>}
                                            {section.metrics && Object.keys(section.metrics).length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                                    {Object.entries(section.metrics).map(([mk, mv]) => (
                                                        <div key={mk} className="bg-muted/40 rounded-lg p-2.5 text-center">
                                                            <div className="text-lg font-bold text-foreground">{typeof mv === 'object' ? mv.value ?? JSON.stringify(mv) : String(mv)}</div>
                                                            <div className="text-[0.68rem] text-muted-foreground">{mk.replace(/_/g, ' ')}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {section.tables && section.tables.map((tbl, ti) => (
                                                <div key={ti} className="overflow-x-auto mt-2">
                                                    <table className="w-full text-sm border-collapse">
                                                        {tbl.headers && <thead><tr>{tbl.headers.map((h, hi) => <th key={hi} className="px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground border-b border-border">{h}</th>)}</tr></thead>}
                                                        {tbl.rows && <tbody>{tbl.rows.map((row, ri) => <tr key={ri} className="hover:bg-muted/30">{(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => <td key={ci} className="px-2 py-1.5 border-b border-border/50 text-sm">{String(cell ?? '')}</td>)}</tr>)}</tbody>}
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : typeof preview.sections === 'object' && (
                                    Object.entries(preview.sections).map(([k, v]) => (
                                        <div key={k} className="p-3 border border-border rounded-lg">
                                            <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{k.replace(/_/g, ' ')}</div>
                                            <div className="text-sm text-foreground">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</div>
                                        </div>
                                    ))
                                ))}

                                {/* KPI summaries */}
                                {(preview.planning_kpi_summary || preview.de_kpi_summary || preview.reliability_kpi_summary) && (
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{t('reports.kpiSummary')}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {preview.planning_kpi_summary && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                    <div className="text-xs font-bold text-blue-700 mb-2">{t('reports.planningKpis')}</div>
                                                    {Object.entries(preview.planning_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm py-0.5"><span className="text-blue-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                            {preview.de_kpi_summary && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                    <div className="text-xs font-bold text-amber-700 mb-2">{t('reports.deKpis')}</div>
                                                    {Object.entries(preview.de_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm py-0.5"><span className="text-amber-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                            {preview.reliability_kpi_summary && (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                    <div className="text-xs font-bold text-emerald-700 mb-2">{t('reports.reliabilityKpisLabel')}</div>
                                                    {Object.entries(preview.reliability_kpi_summary).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between text-sm py-0.5"><span className="text-emerald-600">{k.replace(/_/g, ' ')}</span><span className="font-semibold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Traffic lights */}
                                {preview.traffic_lights && Object.keys(preview.traffic_lights).length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t('reports.trafficLight')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(preview.traffic_lights).map(([k, v]) => (
                                                <span key={k} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${v === 'GREEN' ? 'bg-emerald-100 text-emerald-700' : v === 'YELLOW' ? 'bg-amber-100 text-amber-700' : v === 'RED' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                                                    {v === 'GREEN' ? '\u25CF' : v === 'YELLOW' ? '\u25CF' : v === 'RED' ? '\u25CF' : '\u25CB'} {k.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DB summary */}
                                {preview.summary && (
                                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Summary</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {Object.entries(preview.summary).map(([k, v]) => (
                                                <div key={k} className="bg-card rounded-lg p-3 text-center border border-border">
                                                    <div className="text-lg font-bold text-foreground">{String(v)}{k.includes('pct') ? '%' : ''}</div>
                                                    <div className="text-[0.68rem] text-muted-foreground">{k.replace(/_/g, ' ')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status breakdowns */}
                                {preview.work_requests?.by_status && Object.keys(preview.work_requests.by_status).length > 0 && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="text-xs font-bold text-blue-700 mb-2">Work Requests by Status</div>
                                        <div className="flex flex-wrap gap-2">{Object.entries(preview.work_requests.by_status).map(([k, v]) => (<span key={k} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">{k}: {v}</span>))}</div>
                                    </div>
                                )}
                                {preview.work_orders?.by_status && Object.keys(preview.work_orders.by_status).length > 0 && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="text-xs font-bold text-emerald-700 mb-2">Work Orders by Status</div>
                                        <div className="flex flex-wrap gap-2">{Object.entries(preview.work_orders.by_status).map(([k, v]) => (<span key={k} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium">{k}: {v}</span>))}</div>
                                    </div>
                                )}
                                {preview.backlog?.by_priority && Object.keys(preview.backlog.by_priority).length > 0 && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <div className="text-xs font-bold text-amber-700 mb-2">Backlog by Priority</div>
                                        <div className="flex flex-wrap gap-2">{Object.entries(preview.backlog.by_priority).map(([k, v]) => (<span key={k} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium">{k}: {v}</span>))}</div>
                                    </div>
                                )}

                                {/* Detail tables */}
                                {preview.detail_work_requests?.length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Recent Work Requests ({preview.detail_work_requests.length})</div>
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-border">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-muted/50 sticky top-0"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">ID</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Equipment</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Status</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Priority</th></tr></thead>
                                                <tbody>{preview.detail_work_requests.slice(0, 20).map((wr, i) => (
                                                    <tr key={i} className="hover:bg-muted/30"><td className="px-3 py-2 border-b border-border/50 font-mono text-xs">{(wr.request_id || '').slice(0, 8)}</td><td className="px-3 py-2 border-b border-border/50">{wr.equipment_tag}</td><td className="px-3 py-2 border-b border-border/50"><StatusBadge status={wr.status} /></td><td className="px-3 py-2 border-b border-border/50">{wr.priority}</td></tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {preview.detail_work_orders?.length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Recent Work Orders ({preview.detail_work_orders.length})</div>
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-border">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-muted/50 sticky top-0"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">WO #</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Equipment</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Status</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Type</th></tr></thead>
                                                <tbody>{preview.detail_work_orders.slice(0, 20).map((wo, i) => (
                                                    <tr key={i} className="hover:bg-muted/30"><td className="px-3 py-2 border-b border-border/50 font-mono text-xs">{wo.wo_number}</td><td className="px-3 py-2 border-b border-border/50">{wo.equipment_tag}</td><td className="px-3 py-2 border-b border-border/50"><StatusBadge status={wo.status} /></td><td className="px-3 py-2 border-b border-border/50">{wo.wo_type}</td></tr>
                                                ))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Legacy kpis */}
                                {preview.kpis && (
                                    <div className="overflow-x-auto rounded-lg border border-border">
                                        <table className="w-full text-sm border-collapse">
                                            <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{t('reports.kpi')}</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{t('reports.value')}</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{t('reports.target')}</th><th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{t('reports.status')}</th></tr></thead>
                                            <tbody>{Object.entries(preview.kpis).map(([k, v]) => (
                                                <tr key={k} className="hover:bg-muted/30"><td className="px-3 py-2 border-b border-border/50">{k.replace(/_/g, ' ').toUpperCase()}</td><td className="px-3 py-2 border-b border-border/50 font-semibold">{typeof v === 'object' ? v.value : v}</td><td className="px-3 py-2 border-b border-border/50">{typeof v === 'object' ? v.target : '\u2014'}</td><td className="px-3 py-2 border-b border-border/50">{typeof v === 'object' && v.status ? <StatusBadge status={v.status} /> : '\u2014'}</td></tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-5 text-muted-foreground">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">{t('reports.generateAReport')}</h3>
                                <p className="text-sm">{t('reports.selectTypeAndGenerate')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column - Recent Reports + Notifications */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.recentReports')}</span>
                        </div>
                        {reports.length > 0 ? reports.slice(0, 8).map((r, i) => (
                            <div
                                key={i}
                                onClick={async () => {
                                    try {
                                        const full = await api.getReport(r.report_id);
                                        setPreview(full && Object.keys(full).length > 0 ? full : r);
                                    } catch { setPreview(r); }
                                }}
                                className="py-3 border-b border-border/50 cursor-pointer flex justify-between items-center hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{r.report_type || t('reports.report')}</div>
                                        <div className="text-[0.72rem] text-muted-foreground">{r.created_at || r.generated_at || ''}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={r.status || 'GENERATED'} />
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">{t('reports.noReportsYet')}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('reports.activeNotifications')}</span>
                            {notifications.length > 0 && (
                                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
                            )}
                        </div>
                        {notifications.length > 0 ? notifications.slice(0, 6).map((n, i) => {
                            const isCritical = (n.level || '').toLowerCase() === 'critical';
                            const isWarning = (n.level || '').toLowerCase() === 'warning';
                            return (
                                <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-2 border transition-all ${
                                    isCritical ? 'border-red-200 bg-red-50' : isWarning ? 'border-amber-200 bg-amber-50' : 'border-border bg-card'
                                }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isCritical ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-emerald-100'
                                    }`}>
                                        {isCritical ? <AlertTriangle className="w-4 h-4 text-red-600" /> : isWarning ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-foreground truncate">{n.message || n.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{n.created_at || ''}</div>
                                    </div>
                                    {n.notification_id && (
                                        <button
                                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-white hover:bg-muted transition-colors shrink-0"
                                            onClick={() => handleAckNotification(n.notification_id)}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">{t('reports.noActiveNotifications')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
