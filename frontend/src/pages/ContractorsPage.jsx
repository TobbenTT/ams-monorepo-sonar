import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Loader2, Users, Briefcase, X } from 'lucide-react';
import * as api from '../api';

// Group C #8 Jorge 2026-04-21 — CRUD de contratistas y sus cuadrillas.
// El planner los usa en el picker del WO detail (ContractorCrewPicker).
export default function ContractorsPage() {
  const ctx = useOutletContext() || {};
  const plant = ctx.plant || ctx.selectedPlant?.plant_id || 'GOLDFIELDS-SN';
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState([]);
  const [crewsByContractor, setCrewsByContractor] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCrew, setShowAddCrew] = useState(null); // contractor_id
  const [form, setForm] = useState({ name: '', tax_id: '', contact_name: '', contact_phone: '', hourly_rate: '' });
  const [crewForm, setCrewForm] = useState({ name: '', specialty: '', size: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.listContractors(plant);
      setContractors(Array.isArray(list) ? list : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [plant]);

  const loadCrews = async (contractorId) => {
    try {
      const crews = await api.listContractorCrews(contractorId);
      setCrewsByContractor(prev => ({ ...prev, [contractorId]: Array.isArray(crews) ? crews : [] }));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (contractorId) => {
    if (expanded === contractorId) { setExpanded(null); return; }
    setExpanded(contractorId);
    if (!crewsByContractor[contractorId]) loadCrews(contractorId);
  };

  const addContractor = async () => {
    if (!form.name.trim()) { alert('Nombre requerido'); return; }
    try {
      await api.createContractor({ ...form, plant_id: plant, hourly_rate: parseFloat(form.hourly_rate) || null });
      setShowAdd(false);
      setForm({ name: '', tax_id: '', contact_name: '', contact_phone: '', hourly_rate: '' });
      load();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const addCrew = async (contractorId) => {
    if (!crewForm.name.trim()) { alert('Nombre requerido'); return; }
    try {
      await api.createContractorCrew(contractorId, { ...crewForm, contractor_id: contractorId });
      setShowAddCrew(null);
      setCrewForm({ name: '', specialty: '', size: 1 });
      loadCrews(contractorId);
    } catch (e) { alert('Error: ' + e.message); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Contratistas y cuadrillas
          </h1>
          <p className="text-sm text-muted-foreground">Empresas externas que ejecutan OTs terceareadas — planta {plant}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1" /> Nuevo contratista
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : contractors.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">Sin contratistas aún</p>
          <p className="text-sm text-muted-foreground mb-4">Agregá empresas externas que ejecuten OTs terceareadas.</p>
          <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" /> Primer contratista
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {contractors.map(c => (
            <Card key={c.contractor_id} className="overflow-hidden">
              <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30"
                onClick={() => toggleExpand(c.contractor_id)}>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{c.name}</h3>
                    {c.tax_id && <span className="text-xs font-mono text-muted-foreground">{c.tax_id}</span>}
                    <Badge className={c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                    {c.contact_name && <span>{c.contact_name}</span>}
                    {c.contact_phone && <span className="font-mono">{c.contact_phone}</span>}
                    {c.hourly_rate && <span className="font-semibold">${c.hourly_rate}/h</span>}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {crewsByContractor[c.contractor_id]?.length ?? '–'} cuadrillas
                </div>
              </div>

              {expanded === c.contractor_id && (
                <div className="border-t border-border bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" /> Cuadrillas de {c.name}
                    </h4>
                    <Button size="sm" onClick={() => setShowAddCrew(c.contractor_id)} className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-3 h-3 mr-1" /> Agregar cuadrilla
                    </Button>
                  </div>
                  {(crewsByContractor[c.contractor_id] || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Sin cuadrillas registradas.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(crewsByContractor[c.contractor_id] || []).map(cr => (
                        <div key={cr.crew_id} className="bg-white dark:bg-card rounded-lg border border-border p-3">
                          <div className="font-semibold text-sm text-foreground">{cr.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            {cr.specialty && <Badge className="bg-indigo-100 text-indigo-700 text-[10px]">{cr.specialty}</Badge>}
                            <span>{cr.size} personas</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showAddCrew === c.contractor_id && (
                    <div className="bg-white dark:bg-card border-2 border-dashed border-indigo-300 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase text-indigo-700">Nueva cuadrilla</h5>
                        <button onClick={() => setShowAddCrew(null)} className="p-1 rounded hover:bg-muted"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Nombre" value={crewForm.name}
                          onChange={e => setCrewForm({ ...crewForm, name: e.target.value })}
                          className="text-sm border border-border rounded px-2 py-1.5" />
                        <select value={crewForm.specialty} onChange={e => setCrewForm({ ...crewForm, specialty: e.target.value })}
                          className="text-sm border border-border rounded px-2 py-1.5">
                          <option value="">Especialidad…</option>
                          <option value="MECANICO">Mecánico</option>
                          <option value="ELECTRICO">Eléctrico</option>
                          <option value="INSTRUMENTISTA">Instrumentista</option>
                          <option value="SOLDADOR">Soldador</option>
                          <option value="CIVIL">Civil</option>
                          <option value="GENERAL">General</option>
                        </select>
                        <input type="number" min="1" placeholder="# personas" value={crewForm.size}
                          onChange={e => setCrewForm({ ...crewForm, size: parseInt(e.target.value) || 1 })}
                          className="text-sm border border-border rounded px-2 py-1.5" />
                      </div>
                      <Button size="sm" onClick={() => addCrew(c.contractor_id)} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                        Agregar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add contractor modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Nuevo contratista</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              <input placeholder="Nombre *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
              <input placeholder="RUT / Tax ID" value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
              <input placeholder="Contacto" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
              <input placeholder="Teléfono" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Tarifa por hora (USD)" value={form.hourly_rate}
                onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancelar</Button>
              <Button onClick={addContractor} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Crear</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
