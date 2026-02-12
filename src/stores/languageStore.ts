import { create } from 'zustand';
import { trackLanguageChanged } from '@/lib/analytics';

export type Language = 'pl' | 'en' | 'de';

const STORAGE_KEY = 'pollar-language';

interface LanguageState {
  language: Language;
}

interface LanguageActions {
  setLanguage: (lang: Language) => void;
  loadFromStorage: () => void;
  initFromUrl: () => void;
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
    const previous = getStoredLanguage();
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
    if (previous !== lang) {
      trackLanguageChanged({ language: lang, previous_language: previous });
    }
    set({ language: lang });
  },

  loadFromStorage: () => {
    const stored = getStoredLanguage();
    set({ language: stored });
  },

  initFromUrl: () => {
    if (typeof window === 'undefined') return;
    const match = window.location.pathname.match(/^\/(en|de)(\/|$)/);
    if (match) {
      const lang = match[1] as Language;
      set({ language: lang });
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // localStorage not available
      }
    }
  },
}));

// Convenience hooks
export function useLanguage(): Language {
  return useLanguageStore((state) => state.language);
}

export function useSetLanguage(): (lang: Language) => void {
  return useLanguageStore((state) => state.setLanguage);
}
