import { create } from 'zustand';

export type Language = 'pl' | 'en' | 'de';

const STORAGE_KEY = 'pollar-language';

interface LanguageState {
  language: Language;
}

interface LanguageActions {
  setLanguage: (lang: Language) => void;
  loadFromStorage: () => void;
}

type LanguageStore = LanguageState & LanguageActions;

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['pl', 'en', 'de'].includes(stored)) {
      return stored as Language;
    }
  } catch {
    // localStorage not available
  }
  return 'pl';
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getStoredLanguage(),

  setLanguage: (lang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
    set({ language: lang });
  },

  loadFromStorage: () => {
    const stored = getStoredLanguage();
    set({ language: stored });
  },
}));

// Convenience hooks
export function useLanguage(): Language {
  return useLanguageStore((state) => state.language);
}

export function useSetLanguage(): (lang: Language) => void {
  return useLanguageStore((state) => state.setLanguage);
}
