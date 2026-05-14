import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en';
import es from '../i18n/es';
import ar from '../i18n/ar';

const translations = { en, es, ar };

const LANG_KEY = 'ocp_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

    const setLang = useCallback((code) => {
        setLangState(code);
        localStorage.setItem(LANG_KEY, code);
        document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = code;
    }, []);

    const t = useCallback((key, params) => {
        const keys = key.split('.');
        let val = translations[lang];
        for (const k of keys) {
            val = val?.[k];
        }
        if (val === undefined) {
            // Fallback to English
            val = translations.en;
            for (const k of keys) {
                val = val?.[k];
            }
        }
        if (val === undefined) return key;
        if (params && typeof val === 'string') {
            return val.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
        }
        return val;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
