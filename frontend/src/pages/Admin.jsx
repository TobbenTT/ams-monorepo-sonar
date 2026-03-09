import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/Shared';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { Settings, Database, Users, Activity, Shield, Pencil, UserCheck, UserX, Save, X, UserPlus, Eye, EyeOff } from 'lucide-react';

const ROLE_COLORS = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    planner: 'bg-amber-100 text-amber-800 border-amber-200',
    tecnico: 'bg-green-100 text-green-800 border-green-200',
};

export default function Admin() {
    const toast = useToast();
    const confirm = useConfirm();
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [tab, setTab] = useState('users');
    const [health, setHealth] = useState(null);
    const [plantName, setPlantName] = useState('Jorf Lasfar — Complexe Chimique');
    const [plantLocation, setPlantLocation] = useState('El Jadida, Morocco');

    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editRole, setEditRole] = useState('');

    // Create user state
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', email: '', password: '', role: 'tecnico', plant_id: 'OCP-JFC1' });
    const [creating, setCreating] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // AI config state
    const [confidence, setConfidence] = useState(70);

    const ROLE_LABELS = {
        admin: t('auth.roles.admin'),
        manager: t('auth.roles.manager'),
        planner: t('auth.roles.planner'),
        tecnico: t('auth.roles.tecnico'),
    };

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.getStats(),
            api.getAuditLog({ limit: 20 }),
            api.healthCheck(),
        ]).then(([s, a, h]) => {
            setStats(s.status === 'fulfilled' ? s.value : null);
            setAuditLog(a.status === 'fulfilled' ? (Array.isArray(a.value) ? a.value : a.value?.entries || []) : []);
            setHealth(h.status === 'fulfilled' ? h.value : null);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (tab === 'users') loadUsers();
    }, [tab]);

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await api.authListUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error(t('admin.errorLoadingUsers') + ': ' + e.message);
        }
        setUsersLoading(false);
    };

    const handleSeed = async () => {
        const ok = await confirm(t('admin.seedConfirmTitle'), t('admin.seedConfirmMessage'));
        if (!ok) return;
        setSeeding(true);
        try {
            await api.seedDatabase();
            const s = await api.getStats();
            setStats(s);
            toast.success(t('admin.seedSuccess'));
        } catch (e) {
            toast.error(t('admin.seedFailed') + ': ' + e.message);
        }
        setSeeding(false);
    };

    const handleSavePlant = () => {
        toast.success(t('admin.plantConfigSaved'));
    };

    const handleExport = async () => {
        try {
            await api.exportData({ export_type: 'equipment', format: 'EXCEL' });
            toast.success(t('admin.exportStarted'));
        } catch (e) {
            toast.error(t('admin.exportFailed') + ': ' + e.message);
        }
    };

    const handleRoleChange = async (userId) => {
        try {
            await api.authUpdateRole(userId, { role: editRole });
            toast.success(t('admin.roleUpdated'));
            setEditingUser(null);
            loadUsers();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const handleToggleActive = async (userId, isActive) => {
        const actionTitle = isActive ? t('admin.deactivateUser') : t('admin.activateUser');
        const actionMessage = isActive ? t('admin.confirmDeactivate') : t('admin.confirmActivate');
        const ok = await confirm(actionTitle, actionMessage);
        if (!ok) return;
        try {
            if (isActive) {
                await api.authDeactivate(userId);
            } else {
                await api.authActivate(userId);
            }
            toast.success(isActive ? t('admin.userDeactivated') : t('admin.userActivated'));
            loadUsers();
        } catch (e) {
            toast.error('Error: ' + e.message);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.username || !newUser.password || !newUser.email) {
            toast.error(t('admin.fillRequiredFields'));
            return;
        }
        setCreating(true);
        try {
            await api.authRegister(newUser);
            toast.success(t('admin.userCreated'));
            setShowCreate(false);
            setNewUser({ username: '', full_name: '', email: '', password: '', role: 'tecnico', plant_id: 'OCP-JFC1' });
            loadUsers();
        } catch (e) {
            toast.error(t('admin.createFailed') + ': ' + e.message);
        }
        setCreating(false);
    };

    const TABS = [
        { key: 'users', icon: Users, label: t('admin.tabUsers') },
        { key: 'plant', icon: Settings, label: t('admin.tabPlant') },
        { key: 'data', icon: Database, label: t('admin.tabData') },
        { key: 'ai', icon: Shield, label: t('admin.tabAIConfig') },
        { key: 'audit', icon: Activity, label: t('admin.tabAuditLog') },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mb-5">{t('admin.title')}</h1>

            {/* Tab Bar */}
            <div className="flex gap-1 mb-5 bg-muted p-1 rounded-lg overflow-x-auto">
                {TABS.map(tb => (
                    <button
                        key={tb.key}
                        onClick={() => setTab(tb.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            tab === tb.key
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                        }`}
                    >
                        <tb.icon size={16} />
                        {tb.label}
                    </button>
                ))}
            </div>

            <div>
                {loading && tab !== 'users' ? <LoadingSpinner /> : (
                    <>
                        {/* Users Tab */}
                        {tab === 'users' && (
                            <div className="bg-card border border-border rounded-lg shadow-sm">
                                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                                    <div>
                                        <div className="text-base font-semibold text-foreground">{t('admin.userManagement')}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{t('admin.registeredUsers', { count: users.length })}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowCreate(!showCreate)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                        >
                                            <UserPlus size={14} />
                                            {t('admin.createUser')}
                                        </button>
                                        <button
                                            onClick={loadUsers}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                        >
                                            {t('admin.refresh')}
                                        </button>
                                    </div>
                                </div>

                                {/* Create User Form */}
                                {showCreate && (
                                    <div className="px-5 py-4 border-b border-border bg-muted/30">
                                        <div className="text-sm font-semibold text-foreground mb-3">{t('admin.newUser')}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('admin.username')} *</label>
                                                <input
                                                    type="text"
                                                    value={newUser.username}
                                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                                    placeholder="john.doe"
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('admin.fullName')}</label>
                                                <input
                                                    type="text"
                                                    value={newUser.full_name}
                                                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('admin.email')} *</label>
                                                <input
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    placeholder="john@ocp.ma"
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('auth.password')} *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newUser.password}
                                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                        placeholder="••••••••"
                                                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-9"
                                                    />
                                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('admin.role')}</label>
                                                <select
                                                    value={newUser.role}
                                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                >
                                                    {Object.keys(ROLE_LABELS).map(r => (
                                                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">{t('admin.plant')}</label>
                                                <input
                                                    type="text"
                                                    value={newUser.plant_id}
                                                    onChange={e => setNewUser({ ...newUser, plant_id: e.target.value })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCreateUser}
                                                disabled={creating}
                                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                                            >
                                                <UserPlus size={14} />
                                                {creating ? t('common.loading') : t('admin.createUser')}
                                            </button>
                                            <button
                                                onClick={() => setShowCreate(false)}
                                                className="px-4 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {usersLoading ? (
                                    <div className="p-10"><LoadingSpinner /></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.user')}</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.email')}</th>
                                                    <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.role')}</th>
                                                    <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.status')}</th>
                                                    <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.plant')}</th>
                                                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                    u.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                    {(u.full_name || u.username || '?')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-sm text-foreground">{u.full_name || u.username}</div>
                                                                    <div className="text-xs text-muted-foreground font-mono">@{u.username}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                                                        <td className="px-5 py-3 text-center">
                                                            {editingUser === u.user_id ? (
                                                                <div className="flex items-center gap-1 justify-center">
                                                                    <select
                                                                        value={editRole}
                                                                        onChange={e => setEditRole(e.target.value)}
                                                                        className="text-xs px-2 py-1 border border-border rounded bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    >
                                                                        {Object.keys(ROLE_LABELS).map(r => (
                                                                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                                                        ))}
                                                                    </select>
                                                                    <button onClick={() => handleRoleChange(u.user_id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title={t('admin.save')}>
                                                                        <Save size={14} />
                                                                    </button>
                                                                    <button onClick={() => setEditingUser(null)} className="p-1 text-muted-foreground hover:bg-muted rounded" title={t('admin.cancel')}>
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role] || 'bg-muted text-muted-foreground border-border'}`}>
                                                                    {ROLE_LABELS[u.role] || u.role}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                                u.is_active
                                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                {u.is_active ? t('admin.active') : t('admin.inactive')}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-xs text-muted-foreground font-mono">
                                                            {u.plant_id || 'Global'}
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex items-center gap-1 justify-end">
                                                                {currentUser?.role === 'admin' && u.user_id !== currentUser?.user_id && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => { setEditingUser(u.user_id); setEditRole(u.role); }}
                                                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                                                            title={t('admin.editRole')}
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleToggleActive(u.user_id, u.is_active)}
                                                                            className={`p-1.5 rounded-md transition-colors ${
                                                                                u.is_active
                                                                                    ? 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
                                                                                    : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
                                                                            }`}
                                                                            title={u.is_active ? t('admin.deactivate') : t('admin.activate')}
                                                                        >
                                                                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plant Config Tab */}
                        {tab === 'plant' && (
                            <div className="space-y-5">
                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                    <div className="text-sm font-semibold text-foreground mb-4">{t('admin.plantDetails')}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('admin.plantId')}</label>
                                            <input className="w-full px-3 py-2.5 border border-border rounded-lg bg-muted text-foreground text-sm font-mono" value="OCP-JFC1" readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('admin.plantName')}</label>
                                            <input className="w-full px-3 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={plantName} onChange={e => setPlantName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('admin.location')}</label>
                                            <input className="w-full px-3 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={plantLocation} onChange={e => setPlantLocation(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('admin.timezone')}</label>
                                            <select className="w-full px-3 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                                <option>Africa/Casablanca (UTC+1)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleSavePlant}>
                                        {t('admin.saveChanges')}
                                    </button>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                    <div className="text-sm font-semibold text-foreground mb-4">{t('admin.systemStatus')}</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'FastAPI', status: !!health, detail: health ? 'Online' : 'Offline', color: health ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50' },
                                            { label: t('admin.database'), status: !!stats, detail: `${stats?.total_nodes || 0} ${t('admin.nodes')}`, color: stats ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50' },
                                            { label: 'SAP Mock', status: null, detail: t('admin.mockMode'), color: 'border-amber-200 bg-amber-50' },
                                            { label: 'AI Engine', status: true, detail: 'Claude Sonnet 4', color: 'border-green-200 bg-green-50' },
                                        ].map((s, i) => (
                                            <div key={i} className={`p-4 rounded-lg border ${s.color} text-center`}>
                                                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${s.status === true ? 'bg-green-500' : s.status === false ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                <div className="font-semibold text-sm">{s.label}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Management Tab */}
                        {tab === 'data' && (
                            <div className="space-y-5">
                                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                    <div className="text-sm font-semibold text-foreground mb-4">{t('admin.dataManagement')}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 border border-border rounded-lg text-center">
                                            <Database className="w-8 h-8 text-primary mx-auto mb-3" />
                                            <h3 className="text-sm font-semibold mb-1">{t('admin.seedDatabase')}</h3>
                                            <p className="text-xs text-muted-foreground mb-4">{t('admin.populateWithSynthetic')}</p>
                                            <button
                                                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                onClick={handleSeed}
                                                disabled={seeding}
                                            >
                                                {seeding ? t('admin.seeding') : t('admin.runSeed')}
                                            </button>
                                            {stats && <div className="mt-2 text-xs text-muted-foreground">{t('admin.currentNodes', { count: stats.total_nodes || 0 })}</div>}
                                        </div>
                                        <div className="p-5 border border-border rounded-lg text-center">
                                            <Activity className="w-8 h-8 text-primary mx-auto mb-3" />
                                            <h3 className="text-sm font-semibold mb-1">{t('admin.exportData')}</h3>
                                            <p className="text-xs text-muted-foreground mb-4">{t('admin.downloadCompleteData')}</p>
                                            <button
                                                className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                                                onClick={handleExport}
                                            >
                                                {t('admin.exportExcel')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {stats && (
                                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                        <div className="text-sm font-semibold text-foreground mb-4">{t('admin.dbStats')}</div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {Object.entries(stats).filter(([k]) => k !== 'timestamp').map(([k, v]) => (
                                                <div key={k} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                                    <span className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                                                    <strong className="text-sm">{typeof v === 'number' ? v.toLocaleString() : String(v)}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Config Tab */}
                        {tab === 'ai' && (
                            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                                <div className="text-sm font-semibold text-foreground mb-5">{t('admin.aiConfig')}</div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-2">{t('admin.confidenceThreshold')}</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={confidence}
                                                    onChange={e => setConfidence(Number(e.target.value))}
                                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#1B5E20]"
                                                    style={{
                                                        background: `linear-gradient(to right, #1B5E20 0%, #1B5E20 ${confidence}%, #e5e7eb ${confidence}%, #e5e7eb 100%)`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-lg min-w-[52px] text-center">{confidence}%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5">{t('admin.confidenceDescription')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-2">{t('admin.aiModel')}</label>
                                        <select className="w-full max-w-sm px-3 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                            <option>Claude Sonnet 4</option>
                                            <option>Claude Haiku 4.5</option>
                                            <option>Claude Opus 4.6</option>
                                        </select>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-sm text-amber-800 dark:text-amber-200">{t('admin.safetyFirstMode')}</div>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{t('admin.safetyFirstDescription')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Audit Log Tab */}
                        {tab === 'audit' && (
                            <div className="bg-card border border-border rounded-lg shadow-sm">
                                <div className="px-5 py-4 border-b border-border">
                                    <div className="text-sm font-semibold text-foreground">{t('admin.auditLog')}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{t('admin.lastActions', { count: auditLog.length })}</div>
                                </div>
                                {auditLog.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.date')}</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.user')}</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.action')}</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.entity')}</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.details')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLog.slice(0, 20).map((a, i) => (
                                                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                        <td className="px-5 py-2.5 text-xs text-muted-foreground font-mono">{(a.timestamp || a.created_at || '').replace('T', ' ').substring(0, 19)}</td>
                                                        <td className="px-5 py-2.5 text-sm">{a.user_id || a.user || 'system'}</td>
                                                        <td className="px-5 py-2.5">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                                                {a.action || a.event_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{a.entity_type || '—'}</td>
                                                        <td className="px-5 py-2.5 text-xs max-w-[200px] overflow-hidden text-ellipsis text-muted-foreground">{a.details || a.description || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : <div className="p-8 text-center text-muted-foreground text-sm">{t('admin.noAuditEntries')}</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
