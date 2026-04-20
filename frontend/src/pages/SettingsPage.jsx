import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Settings as SettingsIcon, Bell, Shield, Database, Users, Palette, Loader2, AlertCircle, CheckCircle2, Globe, Upload, FileText, Download } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const SETTINGS_KEY_BASE = 'ocp_settings';
const settingsKeyFor = (plantId) => plantId ? `${SETTINGS_KEY_BASE}_${plantId}` : SETTINGS_KEY_BASE;
const currentPlant = () => localStorage.getItem('selected_plant') || '';

const PLANT_DEFAULTS = {
  'OCP-JFC1':      { companyName: 'OCP Group',                    timezone: 'gmt+1', currency: 'mad', defaultPlant: 'OCP-JFC1' },
  'GOLDFIELDS-SN': { companyName: 'Gold Fields — Salares Norte',   timezone: 'gmt-3', currency: 'usd', defaultPlant: 'GOLDFIELDS-SN' },
  'FLUOR-ALFA':    { companyName: 'Fluor Corporation',             timezone: 'gmt-5', currency: 'usd', defaultPlant: 'FLUOR-ALFA' },
  'DEMO-CORP':     { companyName: 'Demo Mining Corporation',       timezone: 'gmt+0', currency: 'usd', defaultPlant: 'DEMO-CORP' },
};

function loadSettings(plantId) {
  try {
    const raw = localStorage.getItem(settingsKeyFor(plantId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(s, plantId) {
  localStorage.setItem(settingsKeyFor(plantId), JSON.stringify(s));
  try { window.dispatchEvent(new CustomEvent('ocp-settings-changed', { detail: { plantId } })); } catch {}
}

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const [plantId, setPlantId] = useState(() => currentPlant());

  // Persisted general settings (per-plant)
  const buildInitialSettings = (pid) => ({
    companyName: '',
    timezone: 'gmt+0',
    defaultPlant: pid || '',
    currency: 'usd',
    autoSaveWO: true,
    enableAI: true,
    availabilityTarget: 95,
    mtbfTarget: 300,
    mttrTarget: 3.5,
    laborRate: 35,
    plannedWorkTarget: 80,
    // Scheduling capacity config
    mineType: 'plant',               // plant | open_pit | underground (Jorge 2026-04-20)
    shiftStartHour: 8,               // Inicio del turno día (ej: 7, 8)
    nominalHoursPerShift: 12,
    effectiveHoursPerShift: 10,
    schedulingPercent: 80,
    productivityFactor: 90,
    shiftType: 'day_night', // day_night | abc_8h
    weekStartDay: 1, // 1=Monday, 3=Wednesday
    notifCritical: true,
    notifWODelays: true,
    notifKPI: true,
    notifImprovement: true,
    notifWeekly: false,
    notifEmail: true,
    notifSMS: false,
    notifInApp: true,
    theme: 'emerald',
    compactView: false,
    dashboardLayout: 'standard',
    ...(PLANT_DEFAULTS[pid] || {}),
    ...loadSettings(pid),
  });
  const [settings, setSettings] = useState(() => buildInitialSettings(currentPlant()));

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importSource, setImportSource] = useState('EQUIPMENT_HIERARCHY');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Reload settings whenever the selected plant changes (cross-tab + same-tab)
  useEffect(() => {
    const syncPlant = () => {
      const pid = currentPlant();
      setPlantId(prev => (prev !== pid ? pid : prev));
    };
    window.addEventListener('storage', syncPlant);
    const interval = setInterval(syncPlant, 1000);
    return () => { window.removeEventListener('storage', syncPlant); clearInterval(interval); };
  }, []);

  // Load DB stats + health for the Data tab
  useEffect(() => {
    api.getStats().then(s => {
      setDbStats(prev => ({
        ...(prev || {}),
        total_nodes: s?.total_nodes,
        plants: s?.plants,
      }));
    }).catch(() => {});
    api.healthCheck().then(h => {
      setDbStats(prev => ({ ...(prev || {}), ...(h?.counts || {}), _health: h }));
    }).catch(() => {});
  }, [plantId]);

  useEffect(() => {
    // Seed local state from per-plant localStorage + plant defaults
    setSettings(buildInitialSettings(plantId));
    // Then hydrate from backend
    api.getSettings(plantId || undefined).then(remote => {
      if (remote && Object.keys(remote).length > 0) {
        setSettings(prev => {
          const merged = { ...prev, ...remote };
          saveSettings(merged, plantId);
          return merged;
        });
      }
    }).catch(() => {});
  }, [plantId]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const data = await api.authMe();
        if (!cancelled) {
          setProfile(data);
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setUsername(data.username || '');
        }
      } catch (err) {
        if (!cancelled) setProfileError(err.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next, plantId);
      return next;
    });
  };

  const handleSaveAll = async () => {
    saveSettings(settings, plantId);
    try {
      await api.saveSettingsAPI(settings, plantId || undefined);
    } catch { /* fallback: localStorage only */ }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem(settingsKeyFor(plantId));
    window.location.reload();
  };

  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(false);
      await api.authUpdateProfile({ full_name: fullName, email, username });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setPasswordError(t('settings.profile.fillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.profile.passwordsMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('settings.profile.passwordTooShort'));
      return;
    }
    try {
      setPasswordSaving(true);
      await api.authChangePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [lastExport, setLastExport] = useState(() => localStorage.getItem('last_export_ts') || null);

  const ROLE_KEYS = [
    { key: 'admin',    label: t('settings.users.roles.administrator') },
    { key: 'engineer', label: t('settings.users.roles.reliabilityEngineer') },
    { key: 'manager',  label: t('settings.users.roles.maintenanceManager') },
    { key: 'tecnico',  label: t('settings.users.roles.technician') },
    { key: 'planner',  label: t('settings.users.roles.planner') },
  ];

  // Permission matrix — aligned with backend require_role() decorators
  const PERMISSIONS = {
    admin:    { dashboard: 'full', workOrders: 'full', workRequests: 'full', failures: 'full', improvement: 'full', analytics: 'full', reports: 'full', team: 'full', settings: 'full', sapPm: 'full', dataImport: 'full', auditLog: 'full', aiAgents: 'full' },
    manager:  { dashboard: 'full', workOrders: 'full', workRequests: 'full', failures: 'full', improvement: 'full', analytics: 'full', reports: 'full', team: 'full', settings: 'read', sapPm: 'full', dataImport: 'full', auditLog: 'read', aiAgents: 'full' },
    planner:  { dashboard: 'full', workOrders: 'full', workRequests: 'full', failures: 'full', improvement: 'full', analytics: 'none', reports: 'full', team: 'full', settings: 'none', sapPm: 'full', dataImport: 'none', auditLog: 'none', aiAgents: 'none' },
    engineer: { dashboard: 'full', workOrders: 'full', workRequests: 'full', failures: 'full', improvement: 'full', analytics: 'none', reports: 'full', team: 'none', settings: 'none', sapPm: 'none', dataImport: 'none', auditLog: 'none', aiAgents: 'full' },
    tecnico:  { dashboard: 'read', workOrders: 'read', workRequests: 'full', failures: 'full', improvement: 'read', analytics: 'none', reports: 'read', team: 'none', settings: 'none', sapPm: 'none', dataImport: 'none', auditLog: 'none', aiAgents: 'none' },
  };

  const MODULES = [
    { key: 'dashboard',   label: 'Dashboard' },
    { key: 'workOrders',  label: 'Work Orders' },
    { key: 'workRequests',label: 'Work Requests' },
    { key: 'failures',    label: 'Failures & Events' },
    { key: 'improvement', label: 'Improvement Actions' },
    { key: 'analytics',   label: 'Analytics' },
    { key: 'reports',     label: 'Reports' },
    { key: 'team',        label: 'Team' },
    { key: 'sapPm',       label: 'SAP PM' },
    { key: 'dataImport',  label: 'Data Import' },
    { key: 'aiAgents',    label: 'AI Agents' },
    { key: 'auditLog',    label: 'Audit Log' },
    { key: 'settings',    label: 'Settings' },
  ];

  const ROLES = [
    t('settings.users.roles.administrator'),
    t('settings.users.roles.reliabilityEngineer'),
    t('settings.users.roles.maintenanceManager'),
    t('settings.users.roles.technician'),
    t('settings.users.roles.planner'),
  ];

  const INTEGRATIONS = [
    {
      name: 'SAP ERP',
      statusKey: 'connected',
      color: 'green',
      desc: 'Bi-directional sync of work orders, notifications (avisos), functional locations, and cost centers with SAP PM.',
      endpoints: ['POST /sap/orders', 'GET /sap/notifications', 'GET /catalogs/*'],
      lastSync: '2 minutes ago',
    },
    {
      name: 'CMMS Integration',
      statusKey: 'connected',
      color: 'green',
      desc: 'Legacy CMMS adapter for equipment hierarchy and maintenance history imports.',
      endpoints: ['POST /imports/upload', 'GET /hierarchy/nodes'],
      lastSync: '14 hours ago',
    },
    {
      name: 'Email Notifications (SMTP)',
      statusKey: 'connected',
      color: 'green',
      desc: 'Outbound email for sales leads, WO alerts, and user auto-replies.',
      endpoints: ['POST /admin/test-email', 'GET /admin/email-status'],
      lastSync: 'Live',
    },
    {
      name: 'Anthropic Claude API',
      statusKey: 'connected',
      color: 'green',
      desc: 'LLM backend for AI classification, voice transcription fallback, and troubleshooting assistant.',
      endpoints: ['/ai-agents/*', '/troubleshooting/*', '/media/transcribe'],
      lastSync: 'Live',
    },
    {
      name: 'IoT Sensors (OPC-UA)',
      statusKey: 'notConnected',
      color: 'gray',
      desc: 'Real-time vibration, temperature, and pressure ingestion from plant sensors via OPC-UA gateway.',
      endpoints: ['Pending configuration'],
      lastSync: 'Never',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-slate-700 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <SettingsIcon className="w-7 h-7" />
              {t('settings.title')}
            </h1>
            <p className="text-slate-200 text-sm mt-1">{t('settings.subtitle')}</p>
            {plantId && (
              <div className="mt-2 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span className="text-slate-100">Editing settings for</span>
                <span className="font-semibold text-white">{plantId}</span>
              </div>
            )}
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-white text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('settings.profile.profileUpdated')}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="users">{t('settings.tabs.users')}</TabsTrigger>
          <TabsTrigger value="data">{t('settings.tabs.data')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-600" />
              {t('settings.general.title')}
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">{t('settings.general.companyName')}</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">{t('settings.general.timezone')}</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateSetting('timezone', v)}>
                    <SelectTrigger id="timezone" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmt+1">GMT+1 (Morocco)</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="defaultPlant">{t('settings.general.defaultPlant')}</Label>
                  <Select value={settings.defaultPlant} onValueChange={(v) => updateSetting('defaultPlant', v)}>
                    <SelectTrigger id="defaultPlant" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANT-01">OCP Industrial Site C1</SelectItem>
                      <SelectItem value="PLANT-02">OCP Industrial Site C2</SelectItem>
                      <SelectItem value="OCP-SAFI">OCP Safi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('settings.general.currency')}</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSetting('currency', v)}>
                    <SelectTrigger id="currency" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mad">MAD (Dirham)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.general.autoSaveWO')}</p>
                  <p className="text-sm text-gray-600">{t('settings.general.autoSaveWODesc')}</p>
                </div>
                <Switch checked={settings.autoSaveWO} onCheckedChange={(v) => updateSetting('autoSaveWO', v)} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.general.enableAI')}</p>
                  <p className="text-sm text-gray-600">{t('settings.general.enableAIDesc')}</p>
                </div>
                <Switch checked={settings.enableAI} onCheckedChange={(v) => updateSetting('enableAI', v)} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('settings.general.kpiTargets')}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="availabilityTarget">{t('settings.general.availabilityTarget')}</Label>
                <Input id="availabilityTarget" type="number" value={settings.availabilityTarget} onChange={(e) => updateSetting('availabilityTarget', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mtbfTarget">{t('settings.general.mtbfTarget')}</Label>
                <Input id="mtbfTarget" type="number" value={settings.mtbfTarget} onChange={(e) => updateSetting('mtbfTarget', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mttrTarget">{t('settings.general.mttrTarget')}</Label>
                <Input id="mttrTarget" type="number" value={settings.mttrTarget} onChange={(e) => updateSetting('mttrTarget', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="plannedWorkTarget">{t('settings.general.plannedWorkTarget')}</Label>
                <Input id="plannedWorkTarget" type="number" value={settings.plannedWorkTarget} onChange={(e) => updateSetting('plannedWorkTarget', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mtbmTarget">MTBM objetivo (días)</Label>
                <Input id="mtbmTarget" type="number" value={(settings.kpiTargets?.mtbm) ?? 60} onChange={(e) => updateSetting('kpiTargets', { ...(settings.kpiTargets || {}), mtbm: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="scheduleComplianceTarget">Schedule Compliance objetivo (%)</Label>
                <Input id="scheduleComplianceTarget" type="number" min="0" max="100" value={(settings.kpiTargets?.scheduleCompliance) ?? 90} onChange={(e) => updateSetting('kpiTargets', { ...(settings.kpiTargets || {}), scheduleCompliance: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="equipmentHealthTarget">Equipment Health objetivo (%)</Label>
                <Input id="equipmentHealthTarget" type="number" min="0" max="100" value={(settings.kpiTargets?.equipmentHealth) ?? 95} onChange={(e) => updateSetting('kpiTargets', { ...(settings.kpiTargets || {}), equipmentHealth: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="backlogWeeksTarget">Backlog máximo (semanas)</Label>
                <Input id="backlogWeeksTarget" type="number" min="1" value={(settings.kpiTargets?.backlogWeeks) ?? 4} onChange={(e) => updateSetting('kpiTargets', { ...(settings.kpiTargets || {}), backlogWeeks: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="isoComplianceTarget">ISO Compliance objetivo (%)</Label>
                <Input id="isoComplianceTarget" type="number" min="0" max="100" value={(settings.kpiTargets?.isoCompliance) ?? 100} onChange={(e) => updateSetting('kpiTargets', { ...(settings.kpiTargets || {}), isoCompliance: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="laborRate">Tarifa mano de obra interna (ZMANT001) $/h</Label>
                <Input id="laborRate" type="number" value={settings.laborRate} onChange={(e) => updateSetting('laborRate', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">Tarifa horaria fija para mano de obra interna. Se usa en el control de costos SAP.</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              ℹ️ Estos objetivos se usan para calcular el estado (verde/amarillo/rojo) de los KPIs en el Dashboard. Cada planta puede configurar los suyos.
            </p>
          </Card>

          {/* Scheduling Capacity Config */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
              Configuración de capacidad del programa
            </h3>
            <p className="text-xs text-gray-500 mb-4">Parámetros de capacidad que alimentan el tablero de programación. Definen cuántas horas pueden programarse por día y por técnico.</p>
            <div className="grid grid-cols-2 gap-6">
              {/* Jorge (2026-04-20): tipo de faena para configurar turnos por defecto */}
              <div>
                <Label>Tipo de faena</Label>
                <select value={settings.mineType || 'plant'} onChange={e => {
                  const v = e.target.value;
                  updateSetting('mineType', v);
                  // Sugerir configuración estándar
                  if (v === 'underground') {
                    updateSetting('shiftType', 'abc_8h');
                    updateSetting('nominalHoursPerShift', 8);
                  } else {
                    updateSetting('shiftType', 'day_night');
                    updateSetting('nominalHoursPerShift', 12);
                  }
                }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  <option value="plant">Planta</option>
                  <option value="open_pit">Mina Rajo Abierto</option>
                  <option value="underground">Mina Subterránea (3 turnos 8h por ley)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Cambia el patrón de turnos por defecto</p>
              </div>
              <div>
                <Label>Hora de inicio turno día</Label>
                <Input type="number" min="0" max="23" value={settings.shiftStartHour ?? 8}
                  onChange={e => updateSetting('shiftStartHour', Number(e.target.value))}
                  className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">Ej: 7 (7–19), 8 (8–20)</p>
              </div>
              <div>
                <Label>Horas nominales por turno</Label>
                <Input type="number" value={settings.nominalHoursPerShift} onChange={e => updateSetting('nominalHoursPerShift', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">Duración total del turno (ej. 12h, 8h)</p>
              </div>
              <div>
                <Label>Horas efectivas por turno</Label>
                <Input type="number" value={settings.effectiveHoursPerShift} onChange={e => updateSetting('effectiveHoursPerShift', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">Tras descontar almuerzo, reuniones, etc.</p>
              </div>
              <div>
                <Label>% programable</Label>
                <Input type="number" min="50" max="100" value={settings.schedulingPercent} onChange={e => updateSetting('schedulingPercent', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">% de horas efectivas para trabajo planeado. El resto se reserva para correctivos/imprevistos.</p>
              </div>
              <div>
                <Label>Factor de productividad %</Label>
                <Input type="number" min="50" max="100" value={settings.productivityFactor} onChange={e => updateSetting('productivityFactor', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">Considera traslados, alistamiento y tiempos muertos.</p>
              </div>
              <div>
                <Label>Patrón de turnos</Label>
                <select value={settings.shiftType} onChange={e => updateSetting('shiftType', e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  <option value="day_night">Día / Noche (turnos 12h)</option>
                  <option value="abc_8h">Rotación ABC (turnos 8h)</option>
                  <option value="7x7">7x7 (7 días ON / 7 OFF)</option>
                  <option value="4x4">4x4 (4 días ON / 4 OFF)</option>
                  <option value="5x2">5x2 (semana estándar)</option>
                  <option value="14x14">14x14 (minería remota)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Define la rotación de personal en faena</p>
              </div>
              <div>
                <Label>Dotación día (técnicos)</Label>
                <Input type="number" min="0" value={settings.dayShiftCount ?? ''} onChange={e => updateSetting('dayShiftCount', Number(e.target.value))} className="mt-1" placeholder="Ej: 10" />
                <p className="text-xs text-gray-400 mt-1">Nº total de técnicos en turno día</p>
              </div>
              <div>
                <Label>Dotación noche (técnicos)</Label>
                <Input type="number" min="0" value={settings.nightShiftCount ?? ''} onChange={e => updateSetting('nightShiftCount', Number(e.target.value))} className="mt-1" placeholder="Ej: 2" />
                <p className="text-xs text-gray-400 mt-1">Nº técnicos en turno noche (habitualmente menor)</p>
              </div>
              <div>
                <Label>Inicio de semana</Label>
                <select value={settings.weekStartDay} onChange={e => updateSetting('weekStartDay', Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  <option value={1}>Lunes (estándar)</option>
                  <option value={0}>Domingo</option>
                  <option value={3}>Miércoles (minería)</option>
                  <option value={6}>Sábado</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Algunas minas usan ciclos Mié-Mar</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-xs font-bold text-indigo-600 uppercase mb-1">HH programables por persona / día</div>
                <div className="text-2xl font-extrabold text-indigo-800">
                  {((settings.effectiveHoursPerShift || 10) * (settings.schedulingPercent || 80) / 100 * (settings.productivityFactor || 90) / 100).toFixed(1)}h
                </div>
                <p className="text-xs text-indigo-500 mt-1">{settings.effectiveHoursPerShift}h x {settings.schedulingPercent}% x {settings.productivityFactor}%</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {t('settings.profile.title')}
            </h3>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-2 text-sm text-gray-500">{t('settings.profile.loadingProfile')}</span>
              </div>
            ) : profileError && !profile ? (
              <div className="flex flex-col items-center py-8 text-red-500 gap-2">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm">{profileError}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="profileFullName">{t('settings.profile.fullName')}</Label>
                    <Input id="profileFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="profileEmail">{t('settings.profile.email')}</Label>
                    <Input id="profileEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="profileUsername">{t('settings.profile.username')}</Label>
                    <Input id="profileUsername" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('settings.profile.role')}</Label>
                    <Input value={profile?.role || '\u2014'} disabled className="mt-1 bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>{t('settings.profile.plant')}</Label>
                    <Input value={profile?.plant_id || '\u2014'} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label>{t('settings.profile.memberSince')}</Label>
                    <Input
                      value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '\u2014'}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" /><span>{profileError}</span>
                  </div>
                )}
                {profileSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" /><span>{t('settings.profile.profileUpdated')}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveProfile} disabled={profileSaving}>
                    {profileSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('settings.profile.saving')}</>) : t('settings.profile.saveProfile')}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              {t('settings.profile.changePassword')}
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="currentPassword">{t('settings.profile.currentPassword')}</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" placeholder={t('settings.profile.currentPasswordPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('settings.profile.newPassword')}</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" placeholder={t('settings.profile.newPasswordPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('settings.profile.confirmPassword')}</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" placeholder={t('settings.profile.confirmPasswordPlaceholder')} />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" /><span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" /><span>{t('settings.profile.passwordChanged')}</span>
                </div>
              )}

              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleChangePassword} disabled={passwordSaving}>
                {passwordSaving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('settings.profile.changing')}</>) : t('settings.profile.changePassword')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              {t('settings.notifications.title')}
            </h3>
            <div className="space-y-4">
              {[
                { key: 'notifCritical', label: 'criticalFailures', desc: 'criticalFailuresDesc' },
                { key: 'notifWODelays', label: 'woDelays', desc: 'woDelaysDesc' },
                { key: 'notifKPI', label: 'kpiDeviations', desc: 'kpiDeviationsDesc' },
                { key: 'notifImprovement', label: 'improvementDue', desc: 'improvementDueDesc' },
                { key: 'notifWeekly', label: 'weeklyReports', desc: 'weeklyReportsDesc' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{t(`settings.notifications.${label}`)}</p>
                    <p className="text-sm text-gray-600">{t(`settings.notifications.${desc}`)}</p>
                  </div>
                  <Switch checked={settings[key]} onCheckedChange={(v) => updateSetting(key, v)} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('settings.notifications.channels')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.notifications.emailNotifications')}</p>
                  <p className="text-sm text-gray-600">{email || t('settings.notifications.notConfigured')}</p>
                </div>
                <Switch checked={settings.notifEmail} onCheckedChange={(v) => updateSetting('notifEmail', v)} />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.notifications.smsNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.notConfigured')}</p>
                </div>
                <Switch checked={settings.notifSMS} onCheckedChange={(v) => updateSetting('notifSMS', v)} />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.notifications.inAppNotifications')}</p>
                  <p className="text-sm text-gray-600">{t('settings.notifications.inAppDesc')}</p>
                </div>
                <Switch checked={settings.notifInApp} onCheckedChange={(v) => updateSetting('notifInApp', v)} />
              </div>
              {/* Email test */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{lang === 'es' ? 'Probar Notificacion Email' : 'Test Email Notification'}</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    id="test-email-input"
                  />
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={async () => {
                      const to = document.getElementById('test-email-input')?.value;
                      if (!to) return;
                      try {
                        const res = await api.testEmail({ to });
                        if (res.ok) toast.success(lang === 'es' ? 'Email enviado' : 'Email sent');
                        else toast.error(res.error || 'Failed');
                      } catch (e) { toast.error(e.message); }
                    }}
                  >
                    {lang === 'es' ? 'Enviar Test' : 'Send Test'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {lang === 'es' ? 'Requiere SMTP_HOST, SMTP_USER, SMTP_PASS en variables de entorno del servidor' : 'Requires SMTP_HOST, SMTP_USER, SMTP_PASS env vars on server'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Users & Permissions */}
        <TabsContent value="users" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {t('settings.users.title')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t('settings.users.subtitle')}</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/team')}>
              {t('settings.users.manageUsers')}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              {t('settings.users.rolesPermissions')}
            </h3>
            <div className="space-y-3">
              {ROLE_KEYS.map(({ key, label }) => {
                const perms = PERMISSIONS[key] || {};
                const fullCount = Object.values(perms).filter(v => v === 'full').length;
                const readCount = Object.values(perms).filter(v => v === 'read').length;
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="text-emerald-700">{fullCount} full access</span>
                        {readCount > 0 && <span className="text-amber-700"> · {readCount} read-only</span>}
                        <span className="text-gray-500"> · {MODULES.length - fullCount - readCount} restricted</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRole({ key, label })}>
                      {t('settings.users.configure')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>

          {selectedRole && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedRole(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {selectedRole.label}
                      </h3>
                      <p className="text-emerald-50 text-xs mt-1">Permission matrix across platform modules</p>
                    </div>
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                    >×</button>
                  </div>
                </div>
                <div className="overflow-y-auto p-5">
                  <div className="space-y-2">
                    {MODULES.map(({ key, label }) => {
                      const level = (PERMISSIONS[selectedRole.key] || {})[key] || 'none';
                      const styles = {
                        full: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600', icon: '✓', tag: 'Full access' },
                        read: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-500',   icon: '◐', tag: 'Read only' },
                        none: { bg: 'bg-gray-50',    border: 'border-gray-200',    text: 'text-gray-500',    badge: 'bg-gray-400',    icon: '×', tag: 'Restricted' },
                      }[level];
                      return (
                        <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
                          <span className={`font-medium ${styles.text}`}>{label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${styles.text}`}>{styles.tag}</span>
                            <span className={`${styles.badge} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold`}>
                              {styles.icon}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Permissions are enforced at the API level. To modify role assignments, use <strong>Manage Users</strong> in the Team section.</span>
                  </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>Close</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSelectedRole(null); navigate('/team'); }}>
                    Manage Users
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Data & Integration */}
        <TabsContent value="data" className="space-y-6">
          {/* Database Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Database Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Hierarchy Nodes', value: dbStats?.hierarchy_nodes ?? dbStats?.total_nodes, color: 'emerald' },
                { label: 'Work Requests', value: dbStats?.work_requests, color: 'blue' },
                { label: 'Work Orders', value: dbStats?.managed_work_orders, color: 'purple' },
                { label: 'Users', value: dbStats?.users, color: 'amber' },
              ].map((s) => (
                <div key={s.label} className={`p-4 rounded-lg bg-${s.color}-50 border border-${s.color}-200`}>
                  <div className={`text-2xl font-bold text-${s.color}-700`}>
                    {typeof s.value === 'number' ? s.value.toLocaleString() : '—'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {dbStats?._health && (
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dbStats._health.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  Database: <strong className="text-gray-800">{dbStats._health.database}</strong>
                </span>
                <span>·</span>
                <span>Build <strong className="text-gray-800">{dbStats._health.build}</strong></span>
                <span>·</span>
                <span>Uptime <strong className="text-gray-800">{Math.floor((dbStats._health.uptime_seconds || 0) / 3600)}h</strong></span>
                <span>·</span>
                <span>AI: <strong className={dbStats._health.ai_available ? 'text-emerald-700' : 'text-gray-500'}>{dbStats._health.ai_available ? 'Available' : 'Offline'}</strong></span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              {t('settings.data.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.data.retentionPeriod')}</p>
                  <p className="text-sm text-gray-600">{t('settings.data.retentionDesc')}</p>
                </div>
                <Select value={settings.dataRetention || '5years'} onValueChange={(v) => updateSetting('dataRetention', v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">{t('settings.data.year1')}</SelectItem>
                    <SelectItem value="3years">{t('settings.data.years3')}</SelectItem>
                    <SelectItem value="5years">{t('settings.data.years5')}</SelectItem>
                    <SelectItem value="10years">{t('settings.data.years10')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.data.autoBackups')}</p>
                  <p className="text-sm text-gray-600">{t('settings.data.autoBackupsDesc')}</p>
                </div>
                <Switch checked={settings.autoBackups !== false} onCheckedChange={(v) => updateSetting('autoBackups', v)} />
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-emerald-800">{t('settings.data.exportAll')}</p>
                    {lastExport && (
                      <p className="text-xs text-emerald-600 mt-0.5">Last export: {new Date(lastExport).toLocaleString()}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" disabled={exporting} onClick={async () => {
                    try {
                      setExporting(true);
                      const data = await api.exportAllData();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ams-backup-${plantId || 'all'}-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      const ts = new Date().toISOString();
                      localStorage.setItem('last_export_ts', ts);
                      setLastExport(ts);
                    } catch (err) { alert('Export failed: ' + (err.message || 'Unknown error')); }
                    finally { setExporting(false); }
                  }}>{exporting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Exporting...</> : <><Download className="w-4 h-4 mr-1" />{t('common.export')}</>}</Button>
                </div>
                <p className="text-sm text-emerald-700">{t('settings.data.exportAllDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Import Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">Upload Excel or CSV files to import equipment hierarchy, failure history, or maintenance plans into the database.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Import Source</Label>
                  <Select value={importSource} onValueChange={setImportSource}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUIPMENT_HIERARCHY">Equipment Hierarchy</SelectItem>
                      <SelectItem value="FAILURE_HISTORY">Failure History</SelectItem>
                      <SelectItem value="MAINTENANCE_PLAN">Maintenance Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File (.xlsx or .csv)</Label>
                  <Input type="file" accept=".xlsx,.csv" className="mt-1" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!importFile || importing}
                  onClick={async () => {
                    try {
                      setImporting(true);
                      setImportError(null);
                      setImportResult(null);
                      const result = await api.importUpload(importFile, importSource, plantId || settings.defaultPlant || 'PLANT-01');
                      setImportResult(result);
                    } catch (err) {
                      setImportError(err.message || 'Import failed');
                    } finally {
                      setImporting(false);
                    }
                  }}
                >
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Importing...</> : <><Upload className="w-4 h-4 mr-2" />Import</>}
                </Button>
                {importFile && <span className="text-sm text-gray-500 flex items-center gap-1"><FileText className="w-4 h-4" />{importFile.name}</span>}
              </div>
              {importResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1"><CheckCircle2 className="w-4 h-4" />Import Successful</div>
                  <p className="text-emerald-600">
                    {importResult.rows_imported != null ? `${importResult.rows_imported} rows imported` : 'Data imported successfully'}
                    {importResult.errors_count > 0 && ` (${importResult.errors_count} warnings)`}
                  </p>
                </div>
              )}
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-4 h-4" />{importError}</div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('settings.data.integrations')}</h3>
            <div className="space-y-3">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${integration.color === 'green' ? 'bg-emerald-500 animate-pulse' : integration.color === 'yellow' ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className={`text-sm ${integration.color === 'green' ? 'text-emerald-600' : integration.color === 'yellow' ? 'text-amber-600' : 'text-gray-500'}`}>
                        {t(`settings.data.${integration.statusKey}`)} · Last sync: {integration.lastSync}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIntegration(integration)}>
                    {t('settings.users.configure')}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {selectedIntegration && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedIntegration(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`${selectedIntegration.color === 'green' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : selectedIntegration.color === 'yellow' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-slate-500 to-gray-600'} text-white p-5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        {selectedIntegration.name}
                      </h3>
                      <p className="text-white/90 text-xs mt-1">
                        {t(`settings.data.${selectedIntegration.statusKey}`)} · Last sync: {selectedIntegration.lastSync}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedIntegration(null)}
                      className="text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                    >×</button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedIntegration.desc}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">API Endpoints</p>
                    <div className="space-y-1">
                      {selectedIntegration.endpoints.map((ep) => (
                        <div key={ep} className="text-xs font-mono bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                          {ep}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>To modify connection credentials, contact your system administrator or check the deployment environment variables.</span>
                  </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedIntegration(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              {t('settings.appearance.title')}
            </h3>
            <div className="space-y-6">
              {/* Language Selector */}
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('header.language')}
                </Label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Espanol (ES)</SelectItem>
                    <SelectItem value="en">English (EN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('settings.appearance.theme')}</Label>
                <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerald">{t('settings.appearance.themeDefault')}</SelectItem>
                    <SelectItem value="blue">{t('settings.appearance.themeBlue')}</SelectItem>
                    <SelectItem value="purple">{t('settings.appearance.themePurple')}</SelectItem>
                    <SelectItem value="gray">{t('settings.appearance.themeGray')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t('settings.appearance.compactView')}</p>
                  <p className="text-sm text-gray-600">{t('settings.appearance.compactViewDesc')}</p>
                </div>
                <Switch checked={settings.compactView} onCheckedChange={(v) => updateSetting('compactView', v)} />
              </div>

              <div>
                <Label>{t('settings.appearance.dashboardLayout')}</Label>
                <Select value={settings.dashboardLayout} onValueChange={(v) => updateSetting('dashboardLayout', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{t('settings.appearance.layoutStandard')}</SelectItem>
                    <SelectItem value="compact">{t('settings.appearance.layoutCompact')}</SelectItem>
                    <SelectItem value="detailed">{t('settings.appearance.layoutDetailed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleResetDefaults}>{t('settings.resetDefaults')}</Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveAll}>
          {t('settings.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
