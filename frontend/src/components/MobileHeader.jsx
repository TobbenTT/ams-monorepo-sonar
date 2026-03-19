import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ROLES = [
    { key: 'maintainer', label: 'Mantenedor' },
    { key: 'supervisor', label: 'Supervisor' },
];

export default function MobileHeader({ mobileRole, onRoleChange }) {
    const { user } = useAuth();
    const { t } = useLanguage();

    const roleLabel = mobileRole === 'maintainer' ? 'Mantenedor Senior' : 'Supervisor de Turno';
    const avatar = user ? localStorage.getItem(`avatar_${user.user_id}`) : null;
    const initial = (user?.full_name || user?.username || 'U')[0].toUpperCase();

    return (
        <header className="bg-white border-b sticky top-0 z-50" style={{ borderColor: '#E2E8F0' }}>
            <div className="max-w-md mx-auto px-4 py-3">
                {/* User info */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {avatar ? (
                            <img src={avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#047857' }}>
                                <span className="text-white font-bold text-xl">{initial}</span>
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-sm" style={{ color: '#0F172A' }}>
                                {user?.full_name || user?.username || 'Usuario'}
                            </div>
                            <div className="text-xs" style={{ color: '#64748B' }}>
                                {roleLabel}
                            </div>
                        </div>
                    </div>
                    <button className="p-2">
                        <User className="w-5 h-5" style={{ color: '#64748B' }} />
                    </button>
                </div>

                {/* Role switcher */}
                <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: '#F1F5F9' }}>
                    {ROLES.map((role) => (
                        <button
                            key={role.key}
                            onClick={() => onRoleChange(role.key)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                backgroundColor: mobileRole === role.key ? '#FFFFFF' : 'transparent',
                                color: mobileRole === role.key ? '#047857' : '#64748B',
                                boxShadow: mobileRole === role.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            {role.label}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
