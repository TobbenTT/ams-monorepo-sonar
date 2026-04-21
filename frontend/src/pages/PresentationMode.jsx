import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { X, Activity, Clock, AlertTriangle, TrendingUp, DollarSign, CheckCircle, Maximize2 } from 'lucide-react';
import * as api from '../api';

// Fase 5 plan 10-días — modo presentación pantalla-completa para TV de
// sala de operaciones. Rota 3 vistas cada 10s, KPIs gigantes, sin menús.
const SLIDE_MS = 10000;
const REFRESH_MS = 30000;

export default function PresentationMode() {
  const ctx = useOutletContext() || {};
  const plant = ctx.plant || ctx.selectedPlant?.plant_id || 'GOLDFIELDS-SN';
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [mtbf, setMtbf] = useState([]);
  const [aging, setAging] = useState(null);
  const [cost, setCost] = useState(null);
  const [slide, setSlide] = useState(0);

  const refresh = () => {
    Promise.all([
      api.getOpsSummary(plant).catch(() => null),
      api.getOpsMtbfTimeseries(plant, 6).catch(() => null),
      api.getOpsBacklogAging(plant).catch(() => null),
      api.getOpsCostPerEquipment(plant, 5).catch(() => null),
    ]).then(([s, m, a, c]) => {
      setSummary(s);
      setMtbf(m?.series || []);
      setAging(a);
      setCost(c);
    });
  };

  useEffect(() => {
    refresh();
    const refreshId = setInterval(refresh, REFRESH_MS);
    const slideId = setInterval(() => setSlide(s => (s + 1) % 3), SLIDE_MS);
    const onKey = (e) => { if (e.key === 'Escape') navigate('/dashboard'); };
    document.addEventListener('keydown', onKey);
    // Try to enter fullscreen on click (browser requires user gesture)
    const goFullscreen = () => {
      try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch {}
      document.removeEventListener('click', goFullscreen);
    };
    document.addEventListener('click', goFullscreen, { once: true });
    return () => {
      clearInterval(refreshId);
      clearInterval(slideId);
      document.removeEventListener('keydown', onKey);
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
    };
  }, [plant]);

  const now = new Date();
  const clock = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">MAGEAM</h1>
          <p className="text-slate-300 text-sm uppercase tracking-widest">Reliability Platform · {plant}</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black tabular-nums">{clock}</div>
          <div className="text-slate-300 text-sm capitalize">{dateStr}</div>
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="absolute top-6 right-[340px] p-2 rounded-lg bg-white/10 hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      {/* KPI strip gigante */}
      <div className="grid grid-cols-5 gap-6 px-10 pb-6">
        <BigKpi label="OTs Abiertas" value={summary?.open_wos ?? '—'} icon={Activity} tone="emerald" />
        <BigKpi label="Atrasadas" value={summary?.overdue_wos ?? '—'} icon={AlertTriangle} tone="rose" />
        <BigKpi label="MTTR 30d" value={summary?.mttr_hours_30d != null ? `${summary.mttr_hours_30d}h` : '—'} icon={Clock} tone="amber" />
        <BigKpi label="PM Compliance" value={summary?.pm_compliance_pct != null ? `${summary.pm_compliance_pct}%` : '—'} icon={TrendingUp} tone="sky" />
        <BigKpi label="Costo Total" value={cost?.total_cost_all ? `$${Math.round(cost.total_cost_all / 1000)}K` : '—'} icon={DollarSign} tone="purple" />
      </div>

      {/* Slide rotation */}
      <div className="flex-1 px-10 pb-10 min-h-0">
        {slide === 0 && <SlideMTBF data={mtbf} />}
        {slide === 1 && <SlideAging aging={aging} />}
        {slide === 2 && <SlideCost cost={cost} />}
      </div>

      {/* Footer dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {[0,1,2].map(i => (
          <span key={i} className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-emerald-400 w-8' : 'bg-white/30'}`} />
        ))}
      </div>
      <div className="absolute bottom-6 right-10 text-[11px] text-slate-400">
        ESC para salir · Click para pantalla completa
      </div>
    </div>
  );
}

function BigKpi({ label, value, icon: Icon, tone }) {
  const tones = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-400/40 text-emerald-300',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-400/40 text-rose-300',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-400/40 text-amber-300',
    sky: 'from-sky-500/20 to-sky-600/5 border-sky-400/40 text-sky-300',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-400/40 text-purple-300',
  };
  return (
    <div className={`rounded-3xl border bg-gradient-to-br ${tones[tone] || tones.emerald} p-6`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} />
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <div className="text-6xl font-black tabular-nums text-white">{value}</div>
    </div>
  );
}

function SlideMTBF({ data }) {
  const max = Math.max(...data.map(d => d.mtbf_days || 0), 1);
  return (
    <div className="h-full bg-white/5 rounded-3xl border border-white/10 p-8">
      <h2 className="text-3xl font-black mb-6">Evolución MTBF · últimos 6 meses</h2>
      <div className="flex items-end gap-4 h-[70%]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col justify-end flex-1">
              <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all"
                style={{ height: `${((d.mtbf_days || 0) / max) * 100}%` }} />
            </div>
            <div className="text-2xl font-black tabular-nums">{d.mtbf_days ?? '—'}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{d.month_label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideAging({ aging }) {
  const buckets = aging?.buckets || [];
  const COLORS = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500'];
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1;
  return (
    <div className="h-full bg-white/5 rounded-3xl border border-white/10 p-8">
      <h2 className="text-3xl font-black mb-2">Backlog Aging</h2>
      <p className="text-slate-400 text-sm mb-8">{aging?.total ?? 0} OTs abiertas · {aging?.stale_items?.length ?? 0} más de 90 días</p>
      <div className="grid grid-cols-5 gap-6">
        {buckets.map((b, i) => {
          const pct = Math.round((b.count / total) * 100);
          return (
            <div key={b.range} className="text-center">
              <div className="h-48 flex items-end mb-3">
                <div className={`w-full rounded-t-xl ${COLORS[i]} transition-all`}
                  style={{ height: `${Math.max(5, pct)}%` }} />
              </div>
              <div className="text-4xl font-black tabular-nums">{b.count}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{b.range}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideCost({ cost }) {
  const top = cost?.top || [];
  return (
    <div className="h-full bg-white/5 rounded-3xl border border-white/10 p-8">
      <h2 className="text-3xl font-black mb-6">Top 5 · Costo por Equipo</h2>
      <div className="space-y-4">
        {top.slice(0, 5).map((r, i) => (
          <div key={r.equipment_tag} className="flex items-center gap-6 bg-white/5 rounded-2xl px-6 py-4">
            <div className="text-5xl font-black text-emerald-400 w-12">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold truncate">{r.equipment_tag}</div>
              <div className="text-sm text-slate-400">{r.wo_count} OTs · {Math.round(r.actual_hours)}h reales</div>
            </div>
            <div className="text-3xl font-black text-emerald-300 tabular-nums">
              ${Math.round(r.total_cost).toLocaleString()}
            </div>
          </div>
        ))}
        {top.length === 0 && (
          <div className="text-slate-400 text-center py-12 italic">Sin datos de costo disponibles</div>
        )}
      </div>
    </div>
  );
}
