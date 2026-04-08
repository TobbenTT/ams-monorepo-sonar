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

const ROLES = ['admin', 'manager', 'planner', 'tecnico'];
const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 border-red-300',
  manager: 'bg-purple-100 text-purple-800 border-purple-300',
  planner: 'bg-blue-100 text-blue-800 border-blue-300',
  tecnico: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};
const ROLE_BAR_COLORS = {
  admin: 'bg-red-500',
  manager: 'bg-purple-500',
  planner: 'bg-blue-500',
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

export default function TeamPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();

  const { plant, plants } = useOutletContext();
    const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile dialog
  const [profileMember, setProfileMember] = useState(null);
  const [editingRole, setEditingRole] = useState(false);
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
      const users = await api.authListUsers(plant ? { plant_id: plant } : {});
      setTeam(Array.isArray(users) ? users : []);
    } catch (err) {
      setError(err.message || t('team.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  // ── View Profile ───────────────────────────────────────────────────
  const openProfile = (member) => {
    setProfileMember(member);
    setEditingRole(false);
    setNewRole(member.role);
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
    <div className="space-y-6">
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

      {/* Role Distribution */}
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

      {/* Member Cards */}
      {team.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
            <Users className="w-12 h-12" />
            <p className="text-lg font-medium">{t('team.noMembers')}</p>
            <p className="text-sm">{t('team.noMembersHint')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <Card key={member.user_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                    {getInitials(member)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.full_name || member.username}</h3>
                    <Badge className={`${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-800'} text-xs`}>
                      {member.role ? roleLabel(member.role) : t('team.noRole')}
                    </Badge>
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
            </div>
          )}

          <DialogFooter className="flex gap-2">
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
                    <option key={p.plant_id} value={p.plant_id}>{p.plant_id} — {p.name}</option>
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
