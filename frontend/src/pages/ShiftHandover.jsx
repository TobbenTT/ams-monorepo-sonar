import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ClipboardList, Sun, Moon, AlertTriangle, CheckCircle2,
  Clock, Users, Shield, Loader2, ChevronRight, FileText,
  Wrench, CircleDot, ArrowUpRight, MessageSquare
} from 'lucide-react';
import * as api from '../api';

/* ── colour maps ───────────────────────────────────────────────────── */

const PRIORITY_BADGE = {
  P1: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  P2: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  P3: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  P4: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
};

const STATUS_BADGE = {
  CERRADO:        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  COMPLETADO:     'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  EN_EJECUCION:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  EN_PROGRESO:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  PLANIFICADA:    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  PENDIENTE:      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  EN_PROGRAMACION:'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
};

/* ── helpers ───────────────────────────────────────────────────────── */

function defaultShiftType() {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? 'MORNING' : 'NIGHT';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count, color = 'text-foreground' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <h3 className={`font-semibold text-sm ${color}`}>{title}</h3>
      {count !== undefined && (
        <span className="ml-auto text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

/* ── OT mini-card ──────────────────────────────────────────────────── */

function OTCard({ ot }) {
  const prio = ot.priority || 'P3';
  const status = ot.status || 'PENDIENTE';
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">{ot.order_number || ot.id}</span>
          <Badge className={PRIORITY_BADGE[prio] || PRIORITY_BADGE.P3}>{prio}</Badge>
          <Badge className={STATUS_BADGE[status] || STATUS_BADGE.PENDIENTE}>{status.replace(/_/g, ' ')}</Badge>
        </div>
        <p className="text-sm font-medium truncate">{ot.description || ot.title || 'Sin descripcion'}</p>
        {ot.equipment_tag && (
          <p className="text-xs text-muted-foreground mt-0.5">{ot.equipment_tag}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </div>
  );
}

/* ── Technician progress row ───────────────────────────────────────── */

function TechnicianRow({ tech }) {
  const pct = tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0;
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {(tech.name || 'T')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{tech.name}</p>
            <p className="text-xs text-muted-foreground">{tech.specialty || 'Tecnico'}</p>
          </div>
        </div>
        <span className="text-sm font-bold">{pct}%</span>
      </div>
      {/* progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{tech.completed}/{tech.total} tareas</span>
        {tech.handover_notes && (
          <span className="italic text-xs truncate max-w-[200px]">"{tech.handover_notes}"</span>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */

export default function ShiftHandover() {
  const { plant } = useOutletContext();
  const { t } = useLanguage();

  const [shiftType, setShiftType] = useState(defaultShiftType);
  const [shiftDate, setShiftDate] = useState(todayISO);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  /* ── generate report ───────────────────────────────────────────── */

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateShiftHandover({
        plant_id: plant,
        shift_date: shiftDate,
        shift_type: shiftType,
      });
      setReport(res.data || res);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  /* ── derived data ──────────────────────────────────────────────── */

  const flags        = report?.attention_flags || [];
  const summary      = report?.summary || '';
  const completed    = report?.ots_completed || [];
  const inProgress   = report?.ots_in_progress || [];
  const pending      = report?.ots_pending || [];
  const technicians  = report?.technician_progress || [];
  const safetyAlerts = report?.safety_alerts || [];
  const slaUrgent    = report?.sla_urgent || [];
  const nextNotes    = report?.next_shift_notes || '';

  const otTab = useMemo(() => {
    return [
      { key: 'completed',  label: 'Completadas', items: completed,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
      { key: 'inProgress', label: 'En Progreso', items: inProgress, color: 'text-yellow-600',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',  icon: Clock },
      { key: 'pending',    label: 'Pendientes',  items: pending,    color: 'text-gray-500',    bg: 'bg-gray-50 dark:bg-gray-800',          icon: CircleDot },
    ];
  }, [completed, inProgress, pending]);

  const [activeOtTab, setActiveOtTab] = useState('completed');

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Entrega de Turno</h1>
            <p className="text-sm text-muted-foreground">Reporte consolidado para cambio de turno</p>
          </div>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Shift type toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Turno</label>
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShiftType('MORNING')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  shiftType === 'MORNING'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Sun className="w-4 h-4" />
                Dia
              </button>
              <button
                onClick={() => setShiftType('NIGHT')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  shiftType === 'NIGHT'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Moon className="w-4 h-4" />
                Noche
              </button>
            </div>
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</label>
            <input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="block w-full sm:w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !plant}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generar Reporte
              </>
            )}
          </button>
        </div>
      </Card>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!report && !loading && !error && (
        <Card className="text-center py-16">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-sm text-muted-foreground">
            Selecciona turno y fecha, luego presiona <strong>Generar Reporte</strong> para crear el informe de entrega de turno.
          </p>
        </Card>
      )}

      {/* ── Loading state ──────────────────────────────────────────── */}
      {loading && (
        <Card className="text-center py-16">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Consolidando datos del turno...</p>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════
         REPORT CONTENT
         ════════════════════════════════════════════════════════════ */}
      {report && !loading && (
        <div className="space-y-5">

          {/* 1. Attention Flags ──────────────────────────────────── */}
          {flags.length > 0 && (
            <div className="space-y-2">
              {flags.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{flag.title || 'Atencion'}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{flag.message || flag}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. AI Summary ──────────────────────────────────────── */}
          {summary && (
            <Card>
              <SectionHeader icon={FileText} title="Resumen del Turno" />
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{summary}</p>
            </Card>
          )}

          {/* 3. OTs del Turno ───────────────────────────────────── */}
          <Card>
            <SectionHeader icon={Wrench} title="Ordenes de Trabajo del Turno" count={completed.length + inProgress.length + pending.length} />

            {/* tab strip */}
            <div className="flex gap-2 mb-4">
              {otTab.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveOtTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeOtTab === tab.key
                      ? `${tab.bg} ${tab.color} border border-current/20`
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className="ml-1 font-bold">{tab.items.length}</span>
                </button>
              ))}
            </div>

            {/* OT list */}
            {(() => {
              const active = otTab.find((t) => t.key === activeOtTab);
              const items = active?.items || [];
              if (items.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No hay ordenes en esta categoria.
                  </p>
                );
              }
              return (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {items.map((ot, i) => (
                    <OTCard key={ot.id || i} ot={ot} />
                  ))}
                </div>
              );
            })()}
          </Card>

          {/* 4. Technician Progress ─────────────────────────────── */}
          {technicians.length > 0 && (
            <Card>
              <SectionHeader icon={Users} title="Progreso de Tecnicos" count={technicians.length} color="text-blue-600 dark:text-blue-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technicians.map((tech, i) => (
                  <TechnicianRow key={tech.id || i} tech={tech} />
                ))}
              </div>
            </Card>
          )}

          {/* 5. Safety Alerts ───────────────────────────────────── */}
          {safetyAlerts.length > 0 && (
            <Card>
              <SectionHeader icon={Shield} title="Alertas de Seguridad" count={safetyAlerts.length} color="text-red-600 dark:text-red-400" />
              <div className="space-y-2">
                {safetyAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50"
                  >
                    <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">{alert.title || alert.type || 'Alerta'}</p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{alert.description || alert.message || alert}</p>
                      {alert.equipment && (
                        <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">Equipo: {alert.equipment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 6. SLA Urgent ──────────────────────────────────────── */}
          {slaUrgent.length > 0 && (
            <Card>
              <SectionHeader icon={Clock} title="SLA Urgente (< 24h)" count={slaUrgent.length} color="text-orange-600 dark:text-orange-400" />
              <div className="space-y-2">
                {slaUrgent.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-orange-700 dark:text-orange-300">
                          {item.order_number || item.id}
                        </span>
                        {item.priority && (
                          <Badge className={PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.P2}>
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{item.description || item.title}</p>
                      {item.equipment_tag && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.equipment_tag}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{item.hours_remaining != null ? `${item.hours_remaining}h` : item.deadline || '--'}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-orange-400 ml-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 7. Next Shift Notes ────────────────────────────────── */}
          {nextNotes && (
            <Card>
              <SectionHeader icon={MessageSquare} title="Notas para Siguiente Turno" color="text-purple-600 dark:text-purple-400" />
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/40">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{nextNotes}</p>
              </div>
            </Card>
          )}

          {/* ── Report footer ──────────────────────────────────── */}
          <div className="text-center text-xs text-muted-foreground pb-4">
            Reporte generado el {new Date().toLocaleString('es-CL')} &mdash; Turno {shiftType === 'MORNING' ? 'Dia' : 'Noche'} &mdash; {shiftDate}
          </div>
        </div>
      )}
    </div>
  );
}
