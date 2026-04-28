import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  FileText, Download, Calendar, CheckCircle, Clock, Loader2,
  BarChart3, TrendingUp, FileSpreadsheet, RefreshCw, Printer,
  AlertTriangle, Target, Activity,
} from 'lucide-react';
import { openWeeklyDigest } from '../components/WeeklyDigest';
import {
  openPlanVsRealReport, openBadActorsReport, openAdherenceComplianceReport,
} from '../components/PerformanceReports';
// xlsx is dynamically imported in downloadExcel() to keep the 277KB lib out of the initial bundle

const REPORTS = [
  { id: 'weekly_digest', title: 'Weekly Operations Digest (PDF)', desc: 'Resumen ejecutivo 1 página: KPIs, flujo, top equipos, vencidas. Imprimible / Save as PDF.', icon: Printer, freq: 'Weekly', color: 'bg-emerald-600' },
  // Tanda C-EXT 2026-04-28: 3 reportes nuevos derivados de notificación HH + análisis cruzado
  { id: 'plan_vs_real', title: 'Plan vs Real (PDF)', desc: 'Desviación HH plan/real por operación · top 5 overruns / underruns · cobertura notificación. Para sprint review.', icon: Target, freq: 'On demand', color: 'bg-purple-600' },
  { id: 'bad_actors', title: 'Bad Actors — Fallas Recurrentes (PDF)', desc: 'Equipos con ≥3 fallas en el período · MTBF local · modos detectados · candidatos a estudio FMECA / RCA.', icon: AlertTriangle, freq: 'Monthly', color: 'bg-red-600' },
  { id: 'adherence', title: 'Adherencia + Cumplimiento (PDF)', desc: '4 KPIs supervisor: cumplimiento, adherencia, avisos atrasados, OTs atrasadas · histórico semanal.', icon: Activity, freq: 'Weekly', color: 'bg-amber-600' },
  { id: 'weekly', title: 'Weekly Maintenance Report (Excel)', desc: 'WOs completed, HH summary, pending backlog, material status', icon: FileText, freq: 'Weekly', color: 'bg-blue-500' },
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

  const downloadExcel = async (sheets, filename) => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    sheets.forEach(s => {
      const ws = XLSX.utils.json_to_sheet(s.data);
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });
    XLSX.writeFile(wb, filename);
  };

  const handleGenerate = async (reportId) => {
    setGenerating(reportId);
    try {
      const date = new Date().toISOString().slice(0, 10);
      if (reportId === 'weekly_digest') {
        const data = await api.getWeeklyDigest(plantId);
        openWeeklyDigest(data);
        toast.success('Weekly Digest abierto — usá el botón Imprimir / Guardar PDF');
        setGenerating(null);
        return;
      }
      // Tanda C-EXT 2026-04-28: 3 reportes nuevos derivados de la notificación HH
      if (reportId === 'plan_vs_real' || reportId === 'bad_actors' || reportId === 'adherence') {
        const [woRes, wrRes] = await Promise.all([
          api.listManagedWOs({ plant_id: plantId, limit: 500 }).catch(() => []),
          api.listWorkRequests({ plant_id: plantId }).catch(() => []),
        ]);
        const wos = Array.isArray(woRes) ? woRes : (woRes?.items || []);
        const wrs = Array.isArray(wrRes) ? wrRes : (wrRes?.items || []);
        const periodLabel = `Semana del ${date}`;

        if (reportId === 'plan_vs_real') {
          // Mismo cálculo que PerformanceAnalysis.jsx → planVsReal
          const stats = { totalPlannedHH: 0, totalActualHH: 0, opsCount: 0, opsNotified: 0, otsAnalyzed: 0 };
          const overruns = []; const underruns = [];
          wos.forEach(wo => {
            const ops = Array.isArray(wo.operations) ? wo.operations : [];
            if (ops.length === 0) return;
            stats.otsAnalyzed++;
            ops.forEach(op => {
              const planHH = (parseFloat(op.hours) || 0) * (parseInt(op.quantity) || 1);
              const actualHH = (parseFloat(op.actual_hours) || 0) * (parseInt(op.actual_quantity) || 0);
              stats.opsCount++;
              if (actualHH > 0) {
                stats.opsNotified++;
                stats.totalPlannedHH += planHH;
                stats.totalActualHH += actualHH;
                if (planHH > 0) {
                  const variance = (actualHH - planHH) / planHH;
                  if (variance > 0.25) overruns.push({ wo: wo.wo_number, op: op.description?.slice(0, 60), specialty: op.specialty, planHH, actualHH, variance });
                  if (variance < -0.4) underruns.push({ wo: wo.wo_number, op: op.description?.slice(0, 60), specialty: op.specialty, planHH, actualHH, variance, notes: op.notif_notes || '' });
                }
              }
            });
          });
          stats.avgVariancePct = stats.totalPlannedHH > 0 ? Math.round(((stats.totalActualHH - stats.totalPlannedHH) / stats.totalPlannedHH) * 100) : 0;
          stats.coveragePct = stats.opsCount > 0 ? Math.round((stats.opsNotified / stats.opsCount) * 100) : 0;
          openPlanVsRealReport({
            plant_id: plantId, period_label: periodLabel, stats,
            overruns: overruns.sort((a, b) => b.variance - a.variance).slice(0, 10),
            underruns: underruns.sort((a, b) => a.variance - b.variance).slice(0, 10),
          });
          toast.success('Plan vs Real abierto — Imprimir / Save as PDF');
          setGenerating(null);
          return;
        }
        if (reportId === 'bad_actors') {
          const byEquip = {};
          wrs.forEach(wr => {
            const tag = wr.equipment_tag || wr.equipment_name;
            if (!tag) return;
            if (!byEquip[tag]) byEquip[tag] = [];
            byEquip[tag].push({ date: wr.created_at, failure_mode: wr.failure_mode_detected || (wr.problem_description?.failure_category) || '', priority: wr.priority_code });
          });
          const equipments = Object.entries(byEquip)
            .filter(([, arr]) => arr.length >= 3)
            .map(([equipment, occurrences]) => {
              const sorted = [...occurrences].sort((a, b) => new Date(b.date) - new Date(a.date));
              const span = sorted.length >= 2 ? Math.round((new Date(sorted[0].date) - new Date(sorted[sorted.length - 1].date)) / 86400000) : 0;
              const modes = [...new Set(sorted.map(o => o.failure_mode).filter(Boolean))];
              return { equipment, count: occurrences.length, lastDate: sorted[0]?.date, span_days: span, modes: modes.slice(0, 3), mtbf_local: sorted.length >= 2 ? Math.round(span / (sorted.length - 1)) : null };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
          openBadActorsReport({ plant_id: plantId, period_label: periodLabel, equipments });
          toast.success('Bad Actors abierto — Imprimir / Save as PDF');
          setGenerating(null);
          return;
        }
        if (reportId === 'adherence') {
          // KPIs del período actual
          const closed = wos.filter(w => w.status === 'CERRADO');
          const planned = wos.filter(w => ['EN_EJECUCION', 'COMPLETADO', 'CERRADO'].includes(w.status));
          const totalPlanHH = planned.reduce((s, w) => s + (parseFloat(w.estimated_hours) || 0), 0);
          const totalRealHH = planned.reduce((s, w) => s + (parseFloat(w.actual_hours) || 0), 0);
          const cumplimiento = totalPlanHH > 0 ? Math.round((totalRealHH / totalPlanHH) * 100) : 0;
          const adherentes = closed.filter(w => {
            if (!w.planned_start || !w.actual_start) return false;
            return String(w.planned_start).slice(0, 10) === String(w.actual_start).slice(0, 10);
          }).length;
          const adherencia = closed.length > 0 ? Math.round((adherentes / closed.length) * 100) : 0;
          const now = Date.now();
          const avisosAtrasados = wrs.filter(wr => {
            if (wr.status !== 'PENDIENTE' || !wr.created_at) return false;
            const age = (now - new Date(wr.created_at).getTime()) / (1000 * 60 * 60);
            return age > 24;
          }).length;
          const otsAtrasadas = wos.filter(w => {
            if (!w.planned_end || !['EN_EJECUCION', 'COMPLETADO'].includes(w.status)) return false;
            const overdue = (now - new Date(w.planned_end).getTime()) / (1000 * 60 * 60);
            return overdue > 24;
          }).length;
          // Histórico semanal últimos 8 weeks (aprox usando created_at)
          const weeklyMap = {};
          wos.forEach(w => {
            if (!w.created_at) return;
            const d = new Date(w.created_at);
            const week = `${d.getFullYear()}-W${String(Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0')}`;
            if (!weeklyMap[week]) weeklyMap[week] = { week, programadas: 0, cerradas: 0, hh_plan: 0, hh_real: 0, adherentes: 0 };
            const ww = weeklyMap[week];
            ww.programadas++;
            ww.hh_plan += parseFloat(w.estimated_hours) || 0;
            if (w.status === 'CERRADO') {
              ww.cerradas++;
              ww.hh_real += parseFloat(w.actual_hours) || 0;
              if (w.planned_start && w.actual_start && String(w.planned_start).slice(0, 10) === String(w.actual_start).slice(0, 10)) ww.adherentes++;
            }
          });
          const weekly_history = Object.values(weeklyMap)
            .sort((a, b) => a.week.localeCompare(b.week))
            .slice(-8)
            .map(w => ({
              week: w.week,
              cumplimiento_pct: w.hh_plan > 0 ? Math.round((w.hh_real / w.hh_plan) * 100) : 0,
              adherencia_pct: w.cerradas > 0 ? Math.round((w.adherentes / w.cerradas) * 100) : 0,
              hh_plan: Math.round(w.hh_plan),
              hh_real: Math.round(w.hh_real),
              hh_var_pct: w.hh_plan > 0 ? Math.round(((w.hh_real - w.hh_plan) / w.hh_plan) * 100) : 0,
              cerradas: w.cerradas,
              programadas: w.programadas,
            }));
          // Top offenders: OTs cerradas con mayor delay días
          const top_offenders = closed
            .filter(w => w.planned_start && w.actual_start)
            .map(w => ({
              wo_number: w.wo_number,
              equipment_tag: w.equipment_tag,
              priority: w.priority_code,
              days_late: Math.round((new Date(w.actual_start) - new Date(w.planned_start)) / 86400000),
              reason: w.reschedule_reason || '',
            }))
            .filter(o => o.days_late > 0)
            .sort((a, b) => b.days_late - a.days_late)
            .slice(0, 8);
          openAdherenceComplianceReport({
            plant_id: plantId, period_label: periodLabel,
            kpis: {
              cumplimiento_pct: cumplimiento, adherencia_pct: adherencia,
              hh_plan: Math.round(totalPlanHH), hh_real: Math.round(totalRealHH),
              adherentes, cerradas_total: closed.length,
              avisos_atrasados: avisosAtrasados, ots_atrasadas: otsAtrasadas,
            },
            weekly_history,
            top_offenders,
          });
          toast.success('Adherencia + Cumplimiento abierto — Imprimir / Save as PDF');
          setGenerating(null);
          return;
        }
      }
      if (!kpis) { toast.error('No data loaded'); setGenerating(null); return; }
      if (reportId === 'weekly') {
        const woData = await api.listManagedWOs({ plant_id: plantId, limit: 200 }).catch(() => []);
        const wos = Array.isArray(woData) ? woData : [];
        downloadExcel([
          { name: 'KPIs', data: [{ MTBF: kpis.kpis?.mtbf, MTTR: kpis.kpis?.mttr, Availability: kpis.kpis?.availability, OEE: kpis.kpis?.oee, Plant: plantId, Date: date }] },
          { name: 'Work Orders', data: wos.map(w => ({ WO: w.wo_number, Equipment: w.equipment_tag, Status: w.status, Priority: w.priority_code, Type: w.wo_type, Planned_Hours: w.estimated_hours, Actual_Hours: w.actual_hours || 0, Start: w.planned_start, End: w.planned_end })) },
          { name: 'Cost by Area', data: (kpis.cost_by_area || []).map(a => ({ Area: a.area, Labor: a.labor, Material: a.material, Total: (a.labor || 0) + (a.material || 0) })) },
        ], `MagEAM_Weekly_${plantId}_${date}.xlsx`);
        toast.success('Weekly report downloaded');
      } else if (reportId === 'monthly') {
        downloadExcel([
          { name: 'KPIs', data: [{ MTBF: kpis.kpis?.mtbf, MTTR: kpis.kpis?.mttr, Availability: kpis.kpis?.availability, OEE: kpis.kpis?.oee }] },
          { name: 'KPI History', data: kpis.kpi_history || [] },
          { name: 'WO by Type', data: kpis.work_orders_by_type || [] },
          { name: 'Cost by Area', data: (kpis.cost_by_area || []).map(a => ({ Area: a.area, Labor: a.labor, Material: a.material })) },
        ], `MagEAM_Monthly_${plantId}_${date}.xlsx`);
        toast.success('Monthly report downloaded');
      } else if (reportId === 'executive') {
        downloadExcel([
          { name: 'Executive KPIs', data: [{ MTBF: kpis.kpis?.mtbf, MTTR: kpis.kpis?.mttr, Availability: kpis.kpis?.availability, OEE: kpis.kpis?.oee, Plant: plantId }] },
          { name: 'Cost Summary', data: (kpis.cost_by_area || []).slice(0, 15).map(a => ({ Area: a.area, Labor: a.labor, Material: a.material, Total: (a.labor || 0) + (a.material || 0) })) },
        ], `MagEAM_Executive_${plantId}_${date}.xlsx`);
        toast.success('Executive report downloaded');
      } else if (reportId === 'reliability') {
        downloadExcel([
          { name: 'Equipment Reliability', data: (kpis.reliability_kpis || []).slice(0, 100).map(r => ({ Equipment: r.equipment_tag, Name: r.equipment_name, MTBF: r.mtbf, MTTR: r.mttr, Availability: r.availability, OEE: r.oee, Trend: r.trend })) },
        ], `MagEAM_Reliability_${plantId}_${date}.xlsx`);
        toast.success('Reliability report downloaded');
      }
    } catch (e) { toast.error('Error: ' + (e.message || '')); }
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
