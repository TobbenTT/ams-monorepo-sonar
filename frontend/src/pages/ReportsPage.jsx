import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import {
  FileText, Download, Calendar, Clock, TrendingUp, Loader2, AlertCircle,
  Inbox, Play, Eye, Trash2, BarChart3, ClipboardList, Shield, Settings, DollarSign,
} from 'lucide-react';
import * as api from '../api';
import { downloadExport } from '../utils/exportFile';
import { useToast } from '../components/Toast';

// ── Report type metadata ─────────────────────────────────────────────
const REPORT_TYPE_META = {
  WEEKLY_MAINTENANCE: {
    nameKey: 'reports.weeklyMaintenanceName',
    descKey: 'reports.weeklyMaintenanceDesc',
    categoryKey: 'Operations',
    frequencyKey: 'reports.frequencyWeekly',
    icon: ClipboardList,
    color: 'text-blue-600 bg-blue-100',
  },
  MONTHLY_KPI: {
    nameKey: 'reports.monthlyKpiName',
    descKey: 'reports.monthlyKpiDesc',
    categoryKey: 'Executive',
    frequencyKey: 'reports.frequencyMonthly',
    icon: BarChart3,
    color: 'text-emerald-600 bg-emerald-100',
  },
  QUARTERLY_REVIEW: {
    nameKey: 'reports.quarterlyReviewName',
    descKey: 'reports.quarterlyReviewDesc',
    categoryKey: 'Executive',
    frequencyKey: 'reports.frequencyQuarterly',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-100',
  },
};

// Internal category keys used for filtering (not translated — these match categoryKey above)
const CATEGORY_KEYS = ['All', 'Executive', 'Operations', 'Reliability', 'Engineering', 'Financial', 'Planning'];

// Map internal category key → i18n key
const CATEGORY_I18N = {
  All: 'reports.categoryAll',
  Executive: 'reports.categoryExecutive',
  Operations: 'reports.categoryOperations',
  Reliability: 'reports.categoryReliability',
  Engineering: 'reports.categoryEngineering',
  Financial: 'reports.categoryFinancial',
  Planning: 'reports.categoryPlanning',
  General: 'reports.categoryGeneral',
};

function getReportMeta(report, t) {
  const meta = REPORT_TYPE_META[report.report_type] || {};
  const categoryKey = meta.categoryKey || 'General';
  return {
    name: meta.nameKey ? t(meta.nameKey) : (report.report_type?.replace(/_/g, ' ') || t('reports.report')),
    description: meta.descKey ? t(meta.descKey) : '',
    category: categoryKey,
    categoryLabel: t(CATEGORY_I18N[categoryKey] || 'reports.categoryGeneral'),
    frequency: meta.frequencyKey ? t(meta.frequencyKey) : '',
    Icon: meta.icon || FileText,
    color: meta.color || 'text-gray-600 bg-gray-100',
  };
}

function formatDate(dateStr, lang) {
  if (!dateStr) return '\u2014';
  const locale = lang === 'es' ? 'es-ES' : lang === 'ar' ? 'ar-SA' : 'en-US';
  try {
    return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatPeriod(start, end, lang) {
  if (!start) return '';
  const s = formatDate(start, lang);
  const e = end ? formatDate(end, lang) : '';
  return e ? `${s} \u2014 ${e}` : s;
}

// ── Render report content as readable sections ───────────────────────
function ReportContentView({ content, t }) {
  if (!content || typeof content !== 'object') {
    return <p className="text-sm text-gray-500 italic">{t('reports.noReportContent')}</p>;
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
      {Object.entries(content).map(([key, value]) => (
        <div key={key} className="border-b pb-3">
          <h4 className="font-semibold text-gray-800 mb-1 capitalize">{key.replace(/_/g, ' ')}</h4>
          {typeof value === 'string' || typeof value === 'number' ? (
            <p className="text-gray-600">{String(value)}</p>
          ) : Array.isArray(value) ? (
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {value.map((item, i) => (
                <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
              ))}
            </ul>
          ) : typeof value === 'object' && value !== null ? (
            <div className="bg-gray-50 rounded p-3 space-y-1">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                  <span className="font-medium text-gray-800">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const ctx = useOutletContext() || {};
  const plantId = ctx.selectedPlant?.plant_id || ctx.selectedPlant || ctx.plant?.plant_id || 'OCP-JFC1';
  const { t, lang } = useLanguage();
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Generate state
  const [generating, setGenerating] = useState(null); // report_type being generated

  // View dialog
  const [viewReport, setViewReport] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewContent, setViewContent] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listReports({ plant_id: plantId });
      const arr = Array.isArray(data) ? data : (data?.reports || []);
      setReports(arr);
    } catch (err) {
      setError(err.message || t('reports.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Generate report ────────────────────────────────────────────────
  const handleGenerate = async (reportType) => {
    try {
      setGenerating(reportType);
      const now = new Date();
      const basePayload = { plant_id: plantId };

      if (reportType === 'WEEKLY_MAINTENANCE') {
        const weekNum = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        await api.generateWeeklyReport({
          ...basePayload,
          week: weekNum,
          week_number: weekNum,
          year: now.getFullYear(),
        });
      } else if (reportType === 'MONTHLY_KPI') {
        await api.generateMonthlyReport({
          ...basePayload,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
      } else if (reportType === 'QUARTERLY_REVIEW') {
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        // Use the generateWeeklyReport with quarterly type as fallback
        await api.generateWeeklyReport({
          ...basePayload,
          week: quarter,
          week_number: quarter,
          year: now.getFullYear(),
          key_events: [`Quarterly review Q${quarter}`],
        });
      }
      await fetchReports();
    } catch (err) {
      toast.error(`${t('reports.errorGenerating')}: ${err.message || t('reports.unknownError')}`);
    } finally {
      setGenerating(null);
    }
  };

  // ── View report ────────────────────────────────────────────────────
  const handleView = async (report) => {
    setViewReport(report);
    setViewContent(null);
    setViewLoading(true);
    try {
      const data = await api.getReport(report.report_id);
      setViewContent(data?.content || data || null);
    } catch {
      setViewContent(null);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Download report as XLSX ────────────────────────────────────────
  const handleDownload = async (report) => {
    try {
      const data = await api.getReport(report.report_id);
      const content = data?.content || data;
      const meta = getReportMeta(report, t);
      const filename = `${meta.name.replace(/\s+/g, '_')}_${report.report_id?.slice(0, 8) || 'report'}`;

      // Build sheets from report content for XLSX export
      const sheets = [];
      if (content?.sections) {
        content.sections.forEach(section => {
          const rows = [];
          if (section.metrics) {
            section.metrics.forEach(m => {
              rows.push({ Métrica: m.name || m.label || '', Valor: m.value ?? '', Unidad: m.unit || '', Estado: m.status || '' });
            });
          } else if (typeof section.content === 'object' && section.content) {
            Object.entries(section.content).forEach(([k, v]) => {
              rows.push({ Campo: k, Valor: typeof v === 'object' ? JSON.stringify(v) : String(v ?? '') });
            });
          }
          if (rows.length > 0) {
            sheets.push({ name: (section.title || 'Data').slice(0, 31), headers: Object.keys(rows[0]), rows });
          }
        });
      }
      if (sheets.length > 0) {
        downloadExport({ format: 'EXCEL', sheets }, filename);
      } else {
        // Fallback: JSON download
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast.error(`${t('reports.errorDownloading')}: ${err.message}`);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────
  const filteredReports = activeCategory === 'All'
    ? reports
    : reports.filter(r => getReportMeta(r, t).category === activeCategory);

  const typeCounts = {};
  reports.forEach(r => {
    const cat = getReportMeta(r, t).category;
    typeCounts[cat] = (typeCounts[cat] || 0) + 1;
  });

  const generatedThisMonth = reports.filter(r => {
    const d = new Date(r.generated_at || r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // ── Loading / Error ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">{t('reports.loadingReports')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={fetchReports}>{t('reports.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          {t('reports.pageTitle')}
        </h2>
        <p className="text-gray-600 mt-1">{t('reports.pageSubtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.totalReports')}</p>
              <p className="text-3xl font-semibold text-gray-800">{reports.length}</p>
            </div>
            <FileText className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.generatedThisMonth')}</p>
              <p className="text-3xl font-semibold text-gray-800">{generatedThisMonth}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.reportTypes')}</p>
              <p className="text-3xl font-semibold text-gray-800">{Object.keys(typeCounts).length}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('reports.lastGenerated')}</p>
              <p className="text-lg font-semibold text-gray-800">
                {reports.length > 0 ? formatDate(reports[0].generated_at, lang) : '\u2014'}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Generate New Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reports.generateNewReport')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(REPORT_TYPE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <Card key={type} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{t(meta.nameKey)}</h4>
                    <Badge className="text-xs mt-1" variant="outline">{t(CATEGORY_I18N[meta.categoryKey])}</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">{t(meta.descKey)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t(meta.frequencyKey)}</span>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleGenerate(type)}
                    disabled={generating === type}
                  >
                    {generating === type ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('reports.generating')}</>
                    ) : (
                      <><Play className="w-3 h-3 mr-1" /> {t('reports.generate')}</>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium mr-2">{t('reports.filterLabel')}</span>
          {CATEGORY_KEYS.map((catKey) => (
            <Button
              key={catKey}
              variant={catKey === activeCategory ? 'default' : 'outline'}
              size="sm"
              className={catKey === activeCategory ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setActiveCategory(catKey)}
            >
              {t(CATEGORY_I18N[catKey])}
              {catKey !== 'All' && typeCounts[catKey] ? ` (${typeCounts[catKey]})` : ''}
            </Button>
          ))}
        </div>
      </Card>

      {/* Generated Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('reports.generatedReports')}
          <span className="text-sm font-normal text-gray-500 ml-2">({filteredReports.length})</span>
        </h3>

        {filteredReports.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
              <Inbox className="w-12 h-12" />
              <p className="text-lg font-medium">{t('reports.noReportsEmpty')}</p>
              <p className="text-sm">{t('reports.noReportsEmptyHint')}</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report, index) => {
              const meta = getReportMeta(report, t);
              const Icon = meta.Icon;
              return (
                <Card key={report.report_id || index} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">{meta.categoryLabel}</Badge>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">{meta.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">{meta.description}</p>

                  <div className="space-y-1 mb-4 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>{t('reports.periodLabel')}</span>
                      <span className="font-medium text-gray-700">{formatPeriod(report.period_start, report.period_end, lang)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{t('reports.generatedLabel')}</span>
                      <span className="font-medium text-gray-700">{formatDate(report.generated_at, lang)}</span>
                    </div>
                    {meta.frequency && (
                      <div className="flex justify-between text-gray-500">
                        <span>{t('reports.frequencyLabel')}</span>
                        <span className="font-medium text-gray-700">{meta.frequency}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleView(report)}
                    >
                      <Eye className="w-3 h-3 mr-1" /> {t('reports.view')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="w-3 h-3 mr-1" /> {t('reports.download')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Report Dialog */}
      <Dialog open={!!viewReport} onOpenChange={(open) => { if (!open) setViewReport(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewReport ? getReportMeta(viewReport, t).name : t('reports.report')}</DialogTitle>
            <DialogDescription>
              {viewReport && formatPeriod(viewReport.period_start, viewReport.period_end, lang)}
              {viewReport && ` \u2014 ${t('reports.generatedLabel')} ${formatDate(viewReport.generated_at, lang)}`}
            </DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : viewContent ? (
            <ReportContentView content={viewContent} t={t} />
          ) : (
            <p className="text-sm text-gray-500 italic py-8 text-center">{t('reports.noContentAvailable')}</p>
          )}
          <DialogFooter>
            {viewReport && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleDownload(viewReport)}>
                <Download className="w-3 h-3 mr-1" /> {t('reports.downloadJson')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
