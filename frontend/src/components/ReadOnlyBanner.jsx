import { Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ReadOnlyBanner() {
    const { t } = useLanguage();
    return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                {t('permissions.readOnly') || 'Vista de solo lectura — No tienes permisos de edición en este módulo'}
            </span>
        </div>
    );
}
