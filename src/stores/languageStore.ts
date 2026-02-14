import { create } from 'zustand';
import { trackLanguageChanged } from '@/lib/analytics';

export type Language = 'pl' | 'en' | 'de';

const STORAGE_KEY = 'pollar-language';
const SUPPORTED_LANGUAGES: Language[] = ['pl', 'en', 'de'];

interface LanguageState {
  language: Language;
  wasAutoDetected: boolean;
  geoDetectionPending: boolean;
}

interface LanguageActions {
  setLanguage: (lang: Language) => void;
  loadFromStorage: () => void;
  initFromUrl: () => void;
  /** Sync from Firestore profile after login */
  syncFromProfile: (lang: Language | undefined) => void;
}

type LanguageStore = LanguageState & LanguageActions;

function detectBrowserLanguage(): Language {
  try {
    const detected = navigator.languages
      ?.map(l => l.split('-')[0])
      .find(l => SUPPORTED_LANGUAGES.includes(l as Language));
    if (detected) return detected as Language;
  } catch {}
  return 'en';
}

function browserHasSupportedLanguage(): boolean {
  try {
    return navigator.languages?.some(l =>
      SUPPORTED_LANGUAGES.includes(l.split('-')[0] as Language)
    ) ?? false;
  } catch {
    return false;
  }
}

// Evaluated once at module load — truly first visit only if no language AND no cookie consent
// Returning users have cookie-consent but may lack pollar-language (Polish was the old default)
const _isFirstVisit = (() => {
  try {
    return !localStorage.getItem(STORAGE_KEY) && !localStorage.getItem('cookie-consent');
  } catch {
    return true;
  }
})();

// Phase 2 needed when first visit AND browser has no supported language
const _needsGeoDetection = _isFirstVisit && !browserHasSupportedLanguage();

// Cloudflare country → language mapping
const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  PL: 'pl',
  DE: 'de',
  AT: 'de',
  CH: 'de',
};

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch {
    // localStorage not available
  }
  // Auto-detect only for truly new users; returning users get Polish (the original default)
  return _isFirstVisit ? detectBrowserLanguage() : 'pl';
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getStoredLanguage(),
  wasAutoDetected: _isFirstVisit,
  geoDetectionPending: _needsGeoDetection,

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
    set({ language: lang, wasAutoDetected: false });
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
      set({ language: lang, wasAutoDetected: false });
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // localStorage not available
      }
    }
  },

  syncFromProfile: (lang: Language | undefined) => {
    if (!lang || !SUPPORTED_LANGUAGES.includes(lang)) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
    set({ language: lang, wasAutoDetected: false });
  },
}));

// Convenience hooks
export function useLanguage(): Language {
  return useLanguageStore((state) => state.language);
}

export function useSetLanguage(): (lang: Language) => void {
  return useLanguageStore((state) => state.setLanguage);
}

export function useWasAutoDetected(): boolean {
  return useLanguageStore((state) => state.wasAutoDetected);
}

export function useGeoDetectionPending(): boolean {
  return useLanguageStore((state) => state.geoDetectionPending);
}

// Phase 2: Cloudflare geolocation fallback (fires only when browser has no supported language)
if (_needsGeoDetection) {
  (async () => {
    try {
      const res = await fetch('/cdn-cgi/trace');
      const text = await res.text();
      const match = text.match(/loc=(\w+)/);
      const country = match?.[1];
      const geoLang = country ? COUNTRY_TO_LANGUAGE[country] ?? null : null;
      useLanguageStore.setState({
        language: geoLang || 'en',
        geoDetectionPending: false,
      });
    } catch {
      // Fetch failed (localhost, no Cloudflare, etc.) — keep 'en' fallback
      useLanguageStore.setState({ geoDetectionPending: false });
    }
  })();
}
