import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

// Shares the selected language ('en' | 'si') across the whole app,
// and provides a t(key) helper to fetch the translated string for that language.
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  // Remember the user's language choice across visits
  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'si') {
      setLanguage(stored);
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === 'en' ? 'si' : 'en';
    setLanguage(next);
    localStorage.setItem('language', next);
  };

  // t('someKey') -> returns the string in the current language
  // Falls back to the key itself if the translation is missing (helps catch typos during development)
  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage() must be used inside a <LanguageProvider>');
  }
  return context;
}
