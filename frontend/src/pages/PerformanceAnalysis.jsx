import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import {
  TrendingUp, BarChart3, Clock, CheckCircle2, AlertTriangle,
  Users, Calendar, RefreshCw, Plus, ArrowRight, Target, Zap,
  FileText, Loader2
} from 'lucide-react';

const KPI_COLORS = { good: '#059669', warning: '#D97706', bad: '#DC2626' };
const PIE_COLORS = ['#059669', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function KpiCard({ label, value, unit, icon: Icon, trend, target, color = 'emerald' }) {
  const met = target != null && parseFloat(value) >= target;
  return (
    <div className={`bg-white rounded-xl border p-4 ${target != null && !met ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={`text-${color}-600`} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {target != null && (
        <div className="flex items-center gap-1 mt-1">
          <Target size={10} className={met ? 'text-emerald-500' : 'text-amber-500'} />
          <span className={`text-xs ${met ? 'text-emerald-600' : 'text-amber-600'}`}>
            Meta: {target}{unit || ''}
          </span>
        </div>
      )}
      {trend && <span className="text-xs text-gray-400 mt-1">{trend}</span>}
    </div>
  );
}

export default function PerformanceAnalysis({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [wos, setWos] = useState([]);
  const [wrs, setWrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [improvementActions, setImprovementActions] = useState([]);
  const [creatingAction, setCreatingAction] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    attendees: '',
    notes: '',
    decisions: '',
  });

  const [backendKpis, setBackendKpis] = useState(null);
  // SF-589 stock forecast (cargado al montar la página)
  const [stockForecastData, setStockForecastData] = useState(null);
  // SF-588 cost analysis por UT + cost element
  const [costAnalysisData, setCostAnalysisData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  // Jorge 2026-04-28 17:56: Bad Actors deben cruzarse con lista de equipos críticos.
  // Mapa equipment_tag → criticality (A/B/C/D) leído desde hierarchy_nodes.
  const [criticalityMap, setCriticalityMap] = useState({});
  // Jigsaw Excel import (Jorge transcript 2026-04-29 13:44 línea 305-307:
  // "hay que tomarlo y hacer que el sistema ocupe la teoría, incluso puede usar
  //  la data que está ahí, y hay data y excel con datos, para que corra los paretos")
  const [importedJigsaw, setImportedJigsaw] = useState(null);
  const [importingJigsaw, setImportingJigsaw] = useState(false);
  const [importJigsawError, setImportJigsawError] = useState(null);
  // #18 — NLP real con Claude (no regex)
  const [aiNoncompliance, setAiNoncompliance] = useState(null);
  const [aiNoncomplianceLoading, setAiNoncomplianceLoading] = useState(false);
  // #14 — Claude analiza chronic failures
  const [aiChronic, setAiChronic] = useState(null);
  // #19 — Claude OC recommendations
  const [aiOCRecs, setAiOCRecs] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.listManagedWOs({ plant_id: plant, limit: 500 }),
      api.listWorkRequests({ plant_id: plant }),
      api.listPMReviews({ plant_id: plant }),
      api.listImprovementActions({ plant_id: plant }),
      api.getWorkManagementKpis(plant),
      api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT', limit: 1000 }),
    ]).then(([woRes, wrRes, revRes, iaRes, kpiRes, nodesRes]) => {
      const parse = r => r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : r.value?.items || []) : [];
      setWos(parse(woRes));
      setWrs(parse(wrRes));
      setReviews(parse(revRes));
      setImprovementActions(parse(iaRes));
      if (kpiRes.status === 'fulfilled' && kpiRes.value) setBackendKpis(kpiRes.value);
      // Mapa equip_tag → criticality
      const nodes = parse(nodesRes);
      const map = {};
      nodes.forEach(n => {
        const tag = n.tag || n.code;
        if (tag) map[tag] = (n.criticality || 'D').toUpperCase();
      });
      setCriticalityMap(map);
      setLoading(false);
    });
    // SF-589: stock forecast en paralelo (no bloquea loading)
    api.stockForecast({ plant_id: plant, lookback_days: 90, horizon_days: 60 })
      .then(res => {
        setStockForecastData(res);
        // #19 — disparar Claude OC recommend con el forecast resultante
        const items = (res?.items || res?.forecast || []);
        if (items.length > 0) {
          api.recommendStockOC({ forecast: items, plant_id: plant })
            .then(setAiOCRecs).catch(() => setAiOCRecs(null));
        }
      })
      .catch(() => setStockForecastData(null));
    // SF-588: cost analysis jerárquico
    api.costAnalysis({ plant_id: plant })
      .then(res => setCostAnalysisData(res))
      .catch(() => setCostAnalysisData(null));
  }, [plant]);

  // ── KPI Calculations — prefer backend when available ──
  const kpis = useMemo(() => {
    const bk = backendKpis;
    const completed = wos.filter(w => ['COMPLETED', 'CLOSED'].includes(w.status));
    const total = bk?.total_wos || wos.length;

    // MTBF from backend MTBM or local calculation
    let mtbf = bk?.mtbm_days || 0;
    if (!mtbf) {
      const failuresByEquip = {};
      wrs.filter(w => w.equipment_tag).forEach(wr => {
        if (!failuresByEquip[wr.equipment_tag]) failuresByEquip[wr.equipment_tag] = [];
        failuresByEquip[wr.equipment_tag].push(new Date(wr.created_at || Date.now()));
      });
      let mtbfDays = 0, mtbfCount = 0;
      Object.values(failuresByEquip).forEach(dates => {
        if (dates.length < 2) return;
        dates.sort((a, b) => a - b);
        for (let i = 1; i < dates.length; i++) { mtbfDays += (dates[i] - dates[i - 1]) / 86400000; mtbfCount++; }
      });
      mtbf = mtbfCount > 0 ? Math.round(mtbfDays / mtbfCount) : 0;
    }

    // MTTR
    const completedHours = completed.reduce((s, w) => s + (w.actual_hours || w.estimated_hours || 0), 0);
    const mttr = completed.length > 0 ? (completedHours / completed.length).toFixed(1) : 0;

    // Schedule compliance from backend or local
    const compliance = bk?.schedule_compliance ?? (() => {
      const onTime = completed.filter(w => { if (!w.planned_end || !w.completed_at) return true; return new Date(w.completed_at) <= new Date(w.planned_end); }).length;
      return completed.length > 0 ? Math.round((onTime / completed.length) * 100) : 0;
    })();

    // PM Compliance (local — backend doesn't split by type)
    const pmOrders = wos.filter(w => w.wo_type === 'PM02' || w.wo_type === 'PREVENTIVO');
    const pmCompleted = pmOrders.filter(w => ['COMPLETED', 'CLOSED'].includes(w.status)).length;
    const pmCompliance = pmOrders.length > 0 ? Math.round((pmCompleted / pmOrders.length) * 100) : 0;

    // Backlog
    const backlogHours = bk?.backlog_hours ?? wos.filter(w => !['COMPLETED', 'CLOSED'].includes(w.status)).reduce((s, w) => s + (w.estimated_hours || 0), 0);

    // Availability
    const unplannedPct = bk?.unplanned_pct ?? 0;
    const availability = unplannedPct > 0 ? Math.max(0, Math.round(100 - unplannedPct)) : (() => {
      const unplannedHours = wos.filter(w => w.is_fast_track || w.wo_type === 'PM01').reduce((s, w) => s + (w.actual_hours || w.estimated_hours || 0), 0);
      return Math.max(0, Math.min(100, Math.round((1 - unplannedHours / (30 * 24)) * 100)));
    })();

    // Cost
    const avgCost = bk?.costo_total && (bk.completed_wos || completed.length)
      ? Math.round(bk.costo_total / (bk.completed_wos || completed.length))
      : completed.length > 0 ? Math.round(completedHours * 45 / completed.length) : 0;

    return {
      mtbf, mttr, availability, compliance, pmCompliance, backlogHours, avgCost,
      total, completed: bk?.completed_wos || completed.length,
      // Extra from backend
      scheduleAdherence: bk?.schedule_adherence ?? null,
      unplannedPct: bk?.unplanned_pct ?? null,
      workforceUtil: bk?.workforce_utilization ?? null,
      costoVariance: bk?.costo_variance_pct ?? null,
    };
  }, [wos, wrs, backendKpis]);

  // ── Chart Data ──
  const typeDistribution = useMemo(() => {
    const counts = {};
    wos.forEach(w => { const t = w.wo_type || 'OTHER'; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [wos]);

  const monthlyTrend = useMemo(() => {
    const months = {};
    wos.forEach(w => {
      const m = (w.created_at || '').slice(0, 7);
      if (!m) return;
      if (!months[m]) months[m] = { month: m, planned: 0, completed: 0, unplanned: 0 };
      months[m].planned++;
      if (['COMPLETED', 'CLOSED'].includes(w.status)) months[m].completed++;
      if (w.is_fast_track || w.wo_type === 'PM01') months[m].unplanned++;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [wos]);

  const topEquipment = useMemo(() => {
    const counts = {};
    wrs.forEach(wr => {
      const tag = wr.equipment_tag || wr.equipment_name || 'Unknown';
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([equipment, count]) => ({ equipment, count }));
  }, [wrs]);

  // Tanda C-EXT post-meeting 2026-04-28 12:32: Jorge dijo que el análisis
  // tiene que cruzar fallas con datos reales de notificación (HH plan vs real
  // por op) y detectar repetición de fallas en el mismo equipo.

  // ── Fallas recurrentes (bad actors) ──
  const recurringFailures = useMemo(() => {
    const byEquip = {};
    wrs.forEach(wr => {
      const tag = wr.equipment_tag || wr.equipment_name;
      if (!tag) return;
      if (!byEquip[tag]) byEquip[tag] = [];
      byEquip[tag].push({
        date: wr.created_at,
        failure_mode: wr.failure_mode_detected || (wr.problem_description?.failure_category) || '',
        priority: wr.priority_code,
      });
    });
    // Jorge 2026-04-28 17:56: cruce con criticidad. Equipos críticos (A/B) tienen
    // threshold más bajo (≥2 fallas) y se priorizan en el ranking; no-críticos
    // siguen con ≥3. Sort: críticos primero, luego por count.
    const CRIT_PRIORITY = { A: 4, B: 3, C: 2, D: 1 };
    return Object.entries(byEquip)
      .map(([equipment, occurrences]) => {
        const crit = criticalityMap[equipment] || 'D';
        const minOccurrences = (crit === 'A' || crit === 'B') ? 2 : 3;
        return { equipment, occurrences, crit, minOccurrences };
      })
      .filter(({ occurrences, minOccurrences }) => occurrences.length >= minOccurrences)
      .map(({ equipment, occurrences, crit }) => {
        const sorted = [...occurrences].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sorted[0]?.date;
        const span = sorted.length >= 2
          ? Math.round((new Date(sorted[0].date) - new Date(sorted[sorted.length - 1].date)) / 86400000)
          : 0;
        const modes = [...new Set(sorted.map(o => o.failure_mode).filter(Boolean))];
        return {
          equipment,
          criticality: crit,
          isCritical: ['A', 'B'].includes(crit),
          count: occurrences.length,
          lastDate: last,
          span_days: span,
          modes: modes.slice(0, 3),
          mtbf_local: sorted.length >= 2 ? Math.round(span / (sorted.length - 1)) : null,
        };
      })
      // Críticos primero (mayor prioridad), luego por count desc
      .sort((a, b) => {
        const da = (CRIT_PRIORITY[b.criticality] || 0) - (CRIT_PRIORITY[a.criticality] || 0);
        if (da !== 0) return da;
        return b.count - a.count;
      })
      .slice(0, 12);
  }, [wrs, criticalityMap]);

  // ── Retrabajos / Reprocesos (Jorge 2026-04-28 17:56) ──
  // Detecta cuándo un equipo entró a mantenimiento (CERRADO) y volvió a fallar
  // (nuevo WR creado) en <24h. Indica problema de calidad de la intervención.
  const reworkEvents = useMemo(() => {
    const events = [];
    // Mapear OTs cerradas por equipo, ordenadas por fecha
    const closedByEquip = {};
    wos.filter(w => w.status === 'CERRADO' && w.equipment_tag && (w.actual_end || w.closed_at))
      .forEach(w => {
        const tag = w.equipment_tag;
        if (!closedByEquip[tag]) closedByEquip[tag] = [];
        closedByEquip[tag].push({ wo: w, end: new Date(w.actual_end || w.closed_at) });
      });
    Object.values(closedByEquip).forEach(arr => arr.sort((a, b) => a.end - b.end));

    // Por cada WR, ver si hay una OT cerrada del mismo equipo en las 24h previas
    wrs.forEach(wr => {
      if (!wr.equipment_tag || !wr.created_at) return;
      const wrDate = new Date(wr.created_at);
      const closedList = closedByEquip[wr.equipment_tag] || [];
      const recentClose = closedList.find(c => {
        const diffH = (wrDate - c.end) / 3600000;
        return diffH > 0 && diffH <= 24;
      });
      if (recentClose) {
        events.push({
          equipment: wr.equipment_tag,
          previous_wo: recentClose.wo.wo_number,
          previous_closed: recentClose.end,
          new_wr: wr.request_id || wr.id,
          new_wr_date: wrDate,
          hours_gap: Math.round((wrDate - recentClose.end) / 3600000 * 10) / 10,
          new_priority: wr.priority_code,
          previous_description: (recentClose.wo.description || '').slice(0, 80),
          new_description: ((wr.problem_description?.original_text || wr.problem_description) || '').toString().slice(0, 80),
        });
      }
    });
    return events.sort((a, b) => b.new_wr_date - a.new_wr_date).slice(0, 15);
  }, [wos, wrs]);

  // ── Pareto de modos de falla (Jorge 2026-04-29 13:44 + 04-28 17:56) ──
  // 80/20: qué pocos modos generan la mayoría de las fallas. Variantes:
  //   - byCount: frecuencia (cantidad de avisos)
  //   - byHours: tiempo total (HH actual de OTs cerradas asociadas) — Jorge insistió
  //     "el dato puede ser frecuencia o tiempo de detención"
  // Cruce con avisos: ¿los avisos que generamos están en los sistemas del 80%?
  const failureModePareto = useMemo(() => {
    const counts = {};
    const hours = {};
    wrs.forEach(wr => {
      const mode = (wr.ai_classification?.failure_type
                  || wr.ai_classification?.failure_class
                  || wr.failure_mode_detected
                  || wr.problem_description?.failure_category
                  || '').trim();
      if (!mode) return;
      counts[mode] = (counts[mode] || 0) + 1;
      // Acumular HH de OTs derivadas (cuando WR ya tiene wo_id linkeada)
      const linkedWO = wos.find(w => w.work_request_id === wr.request_id);
      if (linkedWO) {
        hours[mode] = (hours[mode] || 0) + (parseFloat(linkedWO.actual_hours || linkedWO.estimated_hours) || 0);
      }
    });
    const buildPareto = (data) => {
      const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
      let cumPct = 0;
      return sorted.slice(0, 10).map(([mode, value]) => {
        const pct = Math.round(value / total * 1000) / 10; // 1 decimal
        cumPct = Math.min(100, cumPct + pct);
        return { mode, value: Math.round(value * 10) / 10, pct, cumPct: Math.round(cumPct * 10) / 10, inTop80: cumPct <= 80 };
      });
    };
    return {
      byCount: buildPareto(counts).map(p => ({ ...p, count: p.value })),
      byHours: buildPareto(hours).map(p => ({ ...p, hours: p.value })),
    };
  }, [wrs, wos]);

  // ── Fallas crónicas (Jorge 2026-04-28 17:56) ──
  // "Si tienes 5 cambios de la misma pieza en una semana, eso puede ser un indicio
  //  de falla crónica". Detector: agrupar WRs por equipo + parte_objeto/failure_mode
  // y contar repeticiones en ventana 7 días.
  const chronicFailures = useMemo(() => {
    const WINDOW_DAYS = 7;
    const groups = {};
    wrs.forEach(wr => {
      const tag = wr.equipment_tag;
      const partObj = (wr.ai_classification?.part_object
                    || wr.ai_classification?.failure_type
                    || wr.failure_mode_detected
                    || wr.problem_description?.failure_category
                    || '').trim();
      if (!tag || !partObj) return;
      const key = `${tag}::${partObj}`;
      if (!groups[key]) groups[key] = { tag, partObj, dates: [] };
      groups[key].dates.push(new Date(wr.created_at || 0));
    });
    const chronic = [];
    Object.values(groups).forEach(g => {
      if (g.dates.length < 3) return;
      g.dates.sort((a, b) => a - b);
      // Sliding window: ¿hay ≥3 repeticiones en 7 días?
      for (let i = 0; i < g.dates.length - 2; i++) {
        const inWindow = g.dates.slice(i).filter(d => (d - g.dates[i]) / 86400000 <= WINDOW_DAYS);
        if (inWindow.length >= 3) {
          chronic.push({
            equipment: g.tag,
            criticality: criticalityMap[g.tag] || 'D',
            failure_mode: g.partObj,
            count_in_window: inWindow.length,
            total_count: g.dates.length,
            window_start: inWindow[0],
            window_end: inWindow[inWindow.length - 1],
          });
          break;
        }
      }
    });
    return chronic.sort((a, b) => b.count_in_window - a.count_in_window).slice(0, 10);
  }, [wrs, criticalityMap]);

  // #14 — Llamar a Claude para causa raíz cuando hay clusters detectados
  useEffect(() => {
    if (!chronicFailures.length) { setAiChronic(null); return; }
    const payload = chronicFailures.slice(0, 5).map(c => {
      const sampleWrs = wrs.filter(w => w.equipment_tag === c.equipment).slice(0, 2);
      return {
        equipment: c.equipment,
        failure_mode: c.failure_mode,
        count_in_window: c.count_in_window,
        total_count: c.total_count,
        sample_descriptions: sampleWrs.map(w => (w.problem_description?.original_text || w.failure_description || '').slice(0, 120)).filter(Boolean),
      };
    });
    api.analyzeChronicFailures({ clusters: payload, plant_id: plant })
      .then(setAiChronic).catch(() => setAiChronic(null));
  }, [chronicFailures.length, wrs.length, plant]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Prioridades mal asignadas (Jorge 2026-04-28 17:56) ──
  // P1 sin atender en >24h, P2 sin atender en >7d, P3 cerrado en <2h (sub-priorizado),
  // P4 sin esperar parada de planta. La IA detecta inconsistencias.
  const priorityMismatches = useMemo(() => {
    const mismatches = [];
    const now = new Date();
    wrs.forEach(wr => {
      const created = new Date(wr.created_at || 0);
      const ageHours = (now - created) / 3600000;
      const status = wr.status;
      const pri = wr.priority_code;
      // P1 abierto >24h
      if (pri === 'P1' && ageHours > 24 && !['CERRADO', 'CANCELADO', 'OT_CREADA'].includes(status)) {
        mismatches.push({
          aviso: wr.aviso_number ? `AV-${String(wr.aviso_number).padStart(5, '0')}` : (wr.request_id || '').slice(0, 8),
          equipment: wr.equipment_tag,
          actual_priority: pri,
          issue: `P1 abierto ${Math.round(ageHours)}h (debería atenderse en <24h)`,
          severity: 'high',
          suggestion: 'Escalar al supervisor o reclasificar si ya no es P1',
        });
      }
      // P2 abierto >7d
      if (pri === 'P2' && ageHours > 168 && !['CERRADO', 'CANCELADO', 'OT_CREADA'].includes(status)) {
        mismatches.push({
          aviso: wr.aviso_number ? `AV-${String(wr.aviso_number).padStart(5, '0')}` : (wr.request_id || '').slice(0, 8),
          equipment: wr.equipment_tag,
          actual_priority: pri,
          issue: `P2 abierto ${Math.round(ageHours/24)}d (debería atenderse en <7d)`,
          severity: 'medium',
          suggestion: 'Reclasificar a P3 o escalar urgencia',
        });
      }
    });
    // OTs con prioridad inconsistente con production_impact AI
    wos.forEach(wo => {
      const aiImpact = wo.production_impact || '';
      if (aiImpact === 'HIGH' && wo.priority_code === 'P3') {
        mismatches.push({
          aviso: wo.wo_number,
          equipment: wo.equipment_tag,
          actual_priority: wo.priority_code,
          issue: `Production impact HIGH pero prioridad P3`,
          severity: 'medium',
          suggestion: 'Considerar elevar a P2',
        });
      }
      if (aiImpact === 'LOW' && wo.priority_code === 'P1') {
        mismatches.push({
          aviso: wo.wo_number,
          equipment: wo.equipment_tag,
          actual_priority: wo.priority_code,
          issue: `Production impact LOW pero P1 (recurso elevado)`,
          severity: 'low',
          suggestion: 'Reclasificar a P3 si no hay riesgo de producción',
        });
      }
    });
    return mismatches.slice(0, 15);
  }, [wrs, wos]);

  // ── KPIs de Disciplina + Tiempos entre estados (Jorge 2026-04-28 17:56) ──
  // Tiempo promedio: WR creado → revisado supervisor → OT → cerrado.
  const disciplineKpis = useMemo(() => {
    const stats = {
      avg_wr_to_approve_h: 0,
      avg_approve_to_ot_h: 0,
      avg_planned_to_scheduled_h: 0,
      avg_scheduled_to_executed_h: 0,
      avg_ot_lifecycle_d: 0,
      wrs_with_data: 0,
      wos_with_data: 0,
      // Jorge SF-585: identificación de outliers (>2σ)
      wr_outliers: [],
      wo_outliers: [],
      wr_threshold_h: 0,
      wo_threshold_d: 0,
    };
    const wrApproveDeltas = [];
    const wrApproveMap = []; // [{ wr, dt_h }]
    wrs.forEach(wr => {
      if (wr.created_at && wr.approved_at) {
        const dt = (new Date(wr.approved_at) - new Date(wr.created_at)) / 3600000;
        if (dt >= 0 && dt < 720) {
          wrApproveDeltas.push(dt);
          wrApproveMap.push({ wr, dt });
        }
      }
    });
    if (wrApproveDeltas.length > 0) {
      const avg = wrApproveDeltas.reduce((a, b) => a + b, 0) / wrApproveDeltas.length;
      const variance = wrApproveDeltas.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / wrApproveDeltas.length;
      const stdev = Math.sqrt(variance);
      const threshold = avg + 2 * stdev;
      stats.avg_wr_to_approve_h = Math.round(avg * 10) / 10;
      stats.wrs_with_data = wrApproveDeltas.length;
      stats.wr_threshold_h = Math.round(threshold * 10) / 10;
      stats.wr_outliers = wrApproveMap
        .filter(m => m.dt > threshold)
        .sort((a, b) => b.dt - a.dt)
        .slice(0, 8)
        .map(m => ({
          aviso: m.wr.aviso_number ? `AV-${String(m.wr.aviso_number).padStart(5, '0')}` : (m.wr.request_id || '').slice(0, 8),
          request_id: m.wr.request_id || m.wr.id,
          equipment: m.wr.equipment_tag,
          priority: m.wr.priority_code,
          dt_h: Math.round(m.dt * 10) / 10,
          deviation_x: Math.round((m.dt - avg) / stdev * 10) / 10,
        }));
    }
    const woDeltas = [];
    const woMap = [];
    wos.forEach(wo => {
      if (wo.created_at && wo.actual_end) {
        const dt = (new Date(wo.actual_end) - new Date(wo.created_at)) / 86400000;
        if (dt >= 0 && dt < 365) {
          woDeltas.push(dt);
          woMap.push({ wo, dt });
        }
      }
    });
    if (woDeltas.length > 0) {
      const avg = woDeltas.reduce((a, b) => a + b, 0) / woDeltas.length;
      const variance = woDeltas.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / woDeltas.length;
      const stdev = Math.sqrt(variance);
      const threshold = avg + 2 * stdev;
      stats.avg_ot_lifecycle_d = Math.round(avg * 10) / 10;
      stats.wos_with_data = woDeltas.length;
      stats.wo_threshold_d = Math.round(threshold * 10) / 10;
      stats.wo_outliers = woMap
        .filter(m => m.dt > threshold)
        .sort((a, b) => b.dt - a.dt)
        .slice(0, 8)
        .map(m => ({
          wo_number: m.wo.wo_number,
          wo_id: m.wo.wo_id,
          equipment: m.wo.equipment_tag,
          priority: m.wo.priority_code,
          dt_d: Math.round(m.dt * 10) / 10,
          deviation_x: Math.round((m.dt - avg) / stdev * 10) / 10,
        }));
    }
    return stats;
  }, [wrs, wos]);

  // ── KPIs de Resultados por equipo (Jorge 2026-04-28 17:56) ──
  // MTBF = horas operativas / # fallas. MTTR = horas reparación / # reparaciones.
  // Disponibilidad = MTBF / (MTBF + MTTR) * 100.
  // Período: 30 días (analizado a partir del WR/WO más reciente disponible).
  const equipmentResultsKpis = useMemo(() => {
    const PERIOD_DAYS = 30;
    const PERIOD_HOURS = PERIOD_DAYS * 24;
    const now = new Date();
    const cutoff = new Date(now - PERIOD_DAYS * 86400000);
    const byEq = {};
    // Fallas (PM03) y reparaciones cerradas
    wos.forEach(w => {
      if (!w.equipment_tag) return;
      const created = new Date(w.created_at || 0);
      if (created < cutoff) return;
      const tag = w.equipment_tag;
      if (!byEq[tag]) byEq[tag] = { failures: 0, repair_hours: 0, repairs_count: 0 };
      // Falla = PM03 (correctivo no programado)
      if (w.wo_type === 'PM03' || ['P1', 'P2'].includes(w.priority_code)) {
        byEq[tag].failures++;
      }
      // Reparación cerrada con HH real
      if (w.status === 'CERRADO' && (w.actual_hours || 0) > 0) {
        byEq[tag].repair_hours += parseFloat(w.actual_hours) || 0;
        byEq[tag].repairs_count++;
      }
    });
    return Object.entries(byEq)
      .map(([tag, m]) => {
        const mttr = m.repairs_count > 0 ? m.repair_hours / m.repairs_count : 0;
        const totalDowntime = m.repair_hours;
        const uptime = Math.max(0, PERIOD_HOURS - totalDowntime);
        const mtbf = m.failures > 0 ? uptime / m.failures : null;
        const availability = (mtbf && mttr >= 0) ? (mtbf / (mtbf + mttr) * 100) : (m.failures === 0 ? 100 : null);
        return {
          equipment: tag,
          criticality: criticalityMap[tag] || 'D',
          failures: m.failures,
          mttr: Math.round(mttr * 10) / 10,
          mtbf: mtbf ? Math.round(mtbf * 10) / 10 : null,
          availability: availability ? Math.round(availability * 10) / 10 : null,
        };
      })
      .filter(r => r.failures > 0 || r.mttr > 0)
      .sort((a, b) => {
        // críticos primero, luego por menor disponibilidad
        const ca = (['A', 'B'].includes(a.criticality) ? 1 : 0);
        const cb = (['A', 'B'].includes(b.criticality) ? 1 : 0);
        if (ca !== cb) return cb - ca;
        return (a.availability ?? 100) - (b.availability ?? 100);
      })
      .slice(0, 15);
  }, [wos, criticalityMap]);

  // ── Correlación reliability ↔ avisos (Jorge SF-586) ──
  // "la IA valida si un equipo con baja confiabilidad tiene correlación directa
  //  con el volumen de avisos o la duración de las paradas".
  // Cruza equipmentResultsKpis (Disp/MTBF/MTTR) con count de WRs por equipo.
  const reliabilityAvisoCorrelation = useMemo(() => {
    const wrsByEq = {};
    wrs.forEach(wr => {
      const t = wr.equipment_tag;
      if (!t) return;
      wrsByEq[t] = (wrsByEq[t] || 0) + 1;
    });
    const avg_avisos = Object.values(wrsByEq).reduce((s, v) => s + v, 0) / (Object.keys(wrsByEq).length || 1);
    const insights = [];
    equipmentResultsKpis.forEach(eq => {
      const avisos = wrsByEq[eq.equipment] || 0;
      // Insight: baja disponibilidad (<90%) + muchos avisos (>avg) → consistente
      // baja disp + pocos avisos → inconsistencia (¿paradas no reportadas?)
      // alta disp + muchos avisos → ruido (¿avisos triviales?)
      let kind = null;
      let severity = 'info';
      let message = '';
      if (eq.availability != null && eq.availability < 90 && avisos > avg_avisos * 1.5) {
        kind = 'consistent_bad';
        severity = 'high';
        message = `Baja disponibilidad (${eq.availability}%) + ${avisos} avisos (${Math.round(avisos / avg_avisos * 100)}% del promedio) → consistente. Priorizar RCA.`;
      } else if (eq.availability != null && eq.availability < 90 && avisos < avg_avisos * 0.5) {
        kind = 'unreported';
        severity = 'medium';
        message = `Baja disponibilidad (${eq.availability}%) PERO sólo ${avisos} avisos. ¿Paradas no reportadas en avisos? Verificar disciplina.`;
      } else if (eq.availability != null && eq.availability >= 95 && avisos > avg_avisos * 2) {
        kind = 'noise';
        severity = 'low';
        message = `Alta disponibilidad (${eq.availability}%) PERO ${avisos} avisos. ¿Avisos triviales o duplicados? Revisar dedup.`;
      } else if (eq.mtbf != null && eq.mtbf < 100 && avisos > 3) {
        kind = 'short_mtbf';
        severity = 'high';
        message = `MTBF muy bajo (${eq.mtbf}h) + ${avisos} avisos. Equipo crítico en deterioro acelerado.`;
      }
      if (kind) {
        insights.push({
          equipment: eq.equipment,
          criticality: eq.criticality,
          availability: eq.availability,
          mtbf: eq.mtbf,
          mttr: eq.mttr,
          avisos,
          avg_avisos: Math.round(avg_avisos * 10) / 10,
          kind,
          severity,
          message,
        });
      }
    });
    // Ordenar por severity (high primero) y por avisos desc
    const sevOrder = { high: 3, medium: 2, low: 1, info: 0 };
    return insights.sort((a, b) => {
      const ds = (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0);
      if (ds !== 0) return ds;
      return b.avisos - a.avisos;
    });
  }, [equipmentResultsKpis, wrs]);

  // ── Reporte equipos de apoyo: incidencia + tiempo perdido (Jorge SF-584) ──
  const supportEquipmentReport = useMemo(() => {
    const stats = {};
    let total_ots_with_eq = 0;
    let total_ots_blocked = 0;
    let total_hours_lost = 0;
    wos.forEach(w => {
      const supportEq = w.support_equipment || [];
      if (supportEq.length === 0) return;
      total_ots_with_eq++;
      supportEq.forEach(se => {
        const tag = se.tag || se.name || 'OTRO';
        if (!stats[tag]) stats[tag] = {
          tag,
          name: se.name || tag,
          equipment_type: se.equipment_type || '',
          ot_count: 0,
          total_hours: 0,
          ots_with_delay: 0,
          ots_with_no_compliance: 0,
        };
        stats[tag].ot_count++;
        stats[tag].total_hours += parseFloat(se.hours || 0);
        // ¿Esta OT tuvo problema de no-cumplimiento atribuible al eq apoyo?
        const allText = [
          ...(w.execution_notes || []).map(n => n.note || ''),
          ...(w.operations || []).map(op => op.notif_notes || ''),
          w.closure_notes || '',
          w.cancellation_reason || '',
        ].join(' ').toLowerCase();
        if (/grúa|grua|equipo\s+de\s+apoyo|herramienta.*falt/.test(allText)) {
          stats[tag].ots_with_no_compliance++;
          total_ots_blocked++;
          // Estimar tiempo perdido: diff entre estimated_hours y actual_hours
          const estimated = parseFloat(w.estimated_hours || 0);
          const actual = parseFloat(w.actual_hours || 0);
          const lost = Math.max(0, actual - estimated);
          stats[tag].total_hours += lost;
          total_hours_lost += lost;
        }
        // ¿OT con delay? actual_hours vs estimated >25%
        if (w.actual_hours && w.estimated_hours && w.actual_hours > w.estimated_hours * 1.25) {
          stats[tag].ots_with_delay++;
        }
      });
    });
    return {
      total_ots_with_eq,
      total_ots_blocked,
      total_hours_lost: Math.round(total_hours_lost),
      items: Object.values(stats).sort((a, b) => b.ot_count - a.ot_count).slice(0, 10),
    };
  }, [wos]);

  // ── Análisis de Dotación + brechas de especialidad (Jorge 2026-04-28 17:56) ──
  const dotacionAnalysis = useMemo(() => {
    // HH usadas por especialidad de la operación (de wos.operations)
    const usedBySpec = {};
    let totalUsed = 0;
    wos.forEach(w => {
      (w.operations || []).forEach(op => {
        const spec = (op.specialty || w.work_center || 'OTRO').toUpperCase();
        const hh = (parseFloat(op.actual_hours) || parseFloat(op.hours) || 0) * (parseInt(op.quantity) || 1);
        usedBySpec[spec] = (usedBySpec[spec] || 0) + hh;
        totalUsed += hh;
      });
    });
    // HH usadas en críticos vs no-críticos
    let usedCritical = 0;
    let usedNonCritical = 0;
    wos.forEach(w => {
      const tag = w.equipment_tag;
      const crit = criticalityMap[tag] || 'D';
      const total = (w.operations || []).reduce((s, op) => {
        return s + (parseFloat(op.actual_hours) || parseFloat(op.hours) || 0) * (parseInt(op.quantity) || 1);
      }, 0);
      if (['A', 'B'].includes(crit)) usedCritical += total;
      else usedNonCritical += total;
    });
    return {
      bySpec: Object.entries(usedBySpec).sort((a, b) => b[1] - a[1]).slice(0, 8),
      totalUsed: Math.round(totalUsed),
      usedCritical: Math.round(usedCritical),
      usedNonCritical: Math.round(usedNonCritical),
      pctCritical: totalUsed > 0 ? Math.round(usedCritical / totalUsed * 100) : 0,
    };
  }, [wos, criticalityMap]);

  // ── Jack-Knife Diagram (Jorge transcript 2026-04-29 13:44) ──
  // 4 cuadrantes con thresholds según fórmula explicada por Jorge:
  //   eje Y (MTTR) threshold = SUM(tiempos_paradas) / total_paradas
  //   eje X (frecuencia) threshold = SUM(num_paradas) / total_razones (n_sistemas/equipos)
  // Cuadrantes:
  //   GRAVE: pocas paradas pero alto MTTR (mantenibilidad deficiente)
  //   CRONICO: muchas paradas con bajo MTTR (confiabilidad baja)
  //   GRAVE_CRONICO: muchas + altas (atacar disponibilidad)
  //   LEVE: bajas en ambos (no priorizar)
  const jackKnifeData = useMemo(() => {
    const byEq = {};
    wos.filter(w => w.status === 'CERRADO' && w.equipment_tag).forEach(w => {
      const tag = w.equipment_tag;
      if (!byEq[tag]) byEq[tag] = { count: 0, total_hours: 0 };
      byEq[tag].count++;
      byEq[tag].total_hours += parseFloat(w.actual_hours) || 0;
    });
    const points = Object.entries(byEq).map(([tag, m]) => ({
      equipment: tag,
      criticality: criticalityMap[tag] || 'D',
      frequency: m.count,
      total_hours: Math.round(m.total_hours * 10) / 10,
      mttr: m.count > 0 ? Math.round(m.total_hours / m.count * 10) / 10 : 0,
    }));
    // Jorge fórmula: thresholds = sum/total, no medianas
    const totalParadas = points.reduce((s, p) => s + p.frequency, 0);
    const totalTiempo = points.reduce((s, p) => s + p.total_hours, 0);
    const nRazones = Math.max(1, points.length);
    const thresholdMttr = totalParadas > 0 ? Math.round(totalTiempo / totalParadas * 10) / 10 : 0;
    const thresholdFreq = Math.round(totalParadas / nRazones * 10) / 10;
    const itemsClassified = points.map(p => {
      const isHighFreq = p.frequency > thresholdFreq;
      const isHighMttr = p.mttr > thresholdMttr;
      let quadrant = 'LEVE';
      if (isHighFreq && isHighMttr) quadrant = 'GRAVE_CRONICO';
      else if (isHighMttr) quadrant = 'GRAVE';
      else if (isHighFreq) quadrant = 'CRONICO';
      return { ...p, quadrant };
    });
    return {
      items: itemsClassified.sort((a, b) => {
        const order = { GRAVE_CRONICO: 4, GRAVE: 3, CRONICO: 2, LEVE: 1 };
        return (order[b.quadrant] - order[a.quadrant]) || (b.frequency - a.frequency);
      }).slice(0, 25),
      thresholdMttr,
      thresholdFreq,
      totalParadas,
      totalTiempo,
      nRazones,
    };
  }, [wos, criticalityMap]);

  // ── Comparativa OTs similares (Jorge 2026-04-28 17:56) ──
  // Por tipo de trabajo (description normalizada): mejor / promedio / peor caso
  // Solo equipos críticos A/B.
  const otComparativa = useMemo(() => {
    const groups = {};
    wos.filter(w => w.status === 'CERRADO' && w.actual_hours).forEach(w => {
      const crit = criticalityMap[w.equipment_tag] || 'D';
      if (!['A', 'B'].includes(crit)) return; // sólo críticos
      // Normalizar descripción: tomar primeras 3 palabras
      const desc = (w.description || '').toLowerCase().split(/\s+/).slice(0, 3).join(' ');
      const key = `${desc}::${(w.work_center || '').toUpperCase()}`;
      if (!groups[key]) groups[key] = { desc, work_center: w.work_center, items: [] };
      groups[key].items.push({
        wo_number: w.wo_number,
        equipment: w.equipment_tag,
        planned_hours: parseFloat(w.estimated_hours) || 0,
        actual_hours: parseFloat(w.actual_hours) || 0,
      });
    });
    return Object.values(groups)
      .filter(g => g.items.length >= 3) // al menos 3 ejemplos
      .map(g => {
        const sorted = [...g.items].sort((a, b) => a.actual_hours - b.actual_hours);
        const avg = sorted.reduce((s, x) => s + x.actual_hours, 0) / sorted.length;
        return {
          desc: g.desc,
          work_center: g.work_center,
          count: sorted.length,
          best: sorted[0],
          worst: sorted[sorted.length - 1],
          avg: Math.round(avg * 10) / 10,
          spread: Math.round((sorted[sorted.length - 1].actual_hours - sorted[0].actual_hours) * 10) / 10,
        };
      })
      .sort((a, b) => b.spread - a.spread)
      .slice(0, 8);
  }, [wos, criticalityMap]);

  // ── Close-the-loop tracking (Jorge 2026-04-28 17:56) ──
  // Acciones de mejora abiertas / vencidas / cerradas. Warning si abierta+vencida =
  // problema sigue ocurriendo, no se cerró el ciclo.
  const closeTheLoop = useMemo(() => {
    const now = new Date();
    const open = improvementActions.filter(a => !['COMPLETED', 'CLOSED', 'DONE'].includes((a.status || '').toUpperCase()));
    const overdue = open.filter(a => {
      if (!a.target_date) return false;
      return new Date(a.target_date) < now;
    });
    const closed = improvementActions.filter(a => ['COMPLETED', 'CLOSED', 'DONE'].includes((a.status || '').toUpperCase()));
    return {
      total: improvementActions.length,
      open: open.length,
      overdue: overdue.length,
      closed: closed.length,
      open_pct: improvementActions.length > 0 ? Math.round(open.length / improvementActions.length * 100) : 0,
      overdue_actions: overdue.slice(0, 8).map(a => ({
        title: a.title || '—',
        category: a.category || '—',
        target_date: a.target_date,
        days_overdue: a.target_date ? Math.round((now - new Date(a.target_date)) / 86400000) : 0,
        equipment: a.equipment_tag || '—',
        priority: a.priority || 'MEDIUM',
      })),
    };
  }, [improvementActions]);

  // ── Cruce con estrategia (Jorge 2026-04-28 17:56) ──
  // PM01/PM02 ejecutadas vs su frecuencia planeada. Si una pauta cada 3 meses se ejecuta
  // cada 2 meses sostenidamente → estrategia desactualizada.
  const strategyMismatches = useMemo(() => {
    // Agrupar PM01 (preventivos) cerrados por equipo+description, y ver cadencia real
    const groups = {};
    wos.filter(w => w.wo_type === 'PM01' && w.status === 'CERRADO' && w.equipment_tag && w.actual_end).forEach(w => {
      const desc = (w.description || '').toLowerCase().split(/\s+/).slice(0, 3).join(' ');
      const key = `${w.equipment_tag}::${desc}`;
      if (!groups[key]) groups[key] = { tag: w.equipment_tag, desc, dates: [] };
      groups[key].dates.push(new Date(w.actual_end));
    });
    const mismatches = [];
    Object.values(groups).forEach(g => {
      if (g.dates.length < 3) return; // necesitamos ≥3 ejecuciones para inferir cadencia
      g.dates.sort((a, b) => a - b);
      const intervals = [];
      for (let i = 1; i < g.dates.length; i++) {
        intervals.push((g.dates[i] - g.dates[i - 1]) / 86400000);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      // Heurística: si intervalo promedio < 60d (típica trimestral o más larga) marcar
      if (avgInterval > 0 && avgInterval < 60) {
        mismatches.push({
          equipment: g.tag,
          description: g.desc,
          executions: g.dates.length,
          avg_interval_days: Math.round(avgInterval),
          suggestion: avgInterval < 30
            ? 'Frecuencia muy alta — revisar si la estrategia debería ser más espaciada o si hay falla crónica'
            : 'Cadencia más alta de lo típico — verificar si la estrategia está bien calibrada',
        });
      }
    });
    return mismatches.sort((a, b) => a.avg_interval_days - b.avg_interval_days).slice(0, 8);
  }, [wos]);

  // ── KPIs de Costo + clases de gasto (Jorge 2026-04-28 17:56) ──
  const costKpis = useMemo(() => {
    let totalLabor = 0, totalMaterial = 0, totalExternal = 0, totalActual = 0, totalBudget = 0;
    const byCenter = {};
    wos.forEach(w => {
      totalLabor += parseFloat(w.labor_cost) || 0;
      totalMaterial += parseFloat(w.material_cost) || 0;
      totalExternal += parseFloat(w.external_cost) || 0;
      totalActual += parseFloat(w.actual_total_cost) || 0;
      totalBudget += parseFloat(w.budget_amount) || 0;
      const center = w.work_center || 'OTRO';
      if (!byCenter[center]) byCenter[center] = { plan: 0, real: 0 };
      byCenter[center].plan += parseFloat(w.budget_amount) || 0;
      byCenter[center].real += parseFloat(w.actual_total_cost) || 0;
    });
    return {
      totalLabor: Math.round(totalLabor),
      totalMaterial: Math.round(totalMaterial),
      totalExternal: Math.round(totalExternal),
      totalActual: Math.round(totalActual),
      totalBudget: Math.round(totalBudget),
      variance_pct: totalBudget > 0 ? Math.round((totalActual - totalBudget) / totalBudget * 100) : 0,
      byCenter: Object.entries(byCenter).sort((a, b) => b[1].real - a[1].real).slice(0, 8),
    };
  }, [wos]);

  // ── Catálogo de falla: tendencias parte/síntoma/causa (Jorge 17:56) ──
  const failureCatalogTrends = useMemo(() => {
    const partObj = {};
    const symptoms = {};
    const causes = {};
    wrs.forEach(wr => {
      const ai = wr.ai_classification || {};
      const pd = wr.problem_description || {};
      const part = (ai.part_object || ai.failure_class || '').trim();
      const sympt = (ai.symptom || pd.failure_mode_detected || '').trim();
      const cause = (ai.probable_cause || pd.cause || '').trim();
      if (part) partObj[part] = (partObj[part] || 0) + 1;
      if (sympt) symptoms[sympt] = (symptoms[sympt] || 0) + 1;
      if (cause) causes[cause] = (causes[cause] || 0) + 1;
    });
    const top = (obj, n = 5) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
    return { parts: top(partObj), symptoms: top(symptoms), causes: top(causes) };
  }, [wrs]);

  // ── Causas de no-cumplimiento (Jorge 17:56) ──
  // Frontend siempre tiene el regex como fallback; pero si Claude clasificó,
  // usamos esa data (NLP real) — ver effect abajo.
  const _regexNonCompliance = useMemo(() => {
    const patterns = [
      { regex: /repuesto.*no\s+(corresp|disponible|llegó)/i, label: 'Repuesto incorrecto/sin stock' },
      { regex: /operaci(ón|on).*no\s+(entreg|liber)/i, label: 'Operaciones no entregó equipo' },
      { regex: /servicio\s+externo.*no\s+lleg/i, label: 'Servicio externo no llegó' },
      { regex: /herramienta.*(descalibr|no\s+estaba|falt)/i, label: 'Herramienta especial faltante/descalibrada' },
      { regex: /grúa|grua|equipo\s+de\s+apoyo/i, label: 'Equipo de apoyo no disponible' },
      { regex: /tiempo\s+insuficiente|no\s+alcanc/i, label: 'Ventana de tiempo insuficiente' },
      { regex: /seguridad|loto|epp/i, label: 'Bloqueo por seguridad / LOTO' },
    ];
    const counts = {};
    wos.forEach(w => {
      const allText = [
        ...(w.execution_notes || []).map(n => n.note || n.text || ''),
        ...(w.operations || []).map(op => op.notif_notes || op.notes || ''),
        w.closure_notes || '',
        w.cancellation_reason || '',
      ].join(' ');
      patterns.forEach(p => {
        if (p.regex.test(allText)) counts[p.label] = (counts[p.label] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [wos]);

  // Si Claude ya clasificó, esa data manda; si no, fallback al regex.
  const nonComplianceCauses = aiNoncompliance?.categories?.length
    ? aiNoncompliance.categories.map(c => [c.category.replace(/_/g, ' '), c.count])
    : _regexNonCompliance;

  // Disparar clasificación Claude una vez por carga de wos (rate-limit reasonable).
  useEffect(() => {
    if (!wos.length) return;
    const allNotes = [];
    wos.forEach(w => {
      (w.execution_notes || []).forEach(n => allNotes.push(typeof n === 'string' ? n : (n?.note || n?.text || '')));
      (w.operations || []).forEach(op => {
        if (op?.notif_notes) allNotes.push(op.notif_notes);
        if (op?.notes) allNotes.push(op.notes);
      });
      if (w.closure_notes) allNotes.push(w.closure_notes);
      if (w.cancellation_reason) allNotes.push(w.cancellation_reason);
    });
    const filtered = allNotes.filter(n => typeof n === 'string' && n.trim().length > 5);
    if (filtered.length === 0) return;
    setAiNoncomplianceLoading(true);
    api.classifyNoncomplianceWithAI({ notes: filtered, plant_id: plant })
      .then(res => setAiNoncompliance(res))
      .catch(() => setAiNoncompliance(null))
      .finally(() => setAiNoncomplianceLoading(false));
  }, [wos.length, plant]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Consumo de repuestos + predicción quiebre stock (Jorge 17:56) ──
  // Ranking de materiales más consumidos en período. Sin conexión a bodega real,
  // usamos materials de las OTs como proxy del consumo.
  const sparePartsConsumption = useMemo(() => {
    const counts = {};
    wos.forEach(w => {
      (w.materials || []).forEach(m => {
        const code = m.code || m.sap_id || m.sapId || '';
        if (!code) return;
        if (!counts[code]) counts[code] = { code, description: m.description || '', total_qty: 0, ot_count: 0, unit: m.unit || 'UN' };
        counts[code].total_qty += parseInt(m.quantity) || 0;
        counts[code].ot_count++;
      });
    });
    return Object.values(counts).sort((a, b) => b.total_qty - a.total_qty).slice(0, 10);
  }, [wos]);

  // ── Análisis Plan vs Real usando notificación (CE1) ──
  const planVsReal = useMemo(() => {
    const stats = { totalPlannedHH: 0, totalActualHH: 0, opsCount: 0, opsNotified: 0, otsAnalyzed: 0 };
    const overruns = []; // ops con desviación >25%
    const underruns = []; // ops con muy poca HH real (puede ser señal de que faltó hacer)
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
            if (variance > 0.25) overruns.push({
              wo: wo.wo_number, op: op.description?.slice(0, 60),
              specialty: op.specialty, planHH, actualHH, variance,
            });
            if (variance < -0.4) underruns.push({
              wo: wo.wo_number, op: op.description?.slice(0, 60),
              specialty: op.specialty, planHH, actualHH, variance,
              notes: op.notif_notes || '',
            });
          }
        }
      });
    });
    const avgVariancePct = stats.totalPlannedHH > 0
      ? Math.round(((stats.totalActualHH - stats.totalPlannedHH) / stats.totalPlannedHH) * 100)
      : 0;
    return {
      ...stats,
      avgVariancePct,
      overruns: overruns.sort((a, b) => b.variance - a.variance).slice(0, 5),
      underruns: underruns.sort((a, b) => a.variance - b.variance).slice(0, 5),
      coveragePct: stats.opsCount > 0 ? Math.round((stats.opsNotified / stats.opsCount) * 100) : 0,
    };
  }, [wos]);

  // ── Actions ──
  const handleCreateAction = async (category) => {
    setCreatingAction(true);
    try {
      await api.createImprovementAction({
        title: `${category} — Performance Review ${new Date().toISOString().slice(0, 10)}`,
        category,
        priority: 'MEDIUM',
        plant_id: plant,
        source: 'PERFORMANCE_ANALYSIS',
      });
      const updated = await api.listImprovementActions({ plant_id: plant });
      setImprovementActions(Array.isArray(updated) ? updated : updated?.items || []);
      toast.success(`Improvement action creada: ${category}`);
    } catch {
      toast.error('Error creating accion de mejora');
    }
    setCreatingAction(false);
  };

  const handleSaveMeeting = async () => {
    try {
      await api.createPMReview({
        plant_id: plant,
        period_start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
        period_end: meetingForm.date,
      });
      toast.success('Reunion de desempeno registrada');
      setShowMeetingForm(false);
      const updated = await api.listPMReviews({ plant_id: plant });
      setReviews(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error('Error al registrar reunion');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw size={24} className="animate-spin text-emerald-600" />
    </div>
  );

  const activeActions = improvementActions.filter(a => a.status !== 'COMPLETED' && a.status !== 'CLOSED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> Analisis del Desempeno
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            KPIs de mantenimiento, tendencias y acciones de mejora — Alineado con ISO 14224
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              import('../components/PerformanceReports').then(m => {
                m.openPostMaintenanceReport({
                  plant_id: plant,
                  period_label: 'Últimos 30 días',
                  badActors: recurringFailures,
                  retrabajos: reworkEvents,
                  pareto: failureModePareto?.byCount || [],
                  equipKpis: equipmentResultsKpis,
                  chronic: chronicFailures,
                  priorityIssues: priorityMismatches,
                  discipline: disciplineKpis,
                  closeTheLoop,
                  strategy: strategyMismatches,
                  dotacion: dotacionAnalysis,
                });
              });
            }}
            className="flex items-center gap-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700">
            📄 Reporte Post-Mantenimiento (PDF)
          </button>
          <button onClick={() => setShowMeetingForm(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Calendar size={16} /> Reunion de Desempeno
          </button>
          <button onClick={() => navigate('/improvement-actions')} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
            <ArrowRight size={16} /> Acciones de Mejora
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KpiCard label="MTBF" value={kpis.mtbf} unit="dias" icon={Clock} target={30} color="blue" />
        <KpiCard label="MTTR" value={kpis.mttr} unit="hrs" icon={Clock} target={8} color="amber" />
        <KpiCard label="Availability" value={kpis.availability} unit="%" icon={CheckCircle2} target={90} />
        <KpiCard label="Cumplimiento Prog." value={kpis.compliance} unit="%" icon={Target} target={85} color="blue" />
        <KpiCard label="Cumplimiento PM" value={kpis.pmCompliance} unit="%" icon={CheckCircle2} target={90} />
        <KpiCard label="Backlog" value={Math.round(kpis.backlogHours)} unit="hrs" icon={BarChart3} color="amber" />
        <KpiCard label="OTs Totales" value={kpis.total} icon={FileText} color="blue" />
        <KpiCard label="OTs Completadas" value={kpis.completed} icon={CheckCircle2} />
        <KpiCard label="Costo Prom/OT" value={`$${kpis.avgCost}`} icon={TrendingUp} color="amber" />
        <KpiCard label="Acciones Activas" value={activeActions.length} icon={Zap} color={activeActions.length > 5 ? 'red' : 'emerald'} />
        {kpis.scheduleAdherence != null && <KpiCard label="Adherencia Prog." value={kpis.scheduleAdherence} unit="%" icon={Target} target={80} color="blue" />}
        {kpis.unplannedPct != null && <KpiCard label="% No Planificado" value={kpis.unplannedPct} unit="%" icon={AlertTriangle} color={kpis.unplannedPct > 30 ? 'red' : 'amber'} />}
        {kpis.workforceUtil != null && <KpiCard label="Utiliz. Fuerza Laboral" value={kpis.workforceUtil} unit="%" icon={Users} target={75} />}
        {kpis.costoVariance != null && <KpiCard label="Varianza Costo" value={kpis.costoVariance} unit="%" icon={TrendingUp} color={kpis.costoVariance < -10 ? 'red' : 'emerald'} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Trend Mensual de OTs</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="planned" fill="#3B82F6" name="Planificadas" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" fill="#059669" name="Completadas" radius={[3, 3, 0, 0]} />
                <Bar dataKey="unplanned" fill="#EF4444" name="No planificadas" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data de tendencia</p>
          )}
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Distribucion por Tipo de OT</h3>
          {typeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {typeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data</p>
          )}
        </div>

        {/* Top Failing Equipment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Equipos con Mas Fallas</h3>
          {topEquipment.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topEquipment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="equipment" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" name="Fallas" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No data de fallas</p>
          )}
        </div>

        {/* Improvement Actions Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Acciones de Mejora Activas</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{activeActions.length}</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {activeActions.length > 0 ? activeActions.slice(0, 8).map(a => (
              <div key={a.action_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.category} · {a.priority}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>{a.status}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-6">Sin acciones activas</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tanda C-EXT post 2026-04-28 12:32: Plan vs Real desde notificación ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Plan vs Real (desde notificación HH por operación)
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            planVsReal.coveragePct >= 70 ? 'bg-emerald-100 text-emerald-700'
            : planVsReal.coveragePct >= 40 ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
          }`}>
            Cobertura {planVsReal.coveragePct}% · {planVsReal.opsNotified}/{planVsReal.opsCount} ops
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs uppercase font-bold text-blue-700">HH Planificadas</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(planVsReal.totalPlannedHH)}h</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs uppercase font-bold text-purple-700">HH Reales</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(planVsReal.totalActualHH)}h</div>
          </div>
          <div className={`rounded-lg p-3 ${
            Math.abs(planVsReal.avgVariancePct) > 20 ? 'bg-red-50' :
            Math.abs(planVsReal.avgVariancePct) > 10 ? 'bg-amber-50' : 'bg-emerald-50'
          }`}>
            <div className="text-xs uppercase font-bold">Desviación promedio</div>
            <div className="text-2xl font-bold tabular-nums">
              {planVsReal.avgVariancePct >= 0 ? '+' : ''}{planVsReal.avgVariancePct}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overruns: ops que tomaron mucho más */}
          <div>
            <h4 className="text-xs font-bold text-red-700 uppercase mb-2">⏱️ Overruns (op tomó &gt;25% más)</h4>
            {planVsReal.overruns.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin overruns significativos</p>
            ) : (
              <div className="space-y-1">
                {planVsReal.overruns.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-red-50 rounded">
                    <span className="font-mono text-red-700">{o.wo}</span>
                    <span className="flex-1 truncate">{o.op}</span>
                    <span className="text-[10px] bg-red-200 px-1 rounded">{o.specialty}</span>
                    <span className="font-bold tabular-nums text-red-700">+{Math.round(o.variance * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Underruns: ops que se ejecutaron mucho menos — señal de que faltó hacer */}
          <div>
            <h4 className="text-xs font-bold text-amber-700 uppercase mb-2">⚠️ Underruns (&lt;60% del plan — ¿se omitió?)</h4>
            {planVsReal.underruns.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin underruns significativos</p>
            ) : (
              <div className="space-y-1">
                {planVsReal.underruns.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-amber-50 rounded">
                    <span className="font-mono text-amber-700">{o.wo}</span>
                    <span className="flex-1 truncate">{o.op}</span>
                    <span className="text-[10px] bg-amber-200 px-1 rounded">{o.specialty}</span>
                    <span className="font-bold tabular-nums text-amber-700">{Math.round(o.variance * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {planVsReal.coveragePct < 50 && (
          <div className="mt-3 p-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded">
            ℹ️ Cobertura baja: solo {planVsReal.opsNotified} de {planVsReal.opsCount} operaciones tienen notificación.
            Recordá al supervisor / mantenedor cargar las HH reales en la pestaña <strong>Notificación</strong>.
          </div>
        )}
      </div>

      {/* ── Fallas recurrentes (bad actors) — el sistema "lee cuándo fue la última vez" ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Fallas recurrentes (≥3 reportes) · candidatos a estudio FMECA / RCA
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
            {recurringFailures.length} bad actors
          </span>
          <button
            onClick={async () => {
              try {
                const res = await api.autoTriggerRcaFromClusters({ plant_id: plant, window_days: 30, min_occurrences: 3, dry_run: true });
                if (res.new_rca_candidates === 0) {
                  toast?.info ? toast.info('Todos los clusters ya tienen RCA activo') : alert('Todos los clusters ya tienen RCA activo');
                  return;
                }
                if (!confirm(`Detectados ${res.new_rca_candidates} clusters sin RCA. ¿Crear RCAs automáticos?`)) return;
                const r = await api.autoTriggerRcaFromClusters({ plant_id: plant, window_days: 30, min_occurrences: 3, dry_run: false });
                toast?.success ? toast.success(`${r.rcas_created} RCAs creados`) : alert(`${r.rcas_created} RCAs creados`);
                navigate('/rca');
              } catch (e) {
                toast?.error ? toast.error('Error: ' + (e.message || '')) : alert('Error: ' + (e.message || ''));
              }
            }}
            className="ml-2 text-xs px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700">
            🤖 Auto-generar RCAs (clusters)
          </button>
        </div>
        {recurringFailures.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin equipos con fallas recurrentes — la flota está estable
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Crit.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Fallas</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Período</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">MTBF (días)</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Modos detectados</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Última falla</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recurringFailures.map(rf => {
                  const critTone = rf.criticality === 'A' ? 'bg-red-600 text-white' :
                                   rf.criticality === 'B' ? 'bg-orange-500 text-white' :
                                   rf.criticality === 'C' ? 'bg-amber-300 text-amber-900' :
                                   'bg-gray-200 text-gray-700';
                  return (
                  <tr key={rf.equipment} className={`border-t border-gray-100 hover:bg-red-50/30 ${rf.isCritical ? 'bg-red-50/40' : ''}`}>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${critTone}`}>{rf.criticality}</span>
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => navigate(`/fmeca?equipment=${encodeURIComponent(rf.equipment)}`)}
                        className="font-mono text-blue-700 hover:underline">{rf.equipment}</button>
                      {rf.isCritical && <span className="ml-1 text-[10px] text-red-600 font-bold">⚠ CRÍTICO</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{rf.count}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">{rf.span_days}d</td>
                    <td className="px-2 py-2 text-center font-bold tabular-nums">
                      {rf.mtbf_local != null ? `${rf.mtbf_local}d` : '—'}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        {rf.modes.length > 0 ? rf.modes.map((m, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{m}</span>
                        )) : <span className="text-gray-400 italic">sin clasificar</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-gray-500">
                      {rf.lastDate ? new Date(rf.lastDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => navigate(`/fmeca?equipment=${encodeURIComponent(rf.equipment)}`)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700">
                        FMECA
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge transcript 2026-04-28 17:56: cruzar Bad Actors con lista de equipos críticos. <strong>Críticos A/B</strong> aparecen con threshold ≥2 fallas y se rankean primero (impactan producción). No-críticos C/D requieren ≥3.
          Candidatos a estudio FMECA + RCA → cierre de ciclo en DefectElimination → push a FMECA worksheet.
        </p>
      </div>

      {/* ── Retrabajos / Reprocesos (Jorge 2026-04-28 17:56) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            🔁 Retrabajos / Reprocesos detectados
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700">
            {reworkEvents.length} eventos
          </span>
        </div>
        {reworkEvents.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin retrabajos detectados — la calidad de las intervenciones es buena.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-rose-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">OT cerrada anterior</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Aviso nuevo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Δ horas</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Pri.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Descripción nueva</th>
                </tr>
              </thead>
              <tbody>
                {reworkEvents.map((rw, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-rose-50/30">
                    <td className="px-2 py-2 font-mono text-blue-700">{rw.equipment}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => navigate(`/work-management?tab=planning&openWoNumber=${rw.previous_wo}`)}
                        className="font-mono text-blue-700 hover:underline">{rw.previous_wo}</button>
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => navigate(`/work-management?tab=identification&openWr=${encodeURIComponent(rw.new_wr || '')}`)}
                        className="font-mono text-blue-700 hover:underline">{(rw.new_wr || '').slice(0, 10)}</button>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`font-bold px-1.5 py-0.5 rounded ${rw.hours_gap < 4 ? 'bg-red-200 text-red-800' : rw.hours_gap < 12 ? 'bg-orange-200 text-orange-800' : 'bg-amber-100 text-amber-700'}`}>
                        {rw.hours_gap}h
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs">{rw.new_priority || '—'}</td>
                    <td className="px-2 py-2 text-gray-700 max-w-[300px] truncate" title={rw.new_description}>{rw.new_description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: si un equipo intervenido falla en &lt;24h en algo similar, es un <strong>retrabajo</strong>. Causas típicas: instalación mala, repuesto de menor calidad, o falla operacional no reportada. Genera acciones de mejora.
        </p>
      </div>

      {/* ── Carga de Excel histórico Jigsaw (Jorge 2026-04-29 13:44 línea 305-307) ── */}
      <JigsawImportBanner
        imported={importedJigsaw}
        loading={importingJigsaw}
        error={importJigsawError}
        onUpload={async (file) => {
          setImportJigsawError(null);
          setImportingJigsaw(true);
          try {
            const r = await api.importJigsawExcel(file);
            setImportedJigsaw(r);
          } catch (e) {
            setImportJigsawError(e.message || 'Error al importar');
          } finally {
            setImportingJigsaw(false);
          }
        }}
        onClear={() => { setImportedJigsaw(null); setImportJigsawError(null); }}
      />

      {/* ── Pareto de modos de falla (Jorge 2026-04-29 13:44) ── */}
      <ParetoSection data={importedJigsaw?.pareto || failureModePareto} sourceLabel={importedJigsaw ? `📂 Excel: ${importedJigsaw.filename}` : null} />


      {/* ── KPIs de Resultados por equipo (Jorge 2026-04-28 17:56) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            ⚙️ KPIs de Resultados por equipo (Disponibilidad · MTBF · MTTR)
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            Período 30 días · {equipmentResultsKpis.length} equipos
          </span>
        </div>
        {equipmentResultsKpis.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin data suficiente de fallas/reparaciones en últimos 30 días.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-blue-50">
                <tr>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Crit.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Fallas (30d)</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">MTBF</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">MTTR</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {equipmentResultsKpis.map(eq => {
                  const critTone = eq.criticality === 'A' ? 'bg-red-600 text-white' :
                                   eq.criticality === 'B' ? 'bg-orange-500 text-white' :
                                   eq.criticality === 'C' ? 'bg-amber-300 text-amber-900' :
                                   'bg-gray-200 text-gray-700';
                  const availTone = eq.availability == null ? 'text-gray-500' :
                                     eq.availability >= 95 ? 'text-emerald-600' :
                                     eq.availability >= 90 ? 'text-amber-600' : 'text-red-600';
                  return (
                    <tr key={eq.equipment} className="border-t border-gray-100 hover:bg-blue-50/30">
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${critTone}`}>{eq.criticality}</span>
                      </td>
                      <td className="px-2 py-2 font-mono text-blue-700">{eq.equipment}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-bold text-red-700">{eq.failures}</span>
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums">{eq.mtbf != null ? `${eq.mtbf}h` : '—'}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{eq.mttr > 0 ? `${eq.mttr}h` : '—'}</td>
                      <td className={`px-2 py-2 text-center font-bold tabular-nums ${availTone}`}>
                        {eq.availability != null ? `${eq.availability}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          MTBF = horas operativas / fallas. MTTR = HH reparación / # reparaciones cerradas. Disponibilidad = MTBF / (MTBF + MTTR) × 100.
          Críticos A/B aparecen primero. Disponibilidad &lt;90% en rojo (acción inmediata), 90-95% ámbar.
        </p>
      </div>

      {/* ── Fallas crónicas (ventana 7 días, ≥3 repeticiones mismo equipo+modo) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            🔥 Fallas Crónicas detectadas
            {aiChronic?.ai_used && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300">🤖 Claude</span>
            )}
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700">
            {chronicFailures.length} casos · ventana 7d
          </span>
        </div>
        {chronicFailures.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin fallas crónicas detectadas — ningún equipo+modo se repite ≥3 veces en 7 días.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-rose-50">
                <tr>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Crit.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Modo de falla</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">En 7d</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Total</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Período</th>
                </tr>
              </thead>
              <tbody>
                {chronicFailures.map((c, i) => {
                  const critTone = c.criticality === 'A' ? 'bg-red-600 text-white' :
                                    c.criticality === 'B' ? 'bg-orange-500 text-white' :
                                    c.criticality === 'C' ? 'bg-amber-300 text-amber-900' :
                                    'bg-gray-200 text-gray-700';
                  return (
                    <tr key={i} className="border-t border-gray-100 hover:bg-rose-50/30">
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${critTone}`}>{c.criticality}</span>
                      </td>
                      <td className="px-2 py-2 font-mono text-blue-700">{c.equipment}</td>
                      <td className="px-2 py-2 text-gray-800">{c.failure_mode}</td>
                      <td className="px-2 py-2 text-center font-bold text-rose-700">{c.count_in_window}</td>
                      <td className="px-2 py-2 text-center text-gray-600">{c.total_count}</td>
                      <td className="px-2 py-2 text-[10px] text-gray-500">
                        {new Date(c.window_start).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} →
                        {' '}{new Date(c.window_end).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {aiChronic?.analyses?.length > 0 && (
          <div className="mt-3 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-3 space-y-2">
            <div className="text-[11px] font-bold text-purple-900 mb-1">🤖 Análisis Claude — causa raíz + acción</div>
            {aiChronic.analyses.map((a, i) => (
              <div key={i} className="rounded bg-white/80 border border-purple-100 p-2 text-[11px]">
                <div className="font-semibold text-purple-800">{a.equipment} → {a.failure_mode}
                  <span className={`ml-2 text-[9px] font-bold px-1 py-0.5 rounded ${a.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : a.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{a.confidence?.toUpperCase()}</span>
                </div>
                <div className="text-gray-700 mt-1"><strong>Causa raíz:</strong> {a.root_cause_hypothesis}</div>
                <div className="text-gray-700"><strong>Acción:</strong> {a.recommended_action}</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "5 cambios de la misma pieza en 1 semana = falla crónica". Acción: revisar estrategia (¿está cubierto? ¿la frecuencia es la correcta?), abrir RCA, considerar cambio de material o procedimiento.
        </p>
      </div>

      {/* ── Prioridades mal asignadas ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            ⚖️ Prioridades inconsistentes
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
            {priorityMismatches.length} avisos/OTs
          </span>
        </div>
        {priorityMismatches.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Todas las prioridades son consistentes con el SLA y con el production_impact.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">ID</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Pri.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Inconsistencia</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Sugerencia IA</th>
                </tr>
              </thead>
              <tbody>
                {priorityMismatches.map((pm, i) => (
                  <tr key={i} className={`border-t border-gray-100 hover:bg-amber-50/30 ${pm.severity === 'high' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-2 py-2 font-mono text-xs">{pm.aviso}</td>
                    <td className="px-2 py-2 font-mono text-blue-700">{pm.equipment}</td>
                    <td className="px-2 py-2 text-center font-bold">{pm.actual_priority}</td>
                    <td className="px-2 py-2 text-gray-700 text-xs">{pm.issue}</td>
                    <td className="px-2 py-2 text-gray-600 text-xs italic">{pm.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "P1 = inmediata o &lt;24h. P2 = &lt;7d. P3 = cualquier día. P4 = sólo en parada de planta". La IA detecta avisos vencidos sin atender + production_impact desalineado con prioridad.
        </p>
      </div>

      {/* ── KPIs Disciplina + Tiempos entre estados ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          ⏱️ KPIs de Disciplina · Tiempos entre estados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-[10px] uppercase font-bold text-blue-700 mb-1">Aviso → Aprobado</div>
            <div className="text-2xl font-bold tabular-nums">{disciplineKpis.avg_wr_to_approve_h}h</div>
            <div className="text-[10px] text-gray-500 mt-1">{disciplineKpis.wrs_with_data} avisos analizados</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-[10px] uppercase font-bold text-purple-700 mb-1">OT lifecycle</div>
            <div className="text-2xl font-bold tabular-nums">{disciplineKpis.avg_ot_lifecycle_d}d</div>
            <div className="text-[10px] text-gray-500 mt-1">{disciplineKpis.wos_with_data} OTs cerradas</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">SLA Aviso (objetivo)</div>
            <div className="text-2xl font-bold tabular-nums">≤4h</div>
            <div className="text-[10px] text-gray-500 mt-1">supervisor revisa y aprueba</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="text-[10px] uppercase font-bold text-amber-700 mb-1">SLA OT (objetivo)</div>
            <div className="text-2xl font-bold tabular-nums">≤14d</div>
            <div className="text-[10px] text-gray-500 mt-1">creación → cierre</div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 italic mt-3">
          Jorge 2026-04-28 17:56: "el aviso no puede estar eternamente esperando, le golpea al supervisor; la OT no puede estar mucho tiempo en bandeja del planificador si los repuestos están". Estos KPIs miden la <strong>disciplina del flujo</strong>.
        </p>

        {/* SF-585 — Outliers >2σ */}
        {(disciplineKpis.wr_outliers.length > 0 || disciplineKpis.wo_outliers.length > 0) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {disciplineKpis.wr_outliers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                  ⚠ Outliers Avisos (&gt;2σ del promedio · umbral {disciplineKpis.wr_threshold_h}h)
                </h4>
                <div className="space-y-1">
                  {disciplineKpis.wr_outliers.map((o, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1">
                      <button onClick={() => navigate(`/work-management?tab=identification&openWr=${encodeURIComponent(o.request_id)}`)}
                        className="font-mono font-bold text-blue-700 hover:underline">{o.aviso}</button>
                      <span className="font-mono text-gray-600">{o.equipment}</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100">{o.priority}</span>
                      <span className="ml-auto font-bold text-red-700 tabular-nums">{o.dt_h}h ({o.deviation_x}σ)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {disciplineKpis.wo_outliers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                  ⚠ Outliers OTs (&gt;2σ del promedio · umbral {disciplineKpis.wo_threshold_d}d)
                </h4>
                <div className="space-y-1">
                  {disciplineKpis.wo_outliers.map((o, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1">
                      <button onClick={() => navigate(`/work-management?tab=planning&openWo=${o.wo_id}`)}
                        className="font-mono font-bold text-blue-700 hover:underline">{o.wo_number}</button>
                      <span className="font-mono text-gray-600">{o.equipment}</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100">{o.priority}</span>
                      <span className="ml-auto font-bold text-red-700 tabular-nums">{o.dt_d}d ({o.deviation_x}σ)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SF-586 Correlación reliability ↔ avisos ── */}
      {reliabilityAvisoCorrelation.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              🔗 Insights cruzados: Confiabilidad ↔ Volumen Avisos
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              {reliabilityAvisoCorrelation.length} insights IA
            </span>
          </div>
          <div className="space-y-2">
            {reliabilityAvisoCorrelation.slice(0, 10).map((ins, i) => {
              const tone = ins.severity === 'high' ? 'bg-red-50 border-red-300 text-red-900' :
                           ins.severity === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                           'bg-blue-50 border-blue-200 text-blue-900';
              const icon = ins.kind === 'consistent_bad' ? '🔴' :
                           ins.kind === 'unreported' ? '⚠' :
                           ins.kind === 'noise' ? '🔁' :
                           ins.kind === 'short_mtbf' ? '⏱' : 'ℹ';
              return (
                <div key={i} className={`rounded-lg border p-2.5 ${tone}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold">{ins.equipment}</span>
                        {ins.criticality && ['A', 'B'].includes(ins.criticality) && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">CRÍTICO {ins.criticality}</span>
                        )}
                        <span className="text-[10px] text-gray-600">Disp: {ins.availability ?? '—'}% · MTBF: {ins.mtbf ?? '—'}h · Avisos: {ins.avisos}</span>
                      </div>
                      <p className="text-xs">{ins.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 italic mt-3">
            Jorge SF-586: "la IA valida si un equipo con baja confiabilidad tiene correlación directa con el volumen de avisos o duración de paradas". Detecta 4 patrones: consistente (bajo+muchos), no-reportado (bajo+pocos), ruido (alto+muchos), MTBF corto.
          </p>
        </div>
      )}

      {/* ── SF-584 Reporte equipos de apoyo: incidencia + tiempo perdido ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            🏗️ SF-584 · Incidencia equipos de apoyo + tiempo perdido
          </h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">{supportEquipmentReport.total_ots_with_eq} OTs requirieron eq apoyo</span>
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">{supportEquipmentReport.total_ots_blocked} con problema</span>
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">{supportEquipmentReport.total_hours_lost}h perdidas</span>
          </div>
        </div>
        {supportEquipmentReport.items.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">Sin equipos de apoyo en OTs analizadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-blue-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold">Tag</th>
                  <th className="text-left px-2 py-1.5 font-bold">Descripción</th>
                  <th className="text-left px-2 py-1.5 font-bold">Tipo</th>
                  <th className="text-center px-2 py-1.5 font-bold">N° OTs</th>
                  <th className="text-center px-2 py-1.5 font-bold">HH usadas</th>
                  <th className="text-center px-2 py-1.5 font-bold">OTs con delay</th>
                  <th className="text-center px-2 py-1.5 font-bold">OTs bloqueadas</th>
                </tr>
              </thead>
              <tbody>
                {supportEquipmentReport.items.map((it, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-blue-50/30">
                    <td className="px-2 py-1.5 font-mono">{it.tag}</td>
                    <td className="px-2 py-1.5 max-w-[200px] truncate" title={it.name}>{it.name}</td>
                    <td className="px-2 py-1.5 text-gray-600">{it.equipment_type}</td>
                    <td className="px-2 py-1.5 text-center font-bold">{it.ot_count}</td>
                    <td className="px-2 py-1.5 text-center tabular-nums">{Math.round(it.total_hours)}h</td>
                    <td className={`px-2 py-1.5 text-center font-bold ${it.ots_with_delay > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{it.ots_with_delay}</td>
                    <td className={`px-2 py-1.5 text-center font-bold ${it.ots_with_no_compliance > 0 ? 'text-red-700' : 'text-gray-400'}`}>{it.ots_with_no_compliance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge SF-584: "Reporte de incidencia de equipos de apoyo (cuántas OTs se vieron afectadas y cuánto tiempo se perdió)". OTs bloqueadas = comments mencionan grúa/herramienta faltante. Tiempo perdido = HH actual − estimated cuando hay match.
        </p>
      </div>

      {/* ── Análisis de Dotación + brechas ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          👷 Dotación y brechas de especialidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">HH en críticos A/B</div>
            <div className="text-2xl font-bold tabular-nums">{dotacionAnalysis.usedCritical}h</div>
            <div className="text-[10px] text-gray-500 mt-1">{dotacionAnalysis.pctCritical}% del total</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
            <div className="text-[10px] uppercase font-bold text-gray-700 mb-1">HH en no-críticos C/D</div>
            <div className="text-2xl font-bold tabular-nums">{dotacionAnalysis.usedNonCritical}h</div>
            <div className="text-[10px] text-gray-500 mt-1">{100 - dotacionAnalysis.pctCritical}% del total</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-[10px] uppercase font-bold text-blue-700 mb-1">Total HH ejecutadas</div>
            <div className="text-2xl font-bold tabular-nums">{dotacionAnalysis.totalUsed}h</div>
            <div className="text-[10px] text-gray-500 mt-1">en período analizado</div>
          </div>
        </div>
        {dotacionAnalysis.bySpec.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-600 mb-2">HH por especialidad</h4>
            <div className="space-y-1.5">
              {dotacionAnalysis.bySpec.map(([spec, hh]) => {
                const pct = Math.round(hh / dotacionAnalysis.totalUsed * 100);
                return (
                  <div key={spec} className="flex items-center gap-2">
                    <span className="text-xs font-mono w-32 truncate">{spec}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums w-16 text-right">{Math.round(hh)}h</span>
                    <span className="text-[10px] text-gray-500 tabular-nums w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-3">
          Jorge 2026-04-28 17:56: "estamos usando más HH en críticos vs no-críticos? ¿brechas hidráulico/neumático?". Si la mayoría de HH no van a equipos críticos = recurso mal asignado.
        </p>
      </div>

      {/* ── Jack-Knife Diagram (Jorge transcript 2026-04-29 13:44) ── */}
      <JackKnifeSection data={importedJigsaw?.jackKnife || jackKnifeData} sourceLabel={importedJigsaw ? `📂 Excel: ${importedJigsaw.filename}` : null} />


      {/* ── Comparativa OTs similares (sólo críticos A/B) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            📈 Comparativa OTs similares (mejor / promedio / peor caso)
          </h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-cyan-100 text-cyan-700">
            {otComparativa.length} grupos · sólo críticos A/B
          </span>
        </div>
        {otComparativa.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin grupos suficientes (≥3 OTs cerradas mismo trabajo, mismo work_center) en críticos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-cyan-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Trabajo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">N° OTs</th>
                  <th className="text-center px-2 py-1.5 font-bold text-emerald-700">Mejor</th>
                  <th className="text-center px-2 py-1.5 font-bold text-blue-700">Promedio</th>
                  <th className="text-center px-2 py-1.5 font-bold text-red-700">Peor</th>
                  <th className="text-center px-2 py-1.5 font-bold text-amber-700">Spread</th>
                </tr>
              </thead>
              <tbody>
                {otComparativa.map((g, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-cyan-50/30">
                    <td className="px-2 py-2 text-gray-800 max-w-[250px] truncate" title={g.desc}>{g.desc}</td>
                    <td className="px-2 py-2 text-center">{g.count}</td>
                    <td className="px-2 py-2 text-center text-emerald-700 font-bold tabular-nums">
                      {g.best.actual_hours}h
                      <div className="text-[9px] text-gray-500 font-normal">
                        <button onClick={() => navigate(`/work-management?tab=planning&openWoNumber=${g.best.wo_number}`)} className="hover:underline">{g.best.wo_number}</button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-blue-700 font-bold tabular-nums">{g.avg}h</td>
                    <td className="px-2 py-2 text-center text-red-700 font-bold tabular-nums">
                      {g.worst.actual_hours}h
                      <div className="text-[9px] text-gray-500 font-normal">
                        <button onClick={() => navigate(`/work-management?tab=planning&openWoNumber=${g.worst.wo_number}`)} className="hover:underline">{g.worst.wo_number}</button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-amber-700 font-bold tabular-nums">+{g.spread}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "cambio de motor: 60h, 55h, 70h. Mejor 55, promedio 50, peor 70 — ¿qué hicimos distinto en peor? Identificar oportunidades para los críticos". Spread alto = oportunidad de estandarizar.
        </p>
      </div>

      {/* ── Close-the-loop tracking (acciones RCA/CAPA abiertas/vencidas/cerradas) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          🔄 Close-the-loop tracking de acciones
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-[10px] uppercase font-bold text-blue-700">Total acciones</div>
            <div className="text-2xl font-bold tabular-nums">{closeTheLoop.total}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="text-[10px] uppercase font-bold text-amber-700">Abiertas</div>
            <div className="text-2xl font-bold tabular-nums">{closeTheLoop.open}</div>
            <div className="text-[10px] text-gray-500">{closeTheLoop.open_pct}% del total</div>
          </div>
          <div className={`rounded-lg p-3 border ${closeTheLoop.overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`text-[10px] uppercase font-bold ${closeTheLoop.overdue > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {closeTheLoop.overdue > 0 ? '⚠ Vencidas' : '✓ Sin vencidas'}
            </div>
            <div className="text-2xl font-bold tabular-nums">{closeTheLoop.overdue}</div>
            <div className="text-[10px] text-gray-500">expuestos a recurrencia</div>
          </div>
        </div>
        {closeTheLoop.overdue_actions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-red-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Título acción</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Categoría</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Vencida hace</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Pri.</th>
                </tr>
              </thead>
              <tbody>
                {closeTheLoop.overdue_actions.map((a, i) => (
                  <tr key={i} className="border-t border-gray-100 bg-red-50/40 hover:bg-red-100/30">
                    <td className="px-2 py-2 text-gray-800 max-w-[300px] truncate" title={a.title}>{a.title}</td>
                    <td className="px-2 py-2 text-gray-600">{a.category}</td>
                    <td className="px-2 py-2 font-mono text-blue-700">{a.equipment}</td>
                    <td className="px-2 py-2 text-center font-bold text-red-700">{a.days_overdue}d</td>
                    <td className="px-2 py-2 text-center text-xs">{a.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "una cosa es el análisis, otra cosa es la acción, y otra cosa es que la acción se haga y se cierre. Mientras no se cierre, seguimos expuestos a que la falla siga ocurriendo".
        </p>
      </div>

      {/* ── Cruce con Estrategia ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          📅 Cruce con Estrategia (frecuencia real vs planificada)
        </h3>
        {strategyMismatches.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin desviaciones de cadencia detectadas en mantenimientos preventivos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Trabajo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Ejecuciones</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Cadencia real</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Sugerencia IA</th>
                </tr>
              </thead>
              <tbody>
                {strategyMismatches.map((s, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-amber-50/30">
                    <td className="px-2 py-2 font-mono text-blue-700">{s.equipment}</td>
                    <td className="px-2 py-2 text-gray-800 max-w-[200px] truncate">{s.description}</td>
                    <td className="px-2 py-2 text-center font-bold">{s.executions}</td>
                    <td className="px-2 py-2 text-center font-bold text-amber-700 tabular-nums">{s.avg_interval_days}d</td>
                    <td className="px-2 py-2 text-gray-600 text-xs italic">{s.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "si la estrategia se definió cada 3 meses y ahora se ejecuta cada 2 meses, hay que ajustar la estrategia o hay un problema en el material/operación".
        </p>
        {strategyMismatches.length > 0 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate('/strategy')}
              className="text-xs px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700">
              ↗ Ajustar estrategias en Strategy module
            </button>
            <button
              onClick={() => navigate('/rca')}
              className="text-xs px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700">
              ↗ Abrir RCA por falla crónica subyacente
            </button>
          </div>
        )}
      </div>

      {/* ── KPIs de Costo + clases de gasto ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          💰 Costos y clases de gasto
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-700">Mano de obra</div>
            <div className="text-lg font-bold tabular-nums">${costKpis.totalLabor.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Materiales</div>
            <div className="text-lg font-bold tabular-nums">${costKpis.totalMaterial.toLocaleString()}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-700">Servicios ext.</div>
            <div className="text-lg font-bold tabular-nums">${costKpis.totalExternal.toLocaleString()}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 border border-purple-200 text-center">
            <div className="text-[10px] uppercase font-bold text-purple-700">Total real</div>
            <div className="text-lg font-bold tabular-nums">${costKpis.totalActual.toLocaleString()}</div>
          </div>
          <div className={`rounded-lg p-2 border text-center ${Math.abs(costKpis.variance_pct) <= 10 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-[10px] uppercase font-bold text-gray-700">Desv. presupuesto</div>
            <div className={`text-lg font-bold tabular-nums ${Math.abs(costKpis.variance_pct) <= 10 ? 'text-emerald-700' : 'text-red-700'}`}>
              {costKpis.variance_pct > 0 ? '+' : ''}{costKpis.variance_pct}%
            </div>
          </div>
        </div>
        {costKpis.byCenter.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-600 mb-2">Por work center (plan vs real)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-bold">Work Center</th>
                    <th className="text-right px-2 py-1.5 font-bold">Plan</th>
                    <th className="text-right px-2 py-1.5 font-bold">Real</th>
                    <th className="text-right px-2 py-1.5 font-bold">Desv.</th>
                  </tr>
                </thead>
                <tbody>
                  {costKpis.byCenter.map(([c, m]) => {
                    const dev = m.plan > 0 ? Math.round((m.real - m.plan) / m.plan * 100) : 0;
                    return (
                      <tr key={c} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-mono">{c}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">${Math.round(m.plan).toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-bold">${Math.round(m.real).toLocaleString()}</td>
                        <td className={`px-2 py-1.5 text-right tabular-nums font-bold ${Math.abs(dev) <= 10 ? 'text-emerald-700' : 'text-red-700'}`}>{dev > 0 ? '+' : ''}{dev}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "centro de costo asocia el equipo, las clases de gasto sub-clasifican (repuesto/servicio/insumo)". Conexión SAP en Phase 2.
        </p>
      </div>

      {/* ── Catálogo de falla: tendencias ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          📚 Catálogo de falla — tendencias parte / síntoma / causa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Top Partes Objeto', data: failureCatalogTrends.parts, color: 'bg-blue-50 border-blue-200', tone: 'text-blue-700' },
            { title: 'Top Síntomas', data: failureCatalogTrends.symptoms, color: 'bg-amber-50 border-amber-200', tone: 'text-amber-700' },
            { title: 'Top Causas', data: failureCatalogTrends.causes, color: 'bg-rose-50 border-rose-200', tone: 'text-rose-700' },
          ].map(({ title, data, color, tone }) => (
            <div key={title} className={`rounded-lg p-3 border ${color}`}>
              <div className={`text-[10px] uppercase font-bold mb-2 ${tone}`}>{title}</div>
              {data.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Sin data suficiente</p>
              ) : (
                <ul className="space-y-1">
                  {data.map(([label, count], i) => (
                    <li key={i} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1" title={label}>{label}</span>
                      <span className="ml-2 font-bold tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 italic mt-3">
          Jorge 2026-04-28 17:56: "lo más importante es la información que arroje en parte_objeto, síntomas y causas. Si se repiten varias partes/síntomas/causas → priorizar por repetibilidad y abrir RCA/FMECA".
        </p>
      </div>

      {/* ── Causas de no-cumplimiento ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
          🚧 Causas de no-cumplimiento de OTs
          {aiNoncomplianceLoading && <span className="text-[9px] text-gray-400 italic">Claude clasificando…</span>}
          {aiNoncompliance?.ai_used && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300" title={`Claude clasificó ${aiNoncompliance.total_notes} notas en ${aiNoncompliance.categories?.length || 0} categorías${aiNoncompliance.emerging?.length ? ` + ${aiNoncompliance.emerging.length} emergentes` : ''}`}>
              🤖 Claude NLP
            </span>
          )}
          {aiNoncompliance && !aiNoncompliance.ai_used && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">
              ⚠ Fallback regex
            </span>
          )}
        </h3>
        {nonComplianceCauses.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Sin causas de no-cumplimiento registradas en notes.
          </p>
        ) : (
          <div className="space-y-1.5">
            {nonComplianceCauses.map(([cause, count], i) => {
              const max = nonComplianceCauses[0][1];
              const pct = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs flex-1 truncate">{cause}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-red-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-3">
          Jorge 2026-04-28 17:56: "no se hizo porque [repuesto/operaciones/servicio externo/herramienta descalibrada]". La IA lee comments de notificación y clasifica las causas.
        </p>
        {nonComplianceCauses.length > 0 && (
          <button
            onClick={() => navigate('/improvement-actions?source=performance_analysis&category=ExecutionFailure')}
            className="mt-3 text-xs px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">
            ↗ Crear acciones de mejora desde estas causas
          </button>
        )}
      </div>

      {/* ── SF-588: Costos drill-down por UT + clase de gasto ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            🌳 SF-588 · Costos por Ubicación Técnica + Clase de gasto
          </h3>
          {costAnalysisData?.summary_by_element?.length > 0 && (
            <div className="text-xs text-gray-500">
              {costAnalysisData.summary_by_element.length} clases de gasto
            </div>
          )}
        </div>
        {!costAnalysisData ? (
          <p className="text-sm text-gray-400 italic text-center py-4">Cargando análisis…</p>
        ) : (
          <>
            {/* Resumen por clase de gasto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {(costAnalysisData.summary_by_element || []).slice(0, 8).map(e => {
                const elTone = {
                  'REPUESTO_CONSUMIBLE': 'bg-emerald-50 border-emerald-200 text-emerald-800',
                  'REPUESTO_CRITICO': 'bg-red-50 border-red-200 text-red-800',
                  'REPUESTO_ELECTRICO': 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  'INSUMO_LUBRICANTE': 'bg-blue-50 border-blue-200 text-blue-800',
                  'HERRAMIENTA_EQUIPO': 'bg-orange-50 border-orange-200 text-orange-800',
                  'MANO_DE_OBRA': 'bg-purple-50 border-purple-200 text-purple-800',
                  'SERVICIO_EXTERNO': 'bg-rose-50 border-rose-200 text-rose-800',
                }[e.element] || 'bg-gray-50 border-gray-200 text-gray-700';
                return (
                  <div key={e.element} className={`rounded-lg p-2 border text-center ${elTone}`}>
                    <div className="text-[10px] uppercase font-bold leading-tight">{e.label}</div>
                    <div className="text-base font-bold tabular-nums mt-1">${Math.round(e.real).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
            {/* Drill-down tree */}
            {(costAnalysisData.tree || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-3">Sin nodos de jerarquía con costos.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-bold">Ubicación Técnica</th>
                      <th className="text-center px-2 py-2 font-bold">Tipo</th>
                      <th className="text-right px-2 py-2 font-bold">Plan</th>
                      <th className="text-right px-2 py-2 font-bold">Real</th>
                      <th className="text-right px-2 py-2 font-bold">Desv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows = [];
                      const renderNode = (node, depth) => {
                        if (!node) return;
                        const id = node.node_id;
                        const isExpanded = expandedNodes.has(id);
                        const hasChildren = (node.children || []).length > 0;
                        const dev = node.variance_pct;
                        const devTone = Math.abs(dev) <= 10 ? 'text-emerald-700' : 'text-red-700';
                        rows.push(
                          <tr key={id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (!hasChildren) return;
                                const next = new Set(expandedNodes);
                                if (next.has(id)) next.delete(id); else next.add(id);
                                setExpandedNodes(next);
                              }}>
                            <td className="px-3 py-2" style={{ paddingLeft: 12 + depth * 20 }}>
                              {hasChildren ? (
                                <span className="inline-block w-4 text-center text-gray-400">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              ) : <span className="inline-block w-4" />}
                              <span className="font-semibold ml-1">{node.name}</span>
                              <span className="ml-2 text-[10px] text-gray-500 font-mono">{node.code}</span>
                              {node.criticality && ['A', 'B'].includes(node.criticality) && (
                                <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{node.criticality}</span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center text-gray-500 text-[10px]">{node.node_type}</td>
                            <td className="px-2 py-2 text-right tabular-nums">${Math.round(node.total_plan).toLocaleString()}</td>
                            <td className="px-2 py-2 text-right tabular-nums font-bold">${Math.round(node.total_real).toLocaleString()}</td>
                            <td className={`px-2 py-2 text-right tabular-nums font-bold ${devTone}`}>{dev > 0 ? '+' : ''}{dev}%</td>
                          </tr>
                        );
                        // Sub-row con desglose por elemento si está expandido
                        if (isExpanded && (node.by_element || []).length > 0) {
                          rows.push(
                            <tr key={id + '-elems'} className="bg-gray-50/50">
                              <td colSpan={5} style={{ paddingLeft: 32 + depth * 20 }} className="px-3 py-2">
                                <div className="flex flex-wrap gap-2">
                                  {(node.by_element || []).map(e => (
                                    <span key={e.element} className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-gray-200 text-[11px]">
                                      <span className="text-gray-600">{e.label}:</span>
                                      <span className="font-bold ml-1">${Math.round(e.real).toLocaleString()}</span>
                                      <span className="text-gray-400 ml-1">({e.wo_count} OT)</span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                          (node.children || []).forEach(c => renderNode(c, depth + 1));
                        }
                      };
                      (costAnalysisData.tree || []).forEach(r => renderNode(r, 0));
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: "centro de costo asocia el equipo, las clases de gasto sub-clasifican (repuesto/servicio/insumo/lubricante)". Click en una fila con ▶ para expandir y ver el desglose por clase de gasto.
        </p>
      </div>

      {/* ── SF-589: Predicción de quiebre de stock IA ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            📦 SF-589 · Predicción de quiebre stock IA
            {aiOCRecs?.ai_used && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300">🤖 Claude OC</span>
            )}
          </h3>
          {stockForecastData?.summary && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">{stockForecastData.summary.critical_count} críticos</span>
              <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-bold">{stockForecastData.summary.high_count} altos</span>
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">{stockForecastData.summary.medium_count} medios</span>
            </div>
          )}
        </div>
        {!stockForecastData ? (
          <p className="text-sm text-gray-400 italic text-center py-4">Cargando forecast…</p>
        ) : stockForecastData.items.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">Sin data de inventario o consumo histórico.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="text-center px-2 py-1.5 font-bold">Riesgo</th>
                  <th className="text-left px-2 py-1.5 font-bold">SAP code</th>
                  <th className="text-left px-2 py-1.5 font-bold">Descripción</th>
                  <th className="text-right px-2 py-1.5 font-bold">Stock disp.</th>
                  <th className="text-right px-2 py-1.5 font-bold">Reservado</th>
                  <th className="text-right px-2 py-1.5 font-bold">Consumo/día</th>
                  <th className="text-right px-2 py-1.5 font-bold">Cobertura</th>
                  <th className="text-right px-2 py-1.5 font-bold">Demanda 30d</th>
                  <th className="text-right px-2 py-1.5 font-bold">Sugerido OC</th>
                </tr>
              </thead>
              <tbody>
                {stockForecastData.items.slice(0, 15).map((it, i) => {
                  const tone = it.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300' :
                                it.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                it.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                it.risk_level === 'UNKNOWN' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                'bg-emerald-100 text-emerald-800 border-emerald-300';
                  const rowTint = it.risk_level === 'CRITICAL' ? 'bg-red-50/40' :
                                   it.risk_level === 'HIGH' ? 'bg-orange-50/40' : '';
                  return (
                    <tr key={i} className={`border-t border-gray-100 ${rowTint} hover:bg-emerald-50/30`}>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tone}`}>{it.risk_level}</span>
                      </td>
                      <td className="px-2 py-1.5 font-mono">{it.material_code}</td>
                      <td className="px-2 py-1.5 max-w-[240px] truncate" title={it.description}>{it.description || '—'}</td>
                      <td className="px-2 py-1.5 text-right font-bold">{it.stock_available}</td>
                      <td className="px-2 py-1.5 text-right text-gray-500">{it.stock_reserved}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{it.daily_avg_consumption}</td>
                      <td className={`px-2 py-1.5 text-right font-bold tabular-nums ${it.coverage_days != null && it.coverage_days < 14 ? 'text-red-600' : it.coverage_days != null && it.coverage_days < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {it.coverage_days != null ? `${it.coverage_days}d` : '—'}
                      </td>
                      <td className={`px-2 py-1.5 text-right ${it.will_break_30d ? 'text-red-600 font-bold' : ''}`}>
                        {it.planned_demand_30d}
                        {it.will_break_30d && <span className="ml-1 text-[10px]">⚠</span>}
                      </td>
                      <td className={`px-2 py-1.5 text-right font-bold ${it.suggested_order_qty > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                        {it.suggested_order_qty > 0 ? `+${it.suggested_order_qty}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {aiOCRecs?.recommendations?.length > 0 && (
          <div className="mt-3 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-3">
            <div className="text-[11px] font-bold text-purple-900 mb-2">🤖 Claude — recomendación de OC ({aiOCRecs.items_analyzed} códigos analizados)</div>
            <div className="space-y-1.5">
              {aiOCRecs.recommendations.slice(0, 8).map((r, i) => (
                <div key={i} className="rounded bg-white/80 border border-purple-100 p-2 text-[11px] flex items-start gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${r.priority === 'HIGH' ? 'bg-red-200 text-red-800' : r.priority === 'MEDIUM' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>{r.priority}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-purple-800">
                      {r.code} {r.description ? `· ${r.description.slice(0, 40)}` : ''} → OC {r.qty_suggested}
                    </div>
                    <div className="text-gray-700">{r.reasoning}</div>
                    <div className="text-[9px] text-gray-500">disponible {r.available} · cobertura {r.coverage_days}d</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-500 italic mt-2">
          Jorge 2026-04-28 17:56: la IA cruza consumo histórico (90d) + demanda planificada (60d) vs stock disponible. <strong>Cobertura</strong>= stock_disp / consumo_diario_promedio. <strong>Sugerido OC</strong>= cantidad para llegar a 60 días de cobertura. Riesgo: 🔴 CRITICAL &lt;7d · 🟠 HIGH &lt;14d · 🟡 MEDIUM &lt;30d · 🟢 LOW ≥30d. Cuando una OT cierra, se descuenta stock automáticamente de bodega.
        </p>
      </div>

      {/* Quick Actions — Route back to other phases or create improvement actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Acciones Rapidas desde Analisis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Crear Accion — Estrategia', cat: 'Strategy', icon: TrendingUp, color: 'bg-purple-600' },
            { label: 'Crear Accion — Planning', cat: 'Planning', icon: Calendar, color: 'bg-blue-600' },
            { label: 'Crear Accion — Spare parts', cat: 'Spare Parts', icon: AlertTriangle, color: 'bg-amber-600' },
            { label: 'Crear Accion — Ejecucion', cat: 'Execution', icon: Users, color: 'bg-emerald-600' },
          ].map(item => (
            <button
              key={item.cat}
              onClick={() => handleCreateAction(item.cat)}
              disabled={creatingAction}
              className={`${item.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              <item.icon size={20} className="mb-2" />
              <p className="text-sm font-medium">{item.label}</p>
              {creatingAction && <Loader2 size={14} className="animate-spin mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation back to other phases */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Volver a Fases del Ciclo</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'identification', label: '1. Identificacion' },
            { id: 'planning', label: '2. Planning' },
            { id: 'scheduling', label: '3. Scheduling' },
            { id: 'execution', label: '4. Ejecucion' },
            { id: 'closure', label: '5. Cierre' },
          ].map(phase => (
            <button
              key={phase.id}
              onClick={() => onNavigateTab?.(phase.id)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Post-Maintenance Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Revisiones Post-Mantenimiento Recientes</h3>
          <div className="space-y-2">
            {reviews.slice(0, 5).map(r => (
              <div key={r.review_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-900">{r.period_start} → {r.period_end}</span>
                  <span className="ml-2 text-xs text-gray-500">OTs: {r.wo_summary?.total || 0}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  r.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Meeting Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowMeetingForm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">Registrar Reunion de Desempeno</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={meetingForm.date} onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })} className="w-full border rounded-lg p-2 mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Asistentes</label>
              <input value={meetingForm.attendees} onChange={e => setMeetingForm({ ...meetingForm, attendees: e.target.value })} className="w-full border rounded-lg p-2 mt-1" placeholder="Nombres separados por coma" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notas / Decisiones</label>
              <textarea value={meetingForm.notes} onChange={e => setMeetingForm({ ...meetingForm, notes: e.target.value })} className="w-full border rounded-lg p-2 mt-1" rows={3} placeholder="Resumen de la reunion y decisiones tomadas..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowMeetingForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSaveMeeting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// Jorge transcript 2026-04-29 13:44 — Jack-Knife scatter chart
// ──────────────────────────────────────────────────────────────────────────
function JackKnifeSection({ data, sourceLabel }) {
  const [logScale, setLogScale] = useState(false);
  const items = data?.items || [];
  const tFreq = data?.thresholdFreq || 0;
  const tMttr = data?.thresholdMttr || 0;
  // Recharts ScatterChart data
  const scatterByQuadrant = {
    LEVE: items.filter(p => p.quadrant === 'LEVE'),
    CRONICO: items.filter(p => p.quadrant === 'CRONICO'),
    GRAVE: items.filter(p => p.quadrant === 'GRAVE'),
    GRAVE_CRONICO: items.filter(p => p.quadrant === 'GRAVE_CRONICO'),
  };
  const fmtPoint = (arr) => arr.map(p => ({ x: p.frequency, y: p.mttr, equipment: p.equipment, criticality: p.criticality }));
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          🔪 Jack-Knife Diagram (4 cuadrantes)
          {sourceLabel && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">{sourceLabel}</span>}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setLogScale(!logScale)}
            className={`text-xs px-3 py-1 rounded border font-semibold ${logScale ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300'}`}>
            Escala log {logScale ? 'ON' : 'OFF'}
          </button>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
            {items.length} equipos
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">
          Sin OTs cerradas suficientes para clasificar.
        </p>
      ) : (
        <>
          {/* Thresholds banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
            <div className="bg-purple-50 rounded p-2 text-center border border-purple-200">
              <div className="text-[10px] uppercase font-bold text-purple-700">Threshold MTTR (eje Y)</div>
              <div className="text-base font-bold tabular-nums">{tMttr}h</div>
              <div className="text-[9px] text-gray-500">Σtiempo / Σparadas</div>
            </div>
            <div className="bg-purple-50 rounded p-2 text-center border border-purple-200">
              <div className="text-[10px] uppercase font-bold text-purple-700">Threshold Frec (eje X)</div>
              <div className="text-base font-bold tabular-nums">{tFreq}</div>
              <div className="text-[9px] text-gray-500">Σparadas / n_equipos</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-700">Total paradas</div>
              <div className="text-base font-bold tabular-nums">{data.totalParadas}</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-700">Total tiempo</div>
              <div className="text-base font-bold tabular-nums">{Math.round(data.totalTiempo)}h</div>
            </div>
          </div>
          {/* Scatter chart */}
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Frecuencia" scale={logScale ? 'log' : 'linear'} domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                label={{ value: 'N° paradas (frecuencia)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="MTTR (h)" scale={logScale ? 'log' : 'linear'} domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                label={{ value: 'MTTR (h)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis range={[80, 80]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-300 rounded p-2 text-xs shadow">
                      <div className="font-mono font-bold">{p.equipment}</div>
                      <div>Criticidad: {p.criticality}</div>
                      <div>Frec: {p.x}</div>
                      <div>MTTR: {p.y}h</div>
                    </div>
                  );
                }} />
              <ReferenceLine x={tFreq} stroke="#6b21a8" strokeDasharray="4 4" />
              <ReferenceLine y={tMttr} stroke="#6b21a8" strokeDasharray="4 4" />
              <Scatter name="LEVE" data={fmtPoint(scatterByQuadrant.LEVE)} fill="#10b981" />
              <Scatter name="CRÓNICO" data={fmtPoint(scatterByQuadrant.CRONICO)} fill="#f59e0b" />
              <Scatter name="GRAVE" data={fmtPoint(scatterByQuadrant.GRAVE)} fill="#f97316" />
              <Scatter name="GRAVE+CRÓNICO" data={fmtPoint(scatterByQuadrant.GRAVE_CRONICO)} fill="#dc2626" />
            </ScatterChart>
          </ResponsiveContainer>
          {/* Quadrant legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[10px]">
            <div className="bg-emerald-50 rounded p-2 border border-emerald-200">
              <div className="font-bold text-emerald-800">✓ LEVE (no priorizar)</div>
              <div className="text-emerald-700">Pocas paradas + MTTR bajo</div>
              <div className="font-bold mt-1">{scatterByQuadrant.LEVE.length} equipos</div>
            </div>
            <div className="bg-amber-50 rounded p-2 border border-amber-200">
              <div className="font-bold text-amber-800">🔁 CRÓNICO</div>
              <div className="text-amber-700">Muchas paradas + MTTR bajo · confiabilidad baja</div>
              <div className="font-bold mt-1">{scatterByQuadrant.CRONICO.length} equipos</div>
            </div>
            <div className="bg-orange-50 rounded p-2 border border-orange-200">
              <div className="font-bold text-orange-800">⚠ GRAVE</div>
              <div className="text-orange-700">Pocas paradas + MTTR alto · mantenibilidad deficiente</div>
              <div className="font-bold mt-1">{scatterByQuadrant.GRAVE.length} equipos</div>
            </div>
            <div className="bg-red-50 rounded p-2 border border-red-300">
              <div className="font-bold text-red-800">🚨 GRAVE+CRÓNICO</div>
              <div className="text-red-700">Disponibilidad afectada · prioridad #1</div>
              <div className="font-bold mt-1">{scatterByQuadrant.GRAVE_CRONICO.length} equipos</div>
            </div>
          </div>
          {/* Tabla equipo más críticos */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs">
              <thead className="bg-purple-50">
                <tr>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Crit.</th>
                  <th className="text-left px-2 py-1.5 font-bold text-gray-700">Equipo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Frec</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Σ Tiempo</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">MTTR</th>
                  <th className="text-center px-2 py-1.5 font-bold text-gray-700">Cuadrante</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 12).map(p => {
                  const qTone = p.quadrant === 'GRAVE_CRONICO' ? 'bg-red-600 text-white' :
                                 p.quadrant === 'GRAVE' ? 'bg-orange-500 text-white' :
                                 p.quadrant === 'CRONICO' ? 'bg-amber-400 text-amber-900' :
                                 'bg-emerald-100 text-emerald-700';
                  const qLabel = p.quadrant === 'GRAVE_CRONICO' ? '🚨 Grave+Crónico' :
                                  p.quadrant === 'GRAVE' ? '⚠ Grave' :
                                  p.quadrant === 'CRONICO' ? '🔁 Crónico' : '✓ Leve';
                  const critTone = p.criticality === 'A' ? 'bg-red-600 text-white' :
                                    p.criticality === 'B' ? 'bg-orange-500 text-white' :
                                    p.criticality === 'C' ? 'bg-amber-300 text-amber-900' :
                                    'bg-gray-200 text-gray-700';
                  return (
                    <tr key={p.equipment} className="border-t border-gray-100 hover:bg-purple-50/30">
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${critTone}`}>{p.criticality}</span>
                      </td>
                      <td className="px-2 py-2 font-mono text-blue-700">{p.equipment}</td>
                      <td className="px-2 py-2 text-center font-bold">{p.frequency}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{p.total_hours}h</td>
                      <td className="px-2 py-2 text-center tabular-nums">{p.mttr}h</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${qTone}`}>{qLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="text-[10px] text-gray-500 italic mt-3">
        Jorge transcript 2026-04-29 13:44: thresholds calculados según fórmula textual ·
        <strong> MTTR threshold</strong> = Σtiempo_paradas / Σparadas ·
        <strong> Frec threshold</strong> = Σparadas / n_razones ·
        <strong> Escala log</strong> = transforma curvas de no-disponibilidad en líneas rectas (útil para ver clusters densos).
      </p>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// SF-582 / Jorge transcript 2026-04-29 13:44 — Pareto con gráfico dual-axis
// ──────────────────────────────────────────────────────────────────────────
function ParetoSection({ data, sourceLabel }) {
  const [mode, setMode] = useState('byCount'); // 'byCount' | 'byHours'
  const items = data?.[mode] || [];
  const top80Count = items.filter(f => f.inTop80).length;
  const valueLabel = mode === 'byHours' ? 'Horas detención' : 'Frecuencia';
  const valueKey = mode === 'byHours' ? 'hours' : 'count';
  // Adaptar para recharts ComposedChart
  const chartData = items.map(it => ({
    name: it.mode.length > 18 ? it.mode.slice(0, 18) + '…' : it.mode,
    fullName: it.mode,
    [valueKey]: it.value,
    cumPct: it.cumPct,
    inTop80: it.inTop80,
  }));
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          📊 Pareto modos de falla (80/20) · {mode === 'byHours' ? 'por tiempo' : 'por frecuencia'}
          {sourceLabel && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">{sourceLabel}</span>}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button onClick={() => setMode('byCount')}
              className={`px-3 py-1 text-xs font-semibold ${mode === 'byCount' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              N° fallas
            </button>
            <button onClick={() => setMode('byHours')}
              className={`px-3 py-1 text-xs font-semibold ${mode === 'byHours' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Horas detención
            </button>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
            {top80Count} modos = 80%
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">
          {mode === 'byHours' ? 'Sin OTs cerradas con HH para calcular tiempo.' : 'Sin data de modos de falla suficiente.'}
        </p>
      ) : (
        <>
          {/* Gráfico dual-axis: barras (frecuencia/horas) + línea (% acumulado) */}
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={60} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: valueLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: '% acumulado', angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip
                formatter={(value, name, p) => {
                  if (name === '% acum') return `${value}%`;
                  return mode === 'byHours' ? `${value}h` : value;
                }}
                labelFormatter={(label, p) => p?.[0]?.payload?.fullName || label}
              />
              <Bar yAxisId="left" dataKey={valueKey} name={valueLabel}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.inTop80 ? '#dc2626' : '#9ca3af'} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumPct" name="% acum" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} />
              <ReferenceLine yAxisId="right" y={80} stroke="#dc2626" strokeDasharray="4 4" label={{ value: '80%', position: 'right', fontSize: 10, fill: '#dc2626' }} />
            </ComposedChart>
          </ResponsiveContainer>
          {/* Tabla detallada debajo del gráfico */}
          <div className="space-y-1 mt-3">
            {items.map((fm, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${fm.inTop80 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <span className="font-mono text-[10px] w-6 text-gray-500">#{i + 1}</span>
                <span className="flex-1 font-medium text-gray-800 truncate" title={fm.mode}>{fm.mode}</span>
                <span className="font-bold tabular-nums w-16 text-right">{fm.value}{mode === 'byHours' ? 'h' : ''}</span>
                <span className="text-[10px] text-gray-500 tabular-nums w-12 text-right">{fm.pct}%</span>
                <span className="text-[10px] font-bold text-gray-700 tabular-nums w-12 text-right">{fm.cumPct}%</span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-[10px] text-gray-500 italic mt-3">
        Jorge transcript 2026-04-29 13:44: "El dato puede ser frecuencia o tiempo de detención. El 80% de las fallas concentradas en pocos sistemas — donde hay que enfocar al ingeniero de confiabilidad". Barras rojas = modos en el top 80%, línea azul = % acumulado, referencia 80%.
      </p>
    </div>
  );
}

function JigsawImportBanner({ imported, loading, error, onUpload, onClear }) {
  const [drag, setDrag] = useState(false);
  const handleFile = (file) => {
    if (!file) return;
    const ok = /\.(xls|xlsx)$/i.test(file.name);
    if (!ok) return;
    onUpload(file);
  };
  return (
    <div className={`rounded-xl border p-4 ${imported ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200'}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            📂 Cargar Excel Jigsaw histórico (Pareto + Jack-Knife sobre data real)
          </h3>
          <p className="text-[11px] text-gray-600 mt-1">
            Sube un Excel Jigsaw (formato hoja <code className="font-mono">Sheet1</code> long-form, o hojas <code className="font-mono">CAM797*/PALAS/...</code>). El sistema agrupa por <strong>sistema</strong>, calcula thresholds Jorge (MTTR=Σh/Σparadas, Frec=Σparadas/n) y reemplaza los gráficos Pareto + Jack-Knife abajo con esos números.
          </p>
          {imported && (
            <div className="mt-2 text-xs text-emerald-800 bg-white/60 rounded-md px-2 py-1 inline-flex flex-wrap gap-x-3 gap-y-0.5">
              <span><strong>{imported.filename}</strong></span>
              <span>· {imported.events} eventos</span>
              <span>· {imported.n_sistemas} sistemas</span>
              <span>· hojas: {imported.sheets_used.join(', ')}</span>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-700 mt-2 bg-red-50 border border-red-200 rounded px-2 py-1">⚠ {error}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`cursor-pointer text-xs font-semibold px-4 py-2 rounded-md border-2 border-dashed ${drag ? 'border-indigo-500 bg-white' : 'border-indigo-300 bg-white/70'} text-indigo-700 hover:bg-white`}
          >
            {loading ? 'Procesando...' : (imported ? 'Cambiar archivo' : 'Seleccionar / arrastrar .xls')}
            <input type="file" accept=".xls,.xlsx" className="hidden" disabled={loading}
              onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
          {imported && (
            <button onClick={onClear} className="text-xs px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
              ✕ Volver a OTs sistema
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
