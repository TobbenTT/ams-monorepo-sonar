import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { useToast } from '../components/Toast';
import { User, Mail, Shield, Calendar, Building2, Save, Lock, Eye, EyeOff, CheckCircle2, Camera, X } from 'lucide-react';

const ROLE_KEYS = {
    admin: 'auth.roles.admin',
    manager: 'auth.roles.manager',
    planner: 'auth.roles.planner',
    tecnico: 'auth.roles.tecnico',
};

const ROLE_COLORS = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    planner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    tecnico: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function Profile() {
    const { user, setUserData } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar_${user?.user_id}`) || '');
    const fileRef = useRef(null);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await api.authUpdateProfile({ full_name: fullName, email });
            setUserData(updated);
            toast.success(t('profile.profileUpdated'));
        } catch (err) {
            toast.error('Error: ' + (err.message || t('profile.updateFailed')));
        }
        setSaving(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error(t('profile.passwordMismatch'));
            return;
        }
        if (newPassword.length < 12) {
            toast.error(t('profile.passwordTooShort') || 'Password must be at least 12 characters');
            return;
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
            toast.error('Password must include uppercase, lowercase, number, and symbol');
            return;
        }
        setChangingPw(true);
        try {
            await api.authChangePassword({ current_password: currentPassword, new_password: newPassword });
            toast.success(t('profile.passwordUpdated'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error('Error: ' + (err.message || t('profile.wrongPassword')));
        }
        setChangingPw(false);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error(t('profile.imageTooLarge'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setAvatar(dataUrl);
            localStorage.setItem(`avatar_${user.user_id}`, dataUrl);
            toast.success(t('profile.avatarUpdated'));
        };
        reader.readAsDataURL(file);
    };

    const removeAvatar = () => {
        setAvatar('');
        localStorage.removeItem(`avatar_${user.user_id}`);
        toast.success(t('profile.avatarRemoved'));
    };

    if (!user) return null;

    const initials = (user.full_name || user.username || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">{t('profile.title')}</h1>

            {/* Profile Header Card */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                        ) : (
                            <div className="w-20 h-20 bg-[#1B5E20] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {initials}
                            </div>
                        )}
                        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="absolute inset-0 w-20 h-20 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            title={t('profile.changePhoto')}
                        >
                            <Camera size={24} className="text-white" />
                        </button>
                        {avatar && (
                            <button
                                onClick={removeAvatar}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                title={t('profile.removePhoto')}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground">{user.full_name || user.username}</h2>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || 'bg-muted text-muted-foreground'}`}>
                                {ROLE_KEYS[user.role] ? t(ROLE_KEYS[user.role]) : user.role}
                            </span>
                            {user.is_active && (
                                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle2 size={12} /> {t('common.active')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail size={15} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{t('profile.email')}:</span>
                        <span className="font-medium text-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 size={15} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{t('common.plant')}:</span>
                        <span className="font-medium text-foreground">{user.plant_id || t('profile.unassigned')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={15} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{t('profile.memberSince')}:</span>
                        <span className="font-medium text-foreground">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Edit Profile Form */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <User size={18} className="text-[#1B5E20]" />
                        <h3 className="text-lg font-semibold text-foreground">{t('profile.editProfile')}</h3>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('profile.fullName')}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('profile.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('profile.username')}</label>
                            <input
                                type="text"
                                value={user.username}
                                disabled
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t('profile.usernameReadonly')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('profile.role')}</label>
                            <input
                                type="text"
                                value={ROLE_KEYS[user.role] ? t(ROLE_KEYS[user.role]) : user.role}
                                disabled
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t('profile.roleReadonly')}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60"
                        >
                            <Save size={16} />
                            {saving ? t('common.loading') : t('profile.saveChanges')}
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Lock size={18} className="text-[#1B5E20]" />
                        <h3 className="text-lg font-semibold text-foreground">{t('auth.changePassword')}</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.currentPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors pr-10"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5" tabIndex={-1}>
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.newPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Minimo 8 caracteres"
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors pr-10"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5" tabIndex={-1}>
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.confirmPassword')}</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Repite la nueva contrasena"
                                required
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors"
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">{t('profile.passwordMismatch')}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={changingPw || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-60"
                        >
                            <Shield size={16} />
                            {changingPw ? t('common.loading') : t('auth.changePassword')}
                        </button>
                    </form>

                    <div className="mt-5 p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">
                            {t('profile.securityNote')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
