import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Translation } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'cs-CZ',
  setLang: () => {},
  t: TRANSLATIONS['cs-CZ']
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detectInitialLanguage = (): Language => {
    if (typeof window === 'undefined') {
      return 'cs-CZ';
    }

    try {
      const stored = window.localStorage.getItem('iconic_lang') as Language | null;
      if (stored && (stored === 'cs-CZ' || stored === 'en-US' || stored === 'es-MX')) {
        return stored;
      }

      const browserLang = window.navigator.language || (window.navigator.languages && window.navigator.languages[0]);
      if (browserLang) {
        const normalized = browserLang.toLowerCase();
        if (normalized.startsWith('cs')) return 'cs-CZ';
        if (normalized.startsWith('en')) return 'en-US';
        if (normalized.startsWith('es')) return 'es-MX';
      }
    } catch {
      // Fallback to default below
    }

    return 'cs-CZ';
  };

  const [lang, setLangState] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('iconic_lang', lang);
      }
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  const contextValue = {
    lang,
    setLang,
    t: TRANSLATIONS[lang]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
