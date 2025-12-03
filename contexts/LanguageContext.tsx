import React, { createContext, useContext, useState } from 'react';
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
  const [lang, setLang] = useState<Language>('cs-CZ');

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
