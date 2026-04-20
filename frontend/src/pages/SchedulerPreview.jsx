// MAGEAM — Weekly Work Order Scheduler (preview route)
// Requested by: Jorge Cabezas (stakeholder decision).
// Design brief — modern-SaaS calendar-grid layout (NOT a 4-quadrant Gantt).
// Distinct from Prometheus Group GWOS / SAP WCM.
// Wraps the Ayudas/Diseño prototype as a real app route. Data is still
// sample — wire to backend in follow-up sprint.

import React, { useState } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Calendar, Bell, Settings, AlertTriangle, Wrench, Zap, Package,
  Droplet, Hammer, User, Users, Clock, GripVertical, Filter,
  Plus, X, Sparkles, CheckCircle2, Circle, Minimize2, Maximize2,
  ArrowRight, ArrowUpRight, MoreHorizontal, Sun, Moon, MapPin,
  PanelRightClose, FileText, Radio, Activity,
} from 'lucide-react';

// ─── Sample data ────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'mon', short: 'Mon', date: 'Mar 31' },
  { key: 'tue', short: 'Tue', date: 'Apr 01' },
  { key: 'wed', short: 'Wed', date: 'Apr 02' },
  { key: 'thu', short: 'Thu', date: 'Apr 03' },
  { key: 'fri', short: 'Fri', date: 'Apr 04' },
  { key: 'sat', short: 'Sat', date: 'Apr 05' },
  { key: 'sun', short: 'Sun', date: 'Apr 06' },
];

const WORK_CENTERS = [
  { key: 'MEC',  name: 'Mechanical',      icon: Wrench,  accent: 'emerald', nominalPerDay: 96 },
  { key: 'ELEC', name: 'Electrical',      icon: Zap,     accent: 'amber',   nominalPerDay: 60 },
  { key: 'INST', name: 'Instrumentation', icon: Radio,   accent: 'sky',     nominalPerDay: 48 },
  { key: 'CIV',  name: 'Civil',           icon: Hammer,  accent: 'stone',   nominalPerDay: 36 },
  { key: 'LUB',  name: 'Lubrication',     icon: Droplet, accent: 'indigo',  nominalPerDay: 24 },
];

const CAPACITY = {
  MEC:  [72, 84, 120, 88, 76, 40, 24],
  ELEC: [42, 54, 58, 48, 50, 18, 12],
  INST: [30, 36, 40, 44, 32, 12, 8],
  CIV:  [20, 28, 24, 32, 30, 10, 6],
  LUB:  [14, 18, 22, 18, 16, 8, 4],
};

const TECHS = {
  MEC: [
    { id: 't-mec-1', name: 'R. Gutiérrez', role: 'Mech. Lead', shift: '7x7',   avatar: 'RG' },
    { id: 't-mec-2', name: 'S. Navarro',   role: 'Mechanic',   shift: '7x7',   avatar: 'SN' },
    { id: 't-mec-3', name: 'J. Pizarro',   role: 'Mechanic',   shift: '14x14', avatar: 'JP' },
    { id: 't-mec-4', name: 'M. Fuentes',   role: 'Mechanic',   shift: '7x7',   avatar: 'MF' },
  ],
  ELEC: [
    { id: 't-ele-1', name: 'C. Rojas',   role: 'Elec. Lead',  shift: '7x7',   avatar: 'CR' },
    { id: 't-ele-2', name: 'A. Vega',    role: 'Electrician', shift: '14x14', avatar: 'AV' },
    { id: 't-ele-3', name: 'P. Aravena', role: 'Electrician', shift: '7x7',   avatar: 'PA' },
  ],
  INST: [
    { id: 't-ins-1', name: 'D. Contreras', role: 'I&C Tech', shift: '7x7',   avatar: 'DC' },
    { id: 't-ins-2', name: 'N. Herrera',   role: 'I&C Tech', shift: '14x14', avatar: 'NH' },
  ],
  CIV: [
    { id: 't-civ-1', name: 'E. Mora', role: 'Civil Tech', shift: '7x7', avatar: 'EM' },
  ],
  LUB: [
    { id: 't-lub-1', name: 'O. Salinas', role: 'Lube Tech', shift: '14x14', avatar: 'OS' },
  ],
};

const SCHEDULED = [
  { id: 's1', wo: 'WO-24871', title: 'SAG Mill 01 — liner inspection',  priority: 'P1', hh: 12, crew: 3, techId: 't-mec-1', day: 'mon', start: '08:00', end: '20:00', status: 'in-progress', specialty: 'MEC' },
  { id: 's2', wo: 'WO-24904', title: 'Conv. CV-103 — pulley alignment', priority: 'P2', hh: 6,  crew: 2, techId: 't-mec-1', day: 'tue', start: '08:00', end: '14:00', status: 'assigned',    specialty: 'MEC' },
  { id: 's3', wo: 'WO-24912', title: 'Pump P-205 — mechanical seal',    priority: 'P2', hh: 8,  crew: 2, techId: 't-mec-2', day: 'mon', start: '09:00', end: '17:00', status: 'assigned',    specialty: 'MEC' },
  { id: 's4', wo: 'WO-24918', title: 'Ball Mill 02 — trunnion grease',  priority: 'P3', hh: 4,  crew: 1, techId: 't-mec-2', day: 'tue', start: '13:00', end: '17:00', status: 'assigned',    specialty: 'MEC' },
  { id: 's5', wo: 'WO-24877', title: 'Crusher HP-800 — cone change-out',priority: 'P1', hh: 16, crew: 4, techId: 't-mec-3', day: 'wed', start: '07:00', end: '19:00', status: 'in-progress', specialty: 'MEC', expanded: true,
    ops: [
      { op: '0010', text: 'Lock-out / tag-out + safety perimeter',  specialty: 'MEC',  hh: 1.5, qty: 2 },
      { op: '0020', text: 'Hydraulic cone lift + rigging',           specialty: 'MEC',  hh: 4,   qty: 3 },
      { op: '0030', text: 'Electrical disconnect of drive cabinet',  specialty: 'ELEC', hh: 1,   qty: 1 },
      { op: '0040', text: 'Instrumentation recalibration + startup', specialty: 'INST', hh: 2.5, qty: 1 },
    ],
  },
  { id: 's6',  wo: 'WO-24925', title: 'Thickener rake drive bearing',    priority: 'P2', hh: 8,  crew: 2, techId: 't-mec-3', day: 'thu', start: '09:00', end: '17:00', status: 'assigned', specialty: 'MEC' },
  { id: 's7',  wo: 'WO-24902', title: 'Stockpile feeder belt retension', priority: 'P3', hh: 5,  crew: 2, techId: 't-mec-4', day: 'wed', start: '08:00', end: '13:00', status: 'assigned', specialty: 'MEC' },
  { id: 's8',  wo: 'WO-24931', title: 'Flotation cell 05 — impeller',    priority: 'P2', hh: 10, crew: 3, techId: 't-mec-4', day: 'fri', start: '08:00', end: '18:00', status: 'assigned', specialty: 'MEC' },
  { id: 's9',  wo: 'WO-24880', title: 'MCC-04 — thermographic survey',   priority: 'P2', hh: 5,  crew: 2, techId: 't-ele-1', day: 'mon', start: '10:00', end: '15:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's10', wo: 'WO-24891', title: 'Sub-station SE-12 — relay test',  priority: 'P1', hh: 7,  crew: 2, techId: 't-ele-1', day: 'wed', start: '08:00', end: '15:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's11', wo: 'WO-24908', title: 'VFD CV-103 — firmware upgrade',   priority: 'P3', hh: 4,  crew: 1, techId: 't-ele-2', day: 'tue', start: '09:00', end: '13:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's12', wo: 'WO-24929', title: 'Motor M-401 — insulation test',   priority: 'P3', hh: 3,  crew: 1, techId: 't-ele-3', day: 'thu', start: '14:00', end: '17:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's13', wo: 'WO-24895', title: 'Flow transmitter FT-210 — cal.',  priority: 'P2', hh: 4,  crew: 1, techId: 't-ins-1', day: 'tue', start: '08:30', end: '12:30', status: 'assigned', specialty: 'INST' },
  { id: 's14', wo: 'WO-24919', title: 'SAG PI loop tuning',              priority: 'P3', hh: 6,  crew: 2, techId: 't-ins-2', day: 'thu', start: '09:00', end: '15:00', status: 'assigned', specialty: 'INST' },
  { id: 's15', wo: 'WO-24867', title: 'Tailings line — anchor repair',   priority: 'P2', hh: 8,  crew: 3, techId: 't-civ-1', day: 'wed', start: '08:00', end: '16:00', status: 'assigned', specialty: 'CIV' },
  { id: 's16', wo: 'WO-24884', title: 'Weekly lube route — Concentrator',priority: 'P3', hh: 6,  crew: 1, techId: 't-lub-1', day: 'mon', start: '08:00', end: '14:00', status: 'done',     specialty: 'LUB' },
  { id: 's17', wo: 'WO-24915', title: 'Lube route — Crushing area',      priority: 'P3', hh: 5,  crew: 1, techId: 't-lub-1', day: 'thu', start: '09:00', end: '14:00', status: 'assigned', specialty: 'LUB' },
];

const UNSCHEDULED = [
  { id: 'u1', wo: 'WO-24940', title: 'SAG discharge chute — wear plate',    tag: 'MEC-3201-CHT', equip: 'SAG-01',    priority: 'P1', hh: 14, crew: 4, impact: 92, specialty: 'MEC',  aiNote: 'High impact · recurrent failure' },
  { id: 'u2', wo: 'WO-24941', title: 'HV breaker 13.8kV — overhaul',        tag: 'ELE-1108-BRK', equip: 'SE-08-BRK', priority: 'P1', hh: 10, crew: 2, impact: 88, specialty: 'ELEC', aiNote: 'Protection scheme review pending' },
  { id: 'u3', wo: 'WO-24942', title: 'Conveyor CV-207 — return roller set', tag: 'MEC-2207-RLR', equip: 'CV-207',    priority: 'P2', hh: 8,  crew: 2, impact: 74, specialty: 'MEC',  dragging: true },
  { id: 'u4', wo: 'WO-24943', title: 'Flotation pH sensor — replacement',   tag: 'INS-4505-PH',  equip: 'FLT-05',    priority: 'P2', hh: 3,  crew: 1, impact: 68, specialty: 'INST' },
  { id: 'u5', wo: 'WO-24944', title: 'Thickener underflow pump — seal',     tag: 'MEC-3308-SEA', equip: 'P-308',     priority: 'P2', hh: 6,  crew: 2, impact: 71, specialty: 'MEC' },
  { id: 'u6', wo: 'WO-24945', title: 'Substation SE-02 — IR scan',          tag: 'ELE-1102-IR',  equip: 'SE-02',     priority: 'P3', hh: 4,  crew: 1, impact: 55, specialty: 'ELEC' },
  { id: 'u7', wo: 'WO-24946', title: 'Screen 03 — deck panel replacement',  tag: 'MEC-2303-PNL', equip: 'SCR-03',    priority: 'P3', hh: 5,  crew: 2, impact: 52, specialty: 'MEC' },
  { id: 'u8', wo: 'WO-24947', title: 'Weigh feeder calibration',            tag: 'INS-4211-CAL', equip: 'WF-11',     priority: 'P3', hh: 2,  crew: 1, impact: 41, specialty: 'INST' },
  { id: 'u9', wo: 'WO-24948', title: 'Tank T-402 — ultrasonic thickness',   tag: 'CIV-5402-UTT', equip: 'T-402',     priority: 'P4', hh: 3,  crew: 1, impact: 28, specialty: 'CIV' },
];

const MATERIALS = [
  { wo: 'WO-24877', title: 'Crusher HP-800 cone change-out', status: 'ready',   reservation: 'RES-778214', items: '12 / 12', note: 'Cone liner + rigging kit staged at warehouse gate 3' },
  { wo: 'WO-24871', title: 'SAG Mill 01 liner inspection',   status: 'ready',   reservation: 'RES-778180', items: '5 / 5',   note: 'Boroscope kit checked out to RG' },
  { wo: 'WO-24891', title: 'SE-12 relay test',               status: 'ready',   reservation: 'RES-778225', items: '3 / 3',   note: 'Omicron set in calibration lab' },
  { wo: 'WO-24931', title: 'Flotation cell 05 impeller',     status: 'partial', reservation: 'RES-778241', items: '7 / 9',   note: '2 gaskets missing — ETA Thu 04' },
  { wo: 'WO-24925', title: 'Thickener rake bearing',         status: 'partial', reservation: 'RES-778198', items: '4 / 6',   note: 'SKF 23248 ETA Wed 02 · 14:00' },
  { wo: 'WO-24867', title: 'Tailings line anchor repair',    status: 'blocked', reservation: 'RES-778155', items: '1 / 5',   note: 'Anchor bolts M42 — supplier delay, escalated' },
];

const MINIMIZED = [
  { wo: 'WO-24877', title: 'Crusher HP-800 cone change-out', priority: 'P1', unread: 3 },
  { wo: 'WO-24940', title: 'SAG discharge chute — wear plate', priority: 'P1', unread: 0 },
  { wo: 'WO-24925', title: 'Thickener rake bearing',          priority: 'P2', unread: 1 },
  { wo: 'WO-24867', title: 'Tailings line anchor repair',     priority: 'P2', unread: 0, flagged: true },
];

// ─── Small parts ────────────────────────────────────────────────────────────

// Static Tailwind class maps (Tailwind JIT needs literal classnames — can't template).
const ACCENT_CLS = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber:   'bg-amber-100 text-amber-700',
  sky:     'bg-sky-100 text-sky-700',
  stone:   'bg-stone-100 text-stone-700',
  indigo:  'bg-indigo-100 text-indigo-700',
};

const PRIORITY_STYLES = {
  P1: 'bg-rose-50 text-rose-700 ring-rose-200',
  P2: 'bg-amber-50 text-amber-700 ring-amber-200',
  P3: 'bg-sky-50 text-sky-700 ring-sky-200',
  P4: 'bg-slate-100 text-slate-600 ring-slate-200',
};
function PriorityPill({ p, size = 'sm' }) {
  const cls = PRIORITY_STYLES[p] || PRIORITY_STYLES.P4;
  const sz = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-semibold ring-1 ${cls} ${sz}`}>
      <span className="w-1 h-1 rounded-full bg-current opacity-70" />{p}
    </span>
  );
}

const SPECIALTY_STYLES = {
  MEC:  'bg-emerald-50 text-emerald-800 ring-emerald-200',
  ELEC: 'bg-amber-50 text-amber-800 ring-amber-200',
  INST: 'bg-sky-50 text-sky-800 ring-sky-200',
  CIV:  'bg-stone-100 text-stone-700 ring-stone-200',
  LUB:  'bg-indigo-50 text-indigo-800 ring-indigo-200',
};
function SpecialtyTag({ k, className = '' }) {
  const cls = SPECIALTY_STYLES[k] || SPECIALTY_STYLES.MEC;
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 tracking-wide ${cls} ${className}`}>{k}</span>
  );
}

function ImpactBadge({ score, compact }) {
  const tone = score >= 80 ? 'bg-emerald-700/95 text-white'
              : score >= 60 ? 'bg-emerald-600/90 text-white'
              : score >= 40 ? 'bg-slate-500/90 text-white'
              : 'bg-slate-300 text-slate-700';
  return (
    <div className={`inline-flex items-center gap-1 rounded-md ${tone} ${compact ? 'px-1.5 py-[1px]' : 'px-2 py-0.5'}`}>
      <Sparkles className="w-3 h-3" strokeWidth={2.25} />
      <span className="text-[10px] font-bold tabular-nums leading-none">{score}</span>
    </div>
  );
}

function MetaLine({ hh, crew, equip }) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /><span className="tabular-nums font-medium text-slate-700">{hh}h</span></span>
      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /><span className="tabular-nums font-medium text-slate-700">{crew}</span></span>
      {equip && <span className="inline-flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /><span className="truncate font-mono text-[10.5px] text-slate-600">{equip}</span></span>}
    </div>
  );
}

function UnscheduledCard({ item }) {
  const ghost = !!item.dragging;
  return (
    <div className={[
      'group relative rounded-xl border bg-white p-3 shadow-sm transition',
      ghost ? 'opacity-30 saturate-0' : 'hover:-translate-y-px hover:shadow-md hover:border-emerald-200 cursor-grab active:cursor-grabbing',
      'border-slate-200',
    ].join(' ')}>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 transition">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <PriorityPill p={item.priority} />
          <SpecialtyTag k={item.specialty} />
        </div>
        <ImpactBadge score={item.impact} />
      </div>
      <div className="text-[12.5px] font-semibold text-slate-900 leading-snug line-clamp-2">{item.title}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10.5px] font-mono text-slate-500">{item.wo}</span>
        <span className="text-[10.5px] font-mono text-slate-400">{item.tag}</span>
      </div>
      <div className="mt-2 border-t border-slate-100 pt-2">
        <MetaLine hh={item.hh} crew={item.crew} equip={item.equip} />
      </div>
      {item.aiNote && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-emerald-50/70 px-2 py-1 text-[10.5px] text-emerald-900 ring-1 ring-emerald-100">
          <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-emerald-700" />
          <span className="leading-snug">{item.aiNote}</span>
        </div>
      )}
    </div>
  );
}

function CapacityCell({ consumed, nominal, day, center }) {
  const pct = Math.round((consumed / nominal) * 100);
  const tone = pct > 100 ? 'red' : pct >= 80 ? 'amber' : 'green';
  const fillCls = tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
  const bgCls   = tone === 'red' ? 'bg-rose-100' : tone === 'amber' ? 'bg-amber-100' : 'bg-emerald-100';
  const textCls = tone === 'red' ? 'text-rose-700' : tone === 'amber' ? 'text-amber-700' : 'text-emerald-700';
  const isOver = tone === 'red';
  return (
    <div className={`relative px-2.5 py-2 border-l border-slate-100 ${isOver && day === 'wed' && center === 'MEC' ? 'bg-rose-50/40' : ''}`}>
      <div className="flex items-baseline justify-between">
        <span className={`text-[10.5px] font-semibold tabular-nums ${textCls}`}>{pct}%</span>
        <span className="text-[10px] tabular-nums text-slate-400">{consumed}/{nominal}</span>
      </div>
      <div className={`mt-1.5 h-1.5 w-full rounded-full ${bgCls} overflow-hidden`}>
        <div className={`h-full ${fillCls} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function WOTile({ s }) {
  const border = {
    MEC:  'border-l-emerald-600',
    ELEC: 'border-l-amber-500',
    INST: 'border-l-sky-500',
    CIV:  'border-l-stone-500',
    LUB:  'border-l-indigo-500',
  }[s.specialty];
  const statusDot =
    s.status === 'in-progress' ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse'
    : s.status === 'done' ? 'bg-slate-300'
    : s.status === 'needs-review' ? 'bg-amber-500'
    : 'bg-slate-400';
  return (
    <div className={`group rounded-lg bg-white border border-slate-200 border-l-[3px] ${border} px-2 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-px transition`}>
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot} shrink-0`} />
          <span className="text-[10px] font-mono text-slate-500 tabular-nums">{s.wo.replace('WO-', '')}</span>
        </div>
        <PriorityPill p={s.priority} size="xs" />
      </div>
      <div className="text-[11.5px] font-semibold text-slate-900 leading-tight mt-0.5 line-clamp-2">{s.title}</div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
        <span className="font-mono">{s.start}–{s.end}</span>
        <span className="inline-flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" /><span className="font-medium text-slate-700">{s.hh}h</span>
          <span className="mx-0.5 text-slate-300">·</span>
          <Users className="w-2.5 h-2.5" /><span className="font-medium text-slate-700">{s.crew}</span>
        </span>
      </div>
    </div>
  );
}

function WOTileExpanded({ s }) {
  return (
    <div className="rounded-xl bg-white border-2 border-emerald-600/40 shadow-md ring-4 ring-emerald-100/60 overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 py-2 bg-gradient-to-b from-emerald-50/70 to-white border-b border-emerald-100">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" />
            <span className="text-[10.5px] font-mono text-slate-500">{s.wo}</span>
            <PriorityPill p={s.priority} size="xs" />
            <SpecialtyTag k={s.specialty} />
          </div>
          <div className="text-[12.5px] font-semibold text-slate-900 leading-tight">{s.title}</div>
          <div className="mt-1 flex items-center gap-3 text-[10.5px] text-slate-500">
            <span className="font-mono tabular-nums">{s.start}–{s.end}</span>
            <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /><span className="font-medium text-slate-700">{s.hh}h</span></span>
            <span className="inline-flex items-center gap-0.5"><Users className="w-3 h-3" /><span className="font-medium text-slate-700">{s.crew} crew</span></span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><Minimize2 className="w-3 h-3" /></button>
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><Maximize2 className="w-3 h-3" /></button>
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><X className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Operations · {s.ops.length}</div>
        <div className="space-y-1">
          {s.ops.map((op) => (
            <div key={op.op} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-slate-50">
              <span className="font-mono text-[10px] text-slate-400 w-8">{op.op}</span>
              <SpecialtyTag k={op.specialty} />
              <span className="flex-1 text-[11px] text-slate-700 truncate">{op.text}</span>
              <span className="text-[10px] tabular-nums text-slate-500">
                <span className="font-semibold text-slate-700">{op.hh}h</span>
                <span className="text-slate-300 mx-1">×</span>
                <span>{op.qty}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/70 border-t border-slate-100 text-[10.5px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Package className="w-3 h-3 text-emerald-600" />
          Materials <span className="font-semibold text-emerald-700">ready</span>
          <span className="font-mono text-slate-400 ml-1">RES-778214</span>
        </span>
        <button className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-2 py-1 font-semibold hover:bg-emerald-700 text-[10.5px]">
          Open WO <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function MaterialsRow({ m }) {
  const cfg = {
    ready:   { dot: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'Ready',   labelCls: 'text-emerald-700' },
    partial: { dot: 'bg-amber-500',   ring: 'ring-amber-100',   label: 'Partial', labelCls: 'text-amber-700' },
    blocked: { dot: 'bg-rose-500',    ring: 'ring-rose-100',    label: 'Blocked', labelCls: 'text-rose-700' },
  }[m.status];
  return (
    <div className="px-3 py-2.5 hover:bg-slate-50/70 transition border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot} ring-4 ${cfg.ring} shrink-0`} />
        <span className="font-mono text-[10.5px] text-slate-500">{m.wo}</span>
        <span className={`text-[10.5px] font-semibold ${cfg.labelCls} ml-auto`}>{cfg.label}</span>
      </div>
      <div className="text-[12px] font-medium text-slate-800 leading-snug line-clamp-1">{m.title}</div>
      <div className="mt-1 flex items-center justify-between text-[10.5px]">
        <span className="font-mono text-slate-400">{m.reservation}</span>
        <span className="tabular-nums text-slate-600 font-semibold">{m.items}</span>
      </div>
      <div className="mt-1 text-[10.5px] text-slate-500 leading-snug line-clamp-2">{m.note}</div>
    </div>
  );
}

// ─── Main sections ──────────────────────────────────────────────────────────

function ToolBar() {
  return (
    <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center gap-3">
      <div>
        <div className="text-[13px] font-bold text-slate-900 leading-tight">Weekly Scheduler · Preview</div>
        <div className="text-[10.5px] text-slate-500 -mt-0.5">Los Andes · Concentrator 1 · Week 14 · Mar 31 – Apr 06</div>
      </div>
      <div className="h-6 w-px bg-slate-200 mx-1" />
      <button className="flex items-center gap-1 h-8 px-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700">
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <button className="text-[11px] font-medium text-emerald-700 rounded-md hover:bg-slate-50 px-2 py-1">Today</button>
      <button className="flex items-center gap-1 h-8 px-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700">
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 max-w-md relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search WO, equipment tag, technician…"
          className="w-full h-8 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-[12px] placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10.5px] text-slate-400">Preview mode · sample data</span>
      </div>
    </div>
  );
}

function LeftRail() {
  const filters = [
    { key: 'P1', count: 2, active: true },
    { key: 'P2', count: 3, active: true },
    { key: 'P3', count: 3, active: false },
    { key: 'P4', count: 1, active: false },
  ];
  return (
    <aside className="w-[300px] shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">Unscheduled</h2>
          <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 tabular-nums">9 WOs · 61 HH</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">Drag a card onto the schedule to assign it.</p>
      </div>
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        <button className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-slate-200 bg-white text-[10.5px] text-slate-600 hover:bg-slate-50">
          <Filter className="w-3 h-3" /> All
        </button>
        {filters.map((f) => {
          const ps = PRIORITY_STYLES[f.key];
          return (
            <button key={f.key} className={[
              'inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-semibold ring-1 transition',
              f.active ? `${ps} ring-current/20` : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}>
              <span className="w-1 h-1 rounded-full bg-current opacity-70" />
              {f.key}
              <span className={`tabular-nums ${f.active ? 'opacity-80' : 'opacity-60'}`}>· {f.count}</span>
            </button>
          );
        })}
      </div>
      <div className="px-4 pb-2 flex items-center justify-between text-[10.5px] text-slate-500">
        <span>Sorted by <span className="font-semibold text-slate-700">AI impact</span></span>
        <button className="hover:text-slate-700 inline-flex items-center gap-0.5">
          <ChevronDown className="w-3 h-3" /> desc
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {UNSCHEDULED.map((it) => (
          <UnscheduledCard key={it.id} item={it} />
        ))}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-[10.5px] text-slate-600 leading-snug">
            <span className="font-semibold text-slate-800">Smart Backlog</span> suggests placing <span className="font-mono text-slate-700">WO-24940</span> on Tue morning to balance MEC load.
          </div>
        </div>
      </div>
    </aside>
  );
}

function CapacitySection() {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="px-5 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">Capacity by Work Center</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Consumed vs nominal HH per day · nominal derives from roster × shift length</p>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt; 80%</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 80–100%</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> &gt; 100%</span>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
        <div className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Work Center</div>
        {DAYS.map((d) => (
          <div key={d.key} className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-baseline gap-1.5 border-l border-slate-100">
            <span className="text-slate-700">{d.short}</span>
            <span className="text-slate-400 normal-case font-medium">{d.date}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        {WORK_CENTERS.map((wc) => {
          const row = CAPACITY[wc.key];
          const Ic = wc.icon;
          return (
            <div key={wc.key} className="grid border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
              <div className="px-4 py-2 flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${ACCENT_CLS[wc.accent]}`}>
                  <Ic className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-[11.5px] font-semibold text-slate-900">{wc.name}</div>
                  <div className="text-[10px] text-slate-500">{(TECHS[wc.key] || []).length} techs · nom {wc.nominalPerDay} HH/d</div>
                </div>
              </div>
              {row.map((c, i) => (
                <CapacityCell key={i} consumed={c} nominal={wc.nominalPerDay} day={DAYS[i].key} center={wc.key} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleGrid() {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (k) => setCollapsed((s) => ({ ...s, [k]: !s[k] }));
  return (
    <section className="flex-1 min-h-0 bg-slate-50/60 overflow-y-auto">
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur border-b border-slate-200">
        <div className="grid" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Technician</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shift</span>
          </div>
          {DAYS.map((d, i) => (
            <div key={d.key} className={`px-2.5 py-2 border-l border-slate-200 ${i === 2 ? 'bg-rose-50/40' : ''}`}>
              <div className="flex items-baseline justify-between">
                <span className="text-[11.5px] font-bold text-slate-900">{d.short}</span>
                <span className="text-[10px] text-slate-500 tabular-nums">{d.date}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                <Sun className="w-2.5 h-2.5" /><span>D</span>
                <Moon className="w-2.5 h-2.5 ml-1" /><span>N</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {WORK_CENTERS.map((wc) => {
        const isCol = collapsed[wc.key];
        const techs = TECHS[wc.key] || [];
        const wcHH = techs.reduce((sum, t) => sum + SCHEDULED.filter((s) => s.techId === t.id).reduce((a, b) => a + b.hh, 0), 0);
        const overCap = wc.key === 'MEC';
        const Ic = wc.icon;
        return (
          <div key={wc.key}>
            <button onClick={() => toggle(wc.key)}
              className="w-full grid items-center px-4 py-2 bg-white/70 hover:bg-white border-y border-slate-200 text-left sticky top-[45px] z-10 backdrop-blur"
              style={{ gridTemplateColumns: '180px 1fr' }}>
              <div className="flex items-center gap-2">
                {isCol ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${ACCENT_CLS[wc.accent]}`}>
                  <Ic className="w-3 h-3" />
                </div>
                <span className="text-[11.5px] font-bold text-slate-800 tracking-tight">{wc.name}</span>
                <span className="text-[10px] text-slate-500">· {techs.length} techs</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                {overCap && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md">
                    <AlertTriangle className="w-3 h-3" /> Over capacity Wed
                  </span>
                )}
                <span className="text-[10.5px] text-slate-500 tabular-nums">
                  <span className="font-semibold text-slate-700">{wcHH} HH</span> scheduled
                </span>
              </div>
            </button>
            {!isCol && techs.map((t) => (
              <div key={t.id} className="grid border-b border-slate-200/70 min-h-[110px]" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
                <div className="px-4 py-2 bg-white border-r border-slate-200 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center ring-1 ring-slate-200">
                    {t.avatar}
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-[11.5px] font-semibold text-slate-900 truncate">{t.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{t.role}</div>
                  </div>
                  <span className="ml-auto text-[9.5px] font-mono text-slate-500 bg-slate-100 rounded px-1 py-0.5">{t.shift}</span>
                </div>
                {DAYS.map((d) => {
                  const tiles = SCHEDULED.filter((s) => s.techId === t.id && s.day === d.key);
                  return (
                    <div key={d.key} className={[
                      'relative border-l border-slate-200 p-1.5 space-y-1 transition',
                      d.key === 'sat' || d.key === 'sun' ? 'bg-slate-50/40' : '',
                    ].join(' ')}>
                      {tiles.map((s) => s.expanded ? <WOTileExpanded key={s.id} s={s} /> : <WOTile key={s.id} s={s} />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
      <div className="h-24" />
    </section>
  );
}

function RightRail() {
  return (
    <aside className="w-[300px] shrink-0 border-l border-slate-200 bg-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-700" /> Materials Readiness
          </h2>
          <button className="text-slate-400 hover:text-slate-700">
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">Status across scheduled WOs · live from SAP MM reservations.</p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-lg bg-emerald-50 ring-1 ring-emerald-100 px-2 py-1.5 text-center">
            <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Ready</div>
            <div className="text-[18px] font-bold text-emerald-800 tabular-nums leading-none mt-0.5">3</div>
          </div>
          <div className="rounded-lg bg-amber-50 ring-1 ring-amber-100 px-2 py-1.5 text-center">
            <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Partial</div>
            <div className="text-[18px] font-bold text-amber-800 tabular-nums leading-none mt-0.5">2</div>
          </div>
          <div className="rounded-lg bg-rose-50 ring-1 ring-rose-100 px-2 py-1.5 text-center">
            <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Blocked</div>
            <div className="text-[18px] font-bold text-rose-800 tabular-nums leading-none mt-0.5">1</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {MATERIALS.map((m) => <MaterialsRow key={m.wo} m={m} />)}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 bg-emerald-50/50">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="leading-snug">
            <div className="text-[11px] font-bold text-emerald-900">Budget Sentinel</div>
            <p className="text-[10.5px] text-slate-700 mt-0.5">
              WO-24867 is blocking <span className="font-mono">RES-778155</span>. Consider swapping with <span className="font-mono">WO-24946</span>.
            </p>
            <button className="mt-1.5 text-[10.5px] font-semibold text-emerald-800 hover:underline inline-flex items-center gap-0.5">
              Review swap <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TaskbarDock() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-stretch gap-1 rounded-2xl bg-slate-900/95 text-white backdrop-blur shadow-lg ring-1 ring-white/10 px-2 py-1.5">
        <div className="flex items-center gap-1.5 pl-2 pr-2.5 text-[10.5px] text-slate-300">
          <FileText className="w-3.5 h-3.5 text-emerald-300" />
          <span className="font-semibold">Open WOs</span>
          <span className="tabular-nums text-slate-400">· {MINIMIZED.length}</span>
        </div>
        <div className="w-px bg-white/10 my-1" />
        <div className="flex items-center gap-1">
          {MINIMIZED.map((m, i) => (
            <button key={m.wo} className={[
              'group relative flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition',
              i === 0 ? 'bg-white/10 ring-1 ring-emerald-400/40' : 'hover:bg-white/10',
            ].join(' ')}>
              <PriorityPill p={m.priority} size="xs" />
              <div className="leading-tight max-w-[130px]">
                <div className="text-[10px] font-mono text-slate-300">{m.wo}</div>
                <div className="text-[11px] font-semibold text-white truncate">{m.title}</div>
              </div>
              {m.unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                  {m.unread}
                </span>
              )}
              {m.flagged && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-slate-900">
                  <AlertTriangle className="w-2 h-2" strokeWidth={2.5} />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="w-px bg-white/10 my-1" />
        <button className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-[11.5px] font-semibold">
          <Plus className="w-3.5 h-3.5" /> Open WO
        </button>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SchedulerPreview() {
  return (
    <div className="-m-6 min-w-[1280px]">
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-[11.5px] text-amber-900 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>
          <strong>Preview · sample data.</strong> Layout propuesto para el Weekly Scheduler (demo para Jorge).
          Todavía no está conectado al backend. Modelo de datos: WORK_CENTERS, TECHS, SCHEDULED, UNSCHEDULED, MATERIALS.
        </span>
      </div>
      <ToolBar />
      <div className="flex" style={{ height: 'calc(100vh - 160px)', minHeight: 700 }}>
        <LeftRail />
        <main className="flex-1 flex flex-col min-w-0">
          <CapacitySection />
          <ScheduleGrid />
        </main>
        <RightRail />
      </div>
      <TaskbarDock />
    </div>
  );
}
