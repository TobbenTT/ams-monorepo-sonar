// Reusable small parts for the scheduler.

// ─── Priority pill ──────────────────────────────────────────────────────────
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
      <span className="w-1 h-1 rounded-full bg-current opacity-70" />
      {p}
    </span>
  );
}

// ─── Specialty chip (MEC / ELEC / INST / CIV / LUB) ─────────────────────────
const SPECIALTY_STYLES = {
  MEC:  'bg-emerald-50 text-emerald-800 ring-emerald-200',
  ELEC: 'bg-amber-50   text-amber-800   ring-amber-200',
  INST: 'bg-sky-50     text-sky-800     ring-sky-200',
  CIV:  'bg-stone-100  text-stone-700   ring-stone-200',
  LUB:  'bg-indigo-50  text-indigo-800  ring-indigo-200',
};
function SpecialtyTag({ k, className = '' }) {
  const cls = SPECIALTY_STYLES[k] || SPECIALTY_STYLES.MEC;
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 tracking-wide ${cls} ${className}`}>
      {k}
    </span>
  );
}

// ─── Impact score badge (AI, 0-100) ─────────────────────────────────────────
function ImpactBadge({ score, compact }) {
  const tone = score >= 80 ? 'bg-emerald-700/95 text-white'
              : score >= 60 ? 'bg-emerald-600/90 text-white'
              : score >= 40 ? 'bg-slate-500/90 text-white'
              : 'bg-slate-300 text-slate-700';
  return (
    <div className={`inline-flex items-center gap-1 rounded-md ${tone} ${compact ? 'px-1.5 py-[1px]' : 'px-2 py-0.5'}`}>
      <Icon name="Sparkles" className="w-3 h-3" strokeWidth={2.25} />
      <span className="text-[10px] font-bold tabular-nums leading-none">{score}</span>
    </div>
  );
}

// ─── HH + crew meta line ────────────────────────────────────────────────────
function MetaLine({ hh, crew, equip }) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Icon name="Clock" className="w-3 h-3" />
        <span className="tabular-nums font-medium text-slate-700">{hh}h</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Icon name="Users" className="w-3 h-3" />
        <span className="tabular-nums font-medium text-slate-700">{crew}</span>
      </span>
      {equip && (
        <span className="inline-flex items-center gap-1 truncate">
          <Icon name="MapPin" className="w-3 h-3" />
          <span className="truncate font-mono text-[10.5px] text-slate-600">{equip}</span>
        </span>
      )}
    </div>
  );
}

// ─── Unscheduled WO card (left rail) ────────────────────────────────────────
function UnscheduledCard({ item, dragging }) {
  const ghost = !!dragging;
  return (
    <div
      className={[
        'group relative rounded-xl border bg-white p-3 shadow-card transition',
        ghost ? 'opacity-30 saturate-0' : 'hover:-translate-y-px hover:shadow-pop hover:border-emerald-200 cursor-grab active:cursor-grabbing',
        'border-slate-200',
      ].join(' ')}
    >
      {/* drag handle — shown on hover */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 transition">
        <Icon name="GripVertical" className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <PriorityPill p={item.priority} />
          <SpecialtyTag k={item.specialty} />
        </div>
        <ImpactBadge score={item.impact} />
      </div>

      <div className="text-[12.5px] font-semibold text-slate-900 leading-snug line-clamp-2">
        {item.title}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10.5px] font-mono text-slate-500">{item.wo}</span>
        <span className="text-[10.5px] font-mono text-slate-400">{item.tag}</span>
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        <MetaLine hh={item.hh} crew={item.crew} equip={item.equip} />
      </div>

      {item.aiNote && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-emerald-50/70 px-2 py-1 text-[10.5px] text-emerald-900 ring-1 ring-emerald-100">
          <Icon name="Sparkles" className="w-3 h-3 mt-0.5 shrink-0 text-emerald-700" />
          <span className="leading-snug">{item.aiNote}</span>
        </div>
      )}
    </div>
  );
}

// ─── Capacity mini-bar (one day cell inside a Work Center row) ──────────────
function CapacityCell({ consumed, nominal, day, center }) {
  const pct = Math.round((consumed / nominal) * 100);
  const tone = pct > 100 ? 'red' : pct >= 80 ? 'amber' : 'green';
  const fillCls =
    tone === 'red'   ? 'bg-rose-500'
    : tone === 'amber' ? 'bg-amber-500'
    : 'bg-emerald-500';
  const bgCls =
    tone === 'red'   ? 'bg-rose-100'
    : tone === 'amber' ? 'bg-amber-100'
    : 'bg-emerald-100';
  const textCls =
    tone === 'red'   ? 'text-rose-700'
    : tone === 'amber' ? 'text-amber-700'
    : 'text-emerald-700';

  const isRedTooltip = tone === 'red' && day === 'wed' && center === 'MEC';
  const capped = Math.min(pct, 140); // cap visual fill
  return (
    <div className={`relative px-2.5 py-2 border-l border-slate-100 ${isRedTooltip ? 'bg-rose-50/40' : ''}`}>
      <div className="flex items-baseline justify-between">
        <span className={`text-[10.5px] font-semibold tabular-nums ${textCls}`}>{pct}%</span>
        <span className="text-[10px] tabular-nums text-slate-400">{consumed}/{nominal}</span>
      </div>
      <div className={`mt-1.5 h-1.5 w-full rounded-full ${bgCls} overflow-hidden`}>
        <div
          className={`h-full ${fillCls} rounded-full`}
          style={{ width: `${Math.min(capped, 100)}%` }}
        />
        {pct > 100 && (
          <div className="h-full bg-rose-700/70 -mt-1.5 rounded-r-full" style={{ width: `${Math.min(pct - 100, 40)}%`, marginLeft: '100%' }} />
        )}
      </div>

      {/* tooltip for the red over-capacity cell */}
      {isRedTooltip && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-[240px] rounded-xl bg-slate-900 text-white px-3 py-2.5 shadow-pop">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon name="AlertTriangle" className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-semibold">Over capacity — 125%</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Redistribute 24 HH to Tue/Thu, or extend shift. 2 P1 WOs stacked on Wed.
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <button className="text-[10.5px] font-semibold rounded-md bg-emerald-600 text-white px-2 py-1 hover:bg-emerald-500">Auto-balance</button>
            <button className="text-[10.5px] font-semibold rounded-md bg-white/10 text-white px-2 py-1 hover:bg-white/20">Dismiss</button>
          </div>
          {/* caret */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

// ─── WO Tile on the schedule grid ───────────────────────────────────────────
function WOTile({ s, compact }) {
  // colored left border by specialty
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
    <div className={`group rounded-lg bg-white border border-slate-200 border-l-[3px] ${border} px-2 py-1.5 shadow-card hover:shadow-pop hover:-translate-y-px transition`}>
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot} shrink-0`} />
          <span className="text-[10px] font-mono text-slate-500 tabular-nums">{s.wo.replace('WO-', '')}</span>
        </div>
        <PriorityPill p={s.priority} size="xs" />
      </div>
      <div className="text-[11.5px] font-semibold text-slate-900 leading-tight mt-0.5 line-clamp-2">
        {s.title}
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
        <span className="font-mono">{s.start}–{s.end}</span>
        <span className="inline-flex items-center gap-0.5">
          <Icon name="Clock" className="w-2.5 h-2.5" />
          <span className="font-medium text-slate-700">{s.hh}h</span>
          <span className="mx-0.5 text-slate-300">·</span>
          <Icon name="Users" className="w-2.5 h-2.5" />
          <span className="font-medium text-slate-700">{s.crew}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Expanded WO tile with operations ───────────────────────────────────────
function WOTileExpanded({ s }) {
  return (
    <div className="rounded-xl bg-white border-2 border-emerald-600/40 shadow-pop ring-4 ring-emerald-100/60 overflow-hidden">
      {/* header */}
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
            <span className="inline-flex items-center gap-0.5">
              <Icon name="Clock" className="w-3 h-3" /><span className="font-medium text-slate-700">{s.hh}h</span>
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Icon name="Users" className="w-3 h-3" /><span className="font-medium text-slate-700">{s.crew} crew</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><Icon name="Minimize2" className="w-3 h-3" /></button>
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><Icon name="Maximize2" className="w-3 h-3" /></button>
          <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><Icon name="X" className="w-3 h-3" /></button>
        </div>
      </div>

      {/* ops */}
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

      {/* footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/70 border-t border-slate-100 text-[10.5px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Icon name="Package" className="w-3 h-3 text-emerald-600" />
          Materials <span className="font-semibold text-emerald-700">ready</span>
          <span className="font-mono text-slate-400 ml-1">RES-778214</span>
        </span>
        <button className="inline-flex items-center gap-1 rounded-md bg-brand-600 text-white px-2 py-1 font-semibold hover:bg-brand-700 text-[10.5px]">
          Open WO <Icon name="ArrowUpRight" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Materials Readiness row (right rail) ───────────────────────────────────
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

Object.assign(window, {
  PriorityPill, SpecialtyTag, ImpactBadge, MetaLine,
  UnscheduledCard, CapacityCell, WOTile, WOTileExpanded, MaterialsRow,
});
