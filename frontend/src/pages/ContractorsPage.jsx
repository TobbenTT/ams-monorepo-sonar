import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus, Loader2, Users, Briefcase, X, Search, Building2, Phone, User,
  DollarSign, Hash, ChevronDown, ChevronRight, Wrench, Zap, Cpu, Flame, HardHat,
} from 'lucide-react';
import * as api from '../api';

// Group C #8 Jorge 2026-04-21 — CRUD de contratistas y sus cuadrillas.
// Diseño v2: stats header, búsqueda, cards con identidad visual por especialidad.

const SPECIALTIES = [
  { value: 'MECANICO', label: 'Mecánico', icon: Wrench, tone: 'emerald' },
  { value: 'ELECTRICO', label: 'Eléctrico', icon: Zap, tone: 'amber' },
  { value: 'INSTRUMENTISTA', label: 'Instrumentista', icon: Cpu, tone: 'purple' },
  { value: 'SOLDADOR', label: 'Soldador', icon: Flame, tone: 'rose' },
  { value: 'CIVIL', label: 'Civil', icon: HardHat, tone: 'sky' },
  { value: 'GENERAL', label: 'General', icon: Users, tone: 'slate' },
];
const SPEC_BY_VALUE = Object.fromEntries(SPECIALTIES.map(s => [s.value, s]));
const TONES = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200', chip: 'bg-emerald-100 text-emerald-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200', chip: 'bg-amber-100 text-amber-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200', chip: 'bg-purple-100 text-purple-800' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200', chip: 'bg-rose-100 text-rose-800' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200', chip: 'bg-sky-100 text-sky-800' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200', chip: 'bg-slate-100 text-slate-800' },
};

export default function ContractorsPage() {
  const ctx = useOutletContext() || {};
  const plant = ctx.plant || ctx.selectedPlant?.plant_id || 'GOLDFIELDS-SN';
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState([]);
  const [crewsByContractor, setCrewsByContractor] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCrew, setShowAddCrew] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', tax_id: '', contact_name: '', contact_phone: '', hourly_rate: '' });
  const [crewForm, setCrewForm] = useState({ name: '', specialty: 'GENERAL', size: 1 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.listContractors(plant);
      setContractors(Array.isArray(list) ? list : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [plant]);

  // Eager load crews for stats
  useEffect(() => {
    if (contractors.length === 0) return;
    contractors.forEach(c => {
      if (!crewsByContractor[c.contractor_id]) loadCrews(c.contractor_id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractors]);

  const loadCrews = async (contractorId) => {
    try {
      const crews = await api.listContractorCrews(contractorId);
      setCrewsByContractor(prev => ({ ...prev, [contractorId]: Array.isArray(crews) ? crews : [] }));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (contractorId) => {
    setExpanded(expanded === contractorId ? null : contractorId);
  };

  const addContractor = async () => {
    if (!form.name.trim()) { alert('Nombre requerido'); return; }
    setSaving(true);
    try {
      await api.createContractor({ ...form, plant_id: plant, hourly_rate: parseFloat(form.hourly_rate) || null });
      setShowAdd(false);
      setForm({ name: '', tax_id: '', contact_name: '', contact_phone: '', hourly_rate: '' });
      await load();
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const addCrew = async (contractorId) => {
    if (!crewForm.name.trim()) { alert('Nombre requerido'); return; }
    setSaving(true);
    try {
      await api.createContractorCrew(contractorId, { ...crewForm, contractor_id: contractorId });
      setShowAddCrew(null);
      setCrewForm({ name: '', specialty: 'GENERAL', size: 1 });
      await loadCrews(contractorId);
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const stats = useMemo(() => {
    const totalContractors = contractors.length;
    const allCrews = Object.values(crewsByContractor).flat();
    const totalCrews = allCrews.length;
    const totalPeople = allCrews.reduce((s, c) => s + (c.size || 0), 0);
    const avgRate = contractors.filter(c => c.hourly_rate).length > 0
      ? Math.round(contractors.filter(c => c.hourly_rate).reduce((s, c) => s + c.hourly_rate, 0) / contractors.filter(c => c.hourly_rate).length)
      : 0;
    return { totalContractors, totalCrews, totalPeople, avgRate };
  }, [contractors, crewsByContractor]);

  const filtered = contractors.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    const crews = crewsByContractor[c.contractor_id] || [];
    return [c.name, c.tax_id, c.contact_name, c.contact_phone,
      ...crews.map(cr => cr.name), ...crews.map(cr => cr.specialty)]
      .filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-5">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contratistas y cuadrillas</h1>
              <p className="text-emerald-100 text-sm">Empresas externas que ejecutan OTs terceareadas · planta {plant}</p>
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Nuevo contratista
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Building2} tone="emerald" label="Contratistas" value={stats.totalContractors} />
        <StatCard icon={Users} tone="sky" label="Cuadrillas" value={stats.totalCrews} />
        <StatCard icon={Hash} tone="purple" label="Personas total" value={stats.totalPeople} />
        <StatCard icon={DollarSign} tone="amber" label="Tarifa prom." value={stats.avgRate > 0 ? `$${stats.avgRate}/h` : '—'} />
      </div>

      {/* Search */}
      {contractors.length > 0 && (
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RUT, contacto, especialidad…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      )}

      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </Card>
      ) : contractors.length === 0 ? (
        <Card className="p-16 text-center bg-gradient-to-b from-transparent to-muted/20">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-foreground mb-2">Sin contratistas registrados</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Agregá las empresas externas que ejecutan OTs terceareadas en esta planta.
            Después podés crear cuadrillas y asignarlas desde el detalle de cada OT.
          </p>
          <Button onClick={() => setShowAdd(true)} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" /> Crear primer contratista
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(c => {
            const crews = crewsByContractor[c.contractor_id] || [];
            const totalPeople = crews.reduce((s, cr) => s + (cr.size || 0), 0);
            const isExp = expanded === c.contractor_id;
            const initials = (c.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <Card key={c.contractor_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <button onClick={() => toggleExpand(c.contractor_id)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-muted/30 text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground truncate">{c.name}</h3>
                      {!c.active && <Badge className="bg-rose-100 text-rose-800 text-[10px]">Inactivo</Badge>}
                    </div>
                    {c.tax_id && (
                      <p className="text-[11px] font-mono text-muted-foreground">{c.tax_id}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                      {c.contact_name && (
                        <span className="inline-flex items-center gap-1"><User size={11} /> {c.contact_name}</span>
                      )}
                      {c.contact_phone && (
                        <span className="inline-flex items-center gap-1 font-mono"><Phone size={11} /> {c.contact_phone}</span>
                      )}
                      {c.hourly_rate && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><DollarSign size={11} />{c.hourly_rate}/h</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-sky-100 text-sky-800 text-[10px]">
                        <Users size={10} className="mr-1" /> {crews.length} cuadrillas
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                        <Hash size={10} className="mr-1" /> {totalPeople} personas
                      </Badge>
                    </div>
                  </div>
                  {isExp ? <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                    : <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />}
                </button>

                {isExp && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Cuadrillas
                      </h4>
                      <Button size="sm" onClick={() => setShowAddCrew(c.contractor_id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7">
                        <Plus className="w-3 h-3 mr-1" /> Agregar
                      </Button>
                    </div>

                    {crews.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                        <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground italic">Sin cuadrillas registradas</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {crews.map(cr => {
                          const spec = SPEC_BY_VALUE[cr.specialty] || SPEC_BY_VALUE.GENERAL;
                          const SpecIcon = spec.icon;
                          const tone = TONES[spec.tone] || TONES.slate;
                          return (
                            <div key={cr.crew_id}
                              className={`rounded-xl border ${tone.border} ${tone.bg} p-3 hover:shadow-sm transition-shadow`}>
                              <div className="flex items-start gap-2.5">
                                <div className={`w-9 h-9 rounded-lg ${tone.chip} flex items-center justify-center shrink-0`}>
                                  <SpecIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-foreground truncate">{cr.name}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-semibold ${tone.text}`}>{spec.label}</span>
                                    <span className="text-[10px] text-muted-foreground">·</span>
                                    <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                                      <Hash size={9} /> {cr.size || 1} pers
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {showAddCrew === c.contractor_id && (
                      <div className="bg-white dark:bg-card border-2 border-dashed border-indigo-300 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Nueva cuadrilla
                          </h5>
                          <button onClick={() => setShowAddCrew(null)} className="p-1 rounded hover:bg-muted">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input placeholder="Nombre" value={crewForm.name}
                            onChange={e => setCrewForm({ ...crewForm, name: e.target.value })}
                            className="text-sm border border-border rounded-lg px-2.5 py-2" />
                          <select value={crewForm.specialty} onChange={e => setCrewForm({ ...crewForm, specialty: e.target.value })}
                            className="text-sm border border-border rounded-lg px-2.5 py-2">
                            {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <input type="number" min="1" placeholder="# personas" value={crewForm.size}
                            onChange={e => setCrewForm({ ...crewForm, size: parseInt(e.target.value) || 1 })}
                            className="text-sm border border-border rounded-lg px-2.5 py-2" />
                        </div>
                        <Button size="sm" onClick={() => addCrew(c.contractor_id)} disabled={saving}
                          className="bg-emerald-600 hover:bg-emerald-700 w-full">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                          Crear cuadrilla
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && contractors.length > 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground italic">
          Sin resultados para "{search}"
        </Card>
      )}

      {/* Modal crear contratista — diseño mejorado */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !saving && setShowAdd(false)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Header con gradiente */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 relative">
              <button onClick={() => !saving && setShowAdd(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20">
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Nuevo contratista</h3>
                  <p className="text-emerald-100 text-xs">Empresa externa · {plant}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <FormField icon={Building2} label="Nombre de la empresa" required>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Servicios Mineros del Norte Ltda"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField icon={Hash} label="RUT / Tax ID">
                  <input value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })}
                    placeholder="76.123.456-7"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 font-mono focus:ring-2 focus:ring-emerald-500/30 outline-none" />
                </FormField>
                <FormField icon={DollarSign} label="Tarifa (USD/h)">
                  <input type="number" value={form.hourly_rate}
                    onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
                    placeholder="85"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none" />
                </FormField>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contacto</div>
                <FormField icon={User} label="Nombre del contacto">
                  <input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/30 outline-none" />
                </FormField>
                <FormField icon={Phone} label="Teléfono">
                  <input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-emerald-500/30 outline-none" />
                </FormField>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t border-border bg-muted/20">
              <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={addContractor} disabled={saving || !form.name.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                Crear contratista
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, tone, label, value }) {
  const t = TONES[tone] || TONES.slate;
  return (
    <Card className={`p-4 ${t.bg} ${t.border} border`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={t.text} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}>{label}</span>
      </div>
      <div className="text-2xl font-extrabold tabular-nums text-foreground">{value}</div>
    </Card>
  );
}

function FormField({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {Icon && <Icon size={11} />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
