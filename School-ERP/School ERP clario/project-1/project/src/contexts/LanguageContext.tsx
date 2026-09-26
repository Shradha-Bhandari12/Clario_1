import { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../lib/translations';
import { getTranslation, LANGUAGE_OPTIONS } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  languageOptions: typeof LANGUAGE_OPTIONS;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage or default to 'en'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedLanguage') as Language) || 'en';
    }
    return 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    return getTranslation(key, language, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, languageOptions: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
