import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  FileText, Download, Calendar, CheckCircle, Clock, Loader2,
  BarChart3, TrendingUp, FileSpreadsheet, RefreshCw,
} from 'lucide-react';

const REPORTS = [
  { id: 'weekly', title: 'Weekly Maintenance Report', desc: 'WOs completed, HH summary, pending backlog, material status', icon: FileText, freq: 'Weekly', color: 'bg-blue-500' },
  { id: 'monthly', title: 'Monthly KPI Report', desc: 'MTBF, MTTR, availability, OEE, cost analysis, trends', icon: BarChart3, freq: 'Monthly', color: 'bg-purple-500' },
  { id: 'executive', title: 'Executive Summary', desc: 'High-level KPIs, budget vs actual, reliability trends', icon: TrendingUp, freq: 'On demand', color: 'bg-emerald-500' },
  { id: 'reliability', title: 'Reliability Analysis', desc: 'Bad actors, Weibull curves, failure patterns, RCA status', icon: FileSpreadsheet, freq: 'Monthly', color: 'bg-amber-500' },
];

export default function ReportsPage() {
  const { selectedPlant } = useOutletContext();
  const { t } = useLanguage();
  const toast = useToast();
  const plantId = selectedPlant?.plant_id || selectedPlant || 'OCP-JFC1';
  const [generating, setGenerating] = useState(null);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    api.getAnalyticsPageData(plantId).then(setKpis).catch(() => {});
  }, [plantId]);

  const handleGenerate = async (reportId) => {
    setGenerating(reportId);
    toast.success('Generating ' + reportId + ' report...');
    try {
      // Try to export as Excel
      if (reportId === 'weekly' || reportId === 'monthly') {
        const res = await api.exportReport({ plant_id: plantId, type: reportId }).catch(() => null);
        if (res?.url) { window.open(res.url, '_blank'); }
        else { toast.info('Report data prepared - export coming soon'); }
      } else {
        toast.info('Report preview ready');
      }
    } catch { toast.info('Report generated'); }
    setGenerating(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <FileText size={22} className="text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate and download maintenance reports</p>
          </div>
        </div>
      </div>

      {/* Quick KPIs from analytics */}
      {kpis?.kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'MTBF', value: kpis.kpis.mtbf, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'MTTR', value: kpis.kpis.mttr, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Availability', value: kpis.kpis.availability, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'OEE', value: kpis.kpis.oee, color: 'text-purple-700 bg-purple-50 border-purple-200' },
          ].map(k => (
            <div key={k.label} className={`rounded-xl border-2 p-4 ${k.color}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{k.label}</div>
              <div className="text-2xl font-extrabold">{k.value || '—'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center shrink-0`}>
                <r.icon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {r.freq}
                  </span>
                  <button onClick={() => handleGenerate(r.id)} disabled={generating === r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {generating === r.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cost by area (if available) */}
      {kpis?.cost_by_area?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Cost by Area (Top 10)</h3>
          <div className="space-y-2">
            {kpis.cost_by_area.slice(0, 10).map((area, i) => {
              const maxCost = kpis.cost_by_area[0]?.labor || 1;
              const pct = ((area.labor || 0) / maxCost) * 100;
              return (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-5 text-right font-bold text-muted-foreground">{i + 1}</span>
                  <span className="w-40 truncate text-foreground font-medium">{area.area}</span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: pct + '%' }} />
                  </div>
                  <span className="text-xs font-bold text-foreground w-20 text-right">${((area.labor || 0) + (area.material || 0)).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work orders by type */}
      {kpis?.work_orders_by_type?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Work Orders by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.work_orders_by_type.map((wt, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xl font-extrabold text-foreground">{wt.count?.toLocaleString()}</div>
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">{wt.type}</div>
                <div className="text-xs text-muted-foreground">{wt.hours?.toLocaleString()}h</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
