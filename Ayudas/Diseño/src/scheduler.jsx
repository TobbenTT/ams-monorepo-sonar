// Main scheduler screen composition.

function AppBar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center gap-4 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-card">
          <Icon name="Mountain" className="w-4.5 h-4.5 text-emerald-100" strokeWidth={2.2} style={{width:18,height:18}} />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-tight text-slate-900">MAGEAM</div>
          <div className="text-[10px] text-slate-500 -mt-0.5">Reliability & Maintenance</div>
        </div>
      </div>

      <div className="h-6 w-px bg-slate-200 mx-1" />

      {/* Plant selector */}
      <button className="flex items-center gap-2 h-9 px-2.5 rounded-lg hover:bg-slate-50 text-slate-800">
        <Icon name="MapPin" className="w-3.5 h-3.5 text-emerald-700" />
        <div className="text-left leading-tight">
          <div className="text-[11.5px] font-semibold">Los Andes · Concentrator 1</div>
          <div className="text-[10px] text-slate-500">4,500 m · 7×7 shift pattern</div>
        </div>
        <Icon name="ChevronDown" className="w-3 h-3 text-slate-400 ml-1" />
      </button>

      {/* Week navigator */}
      <div className="flex items-center gap-1 h-9 px-1.5 rounded-lg border border-slate-200 bg-slate-50/70">
        <button className="p-1 rounded-md hover:bg-white text-slate-600"><Icon name="ChevronLeft" className="w-3.5 h-3.5" /></button>
        <div className="px-2 leading-tight text-center">
          <div className="text-[11.5px] font-semibold text-slate-900">Week 14 · 2026</div>
          <div className="text-[10px] text-slate-500">Mar 31 – Apr 06</div>
        </div>
        <button className="p-1 rounded-md hover:bg-white text-slate-600"><Icon name="ChevronRight" className="w-3.5 h-3.5" /></button>
        <div className="h-5 w-px bg-slate-200 mx-0.5" />
        <button className="px-2 py-1 text-[11px] font-medium text-emerald-700 rounded-md hover:bg-white">Today</button>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Icon name="Search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search WO, equipment tag, technician…"
          className="w-full h-9 pl-9 pr-16 rounded-lg bg-slate-50 border border-slate-200 text-[12px] placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
      </div>

      {/* right cluster */}
      <div className="flex items-center gap-1">
        <button className="relative h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center justify-center">
          <Icon name="Sparkles" className="w-4 h-4 text-emerald-700" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
        <button className="relative h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center justify-center">
          <Icon name="Bell" className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
        </button>
        <button className="h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center justify-center">
          <Icon name="Settings" className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-lg hover:bg-slate-50">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white shadow-card">
            LM
          </div>
          <div className="text-left leading-tight">
            <div className="text-[11.5px] font-semibold text-slate-900">L. Marín</div>
            <div className="text-[10px] text-slate-500">Programmer</div>
          </div>
        </button>
      </div>
    </header>
  );
}

// ─── Left Rail: Unscheduled WOs ─────────────────────────────────────────────
function LeftRail() {
  const filters = [
    { key: 'P1', count: 2, active: true },
    { key: 'P2', count: 3, active: true },
    { key: 'P3', count: 3, active: false },
    { key: 'P4', count: 1, active: false },
  ];

  return (
    <aside className="w-[300px] shrink-0 border-r border-slate-200 bg-white flex flex-col">
      {/* title row */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">Unscheduled</h2>
          <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 tabular-nums">9 WOs · 61 HH</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">Drag a card onto the schedule to assign it.</p>
      </div>

      {/* filter pills */}
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        <button className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-slate-200 bg-white text-[10.5px] text-slate-600 hover:bg-slate-50">
          <Icon name="Filter" className="w-3 h-3" /> All
        </button>
        {filters.map((f) => {
          const ps = PRIORITY_STYLES[f.key];
          return (
            <button
              key={f.key}
              className={[
                'inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-semibold ring-1 transition',
                f.active ? `${ps} ring-current/20` : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="w-1 h-1 rounded-full bg-current opacity-70" />
              {f.key}
              <span className={`tabular-nums ${f.active ? 'opacity-80' : 'opacity-60'}`}>· {f.count}</span>
            </button>
          );
        })}
      </div>

      {/* sort bar */}
      <div className="px-4 pb-2 flex items-center justify-between text-[10.5px] text-slate-500">
        <span>Sorted by <span className="font-semibold text-slate-700">AI impact</span></span>
        <button className="hover:text-slate-700 inline-flex items-center gap-0.5">
          <Icon name="ChevronDown" className="w-3 h-3" /> desc
        </button>
      </div>

      {/* cards */}
      <div className="flex-1 overflow-y-auto thin-scroll px-3 pb-4 space-y-2">
        {UNSCHEDULED.map((it) => (
          <UnscheduledCard key={it.id} item={it} dragging={it.dragging} />
        ))}
      </div>

      {/* footer hint */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-start gap-2">
          <Icon name="Sparkles" className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-[10.5px] text-slate-600 leading-snug">
            <span className="font-semibold text-slate-800">Smart Backlog</span> suggests placing <span className="font-mono text-slate-700">WO-24940</span> on Tue morning to balance MEC load.
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Capacity section (top of main canvas) ─────────────────────────────────
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

      {/* day header */}
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
          return (
            <div
              key={wc.key}
              className="grid border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40"
              style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}
            >
              {/* label */}
              <div className="px-4 py-2 flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-${wc.accent}-100 text-${wc.accent}-700`}>
                  <Icon name={wc.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-[11.5px] font-semibold text-slate-900">{wc.name}</div>
                  <div className="text-[10px] text-slate-500">{TECHS[wc.key]?.length || 0} techs · nom {wc.nominalPerDay} HH/d</div>
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

// ─── Schedule grid (bottom of main canvas) ─────────────────────────────────
function ScheduleGrid() {
  const [collapsed, setCollapsed] = React.useState({});
  const [hoverCell, setHoverCell] = React.useState(null);

  const toggle = (k) => setCollapsed((s) => ({ ...s, [k]: !s[k] }));

  return (
    <section className="flex-1 min-h-0 bg-slate-50/60 bg-canvas-grid overflow-y-auto thin-scroll">
      {/* sticky day header */}
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
                <Icon name="Sun" className="w-2.5 h-2.5" /><span>D</span>
                <Icon name="Moon" className="w-2.5 h-2.5 ml-1" /><span>N</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* groups */}
      {WORK_CENTERS.map((wc) => {
        const isCol = collapsed[wc.key];
        const techs = TECHS[wc.key] || [];
        const wcHH = techs.reduce((sum, t) => {
          return sum + SCHEDULED.filter((s) => s.techId === t.id).reduce((a, b) => a + b.hh, 0);
        }, 0);
        const overCap = wc.key === 'MEC';
        return (
          <div key={wc.key}>
            {/* group header */}
            <button
              onClick={() => toggle(wc.key)}
              className="w-full grid items-center px-4 py-2 bg-white/70 hover:bg-white border-y border-slate-200 text-left sticky top-[45px] z-10 backdrop-blur"
              style={{ gridTemplateColumns: '180px 1fr' }}
            >
              <div className="flex items-center gap-2">
                <Icon name={isCol ? 'ChevronRight' : 'ChevronDown'} className="w-3 h-3 text-slate-500" />
                <div className={`w-5 h-5 rounded-md flex items-center justify-center bg-${wc.accent}-100 text-${wc.accent}-700`}>
                  <Icon name={wc.icon} className="w-3 h-3" />
                </div>
                <span className="text-[11.5px] font-bold text-slate-800 tracking-tight">{wc.name}</span>
                <span className="text-[10px] text-slate-500">· {techs.length} techs</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                {overCap && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md">
                    <Icon name="AlertTriangle" className="w-3 h-3" />
                    Over capacity Wed
                  </span>
                )}
                <span className="text-[10.5px] text-slate-500 tabular-nums">
                  <span className="font-semibold text-slate-700">{wcHH} HH</span> scheduled
                </span>
              </div>
            </button>

            {/* tech rows */}
            {!isCol && techs.map((t) => {
              return (
                <div
                  key={t.id}
                  className="grid border-b border-slate-200/70 min-h-[110px]"
                  style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}
                >
                  {/* tech cell */}
                  <div className="px-4 py-2 bg-white border-r border-slate-200 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center ring-1 ring-slate-200">
                      {t.avatar}
                    </div>
                    <div className="leading-tight min-w-0">
                      <div className="text-[11.5px] font-semibold text-slate-900 truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{t.role}</div>
                    </div>
                    <span className="ml-auto text-[9.5px] font-mono text-slate-500 bg-slate-100 rounded px-1 py-0.5">
                      {t.shift}
                    </span>
                  </div>

                  {/* day cells */}
                  {DAYS.map((d) => {
                    const cellKey = `${t.id}__${d.key}`;
                    const tiles = SCHEDULED.filter((s) => s.techId === t.id && s.day === d.key);
                    // drag drop zone for Wednesday · S. Navarro (from brief)
                    const isDropTarget = t.id === 't-mec-2' && d.key === 'wed';

                    return (
                      <div
                        key={d.key}
                        onMouseEnter={() => setHoverCell(cellKey)}
                        onMouseLeave={() => setHoverCell(null)}
                        className={[
                          'relative border-l border-slate-200 p-1.5 space-y-1 transition',
                          d.key === 'sat' || d.key === 'sun' ? 'bg-slate-50/40' : '',
                          isDropTarget ? 'bg-emerald-50/80 ring-2 ring-inset ring-emerald-400 ring-dashed drop-pulse' : '',
                        ].join(' ')}
                      >
                        {tiles.map((s) => s.expanded ? (
                          <WOTileExpanded key={s.id} s={s} />
                        ) : (
                          <WOTile key={s.id} s={s} />
                        ))}

                        {isDropTarget && (
                          <>
                            {/* ghost drag card */}
                            <div className="ghost-float absolute -right-3 -top-2 w-[210px] rounded-xl bg-white border-2 border-emerald-500 shadow-drag p-2.5 z-30 pointer-events-none">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <PriorityPill p="P2" size="xs" />
                                  <SpecialtyTag k="MEC" />
                                </div>
                                <ImpactBadge score={74} compact />
                              </div>
                              <div className="text-[11.5px] font-semibold text-slate-900 leading-tight">
                                Conveyor CV-207 — return roller set
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="font-mono">WO-24942</span>
                                <span className="inline-flex items-center gap-0.5">
                                  <Icon name="Clock" className="w-2.5 h-2.5" />
                                  <span className="font-medium text-slate-700">8h</span>
                                  <span className="mx-0.5 text-slate-300">·</span>
                                  <Icon name="Users" className="w-2.5 h-2.5" />
                                  <span className="font-medium text-slate-700">2</span>
                                </span>
                              </div>
                              <div className="mt-1.5 pt-1.5 border-t border-emerald-100 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                                <Icon name="ArrowRight" className="w-3 h-3" /> drop → Wed · 09:00–17:00
                              </div>
                            </div>

                            {/* drop target hint placeholder in cell */}
                            <div className="h-[70px] rounded-lg border-2 border-dashed border-emerald-400/70 bg-white/60 flex flex-col items-center justify-center text-emerald-700">
                              <Icon name="Plus" className="w-4 h-4 mb-0.5" />
                              <span className="text-[10px] font-semibold">Drop here</span>
                              <span className="text-[9.5px] text-emerald-600/80 font-mono">09:00 – 17:00</span>
                            </div>
                          </>
                        )}

                        {/* empty cell add affordance */}
                        {tiles.length === 0 && !isDropTarget && hoverCell === cellKey && (
                          <button className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/40 transition">
                            <Icon name="Plus" className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="h-24" />
    </section>
  );
}

// ─── Right Rail: Materials Readiness ────────────────────────────────────────
function RightRail() {
  return (
    <aside className="w-[300px] shrink-0 border-l border-slate-200 bg-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Icon name="Package" className="w-3.5 h-3.5 text-emerald-700" />
            Materials Readiness
          </h2>
          <button className="text-slate-400 hover:text-slate-700">
            <Icon name="PanelRightClose" className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">Status across scheduled WOs · live from SAP MM reservations.</p>

        {/* summary tiles */}
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

      <div className="flex-1 overflow-y-auto thin-scroll">
        {MATERIALS.map((m) => (
          <MaterialsRow key={m.wo} m={m} />
        ))}
      </div>

      {/* Agentic hint */}
      <div className="px-4 py-3 border-t border-slate-100 bg-emerald-50/50">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="Sparkles" className="w-3.5 h-3.5" />
          </div>
          <div className="leading-snug">
            <div className="text-[11px] font-bold text-emerald-900">Budget Sentinel</div>
            <p className="text-[10.5px] text-slate-700 mt-0.5">
              WO-24867 is blocking <span className="font-mono">RES-778155</span>. Consider swapping with <span className="font-mono">WO-24946</span>.
            </p>
            <button className="mt-1.5 text-[10.5px] font-semibold text-emerald-800 hover:underline inline-flex items-center gap-0.5">
              Review swap <Icon name="ArrowRight" className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Floating taskbar of minimized WOs ─────────────────────────────────────
function TaskbarDock() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-stretch gap-1 rounded-2xl bg-slate-900/95 text-white backdrop-blur shadow-pop ring-1 ring-white/10 px-2 py-1.5">
        {/* dock label */}
        <div className="flex items-center gap-1.5 pl-2 pr-2.5 text-[10.5px] text-slate-300">
          <Icon name="FileText" className="w-3.5 h-3.5 text-emerald-300" />
          <span className="font-semibold">Open WOs</span>
          <span className="tabular-nums text-slate-400">· {MINIMIZED.length}</span>
        </div>
        <div className="w-px bg-white/10 my-1" />

        {/* chips */}
        <div className="flex items-center gap-1">
          {MINIMIZED.map((m, i) => (
            <button
              key={m.wo}
              className={[
                'group relative flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition',
                i === 0 ? 'bg-white/10 ring-1 ring-emerald-400/40' : 'hover:bg-white/10',
              ].join(' ')}
            >
              <div className="flex items-center gap-1">
                <PriorityPill p={m.priority} size="xs" />
              </div>
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
                  <Icon name="AlertTriangle" className="w-2 h-2" strokeWidth={2.5} />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="w-px bg-white/10 my-1" />

        {/* CTA */}
        <button className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-[11.5px] font-semibold">
          <Icon name="Plus" className="w-3.5 h-3.5" /> Open WO
        </button>
      </div>
    </div>
  );
}

// ─── Zoomed Inset cards (below main layout) ─────────────────────────────────
function InsetCards() {
  return (
    <section className="bg-white border-t border-slate-200 px-6 py-7" data-screen-label="Insets">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Interaction insets · 2×</div>
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Key states, enlarged</h2>
          </div>
          <span className="text-[11px] text-slate-500">Same components, scaled for review</span>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Inset 1 — Drag state */}
          <div className="col-span-7">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-semibold text-slate-500">① Drag-and-drop · Wed · S. Navarro · 09:00–17:00</div>
                <div className="text-[10.5px] text-slate-400">Drop target highlighted emerald</div>
              </div>
              <div className="grid grid-cols-2 gap-5 items-center">
                {/* dragged ghost */}
                <div className="relative h-[220px] flex items-center justify-center">
                  <div className="ghost-float w-[240px] rounded-xl bg-white border-2 border-emerald-500 shadow-drag p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <PriorityPill p="P2" />
                        <SpecialtyTag k="MEC" />
                      </div>
                      <ImpactBadge score={74} />
                    </div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-tight">
                      Conveyor CV-207 — return roller set
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                      <span className="font-mono text-slate-500">WO-24942</span>
                      <MetaLine hh={8} crew={2} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center gap-1.5 text-[10.5px] text-emerald-800">
                      <Icon name="Sparkles" className="w-3 h-3" />
                      <span className="font-semibold">High impact · recurrent failure</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-8 text-[10px] font-mono text-slate-400">cursor</div>
                  <svg className="absolute bottom-5 left-16 text-slate-300" width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="currentColor">
                    <path d="M2 28 C 20 20, 40 10, 55 6" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M55 6 l -4 -1 M55 6 l -1 -4" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* drop target */}
                <div className="h-[220px] rounded-xl bg-white border border-slate-200 p-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center ring-1 ring-slate-200">
                        SN
                      </div>
                      <div className="leading-tight">
                        <div className="text-[11.5px] font-semibold text-slate-900">S. Navarro</div>
                        <div className="text-[10px] text-slate-500">Mechanic · 7×7</div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500">Wed · Apr 02</span>
                  </div>
                  <div className="flex-1 rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50/70 drop-pulse flex flex-col items-center justify-center text-emerald-700">
                    <Icon name="Plus" className="w-6 h-6 mb-1" />
                    <div className="text-[12px] font-bold">Drop to schedule</div>
                    <div className="text-[10.5px] text-emerald-700/80 font-mono mt-0.5">09:00 – 17:00 · 8 HH · 2 crew</div>
                    <div className="mt-2 text-[10px] text-emerald-800 bg-white/70 rounded-md px-2 py-0.5 ring-1 ring-emerald-200">
                      Fits shift · materials ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inset 2 — Over-capacity tooltip */}
          <div className="col-span-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-semibold text-slate-500">② Over-capacity cell · Mechanical · Wed</div>
                <div className="text-[10.5px] text-slate-400">Tooltip on hover</div>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-100 text-emerald-700">
                    <Icon name="Wrench" className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">Mechanical</div>
                    <div className="text-[10px] text-slate-500">4 techs · nominal 96 HH/day</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-start">
                  <div className="rounded-lg bg-emerald-50/60 ring-1 ring-emerald-100 p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tue</div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[15px] font-bold text-emerald-700 tabular-nums">88%</span>
                      <span className="text-[10px] tabular-nums text-slate-400">84/96</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-rose-50 ring-2 ring-rose-400 p-2 relative">
                    <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      Wed <Icon name="AlertTriangle" className="w-3 h-3" />
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[20px] font-bold text-rose-700 tabular-nums leading-none">125%</span>
                      <span className="text-[10px] tabular-nums text-rose-500">120/96</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-rose-100 overflow-hidden relative">
                      <div className="h-full bg-rose-500" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 ring-1 ring-emerald-100 p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Thu</div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[15px] font-bold text-emerald-700 tabular-nums">92%</span>
                      <span className="text-[10px] tabular-nums text-slate-400">88/96</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>

                {/* tooltip pointing at Wed */}
                <div className="relative mt-3">
                  <div className="w-full rounded-xl bg-slate-900 text-white px-3 py-3 shadow-pop">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="AlertTriangle" className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[12px] font-semibold">Over capacity — 125%</span>
                      <span className="ml-auto text-[10px] text-slate-400">+24 HH surplus</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Redistribute to Tue / Thu, extend to night shift, or reassign one WO to J. Pizarro (14×14 rotation, available).
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button className="text-[10.5px] font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1">Auto-balance</button>
                      <button className="text-[10.5px] font-semibold rounded-md bg-white/10 hover:bg-white/20 text-white px-2.5 py-1">Extend shift</button>
                      <button className="ml-auto text-[10.5px] text-slate-400 hover:text-white">Dismiss</button>
                    </div>
                    {/* caret pointing up at the Wed cell */}
                    <div className="absolute -top-1.5 left-[50%] -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Scheduler() {
  return (
    <div className="min-w-[1440px]" data-screen-label="01 Weekly Work Order Scheduler">
      <AppBar />
      <div className="flex h-[calc(100vh-3.5rem)] min-h-[900px]">
        <LeftRail />
        <main className="flex-1 flex flex-col min-w-0">
          <CapacitySection />
          <ScheduleGrid />
        </main>
        <RightRail />
      </div>
      <TaskbarDock />
      <InsetCards />
    </div>
  );
}

window.Scheduler = Scheduler;
