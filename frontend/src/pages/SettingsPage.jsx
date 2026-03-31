import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Settings as SettingsIcon, Bell, Shield, Database, Users, Palette, Loader2, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import * as api from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const SETTINGS_KEY = 'ocp_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  // Persisted general settings
  const [settings, setSettings] = useState(() => ({
    companyName: 'OCP Manufacturing',
    timezone: 'gmt+1',
    defaultPlant: 'OCP-JFC1',
    currency: 'mad',
    autoSaveWO: true,
    enableAI: true,
    availabilityTarget: 95,
    mtbfTarget: 300,
    mttrTarget: 3.5,
    laborRate: 35,
    plannedWorkTarget: 80,
    // Notifications
    notifCritical: true,
    notifWODelays: true,
    notifKPI: true,
    notifImprovement: true,
    notifWeekly: false,
    notifEmail: true,
    notifSMS: false,
    notifInApp: true,
    // Appearance
    theme: 'emerald',
    compactView: false,
    dashboardLayout: 'standard',
    ...loadSettings(),
  }));

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

  // Fetch profile on mount
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
      saveSettings(next);
      return next;
    });
  };

  const handleSaveAll = () => {
    saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem(SETTINGS_KEY);
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

  const ROLES = [
    t('settings.users.roles.administrator'),
    t('settings.users.roles.reliabilityEngineer'),
    t('settings.users.roles.maintenanceManager'),
    t('settings.users.roles.technician'),
    t('settings.users.roles.planner'),
  ];

  const INTEGRATIONS = [
    { name: 'SAP ERP', statusKey: 'connected', color: 'green' },
    { name: 'CMMS Integration', statusKey: 'connected', color: 'green' },
    { name: 'Asset Management', statusKey: 'pending', color: 'yellow' },
    { name: 'IoT Sensors', statusKey: 'notConnected', color: 'gray' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
            {t('settings.title')}
          </h2>
          <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('settings.profile.profileUpdated')}</span>
          </div>
        )}
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
                      <SelectItem value="OCP-JFC1">OCP Jorf Lasfar C1</SelectItem>
                      <SelectItem value="OCP-JFC2">OCP Jorf Lasfar C2</SelectItem>
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
                <Label htmlFor="laborRate">Tasa M.O. Interna (ZMANT001) $/h</Label>
                <Input id="laborRate" type="number" value={settings.laborRate} onChange={(e) => updateSetting('laborRate', Number(e.target.value))} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">Costo fijo por hora de mano de obra interna. Se usa en Control de Costos SAP.</p>
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
              {ROLES.map((role) => (
                <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{role}</span>
                  <Button variant="outline" size="sm">{t('settings.users.configure')}</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Data & Integration */}
        <TabsContent value="data" className="space-y-6">
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
                <Select defaultValue="5years">
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
                <Switch defaultChecked />
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-emerald-800">{t('settings.data.exportAll')}</p>
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const data = await api.healthCheck();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ocp-export-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch { /* ignore */ }
                  }}>{t('common.export')}</Button>
                </div>
                <p className="text-sm text-emerald-700">{t('settings.data.exportAllDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('settings.data.integrations')}</h3>
            <div className="space-y-3">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className={`text-sm ${integration.color === 'green' ? 'text-green-600' : integration.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {t(`settings.data.${integration.statusKey}`)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">{t('settings.users.configure')}</Button>
                </div>
              ))}
            </div>
          </Card>
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
                    <SelectItem value="ar">العربية (AR)</SelectItem>
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
