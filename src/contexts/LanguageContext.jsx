import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';

const translations = { en, es };

const LanguageContext = createContext();

// Check if running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron;
};

// Storage key for localStorage
const LANGUAGE_STORAGE_KEY = 'microlog-language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [loading, setLoading] = useState(true);

  // Load language preference on mount
  useEffect(() => {
    async function loadLanguage() {
      let savedLanguage = null;

      if (isElectron()) {
        // Try to get from Electron config
        try {
          savedLanguage = await window.electronAPI.getLanguage?.();
        } catch (e) {
          console.error('Error loading language from Electron:', e);
        }
      }

      // Fallback to localStorage
      if (!savedLanguage) {
        savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      }

      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }

      setLoading(false);
    }

    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang) => {
    if (!translations[lang]) return;

    setLanguageState(lang);

    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    // Save to Electron config if available
    if (isElectron() && window.electronAPI.setLanguage) {
      try {
        await window.electronAPI.setLanguage(lang);
      } catch (e) {
        console.error('Error saving language to Electron:', e);
      }
    }
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  }, [language]);

  // Get locale string for date formatting
  const getLocale = useCallback(() => {
    return language === 'es' ? 'es' : 'en';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocale, loading, availableLanguages: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
