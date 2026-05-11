import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import {
  Users, Plus, Mail, Award, TrendingUp, Clock, Loader2, AlertCircle,
  Eye, ClipboardList, Shield, UserCheck, UserX, Pencil, Save, X,
} from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

const ROLES = ['admin', 'manager', 'planner', 'supervisor', 'engineer', 'tecnico'];
const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 border-red-300',
  manager: 'bg-purple-100 text-purple-800 border-purple-300',
  planner: 'bg-blue-100 text-blue-800 border-blue-300',
  supervisor: 'bg-amber-100 text-amber-800 border-amber-300',
  engineer: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  tecnico: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};
const ROLE_BAR_COLORS = {
  admin: 'bg-red-500',
  manager: 'bg-purple-500',
  planner: 'bg-blue-500',
  supervisor: 'bg-amber-500',
  engineer: 'bg-cyan-500',
  tecnico: 'bg-emerald-500',
};

function getInitials(member) {
  return (member.full_name || member.username || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const SPECIALTIES = ['MECANICO', 'ELECTRICO', 'INSTRUMENTISTA', 'SOLDADOR', 'LUBRICADOR', 'CIVIL', 'PREDICTIVO', 'FITTER', 'OTRO'];
const SHIFT_PATTERNS = [
  { v: '5x2', label: '5x2 (Lun–Vie)' },
  { v: '4x3', label: '4x3 (Lun–Jue)' },
  { v: '7x7', label: '7x7 (minería)' },
  { v: '14x14', label: '14x14 (minería remota)' },
  { v: 'continuous', label: 'Continuo (todos los días)' },
  { v: 'abc_8h', label: 'Rotación ABC 8h (subterránea)' },
];
const SHIFTS = [
  { v: 'day', label: 'Día ☀️' },
  { v: 'night', label: 'Noche 🌙' },
  { v: 'rotating', label: 'Rotativo' },
];
const COMMON_SKILLS = ['Soldadura', 'Alta tensión', 'Neumática', 'Hidráulica', 'Altura', 'Espacio confinado', 'Grúa horquilla', 'PLC/DCS', 'Vibraciones', 'Termografía'];
const COMMON_CERTS = ['SEC Clase A', 'SEC Clase B', 'SEC Clase C', 'SEC Clase D', 'Trabajo en Altura', 'Espacio Confinado', 'LOTO', 'Operador Grúa', 'Primeros Auxilios', 'NFPA 70E'];

function TechFields({ member, onSaved }) {
  const toast = useToast();
  const workerId = member.worker_id || member.user_id;
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    specialty: member.specialty || '',
    shift: member.shift || '',
    shift_pattern: member.shift_pattern || '',
    shift_cycle_start: member.shift_cycle_start || '',
    skills: Array.isArray(member.skills) ? member.skills : [],
    certifications: Array.isArray(member.certifications) ? member.certifications : [],
  });
  useEffect(() => {
    setForm({
      specialty: member.specialty || '',
      shift: member.shift || '',
      shift_pattern: member.shift_pattern || '',
      shift_cycle_start: member.shift_cycle_start || '',
      skills: Array.isArray(member.skills) ? member.skills : [],
      certifications: Array.isArray(member.certifications) ? member.certifications : [],
    });
    setEditing(false);
  }, [member.worker_id, member.user_id]);

  const toggleSkill = (s) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s],
    }));
  };
  const toggleCert = (c) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.includes(c) ? f.certifications.filter(x => x !== c) : [...f.certifications, c],
    }));
  };

  const save = async () => {
    if (!workerId) return;
    setSaving(true);
    try {
      const updated = await api.updateTechnician(workerId, form);
      onSaved && onSaved(updated);
      setEditing(false);
      // Notify other pages (Scheduling, SmartAssign) to refresh their cache
      try { window.dispatchEvent(new CustomEvent('workforce:updated', { detail: { workerId, ...form } })); } catch {}
    } catch (e) {
      toast.error('Error: ' + (e.message || 'no se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">Técnico · especialidad / turno / skills</p>
        {!editing && (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="w-3 h-3 mr-1" /> Editar
          </Button>
        )}
      </div>
      {!editing ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Especialidad</p>
            <p className="font-medium">{form.specialty || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Turno</p>
            <p className="font-medium">{form.shift || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Patrón</p>
            <p className="font-medium">{form.shift_pattern || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Inicio ciclo</p>
            <p className="font-medium">{form.shift_cycle_start || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-xs mb-1">Conocimientos</p>
            {form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {form.skills.map(s => <Badge key={s} className="bg-indigo-100 text-indigo-700">{s}</Badge>)}
              </div>
            ) : <p className="text-gray-400 italic text-xs">Sin conocimientos definidos</p>}
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-xs mb-1">Certificaciones</p>
            {form.certifications.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {form.certifications.map(c => <Badge key={c} className="bg-amber-100 text-amber-700">{c}</Badge>)}
              </div>
            ) : <p className="text-gray-400 italic text-xs">Sin certificaciones</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Especialidad</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                className="w-full border rounded px-2 py-1.5 mt-0.5">
                <option value="">—</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Turno</label>
              <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}
                className="w-full border rounded px-2 py-1.5 mt-0.5">
                <option value="">—</option>
                {SHIFTS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Patrón</label>
              <select value={form.shift_pattern} onChange={e => setForm({ ...form, shift_pattern: e.target.value })}
                className="w-full border rounded px-2 py-1.5 mt-0.5">
                <option value="">—</option>
                {SHIFT_PATTERNS.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Inicio ciclo (para 7x7/14x14)</label>
              <input type="date" value={form.shift_cycle_start} onChange={e => setForm({ ...form, shift_cycle_start: e.target.value })}
                className="w-full border rounded px-2 py-1.5 mt-0.5" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Conocimientos</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map(s => {
                const on = form.skills.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSkill(s)}
                    className={`text-[11px] px-2 py-1 rounded border transition-colors ${on ? 'bg-indigo-600 text-white border-indigo-600' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Certificaciones</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CERTS.map(c => {
                const on = form.certifications.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleCert(c)}
                    className={`text-[11px] px-2 py-1 rounded border transition-colors ${on ? 'bg-amber-600 text-white border-amber-600' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
              Guardar
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
              <X className="w-3 h-3 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();

  const { plant, plants } = useOutletContext();
    const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fase 3 Jorge 2026-04-21 — toggle vista + filtros team
  const [teamView, setTeamView] = useState('cards');
  const [teamFilter, setTeamFilter] = useState('');
  const [teamSpecFilter, setTeamSpecFilter] = useState('');
  const filteredTeam = team.filter(m => {
    if (teamSpecFilter && (m.specialty || '').toUpperCase() !== teamSpecFilter.toUpperCase()) return false;
    if (!teamFilter) return true;
    const q = teamFilter.toLowerCase();
    const hay = [
      m.full_name, m.username, m.email, m.specialty, m.shift, m.shift_pattern,
      ...(Array.isArray(m.skills) ? m.skills : []),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });

  // Profile dialog
  const [profileMember, setProfileMember] = useState(null);
  const [editingRole, setEditingRole] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', full_name: '', email: '', plant_id: '' });
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Add member dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', email: '', full_name: '', password: '', role: 'tecnico', plant_id: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Work requests for assignment
  const [assignMember, setAssignMember] = useState(null);
  const [pendingWRs, setPendingWRs] = useState([]);
  const [wrsLoading, setWrsLoading] = useState(false);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return t('team.never');
    try {
      const locale = lang === 'es' ? 'es-ES' : lang === 'ar' ? 'ar-MA' : 'en-US';
      return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }, [lang, t]);

  const roleLabel = useCallback((role) => {
    return t(`team.roleLabels.${role}`) || role;
  }, [t]);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [users, techs] = await Promise.all([
        api.authListUsers(plant ? { plant_id: plant } : {}).catch(() => []),
        api.listTechnicians({ plant_id: plant }).catch(() => []),
      ]);
      const userList = Array.isArray(users) ? users : [];
      const techList = Array.isArray(techs) ? techs : techs?.technicians || [];
      // Mapa por nombre normalizado para enriquecer userList con workforce data
      const techByName = new Map(
        techList.map(t => [(t.name || '').toLowerCase().trim(), t])
      );
      // Enriquecer userList con specialty/shift/skills del workforce si match por nombre
      const enrichedUsers = userList.map(u => {
        const name = (u.full_name || u.username || '').toLowerCase().trim();
        const tech = techByName.get(name);
        if (tech) {
          return {
            ...u,
            specialty: u.specialty || tech.specialty || '',
            shift: u.shift || tech.shift || '',
            shift_pattern: u.shift_pattern || tech.shift_pattern || '',
            shift_cycle_start: u.shift_cycle_start || tech.shift_cycle_start || '',
            skills: u.skills || tech.skills || [],
            worker_id: u.worker_id || tech.worker_id,
          };
        }
        return u;
      });
      const userNames = new Set(userList.map(u => (u.full_name || u.username || '').toLowerCase().trim()));
      const extraTechs = techList.filter(t => !userNames.has((t.name || '').toLowerCase().trim())).map(t => ({
        user_id: t.worker_id,
        worker_id: t.worker_id,
        username: t.name?.toLowerCase().replace(/\s+/g, '.') || t.worker_id,
        full_name: t.name,
        email: '',
        role: 'tecnico',
        plant_id: plant,
        is_active: t.available !== false,
        specialty: t.specialty,
        shift: t.shift,
        shift_pattern: t.shift_pattern,
        shift_cycle_start: t.shift_cycle_start,
        skills: t.skills || [],
        _source: 'workforce',
      }));
      setTeam([...enrichedUsers, ...extraTechs]);
    } catch (err) {
      setError(err.message || t('team.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t, plant]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  // ── Stats ──────────────────────────────────────────────────────────
  const activeMembers = team.filter(m => m.is_active);
  const roleCounts = team.reduce((acc, m) => {
    const role = m.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
    percentage: team.length > 0 ? Math.round((count / team.length) * 100) : 0,
  }));

  // Distribución por especialidad real (Jorge 2026-04-28: Team mostraba solo
  // "Technician" mientras Scheduling mostraba MEC/ELEC/INST. Ahora se ve la
  // especialidad real del workforce.)
  const specialtyCounts = team.reduce((acc, m) => {
    const spec = (m.specialty || '').toUpperCase().trim();
    if (!spec) return acc;
    // Normalizar a 3 letras canónicas
    let canonical = 'OTRO';
    if (spec.includes('MEC')) canonical = 'MECÁNICO';
    else if (spec.includes('ELEC')) canonical = 'ELÉCTRICO';
    else if (spec.includes('INST')) canonical = 'INSTRUMENTISTA';
    else if (spec.includes('SOLD') || spec.includes('WELD')) canonical = 'SOLDADOR';
    else if (spec.includes('LUBR')) canonical = 'LUBRICADOR';
    else if (spec.includes('CIVIL')) canonical = 'CIVIL';
    else if (spec.includes('PRED')) canonical = 'PREDICTIVO';
    else if (spec.includes('HID') || spec.includes('HYD')) canonical = 'HIDRÁULICO';
    else canonical = spec.slice(0, 14);
    acc[canonical] = (acc[canonical] || 0) + 1;
    return acc;
  }, {});
  const specialtyDistribution = Object.entries(specialtyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([spec, count]) => ({
      specialty: spec,
      count,
      percentage: team.length > 0 ? Math.round((count / team.length) * 100) : 0,
    }));

  // ── View Profile ───────────────────────────────────────────────────
  const openProfile = (member) => {
    setProfileMember(member);
    setEditingRole(false);
    setEditingProfile(false);
    setNewRole(member.role);
    setEditForm({
      username: member.username || '',
      full_name: member.full_name || '',
      email: member.email || '',
      plant_id: member.plant_id || '',
    });
  };

  const handleSaveProfile = async () => {
    if (!profileMember) return;
    try {
      setSaving(true);
      const updated = await api.authUpdateUser(profileMember.user_id, editForm);
      setProfileMember({ ...profileMember, ...updated });
      setEditingProfile(false);
      await fetchTeam();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async () => {
    if (!profileMember || newRole === profileMember.role) return;
    try {
      setSaving(true);
      await api.authUpdateRole(profileMember.user_id, { role: newRole });
      setProfileMember({ ...profileMember, role: newRole });
      setEditingRole(false);
      await fetchTeam();
    } catch (err) {
      toast.error(t('team.errors.changeRole', { message: err.message }));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member) => {
    try {
      setSaving(true);
      if (member.is_active) {
        await api.authDeactivate(member.user_id);
      } else {
        await api.authActivate(member.user_id);
      }
      const updated = { ...member, is_active: !member.is_active };
      if (profileMember?.user_id === member.user_id) setProfileMember(updated);
      await fetchTeam();
    } catch (err) {
      toast.error(t('team.errors.toggleActive', { message: err.message }));
    } finally {
      setSaving(false);
    }
  };

  // ── Add Member ─────────────────────────────────────────────────────
  const handleAddMember = async () => {
    setAddError('');
    if (!addForm.username || !addForm.email || !addForm.password) {
      setAddError(t('team.addDialog.requiredFields'));
      return;
    }
    try {
      setAddLoading(true);
      await api.authRegister(addForm);
      setShowAddDialog(false);
      setAddForm({ username: '', email: '', full_name: '', password: '', role: 'tecnico', plant_id: plant || '' });
      await fetchTeam();
    } catch (err) {
      setAddError(err.message || t('team.addDialog.registrationFailed'));
    } finally {
      setAddLoading(false);
    }
  };

  // ── Assign Work ────────────────────────────────────────────────────
  const openAssignWork = async (member) => {
    setAssignMember(member);
    setPendingWRs([]);
    setWrsLoading(true);
    try {
      const data = await api.listWorkRequests({ limit: 50 });
      const wrs = Array.isArray(data) ? data : (data?.items || data?.requests || []);
      // Show unassigned or pending WRs
      const pending = wrs.filter(wr =>
        !wr.assigned_to || ['DRAFT', 'PENDING_VALIDATION'].includes((wr.status || '').toUpperCase())
      );
      setPendingWRs(pending);
    } catch {
      setPendingWRs([]);
    } finally {
      setWrsLoading(false);
    }
  };

  const handleAssignWR = async (wr) => {
    try {
      // Validate WR with assigned_to info
      await api.validateWorkRequest(wr.request_id, {
        status: 'VALIDATED',
        assigned_to: assignMember.username,
        assigned_to_name: assignMember.full_name || assignMember.username,
      });
      setPendingWRs(prev => prev.filter(w => w.request_id !== wr.request_id));
    } catch (err) {
      toast.error(t('team.assignDialog.errorAssigning', { message: err.message }));
    }
  };

  // ── Loading / Error ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">{t('team.loadingMembers')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={fetchTeam}>{t('team.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-7 h-7" />
              {t('team.title')}
            </h1>
            <p className="text-violet-100 text-sm mt-1">{t('team.subtitle')}</p>
          </div>
          {/* D1 Tanda D — botón import Excel para carga masiva (Magda transcript). */}
          <input type="file" id="team-excel-input" accept=".xlsx,.xls" style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const res = await api.importTeamExcel(file, plant);
                toast.success(`✓ Importados ${res.created} · saltados ${res.skipped}${res.errors?.length ? ` · ${res.errors.length} errores` : ''}`, 8000);
                if (res.errors?.length) console.warn('Errores import:', res.errors);
                fetchTeam();
              } catch (err) {
                toast.error(`Error: ${err.message}`);
              }
              e.target.value = '';
            }} />
          <Button
            variant="outline"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 flex items-center gap-2"
            onClick={() => document.getElementById('team-excel-input')?.click()}
            title="Importar técnicos desde Excel · columnas: name, specialty, shift, shift_pattern, shift_cycle_start, skills, certifications">
            <Plus className="w-4 h-4" /> Importar Excel
          </Button>
          <Button
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 flex items-center gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4" /> {t('team.addMember')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('team.totalMembers')}</p>
              <p className="text-3xl font-semibold text-gray-800">{team.length}</p>
            </div>
            <Users className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('team.active')}</p>
              <p className="text-3xl font-semibold text-gray-800">{activeMembers.length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('team.roles')}</p>
              <p className="text-3xl font-semibold text-gray-800">{Object.keys(roleCounts).length}</p>
            </div>
            <Award className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('team.plants')}</p>
              <p className="text-3xl font-semibold text-gray-800">{new Set(team.map(m => m.plant_id).filter(Boolean)).size || 1}</p>
            </div>
            <Award className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Role Distribution + Specialty Distribution side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roleDistribution.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('team.roleDistribution')}</h3>
            <div className="space-y-3">
              {roleDistribution.map((item) => (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{roleLabel(item.role)}</span>
                    <span className="text-sm text-gray-600">{t('team.membersCount', { count: item.count, percentage: item.percentage })}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${ROLE_BAR_COLORS[item.role] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Specialty Distribution (Jorge 2026-04-28 — coincide con Scheduling) */}
        {specialtyDistribution.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Distribución por Especialidad</h3>
            <div className="space-y-3">
              {specialtyDistribution.map((item) => {
                // Mismos tonos que Scheduling SPEC_BADGE (versión 500 para barras)
                const colorMap = {
                  'MECÁNICO': 'bg-green-500',
                  'ELÉCTRICO': 'bg-yellow-500',
                  'INSTRUMENTISTA': 'bg-purple-500',
                  'SOLDADOR': 'bg-red-500',
                  'LUBRICADOR': 'bg-orange-500',
                  'CIVIL': 'bg-stone-500',
                  'PREDICTIVO': 'bg-blue-500',
                  'HIDRÁULICO': 'bg-cyan-500',
                };
                const barColor = colorMap[item.specialty] || 'bg-gray-500';
                return (
                  <div key={item.specialty}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.specialty}</span>
                      <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Member Cards */}
      {/* Fase 3 Jorge 2026-04-21 — toggle vista tabla / cards + filtros */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button onClick={() => setTeamView('cards')}
            className={`px-3 py-1.5 text-xs font-semibold ${teamView === 'cards' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            Tarjetas
          </button>
          <button onClick={() => setTeamView('table')}
            className={`px-3 py-1.5 text-xs font-semibold ${teamView === 'table' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            Tabla
          </button>
        </div>
        <input type="text" value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
          placeholder="Filtrar por nombre / especialidad / turno / skill…"
          className="flex-1 min-w-[240px] max-w-md text-sm border border-border rounded-lg px-3 py-1.5 bg-background" />
        <select value={teamSpecFilter} onChange={e => setTeamSpecFilter(e.target.value)}
          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
          <option value="">Todas las especialidades</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {team.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
            <Users className="w-12 h-12" />
            <p className="text-lg font-medium">{t('team.noMembers')}</p>
            <p className="text-sm">{t('team.noMembersHint')}</p>
          </div>
        </Card>
      ) : teamView === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Nombre</th>
                  <th className="text-left px-3 py-2 font-semibold">Rol</th>
                  <th className="text-left px-3 py-2 font-semibold">Especialidad</th>
                  <th className="text-left px-3 py-2 font-semibold">Turno</th>
                  <th className="text-left px-3 py-2 font-semibold">Patrón</th>
                  <th className="text-left px-3 py-2 font-semibold">Skills</th>
                  <th className="text-left px-3 py-2 font-semibold">Estado</th>
                  <th className="text-right px-3 py-2 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeam.map(m => (
                  <tr key={m.user_id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {getInitials(m)}
                        </div>
                        <span className="font-medium">{m.full_name || m.username}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={`${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-800'} text-[10px]`}>
                        {m.role ? roleLabel(m.role) : '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.specialty || '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.shift || '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground font-mono">{m.shift_pattern || '—'}</td>
                    <td className="px-3 py-2">
                      {Array.isArray(m.skills) && m.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.skills.slice(0, 3).map(s => <Badge key={s} className="bg-indigo-100 text-indigo-700 text-[9px]">{s}</Badge>)}
                          {m.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{m.skills.length - 3}</span>}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={m.is_active ? 'bg-green-100 text-green-800 text-[10px]' : 'bg-red-100 text-red-800 text-[10px]'}>
                        {m.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => openProfile(m)}>
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTeam.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground italic">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <Card key={member.user_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                    {getInitials(member)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.full_name || member.username}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <Badge className={`${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-800'} text-xs`}>
                        {member.role ? roleLabel(member.role) : t('team.noRole')}
                      </Badge>
                      {member.specialty && (() => {
                        // Mismos colores que Scheduling SPEC_BADGE. Uso <span> en vez de
                        // <Badge> para evitar conflicto con bg-primary del default variant
                        // (twMerge a veces no resuelve correctamente).
                        const s = (member.specialty || '').toUpperCase();
                        const tone =
                          s.includes('MEC') ? 'bg-green-100 text-green-800 border-green-300' :
                          s.includes('ELEC') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          s.includes('INST') ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          s.includes('SOLD') || s.includes('WELD') ? 'bg-red-100 text-red-800 border-red-300' :
                          s.includes('HID') || s.includes('HYD') ? 'bg-cyan-100 text-cyan-800 border-cyan-300' :
                          s.includes('LUBR') ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          s.includes('CIVIL') ? 'bg-stone-100 text-stone-800 border-stone-300' :
                          s.includes('PRED') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          'bg-gray-100 text-gray-800 border-gray-300';
                        const label =
                          s.includes('MEC') ? 'MEC' :
                          s.includes('ELEC') ? 'ELEC' :
                          s.includes('INST') ? 'INST' :
                          s.includes('SOLD') ? 'SOLD' :
                          s.includes('WELD') ? 'WELD' :
                          s.includes('HID') || s.includes('HYD') ? 'HID' :
                          s.includes('LUBR') ? 'LUBR' :
                          s.includes('CIVIL') ? 'CIVIL' :
                          s.includes('PRED') ? 'PRED' :
                          (s || '?').slice(0, 4);
                        return (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold ${tone}`}
                            title={member.specialty}
                          >
                            {label}
                          </span>
                        );
                      })()}
                      {member.shift && (() => {
                        const s = String(member.shift || '').toLowerCase();
                        const isNight = s.includes('night') || s.includes('noche') || s === 'n';
                        const isDay = s.includes('day') || s.includes('día') || s.includes('dia') || s.includes('morning') || s === 'd';
                        const tone = isNight
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : isDay
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300';
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${tone}`}>
                            {isNight ? '🌙 Noche' : isDay ? '☀️ Día' : member.shift}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <Badge className={member.is_active
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
                }>
                  {member.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-emerald-600 truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{t('team.lastLogin')}</span>
                  <span className="font-medium">{formatDate(member.last_login)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{t('team.since')}</span>
                  <span className="font-medium">{formatDate(member.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => openProfile(member)}>
                  <Eye className="w-3 h-3 mr-1" /> {t('team.profile')}
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => openAssignWork(member)}>
                  <ClipboardList className="w-3 h-3 mr-1" /> {t('team.assignWork')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Profile Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!profileMember} onOpenChange={(open) => { if (!open) setProfileMember(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                {profileMember && getInitials(profileMember)}
              </div>
              {profileMember?.full_name || profileMember?.username}
            </DialogTitle>
            <DialogDescription>{t('team.profileDialog.title')}</DialogDescription>
          </DialogHeader>

          {profileMember && (
            <div className="space-y-4">
              {editingProfile ? (
                /* ── Edit Mode ── */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">{t('team.profileDialog.username')}</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                      value={editForm.username}
                      onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">{t('team.addDialog.fullName') || 'Full Name'}</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                      value={editForm.full_name}
                      onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">{t('team.profileDialog.email')}</label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">{t('team.profileDialog.plant')}</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                      value={editForm.plant_id}
                      onChange={e => setEditForm({ ...editForm, plant_id: e.target.value })}
                    >
                      <option value="">Select plant...</option>
                      {(plants || []).map(p => (
                        <option key={p.plant_id} value={p.plant_id}>{p.name || 'Planta'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                      {lang === 'es' ? 'Guardar' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingProfile(false)}>
                      <X className="w-3 h-3 mr-1" /> {lang === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ── */
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.username')}</p>
                      <p className="font-medium">{profileMember.username}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.email')}</p>
                      <p className="font-medium text-emerald-600">{profileMember.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.plant')}</p>
                      <p className="font-medium">{profileMember.plant_id || t('team.profileDialog.notAssigned')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.memberSince')}</p>
                      <p className="font-medium">{formatDate(profileMember.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.lastLogin')}</p>
                      <p className="font-medium">{formatDate(profileMember.last_login)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('team.profileDialog.status')}</p>
                      <Badge className={profileMember.is_active
                        ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }>
                        {profileMember.is_active ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                  </div>

                  {/* Role editing */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">{t('team.profileDialog.role')}</p>
                      {!editingRole && (
                        <Button size="sm" variant="ghost" onClick={() => { setEditingRole(true); setNewRole(profileMember.role); }}>
                          <Pencil className="w-3 h-3 mr-1" /> {t('team.profileDialog.editRole')}
                        </Button>
                      )}
                    </div>
                    {editingRole ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="flex-1 border rounded px-3 py-1.5 text-sm"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
                          <option value="supervisor">supervisor</option>
                          <option value="engineer">engineer</option>
                        </select>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleChangeRole} disabled={saving}>
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingRole(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge className={`${ROLE_COLORS[profileMember.role] || ''} text-sm`}>
                        {roleLabel(profileMember.role)}
                      </Badge>
                    )}
                  </div>

                  {/* C7 Tanda C — Scope por especialidad para supervisores */}
                  {profileMember.role === 'supervisor' && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Especialidad asignada (RBAC)</p>
                      <p className="text-[11px] text-gray-500 mb-2">
                        El supervisor solo verá técnicos de esta disciplina en Team y Scheduling.
                        Dejar vacío para acceso a todas.
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={profileMember.scoped_specialty || ''}
                          onChange={async (e) => {
                            const val = e.target.value;
                            try {
                              setSaving(true);
                              const updated = await api.authUpdateUser(profileMember.user_id, { scoped_specialty: val });
                              setProfileMember({ ...profileMember, scoped_specialty: updated.scoped_specialty });
                              toast.success(val ? `Scope: ${val}` : 'Scope removido (todas las disciplinas)');
                              await fetchTeam();
                            } catch (err) {
                              toast.error('Error: ' + err.message);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="flex-1 border rounded px-3 py-1.5 text-sm"
                          disabled={saving}>
                          <option value="">— Todas (sin scope) —</option>
                          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {profileMember.scoped_specialty && (
                        <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-300 text-xs">
                          🔒 Solo {profileMember.scoped_specialty}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Fase 3 Jorge 2026-04-21 — técnico: especialidad + turno + pattern + skills.
                      Solo para miembros que existen en workforce (tienen worker_id). */}
                  {(profileMember._source === 'workforce' || profileMember.role === 'tecnico') && (
                    <TechFields
                      member={profileMember}
                      onSaved={(updated) => {
                        setProfileMember({ ...profileMember, ...updated });
                        setTeam(prev => prev.map(m => (m.worker_id || m.user_id) === (profileMember.worker_id || profileMember.user_id) ? { ...m, ...updated } : m));
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {!editingProfile && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={() => setEditingProfile(true)}
              >
                <Pencil className="w-3 h-3 mr-1" /> {lang === 'es' ? 'Editar Perfil' : 'Edit Profile'}
              </Button>
            )}
            <Button
              size="sm"
              variant={profileMember?.is_active ? 'outline' : 'default'}
              className={profileMember?.is_active ? 'text-red-600 border-red-300 hover:bg-red-50' : 'bg-emerald-600 hover:bg-emerald-700'}
              onClick={() => profileMember && handleToggleActive(profileMember)}
              disabled={saving}
            >
              {profileMember?.is_active ? (
                <><UserX className="w-3 h-3 mr-1" /> {t('team.profileDialog.deactivate')}</>
              ) : (
                <><UserCheck className="w-3 h-3 mr-1" /> {t('team.profileDialog.activate')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Member Dialog ────────────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('team.addDialog.title')}</DialogTitle>
            <DialogDescription>{t('team.addDialog.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {addError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{addError}</p>}
            <div>
              <label className="text-xs font-medium text-gray-600">{t('team.addDialog.fullName')}</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={addForm.full_name}
                onChange={e => setAddForm({ ...addForm, full_name: e.target.value })}
                placeholder={t('team.addDialog.fullNamePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{t('team.addDialog.username')}</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={addForm.username}
                  onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder={t('team.addDialog.usernamePlaceholder')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{t('team.addDialog.email')}</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={addForm.email}
                  onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder={t('team.addDialog.emailPlaceholder')}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('team.addDialog.password')}</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={addForm.password}
                onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />
              {addForm.password && <div className="flex gap-3 mt-1">
                <span className={"text-[10px] " + (addForm.password.length >= 8 ? "text-emerald-600" : "text-red-500")}>{addForm.password.length >= 8 ? "✓" : "✗"} 8+ chars</span>
                <span className={"text-[10px] " + (/[A-Z]/.test(addForm.password) ? "text-emerald-600" : "text-red-500")}>{/[A-Z]/.test(addForm.password) ? "✓" : "✗"} Uppercase</span>
                <span className={"text-[10px] " + (/[0-9]/.test(addForm.password) ? "text-emerald-600" : "text-red-500")}>{/[0-9]/.test(addForm.password) ? "✓" : "✗"} Number</span>
              </div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{t('team.addDialog.role')}</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={addForm.role}
                  onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                >
                  {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{t('team.addDialog.plantId')}</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={addForm.plant_id}
                  onChange={e => setAddForm({ ...addForm, plant_id: e.target.value })}
                >
                  <option value="">Select plant...</option>
                  {(plants || []).map(p => (
                    <option key={p.plant_id} value={p.plant_id}>{p.name || 'Planta'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t('common.cancel')}</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddMember} disabled={addLoading}>
              {addLoading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('team.addDialog.creating')}</> : <><Plus className="w-3 h-3 mr-1" /> {t('team.addDialog.createUser')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Work Dialog ───────────────────────────────────────── */}
      <Dialog open={!!assignMember} onOpenChange={(open) => { if (!open) setAssignMember(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {t('team.assignDialog.title', { name: assignMember?.full_name || assignMember?.username })}
            </DialogTitle>
            <DialogDescription>
              {t('team.assignDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {wrsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : pendingWRs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">{t('team.assignDialog.noPending')}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {pendingWRs.map(wr => (
                <div key={wr.request_id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {wr.request_id} — {wr.equipment_tag || wr.equipment_name || t('team.assignDialog.noEquipment')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {typeof wr.problem_description === 'object'
                        ? wr.problem_description.original_text || ''
                        : wr.problem_description || ''}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{wr.status}</Badge>
                      <Badge variant="outline" className="text-xs">{wr.priority || 'P3'}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="ml-3 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    onClick={() => handleAssignWR(wr)}
                  >
                    {t('team.assignDialog.assign')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
